'use strict';

const URLUtils = require('dw/web/URLUtils');
const { renderReact } = require('*/cartridge/scripts/react/renderReact');

function renderReactPage(options) {
    const componentName = options && options.component;
    const res = options && options.res;
    const props = options && options.props ? options.props : {};
    const hydrate = !options || options.hydrate !== false;

    const manifest = require('*/cartridge/scripts/react/manifest');
    const entry = manifest[componentName];
    const component = require(entry.serverModule);

    renderReact({
        name: componentName,
        component,
        componentProps: props,
        hydrate: hydrate
            ? { scriptUrl: URLUtils.staticURL(entry.clientEntry).toString() }
            : undefined,
        res,
    });
}

module.exports = renderReactPage;
