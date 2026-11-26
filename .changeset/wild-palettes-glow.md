---
"@inkorange/space-ui": minor
---

Ship five palettes, and name the ground they are lit against.

`@inkorange/space-ui/palettes.css` is a new optional entry. Import it and set
one attribute — `data-sp-palette="nebula"` — and the library repaints: Deep
Space (the default, named so a picker can select it), Nebula, Verdant, Solar
and Void. Because the tokens are ordinary custom properties the attribute
cascades, so it themes the application on `<html>` or one panel on one
element. There is still no provider, no context and no wrapper.

A palette states six channels and an accent; the lit chrome — the spheres of
the Slider thumb and radio orb, the washes behind a highlighted row, the limb
along a tab — derives from them. So a consumer's own palette is a dozen
declarations rather than eighty, and it gets the derived chrome free. What a
palette deliberately cannot move: the neutral text ramp, which carries the
contrast guarantees; status colour, which means something; and the chart
series, which are the measured colour-blind ramp. A test enforces each of
those.

Also new: `--sp-ground-color`, the dark surface the glass is lit against. The
library has always required one without ever naming it, which left every
consumer to guess — and a guess that lands too light turns a translucent fill
into a grey smudge. Palettes raise it in three steps (`data-sp-ground` of
`deep`, `raised` or `bright`), tinting toward the palette's own light as it
rises. This is a luminance axis, not a light mode: the glass stays glass, so
text on it keeps the contrast it was measured for. The library remains
dark-only by design.

Corners are a scale now, too. `--sp-radius-sm`, `-md`, `-lg` and `-xl` all
derive from `--sp-radius-base-size`, so one value rounds the whole library or
squares it off — rounding was previously eight separate decisions spread
across the stylesheets, which is how 10px and 14px ended up beside 12px with
nothing to tell them apart. `--sp-radius-full` and `50%` stay off the scale
on purpose: a squared-off system must still have round orbs and pill-shaped
tracks. A test keeps raw lengths out of `border-radius` from here on.

Buttons get a dial of their own, `--sp-control-radius-size`, shared with the
controls beside them so a squared button never sits next to a pill-shaped
select. It defaults to `var(--sp-radius-full)`, so nothing moves unless it is
set.

Three surfaces move by 2px as a result: the Autocomplete and DropdownMenu
panels round from 10px to 12px, and one control-chrome surface from 14px to
12px.

The palette layer leaves `:root` untouched, so an application that does not
import the new entry renders exactly as before — apart from those three
corners.
