/**
 * Ladle configuration for the public space-ui gallery.
 *
 * The single most important line here is `addons.theme.defaultState: "dark"`.
 * Ladle scopes its entire chrome palette under `[data-theme="dark"]`; without
 * this, the app stays in light mode and every chrome colour resolves to its
 * light value — which is how the sidebar ended up rendering black links on a
 * forced dark background. Theme the app properly and the CSS in space.css
 * only has to re-point variables, never fight them with !important.
 *
 * @type {import('@ladle/react').UserConfig}
 */

export default {
  stories: "src/**/*.stories.{js,jsx,ts,tsx,mdx}",

  // Land on the introduction, not on whichever story sorts first.
  defaultStory: "overview--introduction",

  // MUST be self-contained. Ladle serialises this function to a string and
  // rebuilds it in the browser with `new Function(...)` (see the app's
  // get-config.ts), which discards the closure — any reference to a
  // module-scope binding here throws ReferenceError at startup and renders
  // the whole gallery blank. Keep every value it needs inside the body.
  storyOrder: (stories) => {
    const pinned = [
      "overview--introduction",
      "overview--installation",
      "foundations--color",
      "foundations--spacing",
      "foundations--type-scale",
      "foundations--token-usage",
    ].filter((id) => stories.includes(id));
    const rest = stories.filter((id) => !pinned.includes(id)).sort();
    return [...pinned, ...rest];
  },

  // Components sit one level deep, so open the tree by default — a visitor
  // should see the whole catalogue on arrival, not a row of closed folders.
  expandStoryTree: true,

  // The source modal is replaced by the always-visible inline listing, so
  // its hotkey would only open a duplicate of what is already on the page.
  hotkeys: { source: [] },

  appendToHead: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <meta name="description" content="SpaceUI — a React 19 component library with zero runtime dependencies, precompiled CSS, and a seven-role token system.">
    <meta name="color-scheme" content="dark">
  `,

  addons: {
    // The palette is unconditional (see space.css) because the library is
    // dark-only — a light mode would misrepresent every glass surface. A
    // toggle that changes nothing is worse than no toggle, so: off.
    theme: { enabled: false, defaultState: "dark" },
    // MUST stay enabled: Ladle only populates the `storySource` map when
    // this addon is on (see generate/get-story-source.js), and components.tsx
    // reads that map to render source inline beneath every specimen. The
    // toggle BUTTON is hidden in space.css and its hotkey cleared below —
    // the code is always visible, so a control to reveal it is redundant.
    source: { enabled: true, defaultState: false },
    a11y: { enabled: true },
    width: { enabled: true },
    control: { enabled: true },
    mode: { enabled: true },
    action: { enabled: false },
    rtl: { enabled: false },
    msw: { enabled: false },
  },
};
