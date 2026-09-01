import e, { readFileSync as t } from "node:fs";
import n from "node:path";
import r from "node:child_process";
import { load as i } from "js-yaml";
//#region \0rolldown/runtime.js
var a = Object.create, o = Object.defineProperty, s = Object.getOwnPropertyDescriptor, c = Object.getOwnPropertyNames, l = Object.getPrototypeOf, u = Object.prototype.hasOwnProperty, d = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), f = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = c(t), a = 0, l = i.length, d; a < l; a++) d = i[a], !u.call(e, d) && d !== n && o(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(r = s(t, d)) || r.enumerable
	});
	return e;
}, p = (e, t, n) => (n = e == null ? {} : a(l(e)), f(t || !e || !e.__esModule || !u.call(e, "default") ? o(n, "default", {
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
}, S = () => "0.4.32", C = (e, t) => t.filter((t) => w(e, t)), w = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), T = "[mono]", E = (...e) => console.log(T, ...e), D = (...e) => console.warn("\x1B[33m[mono]", ...e, "\x1B[0m"), O = (...e) => console.error("\x1B[31m[mono]", ...e, "\x1B[0m"), k = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), A = (e, t) => {
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
})), I = (e, t) => t.error ? { err: `spawn failed: ${A(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, L = () => ({
	name: "vite-yaml",
	transform: {
		filter: { id: /\.ya?ml$/ },
		handler(e, n) {
			if (!n.endsWith(".yaml") && !n.endsWith(".yml")) return null;
			let r = t(n, "utf-8");
			if (r.length > 1e4) {
				let e = JSON.stringify(i(r));
				return {
					code: `export default JSON.parse(${JSON.stringify(e)});`,
					map: null
				};
			}
			return {
				code: `export default ${JSON.stringify(i(r))};`,
				map: null
			};
		}
	}
});
//#endregion
export { d as _, g as a, C as c, x as d, w as f, k as g, D as h, j as i, S as l, E as m, P as n, h as o, O as p, M as r, v as s, L as t, b as u, m as v };
