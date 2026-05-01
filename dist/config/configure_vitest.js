import { d as e } from "../util-CZb1AxZa.js";
import { n as t, t as n } from "../gen_vite-55xxG9iy.js";
import r from "node:fs";
import { defineConfig as i } from "vitest/config";
//#region src/config/configure_vitest.ts
var a = () => {
	let a = e(), o = JSON.parse(r.readFileSync(a, "utf-8"));
	return i({
		plugins: t(o),
		define: n(o),
		test: {
			passWithNoTests: !0,
			includeSource: ["src/**/*.{ts,mts,cts,tsx}"]
		}
	});
};
//#endregion
export { a as configure };

//# sourceMappingURL=configure_vitest.js.map