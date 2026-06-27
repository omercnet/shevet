import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

const projectId = import.meta.env.SANITY_PROJECT_ID;
const dataset = import.meta.env.SANITY_DATASET ?? "production";
// Build-time read token. The dataset is private (holds practitioner contact
// details), so reads need auth. This is NOT `PUBLIC_`-prefixed, so Astro never
// exposes it to the browser — it is used only during the static build in Node.
const token = import.meta.env.SANITY_TOKEN || undefined;

// `false` until a real Sanity project is wired up. Lets the site build with no
// secrets: queries short-circuit to empty and pages render their empty state.
export const isConfigured: boolean =
	typeof projectId === "string" && projectId.length > 0 && projectId !== "PROJECT_ID";

export const client: SanityClient | null = isConfigured
	? createClient({
			projectId: projectId as string,
			dataset,
			apiVersion: "2024-01-01",
			useCdn: false, // build-time fetch — read live API so content is always fresh
			token,
		})
	: null;

// Fetch helper that returns a fallback when Sanity is not configured.
export async function sanityFetch<T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> {
	if (!client) return fallback;
	return client.fetch<T>(query, params);
}

const builder = client ? createImageUrlBuilder(client) : null;
export const urlFor = (source: Parameters<NonNullable<typeof builder>["image"]>[0]) => builder?.image(source) ?? null;
