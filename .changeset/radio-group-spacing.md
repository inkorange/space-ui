---
"@inkorange/space-ui": minor
---

Add `--sp-grid-base-size`, the library's 8px spacing unit, and retune `RadioGroup` against it.

Spacing is now expressed as whole multiples of one token, so changing it retunes the rhythm: 4px for a denser application, 10px for a roomier one. Sizes that are not spacing — a control's height, the radio orb's diameter, an optical nudge onto a text baseline — stay independent of it.

`RadioGroup` gets more room in both directions: two grid units between an orb and its label (`--sp-radio-group-label-gap-size`, was 8px) and two between options (`--sp-radio-group-row-gap-size`, was 8px). An option now aligns to the top, so a label that wraps to two lines keeps its orb against the first line instead of dragging it down beside the gap between them.
