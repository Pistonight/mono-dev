import { a as e, g as t, h as n, m as r, o as i, p as a } from "./plugins.js";
import o from "node:fs";
import s from "node:path";
import c from "node:fs/promises";
//#region src/util/json.ts
var l = 4, u = (e) => d(e, 0), d = (e, t) => {
	if (e == null) return "null";
	switch (typeof e) {
		case "string":
		case "number":
		case "boolean": return JSON.stringify(e);
		case "object":
			if (Array.isArray(e)) {
				if (e.length === 0) return "[]";
				if (e.length === 1) {
					let n = d(e[0], t);
					return n === void 0 ? "[]" : `[ ${n} ]`;
				}
				let n = "[\n", r = !1, i = " ".repeat(t);
				for (let a = 0; a < e.length; a++) {
					let o = d(e[a], t + l);
					o !== void 0 && (r && (n += ",\n"), r = !0, n += i, n += " ".repeat(l), n += o);
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
		let s = d(e[n[o]], t + l);
		s !== void 0 && (a && (r += ",\n"), a = !0, r += i, r += " ".repeat(l), r += JSON.stringify(n[o]), r += ": ", r += s);
	}
	return r += "\n", r += i, r += "}", r;
}, f = (t, c, l = !1) => {
	if (!c.exports) return { val: { exports: [] } };
	if (typeof c.exports == "string") return { err: "'exports' must be the object form in order for types to be respected" };
	if (c.types) return { err: "'types' field must not be specified in package.json; use exports.<entry>.types" };
	let u = c.exports, d = new Set(c["pistonight/mono-dev"]?.nocompile || []), f = c["pistonight/mono-dev"]?.compile || {}, p = "./src/", m = [];
	for (let c in u) {
		if (d.has(c)) {
			l && n(`skipping nocompile export '${c}'`);
			continue;
		}
		let h = c;
		if (c !== ".") {
			if (!c.startsWith("./")) return { err: "entry name subpath must start with './'" };
			if (h = c.substring(2), h.includes("/")) return { err: "too avoid over-complicated export paths, entry name cannot contain '/' other than the initial './'" };
			if (h.includes(".")) return { err: "entry name cannot contain '.' other than the initial './'" };
		}
		let g = u[c];
		if (typeof g != "string") {
			let n = g.import;
			if (!n) return { err: `object-type 'exports' must be have an 'import' (for entry point '${c}')` };
			if (!n.startsWith("./dist/") || !n.endsWith(".js")) return { err: `object-type 'exports' .import must start with ./${e}/ and end with .js (for entry point '${c}')` };
			let a = "./" + e + "/" + i + "/src" + n.substring(e.length + 2, n.length - 3) + ".d.ts", u = g.types;
			if (u !== a) return { err: `object-type 'exports' .import=${n} must be have .types=${a} (for entry point '${c}')` };
			let d = f[c];
			if (!d) return { err: `object-type 'exports' must have the source specified in mono-dev 'compile' option (for entry point '${c}')` };
			let p = s.join(t, d);
			if (!o.existsSync(p)) return { err: `couldn't find extra compile source ${d} (for entry point '${c}')` };
			l && r(`configured compile entry "${c}": ${d}`), m.push({
				entryName: h,
				sourcePathAbs: p,
				distPathRel: n.substring(e.length + 3),
				distDtsPathRel: u.substring(e.length + 3)
			});
			continue;
		}
		if (c.includes(" ")) return { err: `entry name must not contain space: '${c}'` };
		if (c === "index") return { err: "entry name must not be \"index\", use \".\" instead" };
		if (c === "_dts_") return { err: `entry name must not be "${i}"` };
		if (g.endsWith(".d.ts")) {
			l && n(`skipping raw .d.ts export '${c}'`);
			continue;
		}
		if (!g.match(/\.(c|m)?tsx?$/)) {
			l && n(`skipping non-typescript export '${c}'`);
			continue;
		}
		if (!g.startsWith(p)) return { err: `compiled export path must start with '${p}' (for entry point '${c}')` };
		let _ = g.substring(6), v = s.join(t, g);
		if (!o.existsSync(v)) return { err: `couldn't find compiled export source ${g} (for entry point '${c}')` };
		l && r(`auto-configured entry "${c}": ${g}`);
		let y = _.lastIndexOf(".");
		y === -1 && (a("unexpected: failed to get inSrcPath extension"), process.exit(1));
		let b = _.substring(0, y) + ".js", x = i + "/src/" + _.substring(0, y) + ".d.ts";
		m.push({
			entryName: h,
			sourcePathAbs: v,
			distPathRel: b,
			distDtsPathRel: x
		});
	}
	return m.length ? { val: { exports: m } } : { val: { exports: [] } };
}, p = (e, t) => {
	let n;
	try {
		n = o.readFileSync(s.join(t, ".gitignore"), "utf-8").split("\n").map((e) => e.trim()).filter(Boolean);
	} catch {
		n = [];
	}
	let r = e["pistonight/mono-dev"]?.nocheck;
	return r && n.push(...r), n;
}, m = async (e, t) => {
	let n = e["pistonight/mono-dev"] || {};
	if ("importmap" in n && n.importmap === !1) return {};
	let r = await h(s.dirname(s.resolve(t)));
	return r.err ? r : await g(r.val, e, t);
}, h = async (e) => {
	let t = [], n = s.join(e, "src"), r = (e) => e.replace(/[\\/]+$/, "");
	try {
		let e = await c.readdir(n);
		for (let i of e) {
			let e = `${n}/${i}`;
			o.statSync(e).isDirectory() && t.push([r(e), r(`src/${i}`)]);
		}
	} catch {}
	let i = {}, a = /* @__PURE__ */ RegExp("^src/");
	for (; t.length;) {
		let e = t.pop();
		if (!e) break;
		let [n, s] = e;
		try {
			let e = await c.readdir(n), l = [];
			for (let t of e) {
				let e = `${n}/${t}`;
				if (t.match(/index\.(c|m)?tsx?$/)) {
					i[s.replace(a, "#")] = `./${s}/${t}`, l = [];
					break;
				}
				o.statSync(e).isDirectory() && l.push([r(e), r(`${s}/${t}`)]);
			}
			t.push(...l);
		} catch {}
	}
	return { val: i };
}, g = async (e, n, i) => {
	let a = d(e, 4);
	if (n.imports && d(n.imports, 4) === a) return r("subpath import mapping is up-to-date"), {};
	let o = (await c.readFile(i, "utf-8")).trim(), s = o.split("\n").map((e) => e.trimEnd()), l, f, p;
	if (l = s.indexOf("    \"imports\": {"), l !== -1) {
		if (f = s.indexOf("    },", l + 1), f === -1) {
			if (f = s.indexOf("    }", l + 1), f === -1) return { err: "failed to edit 'imports' in package.json: cannot find end of 'imports' field. Please delete the field manually and retry" };
			p = !0;
		} else p = !1;
	} else l = s.indexOf("    \"imports\": {}"), l === -1 ? (l = s.indexOf("    \"imports\": {},"), l === -1 ? (l = f = -1, p = !1) : (f = l, p = !1)) : (f = l, p = !0);
	if (l === -1 && "imports" in n) return { err: "failed to edit 'imports' in package.json: cannot locate 'imports' field. Please delete the field manually and retry" };
	let m;
	if (l !== -1) {
		let n = p ? "" : ",";
		e ? s.splice(l, f - l + 1, `    "imports": ${a}${n}`) : s.splice(l, f - l + 1), m = t(s.join("\n"));
	} else if (e) {
		let e = o.endsWith("}") ? o.substring(0, o.length - 1) : o;
		m = t(e.trimEnd() + `,\n    "imports": ${a}\n}`);
	} else return r("subpath import mapping is up-to-date"), {};
	let h = { ...n };
	e ? h.imports = e : delete h.imports;
	let g = t(u(h) || "");
	try {
		let e = t(u(JSON.parse(m)) || "");
		if (g !== e) return console.log({
			expectedContent: g,
			actualContent: e
		}), { err: "failed to edit 'imports' in package.json: failed to edit 'imports'. Please delete the field manually and retry" };
	} catch {
		return { err: "failed to edit 'imports' in package.json: failed to edit 'imports': content is not valid JSON after editing. Please delete the field manually and retry" };
	}
	return await c.writeFile(i, m), e ? n.imports = e : delete n.imports, r("updated subpath import mapping"), {};
};
//#endregion
export { u as i, p as n, f as r, m as t };
