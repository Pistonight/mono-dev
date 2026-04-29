import { r as e } from "./chunk-D8eiyYIV.js";
import t from "node:fs";
import n from "node:path";
import r from "node:child_process";
//#region src/util/constants.ts
var i = "_dts_", a = import.meta.dirname, o = n.basename(a) === "dist" ? n.dirname(a) : n.dirname(n.dirname(a)), s = n.join(o, "node_modules", ".bin"), c = () => {
	let e = l(), r = n.dirname(e), i = n.join(r, "node_modules/.mono");
	return t.existsSync(i) || t.mkdirSync(i, { recursive: !0 }), {
		packageJsonPath: e,
		rootDir: r,
		cacheDir: i
	};
}, l = () => {
	let e = n.resolve("."), r = n.join(e, "package.json");
	for (; !t.existsSync(r);) {
		let t = n.dirname(e);
		if (!t || t === e) return "package.json";
		e = t, r = n.join(e, "package.json");
	}
	return n.resolve(r);
}, u = () => "0.3.32", d = (e, t) => {
	if (typeof e == "string") return e;
	if (!e) return `${e}`;
	if (typeof e == "object" && "message" in e) return t ? `${e.message}` : d(e.message, !0);
	if (typeof e == "object" && "toString" in e) {
		let n = e.toString();
		return t ? `${n}` : d(n, !0);
	}
	return typeof e == "object" && "msg" in e ? t ? `${e.msg}` : d(e.msg, !0) : typeof e == "object" && "code" in e ? t ? `${e.code}` : `error code: ${d(e.code, !0)}` : `${e}`;
}, f = (e) => {
	let t = process.argv.slice(2), r = m(e, n.dirname(l()), t);
	process.exit(r.status ?? 0);
}, p = (e, t, n) => _(e, m(e, t, n)), m = (e, t, i) => {
	process.platform === "win32" && (e += ".cmd");
	let a = n.join(s, e);
	return process.platform === "win32" ? r.spawnSync(`"${a}"`, i, {
		stdio: "inherit",
		cwd: t,
		shell: !0
	}) : r.spawnSync(a, i, {
		cwd: t,
		stdio: "inherit"
	});
}, h = async (n, r, i) => {
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
	return g(n, r, i);
}, g = async (e, t, n) => process.platform === "win32" && e.endsWith(".cmd") ? _(e, r.spawnSync(`"${e}"`, n, {
	stdio: "inherit",
	cwd: t,
	shell: !0
})) : _(e, r.spawnSync(e, n, {
	cwd: t,
	stdio: "inherit"
})), _ = (e, t) => t.error ? { err: `spawn failed: ${d(t.error)}` } : t.status ? { err: `'${e}' exited with status: ${t.status}` } : {}, v = 4, y = (e) => b(e, 0), b = (e, t) => {
	if (e == null) return "null";
	switch (typeof e) {
		case "string":
		case "number":
		case "boolean": return JSON.stringify(e);
		case "object":
			if (Array.isArray(e)) {
				if (e.length === 0) return "[]";
				if (e.length === 1) {
					let n = b(e[0], t);
					return n === void 0 ? "[]" : `[ ${n} ]`;
				}
				let n = "[\n", r = !1, i = " ".repeat(t);
				for (let a = 0; a < e.length; a++) {
					let o = b(e[a], t + v);
					o !== void 0 && (r && (n += ",\n"), r = !0, n += i, n += " ".repeat(v), n += o);
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
		let s = b(e[n[o]], t + v);
		s !== void 0 && (a && (r += ",\n"), a = !0, r += i, r += " ".repeat(v), r += JSON.stringify(n[o]), r += ": ", r += s);
	}
	return r += "\n", r += i, r += "}", r;
}, x = (e, t) => !!(e.dependencies && t in e.dependencies || e.devDependencies && t in e.devDependencies || e.peerDependencies && t in e.peerDependencies || e.optionalDependencies && t in e.optionalDependencies || e.bundledDependencies && t in e.bundledDependencies), S = (e) => e.split("\r").map((e) => e.trimEnd()).join("\n"), C = (e, t) => {
	let n = e.indexOf(t);
	return n === -1 ? [e, void 0] : [e.substring(0, n), e.substring(n + 1)];
};
//#endregion
export { b as a, f as c, c as d, l as f, y as i, o as l, C as n, h as o, i as p, x as r, p as s, S as t, u };

//# sourceMappingURL=util-jaKMGCTu.js.map