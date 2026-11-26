---
"@inkorange/space-ui": minor
---

Add `Switch`, for a setting that takes effect the moment it is flipped.

The library could say "this is selected" and could not say "this is on".
Checkbox answers the first and belongs in a form you submit; a switch answers
the second, and a switch inside an unsaved form tells the reader a lie about
what has already happened. Both now exist, and the prop shape is deliberately
the same — `checked` and `onCheckedChange`, fully controlled, the label part
of the click target — so choosing between them is a question about meaning
rather than about API.

It is a native checkbox with `role="switch"` over it, so focus, Space, the
disabled state and form participation come from the browser rather than from
us, while a screen reader announces on or off instead of ticked.

Where the Checkbox is a panel that lights and the RadioGroup a sphere that
ignites, this is a sphere that travels: the Slider's glass tube with a lit
moon crossing it. The movement is the point — a control that only changed
colour would be saying what a checkbox already says, and it is the travel
that says the setting went somewhere. The thumb's inset and its distance are
both derived from the two track sizes, so retuning either keeps the moon
inside the tube and the end gaps equal.

Turning it on flashes the same ring of light that leaves RadioGroup's orb and
Checkbox's tile — the shared burst, so the three cannot drift into slightly
different versions of the same idea. It leaves the moon rather than the tube,
because a ring expanding off a 36px pill would read as the whole control
flashing rather than as something switching on. Turning off simply lets the
light go out.

The tube takes `--sp-radius-xl`, which at the shipped sizes IS a pill: 12px of
corner on a 20px tube exceeds half its height and the browser clamps it. So
nothing moves at the defaults, and the tube squares off with the rest of the
library as `--sp-radius-base-size` comes down. The moon stays a circle at
every setting.

Its track, moon and bloom are re-pointed by every palette, so it arrives
already knowing about Nebula and Void.
