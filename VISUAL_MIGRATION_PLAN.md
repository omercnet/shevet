# Shevet Imahot visual migration plan

## Evidence used

- Original WordPress: `https://shevet-imahot.co.il/`
- Current deploy: `https://shevetimahot.netlify.app/`
- Current local main after pull: `34eefb5`
- Screenshots: `.sisyphus/visual-audit/original-*.png`, `deploy-*.png`, `local-*.png`
- Code: `web/src/styles/brand.css`, `web/src/layouts/Base.astro`, `web/src/pages/index.astro`, `web/src/components/ZigZag.astro`

## Current gap

The pulled main is closer than the deploy: real logo assets are back, the pastel zigzag motif exists, and the raspberry/peach/cream tokens match the documented brand. The large remaining gap is mood. Original WordPress feels photo-led, intimate, workshop/community-first. Local main feels cleaner and faster, but more like a search product: flat beige hero, utility nav, CTA-forward layout, and no mobile hamburger.

## Migration target

Keep the Astro/Sanity rebuild and the search-first product strategy, but restore the original identity:

- full-bleed emotional homepage hero, preferably using the original pregnancy/community photo treatment
- Oron Yad as expressive display type, not only a heading font
- cream/raspberry/peach base with pastel logo accents as secondary chips/borders
- delicate top navigation with real logo, social/contact presence, and mobile hamburger
- homepage content arc from the old site: welcome, professional directory, WhatsApp/community, articles/workshops, benefits, professional join/contact

## Work order

1. **Lock design system**
   - Add `DESIGN.md` before UI edits.
   - Document tokens already in `brand.css`: Oron Yad, Assistant, raspberry `#92003b`, peach `#FBCFAC`, cream `#F4ECE1`, beige `#CDA88B`, pastel zigzag accents.
   - Add rules for hero imagery, logo usage, section rhythm, cards, chips, CTAs, and mobile nav.

2. **Fix global shell first**
   - `web/src/layouts/Base.astro`: add skip link, mobile hamburger, active nav style, footer contact/social/legal slots.
   - Keep native CSS. No JS framework, no new dependency.
   - Mobile acceptance: header height no longer dominates first viewport; nav collapses under 768px.

3. **Restore homepage identity**
   - `web/src/pages/index.astro`: replace flat product hero with photo-led or image-backed hero plus logo/badge treatment.
   - Keep the two search CTAs, but style them inside the original emotional composition.
   - Rebuild missing old-home sections in order: welcome, directory/search, WhatsApp community, knowledge/articles, benefits, professional join/contact.

4. **Unify shared components**
   - Keep `ZigZag.astro` as the decorative divider.
   - Extract only repeated patterns used 2+ times: section heading, card, CTA row, chip list.
   - Do not build a component library before repetition proves it.

5. **Carry brand into search pages**
   - Prioritize `/doulas/` and `/professionals/` because architecture says search is the centerpiece.
   - Replace generic cards/forms with branded panels: cream surfaces, raspberry labels, pastel facet chips, clearer Hebrew RTL spacing.

6. **Polish profile conversion pages**
   - `/doulas/[slug]`: preserve conversion pieces: video, reviews, sticky WhatsApp CTA.
   - Make profile pages feel like trusted personal recommendations, not marketplace listings.

7. **Asset migration**
   - First choice: reuse original WP uploaded imagery via SSH/WP CLI or XML import assets.
   - If original hero assets are unavailable, use current logo/mark and cream/pastel motif without stock-photo placeholders.
   - Add missing original images to Sanity or `web/public/brand/` only when they are brand-level assets.

8. **QA gates**
   - Run through `mise exec -- npm --prefix web run check` and `mise exec -- npm --prefix web run build`.
   - Browser screenshots at 390, 768, 1280 against original reference.
   - Check mobile nav, hero crop, RTL wrapping, focus states, hover states, and footer links.

## First patch recommendation

Smallest useful first patch: `DESIGN.md` + mobile header/nav in `Base.astro` + homepage hero treatment in `index.astro`. That fixes the biggest visual mismatch without touching search logic.
