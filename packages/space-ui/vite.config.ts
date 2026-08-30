import { defineConfig } from "vite";
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
        spaceControls: resolve(__dirname, "src/styles/spaceControls.ts"),
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
    environment: "happy-dom",
    css: { modules: { classNameStrategy: "non-scoped" } },
  },
});
