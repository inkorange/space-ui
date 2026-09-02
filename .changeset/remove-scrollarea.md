---
"@inkorange/space-ui": minor
---

Remove `ScrollArea`.

It was a `<div>` with `overflow-y: auto` and themed scrollbars — nine
statements and thirteen lines of CSS — and it did not solve the part that is
actually hard. Its own doc-comment conceded as much: it needed a bounded
height from somewhere else, so every call site still had to supply the
`flex: 1; min-height: 0` that makes a region scroll at all. It took the easy
half and left the trap to the caller.

It also hardcoded `overflow-x: hidden` with no way to opt out, silently
clipping anything wider than the container.

Write a `<div>` and style it, or reach for a component that earns the name.
The scrollbar theming is not carried over — it was a rule that happened to be
wearing a component, and inflicting it globally on a consuming app's every
scrollable region would be worse than leaving it out.

Breaking, shipped as a minor: the package has one consumer and it is clearing
its two call sites ahead of this landing.
