'use strict';

function escapeJsonForHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function serializeProps(props) {
    const ancestors = [];

    const json = JSON.stringify(props || {}, function (_key, value) {
        if (typeof value === 'function' || typeof value === 'undefined') {
            return undefined;
        }

        if (typeof value === 'object' && value !== null) {
            while (
                ancestors.length &&
                ancestors[ancestors.length - 1] !== this
            ) {
                ancestors.pop();
            }

            if (ancestors.indexOf(value) !== -1) {
                throw new Error(
                    'React SSR props cannot contain circular references'
                );
            }

            ancestors.push(value);
        }

        return value;
    });

    return escapeJsonForHtml(json || '{}');
}

module.exports = serializeProps;
