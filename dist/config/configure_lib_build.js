import { d as e, p as t } from "../util-CZb1AxZa.js";
import { r as n } from "../project-Czg3-_8M.js";
import { n as r, t as i } from "../gen_vite-55xxG9iy.js";
import a from "node:fs";
import o from "node:path";
import { defineConfig as s } from "vite";
//#region src/config/configure_lib_build.ts
var c = () => {
	let c = e(), u = o.dirname(c), d = JSON.parse(a.readFileSync(c, "utf-8")), f = d["pistonight/mono-dev"] || {}, p = "sourcemap" in f ? f.sourcemap : !0, m = n(u, d);
	"err" in m && (t("failed to parse exports: " + m.err), process.exit(1));
	let { exports: h } = m.val, g = new Set(f.external || []);
	if (d.dependencies) for (let e in d.dependencies) l(u, e, g);
	if (d.peerDependencies) for (let e in d.peerDependencies) l(u, e, g);
	let _ = Object.fromEntries(h.map(({ entryName: e, sourcePathAbs: t }) => [e === "." ? "index" : e, t])), v = Object.fromEntries(h.map(({ entryName: e, distPathRel: t }) => [e === "." ? "index" : e, t]));
	return s({
		plugins: r(d),
		define: {
			...i(d),
			"import.meta.vitest": "undefined"
		},
		build: {
			sourcemap: p,
			lib: {
				entry: _,
				fileName: (e, t) => {
					if (!(t in v)) throw Error("unexpected unknown entry point: " + t);
					return v[t];
				},
				formats: ["es"]
			},
			rolldownOptions: { external: Array.from(g) }
		}
	});
}, l = (e, n, r) => {
	r.add(n);
	let i = o.join(e, "node_modules", n), s = o.join(i, "package.json"), c = JSON.parse(a.readFileSync(s, "utf-8"));
	if (!(!c.exports || typeof c.exports == "string")) for (let e in c.exports) e !== "." && (e === "import" || e === "require" || (e.startsWith("./") || (t(`unconventional package exports found for package '${n}'`), process.exit(1)), r.add(n + e.substring(1))));
};
//#endregion
export { c as configure };

//# sourceMappingURL=configure_lib_build.js.map