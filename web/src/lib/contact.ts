function normalizePhone(raw: string): string | null {
	const safeRaw = raw.trim().replace(/%[0-9A-Fa-f]{2}.*/, "");
	const candidate = safeRaw.match(/(?:\+?972|0)\d[\d\s().-]{7,12}/)?.[0] ?? safeRaw;
	const digits = candidate.replace(/\D/g, "");
	if (!digits) return null;
	if (digits.startsWith("972") && digits.length >= 11) return digits.slice(0, 12);
	if (digits.startsWith("0") && digits.length >= 9) return `972${digits.slice(1, 10)}`;
	return null;
}

/**
 * Produce a wa.me href.
 * Prefers `whatsapp` field; falls back to `phone` when whatsapp is absent/malformed.
 * Returns null when neither yields a valid number.
 */
export function whatsappHref(whatsapp: string | undefined, phone: string | undefined): string | null {
	if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(whatsapp ?? "")) return whatsapp ?? null;
	const normalized = normalizePhone(whatsapp ?? "") ?? normalizePhone(phone ?? "");
	return normalized ? `https://wa.me/${normalized}` : null;
}

/** tel: href with E.164 +972 prefix. */
export function telHref(phone: string | undefined): string | null {
	if (!phone) return null;
	const normalized = normalizePhone(phone);
	return normalized ? `tel:+${normalized}` : null;
}

/** mailto: href; returns null when email is absent. */
export function mailtoHref(email: string | undefined): string | null {
	return email ? `mailto:${email}` : null;
}

/**
 * Instagram profile href.
 * Accepts a full URL or a bare handle (with or without @).
 */
export function instagramHref(handle: string | undefined): string | null {
	if (!handle) return null;
	if (handle.startsWith("http")) return handle;
	return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}
