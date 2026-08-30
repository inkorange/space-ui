# Space UI

The TerraForge design system: a space-themed React component library.
Radix-free, dependency-free at runtime, portable to any React 19 app.

Extracted from [planet-builder](https://github.com/inkorange/planet-builder)
(`src/components/ui/`, where its pre-extraction history lives).

## Use

```bash
npm i @inkorange/space-ui
```

```tsx
import "@inkorange/space-ui/tokens.css";
import "@inkorange/space-ui/styles.css";
import { SpaceButton, Dialog, Select } from "@inkorange/space-ui";
```

`tokens.css` defines the `--sp-*` design tokens (override them to theme);
`styles.css` is the precompiled component CSS. Both are plain CSS — no
Sass, CSS-modules, or framework tooling required. All components are
client components (`"use client"` is baked into the bundle).

## Develop

```bash
pnpm install
pnpm docs    # Ladle gallery at localhost:61000
pnpm test
pnpm build
```

## Releases

[Changesets](https://github.com/changesets/changesets): every PR that
changes `packages/space-ui/src` adds one (`pnpm changeset`). Merging to
main opens/updates a "Version Packages" PR; merging that publishes to npm
and tags the release.

- **patch** — visual fix, internal refactor, docs
- **minor** — new component, new prop, new export
- **major** — removed/renamed export or prop, changed rendering default
