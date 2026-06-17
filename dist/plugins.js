import e, { readFileSync as t } from "node:fs";
import n from "node:path";
import r from "node:child_process";
import i from "js-yaml";
//#region \0rolldown/runtime.js
var a = Object.create, o = Object.defineProperty, s = Object.getOwnPropertyDescriptor, c = Object.getOwnPropertyNames, l = Object.getPrototypeOf, u = Object.prototype.hasOwnProperty, d = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), f = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = c(t), a = 0, l = i.length, d; a < l; a++) d = i[a], !u.call(e, d) && d !== n && o(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(r = s(t, d)) || r.enumerable
	});
	return e;
}, p = (e, t, n) => (n = e == null ? {} : a(l(e)), f(t || !e || !e.__esModule ? o(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), m = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}), h = "_dts_", g = "dist", _ = import.meta.dirname, v = n.basename(_) === "dist" ? n.dirname(_) : n.dirname(n.dirname(_)), y = n.join(v, "node_modules", ".bin"), b = () => {
	let t = x(), r = n.dirname(t), i = n.join(r, "node_modules/.mono");
	return e.existsSync(i) || e.mkdirSync(i, { recursive: !0 }), {
		packageJsonPath: t,
		rootDir: r,
		cacheDir: i
	};
}, x = () => {
	let t = n.resolve("."), r = n.join(t, "package.json");
	for (; !e.existsSync(r);) {
		let e = n.dirname(t);
		if (!e || e === t) return "package.json";
		t = e, r = n.join(t, "package.json");
	}
	return n.resolve(r);
}, S = () => "0.4.19", C = (e, t) => t.filter((t) => w(e, t)), w = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), T = "[mono]", E = (...e) => console.log(T, ...e), D = (...e) => console.warn("\x1B[33m[mono]", ...e, "\x1B[0m"), O = (...e) => console.error("\x1B[31m[mono]", ...e, "\x1B[0m"), k = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), A = (e, t) => {
	if (typeof e == "string") return e;
	if (!e) return `${e}`;
	if (typeof e == "object" && "message" in e) return t ? `${e.message}` : A(e.message, !0);
	if (typeof e == "object" && "toString" in e) {
		let n = e.toString();
		return t ? `${n}` : A(n, !0);
	}
	return typeof e == "object" && "msg" in e ? t ? `${e.msg}` : A(e.msg, !0) : typeof e == "object" && "code" in e ? t ? `${e.code}` : `error code: ${A(e.code, !0)}` : `${e}`;
}, j = (e) => {
	let t = process.argv.slice(2), r = N(e, n.dirname(x()), t);
	process.exit(r.status ?? 0);
}, M = (e, t, n) => I(e, N(e, t, n)), N = (e, t, i) => {
	process.platform === "win32" && (e += ".cmd");
	let a = n.join(y, e);
	return process.platform === "win32" ? r.spawnSync(`"${a}"`, i, {
		stdio: "inherit",
		cwd: t,
		shell: !0
	}) : r.spawnSync(a, i, {
		cwd: t,
		stdio: "inherit"
	});
}, P = async (t, n, r) => {
	let i = t;
	if (process.platform === "win32" && !t.toLowerCase().endsWith(".exe") && (t += ".exe"), e.existsSync(t)) {
		let { default: e } = await import("./lib.js").then((e) => /* @__PURE__ */ p(e.default, 1));
		try {
			t = await e(t);
		} catch {
			if (process.platform === "win32") try {
				t = await e(i + ".cmd");
			} catch {
				return { err: `executable ${t} not found on the system!` };
			}
			else return { err: `executable ${t} not found on the system!` };
		}
	}
	return F(t, n, r);
}, F = async (e, t, n) => process.platform === "win32" && e.endsWith(".cmd") ? I(e, r.spawnSync(`"${e}"`, n, {
	stdio: "inherit",
	cwd: t,
	shell: !0
})) : I(e, r.spawnSync(e, n, {
	cwd: t,
	stdio: "inherit"
})), I = (e, t) => t.error ? { err: `spawn failed: ${A(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, L = 4, R = (e) => z(e, 0), z = (e, t) => {
	if (e == null) return "null";
	switch (typeof e) {
		case "string":
		case "number":
		case "boolean": return JSON.stringify(e);
		case "object":
			if (Array.isArray(e)) {
				if (e.length === 0) return "[]";
				if (e.length === 1) {
					let n = z(e[0], t);
					return n === void 0 ? "[]" : `[ ${n} ]`;
				}
				let n = "[\n", r = !1, i = " ".repeat(t);
				for (let a = 0; a < e.length; a++) {
					let o = z(e[a], t + L);
					o !== void 0 && (r && (n += ",\n"), r = !0, n += i, n += " ".repeat(L), n += o);
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
		let s = z(e[n[o]], t + L);
		s !== void 0 && (a && (r += ",\n"), a = !0, r += i, r += " ".repeat(L), r += JSON.stringify(n[o]), r += ": ", r += s);
	}
	return r += "\n", r += i, r += "}", r;
}, B = { rules: {
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
} }, V = () => ({
	name: "vite-yaml",
	transform: {
		filter: { id: /\.ya?ml$/ },
		handler(e, n) {
			if (!n.endsWith(".yaml") && !n.endsWith(".yml")) return null;
			let r = t(n, "utf-8");
			if (r.length > 1e4) {
				let e = JSON.stringify(i.load(r));
				return {
					code: `export default JSON.parse(${JSON.stringify(e)});`,
					map: null
				};
			}
			return {
				code: `export default ${JSON.stringify(i.load(r))};`,
				map: null
			};
		}
	}
});
//#endregion
export { E as _, P as a, d as b, g as c, C as d, S as f, O as g, w as h, z as i, h as l, x as m, B as n, M as o, b as p, R as r, j as s, V as t, v as u, D as v, m as x, k as y };

//# sourceMappingURL=plugins.js.map