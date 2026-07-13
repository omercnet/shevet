/**
 * Convert a YouTube/Vimeo watch URL into its embeddable iframe src.
 * Returns null when the URL doesn't match a known provider, so callers
 * can fall back to a plain link.
 */
export function videoEmbedSrc(url: string | undefined): string | null {
	if (!url) return null;

	const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
	if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;

	const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
	if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

	return null;
}
