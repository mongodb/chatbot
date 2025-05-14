import o, { forwardRef as C } from "react";
import { u as Q, c as U } from "./index5.js";
import { x as V, D as X, S as Y, w as Z, f as ee } from "./index14.js";
import { N as te } from "./index6.js";
import { m as l, N as g, F as b, b as x, d as A, j as ne, n as h, i as K, R as re } from "./index2.js";
import { l as ae } from "./X.js";
import { K as oe } from "./index9.js";
import { t as ie } from "./index4.js";
function le(e) {
  var t = function(n, r) {
    if (typeof n != "object" || !n)
      return n;
    var a = n[Symbol.toPrimitive];
    if (a !== void 0) {
      var i = a.call(n, r);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function k(e, t, n) {
  return (t = le(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function E() {
  return E = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n)
        Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, E.apply(this, arguments);
}
function ce(e, t) {
  if (e == null)
    return {};
  var n, r, a = function(s, m) {
    if (s == null)
      return {};
    var c, d, f = {}, u = Object.keys(s);
    for (d = 0; d < u.length; d++)
      c = u[d], m.indexOf(c) >= 0 || (f[c] = s[c]);
    return f;
  }(e, t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (r = 0; r < i.length; r++)
      n = i[r], t.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (a[n] = e[n]);
  }
  return a;
}
function y(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var P, S, $, T, M, de = l(P || (P = y([`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px `, `px;
  border-bottom: 1px solid;
`])), g[4]), se = k(k({}, x.Dark, l(S || (S = y([`
    background-color: `, `;
    border-color: `, `;
  `])), b.black, b.gray.dark2)), x.Light, l($ || ($ = y([`
    background-color: `, `;
    border-color: `, `;
  `])), b.white, b.gray.light2)), ue = l(T || (T = y([`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: `, `px;
`])), g[2]), fe = l(M || (M = y([`
  margin: auto;
`]))), pe = ["title", "className", "align", "onClose", "badgeText", "darkMode", "iconSlot"], G = C(function(e, t) {
  var n = e.title, r = e.className, a = e.align, i = a === void 0 ? z.Center : a, s = e.onClose, m = e.badgeText, c = e.darkMode, d = e.iconSlot, f = ce(e, pe), u = A(c), j = u.darkMode, v = u.theme;
  return o.createElement(ne, { darkMode: j }, o.createElement("div", E({ className: h(de, se[v], r) }, f, { ref: t }), o.createElement("div", { className: h(ue, k({}, fe, i === z.Center)) }, o.createElement(V, { variant: X.Mongo, sizeOverride: 24 }), o.createElement(ie, null, o.createElement("strong", null, n)), m && o.createElement(te, { variant: "blue" }, m)), !!s && o.createElement(oe, { "aria-label": "Close chat", onClick: s }, d || o.createElement(ae, null))));
});
G.displayName = "TitleBar";
var z = { Center: "center", Left: "left" };
function me(e) {
  var t = function(n, r) {
    if (typeof n != "object" || !n)
      return n;
    var a = n[Symbol.toPrimitive];
    if (a !== void 0) {
      var i = a.call(n, r);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function N(e, t, n) {
  return (t = me(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function O() {
  return O = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n)
        Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, O.apply(this, arguments);
}
function H(e, t) {
  if (e == null)
    return {};
  var n, r, a = function(s, m) {
    if (s == null)
      return {};
    var c, d, f = {}, u = Object.keys(s);
    for (d = 0; d < u.length; d++)
      c = u[d], m.indexOf(c) >= 0 || (f[c] = s[c]);
    return f;
  }(e, t);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (r = 0; r < i.length; r++)
      n = i[r], t.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (a[n] = e[n]);
  }
  return a;
}
function p(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var D, I, B, F, L, W, R, _, q, be = l(D || (D = p([`
  width: 100%;
  border: 1px solid;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`]))), ge = N(N({}, x.Dark, l(I || (I = p([`
    border-color: `, `;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.05);
    background-color: `, `;
  `])), b.gray.dark2, b.black)), x.Light, l(B || (B = p([`
    border-color: `, `;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.05);
    background: `, `;
  `])), b.gray.light2, b.gray.light3)), ve = l(F || (F = p([`
  display: flex;
  flex-direction: column;
  align-items: center;
`]))), ye = l(L || (L = p([`
  width: 100%;
  padding: `, `px;
  padding-top: `, `px;
  display: flex;
  justify-content: center;
`])), g[5], g[3]), xe = l(W || (W = p([`
  padding-top: `, `px;
`])), g[2]), he = l(R || (R = p([`
  width: 100%;
  max-width: `, `px;
`])), K.Tablet), w = Y[Z.Default] + g[3];
l(_ || (_ = p([`
  padding: 0px `, `px;
`])), w), l(q || (q = p([`
  // InputBar has padding of: avatarPadding + MessageFeed padding to align with MessageContainer
  padding-left: `, `px;
  padding-right: `, `px;
`])), w + g[5], w + g[5]);
var Oe = ["children", "className", "darkMode", "title", "badgeText", "onClose", "iconSlot"], J = C(function(e, t) {
  var n = e.children, r = e.className, a = e.darkMode, i = e.title, s = e.badgeText, m = e.onClose, c = e.iconSlot, d = H(e, Oe), f = A(a).theme, u = Q().containerWidth, j = ee(n).map(function(v) {
    return re(v, "InputBar") ? o.createElement("div", { className: h(ye, N({}, xe, !!u && u < K.Tablet)), key: "input-bar-container" }, o.createElement("div", { className: he }, v)) : v;
  });
  return o.createElement("div", O({ className: h(be, ge[f], r), ref: t }, d), o.createElement(G, { title: i, badgeText: s, onClose: m, iconSlot: c }), o.createElement("div", { className: ve }, j));
});
J.displayName = "ChatWindowContents";
var je = ["children"], we = C(function(e, t) {
  var n = e.children, r = H(e, je);
  return o.createElement(U, null, o.createElement(J, O({}, r, { ref: t }), n));
});
we.displayName = "ChatWindow";
export {
  we as A
};
