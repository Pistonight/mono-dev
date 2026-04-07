import { OxideTheme } from './theme.js';

/**
 * Called by TypeDoc when loading this theme as a plugin. Should be used to define themes which
 * can be selected by the user.
 */
function load(app) {
    app.renderer.defineTheme('oxide', OxideTheme);
}

export { load };
//# sourceMappingURL=index.js.map
