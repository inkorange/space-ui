/** Behaviour tests — see select.interaction.test.tsx for what is out of scope. */
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { AlertDialog } from "./AlertDialog";
import { DropdownMenu } from "./DropdownMenu";
import { Popover } from "./Popover";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";

/** A native <dialog> keeps its content in the DOM when shut — the browser
 *  hides it with CSS, which happy-dom does not apply. Its own `open` is what
 *  actually says whether it is showing. */
const dialogOpen = () => document.querySelector("dialog")?.open === true;

describe("Dialog behaviour", () => {
  const Basic = ({ onOpenChange }: { onOpenChange?: (o: boolean) => void }) => (
    <Dialog onOpenChange={onOpenChange}>
      <Dialog.Trigger><Button>Open</Button></Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Add to a system</Dialog.Title>
        <Dialog.Description>Pick a home for this world.</Dialog.Description>
        <Dialog.Close><Button>Done</Button></Dialog.Close>
      </Dialog.Content>
    </Dialog>
  );

  it("opens from its trigger and closes from its close button", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Basic onOpenChange={onOpenChange} />);
    expect(dialogOpen()).toBe(false);

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(dialogOpen()).toBe(true);
    expect(screen.getByText("Add to a system")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(dialogOpen()).toBe(false));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("closes when the platform asks it to — what Escape does", async () => {
    // A browser answers Escape on a modal <dialog> by firing `cancel`, which
    // is what this component listens for. happy-dom does not fire it, so the
    // event is raised here directly: this tests our handling of it, and the
    // key-to-event step is the platform's own.
    const user = userEvent.setup();
    render(<Basic />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(dialogOpen()).toBe(true);

    const el = document.querySelector("dialog")!;
    el.dispatchEvent(new Event("cancel", { cancelable: true, bubbles: false }));
    await waitFor(() => expect(dialogOpen()).toBe(false));
  });

  it("can be driven from outside, ignoring its own trigger", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open from outside</button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content>
              <Dialog.Title>Controlled</Dialog.Title>
            </Dialog.Content>
          </Dialog>
        </>
      );
    };
    render(<Controlled />);
    expect(dialogOpen()).toBe(false);
    await user.click(screen.getByRole("button", { name: "Open from outside" }));
    expect(dialogOpen()).toBe(true);
    expect(screen.getByText("Controlled")).toBeInTheDocument();
  });

  it("names itself by its title, so it announces as what it says it is", async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAccessibleName("Add to a system");
    expect(dialog).toHaveAccessibleDescription("Pick a home for this world.");
  });
});

describe("AlertDialog behaviour", () => {
  const Destructive = ({ onConfirm = vi.fn() }: { onConfirm?: () => void }) => (
    <AlertDialog>
      <AlertDialog.Trigger><Button>Delete</Button></AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Title>Delete this planet?</AlertDialog.Title>
        <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
        <AlertDialog.Cancel><Button>Cancel</Button></AlertDialog.Cancel>
        <AlertDialog.Action><Button onClick={onConfirm}>Delete</Button></AlertDialog.Action>
      </AlertDialog.Content>
    </AlertDialog>
  );

  it("requires a choice: the platform's cancel is refused", async () => {
    const user = userEvent.setup();
    render(<Destructive />);
    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(dialogOpen()).toBe(true);

    // Same event Escape raises; an alert dialog must not take it.
    const el = document.querySelector("dialog")!;
    el.dispatchEvent(new Event("cancel", { cancelable: true, bubbles: false }));
    expect(dialogOpen()).toBe(true);
  });

  it("closes on Cancel, and runs the action when confirmed", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Destructive onConfirm={onConfirm} />);

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(dialogOpen()).toBe(false));

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Delete" })[1]);
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe("DropdownMenu behaviour", () => {
  const Menu = ({ onRename = vi.fn() }: { onRename?: () => void }) => (
    <DropdownMenu label="Actions">
      <DropdownMenu.Item onSelect={onRename}>Rename</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item color="danger" onSelect={() => {}}>Delete</DropdownMenu.Item>
    </DropdownMenu>
  );

  const trigger = () => screen.getByRole("button", { name: "Actions" });

  it("opens on its trigger and reports which item was chosen", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(<Menu onRename={onRename} />);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("menuitem", { name: "Rename" }));
    expect(onRename).toHaveBeenCalled();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    await user.keyboard("{Escape}");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("reopens after Escape, rather than swallowing the next press", async () => {
    // The shipped bug this guards: closing, then pressing the trigger again
    // within the old 300ms guard window, did nothing.
    const user = userEvent.setup();
    render(<Menu />);

    await user.click(trigger());
    await user.keyboard("{Escape}");
    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Popover behaviour", () => {
  const Pop = ({ onOpenChange }: { onOpenChange?: (o: boolean) => void }) => (
    <Popover label="Filter" onOpenChange={onOpenChange}>
      <p>Minimum mass</p>
    </Popover>
  );
  const trigger = () => screen.getByRole("button", { name: "Filter" });

  it("toggles from its trigger", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Pop onOpenChange={onOpenChange} />);

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await user.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("reports a close once, not twice, when the platform closes it too", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Pop onOpenChange={onOpenChange} />);

    await user.click(trigger());
    onOpenChange.mockClear();
    await user.click(trigger());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("can be opened on arrival without stealing focus", () => {
    render(
      <Popover label="Filter" defaultOpen>
        <p>Minimum mass</p>
      </Popover>,
    );
    expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute("aria-expanded", "true");
    expect(document.body).toHaveFocus();
  });

  it("is labelled by its trigger, so it announces as what opened it", async () => {
    const user = userEvent.setup();
    render(<Pop />);
    await user.click(trigger());
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Filter");
  });
});

describe("Tooltip behaviour", () => {
  it("describes its child, and appears on focus", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Share this world">
        <Button iconOnly aria-label="Share">↗</Button>
      </Tooltip>,
    );

    await user.tab();
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Share this world"));
    expect(screen.getByRole("button", { name: "Share" })).toHaveAccessibleDescription("Share this world");
  });

  it("renders nothing at all without a label", () => {
    render(
      <Tooltip label="">
        <Button aria-label="Share">↗</Button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
