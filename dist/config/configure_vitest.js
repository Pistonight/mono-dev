import { f as e } from "../util-C0bxyxA5.js";
import { r as t } from "../project-DHvwxsYP.js";
import { n, t as r } from "../gen_vite-kO1VSm7R.js";
import i from "node:fs";
import a from "node:path";
import { defineConfig as o } from "vitest/config";
//#region src/config/configure_vitest.ts
var s = () => {
	let s = e(), c = a.dirname(s), l = JSON.parse(i.readFileSync(s, "utf-8")), u = t(c, l), d = "src";
	return u.val && (d = u.val.src), o({
		plugins: n(l),
		define: r(l),
		test: {
			passWithNoTests: !0,
			includeSource: [d + "/**/*.{ts,mts,cts,tsx}"]
		}
	});
};
//#endregion
export { s as configure };

//# sourceMappingURL=configure_vitest.js.map