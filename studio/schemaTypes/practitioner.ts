import { defineField, defineType } from "sanity";

// סגנון ליווי — VALUES TBD with Keren
export const SUPPORT_STYLES = ["טבעי", "רגשי", "רפואי", "VBAC", "הוליסטי"];
// תקציב bands — RANGES TBD with Keren
export const BUDGET_BANDS = [
	{ title: "₪ — חסכוני", value: "low" },
	{ title: "₪₪ — בינוני", value: "mid" },
	{ title: "₪₪₪ — פרימיום", value: "high" },
];

export default defineType({
	name: "practitioner",
	title: "אשת מקצוע / דולה",
	type: "document",
	groups: [
		{ name: "main", title: "כללי", default: true },
		{ name: "doula", title: "חיפוש דולות" },
		{ name: "pro", title: "חיפוש נשות מקצוע" },
		{ name: "contact", title: "יצירת קשר" },
		{ name: "content", title: "תוכן והמלצות" },
	],
	fields: [
		defineField({ name: "name", title: "שם", type: "string", group: "main", validation: (r) => r.required() }),
		defineField({
			name: "slug",
			title: "כתובת (slug)",
			type: "slug",
			group: "main",
			options: { source: "name", maxLength: 96 },
			validation: (r) => r.required(),
		}),
		defineField({ name: "title", title: "תיאור תפקיד", type: "string", group: "main" }),
		defineField({ name: "marketingSentence", title: "משפט שיווקי", type: "string", group: "main" }),
		defineField({ name: "photo", title: "תמונה", type: "image", group: "main", options: { hotspot: true } }),
		defineField({
			name: "videoCover",
			title: "תמונה לכיסוי וידאו",
			type: "image",
			group: "main",
			options: { hotspot: true },
		}),
		defineField({
			name: "videoUrl",
			title: "קישור וידאו (יוטיוב/וימאו)",
			type: "url",
			group: "main",
			description: "מופיע בראש עמוד הדולה — מנוע ההמרה",
		}),
		defineField({
			name: "tier",
			title: "רמה",
			type: "string",
			group: "main",
			options: {
				list: [
					{ title: "מובחרת — עמוד מלא", value: "premium" },
					{ title: "אינדקס — רישום קצר", value: "index" },
				],
				layout: "radio",
			},
			initialValue: "premium",
			validation: (r) => r.required(),
		}),

		// appears in which engine
		defineField({ name: "isDoula", title: "מופיעה בחיפוש דולות", type: "boolean", group: "main", initialValue: true }),
		defineField({
			name: "isProfessional",
			title: "מופיעה בחיפוש נשות מקצוע",
			type: "boolean",
			group: "main",
			initialValue: false,
		}),

		// --- doula search facets ---
		defineField({
			name: "hospitals",
			title: "בתי חולים",
			type: "array",
			group: "doula",
			of: [{ type: "reference", to: [{ type: "hospital" }] }],
		}),
		defineField({
			name: "supportStyle",
			title: "סגנון ליווי",
			type: "array",
			group: "doula",
			of: [{ type: "string" }],
			options: { list: SUPPORT_STYLES },
		}),
		defineField({ name: "budget", title: "תקציב", type: "string", group: "doula", options: { list: BUDGET_BANDS } }),
		defineField({
			name: "availableAround",
			title: "זמינות סביב תאריך",
			type: "date",
			group: "doula",
			description: "לסינון לפי תאריך לידה משוער — מנגנון לאישור מול קרן",
		}),

		// --- professional search facets ---
		defineField({
			name: "fields",
			title: "תחומי טיפול",
			type: "array",
			group: "pro",
			of: [{ type: "reference", to: [{ type: "field" }] }],
			description: "הנקה / עיסוי / רפלקסולוגיה …",
		}),
		defineField({
			name: "regions",
			title: "אזורים (מיקום)",
			type: "array",
			group: "pro",
			of: [{ type: "reference", to: [{ type: "region" }] }],
		}),
		defineField({
			name: "languages",
			title: "שפות",
			type: "array",
			group: "pro",
			of: [{ type: "string" }],
			options: { list: ["עברית", "אנגלית", "ספרדית", "רוסית", "ערבית", "צרפתית"] },
		}),

		// --- contact ---
		defineField({ name: "phone", title: "טלפון", type: "string", group: "contact" }),
		defineField({
			name: "whatsapp",
			title: "וואטסאפ",
			type: "string",
			group: "contact",
			description: "מספר לקישור click-to-chat",
		}),
		defineField({ name: "email", title: "אימייל", type: "string", group: "contact" }),
		defineField({ name: "instagram", title: "אינסטגרם", type: "url", group: "contact" }),
		defineField({ name: "instagramPostUrl", title: "פוסט / רילס אינסטגרם", type: "url", group: "contact" }),
		defineField({ name: "adress", title: "כתובת", type: "string", group: "contact" }),

		// --- content ---
		defineField({ name: "bio", title: "אודות / האני מאמין", type: "array", group: "content", of: [{ type: "block" }] }),
		defineField({
			name: "services",
			title: "מה כולל הליווי",
			type: "array",
			group: "content",
			of: [{ type: "block" }],
		}),
		defineField({ name: "credentials", title: "הסמכות", type: "array", group: "content", of: [{ type: "string" }] }),
		defineField({ name: "gallery", title: "גלריה", type: "array", group: "content", of: [{ type: "image" }] }),
		defineField({
			name: "testimonials",
			title: "המלצות",
			type: "array",
			group: "content",
			of: [
				{
					type: "object",
					fields: [
						{ name: "author", title: "שם הממליצה", type: "string" },
						{ name: "quote", title: "המלצה", type: "text" },
						{ name: "rating", title: "דירוג (1-5)", type: "number", validation: (r) => r.min(1).max(5) },
					],
				},
			],
		}),
		defineField({
			name: "faq",
			title: "שאלות ותשובות",
			type: "array",
			group: "content",
			of: [
				{
					type: "object",
					fields: [
						{ name: "q", title: "שאלה", type: "string" },
						{ name: "a", title: "תשובה", type: "text" },
					],
				},
			],
		}),

		defineField({ name: "published", title: "מפורסם", type: "boolean", group: "main", initialValue: true }),
	],
	preview: {
		select: { title: "name", subtitle: "title", media: "photo" },
	},
});
