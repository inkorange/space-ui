# SpaceUI

**Components for dark, instrument-dense interfaces.**

The design system behind [planet-builder](https://github.com/inkorange/planet-builder),
extracted so other projects can use it. 24 React components and 20 icons on a
seven-role token system, with zero runtime dependencies.

📖 **[Browse the gallery →](https://space-components.vercel.app)**

## Install

```bash
pnpm add @inkorange/space-ui
```

```tsx
// once, at your app entry — one import, defaults included
import "@inkorange/space-ui/styles.css";

import { Button, Card, Heading } from "@inkorange/space-ui";

export function Planet() {
  return (
    <Card>
      <Heading size="4">Kepler-442b</Heading>
      <Button>Build planet</Button>
    </Card>
  );
}
```

`styles.css` is the precompiled component CSS **with the default token values
baked in**, so that single import gives you a working library. Plain CSS — no
Sass, CSS modules, or framework tooling required downstream. All components are
client components (`"use client"` is baked into the bundle).

### Theming is a one-file swap

Every component reads role-named tokens and nothing else, so a whole theme —
light mode, a brand palette — is one `:root` block loaded *after* the library:

```css
/* theme.css, imported after styles.css */
:root {
  --sp-gray-panel: #ffffff;
  --sp-gray-text: #14161c;
  --sp-primary-solid: #7c5cff;
  --sp-font-family: "Inter", system-ui, sans-serif;
}
```

Same specificity, later source order, so your values win. You only override
what you want to change — anything you leave out keeps the shipped default.
`@inkorange/space-ui/tokens.css` is exported separately if you want to read or
extend the full default set.

**Requirements:** React 19 as a peer dependency, and a dark surface —
components are built for the space-dark ground (`#111113`) and assume it.
There is no light theme.

## Four rules, enforced

Each of these is a constraint the build checks, not a preference the docs
describe. That is the difference between a design system and a folder of
components.

| Rule | What it means | Enforced by |
| --- | --- | --- |
| **Eight-point spacing** | Every gap, inset, and offset lands on the grid. Off-grid values round **up**, so density never creeps in by accident. | `12px → 16px` |
| **Seven gray roles** | Grays are named for the job they do, not their step on a ramp. Fifteen Radix variants collapsed into seven roles. | `--sp-gray-text-dim` |
| **No framework in the surface** | No Radix, no runtime dependencies, no framework-specific props. | `radixImports.test.ts` |
| **CSS arrives precompiled** | Consumers import one stylesheet. Authored in Sass; nothing downstream needs a Sass toolchain. | `styles.css` |

## Design tokens

Radix gave us fifteen numbered grays. A numbered ramp makes you guess — is
`gray-11` a label, a border, or a placeholder? SpaceUI ships seven, each named
for the work it does, so the name tells you where it belongs and a reviewer can
tell when it is wrong. Set a role's value once and every correct use follows.

Tokens are plain CSS custom properties on `:root`. Nothing about them is
React-specific.

```css
@import "@inkorange/space-ui/tokens.css";

.planet-panel {
  background: var(--sp-gray-panel);
  border: 1px solid var(--sp-gray-border);
  padding: var(--spacing-md);   /* 16px — on the grid */
  gap: var(--spacing-sm);
}

.planet-panel__label {
  color: var(--sp-gray-text-dim);  /* secondary text */
  font-size: var(--sp-font-sm);
}
```

Because every component reads the same roles, rebranding is one block of
overrides rather than a pass through the component tree:

```css
/* theme.css — loaded after tokens.css */
:root {
  --sp-gray-panel: #14161c;
  --sp-primary-solid: #7c5cff;
  --sp-font-family: "Inter", system-ui, sans-serif;
}
```

Every token, its resolved value, and the Radix variant it replaced is listed
under **Foundations** in the gallery, along with a reverse index of which
components read which token.

### Fonts

Almost nothing sets a `font-family` — the library inherits whatever your app
already loaded, and nothing renders through a portal, so inheritance reaches
every component. Two components pin a stack (`Badge` and `Button`), and
both read the same token:

```css
:root { --sp-font-family: "Inter", system-ui, sans-serif; }
```

There is deliberately no per-component font hook. Typeface is a system-level
decision made in one place, and a test fails the build if a component
introduces its own.

## The look is not optional

Lit glass, an orbiting rim, faint starfield specks — that is what a SpaceUI
component *is*. There is no plain mode and no class to compose: install the
package and you get the system.

What you can turn off is the **motion**, because ambient loops that suit a hero
button distract in a dense form or a long list. One prop, one meaning:

```tsx
<Button>Build planet</Button>                  {/* ambient motion, the default */}
<Button animated={false}>Build planet</Button> {/* same look, no loops */}

<TextField.Root animated={false} />
<Select.Trigger animated={false} />
```

`animated={false}` stills the orbiting rim, the glint sweep and the twinkling
stars. Every gradient, rim and shadow stays exactly where it was. Readers who
set `prefers-reduced-motion` get this without asking — the library honours it
whatever the prop says.

`Slider` takes no `animated` prop: its skin has no ambient loop, and a prop
that does nothing is worse than no prop.

## Extracted, not invented

These components ran in production in planet-builder before they became a
package. The extraction kept the rendered output identical — a few deliberate
exceptions to the spacing grid survive where parity with the shipped app beat
grid purity, and they are commented where they occur.

Two components stayed behind because they were coupled to the app's framework:
`SceneLoadingOverlay` and `ImageWithFallback`.

## Develop

```bash
pnpm install
pnpm docs    # Ladle gallery at localhost:61000
pnpm test    # 49 tests, incl. the Radix-ban and token-grid guards
pnpm build
```

The gallery runs against the library **source**, not `dist` — component edits
hot-reload with no build step in the loop. Prop tables and token usage on the
docs site are generated from the source at build time, so they cannot drift
from what ships.

## Releases

[Changesets](https://github.com/changesets/changesets): every PR that changes
`packages/space-ui/src` adds one (`pnpm changeset`). Merging to main
opens/updates a "Version Packages" PR; merging that publishes to npm and tags
the release.

- **patch** — visual fix, internal refactor, docs
- **minor** — new component, new prop, new export
- **major** — removed/renamed export or prop, changed rendering default

## License

MIT
