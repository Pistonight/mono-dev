import { n as e, t } from "./chunk.js";
//#region node_modules/.pnpm/isexe@4.0.0/node_modules/isexe/dist/commonjs/index.min.js
var n = /* @__PURE__ */ t(((t) => {
	var n = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), r = n((t) => {
		Object.defineProperty(t, "__esModule", { value: !0 }), t.sync = t.isexe = void 0;
		var n = e("node:fs"), r = e("node:fs/promises");
		t.isexe = async (e, t = {}) => {
			let { ignoreErrors: n = !1 } = t;
			try {
				return i(await (0, r.stat)(e), t);
			} catch (e) {
				let t = e;
				if (n || t.code === "EACCES") return !1;
				throw t;
			}
		}, t.sync = (e, t = {}) => {
			let { ignoreErrors: r = !1 } = t;
			try {
				return i((0, n.statSync)(e), t);
			} catch (e) {
				let t = e;
				if (r || t.code === "EACCES") return !1;
				throw t;
			}
		};
		var i = (e, t) => e.isFile() && a(e, t), a = (e, t) => {
			let n = t.uid ?? process.getuid?.(), r = t.groups ?? process.getgroups?.() ?? [], i = t.gid ?? process.getgid?.() ?? r[0];
			if (n === void 0 || i === void 0) throw Error("cannot get uid or gid");
			let a = new Set([i, ...r]), o = e.mode, s = e.uid, c = e.gid;
			return !!(o & 1 || o & 8 && a.has(c) || o & 64 && s === n || o & 72 && n === 0);
		};
	}), i = n((t) => {
		Object.defineProperty(t, "__esModule", { value: !0 }), t.sync = t.isexe = void 0;
		var n = e("node:fs"), r = e("node:fs/promises"), i = e("node:path");
		t.isexe = async (e, t = {}) => {
			let { ignoreErrors: n = !1 } = t;
			try {
				return o(await (0, r.stat)(e), e, t);
			} catch (e) {
				let t = e;
				if (n || t.code === "EACCES") return !1;
				throw t;
			}
		}, t.sync = (e, t = {}) => {
			let { ignoreErrors: r = !1 } = t;
			try {
				return o((0, n.statSync)(e), e, t);
			} catch (e) {
				let t = e;
				if (r || t.code === "EACCES") return !1;
				throw t;
			}
		};
		var a = (e, t) => {
			let { pathExt: n = process.env.PATHEXT || "" } = t, r = n.split(i.delimiter);
			if (r.indexOf("") !== -1) return !0;
			for (let t of r) {
				let n = t.toLowerCase(), r = e.substring(e.length - n.length).toLowerCase();
				if (n && r === n) return !0;
			}
			return !1;
		}, o = (e, t, n) => e.isFile() && a(t, n);
	}), a = n((e) => {
		Object.defineProperty(e, "__esModule", { value: !0 });
	}), o = t && t.__createBinding || (Object.create ? (function(e, t, n, r) {
		r === void 0 && (r = n);
		var i = Object.getOwnPropertyDescriptor(t, n);
		(!i || ("get" in i ? !t.__esModule : i.writable || i.configurable)) && (i = {
			enumerable: !0,
			get: function() {
				return t[n];
			}
		}), Object.defineProperty(e, r, i);
	}) : (function(e, t, n, r) {
		r === void 0 && (r = n), e[r] = t[n];
	})), s = t && t.__setModuleDefault || (Object.create ? (function(e, t) {
		Object.defineProperty(e, "default", {
			enumerable: !0,
			value: t
		});
	}) : function(e, t) {
		e.default = t;
	}), c = t && t.__importStar || (function() {
		var e = function(t) {
			return e = Object.getOwnPropertyNames || function(e) {
				var t = [];
				for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && (t[t.length] = n);
				return t;
			}, e(t);
		};
		return function(t) {
			if (t && t.__esModule) return t;
			var n = {};
			if (t != null) for (var r = e(t), i = 0; i < r.length; i++) r[i] !== "default" && o(n, t, r[i]);
			return s(n, t), n;
		};
	})(), l = t && t.__exportStar || function(e, t) {
		for (var n in e) n !== "default" && !Object.prototype.hasOwnProperty.call(t, n) && o(t, e, n);
	};
	Object.defineProperty(t, "__esModule", { value: !0 }), t.sync = t.isexe = t.posix = t.win32 = void 0;
	var u = c(r());
	t.posix = u;
	var d = c(i());
	t.win32 = d, l(a(), t);
	var f = (process.env._ISEXE_TEST_PLATFORM_ || process.platform) === "win32" ? d : u;
	t.isexe = f.isexe, t.sync = f.sync;
})), r = /* @__PURE__ */ t(((t, r) => {
	var { isexe: i, sync: a } = n(), { join: o, delimiter: s, sep: c, posix: l } = e("path"), u = process.platform === "win32", d = new RegExp(`[${l.sep}${c === l.sep ? "" : c}]`.replace(/(\\)/g, "\\$1")), f = RegExp(`^\\.${d.source}`), p = (e) => Object.assign(/* @__PURE__ */ Error(`not found: ${e}`), { code: "ENOENT" }), m = (e, { path: t = process.env.PATH, pathExt: n = process.env.PATHEXT, delimiter: r = s }) => {
		let i = e.match(d) ? [""] : [...u ? [process.cwd()] : [], ...(t || "").split(r)];
		if (u) {
			let t = n || [
				".EXE",
				".CMD",
				".BAT",
				".COM"
			].join(r), a = t.split(r).flatMap((e) => [e, e.toLowerCase()]);
			return e.includes(".") && a[0] !== "" && a.unshift(""), {
				pathEnv: i,
				pathExt: a,
				pathExtExe: t
			};
		}
		return {
			pathEnv: i,
			pathExt: [""]
		};
	}, h = (e, t) => {
		let n = /^".*"$/.test(e) ? e.slice(1, -1) : e;
		return (!n && f.test(t) ? t.slice(0, 2) : "") + o(n, t);
	}, g = async (e, t = {}) => {
		let { pathEnv: n, pathExt: r, pathExtExe: a } = m(e, t), o = [];
		for (let s of n) {
			let n = h(s, e);
			for (let e of r) {
				let r = n + e;
				if (await i(r, {
					pathExt: a,
					ignoreErrors: !0
				})) {
					if (!t.all) return r;
					o.push(r);
				}
			}
		}
		if (t.all && o.length) return o;
		if (t.nothrow) return null;
		throw p(e);
	};
	r.exports = g, g.sync = (e, t = {}) => {
		let { pathEnv: n, pathExt: r, pathExtExe: i } = m(e, t), o = [];
		for (let s of n) {
			let n = h(s, e);
			for (let e of r) {
				let r = n + e;
				if (a(r, {
					pathExt: i,
					ignoreErrors: !0
				})) {
					if (!t.all) return r;
					o.push(r);
				}
			}
		}
		if (t.all && o.length) return o;
		if (t.nothrow) return null;
		throw p(e);
	};
}));
//#endregion
export default r();

//# sourceMappingURL=lib.js.map