import { sanityFetch } from "./sanity";

export interface DoulaCard {
	slug: string;
	name: string;
	title?: string;
	tier?: string;
	videoUrl?: string;
	budget?: string;
	supportStyle?: string[];
	photo?: string;
	hospitals?: string[];
	regions?: string[];
	whatsapp?: string;
	phone?: string;
	email?: string;
	instagram?: string;
}

export interface ProfessionalCard {
	slug: string;
	name: string;
	title?: string;
	tier?: string;
	photo?: string;
	fields?: string[];
	regions?: string[];
	languages?: string[];
	whatsapp?: string;
	phone?: string;
	email?: string;
	instagram?: string;
}

// Doula search index — flat shape consumed by the client-side search island.
export function getDoulas(): Promise<DoulaCard[]> {
	return sanityFetch<DoulaCard[]>(
		`*[_type == "practitioner" && isDoula == true && published == true]{
			"slug": slug.current, name, title, tier, videoUrl, budget, supportStyle,
			"photo": photo.asset->url,
			"hospitals": hospitals[]->name,
			"regions": regions[]->name,
			whatsapp, phone, email, instagram
		}`,
		{},
		[],
	);
}

// Professional search index — location-first.
export function getProfessionals(): Promise<ProfessionalCard[]> {
	return sanityFetch<ProfessionalCard[]>(
		`*[_type == "practitioner" && isProfessional == true && published == true]{
			"slug": slug.current, name, title, tier,
			"photo": photo.asset->url,
			"fields": fields[]->name,
			"regions": regions[]->name,
			languages, whatsapp, phone, email, instagram
		}`,
		{},
		[],
	);
}

export interface Testimonial {
	author?: string;
	quote?: string;
	rating?: number;
}

export interface PractitionerDetail {
	name: string;
	title?: string;
	marketingSentence?: string;
	photoUrl?: string;
	videoUrl?: string;
	videoCoverUrl?: string;
	whatsapp?: string;
	phone?: string;
	email?: string;
	instagram?: string;
	instagramPostUrl?: string;
	hospitals?: string[];
	fields?: string[];
	regions?: string[];
	supportStyle?: string[];
	bio?: unknown[];
	services?: unknown[];
	credentials?: string[];
	gallery?: { url?: string }[];
	testimonials?: Testimonial[];
	faq?: { q?: string; a?: string }[];
}

export function getPractitioner(slug: string): Promise<PractitionerDetail | null> {
	return sanityFetch<PractitionerDetail | null>(
		`*[_type == "practitioner" && slug.current == $slug][0]{
			..., "photoUrl": photo.asset->url, "videoCoverUrl": videoCover.asset->url,
			"gallery": gallery[]{"url": asset->url},
			"hospitals": hospitals[]->name, "fields": fields[]->name, "regions": regions[]->name
		}`,
		{ slug },
		null,
	);
}

export function getPremiumDoulaSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(
		`*[_type == "practitioner" && isDoula == true && tier == "premium" && published == true].slug.current`,
		{},
		[],
	);
}

export interface SiteSettings {
	title?: string;
	email?: string;
	phone?: string;
	instagram?: string;
	facebook?: string;
	gtmId?: string;
	matchmakingFormEmbed?: string;
}

export function getSiteSettings(): Promise<SiteSettings | null> {
	return sanityFetch<SiteSettings | null>(`*[_type == "siteSettings"][0]`, {}, null);
}

// ---------- Articles ----------
export interface ArticleCard {
	slug: string;
	title: string;
	type?: string;
	category?: string;
	excerpt?: string;
	cover?: string;
}

export interface ArticleDetail extends ArticleCard {
	videoUrl?: string;
	body?: unknown[];
	sourceHtml?: string;
	publishedAt?: string;
}

export function getArticles(): Promise<ArticleCard[]> {
	return sanityFetch<ArticleCard[]>(
		`*[_type == "article"] | order(publishedAt desc){
			"slug": slug.current, title, type, category, excerpt, "cover": cover.asset->url
		}`,
		{},
		[],
	);
}

export function getArticle(slug: string): Promise<ArticleDetail | null> {
	return sanityFetch<ArticleDetail | null>(
		`*[_type == "article" && slug.current == $slug][0]{
			"slug": slug.current, title, type, category, excerpt, "cover": cover.asset->url,
			videoUrl, body, sourceHtml, publishedAt
		}`,
		{ slug },
		null,
	);
}

export function getArticleSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(`*[_type == "article" && defined(slug.current)].slug.current`, {}, []);
}

// ---------- Benefits ----------
export interface BenefitCard {
	slug?: string;
	partner: string;
	logo?: string;
	category?: string;
	discount?: string;
	description?: string;
	couponCode?: string;
	redeemUrl?: string;
}

export interface BenefitDetail extends BenefitCard {
	body?: unknown[];
	sourceHtml?: string;
}

export function getBenefits(): Promise<BenefitCard[]> {
	return sanityFetch<BenefitCard[]>(
		`*[_type == "benefit"] | order(partner asc){
			"slug": slug.current, partner, "logo": logo.asset->url, category, discount, description, couponCode, redeemUrl
		}`,
		{},
		[],
	);
}

export function getBenefit(slug: string): Promise<BenefitDetail | null> {
	return sanityFetch<BenefitDetail | null>(
		`*[_type == "benefit" && slug.current == $slug][0]{
			"slug": slug.current, partner, "logo": logo.asset->url, category, discount, description, couponCode, redeemUrl, body, sourceHtml
		}`,
		{ slug },
		null,
	);
}

export function getBenefitSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(`array::unique(*[_type == "benefit" && defined(slug.current)].slug.current)`, {}, []);
}

// ---------- Community (WhatsApp groups) ----------
export interface WhatsappGroup {
	name: string;
	cohort?: string;
	inviteUrl?: string;
	moderator?: string;
	guidelines?: string;
}

export function getWhatsappGroups(): Promise<WhatsappGroup[]> {
	return sanityFetch<WhatsappGroup[]>(
		`*[_type == "whatsappGroup"]{ name, cohort, inviteUrl, moderator, guidelines }`,
		{},
		[],
	);
}

export interface CommunityPage {
	slug: string;
	title: string;
	image?: string;
	excerpt?: string;
	presenter?: string;
	dateText?: string;
	location?: string;
	cost?: string;
	linkUrl?: string;
	body?: unknown[];
	sourceHtml?: string;
}

export function getCommunityPages(): Promise<CommunityPage[]> {
	return sanityFetch<CommunityPage[]>(
		`*[_type == "communityPage"] | order(publishedAt desc){
			"slug": slug.current, title, "image": image.asset->url, excerpt, presenter, dateText, location, cost, linkUrl
		}`,
		{},
		[],
	);
}

export function getCommunityPage(slug: string): Promise<CommunityPage | null> {
	return sanityFetch<CommunityPage | null>(
		`*[_type == "communityPage" && slug.current == $slug][0]{
			"slug": slug.current, title, "image": image.asset->url, excerpt, presenter, dateText, location, cost, linkUrl, body, sourceHtml
		}`,
		{ slug },
		null,
	);
}

export function getCommunityPageSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(`*[_type == "communityPage" && defined(slug.current)].slug.current`, {}, []);
}

// ---------- Professionals (profile detail reuses getPractitioner) ----------
export function getProfessionalSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(
		`*[_type == "practitioner" && isProfessional == true && tier == "premium" && published == true].slug.current`,
		{},
		[],
	);
}

// ---------- Sale pages (Meshulam) ----------
export interface SalePage {
	slug: string;
	title: string;
	image?: string;
	blurb?: unknown[];
	sourceHtml?: string;
	presenter?: string;
	dateText?: string;
	location?: string;
	cost?: string;
	formEmbedHtml?: string;
	ctaLabel?: string;
	meshulamUrl?: string;
}

export function getSalePages(): Promise<SalePage[]> {
	return sanityFetch<SalePage[]>(
		`*[_type == "salePage"]{ "slug": slug.current, title, "image": image.asset->url, blurb, sourceHtml, presenter, dateText, location, cost, formEmbedHtml, ctaLabel, meshulamUrl }`,
		{},
		[],
	);
}

export function getSalePage(slug: string): Promise<SalePage | null> {
	return sanityFetch<SalePage | null>(
		`*[_type == "salePage" && slug.current == $slug][0]{
			"slug": slug.current, title, "image": image.asset->url, blurb, sourceHtml, presenter, dateText, location, cost, formEmbedHtml, ctaLabel, meshulamUrl
		}`,
		{ slug },
		null,
	);
}

export function getSalePageSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(`*[_type == "salePage" && defined(slug.current)].slug.current`, {}, []);
}
