import { _ as e, d as t, m as n, v as r } from "../plugins-C_LJcWHR.js";
import { a as i, i as a, n as o, r as s, t as c } from "../gen_vite-Bp_RtBC9.js";
import l from "node:fs";
import u from "node:path";
import { defineConfig as d } from "vite";
//#region src/config/configure_app_build.ts
var f = async (e) => {
	let t = await e;
	return d(typeof t == "function" ? async (e) => p(e, await t(e)) : async (e) => p(e, t));
}, p = (u, d) => {
	let f = n(), p = JSON.parse(l.readFileSync(f, "utf-8")), h = p["pistonight/mono-dev"] || {};
	if (e("injecting app-build configuration to vite"), d.plugins ? d.plugins.push(...a(p)) : d.plugins = a(p), d.define ? d.define = {
		...s(p, f),
		...d.define
	} : d.define = s(p, f), "worker" in h) {
		d.worker ||= {};
		let e = d.worker.plugins;
		d.worker.plugins = () => {
			let t = e ? e() : [];
			return t.push(...a(p)), t;
		}, h.worker !== "default" && (d.worker.format = h.worker);
	}
	d.resolve ||= {}, d.resolve.dedupe || (d.resolve.dedupe = []);
	for (let e of t(p, c)) d.resolve.dedupe.push(e);
	if (o(d, h), h.https && u.command === "serve" && !process.env.VITEST) {
		d.server ||= {};
		let e = m();
		if (e) {
			d.server.https || (d.server.https = {});
			let { key: t, cert: n, hostname: i } = e;
			d.server.https.key = t, d.server.https.cert = n, i && d.server.host !== i && (r("overriding server.host to " + i), d.server.host = i), d.server.hmr !== !1 && ((!d.server.hmr || typeof d.server.hmr == "boolean") && (d.server.hmr = {}), i && d.server.hmr.host !== i && (r("overriding server.hmr.host to " + i), d.server.hmr.host = i), d.server.hmr.protocol = "wss");
		}
	}
	return i(d, h), d;
}, m = () => {
	let t = (t) => {
		try {
			let n = u.join(t, ".cert", "cert.key"), i = u.join(t, ".cert", "cert.pem");
			if (!l.existsSync(n) || !l.existsSync(i)) return;
			let a = "";
			try {
				let e = l.readFileSync(i, "utf-8");
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
				r(`failed to read cert.pem: ${e}`);
			}
			return e(`using HTTPS key and cert from "${t}"`), {
				key: n,
				cert: i,
				hostname: a
			};
		} catch {}
	}, n = t(".");
	if (n || (n = t(".."), n) || (n = t("../.."), n)) return n;
	r("HTTPS key and cert not found, not using HTTPS.");
};
//#endregion
export { f as configure };

//# sourceMappingURL=configure_app_build.js.map