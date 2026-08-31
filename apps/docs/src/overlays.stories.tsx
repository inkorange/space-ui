import { useState } from "react";
import { Dialog, AlertDialog, DropdownMenu, Tabs, Tooltip, Button, Text } from "@inkorange/space-ui";

export default {
  title: "Components/Overlays",
};

export const DialogStory = () => (
  <Dialog.Root>
    <Dialog.Trigger><Button>Open dialog</Button></Dialog.Trigger>
    <Dialog.Content size="4" maxWidth="480px">
      <Dialog.Title>Add to a star system</Dialog.Title>
      <Dialog.Description>Pick a system for this planet to call home.</Dialog.Description>
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Dialog.Close><Button size="sm">Done</Button></Dialog.Close>
      </div>
    </Dialog.Content>
  </Dialog.Root>
);
DialogStory.storyName = "Dialog";
DialogStory.meta = {
  description:
    "A modal for focused, interruptible tasks. Dismissible by escape, overlay click, and an explicit close.",
};

export const AlertDialogStory = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger><Button>Delete planet</Button></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Title>Delete this planet?</AlertDialog.Title>
      <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <AlertDialog.Cancel><Button size="sm">Cancel</Button></AlertDialog.Cancel>
        <AlertDialog.Action><Button size="sm">Delete</Button></AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Root>
);
AlertDialogStory.storyName = "AlertDialog";
AlertDialogStory.meta = {
  description:
    "A modal for destructive or irreversible actions. Unlike Dialog, it requires an explicit choice — no escape-to-dismiss.",
};

export const DropdownStory = () => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger><Button>Menu</Button></DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Item onSelect={() => {}}>Rename</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => {}}>Share</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onSelect={() => {}}>Delete</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);
DropdownStory.storyName = "DropdownMenu";
DropdownStory.meta = {
  description:
    "A menu of actions anchored to a trigger. Separators group related items.",
};

const TAB_PANELS = [
  { value: "elements", label: "Elements", body: "Element mixing panel." },
  { value: "environment", label: "Environment", body: "Star and orbit controls." },
  { value: "moons", label: "Moons", body: "Moon designer." },
];

// Tabs.Root is fully controlled — it takes `value`/`onValueChange` and has no
// `defaultValue`. An earlier version of this story passed defaultValue, which
// the component ignores, so no tab was ever active.
const TabsDemo = () => {
  const [tab, setTab] = useState("elements");
  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List>
        {TAB_PANELS.map((t) => (
          <Tabs.Trigger key={t.value} value={t.value}>
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TAB_PANELS.map((t) => (
        <Tabs.Content key={t.value} value={t.value}>
          <Text>{t.body}</Text>
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};

export const TabsStory = () => <TabsDemo />;
TabsStory.storyName = "Tabs";
TabsStory.meta = {
  description:
    "Panel switching within a single view, for content that is peer-level rather than hierarchical. Fully controlled: it takes value and onValueChange, with no defaultValue.",
};

export const TooltipStory = () => (
  <Tooltip label="Full screen" side="top">
    <Button size="sm">Hover me</Button>
  </Tooltip>
);
TooltipStory.storyName = "Tooltip";
TooltipStory.meta = {
  description:
    "A short label revealed on hover or focus. For naming a control, never for content the user must read.",
};
