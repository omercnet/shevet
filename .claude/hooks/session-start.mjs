#!/usr/bin/env node

console.log(`Shevet Imahot repo context:
- Components are coupled: Studio schemas -> importer mapping -> web GROQ queries -> contract scripts.
- Web changes: usually run cd web && npm run check && npm run build; add lint/contracts when touching contact, redirects, content, or pages.
- Schema/content changes: update studio/schemaTypes, web/src/lib/queries.ts, tools/import/import.mjs, and web/scripts/*-contract.mjs together.
- Secrets/PII: never read or commit .env files, WXR exports, XML dumps, Sanity tokens, or practitioner contact exports.`);
