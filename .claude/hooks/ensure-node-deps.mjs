#!/usr/bin/env node

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const packages = ["web", "studio", "tools/import"];
const installed = [];

for (const dir of packages) {
  if (existsSync(`${dir}/node_modules`)) continue;
  execFileSync("npm", ["install"], { cwd: dir, stdio: "inherit" });
  installed.push(dir);
}

if (installed.length > 0) {
  console.log(`Installed missing Node dependencies in: ${installed.join(", ")}`);
}
