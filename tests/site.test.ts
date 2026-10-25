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

test("gallery photos save through the generic content function", async () => {
  const database = await databasePromise;
  const photos = [
    {
      uid: "photo-one",
      src: "/media/gallery/demo.jpg",
      alt: "Students at a demo day",
      caption: "Demo day",
      width: 1600,
      height: 1067,
      position: 0,
    },
  ];
  const saved = await database.query<{ revision: number }>(
    "select public.save_content_section($1, $2, $3::jsonb) as revision",
    ["gallery", 0, JSON.stringify(photos)],
  );
  assert.equal(Number(saved.rows[0].revision), 1);
  const rows = await database.query<{
    uid: string;
    src: string;
    alt: string;
    width: number;
    height: number;
  }>("select uid, src, alt, width, height from public.gallery_photos");
  assert.deepEqual(rows.rows, [
    {
      uid: "photo-one",
      src: "/media/gallery/demo.jpg",
      alt: "Students at a demo day",
      width: 1600,
      height: 1067,
    },
  ]);
});

test("external listings require an http(s) application URL at the database layer", async () => {
  const database = await databasePromise;
  await database.exec(`
    insert into public.startups (uid, slug, name) values ('listing-test-startup', 'listing-test', 'Listing Test');
  `);
  await assert.rejects(
    database.query(
      "insert into public.listings (uid, startup_slug, role, application_method) values ('bad-external', 'listing-test', 'Designer', 'external')",
    ),
  );
  await assert.rejects(
    database.query(
      "insert into public.listings (uid, startup_slug, role, application_method, application_url) values ('bad-url', 'listing-test', 'Designer', 'external', 'javascript:alert(1)')",
    ),
  );
  await database.query(
    "insert into public.listings (uid, startup_slug, role, application_method, application_url) values ('good-external', 'listing-test', 'Designer', 'external', 'https://example.com/apply')",
  );
  const row = await database.query<{ method: string; url: string }>(
    "select application_method as method, application_url as url from public.listings where uid = 'good-external'",
  );
  assert.deepEqual(row.rows[0], { method: "external", url: "https://example.com/apply" });
});

test("approved blog submissions publish once and keep the reviewer private", async () => {
  const database = await databasePromise;
  await database.exec(`
    insert into public.blog_submissions (id, title, summary, body, author, author_email)
    values ('blog-one', 'A student story', 'A short summary', 'A long enough body for the blog post.', 'Student One', 'student@example.edu');
  `);
  const publish = () =>
    database.query<{ slug: string }>("select public.approve_blog_submission($1, $2, $3, $4, $5) as slug", [
      "blog-one",
      "post-one",
      "a-student-story",
      "2026-10-25",
      "Faculty Reviewer",
    ]);
  const first = await publish();
  const retry = await publish();
  assert.equal(first.rows[0].slug, "a-student-story");
  assert.equal(retry.rows[0].slug, "a-student-story");

  const result = await database.query<{
    status: string;
    reviewer: string;
    post_slug: string;
    count: number;
    revision: number;
  }>(`
    select s.status, s.reviewed_by as reviewer, s.post_slug,
      (select count(*)::int from public.blog_posts where slug = s.post_slug) as count,
      (select revision from public.content_section_revisions where section = 'posts') as revision
    from public.blog_submissions s
    where s.id = 'blog-one'
  `);
  assert.equal(result.rows[0].status, "approved");
  assert.equal(result.rows[0].reviewer, "Faculty Reviewer");
  assert.equal(result.rows[0].post_slug, "a-student-story");
  assert.equal(result.rows[0].count, 1);
  assert.equal(Number(result.rows[0].revision), 1);
});
