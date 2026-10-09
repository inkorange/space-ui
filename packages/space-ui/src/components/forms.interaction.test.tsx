/** Behaviour tests — see select.interaction.test.tsx for what is out of scope. */
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Checkbox, CheckboxGroup } from "./Checkbox";
import { RadioGroup } from "./RadioGroup";
import { IconToggle } from "./IconToggle";
import { Tabs } from "./Tabs";
import { Pagination, type PaginationState } from "./Pagination";
import { Carousel } from "./Carousel";
import { Slider } from "./Slider";

describe("Checkbox behaviour", () => {
  it("reports each change, and can be driven from outside", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const Lone = () => {
      const [on, setOn] = useState(false);
      return (
        <Checkbox
          checked={on}
          onCheckedChange={(next) => {
            setOn(next);
            onCheckedChange(next);
          }}
        >
          Include moons
        </Checkbox>
      );
    };
    render(<Lone />);
    const box = screen.getByRole("checkbox", { name: "Include moons" });
    expect(box).not.toBeChecked();

    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box).toBeChecked();

    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(box).not.toBeChecked();
  });

  it("the label is part of the target, not merely beside it", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange}>Include moons</Checkbox>);
    await user.click(screen.getByText("Include moons"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("announces a partly chosen box as mixed", () => {
    render(<Checkbox checked indeterminate onCheckedChange={() => {}}>All types</Checkbox>);
    expect(screen.getByRole("checkbox", { name: "All types" })).toBePartiallyChecked();
  });

  it("ignores a press when disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Checkbox checked={false} disabled onCheckedChange={onCheckedChange}>Nope</Checkbox>);
    await user.click(screen.getByText("Nope"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});

describe("CheckboxGroup behaviour", () => {
  const Group = ({ onValueChange = vi.fn() }: { onValueChange?: (v: string[]) => void }) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
        aria-label="World types"
      >
        <CheckboxGroup.Item value="lava">Lava</CheckboxGroup.Item>
        <CheckboxGroup.Item value="ocean">Ocean</CheckboxGroup.Item>
        <CheckboxGroup.Item value="ice">Ice</CheckboxGroup.Item>
      </CheckboxGroup>
    );
  };

  it("adds in the order things are chosen and removes without disturbing the rest", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Group onValueChange={onValueChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Ocean" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["ocean"]);

    await user.click(screen.getByRole("checkbox", { name: "Lava" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["ocean", "lava"]);

    await user.click(screen.getByRole("checkbox", { name: "Ocean" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["lava"]);
  });

  it("disables every item from the group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <CheckboxGroup value={[]} onValueChange={onValueChange} disabled aria-label="Types">
        <CheckboxGroup.Item value="a">A</CheckboxGroup.Item>
      </CheckboxGroup>,
    );
    await user.click(screen.getByText("A"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("RadioGroup behaviour", () => {
  it("moves the choice, one at a time", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const Group = () => {
      const [value, setValue] = useState("public");
      return (
        <RadioGroup
          value={value}
          onValueChange={(v) => {
            setValue(v);
            onValueChange(v);
          }}
        >
          <RadioGroup.Item value="public">Public</RadioGroup.Item>
          <RadioGroup.Item value="private">Private</RadioGroup.Item>
        </RadioGroup>
      );
    };
    render(<Group />);

    await user.click(screen.getByRole("radio", { name: "Private" }));
    expect(onValueChange).toHaveBeenCalledWith("private");
    expect(screen.getByRole("radio", { name: "Private" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Public" })).not.toBeChecked();
  });

  it("ignores a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup value="a" onValueChange={onValueChange}>
        <RadioGroup.Item value="a">A</RadioGroup.Item>
        <RadioGroup.Item value="b" disabled>B</RadioGroup.Item>
      </RadioGroup>,
    );
    await user.click(screen.getByText("B"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("IconToggle behaviour", () => {
  it("reports the option pressed, and marks only it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const Toggle = () => {
      const [value, setValue] = useState<"orbit" | "surface">("orbit");
      return (
        <IconToggle
          value={value}
          onValueChange={(v) => {
            setValue(v);
            onValueChange(v);
          }}
          options={[
            { value: "orbit", icon: <span>◯</span>, label: "Orbit" },
            { value: "surface", icon: <span>▲</span>, label: "Surface" },
          ]}
        />
      );
    };
    render(<Toggle />);

    await user.click(screen.getByRole("button", { name: "Surface" }));
    expect(onValueChange).toHaveBeenCalledWith("surface");
    expect(screen.getByRole("button", { name: "Surface" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Orbit" })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("Tabs behaviour", () => {
  const Panels = ({ onValueChange = vi.fn() }: { onValueChange?: (v: string) => void }) => {
    const [tab, setTab] = useState("mass");
    return (
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          onValueChange(v);
        }}
      >
        <Tabs.List>
          <Tabs.Trigger value="mass">Mass</Tabs.Trigger>
          <Tabs.Trigger value="orbit">Orbit</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="mass">1.34 Earth masses</Tabs.Content>
        <Tabs.Content value="orbit">112 days</Tabs.Content>
      </Tabs>
    );
  };

  it("shows one panel at a time and reports the switch", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Panels onValueChange={onValueChange} />);

    expect(screen.getByText("1.34 Earth masses")).toBeInTheDocument();
    expect(screen.queryByText("112 days")).toBeNull();

    await user.click(screen.getByRole("tab", { name: "Orbit" }));
    expect(onValueChange).toHaveBeenCalledWith("orbit");
    expect(screen.getByText("112 days")).toBeInTheDocument();
    expect(screen.queryByText("1.34 Earth masses")).toBeNull();
  });

  it("walks the tabs with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Panels onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "Mass" }));
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith("orbit");
    expect(screen.getByRole("tab", { name: "Orbit" })).toHaveFocus();

    // Past the last tab, round to the first: a tab strip is a loop.
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenLastCalledWith("mass");

    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenLastCalledWith("orbit");
  });

  it("jumps to the ends with Home and End", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Panels onValueChange={onValueChange} />);

    await user.click(screen.getByRole("tab", { name: "Mass" }));
    await user.keyboard("{End}");
    expect(onValueChange).toHaveBeenLastCalledWith("orbit");

    await user.keyboard("{Home}");
    expect(onValueChange).toHaveBeenLastCalledWith("mass");
  });

  it("keeps only the open tab in the tab order", async () => {
    const user = userEvent.setup();
    render(<Panels />);
    expect(screen.getByRole("tab", { name: "Mass" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Orbit" })).toHaveAttribute("tabindex", "-1");

    await user.click(screen.getByRole("tab", { name: "Orbit" }));
    expect(screen.getByRole("tab", { name: "Orbit" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Mass" })).toHaveAttribute("tabindex", "-1");
  });

  it("ties each panel to the tab that opens it", async () => {
    render(<Panels />);
    const tab = screen.getByRole("tab", { name: "Mass" });
    const panel = screen.getByRole("tabpanel");
    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });

  it("marks the open tab as selected, and only it", async () => {
    const user = userEvent.setup();
    render(<Panels />);
    await user.click(screen.getByRole("tab", { name: "Orbit" }));

    expect(screen.getByRole("tab", { name: "Orbit" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Mass" })).toHaveAttribute("aria-selected", "false");
  });
});

describe("Pagination behaviour", () => {
  const state: PaginationState = { page: 5, pageSize: 10, totalItems: 180 };

  it("reports the page that was pressed", async () => {
    const user = userEvent.setup();
    const onPageClick = vi.fn();
    render(<Pagination pagination={state} onPageClick={onPageClick} />);

    await user.click(screen.getByRole("button", { name: "Page 6" }));
    expect(onPageClick).toHaveBeenCalledWith(6);
  });

  it("steps with Previous and Next", async () => {
    const user = userEvent.setup();
    const onPageClick = vi.fn();
    render(<Pagination pagination={state} onPageClick={onPageClick} />);

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageClick).toHaveBeenLastCalledWith(4);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageClick).toHaveBeenLastCalledWith(6);
  });

  it("says nothing when the page shown is pressed again", async () => {
    const user = userEvent.setup();
    const onPageClick = vi.fn();
    render(<Pagination pagination={state} onPageClick={onPageClick} />);
    await user.click(screen.getByRole("button", { name: "Page 5" }));
    expect(onPageClick).not.toHaveBeenCalled();
  });

  it("cannot step past either end", async () => {
    const user = userEvent.setup();
    const onPageClick = vi.fn();
    const { rerender } = render(
      <Pagination pagination={{ ...state, page: 1 }} onPageClick={onPageClick} />,
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    rerender(<Pagination pagination={{ ...state, page: 18 }} onPageClick={onPageClick} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(onPageClick).not.toHaveBeenCalled();
  });

  it("renders nothing at all for a single page", () => {
    const { container } = render(
      <Pagination pagination={{ page: 1, pageSize: 50, totalItems: 12 }} onPageClick={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Carousel behaviour", () => {
  // Measurement needs layout, which happy-dom does not have: every rectangle
  // is zero, so the row reads as unscrollable here. What that leaves testable
  // is the contract that does not depend on size.
  const slides = Array.from({ length: 6 }, (_, i) => <div key={i}>Slide {i + 1}</div>);

  it("labels itself and its slides for assistive tech", () => {
    render(<Carousel aria-label="Featured planets">{slides}</Carousel>);
    // A labelled <section> is a region; the slides inside it are groups.
    const region = screen.getByRole("region", { name: "Featured planets" });
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByRole("group", { name: "1 of 6" })).toBeInTheDocument();
  });

  it("puts the arrows on the row they scroll", () => {
    render(<Carousel aria-label="Featured planets">{slides}</Carousel>);
    const track = document.querySelector("[tabindex='0']")!;
    for (const name of ["Previous", "Next"]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-controls", track.id);
    }
  });

  it("leaves the row focusable, so arrow keys scroll it", () => {
    render(<Carousel aria-label="Featured planets">{slides}</Carousel>);
    expect(document.querySelector("[tabindex='0']")).not.toBeNull();
  });
});

describe("Slider behaviour", () => {
  const Range = ({
    onValueChange = vi.fn(),
    start = 20,
    end = 80,
    ...rest
  }: { onValueChange?: (v: number[]) => void; start?: number; end?: number } & Record<string, unknown>) => {
    const [value, setValue] = useState([start, end]);
    return (
      <Slider
        value={value}
        onValueChange={(next) => {
          setValue(next);
          onValueChange(next);
        }}
        min={0}
        max={100}
        step={1}
        aria-label="Mass"
        {...rest}
      />
    );
  };

  const thumbs = () => screen.getAllByRole("slider");

  it("is one slider with one value, and two with two", () => {
    const { rerender } = render(
      <Slider value={[50]} onValueChange={() => {}} min={0} max={100} step={1} aria-label="Mass" />,
    );
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(screen.getByRole("slider")).toHaveAccessibleName("Mass");

    rerender(
      <Slider value={[20, 80]} onValueChange={() => {}} min={0} max={100} step={1} aria-label="Mass" />,
    );
    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("names each thumb, so they are not two sliders called the same thing", () => {
    render(<Range />);
    expect(screen.getByRole("slider", { name: "Mass minimum" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Mass maximum" })).toBeInTheDocument();
  });

  it("takes names of its own when the generated ones do not fit", () => {
    render(<Range thumbLabels={["From", "To"]} />);
    expect(screen.getByRole("slider", { name: "From" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "To" })).toBeInTheDocument();
  });

  it("reports the whole array when one thumb moves", async () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);

    fireEvent.change(thumbs()[0], { target: { value: "35" } });
    expect(onValueChange).toHaveBeenLastCalledWith([35, 80]);

    fireEvent.change(thumbs()[1], { target: { value: "60" } });
    expect(onValueChange).toHaveBeenLastCalledWith([35, 60]);
  });

  it("stops the lower thumb at the upper one", () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);

    // Dragged well past its neighbour, it travels only as far as the neighbour.
    fireEvent.change(thumbs()[0], { target: { value: "95" } });
    expect(onValueChange).toHaveBeenLastCalledWith([80, 80]);
  });

  it("stops the upper thumb at the lower one", () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);

    fireEvent.change(thumbs()[1], { target: { value: "5" } });
    expect(onValueChange).toHaveBeenLastCalledWith([20, 20]);
  });

  it("says nothing once a thumb is already against its neighbour", () => {
    // The pair is left touching; pushing further is not a new value, so the
    // caller hears nothing rather than the same array again every frame.
    const onValueChange = vi.fn();
    render(<Range start={40} end={40} onValueChange={onValueChange} />);

    fireEvent.change(thumbs()[0], { target: { value: "90" } });
    fireEvent.change(thumbs()[1], { target: { value: "10" } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps the gap minDistance asks for, from either side", () => {
    const onValueChange = vi.fn();
    const { unmount } = render(<Range minDistance={10} onValueChange={onValueChange} />);
    fireEvent.change(thumbs()[0], { target: { value: "95" } });
    expect(onValueChange).toHaveBeenLastCalledWith([70, 80]);
    unmount();

    onValueChange.mockClear();
    render(<Range minDistance={10} onValueChange={onValueChange} />);
    fireEvent.change(thumbs()[1], { target: { value: "0" } });
    expect(onValueChange).toHaveBeenLastCalledWith([20, 30]);
  });

  it("holds both thumbs inside the bounds", () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);

    fireEvent.change(thumbs()[0], { target: { value: "-40" } });
    expect(onValueChange).toHaveBeenLastCalledWith([0, 80]);

    onValueChange.mockClear();
    fireEvent.change(thumbs()[1], { target: { value: "160" } });
    expect(onValueChange).toHaveBeenLastCalledWith([0, 100]);
  });

  it("says nothing when a move changes nothing", () => {
    const onValueChange = vi.fn();
    render(<Range onValueChange={onValueChange} />);
    fireEvent.change(thumbs()[0], { target: { value: "20" } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("steps by one unless told otherwise", () => {
    // step is optional: a slider that does not care about granularity should
    // not have to say so, and 1 is what a bare range input does.
    render(
      <Slider value={[40]} onValueChange={() => {}} min={0} max={100} aria-label="Mass" />,
    );
    expect(screen.getByRole("slider")).toHaveAttribute("step", "1");
  });

  it("puts the step on every thumb, however many there are", () => {
    render(<Range step={10} />);
    for (const thumb of thumbs()) expect(thumb).toHaveAttribute("step", "10");
  });

  it("keeps a clamped thumb on the step grid", () => {
    // step 10 with a gap of 25 would otherwise park the lower thumb on 75 —
    // a value the slider cannot produce any other way. It settles on 70, the
    // next step that still leaves the gap.
    const onValueChange = vi.fn();
    render(<Range start={20} end={100} step={10} minDistance={25} onValueChange={onValueChange} />);

    fireEvent.change(thumbs()[0], { target: { value: "100" } });
    expect(onValueChange).toHaveBeenLastCalledWith([70, 100]);
  });

  it("keeps the upper thumb on the grid too", () => {
    const onValueChange = vi.fn();
    render(<Range start={0} end={80} step={10} minDistance={25} onValueChange={onValueChange} />);

    fireEvent.change(thumbs()[1], { target: { value: "0" } });
    expect(onValueChange).toHaveBeenLastCalledWith([0, 30]);
  });

  it("counts the grid from min, not from zero", () => {
    const onValueChange = vi.fn();
    render(
      <Slider value={[25]} onValueChange={onValueChange} min={5} max={105} step={10} aria-label="Mass" />,
    );
    // The grid here is 5, 15, 25 … so the input's own step anchor matters.
    expect(screen.getByRole("slider")).toHaveAttribute("min", "5");
    expect(screen.getByRole("slider")).toHaveAttribute("step", "10");
  });

  it("takes both thumbs out of the tab order when disabled", () => {
    render(<Range disabled />);
    for (const thumb of thumbs()) expect(thumb).toBeDisabled();
  });
});
