---
"@inkorange/space-ui": patch
---

Set `publishConfig` so the first publish lands correctly.

`@inkorange/space-ui` is a scoped package, and npm defaults scoped packages to
restricted. Without `access: "public"` the first publish either fails with 402
on a free account or, worse, silently publishes a private package that nobody
can install — a success message hiding a broken release.

`provenance: true` makes the `id-token: write` permission the release workflow
already requests actually do something: signed attestations linking the
published tarball back to this repository and commit. The permission was being
granted and ignored.
