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

assert(designExists, "DESIGN.md must exist before visual migration code");
assert(base.includes('aria-controls="site-nav"'), "mobile nav toggle must control #site-nav");
assert(base.includes('id="site-nav"'), "site nav must expose #site-nav for mobile toggle");
assert(home.includes("hero-badge"), "home hero must restore a logo badge identity element");
assert(home.includes("hero-visual"), "home hero must include a visual brand composition");

process.stdout.write("visual contract passed\n");
