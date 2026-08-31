---
"@inkorange/space-ui": minor
---

Add the `--sp-font-family` design token and point Badge at it.

The library sets no font-family on any component, so everything inherits the
host app's font — except Badge, which pinned the system stack verbatim from
Radix. In a consuming app that meant every component picked up the brand font
and badges alone did not.

Badge now reads `var(--sp-font-family)`, whose default is exactly the stack it
used to hardcode, so rendering is unchanged. Consumers that want badges on
their own font can now override one token instead of restyling the component.
