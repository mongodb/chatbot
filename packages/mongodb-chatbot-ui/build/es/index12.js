import u, { createContext as Z, useContext as $ } from "react";
import { y as w, m as l, N as p, an as ee, ap as ne, d as X, n as x, X as f, q as z, z as te, Y as h, F as re, aN as O, aO as k } from "./index2.js";
import { m as ie } from "./index4.js";
function ae(e) {
  var t = function(n, r) {
    if (typeof n != "object" || !n)
      return n;
    var i = n[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(n, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function N() {
  return N = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n)
        Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, N.apply(this, arguments);
}
function T(e, t) {
  if (e == null)
    return {};
  var n, r, i = function(g, b) {
    if (g == null)
      return {};
    var d, o, c = {}, m = Object.keys(g);
    for (o = 0; o < m.length; o++)
      d = m[o], b.indexOf(d) >= 0 || (c[d] = g[d]);
    return c;
  }(e, t);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      n = a[r], t.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (i[n] = e[n]);
  }
  return i;
}
function s(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var G, S, _, M, F, Y, C, D, H, L, q, R, W, A = Z({}), oe = w("input_option-content"), B = w("input_option-title"), le = w("input_option-description"), J = w("input_option-left-glyph"), se = function(e) {
  var t = e.hasLeftGlyph ? "left-glyph" : "text", n = e.hasRightGlyph ? "right-glyph" : "text";
  return l(G || (G = s([`
    display: grid;
    grid-template-columns: `, "px 1fr ", `px;
    grid-template-areas: '`, " text ", `';
    gap: `, `px;
    align-items: center;
    width: 100%;
  `])), p[400], p[400], t, n, p[200]);
}, de = function(e) {
  var t = e.theme, n = e.disabled, r = e.highlighted, i = n ? O.Disabled : O.Primary, a = r ? k.Focus : k.Default;
  return l(S || (S = s([`
    grid-area: left-glyph;
    display: flex;
    align-items: center;
    // Hover styles set by parent InputOption
    color: `, `;
    transition: color `, `ms ease-in-out;
  `])), h[t].icon[i][a], f.default);
}, ce = function(e) {
  var t = e.theme, n = e.disabled ? O.Disabled : O.Primary;
  return l(_ || (_ = s([`
    grid-area: right-glyph;
    display: flex;
    align-items: center;
    color: `, `;
    transition: color `, `ms ease-in-out;
  `])), h[t].icon[n].default, f.default);
}, he = l(M || (M = s([`
  grid-area: text;
  line-height: `, `px;
`])), p[400]), pe = function(e) {
  var t = e.theme, n = e.highlighted, r = e.disabled;
  return l(F || (F = s([`
  overflow-wrap: anywhere;
  font-size: inherit;
  line-height: inherit;
  font-weight: normal;
  transition: color `, `ms ease-in-out;

  `, `
`])), f.default, n && !r && l(Y || (Y = s([`
    font-weight: bold;
    color: `, `;
  `])), h[t].text.primary.focus));
}, ue = ["children", "description", "leftGlyph", "rightGlyph", "preserveIconSpace", "className"], ge = function(e) {
  var t = e.children, n = e.description, r = e.leftGlyph, i = e.rightGlyph, a = e.preserveIconSpace, g = a === void 0 || a, b = e.className, d = T(e, ue), o = $(A), c = o.disabled, m = o.highlighted, y = o.darkMode, v = X(y).theme;
  return u.createElement("div", N({ className: x(oe, se({ hasLeftGlyph: !!r || g, hasRightGlyph: !!i }), b) }, d), r && u.createElement("div", { className: x(J, de({ theme: v, disabled: c, highlighted: m })) }, r), u.createElement("div", { className: he }, u.createElement("div", { className: x(B, pe({ theme: v, highlighted: m, disabled: c })) }, t), n && u.createElement(ie, { className: x(le, l(C || (C = s([`
    max-height: `, `px;
    overflow: hidden;
    font-size: inherit;
    line-height: inherit;
    text-overflow: ellipsis;
    transition: color `, `ms ease-in-out;
  `])), p[1200], f.default)), darkMode: y, disabled: c }, n)), i && u.createElement("div", { className: ce({ theme: v, disabled: c }) }, i));
};
ge.displayName = "InputOptionContent";
var me = w("input_option"), fe = function(e) {
  var t = e.theme, n = e.disabled, r = e.highlighted, i = e.isInteractive, a = r ? k.Focus : k.Default;
  return l(D || (D = s([`
    display: block;
    position: relative;
    list-style: none;
    outline: none;
    border: unset;
    margin: 0;
    text-align: left;
    text-decoration: none;
    cursor: pointer;

    font-size: `, `px;
    line-height: `, `px;
    font-family: `, `;
    padding: `, "px ", `px;

    transition: `, `ms ease-in-out;
    transition-property: background-color, color;

    color: `, `;
    background-color: `, `;

    `, `

    /* Interactive states */
    `, `
  `])), z.body1.fontSize, z.body1.lineHeight, te.default, p[300], p[300], f.default, h[t].text.primary[a], h[t].background.primary[a], n && l(H || (H = s([`
      cursor: not-allowed;
      color: `, `;
    `])), h[t].text.disabled[a]), i && !n && l(L || (L = s([`
      /* Hover */
      &:hover {
        outline: none;
        color: `, `;
        background-color: `, `;

        .`, ` {
          color: `, `;
        }

        .`, ` {
          color: `, `;
        }
      }

      /* Focus (majority of styling handled by the 'highlighted' prop) */
      &:focus {
        outline: none;
        border: unset;
      }
    `])), h[t].text.primary.hover, h[t].background.primary.hover, B, h[t].text.primary.hover, J, h[t].icon.primary.hover));
}, be = p[100], ye = p[200], ve = function(e) {
  var t = e.disabled, n = e.highlighted;
  return l(q || (q = s([`
  // Left wedge
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: `, `px;
    height: calc(100% - `, `px);
    min-height: `, `px;
    background-color: rgba(255, 255, 255, 0);
    border-radius: 0 6px 6px 0;
    transform: scale3d(0, 0.3, 0) translateY(-50%);
    transform-origin: 0%; // 0% since we use translateY
    transition: `, `ms ease-in-out;
    transition-property: transform, background-color;

    `, `

    `, `
  }
`])), be, 2 * ye, p[600], f.default, n && l(R || (R = s([`
      transform: scaleY(1) translateY(-50%);
      background-color: `, `;
    `])), re.blue.base), t && l(W || (W = s([`
      content: unset;
    `]))));
}, xe = ["as", "children", "disabled", "highlighted", "checked", "darkMode", "showWedge", "isInteractive", "className"], we = ee(function(e, t) {
  var n, r, i, a = e.as, g = a === void 0 ? "li" : a, b = e.children, d = e.disabled, o = e.highlighted, c = e.checked, m = e.darkMode, y = e.showWedge, v = y === void 0 || y, j = e.isInteractive, I = j === void 0 || j, K = e.className, Q = T(e, xe), U = ne(g).Component, E = X(m), P = E.theme, V = E.darkMode;
  return u.createElement(A.Provider, { value: { checked: c, darkMode: V, disabled: d, highlighted: o } }, u.createElement(U, N({ ref: t, role: "option", "aria-selected": o, "aria-checked": c, "aria-disabled": d, tabIndex: -1, className: x(me, fe({ theme: P, disabled: d, highlighted: o, isInteractive: I }), (n = {}, r = ve({ theme: P, disabled: d, highlighted: o, isInteractive: I }), i = v, (r = ae(r)) in n ? Object.defineProperty(n, r, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : n[r] = i, n), K) }, Q), b));
});
we.displayName = "InputOption";
export {
  ge as K,
  we as e
};
