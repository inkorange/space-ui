/**
 * Shows a popover-API element after it has been placed, so its reveal starts
 * from the right side.
 *
 * The reveal's starting offset is captured the instant the element first
 * renders, and which way it should travel depends on where it lands — which
 * can flip when there is no room — which needs its size, which needs it
 * rendered. Showing first and measuring after locks a flipped surface into
 * travelling towards its own trigger.
 *
 * So `place` runs while the element is laid out but invisible, with every
 * transition off, and must write the side it chose to `data-side`. The
 * element then returns to unrendered and that state is committed before it is
 * shown, so the real reveal begins fresh from its starting style. Transitions
 * stay off until then: leaving the measurement with them on counts as a
 * dismissal, which keeps the element rendered animating its offset, and the
 * reveal would start from that live value instead.
 *
 * Pairs with the `reveal` mixin, which supplies the `data-measuring` and
 * `data-instant` states this relies on.
 */
export function showMeasured(element: HTMLElement, place: () => void): void {
  if (element.matches(":popover-open")) return;
  element.dataset.instant = "";
  element.dataset.measuring = "";
  place();
  delete element.dataset.measuring;
  void element.offsetWidth;
  delete element.dataset.instant;
  void element.offsetWidth;
  element.showPopover();
}
