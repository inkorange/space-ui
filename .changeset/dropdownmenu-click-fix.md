---
"@inkorange/space-ui": patch
---

Fix `DropdownMenu` ignoring a click on its trigger shortly after the menu
closed.

The trigger guarded against a real race — pressing it while the menu is open
closes the menu during pointerdown, so the click that follows would otherwise
reopen it — with a 300ms window that ignored trigger clicks after any close.
Escape armed that window too, so pressing Escape and then clicking the trigger
again within 300ms did nothing.

The trigger now records, at pointerdown, whether the menu was open, and the
click acts on that. It no longer depends on event timing, and nothing is
swallowed. This is the same fix Popover shipped with.
