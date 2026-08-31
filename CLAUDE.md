# Space UI — project context

The TerraForge design system, extracted from planet-builder's
`src/components/ui/` (2026-08-30; pre-extraction history lives there).
Owner: Chris West. Commits are authored solely by Chris — never add
Co-Authored-By or AI-attribution trailers.

## State (2026-08-31)
- 25 components + icons + tokens.css + spaceControls class map in
  `packages/space-ui`; 49 tests (vitest, includes the Radix-ban and
  token-grid guard suites — permanent invariants).
- Ladle gallery in `apps/docs`, deployed: https://space-components.vercel.app
  (Vercel project "docs", output dir pinned via apps/docs/vercel.json).
- **Not yet published to npm.** The release workflow is gated on the
  NPM_TOKEN secret (deliberately unset). A staged major changeset makes the
  first release 1.0.0. Publish only when Chris approves the gallery; then
  planet-builder swaps its local ui/ for the package (see
  docs/extraction-plan.md §7).
- Stayed behind in planet-builder: SceneLoadingOverlay, ImageWithFallback
  (app/Next-coupled).

## Working rules (carried from planet-builder)
- 8pt spacing grid; off-grid values round UP to the next step (12px→16px).
- Minimal, consistent component props; no framework-specific APIs in the
  public surface (portable React 19; precompiled CSS, no Sass for consumers).
- Every PR touching packages/space-ui/src needs a changeset (CI enforces).
- Visual changes await Chris's sign-off in the gallery before committing.
- Chris QAs himself by default; don't run verification loops unasked.

## Commands
pnpm docs  → gallery at localhost:61000 · pnpm test · pnpm build ·
pnpm changeset
