export const serializeInlineJson = (value: unknown): string =>
	(JSON.stringify(value) ?? "null").replace(/</g, "\\u003c");
