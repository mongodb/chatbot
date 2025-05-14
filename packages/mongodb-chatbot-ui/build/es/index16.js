import h, { forwardRef as Ce } from "react";
import { k as C, F as o, E as ke, m as l, b as k, X as Se, z as Ee, q as M, W as Le, a0 as Ne, d as x, n as w, y as Me, N as u, j as ze } from "./index2.js";
import { t as me } from "./index4.js";
import { U as Ge } from "./index10.js";
function De(e) {
  var r = function(n, a) {
    if (typeof n != "object" || !n)
      return n;
    var t = n[Symbol.toPrimitive];
    if (t !== void 0) {
      var i = t.call(n, a);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function j(e, r, n) {
  return (r = De(r)) in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
function $() {
  return $ = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var n = arguments[r];
      for (var a in n)
        Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]);
    }
    return e;
  }, $.apply(this, arguments);
}
function Ae(e, r) {
  if (e == null)
    return {};
  var n, a, t = function(b, s) {
    if (b == null)
      return {};
    var c, p, f = {}, y = Object.keys(b);
    for (p = 0; p < y.length; p++)
      c = y[p], s.indexOf(c) >= 0 || (f[c] = b[c]);
    return f;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (a = 0; a < i.length; a++)
      n = i[a], r.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (t[n] = e[n]);
  }
  return t;
}
function m(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
var z, G, D, A, B, U = "0 4px 10px -4px ".concat(C(0.7, o.black)), W = "0 4px 20px -4px ".concat(C(0.8, o.black)), R = ke.light.default, T = "0 4px 20px -4px #01121A", _ = "0 4px 20px -4px ".concat(C(0.3, "#000000")), q = ke.dark.default, F = j(j({}, k.Light, { containerStyle: l(z || (z = m([`
      border: 1px solid `, `;
      box-shadow: `, `;
      background-color: `, `;
      color: `, `;
    `])), o.gray.light2, U, o.white, o.gray.dark3), clickableStyle: l(G || (G = m([`
      cursor: pointer;

      &:focus {
        outline: none;
        box-shadow: `, ", ", `;
      }

      &:hover,
      &:active {
        border: 1px solid `, `;
        box-shadow: `, `;

        &:focus {
          box-shadow: `, ", ", `;
        }
      }
    `])), R, U, o.gray.light2, W, R, W) }), k.Dark, { containerStyle: l(D || (D = m([`
      border: 1px solid `, `;
      box-shadow: `, `;
      background-color: `, `;
      color: `, `;
    `])), o.gray.dark2, T, o.black, o.white), clickableStyle: l(A || (A = m([`
      cursor: pointer;

      &:focus {
        outline: none;
        box-shadow: `, ", ", `;
      }

      &:hover {
        box-shadow: `, `;

        &:focus {
          box-shadow: `, ", ", `;
        }
      }
    `])), T, q, _, _, q) }), Be = l(B || (B = m([`
  position: relative;
  transition: `, `ms ease-in-out;
  transition-property: border, box-shadow;
  border-radius: 24px;
  font-family: `, `;
  font-size: `, `px;
  line-height: `, `px;
  padding: 24px;
  min-height: 68px; // 48px + 20px (padding + line-height)
`])), Se.default, Ee.default, M.body1.fontSize, M.body1.lineHeight), I = { None: "none", Clickable: "clickable" }, Ue = ["as", "className", "contentStyle", "darkMode"], ve = Le(function(e, r) {
  var n = e.as, a = n === void 0 ? "div" : n, t = e.className, i = e.contentStyle, b = e.darkMode, s = Ae(e, Ue), c = Ne(a, s, "div").Component;
  i === void 0 && ("onClick" in s && s.onClick !== void 0 || "href" in s && s.href) && (i = I.Clickable);
  var p = x(b).theme;
  return h.createElement(c, $({ ref: r, className: w(Be, F[p].containerStyle, j({}, F[p].clickableStyle, i === I.Clickable), t) }, s));
});
ve.displayName = "Card";
function V(e, r) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    r && (a = a.filter(function(t) {
      return Object.getOwnPropertyDescriptor(e, t).enumerable;
    })), n.push.apply(n, a);
  }
  return n;
}
function O(e) {
  for (var r = 1; r < arguments.length; r++) {
    var n = arguments[r] != null ? arguments[r] : {};
    r % 2 ? V(Object(n), !0).forEach(function(a) {
      d(e, a, n[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : V(Object(n)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(n, a));
    });
  }
  return e;
}
function We(e) {
  var r = function(n, a) {
    if (typeof n != "object" || !n)
      return n;
    var t = n[Symbol.toPrimitive];
    if (t !== void 0) {
      var i = t.call(n, a);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function d(e, r, n) {
  return (r = We(r)) in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
function v() {
  return v = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var n = arguments[r];
      for (var a in n)
        Object.prototype.hasOwnProperty.call(n, a) && (e[a] = n[a]);
    }
    return e;
  }, v.apply(this, arguments);
}
function P(e, r) {
  if (e == null)
    return {};
  var n, a, t = function(b, s) {
    if (b == null)
      return {};
    var c, p, f = {}, y = Object.keys(b);
    for (p = 0; p < y.length; p++)
      c = y[p], s.indexOf(c) >= 0 || (f[c] = b[c]);
    return f;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(e);
    for (a = 0; a < i.length; a++)
      n = i[a], r.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (t[n] = e[n]);
  }
  return t;
}
function g(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
var X, H, J, K, Q, Y, Z, ee, ne, re, oe, ae, te, le, ie, ce, de, ge, S = Me("lg-chat-rich-link"), Re = l(X || (X = g([`
  box-shadow: none;
  padding: `, `px;
  border-radius: `, `px;
  text-decoration: none;
  min-height: `, `px;
  min-width: 100px;

  & .`, ` {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`])), u[200], u[200], u[900], S), Te = d(d({}, k.Dark, l(H || (H = g([`
    background-color: `, `;

    &:hover {
      box-shadow: 0 0 0 3px `, `;
    }
  `])), o.gray.dark4, o.gray.dark2)), k.Light, l(J || (J = g([`
    background-color: `, `;

    &:hover {
      box-shadow: 0 0 0 3px `, `;
    }
  `])), o.gray.light3, o.gray.light2)), _e = l(K || (K = g([`
  // Extra padding to make room for the absolutely positioned badge
  // We have to account for the badge as well as "fake padding" from the "bottom" and "left" attributes.
  // 1. "fake padding" below the badge (spacing[200])
  // 2. badge height (18)
  // 3. "fake padding" on top of the badge (spacing[200])
  padding-bottom: calc(`, "px + 18px + ", `px);
`])), u[200], u[200]), qe = function(e) {
  return l(Q || (Q = g([`
  background: linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)),
    url(`, `);
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  border-radius: `, `px;
  min-height: `, `px;

  & .`, ` {
    color: `, `;
  }
`])), e, u[200], u[900], S, o.white);
}, be = "gray", pe = "blue", ue = "green", se = "purple", fe = "red", he = "yellow", Fe = l(Y || (Y = g([`
  display: inline-flex;
  gap: `, `px;
  align-items: center;
  border-radius: `, `px;
  padding: 0px `, `px;
  position: absolute;
  bottom: `, `px;
  left: `, `px;
`])), u[150], u[100], u[150], u[200], u[200]), Ie = d(d({}, k.Dark, d(d(d(d(d(d({}, be, l(Z || (Z = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.gray.dark1, o.gray.light3, o.gray.light3)), pe, l(ee || (ee = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.blue.dark3, o.blue.light2, o.blue.light2)), ue, l(ne || (ne = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.green.dark3, o.green.light2, o.green.light2)), fe, l(re || (re = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.red.dark3, o.red.light2, o.red.light2)), se, l(oe || (oe = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.purple.dark3, o.purple.light2, o.purple.light2)), he, l(ae || (ae = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.yellow.dark3, o.yellow.light2, o.yellow.light2))), k.Light, d(d(d(d(d(d({}, be, l(te || (te = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.gray.light2, o.gray.dark1, o.black)), pe, l(le || (le = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.blue.light3, o.blue.dark2, o.blue.dark1)), ue, l(ie || (ie = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.green.light3, o.green.dark2, o.green.dark3)), fe, l(ce || (ce = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.red.light3, o.red.dark2, o.red.dark3)), se, l(de || (de = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.purple.light3, o.purple.dark2, o.purple.dark3)), he, l(ge || (ge = g([`
      background-color: `, `;
      & svg {
        color: `, `;
      }
      & p {
        color: `, `;
      }
    `])), o.yellow.light3, o.yellow.dark2, o.yellow.dark3))), Ve = function(e) {
  var r = e.darkMode, n = e.glyph, a = e.color, t = a === void 0 ? "gray" : a, i = e.label, b = x(r).theme;
  return h.createElement("div", { className: w(Fe, Ie[b][t]) }, n ? h.createElement(Ge, { glyph: n }) : null, h.createElement(me, null, i));
}, xe = { Article: { badgeColor: "green", badgeLabel: "Article", badgeGlyph: "Note" }, Blog: { badgeColor: "green", badgeLabel: "Blog", badgeGlyph: "SMS" }, Book: { badgeColor: "yellow", badgeLabel: "Book", badgeGlyph: "University" }, Code: { badgeColor: "gray", badgeLabel: "Code", badgeGlyph: "CodeBlock" }, Docs: { badgeColor: "blue", badgeLabel: "Docs", badgeGlyph: "Note" }, Learn: { badgeColor: "red", badgeLabel: "Learn", badgeGlyph: "Cap" }, Video: { badgeColor: "red", badgeLabel: "Video", badgeGlyph: "Play" }, Website: { badgeColor: "purple", badgeLabel: "Website", badgeGlyph: "Laptop" } }, Xe = Object.keys(xe);
function on(e) {
  return Xe.includes(e);
}
var ye, He = ["darkMode"], Je = ["children", "imageUrl", "badgeGlyph", "badgeLabel", "badgeColor", "href"], we = Ce(function(e, r) {
  var n, a = e.darkMode, t = P(e, He), i = x(a), b = i.darkMode, s = i.theme, c = O(O({ badgeGlyph: void 0, badgeLabel: void 0, badgeColor: void 0 }, "variant" in t && t.variant !== void 0 ? xe[t.variant] : {}), t), p = c.children, f = c.imageUrl, y = c.badgeGlyph, E = c.badgeLabel, Oe = c.badgeColor, L = c.href, je = P(c, Je), N = E !== void 0, $e = ((n = f == null ? void 0 : f.length) !== null && n !== void 0 ? n : -1) > 0, Pe = L ? O({ as: "a", href: L, ref: r, target: "_blank" }, je) : {};
  return h.createElement(ve, v({ darkMode: b, className: w(Re, Te[s], d(d({}, _e, N), qe(f ?? ""), $e)) }, Pe), h.createElement(me, { className: S, darkMode: b }, p), N ? h.createElement(Ve, { darkMode: b, color: Oe, label: E, glyph: y }) : null);
});
we.displayName = "RichLink";
var Ke = l(ye || (ye = g([`
  display: grid;
  gap: `, `px;
  grid-template-columns: repeat(2, 1fr);

  @container (min-width: 360px) {
    grid-template-columns: repeat(3, 1fr);
  }
`])), u[200]), Qe = ["links", "darkMode"];
function Ye(e) {
  var r = e.links, n = e.darkMode, a = P(e, Qe), t = x(n).darkMode;
  return h.createElement(ze, { darkMode: t }, h.createElement("div", v({ className: w(Ke) }, a), r.map(function(i) {
    return h.createElement(we, v({ key: i.href }, i));
  })));
}
Ye.displayName = "RichLinksArea";
export {
  on as e,
  Ye as i
};
