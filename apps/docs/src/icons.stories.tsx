import * as UI from "@inkorange/space-ui";
import { Text } from "@inkorange/space-ui";

// Every exported *Icon component, rendered in a labeled grid.
export const AllIcons = () => {
  const icons = Object.entries(UI).filter(([name, v]) => name.endsWith("Icon") && typeof v === "function");
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
