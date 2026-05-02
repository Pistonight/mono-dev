import { _ as e, g as t, m as n, v as r } from "../plugins-Bv51fYNd.js";
import { i, n as a, r as o } from "../gen_vite-CaD4Mixq.js";
import { r as s } from "../project-DDixD-Qx.js";
import c from "node:fs";
import l from "node:path";
import { defineConfig as u } from "vite";
//#region src/config/configure_lib_build.ts
var d = async (e) => {
	let t = await e;
	return u(typeof t == "function" ? async (e) => f(e, await t(e)) : async (e) => f(e, t));
}, f = (u, d) => {
	let f = n(), p = l.dirname(f), m = JSON.parse(c.readFileSync(f, "utf-8")), h = m["pistonight/mono-dev"] || {};
	e("injecting lib-build configuration to vite"), d.plugins ? d.plugins.push(...i(m)) : d.plugins = i(m), d.define ? d.define = {
		...o(m, f),
		...d.define
	} : d.define = o(m, f);
	let g = a(d, h), _ = s(p, m);
	"err" in _ && (t("failed to parse exports: " + _.err), process.exit(1));
	let { exports: v } = _.val, y = Object.fromEntries(v.map(({ entryName: e, sourcePathAbs: t }) => [e === "." ? "index" : e, t])), b = Object.fromEntries(v.map(({ entryName: e, distPathRel: t }) => [e === "." ? "index" : e, t]));
	g.lib ? "entry" in g.lib && (t("build.lib.entry must NOT be specified in vite; it is automatically determined based on exports"), process.exit(1)) : g.lib = { entry: y }, "fileName" in g.lib && (t("build.lib.fileName must NOT be specified in vite; it is automatically determined based on exports"), process.exit(1)), g.lib.fileName = (e, t) => {
		if (!(t in b)) throw Error("unexpected unknown entry point: " + t);
		return b[t];
	}, g.lib.formats || (g.lib.formats = ["es"]);
	let x = /* @__PURE__ */ new Set();
	if (m.dependencies) for (let e in m.dependencies) x.add(e);
	if (m.peerDependencies) for (let e in m.peerDependencies) x.add(e);
	if (m.optionalDependencies) for (let e in m.optionalDependencies) x.add(e);
	let S = Array.from(x);
	for (let e of x) S.push(RegExp("^" + e + "/"));
	if (g.rolldownOptions ||= {}, typeof g.rolldownOptions.external == "function") {
		r("build.rolldownOptions.external is a function which is REALLY BAD for perf");
		let e = g.rolldownOptions.external;
		g.rolldownOptions.external = (t, n, r) => {
			for (let e of S) if (typeof e == "string") {
				if (e === t) return !0;
			} else if (t.match(e)) return !0;
			return e(t, n, r);
		};
	} else Array.isArray(g.rolldownOptions.external) ? g.rolldownOptions.external.push(...S) : g.rolldownOptions.external ? g.rolldownOptions.external = [g.rolldownOptions.external, ...S] : g.rolldownOptions.external = S;
	return d;
};
//#endregion
export { d as configure, f as patchUserConfigWithMonodev };

//# sourceMappingURL=configure_lib_build.js.map