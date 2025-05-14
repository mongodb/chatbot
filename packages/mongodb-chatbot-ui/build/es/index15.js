import { a as g } from "./jsx-dev-runtime.js";
import { g as ae } from "./index2.js";
var P = { exports: {} }, t = {};
/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var F;
function ie() {
  if (F)
    return t;
  F = 1;
  var p = Symbol.for("react.element"), S = Symbol.for("react.portal"), a = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), f = Symbol.for("react.provider"), u = Symbol.for("react.context"), b = Symbol.for("react.server_context"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), d = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), T = Symbol.for("react.offscreen"), _;
  _ = Symbol.for("react.module.reference");
  function n(e) {
    if (typeof e == "object" && e !== null) {
      var y = e.$$typeof;
      switch (y) {
        case p:
          switch (e = e.type, e) {
            case a:
            case c:
            case i:
            case m:
            case d:
              return e;
            default:
              switch (e = e && e.$$typeof, e) {
                case b:
                case u:
                case l:
                case v:
                case E:
                case f:
                  return e;
                default:
                  return y;
              }
          }
        case S:
          return y;
      }
    }
  }
  return t.ContextConsumer = u, t.ContextProvider = f, t.Element = p, t.ForwardRef = l, t.Fragment = a, t.Lazy = v, t.Memo = E, t.Portal = S, t.Profiler = c, t.StrictMode = i, t.Suspense = m, t.SuspenseList = d, t.isAsyncMode = function() {
    return !1;
  }, t.isConcurrentMode = function() {
    return !1;
  }, t.isContextConsumer = function(e) {
    return n(e) === u;
  }, t.isContextProvider = function(e) {
    return n(e) === f;
  }, t.isElement = function(e) {
    return typeof e == "object" && e !== null && e.$$typeof === p;
  }, t.isForwardRef = function(e) {
    return n(e) === l;
  }, t.isFragment = function(e) {
    return n(e) === a;
  }, t.isLazy = function(e) {
    return n(e) === v;
  }, t.isMemo = function(e) {
    return n(e) === E;
  }, t.isPortal = function(e) {
    return n(e) === S;
  }, t.isProfiler = function(e) {
    return n(e) === c;
  }, t.isStrictMode = function(e) {
    return n(e) === i;
  }, t.isSuspense = function(e) {
    return n(e) === m;
  }, t.isSuspenseList = function(e) {
    return n(e) === d;
  }, t.isValidElementType = function(e) {
    return typeof e == "string" || typeof e == "function" || e === a || e === c || e === i || e === m || e === d || e === T || typeof e == "object" && e !== null && (e.$$typeof === v || e.$$typeof === E || e.$$typeof === f || e.$$typeof === u || e.$$typeof === l || e.$$typeof === _ || e.getModuleId !== void 0);
  }, t.typeOf = n, t;
}
var o = {}, I;
function ce() {
  return I || (I = 1, g.env.NODE_ENV !== "production" && function() {
    var p = Symbol.for("react.element"), S = Symbol.for("react.portal"), a = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), c = Symbol.for("react.profiler"), f = Symbol.for("react.provider"), u = Symbol.for("react.context"), b = Symbol.for("react.server_context"), l = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), d = Symbol.for("react.suspense_list"), E = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), T = Symbol.for("react.offscreen"), _ = !1, n = !1, e = !1, y = !1, L = !1, M;
    M = Symbol.for("react.module.reference");
    function w(r) {
      return !!(typeof r == "string" || typeof r == "function" || r === a || r === c || L || r === i || r === m || r === d || y || r === T || _ || n || e || typeof r == "object" && r !== null && (r.$$typeof === v || r.$$typeof === E || r.$$typeof === f || r.$$typeof === u || r.$$typeof === l || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      r.$$typeof === M || r.getModuleId !== void 0));
    }
    function s(r) {
      if (typeof r == "object" && r !== null) {
        var C = r.$$typeof;
        switch (C) {
          case p:
            var R = r.type;
            switch (R) {
              case a:
              case c:
              case i:
              case m:
              case d:
                return R;
              default:
                var x = R && R.$$typeof;
                switch (x) {
                  case b:
                  case u:
                  case l:
                  case v:
                  case E:
                  case f:
                    return x;
                  default:
                    return C;
                }
            }
          case S:
            return C;
        }
      }
    }
    var h = u, O = f, Y = p, N = l, D = a, z = v, V = E, q = S, j = c, U = i, W = m, X = d, $ = !1, A = !1;
    function k(r) {
      return $ || ($ = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function G(r) {
      return A || (A = !0, console.warn("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function H(r) {
      return s(r) === u;
    }
    function Z(r) {
      return s(r) === f;
    }
    function B(r) {
      return typeof r == "object" && r !== null && r.$$typeof === p;
    }
    function J(r) {
      return s(r) === l;
    }
    function K(r) {
      return s(r) === a;
    }
    function Q(r) {
      return s(r) === v;
    }
    function ee(r) {
      return s(r) === E;
    }
    function re(r) {
      return s(r) === S;
    }
    function te(r) {
      return s(r) === c;
    }
    function oe(r) {
      return s(r) === i;
    }
    function ne(r) {
      return s(r) === m;
    }
    function se(r) {
      return s(r) === d;
    }
    o.ContextConsumer = h, o.ContextProvider = O, o.Element = Y, o.ForwardRef = N, o.Fragment = D, o.Lazy = z, o.Memo = V, o.Portal = q, o.Profiler = j, o.StrictMode = U, o.Suspense = W, o.SuspenseList = X, o.isAsyncMode = k, o.isConcurrentMode = G, o.isContextConsumer = H, o.isContextProvider = Z, o.isElement = B, o.isForwardRef = J, o.isFragment = K, o.isLazy = Q, o.isMemo = ee, o.isPortal = re, o.isProfiler = te, o.isStrictMode = oe, o.isSuspense = ne, o.isSuspenseList = se, o.isValidElementType = w, o.typeOf = s;
  }()), o;
}
g.env.NODE_ENV === "production" ? P.exports = ie() : P.exports = ce();
var fe = P.exports;
const me = /* @__PURE__ */ ae(fe);
export {
  me as R,
  fe as r
};
