import { _ as e, g as t, h as n, t as r, v as i } from "./plugins-DS1l0m1k.js";
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
}, _ = (e) => {
	let t = [];
	if (t.push(r()), n(e, "react")) {
		t.push(c());
		let e = l();
		e.preset = () => ({ plugins: [[d, {}]] }), t.push(u({ presets: [e] }));
	}
	return e["pistonight/mono-dev"]?.wasm && t.push(f()), t;
}, v = (n, r) => {
	let i = n["pistonight/mono-dev"]?.["import.meta.env"] || {}, c = { "import.meta.vitest": "undefined" };
	if (i.VERSION) if (typeof i.VERSION == "string") {
		let n = o.resolve(o.dirname(r), i.VERSION), s;
		try {
			s = a.readFileSync(n, "utf-8");
		} catch {
			t(`failed to resolve file for import.meta.env.VERSION: ${n}`), process.exit(1);
		}
		let l;
		try {
			l = JSON.parse(s);
		} catch {
			t(`failed to parse file for import.meta.env.VERSION: ${n}`), process.exit(1);
		}
		let u = String(l.version);
		e("import.meta.env.VERSION: " + u), c["import.meta.env.VERSION"] = JSON.stringify(u);
	} else {
		let t = String(n.version);
		e("import.meta.env.VERSION: " + t), c["import.meta.env.VERSION"] = JSON.stringify(t);
	}
	if (i.COMMIT) {
		let t = s.spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim();
		e("import.meta.env.COMMIT: " + t), c["import.meta.env.COMMIT"] = JSON.stringify(t);
	}
	return c;
}, y = (e, t) => {
	let n = "sourcemap" in t ? t.sourcemap : !0;
	return e.build ||= {}, "sourcemap" in e.build ? "sourcemap" in t && (i("build.sourcemap is specified in both mono-dev and vite, consider removing one of them"), i("using build.sourcemap as specified in vite config")) : e.build.sourcemap = n, e.build.chunkSizeWarningLimit || (e.build.chunkSizeWarningLimit = p), e.build;
}, b = (e, t) => {
	e.test ||= {};
	let n = "src/**/*.{ts,mts,cts,tsx}";
	return e.test.includeSource ? e.test.includeSource.push(n) : e.test.includeSource = [n], e.test.server || (e.test.server = {}), e.test.server.deps || (e.test.server.deps = {}), e.test.server.deps.inline !== !0 && (e.test.server.deps.inline ? e.test.server.deps.inline.push(...m) : e.test.server.deps.inline = m), t.jsdom && (e.test.environment ? (i("test.environment is specified in vite and jsdom is specified in mono-dev, consider removing one of them"), i("using test.environment as specified in vite config")) : e.test.environment = "jsdom"), e.test;
};
//#endregion
export { b as a, _ as i, y as n, g as o, v as r, h as t };

//# sourceMappingURL=gen_vite-CBaoXN8s.js.map