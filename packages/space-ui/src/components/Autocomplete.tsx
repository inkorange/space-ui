// A text field with a result list hanging under it.
//
// It never fetches and never ranks: the consumer hands it the candidate rows,
// from memory or from an API, in whatever order that domain considers best.
// What it does own is the narrowing — matching the typed text against those
// rows — plus the popover, the keyboard model and the aria wiring. Those are
// the parts every autocomplete needs and nobody enjoys writing twice.
//
// A caller whose rows were already matched server-side passes `preFiltered`
// and the narrowing is skipped, so a fuzzy or synonym match made elsewhere is
// not undone by a plain substring test here.
"use client";
import type * as React from "react";
import {
  useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode,
} from "react";
import { cx } from "./propShared";
import { TextField } from "./TextField";
import styles from "./Autocomplete.module.scss";
import ctl from "../styles/spaceControls";

export interface AutocompleteOption {
  /** Handed back to `onSelect` when this row is chosen. */
  value: string;
  /** The row's main text. */
  label: ReactNode;
  /** Optional secondary text, set against the trailing edge — a category, a
   *  score, a date. Kept out of `label` so it stays visually subordinate and
   *  does not affect which row a reader scans for. */
  meta?: ReactNode;
  /** Shown, but skipped by the keyboard and unselectable. */
  disabled?: boolean;
  /** The text the typed query is matched against, when `label` is not a plain
   *  string. Falls back to `label` if it is one, and to `value` otherwise —
   *  and `value` is usually a slug, which is rarely what someone is typing. */
  search?: string;
}

export interface AutocompleteProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onSelect" | "className" | "style"
  > {
  /** The text in the field. Fully controlled. */
  value: string;
  /** Called on every keystroke. */
  onValueChange: (value: string) => void;
  /** The candidate rows, in the order you want them shown. They are narrowed
   *  against what has been typed unless `preFiltered` is set; the order you
   *  give is always preserved, so ranking stays yours. An empty array with no
   *  `loading` and no `emptyMessage` shows nothing at all, which is how you
   *  keep the panel shut until a query is worth answering. */
  options: AutocompleteOption[];
  /** Called when a row is chosen by click or Enter. */
  onSelect: (value: string, option: AutocompleteOption) => void;
  /** Renders a leading glyph inside the field — a magnifier, usually. */
  icon?: ReactNode;
  /** Match exactly as typed, so `trappist` no longer finds `TRAPPIST`.
   *  Default off, which is what nearly every search wants. */
  caseSensitive?: boolean;
  /** The rows were already matched — by a server, a fuzzy search, a synonym
   *  table — so render them as given. Without this a substring test here
   *  would silently drop rows a smarter match upstream had found. */
  preFiltered?: boolean;
  /** Replaces the list with a waiting message while results are on their way. */
  loading?: boolean;
  /** What that waiting message says. Name the thing being fetched — "Loading
   *  the catalogue…" tells a reader more than a spinner's worth of nothing.
   *  Default "Loading…". */
  loadingMessage?: ReactNode;
  /** Shown when there are no options and nothing is loading. Leave it out to
   *  show no panel at all rather than an empty one. */
  emptyMessage?: ReactNode;
  /** A line under the list, outside its scroll area — "showing 50 of 2,700",
   *  a hint, a keyboard legend. */
  footer?: ReactNode;
  /** Ambient motion on the field's rim. The glass skin is always applied.
   *  Default true. */
  animated?: boolean;
  /** Merged onto the wrapper, which is what you size. */
  className?: string;
  /** Applied to the wrapper — set width here. */
  style?: React.CSSProperties;
}

/**
 * A text field that offers matching rows as you type.
 *
 * It holds no data of its own. Give it `options` and it renders them,
 * highlights one, moves that highlight with the arrow keys, and calls
 * `onSelect` when a row is chosen — however those options were produced.
 *
 * The list is a popover rather than a block in the flow: results that appear
 * mid-keystroke and push the page down under the cursor are disorienting, and
 * whatever is being searched usually sits directly below the field.
 */
export function Autocomplete({
  value,
  onValueChange,
  options,
  onSelect,
  icon,
  caseSensitive = false,
  preFiltered = false,
  loading = false,
  loadingMessage = "Loading…",
  emptyMessage,
  footer,
  animated = true,
  className,
  style,
  ...inputProps
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // What a row is matched on: its label when that is plain text, an explicit
  // `search` when the label is markup, and the value as a last resort.
  const haystack = (o: AutocompleteOption) =>
    typeof o.label === "string" ? o.label : (o.search ?? o.value);

  const shown = useMemo(() => {
    if (preFiltered) return options;
    const needle = caseSensitive ? value : value.toLowerCase();
    if (needle === "") return options;
    return options.filter((o) => {
      const text = caseSensitive ? haystack(o) : haystack(o).toLowerCase();
      return text.includes(needle);
    });
  }, [options, value, caseSensitive, preFiltered]);

  const selectable = useMemo(() => shown.filter((o) => !o.disabled), [shown]);

  // Nothing to say, no panel. This is what lets a consumer keep the popover
  // shut below its minimum query length without managing open state: send no
  // options, no loading and no message, and there is nothing to show.
  const hasContent = shown.length > 0 || loading || emptyMessage != null;
  const showPanel = open && hasContent;

  // A changed result set invalidates the highlight — it pointed at a row that
  // may no longer exist, let alone be the best match.
  useEffect(() => setActive(0), [shown]);

  // "nearest" scrolls only when the row is actually out of view, so walking a
  // visible list does not jump the container under the cursor.
  useEffect(() => {
    if (!showPanel) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, showPanel]);

  // pointerdown, not click: a drag that starts inside the panel and ends
  // outside it is not an outside click, and the dismissal should land before
  // whatever sits underneath can fire.
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!showPanel) return;
    const onDown = (e: PointerEvent) => {
      const node = wrapRef.current;
      if (node && e.target instanceof Node && !node.contains(e.target)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [showPanel, close]);

  const choose = (option: AutocompleteOption) => {
    if (option.disabled) return;
    onSelect(option.value, option);
    setOpen(false);
  };

  const move = (delta: number) => {
    if (selectable.length === 0) return;
    const current = shown[active];
    const from = current && !current.disabled ? selectable.indexOf(current) : -1;
    const next = (from + delta + selectable.length) % selectable.length;
    const target = selectable[next];
    if (target) setActive(shown.indexOf(target));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      // Stop here: an ancestor Dialog must not close because a suggestion
      // list did.
      if (showPanel) e.stopPropagation();
      setOpen(false);
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (!showPanel) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") {
      e.preventDefault();
      const first = selectable[0];
      if (first) setActive(shown.indexOf(first));
    } else if (e.key === "End") {
      e.preventDefault();
      const last = selectable[selectable.length - 1];
      if (last) setActive(shown.indexOf(last));
    } else if (e.key === "Enter") {
      const chosen = shown[active];
      if (chosen && !chosen.disabled) {
        e.preventDefault();
        choose(chosen);
      }
    }
  };

  const activeOption = showPanel ? shown[active] : undefined;

  return (
    <div ref={wrapRef} className={cx(styles.wrap, className)} style={style}>
      <TextField
        {...inputProps}
        type={inputProps.type ?? "text"}
        role="combobox"
        animated={animated}
        className={styles.field}
        autoComplete="off"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          activeOption && !activeOption.disabled ? `${listId}-${active}` : undefined
        }
        value={value}
        onFocus={(e) => {
          inputProps.onFocus?.(e);
          setOpen(true);
        }}
        // Focus alone is not enough. After a selection the panel shuts but
        // focus stays in the field, so onFocus never fires again and clicking
        // back into it did nothing — a combobox you cannot reopen by clicking
        // reads as broken.
        onClick={(e) => {
          inputProps.onClick?.(e);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          inputProps.onKeyDown?.(e);
          onKeyDown(e);
        }}
        onChange={(e) => {
          onValueChange(e.target.value);
          setOpen(true);
        }}
      >
        {icon != null && <TextField.Slot>{icon}</TextField.Slot>}
      </TextField>

      {/* Always mounted, hidden while shut. aria-controls above points at the
          listbox by id, and an id that resolves to nothing is a promise the
          markup does not keep — same reason Select keeps its listbox in the
          tree. */}
      <div
        className={cx(styles.panel, ctl.spacePanel)}
        hidden={!showPanel}
        data-animated={animated ? undefined : "false"}
      >
        {loading && <p className={styles.status}>{loadingMessage}</p>}

        {!loading && shown.length === 0 && emptyMessage != null && (
          <p className={styles.status}>{emptyMessage}</p>
        )}

        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className={styles.list}
          hidden={loading || shown.length === 0}
        >
          {shown.map((option, i) => (
            <li
              key={option.value}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={i === active}
              aria-disabled={option.disabled || undefined}
              className={cx(
                styles.option,
                i === active && !option.disabled && styles.active,
                "spAutocompleteOption",
              )}
              // One highlight for pointer and keyboard both: hovering moves the
              // active row, so there is never a mouse highlight and a keyboard
              // highlight disagreeing about what Enter would do.
              onMouseEnter={() => !option.disabled && setActive(i)}
              onPointerDown={(e) => {
                // Before blur, or the panel closes and the click lands on
                // whatever the layout collapses into its place.
                e.preventDefault();
                choose(option);
              }}
            >
              <span className={styles.label}>{option.label}</span>
              {option.meta != null && <span className={styles.meta}>{option.meta}</span>}
            </li>
          ))}
        </ul>

        {/* Outside the scroll area, so a count stays put while the list moves. */}
        {footer != null && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
