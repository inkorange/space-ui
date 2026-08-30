import { Dialog, AlertDialog, DropdownMenu, Tabs, Tooltip, SpaceButton, Text } from "@inkorange/space-ui";

export const DialogStory = () => (
  <Dialog.Root>
    <Dialog.Trigger><SpaceButton>Open dialog</SpaceButton></Dialog.Trigger>
    <Dialog.Content size="4" maxWidth="480px">
      <Dialog.Title>Add to a star system</Dialog.Title>
      <Dialog.Description>Pick a system for this planet to call home.</Dialog.Description>
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Dialog.Close><SpaceButton size="sm">Done</SpaceButton></Dialog.Close>
      </div>
    </Dialog.Content>
  </Dialog.Root>
);
DialogStory.storyName = "Dialog";

export const AlertDialogStory = () => (
  <AlertDialog.Root>
    <AlertDialog.Trigger><SpaceButton>Delete planet</SpaceButton></AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Title>Delete this planet?</AlertDialog.Title>
      <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
      <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <AlertDialog.Cancel><SpaceButton size="sm">Cancel</SpaceButton></AlertDialog.Cancel>
        <AlertDialog.Action><SpaceButton size="sm">Delete</SpaceButton></AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Root>
);
AlertDialogStory.storyName = "AlertDialog";

export const DropdownStory = () => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger><SpaceButton>Menu</SpaceButton></DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Item onSelect={() => {}}>Rename</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => {}}>Share</DropdownMenu.Item>
      <DropdownMenu.Separator />
      <DropdownMenu.Item onSelect={() => {}}>Delete</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
);
DropdownStory.storyName = "DropdownMenu";

export const TabsStory = () => (
  <Tabs.Root defaultValue="elements">
    <Tabs.List>
      <Tabs.Trigger value="elements">Elements</Tabs.Trigger>
      <Tabs.Trigger value="environment">Environment</Tabs.Trigger>
      <Tabs.Trigger value="moons">Moons</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="elements"><Text>Element mixing panel.</Text></Tabs.Content>
    <Tabs.Content value="environment"><Text>Star and orbit controls.</Text></Tabs.Content>
    <Tabs.Content value="moons"><Text>Moon designer.</Text></Tabs.Content>
  </Tabs.Root>
);
TabsStory.storyName = "Tabs";

export const TooltipStory = () => (
  <Tooltip label="Full screen" side="top">
    <SpaceButton size="sm">Hover me</SpaceButton>
  </Tooltip>
);
TooltipStory.storyName = "Tooltip";
