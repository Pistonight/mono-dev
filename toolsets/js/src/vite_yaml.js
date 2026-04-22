import YAML from "js-yaml";
import { readFileSync } from "fs";

export default function viteYaml() {
    return {
        name: "vite-yaml",
        transform(_, id) {
            if (!id.endsWith(".yaml") && !id.endsWith(".yml")) return null;
            const raw = readFileSync(id, "utf-8");
            // https://vite.dev/config/shared-options#json-stringify 
            // https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger
            if (raw.length > 10_000) {
                // this is the stringified json '{"foo":"bar"}'
                const json /* string */ = JSON.stringify(YAML.load(raw));
                const json_literal = JSON.stringify(json);
                return { code: `export default JSON.parse(${json_literal});`, map: null };
            }
            const json = JSON.stringify(YAML.load(raw));
            return { code: `export default ${json};`, map: null };
        },
    };
}
