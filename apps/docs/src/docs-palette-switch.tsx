import { useEffect, useState, type CSSProperties } from "react";
import {
  GROUNDS,
  PALETTES,
  readPalette,
  subscribePalette,
  writePalette,
  type PaletteState,
} from "./palette-state";

/**
 * The palette switch, in the sidebar so it is reachable from every page.
 *
 * Judging a palette means watching it on the components, not on a page built
 * to flatter it — so the control travels with you and the whole gallery
 * repaints under it.
 *
 * Each dot is painted by the palette it selects: the swatch is a real
 * rendering of that palette's accent and limb, lit by the same tokens a
 * consumer would get, rather than a hardcoded hex that could drift from it.
 */
const DOT: CSSProperties = {
  background: "var(--sp-primary-solid)",
  boxShadow: "inset 0 0 0 1px rgb(var(--sp-rim-rgb) / 0.55)",
};

export const PaletteSwitch = () => {
  const [state, setState] = useState<PaletteState>(() => readPalette());

  useEffect(() => subscribePalette(setState), []);

  const set = (next: Partial<PaletteState>) => writePalette({ ...state, ...next });

  return (
    <div className="docs-palette-switch">
      <div className="docs-palette-switch__head">
        <span className="docs-palette-switch__label">Palette</span>
        {state.palette && (
          <button
            type="button"
            className="docs-palette-switch__reset"
            onClick={() => set({ palette: null })}
          >
            Reset
          </button>
        )}
      </div>

      <div className="docs-palette-switch__row" role="group" aria-label="Palette">
        {PALETTES.map((p) => (
          <button
            key={p.id}
            type="button"
            // The dot is inside the palette it offers, so it paints itself.
            data-sp-palette={p.id}
            className="docs-palette-switch__dot"
            aria-pressed={state.palette === p.id}
            aria-label={p.name}
            title={p.name}
            onClick={() => set({ palette: p.id })}
          >
            <span className="docs-palette-switch__chip" style={DOT} />
          </button>
        ))}
      </div>

      {/* The ground only means anything once a palette is chosen: the default
          palette's ground is the one tokens.css states. */}
      {state.palette && (
        <div className="docs-palette-switch__row" role="group" aria-label="Ground level">
          {GROUNDS.map((g) => (
            <button
              key={g.id}
              type="button"
              className="docs-palette-switch__ground"
              aria-pressed={state.ground === g.id}
              onClick={() => set({ ground: g.id })}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
