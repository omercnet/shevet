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

for (const [path, markers] of requiredPageMarkers) {
	const source = page(path);
	for (const marker of markers) assert(source.includes(marker), `${path} must use ${marker}`);
}

for (const path of targetPages) {
	const matches = page(path).match(/#[0-9a-f]{3,8}\b/gi) ?? [];
	assert(matches.length === 0, `${path} must not hardcode colors: ${matches.join(", ")}`);
}

process.stdout.write("visual contract passed\n");
