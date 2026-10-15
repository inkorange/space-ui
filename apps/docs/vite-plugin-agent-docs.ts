import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { buildDocs, buildIconNames } from "./vite-plugin-space-docs";
import type { ComponentDoc, PropDoc, TokenDoc } from "./vite-plugin-space-docs";

/**
 * Emits the machine-readable face of the gallery: `llms.txt`, `llms-full.txt`,
 * a static `reference.html`, `robots.txt` and `sitemap.xml`.
 *
 * Why this exists. The gallery is a client-rendered app, so a reader that does
 * not run JavaScript — a crawler on a budget, a training pipeline, an agent
 * holding a URL and a fetch tool — sees an empty shell and learns nothing.
 * Twenty-four documented components were invisible to every one of them.
 *
 * Everything here is DERIVED, from the same TypeScript AST pass that builds
 * the gallery's prop tables, so these files cannot drift from the library the
 * way a hand-written agent cheatsheet would. The only hand-written part is
 * USAGE_RULES below: the things an agent gets wrong that no type signature
 * says out loud.
 */

const PKG = JSON.parse(
  readFileSync(resolve(__dirname, "../../packages/space-ui/package.json"), "utf8"),
) as { name: string; version: string; license: string };

const TOKENS_CSS = resolve(__dirname, "../../packages/space-ui/src/styles/tokens.css");

const SITE = "https://space-components.vercel.app";
const REPO = "https://github.com/inkorange/space-ui";
const NPM = `https://www.npmjs.com/package/${PKG.name}`;

/**
 * The summary every surface opens with. One paragraph, because an agent
 * deciding whether a library fits reads the first sentence and little else.
 */
const SUMMARY =
  "A React 19 component library and design system for dark interfaces. " +
  "Zero runtime dependencies, precompiled CSS, and a role-based design-token " +
  "system. Install it, import one stylesheet, and the components are finished: " +
  "there is no theme to configure, no provider to mount and no build-time " +
  "plugin to register.";

/**
 * What a model gets wrong when it writes against this library from the type
 * signatures alone. Each rule exists because it is NOT inferable from the
 * types: the types permit an inline style override, a second CSS framework and
 * a hand-rolled aria-checked, and all three are mistakes here.
 *
 * Written as instructions rather than description, because that is how they
 * are read.
 */
const USAGE_RULES: Array<{ rule: string; detail: string; code?: string }> = [
  {
    rule: "Import the stylesheet once, at the application root",
    detail:
      "Every component's CSS ships precompiled in one file. There is no per-component import and no Sass for consumers.",
    code: `import "@inkorange/space-ui/styles.css";`,
  },
  {
    rule: "Do not add a provider, context or theme wrapper",
    detail:
      "Components read design tokens straight from CSS custom properties on the document. Nothing needs to be mounted above them.",
  },
  {
    rule: "The library is dark-only, by design",
    detail:
      "The tokens can be re-pointed, but the components are drawn as lit glass over a dark ground, so a light palette misrepresents every surface. There is no supported light theme; do not build one.",
  },
  {
    rule: "Style with tokens, never with raw lengths or colours",
    detail:
      "Spacing comes from the step scale, control heights from the ladder, colour from a named role. A raw px value puts the layout off the 8pt grid the whole library shares.",
    code: `/* Right */
.panel { padding: var(--spacing-md); gap: var(--spacing-sm); }

/* Wrong — off the grid, and it will not retune with the library */
.panel { padding: 16px; gap: 8px; }`,
  },
  {
    rule: "Override a component token on a class, not with an inline style",
    detail:
      "An inline style sets the property at the highest specificity there is, so it defeats every media and container query the consumer later writes. Set the token on a class instead.",
    code: `/* Right */
.featured { --sp-carousel-view-count: 2.5; }

/* Wrong */
<Carousel style={{ "--sp-carousel-view-count": 2.5 }} />`,
  },
  {
    rule: "Component tokens are named --sp-[component]-[modifier]-[type]",
    detail:
      "So `--sp-carousel-gap-size`, `--sp-checkbox-label-gap-size`. Every token a component accepts is listed with that component below.",
  },
  {
    rule: "Boolean props default to false, so the bare attribute is the idiom",
    detail:
      "Write `<Button fullWidth />`, not `fullWidth={true}`. The one deliberate exception is `animated`, which defaults to true.",
  },
  {
    rule: "Selection components are controlled through onValueChange",
    detail:
      "Select, Slider, RadioGroup, CheckboxGroup and Tabs take a `value` and an `onValueChange`. Native text inputs (TextField, TextArea) keep React's own `value` and `onChange`.",
    code: `const [size, setSize] = useState("md");
<Select value={size} onValueChange={setSize}>…</Select>`,
  },
  {
    rule: "Keyboard support and ARIA are already inside each component",
    detail:
      "Roving tabindex, arrow-key navigation, Escape handling, aria-checked, aria-expanded and aria-current are implemented. Do not re-declare them from outside. Do pass `aria-label` wherever a control has no visible label.",
  },
  {
    rule: "Nothing touches the DOM at import time",
    detail:
      "Components that measure do it inside effects, so the entry point imports cleanly in a server build. Components that need the top layer use the platform popover API, so no portal target has to be provided.",
  },
];

/** `--spacing-md: calc(…)  /* 16px *\/` → the px a reader actually wants. */
const scaleFrom = (pattern: RegExp): Array<{ name: string; px: string }> => {
  const css = readFileSync(TOKENS_CSS, "utf8");
  const out: Array<{ name: string; px: string }> = [];
  // The trailing comment must be on the token's OWN line: `\s*` after the
  // semicolon crosses newlines and happily annotates a token with the comment
  // introducing the next section, which is how the spacing scale came to be
  // documented as "Grays — role-based".
  for (const m of css.matchAll(
    /^[^\S\n]*(--[a-zA-Z0-9-]+)[^\S\n]*:[^\S\n]*([^;\n]+);(?:[^\S\n]*\/\*[^\S\n]*([^*\n]*?)[^\S\n]*\*\/)?/gm,
  )) {
    const [, name, value, comment] = m;
    if (!pattern.test(name)) continue;
    const flat = (comment || value).replace(/\s+/g, " ").trim();
    out.push({ name, px: flat });
  }
  return out;
};

const FOUNDATIONS = () => ({
  spacing: scaleFrom(/^--spacing-/),
  controls: scaleFrom(/^--sp-control-height/),
  type: scaleFrom(/^--sp-font-(xs|sm|md|lg|xl|2xl|3xl)$/),
  grid: scaleFrom(/^--sp-grid-base-size$/),
});

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");

const table = (headers: string[], rows: string[][]): string =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`),
  ].join("\n");

const propRows = (props: PropDoc[]) =>
  props.map((p) => [
    `\`${p.name}\``,
    `\`${p.type}\``,
    p.required ? "required" : p.defaultValue ? `\`${p.defaultValue}\`` : "—",
    p.description || "",
  ]);

const tokenRows = (tokens: TokenDoc[]) =>
  tokens.map((t) => [`\`${t.name}\``, t.defaults.length ? `\`${t.defaults[0]}\`` : "—", t.description || ""]);

/**
 * The first sentence of a description, for the index. Several components carry
 * a full prose guide in their JSDoc — Carousel's runs to three paragraphs on
 * responsive view counts — and an index that reprints all of it is no longer
 * an index. The full text still goes to llms-full.txt and reference.html.
 */
const firstSentence = (text: string): string => {
  if (!text) return "";
  // Stops at the first sentence end or the first heading the JSDoc introduces,
  // whichever comes first. Abbreviations are not a risk in this prose.
  const upToHeading = text.split(/\s##\s/)[0];
  const m = upToHeading.match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (m ? m[0] : upToHeading).trim();
};

/** The import line for a component, namespaced parts resolving to their root. */
const importOf = (name: string) => `import { ${name.split(".")[0]} } from "${PKG.name}";`;

const componentSection = (doc: ComponentDoc): string => {
  const parts: string[] = [`## ${doc.name}`, ""];
  if (doc.description) parts.push(doc.description, "");
  parts.push("```tsx", importOf(doc.name), "```", "");

  parts.push("### Props", "", table(["Prop", "Type", "Default", "Notes"], propRows(doc.props)), "");

  if (doc.extendsFrom.length) {
    const notable = doc.inherited.map((p) => `\`${p.name}\``).join(", ");
    parts.push(
      `Also accepts every attribute of ${doc.extendsFrom.map((e) => `\`${e}\``).join(" and ")}` +
        (doc.inheritedCount ? ` — ${doc.inheritedCount} inherited props` : "") +
        (notable ? `, of which the ones usually reached for are ${notable}.` : "."),
      "",
    );
  }

  for (const shape of doc.types) {
    parts.push(
      `### ${shape.name}`,
      "",
      `The shape behind ${shape.usedBy.map((u) => `\`${u}\``).join(", ")}.` +
        (shape.description ? ` ${shape.description}` : ""),
      "",
      table(["Field", "Type", "Required", "Notes"], propRows(shape.fields)),
      "",
    );
  }

  if (doc.tokens.length) {
    parts.push(
      "### Tokens",
      "",
      "Set these on a class that wraps or targets the component.",
      "",
      table(["Token", "Default", "Notes"], tokenRows(doc.tokens)),
      "",
    );
  }

  return parts.join("\n");
};

// ---------------------------------------------------------------------------
// llms.txt — the index
// ---------------------------------------------------------------------------

const llmsIndex = (docs: ComponentDoc[], icons: string[]): string => {
  const f = FOUNDATIONS();
  // One line per component, root names only: an index is for deciding what to
  // read, and `Select.Trigger` is not a separate decision from `Select`.
  const roots = docs.filter((d) => !d.name.includes("."));

  return `# SpaceUI

> ${SUMMARY}

- Package: \`${PKG.name}\` v${PKG.version}, ${PKG.license}
- Peer dependencies: react >= 19, react-dom >= 19. No other runtime dependencies.
- Repository: ${REPO}
- Interactive gallery: ${SITE}
- Full API reference for machines: ${SITE}/llms-full.txt
- Full API reference as HTML: ${SITE}/reference.html

## Install

\`\`\`bash
npm install ${PKG.name}
\`\`\`

\`\`\`tsx
import "${PKG.name}/styles.css";
import { Card, Heading, Text, Badge, Button } from "${PKG.name}";

export function Planet() {
  return (
    <Card>
      <Heading size="5">Kepler-442b</Heading>
      <Badge color="success">Temperate</Badge>
      <Text size="2" color="muted">A super-earth in the habitable zone.</Text>
      <Button>Build planet</Button>
    </Card>
  );
}
\`\`\`

Two further entry points exist: \`${PKG.name}/styles.css\` is the one required
stylesheet, and \`${PKG.name}/tokens.css\` is the token layer on its own, for a
project that wants the palette and the scales without the components.

## Rules for writing code against this library

${USAGE_RULES.map(
  (r, i) =>
    `${i + 1}. **${r.rule}.** ${r.detail}${r.code ? `\n\n\`\`\`${r.code.startsWith("/*") || r.code.startsWith(".") ? "css" : "tsx"}\n${r.code}\n\`\`\`\n` : ""}`,
).join("\n")}

## Scales

Spacing is an 8pt grid: every step is a multiple of \`--sp-grid-base-size\`
(${f.grid[0]?.px ?? "8px"}), so one token retunes the library's rhythm. A value off the
scale means the design is off the grid.

${table(["Token", "Value"], [...f.spacing, ...f.controls, ...f.type].map((s) => [`\`${s.name}\``, s.px]))}

Type is sized in rem so it follows a reader who has enlarged their browser
text. Control heights come from the ladder, never from padding arithmetic, so
a Button and the Select beside it are the same height.

## Colour roles

Colour is always a named role, never a hue or a step on a ramp. Within a role,
the suffix says the job: \`-solid\` fills a shape, \`-text\` sits on the dark
ground, \`-soft\` is a wash behind it, \`-border\` outlines, \`-glow\` is a halo,
and \`-deep\` ends a gradient. The emphasis role is \`primary\`; the status roles
are \`success\`, \`warning\`, \`danger\` and \`accent\`.

## Components

${roots.map((d) => `- **${d.name}** — ${firstSentence(d.description)}`).join("\n")}

## Icons

${icons.length} icons ship from the same entry point, as React components taking the
standard SVG props: ${icons.map((n) => `\`${n}\``).join(", ")}.

## Full documentation

- [Full API reference](${SITE}/llms-full.txt): every component, prop, data shape and token.
- [HTML reference](${SITE}/reference.html): the same, crawlable, no JavaScript required.
- [Interactive gallery](${SITE}): live specimens, source for each, and task guides.
- [Source](${REPO}): components, tests and tokens.
- [npm](${NPM}): published with provenance.
`;
};

// ---------------------------------------------------------------------------
// llms-full.txt — everything
// ---------------------------------------------------------------------------

const llmsFull = (docs: ComponentDoc[], icons: string[]): string =>
  [
    `# SpaceUI — full API reference`,
    "",
    `> ${SUMMARY}`,
    "",
    `Version ${PKG.version}. Generated from the library source, so it describes`,
    `exactly the version named here. Index: ${SITE}/llms.txt`,
    "",
    "## How to read this",
    "",
    "Each component lists its own props, then the props it inherits from a DOM",
    "attribute set, then any data shape a caller has to build, then the tokens it",
    "accepts. A prop marked required has no default; everything else shows the",
    "default the component itself applies.",
    "",
    USAGE_RULES.map((r, i) => `${i + 1}. **${r.rule}.** ${r.detail}`).join("\n"),
    "",
    "---",
    "",
    docs.map(componentSection).join("\n---\n\n"),
    "---",
    "",
    "## Icons",
    "",
    `Imported from the same entry point and taking the standard SVG props, so`,
    `\`className\`, \`width\`, \`aria-hidden\` and the rest all work:`,
    "",
    "```tsx",
    `import { ${icons.slice(0, 3).join(", ")} } from "${PKG.name}";`,
    "```",
    "",
    icons.map((n) => `- \`${n}\``).join("\n"),
    "",
  ].join("\n");

// ---------------------------------------------------------------------------
// reference.html — the same reference, crawlable without JavaScript
// ---------------------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Inline `code` and **bold** in the hand-written prose, and nothing else. */
const inline = (s: string) =>
  esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

const htmlTable = (headers: string[], rows: string[][]) =>
  `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>` +
  rows
    .map((r) => `<tr>${r.map((c) => `<td>${inline(c.replace(/\\\|/g, "|"))}</td>`).join("")}</tr>`)
    .join("") +
  `</tbody></table>`;

const id = (name: string) => name.replace(/\./g, "-").toLowerCase();

const referenceHtml = (docs: ComponentDoc[], icons: string[]): string => {
  const f = FOUNDATIONS();
  const roots = docs.filter((d) => !d.name.includes("."));

  const body = docs
    .map((d) => {
      const parts = [`<section id="${id(d.name)}"><h2>${esc(d.name)}</h2>`];
      if (d.description) parts.push(`<p>${inline(d.description)}</p>`);
      parts.push(`<pre><code>${esc(importOf(d.name))}</code></pre>`);
      parts.push(`<h3>Props</h3>`, htmlTable(["Prop", "Type", "Default", "Notes"], propRows(d.props)));
      if (d.extendsFrom.length) {
        parts.push(
          `<p class="note">Also accepts every attribute of ${d.extendsFrom
            .map((e) => `<code>${esc(e)}</code>`)
            .join(" and ")}${d.inheritedCount ? ` — ${d.inheritedCount} inherited props` : ""}.</p>`,
        );
      }
      for (const shape of d.types) {
        parts.push(
          `<h3>${esc(shape.name)}</h3>`,
          `<p>The shape behind ${shape.usedBy.map((u) => `<code>${esc(u)}</code>`).join(", ")}.</p>`,
          htmlTable(["Field", "Type", "Required", "Notes"], propRows(shape.fields)),
        );
      }
      if (d.tokens.length) {
        parts.push(`<h3>Tokens</h3>`, htmlTable(["Token", "Default", "Notes"], tokenRows(d.tokens)));
      }
      parts.push(`</section>`);
      return parts.join("\n");
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SpaceUI API reference — ${esc(PKG.name)} v${esc(PKG.version)}</title>
<meta name="description" content="${esc(SUMMARY)}">
<link rel="canonical" href="${SITE}/reference.html">
<meta name="color-scheme" content="dark">
<link rel="icon" href="/favicon.ico" sizes="any">
<style>
  :root { color-scheme: dark; --ink: #edeef0; --dim: #b0b4ba; --line: #2a2f37; --code: #baa7ff; --link: #70b8ff; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 2.5rem 1rem 6rem; background: #0b0d10; color: var(--ink);
         font: 16px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  main, header { max-width: 60rem; margin: 0 auto; }
  h1 { font-size: 2rem; margin: 0 0 .5rem; letter-spacing: -0.02em; }
  h2 { font-size: 1.375rem; margin: 3rem 0 .5rem; padding-top: 1.5rem; border-top: 1px solid var(--line); }
  h3 { font-size: 1rem; margin: 1.5rem 0 .5rem; color: var(--dim); text-transform: uppercase; letter-spacing: .08em; }
  p { max-width: 42rem; }
  .lede { font-size: 1.125rem; color: var(--dim); max-width: 44rem; }
  .note { color: var(--dim); font-size: .875rem; }
  a { color: var(--link); }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .875em; color: var(--code); }
  pre { overflow-x: auto; padding: 1rem; background: #13161b; border: 1px solid var(--line); border-radius: 8px; }
  pre code { color: var(--ink); }
  table { width: 100%; border-collapse: collapse; margin: .5rem 0 1rem; font-size: .875rem; display: block; overflow-x: auto; }
  th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { color: var(--dim); font-weight: 500; white-space: nowrap; }
  ul.index { columns: 2; list-style: none; padding: 0; }
  ul.index li { margin-bottom: .25rem; break-inside: avoid; }
  ul.catalogue { list-style: none; padding: 0; max-width: 46rem; }
  ul.catalogue li { margin-bottom: .5rem; }
  ol li { margin-bottom: .75rem; max-width: 42rem; }
</style>
</head>
<body>
<header>
  <h1>SpaceUI API reference</h1>
  <p class="lede">${esc(SUMMARY)}</p>
  <p><code>${esc(PKG.name)}</code> v${esc(PKG.version)} · ${esc(PKG.license)} ·
     <a href="${SITE}">interactive gallery</a> ·
     <a href="${REPO}">source</a> ·
     <a href="${NPM}">npm</a> ·
     <a href="${SITE}/llms.txt">llms.txt</a></p>
  <pre><code>npm install ${esc(PKG.name)}

import "${esc(PKG.name)}/styles.css";
import { Button } from "${esc(PKG.name)}";</code></pre>
</header>
<main>
  <h2 style="border:0;padding:0;margin-top:2rem">Rules for writing code against this library</h2>
  <ol>
    ${USAGE_RULES.map((r) => `<li><strong>${esc(r.rule)}.</strong> ${inline(r.detail)}${r.code ? `<pre><code>${esc(r.code)}</code></pre>` : ""}</li>`).join("\n    ")}
  </ol>

  <h2>Scales</h2>
  <p>Spacing is an 8pt grid: every step is a multiple of <code>--sp-grid-base-size</code>
     (${esc(f.grid[0]?.px ?? "8px")}). Type is sized in rem. Control heights come from the
     ladder, so a Button and the Select beside it are the same height.</p>
  ${htmlTable(["Token", "Value"], [...f.spacing, ...f.controls, ...f.type].map((s) => [`\`${s.name}\``, s.px])) }

  <h2>Components</h2>
  <ul class="catalogue">
    ${roots.map((d) => `<li><a href="#${id(d.name)}">${esc(d.name)}</a> — ${inline(firstSentence(d.description))}</li>`).join("\n    ")}
  </ul>

${body}

  <section id="icons">
    <h2>Icons</h2>
    <p>${icons.length} icons ship from the same entry point as React components taking the
       standard SVG props.</p>
    <ul class="index">${icons.map((n) => `<li><code>${esc(n)}</code></li>`).join("")}</ul>
  </section>
</main>
</body>
</html>
`;
};

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

const robots = () =>
  `# Everything here is public documentation, and the point of it is to be read.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;

const sitemap = () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ["/", "/reference.html", "/llms.txt", "/llms-full.txt"];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`)
  .join("\n")}
</urlset>
`;
};

/**
 * What a reader without JavaScript gets at the root URL. Not a courtesy
 * message: the real pitch, the install line and a link onward to the full
 * reference, because for a crawler this is the whole page.
 */
const noscript = (docs: ComponentDoc[]) => {
  const roots = docs.filter((d) => !d.name.includes(".")).map((d) => d.name);
  return `<noscript>
  <div style="max-width:52rem;margin:0 auto;padding:3rem 1.25rem;color:#edeef0;font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
    <h1 style="letter-spacing:-0.02em">SpaceUI</h1>
    <p style="font-size:1.125rem;color:#b0b4ba">${esc(SUMMARY)}</p>
    <pre style="padding:1rem;background:#13161b;border:1px solid #2a2f37;border-radius:8px;overflow-x:auto"><code>npm install ${esc(PKG.name)}</code></pre>
    <p>The interactive gallery needs JavaScript. The complete API reference does not:</p>
    <ul>
      <li><a href="/reference.html" style="color:#70b8ff">Full API reference</a> — every component, prop, data shape and token.</li>
      <li><a href="/llms.txt" style="color:#70b8ff">llms.txt</a> and <a href="/llms-full.txt" style="color:#70b8ff">llms-full.txt</a> — the same, for machines.</li>
      <li><a href="${REPO}" style="color:#70b8ff">Source on GitHub</a></li>
    </ul>
    <p style="color:#b0b4ba">Components: ${roots.map(esc).join(", ")}.</p>
  </div>
</noscript>`;
};

/** Structured data, so a crawler can file this as software rather than prose. */
const jsonLd = () =>
  `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "SpaceUI",
    description: SUMMARY,
    codeRepository: REPO,
    programmingLanguage: "TypeScript",
    runtimePlatform: "React 19",
    license: "https://opensource.org/licenses/MIT",
    version: PKG.version,
    url: SITE,
  })}</script>`;

export const agentDocsPlugin = (): Plugin => {
  // One AST pass, read lazily so `ladle serve` does not pay for it at boot.
  let docs: ComponentDoc[] | null = null;
  let icons: string[] | null = null;
  const built = () => {
    if (!docs) docs = buildDocs();
    if (!icons) icons = buildIconNames();
    return { docs, icons };
  };

  const files = (): Record<string, string> => {
    const { docs: d, icons: i } = built();
    return {
      "llms.txt": llmsIndex(d, i),
      "llms-full.txt": llmsFull(d, i),
      "reference.html": referenceHtml(d, i),
      "robots.txt": robots(),
      "sitemap.xml": sitemap(),
    };
  };

  return {
    name: "space-agent-docs",

    // Emitted as assets rather than written into public/: generated output in
    // a source tree goes stale the moment someone forgets to re-run it, and
    // these are rebuilt from source on every build.
    generateBundle() {
      for (const [fileName, source] of Object.entries(files())) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },

    // Served in dev too, so the files can be read at localhost before a deploy.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? "").split("?")[0].replace(/^\//, "");
        const all = files();
        if (!(path in all)) return next();
        res.setHeader(
          "Content-Type",
          path.endsWith(".html")
            ? "text/html; charset=utf-8"
            : path.endsWith(".xml")
              ? "application/xml; charset=utf-8"
              : "text/plain; charset=utf-8",
        );
        res.end(all[path]);
      });
    },

    transformIndexHtml: {
      order: "post",
      handler(html) {
        const { docs: d } = built();
        return html
          .replace(
            "</head>",
            [
              `<link rel="canonical" href="${SITE}/">`,
              `<meta property="og:type" content="website">`,
              `<meta property="og:title" content="SpaceUI — dark interfaces with their own light source">`,
              `<meta property="og:description" content="${esc(SUMMARY)}">`,
              `<meta property="og:url" content="${SITE}/">`,
              `<meta property="og:image" content="${SITE}/space-ui-logo.png">`,
              `<meta name="twitter:card" content="summary_large_image">`,
              // Points a reader that cannot run the gallery at one that needs
              // no JavaScript at all.
              `<link rel="alternate" type="text/plain" href="${SITE}/llms.txt" title="llms.txt">`,
              jsonLd(),
              "</head>",
            ].join("\n"),
          )
          .replace("</body>", `${noscript(d)}\n</body>`);
      },
    },
  };
};
