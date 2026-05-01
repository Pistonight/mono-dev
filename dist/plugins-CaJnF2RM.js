import { readFileSync as e } from "node:fs";
import t from "js-yaml";
//#region src/plugins/eslint_monodev.ts
var n = { rules: {
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
} }, r = () => ({
	name: "vite-yaml",
	transform: {
		filter: { id: /\.ya?ml$/ },
		handler(n, r) {
			if (!r.endsWith(".yaml") && !r.endsWith(".yml")) return null;
			let i = e(r, "utf-8");
			if (i.length > 1e4) {
				let e = JSON.stringify(t.load(i));
				return {
					code: `export default JSON.parse(${JSON.stringify(e)});`,
					map: null
				};
			}
			return {
				code: `export default ${JSON.stringify(t.load(i))};`,
				map: null
			};
		}
	}
});
//#endregion
export { n, r as t };

//# sourceMappingURL=plugins-CaJnF2RM.js.map