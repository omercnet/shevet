import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const assert = (condition, message) => {
	if (!condition) throw new Error(message);
};

const queries = read("web/src/lib/queries.ts");
const importScript = read("tools/import/import.mjs");

assert(importScript.includes('"community"'), "importer must map community post type");
assert(importScript.includes('"courses"'), "importer must map courses post type");
assert(importScript.includes("_content"), "importer must read legacy _content HTML");
assert(queries.includes("getBenefitSlugs"), "web must query benefit detail slugs");
assert(queries.includes("getCommunityPageSlugs"), "web must query community detail slugs");
assert(
	read("web/src/pages/benefits/[slug].astro").includes("LegacyContent"),
	"benefit detail route must render legacy content",
);
assert(
	read("web/src/pages/community/[slug].astro").includes("LegacyContent"),
	"community detail route must render legacy content",
);
assert(
	read("web/src/pages/articles/[slug].astro").includes("LegacyContent"),
	"article detail route must render legacy content",
);
assert(read("web/src/pages/doulas/[slug].astro").includes("bioBlocks"), "profile pages must render imported bio");
for (const path of [
	"web/src/pages/doulas/index.astro",
	"web/src/pages/professionals/index.astro",
	"web/src/pages/articles/index.astro",
	"web/src/pages/benefits/index.astro",
]) {
	const source = read(path);
	assert(source.includes(".map(("), `${path} must server-render initial cards, not only client JS`);
	assert(
		!source.includes('<div class="grid" id="results"></div>'),
		`${path} must not ship an empty initial results grid`,
	);
}
{
	const homePage = read("web/src/pages/index.astro");
	assert(
		homePage.includes("getDoulas") && homePage.includes("getProfessionals"),
		"home page must surface imported directory content",
	);
}
assert(
	read("web/src/pages/community/index.astro").includes("getCommunityPages"),
	"community index must surface imported community pages",
);
assert(
	read("web/src/pages/courses/[slug].astro").includes("LegacyContent"),
	"course pages must render imported legacy content",
);

process.stdout.write("content contract passed\n");
