import { f as e, h as t, m as n, p as r, t as i } from "./plugins.js";
import a from "node:fs";
import o from "node:path";
import s from "node:child_process";
import c, { reactCompilerPreset as l } from "@vitejs/plugin-react";
import u from "@rolldown/plugin-babel";
import d from "babel-plugin-react-compiler";
import f from "vite-plugin-wasm";
//#region src/config/gen_vite.ts
var p = 4096, m = [
	"@fluentui/react-components",
	"@fluentui/react-icons",
	"@pistonite/celera"
], h = [
	"react",
	"react-dom",
	"@pistonite/celera",
	"i18next",
	"react-i18next",
	"@pistonite/pure",
	"@pistonite/workex"
], g = (e, t) => {
	if (a.existsSync(o.join(t, "vite.config.ts")) || a.existsSync(o.join(t, "vite.config.js"))) return;
	let n = o.join(e, "vite-gen.config.js");
	return a.writeFileSync(n, "import { configure } from \"mono-dev/lib-build-config\"; export default configure({});"), n;
}, _ = (t) => {
	let n = [];
	if (n.push(i()), e(t, "react")) {
		n.push(c());
		let e = l();
		e.preset = () => ({ plugins: [[d, {}]] }), n.push(u({ presets: [e] }));
	}
	return t["pistonight/mono-dev"]?.wasm && n.push(f()), n;
}, v = (e, t) => {
	let i = e["pistonight/mono-dev"]?.["import.meta.env"] || {}, c = { "import.meta.vitest": "undefined" };
	if (i.VERSION) if (typeof i.VERSION == "string") {
		let e = o.resolve(o.dirname(t), i.VERSION), s;
		try {
			s = a.readFileSync(e, "utf-8");
		} catch {
			r(`failed to resolve file for import.meta.env.VERSION: ${e}`), process.exit(1);
		}
		let l;
		try {
			l = JSON.parse(s);
		} catch {
			r(`failed to parse file for import.meta.env.VERSION: ${e}`), process.exit(1);
		}
		let u = String(l.version);
		n("import.meta.env.VERSION: " + u), c["import.meta.env.VERSION"] = JSON.stringify(u);
	} else {
		let t = String(e.version);
		n("import.meta.env.VERSION: " + t), c["import.meta.env.VERSION"] = JSON.stringify(t);
	}
	if (i.COMMIT) {
		let e = s.spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim();
		n("import.meta.env.COMMIT: " + e), c["import.meta.env.COMMIT"] = JSON.stringify(e);
	}
	return c;
}, y = (e, n) => {
	let r = "sourcemap" in n ? n.sourcemap : !0;
	return e.build ||= {}, "sourcemap" in e.build ? "sourcemap" in n && (t("build.sourcemap is specified in both mono-dev and vite, consider removing one of them"), t("using build.sourcemap as specified in vite config")) : e.build.sourcemap = r, e.build.chunkSizeWarningLimit || (e.build.chunkSizeWarningLimit = p), e.build;
}, b = (e, n) => {
	e.test ||= {};
	let r = "src/**/*.{ts,mts,cts,tsx}";
	return e.test.includeSource ? e.test.includeSource.push(r) : e.test.includeSource = [r], e.test.server || (e.test.server = {}), e.test.server.deps || (e.test.server.deps = {}), e.test.server.deps.inline !== !0 && (e.test.server.deps.inline ? e.test.server.deps.inline.push(...m) : e.test.server.deps.inline = m), n.jsdom && (e.test.environment ? (t("test.environment is specified in vite and jsdom is specified in mono-dev, consider removing one of them"), t("using test.environment as specified in vite config")) : e.test.environment = "jsdom"), e.test;
};
//#endregion
export { b as a, _ as i, y as n, g as o, v as r, h as t };

//# sourceMappingURL=gen_vite.js.map