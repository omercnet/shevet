import {createClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID || 'PROJECT_ID',
  dataset: import.meta.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // content fetched at build time; CDN is fine
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)
