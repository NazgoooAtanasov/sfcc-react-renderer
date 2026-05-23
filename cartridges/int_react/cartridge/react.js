/**
 * @license React
 * react.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// TODO: this is special because it gets imported during build.
//
// It exists as a placeholder so that DevTools can support work tag changes between releases.
// When we next publish a release, update the matching TODO in backend/renderer.js
// TODO: This module is used both by the release scripts and to expose a version
// at runtime. We should instead inject the version number as part of the build
// process, and use the ReactVersions.js module as the single source of truth.
var ReactVersion = '19.3.0';

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'

var REACT_ELEMENT_TYPE = Symbol.for('react.transitional.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_CONSUMER_TYPE = Symbol.for('react.consumer');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_ACTIVITY_TYPE = Symbol.for('react.activity');
var REACT_VIEW_TRANSITION_TYPE = Symbol.for('react.view_transition');
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }
  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }
  return null;
}
var REACT_OPTIMISTIC_KEY = Symbol.for('react.optimistic_key');

// This is actually a symbol but Flow doesn't support comparison of symbols to refine.
// We use a boolean since in our code we often expect string (key) or number (index),
// so by pretending to be a boolean we cover a lot of cases that don't consider this case.

/**
 * This is the abstract API for an update queue.
 */
var ReactNoopUpdateQueue = {
  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function (publicInstance) {
    return false;
  },
  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueForceUpdate: function (publicInstance, callback, callerName) {
  },
  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
  },
  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} Name of the calling function in the public API.
   * @internal
   */
  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
  }
};

var assign = Object.assign;

var emptyObject = {};

/**
 * Base class helpers for the updating state of a component.
 */
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}
Component.prototype.isReactComponent = {};

/**
 * Sets a subset of the state. Always use this to mutate
 * state. You should treat `this.state` as immutable.
 *
 * There is no guarantee that `this.state` will be immediately updated, so
 * accessing `this.state` after calling this method may return the old value.
 *
 * There is no guarantee that calls to `setState` will run synchronously,
 * as they may eventually be batched together.  You can provide an optional
 * callback that will be executed when the call to setState is actually
 * completed.
 *
 * When a function is provided to setState, it will be called at some point in
 * the future (not synchronously). It will be called with the up to date
 * component arguments (state, props, context). These values can be different
 * from this.* because your function may be called after receiveProps but before
 * shouldComponentUpdate, and this new state, props, and context will not yet be
 * assigned to this.
 *
 * @param {object|function} partialState Next partial state or function to
 *        produce next partial state to be merged with current state.
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 */
Component.prototype.setState = function (partialState, callback) {
  if (typeof partialState !== 'object' && typeof partialState !== 'function' && partialState != null) {
    throw new Error('takes an object of state variables to update or a ' + 'function which returns an object of state variables.');
  }
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

/**
 * Forces an update. This should only be invoked when it is known with
 * certainty that we are **not** in a DOM transaction.
 *
 * You may want to call this when you know that some deeper aspect of the
 * component's state has changed but `setState` was not called.
 *
 * This will not invoke `shouldComponentUpdate`, but it will invoke
 * `componentWillUpdate` and `componentDidUpdate`.
 *
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
Component.prototype.forceUpdate = function (callback) {
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * Convenience component with default shallow equality check for sCU.
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
pureComponentPrototype.constructor = PureComponent;
// Avoid an extra prototype jump for these methods.
assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

// an immutable object with a single mutable value
function createRef() {
  var refObject = {
    current: null
  };
  return refObject;
}

var isArrayImpl = Array.isArray;
function isArray(a) {
  return isArrayImpl(a);
}

function noop() {}

var ReactSharedInternals = {
  H: null,
  A: null,
  T: null,
  S: null
};
{
  ReactSharedInternals.G = null;
}

// $FlowFixMe[method-unbinding]
var hasOwnProperty = Object.prototype.hasOwnProperty;

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
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
function createElement(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};
  var key = null;
  if (config != null) {
    if (hasValidKey(config)) {
      if (config.key === REACT_OPTIMISTIC_KEY) {
        key = REACT_OPTIMISTIC_KEY;
      } else {
        key = '' + config.key;
      }
    }

    // Remaining properties are added to a new props object
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) &&
      // Skip over reserved prop names
      propName !== 'key' &&
      // Even though we don't use these anymore in the runtime, we don't want
      // them to appear as props, so in createElement we filter them out.
      // We don't have to do this in the jsx() runtime because the jsx()
      // transform never passed these as props; it used separate arguments.
      propName !== '__self' && propName !== '__source') {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var _i = 0; _i < childrenLength; _i++) {
      childArray[_i] = arguments[_i + 2];
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  return ReactElement(type, key, props);
}
function cloneAndReplaceKey(oldElement, newKey) {
  var clonedElement = ReactElement(oldElement.type, newKey, oldElement.props);
  return clonedElement;
}

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://reactjs.org/docs/react-api.html#cloneelement
 */
function cloneElement(element, config, children) {
  if (element === null || element === undefined) {
    throw new Error("The argument must be a React element, but you passed " + element + ".");
  }
  var propName;

  // Original props are copied
  var props = assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  if (config != null) {
    if (hasValidKey(config)) {
      if (config.key === REACT_OPTIMISTIC_KEY) {
        key = REACT_OPTIMISTIC_KEY;
      } else {
        key = '' + config.key;
      }
    }

    // Remaining properties override existing props
    for (propName in config) {
      if (hasOwnProperty.call(config, propName) &&
      // Skip over reserved prop names
      propName !== 'key' &&
      // ...and maybe these, too, though we currently rely on them for
      // warnings and debug information in dev. Need to decide if we're OK
      // with dropping them. In the jsx() runtime it's not an issue because
      // the data gets passed as separate arguments instead of props, but
      // it would be nice to stop relying on them entirely so we can drop
      // them from the internal Fiber field.
      propName !== '__self' && propName !== '__source' &&
      // Undefined `ref` is ignored by cloneElement. We treat it the same as
      // if the property were missing. This is mostly for
      // backwards compatibility.
      !(propName === 'ref' && config.ref === undefined)) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }
  var clonedElement = ReactElement(element.type, key, props);
  return clonedElement;
}

/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */
function isValidElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}

var SEPARATOR = '.';
var SUBSEPARATOR = ':';

/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */
function escape(key) {
  var escapeRegex = /[=:]/g;
  var escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  var escapedString = key.replace(escapeRegex, function (match) {
    // $FlowFixMe[invalid-computed-prop]
    return escaperLookup[match];
  });
  return '$' + escapedString;
}
var userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
  return text.replace(userProvidedKeyEscapeRegex, '$&/');
}

/**
 * Generate a key string that identifies a element within a set.
 *
 * @param {*} element A element that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getElementKey(element, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (typeof element === 'object' && element !== null && element.key != null) {
    if (element.key === REACT_OPTIMISTIC_KEY) {
      return index.toString(36);
    }
    return escape('' + element.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}
function resolveThenable(thenable) {
  switch (thenable.status) {
    case 'fulfilled':
      {
        var fulfilledValue = thenable.value;
        return fulfilledValue;
      }
    case 'rejected':
      {
        var rejectedError = thenable.reason;
        throw rejectedError;
      }
    default:
      {
        if (typeof thenable.status === 'string') {
          // Only instrument the thenable if the status if not defined. If
          // it's defined, but an unknown value, assume it's been instrumented by
          // some custom userspace implementation. We treat it as "pending".
          // Attach a dummy listener, to ensure that any lazy initialization can
          // happen. Flight lazily parses JSON when the value is actually awaited.
          thenable.then(noop, noop);
        } else {
          // This is an uncached thenable that we haven't seen before.

          // TODO: Detect infinite ping loops caused by uncached promises.

          var pendingThenable = thenable;
          pendingThenable.status = 'pending';
          pendingThenable.then(function (fulfilledValue) {
            if (thenable.status === 'pending') {
              var fulfilledThenable = thenable;
              fulfilledThenable.status = 'fulfilled';
              fulfilledThenable.value = fulfilledValue;
            }
          }, function (error) {
            if (thenable.status === 'pending') {
              var rejectedThenable = thenable;
              rejectedThenable.status = 'rejected';
              rejectedThenable.reason = error;
            }
          });
        }

        // Check one more time in case the thenable resolved synchronously.
        switch (thenable.status) {
          case 'fulfilled':
            {
              var fulfilledThenable = thenable;
              return fulfilledThenable.value;
            }
          case 'rejected':
            {
              var rejectedThenable = thenable;
              var _rejectedError = rejectedThenable.reason;
              throw _rejectedError;
            }
        }
      }
  }
  throw thenable;
}
function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
  var type = typeof children;
  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }
  var invokeCallback = false;
  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'bigint':
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
            break;
          case REACT_LAZY_TYPE:
            var payload = children._payload;
            var init = children._init;
            return mapIntoArray(init(payload), array, escapedPrefix, nameSoFar, callback);
        }
    }
  }
  if (invokeCallback) {
    var _child = children;
    var mappedChild = callback(_child);
    // If it's the only child, treat the name as if it was wrapped in an array
    // so that it's consistent if the number of children grows:
    var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
    if (isArray(mappedChild)) {
      var escapedChildKey = '';
      if (childKey != null) {
        escapedChildKey = escapeUserProvidedKey(childKey) + '/';
      }
      mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
        return c;
      });
    } else if (mappedChild != null) {
      if (isValidElement(mappedChild)) {
        var newChild = cloneAndReplaceKey(mappedChild,
        // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        escapedPrefix + (
        // $FlowFixMe[incompatible-type] Flow incorrectly thinks React.Portal doesn't have a key
        mappedChild.key != null && (!_child || _child.key !== mappedChild.key) ? escapeUserProvidedKey(
        // $FlowFixMe[unsafe-addition]
        '' + mappedChild.key // eslint-disable-line react-internal/safe-string-coercion
        ) + '/' : '') + childKey);
        mappedChild = newChild;
      }
      array.push(mappedChild);
    }
    return 1;
  }
  var child;
  var nextName;
  var subtreeCount = 0; // Count of children found in the current subtree.
  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
  if (isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getElementKey(child, i);
      subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
    }
  } else {
    var iteratorFn = getIteratorFn(children);
    if (typeof iteratorFn === 'function') {
      var iterableChildren = children;
      var iterator = iteratorFn.call(iterableChildren);
      var step;
      var ii = 0;
      // $FlowFixMe[incompatible-use] `iteratorFn` might return null according to typing.
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getElementKey(child, ii++);
        subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
      }
    } else if (type === 'object') {
      if (typeof children.then === 'function') {
        return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
      }

      // eslint-disable-next-line react-internal/safe-string-coercion
      var childrenString = String(children);
      throw new Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
    }
  }
  return subtreeCount;
}

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenmap
 *
 * The provided mapFunction(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children, func, context) {
  if (children == null) {
    // $FlowFixMe limitation refining abstract types in Flow
    return children;
  }
  var result = [];
  var count = 0;
  mapIntoArray(children, result, '', '', function (child) {
    return func.call(context, child, count++);
  });
  return result;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrencount
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children) {
  var n = 0;
  mapChildren(children, function () {
    n++;
    // Don't return anything
  });
  return n;
}

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(children, forEachFunc, forEachContext) {
  mapChildren(children,
  // $FlowFixMe[missing-this-annot]
  function () {
    forEachFunc.apply(this, arguments);
    // Don't return anything.
  }, forEachContext);
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
 */
function toArray(children) {
  return mapChildren(children, function (child) {
    return child;
  }) || [];
}

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenonly
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
function onlyChild(children) {
  if (!isValidElement(children)) {
    throw new Error('React.Children.only expected to receive a single React element child.');
  }
  return children;
}

function createContext(defaultValue) {
  // TODO: Second argument used to be an optional `calculateChangedBits`
  // function. Warn to reserve for future use?

  var context = {
    $$typeof: REACT_CONTEXT_TYPE,
    // As a workaround to support multiple concurrent renderers, we categorize
    // some renderers as primary and others as secondary. We only expect
    // there to be two concurrent renderers at most: React Native (primary) and
    // Fabric (secondary); React DOM (primary) and React ART (secondary).
    // Secondary renderers store their context values on separate fields.
    _currentValue: defaultValue,
    _currentValue2: defaultValue,
    // Used to track how many concurrent renderers this context currently
    // supports within in a single renderer. Such as parallel server rendering.
    _threadCount: 0,
    // These are circular
    Provider: null,
    Consumer: null
  };
  context.Provider = context;
  context.Consumer = {
    $$typeof: REACT_CONSUMER_TYPE,
    _context: context
  };
  return context;
}

var Uninitialized = -1;
var Pending = 0;
var Resolved = 1;
var Rejected = 2;
function lazyInitializer(payload) {
  if (payload._status === Uninitialized) {
    var ctor = payload._result;
    var thenable = ctor();
    // Transition to the next state.
    // This might throw either because it's missing or throws. If so, we treat it
    // as still uninitialized and try again next time. Which is the same as what
    // happens if the ctor or any wrappers processing the ctor throws. This might
    // end up fixing it if the resolution was a concurrency bug.
    thenable.then(function (moduleObject) {
      if (payload._status === Pending || payload._status === Uninitialized) {
        // Transition to the next state.
        var resolved = payload;
        resolved._status = Resolved;
        resolved._result = moduleObject;
        // Make the thenable introspectable
        // TODO we should move the lazy introspection into the resolveLazy
        // impl or make suspendedThenable be able to be a lazy itself
        if (thenable.status === undefined) {
          var fulfilledThenable = thenable;
          fulfilledThenable.status = 'fulfilled';
          fulfilledThenable.value = moduleObject;
        }
      }
    }, function (error) {
      if (payload._status === Pending || payload._status === Uninitialized) {
        // Transition to the next state.
        var rejected = payload;
        rejected._status = Rejected;
        rejected._result = error;
        // Make the thenable introspectable
        // TODO we should move the lazy introspection into the resolveLazy
        // impl or make suspendedThenable be able to be a lazy itself
        if (thenable.status === undefined) {
          var rejectedThenable = thenable;
          rejectedThenable.status = 'rejected';
          rejectedThenable.reason = error;
        }
      }
    });
    if (payload._status === Uninitialized) {
      // In case, we're still uninitialized, then we're waiting for the thenable
      // to resolve. Set it as pending in the meantime.
      var pending = payload;
      pending._status = Pending;
      pending._result = thenable;
    }
  }
  if (payload._status === Resolved) {
    var moduleObject = payload._result;
    return moduleObject.default;
  } else {
    throw payload._result;
  }
}
function lazy(ctor) {
  var payload = {
    // We use these fields to store the result.
    _status: Uninitialized,
    _result: ctor
  };
  var lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _init: lazyInitializer
  };
  return lazyType;
}

function forwardRef(render) {
  var elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render: render
  };
  return elementType;
}

function memo(type, compare) {
  var elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type: type,
    compare: compare === undefined ? null : compare
  };
  return elementType;
}

function noopCache(fn) {
  // On the client (i.e. not a Server Components environment) `cache` has
  // no caching behavior. We just return the function as-is.
  //
  // We intend to implement client caching in a future major release. In the
  // meantime, it's only exposed as an API so that Shared Components can use
  // per-request caching on the server without breaking on the client. But it
  // does mean they need to be aware of the behavioral difference.
  //
  // The rest of the behavior is the same as the server implementation — it
  // returns a new reference, extra properties like `displayName` are not
  // preserved, the length of the new function is 0, etc. That way apps can't
  // accidentally depend on those details.
  return function () {
    // $FlowFixMe[incompatible-call]: We don't want to use rest arguments since we transpile the code.
    return fn.apply(null, arguments);
  };
}
var cache = noopCache ;
function noopCacheSignal() {
  return null;
}
var cacheSignal = noopCacheSignal ;

function resolveDispatcher() {
  var dispatcher = ReactSharedInternals.H;
  // Will result in a null access error if accessed outside render phase. We
  // intentionally don't throw our own error because this is in a hot path.
  // Also helps ensure this is inlined.
  return dispatcher;
}
function getCacheForType(resourceType) {
  var dispatcher = ReactSharedInternals.A;
  if (!dispatcher) {
    // If there is no dispatcher, then we treat this as not being cached.
    return resourceType();
  }
  return dispatcher.getCacheForType(resourceType);
}
function useContext(Context) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useContext(Context);
}
function useState(initialState) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
function useReducer(reducer, initialArg, init) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}
function useRef(initialValue) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useRef(initialValue);
}
function useEffect(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}
function useInsertionEffect(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useInsertionEffect(create, deps);
}
function useLayoutEffect(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useLayoutEffect(create, deps);
}
function useCallback(callback, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useCallback(callback, deps);
}
function useMemo(create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useMemo(create, deps);
}
function useImperativeHandle(ref, create, deps) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useImperativeHandle(ref, create, deps);
}
function useDebugValue(value, formatterFn) {
}
function useTransition() {
  var dispatcher = resolveDispatcher();
  return dispatcher.useTransition();
}
function useDeferredValue(value, initialValue) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useDeferredValue(value, initialValue);
}
function useId() {
  var dispatcher = resolveDispatcher();
  return dispatcher.useId();
}
function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
function useCacheRefresh() {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useCacheRefresh();
}
function use(usable) {
  var dispatcher = resolveDispatcher();
  return dispatcher.use(usable);
}
function useMemoCache(size) {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useMemoCache(size);
}
function useEffectEvent(callback) {
  var dispatcher = resolveDispatcher();
  // $FlowFixMe[not-a-function] This is unstable, thus optional
  return dispatcher.useEffectEvent(callback);
}
function useOptimistic(passthrough, reducer) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useOptimistic(passthrough, reducer);
}
function useActionState(action, initialState, permalink) {
  var dispatcher = resolveDispatcher();
  return dispatcher.useActionState(action, initialState, permalink);
}

var reportGlobalError = typeof reportError === 'function' ?
// In modern browsers, reportError will dispatch an error event,
// emulating an uncaught JavaScript error.
reportError : function (error) {
  if (typeof window === 'object' && typeof window.ErrorEvent === 'function') {
    // Browser Polyfill
    var message = typeof error === 'object' && error !== null && typeof error.message === 'string' ?
    // eslint-disable-next-line react-internal/safe-string-coercion
    String(error.message) :
    // eslint-disable-next-line react-internal/safe-string-coercion
    String(error);
    var event = new window.ErrorEvent('error', {
      bubbles: true,
      cancelable: true,
      message: message,
      error: error
    });
    var shouldLog = window.dispatchEvent(event);
    if (!shouldLog) {
      return;
    }
  } else if (typeof process === 'object' &&
  // $FlowFixMe[method-unbinding]
  typeof process.emit === 'function') {
    // Node Polyfill
    process.emit('uncaughtException', error);
    return;
  }
  console['error'](error);
};

function releaseAsyncTransition() {
}
function startTransition(scope, options) {
  var prevTransition = ReactSharedInternals.T;
  var currentTransition = {};
  {
    currentTransition.types = prevTransition !== null ?
    // If we're a nested transition, we should use the same set as the parent
    // since we're conceptually always joined into the same entangled transition.
    // In practice, this only matters if we add transition types in the inner
    // without setting state. In that case, the inner transition can finish
    // without waiting for the outer.
    prevTransition.types : null;
  }
  {
    currentTransition.gesture = null;
  }
  ReactSharedInternals.T = currentTransition;
  try {
    var returnValue = scope();
    var onStartTransitionFinish = ReactSharedInternals.S;
    if (onStartTransitionFinish !== null) {
      onStartTransitionFinish(currentTransition, returnValue);
    }
    if (typeof returnValue === 'object' && returnValue !== null && typeof returnValue.then === 'function') {
      if (false) ;
      returnValue.then(noop, reportGlobalError);
    }
  } catch (error) {
    reportGlobalError(error);
  } finally {
    if (prevTransition !== null && currentTransition.types !== null) {
      prevTransition.types = currentTransition.types;
    }
    ReactSharedInternals.T = prevTransition;
  }
}
function startGestureTransition(provider, scope, options) {
  if (provider == null) {
    // We enforce this at runtime even though the type also enforces it since we
    // use null as a signal internally so it would lead it to be treated as a
    // regular transition otherwise.
    throw new Error('A Timeline is required as the first argument to startGestureTransition.');
  }
  var prevTransition = ReactSharedInternals.T;
  var currentTransition = {};
  {
    currentTransition.types = null;
  }
  {
    currentTransition.gesture = provider;
  }
  ReactSharedInternals.T = currentTransition;
  try {
    var returnValue = scope();
    if (false) ;
    var onStartGestureTransitionFinish = ReactSharedInternals.G;
    if (onStartGestureTransitionFinish !== null) {
      return onStartGestureTransitionFinish(currentTransition, provider, options);
    }
  } catch (error) {
    reportGlobalError(error);
  } finally {
    ReactSharedInternals.T = prevTransition;
  }
  return noop;
}

function addTransitionType(type) {
  {
    var transition = ReactSharedInternals.T;
    if (transition !== null) {
      var transitionTypes = transition.types;
      if (transitionTypes === null) {
        transition.types = [type];
      } else if (transitionTypes.indexOf(type) === -1) {
        transitionTypes.push(type);
      }
    } else {
      startTransition(addTransitionType.bind(null, type));
    }
  }
}

var ReactCompilerRuntime = {
  __proto__: null,
  c: useMemoCache
};

var Children = {
  map: mapChildren,
  forEach: forEachChildren,
  count: countChildren,
  toArray: toArray,
  only: onlyChild
};

function experimental_useOptimistic(passthrough, reducer) {
  return useOptimistic(passthrough, reducer);
}

exports.Activity = REACT_ACTIVITY_TYPE;
exports.Children = Children;
exports.Component = Component;
exports.Fragment = REACT_FRAGMENT_TYPE;
exports.Profiler = REACT_PROFILER_TYPE;
exports.PureComponent = PureComponent;
exports.StrictMode = REACT_STRICT_MODE_TYPE;
exports.Suspense = REACT_SUSPENSE_TYPE;
exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
exports.__COMPILER_RUNTIME = ReactCompilerRuntime;
exports.addTransitionType = addTransitionType;
exports.cache = cache;
exports.cacheSignal = cacheSignal;
exports.cloneElement = cloneElement;
exports.createContext = createContext;
exports.createElement = createElement;
exports.createRef = createRef;
exports.experimental_useOptimistic = experimental_useOptimistic;
exports.forwardRef = forwardRef;
exports.isValidElement = isValidElement;
exports.lazy = lazy;
exports.memo = memo;
exports.optimisticKey = REACT_OPTIMISTIC_KEY;
exports.startTransition = startTransition;
exports.unstable_Activity = REACT_ACTIVITY_TYPE;
exports.unstable_SuspenseList = REACT_SUSPENSE_LIST_TYPE;
exports.unstable_getCacheForType = getCacheForType;
exports.unstable_startGestureTransition = startGestureTransition;
exports.unstable_useCacheRefresh = useCacheRefresh;
exports.use = use;
exports.useActionState = useActionState;
exports.useCallback = useCallback;
exports.useContext = useContext;
exports.useDebugValue = useDebugValue;
exports.useDeferredValue = useDeferredValue;
exports.useEffect = useEffect;
exports.useEffectEvent = useEffectEvent;
exports.useId = useId;
exports.useImperativeHandle = useImperativeHandle;
exports.useInsertionEffect = useInsertionEffect;
exports.useLayoutEffect = useLayoutEffect;
exports.useMemo = useMemo;
exports.useOptimistic = useOptimistic;
exports.useReducer = useReducer;
exports.useRef = useRef;
exports.useState = useState;
exports.useSyncExternalStore = useSyncExternalStore;
exports.useTransition = useTransition;
exports.version = ReactVersion;
