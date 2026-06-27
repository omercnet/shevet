import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
	name: "shevet",
	title: "שבט אמהות",
	// Fill these after `sanity init` / from manage.sanity.io:
	projectId: process.env.SANITY_STUDIO_PROJECT_ID || "cuxqs66c",
	dataset: process.env.SANITY_STUDIO_DATASET || "production",
	plugins: [structureTool(), visionTool()],
	schema: { types: schemaTypes },
});
