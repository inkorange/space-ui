---
"@inkorange/space-ui": major
---

Establish the component-token convention and apply it to SpaceLoader.

Component tokens now follow `--sp-<component>-<modifier>-<type>`, where type
is one of size, color, timer, angle, width, height. SpaceLoader's three
become `--sp-loader-orbit-size`, `--sp-loader-planet-size` and
`--sp-loader-moon-size`.

They are also overridable for the first time. The size classes previously
*declared* the properties on the component's own root, and a declaration on an
element shadows any value inherited from an ancestor — so setting
`--loader-moon` on a parent did nothing. They are now *read* with a per-size
fallback and resolved into private `--_` vars, so a value set anywhere above
the loader flows in, with the `size` prop supplying the default.

Two guards enforce the convention: every non-palette `--sp-*` reference must
declare a fallback (without one, a consumer who never sets it gets an empty
value), and every component token must end in a recognised type.

**Migration:** `--loader-size`, `--loader-planet` and `--loader-moon` were
never overridable from outside, so no working code depends on them.
