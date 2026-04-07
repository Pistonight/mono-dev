import { JSX } from 'typedoc';

const LayoutMixin = (base) => class extends base {
    defaultLayout = (template, page) => {
        return (JSX.createElement("html", { lang: this.options.getValue('lang'), "data-base": this.relativeURL('./') },
            this.#head(page),
            JSX.createElement("body", { class: "rustdoc" },
                JSX.createElement(JSX.Raw, { html: "<!--[if lte IE 11]>" }),
                JSX.createElement("div", { class: "warning" }, "This old browser is unsupported and will most likely display funky things."),
                JSX.createElement(JSX.Raw, { html: "<![endif]-->" }),
                this.hook('body.begin', this),
                this.#topbar(page),
                this.#sidebar(page),
                this.#main(template, page),
                this.hook('body.end', this))));
    };
    #head(page) {
        const { model, project } = page;
        let title = model.name;
        if (model.parent && !model.parent.isProject()) {
            title = `${title} in ${model.parent.getFriendlyFullName()}`;
        }
        if (!model.isProject()) {
            title = `${title} - ${project.name}`;
        }
        const fonts = [
            'fonts/SourceSerif4-Regular.ttf.woff2',
            'fonts/FiraSans-Regular.woff2',
            'fonts/FiraSans-Medium.woff2',
            'fonts/SourceCodePro-Regular.ttf.woff2',
            'fonts/SourceSerif4-Bold.ttf.woff2',
            'fonts/SourceCodePro-Semibold.ttf.woff2',
        ];
        return (JSX.createElement("head", null,
            JSX.createElement("meta", { charset: "utf-8" }),
            this.hook('head.begin', this),
            JSX.createElement("meta", { "http-equiv": "x-ua-compatible", content: "IE=edge" }),
            JSX.createElement("title", null, title),
            JSX.createElement("meta", { name: "description", content: 'Documentation for ' + project.name }),
            JSX.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
            fonts.map((font) => (JSX.createElement("link", { rel: "preload", as: "font", type: "font/woff2", crossOrigin: "anonymous", href: rustdocAsset(font) }))),
            JSX.createElement("link", { rel: "stylesheet", type: "text/css", href: rustdocAsset('css/normalize.min.css') }),
            JSX.createElement("link", { rel: "stylesheet", type: "text/css", href: this.relativeURL('assets/oxide/rustdoc/rustdoc.css') }),
            JSX.createElement("meta", { name: "rustdoc-vars", "data-root-path": this.relativeURL(''), "data-static-root-path": this.relativeURL('assets/oxide/rustdoc/'), "data-current-crate": page.project.name, "data-themes": "", "data-resource-suffix": "", "data-rustdoc-version": "1.86.0", "data-channel": "1.86.0", "data-search-js": "search.js", "data-settings-js": "settings.js" }),
            JSX.createElement("script", { src: rustdocAsset('js/storage.min.js') }),
            JSX.createElement("script", { defer: true, src: this.relativeURL('assets/oxide/rustdoc/main.js') }),
            JSX.createElement("noscript", null,
                JSX.createElement("link", { rel: "stylesheet", href: rustdocAsset('css/noscript.min.css') })),
            JSX.createElement("link", { rel: "stylesheet", href: this.relativeURL('assets/highlight.css') }),
            JSX.createElement("link", { rel: "stylesheet", href: this.relativeURL('assets/oxide/index.css') }),
            JSX.createElement("script", { src: this.relativeURL('assets/oxide/index.js') }),
            this.options.getValue('customCss') && JSX.createElement("link", { rel: "stylesheet", href: this.relativeURL('assets/custom.css') }),
            this.hook('head.end', this)));
    }
    #topbar(page) {
        const { project } = page;
        return (JSX.createElement("nav", { class: "mobile-topbar" },
            JSX.createElement("button", { class: "sidebar-menu-toggle", title: "show sidebar" }),
            JSX.createElement("h2", { class: "location" },
                JSX.createElement("a", { href: "#" }, project.name))));
    }
    #sidebar(page) {
        const { project } = page;
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("nav", { class: "sidebar" },
                JSX.createElement("div", { class: "sidebar-crate" },
                    JSX.createElement("h2", null,
                        JSX.createElement("a", { href: this.relativeURL('index.html') }, project.name),
                        JSX.createElement("span", { class: "version" }, project.packageVersion))),
                this.hook('sidebar.begin', this),
                this.navigation(page),
                this.hook('sidebar.end', this)),
            JSX.createElement("div", { class: "sidebar-resizer" })));
    }
    #main(template, page) {
        return (JSX.createElement("main", null,
            JSX.createElement("div", { class: "width-limiter" },
                JSX.createElement("rustdoc-search", null),
                JSX.createElement("section", { id: "main-content", class: "content" },
                    this.hook('content.begin', this),
                    template(page),
                    this.hook('content.end', this)),
                JSX.createElement("section", { id: "alternative-display", class: "content hidden" },
                    JSX.createElement("oxide-search-results", { id: "search" })))));
    }
};
function rustdocAsset(path) {
    return `https://cdn.jsdelivr.net/gh/rust-lang/rust@1.86.0/src/librustdoc/html/static/${path}`;
}

export { LayoutMixin };
//# sourceMappingURL=layout.js.map
