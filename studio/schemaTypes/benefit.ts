import { defineField, defineType } from "sanity";

export default defineType({
	name: "benefit",
	title: "הטבה / קופון",
	type: "document",
	fields: [
		defineField({ name: "partner", title: "שם העסק", type: "string", validation: (r) => r.required() }),
		defineField({ name: "slug", title: "כתובת", type: "slug", options: { source: "partner", maxLength: 96 } }),
		defineField({ name: "logo", title: "לוגו", type: "image", options: { hotspot: true } }),
		defineField({
			name: "category",
			title: "קטגוריה",
			type: "string",
			options: {
				list: [
					{ title: "הריון", value: "pregnancy" },
					{ title: "לאחר לידה", value: "postpartum" },
					{ title: "תינוקות", value: "baby" },
				],
			},
		}),
		defineField({ name: "discount", title: "ההטבה", type: "string", description: "לדוגמה: 20% הנחה" }),
		defineField({ name: "description", title: "תיאור", type: "text", rows: 3 }),
		defineField({ name: "body", title: "תוכן", type: "array", of: [{ type: "block" }] }),
		defineField({ name: "sourceHtml", title: "HTML מהאתר הישן", type: "text", rows: 8 }),
		defineField({ name: "couponCode", title: "קוד קופון", type: "string" }),
		defineField({ name: "redeemUrl", title: "קישור למימוש", type: "url" }),
	],
	preview: { select: { title: "partner", subtitle: "discount", media: "logo" } },
});
