import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { installPopoverShim } from "./popoverShim";

installPopoverShim();

// Each test gets a clean document: these render into it rather than into a
// detached container, so leftovers would bleed into the next test's queries.
afterEach(cleanup);
