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
		defineField({ name: "ctaLabel", title: "טקסט הכפתור", type: "string", initialValue: "לרכישה" }),
		defineField({ name: "meshulamUrl", title: "קישור לעמוד משולם", type: "url", validation: (r) => r.required() }),
	],
	preview: { select: { title: "title", media: "image" } },
});
