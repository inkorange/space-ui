---
"@inkorange/space-ui": major
---

Remove the `variant` prop from `Select.Trigger`.

It was accepted purely for Radix call-site compatibility and discarded —
destructured as `_variant` and never read. Styling came from the space theme
classes, so passing it did nothing at all. With the skin now applied
internally, even that historical justification is gone.

It was showing up in the generated API reference as a documented prop with no
effect, which is worse than no prop.

**Migration:** delete `variant="ghost"` from `Select.Trigger` call sites.
It has never had any effect, so removing it cannot change rendering.
