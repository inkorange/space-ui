/**
 * Behaviour tests: these mount components and drive them, where
 * primitives.test.tsx only asserts the markup a render produces.
 *
 * happy-dom has no layout — every rectangle is zero — so anything that
 * measures (panel placement, flipping, the Carousel's stops) is deliberately
 * absent here. That code is verified in a real browser; see the README.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Select } from "./Select";

const Stars = ({ onChange }: { onChange?: (v: string) => void }) => {
  const [value, setValue] = useState("");
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
      placeholder="Pick a star"
      aria-label="Star type"
    >
      <Select.Item value="G">G — Yellow</Select.Item>
      <Select.Item value="K">K — Orange</Select.Item>
      <Select.Item value="M">M — Red dwarf</Select.Item>
    </Select>
  );
};

const trigger = () => screen.getByRole("button", { name: /star type/i });
const listbox = () => screen.getByRole("listbox");

describe("Select behaviour", () => {
  it("opens on the trigger and closes on it again", async () => {
    const user = userEvent.setup();
    render(<Stars />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("reports the chosen value and shows it on the trigger", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stars onChange={onChange} />);

    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "K — Orange" }));

    expect(onChange).toHaveBeenCalledWith("K");
    expect(trigger()).toHaveTextContent("K — Orange");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks only the chosen option as selected", async () => {
    const user = userEvent.setup();
    render(<Stars />);
    await user.click(trigger());
    await user.click(screen.getByRole("option", { name: "M — Red dwarf" }));
    await user.click(trigger());

    const chosen = screen.getAllByRole("option").filter((o) => o.getAttribute("aria-selected") === "true");
    expect(chosen).toHaveLength(1);
    expect(chosen[0]).toHaveTextContent("M — Red dwarf");
  });

  it("walks the list with the arrow keys and chooses with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stars onChange={onChange} />);

    await user.click(trigger());
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    // Opening highlights the first option, so two downs land on the third.
    expect(onChange).toHaveBeenCalledWith("M");
  });

  it("stops at the ends rather than wrapping around", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stars onChange={onChange} />);

    await user.click(trigger());
    await user.keyboard("{ArrowUp}{ArrowUp}{Enter}");
    expect(onChange).toHaveBeenCalledWith("G");

    await user.click(trigger());
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("M");
  });

  it("jumps to the ends with Home and End", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Stars onChange={onChange} />);

    await user.click(trigger());
    await user.keyboard("{End}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("M");

    await user.click(trigger());
    await user.keyboard("{Home}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("G");
  });

  it("closes on Escape and hands focus back to the trigger", async () => {
    const user = userEvent.setup();
    render(<Stars />);

    await user.click(trigger());
    await user.keyboard("{Escape}");

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
  });

  it("closes on Tab, so the key still moves on", async () => {
    const user = userEvent.setup();
    render(<Stars />);
    await user.click(trigger());
    await user.tab();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when something outside is pressed", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Stars />
        <button type="button">Elsewhere</button>
      </>,
    );

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("points aria-activedescendant at the highlighted option", async () => {
    const user = userEvent.setup();
    render(<Stars />);
    await user.click(trigger());

    const first = within(listbox()).getAllByRole("option")[0];
    expect(listbox()).toHaveAttribute("aria-activedescendant", first.id);

    await user.keyboard("{ArrowDown}");
    const second = within(listbox()).getAllByRole("option")[1];
    expect(listbox()).toHaveAttribute("aria-activedescendant", second.id);
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Select value="" onValueChange={() => {}} disabled aria-label="Star type" placeholder="p">
        <Select.Item value="G">G</Select.Item>
      </Select>,
    );
    await user.click(trigger()).catch(() => {});
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("skips a disabled option when walking the list", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select value="" onValueChange={onChange} aria-label="Star type" placeholder="p">
        <Select.Item value="G">G</Select.Item>
        <Select.Item value="K" disabled>K</Select.Item>
        <Select.Item value="M">M</Select.Item>
      </Select>,
    );

    await user.click(trigger());
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("M");
  });
});
