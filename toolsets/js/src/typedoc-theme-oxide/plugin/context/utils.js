import * as cheerio from 'cheerio';
import slug from 'slug';
import { ReflectionKind, JSX, DefaultThemeRenderContext, BaseRouter } from 'typedoc';

function isNestedTable(section) {
    return section.children.every(isNestedItem);
}
function isNestedItem(item) {
    return item.kindOf([
        ReflectionKind.ExportContainer,
        ReflectionKind.Interface,
        ReflectionKind.Class,
        ReflectionKind.Enum,
    ]);
}
/**
 * Check if the item is something that could have methods (associative functions).
 *
 * Functions within these are displayed as methods (similar to struct/enum in rustdoc).
 */
function isMethodContainer(item) {
    return item.kindOf([
        ReflectionKind.Interface,
        ReflectionKind.Class,
        ReflectionKind.Enum,
    ]);
}
function transformElement(children, transformer) {
    if (Array.isArray(children)) {
        return children.map((x) => transformElement(x, transformer));
    }
    if (typeof children !== 'object' || children === null) {
        return children;
    }
    return {
        ...transformer(children),
        children: children.children.map((x) => transformElement(x, transformer)),
    };
}
function transformTypography(html) {
    const $ = cheerio.load(html, null, false);
    $('h1').each((_, el) => {
        $(el).wrapInner('<h2></h2>').children(':first-child').unwrap();
    });
    $('a').find('>h1, >h2, >h3, >h4, >h5, >h6').each((_, el) => {
        const $heading = $(el);
        const $outerAnchor = $heading.parent();
        const $innerAnchor = $('<a></a>');
        $outerAnchor.after($heading);
        $outerAnchor.remove();
        $innerAnchor.attr('href', $outerAnchor.attr('href'));
        $innerAnchor.append($heading.contents());
        $heading.attr('id', $outerAnchor.attr('id'));
        $heading.append($innerAnchor);
    });
    return $.html();
}
function join(joiner, list) {
    const result = [];
    for (const item of list) {
        if (result.length > 0) {
            result.push(joiner);
        }
        result.push(item);
    }
    return result;
}
function breakable(str) {
    const sep = /([^0-9A-Za-z]+|[0-9]+|(?<=[a-z])(?=[A-Z]))/;
    const pieces = str.split(sep).filter((x) => x.length);
    return join(JSX.createElement("wbr", null), pieces);
}
function partition(items, predicate) {
    const satisfied = [];
    const unsatisfied = [];
    for (const item of items) {
        if (predicate(item)) {
            satisfied.push(item);
        }
        else {
            unsatisfied.push(item);
        }
    }
    return [satisfied, unsatisfied];
}
const getUrl = (factory, item) => {
    if (factory instanceof DefaultThemeRenderContext) {
        return factory.urlTo(item);
    }
    if (factory instanceof BaseRouter) {
        return factory.getFullUrl(item);
    }
    throw new Error('Unknown URL factory type');
};
function sectionSlug(section) {
    const title = slug(section.title);
    return `section.${title}`;
}
function itemSlug(item) {
    const kind = ReflectionKind.classString(item.kind).replace('tsd-kind-', '');
    const name = slug(item.name);
    return `${kind}.${name}`;
}
function itemLink(factory, item, forceNested) {
    if (forceNested || !item.parent || isNestedItem(item)) {
        return getUrl(factory, item);
    }
    const url = getUrl(factory, item.parent);
    const anchor = itemSlug(item);
    if (typeof url !== 'undefined') {
        return `${url}#${anchor}`;
    }
    return getUrl(factory, item);
}

export { breakable, getUrl, isMethodContainer, isNestedItem, isNestedTable, itemLink, itemSlug, join, partition, sectionSlug, transformElement, transformTypography };
//# sourceMappingURL=utils.js.map
