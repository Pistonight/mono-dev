import { r as e } from "./rolldown-runtime.js";
import t, { readFileSync as n } from "node:fs";
import r from "node:path";
import i from "node:child_process";
import { load as a } from "js-yaml";
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
}, p = () => "0.4.23", m = (e, t) => t.filter((t) => h(e, t)), h = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), g = "[mono]", _ = (...e) => console.log(g, ...e), v = (...e) => console.warn("\x1B[33m[mono]", ...e, "\x1B[0m"), y = (...e) => console.error("\x1B[31m[mono]", ...e, "\x1B[0m"), b = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), x = (e, t) => {
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
		let { default: t } = await import("./lib.js").then((t) => /* @__PURE__ */ e(t.default, 1));
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
})), D = (e, t) => t.error ? { err: `spawn failed: ${x(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, O = () => ({
	name: "vite-yaml",
	transform: {
		filter: { id: /\.ya?ml$/ },
		handler(e, t) {
			if (!t.endsWith(".yaml") && !t.endsWith(".yml")) return null;
			let r = n(t, "utf-8");
			if (r.length > 1e4) {
				let e = JSON.stringify(a(r));
				return {
					code: `export default JSON.parse(${JSON.stringify(e)});`,
					map: null
				};
			}
			return {
				code: `export default ${JSON.stringify(a(r))};`,
				map: null
			};
		}
	}
});
//#endregion
export { s as a, m as c, f as d, h as f, b as g, v as h, S as i, p as l, _ as m, T as n, o, y as p, C as r, l as s, O as t, d as u };

//# sourceMappingURL=plugins.js.map