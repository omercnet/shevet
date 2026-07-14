#!/usr/bin/env node

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

for (const dir of ["web", "studio", "tools/import"]) {
  if (existsSync(`${dir}/node_modules`)) continue;
  console.log(`Installing ${dir} dependencies...`);
  execFileSync("npm", ["install"], { cwd: dir, stdio: "inherit" });
}

console.log("Repo setup complete.");
