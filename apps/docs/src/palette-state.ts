/**
 * The gallery's current palette, shared by the sidebar switch and the
 * Palettes page.
 *
 * Two controls can change the same thing, so neither owns it: both write
 * here, and both subscribe. The value lives on the document as the same
 * attributes a consumer would set — the gallery themes itself exactly the
 * way the documentation says to — and in localStorage, so walking from
 * Buttons to Forms does not drop back to the default.
 */
export const PALETTES = [
  { id: "deep-space", name: "Deep Space" },
  { id: "nebula", name: "Nebula" },
  { id: "verdant", name: "Verdant" },
  { id: "solar", name: "Solar" },
  { id: "void", name: "Void" },
] as const;

export const GROUNDS = [
  { id: "deep", label: "Deep" },
  { id: "raised", label: "Raised" },
  { id: "bright", label: "Bright" },
] as const;

export type PaletteId = (typeof PALETTES)[number]["id"];
export type Ground = (typeof GROUNDS)[number]["id"];

/** `palette: null` is the shipped default: no attribute, tokens.css alone. */
export interface PaletteState {
  palette: PaletteId | null;
  ground: Ground;
}

const KEY = "docs-palette";
const CHANGED = "docs-palette-change";

const isPalette = (v: unknown): v is PaletteId => PALETTES.some((p) => p.id === v);
const isGround = (v: unknown): v is Ground => GROUNDS.some((g) => g.id === v);

export const DEFAULT_STATE: PaletteState = { palette: null, ground: "deep" };

/** What is stored, or the default. Never throws: a hand-edited or stale
 *  localStorage value must not take the gallery down. */
export const readPalette = (): PaletteState => {
  if (typeof localStorage === "undefined") return DEFAULT_STATE;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null") as unknown;
    if (!raw || typeof raw !== "object") return DEFAULT_STATE;
    const { palette, ground } = raw as Record<string, unknown>;
    return {
      palette: isPalette(palette) ? palette : null,
      ground: isGround(ground) ? ground : "deep",
    };
  } catch {
    return DEFAULT_STATE;
  }
};

/** Puts the state on the document, stores it, and tells every subscriber. */
export const writePalette = (next: PaletteState) => {
  const root = document.documentElement;
  if (next.palette) {
    root.dataset.spPalette = next.palette;
    root.dataset.spGround = next.ground;
  } else {
    // The default is the ABSENCE of the attribute, not a value of it — that
    // is what proves the presets cost a consumer nothing until asked for.
    delete root.dataset.spPalette;
    delete root.dataset.spGround;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Private mode, or storage full. The attribute is already set. */
  }
  window.dispatchEvent(new CustomEvent<PaletteState>(CHANGED, { detail: next }));
};

export const subscribePalette = (fn: (next: PaletteState) => void) => {
  const handler = (event: Event) => fn((event as CustomEvent<PaletteState>).detail);
  window.addEventListener(CHANGED, handler);
  return () => window.removeEventListener(CHANGED, handler);
};
