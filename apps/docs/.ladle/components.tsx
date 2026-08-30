import type { GlobalProvider } from "@ladle/react";
import "@inkorange/space-ui/tokens.css";
import "./space.css";

// Every story renders on the space-dark ground the components were designed
// against — a white gallery would misrepresent every glass surface.
export const Provider: GlobalProvider = ({ children }) => (
  <div className="space-stage">{children}</div>
);
