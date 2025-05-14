import S from "react";
import { m as a, z as $, B as E, F as r, b as p, d as R, n as Y } from "./index2.js";
function M(e) {
  var n = function(o, c) {
    if (typeof o != "object" || !o)
      return o;
    var d = o[Symbol.toPrimitive];
    if (d !== void 0) {
      var g = d.call(o, c);
      if (typeof g != "object")
        return g;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(o);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function l(e, n, o) {
  return (n = M(n)) in e ? Object.defineProperty(e, n, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = o, e;
}
function h() {
  return h = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var o = arguments[n];
      for (var c in o)
        Object.prototype.hasOwnProperty.call(o, c) && (e[c] = o[c]);
    }
    return e;
  }, h.apply(this, arguments);
}
function _(e, n) {
  if (e == null)
    return {};
  var o, c, d = function(u, f) {
    if (u == null)
      return {};
    var b, y, k = {}, s = Object.keys(u);
    for (y = 0; y < s.length; y++)
      b = s[y], f.indexOf(b) >= 0 || (k[b] = u[b]);
    return k;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var g = Object.getOwnPropertySymbols(e);
    for (c = 0; c < g.length; c++)
      o = g[c], n.indexOf(o) >= 0 || Object.prototype.propertyIsEnumerable.call(e, o) && (d[o] = e[o]);
  }
  return d;
}
function t(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
var m, v, w, O, j, x, G, P, B, L, D, N, z, i = { DarkGray: "darkgray", LightGray: "lightgray", Red: "red", Yellow: "yellow", Blue: "blue", Green: "green" }, F = a(m || (m = t([`
  font-family: `, `;
  display: inline-flex;
  align-items: center;
  font-weight: `, `;
  font-size: 12px;
  line-height: 16px;
  border-radius: 24px;
  height: 18px;
  padding-left: 6px;
  padding-right: 6px;
  text-transform: uppercase;
  border: 1px solid;
  letter-spacing: 0.4px;
`])), $.default, E.bold), I = l(l({}, p.Dark, l(l(l(l(l(l({}, i.LightGray, a(v || (v = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.gray.dark3, r.gray.dark2, r.gray.light2)), i.DarkGray, a(w || (w = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.gray.dark1, r.gray.base, r.gray.light3)), i.Red, a(O || (O = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.red.dark3, r.red.dark2, r.red.light2)), i.Yellow, a(j || (j = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.yellow.dark3, r.yellow.dark2, r.yellow.light2)), i.Blue, a(x || (x = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.blue.dark2, r.blue.dark1, r.blue.light2)), i.Green, a(G || (G = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.green.dark3, r.green.dark2, r.green.light1))), p.Light, l(l(l(l(l(l({}, i.LightGray, a(P || (P = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.gray.light3, r.gray.light2, r.gray.dark1)), i.DarkGray, a(B || (B = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.gray.dark2, r.gray.dark3, r.white)), i.Red, a(L || (L = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.red.light3, r.red.light2, r.red.dark2)), i.Yellow, a(D || (D = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.yellow.light3, r.yellow.light2, r.yellow.dark2)), i.Blue, a(N || (N = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.blue.light3, r.blue.light2, r.blue.dark1)), i.Green, a(z || (z = t([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;
    `])), r.green.light3, r.green.light2, r.green.dark2))), T = ["children", "variant", "className", "darkMode"];
function q(e) {
  var n = e.children, o = e.variant, c = o === void 0 ? i.LightGray : o, d = e.className, g = e.darkMode, u = _(e, T), f = R(g).theme;
  return S.createElement("div", h({}, u, { className: Y(F, I[f][c], d) }), n);
}
q.displayName = "Badge";
export {
  q as N
};
