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
}

// Doula search index — flat shape consumed by the client-side search island.
export function getDoulas(): Promise<DoulaCard[]> {
	return sanityFetch<DoulaCard[]>(
		`*[_type == "practitioner" && isDoula == true && published == true]{
			"slug": slug.current, name, title, tier, videoUrl, budget, supportStyle,
			"photo": photo.asset->url,
			"hospitals": hospitals[]->name,
			"regions": regions[]->name,
			whatsapp, phone
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
			languages, whatsapp, phone
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
	photoUrl?: string;
	videoUrl?: string;
	whatsapp?: string;
	hospitals?: string[];
	fields?: string[];
	regions?: string[];
	supportStyle?: string[];
	testimonials?: Testimonial[];
}

export function getPractitioner(slug: string): Promise<PractitionerDetail | null> {
	return sanityFetch<PractitionerDetail | null>(
		`*[_type == "practitioner" && slug.current == $slug][0]{
			..., "photoUrl": photo.asset->url,
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

export interface PractitionerDetailWithSlug extends PractitionerDetail {
	slug: string;
}

// Fetch ALL premium practitioner details once — used by getStaticPaths so detail
// pages render from props instead of one live query per page (much faster builds).
function practitionerDetails(filter: string): Promise<PractitionerDetailWithSlug[]> {
	return sanityFetch<PractitionerDetailWithSlug[]>(
		`*[_type == "practitioner" && ${filter} && tier == "premium" && published == true]{
			"slug": slug.current, name, title, videoUrl, whatsapp, supportStyle, testimonials,
			"photoUrl": photo.asset->url,
			"hospitals": hospitals[]->name, "fields": fields[]->name, "regions": regions[]->name
		}`,
		{},
		[],
	);
}
export const getDoulaDetails = () => practitionerDetails("isDoula == true");
export const getProfessionalDetails = () => practitionerDetails("isProfessional == true");

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
			videoUrl, body, publishedAt
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

export function getBenefits(): Promise<BenefitCard[]> {
	return sanityFetch<BenefitCard[]>(
		`*[_type == "benefit"] | order(partner asc){
			"slug": slug.current, partner, "logo": logo.asset->url, category, discount, description, couponCode, redeemUrl
		}`,
		{},
		[],
	);
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
	ctaLabel?: string;
	meshulamUrl?: string;
}

export function getSalePages(): Promise<SalePage[]> {
	return sanityFetch<SalePage[]>(
		`*[_type == "salePage"]{ "slug": slug.current, title, "image": image.asset->url, blurb, ctaLabel, meshulamUrl }`,
		{},
		[],
	);
}

export function getSalePage(slug: string): Promise<SalePage | null> {
	return sanityFetch<SalePage | null>(
		`*[_type == "salePage" && slug.current == $slug][0]{
			"slug": slug.current, title, "image": image.asset->url, blurb, ctaLabel, meshulamUrl
		}`,
		{ slug },
		null,
	);
}

export function getSalePageSlugs(): Promise<string[]> {
	return sanityFetch<string[]>(`*[_type == "salePage" && defined(slug.current)].slug.current`, {}, []);
}

// All article details for getStaticPaths (one fetch instead of per-slug).
export function getArticleDetails(): Promise<ArticleDetail[]> {
	return sanityFetch<ArticleDetail[]>(
		`*[_type == "article" && defined(slug.current)]{
			"slug": slug.current, title, type, category, excerpt, "cover": cover.asset->url,
			videoUrl, body, publishedAt
		}`,
		{},
		[],
	);
}
