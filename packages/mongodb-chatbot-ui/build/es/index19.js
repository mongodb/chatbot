import l, { forwardRef as Le, useContext as an } from "react";
import { C as v, m as i, N as g, L as I, j as on, n as O, y as _e, z as re, B as J, X as sn, E as ae, F as W, b as A, d as Ce, q as z, Y as c, T as X, aN as q } from "./index2.js";
import { J as Te, H as ln, m as dn, w as cn, t as un } from "./index4.js";
import { U as pn } from "./index10.js";
var E = "lg-form_field", f = { root: E, contentEnd: "".concat(E, "-content_end"), description: "".concat(E, "-description"), errorMessage: "".concat(E, "-error_message"), feedback: "".concat(E, "-feedback"), input: "".concat(E, "-input"), label: "".concat(E, "-label"), optional: "".concat(E, "-optional"), successMessage: "".concat(E, "-success_message") }, ie = { error: "This input needs your attention", success: "Success" };
function oe(e, t) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    t && (r = r.filter(function(d) {
      return Object.getOwnPropertyDescriptor(e, d).enumerable;
    })), n.push.apply(n, r);
  }
  return n;
}
function B(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t] != null ? arguments[t] : {};
    t % 2 ? oe(Object(n), !0).forEach(function(r) {
      p(e, r, n[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : oe(Object(n)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(n, r));
    });
  }
  return e;
}
function fn(e) {
  var t = function(n, r) {
    if (typeof n != "object" || !n)
      return n;
    var d = n[Symbol.toPrimitive];
    if (d !== void 0) {
      var b = d.call(n, r);
      if (typeof b != "object")
        return b;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function p(e, t, n) {
  return (t = fn(t)) in e ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = n, e;
}
function S() {
  return S = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n)
        Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, S.apply(this, arguments);
}
function L(e, t) {
  if (e == null)
    return {};
  var n, r, d = function(a, s) {
    if (a == null)
      return {};
    var u, m, y = {}, h = Object.keys(a);
    for (m = 0; m < h.length; m++)
      u = h[m], s.indexOf(u) >= 0 || (y[u] = a[u]);
    return y;
  }(e, t);
  if (Object.getOwnPropertySymbols) {
    var b = Object.getOwnPropertySymbols(e);
    for (r = 0; r < b.length; r++)
      n = b[r], t.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (d[n] = e[n]);
  }
  return d;
}
function o(e, t) {
  return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
}
var se, le, de, ce, ue, pe, fe, be, me, ge, x = { None: "none", Error: "error", Valid: "valid" }, bn = { disabled: !1, size: v.Default, state: x.None }, Ve = l.createContext(bn), mn = function(e) {
  var t = e.value, n = e.children;
  return l.createElement(Ve.Provider, { value: t }, n);
}, gn = function() {
  return an(Ve);
}, Xe = function(e) {
  var t = e.baseFontSize, n = e.size;
  return n === v.XSmall || n === v.Small ? i(se || (se = o([`
      font-size: `, `px;
      line-height: `, `px;
    `])), z.body1.fontSize, z.body1.lineHeight) : n === v.Default ? i(le || (le = o([`
      font-size: `, `px;
      line-height: `, `px;
    `])), t, z.body1.lineHeight) : n === v.Large ? i(de || (de = o([`
      font-size: `, `px;
      line-height: `, `px;
    `])), z.large.fontSize, z.large.lineHeight) : void 0;
}, hn = function(e) {
  return e === x.Error ? q.Error : e === x.Valid ? q.Success : q.Primary;
}, vn = i(ce || (ce = o([`
  display: flex;
  flex-direction: column;
`]))), xn = i(ue || (ue = o([`
  margin-bottom: `, `px;
`])), g[100]), yn = i(pe || (pe = o([`
  display: flex;
  gap: `, `px;
`])), g[100]), wn = i(fe || (fe = o([`
  padding-top: `, `px;
`])), g[100]), En = i(be || (be = o([`
  opacity: 0;
`]))), On = i(me || (me = o([`
  display: flex;
  justify-content: center;
  align-items: center;
`]))), kn = function(e) {
  return i(ge || (ge = o([`
    height: `, `px;
  `])), e === v.Large ? z.large.lineHeight : z.body1.lineHeight);
}, zn = ["baseFontSize", "disabled", "errorMessage", "hideFeedback", "id", "size", "state", "successMessage"], qe = function(e) {
  var t = e.baseFontSize, n = e.disabled, r = e.errorMessage, d = e.hideFeedback, b = d !== void 0 && d, a = e.id, s = e.size, u = e.state, m = e.successMessage, y = L(e, zn), h = Ce().theme, N = Te(t), j = Xe({ baseFontSize: N, size: s }), w = u === x.Error, k = (w || u === x.Valid) && !n, D = k ? { glyph: w ? "Warning" : "Checkmark", fill: c[h].icon[hn(u)].default, title: w ? "Error" : "Valid" } : void 0;
  return l.createElement("div", S({ id: a, "data-lgid": f.feedback, "data-testid": f.feedback, className: O(yn, p(p({}, wn, k), En, b)), "aria-live": "polite", "aria-relevant": "all" }, y), k && l.createElement(l.Fragment, null, D && l.createElement("div", { className: O(On, kn(s)) }, l.createElement(pn, S({}, D, { "aria-hidden": !0 }))), w ? l.createElement(cn, { "data-lgid": f.errorMessage, "data-testid": f.errorMessage, className: j }, r) : l.createElement(un, { "data-lgid": f.successMessage, "data-testid": f.successMessage, className: j }, m)));
};
qe.displayName = "FormFieldFeedback";
var he, ve, xe, ye, we, Ee, Oe, ke, ze, Ne, je, Fe, Se, Pe, Me, De, Nn = ["label", "description", "state", "id", "disabled"], jn = ["label", "description", "children", "baseFontSize", "state", "size", "disabled", "errorMessage", "successMessage", "className", "darkMode", "optional", "id"], Fn = Le(function(e, t) {
  var n = e.label, r = e.description, d = e.children, b = e.baseFontSize, a = e.state, s = a === void 0 ? x.None : a, u = e.size, m = u === void 0 ? v.Default : u, y = e.disabled, h = y !== void 0 && y, N = e.errorMessage, j = N === void 0 ? ie.error : N, w = e.successMessage, k = w === void 0 ? ie.success : w, D = e.className, We = e.darkMode, Ae = e.optional, Be = e.id, U = L(e, jn), R = Te(b), T = Xe({ baseFontSize: R, size: m }), P = function(F) {
    var V, Y = F.label, Qe = F.description, G = F.state, K = F.id, Q = F.disabled, M = L(F, Nn), Z = I({ prefix: f.label }), $ = I({ prefix: f.description }), ee = I({ prefix: f.feedback }), Ze = I({ prefix: f.input }), ne = K ?? Ze, $e = G === x.Error, en = G !== x.None, te = Y ? Z : M["aria-labelledby"], nn = Y || te ? void 0 : M["aria-label"], tn = "".concat(Qe ? $ : "", " ").concat(en ? ee : "").trim(), rn = (V = M["aria-invalid"]) !== null && V !== void 0 ? V : $e;
    return { labelId: Z, descriptionId: $, feedbackId: ee, inputId: ne, inputProps: { id: ne, "aria-labelledby": te, "aria-describedby": tn, "aria-label": nn, "aria-disabled": Q, readOnly: M.readOnly ? M.readOnly : Q, "aria-invalid": rn } };
  }(B({ label: n, description: r, state: s, id: Be, disabled: h }, U)), Je = P.labelId, Ue = P.descriptionId, Re = P.feedbackId, Ye = P.inputId, Ge = P.inputProps, Ke = { baseFontSize: R, disabled: h, errorMessage: j, id: Re, size: m, state: s, successMessage: k };
  return l.createElement(on, { darkMode: We }, l.createElement(mn, { value: { disabled: h, size: m, state: s, inputProps: Ge, optional: Ae } }, l.createElement("div", S({ className: O(T, D), ref: t }, U), l.createElement("div", { className: O(vn, p({}, xn, !(!n && !r))) }, n && l.createElement(ln, { "data-testid": f.label, className: T, htmlFor: Ye, id: Je, disabled: h }, n), r && l.createElement(dn, { "data-testid": f.description, className: T, id: Ue, disabled: h }, r)), d, l.createElement(qe, Ke))));
});
Fn.displayName = "FormField";
var _ = _e("form-field-input"), C = _e("form-field-icon"), Ie = function(e) {
  return "0 0 0 100px ".concat(e, " inset");
}, Sn = i(he || (he = o([`
  display: flex;
  align-items: center;
  gap: `, `px;
  font-size: inherit;
  line-height: inherit;
  font-family: `, `;
  width: 100%;
  height: 36px;
  font-weight: `, `;
  border: 1px solid;
  z-index: 1;
  outline: none;
  border-radius: 6px;
  transition: `, `ms ease-in-out;
  transition-property: border-color, box-shadow;
  z-index: 0;

  & .`, ` {
    font-family: `, `;
    color: inherit;
    background-color: inherit;
    font-size: inherit;
    line-height: inherit;
    outline: none;
    border: none;
  }

  & .`, ` svg,
  & svg {
    min-height: 16px;
    min-width: 16px;
  }
`])), g[1], re.default, J.regular, sn.default, _, re.default, C), He = function(e) {
  return i(xe || (xe = o([`
  @supports selector(:has(a, b)) {
    &:focus-within:not(:has(.`, `:focus)) {
      `, `
    }
  }

  /* Fallback for when "has" is unsupported */
  @supports not selector(:has(a, b)) {
    &:focus-within {
      `, `
    }
  }
`])), C, e, e);
}, Pn = p(p({}, A.Light, He(`
     {
      box-shadow: `.concat(ae.light.input, `;
      border-color: `).concat(W.white, `;
    }
  `))), A.Dark, He(`
     {
      box-shadow: `.concat(ae.dark.input, `;
      border-color: `).concat(W.gray.dark4, `;
    }
  `))), H = "&:has(button.".concat(C, ")"), Mn = p(p(p(p({}, v.XSmall, i(ye || (ye = o([`
    height: 22px;
    padding-inline: `, `px;

    `, ` {
      padding-inline-end: `, `px;
    }
  `])), g[200], H, g[100])), v.Small, i(we || (we = o([`
    height: 28px;
    padding-inline: `, `px;

    `, ` {
      padding-inline-end: `, `px;
    }
  `])), g[200], H, g[100])), v.Default, i(Ee || (Ee = o([`
    height: 36px;
    padding-inline: `, `px;

    `, ` {
      padding-inline-end: `, `px;
    }
  `])), g[300], H, g[150])), v.Large, i(Oe || (Oe = o([`
    height: 48px;
    padding-inline: `, `px;

    `, ` {
      padding-inline-end: `, `px;
    }
  `])), g[300], H, g[200])), Dn = function(e) {
  var t = e.disabled, n = e.size, r = e.state, d = e.theme, b = e.className;
  return O(Sn, function(a) {
    var s = a === A.Dark ? W.gray.dark4 : c.light.background.primary.default;
    return i(ve || (ve = o([`
    color: `, `;
    background: `, `;
    border: 1px solid;

    & .`, ` {
      &:-webkit-autofill {
        color: `, `;
        background: `, `;
        -webkit-text-fill-color: `, `;
        box-shadow: `, `;
      }

      &::placeholder {
        font-weight: `, `;
        color: `, `;
      }
    }
  `])), c[a].text.primary.default, s, _, c[a].text.primary.default, s, c[a].text.primary.default, Ie(s), J.regular, c[a].text.placeholder.default);
  }(d), Mn[n], p(p({}, O(function(a) {
    var s = a.theme, u = a.state;
    return p(p(p({}, x.Error, i(ke || (ke = o([`
      border-color: `, `;

      &:hover,
      &:active {
        &:not(:focus) {
          box-shadow: `, `;
        }
      }
    `])), c[s].border.error.default, X[s].red)), x.None, i(ze || (ze = o([`
      border-color: `, `;

      &:hover,
      &:active {
        &:not(:focus) {
          box-shadow: `, `;
        }
      }
    `])), c[s].border.primary.default, X[s].gray)), x.Valid, i(Ne || (Ne = o([`
      border-color: `, `;

      &:hover,
      &:active {
        &:not(:focus) {
          box-shadow: `, `;
        }
      }
    `])), c[s].border.success.default, X[s].green))[u];
  }({ theme: d, state: r }), Pn[d]), !t), function(a) {
    return i(je || (je = o([`
    cursor: not-allowed;
    color: `, `;
    background-color: `, `;
    border-color: `, `;

    &:hover,
    &:active {
      &:not(:focus) {
        box-shadow: inherit;
      }
    }

    & .`, ` {
      cursor: not-allowed;
      pointer-events: none;
      color: `, `;

      &::placeholder {
        color: inherit;
      }

      &:-webkit-autofill {
        &,
        &:hover,
        &:focus {
          appearance: none;

          -webkit-text-fill-color: `, `;
          box-shadow: `, `;
        }

        &:hover:not(:focus) {
          box-shadow: inherit;
        }
      }
    }
  `])), c[a].text.disabled.default, c[a].background.disabled.default, c[a].border.disabled.default, _, c[a].text.disabled.default, c[a].text.disabled.hover, Ie(c[a].background.disabled.hover));
  }(d), t), b);
}, In = i(Fe || (Fe = o([`
  width: 100%;
`]))), Hn = function(e) {
  return O(_, e);
}, Ln = i(Se || (Se = o([`
  display: flex;
  align-items: center;
  gap: `, `px;
`])), g[100]), _n = function(e) {
  return i(Pe || (Pe = o([`
    color: `, `;

    font-size: 12px;
    line-height: 12px;
    font-style: italic;
    font-weight: `, `;
    display: flex;
    align-items: center;
    > p {
      margin: 0;
    }
  `])), c[e].text.secondary.default, J.regular);
}, Cn = function(e, t, n) {
  return O(C, function(r) {
    return i(Me || (Me = o([`
    color: `, `;
  `])), c[r].icon.secondary.default);
  }(e), p({}, function(r) {
    return i(De || (De = o([`
    color: `, `;

    &:active,
    &:hover {
      color: `, `;
    }

    &:focus {
      color: `, `;
    }
  `])), c[r].icon.disabled.default, c[r].icon.disabled.hover, c[r].icon.disabled.focus);
  }(e), t), n);
}, Tn = ["contentEnd", "className", "children"], Vn = Le(function(e, t) {
  var n = e.contentEnd, r = e.className, d = e.children, b = L(e, Tn), a = Ce().theme, s = gn(), u = s.disabled, m = s.size, y = s.state, h = s.inputProps, N = s.optional, j = l.cloneElement(d, B(B({}, h), {}, { className: Hn(d.props.className) })), w = y === x.None && !u && N, k = w || n;
  return l.createElement("div", S({}, b, { ref: t, className: Dn({ disabled: u, size: m ?? v.Default, state: y, theme: a, className: r }) }), l.createElement("div", { className: In }, j), k && l.createElement("div", { className: Ln }, w && l.createElement("div", { "data-lgid": f.optional, "data-testid": f.optional, className: _n(a) }, l.createElement("p", null, "Optional")), n && l.cloneElement(n, p(p({ className: Cn(a, u, n.props.className), disabled: u }, "data-lgid", f.contentEnd), "data-testid", f.contentEnd))));
});
Vn.displayName = "FormFieldInputWrapper";
export {
  Vn as A,
  x as K,
  ie as P,
  Fn as j,
  qe as s
};
