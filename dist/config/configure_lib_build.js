import { d as e, h as t, m as n, p as r } from "../plugins.js";
import { r as i } from "../project.js";
import { a, i as o, n as s, r as c } from "../gen_vite.js";
import l from "node:fs";
import u from "node:path";
import { defineConfig as d } from "vite";
//#region src/config/configure_lib_build.ts
var f = async (e) => {
	let t = await e;
	return d(typeof t == "function" ? async (e) => p(e, await t(e)) : async (e) => p(e, t));
}, p = (d, f) => {
	let p = e(), m = u.dirname(p), h = JSON.parse(l.readFileSync(p, "utf-8")), g = h["pistonight/mono-dev"] || {};
	n("injecting lib-build configuration to vite"), f.plugins ? f.plugins.push(...o(h)) : f.plugins = o(h), f.define = f.define ? {
		...c(h, p),
		...f.define
	} : c(h, p);
	let _ = s(f, g), v = i(m, h);
	"err" in v && (r("failed to parse exports: " + v.err), process.exit(1));
	let { exports: y } = v.val;
	y.length || (r("must define at least one exports in 'exports' field to build library"), process.exit(1));
	let b = Object.fromEntries(y.map(({ entryName: e, sourcePathAbs: t }) => [e === "." ? "index" : e, t])), x = Object.fromEntries(y.map(({ entryName: e, distPathRel: t }) => [e === "." ? "index" : e, t]));
	_.lib ? "entry" in _.lib && (r("build.lib.entry must NOT be specified in vite; it is automatically determined based on exports"), process.exit(1)) : _.lib = { entry: b }, "fileName" in _.lib && (r("build.lib.fileName must NOT be specified in vite; it is automatically determined based on exports"), process.exit(1)), _.lib.fileName = (e, t) => {
		if (!(t in x)) throw Error("unexpected unknown entry point: " + t);
		return x[t];
	}, _.lib.formats || (_.lib.formats = ["es"]);
	let S = /* @__PURE__ */ new Set();
	if (h.dependencies) for (let e in h.dependencies) S.add(e);
	if (h.peerDependencies) for (let e in h.peerDependencies) S.add(e);
	if (h.optionalDependencies) for (let e in h.optionalDependencies) S.add(e);
	let C = Array.from(S);
	for (let e of S) C.push(RegExp("^" + e + "/"));
	if (g.lib === "node" && (C.push(/^node:/), C.push("assert", "buffer", "child_process", "crypto", "fs", "fs/promises", "http", "http2", "https", "inspector", "module", "os", "path", "path/posix", "path/win32", "url", "util", "zlib")), _.rolldownOptions ||= {}, typeof _.rolldownOptions.external == "function") {
		t("build.rolldownOptions.external is a function which is REALLY BAD for perf");
		let e = _.rolldownOptions.external;
		_.rolldownOptions.external = (t, n, r) => {
			for (let e of C) if (typeof e == "string") {
				if (e === t) return !0;
			} else if (t.match(e)) return !0;
			return e(t, n, r);
		};
	} else Array.isArray(_.rolldownOptions.external) ? _.rolldownOptions.external.push(...C) : _.rolldownOptions.external ? _.rolldownOptions.external = [_.rolldownOptions.external, ...C] : _.rolldownOptions.external = C;
	return a(f, g), f;
};
//#endregion
export { f as configure, p as patchUserConfigWithMonodev };
