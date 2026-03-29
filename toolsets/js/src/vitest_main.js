import { execute } from "./execute.js";
const child = execute("vite", process.argv.slice(2));
process.exit(child.status ?? 0);
