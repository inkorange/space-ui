// The shared control-chrome class map, exported as a deliberate public API:
// a consumer composes these onto its own elements (`ctl.spaceInput`, trigger
// overrides, ...). Post-1.0 goal: fold the common uses into real component
// variants and deprecate this raw surface.
import ctlModule from "./spaceControls.module.scss";

/** Declared explicitly rather than inferred from the SCSS module, so the
 *  emitted .d.ts stands alone: the .module.scss is not published, and a
 *  consumer importing this subpath must not need it. Naming the keys also
 *  means a typo at a call site is a type error instead of `undefined`. */
export interface SpaceControlClasses {
  spaceControl: string;
  spaceInput: string;
  spacePanel: string;
  spaceSlider: string;
  spaceTextArea: string;
  rimRotate: string;
}

// Through `unknown` because Vite types a CSS module as CSSModuleClasses —
// an index signature, which TypeScript will not narrow straight to a named
// interface. The names are checked against the SCSS by a test instead.
const ctl = ctlModule as unknown as SpaceControlClasses;
export default ctl;
