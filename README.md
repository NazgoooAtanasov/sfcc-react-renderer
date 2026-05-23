# sfcc-react-renderer

`sfcc-react-renderer` is an early Salesforce B2C Commerce Cloud cartridge
experiment for classic React server-side rendering in SFCC Script API.

The repository currently proves that a generated, SFCC-compatible React runtime
and legacy server renderer can run inside a cartridge controller and render HTML
with `renderToString`. The broader goal is to turn that proof into an opt-in SSR
capability that SFRA projects can use for selected React pages, with optional
browser hydration.

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
```

The server renderer exposes synchronous legacy APIs, including:

```js
ReactDOMServer.renderToString(element)
ReactDOMServer.renderToStaticMarkup(element)
```

### `cartridges/app_sfra_react`

This is the reference cartridge. At the moment it contains a single controller:

```text
cartridge/controllers/React.js
```

The `React-Render` route:

1. Loads `*/cartridge/react`.
2. Loads `*/cartridge/react-dom-server-legacy-sfcc`.
3. Creates a simple React element with `React.createElement`.
4. Renders it with `renderToString`.
5. Prints the generated HTML response.

This route is hand-wired proof code. It is not the final controller integration
pattern.
