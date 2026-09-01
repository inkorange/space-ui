import { defineConfig } from "vite";
import { resolve } from "node:path";
import { spaceDocsPlugin } from "./vite-plugin-space-docs";

// The gallery runs against the LIBRARY SOURCE, not dist: hot reload on
// component edits with no build step in the loop.
export default defineConfig({
  // Generates prop tables and token usage from the library source at build
  // time, exposed as `virtual:space-docs`. Hand-written API docs drift.
  plugins: [spaceDocsPlugin()],
  resolve: {
    alias: {
      "@inkorange/space-ui/tokens.css": resolve(
        __dirname,
        "../../packages/space-ui/src/styles/tokens.css",
      ),
      "@inkorange/space-ui": resolve(__dirname, "../../packages/space-ui/src/index.ts"),
    },
  },
});
