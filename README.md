# E-Cell VIT website

The website of the Entrepreneurship Cell of Vidyalankar Institute of Technology ("The Scouts of VIT"). It has:

- a **public site**: events, a startup showcase, a "help wanted" marketplace, an About page and contact/idea-submission forms;
- a **faculty admin panel** at `/admin`: log in, review submitted startup ideas (score, comment, approve or reject), and edit all site content without touching code. Approving an idea publishes it as a startup on the public site.

## Tech stack

| Area      | Choice                                                    |
| --------- | --------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Cache Components) + React 19      |
| Styling   | Tailwind CSS 4, Framer Motion for animation               |
| Database  | Supabase Postgres (tables + row-level security)           |
| Auth      | Supabase Auth (email + password), faculty accounts only   |
| Photos    | Vercel Blob in production, a local `.data/` folder in dev |
| Hosting   | Vercel                                                    |

> This version of Next.js has breaking changes from older releases. Before changing framework-level code (caching, routing, `proxy.ts`), read the relevant guide in `node_modules/next/dist/docs/` (see [AGENTS.md](AGENTS.md)).

## Run it locally

You need Node.js 20+ and a Supabase project (free tier is fine).

```bash
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env.local      # then fill in the values (see below)
npm run dev                     # http://localhost:3000
```

### Environment variables

`.env.example` lists every variable. Fill them in `.env.local` (git-ignored; never commit it).

| Variable                        | What it is                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key; safe in the browser                                              |
| `SUPABASE_SERVICE_ROLE_KEY`     | **Secret** server-only key. Never expose it or prefix it with `NEXT_PUBLIC_` |
| `BLOB_READ_WRITE_TOKEN`         | Optional. Leave unset locally (photos go to `.data/`)                        |

### Set up the database (first time only)

1. Run the SQL in `supabase/migrations/` against your project (Supabase dashboard -> SQL editor, or `npx supabase db query --linked -f <file>` after `npx supabase link`).
2. Seed the basic site text and divisions: `node --env-file=.env.local scripts/seed.mjs`
3. Create a faculty login: `node --env-file=.env.local scripts/create-faculty.mjs <email> <password> "<Full name>"`
4. Open `/admin/login` and sign in. Everything else (events, startups, team, jobs) is added from the admin panel.

## Scripts

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Dev server                              |
| `npm run build`        | Production build                        |
| `npm run lint`         | ESLint                                  |
| `npm run typecheck`    | TypeScript check                        |
| `npm run format`       | Format everything with Prettier         |
| `npm run format:check` | Check formatting without changing files |

## Project structure

```
src/
  app/                    Routes only (Next.js App Router)
    (site)/               Public pages: home, events, startups, marketplace, about, contact, submit
    admin/                Admin panel: login + (panel)/ pages (inbox, events, startups, jobs, people, ...)
    api/admin/upload/     Photo upload endpoint (faculty only)
    media/[name]/         Serves uploaded photos
    globals.css           Tailwind import, colour tokens, shared animations
  components/
    ui/                   Small shared pieces: Button, Reveal, Counter, Eyebrow, ScrollProgress
    layout/               Site chrome: Nav, Footer, Logo, Intro animation, PageHeader
    home/                 Home-page sections (Hero, Divisions, Ventures, People, ...)
    events/ startups/ marketplace/ contact/    One folder per feature (cards + the page's interactive view)
    admin/                Admin UI: shell, editors, inbox/review queue
  server/                 Server-only code: never imported into browser code
    content.ts            Reads/writes site content in Supabase (the single data-access module)
    auth.ts               "Is this a faculty member?" checks
    actions/              Server actions: public.ts (visitor forms), admin.ts (faculty edits/approvals)
    supabase/             Supabase clients (service-role and per-user session)
    media-store.ts        Photo storage (Vercel Blob / local .data/)
  hooks/                  Reusable React hooks (focus trap, today's date)
  lib/                    Pure helpers and constants shared by server and client (events status, utils)
  types/content.ts        Types for all site content and form submissions
  proxy.ts                Redirects signed-out visitors away from /admin (Next.js "proxy", formerly middleware)
supabase/migrations/      Database schema (SQL)
scripts/                  One-off CLI scripts: seed.mjs, create-faculty.mjs
public/                   Static assets (brand/ holds the crest and poster)
```

### Where do I add things?

- **A new public page:** create `src/app/(site)/<name>/page.tsx`. Put interactive parts in `src/components/<name>/`.
- **A new component:** shared and generic -> `components/ui/`; used by one feature -> that feature's folder.
- **New data logic (a query, a write):** `src/server/` (never in a component). Forms and admin edits are server actions in `src/server/actions/`.
- **A new content type / table:** add a SQL migration in `supabase/migrations/`, a type in `src/types/content.ts`, and read/write mapping in `src/server/content.ts`.

### Conventions

- React components are `PascalCase.tsx`; other files are lowercase / kebab-case (`use-today.ts`, `media-store.ts`).
- Event status (Upcoming / Ongoing / Past) is **never stored**; it is derived from the dates in `src/lib/events.ts`.
- Colours and fonts live once in `src/app/globals.css` (`--gold`, `--ivory`, ...). Use the Tailwind names (`text-gold`, `bg-elev`) instead of hex values. Use `text-gold-deep` for gold text on light backgrounds (plain gold fails contrast there).
- Mobile first: base classes are phones, `sm:` / `md:` / `lg:` add larger layouts. Check pages at 360-390px wide.

## Deploying (Vercel)

1. Import the repo in Vercel (framework: Next.js; `vercel.json` pins it).
2. Add the environment variables from `.env.example` (Project -> Settings -> Environment Variables). `BLOB_READ_WRITE_TOKEN` comes from connecting a Vercel Blob store to the project.
3. Deploy: push to the main branch, or run `vercel deploy --prod --yes`.

The database lives in Supabase, so deploying code never touches your content.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
