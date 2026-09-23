---
"@inkorange/space-ui": minor
---

Add a charts section: `Chart`, `BarList` and `PieChart`.

`Chart` draws one or more datasets over shared categories as bars, a line or a filled area — `type` is a prop, so a chart can offer the choice. Series are given as `{ name, data }` against a `categories` array. It stacks, it draws a `null` reading as a gap rather than as zero, it reads every series at the category under the pointer, and `onPointClick` reports what was chosen. `partialFrom` hatches the categories still being counted, so today's half-counted bar is not read as a collapse.

`BarList` is a ranked list of values — label, track, bar, figure — for poll results and top-ten lists, where the categories are words rather than dates. `PieChart` is parts of a whole, with a donut option that puts the total in the middle.

Everything is drawn as plain SVG from the library's own arithmetic: no charting dependency. Spacing is whole grid units from `--sp-grid-base-size` — these are the first components built on it — and the colours are tokens.

The series palette, `--sp-chart-series-1-color` through `-8-`, is an order rather than a pool: the first series is always the first colour, so hiding one never repaints the others. The steps are the library's own hues moved into the band a mark needs on the dark ground, ordered for colour-blind separation and measured rather than judged: every adjacent pair clears ΔE 8.6 under protanopia and deuteranopia, 23.0 for normal vision, and all eight clear 3:1 against the panel.

They are finished like the rest of the library: marks lit by a gradient rather than painted flat, a starlight fill in the same glass tube Progress and Slider use, a bloom on the line and the crosshair's marker, and a first draw where bars rise from the axis, a line draws itself on and a ring sweeps round. `animated={false}` keeps the finish without the movement, and reduced motion does the same on its own. Bars carry no bloom on purpose: eight glowing bars haze into each other and make the lengths harder to compare, which is the one thing a bar chart is for.
