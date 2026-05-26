# sfcc-react-renderer

`sfcc-react-renderer` is a Salesforce B2C Commerce Cloud cartridge experiment
for classic React server-side rendering in SFCC Script API.

The repository contains a reusable React runtime cartridge and a reference SFRA
cartridge that renders TSX page components on the server and hydrates them in the
browser.

## Current Contents

The repo contains two cartridges:

```text
cartridges/int_react/
  Reusable React SSR runtime cartridge.

cartridges/app_sfra_react/
  Reference SFRA cartridge used to prove and document how a storefront app would
  consume the runtime cartridge.
```

### `cartridges/int_react`

This cartridge currently contains generated SFCC-compatible React runtime files:
SFCC-compatible React runtime generated based on this react fork [`react-for-sfcc`](https://github.com/NazgoooAtanasov/react-for-sfcc).

```text
cartridge/react.js
cartridge/jsx-runtime.js
cartridge/react-dom-server-legacy-sfcc.js
cartridge/scripts/react/renderReact.js
cartridge/scripts/react/serializeProps.js
```

The server renderer exposes synchronous legacy APIs, including:

```js
ReactDOMServer.renderToString(element)
ReactDOMServer.renderToStaticMarkup(element)
```

### `cartridges/app_sfra_react`

This is the reference cartridge. It owns the app-specific page source, Rollup
build, generated artifacts, manifest, and controller integration.

```text
cartridge/controllers/React.js
cartridge/pages/HomeReact.tsx
cartridge/pages/generated/HomeReact.js
cartridge/scripts/react/manifest.js
cartridge/scripts/react/renderReactPage.js
cartridge/static/default/js/react/HomeReact.js
package.json
rollup.config.mjs
tsconfig.json
```

The `React-Render` route renders `HomeReact` through `renderReactPage`, which:

1. Looks up the page in `cartridge/scripts/react/manifest.js`.
2. Requires the generated server module from `cartridge/pages/generated`.
3. Renders with the SFCC React runtime from `int_react`.
4. Serializes props into the hydration root.
5. Emits a hydration script URL with `dw/web/URLUtils.staticURL()`.

Rollup builds:

```text
cartridge/pages/*.tsx
  -> cartridge/pages/generated/*.js

virtual hydration entry + cartridge/pages/*.tsx
  -> cartridge/static/default/js/react/*.js
```

## Local Build

Install dependencies from the reference cartridge and run the build:

```sh
cd cartridges/app_sfra_react
pnpm install
pnpm run typecheck
pnpm run build
```

`pnpm run build` runs Rollup and generates the server-side CommonJS page module
and browser hydration bundle.

## SFCC Usage

Deploy both cartridges and put `app_sfra_react` before `int_react` in the
cartridge path. The reference controller exposes:

```text
React-Render
```

Open `React-Render` to verify that server HTML is rendered and the browser
hydration bundle is loaded.
