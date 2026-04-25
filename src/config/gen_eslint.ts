import path from "node:path";
import fs from "node:fs";

import { normalizeLineEnds } from "#util";

export const genEslintConfig = (rootDir: string) => {
    const eslintPath = path.join(rootDir, "eslint.config.js");
    const config = `import { configure } from "mono-dev/eslint-config"; export default configure();`;
    fs.writeFileSync(eslintPath, normalizeLineEnds(config));
};
