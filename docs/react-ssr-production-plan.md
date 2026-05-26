# React SSR Production Readiness Plan

## Purpose

This document tracks the current status and remaining work for making React SSR
production-ready in SFCC Script API.

The repository contains two cartridges:

```text
cartridges/int_react/
  Reusable React SSR runtime cartridge. It owns the SFCC-compatible React
  runtime, JSX runtime, server renderer, and shared serialization primitives.

cartridges/app_sfra_react/
  Reference/documentation cartridge. It demonstrates how an SFRA project can use
  int_react through a controller, page components, generated server artifacts,
  hydration bundles, and app-specific render helpers.
```

The goal is not to migrate an existing storefront page immediately. The goal is
to create an opt-in path for building or migrating pages later with SSR and
automatic hydration.

## Current Status

### Done

- `cartridges/int_react` provides the SFCC-compatible React runtime files:
  - `cartridge/react.js`
  - `cartridge/jsx-runtime.js`
  - `cartridge/react-dom-server-legacy-sfcc.js`
- `cartridges/int_react` provides shared prop serialization:
  - `cartridge/scripts/react/serializeProps.js`
- `cartridges/app_sfra_react` owns the app-specific render helper:
  - `cartridge/scripts/react/renderReactPage.js`
- `renderReactPage` currently:
  - loads `*/cartridge/scripts/react/manifest`
  - resolves a component name to a generated server module
  - renders with `*/cartridge/react-dom-server-legacy-sfcc`
  - serializes props safely
  - emits a stable hydration root
  - supports `hydrate: false`
  - emits the hydration script through `dw/web/URLUtils.staticURL()`
  - catches SSR failures and renders `error/notFound`
- `cartridges/app_sfra_react` has a manual CommonJS manifest:
  - `cartridge/scripts/react/manifest.js`
- `cartridges/app_sfra_react` has a reference page source:
  - `cartridge/pages/HomeReact.tsx`
- Rollup builds generated server modules into:
  - `cartridge/pages/generated/*.js`
- Rollup builds browser hydration bundles into:
  - `cartridge/static/default/js/react/*.js`
- Rollup creates hydration entrypoints virtually; no generated hydration source
  files are written to disk.
- `React-Render` uses `renderReactPage` with hydration enabled.
- `React-Static` uses `renderReactPage` with `hydrate: false`.
- The reference cartridge exposes separate TypeScript and Rollup commands:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "rollup -c"
  }
}
```

### Not Done

- No SSR-safety scanner is currently implemented.
- No automated browser hydration test is currently implemented.
- No automated React hydration mismatch warning gate is currently implemented.
- No CI pipeline is currently defined for this capability.
- No ESLint command/configuration is currently defined for this reference
  cartridge.
- No formal bundle-size or server render-time budget is currently enforced.
- No client-side hydration success/failure reporting is currently implemented.
- No Page Designer integration is planned for this phase.
- No generic `int_react` render helper exists yet. The current
  `renderReactPage` is intentionally app-specific because it assumes this app's
  manifest and bundle path conventions.

## Decisions

- React SSR is opt-in, not an immediate storefront migration.
- `int_react` owns reusable runtime primitives only.
- `app_sfra_react` owns app/reference-specific build configuration, page
  sources, generated artifacts, manifest, and render helper.
- Page sources live in:
  `cartridges/app_sfra_react/cartridge/pages/*.tsx`
- Generated server modules live in:
  `cartridges/app_sfra_react/cartridge/pages/generated/*.js`
- Browser hydration bundles live in:
  `cartridges/app_sfra_react/cartridge/static/default/js/react/*.js`
- Hydration entrypoints are virtual Rollup modules, not filesystem artifacts.
- The manifest is manual for now.
- Hydration is automatic by default when a manifest entry has `hydrate !== false`
  and the caller does not pass `hydrate: false`.
- Static SSR is supported by passing `hydrate: false`.
- Controllers pass plain serializable props.
- Controllers pass already-localized strings for now.
- SSR failure renders `error/notFound` and keeps the response status unchanged.
- Browser bundles may use npm `react` and `react-dom/client`.
- Server modules must use the SFCC React runtime and must not bundle npm React.

## Cartridge Responsibilities

### `cartridges/int_react`

Owns reusable SFCC-compatible runtime primitives:

```text
cartridges/int_react/cartridge/react.js
cartridges/int_react/cartridge/jsx-runtime.js
cartridges/int_react/cartridge/react-dom-server-legacy-sfcc.js
cartridges/int_react/cartridge/scripts/react/serializeProps.js
```

It should not own app page sources, generated page modules, generated manifests,
hydration bundles, app-specific Rollup configuration, or manifest-bound render
helpers.

### `cartridges/app_sfra_react`

Owns the reference implementation and app-specific conventions:

```text
cartridges/app_sfra_react/package.json
cartridges/app_sfra_react/rollup.config.mjs
cartridges/app_sfra_react/tsconfig.json
cartridges/app_sfra_react/cartridge/controllers/React.js
cartridges/app_sfra_react/cartridge/pages/*.tsx
cartridges/app_sfra_react/cartridge/pages/generated/*.js
cartridges/app_sfra_react/cartridge/scripts/react/manifest.js
cartridges/app_sfra_react/cartridge/scripts/react/renderReactPage.js
cartridges/app_sfra_react/cartridge/static/default/js/react/*.js
```

## Runtime API

Reference controller usage:

```js
'use strict';

var server = require('server');
var renderReactPage = require('*/cartridge/scripts/react/renderReactPage');

server.get('Render', function (req, res, next) {
    renderReactPage({
        res: res,
        component: 'HomeReact',
        props: {
            title: 'Hello from React SSR',
            message: 'Rendered in SFCC Script API and hydrated in the browser'
        },
        hydrate: true
    });

    next();
});

module.exports = server.exports();
```

Current manifest shape:

```js
'use strict';

module.exports = {
    HomeReact: {
        serverModule: '*/cartridge/pages/generated/HomeReact',
        clientEntry: '/js/react/HomeReact.js',
        hydrate: true
    }
};
```

`renderReactPage` turns `clientEntry` into a storefront static URL with:

```js
URLUtils.staticURL(entry.clientEntry).toString()
```

The local SFCC Script API docs for `dw.web.URLUtils.staticURL(String)` describe
it as returning a current-site static resource URL with cache-related path
information. `absStatic` and `httpsStatic` are available if absolute URLs become
necessary later.

## Build Pipeline

Current build command:

```sh
cd cartridges/app_sfra_react
pnpm run typecheck
pnpm run build
```

Together these run:

```sh
tsc --noEmit && rollup -c
```

Rollup currently has two output paths:

1. Server output:

```text
cartridge/pages/HomeReact.tsx
  -> cartridge/pages/generated/HomeReact.js
```

Server output is CommonJS and rewrites React requires to SFCC wildcard modules:

```js
require("*/cartridge/react")
require("*/cartridge/jsx-runtime")
```

2. Browser output:

```text
virtual hydration entry + cartridge/pages/HomeReact.tsx
  -> cartridge/static/default/js/react/HomeReact.js
```

Browser output bundles npm `react` and `react-dom/client`. Rollup uses
`@rollup/plugin-replace` to replace `process.env.NODE_ENV` with `"production"`
so the browser bundle does not depend on Node's `process` global.

## Remaining Work

### Required Before Production-Ready

- Deploy both cartridges to an SFCC sandbox and verify:
  - `React-Render` returns server-rendered HTML.
  - hydration bundle URL is generated by `URLUtils.staticURL`.
  - hydration runs without console errors.
  - `React-Static` omits the hydration bundle.
  - fallback behavior renders `error/notFound` on SSR failure.
- Add a browser hydration test that fails on React hydration mismatch warnings.
- Decide whether SSR-safety enforcement is still required. If yes, add a scanner
  or another build gate for SSR-reachable page modules.
- Add documentation for SSR-safe component authoring.

### Future Hardening

- Make a generic `int_react` render helper that accepts manifest/page resolution
  dependencies explicitly instead of assuming app conventions.
- Add client-side hydration success/failure reporting.
- Add SSR success/failure counters by component.
- Add bundle-size and server render-time observability.
- Add a feature flag or custom preference to disable React SSR per page.
- Add CI commands once the project decides which gates are required.

## Verification Commands

Current local verification:

```sh
node --check cartridges/app_sfra_react/cartridge/controllers/React.js
node --check cartridges/app_sfra_react/cartridge/scripts/react/renderReactPage.js
node --check cartridges/int_react/cartridge/scripts/react/serializeProps.js
node --check cartridges/app_sfra_react/cartridge/scripts/react/manifest.js
node --check cartridges/app_sfra_react/cartridge/pages/generated/HomeReact.js
cd cartridges/app_sfra_react
pnpm run typecheck
pnpm run build
```

Manual SFCC/browser verification:

1. Deploy both cartridges to a sandbox.
2. Ensure the cartridge path includes `app_sfra_react` before `int_react`.
3. Open `React-Render`.
4. Confirm server HTML is present before hydration.
5. Confirm the hydration script loads from a `URLUtils.staticURL` URL.
6. Confirm hydration runs without mismatch warnings.
7. Open `React-Static`.
8. Confirm no hydration script is emitted.

## Non-Goals For Now

- Page Designer support.
- In-component localization.
- React-managed forms/actions.
- Formal JS bundle budget.
- Formal Script API render-time budget.
- Immediate migration of an existing page.
- React ownership of the full SFRA document shell.
