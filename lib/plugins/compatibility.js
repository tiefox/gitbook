var _ = require('lodash');
var error = require('../utils/error');

/*
    Return the context for a plugin.
    It tries to keep compatibilities with GitBook v2
*/
function pluginCtx(plugin) {
    var book = plugin.book;
    var ctx = book;

    return ctx;
}

/*
    Call a function "fn" with a context of page similar to the one in GitBook v2

    @params {Page}
    @returns {String|undefined} new content of the page
*/
function pageHook(page, fn) {
    // Get page context
    var ctx = page.getContext().page;

    // Add other informations
    ctx.type    = page.type;
    ctx.rawPath = page.rawPath;
    ctx.path    = page.path;

    // Deprecate sections
    error.deprecateField(ctx, 'sections', [
        { content: ctx.content, type: 'normal' }
    ], '"sections" property is deprecated, use page.content instead');

    // Keep reference of original content for compatibility
    var originalContent = ctx.content;

    return fn(ctx)
    .then(function(result) {
        // No returned value
        // Existing content will be used
        if (!result) return undefined;

        // GitBook 3
        // Use returned page.content if different from original content
        if (result.content != originalContent) {
            return result.content;
        }

        // GitBook 2 compatibility
        // Finally, use page.sections
        if (result.sections) {
            return _.pluck(result.sections, 'content').join('\n');
        }
    });
}

module.exports = {
    pluginCtx: pluginCtx,
    pageHook: pageHook
};
