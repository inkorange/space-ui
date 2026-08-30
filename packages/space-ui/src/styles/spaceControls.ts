// The shared control-chrome class map, exported as a deliberate public API:
// planet-builder (and any consumer) composes these onto its own elements
// (`ctl.spaceInput`, trigger overrides, ...). Post-1.0 goal: fold the common
// uses into real component variants and deprecate this raw surface.
import ctl from "./spaceControls.module.scss";
export default ctl;
