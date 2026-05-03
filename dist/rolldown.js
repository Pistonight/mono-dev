//#region src/rolldown.ts
var e = (e, t) => (n) => t(n) || (e ? typeof e == "string" ? e : e(n) : "[name]-[hash].js"), t = (e, t) => (n) => t(n) || (e ? typeof e == "string" ? e : e(n) : "[name].js"), n = (e, t) => (n) => t(n) || (e ? typeof e == "string" ? e : e(n) : "assets/[name]-[hash][extname]");
//#endregion
export { n as wrapAssetFileNames, e as wrapChunkFileNames, t as wrapEntryFileNames };

//# sourceMappingURL=rolldown.js.map