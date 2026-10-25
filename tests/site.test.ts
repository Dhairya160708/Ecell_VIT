import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { eventStatus, sortEvents } from "../src/lib/events";
import { isValidEmail } from "../src/lib/form-validation";
import { parseVideo } from "../src/lib/video";
import { slugify, uniqueSlug } from "../src/lib/utils";
import { getPreviewContent } from "../src/server/content-preview";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const databasePromise = (async () => {
  const database = new PGlite();
  await database.exec(`
    create role anon;
    create role authenticated;
    create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key);
  `);
  const migrationDir = path.join(projectRoot, "supabase", "migrations");
  const migrations = (await readdir(migrationDir)).filter((file) => file.endsWith(".sql")).sort();
  for (const migration of migrations) {
    await database.exec(await readFile(path.join(migrationDir, migration), "utf8"));
  }
  return database;
})();

test("event status respects start and end dates", () => {
  const event = { date: "2026-10-20", endDate: "2026-10-22" };
  assert.equal(eventStatus(event, "2026-10-19"), "Upcoming");
  assert.equal(eventStatus(event, "2026-10-21"), "Ongoing");
  assert.equal(eventStatus(event, "2026-10-23"), "Past");
});

test("event sorting prioritizes ongoing, upcoming, then the newest past event", () => {
  const events = [
    { uid: "past-old", date: "2026-10-01", title: "", category: "", summary: "" },
    { uid: "upcoming-late", date: "2026-10-25", title: "", category: "", summary: "" },
    { uid: "ongoing", date: "2026-10-20", title: "", category: "", summary: "" },
    { uid: "past-new", date: "2026-10-10", title: "", category: "", summary: "" },
    { uid: "upcoming-soon", date: "2026-10-21", title: "", category: "", summary: "" },
  ];
  assert.deepEqual(
    sortEvents(events, "2026-10-20").map((event) => event.uid),
    ["ongoing", "upcoming-soon", "upcoming-late", "past-new", "past-old"],
  );
});

test("public form email validation accepts well-formed addresses only", () => {
  assert.equal(isValidEmail("student@example.edu"), true);
  assert.equal(isValidEmail("student@localhost"), false);
  assert.equal(isValidEmail("not an email"), false);
  assert.equal(isValidEmail(""), false);
});

test("admin slug generation handles collisions without overwriting", () => {
  assert.equal(slugify("Green Future!"), "green-future");
  assert.equal(uniqueSlug("Green Future", new Set(["green-future"])), "green-future-2");
  assert.equal(uniqueSlug("Green Future", new Set(["green-future", "green-future-2"])), "green-future-3");
});

test("video links embed supported providers and reject unsafe protocols", () => {
  assert.equal(parseVideo("https://youtu.be/abcdefghijk")?.kind, "embed");
  assert.equal(parseVideo("javascript:alert(1)"), null);
  assert.equal(parseVideo("not a URL"), null);
});

test("preview content is clearly illustrative and supplies public pages", () => {
  const content = getPreviewContent();
  assert.match(content.site.heroTagline, /preview/i);
  assert.ok(content.events.length > 0);
  assert.ok(content.startups.every((startup) => startup.regId === "PREVIEW ONLY"));
});

test("section saves reject stale revisions without overwriting the current content", async () => {
  const database = await databasePromise;
  const payload = [
    {
      uid: "event-one",
      title: "Demo event",
      date: "2026-11-15",
      category: "Workshop",
      summary: "A test event",
      position: 0,
    },
  ];
  const saved = await database.query<{ revision: number }>(
    "select public.save_content_section($1, $2, $3::jsonb) as revision",
    ["events", 0, JSON.stringify(payload)],
  );
  assert.equal(Number(saved.rows[0].revision), 1);

  const stale = await database.query<{ revision: number }>(
    "select public.save_content_section($1, $2, $3::jsonb) as revision",
    ["events", 0, JSON.stringify([])],
  );
  assert.equal(Number(stale.rows[0].revision), -1);

  const current = await database.query<{ uid: string }>("select uid from public.events");
  assert.deepEqual(
    current.rows.map((row) => row.uid),
    ["event-one"],
  );
});

test("idea approval publishes once and changes the startup revision atomically", async () => {
  const database = await databasePromise;
  await database.exec(`
    insert into public.ideas (id, name, pitch, problem, solution, email, team)
    values ('idea-one', 'Demo Idea', 'A sample pitch', 'A sample problem', 'A sample solution', 'founder@example.edu', 'Founder One, Founder Two');
  `);

  const first = await database.query<{ slug: string }>("select public.approve_idea($1, $2, $3, $4) as slug", [
    "idea-one",
    "Faculty Reviewer",
    "startup-one",
    "demo-idea",
  ]);
  const retry = await database.query<{ slug: string }>("select public.approve_idea($1, $2, $3, $4) as slug", [
    "idea-one",
    "Faculty Reviewer",
    "startup-retry",
    "demo-idea",
  ]);
  assert.equal(first.rows[0].slug, "demo-idea");
  assert.equal(retry.rows[0].slug, "demo-idea");

  const results = await database.query<{
    status: string;
    startup_slug: string;
    revision: number;
    count: number;
  }>(`
    select i.status, i.startup_slug, r.revision,
      (select count(*)::int from public.startups where source_idea_uid = i.id) as count
    from public.ideas i
    join public.content_section_revisions r on r.section = 'startups'
    where i.id = 'idea-one'
  `);
  assert.equal(results.rows[0].status, "Approved");
  assert.equal(results.rows[0].startup_slug, "demo-idea");
  assert.equal(Number(results.rows[0].revision), 1);
  assert.equal(results.rows[0].count, 1);
});

test("database-backed rate limits stop after the configured request count", async () => {
  const database = await databasePromise;
  const key = "a".repeat(64);
  const results = [];
  for (let attempt = 0; attempt < 6; attempt++) {
    const { rows } = await database.query<{ allowed: boolean }>(
      "select public.consume_form_rate_limit($1, $2, $3) as allowed",
      [key, 600, 5],
    );
    results.push(rows[0].allowed);
  }
  assert.deepEqual(results, [true, true, true, true, true, false]);
});
