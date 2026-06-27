# Shevet Imahot — Website Specification

> Reverse-engineered spec of the current production site at **www.shevet-imahot.co.il**, captured 2026-06-27 by crawling public pages, the XML sitemap, and the WordPress admin. Intended as the baseline for rebuilding the site on a simpler stack. **This document describes the CURRENT site.** For what the rebuild keeps/drops, see the scope box below and `ARCHITECTURE.md`.

---

## 0. Rebuild scope — Keren's decisions (2026-06-27)

| Keep & improve | Drop from scope |
|---|---|
| Visual identity: **Oron Yad** font + raspberry `#92003b` / peach / cream palette | Weekly pregnancy track (`lead-to-birth`) — not in use |
| **Two search engines** (priority): doulas (hospital · due date · support style · budget) and professionals (field · location · language) | Courses catalog — only Keren's own course remains (→ Meshulam button) |
| **Converting doula profiles** — video + sticky WhatsApp CTA + reviews | WooCommerce / cart / checkout — replaced by Meshulam sale-page buttons |
| **Other doulas** = self-serve form → approve → index listing | Members-only / gated content — none needed |
| Articles & workshops, community WhatsApp, benefits club | — |
| Forms = **Responder (רב-מסר)** embedded; email = Responder; analytics = GTM, compliant | — |

Open items blocking the search build: support-style values, budget bands, due-date matching rule, GTM id. See `ARCHITECTURE.md` §9.

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

## 2. Current tech stack (verified via admin)

**Confirmed active plugins** (read from `plugins.php`, 2026-06-27):

| Role | Plugins | Rebuild maps to |
|---|---|---|
| Page builder | **Elementor** + **Elementor Pro** | Astro templates |
| Content model / listings | **JetEngine**, **JetThemeCore**, **JetWooBuilder**, **JetPlugins Dynamic Data**, **Dynamic Visibility for Elementor** | Sanity schemas + Astro pages |
| Directory filters | **JetSmartFilters**, **JetSearch** | Client-side filter over build-time JSON |
| Forms / leads | **JetFormBuilder** (3 forms) | Netlify Forms |
| Testimonials | **JetReviews** + `recommandation-*` meta | `testimonials[]` field |
| Popups / tabs / gallery | **JetPopup**, **JetTabs**, **JetElements**, **JetProductGallery** | Native components |
| E-commerce | **WooCommerce** (+ Variation Swatches, Checkout Field Editor, Update Manager) | Hosted payment links (light commerce) |
| **Payments** | **grow payment gateway** (Grow / משולם-Meshulam), **ravpage** (רב-פייג landing/checkout) | Keep gateway, link out |
| **Email marketing** | **Responder** (רב-מסר) | Keep or migrate list |
| Accessibility | **Ally – Web Accessibility** | A11y widget (legal requirement) |
| Performance/cache | **WP Rocket**, **LiteSpeed Cache**, **Docket Cache**, **Asset CleanUp Pro** | Unneeded — static is fast by default |
| SEO / analytics | **Yoast SEO**, **Site Kit by Google**, **GTM4WP** | Keep GTM/analytics tags |
| Redirects | **301 Redirects** | Harvest its map for the new `_redirects` |
| Backups / security / misc | **UpdraftPlus**, **Wordfence**, **Code Snippets**, **WPCode**, **Classic Editor**, **Advanced Editor Tools**, **Duplicate Page**, **Post Type Switcher**, **WP Consent API**, **MayaWidgets** (agency) | — |

**Takeaway for rebuild**: four overlapping caching plugins are a symptom — the site is fighting WordPress's weight. The real custom logic is JetEngine (CPTs+fields) + JetSmartFilters (facets) + JetFormBuilder (3 forms) + WooCommerce/Grow (payments) + Responder (email). A simpler stack must replicate exactly those five.

### 2.1 Forms & integrations (verified)
- **JetFormBuilder forms (3 total)**: `טופס לידים דולות` (Doula leads / matchmaking — the main lead capture), `Review Form`, `Review Form Therapist` (testimonial submission → JetReviews).
- **Email/CRM**: **Responder (רב-מסר)** — this is what powers the free-guide lead magnets and the `/unsubscribe/` flow.
- **Payments**: **Grow / Meshulam (משולם)** via the grow gateway, plus **ravpage (רב-פייג)** for landing-page checkouts. `/badpayment/` and `/thank-you/` are the gateway return pages.
- **Analytics**: Google Tag Manager (GTM4WP) + Site Kit.

---

## 3. Content model (custom post types & taxonomies)

> **Verified against the WordPress admin (2026-06-27, full-admin login).** Counts below are live published-item counts from each `edit.php` screen — they supersede the earlier sitemap estimates. Field keys and taxonomies are read from the JetEngine post editor.

| Post type (slug) | URL base | Published | Purpose |
|---|---|---|---|
| **Doulas — premium** (`doulas-premium`) | `/doulas-premium/` | **87** | Full doula profiles (rich fields) |
| **Other doulas** (`other_doula`) | `/other_doula/` | **51** | Lighter doula listings (separate CPT) |
| **Therapists — premium** (`therapist-premium`) | `/therapist-premium/` | **17** | Counselor/therapist profiles |
| **Pregnancy blog** (`pregnancy-blog`) | `/pregnancy-blog/` | **114** | Articles + workshop (VOD) recordings |
| **Benefits / coupons** (`benefits`) | `/benefits/` | **30** | Partner discount cards |
| **Lead-to-birth** (`lead-to-birth`) | `/lead-to-birth/` | **27** | Week-by-week pregnancy content (week13–40) |
| **Courses** (`courses`) | `/courses/` | **10** | Course offerings |
| **Community** (`community`) | `/community/` | **9** | Meetup/event recaps (low migration value) |
| **Products** (`product`) | `/product/` | **26** | WooCommerce items (incl. test junk) |
| **Birth-preparation** | — | taxonomy | See below — it is a taxonomy, not a CPT |

### Taxonomies (used as JetSmartFilters facets on practitioners)
Verified term counts and **corrected meanings** (the earlier sitemap-based guess had `area_68` wrong):

| Taxonomy (slug) | Terms | What it actually is | Examples |
|---|---|---|---|
| `hospitals` | 26 | Hospitals the doula attends | איכילוב, אסותא אשדוד, אסף הרופא, בלינסון, הדסה עין כרם, וולפסון… |
| `area` | 8 | **Region / coverage** | אונליין, בית הלקוחה, דרום, חיפה, קליניקה, מרכז, צפון, שרון |
| `area_68` | 13 | **Practitioner type / specialization** | דולה מוסמכת, דולה לאחר לידה, מדריכת הכנה ללידה, יועצת הנקה, דיאטנית, אוסטאופתית, צלמת לידות… |
| `additional-trainings` | 34 | Certifications | אחות מוסמכת, NLP, איקוויליבריו, ביו-מכניקה של הלידה, יועצת שינה, היפנוברית'ינג, ליווי לאחר אובדן… |
| `additional-tools` | 25 | Methods **+ spoken languages** | דוברת אנגלית/ספרדית/רוסית כשפת אם, דיקור, הומאופתיה, מיינדפולנס, דמיון מודרך… |
| `birth-preperation` | 20 | Specific services offered | עיסוי תינוקות, FEMMA, רפלקסולוגיה, פרחי באך, רייקי, מטפלת לילה, מעגלי לידה… |

### 3.1 Professional profile — verified JetEngine meta fields
Real meta keys on the `doulas-premium` editor (English keys, Hebrew values):
- **Contact/social**: `adress`, `email`, `whatsapp` (+`whatsapp_copy`), `facebook`, `instagram`, `insta-1`, `insta-2`
- **Content blocks**: `introduction-meeting` (intro Zoom), `i-believe` (philosophy), `during-birth`, `after-birth`, `birth-support` (+`birth-support_photo`), `birthing-course`, `marketing-description`
- **FAQ**: `question` / `answer` (+`qampa`), via `repeater-template-1`
- **Testimonials**: `recommandation-1/2/3` + `recommandation-name-1/2/3` (also JetReviews plugin)
- **Media**: `banner`, `image-gallery`, `video`, `whatsapp-gallary`
- **Community link**: `whatsapp-group`
- **Ordering**: `order-team`, `position`
- Plus Yoast SEO meta per record.

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
