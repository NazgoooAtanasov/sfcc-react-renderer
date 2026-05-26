'use strict';

const serializeProps = require('*/cartridge/scripts/react/serializeProps');

/**
 * @typedef {{
 *   name: string,
 *   component: import('react').ReactNode,
 *   componentProps: any,
 *   hydrate: {
 *     scriptUrl: string
 *   },
 *   res: Record<string, unknown>,
 * }} RenderReactProps
 */

/**
 * @param {RenderReactProps} param
 * @returns {void}
 */
function renderReact({ name, component, componentProps, hydrate, res }) {
    try {
        if (!name) throw new Error('renderReact unique name');
        if (!res)
            throw new Error('renderReact requires an SFRA response object');
        if (!component)
            throw new Error('renderReact needs a comopnent to render');

        const React = require('*/cartridge/react');
        const ReactDOMServer = require('*/cartridge/react-dom-server-legacy-sfcc');

        const props = componentProps || {};
        const element = React.createElement(component, props);
        const html = ReactDOMServer.renderToString(element);
        const serializedProps = serializeProps(props);
        let output =
            `<div data-react-ssr-component-name="${name}" data-react-ssr-props="${serializedProps}">` +
            html +
            '</div>';

        if (hydrate && hydrate.scriptUrl)
            output += `<script defer src="${hydrate.scriptUrl}"></script>`;

        res.print(output);
    } catch (error) {
        const Logger = require('dw/system/Logger');
        Logger.error(
            'There was an error rendering react component: {0}',
            error
        );
    }
}

module.exports = { renderReact };
