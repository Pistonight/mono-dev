import { d as e, f as t } from "../plugins.js";
import { n } from "../project.js";
import r from "node:fs";
import i from "node:path";
import { defineConfig as a, globalIgnores as o } from "eslint/config";
import s from "@eslint/js";
import c from "globals";
import l from "eslint-plugin-react-hooks";
import u from "eslint-plugin-react-refresh";
import d from "eslint-plugin-react-compiler";
import f from "typescript-eslint";
//#region src/plugins/eslint_monodev.ts
var p = { rules: {
	"no-keyof-typeof-alias": {
		meta: {
			type: "suggestion",
			messages: { noKeyofTypeofAlias: "Avoid exporting type aliases of the form 'keyof typeof X'. Inline the type so it shows up in the documentation more precisely." }
		},
		create(e) {
			return { "ExportNamedDeclaration > TSTypeAliasDeclaration": (t) => {
				let n = t.typeAnnotation;
				n.type === "TSTypeOperator" && n.operator === "keyof" && n.typeAnnotation?.type === "TSTypeQuery" && e.report({
					node: t,
					messageId: "noKeyofTypeofAlias"
				});
			} };
		}
	},
	"no-param-destructure": {
		meta: {
			type: "suggestion",
			messages: { noParamDestructure: "Avoid object destructuring in function parameters in library code. Use a named parameter to ensure it is presented properly in generated documentation." }
		},
		create(e) {
			function t(t) {
				for (let n of t.params) n.type === "ObjectPattern" && e.report({
					node: n,
					messageId: "noParamDestructure"
				});
			}
			return {
				"ExportNamedDeclaration > FunctionDeclaration": t,
				"ExportDefaultDeclaration > FunctionDeclaration": t,
				"ExportDefaultDeclaration > FunctionExpression": t,
				"ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ArrowFunctionExpression": t,
				"ExportDefaultDeclaration > ArrowFunctionExpression": t
			};
		}
	}
} }, m = () => {
	let n = e(), m = i.dirname(n), v = JSON.parse(r.readFileSync(n, "utf-8")), y = t(v, "react"), b = (v["pistonight/mono-dev"] || {}).lib !== !1;
	return g(a(o(_(v, m)), {
		extends: [
			s.configs.recommended,
			...f.configs.strict,
			...y ? [
				l.configs.flat.recommended,
				u.configs.vite,
				d.configs.recommended
			] : []
		],
		files: ["**/*.{ts,mts,cts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: c.browser,
			parserOptions: {
				projectService: !0,
				tsconfigRootDir: m
			}
		},
		settings: { ...y ? { react: { version: "19" } } : {} },
		plugins: { ...b ? { "monodev-eslint": p } : {} },
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
	let i = ["./eslint.config.js"];
	for (let e of r.readdirSync(t)) try {
		if (r.statSync(`${t}/${e}`).isDirectory()) try {
			r.statSync(`${t}/${e}/env.d.ts`);
		} catch {
			i.push("./" + e);
		}
	} catch {}
	let a = n(e, t);
	for (let e of a) e.includes("tsconfig") || e.includes("eslint.config.js") || e.startsWith("!") || (e.startsWith("/") ? i.push(`.${e}`) : i.push(`**/${e}`));
	return i;
};
//#endregion
export { m as configure, g as overrideEslintConfig };

//# sourceMappingURL=configure_eslint.js.map