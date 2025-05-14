import m from "react";
import { m as s, n as V, X as D, F as i, k as v, b as y, E as I, W as tn, a0 as on, d as an, R as ln, aj as W } from "./index2.js";
import { z as cn } from "./index10.js";
import { createPortal as un } from "react-dom";
function x() {
  return x = Object.assign ? Object.assign.bind() : function(n) {
    for (var r = 1; r < arguments.length; r++) {
      var e = arguments[r];
      for (var t in e)
        Object.prototype.hasOwnProperty.call(e, t) && (n[t] = e[t]);
    }
    return n;
  }, x.apply(this, arguments);
}
function sn(n, r) {
  if (n == null)
    return {};
  var e, t, o = function(b, d) {
    if (b == null)
      return {};
    var c, u, g = {}, p = Object.keys(b);
    for (u = 0; u < p.length; u++)
      c = p[u], d.indexOf(c) >= 0 || (g[c] = b[c]);
    return g;
  }(n, r);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(n);
    for (t = 0; t < a.length; t++)
      e = a[t], r.indexOf(e) >= 0 || Object.prototype.propertyIsEnumerable.call(n, e) && (o[e] = n[e]);
  }
  return o;
}
function fn(n, r) {
  return r || (r = n.slice(0)), Object.freeze(Object.defineProperties(n, { raw: { value: Object.freeze(r) } }));
}
function bn(n, r) {
  n["aria-label"] || n["aria-labelledby"] || console.error("For screen-reader accessibility, aria-label or aria-labelledby must be provided".concat(r ? " to ".concat(r) : "", "."));
}
var N, dn = ["children", "className"], gn = s(N || (N = fn([`
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  height: 1px;
  width: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
`])));
function pn(n) {
  var r = n.children, e = n.className, t = sn(n, dn);
  return m.createElement("div", x({}, t, { className: V(gn, e) }), r);
}
pn.displayName = "VisuallyHidden";
function z(n, r) {
  var e = Object.keys(n);
  if (Object.getOwnPropertySymbols) {
    var t = Object.getOwnPropertySymbols(n);
    r && (t = t.filter(function(o) {
      return Object.getOwnPropertyDescriptor(n, o).enumerable;
    })), e.push.apply(e, t);
  }
  return e;
}
function L(n) {
  for (var r = 1; r < arguments.length; r++) {
    var e = arguments[r] != null ? arguments[r] : {};
    r % 2 ? z(Object(e), !0).forEach(function(t) {
      l(n, t, e[t]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(e)) : z(Object(e)).forEach(function(t) {
      Object.defineProperty(n, t, Object.getOwnPropertyDescriptor(e, t));
    });
  }
  return n;
}
function yn(n) {
  var r = function(e, t) {
    if (typeof e != "object" || !e)
      return e;
    var o = e[Symbol.toPrimitive];
    if (o !== void 0) {
      var a = o.call(e, t);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(e);
  }(n, "string");
  return typeof r == "symbol" ? r : r + "";
}
function l(n, r, e) {
  return (r = yn(r)) in n ? Object.defineProperty(n, r, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : n[r] = e, n;
}
function hn(n, r) {
  if (n == null)
    return {};
  var e, t, o = function(b, d) {
    if (b == null)
      return {};
    var c, u, g = {}, p = Object.keys(b);
    for (u = 0; u < p.length; u++)
      c = p[u], d.indexOf(c) >= 0 || (g[c] = b[c]);
    return g;
  }(n, r);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(n);
    for (t = 0; t < a.length; t++)
      e = a[t], r.indexOf(e) >= 0 || Object.prototype.propertyIsEnumerable.call(n, e) && (o[e] = n[e]);
  }
  return o;
}
function f(n, r) {
  return r || (r = n.slice(0)), Object.freeze(Object.defineProperties(n, { raw: { value: Object.freeze(r) } }));
}
var C, A, X, F, M, T, B, R, H, _, q, G, J, K, w = { Default: "default", Large: "large", XLarge: "xlarge" }, mn = s(C || (C = f([`
  border: none;
  -webkit-appearance: unset;
  padding: unset;
`]))), vn = s(A || (A = f([`
  display: inline-block;
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: `, `ms ease-in-out;
  transition-property: color, box-shadow;

  // Set background to fully-transparent white for cross-browser compatability with Safari
  //
  // Safari treats "transparent" values in CSS as transparent black instead of white
  // which can make things render differently across browsers if not defined explicitly.
  background-color: rgba(255, 255, 255, 0);

  &:before {
    content: '';
    transition: `, `ms all ease-in-out;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 100%;
    transform: scale(0.8);
  }

  &:active:before,
  &:hover:before,
  &:focus:before {
    transform: scale(1);
  }

  &:focus {
    outline: none;
  }
`])), D.default, D.default), On = l(l(l({}, w.Default, s(X || (X = f([`
    height: 28px;
    width: 28px;
  `])))), w.Large, s(F || (F = f([`
    height: 36px;
    width: 36px;
  `])))), w.XLarge, s(M || (M = f([`
    height: 42px;
    width: 42px;
  `])))), kn = l(l({}, y.Light, s(T || (T = f([`
    color: `, `;

    &:active,
    &:hover {
      color: `, `;

      &:before {
        background-color: `, `;
      }
    }
  `])), i.gray.dark1, i.black, v(0.9, i.gray.dark2))), y.Dark, s(B || (B = f([`
    color: `, `;

    &:active,
    &:hover {
      color: `, `;

      &:before {
        background-color: `, `;
      }
    }
  `])), i.gray.light1, i.gray.light3, v(0.9, i.gray.light2))), wn = l(l({}, y.Light, s(R || (R = f([`
    &:focus-visible {
      color: `, `;
      box-shadow: `, `;

      &:before {
        background-color: `, `;
      }
    }
  `])), i.black, I[y.Light].default, v(0.9, i.gray.dark2))), y.Dark, s(H || (H = f([`
    &:focus-visible {
      color: `, `;
      box-shadow: `, `;

      &:before {
        background-color: `, `;
      }
    }
  `])), i.gray.light3, I[y.Dark].default, v(0.9, i.gray.light2))), jn = l(l({}, y.Light, s(_ || (_ = f([`
    cursor: not-allowed;
    color: `, `;
    background-color: rgba(255, 255, 255, 0);

    &:active,
    &:hover {
      color: `, `;

      &:before {
        background-color: rgba(255, 255, 255, 0);
      }
    }

    &:focus {
      color: `, `;

      &:before {
        background-color: rgba(255, 255, 255, 0);
      }
    }
  `])), i.gray.light1, i.gray.light1, i.gray.light1)), y.Dark, s(q || (q = f([`
    cursor: not-allowed;
    color: `, `;
    background-color: rgba(255, 255, 255, 0);

    &:active,
    &:hover {
      color: `, `;

      &:before {
        background-color: rgba(255, 255, 255, 0);
      }
    }

    &:focus {
      color: `, `;

      &:before {
        background-color: rgba(255, 255, 255, 0);
      }
    }
  `])), i.gray.dark1, i.gray.dark1, i.gray.dark1)), xn = l(l({}, y.Light, s(G || (G = f([`
    color: `, `;

    &:before {
      background-color: `, `;
      transform: scale(1);
    }
  `])), i.black, v(0.9, i.gray.dark2))), y.Dark, s(J || (J = f([`
    color: `, `;

    &:before {
      background-color: `, `;
      transform: scale(1);
    }
  `])), i.gray.light3, v(0.9, i.gray.light2))), Pn = s(K || (K = f([`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`]))), Sn = ["as", "size", "darkMode", "disabled", "active", "tabIndex", "className", "children"], $n = tn(function(n, r) {
  var e = n.as, t = n.size, o = t === void 0 ? w.Default : t, a = n.darkMode, b = n.disabled, d = b !== void 0 && b, c = n.active, u = c !== void 0 && c, g = n.tabIndex, p = g === void 0 ? 0 : g, j = n.className, Q = n.children, Y = hn(n, Sn), P = on(e, Y, "button"), Z = P.Component, O = P.rest, k = an(a).theme;
  bn(O, "IconButton");
  var nn = m.Children.map(Q, function(h) {
    if (!h)
      return null;
    if (ln(h, "Icon") || cn(h)) {
      var S = h.props, rn = S.size, $ = S.title, E = { size: rn || o };
      return typeof $ == "string" && $.length !== 0 || (E.title = !1), m.cloneElement(h, E);
    }
    return h;
  }), en = L(L({}, O), {}, l(l(l(l({ ref: r, tabIndex: p }, "aria-disabled", d), "href", d ? void 0 : O.href), "onClick", d ? void 0 : O.onClick), "className", V(mn, vn, On[o], kn[k], wn[k], l(l({}, xn[k], u && !d), jn[k], d), j)));
  return m.createElement(Z, en, m.createElement("div", { className: Pn }, nn));
});
$n.displayName = "IconButton";
function En(n, r) {
  return function(e) {
    if (Array.isArray(e))
      return e;
  }(n) || function(e, t) {
    var o = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (o != null) {
      var a, b, d, c, u = [], g = !0, p = !1;
      try {
        if (d = (o = o.call(e)).next, t !== 0)
          for (; !(g = (a = d.call(o)).done) && (u.push(a.value), u.length !== t); g = !0)
            ;
      } catch (j) {
        p = !0, b = j;
      } finally {
        try {
          if (!g && o.return != null && (c = o.return(), Object(c) !== c))
            return;
        } finally {
          if (p)
            throw b;
        }
      }
      return u;
    }
  }(n, r) || function(e, t) {
    if (e) {
      if (typeof e == "string")
        return U(e, t);
      var o = Object.prototype.toString.call(e).slice(8, -1);
      if (o === "Object" && e.constructor && (o = e.constructor.name), o === "Map" || o === "Set")
        return Array.from(e);
      if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o))
        return U(e, t);
    }
  }(n, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function U(n, r) {
  r > n.length && (r = n.length);
  for (var e = 0, t = new Array(r); e < r; e++)
    t[e] = n[e];
  return t;
}
function Dn(n, r) {
  var e = En(m.useState(), 2), t = e[0], o = e[1];
  return W(function() {
    if (n)
      return r && (r.current = n), void o(n);
    var a = document.createElement("div");
    return document.body.appendChild(a), r && (r.current = a), o(a), function() {
      a.remove();
    };
  }, [n, r]), t;
}
function In(n) {
  var r = n.children, e = n.className, t = n.container, o = n.portalRef, a = Dn(t ?? void 0, o);
  return W(function() {
    a && !t && (a.className = e ?? "");
  }, [t, a, e]), a ? un(r, a) : null;
}
In.displayName = "Portal";
export {
  $n as K,
  In as u,
  pn as w
};
