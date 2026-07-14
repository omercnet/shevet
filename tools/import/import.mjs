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

// ---------- which WP post type maps to which doc kind ----------
const POST_TYPE_KIND = {
	"doulas-premium": { type: "practitioner", tier: "premium", isDoula: true },
	other_doula: { type: "practitioner", tier: "index", isDoula: true },
	"therapist-premium": { type: "practitioner", tier: "premium", isProfessional: true },
	"pregnancy-blog": { type: "article" },
	benefits: { type: "benefit" },
	"community": { type: "communityPage" },
	"courses": { type: "salePage" },
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
const keyed = (items) => items.map((o, i) => ({ ...o, _key: `k${i}` }));

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

const legacyHtml = (item, m = metaMap(item)) => m._content || text(item["content:encoded"]);
const stripHtml = (html) =>
	String(html ?? "")
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]+>/g, " ")
		.replace(/&nbsp;/g, " ")
		.replace(/\s+/g, " ")
		.trim();

function sectionBlocks(sections) {
	const blocks = [];
	for (const [title, html] of sections) {
		if (!stripHtml(html)) continue;
		blocks.push({
			_type: "block",
			style: "h3",
			markDefs: [],
			children: [{ _type: "span", text: title, marks: [] }],
		});
		blocks.push(...(toBlocks(html) ?? []));
	}
	return blocks.length ? keyed(blocks) : undefined;
}

function firstInstagramPostUrl(...values) {
	for (const value of values) {
		const found = String(value ?? "").match(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[^\s"'<>]+/i)?.[0];
		if (found) return found;
	}
	return undefined;
}

function serializedString(source, start, byteLength) {
	let end = start;
	let bytes = 0;
	while (end < source.length && bytes < byteLength) {
		bytes += Buffer.byteLength(source[end]);
		end++;
	}
	return { value: source.slice(start, end), end };
}

function parseSerialized(source, start = 0) {
	const type = source[start];
	if (type === "N") return { value: null, end: start + 2 };
	const metaStart = start + 2;
	if (type === "s") {
		const lenEnd = source.indexOf(":", metaStart);
		const byteLength = Number(source.slice(metaStart, lenEnd));
		const { value, end } = serializedString(source, lenEnd + 2, byteLength);
		return { value, end: end + 2 };
	}
	if (type === "i" || type === "b" || type === "d") {
		const end = source.indexOf(";", metaStart);
		return { value: source.slice(metaStart, end), end: end + 1 };
	}
	if (type === "a") {
		const lenEnd = source.indexOf(":", metaStart);
		const count = Number(source.slice(metaStart, lenEnd));
		const value = {};
		let pos = lenEnd + 2;
		for (let i = 0; i < count; i++) {
			const key = parseSerialized(source, pos);
			const item = parseSerialized(source, key.end);
			value[key.value] = item.value;
			pos = item.end;
		}
		return { value, end: pos + 1 };
	}
	return { value: null, end: source.length };
}

function parseFaq(value) {
	const serialized = String(value ?? "");
	let pairs = [];
	if (serialized.startsWith("a:")) {
		const parsed = parseSerialized(serialized).value;
		pairs = Object.values(parsed ?? {}).map((item) => ({ q: stripHtml(item?.question), a: stripHtml(item?.answer) }));
	}
	if (!pairs.length) {
		pairs = [...serialized.matchAll(/s:\d+:"question";s:\d+:"((?:\\.|[^"\\])*)";s:\d+:"answer";s:\d+:"((?:\\.|[^"\\])*)"/g)].map(([, q, a]) => ({
			q: stripHtml(q.replace(/\\"/g, '"')),
			a: stripHtml(a.replace(/\\"/g, '"')),
		}));
	}
	pairs = pairs.filter((item) => item.q && item.a);
	if (pairs.length) return keyed(pairs);
	const fallback = stripHtml(value);
	return fallback ? keyed([{ q: "שאלות ותשובות", a: fallback }]) : undefined;
}

function phoneDigits(...values) {
	for (const value of values) {
		const digits = String(value ?? "").replace(/\D/g, "");
		if (digits) return digits;
	}
	return "";
}

function defaultWhatsappLink(...values) {
	const digits = phoneDigits(...values);
	if (!digits) return undefined;
	const phone = digits.startsWith("972") ? digits : digits.startsWith("0") ? `972${digits.slice(1)}` : digits;
	const message = encodeURIComponent("הי! הגעתי אליך דרך האתר של שבט אמהות ואשמח לקבל פרטים");
	return `https://wa.me/${phone}?text=${message}`;
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
		["1", "2", "3", "3_copy", "4"]
			.map((i) => ({ quote: m[`recommandation-${i}`], author: m[`recommandation-name-${i}`] }))
			.filter((x) => x.quote)
			.map((x) => ({ author: x.author || "", quote: x.quote })),
	);

	const meetingInfo = sectionBlocks([["מה כוללת פגישת ההיכרות", m["introduction-meeting"]]]);
	const services = sectionBlocks([
		["מה כולל קורס הכנה ללידה", m["birthing-course"]],
		["מה כולל הליווי", m["birth-support"]],
	]);
	const faq = parseFaq(m.qampa);

	return {
		_id: `practitioner.${asciiId(slug)}`,
		_type: "practitioner",
		name,
		slug: { _type: "slug", current: slug },
		title: stripHtml(m._description) || m.position || undefined,
		tier: cfg.tier ?? "index",
		isDoula: !!cfg.isDoula,
		isProfessional: !!cfg.isProfessional || fields.length > 0,
		videoUrl: m.video || undefined,
		marketingSentence: stripHtml(m["marketing-description"]) || undefined,
		phone: m.phone || m.doula_tel || m.whatsapp_copy || undefined,
		whatsapp: m.whatsapp || defaultWhatsappLink(m.whatsapp_copy, m.phone, m.doula_tel),
		email: m.email || undefined,
		instagram: m.instagram || undefined,
		instagramPostUrl: firstInstagramPostUrl(m["insta-1"], m["insta-2"]),
		adress: m.adress || undefined,
		hospitals: hospitals.length ? hospitals : undefined,
		regions: regions.length ? regions : undefined,
		fields: fields.length ? fields : undefined,
		languages: languages.length ? [...new Set(languages)] : undefined,
		credentials: credentials.length ? credentials : undefined,
		bio: toBlocks(m["i-believe"]),
		meetingInfo,
		services,
		duringBirth: toBlocks(m["during-birth"] || ""),
		afterBirth: toBlocks(m["after-birth"] || ""),
		faq,
		testimonials: testimonials.length ? testimonials : undefined,
		published: text(item["wp:status"]) === "publish",
		// NOTE: supportStyle + budget had no equivalent in WP — Keren sets these in Studio.
		_thumbId: m._thumbnail_id || undefined,
		_videoCoverId: m["video-cover"] || undefined,
		_galleryIds: m["image-gallery"] || undefined,
	};
}

function mapArticle(item) {
	const name = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || name);
	const m = metaMap(item);
	const html = legacyHtml(item, m);
	return {
		_id: `article.${asciiId(slug)}`,
		_type: "article",
		title: name,
		slug: { _type: "slug", current: slug },
		type: "article",
		excerpt: text(item["excerpt:encoded"]) || undefined,
		body: toBlocks(html),
		sourceHtml: html || undefined,
		publishedAt: text(item["wp:post_date_gmt"]) ? `${text(item["wp:post_date_gmt"]).replace(" ", "T")}Z` : undefined,
		_thumbId: m._thumbnail_id || undefined,
	};
}

function mapBenefit(item) {
	const name = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || name);
	const m = metaMap(item);
	const html = m["product-detail"] || legacyHtml(item, m);
	return {
		_id: `benefit.${asciiId(slug)}`,
		_type: "benefit",
		partner: name,
		slug: { _type: "slug", current: slug },
		description: stripHtml(html) || undefined,
		body: toBlocks(html),
		sourceHtml: html || undefined,
		discount: m["the-benefit"] || m.discount || undefined,
		couponCode: m["benefit-code"] || m.coupon || undefined,
		redeemUrl: m.url || m.link || undefined,
		_thumbId: m._thumbnail_id || undefined,
	};
}

function mapCommunityPage(item) {
	const title = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || title);
	const m = metaMap(item);
	const html = legacyHtml(item, m);
	return {
		_id: `communityPage.${asciiId(slug)}`,
		_type: "communityPage",
		title,
		slug: { _type: "slug", current: slug },
		excerpt: text(item["excerpt:encoded"]) || undefined,
		body: toBlocks(html),
		sourceHtml: html || undefined,
		presenter: m.presenter || m.name || undefined,
		dateText: m.date || undefined,
		location: m.location || undefined,
		cost: m.cost || m.price || undefined,
		linkUrl: m.link || undefined,
		publishedAt: text(item["wp:post_date_gmt"]) ? `${text(item["wp:post_date_gmt"]).replace(" ", "T")}Z` : undefined,
		_thumbId: m._thumbnail_id || undefined,
	};
}

function mapSalePage(item) {
	const title = text(item.title);
	const slug = slugify(text(item["wp:post_name"]) || title);
	const m = metaMap(item);
	const html = legacyHtml(item, m);
	return {
		_id: `salePage.${asciiId(slug)}`,
		_type: "salePage",
		title,
		slug: { _type: "slug", current: slug },
		blurb: toBlocks(html),
		sourceHtml: html || undefined,
		presenter: m.presenter || m.name || undefined,
		dateText: m.date || undefined,
		location: m.location || undefined,
		cost: m.cost || m.price || undefined,
		formEmbedHtml: m.link || undefined,
		ctaLabel: m.link ? "להרשמה" : "לרכישה",
		meshulamUrl: m.meshulamUrl || m.url || undefined,
		_thumbId: m._thumbnail_id || undefined,
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
const parsedFiles = files.map((file) => ({
	file,
	items: arr(parser.parse(readFileSync(join(WXR_DIR, file), "utf8"))?.rss?.channel?.item),
}));
const atts = attachmentUrls(parsedFiles.flatMap(({ items }) => items));
const docs = [];
const imageJobs = []; // {doc, url, field, append}

for (const { items } of parsedFiles) {
	for (const item of items) {
		const ptype = text(item["wp:post_type"]);
		if (ptype === "attachment" || ptype === "nav_menu_item" || ptype === "revision") continue;
		const cfg = POST_TYPE_KIND[ptype];
		if (!cfg) continue;

		let doc;
		if (cfg.type === "practitioner") doc = mapPractitioner(item, cfg);
		else if (cfg.type === "article") doc = mapArticle(item);
		else if (cfg.type === "benefit") doc = mapBenefit(item);
		else if (cfg.type === "communityPage") doc = mapCommunityPage(item);
		else if (cfg.type === "salePage") doc = mapSalePage(item);
		if (!doc) continue;

		const thumbUrl = doc._thumbId && atts.get(doc._thumbId);
		const videoCoverUrl = doc._videoCoverId && atts.get(doc._videoCoverId);
		const galleryUrls = String(doc._galleryIds ?? "")
			.split(",")
			.map((id) => atts.get(id.trim()))
			.filter(Boolean);
		delete doc._thumbId;
		delete doc._videoCoverId;
		delete doc._galleryIds;
		if (thumbUrl) imageJobs.push({ doc, url: thumbUrl, field: "photo" });
		if (videoCoverUrl) imageJobs.push({ doc, url: videoCoverUrl, field: "videoCover" });
		for (const url of galleryUrls) imageJobs.push({ doc, url, field: "gallery", append: true });
		docs.push(doc);
	}
}

const summary = docs.reduce((a, d) => ((a[d._type] = (a[d._type] || 0) + 1), a), {});
console.warn(`Parsed ${docs.length} docs:`, summary);
console.warn(`Term docs: ${termDocs.size} | image candidates: ${imageJobs.length}`);

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
	const assetRefs = new Map();
	for (const { doc, url, field, append } of imageJobs) {
		try {
			if (!assetRefs.has(url)) {
				const res = await fetch(url);
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const buf = Buffer.from(await res.arrayBuffer());
				const asset = await client.assets.upload("image", buf, { filename: basename(url) });
				assetRefs.set(url, { _type: "image", asset: { _type: "reference", _ref: asset._id } });
			}
			const ref = assetRefs.get(url);
			if (append) doc[field] = [...(doc[field] ?? []), { ...ref, _key: asciiId(url) }];
			else if (field === "photo" && doc._type === "benefit") doc.logo = ref;
			else if (field === "photo" && doc._type === "article") doc.cover = ref;
			else if (field === "photo" && (doc._type === "communityPage" || doc._type === "salePage")) doc.image = ref;
			else doc[field] = ref;
		} catch (e) {
			console.warn(`  image skip (${url}): ${e.message}`);
		}
	}
	console.warn(`Processed ${imageJobs.length} images.`);
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
