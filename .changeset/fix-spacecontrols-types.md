---
"@inkorange/space-ui": patch
---

Fix the `./spaceControls` subpath's types, which resolved to nothing.

Two defects, and fixing either alone leaves the subpath broken.

Vite bundles the JS flat to `dist/spaceControls.js`, while `tsc` preserves the
source tree and emits the declaration to `dist/styles/spaceControls.d.ts`. The
exports map pointed `types` at `./dist/spaceControls.d.ts`, which never
existed — so consumers got TS7016 and every `ctl.*` silently became `any`.

Repointing the map alone would not have helped: the emitted declaration was a
bare passthrough re-exporting `./spaceControls.module.scss`, and that SCSS is
not published. TS7016 would simply have become "cannot find module".

`spaceControls.ts` now declares a `SpaceControlClasses` interface explicitly
and asserts the module onto it, so the emitted `.d.ts` stands alone with no
import of anything unpublished. Naming the keys also turns a typo at a call
site into a type error rather than `undefined` at runtime.

Verified by installing the packed tarball into a scratch project: the subpath
resolves, `ctl.spaceInput` is `string`, and an unknown key fails to compile.

A `check:exports` script now runs in CI and asserts every path in the exports
map exists after a build, and that no published declaration imports a file the
tarball does not carry.
