import { DefaultThemeRenderContext } from 'typedoc';
import { transformTypography, sectionSlug, itemSlug, itemLink } from './utils.js';

class OxideContextBase extends DefaultThemeRenderContext {
    constructor(router, theme, page, options) {
        super(router, theme, page, options);
        const markdown = this.markdown;
        this.markdown = (text) => transformTypography(markdown(text) ?? '');
    }
    sectionSlug(section) {
        return sectionSlug(section);
    }
    itemSlug(item) {
        return itemSlug(item);
    }
    itemLink(item, forceNested) {
        return itemLink(this, item, forceNested);
    }
    itemSourceLink(item) {
        if (!item.isDeclaration() && !item.isSignature()) {
            return;
        }
        return item.sources?.map((src) => src.url).find((url) => url);
    }
}

export { OxideContextBase };
//# sourceMappingURL=base.js.map
