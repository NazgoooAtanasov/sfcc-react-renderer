module.exports = function (api) {
    api.cache(true);

    const presets = [
        [
            '@babel/preset-env',
            {
                useBuiltIns: 'entry',
                corejs: 3,
                targets: {
                    ie: '11',
                    edge: '17',
                    firefox: '63',
                    chrome: '70',
                    safari: '11.1',
                    ios: '11.2',
                    android: '67',
                },
            },
        ],
        ['@babel/preset-react', { runtime: 'automatic' }],
    ];

    const plugins = [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        '@babel/plugin-transform-class-properties',
        '@babel/plugin-transform-object-rest-spread',
    ];

    return {
        presets,
        plugins,
    };
};
