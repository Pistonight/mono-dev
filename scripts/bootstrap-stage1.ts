import fs from "node:fs";
import { ensureSubpathImports } from "../src/project/subpath_imports.ts";
const result = await ensureSubpathImports(
    JSON.parse(fs.readFileSync("package.json", "utf-8")),
    "package.json",
);

if (result.err) {
    console.error("ensureSubpathImports failed: " + result.err);
    process.exit(1);
}
