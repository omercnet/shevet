import { defineField, defineType } from "sanity";

export const ARTICLE_CATEGORIES = [
	{ title: "הריון", value: "pregnancy" },
	{ title: "לידה", value: "birth" },
	{ title: "הנקה", value: "breastfeeding" },
	{ title: "טיפול בתינוק", value: "infant" },
	{ title: "לידה טבעית", value: "natural-birth" },
	{ title: "הורות", value: "parenting" },
	{ title: "חרדה ורגש", value: "anxiety" },
];

export default defineType({
	name: "article",
	title: "מאמר / סדנה",
	type: "document",
	fields: [
		defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
		defineField({
			name: "slug",
			title: "כתובת",
			type: "slug",
			options: { source: "title", maxLength: 96 },
			validation: (r) => r.required(),
		}),
		defineField({
			name: "type",
			title: "סוג",
			type: "string",
			options: {
				list: [
					{ title: "מאמר", value: "article" },
					{ title: "סדנה (וידאו)", value: "workshop" },
				],
				layout: "radio",
			},
			initialValue: "article",
		}),
		defineField({ name: "category", title: "קטגוריה", type: "string", options: { list: ARTICLE_CATEGORIES } }),
		defineField({ name: "cover", title: "תמונת שער", type: "image", options: { hotspot: true } }),
		defineField({ name: "excerpt", title: "תקציר", type: "text", rows: 3 }),
		defineField({ name: "videoUrl", title: "קישור וידאו (לסדנה)", type: "url" }),
		defineField({ name: "body", title: "תוכן", type: "array", of: [{ type: "block" }, { type: "image" }] }),
		defineField({ name: "sourceHtml", title: "HTML מהאתר הישן", type: "text", rows: 8 }),
		defineField({ name: "publishedAt", title: "תאריך פרסום", type: "datetime" }),
	],
	preview: { select: { title: "title", subtitle: "category", media: "cover" } },
});
