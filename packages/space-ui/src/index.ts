/**
 * SpaceUI — a React 19 component library and design system for dark
 * interfaces. Zero runtime dependencies, precompiled CSS, and a role-based
 * design-token system.
 *
 * ```tsx
 * import "@inkorange/space-ui/styles.css";
 * import { Card, Heading, Text, Button } from "@inkorange/space-ui";
 * ```
 *
 * What is not visible in the type signatures below:
 *
 * - One stylesheet import, at the application root. There is no
 *   per-component CSS, no provider, no context and no theme wrapper.
 * - Style with tokens, not lengths: `var(--spacing-md)` over `16px`. Spacing
 *   is an 8pt grid, every step a multiple of `--sp-grid-base-size`. Control
 *   heights come from `--sp-control-height` (40px, `-sm` 36, `-lg` 48), so
 *   controls placed side by side line up without arithmetic. Colour is a
 *   named role — `primary`, `success`, `warning`, `danger`, `accent` — with
 *   `-solid`, `-text`, `-soft`, `-border`, `-glow` and `-deep` saying which
 *   job within it.
 * - Override a component token on a class, never in an inline `style`: inline
 *   beats every media and container query written afterwards.
 * - Boolean props default to false, so `<Button fullWidth />` is the idiom.
 *   `animated` is the one exception, defaulting to true.
 * - Selection is controlled through `onValueChange`. Native text inputs keep
 *   React's own `value` and `onChange`.
 * - Keyboard behaviour and ARIA live inside the components. Pass `aria-label`
 *   where there is no visible label; do not re-declare the rest.
 * - The components are drawn as lit glass over a dark ground. The tokens can
 *   be re-pointed, but there is no supported light theme, and a light palette
 *   misrepresents every surface here.
 *
 * The full generated reference, including every token each component accepts,
 * is at https://space-components.vercel.app/llms.txt
 *
 * @packageDocumentation
 */
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
export { Carousel, type CarouselProps } from "./components/Carousel";
export {
  Pagination,
  pageCount,
  pageWindow,
  type PaginationProps,
  type PaginationState,
} from "./components/Pagination";
export { Button, type ButtonProps } from "./components/Button";
export { Loader, type LoaderProps } from "./components/Loader";
export { IconToggle, type IconToggleOption } from "./components/IconToggle";
export { Tooltip } from "./components/Tooltip";
export { Select, type SelectProps, type SelectItemProps } from "./components/Select";
export { TextField, type TextFieldProps } from "./components/TextField";
export { TextArea, type TextAreaProps } from "./components/TextArea";
export {
  Autocomplete,
  type AutocompleteProps,
  type AutocompleteOption,
} from "./components/Autocomplete";
export { Slider, type SliderProps } from "./components/Slider";
export { Chart, type ChartProps, type ChartSeries, type ChartPoint } from "./components/Chart";
export { BarList, type BarListProps, type BarListItem } from "./components/BarList";
export { PieChart, type PieChartProps, type PieSlice } from "./components/PieChart";
export {
  Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps, type CheckboxGroupItemProps,
} from "./components/Checkbox";
export { RadioGroup, type RadioGroupProps, type RadioGroupItemProps } from "./components/RadioGroup";
export { Progress, type ProgressProps } from "./components/Progress";
export { Message, type MessageProps, type MessageVariant } from "./components/Message";
export { Dialog, type DialogProps } from "./components/Dialog";
export { AlertDialog, type AlertDialogProps } from "./components/AlertDialog";
export { DropdownMenu, type DropdownMenuProps, type DropdownMenuItemProps } from "./components/DropdownMenu";
export { Tabs, type TabsProps } from "./components/Tabs";
export { Popover, type PopoverProps } from "./components/Popover";
export * from "./components/icons";
