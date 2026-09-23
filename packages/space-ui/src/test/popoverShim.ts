/**
 * The popover API, enough of it to drive a test.
 *
 * happy-dom 20 parses the `popover` attribute and answers `:popover-open`,
 * but ships neither `showPopover` nor `hidePopover` — so every component that
 * puts a surface in the top layer (Select, Autocomplete, Popover,
 * DropdownMenu, Tooltip) throws the moment it opens under test.
 *
 * This is a stand-in for the platform, not a model of it: it tracks open
 * state and makes `:popover-open` and the toggle event agree with it. What it
 * cannot stand in for is the top layer itself, light dismissal, or focus
 * behaviour — those are the browser's, and the tests that need them belong in
 * a real browser rather than here.
 */
const OPEN = "data-test-popover-open";

export function installPopoverShim(): void {
  // Typed as optional deliberately: the DOM lib declares these as always
  // present, but happy-dom does not ship them — which is the whole reason
  // this file exists.
  const proto = HTMLElement.prototype as Omit<HTMLElement, "showPopover" | "hidePopover"> & {
    showPopover?: () => void;
    hidePopover?: () => void;
  };
  if (typeof proto.showPopover === "function") return;

  const toggle = (el: HTMLElement, next: boolean) => {
    const was = el.hasAttribute(OPEN);
    if (was === next) return;
    if (next) el.setAttribute(OPEN, "");
    else el.removeAttribute(OPEN);
    el.dispatchEvent(
      Object.assign(new Event("toggle", { bubbles: false }), {
        oldState: was ? "open" : "closed",
        newState: next ? "open" : "closed",
      }),
    );
  };

  proto.showPopover = function showPopover(this: HTMLElement) {
    toggle(this, true);
  };
  proto.hidePopover = function hidePopover(this: HTMLElement) {
    toggle(this, false);
  };

  // :popover-open is what the components ask, so answer it from the same
  // state rather than leaving the two to disagree.
  const matches = Element.prototype.matches;
  Element.prototype.matches = function patched(this: Element, selector: string) {
    if (selector === ":popover-open") return this.hasAttribute(OPEN);
    if (selector === ":not(:popover-open)") return !this.hasAttribute(OPEN);
    return matches.call(this, selector);
  };
}

/** Whether a popover element is currently shown, by the shim's reckoning. */
export const isPopoverOpen = (el: Element | null | undefined): boolean =>
  el != null && el.hasAttribute(OPEN);
