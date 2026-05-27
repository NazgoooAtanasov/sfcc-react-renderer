# Bundled npm Libraries in SFCC Script API

This note evaluates the idea of taking npm libraries, bundling them with Rollup
or another JavaScript bundler, transpiling the result to ES5, and running that
bundle inside Salesforce B2C Commerce Cloud Script API.

The short version: this can work for carefully selected synchronous libraries,
but ES5 output is not the same thing as SFCC runtime compatibility. A bundler can
reshape modules and a transpiler can rewrite syntax, but neither one guarantees
that missing globals, async semantics, browser APIs, Node APIs, or platform quotas
will behave like they do in a browser or Node.js.

## Why This Approach Is Attractive

Bundling npm code for SFCC has real positives when the library is a good fit:

- It can allow reuse of well-tested ecosystem code instead of rewriting every
  utility in cartridge-specific JavaScript.
- It can support shared code between browser bundles and server-rendered SFCC
  modules, reducing drift between client and server behavior.
- Rollup can flatten ESM/CommonJS dependency graphs into one SFCC-loadable module,
  which helps when dependencies use import/export syntax or package entrypoints
  that SFCC cannot load directly.
- Tree shaking and minification can reduce the amount of code shipped when a
  package is modular and side-effect metadata is accurate.
- Babel or another transpiler can convert many modern syntax forms to older
  JavaScript syntax, including classes, arrow functions, object spread, optional
  chaining, and some async helper output.
- Build-time replacement can remove development-only branches such as
  `process.env.NODE_ENV` checks when those checks are known and controlled.
- The same build pipeline can produce separate server and client outputs, letting
  SFCC render a shell while the browser executes richer npm-dependent behavior.

For small, synchronous, pure JavaScript libraries, this can be a pragmatic bridge.
Examples that tend to be more realistic are formatting helpers, deterministic
parsers, small data transformation utilities, schema validators with compatible
runtime requirements, and code that only needs documented ECMAScript built-ins.

## What Bundling And ES5 Transpilation Actually Solve

Bundling mainly solves module shape:

- Package imports can be resolved at build time.
- Multiple package files can be collapsed into one generated cartridge file.
- ESM can be converted to CommonJS.
- Some package entrypoints can be selected or aliased.
- Unreachable code may be removed if the package is tree-shakable.

Transpilation mainly solves syntax shape:

- Newer syntax can be rewritten into older syntax.
- JSX and TypeScript can be compiled away.
- Some helpers can be emitted for transformed language features.

These are useful transformations, but they are not enough on their own. A bundle
that parses as ES5 can still fail immediately, or fail only under a specific
render path, if the original library expects runtime behavior that SFCC does not
document or provide.

## The SFCC Runtime Boundary

The local SFCC Script API documentation lists supported top-level JavaScript
classes such as `Array`, `Object`, `Date`, `Map`, `Set`, `WeakMap`, `WeakSet`,
`Symbol`, typed arrays, `JSON`, and CommonJS `require`.

The same local documentation does not list `Promise` or `Proxy` as top-level
classes, and `TopLevel.global` does not document browser or Node scheduling APIs
such as `setTimeout`, `setImmediate`, `queueMicrotask`, or `process.nextTick`.
This absence should be treated as a compatibility risk unless the target SFCC
runtime is explicitly tested and the dependency path is proven not to require
those features.

The SFCC quota documentation also matters. The `api.jsArraySize` quota limits a
dense JavaScript array to 20,000 elements by default, with a warning at 12,000.
Library internals that allocate large arrays, or retry/render loops that grow
internal queues, can hit that quota even when application data is small.

## Main Downsides

The biggest downside is false confidence. A successful Rollup+Babel build proves
that the code can be emitted. It does not prove that the code can execute inside
SFCC Script API.

Common failure modes include:

- Missing globals such as `Promise`, `Proxy`, `fetch`, `URL`, `AbortController`,
  `window`, `document`, `location`, timers, microtask APIs, or Node globals.
- Package initialization code that touches unsupported globals as soon as the
  module is loaded, before any application branch can avoid it.
- Async behavior that depends on real Promise microtask semantics.
- Browser-specific libraries that assume DOM APIs even when used from a
  server-rendered component.
- Node-oriented packages that assume `process`, `Buffer`, `stream`, `crypto`,
  filesystem APIs, or Node module resolution details.
- Bundled code paths that remain in the output even when the current application
  path does not execute them.
- Larger cartridge files, slower script loading, harder debugging, and stack
  traces that point into generated code.
- Additional security, license, and maintenance overhead from vendoring a larger
  npm dependency graph into server-side commerce code.
- Hard-to-detect behavioral differences between local Node probes and the actual
  SFCC Rhino/Script API runtime.

## Important Limitations

### Syntax Compatibility Is Not Runtime Compatibility

Babel can transform syntax, but it does not automatically provide platform
objects. For example, transforming `async`/`await` may remove the syntax, but the
resulting helper code can still require `Promise`. If `Promise` is missing or is
only partially shimmed, the code may parse but still fail or behave incorrectly.

### Promise Is Not Just A Constructor

A minimal `Promise` shim can hide `ReferenceError`, but many libraries depend on
Promise scheduling semantics. Real Promise behavior includes asynchronous
microtask ordering. The local SFCC docs do not document `queueMicrotask`,
`setTimeout`, `setImmediate`, or `process.nextTick` as available server-side
scheduling primitives.

That makes generic Promise polyfills risky. Some npm Promise packages eventually
depend on scheduler APIs that are normal in Node or browsers but not documented
in SFCC. A synchronous shim is even riskier because it changes ordering and can
trigger unexpected render loops or retry behavior.

### Proxy Cannot Be Faithfully Polyfilled

`Proxy` is a language-level interception mechanism. Libraries use it to observe
property access, implement reactive tracking, or virtualize objects. If a package
requires `new Proxy(...)`, a fake constructor cannot reproduce the same behavior
for arbitrary property reads.

The practical mitigation is to avoid code paths that require `Proxy`, or choose a
different package, not to polyfill it.

### Tree Shaking Is Conditional

Tree shaking is helpful, but not a guarantee. It depends on module format,
package side-effect declarations, static analyzability, and the bundler config.
Unsupported code can remain in the generated file. That may be acceptable if it
is not touched during module initialization and never executed, but it is a
fragile contract that must be verified after each dependency or code change.

### Server Rendering Makes Async Assumptions Visible

React server rendering in this project currently uses the legacy synchronous
server renderer. That means render-time async patterns, especially Suspense paths
that throw a Promise/thenable, are a poor fit for SFCC server execution.

An npm library can be safe in the browser and unsafe in the SFCC render path
because the browser has the missing runtime pieces and can continue asynchronously.

## Practical Decision Criteria

Bundling an npm package into SFCC server-side Script API is more reasonable when:

- The package is synchronous.
- It is pure JavaScript and does not require DOM, browser, Node, timers, workers,
  networking, cryptography, filesystem access, or process globals.
- It does not require `Promise`, `Proxy`, generators with async scheduling,
  dynamic import, or other unsupported runtime behavior.
- Unsupported branches are removed at build time or proven unreachable at module
  initialization and runtime.
- The generated bundle is small enough to inspect and debug.
- Tests or probes simulate the actual SFCC constraints, not just Node.
- The real SFCC environment has been verified after the bundle is deployed.

It is a poor fit when:

- The package is primarily async, reactive, browser-driven, or Node-driven.
- It relies on Suspense, timers, microtasks, streams, web APIs, or package
  internals that use `Proxy`.
- Correct behavior depends on subtle event-loop ordering.
- The server-rendered result must be fully data-complete rather than a shell.
- The package brings a large transitive dependency graph for a small feature.

## Recommended Architecture

Use a strict server/client boundary:

- SFCC server bundle: keep it synchronous, small, and platform-native. Use
  documented `dw.*` APIs and documented top-level JavaScript features. Render
  stable HTML, initial props, or loading shells.
- Browser bundle: run modern npm libraries, fetch logic, hydration, DOM APIs,
  timers, and browser-native Promise behavior.
- Shared code: limit to pure utilities with audited runtime requirements.

When a dependency is needed on the server, audit it as part of the build:

1. Inspect the generated server bundle for unsupported globals such as `Promise`,
   `Proxy`, `window`, `document`, `fetch`, `process`, `Buffer`, timers, and
   dynamic imports.
2. Check whether those references run at module initialization.
3. Run local probes that remove unsupported globals and enforce known quotas.
4. Test the resulting cartridge on a real SFCC instance.
5. Re-run the audit whenever dependency versions, bundler options, or render
   paths change.

## Bottom Line

Rollup, Babel, and ES5 output can make npm packages loadable by shape, but they
do not make them native to SFCC Script API. The hard question is not "can this
package be bundled?" It is "does every executed path depend only on runtime
features and semantics that SFCC actually supports?"

Server-side npm bundling should be treated as an audited exception for compatible
libraries, not as a general compatibility strategy.
