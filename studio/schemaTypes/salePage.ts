import { defineField, defineType } from "sanity";

// Replaces the old product catalog — just a marketing page with a button to Meshulam.
export default defineType({
	name: "salePage",
	title: "עמוד מכירה",
	type: "document",
	fields: [
		defineField({ name: "title", title: "כותרת", type: "string", validation: (r) => r.required() }),
		defineField({ name: "slug", title: "כתובת", type: "slug", options: { source: "title" } }),
		defineField({ name: "image", title: "תמונה", type: "image", options: { hotspot: true } }),
		defineField({ name: "blurb", title: "תיאור", type: "array", of: [{ type: "block" }] }),
		defineField({ name: "sourceHtml", title: "HTML מהאתר הישן", type: "text", rows: 8 }),
		defineField({ name: "presenter", title: "מנחה", type: "string" }),
		defineField({ name: "dateText", title: "תאריך", type: "string" }),
		defineField({ name: "location", title: "מיקום", type: "string" }),
		defineField({ name: "cost", title: "עלות", type: "string" }),
		defineField({ name: "formEmbedHtml", title: "קישור / הטמעת טופס", type: "text", rows: 4 }),
		defineField({ name: "ctaLabel", title: "טקסט הכפתור", type: "string", initialValue: "לרכישה" }),
		defineField({ name: "meshulamUrl", title: "קישור לעמוד משולם", type: "url" }),
	],
	preview: { select: { title: "title", media: "image" } },
});
