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

Choosing a row now puts its text in the field, by click, Enter or Space. It
used to call `onSelect` and leave whatever had been typed, so the field still
read "trap" after picking TRAPPIST-1 c. The text written is the row's label
(or its `search` string), not its `value`, which is usually a slug.

Space selects only after the highlight has been moved with the keyboard. The
first row is highlighted as soon as results appear, so a Space that always
selected would make it impossible to type a query containing one —
"trappist-1 b" would pick a row at the space. Typing again hands Space back to
the text.
