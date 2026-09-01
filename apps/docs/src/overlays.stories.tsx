import { useState } from "react";
import { Dialog, AlertDialog, DropdownMenu, Tabs, Tooltip, Button, Text } from "@inkorange/space-ui";

export default {
  title: "Components/Overlays",
};

export const DialogStory = () => (
  <Dialog>
    <Dialog.Trigger><Button>Open dialog</Button></Dialog.Trigger>
    <Dialog.Content size="4" maxWidth="480px">
      <Dialog.Title>Add to a star system</Dialog.Title>
      <Dialog.Description>Pick a system for this planet to call home.</Dialog.Description>
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Dialog.Close><Button size="sm">Done</Button></Dialog.Close>
      </div>
    </Dialog.Content>
  </Dialog>
);
DialogStory.storyName = "Dialog";
DialogStory.meta = {
  description:
    "A modal for focused, interruptible tasks. Dismissible by escape, overlay click, and an explicit close.",
};

export const AlertDialogStory = () => (
  <AlertDialog>
    <AlertDialog.Trigger><Button>Delete planet</Button></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Title>Delete this planet?</AlertDialog.Title>
      <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <AlertDialog.Cancel><Button size="sm">Cancel</Button></AlertDialog.Cancel>
        <AlertDialog.Action><Button size="sm">Delete</Button></AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog>
);
AlertDialogStory.storyName = "AlertDialog";
AlertDialogStory.meta = {
  // AlertDialog re-exports Dialog's parts, so Dialog is what there is to
  // document; Button is only the thing that opens it.
  components: ["Dialog"],
  description:
    "A modal for destructive or irreversible actions. Unlike Dialog, it requires an explicit choice — no escape-to-dismiss.",
};

export const DropdownStory = () => (
  <DropdownMenu label="Menu">
    <DropdownMenu.Item onSelect={() => {}}>Rename</DropdownMenu.Item>
    <DropdownMenu.Item onSelect={() => {}}>Share</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item color="danger" onSelect={() => {}}>Delete</DropdownMenu.Item>
  </DropdownMenu>
);
DropdownStory.storyName = "DropdownMenu";
DropdownStory.meta = {
  description:
    "A menu of actions anchored to a trigger. Separators group related items.",
};

// Tabs is fully controlled — it takes `value`/`onValueChange` and has no
// `defaultValue`. An earlier version of this story passed defaultValue, which
// the component ignores, so no tab was ever active.
export const TabsStory = () => {
  const [tab, setTab] = useState("elements");
  return (
    // Folder tabs are drawn to CONNECT to the surface below: the active tab
    // drops its bottom border and punches a gap in that surface's top line.
    // Floating in open space the effect is invisible, so give them a panel.
    <div className="docs-tabs-demo">
      <Tabs value={tab} onValueChange={setTab}>
        <Tabs.List>
          <Tabs.Trigger value="elements">Elements</Tabs.Trigger>
          <Tabs.Trigger value="environment">Environment</Tabs.Trigger>
          <Tabs.Trigger value="moons">Moons</Tabs.Trigger>
        </Tabs.List>

        <div className="docs-tabs-demo__panel">
          <Tabs.Content value="elements">
            <Text>Element mixing panel.</Text>
          </Tabs.Content>
          <Tabs.Content value="environment">
            <Text>Star and orbit controls.</Text>
          </Tabs.Content>
          <Tabs.Content value="moons">
            <Text>Moon designer.</Text>
          </Tabs.Content>
        </div>
      </Tabs>
    </div>
  );
};
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
