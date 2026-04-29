import { a as e, i as t, n, p as r, t as i } from "./util-jaKMGCTu.js";
import a from "node:fs";
import o from "node:path";
import s from "node:fs/promises";
//#region src/project/exports.ts
var c = (e, t, i = !1) => {
	if (!t.exports) return { val: {
		dist: "dist",
		src: "src",
		exports: []
	} };
	if (typeof t.exports == "string") return { err: "'exports' must be the object form in order for types to be respected" };
	if (t.types) return { err: "'types' field must not be specified in package.json; use exports.<entry>.types" };
	let s = t.exports, c = "", l = "", u = [];
	for (let t in s) {
		let d = s[t];
		if (typeof d == "string") {
			i && console.warn(`[mono] skipping processing string export ${d}`);
			continue;
		}
		if (t.includes(" ")) return { err: `entry name must not contain space: '${t}'` };
		if (t === "index") return { err: "entry name must not be \"index\", use \".\" instead" };
		if (t === "_dts_") return { err: `entry name must not be "${r}"` };
		if (t !== ".") {
			if (!t.startsWith("./")) return { err: "entry name subpath must start with './'" };
			if (t = t.substring(2), t.includes("/")) return { err: "entry name cannot contain '/' other than the initial './'" };
			if (t.includes(".")) return { err: "entry name cannot contain '.' other than the initial './'" };
		}
		let f = d.import, p = d.types;
		if (!f || !p) return { err: "exports value must be object with \"import\" and \"types\"" };
		if (!f.startsWith("./")) return { err: `import path must start with './' (for entry point '${t}')` };
		if (f = f.substring(2), c) {
			if (!f.startsWith(`${c}/`)) return { err: `dist path must be the same for each entry point, the first is "${c}"; found import path "${f}"` };
			f = f.substring(c.length + 1);
		} else {
			let [e, t] = n(f, "/");
			if (!t) return { err: "import path must be in the format of \"./<dist>/<file>.js\"" };
			c = e.trim(), f = t;
		}
		if (!f.endsWith(".js")) return { err: `import path must end with ".js": ${f} (for entry point '${t}')` };
		if (f = f.substring(0, f.length - 3), !p.startsWith(`./${c}/_dts_/`)) return { err: `types path must be in the format of "./${c}/${r}/<src>/<file>.d.ts"` };
		if (p = p.substring(c.length + r.length + 4), l) {
			if (!p.startsWith(`${l}/`)) return { err: `src path must be the same for each entry point, the first is "${l}"; found type path "${p}"` };
			p = p.substring(l.length + 1);
		} else {
			let [e, t] = n(p, "/");
			if (!t) return { err: `types path must be in the format of "./${c}/${r}/<src>/<file>.d.ts"` };
			l = e.trim(), p = t;
		}
		if (p !== `${f}.d.ts`) return { err: `types path for "./${c}/${f}.js" must be "./${c}/${r}/${l}/${f}.d.ts", found "./${c}/${r}/${l}/${p}"` };
		let m = o.join(e, l, f + ".ts"), h = !1;
		if (!a.existsSync(m) && (m += "x", h = !0, !a.existsSync(m))) return { err: `couldn't find source for export path ./dist/${f}.js, which should be ./${l}/${f}.ts{x}` };
		i && console.log(`[mono] configured entry "${t}": ${l}/${f}.ts${h ? "x" : ""}`), u.push({
			entry_name: t,
			source_path_abs: m,
			dist_path_rel: f + ".js"
		});
	}
	return u.length ? c ? l ? { val: {
		dist: c,
		src: l,
		exports: u
	} } : { err: "src directory cannot be \"\"" } : { err: "dist directory cannot be \"\"" } : { val: {
		dist: "dist",
		src: "src",
		exports: []
	} };
}, l = (e, t) => {
	let n = [];
	try {
		n = a.readFileSync(o.join(t, ".gitignore"), "utf-8").split("\n").map((e) => e.trim()).filter(Boolean);
	} catch {
		n = [];
	}
	return e.nocheck && n.push(...e.nocheck), n;
}, u = async (e, t) => {
	let n = e["pistonight/mono-dev"] || {};
	if ("importmap" in n && n.importmap === !1) return {};
	if (d(e)) {
		let n = await f(o.dirname(o.resolve(t)), e);
		return n.err ? n : await p(n.val, e, t);
	} else return await p(void 0, e, t);
	return {};
}, d = (e) => {
	let t = [], n = e.exports;
	if (!n) return !0;
	if (typeof n == "string") t.push(n);
	else for (let e of Object.values(n)) typeof e == "string" ? t.push(e) : (e.types && t.push(e.types), e.import && t.push(e.import));
	for (let e of t) if (e && !e.endsWith(".d.ts") && (e.endsWith(".ts") || e.endsWith(".tsx") || e.endsWith(".cts") || e.endsWith(".mts") || e.endsWith(".ctsx") || e.endsWith(".mtsx"))) return !1;
	return !0;
}, f = async (e, t) => {
	let n = c(e, t);
	if ("err" in n) return { err: `failed to create subpath imports: ${n.err}` };
	let { src: r } = n.val, i = [];
	try {
		let e = await s.readdir(`./${r}`);
		for (let t of e) {
			let e = `${r}/${t}`;
			a.statSync(e).isDirectory() && i.push(e.replace(/\/+$/, ""));
		}
	} catch {}
	let o = {};
	for (; i.length;) {
		let e = i.pop();
		if (!e) break;
		try {
			let t = await s.readdir(e), n = [];
			for (let r of t) {
				let t = `${e}/${r}`;
				if (r.match(/index\.(c|m)?tsx?$/)) {
					if (t.lastIndexOf(".") === -1) throw Error("unexpected did not find path extension");
					o[e.replace(/^src\//, "#")] = `./${t}`, n = [];
					break;
				}
				a.statSync(t).isDirectory() && n.push(t.replace(/\/+$/, ""));
			}
			i.push(...n);
		} catch {}
	}
	return { val: o };
}, p = async (n, r, a) => {
	let o = e(n, 4);
	if (r.imports && e(r.imports, 4) === o) return console.log("[mono] subpath import mapping is up-to-date"), {};
	let c = (await s.readFile(a, "utf-8")).trim(), l = c.split("\n").map((e) => e.trimEnd()), u, d, f;
	if (u = l.indexOf("    \"imports\": {"), u !== -1) if (d = l.indexOf("    },", u + 1), d === -1) {
		if (d = l.indexOf("    }", u + 1), d === -1) return { err: "failed to edit 'imports' in package.json: cannot find end of 'imports' field. Please delete the field manually and retry" };
		f = !0;
	} else f = !1;
	else u = l.indexOf("    \"imports\": {}"), u === -1 ? (u = l.indexOf("    \"imports\": {},"), u === -1 ? (u = d = -1, f = !1) : (d = u, f = !1)) : (d = u, f = !0);
	if (u === -1 && "imports" in r) return { err: "failed to edit 'imports' in package.json: cannot locate 'imports' field. Please delete the field manually and retry" };
	let p;
	if (u !== -1) {
		let e = f ? "" : ",";
		n ? l.splice(u, d - u + 1, `    "imports": ${o}${e}`) : l.splice(u, d - u + 1), p = i(l.join("\n"));
	} else if (n) p = i((c.endsWith("}") ? c.substring(0, c.length - 1) : c).trimEnd() + `,\n    "imports": ${o}\n}`);
	else return console.log("[mono] subpath import mapping is up-to-date"), {};
	let m = { ...r };
	n ? m.imports = n : delete m.imports;
	let h = i(t(m) || "");
	try {
		let e = i(t(JSON.parse(p)) || "");
		if (h !== e) return console.log({
			expectedContent: h,
			actualContent: e
		}), { err: "failed to edit 'imports' in package.json: failed to edit 'imports'. Please delete the field manually and retry" };
	} catch {
		return { err: "failed to edit 'imports' in package.json: failed to edit 'imports': content is not valid JSON after editing. Please delete the field manually and retry" };
	}
	return await s.writeFile(a, p), n ? r.imports = n : delete r.imports, console.log("[mono] updated subpath import mapping"), {};
};
//#endregion
export { l as n, c as r, u as t };

//# sourceMappingURL=project-D6N976kT.js.map