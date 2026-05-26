import { globSync } from 'glob';
import path from 'path';
import { defineConfig } from 'rollup';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

/* global process */

const cartridgeDirectory = path.join(process.cwd(), 'cartridge');
const pagesDirectory = path.join(cartridgeDirectory, 'pages');
const generatedServerDirectory = path.join(pagesDirectory, 'generated');
const staticPagesDirectory = path.join(
    cartridgeDirectory,
    'static/default/js/react'
);

function pageEntries(directory) {
    const entries = {};

    globSync(path.join(directory, '*.tsx')).forEach((file) => {
        entries[path.basename(file, '.tsx')] = file;
    });

    return entries;
}

function hydrationEntryModules(pages) {
    const prefix = '\0sfcc-react-hydration:';

    return {
        name: 'sfcc-react-hydration-entry-modules',
        resolveId(source) {
            if (source.indexOf(prefix) === 0) {
                return source;
            }

            return null;
        },
        load(id) {
            if (id.indexOf(prefix) !== 0) {
                return null;
            }

            const name = id.slice(prefix.length);
            const pageFile = pages[name];
            const importPath = pageFile.replace(/\\/g, '/');

            return `import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import Page from '${importPath}';

function readProps(root) {
    var raw = root.dataset.reactSsrProps;
    return raw ? JSON.parse(raw) : {};
}

function hydrate() {
    var root = document.querySelector('[data-react-ssr-component-name="${name}"]');
    if (!root || root.dataset.reactHydrated === 'true') return;
    hydrateRoot(root, React.createElement(Page, readProps(root)));
    root.dataset.reactHydrated = 'true';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate, { once: true });
} else {
    hydrate();
}
`;
        },
    };
}

const pages = pageEntries(pagesDirectory);
const hydrationInputs = Object.keys(pages).reduce((entries, name) => {
    entries[name] = `\0sfcc-react-hydration:${name}`;
    return entries;
}, {});

const serverConfig = {
    input: pages,
    output: {
        dir: generatedServerDirectory,
        entryFileNames: '[name].js',
        format: 'cjs',
        exports: 'default',
        sourcemap: false,
    },
    external: ['react', 'react/jsx-runtime'],
    plugins: [
        resolve({ extensions: ['.ts', '.tsx'] }),
        typescript({
            noEmit: false,
            compilerOptions: { noEmit: false, sourceMap: false },
        }),
        commonjs(),
        babel({
            babelHelpers: 'bundled',
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            exclude: 'node_modules/**',
        }),
        replace({
            preventAssignment: true,
            "require('react/jsx-runtime')":
                'require("*/cartridge/jsx-runtime")',
            'require("react/jsx-runtime")':
                'require("*/cartridge/jsx-runtime")',
            "require('react')": 'require("*/cartridge/react")',
            'require("react")': 'require("*/cartridge/react")',
        }),
    ],
};

const clientConfigs = Object.entries(hydrationInputs).map(([name, input]) => ({
    input,
    output: {
        file: path.join(staticPagesDirectory, `${name}.js`),
        format: 'iife',
        name: `ReactPage${name.replace(/[^a-zA-Z0-9_$]/g, '')}`,
        sourcemap: false,
    },
    plugins: [
        resolve({
            browser: true,
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        }),
        typescript({
            noEmit: false,
            compilerOptions: { noEmit: false, sourceMap: false },
        }),
        commonjs(),
        hydrationEntryModules(pages),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        babel({
            babelHelpers: 'bundled',
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            exclude: 'node_modules/**',
        }),
    ],
}));

export default defineConfig([serverConfig, ...clientConfigs]);
