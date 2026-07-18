import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => {
	if (!condition) throw new Error(message);
};

const designExists = existsSync(join(root, "DESIGN.md"));
const base = read("web/src/layouts/Base.astro");
const home = read("web/src/pages/index.astro");
const brand = read("web/src/styles/brand.css");
const accessibility = read("web/src/components/AccessibilityToolbar.astro");
const targetPages = [
	"web/src/pages/index.astro",
	"web/src/pages/doulas/index.astro",
	"web/src/pages/professionals/index.astro",
	"web/src/pages/articles/index.astro",
	"web/src/pages/doulas/[slug].astro",
	"web/src/pages/professionals/[slug].astro",
	"web/src/pages/articles/[slug].astro",
	"web/src/pages/benefits/index.astro",
	"web/src/pages/community/index.astro",
	"web/src/pages/doulas/join.astro",
	"web/src/pages/courses/[slug].astro",
];
const page = (path) => read(path);

assert(designExists, "DESIGN.md must exist before visual migration code");
assert(base.includes('aria-controls="site-nav"'), "mobile nav toggle must control #site-nav");
assert(base.includes('id="site-nav"'), "site nav must expose #site-nav for mobile toggle");
assert(home.includes("hero-badge"), "home hero must restore a logo badge identity element");
assert(home.includes("hero-visual"), "home hero must include a visual brand composition");
assert(home.includes("/brand/old-home-hero.avif"), "home hero must use the original photo-led hero image");
assert(home.includes("hero-photo"), "home hero must use the old full-bleed photo layout");
assert(home.includes('<p class="hero-eyebrow">שבט אמהות</p>'), "home hero must lead with the old-site brand title");
assert(home.includes("/brand/old-mark.png"), "home hero badge must use the old circular mark asset");
assert(!home.includes("hero-note"), "home hero must not use pastel note bubbles");
assert(base.includes("/brand/old-logo.png"), "header logo must use the old WordPress logo asset");
assert(base.includes("head-actions"), "header must keep the old social/account icon cluster shape");
assert(base.includes('aria-label="Instagram"'), "header action cluster must use icon links, not placeholder letters");
assert(base.includes('aria-label="Facebook"'), "header action cluster must include the old Facebook-style icon slot");
assert(base.includes("right:1rem"), "mobile hamburger must sit on the old physical right side");
for (const label of ["נבחרת הדולות", "נבחרת היועצות והמטפלות", "קבוצות הווטסאפ"]) {
	assert(base.includes(label), `header must keep old-site nav label ${label}`);
}
assert(!base.includes("<ZigZag />"), "global header must not add a decorative zigzag strip over the old photo hero");
assert(base.includes("nav-toggle-lines"), "mobile header must use an icon-like menu button, not a text pill");
assert(home.includes("order: 1"), "old-site hero text must appear above the centered logo badge");
assert(!home.includes("<br />"), "desktop hero support line should not be forced into redesigned breaks");
assert(home.includes("max-width: 1320px"), "desktop hero text must have old-site wide line room");
assert(home.includes("rgba(0, 0, 0, 0.42)"), "hero photo must keep the old darker grey overlay mood");
assert(accessibility.includes("left:.75rem"), "accessibility trigger should sit on the old physical left edge");
assert(accessibility.includes("bottom:1rem"), "accessibility trigger should sit near the old lower toolbar position");
assert(accessibility.includes('content:"♿"'), "accessibility trigger should render as a compact wheelchair tab");
for (const marker of [
	".hero::before",
	".hero-visual::before",
	".hero-visual::after",
	".hero-badge::after",
	".pillar::before",
]) {
	assert(home.includes(marker), `home page must include polish marker ${marker}`);
}

for (const marker of [
	"--heading",
	"--surface",
	"--shadow-soft",
	"--shadow-lift",
	"body::before",
	".card::before",
	".card:focus-within",
	".btn:active",
	".filter-panel::before",
	"filter-panel",
	"directory-card",
	"article-card",
	"profile-shell",
	"media-frame",
	"article-shell",
	"benefit-card",
	"community-card",
	"join-flow",
	"sale-hero",
	"empty-state",
]) {
	assert(brand.includes(marker), `brand.css must define ${marker}`);
}

const requiredPageMarkers = new Map([
	["web/src/pages/doulas/index.astro", ["filter-panel", "directory-card"]],
	["web/src/pages/professionals/index.astro", ["filter-panel", "directory-card"]],
	["web/src/pages/articles/index.astro", ["filter-panel", "article-card"]],
	["web/src/pages/doulas/[slug].astro", ["profile-shell", "bioBlocks"]],
	["web/src/pages/professionals/[slug].astro", ["profile-shell", "bioBlocks"]],
	["web/src/pages/articles/[slug].astro", ["article-shell", "LegacyContent"]],
	["web/src/pages/benefits/index.astro", ["benefit-card"]],
	["web/src/pages/community/index.astro", ["community-card"]],
	["web/src/pages/doulas/join.astro", ["join-flow"]],
	["web/src/pages/courses/[slug].astro", ["sale-hero"]],
]);

const doulaDetail = page("web/src/pages/doulas/[slug].astro");
assert(doulaDetail.includes("data-video-cover"), "doula video cover must be an in-frame overlay control");
assert(
	doulaDetail.includes("data-video-src"),
	"doula video iframe must receive its playable src from the overlay control",
);
assert(
	!doulaDetail.includes('<img class="video-cover"'),
	"doula video cover must not render as a separate image link below the player",
);

for (const [path, markers] of requiredPageMarkers) {
	const source = page(path);
	for (const marker of markers) assert(source.includes(marker), `${path} must use ${marker}`);
}

for (const path of targetPages) {
	const matches = page(path).match(/#[0-9a-f]{3,8}\b/gi) ?? [];
	assert(matches.length === 0, `${path} must not hardcode colors: ${matches.join(", ")}`);
}

process.stdout.write("visual contract passed\n");
