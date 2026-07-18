# Shevet Imahot — Target Architecture (Rebuild)

> Proposed architecture for rebuilding **shevet-imahot.co.il** off WordPress onto a simpler, cheaper, faster stack. Scope reflects **Keren's decisions (2026-06-27)**: keep the existing visual identity (font + colors), make the **search engine the centerpiece**, build **converting doula profile pages**, drop the weekly track / courses catalog / on-site checkout, embed **Rav-Messer (Responder)** forms, sell via **Meshulam** sale-page buttons, and wire **compliant analytics**. Companion to `WEBSITE_SPEC.md`.

---

## 0. Brand & design tokens (locked — based on the live site and Keren's direction)

Keren: *"keep the design language, colors, and my font Oron Yad."* Extracted from the production CSS:

| Token | Value | Use |
|---|---|---|
| Display font | **Oron Yad** (`OronYad_MFW.woff/.ttf`, on the site since 2020) | Headings, hero |
| Body font | **Assistant** | Body text, UI |
| `--brand` | **#92003b** (raspberry/fuchsia) | Primary CTAs, links, accents |
| `--heading` | **#3d3d3d** (dark gray) | Headings |
| `--peach` | **#FBCFAC** / `#F3CFAC` | Accents, chips |
| `--cream` | **#F4ECE1** / `#F4F3F1` | Page grounds |
| `--beige` | **#CDA88B** | Secondary accent |
| `--text` | **#565656** / `#7A7A7A` | Body text |

Ship Oron Yad as a self-hosted `@font-face` (woff2 + woff fallback) — it is a licensed font already in the site's uploads.

---

## 1. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | **Astro** (static + islands) | Ships ~zero JS by default → fast; first-class **RTL/Hebrew**; renders CMS content at build, hydrates only the search/interactive bits. |
| **CMS** | **Sanity** (hosted, **Free plan confirmed**) | Best non-technical editor UX; structured docs fit the practitioner directory + facets exactly. Free plan = **20 seats, 2 roles, 2 public datasets, hosted real-time DB + live preview** — covers this project with no fixed cost. Public-dataset-only is fine (content is public; secrets/PII never stored here — forms → Responder). |
| **Hosting** | **Netlify** or **Vercel** | Git push → deploy. Free/cheap tier. CDN + redirects built in. |
| **Search** | **Client-side over a build-time JSON index** | Two engines (below). ~155 records — no search service needed; instant in-browser filtering. |
| **Forms** | **Rav-Messer (Responder) embedded forms** | Keren embeds Responder forms today and prefers embedding (links often break). Matchmaking + contact = embedded Responder. |
| **Payments** | **Meshulam sale-page button** | No cart, no checkout on-site. Anything paid = a button linking to a Meshulam sale page. Zero PCI surface. |
| **Email/automation** | **Responder (רב-מסר)** | Existing list, lead magnets, unsubscribe. Forms feed it directly. |
| **Community** | WhatsApp (unchanged) | Group invite links stored as CMS fields; signup form emails/returns the link. |
| **Analytics** | **Google Tag Manager + Site Kit**, consent-gated | Reconnect existing GTM; cookie consent per Israeli privacy / advertising rules. |

**Why not alternatives**
- *Stay WordPress simplified*: keeps the plugin sprawl, cost, patching and slowness we're escaping.
- *Strapi/self-hosted CMS*: needs a server + DB. Sanity is hosted = less ops.
- *Full Next.js app*: heavier than needed; the site is content + two search widgets. Astro is lighter.

---

## 2. High-level diagram

```
            ┌───────────────────────────────────────────────┐
            │                  Sanity (CMS)                  │
            │  practitioner · article · benefit · whatsapp   │
            │  salePage(button) · page · siteSettings        │
            └───────────────┬───────────────────────────────┘
                            │  webhook on publish
                            ▼
   git push ───────►  Astro build  ──────►  static site + 2 search JSON indexes
                            │                          │
                            ▼                          ▼
                   Netlify/Vercel CDN  ◄──── browser: 2 search engines, RTL
                            │
        ┌───────────────────┼────────────────────────────┐
        ▼                   ▼                             ▼
  Responder form       Meshulam button               WhatsApp link
  (embedded)           (sale page)                   (join group)
        │
        ▼
  Responder list / automations
```

Publish in Sanity → webhook rebuilds → CDN serves fresh static pages. The only dynamic pieces are the two client-side search engines; everything else hands off to Responder, Meshulam, or WhatsApp.

---

## 3. Content model (Sanity schemas)

### `practitioner`  (doulas + professionals)
```
kind:           'doula' | 'professional'      // a doula can be both — see flags
isDoula:        bool                           // appears in doula search
isProfessional: bool                           // appears in professional search
tier:           'premium' | 'index'            // premium = full page; index = self-serve listing
name, slug, photo, title
videoUrl:       url            // YouTube/Vimeo — TOP of the converting profile
bio:            portable text
credentials:    string[]

// doula-search facets
hospitals:      ref[] -> hospital
supportStyle:   string[]       // VALUES TBD with Keren (e.g. natural / emotional / medical)
budget:         'low'|'mid'|'high'   // ₪ band — VALUES/ranges TBD with Keren
availableAround: date?         // to match "due date" searches — mechanism TBD

// professional-search facets
fields:         ref[] -> field     // lactation, massage, reflexology, osteopathy…
regions:        ref[] -> region    // location-first for professional search
languages:      string[]           // English/Spanish/Russian native, etc.

contact:        { phone, whatsapp, email, instagram }
services:       portable text
testimonials:   [{ author, quote, rating }]
faq:            [{ q, a }]
gallery:        image[]
published:      bool
```
> `other_doula` (51) → imported as `tier:'index'`. New ones self-register via a form (see §5).

### `article`
```
type:     'article' | 'workshop'   // workshop = VOD
title, slug, cover, excerpt, body (portable text)
category: 'pregnancy'|'birth'|'breastfeeding'|'infant'|'natural-birth'|'parenting'|'anxiety'
videoUrl: url?
```
> No `gated` flag — **no members-only content** (per Keren).

### `benefit`  (coupon)
```
partner, logo, slug
category: 'pregnancy'|'postpartum'|'baby'
discount: string
description, redeemUrl / couponCode
```

### `whatsappGroup`
```
name, cohort ('due-date'|'topic'), inviteUrl, moderator, guidelines
```

### `salePage`  (replaces the product catalog)
```
title, image, blurb, meshulamUrl    // just a button target; e.g. Keren's course
```

### Facet taxonomies
`hospital`, `field` (professional specialization), `region`, plus inline string lists for `supportStyle` / `languages`.

### Singletons / pages
`siteSettings` (contacts, socials, nav, GTM id), `page` (Home, Welcome, Team, legal).

**Dropped from the old model:** `pregnancyWeek` (weekly track — not in use), `course`/`product` catalog (only Keren's single course remains → a `salePage`), members-only gating.

---

## 4. Route map (Astro)

| Route | Source | Notes |
|---|---|---|
| `/` | page + featured | Home |
| `/doulas/` | practitioner (isDoula) | **Doula search**: hospital · due date · support style · budget |
| `/doulas/[slug]/` | practitioner (premium) | **Converting profile**: video, sticky WhatsApp CTA, reviews, embedded form |
| `/professionals/` | practitioner (isProfessional) | **Professional search**: field · region (location-first) · language |
| `/professionals/[slug]/` | practitioner | Profile (premium tiers) |
| `/doulas/join/` | page + Responder form | Self-serve "other doula" registration |
| `/articles/` , `/articles/[slug]/` | article | List + article/VOD |
| `/benefits/` | benefit | Filter by category |
| `/community/` | whatsappGroup + page | Signup → WhatsApp link |
| `/[salePage]/` | salePage | Blurb + Meshulam button |
| `/team/` `/welcome/` `/privacy/` `/terms/` `/accessibility/` | page | Static |

URL changes → **301 redirects** (Netlify `_redirects`). Export the existing **301 Redirects** plugin map so nothing already in place is lost. Critical for the ~155 practitioner + ~114 article URLs.

**Removed routes:** `/pregnancy/week/[n]/`, `/courses/`, `/shop/`, `/cart/`, `/checkout/`, `/thank-you/`, `/badpayment/`.

---

## 5. Interactive pieces (the only JS)

1. **Doula search engine** — Astro island over `doulas.json`. Facets: hospital, due date (matched to availability — mechanism TBD), support style, budget. Client-side, instant.
2. **Professional search engine** — separate island over `professionals.json`. Facets: field/specialization, region (location-first), language. A practitioner flagged both appears in both, with the relevant criteria each.
3. **Converting doula profile** — video player at top, **sticky WhatsApp CTA**, testimonials, gallery, **embedded Responder form**. This page is the conversion target — optimize for mobile.
4. **Self-serve doula registration** — embedded Responder form on `/doulas/join/`; submission notifies the team → approve → add as `tier:'index'`. (Optional later: write a Sanity draft for one-click approval.)
5. **Embedded Responder forms** — matchmaking ("help me find the right one") + contact, embedded inline.
6. **Meshulam buttons** — plain links to sale pages.
7. **Accessibility toolbar** — keep (Israeli law); off-the-shelf widget or small custom island.
8. **Consent banner** — GTM/analytics gated behind consent per privacy law.

---

## 6. Payments (no commerce engine)

```
salePage → "לרכישה" button → Meshulam sale page (off-site, handles payment + receipt)
```
No cart, no accounts, no `/thank-you` plumbing — Meshulam owns the transaction end to end. Revisit only if a real catalog reappears.

---

## 7. Migration plan

1. **Model in Sanity** — schemas above; define the two search indexes.
2. **Import** — from the **WXR export already pulled** (full content + every JetEngine meta field): 87 premium doulas, 51 other doulas (→ `index`), 17 professionals, 114 articles/workshops, 30 benefits. Map meta keys (`i-believe`, `during-birth`, `whatsapp`, `video`, `recommandation-*`, etc.) to schema fields.
   - Drop the weekly track, courses, and product catalog (keep only Keren's course as a `salePage`).
   - Archive dated `community/` recaps.
3. **Build Astro** — RTL base in the brand tokens (§0); two search engines; converting profile; benefits; community; sale pages.
4. **Forms + payments** — embed Responder forms; wire Meshulam buttons.
5. **Search data** — define `supportStyle` / `budget` / due-date matching with Keren, backfill onto practitioner records.
6. **Redirects + analytics** — `_redirects` from the old URLs + the 301-plugin map; reconnect GTM with consent.
7. **QA** — RTL, accessibility, mobile, both search engines, form delivery, WhatsApp/Meshulam links, redirect coverage.
8. **DNS cutover** — point domain to Netlify/Vercel; keep WP read-only briefly as fallback.

---

## 8. Cost (rough, monthly)

| Item | Cost |
|---|---|
| Hosting (Netlify/Vercel) | $0 free tier → ~$19 if needed |
| Sanity | $0 free tier |
| Responder | existing |
| Meshulam | per-transaction only |
| **Total fixed** | **~$0–50/mo** vs current WP hosting + Crocoblock/Elementor Pro licenses |

---

## 9. Decisions & remaining questions

**Locked with Keren (2026-06-27):**
- Keep the visual identity — **Oron Yad** font + raspberry/peach/cream palette.
- **Search engine is the priority** — two distinct engines (doulas vs professionals).
- **Converting doula pages** with video + sticky WhatsApp CTA.
- **Other doulas** = self-serve form → approve → index listing.
- **No** weekly track, **no** courses catalog, **no** WooCommerce/cart, **no** members-only content.
- Payments = **Meshulam** sale-page button. Forms = **Responder** embedded. Email = **Responder**.
- Analytics connected, compliant with Israeli promotion/privacy law.
- Stack locked: **Astro + Sanity (Free) + Netlify + Responder + Meshulam** — $0 fixed monthly cost.

**Still need from Keren (small, blocks search build):**
1. **Support-style** values for doula search (e.g. natural / emotional / medical / VBAC…?).
2. **Budget** bands/ranges for doula search.
3. How **"due date"** should filter — match a doula's availability window, or informational only?
4. **GTM container ID** + which metrics matter.
5. Timeline & budget for the build.

---

*Pairs with `WEBSITE_SPEC.md` (current-state spec). Target reflects Keren's 2026-06-27 feedback.*
