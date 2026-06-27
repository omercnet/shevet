import {client} from './sanity'

// Doula search index — flat shape consumed by the client-side search island.
export async function getDoulas() {
  return client.fetch(`*[_type == "practitioner" && isDoula == true && published == true]{
    "slug": slug.current, name, title, tier, videoUrl, budget, supportStyle,
    "photo": photo.asset->url,
    "hospitals": hospitals[]->name,
    "regions": regions[]->name,
    whatsapp, phone
  }`)
}

// Professional search index — location-first.
export async function getProfessionals() {
  return client.fetch(`*[_type == "practitioner" && isProfessional == true && published == true]{
    "slug": slug.current, name, title, tier,
    "photo": photo.asset->url,
    "fields": fields[]->name,
    "regions": regions[]->name,
    languages, whatsapp, phone
  }`)
}

export async function getPractitioner(slug: string) {
  return client.fetch(
    `*[_type == "practitioner" && slug.current == $slug][0]{
      ..., "photoUrl": photo.asset->url,
      "hospitals": hospitals[]->name, "fields": fields[]->name, "regions": regions[]->name
    }`,
    {slug}
  )
}

export async function getPremiumDoulaSlugs() {
  return client.fetch(
    `*[_type == "practitioner" && isDoula == true && tier == "premium" && published == true].slug.current`
  )
}

export async function getSiteSettings() {
  return client.fetch(`*[_type == "siteSettings"][0]`)
}
