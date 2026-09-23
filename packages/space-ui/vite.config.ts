import { defineConfig } from "vite";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Library build: ESM + CJS with every .module.scss precompiled into one
// shipped stylesheet (dist/space-ui.css) and hashed class maps inlined into
// the JS — consumers need zero Sass/CSS-modules tooling. tokens.css is NOT
// bundled here: it ships verbatim as its own entry so themes can override.
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, name) => `${name}.${format === "es" ? "js" : "cjs"}`,
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        // The whole library is client components; one banner on each entry
        // keeps RSC consumers honest without per-file ceremony.
        banner: '"use client";',
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "space-ui.css" : "[name][extname]",
      },
    },
  },
  test: {
    css: { modules: { classNameStrategy: "non-scoped" } },
    // Two suites, because the components answer to two different things.
    //
    // `unit` is the bulk: markup contracts and behaviour that needs no
    // layout, run in happy-dom because it starts in milliseconds.
    //
    // `browser` is the rest: everything that measures — the Carousel's
    // stopping points and drag, where a panel lands and which way it flips,
    // showMeasured. happy-dom reports every rectangle as zero, so those
    // paths cannot be tested there at all, only in a browser that does
    // layout. The two share one coverage report.
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "happy-dom",
          setupFiles: ["src/test/setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.browser.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
    coverage: {
      provider: "v8",
      // Only the shipped source counts. Tests, the type-only barrel, and the
      // re-export modules that carry no logic would flatter the number
      // without telling anyone anything.
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.*",
        "src/test/**",
        "src/index.ts",
        // A typed handle on the SCSS class map: declarations, no behaviour.
        // Its names are checked against the stylesheet by a test of its own.
        "src/styles/spaceControls.ts",
      ],
      // json-summary is what scripts/badges.mjs reads.
      reporter: ["text-summary", "json-summary"],
    },
  },
});
