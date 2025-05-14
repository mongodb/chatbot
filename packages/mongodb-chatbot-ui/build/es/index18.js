import S, { forwardRef as Dn } from "react";
import { r as Pn, a as En, g as zn, m as s, F as n, b as R, V as K, z as Mn, d as Rn, n as J, B as Ln } from "./index2.js";
import { L as W, J as Fn, $ as Zn } from "./index4.js";
import { l as Bn } from "./X.js";
import { K as Vn } from "./index9.js";
import { W as Hn, p as Tn } from "./Warning.js";
var Wn = { exports: {} };
(function(t, c) {
  (function(a, b) {
    t.exports = b(S, Pn);
  })(En, function(a, b) {
    function p(e) {
      if (e && typeof e == "object" && "default" in e)
        return e;
      var r = /* @__PURE__ */ Object.create(null);
      return e && Object.keys(e).forEach(function(o) {
        if (o !== "default") {
          var l = Object.getOwnPropertyDescriptor(e, o);
          Object.defineProperty(r, o, l.get ? l : { enumerable: !0, get: function() {
            return e[o];
          } });
        }
      }), r.default = e, Object.freeze(r);
    }
    var g = p(a);
    function O(e) {
      var r = function(o, l) {
        if (typeof o != "object" || !o)
          return o;
        var v = o[Symbol.toPrimitive];
        if (v !== void 0) {
          var x = v.call(o, l);
          if (typeof x != "object")
            return x;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(o);
      }(e, "string");
      return typeof r == "symbol" ? r : r + "";
    }
    function f(e, r, o) {
      return (r = O(r)) in e ? Object.defineProperty(e, r, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = o, e;
    }
    function h() {
      return h = Object.assign ? Object.assign.bind() : function(e) {
        for (var r = 1; r < arguments.length; r++) {
          var o = arguments[r];
          for (var l in o)
            Object.prototype.hasOwnProperty.call(o, l) && (e[l] = o[l]);
        }
        return e;
      }, h.apply(this, arguments);
    }
    function j(e, r) {
      if (e == null)
        return {};
      var o, l, v = function(w, P) {
        if (w == null)
          return {};
        var m, y, E = {}, z = Object.keys(w);
        for (y = 0; y < z.length; y++)
          m = z[y], P.indexOf(m) >= 0 || (E[m] = w[m]);
        return E;
      }(e, r);
      if (Object.getOwnPropertySymbols) {
        var x = Object.getOwnPropertySymbols(e);
        for (l = 0; l < x.length; l++)
          o = x[l], r.indexOf(o) >= 0 || Object.prototype.propertyIsEnumerable.call(e, o) && (v[o] = e[o]);
      }
      return v;
    }
    function C(e, r) {
      return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
    }
    var I, $, N = { small: 14, default: 16, large: 20, xlarge: 24 }, M = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], k = function(e) {
      var r = e.className, o = e.size, l = o === void 0 ? 16 : o, v = e.title, x = e["aria-label"], w = e["aria-labelledby"], P = e.fill, m = e.role, y = m === void 0 ? "img" : m, E = j(e, M), z = b.css(I || (I = C([`
        color: `, `;
      `])), P), V = b.css($ || ($ = C([`
        flex-shrink: 0;
      `]))), H = function(T, G, D) {
        var L, F = D["aria-label"], Z = D["aria-labelledby"], B = D.title;
        switch (T) {
          case "img":
            return F || Z || B ? f(f(f({}, "aria-labelledby", Z), "aria-label", F), "title", B) : { "aria-label": (L = G, "".concat(L.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(y, "ImportantWithCircle", f(f({ title: v }, "aria-label", x), "aria-labelledby", w));
      return g.createElement("svg", h({ className: b.cx(f({}, z, P != null), V, r), height: typeof l == "number" ? l : N[l], width: typeof l == "number" ? l : N[l], role: y }, H, E, { viewBox: "0 0 16 16" }), g.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM7 4.5C7 3.94772 7.44772 3.5 8 3.5C8.55228 3.5 9 3.94772 9 4.5V8.5C9 9.05228 8.55228 9.5 8 9.5C7.44772 9.5 7 9.05228 7 8.5V4.5ZM9 11.5C9 12.0523 8.55228 12.5 8 12.5C7.44772 12.5 7 12.0523 7 11.5C7 10.9477 7.44772 10.5 8 10.5C8.55228 10.5 9 10.9477 9 11.5Z", fill: "currentColor" }));
    };
    return k.displayName = "ImportantWithCircle", k.isGlyph = !0, k;
  });
})(Wn);
var Gn = Wn.exports;
const An = /* @__PURE__ */ zn(Gn);
var $n = { exports: {} };
(function(t, c) {
  (function(a, b) {
    t.exports = b(S, Pn);
  })(En, function(a, b) {
    function p(e) {
      if (e && typeof e == "object" && "default" in e)
        return e;
      var r = /* @__PURE__ */ Object.create(null);
      return e && Object.keys(e).forEach(function(o) {
        if (o !== "default") {
          var l = Object.getOwnPropertyDescriptor(e, o);
          Object.defineProperty(r, o, l.get ? l : { enumerable: !0, get: function() {
            return e[o];
          } });
        }
      }), r.default = e, Object.freeze(r);
    }
    var g = p(a);
    function O(e) {
      var r = function(o, l) {
        if (typeof o != "object" || !o)
          return o;
        var v = o[Symbol.toPrimitive];
        if (v !== void 0) {
          var x = v.call(o, l);
          if (typeof x != "object")
            return x;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(o);
      }(e, "string");
      return typeof r == "symbol" ? r : r + "";
    }
    function f(e, r, o) {
      return (r = O(r)) in e ? Object.defineProperty(e, r, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = o, e;
    }
    function h() {
      return h = Object.assign ? Object.assign.bind() : function(e) {
        for (var r = 1; r < arguments.length; r++) {
          var o = arguments[r];
          for (var l in o)
            Object.prototype.hasOwnProperty.call(o, l) && (e[l] = o[l]);
        }
        return e;
      }, h.apply(this, arguments);
    }
    function j(e, r) {
      if (e == null)
        return {};
      var o, l, v = function(w, P) {
        if (w == null)
          return {};
        var m, y, E = {}, z = Object.keys(w);
        for (y = 0; y < z.length; y++)
          m = z[y], P.indexOf(m) >= 0 || (E[m] = w[m]);
        return E;
      }(e, r);
      if (Object.getOwnPropertySymbols) {
        var x = Object.getOwnPropertySymbols(e);
        for (l = 0; l < x.length; l++)
          o = x[l], r.indexOf(o) >= 0 || Object.prototype.propertyIsEnumerable.call(e, o) && (v[o] = e[o]);
      }
      return v;
    }
    function C(e, r) {
      return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
    }
    var I, $, N = { small: 14, default: 16, large: 20, xlarge: 24 }, M = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], k = function(e) {
      var r = e.className, o = e.size, l = o === void 0 ? 16 : o, v = e.title, x = e["aria-label"], w = e["aria-labelledby"], P = e.fill, m = e.role, y = m === void 0 ? "img" : m, E = j(e, M), z = b.css(I || (I = C([`
        color: `, `;
      `])), P), V = b.css($ || ($ = C([`
        flex-shrink: 0;
      `]))), H = function(T, G, D) {
        var L, F = D["aria-label"], Z = D["aria-labelledby"], B = D.title;
        switch (T) {
          case "img":
            return F || Z || B ? f(f(f({}, "aria-labelledby", Z), "aria-label", F), "title", B) : { "aria-label": (L = G, "".concat(L.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(y, "InfoWithCircle", f(f({ title: v }, "aria-label", x), "aria-labelledby", w));
      return g.createElement("svg", h({ className: b.cx(f({}, z, P != null), V, r), height: typeof l == "number" ? l : N[l], width: typeof l == "number" ? l : N[l], role: y }, H, E, { viewBox: "0 0 16 16" }), g.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM9 4C9 4.55228 8.55228 5 8 5C7.44772 5 7 4.55228 7 4C7 3.44772 7.44772 3 8 3C8.55228 3 9 3.44772 9 4ZM8 6C8.55228 6 9 6.44772 9 7V11H9.5C9.77614 11 10 11.2239 10 11.5C10 11.7761 9.77614 12 9.5 12H6.5C6.22386 12 6 11.7761 6 11.5C6 11.2239 6.22386 11 6.5 11H7V7H6.5C6.22386 7 6 6.77614 6 6.5C6 6.22386 6.22386 6 6.5 6H8Z", fill: "currentColor" }));
    };
    return k.displayName = "InfoWithCircle", k.isGlyph = !0, k;
  });
})($n);
var Jn = $n.exports;
const Kn = /* @__PURE__ */ zn(Jn);
function _n(t) {
  var c = function(a, b) {
    if (typeof a != "object" || !a)
      return a;
    var p = a[Symbol.toPrimitive];
    if (p !== void 0) {
      var g = p.call(a, b);
      if (typeof g != "object")
        return g;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(a);
  }(t, "string");
  return typeof c == "symbol" ? c : c + "";
}
function i(t, c, a) {
  return (c = _n(c)) in t ? Object.defineProperty(t, c, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : t[c] = a, t;
}
function A() {
  return A = Object.assign ? Object.assign.bind() : function(t) {
    for (var c = 1; c < arguments.length; c++) {
      var a = arguments[c];
      for (var b in a)
        Object.prototype.hasOwnProperty.call(a, b) && (t[b] = a[b]);
    }
    return t;
  }, A.apply(this, arguments);
}
function qn(t, c) {
  if (t == null)
    return {};
  var a, b, p = function(O, f) {
    if (O == null)
      return {};
    var h, j, C = {}, I = Object.keys(O);
    for (j = 0; j < I.length; j++)
      h = I[j], f.indexOf(h) >= 0 || (C[h] = O[h]);
    return C;
  }(t, c);
  if (Object.getOwnPropertySymbols) {
    var g = Object.getOwnPropertySymbols(t);
    for (b = 0; b < g.length; b++)
      a = g[b], c.indexOf(a) >= 0 || Object.prototype.propertyIsEnumerable.call(t, a) && (p[a] = t[a]);
  }
  return p;
}
function u(t, c) {
  return c || (c = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(c) } }));
}
var _, q, Q, U, X, Y, nn, en, rn, on, tn, ln, an, cn, sn, un, bn, dn, gn, fn, pn, hn, vn, xn, mn, yn, kn, wn, On, jn, Cn, In, d = { Info: "info", Warning: "warning", Danger: "danger", Success: "success" }, Qn = s(_ || (_ = u([`
  width: 24px;
  height: 24px;
  position: absolute;
  right: 8px; // Icon is 24px(it's 24px to include hover background), in figma its 16px(does not include the hover background) (24px - 16px)/2 = 4. The space between the icon and the banner is 12px from the right, 12px - 4px = 8px
  top: 8px;
  flex-shrink: 0;
  cursor: pointer;
`]))), Un = s(q || (q = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;
    box-shadow: 0 0 0 2px `, `,
      0 0 0 4px `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.blue.light2, n.blue.light2, n.blue.dark3, n.blue.light1, n.blue.dark2), Xn = s(Q || (Q = u([`
  color: `, `;
  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;
    box-shadow: 0 0 0 2px `, `,
      0 0 0 4px `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.yellow.light2, n.yellow.light2, n.yellow.dark3, n.blue.light1, n.yellow.dark2), Yn = s(U || (U = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;
    box-shadow: 0 0 0 2px `, ", 0 0 0 4px ", `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.red.light2, n.red.light2, n.red.dark3, n.blue.light1, n.red.dark2), ne = s(X || (X = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;
    box-shadow: 0 0 0 2px `, `,
      0 0 0 4px `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.green.light2, n.green.light2, n.green.dark3, n.blue.light1, n.green.dark2), ee = s(Y || (Y = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.blue.dark2, n.blue.dark2, n.blue.light2), re = s(nn || (nn = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.yellow.dark2, n.yellow.dark2, n.yellow.light2), oe = s(en || (en = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.red.dark2, n.red.dark2, n.red.light2), te = s(rn || (rn = u([`
  color: `, `;

  &:active,
  &:hover,
  &:focus-visible {
    color: `, `;

    &:before {
      background-color: `, `;
    }
  }
`])), n.green.dark2, n.green.dark2, n.green.light2), le = i(i({}, R.Dark, i(i(i(i({}, d.Info, Un), d.Warning, Xn), d.Danger, Yn), d.Success, ne)), R.Light, i(i(i(i({}, d.Info, ee), d.Warning, re), d.Danger, oe), d.Success, te)), ae = function(t) {
  var c = t.onClose, a = t.darkMode, b = t.theme, p = t.variant;
  return S.createElement(Vn, { className: J(Qn, le[b][p]), "aria-label": "Close Message", onClick: c, darkMode: a }, S.createElement(Bn, null));
}, ie = s(on || (on = u([`
  position: relative;
  flex-shrink: 0;
`]))), ce = s(tn || (tn = u([`
  // this margin is set to control text alignment with the base of the renderedImage
  margin-top: 3px;
  margin-bottom: 3px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`]))), se = i(i({}, K.Body1, s(ln || (ln = u([`
    top: 2px; // 18px(height in figma) - 16px(actual height of icon)
  `])))), K.Body2, s(an || (an = u([`
    top: 5.5px; // 21.5px(height in figma) - 16px(actual height of icon)
  `])))), ue = i(i({}, R.Dark, i(i(i(i({}, d.Info, s(cn || (cn = u([`
      color: `, `;
    `])), n.blue.light1)), d.Warning, s(sn || (sn = u([`
      color: `, `;
    `])), n.yellow.base)), d.Danger, s(un || (un = u([`
      color: `, `;
    `])), n.red.light1)), d.Success, s(bn || (bn = u([`
      color: `, `;
    `])), n.green.base))), R.Light, i(i(i(i({}, d.Info, s(dn || (dn = u([`
      color: `, `;
    `])), n.blue.base)), d.Warning, s(gn || (gn = u([`
      color: `, `;
    `])), n.yellow.dark2)), d.Danger, s(fn || (fn = u([`
      color: `, `;
    `])), n.red.base)), d.Success, s(pn || (pn = u([`
      color: `, `;
    `])), n.green.dark1))), be = i(i(i(i({}, d.Info, Kn), d.Warning, An), d.Danger, Hn), d.Success, Tn), de = function(t) {
  var c = t.image, a = t.baseFontSize, b = t.variant, p = t.theme, g = be[b];
  return c ? S.cloneElement(c, { className: ce }) : S.createElement(g, { className: J(ie, ue[p][b], se[a]) });
}, ge = s(hn || (hn = u([`
  position: relative;
  display: flex;
  padding: 10px 12px 10px 20px;
  border-width: 1px 1px 1px 0px;
  border-style: solid;
  border-radius: 12px;
  font-family: `, `;

  &:before {
    content: '';
    position: absolute;
    width: 13px;
    top: -1px;
    bottom: -1px;
    left: 0px;
    border-radius: 12px 0px 0px 12px;
  }
`])), Mn.default), fe = s(vn || (vn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 5px `, `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.blue.light2, n.blue.dark2, n.blue.dark3, W, n.blue.light3, n.blue.light2, n.blue.dark3, n.blue.light1, n.blue.light1), pe = s(xn || (xn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 5px `, `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.yellow.light2, n.yellow.dark2, n.yellow.dark3, W, n.yellow.light3, n.yellow.light2, n.yellow.dark3, n.blue.light1, n.yellow.dark2), he = s(mn || (mn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 5px `, `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.red.light2, n.red.dark2, n.red.dark3, W, n.red.light3, n.red.light2, n.red.dark3, n.blue.light1, n.red.base), ve = s(yn || (yn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 5px `, `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.green.light2, n.green.dark2, n.green.dark3, W, n.green.light3, n.green.light2, n.green.dark3, n.blue.light1, n.green.base), xe = s(kn || (kn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 3px `, ", 0 0 0 5px ", `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.blue.dark2, n.blue.light2, n.blue.light3, W, n.blue.dark3, n.blue.dark2, n.blue.light3, n.white, n.blue.light1, n.blue.base), me = s(wn || (wn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 3px `, ", 0 0 0 5px ", `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.yellow.dark2, n.yellow.light2, n.yellow.light3, W, n.yellow.dark3, n.yellow.dark2, n.yellow.light3, n.white, n.blue.light1, n.yellow.base), ye = s(On || (On = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 3px `, ", 0 0 0 5px ", `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.red.dark2, n.red.light2, n.red.light3, W, n.red.dark3, n.red.dark2, n.red.light3, n.white, n.blue.light1, n.red.base), ke = s(jn || (jn = u([`
  color: `, `;
  border-color: `, `;
  background-color: `, `;

  .`, `, a {
    color: `, `;

    &:hover {
      color: `, `;
    }

    &:focus-visible {
      box-shadow: 0 0 0 3px `, ", 0 0 0 5px ", `,
        0 0 0 7px `, `;
    }
  }

  &:before {
    background: linear-gradient(
      to left,
      transparent 6px,
      `, ` 6px
    );
  }
`])), n.green.dark2, n.green.light2, n.green.light3, W, n.green.dark3, n.green.dark2, n.green.light3, n.white, n.blue.light1, n.green.dark1), we = i(i({}, R.Dark, i(i(i(i({}, d.Info, fe), d.Warning, pe), d.Danger, he), d.Success, ve)), R.Light, i(i(i(i({}, d.Info, xe), d.Warning, me), d.Danger, ye), d.Success, ke)), Oe = function(t, c) {
  return s(Cn || (Cn = u([`
  align-self: center;
  flex-grow: 1;
  margin-left: `, `;
  margin-right: `, `;

  .`, `, a {
    font-size: inherit;
    line-height: inherit;
    font-weight: `, `;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
    border-radius: 4px;
    display: inline;

    &:hover,
    &:focus,
    &:focus-visible {
      outline: none;
      span {
        &::after {
          display: none;
        }
      }
    }

    &:focus-visible {
      position: relative;
    }
  }
`])), Sn(t, c).marginLeft, Sn(t, c).marginRight, W, Ln.bold);
}, Sn = function(t, c) {
  var a = { marginLeft: void 0, marginRight: void 0 };
  return t ? (a.marginLeft = "17px", a.marginRight = "4px", c && (a.marginRight = "".concat(28, "px"))) : (a.marginLeft = "13px", a.marginRight = "10px", c && (a.marginRight = "".concat(32, "px"))), a;
}, je = s(In || (In = u([`
  padding-right: 36px; // add space for the icon
`]))), Ce = ["variant", "dismissible", "onClose", "image", "children", "className", "darkMode", "baseFontSize"], Nn = Dn(function(t, c) {
  var a = t.variant, b = a === void 0 ? d.Info : a, p = t.dismissible, g = p !== void 0 && p, O = t.onClose, f = O === void 0 ? function() {
  } : O, h = t.image, j = t.children, C = t.className, I = t.darkMode, $ = t.baseFontSize, N = qn(t, Ce), M = Rn(I), k = M.theme, e = M.darkMode, r = Fn($);
  return S.createElement("div", A({ role: "alert", ref: c, className: J(ge, Zn[r], we[k][b], i({}, je, g), C) }, N), S.createElement(de, { image: h, theme: k, baseFontSize: r, variant: b }), S.createElement("div", { className: Oe(h != null, g) }, j), g && S.createElement(ae, { theme: k, baseFontSize: r, variant: b, onClose: f, darkMode: e }));
}), $e = Nn;
Nn.displayName = "Banner";
export {
  $e as R
};
