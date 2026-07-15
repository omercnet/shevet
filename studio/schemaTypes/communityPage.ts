import { defineField, defineType } from "sanity";

export default defineType({
	name: "communityPage",
	title: "עמוד קהילה",
	type: "document",
	fields: [
		defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
		defineField({ name: "slug", title: "כתובת", type: "slug", options: { source: "title", maxLength: 96 } }),
		defineField({ name: "image", title: "תמונה", type: "image", options: { hotspot: true } }),
		defineField({ name: "excerpt", title: "תקציר", type: "text", rows: 3 }),
		defineField({ name: "presenter", title: "מנחה", type: "string" }),
		defineField({ name: "dateText", title: "תאריך", type: "string" }),
		defineField({ name: "location", title: "מיקום", type: "string" }),
		defineField({ name: "cost", title: "עלות", type: "string" }),
		defineField({ name: "linkUrl", title: "קישור", type: "url" }),
		defineField({ name: "body", title: "תוכן", type: "array", of: [{ type: "block" }] }),
		defineField({ name: "sourceHtml", title: "HTML מהאתר הישן", type: "text", rows: 8 }),
		defineField({ name: "publishedAt", title: "פורסם", type: "datetime" }),
		defineField({ name: "published", title: "מפורסם", type: "boolean", initialValue: true }),
	],
	preview: { select: { title: "title", subtitle: "dateText", media: "image" } },
});
