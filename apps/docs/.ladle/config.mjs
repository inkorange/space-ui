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
      "overview--stickersheet",
      "foundations--color",
      "foundations--spacing",
      "foundations--type-scale",
      "foundations--token-usage",
      "foundations--motion",
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

    <!-- Ladle emits its own spoon favicon into the head first; these come
         after it, so they win. Sizes are declared explicitly rather than left
         to the browser, which otherwise picks whichever link it saw last
         regardless of how well it fits. Files live in public/ and are all
         downscales of public/space-ui-logo.png. -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">
    <meta name="theme-color" content="#0090ff">

    <!-- Appending is not enough on its own. Ladle's links are emitted BEFORE
         these and its assets are content-hashed into the build, so they can
         be neither overridden by filename from public/ nor removed from the
         template. Two of them would otherwise win outright: only the FIRST
         rel="manifest" counts, and Chrome prefers an SVG icon over a .ico
         whatever the order. So drop Ladle's, by href, once ours are parsed. -->
    <script>
      (function () {
        // A plain list, not a regex: appendToHead is a template literal, and
        // every backslash in a pattern here is silently eaten before it ever
        // reaches the browser.
        var ours = [
          "/favicon.ico",
          "/favicon-32.png",
          "/favicon-16.png",
          "/apple-touch-icon.png",
          "/site.webmanifest",
        ];
        var sel = 'link[rel~="icon"],link[rel="mask-icon"],link[rel="apple-touch-icon"],link[rel="manifest"]';
        document.querySelectorAll(sel).forEach(function (l) {
          if (ours.indexOf(l.getAttribute("href")) === -1) l.remove();
        });
      })();
    </script>
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
