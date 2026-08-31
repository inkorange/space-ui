---
"@inkorange/space-ui": patch
---

Ship the README and LICENSE with the package.

npm includes README, LICENSE and CHANGELOG regardless of the `files` field —
but only from the package directory. Both of ours live at the monorepo root,
so 1.0.0 published without either: the npm page had no readme, and the MIT
licence text did not travel with the distribution, which the licence itself
requires.

A `prepack` script copies both in at pack time, so the repo root keeps the
canonical copies that GitHub renders and the tarball gets them too.

Also drops the "not published yet" notice, which stopped being true the
moment 1.0.0 went out and would otherwise have been the first thing on the
npm page.
