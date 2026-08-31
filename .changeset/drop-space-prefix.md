---
"@inkorange/space-ui": major
---

Rename `SpaceButton` to `Button` and `SpaceLoader` to `Loader`.

The prefix dates to July 2026, when most of these components were re-exports
of `@radix-ui/themes` — which ships its own `Button`, so a bespoke one could
not use that name. It meant "we wrote this one ourselves."

After the Radix removal every component is in-house, so the distinction it
encoded no longer exists. Twenty-two of twenty-four exports are unprefixed,
which makes unprefixed the convention and these two the leftovers.

`ButtonProps` is now exported as well; it was the only component whose props
type was not public.

**Migration:** rename `SpaceButton` to `Button` and `SpaceLoader` to `Loader`
at call sites. Nothing else changes — same props, same rendering.
