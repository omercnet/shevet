#!/usr/bin/env node
// Import the WordPress WXR export into Sanity.
//
//   node import.mjs --dir ../../../wxr [--dry-run] [--no-images]
//
// Env (required unless --dry-run):
//   SANITY_PROJECT_ID  (default cuxqs66c)
//   SANITY_DATASET     (default production)
//   SANITY_TOKEN       a Sanity WRITE token (Editor). Create at manage.sanity.io.
//
// Idempotent: each doc gets a deterministic _id, so re-running upserts (createOrReplace).

import { readFileSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { argv, env, exit } from "node:process";
import { createClient } from "@sanity/client";
import { XMLParser } from "fast-xml-parser";

// ---------- args ----------
const args = argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, def) => {
	const i = args.indexOf(name);
	return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const DRY = flag("--dry-run");
const WITH_IMAGES = !flag("--no-images") && !DRY;
const WXR_DIR = opt("--dir", join(import.meta.dirname ?? ".", "wxr"));

// ---------- which WXR file maps to which doc kind ----------
const FILE_KIND = {
	"doulas-premium": { type: "practitioner", tier: "premium", isDoula: true },
	other_doula: { type: "practitioner", tier: "index", isDoula: true },
	"therapist-premium": { type: "practitioner", tier: "premium", isProfessional: true },
	"pregnancy-blog": { type: "article" },
	benefits: { type: "benefit" },
};

// Hebrew language terms seen in the `additional-tools` taxonomy.
const LANG_HINTS = [
	["אנגלית", "אנגלית"],
	["ספרדית", "ספרדית"],
	["רוסית", "רוסית"],
	["ערבית", "ערבית"],
	["צרפתית", "צרפתית"],
	["אמהרית", "אמהרית"],
];

// ---------- parsing helpers ----------
const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	cdataPropName: "__cdata",
	trimValues: true,
});

const text = (v) => {
	if (v == null) return "";
	if (typeof v === "string") return v;
	if (typeof v === "object" && "__cdata" in v) return String(v.__cdata ?? "");
	if (typeof v === "object" && "#text" in v) return String(v["#text"] ?? "");
	return String(v);
};
const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const keyed = (items) => items.map((o, i) => ({ _key: `k${i}`, ...o }));

function metaMap(item) {
	const m = {};
	for (const pm of arr(item["wp:postmeta"])) {
		m[text(pm["wp:meta_key"])] = text(pm["wp:meta_value"]);
	}
	return m;
}

// categories grouped by taxonomy domain -> [names]
function terms(item) {
	const out = {};
	for (const c of arr(item.category)) {
		if (typeof c !== "object") continue;
		const domain = c["@_domain"];
		const name = text(c["#text"] ?? c.__cdata ?? c);
		if (!domain || !name) continue;
		(out[domain] ??= []).push(name);
	}
	return out;
}

// crude HTML -> Portable Text (paragraph blocks). Keren refines in Studio.
function toBlocks(html) {
	if (!html) return undefined;
	const paras = String(html)
		.replace(/<br\s*\/?>/gi, "\n")
		.split(/<\/p>|\n{2,}/i)
		.map((p) => p.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim())
		.filter(Boolean);
	if (!paras.length) return undefined;
	return keyed(
		paras.map((t) => ({
			_type: "block",
			style: "normal",
			markDefs: [],
			children: [{ _type: "span", text: t, marks: [] }],
		})),
	);
}

const slugify = (s) =>
	String(s)
		.toLowerCase()
		.trim()
		.replace(/[^\w֐-׿-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 90) || "x";

// Sanity _id must match /^[a-zA-Z0-9._-]+$/ — Hebrew is not allowed. Fall back to a
// deterministic hash when the slug isn't ASCII-safe (e.g. Hebrew taxonomy names).
function hash(s) {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
	return (h >>> 0).toString(36);
}
function asciiId(s) {
	const a = String(s)
		.replace(/[^a-zA-Z0-9._-]/g, "")
		.replace(/[-._]{2,}/g, "-")
		.replace(/^[-._]+|[-._]+$/g, "");
	// Must contain an alphanumeric char; otherwise fall back to a hash.
	return /[a-zA-Z0-9]/.test(a) && a.length >= 2 ? a : `x${hash(String(s))}`;
}

// ---------- term doc collection (hospital / field / region) ----------
const termDocs = new Map(); // _id -> doc
function termRef(kind, name) {
	const _id = `${kind}.${asciiId(name)}`;
	if (!termDocs.has(_id)) {
		termDocs.set(_id, { _id, _type: kind, name, slug: { _type: "slug", current: slugify(name) } });
	}
	return { _type: "reference", _ref: _id, _key: asciiId(name) };
}

// ---------- per-item mappers ----------
function mapPractitioner(item, cfg) {
	const name = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || name);
	const m = metaMap(item);
	const t = terms(item);

	const languages = [];
	const credentials = [];
	for (const tool of t["additional-tools"] ?? []) {
		const lang = LANG_HINTS.find(([h]) => tool.includes(h));
		if (lang) languages.push(lang[1]);
		else credentials.push(tool);
	}
	for (const tr of t["additional-trainings"] ?? []) credentials.push(tr);

	const fields = [...(t.area_68 ?? []), ...(t["birth-preperation"] ?? [])].map((n) => termRef("field", n));
	const hospitals = (t.hospitals ?? []).map((n) => termRef("hospital", n));
	const regions = (t.area ?? []).map((n) => termRef("region", n));

	const testimonials = keyed(
		[1, 2, 3]
			.map((i) => ({ quote: m[`recommandation-${i}`], author: m[`recommandation-name-${i}`] }))
			.filter((x) => x.quote)
			.map((x) => ({ author: x.author || "", quote: x.quote })),
	);

	const bioHtml = [m["i-believe"], m["during-birth"], m["after-birth"], m["birth-support"]].filter(Boolean).join("\n\n");

	return {
		_id: `practitioner.${asciiId(slug)}`,
		_type: "practitioner",
		name,
		slug: { _type: "slug", current: slug },
		title: m.position || undefined,
		tier: cfg.tier ?? "index",
		isDoula: !!cfg.isDoula,
		isProfessional: !!cfg.isProfessional || fields.length > 0,
		videoUrl: m.video || undefined,
		phone: m.phone || undefined,
		whatsapp: m.whatsapp || undefined,
		email: m.email || undefined,
		instagram: m.instagram || undefined,
		adress: m.adress || undefined,
		hospitals: hospitals.length ? hospitals : undefined,
		regions: regions.length ? regions : undefined,
		fields: fields.length ? fields : undefined,
		languages: languages.length ? [...new Set(languages)] : undefined,
		credentials: credentials.length ? credentials : undefined,
		bio: toBlocks(bioHtml),
		testimonials: testimonials.length ? testimonials : undefined,
		published: text(item["wp:status"]) === "publish",
		// NOTE: supportStyle + budget had no equivalent in WP — Keren sets these in Studio.
		_thumbId: m._thumbnail_id || undefined,
	};
}

function mapArticle(item) {
	const name = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || name);
	return {
		_id: `article.${asciiId(slug)}`,
		_type: "article",
		title: name,
		slug: { _type: "slug", current: slug },
		type: "article",
		excerpt: text(item["excerpt:encoded"]) || undefined,
		body: toBlocks(text(item["content:encoded"])),
		publishedAt: text(item["wp:post_date_gmt"]) ? `${text(item["wp:post_date_gmt"]).replace(" ", "T")}Z` : undefined,
		_thumbId: metaMap(item)._thumbnail_id || undefined,
	};
}

function mapBenefit(item) {
	const name = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || name);
	const m = metaMap(item);
	return {
		_id: `benefit.${asciiId(slug)}`,
		_type: "benefit",
		partner: name,
		slug: { _type: "slug", current: slug },
		description: text(item["content:encoded"]).replace(/<[^>]+>/g, "").trim() || undefined,
		discount: m.discount || undefined,
		couponCode: m.coupon || undefined,
		redeemUrl: m.url || m.link || undefined,
	};
}

// ---------- attachment url lookup (for images) ----------
function attachmentUrls(items) {
	const map = new Map(); // post id -> url
	for (const it of items) {
		if (text(it["wp:post_type"]) === "attachment") {
			map.set(text(it["wp:post_id"]), text(it["wp:attachment_url"]));
		}
	}
	return map;
}

// ---------- main ----------
const files = readdirSync(WXR_DIR).filter((f) => f.endsWith(".xml"));
const docs = [];
const thumbJobs = []; // {doc, url}

for (const file of files) {
	const base = basename(file, ".xml");
	const cfg = FILE_KIND[base];
	if (!cfg) continue;
	const xml = parser.parse(readFileSync(join(WXR_DIR, file), "utf8"));
	const items = arr(xml?.rss?.channel?.item);
	const atts = attachmentUrls(items);

	for (const item of items) {
		const ptype = text(item["wp:post_type"]);
		if (ptype === "attachment" || ptype === "nav_menu_item" || ptype === "revision") continue;
		if (ptype !== base) continue; // skip stray types in the file

		let doc;
		if (cfg.type === "practitioner") doc = mapPractitioner(item, cfg);
		else if (cfg.type === "article") doc = mapArticle(item);
		else if (cfg.type === "benefit") doc = mapBenefit(item);
		if (!doc) continue;

		const thumbUrl = doc._thumbId && atts.get(doc._thumbId);
		delete doc._thumbId;
		if (thumbUrl) thumbJobs.push({ doc, url: thumbUrl });
		docs.push(doc);
	}
}

const summary = docs.reduce((a, d) => ((a[d._type] = (a[d._type] || 0) + 1), a), {});
console.warn(`Parsed ${docs.length} docs:`, summary);
console.warn(`Term docs: ${termDocs.size} | image candidates: ${thumbJobs.length}`);

if (DRY) {
	console.warn("\n--dry-run: nothing written. Sample doc:");
	console.warn(JSON.stringify(docs.find((d) => d._type === "practitioner"), null, 2));
	exit(0);
}

// ---------- write to Sanity ----------
const token = env.SANITY_TOKEN;
if (!token) {
	console.error("ERROR: set SANITY_TOKEN (a Sanity write/Editor token) to import. Use --dry-run to preview.");
	exit(1);
}
const client = createClient({
	projectId: env.SANITY_PROJECT_ID || "cuxqs66c",
	dataset: env.SANITY_DATASET || "production",
	apiVersion: "2024-01-01",
	token,
	useCdn: false,
});

// 1) term docs first (referenced by practitioners)
let tx = client.transaction();
for (const t of termDocs.values()) tx = tx.createOrReplace(t);
await tx.commit();
console.warn(`Imported ${termDocs.size} term docs.`);

// 2) optional images (best-effort)
if (WITH_IMAGES) {
	for (const { doc, url } of thumbJobs) {
		try {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const buf = Buffer.from(await res.arrayBuffer());
			const asset = await client.assets.upload("image", buf, { filename: basename(url) });
			const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
			if (doc._type === "benefit") doc.logo = ref;
			else if (doc._type === "article") doc.cover = ref;
			else doc.photo = ref;
		} catch (e) {
			console.warn(`  image skip (${url}): ${e.message}`);
		}
	}
	console.warn(`Processed ${thumbJobs.length} images.`);
}

// 3) content docs in batches
let n = 0;
for (let i = 0; i < docs.length; i += 50) {
	let b = client.transaction();
	for (const d of docs.slice(i, i + 50)) b = b.createOrReplace(d);
	await b.commit();
	n += Math.min(50, docs.length - i);
	console.warn(`Imported ${n}/${docs.length}…`);
}
console.warn("Done.");
