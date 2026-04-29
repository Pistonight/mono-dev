import { c as e, d as t, i as n, l as r, o as i, p as a, s as o, t as s, u as c } from "../util-FeSJ31r6.js";
import { n as l, r as u, t as d } from "../project-CZ53RJ4-.js";
import f from "node:fs";
import p from "node:path";
import m, { execSync as h } from "node:child_process";
import g from "node:fs/promises";
import { Application as _ } from "typedoc";
import { load as v } from "typedoc-theme-oxide";
import y from "js-yaml";
//#region src/config/gen_eslint.ts
var b = (e) => {
	let t = p.join(e, "eslint.config.js");
	f.writeFileSync(t, s("import { configure } from \"mono-dev/eslint-config\"; export default configure();"));
}, x = async (e, t) => e.private ? await d(e, t) : { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" }, S = (e, t) => {
	let n = [
		"*.yml",
		"*.yaml",
		"*.toml",
		"*.md",
		"*.html",
		"*.hbs",
		"tsconfig*.json",
		"eslint.config.js"
	], r = l(e, t);
	for (let e of r) e.includes("tsconfig") || e.includes("eslint.config.js") || n.push(e);
	f.writeFileSync(p.join(t, ".prettierignore"), s(n.join("\n")));
}, C = async (e) => {
	let t = /* @__PURE__ */ new Set(), r = [], i = [], o = [], c = /* @__PURE__ */ new Set();
	if (e.nocheck) for (let t of e.nocheck) {
		if (t.startsWith("/") && !t.substring(1).includes("/")) {
			c.add(t.substring(1));
			continue;
		}
		if (!t.includes("/")) {
			c.add(t);
			continue;
		}
	}
	let l = (await g.readdir(".")).map(async (e) => {
		let n = p.basename(e);
		if (c.has(n)) {
			o.push(e);
			return;
		}
		let a;
		try {
			a = await g.stat(e);
		} catch (t) {
			console.error(t), console.warn(`[mono] cannot stat ${e}, skipping`);
			return;
		}
		if (a.isDirectory()) {
			let t = p.join(e, "env.d.ts");
			f.existsSync(t) ? r.push(e) : o.push(e);
			return;
		}
		if (e !== "tsconfig.json" && e.startsWith("tsconfig.") && e.endsWith(".json")) {
			t.add(e);
			return;
		}
		e.match(/\.(c|m)?tsx?$/) && i.push(e);
	});
	await Promise.all(l);
	let u = new Set(t);
	i.length && u.delete("tsconfig._.json"), r.forEach((e) => {
		u.delete(`tsconfig.${e}.json`), u.delete(`tsconfig.${e}__${a}.json`);
	});
	let d = r.map(async (e) => {
		let t = `tsconfig.${e}.json`, r = {
			compilerOptions: {
				...w.compilerOptions,
				tsBuildInfoFile: `node_modules/.mono/tsconfig.${e}.tsbuildinfo`,
				rootDir: "."
			},
			include: [e]
		};
		await g.writeFile(t, s(n(r) || ""));
	}), m = (async () => {
		for (let e of u) console.log(`[mono] removing ${e}`), await g.unlink(e);
	})();
	if (i.length) {
		let e = {
			compilerOptions: {
				...w.compilerOptions,
				tsBuildInfoFile: "node_modules/.mono/tsconfig._.tsbuildinfo",
				rootDir: "."
			},
			include: i
		};
		await g.writeFile("tsconfig._.json", s(n(e) || ""));
	}
	let h = i.length + r.length;
	if (await m, await Promise.all(d), h) {
		let e = r.map((e) => ({ path: `./tsconfig.${e}.json` }));
		i.length && e.push({ path: "./tsconfig._.json" });
		let t = {
			compilerOptions: {},
			files: [],
			references: e
		};
		await g.writeFile("tsconfig.json", s(n(t) || ""));
	} else f.existsSync("tsconfig.json") && (console.log("[mono] removing tsconfig.json"), await g.unlink("tsconfig.json"));
	return {
		projectCount: h,
		nonTsDirectories: o
	};
}, w = { compilerOptions: {
	noEmit: !0,
	composite: !0,
	incremental: !0,
	lib: ["esnext"],
	target: "esnext",
	useDefineForClassFields: !0,
	jsx: "preserve",
	moduleDetection: "force",
	module: "esnext",
	moduleResolution: "bundler",
	typeRoots: [],
	types: [],
	allowImportingTsExtensions: !0,
	resolveJsonModule: !0,
	allowJs: !1,
	checkJs: !1,
	isolatedModules: !0,
	forceConsistentCasingInFileNames: !0,
	strict: !0,
	noImplicitOverride: !0,
	noFallthroughCasesInSwitch: !0,
	skipLibCheck: !0,
	declaration: !0,
	declarationMap: !0,
	emitDeclarationOnly: !0,
	stableTypeOrdering: !0
} }, T = (e) => {
	let t = c();
	if (t) if (!f.existsSync(e)) f.mkdirSync(e, { recursive: !0 }), f.writeFileSync(`${e}/version`, t);
	else {
		let n = !1;
		try {
			let r = f.readFileSync(`${e}/version`, "utf-8").trim();
			r !== t && (console.log(`[mono] cleaning cache because of version update: ${r} -> ${t}`), n = !0);
		} catch {
			n = !0;
		}
		if (n) {
			f.rmSync(e, {
				recursive: !0,
				force: !0
			}), f.mkdirSync(e, { recursive: !0 });
			try {
				f.writeFileSync(`${e}/version`, t);
			} catch {
				console.error("[mono] failed to write version file, will retry next time");
			}
		}
	}
}, E = async (e) => {
	let { packageJsonPath: r, rootDir: i, cacheDir: c } = t();
	T(c);
	let l = JSON.parse(f.readFileSync(r, "utf-8"));
	if (!l["pistonight/mono-dev"]?.lib) return console.error("[mono] package.json mono dev option 'lib' must be true to build library"), 1;
	let d = u(i, l, !0);
	if ("err" in d) return console.error("[mono] failed to parse exports: " + d.err), 1;
	let { dist: m, src: h } = d.val, g = await x(l, r);
	if ("err" in g) return console.error("[mono] failed to config package: " + g.err), 1;
	await C(l);
	let _ = p.join(c, "lib-build.config.js");
	f.writeFileSync(_, "import { configure } from \"mono-dev/lib-build-config\"; export default configure();");
	let v = p.join(i, "tsconfig." + h + ".json"), y = JSON.parse(f.readFileSync(v, "utf-8")), b = `${c}/tsconfig.${h}__${a}.tsbuildinfo`;
	f.existsSync(b) && f.unlinkSync(b), y.compilerOptions.tsBuildInfoFile = b, y.compilerOptions.noEmit = !1, y.compilerOptions.outDir = p.join(m, a), y.exclude = [
		"**/*.test.ts",
		"**/*.test.mts",
		"**/*.test.cts",
		"**/*.test.tsx"
	];
	let S = p.join(i, "tsconfig." + h + "__" + a + ".json");
	f.writeFileSync(S, s(n(y) || ""));
	let w = o("vite", i, [
		"build",
		"--config",
		_
	]);
	if ("err" in w) return console.error("[mono] bundle with vite failed: " + w.err), 21;
	console.log("[mono] generating dts...");
	let E = Date.now(), D = !!l["pistonight/mono-dev"]?.tsc, O = D ? "tsc" : "tsgo";
	D && console.warn("[mono] warning: using tsc instead of tsgo for generating declarations");
	let k = o(O, i, ["-p", S]);
	if ("err" in k) return console.error("[mono] dts generation with tsc failed: " + k.err), 31;
	let A = Math.floor(Date.now() - E);
	return console.log(`[mono] dts generated at ${m}/${a} (${A}ms)`), 0;
}, D = async (e) => {
	let { packageJsonPath: n, rootDir: r, cacheDir: i } = t();
	T(i);
	let a = JSON.parse(f.readFileSync(n, "utf-8")), o = await x(a, n);
	if ("err" in o) return console.error("[mono] failed to config package: " + o.err), 1;
	(await C(a)).projectCount && b(r), S(a, r);
	let s = !!a["pistonight/mono-dev"]?.tsc, c = e.includes("--fix") || e.includes("-f");
	if (c) {
		if (!k(r, i, c)) return 41;
		if (!A(r, i, c)) return 51;
		if (!O(r, s)) return 31;
	} else {
		if (!O(r, s)) return 31;
		if (!k(r, i, c)) return 41;
		if (!A(r, i, c)) return 51;
	}
	return 0;
}, O = (e, t) => {
	let n = Date.now(), r = t ? "tsc" : "tsgo";
	if (t && console.warn("[mono] warning: using tsc instead of tsgo for typeck"), "err" in o(r, e, ["--build", "--pretty"])) return console.error("[mono] typeck failed!"), !1;
	let i = Math.floor(Date.now() - n);
	return console.log(`[mono] typeck passed (${i}ms)`), !0;
}, k = (e, t, n) => {
	let r = [
		".",
		"--color",
		"--report-unused-disable-directives",
		"--max-warnings=0",
		"--cache",
		"--cache-location",
		p.join(t, ".eslint-cache")
	];
	n && r.push("--fix");
	let i = Date.now();
	if ("err" in o("eslint", e, r)) return console.error("[mono] eslint failed!"), !1;
	let a = Math.floor(Date.now() - i);
	return console.log(`[mono] eslint passed (${a}ms)`), !0;
}, A = (e, t, n) => {
	let i = p.join(e, ".prettierignore"), a = p.join(t, ".prettier-cache"), o = p.join(r, "bin", "prettier-wrapper.js"), s = Date.now(), c = m.spawnSync(process.argv[0], [
		o,
		i,
		a,
		n ? "-f" : "-c"
	], {
		cwd: e,
		stdio: "pipe"
	});
	if (c.error) return console.error("[mono] failed to spawn prettier: " + c.error), !1;
	if (c.status) {
		let e = c.stderr.toString("utf-8").trim();
		return console.error(e.split("\n").map((e) => (e.startsWith("[warn]") && (e = e.substring(6)), e.replace("Run Prettier with --write to fix.", "").trimEnd())).join("\n")), console.error("[mono] prettier failed!"), !1;
	}
	let l = Math.floor(Date.now() - s);
	return console.log(`[mono] prettier passed (${l}ms)`), !0;
}, j = async (e) => {
	let { packageJsonPath: n, rootDir: r, cacheDir: i } = t();
	T(i);
	let a = JSON.parse(f.readFileSync(n, "utf-8")), o = await x(a, n);
	return "err" in o ? (console.error("[mono] failed to config package: " + o.err), 1) : ((await C(a)).projectCount ? b(r) : console.log("[mono] not generating eslint config because no typescript directories exist"), console.log("[mono] config generated"), 0);
}, M = async (e) => {
	let n = e.includes("--json"), { packageJsonPath: r, rootDir: i, cacheDir: a } = t();
	T(a);
	let o = JSON.parse(f.readFileSync(r, "utf-8")), s = u(i, o, !0);
	if ("err" in s) return console.error("[mono] failed to parse exports: " + s.err), 1;
	let { src: c, exports: l } = s.val;
	if (!l.length) return console.error("[mono] exports are empty, cannot generate doc"), 1;
	let d = await x(o, r);
	if ("err" in d) return console.error("[mono] failed to config package: " + d.err), 1;
	if (!(await C(o)).projectCount) return console.error("[mono] no typescript directory, cannot generate doc"), 1;
	let m = p.join(i, `tsconfig.${c}.json`), h = {
		entryPoints: l.map(({ source_path_abs: e }) => e),
		entryPointStrategy: "resolve",
		out: p.join(i, n ? "docs.json" : "docs"),
		theme: "oxide",
		plugin: [v],
		tsconfig: m,
		highlightLanguages: [
			"typescript",
			"css",
			"rust",
			"bash",
			"tsx"
		]
	}, g = await _.bootstrapWithPlugins(h), y = await g.convert();
	return y ? (n ? await g.generateJson(y, h.out) : await g.generateDocs(y, h.out), 0) : (console.error("[mono] failed to process project with typedoc"), 61);
}, N = async (e) => {
	let n = e.includes("-n") || e.includes("--dry-run"), { rootDir: r, cacheDir: o } = t();
	if (f.existsSync(o) || f.mkdirSync(o, { recursive: !0 }), (await i("pnpm", r, [
		"pack",
		"--out",
		p.join(o, "pnpm-pack.temp.tgz")
	])).err) return console.error("[mono] pnpm pack failed!"), 81;
	let c = p.join(o, "pnpm-pack.temp");
	if (f.existsSync(c) && f.rmSync(c, {
		recursive: !0,
		force: !0
	}), f.mkdirSync(c, { recursive: !0 }), (await i("tar", c, ["-xzf", "../pnpm-pack.temp.tgz"])).err) return console.error("[mono] tgz extract failed!"), 91;
	let l = p.join(c, "package", "package.json"), d = JSON.parse(f.readFileSync(l, "utf8")), m = !!d["pistonight/mono-dev"]?.publish;
	delete d["pistonight/mono-dev"], delete d.private;
	let h = u(r, d);
	if ("err" in h) return console.error("[mono] failed to parse exports: " + h.err), 1;
	let { dist: g, src: _ } = h.val;
	if (d.imports) for (let e in d.imports) {
		if (!e.startsWith("#")) continue;
		let t = d.imports[e];
		if (!t.startsWith("./" + _) || !t.match(/\.(c|m)?tsx?$/)) continue;
		let n = t.lastIndexOf("."), r = t.substring(2, n), i = "./" + g + "/" + a + "/" + r + ".d.ts";
		d.imports[e] = i;
	}
	f.writeFileSync(l, s(JSON.stringify(d, void 0, 2)));
	let v = p.join(o, "pnpm-packed.tgz");
	return (await i("tar", o, [
		"-czf",
		"pnpm-packed.tgz",
		"-C",
		"pnpm-pack.temp",
		"package"
	])).err ? (console.error("[mono] tgz creation failed!"), 91) : (console.log("[mono] unpacked at: node_modules/.mono/pnpm-pack.temp/package"), console.log("[mono] packed at: " + v), n ? (console.log("[mono] dry-run, stopping"), 0) : m ? (await i("pnpm", r, [
		"publish",
		v,
		"--access",
		"public"
	])).err ? (console.error("[mono] pnpm publish failed!"), 101) : 0 : (console.error("[mono] please set mono-dev option \"publish\": true"), 1));
}, P = {
	"install-cargo-extra-tools": "Install or upgrade extra tools needed for development using cargo onto the system",
	setup: "One-time setup for the project",
	install: "Install or sync project dependencies",
	clean: "Remove temporary outputs",
	upgrade: "Upgrade tools and/or dependencies",
	check: "Run linters to check the code",
	fix: "Fix style issues",
	build: "Build the project",
	"build-doc": "Build the documentation",
	doc: "Build the documentation",
	dev: "Start development server",
	"dev-doc": "Watch and serve documentation",
	"dev-app": "Watch and serve the app",
	test: "Run tests",
	release: "Publish a release",
	publish: "Publish a release"
};
function F() {
	return h("git ls-files --cached --others --exclude-standard", { encoding: "utf8" }).split("\n").filter((e) => e === "Taskfile.yml" || e.endsWith("/Taskfile.yml"));
}
function I(e, t) {
	let n = t + 1;
	for (; n < e.length && !/^ {2}\S/.test(e[n]);) n++;
	return n;
}
function L(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	if (a === -1) return null;
	let o = I(r, a), s = r.slice(a + 1, o).map((e) => e.trim() === "" ? e : "  " + e), c = [
		r[a],
		...n ? [`    desc: ${n}`] : [],
		"    cmds:",
		...s
	];
	return r.splice(a, o - a, ...c), r.join("\n");
}
function R(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	return a === -1 ? null : (r.splice(a + 1, 0, `    desc: ${n}`), r.join("\n"));
}
function z(e) {
	let t = f.readFileSync(e, "utf8"), n = y.load(t)?.tasks;
	if (!n || typeof n != "object") return !1;
	let r = t, i = !1;
	for (let [t, a] of Object.entries(n)) {
		if (!a || typeof a != "object" || a.internal || a.desc) continue;
		let n = P[t];
		if (n || (console.warn(`[mono] ${e}: unknown task "${t}" — add a desc manually`), i = !0), Array.isArray(a)) {
			let a = L(r, t, n ?? null);
			if (a === null) {
				console.warn(`[mono] ${e}: could not locate task "${t}" in file`), i = !0;
				continue;
			}
			console.log(`[mono] ${e}: converted shorthand for "${t}"${n ? " and added desc" : ""}`), r = a;
		} else if (n) {
			let a = R(r, t, n);
			if (a === null) {
				console.warn(`[mono] ${e}: could not locate task "${t}" in file`), i = !0;
				continue;
			}
			console.log(`[mono] ${e}: added desc for "${t}"`), r = a;
		}
	}
	return r !== t && f.writeFileSync(e, r, "utf8"), i;
}
var B = () => {
	let e = F();
	if (e.length === 0) return console.log("[mono] no Taskfile.yml files found"), 0;
	let t = !1;
	for (let n of e) z(n) && (t = !0);
	return +!!t;
}, V = async (e) => {
	let { packageJsonPath: n, rootDir: r, cacheDir: i } = t();
	T(i);
	let a = JSON.parse(f.readFileSync(n, "utf-8")), s = await x(a, n);
	if ("err" in s) return console.error("[mono] failed to config package: " + s.err), 1;
	await C(a);
	let c = p.join(i, "vitest.config.js");
	return f.writeFileSync(c, "import { configure } from \"mono-dev/test-config\"; export default configure();"), +!!o("vitest", r, [
		"--config",
		c,
		...e
	]).err;
}, H = async (e) => {
	e.length || (U(), process.exit(0));
	let [t, ...n] = e;
	switch (t) {
		case "help":
		case "--help":
		case "?":
		case "-h": return U(), process.exit(0);
		case "version": return console.log("mono-dev " + c()), process.exit(0);
		case "config": return process.exit(await j(n));
		case "check": return process.exit(await D(n));
		case "build": return process.exit(await E(n));
		case "test": return process.exit(await V(n));
		case "doc": return process.exit(await M(n));
		case "taskfile": return process.exit(B());
		case "publish": return process.exit(await N(n));
	}
	console.error("[mono] unknown command " + t), U(), process.exit(1);
}, U = () => {
	console.log("mono-dev CLI\n  config           Generate typeck and eslint config, for language servers\n  check [-f]       Run typeck, prettier, eslint\n  build            Build library (for bundling app run vite directly)\n  test  ARGS...    Run test (with vitest)\n  doc   [--json]   Build documentation \n  taskfile         Fixup taskfiles\n  publish [-n]     Publish the package (-n for dry-run)\n  version          Print the version\n");
};
//#endregion
export { e as executeShim, H as main };

//# sourceMappingURL=index.js.map