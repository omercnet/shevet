#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8") || "{}");
const calls = Array.isArray(input.tool_calls) ? input.tool_calls : [];
const importContract = existsSync("/tmp/shevetbackup")
  ? "cd tools/import && npm run contract -- --dir /tmp/shevetbackup"
  : "cd tools/import && npm run contract -- --dir /path/to/wxr";

const changedPaths = new Set();
for (const call of calls) {
  if (!["Edit", "MultiEdit", "Write"].includes(call.tool_name)) continue;
  const path = call.tool_input?.file_path || call.tool_input?.path;
  if (typeof path === "string") changedPaths.add(path.replace(`${input.cwd}/`, ""));
}

if (changedPaths.size === 0) process.exit(0);

const checks = new Set();
const notes = new Set();

for (const path of changedPaths) {
  if (path.startsWith("web/")) checks.add("cd web && npm run check && npm run build");
  if (path.startsWith("studio/")) checks.add("cd studio && npm run typecheck && npm run build");
  if (path.startsWith("tools/import/")) checks.add(importContract);

  if (path === "netlify.toml" || path.startsWith("web/src/lib/contact") || path.startsWith("web/src/pages/")) {
    checks.add("cd web && npm run validation:contract");
  }

  if (path.startsWith("studio/schemaTypes/") || path === "web/src/lib/queries.ts" || path === "tools/import/import.mjs") {
    checks.add("cd web && npm run content:contract");
    checks.add(importContract);
    notes.add("Content-model change: keep Studio schema, GROQ query shape, importer mapping, and contracts in sync.");
  }

  if (path.startsWith("web/src/styles/") || path.startsWith("web/src/layouts/") || path.startsWith("web/src/components/")) {
    notes.add("UI change: preserve Hebrew RTL, Oron Yad brand tokens, mobile CTA/accessibility flow.");
  }
}

if (checks.size === 0 && notes.size === 0) process.exit(0);

console.log([
  "Repo check map for edited files:",
  ...Array.from(checks, (check) => `- ${check}`),
  ...Array.from(notes, (note) => `- ${note}`),
].join("\n"));
