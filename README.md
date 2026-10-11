# E-Cell VIT website

Website for the Entrepreneurship Cell of Vidyalankar Institute of Technology ("The Scouts of VIT"), with a built-in admin panel for editing content without touching code.

Built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **Framer Motion** and **Vercel Blob** for storage.

> This Next.js version has breaking changes from older releases. Before changing framework-level code, read the guides in `node_modules/next/dist/docs/` (see [AGENTS.md](AGENTS.md)).

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

No setup is needed for local development. Without a Blob token, the admin panel stores content in a local `.data/` folder (git-ignored), so local edits never touch the live site. In dev the admin password defaults to `admin`; to override it, copy `.env.example` to `.env.local`.

### Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Production build                |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript check                |
| `npm run format`    | Format everything with Prettier |

Please run `npm run format` and `npm run lint` before committing.

### Environment variables

See `.env.example`. Never commit `.env*` files.

| Variable                | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `ADMIN_PASSWORD`        | Password for `/admin`                                        |
| `SESSION_SECRET`        | Signs the admin session cookie                               |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store (production/preview only; optional in dev) |

## Project structure

```
src/
  app/
    (site)/          Public pages: home, events, startups, marketplace, about, contact, submit
    admin/           Admin panel (login + (panel) section pages)
    actions/         Server actions (public.ts = forms, admin.ts = admin edits)
    api/admin/upload Image upload route
    media/[name]     Serves uploaded photos from Blob
    globals.css      Tailwind import, colour tokens, shared animations
  components/
    home/            Homepage sections (Hero, Divisions, Ventures, ...)
    views/           Client-side page bodies (filters, forms)
    admin/           Admin UI (shell, editors, inbox, history)
    ui/              Small shared pieces (Button, Reveal, Counter, ...)
  lib/
    data.ts          Types and default content
    content.ts       Read/write content (Blob in prod, .data/ in dev)
    store.ts         Storage layer
    session.ts, auth.ts   Admin login and session cookie
  proxy.ts           Redirects anyone without an admin session away from /admin
```

### Design tokens

Colours and fonts are defined once in `src/app/globals.css` (`--gold`, `--forest`, `--ivory`, ...) and exposed to Tailwind (`text-gold`, `bg-elev`, `font-display`, ...). Change them there rather than hard-coding hex values.

### Responsive design

Mobile-first Tailwind: base classes are phones, `sm:` / `md:` / `lg:` add larger layouts. Check pages at 360-390px wide before merging.

## Deployment

Hosted on Vercel: https://ecell-vit-topaz.vercel.app

```bash
vercel deploy --prod --yes
```

Keep `vercel.json` (it pins the framework to Next.js).
