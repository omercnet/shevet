# Check map

Use this when deciding what to verify after edits.

- `web/**`: `cd web && npm run check && npm run build`
- `studio/**`: `cd studio && npm run typecheck && npm run build`
- `tools/import/**`: `cd tools/import && npm run contract -- --dir /tmp/shevetbackup` when that backup exists.
- `netlify.toml`, `web/src/lib/contact.ts`, `web/src/pages/**`: also `cd web && npm run validation:contract`
- `studio/schemaTypes/**`, `web/src/lib/queries.ts`, `tools/import/import.mjs`: update all three surfaces together, then run `cd web && npm run content:contract` and the importer contract against the WXR directory.
- UI/brand files: verify Hebrew RTL, Oron Yad tokens, mobile CTA/accessibility behavior.
