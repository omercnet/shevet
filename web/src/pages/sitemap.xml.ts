import {
	getArticleSlugs,
	getBenefitSlugs,
	getCommunityPageSlugs,
	getPremiumDoulaSlugs,
	getProfessionalSlugs,
	getSalePageSlugs,
} from "../lib/queries";

const staticPaths = [
	"/",
	"/doulas/",
	"/professionals/",
	"/articles/",
	"/benefits/",
	"/community/",
	"/courses/",
	"/doulas/join/",
	"/privacy/",
	"/terms/",
	"/accessibility/",
	"/team/",
	"/welcome/",
] as const;

const escapeXml = (value: string): string =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const urlsFor = (site: URL, paths: readonly string[]): string[] =>
	paths.map((path) => `<url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`);

export async function GET({ site }: { readonly site: URL }): Promise<Response> {
	const [doulas, professionals, articles, benefits, communityPages, salePages] = await Promise.all([
		getPremiumDoulaSlugs(),
		getProfessionalSlugs(),
		getArticleSlugs(),
		getBenefitSlugs(),
		getCommunityPageSlugs(),
		getSalePageSlugs(),
	]);
	const dynamicPaths = [
		...doulas.map((slug) => `/doulas/${slug}/`),
		...professionals.map((slug) => `/professionals/${slug}/`),
		...articles.map((slug) => `/articles/${slug}/`),
		...benefits.map((slug) => `/benefits/${slug}/`),
		...communityPages.map((slug) => `/community/${slug}/`),
		...salePages.map((slug) => `/courses/${slug}/`),
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlsFor(site, [...staticPaths, ...dynamicPaths]).join("")}</urlset>`;
	return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
