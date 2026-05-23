'use strict';

const server = require('server');

server.get('Render', function (req, res, next) {
    const React = require('*/cartridge/react');
    const ReactDOMServer = require('*/cartridge/react-dom-server-legacy-sfcc');

    const component = React.createElement(
        'div',
        null,
        'Hello world'
    );
    const html = ReactDOMServer.renderToString(component);

    res.print(html);
    next();
});

module.exports = server.exports();
