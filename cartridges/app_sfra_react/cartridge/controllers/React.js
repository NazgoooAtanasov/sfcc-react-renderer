'use strict';

const server = require('server');
const renderReactPage = require('*/cartridge/scripts/react/renderReactPage');

server.get('Render', function (_req, res, next) {
    const props = {
        title: 'Hello from React SSR',
        message: 'Rendered in SFCC Script API and hydrated in the browser',
        ctaLabel: 'Hydrated action',
    };

    renderReactPage({
        res: res,
        component: 'HomeReact',
        props: props,
        hydrate: true,
    });
    next();
});

module.exports = server.exports();
