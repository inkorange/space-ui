// The default token values ship WITH the components, so `styles.css` alone
// renders a working library. A consuming app overrides by loading its own
// :root block afterwards — same specificity, later source order — which is
// what makes a whole theme (light mode, a brand palette) a one-file swap
// rather than a fork. tokens.css is still exported separately for anyone who
// wants to read or extend the defaults.
import "./styles/tokens.css";

export { Text, type TextProps } from "./components/Text";
export { Heading, type HeadingProps } from "./components/Heading";
export { Link, type LinkProps } from "./components/Link";
export { Flex, type FlexProps } from "./components/Flex";
export { Box, type BoxProps } from "./components/Box";
export { Grid, type GridProps } from "./components/Grid";
export { Badge, type BadgeProps, type BadgeColor } from "./components/Badge";
export { Separator, type SeparatorProps } from "./components/Separator";
export { Card, type CardProps } from "./components/Card";
export { ScrollArea, type ScrollAreaProps } from "./components/ScrollArea";
export { Button, type ButtonProps } from "./components/Button";
export { Loader, type LoaderProps } from "./components/Loader";
export { IconToggle, type IconToggleOption } from "./components/IconToggle";
export { Tooltip } from "./components/Tooltip";
export * as Select from "./components/Select";
export * as TextField from "./components/TextField";
export { TextArea, type TextAreaProps } from "./components/TextArea";
export { Slider, type SliderProps } from "./components/Slider";
export * as RadioGroup from "./components/RadioGroup";
export { Progress, type ProgressProps } from "./components/Progress";
export * as Dialog from "./components/Dialog";
export * as AlertDialog from "./components/AlertDialog";
export * as DropdownMenu from "./components/DropdownMenu";
export * as Tabs from "./components/Tabs";
export * from "./components/icons";
