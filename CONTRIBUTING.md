# Contributing

Thanks for helping with the E-Cell site! The basics:

1. **Set up** by following the README ("Run it locally").
2. **Branch** off `main` using `type/short-description`, e.g. `feat/event-detail-page`, `fix/nav-contrast`, `docs/readme-typos`.
3. **Commit** in small, focused commits with a prefix: `feat:`, `fix:`, `chore:` (cleanup, moves), `docs:`. Write what changed and why in the first line, e.g. `fix: keep focus in the apply dialog`.
4. **Before you push**, all three must pass:
   ```bash
   npm run format      # Prettier
   npm run lint        # ESLint
   npm run typecheck   # TypeScript check
   npm test            # Focused unit tests
   npm run build       # also type-checks
   ```
5. **Open a pull request** into `main` with a short description and, for visual changes, a screenshot (phone width too).

## Ground rules

- Never commit `.env*` files or secrets. Only `.env.example` (names, no values) is committed.
- Never use the Supabase service-role key in browser code. Anything that needs it belongs in `src/server/`.
- Database changes go in a new file in `supabase/migrations/` (don't edit old ones).
- Keep pull requests to one topic. Moving files and changing behaviour should be separate PRs.
- Not sure where something goes? See "Where do I add things?" in the README.
