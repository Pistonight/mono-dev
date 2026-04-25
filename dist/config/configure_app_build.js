import { d as e, r as t } from "../util-qhdHhKqo.js";
import { n, t as r } from "../gen_vite-D0rPSI0N.js";
import i from "node:fs";
import a from "node:path";
import { defineConfig as o } from "vite";
//#region src/config/configure_app_build.ts
var s = 4096, c = [
	"@pistonite/pure",
	"@pistonite/celera",
	"@pistonite/workex",
	"i18next",
	"react-i18next"
], l = async (e) => {
	let t = await e;
	return o(typeof t == "function" ? async (e) => u(e, await t(e)) : async (e) => u(e, t));
}, u = (t, a) => {
	let o = e(), l = JSON.parse(i.readFileSync(o, "utf-8")), u = l["pistonight/mono-dev"] || {};
	if (console.log("[mono] injecting mono-dev configuration"), a.plugins ||= [], a.plugins.push(...n(l)), "worker" in u) {
		a.worker ||= {};
		let e = a.worker.plugins;
		a.worker.plugins = () => {
			let t = e ? e() : [];
			return t.push(...n(l)), t;
		}, u.worker !== "default" && (a.worker.format = u.worker);
	}
	a.define ||= {}, a.define = {
		...r(l),
		"import.meta.vitest": "undefined",
		...a.define
	}, a.resolve ||= {}, a.resolve.dedupe || (a.resolve.dedupe = []);
	for (let e of d(l, c)) a.resolve.dedupe.push(e);
	let m = "sourcemap" in u ? u.sourcemap : !0;
	a.build ||= {}, "sourcemap" in a.build ? console.warn("[mono] not setting sourcemap option because it is already specified") : a.build.sourcemap = m, a.build.chunkSizeWarningLimit ? console.warn("[mono] not setting chunk size warning limit because it is already specified") : a.build.chunkSizeWarningLimit = s, a.build.rolldownOptions || (a.build.rolldownOptions = {}), a.build.rolldownOptions.output || (a.build.rolldownOptions.output = {});
	let h = a.build.rolldownOptions.output;
	if (Array.isArray(h)) for (let e = 0; e < h.length; e++) h[e] = p(h[e]);
	else a.build.rolldownOptions.output = p(h);
	let g = u.https && t.command === "serve";
	if (a.server ||= {}, g) if (a.server.https) console.warn("[mono] not searching for HTTPS config because it is already specified");
	else {
		let e = f();
		if (e) {
			let { key: t, cert: n, hostname: r } = e;
			if (a.server.https = {
				key: t,
				cert: n
			}, r && (a.server.host ? console.warn("[mono] not setting server.host to because it is already specified") : a.server.host = r), a.server.hmr) {
				let e = { host: r };
				typeof a.server.hmr == "boolean" ? a.server.hmr = e : a.server.hmr = {
					...a.server.hmr,
					...e
				};
			}
		}
	}
	return a;
}, d = (e, n) => n.filter((n) => t(e, n)), f = () => {
	let e = (e) => {
		try {
			let t = a.join(e, ".cert", "cert.key"), n = a.join(e, ".cert", "cert.pem");
			if (!i.existsSync(t) || !i.existsSync(n)) return;
			let r = "";
			try {
				let e = i.readFileSync(n, "utf-8");
				for (let t of e.split("\n")) {
					let e = t.trim();
					if (e.toLowerCase().startsWith("subject=")) {
						let t = e.substring(8);
						for (let e of t.split(",")) {
							let [t, n] = e.split("=");
							if (t.trim().toLowerCase() === "cn") {
								r = n.trim();
								break;
							}
						}
						break;
					}
				}
			} catch (e) {
				console.warn(`[mono] failed to read cert.pem: ${e}`);
			}
			return console.log(`[mono] using HTTPS key and cert from "${e}"`), {
				key: t,
				cert: n,
				hostname: r
			};
		} catch {}
	}, t = e(".");
	if (t || (t = e(".."), t) || (t = e("../.."), t)) return t;
	console.warn("[mono] HTTPS key and cert not found, not using HTTPS.");
}, p = (e) => e.manualChunks ? (console.warn("[mono] not injecting code splitting because 'manualChunks' is specified"), e) : ("codeSplitting" in e && typeof e.codeSplitting != "object" && console.warn("[mono] not injecting code splitting because 'codeSplitting' is specified and not an object"), e);
//#endregion
export { l as configure };

//# sourceMappingURL=configure_app_build.js.map