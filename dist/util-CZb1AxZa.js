import { r as e } from "./chunk-D8eiyYIV.js";
import t from "node:fs";
import n from "node:path";
import r from "node:child_process";
//#region src/util/misc.ts
var i = "_dts_", a = "dist", o = import.meta.dirname, s = n.basename(o) === "dist" ? n.dirname(o) : n.dirname(n.dirname(o)), c = n.join(s, "node_modules", ".bin"), l = () => {
	let e = u(), r = n.dirname(e), i = n.join(r, "node_modules/.mono");
	return t.existsSync(i) || t.mkdirSync(i, { recursive: !0 }), {
		packageJsonPath: e,
		rootDir: r,
		cacheDir: i
	};
}, u = () => {
	let e = n.resolve("."), r = n.join(e, "package.json");
	for (; !t.existsSync(r);) {
		let t = n.dirname(e);
		if (!t || t === e) return "package.json";
		e = t, r = n.join(e, "package.json");
	}
	return n.resolve(r);
}, d = () => "0.4.3", f = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), p = "[mono]", m = (...e) => console.log(p, ...e), h = (...e) => console.warn("\x1B[33m" + p, ...e, "\x1B[0m"), g = (...e) => console.error("\x1B[31m" + p, ...e, "\x1B[0m"), _ = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), v = (e, t) => {
	if (typeof e == "string") return e;
	if (!e) return `${e}`;
	if (typeof e == "object" && "message" in e) return t ? `${e.message}` : v(e.message, !0);
	if (typeof e == "object" && "toString" in e) {
		let n = e.toString();
		return t ? `${n}` : v(n, !0);
	}
	return typeof e == "object" && "msg" in e ? t ? `${e.msg}` : v(e.msg, !0) : typeof e == "object" && "code" in e ? t ? `${e.code}` : `error code: ${v(e.code, !0)}` : `${e}`;
}, y = (e) => {
	let t = process.argv.slice(2), r = x(e, n.dirname(u()), t);
	process.exit(r.status ?? 0);
}, b = (e, t, n) => w(e, x(e, t, n)), x = (e, t, i) => {
	process.platform === "win32" && (e += ".cmd");
	let a = n.join(c, e);
	return process.platform === "win32" ? r.spawnSync(`"${a}"`, i, {
		stdio: "inherit",
		cwd: t,
		shell: !0
	}) : r.spawnSync(a, i, {
		cwd: t,
		stdio: "inherit"
	});
}, S = async (n, r, i) => {
	let a = n;
	if (process.platform === "win32" && !n.toLowerCase().endsWith(".exe") && (n += ".exe"), t.existsSync(n)) {
		let { default: t } = await import("./lib-DZCPhPxI.js").then((t) => /* @__PURE__ */ e(t.default, 1));
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
	return C(n, r, i);
}, C = async (e, t, n) => process.platform === "win32" && e.endsWith(".cmd") ? w(e, r.spawnSync(`"${e}"`, n, {
	stdio: "inherit",
	cwd: t,
	shell: !0
})) : w(e, r.spawnSync(e, n, {
	cwd: t,
	stdio: "inherit"
})), w = (e, t) => t.error ? { err: `spawn failed: ${v(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, T = 4, E = (e) => D(e, 0), D = (e, t) => {
	if (e == null) return "null";
	switch (typeof e) {
		case "string":
		case "number":
		case "boolean": return JSON.stringify(e);
		case "object":
			if (Array.isArray(e)) {
				if (e.length === 0) return "[]";
				if (e.length === 1) {
					let n = D(e[0], t);
					return n === void 0 ? "[]" : `[ ${n} ]`;
				}
				let n = "[\n", r = !1, i = " ".repeat(t);
				for (let a = 0; a < e.length; a++) {
					let o = D(e[a], t + T);
					o !== void 0 && (r && (n += ",\n"), r = !0, n += i, n += " ".repeat(T), n += o);
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
		let s = D(e[n[o]], t + T);
		s !== void 0 && (a && (r += ",\n"), a = !0, r += i, r += " ".repeat(T), r += JSON.stringify(n[o]), r += ": ", r += s);
	}
	return r += "\n", r += i, r += "}", r;
};
//#endregion
export { y as a, s as c, u as d, f, _ as g, h, b as i, d as l, m, D as n, a as o, g as p, S as r, i as s, E as t, l as u };

//# sourceMappingURL=util-CZb1AxZa.js.map