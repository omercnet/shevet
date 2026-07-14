#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { argv } from "node:process";
import { XMLParser } from "fast-xml-parser";

const opt = (name, def) => {
	const i = argv.indexOf(name);
	return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const dir = opt("--dir", ".");
const importer = readFileSync(join(new URL(".", import.meta.url).pathname, "import.mjs"), "utf8");
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "__cdata", trimValues: true });
const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const text = (v) => {
	if (v == null) return "";
	if (typeof v === "string") return v;
	if (typeof v === "object" && "__cdata" in v) return String(v.__cdata ?? "");
	if (typeof v === "object" && "#text" in v) return String(v["#text"] ?? "");
	return String(v);
};
const assert = (condition, message) => {
	if (!condition) throw new Error(message);
};
assert(!importer.includes('replace(/\\/$/, "/")'), "importer must not replace a trailing slash with itself");
const metaMap = (item) => {
	const out = {};
	for (const pm of arr(item["wp:postmeta"])) out[text(pm["wp:meta_key"])] = text(pm["wp:meta_value"]);
	return out;
};

const items = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".xml"))) {
	const xml = parser.parse(readFileSync(join(dir, file), "utf8"));
	items.push(...arr(xml?.rss?.channel?.item).map((item) => ({ item, file })));
}

const bySlug = new Map(items.map(({ item, file }) => [text(item["wp:post_name"]), { item, file, meta: metaMap(item) }]));
const requireMeta = (slug, key) => {
	const found = bySlug.get(slug);
	assert(found, `missing WXR sample ${slug}`);
	assert((found.meta[key] ?? "").trim().length > 20, `${slug} must have ${key} content`);
};

for (const slug of ["avira-neima", "chooseadoula", "whatdoesadoulado", "accompany"]) requireMeta(slug, "_content");
for (const slug of ["keren-eitan", "irit-angel"]) {
	requireMeta(slug, "_description");
	requireMeta(slug, "introduction-meeting");
	requireMeta(slug, "birthing-course");
	requireMeta(slug, "during-birth");
	requireMeta(slug, "after-birth");
	requireMeta(slug, "qampa");
}
for (const slug of ["head-to-toe", "deedoo", "stella", "urban-baby-wrap"]) {
	const found = bySlug.get(slug);
	assert(found, `missing benefit ${slug}`);
	assert(found.meta.link || found.meta.url || found.meta["product-detail"], `${slug} must expose benefit fields`);
}
for (const slug of ["26-1", "digitalmarketing", "march", "july"]) requireMeta(slug, "_content");
for (const slug of ["dao-shir-barash", "bio", "seminar", "henigold"]) requireMeta(slug, "_content");

const postTypes = new Set(items.map(({ item }) => text(item["wp:post_type"])));
for (const type of ["pregnancy-blog", "benefits", "community", "courses", "doulas-premium", "therapist-premium"]) {
	assert(postTypes.has(type), `WXR must include ${type}`);
}

for (const marker of ["_content", "community", "courses", "product-detail", "the-benefit", "benefit-code", "communityPage", "salePage", "_description", "marketing-description", "whatsapp_copy", "image-gallery", "video-cover", "3_copy", "qampa"]) {
	assert(importer.includes(marker), `importer must map ${marker}`);
}

process.stdout.write("import contract passed\n");
