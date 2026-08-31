---
"@inkorange/space-ui": major
---

Replace Radix's numeric accent steps with role names, and drop five dead tokens.

The hues were renamed semantically in an earlier change, but Radix's numeric
ladder stayed — so `--sp-warning-11` still required knowing what 11 means,
which is exactly the problem the seven role-named grays already solved. The
suffix is now the job:

- `-solid` fills a shape
- `-text` sits on the dark ground
- `-soft` is the wash behind it
- `-border` outlines
- `-glow` is a halo
- `-deep` is the deepest tint, for gradient ends

`--sp-warning-10` and `--sp-warning-11` looked like two tones of one colour
because a step number cannot say otherwise. Only one was ever used; the other
was Radix's hover step. Also removed: `--sp-danger-9`, `--sp-primary-12`,
`--sp-primary-a2`, `--sp-success-a6` — all defined, none referenced.

The accent palette goes from 24 tokens to 15, and every remaining name says
what it is for.
