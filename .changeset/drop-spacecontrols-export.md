---
"@inkorange/space-ui": major
---

Remove the `./spaceControls` subpath, and delete the dead `cardFill` stylesheet.

Components apply the space skin themselves — that changed in 1.0.0 — so
composing `ctl.spaceControl` onto a call site sets a class the component
already carries. The subpath was a public API that could no longer do
anything, and every use of it was a no-op.

The class map still exists internally, now typed rather than imported as a raw
CSS module, so a mistyped key inside the library is a compile error rather than
`undefined` at runtime.

`cardFill.module.scss` came across in the extraction and was never wired up:
nothing imported it, it had no exports entry, and its CSS never reached
`dist/space-ui.css`. Deleted rather than exported.

**Migration:** delete `import ctl from "@inkorange/space-ui/spaceControls"` and
any `className={ctl.*}` it fed. Removing them changes nothing visually, since
the components already apply that styling.
