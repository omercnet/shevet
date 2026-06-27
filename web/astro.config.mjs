import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
	site: "https://shevet-imahot.co.il",
	// Static output: content fetched from Sanity at build time, served from CDN.
	output: "static",
	integrations: [sitemap()],
});
