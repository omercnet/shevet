# Shevet Imahot agent guide

Read this first, then `README.md`, `ARCHITECTURE.md`, and `WEBSITE_SPEC.md` when scope matters. `AGENTS.md` is a symlink to this file so all agents get one source of truth.

## What this repo is

Rebuild of `shevet-imahot.co.il` from WordPress to a low-ops static stack:

- `web/` - Astro static site. Public routes, search/filter UI, contact links, brand CSS.
- `studio/` - Sanity Studio schemas/content model.
- `tools/import/` - WordPress WXR to Sanity importer. WXR exports are not committed because they can contain practitioner PII.
- `pitch/` - Hebrew client pitch deck.
- `netlify.toml` - Netlify build (`base = "web"`, publish `dist`) plus legacy redirects.

Core product decisions from Keren are locked in `ARCHITECTURE.md`: keep Oron Yad + raspberry/peach/cream visual identity, make doula/professional search central, build converting doula pages, drop weekly track/courses catalog/WooCommerce/members-only content, embed Responder forms, link Meshulam sale pages, keep WhatsApp community flow.

## Stack and commands

Use Node 22. Install per package, not from repo root.

For fresh Paseo worktrees, run `node .paseo/setup.mjs`; the Claude `SessionStart` hook also installs missing `node_modules` for `web/`, `studio/`, and `tools/import/`.

```bash
cd web
npm install
npm run dev       # Astro at http://localhost:4321
npm run check
npm run build
npm run lint
npm run validation:contract
npm run content:contract
npm run parity:samples

cd ../studio
npm install
npm run dev       # Sanity Studio at http://localhost:3333
npm run typecheck
npm run build
npm run lint

cd ../tools/import
npm install
npm run contract -- --dir /tmp/shevetbackup  # or another WXR directory
npm run dry-run -- --dir /path/to/wxr
npm run import -- --dir /path/to/wxr
```

Environment:

- Web/Netlify: `SANITY_PROJECT_ID=cuxqs66c`, `SANITY_DATASET=production`, `SANITY_TOKEN` read token for private dataset. Without token, build may still pass with empty content.
- Studio: `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`; defaults match production.
- Importer: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN` write token. Import is idempotent via deterministic IDs/createOrReplace.

## Source map

- `web/src/pages/` - Astro routes: home, doulas, professionals, articles, benefits, community, legal/static pages.
- `web/src/lib/sanity.ts` - Sanity client/data access.
- `web/src/lib/queries.ts` - GROQ queries and content shaping.
- `web/src/lib/contact.ts` - normalized phone/WhatsApp/tel/mail/social links. Reuse this; do not hand-roll contact URLs.
- `web/src/lib/video.ts` - video URL/embed helpers.
- `web/src/components/ContactForm.astro`, `AccessibilityToolbar.astro`, `LegacyContent.astro`, `ZigZag.astro` - shared UI.
- `web/src/styles/brand.css` - brand tokens and global styling. Preserve RTL/Hebrew-first design.
- `web/scripts/*-contract.mjs` - cheap behavioral checks for redirects, content shape, visual/source contracts, and parity samples.
- `studio/schemaTypes/` - Sanity schemas for practitioners, taxonomies, articles, benefits, WhatsApp groups, sale pages, site settings, community pages.
- `tools/import/import.mjs` - WXR parser/importer; keep dry-run safe and write mode token-gated.

## Implementation rules

- Prefer small static Astro changes over new client JS. Interactive JS should stay limited to search/filtering and small helpers already present.
- Search is client-side over build-time Sanity data; do not add a search service.
- Payments stay off-site through Meshulam links. Do not add cart/account/checkout plumbing.
- Forms stay embedded/linked through Responder. Do not store lead submissions unless explicitly requested.
- Keep practitioner contact data private in Sanity; never commit WXR exports, `.env`, tokens, or scraped PII.
- For contact links, use `web/src/lib/contact.ts` helpers.
- For legacy URL changes, update `netlify.toml` redirects and run `npm run validation:contract` in `web/`.
- For content model changes, update matching Studio schema, GROQ query, importer mapping, and contract script together.
- Preserve Hebrew/RTL, accessibility, mobile conversion flow, and Oron Yad branding.

## Beads workflow

This repo uses `bd` for issue tracking.

```bash
bd prime
bd ready
bd show <id>
bd update <id> --claim
bd close <id>
bd dolt push
```

Use `bd` for task tracking and `bd remember` for durable repo knowledge. Do not create markdown TODO ledgers.

Before ending a session with code changes: run relevant quality gates, update/close beads issues, `git pull --rebase`, `bd dolt push`, `git push`, then confirm `git status` is clean/up to date.

## Open decisions

Still need Keren to confirm: doula `supportStyle` values, budget bands, due-date matching rule, GTM container ID/metrics, and final timeline/budget. Until then, avoid inventing permanent taxonomy values.
