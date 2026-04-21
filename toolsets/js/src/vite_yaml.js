import YAML from "js-yaml";
import { readFileSync } from "fs";

export default function viteYaml() {
    return {
        name: "vite-yaml",
        transform(_, id) {
            if (!id.endsWith(".yaml") && !id.endsWith(".yml")) return null;
            const raw = readFileSync(id, "utf-8");
            // this is the stringified json '{"foo":"bar"}'
            const json /* string */ = JSON.stringify(YAML.load(raw));
            // this converts it to a string literal that can be embeded
            const json_literal = JSON.stringify(json);
            return { code: `export default JSON.parse(${json_literal});`, map: null };
        },
    };
}
