import { ReflectionKind, JSX } from 'typedoc';

const CommentMixin = (base) => class extends base {
    commentTags = (model) => {
        if (!model.comment) {
            return;
        }
        const skipped = this.options.getValue('notRenderedTags');
        if (model.kindOf(ReflectionKind.SomeSignature)) {
            skipped.push('@returns');
        }
        const tags = model.comment.blockTags
            .filter((tag) => !tag.skipRendering)
            .filter((tag) => !skipped.includes(tag.tag));
        return (JSX.createElement(JSX.Fragment, null,
            this.hook('comment.beforeTags', this, model.comment, model),
            JSX.createElement("div", { class: "item-table comment-tags" }, tags.map((tag) => (JSX.createElement(JSX.Fragment, null,
                JSX.createElement("dt", null,
                    JSX.createElement("span", { class: "stab", title: tag.name }, tag.name ?? tag.tag.replace('@', ''))),
                JSX.createElement("dd", null,
                    JSX.createElement(JSX.Raw, { html: this.markdown(tag.content) })))))),
            this.hook('comment.afterTags', this, model.comment, model)));
    };
};

export { CommentMixin };
//# sourceMappingURL=comment.js.map
