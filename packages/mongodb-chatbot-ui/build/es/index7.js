import k, { useRef as Ve, useEffect as Je } from "react";
import { X as Y, F as n, k as v, b as f, m as o, y as Ke, z as Qe, v as Q, B as C, q as B, V as X, W as Ze, a0 as nr, d as Ee, n as L, w as Pe } from "./index2.js";
import "./index8.js";
var R = Y.slower, D = function() {
  var r, i;
  if (typeof window < "u") {
    var l = { setRippleListener: !1, registeredRippleElements: /* @__PURE__ */ new WeakMap() };
    return (i = (r = window).__LEAFYGREEN_UTILS__) !== null && i !== void 0 || (r.__LEAFYGREEN_UTILS__ = { modules: {} }), window.__LEAFYGREEN_UTILS__.modules["@leafygreen-ui/ripple"] = l, window.__LEAFYGREEN_UTILS__.modules["@leafygreen-ui/ripple"];
  }
}();
function er(r) {
  D != null && D.registeredRippleElements.has(r.target) && function(i) {
    var l = i.target, d = D == null ? void 0 : D.registeredRippleElements.get(l);
    if (!(!l || !d)) {
      var u = d.backgroundColor, g = l.getBoundingClientRect(), s = document.createElement("span");
      s.className = "lg-ui-ripple", s.style.height = s.style.width = Math.max(g.width, g.height) + "px", l.appendChild(s);
      var h = i.pageY - g.top - s.offsetHeight / 2 - document.body.scrollTop, p = i.pageX - g.left - s.offsetWidth / 2 - document.body.scrollLeft;
      s.style.top = h + "px", s.style.left = p + "px", s.style.background = u, setTimeout(function() {
        s.remove();
      }, 750);
    }
  }(r);
}
function rr(r, i) {
  if (D) {
    if (D.registeredRippleElements.set(r, i), !D.setRippleListener) {
      document.addEventListener("click", er, { passive: !0 });
      var l = document.createElement("style");
      l.innerHTML = or, document.head.append(l), D.setRippleListener = !0;
    }
    return function() {
      D.registeredRippleElements.delete(r);
    };
  }
}
var or = `
  @-webkit-keyframes lg-ui-ripple {
    from {
      opacity:1;
    }
    to {
      transform: scale(2);
      transition: opacity `.concat(R, `ms;
      opacity: 0;
    }
  }

  @-moz-keyframes lg-ui-ripple {
    from {
      opacity:1;
    }
    to {
      transform: scale(2);
      transition: opacity `).concat(R, `ms;
      opacity: 0;
    }
  }

  @keyframes lg-ui-ripple {
    from {
      opacity:1;
    }
    to {
      transform: scale(2);
      transition: opacity `).concat(R, `ms;
      opacity: 0;
    }
  }

  .lg-ui-ripple {
    position: absolute;
    border-radius: 100%;
    transform: scale(0.2);
    opacity: 0;
    pointer-events: none;
    // Ensures that text is shown above ripple effect
    z-index: -1;
    -webkit-animation: lg-ui-ripple .75s ease-out;
    -moz-animation: lg-ui-ripple .75s ease-out;
    animation: lg-ui-ripple .75s ease-out;
  }

  @media (prefers-reduced-motion: reduce) {
    .lg-ui-ripple {
      animation: none;
      transform: none;
    }
  }
`);
function Z(r, i) {
  var l = Object.keys(r);
  if (Object.getOwnPropertySymbols) {
    var d = Object.getOwnPropertySymbols(r);
    i && (d = d.filter(function(u) {
      return Object.getOwnPropertyDescriptor(r, u).enumerable;
    })), l.push.apply(l, d);
  }
  return l;
}
function S(r) {
  for (var i = 1; i < arguments.length; i++) {
    var l = arguments[i] != null ? arguments[i] : {};
    i % 2 ? Z(Object(l), !0).forEach(function(d) {
      e(r, d, l[d]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(r, Object.getOwnPropertyDescriptors(l)) : Z(Object(l)).forEach(function(d) {
      Object.defineProperty(r, d, Object.getOwnPropertyDescriptor(l, d));
    });
  }
  return r;
}
function ar(r) {
  var i = function(l, d) {
    if (typeof l != "object" || !l)
      return l;
    var u = l[Symbol.toPrimitive];
    if (u !== void 0) {
      var g = u.call(l, d);
      if (typeof g != "object")
        return g;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(l);
  }(r, "string");
  return typeof i == "symbol" ? i : i + "";
}
function e(r, i, l) {
  return (i = ar(i)) in r ? Object.defineProperty(r, i, { value: l, enumerable: !0, configurable: !0, writable: !0 }) : r[i] = l, r;
}
function N() {
  return N = Object.assign ? Object.assign.bind() : function(r) {
    for (var i = 1; i < arguments.length; i++) {
      var l = arguments[i];
      for (var d in l)
        Object.prototype.hasOwnProperty.call(l, d) && (r[d] = l[d]);
    }
    return r;
  }, N.apply(this, arguments);
}
function tr(r, i) {
  if (r == null)
    return {};
  var l, d, u = function(s, h) {
    if (s == null)
      return {};
    var p, m, O = {}, E = Object.keys(s);
    for (m = 0; m < E.length; m++)
      p = E[m], h.indexOf(p) >= 0 || (O[p] = s[p]);
    return O;
  }(r, i);
  if (Object.getOwnPropertySymbols) {
    var g = Object.getOwnPropertySymbols(r);
    for (d = 0; d < g.length; d++)
      l = g[d], i.indexOf(l) >= 0 || Object.prototype.propertyIsEnumerable.call(r, l) && (u[l] = r[l]);
  }
  return u;
}
function a(r, i) {
  return i || (i = r.slice(0)), Object.freeze(Object.defineProperties(r, { raw: { value: Object.freeze(i) } }));
}
var nn, en, rn, on, an, tn, ln, dn, cn, sn, gn, un, pn, bn, hn, fn, mn, yn, kn, xn, wn, vn, On, Dn, En, Pn, Ln, zn, jn, Sn, Nn, Gn, _n, Bn, Mn, Tn, Fn, In, Rn, Cn, Xn, qn, Yn, An, t = { Default: "default", Primary: "primary", PrimaryOutline: "primaryOutline", Danger: "danger", DangerOutline: "dangerOutline", BaseGreen: "baseGreen" }, b = { XSmall: "xsmall", Small: "small", Default: "default", Large: "large" }, M = 0.76, lr = e(e({}, f.Light, e(e(e(e(e(e({}, t.Default, n.gray.light2), t.Primary, n.green.dark1), t.PrimaryOutline, v(M, n.green.base)), t.Danger, n.red.light1), t.DangerOutline, v(M, n.red.base)), t.BaseGreen, n.green.light1)), f.Dark, e(e(e(e(e(e({}, t.Default, n.gray.base), t.Primary, n.green.dark1), t.PrimaryOutline, v(M, n.green.base)), t.Danger, n.red.dark2), t.DangerOutline, v(M, n.red.light1)), t.BaseGreen, n.green.dark1)), ir = o(nn || (nn = a([`
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 5px;
`]))), dr = o(en || (en = a([`
  justify-content: space-between;
`]))), Le = o(rn || (rn = a([`
  display: grid;
  grid-auto-flow: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  position: relative;
  user-select: none;
  z-index: 0;
  transition: all `, ` ease-in-out;
`])), Y.default), ze = e(e(e(e({}, b.XSmall, o(on || (on = a([`
    padding: 0 7px; // 8px - 1px border
    gap: 6px;
  `])))), b.Small, o(an || (an = a([`
    padding: 0 11px; // 12px - 1px border
    gap: 6px;
  `])))), b.Default, o(tn || (tn = a([`
    padding: 0 11px; // 12px - 1px border
    gap: 6px;
  `])))), b.Large, o(ln || (ln = a([`
    padding: 0 15px; // 16px - 1px border
    gap: 8px;
  `])))), cr = o(dn || (dn = a([`
  position: absolute;
`]))), sr = o(cn || (cn = a([`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`]))), gr = e(e(e(e({}, b.XSmall, 16), b.Small, 16), b.Default, 16), b.Large, 20), ur = e(e({}, f.Dark, n.gray.light1), f.Light, n.gray.dark1), pr = o(sn || (sn = a([`
  visibility: hidden;
`]))), br = o(gn || (gn = a([`
  justify-self: right;
`]))), hr = o(un || (un = a([`
  justify-self: left;
`]))), je = Ke("button"), fr = e(e({}, f.Light, e(e(e(e(e(e({}, t.Default, o(pn || (pn = a([`
      color: `, `;
    `])), n.gray.base)), t.Primary, o(bn || (bn = a([`
      color: `, `;
    `])), n.green.light2)), t.PrimaryOutline, o(hn || (hn = a([`
      color: `, `;
    `])), n.green.dark2)), t.Danger, o(fn || (fn = a([`
      color: `, `;
    `])), n.red.light3)), t.DangerOutline, o(mn || (mn = a([`
      color: `, `;
    `])), n.red.light1)), t.BaseGreen, o(yn || (yn = a([`
      color: `, `;
    `])), n.green.dark2))), f.Dark, e(e(e(e(e(e({}, t.Default, o(kn || (kn = a([`
      color: `, `;
    `])), n.gray.light2)), t.Primary, o(xn || (xn = a([`
      color: `, `;
    `])), n.green.light2)), t.PrimaryOutline, o(wn || (wn = a([`
      color: `, `;
    `])), n.green.base)), t.Danger, o(vn || (vn = a([`
      color: `, `;
    `])), n.red.light2)), t.DangerOutline, o(On || (On = a([`
      color: `, `;
    `])), n.red.light1)), t.BaseGreen, o(Dn || (Dn = a([`
      color: `, `;
    `])), n.green.dark2))), mr = e(e({}, f.Light, e(e(e(e(e(e({}, t.Default, o(En || (En = a([`
      color: `, `;
    `])), n.black)), t.Primary, o(Pn || (Pn = a([`
      color: `, `;
    `])), n.white)), t.PrimaryOutline, o(Ln || (Ln = a([`
      color: `, `;
    `])), n.green.dark2)), t.Danger, o(zn || (zn = a([`
      color: `, `;
    `])), n.white)), t.DangerOutline, o(jn || (jn = a([`
      color: `, `;
    `])), n.red.base)), t.BaseGreen, o(Sn || (Sn = a([`
      color: `, `;
    `])), n.green.dark3))), f.Dark, e(e(e(e(e(e({}, t.Default, o(Nn || (Nn = a([`
      color: `, `;
    `])), n.white)), t.Primary, o(Gn || (Gn = a([`
      color: `, `;
    `])), n.white)), t.PrimaryOutline, o(_n || (_n = a([`
      color: `, `;
    `])), n.green.base)), t.Danger, o(Bn || (Bn = a([`
      color: `, `;
    `])), n.white)), t.DangerOutline, o(Mn || (Mn = a([`
      color: `, `;
    `])), n.red.light1)), t.BaseGreen, o(Tn || (Tn = a([`
      color: `, `;
    `])), n.green.dark3))), yr = o(Fn || (Fn = a([`
  .`, ` {
    &:hover,
    &:active {
      color: currentColor;
    }
  }
`])), je), kr = e(e(e(e({}, b.XSmall, o(In || (In = a([`
    height: 14px;
    width: 14px;
  `])))), b.Small, o(Rn || (Rn = a([`
    height: 16px;
    width: 16px;
  `])))), b.Default, o(Cn || (Cn = a([`
    height: 16px;
    width: 16px;
  `])))), b.Large, o(Xn || (Xn = a([`
    height: 20px;
    width: 20px;
  `])))), xr = e(e({}, f.Light, o(qn || (qn = a([`
    color: `, `;
  `])), n.gray.base)), f.Dark, o(Yn || (Yn = a([`
    color: `, `;
  `])), n.gray.dark1)), wr = o(An || (An = a([`
  color: `, `;
`])), n.gray.dark1);
function q(r) {
  var i = r.glyph, l = r.variant, d = r.size, u = r.darkMode, g = r.disabled, s = r.isIconOnlyButton, h = r.className, p = !s && { "aria-hidden": !0, role: "presentation" }, m = Pe(u), O = s ? mr : fr;
  return k.cloneElement(i, S({ className: L(O[m][l], kr[d], e(e(e({}, yr, s), xr[m], g), wr, g && s && u), h) }, p));
}
q.displayName = "ButtonIcon";
var Hn, Un, $n, Wn, Vn, Jn, Kn, Qn, Zn, ne, ee, re, oe, ae, te, le, ie, de, ce, se, ge, ue, pe, be, he, fe, me, ye, ke, xe, we, ve, Oe, De = function(r) {
  var i, l = r.leftGlyph, d = r.rightGlyph, u = r.className, g = r.children, s = r.variant, h = r.size, p = r.darkMode, m = { variant: s, size: h, darkMode: p, disabled: r.disabled, isIconOnlyButton: (i = (l || d) && !g) !== null && i !== void 0 && i };
  return k.createElement("div", { className: L(Le, ze[h], e({}, dr, !!d && p), u) }, l && k.createElement(q, N({ glyph: l, className: br }, m)), g, d && k.createElement(q, N({ glyph: d, className: hr }, m)));
}, vr = function(r) {
  var i, l = r.darkMode, d = r.disabled, u = r.variant, g = r.size, s = r.isLoading, h = r.loadingText, p = r.loadingIndicator, m = r.className, O = Ee(l), E = O.darkMode, z = O.theme, j = Ve(null);
  Je(function() {
    var G, F = lr[z][u];
    return j.current == null || d || (G = rr(j.current, { backgroundColor: F })), G;
  }, [j, u, E, d, z]);
  var T = p && k.cloneElement(p, S(S({}, p.props), {}, e({ className: L(e({}, sr, !h), (i = p.props) === null || i === void 0 ? void 0 : i.className), sizeOverride: gr[g], colorOverride: ur[z] }, "data-testid", "lg-button-spinner")));
  return s ? k.createElement(k.Fragment, null, k.createElement("div", { className: L(Le, ze[g], e({}, cr, !h)) }, T, h), !h && k.createElement(De, N({}, r, { className: L(pr, m) }))) : k.createElement(k.Fragment, null, k.createElement("div", { className: ir, ref: j }), k.createElement(De, r));
}, Se = "lg-button", Or = function() {
  return { root: arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Se };
}, c = '&:focus-visible, &[data-focus="true"]', x = '&:hover, &[data-hover="true"]', y = '&:active, &[data-active="true"]', w = function(r) {
  return `
    0 0 0 2px `.concat(r, `, 
    0 0 0 4px `).concat(n.blue.light1, `;
`);
}, Dr = o(Hn || (Hn = a([`
  // unset browser default
  appearance: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: stretch;
  transition: all `, `ms ease-in-out;
  position: relative;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  font-family: `, `;
  border-radius: 6px;

  `, ` {
    outline: none;
  }

  `, `,
  &:focus,
  &:hover {
    text-decoration: none;
  }
`])), Y.default, Qe.default, c, y), Er = e(e({}, f.Light, e(e(e(e(e(e({}, t.Default, o(Un || (Un = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      // needed to override any global button styles
      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        box-shadow: 0 0 0 3px `, `;
      }
    `])), n.gray.light3, n.gray.base, n.black, c, n.black, x, y, n.black, n.white, n.gray.light2)), t.Primary, o($n || ($n = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: #00593f; // Not quite dark3
        border-color: #00593f; // Not quite dark3
        box-shadow: 0 0 0 3px `, `;
      }
    `])), n.green.dark2, n.green.dark2, n.white, c, n.white, x, y, n.white, n.green.light2)), t.PrimaryOutline, o(Wn || (Wn = a([`
      background-color: transparent;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.green.dark2, n.green.dark2, c, n.green.dark2, x, y, n.green.dark2, v(0.96, n.green.base), n.green.light2)), t.Danger, o(Vn || (Vn = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: #c82222; // not quite dark1
        border-color: #c82222; // not quite dark1
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.red.base, n.red.base, n.white, c, n.white, x, y, n.white, n.red.light3)), t.DangerOutline, o(Jn || (Jn = a([`
      background-color: transparent;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        border-color: `, `;
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.red.light1, n.red.base, c, n.red.base, x, y, n.red.dark2, v(0.96, n.red.base), n.red.base, n.red.light3)), t.BaseGreen, o(Kn || (Kn = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.green.base, n.green.dark2, n.green.dark3, c, n.green.dark3, x, y, n.green.dark3, Q(0.96, n.green.base, n.green.dark3), n.green.light2))), f.Dark, e(e(e(e(e(e({}, t.Default, o(Qn || (Qn = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        background-color: `, `;
        border-color: `, `;
        color: `, `;
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.gray.dark2, n.gray.base, n.white, c, n.white, x, y, n.gray.dark1, n.gray.base, n.white, n.gray.dark2)), t.Primary, o(Zn || (Zn = a([`
      background-color: `, `;
      border: 1px solid `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: #00593f; // Off palette
        box-shadow: 0 0 0 3px `, `;
      }
    `])), n.green.dark2, n.green.base, n.white, c, n.white, x, y, n.white, n.green.dark3)), t.PrimaryOutline, o(ne || (ne = a([`
      background-color: transparent;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        border-color: `, `;
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.green.base, n.green.base, c, n.green.base, x, y, n.green.base, v(0.96, n.green.base), n.green.base, n.green.dark3)), t.Danger, o(ee || (ee = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        border-color: `, `;
        color: `, `;
        background-color: #c82222; // Off palette
        box-shadow: 0px 0px 0px 3px `, `; // yes, yellow
      }
    `])), n.red.base, n.red.light1, n.white, c, n.white, x, y, n.red.light1, n.white, n.yellow.dark3)), t.DangerOutline, o(re || (re = a([`
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        box-shadow: 0px 0px 0px 3px `, `; // yes, yellow
      }
    `])), n.red.light1, n.red.light1, c, n.red.light1, x, y, n.red.light1, v(0.96, n.red.base), n.yellow.dark3)), t.BaseGreen, o(oe || (oe = a([`
      background-color: `, `;
      border-color: `, `;
      color: `, `;

      `, ` {
        color: `, `;
      }

      `, `,
      `, ` {
        color: `, `;
        background-color: `, `;
        border-color: `, `;
        box-shadow: 0px 0px 0px 3px `, `;
      }
    `])), n.green.base, n.green.dark2, n.green.dark3, c, n.green.dark3, x, y, n.green.dark3, Q(0.96, n.green.base, n.green.light3), n.green.dark2, n.green.dark3))), Pr = e(e({}, f.Light, e(e(e(e(e(e({}, t.Default, o(ae || (ae = a([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), c, n.white, w(n.white))), t.Primary, o(te || (te = a([`
      `, ` {
        color: `, `;
        background-color: #00593f; // Not quite dark3
        box-shadow: `, `;
      }
    `])), c, n.white, w(n.white))), t.PrimaryOutline, o(le || (le = a([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), c, v(0.96, n.green.base), w(n.white))), t.Danger, o(ie || (ie = a([`
      `, ` {
        color: `, `;
        background-color: #c82222; // not quite dark1
        box-shadow: `, `;
      }
    `])), c, n.white, w(n.white))), t.DangerOutline, o(de || (de = a([`
      `, ` {
        color: `, `;
        box-shadow: `, `;
      }
    `])), c, n.red.dark2, w(n.white))), t.BaseGreen, o(ce || (ce = a([`
      `, ` {
        box-shadow: `, `;
      }
    `])), c, w(n.white)))), f.Dark, e(e(e(e(e(e({}, t.Default, o(se || (se = a([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), c, n.gray.dark1, w(n.black))), t.Primary, o(ge || (ge = a([`
      `, ` {
        background-color: #00593f; // Off palette
        box-shadow: `, `;
      }
    `])), c, w(n.black))), t.PrimaryOutline, o(ue || (ue = a([`
      `, ` {
        background-color: `, `;
        border-color: `, `;
        box-shadow: `, `;
      }
    `])), c, v(0.96, n.green.base), n.green.base, w(n.black))), t.Danger, o(pe || (pe = a([`
      `, ` {
        background-color: #c82222; // Off palette
        box-shadow: `, `;
      }
    `])), c, w(n.black))), t.DangerOutline, o(be || (be = a([`
      `, ` {
        background-color: `, `;
        border-color: `, `;
        box-shadow: `, `;
      }
    `])), c, v(0.96, n.red.base), n.red.light1, w(n.black))), t.BaseGreen, o(he || (he = a([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), c, n.green.base, w(n.black)))), Lr = e(e({}, f.Light, o(fe || (fe = a([`
    &,
    `, ", ", ` {
      background-color: `, `;
      border-color: `, `;
      color: `, `;
      box-shadow: none;
      cursor: not-allowed;
    }

    `, ` {
      color: `, `;
      box-shadow: `, `;
    }
  `])), x, y, n.gray.light2, n.gray.light1, n.gray.base, c, n.gray.base, w(n.white))), f.Dark, o(me || (me = a([`
    &,
    `, ", ", ` {
      background-color: `, `;
      border-color: `, `;
      color: `, `;
      box-shadow: none;
      cursor: not-allowed;
    }

    `, ` {
      color: `, `;
      box-shadow: `, `;
    }
  `])), x, y, n.gray.dark3, n.gray.dark2, n.gray.dark1, c, n.gray.dark1, w(n.black))), zr = e(e(e(e({}, b.XSmall, o(ye || (ye = a([`
    height: 22px;
    text-transform: uppercase;
    font-size: 12px;
    line-height: 1em;
    font-weight: `, `;
    letter-spacing: 0.4px;
  `])), C.bold)), b.Small, o(ke || (ke = a([`
    height: 28px;
  `])))), b.Default, o(xe || (xe = a([`
    height: 36px;
  `])))), b.Large, o(we || (we = a([`
    height: 48px;
    font-size: 18px;
    line-height: 24px;
  `])))), jr = e(e({}, X.Body1, o(ve || (ve = a([`
    font-size: `, `px;
    line-height: `, `px;
    font-weight: `, `;
  `])), B.body1.fontSize, B.body1.lineHeight, C.medium)), X.Body2, o(Oe || (Oe = a([`
    font-size: `, `px;
    line-height: `, `px;
    // Pixel pushing for optical alignment purposes
    transform: translateY(1px);
    font-weight: `, `;
  `])), B.body2.fontSize, B.body2.lineHeight, C.medium)), Sr = ["variant", "size", "darkMode", "data-lgid", "baseFontSize", "disabled", "onClick", "leftGlyph", "rightGlyph", "children", "className", "as", "type", "isLoading", "loadingIndicator", "loadingText"], Nr = Ze(function(r, i) {
  var l = r.variant, d = l === void 0 ? t.Default : l, u = r.size, g = u === void 0 ? b.Default : u, s = r.darkMode, h = r["data-lgid"], p = h === void 0 ? Se : h, m = r.baseFontSize, O = m === void 0 ? X.Body1 : m, E = r.disabled, z = E !== void 0 && E, j = r.onClick, T = r.leftGlyph, G = r.rightGlyph, F = r.children, Ne = r.className, Ge = r.as, _e = r.type, A = r.isLoading, H = A !== void 0 && A, Be = r.loadingIndicator, Me = r.loadingText, Te = tr(r, Sr), U = nr(Ge, Te, "button"), $ = U.Component, W = U.rest, V = Ee(s).darkMode, Fe = $ === "a", _ = !(z || H), Ie = Or(p), Re = function(P) {
    var J = P.variant, qe = P.size, Ye = P.darkMode, Ae = P.baseFontSize, K = P.disabled, I = Pe(Ye), He = Er[I][J], Ue = Pr[I][J], $e = zr[qe], We = jr[Ae];
    return L(Dr, He, We, $e, e({}, Ue, !K), e({}, Lr[I], K));
  }({ variant: d, size: g, darkMode: V, baseFontSize: O, disabled: !_ }), Ce = S(S({ "data-lgid": Ie.root, type: Fe ? void 0 : _e || "button", className: L(je, Re, Ne), ref: i, "aria-disabled": !_, onClick: _ ? j : function(P) {
    return P.preventDefault();
  } }, W), {}, { href: _ ? W.href : void 0 }), Xe = { rightGlyph: G, leftGlyph: T, darkMode: V, disabled: z, variant: d, size: g, isLoading: H, loadingIndicator: Be, loadingText: Me };
  return k.createElement($, Ce, k.createElement(vr, Xe, F));
});
Nr.displayName = "Button";
export {
  Nr as X,
  rr as o,
  b as v,
  t as w
};
