---
"@inkorange/space-ui": patch
---

`Autocomplete` offers nothing until something is typed.

An empty query let every option through, so clicking into the field dropped
the whole dataset open before the reader had asked for anything. With nothing
typed — or only whitespace — there is now no panel at all: no rows, no loading
line, and no empty message reporting "nothing matching" for a search nobody
has made. ArrowDown on an empty field stays shut too. This holds with
`preFiltered` as well.
