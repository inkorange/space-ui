/**
 * The token generator's arithmetic, kept out of the page that draws it.
 *
 * Three colours and two lengths are enough to describe a system, because the
 * library derives the rest: every spacing step is a multiple of one base,
 * every radius a step off another, and the lit chrome — spheres, washes,
 * limbs — follows the six glass channels. So the generator asks five
 * questions and writes the file that answers eighty.
 *
 * Channels are emitted as bare `r g b` triples because components compose
 * alpha locally (`rgb(var(--sp-rim-rgb) / 0.4)`). That is why the
 * derivations below are arithmetic rather than `color-mix`: a mix produces a
 * colour, and a colour cannot have its alpha varied this way.
 */
export interface Recipe {
  /** The plate a surface is cut from — the darkest decision. */
  glass: string;
  /** The lit limb along its edge. The system's light. */
  light: string;
  /** The one hue that means "press this". */
  accent: string;
  /** Every spacing step is a multiple of this. */
  gridBase: number;
  /** Every radius step is derived from this. 0 squares the library off. */
  radiusBase: number;
  /**
   * The corner of a button and the controls beside it, kept apart from the
   * scale above: the family is pill-shaped by default, and squaring the
   * panels off should not square the buttons unless that is what was meant.
   *
   * Measured in px from 0 up to PILL. The ceiling is not arbitrary — the
   * tallest control is 48px, so at 24 every size in the ladder has a corner
   * of half its height and is already a pill. A slider that ran to 999 would
   * spend 98% of its travel repeating that same pill.
   */
  controlRadius: number;
}

/**
 * The top of the control-radius range: half the tallest control in the
 * ladder, which is where the whole family is a pill. At this value the
 * generated file emits --sp-radius-full rather than a length, so the shape
 * stays a pill if a consumer later changes the control heights.
 */
export const PILL = 24;

export const DEFAULT_RECIPE: Recipe = {
  glass: "#0f1428",
  light: "#96beff",
  accent: "#0090ff",
  gridBase: 8,
  radiusBase: 8,
  controlRadius: PILL,
};

type Rgb = [number, number, number];

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0) as Rgb;
};

export const rgbToHex = ([r, g, b]: Rgb) =>
  `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;

/** `amount` of 1 is `to`, 0 is `from`. */
const mix = (from: Rgb, to: Rgb, amount: number): Rgb =>
  from.map((c, i) => clamp(c + (to[i] - c) * amount)) as Rgb;

const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [255, 255, 255];

/** A triple, for a channel token. */
const triple = (rgb: Rgb) => rgb.map(clamp).join(" ");

/** Two hex digits of alpha, for the accent tokens that carry one. */
const alpha = (fraction: number) =>
  clamp(fraction * 255)
    .toString(16)
    .padStart(2, "0");

/**
 * The derived palette. The ratios are read off the shipped Deep Space values
 * rather than invented, so a recipe built from Deep Space's own three colours
 * reproduces something very close to the default.
 */
export const derive = (recipe: Recipe) => {
  const glass = hexToRgb(recipe.glass);
  const light = hexToRgb(recipe.light);
  const accent = hexToRgb(recipe.accent);

  return {
    channels: {
      "--sp-glass-rgb": triple(glass),
      // The underside of the same plate: the fill's lower stop.
      "--sp-glass-deep-rgb": triple(mix(glass, BLACK, 0.62)),
      // Light travelling ACROSS the surface sits between the limb and the
      // accent — it is the light, taking the palette's colour.
      "--sp-sheen-rgb": triple(mix(mix(light, accent, 0.55), BLACK, 0.12)),
      "--sp-rim-rgb": triple(light),
      // The bloom under a hover is the accent, lifted toward the limb.
      "--sp-glow-rgb": triple(mix(accent, light, 0.35)),
      // The sweep across the surface: the limb, nearly white.
      "--sp-glint-rgb": triple(mix(light, WHITE, 0.72)),
    },
    accents: {
      "--sp-primary-solid": rgbToHex(accent),
      "--sp-primary-text": rgbToHex(mix(accent, light, 0.6)),
      "--sp-primary-soft": `${rgbToHex(accent)}${alpha(0.23)}`,
      "--sp-primary-border": rgbToHex(mix(accent, BLACK, 0.28)),
      "--sp-primary-glow": `${rgbToHex(accent)}${alpha(0.5)}`,
      "--sp-primary-deep": rgbToHex(mix(glass, accent, 0.12)),
    },
    surfaces: {
      "--sp-focus-ring": rgbToHex(mix(light, WHITE, 0.2)),
      "--sp-glass-text": rgbToHex(mix(light, WHITE, 0.86)),
      "--sp-ground-color": rgbToHex(mix(glass, BLACK, 0.62)),
    },
    lengths: {
      "--sp-grid-base-size": `${recipe.gridBase}px`,
      "--sp-radius-base-size": `${recipe.radiusBase}px`,
      "--sp-control-radius-size":
        recipe.controlRadius >= PILL ? "var(--sp-radius-full)" : `${recipe.controlRadius}px`,
    },
    /**
     * The derived steps, restated.
     *
     * tokens.css declares these on :root, and a custom property substitutes
     * its var()s on the element where it is DECLARED — so re-pointing the
     * base on a descendant never re-runs those calcs. Setting the attribute
     * on <html> happens to work, because that is the same element; setting
     * it on one panel silently would not. Restating the steps here makes the
     * file behave the same wherever it is applied, which is what "or on any
     * element" has to mean.
     */
    scales: {
      "--spacing-xs": "calc(var(--sp-grid-base-size) * 0.5)",
      "--spacing-sm": "var(--sp-grid-base-size)",
      "--spacing-md": "calc(var(--sp-grid-base-size) * 2)",
      "--spacing-lg": "calc(var(--sp-grid-base-size) * 3)",
      "--spacing-xl": "calc(var(--sp-grid-base-size) * 4)",
      "--spacing-2xl": "calc(var(--sp-grid-base-size) * 5)",
      "--sp-radius-sm": "calc(var(--sp-radius-base-size) * 0.5)",
      "--sp-radius-md": "calc(var(--sp-radius-base-size) * 0.75)",
      "--sp-radius-lg": "var(--sp-radius-base-size)",
      "--sp-radius-xl": "calc(var(--sp-radius-base-size) * 1.5)",
    },
  };
};

const SECTIONS: Array<{ key: keyof ReturnType<typeof derive>; title: string }> = [
  { key: "channels", title: "The light. Bare channels, so components can vary the alpha." },
  { key: "accents", title: "The action." },
  { key: "surfaces", title: "Focus, text on glass, and the ground behind it." },
  { key: "lengths", title: "One base each: every step is derived from these." },
  {
    key: "scales",
    title:
      "The derived steps, restated so the block works on a subtree and not only on <html>.",
  },
];

/**
 * The file a consumer drops into their application. It is scoped to an
 * attribute rather than :root on purpose — that is the same shape the shipped
 * palettes use, so it composes with them instead of fighting them, and it can
 * be applied to one panel as easily as to the document.
 */
export const toCss = (recipe: Recipe, name = "custom") => {
  const parts = derive(recipe);
  const body = SECTIONS.map(({ key, title }) => {
    const rows = Object.entries(parts[key])
      .map(([token, value]) => `  ${token}: ${value};`)
      .join("\n");
    return `  /* ${title} */\n${rows}`;
  }).join("\n\n");

  return `/* Generated by the SpaceUI token generator.
   Drop this in after the library's stylesheet, then set the attribute:
   <html data-sp-palette="${name}"> — or on any element, to style one panel. */
[data-sp-palette="${name}"] {
${body}
}
`;
};
