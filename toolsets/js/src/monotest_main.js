import fs from "node:fs";
import path from "node:path";

import { get_package_json_path } from "./location.js";
import { execute } from "./execute.js";

const run_test = () => {
    const package_json_path = get_package_json_path();
    const root_path = path.dirname(package_json_path);
    const cache_path = path.join(root_path, "node_modules/.monotest");
    if (!fs.existsSync(cache_path)) {
        fs.mkdirSync(cache_path, { recursive: true });
    }
    const config_path = path.join(cache_path, "vitest.config.js");
    fs.writeFileSync(config_path, `
import { configure } from "mono-dev/vitest-config";
export default configure();
`);
    const args = ["--config", config_path, ...process.argv.slice(2)];
    const child = execute("vitest", args);
    process.exit(child.status ?? 0);
}

run_test();
