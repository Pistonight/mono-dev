import { _ as e, g as t, m as n, v as r } from "../plugins-_000eymq.js";
import { a as i, i as a, n as o, r as s } from "../gen_vite-CRfE_RNt.js";
import { r as c } from "../project-BcNBQbVB.js";
import l from "node:fs";
import u from "node:path";
import { defineConfig as d } from "vite";
//#region src/config/configure_lib_build.ts
var f = async (e) => {
	let t = await e;
	return d(typeof t == "function" ? async (e) => p(e, await t(e)) : async (e) => p(e, t));
}, p = (d, f) => {
	let p = n(), m = u.dirname(p), h = JSON.parse(l.readFileSync(p, "utf-8")), g = h["pistonight/mono-dev"] || {};
	e("injecting lib-build configuration to vite"), f.plugins ? f.plugins.push(...a(h)) : f.plugins = a(h), f.define ? f.define = {
		...s(h, p),
		...f.define
	} : f.define = s(h, p);
	let _ = o(f, g), v = c(m, h);
	"err" in v && (t("failed to parse exports: " + v.err), process.exit(1));
	let { exports: y } = v.val, b = Object.fromEntries(y.map(({ entryName: e, sourcePathAbs: t }) => [e === "." ? "index" : e, t])), x = Object.fromEntries(y.map(({ entryName: e, distPathRel: t }) => [e === "." ? "index" : e, t]));
	_.lib ? "entry" in _.lib && (t("build.lib.entry must NOT be specified in vite; it is automatically determined based on exports"), process.exit(1)) : _.lib = { entry: b }, "fileName" in _.lib && (t("build.lib.fileName must NOT be specified in vite; it is automatically determined based on exports"), process.exit(1)), _.lib.fileName = (e, t) => {
		if (!(t in x)) throw Error("unexpected unknown entry point: " + t);
		return x[t];
	}, _.lib.formats || (_.lib.formats = ["es"]);
	let S = /* @__PURE__ */ new Set();
	if (h.dependencies) for (let e in h.dependencies) S.add(e);
	if (h.peerDependencies) for (let e in h.peerDependencies) S.add(e);
	if (h.optionalDependencies) for (let e in h.optionalDependencies) S.add(e);
	let C = Array.from(S);
	for (let e of S) C.push(RegExp("^" + e + "/"));
	if (_.rolldownOptions ||= {}, typeof _.rolldownOptions.external == "function") {
		r("build.rolldownOptions.external is a function which is REALLY BAD for perf");
		let e = _.rolldownOptions.external;
		_.rolldownOptions.external = (t, n, r) => {
			for (let e of C) if (typeof e == "string") {
				if (e === t) return !0;
			} else if (t.match(e)) return !0;
			return e(t, n, r);
		};
	} else Array.isArray(_.rolldownOptions.external) ? _.rolldownOptions.external.push(...C) : _.rolldownOptions.external ? _.rolldownOptions.external = [_.rolldownOptions.external, ...C] : _.rolldownOptions.external = C;
	return i(f, g), f;
};
//#endregion
export { f as configure, p as patchUserConfigWithMonodev };

//# sourceMappingURL=configure_lib_build.js.map