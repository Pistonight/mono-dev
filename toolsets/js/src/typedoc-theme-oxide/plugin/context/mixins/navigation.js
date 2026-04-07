import { JSX, ContainerReflection, ReflectionKind } from 'typedoc';
import { partition, isNestedTable } from '../utils.js';

const NavigationMixin = (base) => class extends base {
    navigation = (page) => {
        const { model } = page;
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("div", { class: "sidebar-elems" },
                JSX.createElement("ul", { class: "block" },
                    JSX.createElement("li", null,
                        JSX.createElement("a", { href: this.urlTo(model.project) }, "Exports"))),
                this.#modules(model),
                this.#sections(model))));
    };
    #modules(model) {
        const parent = model.parent;
        if (parent instanceof ContainerReflection === false) {
            return;
        }
        const siblings = parent.getChildrenByKind(ReflectionKind.SomeModule);
        return (JSX.createElement("section", null,
            JSX.createElement("ul", { class: "block" },
                JSX.createElement("li", { class: "parent-module" },
                    JSX.createElement("a", { href: this.urlTo(parent) }, "..")),
                siblings.map((sibling) => (JSX.createElement("li", null,
                    JSX.createElement("a", { href: this.urlTo(sibling), class: sibling.id === model.id ? 'current' : '' }, sibling.name)))))));
    }
    #sections(model) {
        if (model instanceof ContainerReflection === false) {
            return;
        }
        const [tables1, categories] = partition(model.categories ?? [], isNestedTable);
        const [tables2, groups] = partition(model.groups ?? [], isNestedTable);
        const [modules, tables] = partition([...tables1, ...tables2], (x) => x.children.every((x) => x.kindOf(ReflectionKind.ExportContainer)));
        return [
            modules.map((x) => this.#table(x, true)),
            categories.map((x) => this.#category(x)),
            groups.map((x) => this.#group(x)),
            tables.map((x) => this.#table(x, true)),
        ];
    }
    #category(category) {
        return this.#table(category, false);
    }
    #group(group) {
        if (group.categories) {
            return group.categories.map((x) => this.#category(x));
        }
        return this.#table(group, false);
    }
    #table(section, forceNested) {
        const anchor = this.sectionSlug(section);
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("h3", null,
                JSX.createElement("a", { href: `#${anchor}` }, section.title)),
            JSX.createElement("ul", { class: "block" }, section.children.map((x) => this.#item(x, forceNested)))));
    }
    #item(item, forceNested) {
        return (JSX.createElement("li", { class: this.getReflectionClasses(item) },
            JSX.createElement("a", { href: this.itemLink(item, forceNested) }, item.name)));
    }
};

export { NavigationMixin };
//# sourceMappingURL=navigation.js.map
