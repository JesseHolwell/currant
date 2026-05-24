#!/usr/bin/env node
/**
 * Combine each app's build output into a single dist/ for one-origin deploy.
 *
 *   dist/                  ← shell (suite landing + Life dashboard at /)
 *   dist/cash/             ← Cash SPA at /cash
 *   dist/health/           ← Health SPA at /health
 *   dist/mind/             ← Mind SPA at /mind
 *
 * Each vertical is built with `base: "./"` in its Vite config so relative
 * asset paths in `index.html` resolve correctly under its sub-path. We don't
 * rewrite any URLs here — we just stack the files.
 *
 * Run this AFTER each app's individual build has produced its dist/.
 */

import { existsSync, rmSync, mkdirSync, cpSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outDir = join(repoRoot, "dist");

const APPS = [
  { name: "shell", source: "apps/shell/dist", target: "" },
  { name: "cash", source: "apps/cash/dist", target: "cash" },
  { name: "health", source: "apps/health/dist", target: "health" },
  { name: "mind", source: "apps/mind/dist", target: "mind" }
];

function step(message) {
  console.log(`[assemble-dist] ${message}`);
}

step(`fresh ${outDir}`);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const app of APPS) {
  const sourcePath = join(repoRoot, app.source);
  if (!existsSync(sourcePath)) {
    console.error(
      `[assemble-dist] missing build output for ${app.name}: expected ${sourcePath}\n` +
        `Did you run the app's build step first? See the build:all script.`
    );
    process.exit(1);
  }
  const targetPath = app.target ? join(outDir, app.target) : outDir;
  step(`copy ${app.source} → dist/${app.target || ""}`);
  cpSync(sourcePath, targetPath, { recursive: true });
}

step("done");
