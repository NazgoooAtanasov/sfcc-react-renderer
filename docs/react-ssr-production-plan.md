# React SSR Production Readiness Plan

## Purpose

This document is the canonical handoff and implementation plan for making React
SSR production-ready in SFCC Script API.

The `int_react` repository is expected to contain two cartridges:

```text
cartridges/int_react/
  The basic reusable React SSR cartridge. It owns the SFCC-compatible React
  runtime, server renderer, render helpers, prop serialization, and the minimum
  Script API runtime needed by any cartridge that wants to render React.

cartridges/app_sfra_react/
  A reference/documentation cartridge. It demonstrates how an SFRA project would
  use `int_react`: controllers, example page components, generated artifacts,
  hydration, and documented usage patterns.
```

The goal is not to migrate an existing storefront page immediately. The goal is
to create the option to build or migrate pages later, with automatic hydration
and a path toward full-page hydration.

## Current Repository Context

Current implementation proof files:

```text
cartridges/int_react/cartridge/react.js
cartridges/int_react/cartridge/jsx-runtime.js
cartridges/int_react/cartridge/react-dom-server-legacy-sfcc.js
```

These files are generated SFCC-compatible React runtime/server-renderer files.
The server renderer exposes synchronous legacy APIs such as `renderToString`.

Current reference smoke route:

```text
cartridges/app_sfra_react/cartridge/controllers/React.js
```

Current smoke action:

```text
React-Render
```

The smoke route currently:

1. Requires `*/cartridge/react`.
2. Requires `*/cartridge/react-dom-server-legacy-sfcc`.
3. Creates a component inline with `React.createElement`.
4. Renders the component to an HTML string with `ReactDOMServer.renderToString`.
5. Prints the HTML.

Manual SFCC/browser verification:

- `React-Render` renders server HTML.

Local verification currently available:

```sh
node --check cartridges/app_sfra_react/cartridge/controllers/React.js
node --check cartridges/int_react/cartridge/react.js
node --check cartridges/int_react/cartridge/jsx-runtime.js
node --check cartridges/int_react/cartridge/react-dom-server-legacy-sfcc.js
```

Important current limitations:

- The smoke code is hand-wired.
- There is no `package.json`, Rollup config, or build-suite in the
  `app_sfra_react` reference cartridge yet.
- There is no TSX page compilation pipeline in the reference cartridge yet.
- There is no hydration build pipeline in the reference cartridge yet.
- There is no `renderReactPage` helper yet.
- There is no reference/consumer manifest yet.
- There is no SSR-safety scanner yet.

## Decisions

- React SSR is an opt-in capability, not an immediate page migration.
- `cartridges/int_react` owns the basic reusable React SSR runtime layer.
- `cartridges/app_sfra_react` is a reference/documentation cartridge.
- `cartridges/app_sfra_react` owns the reference build setup: `package.json`,
  Rollup config, TypeScript config, and build/check scripts.
- Reference page source examples should live in:
  `cartridges/app_sfra_react/cartridge/pages/*`.
- Generated server page modules for the reference cartridge should live in:
  `cartridges/app_sfra_react/cartridge/pages/generated/*`.
- Generated client hydration entries for the reference cartridge should live in:
  `cartridges/app_sfra_react/cartridge/client/default/js/generated/pages/*`.
- Generated browser hydration bundles for the reference cartridge should live in:
  `cartridges/app_sfra_react/cartridge/static/default/js/react/pages/*`.
- Client hydration entrypoints are generated automatically.
- Hydration is automatic by default.
- Static SSR must be supported with `hydrate: false`.
- The future direction is full-page hydration.
- Existing browser components are not banned from SSR, but SSR safety is enforced.
  If a component fails SSR-safety checks, make it SSR-safe or keep it out of the
  SSR path.
- Controllers and/or model factories may own page models. Keep this flexible.
- TSX receives plain serializable props.
- Controllers pass already-localized strings for now.
- No Page Designer support for now.
- Cache, promotion, customer group, inventory, and personalization concerns are
  handled case by case.
- SSR failure renders `error/notFound.isml` with HTTP 200.
- Rollback can use SFCC code-version rollback, but a feature flag/custom
  preference is acceptable later.
- No formal JS size or Script API render-time budget is required now, but
  instrumentation should still be added.

## Critical Constraints

SFCC Script API is not Node and is not a browser. Generated server-side JS must
be conservative CommonJS that SFCC can parse and execute.

Generated server components must:

- Use the SFCC React runtime:
  `require("*/cartridge/react")`.
- Use the SFCC server renderer only from server helpers/controllers:
  `require("*/cartridge/react-dom-server-legacy-sfcc")`.
- Avoid bundling or requiring npm `react` at SFCC runtime.
- Export components directly with `module.exports = Component`.
- Avoid browser and Node runtime APIs during server render.

Browser hydration bundles may use npm `react` and `react-dom/client`, but the
React version must remain compatible with the SFCC React renderer version.

This is classic React SSR plus hydration. It is not Next.js and not React Server
Components. A `'use client'` directive has no special meaning here and should be
treated as invalid in SSR-reachable files until custom semantics are designed.

## Cartridge Responsibilities

### `cartridges/int_react`

Owns the basic reusable React SSR runtime:

```text
cartridges/int_react/cartridge/react.js
cartridges/int_react/cartridge/jsx-runtime.js
cartridges/int_react/cartridge/react-dom-server-legacy-sfcc.js
cartridges/int_react/cartridge/scripts/react/renderReactPage.js
cartridges/int_react/cartridge/scripts/react/serializeProps.js
```

This cartridge should be the minimal set of runtime primitives a consuming SFRA
app needs in its cartridge path to do classic React SSR:

- React runtime module.
- JSX runtime module.
- `renderToString`/server renderer module.
- `renderReactPage` helper.
- Safe prop serialization helper.
- Shared runtime error/fallback behavior.

It should not own the reference Rollup config, package scripts, app page sources,
generated page modules, generated manifests, or generated hydration bundles.
Those belong to the consuming cartridge. In this repository, that consuming
cartridge is `cartridges/app_sfra_react`.

`int_react` may later provide reusable script templates or shared helper modules,
but the executable reference build setup should live in `app_sfra_react`.

### `cartridges/app_sfra_react`

Owns reference build setup, usage, and documentation examples:

```text
cartridges/app_sfra_react/package.json
cartridges/app_sfra_react/rollup.config.mjs
cartridges/app_sfra_react/tsconfig.json
cartridges/app_sfra_react/build-suite/build-sfcc-react-pages.js
cartridges/app_sfra_react/build-suite/check-sfcc-react-ssr.js
```

Also owns reference cartridge files and generated artifacts:

```text
cartridges/app_sfra_react/cartridge/controllers/React.js
cartridges/app_sfra_react/cartridge/pages/*.tsx
cartridges/app_sfra_react/cartridge/client/default/js/generated/pages/*.tsx
cartridges/app_sfra_react/cartridge/pages/generated/*.js
cartridges/app_sfra_react/cartridge/scripts/react/manifest.js
cartridges/app_sfra_react/cartridge/static/default/js/react/pages/*.js
```

In a real consuming SFRA app, that app would own equivalent page sources,
generated server page modules, manifest, and static hydration bundles.
`app_sfra_react` exists to document that contract.

## Runtime API Target

Create a reusable helper in the basic runtime cartridge:

```text
cartridges/int_react/cartridge/scripts/react/renderReactPage.js
```

Reference controller usage:

```js
'use strict';

var server = require('server');
var renderReactPage = require('*/cartridge/scripts/react/renderReactPage');

server.get('Render', function (req, res, next) {
    var props = {
        title: 'Hello from React SSR',
        message: 'Rendered in SFCC Script API and hydrated in the browser'
    };

    renderReactPage({
        res: res,
        component: 'HomeReact',
        props: props,
        hydrate: true
    });

    next();
});

module.exports = server.exports();
```

The helper must:

- Load the generated manifest using `require('*/cartridge/scripts/react/manifest')`.
- Resolve the named component to a generated server module.
- Require `*/cartridge/react`.
- Require `*/cartridge/react-dom-server-legacy-sfcc`.
- Render with `renderToString`.
- Serialize props safely.
- Emit a stable hydration root.
- Include the generated hydration bundle when `hydrate !== false`.
- Support `hydrate: false` for static SSR.
- Catch SSR failures.
- Log component name and error details where possible.
- Render `error/notFound.isml` with HTTP 200 on SSR failure.

Controllers should not hand-build React SSR strings.

## Manifest Target

Generate a CommonJS manifest into the consuming/reference cartridge:

```text
cartridges/app_sfra_react/cartridge/scripts/react/manifest.js
```

Example:

```js
'use strict';

module.exports = {
    HomeReact: {
        serverModule: '*/cartridge/pages/generated/HomeReact',
        clientEntry: '/js/react/pages/HomeReact.js',
        hydrate: true
    }
};
```

The manifest is loaded by `renderReactPage` through wildcard require. In a real
consumer app, the app cartridge provides its own generated manifest.

Use a CommonJS module instead of JSON to avoid relying on SFCC JSON loading
behavior.

`cartridges/int_react` should not ship a default generated manifest. The manifest
belongs to the consuming cartridge so wildcard module resolution can find the
app-specific page registry. Shipping a generic manifest from `int_react` risks
shadowing consumer manifests depending on cartridge path order.

Deployment must include the consuming/reference cartridge and `int_react` in the
cartridge path. The reference cartridge should be before `int_react` when it
contains page modules and manifest entries, while `int_react` supplies the shared
runtime/helper modules that the reference cartridge does not provide.

## Automatic Client Entry Target

For every page component in:

```text
cartridges/app_sfra_react/cartridge/pages/*.tsx
```

generate a matching hydration entry in:

```text
cartridges/app_sfra_react/cartridge/client/default/js/generated/pages/*.tsx
```

Generated client entry shape:

```tsx
import { hydrateRoot } from 'react-dom/client';
import Page from '../../../../../pages/HomeReact';

function readProps(root: HTMLElement) {
    const raw = root.dataset.reactSsrProps;
    return raw ? JSON.parse(raw) : {};
}

function hydrate() {
    const root = document.querySelector<HTMLElement>('[data-react-ssr-page="HomeReact"]');
    if (!root || root.dataset.reactHydrated === 'true') return;
    hydrateRoot(root, <Page {...readProps(root)} />);
    root.dataset.reactHydrated = 'true';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate, { once: true });
} else {
    hydrate();
}
```

Rollup should emit:

```text
cartridges/app_sfra_react/cartridge/static/default/js/react/pages/HomeReact.js
```

Static SSR pages are allowed by passing `hydrate: false`; those pages should not
include the client bundle.

## SSR-Safety Enforcement

Add a build-time SSR safety scanner for every module reachable from page entries:

```text
cartridges/*/cartridge/pages/*.tsx
```

The scanner must fail the build for unsafe module-level or render-path usage of:

- `window`
- `document`
- `localStorage`
- `sessionStorage`
- `navigator`
- `location`
- `history`
- `MutationObserver`
- `IntersectionObserver`
- `ResizeObserver`
- `requestAnimationFrame`
- `fetch`
- `XMLHttpRequest`
- `process`
- `Buffer`
- Node built-ins
- `react-dom/client`
- `createPortal`
- CSS imports in the server build
- dynamic imports in the server build
- `'use client'` directives in SSR-reachable files

The scanner should also fail on unapproved dependencies initially, including:

- `@tanstack/react-query`
- browser-only helpers from existing browser utility modules
- modules that import `react-dom`

Allowed patterns:

- `useState`, `useMemo`, `useCallback`, `useContext`, and other render-safe
  React APIs.
- Event handlers that reference browser APIs only when executed in the browser.
- Browser APIs inside `useEffect`, as long as the server build can parse and
  render the module safely.

When an existing browser component fails the scan, make it SSR-safe by moving
browser behavior into effects/client wrappers, separating pure render logic, or
introducing an SSR-safe variant.

Scanner implementation guidance:

- Use TypeScript compiler APIs or another AST parser, not regex-only scanning.
- Build a dependency graph from every page entry.
- Resolve repo aliases used by the consuming app.
- Scan every reachable TS/TSX/JS module.
- For the first version, it is acceptable to be strict and fail on any unsafe
  identifier in SSR-reachable code.
- Output actionable errors.

Example error:

```text
SSR unsafe usage: window
  entry: cartridges/app_sfra_react/cartridge/pages/HomeReact.tsx
  file: react/common.ts
  reason: browser global is not available in SFCC Script API
```

Do not silently skip unsafe dependencies. The team decision is to make components
SSR-safe when they are needed server-side.

## Build Pipeline Target

Replace the current hand-wired proof with a stricter pipeline:

The reference pipeline lives in:

```text
cartridges/app_sfra_react/
```

It documents what a real consuming SFRA app should own in its own codebase.

Pipeline responsibilities:

1. Discover page sources under the consuming/reference cartridge:
   `cartridge/pages/*.tsx`.
2. Typecheck SSR page sources.
3. Run SSR-safety checks.
4. Build SFCC-compatible CommonJS server modules into the same cartridge:
   `cartridge/pages/generated/*.js`.
5. Rewrite React imports to `*/cartridge/react`.
6. Export generated components as `module.exports = Component`.
7. Generate automatic hydration entries into the same cartridge:
   `cartridge/client/default/js/generated/pages/*.tsx`.
8. Build client hydration bundles with Rollup into:
   `cartridge/static/default/js/react/pages/*.js`.
9. Generate the same cartridge manifest:
   `cartridge/scripts/react/manifest.js`.
10. Run `node --check` on generated server modules and helper modules.
11. Run SSR smoke renders for known page fixtures.

Prefer AST-based transforms/checks over string rewrites as the pipeline hardens.

Suggested command names from `cartridges/app_sfra_react/package.json`:

```json
{
  "scripts": {
    "build:sfcc-react-pages": "node build-suite/build-sfcc-react-pages.js",
    "check:sfcc-react-ssr": "node build-suite/check-sfcc-react-ssr.js"
  }
}
```

These scripts do not exist yet. They are target commands for the production
pipeline and should be added to the reference cartridge package metadata, not to
the `int_react` runtime cartridge.

Near-term expected reference outputs:

```text
cartridges/app_sfra_react/cartridge/pages/generated/*.js
cartridges/app_sfra_react/cartridge/scripts/react/manifest.js
cartridges/app_sfra_react/cartridge/client/default/js/generated/pages/*.tsx
cartridges/app_sfra_react/cartridge/static/default/js/react/pages/*.js
```

## Runtime Error Behavior

On SSR failure:

- Log the component name and error.
- Render `error/notFound.isml`.
- Keep HTTP status as 200.
- Do not expose internal error details to the user.

Optional later improvement:

- Add a custom preference or feature flag to disable React SSR per page.

## Observability

Even without budgets, collect data from the beginning:

- SSR render duration.
- SSR success/failure count by component.
- Hydration bundle loaded marker.
- Client hydration failure reports.
- React hydration mismatch warnings in browser tests.

Do not enforce budgets yet, but keep the data visible.

## CI Gates

CI should run:

```sh
cd cartridges/app_sfra_react
npm run build:sfcc-react-pages
npm run check:sfcc-react-ssr
npm run typecheck
npm run eslint
node --check generated SSR files
SSR smoke render tests
hydration browser tests
```

Hydration browser tests should fail if React logs hydration mismatch warnings.

The package/build metadata needed for these commands still needs to be added to
the `app_sfra_react` reference cartridge.

## First Production Candidate

Before calling the capability production-ready, create one opt-in route in
`app_sfra_react` that is not a migration of a critical existing page.

The candidate must prove:

- Controller-created props.
- Server render through `renderReactPage`.
- Automatic hydration.
- `hydrate: false` support on a static variant or fixture.
- Manifest lookup.
- SSR-safety enforcement.
- Fallback to `error/notFound.isml`.
- Deployment includes server modules, client bundles, and manifest together.

## Implementation Order

1. Add `cartridges/int_react/cartridge/scripts/react/renderReactPage.js`.
2. Add `cartridges/int_react/cartridge/scripts/react/serializeProps.js`.
3. Add a hand-written reference manifest:
   `cartridges/app_sfra_react/cartridge/scripts/react/manifest.js`.
4. Add a reference page source:
   `cartridges/app_sfra_react/cartridge/pages/HomeReact.tsx`.
5. Add a hand-written generated-equivalent server page initially:
   `cartridges/app_sfra_react/cartridge/pages/generated/HomeReact.js`.
6. Refactor `cartridges/app_sfra_react/cartridge/controllers/React.js` to call
   `renderReactPage`.
7. Verify the hand-wired reference route still renders.
8. Add reference build metadata under `cartridges/app_sfra_react/`:
   `package.json`, `tsconfig.json`, and `rollup.config.mjs`.
9. Build `cartridges/app_sfra_react/build-suite/build-sfcc-react-pages.js` to
   generate server page modules, hydration entries, and manifest.
10. Update `cartridges/app_sfra_react/rollup.config.mjs` so generated hydration
   entries emit to `cartridge/static/default/js/react/pages/`.
11. Add `cartridges/app_sfra_react/build-suite/check-sfcc-react-ssr.js`.
12. Add SSR smoke render tests.
13. Add hydration browser test.
14. Add documentation for SSR-safe component authoring.

This order intentionally starts with a static manifest and hand-written
generated-equivalent page module. It proves the runtime contract before building
the generator.

## Verification Commands

Use these after each meaningful change, adjusting paths as files are introduced:

```sh
node --check cartridges/app_sfra_react/cartridge/controllers/React.js
node --check cartridges/int_react/cartridge/scripts/react/renderReactPage.js
node --check cartridges/int_react/cartridge/scripts/react/serializeProps.js
node --check cartridges/app_sfra_react/cartridge/scripts/react/manifest.js
node --check cartridges/app_sfra_react/cartridge/pages/generated/HomeReact.js
cd cartridges/app_sfra_react
npm run build:sfcc-react-pages
npm run check:sfcc-react-ssr
```

Manual SFCC/browser verification:

1. Deploy both cartridges to sandbox.
2. Ensure cartridge path includes the reference cartridge and `int_react`.
3. Open `React-Render`.
4. Confirm server HTML is present before hydration.
5. Confirm the hydration script loads when `hydrate !== false`.
6. Confirm interactive page examples hydrate without mismatch warnings.

## Non-Goals For Now

- Page Designer support.
- In-component localization.
- React-managed forms/actions.
- Formal JS bundle budget.
- Formal Script API render-time budget.
- Immediate migration of an existing page.
- React ownership of the full SFRA document shell.
