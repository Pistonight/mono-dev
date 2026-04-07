import { JSX, ReflectionKind, DocumentReflection, ReflectionType } from 'typedoc';
import { partition, isMethodContainer, isNestedItem, breakable, join, isNestedTable, transformElement } from '../utils.js';

const MembersMixin = (base) => class extends base {
    members = (model) => {
        const [nested1, categories] = partition(model.categories ?? [], isNestedTable);
        const [nested2, groups] = partition(model.groups ?? [], isNestedTable);
        const [modules, tables] = partition([...nested1, ...nested2], (x) => x.children.every((x) => x.kindOf(ReflectionKind.ExportContainer)));
        const sections = [
            ...categories,
            ...groups.flatMap((x) => x.categories ?? [x]),
        ];
        // Only display non-nested items (like methods) using sections
        // if the model is a container for it.
        // This allows functions and variables to be displayed with table
        // in modules and with sections in classes
        // similar to how rustdoc handles things
        const shouldUseSection = isMethodContainer(model);
        return (JSX.createElement(JSX.Fragment, null,
            this.#preview(model),
            modules.map((x) => this.#table(x, true)),
            shouldUseSection
                ? sections.map((x) => this.#section(x))
                : sections.map((x) => this.#table(x, true)),
            tables.map((x) => this.#table(x, true))));
    };
    #preview(decl) {
        if (!decl.isDeclaration()) {
            return;
        }
        // Functions/overloads: render each signature as a code block with its docs
        if (decl.signatures?.length) {
            return decl.signatures.map((sig) => (JSX.createElement(JSX.Fragment, null,
                JSX.createElement("pre", { class: "item-decl" },
                    JSX.createElement("code", null, transformHighlights(this.memberSignatureTitle(sig)))),
                JSX.createElement("div", { class: "docblock" },
                    this.commentSummary(sig),
                    this.commentTags(sig)))));
        }
        // Workaround for `this.reflectionPreview`
        if (decl.indexSignatures) {
            decl.children ??= [];
        }
        const preview = this.reflectionPreview(decl);
        if (preview) {
            return (JSX.createElement("pre", { class: "item-decl" },
                JSX.createElement("code", null, removeLinks(transformHighlights(preview)))));
        }
        if (!isNestedItem(decl)) {
            return (JSX.createElement("pre", { class: "item-decl" },
                JSX.createElement("code", null, this.#definition(decl, true))));
        }
    }
    #table = (section, forceNested) => {
        const anchor = this.sectionSlug(section);
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("h2", { id: anchor, class: "section-header" },
                section.title,
                JSX.createElement("a", { href: `#${anchor}`, class: "anchor" }, "\u00A7")),
            JSX.createElement("dl", { class: "item-table" }, section.children.map((item) => {
                let shortSummary = item.comment?.getShortSummary(true);
                // fallback for functions
                if (!shortSummary && item.isDeclaration()) {
                    shortSummary = item.signatures?.[0]?.comment?.getShortSummary(true);
                }
                return (JSX.createElement(JSX.Fragment, null,
                    JSX.createElement("dt", null,
                        JSX.createElement("a", { class: itemLinkClass(item), href: this.itemLink(item, forceNested), title: item.name }, item.name)),
                    JSX.createElement("dd", null,
                        JSX.createElement(JSX.Raw, { html: this.markdown(shortSummary) }))));
            }))));
    };
    #section(section) {
        const anchor = this.sectionSlug(section);
        let classname = 'impl-items';
        if (section.children.every((x) => x.kindOf(ReflectionKind.EnumMember))) {
            classname = 'variants';
        }
        if (section.children.every((x) => x.kindOf(ReflectionKind.Property))) {
            classname = '';
        }
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("h2", { id: anchor, class: "section-header" },
                section.title,
                JSX.createElement("a", { href: `#${anchor}`, class: "anchor" }, "\u00A7")),
            JSX.createElement("div", { class: classname }, section.children.map((item) => this.#item(item)))));
    }
    #item(item) {
        if (item instanceof DocumentReflection) {
            return this.#doc(item);
        }
        if (item.kindOf(ReflectionKind.EnumMember)) {
            return this.#variant(item);
        }
        return this.#decl(item);
    }
    #doc(doc) {
        console.log('DocumentReflection', doc.getFullName());
        debugger;
    }
    #variant(decl) {
        const anchor = this.itemSlug(decl);
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("section", { id: anchor, class: "variant" },
                JSX.createElement("a", { href: `#${anchor}`, class: "anchor" }, "\u00A7"),
                JSX.createElement("h3", { class: "code-header" },
                    decl.name,
                    " = ",
                    transformHighlights(this.type(decl.type)))),
            JSX.createElement("div", { class: "docblock" },
                this.commentSummary(decl),
                this.commentTags(decl))));
    }
    #decl(decl) {
        const anchor = this.itemSlug(decl);
        if (decl.signatures?.length) {
            // methods
            return decl.signatures?.map((x, i) => i === 0
                ? this.#signature(x, anchor)
                : this.#signature(x, `${anchor}-${i}`));
        }
        if (decl.hasGetterOrSetter()) {
            // accessors
            const signatures = [decl.getSignature, decl.setSignature].filter((x) => x != undefined);
            return signatures.map((x, i) => i === 0
                ? this.#signature(x, anchor)
                : this.#signature(x, `${anchor}-${i}`));
        }
        // type aliases, variables, fields
        return this.#detail(decl, anchor);
    }
    #signature(signature, anchor) {
        return (JSX.createElement("details", { class: "toggle method-toggle", open: true },
            JSX.createElement("summary", null,
                JSX.createElement("section", { id: anchor, class: "method trait-impl" },
                    this.#source(signature),
                    JSX.createElement("a", { href: anchor && `#${anchor}`, class: "anchor" }, "\u00A7"),
                    JSX.createElement("h4", { class: "code-header" }, transformHighlights(this.memberSignatureTitle(signature))))),
            JSX.createElement("div", { class: "docblock" },
                this.commentSummary(signature),
                this.commentTags(signature))));
    }
    #detail(decl, anchor) {
        if (decl.kindOf(ReflectionKind.Property)) {
            return (JSX.createElement(JSX.Fragment, null,
                JSX.createElement("span", { id: anchor, class: "structfield section-header" },
                    JSX.createElement("a", { href: `#${anchor}`, class: "anchor field" }, "\u00A7"),
                    JSX.createElement("code", null, this.#definition(decl))),
                JSX.createElement("div", { class: "docblock" },
                    this.commentSummary(decl),
                    this.commentTags(decl))));
        }
        return (JSX.createElement("details", { class: "toggle method-toggle", open: true },
            JSX.createElement("summary", null,
                JSX.createElement("section", { id: anchor, class: "method trait-impl" },
                    this.#source(decl),
                    JSX.createElement("a", { href: `#${anchor}`, class: "anchor" }, "\u00A7"),
                    JSX.createElement("h4", { class: "code-header" }, this.#definition(decl)))),
            JSX.createElement("div", { class: "docblock" },
                this.commentSummary(decl),
                this.commentTags(decl))));
    }
    #definition(decl, full = false) {
        let value = decl.defaultValue;
        if (isStringNumberLiteral(value)) {
            value = JSX.createElement("span", { class: "macro" }, decl.defaultValue);
        }
        else if (isPrimitiveType(value)) {
            value = JSX.createElement("span", { class: "primitive" }, decl.defaultValue);
        }
        let delimeter;
        if (decl.kindOf(ReflectionKind.SomeType)) {
            delimeter = ' = ';
        }
        else {
            delimeter = decl.flags.isOptional ? '?: ' : ': ';
        }
        let type;
        if (!full && decl.type instanceof ReflectionType) {
            type = '{ ... }';
        }
        else {
            type = this.type(decl.type);
        }
        return (JSX.createElement(JSX.Fragment, null,
            transformHighlights(this.#modifier(decl)),
            decl.kindOf(ReflectionKind.SomeMember)
                ? JSX.createElement("span", null, breakable(decl.name))
                : JSX.createElement("a", { class: itemLinkClass(decl), href: this.urlTo(decl) }, breakable(decl.name)),
            transformHighlights(this.#generics(decl.typeParameters)),
            type
                ? [delimeter, transformHighlights(type)]
                : (decl.groups || decl.categories) && `${delimeter}{ ... }`,
            value));
    }
    #modifier(decl) {
        let modifier = [];
        if (decl.kindOf(ReflectionKind.SomeType)) {
            modifier.push('type');
        }
        else if (decl.kindOf(ReflectionKind.SomeValue)) {
            modifier.push(decl.flags.isConst ? 'const' : 'let');
        }
        else if (decl.kindOf(ReflectionKind.ClassMember)) {
            if (decl.flags.isPrivate) {
                modifier.push('private');
            }
            if (decl.flags.isProtected) {
                modifier.push('protected');
            }
            if (decl.flags.isPublic) {
                modifier.push('public');
            }
            if (decl.flags.isAbstract) {
                modifier.push('abstract');
            }
            if (decl.flags.isStatic) {
                modifier.push('static');
            }
            if (decl.flags.isReadonly) {
                modifier.push('readonly');
            }
        }
        if (!modifier.length) {
            return;
        }
        return JSX.createElement("span", { class: "tsd-signature-keyword" },
            modifier.join(' '),
            ' ');
    }
    #source(decl) {
        const url = this.itemSourceLink(decl);
        if (!url) {
            return;
        }
        return (JSX.createElement("span", { class: "rightside" },
            JSX.createElement("a", { class: "src", href: url }, "Source")));
    }
    #generics(params) {
        if (!params?.length) {
            return;
        }
        return (JSX.createElement(JSX.Fragment, null,
            JSX.createElement("span", { class: "tsd-signature-symbol" }, '<'),
            join(JSX.createElement("span", { class: "tsd-signature-symbol" }, ', '), params.map((item) => (JSX.createElement(JSX.Fragment, null,
                item.varianceModifier ? `${item.varianceModifier} ` : '',
                JSX.createElement("span", { class: "tsd-signature-type", "data-tsd-kind": ReflectionKind.singularString(item.kind) }, item.name))))),
            JSX.createElement("span", { class: "tsd-signature-symbol" }, '>')));
    }
};
function itemLinkClass(item) {
    switch (item.kind) {
        case ReflectionKind.Module:
        case ReflectionKind.Namespace:
            return 'mod';
        case ReflectionKind.Function:
            return 'fn';
        case ReflectionKind.TypeAlias:
            return 'type';
        case ReflectionKind.Enum:
            return 'enum';
        case ReflectionKind.Class:
            return 'struct';
        case ReflectionKind.Interface:
            return 'trait';
        case ReflectionKind.Variable:
            return 'constant';
        default:
            return 'foreigntype';
    }
}
function removeLinks(children) {
    return transformElement(children, (element) => {
        if (element.tag === 'a') {
            element.tag = 'span';
            if (element.props) {
                // @ts-ignore
                delete element.props.href;
            }
        }
        return element;
    });
}
function transformHighlights(children) {
    return transformElement(children, (element) => {
        const props = {
            'class': '',
            'href': undefined,
            'data-tsd-kind': undefined,
            ...element.props,
        };
        const classes = props.class.trim().split(/\s+/);
        if (classes.includes('tsd-signature-type')) {
            if (isStringNumberLiteral(element.children[0])) {
                classes.push('macro');
            }
            else if (isPrimitiveType(element.children[0])) {
                classes.push('keyword');
            }
            else if (props['data-tsd-kind'] === ReflectionKind.singularString(ReflectionKind.TypeParameter)) {
                classes.push('trait');
            }
            else if (classes.includes('tsd-kind-type-parameter')) {
                classes.push('trait');
            }
            else if (classes.includes('tsd-kind-enum-member')) {
                classes.push('constant');
            }
            else {
                classes.push('type');
            }
        }
        if (classes.includes('tsd-signature-keyword')) {
            // keywords in signature have no color in rustdoc
            classes.push('token');
        }
        if (classes.includes('tsd-kind-interface')
            || classes.includes('tsd-kind-type-alias')
            || classes.includes('tsd-kind-constructor-signature')) {
            classes.push('type');
        }
        if (classes.includes('tsd-kind-type-parameter')) {
            classes.push('trait');
            element.tag = 'span';
            delete props.href;
        }
        if (classes.includes('tsd-kind-enum-member')) {
            if (props.href) {
                const [url, hash] = props.href.split('#');
                props.href = `${url}#enum-member.${hash}`;
            }
        }
        if (classes.includes('tsd-kind-call-signature')) {
            classes.push('method');
        }
        props.class = classes.join(' ');
        return {
            ...element,
            props,
        };
    });
}
function isStringNumberLiteral(expr) {
    return typeof expr === 'string' && /^(\d|".+"$)/.test(expr);
}
function isPrimitiveType(expr) {
    const primitives = [
        'boolean',
        'number',
        'string',
        'symbol',
        'unknown',
        'any',
        'void',
        'null',
        'undefined',
        'never',
        'object',
        'unique symbol',
    ];
    return typeof expr === 'string' && primitives.includes(expr);
}

export { MembersMixin, itemLinkClass };
//# sourceMappingURL=members.js.map
