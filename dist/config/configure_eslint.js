import { d as e, r as t } from "../util-C2LEqfgW.js";
import { n } from "../project-CKlVkcHT.js";
import { n as r } from "../plugins-DkT6OaXs.js";
import i from "node:fs";
import a from "node:path";
import { defineConfig as o, globalIgnores as s } from "eslint/config";
import c from "@eslint/js";
import l from "globals";
import u from "eslint-plugin-react-hooks";
import d from "eslint-plugin-react-refresh";
import f from "eslint-plugin-react-compiler";
import p from "typescript-eslint";
//#region src/config/configure_eslint.ts
var m = () => {
	let n = e(), m = a.dirname(n), v = JSON.parse(i.readFileSync(n, "utf-8")), y = t(v, "react"), b = (v["pistonight/mono-dev"] || {}).lib !== !1;
	return g(o(s(_(v, m)), {
		extends: [
			c.configs.recommended,
			...p.configs.strict,
			...y ? [
				u.configs.flat.recommended,
				d.configs.vite,
				f.configs.recommended
			] : []
		],
		files: ["**/*.{ts,mts,cts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: l.browser,
			parserOptions: {
				projectService: !0,
				tsconfigRootDir: m
			}
		},
		settings: { ...y ? { react: { version: "19" } } : {} },
		plugins: { ...b ? { "monodev-eslint": r } : {} },
		rules: {
			...y ? { "react-refresh/only-export-components": ["warn", { allowConstantExport: !0 }] } : {},
			"no-unused-vars": "off",
			"@typescript-eslint/consistent-type-imports": "warn",
			"@typescript-eslint/no-floating-promises": "warn",
			...b ? {
				"@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
				"monodev-eslint/no-param-destructure": "warn",
				"monodev-eslint/no-keyof-typeof-alias": "warn"
			} : void 0
		}
	}), h());
}, h = () => ({
	"@typescript-eslint/no-unused-vars": ["warn", {
		varsIgnorePattern: "^_",
		argsIgnorePattern: "^_"
	}],
	"@typescript-eslint/restrict-template-expressions": ["warn", { allowNumber: !0 }],
	"react/prop-types": "off"
}), g = (e, t) => {
	if (Array.isArray(e)) for (let n of e) g(n, t);
	else if (e.rules) for (let n in t) e.rules[n] && (e.rules[n] = t[n]);
	return e;
}, _ = (e, t) => {
	let r = ["./eslint.config.js"];
	for (let e of i.readdirSync(t)) try {
		if (i.statSync(`${t}/${e}`).isDirectory()) try {
			i.statSync(`${t}/${e}/env.d.ts`);
		} catch {
			r.push("./" + e);
		}
	} catch {}
	let a = n(e, t);
	for (let e of a) e.includes("tsconfig") || e.includes("eslint.config.js") || e.startsWith("!") || (e.startsWith("/") ? r.push(`.${e}`) : r.push(`**/${e}`));
	return r;
};
//#endregion
export { m as configure, g as overrideEslintConfig };

//# sourceMappingURL=configure_eslint.js.map