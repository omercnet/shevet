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

export function getSiteSettings(): Promise<Record<string, unknown> | null> {
	return sanityFetch<Record<string, unknown> | null>(`*[_type == "siteSettings"][0]`, {}, null);
}
