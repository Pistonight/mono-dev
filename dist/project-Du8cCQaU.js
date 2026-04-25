import { a as e, f as t, n, t as r } from "./util-D7tOSluP.js";
import i from "node:fs";
import a from "node:path";
import o from "node:fs/promises";
//#region src/project/exports.ts
var s = (e, r, o = !1) => {
	if (!r.exports) return { val: {
		dist: "dist",
		src: "src",
		exports: []
	} };
	if (typeof r.exports == "string") return { err: "'exports' must be the object form in order for types to be respected" };
	if (r.types) return { err: "'types' field must not be specified in package.json; use exports.<entry>.types" };
	let s = r.exports, c = "", l = "", u = [];
	for (let r in s) {
		let d = s[r];
		if (typeof d == "string") {
			o && console.warn(`[mono] skipping processing string export ${d}`);
			continue;
		}
		if (r.includes(" ")) return { err: `entry name must not contain space: '${r}'` };
		if (r === "index") return { err: "entry name must not be \"index\", use \".\" instead" };
		if (r === "_dts_") return { err: `entry name must not be "${t}"` };
		if (r !== ".") {
			if (!r.startsWith("./")) return { err: "entry name subpath must start with './'" };
			if (r = r.substring(2), r.includes("/")) return { err: "entry name cannot contain '/' other than the initial './'" };
			if (r.includes(".")) return { err: "entry name cannot contain '.' other than the initial './'" };
		}
		let f = d.import, p = d.types;
		if (!f || !p) return { err: "exports value must be object with \"import\" and \"types\"" };
		if (!f.startsWith("./")) return { err: `import path must start with './' (for entry point '${r}')` };
		if (f = f.substring(2), c) {
			if (!f.startsWith(`${c}/`)) return { err: `dist path must be the same for each entry point, the first is "${c}"; found import path "${f}"` };
			f = f.substring(c.length + 1);
		} else {
			let [e, t] = n(f, "/");
			if (!t) return { err: "import path must be in the format of \"./<dist>/<file>.js\"" };
			c = e.trim(), f = t;
		}
		if (!f.endsWith(".js")) return { err: `import path must end with ".js": ${f} (for entry point '${r}')` };
		if (f = f.substring(0, f.length - 3), !p.startsWith(`./${c}/_dts_/`)) return { err: `types path must be in the format of "./${c}/${t}/<src>/<file>.d.ts"` };
		if (p = p.substring(c.length + t.length + 4), l) {
			if (!p.startsWith(`${l}/`)) return { err: `src path must be the same for each entry point, the first is "${l}"; found type path "${p}"` };
			p = p.substring(l.length + 1);
		} else {
			let [e, r] = n(p, "/");
			if (!r) return { err: `types path must be in the format of "./${c}/${t}/<src>/<file>.d.ts"` };
			l = e.trim(), p = r;
		}
		if (p !== `${f}.d.ts`) return { err: `types path for "./${c}/${f}.js" must be "./${c}/${t}/${l}/${f}.d.ts", found "./${c}/${t}/${l}/${p}"` };
		let m = a.join(e, l, f + ".ts"), h = !1;
		if (!i.existsSync(m) && (m += "x", h = !0, !i.existsSync(m))) return { err: `couldn't find source for export path ./dist/${f}.js, which should be ./${l}/${f}.ts{x}` };
		o && console.log(`[mono] configured entry "${r}": ${l}/${f}.ts${h ? "x" : ""}`), u.push({
			entry_name: r,
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
}, c = (e, t) => {
	let n = [];
	try {
		n = i.readFileSync(a.join(t, ".gitignore"), "utf-8").split("\n").map((e) => e.trim()).filter(Boolean);
	} catch {
		n = [];
	}
	return e.nocheck && n.push(...e.nocheck), n;
}, l = async (e, t) => {
	let n = e["pistonight/mono-dev"] || {};
	if ("importmap" in n && n.importmap === !1) return {};
	if (!u(e)) await f(void 0, e, t);
	else {
		let n = await d(a.dirname(a.resolve(t)), e);
		if (n.err) return n;
		await f(n.val, e, t);
	}
	return {};
}, u = (e) => {
	let t = [], n = e.exports;
	if (!n) return !0;
	if (typeof n == "string") t.push(n);
	else for (let e of Object.values(n)) typeof e == "string" ? t.push(e) : (e.types && t.push(e.types), e.import && t.push(e.import));
	for (let e of t) if (e && !e.endsWith(".d.ts") && (e.endsWith(".ts") || e.endsWith(".tsx") || e.endsWith(".cts") || e.endsWith(".mts") || e.endsWith(".ctsx") || e.endsWith(".mtsx"))) return !1;
	return !0;
}, d = async (e, t) => {
	let n = s(e, t);
	if ("err" in n) return { err: `failed to create subpath imports: ${n.err}` };
	let { src: r } = n.val, a = [];
	try {
		let e = await o.readdir(`./${r}`);
		for (let t of e) {
			let e = `${r}/${t}`;
			i.statSync(e).isDirectory() && a.push(e.replace(/\/+$/, ""));
		}
	} catch {}
	let c = {};
	for (; a.length;) {
		let e = a.pop();
		if (!e) break;
		try {
			let t = await o.readdir(e), n = [];
			for (let r of t) {
				let t = `${e}/${r}`;
				if (r.match(/index\.(c|m)?tsx?$/)) {
					if (t.lastIndexOf(".") === -1) throw Error("unexpected did not find path extension");
					c[e.replace(/^src\//, "#")] = `./${t}`, n = [];
					break;
				}
				i.statSync(t).isDirectory() && n.push(t.replace(/\/+$/, ""));
			}
			a.push(...n);
		} catch {}
	}
	return { val: c };
}, f = async (t, n, i) => {
	let a = e(t, 4);
	if (n.imports && e(n.imports, 4) === a) return console.log("[mono] subpath import mapping is up-to-date"), {};
	let s = (await o.readFile(i, "utf-8")).trim(), c = s.split("\n").map((e) => e.trimEnd()), l = c.indexOf("    \"imports\": {");
	if (l === -1 && "imports" in n) return { err: "failed to edit 'imports' in package.json. Please delete the field manually and retry" };
	if (l === -1) {
		if (t) {
			let e = (s.endsWith("}") ? s.substring(0, s.length - 1) : s).trimEnd() + `,\n    "imports": ${a}\n}`;
			await o.writeFile(i, r(e));
		}
	} else {
		let e = c.indexOf("    },", l + 1), n = ",";
		e === -1 && (e = c.indexOf("    }", l + 1), n = "", e === -1 && (console.error("[mono] failed to edit 'imports' in package.json. Please delete the field manually and retry"), process.exit(1))), t ? c.splice(l, e - l + 1, `    "imports": ${a}${n}`) : c.splice(l, e - l + 1), await o.writeFile(i, r(c.join("\n")));
	}
	return t ? n.imports = t : delete n.imports, console.log("[mono] updated subpath import mapping"), {};
};
//#endregion
export { c as n, s as r, l as t };

//# sourceMappingURL=project-Du8cCQaU.js.map