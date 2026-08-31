---
"@inkorange/space-ui": major
---

Every colour now lives in tokens.css. Fix Progress, which rendered nothing.

122 raw colour values were hardcoded in component stylesheets, concentrated in
the glass surfaces — so overriding an accent left the lit rim exactly as it
was, and "swap one file to retheme" was only true for typography and layout.

Glass surfaces are stored as channels rather than colours
(`--sp-rim-rgb: 150 190 255`), so a component varies alpha locally —
`rgb(var(--sp-rim-rgb) / 0.4)` — while the hue stays one system-level
decision. Alpha is about layering; hue is brand.

New roles: glass, sheen, rim, glow, glint, star, shadow, focus ring, the ember
variant, soft status fills for badges, and a categorical scale for telling data
apart. Component-specific colours (the slider thumb's planet shading, the radio
orb) are named per the convention and live in tokens.css too, so the file is
genuinely the whole palette. A test fails the build on any raw colour in a
component stylesheet.

Progress shipped with a one-line stylesheet — `overflow: hidden`, no height,
no track, no fill — because its visuals lived in planet-builder's own module.
It rendered an invisible zero-height div anywhere else. It now carries its own
defaults, themeable through `--sp-progress-height`, `--sp-progress-track-color`
and `--sp-progress-fill-color`.

The gallery's Animation story moves to Foundations as Motion: the `animated`
prop behaves identically across every component, so it is a system concern
rather than a property of Forms.
