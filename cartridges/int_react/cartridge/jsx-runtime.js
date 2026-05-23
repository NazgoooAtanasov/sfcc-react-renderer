/**
 * @license React
 * jsx-runtime.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'

var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_OPTIMISTIC_KEY = Symbol.for('react.optimistic_key');

// This is actually a symbol but Flow doesn't support comparison of symbols to refine.
// We use a boolean since in our code we often expect string (key) or number (index),
// so by pretending to be a boolean we cover a lot of cases that don't consider this case.

function hasValidKey(config) {
  return config.key !== undefined;
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.transitional.element') to check
 * if something is a React Element.
 *
 * @internal
 */
function ReactElement(type, key, props, owner, debugStack, debugTask) {
  // Ignore whatever was passed as the ref argument and treat `props.ref` as
  // the source of truth. The only thing we use this for is `element.ref`,
  // which will log a deprecation warning on access. In the next release, we
  // can remove `element.ref` as well as the `ref` argument.
  var refProp = props.ref;

  // An undefined `element.ref` is coerced to `null` for
  // backwards compatibility.
  var ref = refProp !== undefined ? refProp : null;
  var element;
  {
    // In prod, `ref` is a regular property and _owner doesn't exist.
    element = {
      // This tag allows us to uniquely identify this as a React Element
      $$typeof: REACT_ELEMENT_TYPE,
      // Built-in properties that belong on the element
      type: type,
      key: key,
      ref: ref,
      props: props
    };
  }
  return element;
}

/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */
function jsxProd(type, config, maybeKey) {
  var key = null;

  // Currently, key can be spread in as a prop. This causes a potential
  // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
  // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
  // but as an intermediary step, we will use jsxDEV for everything except
  // <div {...props} key="Hi" />, because we aren't currently able to tell if
  // key is explicitly declared to be undefined or not.
  if (maybeKey !== undefined) {
    if (maybeKey === REACT_OPTIMISTIC_KEY) {
      key = REACT_OPTIMISTIC_KEY;
    } else {
      key = '' + maybeKey;
    }
  }
  if (hasValidKey(config)) {
    if (maybeKey === REACT_OPTIMISTIC_KEY) {
      key = REACT_OPTIMISTIC_KEY;
    } else {
      key = '' + config.key;
    }
  }
  var props;
  if (!('key' in config)) {
    // If key was not spread in, we can reuse the original props object. This
    // only works for `jsx`, not `createElement`, because `jsx` is a compiler
    // target and the compiler always passes a new object. For `createElement`,
    // we can't assume a new object is passed every time because it can be
    // called manually.
    //
    // Spreading key is a warning in dev. In a future release, we will not
    // remove a spread key from the props object. (But we'll still warn.) We'll
    // always pass the object straight through.
    props = config;
  } else {
    // We need to remove reserved props (key, prop, ref). Create a fresh props
    // object and copy over all the non-reserved props. We don't use `delete`
    // because in V8 it will deopt the object to dictionary mode.
    props = {};
    for (var propName in config) {
      // Skip over reserved prop names
      if (propName !== 'key') {
        props[propName] = config[propName];
      }
    }
  }
  return ReactElement(type, key, props);
}

var jsx = jsxProd;
// we may want to special case jsxs internally to take advantage of static children.
// for now we can ship identical prod functions
var jsxs = jsxProd;

exports.Fragment = REACT_FRAGMENT_TYPE;
exports.jsx = jsx;
exports.jsxs = jsxs;
