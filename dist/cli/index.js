import { c as e, f as t, i as n, l as r, o as i, s as a, t as o, u as s } from "../util-CiOS569a.js";
import { n as c, r as l, t as u } from "../project-Ckb3otWR.js";
import d from "node:fs";
import f from "node:path";
import p, { execSync as m } from "node:child_process";
import h from "node:fs/promises";
import { Application as g } from "typedoc";
import { load as _ } from "typedoc-theme-oxide";
import v from "js-yaml";
//#region src/config/gen_eslint.ts
var y = (e) => {
	let t = f.join(e, "eslint.config.js");
	d.writeFileSync(t, o("import { configure } from \"mono-dev/eslint-config\"; export default configure();"));
}, b = async (e, t) => e.private ? await u(e, t) : { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" }, x = (e, t) => {
	let n = [
		"*.yml",
		"*.yaml",
		"*.toml",
		"*.md",
		"*.html",
		"*.hbs",
		"tsconfig*.json",
		"eslint.config.js"
	], r = c(e, t);
	for (let e of r) e.includes("tsconfig") || e.includes("eslint.config.js") || n.push(e);
	d.writeFileSync(f.join(t, ".prettierignore"), o(n.join("\n")));
}, S = async (e) => {
	let r = /* @__PURE__ */ new Set(), i = [], a = [], s = [], c = /* @__PURE__ */ new Set();
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
	let l = (await h.readdir(".")).map(async (e) => {
		let t = f.basename(e);
		if (c.has(t)) {
			s.push(e);
			return;
		}
		let n;
		try {
			n = await h.stat(e);
		} catch (t) {
			console.error(t), console.warn(`[mono] cannot stat ${e}, skipping`);
			return;
		}
		if (n.isDirectory()) {
			let t = f.join(e, "env.d.ts");
			d.existsSync(t) ? i.push(e) : s.push(e);
			return;
		}
		if (e !== "tsconfig.json" && e.startsWith("tsconfig.") && e.endsWith(".json")) {
			r.add(e);
			return;
		}
		e.match(/\.(c|m)?tsx?$/) && a.push(e);
	});
	await Promise.all(l);
	let u = new Set(r);
	a.length && u.delete("tsconfig._.json"), i.forEach((e) => {
		u.delete(`tsconfig.${e}.json`), u.delete(`tsconfig.${e}__${t}.json`);
	});
	let p = i.map(async (e) => {
		let t = `tsconfig.${e}.json`, r = {
			compilerOptions: {
				...C.compilerOptions,
				tsBuildInfoFile: `node_modules/.mono/tsconfig.${e}.tsbuildinfo`,
				rootDir: "."
			},
			include: [e]
		};
		await h.writeFile(t, o(n(r) || ""));
	}), m = (async () => {
		for (let e of u) console.log(`[mono] removing ${e}`), await h.unlink(e);
	})();
	if (a.length) {
		let e = {
			compilerOptions: {
				...C.compilerOptions,
				tsBuildInfoFile: "node_modules/.mono/tsconfig._.tsbuildinfo",
				rootDir: "."
			},
			include: a
		};
		await h.writeFile("tsconfig._.json", o(n(e) || ""));
	}
	let g = a.length + i.length;
	if (await m, await Promise.all(p), g) {
		let e = i.map((e) => ({ path: `./tsconfig.${e}.json` }));
		a.length && e.push({ path: "./tsconfig._.json" });
		let t = {
			compilerOptions: {},
			files: [],
			references: e
		};
		await h.writeFile("tsconfig.json", o(n(t) || ""));
	} else d.existsSync("tsconfig.json") && (console.log("[mono] removing tsconfig.json"), await h.unlink("tsconfig.json"));
	return {
		projectCount: g,
		nonTsDirectories: s
	};
}, C = { compilerOptions: {
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
} }, w = (e) => {
	let t = r();
	if (t) if (!d.existsSync(e)) d.mkdirSync(e, { recursive: !0 }), d.writeFileSync(`${e}/version`, t);
	else {
		let n = !1;
		try {
			let r = d.readFileSync(`${e}/version`, "utf-8").trim();
			r !== t && (console.log(`[mono] cleaning cache because of version update: ${r} -> ${t}`), n = !0);
		} catch {
			n = !0;
		}
		if (n) {
			d.rmSync(e, {
				recursive: !0,
				force: !0
			}), d.mkdirSync(e, { recursive: !0 });
			try {
				d.writeFileSync(`${e}/version`, t);
			} catch {
				console.error("[mono] failed to write version file, will retry next time");
			}
		}
	}
}, T = async (e) => {
	let { packageJsonPath: r, rootDir: i, cacheDir: c } = s();
	w(c);
	let u = JSON.parse(d.readFileSync(r, "utf-8"));
	if (!u["pistonight/mono-dev"]?.lib) return console.error("[mono] package.json mono dev option 'lib' must be true to build library"), 1;
	let p = l(i, u, !0);
	if ("err" in p) return console.error("[mono] failed to parse exports: " + p.err), 1;
	let { dist: m, src: h } = p.val, g = await b(u, r);
	if ("err" in g) return console.error("[mono] failed to config package: " + g.err), 1;
	await S(u);
	let _ = f.join(c, "lib-build.config.js");
	d.writeFileSync(_, "import { configure } from \"mono-dev/lib-build-config\"; export default configure();");
	let v = f.join(i, "tsconfig." + h + ".json"), y = JSON.parse(d.readFileSync(v, "utf-8")), x = `${c}/tsconfig.${h}__${t}.tsbuildinfo`;
	d.existsSync(x) && d.unlinkSync(x), y.compilerOptions.tsBuildInfoFile = x, y.compilerOptions.noEmit = !1, y.compilerOptions.outDir = f.join(m, t), y.exclude = [
		"**/*.test.ts",
		"**/*.test.mts",
		"**/*.test.cts",
		"**/*.test.tsx"
	];
	let C = f.join(i, "tsconfig." + h + "__" + t + ".json");
	d.writeFileSync(C, o(n(y) || ""));
	let T = a("vite", i, [
		"build",
		"--config",
		_
	]);
	if ("err" in T) return console.error("[mono] bundle with vite failed: " + T.err), 21;
	console.log("[mono] generating dts...");
	let E = Date.now(), D = !!u["pistonight/mono-dev"]?.tsc, O = D ? "tsc" : "tsgo";
	D && console.warn("[mono] warning: using tsc instead of tsgo for generating declarations");
	let k = a(O, i, ["-p", C]);
	if ("err" in k) return console.error("[mono] dts generation with tsc failed: " + k.err), 31;
	let A = Math.floor(Date.now() - E);
	return console.log(`[mono] dts generated at ${m}/${t} (${A}ms)`), 0;
}, E = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = s();
	w(r);
	let i = JSON.parse(d.readFileSync(t, "utf-8")), a = await b(i, t);
	if ("err" in a) return console.error("[mono] failed to config package: " + a.err), 1;
	(await S(i)).projectCount && y(n), x(i, n);
	let o = !!i["pistonight/mono-dev"]?.tsc, c = e.includes("--fix") || e.includes("-f");
	if (c) {
		if (!O(n, r, c)) return 41;
		if (!k(n, r, c)) return 51;
		if (!D(n, o)) return 31;
	} else {
		if (!D(n, o)) return 31;
		if (!O(n, r, c)) return 41;
		if (!k(n, r, c)) return 51;
	}
	return 0;
}, D = (e, t) => {
	let n = Date.now(), r = t ? "tsc" : "tsgo";
	if (t && console.warn("[mono] warning: using tsc instead of tsgo for typeck"), "err" in a(r, e, ["--build", "--pretty"])) return console.error("[mono] typeck failed!"), !1;
	let i = Math.floor(Date.now() - n);
	return console.log(`[mono] typeck passed (${i}ms)`), !0;
}, O = (e, t, n) => {
	let r = [
		".",
		"--color",
		"--report-unused-disable-directives",
		"--max-warnings=0",
		"--cache",
		"--cache-location",
		f.join(t, ".eslint-cache")
	];
	n && r.push("--fix");
	let i = Date.now();
	if ("err" in a("eslint", e, r)) return console.error("[mono] eslint failed!"), !1;
	let o = Math.floor(Date.now() - i);
	return console.log(`[mono] eslint passed (${o}ms)`), !0;
}, k = (t, n, r) => {
	let i = f.join(t, ".prettierignore"), a = f.join(n, ".prettier-cache"), o = f.join(e, "bin", "prettier-wrapper.js"), s = Date.now(), c = p.spawnSync(process.argv[0], [
		o,
		i,
		a,
		r ? "-f" : "-c"
	], {
		cwd: t,
		stdio: "pipe"
	});
	if (c.error) return console.error("[mono] failed to spawn prettier: " + c.error), !1;
	if (c.status) {
		let e = c.stderr.toString("utf-8").trim();
		return console.error(e.split("\n").map((e) => (e.startsWith("[warn]") && (e = e.substring(6)), e.replace("Run Prettier with --write to fix.", "").trimEnd())).join("\n")), console.error("[mono] prettier failed!"), !1;
	}
	let l = Math.floor(Date.now() - s);
	return console.log(`[mono] prettier passed (${l}ms)`), !0;
}, A = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = s();
	w(r);
	let i = JSON.parse(d.readFileSync(t, "utf-8")), a = await b(i, t);
	return "err" in a ? (console.error("[mono] failed to config package: " + a.err), 1) : ((await S(i)).projectCount ? y(n) : console.log("[mono] not generating eslint config because no typescript directories exist"), console.log("[mono] config generated"), 0);
}, j = async (e) => {
	let t = e.includes("--json"), { packageJsonPath: n, rootDir: r, cacheDir: i } = s();
	w(i);
	let a = JSON.parse(d.readFileSync(n, "utf-8")), o = l(r, a, !0);
	if ("err" in o) return console.error("[mono] failed to parse exports: " + o.err), 1;
	let { src: c, exports: u } = o.val;
	if (!u.length) return console.error("[mono] exports are empty, cannot generate doc"), 1;
	let p = await b(a, n);
	if ("err" in p) return console.error("[mono] failed to config package: " + p.err), 1;
	if (!(await S(a)).projectCount) return console.error("[mono] no typescript directory, cannot generate doc"), 1;
	let m = f.join(r, `tsconfig.${c}.json`), h = {
		entryPoints: u.map(({ source_path_abs: e }) => e),
		entryPointStrategy: "resolve",
		out: f.join(r, t ? "docs.json" : "docs"),
		theme: "oxide",
		plugin: [_],
		tsconfig: m,
		highlightLanguages: [
			"typescript",
			"css",
			"rust",
			"bash",
			"tsx"
		]
	}, v = await g.bootstrapWithPlugins(h), y = await v.convert();
	return y ? (t ? await v.generateJson(y, h.out) : await v.generateDocs(y, h.out), 0) : (console.error("[mono] failed to process project with typedoc"), 61);
}, M = async (e) => {
	let n = e.includes("-n") || e.includes("--dry-run"), { rootDir: r, cacheDir: a } = s();
	if (d.existsSync(a) || d.mkdirSync(a, { recursive: !0 }), (await i("pnpm", r, [
		"pack",
		"--out",
		f.join(a, "pnpm-pack.temp.tgz")
	])).err) return console.error("[mono] pnpm pack failed!"), 81;
	let c = f.join(a, "pnpm-pack.temp");
	if (d.existsSync(c) && d.rmSync(c, {
		recursive: !0,
		force: !0
	}), d.mkdirSync(c, { recursive: !0 }), (await i("tar", c, ["-xzf", "../pnpm-pack.temp.tgz"])).err) return console.error("[mono] tgz extract failed!"), 91;
	let u = f.join(c, "package", "package.json"), p = JSON.parse(d.readFileSync(u, "utf8")), m = !!p["pistonight/mono-dev"]?.publish;
	delete p["pistonight/mono-dev"], delete p.private;
	let h = l(r, p);
	if ("err" in h) return console.error("[mono] failed to parse exports: " + h.err), 1;
	let { dist: g, src: _ } = h.val;
	if (p.imports) for (let e in p.imports) {
		if (!e.startsWith("#")) continue;
		let n = p.imports[e];
		if (!n.startsWith("./" + _) || !n.match(/\.(c|m)?tsx?$/)) continue;
		let r = n.lastIndexOf("."), i = n.substring(2, r), a = "./" + g + "/" + t + "/" + i + ".d.ts";
		p.imports[e] = a;
	}
	d.writeFileSync(u, o(JSON.stringify(p, void 0, 2)));
	let v = f.join(a, "pnpm-packed.tgz");
	return (await i("tar", a, [
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
}, N = {
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
function P() {
	return m("git ls-files --cached --others --exclude-standard", { encoding: "utf8" }).split("\n").filter((e) => e === "Taskfile.yml" || e.endsWith("/Taskfile.yml"));
}
function F(e, t) {
	let n = t + 1;
	for (; n < e.length && !/^ {2}\S/.test(e[n]);) n++;
	return n;
}
function I(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	if (a === -1) return null;
	let o = F(r, a), s = r.slice(a + 1, o).map((e) => e.trim() === "" ? e : "  " + e), c = [
		r[a],
		...n ? [`    desc: ${n}`] : [],
		"    cmds:",
		...s
	];
	return r.splice(a, o - a, ...c), r.join("\n");
}
function L(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	return a === -1 ? null : (r.splice(a + 1, 0, `    desc: ${n}`), r.join("\n"));
}
function R(e) {
	let t = d.readFileSync(e, "utf8"), n = v.load(t)?.tasks;
	if (!n || typeof n != "object") return !1;
	let r = t, i = !1;
	for (let [t, a] of Object.entries(n)) {
		if (!a || typeof a != "object" || a.internal || a.desc) continue;
		let n = N[t];
		if (n || (console.warn(`[mono] ${e}: unknown task "${t}" — add a desc manually`), i = !0), Array.isArray(a)) {
			let a = I(r, t, n ?? null);
			if (a === null) {
				console.warn(`[mono] ${e}: could not locate task "${t}" in file`), i = !0;
				continue;
			}
			console.log(`[mono] ${e}: converted shorthand for "${t}"${n ? " and added desc" : ""}`), r = a;
		} else if (n) {
			let a = L(r, t, n);
			if (a === null) {
				console.warn(`[mono] ${e}: could not locate task "${t}" in file`), i = !0;
				continue;
			}
			console.log(`[mono] ${e}: added desc for "${t}"`), r = a;
		}
	}
	return r !== t && d.writeFileSync(e, r, "utf8"), i;
}
var z = () => {
	let e = P();
	if (e.length === 0) return console.log("[mono] no Taskfile.yml files found"), 0;
	let t = !1;
	for (let n of e) R(n) && (t = !0);
	return +!!t;
}, B = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = s();
	w(r);
	let i = JSON.parse(d.readFileSync(t, "utf-8")), o = await b(i, t);
	if ("err" in o) return console.error("[mono] failed to config package: " + o.err), 1;
	await S(i);
	let c = f.join(r, "vitest.config.js");
	return d.writeFileSync(c, "import { configure } from \"mono-dev/test-config\"; export default configure();"), +!!a("vitest", n, [
		"--config",
		c,
		...e
	]).err;
}, V = async (e) => {
	e.length || (H(), process.exit(0));
	let [t, ...n] = e;
	switch (t) {
		case "help":
		case "--help":
		case "?":
		case "-h": return H(), process.exit(0);
		case "version": return console.log("mono-dev " + r()), process.exit(0);
		case "config": return process.exit(await A(n));
		case "check": return process.exit(await E(n));
		case "build": return process.exit(await T(n));
		case "test": return process.exit(await B(n));
		case "doc": return process.exit(await j(n));
		case "taskfile": return process.exit(z());
		case "publish": return process.exit(await M(n));
	}
	console.error("[mono] unknown command " + t), H(), process.exit(1);
}, H = () => {
	console.log("mono-dev CLI\n  config           Generate typeck and eslint config, for language servers\n  check [-f]       Run typeck, prettier, eslint\n  build            Build library (for bundling app run vite directly)\n  test  ARGS...    Run test (with vitest)\n  doc   [--json]   Build documentation \n  taskfile         Fixup taskfiles\n  publish [-n]     Publish the package (-n for dry-run)\n  version          Print the version\n");
};
//#endregion
export { V as main };

//# sourceMappingURL=index.js.map