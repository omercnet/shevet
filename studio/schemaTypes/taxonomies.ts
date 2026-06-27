import { defineField, defineType } from "sanity";

const term = (name: string, title: string) =>
	defineType({
		name,
		title,
		type: "document",
		fields: [
			defineField({ name: "name", title: "שם", type: "string", validation: (r) => r.required() }),
			defineField({ name: "slug", title: "כתובת", type: "slug", options: { source: "name" } }),
		],
		preview: { select: { title: "name" } },
	});

export const hospital = term("hospital", "בית חולים");
export const field = term("field", "תחום טיפול"); // lactation, massage, reflexology…
export const region = term("region", "אזור");
