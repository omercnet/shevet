# Shevet Imahot Design System

## 1. Atmosphere & Identity

Shevet Imahot feels intimate, warm, and handmade: a trusted pregnancy-and-birth community rather than a generic marketplace. The signature is the combination of Oron Yad handwriting, raspberry/cream warmth, and the pastel tribal zigzag from the logo.

## 2. Color

| Role | Token | Light | Usage |
|---|---|---|---|
| Brand primary | `--brand` | `#92003b` | Primary CTAs, links, accents, active states |
| Heading | `--heading` | `#3d3d3d` | Headings and linked card titles |
| Brand deep | `--brand-deep` | `#6e002d` | Deep text accents and shadows |
| Peach | `--peach` | `#fbcfac` | Warm accents, hero surfaces |
| Peach soft | `--peach-soft` | `#f8e1ce` | Soft panels and hover states |
| Cream | `--cream` | `#f4ece1` | Page background |
| Cream alt | `--cream-2` | `#f4f3f1` | Secondary background |
| Surface | `--surface` | `#ffffff` | Cards, forms, panels |
| Beige | `--beige` | `#cda88b` | Subtle separators |
| Apricot | `--apricot` | `#ffbc7d` | Logo-derived accent |
| Mint | `--mint` | `#cde9ca` | Logo-derived chip accent |
| Sky | `--sky` | `#bfe6f3` | Logo-derived chip accent |
| Gold | `--gold` | `#f2c84b` | Logo-derived chip accent |
| Ink | `--ink` | `#3f2230` | Strong body/nav text |
| Text | `--text` | `#565656` | Default body text |
| Muted | `--muted` | `#7a7a7a` | Secondary text |
| Line | `--line` | `#e7d9cb` | Borders and dividers |

Never add a new visual color before adding it here and to `web/src/styles/brand.css`.

## 3. Typography

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | `clamp(3rem, 8vw, 5.6rem)` | 400 | 1.05 | Homepage hero |
| H1/H2 | `clamp(2rem, 5vw, 3rem)` | 400 | 1.1 | Section headings |
| H3 | `1.5rem` | 400 | 1.2 | Card titles |
| Body large | `clamp(1.05rem, 2.4vw, 1.35rem)` | 400 | 1.65 | Hero/body lead |
| Body | `1rem` | 400 | 1.65 | Default copy |
| Label | `0.78rem` | 700 | 1.4 | Eyebrows, small labels |

Display font is `--display` (`Oron Yad`). Body/UI font is `--sans` (`Assistant` stack). Keep the site to these two families.

## 4. Spacing & Layout

Spacing follows a 4px base through rems. Use existing fluid clamps for section rhythm. Main content width is `--maxw: 1100px`. Mobile layouts must keep the header compact and preserve RTL line wrapping.

## 5. Components

### Header
- Structure: logo link, mobile menu button, `#site-nav` links.
- States: visible focus ring, hover color, mobile collapsed/expanded state.
- Accessibility: button uses `aria-controls="site-nav"` and toggles `aria-expanded`.

### Hero
- Structure: content column plus `hero-visual` brand composition.
- Visuals: logo/mark badge, soft cream/peach surfaces, pastel accents.
- Rule: no stock imagery placeholders. Use original assets only when available.

### Cards and Buttons
- Reuse `.card`, `.btn`, `.btn-outline`, `.chip` from `brand.css`.
- Interactive states use transform/opacity/color only.

### Filters and Directories
- Structure: `.filter-panel` above a `.grid` of `.directory-card` or `.article-card` items.
- States: focus rings on every form control; empty results use `.empty-state`.

### Profile and Content Pages
- Structure: `.profile-shell`, `.media-frame`, `.article-shell`, or `.sale-hero` according to page type.
- WhatsApp and purchase CTAs keep `.btn` variants and must remain real links.

## 6. Motion & Interaction

Use 180-300ms transitions for hover/toggle states. Animate only `transform`, `opacity`, `filter`, or color. Respect `prefers-reduced-motion`.

## 7. Depth & Surface

Depth strategy is warm tonal layering with restrained raspberry-tinted shadows. Surfaces should feel tactile and handmade, not glossy SaaS.
