# Space UI — project context

The SpaceUI design system, extracted from planet-builder's
`src/components/ui/` (2026-08-30; pre-extraction history lives there).
Owner: Chris West. Commits are authored solely by Chris — never add
Co-Authored-By or AI-attribution trailers.

## State (2026-08-31)
- 24 components + 20 icons + tokens.css + spaceControls class map in
  `packages/space-ui`; 49 tests (vitest, includes the Radix-ban and
  token-grid guard suites — permanent invariants).
- Ladle gallery in `apps/docs`, deployed: https://space-components.vercel.app
  (Vercel project "docs", output dir pinned via apps/docs/vercel.json).
- **Published: 1.0.0 on npm** (2026-08-31), public with provenance. Releases
  are automated: a merged changeset opens a "Version Packages" PR; merging
  that publishes and tags.
- Stayed behind in planet-builder: SceneLoadingOverlay, ImageWithFallback
  (app/Next-coupled).

## Styling a component (follow this, every time)

Write a new `*.module.scss` this way, and change an old one to match when you
touch it. The tests in `src/components/grid.test.ts` and `tokens.test.ts`
enforce all of it, so breaking a rule here fails CI rather than review.

1. **Spacing names a step — never a raw length.** `gap: var(--spacing-sm)`,
   not `gap: 8px`. The steps are `--spacing-xs` (4px, the half-step, for the
   inside of small dense parts), `sm` 8, `md` 16, `lg` 24, `xl` 32, `2xl` 40 —
   each one a multiple of `--sp-grid-base-size`, so one token retunes the
   library's rhythm. A value off the scale means the design is off the grid:
   fix the design, do not write the px.
2. **Type is `rem()`, written in px.** `font-size: rem(14)` with
   `@use "../styles/type" as *;` at the top. A px size ignores a reader who
   has enlarged their browser text. `line-height` too.
3. **Control heights come from the ladder**, not from padding arithmetic:
   `min-height: var(--sp-control-height)` (40) with `-sm` 36 and `-lg` 48.
   A button and the Select beside it must be the same height.
4. **Colour is a token.** No hex, `rgb()` or `hsl()` in a component
   stylesheet; add a `--sp-[component]-[modifier]-[type]` token in
   `tokens.css` and document it with `@token` in the SCSS.
5. **The exceptions are hairlines and optical nudges** — a 1px mask inset, a
   2px lift to centre an indicator on a line of text. They go in the
   `EXCEPTIONS` map in `grid.test.ts`, keyed by file and value, with the
   reason. Anything else is spacing and takes a step.

## Working rules (carried from planet-builder)
- 8pt spacing grid; off-grid values round UP to the next step (12px→16px).
- Minimal, consistent component props; no framework-specific APIs in the
  public surface (portable React 19; precompiled CSS, no Sass for consumers).
- Every PR touching packages/space-ui/src needs a changeset (CI enforces).
- Visual changes await Chris's sign-off in the gallery before committing.
- Chris QAs himself by default; don't run verification loops unasked.

## Releasing

A merged changeset opens a "Version Packages" PR; merging that publishes.

Publishing goes through **npm**, not pnpm: `changeset publish` shells out to
`pnpm publish` in a workspace, and pnpm has no OIDC exchange, so it cannot do
npm's trusted publishing. The release workflow therefore uses changesets for
versioning only and publishes with `npm publish` itself.

There is **no npm token**. The workflow proves who it is with its GitHub OIDC
identity, which npm accepts because the package names that workflow as its
trusted publisher (npmjs.com → the package → Settings → Trusted publisher:
repository `inkorange/space-ui`, workflow `release.yml`). Two consequences:
- Renaming `.github/workflows/release.yml`, or moving the repo, breaks
  publishing until the trusted publisher entry is updated to match.
- Publishing cannot be done from a laptop with a token any more, which is the
  point: a credential that does not exist cannot leak.

## Commands
pnpm docs  → gallery at localhost:61000 · pnpm test · pnpm build ·
pnpm changeset
