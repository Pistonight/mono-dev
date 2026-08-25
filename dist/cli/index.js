import { _ as e, a as t, b as n, g as r, h as i, i as a, l as o, m as s, n as c, o as l, p as u, r as d, s as f, u as p, v as m } from "../plugins.js";
import { i as h, n as g, r as _, t as v } from "../project.js";
import { o as y } from "../gen_vite.js";
import b from "node:fs";
import x from "node:path";
import S, { execSync as C } from "node:child_process";
import { load as w } from "js-yaml";
import T from "node:fs/promises";
import { Application as ee, BaseRouter as te, Comment as ne, ContainerReflection as re, DefaultTheme as ie, DefaultThemeRenderContext as E, DocumentReflection as ae, JSX as D, Reflection as oe, ReflectionKind as O, ReflectionType as se } from "typedoc";
import * as ce from "fs/promises";
import * as le from "path";
import { promisify as ue } from "util";
import { deflate as de } from "zlib";
//#region src/config/gen_eslint.ts
var fe = (e) => {
	let t = x.join(e, "eslint.config.js");
	b.writeFileSync(t, r("import { configure } from \"mono-dev/eslint-config\"; export default configure();"));
}, pe = async (e, t) => e.private ? await v(e, t) : { err: "'private' must be set to true to prevent accidental publishing; to pack for publishing please use mono publish" }, me = (e, t) => {
	let n = [
		"*.yml",
		"*.yaml",
		"*.toml",
		"*.md",
		"*.html",
		"*.hbs",
		"tsconfig*.json",
		"eslint.config.js"
	], i = g(e, t);
	for (let e of i) e.includes("tsconfig") || e.includes("eslint.config.js") || n.push(e);
	b.writeFileSync(x.join(t, ".prettierignore"), r(n.join("\n")));
}, he = async (e) => {
	let t = /* @__PURE__ */ new Set(), n = [], a = [], o = [], c = /* @__PURE__ */ new Set(), u = e["pistonight/mono-dev"]?.nocheck;
	if (u) for (let e of u) {
		if (e.startsWith("/") && !e.substring(1).includes("/")) {
			c.add(e.substring(1));
			continue;
		}
		if (!e.includes("/")) {
			c.add(e);
			continue;
		}
	}
	let d = (await T.readdir(".")).map(async (e) => {
		let r = x.basename(e);
		if (c.has(r)) {
			o.push(e);
			return;
		}
		let s;
		try {
			s = await T.stat(e);
		} catch (t) {
			console.error(t), i(`cannot stat ${e}, skipping`);
			return;
		}
		if (s.isDirectory()) {
			let t = x.join(e, "env.d.ts");
			b.existsSync(t) ? n.push(e) : o.push(e);
			return;
		}
		if (e !== "tsconfig.json" && e.startsWith("tsconfig.") && e.endsWith(".json")) {
			t.add(e);
			return;
		}
		e.match(/\.(c|m)?tsx?$/) && a.push(e);
	});
	await Promise.all(d);
	let f = new Set(t);
	a.length && f.delete("tsconfig._.json"), n.forEach((e) => {
		f.delete(`tsconfig.${e}.json`), f.delete(`tsconfig.${e}__${l}.json`);
	});
	let p = n.map(async (e) => {
		let t = `tsconfig.${e}.json`, n = {
			compilerOptions: {
				...ge.compilerOptions,
				tsBuildInfoFile: `node_modules/.mono/tsconfig.${e}.tsbuildinfo`,
				rootDir: "."
			},
			include: [e]
		};
		await T.writeFile(t, r(h(n) || ""));
	}), m = (async () => {
		for (let e of f) s(`removing ${e}`), await T.unlink(e);
	})();
	if (a.length) {
		let e = {
			compilerOptions: {
				...ge.compilerOptions,
				tsBuildInfoFile: "node_modules/.mono/tsconfig._.tsbuildinfo",
				rootDir: "."
			},
			include: a
		};
		await T.writeFile("tsconfig._.json", r(h(e) || ""));
	}
	let g = a.length + n.length;
	if (await m, await Promise.all(p), g) {
		let e = n.map((e) => ({ path: `./tsconfig.${e}.json` }));
		a.length && e.push({ path: "./tsconfig._.json" });
		let t = {
			compilerOptions: {},
			files: [],
			references: e
		};
		await T.writeFile("tsconfig.json", r(h(t) || ""));
	} else b.existsSync("tsconfig.json") && (s("removing tsconfig.json"), await T.unlink("tsconfig.json"));
	return {
		projectCount: g,
		nonTsDirectories: o
	};
}, ge = { compilerOptions: {
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
} }, _e = (e) => {
	let t = o();
	if (t) {
		if (!b.existsSync(e)) b.mkdirSync(e, { recursive: !0 }), b.writeFileSync(`${e}/version`, t);
		else {
			let n = !1;
			try {
				let r = b.readFileSync(`${e}/version`, "utf-8").trim();
				r !== t && (s(`cleaning cache because of version update: ${r} -> ${t}`), n = !0);
			} catch {
				n = !0;
			}
			if (n) {
				b.rmSync(e, {
					recursive: !0,
					force: !0
				}), b.mkdirSync(e, { recursive: !0 });
				try {
					b.writeFileSync(`${e}/version`, t);
				} catch {
					i("failed to write version file, will retry next time");
				}
			}
		}
	}
}, ve = async () => {
	let { packageJsonPath: e, rootDir: n, cacheDir: a } = p();
	_e(a);
	let o = JSON.parse(b.readFileSync(e, "utf-8")), c = o["pistonight/mono-dev"] || {};
	if (!c.lib) return u("package.json mono dev option 'lib' must be true or \"node\" to build library"), 1;
	let f = await pe(o, e);
	if ("err" in f) return u("failed to config package: " + f.err), 1;
	await he(o);
	let m = _(n, o, !0);
	if ("err" in m) return u("failed to parse exports: " + m.err), 1;
	let g = y(a, n);
	g || s("using vite config from project root directly");
	let v = x.join(n, "tsconfig.src.json"), S = JSON.parse(b.readFileSync(v, "utf-8")), C = `${a}/tsconfig.src__${l}.tsbuildinfo`;
	b.existsSync(C) && b.unlinkSync(C);
	let w = c.nodts, T = x.join(n, "tsconfig.src__" + l + ".json");
	if (!w) {
		S.compilerOptions.tsBuildInfoFile = C, S.compilerOptions.noEmit = !1, S.compilerOptions.outDir = x.join(t, l);
		let e = "sourcemap" in c ? !!c.sourcemap : !0;
		S.compilerOptions.declarationMap = e, S.exclude = [
			"**/*.test.ts",
			"**/*.test.mts",
			"**/*.test.cts",
			"**/*.test.tsx"
		], b.writeFileSync(T, r(h(S) || ""));
	}
	let ee = g ? d("vite", n, [
		"build",
		"--config",
		g
	]) : d("vite", n, ["build"]);
	if ("err" in ee) return u("bundle with vite failed: " + ee.err), 21;
	if (w) i("skipping dts since nodts is true");
	else {
		let e = Date.now(), t = d("tsgo", n, ["-p", T]);
		if ("err" in t) return u("dts generation with tsc failed: " + t.err), 31;
		let r = Math.floor(Date.now() - e);
		s(`dts generated (${r}ms)`);
	}
	return 0;
}, ye = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = p();
	_e(r);
	let i = JSON.parse(b.readFileSync(t, "utf-8")), a = await pe(i, t);
	if ("err" in a) return u("failed to config package: " + a.err), 1;
	(await he(i)).projectCount && fe(n), me(i, n);
	let o = e.includes("--fix") || e.includes("-f");
	if (o) {
		if (!Se(n, r, o)) return 51;
		if (!xe(n, r, o)) return 41;
		if (!be(n)) return 31;
	} else {
		if (!be(n)) return 31;
		if (!xe(n, r, o)) return 41;
		if (!Se(n, r, o)) return 51;
	}
	return 0;
}, be = (e) => {
	let t = Date.now();
	if ("err" in d("tsgo", e, ["--build", "--pretty"])) return u("typeck failed!"), !1;
	let n = Math.floor(Date.now() - t);
	return s(`typeck passed (${n}ms)`), !0;
}, xe = (e, t, n) => {
	let r = [
		".",
		"--color",
		"--report-unused-disable-directives",
		"--max-warnings=0",
		"--cache",
		"--cache-location",
		x.join(t, ".eslint-cache")
	];
	n && r.push("--fix");
	let i = Date.now();
	if ("err" in d("eslint", e, r)) return u("eslint failed!"), !1;
	let a = Math.floor(Date.now() - i);
	return s(`eslint passed (${a}ms)`), !0;
}, Se = (e, t, n) => {
	let r = x.join(e, ".prettierignore"), i = x.join(t, ".prettier-cache"), a = x.join(f, "bin", "prettier-wrapper.js"), o = Date.now(), c = S.spawnSync(process.argv[0], [
		a,
		r,
		i,
		n ? "-f" : "-c"
	], {
		cwd: e,
		stdio: "pipe"
	});
	if (c.error) return u("failed to spawn prettier: " + c.error), !1;
	if (c.status) {
		let e = c.stderr.toString("utf-8").trim();
		return console.warn(e.split("\n").map((e) => (e.startsWith("[warn]") && (e = e.substring(6)), e.replace("Run Prettier with --write to fix.", "").trimEnd())).join("\n")), u("prettier failed!"), !1;
	}
	let l = Math.floor(Date.now() - o);
	return s(`prettier passed (${l}ms)`), !0;
}, Ce = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = p();
	_e(r);
	let i = JSON.parse(b.readFileSync(t, "utf-8")), a = await pe(i, t);
	return "err" in a ? (u("failed to config package: " + a.err), 1) : ((await he(i)).projectCount ? fe(n) : s("not generating eslint config because no typescript directories exist"), s("config generated"), 0);
}, we = /* @__PURE__ */ e(((e, t) => {
	t.exports = {};
})), k;
function Te(e, t, n) {
	let r = typeof n, i = typeof e;
	if (r !== "undefined") {
		if (i !== "undefined") {
			if (n) {
				if (i === "function" && r === i) return function(t) {
					return e(n(t));
				};
				if (t = e.constructor, t === n.constructor) {
					if (t === Array) return n.concat(e);
					if (t === Map) {
						var a = new Map(n);
						for (var o of e) a.set(o[0], o[1]);
						return a;
					}
					if (t === Set) {
						o = new Set(n);
						for (a of e.values()) o.add(a);
						return o;
					}
				}
			}
			return e;
		}
		return n;
	}
	return i === "undefined" ? t : e;
}
function Ee(e, t) {
	return e === void 0 ? t : e;
}
function A() {
	return Object.create(null);
}
function De(e) {
	return typeof e == "string";
}
function Oe(e) {
	return typeof e == "object";
}
function ke(e, t) {
	if (De(t)) e = e[t];
	else for (let n = 0; e && n < t.length; n++) e = e[t[n]];
	return e;
}
var Ae = /[^\p{L}\p{N}]+/u, je = /(\d{3})/g, Me = /(\D)(\d{3})/g, Ne = /(\d{3})(\D)/g, Pe = /[\u0300-\u036f]/g;
function Fe(e = {}) {
	if (!this || this.constructor !== Fe) return new Fe(...arguments);
	if (arguments.length) for (e = 0; e < arguments.length; e++) this.assign(arguments[e]);
	else this.assign(e);
}
k = Fe.prototype, k.assign = function(e) {
	this.normalize = Te(e.normalize, !0, this.normalize);
	let t = e.include, n = t || e.exclude || e.split, r;
	if (n || n === "") {
		if (typeof n == "object" && n.constructor !== RegExp) {
			let e = "";
			r = !t, t || (e += "\\p{Z}"), n.letter && (e += "\\p{L}"), n.number && (e += "\\p{N}", r = !!t), n.symbol && (e += "\\p{S}"), n.punctuation && (e += "\\p{P}"), n.control && (e += "\\p{C}"), (n = n.char) && (e += typeof n == "object" ? n.join("") : n);
			try {
				this.split = RegExp("[" + (t ? "^" : "") + e + "]+", "u");
			} catch {
				this.split = /\s+/;
			}
		} else this.split = n, r = n === !1 || "a1a".split(n).length < 2;
		this.numeric = Te(e.numeric, r);
	} else {
		try {
			this.split = Te(this.split, Ae);
		} catch {
			this.split = /\s+/;
		}
		this.numeric = Te(e.numeric, Te(this.numeric, !0));
	}
	if (this.prepare = Te(e.prepare, null, this.prepare), this.finalize = Te(e.finalize, null, this.finalize), n = e.filter, this.filter = typeof n == "function" ? n : Te(n && new Set(n), null, this.filter), this.dedupe = Te(e.dedupe, !0, this.dedupe), this.matcher = Te((n = e.matcher) && new Map(n), null, this.matcher), this.mapper = Te((n = e.mapper) && new Map(n), null, this.mapper), this.stemmer = Te((n = e.stemmer) && new Map(n), null, this.stemmer), this.replacer = Te(e.replacer, null, this.replacer), this.minlength = Te(e.minlength, 1, this.minlength), this.maxlength = Te(e.maxlength, 1024, this.maxlength), this.rtl = Te(e.rtl, !1, this.rtl), (this.cache = n = Te(e.cache, !0, this.cache)) && (this.F = null, this.L = typeof n == "number" ? n : 2e5, this.B = /* @__PURE__ */ new Map(), this.D = /* @__PURE__ */ new Map(), this.I = this.H = 128), this.h = "", this.J = null, this.A = "", this.K = null, this.matcher) for (let e of this.matcher.keys()) this.h += (this.h ? "|" : "") + e;
	if (this.stemmer) for (let e of this.stemmer.keys()) this.A += (this.A ? "|" : "") + e;
	return this;
}, k.addStemmer = function(e, t) {
	return this.stemmer ||= /* @__PURE__ */ new Map(), this.stemmer.set(e, t), this.A += (this.A ? "|" : "") + e, this.K = null, this.cache && Ie(this), this;
}, k.addFilter = function(e) {
	return typeof e == "function" ? this.filter = e : (this.filter ||= /* @__PURE__ */ new Set(), this.filter.add(e)), this.cache && Ie(this), this;
}, k.addMapper = function(e, t) {
	return typeof e == "object" ? this.addReplacer(e, t) : e.length > 1 ? this.addMatcher(e, t) : (this.mapper ||= /* @__PURE__ */ new Map(), this.mapper.set(e, t), this.cache && Ie(this), this);
}, k.addMatcher = function(e, t) {
	return typeof e == "object" ? this.addReplacer(e, t) : e.length < 2 && (this.dedupe || this.mapper) ? this.addMapper(e, t) : (this.matcher ||= /* @__PURE__ */ new Map(), this.matcher.set(e, t), this.h += (this.h ? "|" : "") + e, this.J = null, this.cache && Ie(this), this);
}, k.addReplacer = function(e, t) {
	return typeof e == "string" ? this.addMatcher(e, t) : (this.replacer ||= [], this.replacer.push(e, t), this.cache && Ie(this), this);
}, k.encode = function(e, t) {
	if (this.cache && e.length <= this.H) {
		if (this.F) {
			if (this.B.has(e)) return this.B.get(e);
		} else this.F = setTimeout(Ie, 50, this);
	}
	this.normalize && (e = typeof this.normalize == "function" ? this.normalize(e) : Pe ? e.normalize("NFKD").replace(Pe, "").toLowerCase() : e.toLowerCase()), this.prepare && (e = this.prepare(e)), this.numeric && e.length > 3 && (e = e.replace(Me, "$1 $2").replace(Ne, "$1 $2").replace(je, "$1 "));
	let n = !(this.dedupe || this.mapper || this.filter || this.matcher || this.stemmer || this.replacer), r = [], i = A(), a, o, s = this.split || this.split === "" ? e.split(this.split) : [e];
	for (let e = 0, l, u; e < s.length; e++) if ((l = u = s[e]) && !(l.length < this.minlength || l.length > this.maxlength)) {
		if (t) {
			if (i[l]) continue;
			i[l] = 1;
		} else {
			if (a === l) continue;
			a = l;
		}
		if (n) r.push(l);
		else if (!this.filter || (typeof this.filter == "function" ? this.filter(l) : !this.filter.has(l))) {
			if (this.cache && l.length <= this.I) {
				if (this.F) {
					var c = this.D.get(l);
					if (c || c === "") {
						c && r.push(c);
						continue;
					}
				} else this.F = setTimeout(Ie, 50, this);
			}
			if (this.stemmer) {
				this.K ||= RegExp("(?!^)(" + this.A + ")$");
				let e;
				for (; e !== l && l.length > 2;) e = l, l = l.replace(this.K, (e) => this.stemmer.get(e));
			}
			if (l && (this.mapper || this.dedupe && l.length > 1)) {
				c = "";
				for (let e = 0, t = "", n, r; e < l.length; e++) n = l.charAt(e), n === t && this.dedupe || ((r = this.mapper && this.mapper.get(n)) || r === "" ? r === t && this.dedupe || !(t = r) || (c += r) : c += t = n);
				l = c;
			}
			if (this.matcher && l.length > 1 && (this.J ||= RegExp("(" + this.h + ")", "g"), l = l.replace(this.J, (e) => this.matcher.get(e))), l && this.replacer) for (c = 0; l && c < this.replacer.length; c += 2) l = l.replace(this.replacer[c], this.replacer[c + 1]);
			if (this.cache && u.length <= this.I && (this.D.set(u, l), this.D.size > this.L && (this.D.clear(), this.I = this.I / 1.1 | 0)), l) {
				if (l !== u) {
					if (t) {
						if (i[l]) continue;
						i[l] = 1;
					} else {
						if (o === l) continue;
						o = l;
					}
				}
				r.push(l);
			}
		}
	}
	return this.finalize && (r = this.finalize(r) || r), this.cache && e.length <= this.H && (this.B.set(e, r), this.B.size > this.L && (this.B.clear(), this.H = this.H / 1.1 | 0)), r;
};
function Ie(e) {
	e.F = null, e.B.clear(), e.D.clear();
}
function Le(e, t, n) {
	n || (t || typeof e != "object" ? typeof t == "object" && (n = t, t = 0) : n = e), n && (e = n.query || e, t = n.limit || t);
	let r = "" + (t || 0);
	n && (r += (n.offset || 0) + !!n.context + !!n.suggest + (n.resolve !== !1) + (n.resolution || this.resolution) + (n.boost || 0)), e = ("" + e).toLowerCase(), this.cache ||= new Re();
	let i = this.cache.get(e + r);
	if (!i) {
		let a = n && n.cache;
		a && (n.cache = !1), i = this.search(e, t, n), a && (n.cache = a), this.cache.set(e + r, i);
	}
	return i;
}
function Re(e) {
	this.limit = e && e !== !0 ? e : 1e3, this.cache = /* @__PURE__ */ new Map(), this.h = "";
}
Re.prototype.set = function(e, t) {
	this.cache.set(this.h = e, t), this.cache.size > this.limit && this.cache.delete(this.cache.keys().next().value);
}, Re.prototype.get = function(e) {
	let t = this.cache.get(e);
	return t && this.h !== e && (this.cache.delete(e), this.cache.set(this.h = e, t)), t;
}, Re.prototype.remove = function(e) {
	for (let t of this.cache) {
		let n = t[0];
		t[1].includes(e) && this.cache.delete(n);
	}
}, Re.prototype.clear = function() {
	this.cache.clear(), this.h = "";
};
var ze = {
	normalize: !1,
	numeric: !1,
	dedupe: !1
}, Be = {}, Ve = /* @__PURE__ */ new Map([
	["b", "p"],
	["v", "f"],
	["w", "f"],
	["z", "s"],
	["x", "s"],
	["d", "t"],
	["n", "m"],
	["c", "k"],
	["g", "k"],
	["j", "k"],
	["q", "k"],
	["i", "e"],
	["y", "e"],
	["u", "o"]
]), He = /* @__PURE__ */ new Map([
	["ae", "a"],
	["oe", "o"],
	["sh", "s"],
	["kh", "k"],
	["th", "t"],
	["ph", "f"],
	["pf", "f"]
]), Ue = [
	/([^aeo])h(.)/g,
	"$1$2",
	/([aeo])h([^aeo]|$)/g,
	"$1$2",
	/(.)\1+/g,
	"$1"
], We = {
	a: "",
	e: "",
	i: "",
	o: "",
	u: "",
	y: "",
	b: 1,
	f: 1,
	p: 1,
	v: 1,
	c: 2,
	g: 2,
	j: 2,
	k: 2,
	q: 2,
	s: 2,
	x: 2,
	z: 2,
	ß: 2,
	d: 3,
	t: 3,
	l: 4,
	m: 5,
	n: 5,
	r: 6
}, Ge = {
	Exact: ze,
	Default: Be,
	Normalize: Be,
	LatinBalance: { mapper: Ve },
	LatinAdvanced: {
		mapper: Ve,
		matcher: He,
		replacer: Ue
	},
	LatinExtra: {
		mapper: Ve,
		replacer: Ue.concat([/(?!^)[aeo]/g, ""]),
		matcher: He
	},
	LatinSoundex: {
		dedupe: !1,
		include: { letter: !0 },
		finalize: function(e) {
			for (let n = 0; n < e.length; n++) {
				var t = e[n];
				let r = t.charAt(0), i = We[r];
				for (let e = 1, n; e < t.length && (n = t.charAt(e), n === "h" || n === "w" || !(n = We[n]) || n === i || (r += n, i = n, r.length !== 4)); e++);
				e[n] = r;
			}
		}
	},
	CJK: { split: "" },
	LatinExact: ze,
	LatinDefault: Be,
	LatinSimple: Be
};
function Ke(e, t, n, r) {
	let i = [];
	for (let a = 0, o; a < e.index.length; a++) if (o = e.index[a], t >= o.length) t -= o.length;
	else {
		t = o[r ? "splice" : "slice"](t, n);
		let a = t.length;
		if (a && (i = i.length ? i.concat(t) : t, n -= a, r && (e.length -= a), !n)) break;
		t = 0;
	}
	return i;
}
function qe(e) {
	if (!this || this.constructor !== qe) return new qe(e);
	this.index = e ? [e] : [], this.length = e ? e.length : 0;
	let t = this;
	return new Proxy([], {
		get(e, n) {
			if (n === "length") return t.length;
			if (n === "push") return function(e) {
				t.index[t.index.length - 1].push(e), t.length++;
			};
			if (n === "pop") return function() {
				if (t.length) return t.length--, t.index[t.index.length - 1].pop();
			};
			if (n === "indexOf") return function(e) {
				let n = 0;
				for (let r = 0, i, a; r < t.index.length; r++) {
					if (i = t.index[r], a = i.indexOf(e), a >= 0) return n + a;
					n += i.length;
				}
				return -1;
			};
			if (n === "includes") return function(e) {
				for (let n = 0; n < t.index.length; n++) if (t.index[n].includes(e)) return !0;
				return !1;
			};
			if (n === "slice") return function(e, n) {
				return Ke(t, e || 0, n || t.length, !1);
			};
			if (n === "splice") return function(e, n) {
				return Ke(t, e || 0, n || t.length, !0);
			};
			if (n === "constructor") return Array;
			if (typeof n != "symbol") return (e = t.index[n / 2 ** 31 | 0]) && e[n];
		},
		set(e, n, r) {
			return e = n / 2 ** 31 | 0, (t.index[e] || (t.index[e] = []))[n] = r, t.length++, !0;
		}
	});
}
qe.prototype.clear = function() {
	this.index.length = 0;
}, qe.prototype.push = function() {};
function Je(e = 8) {
	if (!this || this.constructor !== Je) return new Je(e);
	this.index = A(), this.h = [], this.size = 0, e > 32 ? (this.B = Ze, this.A = BigInt(e)) : (this.B = Xe, this.A = e);
}
Je.prototype.get = function(e) {
	let t = this.index[this.B(e)];
	return t && t.get(e);
}, Je.prototype.set = function(e, t) {
	var n = this.B(e);
	let r = this.index[n];
	r ? (n = r.size, r.set(e, t), (n -= r.size) && this.size++) : (this.index[n] = r = /* @__PURE__ */ new Map([[e, t]]), this.h.push(r), this.size++);
};
function Ye(e = 8) {
	if (!this || this.constructor !== Ye) return new Ye(e);
	this.index = A(), this.h = [], this.size = 0, e > 32 ? (this.B = Ze, this.A = BigInt(e)) : (this.B = Xe, this.A = e);
}
Ye.prototype.add = function(e) {
	var t = this.B(e);
	let n = this.index[t];
	n ? (t = n.size, n.add(e), (t -= n.size) && this.size++) : (this.index[t] = n = /* @__PURE__ */ new Set([e]), this.h.push(n), this.size++);
}, k = Je.prototype, k.has = Ye.prototype.has = function(e) {
	let t = this.index[this.B(e)];
	return t && t.has(e);
}, k.delete = Ye.prototype.delete = function(e) {
	let t = this.index[this.B(e)];
	t && t.delete(e) && this.size--;
}, k.clear = Ye.prototype.clear = function() {
	this.index = A(), this.h = [], this.size = 0;
}, k.values = Ye.prototype.values = function* () {
	for (let e = 0; e < this.h.length; e++) for (let t of this.h[e].values()) yield t;
}, k.keys = Ye.prototype.keys = function* () {
	for (let e = 0; e < this.h.length; e++) for (let t of this.h[e].keys()) yield t;
}, k.entries = Ye.prototype.entries = function* () {
	for (let e = 0; e < this.h.length; e++) for (let t of this.h[e].entries()) yield t;
};
function Xe(e) {
	let t = 2 ** this.A - 1;
	if (typeof e == "number") return e & t;
	let n = 0, r = this.A + 1;
	for (let i = 0; i < e.length; i++) n = (n * r ^ e.charCodeAt(i)) & t;
	return this.A === 32 ? n + 2 ** 31 : n;
}
function Ze(e) {
	let t = BigInt(2) ** this.A - BigInt(1);
	var n = typeof e;
	if (n === "bigint") return e & t;
	if (n === "number") return BigInt(e) & t;
	n = BigInt(0);
	let r = this.A + BigInt(1);
	for (let i = 0; i < e.length; i++) n = (n * r ^ BigInt(e.charCodeAt(i))) & t;
	return n;
}
var Qe, $e;
async function et(e) {
	e = e.data;
	var t = e.task;
	let n = e.id, r = e.args;
	switch (t) {
		case "init":
			$e = e.options || {}, (t = e.factory) ? (Function("return " + t)()(self), Qe = new self.FlexSearch.Index($e), delete self.FlexSearch) : Qe = new Yt($e), postMessage({ id: n });
			break;
		default:
			let i;
			t === "export" && (r[1] ? (r[0] = $e.export, r[2] = 0, r[3] = 1) : r = null), t === "import" ? r[0] && (e = await $e.import.call(Qe, r[0]), Qe.import(r[0], e)) : ((i = r && Qe[t].apply(Qe, r)) && i.then && (i = await i), i && i.await && (i = await i.await), t === "search" && i.result && (i = i.result)), postMessage(t === "search" ? {
				id: n,
				msg: i
			} : { id: n });
	}
}
function tt(e) {
	ot.call(e, "add"), ot.call(e, "append"), ot.call(e, "search"), ot.call(e, "update"), ot.call(e, "remove"), ot.call(e, "searchCache");
}
var nt, rt, it;
function at() {
	nt = it = 0;
}
function ot(e) {
	this[e + "Async"] = function() {
		let t = arguments;
		var n = t[t.length - 1];
		let r;
		if (typeof n == "function" && (r = n, delete t[t.length - 1]), nt ? it ||= Date.now() - rt >= this.priority * this.priority * 3 : (nt = setTimeout(at, 0), rt = Date.now()), it) {
			let n = this;
			return new Promise((r) => {
				setTimeout(function() {
					r(n[e + "Async"].apply(n, t));
				}, 0);
			});
		}
		let i = this[e].apply(this, t);
		return n = i.then ? i : new Promise((e) => e(i)), r && n.then(r), n;
	};
}
var st = 0;
function ct(e = {}, t) {
	function n(n) {
		function o(e) {
			e = e.data || e;
			let t = e.id, n = t && a.h[t];
			n && (n(e.msg), delete a.h[t]);
		}
		if (this.worker = n, this.h = A(), this.worker) return i ? this.worker.on("message", o) : this.worker.onmessage = o, e.config ? new Promise(function(t) {
			st > 1e9 && (st = 0), a.h[++st] = function() {
				t(a);
			}, a.worker.postMessage({
				id: st,
				task: "init",
				factory: r,
				options: e
			});
		}) : (this.priority = e.priority || 4, this.encoder = t || null, this.worker.postMessage({
			task: "init",
			factory: r,
			options: e
		}), this);
	}
	if (!this || this.constructor !== ct) return new ct(e);
	let r = typeof self < "u" ? self._factory : typeof window < "u" ? window._factory : null;
	r &&= r.toString();
	let i = typeof window > "u", a = this, o = ut(r, i, e.worker);
	return o.then ? o.then(function(e) {
		return n.call(a, e);
	}) : n.call(this, o);
}
lt("add"), lt("append"), lt("search"), lt("update"), lt("remove"), lt("clear"), lt("export"), lt("import"), ct.prototype.searchCache = Le, tt(ct.prototype);
function lt(e) {
	ct.prototype[e] = function() {
		let t = this, n = [].slice.call(arguments);
		var r = n[n.length - 1];
		let i;
		return typeof r == "function" && (i = r, n.pop()), r = new Promise(function(r) {
			e === "export" && typeof n[0] == "function" && (n[0] = null), st > 1e9 && (st = 0), t.h[++st] = r, t.worker.postMessage({
				task: e,
				id: st,
				args: n
			});
		}), i ? (r.then(i), this) : r;
	};
}
function ut(e, t, r) {
	return t ? typeof module < "u" ? new (we()).Worker(__dirname + "/worker/node.js") : Promise.resolve().then(() => /* @__PURE__ */ n(we(), 1)).then(function(e) {
		return new e.Worker(import.meta.dirname + "/node/node.mjs");
	}) : e ? new window.Worker(URL.createObjectURL(new Blob(["onmessage=" + et.toString()], { type: "text/javascript" }))) : new window.Worker(typeof r == "string" ? r : import.meta.url.replace("/worker.js", "/worker/worker.js").replace("flexsearch.bundle.module.min.js", "module/worker/worker.js").replace("flexsearch.bundle.module.min.mjs", "module/worker/worker.js"), { type: "module" });
}
Ot.prototype.add = function(e, t, n) {
	if (Oe(e) && (t = e, e = ke(t, this.key)), t && (e || e === 0)) {
		if (!n && this.reg.has(e)) return this.update(e, t);
		for (let a = 0, o; a < this.field.length; a++) {
			o = this.B[a];
			var r = this.index.get(this.field[a]);
			if (typeof o == "function") {
				var i = o(t);
				i && r.add(e, i, n, !0);
			} else i = o.G, (!i || i(t)) && (o.constructor === String ? o = ["" + o] : De(o) && (o = [o]), ft(t, o, this.D, 0, r, e, o[0], n));
		}
		if (this.tag) for (r = 0; r < this.A.length; r++) {
			var a = this.A[r];
			i = this.tag.get(this.F[r]);
			let s = A();
			if (typeof a == "function") {
				if (a = a(t), !a) continue;
			} else {
				var o = a.G;
				if (o && !o(t)) continue;
				a.constructor === String && (a = "" + a), a = ke(t, a);
			}
			if (i && a) {
				De(a) && (a = [a]);
				for (let t = 0, r, c; t < a.length; t++) if (r = a[t], !s[r] && (s[r] = 1, (o = i.get(r)) ? c = o : i.set(r, c = []), !n || !c.includes(e))) {
					if (c.length === 2 ** 31 - 1) {
						if (o = new qe(c), this.fastupdate) for (let e of this.reg.values()) e.includes(c) && (e[e.indexOf(c)] = o);
						i.set(r, c = o);
					}
					c.push(e), this.fastupdate && ((o = this.reg.get(e)) ? o.push(c) : this.reg.set(e, [c]));
				}
			}
		}
		if (this.store && (!n || !this.store.has(e))) {
			let r;
			if (this.h) {
				r = A();
				for (let e = 0, i; e < this.h.length; e++) {
					if (i = this.h[e], (n = i.G) && !n(t)) continue;
					let a;
					if (typeof i == "function") {
						if (a = i(t), !a) continue;
						i = [i.O];
					} else if (De(i) || i.constructor === String) {
						r[i] = t[i];
						continue;
					}
					dt(t, r, i, 0, i[0], a);
				}
			}
			this.store.set(e, r || t);
		}
		this.worker && (this.fastupdate || this.reg.add(e));
	}
	return this;
};
function dt(e, t, n, r, i, a) {
	if (e = e[i], r === n.length - 1) t[i] = a || e;
	else if (e) {
		if (e.constructor === Array) for (t = t[i] = Array(e.length), i = 0; i < e.length; i++) dt(e, t, n, r, i);
		else t = t[i] || (t[i] = A()), i = n[++r], dt(e, t, n, r, i);
	}
}
function ft(e, t, n, r, i, a, o, s) {
	if (e = e[o]) {
		if (r === t.length - 1) {
			if (e.constructor === Array) {
				if (n[r]) {
					for (t = 0; t < e.length; t++) i.add(a, e[t], !0, !0);
					return;
				}
				e = e.join(" ");
			}
			i.add(a, e, s, !0);
		} else if (e.constructor === Array) for (o = 0; o < e.length; o++) ft(e, t, n, r, i, a, o, s);
		else o = t[++r], ft(e, t, n, r, i, a, o, s);
	}
}
function pt(e, t, n, r) {
	if (!e.length) return e;
	if (e.length === 1) return e = e[0], e = n || e.length > t ? e.slice(n, n + t) : e, r ? Dt.call(this, e) : e;
	let i = [];
	for (let a = 0, o, s; a < e.length; a++) if ((o = e[a]) && (s = o.length)) {
		if (n) {
			if (n >= s) {
				n -= s;
				continue;
			}
			o = o.slice(n, n + t), s = o.length, n = 0;
		}
		if (s > t && (o = o.slice(0, t), s = t), !i.length && s >= t) return r ? Dt.call(this, o) : o;
		if (i.push(o), t -= s, !t) break;
	}
	return i = i.length > 1 ? [].concat.apply([], i) : i[0], r ? Dt.call(this, i) : i;
}
function mt(e, t, n, r) {
	var i = r[0];
	if (i[0] && i[0].query) return e[t].apply(e, i);
	if (!(t !== "and" && t !== "not" || e.result.length || e.await || i.suggest)) return r.length > 1 && (i = r[r.length - 1]), (r = i.resolve) ? e.await || e.result : e;
	let a = [], o = 0, s = 0, c, l, u, d, f;
	for (t = 0; t < r.length; t++) if (i = r[t]) {
		var p = void 0;
		if (i.constructor === j) p = i.await || i.result;
		else if (i.then || i.constructor === Array) p = i;
		else {
			o = i.limit || 0, s = i.offset || 0, u = i.suggest, l = i.resolve, c = ((d = i.highlight || e.highlight) || i.enrich) && l, p = i.queue;
			let n = i.async || p, r = i.index, m = i.query;
			if (r ? e.index ||= r : r = e.index, m || i.tag) {
				let o = i.field || i.pluck;
				if (o && (!m || e.query && !d || (e.query = m, e.field = o, e.highlight = d), r = r.index.get(o)), p && (f || e.await)) {
					f = 1;
					let o, s = e.C.length, c = new Promise(function(e) {
						o = e;
					});
					(function(t, r) {
						c.h = function() {
							r.index = null, r.resolve = !1;
							let i = n ? t.searchAsync(r) : t.search(r);
							return i.then ? i.then(function(t) {
								return e.C[s] = t = t.result || t, o(t), t;
							}) : (i = i.result || i, o(i), i);
						};
					})(r, Object.assign({}, i)), e.C.push(c), a[t] = c;
					continue;
				}
				i.resolve = !1, i.index = null, p = n ? r.searchAsync(i) : r.search(i), i.resolve = l, i.index = r;
			} else if (i.and) p = ht(i, "and", r);
			else if (i.or) p = ht(i, "or", r);
			else if (i.not) p = ht(i, "not", r);
			else if (i.xor) p = ht(i, "xor", r);
			else continue;
		}
		p.await ? (f = 1, p = p.await) : p.then ? (f = 1, p = p.then(function(e) {
			return e.result || e;
		})) : p = p.result || p, a[t] = p;
	}
	if (f && !e.await && (e.await = new Promise(function(t) {
		e.return = t;
	})), f) {
		let t = Promise.all(a).then(function(r) {
			for (let i = 0; i < e.C.length; i++) if (e.C[i] === t) {
				e.C[i] = function() {
					return n.call(e, r, o, s, c, l, u, d);
				};
				break;
			}
			xt(e);
		});
		e.C.push(t);
	} else if (e.await) e.C.push(function() {
		return n.call(e, a, o, s, c, l, u, d);
	});
	else return n.call(e, a, o, s, c, l, u, d);
	return l ? e.await || e.result : e;
}
function ht(e, t, n) {
	e = e[t];
	let r = e[0] || e;
	return r.index ||= n, n = new j(r), e.length > 1 && (n = n[t].apply(n, e.slice(1))), n;
}
j.prototype.or = function() {
	return mt(this, "or", gt, arguments);
};
function gt(e, t, n, r, i, a, o) {
	return e.length && (this.result.length && e.push(this.result), e.length < 2 ? this.result = e[0] : (this.result = Ct(e, t, n, !1, this.h), n = 0)), i && (this.await = null), i ? this.resolve(t, n, r, o) : this;
}
j.prototype.and = function() {
	return mt(this, "and", _t, arguments);
};
function _t(e, t, n, r, i, a, o) {
	if (!a && !this.result.length) return i ? this.result : this;
	let s;
	if (e.length) {
		if (this.result.length && e.unshift(this.result), e.length < 2) this.result = e[0];
		else {
			let r = 0;
			for (let t = 0, n, i; t < e.length; t++) if ((n = e[t]) && (i = n.length)) r < i && (r = i);
			else if (!a) {
				r = 0;
				break;
			}
			r ? (this.result = St(e, r, t, n, a, this.h, i), s = !0) : this.result = [];
		}
	} else a || (this.result = e);
	return i && (this.await = null), i ? this.resolve(t, n, r, o, s) : this;
}
j.prototype.xor = function() {
	return mt(this, "xor", vt, arguments);
};
function vt(e, t, n, r, i, a, o) {
	if (e.length) {
		if (this.result.length && e.unshift(this.result), e.length < 2) this.result = e[0];
		else {
			a: {
				a = n;
				var s = this.h;
				let r = [], o = A(), c = 0;
				for (let t = 0, n; t < e.length; t++) if (n = e[t]) {
					c < n.length && (c = n.length);
					for (let e = 0, t; e < n.length; e++) if (t = n[e]) for (let e = 0, n; e < t.length; e++) n = t[e], o[n] = o[n] ? 2 : 1;
				}
				for (let n = 0, l, u = 0; n < c; n++) for (let c = 0, d; c < e.length; c++) if ((d = e[c]) && (l = d[n])) {
					for (let d = 0, f; d < l.length; d++) if (f = l[d], o[f] === 1) {
						if (a) a--;
						else if (i) {
							if (r.push(f), r.length === t) {
								e = r;
								break a;
							}
						} else {
							let i = n + (c ? s : 0);
							if (r[i] || (r[i] = []), r[i].push(f), ++u === t) {
								e = r;
								break a;
							}
						}
					}
				}
				e = r;
			}
			this.result = e, s = !0;
		}
	} else a || (this.result = e);
	return i && (this.await = null), i ? this.resolve(t, n, r, o, s) : this;
}
j.prototype.not = function() {
	return mt(this, "not", yt, arguments);
};
function yt(e, t, n, r, i, a, o) {
	if (!a && !this.result.length) return i ? this.result : this;
	if (e.length && this.result.length) {
		a: {
			a = n;
			var s = [];
			e = new Set(e.flat().flat());
			for (let n = 0, r, o = 0; n < this.result.length; n++) if (r = this.result[n]) {
				for (let c = 0, l; c < r.length; c++) if (l = r[c], !e.has(l)) {
					if (a) a--;
					else if (i) {
						if (s.push(l), s.length === t) {
							e = s;
							break a;
						}
					} else if (s[n] || (s[n] = []), s[n].push(l), ++o === t) {
						e = s;
						break a;
					}
				}
			}
			e = s;
		}
		this.result = e, s = !0;
	}
	return i && (this.await = null), i ? this.resolve(t, n, r, o, s) : this;
}
function bt(e, t, n, r, i) {
	let a, o, s;
	typeof i == "string" ? (a = i, i = "") : a = i.template, o = a.indexOf("$1"), s = a.substring(o + 2), o = a.substring(0, o);
	let c = i && i.boundary, l = !i || i.clip !== !1, u = i && i.merge && s && o && RegExp(s + " " + o, "g");
	i &&= i.ellipsis;
	var d = 0;
	if (typeof i == "object") {
		var f = i.template;
		d = f.length - 2, i = i.pattern;
	}
	typeof i != "string" && (i = i === !1 ? "" : "..."), d && (i = f.replace("$1", i)), f = i.length - d;
	let p, m;
	typeof c == "object" && (p = c.before, p === 0 && (p = -1), m = c.after, m === 0 && (m = -1), c = c.total || 9e5), d = /* @__PURE__ */ new Map();
	for (let D = 0, oe, O, se; D < t.length; D++) {
		let ce;
		if (r) ce = t, se = r;
		else {
			var h = t[D];
			if (se = h.field, !se) continue;
			ce = h.result;
		}
		O = n.get(se), oe = O.encoder, h = d.get(oe), typeof h != "string" && (h = oe.encode(e), d.set(oe, h));
		for (let e = 0; e < ce.length; e++) {
			var g = ce[e].doc;
			if (!g || (g = ke(g, se), !g)) continue;
			var _ = g.trim().split(/\s+/);
			if (!_.length) continue;
			g = "";
			var v = [];
			let t = [];
			for (var y = -1, b = -1, x = 0, S = 0; S < _.length; S++) {
				var C = _[S], w = oe.encode(C);
				w = w.length > 1 ? w.join(" ") : w[0];
				let e;
				if (w && C) {
					for (var T = C.length, ee = (oe.split ? C.replace(oe.split, "") : C).length - w.length, te = "", ne = 0, re = 0; re < h.length; re++) {
						var ie = h[re];
						if (ie) {
							var E = ie.length;
							E += ee < 0 ? 0 : ee, ne && E <= ne || (ie = w.indexOf(ie), ie > -1 && (te = (ie ? C.substring(0, ie) : "") + o + C.substring(ie, ie + E) + s + (ie + E < T ? C.substring(ie + E) : ""), ne = E, e = !0));
						}
					}
					te && (c && (y < 0 && (y = g.length + +!!g), b = g.length + +!!g + te.length, x += T, t.push(v.length), v.push({ match: te })), g += (g ? " " : "") + te);
				}
				if (!e) C = _[S], g += (g ? " " : "") + C, c && v.push({ text: C });
				else if (c && x >= c) break;
			}
			if (x = t.length * (a.length - 2), p || m || c && g.length - x > c) {
				if (x = c + x - f * 2, S = b - y, p > 0 && (S += p), m > 0 && (S += m), S <= x) _ = p ? y - (p > 0 ? p : 0) : y - ((x - S) / 2 | 0), v = m ? b + (m > 0 ? m : 0) : _ + x, l || (_ > 0 && g.charAt(_) !== " " && g.charAt(_ - 1) !== " " && (_ = g.indexOf(" ", _), _ < 0 && (_ = 0)), v < g.length && g.charAt(v - 1) !== " " && g.charAt(v) !== " " && (v = g.lastIndexOf(" ", v), v < b ? v = b : ++v)), g = (_ ? i : "") + g.substring(_, v) + (v < g.length ? i : "");
				else {
					for (b = [], y = {}, x = {}, S = {}, C = {}, w = {}, te = ee = T = 0, re = ne = 1;;) {
						var ae = void 0;
						for (let e = 0, n; e < t.length; e++) {
							if (n = t[e], te) {
								if (ee !== te) {
									if (S[e + 1]) continue;
									if (n += te, y[n]) {
										T -= f, x[e + 1] = 1, S[e + 1] = 1;
										continue;
									}
									if (n >= v.length - 1) {
										if (n >= v.length) {
											S[e + 1] = 1, n >= _.length && (x[e + 1] = 1);
											continue;
										}
										T -= f;
									}
									if (g = v[n].text, E = m && w[e]) {
										if (E > 0) {
											if (g.length > E) {
												if (S[e + 1] = 1, l) g = g.substring(0, E);
												else continue;
											}
											(E -= g.length) || (E = -1), w[e] = E;
										} else {
											S[e + 1] = 1;
											continue;
										}
									}
									if (T + g.length + 1 <= c) g = " " + g, b[e] += g;
									else if (l) ae = c - T - 1, ae > 0 && (g = " " + g.substring(0, ae), b[e] += g), S[e + 1] = 1;
									else {
										S[e + 1] = 1;
										continue;
									}
								} else {
									if (S[e]) continue;
									if (n -= ee, y[n]) {
										T -= f, S[e] = 1, x[e] = 1;
										continue;
									}
									if (n <= 0) {
										if (n < 0) {
											S[e] = 1, x[e] = 1;
											continue;
										}
										T -= f;
									}
									if (g = v[n].text, E = p && C[e]) {
										if (E > 0) {
											if (g.length > E) {
												if (S[e] = 1, l) g = g.substring(g.length - E);
												else continue;
											}
											(E -= g.length) || (E = -1), C[e] = E;
										} else {
											S[e] = 1;
											continue;
										}
									}
									if (T + g.length + 1 <= c) g += " ", b[e] = g + b[e];
									else if (l) ae = g.length + 1 - (c - T), ae >= 0 && ae < g.length && (g = g.substring(ae) + " ", b[e] = g + b[e]), S[e] = 1;
									else {
										S[e] = 1;
										continue;
									}
								}
							} else {
								g = v[n].match, p && (C[e] = p), m && (w[e] = m), e && T++;
								let t;
								if (n ? !e && f && (T += f) : (x[e] = 1, S[e] = 1), n >= _.length - 1 || n < v.length - 1 && v[n + 1].match ? t = 1 : f && (T += f), T -= a.length - 2, !e || T + g.length <= c) b[e] = g;
								else {
									ae = ne = re = x[e] = 0;
									break;
								}
								t && (x[e + 1] = 1, S[e + 1] = 1);
							}
							T += g.length, ae = y[n] = 1;
						}
						if (ae) ee === te ? te++ : ee++;
						else {
							if (ee === te ? ne = 0 : re = 0, !ne && !re) break;
							ne ? (ee++, te = ee) : te++;
						}
					}
					g = "";
					for (let e = 0, t; e < b.length; e++) t = (x[e] ? e ? " " : "" : (e && !i ? " " : "") + i) + b[e], g += t;
					i && !x[b.length] && (g += i);
				}
			}
			u && (g = g.replace(u, " ")), ce[e].highlight = g;
		}
		if (r) break;
	}
	return t;
}
function j(e, t) {
	if (!this || this.constructor !== j) return new j(e, t);
	let n = 0, r, i, a, o, s, c;
	if (e && e.index) {
		let r = e;
		if (t = r.index, n = r.boost || 0, i = r.query) {
			a = r.field || r.pluck, o = r.highlight;
			let n = r.resolve;
			e = r.async || r.queue, r.resolve = !1, r.index = null, e = e ? t.searchAsync(r) : t.search(r), r.resolve = n, r.index = t, e = e.result || e;
		} else e = [];
	}
	if (e && e.then) {
		let t = this;
		e = e.then(function(e) {
			t.C[0] = t.result = e.result || e, xt(t);
		}), r = [e], e = [], s = new Promise(function(e) {
			c = e;
		});
	}
	this.index = t || null, this.result = e || [], this.h = n, this.C = r || [], this.await = s || null, this.return = c || null, this.highlight = o || null, this.query = i || "", this.field = a || "";
}
k = j.prototype, k.limit = function(e) {
	if (this.await) {
		let t = this;
		this.C.push(function() {
			return t.limit(e).result;
		});
	} else if (this.result.length) {
		let t = [];
		for (let n = 0, r; n < this.result.length; n++) if (r = this.result[n]) {
			if (r.length <= e) {
				if (t[n] = r, e -= r.length, !e) break;
			} else {
				t[n] = r.slice(0, e);
				break;
			}
		}
		this.result = t;
	}
	return this;
}, k.offset = function(e) {
	if (this.await) {
		let t = this;
		this.C.push(function() {
			return t.offset(e).result;
		});
	} else if (this.result.length) {
		let t = [];
		for (let n = 0, r; n < this.result.length; n++) (r = this.result[n]) && (r.length <= e ? e -= r.length : (t[n] = r.slice(e), e = 0));
		this.result = t;
	}
	return this;
}, k.boost = function(e) {
	if (this.await) {
		let t = this;
		this.C.push(function() {
			return t.boost(e).result;
		});
	} else this.h += e;
	return this;
};
function xt(e, t) {
	let n = e.result;
	var r = e.await;
	e.await = null;
	for (let t = 0, i; t < e.C.length; t++) if (i = e.C[t]) {
		if (typeof i == "function") n = i(), e.C[t] = n = n.result || n, t--;
		else if (i.h) n = i.h(), e.C[t] = n = n.result || n, t--;
		else if (i.then) return e.await = r;
	}
	return r = e.return, e.C = [], e.return = null, t || r(n), n;
}
k.resolve = function(e, t, n, r, i) {
	let a = this.await ? xt(this, !0) : this.result;
	if (a.then) {
		let o = this;
		return a.then(function() {
			return o.resolve(e, t, n, r, i);
		});
	}
	return a.length && (typeof e == "object" ? (r = e.highlight || this.highlight, n = !!r || e.enrich, t = e.offset, e = e.limit) : (r ||= this.highlight, n = !!r || n), a = i ? n ? Dt.call(this.index, a) : a : pt.call(this.index, a, e || 100, t, n)), this.finalize(a, r);
}, k.finalize = function(e, t) {
	if (e.then) {
		let n = this;
		return e.then(function(e) {
			return n.finalize(e, t);
		});
	}
	t && e.length && this.query && (e = bt(this.query, e, this.index.index, this.field, t));
	let n = this.return;
	return this.highlight = this.index = this.result = this.C = this.await = this.return = null, this.query = this.field = "", n && n(e), e;
};
function St(e, t, n, r, i, a, o) {
	let s = e.length, c = [], l, u;
	l = A();
	for (let d = 0, f, p, m, h; d < t; d++) for (let t = 0; t < s; t++) if (m = e[t], d < m.length && (f = m[d])) for (let e = 0; e < f.length; e++) {
		if (p = f[e], (u = l[p]) ? l[p]++ : (u = 0, l[p] = 1), h = c[u] || (c[u] = []), !o) {
			let e = d + (t || !i ? 0 : a || 0);
			h = h[e] || (h[e] = []);
		}
		if (h.push(p), o && n && u === s - 1 && h.length - r === n) return r ? h.slice(r) : h;
	}
	if (e = c.length) {
		if (i) c = c.length > 1 ? Ct(c, n, r, o, a) : (c = c[0]) && n && c.length > n || r ? c.slice(r, n + r) : c;
		else {
			if (e < s) return [];
			if (c = c[e - 1], n || r) {
				if (o) (c.length > n || r) && (c = c.slice(r, n + r));
				else {
					i = [];
					for (let e = 0, t; e < c.length; e++) if (t = c[e]) {
						if (r && t.length > r) r -= t.length;
						else if ((n && t.length > n || r) && (t = t.slice(r, n + r), n -= t.length, r && (r -= t.length)), i.push(t), !n) break;
					}
					c = i;
				}
			}
		}
	}
	return c;
}
function Ct(e, t, n, r, i) {
	let a = [], o = A(), s;
	var c = e.length;
	let l;
	if (r) {
		for (i = c - 1; i >= 0; i--) if (l = (r = e[i]) && r.length) {
			for (c = 0; c < l; c++) if (s = r[c], !o[s]) {
				if (o[s] = 1, n) n--;
				else if (a.push(s), a.length === t) return a;
			}
		}
	} else for (let u = c - 1, d, f = 0; u >= 0; u--) {
		d = e[u];
		for (let e = 0; e < d.length; e++) if (l = (r = d[e]) && r.length) {
			for (let d = 0; d < l; d++) if (s = r[d], !o[s]) {
				if (o[s] = 1, n) n--;
				else {
					let n = (e + (u < c - 1 && i || 0)) / (u + 1) | 0;
					if ((a[n] || (a[n] = [])).push(s), ++f === t) return a;
				}
			}
		}
	}
	return a;
}
function wt(e, t, n, r, i) {
	let a = A(), o = [];
	for (let e = 0, n; e < t.length; e++) {
		n = t[e];
		for (let e = 0; e < n.length; e++) a[n[e]] = 1;
	}
	if (i) {
		for (let t = 0, i; t < e.length; t++) if (i = e[t], a[i]) {
			if (r) r--;
			else if (o.push(i), a[i] = 0, n && --n === 0) break;
		}
	} else for (let n = 0, r, i; n < e.result.length; n++) for (r = e.result[n], t = 0; t < r.length; t++) i = r[t], a[i] && ((o[n] || (o[n] = [])).push(i), a[i] = 0);
	return o;
}
Ot.prototype.search = function(e, t, n, r) {
	n || (!t && Oe(e) ? (n = e, e = "") : Oe(t) && (n = t, t = 0));
	let i = [];
	var a = [];
	let o, s, c, l, u, d, f = 0, p = !0, m;
	if (n) {
		n.constructor === Array && (n = { index: n }), e = n.query || e, o = n.pluck, s = n.merge, l = n.boost, d = o || n.field || (d = n.index) && (d.index ? null : d);
		var h = this.tag && n.tag;
		c = n.suggest, p = n.resolve !== !1, u = n.cache, m = p && this.store && n.highlight;
		var g = !!m || p && this.store && n.enrich;
		t = n.limit || t;
		var _ = n.offset || 0;
		if (t ||= p ? 100 : 0, h && (!this.db || !r)) {
			h.constructor !== Array && (h = [h]);
			var v = [];
			for (let e = 0, t; e < h.length; e++) if (t = h[e], t.field && t.tag) {
				var y = t.tag;
				if (y.constructor === Array) for (var b = 0; b < y.length; b++) v.push(t.field, y[b]);
				else v.push(t.field, y);
			} else {
				y = Object.keys(t);
				for (let e = 0, n, r; e < y.length; e++) if (n = y[e], r = t[n], r.constructor === Array) for (b = 0; b < r.length; b++) v.push(n, r[b]);
				else v.push(n, r);
			}
			if (h = v, !e) {
				if (a = [], v.length) for (h = 0; h < v.length; h += 2) {
					if (this.db) {
						if (r = this.index.get(v[h]), !r) continue;
						a.push(r = r.db.tag(v[h + 1], t, _, g));
					} else r = Et.call(this, v[h], v[h + 1], t, _, g);
					i.push(p ? {
						field: v[h],
						tag: v[h + 1],
						result: r
					} : [r]);
				}
				if (a.length) {
					let e = this;
					return Promise.all(a).then(function(t) {
						for (let e = 0; e < t.length; e++) p ? i[e].result = t[e] : i[e] = t[e];
						return p ? i : new j(i.length > 1 ? St(i, 1, 0, 0, c, l) : i[0], e);
					});
				}
				return p ? i : new j(i.length > 1 ? St(i, 1, 0, 0, c, l) : i[0], this);
			}
		}
		p || o || !(d ||= this.field) || (De(d) ? o = d : (d.constructor === Array && d.length === 1 && (d = d[0]), o = d.field || d.index)), d && d.constructor !== Array && (d = [d]);
	}
	d ||= this.field;
	let x;
	v = (this.worker || this.db) && !r && [];
	for (let o = 0, s, l, C; o < d.length; o++) {
		if (l = d[o], this.db && this.tag && !this.B[o]) continue;
		let w;
		if (De(l) || (w = l, l = w.field, e = w.query || e, t = Ee(w.limit, t), _ = Ee(w.offset, _), c = Ee(w.suggest, c), m = p && this.store && Ee(w.highlight, m), g = !!m || p && this.store && Ee(w.enrich, g), u = Ee(w.cache, u)), r) s = r[o];
		else {
			y = w || n || {}, b = y.enrich;
			var S = this.index.get(l);
			if (h && (this.db && (y.tag = h, y.field = d, x = S.db.support_tag_search), !x && b && (y.enrich = !1), x || (y.limit = 0, y.offset = 0)), s = u ? S.searchCache(e, h && !x ? 0 : t, y) : S.search(e, h && !x ? 0 : t, y), h && !x && (y.limit = t, y.offset = _), b && (y.enrich = b), v) {
				v[o] = s;
				continue;
			}
		}
		if (C = (s = s.result || s) && s.length, h && C) {
			if (y = [], b = 0, this.db && r) {
				if (!x) for (S = d.length; S < r.length; S++) {
					let e = r[S];
					if (e && e.length) b++, y.push(e);
					else if (!c) return p ? i : new j(i, this);
				}
			} else for (let e = 0, t, n; e < h.length; e += 2) {
				if (t = this.tag.get(h[e]), !t) {
					if (c) continue;
					return p ? i : new j(i, this);
				}
				if ((t &&= t.get(h[e + 1])) && t.length) b++, y.push(t);
				else if (!c) return p ? i : new j(i, this);
			}
			if (b) {
				if (s = wt(s, y, t, _, p), C = s.length, !C && !c) return p ? s : new j(s, this);
				b--;
			}
		}
		if (C) a[f] = l, i.push(s), f++;
		else if (d.length === 1) return p ? i : new j(i, this);
	}
	if (v) {
		if (this.db && h && h.length && !x) for (g = 0; g < h.length; g += 2) {
			if (a = this.index.get(h[g]), !a) {
				if (c) continue;
				return p ? i : new j(i, this);
			}
			v.push(a.db.tag(h[g + 1], t, _, !1));
		}
		let r = this;
		return Promise.all(v).then(function(i) {
			return n && (n.resolve = p), i.length && (i = r.search(e, t, n, i)), i;
		});
	}
	if (!f) return p ? i : new j(i, this);
	if (o && (!g || !this.store)) return i = i[0], p ? i : new j(i, this);
	for (v = [], _ = 0; _ < a.length; _++) {
		if (h = i[_], g && h.length && h[0].doc === void 0 && (this.db ? v.push(h = this.index.get(this.field[0]).db.enrich(h)) : h = Dt.call(this, h)), o) return p ? m ? bt(e, h, this.index, o, m) : h : new j(h, this);
		i[_] = {
			field: a[_],
			result: h
		};
	}
	if (g && this.db && v.length) {
		let t = this;
		return Promise.all(v).then(function(n) {
			for (let e = 0; e < n.length; e++) i[e].result = n[e];
			return m && (i = bt(e, i, t.index, o, m)), s ? Tt(i) : i;
		});
	}
	return m && (i = bt(e, i, this.index, o, m)), s ? Tt(i) : i;
};
function Tt(e) {
	let t = [], n = A(), r = A();
	for (let i = 0, a, o, s, c, l, u, d; i < e.length; i++) {
		a = e[i], o = a.field, s = a.result;
		for (let e = 0; e < s.length; e++) l = s[e], typeof l == "object" ? c = l.id : l = { id: c = l }, (u = n[c]) ? u.push(o) : (l.field = n[c] = [o], t.push(l)), (d = l.highlight) && (u = r[c], u || (r[c] = u = {}, l.highlight = u), u[o] = d);
	}
	return t;
}
function Et(e, t, n, r, i) {
	return e = this.tag.get(e), !e || (e = e.get(t), !e) ? [] : (t = e.length - r, t > 0 && ((n && t > n || r) && (e = e.slice(r, r + n)), i && (e = Dt.call(this, e))), e);
}
function Dt(e) {
	if (!this || !this.store) return e;
	if (this.db) return this.index.get(this.field[0]).db.enrich(e);
	let t = Array(e.length);
	for (let n = 0, r; n < e.length; n++) r = e[n], t[n] = {
		id: r,
		doc: this.store.get(r)
	};
	return t;
}
function Ot(e) {
	if (!this || this.constructor !== Ot) return new Ot(e);
	let t = e.document || e.doc || e, n, r;
	if (this.B = [], this.field = [], this.D = [], this.key = (n = t.key || t.id) && At(n, this.D) || "id", (r = e.keystore || 0) && (this.keystore = r), this.fastupdate = !!e.fastupdate, this.reg = !this.fastupdate || e.worker || e.db ? r ? new Ye(r) : /* @__PURE__ */ new Set() : r ? new Je(r) : /* @__PURE__ */ new Map(), this.h = (n = t.store || null) && n && n !== !0 && [], this.store = n ? r ? new Je(r) : /* @__PURE__ */ new Map() : null, this.cache = (n = e.cache || null) && new Re(n), e.cache = !1, this.worker = e.worker || !1, this.priority = e.priority || 4, this.index = kt.call(this, e, t), this.tag = null, (n = t.tag) && (typeof n == "string" && (n = [n]), n.length)) {
		this.tag = /* @__PURE__ */ new Map(), this.A = [], this.F = [];
		for (let e = 0, t, r; e < n.length; e++) {
			if (t = n[e], r = t.field || t, !r) throw Error("The tag field from the document descriptor is undefined.");
			t.custom ? this.A[e] = t.custom : (this.A[e] = At(r, this.D), t.filter && (typeof this.A[e] == "string" && (this.A[e] = new String(this.A[e])), this.A[e].G = t.filter)), this.F[e] = r, this.tag.set(r, /* @__PURE__ */ new Map());
		}
	}
	if (this.worker) {
		this.fastupdate = !1, e = [];
		for (let t of this.index.values()) t.then && e.push(t);
		if (e.length) {
			let t = this;
			return Promise.all(e).then(function(e) {
				let n = 0;
				for (let r of t.index.entries()) {
					let i = r[0], a = r[1];
					a.then && (a = e[n], t.index.set(i, a), n++);
				}
				return t;
			});
		}
	} else e.db && (this.fastupdate = !1, this.mount(e.db));
}
k = Ot.prototype, k.mount = function(e) {
	let t = this.field;
	if (this.tag) for (let e = 0, r; e < this.F.length; e++) {
		r = this.F[e];
		var n = void 0;
		this.index.set(r, n = new Yt({}, this.reg)), t === this.field && (t = t.slice(0)), t.push(r), n.tag = this.tag.get(r);
	}
	n = [];
	let r = {
		db: e.db,
		type: e.type,
		fastupdate: e.fastupdate
	};
	for (let i = 0, a, o; i < t.length; i++) {
		r.field = o = t[i], a = this.index.get(o);
		let s = new e.constructor(e.id, r);
		s.id = e.id, n[i] = s.mount(a), a.document = !0, i ? a.bypass = !0 : a.store = this.store;
	}
	let i = this;
	return this.db = Promise.all(n).then(function() {
		i.db = !0;
	});
}, k.commit = async function() {
	let e = [];
	for (let t of this.index.values()) e.push(t.commit());
	await Promise.all(e), this.reg.clear();
}, k.destroy = function() {
	let e = [];
	for (let t of this.index.values()) e.push(t.destroy());
	return Promise.all(e);
};
function kt(e, t) {
	let n = /* @__PURE__ */ new Map(), r = t.index || t.field || t;
	De(r) && (r = [r]);
	for (let t = 0, a, o; t < r.length; t++) {
		if (a = r[t], De(a) || (o = a, a = a.field), o = Oe(o) ? Object.assign({}, e, o) : e, this.worker) {
			var i = void 0;
			i = (i = o.encoder) && i.encode ? i : new Fe(typeof i == "string" ? Ge[i] : i || {}), i = new ct(o, i), n.set(a, i);
		}
		this.worker || n.set(a, new Yt(o, this.reg)), o.custom ? this.B[t] = o.custom : (this.B[t] = At(a, this.D), o.filter && (typeof this.B[t] == "string" && (this.B[t] = new String(this.B[t])), this.B[t].G = o.filter)), this.field[t] = a;
	}
	if (this.h) {
		e = t.store, De(e) && (e = [e]);
		for (let t = 0, n, r; t < e.length; t++) n = e[t], r = n.field || n, n.custom ? (this.h[t] = n.custom, n.custom.O = r) : (this.h[t] = At(r, this.D), n.filter && (typeof this.h[t] == "string" && (this.h[t] = new String(this.h[t])), this.h[t].G = n.filter));
	}
	return n;
}
function At(e, t) {
	let n = e.split(":"), r = 0;
	for (let i = 0; i < n.length; i++) e = n[i], e[e.length - 1] === "]" && (e = e.substring(0, e.length - 2)) && (t[r] = !0), e && (n[r++] = e);
	return r < n.length && (n.length = r), r > 1 ? n : n[0];
}
k.append = function(e, t) {
	return this.add(e, t, !0);
}, k.update = function(e, t) {
	return this.remove(e).add(e, t);
}, k.remove = function(e) {
	Oe(e) && (e = ke(e, this.key));
	for (var t of this.index.values()) t.remove(e, !0);
	if (this.reg.has(e)) {
		if (this.tag && !this.fastupdate) for (let n of this.tag.values()) for (let r of n) {
			t = r[0];
			let i = r[1], a = i.indexOf(e);
			a > -1 && (i.length > 1 ? i.splice(a, 1) : n.delete(t));
		}
		this.store && this.store.delete(e), this.reg.delete(e);
	}
	return this.cache && this.cache.remove(e), this;
}, k.clear = function() {
	let e = [];
	for (let t of this.index.values()) {
		let n = t.clear();
		n.then && e.push(n);
	}
	if (this.tag) for (let e of this.tag.values()) e.clear();
	return this.store && this.store.clear(), this.cache && this.cache.clear(), e.length ? Promise.all(e) : this;
}, k.contain = function(e) {
	return this.db ? this.index.get(this.field[0]).db.has(e) : this.reg.has(e);
}, k.cleanup = function() {
	for (let e of this.index.values()) e.cleanup();
	return this;
}, k.get = function(e) {
	return this.db ? this.index.get(this.field[0]).db.enrich(e).then(function(e) {
		return e[0] && e[0].doc || null;
	}) : this.store.get(e) || null;
}, k.set = function(e, t) {
	return typeof e == "object" && (t = e, e = ke(t, this.key)), this.store.set(e, t), this;
}, k.searchCache = Le, k.export = Rt, k.import = zt, tt(Ot.prototype);
function jt(e, t = 0) {
	let n = [], r = [];
	t &&= 25e4 / t * 5e3 | 0;
	for (let i of e.entries()) r.push(i), r.length === t && (n.push(r), r = []);
	return r.length && n.push(r), n;
}
function Mt(e, t) {
	t ||= /* @__PURE__ */ new Map();
	for (let n = 0, r; n < e.length; n++) r = e[n], t.set(r[0], r[1]);
	return t;
}
function Nt(e, t = 0) {
	let n = [], r = [];
	t &&= 25e4 / t * 1e3 | 0;
	for (let i of e.entries()) r.push([i[0], jt(i[1])[0] || []]), r.length === t && (n.push(r), r = []);
	return r.length && n.push(r), n;
}
function Pt(e, t) {
	t ||= /* @__PURE__ */ new Map();
	for (let n = 0, r, i; n < e.length; n++) r = e[n], i = t.get(r[0]), t.set(r[0], Mt(r[1], i));
	return t;
}
function Ft(e) {
	let t = [], n = [];
	for (let r of e.keys()) n.push(r), n.length === 25e4 && (t.push(n), n = []);
	return n.length && t.push(n), t;
}
function It(e, t) {
	t ||= /* @__PURE__ */ new Set();
	for (let n = 0; n < e.length; n++) t.add(e[n]);
	return t;
}
function Lt(e, t, n, r, i, a, o = 0) {
	let s = r && r.constructor === Array;
	var c = s ? r.shift() : r;
	if (!c) return this.export(e, t, i, a + 1);
	if ((c = e((t ? t + "." : "") + (o + 1) + "." + n, JSON.stringify(c))) && c.then) {
		let l = this;
		return c.then(function() {
			return Lt.call(l, e, t, n, s ? r : null, i, a, o + 1);
		});
	}
	return Lt.call(this, e, t, n, s ? r : null, i, a, o + 1);
}
function Rt(e, t, n = 0, r = 0) {
	if (n < this.field.length) {
		let i = this.field[n];
		if ((t = this.index.get(i).export(e, i, n, r = 1)) && t.then) {
			let r = this;
			return t.then(function() {
				return r.export(e, i, n + 1);
			});
		}
		return this.export(e, i, n + 1);
	}
	let i, a;
	switch (r) {
		case 0:
			i = "reg", a = Ft(this.reg), t = null;
			break;
		case 1:
			i = "tag", a = this.tag && Nt(this.tag, this.reg.size), t = null;
			break;
		case 2:
			i = "doc", a = this.store && jt(this.store), t = null;
			break;
		default: return;
	}
	return Lt.call(this, e, t, i, a || null, n, r);
}
function zt(e, t) {
	var n = e.split(".");
	n[n.length - 1] === "json" && n.pop();
	let r = n.length > 2 ? n[0] : "";
	if (n = n.length > 2 ? n[2] : n[1], this.worker && r) return this.index.get(r).import(e);
	if (t) {
		if (typeof t == "string" && (t = JSON.parse(t)), r) return this.index.get(r).import(n, t);
		switch (n) {
			case "reg":
				this.fastupdate = !1, this.reg = It(t, this.reg);
				for (let e = 0, t; e < this.field.length; e++) t = this.index.get(this.field[e]), t.fastupdate = !1, t.reg = this.reg;
				if (this.worker) {
					t = [];
					for (let n of this.index.values()) t.push(n.import(e));
					return Promise.all(t);
				}
				break;
			case "tag":
				this.tag = Pt(t, this.tag);
				break;
			case "doc": this.store = Mt(t, this.store);
		}
	}
}
function Bt(e, t) {
	let n = "";
	for (let r of e.entries()) {
		e = r[0];
		let i = r[1], a = "";
		for (let e = 0, n; e < i.length; e++) {
			n = i[e] || [""];
			let r = "";
			for (let e = 0; e < n.length; e++) r += (r ? "," : "") + (t === "string" ? "\"" + n[e] + "\"" : n[e]);
			r = "[" + r + "]", a += (a ? "," : "") + r;
		}
		a = "[\"" + e + "\",[" + a + "]]", n += (n ? "," : "") + a;
	}
	return n;
}
Yt.prototype.remove = function(e, t) {
	let n = this.reg.size && (this.fastupdate ? this.reg.get(e) : this.reg.has(e));
	if (n) {
		if (this.fastupdate) {
			for (let t = 0, r, i; t < n.length; t++) if ((r = n[t]) && (i = r.length)) {
				if (r[i - 1] === e) r.pop();
				else {
					let t = r.indexOf(e);
					t >= 0 && r.splice(t, 1);
				}
			}
		} else Vt(this.map, e), this.depth && Vt(this.ctx, e);
		t || this.reg.delete(e);
	}
	return this.db && (this.commit_task.push({ del: e }), this.M && Xt(this)), this.cache && this.cache.remove(e), this;
};
function Vt(e, t) {
	let n = 0;
	var r = t === void 0;
	if (e.constructor === Array) {
		for (let i = 0, a, o, s; i < e.length; i++) if ((a = e[i]) && a.length) {
			if (r) return 1;
			if (o = a.indexOf(t), o >= 0) {
				if (a.length > 1) return a.splice(o, 1), 1;
				if (delete e[i], n) return 1;
				s = 1;
			} else {
				if (s) return 1;
				n++;
			}
		}
	} else for (let i of e.entries()) r = i[0], Vt(i[1], t) ? n++ : e.delete(r);
	return n;
}
var Ht = {
	memory: { resolution: 1 },
	performance: {
		resolution: 3,
		fastupdate: !0,
		context: {
			depth: 1,
			resolution: 1
		}
	},
	match: { tokenize: "forward" },
	score: {
		resolution: 9,
		context: {
			depth: 2,
			resolution: 3
		}
	}
};
Yt.prototype.add = function(e, t, n, r) {
	if (t && (e || e === 0)) {
		if (!r && !n && this.reg.has(e)) return this.update(e, t);
		r = this.depth, t = this.encoder.encode(t, !r);
		let l = t.length;
		if (l) {
			let u = A(), d = A(), f = this.resolution;
			for (let p = 0; p < l; p++) {
				let m = t[this.rtl ? l - 1 - p : p];
				var i = m.length;
				if (i && (r || !d[m])) {
					var a = this.score ? this.score(t, m, p, null, 0) : Wt(f, l, p), o = "";
					switch (this.tokenize) {
						case "tolerant":
							if (Ut(this, d, m, a, e, n), i > 2) {
								for (let t = 1, r, s, c, l; t < i - 1; t++) r = m.charAt(t), s = m.charAt(t + 1), c = m.substring(0, t) + s, l = m.substring(t + 2), o = c + r + l, Ut(this, d, o, a, e, n), o = c + l, Ut(this, d, o, a, e, n);
								Ut(this, d, m.substring(0, m.length - 1), a, e, n);
							}
							break;
						case "full": if (i > 2) {
							for (let r = 0, c; r < i; r++) for (a = i; a > r; a--) {
								o = m.substring(r, a), c = this.rtl ? i - 1 - r : r;
								var s = this.score ? this.score(t, m, p, o, c) : Wt(f, l, p, i, c);
								Ut(this, d, o, s, e, n);
							}
							break;
						}
						case "bidirectional":
						case "reverse": if (i > 1) {
							for (s = i - 1; s > 0; s--) {
								o = m[this.rtl ? i - 1 - s : s] + o;
								var c = this.score ? this.score(t, m, p, o, s) : Wt(f, l, p, i, s);
								Ut(this, d, o, c, e, n);
							}
							o = "";
						}
						case "forward": if (i > 1) {
							for (s = 0; s < i; s++) o += m[this.rtl ? i - 1 - s : s], Ut(this, d, o, a, e, n);
							break;
						}
						default: if (Ut(this, d, m, a, e, n), r && l > 1 && p < l - 1) for (i = this.N, o = m, a = Math.min(r + 1, this.rtl ? p + 1 : l - p), s = 1; s < a; s++) {
							m = t[this.rtl ? l - 1 - p - s : p + s], c = this.bidirectional && m > o;
							let r = this.score ? this.score(t, o, p, m, s - 1) : Wt(i + (l / 2 > i ? 0 : 1), l, p, a - 1, s - 1);
							Ut(this, u, c ? o : m, r, e, n, c ? m : o);
						}
					}
				}
			}
			this.fastupdate || this.reg.add(e);
		}
	}
	return this.db && (this.commit_task.push(n ? { ins: e } : { del: e }), this.M && Xt(this)), this;
};
function Ut(e, t, n, r, i, a, o) {
	let s, c;
	if (!(s = t[n]) || o && !s[o]) {
		if (o ? (t = s || (t[n] = A()), t[o] = 1, c = e.ctx, (s = c.get(o)) ? c = s : c.set(o, c = e.keystore ? new Je(e.keystore) : /* @__PURE__ */ new Map())) : (c = e.map, t[n] = 1), (s = c.get(n)) ? c = s : c.set(n, c = s = []), a) {
			for (let n = 0, a; n < s.length; n++) if ((a = s[n]) && a.includes(i)) {
				if (n <= r) return;
				a.splice(a.indexOf(i), 1), e.fastupdate && (t = e.reg.get(i)) && t.splice(t.indexOf(a), 1);
				break;
			}
		}
		if (c = c[r] || (c[r] = []), c.push(i), c.length === 2 ** 31 - 1) {
			if (t = new qe(c), e.fastupdate) for (let n of e.reg.values()) n.includes(c) && (n[n.indexOf(c)] = t);
			s[r] = c = t;
		}
		e.fastupdate && ((r = e.reg.get(i)) ? r.push(c) : e.reg.set(i, [c]));
	}
}
function Wt(e, t, n, r, i) {
	return n && e > 1 ? t + (r || 0) <= e ? n + (i || 0) : (e - 1) / (t + (r || 0)) * (n + (i || 0)) + 1 | 0 : 0;
}
Yt.prototype.search = function(e, t, n) {
	if (n || (t || typeof e != "object" ? typeof t == "object" && (n = t, t = 0) : (n = e, e = "")), n && n.cache) return n.cache = !1, e = this.searchCache(e, t, n), n.cache = !0, e;
	let r = [], i, a, o, s = 0, c, l, u, d, f;
	n && (e = n.query || e, t = n.limit || t, s = n.offset || 0, a = n.context, o = n.suggest, f = (c = n.resolve) && n.enrich, u = n.boost, d = n.resolution, l = this.db && n.tag), c === void 0 && (c = this.resolve), a = this.depth && a !== !1;
	let p = this.encoder.encode(e, !a);
	if (i = p.length, t ||= c ? 100 : 0, i === 1) return Kt.call(this, p[0], "", t, s, c, f, l);
	if (i === 2 && a && !o) return Kt.call(this, p[1], p[0], t, s, c, f, l);
	let m = A(), h = 0, g;
	if (a && (g = p[0], h = 1), d || d === 0 || (d = g ? this.N : this.resolution), this.db) {
		if (this.db.search && (n = this.db.search(this, p, t, s, o, c, f, l), n !== !1)) return n;
		let e = this;
		return async function() {
			for (let t, n; h < i; h++) {
				if ((n = p[h]) && !m[n]) {
					if (m[n] = 1, t = await Jt(e, n, g, 0, 0, !1, !1), t = qt(t, r, o, d)) {
						r = t;
						break;
					}
					g && (o && t && r.length || (g = n));
				}
				o && g && h === i - 1 && !r.length && (d = e.resolution, g = "", h = -1, m = A());
			}
			return Gt(r, d, t, s, o, u, c);
		}();
	}
	for (let e, t; h < i; h++) {
		if ((t = p[h]) && !m[t]) {
			if (m[t] = 1, e = Jt(this, t, g, 0, 0, !1, !1), e = qt(e, r, o, d)) {
				r = e;
				break;
			}
			g && (o && e && r.length || (g = t));
		}
		o && g && h === i - 1 && !r.length && (d = this.resolution, g = "", h = -1, m = A());
	}
	return Gt(r, d, t, s, o, u, c);
};
function Gt(e, t, n, r, i, a, o) {
	let s = e.length, c = e;
	if (s > 1) c = St(e, t, n, r, i, a, o);
	else if (s === 1) return o ? pt.call(null, e[0], n, r) : new j(e[0], this);
	return o ? c : new j(c, this);
}
function Kt(e, t, n, r, i, a, o) {
	return e = Jt(this, e, t, n, r, i, a, o), this.db ? e.then(function(e) {
		return i ? e || [] : new j(e, this);
	}) : e && e.length ? i ? pt.call(this, e, n, r) : new j(e, this) : i ? [] : new j([], this);
}
function qt(e, t, n, r) {
	let i = [];
	if (e && e.length) {
		if (e.length <= r) {
			t.push(e);
			return;
		}
		for (let t = 0, n; t < r; t++) (n = e[t]) && (i[t] = n);
		if (i.length) {
			t.push(i);
			return;
		}
	}
	if (!n) return i;
}
function Jt(e, t, n, r, i, a, o, s) {
	let c;
	return n && (c = e.bidirectional && t > n) && (c = n, n = t, t = c), e.db ? e.db.get(t, n, r, i, a, o, s) : (e = n ? (e = e.ctx.get(n)) && e.get(t) : e.map.get(t), e);
}
function Yt(e, t) {
	if (!this || this.constructor !== Yt) return new Yt(e);
	if (e) {
		var n = De(e) ? e : e.preset;
		n && (e = Object.assign({}, Ht[n], e));
	} else e = {};
	n = e.context;
	let r = n === !0 ? { depth: 1 } : n || {}, i = De(e.encoder) ? Ge[e.encoder] : e.encode || e.encoder || {};
	this.encoder = i.encode ? i : typeof i == "object" ? new Fe(i) : { encode: i }, this.resolution = e.resolution || 9, this.tokenize = n = (n = e.tokenize) && n !== "default" && n !== "exact" && n || "strict", this.depth = n === "strict" && r.depth || 0, this.bidirectional = r.bidirectional !== !1, this.fastupdate = !!e.fastupdate, this.score = e.score || null, (n = e.keystore || 0) && (this.keystore = n), this.map = n ? new Je(n) : /* @__PURE__ */ new Map(), this.ctx = n ? new Je(n) : /* @__PURE__ */ new Map(), this.reg = t || (this.fastupdate ? n ? new Je(n) : /* @__PURE__ */ new Map() : n ? new Ye(n) : /* @__PURE__ */ new Set()), this.N = r.resolution || 3, this.rtl = i.rtl || e.rtl || !1, this.cache = (n = e.cache || null) && new Re(n), this.resolve = e.resolve !== !1, (n = e.db) && (this.db = this.mount(n)), this.M = e.commit !== !1, this.commit_task = [], this.commit_timer = null, this.priority = e.priority || 4;
}
k = Yt.prototype, k.mount = function(e) {
	return this.commit_timer &&= (clearTimeout(this.commit_timer), null), e.mount(this);
}, k.commit = function() {
	return this.commit_timer &&= (clearTimeout(this.commit_timer), null), this.db.commit(this);
}, k.destroy = function() {
	return this.commit_timer &&= (clearTimeout(this.commit_timer), null), this.db.destroy();
};
function Xt(e) {
	e.commit_timer ||= setTimeout(function() {
		e.commit_timer = null, e.db.commit(e);
	}, 1);
}
k.clear = function() {
	return this.map.clear(), this.ctx.clear(), this.reg.clear(), this.cache && this.cache.clear(), this.db ? (this.commit_timer && clearTimeout(this.commit_timer), this.commit_timer = null, this.commit_task = [], this.db.clear()) : this;
}, k.append = function(e, t) {
	return this.add(e, t, !0);
}, k.contain = function(e) {
	return this.db ? this.db.has(e) : this.reg.has(e);
}, k.update = function(e, t) {
	let n = this, r = this.remove(e);
	return r && r.then ? r.then(() => n.add(e, t)) : this.add(e, t);
}, k.cleanup = function() {
	return this.fastupdate ? (Vt(this.map), this.depth && Vt(this.ctx), this) : this;
}, k.searchCache = Le, k.export = function(e, t, n = 0, r = 0) {
	let i, a;
	switch (r) {
		case 0:
			i = "reg", a = Ft(this.reg);
			break;
		case 1:
			i = "cfg", a = null;
			break;
		case 2:
			i = "map", a = jt(this.map, this.reg.size);
			break;
		case 3:
			i = "ctx", a = Nt(this.ctx, this.reg.size);
			break;
		default: return;
	}
	return Lt.call(this, e, t, i, a, n, r);
}, k.import = function(e, t) {
	if (t) switch (typeof t == "string" && (t = JSON.parse(t)), e = e.split("."), e[e.length - 1] === "json" && e.pop(), e.length === 3 && e.shift(), e = e.length > 1 ? e[1] : e[0], e) {
		case "reg":
			this.fastupdate = !1, this.reg = It(t, this.reg);
			break;
		case "map":
			this.map = Mt(t, this.map);
			break;
		case "ctx": this.ctx = Pt(t, this.ctx);
	}
}, k.serialize = function(e = !0) {
	let t = "", n = "", r = "";
	if (this.reg.size) {
		let e;
		for (var i of this.reg.keys()) e ||= typeof i, t += (t ? "," : "") + (e === "string" ? "\"" + i + "\"" : i);
		t = "index.reg=new Set([" + t + "]);", n = Bt(this.map, e), n = "index.map=new Map([" + n + "]);";
		for (let t of this.ctx.entries()) {
			i = t[0];
			let n = Bt(t[1], e);
			n = "new Map([" + n + "])", n = "[\"" + i + "\"," + n + "]", r += (r ? "," : "") + n;
		}
		r = "index.ctx=new Map([" + r + "]);";
	}
	return e ? "function inject(index){" + t + n + r + "}" : t + n + r;
}, tt(Yt.prototype);
var Zt = typeof window < "u" && (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB), Qt = [
	"map",
	"ctx",
	"tag",
	"reg",
	"cfg"
], $t = A();
function en(e, t = {}) {
	if (!this || this.constructor !== en) return new en(e, t);
	typeof e == "object" && (t = e, e = e.name), e || console.info("Default storage space was used, because a name was not passed."), this.id = "flexsearch" + (e ? ":" + e.toLowerCase().replace(/[^a-z0-9_\-]/g, "") : ""), this.field = t.field ? t.field.toLowerCase().replace(/[^a-z0-9_\-]/g, "") : "", this.type = t.type, this.fastupdate = this.support_tag_search = !1, this.db = null, this.h = {};
}
k = en.prototype, k.mount = function(e) {
	return e.index ? e.mount(this) : (e.db = this, this.open());
}, k.open = function() {
	if (this.db) return this.db;
	let e = this;
	navigator.storage && navigator.storage.persist && navigator.storage.persist(), $t[e.id] || ($t[e.id] = []), $t[e.id].push(e.field);
	let t = Zt.open(e.id, 1);
	return t.onupgradeneeded = function() {
		let t = e.db = this.result;
		for (let n = 0, r; n < Qt.length; n++) {
			r = Qt[n];
			for (let n = 0, i; n < $t[e.id].length; n++) i = $t[e.id][n], t.objectStoreNames.contains(r + (r === "reg" ? "" : i ? ":" + i : "")) || t.createObjectStore(r + (r === "reg" ? "" : i ? ":" + i : ""));
		}
	}, e.db = nn(t, function(t) {
		e.db = t, e.db.onversionchange = function() {
			e.close();
		};
	});
}, k.close = function() {
	this.db && this.db.close(), this.db = null;
}, k.destroy = function() {
	return nn(Zt.deleteDatabase(this.id));
}, k.clear = function() {
	let e = [];
	for (let t = 0, n; t < Qt.length; t++) {
		n = Qt[t];
		for (let t = 0, r; t < $t[this.id].length; t++) r = $t[this.id][t], e.push(n + (n === "reg" ? "" : r ? ":" + r : ""));
	}
	let t = this.db.transaction(e, "readwrite");
	for (let n = 0; n < e.length; n++) t.objectStore(e[n]).clear();
	return nn(t);
}, k.get = function(e, t, n = 0, r = 0, i = !0, a = !1) {
	e = this.db.transaction((t ? "ctx" : "map") + (this.field ? ":" + this.field : ""), "readonly").objectStore((t ? "ctx" : "map") + (this.field ? ":" + this.field : "")).get(t ? t + ":" + e : e);
	let o = this;
	return nn(e).then(function(e) {
		let t = [];
		if (!e || !e.length) return t;
		if (i) {
			if (!n && !r && e.length === 1) return e[0];
			for (let i = 0, a; i < e.length; i++) if ((a = e[i]) && a.length) {
				if (r >= a.length) {
					r -= a.length;
					continue;
				}
				let e = n ? r + Math.min(a.length - r, n) : a.length;
				for (let n = r; n < e; n++) t.push(a[n]);
				if (r = 0, t.length === n) break;
			}
			return a ? o.enrich(t) : t;
		}
		return e;
	});
}, k.tag = function(e, t = 0, n = 0, r = !1) {
	e = this.db.transaction("tag" + (this.field ? ":" + this.field : ""), "readonly").objectStore("tag" + (this.field ? ":" + this.field : "")).get(e);
	let i = this;
	return nn(e).then(function(e) {
		return !e || !e.length || n >= e.length ? [] : !t && !n ? e : (e = e.slice(n, n + t), r ? i.enrich(e) : e);
	});
}, k.enrich = function(e) {
	typeof e != "object" && (e = [e]);
	let t = this.db.transaction("reg", "readonly").objectStore("reg"), n = [];
	for (let r = 0; r < e.length; r++) n[r] = nn(t.get(e[r]));
	return Promise.all(n).then(function(t) {
		for (let n = 0; n < t.length; n++) t[n] = {
			id: e[n],
			doc: t[n] ? JSON.parse(t[n]) : null
		};
		return t;
	});
}, k.has = function(e) {
	return e = this.db.transaction("reg", "readonly").objectStore("reg").getKey(e), nn(e).then(function(e) {
		return !!e;
	});
}, k.search = null, k.info = function() {}, k.transaction = function(e, t, n) {
	e += e === "reg" ? "" : this.field ? ":" + this.field : "";
	let r = this.h[e + ":" + t];
	if (r) return n.call(this, r);
	let i = this.db.transaction(e, t);
	this.h[e + ":" + t] = r = i.objectStore(e);
	let a = n.call(this, r);
	return this.h[e + ":" + t] = null, nn(i).finally(function() {
		return a;
	});
}, k.commit = async function(e) {
	let t = e.commit_task, n = [];
	e.commit_task = [];
	for (let e = 0, r; e < t.length; e++) r = t[e], r.del && n.push(r.del);
	n.length && await this.remove(n), e.reg.size && (await this.transaction("map", "readwrite", function(t) {
		for (let n of e.map) {
			let e = n[0], r = n[1];
			r.length && (t.get(e).onsuccess = function() {
				let n = this.result;
				var i;
				if (n && n.length) {
					let e = Math.max(n.length, r.length);
					for (let t = 0, a, o; t < e; t++) if ((o = r[t]) && o.length) {
						if ((a = n[t]) && a.length) for (i = 0; i < o.length; i++) a.push(o[i]);
						else n[t] = o;
						i = 1;
					}
				} else n = r, i = 1;
				i && t.put(n, e);
			});
		}
	}), await this.transaction("ctx", "readwrite", function(t) {
		for (let n of e.ctx) {
			let e = n[0], r = n[1];
			for (let n of r) {
				let r = n[0], i = n[1];
				i.length && (t.get(e + ":" + r).onsuccess = function() {
					let n = this.result;
					var a;
					if (n && n.length) {
						let e = Math.max(n.length, i.length);
						for (let t = 0, r, o; t < e; t++) if ((o = i[t]) && o.length) {
							if ((r = n[t]) && r.length) for (a = 0; a < o.length; a++) r.push(o[a]);
							else n[t] = o;
							a = 1;
						}
					} else n = i, a = 1;
					a && t.put(n, e + ":" + r);
				});
			}
		}
	}), e.store ? await this.transaction("reg", "readwrite", function(t) {
		for (let n of e.store) {
			let e = n[0], r = n[1];
			t.put(typeof r == "object" ? JSON.stringify(r) : 1, e);
		}
	}) : e.bypass || await this.transaction("reg", "readwrite", function(t) {
		for (let n of e.reg.keys()) t.put(1, n);
	}), e.tag && await this.transaction("tag", "readwrite", function(t) {
		for (let n of e.tag) {
			let e = n[0], r = n[1];
			r.length && (t.get(e).onsuccess = function() {
				let n = this.result;
				n = n && n.length ? n.concat(r) : r, t.put(n, e);
			});
		}
	}), e.map.clear(), e.ctx.clear(), e.tag && e.tag.clear(), e.store && e.store.clear(), e.document || e.reg.clear());
};
function tn(e, t, n) {
	let r = e.value, i, a = 0;
	for (let e = 0, o; e < r.length; e++) {
		if (o = n ? r : r[e]) {
			for (let n = 0, a, s; n < t.length; n++) if (s = t[n], a = o.indexOf(s), a >= 0) {
				if (i = 1, o.length > 1) o.splice(a, 1);
				else {
					r[e] = [];
					break;
				}
			}
			a += o.length;
		}
		if (n) break;
	}
	a ? i && e.update(r) : e.delete(), e.continue();
}
k.remove = function(e) {
	return typeof e != "object" && (e = [e]), Promise.all([
		this.transaction("map", "readwrite", function(t) {
			t.openCursor().onsuccess = function() {
				let t = this.result;
				t && tn(t, e);
			};
		}),
		this.transaction("ctx", "readwrite", function(t) {
			t.openCursor().onsuccess = function() {
				let t = this.result;
				t && tn(t, e);
			};
		}),
		this.transaction("tag", "readwrite", function(t) {
			t.openCursor().onsuccess = function() {
				let t = this.result;
				t && tn(t, e, !0);
			};
		}),
		this.transaction("reg", "readwrite", function(t) {
			for (let n = 0; n < e.length; n++) t.delete(e[n]);
		})
	]);
};
function nn(e, t) {
	return new Promise((n, r) => {
		e.onsuccess = e.oncomplete = function() {
			t && t(this.result), t = null, n(this.result);
		}, e.onerror = e.onblocked = r, e = null;
	});
}
var rn = Ge, an = Fe, on = Ot;
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/lib/index.js
function sn() {
	return new on({ document: {
		id: "id",
		store: !0,
		index: [{
			field: "name",
			tokenize: "bidirectional",
			priority: 9,
			encoder: new an(rn.LatinBalance).assign({ normalize(e) {
				let t = e.replace(/\d+/g, " ").split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/);
				return t.length > 1 && t.push(e), t.join(" ").toLowerCase();
			} })
		}, {
			field: "comment",
			tokenize: "default",
			encoder: rn.LatinSoundex
		}],
		tag: []
	} });
}
//#endregion
//#region node_modules/.pnpm/domelementtype@2.3.0/node_modules/domelementtype/lib/esm/index.js
var M;
(function(e) {
	e.Root = "root", e.Text = "text", e.Directive = "directive", e.Comment = "comment", e.Script = "script", e.Style = "style", e.Tag = "tag", e.CDATA = "cdata", e.Doctype = "doctype";
})(M ||= {});
function cn(e) {
	return e.type === M.Tag || e.type === M.Script || e.type === M.Style;
}
var ln = M.Root, un = M.Text, dn = M.Directive, fn = M.Comment, pn = M.Script, mn = M.Style, hn = M.Tag, gn = M.CDATA, _n = M.Doctype, vn = class {
	constructor() {
		this.parent = null, this.prev = null, this.next = null, this.startIndex = null, this.endIndex = null;
	}
	get parentNode() {
		return this.parent;
	}
	set parentNode(e) {
		this.parent = e;
	}
	get previousSibling() {
		return this.prev;
	}
	set previousSibling(e) {
		this.prev = e;
	}
	get nextSibling() {
		return this.next;
	}
	set nextSibling(e) {
		this.next = e;
	}
	cloneNode(e = !1) {
		return Mn(this, e);
	}
}, yn = class extends vn {
	constructor(e) {
		super(), this.data = e;
	}
	get nodeValue() {
		return this.data;
	}
	set nodeValue(e) {
		this.data = e;
	}
}, bn = class extends yn {
	constructor() {
		super(...arguments), this.type = M.Text;
	}
	get nodeType() {
		return 3;
	}
}, xn = class extends yn {
	constructor() {
		super(...arguments), this.type = M.Comment;
	}
	get nodeType() {
		return 8;
	}
}, Sn = class extends yn {
	constructor(e, t) {
		super(t), this.name = e, this.type = M.Directive;
	}
	get nodeType() {
		return 1;
	}
}, Cn = class extends vn {
	constructor(e) {
		super(), this.children = e;
	}
	get firstChild() {
		return this.children[0] ?? null;
	}
	get lastChild() {
		return this.children.length > 0 ? this.children[this.children.length - 1] : null;
	}
	get childNodes() {
		return this.children;
	}
	set childNodes(e) {
		this.children = e;
	}
}, wn = class extends Cn {
	constructor() {
		super(...arguments), this.type = M.CDATA;
	}
	get nodeType() {
		return 4;
	}
}, Tn = class extends Cn {
	constructor() {
		super(...arguments), this.type = M.Root;
	}
	get nodeType() {
		return 9;
	}
}, En = class extends Cn {
	constructor(e, t, n = [], r = e === "script" ? M.Script : e === "style" ? M.Style : M.Tag) {
		super(n), this.name = e, this.attribs = t, this.type = r;
	}
	get nodeType() {
		return 1;
	}
	get tagName() {
		return this.name;
	}
	set tagName(e) {
		this.name = e;
	}
	get attributes() {
		return Object.keys(this.attribs).map((e) => ({
			name: e,
			value: this.attribs[e],
			namespace: this["x-attribsNamespace"]?.[e],
			prefix: this["x-attribsPrefix"]?.[e]
		}));
	}
};
function N(e) {
	return cn(e);
}
function Dn(e) {
	return e.type === M.CDATA;
}
function On(e) {
	return e.type === M.Text;
}
function kn(e) {
	return e.type === M.Comment;
}
function An(e) {
	return e.type === M.Directive;
}
function jn(e) {
	return e.type === M.Root;
}
function P(e) {
	return Object.prototype.hasOwnProperty.call(e, "children");
}
function Mn(e, t = !1) {
	let n;
	if (On(e)) n = new bn(e.data);
	else if (kn(e)) n = new xn(e.data);
	else if (N(e)) {
		let r = t ? Nn(e.children) : [], i = new En(e.name, { ...e.attribs }, r);
		r.forEach((e) => e.parent = i), e.namespace != null && (i.namespace = e.namespace), e["x-attribsNamespace"] && (i["x-attribsNamespace"] = { ...e["x-attribsNamespace"] }), e["x-attribsPrefix"] && (i["x-attribsPrefix"] = { ...e["x-attribsPrefix"] }), n = i;
	} else if (Dn(e)) {
		let r = t ? Nn(e.children) : [], i = new wn(r);
		r.forEach((e) => e.parent = i), n = i;
	} else if (jn(e)) {
		let r = t ? Nn(e.children) : [], i = new Tn(r);
		r.forEach((e) => e.parent = i), e["x-mode"] && (i["x-mode"] = e["x-mode"]), n = i;
	} else if (An(e)) {
		let t = new Sn(e.name, e.data);
		e["x-name"] != null && (t["x-name"] = e["x-name"], t["x-publicId"] = e["x-publicId"], t["x-systemId"] = e["x-systemId"]), n = t;
	} else throw Error(`Not implemented yet: ${e.type}`);
	return n.startIndex = e.startIndex, n.endIndex = e.endIndex, e.sourceCodeLocation != null && (n.sourceCodeLocation = e.sourceCodeLocation), n;
}
function Nn(e) {
	let t = e.map((e) => Mn(e, !0));
	for (let e = 1; e < t.length; e++) t[e].prev = t[e - 1], t[e - 1].next = t[e];
	return t;
}
//#endregion
//#region node_modules/.pnpm/domhandler@5.0.3/node_modules/domhandler/lib/esm/index.js
var Pn = {
	withStartIndices: !1,
	withEndIndices: !1,
	xmlMode: !1
}, Fn = class {
	constructor(e, t, n) {
		this.dom = [], this.root = new Tn(this.dom), this.done = !1, this.tagStack = [this.root], this.lastNode = null, this.parser = null, typeof t == "function" && (n = t, t = Pn), typeof e == "object" && (t = e, e = void 0), this.callback = e ?? null, this.options = t ?? Pn, this.elementCB = n ?? null;
	}
	onparserinit(e) {
		this.parser = e;
	}
	onreset() {
		this.dom = [], this.root = new Tn(this.dom), this.done = !1, this.tagStack = [this.root], this.lastNode = null, this.parser = null;
	}
	onend() {
		this.done || (this.done = !0, this.parser = null, this.handleCallback(null));
	}
	onerror(e) {
		this.handleCallback(e);
	}
	onclosetag() {
		this.lastNode = null;
		let e = this.tagStack.pop();
		this.options.withEndIndices && (e.endIndex = this.parser.endIndex), this.elementCB && this.elementCB(e);
	}
	onopentag(e, t) {
		let n = new En(e, t, void 0, this.options.xmlMode ? M.Tag : void 0);
		this.addNode(n), this.tagStack.push(n);
	}
	ontext(e) {
		let { lastNode: t } = this;
		if (t && t.type === M.Text) t.data += e, this.options.withEndIndices && (t.endIndex = this.parser.endIndex);
		else {
			let t = new bn(e);
			this.addNode(t), this.lastNode = t;
		}
	}
	oncomment(e) {
		if (this.lastNode && this.lastNode.type === M.Comment) {
			this.lastNode.data += e;
			return;
		}
		let t = new xn(e);
		this.addNode(t), this.lastNode = t;
	}
	oncommentend() {
		this.lastNode = null;
	}
	oncdatastart() {
		let e = new bn(""), t = new wn([e]);
		this.addNode(t), e.parent = t, this.lastNode = e;
	}
	oncdataend() {
		this.lastNode = null;
	}
	onprocessinginstruction(e, t) {
		let n = new Sn(e, t);
		this.addNode(n);
	}
	handleCallback(e) {
		if (typeof this.callback == "function") this.callback(e, this.dom);
		else if (e) throw e;
	}
	addNode(e) {
		let t = this.tagStack[this.tagStack.length - 1], n = t.children[t.children.length - 1];
		this.options.withStartIndices && (e.startIndex = this.parser.startIndex), this.options.withEndIndices && (e.endIndex = this.parser.endIndex), t.children.push(e), n && (e.prev = n, n.next = e), e.parent = t, this.lastNode = null;
	}
}, In = /["&'<>$\x80-\uFFFF]/g, Ln = /* @__PURE__ */ new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[39, "&apos;"],
	[60, "&lt;"],
	[62, "&gt;"]
]), Rn = String.prototype.codePointAt == null ? (e, t) => (e.charCodeAt(t) & 64512) == 55296 ? (e.charCodeAt(t) - 55296) * 1024 + e.charCodeAt(t + 1) - 56320 + 65536 : e.charCodeAt(t) : (e, t) => e.codePointAt(t);
function zn(e) {
	let t = "", n = 0, r;
	for (; (r = In.exec(e)) !== null;) {
		let i = r.index, a = e.charCodeAt(i), o = Ln.get(a);
		o === void 0 ? (t += `${e.substring(n, i)}&#x${Rn(e, i).toString(16)};`, n = In.lastIndex += Number((a & 64512) == 55296)) : (t += e.substring(n, i) + o, n = i + 1);
	}
	return t + e.substr(n);
}
function Bn(e, t) {
	return function(n) {
		let r, i = 0, a = "";
		for (; r = e.exec(n);) i !== r.index && (a += n.substring(i, r.index)), a += t.get(r[0].charCodeAt(0)), i = r.index + 1;
		return a + n.substring(i);
	};
}
var Vn = Bn(/["&\u00A0]/g, /* @__PURE__ */ new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[160, "&nbsp;"]
])), Hn = Bn(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
	[38, "&amp;"],
	[60, "&lt;"],
	[62, "&gt;"],
	[160, "&nbsp;"]
])), Un = new Map((/* @__PURE__ */ "altGlyph.altGlyphDef.altGlyphItem.animateColor.animateMotion.animateTransform.clipPath.feBlend.feColorMatrix.feComponentTransfer.feComposite.feConvolveMatrix.feDiffuseLighting.feDisplacementMap.feDistantLight.feDropShadow.feFlood.feFuncA.feFuncB.feFuncG.feFuncR.feGaussianBlur.feImage.feMerge.feMergeNode.feMorphology.feOffset.fePointLight.feSpecularLighting.feSpotLight.feTile.feTurbulence.foreignObject.glyphRef.linearGradient.radialGradient.textPath".split(".")).map((e) => [e.toLowerCase(), e])), Wn = new Map((/* @__PURE__ */ "definitionURL.attributeName.attributeType.baseFrequency.baseProfile.calcMode.clipPathUnits.diffuseConstant.edgeMode.filterUnits.glyphRef.gradientTransform.gradientUnits.kernelMatrix.kernelUnitLength.keyPoints.keySplines.keyTimes.lengthAdjust.limitingConeAngle.markerHeight.markerUnits.markerWidth.maskContentUnits.maskUnits.numOctaves.pathLength.patternContentUnits.patternTransform.patternUnits.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.refX.refY.repeatCount.repeatDur.requiredExtensions.requiredFeatures.specularConstant.specularExponent.spreadMethod.startOffset.stdDeviation.stitchTiles.surfaceScale.systemLanguage.tableValues.targetX.targetY.textLength.viewBox.viewTarget.xChannelSelector.yChannelSelector.zoomAndPan".split(".")).map((e) => [e.toLowerCase(), e])), Gn = /* @__PURE__ */ new Set([
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
]);
function Kn(e) {
	return e.replace(/"/g, "&quot;");
}
function qn(e, t) {
	if (!e) return;
	let n = (t.encodeEntities ?? t.decodeEntities) === !1 ? Kn : t.xmlMode || t.encodeEntities !== "utf8" ? zn : Vn;
	return Object.keys(e).map((r) => {
		let i = e[r] ?? "";
		return t.xmlMode === "foreign" && (r = Wn.get(r) ?? r), !t.emptyAttrs && !t.xmlMode && i === "" ? r : `${r}="${n(i)}"`;
	}).join(" ");
}
var Jn = /* @__PURE__ */ new Set([
	"area",
	"base",
	"basefont",
	"br",
	"col",
	"command",
	"embed",
	"frame",
	"hr",
	"img",
	"input",
	"isindex",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
function Yn(e, t = {}) {
	let n = "length" in e ? e : [e], r = "";
	for (let e = 0; e < n.length; e++) r += Xn(n[e], t);
	return r;
}
function Xn(e, t) {
	switch (e.type) {
		case ln: return Yn(e.children, t);
		case _n:
		case dn: return er(e);
		case fn: return rr(e);
		case gn: return nr(e);
		case pn:
		case mn:
		case hn: return $n(e, t);
		case un: return tr(e, t);
	}
}
var Zn = /* @__PURE__ */ new Set([
	"mi",
	"mo",
	"mn",
	"ms",
	"mtext",
	"annotation-xml",
	"foreignObject",
	"desc",
	"title"
]), Qn = /* @__PURE__ */ new Set(["svg", "math"]);
function $n(e, t) {
	t.xmlMode === "foreign" && (e.name = Un.get(e.name) ?? e.name, e.parent && Zn.has(e.parent.name) && (t = {
		...t,
		xmlMode: !1
	})), !t.xmlMode && Qn.has(e.name) && (t = {
		...t,
		xmlMode: "foreign"
	});
	let n = `<${e.name}`, r = qn(e.attribs, t);
	return r && (n += ` ${r}`), e.children.length === 0 && (t.xmlMode ? t.selfClosingTags !== !1 : t.selfClosingTags && Jn.has(e.name)) ? (t.xmlMode || (n += " "), n += "/>") : (n += ">", e.children.length > 0 && (n += Yn(e.children, t)), (t.xmlMode || !Jn.has(e.name)) && (n += `</${e.name}>`)), n;
}
function er(e) {
	return `<${e.data}>`;
}
function tr(e, t) {
	let n = e.data || "";
	return (t.encodeEntities ?? t.decodeEntities) !== !1 && !(!t.xmlMode && e.parent && Gn.has(e.parent.name)) && (n = t.xmlMode || t.encodeEntities !== "utf8" ? zn(n) : Hn(n)), n;
}
function nr(e) {
	return `<![CDATA[${e.children[0].data}]]>`;
}
function rr(e) {
	return `<!--${e.data}-->`;
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/stringify.js
function ir(e, t) {
	return Yn(e, t);
}
function ar(e, t) {
	return P(e) ? e.children.map((e) => ir(e, t)).join("") : "";
}
function or(e) {
	return Array.isArray(e) ? e.map(or).join("") : N(e) ? e.name === "br" ? "\n" : or(e.children) : Dn(e) ? or(e.children) : On(e) ? e.data : "";
}
function sr(e) {
	return Array.isArray(e) ? e.map(sr).join("") : P(e) && !kn(e) ? sr(e.children) : On(e) ? e.data : "";
}
function cr(e) {
	return Array.isArray(e) ? e.map(cr).join("") : P(e) && (e.type === M.Tag || Dn(e)) ? cr(e.children) : On(e) ? e.data : "";
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/traversal.js
function lr(e) {
	return P(e) ? e.children : [];
}
function ur(e) {
	return e.parent || null;
}
function dr(e) {
	let t = ur(e);
	if (t != null) return lr(t);
	let n = [e], { prev: r, next: i } = e;
	for (; r != null;) n.unshift(r), {prev: r} = r;
	for (; i != null;) n.push(i), {next: i} = i;
	return n;
}
function fr(e, t) {
	return e.attribs?.[t];
}
function pr(e, t) {
	return e.attribs != null && Object.prototype.hasOwnProperty.call(e.attribs, t) && e.attribs[t] != null;
}
function mr(e) {
	return e.name;
}
function hr(e) {
	let { next: t } = e;
	for (; t !== null && !N(t);) ({next: t} = t);
	return t;
}
function gr(e) {
	let { prev: t } = e;
	for (; t !== null && !N(t);) ({prev: t} = t);
	return t;
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/manipulation.js
function _r(e) {
	if (e.prev && (e.prev.next = e.next), e.next && (e.next.prev = e.prev), e.parent) {
		let t = e.parent.children, n = t.lastIndexOf(e);
		n >= 0 && t.splice(n, 1);
	}
	e.next = null, e.prev = null, e.parent = null;
}
function vr(e, t) {
	let n = t.prev = e.prev;
	n && (n.next = t);
	let r = t.next = e.next;
	r && (r.prev = t);
	let i = t.parent = e.parent;
	if (i) {
		let n = i.children;
		n[n.lastIndexOf(e)] = t, e.parent = null;
	}
}
function yr(e, t) {
	if (_r(t), t.next = null, t.parent = e, e.children.push(t) > 1) {
		let n = e.children[e.children.length - 2];
		n.next = t, t.prev = n;
	} else t.prev = null;
}
function br(e, t) {
	_r(t);
	let { parent: n } = e, r = e.next;
	if (t.next = r, t.prev = e, e.next = t, t.parent = n, r) {
		if (r.prev = t, n) {
			let e = n.children;
			e.splice(e.lastIndexOf(r), 0, t);
		}
	} else n && n.children.push(t);
}
function xr(e, t) {
	if (_r(t), t.parent = e, t.prev = null, e.children.unshift(t) !== 1) {
		let n = e.children[1];
		n.prev = t, t.next = n;
	} else t.next = null;
}
function Sr(e, t) {
	_r(t);
	let { parent: n } = e;
	if (n) {
		let r = n.children;
		r.splice(r.indexOf(e), 0, t);
	}
	e.prev && (e.prev.next = t), t.parent = n, t.prev = e.prev, t.next = e, e.prev = t;
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/querying.js
function Cr(e, t, n = !0, r = Infinity) {
	return wr(e, Array.isArray(t) ? t : [t], n, r);
}
function wr(e, t, n, r) {
	let i = [], a = [Array.isArray(t) ? t : [t]], o = [0];
	for (;;) {
		if (o[0] >= a[0].length) {
			if (o.length === 1) return i;
			a.shift(), o.shift();
			continue;
		}
		let t = a[0][o[0]++];
		if (e(t) && (i.push(t), --r <= 0)) return i;
		n && P(t) && t.children.length > 0 && (o.unshift(0), a.unshift(t.children));
	}
}
function Tr(e, t) {
	return t.find(e);
}
function Er(e, t, n = !0) {
	let r = Array.isArray(t) ? t : [t];
	for (let t = 0; t < r.length; t++) {
		let i = r[t];
		if (N(i) && e(i)) return i;
		if (n && P(i) && i.children.length > 0) {
			let t = Er(e, i.children, !0);
			if (t) return t;
		}
	}
	return null;
}
function Dr(e, t) {
	return (Array.isArray(t) ? t : [t]).some((t) => N(t) && e(t) || P(t) && Dr(e, t.children));
}
function Or(e, t) {
	let n = [], r = [Array.isArray(t) ? t : [t]], i = [0];
	for (;;) {
		if (i[0] >= r[0].length) {
			if (r.length === 1) return n;
			r.shift(), i.shift();
			continue;
		}
		let t = r[0][i[0]++];
		N(t) && e(t) && n.push(t), P(t) && t.children.length > 0 && (i.unshift(0), r.unshift(t.children));
	}
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/legacy.js
var kr = {
	tag_name(e) {
		return typeof e == "function" ? (t) => N(t) && e(t.name) : e === "*" ? N : (t) => N(t) && t.name === e;
	},
	tag_type(e) {
		return typeof e == "function" ? (t) => e(t.type) : (t) => t.type === e;
	},
	tag_contains(e) {
		return typeof e == "function" ? (t) => On(t) && e(t.data) : (t) => On(t) && t.data === e;
	}
};
function Ar(e, t) {
	return typeof t == "function" ? (n) => N(n) && t(n.attribs[e]) : (n) => N(n) && n.attribs[e] === t;
}
function jr(e, t) {
	return (n) => e(n) || t(n);
}
function Mr(e) {
	let t = Object.keys(e).map((t) => {
		let n = e[t];
		return Object.prototype.hasOwnProperty.call(kr, t) ? kr[t](n) : Ar(t, n);
	});
	return t.length === 0 ? null : t.reduce(jr);
}
function Nr(e, t) {
	let n = Mr(e);
	return !n || n(t);
}
function Pr(e, t, n, r = Infinity) {
	let i = Mr(e);
	return i ? Cr(i, t, n, r) : [];
}
function Fr(e, t, n = !0) {
	return Array.isArray(t) || (t = [t]), Er(Ar("id", e), t, n);
}
function Ir(e, t, n = !0, r = Infinity) {
	return Cr(kr.tag_name(e), t, n, r);
}
function Lr(e, t, n = !0, r = Infinity) {
	return Cr(Ar("class", e), t, n, r);
}
function Rr(e, t, n = !0, r = Infinity) {
	return Cr(kr.tag_type(e), t, n, r);
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/helpers.js
function zr(e) {
	let t = e.length;
	for (; --t >= 0;) {
		let n = e[t];
		if (t > 0 && e.lastIndexOf(n, t - 1) >= 0) {
			e.splice(t, 1);
			continue;
		}
		for (let r = n.parent; r; r = r.parent) if (e.includes(r)) {
			e.splice(t, 1);
			break;
		}
	}
	return e;
}
var Br;
(function(e) {
	e[e.DISCONNECTED = 1] = "DISCONNECTED", e[e.PRECEDING = 2] = "PRECEDING", e[e.FOLLOWING = 4] = "FOLLOWING", e[e.CONTAINS = 8] = "CONTAINS", e[e.CONTAINED_BY = 16] = "CONTAINED_BY";
})(Br ||= {});
function Vr(e, t) {
	let n = [], r = [];
	if (e === t) return 0;
	let i = P(e) ? e : e.parent;
	for (; i;) n.unshift(i), i = i.parent;
	for (i = P(t) ? t : t.parent; i;) r.unshift(i), i = i.parent;
	let a = Math.min(n.length, r.length), o = 0;
	for (; o < a && n[o] === r[o];) o++;
	if (o === 0) return Br.DISCONNECTED;
	let s = n[o - 1], c = s.children, l = n[o], u = r[o];
	return c.indexOf(l) > c.indexOf(u) ? s === t ? Br.FOLLOWING | Br.CONTAINED_BY : Br.FOLLOWING : s === e ? Br.PRECEDING | Br.CONTAINS : Br.PRECEDING;
}
function Hr(e) {
	return e = e.filter((e, t, n) => !n.includes(e, t + 1)), e.sort((e, t) => {
		let n = Vr(e, t);
		return n & Br.PRECEDING ? -1 : n & Br.FOLLOWING ? 1 : 0;
	}), e;
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/feeds.js
function Ur(e) {
	let t = Yr(Qr, e);
	return t ? t.name === "feed" ? Wr(t) : Gr(t) : null;
}
function Wr(e) {
	let t = e.children, n = {
		type: "atom",
		items: Ir("entry", t).map((e) => {
			let { children: t } = e, n = { media: Jr(t) };
			Zr(n, "id", "id", t), Zr(n, "title", "title", t);
			let r = Yr("link", t)?.attribs.href;
			r && (n.link = r);
			let i = Xr("summary", t) || Xr("content", t);
			i && (n.description = i);
			let a = Xr("updated", t);
			return a && (n.pubDate = new Date(a)), n;
		})
	};
	Zr(n, "id", "id", t), Zr(n, "title", "title", t);
	let r = Yr("link", t)?.attribs.href;
	r && (n.link = r), Zr(n, "description", "subtitle", t);
	let i = Xr("updated", t);
	return i && (n.updated = new Date(i)), Zr(n, "author", "email", t, !0), n;
}
function Gr(e) {
	let t = Yr("channel", e.children)?.children ?? [], n = {
		type: e.name.substr(0, 3),
		id: "",
		items: Ir("item", e.children).map((e) => {
			let { children: t } = e, n = { media: Jr(t) };
			Zr(n, "id", "guid", t), Zr(n, "title", "title", t), Zr(n, "link", "link", t), Zr(n, "description", "description", t);
			let r = Xr("pubDate", t) || Xr("dc:date", t);
			return r && (n.pubDate = new Date(r)), n;
		})
	};
	Zr(n, "title", "title", t), Zr(n, "link", "link", t), Zr(n, "description", "description", t);
	let r = Xr("lastBuildDate", t);
	return r && (n.updated = new Date(r)), Zr(n, "author", "managingEditor", t, !0), n;
}
var Kr = [
	"url",
	"type",
	"lang"
], qr = [
	"fileSize",
	"bitrate",
	"framerate",
	"samplingrate",
	"channels",
	"duration",
	"height",
	"width"
];
function Jr(e) {
	return Ir("media:content", e).map((e) => {
		let { attribs: t } = e, n = {
			medium: t.medium,
			isDefault: !!t.isDefault
		};
		for (let e of Kr) t[e] && (n[e] = t[e]);
		for (let e of qr) t[e] && (n[e] = parseInt(t[e], 10));
		return t.expression && (n.expression = t.expression), n;
	});
}
function Yr(e, t) {
	return Ir(e, t, !0, 1)[0];
}
function Xr(e, t, n = !1) {
	return sr(Ir(e, t, n, 1)).trim();
}
function Zr(e, t, n, r, i = !1) {
	let a = Xr(n, r, i);
	a && (e[t] = a);
}
function Qr(e) {
	return e === "rss" || e === "feed" || e === "rdf:RDF";
}
//#endregion
//#region node_modules/.pnpm/domutils@3.2.2/node_modules/domutils/lib/esm/index.js
var $r = /* @__PURE__ */ m({
	DocumentPosition: () => Br,
	append: () => br,
	appendChild: () => yr,
	compareDocumentPosition: () => Vr,
	existsOne: () => Dr,
	filter: () => Cr,
	find: () => wr,
	findAll: () => Or,
	findOne: () => Er,
	findOneChild: () => Tr,
	getAttributeValue: () => fr,
	getChildren: () => lr,
	getElementById: () => Fr,
	getElements: () => Pr,
	getElementsByClassName: () => Lr,
	getElementsByTagName: () => Ir,
	getElementsByTagType: () => Rr,
	getFeed: () => Ur,
	getInnerHTML: () => ar,
	getName: () => mr,
	getOuterHTML: () => ir,
	getParent: () => ur,
	getSiblings: () => dr,
	getText: () => or,
	hasAttrib: () => pr,
	hasChildren: () => P,
	innerText: () => cr,
	isCDATA: () => Dn,
	isComment: () => kn,
	isDocument: () => jn,
	isTag: () => N,
	isText: () => On,
	nextElementSibling: () => hr,
	prepend: () => Sr,
	prependChild: () => xr,
	prevElementSibling: () => gr,
	removeElement: () => _r,
	removeSubsets: () => zr,
	replaceElement: () => vr,
	testElement: () => Nr,
	textContent: () => sr,
	uniqueSort: () => Hr
}), ei = { _useHtmlParser2: !1 };
function ti(e, t) {
	if (!e) return t ?? ei;
	let n = {
		_useHtmlParser2: !!e.xmlMode,
		...t,
		...e
	};
	return e.xml ? (n._useHtmlParser2 = !0, n.xmlMode = !0, e.xml !== !0 && Object.assign(n, e.xml)) : e.xmlMode && (n._useHtmlParser2 = !0), n;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/static.js
var ni = /* @__PURE__ */ m({
	contains: () => ui,
	extract: () => di,
	html: () => ai,
	merge: () => fi,
	parseHTML: () => ci,
	root: () => li,
	text: () => si,
	xml: () => oi
});
function ri(e, t, n) {
	return e ? e(t ?? e._root.children, null, void 0, n).toString() : "";
}
function ii(e, t) {
	return !t && typeof e == "object" && !!e && !("length" in e) && !("type" in e);
}
function ai(e, t) {
	let n = ii(e) ? (t = e, void 0) : e, r = {
		...this === null || this === void 0 ? void 0 : this._options,
		...ti(t)
	};
	return ri(this, n, r);
}
function oi(e) {
	let t = {
		...this._options,
		xmlMode: !0
	};
	return ri(this, e, t);
}
function si(e) {
	let t = e ?? (this ? this.root() : []), n = "";
	for (let e = 0; e < t.length; e++) n += sr(t[e]);
	return n;
}
function ci(e, t, n = typeof t == "boolean" && t) {
	if (!e || typeof e != "string") return null;
	typeof t == "boolean" && (n = t);
	let r = this.load(e, this._options, !1);
	return n || r("script").remove(), [...r.root()[0].children];
}
function li() {
	return this(this._root);
}
function ui(e, t) {
	if (t === e) return !1;
	let n = t;
	for (; n && n !== n.parent;) if (n = n.parent, n === e) return !0;
	return !1;
}
function di(e) {
	return this.root().extract(e);
}
function fi(e, t) {
	if (!pi(e) || !pi(t)) return;
	let n = e.length, r = +t.length;
	for (let i = 0; i < r; i++) e[n++] = t[i];
	return e.length = n, e;
}
function pi(e) {
	if (Array.isArray(e)) return !0;
	if (typeof e != "object" || !e || !("length" in e) || typeof e.length != "number" || e.length < 0) return !1;
	for (let t = 0; t < e.length; t++) if (!(t in e)) return !1;
	return !0;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/utils.js
function mi(e) {
	return e.cheerio != null;
}
function hi(e) {
	return e.replace(/[._-](\w|$)/g, (e, t) => t.toUpperCase());
}
function gi(e) {
	return e.replace(/[A-Z]/g, "-$&").toLowerCase();
}
function F(e, t) {
	let n = e.length;
	for (let r = 0; r < n; r++) t(e[r], r);
	return e;
}
var _i;
(function(e) {
	e[e.LowerA = 97] = "LowerA", e[e.LowerZ = 122] = "LowerZ", e[e.UpperA = 65] = "UpperA", e[e.UpperZ = 90] = "UpperZ", e[e.Exclamation = 33] = "Exclamation";
})(_i ||= {});
function vi(e) {
	if (typeof e != "string") return !1;
	let t = e.indexOf("<");
	if (t === -1 || t > e.length - 3) return !1;
	let n = e.charCodeAt(t + 1);
	return (n >= _i.LowerA && n <= _i.LowerZ || n >= _i.UpperA && n <= _i.UpperZ || n === _i.Exclamation) && e.includes(">", t + 2);
}
//#endregion
//#region node_modules/.pnpm/entities@7.0.1/node_modules/entities/dist/esm/decode-codepoint.js
var yi = /* @__PURE__ */ new Map([
	[0, 65533],
	[128, 8364],
	[130, 8218],
	[131, 402],
	[132, 8222],
	[133, 8230],
	[134, 8224],
	[135, 8225],
	[136, 710],
	[137, 8240],
	[138, 352],
	[139, 8249],
	[140, 338],
	[142, 381],
	[145, 8216],
	[146, 8217],
	[147, 8220],
	[148, 8221],
	[149, 8226],
	[150, 8211],
	[151, 8212],
	[152, 732],
	[153, 8482],
	[154, 353],
	[155, 8250],
	[156, 339],
	[158, 382],
	[159, 376]
]), bi = String.fromCodePoint ?? ((e) => {
	let t = "";
	return e > 65535 && (e -= 65536, t += String.fromCharCode(e >>> 10 & 1023 | 55296), e = 56320 | e & 1023), t += String.fromCharCode(e), t;
});
function xi(e) {
	return e >= 55296 && e <= 57343 || e > 1114111 ? 65533 : yi.get(e) ?? e;
}
//#endregion
//#region node_modules/.pnpm/entities@7.0.1/node_modules/entities/dist/esm/internal/decode-shared.js
function Si(e) {
	let t = typeof atob == "function" ? atob(e) : typeof Buffer.from == "function" ? Buffer.from(e, "base64").toString("binary") : new Buffer(e, "base64").toString("binary"), n = t.length & -2, r = new Uint16Array(n / 2);
	for (let e = 0, i = 0; e < n; e += 2) {
		let n = t.charCodeAt(e), a = t.charCodeAt(e + 1);
		r[i++] = n | a << 8;
	}
	return r;
}
//#endregion
//#region node_modules/.pnpm/entities@7.0.1/node_modules/entities/dist/esm/generated/decode-data-html.js
var Ci = /* #__PURE__ */ Si("QR08ALkAAgH6AYsDNQR2BO0EPgXZBQEGLAbdBxMISQrvCmQLfQurDKQNLw4fD4YPpA+6D/IPAAAAAAAAAAAAAAAAKhBMEY8TmxUWF2EYLBkxGuAa3RsJHDscWR8YIC8jSCSIJcMl6ie3Ku8rEC0CLjoupS7kLgAIRU1hYmNmZ2xtbm9wcnN0dVQAWgBeAGUAaQBzAHcAfgCBAIQAhwCSAJoAoACsALMAbABpAGcAO4DGAMZAUAA7gCYAJkBjAHUAdABlADuAwQDBQHIiZXZlAAJhAAFpeW0AcgByAGMAO4DCAMJAEGRyAADgNdgE3XIAYQB2AGUAO4DAAMBA8CFoYZFj4SFjcgBhZAAAoFMqAAFncIsAjgBvAG4ABGFmAADgNdg43fAlbHlGdW5jdGlvbgCgYSBpAG4AZwA7gMUAxUAAAWNzpACoAHIAAOA12Jzc6SFnbgCgVCJpAGwAZABlADuAwwDDQG0AbAA7gMQAxEAABGFjZWZvcnN1xQDYANoA7QDxAPYA+QD8AAABY3LJAM8AayNzbGFzaAAAoBYidgHTANUAAKDnKmUAZAAAoAYjeQARZIABY3J0AOAA5QDrAGEidXNlAACgNSLuI291bGxpcwCgLCFhAJJjcgAA4DXYBd1wAGYAAOA12Dnd5SF2ZdhiYwDyAOoAbSJwZXEAAKBOIgAHSE9hY2RlZmhpbG9yc3UXARoBHwE6AVIBVQFiAWQBZgGCAakB6QHtAfIBYwB5ACdkUABZADuAqQCpQIABY3B5ACUBKAE1AfUhdGUGYWmg0iJ0KGFsRGlmZmVyZW50aWFsRAAAoEUhbCJleXMAAKAtIQACYWVpb0EBRAFKAU0B8iFvbgxhZABpAGwAO4DHAMdAcgBjAAhhbiJpbnQAAKAwIm8AdAAKYQABZG5ZAV0BaSJsbGEAuGB0I2VyRG90ALdg8gA5AWkAp2NyImNsZQAAAkRNUFRwAXQBeQF9AW8AdAAAoJkiaSJudXMAAKCWIuwhdXMAoJUiaSJtZXMAAKCXIm8AAAFjc4cBlAFrKndpc2VDb250b3VySW50ZWdyYWwAAKAyImUjQ3VybHkAAAFEUZwBpAFvJXVibGVRdW90ZQAAoB0gdSJvdGUAAKAZIAACbG5wdbABtgHNAdgBbwBuAGWgNyIAoHQqgAFnaXQAvAHBAcUB8iJ1ZW50AKBhIm4AdAAAoC8i7yV1ckludGVncmFsAKAuIgABZnLRAdMBAKACIe8iZHVjdACgECJuLnRlckNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbAAAoDMi7yFzcwCgLypjAHIAAOA12J7ccABDoNMiYQBwAACgTSKABURKU1phY2VmaW9zAAsCEgIVAhgCGwIsAjQCOQI9AnMCfwNvoEUh9CJyYWhkAKARKWMAeQACZGMAeQAFZGMAeQAPZIABZ3JzACECJQIoAuchZXIAoCEgcgAAoKEhaAB2AACg5CoAAWF5MAIzAvIhb24OYRRkbAB0oAciYQCUY3IAAOA12AfdAAFhZkECawIAAWNtRQJnAvIjaXRpY2FsAAJBREdUUAJUAl8CYwJjInV0ZQC0YG8AdAFZAloC2WJiJGxlQWN1dGUA3WJyImF2ZQBgYGkibGRlANxi7yFuZACgxCJmJWVyZW50aWFsRAAAoEYhcAR9AgAAAAAAAIECjgIAABoDZgAA4DXYO91EoagAhQKJAm8AdAAAoNwgcSJ1YWwAAKBQIuIhbGUAA0NETFJVVpkCqAK1Au8C/wIRA28AbgB0AG8AdQByAEkAbgB0AGUAZwByAGEA7ADEAW8AdAKvAgAAAACwAqhgbiNBcnJvdwAAoNMhAAFlb7kC0AJmAHQAgAFBUlQAwQLGAs0CciJyb3cAAKDQIekkZ2h0QXJyb3cAoNQhZQDlACsCbgBnAAABTFLWAugC5SFmdAABQVLcAuECciJyb3cAAKD4J+kkZ2h0QXJyb3cAoPon6SRnaHRBcnJvdwCg+SdpImdodAAAAUFU9gL7AnIicm93AACg0iFlAGUAAKCoInAAQQIGAwAAAAALA3Iicm93AACg0SFvJHduQXJyb3cAAKDVIWUlcnRpY2FsQmFyAACgJSJuAAADQUJMUlRhJAM2AzoDWgNxA3oDciJyb3cAAKGTIUJVLAMwA2EAcgAAoBMpcCNBcnJvdwAAoPUhciJldmUAEWPlIWZ00gJDAwAASwMAAFIDaSVnaHRWZWN0b3IAAKBQKWUkZVZlY3RvcgAAoF4p5SJjdG9yQqC9IWEAcgAAoFYpaSJnaHQA1AFiAwAAaQNlJGVWZWN0b3IAAKBfKeUiY3RvckKgwSFhAHIAAKBXKWUAZQBBoKQiciJyb3cAAKCnIXIAcgBvAPcAtAIAAWN0gwOHA3IAAOA12J/c8iFvaxBhAAhOVGFjZGZnbG1vcHFzdHV4owOlA6kDsAO/A8IDxgPNA9ID8gP9AwEEFAQeBCAEJQRHAEphSAA7gNAA0EBjAHUAdABlADuAyQDJQIABYWl5ALYDuQO+A/Ihb24aYXIAYwA7gMoAykAtZG8AdAAWYXIAAOA12AjdcgBhAHYAZQA7gMgAyEDlIm1lbnQAoAgiAAFhcNYD2QNjAHIAEmF0AHkAUwLhAwAAAADpA20lYWxsU3F1YXJlAACg+yVlJ3J5U21hbGxTcXVhcmUAAKCrJQABZ3D2A/kDbwBuABhhZgAA4DXYPN3zImlsb26VY3UAAAFhaQYEDgRsAFSgdSppImxkZQAAoEIi7CNpYnJpdW0AoMwhAAFjaRgEGwRyAACgMCFtAACgcyphAJdjbQBsADuAywDLQAABaXApBC0E8yF0cwCgAyLvJG5lbnRpYWxFAKBHIYACY2Zpb3MAPQQ/BEMEXQRyBHkAJGRyAADgNdgJ3WwibGVkAFMCTAQAAAAAVARtJWFsbFNxdWFyZQAAoPwlZSdyeVNtYWxsU3F1YXJlAACgqiVwA2UEAABpBAAAAABtBGYAAOA12D3dwSFsbACgACLyI2llcnRyZgCgMSFjAPIAcQQABkpUYWJjZGZnb3JzdIgEiwSOBJMElwSkBKcEqwStBLIE5QTqBGMAeQADZDuAPgA+QO0hbWFkoJMD3GNyImV2ZQAeYYABZWl5AJ0EoASjBOQhaWwiYXIAYwAcYRNkbwB0ACBhcgAA4DXYCt0AoNkicABmAADgNdg+3eUiYXRlcgADRUZHTFNUvwTIBM8E1QTZBOAEcSJ1YWwATKBlIuUhc3MAoNsidSRsbEVxdWFsAACgZyJyI2VhdGVyAACgoirlIXNzAKB3IuwkYW50RXF1YWwAoH4qaSJsZGUAAKBzImMAcgAA4DXYotwAoGsiAARBYWNmaW9zdfkE/QQFBQgFCwUTBSIFKwVSIkRjeQAqZAABY3QBBQQFZQBrAMdiXmDpIXJjJGFyAACgDCFsJWJlcnRTcGFjZQAAoAsh8AEYBQAAGwVmAACgDSHpJXpvbnRhbExpbmUAoAAlAAFjdCYFKAXyABIF8iFvayZhbQBwAEQBMQU5BW8AdwBuAEgAdQBtAPAAAAFxInVhbAAAoE8iAAdFSk9hY2RmZ21ub3N0dVMFVgVZBVwFYwVtBXAFcwV6BZAFtgXFBckFzQVjAHkAFWTsIWlnMmFjAHkAAWRjAHUAdABlADuAzQDNQAABaXlnBWwFcgBjADuAzgDOQBhkbwB0ADBhcgAAoBEhcgBhAHYAZQA7gMwAzEAAoREhYXB/BYsFAAFjZ4MFhQVyACphaSNuYXJ5SQAAoEghbABpAGUA8wD6AvQBlQUAAKUFZaAsIgABZ3KaBZ4F8iFhbACgKyLzI2VjdGlvbgCgwiJpI3NpYmxlAAABQ1SsBbEFbyJtbWEAAKBjIGkibWVzAACgYiCAAWdwdAC8Bb8FwwVvAG4ALmFmAADgNdhA3WEAmWNjAHIAAKAQIWkibGRlAChh6wHSBQAA1QVjAHkABmRsADuAzwDPQIACY2Zvc3UA4QXpBe0F8gX9BQABaXnlBegFcgBjADRhGWRyAADgNdgN3XAAZgAA4DXYQd3jAfcFAAD7BXIAAOA12KXc8iFjeQhk6yFjeQRkgANISmFjZm9zAAwGDwYSBhUGHQYhBiYGYwB5ACVkYwB5AAxk8CFwYZpjAAFleRkGHAbkIWlsNmEaZHIAAOA12A7dcABmAADgNdhC3WMAcgAA4DXYptyABUpUYWNlZmxtb3N0AD0GQAZDBl4GawZkB2gHcAd0B80H2gdjAHkACWQ7gDwAPECAAmNtbnByAEwGTwZSBlUGWwb1IXRlOWHiIWRhm2NnAACg6ifsI2FjZXRyZgCgEiFyAACgniGAAWFleQBkBmcGagbyIW9uPWHkIWlsO2EbZAABZnNvBjQHdAAABUFDREZSVFVWYXKABp4GpAbGBssG3AYDByEHwQIqBwABbnKEBowGZyVsZUJyYWNrZXQAAKDoJ/Ihb3cAoZAhQlKTBpcGYQByAACg5CHpJGdodEFycm93AKDGIWUjaWxpbmcAAKAII28A9QGqBgAAsgZiJWxlQnJhY2tldAAAoOYnbgDUAbcGAAC+BmUkZVZlY3RvcgAAoGEp5SJjdG9yQqDDIWEAcgAAoFkpbCJvb3IAAKAKI2kiZ2h0AAABQVbSBtcGciJyb3cAAKCUIeUiY3RvcgCgTikAAWVy4AbwBmUAAKGjIkFW5gbrBnIicm93AACgpCHlImN0b3IAoFopaSNhbmdsZQBCorIi+wYAAAAA/wZhAHIAAKDPKXEidWFsAACgtCJwAIABRFRWAAoHEQcYB+8kd25WZWN0b3IAoFEpZSRlVmVjdG9yAACgYCnlImN0b3JCoL8hYQByAACgWCnlImN0b3JCoLwhYQByAACgUilpAGcAaAB0AGEAcgByAG8A9wDMAnMAAANFRkdMU1Q/B0cHTgdUB1gHXwfxJXVhbEdyZWF0ZXIAoNoidSRsbEVxdWFsAACgZiJyI2VhdGVyAACgdiLlIXNzAKChKuwkYW50RXF1YWwAoH0qaSJsZGUAAKByInIAAOA12A/dZaDYIuYjdGFycm93AKDaIWkiZG90AD9hgAFucHcAege1B7kHZwAAAkxSbHKCB5QHmwerB+UhZnQAAUFSiAeNB3Iicm93AACg9SfpJGdodEFycm93AKD3J+kkZ2h0QXJyb3cAoPYn5SFmdAABYXLcAqEHaQBnAGgAdABhAHIAcgBvAPcA5wJpAGcAaAB0AGEAcgByAG8A9wDuAmYAAOA12EPdZQByAAABTFK/B8YHZSRmdEFycm93AACgmSHpJGdodEFycm93AKCYIYABY2h0ANMH1QfXB/IAWgYAoLAh8iFva0FhAKBqIgAEYWNlZmlvc3XpB+wH7gf/BwMICQgOCBEIcAAAoAUpeQAcZAABZGzyB/kHaSR1bVNwYWNlAACgXyBsI2ludHJmAACgMyFyAADgNdgQ3e4jdXNQbHVzAKATInAAZgAA4DXYRN1jAPIA/gecY4AESmFjZWZvc3R1ACEIJAgoCDUIgQiFCDsKQApHCmMAeQAKZGMidXRlAENhgAFhZXkALggxCDQI8iFvbkdh5CFpbEVhHWSAAWdzdwA7CGEIfQjhInRpdmWAAU1UVgBECEwIWQhlJWRpdW1TcGFjZQAAoAsgaABpAAABY25SCFMIawBTAHAAYQBjAOUASwhlAHIAeQBUAGgAaQDuAFQI9CFlZAABR0xnCHUIcgBlAGEAdABlAHIARwByAGUAYQB0AGUA8gDrBGUAcwBzAEwAZQBzAPMA2wdMImluZQAKYHIAAOA12BHdAAJCbnB0jAiRCJkInAhyImVhawAAoGAgwiZyZWFraW5nU3BhY2WgYGYAAKAVIUOq7CqzCMIIzQgAAOcIGwkAAAAAAAAtCQAAbwkAAIcJAACdCcAJGQoAADQKAAFvdbYIvAjuI2dydWVudACgYiJwIkNhcAAAoG0ibyh1YmxlVmVydGljYWxCYXIAAKAmIoABbHF4ANII1wjhCOUibWVudACgCSL1IWFsVKBgImkibGRlAADgQiI4A2kic3RzAACgBCJyI2VhdGVyAACjbyJFRkdMU1T1CPoIAgkJCQ0JFQlxInVhbAAAoHEidSRsbEVxdWFsAADgZyI4A3IjZWF0ZXIAAOBrIjgD5SFzcwCgeSLsJGFudEVxdWFsAOB+KjgDaSJsZGUAAKB1IvUhbXBEASAJJwnvI3duSHVtcADgTiI4A3EidWFsAADgTyI4A2UAAAFmczEJRgn0JFRyaWFuZ2xlQqLqIj0JAAAAAEIJYQByAADgzyk4A3EidWFsAACg7CJzAICibiJFR0xTVABRCVYJXAlhCWkJcSJ1YWwAAKBwInIjZWF0ZXIAAKB4IuUhc3MA4GoiOAPsJGFudEVxdWFsAOB9KjgDaSJsZGUAAKB0IuUic3RlZAABR0x1CX8J8iZlYXRlckdyZWF0ZXIA4KIqOAPlI3NzTGVzcwDgoSo4A/IjZWNlZGVzAKGAIkVTjwmVCXEidWFsAADgryo4A+wkYW50RXF1YWwAoOAiAAFlaaAJqQl2JmVyc2VFbGVtZW50AACgDCLnJWh0VHJpYW5nbGVCousitgkAAAAAuwlhAHIAAODQKTgDcSJ1YWwAAKDtIgABcXXDCeAJdSNhcmVTdQAAAWJwywnVCfMhZXRF4I8iOANxInVhbAAAoOIi5SJyc2V0ReCQIjgDcSJ1YWwAAKDjIoABYmNwAOYJ8AkNCvMhZXRF4IIi0iBxInVhbAAAoIgi4yJlZWRzgKGBIkVTVAD6CQAKBwpxInVhbAAA4LAqOAPsJGFudEVxdWFsAKDhImkibGRlAADgfyI4A+UicnNldEXggyLSIHEidWFsAACgiSJpImxkZQCAoUEiRUZUACIKJwouCnEidWFsAACgRCJ1JGxsRXF1YWwAAKBHImkibGRlAACgSSJlJXJ0aWNhbEJhcgAAoCQiYwByAADgNdip3GkAbABkAGUAO4DRANFAnWMAB0VhY2RmZ21vcHJzdHV2XgphCmgKcgp2CnoKgQqRCpYKqwqtCrsKyArNCuwhaWdSYWMAdQB0AGUAO4DTANNAAAFpeWwKcQpyAGMAO4DUANRAHmRiImxhYwBQYXIAAOA12BLdcgBhAHYAZQA7gNIA0kCAAWFlaQCHCooKjQpjAHIATGFnAGEAqWNjInJvbgCfY3AAZgAA4DXYRt3lI25DdXJseQABRFGeCqYKbyV1YmxlUXVvdGUAAKAcIHUib3RlAACgGCAAoFQqAAFjbLEKtQpyAADgNdiq3GEAcwBoADuA2ADYQGkAbAHACsUKZABlADuA1QDVQGUAcwAAoDcqbQBsADuA1gDWQGUAcgAAAUJQ0wrmCgABYXLXCtoKcgAAoD4gYQBjAAABZWvgCuIKAKDeI2UAdAAAoLQjYSVyZW50aGVzaXMAAKDcI4AEYWNmaGlsb3JzAP0KAwsFCwkLCwsMCxELIwtaC3IjdGlhbEQAAKACInkAH2RyAADgNdgT3WkApmOgY/Ujc01pbnVzsWAAAWlwFQsgC24AYwBhAHIAZQBwAGwAYQBuAOUACgVmAACgGSGAobsqZWlvACoLRQtJC+MiZWRlc4CheiJFU1QANAs5C0ALcSJ1YWwAAKCvKuwkYW50RXF1YWwAoHwiaSJsZGUAAKB+Im0AZQAAoDMgAAFkcE0LUQv1IWN0AKAPIm8jcnRpb24AYaA3ImwAAKAdIgABY2leC2ILcgAA4DXYq9yoYwACVWZvc2oLbwtzC3cLTwBUADuAIgAiQHIAAOA12BTdcABmAACgGiFjAHIAAOA12KzcAAZCRWFjZWZoaW9yc3WPC5MLlwupC7YL2AvbC90LhQyTDJoMowzhIXJyAKAQKUcAO4CuAK5AgAFjbnIAnQugC6ML9SF0ZVRhZwAAoOsncgB0oKAhbAAAoBYpgAFhZXkArwuyC7UL8iFvblhh5CFpbFZhIGR2oBwhZSJyc2UAAAFFVb8LzwsAAWxxwwvIC+UibWVudACgCyL1JGlsaWJyaXVtAKDLIXAmRXF1aWxpYnJpdW0AAKBvKXIAAKAcIW8AoWPnIWh0AARBQ0RGVFVWYewLCgwQDDIMNwxeDHwM9gIAAW5y8Av4C2clbGVCcmFja2V0AACg6SfyIW93AKGSIUJM/wsDDGEAcgAAoOUhZSRmdEFycm93AACgxCFlI2lsaW5nAACgCSNvAPUBFgwAAB4MYiVsZUJyYWNrZXQAAKDnJ24A1AEjDAAAKgxlJGVWZWN0b3IAAKBdKeUiY3RvckKgwiFhAHIAAKBVKWwib29yAACgCyMAAWVyOwxLDGUAAKGiIkFWQQxGDHIicm93AACgpiHlImN0b3IAoFspaSNhbmdsZQBCorMiVgwAAAAAWgxhAHIAAKDQKXEidWFsAACgtSJwAIABRFRWAGUMbAxzDO8kd25WZWN0b3IAoE8pZSRlVmVjdG9yAACgXCnlImN0b3JCoL4hYQByAACgVCnlImN0b3JCoMAhYQByAACgUykAAXB1iQyMDGYAAKAdIe4kZEltcGxpZXMAoHAp6SRnaHRhcnJvdwCg2yEAAWNongyhDHIAAKAbIQCgsSHsJGVEZWxheWVkAKD0KYAGSE9hY2ZoaW1vcXN0dQC/DMgMzAzQDOIM5gwKDQ0NFA0ZDU8NVA1YDQABQ2PDDMYMyCFjeSlkeQAoZEYiVGN5ACxkYyJ1dGUAWmEAorwqYWVpedgM2wzeDOEM8iFvbmBh5CFpbF5hcgBjAFxhIWRyAADgNdgW3e8hcnQAAkRMUlXvDPYM/QwEDW8kd25BcnJvdwAAoJMhZSRmdEFycm93AACgkCHpJGdodEFycm93AKCSIXAjQXJyb3cAAKCRIechbWGjY+EkbGxDaXJjbGUAoBgicABmAADgNdhK3XICHw0AAAAAIg10AACgGiLhIXJlgKGhJUlTVQAqDTINSg3uJXRlcnNlY3Rpb24AoJMidQAAAWJwNw1ADfMhZXRFoI8icSJ1YWwAAKCRIuUicnNldEWgkCJxInVhbAAAoJIibiJpb24AAKCUImMAcgAA4DXYrtxhAHIAAKDGIgACYmNtcF8Nag2ODZANc6DQImUAdABFoNAicSJ1YWwAAKCGIgABY2huDYkNZSJlZHMAgKF7IkVTVAB4DX0NhA1xInVhbAAAoLAq7CRhbnRFcXVhbACgfSJpImxkZQAAoH8iVABoAGEA9ADHCwCgESIAodEiZXOVDZ8NciJzZXQARaCDInEidWFsAACghyJlAHQAAKDRIoAFSFJTYWNmaGlvcnMAtQ27Db8NyA3ODdsN3w3+DRgOHQ4jDk8AUgBOADuA3gDeQMEhREUAoCIhAAFIY8MNxg1jAHkAC2R5ACZkAAFidcwNzQ0JYKRjgAFhZXkA1A3XDdoN8iFvbmRh5CFpbGJhImRyAADgNdgX3QABZWnjDe4N8gHoDQAA7Q3lImZvcmUAoDQiYQCYYwABY27yDfkNayNTcGFjZQAA4F8gCiDTInBhY2UAoAkg7CFkZYChPCJFRlQABw4MDhMOcSJ1YWwAAKBDInUkbGxFcXVhbAAAoEUiaSJsZGUAAKBIInAAZgAA4DXYS93pI3BsZURvdACg2yAAAWN0Jw4rDnIAAOA12K/c8iFva2Zh4QpFDlYOYA5qDgAAbg5yDgAAAAAAAAAAAAB5DnwOqA6zDgAADg8RDxYPGg8AAWNySA5ODnUAdABlADuA2gDaQHIAb6CfIeMhaXIAoEkpcgDjAVsOAABdDnkADmR2AGUAbGEAAWl5Yw5oDnIAYwA7gNsA20AjZGIibGFjAHBhcgAA4DXYGN1yAGEAdgBlADuA2QDZQOEhY3JqYQABZGl/Dp8OZQByAAABQlCFDpcOAAFhcokOiw5yAF9gYQBjAAABZWuRDpMOAKDfI2UAdAAAoLUjYSVyZW50aGVzaXMAAKDdI28AbgBQoMMi7CF1cwCgjiIAAWdwqw6uDm8AbgByYWYAAOA12EzdAARBREVUYWRwc78O0g7ZDuEOBQPqDvMOBw9yInJvdwDCoZEhyA4AAMwOYQByAACgEilvJHduQXJyb3cAAKDFIW8kd25BcnJvdwAAoJUhcSV1aWxpYnJpdW0AAKBuKWUAZQBBoKUiciJyb3cAAKClIW8AdwBuAGEAcgByAG8A9wAQA2UAcgAAAUxS+Q4AD2UkZnRBcnJvdwAAoJYh6SRnaHRBcnJvdwCglyFpAGyg0gNvAG4ApWPpIW5nbmFjAHIAAOA12LDcaSJsZGUAaGFtAGwAO4DcANxAgAREYmNkZWZvc3YALQ8xDzUPNw89D3IPdg97D4AP4SFzaACgqyJhAHIAAKDrKnkAEmThIXNobKCpIgCg5ioAAWVyQQ9DDwCgwSKAAWJ0eQBJD00Paw9hAHIAAKAWIGmgFiDjIWFsAAJCTFNUWA9cD18PZg9hAHIAAKAjIukhbmV8YGUkcGFyYXRvcgAAoFgnaSJsZGUAAKBAItQkaGluU3BhY2UAoAogcgAA4DXYGd1wAGYAAOA12E3dYwByAADgNdix3GQiYXNoAACgqiKAAmNlZm9zAI4PkQ+VD5kPng/pIXJjdGHkIWdlAKDAInIAAOA12BrdcABmAADgNdhO3WMAcgAA4DXYstwAAmZpb3OqD64Prw+0D3IAAOA12BvdnmNwAGYAAOA12E/dYwByAADgNdiz3IAEQUlVYWNmb3N1AMgPyw/OD9EP2A/gD+QP6Q/uD2MAeQAvZGMAeQAHZGMAeQAuZGMAdQB0AGUAO4DdAN1AAAFpedwP3w9yAGMAdmErZHIAAOA12BzdcABmAADgNdhQ3WMAcgAA4DXYtNxtAGwAeGEABEhhY2RlZm9z/g8BEAUQDRAQEB0QIBAkEGMAeQAWZGMidXRlAHlhAAFheQkQDBDyIW9ufWEXZG8AdAB7YfIBFRAAABwQbwBXAGkAZAB0AOgAVAhhAJZjcgAAoCghcABmAACgJCFjAHIAAOA12LXc4QtCEEkQTRAAAGcQbRByEAAAAAAAAAAAeRCKEJcQ8hD9EAAAGxEhETIROREAAD4RYwB1AHQAZQA7gOEA4UByImV2ZQADYYCiPiJFZGl1eQBWEFkQWxBgEGUQAOA+IjMDAKA/InIAYwA7gOIA4kB0AGUAO4C0ALRAMGRsAGkAZwA7gOYA5kByoGEgAOA12B7dcgBhAHYAZQA7gOAA4EAAAWVwfBCGEAABZnCAEIQQ8yF5bQCgNSHoAIMQaABhALFjAAFhcI0QWwAAAWNskRCTEHIAAWFnAACgPypkApwQAAAAALEQAKInImFkc3ajEKcQqRCuEG4AZAAAoFUqAKBcKmwib3BlAACgWCoAoFoqAKMgImVsbXJzersQvRDAEN0Q5RDtEACgpCllAACgICJzAGQAYaAhImEEzhDQENIQ1BDWENgQ2hDcEACgqCkAoKkpAKCqKQCgqykAoKwpAKCtKQCgrikAoK8pdAB2oB8iYgBkoL4iAKCdKQABcHTpEOwQaAAAoCIixWDhIXJyAKB8IwABZ3D1EPgQbwBuAAVhZgAA4DXYUt0Ao0giRWFlaW9wBxEJEQ0RDxESERQRAKBwKuMhaXIAoG8qAKBKImQAAKBLInMAJ2DyIW94ZaBIIvEADhFpAG4AZwA7gOUA5UCAAWN0eQAmESoRKxFyAADgNdi23CpgbQBwAGWgSCLxAPgBaQBsAGQAZQA7gOMA40BtAGwAO4DkAORAAAFjaUERRxFvAG4AaQBuAPQA6AFuAHQAAKARKgAITmFiY2RlZmlrbG5vcHJzdWQRaBGXEZ8RpxGrEdIR1hErEjASexKKEn0RThNbE3oTbwB0AACg7SoAAWNybBGJEWsAAAJjZXBzdBF4EX0RghHvIW5nAKBMInAjc2lsb24A9mNyImltZQAAoDUgaQBtAGWgPSJxAACgzSJ2AY0RkRFlAGUAAKC9ImUAZABnoAUjZQAAoAUjcgBrAHSgtSPiIXJrAKC2IwABb3mjEaYRbgDnAHcRMWTxIXVvAKAeIIACY21wcnQAtBG5Eb4RwRHFEeEhdXPloDUi5ABwInR5dgAAoLApcwDpAH0RbgBvAPUA6gCAAWFodwDLEcwRzhGyYwCgNiHlIWVuAKBsInIAAOA12B/dZwCAA2Nvc3R1dncA4xHyEQUSEhIhEiYSKRKAAWFpdQDpEesR7xHwAKMFcgBjAACg7yVwAACgwyKAAWRwdAD4EfwRABJvAHQAAKAAKuwhdXMAoAEqaSJtZXMAAKACKnECCxIAAAAADxLjIXVwAKAGKmEAcgAAoAUm8iNpYW5nbGUAAWR1GhIeEu8hd24AoL0lcAAAoLMlcCJsdXMAAKAEKmUA5QBCD+UAkg9hInJvdwAAoA0pgAFha28ANhJoEncSAAFjbjoSZRJrAIABbHN0AEESRxJNEm8jemVuZ2UAAKDrKXEAdQBhAHIA5QBcBPIjaWFuZ2xlgKG0JWRscgBYElwSYBLvIXduAKC+JeUhZnQAoMIlaSJnaHQAAKC4JWsAAKAjJLEBbRIAAHUSsgFxEgAAcxIAoJIlAKCRJTQAAKCTJWMAawAAoIglAAFlb38ShxJx4D0A5SD1IWl2AOBhIuUgdAAAoBAjAAJwdHd4kRKVEpsSnxJmAADgNdhT3XSgpSJvAG0AAKClIvQhaWUAoMgiAAZESFVWYmRobXB0dXayEsES0RLgEvcS+xIKExoTHxMjEygTNxMAAkxSbHK5ErsSvRK/EgCgVyUAoFQlAKBWJQCgUyUAolAlRFVkdckSyxLNEs8SAKBmJQCgaSUAoGQlAKBnJQACTFJsctgS2hLcEt4SAKBdJQCgWiUAoFwlAKBZJQCjUSVITFJobHLrEu0S7xLxEvMS9RIAoGwlAKBjJQCgYCUAoGslAKBiJQCgXyVvAHgAAKDJKQACTFJscgITBBMGEwgTAKBVJQCgUiUAoBAlAKAMJQCiACVEVWR1EhMUExYTGBMAoGUlAKBoJQCgLCUAoDQlaSJudXMAAKCfIuwhdXMAoJ4iaSJtZXMAAKCgIgACTFJsci8TMRMzEzUTAKBbJQCgWCUAoBglAKAUJQCjAiVITFJobHJCE0QTRhNIE0oTTBMAoGolAKBhJQCgXiUAoDwlAKAkJQCgHCUAAWV2UhNVE3YA5QD5AGIAYQByADuApgCmQAACY2Vpb2ITZhNqE24TcgAA4DXYt9xtAGkAAKBPIG0A5aA9IogRbAAAoVwAYmh0E3YTAKDFKfMhdWIAoMgnbAF+E4QTbABloCIgdAAAoCIgcAAAoU4iRWWJE4sTAKCuKvGgTyI8BeEMqRMAAN8TABQDFB8UAAAjFDQUAAAAAIUUAAAAAI0UAAAAANcU4xT3FPsUAACIFQAAlhWAAWNwcgCuE7ET1RP1IXRlB2GAoikiYWJjZHMAuxO/E8QTzhPSE24AZAAAoEQqciJjdXAAAKBJKgABYXXIE8sTcAAAoEsqcAAAoEcqbwB0AACgQCoA4CkiAP4AAWVv2RPcE3QAAKBBIO4ABAUAAmFlaXXlE+8T9RP4E/AB6hMAAO0TcwAAoE0qbwBuAA1hZABpAGwAO4DnAOdAcgBjAAlhcABzAHOgTCptAACgUCpvAHQAC2GAAWRtbgAIFA0UEhRpAGwAO4C4ALhAcCJ0eXYAAKCyKXQAAIGiADtlGBQZFKJAcgBkAG8A9ABiAXIAAOA12CDdgAFjZWkAKBQqFDIUeQBHZGMAawBtoBMn4SFyawCgEyfHY3IAAKPLJUVjZWZtcz8UQRRHFHcUfBSAFACgwykAocYCZWxGFEkUcQAAoFciZQBhAlAUAAAAAGAUciJyb3cAAAFsclYUWhTlIWZ0AKC6IWkiZ2h0AACguyGAAlJTYWNkAGgUaRRrFG8UcxSuYACgyCRzAHQAAKCbIukhcmMAoJoi4SFzaACgnSJuImludAAAoBAqaQBkAACg7yrjIWlyAKDCKfUhYnN1oGMmaQB0AACgYybsApMUmhS2FAAAwxRvAG4AZaA6APGgVCKrAG0CnxQAAAAAoxRhAHSgLABAYAChASJmbKcUqRTuABMNZQAAAW14rhSyFOUhbnQAoAEiZQDzANIB5wG6FAAAwBRkoEUibwB0AACgbSpuAPQAzAGAAWZyeQDIFMsUzhQA4DXYVN1vAOQA1wEAgakAO3MeAdMUcgAAoBchAAFhb9oU3hRyAHIAAKC1IXMAcwAAoBcnAAFjdeYU6hRyAADgNdi43AABYnDuFPIUZaDPKgCg0SploNAqAKDSKuQhb3QAoO8igANkZWxwcnZ3AAYVEBUbFSEVRBVlFYQV4SFycgABbHIMFQ4VAKA4KQCgNSlwAhYVAAAAABkVcgAAoN4iYwAAoN8i4SFycnCgtiEAoD0pgKIqImJjZG9zACsVMBU6FT4VQRVyImNhcAAAoEgqAAFhdTQVNxVwAACgRipwAACgSipvAHQAAKCNInIAAKBFKgDgKiIA/gACYWxydksVURVuFXMVcgByAG2gtyEAoDwpeQCAAWV2dwBYFWUVaRVxAHACXxUAAAAAYxVyAGUA4wAXFXUA4wAZFWUAZQAAoM4iZSJkZ2UAAKDPImUAbgA7gKQApEBlI2Fycm93AAABbHJ7FX8V5SFmdACgtiFpImdodAAAoLchZQDkAG0VAAFjaYsVkRVvAG4AaQBuAPQAkwFuAHQAAKAxImwiY3R5AACgLSOACUFIYWJjZGVmaGlqbG9yc3R1d3oAuBW7Fb8V1RXgFegV+RUKFhUWHxZUFlcWZRbFFtsW7xb7FgUXChdyAPIAtAJhAHIAAKBlKQACZ2xyc8YVyhXOFdAV5yFlcgCgICDlIXRoAKA4IfIA9QxoAHagECAAoKMiawHZFd4VYSJyb3cAAKAPKWEA4wBfAgABYXnkFecV8iFvbg9hNGQAoUYhYW/tFfQVAAFnciEC8RVyAACgyiF0InNlcQAAoHcqgAFnbG0A/xUCFgUWO4CwALBAdABhALRjcCJ0eXYAAKCxKQABaXIOFhIW8yFodACgfykA4DXYId1hAHIAAAFschsWHRYAoMMhAKDCIYACYWVnc3YAKBauAjYWOhY+Fm0AAKHEIm9zLhY0Fm4AZABzoMQi9SFpdACgZiZhIm1tYQDdY2kAbgAAoPIiAKH3AGlvQxZRFmQAZQAAgfcAO29KFksW90BuI3RpbWVzAACgxyJuAPgAUBZjAHkAUmRjAG8CXhYAAAAAYhZyAG4AAKAeI28AcAAAoA0jgAJscHR1dwBuFnEWdRaSFp4W7CFhciRgZgAA4DXYVd0AotkCZW1wc30WhBaJFo0WcQBkoFAibwB0AACgUSJpIm51cwAAoDgi7CF1cwCgFCLxInVhcmUAoKEiYgBsAGUAYgBhAHIAdwBlAGQAZwDlANcAbgCAAWFkaAClFqoWtBZyAHIAbwD3APUMbwB3AG4AYQByAHIAbwB3APMA8xVhI3Jwb29uAAABbHK8FsAWZQBmAPQAHBZpAGcAaAD0AB4WYgHJFs8WawBhAHIAbwD3AJILbwLUFgAAAADYFnIAbgAAoB8jbwBwAACgDCOAAWNvdADhFukW7BYAAXJ55RboFgDgNdi53FVkbAAAoPYp8iFvaxFhAAFkcvMW9xZvAHQAAKDxImkA5qC/JVsSAAFhaP8WAhdyAPIANQNhAPIA1wvhIm5nbGUAoKYpAAFjaQ4XEBd5AF9k5yJyYXJyAKD/JwAJRGFjZGVmZ2xtbm9wcXJzdHV4MRc4F0YXWxcyBF4XaRd5F40XrBe0F78X2RcVGCEYLRg1GEAYAAFEbzUXgRZvAPQA+BUAAWNzPBdCF3UAdABlADuA6QDpQPQhZXIAoG4qAAJhaW95TRdQF1YXWhfyIW9uG2FyAGOgViI7gOoA6kDsIW9uAKBVIk1kbwB0ABdhAAFEcmIXZhdvAHQAAKBSIgDgNdgi3XKhmipuF3QXYQB2AGUAO4DoAOhAZKCWKm8AdAAAoJgqgKGZKmlscwCAF4UXhxfuInRlcnMAoOcjAKATIWSglSpvAHQAAKCXKoABYXBzAJMXlheiF2MAcgATYXQAeQBzogUinxcAAAAAoRdlAHQAAKAFInAAMaADIDMBqRerFwCgBCAAoAUgAAFnc7AXsRdLYXAAAKACIAABZ3C4F7sXbwBuABlhZgAA4DXYVt2AAWFscwDFF8sXzxdyAHOg1SJsAACg4yl1AHMAAKBxKmkAAKG1A2x21RfYF28AbgC1Y/VjAAJjc3V24BfoF/0XEBgAAWlv5BdWF3IAYwAAoFYiaQLuFwAAAADwF+0ADQThIW50AAFnbPUX+Rd0AHIAAKCWKuUhc3MAoJUqgAFhZWkAAxgGGAoYbABzAD1gcwB0AACgXyJ2AESgYSJEAACgeCrwImFyc2wAoOUpAAFEYRkYHRhvAHQAAKBTInIAcgAAoHEpgAFjZGkAJxgqGO0XcgAAoC8hbwD0AIwCAAFhaDEYMhi3YzuA8ADwQAABbXI5GD0YbAA7gOsA60BvAACgrCCAAWNpcABGGEgYSxhsACFgcwD0ACwEAAFlb08YVxhjAHQAYQB0AGkAbwDuABoEbgBlAG4AdABpAGEAbADlADME4Ql1GAAAgRgAAIMYiBgAAAAAoRilGAAAqhgAALsYvhjRGAAA1xgnGWwAbABpAG4AZwBkAG8AdABzAGUA8QBlF3kARGRtImFsZQAAoEAmgAFpbHIAjRiRGJ0Y7CFpZwCgA/tpApcYAAAAAJoYZwAAoAD7aQBnAACgBPsA4DXYI93sIWlnAKAB++whaWcA4GYAagCAAWFsdACvGLIYthh0AACgbSZpAGcAAKAC+24AcwAAoLElbwBmAJJh8AHCGAAAxhhmAADgNdhX3QABYWvJGMwYbADsAGsEdqDUIgCg2SphI3J0aW50AACgDSoAAWFv2hgiGQABY3PeGB8ZsQPnGP0YBRkSGRUZAAAdGbID7xjyGPQY9xj5GAAA+xg7gL0AvUAAoFMhO4C8ALxAAKBVIQCgWSEAoFshswEBGQAAAxkAoFQhAKBWIbQCCxkOGQAAAAAQGTuAvgC+QACgVyEAoFwhNQAAoFghtgEZGQAAGxkAoFohAKBdITgAAKBeIWwAAKBEIHcAbgAAoCIjYwByAADgNdi73IAIRWFiY2RlZmdpamxub3JzdHYARhlKGVoZXhlmGWkZkhmWGZkZnRmgGa0ZxhnLGc8Z4BkjGmygZyIAoIwqgAFjbXAAUBlTGVgZ9SF0ZfVhbQBhAOSgswM6FgCghipyImV2ZQAfYQABaXliGWUZcgBjAB1hM2RvAHQAIWGAoWUibHFzAMYEcBl6GfGhZSLOBAAAdhlsAGEAbgD0AN8EgKF+KmNkbACBGYQZjBljAACgqSpvAHQAb6CAKmyggioAoIQqZeDbIgD+cwAAoJQqcgAA4DXYJN3noGsirATtIWVsAKA3IWMAeQBTZIChdyJFYWoApxmpGasZAKCSKgCgpSoAoKQqAAJFYWVztBm2Gb0ZwhkAoGkicABwoIoq8iFveACgiipxoIgq8aCIKrUZaQBtAACg5yJwAGYAAOA12FjdYQB2AOUAYwIAAWNp0xnWGXIAAKAKIW0AAKFzImVs3BneGQCgjioAoJAqAIM+ADtjZGxxco0E6xn0GfgZ/BkBGgABY2nvGfEZAKCnKnIAAKB6Km8AdAAAoNci0CFhcgCglSl1ImVzdAAAoHwqgAJhZGVscwAKGvQZFhrVBCAa8AEPGgAAFBpwAHIAbwD4AFkZcgAAoHgpcQAAAWxxxAQbGmwAZQBzAPMASRlpAO0A5AQAAWVuJxouGnIjdG5lcXEAAOBpIgD+xQAsGgAFQWFiY2Vma29zeUAaQxpmGmoabRqDGocalhrCGtMacgDyAMwCAAJpbG1yShpOGlAaVBpyAHMA8ABxD2YAvWBpAGwA9AASBQABZHJYGlsaYwB5AEpkAKGUIWN3YBpkGmkAcgAAoEgpAKCtIWEAcgAAoA8h6SFyYyVhgAFhbHIAcxp7Gn8a8iF0c3WgZSZpAHQAAKBlJuwhaXAAoCYg4yFvbgCguSJyAADgNdgl3XMAAAFld4wakRphInJvdwAAoCUpYSJyb3cAAKAmKYACYW1vcHIAnxqjGqcauhq+GnIAcgAAoP8h9CFodACgOyJrAAABbHKsGrMaZSRmdGFycm93AACgqSHpJGdodGFycm93AKCqIWYAAOA12Fnd4iFhcgCgFSCAAWNsdADIGswa0BpyAADgNdi93GEAcwDoAGka8iFvaydhAAFicNca2xr1IWxsAKBDIOghZW4AoBAg4Qr2GgAA/RoAAAgbExsaGwAAIRs7GwAAAAA+G2IbmRuVG6sbAACyG80b0htjAHUAdABlADuA7QDtQAChYyBpeQEbBhtyAGMAO4DuAO5AOGQAAWN4CxsNG3kANWRjAGwAO4ChAKFAAAFmcssCFhsA4DXYJt1yAGEAdgBlADuA7ADsQIChSCFpbm8AJxsyGzYbAAFpbisbLxtuAHQAAKAMKnQAAKAtIuYhaW4AoNwpdABhAACgKSHsIWlnM2GAAWFvcABDG1sbXhuAAWNndABJG0sbWRtyACthgAFlbHAAcQVRG1UbaQBuAOUAyAVhAHIA9AByBWgAMWFmAACgtyJlAGQAtWEAoggiY2ZvdGkbbRt1G3kb4SFyZQCgBSFpAG4AdKAeImkAZQAAoN0pZABvAPQAWxsAoisiY2VscIEbhRuPG5QbYQBsAACguiIAAWdyiRuNG2UAcgDzACMQ4wCCG2EicmhrAACgFyryIW9kAKA8KgACY2dwdJ8boRukG6gbeQBRZG8AbgAvYWYAAOA12FrdYQC5Y3UAZQBzAHQAO4C/AL9AAAFjabUbuRtyAADgNdi+3G4AAKIIIkVkc3bCG8QbyBvQAwCg+SJvAHQAAKD1Inag9CIAoPMiaaBiIOwhZGUpYesB1hsAANkbYwB5AFZkbAA7gO8A70AAA2NmbW9zdeYb7hvyG/Ub+hsFHAABaXnqG+0bcgBjADVhOWRyAADgNdgn3eEhdGg3YnAAZgAA4DXYW93jAf8bAAADHHIAAOA12L/c8iFjeVhk6yFjeVRkAARhY2ZnaGpvcxUcGhwiHCYcKhwtHDAcNRzwIXBhdqC6A/BjAAFleR4cIRzkIWls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ZmdobG1vcHJzdHV3CiwNLBEsHSwnLDEsQCxLLFIsYix6LIQsjyzLLOgs7Sz/LAotcgDyAAkDYQByAACgYykAAWNyFSwbLHUAdABlADuA+gD6QPIACQ1yAOMBIywAACUseQBeZHYAZQBtYQABaXkrLDAscgBjADuA+wD7QENkgAFhYmgANyw6LD0scgDyANEO7CFhY3FhYQDyAOAOAAFpckQsSCzzIWh0AKB+KQDgNdgy3XIAYQB2AGUAO4D5APlAYQFWLF8scgAAAWxyWixcLACgvyEAoL4hbABrAACggCUAAWN0Zix2LG8CbCwAAAAAcyxyAG4AZaAcI3IAAKAcI28AcAAAoA8jcgBpAACg+CUAAWFsfiyBLGMAcgBrYTuAqACoQAABZ3CILIssbwBuAHNhZgAA4DXYZt0AA2FkaGxzdZksniynLLgsuyzFLHIAcgBvAPcACQ1vAHcAbgBhAHIAcgBvAPcA2A5hI3Jwb29uAAABbHKvLLMsZQBmAPQAWyxpAGcAaAD0AF0sdQDzAKYOaQAAocUDaGzBLMIs0mNvAG4AxWPwI2Fycm93cwCgyCGAAWNpdADRLOEs5CxvAtcsAAAAAN4scgBuAGWgHSNyAACgHSNvAHAAAKAOI24AZwBvYXIAaQAAoPklYwByAADgNdjK3IABZGlyAPMs9yz6LG8AdAAAoPAi7CFkZWlhaQBmoLUlAKC0JQABYW0DLQYtcgDyAMosbAA7gPwA/EDhIm5nbGUAoKcpgAdBQkRhY2RlZmxub3Byc3oAJy0qLTAtNC2bLZ0toS2/LcMtxy3TLdgt3C3gLfwtcgDyABADYQByAHag6CoAoOkqYQBzAOgA/gIAAW5yOC08LechcnQAoJwpgANla25wcnN0AJkpSC1NLVQtXi1iLYItYQBwAHAA4QAaHG8AdABoAGkAbgDnAKEXgAFoaXIAoSmzJFotbwBwAPQAdCVooJUh7wD4JgABaXVmLWotZwBtAOEAuygAAWJwbi14LXMjZXRuZXEAceCKIgD+AODLKgD+cyNldG5lcQBx4IsiAP4A4MwqAP4AAWhyhi2KLWUAdADhABIraSNhbmdsZQAAAWxyki2WLeUhZnQAoLIiaSJnaHQAAKCzInkAMmThIXNoAKCiIoABZWxyAKcttC24LWKiKCKuLQAAAACyLWEAcgAAoLsicQAAoFoi7CFpcACg7iIAAWJ0vC1eD2EA8gBfD3IAAOA12DPddAByAOkAlS1zAHUAAAFicM0t0C0A4IIi0iAA4IMi0iBwAGYAAOA12GfdcgBvAPAAWQt0AHIA6QCaLQABY3XkLegtcgAA4DXYy9wAAWJw7C30LW4AAAFFZXUt8S0A4IoiAP5uAAABRWV/LfktAOCLIgD+6SJnemFnAKCaKYADY2Vmb3BycwANLhAuJS4pLiMuLi40LukhcmN1YQABZGkULiEuAAFiZxguHC5hAHIAAKBfKmUAcaAnIgCgWSLlIXJwAKAYIXIAAOA12DTdcABmAADgNdho3WWgQCJhAHQA6ABqD2MAcgAA4DXYzNzjCuQRUC4AAFQuAABYLmIuAAAAAGMubS5wLnQuAAAAAIguki4AAJouJxIqEnQAcgDpAB0ScgAA4DXYNd0AAUFhWy5eLnIA8gDnAnIA8gCTB75jAAFBYWYuaS5yAPIA4AJyAPIAjAdhAPAAeh5pAHMAAKD7IoABZHB0APgReS6DLgABZmx9LoAuAOA12GnddQDzAP8RaQBtAOUABBIAAUFhiy6OLnIA8gDuAnIA8gCaBwABY3GVLgoScgAA4DXYzdwAAXB0nS6hLmwAdQDzACUScgDpACASAARhY2VmaW9zdbEuvC7ELsguzC7PLtQu2S5jAAABdXm2LrsudABlADuA/QD9QE9kAAFpecAuwy5yAGMAd2FLZG4AO4ClAKVAcgAA4DXYNt1jAHkAV2RwAGYAAOA12GrdYwByAADgNdjO3AABY23dLt8ueQBOZGwAO4D/AP9AAAVhY2RlZmhpb3N38y73Lv8uAi8MLxAvEy8YLx0vIi9jInV0ZQB6YQABYXn7Lv4u8iFvbn5hN2RvAHQAfGEAAWV0Bi8KL3QAcgDmAB8QYQC2Y3IAAOA12DfdYwB5ADZk5yJyYXJyAKDdIXAAZgAA4DXYa91jAHIAAOA12M/cAAFqbiYvKC8AoA0gagAAoAwg"), wi = /* #__PURE__ */ Si("AAJhZ2xxBwARABMAFQBtAg0AAAAAAA8AcAAmYG8AcwAnYHQAPmB0ADxg9SFvdCJg"), Ti;
(function(e) {
	e[e.VALUE_LENGTH = 49152] = "VALUE_LENGTH", e[e.FLAG13 = 8192] = "FLAG13", e[e.BRANCH_LENGTH = 8064] = "BRANCH_LENGTH", e[e.JUMP_TABLE = 127] = "JUMP_TABLE";
})(Ti ||= {});
//#endregion
//#region node_modules/.pnpm/entities@7.0.1/node_modules/entities/dist/esm/decode.js
var I;
(function(e) {
	e[e.NUM = 35] = "NUM", e[e.SEMI = 59] = "SEMI", e[e.EQUALS = 61] = "EQUALS", e[e.ZERO = 48] = "ZERO", e[e.NINE = 57] = "NINE", e[e.LOWER_A = 97] = "LOWER_A", e[e.LOWER_F = 102] = "LOWER_F", e[e.LOWER_X = 120] = "LOWER_X", e[e.LOWER_Z = 122] = "LOWER_Z", e[e.UPPER_A = 65] = "UPPER_A", e[e.UPPER_F = 70] = "UPPER_F", e[e.UPPER_Z = 90] = "UPPER_Z";
})(I ||= {});
var Ei = 32;
function Di(e) {
	return e >= I.ZERO && e <= I.NINE;
}
function Oi(e) {
	return e >= I.UPPER_A && e <= I.UPPER_F || e >= I.LOWER_A && e <= I.LOWER_F;
}
function ki(e) {
	return e >= I.UPPER_A && e <= I.UPPER_Z || e >= I.LOWER_A && e <= I.LOWER_Z || Di(e);
}
function Ai(e) {
	return e === I.EQUALS || ki(e);
}
var ji;
(function(e) {
	e[e.EntityStart = 0] = "EntityStart", e[e.NumericStart = 1] = "NumericStart", e[e.NumericDecimal = 2] = "NumericDecimal", e[e.NumericHex = 3] = "NumericHex", e[e.NamedEntity = 4] = "NamedEntity";
})(ji ||= {});
var Mi;
(function(e) {
	e[e.Legacy = 0] = "Legacy", e[e.Strict = 1] = "Strict", e[e.Attribute = 2] = "Attribute";
})(Mi ||= {});
var Ni = class {
	constructor(e, t, n) {
		this.decodeTree = e, this.emitCodePoint = t, this.errors = n, this.state = ji.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = Mi.Strict, this.runConsumed = 0;
	}
	startEntity(e) {
		this.decodeMode = e, this.state = ji.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1, this.runConsumed = 0;
	}
	write(e, t) {
		switch (this.state) {
			case ji.EntityStart: return e.charCodeAt(t) === I.NUM ? (this.state = ji.NumericStart, this.consumed += 1, this.stateNumericStart(e, t + 1)) : (this.state = ji.NamedEntity, this.stateNamedEntity(e, t));
			case ji.NumericStart: return this.stateNumericStart(e, t);
			case ji.NumericDecimal: return this.stateNumericDecimal(e, t);
			case ji.NumericHex: return this.stateNumericHex(e, t);
			case ji.NamedEntity: return this.stateNamedEntity(e, t);
		}
	}
	stateNumericStart(e, t) {
		return t >= e.length ? -1 : (e.charCodeAt(t) | Ei) === I.LOWER_X ? (this.state = ji.NumericHex, this.consumed += 1, this.stateNumericHex(e, t + 1)) : (this.state = ji.NumericDecimal, this.stateNumericDecimal(e, t));
	}
	stateNumericHex(e, t) {
		for (; t < e.length;) {
			let n = e.charCodeAt(t);
			if (Di(n) || Oi(n)) {
				let e = n <= I.NINE ? n - I.ZERO : (n | Ei) - I.LOWER_A + 10;
				this.result = this.result * 16 + e, this.consumed++, t++;
			} else return this.emitNumericEntity(n, 3);
		}
		return -1;
	}
	stateNumericDecimal(e, t) {
		for (; t < e.length;) {
			let n = e.charCodeAt(t);
			if (Di(n)) this.result = this.result * 10 + (n - I.ZERO), this.consumed++, t++;
			else return this.emitNumericEntity(n, 2);
		}
		return -1;
	}
	emitNumericEntity(e, t) {
		var n;
		if (this.consumed <= t) return (n = this.errors) == null || n.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
		if (e === I.SEMI) this.consumed += 1;
		else if (this.decodeMode === Mi.Strict) return 0;
		return this.emitCodePoint(xi(this.result), this.consumed), this.errors && (e !== I.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
	}
	stateNamedEntity(e, t) {
		let { decodeTree: n } = this, r = n[this.treeIndex], i = (r & Ti.VALUE_LENGTH) >> 14;
		for (; t < e.length;) {
			if (i === 0 && (r & Ti.FLAG13) !== 0) {
				let a = (r & Ti.BRANCH_LENGTH) >> 7;
				if (this.runConsumed === 0) {
					let n = r & Ti.JUMP_TABLE;
					if (e.charCodeAt(t) !== n) return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
					t++, this.excess++, this.runConsumed++;
				}
				for (; this.runConsumed < a;) {
					if (t >= e.length) return -1;
					let r = this.runConsumed - 1, i = n[this.treeIndex + 1 + (r >> 1)], a = r % 2 == 0 ? i & 255 : i >> 8 & 255;
					if (e.charCodeAt(t) !== a) return this.runConsumed = 0, this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
					t++, this.excess++, this.runConsumed++;
				}
				this.runConsumed = 0, this.treeIndex += 1 + (a >> 1), r = n[this.treeIndex], i = (r & Ti.VALUE_LENGTH) >> 14;
			}
			if (t >= e.length) break;
			let a = e.charCodeAt(t);
			if (a === I.SEMI && i !== 0 && (r & Ti.FLAG13) !== 0) return this.emitNamedEntityData(this.treeIndex, i, this.consumed + this.excess);
			if (this.treeIndex = Pi(n, r, this.treeIndex + Math.max(1, i), a), this.treeIndex < 0) return this.result === 0 || this.decodeMode === Mi.Attribute && (i === 0 || Ai(a)) ? 0 : this.emitNotTerminatedNamedEntity();
			if (r = n[this.treeIndex], i = (r & Ti.VALUE_LENGTH) >> 14, i !== 0) {
				if (a === I.SEMI) return this.emitNamedEntityData(this.treeIndex, i, this.consumed + this.excess);
				this.decodeMode !== Mi.Strict && (r & Ti.FLAG13) === 0 && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
			}
			t++, this.excess++;
		}
		return -1;
	}
	emitNotTerminatedNamedEntity() {
		var e;
		let { result: t, decodeTree: n } = this, r = (n[t] & Ti.VALUE_LENGTH) >> 14;
		return this.emitNamedEntityData(t, r, this.consumed), (e = this.errors) == null || e.missingSemicolonAfterCharacterReference(), this.consumed;
	}
	emitNamedEntityData(e, t, n) {
		let { decodeTree: r } = this;
		return this.emitCodePoint(t === 1 ? r[e] & ~(Ti.VALUE_LENGTH | Ti.FLAG13) : r[e + 1], n), t === 3 && this.emitCodePoint(r[e + 2], n), n;
	}
	end() {
		var e;
		switch (this.state) {
			case ji.NamedEntity: return this.result !== 0 && (this.decodeMode !== Mi.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
			case ji.NumericDecimal: return this.emitNumericEntity(0, 2);
			case ji.NumericHex: return this.emitNumericEntity(0, 3);
			case ji.NumericStart: return (e = this.errors) == null || e.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
			case ji.EntityStart: return 0;
		}
	}
};
function Pi(e, t, n, r) {
	let i = (t & Ti.BRANCH_LENGTH) >> 7, a = t & Ti.JUMP_TABLE;
	if (i === 0) return a !== 0 && r === a ? n : -1;
	if (a) {
		let t = r - a;
		return t < 0 || t >= i ? -1 : e[n + t] - 1;
	}
	let o = i + 1 >> 1, s = 0, c = i - 1;
	for (; s <= c;) {
		let t = s + c >>> 1, i = e[n + (t >> 1)] >> (t & 1) * 8 & 255;
		if (i < r) s = t + 1;
		else if (i > r) c = t - 1;
		else return e[n + o + t];
	}
	return -1;
}
//#endregion
//#region node_modules/.pnpm/htmlparser2@10.1.0/node_modules/htmlparser2/dist/esm/Tokenizer.js
var L;
(function(e) {
	e[e.Tab = 9] = "Tab", e[e.NewLine = 10] = "NewLine", e[e.FormFeed = 12] = "FormFeed", e[e.CarriageReturn = 13] = "CarriageReturn", e[e.Space = 32] = "Space", e[e.ExclamationMark = 33] = "ExclamationMark", e[e.Number = 35] = "Number", e[e.Amp = 38] = "Amp", e[e.SingleQuote = 39] = "SingleQuote", e[e.DoubleQuote = 34] = "DoubleQuote", e[e.Dash = 45] = "Dash", e[e.Slash = 47] = "Slash", e[e.Zero = 48] = "Zero", e[e.Nine = 57] = "Nine", e[e.Semi = 59] = "Semi", e[e.Lt = 60] = "Lt", e[e.Eq = 61] = "Eq", e[e.Gt = 62] = "Gt", e[e.Questionmark = 63] = "Questionmark", e[e.UpperA = 65] = "UpperA", e[e.LowerA = 97] = "LowerA", e[e.UpperF = 70] = "UpperF", e[e.LowerF = 102] = "LowerF", e[e.UpperZ = 90] = "UpperZ", e[e.LowerZ = 122] = "LowerZ", e[e.LowerX = 120] = "LowerX", e[e.OpeningSquareBracket = 91] = "OpeningSquareBracket";
})(L ||= {});
var R;
(function(e) {
	e[e.Text = 1] = "Text", e[e.BeforeTagName = 2] = "BeforeTagName", e[e.InTagName = 3] = "InTagName", e[e.InSelfClosingTag = 4] = "InSelfClosingTag", e[e.BeforeClosingTagName = 5] = "BeforeClosingTagName", e[e.InClosingTagName = 6] = "InClosingTagName", e[e.AfterClosingTagName = 7] = "AfterClosingTagName", e[e.BeforeAttributeName = 8] = "BeforeAttributeName", e[e.InAttributeName = 9] = "InAttributeName", e[e.AfterAttributeName = 10] = "AfterAttributeName", e[e.BeforeAttributeValue = 11] = "BeforeAttributeValue", e[e.InAttributeValueDq = 12] = "InAttributeValueDq", e[e.InAttributeValueSq = 13] = "InAttributeValueSq", e[e.InAttributeValueNq = 14] = "InAttributeValueNq", e[e.BeforeDeclaration = 15] = "BeforeDeclaration", e[e.InDeclaration = 16] = "InDeclaration", e[e.InProcessingInstruction = 17] = "InProcessingInstruction", e[e.BeforeComment = 18] = "BeforeComment", e[e.CDATASequence = 19] = "CDATASequence", e[e.InSpecialComment = 20] = "InSpecialComment", e[e.InCommentLike = 21] = "InCommentLike", e[e.BeforeSpecialS = 22] = "BeforeSpecialS", e[e.BeforeSpecialT = 23] = "BeforeSpecialT", e[e.SpecialStartSequence = 24] = "SpecialStartSequence", e[e.InSpecialTag = 25] = "InSpecialTag", e[e.InEntity = 26] = "InEntity";
})(R ||= {});
function Fi(e) {
	return e === L.Space || e === L.NewLine || e === L.Tab || e === L.FormFeed || e === L.CarriageReturn;
}
function Ii(e) {
	return e === L.Slash || e === L.Gt || Fi(e);
}
function Li(e) {
	return e >= L.LowerA && e <= L.LowerZ || e >= L.UpperA && e <= L.UpperZ;
}
var Ri;
(function(e) {
	e[e.NoValue = 0] = "NoValue", e[e.Unquoted = 1] = "Unquoted", e[e.Single = 2] = "Single", e[e.Double = 3] = "Double";
})(Ri ||= {});
var z = {
	Cdata: new Uint8Array([
		67,
		68,
		65,
		84,
		65,
		91
	]),
	CdataEnd: new Uint8Array([
		93,
		93,
		62
	]),
	CommentEnd: new Uint8Array([
		45,
		45,
		62
	]),
	ScriptEnd: new Uint8Array([
		60,
		47,
		115,
		99,
		114,
		105,
		112,
		116
	]),
	StyleEnd: new Uint8Array([
		60,
		47,
		115,
		116,
		121,
		108,
		101
	]),
	TitleEnd: new Uint8Array([
		60,
		47,
		116,
		105,
		116,
		108,
		101
	]),
	TextareaEnd: new Uint8Array([
		60,
		47,
		116,
		101,
		120,
		116,
		97,
		114,
		101,
		97
	]),
	XmpEnd: new Uint8Array([
		60,
		47,
		120,
		109,
		112
	])
}, zi = class {
	constructor({ xmlMode: e = !1, decodeEntities: t = !0 }, n) {
		this.cbs = n, this.state = R.Text, this.buffer = "", this.sectionStart = 0, this.index = 0, this.entityStart = 0, this.baseState = R.Text, this.isSpecial = !1, this.running = !0, this.offset = 0, this.currentSequence = void 0, this.sequenceIndex = 0, this.xmlMode = e, this.decodeEntities = t, this.entityDecoder = new Ni(e ? wi : Ci, (e, t) => this.emitCodePoint(e, t));
	}
	reset() {
		this.state = R.Text, this.buffer = "", this.sectionStart = 0, this.index = 0, this.baseState = R.Text, this.currentSequence = void 0, this.running = !0, this.offset = 0;
	}
	write(e) {
		this.offset += this.buffer.length, this.buffer = e, this.parse();
	}
	end() {
		this.running && this.finish();
	}
	pause() {
		this.running = !1;
	}
	resume() {
		this.running = !0, this.index < this.buffer.length + this.offset && this.parse();
	}
	stateText(e) {
		e === L.Lt || !this.decodeEntities && this.fastForwardTo(L.Lt) ? (this.index > this.sectionStart && this.cbs.ontext(this.sectionStart, this.index), this.state = R.BeforeTagName, this.sectionStart = this.index) : this.decodeEntities && e === L.Amp && this.startEntity();
	}
	stateSpecialStartSequence(e) {
		let t = this.sequenceIndex === this.currentSequence.length;
		if (!(t ? Ii(e) : (e | 32) === this.currentSequence[this.sequenceIndex])) this.isSpecial = !1;
		else if (!t) {
			this.sequenceIndex++;
			return;
		}
		this.sequenceIndex = 0, this.state = R.InTagName, this.stateInTagName(e);
	}
	stateInSpecialTag(e) {
		if (this.sequenceIndex === this.currentSequence.length) {
			if (e === L.Gt || Fi(e)) {
				let t = this.index - this.currentSequence.length;
				if (this.sectionStart < t) {
					let e = this.index;
					this.index = t, this.cbs.ontext(this.sectionStart, t), this.index = e;
				}
				this.isSpecial = !1, this.sectionStart = t + 2, this.stateInClosingTagName(e);
				return;
			}
			this.sequenceIndex = 0;
		}
		(e | 32) === this.currentSequence[this.sequenceIndex] ? this.sequenceIndex += 1 : this.sequenceIndex === 0 ? this.currentSequence === z.TitleEnd ? this.decodeEntities && e === L.Amp && this.startEntity() : this.fastForwardTo(L.Lt) && (this.sequenceIndex = 1) : this.sequenceIndex = Number(e === L.Lt);
	}
	stateCDATASequence(e) {
		e === z.Cdata[this.sequenceIndex] ? ++this.sequenceIndex === z.Cdata.length && (this.state = R.InCommentLike, this.currentSequence = z.CdataEnd, this.sequenceIndex = 0, this.sectionStart = this.index + 1) : (this.sequenceIndex = 0, this.state = R.InDeclaration, this.stateInDeclaration(e));
	}
	fastForwardTo(e) {
		for (; ++this.index < this.buffer.length + this.offset;) if (this.buffer.charCodeAt(this.index - this.offset) === e) return !0;
		return this.index = this.buffer.length + this.offset - 1, !1;
	}
	stateInCommentLike(e) {
		e === this.currentSequence[this.sequenceIndex] ? ++this.sequenceIndex === this.currentSequence.length && (this.currentSequence === z.CdataEnd ? this.cbs.oncdata(this.sectionStart, this.index, 2) : this.cbs.oncomment(this.sectionStart, this.index, 2), this.sequenceIndex = 0, this.sectionStart = this.index + 1, this.state = R.Text) : this.sequenceIndex === 0 ? this.fastForwardTo(this.currentSequence[0]) && (this.sequenceIndex = 1) : e !== this.currentSequence[this.sequenceIndex - 1] && (this.sequenceIndex = 0);
	}
	isTagStartChar(e) {
		return this.xmlMode ? !Ii(e) : Li(e);
	}
	startSpecial(e, t) {
		this.isSpecial = !0, this.currentSequence = e, this.sequenceIndex = t, this.state = R.SpecialStartSequence;
	}
	stateBeforeTagName(e) {
		if (e === L.ExclamationMark) this.state = R.BeforeDeclaration, this.sectionStart = this.index + 1;
		else if (e === L.Questionmark) this.state = R.InProcessingInstruction, this.sectionStart = this.index + 1;
		else if (this.isTagStartChar(e)) {
			let t = e | 32;
			this.sectionStart = this.index, this.state = this.xmlMode ? R.InTagName : t === z.ScriptEnd[2] ? R.BeforeSpecialS : t === z.TitleEnd[2] || t === z.XmpEnd[2] ? R.BeforeSpecialT : R.InTagName;
		} else e === L.Slash ? this.state = R.BeforeClosingTagName : (this.state = R.Text, this.stateText(e));
	}
	stateInTagName(e) {
		Ii(e) && (this.cbs.onopentagname(this.sectionStart, this.index), this.sectionStart = -1, this.state = R.BeforeAttributeName, this.stateBeforeAttributeName(e));
	}
	stateBeforeClosingTagName(e) {
		Fi(e) || (e === L.Gt ? this.state = R.Text : (this.state = this.isTagStartChar(e) ? R.InClosingTagName : R.InSpecialComment, this.sectionStart = this.index));
	}
	stateInClosingTagName(e) {
		(e === L.Gt || Fi(e)) && (this.cbs.onclosetag(this.sectionStart, this.index), this.sectionStart = -1, this.state = R.AfterClosingTagName, this.stateAfterClosingTagName(e));
	}
	stateAfterClosingTagName(e) {
		(e === L.Gt || this.fastForwardTo(L.Gt)) && (this.state = R.Text, this.sectionStart = this.index + 1);
	}
	stateBeforeAttributeName(e) {
		e === L.Gt ? (this.cbs.onopentagend(this.index), this.isSpecial ? (this.state = R.InSpecialTag, this.sequenceIndex = 0) : this.state = R.Text, this.sectionStart = this.index + 1) : e === L.Slash ? this.state = R.InSelfClosingTag : Fi(e) || (this.state = R.InAttributeName, this.sectionStart = this.index);
	}
	stateInSelfClosingTag(e) {
		e === L.Gt ? (this.cbs.onselfclosingtag(this.index), this.state = R.Text, this.sectionStart = this.index + 1, this.isSpecial = !1) : Fi(e) || (this.state = R.BeforeAttributeName, this.stateBeforeAttributeName(e));
	}
	stateInAttributeName(e) {
		(e === L.Eq || Ii(e)) && (this.cbs.onattribname(this.sectionStart, this.index), this.sectionStart = this.index, this.state = R.AfterAttributeName, this.stateAfterAttributeName(e));
	}
	stateAfterAttributeName(e) {
		e === L.Eq ? this.state = R.BeforeAttributeValue : e === L.Slash || e === L.Gt ? (this.cbs.onattribend(Ri.NoValue, this.sectionStart), this.sectionStart = -1, this.state = R.BeforeAttributeName, this.stateBeforeAttributeName(e)) : Fi(e) || (this.cbs.onattribend(Ri.NoValue, this.sectionStart), this.state = R.InAttributeName, this.sectionStart = this.index);
	}
	stateBeforeAttributeValue(e) {
		e === L.DoubleQuote ? (this.state = R.InAttributeValueDq, this.sectionStart = this.index + 1) : e === L.SingleQuote ? (this.state = R.InAttributeValueSq, this.sectionStart = this.index + 1) : Fi(e) || (this.sectionStart = this.index, this.state = R.InAttributeValueNq, this.stateInAttributeValueNoQuotes(e));
	}
	handleInAttributeValue(e, t) {
		e === t || !this.decodeEntities && this.fastForwardTo(t) ? (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = -1, this.cbs.onattribend(t === L.DoubleQuote ? Ri.Double : Ri.Single, this.index + 1), this.state = R.BeforeAttributeName) : this.decodeEntities && e === L.Amp && this.startEntity();
	}
	stateInAttributeValueDoubleQuotes(e) {
		this.handleInAttributeValue(e, L.DoubleQuote);
	}
	stateInAttributeValueSingleQuotes(e) {
		this.handleInAttributeValue(e, L.SingleQuote);
	}
	stateInAttributeValueNoQuotes(e) {
		Fi(e) || e === L.Gt ? (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = -1, this.cbs.onattribend(Ri.Unquoted, this.index), this.state = R.BeforeAttributeName, this.stateBeforeAttributeName(e)) : this.decodeEntities && e === L.Amp && this.startEntity();
	}
	stateBeforeDeclaration(e) {
		e === L.OpeningSquareBracket ? (this.state = R.CDATASequence, this.sequenceIndex = 0) : this.state = e === L.Dash ? R.BeforeComment : R.InDeclaration;
	}
	stateInDeclaration(e) {
		(e === L.Gt || this.fastForwardTo(L.Gt)) && (this.cbs.ondeclaration(this.sectionStart, this.index), this.state = R.Text, this.sectionStart = this.index + 1);
	}
	stateInProcessingInstruction(e) {
		(e === L.Gt || this.fastForwardTo(L.Gt)) && (this.cbs.onprocessinginstruction(this.sectionStart, this.index), this.state = R.Text, this.sectionStart = this.index + 1);
	}
	stateBeforeComment(e) {
		e === L.Dash ? (this.state = R.InCommentLike, this.currentSequence = z.CommentEnd, this.sequenceIndex = 2, this.sectionStart = this.index + 1) : this.state = R.InDeclaration;
	}
	stateInSpecialComment(e) {
		(e === L.Gt || this.fastForwardTo(L.Gt)) && (this.cbs.oncomment(this.sectionStart, this.index, 0), this.state = R.Text, this.sectionStart = this.index + 1);
	}
	stateBeforeSpecialS(e) {
		let t = e | 32;
		t === z.ScriptEnd[3] ? this.startSpecial(z.ScriptEnd, 4) : t === z.StyleEnd[3] ? this.startSpecial(z.StyleEnd, 4) : (this.state = R.InTagName, this.stateInTagName(e));
	}
	stateBeforeSpecialT(e) {
		switch (e | 32) {
			case z.TitleEnd[3]:
				this.startSpecial(z.TitleEnd, 4);
				break;
			case z.TextareaEnd[3]:
				this.startSpecial(z.TextareaEnd, 4);
				break;
			case z.XmpEnd[3]:
				this.startSpecial(z.XmpEnd, 4);
				break;
			default: this.state = R.InTagName, this.stateInTagName(e);
		}
	}
	startEntity() {
		this.baseState = this.state, this.state = R.InEntity, this.entityStart = this.index, this.entityDecoder.startEntity(this.xmlMode ? Mi.Strict : this.baseState === R.Text || this.baseState === R.InSpecialTag ? Mi.Legacy : Mi.Attribute);
	}
	stateInEntity() {
		let e = this.index - this.offset, t = this.entityDecoder.write(this.buffer, e);
		if (t >= 0) this.state = this.baseState, t === 0 && --this.index;
		else {
			if (e < this.buffer.length && this.buffer.charCodeAt(e) === L.Amp) {
				this.state = this.baseState, --this.index;
				return;
			}
			this.index = this.offset + this.buffer.length - 1;
		}
	}
	cleanup() {
		this.running && this.sectionStart !== this.index && (this.state === R.Text || this.state === R.InSpecialTag && this.sequenceIndex === 0 ? (this.cbs.ontext(this.sectionStart, this.index), this.sectionStart = this.index) : (this.state === R.InAttributeValueDq || this.state === R.InAttributeValueSq || this.state === R.InAttributeValueNq) && (this.cbs.onattribdata(this.sectionStart, this.index), this.sectionStart = this.index));
	}
	shouldContinue() {
		return this.index < this.buffer.length + this.offset && this.running;
	}
	parse() {
		for (; this.shouldContinue();) {
			let e = this.buffer.charCodeAt(this.index - this.offset);
			switch (this.state) {
				case R.Text:
					this.stateText(e);
					break;
				case R.SpecialStartSequence:
					this.stateSpecialStartSequence(e);
					break;
				case R.InSpecialTag:
					this.stateInSpecialTag(e);
					break;
				case R.CDATASequence:
					this.stateCDATASequence(e);
					break;
				case R.InAttributeValueDq:
					this.stateInAttributeValueDoubleQuotes(e);
					break;
				case R.InAttributeName:
					this.stateInAttributeName(e);
					break;
				case R.InCommentLike:
					this.stateInCommentLike(e);
					break;
				case R.InSpecialComment:
					this.stateInSpecialComment(e);
					break;
				case R.BeforeAttributeName:
					this.stateBeforeAttributeName(e);
					break;
				case R.InTagName:
					this.stateInTagName(e);
					break;
				case R.InClosingTagName:
					this.stateInClosingTagName(e);
					break;
				case R.BeforeTagName:
					this.stateBeforeTagName(e);
					break;
				case R.AfterAttributeName:
					this.stateAfterAttributeName(e);
					break;
				case R.InAttributeValueSq:
					this.stateInAttributeValueSingleQuotes(e);
					break;
				case R.BeforeAttributeValue:
					this.stateBeforeAttributeValue(e);
					break;
				case R.BeforeClosingTagName:
					this.stateBeforeClosingTagName(e);
					break;
				case R.AfterClosingTagName:
					this.stateAfterClosingTagName(e);
					break;
				case R.BeforeSpecialS:
					this.stateBeforeSpecialS(e);
					break;
				case R.BeforeSpecialT:
					this.stateBeforeSpecialT(e);
					break;
				case R.InAttributeValueNq:
					this.stateInAttributeValueNoQuotes(e);
					break;
				case R.InSelfClosingTag:
					this.stateInSelfClosingTag(e);
					break;
				case R.InDeclaration:
					this.stateInDeclaration(e);
					break;
				case R.BeforeDeclaration:
					this.stateBeforeDeclaration(e);
					break;
				case R.BeforeComment:
					this.stateBeforeComment(e);
					break;
				case R.InProcessingInstruction:
					this.stateInProcessingInstruction(e);
					break;
				case R.InEntity: this.stateInEntity();
			}
			this.index++;
		}
		this.cleanup();
	}
	finish() {
		this.state === R.InEntity && (this.entityDecoder.end(), this.state = this.baseState), this.handleTrailingData(), this.cbs.onend();
	}
	handleTrailingData() {
		let e = this.buffer.length + this.offset;
		this.sectionStart >= e || (this.state === R.InCommentLike ? this.currentSequence === z.CdataEnd ? this.cbs.oncdata(this.sectionStart, e, 0) : this.cbs.oncomment(this.sectionStart, e, 0) : this.state === R.InTagName || this.state === R.BeforeAttributeName || this.state === R.BeforeAttributeValue || this.state === R.AfterAttributeName || this.state === R.InAttributeName || this.state === R.InAttributeValueSq || this.state === R.InAttributeValueDq || this.state === R.InAttributeValueNq || this.state === R.InClosingTagName || this.cbs.ontext(this.sectionStart, e));
	}
	emitCodePoint(e, t) {
		this.baseState !== R.Text && this.baseState !== R.InSpecialTag ? (this.sectionStart < this.entityStart && this.cbs.onattribdata(this.sectionStart, this.entityStart), this.sectionStart = this.entityStart + t, this.index = this.sectionStart - 1, this.cbs.onattribentity(e)) : (this.sectionStart < this.entityStart && this.cbs.ontext(this.sectionStart, this.entityStart), this.sectionStart = this.entityStart + t, this.index = this.sectionStart - 1, this.cbs.ontextentity(e, this.sectionStart));
	}
}, Bi = /* @__PURE__ */ new Set([
	"input",
	"option",
	"optgroup",
	"select",
	"button",
	"datalist",
	"textarea"
]), B = /* @__PURE__ */ new Set(["p"]), Vi = /* @__PURE__ */ new Set(["thead", "tbody"]), Hi = /* @__PURE__ */ new Set(["dd", "dt"]), Ui = /* @__PURE__ */ new Set(["rt", "rp"]), Wi = /* @__PURE__ */ new Map([
	["tr", /* @__PURE__ */ new Set([
		"tr",
		"th",
		"td"
	])],
	["th", /* @__PURE__ */ new Set(["th"])],
	["td", /* @__PURE__ */ new Set([
		"thead",
		"th",
		"td"
	])],
	["body", /* @__PURE__ */ new Set([
		"head",
		"link",
		"script"
	])],
	["li", /* @__PURE__ */ new Set(["li"])],
	["p", B],
	["h1", B],
	["h2", B],
	["h3", B],
	["h4", B],
	["h5", B],
	["h6", B],
	["select", Bi],
	["input", Bi],
	["output", Bi],
	["button", Bi],
	["datalist", Bi],
	["textarea", Bi],
	["option", /* @__PURE__ */ new Set(["option"])],
	["optgroup", /* @__PURE__ */ new Set(["optgroup", "option"])],
	["dd", Hi],
	["dt", Hi],
	["address", B],
	["article", B],
	["aside", B],
	["blockquote", B],
	["details", B],
	["div", B],
	["dl", B],
	["fieldset", B],
	["figcaption", B],
	["figure", B],
	["footer", B],
	["form", B],
	["header", B],
	["hr", B],
	["main", B],
	["nav", B],
	["ol", B],
	["pre", B],
	["section", B],
	["table", B],
	["ul", B],
	["rt", Ui],
	["rp", Ui],
	["tbody", Vi],
	["tfoot", Vi]
]), Gi = /* @__PURE__ */ new Set([
	"area",
	"base",
	"basefont",
	"br",
	"col",
	"command",
	"embed",
	"frame",
	"hr",
	"img",
	"input",
	"isindex",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]), Ki = /* @__PURE__ */ new Set(["math", "svg"]), qi = /* @__PURE__ */ new Set([
	"mi",
	"mo",
	"mn",
	"ms",
	"mtext",
	"annotation-xml",
	"foreignobject",
	"desc",
	"title"
]), Ji = /\s|\//, Yi = class {
	constructor(e, t = {}) {
		var n, r;
		this.options = t, this.startIndex = 0, this.endIndex = 0, this.openTagStart = 0, this.tagname = "", this.attribname = "", this.attribvalue = "", this.attribs = null, this.stack = [], this.buffers = [], this.bufferOffset = 0, this.writeIndex = 0, this.ended = !1, this.cbs = e ?? {}, this.htmlMode = !this.options.xmlMode, this.lowerCaseTagNames = t.lowerCaseTags ?? this.htmlMode, this.lowerCaseAttributeNames = t.lowerCaseAttributeNames ?? this.htmlMode, this.recognizeSelfClosing = t.recognizeSelfClosing ?? !this.htmlMode, this.tokenizer = new (t.Tokenizer ?? zi)(this.options, this), this.foreignContext = [!this.htmlMode], (r = (n = this.cbs).onparserinit) == null || r.call(n, this);
	}
	ontext(e, t) {
		var n, r;
		let i = this.getSlice(e, t);
		this.endIndex = t - 1, (r = (n = this.cbs).ontext) == null || r.call(n, i), this.startIndex = t;
	}
	ontextentity(e, t) {
		var n, r;
		this.endIndex = t - 1, (r = (n = this.cbs).ontext) == null || r.call(n, bi(e)), this.startIndex = t;
	}
	isVoidElement(e) {
		return this.htmlMode && Gi.has(e);
	}
	onopentagname(e, t) {
		this.endIndex = t;
		let n = this.getSlice(e, t);
		this.lowerCaseTagNames && (n = n.toLowerCase()), this.emitOpenTag(n);
	}
	emitOpenTag(e) {
		var t, n, r, i;
		this.openTagStart = this.startIndex, this.tagname = e;
		let a = this.htmlMode && Wi.get(e);
		if (a) for (; this.stack.length > 0 && a.has(this.stack[0]);) {
			let e = this.stack.shift();
			(n = (t = this.cbs).onclosetag) == null || n.call(t, e, !0);
		}
		this.isVoidElement(e) || (this.stack.unshift(e), this.htmlMode && (Ki.has(e) ? this.foreignContext.unshift(!0) : qi.has(e) && this.foreignContext.unshift(!1))), (i = (r = this.cbs).onopentagname) == null || i.call(r, e), this.cbs.onopentag && (this.attribs = {});
	}
	endOpenTag(e) {
		var t, n;
		this.startIndex = this.openTagStart, this.attribs &&= ((n = (t = this.cbs).onopentag) == null || n.call(t, this.tagname, this.attribs, e), null), this.cbs.onclosetag && this.isVoidElement(this.tagname) && this.cbs.onclosetag(this.tagname, !0), this.tagname = "";
	}
	onopentagend(e) {
		this.endIndex = e, this.endOpenTag(!1), this.startIndex = e + 1;
	}
	onclosetag(e, t) {
		var n, r, i, a, o, s, c, l;
		this.endIndex = t;
		let u = this.getSlice(e, t);
		if (this.lowerCaseTagNames && (u = u.toLowerCase()), this.htmlMode && (Ki.has(u) || qi.has(u)) && this.foreignContext.shift(), this.isVoidElement(u)) this.htmlMode && u === "br" && ((a = (i = this.cbs).onopentagname) == null || a.call(i, "br"), (s = (o = this.cbs).onopentag) == null || s.call(o, "br", {}, !0), (l = (c = this.cbs).onclosetag) == null || l.call(c, "br", !1));
		else {
			let e = this.stack.indexOf(u);
			if (e !== -1) for (let t = 0; t <= e; t++) {
				let i = this.stack.shift();
				(r = (n = this.cbs).onclosetag) == null || r.call(n, i, t !== e);
			}
			else this.htmlMode && u === "p" && (this.emitOpenTag("p"), this.closeCurrentTag(!0));
		}
		this.startIndex = t + 1;
	}
	onselfclosingtag(e) {
		this.endIndex = e, this.recognizeSelfClosing || this.foreignContext[0] ? (this.closeCurrentTag(!1), this.startIndex = e + 1) : this.onopentagend(e);
	}
	closeCurrentTag(e) {
		var t, n;
		let r = this.tagname;
		this.endOpenTag(e), this.stack[0] === r && ((n = (t = this.cbs).onclosetag) == null || n.call(t, r, !e), this.stack.shift());
	}
	onattribname(e, t) {
		this.startIndex = e;
		let n = this.getSlice(e, t);
		this.attribname = this.lowerCaseAttributeNames ? n.toLowerCase() : n;
	}
	onattribdata(e, t) {
		this.attribvalue += this.getSlice(e, t);
	}
	onattribentity(e) {
		this.attribvalue += bi(e);
	}
	onattribend(e, t) {
		var n, r;
		this.endIndex = t, (r = (n = this.cbs).onattribute) == null || r.call(n, this.attribname, this.attribvalue, e === Ri.Double ? "\"" : e === Ri.Single ? "'" : e === Ri.NoValue ? void 0 : null), this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname) && (this.attribs[this.attribname] = this.attribvalue), this.attribvalue = "";
	}
	getInstructionName(e) {
		let t = e.search(Ji), n = t < 0 ? e : e.substr(0, t);
		return this.lowerCaseTagNames && (n = n.toLowerCase()), n;
	}
	ondeclaration(e, t) {
		this.endIndex = t;
		let n = this.getSlice(e, t);
		if (this.cbs.onprocessinginstruction) {
			let e = this.getInstructionName(n);
			this.cbs.onprocessinginstruction(`!${e}`, `!${n}`);
		}
		this.startIndex = t + 1;
	}
	onprocessinginstruction(e, t) {
		this.endIndex = t;
		let n = this.getSlice(e, t);
		if (this.cbs.onprocessinginstruction) {
			let e = this.getInstructionName(n);
			this.cbs.onprocessinginstruction(`?${e}`, `?${n}`);
		}
		this.startIndex = t + 1;
	}
	oncomment(e, t, n) {
		var r, i, a, o;
		this.endIndex = t, (i = (r = this.cbs).oncomment) == null || i.call(r, this.getSlice(e, t - n)), (o = (a = this.cbs).oncommentend) == null || o.call(a), this.startIndex = t + 1;
	}
	oncdata(e, t, n) {
		var r, i, a, o, s, c, l, u, d, f;
		this.endIndex = t;
		let p = this.getSlice(e, t - n);
		!this.htmlMode || this.options.recognizeCDATA ? ((i = (r = this.cbs).oncdatastart) == null || i.call(r), (o = (a = this.cbs).ontext) == null || o.call(a, p), (c = (s = this.cbs).oncdataend) == null || c.call(s)) : ((u = (l = this.cbs).oncomment) == null || u.call(l, `[CDATA[${p}]]`), (f = (d = this.cbs).oncommentend) == null || f.call(d)), this.startIndex = t + 1;
	}
	onend() {
		var e, t;
		if (this.cbs.onclosetag) {
			this.endIndex = this.startIndex;
			for (let e = 0; e < this.stack.length; e++) this.cbs.onclosetag(this.stack[e], !0);
		}
		(t = (e = this.cbs).onend) == null || t.call(e);
	}
	reset() {
		var e, t, n, r;
		(t = (e = this.cbs).onreset) == null || t.call(e), this.tokenizer.reset(), this.tagname = "", this.attribname = "", this.attribs = null, this.stack.length = 0, this.startIndex = 0, this.endIndex = 0, (r = (n = this.cbs).onparserinit) == null || r.call(n, this), this.buffers.length = 0, this.foreignContext.length = 0, this.foreignContext.unshift(!this.htmlMode), this.bufferOffset = 0, this.writeIndex = 0, this.ended = !1;
	}
	parseComplete(e) {
		this.reset(), this.end(e);
	}
	getSlice(e, t) {
		for (; e - this.bufferOffset >= this.buffers[0].length;) this.shiftBuffer();
		let n = this.buffers[0].slice(e - this.bufferOffset, t - this.bufferOffset);
		for (; t - this.bufferOffset > this.buffers[0].length;) this.shiftBuffer(), n += this.buffers[0].slice(0, t - this.bufferOffset);
		return n;
	}
	shiftBuffer() {
		this.bufferOffset += this.buffers[0].length, this.writeIndex--, this.buffers.shift();
	}
	write(e) {
		var t, n;
		if (this.ended) {
			(n = (t = this.cbs).onerror) == null || n.call(t, /* @__PURE__ */ Error(".write() after done!"));
			return;
		}
		this.buffers.push(e), this.tokenizer.running && (this.tokenizer.write(e), this.writeIndex++);
	}
	end(e) {
		var t, n;
		if (this.ended) {
			(n = (t = this.cbs).onerror) == null || n.call(t, /* @__PURE__ */ Error(".end() after done!"));
			return;
		}
		e && this.write(e), this.ended = !0, this.tokenizer.end();
	}
	pause() {
		this.tokenizer.pause();
	}
	resume() {
		for (this.tokenizer.resume(); this.tokenizer.running && this.writeIndex < this.buffers.length;) this.tokenizer.write(this.buffers[this.writeIndex++]);
		this.ended && this.tokenizer.end();
	}
	parseChunk(e) {
		this.write(e);
	}
	done(e) {
		this.end(e);
	}
};
//#endregion
//#region node_modules/.pnpm/htmlparser2@10.1.0/node_modules/htmlparser2/dist/esm/index.js
function Xi(e, t) {
	let n = new Fn(void 0, t);
	return new Yi(n, t).end(e), n.root;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/api/attributes.js
var Zi = /* @__PURE__ */ m({
	addClass: () => ya,
	attr: () => aa,
	data: () => pa,
	hasClass: () => va,
	prop: () => ca,
	removeAttr: () => _a,
	removeClass: () => ba,
	toggleClass: () => xa,
	val: () => ma
}), Qi = Object.hasOwn ?? ((e, t) => Object.prototype.hasOwnProperty.call(e, t)), $i = /\s+/, ea = "data-", ta = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, na = /^{[^]*}$|^\[[^]*]$/;
function ra(e, t, n) {
	if (!(!e || !N(e))) {
		if (e.attribs ??= {}, !t) return e.attribs;
		if (Qi(e.attribs, t)) return !n && ta.test(t) ? t : e.attribs[t];
		if (e.name === "option" && t === "value") return si(e.children);
		if (e.name === "input" && (e.attribs.type === "radio" || e.attribs.type === "checkbox") && t === "value") return "on";
	}
}
function ia(e, t, n) {
	n === null ? ha(e, t) : e.attribs[t] = `${n}`;
}
function aa(e, t) {
	if (typeof e == "object" || t !== void 0) {
		if (typeof t == "function") {
			if (typeof e != "string") throw Error("Bad combination of arguments.");
			return F(this, (n, r) => {
				N(n) && ia(n, e, t.call(n, r, n.attribs[e]));
			});
		}
		return F(this, (n) => {
			if (N(n)) {
				if (typeof e == "object") for (let t of Object.keys(e)) {
					let r = e[t];
					ia(n, t, r);
				}
				else ia(n, e, t);
			}
		});
	}
	return arguments.length > 1 ? this : ra(this[0], e, this.options.xmlMode);
}
function oa(e, t, n) {
	return t in e ? e[t] : !n && ta.test(t) ? ra(e, t, !1) !== void 0 : ra(e, t, n);
}
function sa(e, t, n, r) {
	t in e ? e[t] = n : ia(e, t, !r && ta.test(t) ? n ? "" : null : `${n}`);
}
function ca(e, t) {
	if (typeof e == "string" && t === void 0) {
		let t = this[0];
		if (!t) return;
		switch (e) {
			case "style": {
				let e = this.css(), t = Object.keys(e);
				for (let n = 0; n < t.length; n++) e[n] = t[n];
				return e.length = t.length, e;
			}
			case "tagName":
			case "nodeName": return N(t) ? t.name.toUpperCase() : void 0;
			case "href":
			case "src": {
				if (!N(t)) return;
				let n = t.attribs?.[e];
				return typeof URL < "u" && (e === "href" && (t.tagName === "a" || t.tagName === "link") || e === "src" && (t.tagName === "img" || t.tagName === "iframe" || t.tagName === "audio" || t.tagName === "video" || t.tagName === "source")) && n !== void 0 && this.options.baseURI ? new URL(n, this.options.baseURI).href : n;
			}
			case "innerText": return cr(t);
			case "textContent": return sr(t);
			case "outerHTML": return t.type === ln ? this.html() : this.clone().wrap("<container />").parent().html();
			case "innerHTML": return this.html();
			default: return N(t) ? oa(t, e, this.options.xmlMode) : void 0;
		}
	}
	if (typeof e == "object" || t !== void 0) {
		if (typeof t == "function") {
			if (typeof e == "object") throw TypeError("Bad combination of arguments.");
			return F(this, (n, r) => {
				N(n) && sa(n, e, t.call(n, r, oa(n, e, this.options.xmlMode)), this.options.xmlMode);
			});
		}
		return F(this, (n) => {
			if (N(n)) {
				if (typeof e == "object") for (let t of Object.keys(e)) {
					let r = e[t];
					sa(n, t, r, this.options.xmlMode);
				}
				else sa(n, e, t, this.options.xmlMode);
			}
		});
	}
}
function la(e, t, n) {
	e.data ??= {}, typeof t == "object" ? Object.assign(e.data, t) : typeof t == "string" && n !== void 0 && (e.data[t] = n);
}
function ua(e) {
	for (let t of Object.keys(e.attribs)) {
		if (!t.startsWith(ea)) continue;
		let n = hi(t.slice(5));
		Qi(e.data, n) || (e.data[n] = fa(e.attribs[t]));
	}
	return e.data;
}
function da(e, t) {
	let n = ea + gi(t), r = e.data;
	if (Qi(r, t)) return r[t];
	if (Qi(e.attribs, n)) return r[t] = fa(e.attribs[n]);
}
function fa(e) {
	if (e === "null") return null;
	if (e === "true") return !0;
	if (e === "false") return !1;
	let t = Number(e);
	if (e === String(t)) return t;
	if (na.test(e)) try {
		return JSON.parse(e);
	} catch {}
	return e;
}
function pa(e, t) {
	let n = this[0];
	if (!n || !N(n)) return;
	let r = n;
	return r.data ??= {}, e == null ? ua(r) : typeof e == "object" || t !== void 0 ? (F(this, (n) => {
		N(n) && (typeof e == "object" ? la(n, e) : la(n, e, t));
	}), this) : da(r, e);
}
function ma(e) {
	let t = arguments.length === 0, n = this[0];
	if (!n || !N(n)) return t ? void 0 : this;
	switch (n.name) {
		case "textarea": return this.text(e);
		case "select": {
			let n = this.find("option:selected");
			if (!t) {
				if (this.attr("multiple") == null && typeof e == "object") return this;
				this.find("option").removeAttr("selected");
				let t = typeof e == "object" ? e : [e];
				for (let e of t) this.find(`option[value="${e}"]`).attr("selected", "");
				return this;
			}
			return this.attr("multiple") ? n.toArray().map((e) => si(e.children)) : n.attr("value");
		}
		case "button":
		case "input":
		case "option": return t ? this.attr("value") : this.attr("value", e);
	}
}
function ha(e, t) {
	!e.attribs || !Qi(e.attribs, t) || delete e.attribs[t];
}
function ga(e) {
	return e ? e.trim().split($i) : [];
}
function _a(e) {
	let t = ga(e);
	for (let e of t) F(this, (t) => {
		N(t) && ha(t, e);
	});
	return this;
}
function va(e) {
	return this.toArray().some((t) => {
		let n = N(t) && t.attribs.class, r = -1;
		if (n && e.length > 0) for (; (r = n.indexOf(e, r + 1)) > -1;) {
			let t = r + e.length;
			if ((r === 0 || $i.test(n[r - 1])) && (t === n.length || $i.test(n[t]))) return !0;
		}
		return !1;
	});
}
function ya(e) {
	if (typeof e == "function") return F(this, (t, n) => {
		if (N(t)) {
			let r = t.attribs.class || "";
			ya.call([t], e.call(t, n, r));
		}
	});
	if (!e || typeof e != "string") return this;
	let t = e.split($i), n = this.length;
	for (let e = 0; e < n; e++) {
		let n = this[e];
		if (!N(n)) continue;
		let r = ra(n, "class", !1);
		if (r) {
			let e = ` ${r} `;
			for (let n of t) {
				let t = `${n} `;
				e.includes(` ${t}`) || (e += t);
			}
			ia(n, "class", e.trim());
		} else ia(n, "class", t.join(" ").trim());
	}
	return this;
}
function ba(e) {
	if (typeof e == "function") return F(this, (t, n) => {
		N(t) && ba.call([t], e.call(t, n, t.attribs.class || ""));
	});
	let t = ga(e), n = t.length, r = arguments.length === 0;
	return F(this, (e) => {
		if (N(e)) {
			if (r) e.attribs.class = "";
			else {
				let r = ga(e.attribs.class), i = !1;
				for (let e = 0; e < n; e++) {
					let n = r.indexOf(t[e]);
					n !== -1 && (r.splice(n, 1), i = !0, e--);
				}
				i && (e.attribs.class = r.join(" "));
			}
		}
	});
}
function xa(e, t) {
	if (typeof e == "function") return F(this, (n, r) => {
		N(n) && xa.call([n], e.call(n, r, n.attribs.class || "", t), t);
	});
	if (!e || typeof e != "string") return this;
	let n = e.split($i), r = n.length, i = typeof t == "boolean" ? t ? 1 : -1 : 0, a = this.length;
	for (let e = 0; e < a; e++) {
		let t = this[e];
		if (!N(t)) continue;
		let a = ga(t.attribs.class);
		for (let e = 0; e < r; e++) {
			let t = a.indexOf(n[e]);
			i >= 0 && t === -1 ? a.push(n[e]) : i <= 0 && t !== -1 && a.splice(t, 1);
		}
		t.attribs.class = a.join(" ");
	}
	return this;
}
//#endregion
//#region node_modules/.pnpm/css-what@6.2.2/node_modules/css-what/lib/es/types.js
var V;
(function(e) {
	e.Attribute = "attribute", e.Pseudo = "pseudo", e.PseudoElement = "pseudo-element", e.Tag = "tag", e.Universal = "universal", e.Adjacent = "adjacent", e.Child = "child", e.Descendant = "descendant", e.Parent = "parent", e.Sibling = "sibling", e.ColumnCombinator = "column-combinator";
})(V ||= {});
var H;
(function(e) {
	e.Any = "any", e.Element = "element", e.End = "end", e.Equals = "equals", e.Exists = "exists", e.Hyphen = "hyphen", e.Not = "not", e.Start = "start";
})(H ||= {});
//#endregion
//#region node_modules/.pnpm/css-what@6.2.2/node_modules/css-what/lib/es/parse.js
var Sa = /^[^\\#]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/, Ca = /\\([\da-f]{1,6}\s?|(\s)|.)/gi, wa = /* @__PURE__ */ new Map([
	[126, H.Element],
	[94, H.Start],
	[36, H.End],
	[42, H.Any],
	[33, H.Not],
	[124, H.Hyphen]
]), Ta = /* @__PURE__ */ new Set([
	"has",
	"not",
	"matches",
	"is",
	"where",
	"host",
	"host-context"
]);
function Ea(e) {
	switch (e.type) {
		case V.Adjacent:
		case V.Child:
		case V.Descendant:
		case V.Parent:
		case V.Sibling:
		case V.ColumnCombinator: return !0;
		default: return !1;
	}
}
var Da = /* @__PURE__ */ new Set(["contains", "icontains"]);
function Oa(e, t, n) {
	let r = parseInt(t, 16) - 65536;
	return r !== r || n ? t : r < 0 ? String.fromCharCode(r + 65536) : String.fromCharCode(r >> 10 | 55296, r & 1023 | 56320);
}
function ka(e) {
	return e.replace(Ca, Oa);
}
function Aa(e) {
	return e === 39 || e === 34;
}
function ja(e) {
	return e === 32 || e === 9 || e === 10 || e === 12 || e === 13;
}
function Ma(e) {
	let t = [], n = Na(t, `${e}`, 0);
	if (n < e.length) throw Error(`Unmatched selector: ${e.slice(n)}`);
	return t;
}
function Na(e, t, n) {
	let r = [];
	function i(e) {
		let r = t.slice(n + e).match(Sa);
		if (!r) throw Error(`Expected name, found ${t.slice(n)}`);
		let [i] = r;
		return n += e + i.length, ka(i);
	}
	function a(e) {
		for (n += e; n < t.length && ja(t.charCodeAt(n));) n++;
	}
	function o() {
		n += 1;
		let e = n, r = 1;
		for (; r > 0 && n < t.length; n++) t.charCodeAt(n) === 40 && !s(n) ? r++ : t.charCodeAt(n) === 41 && !s(n) && r--;
		if (r) throw Error("Parenthesis not matched");
		return ka(t.slice(e, n - 1));
	}
	function s(e) {
		let n = 0;
		for (; t.charCodeAt(--e) === 92;) n++;
		return (n & 1) == 1;
	}
	function c() {
		if (r.length > 0 && Ea(r[r.length - 1])) throw Error("Did not expect successive traversals.");
	}
	function l(e) {
		if (r.length > 0 && r[r.length - 1].type === V.Descendant) {
			r[r.length - 1].type = e;
			return;
		}
		c(), r.push({ type: e });
	}
	function u(e, t) {
		r.push({
			type: V.Attribute,
			name: e,
			action: t,
			value: i(1),
			namespace: null,
			ignoreCase: "quirks"
		});
	}
	function d() {
		if (r.length && r[r.length - 1].type === V.Descendant && r.pop(), r.length === 0) throw Error("Empty sub-selector");
		e.push(r);
	}
	if (a(0), t.length === n) return n;
	loop: for (; n < t.length;) {
		let e = t.charCodeAt(n);
		switch (e) {
			case 32:
			case 9:
			case 10:
			case 12:
			case 13:
				(r.length === 0 || r[0].type !== V.Descendant) && (c(), r.push({ type: V.Descendant })), a(1);
				break;
			case 62:
				l(V.Child), a(1);
				break;
			case 60:
				l(V.Parent), a(1);
				break;
			case 126:
				l(V.Sibling), a(1);
				break;
			case 43:
				l(V.Adjacent), a(1);
				break;
			case 46:
				u("class", H.Element);
				break;
			case 35:
				u("id", H.Equals);
				break;
			case 91: {
				a(1);
				let e, o = null;
				t.charCodeAt(n) === 124 ? e = i(1) : t.startsWith("*|", n) ? (o = "*", e = i(2)) : (e = i(0), t.charCodeAt(n) === 124 && t.charCodeAt(n + 1) !== 61 && (o = e, e = i(1))), a(0);
				let c = H.Exists, l = wa.get(t.charCodeAt(n));
				if (l) {
					if (c = l, t.charCodeAt(n + 1) !== 61) throw Error("Expected `=`");
					a(2);
				} else t.charCodeAt(n) === 61 && (c = H.Equals, a(1));
				let u = "", d = null;
				if (c !== "exists") {
					if (Aa(t.charCodeAt(n))) {
						let e = t.charCodeAt(n), r = n + 1;
						for (; r < t.length && (t.charCodeAt(r) !== e || s(r));) r += 1;
						if (t.charCodeAt(r) !== e) throw Error("Attribute value didn't end");
						u = ka(t.slice(n + 1, r)), n = r + 1;
					} else {
						let e = n;
						for (; n < t.length && (!ja(t.charCodeAt(n)) && t.charCodeAt(n) !== 93 || s(n));) n += 1;
						u = ka(t.slice(e, n));
					}
					a(0);
					let e = t.charCodeAt(n) | 32;
					e === 115 ? (d = !1, a(1)) : e === 105 && (d = !0, a(1));
				}
				if (t.charCodeAt(n) !== 93) throw Error("Attribute selector didn't terminate");
				n += 1;
				let f = {
					type: V.Attribute,
					name: e,
					action: c,
					value: u,
					namespace: o,
					ignoreCase: d
				};
				r.push(f);
				break;
			}
			case 58: {
				if (t.charCodeAt(n + 1) === 58) {
					r.push({
						type: V.PseudoElement,
						name: i(2).toLowerCase(),
						data: t.charCodeAt(n) === 40 ? o() : null
					});
					continue;
				}
				let e = i(1).toLowerCase(), a = null;
				if (t.charCodeAt(n) === 40) {
					if (Ta.has(e)) {
						if (Aa(t.charCodeAt(n + 1))) throw Error(`Pseudo-selector ${e} cannot be quoted`);
						if (a = [], n = Na(a, t, n + 1), t.charCodeAt(n) !== 41) throw Error(`Missing closing parenthesis in :${e} (${t})`);
						n += 1;
					} else {
						if (a = o(), Da.has(e)) {
							let e = a.charCodeAt(0);
							e === a.charCodeAt(a.length - 1) && Aa(e) && (a = a.slice(1, -1));
						}
						a = ka(a);
					}
				}
				r.push({
					type: V.Pseudo,
					name: e,
					data: a
				});
				break;
			}
			case 44:
				d(), r = [], a(1);
				break;
			default: {
				if (t.startsWith("/*", n)) {
					let e = t.indexOf("*/", n + 2);
					if (e < 0) throw Error("Comment was not terminated");
					n = e + 2, r.length === 0 && a(0);
					break;
				}
				let o = null, s;
				if (e === 42) n += 1, s = "*";
				else if (e === 124) {
					if (s = "", t.charCodeAt(n + 1) === 124) {
						l(V.ColumnCombinator), a(2);
						break;
					}
				} else if (Sa.test(t.slice(n))) s = i(0);
				else break loop;
				t.charCodeAt(n) === 124 && t.charCodeAt(n + 1) !== 124 && (o = s, t.charCodeAt(n + 1) === 42 ? (s = "*", n += 2) : s = i(1)), r.push(s === "*" ? {
					type: V.Universal,
					namespace: o
				} : {
					type: V.Tag,
					name: s,
					namespace: o
				});
			}
		}
	}
	return d(), n;
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/sort.js
var U = /* @__PURE__ */ n((/* @__PURE__ */ e(((e, t) => {
	t.exports = {
		trueFunc: function() {
			return !0;
		},
		falseFunc: function() {
			return !1;
		}
	};
})))()), Pa = /* @__PURE__ */ new Map([
	[V.Universal, 50],
	[V.Tag, 30],
	[V.Attribute, 1],
	[V.Pseudo, 0]
]);
function Fa(e) {
	return !Pa.has(e.type);
}
var Ia = /* @__PURE__ */ new Map([
	[H.Exists, 10],
	[H.Equals, 8],
	[H.Not, 7],
	[H.Start, 6],
	[H.End, 6],
	[H.Any, 5]
]);
function La(e) {
	let t = e.map(Ra);
	for (let n = 1; n < e.length; n++) {
		let r = t[n];
		if (!(r < 0)) for (let i = n - 1; i >= 0 && r < t[i]; i--) {
			let n = e[i + 1];
			e[i + 1] = e[i], e[i] = n, t[i + 1] = t[i], t[i] = r;
		}
	}
}
function Ra(e) {
	let t = Pa.get(e.type) ?? -1;
	return e.type === V.Attribute ? (t = Ia.get(e.action) ?? 4, e.action === H.Equals && e.name === "id" && (t = 9), e.ignoreCase && (t >>= 1)) : e.type === V.Pseudo && (e.data ? e.name === "has" || e.name === "contains" ? t = 0 : Array.isArray(e.data) ? (t = Math.min(...e.data.map((e) => Math.min(...e.map(Ra)))), t < 0 && (t = 0)) : t = 2 : t = 3), t;
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/attributes.js
var za = /[-[\]{}()*+?.,\\^$|#\s]/g;
function Ba(e) {
	return e.replace(za, "\\$&");
}
var Va = /* @__PURE__ */ new Set(/* @__PURE__ */ "accept.accept-charset.align.alink.axis.bgcolor.charset.checked.clear.codetype.color.compact.declare.defer.dir.direction.disabled.enctype.face.frame.hreflang.http-equiv.lang.language.link.media.method.multiple.nohref.noresize.noshade.nowrap.readonly.rel.rev.rules.scope.scrolling.selected.shape.target.text.type.valign.valuetype.vlink".split("."));
function Ha(e, t) {
	return typeof e.ignoreCase == "boolean" ? e.ignoreCase : e.ignoreCase === "quirks" ? !!t.quirksMode : !t.xmlMode && Va.has(e.name);
}
var Ua = {
	equals(e, t, n) {
		let { adapter: r } = n, { name: i } = t, { value: a } = t;
		return Ha(t, n) ? (a = a.toLowerCase(), (t) => {
			let n = r.getAttributeValue(t, i);
			return n != null && n.length === a.length && n.toLowerCase() === a && e(t);
		}) : (t) => r.getAttributeValue(t, i) === a && e(t);
	},
	hyphen(e, t, n) {
		let { adapter: r } = n, { name: i } = t, { value: a } = t, o = a.length;
		return Ha(t, n) ? (a = a.toLowerCase(), function(t) {
			let n = r.getAttributeValue(t, i);
			return n != null && (n.length === o || n.charAt(o) === "-") && n.substr(0, o).toLowerCase() === a && e(t);
		}) : function(t) {
			let n = r.getAttributeValue(t, i);
			return n != null && (n.length === o || n.charAt(o) === "-") && n.substr(0, o) === a && e(t);
		};
	},
	element(e, t, n) {
		let { adapter: r } = n, { name: i, value: a } = t;
		if (/\s/.test(a)) return U.default.falseFunc;
		let o = RegExp(`(?:^|\\s)${Ba(a)}(?:$|\\s)`, Ha(t, n) ? "i" : "");
		return function(t) {
			let n = r.getAttributeValue(t, i);
			return n != null && n.length >= a.length && o.test(n) && e(t);
		};
	},
	exists(e, { name: t }, { adapter: n }) {
		return (r) => n.hasAttrib(r, t) && e(r);
	},
	start(e, t, n) {
		let { adapter: r } = n, { name: i } = t, { value: a } = t, o = a.length;
		return o === 0 ? U.default.falseFunc : Ha(t, n) ? (a = a.toLowerCase(), (t) => {
			let n = r.getAttributeValue(t, i);
			return n != null && n.length >= o && n.substr(0, o).toLowerCase() === a && e(t);
		}) : (t) => !!r.getAttributeValue(t, i)?.startsWith(a) && e(t);
	},
	end(e, t, n) {
		let { adapter: r } = n, { name: i } = t, { value: a } = t, o = -a.length;
		return o === 0 ? U.default.falseFunc : Ha(t, n) ? (a = a.toLowerCase(), (t) => r.getAttributeValue(t, i)?.substr(o).toLowerCase() === a && e(t)) : (t) => !!r.getAttributeValue(t, i)?.endsWith(a) && e(t);
	},
	any(e, t, n) {
		let { adapter: r } = n, { name: i, value: a } = t;
		if (a === "") return U.default.falseFunc;
		if (Ha(t, n)) {
			let t = new RegExp(Ba(a), "i");
			return function(n) {
				let o = r.getAttributeValue(n, i);
				return o != null && o.length >= a.length && t.test(o) && e(n);
			};
		}
		return (t) => !!r.getAttributeValue(t, i)?.includes(a) && e(t);
	},
	not(e, t, n) {
		let { adapter: r } = n, { name: i } = t, { value: a } = t;
		return a === "" ? (t) => !!r.getAttributeValue(t, i) && e(t) : Ha(t, n) ? (a = a.toLowerCase(), (t) => {
			let n = r.getAttributeValue(t, i);
			return (n == null || n.length !== a.length || n.toLowerCase() !== a) && e(t);
		}) : (t) => r.getAttributeValue(t, i) !== a && e(t);
	}
}, Wa = /* @__PURE__ */ new Set([
	9,
	10,
	12,
	13,
	32
]), Ga = 48, Ka = 57;
function qa(e) {
	if (e = e.trim().toLowerCase(), e === "even") return [2, 0];
	if (e === "odd") return [2, 1];
	let t = 0, n = 0, r = a(), i = o();
	if (t < e.length && e.charAt(t) === "n" && (t++, n = r * (i ?? 1), s(), t < e.length ? (r = a(), s(), i = o()) : r = i = 0), i === null || t < e.length) throw Error(`n-th rule couldn't be parsed ('${e}')`);
	return [n, r * i];
	function a() {
		return e.charAt(t) === "-" ? (t++, -1) : (e.charAt(t) === "+" && t++, 1);
	}
	function o() {
		let n = t, r = 0;
		for (; t < e.length && e.charCodeAt(t) >= Ga && e.charCodeAt(t) <= Ka;) r = r * 10 + (e.charCodeAt(t) - Ga), t++;
		return t === n ? null : r;
	}
	function s() {
		for (; t < e.length && Wa.has(e.charCodeAt(t));) t++;
	}
}
//#endregion
//#region node_modules/.pnpm/nth-check@2.1.1/node_modules/nth-check/lib/esm/compile.js
function Ja(e) {
	let t = e[0], n = e[1] - 1;
	if (n < 0 && t <= 0) return U.default.falseFunc;
	if (t === -1) return (e) => e <= n;
	if (t === 0) return (e) => e === n;
	if (t === 1) return n < 0 ? U.default.trueFunc : (e) => e >= n;
	let r = Math.abs(t), i = (n % r + r) % r;
	return t > 1 ? (e) => e >= n && e % r === i : (e) => e <= n && e % r === i;
}
//#endregion
//#region node_modules/.pnpm/nth-check@2.1.1/node_modules/nth-check/lib/esm/index.js
function Ya(e) {
	return Ja(qa(e));
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/pseudo-selectors/filters.js
function Xa(e, t) {
	return (n) => {
		let r = t.getParent(n);
		return r != null && t.isTag(r) && e(n);
	};
}
var Za = {
	contains(e, t, { adapter: n }) {
		return function(r) {
			return e(r) && n.getText(r).includes(t);
		};
	},
	icontains(e, t, { adapter: n }) {
		let r = t.toLowerCase();
		return function(t) {
			return e(t) && n.getText(t).toLowerCase().includes(r);
		};
	},
	"nth-child"(e, t, { adapter: n, equals: r }) {
		let i = Ya(t);
		return i === U.default.falseFunc ? U.default.falseFunc : i === U.default.trueFunc ? Xa(e, n) : function(t) {
			let a = n.getSiblings(t), o = 0;
			for (let e = 0; e < a.length && !r(t, a[e]); e++) n.isTag(a[e]) && o++;
			return i(o) && e(t);
		};
	},
	"nth-last-child"(e, t, { adapter: n, equals: r }) {
		let i = Ya(t);
		return i === U.default.falseFunc ? U.default.falseFunc : i === U.default.trueFunc ? Xa(e, n) : function(t) {
			let a = n.getSiblings(t), o = 0;
			for (let e = a.length - 1; e >= 0 && !r(t, a[e]); e--) n.isTag(a[e]) && o++;
			return i(o) && e(t);
		};
	},
	"nth-of-type"(e, t, { adapter: n, equals: r }) {
		let i = Ya(t);
		return i === U.default.falseFunc ? U.default.falseFunc : i === U.default.trueFunc ? Xa(e, n) : function(t) {
			let a = n.getSiblings(t), o = 0;
			for (let e = 0; e < a.length; e++) {
				let i = a[e];
				if (r(t, i)) break;
				n.isTag(i) && n.getName(i) === n.getName(t) && o++;
			}
			return i(o) && e(t);
		};
	},
	"nth-last-of-type"(e, t, { adapter: n, equals: r }) {
		let i = Ya(t);
		return i === U.default.falseFunc ? U.default.falseFunc : i === U.default.trueFunc ? Xa(e, n) : function(t) {
			let a = n.getSiblings(t), o = 0;
			for (let e = a.length - 1; e >= 0; e--) {
				let i = a[e];
				if (r(t, i)) break;
				n.isTag(i) && n.getName(i) === n.getName(t) && o++;
			}
			return i(o) && e(t);
		};
	},
	root(e, t, { adapter: n }) {
		return (t) => {
			let r = n.getParent(t);
			return (r == null || !n.isTag(r)) && e(t);
		};
	},
	scope(e, t, n, r) {
		let { equals: i } = n;
		return !r || r.length === 0 ? Za.root(e, t, n) : r.length === 1 ? (t) => i(r[0], t) && e(t) : (t) => r.includes(t) && e(t);
	},
	hover: Qa("isHovered"),
	visited: Qa("isVisited"),
	active: Qa("isActive")
};
function Qa(e) {
	return function(t, n, { adapter: r }) {
		let i = r[e];
		return typeof i == "function" ? function(e) {
			return i(e) && t(e);
		} : U.default.falseFunc;
	};
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/pseudo-selectors/pseudos.js
var $a = {
	empty(e, { adapter: t }) {
		return !t.getChildren(e).some((e) => t.isTag(e) || t.getText(e) !== "");
	},
	"first-child"(e, { adapter: t, equals: n }) {
		if (t.prevElementSibling) return t.prevElementSibling(e) == null;
		let r = t.getSiblings(e).find((e) => t.isTag(e));
		return r != null && n(e, r);
	},
	"last-child"(e, { adapter: t, equals: n }) {
		let r = t.getSiblings(e);
		for (let i = r.length - 1; i >= 0; i--) {
			if (n(e, r[i])) return !0;
			if (t.isTag(r[i])) break;
		}
		return !1;
	},
	"first-of-type"(e, { adapter: t, equals: n }) {
		let r = t.getSiblings(e), i = t.getName(e);
		for (let a = 0; a < r.length; a++) {
			let o = r[a];
			if (n(e, o)) return !0;
			if (t.isTag(o) && t.getName(o) === i) break;
		}
		return !1;
	},
	"last-of-type"(e, { adapter: t, equals: n }) {
		let r = t.getSiblings(e), i = t.getName(e);
		for (let a = r.length - 1; a >= 0; a--) {
			let o = r[a];
			if (n(e, o)) return !0;
			if (t.isTag(o) && t.getName(o) === i) break;
		}
		return !1;
	},
	"only-of-type"(e, { adapter: t, equals: n }) {
		let r = t.getName(e);
		return t.getSiblings(e).every((i) => n(e, i) || !t.isTag(i) || t.getName(i) !== r);
	},
	"only-child"(e, { adapter: t, equals: n }) {
		return t.getSiblings(e).every((r) => n(e, r) || !t.isTag(r));
	}
};
function eo(e, t, n, r) {
	if (n === null) {
		if (e.length > r) throw Error(`Pseudo-class :${t} requires an argument`);
	} else if (e.length === r) throw Error(`Pseudo-class :${t} doesn't have any arguments`);
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/pseudo-selectors/aliases.js
var to = {
	"any-link": ":is(a, area, link)[href]",
	link: ":any-link:not(:visited)",
	disabled: ":is(\n        :is(button, input, select, textarea, optgroup, option)[disabled],\n        optgroup[disabled] > option,\n        fieldset[disabled]:not(fieldset[disabled] legend:first-of-type *)\n    )",
	enabled: ":not(:disabled)",
	checked: ":is(:is(input[type=radio], input[type=checkbox])[checked], option:selected)",
	required: ":is(input, select, textarea)[required]",
	optional: ":is(input, select, textarea):not([required])",
	selected: "option:is([selected], select:not([multiple]):not(:has(> option[selected])) > :first-of-type)",
	checkbox: "[type=checkbox]",
	file: "[type=file]",
	password: "[type=password]",
	radio: "[type=radio]",
	reset: "[type=reset]",
	image: "[type=image]",
	submit: "[type=submit]",
	parent: ":not(:empty)",
	header: ":is(h1, h2, h3, h4, h5, h6)",
	button: ":is(button, input[type=button])",
	input: ":is(input, textarea, select, button)",
	text: "input:is(:not([type!='']), [type=text])"
}, no = {};
function ro(e, t) {
	return e === U.default.falseFunc ? U.default.falseFunc : (n) => t.isTag(n) && e(n);
}
function io(e, t) {
	let n = t.getSiblings(e);
	if (n.length <= 1) return [];
	let r = n.indexOf(e);
	return r < 0 || r === n.length - 1 ? [] : n.slice(r + 1).filter(t.isTag);
}
function ao(e) {
	return {
		xmlMode: !!e.xmlMode,
		lowerCaseAttributeNames: !!e.lowerCaseAttributeNames,
		lowerCaseTags: !!e.lowerCaseTags,
		quirksMode: !!e.quirksMode,
		cacheResults: !!e.cacheResults,
		pseudos: e.pseudos,
		adapter: e.adapter,
		equals: e.equals
	};
}
var oo = (e, t, n, r, i) => {
	let a = i(t, ao(n), r);
	return a === U.default.trueFunc ? e : a === U.default.falseFunc ? U.default.falseFunc : (t) => a(t) && e(t);
}, so = {
	is: oo,
	matches: oo,
	where: oo,
	not(e, t, n, r, i) {
		let a = i(t, ao(n), r);
		return a === U.default.falseFunc ? e : a === U.default.trueFunc ? U.default.falseFunc : (t) => !a(t) && e(t);
	},
	has(e, t, n, r, i) {
		let { adapter: a } = n, o = ao(n);
		o.relativeSelector = !0;
		let s = t.some((e) => e.some(Fa)) ? [no] : void 0, c = i(t, o, s);
		if (c === U.default.falseFunc) return U.default.falseFunc;
		let l = ro(c, a);
		if (s && c !== U.default.trueFunc) {
			let { shouldTestNextSiblings: t = !1 } = c;
			return (n) => {
				if (!e(n)) return !1;
				s[0] = n;
				let r = a.getChildren(n), i = t ? [...r, ...io(n, a)] : r;
				return a.existsOne(l, i);
			};
		}
		return (t) => e(t) && a.existsOne(l, a.getChildren(t));
	}
};
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/pseudo-selectors/index.js
function co(e, t, n, r, i) {
	let { name: a, data: o } = t;
	if (Array.isArray(o)) {
		if (!(a in so)) throw Error(`Unknown pseudo-class :${a}(${o})`);
		return so[a](e, o, n, r, i);
	}
	let s = n.pseudos?.[a], c = typeof s == "string" ? s : to[a];
	if (typeof c == "string") {
		if (o != null) throw Error(`Pseudo ${a} doesn't have any arguments`);
		let t = Ma(c);
		return so.is(e, t, n, r, i);
	}
	if (typeof s == "function") return eo(s, a, o, 1), (t) => s(t, o) && e(t);
	if (a in Za) return Za[a](e, o, n, r);
	if (a in $a) {
		let t = $a[a];
		return eo(t, a, o, 2), (r) => t(r, n, o) && e(r);
	}
	throw Error(`Unknown pseudo-class :${a}`);
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/general.js
function lo(e, t) {
	let n = t.getParent(e);
	return n && t.isTag(n) ? n : null;
}
function uo(e, t, n, r, i) {
	let { adapter: a, equals: o } = n;
	switch (t.type) {
		case V.PseudoElement: throw Error("Pseudo-elements are not supported by css-select");
		case V.ColumnCombinator: throw Error("Column combinators are not yet supported by css-select");
		case V.Attribute:
			if (t.namespace != null) throw Error("Namespaced attributes are not yet supported by css-select");
			return (!n.xmlMode || n.lowerCaseAttributeNames) && (t.name = t.name.toLowerCase()), Ua[t.action](e, t, n);
		case V.Pseudo: return co(e, t, n, r, i);
		case V.Tag: {
			if (t.namespace != null) throw Error("Namespaced tag names are not yet supported by css-select");
			let { name: r } = t;
			return (!n.xmlMode || n.lowerCaseTags) && (r = r.toLowerCase()), function(t) {
				return a.getName(t) === r && e(t);
			};
		}
		case V.Descendant: {
			if (n.cacheResults === !1 || typeof WeakSet > "u") return function(t) {
				let n = t;
				for (; n = lo(n, a);) if (e(n)) return !0;
				return !1;
			};
			let t = /* @__PURE__ */ new WeakSet();
			return function(n) {
				let r = n;
				for (; r = lo(r, a);) if (!t.has(r)) {
					if (a.isTag(r) && e(r)) return !0;
					t.add(r);
				}
				return !1;
			};
		}
		case "_flexibleDescendant": return function(t) {
			let n = t;
			do
				if (e(n)) return !0;
			while (n = lo(n, a));
			return !1;
		};
		case V.Parent: return function(t) {
			return a.getChildren(t).some((t) => a.isTag(t) && e(t));
		};
		case V.Child: return function(t) {
			let n = a.getParent(t);
			return n != null && a.isTag(n) && e(n);
		};
		case V.Sibling: return function(t) {
			let n = a.getSiblings(t);
			for (let r = 0; r < n.length; r++) {
				let i = n[r];
				if (o(t, i)) break;
				if (a.isTag(i) && e(i)) return !0;
			}
			return !1;
		};
		case V.Adjacent: return a.prevElementSibling ? function(t) {
			let n = a.prevElementSibling(t);
			return n != null && e(n);
		} : function(t) {
			let n = a.getSiblings(t), r;
			for (let e = 0; e < n.length; e++) {
				let i = n[e];
				if (o(t, i)) break;
				a.isTag(i) && (r = i);
			}
			return !!r && e(r);
		};
		case V.Universal:
			if (t.namespace != null && t.namespace !== "*") throw Error("Namespaced universal selectors are not yet supported by css-select");
			return e;
	}
}
function fo(e) {
	return e.type === V.Pseudo && (e.name === "scope" || Array.isArray(e.data) && e.data.some((e) => e.some(fo)));
}
var po = { type: V.Descendant }, mo = { type: "_flexibleDescendant" }, ho = {
	type: V.Pseudo,
	name: "scope",
	data: null
};
function go(e, { adapter: t }, n) {
	let r = !!n?.every((e) => {
		let n = t.isTag(e) && t.getParent(e);
		return e === no || n && t.isTag(n);
	});
	for (let t of e) {
		if (!(t.length > 0 && Fa(t[0]) && t[0].type !== V.Descendant)) {
			if (r && !t.some(fo)) t.unshift(po);
			else continue;
		}
		t.unshift(ho);
	}
}
function _o(e, t, n) {
	e.forEach(La), n = t.context ?? n;
	let r = Array.isArray(n), i = n && (Array.isArray(n) ? n : [n]);
	if (t.relativeSelector !== !1) go(e, t, i);
	else if (e.some((e) => e.length > 0 && Fa(e[0]))) throw Error("Relative selectors are not allowed when the `relativeSelector` option is disabled");
	let a = !1, o = e.map((e) => {
		if (e.length >= 2) {
			let [t, n] = e;
			t.type !== V.Pseudo || t.name !== "scope" || (r && n.type === V.Descendant ? e[1] = mo : (n.type === V.Adjacent || n.type === V.Sibling) && (a = !0));
		}
		return vo(e, t, i);
	}).reduce(yo, U.default.falseFunc);
	return o.shouldTestNextSiblings = a, o;
}
function vo(e, t, n) {
	return e.reduce((e, r) => e === U.default.falseFunc ? U.default.falseFunc : uo(e, r, t, n, _o), t.rootFunc ?? U.default.trueFunc);
}
function yo(e, t) {
	return t === U.default.falseFunc || e === U.default.trueFunc ? e : e === U.default.falseFunc || t === U.default.trueFunc ? t : function(n) {
		return e(n) || t(n);
	};
}
//#endregion
//#region node_modules/.pnpm/css-select@5.2.2/node_modules/css-select/lib/esm/index.js
var bo = (e, t) => e === t, xo = {
	adapter: $r,
	equals: bo
};
function So(e) {
	let t = e ?? xo;
	return t.adapter ??= $r, t.equals ??= t.adapter?.equals ?? bo, t;
}
function Co(e) {
	return function(t, n, r) {
		return e(t, So(n), r);
	};
}
var wo = Co(_o);
function To(e, t, n = !1) {
	return n && (e = Eo(e, t)), Array.isArray(e) ? t.removeSubsets(e) : t.getChildren(e);
}
function Eo(e, t) {
	let n = Array.isArray(e) ? e.slice(0) : [e], r = n.length;
	for (let e = 0; e < r; e++) {
		let r = io(n[e], t);
		n.push(...r);
	}
	return n;
}
//#endregion
//#region node_modules/.pnpm/cheerio-select@2.1.0/node_modules/cheerio-select/lib/esm/positionals.js
var Do = /* @__PURE__ */ new Set([
	"first",
	"last",
	"eq",
	"gt",
	"nth",
	"lt",
	"even",
	"odd"
]);
function Oo(e) {
	return e.type === "pseudo" ? Do.has(e.name) ? !0 : e.name === "not" && Array.isArray(e.data) ? e.data.some((e) => e.some(Oo)) : !1 : !1;
}
function ko(e, t, n) {
	let r = t == null ? NaN : parseInt(t, 10);
	switch (e) {
		case "first": return 1;
		case "nth":
		case "eq": return isFinite(r) ? r >= 0 ? r + 1 : Infinity : 0;
		case "lt": return isFinite(r) ? r >= 0 ? Math.min(r, n) : Infinity : 0;
		case "gt": return isFinite(r) ? Infinity : 0;
		case "odd": return 2 * n;
		case "even": return 2 * n - 1;
		case "last":
		case "not": return Infinity;
	}
}
//#endregion
//#region node_modules/.pnpm/cheerio-select@2.1.0/node_modules/cheerio-select/lib/esm/helpers.js
function Ao(e) {
	for (; e.parent;) e = e.parent;
	return e;
}
function jo(e) {
	let t = [], n = [];
	for (let r of e) r.some(Oo) ? t.push(r) : n.push(r);
	return [n, t];
}
//#endregion
//#region node_modules/.pnpm/cheerio-select@2.1.0/node_modules/cheerio-select/lib/esm/index.js
var Mo = {
	type: V.Universal,
	namespace: null
}, No = {
	type: V.Pseudo,
	name: "scope",
	data: null
};
function Po(e, t, n = {}) {
	return Fo([e], t, n);
}
function Fo(e, t, n = {}) {
	if (typeof t == "function") return e.some(t);
	let [r, i] = jo(Ma(t));
	return r.length > 0 && e.some(wo(r, n)) || i.some((t) => zo(t, e, n).length > 0);
}
function Io(e, t, n, r) {
	let i = typeof n == "string" ? parseInt(n, 10) : NaN;
	switch (e) {
		case "first":
		case "lt": return t;
		case "last": return t.length > 0 ? [t[t.length - 1]] : t;
		case "nth":
		case "eq": return isFinite(i) && Math.abs(i) < t.length ? [i < 0 ? t[t.length + i] : t[i]] : [];
		case "gt": return isFinite(i) ? t.slice(i + 1) : [];
		case "even": return t.filter((e, t) => t % 2 == 0);
		case "odd": return t.filter((e, t) => t % 2 == 1);
		case "not": {
			let e = new Set(Ro(n, t, r));
			return t.filter((t) => !e.has(t));
		}
	}
}
function Lo(e, t, n = {}) {
	return Ro(Ma(e), t, n);
}
function Ro(e, t, n) {
	if (t.length === 0) return [];
	let [r, i] = jo(e), a;
	if (r.length) {
		let e = Wo(t, r, n);
		if (i.length === 0) return e;
		e.length && (a = new Set(e));
	}
	for (let e = 0; e < i.length && a?.size !== t.length; e++) {
		let r = i[e];
		if ((a ? t.filter((e) => N(e) && !a.has(e)) : t).length === 0) break;
		let o = zo(r, t, n);
		if (o.length) {
			if (a) o.forEach((e) => a.add(e));
			else {
				if (e === i.length - 1) return o;
				a = new Set(o);
			}
		}
	}
	return a === void 0 ? [] : a.size === t.length ? t : t.filter((e) => a.has(e));
}
function zo(e, t, n) {
	if (e.some(Ea)) {
		let r = n.root ?? Ao(t[0]), i = {
			...n,
			context: t,
			relativeSelector: !1
		};
		return e.push(No), Vo(r, e, i, !0, t.length);
	}
	return Vo(t, e, n, !1, t.length);
}
function Bo(e, t, n = {}, r = Infinity) {
	if (typeof e == "function") return Uo(t, e);
	let [i, a] = jo(Ma(e)), o = a.map((e) => Vo(t, e, n, !0, r));
	return i.length && o.push(Ho(t, i, n, r)), o.length === 0 ? [] : o.length === 1 ? o[0] : Hr(o.reduce((e, t) => [...e, ...t]));
}
function Vo(e, t, n, r, i) {
	let a = t.findIndex(Oo), o = t.slice(0, a), s = t[a], c = t.length - 1 === a ? i : Infinity, l = ko(s.name, s.data, c);
	if (l === 0) return [];
	let u = (o.length === 0 && !Array.isArray(e) ? lr(e).filter(N) : o.length === 0 ? (Array.isArray(e) ? e : [e]).filter(N) : r || o.some(Ea) ? Ho(e, [o], n, l) : Wo(e, [o], n)).slice(0, l), d = Io(s.name, u, s.data, n);
	if (d.length === 0 || t.length === a + 1) return d;
	let f = t.slice(a + 1), p = f.some(Ea);
	if (p) {
		if (Ea(f[0])) {
			let { type: e } = f[0];
			(e === V.Sibling || e === V.Adjacent) && (d = To(d, $r, !0)), f.unshift(Mo);
		}
		n = {
			...n,
			relativeSelector: !1,
			rootFunc: (e) => d.includes(e)
		};
	} else n.rootFunc && n.rootFunc !== U.trueFunc && (n = {
		...n,
		rootFunc: U.trueFunc
	});
	return f.some(Oo) ? Vo(d, f, n, !1, i) : p ? Ho(d, [f], n, i) : Wo(d, [f], n);
}
function Ho(e, t, n, r) {
	return Uo(e, wo(t, n, e), r);
}
function Uo(e, t, n = Infinity) {
	return wr((e) => N(e) && t(e), To(e, $r, t.shouldTestNextSiblings), !0, n);
}
function Wo(e, t, n) {
	let r = (Array.isArray(e) ? e : [e]).filter(N);
	if (r.length === 0) return r;
	let i = wo(t, n);
	return i === U.trueFunc ? r : r.filter(i);
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/api/traversing.js
var Go = /* @__PURE__ */ m({
	_findBySelector: () => Jo,
	add: () => ks,
	addBack: () => As,
	children: () => ds,
	closest: () => rs,
	contents: () => fs,
	each: () => ps,
	end: () => Os,
	eq: () => Cs,
	filter: () => gs,
	filterArray: () => _s,
	find: () => qo,
	first: () => xs,
	get: () => ws,
	has: () => bs,
	index: () => Es,
	is: () => vs,
	last: () => Ss,
	map: () => ms,
	next: () => is,
	nextAll: () => as,
	nextUntil: () => os,
	not: () => ys,
	parent: () => es,
	parents: () => ts,
	parentsUntil: () => ns,
	prev: () => ss,
	prevAll: () => cs,
	prevUntil: () => ls,
	siblings: () => us,
	slice: () => Ds,
	toArray: () => Ts
}), Ko = /^\s*(?:[+~]|:scope\b)/;
function qo(e) {
	if (!e) return this._make([]);
	if (typeof e != "string") {
		let t = mi(e) ? e.toArray() : [e], n = this.toArray();
		return this._make(t.filter((e) => n.some((t) => ui(t, e))));
	}
	return this._findBySelector(e, Infinity);
}
function Jo(e, t) {
	let n = this.toArray(), r = Ko.test(e) ? n : this.children().toArray(), i = {
		context: n,
		root: this._root?.[0],
		xmlMode: this.options.xmlMode,
		lowerCaseTags: this.options.lowerCaseTags,
		lowerCaseAttributeNames: this.options.lowerCaseAttributeNames,
		pseudos: this.options.pseudos,
		quirksMode: this.options.quirksMode
	};
	return this._make(Bo(e, r, i, t));
}
function Yo(e) {
	return function(t, ...n) {
		return function(r) {
			let i = e(t, this);
			return r && (i = _s(i, r, this.options.xmlMode, this._root?.[0])), this._make(this.length > 1 && i.length > 1 ? n.reduce((e, t) => t(e), i) : i);
		};
	};
}
var Xo = Yo((e, t) => {
	let n = [];
	for (let r = 0; r < t.length; r++) {
		let i = e(t[r]);
		i.length > 0 && (n = n.concat(i));
	}
	return n;
}), Zo = Yo((e, t) => {
	let n = [];
	for (let r = 0; r < t.length; r++) {
		let i = e(t[r]);
		i !== null && n.push(i);
	}
	return n;
});
function Qo(e, ...t) {
	let n = null, r = Yo((e, t) => {
		let r = [];
		return F(t, (t) => {
			for (let i; (i = e(t)) && !n?.(i, r.length); t = i) r.push(i);
		}), r;
	})(e, ...t);
	return function(e, t) {
		n = typeof e == "string" ? (t) => Po(t, e, this.options) : e ? hs(e) : null;
		let i = r.call(this, t);
		return n = null, i;
	};
}
function $o(e) {
	return e.length > 1 ? Array.from(new Set(e)) : e;
}
var es = Zo(({ parent: e }) => e && !jn(e) ? e : null, $o), ts = Xo((e) => {
	let t = [];
	for (; e.parent && !jn(e.parent);) t.push(e.parent), e = e.parent;
	return t;
}, Hr, (e) => e.reverse()), ns = Qo(({ parent: e }) => e && !jn(e) ? e : null, Hr, (e) => e.reverse());
function rs(e) {
	let t = [];
	if (!e) return this._make(t);
	let n = {
		xmlMode: this.options.xmlMode,
		root: this._root?.[0]
	}, r = typeof e == "string" ? (t) => Po(t, e, n) : hs(e);
	return F(this, (e) => {
		for (e && !jn(e) && !N(e) && (e = e.parent); e && N(e);) {
			if (r(e, 0)) {
				t.includes(e) || t.push(e);
				break;
			}
			e = e.parent;
		}
	}), this._make(t);
}
var is = Zo((e) => hr(e)), as = Xo((e) => {
	let t = [];
	for (; e.next;) e = e.next, N(e) && t.push(e);
	return t;
}, $o), os = Qo((e) => hr(e), $o), ss = Zo((e) => gr(e)), cs = Xo((e) => {
	let t = [];
	for (; e.prev;) e = e.prev, N(e) && t.push(e);
	return t;
}, $o), ls = Qo((e) => gr(e), $o), us = Xo((e) => dr(e).filter((t) => N(t) && t !== e), Hr), ds = Xo((e) => lr(e).filter(N), $o);
function fs() {
	let e = this.toArray().reduce((e, t) => P(t) ? e.concat(t.children) : e, []);
	return this._make(e);
}
function ps(e) {
	let t = 0, n = this.length;
	for (; t < n && e.call(this[t], t, this[t]) !== !1;) ++t;
	return this;
}
function ms(e) {
	let t = [];
	for (let n = 0; n < this.length; n++) {
		let r = this[n], i = e.call(r, n, r);
		i != null && (t = t.concat(i));
	}
	return this._make(t);
}
function hs(e) {
	return typeof e == "function" ? (t, n) => e.call(t, n, t) : mi(e) ? (t) => Array.prototype.includes.call(e, t) : function(t) {
		return e === t;
	};
}
function gs(e) {
	return this._make(_s(this.toArray(), e, this.options.xmlMode, this._root?.[0]));
}
function _s(e, t, n, r) {
	return typeof t == "string" ? Lo(t, e, {
		xmlMode: n,
		root: r
	}) : e.filter(hs(t));
}
function vs(e) {
	let t = this.toArray();
	return typeof e == "string" ? Fo(t.filter(N), e, this.options) : e ? t.some(hs(e)) : !1;
}
function ys(e) {
	let t = this.toArray();
	if (typeof e == "string") {
		let n = new Set(Lo(e, t, this.options));
		t = t.filter((e) => !n.has(e));
	} else {
		let n = hs(e);
		t = t.filter((e, t) => !n(e, t));
	}
	return this._make(t);
}
function bs(e) {
	return this.filter(typeof e == "string" ? `:has(${e})` : (t, n) => this._make(n).find(e).length > 0);
}
function xs() {
	return this.length > 1 ? this._make(this[0]) : this;
}
function Ss() {
	return this.length > 0 ? this._make(this[this.length - 1]) : this;
}
function Cs(e) {
	return e = +e, e === 0 && this.length <= 1 ? this : (e < 0 && (e = this.length + e), this._make(this[e] ?? []));
}
function ws(e) {
	return e == null ? this.toArray() : this[e < 0 ? this.length + e : e];
}
function Ts() {
	return Array.prototype.slice.call(this);
}
function Es(e) {
	let t, n;
	return e == null ? (t = this.parent().children(), n = this[0]) : typeof e == "string" ? (t = this._make(e), n = this[0]) : (t = this, n = mi(e) ? e[0] : e), Array.prototype.indexOf.call(t, n);
}
function Ds(e, t) {
	return this._make(Array.prototype.slice.call(this, e, t));
}
function Os() {
	return this.prevObject ?? this._make([]);
}
function ks(e, t) {
	let n = this._make(e, t), r = Hr([...this.get(), ...n.get()]);
	return this._make(r);
}
function As(e) {
	return this.prevObject ? this.add(e ? this.prevObject.filter(e) : this.prevObject) : this;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/parse.js
function js(e) {
	return function(t, n, r, i) {
		if (typeof Buffer < "u" && Buffer.isBuffer(t) && (t = t.toString()), typeof t == "string") return e(t, n, r, i);
		let a = t;
		if (!Array.isArray(a) && jn(a)) return a;
		let o = new Tn([]);
		return Ms(a, o), o;
	};
}
function Ms(e, t) {
	let n = Array.isArray(e) ? e : [e];
	t ? t.children = n : t = null;
	for (let e = 0; e < n.length; e++) {
		let r = n[e];
		r.parent && r.parent.children !== n && _r(r), t ? (r.prev = n[e - 1] || null, r.next = n[e + 1] || null) : r.prev = r.next = null, r.parent = t;
	}
	return t;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/api/manipulation.js
var Ns = /* @__PURE__ */ m({
	_makeDomArray: () => Ps,
	after: () => Ks,
	append: () => zs,
	appendTo: () => Ls,
	before: () => Js,
	clone: () => nc,
	empty: () => Qs,
	html: () => $s,
	insertAfter: () => qs,
	insertBefore: () => Ys,
	prepend: () => Bs,
	prependTo: () => Rs,
	remove: () => Xs,
	replaceWith: () => Zs,
	text: () => tc,
	toString: () => ec,
	unwrap: () => Ws,
	wrap: () => Hs,
	wrapAll: () => Gs,
	wrapInner: () => Us
});
function Ps(e, t) {
	if (e == null) return [];
	if (typeof e == "string") return this._parse(e, this.options, !1, null).children.slice(0);
	if ("length" in e) {
		if (e.length === 1) return this._makeDomArray(e[0], t);
		let n = [];
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (typeof i == "object") {
				if (i == null) continue;
				if (!("length" in i)) {
					n.push(t ? Mn(i, !0) : i);
					continue;
				}
			}
			n.push(...this._makeDomArray(i, t));
		}
		return n;
	}
	return [t ? Mn(e, !0) : e];
}
function Fs(e) {
	return function(...t) {
		let n = this.length - 1;
		return F(this, (r, i) => {
			if (!P(r)) return;
			let a = typeof t[0] == "function" ? t[0].call(r, i, this._render(r.children)) : t;
			e(this._makeDomArray(a, i < n), r.children, r);
		});
	};
}
function Is(e, t, n, r, i) {
	let a = [
		t,
		n,
		...r
	], o = t === 0 ? null : e[t - 1], s = t + n >= e.length ? null : e[t + n];
	for (let e = 0; e < r.length; ++e) {
		let n = r[e], c = n.parent;
		if (c) {
			let e = c.children.indexOf(n);
			e !== -1 && (c.children.splice(e, 1), i === c && t > e && a[0]--);
		}
		n.parent = i, n.prev && (n.prev.next = n.next ?? null), n.next && (n.next.prev = n.prev ?? null), n.prev = e === 0 ? o : r[e - 1], n.next = e === r.length - 1 ? s : r[e + 1];
	}
	return o && (o.next = r[0]), s && (s.prev = r[r.length - 1]), e.splice(...a);
}
function Ls(e) {
	return (mi(e) ? e : this._make(e)).append(this), this;
}
function Rs(e) {
	return (mi(e) ? e : this._make(e)).prepend(this), this;
}
var zs = Fs((e, t, n) => {
	Is(t, t.length, 0, e, n);
}), Bs = Fs((e, t, n) => {
	Is(t, 0, 0, e, n);
});
function Vs(e) {
	return function(t) {
		let n = this.length - 1, r = this.parents().last();
		for (let i = 0; i < this.length; i++) {
			let a = this[i], o = typeof t == "function" ? t.call(a, i, a) : typeof t == "string" && !vi(t) ? r.find(t).clone() : t, [s] = this._makeDomArray(o, i < n);
			if (!s || !P(s)) continue;
			let c = s, l = 0;
			for (; l < c.children.length;) {
				let e = c.children[l];
				N(e) ? (c = e, l = 0) : l++;
			}
			e(a, c, [s]);
		}
		return this;
	};
}
var Hs = Vs((e, t, n) => {
	let { parent: r } = e;
	if (!r) return;
	let i = r.children, a = i.indexOf(e);
	Ms([e], t), Is(i, a, 0, n, r);
}), Us = Vs((e, t, n) => {
	P(e) && (Ms(e.children, t), Ms(n, e));
});
function Ws(e) {
	return this.parent(e).not("body").each((e, t) => {
		this._make(t).replaceWith(t.children);
	}), this;
}
function Gs(e) {
	let t = this[0];
	if (t) {
		let n = this._make(typeof e == "function" ? e.call(t, 0, t) : e).insertBefore(t), r;
		for (let e = 0; e < n.length; e++) n[e].type === hn && (r = n[e]);
		let i = 0;
		for (; r && i < r.children.length;) {
			let e = r.children[i];
			e.type === hn ? (r = e, i = 0) : i++;
		}
		r && this._make(r).append(this);
	}
	return this;
}
function Ks(...e) {
	let t = this.length - 1;
	return F(this, (n, r) => {
		if (!P(n) || !n.parent) return;
		let i = n.parent.children, a = i.indexOf(n);
		/* istanbul ignore next */
		if (a === -1) return;
		let o = typeof e[0] == "function" ? e[0].call(n, r, this._render(n.children)) : e, s = this._makeDomArray(o, r < t);
		Is(i, a + 1, 0, s, n.parent);
	});
}
function qs(e) {
	typeof e == "string" && (e = this._make(e)), this.remove();
	let t = [];
	for (let n of this._makeDomArray(e)) {
		let e = this.clone().toArray(), { parent: r } = n;
		if (!r) continue;
		let i = r.children, a = i.indexOf(n);
		a !== -1 && (Is(i, a + 1, 0, e, r), t.push(...e));
	}
	return this._make(t);
}
function Js(...e) {
	let t = this.length - 1;
	return F(this, (n, r) => {
		if (!P(n) || !n.parent) return;
		let i = n.parent.children, a = i.indexOf(n);
		/* istanbul ignore next */
		if (a === -1) return;
		let o = typeof e[0] == "function" ? e[0].call(n, r, this._render(n.children)) : e;
		Is(i, a, 0, this._makeDomArray(o, r < t), n.parent);
	});
}
function Ys(e) {
	let t = this._make(e);
	this.remove();
	let n = [];
	return F(t, (e) => {
		let t = this.clone().toArray(), { parent: r } = e;
		if (!r) return;
		let i = r.children, a = i.indexOf(e);
		a !== -1 && (Is(i, a, 0, t, r), n.push(...t));
	}), this._make(n);
}
function Xs(e) {
	return F(e ? this.filter(e) : this, (e) => {
		_r(e), e.prev = e.next = e.parent = null;
	}), this;
}
function Zs(e) {
	return F(this, (t, n) => {
		let { parent: r } = t;
		if (!r) return;
		let i = r.children, a = typeof e == "function" ? e.call(t, n, t) : e, o = this._makeDomArray(a);
		Ms(o, null), Is(i, i.indexOf(t), 1, o, r), o.includes(t) || (t.parent = t.prev = t.next = null);
	});
}
function Qs() {
	return F(this, (e) => {
		if (P(e)) {
			for (let t of e.children) t.next = t.prev = t.parent = null;
			e.children.length = 0;
		}
	});
}
function $s(e) {
	if (e === void 0) {
		let e = this[0];
		return !e || !P(e) ? null : this._render(e.children);
	}
	return F(this, (t) => {
		if (P(t)) {
			for (let e of t.children) e.next = e.prev = e.parent = null;
			Ms(mi(e) ? e.toArray() : this._parse(`${e}`, this.options, !1, t).children, t);
		}
	});
}
function ec() {
	return this._render(this);
}
function tc(e) {
	return e === void 0 ? si(this) : typeof e == "function" ? F(this, (t, n) => this._make(t).text(e.call(t, n, si([t])))) : F(this, (t) => {
		if (P(t)) {
			for (let e of t.children) e.next = e.prev = e.parent = null;
			Ms(new bn(`${e}`), t);
		}
	});
}
function nc() {
	let e = Array.prototype.map.call(this.get(), (e) => Mn(e, !0)), t = new Tn(e);
	for (let n of e) n.parent = t;
	return this._make(e);
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/api/css.js
var rc = /* @__PURE__ */ m({ css: () => ic });
function ic(e, t) {
	if (e != null && t != null || typeof e == "object" && !Array.isArray(e)) return F(this, (n, r) => {
		N(n) && ac(n, e, t, r);
	});
	if (this.length !== 0) return oc(this[0], e);
}
function ac(e, t, n, r) {
	if (typeof t == "string") {
		let i = oc(e), a = typeof n == "function" ? n.call(e, r, i[t]) : n;
		a === "" ? delete i[t] : a != null && (i[t] = a), e.attribs.style = sc(i);
	} else if (typeof t == "object") {
		let n = Object.keys(t);
		for (let r = 0; r < n.length; r++) {
			let i = n[r];
			ac(e, i, t[i], r);
		}
	}
}
function oc(e, t) {
	if (!e || !N(e)) return;
	let n = cc(e.attribs.style);
	if (typeof t == "string") return n[t];
	if (Array.isArray(t)) {
		let e = {};
		for (let r of t) n[r] != null && (e[r] = n[r]);
		return e;
	}
	return n;
}
function sc(e) {
	return Object.keys(e).reduce((t, n) => `${t}${t ? " " : ""}${n}: ${e[n]};`, "");
}
function cc(e) {
	if (e = (e || "").trim(), !e) return {};
	let t = {}, n;
	for (let r of e.split(";")) {
		let e = r.indexOf(":");
		if (e < 1 || e === r.length - 1) {
			let e = r.trimEnd();
			e.length > 0 && n !== void 0 && (t[n] += `;${e}`);
		} else n = r.slice(0, e).trim(), t[n] = r.slice(e + 1).trim();
	}
	return t;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/api/forms.js
var lc = /* @__PURE__ */ m({
	serialize: () => pc,
	serializeArray: () => mc
}), uc = "input,select,textarea,keygen", dc = /%20/g, fc = /\r?\n/g;
function pc() {
	return this.serializeArray().map((e) => `${encodeURIComponent(e.name)}=${encodeURIComponent(e.value)}`).join("&").replace(dc, "+");
}
function mc() {
	return this.map((e, t) => {
		let n = this._make(t);
		return N(t) && t.name === "form" ? n.find(uc).toArray() : n.filter(uc).toArray();
	}).filter("[name!=\"\"]:enabled:not(:submit, :button, :image, :reset, :file):matches([checked], :not(:checkbox, :radio))").map((e, t) => {
		let n = this._make(t), r = n.attr("name"), i = n.val() ?? "";
		return Array.isArray(i) ? i.map((e) => ({
			name: r,
			value: e.replace(fc, "\r\n")
		})) : {
			name: r,
			value: i.replace(fc, "\r\n")
		};
	}).toArray();
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/api/extract.js
var hc = /* @__PURE__ */ m({ extract: () => _c });
function gc(e) {
	return typeof e == "string" ? {
		selector: e,
		value: "textContent"
	} : {
		selector: e.selector,
		value: e.value ?? "textContent"
	};
}
function _c(e) {
	let t = {};
	for (let n in e) {
		let r = e[n], i = Array.isArray(r), { selector: a, value: o } = gc(i ? r[0] : r), s = typeof o == "function" ? o : typeof o == "string" ? (e) => this._make(e).prop(o) : (e) => this._make(e).extract(o);
		if (i) t[n] = this._findBySelector(a, Infinity).map((e, r) => s(r, n, t)).get();
		else {
			let e = this._findBySelector(a, 1);
			t[n] = e.length > 0 ? s(e[0], n, t) : void 0;
		}
	}
	return t;
}
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/cheerio.js
var vc = class {
	constructor(e, t, n) {
		if (this.length = 0, this.options = n, this._root = t, e) {
			for (let t = 0; t < e.length; t++) this[t] = e[t];
			this.length = e.length;
		}
	}
};
vc.prototype.cheerio = "[cheerio object]", vc.prototype.splice = Array.prototype.splice, vc.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator], Object.assign(vc.prototype, Zi, Go, Ns, rc, lc, hc);
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/load.js
function yc(e, t) {
	return function n(r, i, a = !0) {
		if (r == null) throw Error("cheerio.load() expects a string");
		let o = ti(i), s = e(r, o, a, null);
		class c extends vc {
			_make(e, t) {
				let n = l(e, t);
				return n.prevObject = this, n;
			}
			_parse(t, n, r, i) {
				return e(t, n, r, i);
			}
			_render(e) {
				return t(e, this.options);
			}
		}
		function l(t, n, r = s, i) {
			if (t && mi(t)) return t;
			let a = ti(i, o), l = typeof r == "string" ? [e(r, a, !1, null)] : "length" in r ? r : [r], u = mi(l) ? l : new c(l, null, a);
			if (u._root = u, !t) return new c(void 0, u, a);
			let d = typeof t == "string" && vi(t) ? e(t, a, !1, null).children : bc(t) ? [t] : Array.isArray(t) ? t : void 0, f = new c(d, u, a);
			if (d) return f;
			if (typeof t != "string") throw TypeError("Unexpected type of selector");
			let p = t, m = n ? typeof n == "string" ? vi(n) ? new c([e(n, a, !1, null)], u, a) : (p = `${n} ${p}`, u) : mi(n) ? n : new c(Array.isArray(n) ? n : [n], u, a) : u;
			return m ? m.find(p) : f;
		}
		return Object.assign(l, ni, {
			load: n,
			_root: s,
			_options: o,
			fn: c.prototype,
			prototype: c.prototype
		}), l;
	};
}
function bc(e) {
	return !!e.name || e.type === ln || e.type === un || e.type === fn;
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/common/unicode.js
var xc = /* @__PURE__ */ new Set([
	65534,
	65535,
	131070,
	131071,
	196606,
	196607,
	262142,
	262143,
	327678,
	327679,
	393214,
	393215,
	458750,
	458751,
	524286,
	524287,
	589822,
	589823,
	655358,
	655359,
	720894,
	720895,
	786430,
	786431,
	851966,
	851967,
	917502,
	917503,
	983038,
	983039,
	1048574,
	1048575,
	1114110,
	1114111
]), W;
(function(e) {
	e[e.EOF = -1] = "EOF", e[e.NULL = 0] = "NULL", e[e.TABULATION = 9] = "TABULATION", e[e.CARRIAGE_RETURN = 13] = "CARRIAGE_RETURN", e[e.LINE_FEED = 10] = "LINE_FEED", e[e.FORM_FEED = 12] = "FORM_FEED", e[e.SPACE = 32] = "SPACE", e[e.EXCLAMATION_MARK = 33] = "EXCLAMATION_MARK", e[e.QUOTATION_MARK = 34] = "QUOTATION_MARK", e[e.AMPERSAND = 38] = "AMPERSAND", e[e.APOSTROPHE = 39] = "APOSTROPHE", e[e.HYPHEN_MINUS = 45] = "HYPHEN_MINUS", e[e.SOLIDUS = 47] = "SOLIDUS", e[e.DIGIT_0 = 48] = "DIGIT_0", e[e.DIGIT_9 = 57] = "DIGIT_9", e[e.SEMICOLON = 59] = "SEMICOLON", e[e.LESS_THAN_SIGN = 60] = "LESS_THAN_SIGN", e[e.EQUALS_SIGN = 61] = "EQUALS_SIGN", e[e.GREATER_THAN_SIGN = 62] = "GREATER_THAN_SIGN", e[e.QUESTION_MARK = 63] = "QUESTION_MARK", e[e.LATIN_CAPITAL_A = 65] = "LATIN_CAPITAL_A", e[e.LATIN_CAPITAL_Z = 90] = "LATIN_CAPITAL_Z", e[e.RIGHT_SQUARE_BRACKET = 93] = "RIGHT_SQUARE_BRACKET", e[e.GRAVE_ACCENT = 96] = "GRAVE_ACCENT", e[e.LATIN_SMALL_A = 97] = "LATIN_SMALL_A", e[e.LATIN_SMALL_Z = 122] = "LATIN_SMALL_Z";
})(W ||= {});
var Sc = {
	DASH_DASH: "--",
	CDATA_START: "[CDATA[",
	DOCTYPE: "doctype",
	SCRIPT: "script",
	PUBLIC: "public",
	SYSTEM: "system"
};
function Cc(e) {
	return e >= 55296 && e <= 57343;
}
function wc(e) {
	return e >= 56320 && e <= 57343;
}
function Tc(e, t) {
	return (e - 55296) * 1024 + 9216 + t;
}
function Ec(e) {
	return e !== 32 && e !== 10 && e !== 13 && e !== 9 && e !== 12 && e >= 1 && e <= 31 || e >= 127 && e <= 159;
}
function Dc(e) {
	return e >= 64976 && e <= 65007 || xc.has(e);
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/common/error-codes.js
var G;
(function(e) {
	e.controlCharacterInInputStream = "control-character-in-input-stream", e.noncharacterInInputStream = "noncharacter-in-input-stream", e.surrogateInInputStream = "surrogate-in-input-stream", e.nonVoidHtmlElementStartTagWithTrailingSolidus = "non-void-html-element-start-tag-with-trailing-solidus", e.endTagWithAttributes = "end-tag-with-attributes", e.endTagWithTrailingSolidus = "end-tag-with-trailing-solidus", e.unexpectedSolidusInTag = "unexpected-solidus-in-tag", e.unexpectedNullCharacter = "unexpected-null-character", e.unexpectedQuestionMarkInsteadOfTagName = "unexpected-question-mark-instead-of-tag-name", e.invalidFirstCharacterOfTagName = "invalid-first-character-of-tag-name", e.unexpectedEqualsSignBeforeAttributeName = "unexpected-equals-sign-before-attribute-name", e.missingEndTagName = "missing-end-tag-name", e.unexpectedCharacterInAttributeName = "unexpected-character-in-attribute-name", e.unknownNamedCharacterReference = "unknown-named-character-reference", e.missingSemicolonAfterCharacterReference = "missing-semicolon-after-character-reference", e.unexpectedCharacterAfterDoctypeSystemIdentifier = "unexpected-character-after-doctype-system-identifier", e.unexpectedCharacterInUnquotedAttributeValue = "unexpected-character-in-unquoted-attribute-value", e.eofBeforeTagName = "eof-before-tag-name", e.eofInTag = "eof-in-tag", e.missingAttributeValue = "missing-attribute-value", e.missingWhitespaceBetweenAttributes = "missing-whitespace-between-attributes", e.missingWhitespaceAfterDoctypePublicKeyword = "missing-whitespace-after-doctype-public-keyword", e.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers = "missing-whitespace-between-doctype-public-and-system-identifiers", e.missingWhitespaceAfterDoctypeSystemKeyword = "missing-whitespace-after-doctype-system-keyword", e.missingQuoteBeforeDoctypePublicIdentifier = "missing-quote-before-doctype-public-identifier", e.missingQuoteBeforeDoctypeSystemIdentifier = "missing-quote-before-doctype-system-identifier", e.missingDoctypePublicIdentifier = "missing-doctype-public-identifier", e.missingDoctypeSystemIdentifier = "missing-doctype-system-identifier", e.abruptDoctypePublicIdentifier = "abrupt-doctype-public-identifier", e.abruptDoctypeSystemIdentifier = "abrupt-doctype-system-identifier", e.cdataInHtmlContent = "cdata-in-html-content", e.incorrectlyOpenedComment = "incorrectly-opened-comment", e.eofInScriptHtmlCommentLikeText = "eof-in-script-html-comment-like-text", e.eofInDoctype = "eof-in-doctype", e.nestedComment = "nested-comment", e.abruptClosingOfEmptyComment = "abrupt-closing-of-empty-comment", e.eofInComment = "eof-in-comment", e.incorrectlyClosedComment = "incorrectly-closed-comment", e.eofInCdata = "eof-in-cdata", e.absenceOfDigitsInNumericCharacterReference = "absence-of-digits-in-numeric-character-reference", e.nullCharacterReference = "null-character-reference", e.surrogateCharacterReference = "surrogate-character-reference", e.characterReferenceOutsideUnicodeRange = "character-reference-outside-unicode-range", e.controlCharacterReference = "control-character-reference", e.noncharacterCharacterReference = "noncharacter-character-reference", e.missingWhitespaceBeforeDoctypeName = "missing-whitespace-before-doctype-name", e.missingDoctypeName = "missing-doctype-name", e.invalidCharacterSequenceAfterDoctypeName = "invalid-character-sequence-after-doctype-name", e.duplicateAttribute = "duplicate-attribute", e.nonConformingDoctype = "non-conforming-doctype", e.missingDoctype = "missing-doctype", e.misplacedDoctype = "misplaced-doctype", e.endTagWithoutMatchingOpenElement = "end-tag-without-matching-open-element", e.closingOfElementWithOpenChildElements = "closing-of-element-with-open-child-elements", e.disallowedContentInNoscriptInHead = "disallowed-content-in-noscript-in-head", e.openElementsLeftAfterEof = "open-elements-left-after-eof", e.abandonedHeadElementChild = "abandoned-head-element-child", e.misplacedStartTagForHeadElement = "misplaced-start-tag-for-head-element", e.nestedNoscriptInHead = "nested-noscript-in-head", e.eofInElementThatCanContainOnlyText = "eof-in-element-that-can-contain-only-text";
})(G ||= {});
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/tokenizer/preprocessor.js
var Oc = 65536, kc = class {
	constructor(e) {
		this.handler = e, this.html = "", this.pos = -1, this.lastGapPos = -2, this.gapStack = [], this.skipNextNewLine = !1, this.lastChunkWritten = !1, this.endOfChunkHit = !1, this.bufferWaterline = Oc, this.isEol = !1, this.lineStartPos = 0, this.droppedBufferSize = 0, this.line = 1, this.lastErrOffset = -1;
	}
	get col() {
		return this.pos - this.lineStartPos + Number(this.lastGapPos !== this.pos);
	}
	get offset() {
		return this.droppedBufferSize + this.pos;
	}
	getError(e, t) {
		let { line: n, col: r, offset: i } = this, a = r + t, o = i + t;
		return {
			code: e,
			startLine: n,
			endLine: n,
			startCol: a,
			endCol: a,
			startOffset: o,
			endOffset: o
		};
	}
	_err(e) {
		this.handler.onParseError && this.lastErrOffset !== this.offset && (this.lastErrOffset = this.offset, this.handler.onParseError(this.getError(e, 0)));
	}
	_addGap() {
		this.gapStack.push(this.lastGapPos), this.lastGapPos = this.pos;
	}
	_processSurrogate(e) {
		if (this.pos !== this.html.length - 1) {
			let t = this.html.charCodeAt(this.pos + 1);
			if (wc(t)) return this.pos++, this._addGap(), Tc(e, t);
		} else if (!this.lastChunkWritten) return this.endOfChunkHit = !0, W.EOF;
		return this._err(G.surrogateInInputStream), e;
	}
	willDropParsedChunk() {
		return this.pos > this.bufferWaterline;
	}
	dropParsedChunk() {
		this.willDropParsedChunk() && (this.html = this.html.substring(this.pos), this.lineStartPos -= this.pos, this.droppedBufferSize += this.pos, this.pos = 0, this.lastGapPos = -2, this.gapStack.length = 0);
	}
	write(e, t) {
		this.html.length > 0 ? this.html += e : this.html = e, this.endOfChunkHit = !1, this.lastChunkWritten = t;
	}
	insertHtmlAtCurrentPos(e) {
		this.html = this.html.substring(0, this.pos + 1) + e + this.html.substring(this.pos + 1), this.endOfChunkHit = !1;
	}
	startsWith(e, t) {
		if (this.pos + e.length > this.html.length) return this.endOfChunkHit = !this.lastChunkWritten, !1;
		if (t) return this.html.startsWith(e, this.pos);
		for (let t = 0; t < e.length; t++) if ((this.html.charCodeAt(this.pos + t) | 32) !== e.charCodeAt(t)) return !1;
		return !0;
	}
	peek(e) {
		let t = this.pos + e;
		if (t >= this.html.length) return this.endOfChunkHit = !this.lastChunkWritten, W.EOF;
		let n = this.html.charCodeAt(t);
		return n === W.CARRIAGE_RETURN ? W.LINE_FEED : n;
	}
	advance() {
		if (this.pos++, this.isEol && (this.isEol = !1, this.line++, this.lineStartPos = this.pos), this.pos >= this.html.length) return this.endOfChunkHit = !this.lastChunkWritten, W.EOF;
		let e = this.html.charCodeAt(this.pos);
		return e === W.CARRIAGE_RETURN ? (this.isEol = !0, this.skipNextNewLine = !0, W.LINE_FEED) : e === W.LINE_FEED && (this.isEol = !0, this.skipNextNewLine) ? (this.line--, this.skipNextNewLine = !1, this._addGap(), this.advance()) : (this.skipNextNewLine = !1, Cc(e) && (e = this._processSurrogate(e)), this.handler.onParseError === null || e > 31 && e < 127 || e === W.LINE_FEED || e === W.CARRIAGE_RETURN || e > 159 && e < 64976 || this._checkForProblematicCharacters(e), e);
	}
	_checkForProblematicCharacters(e) {
		Ec(e) ? this._err(G.controlCharacterInInputStream) : Dc(e) && this._err(G.noncharacterInInputStream);
	}
	retreat(e) {
		for (this.pos -= e; this.pos < this.lastGapPos;) this.lastGapPos = this.gapStack.pop(), this.pos--;
		this.isEol = !1;
	}
}, K;
(function(e) {
	e[e.CHARACTER = 0] = "CHARACTER", e[e.NULL_CHARACTER = 1] = "NULL_CHARACTER", e[e.WHITESPACE_CHARACTER = 2] = "WHITESPACE_CHARACTER", e[e.START_TAG = 3] = "START_TAG", e[e.END_TAG = 4] = "END_TAG", e[e.COMMENT = 5] = "COMMENT", e[e.DOCTYPE = 6] = "DOCTYPE", e[e.EOF = 7] = "EOF", e[e.HIBERNATION = 8] = "HIBERNATION";
})(K ||= {});
function Ac(e, t) {
	for (let n = e.attrs.length - 1; n >= 0; n--) if (e.attrs[n].name === t) return e.attrs[n].value;
	return null;
}
//#endregion
//#region node_modules/.pnpm/entities@6.0.1/node_modules/entities/dist/esm/generated/decode-data-html.js
var jc = /* #__PURE__ */ new Uint16Array(/* #__PURE__ */ "ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻\"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻\xA0ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌".split("").map((e) => e.charCodeAt(0))), Mc = /* @__PURE__ */ new Map([
	[0, 65533],
	[128, 8364],
	[130, 8218],
	[131, 402],
	[132, 8222],
	[133, 8230],
	[134, 8224],
	[135, 8225],
	[136, 710],
	[137, 8240],
	[138, 352],
	[139, 8249],
	[140, 338],
	[142, 381],
	[145, 8216],
	[146, 8217],
	[147, 8220],
	[148, 8221],
	[149, 8226],
	[150, 8211],
	[151, 8212],
	[152, 732],
	[153, 8482],
	[154, 353],
	[155, 8250],
	[156, 339],
	[158, 382],
	[159, 376]
]);
String.fromCodePoint;
function Nc(e) {
	return e >= 55296 && e <= 57343 || e > 1114111 ? 65533 : Mc.get(e) ?? e;
}
//#endregion
//#region node_modules/.pnpm/entities@6.0.1/node_modules/entities/dist/esm/decode.js
var Pc;
(function(e) {
	e[e.NUM = 35] = "NUM", e[e.SEMI = 59] = "SEMI", e[e.EQUALS = 61] = "EQUALS", e[e.ZERO = 48] = "ZERO", e[e.NINE = 57] = "NINE", e[e.LOWER_A = 97] = "LOWER_A", e[e.LOWER_F = 102] = "LOWER_F", e[e.LOWER_X = 120] = "LOWER_X", e[e.LOWER_Z = 122] = "LOWER_Z", e[e.UPPER_A = 65] = "UPPER_A", e[e.UPPER_F = 70] = "UPPER_F", e[e.UPPER_Z = 90] = "UPPER_Z";
})(Pc ||= {});
var Fc = 32, Ic;
(function(e) {
	e[e.VALUE_LENGTH = 49152] = "VALUE_LENGTH", e[e.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", e[e.JUMP_TABLE = 127] = "JUMP_TABLE";
})(Ic ||= {});
function Lc(e) {
	return e >= Pc.ZERO && e <= Pc.NINE;
}
function Rc(e) {
	return e >= Pc.UPPER_A && e <= Pc.UPPER_F || e >= Pc.LOWER_A && e <= Pc.LOWER_F;
}
function zc(e) {
	return e >= Pc.UPPER_A && e <= Pc.UPPER_Z || e >= Pc.LOWER_A && e <= Pc.LOWER_Z || Lc(e);
}
function Bc(e) {
	return e === Pc.EQUALS || zc(e);
}
var Vc;
(function(e) {
	e[e.EntityStart = 0] = "EntityStart", e[e.NumericStart = 1] = "NumericStart", e[e.NumericDecimal = 2] = "NumericDecimal", e[e.NumericHex = 3] = "NumericHex", e[e.NamedEntity = 4] = "NamedEntity";
})(Vc ||= {});
var Hc;
(function(e) {
	e[e.Legacy = 0] = "Legacy", e[e.Strict = 1] = "Strict", e[e.Attribute = 2] = "Attribute";
})(Hc ||= {});
var Uc = class {
	constructor(e, t, n) {
		this.decodeTree = e, this.emitCodePoint = t, this.errors = n, this.state = Vc.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = Hc.Strict;
	}
	startEntity(e) {
		this.decodeMode = e, this.state = Vc.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
	}
	write(e, t) {
		switch (this.state) {
			case Vc.EntityStart: return e.charCodeAt(t) === Pc.NUM ? (this.state = Vc.NumericStart, this.consumed += 1, this.stateNumericStart(e, t + 1)) : (this.state = Vc.NamedEntity, this.stateNamedEntity(e, t));
			case Vc.NumericStart: return this.stateNumericStart(e, t);
			case Vc.NumericDecimal: return this.stateNumericDecimal(e, t);
			case Vc.NumericHex: return this.stateNumericHex(e, t);
			case Vc.NamedEntity: return this.stateNamedEntity(e, t);
		}
	}
	stateNumericStart(e, t) {
		return t >= e.length ? -1 : (e.charCodeAt(t) | Fc) === Pc.LOWER_X ? (this.state = Vc.NumericHex, this.consumed += 1, this.stateNumericHex(e, t + 1)) : (this.state = Vc.NumericDecimal, this.stateNumericDecimal(e, t));
	}
	addToNumericResult(e, t, n, r) {
		if (t !== n) {
			let i = n - t;
			this.result = this.result * r ** +i + Number.parseInt(e.substr(t, i), r), this.consumed += i;
		}
	}
	stateNumericHex(e, t) {
		let n = t;
		for (; t < e.length;) {
			let r = e.charCodeAt(t);
			if (Lc(r) || Rc(r)) t += 1;
			else return this.addToNumericResult(e, n, t, 16), this.emitNumericEntity(r, 3);
		}
		return this.addToNumericResult(e, n, t, 16), -1;
	}
	stateNumericDecimal(e, t) {
		let n = t;
		for (; t < e.length;) {
			let r = e.charCodeAt(t);
			if (Lc(r)) t += 1;
			else return this.addToNumericResult(e, n, t, 10), this.emitNumericEntity(r, 2);
		}
		return this.addToNumericResult(e, n, t, 10), -1;
	}
	emitNumericEntity(e, t) {
		var n;
		if (this.consumed <= t) return (n = this.errors) == null || n.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
		if (e === Pc.SEMI) this.consumed += 1;
		else if (this.decodeMode === Hc.Strict) return 0;
		return this.emitCodePoint(Nc(this.result), this.consumed), this.errors && (e !== Pc.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
	}
	stateNamedEntity(e, t) {
		let { decodeTree: n } = this, r = n[this.treeIndex], i = (r & Ic.VALUE_LENGTH) >> 14;
		for (; t < e.length; t++, this.excess++) {
			let a = e.charCodeAt(t);
			if (this.treeIndex = Wc(n, r, this.treeIndex + Math.max(1, i), a), this.treeIndex < 0) return this.result === 0 || this.decodeMode === Hc.Attribute && (i === 0 || Bc(a)) ? 0 : this.emitNotTerminatedNamedEntity();
			if (r = n[this.treeIndex], i = (r & Ic.VALUE_LENGTH) >> 14, i !== 0) {
				if (a === Pc.SEMI) return this.emitNamedEntityData(this.treeIndex, i, this.consumed + this.excess);
				this.decodeMode !== Hc.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
			}
		}
		return -1;
	}
	emitNotTerminatedNamedEntity() {
		var e;
		let { result: t, decodeTree: n } = this, r = (n[t] & Ic.VALUE_LENGTH) >> 14;
		return this.emitNamedEntityData(t, r, this.consumed), (e = this.errors) == null || e.missingSemicolonAfterCharacterReference(), this.consumed;
	}
	emitNamedEntityData(e, t, n) {
		let { decodeTree: r } = this;
		return this.emitCodePoint(t === 1 ? r[e] & ~Ic.VALUE_LENGTH : r[e + 1], n), t === 3 && this.emitCodePoint(r[e + 2], n), n;
	}
	end() {
		var e;
		switch (this.state) {
			case Vc.NamedEntity: return this.result !== 0 && (this.decodeMode !== Hc.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
			case Vc.NumericDecimal: return this.emitNumericEntity(0, 2);
			case Vc.NumericHex: return this.emitNumericEntity(0, 3);
			case Vc.NumericStart: return (e = this.errors) == null || e.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
			case Vc.EntityStart: return 0;
		}
	}
};
function Wc(e, t, n, r) {
	let i = (t & Ic.BRANCH_LENGTH) >> 7, a = t & Ic.JUMP_TABLE;
	if (i === 0) return a !== 0 && r === a ? n : -1;
	if (a) {
		let t = r - a;
		return t < 0 || t >= i ? -1 : e[n + t] - 1;
	}
	let o = n, s = o + i - 1;
	for (; o <= s;) {
		let t = o + s >>> 1, n = e[t];
		if (n < r) o = t + 1;
		else if (n > r) s = t - 1;
		else return e[t + i];
	}
	return -1;
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/common/html.js
var q;
(function(e) {
	e.HTML = "http://www.w3.org/1999/xhtml", e.MATHML = "http://www.w3.org/1998/Math/MathML", e.SVG = "http://www.w3.org/2000/svg", e.XLINK = "http://www.w3.org/1999/xlink", e.XML = "http://www.w3.org/XML/1998/namespace", e.XMLNS = "http://www.w3.org/2000/xmlns/";
})(q ||= {});
var Gc;
(function(e) {
	e.TYPE = "type", e.ACTION = "action", e.ENCODING = "encoding", e.PROMPT = "prompt", e.NAME = "name", e.COLOR = "color", e.FACE = "face", e.SIZE = "size";
})(Gc ||= {});
var Kc;
(function(e) {
	e.NO_QUIRKS = "no-quirks", e.QUIRKS = "quirks", e.LIMITED_QUIRKS = "limited-quirks";
})(Kc ||= {});
var J;
(function(e) {
	e.A = "a", e.ADDRESS = "address", e.ANNOTATION_XML = "annotation-xml", e.APPLET = "applet", e.AREA = "area", e.ARTICLE = "article", e.ASIDE = "aside", e.B = "b", e.BASE = "base", e.BASEFONT = "basefont", e.BGSOUND = "bgsound", e.BIG = "big", e.BLOCKQUOTE = "blockquote", e.BODY = "body", e.BR = "br", e.BUTTON = "button", e.CAPTION = "caption", e.CENTER = "center", e.CODE = "code", e.COL = "col", e.COLGROUP = "colgroup", e.DD = "dd", e.DESC = "desc", e.DETAILS = "details", e.DIALOG = "dialog", e.DIR = "dir", e.DIV = "div", e.DL = "dl", e.DT = "dt", e.EM = "em", e.EMBED = "embed", e.FIELDSET = "fieldset", e.FIGCAPTION = "figcaption", e.FIGURE = "figure", e.FONT = "font", e.FOOTER = "footer", e.FOREIGN_OBJECT = "foreignObject", e.FORM = "form", e.FRAME = "frame", e.FRAMESET = "frameset", e.H1 = "h1", e.H2 = "h2", e.H3 = "h3", e.H4 = "h4", e.H5 = "h5", e.H6 = "h6", e.HEAD = "head", e.HEADER = "header", e.HGROUP = "hgroup", e.HR = "hr", e.HTML = "html", e.I = "i", e.IMG = "img", e.IMAGE = "image", e.INPUT = "input", e.IFRAME = "iframe", e.KEYGEN = "keygen", e.LABEL = "label", e.LI = "li", e.LINK = "link", e.LISTING = "listing", e.MAIN = "main", e.MALIGNMARK = "malignmark", e.MARQUEE = "marquee", e.MATH = "math", e.MENU = "menu", e.META = "meta", e.MGLYPH = "mglyph", e.MI = "mi", e.MO = "mo", e.MN = "mn", e.MS = "ms", e.MTEXT = "mtext", e.NAV = "nav", e.NOBR = "nobr", e.NOFRAMES = "noframes", e.NOEMBED = "noembed", e.NOSCRIPT = "noscript", e.OBJECT = "object", e.OL = "ol", e.OPTGROUP = "optgroup", e.OPTION = "option", e.P = "p", e.PARAM = "param", e.PLAINTEXT = "plaintext", e.PRE = "pre", e.RB = "rb", e.RP = "rp", e.RT = "rt", e.RTC = "rtc", e.RUBY = "ruby", e.S = "s", e.SCRIPT = "script", e.SEARCH = "search", e.SECTION = "section", e.SELECT = "select", e.SOURCE = "source", e.SMALL = "small", e.SPAN = "span", e.STRIKE = "strike", e.STRONG = "strong", e.STYLE = "style", e.SUB = "sub", e.SUMMARY = "summary", e.SUP = "sup", e.TABLE = "table", e.TBODY = "tbody", e.TEMPLATE = "template", e.TEXTAREA = "textarea", e.TFOOT = "tfoot", e.TD = "td", e.TH = "th", e.THEAD = "thead", e.TITLE = "title", e.TR = "tr", e.TRACK = "track", e.TT = "tt", e.U = "u", e.UL = "ul", e.SVG = "svg", e.VAR = "var", e.WBR = "wbr", e.XMP = "xmp";
})(J ||= {});
var Y;
(function(e) {
	e[e.UNKNOWN = 0] = "UNKNOWN", e[e.A = 1] = "A", e[e.ADDRESS = 2] = "ADDRESS", e[e.ANNOTATION_XML = 3] = "ANNOTATION_XML", e[e.APPLET = 4] = "APPLET", e[e.AREA = 5] = "AREA", e[e.ARTICLE = 6] = "ARTICLE", e[e.ASIDE = 7] = "ASIDE", e[e.B = 8] = "B", e[e.BASE = 9] = "BASE", e[e.BASEFONT = 10] = "BASEFONT", e[e.BGSOUND = 11] = "BGSOUND", e[e.BIG = 12] = "BIG", e[e.BLOCKQUOTE = 13] = "BLOCKQUOTE", e[e.BODY = 14] = "BODY", e[e.BR = 15] = "BR", e[e.BUTTON = 16] = "BUTTON", e[e.CAPTION = 17] = "CAPTION", e[e.CENTER = 18] = "CENTER", e[e.CODE = 19] = "CODE", e[e.COL = 20] = "COL", e[e.COLGROUP = 21] = "COLGROUP", e[e.DD = 22] = "DD", e[e.DESC = 23] = "DESC", e[e.DETAILS = 24] = "DETAILS", e[e.DIALOG = 25] = "DIALOG", e[e.DIR = 26] = "DIR", e[e.DIV = 27] = "DIV", e[e.DL = 28] = "DL", e[e.DT = 29] = "DT", e[e.EM = 30] = "EM", e[e.EMBED = 31] = "EMBED", e[e.FIELDSET = 32] = "FIELDSET", e[e.FIGCAPTION = 33] = "FIGCAPTION", e[e.FIGURE = 34] = "FIGURE", e[e.FONT = 35] = "FONT", e[e.FOOTER = 36] = "FOOTER", e[e.FOREIGN_OBJECT = 37] = "FOREIGN_OBJECT", e[e.FORM = 38] = "FORM", e[e.FRAME = 39] = "FRAME", e[e.FRAMESET = 40] = "FRAMESET", e[e.H1 = 41] = "H1", e[e.H2 = 42] = "H2", e[e.H3 = 43] = "H3", e[e.H4 = 44] = "H4", e[e.H5 = 45] = "H5", e[e.H6 = 46] = "H6", e[e.HEAD = 47] = "HEAD", e[e.HEADER = 48] = "HEADER", e[e.HGROUP = 49] = "HGROUP", e[e.HR = 50] = "HR", e[e.HTML = 51] = "HTML", e[e.I = 52] = "I", e[e.IMG = 53] = "IMG", e[e.IMAGE = 54] = "IMAGE", e[e.INPUT = 55] = "INPUT", e[e.IFRAME = 56] = "IFRAME", e[e.KEYGEN = 57] = "KEYGEN", e[e.LABEL = 58] = "LABEL", e[e.LI = 59] = "LI", e[e.LINK = 60] = "LINK", e[e.LISTING = 61] = "LISTING", e[e.MAIN = 62] = "MAIN", e[e.MALIGNMARK = 63] = "MALIGNMARK", e[e.MARQUEE = 64] = "MARQUEE", e[e.MATH = 65] = "MATH", e[e.MENU = 66] = "MENU", e[e.META = 67] = "META", e[e.MGLYPH = 68] = "MGLYPH", e[e.MI = 69] = "MI", e[e.MO = 70] = "MO", e[e.MN = 71] = "MN", e[e.MS = 72] = "MS", e[e.MTEXT = 73] = "MTEXT", e[e.NAV = 74] = "NAV", e[e.NOBR = 75] = "NOBR", e[e.NOFRAMES = 76] = "NOFRAMES", e[e.NOEMBED = 77] = "NOEMBED", e[e.NOSCRIPT = 78] = "NOSCRIPT", e[e.OBJECT = 79] = "OBJECT", e[e.OL = 80] = "OL", e[e.OPTGROUP = 81] = "OPTGROUP", e[e.OPTION = 82] = "OPTION", e[e.P = 83] = "P", e[e.PARAM = 84] = "PARAM", e[e.PLAINTEXT = 85] = "PLAINTEXT", e[e.PRE = 86] = "PRE", e[e.RB = 87] = "RB", e[e.RP = 88] = "RP", e[e.RT = 89] = "RT", e[e.RTC = 90] = "RTC", e[e.RUBY = 91] = "RUBY", e[e.S = 92] = "S", e[e.SCRIPT = 93] = "SCRIPT", e[e.SEARCH = 94] = "SEARCH", e[e.SECTION = 95] = "SECTION", e[e.SELECT = 96] = "SELECT", e[e.SOURCE = 97] = "SOURCE", e[e.SMALL = 98] = "SMALL", e[e.SPAN = 99] = "SPAN", e[e.STRIKE = 100] = "STRIKE", e[e.STRONG = 101] = "STRONG", e[e.STYLE = 102] = "STYLE", e[e.SUB = 103] = "SUB", e[e.SUMMARY = 104] = "SUMMARY", e[e.SUP = 105] = "SUP", e[e.TABLE = 106] = "TABLE", e[e.TBODY = 107] = "TBODY", e[e.TEMPLATE = 108] = "TEMPLATE", e[e.TEXTAREA = 109] = "TEXTAREA", e[e.TFOOT = 110] = "TFOOT", e[e.TD = 111] = "TD", e[e.TH = 112] = "TH", e[e.THEAD = 113] = "THEAD", e[e.TITLE = 114] = "TITLE", e[e.TR = 115] = "TR", e[e.TRACK = 116] = "TRACK", e[e.TT = 117] = "TT", e[e.U = 118] = "U", e[e.UL = 119] = "UL", e[e.SVG = 120] = "SVG", e[e.VAR = 121] = "VAR", e[e.WBR = 122] = "WBR", e[e.XMP = 123] = "XMP";
})(Y ||= {});
var qc = /* @__PURE__ */ new Map([
	[J.A, Y.A],
	[J.ADDRESS, Y.ADDRESS],
	[J.ANNOTATION_XML, Y.ANNOTATION_XML],
	[J.APPLET, Y.APPLET],
	[J.AREA, Y.AREA],
	[J.ARTICLE, Y.ARTICLE],
	[J.ASIDE, Y.ASIDE],
	[J.B, Y.B],
	[J.BASE, Y.BASE],
	[J.BASEFONT, Y.BASEFONT],
	[J.BGSOUND, Y.BGSOUND],
	[J.BIG, Y.BIG],
	[J.BLOCKQUOTE, Y.BLOCKQUOTE],
	[J.BODY, Y.BODY],
	[J.BR, Y.BR],
	[J.BUTTON, Y.BUTTON],
	[J.CAPTION, Y.CAPTION],
	[J.CENTER, Y.CENTER],
	[J.CODE, Y.CODE],
	[J.COL, Y.COL],
	[J.COLGROUP, Y.COLGROUP],
	[J.DD, Y.DD],
	[J.DESC, Y.DESC],
	[J.DETAILS, Y.DETAILS],
	[J.DIALOG, Y.DIALOG],
	[J.DIR, Y.DIR],
	[J.DIV, Y.DIV],
	[J.DL, Y.DL],
	[J.DT, Y.DT],
	[J.EM, Y.EM],
	[J.EMBED, Y.EMBED],
	[J.FIELDSET, Y.FIELDSET],
	[J.FIGCAPTION, Y.FIGCAPTION],
	[J.FIGURE, Y.FIGURE],
	[J.FONT, Y.FONT],
	[J.FOOTER, Y.FOOTER],
	[J.FOREIGN_OBJECT, Y.FOREIGN_OBJECT],
	[J.FORM, Y.FORM],
	[J.FRAME, Y.FRAME],
	[J.FRAMESET, Y.FRAMESET],
	[J.H1, Y.H1],
	[J.H2, Y.H2],
	[J.H3, Y.H3],
	[J.H4, Y.H4],
	[J.H5, Y.H5],
	[J.H6, Y.H6],
	[J.HEAD, Y.HEAD],
	[J.HEADER, Y.HEADER],
	[J.HGROUP, Y.HGROUP],
	[J.HR, Y.HR],
	[J.HTML, Y.HTML],
	[J.I, Y.I],
	[J.IMG, Y.IMG],
	[J.IMAGE, Y.IMAGE],
	[J.INPUT, Y.INPUT],
	[J.IFRAME, Y.IFRAME],
	[J.KEYGEN, Y.KEYGEN],
	[J.LABEL, Y.LABEL],
	[J.LI, Y.LI],
	[J.LINK, Y.LINK],
	[J.LISTING, Y.LISTING],
	[J.MAIN, Y.MAIN],
	[J.MALIGNMARK, Y.MALIGNMARK],
	[J.MARQUEE, Y.MARQUEE],
	[J.MATH, Y.MATH],
	[J.MENU, Y.MENU],
	[J.META, Y.META],
	[J.MGLYPH, Y.MGLYPH],
	[J.MI, Y.MI],
	[J.MO, Y.MO],
	[J.MN, Y.MN],
	[J.MS, Y.MS],
	[J.MTEXT, Y.MTEXT],
	[J.NAV, Y.NAV],
	[J.NOBR, Y.NOBR],
	[J.NOFRAMES, Y.NOFRAMES],
	[J.NOEMBED, Y.NOEMBED],
	[J.NOSCRIPT, Y.NOSCRIPT],
	[J.OBJECT, Y.OBJECT],
	[J.OL, Y.OL],
	[J.OPTGROUP, Y.OPTGROUP],
	[J.OPTION, Y.OPTION],
	[J.P, Y.P],
	[J.PARAM, Y.PARAM],
	[J.PLAINTEXT, Y.PLAINTEXT],
	[J.PRE, Y.PRE],
	[J.RB, Y.RB],
	[J.RP, Y.RP],
	[J.RT, Y.RT],
	[J.RTC, Y.RTC],
	[J.RUBY, Y.RUBY],
	[J.S, Y.S],
	[J.SCRIPT, Y.SCRIPT],
	[J.SEARCH, Y.SEARCH],
	[J.SECTION, Y.SECTION],
	[J.SELECT, Y.SELECT],
	[J.SOURCE, Y.SOURCE],
	[J.SMALL, Y.SMALL],
	[J.SPAN, Y.SPAN],
	[J.STRIKE, Y.STRIKE],
	[J.STRONG, Y.STRONG],
	[J.STYLE, Y.STYLE],
	[J.SUB, Y.SUB],
	[J.SUMMARY, Y.SUMMARY],
	[J.SUP, Y.SUP],
	[J.TABLE, Y.TABLE],
	[J.TBODY, Y.TBODY],
	[J.TEMPLATE, Y.TEMPLATE],
	[J.TEXTAREA, Y.TEXTAREA],
	[J.TFOOT, Y.TFOOT],
	[J.TD, Y.TD],
	[J.TH, Y.TH],
	[J.THEAD, Y.THEAD],
	[J.TITLE, Y.TITLE],
	[J.TR, Y.TR],
	[J.TRACK, Y.TRACK],
	[J.TT, Y.TT],
	[J.U, Y.U],
	[J.UL, Y.UL],
	[J.SVG, Y.SVG],
	[J.VAR, Y.VAR],
	[J.WBR, Y.WBR],
	[J.XMP, Y.XMP]
]);
function Jc(e) {
	return qc.get(e) ?? Y.UNKNOWN;
}
var X = Y, Yc = {
	[q.HTML]: /* @__PURE__ */ new Set([
		X.ADDRESS,
		X.APPLET,
		X.AREA,
		X.ARTICLE,
		X.ASIDE,
		X.BASE,
		X.BASEFONT,
		X.BGSOUND,
		X.BLOCKQUOTE,
		X.BODY,
		X.BR,
		X.BUTTON,
		X.CAPTION,
		X.CENTER,
		X.COL,
		X.COLGROUP,
		X.DD,
		X.DETAILS,
		X.DIR,
		X.DIV,
		X.DL,
		X.DT,
		X.EMBED,
		X.FIELDSET,
		X.FIGCAPTION,
		X.FIGURE,
		X.FOOTER,
		X.FORM,
		X.FRAME,
		X.FRAMESET,
		X.H1,
		X.H2,
		X.H3,
		X.H4,
		X.H5,
		X.H6,
		X.HEAD,
		X.HEADER,
		X.HGROUP,
		X.HR,
		X.HTML,
		X.IFRAME,
		X.IMG,
		X.INPUT,
		X.LI,
		X.LINK,
		X.LISTING,
		X.MAIN,
		X.MARQUEE,
		X.MENU,
		X.META,
		X.NAV,
		X.NOEMBED,
		X.NOFRAMES,
		X.NOSCRIPT,
		X.OBJECT,
		X.OL,
		X.P,
		X.PARAM,
		X.PLAINTEXT,
		X.PRE,
		X.SCRIPT,
		X.SECTION,
		X.SELECT,
		X.SOURCE,
		X.STYLE,
		X.SUMMARY,
		X.TABLE,
		X.TBODY,
		X.TD,
		X.TEMPLATE,
		X.TEXTAREA,
		X.TFOOT,
		X.TH,
		X.THEAD,
		X.TITLE,
		X.TR,
		X.TRACK,
		X.UL,
		X.WBR,
		X.XMP
	]),
	[q.MATHML]: /* @__PURE__ */ new Set([
		X.MI,
		X.MO,
		X.MN,
		X.MS,
		X.MTEXT,
		X.ANNOTATION_XML
	]),
	[q.SVG]: /* @__PURE__ */ new Set([
		X.TITLE,
		X.FOREIGN_OBJECT,
		X.DESC
	]),
	[q.XLINK]: /* @__PURE__ */ new Set(),
	[q.XML]: /* @__PURE__ */ new Set(),
	[q.XMLNS]: /* @__PURE__ */ new Set()
}, Xc = /* @__PURE__ */ new Set([
	X.H1,
	X.H2,
	X.H3,
	X.H4,
	X.H5,
	X.H6
]), Zc = /* @__PURE__ */ new Set([
	J.STYLE,
	J.SCRIPT,
	J.XMP,
	J.IFRAME,
	J.NOEMBED,
	J.NOFRAMES,
	J.PLAINTEXT
]);
function Qc(e, t) {
	return Zc.has(e) || t && e === J.NOSCRIPT;
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/tokenizer/index.js
var Z;
(function(e) {
	e[e.DATA = 0] = "DATA", e[e.RCDATA = 1] = "RCDATA", e[e.RAWTEXT = 2] = "RAWTEXT", e[e.SCRIPT_DATA = 3] = "SCRIPT_DATA", e[e.PLAINTEXT = 4] = "PLAINTEXT", e[e.TAG_OPEN = 5] = "TAG_OPEN", e[e.END_TAG_OPEN = 6] = "END_TAG_OPEN", e[e.TAG_NAME = 7] = "TAG_NAME", e[e.RCDATA_LESS_THAN_SIGN = 8] = "RCDATA_LESS_THAN_SIGN", e[e.RCDATA_END_TAG_OPEN = 9] = "RCDATA_END_TAG_OPEN", e[e.RCDATA_END_TAG_NAME = 10] = "RCDATA_END_TAG_NAME", e[e.RAWTEXT_LESS_THAN_SIGN = 11] = "RAWTEXT_LESS_THAN_SIGN", e[e.RAWTEXT_END_TAG_OPEN = 12] = "RAWTEXT_END_TAG_OPEN", e[e.RAWTEXT_END_TAG_NAME = 13] = "RAWTEXT_END_TAG_NAME", e[e.SCRIPT_DATA_LESS_THAN_SIGN = 14] = "SCRIPT_DATA_LESS_THAN_SIGN", e[e.SCRIPT_DATA_END_TAG_OPEN = 15] = "SCRIPT_DATA_END_TAG_OPEN", e[e.SCRIPT_DATA_END_TAG_NAME = 16] = "SCRIPT_DATA_END_TAG_NAME", e[e.SCRIPT_DATA_ESCAPE_START = 17] = "SCRIPT_DATA_ESCAPE_START", e[e.SCRIPT_DATA_ESCAPE_START_DASH = 18] = "SCRIPT_DATA_ESCAPE_START_DASH", e[e.SCRIPT_DATA_ESCAPED = 19] = "SCRIPT_DATA_ESCAPED", e[e.SCRIPT_DATA_ESCAPED_DASH = 20] = "SCRIPT_DATA_ESCAPED_DASH", e[e.SCRIPT_DATA_ESCAPED_DASH_DASH = 21] = "SCRIPT_DATA_ESCAPED_DASH_DASH", e[e.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN = 22] = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN", e[e.SCRIPT_DATA_ESCAPED_END_TAG_OPEN = 23] = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN", e[e.SCRIPT_DATA_ESCAPED_END_TAG_NAME = 24] = "SCRIPT_DATA_ESCAPED_END_TAG_NAME", e[e.SCRIPT_DATA_DOUBLE_ESCAPE_START = 25] = "SCRIPT_DATA_DOUBLE_ESCAPE_START", e[e.SCRIPT_DATA_DOUBLE_ESCAPED = 26] = "SCRIPT_DATA_DOUBLE_ESCAPED", e[e.SCRIPT_DATA_DOUBLE_ESCAPED_DASH = 27] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH", e[e.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH = 28] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH", e[e.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN = 29] = "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN", e[e.SCRIPT_DATA_DOUBLE_ESCAPE_END = 30] = "SCRIPT_DATA_DOUBLE_ESCAPE_END", e[e.BEFORE_ATTRIBUTE_NAME = 31] = "BEFORE_ATTRIBUTE_NAME", e[e.ATTRIBUTE_NAME = 32] = "ATTRIBUTE_NAME", e[e.AFTER_ATTRIBUTE_NAME = 33] = "AFTER_ATTRIBUTE_NAME", e[e.BEFORE_ATTRIBUTE_VALUE = 34] = "BEFORE_ATTRIBUTE_VALUE", e[e.ATTRIBUTE_VALUE_DOUBLE_QUOTED = 35] = "ATTRIBUTE_VALUE_DOUBLE_QUOTED", e[e.ATTRIBUTE_VALUE_SINGLE_QUOTED = 36] = "ATTRIBUTE_VALUE_SINGLE_QUOTED", e[e.ATTRIBUTE_VALUE_UNQUOTED = 37] = "ATTRIBUTE_VALUE_UNQUOTED", e[e.AFTER_ATTRIBUTE_VALUE_QUOTED = 38] = "AFTER_ATTRIBUTE_VALUE_QUOTED", e[e.SELF_CLOSING_START_TAG = 39] = "SELF_CLOSING_START_TAG", e[e.BOGUS_COMMENT = 40] = "BOGUS_COMMENT", e[e.MARKUP_DECLARATION_OPEN = 41] = "MARKUP_DECLARATION_OPEN", e[e.COMMENT_START = 42] = "COMMENT_START", e[e.COMMENT_START_DASH = 43] = "COMMENT_START_DASH", e[e.COMMENT = 44] = "COMMENT", e[e.COMMENT_LESS_THAN_SIGN = 45] = "COMMENT_LESS_THAN_SIGN", e[e.COMMENT_LESS_THAN_SIGN_BANG = 46] = "COMMENT_LESS_THAN_SIGN_BANG", e[e.COMMENT_LESS_THAN_SIGN_BANG_DASH = 47] = "COMMENT_LESS_THAN_SIGN_BANG_DASH", e[e.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH = 48] = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH", e[e.COMMENT_END_DASH = 49] = "COMMENT_END_DASH", e[e.COMMENT_END = 50] = "COMMENT_END", e[e.COMMENT_END_BANG = 51] = "COMMENT_END_BANG", e[e.DOCTYPE = 52] = "DOCTYPE", e[e.BEFORE_DOCTYPE_NAME = 53] = "BEFORE_DOCTYPE_NAME", e[e.DOCTYPE_NAME = 54] = "DOCTYPE_NAME", e[e.AFTER_DOCTYPE_NAME = 55] = "AFTER_DOCTYPE_NAME", e[e.AFTER_DOCTYPE_PUBLIC_KEYWORD = 56] = "AFTER_DOCTYPE_PUBLIC_KEYWORD", e[e.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER = 57] = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER", e[e.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED = 58] = "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED", e[e.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED = 59] = "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED", e[e.AFTER_DOCTYPE_PUBLIC_IDENTIFIER = 60] = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER", e[e.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS = 61] = "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS", e[e.AFTER_DOCTYPE_SYSTEM_KEYWORD = 62] = "AFTER_DOCTYPE_SYSTEM_KEYWORD", e[e.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER = 63] = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER", e[e.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED = 64] = "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED", e[e.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED = 65] = "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED", e[e.AFTER_DOCTYPE_SYSTEM_IDENTIFIER = 66] = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER", e[e.BOGUS_DOCTYPE = 67] = "BOGUS_DOCTYPE", e[e.CDATA_SECTION = 68] = "CDATA_SECTION", e[e.CDATA_SECTION_BRACKET = 69] = "CDATA_SECTION_BRACKET", e[e.CDATA_SECTION_END = 70] = "CDATA_SECTION_END", e[e.CHARACTER_REFERENCE = 71] = "CHARACTER_REFERENCE", e[e.AMBIGUOUS_AMPERSAND = 72] = "AMBIGUOUS_AMPERSAND";
})(Z ||= {});
var $c = {
	DATA: Z.DATA,
	RCDATA: Z.RCDATA,
	RAWTEXT: Z.RAWTEXT,
	SCRIPT_DATA: Z.SCRIPT_DATA,
	PLAINTEXT: Z.PLAINTEXT,
	CDATA_SECTION: Z.CDATA_SECTION
};
function el(e) {
	return e >= W.DIGIT_0 && e <= W.DIGIT_9;
}
function tl(e) {
	return e >= W.LATIN_CAPITAL_A && e <= W.LATIN_CAPITAL_Z;
}
function nl(e) {
	return e >= W.LATIN_SMALL_A && e <= W.LATIN_SMALL_Z;
}
function rl(e) {
	return nl(e) || tl(e);
}
function il(e) {
	return rl(e) || el(e);
}
function al(e) {
	return e + 32;
}
function ol(e) {
	return e === W.SPACE || e === W.LINE_FEED || e === W.TABULATION || e === W.FORM_FEED;
}
function sl(e) {
	return ol(e) || e === W.SOLIDUS || e === W.GREATER_THAN_SIGN;
}
function cl(e) {
	return e === W.NULL ? G.nullCharacterReference : e > 1114111 ? G.characterReferenceOutsideUnicodeRange : Cc(e) ? G.surrogateCharacterReference : Dc(e) ? G.noncharacterCharacterReference : Ec(e) || e === W.CARRIAGE_RETURN ? G.controlCharacterReference : null;
}
var ll = class {
	constructor(e, t) {
		this.options = e, this.handler = t, this.paused = !1, this.inLoop = !1, this.inForeignNode = !1, this.lastStartTagName = "", this.active = !1, this.state = Z.DATA, this.returnState = Z.DATA, this.entityStartPos = 0, this.consumedAfterSnapshot = -1, this.currentCharacterToken = null, this.currentToken = null, this.currentAttr = {
			name: "",
			value: ""
		}, this.preprocessor = new kc(t), this.currentLocation = this.getCurrentLocation(-1), this.entityDecoder = new Uc(jc, (e, t) => {
			this.preprocessor.pos = this.entityStartPos + t - 1, this._flushCodePointConsumedAsCharacterReference(e);
		}, t.onParseError ? {
			missingSemicolonAfterCharacterReference: () => {
				this._err(G.missingSemicolonAfterCharacterReference, 1);
			},
			absenceOfDigitsInNumericCharacterReference: (e) => {
				this._err(G.absenceOfDigitsInNumericCharacterReference, this.entityStartPos - this.preprocessor.pos + e);
			},
			validateNumericCharacterReference: (e) => {
				let t = cl(e);
				t && this._err(t, 1);
			}
		} : void 0);
	}
	_err(e, t = 0) {
		var n, r;
		(r = (n = this.handler).onParseError) == null || r.call(n, this.preprocessor.getError(e, t));
	}
	getCurrentLocation(e) {
		return this.options.sourceCodeLocationInfo ? {
			startLine: this.preprocessor.line,
			startCol: this.preprocessor.col - e,
			startOffset: this.preprocessor.offset - e,
			endLine: -1,
			endCol: -1,
			endOffset: -1
		} : null;
	}
	_runParsingLoop() {
		if (!this.inLoop) {
			for (this.inLoop = !0; this.active && !this.paused;) {
				this.consumedAfterSnapshot = 0;
				let e = this._consume();
				this._ensureHibernation() || this._callState(e);
			}
			this.inLoop = !1;
		}
	}
	pause() {
		this.paused = !0;
	}
	resume(e) {
		if (!this.paused) throw Error("Parser was already resumed");
		this.paused = !1, !this.inLoop && (this._runParsingLoop(), this.paused || e?.());
	}
	write(e, t, n) {
		this.active = !0, this.preprocessor.write(e, t), this._runParsingLoop(), this.paused || n?.();
	}
	insertHtmlAtCurrentPos(e) {
		this.active = !0, this.preprocessor.insertHtmlAtCurrentPos(e), this._runParsingLoop();
	}
	_ensureHibernation() {
		return this.preprocessor.endOfChunkHit ? (this.preprocessor.retreat(this.consumedAfterSnapshot), this.consumedAfterSnapshot = 0, this.active = !1, !0) : !1;
	}
	_consume() {
		return this.consumedAfterSnapshot++, this.preprocessor.advance();
	}
	_advanceBy(e) {
		this.consumedAfterSnapshot += e;
		for (let t = 0; t < e; t++) this.preprocessor.advance();
	}
	_consumeSequenceIfMatch(e, t) {
		return this.preprocessor.startsWith(e, t) ? (this._advanceBy(e.length - 1), !0) : !1;
	}
	_createStartTagToken() {
		this.currentToken = {
			type: K.START_TAG,
			tagName: "",
			tagID: Y.UNKNOWN,
			selfClosing: !1,
			ackSelfClosing: !1,
			attrs: [],
			location: this.getCurrentLocation(1)
		};
	}
	_createEndTagToken() {
		this.currentToken = {
			type: K.END_TAG,
			tagName: "",
			tagID: Y.UNKNOWN,
			selfClosing: !1,
			ackSelfClosing: !1,
			attrs: [],
			location: this.getCurrentLocation(2)
		};
	}
	_createCommentToken(e) {
		this.currentToken = {
			type: K.COMMENT,
			data: "",
			location: this.getCurrentLocation(e)
		};
	}
	_createDoctypeToken(e) {
		this.currentToken = {
			type: K.DOCTYPE,
			name: e,
			forceQuirks: !1,
			publicId: null,
			systemId: null,
			location: this.currentLocation
		};
	}
	_createCharacterToken(e, t) {
		this.currentCharacterToken = {
			type: e,
			chars: t,
			location: this.currentLocation
		};
	}
	_createAttr(e) {
		this.currentAttr = {
			name: e,
			value: ""
		}, this.currentLocation = this.getCurrentLocation(0);
	}
	_leaveAttrName() {
		var e;
		let t = this.currentToken;
		if (Ac(t, this.currentAttr.name) === null) {
			if (t.attrs.push(this.currentAttr), t.location && this.currentLocation) {
				let n = (e = t.location).attrs ?? (e.attrs = Object.create(null));
				n[this.currentAttr.name] = this.currentLocation, this._leaveAttrValue();
			}
		} else this._err(G.duplicateAttribute);
	}
	_leaveAttrValue() {
		this.currentLocation && (this.currentLocation.endLine = this.preprocessor.line, this.currentLocation.endCol = this.preprocessor.col, this.currentLocation.endOffset = this.preprocessor.offset);
	}
	prepareToken(e) {
		this._emitCurrentCharacterToken(e.location), this.currentToken = null, e.location && (e.location.endLine = this.preprocessor.line, e.location.endCol = this.preprocessor.col + 1, e.location.endOffset = this.preprocessor.offset + 1), this.currentLocation = this.getCurrentLocation(-1);
	}
	emitCurrentTagToken() {
		let e = this.currentToken;
		this.prepareToken(e), e.tagID = Jc(e.tagName), e.type === K.START_TAG ? (this.lastStartTagName = e.tagName, this.handler.onStartTag(e)) : (e.attrs.length > 0 && this._err(G.endTagWithAttributes), e.selfClosing && this._err(G.endTagWithTrailingSolidus), this.handler.onEndTag(e)), this.preprocessor.dropParsedChunk();
	}
	emitCurrentComment(e) {
		this.prepareToken(e), this.handler.onComment(e), this.preprocessor.dropParsedChunk();
	}
	emitCurrentDoctype(e) {
		this.prepareToken(e), this.handler.onDoctype(e), this.preprocessor.dropParsedChunk();
	}
	_emitCurrentCharacterToken(e) {
		if (this.currentCharacterToken) {
			switch (e && this.currentCharacterToken.location && (this.currentCharacterToken.location.endLine = e.startLine, this.currentCharacterToken.location.endCol = e.startCol, this.currentCharacterToken.location.endOffset = e.startOffset), this.currentCharacterToken.type) {
				case K.CHARACTER:
					this.handler.onCharacter(this.currentCharacterToken);
					break;
				case K.NULL_CHARACTER:
					this.handler.onNullCharacter(this.currentCharacterToken);
					break;
				case K.WHITESPACE_CHARACTER: this.handler.onWhitespaceCharacter(this.currentCharacterToken);
			}
			this.currentCharacterToken = null;
		}
	}
	_emitEOFToken() {
		let e = this.getCurrentLocation(0);
		e && (e.endLine = e.startLine, e.endCol = e.startCol, e.endOffset = e.startOffset), this._emitCurrentCharacterToken(e), this.handler.onEof({
			type: K.EOF,
			location: e
		}), this.active = !1;
	}
	_appendCharToCurrentCharacterToken(e, t) {
		if (this.currentCharacterToken) {
			if (this.currentCharacterToken.type === e) {
				this.currentCharacterToken.chars += t;
				return;
			}
			this.currentLocation = this.getCurrentLocation(0), this._emitCurrentCharacterToken(this.currentLocation), this.preprocessor.dropParsedChunk();
		}
		this._createCharacterToken(e, t);
	}
	_emitCodePoint(e) {
		let t = ol(e) ? K.WHITESPACE_CHARACTER : e === W.NULL ? K.NULL_CHARACTER : K.CHARACTER;
		this._appendCharToCurrentCharacterToken(t, String.fromCodePoint(e));
	}
	_emitChars(e) {
		this._appendCharToCurrentCharacterToken(K.CHARACTER, e);
	}
	_startCharacterReference() {
		this.returnState = this.state, this.state = Z.CHARACTER_REFERENCE, this.entityStartPos = this.preprocessor.pos, this.entityDecoder.startEntity(this._isCharacterReferenceInAttribute() ? Hc.Attribute : Hc.Legacy);
	}
	_isCharacterReferenceInAttribute() {
		return this.returnState === Z.ATTRIBUTE_VALUE_DOUBLE_QUOTED || this.returnState === Z.ATTRIBUTE_VALUE_SINGLE_QUOTED || this.returnState === Z.ATTRIBUTE_VALUE_UNQUOTED;
	}
	_flushCodePointConsumedAsCharacterReference(e) {
		this._isCharacterReferenceInAttribute() ? this.currentAttr.value += String.fromCodePoint(e) : this._emitCodePoint(e);
	}
	_callState(e) {
		switch (this.state) {
			case Z.DATA:
				this._stateData(e);
				break;
			case Z.RCDATA:
				this._stateRcdata(e);
				break;
			case Z.RAWTEXT:
				this._stateRawtext(e);
				break;
			case Z.SCRIPT_DATA:
				this._stateScriptData(e);
				break;
			case Z.PLAINTEXT:
				this._statePlaintext(e);
				break;
			case Z.TAG_OPEN:
				this._stateTagOpen(e);
				break;
			case Z.END_TAG_OPEN:
				this._stateEndTagOpen(e);
				break;
			case Z.TAG_NAME:
				this._stateTagName(e);
				break;
			case Z.RCDATA_LESS_THAN_SIGN:
				this._stateRcdataLessThanSign(e);
				break;
			case Z.RCDATA_END_TAG_OPEN:
				this._stateRcdataEndTagOpen(e);
				break;
			case Z.RCDATA_END_TAG_NAME:
				this._stateRcdataEndTagName(e);
				break;
			case Z.RAWTEXT_LESS_THAN_SIGN:
				this._stateRawtextLessThanSign(e);
				break;
			case Z.RAWTEXT_END_TAG_OPEN:
				this._stateRawtextEndTagOpen(e);
				break;
			case Z.RAWTEXT_END_TAG_NAME:
				this._stateRawtextEndTagName(e);
				break;
			case Z.SCRIPT_DATA_LESS_THAN_SIGN:
				this._stateScriptDataLessThanSign(e);
				break;
			case Z.SCRIPT_DATA_END_TAG_OPEN:
				this._stateScriptDataEndTagOpen(e);
				break;
			case Z.SCRIPT_DATA_END_TAG_NAME:
				this._stateScriptDataEndTagName(e);
				break;
			case Z.SCRIPT_DATA_ESCAPE_START:
				this._stateScriptDataEscapeStart(e);
				break;
			case Z.SCRIPT_DATA_ESCAPE_START_DASH:
				this._stateScriptDataEscapeStartDash(e);
				break;
			case Z.SCRIPT_DATA_ESCAPED:
				this._stateScriptDataEscaped(e);
				break;
			case Z.SCRIPT_DATA_ESCAPED_DASH:
				this._stateScriptDataEscapedDash(e);
				break;
			case Z.SCRIPT_DATA_ESCAPED_DASH_DASH:
				this._stateScriptDataEscapedDashDash(e);
				break;
			case Z.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN:
				this._stateScriptDataEscapedLessThanSign(e);
				break;
			case Z.SCRIPT_DATA_ESCAPED_END_TAG_OPEN:
				this._stateScriptDataEscapedEndTagOpen(e);
				break;
			case Z.SCRIPT_DATA_ESCAPED_END_TAG_NAME:
				this._stateScriptDataEscapedEndTagName(e);
				break;
			case Z.SCRIPT_DATA_DOUBLE_ESCAPE_START:
				this._stateScriptDataDoubleEscapeStart(e);
				break;
			case Z.SCRIPT_DATA_DOUBLE_ESCAPED:
				this._stateScriptDataDoubleEscaped(e);
				break;
			case Z.SCRIPT_DATA_DOUBLE_ESCAPED_DASH:
				this._stateScriptDataDoubleEscapedDash(e);
				break;
			case Z.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH:
				this._stateScriptDataDoubleEscapedDashDash(e);
				break;
			case Z.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN:
				this._stateScriptDataDoubleEscapedLessThanSign(e);
				break;
			case Z.SCRIPT_DATA_DOUBLE_ESCAPE_END:
				this._stateScriptDataDoubleEscapeEnd(e);
				break;
			case Z.BEFORE_ATTRIBUTE_NAME:
				this._stateBeforeAttributeName(e);
				break;
			case Z.ATTRIBUTE_NAME:
				this._stateAttributeName(e);
				break;
			case Z.AFTER_ATTRIBUTE_NAME:
				this._stateAfterAttributeName(e);
				break;
			case Z.BEFORE_ATTRIBUTE_VALUE:
				this._stateBeforeAttributeValue(e);
				break;
			case Z.ATTRIBUTE_VALUE_DOUBLE_QUOTED:
				this._stateAttributeValueDoubleQuoted(e);
				break;
			case Z.ATTRIBUTE_VALUE_SINGLE_QUOTED:
				this._stateAttributeValueSingleQuoted(e);
				break;
			case Z.ATTRIBUTE_VALUE_UNQUOTED:
				this._stateAttributeValueUnquoted(e);
				break;
			case Z.AFTER_ATTRIBUTE_VALUE_QUOTED:
				this._stateAfterAttributeValueQuoted(e);
				break;
			case Z.SELF_CLOSING_START_TAG:
				this._stateSelfClosingStartTag(e);
				break;
			case Z.BOGUS_COMMENT:
				this._stateBogusComment(e);
				break;
			case Z.MARKUP_DECLARATION_OPEN:
				this._stateMarkupDeclarationOpen(e);
				break;
			case Z.COMMENT_START:
				this._stateCommentStart(e);
				break;
			case Z.COMMENT_START_DASH:
				this._stateCommentStartDash(e);
				break;
			case Z.COMMENT:
				this._stateComment(e);
				break;
			case Z.COMMENT_LESS_THAN_SIGN:
				this._stateCommentLessThanSign(e);
				break;
			case Z.COMMENT_LESS_THAN_SIGN_BANG:
				this._stateCommentLessThanSignBang(e);
				break;
			case Z.COMMENT_LESS_THAN_SIGN_BANG_DASH:
				this._stateCommentLessThanSignBangDash(e);
				break;
			case Z.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH:
				this._stateCommentLessThanSignBangDashDash(e);
				break;
			case Z.COMMENT_END_DASH:
				this._stateCommentEndDash(e);
				break;
			case Z.COMMENT_END:
				this._stateCommentEnd(e);
				break;
			case Z.COMMENT_END_BANG:
				this._stateCommentEndBang(e);
				break;
			case Z.DOCTYPE:
				this._stateDoctype(e);
				break;
			case Z.BEFORE_DOCTYPE_NAME:
				this._stateBeforeDoctypeName(e);
				break;
			case Z.DOCTYPE_NAME:
				this._stateDoctypeName(e);
				break;
			case Z.AFTER_DOCTYPE_NAME:
				this._stateAfterDoctypeName(e);
				break;
			case Z.AFTER_DOCTYPE_PUBLIC_KEYWORD:
				this._stateAfterDoctypePublicKeyword(e);
				break;
			case Z.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER:
				this._stateBeforeDoctypePublicIdentifier(e);
				break;
			case Z.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED:
				this._stateDoctypePublicIdentifierDoubleQuoted(e);
				break;
			case Z.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED:
				this._stateDoctypePublicIdentifierSingleQuoted(e);
				break;
			case Z.AFTER_DOCTYPE_PUBLIC_IDENTIFIER:
				this._stateAfterDoctypePublicIdentifier(e);
				break;
			case Z.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS:
				this._stateBetweenDoctypePublicAndSystemIdentifiers(e);
				break;
			case Z.AFTER_DOCTYPE_SYSTEM_KEYWORD:
				this._stateAfterDoctypeSystemKeyword(e);
				break;
			case Z.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER:
				this._stateBeforeDoctypeSystemIdentifier(e);
				break;
			case Z.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED:
				this._stateDoctypeSystemIdentifierDoubleQuoted(e);
				break;
			case Z.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED:
				this._stateDoctypeSystemIdentifierSingleQuoted(e);
				break;
			case Z.AFTER_DOCTYPE_SYSTEM_IDENTIFIER:
				this._stateAfterDoctypeSystemIdentifier(e);
				break;
			case Z.BOGUS_DOCTYPE:
				this._stateBogusDoctype(e);
				break;
			case Z.CDATA_SECTION:
				this._stateCdataSection(e);
				break;
			case Z.CDATA_SECTION_BRACKET:
				this._stateCdataSectionBracket(e);
				break;
			case Z.CDATA_SECTION_END:
				this._stateCdataSectionEnd(e);
				break;
			case Z.CHARACTER_REFERENCE:
				this._stateCharacterReference();
				break;
			case Z.AMBIGUOUS_AMPERSAND:
				this._stateAmbiguousAmpersand(e);
				break;
			default: throw Error("Unknown state");
		}
	}
	_stateData(e) {
		switch (e) {
			case W.LESS_THAN_SIGN:
				this.state = Z.TAG_OPEN;
				break;
			case W.AMPERSAND:
				this._startCharacterReference();
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitCodePoint(e);
				break;
			case W.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateRcdata(e) {
		switch (e) {
			case W.AMPERSAND:
				this._startCharacterReference();
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.RCDATA_LESS_THAN_SIGN;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitChars("�");
				break;
			case W.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateRawtext(e) {
		switch (e) {
			case W.LESS_THAN_SIGN:
				this.state = Z.RAWTEXT_LESS_THAN_SIGN;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitChars("�");
				break;
			case W.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateScriptData(e) {
		switch (e) {
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_LESS_THAN_SIGN;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitChars("�");
				break;
			case W.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_statePlaintext(e) {
		switch (e) {
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitChars("�");
				break;
			case W.EOF:
				this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateTagOpen(e) {
		if (rl(e)) this._createStartTagToken(), this.state = Z.TAG_NAME, this._stateTagName(e);
		else switch (e) {
			case W.EXCLAMATION_MARK:
				this.state = Z.MARKUP_DECLARATION_OPEN;
				break;
			case W.SOLIDUS:
				this.state = Z.END_TAG_OPEN;
				break;
			case W.QUESTION_MARK:
				this._err(G.unexpectedQuestionMarkInsteadOfTagName), this._createCommentToken(1), this.state = Z.BOGUS_COMMENT, this._stateBogusComment(e);
				break;
			case W.EOF:
				this._err(G.eofBeforeTagName), this._emitChars("<"), this._emitEOFToken();
				break;
			default: this._err(G.invalidFirstCharacterOfTagName), this._emitChars("<"), this.state = Z.DATA, this._stateData(e);
		}
	}
	_stateEndTagOpen(e) {
		if (rl(e)) this._createEndTagToken(), this.state = Z.TAG_NAME, this._stateTagName(e);
		else switch (e) {
			case W.GREATER_THAN_SIGN:
				this._err(G.missingEndTagName), this.state = Z.DATA;
				break;
			case W.EOF:
				this._err(G.eofBeforeTagName), this._emitChars("</"), this._emitEOFToken();
				break;
			default: this._err(G.invalidFirstCharacterOfTagName), this._createCommentToken(2), this.state = Z.BOGUS_COMMENT, this._stateBogusComment(e);
		}
	}
	_stateTagName(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this.state = Z.BEFORE_ATTRIBUTE_NAME;
				break;
			case W.SOLIDUS:
				this.state = Z.SELF_CLOSING_START_TAG;
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentTagToken();
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.tagName += "�";
				break;
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: t.tagName += String.fromCodePoint(tl(e) ? al(e) : e);
		}
	}
	_stateRcdataLessThanSign(e) {
		e === W.SOLIDUS ? this.state = Z.RCDATA_END_TAG_OPEN : (this._emitChars("<"), this.state = Z.RCDATA, this._stateRcdata(e));
	}
	_stateRcdataEndTagOpen(e) {
		rl(e) ? (this.state = Z.RCDATA_END_TAG_NAME, this._stateRcdataEndTagName(e)) : (this._emitChars("</"), this.state = Z.RCDATA, this._stateRcdata(e));
	}
	handleSpecialEndTag(e) {
		if (!this.preprocessor.startsWith(this.lastStartTagName, !1)) return !this._ensureHibernation();
		this._createEndTagToken();
		let t = this.currentToken;
		switch (t.tagName = this.lastStartTagName, this.preprocessor.peek(this.lastStartTagName.length)) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: return this._advanceBy(this.lastStartTagName.length), this.state = Z.BEFORE_ATTRIBUTE_NAME, !1;
			case W.SOLIDUS: return this._advanceBy(this.lastStartTagName.length), this.state = Z.SELF_CLOSING_START_TAG, !1;
			case W.GREATER_THAN_SIGN: return this._advanceBy(this.lastStartTagName.length), this.emitCurrentTagToken(), this.state = Z.DATA, !1;
			default: return !this._ensureHibernation();
		}
	}
	_stateRcdataEndTagName(e) {
		this.handleSpecialEndTag(e) && (this._emitChars("</"), this.state = Z.RCDATA, this._stateRcdata(e));
	}
	_stateRawtextLessThanSign(e) {
		e === W.SOLIDUS ? this.state = Z.RAWTEXT_END_TAG_OPEN : (this._emitChars("<"), this.state = Z.RAWTEXT, this._stateRawtext(e));
	}
	_stateRawtextEndTagOpen(e) {
		rl(e) ? (this.state = Z.RAWTEXT_END_TAG_NAME, this._stateRawtextEndTagName(e)) : (this._emitChars("</"), this.state = Z.RAWTEXT, this._stateRawtext(e));
	}
	_stateRawtextEndTagName(e) {
		this.handleSpecialEndTag(e) && (this._emitChars("</"), this.state = Z.RAWTEXT, this._stateRawtext(e));
	}
	_stateScriptDataLessThanSign(e) {
		switch (e) {
			case W.SOLIDUS:
				this.state = Z.SCRIPT_DATA_END_TAG_OPEN;
				break;
			case W.EXCLAMATION_MARK:
				this.state = Z.SCRIPT_DATA_ESCAPE_START, this._emitChars("<!");
				break;
			default: this._emitChars("<"), this.state = Z.SCRIPT_DATA, this._stateScriptData(e);
		}
	}
	_stateScriptDataEndTagOpen(e) {
		rl(e) ? (this.state = Z.SCRIPT_DATA_END_TAG_NAME, this._stateScriptDataEndTagName(e)) : (this._emitChars("</"), this.state = Z.SCRIPT_DATA, this._stateScriptData(e));
	}
	_stateScriptDataEndTagName(e) {
		this.handleSpecialEndTag(e) && (this._emitChars("</"), this.state = Z.SCRIPT_DATA, this._stateScriptData(e));
	}
	_stateScriptDataEscapeStart(e) {
		e === W.HYPHEN_MINUS ? (this.state = Z.SCRIPT_DATA_ESCAPE_START_DASH, this._emitChars("-")) : (this.state = Z.SCRIPT_DATA, this._stateScriptData(e));
	}
	_stateScriptDataEscapeStartDash(e) {
		e === W.HYPHEN_MINUS ? (this.state = Z.SCRIPT_DATA_ESCAPED_DASH_DASH, this._emitChars("-")) : (this.state = Z.SCRIPT_DATA, this._stateScriptData(e));
	}
	_stateScriptDataEscaped(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.SCRIPT_DATA_ESCAPED_DASH, this._emitChars("-");
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitChars("�");
				break;
			case W.EOF:
				this._err(G.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateScriptDataEscapedDash(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.SCRIPT_DATA_ESCAPED_DASH_DASH, this._emitChars("-");
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.state = Z.SCRIPT_DATA_ESCAPED, this._emitChars("�");
				break;
			case W.EOF:
				this._err(G.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
				break;
			default: this.state = Z.SCRIPT_DATA_ESCAPED, this._emitCodePoint(e);
		}
	}
	_stateScriptDataEscapedDashDash(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this._emitChars("-");
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.SCRIPT_DATA, this._emitChars(">");
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.state = Z.SCRIPT_DATA_ESCAPED, this._emitChars("�");
				break;
			case W.EOF:
				this._err(G.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
				break;
			default: this.state = Z.SCRIPT_DATA_ESCAPED, this._emitCodePoint(e);
		}
	}
	_stateScriptDataEscapedLessThanSign(e) {
		e === W.SOLIDUS ? this.state = Z.SCRIPT_DATA_ESCAPED_END_TAG_OPEN : rl(e) ? (this._emitChars("<"), this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPE_START, this._stateScriptDataDoubleEscapeStart(e)) : (this._emitChars("<"), this.state = Z.SCRIPT_DATA_ESCAPED, this._stateScriptDataEscaped(e));
	}
	_stateScriptDataEscapedEndTagOpen(e) {
		rl(e) ? (this.state = Z.SCRIPT_DATA_ESCAPED_END_TAG_NAME, this._stateScriptDataEscapedEndTagName(e)) : (this._emitChars("</"), this.state = Z.SCRIPT_DATA_ESCAPED, this._stateScriptDataEscaped(e));
	}
	_stateScriptDataEscapedEndTagName(e) {
		this.handleSpecialEndTag(e) && (this._emitChars("</"), this.state = Z.SCRIPT_DATA_ESCAPED, this._stateScriptDataEscaped(e));
	}
	_stateScriptDataDoubleEscapeStart(e) {
		if (this.preprocessor.startsWith(Sc.SCRIPT, !1) && sl(this.preprocessor.peek(Sc.SCRIPT.length))) {
			this._emitCodePoint(e);
			for (let e = 0; e < Sc.SCRIPT.length; e++) this._emitCodePoint(this._consume());
			this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED;
		} else this._ensureHibernation() || (this.state = Z.SCRIPT_DATA_ESCAPED, this._stateScriptDataEscaped(e));
	}
	_stateScriptDataDoubleEscaped(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED_DASH, this._emitChars("-");
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN, this._emitChars("<");
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._emitChars("�");
				break;
			case W.EOF:
				this._err(G.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateScriptDataDoubleEscapedDash(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH, this._emitChars("-");
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN, this._emitChars("<");
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED, this._emitChars("�");
				break;
			case W.EOF:
				this._err(G.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
				break;
			default: this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED, this._emitCodePoint(e);
		}
	}
	_stateScriptDataDoubleEscapedDashDash(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this._emitChars("-");
				break;
			case W.LESS_THAN_SIGN:
				this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN, this._emitChars("<");
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.SCRIPT_DATA, this._emitChars(">");
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED, this._emitChars("�");
				break;
			case W.EOF:
				this._err(G.eofInScriptHtmlCommentLikeText), this._emitEOFToken();
				break;
			default: this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED, this._emitCodePoint(e);
		}
	}
	_stateScriptDataDoubleEscapedLessThanSign(e) {
		e === W.SOLIDUS ? (this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPE_END, this._emitChars("/")) : (this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED, this._stateScriptDataDoubleEscaped(e));
	}
	_stateScriptDataDoubleEscapeEnd(e) {
		if (this.preprocessor.startsWith(Sc.SCRIPT, !1) && sl(this.preprocessor.peek(Sc.SCRIPT.length))) {
			this._emitCodePoint(e);
			for (let e = 0; e < Sc.SCRIPT.length; e++) this._emitCodePoint(this._consume());
			this.state = Z.SCRIPT_DATA_ESCAPED;
		} else this._ensureHibernation() || (this.state = Z.SCRIPT_DATA_DOUBLE_ESCAPED, this._stateScriptDataDoubleEscaped(e));
	}
	_stateBeforeAttributeName(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.SOLIDUS:
			case W.GREATER_THAN_SIGN:
			case W.EOF:
				this.state = Z.AFTER_ATTRIBUTE_NAME, this._stateAfterAttributeName(e);
				break;
			case W.EQUALS_SIGN:
				this._err(G.unexpectedEqualsSignBeforeAttributeName), this._createAttr("="), this.state = Z.ATTRIBUTE_NAME;
				break;
			default: this._createAttr(""), this.state = Z.ATTRIBUTE_NAME, this._stateAttributeName(e);
		}
	}
	_stateAttributeName(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
			case W.SOLIDUS:
			case W.GREATER_THAN_SIGN:
			case W.EOF:
				this._leaveAttrName(), this.state = Z.AFTER_ATTRIBUTE_NAME, this._stateAfterAttributeName(e);
				break;
			case W.EQUALS_SIGN:
				this._leaveAttrName(), this.state = Z.BEFORE_ATTRIBUTE_VALUE;
				break;
			case W.QUOTATION_MARK:
			case W.APOSTROPHE:
			case W.LESS_THAN_SIGN:
				this._err(G.unexpectedCharacterInAttributeName), this.currentAttr.name += String.fromCodePoint(e);
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.currentAttr.name += "�";
				break;
			default: this.currentAttr.name += String.fromCodePoint(tl(e) ? al(e) : e);
		}
	}
	_stateAfterAttributeName(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.SOLIDUS:
				this.state = Z.SELF_CLOSING_START_TAG;
				break;
			case W.EQUALS_SIGN:
				this.state = Z.BEFORE_ATTRIBUTE_VALUE;
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentTagToken();
				break;
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: this._createAttr(""), this.state = Z.ATTRIBUTE_NAME, this._stateAttributeName(e);
		}
	}
	_stateBeforeAttributeValue(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.QUOTATION_MARK:
				this.state = Z.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				this.state = Z.ATTRIBUTE_VALUE_SINGLE_QUOTED;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.missingAttributeValue), this.state = Z.DATA, this.emitCurrentTagToken();
				break;
			default: this.state = Z.ATTRIBUTE_VALUE_UNQUOTED, this._stateAttributeValueUnquoted(e);
		}
	}
	_stateAttributeValueDoubleQuoted(e) {
		switch (e) {
			case W.QUOTATION_MARK:
				this.state = Z.AFTER_ATTRIBUTE_VALUE_QUOTED;
				break;
			case W.AMPERSAND:
				this._startCharacterReference();
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.currentAttr.value += "�";
				break;
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: this.currentAttr.value += String.fromCodePoint(e);
		}
	}
	_stateAttributeValueSingleQuoted(e) {
		switch (e) {
			case W.APOSTROPHE:
				this.state = Z.AFTER_ATTRIBUTE_VALUE_QUOTED;
				break;
			case W.AMPERSAND:
				this._startCharacterReference();
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.currentAttr.value += "�";
				break;
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: this.currentAttr.value += String.fromCodePoint(e);
		}
	}
	_stateAttributeValueUnquoted(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this._leaveAttrValue(), this.state = Z.BEFORE_ATTRIBUTE_NAME;
				break;
			case W.AMPERSAND:
				this._startCharacterReference();
				break;
			case W.GREATER_THAN_SIGN:
				this._leaveAttrValue(), this.state = Z.DATA, this.emitCurrentTagToken();
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this.currentAttr.value += "�";
				break;
			case W.QUOTATION_MARK:
			case W.APOSTROPHE:
			case W.LESS_THAN_SIGN:
			case W.EQUALS_SIGN:
			case W.GRAVE_ACCENT:
				this._err(G.unexpectedCharacterInUnquotedAttributeValue), this.currentAttr.value += String.fromCodePoint(e);
				break;
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: this.currentAttr.value += String.fromCodePoint(e);
		}
	}
	_stateAfterAttributeValueQuoted(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this._leaveAttrValue(), this.state = Z.BEFORE_ATTRIBUTE_NAME;
				break;
			case W.SOLIDUS:
				this._leaveAttrValue(), this.state = Z.SELF_CLOSING_START_TAG;
				break;
			case W.GREATER_THAN_SIGN:
				this._leaveAttrValue(), this.state = Z.DATA, this.emitCurrentTagToken();
				break;
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: this._err(G.missingWhitespaceBetweenAttributes), this.state = Z.BEFORE_ATTRIBUTE_NAME, this._stateBeforeAttributeName(e);
		}
	}
	_stateSelfClosingStartTag(e) {
		switch (e) {
			case W.GREATER_THAN_SIGN: {
				let e = this.currentToken;
				e.selfClosing = !0, this.state = Z.DATA, this.emitCurrentTagToken();
				break;
			}
			case W.EOF:
				this._err(G.eofInTag), this._emitEOFToken();
				break;
			default: this._err(G.unexpectedSolidusInTag), this.state = Z.BEFORE_ATTRIBUTE_NAME, this._stateBeforeAttributeName(e);
		}
	}
	_stateBogusComment(e) {
		let t = this.currentToken;
		switch (e) {
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentComment(t);
				break;
			case W.EOF:
				this.emitCurrentComment(t), this._emitEOFToken();
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.data += "�";
				break;
			default: t.data += String.fromCodePoint(e);
		}
	}
	_stateMarkupDeclarationOpen(e) {
		this._consumeSequenceIfMatch(Sc.DASH_DASH, !0) ? (this._createCommentToken(Sc.DASH_DASH.length + 1), this.state = Z.COMMENT_START) : this._consumeSequenceIfMatch(Sc.DOCTYPE, !1) ? (this.currentLocation = this.getCurrentLocation(Sc.DOCTYPE.length + 1), this.state = Z.DOCTYPE) : this._consumeSequenceIfMatch(Sc.CDATA_START, !0) ? this.inForeignNode ? this.state = Z.CDATA_SECTION : (this._err(G.cdataInHtmlContent), this._createCommentToken(Sc.CDATA_START.length + 1), this.currentToken.data = "[CDATA[", this.state = Z.BOGUS_COMMENT) : this._ensureHibernation() || (this._err(G.incorrectlyOpenedComment), this._createCommentToken(2), this.state = Z.BOGUS_COMMENT, this._stateBogusComment(e));
	}
	_stateCommentStart(e) {
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.COMMENT_START_DASH;
				break;
			case W.GREATER_THAN_SIGN: {
				this._err(G.abruptClosingOfEmptyComment), this.state = Z.DATA;
				let e = this.currentToken;
				this.emitCurrentComment(e);
				break;
			}
			default: this.state = Z.COMMENT, this._stateComment(e);
		}
	}
	_stateCommentStartDash(e) {
		let t = this.currentToken;
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.COMMENT_END;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.abruptClosingOfEmptyComment), this.state = Z.DATA, this.emitCurrentComment(t);
				break;
			case W.EOF:
				this._err(G.eofInComment), this.emitCurrentComment(t), this._emitEOFToken();
				break;
			default: t.data += "-", this.state = Z.COMMENT, this._stateComment(e);
		}
	}
	_stateComment(e) {
		let t = this.currentToken;
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.COMMENT_END_DASH;
				break;
			case W.LESS_THAN_SIGN:
				t.data += "<", this.state = Z.COMMENT_LESS_THAN_SIGN;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.data += "�";
				break;
			case W.EOF:
				this._err(G.eofInComment), this.emitCurrentComment(t), this._emitEOFToken();
				break;
			default: t.data += String.fromCodePoint(e);
		}
	}
	_stateCommentLessThanSign(e) {
		let t = this.currentToken;
		switch (e) {
			case W.EXCLAMATION_MARK:
				t.data += "!", this.state = Z.COMMENT_LESS_THAN_SIGN_BANG;
				break;
			case W.LESS_THAN_SIGN:
				t.data += "<";
				break;
			default: this.state = Z.COMMENT, this._stateComment(e);
		}
	}
	_stateCommentLessThanSignBang(e) {
		e === W.HYPHEN_MINUS ? this.state = Z.COMMENT_LESS_THAN_SIGN_BANG_DASH : (this.state = Z.COMMENT, this._stateComment(e));
	}
	_stateCommentLessThanSignBangDash(e) {
		e === W.HYPHEN_MINUS ? this.state = Z.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH : (this.state = Z.COMMENT_END_DASH, this._stateCommentEndDash(e));
	}
	_stateCommentLessThanSignBangDashDash(e) {
		e !== W.GREATER_THAN_SIGN && e !== W.EOF && this._err(G.nestedComment), this.state = Z.COMMENT_END, this._stateCommentEnd(e);
	}
	_stateCommentEndDash(e) {
		let t = this.currentToken;
		switch (e) {
			case W.HYPHEN_MINUS:
				this.state = Z.COMMENT_END;
				break;
			case W.EOF:
				this._err(G.eofInComment), this.emitCurrentComment(t), this._emitEOFToken();
				break;
			default: t.data += "-", this.state = Z.COMMENT, this._stateComment(e);
		}
	}
	_stateCommentEnd(e) {
		let t = this.currentToken;
		switch (e) {
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentComment(t);
				break;
			case W.EXCLAMATION_MARK:
				this.state = Z.COMMENT_END_BANG;
				break;
			case W.HYPHEN_MINUS:
				t.data += "-";
				break;
			case W.EOF:
				this._err(G.eofInComment), this.emitCurrentComment(t), this._emitEOFToken();
				break;
			default: t.data += "--", this.state = Z.COMMENT, this._stateComment(e);
		}
	}
	_stateCommentEndBang(e) {
		let t = this.currentToken;
		switch (e) {
			case W.HYPHEN_MINUS:
				t.data += "--!", this.state = Z.COMMENT_END_DASH;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.incorrectlyClosedComment), this.state = Z.DATA, this.emitCurrentComment(t);
				break;
			case W.EOF:
				this._err(G.eofInComment), this.emitCurrentComment(t), this._emitEOFToken();
				break;
			default: t.data += "--!", this.state = Z.COMMENT, this._stateComment(e);
		}
	}
	_stateDoctype(e) {
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this.state = Z.BEFORE_DOCTYPE_NAME;
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.BEFORE_DOCTYPE_NAME, this._stateBeforeDoctypeName(e);
				break;
			case W.EOF: {
				this._err(G.eofInDoctype), this._createDoctypeToken(null);
				let e = this.currentToken;
				e.forceQuirks = !0, this.emitCurrentDoctype(e), this._emitEOFToken();
				break;
			}
			default: this._err(G.missingWhitespaceBeforeDoctypeName), this.state = Z.BEFORE_DOCTYPE_NAME, this._stateBeforeDoctypeName(e);
		}
	}
	_stateBeforeDoctypeName(e) {
		if (tl(e)) this._createDoctypeToken(String.fromCharCode(al(e))), this.state = Z.DOCTYPE_NAME;
		else switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), this._createDoctypeToken("�"), this.state = Z.DOCTYPE_NAME;
				break;
			case W.GREATER_THAN_SIGN: {
				this._err(G.missingDoctypeName), this._createDoctypeToken(null);
				let e = this.currentToken;
				e.forceQuirks = !0, this.emitCurrentDoctype(e), this.state = Z.DATA;
				break;
			}
			case W.EOF: {
				this._err(G.eofInDoctype), this._createDoctypeToken(null);
				let e = this.currentToken;
				e.forceQuirks = !0, this.emitCurrentDoctype(e), this._emitEOFToken();
				break;
			}
			default: this._createDoctypeToken(String.fromCodePoint(e)), this.state = Z.DOCTYPE_NAME;
		}
	}
	_stateDoctypeName(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this.state = Z.AFTER_DOCTYPE_NAME;
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.name += "�";
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: t.name += String.fromCodePoint(tl(e) ? al(e) : e);
		}
	}
	_stateAfterDoctypeName(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._consumeSequenceIfMatch(Sc.PUBLIC, !1) ? this.state = Z.AFTER_DOCTYPE_PUBLIC_KEYWORD : this._consumeSequenceIfMatch(Sc.SYSTEM, !1) ? this.state = Z.AFTER_DOCTYPE_SYSTEM_KEYWORD : this._ensureHibernation() || (this._err(G.invalidCharacterSequenceAfterDoctypeName), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e));
		}
	}
	_stateAfterDoctypePublicKeyword(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this.state = Z.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER;
				break;
			case W.QUOTATION_MARK:
				this._err(G.missingWhitespaceAfterDoctypePublicKeyword), t.publicId = "", this.state = Z.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				this._err(G.missingWhitespaceAfterDoctypePublicKeyword), t.publicId = "", this.state = Z.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.missingDoctypePublicIdentifier), t.forceQuirks = !0, this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.missingQuoteBeforeDoctypePublicIdentifier), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateBeforeDoctypePublicIdentifier(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.QUOTATION_MARK:
				t.publicId = "", this.state = Z.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				t.publicId = "", this.state = Z.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.missingDoctypePublicIdentifier), t.forceQuirks = !0, this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.missingQuoteBeforeDoctypePublicIdentifier), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateDoctypePublicIdentifierDoubleQuoted(e) {
		let t = this.currentToken;
		switch (e) {
			case W.QUOTATION_MARK:
				this.state = Z.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.publicId += "�";
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.abruptDoctypePublicIdentifier), t.forceQuirks = !0, this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: t.publicId += String.fromCodePoint(e);
		}
	}
	_stateDoctypePublicIdentifierSingleQuoted(e) {
		let t = this.currentToken;
		switch (e) {
			case W.APOSTROPHE:
				this.state = Z.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.publicId += "�";
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.abruptDoctypePublicIdentifier), t.forceQuirks = !0, this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: t.publicId += String.fromCodePoint(e);
		}
	}
	_stateAfterDoctypePublicIdentifier(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this.state = Z.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS;
				break;
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.QUOTATION_MARK:
				this._err(G.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers), t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				this._err(G.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers), t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.missingQuoteBeforeDoctypeSystemIdentifier), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateBetweenDoctypePublicAndSystemIdentifiers(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.GREATER_THAN_SIGN:
				this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.QUOTATION_MARK:
				t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.missingQuoteBeforeDoctypeSystemIdentifier), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateAfterDoctypeSystemKeyword(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED:
				this.state = Z.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER;
				break;
			case W.QUOTATION_MARK:
				this._err(G.missingWhitespaceAfterDoctypeSystemKeyword), t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				this._err(G.missingWhitespaceAfterDoctypeSystemKeyword), t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.missingDoctypeSystemIdentifier), t.forceQuirks = !0, this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.missingQuoteBeforeDoctypeSystemIdentifier), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateBeforeDoctypeSystemIdentifier(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.QUOTATION_MARK:
				t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED;
				break;
			case W.APOSTROPHE:
				t.systemId = "", this.state = Z.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED;
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.missingDoctypeSystemIdentifier), t.forceQuirks = !0, this.state = Z.DATA, this.emitCurrentDoctype(t);
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.missingQuoteBeforeDoctypeSystemIdentifier), t.forceQuirks = !0, this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateDoctypeSystemIdentifierDoubleQuoted(e) {
		let t = this.currentToken;
		switch (e) {
			case W.QUOTATION_MARK:
				this.state = Z.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.systemId += "�";
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.abruptDoctypeSystemIdentifier), t.forceQuirks = !0, this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: t.systemId += String.fromCodePoint(e);
		}
	}
	_stateDoctypeSystemIdentifierSingleQuoted(e) {
		let t = this.currentToken;
		switch (e) {
			case W.APOSTROPHE:
				this.state = Z.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter), t.systemId += "�";
				break;
			case W.GREATER_THAN_SIGN:
				this._err(G.abruptDoctypeSystemIdentifier), t.forceQuirks = !0, this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: t.systemId += String.fromCodePoint(e);
		}
	}
	_stateAfterDoctypeSystemIdentifier(e) {
		let t = this.currentToken;
		switch (e) {
			case W.SPACE:
			case W.LINE_FEED:
			case W.TABULATION:
			case W.FORM_FEED: break;
			case W.GREATER_THAN_SIGN:
				this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.EOF:
				this._err(G.eofInDoctype), t.forceQuirks = !0, this.emitCurrentDoctype(t), this._emitEOFToken();
				break;
			default: this._err(G.unexpectedCharacterAfterDoctypeSystemIdentifier), this.state = Z.BOGUS_DOCTYPE, this._stateBogusDoctype(e);
		}
	}
	_stateBogusDoctype(e) {
		let t = this.currentToken;
		switch (e) {
			case W.GREATER_THAN_SIGN:
				this.emitCurrentDoctype(t), this.state = Z.DATA;
				break;
			case W.NULL:
				this._err(G.unexpectedNullCharacter);
				break;
			case W.EOF: this.emitCurrentDoctype(t), this._emitEOFToken();
		}
	}
	_stateCdataSection(e) {
		switch (e) {
			case W.RIGHT_SQUARE_BRACKET:
				this.state = Z.CDATA_SECTION_BRACKET;
				break;
			case W.EOF:
				this._err(G.eofInCdata), this._emitEOFToken();
				break;
			default: this._emitCodePoint(e);
		}
	}
	_stateCdataSectionBracket(e) {
		e === W.RIGHT_SQUARE_BRACKET ? this.state = Z.CDATA_SECTION_END : (this._emitChars("]"), this.state = Z.CDATA_SECTION, this._stateCdataSection(e));
	}
	_stateCdataSectionEnd(e) {
		switch (e) {
			case W.GREATER_THAN_SIGN:
				this.state = Z.DATA;
				break;
			case W.RIGHT_SQUARE_BRACKET:
				this._emitChars("]");
				break;
			default: this._emitChars("]]"), this.state = Z.CDATA_SECTION, this._stateCdataSection(e);
		}
	}
	_stateCharacterReference() {
		let e = this.entityDecoder.write(this.preprocessor.html, this.preprocessor.pos);
		if (e < 0) {
			if (this.preprocessor.lastChunkWritten) e = this.entityDecoder.end();
			else {
				this.active = !1, this.preprocessor.pos = this.preprocessor.html.length - 1, this.consumedAfterSnapshot = 0, this.preprocessor.endOfChunkHit = !0;
				return;
			}
		}
		e === 0 ? (this.preprocessor.pos = this.entityStartPos, this._flushCodePointConsumedAsCharacterReference(W.AMPERSAND), this.state = !this._isCharacterReferenceInAttribute() && il(this.preprocessor.peek(1)) ? Z.AMBIGUOUS_AMPERSAND : this.returnState) : this.state = this.returnState;
	}
	_stateAmbiguousAmpersand(e) {
		il(e) ? this._flushCodePointConsumedAsCharacterReference(e) : (e === W.SEMICOLON && this._err(G.unknownNamedCharacterReference), this.state = this.returnState, this._callState(e));
	}
}, ul = /* @__PURE__ */ new Set([
	Y.DD,
	Y.DT,
	Y.LI,
	Y.OPTGROUP,
	Y.OPTION,
	Y.P,
	Y.RB,
	Y.RP,
	Y.RT,
	Y.RTC
]), dl = /* @__PURE__ */ new Set([
	...ul,
	Y.CAPTION,
	Y.COLGROUP,
	Y.TBODY,
	Y.TD,
	Y.TFOOT,
	Y.TH,
	Y.THEAD,
	Y.TR
]), fl = /* @__PURE__ */ new Set([
	Y.APPLET,
	Y.CAPTION,
	Y.HTML,
	Y.MARQUEE,
	Y.OBJECT,
	Y.TABLE,
	Y.TD,
	Y.TEMPLATE,
	Y.TH
]), pl = /* @__PURE__ */ new Set([
	...fl,
	Y.OL,
	Y.UL
]), ml = /* @__PURE__ */ new Set([...fl, Y.BUTTON]), hl = /* @__PURE__ */ new Set([
	Y.ANNOTATION_XML,
	Y.MI,
	Y.MN,
	Y.MO,
	Y.MS,
	Y.MTEXT
]), gl = /* @__PURE__ */ new Set([
	Y.DESC,
	Y.FOREIGN_OBJECT,
	Y.TITLE
]), _l = /* @__PURE__ */ new Set([
	Y.TR,
	Y.TEMPLATE,
	Y.HTML
]), vl = /* @__PURE__ */ new Set([
	Y.TBODY,
	Y.TFOOT,
	Y.THEAD,
	Y.TEMPLATE,
	Y.HTML
]), yl = /* @__PURE__ */ new Set([
	Y.TABLE,
	Y.TEMPLATE,
	Y.HTML
]), bl = /* @__PURE__ */ new Set([Y.TD, Y.TH]), xl = class {
	get currentTmplContentOrNode() {
		return this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : this.current;
	}
	constructor(e, t, n) {
		this.treeAdapter = t, this.handler = n, this.items = [], this.tagIDs = [], this.stackTop = -1, this.tmplCount = 0, this.currentTagId = Y.UNKNOWN, this.current = e;
	}
	_indexOf(e) {
		return this.items.lastIndexOf(e, this.stackTop);
	}
	_isInTemplate() {
		return this.currentTagId === Y.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === q.HTML;
	}
	_updateCurrentElement() {
		this.current = this.items[this.stackTop], this.currentTagId = this.tagIDs[this.stackTop];
	}
	push(e, t) {
		this.stackTop++, this.items[this.stackTop] = e, this.current = e, this.tagIDs[this.stackTop] = t, this.currentTagId = t, this._isInTemplate() && this.tmplCount++, this.handler.onItemPush(e, t, !0);
	}
	pop() {
		let e = this.current;
		this.tmplCount > 0 && this._isInTemplate() && this.tmplCount--, this.stackTop--, this._updateCurrentElement(), this.handler.onItemPop(e, !0);
	}
	replace(e, t) {
		let n = this._indexOf(e);
		this.items[n] = t, n === this.stackTop && (this.current = t);
	}
	insertAfter(e, t, n) {
		let r = this._indexOf(e) + 1;
		this.items.splice(r, 0, t), this.tagIDs.splice(r, 0, n), this.stackTop++, r === this.stackTop && this._updateCurrentElement(), this.current && this.currentTagId !== void 0 && this.handler.onItemPush(this.current, this.currentTagId, r === this.stackTop);
	}
	popUntilTagNamePopped(e) {
		let t = this.stackTop + 1;
		do
			t = this.tagIDs.lastIndexOf(e, t - 1);
		while (t > 0 && this.treeAdapter.getNamespaceURI(this.items[t]) !== q.HTML);
		this.shortenToLength(Math.max(t, 0));
	}
	shortenToLength(e) {
		for (; this.stackTop >= e;) {
			let t = this.current;
			this.tmplCount > 0 && this._isInTemplate() && --this.tmplCount, this.stackTop--, this._updateCurrentElement(), this.handler.onItemPop(t, this.stackTop < e);
		}
	}
	popUntilElementPopped(e) {
		let t = this._indexOf(e);
		this.shortenToLength(Math.max(t, 0));
	}
	popUntilPopped(e, t) {
		let n = this._indexOfTagNames(e, t);
		this.shortenToLength(Math.max(n, 0));
	}
	popUntilNumberedHeaderPopped() {
		this.popUntilPopped(Xc, q.HTML);
	}
	popUntilTableCellPopped() {
		this.popUntilPopped(bl, q.HTML);
	}
	popAllUpToHtmlElement() {
		this.tmplCount = 0, this.shortenToLength(1);
	}
	_indexOfTagNames(e, t) {
		for (let n = this.stackTop; n >= 0; n--) if (e.has(this.tagIDs[n]) && this.treeAdapter.getNamespaceURI(this.items[n]) === t) return n;
		return -1;
	}
	clearBackTo(e, t) {
		let n = this._indexOfTagNames(e, t);
		this.shortenToLength(n + 1);
	}
	clearBackToTableContext() {
		this.clearBackTo(yl, q.HTML);
	}
	clearBackToTableBodyContext() {
		this.clearBackTo(vl, q.HTML);
	}
	clearBackToTableRowContext() {
		this.clearBackTo(_l, q.HTML);
	}
	remove(e) {
		let t = this._indexOf(e);
		t >= 0 && (t === this.stackTop ? this.pop() : (this.items.splice(t, 1), this.tagIDs.splice(t, 1), this.stackTop--, this._updateCurrentElement(), this.handler.onItemPop(e, !1)));
	}
	tryPeekProperlyNestedBodyElement() {
		return this.stackTop >= 1 && this.tagIDs[1] === Y.BODY ? this.items[1] : null;
	}
	contains(e) {
		return this._indexOf(e) > -1;
	}
	getCommonAncestor(e) {
		let t = this._indexOf(e) - 1;
		return t >= 0 ? this.items[t] : null;
	}
	isRootHtmlElementCurrent() {
		return this.stackTop === 0 && this.tagIDs[0] === Y.HTML;
	}
	hasInDynamicScope(e, t) {
		for (let n = this.stackTop; n >= 0; n--) {
			let r = this.tagIDs[n];
			switch (this.treeAdapter.getNamespaceURI(this.items[n])) {
				case q.HTML:
					if (r === e) return !0;
					if (t.has(r)) return !1;
					break;
				case q.SVG:
					if (gl.has(r)) return !1;
					break;
				case q.MATHML: if (hl.has(r)) return !1;
			}
		}
		return !0;
	}
	hasInScope(e) {
		return this.hasInDynamicScope(e, fl);
	}
	hasInListItemScope(e) {
		return this.hasInDynamicScope(e, pl);
	}
	hasInButtonScope(e) {
		return this.hasInDynamicScope(e, ml);
	}
	hasNumberedHeaderInScope() {
		for (let e = this.stackTop; e >= 0; e--) {
			let t = this.tagIDs[e];
			switch (this.treeAdapter.getNamespaceURI(this.items[e])) {
				case q.HTML:
					if (Xc.has(t)) return !0;
					if (fl.has(t)) return !1;
					break;
				case q.SVG:
					if (gl.has(t)) return !1;
					break;
				case q.MATHML: if (hl.has(t)) return !1;
			}
		}
		return !0;
	}
	hasInTableScope(e) {
		for (let t = this.stackTop; t >= 0; t--) if (this.treeAdapter.getNamespaceURI(this.items[t]) === q.HTML) switch (this.tagIDs[t]) {
			case e: return !0;
			case Y.TABLE:
			case Y.HTML: return !1;
		}
		return !0;
	}
	hasTableBodyContextInTableScope() {
		for (let e = this.stackTop; e >= 0; e--) if (this.treeAdapter.getNamespaceURI(this.items[e]) === q.HTML) switch (this.tagIDs[e]) {
			case Y.TBODY:
			case Y.THEAD:
			case Y.TFOOT: return !0;
			case Y.TABLE:
			case Y.HTML: return !1;
		}
		return !0;
	}
	hasInSelectScope(e) {
		for (let t = this.stackTop; t >= 0; t--) if (this.treeAdapter.getNamespaceURI(this.items[t]) === q.HTML) switch (this.tagIDs[t]) {
			case e: return !0;
			case Y.OPTION:
			case Y.OPTGROUP: break;
			default: return !1;
		}
		return !0;
	}
	generateImpliedEndTags() {
		for (; this.currentTagId !== void 0 && ul.has(this.currentTagId);) this.pop();
	}
	generateImpliedEndTagsThoroughly() {
		for (; this.currentTagId !== void 0 && dl.has(this.currentTagId);) this.pop();
	}
	generateImpliedEndTagsWithExclusion(e) {
		for (; this.currentTagId !== void 0 && this.currentTagId !== e && dl.has(this.currentTagId);) this.pop();
	}
}, Sl = 3, Cl;
(function(e) {
	e[e.Marker = 0] = "Marker", e[e.Element = 1] = "Element";
})(Cl ||= {});
var wl = { type: Cl.Marker }, Tl = class {
	constructor(e) {
		this.treeAdapter = e, this.entries = [], this.bookmark = null;
	}
	_getNoahArkConditionCandidates(e, t) {
		let n = [], r = t.length, i = this.treeAdapter.getTagName(e), a = this.treeAdapter.getNamespaceURI(e);
		for (let e = 0; e < this.entries.length; e++) {
			let t = this.entries[e];
			if (t.type === Cl.Marker) break;
			let { element: o } = t;
			if (this.treeAdapter.getTagName(o) === i && this.treeAdapter.getNamespaceURI(o) === a) {
				let t = this.treeAdapter.getAttrList(o);
				t.length === r && n.push({
					idx: e,
					attrs: t
				});
			}
		}
		return n;
	}
	_ensureNoahArkCondition(e) {
		if (this.entries.length < Sl) return;
		let t = this.treeAdapter.getAttrList(e), n = this._getNoahArkConditionCandidates(e, t);
		if (n.length < Sl) return;
		let r = new Map(t.map((e) => [e.name, e.value])), i = 0;
		for (let e = 0; e < n.length; e++) {
			let t = n[e];
			t.attrs.every((e) => r.get(e.name) === e.value) && (i += 1, i >= Sl && this.entries.splice(t.idx, 1));
		}
	}
	insertMarker() {
		this.entries.unshift(wl);
	}
	pushElement(e, t) {
		this._ensureNoahArkCondition(e), this.entries.unshift({
			type: Cl.Element,
			element: e,
			token: t
		});
	}
	insertElementAfterBookmark(e, t) {
		let n = this.entries.indexOf(this.bookmark);
		this.entries.splice(n, 0, {
			type: Cl.Element,
			element: e,
			token: t
		});
	}
	removeEntry(e) {
		let t = this.entries.indexOf(e);
		t !== -1 && this.entries.splice(t, 1);
	}
	clearToLastMarker() {
		let e = this.entries.indexOf(wl);
		e === -1 ? this.entries.length = 0 : this.entries.splice(0, e + 1);
	}
	getElementEntryInScopeWithTagName(e) {
		let t = this.entries.find((t) => t.type === Cl.Marker || this.treeAdapter.getTagName(t.element) === e);
		return t && t.type === Cl.Element ? t : null;
	}
	getElementEntry(e) {
		return this.entries.find((t) => t.type === Cl.Element && t.element === e);
	}
}, El = {
	createDocument() {
		return {
			nodeName: "#document",
			mode: Kc.NO_QUIRKS,
			childNodes: []
		};
	},
	createDocumentFragment() {
		return {
			nodeName: "#document-fragment",
			childNodes: []
		};
	},
	createElement(e, t, n) {
		return {
			nodeName: e,
			tagName: e,
			attrs: n,
			namespaceURI: t,
			childNodes: [],
			parentNode: null
		};
	},
	createCommentNode(e) {
		return {
			nodeName: "#comment",
			data: e,
			parentNode: null
		};
	},
	createTextNode(e) {
		return {
			nodeName: "#text",
			value: e,
			parentNode: null
		};
	},
	appendChild(e, t) {
		e.childNodes.push(t), t.parentNode = e;
	},
	insertBefore(e, t, n) {
		let r = e.childNodes.indexOf(n);
		e.childNodes.splice(r, 0, t), t.parentNode = e;
	},
	setTemplateContent(e, t) {
		e.content = t;
	},
	getTemplateContent(e) {
		return e.content;
	},
	setDocumentType(e, t, n, r) {
		let i = e.childNodes.find((e) => e.nodeName === "#documentType");
		if (i) i.name = t, i.publicId = n, i.systemId = r;
		else {
			let i = {
				nodeName: "#documentType",
				name: t,
				publicId: n,
				systemId: r,
				parentNode: null
			};
			El.appendChild(e, i);
		}
	},
	setDocumentMode(e, t) {
		e.mode = t;
	},
	getDocumentMode(e) {
		return e.mode;
	},
	detachNode(e) {
		if (e.parentNode) {
			let t = e.parentNode.childNodes.indexOf(e);
			e.parentNode.childNodes.splice(t, 1), e.parentNode = null;
		}
	},
	insertText(e, t) {
		if (e.childNodes.length > 0) {
			let n = e.childNodes[e.childNodes.length - 1];
			if (El.isTextNode(n)) {
				n.value += t;
				return;
			}
		}
		El.appendChild(e, El.createTextNode(t));
	},
	insertTextBefore(e, t, n) {
		let r = e.childNodes[e.childNodes.indexOf(n) - 1];
		r && El.isTextNode(r) ? r.value += t : El.insertBefore(e, El.createTextNode(t), n);
	},
	adoptAttributes(e, t) {
		let n = new Set(e.attrs.map((e) => e.name));
		for (let r = 0; r < t.length; r++) n.has(t[r].name) || e.attrs.push(t[r]);
	},
	getFirstChild(e) {
		return e.childNodes[0];
	},
	getChildNodes(e) {
		return e.childNodes;
	},
	getParentNode(e) {
		return e.parentNode;
	},
	getAttrList(e) {
		return e.attrs;
	},
	getTagName(e) {
		return e.tagName;
	},
	getNamespaceURI(e) {
		return e.namespaceURI;
	},
	getTextNodeContent(e) {
		return e.value;
	},
	getCommentNodeContent(e) {
		return e.data;
	},
	getDocumentTypeNodeName(e) {
		return e.name;
	},
	getDocumentTypeNodePublicId(e) {
		return e.publicId;
	},
	getDocumentTypeNodeSystemId(e) {
		return e.systemId;
	},
	isTextNode(e) {
		return e.nodeName === "#text";
	},
	isCommentNode(e) {
		return e.nodeName === "#comment";
	},
	isDocumentTypeNode(e) {
		return e.nodeName === "#documentType";
	},
	isElementNode(e) {
		return Object.prototype.hasOwnProperty.call(e, "tagName");
	},
	setNodeSourceCodeLocation(e, t) {
		e.sourceCodeLocation = t;
	},
	getNodeSourceCodeLocation(e) {
		return e.sourceCodeLocation;
	},
	updateNodeSourceCodeLocation(e, t) {
		e.sourceCodeLocation = {
			...e.sourceCodeLocation,
			...t
		};
	}
}, Dl = "html", Ol = "about:legacy-compat", kl = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd", Al = /* @__PURE__ */ "+//silmaril//dtd html pro v0r11 19970101//,-//as//dtd html 3.0 aswedit + extensions//,-//advasoft ltd//dtd html 3.0 aswedit + extensions//,-//ietf//dtd html 2.0 level 1//,-//ietf//dtd html 2.0 level 2//,-//ietf//dtd html 2.0 strict level 1//,-//ietf//dtd html 2.0 strict level 2//,-//ietf//dtd html 2.0 strict//,-//ietf//dtd html 2.0//,-//ietf//dtd html 2.1e//,-//ietf//dtd html 3.0//,-//ietf//dtd html 3.2 final//,-//ietf//dtd html 3.2//,-//ietf//dtd html 3//,-//ietf//dtd html level 0//,-//ietf//dtd html level 1//,-//ietf//dtd html level 2//,-//ietf//dtd html level 3//,-//ietf//dtd html strict level 0//,-//ietf//dtd html strict level 1//,-//ietf//dtd html strict level 2//,-//ietf//dtd html strict level 3//,-//ietf//dtd html strict//,-//ietf//dtd html//,-//metrius//dtd metrius presentational//,-//microsoft//dtd internet explorer 2.0 html strict//,-//microsoft//dtd internet explorer 2.0 html//,-//microsoft//dtd internet explorer 2.0 tables//,-//microsoft//dtd internet explorer 3.0 html strict//,-//microsoft//dtd internet explorer 3.0 html//,-//microsoft//dtd internet explorer 3.0 tables//,-//netscape comm. corp.//dtd html//,-//netscape comm. corp.//dtd strict html//,-//o'reilly and associates//dtd html 2.0//,-//o'reilly and associates//dtd html extended 1.0//,-//o'reilly and associates//dtd html extended relaxed 1.0//,-//sq//dtd html 2.0 hotmetal + extensions//,-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//,-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//,-//spyglass//dtd html 2.0 extended//,-//sun microsystems corp.//dtd hotjava html//,-//sun microsystems corp.//dtd hotjava strict html//,-//w3c//dtd html 3 1995-03-24//,-//w3c//dtd html 3.2 draft//,-//w3c//dtd html 3.2 final//,-//w3c//dtd html 3.2//,-//w3c//dtd html 3.2s draft//,-//w3c//dtd html 4.0 frameset//,-//w3c//dtd html 4.0 transitional//,-//w3c//dtd html experimental 19960712//,-//w3c//dtd html experimental 970421//,-//w3c//dtd w3 html//,-//w3o//dtd w3 html 3.0//,-//webtechs//dtd mozilla html 2.0//,-//webtechs//dtd mozilla html//".split(","), jl = [
	...Al,
	"-//w3c//dtd html 4.01 frameset//",
	"-//w3c//dtd html 4.01 transitional//"
], Ml = /* @__PURE__ */ new Set([
	"-//w3o//dtd w3 html strict 3.0//en//",
	"-/w3c/dtd html 4.0 transitional/en",
	"html"
]), Nl = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"], Pl = [
	...Nl,
	"-//w3c//dtd html 4.01 frameset//",
	"-//w3c//dtd html 4.01 transitional//"
];
function Fl(e, t) {
	return t.some((t) => e.startsWith(t));
}
function Il(e) {
	return e.name === Dl && e.publicId === null && (e.systemId === null || e.systemId === Ol);
}
function Ll(e) {
	if (e.name !== Dl) return Kc.QUIRKS;
	let { systemId: t } = e;
	if (t && t.toLowerCase() === kl) return Kc.QUIRKS;
	let { publicId: n } = e;
	if (n !== null) {
		if (n = n.toLowerCase(), Ml.has(n)) return Kc.QUIRKS;
		let e = t === null ? jl : Al;
		if (Fl(n, e)) return Kc.QUIRKS;
		if (e = t === null ? Nl : Pl, Fl(n, e)) return Kc.LIMITED_QUIRKS;
	}
	return Kc.NO_QUIRKS;
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/common/foreign-content.js
var Rl = {
	TEXT_HTML: "text/html",
	APPLICATION_XML: "application/xhtml+xml"
}, zl = "definitionurl", Bl = "definitionURL", Vl = new Map((/* @__PURE__ */ "attributeName.attributeType.baseFrequency.baseProfile.calcMode.clipPathUnits.diffuseConstant.edgeMode.filterUnits.glyphRef.gradientTransform.gradientUnits.kernelMatrix.kernelUnitLength.keyPoints.keySplines.keyTimes.lengthAdjust.limitingConeAngle.markerHeight.markerUnits.markerWidth.maskContentUnits.maskUnits.numOctaves.pathLength.patternContentUnits.patternTransform.patternUnits.pointsAtX.pointsAtY.pointsAtZ.preserveAlpha.preserveAspectRatio.primitiveUnits.refX.refY.repeatCount.repeatDur.requiredExtensions.requiredFeatures.specularConstant.specularExponent.spreadMethod.startOffset.stdDeviation.stitchTiles.surfaceScale.systemLanguage.tableValues.targetX.targetY.textLength.viewBox.viewTarget.xChannelSelector.yChannelSelector.zoomAndPan".split(".")).map((e) => [e.toLowerCase(), e])), Hl = /* @__PURE__ */ new Map([
	["xlink:actuate", {
		prefix: "xlink",
		name: "actuate",
		namespace: q.XLINK
	}],
	["xlink:arcrole", {
		prefix: "xlink",
		name: "arcrole",
		namespace: q.XLINK
	}],
	["xlink:href", {
		prefix: "xlink",
		name: "href",
		namespace: q.XLINK
	}],
	["xlink:role", {
		prefix: "xlink",
		name: "role",
		namespace: q.XLINK
	}],
	["xlink:show", {
		prefix: "xlink",
		name: "show",
		namespace: q.XLINK
	}],
	["xlink:title", {
		prefix: "xlink",
		name: "title",
		namespace: q.XLINK
	}],
	["xlink:type", {
		prefix: "xlink",
		name: "type",
		namespace: q.XLINK
	}],
	["xml:lang", {
		prefix: "xml",
		name: "lang",
		namespace: q.XML
	}],
	["xml:space", {
		prefix: "xml",
		name: "space",
		namespace: q.XML
	}],
	["xmlns", {
		prefix: "",
		name: "xmlns",
		namespace: q.XMLNS
	}],
	["xmlns:xlink", {
		prefix: "xmlns",
		name: "xlink",
		namespace: q.XMLNS
	}]
]), Ul = new Map((/* @__PURE__ */ "altGlyph.altGlyphDef.altGlyphItem.animateColor.animateMotion.animateTransform.clipPath.feBlend.feColorMatrix.feComponentTransfer.feComposite.feConvolveMatrix.feDiffuseLighting.feDisplacementMap.feDistantLight.feFlood.feFuncA.feFuncB.feFuncG.feFuncR.feGaussianBlur.feImage.feMerge.feMergeNode.feMorphology.feOffset.fePointLight.feSpecularLighting.feSpotLight.feTile.feTurbulence.foreignObject.glyphRef.linearGradient.radialGradient.textPath".split(".")).map((e) => [e.toLowerCase(), e])), Wl = /* @__PURE__ */ new Set([
	Y.B,
	Y.BIG,
	Y.BLOCKQUOTE,
	Y.BODY,
	Y.BR,
	Y.CENTER,
	Y.CODE,
	Y.DD,
	Y.DIV,
	Y.DL,
	Y.DT,
	Y.EM,
	Y.EMBED,
	Y.H1,
	Y.H2,
	Y.H3,
	Y.H4,
	Y.H5,
	Y.H6,
	Y.HEAD,
	Y.HR,
	Y.I,
	Y.IMG,
	Y.LI,
	Y.LISTING,
	Y.MENU,
	Y.META,
	Y.NOBR,
	Y.OL,
	Y.P,
	Y.PRE,
	Y.RUBY,
	Y.S,
	Y.SMALL,
	Y.SPAN,
	Y.STRONG,
	Y.STRIKE,
	Y.SUB,
	Y.SUP,
	Y.TABLE,
	Y.TT,
	Y.U,
	Y.UL,
	Y.VAR
]);
function Gl(e) {
	let t = e.tagID;
	return t === Y.FONT && e.attrs.some(({ name: e }) => e === Gc.COLOR || e === Gc.SIZE || e === Gc.FACE) || Wl.has(t);
}
function Kl(e) {
	for (let t = 0; t < e.attrs.length; t++) if (e.attrs[t].name === zl) {
		e.attrs[t].name = Bl;
		break;
	}
}
function ql(e) {
	for (let t = 0; t < e.attrs.length; t++) {
		let n = Vl.get(e.attrs[t].name);
		n != null && (e.attrs[t].name = n);
	}
}
function Jl(e) {
	for (let t = 0; t < e.attrs.length; t++) {
		let n = Hl.get(e.attrs[t].name);
		n && (e.attrs[t].prefix = n.prefix, e.attrs[t].name = n.name, e.attrs[t].namespace = n.namespace);
	}
}
function Yl(e) {
	let t = Ul.get(e.tagName);
	t != null && (e.tagName = t, e.tagID = Jc(e.tagName));
}
function Xl(e, t) {
	return t === q.MATHML && (e === Y.MI || e === Y.MO || e === Y.MN || e === Y.MS || e === Y.MTEXT);
}
function Zl(e, t, n) {
	if (t === q.MATHML && e === Y.ANNOTATION_XML) {
		for (let e = 0; e < n.length; e++) if (n[e].name === Gc.ENCODING) {
			let t = n[e].value.toLowerCase();
			return t === Rl.TEXT_HTML || t === Rl.APPLICATION_XML;
		}
	}
	return t === q.SVG && (e === Y.FOREIGN_OBJECT || e === Y.DESC || e === Y.TITLE);
}
function Ql(e, t, n, r) {
	return (!r || r === q.HTML) && Zl(e, t, n) || (!r || r === q.MATHML) && Xl(e, t);
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/parser/index.js
var $l = "hidden", eu = 8, tu = 3, Q;
(function(e) {
	e[e.INITIAL = 0] = "INITIAL", e[e.BEFORE_HTML = 1] = "BEFORE_HTML", e[e.BEFORE_HEAD = 2] = "BEFORE_HEAD", e[e.IN_HEAD = 3] = "IN_HEAD", e[e.IN_HEAD_NO_SCRIPT = 4] = "IN_HEAD_NO_SCRIPT", e[e.AFTER_HEAD = 5] = "AFTER_HEAD", e[e.IN_BODY = 6] = "IN_BODY", e[e.TEXT = 7] = "TEXT", e[e.IN_TABLE = 8] = "IN_TABLE", e[e.IN_TABLE_TEXT = 9] = "IN_TABLE_TEXT", e[e.IN_CAPTION = 10] = "IN_CAPTION", e[e.IN_COLUMN_GROUP = 11] = "IN_COLUMN_GROUP", e[e.IN_TABLE_BODY = 12] = "IN_TABLE_BODY", e[e.IN_ROW = 13] = "IN_ROW", e[e.IN_CELL = 14] = "IN_CELL", e[e.IN_SELECT = 15] = "IN_SELECT", e[e.IN_SELECT_IN_TABLE = 16] = "IN_SELECT_IN_TABLE", e[e.IN_TEMPLATE = 17] = "IN_TEMPLATE", e[e.AFTER_BODY = 18] = "AFTER_BODY", e[e.IN_FRAMESET = 19] = "IN_FRAMESET", e[e.AFTER_FRAMESET = 20] = "AFTER_FRAMESET", e[e.AFTER_AFTER_BODY = 21] = "AFTER_AFTER_BODY", e[e.AFTER_AFTER_FRAMESET = 22] = "AFTER_AFTER_FRAMESET";
})(Q ||= {});
var nu = {
	startLine: -1,
	startCol: -1,
	startOffset: -1,
	endLine: -1,
	endCol: -1,
	endOffset: -1
}, ru = /* @__PURE__ */ new Set([
	Y.TABLE,
	Y.TBODY,
	Y.TFOOT,
	Y.THEAD,
	Y.TR
]), iu = {
	scriptingEnabled: !0,
	sourceCodeLocationInfo: !1,
	treeAdapter: El,
	onParseError: null
}, au = class {
	constructor(e, t, n = null, r = null) {
		this.fragmentContext = n, this.scriptHandler = r, this.currentToken = null, this.stopped = !1, this.insertionMode = Q.INITIAL, this.originalInsertionMode = Q.INITIAL, this.headElement = null, this.formElement = null, this.currentNotInHTML = !1, this.tmplInsertionModeStack = [], this.pendingCharacterTokens = [], this.hasNonWhitespacePendingCharacterToken = !1, this.framesetOk = !0, this.skipNextNewLine = !1, this.fosterParentingEnabled = !1, this.options = {
			...iu,
			...e
		}, this.treeAdapter = this.options.treeAdapter, this.onParseError = this.options.onParseError, this.onParseError && (this.options.sourceCodeLocationInfo = !0), this.document = t ?? this.treeAdapter.createDocument(), this.tokenizer = new ll(this.options, this), this.activeFormattingElements = new Tl(this.treeAdapter), this.fragmentContextID = n ? Jc(this.treeAdapter.getTagName(n)) : Y.UNKNOWN, this._setContextModes(n ?? this.document, this.fragmentContextID), this.openElements = new xl(this.document, this.treeAdapter, this);
	}
	static parse(e, t) {
		let n = new this(t);
		return n.tokenizer.write(e, !0), n.document;
	}
	static getFragmentParser(e, t) {
		let n = {
			...iu,
			...t
		};
		e ??= n.treeAdapter.createElement(J.TEMPLATE, q.HTML, []);
		let r = n.treeAdapter.createElement("documentmock", q.HTML, []), i = new this(n, r, e);
		return i.fragmentContextID === Y.TEMPLATE && i.tmplInsertionModeStack.unshift(Q.IN_TEMPLATE), i._initTokenizerForFragmentParsing(), i._insertFakeRootElement(), i._resetInsertionMode(), i._findFormInFragmentContext(), i;
	}
	getFragment() {
		let e = this.treeAdapter.getFirstChild(this.document), t = this.treeAdapter.createDocumentFragment();
		return this._adoptNodes(e, t), t;
	}
	_err(e, t, n) {
		if (!this.onParseError) return;
		let r = e.location ?? nu, i = {
			code: t,
			startLine: r.startLine,
			startCol: r.startCol,
			startOffset: r.startOffset,
			endLine: n ? r.startLine : r.endLine,
			endCol: n ? r.startCol : r.endCol,
			endOffset: n ? r.startOffset : r.endOffset
		};
		this.onParseError(i);
	}
	onItemPush(e, t, n) {
		var r, i;
		(i = (r = this.treeAdapter).onItemPush) == null || i.call(r, e), n && this.openElements.stackTop > 0 && this._setContextModes(e, t);
	}
	onItemPop(e, t) {
		var n, r;
		if (this.options.sourceCodeLocationInfo && this._setEndLocation(e, this.currentToken), (r = (n = this.treeAdapter).onItemPop) == null || r.call(n, e, this.openElements.current), t) {
			let e, t;
			this.openElements.stackTop === 0 && this.fragmentContext ? (e = this.fragmentContext, t = this.fragmentContextID) : {current: e, currentTagId: t} = this.openElements, this._setContextModes(e, t);
		}
	}
	_setContextModes(e, t) {
		let n = e === this.document || e && this.treeAdapter.getNamespaceURI(e) === q.HTML;
		this.currentNotInHTML = !n, this.tokenizer.inForeignNode = !n && e !== void 0 && t !== void 0 && !this._isIntegrationPoint(t, e);
	}
	_switchToTextParsing(e, t) {
		this._insertElement(e, q.HTML), this.tokenizer.state = t, this.originalInsertionMode = this.insertionMode, this.insertionMode = Q.TEXT;
	}
	switchToPlaintextParsing() {
		this.insertionMode = Q.TEXT, this.originalInsertionMode = Q.IN_BODY, this.tokenizer.state = $c.PLAINTEXT;
	}
	_getAdjustedCurrentElement() {
		return this.openElements.stackTop === 0 && this.fragmentContext ? this.fragmentContext : this.openElements.current;
	}
	_findFormInFragmentContext() {
		let e = this.fragmentContext;
		for (; e;) {
			if (this.treeAdapter.getTagName(e) === J.FORM) {
				this.formElement = e;
				break;
			}
			e = this.treeAdapter.getParentNode(e);
		}
	}
	_initTokenizerForFragmentParsing() {
		if (!(!this.fragmentContext || this.treeAdapter.getNamespaceURI(this.fragmentContext) !== q.HTML)) switch (this.fragmentContextID) {
			case Y.TITLE:
			case Y.TEXTAREA:
				this.tokenizer.state = $c.RCDATA;
				break;
			case Y.STYLE:
			case Y.XMP:
			case Y.IFRAME:
			case Y.NOEMBED:
			case Y.NOFRAMES:
			case Y.NOSCRIPT:
				this.tokenizer.state = $c.RAWTEXT;
				break;
			case Y.SCRIPT:
				this.tokenizer.state = $c.SCRIPT_DATA;
				break;
			case Y.PLAINTEXT: this.tokenizer.state = $c.PLAINTEXT;
		}
	}
	_setDocumentType(e) {
		let t = e.name || "", n = e.publicId || "", r = e.systemId || "";
		if (this.treeAdapter.setDocumentType(this.document, t, n, r), e.location) {
			let t = this.treeAdapter.getChildNodes(this.document).find((e) => this.treeAdapter.isDocumentTypeNode(e));
			t && this.treeAdapter.setNodeSourceCodeLocation(t, e.location);
		}
	}
	_attachElementToTree(e, t) {
		if (this.options.sourceCodeLocationInfo) {
			let n = t && {
				...t,
				startTag: t
			};
			this.treeAdapter.setNodeSourceCodeLocation(e, n);
		}
		if (this._shouldFosterParentOnInsertion()) this._fosterParentElement(e);
		else {
			let t = this.openElements.currentTmplContentOrNode;
			this.treeAdapter.appendChild(t ?? this.document, e);
		}
	}
	_appendElement(e, t) {
		let n = this.treeAdapter.createElement(e.tagName, t, e.attrs);
		this._attachElementToTree(n, e.location);
	}
	_insertElement(e, t) {
		let n = this.treeAdapter.createElement(e.tagName, t, e.attrs);
		this._attachElementToTree(n, e.location), this.openElements.push(n, e.tagID);
	}
	_insertFakeElement(e, t) {
		let n = this.treeAdapter.createElement(e, q.HTML, []);
		this._attachElementToTree(n, null), this.openElements.push(n, t);
	}
	_insertTemplate(e) {
		let t = this.treeAdapter.createElement(e.tagName, q.HTML, e.attrs), n = this.treeAdapter.createDocumentFragment();
		this.treeAdapter.setTemplateContent(t, n), this._attachElementToTree(t, e.location), this.openElements.push(t, e.tagID), this.options.sourceCodeLocationInfo && this.treeAdapter.setNodeSourceCodeLocation(n, null);
	}
	_insertFakeRootElement() {
		let e = this.treeAdapter.createElement(J.HTML, q.HTML, []);
		this.options.sourceCodeLocationInfo && this.treeAdapter.setNodeSourceCodeLocation(e, null), this.treeAdapter.appendChild(this.openElements.current, e), this.openElements.push(e, Y.HTML);
	}
	_appendCommentNode(e, t) {
		let n = this.treeAdapter.createCommentNode(e.data);
		this.treeAdapter.appendChild(t, n), this.options.sourceCodeLocationInfo && this.treeAdapter.setNodeSourceCodeLocation(n, e.location);
	}
	_insertCharacters(e) {
		let t, n;
		if (this._shouldFosterParentOnInsertion() ? ({parent: t, beforeElement: n} = this._findFosterParentingLocation(), n ? this.treeAdapter.insertTextBefore(t, e.chars, n) : this.treeAdapter.insertText(t, e.chars)) : (t = this.openElements.currentTmplContentOrNode, this.treeAdapter.insertText(t, e.chars)), !e.location) return;
		let r = this.treeAdapter.getChildNodes(t), i = r[(n ? r.lastIndexOf(n) : r.length) - 1];
		if (this.treeAdapter.getNodeSourceCodeLocation(i)) {
			let { endLine: t, endCol: n, endOffset: r } = e.location;
			this.treeAdapter.updateNodeSourceCodeLocation(i, {
				endLine: t,
				endCol: n,
				endOffset: r
			});
		} else this.options.sourceCodeLocationInfo && this.treeAdapter.setNodeSourceCodeLocation(i, e.location);
	}
	_adoptNodes(e, t) {
		for (let n = this.treeAdapter.getFirstChild(e); n; n = this.treeAdapter.getFirstChild(e)) this.treeAdapter.detachNode(n), this.treeAdapter.appendChild(t, n);
	}
	_setEndLocation(e, t) {
		if (this.treeAdapter.getNodeSourceCodeLocation(e) && t.location) {
			let n = t.location, r = this.treeAdapter.getTagName(e), i = t.type === K.END_TAG && r === t.tagName ? {
				endTag: { ...n },
				endLine: n.endLine,
				endCol: n.endCol,
				endOffset: n.endOffset
			} : {
				endLine: n.startLine,
				endCol: n.startCol,
				endOffset: n.startOffset
			};
			this.treeAdapter.updateNodeSourceCodeLocation(e, i);
		}
	}
	shouldProcessStartTagTokenInForeignContent(e) {
		if (!this.currentNotInHTML) return !1;
		let t, n;
		return this.openElements.stackTop === 0 && this.fragmentContext ? (t = this.fragmentContext, n = this.fragmentContextID) : {current: t, currentTagId: n} = this.openElements, e.tagID === Y.SVG && this.treeAdapter.getTagName(t) === J.ANNOTATION_XML && this.treeAdapter.getNamespaceURI(t) === q.MATHML ? !1 : this.tokenizer.inForeignNode || (e.tagID === Y.MGLYPH || e.tagID === Y.MALIGNMARK) && n !== void 0 && !this._isIntegrationPoint(n, t, q.HTML);
	}
	_processToken(e) {
		switch (e.type) {
			case K.CHARACTER:
				this.onCharacter(e);
				break;
			case K.NULL_CHARACTER:
				this.onNullCharacter(e);
				break;
			case K.COMMENT:
				this.onComment(e);
				break;
			case K.DOCTYPE:
				this.onDoctype(e);
				break;
			case K.START_TAG:
				this._processStartTag(e);
				break;
			case K.END_TAG:
				this.onEndTag(e);
				break;
			case K.EOF:
				this.onEof(e);
				break;
			case K.WHITESPACE_CHARACTER: this.onWhitespaceCharacter(e);
		}
	}
	_isIntegrationPoint(e, t, n) {
		return Ql(e, this.treeAdapter.getNamespaceURI(t), this.treeAdapter.getAttrList(t), n);
	}
	_reconstructActiveFormattingElements() {
		let e = this.activeFormattingElements.entries.length;
		if (e) {
			let t = this.activeFormattingElements.entries.findIndex((e) => e.type === Cl.Marker || this.openElements.contains(e.element)), n = t === -1 ? e - 1 : t - 1;
			for (let e = n; e >= 0; e--) {
				let t = this.activeFormattingElements.entries[e];
				this._insertElement(t.token, this.treeAdapter.getNamespaceURI(t.element)), t.element = this.openElements.current;
			}
		}
	}
	_closeTableCell() {
		this.openElements.generateImpliedEndTags(), this.openElements.popUntilTableCellPopped(), this.activeFormattingElements.clearToLastMarker(), this.insertionMode = Q.IN_ROW;
	}
	_closePElement() {
		this.openElements.generateImpliedEndTagsWithExclusion(Y.P), this.openElements.popUntilTagNamePopped(Y.P);
	}
	_resetInsertionMode() {
		for (let e = this.openElements.stackTop; e >= 0; e--) switch (e === 0 && this.fragmentContext ? this.fragmentContextID : this.openElements.tagIDs[e]) {
			case Y.TR:
				this.insertionMode = Q.IN_ROW;
				return;
			case Y.TBODY:
			case Y.THEAD:
			case Y.TFOOT:
				this.insertionMode = Q.IN_TABLE_BODY;
				return;
			case Y.CAPTION:
				this.insertionMode = Q.IN_CAPTION;
				return;
			case Y.COLGROUP:
				this.insertionMode = Q.IN_COLUMN_GROUP;
				return;
			case Y.TABLE:
				this.insertionMode = Q.IN_TABLE;
				return;
			case Y.BODY:
				this.insertionMode = Q.IN_BODY;
				return;
			case Y.FRAMESET:
				this.insertionMode = Q.IN_FRAMESET;
				return;
			case Y.SELECT:
				this._resetInsertionModeForSelect(e);
				return;
			case Y.TEMPLATE:
				this.insertionMode = this.tmplInsertionModeStack[0];
				return;
			case Y.HTML:
				this.insertionMode = this.headElement ? Q.AFTER_HEAD : Q.BEFORE_HEAD;
				return;
			case Y.TD:
			case Y.TH:
				if (e > 0) {
					this.insertionMode = Q.IN_CELL;
					return;
				}
				break;
			case Y.HEAD: if (e > 0) {
				this.insertionMode = Q.IN_HEAD;
				return;
			}
		}
		this.insertionMode = Q.IN_BODY;
	}
	_resetInsertionModeForSelect(e) {
		if (e > 0) for (let t = e - 1; t > 0; t--) {
			let e = this.openElements.tagIDs[t];
			if (e === Y.TEMPLATE) break;
			if (e === Y.TABLE) {
				this.insertionMode = Q.IN_SELECT_IN_TABLE;
				return;
			}
		}
		this.insertionMode = Q.IN_SELECT;
	}
	_isElementCausesFosterParenting(e) {
		return ru.has(e);
	}
	_shouldFosterParentOnInsertion() {
		return this.fosterParentingEnabled && this.openElements.currentTagId !== void 0 && this._isElementCausesFosterParenting(this.openElements.currentTagId);
	}
	_findFosterParentingLocation() {
		for (let e = this.openElements.stackTop; e >= 0; e--) {
			let t = this.openElements.items[e];
			switch (this.openElements.tagIDs[e]) {
				case Y.TEMPLATE:
					if (this.treeAdapter.getNamespaceURI(t) === q.HTML) return {
						parent: this.treeAdapter.getTemplateContent(t),
						beforeElement: null
					};
					break;
				case Y.TABLE: {
					let n = this.treeAdapter.getParentNode(t);
					return n ? {
						parent: n,
						beforeElement: t
					} : {
						parent: this.openElements.items[e - 1],
						beforeElement: null
					};
				}
			}
		}
		return {
			parent: this.openElements.items[0],
			beforeElement: null
		};
	}
	_fosterParentElement(e) {
		let t = this._findFosterParentingLocation();
		t.beforeElement ? this.treeAdapter.insertBefore(t.parent, e, t.beforeElement) : this.treeAdapter.appendChild(t.parent, e);
	}
	_isSpecialElement(e, t) {
		return Yc[this.treeAdapter.getNamespaceURI(e)].has(t);
	}
	onCharacter(e) {
		if (this.skipNextNewLine = !1, this.tokenizer.inForeignNode) {
			wf(this, e);
			return;
		}
		switch (this.insertionMode) {
			case Q.INITIAL:
				vu(this, e);
				break;
			case Q.BEFORE_HTML:
				xu(this, e);
				break;
			case Q.BEFORE_HEAD:
				wu(this, e);
				break;
			case Q.IN_HEAD:
				Ou(this, e);
				break;
			case Q.IN_HEAD_NO_SCRIPT:
				ju(this, e);
				break;
			case Q.AFTER_HEAD:
				Pu(this, e);
				break;
			case Q.IN_BODY:
			case Q.IN_CAPTION:
			case Q.IN_CELL:
			case Q.IN_TEMPLATE:
				Lu(this, e);
				break;
			case Q.TEXT:
			case Q.IN_SELECT:
			case Q.IN_SELECT_IN_TABLE:
				this._insertCharacters(e);
				break;
			case Q.IN_TABLE:
			case Q.IN_TABLE_BODY:
			case Q.IN_ROW:
				Md(this, e);
				break;
			case Q.IN_TABLE_TEXT:
				Gd(this, e);
				break;
			case Q.IN_COLUMN_GROUP:
				Qd(this, e);
				break;
			case Q.AFTER_BODY:
				hf(this, e);
				break;
			case Q.AFTER_AFTER_BODY: xf(this, e);
		}
	}
	onNullCharacter(e) {
		if (this.skipNextNewLine = !1, this.tokenizer.inForeignNode) {
			Cf(this, e);
			return;
		}
		switch (this.insertionMode) {
			case Q.INITIAL:
				vu(this, e);
				break;
			case Q.BEFORE_HTML:
				xu(this, e);
				break;
			case Q.BEFORE_HEAD:
				wu(this, e);
				break;
			case Q.IN_HEAD:
				Ou(this, e);
				break;
			case Q.IN_HEAD_NO_SCRIPT:
				ju(this, e);
				break;
			case Q.AFTER_HEAD:
				Pu(this, e);
				break;
			case Q.TEXT:
				this._insertCharacters(e);
				break;
			case Q.IN_TABLE:
			case Q.IN_TABLE_BODY:
			case Q.IN_ROW:
				Md(this, e);
				break;
			case Q.IN_COLUMN_GROUP:
				Qd(this, e);
				break;
			case Q.AFTER_BODY:
				hf(this, e);
				break;
			case Q.AFTER_AFTER_BODY: xf(this, e);
		}
	}
	onComment(e) {
		if (this.skipNextNewLine = !1, this.currentNotInHTML) {
			pu(this, e);
			return;
		}
		switch (this.insertionMode) {
			case Q.INITIAL:
			case Q.BEFORE_HTML:
			case Q.BEFORE_HEAD:
			case Q.IN_HEAD:
			case Q.IN_HEAD_NO_SCRIPT:
			case Q.AFTER_HEAD:
			case Q.IN_BODY:
			case Q.IN_TABLE:
			case Q.IN_CAPTION:
			case Q.IN_COLUMN_GROUP:
			case Q.IN_TABLE_BODY:
			case Q.IN_ROW:
			case Q.IN_CELL:
			case Q.IN_SELECT:
			case Q.IN_SELECT_IN_TABLE:
			case Q.IN_TEMPLATE:
			case Q.IN_FRAMESET:
			case Q.AFTER_FRAMESET:
				pu(this, e);
				break;
			case Q.IN_TABLE_TEXT:
				Kd(this, e);
				break;
			case Q.AFTER_BODY:
				mu(this, e);
				break;
			case Q.AFTER_AFTER_BODY:
			case Q.AFTER_AFTER_FRAMESET: hu(this, e);
		}
	}
	onDoctype(e) {
		switch (this.skipNextNewLine = !1, this.insertionMode) {
			case Q.INITIAL:
				_u(this, e);
				break;
			case Q.BEFORE_HEAD:
			case Q.IN_HEAD:
			case Q.IN_HEAD_NO_SCRIPT:
			case Q.AFTER_HEAD:
				this._err(e, G.misplacedDoctype);
				break;
			case Q.IN_TABLE_TEXT: Kd(this, e);
		}
	}
	onStartTag(e) {
		this.skipNextNewLine = !1, this.currentToken = e, this._processStartTag(e), e.selfClosing && !e.ackSelfClosing && this._err(e, G.nonVoidHtmlElementStartTagWithTrailingSolidus);
	}
	_processStartTag(e) {
		this.shouldProcessStartTagTokenInForeignContent(e) ? Ef(this, e) : this._startTagOutsideForeignContent(e);
	}
	_startTagOutsideForeignContent(e) {
		switch (this.insertionMode) {
			case Q.INITIAL:
				vu(this, e);
				break;
			case Q.BEFORE_HTML:
				yu(this, e);
				break;
			case Q.BEFORE_HEAD:
				Su(this, e);
				break;
			case Q.IN_HEAD:
				Tu(this, e);
				break;
			case Q.IN_HEAD_NO_SCRIPT:
				ku(this, e);
				break;
			case Q.AFTER_HEAD:
				Mu(this, e);
				break;
			case Q.IN_BODY:
				gd(this, e);
				break;
			case Q.IN_TABLE:
				Vd(this, e);
				break;
			case Q.IN_TABLE_TEXT:
				Kd(this, e);
				break;
			case Q.IN_CAPTION:
				Jd(this, e);
				break;
			case Q.IN_COLUMN_GROUP:
				Xd(this, e);
				break;
			case Q.IN_TABLE_BODY:
				$d(this, e);
				break;
			case Q.IN_ROW:
				tf(this, e);
				break;
			case Q.IN_CELL:
				rf(this, e);
				break;
			case Q.IN_SELECT:
				of(this, e);
				break;
			case Q.IN_SELECT_IN_TABLE:
				cf(this, e);
				break;
			case Q.IN_TEMPLATE:
				uf(this, e);
				break;
			case Q.AFTER_BODY:
				pf(this, e);
				break;
			case Q.IN_FRAMESET:
				gf(this, e);
				break;
			case Q.AFTER_FRAMESET:
				vf(this, e);
				break;
			case Q.AFTER_AFTER_BODY:
				bf(this, e);
				break;
			case Q.AFTER_AFTER_FRAMESET: Sf(this, e);
		}
	}
	onEndTag(e) {
		this.skipNextNewLine = !1, this.currentToken = e, this.currentNotInHTML ? Df(this, e) : this._endTagOutsideForeignContent(e);
	}
	_endTagOutsideForeignContent(e) {
		switch (this.insertionMode) {
			case Q.INITIAL:
				vu(this, e);
				break;
			case Q.BEFORE_HTML:
				bu(this, e);
				break;
			case Q.BEFORE_HEAD:
				Cu(this, e);
				break;
			case Q.IN_HEAD:
				Eu(this, e);
				break;
			case Q.IN_HEAD_NO_SCRIPT:
				Au(this, e);
				break;
			case Q.AFTER_HEAD:
				Nu(this, e);
				break;
			case Q.IN_BODY:
				Od(this, e);
				break;
			case Q.TEXT:
				Ad(this, e);
				break;
			case Q.IN_TABLE:
				Hd(this, e);
				break;
			case Q.IN_TABLE_TEXT:
				Kd(this, e);
				break;
			case Q.IN_CAPTION:
				Yd(this, e);
				break;
			case Q.IN_COLUMN_GROUP:
				Zd(this, e);
				break;
			case Q.IN_TABLE_BODY:
				ef(this, e);
				break;
			case Q.IN_ROW:
				nf(this, e);
				break;
			case Q.IN_CELL:
				af(this, e);
				break;
			case Q.IN_SELECT:
				sf(this, e);
				break;
			case Q.IN_SELECT_IN_TABLE:
				lf(this, e);
				break;
			case Q.IN_TEMPLATE:
				df(this, e);
				break;
			case Q.AFTER_BODY:
				mf(this, e);
				break;
			case Q.IN_FRAMESET:
				_f(this, e);
				break;
			case Q.AFTER_FRAMESET:
				yf(this, e);
				break;
			case Q.AFTER_AFTER_BODY: xf(this, e);
		}
	}
	onEof(e) {
		switch (this.insertionMode) {
			case Q.INITIAL:
				vu(this, e);
				break;
			case Q.BEFORE_HTML:
				xu(this, e);
				break;
			case Q.BEFORE_HEAD:
				wu(this, e);
				break;
			case Q.IN_HEAD:
				Ou(this, e);
				break;
			case Q.IN_HEAD_NO_SCRIPT:
				ju(this, e);
				break;
			case Q.AFTER_HEAD:
				Pu(this, e);
				break;
			case Q.IN_BODY:
			case Q.IN_TABLE:
			case Q.IN_CAPTION:
			case Q.IN_COLUMN_GROUP:
			case Q.IN_TABLE_BODY:
			case Q.IN_ROW:
			case Q.IN_CELL:
			case Q.IN_SELECT:
			case Q.IN_SELECT_IN_TABLE:
				kd(this, e);
				break;
			case Q.TEXT:
				jd(this, e);
				break;
			case Q.IN_TABLE_TEXT:
				Kd(this, e);
				break;
			case Q.IN_TEMPLATE:
				ff(this, e);
				break;
			case Q.AFTER_BODY:
			case Q.IN_FRAMESET:
			case Q.AFTER_FRAMESET:
			case Q.AFTER_AFTER_BODY:
			case Q.AFTER_AFTER_FRAMESET: gu(this, e);
		}
	}
	onWhitespaceCharacter(e) {
		if (this.skipNextNewLine && (this.skipNextNewLine = !1, e.chars.charCodeAt(0) === W.LINE_FEED)) {
			if (e.chars.length === 1) return;
			e.chars = e.chars.substr(1);
		}
		if (this.tokenizer.inForeignNode) {
			this._insertCharacters(e);
			return;
		}
		switch (this.insertionMode) {
			case Q.IN_HEAD:
			case Q.IN_HEAD_NO_SCRIPT:
			case Q.AFTER_HEAD:
			case Q.TEXT:
			case Q.IN_COLUMN_GROUP:
			case Q.IN_SELECT:
			case Q.IN_SELECT_IN_TABLE:
			case Q.IN_FRAMESET:
			case Q.AFTER_FRAMESET:
				this._insertCharacters(e);
				break;
			case Q.IN_BODY:
			case Q.IN_CAPTION:
			case Q.IN_CELL:
			case Q.IN_TEMPLATE:
			case Q.AFTER_BODY:
			case Q.AFTER_AFTER_BODY:
			case Q.AFTER_AFTER_FRAMESET:
				Iu(this, e);
				break;
			case Q.IN_TABLE:
			case Q.IN_TABLE_BODY:
			case Q.IN_ROW:
				Md(this, e);
				break;
			case Q.IN_TABLE_TEXT: Wd(this, e);
		}
	}
};
function ou(e, t) {
	let n = e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);
	return n ? e.openElements.contains(n.element) ? e.openElements.hasInScope(t.tagID) || (n = null) : (e.activeFormattingElements.removeEntry(n), n = null) : Dd(e, t), n;
}
function su(e, t) {
	let n = null, r = e.openElements.stackTop;
	for (; r >= 0; r--) {
		let i = e.openElements.items[r];
		if (i === t.element) break;
		e._isSpecialElement(i, e.openElements.tagIDs[r]) && (n = i);
	}
	return n || (e.openElements.shortenToLength(Math.max(r, 0)), e.activeFormattingElements.removeEntry(t)), n;
}
function cu(e, t, n) {
	let r = t, i = e.openElements.getCommonAncestor(t);
	for (let a = 0, o = i; o !== n; a++, o = i) {
		i = e.openElements.getCommonAncestor(o);
		let n = e.activeFormattingElements.getElementEntry(o), s = n && a >= tu;
		!n || s ? (s && e.activeFormattingElements.removeEntry(n), e.openElements.remove(o)) : (o = lu(e, n), r === t && (e.activeFormattingElements.bookmark = n), e.treeAdapter.detachNode(r), e.treeAdapter.appendChild(o, r), r = o);
	}
	return r;
}
function lu(e, t) {
	let n = e.treeAdapter.getNamespaceURI(t.element), r = e.treeAdapter.createElement(t.token.tagName, n, t.token.attrs);
	return e.openElements.replace(t.element, r), t.element = r, r;
}
function uu(e, t, n) {
	let r = Jc(e.treeAdapter.getTagName(t));
	if (e._isElementCausesFosterParenting(r)) e._fosterParentElement(n);
	else {
		let i = e.treeAdapter.getNamespaceURI(t);
		r === Y.TEMPLATE && i === q.HTML && (t = e.treeAdapter.getTemplateContent(t)), e.treeAdapter.appendChild(t, n);
	}
}
function du(e, t, n) {
	let r = e.treeAdapter.getNamespaceURI(n.element), { token: i } = n, a = e.treeAdapter.createElement(i.tagName, r, i.attrs);
	e._adoptNodes(t, a), e.treeAdapter.appendChild(t, a), e.activeFormattingElements.insertElementAfterBookmark(a, i), e.activeFormattingElements.removeEntry(n), e.openElements.remove(n.element), e.openElements.insertAfter(t, a, i.tagID);
}
function fu(e, t) {
	for (let n = 0; n < eu; n++) {
		let n = ou(e, t);
		if (!n) break;
		let r = su(e, n);
		if (!r) break;
		e.activeFormattingElements.bookmark = n;
		let i = cu(e, r, n.element), a = e.openElements.getCommonAncestor(n.element);
		e.treeAdapter.detachNode(i), a && uu(e, a, i), du(e, r, n);
	}
}
function pu(e, t) {
	e._appendCommentNode(t, e.openElements.currentTmplContentOrNode);
}
function mu(e, t) {
	e._appendCommentNode(t, e.openElements.items[0]);
}
function hu(e, t) {
	e._appendCommentNode(t, e.document);
}
function gu(e, t) {
	if (e.stopped = !0, t.location) {
		let n = e.fragmentContext ? 0 : 2;
		for (let r = e.openElements.stackTop; r >= n; r--) e._setEndLocation(e.openElements.items[r], t);
		if (!e.fragmentContext && e.openElements.stackTop >= 0) {
			let n = e.openElements.items[0], r = e.treeAdapter.getNodeSourceCodeLocation(n);
			if (r && !r.endTag && (e._setEndLocation(n, t), e.openElements.stackTop >= 1)) {
				let n = e.openElements.items[1], r = e.treeAdapter.getNodeSourceCodeLocation(n);
				r && !r.endTag && e._setEndLocation(n, t);
			}
		}
	}
}
function _u(e, t) {
	e._setDocumentType(t);
	let n = t.forceQuirks ? Kc.QUIRKS : Ll(t);
	Il(t) || e._err(t, G.nonConformingDoctype), e.treeAdapter.setDocumentMode(e.document, n), e.insertionMode = Q.BEFORE_HTML;
}
function vu(e, t) {
	e._err(t, G.missingDoctype, !0), e.treeAdapter.setDocumentMode(e.document, Kc.QUIRKS), e.insertionMode = Q.BEFORE_HTML, e._processToken(t);
}
function yu(e, t) {
	t.tagID === Y.HTML ? (e._insertElement(t, q.HTML), e.insertionMode = Q.BEFORE_HEAD) : xu(e, t);
}
function bu(e, t) {
	let n = t.tagID;
	(n === Y.HTML || n === Y.HEAD || n === Y.BODY || n === Y.BR) && xu(e, t);
}
function xu(e, t) {
	e._insertFakeRootElement(), e.insertionMode = Q.BEFORE_HEAD, e._processToken(t);
}
function Su(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.HEAD:
			e._insertElement(t, q.HTML), e.headElement = e.openElements.current, e.insertionMode = Q.IN_HEAD;
			break;
		default: wu(e, t);
	}
}
function Cu(e, t) {
	let n = t.tagID;
	n === Y.HEAD || n === Y.BODY || n === Y.HTML || n === Y.BR ? wu(e, t) : e._err(t, G.endTagWithoutMatchingOpenElement);
}
function wu(e, t) {
	e._insertFakeElement(J.HEAD, Y.HEAD), e.headElement = e.openElements.current, e.insertionMode = Q.IN_HEAD, e._processToken(t);
}
function Tu(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.BASE:
		case Y.BASEFONT:
		case Y.BGSOUND:
		case Y.LINK:
		case Y.META:
			e._appendElement(t, q.HTML), t.ackSelfClosing = !0;
			break;
		case Y.TITLE:
			e._switchToTextParsing(t, $c.RCDATA);
			break;
		case Y.NOSCRIPT:
			e.options.scriptingEnabled ? e._switchToTextParsing(t, $c.RAWTEXT) : (e._insertElement(t, q.HTML), e.insertionMode = Q.IN_HEAD_NO_SCRIPT);
			break;
		case Y.NOFRAMES:
		case Y.STYLE:
			e._switchToTextParsing(t, $c.RAWTEXT);
			break;
		case Y.SCRIPT:
			e._switchToTextParsing(t, $c.SCRIPT_DATA);
			break;
		case Y.TEMPLATE:
			e._insertTemplate(t), e.activeFormattingElements.insertMarker(), e.framesetOk = !1, e.insertionMode = Q.IN_TEMPLATE, e.tmplInsertionModeStack.unshift(Q.IN_TEMPLATE);
			break;
		case Y.HEAD:
			e._err(t, G.misplacedStartTagForHeadElement);
			break;
		default: Ou(e, t);
	}
}
function Eu(e, t) {
	switch (t.tagID) {
		case Y.HEAD:
			e.openElements.pop(), e.insertionMode = Q.AFTER_HEAD;
			break;
		case Y.BODY:
		case Y.BR:
		case Y.HTML:
			Ou(e, t);
			break;
		case Y.TEMPLATE:
			Du(e, t);
			break;
		default: e._err(t, G.endTagWithoutMatchingOpenElement);
	}
}
function Du(e, t) {
	e.openElements.tmplCount > 0 ? (e.openElements.generateImpliedEndTagsThoroughly(), e.openElements.currentTagId !== Y.TEMPLATE && e._err(t, G.closingOfElementWithOpenChildElements), e.openElements.popUntilTagNamePopped(Y.TEMPLATE), e.activeFormattingElements.clearToLastMarker(), e.tmplInsertionModeStack.shift(), e._resetInsertionMode()) : e._err(t, G.endTagWithoutMatchingOpenElement);
}
function Ou(e, t) {
	e.openElements.pop(), e.insertionMode = Q.AFTER_HEAD, e._processToken(t);
}
function ku(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.BASEFONT:
		case Y.BGSOUND:
		case Y.HEAD:
		case Y.LINK:
		case Y.META:
		case Y.NOFRAMES:
		case Y.STYLE:
			Tu(e, t);
			break;
		case Y.NOSCRIPT:
			e._err(t, G.nestedNoscriptInHead);
			break;
		default: ju(e, t);
	}
}
function Au(e, t) {
	switch (t.tagID) {
		case Y.NOSCRIPT:
			e.openElements.pop(), e.insertionMode = Q.IN_HEAD;
			break;
		case Y.BR:
			ju(e, t);
			break;
		default: e._err(t, G.endTagWithoutMatchingOpenElement);
	}
}
function ju(e, t) {
	let n = t.type === K.EOF ? G.openElementsLeftAfterEof : G.disallowedContentInNoscriptInHead;
	e._err(t, n), e.openElements.pop(), e.insertionMode = Q.IN_HEAD, e._processToken(t);
}
function Mu(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.BODY:
			e._insertElement(t, q.HTML), e.framesetOk = !1, e.insertionMode = Q.IN_BODY;
			break;
		case Y.FRAMESET:
			e._insertElement(t, q.HTML), e.insertionMode = Q.IN_FRAMESET;
			break;
		case Y.BASE:
		case Y.BASEFONT:
		case Y.BGSOUND:
		case Y.LINK:
		case Y.META:
		case Y.NOFRAMES:
		case Y.SCRIPT:
		case Y.STYLE:
		case Y.TEMPLATE:
		case Y.TITLE:
			e._err(t, G.abandonedHeadElementChild), e.openElements.push(e.headElement, Y.HEAD), Tu(e, t), e.openElements.remove(e.headElement);
			break;
		case Y.HEAD:
			e._err(t, G.misplacedStartTagForHeadElement);
			break;
		default: Pu(e, t);
	}
}
function Nu(e, t) {
	switch (t.tagID) {
		case Y.BODY:
		case Y.HTML:
		case Y.BR:
			Pu(e, t);
			break;
		case Y.TEMPLATE:
			Du(e, t);
			break;
		default: e._err(t, G.endTagWithoutMatchingOpenElement);
	}
}
function Pu(e, t) {
	e._insertFakeElement(J.BODY, Y.BODY), e.insertionMode = Q.IN_BODY, Fu(e, t);
}
function Fu(e, t) {
	switch (t.type) {
		case K.CHARACTER:
			Lu(e, t);
			break;
		case K.WHITESPACE_CHARACTER:
			Iu(e, t);
			break;
		case K.COMMENT:
			pu(e, t);
			break;
		case K.START_TAG:
			gd(e, t);
			break;
		case K.END_TAG:
			Od(e, t);
			break;
		case K.EOF: kd(e, t);
	}
}
function Iu(e, t) {
	e._reconstructActiveFormattingElements(), e._insertCharacters(t);
}
function Lu(e, t) {
	e._reconstructActiveFormattingElements(), e._insertCharacters(t), e.framesetOk = !1;
}
function Ru(e, t) {
	e.openElements.tmplCount === 0 && e.treeAdapter.adoptAttributes(e.openElements.items[0], t.attrs);
}
function zu(e, t) {
	let n = e.openElements.tryPeekProperlyNestedBodyElement();
	n && e.openElements.tmplCount === 0 && (e.framesetOk = !1, e.treeAdapter.adoptAttributes(n, t.attrs));
}
function Bu(e, t) {
	let n = e.openElements.tryPeekProperlyNestedBodyElement();
	e.framesetOk && n && (e.treeAdapter.detachNode(n), e.openElements.popAllUpToHtmlElement(), e._insertElement(t, q.HTML), e.insertionMode = Q.IN_FRAMESET);
}
function Vu(e, t) {
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._insertElement(t, q.HTML);
}
function Hu(e, t) {
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e.openElements.currentTagId !== void 0 && Xc.has(e.openElements.currentTagId) && e.openElements.pop(), e._insertElement(t, q.HTML);
}
function Uu(e, t) {
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._insertElement(t, q.HTML), e.skipNextNewLine = !0, e.framesetOk = !1;
}
function Wu(e, t) {
	let n = e.openElements.tmplCount > 0;
	(!e.formElement || n) && (e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._insertElement(t, q.HTML), n || (e.formElement = e.openElements.current));
}
function Gu(e, t) {
	e.framesetOk = !1;
	let n = t.tagID;
	for (let t = e.openElements.stackTop; t >= 0; t--) {
		let r = e.openElements.tagIDs[t];
		if (n === Y.LI && r === Y.LI || (n === Y.DD || n === Y.DT) && (r === Y.DD || r === Y.DT)) {
			e.openElements.generateImpliedEndTagsWithExclusion(r), e.openElements.popUntilTagNamePopped(r);
			break;
		}
		if (r !== Y.ADDRESS && r !== Y.DIV && r !== Y.P && e._isSpecialElement(e.openElements.items[t], r)) break;
	}
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._insertElement(t, q.HTML);
}
function Ku(e, t) {
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._insertElement(t, q.HTML), e.tokenizer.state = $c.PLAINTEXT;
}
function qu(e, t) {
	e.openElements.hasInScope(Y.BUTTON) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(Y.BUTTON)), e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML), e.framesetOk = !1;
}
function Ju(e, t) {
	let n = e.activeFormattingElements.getElementEntryInScopeWithTagName(J.A);
	n && (fu(e, t), e.openElements.remove(n.element), e.activeFormattingElements.removeEntry(n)), e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML), e.activeFormattingElements.pushElement(e.openElements.current, t);
}
function Yu(e, t) {
	e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML), e.activeFormattingElements.pushElement(e.openElements.current, t);
}
function Xu(e, t) {
	e._reconstructActiveFormattingElements(), e.openElements.hasInScope(Y.NOBR) && (fu(e, t), e._reconstructActiveFormattingElements()), e._insertElement(t, q.HTML), e.activeFormattingElements.pushElement(e.openElements.current, t);
}
function Zu(e, t) {
	e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML), e.activeFormattingElements.insertMarker(), e.framesetOk = !1;
}
function Qu(e, t) {
	e.treeAdapter.getDocumentMode(e.document) !== Kc.QUIRKS && e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._insertElement(t, q.HTML), e.framesetOk = !1, e.insertionMode = Q.IN_TABLE;
}
function $u(e, t) {
	e._reconstructActiveFormattingElements(), e._appendElement(t, q.HTML), e.framesetOk = !1, t.ackSelfClosing = !0;
}
function ed(e) {
	let t = Ac(e, Gc.TYPE);
	return t != null && t.toLowerCase() === $l;
}
function td(e, t) {
	e._reconstructActiveFormattingElements(), e._appendElement(t, q.HTML), ed(t) || (e.framesetOk = !1), t.ackSelfClosing = !0;
}
function nd(e, t) {
	e._appendElement(t, q.HTML), t.ackSelfClosing = !0;
}
function rd(e, t) {
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._appendElement(t, q.HTML), e.framesetOk = !1, t.ackSelfClosing = !0;
}
function id(e, t) {
	t.tagName = J.IMG, t.tagID = Y.IMG, $u(e, t);
}
function ad(e, t) {
	e._insertElement(t, q.HTML), e.skipNextNewLine = !0, e.tokenizer.state = $c.RCDATA, e.originalInsertionMode = e.insertionMode, e.framesetOk = !1, e.insertionMode = Q.TEXT;
}
function od(e, t) {
	e.openElements.hasInButtonScope(Y.P) && e._closePElement(), e._reconstructActiveFormattingElements(), e.framesetOk = !1, e._switchToTextParsing(t, $c.RAWTEXT);
}
function sd(e, t) {
	e.framesetOk = !1, e._switchToTextParsing(t, $c.RAWTEXT);
}
function cd(e, t) {
	e._switchToTextParsing(t, $c.RAWTEXT);
}
function ld(e, t) {
	e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML), e.framesetOk = !1, e.insertionMode = e.insertionMode === Q.IN_TABLE || e.insertionMode === Q.IN_CAPTION || e.insertionMode === Q.IN_TABLE_BODY || e.insertionMode === Q.IN_ROW || e.insertionMode === Q.IN_CELL ? Q.IN_SELECT_IN_TABLE : Q.IN_SELECT;
}
function ud(e, t) {
	e.openElements.currentTagId === Y.OPTION && e.openElements.pop(), e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML);
}
function dd(e, t) {
	e.openElements.hasInScope(Y.RUBY) && e.openElements.generateImpliedEndTags(), e._insertElement(t, q.HTML);
}
function fd(e, t) {
	e.openElements.hasInScope(Y.RUBY) && e.openElements.generateImpliedEndTagsWithExclusion(Y.RTC), e._insertElement(t, q.HTML);
}
function pd(e, t) {
	e._reconstructActiveFormattingElements(), Kl(t), Jl(t), t.selfClosing ? e._appendElement(t, q.MATHML) : e._insertElement(t, q.MATHML), t.ackSelfClosing = !0;
}
function md(e, t) {
	e._reconstructActiveFormattingElements(), ql(t), Jl(t), t.selfClosing ? e._appendElement(t, q.SVG) : e._insertElement(t, q.SVG), t.ackSelfClosing = !0;
}
function hd(e, t) {
	e._reconstructActiveFormattingElements(), e._insertElement(t, q.HTML);
}
function gd(e, t) {
	switch (t.tagID) {
		case Y.I:
		case Y.S:
		case Y.B:
		case Y.U:
		case Y.EM:
		case Y.TT:
		case Y.BIG:
		case Y.CODE:
		case Y.FONT:
		case Y.SMALL:
		case Y.STRIKE:
		case Y.STRONG:
			Yu(e, t);
			break;
		case Y.A:
			Ju(e, t);
			break;
		case Y.H1:
		case Y.H2:
		case Y.H3:
		case Y.H4:
		case Y.H5:
		case Y.H6:
			Hu(e, t);
			break;
		case Y.P:
		case Y.DL:
		case Y.OL:
		case Y.UL:
		case Y.DIV:
		case Y.DIR:
		case Y.NAV:
		case Y.MAIN:
		case Y.MENU:
		case Y.ASIDE:
		case Y.CENTER:
		case Y.FIGURE:
		case Y.FOOTER:
		case Y.HEADER:
		case Y.HGROUP:
		case Y.DIALOG:
		case Y.DETAILS:
		case Y.ADDRESS:
		case Y.ARTICLE:
		case Y.SEARCH:
		case Y.SECTION:
		case Y.SUMMARY:
		case Y.FIELDSET:
		case Y.BLOCKQUOTE:
		case Y.FIGCAPTION:
			Vu(e, t);
			break;
		case Y.LI:
		case Y.DD:
		case Y.DT:
			Gu(e, t);
			break;
		case Y.BR:
		case Y.IMG:
		case Y.WBR:
		case Y.AREA:
		case Y.EMBED:
		case Y.KEYGEN:
			$u(e, t);
			break;
		case Y.HR:
			rd(e, t);
			break;
		case Y.RB:
		case Y.RTC:
			dd(e, t);
			break;
		case Y.RT:
		case Y.RP:
			fd(e, t);
			break;
		case Y.PRE:
		case Y.LISTING:
			Uu(e, t);
			break;
		case Y.XMP:
			od(e, t);
			break;
		case Y.SVG:
			md(e, t);
			break;
		case Y.HTML:
			Ru(e, t);
			break;
		case Y.BASE:
		case Y.LINK:
		case Y.META:
		case Y.STYLE:
		case Y.TITLE:
		case Y.SCRIPT:
		case Y.BGSOUND:
		case Y.BASEFONT:
		case Y.TEMPLATE:
			Tu(e, t);
			break;
		case Y.BODY:
			zu(e, t);
			break;
		case Y.FORM:
			Wu(e, t);
			break;
		case Y.NOBR:
			Xu(e, t);
			break;
		case Y.MATH:
			pd(e, t);
			break;
		case Y.TABLE:
			Qu(e, t);
			break;
		case Y.INPUT:
			td(e, t);
			break;
		case Y.PARAM:
		case Y.TRACK:
		case Y.SOURCE:
			nd(e, t);
			break;
		case Y.IMAGE:
			id(e, t);
			break;
		case Y.BUTTON:
			qu(e, t);
			break;
		case Y.APPLET:
		case Y.OBJECT:
		case Y.MARQUEE:
			Zu(e, t);
			break;
		case Y.IFRAME:
			sd(e, t);
			break;
		case Y.SELECT:
			ld(e, t);
			break;
		case Y.OPTION:
		case Y.OPTGROUP:
			ud(e, t);
			break;
		case Y.NOEMBED:
		case Y.NOFRAMES:
			cd(e, t);
			break;
		case Y.FRAMESET:
			Bu(e, t);
			break;
		case Y.TEXTAREA:
			ad(e, t);
			break;
		case Y.NOSCRIPT:
			e.options.scriptingEnabled ? cd(e, t) : hd(e, t);
			break;
		case Y.PLAINTEXT:
			Ku(e, t);
			break;
		case Y.COL:
		case Y.TH:
		case Y.TD:
		case Y.TR:
		case Y.HEAD:
		case Y.FRAME:
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
		case Y.CAPTION:
		case Y.COLGROUP: break;
		default: hd(e, t);
	}
}
function _d(e, t) {
	if (e.openElements.hasInScope(Y.BODY) && (e.insertionMode = Q.AFTER_BODY, e.options.sourceCodeLocationInfo)) {
		let n = e.openElements.tryPeekProperlyNestedBodyElement();
		n && e._setEndLocation(n, t);
	}
}
function vd(e, t) {
	e.openElements.hasInScope(Y.BODY) && (e.insertionMode = Q.AFTER_BODY, mf(e, t));
}
function yd(e, t) {
	let n = t.tagID;
	e.openElements.hasInScope(n) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(n));
}
function bd(e) {
	let t = e.openElements.tmplCount > 0, { formElement: n } = e;
	t || (e.formElement = null), (n || t) && e.openElements.hasInScope(Y.FORM) && (e.openElements.generateImpliedEndTags(), t ? e.openElements.popUntilTagNamePopped(Y.FORM) : n && e.openElements.remove(n));
}
function xd(e) {
	e.openElements.hasInButtonScope(Y.P) || e._insertFakeElement(J.P, Y.P), e._closePElement();
}
function Sd(e) {
	e.openElements.hasInListItemScope(Y.LI) && (e.openElements.generateImpliedEndTagsWithExclusion(Y.LI), e.openElements.popUntilTagNamePopped(Y.LI));
}
function Cd(e, t) {
	let n = t.tagID;
	e.openElements.hasInScope(n) && (e.openElements.generateImpliedEndTagsWithExclusion(n), e.openElements.popUntilTagNamePopped(n));
}
function wd(e) {
	e.openElements.hasNumberedHeaderInScope() && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilNumberedHeaderPopped());
}
function Td(e, t) {
	let n = t.tagID;
	e.openElements.hasInScope(n) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(n), e.activeFormattingElements.clearToLastMarker());
}
function Ed(e) {
	e._reconstructActiveFormattingElements(), e._insertFakeElement(J.BR, Y.BR), e.openElements.pop(), e.framesetOk = !1;
}
function Dd(e, t) {
	let n = t.tagName, r = t.tagID;
	for (let t = e.openElements.stackTop; t > 0; t--) {
		let i = e.openElements.items[t], a = e.openElements.tagIDs[t];
		if (r === a && (r !== Y.UNKNOWN || e.treeAdapter.getTagName(i) === n)) {
			e.openElements.generateImpliedEndTagsWithExclusion(r), e.openElements.stackTop >= t && e.openElements.shortenToLength(t);
			break;
		}
		if (e._isSpecialElement(i, a)) break;
	}
}
function Od(e, t) {
	switch (t.tagID) {
		case Y.A:
		case Y.B:
		case Y.I:
		case Y.S:
		case Y.U:
		case Y.EM:
		case Y.TT:
		case Y.BIG:
		case Y.CODE:
		case Y.FONT:
		case Y.NOBR:
		case Y.SMALL:
		case Y.STRIKE:
		case Y.STRONG:
			fu(e, t);
			break;
		case Y.P:
			xd(e);
			break;
		case Y.DL:
		case Y.UL:
		case Y.OL:
		case Y.DIR:
		case Y.DIV:
		case Y.NAV:
		case Y.PRE:
		case Y.MAIN:
		case Y.MENU:
		case Y.ASIDE:
		case Y.BUTTON:
		case Y.CENTER:
		case Y.FIGURE:
		case Y.FOOTER:
		case Y.HEADER:
		case Y.HGROUP:
		case Y.DIALOG:
		case Y.ADDRESS:
		case Y.ARTICLE:
		case Y.DETAILS:
		case Y.SEARCH:
		case Y.SECTION:
		case Y.SUMMARY:
		case Y.LISTING:
		case Y.FIELDSET:
		case Y.BLOCKQUOTE:
		case Y.FIGCAPTION:
			yd(e, t);
			break;
		case Y.LI:
			Sd(e);
			break;
		case Y.DD:
		case Y.DT:
			Cd(e, t);
			break;
		case Y.H1:
		case Y.H2:
		case Y.H3:
		case Y.H4:
		case Y.H5:
		case Y.H6:
			wd(e);
			break;
		case Y.BR:
			Ed(e);
			break;
		case Y.BODY:
			_d(e, t);
			break;
		case Y.HTML:
			vd(e, t);
			break;
		case Y.FORM:
			bd(e);
			break;
		case Y.APPLET:
		case Y.OBJECT:
		case Y.MARQUEE:
			Td(e, t);
			break;
		case Y.TEMPLATE:
			Du(e, t);
			break;
		default: Dd(e, t);
	}
}
function kd(e, t) {
	e.tmplInsertionModeStack.length > 0 ? ff(e, t) : gu(e, t);
}
function Ad(e, t) {
	var n;
	t.tagID === Y.SCRIPT && ((n = e.scriptHandler) == null || n.call(e, e.openElements.current)), e.openElements.pop(), e.insertionMode = e.originalInsertionMode;
}
function jd(e, t) {
	e._err(t, G.eofInElementThatCanContainOnlyText), e.openElements.pop(), e.insertionMode = e.originalInsertionMode, e.onEof(t);
}
function Md(e, t) {
	if (e.openElements.currentTagId !== void 0 && ru.has(e.openElements.currentTagId)) switch (e.pendingCharacterTokens.length = 0, e.hasNonWhitespacePendingCharacterToken = !1, e.originalInsertionMode = e.insertionMode, e.insertionMode = Q.IN_TABLE_TEXT, t.type) {
		case K.CHARACTER:
			Gd(e, t);
			break;
		case K.WHITESPACE_CHARACTER: Wd(e, t);
	}
	else Ud(e, t);
}
function Nd(e, t) {
	e.openElements.clearBackToTableContext(), e.activeFormattingElements.insertMarker(), e._insertElement(t, q.HTML), e.insertionMode = Q.IN_CAPTION;
}
function Pd(e, t) {
	e.openElements.clearBackToTableContext(), e._insertElement(t, q.HTML), e.insertionMode = Q.IN_COLUMN_GROUP;
}
function Fd(e, t) {
	e.openElements.clearBackToTableContext(), e._insertFakeElement(J.COLGROUP, Y.COLGROUP), e.insertionMode = Q.IN_COLUMN_GROUP, Xd(e, t);
}
function Id(e, t) {
	e.openElements.clearBackToTableContext(), e._insertElement(t, q.HTML), e.insertionMode = Q.IN_TABLE_BODY;
}
function Ld(e, t) {
	e.openElements.clearBackToTableContext(), e._insertFakeElement(J.TBODY, Y.TBODY), e.insertionMode = Q.IN_TABLE_BODY, $d(e, t);
}
function Rd(e, t) {
	e.openElements.hasInTableScope(Y.TABLE) && (e.openElements.popUntilTagNamePopped(Y.TABLE), e._resetInsertionMode(), e._processStartTag(t));
}
function zd(e, t) {
	ed(t) ? e._appendElement(t, q.HTML) : Ud(e, t), t.ackSelfClosing = !0;
}
function Bd(e, t) {
	!e.formElement && e.openElements.tmplCount === 0 && (e._insertElement(t, q.HTML), e.formElement = e.openElements.current, e.openElements.pop());
}
function Vd(e, t) {
	switch (t.tagID) {
		case Y.TD:
		case Y.TH:
		case Y.TR:
			Ld(e, t);
			break;
		case Y.STYLE:
		case Y.SCRIPT:
		case Y.TEMPLATE:
			Tu(e, t);
			break;
		case Y.COL:
			Fd(e, t);
			break;
		case Y.FORM:
			Bd(e, t);
			break;
		case Y.TABLE:
			Rd(e, t);
			break;
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
			Id(e, t);
			break;
		case Y.INPUT:
			zd(e, t);
			break;
		case Y.CAPTION:
			Nd(e, t);
			break;
		case Y.COLGROUP:
			Pd(e, t);
			break;
		default: Ud(e, t);
	}
}
function Hd(e, t) {
	switch (t.tagID) {
		case Y.TABLE:
			e.openElements.hasInTableScope(Y.TABLE) && (e.openElements.popUntilTagNamePopped(Y.TABLE), e._resetInsertionMode());
			break;
		case Y.TEMPLATE:
			Du(e, t);
			break;
		case Y.BODY:
		case Y.CAPTION:
		case Y.COL:
		case Y.COLGROUP:
		case Y.HTML:
		case Y.TBODY:
		case Y.TD:
		case Y.TFOOT:
		case Y.TH:
		case Y.THEAD:
		case Y.TR: break;
		default: Ud(e, t);
	}
}
function Ud(e, t) {
	let n = e.fosterParentingEnabled;
	e.fosterParentingEnabled = !0, Fu(e, t), e.fosterParentingEnabled = n;
}
function Wd(e, t) {
	e.pendingCharacterTokens.push(t);
}
function Gd(e, t) {
	e.pendingCharacterTokens.push(t), e.hasNonWhitespacePendingCharacterToken = !0;
}
function Kd(e, t) {
	let n = 0;
	if (e.hasNonWhitespacePendingCharacterToken) for (; n < e.pendingCharacterTokens.length; n++) Ud(e, e.pendingCharacterTokens[n]);
	else for (; n < e.pendingCharacterTokens.length; n++) e._insertCharacters(e.pendingCharacterTokens[n]);
	e.insertionMode = e.originalInsertionMode, e._processToken(t);
}
var qd = /* @__PURE__ */ new Set([
	Y.CAPTION,
	Y.COL,
	Y.COLGROUP,
	Y.TBODY,
	Y.TD,
	Y.TFOOT,
	Y.TH,
	Y.THEAD,
	Y.TR
]);
function Jd(e, t) {
	let n = t.tagID;
	qd.has(n) ? e.openElements.hasInTableScope(Y.CAPTION) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(Y.CAPTION), e.activeFormattingElements.clearToLastMarker(), e.insertionMode = Q.IN_TABLE, Vd(e, t)) : gd(e, t);
}
function Yd(e, t) {
	let n = t.tagID;
	switch (n) {
		case Y.CAPTION:
		case Y.TABLE:
			e.openElements.hasInTableScope(Y.CAPTION) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(Y.CAPTION), e.activeFormattingElements.clearToLastMarker(), e.insertionMode = Q.IN_TABLE, n === Y.TABLE && Hd(e, t));
			break;
		case Y.BODY:
		case Y.COL:
		case Y.COLGROUP:
		case Y.HTML:
		case Y.TBODY:
		case Y.TD:
		case Y.TFOOT:
		case Y.TH:
		case Y.THEAD:
		case Y.TR: break;
		default: Od(e, t);
	}
}
function Xd(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.COL:
			e._appendElement(t, q.HTML), t.ackSelfClosing = !0;
			break;
		case Y.TEMPLATE:
			Tu(e, t);
			break;
		default: Qd(e, t);
	}
}
function Zd(e, t) {
	switch (t.tagID) {
		case Y.COLGROUP:
			e.openElements.currentTagId === Y.COLGROUP && (e.openElements.pop(), e.insertionMode = Q.IN_TABLE);
			break;
		case Y.TEMPLATE:
			Du(e, t);
			break;
		case Y.COL: break;
		default: Qd(e, t);
	}
}
function Qd(e, t) {
	e.openElements.currentTagId === Y.COLGROUP && (e.openElements.pop(), e.insertionMode = Q.IN_TABLE, e._processToken(t));
}
function $d(e, t) {
	switch (t.tagID) {
		case Y.TR:
			e.openElements.clearBackToTableBodyContext(), e._insertElement(t, q.HTML), e.insertionMode = Q.IN_ROW;
			break;
		case Y.TH:
		case Y.TD:
			e.openElements.clearBackToTableBodyContext(), e._insertFakeElement(J.TR, Y.TR), e.insertionMode = Q.IN_ROW, tf(e, t);
			break;
		case Y.CAPTION:
		case Y.COL:
		case Y.COLGROUP:
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
			e.openElements.hasTableBodyContextInTableScope() && (e.openElements.clearBackToTableBodyContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE, Vd(e, t));
			break;
		default: Vd(e, t);
	}
}
function ef(e, t) {
	let n = t.tagID;
	switch (t.tagID) {
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
			e.openElements.hasInTableScope(n) && (e.openElements.clearBackToTableBodyContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE);
			break;
		case Y.TABLE:
			e.openElements.hasTableBodyContextInTableScope() && (e.openElements.clearBackToTableBodyContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE, Hd(e, t));
			break;
		case Y.BODY:
		case Y.CAPTION:
		case Y.COL:
		case Y.COLGROUP:
		case Y.HTML:
		case Y.TD:
		case Y.TH:
		case Y.TR: break;
		default: Hd(e, t);
	}
}
function tf(e, t) {
	switch (t.tagID) {
		case Y.TH:
		case Y.TD:
			e.openElements.clearBackToTableRowContext(), e._insertElement(t, q.HTML), e.insertionMode = Q.IN_CELL, e.activeFormattingElements.insertMarker();
			break;
		case Y.CAPTION:
		case Y.COL:
		case Y.COLGROUP:
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
		case Y.TR:
			e.openElements.hasInTableScope(Y.TR) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE_BODY, $d(e, t));
			break;
		default: Vd(e, t);
	}
}
function nf(e, t) {
	switch (t.tagID) {
		case Y.TR:
			e.openElements.hasInTableScope(Y.TR) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE_BODY);
			break;
		case Y.TABLE:
			e.openElements.hasInTableScope(Y.TR) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE_BODY, ef(e, t));
			break;
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
			(e.openElements.hasInTableScope(t.tagID) || e.openElements.hasInTableScope(Y.TR)) && (e.openElements.clearBackToTableRowContext(), e.openElements.pop(), e.insertionMode = Q.IN_TABLE_BODY, ef(e, t));
			break;
		case Y.BODY:
		case Y.CAPTION:
		case Y.COL:
		case Y.COLGROUP:
		case Y.HTML:
		case Y.TD:
		case Y.TH: break;
		default: Hd(e, t);
	}
}
function rf(e, t) {
	let n = t.tagID;
	qd.has(n) ? (e.openElements.hasInTableScope(Y.TD) || e.openElements.hasInTableScope(Y.TH)) && (e._closeTableCell(), tf(e, t)) : gd(e, t);
}
function af(e, t) {
	let n = t.tagID;
	switch (n) {
		case Y.TD:
		case Y.TH:
			e.openElements.hasInTableScope(n) && (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(n), e.activeFormattingElements.clearToLastMarker(), e.insertionMode = Q.IN_ROW);
			break;
		case Y.TABLE:
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
		case Y.TR:
			e.openElements.hasInTableScope(n) && (e._closeTableCell(), nf(e, t));
			break;
		case Y.BODY:
		case Y.CAPTION:
		case Y.COL:
		case Y.COLGROUP:
		case Y.HTML: break;
		default: Od(e, t);
	}
}
function of(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.OPTION:
			e.openElements.currentTagId === Y.OPTION && e.openElements.pop(), e._insertElement(t, q.HTML);
			break;
		case Y.OPTGROUP:
			e.openElements.currentTagId === Y.OPTION && e.openElements.pop(), e.openElements.currentTagId === Y.OPTGROUP && e.openElements.pop(), e._insertElement(t, q.HTML);
			break;
		case Y.HR:
			e.openElements.currentTagId === Y.OPTION && e.openElements.pop(), e.openElements.currentTagId === Y.OPTGROUP && e.openElements.pop(), e._appendElement(t, q.HTML), t.ackSelfClosing = !0;
			break;
		case Y.INPUT:
		case Y.KEYGEN:
		case Y.TEXTAREA:
		case Y.SELECT:
			e.openElements.hasInSelectScope(Y.SELECT) && (e.openElements.popUntilTagNamePopped(Y.SELECT), e._resetInsertionMode(), t.tagID !== Y.SELECT && e._processStartTag(t));
			break;
		case Y.SCRIPT:
		case Y.TEMPLATE: Tu(e, t);
	}
}
function sf(e, t) {
	switch (t.tagID) {
		case Y.OPTGROUP:
			e.openElements.stackTop > 0 && e.openElements.currentTagId === Y.OPTION && e.openElements.tagIDs[e.openElements.stackTop - 1] === Y.OPTGROUP && e.openElements.pop(), e.openElements.currentTagId === Y.OPTGROUP && e.openElements.pop();
			break;
		case Y.OPTION:
			e.openElements.currentTagId === Y.OPTION && e.openElements.pop();
			break;
		case Y.SELECT:
			e.openElements.hasInSelectScope(Y.SELECT) && (e.openElements.popUntilTagNamePopped(Y.SELECT), e._resetInsertionMode());
			break;
		case Y.TEMPLATE: Du(e, t);
	}
}
function cf(e, t) {
	let n = t.tagID;
	n === Y.CAPTION || n === Y.TABLE || n === Y.TBODY || n === Y.TFOOT || n === Y.THEAD || n === Y.TR || n === Y.TD || n === Y.TH ? (e.openElements.popUntilTagNamePopped(Y.SELECT), e._resetInsertionMode(), e._processStartTag(t)) : of(e, t);
}
function lf(e, t) {
	let n = t.tagID;
	n === Y.CAPTION || n === Y.TABLE || n === Y.TBODY || n === Y.TFOOT || n === Y.THEAD || n === Y.TR || n === Y.TD || n === Y.TH ? e.openElements.hasInTableScope(n) && (e.openElements.popUntilTagNamePopped(Y.SELECT), e._resetInsertionMode(), e.onEndTag(t)) : sf(e, t);
}
function uf(e, t) {
	switch (t.tagID) {
		case Y.BASE:
		case Y.BASEFONT:
		case Y.BGSOUND:
		case Y.LINK:
		case Y.META:
		case Y.NOFRAMES:
		case Y.SCRIPT:
		case Y.STYLE:
		case Y.TEMPLATE:
		case Y.TITLE:
			Tu(e, t);
			break;
		case Y.CAPTION:
		case Y.COLGROUP:
		case Y.TBODY:
		case Y.TFOOT:
		case Y.THEAD:
			e.tmplInsertionModeStack[0] = Q.IN_TABLE, e.insertionMode = Q.IN_TABLE, Vd(e, t);
			break;
		case Y.COL:
			e.tmplInsertionModeStack[0] = Q.IN_COLUMN_GROUP, e.insertionMode = Q.IN_COLUMN_GROUP, Xd(e, t);
			break;
		case Y.TR:
			e.tmplInsertionModeStack[0] = Q.IN_TABLE_BODY, e.insertionMode = Q.IN_TABLE_BODY, $d(e, t);
			break;
		case Y.TD:
		case Y.TH:
			e.tmplInsertionModeStack[0] = Q.IN_ROW, e.insertionMode = Q.IN_ROW, tf(e, t);
			break;
		default: e.tmplInsertionModeStack[0] = Q.IN_BODY, e.insertionMode = Q.IN_BODY, gd(e, t);
	}
}
function df(e, t) {
	t.tagID === Y.TEMPLATE && Du(e, t);
}
function ff(e, t) {
	e.openElements.tmplCount > 0 ? (e.openElements.popUntilTagNamePopped(Y.TEMPLATE), e.activeFormattingElements.clearToLastMarker(), e.tmplInsertionModeStack.shift(), e._resetInsertionMode(), e.onEof(t)) : gu(e, t);
}
function pf(e, t) {
	t.tagID === Y.HTML ? gd(e, t) : hf(e, t);
}
function mf(e, t) {
	if (t.tagID === Y.HTML) {
		if (e.fragmentContext || (e.insertionMode = Q.AFTER_AFTER_BODY), e.options.sourceCodeLocationInfo && e.openElements.tagIDs[0] === Y.HTML) {
			e._setEndLocation(e.openElements.items[0], t);
			let n = e.openElements.items[1];
			n && !e.treeAdapter.getNodeSourceCodeLocation(n)?.endTag && e._setEndLocation(n, t);
		}
	} else hf(e, t);
}
function hf(e, t) {
	e.insertionMode = Q.IN_BODY, Fu(e, t);
}
function gf(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.FRAMESET:
			e._insertElement(t, q.HTML);
			break;
		case Y.FRAME:
			e._appendElement(t, q.HTML), t.ackSelfClosing = !0;
			break;
		case Y.NOFRAMES: Tu(e, t);
	}
}
function _f(e, t) {
	t.tagID === Y.FRAMESET && !e.openElements.isRootHtmlElementCurrent() && (e.openElements.pop(), !e.fragmentContext && e.openElements.currentTagId !== Y.FRAMESET && (e.insertionMode = Q.AFTER_FRAMESET));
}
function vf(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.NOFRAMES: Tu(e, t);
	}
}
function yf(e, t) {
	t.tagID === Y.HTML && (e.insertionMode = Q.AFTER_AFTER_FRAMESET);
}
function bf(e, t) {
	t.tagID === Y.HTML ? gd(e, t) : xf(e, t);
}
function xf(e, t) {
	e.insertionMode = Q.IN_BODY, Fu(e, t);
}
function Sf(e, t) {
	switch (t.tagID) {
		case Y.HTML:
			gd(e, t);
			break;
		case Y.NOFRAMES: Tu(e, t);
	}
}
function Cf(e, t) {
	t.chars = "�", e._insertCharacters(t);
}
function wf(e, t) {
	e._insertCharacters(t), e.framesetOk = !1;
}
function Tf(e) {
	for (; e.treeAdapter.getNamespaceURI(e.openElements.current) !== q.HTML && e.openElements.currentTagId !== void 0 && !e._isIntegrationPoint(e.openElements.currentTagId, e.openElements.current);) e.openElements.pop();
}
function Ef(e, t) {
	if (Gl(t)) Tf(e), e._startTagOutsideForeignContent(t);
	else {
		let n = e._getAdjustedCurrentElement(), r = e.treeAdapter.getNamespaceURI(n);
		r === q.MATHML ? Kl(t) : r === q.SVG && (Yl(t), ql(t)), Jl(t), t.selfClosing ? e._appendElement(t, r) : e._insertElement(t, r), t.ackSelfClosing = !0;
	}
}
function Df(e, t) {
	if (t.tagID === Y.P || t.tagID === Y.BR) {
		Tf(e), e._endTagOutsideForeignContent(t);
		return;
	}
	for (let n = e.openElements.stackTop; n > 0; n--) {
		let r = e.openElements.items[n];
		if (e.treeAdapter.getNamespaceURI(r) === q.HTML) {
			e._endTagOutsideForeignContent(t);
			break;
		}
		let i = e.treeAdapter.getTagName(r);
		if (i.toLowerCase() === t.tagName) {
			t.tagName = i, e.openElements.shortenToLength(n);
			break;
		}
	}
}
String.prototype.codePointAt;
function Of(e, t) {
	return function(n) {
		let r, i = 0, a = "";
		for (; r = e.exec(n);) i !== r.index && (a += n.substring(i, r.index)), a += t.get(r[0].charCodeAt(0)), i = r.index + 1;
		return a + n.substring(i);
	};
}
var kf = /* #__PURE__ */ Of(/["&\u00A0]/g, /* @__PURE__ */ new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[160, "&nbsp;"]
])), Af = /* #__PURE__ */ Of(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
	[38, "&amp;"],
	[60, "&lt;"],
	[62, "&gt;"],
	[160, "&nbsp;"]
])), jf = /* @__PURE__ */ new Set([
	J.AREA,
	J.BASE,
	J.BASEFONT,
	J.BGSOUND,
	J.BR,
	J.COL,
	J.EMBED,
	J.FRAME,
	J.HR,
	J.IMG,
	J.INPUT,
	J.KEYGEN,
	J.LINK,
	J.META,
	J.PARAM,
	J.SOURCE,
	J.TRACK,
	J.WBR
]);
function Mf(e, t) {
	return t.treeAdapter.isElementNode(e) && t.treeAdapter.getNamespaceURI(e) === q.HTML && jf.has(t.treeAdapter.getTagName(e));
}
var Nf = {
	treeAdapter: El,
	scriptingEnabled: !0
};
function Pf(e, t) {
	return If(e, {
		...Nf,
		...t
	});
}
function Ff(e, t) {
	let n = "", r = t.treeAdapter.isElementNode(e) && t.treeAdapter.getTagName(e) === J.TEMPLATE && t.treeAdapter.getNamespaceURI(e) === q.HTML ? t.treeAdapter.getTemplateContent(e) : e, i = t.treeAdapter.getChildNodes(r);
	if (i) for (let e of i) n += If(e, t);
	return n;
}
function If(e, t) {
	return t.treeAdapter.isElementNode(e) ? Lf(e, t) : t.treeAdapter.isTextNode(e) ? zf(e, t) : t.treeAdapter.isCommentNode(e) ? Bf(e, t) : t.treeAdapter.isDocumentTypeNode(e) ? Vf(e, t) : "";
}
function Lf(e, t) {
	let n = t.treeAdapter.getTagName(e);
	return `<${n}${Rf(e, t)}>${Mf(e, t) ? "" : `${Ff(e, t)}</${n}>`}`;
}
function Rf(e, { treeAdapter: t }) {
	let n = "";
	for (let r of t.getAttrList(e)) {
		if (n += " ", r.namespace) switch (r.namespace) {
			case q.XML:
				n += `xml:${r.name}`;
				break;
			case q.XMLNS:
				r.name !== "xmlns" && (n += "xmlns:"), n += r.name;
				break;
			case q.XLINK:
				n += `xlink:${r.name}`;
				break;
			default: n += `${r.prefix}:${r.name}`;
		}
		else n += r.name;
		n += `="${kf(r.value)}"`;
	}
	return n;
}
function zf(e, t) {
	let { treeAdapter: n } = t, r = n.getTextNodeContent(e), i = n.getParentNode(e), a = i && n.isElementNode(i) && n.getTagName(i);
	return a && n.getNamespaceURI(i) === q.HTML && Qc(a, t.scriptingEnabled) ? r : Af(r);
}
function Bf(e, { treeAdapter: t }) {
	return `<!--${t.getCommentNodeContent(e)}-->`;
}
function Vf(e, { treeAdapter: t }) {
	return `<!DOCTYPE ${t.getDocumentTypeNodeName(e)}>`;
}
//#endregion
//#region node_modules/.pnpm/parse5@7.3.0/node_modules/parse5/dist/index.js
function Hf(e, t) {
	return au.parse(e, t);
}
function Uf(e, t, n) {
	typeof e == "string" && (n = t, t = e, e = null);
	let r = au.getFragmentParser(e, n);
	return r.tokenizer.write(t, !0), r.getFragment();
}
//#endregion
//#region node_modules/.pnpm/parse5-htmlparser2-tree-adapter@7.1.0/node_modules/parse5-htmlparser2-tree-adapter/dist/index.js
function Wf(e) {
	let t = e.includes("\"") ? "'" : "\"";
	return t + e + t;
}
function Gf(e, t, n) {
	let r = "!DOCTYPE ";
	return e && (r += e), t ? r += ` PUBLIC ${Wf(t)}` : n && (r += " SYSTEM"), n && (r += ` ${Wf(n)}`), r;
}
var Kf = {
	isCommentNode: kn,
	isElementNode: N,
	isTextNode: On,
	createDocument() {
		let e = new Tn([]);
		return e["x-mode"] = Kc.NO_QUIRKS, e;
	},
	createDocumentFragment() {
		return new Tn([]);
	},
	createElement(e, t, n) {
		let r = Object.create(null), i = Object.create(null), a = Object.create(null);
		for (let e = 0; e < n.length; e++) {
			let t = n[e].name;
			r[t] = n[e].value, i[t] = n[e].namespace, a[t] = n[e].prefix;
		}
		let o = new En(e, r, []);
		return o.namespace = t, o["x-attribsNamespace"] = i, o["x-attribsPrefix"] = a, o;
	},
	createCommentNode(e) {
		return new xn(e);
	},
	createTextNode(e) {
		return new bn(e);
	},
	appendChild(e, t) {
		let n = e.children[e.children.length - 1];
		n && (n.next = t, t.prev = n), e.children.push(t), t.parent = e;
	},
	insertBefore(e, t, n) {
		let r = e.children.indexOf(n), { prev: i } = n;
		i && (i.next = t, t.prev = i), n.prev = t, t.next = n, e.children.splice(r, 0, t), t.parent = e;
	},
	setTemplateContent(e, t) {
		Kf.appendChild(e, t);
	},
	getTemplateContent(e) {
		return e.children[0];
	},
	setDocumentType(e, t, n, r) {
		let i = Gf(t, n, r), a = e.children.find((e) => An(e) && e.name === "!doctype");
		a ? a.data = i ?? null : (a = new Sn("!doctype", i), Kf.appendChild(e, a)), a["x-name"] = t, a["x-publicId"] = n, a["x-systemId"] = r;
	},
	setDocumentMode(e, t) {
		e["x-mode"] = t;
	},
	getDocumentMode(e) {
		return e["x-mode"];
	},
	detachNode(e) {
		if (e.parent) {
			let t = e.parent.children.indexOf(e), { prev: n, next: r } = e;
			e.prev = null, e.next = null, n && (n.next = r), r && (r.prev = n), e.parent.children.splice(t, 1), e.parent = null;
		}
	},
	insertText(e, t) {
		let n = e.children[e.children.length - 1];
		n && On(n) ? n.data += t : Kf.appendChild(e, Kf.createTextNode(t));
	},
	insertTextBefore(e, t, n) {
		let r = e.children[e.children.indexOf(n) - 1];
		r && On(r) ? r.data += t : Kf.insertBefore(e, Kf.createTextNode(t), n);
	},
	adoptAttributes(e, t) {
		for (let n = 0; n < t.length; n++) {
			let r = t[n].name;
			e.attribs[r] === void 0 && (e.attribs[r] = t[n].value, e["x-attribsNamespace"][r] = t[n].namespace, e["x-attribsPrefix"][r] = t[n].prefix);
		}
	},
	getFirstChild(e) {
		return e.children[0];
	},
	getChildNodes(e) {
		return e.children;
	},
	getParentNode(e) {
		return e.parent;
	},
	getAttrList(e) {
		return e.attributes;
	},
	getTagName(e) {
		return e.name;
	},
	getNamespaceURI(e) {
		return e.namespace;
	},
	getTextNodeContent(e) {
		return e.data;
	},
	getCommentNodeContent(e) {
		return e.data;
	},
	getDocumentTypeNodeName(e) {
		return e["x-name"] ?? "";
	},
	getDocumentTypeNodePublicId(e) {
		return e["x-publicId"] ?? "";
	},
	getDocumentTypeNodeSystemId(e) {
		return e["x-systemId"] ?? "";
	},
	isDocumentTypeNode(e) {
		return An(e) && e.name === "!doctype";
	},
	setNodeSourceCodeLocation(e, t) {
		t && (e.startIndex = t.startOffset, e.endIndex = t.endOffset), e.sourceCodeLocation = t;
	},
	getNodeSourceCodeLocation(e) {
		return e.sourceCodeLocation;
	},
	updateNodeSourceCodeLocation(e, t) {
		t.endOffset != null && (e.endIndex = t.endOffset), e.sourceCodeLocation = {
			...e.sourceCodeLocation,
			...t
		};
	}
};
//#endregion
//#region node_modules/.pnpm/cheerio@1.2.0/node_modules/cheerio/dist/browser/parsers/parse5-adapter.js
function qf(e, t, n, r) {
	return t.treeAdapter ??= Kf, t.scriptingEnabled !== !1 && (t.scriptingEnabled = !0), n ? Hf(e, t) : Uf(r, e, t);
}
var Jf = { treeAdapter: Kf };
function Yf(e) {
	let t = "length" in e ? e : [e];
	for (let e = 0; e < t.length; e += 1) {
		let n = t[e];
		jn(n) && Array.prototype.splice.call(t, e, 1, ...n.children);
	}
	let n = "";
	for (let e = 0; e < t.length; e += 1) {
		let r = t[e];
		n += Pf(r, Jf);
	}
	return n;
}
var Xf = yc(js((e, t, n, r) => t._useHtmlParser2 ? Xi(e, t) : qf(e, t, n, r)), (e, t) => t._useHtmlParser2 ? Yn(e, t) : Yf(e)), Zf = typeof window < "u" ? window.btoa ? function(e) {
	return btoa(unescape(encodeURIComponent(e)));
} : function(e) {
	let t = unescape(encodeURIComponent(e + "")), n = "";
	for (let e, r, i = 0, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; t.charAt(i | 0) || (a = "=", i % 1); n += a.charAt(63 & e >> 8 - i % 1 * 8)) {
		/* c8 ignore next 3 */
		if (r = t.charCodeAt(i += 3 / 4), r > 255) throw Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
		e = e << 8 | r;
	}
	return n;
} : function(e) {
	return Buffer.from(e).toString("base64");
};
function $(e, t) {
	let n = ep(e, t);
	return (t && t.fallback !== void 0 ? t.fallback : $.defaults.fallback) === !0 && n === "" && (n = ep(Zf(e), t)), n;
}
var Qf = {
	bg: {
		Й: "Y",
		й: "y",
		X: "H",
		x: "h",
		Ц: "Ts",
		ц: "ts",
		Щ: "Sht",
		щ: "sht",
		Ъ: "A",
		ъ: "a",
		Ь: "Y",
		ь: "y"
	},
	de: {
		Ä: "AE",
		ä: "ae",
		Ö: "OE",
		ö: "oe",
		Ü: "UE",
		ü: "ue"
	},
	sr: {
		đ: "dj",
		Đ: "DJ"
	},
	uk: {
		И: "Y",
		и: "y",
		Й: "Y",
		й: "y",
		Ц: "Ts",
		ц: "ts",
		Х: "Kh",
		х: "kh",
		Щ: "Shch",
		щ: "shch",
		Г: "H",
		г: "h"
	}
}, $f = {};
function ep(e, t) {
	if (typeof e != "string") throw Error("slug() requires a string argument, received " + typeof e);
	if (!e.isWellFormed()) throw Error("slug() received a malformed string with lone surrogates");
	typeof t == "string" && (t = { replacement: t }), t = t ? Object.assign({}, t) : {}, t.mode = t.mode || $.defaults.mode;
	let n = $.defaults.modes[t.mode], r = [
		"replacement",
		"multicharmap",
		"charmap",
		"remove",
		"lower",
		"trim"
	];
	for (let e, i = 0, a = r.length; i < a; i++) e = r[i], t[e] = e in t ? t[e] : n[e];
	let i = Qf[t.locale] || $f, a = [];
	for (let e in t.multicharmap) {
		if (!Object.prototype.hasOwnProperty.call(t.multicharmap, e)) continue;
		let n = e.length;
		a.indexOf(n) === -1 && a.push(n);
	}
	a = a.sort(function(e, t) {
		return t - e;
	});
	let o = t.mode === "rfc3986" ? /[^\w\s\-.~]/ : /[^A-Za-z0-9\s]/, s = "";
	for (let n, r = 0, c = e.length; r < c; r++) {
		n = e[r];
		let c = !1;
		for (let i = 0; i < a.length; i++) {
			let o = a[i], s = e.substr(r, o);
			if (t.multicharmap[s]) {
				r += o - 1, n = t.multicharmap[s], c = !0;
				break;
			}
		}
		c || (n = i[n] ? i[n] : t.charmap[n] ? t.charmap[n].replace(t.replacement, " ") : n.includes(t.replacement) ? n.replace(t.replacement, " ") : n.replace(o, "")), s += n;
	}
	return t.remove && (s = s.replace(t.remove, "")), t.trim && (s = s.trim()), s = s.replace(/\s+/g, t.replacement), t.lower && (s = s.toLowerCase()), s;
}
var tp = {
	फ़: "Fi",
	ग़: "Ghi",
	ख़: "Khi",
	क़: "Qi",
	ड़: "ugDha",
	ढ़: "ugDhha",
	य़: "Yi",
	ज़: "Za",
	בִי: "i",
	בֵ: "e",
	בֵי: "e",
	בֶ: "e",
	בַ: "a",
	בָ: "a",
	בֹ: "o",
	וֹ: "o",
	בֻ: "u",
	וּ: "u",
	בּ: "b",
	כּ: "k",
	ךּ: "k",
	פּ: "p",
	שׁ: "sh",
	שׂ: "s",
	בְ: "e",
	חֱ: "e",
	חֲ: "a",
	חֳ: "o",
	בִ: "i"
}, np = {
	À: "A",
	Á: "A",
	Â: "A",
	Ã: "A",
	Ä: "A",
	Å: "A",
	Æ: "AE",
	Ç: "C",
	È: "E",
	É: "E",
	Ê: "E",
	Ë: "E",
	Ì: "I",
	Í: "I",
	Î: "I",
	Ï: "I",
	Ð: "D",
	Ñ: "N",
	Ò: "O",
	Ó: "O",
	Ô: "O",
	Õ: "O",
	Ö: "O",
	Ő: "O",
	Ø: "O",
	Ō: "O",
	Ù: "U",
	Ú: "U",
	Û: "U",
	Ü: "U",
	Ű: "U",
	Ý: "Y",
	Þ: "TH",
	ß: "ss",
	à: "a",
	á: "a",
	â: "a",
	ã: "a",
	ä: "a",
	å: "a",
	æ: "ae",
	ç: "c",
	è: "e",
	é: "e",
	ê: "e",
	ë: "e",
	ì: "i",
	í: "i",
	î: "i",
	ï: "i",
	ð: "d",
	ñ: "n",
	ò: "o",
	ó: "o",
	ô: "o",
	õ: "o",
	ö: "o",
	ő: "o",
	ø: "o",
	ō: "o",
	Œ: "OE",
	œ: "oe",
	ù: "u",
	ú: "u",
	û: "u",
	ü: "u",
	ű: "u",
	ý: "y",
	þ: "th",
	ÿ: "y",
	ẞ: "SS",
	α: "a",
	β: "b",
	γ: "g",
	δ: "d",
	ε: "e",
	ζ: "z",
	η: "h",
	θ: "th",
	ι: "i",
	κ: "k",
	λ: "l",
	μ: "m",
	ν: "n",
	ξ: "3",
	ο: "o",
	π: "p",
	ρ: "r",
	σ: "s",
	τ: "t",
	υ: "y",
	φ: "f",
	χ: "x",
	ψ: "ps",
	ω: "w",
	ά: "a",
	έ: "e",
	ί: "i",
	ό: "o",
	ύ: "y",
	ή: "h",
	ώ: "w",
	ς: "s",
	ϊ: "i",
	ΰ: "y",
	ϋ: "y",
	ΐ: "i",
	Α: "A",
	Β: "B",
	Γ: "G",
	Δ: "D",
	Ε: "E",
	Ζ: "Z",
	Η: "H",
	Θ: "Th",
	Ι: "I",
	Κ: "K",
	Λ: "L",
	Μ: "M",
	Ν: "N",
	Ξ: "3",
	Ο: "O",
	Π: "P",
	Ρ: "R",
	Σ: "S",
	Τ: "T",
	Υ: "Y",
	Φ: "F",
	Χ: "X",
	Ψ: "PS",
	Ω: "W",
	Ά: "A",
	Έ: "E",
	Ί: "I",
	Ό: "O",
	Ύ: "Y",
	Ή: "H",
	Ώ: "W",
	Ϊ: "I",
	Ϋ: "Y",
	ş: "s",
	Ş: "S",
	ı: "i",
	İ: "I",
	ğ: "g",
	Ğ: "G",
	а: "a",
	б: "b",
	в: "v",
	г: "g",
	д: "d",
	е: "e",
	ё: "yo",
	ж: "zh",
	з: "z",
	и: "i",
	й: "j",
	к: "k",
	л: "l",
	м: "m",
	н: "n",
	о: "o",
	п: "p",
	р: "r",
	с: "s",
	т: "t",
	у: "u",
	ф: "f",
	х: "h",
	ц: "c",
	ч: "ch",
	ш: "sh",
	щ: "sh",
	ъ: "u",
	ы: "y",
	ь: "",
	э: "e",
	ю: "yu",
	я: "ya",
	А: "A",
	Б: "B",
	В: "V",
	Г: "G",
	Д: "D",
	Е: "E",
	Ё: "Yo",
	Ж: "Zh",
	З: "Z",
	И: "I",
	Й: "J",
	К: "K",
	Л: "L",
	М: "M",
	Н: "N",
	О: "O",
	П: "P",
	Р: "R",
	С: "S",
	Т: "T",
	У: "U",
	Ф: "F",
	Х: "H",
	Ц: "C",
	Ч: "Ch",
	Ш: "Sh",
	Щ: "Sh",
	Ъ: "U",
	Ы: "Y",
	Ь: "",
	Э: "E",
	Ю: "Yu",
	Я: "Ya",
	Є: "Ye",
	І: "I",
	Ї: "Yi",
	Ґ: "G",
	є: "ye",
	і: "i",
	ї: "yi",
	ґ: "g",
	č: "c",
	ď: "d",
	ě: "e",
	ň: "n",
	ř: "r",
	š: "s",
	ť: "t",
	ů: "u",
	ž: "z",
	Č: "C",
	Ď: "D",
	Ě: "E",
	Ň: "N",
	Ř: "R",
	Š: "S",
	Ť: "T",
	Ů: "U",
	Ž: "Z",
	ľ: "l",
	ĺ: "l",
	ŕ: "r",
	Ľ: "L",
	Ĺ: "L",
	Ŕ: "R",
	ą: "a",
	ć: "c",
	ę: "e",
	ł: "l",
	ń: "n",
	ś: "s",
	ź: "z",
	ż: "z",
	Ą: "A",
	Ć: "C",
	Ę: "E",
	Ł: "L",
	Ń: "N",
	Ś: "S",
	Ź: "Z",
	Ż: "Z",
	ā: "a",
	ē: "e",
	ģ: "g",
	ī: "i",
	ķ: "k",
	ļ: "l",
	ņ: "n",
	ū: "u",
	Ā: "A",
	Ē: "E",
	Ģ: "G",
	Ī: "I",
	Ķ: "K",
	Ļ: "L",
	Ņ: "N",
	Ū: "U",
	أ: "a",
	إ: "i",
	ب: "b",
	ت: "t",
	ث: "th",
	ج: "g",
	ح: "h",
	خ: "kh",
	د: "d",
	ذ: "th",
	ر: "r",
	ز: "z",
	س: "s",
	ش: "sh",
	ص: "s",
	ض: "d",
	ط: "t",
	ظ: "th",
	ع: "aa",
	غ: "gh",
	ف: "f",
	ق: "k",
	ك: "k",
	ل: "l",
	م: "m",
	ن: "n",
	ه: "h",
	و: "o",
	ي: "y",
	ء: "aa",
	ة: "a",
	آ: "a",
	ا: "a",
	پ: "p",
	ژ: "zh",
	گ: "g",
	چ: "ch",
	ک: "k",
	ی: "i",
	ė: "e",
	į: "i",
	ų: "u",
	Ė: "E",
	Į: "I",
	Ų: "U",
	ț: "t",
	Ț: "T",
	ţ: "t",
	Ţ: "T",
	ș: "s",
	Ș: "S",
	ă: "a",
	Ă: "A",
	Ạ: "A",
	Ả: "A",
	Ầ: "A",
	Ấ: "A",
	Ậ: "A",
	Ẩ: "A",
	Ẫ: "A",
	Ằ: "A",
	Ắ: "A",
	Ặ: "A",
	Ẳ: "A",
	Ẵ: "A",
	Ẹ: "E",
	Ẻ: "E",
	Ẽ: "E",
	Ề: "E",
	Ế: "E",
	Ệ: "E",
	Ể: "E",
	Ễ: "E",
	Ị: "I",
	Ỉ: "I",
	Ĩ: "I",
	Ọ: "O",
	Ỏ: "O",
	Ồ: "O",
	Ố: "O",
	Ộ: "O",
	Ổ: "O",
	Ỗ: "O",
	Ơ: "O",
	Ờ: "O",
	Ớ: "O",
	Ợ: "O",
	Ở: "O",
	Ỡ: "O",
	Ụ: "U",
	Ủ: "U",
	Ũ: "U",
	Ư: "U",
	Ừ: "U",
	Ứ: "U",
	Ự: "U",
	Ử: "U",
	Ữ: "U",
	Ỳ: "Y",
	Ỵ: "Y",
	Ỷ: "Y",
	Ỹ: "Y",
	Đ: "D",
	ạ: "a",
	ả: "a",
	ầ: "a",
	ấ: "a",
	ậ: "a",
	ẩ: "a",
	ẫ: "a",
	ằ: "a",
	ắ: "a",
	ặ: "a",
	ẳ: "a",
	ẵ: "a",
	ẹ: "e",
	ẻ: "e",
	ẽ: "e",
	ề: "e",
	ế: "e",
	ệ: "e",
	ể: "e",
	ễ: "e",
	ị: "i",
	ỉ: "i",
	ĩ: "i",
	ọ: "o",
	ỏ: "o",
	ồ: "o",
	ố: "o",
	ộ: "o",
	ổ: "o",
	ỗ: "o",
	ơ: "o",
	ờ: "o",
	ớ: "o",
	ợ: "o",
	ở: "o",
	ỡ: "o",
	ụ: "u",
	ủ: "u",
	ũ: "u",
	ư: "u",
	ừ: "u",
	ứ: "u",
	ự: "u",
	ử: "u",
	ữ: "u",
	ỳ: "y",
	ỵ: "y",
	ỷ: "y",
	ỹ: "y",
	đ: "d",
	Ә: "AE",
	ә: "ae",
	Ғ: "GH",
	ғ: "gh",
	Қ: "KH",
	қ: "kh",
	Ң: "NG",
	ң: "ng",
	Ү: "UE",
	ү: "ue",
	Ұ: "U",
	ұ: "u",
	Һ: "H",
	һ: "h",
	Ө: "OE",
	ө: "oe",
	ђ: "dj",
	ј: "j",
	љ: "lj",
	њ: "nj",
	ћ: "c",
	џ: "dz",
	Ђ: "Dj",
	Ј: "j",
	Љ: "Lj",
	Њ: "Nj",
	Ћ: "C",
	Џ: "Dz",
	ǌ: "nj",
	ǉ: "lj",
	ǋ: "NJ",
	ǈ: "LJ",
	अ: "a",
	आ: "aa",
	ए: "e",
	ई: "ii",
	ऍ: "ei",
	ऎ: "ae",
	ऐ: "ai",
	इ: "i",
	ओ: "o",
	ऑ: "oi",
	ऒ: "oii",
	ऊ: "uu",
	औ: "ou",
	उ: "u",
	ब: "B",
	भ: "Bha",
	च: "Ca",
	छ: "Chha",
	ड: "Da",
	ढ: "Dha",
	फ: "Fa",
	ग: "Ga",
	घ: "Gha",
	ग़: "Ghi",
	ह: "Ha",
	ज: "Ja",
	झ: "Jha",
	क: "Ka",
	ख: "Kha",
	ख़: "Khi",
	ल: "L",
	ळ: "Li",
	ऌ: "Li",
	ऴ: "Lii",
	ॡ: "Lii",
	म: "Ma",
	न: "Na",
	ङ: "Na",
	ञ: "Nia",
	ण: "Nae",
	ऩ: "Ni",
	ॐ: "oms",
	प: "Pa",
	क़: "Qi",
	र: "Ra",
	ऋ: "Ri",
	ॠ: "Ri",
	ऱ: "Ri",
	स: "Sa",
	श: "Sha",
	ष: "Shha",
	ट: "Ta",
	त: "Ta",
	ठ: "Tha",
	द: "Tha",
	थ: "Tha",
	ध: "Thha",
	ड़: "ugDha",
	ढ़: "ugDhha",
	व: "Va",
	य: "Ya",
	य़: "Yi",
	ज़: "Za",
	ə: "e",
	Ə: "E",
	ა: "a",
	ბ: "b",
	გ: "g",
	დ: "d",
	ე: "e",
	ვ: "v",
	ზ: "z",
	თ: "t",
	ი: "i",
	კ: "k",
	ლ: "l",
	მ: "m",
	ნ: "n",
	ო: "o",
	პ: "p",
	ჟ: "zh",
	რ: "r",
	ს: "s",
	ტ: "t",
	უ: "u",
	ფ: "p",
	ქ: "k",
	ღ: "gh",
	ყ: "q",
	შ: "sh",
	ჩ: "ch",
	ც: "ts",
	ძ: "dz",
	წ: "ts",
	ჭ: "ch",
	ხ: "kh",
	ჯ: "j",
	ჰ: "h",
	ב: "v",
	גּ: "g",
	ג: "g",
	ד: "d",
	דּ: "d",
	ה: "h",
	ו: "v",
	ז: "z",
	ח: "h",
	ט: "t",
	י: "y",
	כ: "kh",
	ך: "kh",
	ל: "l",
	מ: "m",
	ם: "m",
	נ: "n",
	ן: "n",
	ס: "s",
	פ: "f",
	ף: "f",
	ץ: "ts",
	צ: "ts",
	ק: "k",
	ר: "r",
	תּ: "t",
	ת: "t"
};
$.charmap = Object.assign({}, np), $.multicharmap = Object.assign({}, tp), $.defaults = {
	charmap: $.charmap,
	mode: "pretty",
	modes: {
		rfc3986: {
			replacement: "-",
			remove: null,
			lower: !0,
			charmap: $.charmap,
			multicharmap: $.multicharmap,
			trim: !0
		},
		pretty: {
			replacement: "-",
			remove: null,
			lower: !0,
			charmap: $.charmap,
			multicharmap: $.multicharmap,
			trim: !0
		}
	},
	multicharmap: $.multicharmap,
	fallback: !0
}, $.reset = function() {
	$.defaults.modes.rfc3986.charmap = $.defaults.modes.pretty.charmap = $.charmap = $.defaults.charmap = Object.assign({}, np), $.defaults.modes.rfc3986.multicharmap = $.defaults.modes.pretty.multicharmap = $.multicharmap = $.defaults.multicharmap = Object.assign({}, tp), $f = "";
}, $.extend = function(e) {
	let t = Object.keys(e), n = {}, r = {};
	for (let i = 0; i < t.length; i++) t[i].length > 1 ? n[t[i]] = e[t[i]] : r[t[i]] = e[t[i]];
	Object.assign($.charmap, r), Object.assign($.multicharmap, n);
}, $.setLocale = function(e) {
	$f = Qf[e] || {};
};
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/context/utils.js
function rp(e) {
	return e.children.every(ip);
}
function ip(e) {
	return e.kindOf([
		O.ExportContainer,
		O.Interface,
		O.Class,
		O.Enum
	]);
}
function ap(e) {
	return e.kindOf([
		O.Interface,
		O.Class,
		O.Enum
	]);
}
function op(e, t) {
	return Array.isArray(e) ? e.map((e) => op(e, t)) : typeof e != "object" || !e ? e : {
		...t(e),
		children: e.children.map((e) => op(e, t))
	};
}
function sp(e) {
	let t = Xf(e, null, !1);
	return t("h1").each((e, n) => {
		t(n).wrapInner("<h2></h2>").children(":first-child").unwrap();
	}), t("a").find(">h1, >h2, >h3, >h4, >h5, >h6").each((e, n) => {
		let r = t(n), i = r.parent(), a = t("<a></a>");
		i.after(r), i.remove(), a.attr("href", i.attr("href")), a.append(r.contents()), r.attr("id", i.attr("id")), r.append(a);
	}), t.html();
}
function cp(e, t) {
	let n = [];
	for (let r of t) n.length > 0 && n.push(e), n.push(r);
	return n;
}
function lp(e) {
	let t = e.split(/([^0-9A-Za-z]+|[0-9]+|(?<=[a-z])(?=[A-Z]))/).filter((e) => e.length);
	return cp(D.createElement("wbr", null), t);
}
function up(e, t) {
	let n = [], r = [];
	for (let i of e) t(i) ? n.push(i) : r.push(i);
	return [n, r];
}
var dp = (e, t) => {
	if (e instanceof E) return e.urlTo(t);
	if (e instanceof te) return e.getFullUrl(t);
	throw Error("Unknown URL factory type");
};
function fp(e) {
	return `section.${$(e.title)}`;
}
function pp(e) {
	return `${O.classString(e.kind).replace("tsd-kind-", "")}.${$(e.name)}`;
}
function mp(e, t, n) {
	if (n || !t.parent || ip(t)) return dp(e, t);
	let r = dp(e, t.parent), i = pp(t);
	return r === void 0 ? dp(e, t) : `${r}#${i}`;
}
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/context/base.js
var hp = class extends E {
	constructor(e, t, n, r) {
		super(e, t, n, r);
		let i = this.markdown;
		this.markdown = (e) => sp(i(e) ?? "");
	}
	sectionSlug(e) {
		return fp(e);
	}
	itemSlug(e) {
		return pp(e);
	}
	itemLink(e, t) {
		return mp(this, e, t);
	}
	itemSourceLink(e) {
		if (!(!e.isDeclaration() && !e.isSignature())) return e.sources?.map((e) => e.url).find((e) => e);
	}
}, gp = (e) => class extends e {
	commentTags = (e) => {
		if (!e.comment) return;
		let t = this.options.getValue("notRenderedTags");
		e.kindOf(O.SomeSignature) && t.push("@returns");
		let n = e.comment.blockTags.filter((e) => !e.skipRendering).filter((e) => !t.includes(e.tag));
		return D.createElement(D.Fragment, null, this.hook("comment.beforeTags", this, e.comment, e), D.createElement("div", { class: "item-table comment-tags" }, n.map((e) => D.createElement(D.Fragment, null, D.createElement("dt", null, D.createElement("span", {
			class: "stab",
			title: e.name
		}, e.name ?? e.tag.replace("@", ""))), D.createElement("dd", null, D.createElement(D.Raw, { html: this.markdown(e.content) }))))), this.hook("comment.afterTags", this, e.comment, e));
	};
}, _p = (e) => class extends e {
	reflectionTemplate = (e) => {
		let { model: t } = e;
		return D.createElement(D.Fragment, null, D.createElement("div", { class: "main-heading" }, D.createElement("div", { class: "rustdoc-breadcrumbs" }, this.#e(e.model.parent)), D.createElement("h1", null, O.singularString(t.kind) + " ", D.createElement("span", null, t.name), this.#t(t), D.createElement("button", {
			id: "copy-path",
			title: "Copy item path to clipboard"
		}, "Copy item path")), D.createElement("rustdoc-toolbar", null), this.#n(t)), t.hasComment() && D.createElement("details", {
			class: "toggle top-doc",
			open: !0
		}, D.createElement("summary", { class: "hideme" }, D.createElement("span", null, "Expand description")), D.createElement("div", { class: "docblock" }, this.commentSummary(t), this.commentTags(t))), this.members(t));
	};
	#e(e) {
		if (!e || e.isProject()) return [];
		if (e.kindOf(O.SomeSignature)) return this.#e(e.parent);
		let t = [...this.#e(e.parent), D.createElement("a", { href: this.urlTo(e) }, e.name)];
		return cp([".", D.createElement("wbr", null)], t);
	}
	#t(e) {
		if (!(!e.isDeclaration() && !e.isSignature()) && e.typeParameters) return [
			"<",
			cp(", ", e.typeParameters.map((e) => e.name)),
			">"
		];
	}
	#n(e) {
		let t = this.itemSourceLink(e);
		if (t) return D.createElement("span", { class: "sub-heading" }, D.createElement("a", {
			class: "src",
			href: t
		}, "Source"));
	}
}, vp = (e) => class extends e {
	defaultLayout = (e, t) => D.createElement("html", {
		lang: this.options.getValue("lang"),
		"data-base": this.relativeURL("./")
	}, this.#e(t), D.createElement("body", { class: "rustdoc" }, D.createElement(D.Raw, { html: "<!--[if lte IE 11]>" }), D.createElement("div", { class: "warning" }, "This old browser is unsupported and will most likely display funky things."), D.createElement(D.Raw, { html: "<![endif]-->" }), this.hook("body.begin", this), this.#t(t), this.#n(t), this.#r(e, t), this.hook("body.end", this)));
	#e(e) {
		let { model: t, project: n } = e, r = t.name;
		return t.parent && !t.parent.isProject() && (r = `${r} in ${t.parent.getFriendlyFullName()}`), t.isProject() || (r = `${r} - ${n.name}`), D.createElement("head", null, D.createElement("meta", { charset: "utf-8" }), this.hook("head.begin", this), D.createElement("meta", {
			"http-equiv": "x-ua-compatible",
			content: "IE=edge"
		}), D.createElement("title", null, r), D.createElement("meta", {
			name: "description",
			content: "Documentation for " + n.name
		}), D.createElement("meta", {
			name: "viewport",
			content: "width=device-width, initial-scale=1"
		}), [
			"fonts/SourceSerif4-Regular.ttf.woff2",
			"fonts/FiraSans-Regular.woff2",
			"fonts/FiraSans-Medium.woff2",
			"fonts/SourceCodePro-Regular.ttf.woff2",
			"fonts/SourceSerif4-Bold.ttf.woff2",
			"fonts/SourceCodePro-Semibold.ttf.woff2"
		].map((e) => D.createElement("link", {
			rel: "preload",
			as: "font",
			type: "font/woff2",
			crossOrigin: "anonymous",
			href: yp(e)
		})), D.createElement("link", {
			rel: "stylesheet",
			type: "text/css",
			href: yp("css/normalize.min.css")
		}), D.createElement("link", {
			rel: "stylesheet",
			type: "text/css",
			href: this.relativeURL("assets/oxide/rustdoc/rustdoc.css")
		}), D.createElement("meta", {
			name: "rustdoc-vars",
			"data-root-path": this.relativeURL(""),
			"data-static-root-path": this.relativeURL("assets/oxide/rustdoc/"),
			"data-current-crate": e.project.name,
			"data-themes": "",
			"data-resource-suffix": "",
			"data-rustdoc-version": "1.86.0",
			"data-channel": "1.86.0",
			"data-search-js": "search.js",
			"data-settings-js": "settings.js"
		}), D.createElement("script", { src: yp("js/storage.min.js") }), D.createElement("script", {
			defer: !0,
			src: this.relativeURL("assets/oxide/rustdoc/main.js")
		}), D.createElement("noscript", null, D.createElement("link", {
			rel: "stylesheet",
			href: yp("css/noscript.min.css")
		})), D.createElement("link", {
			rel: "stylesheet",
			href: this.relativeURL("assets/highlight.css")
		}), D.createElement("link", {
			rel: "stylesheet",
			href: this.relativeURL("assets/oxide/index.css")
		}), D.createElement("script", { src: this.relativeURL("assets/oxide/index.js") }), this.options.getValue("customCss") && D.createElement("link", {
			rel: "stylesheet",
			href: this.relativeURL("assets/custom.css")
		}), this.hook("head.end", this));
	}
	#t(e) {
		let { project: t } = e;
		return D.createElement("nav", { class: "mobile-topbar" }, D.createElement("button", {
			class: "sidebar-menu-toggle",
			title: "show sidebar"
		}), D.createElement("h2", { class: "location" }, D.createElement("a", { href: "#" }, t.name)));
	}
	#n(e) {
		let { project: t } = e;
		return D.createElement(D.Fragment, null, D.createElement("nav", { class: "sidebar" }, D.createElement("div", { class: "sidebar-crate" }, D.createElement("h2", null, D.createElement("a", { href: this.relativeURL("index.html") }, t.name), D.createElement("span", { class: "version" }, t.packageVersion))), this.hook("sidebar.begin", this), this.navigation(e), this.hook("sidebar.end", this)), D.createElement("div", { class: "sidebar-resizer" }));
	}
	#r(e, t) {
		return D.createElement("main", null, D.createElement("div", { class: "width-limiter" }, D.createElement("rustdoc-search", null), D.createElement("section", {
			id: "main-content",
			class: "content"
		}, this.hook("content.begin", this), e(t), this.hook("content.end", this)), D.createElement("section", {
			id: "alternative-display",
			class: "content hidden"
		}, D.createElement("oxide-search-results", { id: "search" }))));
	}
};
function yp(e) {
	return `https://cdn.jsdelivr.net/gh/rust-lang/rust@1.86.0/src/librustdoc/html/static/${e}`;
}
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/context/mixins/members.js
var bp = (e) => class extends e {
	members = (e) => {
		let [t, n] = up(e.categories ?? [], rp), [r, i] = up(e.groups ?? [], rp), [a, o] = up([...t, ...r], (e) => e.children.every((e) => e.kindOf(O.ExportContainer))), s = [...n, ...i.flatMap((e) => e.categories ?? [e])], c = ap(e);
		return D.createElement(D.Fragment, null, this.#e(e), a.map((e) => this.#t(e, !0)), c ? s.map((e) => this.#n(e)) : s.map((e) => this.#t(e, !0)), o.map((e) => this.#t(e, !0)));
	};
	#e(e) {
		if (!e.isDeclaration()) return;
		if (e.signatures?.length) return e.signatures.map((e) => D.createElement(D.Fragment, null, D.createElement("pre", { class: "item-decl" }, D.createElement("code", null, Cp(this.memberSignatureTitle(e)))), D.createElement("div", { class: "docblock" }, this.commentSummary(e), this.commentTags(e))));
		e.indexSignatures && (e.children ??= []);
		let t = this.reflectionPreview(e);
		if (t) return D.createElement("pre", { class: "item-decl" }, D.createElement("code", null, Sp(Cp(t))));
		if (!ip(e)) return D.createElement("pre", { class: "item-decl" }, D.createElement("code", null, this.#l(e, !0)));
	}
	#t = (e, t) => {
		let n = this.sectionSlug(e);
		return D.createElement(D.Fragment, null, D.createElement("h2", {
			id: n,
			class: "section-header"
		}, e.title, D.createElement("a", {
			href: `#${n}`,
			class: "anchor"
		}, "§")), D.createElement("dl", { class: "item-table" }, e.children.map((e) => {
			let n = e.comment?.getShortSummary(!0);
			return !n && e.isDeclaration() && (n = e.signatures?.[0]?.comment?.getShortSummary(!0)), D.createElement(D.Fragment, null, D.createElement("dt", null, D.createElement("a", {
				class: xp(e),
				href: this.itemLink(e, t),
				title: e.name
			}, e.name)), D.createElement("dd", null, D.createElement(D.Raw, { html: this.markdown(n) })));
		})));
	};
	#n(e) {
		let t = this.sectionSlug(e), n = "impl-items";
		return e.children.every((e) => e.kindOf(O.EnumMember)) && (n = "variants"), e.children.every((e) => e.kindOf(O.Property)) && (n = ""), D.createElement(D.Fragment, null, D.createElement("h2", {
			id: t,
			class: "section-header"
		}, e.title, D.createElement("a", {
			href: `#${t}`,
			class: "anchor"
		}, "§")), D.createElement("div", { class: n }, e.children.map((e) => this.#r(e))));
	}
	#r(e) {
		return e instanceof ae ? this.#i(e) : e.kindOf(O.EnumMember) ? this.#a(e) : this.#o(e);
	}
	#i(e) {
		console.log("DocumentReflection", e.getFullName());
	}
	#a(e) {
		let t = this.itemSlug(e);
		return D.createElement(D.Fragment, null, D.createElement("section", {
			id: t,
			class: "variant"
		}, D.createElement("a", {
			href: `#${t}`,
			class: "anchor"
		}, "§"), D.createElement("h3", { class: "code-header" }, e.name, " = ", Cp(this.type(e.type)))), D.createElement("div", { class: "docblock" }, this.commentSummary(e), this.commentTags(e)));
	}
	#o(e) {
		let t = this.itemSlug(e);
		return e.signatures?.length ? e.signatures?.map((e, n) => n === 0 ? this.#s(e, t) : this.#s(e, `${t}-${n}`)) : e.hasGetterOrSetter() ? [e.getSignature, e.setSignature].filter((e) => e != null).map((e, n) => n === 0 ? this.#s(e, t) : this.#s(e, `${t}-${n}`)) : this.#c(e, t);
	}
	#s(e, t) {
		return D.createElement("details", {
			class: "toggle method-toggle",
			open: !0
		}, D.createElement("summary", null, D.createElement("section", {
			id: t,
			class: "method trait-impl"
		}, this.#d(e), D.createElement("a", {
			href: t && `#${t}`,
			class: "anchor"
		}, "§"), D.createElement("h4", { class: "code-header" }, Cp(this.memberSignatureTitle(e))))), D.createElement("div", { class: "docblock" }, this.commentSummary(e), this.commentTags(e)));
	}
	#c(e, t) {
		return e.kindOf(O.Property) ? D.createElement(D.Fragment, null, D.createElement("span", {
			id: t,
			class: "structfield section-header"
		}, D.createElement("a", {
			href: `#${t}`,
			class: "anchor field"
		}, "§"), D.createElement("code", null, this.#l(e))), D.createElement("div", { class: "docblock" }, this.commentSummary(e), this.commentTags(e))) : D.createElement("details", {
			class: "toggle method-toggle",
			open: !0
		}, D.createElement("summary", null, D.createElement("section", {
			id: t,
			class: "method trait-impl"
		}, this.#d(e), D.createElement("a", {
			href: `#${t}`,
			class: "anchor"
		}, "§"), D.createElement("h4", { class: "code-header" }, this.#l(e)))), D.createElement("div", { class: "docblock" }, this.commentSummary(e), this.commentTags(e)));
	}
	#l(e, t = !1) {
		let n = e.defaultValue;
		wp(n) ? n = D.createElement("span", { class: "macro" }, e.defaultValue) : Tp(n) && (n = D.createElement("span", { class: "primitive" }, e.defaultValue));
		let r;
		r = e.kindOf(O.SomeType) ? " = " : e.flags.isOptional ? "?: " : ": ";
		let i;
		return i = !t && e.type instanceof se ? "{ ... }" : this.type(e.type), D.createElement(D.Fragment, null, Cp(this.#u(e)), e.kindOf(O.SomeMember) ? D.createElement("span", null, lp(e.name)) : D.createElement("a", {
			class: xp(e),
			href: this.urlTo(e)
		}, lp(e.name)), Cp(this.#f(e.typeParameters)), i ? [r, Cp(i)] : (e.groups || e.categories) && `${r}{ ... }`, n);
	}
	#u(e) {
		let t = [];
		if (e.kindOf(O.SomeType) ? t.push("type") : e.kindOf(O.SomeValue) ? t.push(e.flags.isConst ? "const" : "let") : e.kindOf(O.ClassMember) && (e.flags.isPrivate && t.push("private"), e.flags.isProtected && t.push("protected"), e.flags.isPublic && t.push("public"), e.flags.isAbstract && t.push("abstract"), e.flags.isStatic && t.push("static"), e.flags.isReadonly && t.push("readonly")), t.length) return D.createElement("span", { class: "tsd-signature-keyword" }, t.join(" "), " ");
	}
	#d(e) {
		let t = this.itemSourceLink(e);
		if (t) return D.createElement("span", { class: "rightside" }, D.createElement("a", {
			class: "src",
			href: t
		}, "Source"));
	}
	#f(e) {
		if (e?.length) return D.createElement(D.Fragment, null, D.createElement("span", { class: "tsd-signature-symbol" }, "<"), cp(D.createElement("span", { class: "tsd-signature-symbol" }, ", "), e.map((e) => D.createElement(D.Fragment, null, e.varianceModifier ? `${e.varianceModifier} ` : "", D.createElement("span", {
			class: "tsd-signature-type",
			"data-tsd-kind": O.singularString(e.kind)
		}, e.name)))), D.createElement("span", { class: "tsd-signature-symbol" }, ">"));
	}
};
function xp(e) {
	switch (e.kind) {
		case O.Module:
		case O.Namespace: return "mod";
		case O.Function: return "fn";
		case O.TypeAlias: return "type";
		case O.Enum: return "enum";
		case O.Class: return "struct";
		case O.Interface: return "trait";
		case O.Variable: return "constant";
		default: return "foreigntype";
	}
}
function Sp(e) {
	return op(e, (e) => (e.tag === "a" && (e.tag = "span", e.props && delete e.props.href), e));
}
function Cp(e) {
	return op(e, (e) => {
		let t = {
			class: "",
			href: void 0,
			"data-tsd-kind": void 0,
			...e.props
		}, n = t.class.trim().split(/\s+/);
		if (n.includes("tsd-signature-type") && (wp(e.children[0]) ? n.push("macro") : Tp(e.children[0]) ? n.push("keyword") : t["data-tsd-kind"] === O.singularString(O.TypeParameter) || n.includes("tsd-kind-type-parameter") ? n.push("trait") : n.includes("tsd-kind-enum-member") ? n.push("constant") : n.push("type")), n.includes("tsd-signature-keyword") && n.push("token"), (n.includes("tsd-kind-interface") || n.includes("tsd-kind-type-alias") || n.includes("tsd-kind-constructor-signature")) && n.push("type"), n.includes("tsd-kind-type-parameter") && (n.push("trait"), e.tag = "span", delete t.href), n.includes("tsd-kind-enum-member") && t.href) {
			let [e, n] = t.href.split("#");
			t.href = `${e}#enum-member.${n}`;
		}
		return n.includes("tsd-kind-call-signature") && n.push("method"), t.class = n.join(" "), {
			...e,
			props: t
		};
	});
}
function wp(e) {
	return typeof e == "string" && /^(\d|".+"$)/.test(e);
}
function Tp(e) {
	return typeof e == "string" && [
		"boolean",
		"number",
		"string",
		"symbol",
		"unknown",
		"any",
		"void",
		"null",
		"undefined",
		"never",
		"object",
		"unique symbol"
	].includes(e);
}
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/context/index.js
var Ep = [
	vp,
	(e) => class extends e {
		indexTemplate = (e) => {
			let { model: t, project: n } = e;
			return D.createElement(D.Fragment, null, D.createElement("div", { class: "main-heading" }, D.createElement("h1", null, O.singularString(t.kind), " ", D.createElement("span", null, n.name), D.createElement("button", {
				id: "copy-path",
				title: "Copy item path to clipboard"
			}, "Copy item path")), D.createElement("rustdoc-toolbar", null)), D.createElement("details", {
				class: "toggle top-doc",
				open: !0
			}, D.createElement("summary", { class: "hideme" }, D.createElement("span", null, "Expand description")), D.createElement("div", { class: "docblock" }, D.createElement(D.Raw, { html: this.markdown(e.model.readme) }))), this.members(t));
		};
	},
	_p,
	(e) => class extends e {
		navigation = (e) => {
			let { model: t } = e;
			return D.createElement(D.Fragment, null, D.createElement("div", { class: "sidebar-elems" }, D.createElement("ul", { class: "block" }, D.createElement("li", null, D.createElement("a", { href: this.urlTo(t.project) }, "Exports"))), this.#e(t), this.#t(t)));
		};
		#e(e) {
			let t = e.parent;
			if (!(t instanceof re)) return;
			let n = t.getChildrenByKind(O.SomeModule);
			return D.createElement("section", null, D.createElement("ul", { class: "block" }, D.createElement("li", { class: "parent-module" }, D.createElement("a", { href: this.urlTo(t) }, "..")), n.map((t) => D.createElement("li", null, D.createElement("a", {
				href: this.urlTo(t),
				class: t.id === e.id ? "current" : ""
			}, t.name)))));
		}
		#t(e) {
			if (!(e instanceof re)) return;
			let [t, n] = up(e.categories ?? [], rp), [r, i] = up(e.groups ?? [], rp), [a, o] = up([...t, ...r], (e) => e.children.every((e) => e.kindOf(O.ExportContainer)));
			return [
				a.map((e) => this.#i(e, !0)),
				n.map((e) => this.#n(e)),
				i.map((e) => this.#r(e)),
				o.map((e) => this.#i(e, !0))
			];
		}
		#n(e) {
			return this.#i(e, !1);
		}
		#r(e) {
			return e.categories ? e.categories.map((e) => this.#n(e)) : this.#i(e, !1);
		}
		#i(e, t) {
			let n = this.sectionSlug(e);
			return D.createElement(D.Fragment, null, D.createElement("h3", null, D.createElement("a", { href: `#${n}` }, e.title)), D.createElement("ul", { class: "block" }, e.children.map((e) => this.#a(e, t))));
		}
		#a(e, t) {
			return D.createElement("li", { class: this.getReflectionClasses(e) }, D.createElement("a", { href: this.itemLink(e, t) }, e.name));
		}
	},
	gp,
	bp
], Dp = hp;
for (let e of Ep) Dp = e(Dp);
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/utils.js
function Op(e) {
	let t = [];
	if (e.comment && t.push(e.comment), e.isDocument() && t.push(new ne(e.content)), e.isDeclaration()) {
		let n = [
			...e.signatures ?? [],
			e.getSignature,
			e.setSignature
		];
		for (let e of n) e?.comment && t.push(e.comment);
	}
	return t.length ? t.flatMap((e) => [...e.summary, ...e.blockTags.flatMap((e) => e.content)]).map((e) => e.text).join("\n") : "";
}
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/theme.js
var kp = class extends ie {
	getRenderContext(e) {
		return new Dp(this.router, this, e, this.application.options);
	}
	async preRender(e) {
		await super.preRender(e);
		let t = sn();
		this.router.getLinkTargets().filter((e) => e instanceof oe).filter((e) => e.isDeclaration() || e.isDocument()).filter((e) => e.name && !e.flags.isExternal).forEach((e) => {
			try {
				t.add({
					id: e.id,
					name: e.name,
					comment: Op(e),
					kind: e.kind,
					parent: e.parent?.isProject() ? "" : e.parent?.getFriendlyFullName() ?? "",
					url: mp(this.router, e, !1)
				});
			} catch {}
		});
		let n = {};
		t.export((e, t) => {
			this.application.logger.info(`search index part: ${e}`), n[e] = JSON.parse(t);
		});
		let r = await ue(de)(Buffer.from(JSON.stringify(n))), i = le.join(e.outputDirectory, "assets", "oxide");
		await ce.mkdir(i, { recursive: !0 }), await ce.writeFile(le.join(i, "search-index.deflate"), r);
	}
	async postRender(e) {
		await super.postRender(e);
		let t = le.join(import.meta.dirname, "..", "assets"), n = le.join(e.outputDirectory, "assets", "oxide");
		try {
			await ce.access(t, ce.constants.F_OK), await ce.access(le.join(t, "rustdoc"), ce.constants.F_OK), await ce.mkdir(n, { recursive: !0 }), await ce.cp(t, n, { recursive: !0 });
		} catch (e) {
			console.log(e), this.application.logger.error("some front-end assets are missing."), this.application.logger.error("users of the theme should not see this, or I must have done something silly.");
		}
	}
};
//#endregion
//#region node_modules/.pnpm/typedoc-theme-oxide@0.3.0_typedoc@0.28.20_typescript@6.0.3_/node_modules/typedoc-theme-oxide/dist/plugin/index.js
function Ap(e) {
	e.renderer.defineTheme("oxide", kp);
}
//#endregion
//#region src/cli/doc.ts
var jp = async (e) => {
	let t = e.includes("--json"), { packageJsonPath: n, rootDir: r, cacheDir: i } = p();
	_e(i);
	let a = JSON.parse(b.readFileSync(n, "utf-8")), o = await pe(a, n);
	if ("err" in o) return u("failed to config package: " + o.err), 1;
	if (!(await he(a)).projectCount) return u("no typescript directory, cannot generate doc"), 1;
	let s = _(r, a, !0);
	if ("err" in s) return u("failed to parse exports: " + s.err), 1;
	let { exports: c } = s.val;
	if (!c.length) return u("exports are empty, cannot generate doc"), 1;
	let l = x.join(r, "tsconfig.src.json"), d = {
		entryPoints: c.map(({ sourcePathAbs: e }) => e),
		entryPointStrategy: "resolve",
		out: x.join(r, t ? "docs.json" : "docs"),
		theme: "oxide",
		plugin: [Ap],
		tsconfig: l,
		highlightLanguages: [
			"typescript",
			"css",
			"rust",
			"bash",
			"tsx"
		]
	}, f = await ee.bootstrapWithPlugins(d), m = await f.convert();
	return m ? (t ? await f.generateJson(m, d.out) : await f.generateDocs(m, d.out), 0) : (u("failed to process project with typedoc"), 61);
}, Mp = async (e) => {
	let n = e.includes("-n") || e.includes("--dry-run"), { rootDir: a, packageJsonPath: o, cacheDir: d } = p();
	b.existsSync(d) || b.mkdirSync(d, { recursive: !0 });
	let f = x.join(d, "pnpm-pack.temp.tgz");
	if ((await c("pnpm", a, [
		"pack",
		"--out",
		f
	])).err) return u("pnpm pack failed!"), 81;
	let m = x.join(d, "pnpm-pack.temp");
	if (b.existsSync(m) && b.rmSync(m, {
		recursive: !0,
		force: !0
	}), b.mkdirSync(m, { recursive: !0 }), (await c("tar", m, ["-xzf", "../pnpm-pack.temp.tgz"])).err) return u("tgz extract failed!"), 91;
	let h = x.join(m, "package", "package.json"), g = JSON.parse(b.readFileSync(h, "utf8")), v = JSON.parse(b.readFileSync(o, "utf8")), y = !!g["pistonight/mono-dev"]?.publish;
	delete g["pistonight/mono-dev"], delete g.private;
	let S = _(a, v);
	if ("err" in S) return u("failed to parse exports: " + S.err), 1;
	if (g.exports) {
		if (typeof g.exports == "string") return u("failed to parse exports: 'exports' field must be an object"), 1;
		let e = v["pistonight/mono-dev"]?.compile || {};
		for (let { entryName: n, distPathRel: r, distDtsPathRel: i } of S.val.exports) {
			let a = n === "." ? "." : "./" + n;
			a in e || (g.exports[a] = {
				import: "./" + t + "/" + r,
				types: "./" + t + "/" + i
			});
		}
	}
	if (g.imports) for (let e in g.imports) {
		if (!e.startsWith("#")) continue;
		let n = g.imports[e];
		if (!n.startsWith("./src") || !n.match(/\.(c|m)?tsx?$/)) continue;
		let r = n.lastIndexOf("."), i = n.substring(2, r), a = "./" + t + "/" + l + "/" + i + ".d.ts";
		g.imports[e] = a;
	}
	let C = !0;
	if (g.files) {
		for (let e in g.files) if (e.startsWith("dist")) {
			i("not adding 'dist/**/*' to files since there are dist paths specified in original package.json"), C = !1;
			break;
		}
	}
	C && (s("adding 'dist/**/*' to files in package.json"), g.files ? g.files.push("dist/**/*") : g.files = ["dist/**/*"]), g.devDependencies && Np(g.devDependencies), b.writeFileSync(h, r(JSON.stringify(g, void 0, 2)));
	let w = x.join(m, "package", "dist");
	b.existsSync(w) && b.rmSync(w, {
		recursive: !0,
		force: !0
	}), b.cpSync(x.join(a, "dist"), w, { recursive: !0 });
	let T = x.join(d, "pnpm-packed.tgz");
	return (await c("tar", d, [
		"-czf",
		"pnpm-packed.tgz",
		"-C",
		"pnpm-pack.temp",
		"package"
	])).err ? (u("tgz creation failed!"), 91) : (s("unpacked at: node_modules/.mono/pnpm-pack.temp/package"), s("packed at: " + T), n ? (s("dry-run, stopping"), 0) : y ? (await c("pnpm", a, [
		"publish",
		T,
		"--access",
		"public"
	])).err ? (u("pnpm publish failed!"), 101) : 0 : (u("please set mono-dev option \"publish\": true"), 1));
}, Np = (e) => {
	for (let t in e) {
		if (t !== "mono-dev") continue;
		let n = e[t];
		if (typeof n != "string") continue;
		let [r, i] = n.split("#", 2), a = r.toLowerCase();
		!a.startsWith("github:") || !a.endsWith("/mono-dev") || (e[t] = r + "#113e0c1e3269ea80844cb284a1c679ef110cc288");
	}
}, Pp = {
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
function Fp() {
	return C("git ls-files --cached --others --exclude-standard", { encoding: "utf8" }).split("\n").filter((e) => e === "Taskfile.yml" || e.endsWith("/Taskfile.yml"));
}
function Ip(e, t) {
	let n = t + 1;
	for (; n < e.length && !/^ {2}\S/.test(e[n]);) n++;
	return n;
}
function Lp(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	if (a === -1) return null;
	let o = Ip(r, a), s = r.slice(a + 1, o).map((e) => e.trim() === "" ? e : "  " + e), c = [
		r[a],
		...n ? [`    desc: ${n}`] : [],
		"    cmds:",
		...s
	];
	return r.splice(a, o - a, ...c), r.join("\n");
}
function Rp(e, t, n) {
	let r = e.split("\n"), i = RegExp(`^  ${t}\\s*:`), a = r.findIndex((e) => i.test(e));
	return a === -1 ? null : (r.splice(a + 1, 0, `    desc: ${n}`), r.join("\n"));
}
function zp(e) {
	let t = b.readFileSync(e, "utf8"), n = w(t)?.tasks;
	if (!n || typeof n != "object") return !1;
	let r = t, a = !1;
	for (let [t, o] of Object.entries(n)) {
		if (!o || typeof o != "object" || o.internal || o.desc) continue;
		let n = Pp[t];
		if (n || (i(`${e}: unknown task "${t}" — add a desc manually`), a = !0), Array.isArray(o)) {
			let o = Lp(r, t, n ?? null);
			if (o === null) {
				i(`${e}: could not locate task "${t}" in file`), a = !0;
				continue;
			}
			s(`${e}: converted shorthand for "${t}"${n ? " and added desc" : ""}`), r = o;
		} else if (n) {
			let o = Rp(r, t, n);
			if (o === null) {
				i(`${e}: could not locate task "${t}" in file`), a = !0;
				continue;
			}
			s(`${e}: added desc for "${t}"`), r = o;
		}
	}
	return r !== t && b.writeFileSync(e, r, "utf8"), a;
}
var Bp = () => {
	let e = Fp();
	if (e.length === 0) return s("no Taskfile.yml files found"), 0;
	let t = !1;
	for (let n of e) zp(n) && (t = !0);
	return +!!t;
}, Vp = async (e) => {
	let { packageJsonPath: t, rootDir: n, cacheDir: r } = p();
	_e(r);
	let i = JSON.parse(b.readFileSync(t, "utf-8")), a = await pe(i, t);
	if ("err" in a) return u("failed to config package: " + a.err), 1;
	await he(i);
	let o = y(r, n);
	return o || s("using vite config from project root directly"), +!!(o ? d("vitest", n, [
		"--config",
		o,
		...e
	]) : d("vitest", n, e)).err;
}, Hp = async (e) => {
	e.length || (Up(), process.exit(0));
	let [t, ...n] = e;
	switch (t) {
		case "help":
		case "--help":
		case "?":
		case "-h": return Up(), process.exit(0);
		case "version": return console.log("mono-dev " + o()), process.exit(0);
		case "config": return process.exit(await Ce(n));
		case "check": return process.exit(await ye(n));
		case "build": return process.exit(await ve());
		case "test": return process.exit(await Vp(n));
		case "doc": return process.exit(await jp(n));
		case "taskfile": return process.exit(Bp());
		case "publish":
			if (!n.includes("--skip-build")) {
				let e = await ve();
				e && process.exit(e);
			}
			return process.exit(await Mp(n));
	}
	u("unknown command " + t), Up(), process.exit(1);
}, Up = () => {
	console.log("mono-dev CLI\n  config           Generate typeck and eslint config, for language servers\n  check [-f]       Run typeck, prettier, eslint\n  build            Build library (for bundling app run vite directly)\n  test  ARGS...    Run test (with vitest)\n  doc   [--json]   Build documentation \n  taskfile         Fixup taskfiles\n  publish [-n]     Publish the package (-n for dry-run)\n  version          Print the version\n");
};
//#endregion
export { a as executeShim, Hp as main };
