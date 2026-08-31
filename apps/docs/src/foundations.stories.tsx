import { Code } from "./docs-code";
import { components as componentDocs, skinTokens } from "virtual:space-docs";

export default {
  title: "Foundations",
  meta: { fullBleed: true },
};

/**
 * Every value on these pages is read from the live CSS custom property
 * rather than typed in beside it. The survey therefore cannot drift from
 * tokens.css — if a token changes, this page changes with it.
 */
const readToken = (name: string) =>
  typeof document === "undefined"
    ? ""
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* ---------------------------------------------------------------
   COLOR
   --------------------------------------------------------------- */

/**
 * The `was` column records the Radix variant each role replaced. Collapsing
 * fifteen grays into seven roles is the reason this system exists, so the
 * survey shows the trade rather than quietly presenting seven grays as if
 * they had always been the plan.
 */
const GRAY_ROLES = [
  { token: "--sp-gray-text", role: "Headings and primary text", was: "gray-12" },
  { token: "--sp-gray-text-dim", role: "Secondary text, labels", was: "gray-11" },
  { token: "--sp-gray-muted", role: "Placeholder, disabled, faint", was: "gray-9" },
  { token: "--sp-gray-border", role: "Hairlines and control borders", was: "gray-a6" },
  { token: "--sp-gray-surface", role: "Subtle washes: hovers, wells", was: "gray-a2" },
  { token: "--sp-gray-panel", role: "Solid card and panel fills", was: "gray-2" },
  { token: "--sp-gray-track", role: "Recessed meter and progress tracks", was: "gray-4" },
];

const ACCENT_GROUPS = [
  {
    name: "Primary — interactive, focus, selection",
    tokens: [
      "--sp-primary-2",
      "--sp-primary-8",
      "--sp-primary-9",
      "--sp-primary-11",
      "--sp-primary-12",
      "--sp-primary-a2",
      "--sp-primary-a3",
      "--sp-primary-a6",
    ],
  },
  {
    name: "Success — safe and completed states",
    tokens: [
      "--sp-success-9",
      "--sp-success-11",
      "--sp-success-a3",
      "--sp-success-a6",
    ],
  },
  {
    name: "Warning — pending and cautionary states",
    tokens: ["--sp-warning-10", "--sp-warning-11"],
  },
  {
    name: "Danger — destructive and error states",
    tokens: ["--sp-danger-9", "--sp-danger-11"],
  },
  {
    name: "Accent — decorative, carries no status",
    tokens: ["--sp-accent-11"],
  },
];

export const Color = () => (
  <div className="docs-page">
    <h1 className="docs-hero__title" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
      Color
    </h1>
    <p className="docs-hero__lede">
      Grays are named for the job they do. Accents keep their numeric steps
      because they map to states, not roles.
    </p>

    <section className="docs-section" style={{ marginTop: 32 }}>
      <div className="docs-section__label">Grays</div>
      <h2 className="docs-section__title">Seven roles</h2>
      <p className="docs-section__intro">
        Several of these are translucent by design, which is why the chips sit
        on a checkerboard — a wash that reads as solid here would mislead you
        about how it stacks over a panel.
      </p>

      <div className="docs-swatches">
        {GRAY_ROLES.map(({ token, role, was }) => (
          <div className="docs-swatch" key={token}>
            <div
              className="docs-swatch__chip"
              style={{ ["--chip" as string]: `var(${token})` }}
            />
            <div className="docs-swatch__name">{token}</div>
            <div className="docs-swatch__value">{readToken(token)}</div>
            <div className="docs-swatch__role">
              {role}
              <span className="docs-swatch__was">replaced {was}</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {ACCENT_GROUPS.map((group) => (
      <section className="docs-section" key={group.name}>
        <div className="docs-section__label">Accent</div>
        <h2 className="docs-section__title">{group.name}</h2>
        <div className="docs-accents">
          {group.tokens.map((token) => (
            <div className="docs-accent" key={token}>
              <div
                className="docs-accent__chip"
                style={{ ["--chip" as string]: `var(${token})` }}
              />
              <div className="docs-accent__meta">
                <div className="docs-accent__name">{token.replace("--sp-", "")}</div>
                <div className="docs-accent__value">{readToken(token)}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
);

Color.meta = { fullBleed: true };

/* ---------------------------------------------------------------
   SPACING
   --------------------------------------------------------------- */

const SPACING = [
  { token: "--spacing-xs", steps: "½ step", use: "Icon gaps, tight label stacks" },
  { token: "--spacing-sm", steps: "1 step", use: "Control padding, inline gaps" },
  { token: "--spacing-md", steps: "2 steps", use: "Card insets, form row rhythm" },
  { token: "--spacing-lg", steps: "3 steps", use: "Section separation" },
  { token: "--spacing-xl", steps: "4 steps", use: "Page and panel gutters" },
];

export const Spacing = () => (
  <div className="docs-page">
    <h1 className="docs-hero__title" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
      Spacing
    </h1>
    <p className="docs-hero__lede">
      An eight-point grid with one half-step. Off-grid values round up, never
      down — a 12px measurement becomes 16px, so density never creeps in by
      accident.
    </p>

    <section className="docs-section" style={{ marginTop: 32 }}>
      <div className="docs-section__label">Scale</div>
      <h2 className="docs-section__title">Five steps</h2>
      <p className="docs-section__intro">
        Bars are drawn at their true size, so the ratios you see are the ratios
        you get.
      </p>

      <div className="docs-scale">
        {SPACING.map(({ token, steps, use }) => (
          <div className="docs-scale__row" key={token}>
            <div className="docs-scale__name">{token.replace("--spacing-", "")}</div>
            <div className="docs-scale__value">{readToken(token)}</div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}
            >
              <div className="docs-scale__bar" style={{ width: `var(${token})` }} />
              <span className="docs-swatch__role" style={{ minWidth: 0 }}>
                {use}
                <span className="docs-swatch__was">{steps}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

Spacing.meta = { fullBleed: true };

/* ---------------------------------------------------------------
   TYPE
   --------------------------------------------------------------- */

const TYPE = [
  { token: "--sp-font-xs", use: "Captions, badge text, dense readouts" },
  { token: "--sp-font-sm", use: "Labels, secondary copy, control text" },
  { token: "--sp-font-md", use: "Body copy" },
  { token: "--sp-font-xl", use: "Headings" },
];

export const TypeScale = () => (
  <div className="docs-page">
    <h1 className="docs-hero__title" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
      Type scale
    </h1>
    <p className="docs-hero__lede">
      Four sizes. The library ships no webfont and sets no font-family on any
      component — it inherits whatever the host app already loaded.
    </p>

    <section className="docs-section" style={{ marginTop: 32 }}>
      <div className="docs-section__label">Family</div>
      <h2 className="docs-section__title">Inherited, with one pin</h2>
      <p className="docs-section__intro">
        Almost nothing declares a font-family, and nothing in the library
        renders through a portal, so your app's font reaches components by plain
        inheritance. Two pin a stack instead — Badge and SpaceButton — and both
        read <code>--sp-font-family</code>. There is deliberately no
        per-component font hook: typeface is a system decision made in one
        place, and a test fails the build if a component introduces its own.
      </p>

      <div className="docs-swatches">
        <div className="docs-swatch docs-swatch--wide">
          <div className="docs-swatch__name">--sp-font-family</div>
          <div className="docs-swatch__role">
            The stack Badge pins to. Override it to bring badges onto your own
            font; every other component already follows the app.
            <span className="docs-swatch__was">{readToken("--sp-font-family")}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Code
          label="Overriding it"
          language="css"
          code={`/* your app */
:root {
  --sp-font-family: "Inter", system-ui, sans-serif;
}`}
        />
      </div>
    </section>

    <section className="docs-section">
      <div className="docs-section__label">Scale</div>
      <h2 className="docs-section__title">Four sizes</h2>
      <p className="docs-section__intro">
        Samples render at the token's real size, in the same stack a consuming
        app would get.
      </p>

      <div className="docs-scale">
        {TYPE.map(({ token, use }) => (
          <div className="docs-typerow" key={token}>
            <div className="docs-scale__name">{token.replace("--sp-font-", "")}</div>
            <div className="docs-scale__value">{readToken(token)}</div>
            <div className="docs-typerow__sample" style={{ fontSize: `var(${token})` }}>
              {use}
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

TypeScale.meta = { fullBleed: true };

/* ---------------------------------------------------------------
   TOKEN USAGE
   --------------------------------------------------------------- */

/** Reverse index: token → the components whose stylesheets reference it. */
const usageByToken = () => {
  const map = new Map<string, string[]>();
  for (const doc of componentDocs) {
    for (const token of doc.paletteTokens) {
      const list = map.get(token) ?? [];
      // Namespaced parts share one stylesheet, so collapse to the file's
      // component: Select.Trigger and Select.Content are one entry.
      const owner = doc.name.split(".")[0];
      if (!list.includes(owner)) list.push(owner);
      map.set(token, list);
    }
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
};

const unusedTokens = (used: Set<string>) =>
  [
    ...GRAY_ROLES.map((g) => g.token),
    ...ACCENT_GROUPS.flatMap((g) => g.tokens),
    ...SPACING.map((s) => s.token),
    ...TYPE.map((t) => t.token),
    "--sp-font-family",
  ].filter((t) => !used.has(t));

export const TokenUsage = () => {
  const usage = usageByToken();
  const used = new Set(usage.map(([token]) => token));
  const unused = unusedTokens(used);
  const skinned = Object.entries(skinTokens);

  return (
    <div className="docs-page">
      <h1
        className="docs-hero__title"
        style={{ fontSize: "clamp(28px, 4vw, 40px)" }}
      >
        Token usage
      </h1>
      <p className="docs-hero__lede">
        Which components read which tokens, read from the component stylesheets
        at build time. Use it to answer the question that matters before you
        override anything: what else will change?
      </p>

      <section className="docs-section" style={{ marginTop: 32 }}>
        <div className="docs-section__label">Reverse index</div>
        <h2 className="docs-section__title">Token → components</h2>
        <p className="docs-section__intro">
          Namespaced parts share one stylesheet, so <code>Select.Trigger</code>{" "}
          and <code>Select.Content</code> appear once as <code>Select</code>.
        </p>

        <div className="docs-swatches">
          {usage.map(([token, owners]) => (
            <div className="docs-swatch docs-swatch--usage" key={token}>
              <div className="docs-swatch__name">{token}</div>
              <div className="docs-swatch__value">{readToken(token)}</div>
              <div className="docs-swatch__role">
                {owners.join(", ")}
                <span className="docs-swatch__was">
                  {owners.length} component{owners.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {unused.length > 0 && (
        <section className="docs-section">
          <div className="docs-section__label">Unreferenced</div>
          <h2 className="docs-section__title">Defined but unused</h2>
          <p className="docs-section__intro">
            These tokens are part of the published contract but no component
            stylesheet reads them — they exist for consumers to build with, and
            overriding one changes nothing inside the library.
          </p>
          <div className="docs-chips">
            {unused.map((t) => (
              <code key={t}>{t}</code>
            ))}
          </div>
        </section>
      )}

      <section className="docs-section">
        <div className="docs-section__label">Skin layer</div>
        <h2 className="docs-section__title">spaceControls uses no tokens</h2>
        <p className="docs-section__intro">
          The glass skin is built from literal colours rather than tokens, so
          retheming through the token layer will not restyle it. That is worth
          knowing before you override an accent and wonder why the lit rim
          stayed blue.
        </p>
        <div className="docs-chips">
          {skinned.map(([cls, tokens]) => (
            <code key={cls}>
              .{cls} — {tokens.length === 0 ? "no tokens" : tokens.join(", ")}
            </code>
          ))}
        </div>
      </section>
    </div>
  );
};

TokenUsage.meta = { fullBleed: true };
