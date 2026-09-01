#!/usr/bin/env node
// Builds the whole favicon / app-icon set from one master image.
//
//   pnpm icons                       # reads apps/docs/public/space-ui-logo.png
//   pnpm icons path/to/new-logo.png  # …or adopts a new master from anywhere
//
// The master is expected to be a square, full-bleed app icon, so every output
// is a plain downscale — no cropping, no padding, no background compositing.
//
// Resizing runs through a headless Chromium canvas rather than an image
// library: the repo has no runtime dependencies and this is an authoring tool
// run a few times a year, so adding sharp/jimp to the tree to serve it would
// be the wrong trade. Playwright is likewise not a dependency — install it for
// the run.
//
// The .ico is written here by hand. It is a PNG-in-ICO, which every browser
// still in use accepts, and the format is small enough that a bespoke writer
// beats a dependency.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "../public");
const master = resolve(publicDir, "space-ui-logo.png");

// Every size the site actually references, and why it exists.
const PNGS = [
  ["icon-512.png", 512, "site.webmanifest, installed-PWA icon"],
  ["icon-192.png", 192, "site.webmanifest, Android home screen"],
  ["apple-touch-icon.png", 180, "iOS home screen"],
  ["logo-64.png", 64, "the sidebar mark, which renders at 32px"],
  ["favicon-32.png", 32, "rel=icon"],
  ["favicon-16.png", 16, "rel=icon"],
];
// 64 is included so a hidpi tab has a size resampled for it rather than one
// the browser squashes itself.
const ICO_SIZES = [16, 32, 48, 64];

/** ICONDIR + ICONDIRENTRY[] + concatenated PNG payloads. */
const buildIco = (entries) => {
  const dir = Buffer.alloc(6 + entries.length * 16);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(entries.length, 4);

  let offset = dir.length;
  entries.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    // 256 is stored as 0; nothing here is that large, but the rule is the rule.
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2); // palette size: 0 for truecolour
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // colour planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });

  return Buffer.concat([dir, ...entries.map((e) => e.data)]);
};

// A new master can be handed in on the command line; it is copied into
// public/ first so the tree always records what the icons were built from.
const incoming = process.argv[2];
if (incoming) {
  const src = isAbsolute(incoming) ? incoming : resolve(process.cwd(), incoming);
  if (!existsSync(src)) {
    console.error(`no such file: ${src}`);
    process.exit(1);
  }
  writeFileSync(master, readFileSync(src));
  console.log(`adopted new master from ${incoming}`);
}

if (!existsSync(master)) {
  console.error(`no master at ${master} — pass one: pnpm icons <path>`);
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "playwright is not installed. It is deliberately not a repo dependency —\n" +
      "install it just for this run:  npm i -D playwright && npx playwright install chromium",
  );
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage();
const masterB64 = readFileSync(master).toString("base64");

const render = async (size) =>
  Buffer.from(
    await page.evaluate(
      async ([b64, s]) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = s;
        c.height = s;
        const ctx = c.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, s, s);
        return c.toDataURL("image/png").split(",")[1];
      },
      [masterB64, size],
    ),
    "base64",
  );

console.log("building icons from public/space-ui-logo.png:");

for (const [name, size, why] of PNGS) {
  const data = await render(size);
  writeFileSync(resolve(publicDir, name), data);
  console.log(`  ${name.padEnd(22)} ${String(size).padStart(3)}px  ${(data.length / 1024).toFixed(1)} kB  — ${why}`);
}

const ico = buildIco(
  await Promise.all(ICO_SIZES.map(async (size) => ({ size, data: await render(size) }))),
);
writeFileSync(resolve(publicDir, "favicon.ico"), ico);
console.log(`  ${"favicon.ico".padEnd(22)} ${ICO_SIZES.join("/")}  ${(ico.length / 1024).toFixed(1)} kB  — /favicon.ico`);

await browser.close();
console.log("\ncheck 16px by eye: it is the size that fails first.");
