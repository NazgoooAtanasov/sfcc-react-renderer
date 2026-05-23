/**
 * @license React
 * react-dom-server-legacy-sfcc.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var React = require('./react');

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
var REACT_SCOPE_TYPE = Symbol.for('react.scope');
var REACT_ACTIVITY_TYPE = Symbol.for('react.activity');
var REACT_LEGACY_HIDDEN_TYPE = Symbol.for('react.legacy_hidden');
var REACT_MEMO_CACHE_SENTINEL = Symbol.for('react.memo_cache_sentinel');
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
var ASYNC_ITERATOR = Symbol.asyncIterator;
var REACT_OPTIMISTIC_KEY = Symbol.for('react.optimistic_key');

// This is actually a symbol but Flow doesn't support comparison of symbols to refine.
// We use a boolean since in our code we often expect string (key) or number (index),
// so by pretending to be a boolean we cover a lot of cases that don't consider this case.

var isArrayImpl = Array.isArray;
function isArray(a) {
  return isArrayImpl(a);
}

// -----------------------------------------------------------------------------
// Land or remove (zero effort)
//
// Flags that can likely be deleted or landed without consequences
// -----------------------------------------------------------------------------

var enableFizzBlockingRender = true; // rel="expect"

// A pure JS implementation of a string hashing function. We do not use it for
// security or obfuscation purposes, only to create compact hashes. So we
// prioritize speed over collision avoidance. For example, we use this to hash
// the component key path used by useActionState for MPA-style submissions.
//
// In environments where built-in hashing functions are available, we prefer
// those instead. Like Node's crypto module, or Bun.hash. Unfortunately this
// does not include the web standard crypto API because those methods are all
// async. For our purposes, we need it to be sync because the cost of context
// switching is too high to be worth it.
//
// The most popular hashing algorithm that meets these requirements in the JS
// ecosystem is MurmurHash3, and almost all implementations I could find used
// some version of the implementation by Gary Court inlined below.

function createFastHashJS(key) {
  return murmurhash3_32_gc(key, 0);
}

/* eslint-disable prefer-const, no-fallthrough */

/**
 * @license
 *
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * Copyright (c) 2011 Gary Court
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

function murmurhash3_32_gc(key, seed) {
  var remainder, bytes, h1, h1b, c1, c2, k1, i;
  remainder = key.length & 3; // key.length % 4
  bytes = key.length - remainder;
  h1 = seed;
  c1 = 0xcc9e2d51;
  c2 = 0x1b873593;
  i = 0;
  while (i < bytes) {
    k1 = key.charCodeAt(i) & 0xff | (key.charCodeAt(++i) & 0xff) << 8 | (key.charCodeAt(++i) & 0xff) << 16 | (key.charCodeAt(++i) & 0xff) << 24;
    ++i;
    k1 = (k1 & 0xffff) * c1 + (((k1 >>> 16) * c1 & 0xffff) << 16) & 0xffffffff;
    k1 = k1 << 15 | k1 >>> 17;
    k1 = (k1 & 0xffff) * c2 + (((k1 >>> 16) * c2 & 0xffff) << 16) & 0xffffffff;
    h1 ^= k1;
    h1 = h1 << 13 | h1 >>> 19;
    h1b = (h1 & 0xffff) * 5 + (((h1 >>> 16) * 5 & 0xffff) << 16) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + (((h1b >>> 16) + 0xe654 & 0xffff) << 16);
  }
  k1 = 0;
  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 = (k1 & 0xffff) * c1 + (((k1 >>> 16) * c1 & 0xffff) << 16) & 0xffffffff;
      k1 = k1 << 15 | k1 >>> 17;
      k1 = (k1 & 0xffff) * c2 + (((k1 >>> 16) * c2 & 0xffff) << 16) & 0xffffffff;
      h1 ^= k1;
  }
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = (h1 & 0xffff) * 0x85ebca6b + (((h1 >>> 16) * 0x85ebca6b & 0xffff) << 16) & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = (h1 & 0xffff) * 0xc2b2ae35 + (((h1 >>> 16) * 0xc2b2ae35 & 0xffff) << 16) & 0xffffffff;
  h1 ^= h1 >>> 16;
  return h1 >>> 0;
}

function scheduleWork(callback) {
  callback();
}
function scheduleMicrotask(callback) {
  // While this defies the method name the legacy builds have special
  // overrides that make work scheduling sync. At the moment scheduleMicrotask
  // isn't used by any legacy APIs so this is somewhat academic but if they
  // did in the future we'd probably want to have this be in sync with scheduleWork
  callback();
}
function beginWriting(destination) {}
function writeChunk(destination, chunk) {
  writeChunkAndReturn(destination, chunk);
}
function writeChunkAndReturn(destination, chunk) {
  return destination.push(chunk);
}
function completeWriting(destination) {}
function close(destination) {
  destination.push(null);
}
function stringToChunk(content) {
  return content;
}
function stringToPrecomputedChunk(content) {
  return content;
}
function closeWithError(destination, error) {
  // $FlowFixMe[incompatible-call]: This is an Error object or the destination accepts other types.
  destination.destroy(error);
}
function readAsDataURL(blob) {
  return blob.arrayBuffer().then(function (arrayBuffer) {
    var encoded = typeof Buffer === 'function' && typeof Buffer.from === 'function' ? Buffer.from(arrayBuffer).toString('base64') : btoa(String.fromCharCode.apply(String, new Uint8Array(arrayBuffer)));
    var mimeType = blob.type || 'application/octet-stream';
    return 'data:' + mimeType + ';base64,' + encoded;
  });
}

var assign = Object.assign;

// $FlowFixMe[method-unbinding]
var hasOwnProperty = Object.prototype.hasOwnProperty;

var ATTRIBUTE_NAME_START_CHAR = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var ATTRIBUTE_NAME_CHAR = ATTRIBUTE_NAME_START_CHAR + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var VALID_ATTRIBUTE_NAME_REGEX = new RegExp('^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$');
var illegalAttributeNameCache = {};
var validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
    return true;
  }
  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  return false;
}

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var unitlessNumbers = new Set(['animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth', 'boxFlex', 'boxFlexGroup', 'boxOrdinalGroup', 'columnCount', 'columns', 'flex', 'flexGrow', 'flexPositive', 'flexShrink', 'flexNegative', 'flexOrder', 'gridArea', 'gridRow', 'gridRowEnd', 'gridRowSpan', 'gridRowStart', 'gridColumn', 'gridColumnEnd', 'gridColumnSpan', 'gridColumnStart', 'fontWeight', 'lineClamp', 'lineHeight', 'opacity', 'order', 'orphans', 'scale', 'tabSize', 'widows', 'zIndex', 'zoom', 'fillOpacity',
// SVG-related properties
'floodOpacity', 'stopOpacity', 'strokeDasharray', 'strokeDashoffset', 'strokeMiterlimit', 'strokeOpacity', 'strokeWidth', 'MozAnimationIterationCount',
// Known Prefixed Properties
'MozBoxFlex',
// TODO: Remove these since they shouldn't be used in modern code
'MozBoxFlexGroup', 'MozLineClamp', 'msAnimationIterationCount', 'msFlex', 'msZoom', 'msFlexGrow', 'msFlexNegative', 'msFlexOrder', 'msFlexPositive', 'msFlexShrink', 'msGridColumn', 'msGridColumnSpan', 'msGridRow', 'msGridRowSpan', 'WebkitAnimationIterationCount', 'WebkitBoxFlex', 'WebKitBoxFlexGroup', 'WebkitBoxOrdinalGroup', 'WebkitColumnCount', 'WebkitColumns', 'WebkitFlex', 'WebkitFlexGrow', 'WebkitFlexPositive', 'WebkitFlexShrink', 'WebkitLineClamp']);
function isUnitlessNumber (name) {
  return unitlessNumbers.has(name);
}

var aliases = new Map([['acceptCharset', 'accept-charset'], ['htmlFor', 'for'], ['httpEquiv', 'http-equiv'],
// HTML and SVG attributes, but the SVG attribute is case sensitive.],
['crossOrigin', 'crossorigin'],
// This is a list of all SVG attributes that need special casing.
// Regular attributes that just accept strings.],
['accentHeight', 'accent-height'], ['alignmentBaseline', 'alignment-baseline'], ['arabicForm', 'arabic-form'], ['baselineShift', 'baseline-shift'], ['capHeight', 'cap-height'], ['clipPath', 'clip-path'], ['clipRule', 'clip-rule'], ['colorInterpolation', 'color-interpolation'], ['colorInterpolationFilters', 'color-interpolation-filters'], ['colorProfile', 'color-profile'], ['colorRendering', 'color-rendering'], ['dominantBaseline', 'dominant-baseline'], ['enableBackground', 'enable-background'], ['fillOpacity', 'fill-opacity'], ['fillRule', 'fill-rule'], ['floodColor', 'flood-color'], ['floodOpacity', 'flood-opacity'], ['fontFamily', 'font-family'], ['fontSize', 'font-size'], ['fontSizeAdjust', 'font-size-adjust'], ['fontStretch', 'font-stretch'], ['fontStyle', 'font-style'], ['fontVariant', 'font-variant'], ['fontWeight', 'font-weight'], ['glyphName', 'glyph-name'], ['glyphOrientationHorizontal', 'glyph-orientation-horizontal'], ['glyphOrientationVertical', 'glyph-orientation-vertical'], ['horizAdvX', 'horiz-adv-x'], ['horizOriginX', 'horiz-origin-x'], ['imageRendering', 'image-rendering'], ['letterSpacing', 'letter-spacing'], ['lightingColor', 'lighting-color'], ['markerEnd', 'marker-end'], ['markerMid', 'marker-mid'], ['markerStart', 'marker-start'], ['maskType', 'mask-type'], ['overlinePosition', 'overline-position'], ['overlineThickness', 'overline-thickness'], ['paintOrder', 'paint-order'], ['panose-1', 'panose-1'], ['pointerEvents', 'pointer-events'], ['renderingIntent', 'rendering-intent'], ['shapeRendering', 'shape-rendering'], ['stopColor', 'stop-color'], ['stopOpacity', 'stop-opacity'], ['strikethroughPosition', 'strikethrough-position'], ['strikethroughThickness', 'strikethrough-thickness'], ['strokeDasharray', 'stroke-dasharray'], ['strokeDashoffset', 'stroke-dashoffset'], ['strokeLinecap', 'stroke-linecap'], ['strokeLinejoin', 'stroke-linejoin'], ['strokeMiterlimit', 'stroke-miterlimit'], ['strokeOpacity', 'stroke-opacity'], ['strokeWidth', 'stroke-width'], ['textAnchor', 'text-anchor'], ['textDecoration', 'text-decoration'], ['textRendering', 'text-rendering'], ['transformOrigin', 'transform-origin'], ['underlinePosition', 'underline-position'], ['underlineThickness', 'underline-thickness'], ['unicodeBidi', 'unicode-bidi'], ['unicodeRange', 'unicode-range'], ['unitsPerEm', 'units-per-em'], ['vAlphabetic', 'v-alphabetic'], ['vHanging', 'v-hanging'], ['vIdeographic', 'v-ideographic'], ['vMathematical', 'v-mathematical'], ['vectorEffect', 'vector-effect'], ['vertAdvY', 'vert-adv-y'], ['vertOriginX', 'vert-origin-x'], ['vertOriginY', 'vert-origin-y'], ['wordSpacing', 'word-spacing'], ['writingMode', 'writing-mode'], ['xmlnsXlink', 'xmlns:xlink'], ['xHeight', 'x-height']]);
function getAttributeAlias (name) {
  return aliases.get(name) || name;
}

function getCrossOriginString(input) {
  if (typeof input === 'string') {
    return input === 'use-credentials' ? input : '';
  }
  return undefined;
}

// code copied and modified from escape-html
/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Escapes special characters and HTML entities in a given html string.
 *
 * @param  {string} string HTML string to escape for later insertion
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);
  if (!match) {
    return str;
  }
  var escape;
  var html = '';
  var index;
  var lastIndex = 0;
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        // "
        escape = '&quot;';
        break;
      case 38:
        // &
        escape = '&amp;';
        break;
      case 39:
        // '
        escape = '&#x27;'; // modified from escape-html; used to be '&#39'
        break;
      case 60:
        // <
        escape = '&lt;';
        break;
      case 62:
        // >
        escape = '&gt;';
        break;
      default:
        continue;
    }
    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escape;
  }
  return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
// end code copied and modified from escape-html

/**
 * Escapes text to prevent scripting attacks.
 *
 * @param {*} text Text value to escape.
 * @return {string} An escaped string.
 */
function escapeTextForBrowser(text) {
  if (typeof text === 'boolean' || typeof text === 'number' || typeof text === 'bigint') {
    // this shortcircuit helps perf for types that we know will never have
    // special characters, especially given that this function is used often
    // for numeric dom ids.
    return '' + text;
  }
  return escapeHtml(text);
}

var uppercasePattern = /([A-Z])/g;
var msPattern = /^ms-/;

/**
 * Hyphenates a camelcased CSS property name, for example:
 *
 *   > hyphenateStyleName('backgroundColor')
 *   < "background-color"
 *   > hyphenateStyleName('MozTransition')
 *   < "-moz-transition"
 *   > hyphenateStyleName('msTransition')
 *   < "-ms-transition"
 *
 * As Modernizr suggests (http://modernizr.com/docs/#prefixed), an `ms` prefix
 * is converted to `-ms-`.
 */
function hyphenateStyleName(name) {
  return name.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
}

// A javascript: URL can contain leading C0 control or \u0020 SPACE,
// and any newline or tab are filtered out as if they're not part of the URL.
// https://url.spec.whatwg.org/#url-parsing
// Tab or newline are defined as \r\n\t:
// https://infra.spec.whatwg.org/#ascii-tab-or-newline
// A C0 control is a code point in the range \u0000 NULL to \u001F
// INFORMATION SEPARATOR ONE, inclusive:
// https://infra.spec.whatwg.org/#c0-control-or-space

var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
function sanitizeURL(url) {
  // We should never have symbols here because they get filtered out elsewhere.
  // eslint-disable-next-line react-internal/safe-string-coercion
  if (isJavaScriptProtocol.test('' + url)) {
    // Return a different javascript: url that doesn't cause any side-effects and just
    // throws if ever visited.
    // eslint-disable-next-line no-script-url
    return "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')";
  }
  return url;
}

// The build script is at scripts/rollup/generate-inline-fizz-runtime.js.
// Run `yarn generate-inline-fizz-runtime` to generate.
var markShellTime = 'requestAnimationFrame(function(){$RT=performance.now()});';
var clientRenderBoundary = '$RX=function(b,c,d,e,f){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),f&&(a.cstck=f),b._reactRetry&&b._reactRetry())};';
var completeBoundary = '$RB=[];$RV=function(a){$RT=performance.now();for(var b=0;b<a.length;b+=2){var c=a[b],e=a[b+1];null!==e.parentNode&&e.parentNode.removeChild(e);var f=c.parentNode;if(f){var g=c.previousSibling,h=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d||"/&"===d)if(0===h)break;else h--;else"$"!==d&&"$?"!==d&&"$~"!==d&&"$!"!==d&&"&"!==d||h++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;e.firstChild;)f.insertBefore(e.firstChild,c);g.data="$";g._reactRetry&&requestAnimationFrame(g._reactRetry)}}a.length=0};\n$RC=function(a,b){if(b=document.getElementById(b))(a=document.getElementById(a))?(a.previousSibling.data="$~",$RB.push(a,b),2===$RB.length&&("number"!==typeof $RT?requestAnimationFrame($RV.bind(null,$RB)):(a=performance.now(),setTimeout($RV.bind(null,$RB),2300>a&&2E3<a?2300-a:$RT+300-a)))):b.parentNode.removeChild(b)};';
var completeBoundaryUpgradeToViewTransitions = '$RV=function(A,g){function k(a,b){var e=a.getAttribute(b);e&&(b=a.style,l.push(a,b.viewTransitionName,b.viewTransitionClass),"auto"!==e&&(b.viewTransitionClass=e),(a=a.getAttribute("vt-name"))||(a="_T_"+K++ +"_"),a=CSS.escape(a)!==a?"r-"+btoa(a).replace(/=/g,""):a,b.viewTransitionName=a,B=!0)}var B=!1,K=0,l=[];try{var f=document.__reactViewTransition;if(f){f.finished.finally($RV.bind(null,g));return}var m=new Map;for(f=1;f<g.length;f+=2)for(var h=g[f].querySelectorAll("[vt-share]"),d=0;d<h.length;d++){var c=h[d];m.set(c.getAttribute("vt-name"),c)}var u=[];for(h=0;h<g.length;h+=2){var C=g[h],x=C.parentNode;if(x){var v=x.getBoundingClientRect();if(v.left||v.top||v.width||v.height){c=C;for(f=0;c;){if(8===c.nodeType){var r=c.data;if("/$"===r)if(0===f)break;else f--;else"$"!==r&&"$?"!==r&&"$~"!==r&&"$!"!==r||f++}else if(1===c.nodeType){d=c;var D=d.getAttribute("vt-name"),y=m.get(D);k(d,y?"vt-share":"vt-exit");y&&(k(y,"vt-share"),m.set(D,null));var E=d.querySelectorAll("[vt-share]");\nfor(d=0;d<E.length;d++){var F=E[d],G=F.getAttribute("vt-name"),H=m.get(G);H&&(k(F,"vt-share"),k(H,"vt-share"),m.set(G,null))}}c=c.nextSibling}for(var I=g[h+1],t=I.firstElementChild;t;)null!==m.get(t.getAttribute("vt-name"))&&k(t,"vt-enter"),t=t.nextElementSibling;c=x;do for(var n=c.firstElementChild;n;){var J=n.getAttribute("vt-update");J&&"none"!==J&&!l.includes(n)&&k(n,"vt-update");n=n.nextElementSibling}while((c=c.parentNode)&&1===c.nodeType&&"none"!==c.getAttribute("vt-update"));u.push.apply(u,\nI.querySelectorAll(\'img[src]:not([loading="lazy"])\'))}}}if(B){var z=document.__reactViewTransition=document.startViewTransition({update:function(){A(g);for(var a=[document.documentElement.clientHeight,document.fonts.ready],b={},e=0;e<u.length;b={g:b.g},e++)if(b.g=u[e],!b.g.complete){var p=b.g.getBoundingClientRect();0<p.bottom&&0<p.right&&p.top<window.innerHeight&&p.left<window.innerWidth&&(p=new Promise(function(w){return function(q){w.g.addEventListener("load",q);w.g.addEventListener("error",q)}}(b)),\na.push(p))}return Promise.race([Promise.all(a),new Promise(function(w){var q=performance.now();setTimeout(w,2300>q&&2E3<q?2300-q:500)})])},types:[]});z.ready.finally(function(){for(var a=l.length-3;0<=a;a-=3){var b=l[a],e=b.style;e.viewTransitionName=l[a+1];e.viewTransitionClass=l[a+1];""===b.getAttribute("style")&&b.removeAttribute("style")}});z.finished.finally(function(){document.__reactViewTransition===z&&(document.__reactViewTransition=null)});$RB=[];return}}catch(a){}A(g)}.bind(null,\n$RV);';
var completeBoundaryWithStyles = '$RM=new Map;$RR=function(n,w,p){function u(q){this._p=null;q()}for(var r=new Map,t=document,h,b,e=t.querySelectorAll("link[data-precedence],style[data-precedence]"),v=[],k=0;b=e[k++];)"not all"===b.getAttribute("media")?v.push(b):("LINK"===b.tagName&&$RM.set(b.getAttribute("href"),b),r.set(b.dataset.precedence,h=b));e=0;b=[];var l,a;for(k=!0;;){if(k){var f=p[e++];if(!f){k=!1;e=0;continue}var c=!1,m=0;var d=f[m++];if(a=$RM.get(d)){var g=a._p;c=!0}else{a=t.createElement("link");a.href=d;a.rel=\n"stylesheet";for(a.dataset.precedence=l=f[m++];g=f[m++];)a.setAttribute(g,f[m++]);g=a._p=new Promise(function(q,x){a.onload=u.bind(a,q);a.onerror=u.bind(a,x)});$RM.set(d,a)}d=a.getAttribute("media");!g||d&&!matchMedia(d).matches||b.push(g);if(c)continue}else{a=v[e++];if(!a)break;l=a.getAttribute("data-precedence");a.removeAttribute("media")}c=r.get(l)||h;c===h&&(h=a);r.set(l,a);c?c.parentNode.insertBefore(a,c.nextSibling):(c=t.head,c.insertBefore(a,c.firstChild))}if(p=document.getElementById(n))p.previousSibling.data=\n"$~";Promise.all(b).then($RC.bind(null,n,w),$RX.bind(null,n,"CSS failed to load"))};';
var completeSegment = '$RS=function(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};';
var formReplaying = 'addEventListener("submit",function(a){if(!a.defaultPrevented){var b=a.target,d=a.submitter,c=b.action,e=d;if(d){var f=d.getAttribute("formAction");null!=f&&(c=f,e=null)}"javascript:throw new Error(\'React form unexpectedly submitted.\')"===c&&(a.preventDefault(),a=new FormData(b,e),c=b.ownerDocument||b,(c.$$reactFormReplay=c.$$reactFormReplay||[]).push(b,d,a))}});';

var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function noop() {}

// Since the "not pending" value is always the same, we can reuse the
// same object across all transitions.
var sharedNotPendingObject = {
  pending: false,
  data: null,
  method: null,
  action: null
};
var NotPending = sharedNotPendingObject;

var ScriptStreamingFormat = 0;
var DataStreamingFormat = 1;
var NothingSent /*                      */ = 0;
var SentCompleteSegmentFunction /*      */ = 1;
var SentCompleteBoundaryFunction /*     */ = 2;
var SentClientRenderFunction /*         */ = 4;
var SentStyleInsertionFunction /*       */ = 8;
var SentFormReplayingRuntime /*         */ = 16;
var SentCompletedShellId /*             */ = 32;
var SentMarkShellTime /*                */ = 64;
var NeedUpgradeToViewTransitions /*     */ = 128;
var SentUpgradeToViewTransitions /*     */ = 256;

// Per request, global state that is not contextual to the rendering subtree.
// This cannot be resumed and therefore should only contain things that are
// temporary working state or are never used in the prerender pass.

// Credentials here are things that affect whether a browser will make a request
// as well as things that affect which connection the browser will use for that request.
// We want these to be aligned across preloads and resources because otherwise the preload
// will be wasted.
// We investigated whether referrerPolicy should be included here but from experimentation
// it seems that browsers do not treat this as part of the http cache key and does not affect
// which connection is used.

var EXISTS = null;
// This constant is to mark preloads that have no unique credentials
// to convey. It should never be checked by identity and we should not
// assume Preload values in ResumableState equal this value because they
// will have come from some parsed input.
var PRELOAD_NO_CREDS = [];

// Per response, global state that is not contextual to the rendering subtree.
// This is resumable and therefore should be serializable.

var currentlyFlushingRenderState = null;
var dataElementQuotedEnd = stringToPrecomputedChunk('"></template>');
var startInlineScript = stringToPrecomputedChunk('<script');
var endInlineScript = stringToPrecomputedChunk('</script>');
var startScriptSrc = stringToPrecomputedChunk('<script src="');
var startModuleSrc = stringToPrecomputedChunk('<script type="module" src="');
var scriptNonce = stringToPrecomputedChunk(' nonce="');
var scriptIntegirty = stringToPrecomputedChunk(' integrity="');
var scriptCrossOrigin = stringToPrecomputedChunk(' crossorigin="');
var endAsyncScript = stringToPrecomputedChunk(' async=""></script>');
var startInlineStyle = stringToPrecomputedChunk('<style');

/**
 * This escaping function is designed to work with with inline scripts where the entire
 * contents are escaped. Because we know we are escaping the entire script we can avoid for instance
 * escaping html comment string sequences that are valid javascript as well because
 * if there are no sebsequent <script sequences the html parser will never enter
 * script data double escaped state (see: https://www.w3.org/TR/html53/syntax.html#script-data-double-escaped-state)
 *
 * While untrusted script content should be made safe before using this api it will
 * ensure that the script cannot be early terminated or never terminated state
 */
function escapeEntireInlineScriptContent(scriptText) {
  return ('' + scriptText).replace(scriptRegex, scriptReplacer);
}
var scriptRegex = /(<\/|<)(s)(cript)/gi;
var scriptReplacer = function (match, prefix, s, suffix) {
  return "" + prefix + (s === 's' ? "\\u0073" : "\\u0053") + suffix;
};
var importMapScriptStart = stringToPrecomputedChunk('<script type="importmap">');
var importMapScriptEnd = stringToPrecomputedChunk('</script>');

// Since we store headers as strings we deal with their length in utf16 code units
// rather than visual characters or the utf8 encoding that is used for most binary
// serialization. Some common HTTP servers only allow for headers to be 4kB in length.
// We choose a default length that is likely to be well under this already limited length however
// pathological cases may still cause the utf-8 encoding of the headers to approach this limit.
// It should also be noted that this maximum is a soft maximum. we have not reached the limit we will
// allow one more header to be captured which means in practice if the limit is approached it will be exceeded
var DEFAULT_HEADERS_CAPACITY_IN_UTF16_CODE_UNITS = 2000;

// Allows us to keep track of what we've already written so we can refer back to it.
// if passed externalRuntimeConfig and the enableFizzExternalRuntime feature flag
// is set, the server will send instructions via data attributes (instead of inline scripts)
function createRenderState$1(resumableState, nonce, externalRuntimeConfig, importMap, onHeaders, maxHeadersLength) {
  var nonceScript = typeof nonce === 'string' ? nonce : nonce && nonce.script;
  var inlineScriptWithNonce = nonceScript === undefined ? startInlineScript : stringToPrecomputedChunk('<script nonce="' + escapeTextForBrowser(nonceScript) + '"');
  var nonceStyle = typeof nonce === 'string' ? undefined : nonce && nonce.style;
  var inlineStyleWithNonce = nonceStyle === undefined ? startInlineStyle : stringToPrecomputedChunk('<style nonce="' + escapeTextForBrowser(nonceStyle) + '"');
  var idPrefix = resumableState.idPrefix;
  var bootstrapChunks = [];
  var externalRuntimeScript = null;
  var bootstrapScriptContent = resumableState.bootstrapScriptContent,
    bootstrapScripts = resumableState.bootstrapScripts,
    bootstrapModules = resumableState.bootstrapModules;
  if (bootstrapScriptContent !== undefined) {
    bootstrapChunks.push(inlineScriptWithNonce);
    pushCompletedShellIdAttribute(bootstrapChunks, resumableState);
    bootstrapChunks.push(endOfStartTag, stringToChunk(escapeEntireInlineScriptContent(bootstrapScriptContent)), endInlineScript);
  }
  {
    if (externalRuntimeConfig !== undefined) {
      if (typeof externalRuntimeConfig === 'string') {
        externalRuntimeScript = {
          src: externalRuntimeConfig,
          chunks: []
        };
        pushScriptImpl(externalRuntimeScript.chunks, {
          src: externalRuntimeConfig,
          async: true,
          integrity: undefined,
          nonce: nonceScript
        });
      } else {
        externalRuntimeScript = {
          src: externalRuntimeConfig.src,
          chunks: []
        };
        pushScriptImpl(externalRuntimeScript.chunks, {
          src: externalRuntimeConfig.src,
          async: true,
          integrity: externalRuntimeConfig.integrity,
          nonce: nonceScript
        });
      }
    }
  }
  var importMapChunks = [];
  if (importMap !== undefined) {
    var map = importMap;
    importMapChunks.push(importMapScriptStart);
    importMapChunks.push(stringToChunk(escapeEntireInlineScriptContent(JSON.stringify(map))));
    importMapChunks.push(importMapScriptEnd);
  }
  var headers = onHeaders ? {
    preconnects: '',
    fontPreloads: '',
    highImagePreloads: '',
    remainingCapacity:
    // We seed the remainingCapacity with 2 extra bytes because when we decrement the capacity
    // we always assume we are inserting an interstitial ", " however the first header does not actually
    // consume these two extra bytes.
    2 + (typeof maxHeadersLength === 'number' ? maxHeadersLength : DEFAULT_HEADERS_CAPACITY_IN_UTF16_CODE_UNITS)
  } : null;
  var renderState = {
    placeholderPrefix: stringToPrecomputedChunk(idPrefix + 'P:'),
    segmentPrefix: stringToPrecomputedChunk(idPrefix + 'S:'),
    boundaryPrefix: stringToPrecomputedChunk(idPrefix + 'B:'),
    startInlineScript: inlineScriptWithNonce,
    startInlineStyle: inlineStyleWithNonce,
    preamble: createPreambleState(),
    externalRuntimeScript: externalRuntimeScript,
    bootstrapChunks: bootstrapChunks,
    importMapChunks: importMapChunks,
    onHeaders: onHeaders,
    headers: headers,
    resets: {
      font: {},
      dns: {},
      connect: {
        default: {},
        anonymous: {},
        credentials: {}
      },
      image: {},
      style: {}
    },
    charsetChunks: [],
    viewportChunks: [],
    hoistableChunks: [],
    // cleared on flush
    preconnects: new Set(),
    fontPreloads: new Set(),
    highImagePreloads: new Set(),
    // usedImagePreloads: new Set(),
    styles: new Map(),
    bootstrapScripts: new Set(),
    scripts: new Set(),
    bulkPreloads: new Set(),
    preloads: {
      images: new Map(),
      stylesheets: new Map(),
      scripts: new Map(),
      moduleScripts: new Map()
    },
    nonce: {
      script: nonceScript,
      style: nonceStyle
    },
    // like a module global for currently rendering boundary
    hoistableState: null,
    stylesToHoist: false
  };
  if (bootstrapScripts !== undefined) {
    for (var i = 0; i < bootstrapScripts.length; i++) {
      var scriptConfig = bootstrapScripts[i];
      var src = void 0,
        crossOrigin = void 0,
        integrity = void 0;
      var props = {
        rel: 'preload',
        as: 'script',
        fetchPriority: 'low',
        nonce: nonce
      };
      if (typeof scriptConfig === 'string') {
        props.href = src = scriptConfig;
      } else {
        props.href = src = scriptConfig.src;
        props.integrity = integrity = typeof scriptConfig.integrity === 'string' ? scriptConfig.integrity : undefined;
        props.crossOrigin = crossOrigin = typeof scriptConfig === 'string' || scriptConfig.crossOrigin == null ? undefined : scriptConfig.crossOrigin === 'use-credentials' ? 'use-credentials' : '';
      }
      preloadBootstrapScriptOrModule(resumableState, renderState, src, props);
      bootstrapChunks.push(startScriptSrc, stringToChunk(escapeTextForBrowser(src)), attributeEnd);
      if (nonceScript) {
        bootstrapChunks.push(scriptNonce, stringToChunk(escapeTextForBrowser(nonceScript)), attributeEnd);
      }
      if (typeof integrity === 'string') {
        bootstrapChunks.push(scriptIntegirty, stringToChunk(escapeTextForBrowser(integrity)), attributeEnd);
      }
      if (typeof crossOrigin === 'string') {
        bootstrapChunks.push(scriptCrossOrigin, stringToChunk(escapeTextForBrowser(crossOrigin)), attributeEnd);
      }
      pushCompletedShellIdAttribute(bootstrapChunks, resumableState);
      bootstrapChunks.push(endAsyncScript);
    }
  }
  if (bootstrapModules !== undefined) {
    for (var _i = 0; _i < bootstrapModules.length; _i++) {
      var _scriptConfig = bootstrapModules[_i];
      var _src = void 0,
        _crossOrigin = void 0,
        _integrity = void 0;
      var _props = {
        rel: 'modulepreload',
        fetchPriority: 'low',
        nonce: nonceScript
      };
      if (typeof _scriptConfig === 'string') {
        _props.href = _src = _scriptConfig;
      } else {
        _props.href = _src = _scriptConfig.src;
        _props.integrity = _integrity = typeof _scriptConfig.integrity === 'string' ? _scriptConfig.integrity : undefined;
        _props.crossOrigin = _crossOrigin = typeof _scriptConfig === 'string' || _scriptConfig.crossOrigin == null ? undefined : _scriptConfig.crossOrigin === 'use-credentials' ? 'use-credentials' : '';
      }
      preloadBootstrapScriptOrModule(resumableState, renderState, _src, _props);
      bootstrapChunks.push(startModuleSrc, stringToChunk(escapeTextForBrowser(_src)), attributeEnd);
      if (nonceScript) {
        bootstrapChunks.push(scriptNonce, stringToChunk(escapeTextForBrowser(nonceScript)), attributeEnd);
      }
      if (typeof _integrity === 'string') {
        bootstrapChunks.push(scriptIntegirty, stringToChunk(escapeTextForBrowser(_integrity)), attributeEnd);
      }
      if (typeof _crossOrigin === 'string') {
        bootstrapChunks.push(scriptCrossOrigin, stringToChunk(escapeTextForBrowser(_crossOrigin)), attributeEnd);
      }
      pushCompletedShellIdAttribute(bootstrapChunks, resumableState);
      bootstrapChunks.push(endAsyncScript);
    }
  }
  return renderState;
}
function createResumableState(identifierPrefix, externalRuntimeConfig, bootstrapScriptContent, bootstrapScripts, bootstrapModules) {
  var idPrefix = identifierPrefix === undefined ? '' : identifierPrefix;
  var streamingFormat = ScriptStreamingFormat;
  {
    if (externalRuntimeConfig !== undefined) {
      streamingFormat = DataStreamingFormat;
    }
  }
  return {
    idPrefix: idPrefix,
    nextFormID: 0,
    streamingFormat: streamingFormat,
    bootstrapScriptContent: bootstrapScriptContent,
    bootstrapScripts: bootstrapScripts,
    bootstrapModules: bootstrapModules,
    instructions: NothingSent,
    hasBody: false,
    hasHtml: false,
    // @TODO add bootstrap script to implicit preloads

    // persistent
    unknownResources: {},
    dnsResources: {},
    connectResources: {
      default: {},
      anonymous: {},
      credentials: {}
    },
    imageResources: {},
    styleResources: {},
    scriptResources: {},
    moduleUnknownResources: {},
    moduleScriptResources: {}
  };
}
function createPreambleState() {
  return {
    htmlChunks: null,
    headChunks: null,
    bodyChunks: null
  };
}

// Constants for the insertion mode we're currently writing in. We don't encode all HTML5 insertion
// modes. We only include the variants as they matter for the sake of our purposes.
// We don't actually provide the namespace therefore we use constants instead of the string.
var ROOT_HTML_MODE = 0; // Used for the root most element tag.
// We have a less than HTML_HTML_MODE check elsewhere. If you add more cases here, make sure it
// still makes sense
var HTML_HTML_MODE = 1; // Used for the <html> if it is at the top level.
var HTML_MODE = 2;
var HTML_HEAD_MODE = 3;
var SVG_MODE = 4;
var MATHML_MODE = 5;
var HTML_TABLE_MODE = 6;
var HTML_TABLE_BODY_MODE = 7;
var HTML_TABLE_ROW_MODE = 8;
var HTML_COLGROUP_MODE = 9;
// We have a greater than HTML_TABLE_MODE check elsewhere. If you add more cases here, make sure it
// still makes sense

var NO_SCOPE = /*         */0;
var NOSCRIPT_SCOPE = /*   */1;
var PICTURE_SCOPE = /*    */2;
var FALLBACK_SCOPE = /*   */4;
var EXIT_SCOPE = /*       */8; // A direct Instance below a Suspense fallback is the only thing that can "exit"
var ENTER_SCOPE = /*      */16; // A direct Instance below Suspense content is the only thing that can "enter"
var UPDATE_SCOPE = /*     */32; // Inside a scope that applies "update" ViewTransitions if anything mutates here.
var APPEARING_SCOPE = /*  */64; // Below Suspense content subtree which might appear in an "enter" animation or "shared" animation.

// Everything not listed here are tracked for the whole subtree as opposed to just
// until the next Instance.
var SUBTREE_SCOPE = ~(ENTER_SCOPE | EXIT_SCOPE);

// Lets us keep track of contextual state and pick it back up after suspending.

function createFormatContext(insertionMode, selectedValue, tagScope, viewTransition) {
  return {
    insertionMode: insertionMode,
    selectedValue: selectedValue,
    tagScope: tagScope,
    viewTransition: viewTransition
  };
}
function createRootFormatContext(namespaceURI) {
  var insertionMode = namespaceURI === 'http://www.w3.org/2000/svg' ? SVG_MODE : namespaceURI === 'http://www.w3.org/1998/Math/MathML' ? MATHML_MODE : ROOT_HTML_MODE;
  return createFormatContext(insertionMode, null, NO_SCOPE, null);
}
function getChildFormatContext(parentContext, type, props) {
  var subtreeScope = parentContext.tagScope & SUBTREE_SCOPE;
  switch (type) {
    case 'noscript':
      return createFormatContext(HTML_MODE, null, subtreeScope | NOSCRIPT_SCOPE, null);
    case 'select':
      return createFormatContext(HTML_MODE, props.value != null ? props.value : props.defaultValue, subtreeScope, null);
    case 'svg':
      return createFormatContext(SVG_MODE, null, subtreeScope, null);
    case 'picture':
      return createFormatContext(HTML_MODE, null, subtreeScope | PICTURE_SCOPE, null);
    case 'math':
      return createFormatContext(MATHML_MODE, null, subtreeScope, null);
    case 'foreignObject':
      return createFormatContext(HTML_MODE, null, subtreeScope, null);
    // Table parents are special in that their children can only be created at all if they're
    // wrapped in a table parent. So we need to encode that we're entering this mode.
    case 'table':
      return createFormatContext(HTML_TABLE_MODE, null, subtreeScope, null);
    case 'thead':
    case 'tbody':
    case 'tfoot':
      return createFormatContext(HTML_TABLE_BODY_MODE, null, subtreeScope, null);
    case 'colgroup':
      return createFormatContext(HTML_COLGROUP_MODE, null, subtreeScope, null);
    case 'tr':
      return createFormatContext(HTML_TABLE_ROW_MODE, null, subtreeScope, null);
    case 'head':
      if (parentContext.insertionMode < HTML_MODE) {
        // We are either at the root or inside the <html> tag and can enter
        // the <head> scope
        return createFormatContext(HTML_HEAD_MODE, null, subtreeScope, null);
      }
      break;
    case 'html':
      if (parentContext.insertionMode === ROOT_HTML_MODE) {
        return createFormatContext(HTML_HTML_MODE, null, subtreeScope, null);
      }
      break;
  }
  if (parentContext.insertionMode >= HTML_TABLE_MODE) {
    // Whatever tag this was, it wasn't a table parent or other special parent, so we must have
    // entered plain HTML again.
    return createFormatContext(HTML_MODE, null, subtreeScope, null);
  }
  if (parentContext.insertionMode < HTML_MODE) {
    return createFormatContext(HTML_MODE, null, subtreeScope, null);
  }
  {
    if (parentContext.viewTransition !== null) {
      // If we're inside a view transition, regardless what element we were in, it consumes
      // the view transition context.
      return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, null);
    }
  }
  if (parentContext.tagScope !== subtreeScope) {
    return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, null);
  }
  return parentContext;
}
function getSuspenseViewTransition(parentViewTransition) {
  if (parentViewTransition === null) {
    return null;
  }
  // If a ViewTransition wraps a Suspense boundary it applies to the children Instances
  // in both the fallback and the content.
  // Since we only have a representation of ViewTransitions on the Instances themselves
  // we cannot model the parent ViewTransition activating "enter", "exit" or "share"
  // since those would be ambiguous with the Suspense boundary changing states and
  // affecting the same Instances.
  // We also can't model an "update" when that update is fallback nodes swapping for
  // content nodes. However, we can model is as a "share" from the fallback nodes to
  // the content nodes using the same name. We just have to assign the same name that
  // we would've used (the parent ViewTransition name or auto-assign one).
  var viewTransition = {
    update: parentViewTransition.update,
    // For deep updates.
    enter: 'none',
    exit: 'none',
    share: parentViewTransition.update,
    // For exit or enter of reveals.
    name: parentViewTransition.autoName,
    autoName: parentViewTransition.autoName,
    // TOOD: If we have more than just this Suspense boundary as a child of the ViewTransition
    // then the parent needs to isolate the names so that they don't conflict.
    nameIdx: 0
  };
  return viewTransition;
}
function getSuspenseFallbackFormatContext(resumableState, parentContext) {
  if (parentContext.tagScope & UPDATE_SCOPE) {
    // If we're rendering a Suspense in fallback mode and that is inside a ViewTransition,
    // which hasn't disabled updates, then revealing it might animate the parent so we need
    // the ViewTransition instructions.
    resumableState.instructions |= NeedUpgradeToViewTransitions;
  }
  return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, parentContext.tagScope | FALLBACK_SCOPE | EXIT_SCOPE, getSuspenseViewTransition(parentContext.viewTransition));
}
function getSuspenseContentFormatContext(resumableState, parentContext) {
  var viewTransition = getSuspenseViewTransition(parentContext.viewTransition);
  var subtreeScope = parentContext.tagScope | ENTER_SCOPE;
  if (viewTransition !== null && viewTransition.share !== 'none') {
    // If we have a ViewTransition wrapping Suspense then the appearing animation
    // will be applied just like an "enter" below. Mark it as animating.
    subtreeScope |= APPEARING_SCOPE;
  }
  return createFormatContext(parentContext.insertionMode, parentContext.selectedValue, subtreeScope, viewTransition);
}
function isPreambleContext(formatContext) {
  return formatContext.insertionMode === HTML_HEAD_MODE;
}
function makeId(resumableState, treeId, localId) {
  var idPrefix = resumableState.idPrefix;
  var id = '_' + idPrefix + 'R_' + treeId;

  // Unless this is the first id at this level, append a number at the end
  // that represents the position of this useId hook among all the useId
  // hooks for this fiber.
  if (localId > 0) {
    id += 'H' + localId.toString(32);
  }
  return id + '_';
}
function encodeHTMLTextNode(text) {
  return escapeTextForBrowser(text);
}
var textSeparator = stringToPrecomputedChunk('<!-- -->');
function pushTextInstance$1(target, text, renderState, textEmbedded) {
  if (text === '') {
    // Empty text doesn't have a DOM node representation and the hydration is aware of this.
    return textEmbedded;
  }
  if (textEmbedded) {
    target.push(textSeparator);
  }
  target.push(stringToChunk(encodeHTMLTextNode(text)));
  return true;
}

// Called when Fizz is done with a Segment. Currently the only purpose is to conditionally
// emit a text separator when we don't know for sure it is safe to omit
function pushSegmentFinale$1(target, renderState, lastPushedText, textEmbedded) {
  if (lastPushedText && textEmbedded) {
    target.push(textSeparator);
  }
}
function pushViewTransitionAttributes(target, formatContext) {
  var viewTransition = formatContext.viewTransition;
  if (viewTransition === null) {
    return;
  }
  if (viewTransition.name !== 'auto') {
    pushStringAttribute(target, 'vt-name', viewTransition.nameIdx === 0 ? viewTransition.name : viewTransition.name + '_' + viewTransition.nameIdx);
    // Increment the index in case we have multiple children to the same ViewTransition.
    // Because this is a side-effect in render, we should ideally call pushViewTransitionAttributes
    // after we've suspended (like forms do), so that we don't increment each attempt.
    // TODO: Make this deterministic.
    viewTransition.nameIdx++;
  }
  pushStringAttribute(target, 'vt-update', viewTransition.update);
  if (viewTransition.enter !== 'none') {
    pushStringAttribute(target, 'vt-enter', viewTransition.enter);
  }
  if (viewTransition.exit !== 'none') {
    pushStringAttribute(target, 'vt-exit', viewTransition.exit);
  }
  if (viewTransition.share !== 'none') {
    pushStringAttribute(target, 'vt-share', viewTransition.share);
  }
}
var styleNameCache = new Map();
function processStyleName(styleName) {
  var chunk = styleNameCache.get(styleName);
  if (chunk !== undefined) {
    return chunk;
  }
  var result = stringToPrecomputedChunk(escapeTextForBrowser(hyphenateStyleName(styleName)));
  styleNameCache.set(styleName, result);
  return result;
}
var styleAttributeStart = stringToPrecomputedChunk(' style="');
var styleAssign = stringToPrecomputedChunk(':');
var styleSeparator = stringToPrecomputedChunk(';');
function pushStyleAttribute(target, style) {
  if (typeof style !== 'object') {
    throw new Error('The `style` prop expects a mapping from style properties to values, ' + "not a string. For example, style={{marginRight: spacing + 'em'}} when " + 'using JSX.');
  }
  var isFirst = true;
  for (var styleName in style) {
    if (!hasOwnProperty.call(style, styleName)) {
      continue;
    }
    // If you provide unsafe user data here they can inject arbitrary CSS
    // which may be problematic (I couldn't repro this):
    // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    // http://www.thespanner.co.uk/2007/11/26/ultimate-xss-css-injection/
    // This is not an XSS hole but instead a potential CSS injection issue
    // which has lead to a greater discussion about how we're going to
    // trust URLs moving forward. See #2115901
    var styleValue = style[styleName];
    if (styleValue == null || typeof styleValue === 'boolean' || styleValue === '') {
      // TODO: We used to set empty string as a style with an empty value. Does that ever make sense?
      continue;
    }
    var nameChunk = void 0;
    var valueChunk = void 0;
    var isCustomProperty = styleName.indexOf('--') === 0;
    if (isCustomProperty) {
      nameChunk = stringToChunk(escapeTextForBrowser(styleName));
      valueChunk = stringToChunk(escapeTextForBrowser(('' + styleValue).trim()));
    } else {
      nameChunk = processStyleName(styleName);
      if (typeof styleValue === 'number') {
        if (styleValue !== 0 && !isUnitlessNumber(styleName)) {
          valueChunk = stringToChunk(styleValue + 'px'); // Presumes implicit 'px' suffix for unitless numbers
        } else {
          valueChunk = stringToChunk('' + styleValue);
        }
      } else {
        valueChunk = stringToChunk(escapeTextForBrowser(('' + styleValue).trim()));
      }
    }
    if (isFirst) {
      isFirst = false;
      // If it's first, we don't need any separators prefixed.
      target.push(styleAttributeStart, nameChunk, styleAssign, valueChunk);
    } else {
      target.push(styleSeparator, nameChunk, styleAssign, valueChunk);
    }
  }
  if (!isFirst) {
    target.push(attributeEnd);
  }
}
var attributeSeparator = stringToPrecomputedChunk(' ');
var attributeAssign = stringToPrecomputedChunk('="');
var attributeEnd = stringToPrecomputedChunk('"');
var attributeEmptyString = stringToPrecomputedChunk('=""');
function pushBooleanAttribute(target, name, value // not null or undefined
) {
  if (value && typeof value !== 'function' && typeof value !== 'symbol') {
    target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
  }
}
function pushStringAttribute(target, name, value // not null or undefined
) {
  if (typeof value !== 'function' && typeof value !== 'symbol' && typeof value !== 'boolean') {
    target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
  }
}
function makeFormFieldPrefix(resumableState) {
  // TODO: Make this deterministic.
  var id = resumableState.nextFormID++;
  return resumableState.idPrefix + id;
}

// Since this will likely be repeated a lot in the HTML, we use a more concise message
// than on the client and hopefully it's googleable.
var actionJavaScriptURL = stringToPrecomputedChunk(escapeTextForBrowser(
// eslint-disable-next-line no-script-url
"javascript:throw new Error('React form unexpectedly submitted.')"));
var startHiddenInputChunk = stringToPrecomputedChunk('<input type="hidden"');
function pushAdditionalFormField(value, key) {
  var target = this;
  target.push(startHiddenInputChunk);
  validateAdditionalFormField(value);
  pushStringAttribute(target, 'name', key);
  pushStringAttribute(target, 'value', value);
  target.push(endOfStartTagSelfClosing);
}
function pushAdditionalFormFields(target, formData) {
  if (formData != null) {
    // $FlowFixMe[prop-missing]: FormData has forEach.
    formData.forEach(pushAdditionalFormField, target);
  }
}
function validateAdditionalFormField(value, key) {
  if (typeof value !== 'string') {
    throw new Error('File/Blob fields are not yet supported in progressive forms. ' + 'Will fallback to client hydration.');
  }
}
function validateAdditionalFormFields(formData) {
  if (formData != null) {
    // $FlowFixMe[prop-missing]: FormData has forEach.
    formData.forEach(validateAdditionalFormField);
  }
  return formData;
}
function getCustomFormFields(resumableState, formAction) {
  var customAction = formAction.$$FORM_ACTION;
  if (typeof customAction === 'function') {
    var prefix = makeFormFieldPrefix(resumableState);
    try {
      var customFields = formAction.$$FORM_ACTION(prefix);
      if (customFields) {
        validateAdditionalFormFields(customFields.data);
      }
      return customFields;
    } catch (x) {
      if (typeof x === 'object' && x !== null && typeof x.then === 'function') {
        // Rethrow suspense.
        throw x;
      }
    }
  }
  return null;
}
function pushFormActionAttribute(target, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name) {
  var formData = null;
  if (typeof formAction === 'function') {
    var customFields = getCustomFormFields(resumableState, formAction);
    if (customFields !== null) {
      // This action has a custom progressive enhancement form that can submit the form
      // back to the server if it's invoked before hydration. Such as a Server Action.
      name = customFields.name;
      formAction = customFields.action || '';
      formEncType = customFields.encType;
      formMethod = customFields.method;
      formTarget = customFields.target;
      formData = customFields.data;
    } else {
      // Set a javascript URL that doesn't do anything. We don't expect this to be invoked
      // because we'll preventDefault in the Fizz runtime, but it can happen if a form is
      // manually submitted or if someone calls stopPropagation before React gets the event.
      // If CSP is used to block javascript: URLs that's fine too. It just won't show this
      // error message but the URL will be logged.
      target.push(attributeSeparator, stringToChunk('formAction'), attributeAssign, actionJavaScriptURL, attributeEnd);
      name = null;
      formAction = null;
      formEncType = null;
      formMethod = null;
      formTarget = null;
      injectFormReplayingRuntime(resumableState, renderState);
    }
  }
  if (name != null) {
    pushAttribute(target, 'name', name);
  }
  if (formAction != null) {
    pushAttribute(target, 'formAction', formAction);
  }
  if (formEncType != null) {
    pushAttribute(target, 'formEncType', formEncType);
  }
  if (formMethod != null) {
    pushAttribute(target, 'formMethod', formMethod);
  }
  if (formTarget != null) {
    pushAttribute(target, 'formTarget', formTarget);
  }
  return formData;
}
var blobCache = null;
function pushSrcObjectAttribute(target, blob) {
  // Throwing a Promise style suspense read of the Blob content.
  if (blobCache === null) {
    blobCache = new WeakMap();
  }
  var suspenseCache = blobCache;
  var thenable = suspenseCache.get(blob);
  if (thenable === undefined) {
    thenable = readAsDataURL(blob);
    thenable.then(function (result) {
      thenable.status = 'fulfilled';
      thenable.value = result;
    }, function (error) {
      thenable.status = 'rejected';
      thenable.reason = error;
    });
    suspenseCache.set(blob, thenable);
  }
  if (thenable.status === 'rejected') {
    throw thenable.reason;
  } else if (thenable.status !== 'fulfilled') {
    throw thenable;
  }
  var url = thenable.value;
  target.push(attributeSeparator, stringToChunk('src'), attributeAssign, stringToChunk(escapeTextForBrowser(url)), attributeEnd);
}
function pushAttribute(target, name, value // not null or undefined
) {
  switch (name) {
    // These are very common props and therefore are in the beginning of the switch.
    // TODO: aria-label is a very common prop but allows booleans so is not like the others
    // but should ideally go in this list too.
    case 'className':
      {
        pushStringAttribute(target, 'class', value);
        break;
      }
    case 'tabIndex':
      {
        pushStringAttribute(target, 'tabindex', value);
        break;
      }
    case 'dir':
    case 'role':
    case 'viewBox':
    case 'width':
    case 'height':
      {
        pushStringAttribute(target, name, value);
        break;
      }
    case 'style':
      {
        pushStyleAttribute(target, value);
        return;
      }
    case 'src':
      {
        if (typeof value === 'object' && value !== null) {
          if (typeof Blob === 'function' && value instanceof Blob) {
            pushSrcObjectAttribute(target, value);
            return;
          }
        }
        // Fallthrough to general urls
      }
    case 'href':
      {
        if (value === '') {
          return;
        }
      }
    // Fall through to the last case which shouldn't remove empty strings.
    case 'action':
    case 'formAction':
      {
        // TODO: Consider only special casing these for each tag.
        if (value == null || typeof value === 'function' || typeof value === 'symbol' || typeof value === 'boolean') {
          return;
        }
        var sanitizedValue = sanitizeURL('' + value);
        target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(sanitizedValue)), attributeEnd);
        return;
      }
    case 'defaultValue':
    case 'defaultChecked': // These shouldn't be set as attributes on generic HTML elements.
    case 'innerHTML': // Must use dangerouslySetInnerHTML instead.
    case 'suppressContentEditableWarning':
    case 'suppressHydrationWarning':
    case 'ref':
      // Ignored. These are built-in to React on the client.
      return;
    case 'autoFocus':
    case 'multiple':
    case 'muted':
      {
        pushBooleanAttribute(target, name.toLowerCase(), value);
        return;
      }
    case 'xlinkHref':
      {
        if (typeof value === 'function' || typeof value === 'symbol' || typeof value === 'boolean') {
          return;
        }
        var _sanitizedValue = sanitizeURL('' + value);
        target.push(attributeSeparator, stringToChunk('xlink:href'), attributeAssign, stringToChunk(escapeTextForBrowser(_sanitizedValue)), attributeEnd);
        return;
      }
    case 'contentEditable':
    case 'spellCheck':
    case 'draggable':
    case 'value':
    case 'autoReverse':
    case 'externalResourcesRequired':
    case 'focusable':
    case 'preserveAlpha':
      {
        // Booleanish String
        // These are "enumerated" attributes that accept "true" and "false".
        // In React, we let users pass `true` and `false` even though technically
        // these aren't boolean attributes (they are coerced to strings).
        if (typeof value !== 'function' && typeof value !== 'symbol') {
          target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }
        return;
      }
    case 'inert':
    // Fallthrough for boolean props that don't have a warning for empty strings.
    case 'allowFullScreen':
    case 'async':
    case 'autoPlay':
    case 'controls':
    case 'credentialless':
    case 'default':
    case 'defer':
    case 'disabled':
    case 'disablePictureInPicture':
    case 'disableRemotePlayback':
    case 'formNoValidate':
    case 'hidden':
    case 'loop':
    case 'noModule':
    case 'noValidate':
    case 'open':
    case 'playsInline':
    case 'readOnly':
    case 'required':
    case 'reversed':
    case 'scoped':
    case 'seamless':
    case 'itemScope':
      {
        // Boolean
        if (value && typeof value !== 'function' && typeof value !== 'symbol') {
          target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
        }
        return;
      }
    case 'capture':
    case 'download':
      {
        // Overloaded Boolean
        if (value === true) {
          target.push(attributeSeparator, stringToChunk(name), attributeEmptyString);
        } else if (value === false) ; else if (typeof value !== 'function' && typeof value !== 'symbol') {
          target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }
        return;
      }
    case 'cols':
    case 'rows':
    case 'size':
    case 'span':
      {
        // These are HTML attributes that must be positive numbers.
        if (typeof value !== 'function' && typeof value !== 'symbol' && !isNaN(value) && value >= 1) {
          target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }
        return;
      }
    case 'rowSpan':
    case 'start':
      {
        // These are HTML attributes that must be numbers.
        if (typeof value !== 'function' && typeof value !== 'symbol' && !isNaN(value)) {
          target.push(attributeSeparator, stringToChunk(name), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
        }
        return;
      }
    case 'xlinkActuate':
      pushStringAttribute(target, 'xlink:actuate', value);
      return;
    case 'xlinkArcrole':
      pushStringAttribute(target, 'xlink:arcrole', value);
      return;
    case 'xlinkRole':
      pushStringAttribute(target, 'xlink:role', value);
      return;
    case 'xlinkShow':
      pushStringAttribute(target, 'xlink:show', value);
      return;
    case 'xlinkTitle':
      pushStringAttribute(target, 'xlink:title', value);
      return;
    case 'xlinkType':
      pushStringAttribute(target, 'xlink:type', value);
      return;
    case 'xmlBase':
      pushStringAttribute(target, 'xml:base', value);
      return;
    case 'xmlLang':
      pushStringAttribute(target, 'xml:lang', value);
      return;
    case 'xmlSpace':
      pushStringAttribute(target, 'xml:space', value);
      return;
    default:
      if (
      // shouldIgnoreAttribute
      // We have already filtered out null/undefined and reserved words.
      name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
        return;
      }
      var attributeName = getAttributeAlias(name);
      if (isAttributeNameSafe(attributeName)) {
        // shouldRemoveAttribute
        switch (typeof value) {
          case 'function':
          case 'symbol':
            return;
          case 'boolean':
            {
              var prefix = attributeName.toLowerCase().slice(0, 5);
              if (prefix !== 'data-' && prefix !== 'aria-') {
                return;
              }
            }
        }
        target.push(attributeSeparator, stringToChunk(attributeName), attributeAssign, stringToChunk(escapeTextForBrowser(value)), attributeEnd);
      }
  }
}
var endOfStartTag = stringToPrecomputedChunk('>');
var endOfStartTagSelfClosing = stringToPrecomputedChunk('/>');
function pushInnerHTML(target, innerHTML, children) {
  if (innerHTML != null) {
    if (children != null) {
      throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
    }
    if (typeof innerHTML !== 'object' || !('__html' in innerHTML)) {
      throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://react.dev/link/dangerously-set-inner-html ' + 'for more information.');
    }
    var html = innerHTML.__html;
    if (html !== null && html !== undefined) {
      target.push(stringToChunk('' + html));
    }
  }
}
function pushStartAnchor(target, props, formatContext) {
  target.push(startChunkForTag('a'));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        case 'href':
          if (propValue === '') {
            // Empty `href` is special on anchors so we're short-circuiting here.
            // On other tags it should trigger a warning
            pushStringAttribute(target, 'href', '');
          } else {
            pushAttribute(target, propKey, propValue);
          }
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  if (typeof children === 'string') {
    // Special case children as a string to avoid the unnecessary comment.
    // TODO: Remove this special case after the general optimization is in place.
    target.push(stringToChunk(encodeHTMLTextNode(children)));
    return null;
  }
  return children;
}
function pushStartObject(target, props, formatContext) {
  target.push(startChunkForTag('object'));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        case 'data':
          {
            var sanitizedValue = sanitizeURL('' + propValue);
            if (sanitizedValue === '') {
              break;
            }
            target.push(attributeSeparator, stringToChunk('data'), attributeAssign, stringToChunk(escapeTextForBrowser(sanitizedValue)), attributeEnd);
            break;
          }
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  if (typeof children === 'string') {
    // Special case children as a string to avoid the unnecessary comment.
    // TODO: Remove this special case after the general optimization is in place.
    target.push(stringToChunk(encodeHTMLTextNode(children)));
    return null;
  }
  return children;
}
function pushStartSelect(target, props, formatContext) {
  target.push(startChunkForTag('select'));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          // TODO: This doesn't really make sense for select since it can't use the controlled
          // value in the innerHTML.
          innerHTML = propValue;
          break;
        case 'defaultValue':
        case 'value':
          // These are set on the Context instead and applied to the nested options.
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}
function flattenOptionChildren(children) {
  var content = '';
  // Flatten children and warn if they aren't strings or numbers;
  // invalid types are ignored.
  React.Children.forEach(children, function (child) {
    if (child == null) {
      return;
    }
    content += child;
  });
  return content;
}
var selectedMarkerAttribute = stringToPrecomputedChunk(' selected=""');
function pushStartOption(target, props, formatContext) {
  var selectedValue = formatContext.selectedValue;
  target.push(startChunkForTag('option'));
  var children = null;
  var value = null;
  var selected = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'selected':
          // ignore
          selected = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        case 'value':
          value = propValue;
        // We intentionally fallthrough to also set the attribute on the node.
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  if (selectedValue != null) {
    var stringValue;
    if (value !== null) {
      stringValue = '' + value;
    } else {
      stringValue = flattenOptionChildren(children);
    }
    if (isArray(selectedValue)) {
      // multiple
      for (var i = 0; i < selectedValue.length; i++) {
        var v = '' + selectedValue[i];
        if (v === stringValue) {
          target.push(selectedMarkerAttribute);
          break;
        }
      }
    } else {
      if ('' + selectedValue === stringValue) {
        target.push(selectedMarkerAttribute);
      }
    }
  } else if (selected) {
    target.push(selectedMarkerAttribute);
  }

  // Options never participate as ViewTransitions.
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}
var formReplayingRuntimeScript = stringToPrecomputedChunk(formReplaying);
function injectFormReplayingRuntime(resumableState, renderState) {
  // If we haven't sent it yet, inject the runtime that tracks submitted JS actions
  // for later replaying by Fiber. If we use an external runtime, we don't need
  // to emit anything. It's always used.
  if ((resumableState.instructions & SentFormReplayingRuntime) === NothingSent && (!renderState.externalRuntimeScript)) {
    resumableState.instructions |= SentFormReplayingRuntime;
    var preamble = renderState.preamble;
    var bootstrapChunks = renderState.bootstrapChunks;
    if ((preamble.htmlChunks || preamble.headChunks) && bootstrapChunks.length === 0) {
      // If we rendered the whole document, then we emitted a rel="expect" that needs a
      // matching target. If we haven't emitted that yet, we need to include it in this
      // script tag.
      bootstrapChunks.push(renderState.startInlineScript);
      pushCompletedShellIdAttribute(bootstrapChunks, resumableState);
      bootstrapChunks.push(endOfStartTag, formReplayingRuntimeScript, endInlineScript);
    } else {
      // Otherwise we added to the beginning of the scripts. This will mean that it
      // appears before the shell ID unfortunately.
      bootstrapChunks.unshift(renderState.startInlineScript, endOfStartTag, formReplayingRuntimeScript, endInlineScript);
    }
  }
}
var formStateMarkerIsMatching = stringToPrecomputedChunk('<!--F!-->');
var formStateMarkerIsNotMatching = stringToPrecomputedChunk('<!--F-->');
function pushFormStateMarkerIsMatching(target) {
  target.push(formStateMarkerIsMatching);
}
function pushFormStateMarkerIsNotMatching(target) {
  target.push(formStateMarkerIsNotMatching);
}
function pushStartForm(target, props, resumableState, renderState, formatContext) {
  target.push(startChunkForTag('form'));
  var children = null;
  var innerHTML = null;
  var formAction = null;
  var formEncType = null;
  var formMethod = null;
  var formTarget = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        case 'action':
          formAction = propValue;
          break;
        case 'encType':
          formEncType = propValue;
          break;
        case 'method':
          formMethod = propValue;
          break;
        case 'target':
          formTarget = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  var formData = null;
  var formActionName = null;
  if (typeof formAction === 'function') {
    var customFields = getCustomFormFields(resumableState, formAction);
    if (customFields !== null) {
      // This action has a custom progressive enhancement form that can submit the form
      // back to the server if it's invoked before hydration. Such as a Server Action.
      formAction = customFields.action || '';
      formEncType = customFields.encType;
      formMethod = customFields.method;
      formTarget = customFields.target;
      formData = customFields.data;
      formActionName = customFields.name;
    } else {
      // Set a javascript URL that doesn't do anything. We don't expect this to be invoked
      // because we'll preventDefault in the Fizz runtime, but it can happen if a form is
      // manually submitted or if someone calls stopPropagation before React gets the event.
      // If CSP is used to block javascript: URLs that's fine too. It just won't show this
      // error message but the URL will be logged.
      target.push(attributeSeparator, stringToChunk('action'), attributeAssign, actionJavaScriptURL, attributeEnd);
      formAction = null;
      formEncType = null;
      formMethod = null;
      formTarget = null;
      injectFormReplayingRuntime(resumableState, renderState);
    }
  }
  if (formAction != null) {
    pushAttribute(target, 'action', formAction);
  }
  if (formEncType != null) {
    pushAttribute(target, 'encType', formEncType);
  }
  if (formMethod != null) {
    pushAttribute(target, 'method', formMethod);
  }
  if (formTarget != null) {
    pushAttribute(target, 'target', formTarget);
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  if (formActionName !== null) {
    target.push(startHiddenInputChunk);
    pushStringAttribute(target, 'name', formActionName);
    target.push(endOfStartTagSelfClosing);
    pushAdditionalFormFields(target, formData);
  }
  pushInnerHTML(target, innerHTML, children);
  if (typeof children === 'string') {
    // Special case children as a string to avoid the unnecessary comment.
    // TODO: Remove this special case after the general optimization is in place.
    target.push(stringToChunk(encodeHTMLTextNode(children)));
    return null;
  }
  return children;
}
function pushInput(target, props, resumableState, renderState, formatContext) {
  target.push(startChunkForTag('input'));
  var name = null;
  var formAction = null;
  var formEncType = null;
  var formMethod = null;
  var formTarget = null;
  var value = null;
  var defaultValue = null;
  var checked = null;
  var defaultChecked = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('input' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        case 'name':
          name = propValue;
          break;
        case 'formAction':
          formAction = propValue;
          break;
        case 'formEncType':
          formEncType = propValue;
          break;
        case 'formMethod':
          formMethod = propValue;
          break;
        case 'formTarget':
          formTarget = propValue;
          break;
        case 'defaultChecked':
          defaultChecked = propValue;
          break;
        case 'defaultValue':
          defaultValue = propValue;
          break;
        case 'checked':
          checked = propValue;
          break;
        case 'value':
          value = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  var formData = pushFormActionAttribute(target, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name);
  if (checked !== null) {
    pushBooleanAttribute(target, 'checked', checked);
  } else if (defaultChecked !== null) {
    pushBooleanAttribute(target, 'checked', defaultChecked);
  }
  if (value !== null) {
    pushAttribute(target, 'value', value);
  } else if (defaultValue !== null) {
    pushAttribute(target, 'value', defaultValue);
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTagSelfClosing);

  // We place any additional hidden form fields after the input.
  pushAdditionalFormFields(target, formData);
  return null;
}
function pushStartButton(target, props, resumableState, renderState, formatContext) {
  target.push(startChunkForTag('button'));
  var children = null;
  var innerHTML = null;
  var name = null;
  var formAction = null;
  var formEncType = null;
  var formMethod = null;
  var formTarget = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        case 'name':
          name = propValue;
          break;
        case 'formAction':
          formAction = propValue;
          break;
        case 'formEncType':
          formEncType = propValue;
          break;
        case 'formMethod':
          formMethod = propValue;
          break;
        case 'formTarget':
          formTarget = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  var formData = pushFormActionAttribute(target, resumableState, renderState, formAction, formEncType, formMethod, formTarget, name);
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);

  // We place any additional hidden form fields we need to include inside the button itself.
  pushAdditionalFormFields(target, formData);
  pushInnerHTML(target, innerHTML, children);
  if (typeof children === 'string') {
    // Special case children as a string to avoid the unnecessary comment.
    // TODO: Remove this special case after the general optimization is in place.
    target.push(stringToChunk(encodeHTMLTextNode(children)));
    return null;
  }
  return children;
}
function pushStartTextArea(target, props, formatContext) {
  target.push(startChunkForTag('textarea'));
  var value = null;
  var defaultValue = null;
  var children = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'value':
          value = propValue;
          break;
        case 'defaultValue':
          defaultValue = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          throw new Error('`dangerouslySetInnerHTML` does not make sense on <textarea>.');
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  if (value === null && defaultValue !== null) {
    value = defaultValue;
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);

  // TODO (yungsters): Remove support for children content in <textarea>.
  if (children != null) {
    if (value != null) {
      throw new Error('If you supply `defaultValue` on a <textarea>, do not pass children.');
    }
    if (isArray(children)) {
      if (children.length > 1) {
        throw new Error('<textarea> can only have at most one child.');
      }
      value = '' + children[0];
    }
    value = '' + children;
  }
  if (typeof value === 'string' && value[0] === '\n') {
    // text/html ignores the first character in these tags if it's a newline
    // Prefer to break application/xml over text/html (for now) by adding
    // a newline specifically to get eaten by the parser. (Alternately for
    // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
    // \r is normalized out by HTMLTextAreaElement#value.)
    // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
    // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
    // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
    // See: Parsing of "textarea" "listing" and "pre" elements
    //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
    target.push(leadingNewline);
  }

  // ToString and push directly instead of recurse over children.
  // We don't really support complex children in the value anyway.
  // This also currently avoids a trailing comment node which breaks textarea.
  if (value !== null) {
    target.push(stringToChunk(encodeHTMLTextNode('' + value)));
  }
  return null;
}
function pushMeta(target, props, renderState, textEmbedded, formatContext) {
  var noscriptTagInScope = formatContext.tagScope & NOSCRIPT_SCOPE;
  var isFallback = formatContext.tagScope & FALLBACK_SCOPE;
  if (formatContext.insertionMode === SVG_MODE || noscriptTagInScope || props.itemProp != null) {
    return pushSelfClosing(target, props, 'meta', formatContext);
  } else {
    if (textEmbedded) {
      // This link follows text but we aren't writing a tag. while not as efficient as possible we need
      // to be safe and assume text will follow by inserting a textSeparator
      target.push(textSeparator);
    }
    if (isFallback) {
      // Hoistable Elements for fallbacks are simply omitted. we don't want to emit them early
      // because they are likely superceded by primary content and we want to avoid needing to clean
      // them up when the primary content is ready. They are never hydrated on the client anyway because
      // boundaries in fallback are awaited or client render, in either case there is never hydration
      return null;
    } else if (typeof props.charSet === 'string') {
      // "charset" Should really be config and not picked up from tags however since this is
      // the only way to embed the tag today we flush it on a special queue on the Request so it
      // can go before everything else. Like viewport this means that the tag will escape it's
      // parent container.
      return pushSelfClosing(renderState.charsetChunks, props, 'meta', formatContext);
    } else if (props.name === 'viewport') {
      // "viewport" is flushed on the Request so it can go earlier that Float resources that
      // might be affected by it. This means it can escape the boundary it is rendered within.
      // This is a pragmatic solution to viewport being incredibly sensitive to document order
      // without requiring all hoistables to be flushed too early.
      return pushSelfClosing(renderState.viewportChunks, props, 'meta', formatContext);
    } else {
      return pushSelfClosing(renderState.hoistableChunks, props, 'meta', formatContext);
    }
  }
}
function pushLink(target, props, resumableState, renderState, hoistableState, textEmbedded, formatContext) {
  var noscriptTagInScope = formatContext.tagScope & NOSCRIPT_SCOPE;
  var isFallback = formatContext.tagScope & FALLBACK_SCOPE;
  var rel = props.rel;
  var href = props.href;
  var precedence = props.precedence;
  if (formatContext.insertionMode === SVG_MODE || noscriptTagInScope || props.itemProp != null || typeof rel !== 'string' || typeof href !== 'string' || href === '') {
    pushLinkImpl(target, props);
    return null;
  }
  if (props.rel === 'stylesheet') {
    // This <link> may hoistable as a Stylesheet Resource, otherwise it will emit in place
    var key = getResourceKey(href);
    if (typeof precedence !== 'string' || props.disabled != null || props.onLoad || props.onError) {
      return pushLinkImpl(target, props);
    } else {
      // This stylesheet refers to a Resource and we create a new one if necessary
      var styleQueue = renderState.styles.get(precedence);
      var hasKey = resumableState.styleResources.hasOwnProperty(key);
      var resourceState = hasKey ? resumableState.styleResources[key] : undefined;
      if (resourceState !== EXISTS) {
        // We are going to create this resource now so it is marked as Exists
        resumableState.styleResources[key] = EXISTS;

        // If this is the first time we've encountered this precedence we need
        // to create a StyleQueue
        if (!styleQueue) {
          styleQueue = {
            precedence: stringToChunk(escapeTextForBrowser(precedence)),
            rules: [],
            hrefs: [],
            sheets: new Map()
          };
          renderState.styles.set(precedence, styleQueue);
        }
        var resource = {
          state: PENDING$1,
          props: stylesheetPropsFromRawProps(props)
        };
        if (resourceState) {
          // When resourceState is truty it is a Preload state. We cast it for clarity
          var preloadState = resourceState;
          if (preloadState.length === 2) {
            adoptPreloadCredentials(resource.props, preloadState);
          }
          var preloadResource = renderState.preloads.stylesheets.get(key);
          if (preloadResource && preloadResource.length > 0) {
            // The Preload for this resource was created in this render pass and has not flushed yet so
            // we need to clear it to avoid it flushing.
            preloadResource.length = 0;
          } else {
            // Either the preload resource from this render already flushed in this render pass
            // or the preload flushed in a prior pass (prerender). In either case we need to mark
            // this resource as already having been preloaded.
            resource.state = PRELOADED;
          }
        }

        // We add the newly created resource to our StyleQueue and if necessary
        // track the resource with the currently rendering boundary
        styleQueue.sheets.set(key, resource);
        if (hoistableState) {
          hoistableState.stylesheets.add(resource);
        }
      } else {
        // We need to track whether this boundary should wait on this resource or not.
        // Typically this resource should always exist since we either had it or just created
        // it. However, it's possible when you resume that the style has already been emitted
        // and then it wouldn't be recreated in the RenderState and there's no need to track
        // it again since we should've hoisted it to the shell already.
        if (styleQueue) {
          var _resource = styleQueue.sheets.get(key);
          if (_resource) {
            if (hoistableState) {
              hoistableState.stylesheets.add(_resource);
            }
          }
        }
      }
      if (textEmbedded) {
        // This link follows text but we aren't writing a tag. while not as efficient as possible we need
        // to be safe and assume text will follow by inserting a textSeparator
        target.push(textSeparator);
      }
      return null;
    }
  } else if (props.onLoad || props.onError) {
    // When using load handlers we cannot hoist and need to emit links in place
    return pushLinkImpl(target, props);
  } else {
    // We can hoist this link so we may need to emit a text separator.
    // @TODO refactor text separators so we don't have to defensively add
    // them when we don't end up emitting a tag as a result of pushStartInstance
    if (textEmbedded) {
      // This link follows text but we aren't writing a tag. while not as efficient as possible we need
      // to be safe and assume text will follow by inserting a textSeparator
      target.push(textSeparator);
    }
    if (isFallback) {
      // Hoistable Elements for fallbacks are simply omitted. we don't want to emit them early
      // because they are likely superceded by primary content and we want to avoid needing to clean
      // them up when the primary content is ready. They are never hydrated on the client anyway because
      // boundaries in fallback are awaited or client render, in either case there is never hydration
      return null;
    } else {
      return pushLinkImpl(renderState.hoistableChunks, props);
    }
  }
}
function pushLinkImpl(target, props) {
  target.push(startChunkForTag('link'));
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('link' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }

  // Link never participate as a ViewTransition

  target.push(endOfStartTagSelfClosing);
  return null;
}
function pushStyle(target, props, resumableState, renderState, hoistableState, textEmbedded, formatContext) {
  var noscriptTagInScope = formatContext.tagScope & NOSCRIPT_SCOPE;
  var precedence = props.precedence;
  var href = props.href;
  var nonce = props.nonce;
  if (formatContext.insertionMode === SVG_MODE || noscriptTagInScope || props.itemProp != null || typeof precedence !== 'string' || typeof href !== 'string' || href === '') {
    // This style tag is not able to be turned into a Style Resource
    return pushStyleImpl(target, props);
  }
  var key = getResourceKey(href);
  var styleQueue = renderState.styles.get(precedence);
  var hasKey = resumableState.styleResources.hasOwnProperty(key);
  var resourceState = hasKey ? resumableState.styleResources[key] : undefined;
  if (resourceState !== EXISTS) {
    // We are going to create this resource now so it is marked as Exists
    resumableState.styleResources[key] = EXISTS;
    if (!styleQueue) {
      // This is the first time we've encountered this precedence we need
      // to create a StyleQueue.
      styleQueue = {
        precedence: stringToChunk(escapeTextForBrowser(precedence)),
        rules: [],
        hrefs: [],
        sheets: new Map()
      };
      renderState.styles.set(precedence, styleQueue);
    }
    var nonceStyle = renderState.nonce.style;
    if (!nonceStyle || nonceStyle === nonce) {
      styleQueue.hrefs.push(stringToChunk(escapeTextForBrowser(href)));
      pushStyleContents(styleQueue.rules, props);
    }
  }
  if (styleQueue) {
    // We need to track whether this boundary should wait on this resource or not.
    // Typically this resource should always exist since we either had it or just created
    // it. However, it's possible when you resume that the style has already been emitted
    // and then it wouldn't be recreated in the RenderState and there's no need to track
    // it again since we should've hoisted it to the shell already.
    if (hoistableState) {
      hoistableState.styles.add(styleQueue);
    }
  }
  if (textEmbedded) {
    // This link follows text but we aren't writing a tag. while not as efficient as possible we need
    // to be safe and assume text will follow by inserting a textSeparator
    target.push(textSeparator);
  }
}

/**
 * This escaping function is designed to work with style tag textContent only.
 *
 * While untrusted style content should be made safe before using this api it will
 * ensure that the style cannot be early terminated or never terminated state
 */
function escapeStyleTextContent(styleText) {
  return ('' + styleText).replace(styleRegex, styleReplacer);
}
var styleRegex = /(<\/|<)(s)(tyle)/gi;
var styleReplacer = function (match, prefix, s, suffix) {
  return "" + prefix + (s === 's' ? '\\73 ' : '\\53 ') + suffix;
};
function pushStyleImpl(target, props) {
  target.push(startChunkForTag('style'));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }

  // Style never participate as a ViewTransition.
  target.push(endOfStartTag);
  var child = Array.isArray(children) ? children.length < 2 ? children[0] : null : children;
  if (typeof child !== 'function' && typeof child !== 'symbol' && child !== null && child !== undefined) {
    target.push(stringToChunk(escapeStyleTextContent(child)));
  }
  pushInnerHTML(target, innerHTML, children);
  target.push(endChunkForTag('style'));
  return null;
}
function pushStyleContents(target, props) {
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
      }
    }
  }
  var child = Array.isArray(children) ? children.length < 2 ? children[0] : null : children;
  if (typeof child !== 'function' && typeof child !== 'symbol' && child !== null && child !== undefined) {
    target.push(stringToChunk(escapeStyleTextContent(child)));
  }
  pushInnerHTML(target, innerHTML, children);
  return;
}
function pushImg(target, props, resumableState, renderState, hoistableState, formatContext) {
  var pictureOrNoScriptTagInScope = formatContext.tagScope & (PICTURE_SCOPE | NOSCRIPT_SCOPE);
  var src = props.src,
    srcSet = props.srcSet;
  if (props.loading !== 'lazy' && (src || srcSet) && (typeof src === 'string' || src == null) && (typeof srcSet === 'string' || srcSet == null) && props.fetchPriority !== 'low' && !pictureOrNoScriptTagInScope &&
  // We exclude data URIs in src and srcSet since these should not be preloaded
  !(typeof src === 'string' && src[4] === ':' && (src[0] === 'd' || src[0] === 'D') && (src[1] === 'a' || src[1] === 'A') && (src[2] === 't' || src[2] === 'T') && (src[3] === 'a' || src[3] === 'A')) && !(typeof srcSet === 'string' && srcSet[4] === ':' && (srcSet[0] === 'd' || srcSet[0] === 'D') && (srcSet[1] === 'a' || srcSet[1] === 'A') && (srcSet[2] === 't' || srcSet[2] === 'T') && (srcSet[3] === 'a' || srcSet[3] === 'A'))) {
    // We have a suspensey image and ought to preload it to optimize the loading of display blocking
    // resumableState.

    if (hoistableState !== null) {
      // Mark this boundary's state as having suspensey images.
      // Only do that if we have a ViewTransition that might trigger a parent Suspense boundary
      // to animate its appearing. Since that's the only case we'd actually apply suspensey images
      // for SSR reveals.
      var isInSuspenseWithEnterViewTransition = formatContext.tagScope & APPEARING_SCOPE;
      if (isInSuspenseWithEnterViewTransition) {
        hoistableState.suspenseyImages = true;
      }
    }
    var sizes = typeof props.sizes === 'string' ? props.sizes : undefined;
    var key = getImageResourceKey(src, srcSet, sizes);
    var promotablePreloads = renderState.preloads.images;
    var resource = promotablePreloads.get(key);
    if (resource) {
      // We consider whether this preload can be promoted to higher priority flushing queue.
      // The only time a resource will exist here is if it was created during this render
      // and was not already in the high priority queue.
      if (props.fetchPriority === 'high' || renderState.highImagePreloads.size < 10) {
        // Delete the resource from the map since we are promoting it and don't want to
        // reenter this branch in a second pass for duplicate img hrefs.
        promotablePreloads.delete(key);

        // $FlowFixMe - Flow should understand that this is a Resource if the condition was true
        renderState.highImagePreloads.add(resource);
      }
    } else if (!resumableState.imageResources.hasOwnProperty(key)) {
      // We must construct a new preload resource
      resumableState.imageResources[key] = PRELOAD_NO_CREDS;
      var crossOrigin = getCrossOriginString(props.crossOrigin);
      var headers = renderState.headers;
      var header;
      if (headers && headers.remainingCapacity > 0 &&
      // browsers today don't support preloading responsive images from link headers so we bail out
      // if the img has srcset defined
      typeof props.srcSet !== 'string' && (
      // this is a hueristic similar to capping element preloads to 10 unless explicitly
      // fetchPriority="high". We use length here which means it will fit fewer images when
      // the urls are long and more when short. arguably byte size is a better hueristic because
      // it directly translates to how much we send down before content is actually seen.
      // We could unify the counts and also make it so the total is tracked regardless of
      // flushing output but since the headers are likely to be go earlier than content
      // they don't really conflict so for now I've kept them separate
      props.fetchPriority === 'high' || headers.highImagePreloads.length < 500) && (
      // We manually construct the options for the preload only from strings. We don't want to pollute
      // the params list with arbitrary props and if we copied everything over as it we might get
      // coercion errors. We have checks for this in Dev but it seems safer to just only accept values
      // that are strings
      header = getPreloadAsHeader(src, 'image', {
        imageSrcSet: props.srcSet,
        imageSizes: props.sizes,
        crossOrigin: crossOrigin,
        integrity: props.integrity,
        nonce: props.nonce,
        type: props.type,
        fetchPriority: props.fetchPriority,
        referrerPolicy: props.refererPolicy
      }),
      // We always consume the header length since once we find one header that doesn't fit
      // we assume all the rest won't as well. This is to avoid getting into a situation
      // where we have a very small remaining capacity but no headers will ever fit and we end
      // up constantly trying to see if the next resource might make it. In the future we can
      // make this behavior different between render and prerender since in the latter case
      // we are less sensitive to the current requests runtime per and more sensitive to maximizing
      // headers.
      (headers.remainingCapacity -= header.length + 2) >= 0)) {
        // If we postpone in the shell we will still emit this preload so we track
        // it to make sure we don't reset it.
        renderState.resets.image[key] = PRELOAD_NO_CREDS;
        if (headers.highImagePreloads) {
          headers.highImagePreloads += ', ';
        }
        // $FlowFixMe[unsafe-addition]: we assign header during the if condition
        headers.highImagePreloads += header;
      } else {
        resource = [];
        pushLinkImpl(resource, {
          rel: 'preload',
          as: 'image',
          // There is a bug in Safari where imageSrcSet is not respected on preload links
          // so we omit the href here if we have imageSrcSet b/c safari will load the wrong image.
          // This harms older browers that do not support imageSrcSet by making their preloads not work
          // but this population is shrinking fast and is already small so we accept this tradeoff.
          href: srcSet ? undefined : src,
          imageSrcSet: srcSet,
          imageSizes: sizes,
          crossOrigin: crossOrigin,
          integrity: props.integrity,
          type: props.type,
          fetchPriority: props.fetchPriority,
          referrerPolicy: props.referrerPolicy
        });
        if (props.fetchPriority === 'high' || renderState.highImagePreloads.size < 10) {
          renderState.highImagePreloads.add(resource);
        } else {
          renderState.bulkPreloads.add(resource);
          // We can bump the priority up if the same img is rendered later
          // with fetchPriority="high"
          promotablePreloads.set(key, resource);
        }
      }
    }
  }
  return pushSelfClosing(target, props, 'img', formatContext);
}
function pushSelfClosing(target, props, tag, formatContext) {
  target.push(startChunkForTag(tag));
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error(tag + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTagSelfClosing);
  return null;
}
function pushStartMenuItem(target, props, formatContext) {
  target.push(startChunkForTag('menuitem'));
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('menuitems cannot have `children` nor `dangerouslySetInnerHTML`.');
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  return null;
}
function pushTitle(target, props, renderState, formatContext) {
  var noscriptTagInScope = formatContext.tagScope & NOSCRIPT_SCOPE;
  var isFallback = formatContext.tagScope & FALLBACK_SCOPE;
  if (formatContext.insertionMode !== SVG_MODE && !noscriptTagInScope && props.itemProp == null) {
    if (isFallback) {
      // Hoistable Elements for fallbacks are simply omitted. we don't want to emit them early
      // because they are likely superceded by primary content and we want to avoid needing to clean
      // them up when the primary content is ready. They are never hydrated on the client anyway because
      // boundaries in fallback are awaited or client render, in either case there is never hydration
      return null;
    } else {
      pushTitleImpl(renderState.hoistableChunks, props);
    }
  } else {
    return pushTitleImpl(target, props);
  }
}
function pushTitleImpl(target, props) {
  target.push(startChunkForTag('title'));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  // Title never participate as a ViewTransition
  target.push(endOfStartTag);
  var child = Array.isArray(children) ? children.length < 2 ? children[0] : null : children;
  if (typeof child !== 'function' && typeof child !== 'symbol' && child !== null && child !== undefined) {
    // eslint-disable-next-line react-internal/safe-string-coercion
    target.push(stringToChunk(escapeTextForBrowser('' + child)));
  }
  pushInnerHTML(target, innerHTML, children);
  target.push(endChunkForTag('title'));
  return null;
}

// These are used by the client if we clear a boundary and we find these, then we
// also clear the singleton as well.
var headPreambleContributionChunk = stringToPrecomputedChunk('<!--head-->');
var bodyPreambleContributionChunk = stringToPrecomputedChunk('<!--body-->');
var htmlPreambleContributionChunk = stringToPrecomputedChunk('<!--html-->');
function pushStartHead(target, props, renderState, preambleState, formatContext) {
  if (formatContext.insertionMode < HTML_MODE) {
    // This <head> is the Document.head and should be part of the preamble
    var preamble = preambleState || renderState.preamble;
    if (preamble.headChunks) {
      throw new Error("The " + '`<head>`' + " tag may only be rendered once.");
    }

    // Insert a marker in the body where the contribution to the head was in case we need to clear it.
    if (preambleState !== null) {
      target.push(headPreambleContributionChunk);
    }
    preamble.headChunks = [];
    return pushStartSingletonElement(preamble.headChunks, props, 'head', formatContext);
  } else {
    // This <head> is deep and is likely just an error. we emit it inline though.
    // Validation should warn that this tag is the the wrong spot.
    return pushStartGenericElement(target, props, 'head', formatContext);
  }
}
function pushStartBody(target, props, renderState, preambleState, formatContext) {
  if (formatContext.insertionMode < HTML_MODE) {
    // This <body> is the Document.body
    var preamble = preambleState || renderState.preamble;
    if (preamble.bodyChunks) {
      throw new Error("The " + '`<body>`' + " tag may only be rendered once.");
    }

    // Insert a marker in the body where the contribution to the body tag was in case we need to clear it.
    if (preambleState !== null) {
      target.push(bodyPreambleContributionChunk);
    }
    preamble.bodyChunks = [];
    return pushStartSingletonElement(preamble.bodyChunks, props, 'body', formatContext);
  } else {
    // This <head> is deep and is likely just an error. we emit it inline though.
    // Validation should warn that this tag is the the wrong spot.
    return pushStartGenericElement(target, props, 'body', formatContext);
  }
}
function pushStartHtml(target, props, renderState, preambleState, formatContext) {
  if (formatContext.insertionMode === ROOT_HTML_MODE) {
    // This <html> is the Document.documentElement
    var preamble = preambleState || renderState.preamble;
    if (preamble.htmlChunks) {
      throw new Error("The " + '`<html>`' + " tag may only be rendered once.");
    }

    // Insert a marker in the body where the contribution to the head was in case we need to clear it.
    if (preambleState !== null) {
      target.push(htmlPreambleContributionChunk);
    }
    preamble.htmlChunks = [doctypeChunk];
    return pushStartSingletonElement(preamble.htmlChunks, props, 'html', formatContext);
  } else {
    // This <html> is deep and is likely just an error. we emit it inline though.
    // Validation should warn that this tag is the the wrong spot.
    return pushStartGenericElement(target, props, 'html', formatContext);
  }
}
function pushScript(target, props, resumableState, renderState, textEmbedded, formatContext) {
  var noscriptTagInScope = formatContext.tagScope & NOSCRIPT_SCOPE;
  var asyncProp = props.async;
  if (typeof props.src !== 'string' || !props.src || !(asyncProp && typeof asyncProp !== 'function' && typeof asyncProp !== 'symbol') || props.onLoad || props.onError || formatContext.insertionMode === SVG_MODE || noscriptTagInScope || props.itemProp != null) {
    // This script will not be a resource, we bailout early and emit it in place.
    return pushScriptImpl(target, props);
  }
  var src = props.src;
  var key = getResourceKey(src);
  // We can make this <script> into a ScriptResource

  var resources, preloads;
  if (props.type === 'module') {
    resources = resumableState.moduleScriptResources;
    preloads = renderState.preloads.moduleScripts;
  } else {
    resources = resumableState.scriptResources;
    preloads = renderState.preloads.scripts;
  }
  var hasKey = resources.hasOwnProperty(key);
  var resourceState = hasKey ? resources[key] : undefined;
  if (resourceState !== EXISTS) {
    // We are going to create this resource now so it is marked as Exists
    resources[key] = EXISTS;
    var scriptProps = props;
    if (resourceState) {
      // When resourceState is truty it is a Preload state. We cast it for clarity
      var preloadState = resourceState;
      if (preloadState.length === 2) {
        scriptProps = assign({}, props);
        adoptPreloadCredentials(scriptProps, preloadState);
      }
      var preloadResource = preloads.get(key);
      if (preloadResource) {
        // the preload resource exists was created in this render. Now that we have
        // a script resource which will emit earlier than a preload would if it
        // hasn't already flushed we prevent it from flushing by zeroing the length
        preloadResource.length = 0;
      }
    }
    var resource = [];
    // Add to the script flushing queue
    renderState.scripts.add(resource);
    // encode the tag as Chunks
    pushScriptImpl(resource, scriptProps);
  }
  if (textEmbedded) {
    // This script follows text but we aren't writing a tag. while not as efficient as possible we need
    // to be safe and assume text will follow by inserting a textSeparator
    target.push(textSeparator);
  }
  return null;
}
function pushScriptImpl(target, props) {
  target.push(startChunkForTag('script'));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  // Scripts never participate as a ViewTransition
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  if (typeof children === 'string') {
    target.push(stringToChunk(escapeEntireInlineScriptContent(children)));
  }
  target.push(endChunkForTag('script'));
  return null;
}

// This is a fork of pushStartGenericElement because we don't ever want to do
// the children as strign optimization on that path when rendering singletons.
// When we eliminate that special path we can delete this fork and unify it again
function pushStartSingletonElement(target, props, tag, formatContext) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}
function pushStartGenericElement(target, props, tag, formatContext) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  if (typeof children === 'string') {
    // Special case children as a string to avoid the unnecessary comment.
    // TODO: Remove this special case after the general optimization is in place.
    target.push(stringToChunk(encodeHTMLTextNode(children)));
    return null;
  }
  return children;
}
function pushStartCustomElement(target, props, tag, formatContext) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      var attributeName = propKey;
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        case 'style':
          pushStyleAttribute(target, propValue);
          break;
        case 'suppressContentEditableWarning':
        case 'suppressHydrationWarning':
        case 'ref':
          // Ignored. These are built-in to React on the client.
          break;
        case 'className':
          // className gets rendered as class on the client, so it should be
          // rendered as class on the server.
          attributeName = 'class';
        // intentional fallthrough
        default:
          if (isAttributeNameSafe(propKey) && typeof propValue !== 'function' && typeof propValue !== 'symbol') {
            if (propValue === false) {
              continue;
            } else if (propValue === true) {
              propValue = '';
            } else if (typeof propValue === 'object') {
              continue;
            }
            target.push(attributeSeparator, stringToChunk(attributeName), attributeAssign, stringToChunk(escapeTextForBrowser(propValue)), attributeEnd);
          }
          break;
      }
    }
  }

  // TODO: ViewTransition attributes gets observed by the Custom Element which is a bit sketchy.
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);
  pushInnerHTML(target, innerHTML, children);
  return children;
}
var leadingNewline = stringToPrecomputedChunk('\n');
function pushStartPreformattedElement(target, props, tag, formatContext) {
  target.push(startChunkForTag(tag));
  var children = null;
  var innerHTML = null;
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'children':
          children = propValue;
          break;
        case 'dangerouslySetInnerHTML':
          innerHTML = propValue;
          break;
        default:
          pushAttribute(target, propKey, propValue);
          break;
      }
    }
  }
  pushViewTransitionAttributes(target, formatContext);
  target.push(endOfStartTag);

  // text/html ignores the first character in these tags if it's a newline
  // Prefer to break application/xml over text/html (for now) by adding
  // a newline specifically to get eaten by the parser. (Alternately for
  // textareas, replacing "^\n" with "\r\n" doesn't get eaten, and the first
  // \r is normalized out by HTMLTextAreaElement#value.)
  // See: <http://www.w3.org/TR/html-polyglot/#newlines-in-textarea-and-pre>
  // See: <http://www.w3.org/TR/html5/syntax.html#element-restrictions>
  // See: <http://www.w3.org/TR/html5/syntax.html#newlines>
  // See: Parsing of "textarea" "listing" and "pre" elements
  //  from <http://www.w3.org/TR/html5/syntax.html#parsing-main-inbody>
  // TODO: This doesn't deal with the case where the child is an array
  // or component that returns a string.
  if (innerHTML != null) {
    if (children != null) {
      throw new Error('Can only set one of `children` or `props.dangerouslySetInnerHTML`.');
    }
    if (typeof innerHTML !== 'object' || !('__html' in innerHTML)) {
      throw new Error('`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' + 'Please visit https://react.dev/link/dangerously-set-inner-html ' + 'for more information.');
    }
    var html = innerHTML.__html;
    if (html !== null && html !== undefined) {
      if (typeof html === 'string' && html.length > 0 && html[0] === '\n') {
        target.push(leadingNewline, stringToChunk(html));
      } else {
        target.push(stringToChunk('' + html));
      }
    }
  }
  if (typeof children === 'string' && children[0] === '\n') {
    target.push(leadingNewline);
  }
  return children;
}

// We accept any tag to be rendered but since this gets injected into arbitrary
// HTML, we want to make sure that it's a safe tag.
// http://www.w3.org/TR/REC-xml/#NT-Name
var VALID_TAG_REGEX = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/; // Simplified subset
var validatedTagCache = new Map();
function startChunkForTag(tag) {
  var tagStartChunk = validatedTagCache.get(tag);
  if (tagStartChunk === undefined) {
    if (!VALID_TAG_REGEX.test(tag)) {
      throw new Error("Invalid tag: " + tag);
    }
    tagStartChunk = stringToPrecomputedChunk('<' + tag);
    validatedTagCache.set(tag, tagStartChunk);
  }
  return tagStartChunk;
}
function pushStartInstance(target, type, props, resumableState, renderState, preambleState, hoistableState, formatContext, textEmbedded) {
  switch (type) {
    case 'div':
    case 'span':
    case 'svg':
    case 'path':
      // Fast track very common tags
      break;
    case 'a':
      return pushStartAnchor(target, props, formatContext);
    case 'g':
    case 'p':
    case 'li':
      // Fast track very common tags
      break;
    // Special tags
    case 'select':
      return pushStartSelect(target, props, formatContext);
    case 'option':
      return pushStartOption(target, props, formatContext);
    case 'textarea':
      return pushStartTextArea(target, props, formatContext);
    case 'input':
      return pushInput(target, props, resumableState, renderState, formatContext);
    case 'button':
      return pushStartButton(target, props, resumableState, renderState, formatContext);
    case 'form':
      return pushStartForm(target, props, resumableState, renderState, formatContext);
    case 'menuitem':
      return pushStartMenuItem(target, props, formatContext);
    case 'object':
      return pushStartObject(target, props, formatContext);
    case 'title':
      return pushTitle(target, props, renderState, formatContext);
    case 'link':
      return pushLink(target, props, resumableState, renderState, hoistableState, textEmbedded, formatContext);
    case 'script':
      return pushScript(target, props, resumableState, renderState, textEmbedded, formatContext);
    case 'style':
      return pushStyle(target, props, resumableState, renderState, hoistableState, textEmbedded, formatContext);
    case 'meta':
      return pushMeta(target, props, renderState, textEmbedded, formatContext);
    // Newline eating tags
    case 'listing':
    case 'pre':
      {
        return pushStartPreformattedElement(target, props, type, formatContext);
      }
    case 'img':
      {
        return pushImg(target, props, resumableState, renderState, hoistableState, formatContext);
      }
    // Omitted close tags
    case 'base':
    case 'area':
    case 'br':
    case 'col':
    case 'embed':
    case 'hr':
    case 'keygen':
    case 'param':
    case 'source':
    case 'track':
    case 'wbr':
      {
        return pushSelfClosing(target, props, type, formatContext);
      }
    // These are reserved SVG and MathML elements, that are never custom elements.
    // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      {
        break;
      }
    // Preamble start tags
    case 'head':
      return pushStartHead(target, props, renderState, preambleState, formatContext);
    case 'body':
      return pushStartBody(target, props, renderState, preambleState, formatContext);
    case 'html':
      {
        return pushStartHtml(target, props, renderState, preambleState, formatContext);
      }
    default:
      {
        if (type.indexOf('-') !== -1) {
          // Custom element
          return pushStartCustomElement(target, props, type, formatContext);
        }
      }
  }
  // Generic element
  return pushStartGenericElement(target, props, type, formatContext);
}
var endTagCache = new Map();
function endChunkForTag(tag) {
  var chunk = endTagCache.get(tag);
  if (chunk === undefined) {
    chunk = stringToPrecomputedChunk('</' + tag + '>');
    endTagCache.set(tag, chunk);
  }
  return chunk;
}
function pushEndInstance(target, type, props, resumableState, formatContext) {
  switch (type) {
    // We expect title and script tags to always be pushed in a unit and never
    // return children. when we end up pushing the end tag we want to ensure
    // there is no extra closing tag pushed
    case 'title':
    case 'style':
    case 'script':
    // Omitted close tags
    // TODO: Instead of repeating this switch we could try to pass a flag from above.
    // That would require returning a tuple. Which might be ok if it gets inlined.
    // fallthrough
    case 'area':
    case 'base':
    case 'br':
    case 'col':
    case 'embed':
    case 'hr':
    case 'img':
    case 'input':
    case 'keygen':
    case 'link':
    case 'meta':
    case 'param':
    case 'source':
    case 'track':
    case 'wbr':
      {
        // No close tag needed.
        return;
      }
    // Postamble end tags
    // When float is enabled we omit the end tags for body and html when
    // they represent the Document.body and Document.documentElement Nodes.
    // This is so we can withhold them until the postamble when we know
    // we won't emit any more tags
    case 'body':
      {
        if (formatContext.insertionMode <= HTML_HTML_MODE) {
          resumableState.hasBody = true;
          return;
        }
        break;
      }
    case 'html':
      if (formatContext.insertionMode === ROOT_HTML_MODE) {
        resumableState.hasHtml = true;
        return;
      }
      break;
    case 'head':
      if (formatContext.insertionMode <= HTML_HTML_MODE) {
        return;
      }
      break;
  }
  target.push(endChunkForTag(type));
}
function hoistPreambleState(renderState, preambleState) {
  var rootPreamble = renderState.preamble;
  if (rootPreamble.htmlChunks === null && preambleState.htmlChunks) {
    rootPreamble.htmlChunks = preambleState.htmlChunks;
  }
  if (rootPreamble.headChunks === null && preambleState.headChunks) {
    rootPreamble.headChunks = preambleState.headChunks;
  }
  if (rootPreamble.bodyChunks === null && preambleState.bodyChunks) {
    rootPreamble.bodyChunks = preambleState.bodyChunks;
  }
}
function isPreambleReady(renderState,
// This means there are unfinished Suspense boundaries which could contain
// a preamble. In the case of DOM we constrain valid programs to only having
// one instance of each singleton so we can determine the preamble is ready
// as long as we have chunks for each of these tags.
hasPendingPreambles) {
  var preamble = renderState.preamble;
  return (
    // There are no remaining boundaries which might contain a preamble so
    // the preamble is as complete as it is going to get
    hasPendingPreambles === false ||
    // we have a head and body tag. we don't need to wait for any more
    // because it would be invalid to render additional copies of these tags
    !!(preamble.headChunks && preamble.bodyChunks)
  );
}
function writeBootstrap(destination, renderState) {
  var bootstrapChunks = renderState.bootstrapChunks;
  var i = 0;
  for (; i < bootstrapChunks.length - 1; i++) {
    writeChunk(destination, bootstrapChunks[i]);
  }
  if (i < bootstrapChunks.length) {
    var lastChunk = bootstrapChunks[i];
    bootstrapChunks.length = 0;
    return writeChunkAndReturn(destination, lastChunk);
  }
  return true;
}
var shellTimeRuntimeScript = stringToPrecomputedChunk(markShellTime);
function writeShellTimeInstruction(destination, resumableState, renderState) {
  if (resumableState.streamingFormat !== ScriptStreamingFormat) {
    // External runtime always tracks the shell time in the runtime.
    return true;
  }
  if ((resumableState.instructions & SentMarkShellTime) !== NothingSent) {
    // We already sent this instruction.
    return true;
  }
  resumableState.instructions |= SentMarkShellTime;
  writeChunk(destination, renderState.startInlineScript);
  writeCompletedShellIdAttribute(destination, resumableState);
  writeChunk(destination, endOfStartTag);
  writeChunk(destination, shellTimeRuntimeScript);
  return writeChunkAndReturn(destination, endInlineScript);
}
function writeCompletedRoot(destination, resumableState, renderState, isComplete) {
  if (!isComplete) {
    // If we're not already fully complete, we might complete another boundary. If so,
    // we need to track the paint time of the shell so we know how much to throttle the reveal.
    writeShellTimeInstruction(destination, resumableState, renderState);
  }
  {
    var preamble = renderState.preamble;
    if (preamble.htmlChunks || preamble.headChunks) {
      // If we rendered the whole document, then we emitted a rel="expect" that needs a
      // matching target. Normally we use one of the bootstrap scripts for this but if
      // there are none, then we need to emit a tag to complete the shell.
      if ((resumableState.instructions & SentCompletedShellId) === NothingSent) {
        writeChunk(destination, startChunkForTag('template'));
        writeCompletedShellIdAttribute(destination, resumableState);
        writeChunk(destination, endOfStartTag);
        writeChunk(destination, endChunkForTag('template'));
      }
    }
  }
  return writeBootstrap(destination, renderState);
}

// Structural Nodes

// A placeholder is a node inside a hidden partial tree that can be filled in later, but before
// display. It's never visible to users. We use the template tag because it can be used in every
// type of parent. <script> tags also work in every other tag except <colgroup>.
var placeholder1 = stringToPrecomputedChunk('<template id="');
var placeholder2 = stringToPrecomputedChunk('"></template>');
function writePlaceholder(destination, renderState, id) {
  writeChunk(destination, placeholder1);
  writeChunk(destination, renderState.placeholderPrefix);
  var formattedID = stringToChunk(id.toString(16));
  writeChunk(destination, formattedID);
  return writeChunkAndReturn(destination, placeholder2);
}

// Activity boundaries are encoded as comments.
var startActivityBoundary = stringToPrecomputedChunk('<!--&-->');
var endActivityBoundary = stringToPrecomputedChunk('<!--/&-->');
function pushStartActivityBoundary$1(target, renderState) {
  target.push(startActivityBoundary);
}
function pushEndActivityBoundary$1(target, renderState) {
  target.push(endActivityBoundary);
}

// Suspense boundaries are encoded as comments.
var startCompletedSuspenseBoundary = stringToPrecomputedChunk('<!--$-->');
var startPendingSuspenseBoundary1 = stringToPrecomputedChunk('<!--$?--><template id="');
var startPendingSuspenseBoundary2 = stringToPrecomputedChunk('"></template>');
var startClientRenderedSuspenseBoundary = stringToPrecomputedChunk('<!--$!-->');
var endSuspenseBoundary = stringToPrecomputedChunk('<!--/$-->');
var clientRenderedSuspenseBoundaryError1 = stringToPrecomputedChunk('<template');
var clientRenderedSuspenseBoundaryErrorAttrInterstitial = stringToPrecomputedChunk('"');
var clientRenderedSuspenseBoundaryError1A = stringToPrecomputedChunk(' data-dgst="');
var clientRenderedSuspenseBoundaryError2 = stringToPrecomputedChunk('></template>');
function writeStartCompletedSuspenseBoundary$1(destination, renderState) {
  return writeChunkAndReturn(destination, startCompletedSuspenseBoundary);
}
function writeStartPendingSuspenseBoundary(destination, renderState, id) {
  writeChunk(destination, startPendingSuspenseBoundary1);
  if (id === null) {
    throw new Error('An ID must have been assigned before we can complete the boundary.');
  }
  writeChunk(destination, renderState.boundaryPrefix);
  writeChunk(destination, stringToChunk(id.toString(16)));
  return writeChunkAndReturn(destination, startPendingSuspenseBoundary2);
}
function writeStartClientRenderedSuspenseBoundary$1(destination, renderState, errorDigest, errorMessage, errorStack, errorComponentStack) {
  var result;
  result = writeChunkAndReturn(destination, startClientRenderedSuspenseBoundary);
  writeChunk(destination, clientRenderedSuspenseBoundaryError1);
  if (errorDigest) {
    writeChunk(destination, clientRenderedSuspenseBoundaryError1A);
    writeChunk(destination, stringToChunk(escapeTextForBrowser(errorDigest)));
    writeChunk(destination, clientRenderedSuspenseBoundaryErrorAttrInterstitial);
  }
  result = writeChunkAndReturn(destination, clientRenderedSuspenseBoundaryError2);
  return result;
}
function writeEndCompletedSuspenseBoundary$1(destination, renderState) {
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
function writeEndPendingSuspenseBoundary(destination, renderState) {
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
function writeEndClientRenderedSuspenseBoundary$1(destination, renderState) {
  return writeChunkAndReturn(destination, endSuspenseBoundary);
}
var startSegmentHTML = stringToPrecomputedChunk('<div hidden id="');
var startSegmentHTML2 = stringToPrecomputedChunk('">');
var endSegmentHTML = stringToPrecomputedChunk('</div>');
var startSegmentSVG = stringToPrecomputedChunk('<svg aria-hidden="true" style="display:none" id="');
var startSegmentSVG2 = stringToPrecomputedChunk('">');
var endSegmentSVG = stringToPrecomputedChunk('</svg>');
var startSegmentMathML = stringToPrecomputedChunk('<math aria-hidden="true" style="display:none" id="');
var startSegmentMathML2 = stringToPrecomputedChunk('">');
var endSegmentMathML = stringToPrecomputedChunk('</math>');
var startSegmentTable = stringToPrecomputedChunk('<table hidden id="');
var startSegmentTable2 = stringToPrecomputedChunk('">');
var endSegmentTable = stringToPrecomputedChunk('</table>');
var startSegmentTableBody = stringToPrecomputedChunk('<table hidden><tbody id="');
var startSegmentTableBody2 = stringToPrecomputedChunk('">');
var endSegmentTableBody = stringToPrecomputedChunk('</tbody></table>');
var startSegmentTableRow = stringToPrecomputedChunk('<table hidden><tr id="');
var startSegmentTableRow2 = stringToPrecomputedChunk('">');
var endSegmentTableRow = stringToPrecomputedChunk('</tr></table>');
var startSegmentColGroup = stringToPrecomputedChunk('<table hidden><colgroup id="');
var startSegmentColGroup2 = stringToPrecomputedChunk('">');
var endSegmentColGroup = stringToPrecomputedChunk('</colgroup></table>');
function writeStartSegment(destination, renderState, formatContext, id) {
  switch (formatContext.insertionMode) {
    case ROOT_HTML_MODE:
    case HTML_HTML_MODE:
    case HTML_HEAD_MODE:
    case HTML_MODE:
      {
        writeChunk(destination, startSegmentHTML);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentHTML2);
      }
    case SVG_MODE:
      {
        writeChunk(destination, startSegmentSVG);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentSVG2);
      }
    case MATHML_MODE:
      {
        writeChunk(destination, startSegmentMathML);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentMathML2);
      }
    case HTML_TABLE_MODE:
      {
        writeChunk(destination, startSegmentTable);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentTable2);
      }
    // TODO: For the rest of these, there will be extra wrapper nodes that never
    // get deleted from the document. We need to delete the table too as part
    // of the injected scripts. They are invisible though so it's not too terrible
    // and it's kind of an edge case to suspend in a table. Totally supported though.
    case HTML_TABLE_BODY_MODE:
      {
        writeChunk(destination, startSegmentTableBody);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentTableBody2);
      }
    case HTML_TABLE_ROW_MODE:
      {
        writeChunk(destination, startSegmentTableRow);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentTableRow2);
      }
    case HTML_COLGROUP_MODE:
      {
        writeChunk(destination, startSegmentColGroup);
        writeChunk(destination, renderState.segmentPrefix);
        writeChunk(destination, stringToChunk(id.toString(16)));
        return writeChunkAndReturn(destination, startSegmentColGroup2);
      }
    default:
      {
        throw new Error('Unknown insertion mode. This is a bug in React.');
      }
  }
}
function writeEndSegment(destination, formatContext) {
  switch (formatContext.insertionMode) {
    case ROOT_HTML_MODE:
    case HTML_HTML_MODE:
    case HTML_HEAD_MODE:
    case HTML_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentHTML);
      }
    case SVG_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentSVG);
      }
    case MATHML_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentMathML);
      }
    case HTML_TABLE_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentTable);
      }
    case HTML_TABLE_BODY_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentTableBody);
      }
    case HTML_TABLE_ROW_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentTableRow);
      }
    case HTML_COLGROUP_MODE:
      {
        return writeChunkAndReturn(destination, endSegmentColGroup);
      }
    default:
      {
        throw new Error('Unknown insertion mode. This is a bug in React.');
      }
  }
}
var completeSegmentScript1Full = stringToPrecomputedChunk(completeSegment + '$RS("');
var completeSegmentScript1Partial = stringToPrecomputedChunk('$RS("');
var completeSegmentScript2 = stringToPrecomputedChunk('","');
var completeSegmentScriptEnd = stringToPrecomputedChunk('")</script>');
var completeSegmentData1 = stringToPrecomputedChunk('<template data-rsi="" data-sid="');
var completeSegmentData2 = stringToPrecomputedChunk('" data-pid="');
var completeSegmentDataEnd = dataElementQuotedEnd;
function writeCompletedSegmentInstruction(destination, resumableState, renderState, contentSegmentID) {
  var scriptFormat = resumableState.streamingFormat === ScriptStreamingFormat;
  if (scriptFormat) {
    writeChunk(destination, renderState.startInlineScript);
    writeChunk(destination, endOfStartTag);
    if ((resumableState.instructions & SentCompleteSegmentFunction) === NothingSent) {
      // The first time we write this, we'll need to include the full implementation.
      resumableState.instructions |= SentCompleteSegmentFunction;
      writeChunk(destination, completeSegmentScript1Full);
    } else {
      // Future calls can just reuse the same function.
      writeChunk(destination, completeSegmentScript1Partial);
    }
  } else {
    writeChunk(destination, completeSegmentData1);
  }

  // Write function arguments, which are string literals
  writeChunk(destination, renderState.segmentPrefix);
  var formattedID = stringToChunk(contentSegmentID.toString(16));
  writeChunk(destination, formattedID);
  if (scriptFormat) {
    writeChunk(destination, completeSegmentScript2);
  } else {
    writeChunk(destination, completeSegmentData2);
  }
  writeChunk(destination, renderState.placeholderPrefix);
  writeChunk(destination, formattedID);
  if (scriptFormat) {
    return writeChunkAndReturn(destination, completeSegmentScriptEnd);
  } else {
    return writeChunkAndReturn(destination, completeSegmentDataEnd);
  }
}
var completeBoundaryScriptFunctionOnly = stringToPrecomputedChunk(completeBoundary);
var completeBoundaryUpgradeToViewTransitionsInstruction = stringToChunk(completeBoundaryUpgradeToViewTransitions);
var completeBoundaryScript1Partial = stringToPrecomputedChunk('$RC("');
var completeBoundaryWithStylesScript1FullPartial = stringToPrecomputedChunk(completeBoundaryWithStyles + '$RR("');
var completeBoundaryWithStylesScript1Partial = stringToPrecomputedChunk('$RR("');
var completeBoundaryScript2 = stringToPrecomputedChunk('","');
var completeBoundaryScript3a = stringToPrecomputedChunk('",');
var completeBoundaryScript3b = stringToPrecomputedChunk('"');
var completeBoundaryScriptEnd = stringToPrecomputedChunk(')</script>');
var completeBoundaryData1 = stringToPrecomputedChunk('<template data-rci="" data-bid="');
var completeBoundaryWithStylesData1 = stringToPrecomputedChunk('<template data-rri="" data-bid="');
var completeBoundaryData2 = stringToPrecomputedChunk('" data-sid="');
var completeBoundaryData3a = stringToPrecomputedChunk('" data-sty="');
var completeBoundaryDataEnd = dataElementQuotedEnd;
function writeCompletedBoundaryInstruction(destination, resumableState, renderState, id, hoistableState) {
  var requiresStyleInsertion = renderState.stylesToHoist;
  var requiresViewTransitions = (resumableState.instructions & NeedUpgradeToViewTransitions) !== NothingSent;
  // If necessary stylesheets will be flushed with this instruction.
  // Any style tags not yet hoisted in the Document will also be hoisted.
  // We reset this state since after this instruction executes all styles
  // up to this point will have been hoisted
  renderState.stylesToHoist = false;
  var scriptFormat = resumableState.streamingFormat === ScriptStreamingFormat;
  if (scriptFormat) {
    writeChunk(destination, renderState.startInlineScript);
    writeChunk(destination, endOfStartTag);
    if (requiresStyleInsertion) {
      if ((resumableState.instructions & SentClientRenderFunction) === NothingSent) {
        // The completeBoundaryWithStyles function depends on the client render function.
        resumableState.instructions |= SentClientRenderFunction;
        writeChunk(destination, clientRenderScriptFunctionOnly);
      }
      if ((resumableState.instructions & SentCompleteBoundaryFunction) === NothingSent) {
        // The completeBoundaryWithStyles function depends on the complete boundary function.
        resumableState.instructions |= SentCompleteBoundaryFunction;
        writeChunk(destination, completeBoundaryScriptFunctionOnly);
      }
      if (requiresViewTransitions && (resumableState.instructions & SentUpgradeToViewTransitions) === NothingSent) {
        resumableState.instructions |= SentUpgradeToViewTransitions;
        writeChunk(destination, completeBoundaryUpgradeToViewTransitionsInstruction);
      }
      if ((resumableState.instructions & SentStyleInsertionFunction) === NothingSent) {
        resumableState.instructions |= SentStyleInsertionFunction;
        writeChunk(destination, completeBoundaryWithStylesScript1FullPartial);
      } else {
        writeChunk(destination, completeBoundaryWithStylesScript1Partial);
      }
    } else {
      if ((resumableState.instructions & SentCompleteBoundaryFunction) === NothingSent) {
        resumableState.instructions |= SentCompleteBoundaryFunction;
        writeChunk(destination, completeBoundaryScriptFunctionOnly);
      }
      if (requiresViewTransitions && (resumableState.instructions & SentUpgradeToViewTransitions) === NothingSent) {
        resumableState.instructions |= SentUpgradeToViewTransitions;
        writeChunk(destination, completeBoundaryUpgradeToViewTransitionsInstruction);
      }
      writeChunk(destination, completeBoundaryScript1Partial);
    }
  } else {
    if (requiresStyleInsertion) {
      writeChunk(destination, completeBoundaryWithStylesData1);
    } else {
      writeChunk(destination, completeBoundaryData1);
    }
  }
  var idChunk = stringToChunk(id.toString(16));
  writeChunk(destination, renderState.boundaryPrefix);
  writeChunk(destination, idChunk);

  // Write function arguments, which are string and array literals
  if (scriptFormat) {
    writeChunk(destination, completeBoundaryScript2);
  } else {
    writeChunk(destination, completeBoundaryData2);
  }
  writeChunk(destination, renderState.segmentPrefix);
  writeChunk(destination, idChunk);
  if (requiresStyleInsertion) {
    // Script and data writers must format this differently:
    //  - script writer emits an array literal, whose string elements are
    //    escaped for javascript  e.g. ["A", "B"]
    //  - data writer emits a string literal, which is escaped as html
    //    e.g. [&#34;A&#34;, &#34;B&#34;]
    if (scriptFormat) {
      writeChunk(destination, completeBoundaryScript3a);
      // hoistableState encodes an array literal
      writeStyleResourceDependenciesInJS(destination, hoistableState);
    } else {
      writeChunk(destination, completeBoundaryData3a);
      writeStyleResourceDependenciesInAttr(destination, hoistableState);
    }
  } else {
    if (scriptFormat) {
      writeChunk(destination, completeBoundaryScript3b);
    }
  }
  var writeMore;
  if (scriptFormat) {
    writeMore = writeChunkAndReturn(destination, completeBoundaryScriptEnd);
  } else {
    writeMore = writeChunkAndReturn(destination, completeBoundaryDataEnd);
  }
  return writeBootstrap(destination, renderState) && writeMore;
}
var clientRenderScriptFunctionOnly = stringToPrecomputedChunk(clientRenderBoundary);
var clientRenderScript1Full = stringToPrecomputedChunk(clientRenderBoundary + ';$RX("');
var clientRenderScript1Partial = stringToPrecomputedChunk('$RX("');
var clientRenderScript1A = stringToPrecomputedChunk('"');
var clientRenderErrorScriptArgInterstitial = stringToPrecomputedChunk(',');
var clientRenderScriptEnd = stringToPrecomputedChunk(')</script>');
var clientRenderData1 = stringToPrecomputedChunk('<template data-rxi="" data-bid="');
var clientRenderData2 = stringToPrecomputedChunk('" data-dgst="');
var clientRenderData3 = stringToPrecomputedChunk('" data-msg="');
var clientRenderData4 = stringToPrecomputedChunk('" data-stck="');
var clientRenderData5 = stringToPrecomputedChunk('" data-cstck="');
var clientRenderDataEnd = dataElementQuotedEnd;
function writeClientRenderBoundaryInstruction(destination, resumableState, renderState, id, errorDigest, errorMessage, errorStack, errorComponentStack) {
  var scriptFormat = resumableState.streamingFormat === ScriptStreamingFormat;
  if (scriptFormat) {
    writeChunk(destination, renderState.startInlineScript);
    writeChunk(destination, endOfStartTag);
    if ((resumableState.instructions & SentClientRenderFunction) === NothingSent) {
      // The first time we write this, we'll need to include the full implementation.
      resumableState.instructions |= SentClientRenderFunction;
      writeChunk(destination, clientRenderScript1Full);
    } else {
      // Future calls can just reuse the same function.
      writeChunk(destination, clientRenderScript1Partial);
    }
  } else {
    // <template data-rxi="" data-bid="
    writeChunk(destination, clientRenderData1);
  }
  writeChunk(destination, renderState.boundaryPrefix);
  writeChunk(destination, stringToChunk(id.toString(16)));
  if (scriptFormat) {
    // " needs to be inserted for scripts, since ArgInterstitual does not contain
    // leading or trailing quotes
    writeChunk(destination, clientRenderScript1A);
  }
  if (errorDigest || errorMessage || errorStack || errorComponentStack) {
    if (scriptFormat) {
      // ,"JSONString"
      writeChunk(destination, clientRenderErrorScriptArgInterstitial);
      writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorDigest || '')));
    } else {
      // " data-dgst="HTMLString
      writeChunk(destination, clientRenderData2);
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorDigest || '')));
    }
  }
  if (errorMessage || errorStack || errorComponentStack) {
    if (scriptFormat) {
      // ,"JSONString"
      writeChunk(destination, clientRenderErrorScriptArgInterstitial);
      writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorMessage || '')));
    } else {
      // " data-msg="HTMLString
      writeChunk(destination, clientRenderData3);
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorMessage || '')));
    }
  }
  if (errorStack || errorComponentStack) {
    // ,"JSONString"
    if (scriptFormat) {
      writeChunk(destination, clientRenderErrorScriptArgInterstitial);
      writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorStack || '')));
    } else {
      // " data-stck="HTMLString
      writeChunk(destination, clientRenderData4);
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorStack || '')));
    }
  }
  if (errorComponentStack) {
    // ,"JSONString"
    if (scriptFormat) {
      writeChunk(destination, clientRenderErrorScriptArgInterstitial);
      writeChunk(destination, stringToChunk(escapeJSStringsForInstructionScripts(errorComponentStack)));
    } else {
      // " data-cstck="HTMLString
      writeChunk(destination, clientRenderData5);
      writeChunk(destination, stringToChunk(escapeTextForBrowser(errorComponentStack)));
    }
  }
  if (scriptFormat) {
    // ></script>
    return writeChunkAndReturn(destination, clientRenderScriptEnd);
  } else {
    // "></template>
    return writeChunkAndReturn(destination, clientRenderDataEnd);
  }
}
var regexForJSStringsInInstructionScripts = /[<\u2028\u2029]/g;
function escapeJSStringsForInstructionScripts(input) {
  var escaped = JSON.stringify(input);
  return escaped.replace(regexForJSStringsInInstructionScripts, function (match) {
    switch (match) {
      // santizing breaking out of strings and script tags
      case '<':
        return "\\u003c";
      case "\u2028":
        return "\\u2028";
      case "\u2029":
        return "\\u2029";
      default:
        {
          // eslint-disable-next-line react-internal/prod-error-codes
          throw new Error('escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React');
        }
    }
  });
}
var regexForJSStringsInScripts = /[&><\u2028\u2029]/g;
function escapeJSObjectForInstructionScripts(input) {
  var escaped = JSON.stringify(input);
  return escaped.replace(regexForJSStringsInScripts, function (match) {
    switch (match) {
      // santizing breaking out of strings and script tags
      case '&':
        return "\\u0026";
      case '>':
        return "\\u003e";
      case '<':
        return "\\u003c";
      case "\u2028":
        return "\\u2028";
      case "\u2029":
        return "\\u2029";
      default:
        {
          // eslint-disable-next-line react-internal/prod-error-codes
          throw new Error('escapeJSObjectForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React');
        }
    }
  });
}
var lateStyleTagResourceOpen1 = stringToPrecomputedChunk(' media="not all" data-precedence="');
var lateStyleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="');
var lateStyleTagResourceOpen3 = stringToPrecomputedChunk('">');
var lateStyleTagTemplateClose = stringToPrecomputedChunk('</style>');

// Tracks whether the boundary currently flushing is flushign style tags or has any
// stylesheet dependencies not flushed in the Preamble.
var currentlyRenderingBoundaryHasStylesToHoist = false;

// Acts as a return value for the forEach execution of style tag flushing.
var destinationHasCapacity = true;
function flushStyleTagsLateForBoundary(styleQueue) {
  var rules = styleQueue.rules;
  var hrefs = styleQueue.hrefs;
  var i = 0;
  if (hrefs.length) {
    writeChunk(this, currentlyFlushingRenderState.startInlineStyle);
    writeChunk(this, lateStyleTagResourceOpen1);
    writeChunk(this, styleQueue.precedence);
    writeChunk(this, lateStyleTagResourceOpen2);
    for (; i < hrefs.length - 1; i++) {
      writeChunk(this, hrefs[i]);
      writeChunk(this, spaceSeparator);
    }
    writeChunk(this, hrefs[i]);
    writeChunk(this, lateStyleTagResourceOpen3);
    for (i = 0; i < rules.length; i++) {
      writeChunk(this, rules[i]);
    }
    destinationHasCapacity = writeChunkAndReturn(this, lateStyleTagTemplateClose);

    // We wrote style tags for this boundary and we may need to emit a script
    // to hoist them.
    currentlyRenderingBoundaryHasStylesToHoist = true;

    // style resources can flush continuously since more rules may be written into
    // them with new hrefs. Instead of marking it flushed, we simply reset the chunks
    // and hrefs
    rules.length = 0;
    hrefs.length = 0;
  }
}
function hasStylesToHoist(stylesheet) {
  // We need to reveal boundaries with styles whenever a stylesheet it depends on is either
  // not flushed or flushed after the preamble (shell).
  if (stylesheet.state !== PREAMBLE) {
    currentlyRenderingBoundaryHasStylesToHoist = true;
    return true;
  }
  return false;
}
function writeHoistablesForBoundary(destination, hoistableState, renderState) {
  // Reset these on each invocation, they are only safe to read in this function
  currentlyRenderingBoundaryHasStylesToHoist = false;
  destinationHasCapacity = true;

  // Flush style tags for each precedence this boundary depends on
  currentlyFlushingRenderState = renderState;
  hoistableState.styles.forEach(flushStyleTagsLateForBoundary, destination);
  currentlyFlushingRenderState = null;

  // Determine if this boundary has stylesheets that need to be awaited upon completion
  hoistableState.stylesheets.forEach(hasStylesToHoist);

  // We don't actually want to flush any hoistables until the boundary is complete so we omit
  // any further writing here. This is because unlike Resources, Hoistable Elements act more like
  // regular elements, each rendered element has a unique representation in the DOM. We don't want
  // these elements to appear in the DOM early, before the boundary has actually completed

  if (currentlyRenderingBoundaryHasStylesToHoist) {
    renderState.stylesToHoist = true;
  }
  return destinationHasCapacity;
}
function flushResource(resource) {
  for (var i = 0; i < resource.length; i++) {
    writeChunk(this, resource[i]);
  }
  resource.length = 0;
}
var stylesheetFlushingQueue = [];
function flushStyleInPreamble(stylesheet, key, map) {
  // We still need to encode stylesheet chunks
  // because unlike most Hoistables and Resources we do not eagerly encode
  // them during render. This is because if we flush late we have to send a
  // different encoding and we don't want to encode multiple times
  pushLinkImpl(stylesheetFlushingQueue, stylesheet.props);
  for (var i = 0; i < stylesheetFlushingQueue.length; i++) {
    writeChunk(this, stylesheetFlushingQueue[i]);
  }
  stylesheetFlushingQueue.length = 0;
  stylesheet.state = PREAMBLE;
}
var styleTagResourceOpen1 = stringToPrecomputedChunk(' data-precedence="');
var styleTagResourceOpen2 = stringToPrecomputedChunk('" data-href="');
var spaceSeparator = stringToPrecomputedChunk(' ');
var styleTagResourceOpen3 = stringToPrecomputedChunk('">');
var styleTagResourceClose = stringToPrecomputedChunk('</style>');
function flushStylesInPreamble(styleQueue, precedence) {
  var hasStylesheets = styleQueue.sheets.size > 0;
  styleQueue.sheets.forEach(flushStyleInPreamble, this);
  styleQueue.sheets.clear();
  var rules = styleQueue.rules;
  var hrefs = styleQueue.hrefs;
  // If we don't emit any stylesheets at this precedence we still need to maintain the precedence
  // order so even if there are no rules for style tags at this precedence we emit an empty style
  // tag with the data-precedence attribute
  if (!hasStylesheets || hrefs.length) {
    writeChunk(this, currentlyFlushingRenderState.startInlineStyle);
    writeChunk(this, styleTagResourceOpen1);
    writeChunk(this, styleQueue.precedence);
    var i = 0;
    if (hrefs.length) {
      writeChunk(this, styleTagResourceOpen2);
      for (; i < hrefs.length - 1; i++) {
        writeChunk(this, hrefs[i]);
        writeChunk(this, spaceSeparator);
      }
      writeChunk(this, hrefs[i]);
    }
    writeChunk(this, styleTagResourceOpen3);
    for (i = 0; i < rules.length; i++) {
      writeChunk(this, rules[i]);
    }
    writeChunk(this, styleTagResourceClose);

    // style resources can flush continuously since more rules may be written into
    // them with new hrefs. Instead of marking it flushed, we simply reset the chunks
    // and hrefs
    rules.length = 0;
    hrefs.length = 0;
  }
}
function preloadLateStyle(stylesheet) {
  if (stylesheet.state === PENDING$1) {
    stylesheet.state = PRELOADED;
    var preloadProps = preloadAsStylePropsFromProps(stylesheet.props.href, stylesheet.props);
    pushLinkImpl(stylesheetFlushingQueue, preloadProps);
    for (var i = 0; i < stylesheetFlushingQueue.length; i++) {
      writeChunk(this, stylesheetFlushingQueue[i]);
    }
    stylesheetFlushingQueue.length = 0;
  }
}
function preloadLateStyles(styleQueue) {
  styleQueue.sheets.forEach(preloadLateStyle, this);
  styleQueue.sheets.clear();
}
var blockingRenderChunkStart = stringToPrecomputedChunk('<link rel="expect" href="#');
var blockingRenderChunkEnd = stringToPrecomputedChunk('" blocking="render"/>');
function writeBlockingRenderInstruction(destination, resumableState, renderState) {
  {
    var idPrefix = resumableState.idPrefix;
    var shellId = '_' + idPrefix + 'R_';
    writeChunk(destination, blockingRenderChunkStart);
    writeChunk(destination, stringToChunk(escapeTextForBrowser(shellId)));
    writeChunk(destination, blockingRenderChunkEnd);
  }
}
var completedShellIdAttributeStart = stringToPrecomputedChunk(' id="');
function writeCompletedShellIdAttribute(destination, resumableState) {
  if ((resumableState.instructions & SentCompletedShellId) !== NothingSent) {
    return;
  }
  resumableState.instructions |= SentCompletedShellId;
  var idPrefix = resumableState.idPrefix;
  var shellId = '_' + idPrefix + 'R_';
  writeChunk(destination, completedShellIdAttributeStart);
  writeChunk(destination, stringToChunk(escapeTextForBrowser(shellId)));
  writeChunk(destination, attributeEnd);
}
function pushCompletedShellIdAttribute(target, resumableState) {
  if ((resumableState.instructions & SentCompletedShellId) !== NothingSent) {
    return;
  }
  resumableState.instructions |= SentCompletedShellId;
  var idPrefix = resumableState.idPrefix;
  var shellId = '_' + idPrefix + 'R_';
  target.push(completedShellIdAttributeStart, stringToChunk(escapeTextForBrowser(shellId)), attributeEnd);
}

// We don't bother reporting backpressure at the moment because we expect to
// flush the entire preamble in a single pass. This probably should be modified
// in the future to be backpressure sensitive but that requires a larger refactor
// of the flushing code in Fizz.
function writePreambleStart$1(destination, resumableState, renderState, skipBlockingShell) {
  // This function must be called exactly once on every request
  if (renderState.externalRuntimeScript) {
    // If the root segment is incomplete due to suspended tasks
    // (e.g. willFlushAllSegments = false) and we are using data
    // streaming format, ensure the external runtime is sent.
    // (User code could choose to send this even earlier by calling
    //  preinit(...), if they know they will suspend).
    var _renderState$external = renderState.externalRuntimeScript,
      src = _renderState$external.src,
      chunks = _renderState$external.chunks;
    internalPreinitScript(resumableState, renderState, src, chunks);
  }
  var preamble = renderState.preamble;
  var htmlChunks = preamble.htmlChunks;
  var headChunks = preamble.headChunks;
  var i = 0;

  // Emit open tags before Hoistables and Resources
  if (htmlChunks) {
    // We have an <html> to emit as part of the preamble
    for (i = 0; i < htmlChunks.length; i++) {
      writeChunk(destination, htmlChunks[i]);
    }
    if (headChunks) {
      for (i = 0; i < headChunks.length; i++) {
        writeChunk(destination, headChunks[i]);
      }
    } else {
      // We did not render a head but we emitted an <html> so we emit one now
      writeChunk(destination, startChunkForTag('head'));
      writeChunk(destination, endOfStartTag);
    }
  } else if (headChunks) {
    // We do not have an <html> but we do have a <head>
    for (i = 0; i < headChunks.length; i++) {
      writeChunk(destination, headChunks[i]);
    }
  }

  // Emit high priority Hoistables
  var charsetChunks = renderState.charsetChunks;
  for (i = 0; i < charsetChunks.length; i++) {
    writeChunk(destination, charsetChunks[i]);
  }
  charsetChunks.length = 0;

  // emit preconnect resources
  renderState.preconnects.forEach(flushResource, destination);
  renderState.preconnects.clear();
  var viewportChunks = renderState.viewportChunks;
  for (i = 0; i < viewportChunks.length; i++) {
    writeChunk(destination, viewportChunks[i]);
  }
  viewportChunks.length = 0;
  renderState.fontPreloads.forEach(flushResource, destination);
  renderState.fontPreloads.clear();
  renderState.highImagePreloads.forEach(flushResource, destination);
  renderState.highImagePreloads.clear();

  // Flush unblocked stylesheets by precedence
  currentlyFlushingRenderState = renderState;
  renderState.styles.forEach(flushStylesInPreamble, destination);
  currentlyFlushingRenderState = null;
  var importMapChunks = renderState.importMapChunks;
  for (i = 0; i < importMapChunks.length; i++) {
    writeChunk(destination, importMapChunks[i]);
  }
  importMapChunks.length = 0;
  renderState.bootstrapScripts.forEach(flushResource, destination);
  renderState.scripts.forEach(flushResource, destination);
  renderState.scripts.clear();
  renderState.bulkPreloads.forEach(flushResource, destination);
  renderState.bulkPreloads.clear();
  if ((htmlChunks || headChunks) && !skipBlockingShell) {
    // If we have any html or head chunks we know that we're rendering a full document.
    // A full document should block display until the full shell has downloaded.
    // Therefore we insert a render blocking instruction referring to the last body
    // element that's considered part of the shell. We do this after the important loads
    // have already been emitted so we don't do anything to delay them but early so that
    // the browser doesn't risk painting too early.
    writeBlockingRenderInstruction(destination, resumableState);
  } else {
    // We don't need to add the shell id so mark it as if sent.
    // Currently it might still be sent if it was already added to a bootstrap script.
    resumableState.instructions |= SentCompletedShellId;
  }

  // Write embedding hoistableChunks
  var hoistableChunks = renderState.hoistableChunks;
  for (i = 0; i < hoistableChunks.length; i++) {
    writeChunk(destination, hoistableChunks[i]);
  }
  hoistableChunks.length = 0;
}

// We don't bother reporting backpressure at the moment because we expect to
// flush the entire preamble in a single pass. This probably should be modified
// in the future to be backpressure sensitive but that requires a larger refactor
// of the flushing code in Fizz.
function writePreambleEnd(destination, renderState) {
  var preamble = renderState.preamble;
  var htmlChunks = preamble.htmlChunks;
  var headChunks = preamble.headChunks;
  if (htmlChunks || headChunks) {
    // we have an <html> but we inserted an implicit <head> tag. We need
    // to close it since the main content won't have it
    writeChunk(destination, endChunkForTag('head'));
  }
  var bodyChunks = preamble.bodyChunks;
  if (bodyChunks) {
    for (var i = 0; i < bodyChunks.length; i++) {
      writeChunk(destination, bodyChunks[i]);
    }
  }
}

// We don't bother reporting backpressure at the moment because we expect to
// flush the entire preamble in a single pass. This probably should be modified
// in the future to be backpressure sensitive but that requires a larger refactor
// of the flushing code in Fizz.
function writeHoistables(destination, resumableState, renderState) {
  var i = 0;

  // Emit high priority Hoistables

  // We omit charsetChunks because we have already sent the shell and if it wasn't
  // already sent it is too late now.

  var viewportChunks = renderState.viewportChunks;
  for (i = 0; i < viewportChunks.length; i++) {
    writeChunk(destination, viewportChunks[i]);
  }
  viewportChunks.length = 0;
  renderState.preconnects.forEach(flushResource, destination);
  renderState.preconnects.clear();
  renderState.fontPreloads.forEach(flushResource, destination);
  renderState.fontPreloads.clear();
  renderState.highImagePreloads.forEach(flushResource, destination);
  renderState.highImagePreloads.clear();

  // Preload any stylesheets. these will emit in a render instruction that follows this
  // but we want to kick off preloading as soon as possible
  renderState.styles.forEach(preloadLateStyles, destination);

  // We only hoist importmaps that are configured through createResponse and that will
  // always flush in the preamble. Generally we don't expect people to render them as
  // tags when using React but if you do they are going to be treated like regular inline
  // scripts and flush after other hoistables which is problematic

  // bootstrap scripts should flush above script priority but these can only flush in the preamble
  // so we elide the code here for performance

  renderState.scripts.forEach(flushResource, destination);
  renderState.scripts.clear();
  renderState.bulkPreloads.forEach(flushResource, destination);
  renderState.bulkPreloads.clear();

  // Write embedding hoistableChunks
  var hoistableChunks = renderState.hoistableChunks;
  for (i = 0; i < hoistableChunks.length; i++) {
    writeChunk(destination, hoistableChunks[i]);
  }
  hoistableChunks.length = 0;
}
function writePostamble(destination, resumableState) {
  if (resumableState.hasBody) {
    writeChunk(destination, endChunkForTag('body'));
  }
  if (resumableState.hasHtml) {
    writeChunk(destination, endChunkForTag('html'));
  }
}
var arrayFirstOpenBracket = stringToPrecomputedChunk('[');
var arraySubsequentOpenBracket = stringToPrecomputedChunk(',[');
var arrayInterstitial = stringToPrecomputedChunk(',');
var arrayCloseBracket = stringToPrecomputedChunk(']');

// This function writes a 2D array of strings to be embedded in javascript.
// E.g.
//  [["JS_escaped_string1", "JS_escaped_string2"]]
function writeStyleResourceDependenciesInJS(destination, hoistableState) {
  writeChunk(destination, arrayFirstOpenBracket);
  var nextArrayOpenBrackChunk = arrayFirstOpenBracket;
  hoistableState.stylesheets.forEach(function (resource) {
    if (resource.state === PREAMBLE) ; else if (resource.state === LATE) {
      // We only need to emit the href because this resource flushed in an earlier
      // boundary already which encoded the attributes necessary to construct
      // the resource instance on the client.
      writeChunk(destination, nextArrayOpenBrackChunk);
      writeStyleResourceDependencyHrefOnlyInJS(destination, resource.props.href);
      writeChunk(destination, arrayCloseBracket);
      nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
    } else {
      // We need to emit the whole resource for insertion on the client
      writeChunk(destination, nextArrayOpenBrackChunk);
      writeStyleResourceDependencyInJS(destination, resource.props.href, resource.props['data-precedence'], resource.props);
      writeChunk(destination, arrayCloseBracket);
      nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
      resource.state = LATE;
    }
  });
  writeChunk(destination, arrayCloseBracket);
}

/* Helper functions */
function writeStyleResourceDependencyHrefOnlyInJS(destination, href) {
  var coercedHref = '' + href;
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedHref)));
}
function writeStyleResourceDependencyInJS(destination, href, precedence, props) {
  // eslint-disable-next-line react-internal/safe-string-coercion
  var coercedHref = sanitizeURL('' + href);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedHref)));
  var coercedPrecedence = '' + precedence;
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(coercedPrecedence)));
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'href':
        case 'rel':
        case 'precedence':
        case 'data-precedence':
          {
            break;
          }
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('link' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        default:
          writeStyleResourceAttributeInJS(destination, propKey, propValue);
          break;
      }
    }
  }
  return null;
}
function writeStyleResourceAttributeInJS(destination, name, value // not null or undefined
) {
  var attributeName = name.toLowerCase();
  var attributeValue;
  switch (typeof value) {
    case 'function':
    case 'symbol':
      return;
  }
  switch (name) {
    // Reserved names
    case 'innerHTML':
    case 'dangerouslySetInnerHTML':
    case 'suppressContentEditableWarning':
    case 'suppressHydrationWarning':
    case 'style':
    case 'ref':
      // Ignored
      return;

    // Attribute renames
    case 'className':
      {
        attributeName = 'class';
        attributeValue = '' + value;
        break;
      }
    // Booleans
    case 'hidden':
      {
        if (value === false) {
          return;
        }
        attributeValue = '';
        break;
      }
    // Santized URLs
    case 'src':
    case 'href':
      {
        value = sanitizeURL(value);
        attributeValue = '' + value;
        break;
      }
    default:
      {
        if (
        // unrecognized event handlers are not SSR'd and we (apparently)
        // use on* as hueristic for these handler props
        name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
          return;
        }
        if (!isAttributeNameSafe(name)) {
          return;
        }
        attributeValue = '' + value;
      }
  }
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(attributeName)));
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeJSObjectForInstructionScripts(attributeValue)));
}

// This function writes a 2D array of strings to be embedded in an attribute
// value and read with JSON.parse in ReactDOMServerExternalRuntime.js
// E.g.
//  [[&quot;JSON_escaped_string1&quot;, &quot;JSON_escaped_string2&quot;]]
function writeStyleResourceDependenciesInAttr(destination, hoistableState) {
  writeChunk(destination, arrayFirstOpenBracket);
  var nextArrayOpenBrackChunk = arrayFirstOpenBracket;
  hoistableState.stylesheets.forEach(function (resource) {
    if (resource.state === PREAMBLE) ; else if (resource.state === LATE) {
      // We only need to emit the href because this resource flushed in an earlier
      // boundary already which encoded the attributes necessary to construct
      // the resource instance on the client.
      writeChunk(destination, nextArrayOpenBrackChunk);
      writeStyleResourceDependencyHrefOnlyInAttr(destination, resource.props.href);
      writeChunk(destination, arrayCloseBracket);
      nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
    } else {
      // We need to emit the whole resource for insertion on the client
      writeChunk(destination, nextArrayOpenBrackChunk);
      writeStyleResourceDependencyInAttr(destination, resource.props.href, resource.props['data-precedence'], resource.props);
      writeChunk(destination, arrayCloseBracket);
      nextArrayOpenBrackChunk = arraySubsequentOpenBracket;
      resource.state = LATE;
    }
  });
  writeChunk(destination, arrayCloseBracket);
}

/* Helper functions */
function writeStyleResourceDependencyHrefOnlyInAttr(destination, href) {
  var coercedHref = '' + href;
  writeChunk(destination, stringToChunk(escapeTextForBrowser(JSON.stringify(coercedHref))));
}
function writeStyleResourceDependencyInAttr(destination, href, precedence, props) {
  // eslint-disable-next-line react-internal/safe-string-coercion
  var coercedHref = sanitizeURL('' + href);
  writeChunk(destination, stringToChunk(escapeTextForBrowser(JSON.stringify(coercedHref))));
  var coercedPrecedence = '' + precedence;
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeTextForBrowser(JSON.stringify(coercedPrecedence))));
  for (var propKey in props) {
    if (hasOwnProperty.call(props, propKey)) {
      var propValue = props[propKey];
      if (propValue == null) {
        continue;
      }
      switch (propKey) {
        case 'href':
        case 'rel':
        case 'precedence':
        case 'data-precedence':
          {
            break;
          }
        case 'children':
        case 'dangerouslySetInnerHTML':
          throw new Error('link' + " is a self-closing tag and must neither have `children` nor " + 'use `dangerouslySetInnerHTML`.');
        default:
          writeStyleResourceAttributeInAttr(destination, propKey, propValue);
          break;
      }
    }
  }
  return null;
}
function writeStyleResourceAttributeInAttr(destination, name, value // not null or undefined
) {
  var attributeName = name.toLowerCase();
  var attributeValue;
  switch (typeof value) {
    case 'function':
    case 'symbol':
      return;
  }
  switch (name) {
    // Reserved names
    case 'innerHTML':
    case 'dangerouslySetInnerHTML':
    case 'suppressContentEditableWarning':
    case 'suppressHydrationWarning':
    case 'style':
    case 'ref':
      // Ignored
      return;

    // Attribute renames
    case 'className':
      {
        attributeName = 'class';
        attributeValue = '' + value;
        break;
      }

    // Booleans
    case 'hidden':
      {
        if (value === false) {
          return;
        }
        attributeValue = '';
        break;
      }

    // Santized URLs
    case 'src':
    case 'href':
      {
        value = sanitizeURL(value);
        attributeValue = '' + value;
        break;
      }
    default:
      {
        if (
        // unrecognized event handlers are not SSR'd and we (apparently)
        // use on* as hueristic for these handler props
        name.length > 2 && (name[0] === 'o' || name[0] === 'O') && (name[1] === 'n' || name[1] === 'N')) {
          return;
        }
        if (!isAttributeNameSafe(name)) {
          return;
        }
        attributeValue = '' + value;
      }
  }
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeTextForBrowser(JSON.stringify(attributeName))));
  writeChunk(destination, arrayInterstitial);
  writeChunk(destination, stringToChunk(escapeTextForBrowser(JSON.stringify(attributeValue))));
}

/**
 * Resources
 */

var PENDING$1 = 0;
var PRELOADED = 1;
var PREAMBLE = 2;
var LATE = 3;
function createHoistableState() {
  return {
    styles: new Set(),
    stylesheets: new Set(),
    suspenseyImages: false
  };
}
function getResourceKey(href) {
  return href;
}
function getImageResourceKey(href, imageSrcSet, imageSizes) {
  if (imageSrcSet) {
    return imageSrcSet + '\n' + (imageSizes || '');
  }
  return href;
}

// This function is only safe to call at Request start time since it assumes
// that each module has not already been preloaded. If we find a need to preload
// scripts at any other point in time we will need to check whether the preload
// already exists and not assume it
function preloadBootstrapScriptOrModule(resumableState, renderState, href, props) {
  var key = getResourceKey(href);

  // The href used for bootstrap scripts and bootstrap modules should never be
  // used to preinit the resource. If a script can be preinited then it shouldn't
  // be a bootstrap script/module and if it is a bootstrap script/module then it
  // must not be safe to emit early. To avoid possibly allowing for preinits of
  // bootstrap scripts/modules we occlude these keys.
  resumableState.scriptResources[key] = EXISTS;
  resumableState.moduleScriptResources[key] = EXISTS;
  var resource = [];
  pushLinkImpl(resource, props);
  renderState.bootstrapScripts.add(resource);
}
function internalPreinitScript(resumableState, renderState, src, chunks) {
  var key = getResourceKey(src);
  if (!resumableState.scriptResources.hasOwnProperty(key)) {
    var resource = chunks;
    resumableState.scriptResources[key] = EXISTS;
    renderState.scripts.add(resource);
  }
  return;
}
function preloadAsStylePropsFromProps(href, props) {
  return {
    rel: 'preload',
    as: 'style',
    href: href,
    crossOrigin: props.crossOrigin,
    fetchPriority: props.fetchPriority,
    integrity: props.integrity,
    media: props.media,
    hrefLang: props.hrefLang,
    referrerPolicy: props.referrerPolicy
  };
}
function stylesheetPropsFromRawProps(rawProps) {
  return assign({}, rawProps, {
    'data-precedence': rawProps.precedence,
    precedence: null
  });
}
function adoptPreloadCredentials(target, preloadState) {
  if (target.crossOrigin == null) target.crossOrigin = preloadState[0];
  if (target.integrity == null) target.integrity = preloadState[1];
}
function getPreloadAsHeader(href, as, params) {
  var escapedHref = escapeHrefForLinkHeaderURLContext(href);
  var escapedAs = escapeStringForLinkHeaderQuotedParamValueContext(as);
  var value = "<" + escapedHref + ">; rel=preload; as=\"" + escapedAs + "\"";
  for (var paramName in params) {
    if (hasOwnProperty.call(params, paramName)) {
      // $FlowFixMe[invalid-computed-prop]
      var paramValue = params[paramName];
      if (typeof paramValue === 'string') {
        value += "; " + paramName.toLowerCase() + "=\"" + escapeStringForLinkHeaderQuotedParamValueContext(paramValue) + "\"";
      }
    }
  }
  return value;
}
function getStylesheetPreloadAsHeader(stylesheet) {
  var props = stylesheet.props;
  var preloadOptions = {
    crossOrigin: props.crossOrigin,
    integrity: props.integrity,
    nonce: props.nonce,
    type: props.type,
    fetchPriority: props.fetchPriority,
    referrerPolicy: props.referrerPolicy,
    media: props.media
  };
  return getPreloadAsHeader(props.href, 'style', preloadOptions);
}

// This escaping function is only safe to use for href values being written into
// a "Link" header in between `<` and `>` characters. The primary concern with the href is
// to escape the bounding characters as well as new lines. This is unsafe to use in any other
// context
var regexForHrefInLinkHeaderURLContext = /[<>\r\n]/g;
function escapeHrefForLinkHeaderURLContext(hrefInput) {
  var coercedHref = '' + hrefInput;
  return coercedHref.replace(regexForHrefInLinkHeaderURLContext, escapeHrefForLinkHeaderURLContextReplacer);
}
function escapeHrefForLinkHeaderURLContextReplacer(match) {
  switch (match) {
    case '<':
      return '%3C';
    case '>':
      return '%3E';
    case '\n':
      return '%0A';
    case '\r':
      return '%0D';
    default:
      {
        // eslint-disable-next-line react-internal/prod-error-codes
        throw new Error('escapeLinkHrefForHeaderContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React');
      }
  }
}

// This escaping function is only safe to use for quoted param values in an HTTP header.
// It is unsafe to use for any value not inside quote marks in parater value position.
var regexForLinkHeaderQuotedParamValueContext = /["';,\r\n]/g;
function escapeStringForLinkHeaderQuotedParamValueContext(value, name) {
  var coerced = '' + value;
  return coerced.replace(regexForLinkHeaderQuotedParamValueContext, escapeStringForLinkHeaderQuotedParamValueContextReplacer);
}
function escapeStringForLinkHeaderQuotedParamValueContextReplacer(match) {
  switch (match) {
    case '"':
      return '%22';
    case "'":
      return '%27';
    case ';':
      return '%3B';
    case ',':
      return '%2C';
    case '\n':
      return '%0A';
    case '\r':
      return '%0D';
    default:
      {
        // eslint-disable-next-line react-internal/prod-error-codes
        throw new Error('escapeStringForLinkHeaderQuotedParamValueContextReplacer encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React');
      }
  }
}
function hoistStyleQueueDependency(styleQueue) {
  this.styles.add(styleQueue);
}
function hoistStylesheetDependency(stylesheet) {
  this.stylesheets.add(stylesheet);
}
function hoistHoistables(parentState, childState) {
  childState.styles.forEach(hoistStyleQueueDependency, parentState);
  childState.stylesheets.forEach(hoistStylesheetDependency, parentState);
  if (childState.suspenseyImages) {
    // If the child has suspensey images, the parent now does too if it's inlined.
    // Similarly, if a SuspenseList row has a suspensey image then effectively
    // the next row should be blocked on it as well since the next row can't show
    // earlier. In practice, since the child will be outlined this transferring
    // may never matter but is conceptually correct.
    parentState.suspenseyImages = true;
  }
}

// This function is called at various times depending on whether we are rendering
// or prerendering. In this implementation we only actually emit headers once and
// subsequent calls are ignored. We track whether the request has a completed shell
// to determine whether we will follow headers with a flush including stylesheets.
// In the context of prerrender we don't have a completed shell when the request finishes
// with a postpone in the shell. In the context of a render we don't have a completed shell
// if this is called before the shell finishes rendering which usually will happen anytime
// anything suspends in the shell.
function emitEarlyPreloads(renderState, resumableState, shellComplete) {
  var onHeaders = renderState.onHeaders;
  if (onHeaders) {
    var headers = renderState.headers;
    if (headers) {
      // Even if onHeaders throws we don't want to call this again so
      // we drop the headers state from this point onwards.
      renderState.headers = null;
      var linkHeader = headers.preconnects;
      if (headers.fontPreloads) {
        if (linkHeader) {
          linkHeader += ', ';
        }
        linkHeader += headers.fontPreloads;
      }
      if (headers.highImagePreloads) {
        if (linkHeader) {
          linkHeader += ', ';
        }
        linkHeader += headers.highImagePreloads;
      }
      if (!shellComplete) {
        // We use raw iterators because we want to be able to halt iteration
        // We could refactor renderState to store these dually in arrays to
        // make this more efficient at the cost of additional memory and
        // write overhead. However this code only runs once per request so
        // for now I consider this sufficient.
        var queueIter = renderState.styles.values();
        {
          var _outerBreak = false;
          for (var queueStep = queueIter.next(); headers.remainingCapacity > 0 && !queueStep.done; queueStep = queueIter.next()) {
            var sheets = queueStep.value.sheets;
            var sheetIter = sheets.values();
            for (var sheetStep = sheetIter.next(); headers.remainingCapacity > 0 && !sheetStep.done; sheetStep = sheetIter.next()) {
              var sheet = sheetStep.value;
              var props = sheet.props;
              var key = getResourceKey(props.href);
              var header = getStylesheetPreloadAsHeader(sheet);
              // We mutate the capacity b/c we don't want to keep checking if later headers will fit.
              // This means that a particularly long header might close out the header queue where later
              // headers could still fit. We could in the future alter the behavior here based on prerender vs render
              // since during prerender we aren't as concerned with pure runtime performance.
              if ((headers.remainingCapacity -= header.length + 2) >= 0) {
                renderState.resets.style[key] = PRELOAD_NO_CREDS;
                if (linkHeader) {
                  linkHeader += ', ';
                }
                linkHeader += header;

                // We already track that the resource exists in resumableState however
                // if the resumableState resets because we postponed in the shell
                // which is what is happening in this branch if we are prerendering
                // then we will end up resetting the resumableState. When it resets we
                // want to record the fact that this stylesheet was already preloaded
                renderState.resets.style[key] = typeof props.crossOrigin === 'string' || typeof props.integrity === 'string' ? [props.crossOrigin, props.integrity] : PRELOAD_NO_CREDS;
              } else {
                {
                  _outerBreak = true;
                  break;
                }
              }
            }
            if (_outerBreak) break;
          }
        }
      }
      if (linkHeader) {
        onHeaders({
          Link: linkHeader
        });
      } else {
        // We still call this with no headers because a user may be using it as a signal that
        // it React will not provide any headers
        onHeaders({});
      }
      return;
    }
  }
}

function createRenderState(resumableState, generateStaticMarkup) {
  var renderState = createRenderState$1(resumableState, undefined, undefined, undefined, undefined, undefined);
  return {
    // Keep this in sync with ReactFizzConfigDOM
    placeholderPrefix: renderState.placeholderPrefix,
    segmentPrefix: renderState.segmentPrefix,
    boundaryPrefix: renderState.boundaryPrefix,
    startInlineScript: renderState.startInlineScript,
    startInlineStyle: renderState.startInlineStyle,
    preamble: renderState.preamble,
    externalRuntimeScript: renderState.externalRuntimeScript,
    bootstrapChunks: renderState.bootstrapChunks,
    importMapChunks: renderState.importMapChunks,
    onHeaders: renderState.onHeaders,
    headers: renderState.headers,
    resets: renderState.resets,
    charsetChunks: renderState.charsetChunks,
    viewportChunks: renderState.viewportChunks,
    hoistableChunks: renderState.hoistableChunks,
    preconnects: renderState.preconnects,
    fontPreloads: renderState.fontPreloads,
    highImagePreloads: renderState.highImagePreloads,
    // usedImagePreloads: renderState.usedImagePreloads,
    styles: renderState.styles,
    bootstrapScripts: renderState.bootstrapScripts,
    scripts: renderState.scripts,
    bulkPreloads: renderState.bulkPreloads,
    preloads: renderState.preloads,
    nonce: renderState.nonce,
    stylesToHoist: renderState.stylesToHoist,
    // This is an extra field for the legacy renderer
    generateStaticMarkup: generateStaticMarkup
  };
}

// this chunk is empty on purpose because we do not want to emit the DOCTYPE in legacy mode
var doctypeChunk = stringToPrecomputedChunk('');
function getViewTransitionFormatContext(resumableState, parentContext, update, enter, exit, share, name, autoName // name or an autogenerated unique name
) {
  // ViewTransition reveals are not supported in legacy renders.
  return parentContext;
}
function pushTextInstance(target, text, renderState, textEmbedded) {
  if (renderState.generateStaticMarkup) {
    target.push(stringToChunk(escapeTextForBrowser(text)));
    return false;
  } else {
    return pushTextInstance$1(target, text, renderState, textEmbedded);
  }
}
function pushSegmentFinale(target, renderState, lastPushedText, textEmbedded) {
  if (renderState.generateStaticMarkup) {
    return;
  } else {
    return pushSegmentFinale$1(target, renderState, lastPushedText, textEmbedded);
  }
}
function pushStartActivityBoundary(target, renderState) {
  if (renderState.generateStaticMarkup) {
    // A completed boundary is done and doesn't need a representation in the HTML
    // if we're not going to be hydrating it.
    return;
  }
  pushStartActivityBoundary$1(target);
}
function pushEndActivityBoundary(target, renderState) {
  if (renderState.generateStaticMarkup) {
    return;
  }
  pushEndActivityBoundary$1(target);
}
function writeStartCompletedSuspenseBoundary(destination, renderState) {
  if (renderState.generateStaticMarkup) {
    // A completed boundary is done and doesn't need a representation in the HTML
    // if we're not going to be hydrating it.
    return true;
  }
  return writeStartCompletedSuspenseBoundary$1(destination);
}
function writeStartClientRenderedSuspenseBoundary(destination, renderState,
// flushing these error arguments are not currently supported in this legacy streaming format.
errorDigest, errorMessage, errorStack, errorComponentStack) {
  if (renderState.generateStaticMarkup) {
    // A client rendered boundary is done and doesn't need a representation in the HTML
    // since we'll never hydrate it. This is arguably an error in static generation.
    return true;
  }
  return writeStartClientRenderedSuspenseBoundary$1(destination, renderState, errorDigest);
}
function writeEndCompletedSuspenseBoundary(destination, renderState) {
  if (renderState.generateStaticMarkup) {
    return true;
  }
  return writeEndCompletedSuspenseBoundary$1(destination);
}
function writeEndClientRenderedSuspenseBoundary(destination, renderState) {
  if (renderState.generateStaticMarkup) {
    return true;
  }
  return writeEndClientRenderedSuspenseBoundary$1(destination);
}
function writePreambleStart(destination, resumableState, renderState, skipBlockingShell) {
  return writePreambleStart$1(destination, resumableState, renderState, true // skipBlockingShell
  );
}
function hasSuspenseyContent(hoistableState, flushingInShell) {
  // Never outline.
  return false;
}
var NotPendingTransition = NotPending;

// Keep in sync with ReactServerConsoleConfig
var badgeFormat = '[%s]';
var pad = ' ';
var bind = Function.prototype.bind;
function bindToConsole(methodName, args, badgeName) {
  var offset = 0;
  switch (methodName) {
    case 'dir':
    case 'dirxml':
    case 'groupEnd':
    case 'table':
      {
        // These methods cannot be colorized because they don't take a formatting string.
        // $FlowFixMe
        return bind.apply(console[methodName], [console].concat(args)); // eslint-disable-line react-internal/no-production-logging
      }
    case 'assert':
      {
        // assert takes formatting options as the second argument.
        offset = 1;
      }
  }
  var newArgs = args.slice(0);
  if (typeof newArgs[offset] === 'string') {
    newArgs.splice(offset, 1, badgeFormat + ' ' + newArgs[offset], pad + badgeName + pad);
  } else {
    newArgs.splice(offset, 0, badgeFormat, pad + badgeName + pad);
  }

  // The "this" binding in the "bind";
  newArgs.unshift(console);

  // $FlowFixMe
  return bind.apply(console[methodName], newArgs); // eslint-disable-line react-internal/no-production-logging
}

// Keep in sync with react-reconciler/getComponentNameFromFiber
function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;
  if (displayName) {
    return displayName;
  }
  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
}

// Keep in sync with react-reconciler/getComponentNameFromFiber
function getContextName(type) {
  return type.displayName || 'Context';
}
var REACT_CLIENT_REFERENCE = Symbol.for('react.client.reference');

// Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.
function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }
  if (typeof type === 'function') {
    if (type.$$typeof === REACT_CLIENT_REFERENCE) {
      // TODO: Create a convention for naming client references with debug info.
      return null;
    }
    return type.displayName || type.name || null;
  }
  if (typeof type === 'string') {
    return type;
  }
  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';
    case REACT_PROFILER_TYPE:
      return 'Profiler';
    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';
    case REACT_SUSPENSE_TYPE:
      return 'Suspense';
    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';
    case REACT_ACTIVITY_TYPE:
      return 'Activity';
    case REACT_VIEW_TRANSITION_TYPE:
      {
        return 'ViewTransition';
      }
  }
  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_PORTAL_TYPE:
        return 'Portal';
      case REACT_CONTEXT_TYPE:
        var context = type;
        return getContextName(context);
      case REACT_CONSUMER_TYPE:
        var consumer = type;
        return getContextName(consumer._context) + '.Consumer';
      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');
      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;
        if (outerName !== null) {
          return outerName;
        }
        return getComponentNameFromType(type.type) || 'Memo';
      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;
          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }
    }
  }
  return null;
}

var emptyContextObject = {};

// Used to store the parent path of all context overrides in a shared linked list.
// Forming a reverse tree.

// The structure of a context snapshot is an implementation of this file.
// Currently, it's implemented as tracking the current active node.

var rootContextSnapshot = null;

// We assume that this runtime owns the "current" field on all ReactContext instances.
// This global (actually thread local) state represents what state all those "current",
// fields are currently in.
var currentActiveSnapshot = null;
function popNode(prev) {
  {
    prev.context._currentValue2 = prev.parentValue;
  }
}
function pushNode(next) {
  {
    next.context._currentValue2 = next.value;
  }
}
function popToNearestCommonAncestor(prev, next) {
  if (prev === next) ; else {
    popNode(prev);
    var parentPrev = prev.parent;
    var parentNext = next.parent;
    if (parentPrev === null) {
      if (parentNext !== null) {
        throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
      }
    } else {
      if (parentNext === null) {
        throw new Error('The stacks must reach the root at the same time. This is a bug in React.');
      }
      popToNearestCommonAncestor(parentPrev, parentNext);
    }

    // On the way back, we push the new ones that weren't common.
    pushNode(next);
  }
}
function popAllPrevious(prev) {
  popNode(prev);
  var parentPrev = prev.parent;
  if (parentPrev !== null) {
    popAllPrevious(parentPrev);
  }
}
function pushAllNext(next) {
  var parentNext = next.parent;
  if (parentNext !== null) {
    pushAllNext(parentNext);
  }
  pushNode(next);
}
function popPreviousToCommonLevel(prev, next) {
  popNode(prev);
  var parentPrev = prev.parent;
  if (parentPrev === null) {
    throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
  }
  if (parentPrev.depth === next.depth) {
    // We found the same level. Now we just need to find a shared ancestor.
    popToNearestCommonAncestor(parentPrev, next);
  } else {
    // We must still be deeper.
    popPreviousToCommonLevel(parentPrev, next);
  }
}
function popNextToCommonLevel(prev, next) {
  var parentNext = next.parent;
  if (parentNext === null) {
    throw new Error('The depth must equal at least at zero before reaching the root. This is a bug in React.');
  }
  if (prev.depth === parentNext.depth) {
    // We found the same level. Now we just need to find a shared ancestor.
    popToNearestCommonAncestor(prev, parentNext);
  } else {
    // We must still be deeper.
    popNextToCommonLevel(prev, parentNext);
  }
  pushNode(next);
}

// Perform context switching to the new snapshot.
// To make it cheap to read many contexts, while not suspending, we make the switch eagerly by
// updating all the context's current values. That way reads, always just read the current value.
// At the cost of updating contexts even if they're never read by this subtree.
function switchContext(newSnapshot) {
  // The basic algorithm we need to do is to pop back any contexts that are no longer on the stack.
  // We also need to update any new contexts that are now on the stack with the deepest value.
  // The easiest way to update new contexts is to just reapply them in reverse order from the
  // perspective of the backpointers. To avoid allocating a lot when switching, we use the stack
  // for that. Therefore this algorithm is recursive.
  // 1) First we pop which ever snapshot tree was deepest. Popping old contexts as we go.
  // 2) Then we find the nearest common ancestor from there. Popping old contexts as we go.
  // 3) Then we reapply new contexts on the way back up the stack.
  var prev = currentActiveSnapshot;
  var next = newSnapshot;
  if (prev !== next) {
    if (prev === null) {
      // $FlowFixMe[incompatible-call]: This has to be non-null since it's not equal to prev.
      pushAllNext(next);
    } else if (next === null) {
      popAllPrevious(prev);
    } else if (prev.depth === next.depth) {
      popToNearestCommonAncestor(prev, next);
    } else if (prev.depth > next.depth) {
      popPreviousToCommonLevel(prev, next);
    } else {
      popNextToCommonLevel(prev, next);
    }
    currentActiveSnapshot = next;
  }
}
function pushProvider(context, nextValue) {
  var prevValue;
  {
    prevValue = context._currentValue2;
    context._currentValue2 = nextValue;
  }
  var prevNode = currentActiveSnapshot;
  var newNode = {
    parent: prevNode,
    depth: prevNode === null ? 0 : prevNode.depth + 1,
    context: context,
    parentValue: prevValue,
    value: nextValue
  };
  currentActiveSnapshot = newNode;
  return newNode;
}
function popProvider(context) {
  var prevSnapshot = currentActiveSnapshot;
  if (prevSnapshot === null) {
    throw new Error('Tried to pop a Context at the root of the app. This is a bug in React.');
  }
  {
    var _value = prevSnapshot.parentValue;
    prevSnapshot.context._currentValue2 = _value;
  }
  return currentActiveSnapshot = prevSnapshot.parent;
}
function getActiveContext() {
  return currentActiveSnapshot;
}
function readContext$1(context) {
  var value = context._currentValue2;
  return value;
}

/**
 * `ReactInstanceMap` maintains a mapping from a public facing stateful
 * instance (key) and the internal representation (value). This allows public
 * methods to accept the user facing instance as an argument and map them back
 * to internal methods.
 *
 * Note that this module is currently shared and assumed to be stateless.
 * If this becomes an actual Map, that will break.
 */

function get(key) {
  return key._reactInternals;
}
function set(key, value) {
  key._reactInternals = value;
}

var classComponentUpdater = {
  // $FlowFixMe[missing-local-annot]
  enqueueSetState: function (inst, payload, callback) {
    var internals = get(inst);
    if (internals.queue === null) ; else {
      internals.queue.push(payload);
    }
  },
  enqueueReplaceState: function (inst, payload, callback) {
    var internals = get(inst);
    internals.replace = true;
    internals.queue = [payload];
  },
  // $FlowFixMe[missing-local-annot]
  enqueueForceUpdate: function (inst, callback) {
  }
};
function applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, prevState, nextProps) {
  var partialState = getDerivedStateFromProps(nextProps, prevState);
  // Merge the partial state and the previous state.
  var newState = partialState === null || partialState === undefined ? prevState : assign({}, prevState, partialState);
  return newState;
}
function constructClassInstance(ctor, props, maskedLegacyContext) {
  var context = emptyContextObject;
  var contextType = ctor.contextType;
  if (typeof contextType === 'object' && contextType !== null) {
    context = readContext$1(contextType);
  }
  var instance = new ctor(props, context);
  return instance;
}
function callComponentWillMount(type, instance) {
  var oldState = instance.state;
  if (typeof instance.componentWillMount === 'function') {
    instance.componentWillMount();
  }
  if (typeof instance.UNSAFE_componentWillMount === 'function') {
    instance.UNSAFE_componentWillMount();
  }
  if (oldState !== instance.state) {
    classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  }
}
function processUpdateQueue(internalInstance, inst, props, maskedLegacyContext) {
  if (internalInstance.queue !== null && internalInstance.queue.length > 0) {
    var oldQueue = internalInstance.queue;
    var oldReplace = internalInstance.replace;
    internalInstance.queue = null;
    internalInstance.replace = false;
    if (oldReplace && oldQueue.length === 1) {
      inst.state = oldQueue[0];
    } else {
      var nextState = oldReplace ? oldQueue[0] : inst.state;
      var dontMutate = true;
      for (var i = oldReplace ? 1 : 0; i < oldQueue.length; i++) {
        var partial = oldQueue[i];
        var partialState = typeof partial === 'function' ? partial.call(inst, nextState, props, maskedLegacyContext) : partial;
        if (partialState != null) {
          if (dontMutate) {
            dontMutate = false;
            nextState = assign({}, nextState, partialState);
          } else {
            assign(nextState, partialState);
          }
        }
      }
      inst.state = nextState;
    }
  } else {
    internalInstance.queue = null;
  }
}

// Invokes the mount life-cycles on a previously never rendered instance.
function mountClassInstance(instance, ctor, newProps, maskedLegacyContext) {
  var initialState = instance.state !== undefined ? instance.state : null;
  instance.updater = classComponentUpdater;
  instance.props = newProps;
  instance.state = initialState;
  // We don't bother initializing the refs object on the server, since we're not going to resolve them anyway.

  // The internal instance will be used to manage updates that happen during this mount.
  var internalInstance = {
    queue: [],
    replace: false
  };
  set(instance, internalInstance);
  var contextType = ctor.contextType;
  if (typeof contextType === 'object' && contextType !== null) {
    instance.context = readContext$1(contextType);
  } else {
    instance.context = emptyContextObject;
  }
  var getDerivedStateFromProps = ctor.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === 'function') {
    instance.state = applyDerivedStateFromProps(instance, ctor, getDerivedStateFromProps, initialState, newProps);
  }

  // In order to support react-lifecycles-compat polyfilled components,
  // Unsafe lifecycles should not be invoked for components using the new APIs.
  if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
    callComponentWillMount(ctor, instance);
    // If we had additional state updates during this life-cycle, let's
    // process them now.
    processUpdateQueue(internalInstance, instance, newProps, maskedLegacyContext);
  }
}

// Ids are base 32 strings whose binary representation corresponds to the
// position of a node in a tree.

// Every time the tree forks into multiple children, we add additional bits to
// the left of the sequence that represent the position of the child within the
// current level of children.
//
//      00101       00010001011010101
//      ╰─┬─╯       ╰───────┬───────╯
//   Fork 5 of 20       Parent id
//
// The leading 0s are important. In the above example, you only need 3 bits to
// represent slot 5. However, you need 5 bits to represent all the forks at
// the current level, so we must account for the empty bits at the end.
//
// For this same reason, slots are 1-indexed instead of 0-indexed. Otherwise,
// the zeroth id at a level would be indistinguishable from its parent.
//
// If a node has only one child, and does not materialize an id (i.e. does not
// contain a useId hook), then we don't need to allocate any space in the
// sequence. It's treated as a transparent indirection. For example, these two
// trees produce the same ids:
//
// <>                          <>
//   <Indirection>               <A />
//     <A />                     <B />
//   </Indirection>            </>
//   <B />
// </>
//
// However, we cannot skip any node that materializes an id. Otherwise, a parent
// id that does not fork would be indistinguishable from its child id. For
// example, this tree does not fork, but the parent and child must have
// different ids.
//
// <Parent>
//   <Child />
// </Parent>
//
// To handle this scenario, every time we materialize an id, we allocate a
// new level with a single slot. You can think of this as a fork with only one
// prong, or an array of children with length 1.
//
// It's possible for the size of the sequence to exceed 32 bits, the max
// size for bitwise operations. When this happens, we make more room by
// converting the right part of the id to a string and storing it in an overflow
// variable. We use a base 32 string representation, because 32 is the largest
// power of 2 that is supported by toString(). We want the base to be large so
// that the resulting ids are compact, and we want the base to be a power of 2
// because every log2(base) bits corresponds to a single character, i.e. every
// log2(32) = 5 bits. That means we can lop bits off the end 5 at a time without
// affecting the final result.

var emptyTreeContext = {
  id: 1,
  overflow: ''
};
function getTreeId(context) {
  var overflow = context.overflow;
  var idWithLeadingBit = context.id;
  var id = idWithLeadingBit & ~getLeadingBit(idWithLeadingBit);
  return id.toString(32) + overflow;
}
function pushTreeContext(baseContext, totalChildren, index) {
  var baseIdWithLeadingBit = baseContext.id;
  var baseOverflow = baseContext.overflow;

  // The leftmost 1 marks the end of the sequence, non-inclusive. It's not part
  // of the id; we use it to account for leading 0s.
  var baseLength = getBitLength(baseIdWithLeadingBit) - 1;
  var baseId = baseIdWithLeadingBit & ~(1 << baseLength);
  var slot = index + 1;
  var length = getBitLength(totalChildren) + baseLength;

  // 30 is the max length we can store without overflowing, taking into
  // consideration the leading 1 we use to mark the end of the sequence.
  if (length > 30) {
    // We overflowed the bitwise-safe range. Fall back to slower algorithm.
    // This branch assumes the length of the base id is greater than 5; it won't
    // work for smaller ids, because you need 5 bits per character.
    //
    // We encode the id in multiple steps: first the base id, then the
    // remaining digits.
    //
    // Each 5 bit sequence corresponds to a single base 32 character. So for
    // example, if the current id is 23 bits long, we can convert 20 of those
    // bits into a string of 4 characters, with 3 bits left over.
    //
    // First calculate how many bits in the base id represent a complete
    // sequence of characters.
    var numberOfOverflowBits = baseLength - baseLength % 5;

    // Then create a bitmask that selects only those bits.
    var newOverflowBits = (1 << numberOfOverflowBits) - 1;

    // Select the bits, and convert them to a base 32 string.
    var newOverflow = (baseId & newOverflowBits).toString(32);

    // Now we can remove those bits from the base id.
    var restOfBaseId = baseId >> numberOfOverflowBits;
    var restOfBaseLength = baseLength - numberOfOverflowBits;

    // Finally, encode the rest of the bits using the normal algorithm. Because
    // we made more room, this time it won't overflow.
    var restOfLength = getBitLength(totalChildren) + restOfBaseLength;
    var restOfNewBits = slot << restOfBaseLength;
    var id = restOfNewBits | restOfBaseId;
    var overflow = newOverflow + baseOverflow;
    return {
      id: 1 << restOfLength | id,
      overflow: overflow
    };
  } else {
    // Normal path
    var newBits = slot << baseLength;
    var _id = newBits | baseId;
    var _overflow = baseOverflow;
    return {
      id: 1 << length | _id,
      overflow: _overflow
    };
  }
}
function getBitLength(number) {
  return 32 - clz32(number);
}
function getLeadingBit(id) {
  return 1 << getBitLength(id) - 1;
}

// TODO: Math.clz32 is supported in Node 12+. Maybe we can drop the fallback.
var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;

// Count leading zeros.
// Based on:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32
var log = Math.log;
var LN2 = Math.LN2;
function clz32Fallback(x) {
  var asUint = x >>> 0;
  if (asUint === 0) {
    return 32;
  }
  return 31 - (log(asUint) / LN2 | 0) | 0;
}

// Corresponds to ReactFiberThenable and ReactFlightThenable modules. Generally,
// changes to one module should be reflected in the others.


// An error that is thrown (e.g. by `use`) to trigger Suspense. If we
// detect this is caught by userspace, we'll log a warning in development.
var SuspenseException = new Error("Suspense Exception: This is not a real error! It's an implementation " + 'detail of `use` to interrupt the current render. You must either ' + 'rethrow it immediately, or move the `use` call outside of the ' + '`try/catch` block. Capturing without rethrowing will lead to ' + 'unexpected behavior.\n\n' + 'To handle async errors, wrap your component in an error boundary, or ' + "call the promise's `.catch` method and pass the result to `use`.");
function createThenableState() {
  // The ThenableState is created the first time a component suspends. If it
  // suspends again, we'll reuse the same state.
  return [];
}
function trackUsedThenable(thenableState, thenable, index) {
  var previous = thenableState[index];
  if (previous === undefined) {
    thenableState.push(thenable);
  } else {
    if (previous !== thenable) {
      // Reuse the previous thenable, and drop the new one. We can assume
      // they represent the same value, because components are idempotent.

      // Avoid an unhandled rejection errors for the Promises that we'll
      // intentionally ignore.
      thenable.then(noop, noop);
      thenable = previous;
    }
  }

  // We use an expando to track the status and result of a thenable so that we
  // can synchronously unwrap the value. Think of this as an extension of the
  // Promise API, or a custom interface that is a superset of Thenable.
  //
  // If the thenable doesn't have a status, set it to "pending" and attach
  // a listener that will update its status and result when it resolves.
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

        // Check one more time in case the thenable resolved synchronously
        switch (thenable.status) {
          case 'fulfilled':
            {
              var fulfilledThenable = thenable;
              return fulfilledThenable.value;
            }
          case 'rejected':
            {
              var rejectedThenable = thenable;
              throw rejectedThenable.reason;
            }
        }

        // Suspend.
        //
        // Throwing here is an implementation detail that allows us to unwind the
        // call stack. But we shouldn't allow it to leak into userspace. Throw an
        // opaque placeholder value instead of the actual thenable. If it doesn't
        // get captured by the work loop, log a warning, because that means
        // something in userspace must have caught it.
        suspendedThenable = thenable;
        throw SuspenseException;
      }
  }
}
function readPreviousThenable(thenableState, index) {
  var previous = thenableState[index];
  if (previous === undefined) {
    return undefined;
  } else {
    // We assume this has been resolved already.
    return previous.value;
  }
}

// This is used to track the actual thenable that suspended so it can be
// passed to the rest of the Suspense implementation — which, for historical
// reasons, expects to receive a thenable.
var suspendedThenable = null;
function getSuspendedThenable() {
  // This is called right after `use` suspends by throwing an exception. `use`
  // throws an opaque value instead of the thenable itself so that it can't be
  // caught in userspace. Then the work loop accesses the actual thenable using
  // this function.
  if (suspendedThenable === null) {
    throw new Error('Expected a suspended thenable. This is a bug in React. Please file ' + 'an issue.');
  }
  var thenable = suspendedThenable;
  suspendedThenable = null;
  return thenable;
}

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
  ;
}
var objectIs =
// $FlowFixMe[method-unbinding]
typeof Object.is === 'function' ? Object.is : is;

var currentlyRenderingComponent = null;
var currentlyRenderingTask = null;
var currentlyRenderingRequest = null;
var currentlyRenderingKeyPath = null;
var firstWorkInProgressHook = null;
var workInProgressHook = null;
// Whether the work-in-progress hook is a re-rendered hook
var isReRender = false;
// Whether an update was scheduled during the currently executing render pass.
var didScheduleRenderPhaseUpdate = false;
// Counts the number of useId hooks in this component
var localIdCounter = 0;
// Chunks that should be pushed to the stream once the component
// finishes rendering.
// Counts the number of useActionState calls in this component
var actionStateCounter = 0;
// The index of the useActionState hook that matches the one passed in at the
// root during an MPA navigation, if any.
var actionStateMatchingIndex = -1;
// Counts the number of use(thenable) calls in this component
var thenableIndexCounter = 0;
var thenableState = null;
// Lazily created map of render-phase updates
var renderPhaseUpdates = null;
// Counter to prevent infinite loops.
var numberOfReRenders = 0;
var RE_RENDER_LIMIT = 25;
function resolveCurrentlyRenderingComponent() {
  if (currentlyRenderingComponent === null) {
    throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.');
  }
  return currentlyRenderingComponent;
}
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }
  // $FlowFixMe[incompatible-use] found when upgrading Flow
  for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    if (objectIs(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
function createHook() {
  if (numberOfReRenders > 0) {
    throw new Error('Rendered more hooks than during the previous render');
  }
  return {
    memoizedState: null,
    queue: null,
    next: null
  };
}
function createWorkInProgressHook() {
  if (workInProgressHook === null) {
    // This is the first hook in the list
    if (firstWorkInProgressHook === null) {
      isReRender = false;
      firstWorkInProgressHook = workInProgressHook = createHook();
    } else {
      // There's already a work-in-progress. Reuse it.
      isReRender = true;
      workInProgressHook = firstWorkInProgressHook;
    }
  } else {
    if (workInProgressHook.next === null) {
      isReRender = false;
      // Append to the end of the list
      workInProgressHook = workInProgressHook.next = createHook();
    } else {
      // There's already a work-in-progress. Reuse it.
      isReRender = true;
      workInProgressHook = workInProgressHook.next;
    }
  }
  return workInProgressHook;
}
function prepareToUseHooks(request, task, keyPath, componentIdentity, prevThenableState) {
  currentlyRenderingComponent = componentIdentity;
  currentlyRenderingTask = task;
  currentlyRenderingRequest = request;
  currentlyRenderingKeyPath = keyPath;

  // The following should have already been reset
  // didScheduleRenderPhaseUpdate = false;
  // firstWorkInProgressHook = null;
  // numberOfReRenders = 0;
  // renderPhaseUpdates = null;
  // workInProgressHook = null;

  localIdCounter = 0;
  actionStateCounter = 0;
  actionStateMatchingIndex = -1;
  thenableIndexCounter = 0;
  thenableState = prevThenableState;
}
function prepareToUseThenableState(prevThenableState) {
  thenableIndexCounter = 0;
  thenableState = prevThenableState;
}
function finishHooks(Component, props, children, refOrContext) {
  // This must be called after every function component to prevent hooks from
  // being used in classes.

  while (didScheduleRenderPhaseUpdate) {
    // Updates were scheduled during the render phase. They are stored in
    // the `renderPhaseUpdates` map. Call the component again, reusing the
    // work-in-progress hooks and applying the additional updates on top. Keep
    // restarting until no more updates are scheduled.
    didScheduleRenderPhaseUpdate = false;
    localIdCounter = 0;
    actionStateCounter = 0;
    actionStateMatchingIndex = -1;
    thenableIndexCounter = 0;
    numberOfReRenders += 1;

    // Start over from the beginning of the list
    workInProgressHook = null;
    children = Component(props, refOrContext);
  }
  resetHooksState();
  return children;
}
function getThenableStateAfterSuspending() {
  var state = thenableState;
  thenableState = null;
  return state;
}
function checkDidRenderIdHook() {
  // This should be called immediately after every finishHooks call.
  // Conceptually, it's part of the return value of finishHooks; it's only a
  // separate function to avoid using an array tuple.
  var didRenderIdHook = localIdCounter !== 0;
  return didRenderIdHook;
}
function getActionStateCount() {
  // This should be called immediately after every finishHooks call.
  // Conceptually, it's part of the return value of finishHooks; it's only a
  // separate function to avoid using an array tuple.
  return actionStateCounter;
}
function getActionStateMatchingIndex() {
  // This should be called immediately after every finishHooks call.
  // Conceptually, it's part of the return value of finishHooks; it's only a
  // separate function to avoid using an array tuple.
  return actionStateMatchingIndex;
}

// Reset the internal hooks state if an error occurs while rendering a component
function resetHooksState() {
  currentlyRenderingComponent = null;
  currentlyRenderingTask = null;
  currentlyRenderingRequest = null;
  currentlyRenderingKeyPath = null;
  didScheduleRenderPhaseUpdate = false;
  firstWorkInProgressHook = null;
  numberOfReRenders = 0;
  renderPhaseUpdates = null;
  workInProgressHook = null;
}
function readContext(context) {
  return readContext$1(context);
}
function useContext(context) {
  resolveCurrentlyRenderingComponent();
  return readContext$1(context);
}
function basicStateReducer(state, action) {
  // $FlowFixMe[incompatible-use]: Flow doesn't like mixed types
  return typeof action === 'function' ? action(state) : action;
}
function useState(initialState) {
  return useReducer(basicStateReducer,
  // useReducer has a special case to support lazy useState initializers
  initialState);
}
function useReducer(reducer, initialArg, init) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  if (isReRender) {
    // This is a re-render. Apply the new render phase updates to the previous
    // current hook.
    var queue = workInProgressHook.queue;
    var dispatch = queue.dispatch;
    if (renderPhaseUpdates !== null) {
      // Render phase updates are stored in a map of queue -> linked list
      var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
      if (firstRenderPhaseUpdate !== undefined) {
        // $FlowFixMe[incompatible-use] found when upgrading Flow
        renderPhaseUpdates.delete(queue);
        // $FlowFixMe[incompatible-use] found when upgrading Flow
        var newState = workInProgressHook.memoizedState;
        var update = firstRenderPhaseUpdate;
        do {
          // Process this render phase update. We don't have to check the
          // priority because it will always be the same as the current
          // render's.
          var action = update.action;
          newState = reducer(newState, action);
          // $FlowFixMe[incompatible-type] we bail out when we get a null
          update = update.next;
        } while (update !== null);

        // $FlowFixMe[incompatible-use] found when upgrading Flow
        workInProgressHook.memoizedState = newState;
        return [newState, dispatch];
      }
    }
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    return [workInProgressHook.memoizedState, dispatch];
  } else {
    var initialState;
    if (reducer === basicStateReducer) {
      // Special case for `useState`.
      initialState = typeof initialArg === 'function' ? initialArg() : initialArg;
    } else {
      initialState = init !== undefined ? init(initialArg) : initialArg;
    }
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    workInProgressHook.memoizedState = initialState;
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    var _queue = workInProgressHook.queue = {
      last: null,
      dispatch: null
    };
    var _dispatch = _queue.dispatch = dispatchAction.bind(null, currentlyRenderingComponent, _queue);
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    return [workInProgressHook.memoizedState, _dispatch];
  }
}
function useMemo(nextCreate, deps) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  var nextDeps = deps === undefined ? null : deps;
  if (workInProgressHook !== null) {
    var prevState = workInProgressHook.memoizedState;
    if (prevState !== null) {
      if (nextDeps !== null) {
        var prevDeps = prevState[1];
        if (areHookInputsEqual(nextDeps, prevDeps)) {
          return prevState[0];
        }
      }
    }
  }
  var nextValue = nextCreate();
  // $FlowFixMe[incompatible-use] found when upgrading Flow
  workInProgressHook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
function useRef(initialValue) {
  currentlyRenderingComponent = resolveCurrentlyRenderingComponent();
  workInProgressHook = createWorkInProgressHook();
  var previousRef = workInProgressHook.memoizedState;
  if (previousRef === null) {
    var ref = {
      current: initialValue
    };
    // $FlowFixMe[incompatible-use] found when upgrading Flow
    workInProgressHook.memoizedState = ref;
    return ref;
  } else {
    return previousRef;
  }
}
function dispatchAction(componentIdentity, queue, action) {
  if (numberOfReRenders >= RE_RENDER_LIMIT) {
    throw new Error('Too many re-renders. React limits the number of renders to prevent ' + 'an infinite loop.');
  }
  if (componentIdentity === currentlyRenderingComponent) {
    // This is a render phase update. Stash it in a lazily-created map of
    // queue -> linked list of updates. After this render pass, we'll restart
    // and apply the stashed updates on top of the work-in-progress hook.
    didScheduleRenderPhaseUpdate = true;
    var update = {
      action: action,
      next: null
    };
    if (renderPhaseUpdates === null) {
      renderPhaseUpdates = new Map();
    }
    var firstRenderPhaseUpdate = renderPhaseUpdates.get(queue);
    if (firstRenderPhaseUpdate === undefined) {
      // $FlowFixMe[incompatible-use] found when upgrading Flow
      renderPhaseUpdates.set(queue, update);
    } else {
      // Append the update to the end of the list.
      var lastRenderPhaseUpdate = firstRenderPhaseUpdate;
      while (lastRenderPhaseUpdate.next !== null) {
        lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      }
      lastRenderPhaseUpdate.next = update;
    }
  }
}
function useCallback(callback, deps) {
  return useMemo(function () {
    return callback;
  }, deps);
}
function throwOnUseEffectEventCall() {
  throw new Error("A function wrapped in useEffectEvent can't be called during rendering.");
}
function useEffectEvent(callback) {
  // $FlowIgnore[incompatible-return]
  return throwOnUseEffectEventCall;
}
function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  if (getServerSnapshot === undefined) {
    throw new Error('Missing getServerSnapshot, which is required for ' + 'server-rendered content. Will revert to client rendering.');
  }
  return getServerSnapshot();
}
function useDeferredValue(value, initialValue) {
  resolveCurrentlyRenderingComponent();
  return initialValue !== undefined ? initialValue : value;
}
function unsupportedStartTransition() {
  throw new Error('startTransition cannot be called during server rendering.');
}
function useTransition() {
  resolveCurrentlyRenderingComponent();
  return [false, unsupportedStartTransition];
}
function useHostTransitionStatus() {
  resolveCurrentlyRenderingComponent();
  return NotPendingTransition;
}
function unsupportedSetOptimisticState() {
  throw new Error('Cannot update optimistic state while rendering.');
}
function useOptimistic(passthrough, reducer) {
  resolveCurrentlyRenderingComponent();
  return [passthrough, unsupportedSetOptimisticState];
}
function createPostbackActionStateKey(permalink, componentKeyPath, hookIndex) {
  if (permalink !== undefined) {
    // Don't bother to hash a permalink-based key since it's already short.
    return 'p' + permalink;
  } else {
    // Append a node to the key path that represents the form state hook.
    var keyPath = [componentKeyPath, null, hookIndex];
    // Key paths are hashed to reduce the size. It does not need to be secure,
    // and it's more important that it's fast than that it's completely
    // collision-free.
    var keyPathHash = createFastHashJS(JSON.stringify(keyPath));
    return 'k' + keyPathHash;
  }
}
function useActionState(action, initialState, permalink) {
  resolveCurrentlyRenderingComponent();

  // Count the number of useActionState hooks per component. We also use this to
  // track the position of this useActionState hook relative to the other ones in
  // this component, so we can generate a unique key for each one.
  var actionStateHookIndex = actionStateCounter++;
  var request = currentlyRenderingRequest;

  // $FlowIgnore[prop-missing]
  var formAction = action.$$FORM_ACTION;
  if (typeof formAction === 'function') {
    // This is a server action. These have additional features to enable
    // MPA-style form submissions with progressive enhancement.

    // TODO: If the same permalink is passed to multiple useActionStates, and
    // they all have the same action signature, Fizz will pass the postback
    // state to all of them. We should probably only pass it to the first one,
    // and/or warn.

    // The key is lazily generated and deduped so the that the keypath doesn't
    // get JSON.stringify-ed unnecessarily, and at most once.
    var nextPostbackStateKey = null;

    // Determine the current form state. If we received state during an MPA form
    // submission, then we will reuse that, if the action identity matches.
    // Otherwise, we'll use the initial state argument. We will emit a comment
    // marker into the stream that indicates whether the state was reused.
    var state = initialState;
    var componentKeyPath = currentlyRenderingKeyPath;
    var postbackActionState = getFormState(request);
    // $FlowIgnore[prop-missing]
    var isSignatureEqual = action.$$IS_SIGNATURE_EQUAL;
    if (postbackActionState !== null && typeof isSignatureEqual === 'function') {
      var postbackKey = postbackActionState[1];
      var postbackReferenceId = postbackActionState[2];
      var postbackBoundArity = postbackActionState[3];
      if (isSignatureEqual.call(action, postbackReferenceId, postbackBoundArity)) {
        nextPostbackStateKey = createPostbackActionStateKey(permalink, componentKeyPath, actionStateHookIndex);
        if (postbackKey === nextPostbackStateKey) {
          // This was a match
          actionStateMatchingIndex = actionStateHookIndex;
          // Reuse the state that was submitted by the form.
          state = postbackActionState[0];
        }
      }
    }

    // Bind the state to the first argument of the action.
    var boundAction = action.bind(null, state);

    // Wrap the action so the return value is void.
    var dispatch = function (payload) {
      boundAction(payload);
    };

    // $FlowIgnore[prop-missing]
    if (typeof boundAction.$$FORM_ACTION === 'function') {
      // $FlowIgnore[prop-missing]
      dispatch.$$FORM_ACTION = function (prefix) {
        var metadata = boundAction.$$FORM_ACTION(prefix);

        // Override the action URL
        if (permalink !== undefined) {
          permalink += '';
          metadata.action = permalink;
        }
        var formData = metadata.data;
        if (formData) {
          if (nextPostbackStateKey === null) {
            nextPostbackStateKey = createPostbackActionStateKey(permalink, componentKeyPath, actionStateHookIndex);
          }
          formData.append('$ACTION_KEY', nextPostbackStateKey);
        }
        return metadata;
      };
    }
    return [state, dispatch, false];
  } else {
    // This is not a server action, so the implementation is much simpler.

    // Bind the state to the first argument of the action.
    var _boundAction = action.bind(null, initialState);
    // Wrap the action so the return value is void.
    var _dispatch2 = function (payload) {
      _boundAction(payload);
    };
    return [initialState, _dispatch2, false];
  }
}
function useId() {
  var task = currentlyRenderingTask;
  var treeId = getTreeId(task.treeContext);
  var resumableState = currentResumableState;
  if (resumableState === null) {
    throw new Error('Invalid hook call. Hooks can only be called inside of the body of a function component.');
  }
  var localId = localIdCounter++;
  return makeId(resumableState, treeId, localId);
}
function use(usable) {
  if (usable !== null && typeof usable === 'object') {
    // $FlowFixMe[method-unbinding]
    if (typeof usable.then === 'function') {
      // This is a thenable.
      var thenable = usable;
      return unwrapThenable(thenable);
    } else if (usable.$$typeof === REACT_CONTEXT_TYPE) {
      var context = usable;
      return readContext(context);
    }
  }

  // eslint-disable-next-line react-internal/safe-string-coercion
  throw new Error('An unsupported type was passed to use(): ' + String(usable));
}
function unwrapThenable(thenable) {
  var index = thenableIndexCounter;
  thenableIndexCounter += 1;
  if (thenableState === null) {
    thenableState = createThenableState();
  }
  return trackUsedThenable(thenableState, thenable, index);
}
function readPreviousThenableFromState() {
  var index = thenableIndexCounter;
  thenableIndexCounter += 1;
  if (thenableState === null) {
    return undefined;
  }
  return readPreviousThenable(thenableState, index);
}
function unsupportedRefresh() {
  throw new Error('Cache cannot be refreshed during server rendering.');
}
function useCacheRefresh() {
  return unsupportedRefresh;
}
function useMemoCache(size) {
  var data = new Array(size);
  for (var i = 0; i < size; i++) {
    data[i] = REACT_MEMO_CACHE_SENTINEL;
  }
  return data;
}
var HooksDispatcher = {
  readContext: readContext,
  use: use,
  useContext: useContext,
  useMemo: useMemo,
  useReducer: useReducer,
  useRef: useRef,
  useState: useState,
  useInsertionEffect: noop,
  useLayoutEffect: noop,
  useCallback: useCallback,
  // useImperativeHandle is not run in the server environment
  useImperativeHandle: noop,
  // Effects are not run in the server environment.
  useEffect: noop,
  // Debugging effect
  useDebugValue: noop,
  useDeferredValue: useDeferredValue,
  useTransition: useTransition,
  useId: useId,
  // Subscriptions are not setup in a server environment.
  useSyncExternalStore: useSyncExternalStore,
  useOptimistic: useOptimistic,
  useActionState: useActionState,
  useFormState: useActionState,
  useHostTransitionStatus: useHostTransitionStatus,
  useMemoCache: useMemoCache,
  useCacheRefresh: useCacheRefresh,
  useEffectEvent: useEffectEvent
} ;
var currentResumableState = null;
function setCurrentResumableState(resumableState) {
  currentResumableState = resumableState;
}

function getCacheForType(resourceType) {
  throw new Error('Not implemented.');
}
function cacheSignal() {
  throw new Error('Not implemented.');
}
var DefaultAsyncDispatcher = {
  getCacheForType: getCacheForType,
  cacheSignal: cacheSignal
};

// This is forked in server builds where the default stack frame may be source mapped.

var DefaultPrepareStackTrace = undefined;

function formatOwnerStack(error) {
  var prevPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = DefaultPrepareStackTrace;
  var stack = error.stack;
  Error.prepareStackTrace = prevPrepareStackTrace;
  if (stack.startsWith('Error: react-stack-top-frame\n')) {
    // V8's default formatting prefixes with the error message which we
    // don't want/need.
    stack = stack.slice(29);
  }
  var idx = stack.indexOf('\n');
  if (idx !== -1) {
    // Pop the JSX frame.
    stack = stack.slice(idx + 1);
  }
  idx = stack.indexOf('react_stack_bottom_frame');
  if (idx !== -1) {
    idx = stack.lastIndexOf('\n', idx);
  }
  if (idx !== -1) {
    // Cut off everything after the bottom frame since it'll be internals.
    stack = stack.slice(0, idx);
  } else {
    // We didn't find any internal callsite out to user space.
    // This means that this was called outside an owner or the owner is fully internal.
    // To keep things light we exclude the entire trace in this case.
    return '';
  }
  return stack;
}

var prefix;
var suffix;
function describeBuiltInComponentFrame(name) {
  if (prefix === undefined) {
    // Extract the VM specific prefix used by each line.
    try {
      throw Error();
    } catch (x) {
      var match = x.stack.trim().match(/\n( *(at )?)/);
      prefix = match && match[1] || '';
      suffix = x.stack.indexOf('\n    at') > -1 ?
      // V8
      ' (<anonymous>)' :
      // JSC/Spidermonkey
      x.stack.indexOf('@') > -1 ? '@unknown:0:0' :
      // Other
      '';
    }
  }
  // We use the prefix to ensure our stacks line up with native stack frames.
  return '\n' + prefix + name + suffix;
}
function describeDebugInfoFrame(name, env, location) {
  if (location != null) {
    // If we have a location, it's the child's owner stack. Treat the bottom most frame as
    // the location of this function.
    var childStack = formatOwnerStack(location);
    var idx = childStack.lastIndexOf('\n');
    var lastLine = idx === -1 ? childStack : childStack.slice(idx + 1);
    if (lastLine.indexOf(name) !== -1) {
      // For async stacks it's possible we don't have the owner on it. As a precaution only
      // use this frame if it has the name of the function in it.
      return '\n' + lastLine;
    }
  }
  return describeBuiltInComponentFrame(name + (env ? ' [' + env + ']' : ''));
}
var reentry = false;
var componentFrameCache;

/**
 * Leverages native browser/VM stack frames to get proper details (e.g.
 * filename, line + col number) for a single component in a component stack. We
 * do this by:
 *   (1) throwing and catching an error in the function - this will be our
 *       control error.
 *   (2) calling the component which will eventually throw an error that we'll
 *       catch - this will be our sample error.
 *   (3) diffing the control and sample error stacks to find the stack frame
 *       which represents our component.
 */
function describeNativeComponentFrame(fn, construct) {
  // If something asked for a stack inside a fake render, it should get ignored.
  if (!fn || reentry) {
    return '';
  }
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = DefaultPrepareStackTrace;
  try {
    /**
     * Finding a common stack frame between sample and control errors can be
     * tricky given the different types and levels of stack trace truncation from
     * different JS VMs. So instead we'll attempt to control what that common
     * frame should be through this object method:
     * Having both the sample and control errors be in the function under the
     * `DescribeNativeComponentFrameRoot` property, + setting the `name` and
     * `displayName` properties of the function ensures that a stack
     * frame exists that has the method name `DescribeNativeComponentFrameRoot` in
     * it for both control and sample stacks.
     */
    var RunInRootFrame = {
      DetermineComponentFrameRoot: function () {
        var control;
        try {
          // This should throw.
          if (construct) {
            // Something should be setting the props in the constructor.
            var Fake = function () {
              throw Error();
            };
            // $FlowFixMe[prop-missing]
            Object.defineProperty(Fake.prototype, 'props', {
              set: function () {
                // We use a throwing setter instead of frozen or non-writable props
                // because that won't throw in a non-strict mode function.
                throw Error();
              }
            });
            if (typeof Reflect === 'object' && Reflect.construct) {
              // We construct a different control for this case to include any extra
              // frames added by the construct call.
              try {
                Reflect.construct(Fake, []);
              } catch (x) {
                control = x;
              }
              Reflect.construct(fn, [], Fake);
            } else {
              try {
                Fake.call();
              } catch (x) {
                control = x;
              }
              var prototypeModified = false;
              var prevProps;
              try {
                prevProps = Object.getOwnPropertyDescriptor(fn.prototype, 'props');
                Object.defineProperty(fn.prototype, 'props', {
                  configurable: true,
                  set: function () {
                    throw Error();
                  }
                });
                prototypeModified = true;

                // eslint-disable-next-line no-new
                new fn();
              } finally {
                if (prototypeModified) {
                  if (prevProps !== undefined) {
                    Object.defineProperty(fn.prototype, 'props', prevProps);
                  } else {
                    delete fn.prototype.props;
                  }
                }
              }
            }
          } else {
            try {
              throw Error();
            } catch (x) {
              control = x;
            }
            // TODO(luna): This will currently only throw if the function component
            // tries to access React/ReactDOM/props. We should probably make this throw
            // in simple components too
            var maybePromise = fn();

            // If the function component returns a promise, it's likely an async
            // component, which we don't yet support. Attach a noop catch handler to
            // silence the error.
            // TODO: Implement component stacks for async client components?
            if (maybePromise && typeof maybePromise.catch === 'function') {
              maybePromise.catch(function () {});
            }
          }
        } catch (sample) {
          // This is inlined manually because closure doesn't do it for us.
          if (sample && control && typeof sample.stack === 'string') {
            return [sample.stack, control.stack];
          }
        }
        return [null, null];
      }
    };
    // $FlowFixMe[prop-missing]
    RunInRootFrame.DetermineComponentFrameRoot.displayName = 'DetermineComponentFrameRoot';
    var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, 'name');
    // Before ES6, the `name` property was not configurable.
    if (namePropDescriptor && namePropDescriptor.configurable) {
      // V8 utilizes a function's `name` property when generating a stack trace.
      Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot,
      // Configurable properties can be updated even if its writable descriptor
      // is set to `false`.
      // $FlowFixMe[cannot-write]
      'name', {
        value: 'DetermineComponentFrameRoot'
      });
    }
    var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(),
      sampleStack = _RunInRootFrame$Deter[0],
      controlStack = _RunInRootFrame$Deter[1];
    if (sampleStack && controlStack) {
      // This extracts the first frame from the sample that isn't also in the control.
      // Skipping one frame that we assume is the frame that calls the two.
      var sampleLines = sampleStack.split('\n');
      var controlLines = controlStack.split('\n');
      var s = 0;
      var c = 0;
      while (s < sampleLines.length && !sampleLines[s].includes('DetermineComponentFrameRoot')) {
        s++;
      }
      while (c < controlLines.length && !controlLines[c].includes('DetermineComponentFrameRoot')) {
        c++;
      }
      // We couldn't find our intentionally injected common root frame, attempt
      // to find another common root frame by search from the bottom of the
      // control stack...
      if (s === sampleLines.length || c === controlLines.length) {
        s = sampleLines.length - 1;
        c = controlLines.length - 1;
        while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
          // We expect at least one stack frame to be shared.
          // Typically this will be the root most one. However, stack frames may be
          // cut off due to maximum stack limits. In this case, one maybe cut off
          // earlier than the other. We assume that the sample is longer or the same
          // and there for cut off earlier. So we should find the root most frame in
          // the sample somewhere in the control.
          c--;
        }
      }
      for (; s >= 1 && c >= 0; s--, c--) {
        // Next we find the first one that isn't the same which should be the
        // frame that called our sample function and the control.
        if (sampleLines[s] !== controlLines[c]) {
          // In V8, the first line is describing the message but other VMs don't.
          // If we're about to return the first line, and the control is also on the same
          // line, that's a pretty good indicator that our sample threw at same line as
          // the control. I.e. before we entered the sample frame. So we ignore this result.
          // This can happen if you passed a class to function component, or non-function.
          if (s !== 1 || c !== 1) {
            do {
              s--;
              c--;
              // We may still have similar intermediate frames from the construct call.
              // The next one that isn't the same should be our match though.
              if (c < 0 || sampleLines[s] !== controlLines[c]) {
                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at ');

                // If our component frame is labeled "<anonymous>"
                // but we have a user-provided "displayName"
                // splice it in to make the stack more readable.
                if (fn.displayName && _frame.includes('<anonymous>')) {
                  _frame = _frame.replace('<anonymous>', fn.displayName);
                }
                if (false) ;
                // Return the line we found.
                return _frame;
              }
            } while (s >= 1 && c >= 0);
          }
          break;
        }
      }
    }
  } finally {
    reentry = false;
    Error.prepareStackTrace = previousPrepareStackTrace;
  }
  // Fallback to just using the name if we couldn't make it throw.
  var name = fn ? fn.displayName || fn.name : '';
  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';
  return syntheticFrame;
}
function describeClassComponentFrame(ctor) {
  return describeNativeComponentFrame(ctor, true);
}
function describeFunctionComponentFrame(fn) {
  return describeNativeComponentFrame(fn, false);
}

function shouldConstruct$1(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}
function describeComponentStackByType(type) {
  if (typeof type === 'string') {
    return describeBuiltInComponentFrame(type);
  }
  if (typeof type === 'function') {
    if (shouldConstruct$1(type)) {
      return describeClassComponentFrame(type);
    } else {
      return describeFunctionComponentFrame(type);
    }
  }
  if (typeof type === 'object' && type !== null) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        {
          return describeFunctionComponentFrame(type.render);
        }
      case REACT_MEMO_TYPE:
        {
          return describeFunctionComponentFrame(type.type);
        }
      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;
          try {
            type = init(payload);
          } catch (x) {
            // TODO: When we support Thenables as component types we should rename this.
            return describeBuiltInComponentFrame('Lazy');
          }
          return describeComponentStackByType(type);
        }
    }
    if (typeof type.name === 'string') {
      return describeDebugInfoFrame(type.name, type.env, type.debugLocation);
    }
  }
  switch (type) {
    case REACT_SUSPENSE_LIST_TYPE:
      {
        return describeBuiltInComponentFrame('SuspenseList');
      }
    case REACT_SUSPENSE_TYPE:
      {
        return describeBuiltInComponentFrame('Suspense');
      }
    case REACT_VIEW_TRANSITION_TYPE:
      {
        return describeBuiltInComponentFrame('ViewTransition');
      }
  }
  return '';
}
function getStackByComponentStackNode(componentStack) {
  try {
    var info = '';
    var node = componentStack;
    do {
      info += describeComponentStackByType(node.type);
      // $FlowFixMe[incompatible-type] we bail out when we get a null
      node = node.parent;
    } while (node);
    return info;
  } catch (x) {
    return '\nError generating stack: ' + x.message + '\n' + x.stack;
  }
}

function getViewTransitionName(props, treeContext, resumableState) {
  if (props.name != null && props.name !== 'auto') {
    return props.name;
  }
  var treeId = getTreeId(treeContext);
  return makeId(resumableState, treeId, 0);
}

// Linked list representing the identity of a component given the component/tag name and key.
// The name might be minified but we assume that it's going to be the same generated name. Typically
// because it's just the same compiled output in practice.

// resume with segmentID at the index

var CLIENT_RENDERED = 4; // if it errors or infinitely suspends

var PENDING = 0;
var COMPLETED = 1;
var FLUSHED = 2;
var ABORTED = 3;
var ERRORED = 4;
var POSTPONED = 5;
var RENDERING = 6;
var OPENING = 10;
var OPEN = 11;
var ABORTING = 12;
var CLOSING = 13;
var CLOSED = 14;

// This is a default heuristic for how to split up the HTML content into progressive
// loading. Our goal is to be able to display additional new content about every 500ms.
// Faster than that is unnecessary and should be throttled on the client. It also
// adds unnecessary overhead to do more splits. We don't know if it's a higher or lower
// end device but higher end suffer less from the overhead than lower end does from
// not getting small enough pieces. We error on the side of low end.
// We base this on low end 3G speeds which is about 500kbits per second. We assume
// that there can be a reasonable drop off from max bandwidth which leaves you with
// as little as 80%. We can receive half of that each 500ms - at best. In practice,
// a little bandwidth is lost to processing and contention - e.g. CSS and images that
// are downloaded along with the main content. So we estimate about half of that to be
// the lower end throughput. In other words, we expect that you can at least show
// about 12.5kb of content per 500ms. Not counting starting latency for the first
// paint.
// 500 * 1024 / 8 * .8 * 0.5 / 2
var DEFAULT_PROGRESSIVE_CHUNK_SIZE = 12800;
function getBlockingRenderMaxSize(request) {
  // We want to make sure that we can block the reveal of a well designed complete
  // shell but if you have constructed a too large shell (e.g. by not adding any
  // Suspense boundaries) then that might take too long to render. We shouldn't
  // punish users (or overzealous metrics tracking) in that scenario.
  // There's a trade off here. If this limit is too low then you can't fit a
  // reasonably well built UI within it without getting errors. If it's too high
  // then things that accidentally fall below it might take too long to load.
  // Web Vitals target 1.8 seconds for first paint and our goal to have the limit
  // be fast enough to hit that. For this argument we assume that most external
  // resources are already cached because it's a return visit, or inline styles.
  // If it's not, then it's highly unlikely that any render blocking instructions
  // we add has any impact what so ever on the paint.
  // Assuming a first byte of about 600ms which is kind of bad but common with a
  // decent static host. If it's longer e.g. due to dynamic rendering, then you
  // are going to bound by dynamic production of the content and you're better off
  // with Suspense boundaries anyway. This number doesn't matter much. Then you
  // have about 1.2 seconds left for bandwidth. On 3G that gives you about 112.5kb
  // worth of data. That's worth about 10x in terms of uncompressed bytes. Then we
  // half that just to account for longer latency, slower bandwidth and CPU processing.
  // Now we're down to about 500kb. In fact, looking at metrics we've collected with
  // rel="expect" examples and other documents, the impact on documents smaller than
  // that is within the noise. That's because there's enough happening within that
  // start up to not make HTML streaming not significantly better.
  // Content above the fold tends to be about 100-200kb tops. Therefore 500kb should
  // be enough head room for a good loading state. After that you should use
  // Suspense or SuspenseList to improve it.
  // Since this is highly related to the reason you would adjust the
  // progressiveChunkSize option, and always has to be higher, we define this limit
  // in terms of it. So if you want to increase the limit because you have high
  // bandwidth users, then you can adjust it up. If you are concerned about even
  // slower bandwidth then you can adjust it down.
  return request.progressiveChunkSize * 40; // 512kb by default.
}
function isEligibleForOutlining(request, boundary) {
  // For very small boundaries, don't bother producing a fallback for outlining.
  // The larger this limit is, the more we can save on preparing fallbacks in case we end up
  // outlining.
  return (boundary.byteSize > 500 || hasSuspenseyContent() || boundary.defer) &&
  // For boundaries that can possibly contribute to the preamble we don't want to outline
  // them regardless of their size since the fallbacks should only be emitted if we've
  // errored the boundary.
  boundary.preamble === null;
}
function defaultErrorHandler(error) {
  if (typeof error === 'object' && error !== null && typeof error.environmentName === 'string') {
    // This was a Server error. We print the environment name in a badge just like we do with
    // replays of console logs to indicate that the source of this throw as actually the Server.
    bindToConsole('error', [error], error.environmentName)();
  } else {
    console['error'](error); // Don't transform to our wrapper
  }
  return null;
}
function RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, formState) {
  var pingedTasks = [];
  var abortSet = new Set();
  this.destination = null;
  this.flushScheduled = false;
  this.resumableState = resumableState;
  this.renderState = renderState;
  this.rootFormatContext = rootFormatContext;
  this.progressiveChunkSize = progressiveChunkSize === undefined ? DEFAULT_PROGRESSIVE_CHUNK_SIZE : progressiveChunkSize;
  this.status = OPENING;
  this.fatalError = null;
  this.nextSegmentId = 0;
  this.allPendingTasks = 0;
  this.pendingRootTasks = 0;
  this.completedRootSegment = null;
  this.completedPreambleSegments = null;
  this.byteSize = 0;
  this.abortableTasks = abortSet;
  this.pingedTasks = pingedTasks;
  this.clientRenderedBoundaries = [];
  this.completedBoundaries = [];
  this.partialBoundaries = [];
  this.trackedPostpones = null;
  this.onError = onError === undefined ? defaultErrorHandler : onError;
  this.onAllReady = onAllReady === undefined ? noop : onAllReady;
  this.onShellReady = onShellReady === undefined ? noop : onShellReady;
  this.onShellError = onShellError === undefined ? noop : onShellError;
  this.onFatalError = onFatalError === undefined ? noop : onFatalError;
  this.formState = formState === undefined ? null : formState;
}
function createRequest(children, resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, formState) {

  // $FlowFixMe[invalid-constructor]: the shapes are exact here but Flow doesn't like constructors
  var request = new RequestInstance(resumableState, renderState, rootFormatContext, progressiveChunkSize, onError, onAllReady, onShellReady, onShellError, onFatalError, formState);

  // This segment represents the root fallback.
  var rootSegment = createPendingSegment(request, 0, null, rootFormatContext,
  // Root segments are never embedded in Text on either edge
  false, false);
  // There is no parent so conceptually, we're unblocked to flush this segment.
  rootSegment.parentFlushed = true;
  var rootTask = createRenderTask(request, null, children, -1, null, rootSegment, null, null, request.abortableTasks, null, rootFormatContext, rootContextSnapshot, emptyTreeContext, null, null);
  pushComponentStack(rootTask);
  request.pingedTasks.push(rootTask);
  return request;
}
function pingTask(request, task) {
  var pingedTasks = request.pingedTasks;
  pingedTasks.push(task);
  if (request.pingedTasks.length === 1) {
    request.flushScheduled = request.destination !== null;
    if (request.trackedPostpones !== null || request.status === OPENING) {
      scheduleMicrotask(function () {
        return performWork(request);
      });
    } else {
      scheduleWork(function () {
        return performWork(request);
      });
    }
  }
}
function createSuspenseBoundary(request, row, fallbackAbortableTasks, preamble, defer) {
  var boundary = {
    status: PENDING,
    rootSegmentID: -1,
    parentFlushed: false,
    pendingTasks: 0,
    row: row,
    completedSegments: [],
    byteSize: 0,
    defer: defer,
    fallbackAbortableTasks: fallbackAbortableTasks,
    errorDigest: null,
    contentState: createHoistableState(),
    fallbackState: createHoistableState(),
    preamble: preamble,
    tracked: null
  };
  if (row !== null) {
    // This boundary will block this row from completing.
    row.pendingTasks++;
    var blockedBoundaries = row.boundaries;
    if (blockedBoundaries !== null) {
      // Previous rows will block this boundary itself from completing.
      request.allPendingTasks++;
      boundary.pendingTasks++;
      blockedBoundaries.push(boundary);
    }
    var inheritedHoistables = row.inheritedHoistables;
    if (inheritedHoistables !== null) {
      hoistHoistables(boundary.contentState, inheritedHoistables);
    }
  }
  return boundary;
}
function createRenderTask(request, thenableState, node, childIndex, blockedBoundary, blockedSegment, blockedPreamble, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack, legacyContext, debugTask) {
  request.allPendingTasks++;
  if (blockedBoundary === null) {
    request.pendingRootTasks++;
  } else {
    blockedBoundary.pendingTasks++;
  }
  if (row !== null) {
    row.pendingTasks++;
  }
  var task = {
    replay: null,
    node: node,
    childIndex: childIndex,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: blockedSegment,
    blockedPreamble: blockedPreamble,
    hoistableState: hoistableState,
    abortSet: abortSet,
    keyPath: keyPath,
    formatContext: formatContext,
    context: context,
    treeContext: treeContext,
    row: row,
    componentStack: componentStack,
    thenableState: thenableState
  };
  abortSet.add(task);
  return task;
}
function createReplayTask(request, thenableState, replay, node, childIndex, blockedBoundary, hoistableState, abortSet, keyPath, formatContext, context, treeContext, row, componentStack, legacyContext, debugTask) {
  request.allPendingTasks++;
  if (blockedBoundary === null) {
    request.pendingRootTasks++;
  } else {
    blockedBoundary.pendingTasks++;
  }
  if (row !== null) {
    row.pendingTasks++;
  }
  replay.pendingTasks++;
  var task = {
    replay: replay,
    node: node,
    childIndex: childIndex,
    ping: function () {
      return pingTask(request, task);
    },
    blockedBoundary: blockedBoundary,
    blockedSegment: null,
    blockedPreamble: null,
    hoistableState: hoistableState,
    abortSet: abortSet,
    keyPath: keyPath,
    formatContext: formatContext,
    context: context,
    treeContext: treeContext,
    row: row,
    componentStack: componentStack,
    thenableState: thenableState
  };
  abortSet.add(task);
  return task;
}
function createPendingSegment(request, index, boundary, parentFormatContext, lastPushedText, textEmbedded) {
  return {
    status: PENDING,
    parentFlushed: false,
    id: -1,
    // lazily assigned later
    index: index,
    chunks: [],
    children: [],
    preambleChildren: [],
    parentFormatContext: parentFormatContext,
    boundary: boundary,
    lastPushedText: lastPushedText,
    textEmbedded: textEmbedded
  };
}
function getStackFromNode(stackNode) {
  return getStackByComponentStackNode(stackNode);
}
function pushComponentStack(task) {
  var node = task.node;
  // Create the Component Stack frame for the element we're about to try.
  // It's unfortunate that we need to do this refinement twice. Once for
  // the stack frame and then once again while actually
  if (typeof node === 'object' && node !== null) {
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        {
          var element = node;
          var type = element.type;
          task.componentStack = createComponentStackFromType(task.componentStack, type);
          break;
        }
    }
  }
}
function createComponentStackFromType(parent, type, owner,
// DEV only
stack // DEV only
) {
  return {
    parent: parent,
    type: type
  };
}
function replaceSuspenseComponentStackWithSuspenseFallbackStack(componentStack) {
  if (componentStack === null) {
    return null;
  }
  return createComponentStackFromType(componentStack.parent, 'Suspense Fallback');
}
function getThrownInfo(node) {
  var errorInfo = {};
  if (node) {
    Object.defineProperty(errorInfo, 'componentStack', {
      configurable: true,
      enumerable: true,
      get: function () {
        // Lazyily generate the stack since it's expensive.
        var stack = getStackFromNode(node);
        Object.defineProperty(errorInfo, 'componentStack', {
          value: stack
        });
        return stack;
      }
    });
  }
  return errorInfo;
}
function encodeErrorForBoundary(boundary, digest, error, thrownInfo, wasAborted) {
  boundary.errorDigest = digest;
}
function logRecoverableError(request, error, errorInfo, debugTask) {
  // If this callback errors, we intentionally let that error bubble up to become a fatal error
  // so that someone fixes the error reporting instead of hiding it.
  var onError = request.onError;
  var errorDigest = onError(error, errorInfo);
  if (errorDigest != null && typeof errorDigest !== 'string') {
    return;
  }
  return errorDigest;
}
function fatalError(request, error, errorInfo, debugTask) {
  // This is called outside error handling code such as if the root errors outside
  // a suspense boundary or if the root suspense boundary's fallback errors.
  // It's also called if React itself or its host configs errors.
  var onShellError = request.onShellError;
  var onFatalError = request.onFatalError;
  {
    onShellError(error);
    onFatalError(error);
  }
  if (request.destination !== null) {
    request.status = CLOSED;
    closeWithError(request.destination, error);
  } else {
    request.status = CLOSING;
    request.fatalError = error;
  }
}
function renderSuspenseBoundary(request, someTask, keyPath, props) {
  if (someTask.replay !== null) {
    // If we're replaying through this pass, it means we're replaying through
    // an already completed Suspense boundary. It's too late to do anything about it
    // so we can just render through it.
    var _prevKeyPath = someTask.keyPath;
    var _prevContext = someTask.formatContext;
    var _prevRow = someTask.row;
    someTask.keyPath = keyPath;
    someTask.formatContext = getSuspenseContentFormatContext(request.resumableState, _prevContext);
    someTask.row = null;
    var _content = props.children;
    try {
      renderNode(request, someTask, _content, -1);
    } finally {
      someTask.keyPath = _prevKeyPath;
      someTask.formatContext = _prevContext;
      someTask.row = _prevRow;
    }
    return;
  }
  // $FlowFixMe: Refined.
  var task = someTask;
  var prevKeyPath = task.keyPath;
  var prevContext = task.formatContext;
  var prevRow = task.row;
  var parentBoundary = task.blockedBoundary;
  var parentPreamble = task.blockedPreamble;
  var parentHoistableState = task.hoistableState;
  var parentSegment = task.blockedSegment;

  // Each time we enter a suspense boundary, we split out into a new segment for
  // the fallback so that we can later replace that segment with the content.
  // This also lets us split out the main content even if it doesn't suspend,
  // in case it ends up generating a large subtree of content.
  var fallback = props.fallback;
  var content = props.children;
  var defer = props.defer === true;
  var fallbackAbortSet = new Set();
  var newBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, null, defer);
  var insertionIndex = parentSegment.chunks.length;
  // The children of the boundary segment is actually the fallback.
  var boundarySegment = createPendingSegment(request, insertionIndex, newBoundary, task.formatContext,
  // boundaries never require text embedding at their edges because comment nodes bound them
  false, false);
  parentSegment.children.push(boundarySegment);
  // The parentSegment has a child Segment at this index so we reset the lastPushedText marker on the parent
  parentSegment.lastPushedText = false;

  // This segment is the actual child content. We can start rendering that immediately.
  var contentRootSegment = createPendingSegment(request, 0, null, task.formatContext,
  // boundaries never require text embedding at their edges because comment nodes bound them
  false, false);
  // We mark the root segment as having its parent flushed. It's not really flushed but there is
  // no parent segment so there's nothing to wait on.
  contentRootSegment.parentFlushed = true;
  var trackedPostpones = request.trackedPostpones;
  if (trackedPostpones !== null || defer) {
    // This is a prerender or deferred boundary. In this mode we want to render the fallback synchronously
    // and schedule the content to render later. This is the opposite of what we do during a normal render
    // where we try to skip rendering the fallback if the content itself can render synchronously

    // Stash the original stack frame.
    var suspenseComponentStack = task.componentStack;
    var fallbackKeyPath = [keyPath[0], 'Suspense Fallback', keyPath[2]];
    if (trackedPostpones !== null) {
      var fallbackReplayNode = [fallbackKeyPath[1], fallbackKeyPath[2], [], null];
      trackedPostpones.workingMap.set(fallbackKeyPath, fallbackReplayNode);
      newBoundary.tracked = {
        contentKeyPath: keyPath,
        // We are rendering the fallback before the boundary content so we keep track of
        // the fallback replay node until we determine if the primary content suspends
        fallbackNode: fallbackReplayNode
      };
    }
    task.blockedSegment = boundarySegment;
    task.blockedPreamble = newBoundary.preamble === null ? null : newBoundary.preamble.fallback;
    task.keyPath = fallbackKeyPath;
    task.formatContext = getSuspenseFallbackFormatContext(request.resumableState, prevContext);
    task.componentStack = replaceSuspenseComponentStackWithSuspenseFallbackStack(suspenseComponentStack);
    boundarySegment.status = RENDERING;
    try {
      renderNode(request, task, fallback, -1);
      pushSegmentFinale(boundarySegment.chunks, request.renderState, boundarySegment.lastPushedText, boundarySegment.textEmbedded);
      boundarySegment.status = COMPLETED;
      finishedSegment(request, parentBoundary, boundarySegment);
    } catch (thrownValue) {
      if (request.status === ABORTING) {
        boundarySegment.status = ABORTED;
      } else {
        boundarySegment.status = ERRORED;
      }
      throw thrownValue;
    } finally {
      task.blockedSegment = parentSegment;
      task.blockedPreamble = parentPreamble;
      task.keyPath = prevKeyPath;
      task.formatContext = prevContext;
    }

    // We create a suspended task for the primary content because we want to allow
    // sibling fallbacks to be rendered first.
    var suspendedPrimaryTask = createRenderTask(request, null, content, -1, newBoundary, contentRootSegment, newBoundary.preamble === null ? null : newBoundary.preamble.content, newBoundary.contentState, task.abortSet, keyPath, getSuspenseContentFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, null,
    // The row gets reset inside the Suspense boundary.
    suspenseComponentStack);
    pushComponentStack(suspendedPrimaryTask);
    request.pingedTasks.push(suspendedPrimaryTask);
  } else {
    // This is a normal render. We will attempt to synchronously render the boundary content
    // If it is successful we will elide the fallback task but if it suspends or errors we schedule
    // the fallback to render. Unlike with prerenders we attempt to deprioritize the fallback render

    // Currently this is running synchronously. We could instead schedule this to pingedTasks.
    // I suspect that there might be some efficiency benefits from not creating the suspended task
    // and instead just using the stack if possible.
    // TODO: Call this directly instead of messing with saving and restoring contexts.

    // We can reuse the current context and task to render the content immediately without
    // context switching. We just need to temporarily switch which boundary and which segment
    // we're writing to. If something suspends, it'll spawn new suspended task with that context.
    task.blockedBoundary = newBoundary;
    task.blockedPreamble = newBoundary.preamble === null ? null : newBoundary.preamble.content;
    task.hoistableState = newBoundary.contentState;
    task.blockedSegment = contentRootSegment;
    task.keyPath = keyPath;
    task.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
    task.row = null;
    contentRootSegment.status = RENDERING;
    try {
      // We use the safe form because we don't handle suspending here. Only error handling.
      renderNode(request, task, content, -1);
      pushSegmentFinale(contentRootSegment.chunks, request.renderState, contentRootSegment.lastPushedText, contentRootSegment.textEmbedded);
      contentRootSegment.status = COMPLETED;
      finishedSegment(request, newBoundary, contentRootSegment);
      queueCompletedSegment(newBoundary, contentRootSegment);
      if (newBoundary.pendingTasks === 0 && newBoundary.status === PENDING) {
        // This must have been the last segment we were waiting on. This boundary is now complete.
        newBoundary.status = COMPLETED;
        // Therefore we won't need the fallback. We early return so that we don't have to create
        // the fallback. However, if this boundary ended up big enough to be eligible for outlining
        // we can't do that because we might still need the fallback if we outline it.
        if (!isEligibleForOutlining(request, newBoundary)) {
          if (prevRow !== null) {
            // If we have synchronously completed the boundary and it's not eligible for outlining
            // then we don't have to wait for it to be flushed before we unblock future rows.
            // This lets us inline small rows in order.
            if (--prevRow.pendingTasks === 0) {
              finishSuspenseListRow(request, prevRow);
            }
          }
          if (request.pendingRootTasks === 0 && task.blockedPreamble) {
            // The root is complete and this boundary may contribute part of the preamble.
            // We eagerly attempt to prepare the preamble here because we expect most requests
            // to have few boundaries which contribute preambles and it allow us to do this
            // preparation work during the work phase rather than the when flushing.
            preparePreamble(request);
          }
          return;
        }
      } else {
        var boundaryRow = prevRow;
        if (boundaryRow !== null && boundaryRow.together) {
          tryToResolveTogetherRow(request, boundaryRow);
        }
      }
    } catch (thrownValue) {
      newBoundary.status = CLIENT_RENDERED;
      var error;
      if (request.status === ABORTING) {
        contentRootSegment.status = ABORTED;
        error = request.fatalError;
      } else {
        contentRootSegment.status = ERRORED;
        error = thrownValue;
      }
      var thrownInfo = getThrownInfo(task.componentStack);
      var errorDigest = logRecoverableError(request, error, thrownInfo);
      encodeErrorForBoundary(newBoundary, errorDigest);
      untrackBoundary(request, newBoundary);

      // We don't need to decrement any task numbers because we didn't spawn any new task.
      // We don't need to schedule any task because we know the parent has written yet.
      // We do need to fallthrough to create the fallback though.
    } finally {
      task.blockedBoundary = parentBoundary;
      task.blockedPreamble = parentPreamble;
      task.hoistableState = parentHoistableState;
      task.blockedSegment = parentSegment;
      task.keyPath = prevKeyPath;
      task.formatContext = prevContext;
      task.row = prevRow;
    }
    var _fallbackKeyPath = [keyPath[0], 'Suspense Fallback', keyPath[2]];
    // We create suspended task for the fallback because we don't want to actually work
    // on it yet in case we finish the main content, so we queue for later.
    var suspendedFallbackTask = createRenderTask(request, null, fallback, -1, parentBoundary, boundarySegment, newBoundary.preamble === null ? null : newBoundary.preamble.fallback, newBoundary.fallbackState, fallbackAbortSet, _fallbackKeyPath, getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack));
    pushComponentStack(suspendedFallbackTask);
    // TODO: This should be queued at a separate lower priority queue so that we only work
    // on preparing fallbacks if we don't have any more main content to task on.
    request.pingedTasks.push(suspendedFallbackTask);
  }
}
function replaySuspenseBoundary(request, task, keyPath, props, id, childNodes, childSlots, fallbackNodes, fallbackSlots) {
  var prevKeyPath = task.keyPath;
  var prevContext = task.formatContext;
  var prevRow = task.row;
  var previousReplaySet = task.replay;
  var parentBoundary = task.blockedBoundary;
  var parentHoistableState = task.hoistableState;
  var content = props.children;
  var fallback = props.fallback;
  var defer = props.defer === true;
  var fallbackAbortSet = new Set();
  var resumedBoundary = createSuspenseBoundary(request, task.row, fallbackAbortSet, null, defer);
  resumedBoundary.parentFlushed = true;
  // We restore the same id of this boundary as was used during prerender.
  resumedBoundary.rootSegmentID = id;

  // We can reuse the current context and task to render the content immediately without
  // context switching. We just need to temporarily switch which boundary and replay node
  // we're writing to. If something suspends, it'll spawn new suspended task with that context.
  task.blockedBoundary = resumedBoundary;
  task.hoistableState = resumedBoundary.contentState;
  task.keyPath = keyPath;
  task.formatContext = getSuspenseContentFormatContext(request.resumableState, prevContext);
  task.row = null;
  task.replay = {
    nodes: childNodes,
    slots: childSlots,
    pendingTasks: 1
  };
  try {
    // We use the safe form because we don't handle suspending here. Only error handling.
    renderNode(request, task, content, -1);
    if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0) {
      throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
    }
    task.replay.pendingTasks--;
    if (resumedBoundary.pendingTasks === 0 && resumedBoundary.status === PENDING) {
      // This must have been the last segment we were waiting on. This boundary is now complete.
      // Therefore we won't need the fallback. We early return so that we don't have to create
      // the fallback.
      resumedBoundary.status = COMPLETED;
      request.completedBoundaries.push(resumedBoundary);
      // We restore the parent componentStack. Semantically this is the same as
      // popComponentStack(task) but we do this instead because it should be slightly
      // faster
      return;
    }
  } catch (error) {
    resumedBoundary.status = CLIENT_RENDERED;
    var thrownInfo = getThrownInfo(task.componentStack);
    var errorDigest = logRecoverableError(request, error, thrownInfo);
    encodeErrorForBoundary(resumedBoundary, errorDigest);
    task.replay.pendingTasks--;

    // The parent already flushed in the prerender so we need to schedule this to be emitted.
    request.clientRenderedBoundaries.push(resumedBoundary);

    // We don't need to decrement any task numbers because we didn't spawn any new task.
    // We don't need to schedule any task because we know the parent has written yet.
    // We do need to fallthrough to create the fallback though.
  } finally {
    task.blockedBoundary = parentBoundary;
    task.hoistableState = parentHoistableState;
    task.replay = previousReplaySet;
    task.keyPath = prevKeyPath;
    task.formatContext = prevContext;
    task.row = prevRow;
  }
  var fallbackKeyPath = [keyPath[0], 'Suspense Fallback', keyPath[2]];

  // We create suspended task for the fallback because we don't want to actually work
  // on it yet in case we finish the main content, so we queue for later.
  var fallbackReplay = {
    nodes: fallbackNodes,
    slots: fallbackSlots,
    pendingTasks: 0
  };
  var suspendedFallbackTask = createReplayTask(request, null, fallbackReplay, fallback, -1, parentBoundary, resumedBoundary.fallbackState, fallbackAbortSet, fallbackKeyPath, getSuspenseFallbackFormatContext(request.resumableState, task.formatContext), task.context, task.treeContext, task.row, replaceSuspenseComponentStackWithSuspenseFallbackStack(task.componentStack));
  pushComponentStack(suspendedFallbackTask);
  // TODO: This should be queued at a separate lower priority queue so that we only work
  // on preparing fallbacks if we don't have any more main content to task on.
  request.pingedTasks.push(suspendedFallbackTask);
}
function finishSuspenseListRow(request, row) {
  // This row finished. Now we have to unblock all the next rows that were blocked on this.
  unblockSuspenseListRow(request, row.next, row.hoistables);
}
function unblockSuspenseListRow(request, unblockedRow, inheritedHoistables) {
  // We do this in a loop to avoid stack overflow for very long lists that get unblocked.
  while (unblockedRow !== null) {
    if (inheritedHoistables !== null) {
      // Hoist any hoistables from the previous row into the next row so that it can be
      // later transferred to all the rows.
      hoistHoistables(unblockedRow.hoistables, inheritedHoistables);
      // Mark the row itself for any newly discovered Suspense boundaries to inherit.
      // This is different from hoistables because that also includes hoistables from
      // all the boundaries below this row and not just previous rows.
      unblockedRow.inheritedHoistables = inheritedHoistables;
    }
    // Unblocking the boundaries will decrement the count of this row but we keep it above
    // zero so they never finish this row recursively.
    var unblockedBoundaries = unblockedRow.boundaries;
    if (unblockedBoundaries !== null) {
      unblockedRow.boundaries = null;
      for (var i = 0; i < unblockedBoundaries.length; i++) {
        var unblockedBoundary = unblockedBoundaries[i];
        if (inheritedHoistables !== null) {
          hoistHoistables(unblockedBoundary.contentState, inheritedHoistables);
        }
        finishedTask(request, unblockedBoundary, null, null);
      }
    }
    // Instead we decrement at the end to keep it all in this loop.
    unblockedRow.pendingTasks--;
    if (unblockedRow.pendingTasks > 0) {
      // Still blocked.
      break;
    }
    inheritedHoistables = unblockedRow.hoistables;
    unblockedRow = unblockedRow.next;
  }
}
function trackPostponedSuspenseListRow(request, trackedPostpones, postponedRow) {
  // TODO: Because we unconditionally call this, it will be called by finishedTask
  // and so ends up recursive which can lead to stack overflow for very long lists.
  if (postponedRow !== null) {
    var postponedBoundaries = postponedRow.boundaries;
    if (postponedBoundaries !== null) {
      postponedRow.boundaries = null;
      for (var i = 0; i < postponedBoundaries.length; i++) {
        var postponedBoundary = postponedBoundaries[i];
        trackPostponedBoundary(request, trackedPostpones, postponedBoundary);
        finishedTask(request, postponedBoundary, null, null);
      }
    }
  }
}
function tryToResolveTogetherRow(request, togetherRow) {
  // If we have a "together" row and all the pendingTasks are really the boundaries themselves,
  // and we won't outline any of them then we can unblock this row early so that we can inline
  // all the boundaries at once.
  var boundaries = togetherRow.boundaries;
  if (boundaries === null || togetherRow.pendingTasks !== boundaries.length) {
    return;
  }
  var allCompleteAndInlinable = true;
  for (var i = 0; i < boundaries.length; i++) {
    var rowBoundary = boundaries[i];
    if (rowBoundary.pendingTasks !== 1 || rowBoundary.parentFlushed || isEligibleForOutlining(request, rowBoundary)) {
      allCompleteAndInlinable = false;
      break;
    }
  }
  if (allCompleteAndInlinable) {
    unblockSuspenseListRow(request, togetherRow, togetherRow.hoistables);
  }
}
function createSuspenseListRow(previousRow) {
  var newRow = {
    pendingTasks: 1,
    // At first the row is blocked on attempting rendering itself.
    boundaries: null,
    hoistables: createHoistableState(),
    inheritedHoistables: null,
    together: false,
    next: null
  };
  if (previousRow !== null && previousRow.pendingTasks > 0) {
    // If the previous row is not done yet, we add ourselves to be blocked on it.
    // When it finishes, we'll decrement our pending tasks.
    newRow.pendingTasks++;
    newRow.boundaries = [];
    previousRow.next = newRow;
  }
  return newRow;
}
function renderSuspenseListRows(request, task, keyPath, rows, revealOrder) {
  // This is a fork of renderChildrenArray that's aware of tracking rows.
  var prevKeyPath = task.keyPath;
  var prevTreeContext = task.treeContext;
  var prevRow = task.row;
  task.keyPath = keyPath;
  var totalChildren = rows.length;
  var previousSuspenseListRow = null;
  if (task.replay !== null) {
    // Replay
    // First we need to check if we have any resume slots at this level.
    var resumeSlots = task.replay.slots;
    if (resumeSlots !== null && typeof resumeSlots === 'object') {
      for (var n = 0; n < totalChildren; n++) {
        // Since we are going to resume into a slot whose order was already
        // determined by the prerender, we can safely resume it even in reverse
        // render order.
        var i = revealOrder !== 'backwards' && revealOrder !== 'unstable_legacy-backwards' ? n : totalChildren - 1 - n;
        var node = rows[i];
        task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
        task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
        var resumeSegmentID = resumeSlots[i];
        // TODO: If this errors we should still continue with the next sibling.
        if (typeof resumeSegmentID === 'number') {
          resumeNode(request, task, resumeSegmentID, node, i);
          // We finished rendering this node, so now we can consume this
          // slot. This must happen after in case we rerender this task.
          delete resumeSlots[i];
        } else {
          renderNode(request, task, node, i);
        }
        if (--previousSuspenseListRow.pendingTasks === 0) {
          finishSuspenseListRow(request, previousSuspenseListRow);
        }
      }
    } else {
      for (var _n = 0; _n < totalChildren; _n++) {
        // Since we are going to resume into a slot whose order was already
        // determined by the prerender, we can safely resume it even in reverse
        // render order.
        var _i = revealOrder !== 'backwards' && revealOrder !== 'unstable_legacy-backwards' ? _n : totalChildren - 1 - _n;
        var _node = rows[_i];
        task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
        task.treeContext = pushTreeContext(prevTreeContext, totalChildren, _i);
        renderNode(request, task, _node, _i);
        if (--previousSuspenseListRow.pendingTasks === 0) {
          finishSuspenseListRow(request, previousSuspenseListRow);
        }
      }
    }
  } else {
    task = task; // Refined
    if (revealOrder !== 'backwards' && revealOrder !== 'unstable_legacy-backwards') {
      // Forwards direction
      for (var _i2 = 0; _i2 < totalChildren; _i2++) {
        var _node2 = rows[_i2];
        task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
        task.treeContext = pushTreeContext(prevTreeContext, totalChildren, _i2);
        renderNode(request, task, _node2, _i2);
        if (--previousSuspenseListRow.pendingTasks === 0) {
          finishSuspenseListRow(request, previousSuspenseListRow);
        }
      }
    } else {
      // For backwards direction we need to do things a bit differently.
      // We give each row its own segment so that we can render the content in
      // reverse order but still emit it in the right order when we flush.
      var parentSegment = task.blockedSegment;
      var childIndex = parentSegment.children.length;
      var insertionIndex = parentSegment.chunks.length;
      for (var _n2 = 0; _n2 < totalChildren; _n2++) {
        var _i3 = revealOrder === 'unstable_legacy-backwards' ? totalChildren - 1 - _n2 : _n2;
        var _node3 = rows[_i3];
        task.row = previousSuspenseListRow = createSuspenseListRow(previousSuspenseListRow);
        task.treeContext = pushTreeContext(prevTreeContext, totalChildren, _i3);
        var newSegment = createPendingSegment(request, insertionIndex, null, task.formatContext,
        // Assume we are text embedded at the trailing edges
        _i3 === 0 ? parentSegment.lastPushedText : true, true);
        // Insert in the beginning of the sequence, which will insert before any previous rows.
        parentSegment.children.splice(childIndex, 0, newSegment);
        task.blockedSegment = newSegment;
        try {
          renderNode(request, task, _node3, _i3);
          pushSegmentFinale(newSegment.chunks, request.renderState, newSegment.lastPushedText, newSegment.textEmbedded);
          newSegment.status = COMPLETED;
          finishedSegment(request, task.blockedBoundary, newSegment);
          if (--previousSuspenseListRow.pendingTasks === 0) {
            finishSuspenseListRow(request, previousSuspenseListRow);
          }
        } catch (thrownValue) {
          if (request.status === ABORTING) {
            newSegment.status = ABORTED;
          } else {
            newSegment.status = ERRORED;
          }
          throw thrownValue;
        }
      }
      task.blockedSegment = parentSegment;
      // Reset lastPushedText for current Segment since the new Segments "consumed" it
      parentSegment.lastPushedText = false;
    }
  }
  if (prevRow !== null && previousSuspenseListRow !== null && previousSuspenseListRow.pendingTasks > 0) {
    // If we are part of an outer SuspenseList and our last row is still pending, then that blocks
    // the parent row from completing. We can continue the chain.
    prevRow.pendingTasks++;
    previousSuspenseListRow.next = prevRow;
  }

  // Because this context is always set right before rendering every child, we
  // only need to reset it to the previous value at the very end.
  task.treeContext = prevTreeContext;
  task.row = prevRow;
  task.keyPath = prevKeyPath;
}
function renderSuspenseList(request, task, keyPath, props) {
  var children = props.children;
  var revealOrder = props.revealOrder;
  // TODO: Support tail hidden/collapsed modes.
  // const tailMode: SuspenseListTailMode = props.tail;
  if (revealOrder !== 'independent' && revealOrder !== 'together') {
    // For ordered reveal, we need to produce rows from the children.
    if (isArray(children)) {
      renderSuspenseListRows(request, task, keyPath, children, revealOrder);
      return;
    }
    var iteratorFn = getIteratorFn(children);
    if (iteratorFn) {
      var iterator = iteratorFn.call(children);
      if (iterator) {
        // TODO: We currently use the same id algorithm as regular nodes
        // but we need a new algorithm for SuspenseList that doesn't require
        // a full set to be loaded up front to support Async Iterable.
        // When we have that, we shouldn't buffer anymore.
        var step = iterator.next();
        if (!step.done) {
          var rows = [];
          do {
            rows.push(step.value);
            step = iterator.next();
          } while (!step.done);
          renderSuspenseListRows(request, task, keyPath, children, revealOrder);
        }
        return;
      }
    }
    if (typeof children[ASYNC_ITERATOR] === 'function') {
      var _iterator = children[ASYNC_ITERATOR]();
      if (_iterator) {
        // TODO: Update the task.children to be the iterator to avoid asking
        // for new iterators, but we currently warn for rendering these
        // so needs some refactoring to deal with the warning.

        // Restore the thenable state before resuming.
        var prevThenableState = task.thenableState;
        task.thenableState = null;
        prepareToUseThenableState(prevThenableState);

        // We need to know how many total rows are in this set, so that we
        // can allocate enough id slots to acommodate them. So we must exhaust
        // the iterator before we start recursively rendering the rows.
        // TODO: This is not great but I think it's inherent to the id
        // generation algorithm.

        var _rows = [];
        var done = false;
        if (_iterator === children) {
          // If it's an iterator we need to continue reading where we left
          // off. We can do that by reading the first few rows from the previous
          // thenable state.
          // $FlowFixMe
          var _step = readPreviousThenableFromState();
          while (_step !== undefined) {
            if (_step.done) {
              done = true;
              break;
            }
            _rows.push(_step.value);
            _step = readPreviousThenableFromState();
          }
        }
        if (!done) {
          var _step2 = unwrapThenable(_iterator.next());
          while (!_step2.done) {
            _rows.push(_step2.value);
            _step2 = unwrapThenable(_iterator.next());
          }
        }
        renderSuspenseListRows(request, task, keyPath, _rows, revealOrder);
        return;
      }
    }
    // This case will warn on the client. It's the same as independent revealOrder.
  }
  if (revealOrder === 'together') {
    var _prevKeyPath2 = task.keyPath;
    var prevRow = task.row;
    var newRow = task.row = createSuspenseListRow(null);
    // This will cause boundaries to block on this row, but there's nothing to
    // unblock them. We'll use the partial flushing pass to unblock them.
    newRow.boundaries = [];
    newRow.together = true;
    task.keyPath = keyPath;
    renderNodeDestructive(request, task, children, -1);
    if (--newRow.pendingTasks === 0) {
      finishSuspenseListRow(request, newRow);
    }
    task.keyPath = _prevKeyPath2;
    task.row = prevRow;
    if (prevRow !== null && newRow.pendingTasks > 0) {
      // If we are part of an outer SuspenseList and our row is still pending, then that blocks
      // the parent row from completing. We can continue the chain.
      prevRow.pendingTasks++;
      newRow.next = prevRow;
    }
    return;
  }
  // For other reveal order modes, we just render it as a fragment.
  var prevKeyPath = task.keyPath;
  task.keyPath = keyPath;
  renderNodeDestructive(request, task, children, -1);
  task.keyPath = prevKeyPath;
}
function renderPreamble(request, task, blockedSegment, node) {
  var preambleSegment = createPendingSegment(request, 0, null, task.formatContext, false, false);
  blockedSegment.preambleChildren.push(preambleSegment);
  task.blockedSegment = preambleSegment;
  try {
    preambleSegment.status = RENDERING;
    renderNode(request, task, node, -1);
    pushSegmentFinale(preambleSegment.chunks, request.renderState, preambleSegment.lastPushedText, preambleSegment.textEmbedded);
    preambleSegment.status = COMPLETED;
    finishedSegment(request, task.blockedBoundary, preambleSegment);
  } finally {
    task.blockedSegment = blockedSegment;
  }
}
function renderHostElement(request, task, keyPath, type, props) {
  var segment = task.blockedSegment;
  if (segment === null) {
    // Replay
    var children = props.children; // TODO: Make this a Config for replaying.
    var prevContext = task.formatContext;
    var prevKeyPath = task.keyPath;
    task.formatContext = getChildFormatContext(prevContext, type, props);
    task.keyPath = keyPath;

    // We use the non-destructive form because if something suspends, we still
    // need to pop back up and finish this subtree of HTML.
    renderNode(request, task, children, -1);

    // We expect that errors will fatal the whole task and that we don't need
    // the correct context. Therefore this is not in a finally.
    task.formatContext = prevContext;
    task.keyPath = prevKeyPath;
  } else {
    // Render
    // RenderTask always has a preambleState
    var _children = pushStartInstance(segment.chunks, type, props, request.resumableState, request.renderState, task.blockedPreamble, task.hoistableState, task.formatContext, segment.lastPushedText);
    segment.lastPushedText = false;
    var _prevContext2 = task.formatContext;
    var _prevKeyPath3 = task.keyPath;
    task.keyPath = keyPath;
    var newContext = task.formatContext = getChildFormatContext(_prevContext2, type, props);
    if (isPreambleContext(newContext)) {
      // $FlowFixMe: Refined
      renderPreamble(request, task, segment, _children);
    } else {
      // We use the non-destructive form because if something suspends, we still
      // need to pop back up and finish this subtree of HTML.
      renderNode(request, task, _children, -1);
    }

    // We expect that errors will fatal the whole task and that we don't need
    // the correct context. Therefore this is not in a finally.
    task.formatContext = _prevContext2;
    task.keyPath = _prevKeyPath3;
    pushEndInstance(segment.chunks, type, props, request.resumableState, _prevContext2);
    segment.lastPushedText = false;
  }
}
function shouldConstruct(Component) {
  return Component.prototype && Component.prototype.isReactComponent;
}
function renderWithHooks(request, task, keyPath, Component, props, secondArg) {
  // Reset the task's thenable state before continuing, so that if a later
  // component suspends we can reuse the same task object. If the same
  // component suspends again, the thenable state will be restored.
  var prevThenableState = task.thenableState;
  task.thenableState = null;
  var componentIdentity = {};
  prepareToUseHooks(request, task, keyPath, componentIdentity, prevThenableState);
  var result;
  {
    result = Component(props, secondArg);
  }
  return finishHooks(Component, props, result, secondArg);
}
function finishClassComponent(request, task, keyPath, instance, Component, props) {
  var nextChildren;
  {
    nextChildren = instance.render();
  }
  if (request.status === ABORTING) {
    // eslint-disable-next-line no-throw-literal
    throw null;
  }
  var prevKeyPath = task.keyPath;
  task.keyPath = keyPath;
  renderNodeDestructive(request, task, nextChildren, -1);
  task.keyPath = prevKeyPath;
}
function resolveClassComponentProps(Component, baseProps) {
  var newProps = baseProps;

  // Remove ref from the props object, if it exists.
  if ('ref' in baseProps) {
    newProps = {};
    for (var propName in baseProps) {
      if (propName !== 'ref') {
        newProps[propName] = baseProps[propName];
      }
    }
  }

  // Resolve default props.
  var defaultProps = Component.defaultProps;
  if (defaultProps) {
    // We may have already copied the props object above to remove ref. If so,
    // we can modify that. Otherwise, copy the props object with Object.assign.
    if (newProps === baseProps) {
      newProps = assign({}, newProps, baseProps);
    }
    // Taken from old JSX runtime, where this used to live.
    for (var _propName in defaultProps) {
      if (newProps[_propName] === undefined) {
        newProps[_propName] = defaultProps[_propName];
      }
    }
  }
  return newProps;
}
function renderClassComponent(request, task, keyPath, Component, props) {
  var resolvedProps = resolveClassComponentProps(Component, props);
  var maskedContext = undefined;
  var instance = constructClassInstance(Component, resolvedProps);
  mountClassInstance(instance, Component, resolvedProps, maskedContext);
  finishClassComponent(request, task, keyPath, instance);
}
function renderFunctionComponent(request, task, keyPath, Component, props) {
  var legacyContext;
  var value = renderWithHooks(request, task, keyPath, Component, props, legacyContext);
  if (request.status === ABORTING) {
    // eslint-disable-next-line no-throw-literal
    throw null;
  }
  var hasId = checkDidRenderIdHook();
  var actionStateCount = getActionStateCount();
  var actionStateMatchingIndex = getActionStateMatchingIndex();
  finishFunctionComponent(request, task, keyPath, value, hasId, actionStateCount, actionStateMatchingIndex);
}
function finishFunctionComponent(request, task, keyPath, children, hasId, actionStateCount, actionStateMatchingIndex) {
  var didEmitActionStateMarkers = false;
  if (actionStateCount !== 0 && request.formState !== null) {
    // For each useActionState hook, emit a marker that indicates whether we
    // rendered using the form state passed at the root. We only emit these
    // markers if form state is passed at the root.
    var segment = task.blockedSegment;
    if (segment === null) ; else {
      didEmitActionStateMarkers = true;
      var target = segment.chunks;
      for (var i = 0; i < actionStateCount; i++) {
        if (i === actionStateMatchingIndex) {
          pushFormStateMarkerIsMatching(target);
        } else {
          pushFormStateMarkerIsNotMatching(target);
        }
      }
    }
  }
  var prevKeyPath = task.keyPath;
  task.keyPath = keyPath;
  if (hasId) {
    // This component materialized an id. We treat this as its own level, with
    // a single "child" slot.
    var prevTreeContext = task.treeContext;
    var totalChildren = 1;
    var index = 0;
    // Modify the id context. Because we'll need to reset this if something
    // suspends or errors, we'll use the non-destructive render path.
    task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
    renderNode(request, task, children, -1);
    // Like the other contexts, this does not need to be in a finally block
    // because renderNode takes care of unwinding the stack.
    task.treeContext = prevTreeContext;
  } else if (didEmitActionStateMarkers) {
    // If there were useActionState hooks, we must use the non-destructive path
    // because this component is not a pure indirection; we emitted markers
    // to the stream.
    renderNode(request, task, children, -1);
  } else {
    // We're now successfully past this task, and we haven't modified the
    // context stack. We don't have to pop back to the previous task every
    // again, so we can use the destructive recursive form.
    renderNodeDestructive(request, task, children, -1);
  }
  task.keyPath = prevKeyPath;
}
function renderForwardRef(request, task, keyPath, type, props, ref) {
  var propsWithoutRef;
  if ('ref' in props) {
    // `ref` is just a prop now, but `forwardRef` expects it to not appear in
    // the props object. This used to happen in the JSX runtime, but now we do
    // it here.
    propsWithoutRef = {};
    for (var key in props) {
      // Since `ref` should only appear in props via the JSX transform, we can
      // assume that this is a plain object. So we don't need a
      // hasOwnProperty check.
      if (key !== 'ref') {
        propsWithoutRef[key] = props[key];
      }
    }
  } else {
    propsWithoutRef = props;
  }
  var children = renderWithHooks(request, task, keyPath, type.render, propsWithoutRef, ref);
  var hasId = checkDidRenderIdHook();
  var actionStateCount = getActionStateCount();
  var actionStateMatchingIndex = getActionStateMatchingIndex();
  finishFunctionComponent(request, task, keyPath, children, hasId, actionStateCount, actionStateMatchingIndex);
}
function renderMemo(request, task, keyPath, type, props, ref) {
  var innerType = type.type;
  renderElement(request, task, keyPath, innerType, props, ref);
}
function renderContextConsumer(request, task, keyPath, context, props) {
  var render = props.children;
  var newValue = readContext$1(context);
  var newChildren = render(newValue);
  var prevKeyPath = task.keyPath;
  task.keyPath = keyPath;
  renderNodeDestructive(request, task, newChildren, -1);
  task.keyPath = prevKeyPath;
}
function renderContextProvider(request, task, keyPath, context, props) {
  var value = props.value;
  var children = props.children;
  var prevKeyPath = task.keyPath;
  task.context = pushProvider(context, value);
  task.keyPath = keyPath;
  renderNodeDestructive(request, task, children, -1);
  task.context = popProvider();
  task.keyPath = prevKeyPath;
}
function renderLazyComponent(request, task, keyPath, lazyComponent, props, ref) {
  var Component;
  {
    var payload = lazyComponent._payload;
    var init = lazyComponent._init;
    Component = init(payload);
  }
  if (request.status === ABORTING && (
  // We're going to discard this render anyway.
  // We just need to reach the point where we suspended in dev.
  !false )) {
    // eslint-disable-next-line no-throw-literal
    throw null;
  }
  renderElement(request, task, keyPath, Component, props, ref);
}
function renderActivity(request, task, keyPath, props) {
  var segment = task.blockedSegment;
  if (segment === null) {
    // Replay
    var mode = props.mode;
    if (mode === 'hidden') ; else {
      // A visible Activity boundary has its children rendered inside the boundary.
      var prevKeyPath = task.keyPath;
      task.keyPath = keyPath;
      renderNode(request, task, props.children, -1);
      task.keyPath = prevKeyPath;
    }
  } else {
    // Render
    var _mode = props.mode;
    if (_mode === 'hidden') ; else {
      // An Activity boundary is delimited so that we can hydrate it separately.
      pushStartActivityBoundary(segment.chunks, request.renderState);
      segment.lastPushedText = false;
      // A visible Activity boundary has its children rendered inside the boundary.
      var _prevKeyPath4 = task.keyPath;
      task.keyPath = keyPath;
      // We use the non-destructive form because if something suspends, we still
      // need to pop back up and finish the end comment.
      renderNode(request, task, props.children, -1);
      task.keyPath = _prevKeyPath4;
      pushEndActivityBoundary(segment.chunks, request.renderState);
      segment.lastPushedText = false;
    }
  }
}
function renderViewTransition(request, task, keyPath, props) {
  var prevContext = task.formatContext;
  var prevKeyPath = task.keyPath;
  // Get the name off props or generate an auto-generated one in case we need it.
  getViewTransitionName(props, task.treeContext, request.resumableState);
  task.formatContext = getViewTransitionFormatContext(request.resumableState, prevContext);
  task.keyPath = keyPath;
  if (props.name != null && props.name !== 'auto') {
    renderNodeDestructive(request, task, props.children, -1);
  } else {
    // This will be auto-assigned a name which claims a "useId" slot.
    // This component materialized an id. We treat this as its own level, with
    // a single "child" slot.
    var prevTreeContext = task.treeContext;
    var totalChildren = 1;
    var index = 0;
    // Modify the id context. Because we'll need to reset this if something
    // suspends or errors, we'll use the non-destructive render path.
    task.treeContext = pushTreeContext(prevTreeContext, totalChildren, index);
    renderNode(request, task, props.children, -1);
    // Like the other contexts, this does not need to be in a finally block
    // because renderNode takes care of unwinding the stack.
    task.treeContext = prevTreeContext;
  }
  task.formatContext = prevContext;
  task.keyPath = prevKeyPath;
}
function renderElement(request, task, keyPath, type, props, ref) {
  if (typeof type === 'function') {
    if (shouldConstruct(type)) {
      renderClassComponent(request, task, keyPath, type, props);
      return;
    } else {
      renderFunctionComponent(request, task, keyPath, type, props);
      return;
    }
  }
  if (typeof type === 'string') {
    renderHostElement(request, task, keyPath, type, props);
    return;
  }
  switch (type) {
    // LegacyHidden acts the same as a fragment. This only works because we
    // currently assume that every instance of LegacyHidden is accompanied by a
    // host component wrapper. In the hidden mode, the host component is given a
    // `hidden` attribute, which ensures that the initial HTML is not visible.
    // To support the use of LegacyHidden as a true fragment, without an extra
    // DOM node, we would have to hide the initial HTML in some other way.
    // TODO: Delete in LegacyHidden. It's an unstable API only used in the
    // www build. As a migration step, we could add a special prop to Offscreen
    // that simulates the old behavior (no hiding, no change to effects).
    case REACT_LEGACY_HIDDEN_TYPE:
    case REACT_STRICT_MODE_TYPE:
    case REACT_PROFILER_TYPE:
    case REACT_FRAGMENT_TYPE:
      {
        var prevKeyPath = task.keyPath;
        task.keyPath = keyPath;
        renderNodeDestructive(request, task, props.children, -1);
        task.keyPath = prevKeyPath;
        return;
      }
    case REACT_ACTIVITY_TYPE:
      {
        renderActivity(request, task, keyPath, props);
        return;
      }
    case REACT_SUSPENSE_LIST_TYPE:
      {
        renderSuspenseList(request, task, keyPath, props);
        return;
      }
    case REACT_VIEW_TRANSITION_TYPE:
      {
        {
          renderViewTransition(request, task, keyPath, props);
          return;
        }
        // Fallthrough
      }
    case REACT_SCOPE_TYPE:
      {
        throw new Error('ReactDOMServer does not yet support scope components.');
      }
    case REACT_SUSPENSE_TYPE:
      {
        renderSuspenseBoundary(request, task, keyPath, props);
        return;
      }
  }
  if (typeof type === 'object' && type !== null) {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        {
          renderForwardRef(request, task, keyPath, type, props, ref);
          return;
        }
      case REACT_MEMO_TYPE:
        {
          renderMemo(request, task, keyPath, type, props, ref);
          return;
        }
      case REACT_CONTEXT_TYPE:
        {
          var context = type;
          renderContextProvider(request, task, keyPath, context, props);
          return;
        }
      case REACT_CONSUMER_TYPE:
        {
          var _context = type._context;
          renderContextConsumer(request, task, keyPath, _context, props);
          return;
        }
      case REACT_LAZY_TYPE:
        {
          renderLazyComponent(request, task, keyPath, type, props, ref);
          return;
        }
    }
  }
  var info = '';
  throw new Error('Element type is invalid: expected a string (for built-in ' + 'components) or a class/function (for composite components) ' + ("but got: " + (type == null ? type : typeof type) + "." + info));
}
function resumeNode(request, task, segmentId, node, childIndex) {
  var prevReplay = task.replay;
  var blockedBoundary = task.blockedBoundary;
  var resumedSegment = createPendingSegment(request, 0, null, task.formatContext, false, false);
  resumedSegment.id = segmentId;
  resumedSegment.parentFlushed = true;
  try {
    // Convert the current ReplayTask to a RenderTask.
    var renderTask = task;
    renderTask.replay = null;
    renderTask.blockedSegment = resumedSegment;
    renderNode(request, task, node, childIndex);
    resumedSegment.status = COMPLETED;
    finishedSegment(request, blockedBoundary, resumedSegment);
    if (blockedBoundary === null) {
      request.completedRootSegment = resumedSegment;
    } else {
      queueCompletedSegment(blockedBoundary, resumedSegment);
      if (blockedBoundary.parentFlushed) {
        request.partialBoundaries.push(blockedBoundary);
      }
    }
  } finally {
    // Restore to a ReplayTask.
    task.replay = prevReplay;
    task.blockedSegment = null;
  }
}
function replayElement(request, task, keyPath, name, keyOrIndex, childIndex, type, props, ref, replay) {
  // We're replaying. Find the path to follow.
  var replayNodes = replay.nodes;
  for (var i = 0; i < replayNodes.length; i++) {
    // Flow doesn't support refinement on tuples so we do it manually here.
    var node = replayNodes[i];
    if (keyOrIndex !== node[1]) {
      continue;
    }
    if (node.length === 4) {
      // Matched a replayable path.
      // Let's double check that the component name matches as a precaution.
      if (name !== null && name !== node[0]) {
        throw new Error('Expected the resume to render <' + node[0] + '> in this slot but instead it rendered <' + name + '>. ' + "The tree doesn't match so React will fallback to client rendering.");
      }
      var childNodes = node[2];
      var childSlots = node[3];
      var currentNode = task.node;
      task.replay = {
        nodes: childNodes,
        slots: childSlots,
        pendingTasks: 1
      };
      try {
        renderElement(request, task, keyPath, type, props, ref);
        if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0
        // TODO check remaining slots
        ) {
          throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
        }
        task.replay.pendingTasks--;
      } catch (x) {
        if (typeof x === 'object' && x !== null && (x === SuspenseException || typeof x.then === 'function')) {
          // Suspend
          if (task.node === currentNode) {
            // This same element suspended so we need to pop the replay we just added.
            task.replay = replay;
          } else {
            // We finished rendering this node, so now we can consume this slot.
            replayNodes.splice(i, 1);
          }
          throw x;
        }
        task.replay.pendingTasks--;
        // Unlike regular render, we don't terminate the siblings if we error
        // during a replay. That's because this component didn't actually error
        // in the original prerender. What's unable to complete is the child
        // replay nodes which might be Suspense boundaries which are able to
        // absorb the error and we can still continue with siblings.
        var thrownInfo = getThrownInfo(task.componentStack);
        erroredReplay(request, task.blockedBoundary, x, thrownInfo, childNodes, childSlots);
      }
      task.replay = replay;
    } else {
      // Let's double check that the component type matches.
      if (type !== REACT_SUSPENSE_TYPE) {
        var expectedType = 'Suspense';
        throw new Error('Expected the resume to render <' + expectedType + '> in this slot but instead it rendered <' + (getComponentNameFromType(type) || 'Unknown') + '>. ' + "The tree doesn't match so React will fallback to client rendering.");
      }
      // Matched a replayable path.
      replaySuspenseBoundary(request, task, keyPath, props, node[5], node[2], node[3], node[4] === null ? [] : node[4][2], node[4] === null ? null : node[4][3]);
    }
    // We finished rendering this node, so now we can consume this
    // slot. This must happen after in case we rerender this task.
    replayNodes.splice(i, 1);
    return;
  }
  // We didn't find any matching nodes. We assume that this element was already
  // rendered in the prelude and skip it.
}

// This function by it self renders a node and consumes the task by mutating it
// to update the current execution state.
function renderNodeDestructive(request, task, node, childIndex) {
  if (task.replay !== null && typeof task.replay.slots === 'number') {
    // TODO: Figure out a cheaper place than this hot path to do this check.
    var resumeSegmentID = task.replay.slots;
    resumeNode(request, task, resumeSegmentID, node, childIndex);
    return;
  }
  // Stash the node we're working on. We'll pick up from this task in case
  // something suspends.
  task.node = node;
  task.childIndex = childIndex;
  var previousComponentStack = task.componentStack;
  pushComponentStack(task);
  retryNode(request, task);
  task.componentStack = previousComponentStack;
}
function retryNode(request, task) {
  var node = task.node;
  var childIndex = task.childIndex;
  if (node === null) {
    return;
  }

  // Handle object types
  if (typeof node === 'object') {
    switch (node.$$typeof) {
      case REACT_ELEMENT_TYPE:
        {
          var element = node;
          var type = element.type;
          var key = element.key;
          var props = element.props;

          // TODO: We should get the ref off the props object right before using
          // it.
          var refProp = props.ref;
          var ref = refProp !== undefined ? refProp : null;
          var debugTask = null;
          var name = getComponentNameFromType(type);
          var keyOrIndex = key == null || key === REACT_OPTIMISTIC_KEY ? childIndex === -1 ? 0 : childIndex : key;
          var keyPath = [task.keyPath, name, keyOrIndex];
          if (task.replay !== null) {
            if (debugTask) {
              debugTask.run(replayElement.bind(null, request, task, keyPath, name, keyOrIndex, childIndex, type, props, ref, task.replay));
            } else {
              replayElement(request, task, keyPath, name, keyOrIndex, childIndex, type, props, ref, task.replay);
            }
            // No matches found for this node. We assume it's already emitted in the
            // prelude and skip it during the replay.
          } else {
            // We're doing a plain render.
            if (debugTask) {
              debugTask.run(renderElement.bind(null, request, task, keyPath, type, props, ref));
            } else {
              renderElement(request, task, keyPath, type, props, ref);
            }
          }
          return;
        }
      case REACT_PORTAL_TYPE:
        throw new Error('Portals are not currently supported by the server renderer. ' + 'Render them conditionally so that they only appear on the client render.');
      case REACT_LAZY_TYPE:
        {
          var lazyNode = node;
          var resolvedNode;
          {
            var payload = lazyNode._payload;
            var init = lazyNode._init;
            resolvedNode = init(payload);
          }
          if (request.status === ABORTING) {
            // eslint-disable-next-line no-throw-literal
            throw null;
          }
          // Now we render the resolved node
          renderNodeDestructive(request, task, resolvedNode, childIndex);
          return;
        }
    }
    if (isArray(node)) {
      renderChildrenArray(request, task, node, childIndex);
      return;
    }
    var iteratorFn = getIteratorFn(node);
    if (iteratorFn) {
      var iterator = iteratorFn.call(node);
      if (iterator) {
        // We need to know how many total children are in this set, so that we
        // can allocate enough id slots to acommodate them. So we must exhaust
        // the iterator before we start recursively rendering the children.
        // TODO: This is not great but I think it's inherent to the id
        // generation algorithm.
        var step = iterator.next();
        if (!step.done) {
          var children = [];
          do {
            children.push(step.value);
            step = iterator.next();
          } while (!step.done);
          renderChildrenArray(request, task, children, childIndex);
        }
        return;
      }
    }
    if (typeof node[ASYNC_ITERATOR] === 'function') {
      var _iterator2 = node[ASYNC_ITERATOR]();
      if (_iterator2) {
        // TODO: Update the task.node to be the iterator to avoid asking
        // for new iterators, but we currently warn for rendering these
        // so needs some refactoring to deal with the warning.

        // Restore the thenable state before resuming.
        var prevThenableState = task.thenableState;
        task.thenableState = null;
        prepareToUseThenableState(prevThenableState);

        // We need to know how many total children are in this set, so that we
        // can allocate enough id slots to acommodate them. So we must exhaust
        // the iterator before we start recursively rendering the children.
        // TODO: This is not great but I think it's inherent to the id
        // generation algorithm.
        var _children2 = [];
        var done = false;
        if (_iterator2 === node) {
          // If it's an iterator we need to continue reading where we left
          // off. We can do that by reading the first few rows from the previous
          // thenable state.
          // $FlowFixMe
          var _step3 = readPreviousThenableFromState();
          while (_step3 !== undefined) {
            if (_step3.done) {
              done = true;
              break;
            }
            _children2.push(_step3.value);
            _step3 = readPreviousThenableFromState();
          }
        }
        if (!done) {
          var _step4 = unwrapThenable(_iterator2.next());
          while (!_step4.done) {
            _children2.push(_step4.value);
            _step4 = unwrapThenable(_iterator2.next());
          }
        }
        renderChildrenArray(request, task, _children2, childIndex);
        return;
      }
    }

    // Usables are a valid React node type. When React encounters a Usable in
    // a child position, it unwraps it using the same algorithm as `use`. For
    // example, for promises, React will throw an exception to unwind the
    // stack, then replay the component once the promise resolves.
    //
    // A difference from `use` is that React will keep unwrapping the value
    // until it reaches a non-Usable type.
    //
    // e.g. Usable<Usable<Usable<T>>> should resolve to T
    var maybeUsable = node;
    if (typeof maybeUsable.then === 'function') {
      // Clear any previous thenable state that was created by the unwrapping.
      task.thenableState = null;
      var thenable = maybeUsable;
      var result = renderNodeDestructive(request, task, unwrapThenable(thenable), childIndex);
      return result;
    }
    if (maybeUsable.$$typeof === REACT_CONTEXT_TYPE) {
      var context = maybeUsable;
      return renderNodeDestructive(request, task, readContext$1(context), childIndex);
    }

    // $FlowFixMe[method-unbinding]
    var childString = Object.prototype.toString.call(node);
    throw new Error("Objects are not valid as a React child (found: " + (childString === '[object Object]' ? 'object with keys {' + Object.keys(node).join(', ') + '}' : childString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
  }
  if (typeof node === 'string') {
    var segment = task.blockedSegment;
    if (segment === null) ; else {
      segment.lastPushedText = pushTextInstance(segment.chunks, node, request.renderState, segment.lastPushedText);
    }
    return;
  }
  if (typeof node === 'number' || typeof node === 'bigint') {
    var _segment = task.blockedSegment;
    if (_segment === null) ; else {
      _segment.lastPushedText = pushTextInstance(_segment.chunks, '' + node, request.renderState, _segment.lastPushedText);
    }
    return;
  }
}
function replayFragment(request, task, children, childIndex) {
  // If we're supposed follow this array, we'd expect to see a ReplayNode matching
  // this fragment.
  var replay = task.replay;
  var replayNodes = replay.nodes;
  for (var j = 0; j < replayNodes.length; j++) {
    var node = replayNodes[j];
    if (node[1] !== childIndex) {
      continue;
    }
    // Matched a replayable path.
    var childNodes = node[2];
    var childSlots = node[3];
    task.replay = {
      nodes: childNodes,
      slots: childSlots,
      pendingTasks: 1
    };
    try {
      renderChildrenArray(request, task, children, -1);
      if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0) {
        throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
      }
      task.replay.pendingTasks--;
    } catch (x) {
      if (typeof x === 'object' && x !== null && (x === SuspenseException || typeof x.then === 'function')) {
        // Suspend
        throw x;
      }
      task.replay.pendingTasks--;
      // Unlike regular render, we don't terminate the siblings if we error
      // during a replay. That's because this component didn't actually error
      // in the original prerender. What's unable to complete is the child
      // replay nodes which might be Suspense boundaries which are able to
      // absorb the error and we can still continue with siblings.
      // This is an error, stash the component stack if it is null.
      var thrownInfo = getThrownInfo(task.componentStack);
      erroredReplay(request, task.blockedBoundary, x, thrownInfo, childNodes, childSlots);
    }
    task.replay = replay;
    // We finished rendering this node, so now we can consume this
    // slot. This must happen after in case we rerender this task.
    replayNodes.splice(j, 1);
    break;
  }
}
function renderChildrenArray(request, task, children, childIndex) {
  var prevKeyPath = task.keyPath;
  if (childIndex !== -1) {
    task.keyPath = [task.keyPath, 'Fragment', childIndex];
    if (task.replay !== null) {
      replayFragment(request,
      // $FlowFixMe: Refined.
      task, children, childIndex);
      task.keyPath = prevKeyPath;
      return;
    }
  }
  var prevTreeContext = task.treeContext;
  var totalChildren = children.length;
  if (task.replay !== null) {
    // Replay
    // First we need to check if we have any resume slots at this level.
    var resumeSlots = task.replay.slots;
    if (resumeSlots !== null && typeof resumeSlots === 'object') {
      for (var i = 0; i < totalChildren; i++) {
        var node = children[i];
        task.treeContext = pushTreeContext(prevTreeContext, totalChildren, i);
        // We need to use the non-destructive form so that we can safely pop back
        // up and render the sibling if something suspends.
        var resumeSegmentID = resumeSlots[i];
        // TODO: If this errors we should still continue with the next sibling.
        if (typeof resumeSegmentID === 'number') {
          resumeNode(request, task, resumeSegmentID, node, i);
          // We finished rendering this node, so now we can consume this
          // slot. This must happen after in case we rerender this task.
          delete resumeSlots[i];
        } else {
          renderNode(request, task, node, i);
        }
      }
      task.treeContext = prevTreeContext;
      task.keyPath = prevKeyPath;
      return;
    }
  }
  for (var _i4 = 0; _i4 < totalChildren; _i4++) {
    var _node4 = children[_i4];
    task.treeContext = pushTreeContext(prevTreeContext, totalChildren, _i4);
    // We need to use the non-destructive form so that we can safely pop back
    // up and render the sibling if something suspends.
    renderNode(request, task, _node4, _i4);
  }

  // Because this context is always set right before rendering every child, we
  // only need to reset it to the previous value at the very end.
  task.treeContext = prevTreeContext;
  task.keyPath = prevKeyPath;
}
function trackPostponedBoundary(request, trackedPostpones, boundary) {
  boundary.status = POSTPONED;
  // We need to eagerly assign it an ID because we'll need to refer to
  // it before flushing and we know that we can't inline it.
  boundary.rootSegmentID = request.nextSegmentId++;
  var tracked = boundary.tracked;
  if (tracked === null) {
    throw new Error('It should not be possible to postpone at the root. This is a bug in React.');
  }
  var boundaryKeyPath = tracked.contentKeyPath;
  if (boundaryKeyPath === null) {
    throw new Error('It should not be possible to postpone at the root. This is a bug in React.');
  }
  var fallbackReplayNode = tracked.fallbackNode;
  var children = [];
  var boundaryNode = trackedPostpones.workingMap.get(boundaryKeyPath);
  if (boundaryNode === undefined) {
    var suspenseBoundary = [boundaryKeyPath[1], boundaryKeyPath[2], children, null, fallbackReplayNode, boundary.rootSegmentID];
    trackedPostpones.workingMap.set(boundaryKeyPath, suspenseBoundary);
    addToReplayParent(suspenseBoundary, boundaryKeyPath[0], trackedPostpones);
    return suspenseBoundary;
  } else {
    // Upgrade to ReplaySuspenseBoundary.
    var _suspenseBoundary = boundaryNode;
    _suspenseBoundary[4] = fallbackReplayNode;
    _suspenseBoundary[5] = boundary.rootSegmentID;
    return _suspenseBoundary;
  }
}
function trackPostpone(request, trackedPostpones, task, segment) {
  segment.status = POSTPONED;
  var keyPath = task.keyPath;
  var boundary = task.blockedBoundary;
  if (boundary === null) {
    segment.id = request.nextSegmentId++;
    trackedPostpones.rootSlots = segment.id;
    if (request.completedRootSegment !== null) {
      // Postpone the root if this was a deeper segment.
      request.completedRootSegment.status = POSTPONED;
    }
    return;
  }
  if (boundary !== null && boundary.status === PENDING) {
    var boundaryNode = trackPostponedBoundary(request, trackedPostpones, boundary);
    if (boundary.tracked !== null && boundary.tracked.contentKeyPath === keyPath && task.childIndex === -1) {
      // Assign ID
      if (segment.id === -1) {
        if (segment.parentFlushed) {
          // If this segment's parent was already flushed, it means we really just
          // skipped the parent and this segment is now the root.
          segment.id = boundary.rootSegmentID;
        } else {
          segment.id = request.nextSegmentId++;
        }
      }
      // We postponed directly inside the Suspense boundary so we mark this for resuming.
      boundaryNode[3] = segment.id;
      return;
    }
    // Otherwise, fall through to add the child node.
  }

  // We know that this will leave a hole so we might as well assign an ID now.
  // We might have one already if we had a parent that gave us its ID.
  if (segment.id === -1) {
    if (segment.parentFlushed && boundary !== null) {
      // If this segment's parent was already flushed, it means we really just
      // skipped the parent and this segment is now the root.
      segment.id = boundary.rootSegmentID;
    } else {
      segment.id = request.nextSegmentId++;
    }
  }
  if (task.childIndex === -1) {
    // Resume starting from directly inside the previous parent element.
    if (keyPath === null) {
      trackedPostpones.rootSlots = segment.id;
    } else {
      var workingMap = trackedPostpones.workingMap;
      var resumableNode = workingMap.get(keyPath);
      if (resumableNode === undefined) {
        resumableNode = [keyPath[1], keyPath[2], [], segment.id];
        addToReplayParent(resumableNode, keyPath[0], trackedPostpones);
      } else {
        resumableNode[3] = segment.id;
      }
    }
  } else {
    var slots;
    if (keyPath === null) {
      slots = trackedPostpones.rootSlots;
      if (slots === null) {
        slots = trackedPostpones.rootSlots = {};
      } else if (typeof slots === 'number') {
        throw new Error('It should not be possible to postpone both at the root of an element ' + 'as well as a slot below. This is a bug in React.');
      }
    } else {
      var _workingMap = trackedPostpones.workingMap;
      var _resumableNode = _workingMap.get(keyPath);
      if (_resumableNode === undefined) {
        slots = {};
        _resumableNode = [keyPath[1], keyPath[2], [], slots];
        _workingMap.set(keyPath, _resumableNode);
        addToReplayParent(_resumableNode, keyPath[0], trackedPostpones);
      } else {
        slots = _resumableNode[3];
        if (slots === null) {
          slots = _resumableNode[3] = {};
        } else if (typeof slots === 'number') {
          throw new Error('It should not be possible to postpone both at the root of an element ' + 'as well as a slot below. This is a bug in React.');
        }
      }
    }
    slots[task.childIndex] = segment.id;
  }
}

// In case a boundary errors, we need to stop tracking it because we won't
// resume it.
function untrackBoundary(request, boundary) {
  var trackedPostpones = request.trackedPostpones;
  if (trackedPostpones === null) {
    return;
  }
  var tracked = boundary.tracked;
  if (tracked === null) {
    return;
  }
  var boundaryKeyPath = tracked.contentKeyPath;
  if (boundaryKeyPath === null) {
    return;
  }
  var boundaryNode = trackedPostpones.workingMap.get(boundaryKeyPath);
  if (boundaryNode === undefined) {
    return;
  }

  // Downgrade to plain ReplayNode since we won't replay through it.
  // $FlowFixMe[cannot-write]: We intentionally downgrade this to the other tuple.
  boundaryNode.length = 4;
  // Remove any resumable slots.
  boundaryNode[2] = [];
  boundaryNode[3] = null;

  // TODO: We should really just remove the boundary from all parent paths too so
  // we don't replay the path to it.
}
function spawnNewSuspendedReplayTask(request, task, thenableState) {
  return createReplayTask(request, thenableState, task.replay, task.node, task.childIndex, task.blockedBoundary, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack);
}
function spawnNewSuspendedRenderTask(request, task, thenableState) {
  // Something suspended, we'll need to create a new segment and resolve it later.
  var segment = task.blockedSegment;
  var insertionIndex = segment.chunks.length;
  var newSegment = createPendingSegment(request, insertionIndex, null, task.formatContext,
  // Adopt the parent segment's leading text embed
  segment.lastPushedText,
  // Assume we are text embedded at the trailing edge
  true);
  segment.children.push(newSegment);
  // Reset lastPushedText for current Segment since the new Segment "consumed" it
  segment.lastPushedText = false;
  return createRenderTask(request, thenableState, task.node, task.childIndex, task.blockedBoundary, newSegment, task.blockedPreamble, task.hoistableState, task.abortSet, task.keyPath, task.formatContext, task.context, task.treeContext, task.row, task.componentStack);
}

// This is a non-destructive form of rendering a node. If it suspends it spawns
// a new task and restores the context of this task to what it was before.
function renderNode(request, task, node, childIndex) {
  // Snapshot the current context in case something throws to interrupt the
  // process.
  var previousFormatContext = task.formatContext;
  var previousContext = task.context;
  var previousKeyPath = task.keyPath;
  var previousTreeContext = task.treeContext;
  var previousComponentStack = task.componentStack;
  var x;
  // Store how much we've pushed at this point so we can reset it in case something
  // suspended partially through writing something.
  var segment = task.blockedSegment;
  if (segment === null) {
    // Replay
    task = task; // Refined
    var previousReplaySet = task.replay;
    try {
      return renderNodeDestructive(request, task, node, childIndex);
    } catch (thrownValue) {
      resetHooksState();
      x = thrownValue === SuspenseException ?
      // This is a special type of exception used for Suspense. For historical
      // reasons, the rest of the Suspense implementation expects the thrown
      // value to be a thenable, because before `use` existed that was the
      // (unstable) API for suspending. This implementation detail can change
      // later, once we deprecate the old API in favor of `use`.
      getSuspendedThenable() : thrownValue;
      if (request.status === ABORTING) ; else if (typeof x === 'object' && x !== null) {
        // $FlowFixMe[method-unbinding]
        if (typeof x.then === 'function') {
          var wakeable = x;
          var thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
          var newTask = spawnNewSuspendedReplayTask(request,
          // $FlowFixMe: Refined.
          task, thenableState);
          var ping = newTask.ping;
          wakeable.then(ping, ping);

          // Restore the context. We assume that this will be restored by the inner
          // functions in case nothing throws so we don't use "finally" here.
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          task.replay = previousReplaySet;
          // Restore all active ReactContexts to what they were before.
          switchContext(previousContext);
          return;
        }
        if (x.message === 'Maximum call stack size exceeded') {
          // This was a stack overflow. We do a lot of recursion in React by default for
          // performance but it can lead to stack overflows in extremely deep trees.
          // We do have the ability to create a trampoile if this happens which makes
          // this kind of zero-cost.
          var _thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
          var _newTask = spawnNewSuspendedReplayTask(request,
          // $FlowFixMe: Refined.
          task, _thenableState);

          // Immediately schedule the task for retrying.
          request.pingedTasks.push(_newTask);

          // Restore the context. We assume that this will be restored by the inner
          // functions in case nothing throws so we don't use "finally" here.
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          task.replay = previousReplaySet;
          // Restore all active ReactContexts to what they were before.
          switchContext(previousContext);
          return;
        }
      }

      // TODO: Abort any undiscovered Suspense boundaries in the ReplayNode.
    }
  } else {
    // Render
    var childrenLength = segment.children.length;
    var chunkLength = segment.chunks.length;
    try {
      return renderNodeDestructive(request, task, node, childIndex);
    } catch (thrownValue) {
      resetHooksState();

      // Reset the write pointers to where we started.
      segment.children.length = childrenLength;
      segment.chunks.length = chunkLength;
      x = thrownValue === SuspenseException ?
      // This is a special type of exception used for Suspense. For historical
      // reasons, the rest of the Suspense implementation expects the thrown
      // value to be a thenable, because before `use` existed that was the
      // (unstable) API for suspending. This implementation detail can change
      // later, once we deprecate the old API in favor of `use`.
      getSuspendedThenable() : thrownValue;
      if (request.status === ABORTING) ; else if (typeof x === 'object' && x !== null) {
        // $FlowFixMe[method-unbinding]
        if (typeof x.then === 'function') {
          var _wakeable = x;
          var _thenableState2 = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
          var _newTask2 = spawnNewSuspendedRenderTask(request,
          // $FlowFixMe: Refined.
          task, _thenableState2);
          var _ping = _newTask2.ping;
          _wakeable.then(_ping, _ping);

          // Restore the context. We assume that this will be restored by the inner
          // functions in case nothing throws so we don't use "finally" here.
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          // Restore all active ReactContexts to what they were before.
          switchContext(previousContext);
          return;
        }
        if (x.message === 'Maximum call stack size exceeded') {
          // This was a stack overflow. We do a lot of recursion in React by default for
          // performance but it can lead to stack overflows in extremely deep trees.
          // We do have the ability to create a trampoile if this happens which makes
          // this kind of zero-cost.
          var _thenableState3 = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
          var _newTask3 = spawnNewSuspendedRenderTask(request,
          // $FlowFixMe: Refined.
          task, _thenableState3);

          // Immediately schedule the task for retrying.
          request.pingedTasks.push(_newTask3);

          // Restore the context. We assume that this will be restored by the inner
          // functions in case nothing throws so we don't use "finally" here.
          task.formatContext = previousFormatContext;
          task.context = previousContext;
          task.keyPath = previousKeyPath;
          task.treeContext = previousTreeContext;
          task.componentStack = previousComponentStack;
          // Restore all active ReactContexts to what they were before.
          switchContext(previousContext);
          return;
        }
      }
    }
  }

  // Restore the context. We assume that this will be restored by the inner
  // functions in case nothing throws so we don't use "finally" here.
  task.formatContext = previousFormatContext;
  task.context = previousContext;
  task.keyPath = previousKeyPath;
  task.treeContext = previousTreeContext;
  // We intentionally do not restore the component stack on the error pathway
  // Whatever handles the error needs to use this stack which is the location of the
  // error. We must restore the stack wherever we handle this

  // Restore all active ReactContexts to what they were before.
  switchContext(previousContext);
  throw x;
}
function erroredReplay(request, boundary, error, errorInfo, replayNodes, resumeSlots, debugTask) {
  // Erroring during a replay doesn't actually cause an error by itself because
  // that component has already rendered. What causes the error is the resumable
  // points that we did not yet finish which will be below the point of the reset.
  // For example, if we're replaying a path to a Suspense boundary that is not done
  // that doesn't error the parent Suspense boundary.
  // This might be a bit strange that the error in a parent gets thrown at a child.
  // We log it only once and reuse the digest.
  var errorDigest = logRecoverableError(request, error, errorInfo);
  abortRemainingReplayNodes(request, boundary, replayNodes, resumeSlots, error, errorDigest);
}
function erroredTask(request, boundary, row, error, errorInfo, debugTask) {
  if (row !== null) {
    if (--row.pendingTasks === 0) {
      finishSuspenseListRow(request, row);
    }
  }
  request.allPendingTasks--;

  // Report the error to a global handler.
  // We don't handle halts here because we only halt when prerendering and
  // when prerendering we should be finishing tasks not erroring them when
  // they halt or postpone
  var errorDigest = logRecoverableError(request, error, errorInfo);
  if (boundary === null) {
    fatalError(request, error);
  } else {
    boundary.pendingTasks--;
    if (boundary.status !== CLIENT_RENDERED) {
      boundary.status = CLIENT_RENDERED;
      encodeErrorForBoundary(boundary, errorDigest);
      untrackBoundary(request, boundary);
      var boundaryRow = boundary.row;
      if (boundaryRow !== null) {
        // Unblock the SuspenseListRow that was blocked by this boundary.
        // finishSuspenseListRow → unblockSuspenseListRow → finishedTask reenters
        // and decrements allPendingTasks. Pin the counter above zero so those
        // nested calls can't trip completeAll before this outer frame's own
        // zero check at the end.
        request.allPendingTasks++;
        if (--boundaryRow.pendingTasks === 0) {
          finishSuspenseListRow(request, boundaryRow);
        }
        request.allPendingTasks--;
      }

      // Regardless of what happens next, this boundary won't be displayed,
      // so we can flush it, if the parent already flushed.
      if (boundary.parentFlushed) {
        // We don't have a preference where in the queue this goes since it's likely
        // to error on the client anyway. However, intentionally client-rendered
        // boundaries should be flushed earlier so that they can start on the client.
        // We reuse the same queue for errors.
        request.clientRenderedBoundaries.push(boundary);
      }
      if (request.pendingRootTasks === 0 && request.trackedPostpones === null && boundary.preamble !== null) {
        // The root is complete and this boundary may contribute part of the preamble.
        // We eagerly attempt to prepare the preamble here because we expect most requests
        // to have few boundaries which contribute preambles and it allow us to do this
        // preparation work during the work phase rather than the when flushing.
        preparePreamble(request);
      }
    }
  }
  if (request.allPendingTasks === 0) {
    completeAll(request);
  }
}
function abortTaskSoft(task) {
  // This aborts task without aborting the parent boundary that it blocks.
  // It's used for when we didn't need this task to complete the tree.
  // If task was needed, then it should use abortTask instead.
  var request = this;
  var boundary = task.blockedBoundary;
  var segment = task.blockedSegment;
  if (segment !== null) {
    segment.status = ABORTED;
    finishedTask(request, boundary, task.row, segment);
  }
}
function abortRemainingSuspenseBoundary(request, rootSegmentID, error, errorDigest, errorInfo, wasAborted) {
  var resumedBoundary = createSuspenseBoundary(request, null, new Set(), null, false);
  resumedBoundary.parentFlushed = true;
  // We restore the same id of this boundary as was used during prerender.
  resumedBoundary.rootSegmentID = rootSegmentID;
  resumedBoundary.status = CLIENT_RENDERED;
  encodeErrorForBoundary(resumedBoundary, errorDigest);
  if (resumedBoundary.parentFlushed) {
    request.clientRenderedBoundaries.push(resumedBoundary);
  }
}
function abortRemainingReplayNodes(request, boundary, nodes, slots, error, errorDigest, errorInfo, aborted) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.length === 4) {
      abortRemainingReplayNodes(request, boundary, node[2], node[3], error, errorDigest);
    } else {
      var boundaryNode = node;
      var rootSegmentID = boundaryNode[5];
      abortRemainingSuspenseBoundary(request, rootSegmentID, error, errorDigest);
    }
  }
  // Empty the set, since we've cleared it now.
  nodes.length = 0;
  if (slots !== null) {
    // We had something still to resume in the parent boundary. We must trigger
    // the error on the parent boundary since it's not able to complete.
    if (boundary === null) {
      throw new Error('We should not have any resumable nodes in the shell. ' + 'This is a bug in React.');
    } else if (boundary.status !== CLIENT_RENDERED) {
      boundary.status = CLIENT_RENDERED;
      encodeErrorForBoundary(boundary, errorDigest);
      if (boundary.parentFlushed) {
        request.clientRenderedBoundaries.push(boundary);
      }
    }
    // Empty the set
    if (typeof slots === 'object') {
      for (var index in slots) {
        delete slots[index];
      }
    }
  }
}
function abortTask(task, request, error) {
  // This aborts the task and aborts the parent that it blocks, putting it into
  // client rendered mode.
  var boundary = task.blockedBoundary;
  var segment = task.blockedSegment;
  if (segment !== null) {
    if (segment.status === RENDERING) {
      // This is the a currently rendering Segment. The render itself will
      // abort the task.
      return;
    }
    segment.status = ABORTED;
  }
  var errorInfo = getThrownInfo(task.componentStack);
  if (boundary === null) {
    if (request.status !== CLOSING && request.status !== CLOSED) {
      var replay = task.replay;
      if (replay === null) {
        // We didn't complete the root so we have nothing to show. We can close
        // the request;
        if (request.trackedPostpones !== null && segment !== null) {
          var trackedPostpones = request.trackedPostpones;
          // We are aborting a prerender and must treat the shell as halted
          // We log the error but we still resolve the prerender
          logRecoverableError(request, error, errorInfo);
          trackPostpone(request, trackedPostpones, task, segment);
          finishedTask(request, null, task.row, segment);
        } else {
          logRecoverableError(request, error, errorInfo);
          fatalError(request, error);
        }
        return;
      } else {
        // If the shell aborts during a replay, that's not a fatal error. Instead
        // we should be able to recover by client rendering all the root boundaries in
        // the ReplaySet.
        replay.pendingTasks--;
        if (replay.pendingTasks === 0 && replay.nodes.length > 0) {
          var errorDigest = logRecoverableError(request, error, errorInfo);
          abortRemainingReplayNodes(request, null, replay.nodes, replay.slots, error, errorDigest);
        }
        request.pendingRootTasks--;
        if (request.pendingRootTasks === 0) {
          completeShell(request);
        }
      }
    }
  } else {
    // We construct an errorInfo from the boundary's componentStack so the error in dev will indicate which
    // boundary the message is referring to
    var _trackedPostpones = request.trackedPostpones;
    if (boundary.status !== CLIENT_RENDERED) {
      if (_trackedPostpones !== null && segment !== null) {
        // We are aborting a prerender and must halt this boundary.
        // We treat this like other postpones during prerendering
        logRecoverableError(request, error, errorInfo);
        trackPostpone(request, _trackedPostpones, task, segment);
        // If this boundary was still pending then we haven't already cancelled its fallbacks.
        // We'll need to abort the fallbacks, which will also error that parent boundary.
        boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
          return abortTask(fallbackTask, request, error);
        });
        boundary.fallbackAbortableTasks.clear();
        return finishedTask(request, boundary, task.row, segment);
      }
      boundary.status = CLIENT_RENDERED;
      // We are aborting a render or resume which should put boundaries
      // into an explicitly client rendered state
      var _errorDigest = logRecoverableError(request, error, errorInfo);
      boundary.status = CLIENT_RENDERED;
      encodeErrorForBoundary(boundary, _errorDigest);
      untrackBoundary(request, boundary);
      if (boundary.parentFlushed) {
        request.clientRenderedBoundaries.push(boundary);
      }
    }
    boundary.pendingTasks--;
    var boundaryRow = boundary.row;
    if (boundaryRow !== null) {
      // Unblock the SuspenseListRow that was blocked by this boundary.
      if (--boundaryRow.pendingTasks === 0) {
        finishSuspenseListRow(request, boundaryRow);
      }
    }

    // If this boundary was still pending then we haven't already cancelled its fallbacks.
    // We'll need to abort the fallbacks, which will also error that parent boundary.
    boundary.fallbackAbortableTasks.forEach(function (fallbackTask) {
      return abortTask(fallbackTask, request, error);
    });
    boundary.fallbackAbortableTasks.clear();
  }
  var row = task.row;
  if (row !== null) {
    if (--row.pendingTasks === 0) {
      finishSuspenseListRow(request, row);
    }
  }
  request.allPendingTasks--;
  if (request.allPendingTasks === 0) {
    completeAll(request);
  }
}
function abortTaskDEV(task, request, error) {
  {
    // These errors should never make it into a build so we don't need to encode them in codes.json
    // eslint-disable-next-line react-internal/prod-error-codes
    throw new Error('abortTaskDEV should never be called in production mode. This is a bug in React.');
  }
}
function safelyEmitEarlyPreloads(request, shellComplete) {
  try {
    emitEarlyPreloads(request.renderState, request.resumableState, shellComplete);
  } catch (error) {
    // We assume preloads are optimistic and thus non-fatal if errored.
    var errorInfo = {};
    logRecoverableError(request, error, errorInfo);
  }
}

// I extracted this function out because we want to ensure we consistently emit preloads before
// transitioning to the next request stage and this transition can happen in multiple places in this
// implementation.
function completeShell(request) {
  if (request.trackedPostpones === null) {
    // We only emit early preloads on shell completion for renders. For prerenders
    // we wait for the entire Request to finish because we are not responding to a
    // live request and can wait for as much data as possible.

    // we should only be calling completeShell when the shell is complete so we
    // just use a literal here
    var shellComplete = true;
    safelyEmitEarlyPreloads(request, shellComplete);
  }
  if (request.trackedPostpones === null) {
    // When the shell is complete it will be possible to flush. We attempt to prepre
    // the Preamble here in case it is ready for flushing.
    // We exclude prerenders because these cannot flush until after completeAll has been called
    preparePreamble(request);
  }

  // We have completed the shell so the shell can't error anymore.
  request.onShellError = noop;
  var onShellReady = request.onShellReady;
  onShellReady();
}

// I extracted this function out because we want to ensure we consistently emit preloads before
// transitioning to the next request stage and this transition can happen in multiple places in this
// implementation.
function completeAll(request) {
  // During a render the shell must be complete if the entire request is finished
  // however during a Prerender it is possible that the shell is incomplete because
  // it postponed. We cannot use rootPendingTasks in the prerender case because
  // those hit zero even when the shell postpones. Instead we look at the completedRootSegment
  var shellComplete = request.trackedPostpones === null ?
  // Render, we assume it is completed
  true :
  // Prerender Request, we use the state of the root segment
  request.completedRootSegment === null || request.completedRootSegment.status !== POSTPONED;
  safelyEmitEarlyPreloads(request, shellComplete);

  // When the shell is complete it will be possible to flush. We attempt to prepre
  // the Preamble here in case it is ready for flushing
  preparePreamble(request);
  var onAllReady = request.onAllReady;
  onAllReady();
}
function queueCompletedSegment(boundary, segment) {
  if (segment.chunks.length === 0 && segment.children.length === 1 && segment.children[0].boundary === null && segment.children[0].id === -1) {
    // This is an empty segment. There's nothing to write, so we can instead transfer the ID
    // to the child. That way any existing references point to the child.
    var childSegment = segment.children[0];
    childSegment.id = segment.id;
    childSegment.parentFlushed = true;
    if (childSegment.status === COMPLETED || childSegment.status === ABORTED || childSegment.status === ERRORED) {
      queueCompletedSegment(boundary, childSegment);
    }
  } else {
    var completedSegments = boundary.completedSegments;
    completedSegments.push(segment);
  }
}
function finishedSegment(request, boundary, segment) {
}
function finishedTask(request, boundary, row, segment) {
  if (row !== null) {
    if (--row.pendingTasks === 0) {
      finishSuspenseListRow(request, row);
    } else if (row.together) {
      tryToResolveTogetherRow(request, row);
    }
  }
  request.allPendingTasks--;
  if (boundary === null) {
    if (segment !== null && segment.parentFlushed) {
      if (request.completedRootSegment !== null) {
        throw new Error('There can only be one root segment. This is a bug in React.');
      }
      request.completedRootSegment = segment;
    }
    request.pendingRootTasks--;
    if (request.pendingRootTasks === 0) {
      completeShell(request);
    }
  } else {
    boundary.pendingTasks--;
    if (boundary.status === CLIENT_RENDERED) ; else if (boundary.pendingTasks === 0) {
      if (boundary.status === PENDING) {
        boundary.status = COMPLETED;
      }
      // This must have been the last segment we were waiting on. This boundary is now complete.
      if (segment !== null && segment.parentFlushed) {
        // Our parent segment already flushed, so we need to schedule this segment to be emitted.
        // If it is a segment that was aborted, we'll write other content instead so we don't need
        // to emit it.
        if (segment.status === COMPLETED || segment.status === ABORTED) {
          queueCompletedSegment(boundary, segment);
        }
      }
      if (boundary.parentFlushed) {
        // The segment might be part of a segment that didn't flush yet, but if the boundary's
        // parent flushed, we need to schedule the boundary to be emitted.
        request.completedBoundaries.push(boundary);
      }

      // We can now cancel any pending task on the fallback since we won't need to show it anymore.
      // This needs to happen after we read the parentFlushed flags because aborting can finish
      // work which can trigger user code, which can start flushing, which can change those flags.
      // If the boundary was POSTPONED, we still need to finish the fallback first.
      // If the boundary is eligible to be outlined during flushing we can't cancel the fallback
      // since we might need it when it's being outlined.
      if (boundary.status === COMPLETED) {
        var boundaryRow = boundary.row;
        if (boundaryRow !== null) {
          // Hoist the HoistableState from the boundary to the row so that the next rows
          // can depend on the same dependencies.
          hoistHoistables(boundaryRow.hoistables, boundary.contentState);
        }
        if (!isEligibleForOutlining(request, boundary)) {
          // abortTaskSoft (below) and finishSuspenseListRow → unblockSuspenseListRow
          // → finishedTask (further below) both reenter finishedTask and decrement
          // allPendingTasks. Pin the counter above zero for the duration of these
          // fan-outs so a nested finishedTask can't observe 0 and call completeAll
          // before this outer call reaches its own zero check.
          request.allPendingTasks++;
          boundary.fallbackAbortableTasks.forEach(abortTaskSoft, request);
          boundary.fallbackAbortableTasks.clear();
          if (boundaryRow !== null) {
            // If we aren't eligible for outlining, we don't have to wait until we flush it.
            if (--boundaryRow.pendingTasks === 0) {
              finishSuspenseListRow(request, boundaryRow);
            }
          }
          request.allPendingTasks--;
        }
        if (request.pendingRootTasks === 0 && request.trackedPostpones === null && boundary.preamble !== null) {
          // The root is complete and this boundary may contribute part of the preamble.
          // We eagerly attempt to prepare the preamble here because we expect most requests
          // to have few boundaries which contribute preambles and it allow us to do this
          // preparation work during the work phase rather than the when flushing.
          preparePreamble(request);
        }
      } else if (boundary.status === POSTPONED) {
        var _boundaryRow = boundary.row;
        if (_boundaryRow !== null) {
          if (request.trackedPostpones !== null) {
            // If this boundary is postponed, then we need to also postpone any blocked boundaries
            // in the next row.
            trackPostponedSuspenseListRow(request, request.trackedPostpones, _boundaryRow.next);
          }
          // finishSuspenseListRow → unblockSuspenseListRow → finishedTask reenters
          // and decrements allPendingTasks. Pin the counter above zero so those
          // nested calls can't trip completeAll before this outer frame's own
          // zero check at the end.
          request.allPendingTasks++;
          if (--_boundaryRow.pendingTasks === 0) {
            // This is really unnecessary since we've already postponed the boundaries but
            // for pairity with other track+finish paths. We might end up using the hoisting.
            finishSuspenseListRow(request, _boundaryRow);
          }
          request.allPendingTasks--;
        }
      }
    } else {
      if (segment !== null && segment.parentFlushed) {
        // Our parent already flushed, so we need to schedule this segment to be emitted.
        // If it is a segment that was aborted, we'll write other content instead so we don't need
        // to emit it.
        if (segment.status === COMPLETED || segment.status === ABORTED) {
          queueCompletedSegment(boundary, segment);
          var completedSegments = boundary.completedSegments;
          if (completedSegments.length === 1) {
            // This is the first time since we last flushed that we completed anything.
            // We can schedule this boundary to emit its partially completed segments early
            // in case the parent has already been flushed.
            if (boundary.parentFlushed) {
              request.partialBoundaries.push(boundary);
            }
          }
        }
      }
      var _boundaryRow2 = boundary.row;
      if (_boundaryRow2 !== null && _boundaryRow2.together) {
        tryToResolveTogetherRow(request, _boundaryRow2);
      }
    }
  }
  if (request.allPendingTasks === 0) {
    completeAll(request);
  }
}
function retryTask(request, task) {
  var segment = task.blockedSegment;
  if (segment === null) {
    retryReplayTask(request,
    // $FlowFixMe: Refined.
    task);
  } else {
    retryRenderTask(request,
    // $FlowFixMe: Refined.
    task, segment);
  }
}
function retryRenderTask(request, task, segment) {
  if (segment.status !== PENDING) {
    // We completed this by other means before we had a chance to retry it.
    return;
  }

  // We track when a Segment is rendering so we can handle aborts while rendering
  segment.status = RENDERING;

  // We restore the context to what it was when we suspended.
  // We don't restore it after we leave because it's likely that we'll end up
  // needing a very similar context soon again.
  switchContext(task.context);
  var childrenLength = segment.children.length;
  var chunkLength = segment.chunks.length;
  try {
    // We call the destructive form that mutates this task. That way if something
    // suspends again, we can reuse the same task instead of spawning a new one.

    retryNode(request, task);
    pushSegmentFinale(segment.chunks, request.renderState, segment.lastPushedText, segment.textEmbedded);
    task.abortSet.delete(task);
    segment.status = COMPLETED;
    finishedSegment(request, task.blockedBoundary, segment);
    finishedTask(request, task.blockedBoundary, task.row, segment);
  } catch (thrownValue) {
    resetHooksState();

    // Reset the write pointers to where we started.
    segment.children.length = childrenLength;
    segment.chunks.length = chunkLength;
    var x = thrownValue === SuspenseException ?
    // This is a special type of exception used for Suspense. For historical
    // reasons, the rest of the Suspense implementation expects the thrown
    // value to be a thenable, because before `use` existed that was the
    // (unstable) API for suspending. This implementation detail can change
    // later, once we deprecate the old API in favor of `use`.
    getSuspendedThenable() : request.status === ABORTING ? request.fatalError : thrownValue;
    if (request.status === ABORTING && request.trackedPostpones !== null) {
      // We are aborting a prerender and need to halt this task.
      var trackedPostpones = request.trackedPostpones;
      var thrownInfo = getThrownInfo(task.componentStack);
      task.abortSet.delete(task);
      logRecoverableError(request, x, thrownInfo);
      trackPostpone(request, trackedPostpones, task, segment);
      finishedTask(request, task.blockedBoundary, task.row, segment);
      return;
    }
    if (typeof x === 'object' && x !== null) {
      // $FlowFixMe[method-unbinding]
      if (typeof x.then === 'function') {
        // Something suspended again, let's pick it back up later.
        segment.status = PENDING;
        task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
        var ping = task.ping;
        // We've asserted that x is a thenable above
        x.then(ping, ping);
        return;
      }
    }
    var errorInfo = getThrownInfo(task.componentStack);
    task.abortSet.delete(task);
    segment.status = ERRORED;
    erroredTask(request, task.blockedBoundary, task.row, x, errorInfo);
    return;
  } finally {
  }
}
function retryReplayTask(request, task) {
  if (task.replay.pendingTasks === 0) {
    // There are no pending tasks working on this set, so we must have aborted.
    return;
  }

  // We restore the context to what it was when we suspended.
  // We don't restore it after we leave because it's likely that we'll end up
  // needing a very similar context soon again.
  switchContext(task.context);
  try {
    // We call the destructive form that mutates this task. That way if something
    // suspends again, we can reuse the same task instead of spawning a new one.
    if (typeof task.replay.slots === 'number') {
      var resumeSegmentID = task.replay.slots;
      resumeNode(request, task, resumeSegmentID, task.node, task.childIndex);
    } else {
      retryNode(request, task);
    }
    if (task.replay.pendingTasks === 1 && task.replay.nodes.length > 0) {
      throw new Error("Couldn't find all resumable slots by key/index during replaying. " + "The tree doesn't match so React will fallback to client rendering.");
    }
    task.replay.pendingTasks--;
    task.abortSet.delete(task);
    finishedTask(request, task.blockedBoundary, task.row, null);
  } catch (thrownValue) {
    resetHooksState();
    var x = thrownValue === SuspenseException ?
    // This is a special type of exception used for Suspense. For historical
    // reasons, the rest of the Suspense implementation expects the thrown
    // value to be a thenable, because before `use` existed that was the
    // (unstable) API for suspending. This implementation detail can change
    // later, once we deprecate the old API in favor of `use`.
    getSuspendedThenable() : thrownValue;
    if (typeof x === 'object' && x !== null) {
      // $FlowFixMe[method-unbinding]
      if (typeof x.then === 'function') {
        // Something suspended again, let's pick it back up later.
        var ping = task.ping;
        x.then(ping, ping);
        task.thenableState = thrownValue === SuspenseException ? getThenableStateAfterSuspending() : null;
        return;
      }
    }
    task.replay.pendingTasks--;
    task.abortSet.delete(task);
    var errorInfo = getThrownInfo(task.componentStack);
    erroredReplay(request, task.blockedBoundary, request.status === ABORTING ? request.fatalError : x, errorInfo, task.replay.nodes, task.replay.slots);
    request.pendingRootTasks--;
    if (request.pendingRootTasks === 0) {
      completeShell(request);
    }
    request.allPendingTasks--;
    if (request.allPendingTasks === 0) {
      completeAll(request);
    }
    return;
  } finally {
  }
}
function performWork(request) {
  if (request.status === CLOSED || request.status === CLOSING) {
    return;
  }
  var prevContext = getActiveContext();
  var prevDispatcher = ReactSharedInternals.H;
  ReactSharedInternals.H = HooksDispatcher;
  var prevAsyncDispatcher = ReactSharedInternals.A;
  ReactSharedInternals.A = DefaultAsyncDispatcher;
  var prevResumableState = currentResumableState;
  setCurrentResumableState(request.resumableState);
  try {
    var pingedTasks = request.pingedTasks;
    var i;
    for (i = 0; i < pingedTasks.length; i++) {
      var task = pingedTasks[i];
      retryTask(request, task);
    }
    pingedTasks.splice(0, i);
    if (request.destination !== null) {
      flushCompletedQueues(request, request.destination);
    }
  } catch (error) {
    var errorInfo = {};
    logRecoverableError(request, error, errorInfo);
    fatalError(request, error);
  } finally {
    setCurrentResumableState(prevResumableState);
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    if (prevDispatcher === HooksDispatcher) {
      // This means that we were in a reentrant work loop. This could happen
      // in a renderer that supports synchronous work like renderToString,
      // when it's called from within another renderer.
      // Normally we don't bother switching the contexts to their root/default
      // values when leaving because we'll likely need the same or similar
      // context again. However, when we're inside a synchronous loop like this
      // we'll to restore the context to what it was before returning.
      switchContext(prevContext);
    }
  }
}
function preparePreambleFromSubtree(request, segment, collectedPreambleSegments) {
  if (segment.preambleChildren.length) {
    collectedPreambleSegments.push(segment.preambleChildren);
  }
  var pendingPreambles = false;
  for (var i = 0; i < segment.children.length; i++) {
    var nextSegment = segment.children[i];
    pendingPreambles = preparePreambleFromSegment(request, nextSegment, collectedPreambleSegments) || pendingPreambles;
  }
  return pendingPreambles;
}
function preparePreambleFromSegment(request, segment, collectedPreambleSegments) {
  var boundary = segment.boundary;
  if (boundary === null) {
    // This segment is not a boundary, let's check it's children
    return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
  }
  var preamble = boundary.preamble;
  if (preamble === null) {
    // This boundary cannot have a preamble so it can't block the flushing of
    // the preamble.
    return false;
  }
  var status = boundary.status;
  switch (status) {
    case COMPLETED:
      {
        // This boundary is complete. It might have inner boundaries which are pending
        // and able to provide a preamble so we have to check it's children
        hoistPreambleState(request.renderState, preamble.content);
        // We track this boundary's byteSize on the request since it will always flush with
        // the request since it may contribute to the preamble
        request.byteSize += boundary.byteSize;
        var boundaryRootSegment = boundary.completedSegments[0];
        if (!boundaryRootSegment) {
          // Using the same error from flushSegment to avoid making a new one since conceptually the problem is still the same
          throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in React.');
        }
        return preparePreambleFromSubtree(request, boundaryRootSegment, collectedPreambleSegments);
      }
    case POSTPONED:
      {
        // This segment is postponed. When prerendering we consider this pending still because
        // it can resume. If we're rendering then this is equivalent to errored.
        if (request.trackedPostpones !== null) {
          // This boundary won't contribute a preamble to the current prerender
          return true;
        }
        // Expected fallthrough
      }
    case CLIENT_RENDERED:
      {
        if (segment.status === COMPLETED) {
          // This boundary is errored so if it contains a preamble we should include it
          hoistPreambleState(request.renderState, preamble.fallback);
          return preparePreambleFromSubtree(request, segment, collectedPreambleSegments);
        }
        // Expected fallthrough
      }
    default:
      // This boundary is still pending and might contain a preamble
      return true;
  }
}
function preparePreamble(request) {
  if (request.completedRootSegment && request.completedPreambleSegments === null) {
    var collectedPreambleSegments = [];
    var originalRequestByteSize = request.byteSize;
    var hasPendingPreambles = preparePreambleFromSegment(request, request.completedRootSegment, collectedPreambleSegments);
    if (isPreambleReady(request.renderState, hasPendingPreambles)) {
      request.completedPreambleSegments = collectedPreambleSegments;
    } else {
      // We restore the original size since the preamble is not ready
      // and we will prepare it again.
      request.byteSize = originalRequestByteSize;
    }
  }
}
function flushPreamble(request, destination, rootSegment, preambleSegments, skipBlockingShell) {
  // The preamble is ready.
  writePreambleStart(destination, request.resumableState, request.renderState);
  for (var i = 0; i < preambleSegments.length; i++) {
    var segments = preambleSegments[i];
    for (var j = 0; j < segments.length; j++) {
      flushSegment(request, destination, segments[j], null);
    }
  }
  writePreambleEnd(destination, request.renderState);
}
function flushSubtree(request, destination, segment, hoistableState) {
  segment.parentFlushed = true;
  switch (segment.status) {
    case PENDING:
      {
        // We're emitting a placeholder for this segment to be filled in later.
        // Therefore we'll need to assign it an ID - to refer to it by.
        segment.id = request.nextSegmentId++;
        // Fallthrough
      }
    case POSTPONED:
      {
        var segmentID = segment.id;
        // When this segment finally completes it won't be embedded in text since it will flush separately
        segment.lastPushedText = false;
        segment.textEmbedded = false;
        return writePlaceholder(destination, request.renderState, segmentID);
      }
    case COMPLETED:
      {
        segment.status = FLUSHED;
        var r = true;
        var chunks = segment.chunks;
        var chunkIdx = 0;
        var children = segment.children;
        for (var childIdx = 0; childIdx < children.length; childIdx++) {
          var nextChild = children[childIdx];
          // Write all the chunks up until the next child.
          for (; chunkIdx < nextChild.index; chunkIdx++) {
            writeChunk(destination, chunks[chunkIdx]);
          }
          r = flushSegment(request, destination, nextChild, hoistableState);
        }
        // Finally just write all the remaining chunks
        for (; chunkIdx < chunks.length - 1; chunkIdx++) {
          writeChunk(destination, chunks[chunkIdx]);
        }
        if (chunkIdx < chunks.length) {
          r = writeChunkAndReturn(destination, chunks[chunkIdx]);
        }
        return r;
      }
    case ABORTED:
      {
        return true;
      }
    default:
      {
        throw new Error('Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.');
      }
  }
}

// Running count for how much bytes of boundaries have flushed inlined into the currently
// flushing root or completed boundary.
var flushedByteSize = 0;
function flushSegment(request, destination, segment, hoistableState) {
  var boundary = segment.boundary;
  if (boundary === null) {
    // Not a suspense boundary.
    return flushSubtree(request, destination, segment, hoistableState);
  }

  // We're going to write the boundary. We don't need to maintain this reference since
  // we might reflush this segment at a later time (if it aborts and we inlined) but
  // we don't want to reflush the boundary
  segment.boundary = null;
  boundary.parentFlushed = true;
  // This segment is a Suspense boundary. We need to decide whether to
  // emit the content or the fallback now.
  if (boundary.status === CLIENT_RENDERED) {
    // Emit a client rendered suspense boundary wrapper.
    // We never queue the inner boundary so we'll never emit its content or partial segments.

    var row = boundary.row;
    if (row !== null) {
      // Since this boundary end up client rendered, we can unblock future suspense list rows.
      // This means that they may appear out of order if the future rows succeed but this is
      // a client rendered row.
      if (--row.pendingTasks === 0) {
        finishSuspenseListRow(request, row);
      }
    }
    {
      writeStartClientRenderedSuspenseBoundary(destination, request.renderState, boundary.errorDigest);
    }
    // Flush the fallback.
    flushSubtree(request, destination, segment, hoistableState);
    return writeEndClientRenderedSuspenseBoundary(destination, request.renderState);
  } else if (boundary.status !== COMPLETED) {
    if (boundary.status === PENDING) {
      // For pending boundaries we lazily assign an ID to the boundary
      // and root segment.
      boundary.rootSegmentID = request.nextSegmentId++;
    }
    if (boundary.completedSegments.length > 0) {
      // If this is at least partially complete, we can queue it to be partially emitted early.
      request.partialBoundaries.push(boundary);
    }

    // This boundary is still loading. Emit a pending suspense boundary wrapper.

    var id = boundary.rootSegmentID;
    writeStartPendingSuspenseBoundary(destination, request.renderState, id);
    if (hoistableState) {
      hoistHoistables(hoistableState, boundary.fallbackState);
    }
    // Flush the fallback.
    flushSubtree(request, destination, segment, hoistableState);
    return writeEndPendingSuspenseBoundary(destination);
  } else if (
  // We don't outline when we're emitting partially completed boundaries optimistically
  // because it doesn't make sense to outline something if its parent is going to be
  // blocked on something later in the stream anyway.
  !flushingPartialBoundaries && isEligibleForOutlining(request, boundary) && (flushedByteSize + boundary.byteSize > request.progressiveChunkSize || hasSuspenseyContent() || boundary.defer)) {
    // Inlining this boundary would make the current sequence being written too large
    // and block the parent for too long. Instead, it will be emitted separately so that we
    // can progressively show other content.
    // We add it to the queue during the flush because we have to ensure that
    // the parent flushes first so that there's something to inject it into.
    // We also have to make sure that it's emitted into the queue in a deterministic slot.
    // I.e. we can't insert it here when it completes.

    // Assign an ID to refer to the future content by.
    boundary.rootSegmentID = request.nextSegmentId++;
    request.completedBoundaries.push(boundary);
    // Emit a pending rendered suspense boundary wrapper.
    writeStartPendingSuspenseBoundary(destination, request.renderState, boundary.rootSegmentID);

    // While we are going to flush the fallback we are going to follow it up with
    // the completed boundary immediately so we make the choice to omit fallback
    // boundary state from the parent since it will be replaced when the boundary
    // flushes later in this pass or in a future flush

    // Flush the fallback.
    flushSubtree(request, destination, segment, hoistableState);
    return writeEndPendingSuspenseBoundary(destination);
  } else {
    // We're inlining this boundary so its bytes get counted to the current running count.
    flushedByteSize += boundary.byteSize;
    if (hoistableState) {
      hoistHoistables(hoistableState, boundary.contentState);
    }
    var _row = boundary.row;
    if (_row !== null && isEligibleForOutlining(request, boundary)) {
      // Once we have written the boundary, we can unblock the row and let future
      // rows be written. This may schedule new completed boundaries.
      if (--_row.pendingTasks === 0) {
        finishSuspenseListRow(request, _row);
      }
    }

    // We can inline this boundary's content as a complete boundary.
    writeStartCompletedSuspenseBoundary(destination, request.renderState);
    var completedSegments = boundary.completedSegments;
    if (completedSegments.length !== 1) {
      throw new Error('A previously unvisited boundary must have exactly one root segment. This is a bug in React.');
    }
    var contentSegment = completedSegments[0];
    flushSegment(request, destination, contentSegment, hoistableState);
    return writeEndCompletedSuspenseBoundary(destination, request.renderState);
  }
}
function flushClientRenderedBoundary(request, destination, boundary) {
  {
    return writeClientRenderBoundaryInstruction(destination, request.resumableState, request.renderState, boundary.rootSegmentID, boundary.errorDigest, null, null, null);
  }
}
function flushSegmentContainer(request, destination, segment, hoistableState) {
  writeStartSegment(destination, request.renderState, segment.parentFormatContext, segment.id);
  flushSegment(request, destination, segment, hoistableState);
  return writeEndSegment(destination, segment.parentFormatContext);
}
function flushCompletedBoundary(request, destination, boundary) {
  flushedByteSize = boundary.byteSize; // Start counting bytes
  var completedSegments = boundary.completedSegments;
  var i = 0;
  for (; i < completedSegments.length; i++) {
    var segment = completedSegments[i];
    flushPartiallyCompletedSegment(request, destination, boundary, segment);
  }
  completedSegments.length = 0;
  var row = boundary.row;
  if (row !== null && isEligibleForOutlining(request, boundary)) {
    // Once we have written the boundary, we can unblock the row and let future
    // rows be written. This may schedule new completed boundaries.
    if (--row.pendingTasks === 0) {
      finishSuspenseListRow(request, row);
    }
  }
  writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
  return writeCompletedBoundaryInstruction(destination, request.resumableState, request.renderState, boundary.rootSegmentID, boundary.contentState);
}
function flushPartialBoundary(request, destination, boundary) {
  flushedByteSize = boundary.byteSize; // Start counting bytes
  var completedSegments = boundary.completedSegments;
  var i = 0;
  for (; i < completedSegments.length; i++) {
    var segment = completedSegments[i];
    if (!flushPartiallyCompletedSegment(request, destination, boundary, segment)) {
      i++;
      completedSegments.splice(0, i);
      // Only write as much as the buffer wants. Something higher priority
      // might want to write later.
      return false;
    }
  }
  completedSegments.splice(0, i);
  var row = boundary.row;
  if (row !== null && row.together && boundary.pendingTasks === 1) {
    // "together" rows are blocked on their own boundaries.
    // We have now flushed all the boundary's segments as partials.
    // We can now unblock it from blocking the row that will eventually
    // unblock the boundary itself which can issue its complete instruction.
    // TODO: Ideally the complete instruction would be in a single <script> tag.
    if (row.pendingTasks === 1) {
      unblockSuspenseListRow(request, row, row.hoistables);
    } else {
      row.pendingTasks--;
    }
  }
  return writeHoistablesForBoundary(destination, boundary.contentState, request.renderState);
}
function flushPartiallyCompletedSegment(request, destination, boundary, segment) {
  if (segment.status === FLUSHED) {
    // We've already flushed this inline
    return true;
  }
  var hoistableState = boundary.contentState;
  var segmentID = segment.id;
  if (segmentID === -1) {
    // This segment wasn't previously referred to. This happens at the root of
    // a boundary. We make kind of a leap here and assume this is the root.
    var rootSegmentID = segment.id = boundary.rootSegmentID;
    if (rootSegmentID === -1) {
      throw new Error('A root segment ID must have been assigned by now. This is a bug in React.');
    }
    return flushSegmentContainer(request, destination, segment, hoistableState);
  } else if (segmentID === boundary.rootSegmentID) {
    // When we emit postponed boundaries, we might have assigned the ID already
    // but it's still the root segment so we can't inject it into the parent yet.
    return flushSegmentContainer(request, destination, segment, hoistableState);
  } else {
    flushSegmentContainer(request, destination, segment, hoistableState);
    return writeCompletedSegmentInstruction(destination, request.resumableState, request.renderState, segmentID);
  }
}
var flushingPartialBoundaries = false;
var flushingShell = false;
function flushCompletedQueues(request, destination) {
  try {
    // The structure of this is to go through each queue one by one and write
    // until the sink tells us to stop. When we should stop, we still finish writing
    // that item fully and then yield. At that point we remove the already completed
    // items up until the point we completed them.

    if (request.pendingRootTasks > 0) {
      // When there are pending root tasks we don't want to flush anything
      return;
    }
    var i;
    var completedRootSegment = request.completedRootSegment;
    if (completedRootSegment !== null) {
      if (completedRootSegment.status === POSTPONED) {
        return;
      }
      var completedPreambleSegments = request.completedPreambleSegments;
      if (completedPreambleSegments === null) {
        // The preamble isn't ready yet even though the root is so we omit flushing
        return;
      }
      flushedByteSize = request.byteSize; // Start counting bytes
      // TODO: Count the size of the preamble chunks too.
      var skipBlockingShell = false;
      if (enableFizzBlockingRender) {
        var blockingRenderMaxSize = getBlockingRenderMaxSize(request);
        if (flushedByteSize > blockingRenderMaxSize) {
          skipBlockingShell = true;
          var maxSizeKb = Math.round(blockingRenderMaxSize / 1000);
          var error = new Error('This rendered a large document (>' + maxSizeKb + ' kB) without any Suspense ' + 'boundaries around most of it. That can delay initial paint longer than ' + 'necessary. To improve load performance, add a <Suspense> or <SuspenseList> ' + 'around the content you expect to be below the header or below the fold. ' + 'In the meantime, the content will deopt to paint arbitrary incomplete ' + 'pieces of HTML.');
          var errorInfo = {};
          logRecoverableError(request, error, errorInfo, null);
        }
      }
      flushPreamble(request, destination, completedRootSegment, completedPreambleSegments, skipBlockingShell);
      flushingShell = true;
      flushSegment(request, destination, completedRootSegment, null);
      flushingShell = false;
      request.completedRootSegment = null;
      var isComplete = request.allPendingTasks === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0 && (request.trackedPostpones === null || request.trackedPostpones.rootNodes.length === 0 && request.trackedPostpones.rootSlots === null);
      writeCompletedRoot(destination, request.resumableState, request.renderState, isComplete);
    }
    writeHoistables(destination, request.resumableState, request.renderState);
    // We emit client rendering instructions for already emitted boundaries first.
    // This is so that we can signal to the client to start client rendering them as
    // soon as possible.
    var clientRenderedBoundaries = request.clientRenderedBoundaries;
    for (i = 0; i < clientRenderedBoundaries.length; i++) {
      var boundary = clientRenderedBoundaries[i];
      if (!flushClientRenderedBoundary(request, destination, boundary)) {
        request.destination = null;
        i++;
        clientRenderedBoundaries.splice(0, i);
        return;
      }
    }
    clientRenderedBoundaries.splice(0, i);

    // Next we emit any complete boundaries. It's better to favor boundaries
    // that are completely done since we can actually show them, than it is to emit
    // any individual segments from a partially complete boundary.
    var completedBoundaries = request.completedBoundaries;
    for (i = 0; i < completedBoundaries.length; i++) {
      var _boundary = completedBoundaries[i];
      if (!flushCompletedBoundary(request, destination, _boundary)) {
        request.destination = null;
        i++;
        completedBoundaries.splice(0, i);
        return;
      }
    }
    completedBoundaries.splice(0, i);

    // Allow anything written so far to flush to the underlying sink before
    // we continue with lower priorities.
    completeWriting(destination);
    beginWriting(destination);

    // TODO: Here we'll emit data used by hydration.

    // Next we emit any segments of any boundaries that are partially complete
    // but not deeply complete.
    flushingPartialBoundaries = true;
    var partialBoundaries = request.partialBoundaries;
    for (i = 0; i < partialBoundaries.length; i++) {
      var _boundary2 = partialBoundaries[i];
      if (!flushPartialBoundary(request, destination, _boundary2)) {
        request.destination = null;
        i++;
        partialBoundaries.splice(0, i);
        return;
      }
    }
    partialBoundaries.splice(0, i);
    flushingPartialBoundaries = false;

    // Next we check the completed boundaries again. This may have had
    // boundaries added to it in case they were too larged to be inlined.
    // SuspenseListRows might have been unblocked as well.
    // New ones might be added in this loop.
    var largeBoundaries = request.completedBoundaries;
    for (i = 0; i < largeBoundaries.length; i++) {
      var _boundary3 = largeBoundaries[i];
      if (!flushCompletedBoundary(request, destination, _boundary3)) {
        request.destination = null;
        i++;
        largeBoundaries.splice(0, i);
        return;
      }
    }
    largeBoundaries.splice(0, i);
  } finally {
    flushingPartialBoundaries = false;
    if (request.allPendingTasks === 0 && request.clientRenderedBoundaries.length === 0 && request.completedBoundaries.length === 0
    // We don't need to check any partially completed segments because
    // either they have pending task or they're complete.
    ) {
      request.flushScheduled = false;
      // We write the trailing tags but only if don't have any data to resume.
      // If we need to resume we'll write the postamble in the resume instead.
      writePostamble(destination, request.resumableState);
      // We're done.
      request.status = CLOSED;
      close(destination);
      // We need to stop flowing now because we do not want any async contexts which might call
      // float methods to initiate any flushes after this point
      stopFlowing(request);
    }
  }
}
function startWork(request) {
  request.flushScheduled = request.destination !== null;
  // When prerendering we use microtasks for pinging work
  {
    scheduleMicrotask(function () {
      return performWork(request);
    });
  }
  scheduleWork(function () {
    if (request.status === OPENING) {
      request.status = OPEN;
    }
    if (request.trackedPostpones === null) {
      // this is either a regular render or a resume. For regular render we want
      // to call emitEarlyPreloads after the first performWork because we want
      // are responding to a live request and need to balance sending something early
      // (i.e. don't want for the shell to finish) but we need something to send.
      // The only implementation of this is for DOM at the moment and during resumes nothing
      // actually emits but the code paths here are the same.
      // During a prerender we don't want to be too aggressive in emitting early preloads
      // because we aren't responding to a live request and we can wait for the prerender to
      // postpone before we emit anything.
      {
        enqueueEarlyPreloadsAfterInitialWork(request);
      }
    }
  });
}
function enqueueEarlyPreloadsAfterInitialWork(request) {
  var shellComplete = request.pendingRootTasks === 0;
  safelyEmitEarlyPreloads(request, shellComplete);
}
function startFlowing(request, destination) {
  if (request.status === CLOSING) {
    request.status = CLOSED;
    closeWithError(destination, request.fatalError);
    return;
  }
  if (request.status === CLOSED) {
    return;
  }
  if (request.destination !== null) {
    // We're already flowing.
    return;
  }
  request.destination = destination;
  try {
    flushCompletedQueues(request, destination);
  } catch (error) {
    var errorInfo = {};
    logRecoverableError(request, error, errorInfo);
    fatalError(request, error);
  }
}
function stopFlowing(request) {
  request.destination = null;
}

// This is called to early terminate a request. It puts all pending boundaries in client rendered state.
function abort(request, reason) {
  if (request.status === OPEN || request.status === OPENING) {
    request.status = ABORTING;
  }
  try {
    var abortableTasks = request.abortableTasks;
    if (abortableTasks.size > 0) {
      var error = reason === undefined ? new Error('The render was aborted by the server without a reason.') : typeof reason === 'object' && reason !== null && typeof reason.then === 'function' ? new Error('The render was aborted by the server with a promise.') : reason;
      // This error isn't necessarily fatal in this case but we need to stash it
      // so we can use it to abort any pending work
      request.fatalError = error;
      if (false) ; else {
        abortableTasks.forEach(function (task) {
          return abortTask(task, request, error);
        });
      }
      abortableTasks.clear();
    }
    if (request.destination !== null) {
      flushCompletedQueues(request, request.destination);
    }
  } catch (error) {
    var errorInfo = {};
    logRecoverableError(request, error, errorInfo);
    fatalError(request, error);
  }
}
function getFormState(request) {
  return request.formState;
}
function addToReplayParent(node, parentKeyPath, trackedPostpones) {
  if (parentKeyPath === null) {
    trackedPostpones.rootNodes.push(node);
  } else {
    var workingMap = trackedPostpones.workingMap;
    var parentNode = workingMap.get(parentKeyPath);
    if (parentNode === undefined) {
      parentNode = [parentKeyPath[1], parentKeyPath[2], [], null];
      workingMap.set(parentKeyPath, parentNode);
      addToReplayParent(parentNode, parentKeyPath[0], trackedPostpones);
    }
    parentNode[2].push(node);
  }
}

function onError() {
  // Non-fatal errors are ignored.
}
function renderToStringImpl(children, options, generateStaticMarkup, abortReason) {
  var didFatal = false;
  var fatalError = null;
  var result = '';
  var destination = {
    // $FlowFixMe[missing-local-annot]
    push: function (chunk) {
      if (chunk !== null) {
        result += chunk;
      }
      return true;
    },
    // $FlowFixMe[missing-local-annot]
    destroy: function (error) {
      didFatal = true;
      fatalError = error;
    }
  };
  var readyToStream = false;
  function onShellReady() {
    readyToStream = true;
  }
  var resumableState = createResumableState(options ? options.identifierPrefix : undefined, undefined);
  var request = createRequest(children, resumableState, createRenderState(resumableState, generateStaticMarkup), createRootFormatContext(), Infinity, onError, undefined, onShellReady, undefined, undefined, undefined);
  startWork(request);
  // If anything suspended and is still pending, we'll abort it before writing.
  // That way we write only client-rendered boundaries from the start.
  abort(request, abortReason);
  startFlowing(request, destination);
  if (didFatal && fatalError !== abortReason) {
    throw fatalError;
  }
  if (!readyToStream) {
    // Note: This error message is the one we use on the client. It doesn't
    // really make sense here. But this is the legacy server renderer, anyway.
    // We're going to delete it soon.
    throw new Error('A component suspended while responding to synchronous input. This ' + 'will cause the UI to be replaced with a loading indicator. To fix, ' + 'updates that suspend should be wrapped with startTransition.');
  }
  return result;
}

function renderToString(children, options) {
  return renderToStringImpl(children, options, false, 'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server');
}
function renderToStaticMarkup(children, options) {
  return renderToStringImpl(children, options, true, 'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToReadableStream" which supports Suspense on the server');
}

exports.renderToStaticMarkup = renderToStaticMarkup;
exports.renderToString = renderToString;
exports.version = ReactVersion;
