import { r as e } from "./chunk-D8eiyYIV.js";
import t, { readFileSync as n } from "node:fs";
import r from "node:path";
import i from "node:child_process";
import a from "js-yaml";
//#region src/util/misc.ts
var o = "_dts_", s = "dist", c = import.meta.dirname, l = r.basename(c) === "dist" ? r.dirname(c) : r.dirname(r.dirname(c)), u = r.join(l, "node_modules", ".bin"), d = () => {
	let e = f(), n = r.dirname(e), i = r.join(n, "node_modules/.mono");
	return t.existsSync(i) || t.mkdirSync(i, { recursive: !0 }), {
		packageJsonPath: e,
		rootDir: n,
		cacheDir: i
	};
}, f = () => {
	let e = r.resolve("."), n = r.join(e, "package.json");
	for (; !t.existsSync(n);) {
		let t = r.dirname(e);
		if (!t || t === e) return "package.json";
		e = t, n = r.join(e, "package.json");
	}
	return r.resolve(n);
}, p = () => "0.4.11", m = (e, t) => t.filter((t) => h(e, t)), h = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), g = "[mono]", _ = (...e) => console.log(g, ...e), v = (...e) => console.warn("\x1B[33m" + g, ...e, "\x1B[0m"), y = (...e) => console.error("\x1B[31m" + g, ...e, "\x1B[0m"), b = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), x = (e, t) => {
	if (typeof e == "string") return e;
	if (!e) return `${e}`;
	if (typeof e == "object" && "message" in e) return t ? `${e.message}` : x(e.message, !0);
	if (typeof e == "object" && "toString" in e) {
		let n = e.toString();
		return t ? `${n}` : x(n, !0);
	}
	return typeof e == "object" && "msg" in e ? t ? `${e.msg}` : x(e.msg, !0) : typeof e == "object" && "code" in e ? t ? `${e.code}` : `error code: ${x(e.code, !0)}` : `${e}`;
}, S = (e) => {
	let t = process.argv.slice(2), n = w(e, r.dirname(f()), t);
	process.exit(n.status ?? 0);
}, C = (e, t, n) => D(e, w(e, t, n)), w = (e, t, n) => {
	process.platform === "win32" && (e += ".cmd");
	let a = r.join(u, e);
	return process.platform === "win32" ? i.spawnSync(`"${a}"`, n, {
		stdio: "inherit",
		cwd: t,
		shell: !0
	}) : i.spawnSync(a, n, {
		cwd: t,
		stdio: "inherit"
	});
}, T = async (n, r, i) => {
	let a = n;
	if (process.platform === "win32" && !n.toLowerCase().endsWith(".exe") && (n += ".exe"), t.existsSync(n)) {
		let { default: t } = await import("./lib-Dl8HJkTn.js").then((t) => /* @__PURE__ */ e(t.default, 1));
		try {
			n = await t(n);
		} catch {
			if (process.platform === "win32") try {
				n = await t(a + ".cmd");
			} catch {
				return { err: `executable ${n} not found on the system!` };
			}
			else return { err: `executable ${n} not found on the system!` };
		}
	}
	return E(n, r, i);
}, E = async (e, t, n) => process.platform === "win32" && e.endsWith(".cmd") ? D(e, i.spawnSync(`"${e}"`, n, {
	stdio: "inherit",
	cwd: t,
	shell: !0
})) : D(e, i.spawnSync(e, n, {
	cwd: t,
	stdio: "inherit"
})), D = (e, t) => t.error ? { err: `spawn failed: ${x(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, O = 4, k = (e) => A(e, 0), A = (e, t) => {
	if (e == null) return "null";
	switch (typeof e) {
		case "string":
		case "number":
		case "boolean": return JSON.stringify(e);
		case "object":
			if (Array.isArray(e)) {
				if (e.length === 0) return "[]";
				if (e.length === 1) {
					let n = A(e[0], t);
					return n === void 0 ? "[]" : `[ ${n} ]`;
				}
				let n = "[\n", r = !1, i = " ".repeat(t);
				for (let a = 0; a < e.length; a++) {
					let o = A(e[a], t + O);
					o !== void 0 && (r && (n += ",\n"), r = !0, n += i, n += " ".repeat(O), n += o);
				}
				return n += "\n", n += i, n += "]", n;
			}
			break;
		default: return;
	}
	let n = Object.keys(e).sort();
	if (n.length === 0) return "{}";
	let r = "{\n", i = " ".repeat(t), a = !1;
	for (let o = 0; o < n.length; o++) {
		let s = A(e[n[o]], t + O);
		s !== void 0 && (a && (r += ",\n"), a = !0, r += i, r += " ".repeat(O), r += JSON.stringify(n[o]), r += ": ", r += s);
	}
	return r += "\n", r += i, r += "}", r;
}, j = { rules: {
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
} }, M = () => ({
	name: "vite-yaml",
	transform: {
		filter: { id: /\.ya?ml$/ },
		handler(e, t) {
			if (!t.endsWith(".yaml") && !t.endsWith(".yml")) return null;
			let r = n(t, "utf-8");
			if (r.length > 1e4) {
				let e = JSON.stringify(a.load(r));
				return {
					code: `export default JSON.parse(${JSON.stringify(e)});`,
					map: null
				};
			}
			return {
				code: `export default ${JSON.stringify(a.load(r))};`,
				map: null
			};
		}
	}
});
//#endregion
export { _, T as a, s as c, m as d, p as f, y as g, h, A as i, o as l, f as m, j as n, C as o, d as p, k as r, S as s, M as t, l as u, v, b as y };

//# sourceMappingURL=plugins-DS1l0m1k.js.map