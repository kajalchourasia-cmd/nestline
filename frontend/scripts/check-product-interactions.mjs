import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../app/", import.meta.url));
const files = [];
function walk(path) {
  for (const entry of readdirSync(path)) {
    const full = join(path, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (full.endsWith(".tsx") && !full.includes(`${join("components", "ui")}`)) files.push(full);
  }
}
walk(root);

const failures = [];
let nativeButtons = 0;
let componentButtons = 0;
for (const file of files) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/<button\b([^>]*)>/gs)) {
    nativeButtons += 1;
    const attrs = match[1];
    if (!/onClick\s*=|disabled(?:\s|=|$)/s.test(attrs)) {
      failures.push(`${file}: native button has no onClick or disabled contract: ${match[0].slice(0, 100)}`);
    }
  }
  for (const match of source.matchAll(/<Button\b([^>]*)>/gs)) {
    componentButtons += 1;
    const attrs = match[1];
    if (!/onClick\s*=|type\s*=\s*["']submit["']|disabled(?:\s|=|$)/s.test(attrs)) {
      failures.push(`${file}: Button has no action contract: ${match[0].slice(0, 100)}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({ files_checked: files.length, native_buttons_checked: nativeButtons, component_buttons_checked: componentButtons, failures: 0 }));
