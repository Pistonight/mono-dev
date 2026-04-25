import { r as e } from "./util-Di6_7x0r.js";
import { t } from "./plugins-DkT6OaXs.js";
import n, { reactCompilerPreset as r } from "@vitejs/plugin-react";
import i from "@rolldown/plugin-babel";
import a from "babel-plugin-react-compiler";
import o from "vite-plugin-wasm";
//#region src/config/gen_vite.ts
var s = (s) => {
	let c = [];
	if (c.push(t()), e(s, "react")) {
		c.push(n());
		let e = r();
		e.preset = () => ({ plugins: [[a, {}]] }), c.push(i({ presets: [e] }));
	}
	return s["pistonight/mono-dev"]?.wasm && c.push(o()), c;
}, c = (e) => ({ "import.meta.version": JSON.stringify(e.version) });
//#endregion
export { s as n, c as t };

//# sourceMappingURL=gen_vite-BCHvlSqa.js.map