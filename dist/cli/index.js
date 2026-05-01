import { a as e, c as t, g as n, h as r, i, l as a, m as o, o as s, p as c, r as l, s as u, t as d, u as f } from "../util-DuBhmBx3.js";
import { n as p, r as m, t as h } from "../project-C3WUWoVu.js";
import g from "node:fs";
import _ from "node:path";
import v, { execSync as y } from "node:child_process";
import b from "node:fs/promises";
import { Application as x } from "typedoc";
import { load as S } from "typedoc-theme-oxide";
import C from "js-yaml";
//#region src/config/gen_eslint.ts
var w = (e) => {
	let t = _.join(e, "eslint.config.js");
	g.writeFileSync(t, n("import { configure } from \"mono-dev/eslint-config\"; export default configure();"));
}, T = async (e, t) => e.private ? await h(e, t) : { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" }, E = (e, t) => {
	let r = [
		"*.yml",
		"*.yaml",
		"*.toml",
		"*.md",
		"*.html",
		"*.hbs",
		"tsconfig*.json",
		"eslint.config.js"
	], i = p(e, t);
	for (let e of i) e.includes("tsconfig") || e.includes("eslint.config.js") || r.push(e);
	g.writeFileSync(_.join(t, ".prettierignore"), n(r.join("\n")));
}, D = async (e) => {
	let t = /* @__PURE__ */ new Set(), i = [], a = [], s = [], c = /* @__PURE__ */ new Set(), l = e["pistonight/mono-dev"]?.nocheck;
	if (l) for (let e of l) {
		if (e.startsWith("/") && !e.substring(1).includes("/")) {
			c.add(e.substring(1));
			continue;
		}
		if (!e.includes("/")) {
			c.add(e);
			continue;
		}
	}
	let f = (await b.readdir(".")).map(async (e) => {
		let n = _.basename(e);
		if (c.has(n)) {
			s.push(e);
			return;
		}
		let o;
		try {
			o = await b.stat(e);
		} catch (t) {
			console.error(t), r(`cannot stat ${e}, skipping`);
			return;
		}
		if (o.isDirectory()) {
			let t = _.join(e, "env.d.ts");
			g.existsSync(t) ? i.push(e) : s.push(e);
			return;
		}
		if (e !== "tsconfig.json" && e.startsWith("tsconfig.") && e.endsWith(".json")) {
			t.add(e);
			return;
		}
		e.match(/\.(c|m)?tsx?$/) && a.push(e);
	});
	await Promise.all(f);
	let p = new Set(t);
	a.length && p.delete("tsconfig._.json"), i.forEach((e) => {
		p.delete(`tsconfig.${e}.json`), p.delete(`tsconfig.${e}__${u}.json`);
	});
	let m = i.map(async (e) => {
		let t = `tsconfig.${e}.json`, r = {
			compilerOptions: {
				...O.compilerOptions,
				tsBuildInfoFile: `node_modules/.mono/tsconfig.${e}.tsbuildinfo`,
				rootDir: "."
			},
			include: [e]
		};
		await b.writeFile(t, n(d(r) || ""));
	}), h = (async () => {
		for (let e of p) o(`removing ${e}`), await b.unlink(e);
	})();
	if (a.length) {
		let e = {
			compilerOptions: {
				...O.compilerOptions,
				tsBuildInfoFile: "node_modules/.mono/tsconfig._.tsbuildinfo",
				rootDir: "."
			},
			include: a
		};
		await b.writeFile("tsconfig._.json", n(d(e) || ""));
	}
	let v = a.length + i.length;
	if (await h, await Promise.all(m), v) {
		let e = i.map((e) => ({ path: `./tsconfig.${e}.json` }));
		a.length && e.push({ path: "./tsconfig._.json" });
		let t = {
			compilerOptions: {},
			files: [],
			references: e
		};
		await b.writeFile("tsconfig.json", n(d(t) || ""));
	} else g.existsSync("tsconfig.json") && (o("removing tsconfig.json"), await b.unlink("tsconfig.json"));
	return {
		projectCount: v,
		nonTsDirectories: s
	};
}, O = { compilerOptions: {
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
} }, k = (e) => {
	let t = a();
	if (t) if (!g.existsSync(e)) g.mkdirSync(e, { recursive: !0 }), g.writeFileSync(`${e}/version`, t);
	else {
		let n = !1;
		try {
			let r = g.readFileSync(`${e}/version`, "utf-8").trim();
			r !== t && (o(`cleaning cache because of version update: ${r} -> ${t}`), n = !0);
		} catch {
			n = !0;
		}
		if (n) {
			g.rmSync(e, {
				recursive: !0,
				force: !0
			}), g.mkdirSync(e, { recursive: !0 });
			try {
				g.writeFileSync(`${e}/version`, t);
			} catch {
				r("failed to write version file, will retry next time");
			}
		}
	}
}, A = async () => {
	let { packageJsonPath: e, rootDir: t, cacheDir: a } = f();
	k(a);
	let l = JSON.parse(g.readFileSync(e, "utf-8"));
	if (!l["pistonight/mono-dev"]?.lib) return c("package.json mono dev option 'lib' must be true to build library"), 1;
	let p = await T(l, e);
	if ("err" in p) return c("failed to config package: " + p.err), 1;
	await D(l);
	let h = m(t, l, !0);
	if ("err" in h) return c("failed to parse exports: " + h.err), 1;
	let v = _.join(a, "lib-build.config.js");
	g.writeFileSync(v, "import { configure } from \"mono-dev/lib-build-config\"; export default configure();");
	let y = _.join(t, "tsconfig.src.json"), b = JSON.parse(g.readFileSync(y, "utf-8")), x = `${a}/tsconfig.src__${u}.tsbuildinfo`;
	g.existsSync(x) && g.unlinkSync(x), b.compilerOptions.tsBuildInfoFile = x, b.compilerOptions.noEmit = !1, b.compilerOptions.outDir = _.join(s, u), b.exclude = [
		"**/*.test.ts",
		"**/*.test.mts",
		"**/*.test.cts",
		"**/*.test.tsx"
	];
	let S = _.join(t, "tsconfig.src__" + u + ".json");
	g.writeFileSync(S, n(d(b) || ""));
	let C = i("vite", t, [
		"build",
		"--config",
		v
	]);
	if ("err" in C) return c("bundle with vite failed: " + C.err), 21;
	o("generating dts...");
	let w = Date.now(), E = !!l["pistonight/mono-dev"]?.tsc, O = E ? "tsc" : "tsgo";
	E && r("warning: using tsc instead of tsgo for generating declarations");
	let A = i(O, t, ["-p", S]);
	return "err" in A ? (c("dts generation with tsc failed: " + A.err), 31) : (o(`dts generated (${Math.floor(Date.now() - w)}ms)`), 0);
}, j = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = f();
	k(r);
	let i = JSON.parse(g.readFileSync(t, "utf-8")), a = await T(i, t);
	if ("err" in a) return c("failed to config package: " + a.err), 1;
	(await D(i)).projectCount && w(n), E(i, n);
	let o = !!i["pistonight/mono-dev"]?.tsc, s = e.includes("--fix") || e.includes("-f");
	if (s) {
		if (!N(n, r, s)) return 41;
		if (!P(n, r, s)) return 51;
		if (!M(n, o)) return 31;
	} else {
		if (!M(n, o)) return 31;
		if (!N(n, r, s)) return 41;
		if (!P(n, r, s)) return 51;
	}
	return 0;
}, M = (e, t) => {
	let n = Date.now(), a = t ? "tsc" : "tsgo";
	return t && r("warning: using tsc instead of tsgo for typeck"), "err" in i(a, e, ["--build", "--pretty"]) ? (c("typeck failed!"), !1) : (o(`typeck passed (${Math.floor(Date.now() - n)}ms)`), !0);
}, N = (e, t, n) => {
	let r = [
		".",
		"--color",
		"--report-unused-disable-directives",
		"--max-warnings=0",
		"--cache",
		"--cache-location",
		_.join(t, ".eslint-cache")
	];
	n && r.push("--fix");
	let a = Date.now();
	return "err" in i("eslint", e, r) ? (c("eslint failed!"), !1) : (o(`eslint passed (${Math.floor(Date.now() - a)}ms)`), !0);
}, P = (e, n, r) => {
	let i = _.join(e, ".prettierignore"), a = _.join(n, ".prettier-cache"), s = _.join(t, "bin", "prettier-wrapper.js"), l = Date.now(), u = v.spawnSync(process.argv[0], [
		s,
		i,
		a,
		r ? "-f" : "-c"
	], {
		cwd: e,
		stdio: "pipe"
	});
	if (u.error) return c("failed to spawn prettier: " + u.error), !1;
	if (u.status) {
		let e = u.stderr.toString("utf-8").trim();
		return console.warn(e.split("\n").map((e) => (e.startsWith("[warn]") && (e = e.substring(6)), e.replace("Run Prettier with --write to fix.", "").trimEnd())).join("\n")), c("prettier failed!"), !1;
	}
	return o(`prettier passed (${Math.floor(Date.now() - l)}ms)`), !0;
}, F = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = f();
	k(r);
	let i = JSON.parse(g.readFileSync(t, "utf-8")), a = await T(i, t);
	return "err" in a ? (c("failed to config package: " + a.err), 1) : ((await D(i)).projectCount ? w(n) : o("not generating eslint config because no typescript directories exist"), o("config generated"), 0);
}, I = async (e) => {
	let t = e.includes("--json"), { packageJsonPath: n, rootDir: r, cacheDir: i } = f();
	k(i);
	let a = JSON.parse(g.readFileSync(n, "utf-8")), o = await T(a, n);
	if ("err" in o) return c("failed to config package: " + o.err), 1;
	if (!(await D(a)).projectCount) return c("no typescript directory, cannot generate doc"), 1;
	let s = m(r, a, !0);
	if ("err" in s) return c("failed to parse exports: " + s.err), 1;
	let { exports: l } = s.val;
	if (!l.length) return c("exports are empty, cannot generate doc"), 1;
	let u = _.join(r, "tsconfig.src.json"), d = {
		entryPoints: l.map(({ sourcePathAbs: e }) => e),
		entryPointStrategy: "resolve",
		out: _.join(r, t ? "docs.json" : "docs"),
		theme: "oxide",
		plugin: [S],
		tsconfig: u,
		highlightLanguages: [
			"typescript",
			"css",
			"rust",
			"bash",
			"tsx"
		]
	}, p = await x.bootstrapWithPlugins(d), h = await p.convert();
	return h ? (t ? await p.generateJson(h, d.out) : await p.generateDocs(h, d.out), 0) : (c("failed to process project with typedoc"), 61);
}, L = async (e) => {
	let t = e.includes("-n") || e.includes("--dry-run"), { rootDir: i, packageJsonPath: a, cacheDir: d } = f();
	if (g.existsSync(d) || g.mkdirSync(d, { recursive: !0 }), (await l("pnpm", i, [
		"pack",
		"--out",
		_.join(d, "pnpm-pack.temp.tgz")
	])).err) return c("pnpm pack failed!"), 81;
	let p = _.join(d, "pnpm-pack.temp");
	if (g.existsSync(p) && g.rmSync(p, {
		recursive: !0,
		force: !0
	}), g.mkdirSync(p, { recursive: !0 }), (await l("tar", p, ["-xzf", "../pnpm-pack.temp.tgz"])).err) return c("tgz extract failed!"), 91;
	let h = _.join(p, "package", "package.json"), v = JSON.parse(g.readFileSync(h, "utf8")), y = JSON.parse(g.readFileSync(a, "utf8")), b = !!v["pistonight/mono-dev"]?.publish;
	delete v["pistonight/mono-dev"], delete v.private;
	let x = m(i, y);
	if ("err" in x) return c("failed to parse exports: " + x.err), 1;
	if (v.exports) {
		if (typeof v.exports == "string") return c("failed to parse exports: 'exports' field must be an object"), 1;
		let e = v["pistonight/mono-dev"]?.compile || {};
		for (let { entryName: t, distPathRel: n, distDtsPathRel: r } of x.val.exports) {
			let i = t === "." ? "." : "./" + t;
			i in e || (v.exports[i] = {
				import: "./" + s + "/" + n,
				types: "./" + s + "/" + r
			});
		}
	}
	if (v.imports) for (let e in v.imports) {
		if (!e.startsWith("#")) continue;
		let t = v.imports[e];
		if (!t.startsWith("./src") || !t.match(/\.(c|m)?tsx?$/)) continue;
		let n = t.lastIndexOf("."), r = t.substring(2, n), i = "./" + s + "/" + u + "/" + r + ".d.ts";
		v.imports[e] = i;
	}
	let S = !0;
	if (v.files) {
		for (let e in v.files) if (e.startsWith("dist")) {
			r("not adding 'dist/**/*' to files since there are dist paths specified in original package.json"), S = !1;
			break;
		}
	}
	S && (o("adding 'dist/**/*' to files in package.json"), v.files ? v.files.push("dist/**/*") : v.files = ["dist/**/*"]), g.writeFileSync(h, n(JSON.stringify(v, void 0, 2)));
	let C = _.join(p, "package", "dist");
	g.existsSync(C) && g.rmSync(C, {
		recursive: !0,
		force: !0
	}), g.cpSync(_.join(i, "dist"), C, { recursive: !0 });
	let w = _.join(d, "pnpm-packed.tgz");
	return (await l("tar", d, [
		"-czf",
		"pnpm-packed.tgz",
		"-C",
		"pnpm-pack.temp",
		"package"
	])).err ? (c("tgz creation failed!"), 91) : (o("unpacked at: node_modules/.mono/pnpm-pack.temp/package"), o("packed at: " + w), t ? (o("dry-run, stopping"), 0) : b ? (await l("pnpm", i, [
		"publish",
		w,
		"--access",
		"public"
	])).err ? (c("pnpm publish failed!"), 101) : 0 : (c("please set mono-dev option \"publish\": true"), 1));
}, R = {
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
function z() {
	return y("git ls-files --cached --others --exclude-standard", { encoding: "utf8" }).split("\n").filter((e) => e === "Taskfile.yml" || e.endsWith("/Taskfile.yml"));
}
function B(e, t) {
	let n = t + 1;
	for (; n < e.length && !/^ {2}\S/.test(e[n]);) n++;
	return n;
}
function V(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	if (a === -1) return null;
	let o = B(r, a), s = r.slice(a + 1, o).map((e) => e.trim() === "" ? e : "  " + e), c = [
		r[a],
		...n ? [`    desc: ${n}`] : [],
		"    cmds:",
		...s
	];
	return r.splice(a, o - a, ...c), r.join("\n");
}
function H(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	return a === -1 ? null : (r.splice(a + 1, 0, `    desc: ${n}`), r.join("\n"));
}
function U(e) {
	let t = g.readFileSync(e, "utf8"), n = C.load(t)?.tasks;
	if (!n || typeof n != "object") return !1;
	let i = t, a = !1;
	for (let [t, s] of Object.entries(n)) {
		if (!s || typeof s != "object" || s.internal || s.desc) continue;
		let n = R[t];
		if (n || (r(`${e}: unknown task "${t}" — add a desc manually`), a = !0), Array.isArray(s)) {
			let s = V(i, t, n ?? null);
			if (s === null) {
				r(`${e}: could not locate task "${t}" in file`), a = !0;
				continue;
			}
			o(`${e}: converted shorthand for "${t}"${n ? " and added desc" : ""}`), i = s;
		} else if (n) {
			let s = H(i, t, n);
			if (s === null) {
				r(`${e}: could not locate task "${t}" in file`), a = !0;
				continue;
			}
			o(`${e}: added desc for "${t}"`), i = s;
		}
	}
	return i !== t && g.writeFileSync(e, i, "utf8"), a;
}
var W = () => {
	let e = z();
	if (e.length === 0) return o("no Taskfile.yml files found"), 0;
	let t = !1;
	for (let n of e) U(n) && (t = !0);
	return +!!t;
}, G = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = f();
	k(r);
	let a = JSON.parse(g.readFileSync(t, "utf-8")), o = await T(a, t);
	if ("err" in o) return c("failed to config package: " + o.err), 1;
	await D(a);
	let s = _.join(r, "vitest.config.js");
	return g.writeFileSync(s, "import { configure } from \"mono-dev/test-config\"; export default configure();"), +!!i("vitest", n, [
		"--config",
		s,
		...e
	]).err;
}, K = async (e) => {
	e.length || (q(), process.exit(0));
	let [t, ...n] = e;
	switch (t) {
		case "help":
		case "--help":
		case "?":
		case "-h": return q(), process.exit(0);
		case "version": return console.log("mono-dev " + a()), process.exit(0);
		case "config": return process.exit(await F(n));
		case "check": return process.exit(await j(n));
		case "build": return process.exit(await A());
		case "test": return process.exit(await G(n));
		case "doc": return process.exit(await I(n));
		case "taskfile": return process.exit(W());
		case "publish":
			if (!n.includes("--skip-build")) {
				let e = await A();
				e && process.exit(e);
			}
			return process.exit(await L(n));
	}
	c("unknown command " + t), q(), process.exit(1);
}, q = () => {
	console.log("mono-dev CLI\n  config           Generate typeck and eslint config, for language servers\n  check [-f]       Run typeck, prettier, eslint\n  build            Build library (for bundling app run vite directly)\n  test  ARGS...    Run test (with vitest)\n  doc   [--json]   Build documentation \n  taskfile         Fixup taskfiles\n  publish [-n]     Publish the package (-n for dry-run)\n  version          Print the version\n");
};
//#endregion
export { e as executeShim, K as main };

//# sourceMappingURL=index.js.map