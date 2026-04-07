import { JSX, ReflectionKind } from 'typedoc';

const ProjectMixin = (base) => class extends base {
    indexTemplate = (page) => {
        const { model, project } = page;
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("div", { class: "main-heading" },
                JSX.createElement("h1", null,
                    ReflectionKind.singularString(model.kind),
                    " ",
                    JSX.createElement("span", null, project.name),
                    JSX.createElement("button", { id: "copy-path", title: "Copy item path to clipboard" }, "Copy item path")),
                JSX.createElement("rustdoc-toolbar", null)),
            JSX.createElement("details", { class: "toggle top-doc", open: true },
                JSX.createElement("summary", { class: "hideme" },
                    JSX.createElement("span", null, "Expand description")),
                JSX.createElement("div", { class: "docblock" },
                    JSX.createElement(JSX.Raw, { html: this.markdown(page.model.readme) }))),
            this.members(model)));
    };
};

export { ProjectMixin };
//# sourceMappingURL=project.js.map
