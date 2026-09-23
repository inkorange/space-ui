/** Behaviour tests — see select.interaction.test.tsx for what is out of scope. */
import { describe, it, expect, vi } from "vitest";
// The panel is a popover: closed, a browser stops rendering it, but happy-dom
// applies no CSS, so its rows stay queryable. What "shut" means here is the
// combobox's own aria-expanded, which is what a screen reader goes by too.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Autocomplete, type AutocompleteOption } from "./Autocomplete";

const PLANETS: AutocompleteOption[] = [
  { value: "trappist-1e", label: "TRAPPIST-1 e", meta: "Rocky" },
  { value: "trappist-1f", label: "TRAPPIST-1 f", meta: "Rocky" },
  { value: "kepler-442b", label: "Kepler-442 b", meta: "Super-earth" },
  { value: "proxima-b", label: "Proxima b", disabled: true },
];

const Field = ({
  onSelect = vi.fn(),
  ...rest
}: { onSelect?: (v: string, o: AutocompleteOption) => void } & Record<string, unknown>) => {
  const [value, setValue] = useState("");
  return (
    <Autocomplete
      value={value}
      onValueChange={setValue}
      options={PLANETS}
      onSelect={onSelect}
      aria-label="Find a planet"
      emptyMessage="No planets match"
      {...rest}
    />
  );
};

const field = () => screen.getByRole("combobox", { name: /find a planet/i });

describe("Autocomplete behaviour", () => {
  it("shows nothing until something is typed", async () => {
    const user = userEvent.setup();
    render(<Field />);
    expect(screen.queryByRole("option")).toBeNull();

    await user.click(field());
    // A click alone is not a query: an empty field would otherwise drop the
    // whole dataset open.
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("narrows the list to what matches the query", async () => {
    const user = userEvent.setup();
    render(<Field />);

    await user.type(field(), "trap");
    const shown = screen.getAllByRole("option").map((o) => o.textContent);
    expect(shown).toHaveLength(2);
    expect(shown[0]).toContain("TRAPPIST-1 e");
  });

  it("matches without regard to case by default", async () => {
    const user = userEvent.setup();
    render(<Field />);
    await user.type(field(), "TRAPPIST");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("caseSensitive means the capitals have to match", async () => {
    const user = userEvent.setup();
    render(<Field caseSensitive />);

    await user.type(field(), "trappist");
    expect(screen.queryByRole("option")).toBeNull();
    expect(screen.getByText("No planets match")).toBeInTheDocument();

    await user.clear(field());
    await user.type(field(), "TRAPPIST");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("says so when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Field />);
    await user.type(field(), "zzz");
    expect(screen.getByText("No planets match")).toBeInTheDocument();
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("reports the row that was clicked, and fills the field with it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Field onSelect={onSelect} />);

    await user.type(field(), "kep");
    await user.click(screen.getByRole("option", { name: /Kepler-442 b/ }));

    expect(onSelect).toHaveBeenCalledWith("kepler-442b", expect.objectContaining({ value: "kepler-442b" }));
    expect(field()).toHaveValue("Kepler-442 b");
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("chooses the highlighted row with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Field onSelect={onSelect} />);

    await user.type(field(), "trap");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("trappist-1f", expect.anything());
  });

  it("leaves Space to typing until the keyboard has moved the highlight", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Field onSelect={onSelect} />);

    // "TRAPPIST-1 e" has a space in it: a Space that always selected would
    // make the name impossible to type.
    await user.type(field(), "trappist-1 ");
    expect(onSelect).not.toHaveBeenCalled();
    expect(field()).toHaveValue("trappist-1 ");

    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalled();
  });

  it("skips a disabled row, and refuses it when clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Field onSelect={onSelect} />);

    await user.type(field(), "prox");
    const row = screen.getByRole("option", { name: /Proxima b/ });
    expect(row).toHaveAttribute("aria-disabled", "true");

    await user.click(row);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("closes on Escape, keeping what was typed", async () => {
    const user = userEvent.setup();
    render(<Field />);

    await user.type(field(), "trap");
    await user.keyboard("{Escape}");
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(field()).toHaveValue("trap");
  });

  it("reopens on a click once there is a query to show", async () => {
    const user = userEvent.setup();
    render(<Field />);

    await user.type(field(), "trap");
    await user.keyboard("{Escape}");
    expect(field()).toHaveAttribute("aria-expanded", "false");

    await user.click(field());
    expect(field()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("closes when something outside is pressed", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field />
        <button type="button">Elsewhere</button>
      </>,
    );

    await user.type(field(), "trap");
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(field()).toHaveAttribute("aria-expanded", "false");
  });

  it("says it is loading instead of guessing at rows", async () => {
    const user = userEvent.setup();
    render(<Field loading loadingMessage="Searching…" />);
    await user.type(field(), "tra");
    expect(screen.getByText("Searching…")).toBeInTheDocument();
    expect(screen.queryByRole("option")).toBeNull();
  });

  it("preFiltered leaves the list alone, for a server that already filtered", async () => {
    const user = userEvent.setup();
    render(<Field preFiltered />);
    await user.type(field(), "zzz");
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });
});
