import { useEffect, useState, type CSSProperties } from "react";
import { Button, Heading, Text } from "@inkorange/space-ui";
import { Code } from "./docs-code";
import { Specimen } from "./docs-specimen";
import {
  GROUNDS,
  readPalette,
  subscribePalette,
  writePalette,
  type Ground,
  type PaletteId,
} from "./palette-state";

export default {
  title: "Palettes",
  meta: { fullBleed: true },
};

/**
 * Every box on this page is a live rendering of its own palette, not a
 * swatch standing in for one. The attribute that selects a palette sits on
 * the box, and because the tokens are ordinary custom properties they
 * cascade into the components inside it — so five palettes can be on screen
 * at once, each genuinely painted. Nothing in the library reads a provider,
 * which is the only reason this works.
 */

const PALETTES = [
  {
    id: "deep-space",
    name: "Deep Space",
    note: "The default. Shipped on :root, so nothing to import and nothing to set.",
  },
  {
    id: "nebula",
    name: "Nebula",
    note: "Violet glass, magenta limb. Expressive — media, editorial, anything that would rather be felt than measured.",
  },
  {
    id: "verdant",
    name: "Verdant",
    note: "Teal glass, green limb. For data that is mostly healthy: monitoring, uptime, anything with a baseline.",
  },
  {
    id: "solar",
    name: "Solar",
    note: "Warm amber. Note the tension — this limb sits where the warning colour lives, so an alarm reads as part of the surface rather than against it.",
  },
  {
    id: "void",
    name: "Void",
    note: "Steel, all but colourless. The one to pick when the brand supplies the only colour on screen.",
  },
] as const;

/** The six decisions a palette actually makes, in the order light reaches a surface. */
const CHANNELS = [
  { token: "--sp-glass-rgb", role: "the plate" },
  { token: "--sp-glass-deep-rgb", role: "its underside" },
  { token: "--sp-sheen-rgb", role: "light across it" },
  { token: "--sp-rim-rgb", role: "the lit limb" },
  { token: "--sp-glow-rgb", role: "bloom on hover" },
  { token: "--sp-primary-solid", role: "the action" },
] as const;

/**
 * Channels are stored as bare `r g b` triples so a component can vary the
 * alpha locally, which means a swatch has to wrap them back into a colour.
 * Accents are already colours and must not be wrapped.
 */
const swatch = (token: string): CSSProperties =>
  ({ background: token.endsWith("-rgb") ? `rgb(var(${token}))` : `var(${token})` }) as CSSProperties;

/* ---------------------------------------------------------------
   THE BOXED OPTIONS
   --------------------------------------------------------------- */

/** One palette, rendered in itself: swatches, a working specimen, its controls. */
const PaletteBox = ({
  palette,
  ground,
  onGround,
  applied,
  onApply,
}: {
  palette: (typeof PALETTES)[number];
  ground: Ground;
  onGround: (next: Ground) => void;
  applied: boolean;
  onApply: () => void;
}) => {
  return (
    <article className="docs-palette" data-sp-palette={palette.id} data-sp-ground={ground}>
      <header className="docs-palette__head">
        <Heading as="h3" size="5">
          {palette.name}
        </Heading>
        <Text size="2" color="muted">
          {palette.note}
        </Text>
      </header>

      <ul className="docs-palette__channels">
        {CHANNELS.map(({ token, role }) => (
          <li key={token} className="docs-palette__channel">
            <span className="docs-palette__chip" style={swatch(token)} />
            <span className="docs-palette__role">{role}</span>
          </li>
        ))}
      </ul>

      <Specimen lit={palette.id !== "void"} />


      <footer className="docs-palette__foot">
        <div className="docs-palette__ground" role="group" aria-label={`Ground level for ${palette.name}`}>
          <Text size="1" color="muted">
            Ground
          </Text>
          {GROUNDS.map((level) => (
            <Button
              key={level.id}
              size="sm"
              aria-pressed={ground === level.id}
              onClick={() => onGround(level.id)}
            >
              {level.label}
            </Button>
          ))}
        </div>
        <Button size="sm" onClick={onApply} aria-pressed={applied}>
          {applied ? "Applied to gallery" : "Apply to gallery"}
        </Button>
      </footer>
    </article>
  );
};

export const Presets = () => {
  // Each box keeps its own ground, so the five can be compared at different
  // brightnesses at once. Applying one hands its ground to the document.
  const [grounds, setGrounds] = useState<Record<string, Ground>>({});
  const [applied, setApplied] = useState<PaletteId | null>(() => readPalette().palette);

  // The sidebar switch changes the same thing, so follow it rather than
  // letting the two drift into disagreeing about what is applied.
  useEffect(() => subscribePalette((next) => setApplied(next.palette)), []);

  /**
   * Applying a palette sets the attribute on the document itself, so every
   * other page in this gallery repaints — which is the point of the control.
   * Walking the component pages in a palette is how you find the one place
   * its hue does not survive.
   */
  const apply = (id: PaletteId, ground: Ground) =>
    writePalette(applied === id ? { palette: null, ground: "deep" } : { palette: id, ground });

  return (
    <div className="docs-page">
      <h1 className="docs-hero__title" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
        Palettes
      </h1>
      <p className="docs-hero__lede">
        A palette moves the light and the action: the glass a surface is cut from, the limb lit
        along its edge, the bloom under a hover, and the one hue that means “press this”. It moves
        nothing else — status still means status, the chart ramp stays the measured colour-blind
        scale, and the neutral text ramp keeps the contrast it was chosen for. Twelve decisions,
        not eighty.
      </p>

      <section className="docs-section" style={{ marginTop: 32 }}>
        <div className="docs-section__label">Presets</div>
        <h2 className="docs-section__title">Five grounds, one system</h2>
        <p className="docs-section__intro">
          Each box is painted in the palette it names — the attribute sits on the box, and the
          tokens cascade into the components inside it. Press Apply to put one on the whole
          gallery, then walk the component pages to find where a hue stops working.
        </p>

        <div className="docs-palettes">
          {PALETTES.map((palette) => {
            const ground = grounds[palette.id] ?? "deep";
            return (
              <PaletteBox
                key={palette.id}
                palette={palette}
                ground={ground}
                onGround={(next) => {
                  setGrounds((prev) => ({ ...prev, [palette.id]: next }));
                  // Keep the document in step if this palette is the applied one.
                  if (applied === palette.id) writePalette({ palette: palette.id, ground: next });
                }}
                applied={applied === palette.id}
                onApply={() => apply(palette.id, ground)}
              />
            );
          })}
        </div>
      </section>

      <section className="docs-section">
        <div className="docs-section__label">Usage</div>
        <h2 className="docs-section__title">One import, one attribute</h2>
        <p className="docs-section__intro">
          On the document it themes the application; on any element it themes that subtree, which
          is how the boxes above sit side by side.
        </p>
        <Code
          language="tsx"
          label="Application"
          code={`import "@inkorange/space-ui/styles.css";
import "@inkorange/space-ui/palettes.css";

// Anywhere above your tree — the attribute is all the wiring there is.
<html data-sp-palette="nebula" data-sp-ground="raised">`}
        />
        <Code
          language="css"
          label="Your own palette, same machinery"
          code={`/* State the channels and the accent. The lit chrome — spheres,
   washes, limbs — derives from them, and all three ground levels
   come with it. */
[data-sp-palette="harbour"] {
  --sp-glass-rgb: 12 28 38;
  --sp-glass-deep-rgb: 4 10 14;
  --sp-sheen-rgb: 90 190 220;
  --sp-rim-rgb: 160 230 250;
  --sp-glow-rgb: 70 200 235;
  --sp-glint-rgb: 226 250 255;

  --sp-primary-solid: #0ea5b7;
  --sp-primary-text: #5fd8e3;
  --sp-primary-soft: #0ea5b73a;
  --sp-primary-border: #0b7c8a;
  --sp-primary-glow: #0ea5b77f;
  --sp-primary-deep: #07212a;

  --sp-focus-ring: #7fe3ee;
  --sp-glass-text: #e9fdff;
}`}
        />
      </section>

      <section className="docs-section">
        <div className="docs-section__label">Ground</div>
        <h2 className="docs-section__title">Why there is no light mode</h2>
        <p className="docs-section__intro">
          These components are not dark-coloured; they are lit glass. A fill is a translucent plate
          and a rim is light caught along its edge, so on a white page the rim has nothing to catch
          and the plate reads as a smudge. What can move is the room: the ground rises out of the
          dark and tints toward the palette’s own light, while the glass stays glass — which is why
          the text on it keeps its measured contrast at every level.
        </p>
      </section>
    </div>
  );
};

Presets.meta = { fullBleed: true };
