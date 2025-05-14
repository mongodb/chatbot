import { al as Ie, am as Me, g as De, _ as $e } from "./index2.js";
import { a as k } from "./jsx-dev-runtime.js";
import J from "react";
import te from "react-dom";
var q = Ie({
  key: "css"
});
q.flush;
q.hydrate;
var Je = q.cx;
q.merge;
q.getRegisteredStyles;
q.injectGlobal;
q.keyframes;
var Ke = q.css;
q.sheet;
q.cache;
var ye = { exports: {} }, b = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var be;
function ke() {
  if (be)
    return b;
  be = 1;
  var s = typeof Symbol == "function" && Symbol.for, g = s ? Symbol.for("react.element") : 60103, f = s ? Symbol.for("react.portal") : 60106, o = s ? Symbol.for("react.fragment") : 60107, n = s ? Symbol.for("react.strict_mode") : 60108, e = s ? Symbol.for("react.profiler") : 60114, u = s ? Symbol.for("react.provider") : 60109, c = s ? Symbol.for("react.context") : 60110, S = s ? Symbol.for("react.async_mode") : 60111, C = s ? Symbol.for("react.concurrent_mode") : 60111, _ = s ? Symbol.for("react.forward_ref") : 60112, O = s ? Symbol.for("react.suspense") : 60113, D = s ? Symbol.for("react.suspense_list") : 60120, w = s ? Symbol.for("react.memo") : 60115, N = s ? Symbol.for("react.lazy") : 60116, P = s ? Symbol.for("react.block") : 60121, M = s ? Symbol.for("react.fundamental") : 60117, j = s ? Symbol.for("react.responder") : 60118, H = s ? Symbol.for("react.scope") : 60119;
  function I(i) {
    if (typeof i == "object" && i !== null) {
      var U = i.$$typeof;
      switch (U) {
        case g:
          switch (i = i.type, i) {
            case S:
            case C:
            case o:
            case e:
            case n:
            case O:
              return i;
            default:
              switch (i = i && i.$$typeof, i) {
                case c:
                case _:
                case N:
                case w:
                case u:
                  return i;
                default:
                  return U;
              }
          }
        case f:
          return U;
      }
    }
  }
  function A(i) {
    return I(i) === C;
  }
  return b.AsyncMode = S, b.ConcurrentMode = C, b.ContextConsumer = c, b.ContextProvider = u, b.Element = g, b.ForwardRef = _, b.Fragment = o, b.Lazy = N, b.Memo = w, b.Portal = f, b.Profiler = e, b.StrictMode = n, b.Suspense = O, b.isAsyncMode = function(i) {
    return A(i) || I(i) === S;
  }, b.isConcurrentMode = A, b.isContextConsumer = function(i) {
    return I(i) === c;
  }, b.isContextProvider = function(i) {
    return I(i) === u;
  }, b.isElement = function(i) {
    return typeof i == "object" && i !== null && i.$$typeof === g;
  }, b.isForwardRef = function(i) {
    return I(i) === _;
  }, b.isFragment = function(i) {
    return I(i) === o;
  }, b.isLazy = function(i) {
    return I(i) === N;
  }, b.isMemo = function(i) {
    return I(i) === w;
  }, b.isPortal = function(i) {
    return I(i) === f;
  }, b.isProfiler = function(i) {
    return I(i) === e;
  }, b.isStrictMode = function(i) {
    return I(i) === n;
  }, b.isSuspense = function(i) {
    return I(i) === O;
  }, b.isValidElementType = function(i) {
    return typeof i == "string" || typeof i == "function" || i === o || i === C || i === e || i === n || i === O || i === D || typeof i == "object" && i !== null && (i.$$typeof === N || i.$$typeof === w || i.$$typeof === u || i.$$typeof === c || i.$$typeof === _ || i.$$typeof === M || i.$$typeof === j || i.$$typeof === H || i.$$typeof === P);
  }, b.typeOf = I, b;
}
var x = {}, xe;
function Ne() {
  return xe || (xe = 1, k.env.NODE_ENV !== "production" && function() {
    var s = typeof Symbol == "function" && Symbol.for, g = s ? Symbol.for("react.element") : 60103, f = s ? Symbol.for("react.portal") : 60106, o = s ? Symbol.for("react.fragment") : 60107, n = s ? Symbol.for("react.strict_mode") : 60108, e = s ? Symbol.for("react.profiler") : 60114, u = s ? Symbol.for("react.provider") : 60109, c = s ? Symbol.for("react.context") : 60110, S = s ? Symbol.for("react.async_mode") : 60111, C = s ? Symbol.for("react.concurrent_mode") : 60111, _ = s ? Symbol.for("react.forward_ref") : 60112, O = s ? Symbol.for("react.suspense") : 60113, D = s ? Symbol.for("react.suspense_list") : 60120, w = s ? Symbol.for("react.memo") : 60115, N = s ? Symbol.for("react.lazy") : 60116, P = s ? Symbol.for("react.block") : 60121, M = s ? Symbol.for("react.fundamental") : 60117, j = s ? Symbol.for("react.responder") : 60118, H = s ? Symbol.for("react.scope") : 60119;
    function I(r) {
      return typeof r == "string" || typeof r == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      r === o || r === C || r === e || r === n || r === O || r === D || typeof r == "object" && r !== null && (r.$$typeof === N || r.$$typeof === w || r.$$typeof === u || r.$$typeof === c || r.$$typeof === _ || r.$$typeof === M || r.$$typeof === j || r.$$typeof === H || r.$$typeof === P);
    }
    function A(r) {
      if (typeof r == "object" && r !== null) {
        var Y = r.$$typeof;
        switch (Y) {
          case g:
            var ee = r.type;
            switch (ee) {
              case S:
              case C:
              case o:
              case e:
              case n:
              case O:
                return ee;
              default:
                var Te = ee && ee.$$typeof;
                switch (Te) {
                  case c:
                  case _:
                  case N:
                  case w:
                  case u:
                    return Te;
                  default:
                    return Y;
                }
            }
          case f:
            return Y;
        }
      }
    }
    var i = S, U = C, re = c, ne = u, ie = g, oe = _, Z = o, ae = N, se = w, V = f, ue = e, L = n, F = O, Q = !1;
    function fe(r) {
      return Q || (Q = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), t(r) || A(r) === S;
    }
    function t(r) {
      return A(r) === C;
    }
    function a(r) {
      return A(r) === c;
    }
    function E(r) {
      return A(r) === u;
    }
    function v(r) {
      return typeof r == "object" && r !== null && r.$$typeof === g;
    }
    function l(r) {
      return A(r) === _;
    }
    function h(r) {
      return A(r) === o;
    }
    function d(r) {
      return A(r) === N;
    }
    function y(r) {
      return A(r) === w;
    }
    function m(r) {
      return A(r) === f;
    }
    function R(r) {
      return A(r) === e;
    }
    function T(r) {
      return A(r) === n;
    }
    function $(r) {
      return A(r) === O;
    }
    x.AsyncMode = i, x.ConcurrentMode = U, x.ContextConsumer = re, x.ContextProvider = ne, x.Element = ie, x.ForwardRef = oe, x.Fragment = Z, x.Lazy = ae, x.Memo = se, x.Portal = V, x.Profiler = ue, x.StrictMode = L, x.Suspense = F, x.isAsyncMode = fe, x.isConcurrentMode = t, x.isContextConsumer = a, x.isContextProvider = E, x.isElement = v, x.isForwardRef = l, x.isFragment = h, x.isLazy = d, x.isMemo = y, x.isPortal = m, x.isProfiler = R, x.isStrictMode = T, x.isSuspense = $, x.isValidElementType = I, x.typeOf = A;
  }()), x;
}
k.env.NODE_ENV === "production" ? ye.exports = ke() : ye.exports = Ne();
var Pe = ye.exports;
function je(s, g) {
  if (s == null)
    return {};
  var f = {};
  for (var o in s)
    if ({}.hasOwnProperty.call(s, o)) {
      if (g.indexOf(o) !== -1)
        continue;
      f[o] = s[o];
    }
  return f;
}
var Ee = { exports: {} }, ce, ge;
function me() {
  if (ge)
    return ce;
  ge = 1;
  var s = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return ce = s, ce;
}
var le, Se;
function we() {
  return Se || (Se = 1, le = Function.call.bind(Object.prototype.hasOwnProperty)), le;
}
var pe, Re;
function Le() {
  if (Re)
    return pe;
  Re = 1;
  var s = function() {
  };
  if (k.env.NODE_ENV !== "production") {
    var g = me(), f = {}, o = we();
    s = function(e) {
      var u = "Warning: " + e;
      typeof console < "u" && console.error(u);
      try {
        throw new Error(u);
      } catch {
      }
    };
  }
  function n(e, u, c, S, C) {
    if (k.env.NODE_ENV !== "production") {
      for (var _ in e)
        if (o(e, _)) {
          var O;
          try {
            if (typeof e[_] != "function") {
              var D = Error(
                (S || "React class") + ": " + c + " type `" + _ + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[_] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw D.name = "Invariant Violation", D;
            }
            O = e[_](u, _, S, c, null, g);
          } catch (N) {
            O = N;
          }
          if (O && !(O instanceof Error) && s(
            (S || "React class") + ": type specification of " + c + " `" + _ + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof O + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), O instanceof Error && !(O.message in f)) {
            f[O.message] = !0;
            var w = C ? C() : "";
            s(
              "Failed " + c + " type: " + O.message + (w ?? "")
            );
          }
        }
    }
  }
  return n.resetWarningCache = function() {
    k.env.NODE_ENV !== "production" && (f = {});
  }, pe = n, pe;
}
var de, _e;
function Ye() {
  if (_e)
    return de;
  _e = 1;
  var s = Pe, g = Me, f = me(), o = we(), n = Le(), e = function() {
  };
  k.env.NODE_ENV !== "production" && (e = function(c) {
    var S = "Warning: " + c;
    typeof console < "u" && console.error(S);
    try {
      throw new Error(S);
    } catch {
    }
  });
  function u() {
    return null;
  }
  return de = function(c, S) {
    var C = typeof Symbol == "function" && Symbol.iterator, _ = "@@iterator";
    function O(t) {
      var a = t && (C && t[C] || t[_]);
      if (typeof a == "function")
        return a;
    }
    var D = "<<anonymous>>", w = {
      array: j("array"),
      bigint: j("bigint"),
      bool: j("boolean"),
      func: j("function"),
      number: j("number"),
      object: j("object"),
      string: j("string"),
      symbol: j("symbol"),
      any: H(),
      arrayOf: I,
      element: A(),
      elementType: i(),
      instanceOf: U,
      node: oe(),
      objectOf: ne,
      oneOf: re,
      oneOfType: ie,
      shape: ae,
      exact: se
    };
    function N(t, a) {
      return t === a ? t !== 0 || 1 / t === 1 / a : t !== t && a !== a;
    }
    function P(t, a) {
      this.message = t, this.data = a && typeof a == "object" ? a : {}, this.stack = "";
    }
    P.prototype = Error.prototype;
    function M(t) {
      if (k.env.NODE_ENV !== "production")
        var a = {}, E = 0;
      function v(h, d, y, m, R, T, $) {
        if (m = m || D, T = T || y, $ !== f) {
          if (S) {
            var r = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw r.name = "Invariant Violation", r;
          } else if (k.env.NODE_ENV !== "production" && typeof console < "u") {
            var Y = m + ":" + y;
            !a[Y] && // Avoid spamming the console because they are often not actionable except for lib authors
            E < 3 && (e(
              "You are manually calling a React.PropTypes validation function for the `" + T + "` prop on `" + m + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), a[Y] = !0, E++);
          }
        }
        return d[y] == null ? h ? d[y] === null ? new P("The " + R + " `" + T + "` is marked as required " + ("in `" + m + "`, but its value is `null`.")) : new P("The " + R + " `" + T + "` is marked as required in " + ("`" + m + "`, but its value is `undefined`.")) : null : t(d, y, m, R, T);
      }
      var l = v.bind(null, !1);
      return l.isRequired = v.bind(null, !0), l;
    }
    function j(t) {
      function a(E, v, l, h, d, y) {
        var m = E[v], R = L(m);
        if (R !== t) {
          var T = F(m);
          return new P(
            "Invalid " + h + " `" + d + "` of type " + ("`" + T + "` supplied to `" + l + "`, expected ") + ("`" + t + "`."),
            { expectedType: t }
          );
        }
        return null;
      }
      return M(a);
    }
    function H() {
      return M(u);
    }
    function I(t) {
      function a(E, v, l, h, d) {
        if (typeof t != "function")
          return new P("Property `" + d + "` of component `" + l + "` has invalid PropType notation inside arrayOf.");
        var y = E[v];
        if (!Array.isArray(y)) {
          var m = L(y);
          return new P("Invalid " + h + " `" + d + "` of type " + ("`" + m + "` supplied to `" + l + "`, expected an array."));
        }
        for (var R = 0; R < y.length; R++) {
          var T = t(y, R, l, h, d + "[" + R + "]", f);
          if (T instanceof Error)
            return T;
        }
        return null;
      }
      return M(a);
    }
    function A() {
      function t(a, E, v, l, h) {
        var d = a[E];
        if (!c(d)) {
          var y = L(d);
          return new P("Invalid " + l + " `" + h + "` of type " + ("`" + y + "` supplied to `" + v + "`, expected a single ReactElement."));
        }
        return null;
      }
      return M(t);
    }
    function i() {
      function t(a, E, v, l, h) {
        var d = a[E];
        if (!s.isValidElementType(d)) {
          var y = L(d);
          return new P("Invalid " + l + " `" + h + "` of type " + ("`" + y + "` supplied to `" + v + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return M(t);
    }
    function U(t) {
      function a(E, v, l, h, d) {
        if (!(E[v] instanceof t)) {
          var y = t.name || D, m = fe(E[v]);
          return new P("Invalid " + h + " `" + d + "` of type " + ("`" + m + "` supplied to `" + l + "`, expected ") + ("instance of `" + y + "`."));
        }
        return null;
      }
      return M(a);
    }
    function re(t) {
      if (!Array.isArray(t))
        return k.env.NODE_ENV !== "production" && (arguments.length > 1 ? e(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : e("Invalid argument supplied to oneOf, expected an array.")), u;
      function a(E, v, l, h, d) {
        for (var y = E[v], m = 0; m < t.length; m++)
          if (N(y, t[m]))
            return null;
        var R = JSON.stringify(t, function($, r) {
          var Y = F(r);
          return Y === "symbol" ? String(r) : r;
        });
        return new P("Invalid " + h + " `" + d + "` of value `" + String(y) + "` " + ("supplied to `" + l + "`, expected one of " + R + "."));
      }
      return M(a);
    }
    function ne(t) {
      function a(E, v, l, h, d) {
        if (typeof t != "function")
          return new P("Property `" + d + "` of component `" + l + "` has invalid PropType notation inside objectOf.");
        var y = E[v], m = L(y);
        if (m !== "object")
          return new P("Invalid " + h + " `" + d + "` of type " + ("`" + m + "` supplied to `" + l + "`, expected an object."));
        for (var R in y)
          if (o(y, R)) {
            var T = t(y, R, l, h, d + "." + R, f);
            if (T instanceof Error)
              return T;
          }
        return null;
      }
      return M(a);
    }
    function ie(t) {
      if (!Array.isArray(t))
        return k.env.NODE_ENV !== "production" && e("Invalid argument supplied to oneOfType, expected an instance of array."), u;
      for (var a = 0; a < t.length; a++) {
        var E = t[a];
        if (typeof E != "function")
          return e(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + Q(E) + " at index " + a + "."
          ), u;
      }
      function v(l, h, d, y, m) {
        for (var R = [], T = 0; T < t.length; T++) {
          var $ = t[T], r = $(l, h, d, y, m, f);
          if (r == null)
            return null;
          r.data && o(r.data, "expectedType") && R.push(r.data.expectedType);
        }
        var Y = R.length > 0 ? ", expected one of type [" + R.join(", ") + "]" : "";
        return new P("Invalid " + y + " `" + m + "` supplied to " + ("`" + d + "`" + Y + "."));
      }
      return M(v);
    }
    function oe() {
      function t(a, E, v, l, h) {
        return V(a[E]) ? null : new P("Invalid " + l + " `" + h + "` supplied to " + ("`" + v + "`, expected a ReactNode."));
      }
      return M(t);
    }
    function Z(t, a, E, v, l) {
      return new P(
        (t || "React class") + ": " + a + " type `" + E + "." + v + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + l + "`."
      );
    }
    function ae(t) {
      function a(E, v, l, h, d) {
        var y = E[v], m = L(y);
        if (m !== "object")
          return new P("Invalid " + h + " `" + d + "` of type `" + m + "` " + ("supplied to `" + l + "`, expected `object`."));
        for (var R in t) {
          var T = t[R];
          if (typeof T != "function")
            return Z(l, h, d, R, F(T));
          var $ = T(y, R, l, h, d + "." + R, f);
          if ($)
            return $;
        }
        return null;
      }
      return M(a);
    }
    function se(t) {
      function a(E, v, l, h, d) {
        var y = E[v], m = L(y);
        if (m !== "object")
          return new P("Invalid " + h + " `" + d + "` of type `" + m + "` " + ("supplied to `" + l + "`, expected `object`."));
        var R = g({}, E[v], t);
        for (var T in R) {
          var $ = t[T];
          if (o(t, T) && typeof $ != "function")
            return Z(l, h, d, T, F($));
          if (!$)
            return new P(
              "Invalid " + h + " `" + d + "` key `" + T + "` supplied to `" + l + "`.\nBad object: " + JSON.stringify(E[v], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(t), null, "  ")
            );
          var r = $(y, T, l, h, d + "." + T, f);
          if (r)
            return r;
        }
        return null;
      }
      return M(a);
    }
    function V(t) {
      switch (typeof t) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !t;
        case "object":
          if (Array.isArray(t))
            return t.every(V);
          if (t === null || c(t))
            return !0;
          var a = O(t);
          if (a) {
            var E = a.call(t), v;
            if (a !== t.entries) {
              for (; !(v = E.next()).done; )
                if (!V(v.value))
                  return !1;
            } else
              for (; !(v = E.next()).done; ) {
                var l = v.value;
                if (l && !V(l[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function ue(t, a) {
      return t === "symbol" ? !0 : a ? a["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && a instanceof Symbol : !1;
    }
    function L(t) {
      var a = typeof t;
      return Array.isArray(t) ? "array" : t instanceof RegExp ? "object" : ue(a, t) ? "symbol" : a;
    }
    function F(t) {
      if (typeof t > "u" || t === null)
        return "" + t;
      var a = L(t);
      if (a === "object") {
        if (t instanceof Date)
          return "date";
        if (t instanceof RegExp)
          return "regexp";
      }
      return a;
    }
    function Q(t) {
      var a = F(t);
      switch (a) {
        case "array":
        case "object":
          return "an " + a;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + a;
        default:
          return a;
      }
    }
    function fe(t) {
      return !t.constructor || !t.constructor.name ? D : t.constructor.name;
    }
    return w.checkPropTypes = n, w.resetWarningCache = n.resetWarningCache, w.PropTypes = w, w;
  }, de;
}
var ve, Oe;
function qe() {
  if (Oe)
    return ve;
  Oe = 1;
  var s = me();
  function g() {
  }
  function f() {
  }
  return f.resetWarningCache = g, ve = function() {
    function o(u, c, S, C, _, O) {
      if (O !== s) {
        var D = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw D.name = "Invariant Violation", D;
      }
    }
    o.isRequired = o;
    function n() {
      return o;
    }
    var e = {
      array: o,
      bigint: o,
      bool: o,
      func: o,
      number: o,
      object: o,
      string: o,
      symbol: o,
      any: o,
      arrayOf: n,
      element: o,
      elementType: o,
      instanceOf: n,
      node: o,
      objectOf: n,
      oneOf: n,
      oneOfType: n,
      shape: n,
      exact: n,
      checkPropTypes: f,
      resetWarningCache: g
    };
    return e.PropTypes = e, e;
  }, ve;
}
if (k.env.NODE_ENV !== "production") {
  var We = Pe, Ue = !0;
  Ee.exports = Ye()(We.isElement, Ue);
} else
  Ee.exports = qe()();
var Fe = Ee.exports;
const p = /* @__PURE__ */ De(Fe), Ce = {
  disabled: !1
};
var ze = k.env.NODE_ENV !== "production" ? p.oneOfType([p.number, p.shape({
  enter: p.number,
  exit: p.number,
  appear: p.number
}).isRequired]) : null, Ze = k.env.NODE_ENV !== "production" ? p.oneOfType([p.string, p.shape({
  enter: p.string,
  exit: p.string,
  active: p.string
}), p.shape({
  enter: p.string,
  enterDone: p.string,
  enterActive: p.string,
  exit: p.string,
  exitDone: p.string,
  exitActive: p.string
})]) : null;
const Ae = J.createContext(null);
var Ge = function(g) {
  return g.scrollTop;
}, K = "unmounted", z = "exited", G = "entering", B = "entered", he = "exiting", W = /* @__PURE__ */ function(s) {
  $e(g, s);
  function g(o, n) {
    var e;
    e = s.call(this, o, n) || this;
    var u = n, c = u && !u.isMounting ? o.enter : o.appear, S;
    return e.appearStatus = null, o.in ? c ? (S = z, e.appearStatus = G) : S = B : o.unmountOnExit || o.mountOnEnter ? S = K : S = z, e.state = {
      status: S
    }, e.nextCallback = null, e;
  }
  g.getDerivedStateFromProps = function(n, e) {
    var u = n.in;
    return u && e.status === K ? {
      status: z
    } : null;
  };
  var f = g.prototype;
  return f.componentDidMount = function() {
    this.updateStatus(!0, this.appearStatus);
  }, f.componentDidUpdate = function(n) {
    var e = null;
    if (n !== this.props) {
      var u = this.state.status;
      this.props.in ? u !== G && u !== B && (e = G) : (u === G || u === B) && (e = he);
    }
    this.updateStatus(!1, e);
  }, f.componentWillUnmount = function() {
    this.cancelNextCallback();
  }, f.getTimeouts = function() {
    var n = this.props.timeout, e, u, c;
    return e = u = c = n, n != null && typeof n != "number" && (e = n.exit, u = n.enter, c = n.appear !== void 0 ? n.appear : u), {
      exit: e,
      enter: u,
      appear: c
    };
  }, f.updateStatus = function(n, e) {
    if (n === void 0 && (n = !1), e !== null)
      if (this.cancelNextCallback(), e === G) {
        if (this.props.unmountOnExit || this.props.mountOnEnter) {
          var u = this.props.nodeRef ? this.props.nodeRef.current : te.findDOMNode(this);
          u && Ge(u);
        }
        this.performEnter(n);
      } else
        this.performExit();
    else
      this.props.unmountOnExit && this.state.status === z && this.setState({
        status: K
      });
  }, f.performEnter = function(n) {
    var e = this, u = this.props.enter, c = this.context ? this.context.isMounting : n, S = this.props.nodeRef ? [c] : [te.findDOMNode(this), c], C = S[0], _ = S[1], O = this.getTimeouts(), D = c ? O.appear : O.enter;
    if (!n && !u || Ce.disabled) {
      this.safeSetState({
        status: B
      }, function() {
        e.props.onEntered(C);
      });
      return;
    }
    this.props.onEnter(C, _), this.safeSetState({
      status: G
    }, function() {
      e.props.onEntering(C, _), e.onTransitionEnd(D, function() {
        e.safeSetState({
          status: B
        }, function() {
          e.props.onEntered(C, _);
        });
      });
    });
  }, f.performExit = function() {
    var n = this, e = this.props.exit, u = this.getTimeouts(), c = this.props.nodeRef ? void 0 : te.findDOMNode(this);
    if (!e || Ce.disabled) {
      this.safeSetState({
        status: z
      }, function() {
        n.props.onExited(c);
      });
      return;
    }
    this.props.onExit(c), this.safeSetState({
      status: he
    }, function() {
      n.props.onExiting(c), n.onTransitionEnd(u.exit, function() {
        n.safeSetState({
          status: z
        }, function() {
          n.props.onExited(c);
        });
      });
    });
  }, f.cancelNextCallback = function() {
    this.nextCallback !== null && (this.nextCallback.cancel(), this.nextCallback = null);
  }, f.safeSetState = function(n, e) {
    e = this.setNextCallback(e), this.setState(n, e);
  }, f.setNextCallback = function(n) {
    var e = this, u = !0;
    return this.nextCallback = function(c) {
      u && (u = !1, e.nextCallback = null, n(c));
    }, this.nextCallback.cancel = function() {
      u = !1;
    }, this.nextCallback;
  }, f.onTransitionEnd = function(n, e) {
    this.setNextCallback(e);
    var u = this.props.nodeRef ? this.props.nodeRef.current : te.findDOMNode(this), c = n == null && !this.props.addEndListener;
    if (!u || c) {
      setTimeout(this.nextCallback, 0);
      return;
    }
    if (this.props.addEndListener) {
      var S = this.props.nodeRef ? [this.nextCallback] : [u, this.nextCallback], C = S[0], _ = S[1];
      this.props.addEndListener(C, _);
    }
    n != null && setTimeout(this.nextCallback, n);
  }, f.render = function() {
    var n = this.state.status;
    if (n === K)
      return null;
    var e = this.props, u = e.children;
    e.in, e.mountOnEnter, e.unmountOnExit, e.appear, e.enter, e.exit, e.timeout, e.addEndListener, e.onEnter, e.onEntering, e.onEntered, e.onExit, e.onExiting, e.onExited, e.nodeRef;
    var c = je(e, ["children", "in", "mountOnEnter", "unmountOnExit", "appear", "enter", "exit", "timeout", "addEndListener", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited", "nodeRef"]);
    return (
      // allows for nested Transitions
      /* @__PURE__ */ J.createElement(Ae.Provider, {
        value: null
      }, typeof u == "function" ? u(n, c) : J.cloneElement(J.Children.only(u), c))
    );
  }, g;
}(J.Component);
W.contextType = Ae;
W.propTypes = k.env.NODE_ENV !== "production" ? {
  /**
   * A React reference to DOM element that need to transition:
   * https://stackoverflow.com/a/51127130/4671932
   *
   *   - When `nodeRef` prop is used, `node` is not passed to callback functions
   *      (e.g. `onEnter`) because user already has direct access to the node.
   *   - When changing `key` prop of `Transition` in a `TransitionGroup` a new
   *     `nodeRef` need to be provided to `Transition` with changed `key` prop
   *     (see
   *     [test/CSSTransition-test.js](https://github.com/reactjs/react-transition-group/blob/13435f897b3ab71f6e19d724f145596f5910581c/test/CSSTransition-test.js#L362-L437)).
   */
  nodeRef: p.shape({
    current: typeof Element > "u" ? p.any : function(s, g, f, o, n, e) {
      var u = s[g];
      return p.instanceOf(u && "ownerDocument" in u ? u.ownerDocument.defaultView.Element : Element)(s, g, f, o, n, e);
    }
  }),
  /**
   * A `function` child can be used instead of a React element. This function is
   * called with the current transition status (`'entering'`, `'entered'`,
   * `'exiting'`, `'exited'`), which can be used to apply context
   * specific props to a component.
   *
   * ```jsx
   * <Transition in={this.state.in} timeout={150}>
   *   {state => (
   *     <MyComponent className={`fade fade-${state}`} />
   *   )}
   * </Transition>
   * ```
   */
  children: p.oneOfType([p.func.isRequired, p.element.isRequired]).isRequired,
  /**
   * Show the component; triggers the enter or exit states
   */
  in: p.bool,
  /**
   * By default the child component is mounted immediately along with
   * the parent `Transition` component. If you want to "lazy mount" the component on the
   * first `in={true}` you can set `mountOnEnter`. After the first enter transition the component will stay
   * mounted, even on "exited", unless you also specify `unmountOnExit`.
   */
  mountOnEnter: p.bool,
  /**
   * By default the child component stays mounted after it reaches the `'exited'` state.
   * Set `unmountOnExit` if you'd prefer to unmount the component after it finishes exiting.
   */
  unmountOnExit: p.bool,
  /**
   * By default the child component does not perform the enter transition when
   * it first mounts, regardless of the value of `in`. If you want this
   * behavior, set both `appear` and `in` to `true`.
   *
   * > **Note**: there are no special appear states like `appearing`/`appeared`, this prop
   * > only adds an additional enter transition. However, in the
   * > `<CSSTransition>` component that first enter transition does result in
   * > additional `.appear-*` classes, that way you can choose to style it
   * > differently.
   */
  appear: p.bool,
  /**
   * Enable or disable enter transitions.
   */
  enter: p.bool,
  /**
   * Enable or disable exit transitions.
   */
  exit: p.bool,
  /**
   * The duration of the transition, in milliseconds.
   * Required unless `addEndListener` is provided.
   *
   * You may specify a single timeout for all transitions:
   *
   * ```jsx
   * timeout={500}
   * ```
   *
   * or individually:
   *
   * ```jsx
   * timeout={{
   *  appear: 500,
   *  enter: 300,
   *  exit: 500,
   * }}
   * ```
   *
   * - `appear` defaults to the value of `enter`
   * - `enter` defaults to `0`
   * - `exit` defaults to `0`
   *
   * @type {number | { enter?: number, exit?: number, appear?: number }}
   */
  timeout: function(g) {
    var f = ze;
    g.addEndListener || (f = f.isRequired);
    for (var o = arguments.length, n = new Array(o > 1 ? o - 1 : 0), e = 1; e < o; e++)
      n[e - 1] = arguments[e];
    return f.apply(void 0, [g].concat(n));
  },
  /**
   * Add a custom transition end trigger. Called with the transitioning
   * DOM node and a `done` callback. Allows for more fine grained transition end
   * logic. Timeouts are still used as a fallback if provided.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * ```jsx
   * addEndListener={(node, done) => {
   *   // use the css transitionend event to mark the finish of a transition
   *   node.addEventListener('transitionend', done, false);
   * }}
   * ```
   */
  addEndListener: p.func,
  /**
   * Callback fired before the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEnter: p.func,
  /**
   * Callback fired after the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: p.func,
  /**
   * Callback fired after the "entered" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEntered: p.func,
  /**
   * Callback fired before the "exiting" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExit: p.func,
  /**
   * Callback fired after the "exiting" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExiting: p.func,
  /**
   * Callback fired after the "exited" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExited: p.func
} : {};
function X() {
}
W.defaultProps = {
  in: !1,
  mountOnEnter: !1,
  unmountOnExit: !1,
  appear: !1,
  enter: !0,
  exit: !0,
  onEnter: X,
  onEntering: X,
  onEntered: X,
  onExit: X,
  onExiting: X,
  onExited: X
};
W.UNMOUNTED = K;
W.EXITED = z;
W.ENTERING = G;
W.ENTERED = B;
W.EXITING = he;
const Qe = W;
export {
  p as P,
  je as _,
  Je as a,
  Ze as b,
  Ke as c,
  Ge as f,
  Fe as p,
  Pe as r,
  Qe as s
};
