---
"@inkorange/space-ui": patch
---

Rewrite the readme as a pitch rather than a reference.

It opened with a specification — counts, a token system, a table of rules —
and buried what the components actually look like. It now leads with the
design, shows a working component in the first screenful, and lists every
component with a link to the page that documents it.

The theming section is rebuilt around the token system as consumers meet it:
three tiers of CSS custom property, what each one reaches, and why the surface
channels hold bare channels rather than colours.

Badges for coverage and gzipped size are measured from a real build and a real
coverage run, and CI fails if the readme drifts from them. The component
sampler is now a screenshot of the live gallery rather than a hand-drawn SVG,
so it cannot claim something the library does not render.

Dropped: the enforced-rules table, the framework the components were migrated
away from, and file-level plumbing nobody needs narrated. Kept: how to install
it, how to use it, how to retheme it, and where to see it running.
