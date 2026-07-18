# Design review — new Astro site vs. the original shevet-imahot.co.il

> Comparative review captured 2026-07-18. Method: full-page desktop (1440px) and mobile
> (390px) screenshots of both sites (original `shevet-imahot.co.il`, new
> `shevetimahot.netlify.app`), plus extraction of the original's Elementor kit CSS
> (`post-21.css`, header `post-30165.css`, homepage `post-24028.css`).
> Goal: a prioritized plan to make the new site *feel* like the original, within the
> locked scope in `ARCHITECTURE.md` §0 and the token system in `DESIGN.md`.

---

## 1. The original site's design principles (what actually carries the identity)

Observed consistently across home, doula/therapist directories, blog ("חוכמת השבט"),
benefits ("הטבות"), and WhatsApp community ("מועצת השבט"):

1. **Watercolor page banners on every inner page.** A soft peach/pink watercolor wash,
   a large hand-drawn line illustration matched to the section (ultrasound scan for
   doulas, book + fetus for articles, gift boxes for benefits, joined hands + phone for
   community), scattered **tipi/tent motifs** (the logo's tent, echoed as decoration),
   and a huge **Oron Yad** title in dark slate. This banner is the single strongest
   identity carrier on the old site — and the new site has nothing in its place.
2. **Oron Yad handwriting used far beyond H1s.** Nav items, doula names on cards,
   article titles on cards, benefit partner names, and form headings ("עזרו לי למצוא
   את האחת שלי", "מוזמנות ליצור איתנו קשר") are all handwritten. Body/UI text is
   Assistant. The constant interleaving of handwriting with clean UI text is the
   "handmade" feel named in `DESIGN.md` §1.
3. **A three-color interactive palette, not raspberry-first.** On the live old site,
   buttons are **dark slate rectangles** (`#565656`, small ~4px radius, white text,
   usually with a small line icon: ⊕ "לפרטים נוספים", gift "לפרטים על ההטבה") and
   **peach** (`#FBCFAC`) marks the *selected/primary* state (active tab pill, filter
   submit "חפשו לי את האחת", footer form submit). Raspberry `#92003b` exists in the
   brand but is scarce in the old UI chrome. The new site paints nearly every control
   raspberry, which reads more "SaaS primary color" and less like the original.
4. **Peach radial-gradient CTA panels with hand-drawn line icons.** Home pillars and
   the WhatsApp-group rows are peach gradient surfaces with a large thin-line icon
   (search-document, WhatsApp, laptop, gift; pregnant-figure icons on the groups page),
   an Assistant-bold title, muted body copy, and a dark slate button.
5. **Quiet cards.** White, ~10px radius, hairline border, gentle shadow, centered
   content, one action. Doula photos are cropped in an **arch/oval** (rounded-top)
   mask, not a circle. Text hierarchy on a card: handwritten name → Assistant
   specializations (2–3 lines) → dark button.
6. **Right-hand filter sidebar** on directories and the blog: a white rounded panel
   with a heading, "** לא חובה לסמן" hint, dropdown/checkbox list, and a peach submit
   button. Filters feel like a helper, not a toolbar.
7. **A warm conversion footer on every page.** Handwritten "מוזמנות ליצור איתנו קשר",
   circular peach icon medallions (email, קרן/Instagram, עירית/Instagram), an inline
   one-row contact form (name/phone/email/message + consent checkbox + peach submit),
   then a thin dark strip with legal links. The page never ends cold.
8. **Header with life in it:** logo right, nav items *in Oron Yad* with a peach active
   underline, and on the left — Facebook/Instagram icons and "התחברות". (Login is out
   of scope for the rebuild; the social icons are not.)
9. **Matchmaking form as a page-level feature.** The doulas directory ends in a big
   peach panel: handwritten title "עזרו לי למצוא את האחת שלי", explanatory copy, a
   grid of rounded inputs (name/phone/email/city/care-field/due-date/hospital +
   free text), consent checkbox, wide dark submit. This is a core conversion element
   (JetFormBuilder "טופס לידים דולות" → Responder in the rebuild).
10. **Photography restraint.** One full-bleed warm photo hero on the homepage (white
    handwritten title + subtitle with heavy soft text-shadow, round logo badge).
    Inner pages use watercolor banners instead of photos.

## 2. What the new site already gets right

- Brand tokens (raspberry/peach/cream, Oron Yad + Assistant) are in place and the
  cream ground + soft radial washes feel appropriately warm.
- Homepage hero is structurally faithful: same photo, big Oron Yad title, logo badge,
  and the zigzag divider is a nice pull from the logo.
- Directory pages are functionally *better*: real faceted search (hospital/due-date/
  style/budget), result counts, visible contact links, WhatsApp deep links.
- RTL, accessibility toolbar, mobile menu, and reduced-motion handling are solid.
- Cards/chips/buttons form a coherent system (`brand.css`) — the problem is calibration
  against the original, not absence of a system.

## 3. Gap analysis (ordered by impact on "feels like the original")

| # | Area | Original | New site | Severity |
|---|---|---|---|---|
| G1 | Inner-page banners | Watercolor wash + line illustration + tipi motifs + huge Oron Yad title | Bare handwritten title on cream | **High** |
| G2 | Footer | Handwritten contact heading, peach icon medallions, inline contact form, dark legal strip | One-line footer with text links | **High** |
| G3 | Button language | Dark-slate rect + icon (default), peach (selected/submit) | Raspberry pills everywhere | **High** |
| G4 | Handwriting reach | Nav, card titles/names, form headings | H1s/eyebrows only; card titles are Assistant bold | **High** |
| G5 | Doulas matchmaking form | "עזרו לי למצוא את האחת שלי" peach panel at directory end | Absent | **High** (conversion, already in scope per spec §5.2) |
| G6 | Doula card anatomy | Arch-mask photo, handwritten name, 1 dark button | Circle photo, Assistant name, 4 contact links + chips + arrow link | Medium |
| G7 | Peach gradient CTA panels w/ line icons | Home pillars, WhatsApp group rows | White cards with colored top borders / plain cards | Medium |
| G8 | Header | Oron Yad nav, peach active underline, social icons | Assistant nav, no active state, no socials | Medium |
| G9 | Card copy discipline | Short excerpt + "המשיכי לקרוא" button | Full-paragraph excerpts → ragged card heights (articles, benefits, home) | Medium |
| G10 | Benefits card | Circular white logo medallion, handwritten partner, centered | Rect photo, long copy, raspberry button | Medium |
| G11 | Community page | Peach gradient rows per group with pregnancy line icons | Plain empty state + meetup-recap cards showing literal `<BR>` in titles | Medium (the `<BR>` is a **content bug** — importer should strip/convert it) |
| G12 | Home hero details | White subtitle w/ strong shadow; badge overlaps hero bottom edge into next section | Peach subtitle, badge floats mid-hero | Low |
| G13 | Card geometry | ~10px radius, hairline border | 24px radius + soft-light overlay + lift | Low (taste; 24px reads more "modern SaaS") |

Deliberate, keep-as-is deviations: client-side faceted search, contact links on cards
(conversion win), zigzag divider, Meshulam/Responder integration points, accessibility
toolbar. Do not regress these while restyling.

## 4. Prioritized plan

Each phase is shippable on its own. Run `cd web && npm run check && npm run build &&
npm run lint` per phase; add `npm run parity:samples` + `npm run content:contract`
where content shape is touched.

### Phase 1 — Global chrome (G2, G3, G4, G8) · biggest payoff, smallest surface

1. **Footer rebuild** in `web/src/layouts/Base.astro`:
   - Handwritten section title "מוזמנות ליצור איתנו קשר" (Oron Yad, `--heading`).
   - Circular peach medallions for email + the two Instagram contacts, from
     `getSiteSettings()` via `web/src/lib/contact.ts` helpers only.
   - Contact form: embed/link Responder (per locked scope, do **not** store
     submissions). Until the Responder embed code exists, render the styled form
     shell linking to mail/WhatsApp so the visual language ships now.
   - Thin dark (`--ink`-derived) legal strip: "כל הזכויות שמורות לשבט אמהות",
     accessibility statement, privacy.
2. **Button system** in `web/src/styles/brand.css`:
   - Add `.btn-slate` (background `#565656`, white text, 4–6px radius, optional
     inline SVG icon slot) and use it for card-level actions ("לפרטים נוספים",
     "המשיכי לקרוא", "לפרטים על ההטבה").
   - Keep raspberry `.btn` for the few *primary* conversions (join CTA, sale pages);
     keep peach for selected states and form submits (matches old + `DESIGN.md`).
   - Add the slate value to `DESIGN.md` §2 before use (repo rule).
3. **Header** in `Base.astro`: nav links in `var(--display)` at a legible size
   (~1.25rem; the old site's 1.1vw is too fragile), peach underline on the active
   route (`Astro.url.pathname` match), Instagram/Facebook icons from site settings.
4. **Handwriting reach**: card titles for articles/benefits and practitioner names
   switch to `var(--display)`; keep specializations/excerpts in Assistant.
   (Type scale note: Oron Yad at card size needs ~1.6–1.9rem to stay legible.)

### Phase 2 — Page banners (G1) · the signature move

1. New component `web/src/components/PageBanner.astro`:
   props `title`, `illustration`, optional `subtitle`. Renders a full-width band:
   watercolor background, tipi motifs, line illustration on one side, Oron Yad title.
2. Assets: the watercolor textures and line icons on the old site are the client's
   own uploads — harvest via the WXR/uploads pass (never commit anything with
   practitioner PII), or recreate: a soft-blur multi-stop radial watercolor is
   achievable in pure CSS; tipi + section illustrations as small inline SVGs
   (ultrasound, book+fetus, gifts, hands, phone). SVG recreation keeps the repo
   asset-light and retina-clean — recommended.
3. Apply to doulas, professionals, articles, benefits, community + legal pages.

### Phase 3 — Directory & conversion surfaces (G5, G6, G7)

1. **Matchmaking panel** on `/doulas/`: peach panel, handwritten title "עזרו לי
   למצוא את האחת שלי", Responder-embedded lead form (the old site's field set:
   name/email/phone/city/care-field/due-date/hospital/free-text + consent).
   Component `MatchmakingForm.astro`; reuse on `/professionals/` with adjusted copy.
2. **Doula/professional cards**: arch mask for photos
   (`border-radius: 50% 50% 12px 12px / 40% 40% 12px 12px` or `clip-path`),
   handwritten name, collapse the contact-link row into one WhatsApp button + one
   slate "לפרטים נוספים" (full contact stays on the profile page). Keep chips.
3. **Home pillars** → peach radial-gradient panels with line icons (reuse the
   Phase 2 SVG set) + slate buttons, replacing colored top-borders.
4. **Community page**: WhatsApp group rows as peach gradient bands (icon +
   handwritten group name + slate join button); fix the importer to strip literal
   `<BR>`/tags from titles (`tools/import/import.mjs`) and re-run; adjust
   `web/scripts/*-contract.mjs` if title shape assertions exist.

### Phase 4 — Card discipline & polish (G9, G10, G12, G13)

1. Clamp excerpts (`-webkit-line-clamp: 3`) on article/benefit/home cards; give
   article cards a slate "המשיכי לקרוא" button.
2. Benefits: circular white logo medallion (fixed size, `object-fit: contain`,
   subtle ring), handwritten partner name, discount line, slate button w/ gift icon.
3. Home hero: subtitle to white with the original's soft heavy shadow; pull the
   badge down so it straddles the hero's bottom edge (negative margin into the
   next section, like the original).
4. Optional taste pass with Keren: card radius 24px → ~14px, softer hover lift.

## 5. Content bugs noticed during review (not design, still user-visible)

- Community meetup titles render literal `<BR>` (e.g. "מפגש קהילה ינואר 2024 <BR>...").
- Several imported article titles carry event metadata ("| 25.6.26 | 20:30 בזום") —
  consider a cleanup pass or a `workshop` display treatment with a date field.
- Community index shows "אין קבוצות עדיין" — WhatsApp groups content not yet in
  Sanity; the section will look broken to Keren until seeded.

## 6. Open questions for Keren (blocking pieces of this plan)

1. Responder embed codes for (a) the doula matchmaking form and (b) the footer
   contact form — Phase 1/3 ship with styled placeholders until then.
2. Are the watercolor banner + line-icon illustrations licensed assets we can copy
   from the old uploads, or should we recreate them as SVG? (Plan assumes recreate.)
3. Confirm the button-color rebalance (slate default / peach selected / raspberry
   reserved for primary conversions) — it matches the old site but differs from the
   current all-raspberry new build.
4. Social links for the header/footer (Instagram ×2, Facebook) — confirm the
   canonical URLs to store in site settings.

---

*Regenerating the evidence: screenshots were taken with the pre-installed Chromium via
playwright-core at 1440px/390px over both sites' key pages (home, doulas, therapists/
professionals, blog/articles, benefits, whatsapp/community). In the remote environment
Chromium must be launched with `proxy: { server: process.env.HTTPS_PROXY }` and
`--disable-features=EncryptedClientHello,UseMLKEM,PostQuantumKyber --ssl-version-max=tls1.2`
to get through the egress proxy.*
