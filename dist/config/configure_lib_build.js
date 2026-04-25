import { d as e } from "../util-DEsfW8c3.js";
import { r as t } from "../project-u5JulOwA.js";
import { n, t as r } from "../gen_vite-BBOzn5D1.js";
import i from "node:fs";
import a from "node:path";
import { defineConfig as o } from "vite";
//#region src/config/configure_lib_build.ts
var s = () => {
	let s = e(), l = a.dirname(s), u = JSON.parse(i.readFileSync(s, "utf-8")), d = u["pistonight/mono-dev"] || {}, f = "sourcemap" in d ? d.sourcemap : !0, p = t(l, u);
	"err" in p && (console.error("[mono] failed to parse exports: " + p.err), process.exit(1));
	let { exports: m } = p.val, h = new Set(d.external || []);
	if (u.dependencies) for (let e in u.dependencies) c(l, e, h);
	if (u.peerDependencies) for (let e in u.peerDependencies) c(l, e, h);
	let g = Object.fromEntries(m.map(({ entry_name: e, source_path_abs: t }) => [e === "." ? "index" : e, t])), _ = Object.fromEntries(m.map(({ entry_name: e, dist_path_rel: t }) => [e === "." ? "index" : e, t]));
	return o({
		plugins: n(u),
		define: {
			...r(u),
			"import.meta.vitest": "undefined"
		},
		build: {
			sourcemap: f,
			lib: {
				entry: g,
				fileName: (e, t) => {
					if (!(t in _)) throw Error("unexpected unknown entry point: " + t);
					return _[t];
				},
				formats: ["es"]
			},
			rolldownOptions: { external: Array.from(h) }
		}
	});
}, c = (e, t, n) => {
	n.add(t);
	let r = a.join(e, "node_modules", t), o = a.join(r, "package.json"), s = JSON.parse(i.readFileSync(o, "utf-8"));
	if (!(!s.exports || typeof s.exports == "string")) for (let e in s.exports) e !== "." && (e === "import" || e === "require" || (e.startsWith("./") || (console.error(`[mono] unconventional package exports found for package '${t}'`), process.exit(1)), n.add(t + e.substring(1))));
};
//#endregion
export { s as configure };

//# sourceMappingURL=configure_lib_build.js.map