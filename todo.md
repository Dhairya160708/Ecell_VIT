# Website audit TODO

Priorities reflect user impact and data-loss risk. These are review findings and
suggestions. The listed fixes and improvements have been implemented.

## P2 — Reliability and correctness (complete)

- [x] **Require durable photo storage in production.** The local `.data/` fallback
      is appropriate for development, but is not durable on Vercel serverless
      instances. Fail clearly in production if `BLOB_READ_WRITE_TOKEN` is missing
      and document that it is required for production uploads.
      References: [src/server/media-store.ts](src/server/media-store.ts),
      [README.md](README.md).

- [x] **Prevent stale admin saves from deleting newer content.** A section save
      upserts the editor's snapshot and deletes rows omitted from that snapshot. If
      another admin adds content while the editor is open, the stale save can remove
      it. Use version checks or item-level updates so concurrent edits are preserved.
      Reference: [src/server/content.ts](src/server/content.ts).

- [x] **Rate-limit public form submissions.** Contact, idea, and marketplace
      application forms rely on a honeypot but have no server-side submission limit.
      Add abuse controls and useful monitoring without blocking legitimate visitors.
      Reference: [src/server/actions/public.ts](src/server/actions/public.ts).

- [x] **Report application lookup failures accurately.** The marketplace action
      ignores the database query error when looking up a listing, so a transient
      database failure is reported to the visitor as “This role is no longer open.”
      Check and surface the query error separately from a genuinely missing listing.
      Reference: [src/server/actions/public.ts](src/server/actions/public.ts).

- [x] **Make idea approval atomic and retry-safe.** Approval inserts a startup
      before separately updating the idea. If that update fails, the startup remains
      public and a retry can create another one. Perform both writes in one database
      transaction, such as a Supabase RPC.
      Reference: [src/server/actions/admin.ts](src/server/actions/admin.ts).

- [x] **Make event-card destinations useful.** “Explore event” currently sends
      every visitor to the homepage. Add event detail destinations or replace the
      link with a relevant action until detail pages exist.
      References: [src/components/events/EventCard.tsx](src/components/events/EventCard.tsx),
      [src/lib/events.ts](src/lib/events.ts).

- [x] **Make startup-card flipping accessible by keyboard.** The reverse face
      uses a clickable `div`, so keyboard users cannot reliably flip the card back.
      Use semantic controls and ensure hidden faces do not expose inaccessible links.
      Reference: [src/components/startups/StartupCard.tsx](src/components/startups/StartupCard.tsx).

- [x] **Correct the documented Node.js minimum.** The README says Node.js 20+,
      while the installed Next.js version requires Node.js 20.9 or newer. Update the
      setup instructions and consider declaring the minimum in `package.json`.
      References: [README.md](README.md), [package.json](package.json).

## P3 — Improvements (complete)

- [x] **Add continuous integration and automated tests.** There is no CI workflow
      or test suite. Add pull-request checks for lint, typecheck, formatting, and
      production build; add focused tests for public forms, event status, and admin
      workflows.
      References: [.github/dependabot.yml](.github/dependabot.yml), [package.json](package.json).

- [x] **Offer an optional local preview without Supabase.** The setup correctly
      documents Supabase as a prerequisite, but a read-only demo/content fixture
      would let contributors preview the public site before configuring a project.
      Keep database-backed admin and submissions disabled or clearly unavailable in
      preview mode.
      References: [README.md](README.md), [src/server/content.ts](src/server/content.ts).

## Verification

- No P0/P1 findings were identified in the audit.
- Lint, typecheck, formatting checks, and focused unit/database-migration tests pass.
- The production build and local preview smoke test pass. Live Supabase and Vercel services were not exercised.
