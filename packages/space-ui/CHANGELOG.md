# @inkorange/space-ui

## 1.7.0

### Minor Changes

- fa17a5a: Add `Checkbox` and `CheckboxGroup`.

  `Checkbox` is a single yes/no choice. `CheckboxGroup` wraps `CheckboxGroup.Item`s and holds the chosen values as an array, so a set where any number can be picked costs one piece of state rather than one boolean per option. Ticking appends, so the array keeps the order things were chosen in.

  `indeterminate` draws a dash instead of a tick and sets the DOM property, so a select-all row that is only partly chosen announces as mixed. Checking lights the tile along its rim, draws the tick on rather than popping it in, and sends a ring of light out from the tile; `animated` motion is skipped under reduced motion. Labels are part of the click target, and a label that wraps keeps its tile against its first line. Sizes and spacing come from `--sp-checkbox-box-size`, `--sp-checkbox-label-gap-size` and `--sp-checkbox-row-gap-size`; the mark and its glow from `--sp-checkbox-mark-color`, `--sp-checkbox-glow-color` and `--sp-checkbox-halo-color`.

  `RadioGroup` gets the same ring of light when an option is chosen, from the same shared mixin, so the two controls flash alike. Its labels are also set to the library's 14px type step (14px on a 20px line, matching Text size 2) rather than inheriting the surrounding text size, so they match the text in every other control.

- e1203d7: Add `--sp-grid-base-size`, the library's 8px spacing unit, and retune `RadioGroup` against it.

  Spacing is now expressed as whole multiples of one token, so changing it retunes the rhythm: 4px for a denser application, 10px for a roomier one. Sizes that are not spacing — a control's height, the radio orb's diameter, an optical nudge onto a text baseline — stay independent of it.

  `RadioGroup` gets more room in both directions: two grid units between an orb and its label (`--sp-radio-group-label-gap-size`, was 8px) and two between options (`--sp-radio-group-row-gap-size`, was 8px). An option now aligns to the top, so a label that wraps to two lines keeps its orb against the first line instead of dragging it down beside the gap between them.

## 1.6.1

### Patch Changes

- 993b0fd: Fix `Carousel` showing one dot too many, and leaving the second-to-last dot lit at the end.

  When a slide's content was wider than its column — a card with an image, most often — the row could scroll a little past the position scroll snapping lets it rest at. That extra room counted as a stopping point, so the dots gained a final one nobody could reach and arriving at the end still lit the dot before it. The last stop is now the position the last slide actually snaps to, and the same position decides when the Next arrow turns off.

  The stopping points are also rechecked when the row's scrollable width changes without the carousel itself resizing, which happens when an image or web font arrives after the first measurement.

## 1.6.0

### Minor Changes

- 5a11eb5: Add Carousel: a row of slides that scrolls sideways, built on native CSS scroll snapping so a flick on a phone uses the platform's own momentum and lands on a slide; with a mouse, drag it. `perView` takes fractions (`2.5` leaves half a slide at the edge), `step` chooses whether the arrows move by one slide or by a page, and `showPagination` adds dots beneath. Override `--sp-carousel-view-count` in a media query to change how many slides fit at a breakpoint, and `--sp-carousel-gap-size` for the space between them.

### Patch Changes

- 9aa5e32: Fix `DropdownMenu` ignoring a click on its trigger shortly after the menu
  closed.

  The trigger guarded against a real race — pressing it while the menu is open
  closes the menu during pointerdown, so the click that follows would otherwise
  reopen it — with a 300ms window that ignored trigger clicks after any close.
  Escape armed that window too, so pressing Escape and then clicking the trigger
  again within 300ms did nothing.

  The trigger now records, at pointerdown, whether the menu was open, and the
  click acts on that. It no longer depends on event timing, and nothing is
  swallowed. This is the same fix Popover shipped with.

## 1.5.0

### Minor Changes

- 49f0649: New `Popover`: a button that opens a floating panel of anything.

  ```tsx
  <Popover label="Filter planets" align="end">
    <FilterForm />
  </Popover>
  ```

  The trigger is always a Button, so `size`, `iconOnly` and the rest of
  `ButtonProps` shape it directly; the children are the panel. For a list of
  actions use DropdownMenu, and for a line of text, Tooltip.

  It rides the browser's own popover layer, so the panel stacks above everything
  without a z-index arms race and closes on Escape or a press elsewhere by the
  platform's rules. It flips above its trigger when there is no room below, and
  stays attached when the page scrolls or the layout around it shifts. Opening
  moves focus to the panel's first control; Escape hands focus back to the
  trigger. Controlled through `open` and `onOpenChange`, or left to manage
  itself, with `defaultOpen` to show it on arrival without taking focus.

  It reveals with a short glide away from its trigger and a quicker fade, so it
  is readable almost at once and then settles, and dismisses faster still — a
  reader who closed something has already moved on. When it flips above its
  trigger it rises into place rather than falling. Reduced motion drops the
  travel and keeps only a brief fade.

  The stickersheet now shows an open Popover and a Pagination, and the README's
  image is recaptured from it.

- 49f0649: Everything that appears and disappears now reveals and dismisses the same way:
  Popover, Tooltip, DropdownMenu, the Select and Autocomplete panels, and Dialog
  with AlertDialog.

  On reveal a surface glides eight pixels into place while fading in — opaque in
  about 120ms, still settling to about 380ms, so it is readable almost at once
  and then settles rather than snapping. Dismissal is a quicker fade, and the
  surface stays rendered until it has finished. Dialog's backdrop dims in and
  out with its panel.

  Before this, Tooltip and Dialog each had their own short entry keyframe and no
  exit at all, and DropdownMenu, Select and Autocomplete appeared and vanished
  instantly. The timing now lives in one place, so they cannot drift apart
  again.

  A surface that can open on more than one side travels away from its trigger on
  whichever side it lands — a tooltip flipped above rises, one to the right of a
  control slides right. Reduced motion drops the travel everywhere and keeps a
  brief fade. Browsers without `@starting-style` show and hide without motion.

### Patch Changes

- 49f0649: `Autocomplete` offers nothing until something is typed.

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

## 1.4.0

### Minor Changes

- 25f49c7: New `Pagination`.

  ```tsx
  <Pagination
    pagination={{ page, pageSize: 120, totalItems: 2091 }}
    onPageClick={(page) => fetchPage(page)}
  />
  ```

  Give it the pagination object your API returns — page, page size and total
  items — and it reports the clicked page through `onPageClick`. It holds no
  state, has no framework dependency, and renders nothing for a single page.

  It shows the first page, the last, and `siblings` either side of the current
  one (default 1), with an ellipsis only where it would hide two or more pages —
  hiding one page behind "…" costs the same room as just showing it.

  The control holds the same width on every page. The window always has the same
  number of slots, and a gap is exactly as wide as a page number, so the row
  never shifts under the cursor and the next click lands where the last one did.
  Previous and Next stay in place when they cannot be used, for the same reason.

  Every control wears the same limb-lit glass as Select and Button, but only the
  current page's rim orbits — nine arcs turning in one row would be noise. The
  current page is lit at the rim and from within while the other numbers step
  back, so it reads as where you are rather than as a brighter peer. `animated={false}` stills the orbit; the skin
  stays.

  `pageCount` and `pageWindow` are exported for anyone rendering their own
  markup.

  The gallery's API tables now document the data objects a component needs, not
  just its props. A props table could only show that `pagination` is a
  `PaginationState` — not what goes in one. Any exported interface a prop's type
  names now gets a table of its own beside that component, which also documents
  `AutocompleteOption` and `IconToggleOption` for the first time.

## 1.3.0

### Minor Changes

- ff9f2a4: New `Autocomplete`: a text field that offers matching rows as you type.

  ```tsx
  <Autocomplete
    value={query}
    onValueChange={setQuery}
    onSelect={(slug) => router.push(`/exoplanets/${slug}`)}
    icon={<MagnifyingGlassIcon width={16} height={16} />}
    options={matches.map((m) => ({
      value: m.slug,
      label: m.name,
      meta: m.type,
    }))}
    emptyMessage="Nothing matching that."
    footer="Showing 50 of 2,700 — keep typing to narrow it down."
  />
  ```

  It never fetches and never ranks. You hand it the candidate rows, in the order
  your domain considers best, and it narrows them against what has been typed —
  keeping your order — then owns the parts every autocomplete needs and nobody
  enjoys writing twice: the popover, the keyboard model and the aria wiring.

  `caseSensitive` makes the match exact, so `trappist` no longer finds
  `TRAPPIST`. `preFiltered` skips the match altogether, for rows a server or a
  fuzzy search already chose — without it, a plain substring test here would
  silently drop rows a smarter match upstream had found. Both are ordinary
  booleans defaulting to false, so `<Autocomplete caseSensitive />` is enough.

  When `label` is markup rather than a string, give the option a `search` string
  to match against; it falls back to `value`, which is usually a slug and rarely
  what anyone is typing.

  Arrows move the highlight and skip disabled rows, Home and End jump to the
  ends, Enter selects, Escape and Tab close, and an outside pointerdown
  dismisses. Hovering moves the same highlight the keyboard uses, so a mouse
  highlight and a keyboard highlight can never disagree about what Enter would
  do. The list is a popover rather than a block in the flow, because results
  that appear mid-keystroke and push the page down under the cursor are
  disorienting.

  Send no options, no `loading` and no `emptyMessage` and no panel appears at
  all — which is how you keep it shut below a minimum query length without
  managing open state yourself.

- 4ba37b4: `IconToggle` takes an `orientation` — `"horizontal"` (the default, unchanged)
  or `"vertical"` for a rail down the edge of a viewport, where a horizontal
  strip eats the width you need.

  Its tooltips move with it. A vertical pill has a segment directly below every
  segment, so a tooltip hanging below would cover the next option; on a rail
  they go to the side instead. That needed `Tooltip` to place on the horizontal
  axis at all, so it now accepts `side="left"` and `side="right"` alongside top
  and bottom, with the same flip-when-there-is-no-room behaviour on both axes.

  `IconToggle`'s `value` is now `NoInfer<V>`. The generic is genuinely useful —
  `onValueChange` hands you the union of your own option values rather than a
  bare `string`, so a switch over it is exhaustive and it assigns straight into
  narrow state. But `V` was inferring from `value` as well as `options`, so a
  value that was not among the options simply widened `V` to include itself:
  the generic silently accepted the one mistake it looks like it should catch.
  It is now derived from `options` alone, and a mismatched `value` is an error.

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
