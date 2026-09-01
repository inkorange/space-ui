// Every path the exports map promises must exist in dist after a build.
//
// 1.0.1 shipped `./spaceControls` pointing types at ./dist/spaceControls.d.ts,
// which never existed: Vite flattens the JS bundle while tsc preserves the
// source tree, so the declaration lands at dist/styles/. Consumers got TS7016
// and every ctl.* silently became `any` — a whole subpath's types gone, with
// nothing in this repo failing.
//
// It also checks the declaration is self-contained. Repointing the map alone
// would have traded TS7016 for "cannot find module './spaceControls.module.scss'",
// because that SCSS is not published.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const problems = [];

const walk = (value, label) => {
  if (typeof value === "string") {
    if (!value.startsWith("./")) return;
    if (!existsSync(resolve(root, value))) {
      problems.push(`exports${label} -> ${value} does not exist`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) walk(inner, `${label}.${key}`);
  }
};
walk(pkg.exports, "");
for (const field of ["main", "module", "types"]) {
  if (pkg[field] && !existsSync(resolve(root, pkg[field]))) {
    problems.push(`${field} -> ${pkg[field]} does not exist`);
  }
}

// A published .d.ts must not import something the tarball does not carry.
for (const [name, entry] of Object.entries(pkg.exports ?? {})) {
  const types = typeof entry === "object" ? entry?.types : null;
  if (!types) continue;
  const file = resolve(root, types);
  if (!existsSync(file)) continue;
  for (const m of readFileSync(file, "utf8").matchAll(/from\s+["'](\.[^"']+)["']/g)) {
    const target = resolve(dirname(file), m[1]);
    const found = [target, `${target}.d.ts`, `${target}.ts`, `${target}/index.d.ts`].some(existsSync);
    if (!found) problems.push(`${types} imports "${m[1]}", which is not published`);
  }
}

if (problems.length) {
  console.error("Broken package surface:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`Package surface OK — ${Object.keys(pkg.exports ?? {}).length} export entries resolve.`);
