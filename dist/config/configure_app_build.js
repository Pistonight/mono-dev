import { d as e, f as t, h as n, m as r } from "../util-DuBhmBx3.js";
import { n as i, t as a } from "../gen_vite-7LcxeCZv.js";
import o from "node:fs";
import s from "node:path";
import { defineConfig as c } from "vite";
//#region src/config/configure_app_build.ts
var l = 4096, u = [
	"react",
	"react-dom",
	"@fluentui/react-components",
	"@fluentui/react-icons",
	"@pistonite/pure",
	"@pistonite/celera",
	"@pistonite/workex",
	"i18next",
	"react-i18next"
], d = async (e) => {
	let t = await e;
	return c(typeof t == "function" ? async (e) => f(e, await t(e)) : async (e) => f(e, t));
}, f = (t, s) => {
	let c = e(), d = JSON.parse(o.readFileSync(c, "utf-8")), f = d["pistonight/mono-dev"] || {};
	if (r("injecting mono-dev configuration"), s.plugins ||= [], s.plugins.push(...i(d)), "worker" in f) {
		s.worker ||= {};
		let e = s.worker.plugins;
		s.worker.plugins = () => {
			let t = e ? e() : [];
			return t.push(...i(d)), t;
		}, f.worker !== "default" && (s.worker.format = f.worker);
	}
	s.define ||= {}, s.define = {
		...a(d),
		"import.meta.vitest": "undefined",
		...s.define
	}, s.resolve ||= {}, s.resolve.dedupe || (s.resolve.dedupe = []);
	for (let e of p(d, u)) s.resolve.dedupe.push(e);
	let g = "sourcemap" in f ? f.sourcemap : !0;
	s.build ||= {}, "sourcemap" in s.build ? n("not setting sourcemap option because it is already specified") : s.build.sourcemap = g, s.build.chunkSizeWarningLimit ? n("not setting chunk size warning limit because it is already specified") : s.build.chunkSizeWarningLimit = l, s.build.rolldownOptions || (s.build.rolldownOptions = {}), s.build.rolldownOptions.output || (s.build.rolldownOptions.output = {});
	let _ = s.build.rolldownOptions.output;
	if (Array.isArray(_)) for (let e = 0; e < _.length; e++) _[e] = h(_[e]);
	else s.build.rolldownOptions.output = h(_);
	let v = f.https && t.command === "serve";
	if (s.server ||= {}, v) if (s.server.https) n("not searching for HTTPS config because it is already specified");
	else {
		let e = m();
		if (e) {
			let { key: t, cert: r, hostname: i } = e;
			if (s.server.https = {
				key: t,
				cert: r
			}, i && (s.server.host ? n("not setting server.host to because it is already specified") : s.server.host = i), s.server.hmr) {
				let e = {
					host: i,
					protocol: "wss"
				};
				typeof s.server.hmr == "boolean" ? s.server.hmr = e : s.server.hmr = {
					...s.server.hmr,
					...e
				};
			}
		}
	}
	return s;
}, p = (e, n) => n.filter((n) => t(e, n)), m = () => {
	let e = (e) => {
		try {
			let t = s.join(e, ".cert", "cert.key"), i = s.join(e, ".cert", "cert.pem");
			if (!o.existsSync(t) || !o.existsSync(i)) return;
			let a = "";
			try {
				let e = o.readFileSync(i, "utf-8");
				for (let t of e.split("\n")) {
					let e = t.trim();
					if (e.toLowerCase().startsWith("subject=")) {
						let t = e.substring(8);
						for (let e of t.split(",")) {
							let [t, n] = e.split("=");
							if (t.trim().toLowerCase() === "cn") {
								a = n.trim();
								break;
							}
						}
						break;
					}
				}
			} catch (e) {
				n(`failed to read cert.pem: ${e}`);
			}
			return r(`using HTTPS key and cert from "${e}"`), {
				key: t,
				cert: i,
				hostname: a
			};
		} catch {}
	}, t = e(".");
	if (t || (t = e(".."), t) || (t = e("../.."), t)) return t;
	n("HTTPS key and cert not found, not using HTTPS.");
}, h = (e) => e;
//#endregion
export { d as configure };

//# sourceMappingURL=configure_app_build.js.map