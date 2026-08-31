---
"@inkorange/space-ui": minor
---

The skin is now part of the component, and `animated` is the only motion switch.

Previously the lit-glass treatment lived in `spaceControls` and had to be
composed onto every call site (`className={ctl.spaceControl}`). That made the
library's own identity opt-in — 57 of 62 call sites in planet-builder applied
it, and the design system's own gallery forgot to, rendering every control in
a bare state no consumer ever ships.

Select.Trigger, Select.Content, TextField.Root, TextArea, Slider and
Tabs.Trigger now apply their skin internally. There is no plain mode.

In its place, a real prop for the thing that genuinely is a choice: `animated`
(default `true`) stills the ambient loops — the orbiting rim, the glint sweep,
the twinkling stars — on Button, Select.Trigger, Select.Content,
TextField.Root, TextArea and Tabs.Trigger. Gradients, rim shading and shadows
are unaffected: the look is the component, only its motion is optional.
`prefers-reduced-motion` continues to still the loops regardless of the prop.

Slider takes no `animated` prop — its skin has no ambient loop, and a prop that
does nothing is worse than no prop.

`spaceControls` is still exported and still works; existing `ctl.*`
compositions now apply the same class the component already carries, which is
a no-op. It will be deprecated.
