import { a as e, g as t, h as n, i as r, l as i, m as a, n as o, o as s, p as c, r as l, s as u, u as d } from "../plugins.js";
import { i as f, n as p, r as m, t as h } from "../project.js";
import { o as g } from "../gen_vite.js";
import _ from "node:fs";
import v from "node:path";
import y, { execSync as b } from "node:child_process";
import { load as x } from "js-yaml";
import S from "node:fs/promises";
import { Application as C } from "typedoc";
import { load as w } from "typedoc-theme-oxide";
//#region src/config/gen_eslint.ts
var T = (e) => {
	let n = v.join(e, "eslint.config.js");
	_.writeFileSync(n, t("import { configure } from \"mono-dev/eslint-config\"; export default configure();"));
}, E = async (e, t) => e.private ? await h(e, t) : { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" }, D = (e, n) => {
	let r = [
		"*.yml",
		"*.yaml",
		"*.toml",
		"*.md",
		"*.html",
		"*.hbs",
		"tsconfig*.json",
		"eslint.config.js"
	], i = p(e, n);
	for (let e of i) e.includes("tsconfig") || e.includes("eslint.config.js") || r.push(e);
	_.writeFileSync(v.join(n, ".prettierignore"), t(r.join("\n")));
}, O = async (e) => {
	let r = /* @__PURE__ */ new Set(), i = [], o = [], c = [], l = /* @__PURE__ */ new Set(), u = e["pistonight/mono-dev"]?.nocheck;
	if (u) for (let e of u) {
		if (e.startsWith("/") && !e.substring(1).includes("/")) {
			l.add(e.substring(1));
			continue;
		}
		if (!e.includes("/")) {
			l.add(e);
			continue;
		}
	}
	let d = (await S.readdir(".")).map(async (e) => {
		let t = v.basename(e);
		if (l.has(t)) {
			c.push(e);
			return;
		}
		let a;
		try {
			a = await S.stat(e);
		} catch (t) {
			console.error(t), n(`cannot stat ${e}, skipping`);
			return;
		}
		if (a.isDirectory()) {
			let t = v.join(e, "env.d.ts");
			_.existsSync(t) ? i.push(e) : c.push(e);
			return;
		}
		if (e !== "tsconfig.json" && e.startsWith("tsconfig.") && e.endsWith(".json")) {
			r.add(e);
			return;
		}
		e.match(/\.(c|m)?tsx?$/) && o.push(e);
	});
	await Promise.all(d);
	let p = new Set(r);
	o.length && p.delete("tsconfig._.json"), i.forEach((e) => {
		p.delete(`tsconfig.${e}.json`), p.delete(`tsconfig.${e}__${s}.json`);
	});
	let m = i.map(async (e) => {
		let n = `tsconfig.${e}.json`, r = {
			compilerOptions: {
				...k.compilerOptions,
				tsBuildInfoFile: `node_modules/.mono/tsconfig.${e}.tsbuildinfo`,
				rootDir: "."
			},
			include: [e]
		};
		await S.writeFile(n, t(f(r) || ""));
	}), h = (async () => {
		for (let e of p) a(`removing ${e}`), await S.unlink(e);
	})();
	if (o.length) {
		let e = {
			compilerOptions: {
				...k.compilerOptions,
				tsBuildInfoFile: "node_modules/.mono/tsconfig._.tsbuildinfo",
				rootDir: "."
			},
			include: o
		};
		await S.writeFile("tsconfig._.json", t(f(e) || ""));
	}
	let g = o.length + i.length;
	if (await h, await Promise.all(m), g) {
		let e = i.map((e) => ({ path: `./tsconfig.${e}.json` }));
		o.length && e.push({ path: "./tsconfig._.json" });
		let n = {
			compilerOptions: {},
			files: [],
			references: e
		};
		await S.writeFile("tsconfig.json", t(f(n) || ""));
	} else _.existsSync("tsconfig.json") && (a("removing tsconfig.json"), await S.unlink("tsconfig.json"));
	return {
		projectCount: g,
		nonTsDirectories: c
	};
}, k = { compilerOptions: {
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
	emitDeclarationOnly: !0,
	stableTypeOrdering: !0
} }, A = (e) => {
	let t = i();
	if (t) {
		if (!_.existsSync(e)) _.mkdirSync(e, { recursive: !0 }), _.writeFileSync(`${e}/version`, t);
		else {
			let r = !1;
			try {
				let n = _.readFileSync(`${e}/version`, "utf-8").trim();
				n !== t && (a(`cleaning cache because of version update: ${n} -> ${t}`), r = !0);
			} catch {
				r = !0;
			}
			if (r) {
				_.rmSync(e, {
					recursive: !0,
					force: !0
				}), _.mkdirSync(e, { recursive: !0 });
				try {
					_.writeFileSync(`${e}/version`, t);
				} catch {
					n("failed to write version file, will retry next time");
				}
			}
		}
	}
}, j = async () => {
	let { packageJsonPath: r, rootDir: i, cacheDir: o } = d();
	A(o);
	let u = JSON.parse(_.readFileSync(r, "utf-8")), p = u["pistonight/mono-dev"] || {};
	if (!p.lib) return c("package.json mono dev option 'lib' must be true or \"node\" to build library"), 1;
	let h = await E(u, r);
	if ("err" in h) return c("failed to config package: " + h.err), 1;
	await O(u);
	let y = m(i, u, !0);
	if ("err" in y) return c("failed to parse exports: " + y.err), 1;
	let b = g(o, i);
	b || a("using vite config from project root directly");
	let x = v.join(i, "tsconfig.src.json"), S = JSON.parse(_.readFileSync(x, "utf-8")), C = `${o}/tsconfig.src__${s}.tsbuildinfo`;
	_.existsSync(C) && _.unlinkSync(C);
	let w = p.nodts, T = v.join(i, "tsconfig.src__" + s + ".json");
	if (!w) {
		S.compilerOptions.tsBuildInfoFile = C, S.compilerOptions.noEmit = !1, S.compilerOptions.outDir = v.join(e, s);
		let n = "sourcemap" in p ? !!p.sourcemap : !0;
		S.compilerOptions.declarationMap = n, S.exclude = [
			"**/*.test.ts",
			"**/*.test.mts",
			"**/*.test.cts",
			"**/*.test.tsx"
		], _.writeFileSync(T, t(f(S) || ""));
	}
	let D = b ? l("vite", i, [
		"build",
		"--config",
		b
	]) : l("vite", i, ["build"]);
	if ("err" in D) return c("bundle with vite failed: " + D.err), 21;
	if (w) n("skipping dts since nodts is true");
	else {
		let e = Date.now(), t = l("tsgo", i, ["-p", T]);
		if ("err" in t) return c("dts generation with tsc failed: " + t.err), 31;
		let n = Math.floor(Date.now() - e);
		a(`dts generated (${n}ms)`);
	}
	return 0;
}, M = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = d();
	A(r);
	let i = JSON.parse(_.readFileSync(t, "utf-8")), a = await E(i, t);
	if ("err" in a) return c("failed to config package: " + a.err), 1;
	(await O(i)).projectCount && T(n), D(i, n);
	let o = e.includes("--fix") || e.includes("-f");
	if (o) {
		if (!F(n, r, o)) return 51;
		if (!P(n, r, o)) return 41;
		if (!N(n)) return 31;
	} else {
		if (!N(n)) return 31;
		if (!P(n, r, o)) return 41;
		if (!F(n, r, o)) return 51;
	}
	return 0;
}, N = (e) => {
	let t = Date.now();
	if ("err" in l("tsgo", e, ["--build", "--pretty"])) return c("typeck failed!"), !1;
	let n = Math.floor(Date.now() - t);
	return a(`typeck passed (${n}ms)`), !0;
}, P = (e, t, n) => {
	let r = [
		".",
		"--color",
		"--report-unused-disable-directives",
		"--max-warnings=0",
		"--cache",
		"--cache-location",
		v.join(t, ".eslint-cache")
	];
	n && r.push("--fix");
	let i = Date.now();
	if ("err" in l("eslint", e, r)) return c("eslint failed!"), !1;
	let o = Math.floor(Date.now() - i);
	return a(`eslint passed (${o}ms)`), !0;
}, F = (e, t, n) => {
	let r = v.join(e, ".prettierignore"), i = v.join(t, ".prettier-cache"), o = v.join(u, "bin", "prettier-wrapper.js"), s = Date.now(), l = y.spawnSync(process.argv[0], [
		o,
		r,
		i,
		n ? "-f" : "-c"
	], {
		cwd: e,
		stdio: "pipe"
	});
	if (l.error) return c("failed to spawn prettier: " + l.error), !1;
	if (l.status) {
		let e = l.stderr.toString("utf-8").trim();
		return console.warn(e.split("\n").map((e) => (e.startsWith("[warn]") && (e = e.substring(6)), e.replace("Run Prettier with --write to fix.", "").trimEnd())).join("\n")), c("prettier failed!"), !1;
	}
	let d = Math.floor(Date.now() - s);
	return a(`prettier passed (${d}ms)`), !0;
}, I = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = d();
	A(r);
	let i = JSON.parse(_.readFileSync(t, "utf-8")), o = await E(i, t);
	return "err" in o ? (c("failed to config package: " + o.err), 1) : ((await O(i)).projectCount ? T(n) : a("not generating eslint config because no typescript directories exist"), a("config generated"), 0);
}, L = async (e) => {
	let t = e.includes("--json"), { packageJsonPath: n, rootDir: r, cacheDir: i } = d();
	A(i);
	let a = JSON.parse(_.readFileSync(n, "utf-8")), o = await E(a, n);
	if ("err" in o) return c("failed to config package: " + o.err), 1;
	if (!(await O(a)).projectCount) return c("no typescript directory, cannot generate doc"), 1;
	let s = m(r, a, !0);
	if ("err" in s) return c("failed to parse exports: " + s.err), 1;
	let { exports: l } = s.val;
	if (!l.length) return c("exports are empty, cannot generate doc"), 1;
	let u = v.join(r, "tsconfig.src.json"), f = {
		entryPoints: l.map(({ sourcePathAbs: e }) => e),
		entryPointStrategy: "resolve",
		out: v.join(r, t ? "docs.json" : "docs"),
		theme: "oxide",
		plugin: [w],
		tsconfig: u,
		highlightLanguages: [
			"typescript",
			"css",
			"rust",
			"bash",
			"tsx"
		]
	}, p = await C.bootstrapWithPlugins(f), h = await p.convert();
	return h ? (t ? await p.generateJson(h, f.out) : await p.generateDocs(h, f.out), 0) : (c("failed to process project with typedoc"), 61);
}, R = async (r) => {
	let i = r.includes("-n") || r.includes("--dry-run"), { rootDir: l, packageJsonPath: u, cacheDir: f } = d();
	_.existsSync(f) || _.mkdirSync(f, { recursive: !0 });
	let p = v.join(f, "pnpm-pack.temp.tgz");
	if ((await o("pnpm", l, [
		"pack",
		"--out",
		p
	])).err) return c("pnpm pack failed!"), 81;
	let h = v.join(f, "pnpm-pack.temp");
	if (_.existsSync(h) && _.rmSync(h, {
		recursive: !0,
		force: !0
	}), _.mkdirSync(h, { recursive: !0 }), (await o("tar", h, ["-xzf", "../pnpm-pack.temp.tgz"])).err) return c("tgz extract failed!"), 91;
	let g = v.join(h, "package", "package.json"), y = JSON.parse(_.readFileSync(g, "utf8")), b = JSON.parse(_.readFileSync(u, "utf8")), x = !!y["pistonight/mono-dev"]?.publish;
	delete y["pistonight/mono-dev"], delete y.private;
	let S = m(l, b);
	if ("err" in S) return c("failed to parse exports: " + S.err), 1;
	if (y.exports) {
		if (typeof y.exports == "string") return c("failed to parse exports: 'exports' field must be an object"), 1;
		let t = b["pistonight/mono-dev"]?.compile || {};
		for (let { entryName: n, distPathRel: r, distDtsPathRel: i } of S.val.exports) {
			let a = n === "." ? "." : "./" + n;
			a in t || (y.exports[a] = {
				import: "./" + e + "/" + r,
				types: "./" + e + "/" + i
			});
		}
	}
	if (y.imports) for (let t in y.imports) {
		if (!t.startsWith("#")) continue;
		let n = y.imports[t];
		if (!n.startsWith("./src") || !n.match(/\.(c|m)?tsx?$/)) continue;
		let r = n.lastIndexOf("."), i = n.substring(2, r), a = "./" + e + "/" + s + "/" + i + ".d.ts";
		y.imports[t] = a;
	}
	let C = !0;
	if (y.files) {
		for (let e in y.files) if (e.startsWith("dist")) {
			n("not adding 'dist/**/*' to files since there are dist paths specified in original package.json"), C = !1;
			break;
		}
	}
	C && (a("adding 'dist/**/*' to files in package.json"), y.files ? y.files.push("dist/**/*") : y.files = ["dist/**/*"]), y.devDependencies && z(y.devDependencies), _.writeFileSync(g, t(JSON.stringify(y, void 0, 2)));
	let w = v.join(h, "package", "dist");
	_.existsSync(w) && _.rmSync(w, {
		recursive: !0,
		force: !0
	}), _.cpSync(v.join(l, "dist"), w, { recursive: !0 });
	let T = v.join(f, "pnpm-packed.tgz");
	return (await o("tar", f, [
		"-czf",
		"pnpm-packed.tgz",
		"-C",
		"pnpm-pack.temp",
		"package"
	])).err ? (c("tgz creation failed!"), 91) : (a("unpacked at: node_modules/.mono/pnpm-pack.temp/package"), a("packed at: " + T), i ? (a("dry-run, stopping"), 0) : x ? (await o("pnpm", l, [
		"publish",
		T,
		"--access",
		"public"
	])).err ? (c("pnpm publish failed!"), 101) : 0 : (c("please set mono-dev option \"publish\": true"), 1));
}, z = (e) => {
	for (let t in e) {
		if (t !== "mono-dev") continue;
		let n = e[t];
		if (typeof n != "string") continue;
		let [r, i] = n.split("#", 2), a = r.toLowerCase();
		!a.startsWith("github:") || !a.endsWith("/mono-dev") || (e[t] = r + "#2ee37c0663f179f4467fc9c19dac9f9cd3c013d0");
	}
}, B = {
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
function V() {
	return b("git ls-files --cached --others --exclude-standard", { encoding: "utf8" }).split("\n").filter((e) => e === "Taskfile.yml" || e.endsWith("/Taskfile.yml"));
}
function H(e, t) {
	let n = t + 1;
	for (; n < e.length && !/^ {2}\S/.test(e[n]);) n++;
	return n;
}
function U(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	if (a === -1) return null;
	let o = H(r, a), s = r.slice(a + 1, o).map((e) => e.trim() === "" ? e : "  " + e), c = [
		r[a],
		...n ? [`    desc: ${n}`] : [],
		"    cmds:",
		...s
	];
	return r.splice(a, o - a, ...c), r.join("\n");
}
function W(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	return a === -1 ? null : (r.splice(a + 1, 0, `    desc: ${n}`), r.join("\n"));
}
function G(e) {
	let t = _.readFileSync(e, "utf8"), r = x(t)?.tasks;
	if (!r || typeof r != "object") return !1;
	let i = t, o = !1;
	for (let [t, s] of Object.entries(r)) {
		if (!s || typeof s != "object" || s.internal || s.desc) continue;
		let r = B[t];
		if (r || (n(`${e}: unknown task "${t}" — add a desc manually`), o = !0), Array.isArray(s)) {
			let s = U(i, t, r ?? null);
			if (s === null) {
				n(`${e}: could not locate task "${t}" in file`), o = !0;
				continue;
			}
			a(`${e}: converted shorthand for "${t}"${r ? " and added desc" : ""}`), i = s;
		} else if (r) {
			let s = W(i, t, r);
			if (s === null) {
				n(`${e}: could not locate task "${t}" in file`), o = !0;
				continue;
			}
			a(`${e}: added desc for "${t}"`), i = s;
		}
	}
	return i !== t && _.writeFileSync(e, i, "utf8"), o;
}
var K = () => {
	let e = V();
	if (e.length === 0) return a("no Taskfile.yml files found"), 0;
	let t = !1;
	for (let n of e) G(n) && (t = !0);
	return +!!t;
}, q = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = d();
	A(r);
	let i = JSON.parse(_.readFileSync(t, "utf-8")), o = await E(i, t);
	if ("err" in o) return c("failed to config package: " + o.err), 1;
	await O(i);
	let s = g(r, n);
	return s || a("using vite config from project root directly"), +!!(s ? l("vitest", n, [
		"--config",
		s,
		...e
	]) : l("vitest", n, e)).err;
}, J = async (e) => {
	e.length || (Y(), process.exit(0));
	let [t, ...n] = e;
	switch (t) {
		case "help":
		case "--help":
		case "?":
		case "-h": return Y(), process.exit(0);
		case "version": return console.log("mono-dev " + i()), process.exit(0);
		case "config": return process.exit(await I(n));
		case "check": return process.exit(await M(n));
		case "build": return process.exit(await j());
		case "test": return process.exit(await q(n));
		case "doc": return process.exit(await L(n));
		case "taskfile": return process.exit(K());
		case "publish":
			if (!n.includes("--skip-build")) {
				let e = await j();
				e && process.exit(e);
			}
			return process.exit(await R(n));
	}
	c("unknown command " + t), Y(), process.exit(1);
}, Y = () => {
	console.log("mono-dev CLI\n  config           Generate typeck and eslint config, for language servers\n  check [-f]       Run typeck, prettier, eslint\n  build            Build library (for bundling app run vite directly)\n  test  ARGS...    Run test (with vitest)\n  doc   [--json]   Build documentation \n  taskfile         Fixup taskfiles\n  publish [-n]     Publish the package (-n for dry-run)\n  version          Print the version\n");
};
//#endregion
export { r as executeShim, J as main };
