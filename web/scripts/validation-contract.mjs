import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const exists = (path) => existsSync(join(root, path));
const assert = (condition, message) => {
	if (!condition) throw new Error(message);
};

const requiredRoutes = ["welcome", "team", "privacy", "terms", "accessibility"];
for (const route of requiredRoutes) {
	assert(exists(`web/src/pages/${route}.astro`), `missing required static route /${route}/`);
}

const netlify = read("netlify.toml");
for (const [from, to] of [
	["/doulas-premium/*", "/doulas/:splat"],
	["/therapist-premium/*", "/professionals/:splat"],
	["/pregnancy-blog/*", "/articles/:splat"],
	["/tribal-council/", "/community/"],
	["/whatsapp-groups/", "/community/"],
	["/team-shevet/", "/team/"],
	["/privacy-policy/", "/privacy/"],
	["/terms-of-use/", "/terms/"],
]) {
	assert(netlify.includes(`from = "${from}"`), `missing Netlify redirect from ${from}`);
	assert(netlify.includes(`to = "${to}"`), `redirect from ${from} must preserve/target ${to}`);
}
assert(netlify.includes('from = "/favicon.ico"'), "missing /favicon.ico fallback redirect");

assert(exists("web/src/lib/contact.ts"), "missing shared contact URL helper");
const contact = exists("web/src/lib/contact.ts") ? read("web/src/lib/contact.ts") : "";
for (const marker of ["whatsappHref", "telHref", "mailtoHref", "instagramHref", "972"]) {
	assert(contact.includes(marker), `contact helper must include ${marker}`);
}
const { whatsappHref } = await import("../src/lib/contact.ts");
assert(
	whatsappHref("https://wa.me/972547756296?text=hello", "0547756296") === "https://wa.me/972547756296?text=hello",
	"WhatsApp helper must preserve WordPress click-to-chat links with opening text",
);
assert(
	whatsappHref(undefined, "054-775-6296") === "https://wa.me/972547756296",
	"WhatsApp helper must fall back to normalized phone",
);
for (const sourcePath of [
	"web/src/layouts/Base.astro",
	"web/src/pages/doulas/index.astro",
	"web/src/pages/professionals/index.astro",
	"web/src/pages/doulas/[slug].astro",
	"web/src/pages/professionals/[slug].astro",
]) {
	assert(!read(sourcePath).includes("replace(/\\D/g"), `${sourcePath} must not inline digit-stripping contact links`);
}

const base = read("web/src/layouts/Base.astro");
assert(base.includes("AccessibilityToolbar"), "layout must expose accessibility toolbar");
assert(
	base.includes("/privacy/") && base.includes("/terms/") && base.includes("/accessibility/"),
	"footer must link legal pages",
);
assert(base.includes("/welcome/") && base.includes("/team/"), "footer must link required static pages");

for (const indexPage of ["web/src/pages/doulas/index.astro", "web/src/pages/professionals/index.astro"]) {
	const source = read(indexPage);
	for (const marker of ["whatsappHref", "telHref", "mailtoHref", "instagramHref", "contact-links"]) {
		assert(source.includes(marker), `${indexPage} must render ${marker} for directory cards`);
	}
}

for (const profile of ["web/src/pages/doulas/[slug].astro", "web/src/pages/professionals/[slug].astro"]) {
	const source = read(profile);
	assert(source.includes("ContactForm"), `${profile} must render practitioner lead form`);
	assert(source.includes("contact-links"), `${profile} must render practitioner contact channels`);
	assert(source.includes("whatsappHref"), `${profile} must use normalized WhatsApp helper`);
}

const community = read("web/src/pages/community/index.astro");
assert(community.includes("community-signup"), "community page must include signup fallback");
assert(community.includes('name="email"'), "community signup must capture email");
assert(community.includes("dueDate"), "community signup must capture due date");
assert(community.includes("נשים בלבד"), "community page must include women-only gating copy");
assert(community.includes("whatsappHref"), "community page must expose valid WhatsApp routing when site phone exists");
assert(
	community.includes("0542473799"),
	"community page must keep documented WhatsApp fallback when CMS settings are empty",
);

const article = read("web/src/pages/articles/[slug].astro");
assert(article.includes("workshop-registration"), "workshop article pages must include registration form fallback");

const benefits = read("web/src/pages/benefits/index.astro");
assert(benefits.includes("normalizeBenefitCategory"), "benefits page must normalize legacy category values");
assert(
	benefits.includes("inferBenefitCategory"),
	"benefits page must infer category from uncategorized imported content",
);

process.stdout.write("validation contract passed\n");
