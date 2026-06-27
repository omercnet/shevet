import { defineField, defineType } from "sanity";

export default defineType({
	name: "siteSettings",
	title: "הגדרות אתר",
	type: "document",
	fields: [
		defineField({ name: "title", title: "שם האתר", type: "string" }),
		defineField({ name: "email", title: "אימייל ראשי", type: "string" }),
		defineField({ name: "phone", title: "טלפון", type: "string" }),
		defineField({ name: "instagram", title: "אינסטגרם", type: "url" }),
		defineField({ name: "facebook", title: "פייסבוק", type: "url" }),
		defineField({ name: "gtmId", title: "מזהה Google Tag Manager", type: "string", description: "GTM-XXXXXXX" }),
		defineField({
			name: "matchmakingFormEmbed",
			title: "קוד הטמעה — טופס שידוך (רב-מסר)",
			type: "text",
			description: "הדבק כאן את קוד ה-iframe/embed של הטופס מרב-מסר",
		}),
	],
});
