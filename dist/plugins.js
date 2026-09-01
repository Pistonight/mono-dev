import e, { readFileSync as t } from "node:fs";
import n from "node:path";
import r from "node:child_process";
import { load as i } from "js-yaml";
//#region \0rolldown/runtime.js
var a = Object.create, o = Object.defineProperty, s = Object.getOwnPropertyDescriptor, c = Object.getOwnPropertyNames, l = Object.getPrototypeOf, u = Object.prototype.hasOwnProperty, d = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), f = (e, t) => {
	let n = {};
	for (var r in e) o(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || o(n, Symbol.toStringTag, { value: "Module" }), n;
}, p = (e, t, n, r) => {
	if (t && typeof t == "object" || typeof t == "function") for (var i = c(t), a = 0, l = i.length, d; a < l; a++) d = i[a], !u.call(e, d) && d !== n && o(e, d, {
		get: ((e) => t[e]).bind(null, d),
		enumerable: !(r = s(t, d)) || r.enumerable
	});
	return e;
}, m = (e, t, n) => (n = e == null ? {} : a(l(e)), p(t || !e || !e.__esModule || !u.call(e, "default") ? o(n, "default", {
	value: e,
	enumerable: !0
}) : n, e)), h = /* @__PURE__ */ ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (e, t) => (typeof require < "u" ? require : e)[t] }) : e)(function(e) {
	if (typeof require < "u") return require.apply(this, arguments);
	throw Error("Calling `require` for \"" + e + "\" in an environment that doesn't expose the `require` function. See https://rolldown.rs/in-depth/bundling-cjs#require-external-modules for more details.");
}), g = "_dts_", _ = "dist", v = import.meta.dirname, y = n.basename(v) === "dist" ? n.dirname(v) : n.dirname(n.dirname(v)), b = n.join(y, "node_modules", ".bin"), x = () => {
	let t = S(), r = n.dirname(t), i = n.join(r, "node_modules/.mono");
	return e.existsSync(i) || e.mkdirSync(i, { recursive: !0 }), {
		packageJsonPath: t,
		rootDir: r,
		cacheDir: i
	};
}, S = () => {
	let t = n.resolve("."), r = n.join(t, "package.json");
	for (; !e.existsSync(r);) {
		let e = n.dirname(t);
		if (!e || e === t) return "package.json";
		t = e, r = n.join(t, "package.json");
	}
	return n.resolve(r);
}, C = () => "0.4.30", w = (e, t) => t.filter((t) => T(e, t)), T = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), E = "[mono]", D = (...e) => console.log(E, ...e), O = (...e) => console.warn("\x1B[33m[mono]", ...e, "\x1B[0m"), k = (...e) => console.error("\x1B[31m[mono]", ...e, "\x1B[0m"), A = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), j = (e, t) => {
	if (typeof e == "string") return e;
	if (!e) return `${e}`;
	if (typeof e == "object" && "message" in e) return t ? `${e.message}` : j(e.message, !0);
	if (typeof e == "object" && "toString" in e) {
		let n = e.toString();
		return t ? `${n}` : j(n, !0);
	}
	return typeof e == "object" && "msg" in e ? t ? `${e.msg}` : j(e.msg, !0) : typeof e == "object" && "code" in e ? t ? `${e.code}` : `error code: ${j(e.code, !0)}` : `${e}`;
}, M = (e) => {
	let t = process.argv.slice(2), r = P(e, n.dirname(S()), t);
	process.exit(r.status ?? 0);
}, N = (e, t, n) => L(e, P(e, t, n)), P = (e, t, i) => {
	process.platform === "win32" && (e += ".cmd");
	let a = n.join(b, e);
	return process.platform === "win32" ? r.spawnSync(`"${a}"`, i, {
		stdio: "inherit",
		cwd: t,
		shell: !0
	}) : r.spawnSync(a, i, {
		cwd: t,
		stdio: "inherit"
	});
}, F = async (t, n, r) => {
	let i = t;
	if (process.platform === "win32" && !t.toLowerCase().endsWith(".exe") && (t += ".exe"), e.existsSync(t)) {
		let { default: e } = await import("./lib.js").then((e) => /* @__PURE__ */ m(e.default, 1));
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
	return I(t, n, r);
}, I = async (e, t, n) => process.platform === "win32" && e.endsWith(".cmd") ? L(e, r.spawnSync(`"${e}"`, n, {
	stdio: "inherit",
	cwd: t,
	shell: !0
})) : L(e, r.spawnSync(e, n, {
	cwd: t,
	stdio: "inherit"
})), L = (e, t) => t.error ? { err: `spawn failed: ${j(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, R = () => ({
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
export { d as _, _ as a, m as b, w as c, S as d, T as f, A as g, O as h, M as i, C as l, D as m, F as n, g as o, k as p, N as r, y as s, R as t, x as u, f as v, h as y };
