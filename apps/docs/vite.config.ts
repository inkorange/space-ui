import { defineConfig } from "vite";
import { resolve } from "node:path";

// The gallery runs against the LIBRARY SOURCE, not dist: hot reload on
// component edits with no build step in the loop.
export default defineConfig({
  resolve: {
    alias: {
      "@inkorange/space-ui/tokens.css": resolve(
        __dirname,
        "../../packages/space-ui/src/styles/tokens.css",
      ),
      "@inkorange/space-ui/spaceControls": resolve(
        __dirname,
        "../../packages/space-ui/src/styles/spaceControls.ts",
      ),
      "@inkorange/space-ui": resolve(__dirname, "../../packages/space-ui/src/index.ts"),
    },
  },
});
