import { JSX, ReflectionKind } from 'typedoc';
import { join } from '../utils.js';

const ContainerMixin = (base) => class extends base {
    reflectionTemplate = (page) => {
        const { model } = page;
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("div", { class: "main-heading" },
                JSX.createElement("div", { class: "rustdoc-breadcrumbs" }, this.#breadcrumbs(page.model.parent)),
                JSX.createElement("h1", null,
                    ReflectionKind.singularString(model.kind) + ' ',
                    JSX.createElement("span", null, model.name),
                    this.#generics(model),
                    JSX.createElement("button", { id: "copy-path", title: "Copy item path to clipboard" }, "Copy item path")),
                JSX.createElement("rustdoc-toolbar", null),
                this.#source(model)),
            model.hasComment() && (JSX.createElement("details", { class: "toggle top-doc", open: true },
                JSX.createElement("summary", { class: "hideme" },
                    JSX.createElement("span", null, "Expand description")),
                JSX.createElement("div", { class: "docblock" },
                    this.commentSummary(model),
                    this.commentTags(model)))),
            this.members(model)));
    };
    #breadcrumbs(model) {
        if (!model || model.isProject()) {
            return [];
        }
        if (model.kindOf(ReflectionKind.SomeSignature)) {
            return this.#breadcrumbs(model.parent);
        }
        const trail = [
            ...this.#breadcrumbs(model.parent),
            JSX.createElement("a", { href: this.urlTo(model) }, model.name),
        ];
        return join(['.', JSX.createElement("wbr", null)], trail);
    }
    #generics(model) {
        if (!model.isDeclaration() && !model.isSignature()) {
            return;
        }
        if (!model.typeParameters) {
            return;
        }
        return ['<', join(', ', model.typeParameters.map((x) => x.name)), '>'];
    }
    #source(model) {
        const url = this.itemSourceLink(model);
        if (!url) {
            return;
        }
        return (JSX.createElement("span", { class: "sub-heading" },
            JSX.createElement("a", { class: "src", href: url }, "Source")));
    }
};

export { ContainerMixin };
//# sourceMappingURL=container.js.map
