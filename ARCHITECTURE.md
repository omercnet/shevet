# Shevet Imahot — Target Architecture (Rebuild)

> Proposed architecture for rebuilding **shevet-imahot.co.il** off WordPress onto a simpler, cheaper, faster stack. Decisions baked in: content edited by **non-technical admins via a CMS**, **light commerce** (hosted-checkout redirects, no on-site cart), stack **recommended below**. Companion to `WEBSITE_SPEC.md`.

---

## 1. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | **Astro** (static + islands) | Ships zero JS by default → fast; first-class **RTL/Hebrew**; renders Sanity content at build, hydrates only interactive bits (filters, forms). |
| **CMS** | **Sanity** (hosted) | Best non-technical editor UX; structured documents fit the directory + facets exactly; free tier covers this scale; real-time preview; hosted (no server to run). |
| **Hosting** | **Netlify** or **Vercel** | Git push → deploy. Free/cheap tier. CDN, forms, redirects built in. |
| **Forms / leads** | Netlify Forms **or** Formspree → email + webhook | Matchmaking, contact, community signup, pro application. No backend. |
| **Payments** | **Hosted payment links** (Cardcom / Tranzila / Meshulam-Grow) + **Calendly** for bookings | Israel-friendly gateways; redirect out, return to `/thank-you`. No cart code, no PCI surface. |
| **Email/automation** | Existing provider (or **MailerLite / Brevo**) | Lead magnets, week-by-week drip, unsubscribe. CMS/forms push subscribers via webhook. |
| **Community** | WhatsApp (unchanged) | Group invite links stored as CMS fields; signup form gates + emails the link. |
| **Search/filter** | Client-side over a build-time JSON index | Directory is ~200 records — no search service needed; filter in-browser. |

**Why not alternatives**
- *Stay WordPress simplified*: keeps plugin sprawl, hosting cost, security patching, slowness — the things being escaped.
- *Strapi/self-hosted CMS*: needs a server + DB to run. Sanity is hosted = less ops.
- *Full Next.js app*: more than needed; site is mostly content + a few interactive widgets. Astro is lighter.

---

## 2. High-level diagram

```
            ┌────────────────────────────────────────────┐
            │                Sanity (CMS)                 │
            │  practitioners · articles · weeks · benefits│
            │  products · whatsappGroups · pages · team   │
            └───────────────┬─────────────────────────────┘
                            │  content API / webhook on publish
                            ▼
   git push ───────►  Astro build  ──────►  static site + JSON indexes
                            │                       │
                            ▼                       ▼
                   Netlify/Vercel CDN  ◄──── browser (RTL, filters, forms)
                            │
       ┌────────────────────┼───────────────────────────┐
       ▼                    ▼                            ▼
  Netlify Forms       Payment link              Calendly / WhatsApp
  (lead/contact)   (Cardcom/Tranzila)            (book / join group)
       │                    │
       ▼                    ▼
  Email provider      /thank-you  /badpayment
  (drip + lists)
```

Publish in Sanity → webhook triggers a rebuild → CDN serves fresh static pages. Interactive pieces (directory filters, forms, payment buttons) run client-side or hand off to hosted services.

---

## 3. Content model (Sanity schemas)

Mirrors the live site, collapsed to the essentials.

### `practitioner`
```
type:           'doula' | 'therapist'
tier:           'premium' | 'other'
name, slug, photo, title
bio:            portable text
credentials:    string[]            // certifications
specializations: ref[] -> specialization   // facet
regions:        ref[] -> region            // facet
hospitals:      ref[] -> hospital          // facet (doulas)
languages:      string[]                   // facet
contact:        { phone, whatsapp, email, instagram }
services:       portable text              // what's included
testimonials:   [{ author, quote }]
faq:            [{ q, a }]
paymentNotes:   text
published:      bool
```

### `article`
```
type:     'article' | 'workshop'   // workshop = VOD
title, slug, cover, excerpt, body (portable text)
category: 'pregnancy' | 'birth' | 'breastfeeding' | 'infant' | 'natural-birth' | 'parenting' | 'anxiety'
videoUrl: url?      // for workshops
gated:    bool      // members-only?
```

### `pregnancyWeek`  (the `lead-to-birth` track, weeks 13–40)
```
week: number, title, body, articleRefs[]
```

### `benefit`  (coupon)
```
partner, logo, slug
category: 'pregnancy' | 'postpartum' | 'baby'
discount: string        // "20% off"
description, redeemUrl / couponCode
```

### `product`  (light commerce — small fixed list)
```
title, slug, image, description, price
checkoutUrl: url        // hosted payment link OR Calendly
type: 'course' | 'retreat' | 'membership' | 'session'
```

### `whatsappGroup`
```
name, cohort ('due-date' | 'topic'), inviteUrl, moderator, guidelines
```

### Facet taxonomies (referenced by practitioner)
`specialization`, `region`, `hospital` — each `{ name, slug }`.

### Singletons / pages
`siteSettings` (contacts, socials, nav), `page` (Home, Welcome, Team, About, legal), `podcastEpisode`.

---

## 4. Route map (Astro)

| Route | Source | Notes |
|---|---|---|
| `/` | page + featured refs | Home |
| `/doulas/` | practitioner (doula) | **Faceted directory**: filter region/hospital/specialization/language/name; client-side; "load more" |
| `/doulas/[slug]/` | practitioner | Profile |
| `/therapists/` | practitioner (therapist) | Faceted directory |
| `/therapists/[slug]/` | practitioner | Profile |
| `/articles/` | article | Filter by category; article + workshop |
| `/articles/[slug]/` | article | Article / VOD player |
| `/pregnancy/week/[n]/` | pregnancyWeek | Week-by-week track |
| `/benefits/` | benefit | Filter by category; cards |
| `/community/` | whatsappGroup + page | Signup form → email invite link |
| `/courses/` `/shop/` | product | Cards → hosted checkout |
| `/thank-you/` `/badpayment/` | page | Payment return pages |
| `/for-professionals/` | page | B2B recruitment + application form |
| `/podcast/` | podcastEpisode | |
| `/team/` `/welcome/` `/privacy/` `/terms/` `/accessibility/` | page | Static |

URL changes from WP → add **301 redirects** (Netlify `_redirects`) from old slugs to preserve SEO. Critical for the ~200 directory + ~100 article URLs.

---

## 5. Interactive pieces (the only JS)

1. **Directory filter** — Astro island (or vanilla) over a build-time `practitioners.json`; filters in-browser, no API. Instant, works at this scale.
2. **Lead / matchmaking form** — Netlify Forms; on submit → email team + optional webhook to email provider. Honeypot + spam filter.
3. **Community signup** — form → validates → emails the WhatsApp invite link; pushes subscriber to email list/cohort.
4. **Payment buttons** — plain links to hosted checkout / Calendly. Return URL = `/thank-you`.
5. **Accessibility toolbar** — keep (Israeli law). Use an off-the-shelf widget or a small custom island (font size, contrast).

---

## 6. Commerce flow (light)

```
product card → "buy"/"book" → hosted payment link (Cardcom/Tranzila)
   ↳ success → redirect /thank-you  → (gateway webhook → email provider grants access/role)
   ↳ failure → /badpayment
course/retreat booking → Calendly → confirmation email
```
No cart, no on-site accounts initially. If gated content/members area is needed later, add a light auth (e.g. magic-link) — defer until proven necessary.

---

## 7. Migration plan

1. **Model in Sanity** — define schemas above.
2. **Scrape + import** — script reads the WP sitemap (already enumerated in `WEBSITE_SPEC.md`), pulls each page's content + fields, transforms to Sanity docs. ~200 practitioners, ~100 articles, ~25 benefits.
   - Drop test junk products (`temp`, `test`, `19-2`, `99`, `49`, `199-2`).
   - Decide premium vs other doula tiers; merge or tag.
   - Archive dated `community/` event recaps (low value).
3. **Build Astro** — layouts (RTL base), directory + filters, profile, article, week, benefits, product templates.
4. **Forms + payments** — wire Netlify Forms + hosted payment links + Calendly.
5. **Redirects** — map every old URL → new in `_redirects`.
6. **QA** — RTL rendering, accessibility (a11y law), mobile, filter correctness, form delivery, payment round-trip, redirect coverage.
7. **DNS cutover** — point domain to Netlify/Vercel; keep WP up read-only briefly as fallback.

---

## 8. Cost (rough, monthly)

| Item | Cost |
|---|---|
| Hosting (Netlify/Vercel) | $0 free tier → ~$19 if needed |
| Sanity | $0 free tier (well within limits) |
| Forms (Netlify/Formspree) | $0 → ~$10 |
| Email provider | existing / ~$10–20 |
| Payment gateway | per-transaction only |
| **Total fixed** | **~$0–50/mo** vs current WP hosting + plugin licenses (Crocoblock, etc.) |

---

## 9. Open questions before build

1. **Doula tiers** — is `premium` vs `other` a paid/visibility split? Drives whether they merge.
2. **Gated content** — are any articles/workshops members-only today? If yes, need light auth + role from payment.
3. **Week-by-week** — currently drip email, on-site pages, or both? Sets whether email automation is in scope.
4. **Existing email provider** — what's behind `/unsubscribe/` and the free-guide lead magnets? Reuse or migrate.
5. **Payment gateway** — which Israeli gateway is in use now (for continuity + payouts)?
6. **Languages** — Hebrew only, or any English content to preserve?

---

*Pairs with `WEBSITE_SPEC.md` (current-state spec). This doc is the proposed target; adjust after the open questions above are answered.*
