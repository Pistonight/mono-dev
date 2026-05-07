import { _ as e, a as t, c as n, f as r, g as i, l as a, o, p as s, r as c, s as l, u, v as d, y as f } from "../plugins.js";
import { o as p } from "../gen_vite.js";
import { n as m, r as h, t as g } from "../project.js";
import _ from "node:fs";
import v from "node:path";
import y, { execSync as b } from "node:child_process";
import x from "js-yaml";
import S from "node:fs/promises";
import { Application as C } from "typedoc";
import { load as w } from "typedoc-theme-oxide";
//#region src/config/gen_eslint.ts
var T = (e) => {
	let t = v.join(e, "eslint.config.js");
	_.writeFileSync(t, f("import { configure } from \"mono-dev/eslint-config\"; export default configure();"));
}, E = async (e, t) => e.private ? await g(e, t) : { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" }, D = (e, t) => {
	let n = [
		"*.yml",
		"*.yaml",
		"*.toml",
		"*.md",
		"*.html",
		"*.hbs",
		"tsconfig*.json",
		"eslint.config.js"
	], r = m(e, t);
	for (let e of r) e.includes("tsconfig") || e.includes("eslint.config.js") || n.push(e);
	_.writeFileSync(v.join(t, ".prettierignore"), f(n.join("\n")));
}, O = async (t) => {
	let n = /* @__PURE__ */ new Set(), r = [], i = [], o = [], s = /* @__PURE__ */ new Set(), l = t["pistonight/mono-dev"]?.nocheck;
	if (l) for (let e of l) {
		if (e.startsWith("/") && !e.substring(1).includes("/")) {
			s.add(e.substring(1));
			continue;
		}
		if (!e.includes("/")) {
			s.add(e);
			continue;
		}
	}
	let u = (await S.readdir(".")).map(async (e) => {
		let t = v.basename(e);
		if (s.has(t)) {
			o.push(e);
			return;
		}
		let a;
		try {
			a = await S.stat(e);
		} catch (t) {
			console.error(t), d(`cannot stat ${e}, skipping`);
			return;
		}
		if (a.isDirectory()) {
			let t = v.join(e, "env.d.ts");
			_.existsSync(t) ? r.push(e) : o.push(e);
			return;
		}
		if (e !== "tsconfig.json" && e.startsWith("tsconfig.") && e.endsWith(".json")) {
			n.add(e);
			return;
		}
		e.match(/\.(c|m)?tsx?$/) && i.push(e);
	});
	await Promise.all(u);
	let p = new Set(n);
	i.length && p.delete("tsconfig._.json"), r.forEach((e) => {
		p.delete(`tsconfig.${e}.json`), p.delete(`tsconfig.${e}__${a}.json`);
	});
	let m = r.map(async (e) => {
		let t = `tsconfig.${e}.json`, n = {
			compilerOptions: {
				...k.compilerOptions,
				tsBuildInfoFile: `node_modules/.mono/tsconfig.${e}.tsbuildinfo`,
				rootDir: "."
			},
			include: [e]
		};
		await S.writeFile(t, f(c(n) || ""));
	}), h = (async () => {
		for (let t of p) e(`removing ${t}`), await S.unlink(t);
	})();
	if (i.length) {
		let e = {
			compilerOptions: {
				...k.compilerOptions,
				tsBuildInfoFile: "node_modules/.mono/tsconfig._.tsbuildinfo",
				rootDir: "."
			},
			include: i
		};
		await S.writeFile("tsconfig._.json", f(c(e) || ""));
	}
	let g = i.length + r.length;
	if (await h, await Promise.all(m), g) {
		let e = r.map((e) => ({ path: `./tsconfig.${e}.json` }));
		i.length && e.push({ path: "./tsconfig._.json" });
		let t = {
			compilerOptions: {},
			files: [],
			references: e
		};
		await S.writeFile("tsconfig.json", f(c(t) || ""));
	} else _.existsSync("tsconfig.json") && (e("removing tsconfig.json"), await S.unlink("tsconfig.json"));
	return {
		projectCount: g,
		nonTsDirectories: o
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
	declarationMap: !0,
	emitDeclarationOnly: !0,
	stableTypeOrdering: !0
} }, A = (t) => {
	let n = r();
	if (n) if (!_.existsSync(t)) _.mkdirSync(t, { recursive: !0 }), _.writeFileSync(`${t}/version`, n);
	else {
		let r = !1;
		try {
			let i = _.readFileSync(`${t}/version`, "utf-8").trim();
			i !== n && (e(`cleaning cache because of version update: ${i} -> ${n}`), r = !0);
		} catch {
			r = !0;
		}
		if (r) {
			_.rmSync(t, {
				recursive: !0,
				force: !0
			}), _.mkdirSync(t, { recursive: !0 });
			try {
				_.writeFileSync(`${t}/version`, n);
			} catch {
				d("failed to write version file, will retry next time");
			}
		}
	}
}, j = async () => {
	let { packageJsonPath: t, rootDir: r, cacheDir: l } = s();
	A(l);
	let u = JSON.parse(_.readFileSync(t, "utf-8")), m = u["pistonight/mono-dev"] || {};
	if (!m.lib) return i("package.json mono dev option 'lib' must be true to build library"), 1;
	let g = await E(u, t);
	if ("err" in g) return i("failed to config package: " + g.err), 1;
	await O(u);
	let y = h(r, u, !0);
	if ("err" in y) return i("failed to parse exports: " + y.err), 1;
	let b = p(l, r);
	b || e("using vite config from project root directly");
	let x = v.join(r, "tsconfig.src.json"), S = JSON.parse(_.readFileSync(x, "utf-8")), C = `${l}/tsconfig.src__${a}.tsbuildinfo`;
	_.existsSync(C) && _.unlinkSync(C);
	let w = m.nodts, T = v.join(r, "tsconfig.src__" + a + ".json");
	w || (S.compilerOptions.tsBuildInfoFile = C, S.compilerOptions.noEmit = !1, S.compilerOptions.outDir = v.join(n, a), S.exclude = [
		"**/*.test.ts",
		"**/*.test.mts",
		"**/*.test.cts",
		"**/*.test.tsx"
	], _.writeFileSync(T, f(c(S) || "")));
	let D = b ? o("vite", r, [
		"build",
		"--config",
		b
	]) : o("vite", r, ["build"]);
	if ("err" in D) return i("bundle with vite failed: " + D.err), 21;
	if (w) d("skipping dts since nodts is true");
	else {
		let t = Date.now(), n = !!u["pistonight/mono-dev"]?.tsc, a = n ? "tsc" : "tsgo";
		n && d("warning: using tsc instead of tsgo for generating declarations");
		let s = o(a, r, ["-p", T]);
		if ("err" in s) return i("dts generation with tsc failed: " + s.err), 31;
		e(`dts generated (${Math.floor(Date.now() - t)}ms)`);
	}
	return 0;
}, M = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = s();
	A(r);
	let a = JSON.parse(_.readFileSync(t, "utf-8")), o = await E(a, t);
	if ("err" in o) return i("failed to config package: " + o.err), 1;
	(await O(a)).projectCount && T(n), D(a, n);
	let c = !!a["pistonight/mono-dev"]?.tsc, l = e.includes("--fix") || e.includes("-f");
	if (l) {
		if (!P(n, r, l)) return 41;
		if (!F(n, r, l)) return 51;
		if (!N(n, c)) return 31;
	} else {
		if (!N(n, c)) return 31;
		if (!P(n, r, l)) return 41;
		if (!F(n, r, l)) return 51;
	}
	return 0;
}, N = (t, n) => {
	let r = Date.now(), a = n ? "tsc" : "tsgo";
	return n && d("warning: using tsc instead of tsgo for typeck"), "err" in o(a, t, ["--build", "--pretty"]) ? (i("typeck failed!"), !1) : (e(`typeck passed (${Math.floor(Date.now() - r)}ms)`), !0);
}, P = (t, n, r) => {
	let a = [
		".",
		"--color",
		"--report-unused-disable-directives",
		"--max-warnings=0",
		"--cache",
		"--cache-location",
		v.join(n, ".eslint-cache")
	];
	r && a.push("--fix");
	let s = Date.now();
	return "err" in o("eslint", t, a) ? (i("eslint failed!"), !1) : (e(`eslint passed (${Math.floor(Date.now() - s)}ms)`), !0);
}, F = (t, n, r) => {
	let a = v.join(t, ".prettierignore"), o = v.join(n, ".prettier-cache"), s = v.join(u, "bin", "prettier-wrapper.js"), c = Date.now(), l = y.spawnSync(process.argv[0], [
		s,
		a,
		o,
		r ? "-f" : "-c"
	], {
		cwd: t,
		stdio: "pipe"
	});
	if (l.error) return i("failed to spawn prettier: " + l.error), !1;
	if (l.status) {
		let e = l.stderr.toString("utf-8").trim();
		return console.warn(e.split("\n").map((e) => (e.startsWith("[warn]") && (e = e.substring(6)), e.replace("Run Prettier with --write to fix.", "").trimEnd())).join("\n")), i("prettier failed!"), !1;
	}
	return e(`prettier passed (${Math.floor(Date.now() - c)}ms)`), !0;
}, I = async (t) => {
	let { packageJsonPath: n, rootDir: r, cacheDir: a } = s();
	A(a);
	let o = JSON.parse(_.readFileSync(n, "utf-8")), c = await E(o, n);
	return "err" in c ? (i("failed to config package: " + c.err), 1) : ((await O(o)).projectCount ? T(r) : e("not generating eslint config because no typescript directories exist"), e("config generated"), 0);
}, L = async (e) => {
	let t = e.includes("--json"), { packageJsonPath: n, rootDir: r, cacheDir: a } = s();
	A(a);
	let o = JSON.parse(_.readFileSync(n, "utf-8")), c = await E(o, n);
	if ("err" in c) return i("failed to config package: " + c.err), 1;
	if (!(await O(o)).projectCount) return i("no typescript directory, cannot generate doc"), 1;
	let l = h(r, o, !0);
	if ("err" in l) return i("failed to parse exports: " + l.err), 1;
	let { exports: u } = l.val;
	if (!u.length) return i("exports are empty, cannot generate doc"), 1;
	let d = v.join(r, "tsconfig.src.json"), f = {
		entryPoints: u.map(({ sourcePathAbs: e }) => e),
		entryPointStrategy: "resolve",
		out: v.join(r, t ? "docs.json" : "docs"),
		theme: "oxide",
		plugin: [w],
		tsconfig: d,
		highlightLanguages: [
			"typescript",
			"css",
			"rust",
			"bash",
			"tsx"
		]
	}, p = await C.bootstrapWithPlugins(f), m = await p.convert();
	return m ? (t ? await p.generateJson(m, f.out) : await p.generateDocs(m, f.out), 0) : (i("failed to process project with typedoc"), 61);
}, R = async (r) => {
	let o = r.includes("-n") || r.includes("--dry-run"), { rootDir: c, packageJsonPath: l, cacheDir: u } = s();
	if (_.existsSync(u) || _.mkdirSync(u, { recursive: !0 }), (await t("pnpm", c, [
		"pack",
		"--out",
		v.join(u, "pnpm-pack.temp.tgz")
	])).err) return i("pnpm pack failed!"), 81;
	let p = v.join(u, "pnpm-pack.temp");
	if (_.existsSync(p) && _.rmSync(p, {
		recursive: !0,
		force: !0
	}), _.mkdirSync(p, { recursive: !0 }), (await t("tar", p, ["-xzf", "../pnpm-pack.temp.tgz"])).err) return i("tgz extract failed!"), 91;
	let m = v.join(p, "package", "package.json"), g = JSON.parse(_.readFileSync(m, "utf8")), y = JSON.parse(_.readFileSync(l, "utf8")), b = !!g["pistonight/mono-dev"]?.publish;
	delete g["pistonight/mono-dev"], delete g.private;
	let x = h(c, y);
	if ("err" in x) return i("failed to parse exports: " + x.err), 1;
	if (g.exports) {
		if (typeof g.exports == "string") return i("failed to parse exports: 'exports' field must be an object"), 1;
		let e = y["pistonight/mono-dev"]?.compile || {};
		for (let { entryName: t, distPathRel: r, distDtsPathRel: i } of x.val.exports) {
			let a = t === "." ? "." : "./" + t;
			a in e || (g.exports[a] = {
				import: "./" + n + "/" + r,
				types: "./" + n + "/" + i
			});
		}
	}
	if (g.imports) for (let e in g.imports) {
		if (!e.startsWith("#")) continue;
		let t = g.imports[e];
		if (!t.startsWith("./src") || !t.match(/\.(c|m)?tsx?$/)) continue;
		let r = t.lastIndexOf("."), i = t.substring(2, r), o = "./" + n + "/" + a + "/" + i + ".d.ts";
		g.imports[e] = o;
	}
	let S = !0;
	if (g.files) {
		for (let e in g.files) if (e.startsWith("dist")) {
			d("not adding 'dist/**/*' to files since there are dist paths specified in original package.json"), S = !1;
			break;
		}
	}
	S && (e("adding 'dist/**/*' to files in package.json"), g.files ? g.files.push("dist/**/*") : g.files = ["dist/**/*"]), g.devDependencies && z(g.devDependencies), _.writeFileSync(m, f(JSON.stringify(g, void 0, 2)));
	let C = v.join(p, "package", "dist");
	_.existsSync(C) && _.rmSync(C, {
		recursive: !0,
		force: !0
	}), _.cpSync(v.join(c, "dist"), C, { recursive: !0 });
	let w = v.join(u, "pnpm-packed.tgz");
	return (await t("tar", u, [
		"-czf",
		"pnpm-packed.tgz",
		"-C",
		"pnpm-pack.temp",
		"package"
	])).err ? (i("tgz creation failed!"), 91) : (e("unpacked at: node_modules/.mono/pnpm-pack.temp/package"), e("packed at: " + w), o ? (e("dry-run, stopping"), 0) : b ? (await t("pnpm", c, [
		"publish",
		w,
		"--access",
		"public"
	])).err ? (i("pnpm publish failed!"), 101) : 0 : (i("please set mono-dev option \"publish\": true"), 1));
}, z = (e) => {
	for (let t in e) {
		if (t !== "mono-dev") continue;
		let n = e[t];
		if (typeof n != "string") continue;
		let [r, i] = n.split("#", 2), a = r.toLowerCase();
		!a.startsWith("github:") || !a.endsWith("/mono-dev") || (e[t] = r + "#097cb73266093ec0dbacd40f577cbe905b842102");
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
function G(t) {
	let n = _.readFileSync(t, "utf8"), r = x.load(n)?.tasks;
	if (!r || typeof r != "object") return !1;
	let i = n, a = !1;
	for (let [n, o] of Object.entries(r)) {
		if (!o || typeof o != "object" || o.internal || o.desc) continue;
		let r = B[n];
		if (r || (d(`${t}: unknown task "${n}" — add a desc manually`), a = !0), Array.isArray(o)) {
			let o = U(i, n, r ?? null);
			if (o === null) {
				d(`${t}: could not locate task "${n}" in file`), a = !0;
				continue;
			}
			e(`${t}: converted shorthand for "${n}"${r ? " and added desc" : ""}`), i = o;
		} else if (r) {
			let o = W(i, n, r);
			if (o === null) {
				d(`${t}: could not locate task "${n}" in file`), a = !0;
				continue;
			}
			e(`${t}: added desc for "${n}"`), i = o;
		}
	}
	return i !== n && _.writeFileSync(t, i, "utf8"), a;
}
var K = () => {
	let t = V();
	if (t.length === 0) return e("no Taskfile.yml files found"), 0;
	let n = !1;
	for (let e of t) G(e) && (n = !0);
	return +!!n;
}, q = async (t) => {
	let { packageJsonPath: n, rootDir: r, cacheDir: a } = s();
	A(a);
	let c = JSON.parse(_.readFileSync(n, "utf-8")), l = await E(c, n);
	if ("err" in l) return i("failed to config package: " + l.err), 1;
	await O(c);
	let u = p(a, r);
	return u || e("using vite config from project root directly"), +!!(u ? o("vitest", r, [
		"--config",
		u,
		...t
	]) : o("vitest", r, t)).err;
}, J = async (e) => {
	e.length || (Y(), process.exit(0));
	let [t, ...n] = e;
	switch (t) {
		case "help":
		case "--help":
		case "?":
		case "-h": return Y(), process.exit(0);
		case "version": return console.log("mono-dev " + r()), process.exit(0);
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
	i("unknown command " + t), Y(), process.exit(1);
}, Y = () => {
	console.log("mono-dev CLI\n  config           Generate typeck and eslint config, for language servers\n  check [-f]       Run typeck, prettier, eslint\n  build            Build library (for bundling app run vite directly)\n  test  ARGS...    Run test (with vitest)\n  doc   [--json]   Build documentation \n  taskfile         Fixup taskfiles\n  publish [-n]     Publish the package (-n for dry-run)\n  version          Print the version\n");
};
//#endregion
export { l as executeShim, J as main };

//# sourceMappingURL=index.js.map