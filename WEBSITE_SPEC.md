# Shevet Imahot — Website Specification

> Reverse-engineered spec of the current production site at **www.shevet-imahot.co.il**, captured 2026-06-27 by crawling public pages and the XML sitemap. Intended as the baseline for rebuilding the site on a simpler stack.

---

## 1. What the site is

**Shevet Imahot** (שבט אמהות, "Tribe of Mothers") is a Hebrew-language (RTL) community platform for pregnant women and new mothers in Israel. It combines four things:

1. **A professional directory** — find/book vetted doulas and maternal-health therapists.
2. **A content library** — articles, workshop recordings (VOD), and week-by-week pregnancy guidance.
3. **A community** — WhatsApp groups segmented by due date and by topic, with professional moderators.
4. **A benefits club** — partner discounts/coupons for pregnancy and baby products.

There is also a **B2B side**: a paid membership program recruiting birth professionals (doulas, counselors, therapists) — profile listing + business-development course + leads + mentorship + affiliate commissions.

**Audience**: women only (community is gated to women). Primary content is Hebrew, RTL.

**Founders / contacts**
- Keren Eitan — Instagram `@keren__eitan`, `@shevet.imahot__keren.eitan`
- Irit Angel — Instagram `@iritangel`
- Email: `keren.eitan.mommy.like.you@gmail.com`
- Phone: 054-2473799
- Facebook: `shevet.imahot`

---

## 2. Current tech stack (inferred)

- **WordPress** CMS.
- **Elementor** page builder + **Crocoblock JetEngine / JetPopup / JetThemeCore** — evidenced by `jet-popup-sitemap.xml`, `jet-theme-core-sitemap.xml`, and the custom-post-type + taxonomy + listing-grid + filter architecture.
- **WooCommerce** — `/shop/`, `/cart/`, `/checkout/`, `/my-account/`, `product` post type, `/thank-you/`, `/badpayment/`.
- **Yoast SEO** — sitemap index structure.
- Accessibility toolbar widget (font sizing, contrast, high-contrast, readable fonts) — Israeli accessibility-law compliance.

**Takeaway for rebuild**: the heavy lifting is JetEngine custom post types + taxonomy filters + WooCommerce. A simpler stack must replicate: directory listings with faceted filters, a matching/lead form, content collections, a member club, and payments.

---

## 3. Content model (custom post types & taxonomies)

From the sitemap index. Counts are sitemap entry counts (incl. the archive page).

| Post type / collection | URL base | Count | Purpose |
|---|---|---|---|
| **Doulas (premium)** | `/doulas-premium/` | ~120 | Vetted doula profiles, paying members |
| **Therapists (premium)** | `/therapist-premium/` | ~18 | Vetted counselor/therapist profiles |
| **Other doulas** | `/other_doula/` | ~47 | Additional/non-premium doula listings |
| **Pregnancy blog** | `/pregnancy-blog/` | ~102 | Articles + workshop (VOD) recordings |
| **Benefits / coupons** | `/benefits/` | ~25 | Partner discount cards |
| **Courses** | `/courses/` | ~7 | Course offerings |
| **Lead-to-birth** | `/lead-to-birth/` | ~26 | Week-by-week pregnancy content (week13–week40) |
| **Birth preparation** | `/birth-preperation/` | ~19 | Birth-prep topics/modules |
| **Community** | `/community/` | ~9 | Community meetup/event recaps |
| **Products** | `/product/` | 15 | WooCommerce paid items |

**Taxonomies used as directory filters** (these sitemaps are term archives, not content):
- `additional-trainings` (~33) — practitioner trainings/specializations (registered nurse, equilibrio, hand biomechanics, NLP…)
- `additional-tools` (~21) — service attributes: **languages spoken** (English/Spanish/Russian native), acupuncture, guided imagery…
- `area_68` — geographic regions (online, home visit, south, Haifa, center, north…)

### 3.1 Professional profile fields (doula/therapist)
From `/doulas-premium/keren-eitan/`:
- Name + professional title
- Profile photo
- Contact: phone, **WhatsApp** button, email, Instagram
- Credentials/certifications (e.g. Spinning Babies, reflexology, shiatsu, essential oils)
- **Service locations** — list of hospitals (Ichilov, Asuta Ashdod, Assaf Harofeh, Beilinson, Hadassah Ein Karem, Wolfson…)
- Region / coverage area
- Bio / philosophy (long text)
- Service components (e.g. Zoom intro, prep course, in-person labor support, postpartum WhatsApp)
- Testimonials (multiple, "verified")
- FAQ section
- Payment terms (split payment, insurance documentation)
- Contact / lead form

### 3.2 Directory listing + filters (doulas & therapists archives)
- Faceted filter bar:
  - **Hospital** (20+ Israeli hospitals) — doulas
  - **Consultation area** (osteopath, doula, dietician, acupuncture, sleep, lactation…) — therapists
  - **Region** (online / home / south / Haifa / center / north…)
  - **Name** (alphabetical search)
  - Clear-filters reset
- Card per practitioner: photo, name, specializations, "more details" link
- **"Load more"** pagination
- **Matchmaking lead form** — "Help me find the right one": name, email, phone, city, care focus/treatment type, due date, hospital preference, free-text needs

---

## 4. Page inventory (static pages)

From `page-sitemap.xml`:

**Core / public**
- `/` — Home
- `/welcome/` — Welcome / onboarding
- `/doulas-premium/` — Doula directory
- `/therapist-premium/` — Therapist directory
- `/pregnancy-blog/` — Articles & workshops
- `/benefits/` — Coupons & discounts club
- `/tribal-council/` — WhatsApp community signup
- `/whatsapp-groups/` — WhatsApp groups
- `/whatsapp-therapists/` — Professional WhatsApp groups
- `/shevet-podcast/` — Podcast
- `/team-shevet/` — Team/about
- `/freegift-2/`, `/free*` — Free guide/lead magnet

**Content hubs**
- `/prego/` — Pregnancy
- `/newborn/` — Newborn
- `/birth/` — Birth
- `/childbirth-preparation/` — Childbirth prep
- `/course/`, `/courses/` — Courses
- `/meetings/` — Meetings/events
- `/18dakot/` — "18 minutes" (likely a specific program)
- `/doulameet/` — Doula meet
- `/baby-shevet/` — Baby program

**B2B / professional**
- `/professional-space/` — Pro members area
- `/login-new/` — "Join the professional select" recruitment (NOT a login form)
- `/clubregister/` — Club registration

**Commerce / account**
- `/shop/`, `/cart/`, `/checkout/`, `/my-account/`
- `/thank-you/`, `/badpayment/` — payment result pages
- `/unsubscribe/` — email unsubscribe

**Legal**
- `/privacy-policy/`
- `/terms-of-use/`
- `/הצהרת-נגישות/` — Accessibility statement

---

## 5. Functional capabilities to preserve

1. **Faceted professional directory** — two directories (doulas, therapists) + an "other doulas" tier, filterable by region, hospital, specialization, language, name; "load more" paging.
2. **Lead / matchmaking forms** — capture and route inquiries to a practitioner or to the team (name, email, phone, city, due date, hospital, needs). Marketing-consent checkbox.
3. **Per-practitioner contact** — WhatsApp deep links, email, phone, Instagram.
4. **Content library** — articles + VOD workshop recordings; categories: pregnancy, birth, breastfeeding, infant care, natural birth, parenting, anxiety. "Load more" paging.
5. **Week-by-week pregnancy track** (`lead-to-birth` week13–40) — likely an email/drip + page sequence keyed to due date.
6. **WhatsApp community** — groups segmented by due-date cohort and by professional topic; women-only gating; signup form (name, email, phone, due date) + community guidelines.
7. **Benefits club** — partner coupon cards, filterable by category (pregnancy / postpartum / baby), each linking to a detail/redemption page.
8. **E-commerce** — paid courses, retreats, memberships via WooCommerce; account area, checkout, payment success/failure handling, split payments.
9. **B2B membership funnel** — professional recruitment page, application form, members-only "professional space," business course, mentorship meetings, affiliate commissions.
10. **Podcast** page.
11. **Accessibility toolbar** (legal requirement in Israel).
12. **RTL Hebrew** throughout.
13. **Email lifecycle** — lead magnets (free guide), unsubscribe page → there is an email/marketing system behind it.

---

## 6. Integrations / externals

- Instagram embeds (multiple accounts) + Facebook.
- WhatsApp (click-to-chat deep links, group invites).
- Payment gateway (via WooCommerce; `/badpayment/` implies hosted/redirect flow).
- Email marketing / automation (lead magnets, `/unsubscribe/`).
- Maya Studio (`mayastudio.co.il`) — site builder/agency credit.

---

## 7. Notes & gaps for the rebuild

- **`product` post type contains test junk** (`/product/temp/`, `/product/test/`, `19-2`, `99`, `49`, `199-2`) — the catalog is small (~6 real items: retreat, doula course, hamenifa, courses, finance, zoom join). A rebuild can model these as a short, hand-maintained product list rather than full WooCommerce.
- **Two overlapping doula sets** (`doulas-premium` ~120 vs `other_doula` ~47) — clarify whether this is a paid/free tier split before migrating.
- **`login-new` is mislabeled** — it's a B2B sales page, not auth. Real auth is WooCommerce `/my-account/`.
- **`additional-tools` / `additional-trainings` / `area_68` are filter taxonomies**, not content — model them as tags/facets on practitioner records, not as pages.
- **Community/event pages** (`/community/…`) are dated recaps — low value to migrate; consider archiving.
- Confirm the **week-by-week (`lead-to-birth`)** mechanism (drip email vs. on-site gated content) — it shapes whether the rebuild needs scheduled automation.

### Suggested simpler data model
- `practitioner` (type: doula | therapist; tier: premium | other) with facets: regions[], hospitals[], specializations[], languages[]
- `article` (type: article | workshop-vod) with category
- `pregnancy_week` (13–40) content
- `benefit` (partner, category, discount, link)
- `product` (small fixed list)
- `whatsapp_group` (cohort/topic, invite link, moderator)
- Forms: lead/matchmaking, community signup, pro application, contact

---

*Crawl method: WebFetch over homepage, key section pages, individual profile, and all 18 Yoast sitemap segments. Counts are sitemap entry counts and approximate live content.*
