---
"@inkorange/space-ui": major
---

Port the folder-tab design, unify field spacing, and document the whole API.

**Tabs** now carry their own visual design. It had been left in
planet-builder's `ConfigurationPanel.module.scss` at extraction time, so the
library shipped two lines of structure and no look at all. Tabs also stop
wearing the control skin, which the design overrode entirely, and
`Tabs.Trigger` loses its `animated` prop — nothing on a tab animates, so it
was a prop that did nothing.

**Single-line controls share one height.** `.spaceInput` never set a height
despite a comment claiming it matched `.spaceControl`, so a TextField
shrink-wrapped to its text and stood ~13px shorter than the Select beside it.
Both read `--sp-control-height` now. Field insets are unified at 16px so a
field, a textarea and a select align in a form; TextArea's radius tightens to
12px.

**`Select.Content`** may now be wider than its trigger and is never narrower,
so long options stop wrapping for no reason. Capped by
`--sp-select-panel-max-width`.

**RadioGroup's tokens** are renamed `--sp-radio-group-orb-*`: `--sp-radio-*`
did not match a component called RadioGroup, so nothing could attribute them.

Every public component and every prop now carries JSDoc, which ships in the
published type definitions as well as the gallery.
