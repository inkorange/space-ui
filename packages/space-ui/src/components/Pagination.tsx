"use client";
import type * as React from "react";
import { cx } from "./propShared";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import styles from "./Pagination.module.scss";
import ctl from "../styles/spaceControls";

/**
 * The data Pagination needs, in the shape most APIs return beside a page of
 * results. Pass it as `pagination`. When `onPageClick` reports a page, hand
 * back a copy with only `page` changed — the component works out everything
 * else, including how many pages there are, from these three numbers. With
 * `totalItems` at or below `pageSize` there is only one page, and the
 * component renders nothing.
 */
export interface PaginationState {
  /** The page being shown, counting from 1. If your API counts from 0, add
   *  one before passing it in. A page past either end is clamped to the first
   *  or last rather than rejected. */
  page: number;
  /** How many items one page holds — the size you requested, not how many
   *  came back on the final page. Must be above zero. */
  pageSize: number;
  /** How many items exist across every page: the full result count, not the
   *  length of the page you are showing. Usually the `total` or `count` field
   *  of the response. */
  totalItems: number;
}

/** How many pages a pagination object describes — never fewer than one. */
export function pageCount({ pageSize, totalItems }: PaginationState): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * The page numbers to offer, with `null` marking a gap to draw as an ellipsis.
 *
 * Always the same length once there are enough pages to need gaps — first,
 * last, `siblings` either side of the current page, and two slots that are
 * either a gap or the single page a gap would have hidden. A window that grew
 * and shrank as you paged would change the control's width under the cursor,
 * so the next click would land on a different number than the last one did.
 *
 * Exported so a caller rendering its own markup can reuse the arithmetic.
 */
export function pageWindow(page: number, total: number, siblings = 1): (number | null)[] {
  const range = (from: number, to: number) =>
    Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

  // first + last + current + siblings either side + two gap slots
  const slots = siblings * 2 + 5;
  if (total <= slots) return range(1, total);

  const current = Math.min(Math.max(page, 1), total);
  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  // A gap only earns its ellipsis when it hides two or more pages. Hiding one
  // page behind "…" costs the same space as just showing it.
  const gapLeft = left > 3;
  const gapRight = right < total - 2;
  const edge = siblings * 2 + 3;

  if (!gapLeft) return [...range(1, edge), null, total];
  if (!gapRight) return [1, null, ...range(total - edge + 1, total)];
  return [1, null, ...range(left, right), null, total];
}

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Where the list stands: the current page, the page size, and the total
   *  item count. Pass the object your API returns; the page count is derived
   *  from it. With one page or fewer nothing renders. */
  pagination: PaginationState;
  /** Called with the page the reader chose — a number, Previous or Next.
   *  Not called for the page already showing. Fetch or slice, then hand back
   *  an updated `pagination`. */
  onPageClick: (page: number) => void;
  /** Page numbers shown either side of the current one. Default 1. */
  siblings?: number;
  /** Ambient motion: the lit arc orbiting the current page's rim. The glass
   *  skin is always applied — only its motion is optional. Default true. */
  animated?: boolean;
}

/**
 * Page-by-page navigation for a long list.
 *
 * Holds no state: give it the pagination object you already have and it
 * reports which page was clicked.
 *
 * Every control is the same limb-lit glass as Select and Button, but only the
 * current page's rim orbits. Nine arcs turning in one row would be noise; one
 * turning is where you are. Previous and Next stay in place when they
 * cannot be used, so the numbers never slide sideways on the first and last
 * page.
 */
export function Pagination({
  pagination,
  onPageClick,
  siblings = 1,
  animated = true,
  className,
  "aria-label": ariaLabel = "Pagination",
  ...rest
}: PaginationProps) {
  const total = pageCount(pagination);
  if (total <= 1) return null;

  const current = Math.min(Math.max(pagination.page, 1), total);

  const go = (target: number) => {
    if (target !== current && target >= 1 && target <= total) onPageClick(target);
  };

  return (
    <nav {...rest} aria-label={ariaLabel} className={cx(styles.nav, className)}>
      <button
        type="button"
        className={cx(ctl.spaceControl, styles.item, styles.step)}
        disabled={current <= 1}
        aria-label="Previous page"
        onClick={() => go(current - 1)}
      >
        <ChevronLeftIcon aria-hidden="true" />
        <span className={styles.stepText}>Previous</span>
      </button>

      <ol className={styles.pages}>
        {pageWindow(current, total, siblings).map((p, i) =>
          p === null ? (
            // Presentational: "ellipsis" read aloud between page numbers tells
            // nobody anything.
            // eslint-disable-next-line react/no-array-index-key
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={cx(
                  ctl.spaceControl,
                  styles.item,
                  styles.page,
                  p === current && styles.current,
                )}
                data-animated={p === current && !animated ? "false" : undefined}
                aria-label={`Page ${p}`}
                aria-current={p === current ? "page" : undefined}
                onClick={() => go(p)}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        className={cx(ctl.spaceControl, styles.item, styles.step)}
        disabled={current >= total}
        aria-label="Next page"
        onClick={() => go(current + 1)}
      >
        <span className={styles.stepText}>Next</span>
        <ChevronRightIcon aria-hidden="true" />
      </button>
    </nav>
  );
}
