"use client";
import type * as React from "react";
import {
  Children, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import { Button } from "./Button";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import styles from "./Carousel.module.scss";

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** The slides, one child each. */
  children?: ReactNode;
  /** How many slides fit the viewport. Fractions show a partial slide at the
   *  trailing edge — `2.5` is two whole slides and half a third, a cue that
   *  there is more to swipe to. Default 1.
   *
   *  A stylesheet can override this at a breakpoint by setting
   *  `--sp-carousel-view-count` on the carousel or any ancestor; the arrows,
   *  dots and paging follow what is actually rendered, not this prop. */
  perView?: number;
  /** What an arrow moves by, and what a dot stands for. `item` moves one
   *  slide and shows a dot per stopping point; `page` moves by the number of
   *  whole slides in view, snaps only at page boundaries, and shows a dot per
   *  page. Default `item`. */
  step?: "item" | "page";
  /** Show the dots beneath the slides. */
  showPagination?: boolean;
  /** Ambient motion on the arrow buttons' rims. Default true. */
  animated?: boolean;
  /** Names the carousel for assistive tech. Say what it holds — "Featured
   *  planets" — rather than that it is a carousel, which is announced
   *  already. Default "Carousel". */
  "aria-label"?: string;
}

/**
 * A row of slides that scrolls sideways, with arrows and optional dots.
 *
 * The browser does the heavy lifting. The row is a native horizontal scroller
 * with CSS scroll snapping, so a flick on a phone uses the platform's own
 * momentum and lands on a slide, and nothing runs per frame while it moves.
 * Slide widths come from a CSS calculation on the view count, so a breakpoint
 * can change how many fit without React knowing.
 *
 * A mouse can drag the row too. It follows the pointer, then glides to the
 * next stop in the direction it was dragged; a drag never clicks a link or
 * button in the slide it ends on.
 *
 * Script does only what CSS cannot yet do everywhere: the arrows, the dots,
 * and the mouse drag.
 * It measures the rendered row — on mount and when it resizes, never on
 * scroll — to find where the row can stop, and on scroll it only compares
 * the scroll position with those stops, updating state when the active one
 * actually changes.
 */
export function Carousel({
  children,
  perView = 1,
  step = "item",
  showPagination = false,
  animated = true,
  className,
  "aria-label": ariaLabel = "Carousel",
  ...rest
}: CarouselProps) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Before anything is measured — first paint and SSR — estimate from the
  // props, so the dots and arrows render at roughly the right count rather
  // than popping in.
  const estimatedPage = step === "page" ? Math.max(1, Math.floor(perView)) : 1;
  const estimatedStops =
    count <= perView
      ? 1
      : step === "page"
        ? Math.ceil((count - perView) / estimatedPage) + 1
        // Every whole slide start the row can scroll to, plus the end itself
        // when a fraction leaves it between two starts.
        : Math.ceil(count - perView) + 1;

  const [pageSize, setPageSize] = useState(estimatedPage);
  const [stopCount, setStopCount] = useState(Math.max(1, estimatedStops));
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(count <= perView);
  // Scroll offsets the row can come to rest at. Held in a ref: they are read
  // on every scroll, and nothing needs to re-render when they are recomputed
  // unless their number changes.
  const stops = useRef<number[]>([0]);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const x = track.scrollLeft;
    const max = track.scrollWidth - track.clientWidth;
    let nearest = 0;
    stops.current.forEach((stop, i) => {
      if (Math.abs(stop - x) < Math.abs(stops.current[nearest] - x)) nearest = i;
    });
    // React skips the render when a value is unchanged, so scrolling within
    // one stop costs a comparison and nothing more.
    setActive(nearest);
    setAtStart(x <= 1);
    setAtEnd(x >= max - 1);
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    if (!items.length) return;

    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const first = items[0];
    const gap = items.length > 1 ? items[1].offsetLeft - first.offsetLeft - first.offsetWidth : 0;
    // How many slides are really in view, whatever set it: the prop, or a
    // stylesheet overriding the view count at this width.
    const inView = (track.clientWidth + gap) / (first.offsetWidth + gap);
    const size = step === "page" ? Math.max(1, Math.floor(inView + 0.01)) : 1;

    const next: number[] = [];
    items.forEach((item, i) => {
      if (i % size !== 0) return;
      const stop = Math.round(Math.min(item.offsetLeft - first.offsetLeft, max));
      if (next[next.length - 1] !== stop) next.push(stop);
    });
    // The end of the row is always somewhere you can arrive, even when no
    // slide or page starts exactly there.
    if (max > 0 && next[next.length - 1] < Math.round(max) - 1) next.push(Math.round(max));

    stops.current = next;
    setPageSize(size);
    setStopCount(next.length);
    sync();
  }, [step, sync]);

  useLayoutEffect(() => {
    measure();
  }, [measure, count]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    // Remeasure only when the row's size changes — a breakpoint, a container
    // resize. Scrolling never triggers it.
    const resize = new ResizeObserver(() => measure());
    resize.observe(track);

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      resize.disconnect();
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, [measure, sync]);

  // Dragging with a mouse. Touch and pen already scroll the row natively, with
  // the platform's momentum; a mouse gets no such gesture, so it is added here
  // and only for a mouse.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Movement under this is a click, not a drag, so links and buttons inside
    // a slide still work.
    const THRESHOLD = 4;
    let pointer: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    let settle = 0;

    const endSettling = () => {
      clearTimeout(settle);
      delete track.dataset.settling;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      if (track.scrollWidth <= track.clientWidth) return;
      endSettling();
      pointer = e.pointerId;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      dragging = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < THRESHOLD) return;
        dragging = true;
        track.setPointerCapture(e.pointerId);
        // Snapping off and scrolling instant while held, or the row would
        // fight the pointer: snap back to a slide, or ease behind it.
        track.dataset.dragging = "";
      }
      track.scrollLeft = startScroll - dx;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== pointer) return;
      pointer = null;
      if (!dragging) return;
      delete track.dataset.dragging;

      // Land on the nearest stop, but never back where the drag began: any
      // deliberate drag moves at least one stop in its direction.
      const x = track.scrollLeft;
      const all = stops.current;
      let target = all.reduce((best, stop) => (Math.abs(stop - x) < Math.abs(best - x) ? stop : best), all[0]);
      if (x > startScroll + 1 && target <= startScroll + 1) {
        target = all.find((stop) => stop > startScroll + 1) ?? target;
      } else if (x < startScroll - 1 && target >= startScroll - 1) {
        target = [...all].reverse().find((stop) => stop < startScroll - 1) ?? target;
      }

      // Snapping stays off until the row arrives. Turned back on mid-glide,
      // the browser would jump straight to a snap point.
      track.dataset.settling = "";
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      track.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
      // scrollend where supported; the timer covers browsers without it and a
      // row that was already exactly on target, which scrolls nowhere.
      track.addEventListener("scrollend", endSettling, { once: true });
      settle = window.setTimeout(endSettling, 700);
    };

    // A drag that ends over a link or button inside a slide must not click it.
    const onClick = (e: MouseEvent) => {
      if (!dragging) return;
      dragging = false;
      e.preventDefault();
      e.stopPropagation();
    };

    // Images and links are natively draggable, which would hijack the gesture.
    const onDragStart = (e: DragEvent) => e.preventDefault();

    track.addEventListener("pointerdown", onPointerDown);
    track.addEventListener("pointermove", onPointerMove);
    track.addEventListener("pointerup", onPointerUp);
    track.addEventListener("pointercancel", onPointerUp);
    track.addEventListener("click", onClick, true);
    track.addEventListener("dragstart", onDragStart);
    return () => {
      endSettling();
      track.removeEventListener("pointerdown", onPointerDown);
      track.removeEventListener("pointermove", onPointerMove);
      track.removeEventListener("pointerup", onPointerUp);
      track.removeEventListener("pointercancel", onPointerUp);
      track.removeEventListener("click", onClick, true);
      track.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  // No behaviour passed, so the stylesheet's scroll-behavior decides: smooth,
  // or instant under reduced motion.
  const scrollTo = (left: number) => trackRef.current?.scrollTo({ left });

  const go = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const x = track.scrollLeft;
    const target = direction > 0
      ? stops.current.find((stop) => stop > x + 1)
      : [...stops.current].reverse().find((stop) => stop < x - 1);
    if (target !== undefined) scrollTo(target);
  };

  const scrollable = stopCount > 1;

  return (
    <section
      {...rest}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cx(styles.root, className)}
      data-scrollable={scrollable ? "" : undefined}
    >
      <div className={styles.viewport}>
        <div
          ref={trackRef}
          id={trackId}
          className={styles.track}
          // Focusable, so arrow keys scroll it natively once it has focus.
          tabIndex={0}
          style={{ "--_view-count-default": perView } as React.CSSProperties}
        >
          {slides.map((slide, i) => (
            <div
              key={(slide as React.ReactElement).key ?? i}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              data-snap={i % pageSize === 0 ? "" : undefined}
            >
              {slide}
            </div>
          ))}
        </div>

        <span className={cx(styles.arrow, styles.prev)}>
          <Button
            iconOnly
            className={styles.arrowButton}
            animated={animated}
            aria-label="Previous"
            aria-controls={trackId}
            disabled={atStart}
            onClick={() => go(-1)}
          >
            <ChevronLeftIcon aria-hidden="true" />
          </Button>
        </span>
        <span className={cx(styles.arrow, styles.next)}>
          <Button
            iconOnly
            className={styles.arrowButton}
            animated={animated}
            aria-label="Next"
            aria-controls={trackId}
            disabled={atEnd}
            onClick={() => go(1)}
          >
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </span>
      </div>

      {showPagination && scrollable && (
        <div className={styles.dots}>
          {Array.from({ length: stopCount }, (_, i) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              type="button"
              className={styles.dot}
              aria-label={step === "page" ? `Page ${i + 1} of ${stopCount}` : `Position ${i + 1} of ${stopCount}`}
              aria-controls={trackId}
              aria-current={i === active ? "true" : undefined}
              onClick={() => scrollTo(stops.current[i] ?? 0)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
