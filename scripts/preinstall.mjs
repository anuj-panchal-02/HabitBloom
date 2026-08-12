import { existsSync, rmSync } from "node:fs";

// Remove lockfiles that would conflict with pnpm's lockfile.
for (const file of ["package-lock.json", "yarn.lock"]) {
  if (existsSync(file)) {
    rmSync(file);
  }
}

// This workspace must be installed with pnpm.
const userAgent = process.env.npm_config_user_agent ?? "";
if (!userAgent.toLowerCase().startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}
