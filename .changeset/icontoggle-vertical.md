---
"@inkorange/space-ui": minor
---

`IconToggle` takes an `orientation` — `"horizontal"` (the default, unchanged)
or `"vertical"` for a rail down the edge of a viewport, where a horizontal
strip eats the width you need.

Its tooltips move with it. A vertical pill has a segment directly below every
segment, so a tooltip hanging below would cover the next option; on a rail
they go to the side instead. That needed `Tooltip` to place on the horizontal
axis at all, so it now accepts `side="left"` and `side="right"` alongside top
and bottom, with the same flip-when-there-is-no-room behaviour on both axes.

`IconToggle`'s `value` is now `NoInfer<V>`. The generic is genuinely useful —
`onValueChange` hands you the union of your own option values rather than a
bare `string`, so a switch over it is exhaustive and it assigns straight into
narrow state. But `V` was inferring from `value` as well as `options`, so a
value that was not among the options simply widened `V` to include itself:
the generic silently accepted the one mistake it looks like it should catch.
It is now derived from `options` alone, and a mismatched `value` is an error.
