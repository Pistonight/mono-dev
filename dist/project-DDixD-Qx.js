import { _ as e, c as t, g as n, i as r, l as i, r as a, v as o, y as s } from "./plugins-Bv51fYNd.js";
import c from "node:fs";
import l from "node:path";
import u from "node:fs/promises";
//#region src/project/exports.ts
var d = (r, a, s = !1) => {
	if (!a.exports) return { val: { exports: [] } };
	if (typeof a.exports == "string") return { err: "'exports' must be the object form in order for types to be respected" };
	if (a.types) return { err: "'types' field must not be specified in package.json; use exports.<entry>.types" };
	let u = a.exports, d = new Set(a["pistonight/mono-dev"]?.nocompile || []), f = a["pistonight/mono-dev"]?.compile || {}, p = "./src/", m = [];
	for (let a in u) {
		let h = a;
		if (a !== ".") {
			if (!a.startsWith("./")) return { err: "entry name subpath must start with './'" };
			if (h = a.substring(2), h.includes("/")) return { err: "too avoid over-complicated export paths, entry name cannot contain '/' other than the initial './'" };
			if (h.includes(".")) return { err: "entry name cannot contain '.' other than the initial './'" };
		}
		let g = u[a];
		if (typeof g != "string") {
			let n = g.import;
			if (!n) return { err: `object-type 'exports' must be have an 'import' (for entry point '${a}')` };
			if (!n.startsWith("./dist/") || !n.endsWith(".js")) return { err: `object-type 'exports' .import must start with ./${t}/ and end with .js (for entry point '${a}')` };
			let o = "./" + t + "/" + i + "/src" + n.substring(t.length + 2, n.length - 3) + ".d.ts", u = g.types;
			if (u !== o) return { err: `object-type 'exports' .import=${n} must be have .types=${o} (for entry point '${a}')` };
			let d = f[a];
			if (!d) return { err: `object-type 'exports' must have the source specified in mono-dev 'compile' option (for entry point '${a}')` };
			let p = l.join(r, d);
			if (!c.existsSync(p)) return { err: `couldn't find extra compile source ${d} (for entry point '${a}')` };
			s && e(`configured compile entry "${a}": ${d}`), m.push({
				entryName: h,
				sourcePathAbs: p,
				distPathRel: n.substring(t.length + 3),
				distDtsPathRel: u.substring(t.length + 3)
			});
			continue;
		}
		if (a.includes(" ")) return { err: `entry name must not contain space: '${a}'` };
		if (a === "index") return { err: "entry name must not be \"index\", use \".\" instead" };
		if (a === "_dts_") return { err: `entry name must not be "${i}"` };
		if (g.endsWith(".d.ts")) {
			s && o(`skipping raw .d.ts export '${a}'`);
			continue;
		}
		if (d.has(a)) {
			s && o(`skipping nocompile export '${a}'`);
			continue;
		}
		if (!g.match(/\.(c|m)?tsx?$/)) {
			s && o(`skipping non-typescript export '${a}'`);
			continue;
		}
		if (!g.startsWith(p)) return { err: `compiled export path must start with '${p}' (for entry point '${a}')` };
		let _ = g.substring(6), v = l.join(r, g);
		if (!c.existsSync(v)) return { err: `couldn't find compiled export source ${g} (for entry point '${a}')` };
		s && e(`auto-configured entry "${a}": ${g}`);
		let y = _.lastIndexOf(".");
		y === -1 && (n("unexpected: failed to get inSrcPath extension"), process.exit(1));
		let b = _.substring(0, y) + ".js", x = i + "/src/" + _.substring(0, y) + ".d.ts";
		m.push({
			entryName: h,
			sourcePathAbs: v,
			distPathRel: b,
			distDtsPathRel: x
		});
	}
	return m.length ? { val: { exports: m } } : { val: { exports: [] } };
}, f = (e, t) => {
	let n = [];
	try {
		n = c.readFileSync(l.join(t, ".gitignore"), "utf-8").split("\n").map((e) => e.trim()).filter(Boolean);
	} catch {
		n = [];
	}
	let r = e["pistonight/mono-dev"]?.nocheck;
	return r && n.push(...r), n;
}, p = async (e, t) => {
	let n = e["pistonight/mono-dev"] || {};
	if ("importmap" in n && n.importmap === !1) return {};
	let r = await m(l.dirname(l.resolve(t)));
	return r.err ? r : await h(r.val, e, t);
}, m = async (e) => {
	let t = [], n = l.join(e, "src"), r = (e) => e.replace(/[\\/]+$/, "");
	try {
		let e = await u.readdir(n);
		for (let i of e) {
			let e = `${n}/${i}`;
			c.statSync(e).isDirectory() && t.push([r(e), r(`src/${i}`)]);
		}
	} catch {}
	let i = {}, a = RegExp("^src/");
	for (; t.length;) {
		let e = t.pop();
		if (!e) break;
		let [n, o] = e;
		try {
			let e = await u.readdir(n), s = [];
			for (let t of e) {
				let e = `${n}/${t}`;
				if (t.match(/index\.(c|m)?tsx?$/)) {
					i[o.replace(a, "#")] = `./${o}/${t}`, s = [];
					break;
				}
				c.statSync(e).isDirectory() && s.push([r(e), r(`${o}/${t}`)]);
			}
			t.push(...s);
		} catch {}
	}
	return { val: i };
}, h = async (t, n, i) => {
	let o = r(t, 4);
	if (n.imports && r(n.imports, 4) === o) return e("subpath import mapping is up-to-date"), {};
	let c = (await u.readFile(i, "utf-8")).trim(), l = c.split("\n").map((e) => e.trimEnd()), d, f, p;
	if (d = l.indexOf("    \"imports\": {"), d !== -1) if (f = l.indexOf("    },", d + 1), f === -1) {
		if (f = l.indexOf("    }", d + 1), f === -1) return { err: "failed to edit 'imports' in package.json: cannot find end of 'imports' field. Please delete the field manually and retry" };
		p = !0;
	} else p = !1;
	else d = l.indexOf("    \"imports\": {}"), d === -1 ? (d = l.indexOf("    \"imports\": {},"), d === -1 ? (d = f = -1, p = !1) : (f = d, p = !1)) : (f = d, p = !0);
	if (d === -1 && "imports" in n) return { err: "failed to edit 'imports' in package.json: cannot locate 'imports' field. Please delete the field manually and retry" };
	let m;
	if (d !== -1) {
		let e = p ? "" : ",";
		t ? l.splice(d, f - d + 1, `    "imports": ${o}${e}`) : l.splice(d, f - d + 1), m = s(l.join("\n"));
	} else if (t) m = s((c.endsWith("}") ? c.substring(0, c.length - 1) : c).trimEnd() + `,\n    "imports": ${o}\n}`);
	else return e("subpath import mapping is up-to-date"), {};
	let h = { ...n };
	t ? h.imports = t : delete h.imports;
	let g = s(a(h) || "");
	try {
		let e = s(a(JSON.parse(m)) || "");
		if (g !== e) return console.log({
			expectedContent: g,
			actualContent: e
		}), { err: "failed to edit 'imports' in package.json: failed to edit 'imports'. Please delete the field manually and retry" };
	} catch {
		return { err: "failed to edit 'imports' in package.json: failed to edit 'imports': content is not valid JSON after editing. Please delete the field manually and retry" };
	}
	return await u.writeFile(i, m), t ? n.imports = t : delete n.imports, e("updated subpath import mapping"), {};
};
//#endregion
export { f as n, d as r, p as t };

//# sourceMappingURL=project-DDixD-Qx.js.map