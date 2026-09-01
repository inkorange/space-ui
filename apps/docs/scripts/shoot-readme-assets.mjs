#!/usr/bin/env node
// Shoots both README images from the live gallery:
//
//   .github/assets/components.jpg  — the component stickersheet
//   .github/assets/doc-screen.jpg  — the docs site itself, sidebar and all
//
// Both used to be produced by hand: the stickersheet was a drawing of the
// components rather than the components, and the doc-screen was a manual
// capture that went stale the moment the landing-page copy changed. Rendering
// them from the running gallery means they are only ever as wrong as the
// gallery is.
//
//   pnpm docs                 # in one terminal
//   pnpm assets               # in another
//
// JPEG at quality 92 with 4:4:4 chroma. The default 4:2:0 halves colour
// resolution, which is exactly what smears a thin ember rim or a coloured
// badge on a dark ground — the things this library is being judged on.
// Playwright's own JPEG encoder gives no control over subsampling, so the
// capture is PNG and sharp-free re-encoding happens through Chromium itself
// via a canvas, keeping this script dependency-light.
//
// Playwright is deliberately not a repo dependency: this is an authoring tool
// run a few times a release, not part of the build or CI.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const assets = resolve(here, "../../../.github/assets");
const port = process.env.LADLE_PORT ?? "61000";
const base = `http://localhost:${port}`;

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

const QUALITY = 0.92;

/** Re-encode a PNG buffer to JPEG inside the page, so no image library is
 *  needed here. Chromium's canvas encoder writes 4:4:4 at this quality. */
const toJpeg = async (page, pngBuffer) =>
  Buffer.from(
    await page.evaluate(
      async ([b64, q]) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        // JPEG has no alpha; paint the page's own ground so any transparent
        // pixel does not composite onto white.
        ctx.fillStyle = getComputedStyle(document.documentElement).backgroundColor || "#0a0c10";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        return c.toDataURL("image/jpeg", q).split(",")[1];
      },
      [pngBuffer.toString("base64"), QUALITY],
    ),
    "base64",
  );

const browser = await chromium.launch();

const shoot = async ({ name, url, width, height, scale, clip, selector, settle = 700 }) => {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: scale,
  });
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
  } catch {
    console.error(`could not reach ${url} — is \`pnpm docs\` running?`);
    await browser.close();
    process.exit(1);
  }

  // The gallery's preview-mode escape hatch is fixed-positioned and would
  // otherwise be captured sitting on top of the content.
  await page.addStyleTag({ content: ".docs-exit-fullscreen { display: none !important; }" });

  const target = selector ? page.locator(selector) : page;
  if (selector) await target.waitFor({ timeout: 15_000 });
  // Rim and starfield animations never settle, so networkidle alone is not
  // enough: give the entry transitions a beat so nothing is caught mid-fade.
  await page.waitForTimeout(settle);

  const png = await target.screenshot(clip ? { clip } : undefined);
  const jpeg = await toJpeg(page, png);
  const out = resolve(assets, name);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, jpeg);
  console.log(`  ${name}  ${(jpeg.length / 1024).toFixed(0)} kB`);
  await page.close();
};

mkdirSync(assets, { recursive: true });
console.log("shooting README assets:");

// The stickersheet: preview mode, so only the sheet is on screen.
await shoot({
  name: "components.jpg",
  url: `${base}/?story=overview--stickersheet&mode=preview`,
  width: 1320,
  height: 1000,
  scale: 1.5,
  selector: ".docs-sheet",
});

// The docs site as a visitor first meets it — sidebar, nav and the hero —
// so the README image sells clicking through rather than just showing a page.
await shoot({
  name: "doc-screen.jpg",
  url: `${base}/?story=overview--introduction`,
  width: 1440,
  height: 900,
  scale: 1.5,
  clip: { x: 0, y: 0, width: 1440, height: 860 },
  settle: 1100,
});

await browser.close();
