# Space UI Extraction Plan

**Goal:** Lift `src/components/ui/` out of planet-builder into a standalone,
versioned, npm-published design-system library — `@inkorange/space-ui` — and
consume it back in this app as a normal dependency.

**Decisions locked (owner, 2026-08-30):**
public npm under the `@inkorange` scope · monorepo with a docs site ·
portable to any React app (no Next.js assumptions) · big-bang swap in
planet-builder.

---

## 1. What ships in v1 (the extraction surface)

From `src/components/ui/` (58 files today):

**Components (~26):** AlertDialog, Badge, Box, Card, Dialog, DropdownMenu,
Flex, Grid, Heading, IconToggle, ImageWithFallback, Link, Progress,
RadioGroup, ScrollArea, Select, Separator, Slider, SpaceButton, SpaceLoader,
Tabs, Text, TextArea, TextField, Tooltip — plus `icons.tsx`.

**Styling infrastructure:**
- `tokens.css` — the design tokens (`--sp-*`), becomes the package's
  published theme entry (`@inkorange/space-ui/tokens.css`).
- `spaceControls.module.scss` (277 lines) — **a public API, not an
  internal**: 18 app files import it directly (`ctl.spaceInput`, …). The
  package must export these class maps deliberately (see §4).
- `cardFill.module.scss` and per-component modules.

**Stays behind in planet-builder:** `SceneLoadingOverlay` (app-specific:
scene/WebGL semantics). Audit at extraction time for anything else that
smells app-shaped. The builder's `ElementTooltip` already has a generic
Tooltip in ui/ — no hoisting left to do.

**Explicit non-goals for v1:** no new components, no visual changes, no API
redesign. v1.0.0 is a faithful move; improvement PRs come after, versioned.

## 2. New repository: `inkorange/space-ui`

pnpm workspace monorepo:

```
space-ui/
  .changeset/
  .github/workflows/ci.yml        # typecheck, lint, test, build on PRs
  .github/workflows/release.yml   # changesets version-or-publish
  packages/
    space-ui/                     # @inkorange/space-ui
      src/
        components/…              # one dir per component + its .module.scss
        styles/                   # tokens.css, spaceControls, cardFill
        icons/
        index.ts
      package.json
      tsup.config.ts
  apps/
    docs/                         # component gallery / playground
  package.json                    # workspace root: changesets, turbo optional
```

Docs app: **Ladle** (component-story gallery, Vite-based, far lighter than
Storybook) — one story file per component, live props where useful. It runs
against the workspace source, so component dev has hot reload without
publishing. Deploy to Vercel as `space-ui-docs` when desired; not a launch
blocker.

## 3. Build & packaging (the portability core)

The one real engineering problem: planet-builder consumes SCSS modules via
Next's pipeline; a portable package cannot ask that of consumers.

- **tsup** (esbuild) builds ESM + CJS + `.d.ts`.
- SCSS modules **precompile at build time** (esbuild-sass-plugin or
  vite-lib equivalent) into:
  - one `dist/styles.css` per-component-chunked or single-file (start
    single-file — the whole library's CSS is small), plus `tokens.css`
    kept separate so themes can be overridden;
  - hashed-class **JS maps** imported by the compiled components, so
    `styles.button` keeps working internally with zero runtime CSS-in-JS.
- Consumer contract (README + docs):
  ```ts
  import "@inkorange/space-ui/tokens.css";
  import "@inkorange/space-ui/styles.css";
  import { SpaceButton, Dialog } from "@inkorange/space-ui";
  ```
- `"use client"` directives preserved in output (tsup `banner` or
  per-file) so RSC consumers (this app) work unchanged.
- `peerDependencies`: `react >= 19`, `react-dom >= 19`. No runtime deps
  otherwise (the in-repo decoupling already removed them all).
- `exports` map: `.` (components), `./tokens.css`, `./styles.css`,
  `./spaceControls` (the class-map module, typed).
- `sideEffects: ["*.css"]` for tree-shaking safety.

## 4. The spaceControls leak

18 planet-builder files reach into `spaceControls.module.scss` for shared
class names. Two-step containment:

1. v1 exports the compiled class map as `@inkorange/space-ui/spaceControls`
   (typed record), so the swap is mechanical.
2. Post-v1 backlog: fold the common uses (`spaceInput`, trigger paddings)
   into real component props/variants and deprecate the raw map with a
   minor-version deprecation note. Tracked as an issue in the new repo, not
   a blocker.

## 5. Versioning & publishing: Changesets flow

Standard Changesets pipeline (the flow the owner referenced):

- `pnpm changeset` accompanies every behavior-changing PR — author picks
  patch/minor/major and writes the human-readable note. CI **fails a PR
  that touches `packages/space-ui/src` without a changeset** (bot comment +
  `changeset status` check); docs-only changes use `--empty`.
- `release.yml` runs `changesets/action` on pushes to `main`:
  - with pending changesets → opens/updates the **"Version Packages" PR**
    (bumps versions, writes CHANGELOG.md from the changeset notes);
  - when that PR merges → `changeset publish` pushes to npm with
    provenance, tags `vX.Y.Z`, creates the GitHub release.
- Auth: `NPM_TOKEN` (automation token for the @inkorange scope) as a repo
  secret; `GITHUB_TOKEN` for the PR flow. npm 2FA stays on ("automation"
  level).
- Semver policy, written into CONTRIBUTING.md:
  - **patch** — visual fix, internal refactor, docs;
  - **minor** — new component, new prop, new export;
  - **major** — removed/renamed export or prop, changed default that
    alters rendering, CSS class-map restructuring.
- v1.0.0 immediately (not 0.x): the API has been production-hardened in
  planet-builder for months; 0.x semver ambiguity buys nothing.

## 6. Extraction mechanics (order of work)

1. **Scaffold** the repo: workspace, tsup, Ladle, CI, changesets init,
   README, MIT license (public repo).
2. **Move the code**: copy `src/components/ui/` in (git history stays in
   planet-builder; a `git log --follow` pointer in the README's provenance
   note is enough). Fix internal imports, split `index.ts` exports.
3. **Green build**: `pnpm build` produces dist; Ladle renders every
   component; a smoke test imports every export from `dist` (both ESM and
   CJS) and asserts CSS emitted.
4. **Tests**: port the ui-related unit tests that live in planet-builder
   (guard tests banning Radix imports come along as a permanent invariant).
   Add basic render tests per component (vitest + testing-library,
   happy-dom).
5. **Stories**: one Ladle story per component — the visual QA surface for
   every future PR.
6. **Publish v1.0.0** via the changesets flow itself (first changeset =
   "initial release" major): proves the pipeline before the app depends on
   it.

## 7. Planet-builder swap (big-bang, one PR)

1. `pnpm add @inkorange/space-ui` (npm install — app uses npm; no
   workspace link in production path).
2. Codemod imports: `@/components/ui` → `@inkorange/space-ui`;
   `@/components/ui/spaceControls.module.scss` → `@inkorange/space-ui/spaceControls`;
   `SpaceButton`/`icons` path variants likewise (81 importing files, all
   mechanical — script it, don't hand-edit).
3. `layout.tsx` imports the two package CSS files; delete the local
   `tokens.css` import.
4. Delete `src/components/ui/` (except SceneLoadingOverlay, relocated to
   `src/components/builder/` or wherever its only consumers live).
5. Full validation: tsc, vitest, build, and an eyeball pass over the
   builder, planet page, systems, galaxy (dialogs, selects, tooltips,
   sliders are the risk areas — hashed class names changing is invisible;
   missed CSS emission is not).
6. QA on 3000, then PR. Rollback story: revert the single PR.

**Local dev loop after the split:** `pnpm pack` + `npm i ../space-ui/…tgz`
or yalc for cross-repo iteration; document in the library README. Accept
the friction — it is the price of the clean break, and most component work
should happen against Ladle in the library repo anyway.

## 8. Risks & mitigations

- **CSS pipeline divergence** (Next SCSS → precompiled): mitigated by the
  Ladle gallery (renders outside Next) plus the visual QA pass in §7.5.
- **Two-repo drift pressure** ("just patch it locally"): the ban is
  structural — the local copy is deleted; fixes go through the library +
  version bump. The changesets PR flow keeps that cheap (merge → publish
  is automatic).
- **Token coupling**: app styles reference `--sp-*` vars heavily; tokens
  stay a separate CSS entry so the app keeps overriding/extending in
  globals.css exactly as today.
- **RSC/client boundaries**: preserved "use client" banners; smoke-tested
  by the app swap itself.

## 9. Suggested sequencing

Phase A (library repo bootstrap, §6.1-3) → Phase B (tests + stories +
v1.0.0, §6.4-6) → Phase C (app swap PR, §7). A and B live entirely in the
new repo; C is one planet-builder PR. Each phase is independently
shippable and pausable.
