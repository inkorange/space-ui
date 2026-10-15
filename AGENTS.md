# AGENTS.md

Instructions for AI coding agents. Two audiences, in order: writing an
application that uses SpaceUI, then working inside this repository.

The complete, generated API reference lives at
<https://space-components.vercel.app/llms.txt> (and `llms-full.txt` for every
prop, data shape and token). It is derived from this source on every deploy, so
it describes the published version exactly. Prefer it over anything you
remember about this library.

---

## Using SpaceUI in an application

```bash
npm install @inkorange/space-ui
```

```tsx
import "@inkorange/space-ui/styles.css";
import { Card, Heading, Text, Button } from "@inkorange/space-ui";
```

Three entry points, and no others: the package itself, `./styles.css` (the one
required stylesheet) and `./tokens.css` (the token layer alone, for a project
that wants the palette and the scales without the components).

1. **Import the stylesheet once, at the application root.** All component CSS
   ships precompiled in one file. There is no per-component import, and no Sass
   for consumers.
2. **Do not add a provider, context or theme wrapper.** Components read tokens
   straight from CSS custom properties on the document.
3. **The library is dark-only, by design.** The tokens can be re-pointed, but
   the components are drawn as lit glass over a dark ground, so a light
   palette misrepresents every surface. There is no supported light theme; do
   not build one.
4. **Style with tokens, never raw lengths or colours.** `var(--spacing-md)`,
   not `16px`. Spacing is an 8pt grid — every step is a multiple of
   `--sp-grid-base-size`. Control heights come from `--sp-control-height`
   (40px, with `-sm` 36 and `-lg` 48), so a Button and the Select beside it
   match. Colour is a named role: `primary` for emphasis, `success`,
   `warning`, `danger` and `accent` for status, with `-solid`, `-text`,
   `-soft`, `-border`, `-glow` and `-deep` saying which job within the role.
5. **Override a component token on a class, not with an inline style.** An
   inline style wins over every media and container query the consumer will
   later write.

   ```css
   .featured { --sp-carousel-view-count: 2.5; }
   ```
6. **Boolean props default to false**, so `<Button fullWidth />` is the idiom,
   not `fullWidth={true}`. The one exception is `animated`, which defaults to
   true.
7. **Selection components are controlled through `onValueChange`** — Select,
   Slider, RadioGroup, CheckboxGroup, Tabs. Native text inputs (TextField,
   TextArea) keep React's own `value` and `onChange`.
8. **Keyboard support and ARIA are already inside each component.** Roving
   tabindex, arrow-key navigation, Escape handling, `aria-checked`,
   `aria-expanded` and `aria-current` are implemented; do not re-declare them
   from outside. Do pass `aria-label` where a control has no visible label.
9. **Nothing touches the DOM at import time.** Components that measure do it in
   effects, so the entry point imports cleanly in a server build. Components
   needing the top layer use the platform popover API, so no portal target has
   to be provided.

Peer dependencies are `react >= 19` and `react-dom >= 19`. There are no other
runtime dependencies.

---

## Working in this repository

A pnpm monorepo: the library in `packages/space-ui`, a Ladle gallery in
`apps/docs`.

```
pnpm test        # vitest: a happy-dom unit project and a real-Chromium browser project
pnpm build       # build the library
pnpm docs        # the gallery at localhost:61000
pnpm changeset   # required for any change under packages/space-ui/src
```

- **Styling a component follows a fixed pattern**, documented in
  [CLAUDE.md](CLAUDE.md) and as a skill in
  `.claude/skills/space-ui-styling/`. Read one of them before writing a
  `*.module.scss`. The short version: spacing names a step, type is `rem()`
  written in px, control heights come from the ladder, colour is a token, and
  the only exceptions are hairlines and optical nudges — which go in the
  `EXCEPTIONS` map in `src/components/grid.test.ts` with a reason.
- **Several invariants are tests, not conventions**, and they fail CI rather
  than review: the spacing grid and rem type (`grid.test.ts`), the token
  surface (`tokens.test.ts`), the ban on the component library this one
  replaced, and the documentation a component publishes
  (`published-docs.test.ts` — every component needs a description, and no doc
  comment may name anything internal, because doc comments ship in the `.d.ts`
  and in `llms.txt`).
- **A component's JSDoc is public copy.** It is published into the shipped
  types, the gallery's prop tables, and the generated agent documentation.
  Write it for someone who installed this from npm: what the component is,
  when to reach for it, and what to use instead when it is the wrong choice.
- **Every PR touching `packages/space-ui/src` needs a changeset.** CI enforces
  it. Prefer a minor bump over a major one.
- **Visual changes wait for the owner's sign-off in the gallery** before being
  committed.
- **Commits are authored solely by Chris West.** Never add `Co-Authored-By` or
  any AI-attribution trailer.
- Agent-facing files — `llms.txt`, `llms-full.txt`, `reference.html`,
  `robots.txt`, `sitemap.xml` — are generated at docs build time by
  `apps/docs/vite-plugin-agent-docs.ts` from the same TypeScript AST pass that
  builds the gallery's prop tables. Never hand-write them, and never commit
  them: they are build output, and a committed copy goes stale.
