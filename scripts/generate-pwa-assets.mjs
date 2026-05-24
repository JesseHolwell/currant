#!/usr/bin/env node
/**
 * Generate PWA assets (icons + web manifest) for every app from a single spec.
 *
 * Run with: npm run generate:pwa
 *
 * Outputs per app under `apps/<app>/public/`:
 *   - icon-192.png         Android maskable + any-purpose icon
 *   - icon-512.png         large display icon
 *   - apple-touch-icon.png 180×180 iOS home-screen icon
 *   - manifest.webmanifest the web app manifest
 *
 * The icon design is intentionally simple — a flat colored rounded square
 * with a centered serif letter. Replace with proper artwork later; the
 * manifest references the same filenames so swapping the PNGs is enough.
 */

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const APPS = [
  {
    id: "shell",
    name: "Currant",
    shortName: "Currant",
    description: "Your overview across Cash, Health, and Mind.",
    publicDir: "apps/shell/public",
    bg: "#8b6f47",
    fg: "#ffffff",
    glyph: "C",
    scope: "/",
    startUrl: "/"
  },
  {
    id: "cash",
    name: "Currant Cash",
    shortName: "Cash",
    description: "Money you can see.",
    publicDir: "apps/cash/public",
    bg: "#8B2942",
    fg: "#ffffff",
    glyph: "$",
    scope: "/cash/",
    startUrl: "/cash/"
  },
  {
    id: "health",
    name: "Currant Health",
    shortName: "Health",
    description: "Body you can measure.",
    publicDir: "apps/health/public",
    bg: "#2f9e6b",
    fg: "#ffffff",
    glyph: "H",
    scope: "/health/",
    startUrl: "/health/"
  },
  {
    id: "mind",
    name: "Currant Mind",
    shortName: "Mind",
    description: "Wellbeing you can track.",
    publicDir: "apps/mind/public",
    bg: "#6b5b95",
    fg: "#ffffff",
    glyph: "M",
    scope: "/mind/",
    startUrl: "/mind/"
  }
];

// iOS doesn't apply Android-style masking; render the icon edge-to-edge with
// generous padding so it looks balanced inside the system's own corner mask
// (iOS rounds whatever you give it).
function iconSvg(spec, size, { rounded }) {
  const radius = rounded ? Math.round(size * 0.22) : 0;
  // Letter size scales with canvas. Serif font matches the suite's display font.
  const fontSize = Math.round(size * 0.62);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${spec.bg}"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="${fontSize}"
    font-weight="600"
    fill="${spec.fg}"
  >${spec.glyph}</text>
</svg>`;
}

async function writePng(svg, outPath) {
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

function manifest(spec) {
  return {
    name: spec.name,
    short_name: spec.shortName,
    description: spec.description,
    start_url: spec.startUrl,
    scope: spec.scope,
    display: "standalone",
    orientation: "portrait",
    background_color: spec.bg,
    theme_color: spec.bg,
    icons: [
      {
        src: "./icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "./icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
}

function step(message) {
  console.log(`[generate-pwa-assets] ${message}`);
}

for (const spec of APPS) {
  const outDir = join(repoRoot, spec.publicDir);
  mkdirSync(outDir, { recursive: true });

  step(`${spec.id}: icons`);
  // Android-style icons (rounded corners — Chrome will mask if "any maskable" is set,
  // but iOS uses these too if the system grabs the larger sizes).
  await writePng(iconSvg(spec, 192, { rounded: true }), join(outDir, "icon-192.png"));
  await writePng(iconSvg(spec, 512, { rounded: true }), join(outDir, "icon-512.png"));
  // iOS apple-touch-icon: keep corners square — iOS applies its own corner radius.
  await writePng(iconSvg(spec, 180, { rounded: false }), join(outDir, "apple-touch-icon.png"));

  step(`${spec.id}: manifest`);
  writeFileSync(
    join(outDir, "manifest.webmanifest"),
    JSON.stringify(manifest(spec), null, 2) + "\n"
  );
}

step("done");
