# @inkorange/space-ui

## 1.2.0

### Minor Changes

- bee49ce: `Card` takes an optional `image`.

  ```tsx
  <Card image={<img src={url} alt={name} />}>
    <Heading size="4">Kepler-442b</Heading>
  </Card>
  ```

  The card frames it: full-bleed to its edges, top corners matched to its own
  radius, cropped to fill. It is a prop rather than an ordinary child because
  the card reserves the box **before** the image loads — `--sp-card-image-ratio`,
  default `16 / 10` — so a row of cards agrees on a shape up front and none of
  them reflow as thumbnails arrive. A child could not be sized by the card.

  Pass whatever your framework renders — a plain `<img>`, a `next/image`, a
  `<video>`, or a placeholder standing in for one that failed. Nothing about the
  slot is framework-specific.

- bee49ce: New `Message` component, and a Feedback category to put it in.

  ```tsx
  <Message variant="warning" title="Thin atmosphere">
    Surface pressure is below 0.3 bar.
  </Message>
  ```

  Three variants that do not merely change hue. `info` is lit like the rest of
  the system; `warning` warms its rim to amber; `alert` takes the ember
  treatment the destructive Button wears. Each carries its own glyph, so the
  kind of message reads before the words do, and the variant lives on a lit
  leading edge rather than a full coloured border — unmistakable without the
  whole panel shouting.

  `alert` announces itself with `role="alert"`, which interrupts a screen
  reader. That is right for something already wrong and wrong for everything
  else, so `info` and `warning` are polite status regions that wait their turn.

  For a decision the reader has to make, reach for `AlertDialog` — a message
  states, it does not ask.

  Three icons come with it, ported from the same MIT source as the rest:
  `InfoCircledIcon`, `ExclamationTriangleIcon`, `CrossCircledIcon`.

  `Loader` and `Progress` move out of the Buttons category, which neither of
  them ever was — they report on work rather than start it. Their documentation
  pages move with them, so any bookmark to `components--buttons--loader` is now
  `components--feedback--loader`. No API change.

- bee49ce: Remove `ScrollArea`.

  It was a `<div>` with `overflow-y: auto` and themed scrollbars — nine
  statements and thirteen lines of CSS — and it did not solve the part that is
  actually hard. Its own doc-comment conceded as much: it needed a bounded
  height from somewhere else, so every call site still had to supply the
  `flex: 1; min-height: 0` that makes a region scroll at all. It took the easy
  half and left the trap to the caller.

  It also hardcoded `overflow-x: hidden` with no way to opt out, silently
  clipping anything wider than the container.

  Write a `<div>` and style it, or reach for a component that earns the name.
  The scrollbar theming is not carried over — it was a rule that happened to be
  wearing a component, and inflicting it globally on a consuming app's every
  scrollable region would be worse than leaving it out.

  Breaking, shipped as a minor: the package has one consumer and it is clearing
  its two call sites ahead of this landing.

### Patch Changes

- bee49ce: Correct the icons module's header comment, which claimed 17 icons since before
  there were 20. Comment only — no icon, prop or output changes.

## 1.1.0

### Minor Changes

- ce3f4c2: Drop `.Root` from every compound component, and collapse Select and
  DropdownMenu to the parts that carry meaning.

  `Select.Root` was never a choice — you always wrote it, always with a
  `Trigger` you could not configure and a `Content` that only ever wrapped
  `Item`s. Four names to express one control. It is now one component and one
  child type:

  ```tsx
  <Select value={star} onValueChange={setStar} placeholder="Pick one">
    <Select.Item value="G">G-type star</Select.Item>
  </Select>
  ```

  `DropdownMenu` goes the same way. Its trigger is always a Button now, passed
  as `label`, so `DropdownMenuProps extends ButtonProps` and `size`, `iconOnly`
  and the rest work on it directly.

  The other five — `TextField`, `RadioGroup`, `Dialog`, `AlertDialog`, `Tabs` —
  keep every part they had; only the wrapper name goes.

  Breaking, and deliberately shipped as a minor: the package has one consumer
  and it is migrating in the same change.

  | Before                                                      | After                      |
  | ----------------------------------------------------------- | -------------------------- |
  | `<Select.Root>` + `<Select.Trigger />` + `<Select.Content>` | `<Select>`                 |
  | `<DropdownMenu.Trigger><Button>M</Button></…>`              | `<DropdownMenu label="M">` |
  | `<TextField.Root />`                                        | `<TextField />`            |
  | `<RadioGroup.Root>`                                         | `<RadioGroup>`             |
  | `<Dialog.Root>`                                             | `<Dialog>`                 |
  | `<AlertDialog.Root>`                                        | `<AlertDialog>`            |
  | `<Tabs.Root>`                                               | `<Tabs>`                   |

  Props that moved: `Select.Trigger`'s `placeholder` and `animated`, and
  `DropdownMenu.Content`'s `align`, are now on their roots. Anything else you
  pass a `Select` lands on the trigger button. Dropped: `Select.Content`'s
  `position`, which only ever accepted one value and did nothing, and its
  `className`, which existed to restyle a panel whose skin is not optional.

## 1.0.4

### Patch Changes

- ca73793: Rewrite the readme as a pitch rather than a reference.

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

## 1.0.3

### Patch Changes

- 3d5ac61: Remove the `./spaceControls` subpath, and delete the dead `cardFill` stylesheet.

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

  Released as a patch rather than a major: the package is days old, the only
  consumer has already migrated off the subpath, and nothing else has used it.

  **Migration:** delete `import ctl from "@inkorange/space-ui/spaceControls"` and
  any `className={ctl.*}` it fed. Removing them changes nothing visually, since
  the components already apply that styling.

## 1.0.2

### Patch Changes

- 294bf59: Fix the `./spaceControls` subpath's types, which resolved to nothing.

  Two defects, and fixing either alone leaves the subpath broken.

  Vite bundles the JS flat to `dist/spaceControls.js`, while `tsc` preserves the
  source tree and emits the declaration to `dist/styles/spaceControls.d.ts`. The
  exports map pointed `types` at `./dist/spaceControls.d.ts`, which never
  existed — so consumers got TS7016 and every `ctl.*` silently became `any`.

  Repointing the map alone would not have helped: the emitted declaration was a
  bare passthrough re-exporting `./spaceControls.module.scss`, and that SCSS is
  not published. TS7016 would simply have become "cannot find module".

  `spaceControls.ts` now declares a `SpaceControlClasses` interface explicitly
  and asserts the module onto it, so the emitted `.d.ts` stands alone with no
  import of anything unpublished. Naming the keys also turns a typo at a call
  site into a type error rather than `undefined` at runtime.

  Verified by installing the packed tarball into a scratch project: the subpath
  resolves, `ctl.spaceInput` is `string`, and an unknown key fails to compile.

  A `check:exports` script now runs in CI and asserts every path in the exports
  map exists after a build, and that no published declaration imports a file the
  tarball does not carry.

## 1.0.1

### Patch Changes

- f7df896: Ship the README and LICENSE with the package.

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

  Adds `homepage`, `bugs` and `keywords`. Without a homepage npm fell back to
  the repository link, so the package pointed at its own readme rather than at
  the documentation site.

  Removes references to the internal application these components came from —
  from the readme, the gallery, and the source comments that reached the
  published type definitions and sourcemaps.

  Adds a component sampler image to the readme, drawn from the real token
  values so it cannot show colours the library does not ship.

## 1.0.0

### Major Changes

- 85b0f70: Establish the component-token convention and apply it to Loader.

  Component tokens now follow `--sp-<component>-<modifier>-<type>`, where type
  is one of size, color, timer, angle, width, height. Loader's three
  become `--sp-loader-orbit-size`, `--sp-loader-planet-size` and
  `--sp-loader-moon-size`.

  They are also overridable for the first time. The size classes previously
  _declared_ the properties on the component's own root, and a declaration on an
  element shadows any value inherited from an ancestor — so setting
  `--loader-moon` on a parent did nothing. They are now _read_ with a per-size
  fallback and resolved into private `--_` vars, so a value set anywhere above
  the loader flows in, with the `size` prop supplying the default.

  Two guards enforce the convention: every non-palette `--sp-*` reference must
  declare a fallback (without one, a consumer who never sets it gets an empty
  value), and every component token must end in a recognised type.

  **Migration:** `--loader-size`, `--loader-planet` and `--loader-moon` were
  never overridable from outside, so no working code depends on them.

- 85b0f70: Remove the `variant` prop from `Select.Trigger`.

  It was accepted purely for Radix call-site compatibility and discarded —
  destructured as `_variant` and never read. Styling came from the space theme
  classes, so passing it did nothing at all. With the skin now applied
  internally, even that historical justification is gone.

  It was showing up in the generated API reference as a documented prop with no
  effect, which is worse than no prop.

  **Migration:** delete `variant="ghost"` from `Select.Trigger` call sites.
  It has never had any effect, so removing it cannot change rendering.

- 85b0f70: Rename `SpaceButton` to `Button` and `SpaceLoader` to `Loader`.

  The prefix dates to July 2026, when most of these components were re-exports
  of `@radix-ui/themes` — which ships its own `Button`, so a bespoke one could
  not use that name. It meant "we wrote this one ourselves."

  After the Radix removal every component is in-house, so the distinction it
  encoded no longer exists. Twenty-two of twenty-four exports are unprefixed,
  which makes unprefixed the convention and these two the leftovers.

  `ButtonProps` is now exported as well; it was the only component whose props
  type was not public.

  **Migration:** rename `SpaceButton` to `Button` and `SpaceLoader` to `Loader`
  at call sites. Nothing else changes — same props, same rendering.

- 85b0f70: Rename `IconToggle`'s `onChange` prop to `onValueChange`.

  Every other controlled component in the library — Select, Slider, Tabs,
  RadioGroup — names this `onValueChange`. IconToggle was the only one calling
  it `onChange`, and that inconsistency had already caused a real bug: the
  gallery's own story passed `onValueChange`, so the handler was `undefined`
  and clicking an option threw instead of selecting it.

  **Migration:** rename `onChange` to `onValueChange` on `IconToggle` call
  sites. The signature is unchanged.

- 149f541: Initial release: the SpaceUI design system extracted from planet-builder.
  24 components (typography, layout, forms, overlays, buttons), 20 icons,
  design tokens, and the spaceControls class map — precompiled CSS, zero
  runtime dependencies, React 19.
- 85b0f70: Replace Radix's numeric accent steps with role names, and drop five dead tokens.

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

- 85b0f70: Rename the accent palette from hues to semantic roles.

  Colours are now named for what they do, never for what they look like — the
  treatment the grays already had. Accents run on two axes:

  - **Emphasis** — `--sp-primary-*` (was `--sp-blue-*`)
  - **Status** — `--sp-success-*` (green), `--sp-warning-*` (amber),
    `--sp-danger-*` (red), `--sp-accent-*` (violet)

  A single primary/secondary/tertiary ranking was considered and rejected: it
  would have made `secondary` mean "success" and `tertiary` mean "destructive",
  which says less than the hue names did. Emphasis and status are different
  questions and need different words.

  Component props follow: `<Text color="muted|danger|success|warning">`,
  `<Heading color="muted|danger">`, `<DropdownMenu.Item color="danger">`, and
  `<Badge>` gains a documented split — semantic roles (muted, primary, success,
  warning, danger) alongside categorical hues (cyan, purple, orange, yellow,
  accent) for telling data apart, where the hue is the identity and a ranking
  word would imply an order that does not exist.

  `--sp-yellow-9` and `--sp-orange-9` are removed: both were defined and
  referenced by nothing.

  **Migration:** rename token references and prop values per the mapping above.
  Badge's categorical colours are unchanged.

- 85b0f70: Port the folder-tab design, unify field spacing, and document the whole API.

  **Tabs** now carry their own visual design. It had been left in
  planet-builder's `ConfigurationPanel.module.scss` at extraction time, so the
  library shipped two lines of structure and no look at all. Tabs also stop
  wearing the control skin, which the design overrode entirely, and
  `Tabs.Trigger` loses its `animated` prop — nothing on a tab animates, so it
  was a prop that did nothing.

  **Single-line controls share one height.** `.spaceInput` never set a height
  despite a comment claiming it matched `.spaceControl`, so a TextField
  shrink-wrapped to its text and stood ~13px shorter than the Select beside it.
  Both read `--sp-control-height` now. Field insets are unified at 16px so a
  field, a textarea and a select align in a form; TextArea's radius tightens to
  12px.

  **`Select.Content`** may now be wider than its trigger and is never narrower,
  so long options stop wrapping for no reason. Capped by
  `--sp-select-panel-max-width`.

  **RadioGroup's tokens** are renamed `--sp-radio-group-orb-*`: `--sp-radio-*`
  did not match a component called RadioGroup, so nothing could attribute them.

  Every public component and every prop now carries JSDoc, which ships in the
  published type definitions as well as the gallery.

- 85b0f70: Every colour now lives in tokens.css. Fix Progress, which rendered nothing.

  122 raw colour values were hardcoded in component stylesheets, concentrated in
  the glass surfaces — so overriding an accent left the lit rim exactly as it
  was, and "swap one file to retheme" was only true for typography and layout.

  Glass surfaces are stored as channels rather than colours
  (`--sp-rim-rgb: 150 190 255`), so a component varies alpha locally —
  `rgb(var(--sp-rim-rgb) / 0.4)` — while the hue stays one system-level
  decision. Alpha is about layering; hue is brand.

  New roles: glass, sheen, rim, glow, glint, star, shadow, focus ring, the ember
  variant, soft status fills for badges, and a categorical scale for telling data
  apart. Component-specific colours (the slider thumb's planet shading, the radio
  orb) are named per the convention and live in tokens.css too, so the file is
  genuinely the whole palette. A test fails the build on any raw colour in a
  component stylesheet.

  Progress shipped with a one-line stylesheet — `overflow: hidden`, no height,
  no track, no fill — because its visuals lived in planet-builder's own module.
  It rendered an invisible zero-height div anywhere else. It now carries its own
  defaults, themeable through `--sp-progress-height`, `--sp-progress-track-color`
  and `--sp-progress-fill-color`.

  The gallery's Animation story moves to Foundations as Motion: the `animated`
  prop behaves identically across every component, so it is a system concern
  rather than a property of Forms.

### Minor Changes

- bbe9df8: Add the `--sp-font-family` design token and point Badge at it.

  The library sets no font-family on any component, so everything inherits the
  host app's font — except Badge, which pinned the system stack verbatim from
  Radix. In a consuming app that meant every component picked up the brand font
  and badges alone did not.

  Badge now reads `var(--sp-font-family)`, whose default is exactly the stack it
  used to hardcode, so rendering is unchanged. Consumers that want badges on
  their own font can now override one token instead of restyling the component.

- 85b0f70: `Select.Trigger` now sizes itself to its widest option.

  Previously the trigger was as wide as whatever was selected, so it changed
  width every time you picked something — and every call site papered over it
  with an inline `minWidth`, which is the component's job, not the caller's.

  The trigger renders a hidden, aria-hidden copy of every option label (and the
  placeholder) stacked in the same grid cell as the visible one, so its width is
  the widest thing it could ever show. Capped by
  `--sp-select-trigger-max-width` (default `20rem`), past which the label
  ellipsizes.

  **Migration:** remove `style={{ minWidth: … }}` from `Select.Trigger` call
  sites; it is no longer needed. Set `--sp-select-trigger-max-width` to change
  the cap.

- bbe9df8: The skin is now part of the component, and `animated` is the only motion switch.

  Previously the lit-glass treatment lived in `spaceControls` and had to be
  composed onto every call site (`className={ctl.spaceControl}`). That made the
  library's own identity opt-in — 57 of 62 call sites in planet-builder applied
  it, and the design system's own gallery forgot to, rendering every control in
  a bare state no consumer ever ships.

  Select.Trigger, Select.Content, TextField.Root, TextArea, Slider and
  Tabs.Trigger now apply their skin internally. There is no plain mode.

  In its place, a real prop for the thing that genuinely is a choice: `animated`
  (default `true`) stills the ambient loops — the orbiting rim, the glint sweep,
  the twinkling stars — on Button, Select.Trigger, Select.Content,
  TextField.Root, TextArea and Tabs.Trigger. Gradients, rim shading and shadows
  are unaffected: the look is the component, only its motion is optional.
  `prefers-reduced-motion` continues to still the loops regardless of the prop.

  Slider takes no `animated` prop — its skin has no ambient loop, and a prop that
  does nothing is worse than no prop.

  `spaceControls` is still exported and still works; existing `ctl.*`
  compositions now apply the same class the component already carries, which is
  a no-op. It will be deprecated.

### Patch Changes

- e60c650: Set `publishConfig` so the first publish lands correctly.

  `@inkorange/space-ui` is a scoped package, and npm defaults scoped packages to
  restricted. Without `access: "public"` the first publish either fails with 402
  on a free account or, worse, silently publishes a private package that nobody
  can install — a success message hiding a broken release.

  `provenance: true` makes the `id-token: write` permission the release workflow
  already requests actually do something: signed attestations linking the
  published tarball back to this repository and commit. The permission was being
  granted and ignored.
