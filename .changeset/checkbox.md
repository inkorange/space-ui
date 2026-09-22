---
"@inkorange/space-ui": minor
---

Add `Checkbox` and `CheckboxGroup`.

`Checkbox` is a single yes/no choice. `CheckboxGroup` wraps `CheckboxGroup.Item`s and holds the chosen values as an array, so a set where any number can be picked costs one piece of state rather than one boolean per option. Ticking appends, so the array keeps the order things were chosen in.

`indeterminate` draws a dash instead of a tick and sets the DOM property, so a select-all row that is only partly chosen announces as mixed. Checking lights the tile along its rim, draws the tick on rather than popping it in, and sends a ring of light out from the tile; `animated` motion is skipped under reduced motion. Labels are part of the click target, and a label that wraps keeps its tile against its first line. Sizes and spacing come from `--sp-checkbox-box-size`, `--sp-checkbox-label-gap-size` and `--sp-checkbox-row-gap-size`; the mark and its glow from `--sp-checkbox-mark-color`, `--sp-checkbox-glow-color` and `--sp-checkbox-halo-color`.

`RadioGroup` gets the same ring of light when an option is chosen, from the same shared mixin, so the two controls flash alike.
