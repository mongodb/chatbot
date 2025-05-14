import { a as ce, j as ye } from "./jsx-dev-runtime.js";
import { u as je, c as tt, d as rt, j as nt } from "./index2.js";
import { m as ot, U as at } from "./messageLinks.js";
import Fe, { useReducer as it, useEffect as st, useMemo as ct, useCallback as me, useState as Ne, useRef as ut } from "react";
import { r as Qe, a as ft, p as lt, c as pt, b as dt } from "./index3.js";
import { c as Le, S as ht, a as gt, C as mt } from "./ConversationStateProvider2.js";
import { c as yt, a as bt } from "./utils.js";
import { useConversationStateContext as vt } from "./useConversationStateContext.js";
import { L as wt } from "./LinkDataProvider.js";
import { C as Et } from "./ChatbotProvider.js";
import { H as St } from "./HotkeyContext.js";
async function Ot(i, o) {
  const d = i.getReader();
  let u;
  for (; !(u = await d.read()).done; )
    o(u.value);
}
function jt(i) {
  let o, d, u, v = !1;
  return function(R) {
    o === void 0 ? (o = R, d = 0, u = -1) : o = Nt(o, R);
    const N = o.length;
    let F = 0;
    for (; d < N; ) {
      v && (o[d] === 10 && (F = ++d), v = !1);
      let L = -1;
      for (; d < N && L === -1; ++d)
        switch (o[d]) {
          case 58:
            u === -1 && (u = d - F);
            break;
          case 13:
            v = !0;
          case 10:
            L = d;
            break;
        }
      if (L === -1)
        break;
      i(o.subarray(F, L), u), F = d, u = -1;
    }
    F === N ? o = void 0 : F !== 0 && (o = o.subarray(F), d -= F);
  };
}
function Rt(i, o, d) {
  let u = Be();
  const v = new TextDecoder();
  return function(R, N) {
    if (R.length === 0)
      d == null || d(u), u = Be();
    else if (N > 0) {
      const F = v.decode(R.subarray(0, N)), L = N + (R[N + 1] === 32 ? 2 : 1), J = v.decode(R.subarray(L));
      switch (F) {
        case "data":
          u.data = u.data ? u.data + `
` + J : J;
          break;
        case "event":
          u.event = J;
          break;
        case "id":
          i(u.id = J);
          break;
        case "retry":
          const G = parseInt(J, 10);
          isNaN(G) || o(u.retry = G);
          break;
      }
    }
  };
}
function Nt(i, o) {
  const d = new Uint8Array(i.length + o.length);
  return d.set(i), d.set(o, i.length), d;
}
function Be() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
var It = globalThis && globalThis.__rest || function(i, o) {
  var d = {};
  for (var u in i)
    Object.prototype.hasOwnProperty.call(i, u) && o.indexOf(u) < 0 && (d[u] = i[u]);
  if (i != null && typeof Object.getOwnPropertySymbols == "function")
    for (var v = 0, u = Object.getOwnPropertySymbols(i); v < u.length; v++)
      o.indexOf(u[v]) < 0 && Object.prototype.propertyIsEnumerable.call(i, u[v]) && (d[u[v]] = i[u[v]]);
  return d;
};
const Ce = "text/event-stream", qt = 1e3, $e = "last-event-id";
function At(i, o) {
  var { signal: d, headers: u, onopen: v, onmessage: T, onclose: R, onerror: N, openWhenHidden: F, fetch: L } = o, J = It(o, ["signal", "headers", "onopen", "onmessage", "onclose", "onerror", "openWhenHidden", "fetch"]);
  return new Promise((G, I) => {
    const E = Object.assign({}, u);
    E.accept || (E.accept = Ce);
    let k;
    function q() {
      k.abort(), document.hidden || f();
    }
    F || document.addEventListener("visibilitychange", q);
    let C = qt, x = 0;
    function $() {
      document.removeEventListener("visibilitychange", q), window.clearTimeout(x), k.abort();
    }
    d == null || d.addEventListener("abort", () => {
      $(), G();
    });
    const K = L ?? window.fetch, Z = v ?? Pt;
    async function f() {
      var c;
      k = new AbortController();
      try {
        const h = await K(i, Object.assign(Object.assign({}, J), { headers: E, signal: k.signal }));
        await Z(h), await Ot(h.body, jt(Rt((b) => {
          b ? E[$e] = b : delete E[$e];
        }, (b) => {
          C = b;
        }, T))), R == null || R(), $(), G();
      } catch (h) {
        if (!k.signal.aborted)
          try {
            const b = (c = N == null ? void 0 : N(h)) !== null && c !== void 0 ? c : C;
            window.clearTimeout(x), x = window.setTimeout(f, b);
          } catch (b) {
            $(), I(b);
          }
      }
    }
    f();
  });
}
function Pt(i) {
  const o = i.headers.get("content-type");
  if (!(o != null && o.startsWith(Ce)))
    throw new Error(`Expected content-type to be ${Ce}, Actual: ${o}`);
}
var Ie = { exports: {} }, qe = {}, Ve;
function Ze() {
  if (Ve)
    return qe;
  Ve = 1;
  function i(f) {
    "@babel/helpers - typeof";
    return i = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(c) {
      return typeof c;
    } : function(c) {
      return c && typeof Symbol == "function" && c.constructor === Symbol && c !== Symbol.prototype ? "symbol" : typeof c;
    }, i(f);
  }
  function o(f, c) {
    for (var h = 0; h < c.length; h++) {
      var b = c[h];
      b.enumerable = b.enumerable || !1, b.configurable = !0, "value" in b && (b.writable = !0), Object.defineProperty(f, u(b.key), b);
    }
  }
  function d(f, c, h) {
    return c && o(f.prototype, c), h && o(f, h), Object.defineProperty(f, "prototype", { writable: !1 }), f;
  }
  function u(f) {
    var c = v(f, "string");
    return i(c) === "symbol" ? c : String(c);
  }
  function v(f, c) {
    if (i(f) !== "object" || f === null)
      return f;
    var h = f[Symbol.toPrimitive];
    if (h !== void 0) {
      var b = h.call(f, c || "default");
      if (i(b) !== "object")
        return b;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (c === "string" ? String : Number)(f);
  }
  function T(f, c) {
    if (!(f instanceof c))
      throw new TypeError("Cannot call a class as a function");
  }
  function R(f, c) {
    if (typeof c != "function" && c !== null)
      throw new TypeError("Super expression must either be null or a function");
    f.prototype = Object.create(c && c.prototype, { constructor: { value: f, writable: !0, configurable: !0 } }), Object.defineProperty(f, "prototype", { writable: !1 }), c && N(f, c);
  }
  function N(f, c) {
    return N = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(b, V) {
      return b.__proto__ = V, b;
    }, N(f, c);
  }
  function F(f) {
    var c = G();
    return function() {
      var b = I(f), V;
      if (c) {
        var A = I(this).constructor;
        V = Reflect.construct(b, arguments, A);
      } else
        V = b.apply(this, arguments);
      return L(this, V);
    };
  }
  function L(f, c) {
    if (c && (i(c) === "object" || typeof c == "function"))
      return c;
    if (c !== void 0)
      throw new TypeError("Derived constructors may only return object or undefined");
    return J(f);
  }
  function J(f) {
    if (f === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return f;
  }
  function G() {
    if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham)
      return !1;
    if (typeof Proxy == "function")
      return !0;
    try {
      return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      })), !0;
    } catch {
      return !1;
    }
  }
  function I(f) {
    return I = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(h) {
      return h.__proto__ || Object.getPrototypeOf(h);
    }, I(f);
  }
  var E = {}, k, q;
  function C(f, c, h) {
    h || (h = Error);
    function b(A, _, M) {
      return typeof c == "string" ? c : c(A, _, M);
    }
    var V = /* @__PURE__ */ function(A) {
      R(M, A);
      var _ = F(M);
      function M(ee, ue, se) {
        var oe;
        return T(this, M), oe = _.call(this, b(ee, ue, se)), oe.code = f, oe;
      }
      return d(M);
    }(h);
    E[f] = V;
  }
  function x(f, c) {
    if (Array.isArray(f)) {
      var h = f.length;
      return f = f.map(function(b) {
        return String(b);
      }), h > 2 ? "one of ".concat(c, " ").concat(f.slice(0, h - 1).join(", "), ", or ") + f[h - 1] : h === 2 ? "one of ".concat(c, " ").concat(f[0], " or ").concat(f[1]) : "of ".concat(c, " ").concat(f[0]);
    } else
      return "of ".concat(c, " ").concat(String(f));
  }
  function $(f, c, h) {
    return f.substr(!h || h < 0 ? 0 : +h, c.length) === c;
  }
  function K(f, c, h) {
    return (h === void 0 || h > f.length) && (h = f.length), f.substring(h - c.length, h) === c;
  }
  function Z(f, c, h) {
    return typeof h != "number" && (h = 0), h + c.length > f.length ? !1 : f.indexOf(c, h) !== -1;
  }
  return C("ERR_AMBIGUOUS_ARGUMENT", 'The "%s" argument is ambiguous. %s', TypeError), C("ERR_INVALID_ARG_TYPE", function(f, c, h) {
    k === void 0 && (k = Ue()), k(typeof f == "string", "'name' must be a string");
    var b;
    typeof c == "string" && $(c, "not ") ? (b = "must not be", c = c.replace(/^not /, "")) : b = "must be";
    var V;
    if (K(f, " argument"))
      V = "The ".concat(f, " ").concat(b, " ").concat(x(c, "type"));
    else {
      var A = Z(f, ".") ? "property" : "argument";
      V = 'The "'.concat(f, '" ').concat(A, " ").concat(b, " ").concat(x(c, "type"));
    }
    return V += ". Received type ".concat(i(h)), V;
  }, TypeError), C("ERR_INVALID_ARG_VALUE", function(f, c) {
    var h = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "is invalid";
    q === void 0 && (q = je);
    var b = q.inspect(c);
    return b.length > 128 && (b = "".concat(b.slice(0, 128), "...")), "The argument '".concat(f, "' ").concat(h, ". Received ").concat(b);
  }, TypeError), C("ERR_INVALID_RETURN_VALUE", function(f, c, h) {
    var b;
    return h && h.constructor && h.constructor.name ? b = "instance of ".concat(h.constructor.name) : b = "type ".concat(i(h)), "Expected ".concat(f, ' to be returned from the "').concat(c, '"') + " function but got ".concat(b, ".");
  }, TypeError), C("ERR_MISSING_ARGS", function() {
    for (var f = arguments.length, c = new Array(f), h = 0; h < f; h++)
      c[h] = arguments[h];
    k === void 0 && (k = Ue()), k(c.length > 0, "At least one arg needs to be specified");
    var b = "The ", V = c.length;
    switch (c = c.map(function(A) {
      return '"'.concat(A, '"');
    }), V) {
      case 1:
        b += "".concat(c[0], " argument");
        break;
      case 2:
        b += "".concat(c[0], " and ").concat(c[1], " arguments");
        break;
      default:
        b += c.slice(0, V - 1).join(", "), b += ", and ".concat(c[V - 1], " arguments");
        break;
    }
    return "".concat(b, " must be specified");
  }, TypeError), qe.codes = E, qe;
}
var Ae, ke;
function Tt() {
  if (ke)
    return Ae;
  ke = 1;
  function i(l, p) {
    var w = Object.keys(l);
    if (Object.getOwnPropertySymbols) {
      var m = Object.getOwnPropertySymbols(l);
      p && (m = m.filter(function(P) {
        return Object.getOwnPropertyDescriptor(l, P).enumerable;
      })), w.push.apply(w, m);
    }
    return w;
  }
  function o(l) {
    for (var p = 1; p < arguments.length; p++) {
      var w = arguments[p] != null ? arguments[p] : {};
      p % 2 ? i(Object(w), !0).forEach(function(m) {
        d(l, m, w[m]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(l, Object.getOwnPropertyDescriptors(w)) : i(Object(w)).forEach(function(m) {
        Object.defineProperty(l, m, Object.getOwnPropertyDescriptor(w, m));
      });
    }
    return l;
  }
  function d(l, p, w) {
    return p = R(p), p in l ? Object.defineProperty(l, p, { value: w, enumerable: !0, configurable: !0, writable: !0 }) : l[p] = w, l;
  }
  function u(l, p) {
    if (!(l instanceof p))
      throw new TypeError("Cannot call a class as a function");
  }
  function v(l, p) {
    for (var w = 0; w < p.length; w++) {
      var m = p[w];
      m.enumerable = m.enumerable || !1, m.configurable = !0, "value" in m && (m.writable = !0), Object.defineProperty(l, R(m.key), m);
    }
  }
  function T(l, p, w) {
    return p && v(l.prototype, p), w && v(l, w), Object.defineProperty(l, "prototype", { writable: !1 }), l;
  }
  function R(l) {
    var p = N(l, "string");
    return $(p) === "symbol" ? p : String(p);
  }
  function N(l, p) {
    if ($(l) !== "object" || l === null)
      return l;
    var w = l[Symbol.toPrimitive];
    if (w !== void 0) {
      var m = w.call(l, p || "default");
      if ($(m) !== "object")
        return m;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (p === "string" ? String : Number)(l);
  }
  function F(l, p) {
    if (typeof p != "function" && p !== null)
      throw new TypeError("Super expression must either be null or a function");
    l.prototype = Object.create(p && p.prototype, { constructor: { value: l, writable: !0, configurable: !0 } }), Object.defineProperty(l, "prototype", { writable: !1 }), p && C(l, p);
  }
  function L(l) {
    var p = k();
    return function() {
      var m = x(l), P;
      if (p) {
        var H = x(this).constructor;
        P = Reflect.construct(m, arguments, H);
      } else
        P = m.apply(this, arguments);
      return J(this, P);
    };
  }
  function J(l, p) {
    if (p && ($(p) === "object" || typeof p == "function"))
      return p;
    if (p !== void 0)
      throw new TypeError("Derived constructors may only return object or undefined");
    return G(l);
  }
  function G(l) {
    if (l === void 0)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return l;
  }
  function I(l) {
    var p = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
    return I = function(m) {
      if (m === null || !q(m))
        return m;
      if (typeof m != "function")
        throw new TypeError("Super expression must either be null or a function");
      if (typeof p < "u") {
        if (p.has(m))
          return p.get(m);
        p.set(m, P);
      }
      function P() {
        return E(m, arguments, x(this).constructor);
      }
      return P.prototype = Object.create(m.prototype, { constructor: { value: P, enumerable: !1, writable: !0, configurable: !0 } }), C(P, m);
    }, I(l);
  }
  function E(l, p, w) {
    return k() ? E = Reflect.construct.bind() : E = function(P, H, Q) {
      var Y = [null];
      Y.push.apply(Y, H);
      var a = Function.bind.apply(P, Y), e = new a();
      return Q && C(e, Q.prototype), e;
    }, E.apply(null, arguments);
  }
  function k() {
    if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham)
      return !1;
    if (typeof Proxy == "function")
      return !0;
    try {
      return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      })), !0;
    } catch {
      return !1;
    }
  }
  function q(l) {
    return Function.toString.call(l).indexOf("[native code]") !== -1;
  }
  function C(l, p) {
    return C = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(m, P) {
      return m.__proto__ = P, m;
    }, C(l, p);
  }
  function x(l) {
    return x = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(w) {
      return w.__proto__ || Object.getPrototypeOf(w);
    }, x(l);
  }
  function $(l) {
    "@babel/helpers - typeof";
    return $ = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(p) {
      return typeof p;
    } : function(p) {
      return p && typeof Symbol == "function" && p.constructor === Symbol && p !== Symbol.prototype ? "symbol" : typeof p;
    }, $(l);
  }
  var K = je, Z = K.inspect, f = Ze(), c = f.codes.ERR_INVALID_ARG_TYPE;
  function h(l, p, w) {
    return (w === void 0 || w > l.length) && (w = l.length), l.substring(w - p.length, w) === p;
  }
  function b(l, p) {
    if (p = Math.floor(p), l.length == 0 || p == 0)
      return "";
    var w = l.length * p;
    for (p = Math.floor(Math.log(p) / Math.log(2)); p; )
      l += l, p--;
    return l += l.substring(0, w - l.length), l;
  }
  var V = "", A = "", _ = "", M = "", ee = {
    deepStrictEqual: "Expected values to be strictly deep-equal:",
    strictEqual: "Expected values to be strictly equal:",
    strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
    deepEqual: "Expected values to be loosely deep-equal:",
    equal: "Expected values to be loosely equal:",
    notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
    notStrictEqual: 'Expected "actual" to be strictly unequal to:',
    notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
    notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
    notEqual: 'Expected "actual" to be loosely unequal to:',
    notIdentical: "Values identical but not reference-equal:"
  }, ue = 10;
  function se(l) {
    var p = Object.keys(l), w = Object.create(Object.getPrototypeOf(l));
    return p.forEach(function(m) {
      w[m] = l[m];
    }), Object.defineProperty(w, "message", {
      value: l.message
    }), w;
  }
  function oe(l) {
    return Z(l, {
      compact: !1,
      customInspect: !1,
      depth: 1e3,
      maxArrayLength: 1 / 0,
      // Assert compares only enumerable properties (with a few exceptions).
      showHidden: !1,
      // Having a long line as error is better than wrapping the line for
      // comparison for now.
      // TODO(BridgeAR): `breakLength` should be limited as soon as soon as we
      // have meta information about the inspected properties (i.e., know where
      // in what line the property starts and ends).
      breakLength: 1 / 0,
      // Assert does not detect proxies currently.
      showProxy: !1,
      sorted: !0,
      // Inspect getters as we also check them when comparing entries.
      getters: !0
    });
  }
  function be(l, p, w) {
    var m = "", P = "", H = 0, Q = "", Y = !1, a = oe(l), e = a.split(`
`), r = oe(p).split(`
`), s = 0, y = "";
    if (w === "strictEqual" && $(l) === "object" && $(p) === "object" && l !== null && p !== null && (w = "strictEqualObject"), e.length === 1 && r.length === 1 && e[0] !== r[0]) {
      var O = e[0].length + r[0].length;
      if (O <= ue) {
        if (($(l) !== "object" || l === null) && ($(p) !== "object" || p === null) && (l !== 0 || p !== 0))
          return "".concat(ee[w], `

`) + "".concat(e[0], " !== ").concat(r[0], `
`);
      } else if (w !== "strictEqualObject") {
        var U = ce.stderr && ce.stderr.isTTY ? ce.stderr.columns : 80;
        if (O < U) {
          for (; e[0][s] === r[0][s]; )
            s++;
          s > 2 && (y = `
  `.concat(b(" ", s), "^"), s = 0);
        }
      }
    }
    for (var X = e[e.length - 1], te = r[r.length - 1]; X === te && (s++ < 2 ? Q = `
  `.concat(X).concat(Q) : m = X, e.pop(), r.pop(), !(e.length === 0 || r.length === 0)); )
      X = e[e.length - 1], te = r[r.length - 1];
    var fe = Math.max(e.length, r.length);
    if (fe === 0) {
      var he = a.split(`
`);
      if (he.length > 30)
        for (he[26] = "".concat(V, "...").concat(M); he.length > 27; )
          he.pop();
      return "".concat(ee.notIdentical, `

`).concat(he.join(`
`), `
`);
    }
    s > 3 && (Q = `
`.concat(V, "...").concat(M).concat(Q), Y = !0), m !== "" && (Q = `
  `.concat(m).concat(Q), m = "");
    var ae = 0, we = ee[w] + `
`.concat(A, "+ actual").concat(M, " ").concat(_, "- expected").concat(M), Re = " ".concat(V, "...").concat(M, " Lines skipped");
    for (s = 0; s < fe; s++) {
      var ie = s - H;
      if (e.length < s + 1)
        ie > 1 && s > 2 && (ie > 4 ? (P += `
`.concat(V, "...").concat(M), Y = !0) : ie > 3 && (P += `
  `.concat(r[s - 2]), ae++), P += `
  `.concat(r[s - 1]), ae++), H = s, m += `
`.concat(_, "-").concat(M, " ").concat(r[s]), ae++;
      else if (r.length < s + 1)
        ie > 1 && s > 2 && (ie > 4 ? (P += `
`.concat(V, "...").concat(M), Y = !0) : ie > 3 && (P += `
  `.concat(e[s - 2]), ae++), P += `
  `.concat(e[s - 1]), ae++), H = s, P += `
`.concat(A, "+").concat(M, " ").concat(e[s]), ae++;
      else {
        var ge = r[s], le = e[s], t = le !== ge && (!h(le, ",") || le.slice(0, -1) !== ge);
        t && h(ge, ",") && ge.slice(0, -1) === le && (t = !1, le += ","), t ? (ie > 1 && s > 2 && (ie > 4 ? (P += `
`.concat(V, "...").concat(M), Y = !0) : ie > 3 && (P += `
  `.concat(e[s - 2]), ae++), P += `
  `.concat(e[s - 1]), ae++), H = s, P += `
`.concat(A, "+").concat(M, " ").concat(le), m += `
`.concat(_, "-").concat(M, " ").concat(ge), ae += 2) : (P += m, m = "", (ie === 1 || s === 0) && (P += `
  `.concat(le), ae++));
      }
      if (ae > 20 && s < fe - 2)
        return "".concat(we).concat(Re, `
`).concat(P, `
`).concat(V, "...").concat(M).concat(m, `
`) + "".concat(V, "...").concat(M);
    }
    return "".concat(we).concat(Y ? Re : "", `
`).concat(P).concat(m).concat(Q).concat(y);
  }
  var de = /* @__PURE__ */ function(l, p) {
    F(m, l);
    var w = L(m);
    function m(P) {
      var H;
      if (u(this, m), $(P) !== "object" || P === null)
        throw new c("options", "Object", P);
      var Q = P.message, Y = P.operator, a = P.stackStartFn, e = P.actual, r = P.expected, s = Error.stackTraceLimit;
      if (Error.stackTraceLimit = 0, Q != null)
        H = w.call(this, String(Q));
      else if (ce.stderr && ce.stderr.isTTY && (ce.stderr && ce.stderr.getColorDepth && ce.stderr.getColorDepth() !== 1 ? (V = "\x1B[34m", A = "\x1B[32m", M = "\x1B[39m", _ = "\x1B[31m") : (V = "", A = "", M = "", _ = "")), $(e) === "object" && e !== null && $(r) === "object" && r !== null && "stack" in e && e instanceof Error && "stack" in r && r instanceof Error && (e = se(e), r = se(r)), Y === "deepStrictEqual" || Y === "strictEqual")
        H = w.call(this, be(e, r, Y));
      else if (Y === "notDeepStrictEqual" || Y === "notStrictEqual") {
        var y = ee[Y], O = oe(e).split(`
`);
        if (Y === "notStrictEqual" && $(e) === "object" && e !== null && (y = ee.notStrictEqualObject), O.length > 30)
          for (O[26] = "".concat(V, "...").concat(M); O.length > 27; )
            O.pop();
        O.length === 1 ? H = w.call(this, "".concat(y, " ").concat(O[0])) : H = w.call(this, "".concat(y, `

`).concat(O.join(`
`), `
`));
      } else {
        var U = oe(e), X = "", te = ee[Y];
        Y === "notDeepEqual" || Y === "notEqual" ? (U = "".concat(ee[Y], `

`).concat(U), U.length > 1024 && (U = "".concat(U.slice(0, 1021), "..."))) : (X = "".concat(oe(r)), U.length > 512 && (U = "".concat(U.slice(0, 509), "...")), X.length > 512 && (X = "".concat(X.slice(0, 509), "...")), Y === "deepEqual" || Y === "equal" ? U = "".concat(te, `

`).concat(U, `

should equal

`) : X = " ".concat(Y, " ").concat(X)), H = w.call(this, "".concat(U).concat(X));
      }
      return Error.stackTraceLimit = s, H.generatedMessage = !Q, Object.defineProperty(G(H), "name", {
        value: "AssertionError [ERR_ASSERTION]",
        enumerable: !1,
        writable: !0,
        configurable: !0
      }), H.code = "ERR_ASSERTION", H.actual = e, H.expected = r, H.operator = Y, Error.captureStackTrace && Error.captureStackTrace(G(H), a), H.stack, H.name = "AssertionError", J(H);
    }
    return T(m, [{
      key: "toString",
      value: function() {
        return "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message);
      }
    }, {
      key: p,
      value: function(H, Q) {
        return Z(this, o(o({}, Q), {}, {
          customInspect: !1,
          depth: 0
        }));
      }
    }]), m;
  }(/* @__PURE__ */ I(Error), Z.custom);
  return Ae = de, Ae;
}
var Pe, Ge;
function Ke() {
  return Ge || (Ge = 1, Pe = function(o) {
    return o !== o;
  }), Pe;
}
var Te, He;
function et() {
  if (He)
    return Te;
  He = 1;
  var i = Ke();
  return Te = function() {
    return Number.isNaN && Number.isNaN(NaN) && !Number.isNaN("a") ? Number.isNaN : i;
  }, Te;
}
var xe, We;
function xt() {
  if (We)
    return xe;
  We = 1;
  var i = Qe(), o = et();
  return xe = function() {
    var u = o();
    return i(Number, { isNaN: u }, {
      isNaN: function() {
        return Number.isNaN !== u;
      }
    }), u;
  }, xe;
}
var _e, ze;
function _t() {
  if (ze)
    return _e;
  ze = 1;
  var i = tt, o = Qe(), d = Ke(), u = et(), v = xt(), T = i(u(), Number);
  return o(T, {
    getPolyfill: u,
    implementation: d,
    shim: v
  }), _e = T, _e;
}
var Me, Ye;
function Mt() {
  if (Ye)
    return Me;
  Ye = 1;
  function i(t, n) {
    return T(t) || v(t, n) || d(t, n) || o();
  }
  function o() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  function d(t, n) {
    if (t) {
      if (typeof t == "string")
        return u(t, n);
      var g = Object.prototype.toString.call(t).slice(8, -1);
      if (g === "Object" && t.constructor && (g = t.constructor.name), g === "Map" || g === "Set")
        return Array.from(t);
      if (g === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(g))
        return u(t, n);
    }
  }
  function u(t, n) {
    (n == null || n > t.length) && (n = t.length);
    for (var g = 0, S = new Array(n); g < n; g++)
      S[g] = t[g];
    return S;
  }
  function v(t, n) {
    var g = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (g != null) {
      var S, j, B, D, W = [], z = !0, re = !1;
      try {
        if (B = (g = g.call(t)).next, n === 0) {
          if (Object(g) !== g)
            return;
          z = !1;
        } else
          for (; !(z = (S = B.call(g)).done) && (W.push(S.value), W.length !== n); z = !0)
            ;
      } catch (ne) {
        re = !0, j = ne;
      } finally {
        try {
          if (!z && g.return != null && (D = g.return(), Object(D) !== D))
            return;
        } finally {
          if (re)
            throw j;
        }
      }
      return W;
    }
  }
  function T(t) {
    if (Array.isArray(t))
      return t;
  }
  function R(t) {
    "@babel/helpers - typeof";
    return R = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
      return typeof n;
    } : function(n) {
      return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
    }, R(t);
  }
  var N = /a/g.flags !== void 0, F = function(n) {
    var g = [];
    return n.forEach(function(S) {
      return g.push(S);
    }), g;
  }, L = function(n) {
    var g = [];
    return n.forEach(function(S, j) {
      return g.push([j, S]);
    }), g;
  }, J = Object.is ? Object.is : ft(), G = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols : function() {
    return [];
  }, I = Number.isNaN ? Number.isNaN : _t();
  function E(t) {
    return t.call.bind(t);
  }
  var k = E(Object.prototype.hasOwnProperty), q = E(Object.prototype.propertyIsEnumerable), C = E(Object.prototype.toString), x = je.types, $ = x.isAnyArrayBuffer, K = x.isArrayBufferView, Z = x.isDate, f = x.isMap, c = x.isRegExp, h = x.isSet, b = x.isNativeError, V = x.isBoxedPrimitive, A = x.isNumberObject, _ = x.isStringObject, M = x.isBooleanObject, ee = x.isBigIntObject, ue = x.isSymbolObject, se = x.isFloat32Array, oe = x.isFloat64Array;
  function be(t) {
    if (t.length === 0 || t.length > 10)
      return !0;
    for (var n = 0; n < t.length; n++) {
      var g = t.charCodeAt(n);
      if (g < 48 || g > 57)
        return !0;
    }
    return t.length === 10 && t >= Math.pow(2, 32);
  }
  function de(t) {
    return Object.keys(t).filter(be).concat(G(t).filter(Object.prototype.propertyIsEnumerable.bind(t)));
  }
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   */
  function l(t, n) {
    if (t === n)
      return 0;
    for (var g = t.length, S = n.length, j = 0, B = Math.min(g, S); j < B; ++j)
      if (t[j] !== n[j]) {
        g = t[j], S = n[j];
        break;
      }
    return g < S ? -1 : S < g ? 1 : 0;
  }
  var p = !0, w = !1, m = 0, P = 1, H = 2, Q = 3;
  function Y(t, n) {
    return N ? t.source === n.source && t.flags === n.flags : RegExp.prototype.toString.call(t) === RegExp.prototype.toString.call(n);
  }
  function a(t, n) {
    if (t.byteLength !== n.byteLength)
      return !1;
    for (var g = 0; g < t.byteLength; g++)
      if (t[g] !== n[g])
        return !1;
    return !0;
  }
  function e(t, n) {
    return t.byteLength !== n.byteLength ? !1 : l(new Uint8Array(t.buffer, t.byteOffset, t.byteLength), new Uint8Array(n.buffer, n.byteOffset, n.byteLength)) === 0;
  }
  function r(t, n) {
    return t.byteLength === n.byteLength && l(new Uint8Array(t), new Uint8Array(n)) === 0;
  }
  function s(t, n) {
    return A(t) ? A(n) && J(Number.prototype.valueOf.call(t), Number.prototype.valueOf.call(n)) : _(t) ? _(n) && String.prototype.valueOf.call(t) === String.prototype.valueOf.call(n) : M(t) ? M(n) && Boolean.prototype.valueOf.call(t) === Boolean.prototype.valueOf.call(n) : ee(t) ? ee(n) && BigInt.prototype.valueOf.call(t) === BigInt.prototype.valueOf.call(n) : ue(n) && Symbol.prototype.valueOf.call(t) === Symbol.prototype.valueOf.call(n);
  }
  function y(t, n, g, S) {
    if (t === n)
      return t !== 0 ? !0 : g ? J(t, n) : !0;
    if (g) {
      if (R(t) !== "object")
        return typeof t == "number" && I(t) && I(n);
      if (R(n) !== "object" || t === null || n === null || Object.getPrototypeOf(t) !== Object.getPrototypeOf(n))
        return !1;
    } else {
      if (t === null || R(t) !== "object")
        return n === null || R(n) !== "object" ? t == n : !1;
      if (n === null || R(n) !== "object")
        return !1;
    }
    var j = C(t), B = C(n);
    if (j !== B)
      return !1;
    if (Array.isArray(t)) {
      if (t.length !== n.length)
        return !1;
      var D = de(t), W = de(n);
      return D.length !== W.length ? !1 : U(t, n, g, S, P, D);
    }
    if (j === "[object Object]" && (!f(t) && f(n) || !h(t) && h(n)))
      return !1;
    if (Z(t)) {
      if (!Z(n) || Date.prototype.getTime.call(t) !== Date.prototype.getTime.call(n))
        return !1;
    } else if (c(t)) {
      if (!c(n) || !Y(t, n))
        return !1;
    } else if (b(t) || t instanceof Error) {
      if (t.message !== n.message || t.name !== n.name)
        return !1;
    } else if (K(t)) {
      if (!g && (se(t) || oe(t))) {
        if (!a(t, n))
          return !1;
      } else if (!e(t, n))
        return !1;
      var z = de(t), re = de(n);
      return z.length !== re.length ? !1 : U(t, n, g, S, m, z);
    } else {
      if (h(t))
        return !h(n) || t.size !== n.size ? !1 : U(t, n, g, S, H);
      if (f(t))
        return !f(n) || t.size !== n.size ? !1 : U(t, n, g, S, Q);
      if ($(t)) {
        if (!r(t, n))
          return !1;
      } else if (V(t) && !s(t, n))
        return !1;
    }
    return U(t, n, g, S, m);
  }
  function O(t, n) {
    return n.filter(function(g) {
      return q(t, g);
    });
  }
  function U(t, n, g, S, j, B) {
    if (arguments.length === 5) {
      B = Object.keys(t);
      var D = Object.keys(n);
      if (B.length !== D.length)
        return !1;
    }
    for (var W = 0; W < B.length; W++)
      if (!k(n, B[W]))
        return !1;
    if (g && arguments.length === 5) {
      var z = G(t);
      if (z.length !== 0) {
        var re = 0;
        for (W = 0; W < z.length; W++) {
          var ne = z[W];
          if (q(t, ne)) {
            if (!q(n, ne))
              return !1;
            B.push(ne), re++;
          } else if (q(n, ne))
            return !1;
        }
        var Ee = G(n);
        if (z.length !== Ee.length && O(n, Ee).length !== re)
          return !1;
      } else {
        var ve = G(n);
        if (ve.length !== 0 && O(n, ve).length !== 0)
          return !1;
      }
    }
    if (B.length === 0 && (j === m || j === P && t.length === 0 || t.size === 0))
      return !0;
    if (S === void 0)
      S = {
        val1: /* @__PURE__ */ new Map(),
        val2: /* @__PURE__ */ new Map(),
        position: 0
      };
    else {
      var Se = S.val1.get(t);
      if (Se !== void 0) {
        var pe = S.val2.get(n);
        if (pe !== void 0)
          return Se === pe;
      }
      S.position++;
    }
    S.val1.set(t, S.position), S.val2.set(n, S.position);
    var Oe = ie(t, n, g, B, S, j);
    return S.val1.delete(t), S.val2.delete(n), Oe;
  }
  function X(t, n, g, S) {
    for (var j = F(t), B = 0; B < j.length; B++) {
      var D = j[B];
      if (y(n, D, g, S))
        return t.delete(D), !0;
    }
    return !1;
  }
  function te(t) {
    switch (R(t)) {
      case "undefined":
        return null;
      case "object":
        return;
      case "symbol":
        return !1;
      case "string":
        t = +t;
      case "number":
        if (I(t))
          return !1;
    }
    return !0;
  }
  function fe(t, n, g) {
    var S = te(g);
    return S ?? (n.has(S) && !t.has(S));
  }
  function he(t, n, g, S, j) {
    var B = te(g);
    if (B != null)
      return B;
    var D = n.get(B);
    return D === void 0 && !n.has(B) || !y(S, D, !1, j) ? !1 : !t.has(B) && y(S, D, !1, j);
  }
  function ae(t, n, g, S) {
    for (var j = null, B = F(t), D = 0; D < B.length; D++) {
      var W = B[D];
      if (R(W) === "object" && W !== null)
        j === null && (j = /* @__PURE__ */ new Set()), j.add(W);
      else if (!n.has(W)) {
        if (g || !fe(t, n, W))
          return !1;
        j === null && (j = /* @__PURE__ */ new Set()), j.add(W);
      }
    }
    if (j !== null) {
      for (var z = F(n), re = 0; re < z.length; re++) {
        var ne = z[re];
        if (R(ne) === "object" && ne !== null) {
          if (!X(j, ne, g, S))
            return !1;
        } else if (!g && !t.has(ne) && !X(j, ne, g, S))
          return !1;
      }
      return j.size === 0;
    }
    return !0;
  }
  function we(t, n, g, S, j, B) {
    for (var D = F(t), W = 0; W < D.length; W++) {
      var z = D[W];
      if (y(g, z, j, B) && y(S, n.get(z), j, B))
        return t.delete(z), !0;
    }
    return !1;
  }
  function Re(t, n, g, S) {
    for (var j = null, B = L(t), D = 0; D < B.length; D++) {
      var W = i(B[D], 2), z = W[0], re = W[1];
      if (R(z) === "object" && z !== null)
        j === null && (j = /* @__PURE__ */ new Set()), j.add(z);
      else {
        var ne = n.get(z);
        if (ne === void 0 && !n.has(z) || !y(re, ne, g, S)) {
          if (g || !he(t, n, z, re, S))
            return !1;
          j === null && (j = /* @__PURE__ */ new Set()), j.add(z);
        }
      }
    }
    if (j !== null) {
      for (var Ee = L(n), ve = 0; ve < Ee.length; ve++) {
        var Se = i(Ee[ve], 2), pe = Se[0], Oe = Se[1];
        if (R(pe) === "object" && pe !== null) {
          if (!we(j, t, pe, Oe, g, S))
            return !1;
        } else if (!g && (!t.has(pe) || !y(t.get(pe), Oe, !1, S)) && !we(j, t, pe, Oe, !1, S))
          return !1;
      }
      return j.size === 0;
    }
    return !0;
  }
  function ie(t, n, g, S, j, B) {
    var D = 0;
    if (B === H) {
      if (!ae(t, n, g, j))
        return !1;
    } else if (B === Q) {
      if (!Re(t, n, g, j))
        return !1;
    } else if (B === P)
      for (; D < t.length; D++)
        if (k(t, D)) {
          if (!k(n, D) || !y(t[D], n[D], g, j))
            return !1;
        } else {
          if (k(n, D))
            return !1;
          for (var W = Object.keys(t); D < W.length; D++) {
            var z = W[D];
            if (!k(n, z) || !y(t[z], n[z], g, j))
              return !1;
          }
          return W.length === Object.keys(n).length;
        }
    for (D = 0; D < S.length; D++) {
      var re = S[D];
      if (!y(t[re], n[re], g, j))
        return !1;
    }
    return !0;
  }
  function ge(t, n) {
    return y(t, n, w);
  }
  function le(t, n) {
    return y(t, n, p);
  }
  return Me = {
    isDeepEqual: ge,
    isDeepStrictEqual: le
  }, Me;
}
var Je;
function Ue() {
  if (Je)
    return Ie.exports;
  Je = 1;
  function i(a) {
    "@babel/helpers - typeof";
    return i = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
      return typeof e;
    } : function(e) {
      return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
    }, i(a);
  }
  function o(a, e) {
    for (var r = 0; r < e.length; r++) {
      var s = e[r];
      s.enumerable = s.enumerable || !1, s.configurable = !0, "value" in s && (s.writable = !0), Object.defineProperty(a, u(s.key), s);
    }
  }
  function d(a, e, r) {
    return e && o(a.prototype, e), r && o(a, r), Object.defineProperty(a, "prototype", { writable: !1 }), a;
  }
  function u(a) {
    var e = v(a, "string");
    return i(e) === "symbol" ? e : String(e);
  }
  function v(a, e) {
    if (i(a) !== "object" || a === null)
      return a;
    var r = a[Symbol.toPrimitive];
    if (r !== void 0) {
      var s = r.call(a, e || "default");
      if (i(s) !== "object")
        return s;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (e === "string" ? String : Number)(a);
  }
  function T(a, e) {
    if (!(a instanceof e))
      throw new TypeError("Cannot call a class as a function");
  }
  var R = Ze(), N = R.codes, F = N.ERR_AMBIGUOUS_ARGUMENT, L = N.ERR_INVALID_ARG_TYPE, J = N.ERR_INVALID_ARG_VALUE, G = N.ERR_INVALID_RETURN_VALUE, I = N.ERR_MISSING_ARGS, E = Tt(), k = je, q = k.inspect, C = je.types, x = C.isPromise, $ = C.isRegExp, K = lt(), Z = dt(), f = pt("RegExp.prototype.test"), c, h;
  function b() {
    var a = Mt();
    c = a.isDeepEqual, h = a.isDeepStrictEqual;
  }
  var V = !1, A = Ie.exports = se, _ = {};
  function M(a) {
    throw a.message instanceof Error ? a.message : new E(a);
  }
  function ee(a, e, r, s, y) {
    var O = arguments.length, U;
    if (O === 0)
      U = "Failed";
    else if (O === 1)
      r = a, a = void 0;
    else {
      if (V === !1) {
        V = !0;
        var X = ce.emitWarning ? ce.emitWarning : console.warn.bind(console);
        X("assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.", "DeprecationWarning", "DEP0094");
      }
      O === 2 && (s = "!=");
    }
    if (r instanceof Error)
      throw r;
    var te = {
      actual: a,
      expected: e,
      operator: s === void 0 ? "fail" : s,
      stackStartFn: y || ee
    };
    r !== void 0 && (te.message = r);
    var fe = new E(te);
    throw U && (fe.message = U, fe.generatedMessage = !0), fe;
  }
  A.fail = ee, A.AssertionError = E;
  function ue(a, e, r, s) {
    if (!r) {
      var y = !1;
      if (e === 0)
        y = !0, s = "No value argument passed to `assert.ok()`";
      else if (s instanceof Error)
        throw s;
      var O = new E({
        actual: r,
        expected: !0,
        message: s,
        operator: "==",
        stackStartFn: a
      });
      throw O.generatedMessage = y, O;
    }
  }
  function se() {
    for (var a = arguments.length, e = new Array(a), r = 0; r < a; r++)
      e[r] = arguments[r];
    ue.apply(void 0, [se, e.length].concat(e));
  }
  A.ok = se, A.equal = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    e != r && M({
      actual: e,
      expected: r,
      message: s,
      operator: "==",
      stackStartFn: a
    });
  }, A.notEqual = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    e == r && M({
      actual: e,
      expected: r,
      message: s,
      operator: "!=",
      stackStartFn: a
    });
  }, A.deepEqual = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    c === void 0 && b(), c(e, r) || M({
      actual: e,
      expected: r,
      message: s,
      operator: "deepEqual",
      stackStartFn: a
    });
  }, A.notDeepEqual = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    c === void 0 && b(), c(e, r) && M({
      actual: e,
      expected: r,
      message: s,
      operator: "notDeepEqual",
      stackStartFn: a
    });
  }, A.deepStrictEqual = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    c === void 0 && b(), h(e, r) || M({
      actual: e,
      expected: r,
      message: s,
      operator: "deepStrictEqual",
      stackStartFn: a
    });
  }, A.notDeepStrictEqual = oe;
  function oe(a, e, r) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    c === void 0 && b(), h(a, e) && M({
      actual: a,
      expected: e,
      message: r,
      operator: "notDeepStrictEqual",
      stackStartFn: oe
    });
  }
  A.strictEqual = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    Z(e, r) || M({
      actual: e,
      expected: r,
      message: s,
      operator: "strictEqual",
      stackStartFn: a
    });
  }, A.notStrictEqual = function a(e, r, s) {
    if (arguments.length < 2)
      throw new I("actual", "expected");
    Z(e, r) && M({
      actual: e,
      expected: r,
      message: s,
      operator: "notStrictEqual",
      stackStartFn: a
    });
  };
  var be = /* @__PURE__ */ d(function a(e, r, s) {
    var y = this;
    T(this, a), r.forEach(function(O) {
      O in e && (s !== void 0 && typeof s[O] == "string" && $(e[O]) && f(e[O], s[O]) ? y[O] = s[O] : y[O] = e[O]);
    });
  });
  function de(a, e, r, s, y, O) {
    if (!(r in a) || !h(a[r], e[r])) {
      if (!s) {
        var U = new be(a, y), X = new be(e, y, a), te = new E({
          actual: U,
          expected: X,
          operator: "deepStrictEqual",
          stackStartFn: O
        });
        throw te.actual = a, te.expected = e, te.operator = O.name, te;
      }
      M({
        actual: a,
        expected: e,
        message: s,
        operator: O.name,
        stackStartFn: O
      });
    }
  }
  function l(a, e, r, s) {
    if (typeof e != "function") {
      if ($(e))
        return f(e, a);
      if (arguments.length === 2)
        throw new L("expected", ["Function", "RegExp"], e);
      if (i(a) !== "object" || a === null) {
        var y = new E({
          actual: a,
          expected: e,
          message: r,
          operator: "deepStrictEqual",
          stackStartFn: s
        });
        throw y.operator = s.name, y;
      }
      var O = Object.keys(e);
      if (e instanceof Error)
        O.push("name", "message");
      else if (O.length === 0)
        throw new J("error", e, "may not be an empty object");
      return c === void 0 && b(), O.forEach(function(U) {
        typeof a[U] == "string" && $(e[U]) && f(e[U], a[U]) || de(a, e, U, r, O, s);
      }), !0;
    }
    return e.prototype !== void 0 && a instanceof e ? !0 : Error.isPrototypeOf(e) ? !1 : e.call({}, a) === !0;
  }
  function p(a) {
    if (typeof a != "function")
      throw new L("fn", "Function", a);
    try {
      a();
    } catch (e) {
      return e;
    }
    return _;
  }
  function w(a) {
    return x(a) || a !== null && i(a) === "object" && typeof a.then == "function" && typeof a.catch == "function";
  }
  function m(a) {
    return Promise.resolve().then(function() {
      var e;
      if (typeof a == "function") {
        if (e = a(), !w(e))
          throw new G("instance of Promise", "promiseFn", e);
      } else if (w(a))
        e = a;
      else
        throw new L("promiseFn", ["Function", "Promise"], a);
      return Promise.resolve().then(function() {
        return e;
      }).then(function() {
        return _;
      }).catch(function(r) {
        return r;
      });
    });
  }
  function P(a, e, r, s) {
    if (typeof r == "string") {
      if (arguments.length === 4)
        throw new L("error", ["Object", "Error", "Function", "RegExp"], r);
      if (i(e) === "object" && e !== null) {
        if (e.message === r)
          throw new F("error/message", 'The error message "'.concat(e.message, '" is identical to the message.'));
      } else if (e === r)
        throw new F("error/message", 'The error "'.concat(e, '" is identical to the message.'));
      s = r, r = void 0;
    } else if (r != null && i(r) !== "object" && typeof r != "function")
      throw new L("error", ["Object", "Error", "Function", "RegExp"], r);
    if (e === _) {
      var y = "";
      r && r.name && (y += " (".concat(r.name, ")")), y += s ? ": ".concat(s) : ".";
      var O = a.name === "rejects" ? "rejection" : "exception";
      M({
        actual: void 0,
        expected: r,
        operator: a.name,
        message: "Missing expected ".concat(O).concat(y),
        stackStartFn: a
      });
    }
    if (r && !l(e, r, s, a))
      throw e;
  }
  function H(a, e, r, s) {
    if (e !== _) {
      if (typeof r == "string" && (s = r, r = void 0), !r || l(e, r)) {
        var y = s ? ": ".concat(s) : ".", O = a.name === "doesNotReject" ? "rejection" : "exception";
        M({
          actual: e,
          expected: r,
          operator: a.name,
          message: "Got unwanted ".concat(O).concat(y, `
`) + 'Actual message: "'.concat(e && e.message, '"'),
          stackStartFn: a
        });
      }
      throw e;
    }
  }
  A.throws = function a(e) {
    for (var r = arguments.length, s = new Array(r > 1 ? r - 1 : 0), y = 1; y < r; y++)
      s[y - 1] = arguments[y];
    P.apply(void 0, [a, p(e)].concat(s));
  }, A.rejects = function a(e) {
    for (var r = arguments.length, s = new Array(r > 1 ? r - 1 : 0), y = 1; y < r; y++)
      s[y - 1] = arguments[y];
    return m(e).then(function(O) {
      return P.apply(void 0, [a, O].concat(s));
    });
  }, A.doesNotThrow = function a(e) {
    for (var r = arguments.length, s = new Array(r > 1 ? r - 1 : 0), y = 1; y < r; y++)
      s[y - 1] = arguments[y];
    H.apply(void 0, [a, p(e)].concat(s));
  }, A.doesNotReject = function a(e) {
    for (var r = arguments.length, s = new Array(r > 1 ? r - 1 : 0), y = 1; y < r; y++)
      s[y - 1] = arguments[y];
    return m(e).then(function(O) {
      return H.apply(void 0, [a, O].concat(s));
    });
  }, A.ifError = function a(e) {
    if (e != null) {
      var r = "ifError got unwanted exception: ";
      i(e) === "object" && typeof e.message == "string" ? e.message.length === 0 && e.constructor ? r += e.constructor.name : r += e.message : r += q(e);
      var s = new E({
        actual: e,
        expected: null,
        operator: "ifError",
        message: r,
        stackStartFn: a
      }), y = e.stack;
      if (typeof y == "string") {
        var O = y.split(`
`);
        O.shift();
        for (var U = s.stack.split(`
`), X = 0; X < O.length; X++) {
          var te = U.indexOf(O[X]);
          if (te !== -1) {
            U = U.slice(0, te);
            break;
          }
        }
        s.stack = "".concat(U.join(`
`), `
`).concat(O.join(`
`));
      }
      throw s;
    }
  };
  function Q(a, e, r, s, y) {
    if (!$(e))
      throw new L("regexp", "RegExp", e);
    var O = y === "match";
    if (typeof a != "string" || f(e, a) !== O) {
      if (r instanceof Error)
        throw r;
      var U = !r;
      r = r || (typeof a != "string" ? 'The "string" argument must be of type string. Received type ' + "".concat(i(a), " (").concat(q(a), ")") : (O ? "The input did not match the regular expression " : "The input was expected to not match the regular expression ") + "".concat(q(e), `. Input:

`).concat(q(a), `
`));
      var X = new E({
        actual: a,
        expected: e,
        message: r,
        operator: y,
        stackStartFn: s
      });
      throw X.generatedMessage = U, X;
    }
  }
  A.match = function a(e, r, s) {
    Q(e, r, s, a, "match");
  }, A.doesNotMatch = function a(e, r, s) {
    Q(e, r, s, a, "doesNotMatch");
  };
  function Y() {
    for (var a = arguments.length, e = new Array(a), r = 0; r < a; r++)
      e[r] = arguments[r];
    ue.apply(void 0, [Y, e.length].concat(e));
  }
  return A.strict = K(Y, A, {
    equal: A.strictEqual,
    deepEqual: A.deepStrictEqual,
    notEqual: A.notStrictEqual,
    notDeepEqual: A.notDeepStrictEqual
  }), A.strict.strict = A.strict, Ie.exports;
}
var Dt = Ue();
function Xe(i) {
  if (typeof i._id != "string")
    throw new Error("Invalid conversation data: _id must be a string");
  if (!Array.isArray(i.messages))
    throw new Error("Invalid conversation data: messages must be an array");
  if (typeof i.createdAt != "number" || new Date(i.createdAt).getTime() !== i.createdAt)
    throw new Error(
      `Invalid conversation data: createdAt must be a valid datetime number. Got ${i.createdAt}`
    );
  return {
    _id: i._id,
    messages: i.messages,
    createdAt: i.createdAt
  };
}
const Ct = "X-Request-Origin";
function Ut() {
  if (typeof window < "u")
    return window.location.href;
}
class De extends Error {
  constructor(o, d = {}) {
    const { retryAfter: u = 1e3, data: v } = d;
    super(o), this.name = "RetriableError", this.message = o, this.retryAfter = u, this.data = v;
  }
}
class Ft extends Error {
  constructor(o) {
    super(o), this.name = "TimeoutError", this.message = o;
  }
}
function Lt(i) {
  const o = i;
  return typeof o.type == "string" && typeof o.data < "u";
}
const Bt = (i) => i === "delta" || i === "references" || i === "metadata" || i === "finished", $t = (i) => {
  const o = i;
  return o.type === "delta" && typeof o.data == "string" || o.type === "references" && typeof o.data == "object" || o.type === "metadata" && typeof o.data == "object" || o.type === "finished" && typeof o.data == "string";
};
class Vt {
  constructor(o) {
    Dt.strict(
      o.serverUrl,
      "You must define a serverUrl for the ConversationService"
    ), this.serverUrl = o.serverUrl.startsWith("/") ? new URL(
      o.serverUrl,
      window.location.protocol + "//" + window.location.host
    ).href : o.serverUrl;
    const d = new Headers({
      "Content-Type": "application/json",
      [`${Ct}`]: Ut() ?? ""
    });
    this.getFetchOptions = () => {
      const u = typeof o.fetchOptions == "function" ? o.fetchOptions() : o.fetchOptions;
      return {
        ...u ?? {},
        headers: this.mergeHeaders(
          d,
          u != null && u.headers ? new Headers(u.headers) : new Headers()
        )
      };
    };
  }
  mergeHeaders(o, d) {
    const u = new Headers();
    for (const [v, T] of o.entries())
      u.append(v, T);
    for (const [v, T] of d.entries())
      u.append(v, T);
    return u;
  }
  getUrl(o, d = {}) {
    if (!o.startsWith("/"))
      throw new Error(
        `Invalid path: ${o} - ConversationService paths must start with /`
      );
    const u = new URL(
      o.replace(/^\/?/, ""),
      // Strip leading slash (if present) to not clobber baseUrl path
      this.serverUrl.replace(/\/?$/, "/")
      // Add trailing slash to not lose last segment of baseUrl
    ), v = new URLSearchParams(d).toString();
    return v ? `${u}?${v}` : u.toString();
  }
  async createConversation() {
    const o = "/conversations", d = await fetch(this.getUrl(o), {
      ...this.getFetchOptions(),
      method: "POST"
    }), u = await d.json();
    if (d.status === 400)
      throw new Error(`Bad request: ${u.error}`);
    if (d.status === 429)
      throw new Error(`Rate limited: ${u.error}`);
    if (d.status >= 500)
      throw new Error(`Server error: ${u.error}`);
    return Xe(u);
  }
  async getConversation(o) {
    const d = `/conversations/${o}`, u = await fetch(this.getUrl(d), this.getFetchOptions());
    if (u.status === 404)
      throw new Error(`Conversation not found: ${o}`);
    const v = await u.json();
    if (u.status !== 200)
      throw new Error(`Failed to fetch conversation: ${v.error}`);
    return Xe(v);
  }
  async addMessage({
    conversationId: o,
    message: d,
    clientContext: u
  }) {
    const v = `/conversations/${o}/messages`, T = {
      message: d
    };
    u && (T.clientContext = u);
    const R = await fetch(this.getUrl(v), {
      ...this.getFetchOptions(),
      method: "POST",
      body: JSON.stringify(T)
    }), N = await R.json();
    if (R.status === 400)
      throw new Error(N.error);
    if (R.status === 404)
      throw new Error(`Conversation not found: ${N.error}`);
    if (R.status === 429)
      throw new Error(`Rate limited: ${N.error}`);
    if (R.status === 504)
      throw new Ft(N.error);
    if (R.status >= 500)
      throw new Error(`Server error: ${N.error}`);
    return N;
  }
  async addMessageStreaming({
    conversationId: o,
    message: d,
    clientContext: u,
    maxRetries: v = 0,
    onResponseDelta: T,
    onReferences: R,
    onMetadata: N,
    onResponseFinished: F,
    signal: L
  }) {
    const J = `/conversations/${o}/messages`, G = {
      message: d
    };
    u && (G.clientContext = u);
    let I = 0, E = !0;
    const k = this.getFetchOptions();
    await At(this.getUrl(J, { stream: "true" }), {
      ...k,
      // Need to convert Headers to plain object for fetchEventSource
      headers: Object.fromEntries(k.headers),
      signal: L ?? null,
      method: "POST",
      body: JSON.stringify(G),
      openWhenHidden: !0,
      onmessage(q) {
        const C = JSON.parse(q.data);
        if (Lt(C) && Bt(C.type) && $t(C))
          switch (C.type) {
            case "delta": {
              const x = C.data.replaceAll("\\n", `
`);
              T(x);
              break;
            }
            case "references": {
              R(C.data);
              break;
            }
            case "metadata": {
              N(C.data);
              break;
            }
            case "finished": {
              E = !1;
              const x = C.data;
              F(x);
              break;
            }
          }
      },
      async onopen(q) {
        if (!(q.ok && q.headers.get("content-type") === "text/event-stream")) {
          if (q.status === 400) {
            const C = await q.json();
            throw new Error(C.error ?? "Bad request");
          }
          throw q.status > 400 && q.status < 500 && q.status !== 429 ? new Error(`Chatbot stream error: ${q.statusText}`) : new De(
            `Chatbot stream error: ${q.statusText}`,
            {
              retryAfter: 1e3,
              data: q
            }
          );
        }
      },
      onclose() {
        if (E)
          throw new De("Chatbot stream closed unexpectedly");
      },
      onerror(q) {
        if (q instanceof De) {
          if (E && I++ < v)
            return q.retryAfter;
          if (!q.data)
            throw new Error(q.message);
          if (q.data instanceof Response)
            q.data.json().then((x) => {
              throw new Error(x.error);
            });
          else
            throw new Error(q.message);
        } else if (q instanceof Error)
          throw new Error(q.message);
        throw q;
      }
    });
  }
  async rateMessage({
    conversationId: o,
    messageId: d,
    rating: u
  }) {
    const v = `/conversations/${o}/messages/${d}/rating`, T = await fetch(this.getUrl(v), {
      ...this.getFetchOptions(),
      method: "POST",
      body: JSON.stringify({ rating: u })
    });
    if (T.status === 204)
      return u;
    if (T.status >= 400) {
      const R = await T.json();
      throw new Error(R.error);
    }
    throw new Error(
      `Server encountered an unexpected status: ${T.status} (message: ${T.statusText})`
    );
  }
  async commentMessage({
    conversationId: o,
    messageId: d,
    comment: u
  }) {
    const v = `/conversations/${o}/messages/${d}/comment`, T = await fetch(this.getUrl(v), {
      ...this.getFetchOptions(),
      method: "POST",
      body: JSON.stringify({ comment: u })
    });
    if (T.status !== 204) {
      if (T.status >= 400) {
        const R = await T.json();
        throw new Error(R.error);
      }
      throw new Error(
        `Server encountered an unexpected status: ${T.status} (message: ${T.statusText})`
      );
    }
  }
}
function kt(i, o, d = Object.is) {
  const u = i.getState(), [[v, T], R] = it((N, F) => {
    if (F)
      return F;
    const L = i.getState();
    if (Object.is(N[2], L) && N[1] === i)
      return N;
    const J = o(L);
    return d(N[0], J) && N[1] === i ? N : [J, i, L];
  }, void 0, () => [o(u), i, u]);
  if (st(() => {
    const N = i.subscribe(() => R());
    return R(), N;
  }, [i]), T !== i) {
    const N = o(u);
    return R([N, i, u]), N;
  }
  return v;
}
function Gt(i) {
  const o = vt(), d = kt(
    o,
    (I) => I,
    // Select the entire state
    Object.is
    // Use Object.is for shallow comparison
  ), u = ct(() => new Vt({
    serverUrl: i.serverBaseUrl,
    fetchOptions: i.fetchOptions
  }), [i.serverBaseUrl, i.fetchOptions]), v = i.sortMessageReferences ?? ot(), T = me(
    (I) => {
      o.getState().api.setConversationError(I);
    },
    [o]
  ), R = me(async () => {
    try {
      const I = await u.createConversation();
      o.getState().api.initialize({
        conversationId: I._id,
        messages: I.messages.map(Le)
      });
    } catch (I) {
      const E = typeof I == "string" ? I : I instanceof Error ? I.message : "Failed to create conversation.";
      console.error(E), T(E);
    }
  }, [u, o, T]), N = me(
    async (I) => {
      var b, V, A;
      const E = yt() && (i.shouldStream ?? !0), k = new AbortController();
      let q = !1, C = !E, x = null, $ = null, K = [], Z = [];
      const f = 50;
      let c, h;
      c = setInterval(() => {
        const [_, ...M] = K;
        K = M, _ && o.getState().api.appendStreamingResponse(_);
        const ee = q && K.length === 0;
        $ && ee && (bt(
          /```/g,
          Z.join("")
        ) % 2 !== 0 && o.getState().api.appendStreamingResponse("\n```\n\n"), o.getState().api.appendStreamingReferences(
          $.sort(v)
        ), $ = null), !C && ee && (x || (x = gt()), o.getState().api.finishStreamingResponse(x), C = !0);
      }, f);
      try {
        if (o.getState().api.addMessage({
          role: "user",
          content: I
        }), E)
          o.getState().api.createStreamingResponse(), await u.addMessageStreaming({
            conversationId: d.conversationId ?? "null",
            message: I,
            clientContext: (b = i.getClientContext) == null ? void 0 : b.call(i),
            maxRetries: 0,
            onResponseDelta: async (_) => {
              K = [...K, _], Z = [...Z, _];
            },
            onReferences: async (_) => {
              $ === null && ($ = []), $.push(..._);
            },
            onMetadata: async (_) => {
              _ != null && _.conversationId && o.getState().api.setConversationId(_.conversationId), o.getState().api.updateMessageMetadata(
                ht,
                (M) => ({ ...M, ..._ })
              );
            },
            onResponseFinished: async (_) => {
              x = _, q = !0;
            },
            signal: k.signal
          });
        else {
          o.getState().api.createStreamingResponse();
          const _ = await u.addMessage({
            conversationId: d.conversationId ?? "null",
            message: I,
            clientContext: (V = i.getClientContext) == null ? void 0 : V.call(i)
          });
          (A = _.metadata) != null && A.conversationId && o.getState().api.setConversationId(_.metadata.conversationId), o.getState().api.cancelStreamingResponse(), o.getState().api.addMessage(_);
        }
      } catch (_) {
        k.abort(), console.error(`Failed to add message: ${_}`);
        const M = _ instanceof Error ? _.message : String(_);
        throw o.getState().api.cancelStreamingResponse(), clearInterval(c), T(M), _;
      }
      return new Promise((_) => {
        h = setInterval(() => {
          C && (clearInterval(c), clearInterval(h), _());
        }, f);
      });
    },
    [
      i.shouldStream,
      i.getClientContext,
      v,
      o,
      u,
      d.conversationId,
      T
    ]
  ), F = me(
    (I) => o.getState().messages.find((E) => E.id === I),
    [o]
  ), L = me(
    async (I, E) => {
      if (!d.conversationId) {
        console.error("Cannot rateMessage without a conversationId");
        return;
      }
      await u.rateMessage({
        conversationId: d.conversationId,
        messageId: I,
        rating: E
      }), o.getState().api.rateMessage(I, E);
    },
    [u, d.conversationId, o]
  ), J = me(
    async (I, E) => {
      if (!d.conversationId) {
        console.error("Cannot commentMessage without a conversationId");
        return;
      }
      await u.commentMessage({
        conversationId: d.conversationId,
        messageId: I,
        comment: E
      });
    },
    [u, d.conversationId]
  ), G = me(
    async (I) => {
      try {
        const E = await u.getConversation(
          I
        );
        o.getState().api.initialize({
          conversationId: E._id,
          messages: E.messages.map(Le)
        });
      } catch (E) {
        const k = typeof E == "string" ? E : E instanceof Error ? E.message : "Failed to switch conversation.";
        throw console.error(k), E;
      }
    },
    [u, o]
  );
  return {
    ...d,
    createConversation: R,
    submit: N,
    getMessage: F,
    rateMessage: L,
    commentMessage: J,
    switchConversation: G
  };
}
const Ht = (i) => {
  i();
}, Wt = typeof Fe.startTransition == "function" ? Fe.startTransition : Ht;
function zt({
  onOpen: i,
  onClose: o,
  chatbotName: d,
  isExperimental: u = !0,
  maxInputCharacters: v,
  maxCommentCharacters: T,
  ...R
}) {
  const N = Gt(R), [F, L] = Ne(!1), [J, G] = Ne(!1), I = ut(null);
  async function E() {
    F || (i == null || i(), Wt(() => {
      L(!0);
    }));
  }
  function k() {
    return F ? (o == null || o(), L(!1), !0) : !1;
  }
  const [q, C] = Ne({
    text: "",
    error: ""
  }), x = q.text, $ = q.error;
  function K(c) {
    const h = v ? c.length <= v : !0;
    C({
      text: c,
      error: h ? "" : `Input must be less than ${v} characters`
    });
  }
  function Z(c) {
    return q.error ? (console.error("Cannot add message with invalid input text"), !1) : c.replace(/\s/g, "").length === 0 ? (console.error("Cannot add message with no text"), !1) : J ? (console.error("Cannot add message while awaiting a reply"), !1) : !0;
  }
  async function f(c) {
    if (Z(c))
      try {
        K(""), G(!0), E(), await N.submit(c);
      } catch (h) {
        console.error(h);
      } finally {
        G(!1);
      }
  }
  return {
    awaitingReply: J,
    canSubmit: Z,
    chatbotName: d,
    closeChat: k,
    conversation: N,
    handleSubmit: f,
    inputBarRef: I,
    inputText: x,
    inputTextError: $,
    isExperimental: u,
    maxInputCharacters: v,
    maxCommentCharacters: T,
    open: F,
    openChat: E,
    setInputText: K
  };
}
function ir({
  children: i,
  serverBaseUrl: o,
  shouldStream: d,
  user: u,
  name: v,
  fetchOptions: T,
  isExperimental: R,
  onOpen: N,
  onClose: F,
  sortMessageReferences: L,
  getClientContext: J,
  ...G
}) {
  const { darkMode: I } = rt(G.darkMode), E = 3e3, k = G.maxInputCharacters ?? E, q = 500, C = G.maxCommentCharacters ?? q, x = G.tck ?? "mongodb_ai_chatbot";
  return /* @__PURE__ */ ye.jsxDEV(nt, { darkMode: I, children: /* @__PURE__ */ ye.jsxDEV(mt, { children: /* @__PURE__ */ ye.jsxDEV(wt, { tck: x, children: /* @__PURE__ */ ye.jsxDEV(at, { user: u, children: /* @__PURE__ */ ye.jsxDEV(
    Yt,
    {
      fetchOptions: T,
      getClientContext: J,
      isExperimental: R,
      maxCommentCharacters: C,
      maxInputCharacters: k,
      name: v,
      onOpen: N,
      onClose: F,
      serverBaseUrl: o,
      shouldStream: d,
      sortMessageReferences: L,
      children: i
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
      lineNumber: 52,
      columnNumber: 13
    },
    this
  ) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
    lineNumber: 51,
    columnNumber: 11
  }, this) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
    lineNumber: 50,
    columnNumber: 9
  }, this) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
    lineNumber: 49,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
    lineNumber: 48,
    columnNumber: 5
  }, this);
}
function Yt({ children: i, ...o }) {
  const d = zt({
    ...o
  });
  return /* @__PURE__ */ ye.jsxDEV(Et, { ...d, children: /* @__PURE__ */ ye.jsxDEV(St, { children: i }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
    lineNumber: 97,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Chatbot.tsx",
    lineNumber: 96,
    columnNumber: 5
  }, this);
}
export {
  ir as C,
  De as R,
  Ft as T,
  zt as a,
  Vt as b,
  Gt as u
};
