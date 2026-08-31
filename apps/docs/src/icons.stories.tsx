import * as UI from "@inkorange/space-ui";
import { Text } from "@inkorange/space-ui";
import { iconNames } from "./system-facts";

export default {
  title: "Components/Icons",
};

// Every exported *Icon component, rendered in a labeled grid.
export const AllIcons = () => {
  // Filtered against the generated icon list, not a name suffix: Pencil and
  // Share are icons without the `Icon` suffix and were missing from this
  // gallery entirely.
  const icons = iconNames
    .map((name) => [name, (UI as Record<string, unknown>)[name]] as const)
    .filter(([, v]) => typeof v === "function");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
      {icons.map(([name, Icon]) => (
        <div key={name} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* @ts-expect-error dynamic component */}
          <Icon width={18} height={18} />
          <Text size="1" color="gray">{name}</Text>
        </div>
      ))}
    </div>
  );
};

AllIcons.meta = {
  description:
    "Every icon the package exports, rendered from the live module. Icons inherit currentColor and take width and height as props.",
};
