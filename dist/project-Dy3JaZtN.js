import { g as e, h as t, m as n, n as r, o as i, p as a, s as o, t as s } from "./util-CgTOXVXw.js";
import c from "node:fs";
import l from "node:path";
import u from "node:fs/promises";
//#region src/project/exports.ts
var d = (e, r, s = !1) => {
	if (!r.exports) return { val: { exports: [] } };
	if (typeof r.exports == "string") return { err: "'exports' must be the object form in order for types to be respected" };
	if (r.types) return { err: "'types' field must not be specified in package.json; use exports.<entry>.types" };
	let u = r.exports, d = new Set(r["pistonight/mono-dev"]?.nocompile || []), f = r["pistonight/mono-dev"]?.compile || {}, p = "./src/", m = [];
	for (let r in u) {
		let h = r;
		if (r !== ".") {
			if (!r.startsWith("./")) return { err: "entry name subpath must start with './'" };
			if (h = r.substring(2), h.includes("/")) return { err: "too avoid over-complicated export paths, entry name cannot contain '/' other than the initial './'" };
			if (h.includes(".")) return { err: "entry name cannot contain '.' other than the initial './'" };
		}
		let g = u[r];
		if (typeof g != "string") {
			let t = g.import;
			if (!t) return { err: `object-type 'exports' must be have an 'import' (for entry point '${r}')` };
			if (!t.startsWith("./dist/") || !t.endsWith(".js")) return { err: `object-type 'exports' .import must start with ./${i}/ and end with .js (for entry point '${r}')` };
			let a = "./" + i + "/" + o + "/src" + t.substring(i.length + 2, t.length - 3) + ".d.ts", u = g.types;
			if (u !== a) return { err: `object-type 'exports' .import=${t} must be have .types=${a} (for entry point '${r}')` };
			let d = f[r];
			if (!d) return { err: `object-type 'exports' must have the source specified in mono-dev 'compile' option (for entry point '${r}')` };
			let p = l.join(e, d);
			if (!c.existsSync(p)) return { err: `couldn't find extra compile source ${d} (for entry point '${r}')` };
			s && n(`configured compile entry "${r}": ${d}`), m.push({
				entryName: h,
				sourcePathAbs: p,
				distPathRel: t.substring(i.length + 3),
				distDtsPathRel: u.substring(i.length + 3)
			});
			continue;
		}
		if (r.includes(" ")) return { err: `entry name must not contain space: '${r}'` };
		if (r === "index") return { err: "entry name must not be \"index\", use \".\" instead" };
		if (r === "_dts_") return { err: `entry name must not be "${o}"` };
		if (g.endsWith(".d.ts")) {
			s && t(`skipping raw .d.ts export '${r}'`);
			continue;
		}
		if (d.has(r)) {
			s && t(`skipping nocompile export '${r}'`);
			continue;
		}
		if (!g.match(/\.(c|m)?tsx?$/)) {
			s && t(`skipping non-typescript export '${r}'`);
			continue;
		}
		if (!g.startsWith(p)) return { err: `compiled export path must start with '${p}' (for entry point '${r}')` };
		let _ = g.substring(6), v = l.join(e, g);
		if (!c.existsSync(v)) return { err: `couldn't find compiled export source ${g} (for entry point '${r}')` };
		s && n(`auto-configured entry "${r}": ${g}`);
		let y = _.lastIndexOf(".");
		y === -1 && (a("unexpected: failed to get inSrcPath extension"), process.exit(1));
		let b = _.substring(0, y) + ".js", x = o + "/src/" + _.substring(0, y) + ".d.ts";
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
}, h = async (t, i, a) => {
	let o = r(t, 4);
	if (i.imports && r(i.imports, 4) === o) return n("subpath import mapping is up-to-date"), {};
	let c = (await u.readFile(a, "utf-8")).trim(), l = c.split("\n").map((e) => e.trimEnd()), d, f, p;
	if (d = l.indexOf("    \"imports\": {"), d !== -1) if (f = l.indexOf("    },", d + 1), f === -1) {
		if (f = l.indexOf("    }", d + 1), f === -1) return { err: "failed to edit 'imports' in package.json: cannot find end of 'imports' field. Please delete the field manually and retry" };
		p = !0;
	} else p = !1;
	else d = l.indexOf("    \"imports\": {}"), d === -1 ? (d = l.indexOf("    \"imports\": {},"), d === -1 ? (d = f = -1, p = !1) : (f = d, p = !1)) : (f = d, p = !0);
	if (d === -1 && "imports" in i) return { err: "failed to edit 'imports' in package.json: cannot locate 'imports' field. Please delete the field manually and retry" };
	let m;
	if (d !== -1) {
		let n = p ? "" : ",";
		t ? l.splice(d, f - d + 1, `    "imports": ${o}${n}`) : l.splice(d, f - d + 1), m = e(l.join("\n"));
	} else if (t) m = e((c.endsWith("}") ? c.substring(0, c.length - 1) : c).trimEnd() + `,\n    "imports": ${o}\n}`);
	else return n("subpath import mapping is up-to-date"), {};
	let h = { ...i };
	t ? h.imports = t : delete h.imports;
	let g = e(s(h) || "");
	try {
		let t = e(s(JSON.parse(m)) || "");
		if (g !== t) return console.log({
			expectedContent: g,
			actualContent: t
		}), { err: "failed to edit 'imports' in package.json: failed to edit 'imports'. Please delete the field manually and retry" };
	} catch {
		return { err: "failed to edit 'imports' in package.json: failed to edit 'imports': content is not valid JSON after editing. Please delete the field manually and retry" };
	}
	return await u.writeFile(a, m), t ? i.imports = t : delete i.imports, n("updated subpath import mapping"), {};
};
//#endregion
export { f as n, d as r, p as t };

//# sourceMappingURL=project-Dy3JaZtN.js.map