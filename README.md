# שבט אמהות — rebuild

Rebuild of shevet-imahot.co.il off WordPress onto a lean, low-cost stack.

- **`WEBSITE_SPEC.md`** — current-site spec (verified against WP admin) + rebuild scope.
- **`ARCHITECTURE.md`** — target architecture + decisions.
- **`pitch/`** — Hebrew client pitch deck (`shevet-pitch.html`).
- **`studio/`** — Sanity CMS (content model / schemas).
- **`web/`** — Astro static front-end.

## Stack
Astro (static) · Sanity (Free) · Netlify · Responder (forms/email) · Meshulam (payments). $0 fixed/mo.

## Setup

### 1. Sanity (CMS)
```bash
cd studio
npm install
npx sanity init        # create/link a project; copy the projectId
npm run dev            # studio at http://localhost:3333
```
Set `SANITY_STUDIO_PROJECT_ID` (or edit `sanity.config.ts` / `sanity.cli.ts`).

### 2. Web (Astro)
```bash
cd web
npm install
cp .env.example .env   # fill SANITY_PROJECT_ID, dataset, GTM id
npm run dev            # http://localhost:4321
```

## What's built
- **Two search engines** — `/doulas/` (hospital · due date · support style · budget) and `/professionals/` (field · region · language). Client-side, instant.
- **Converting doula profile** — `/doulas/[slug]` with video embed + sticky WhatsApp CTA + reviews.
- Brand locked: **Oron Yad** font (`web/public/fonts/`) + raspberry/peach/cream tokens (`src/styles/brand.css`).

## TODO (tracked in ARCHITECTURE.md §9)
- Confirm with Keren: `supportStyle` values, `budget` bands, due-date matching rule, GTM id.
- Pages: `/articles/`, `/benefits/`, `/community/`, `/doulas/join/` (self-serve), sale pages.
- Embed Rav-Messer forms (matchmaking + profile contact) from `siteSettings`.
- Import script: WXR export → Sanity docs.
- `_redirects` from old URLs + the 301-plugin map.
