//#region src/rolldown.ts
var e = (e, t, n) => (r) => n(r) || (t ? typeof t == "string" ? t : t(r) : e ? "[name]-[hash].js" : "assets/[name]-[hash].js"), t = (e, t, n) => (r) => n(r) || (t ? typeof t == "string" ? t : t(r) : e ? "[name].js" : "assets/[name]-[hash].js"), n = (e, t) => (n) => t(n) || (e ? typeof e == "string" ? e : e(n) : "assets/[name]-[hash][extname]");
//#endregion
export { n as wrapAssetFileNames, e as wrapChunkFileNames, t as wrapEntryFileNames };

//# sourceMappingURL=rolldown.js.map