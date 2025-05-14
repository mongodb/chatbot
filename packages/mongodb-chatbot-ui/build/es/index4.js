import z, { useState as En, useEffect as Ln, useMemo as Fn } from "react";
import { r as ie, a as le, g as se, m as u, z as _, Y as P, q as F, V as I, b as C, an as q, B as Z, F as w, y as dn, E as de, W as ce, X as Pn, N as Mn, ao as Dn, d as T, ap as G, n as M, a0 as ue, aq as Bn } from "./index2.js";
var fn = { exports: {} };
(function(e, i) {
  (function(r, o) {
    e.exports = o(z, ie);
  })(le, function(r, o) {
    function s(n) {
      if (n && typeof n == "object" && "default" in n)
        return n;
      var a = /* @__PURE__ */ Object.create(null);
      return n && Object.keys(n).forEach(function(t) {
        if (t !== "default") {
          var l = Object.getOwnPropertyDescriptor(n, t);
          Object.defineProperty(a, t, l.get ? l : { enumerable: !0, get: function() {
            return n[t];
          } });
        }
      }), a.default = n, Object.freeze(a);
    }
    var f = s(r);
    function b(n) {
      var a = function(t, l) {
        if (typeof t != "object" || !t)
          return t;
        var v = t[Symbol.toPrimitive];
        if (v !== void 0) {
          var m = v.call(t, l);
          if (typeof m != "object")
            return m;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(t);
      }(n, "string");
      return typeof a == "symbol" ? a : a + "";
    }
    function c(n, a, t) {
      return (a = b(a)) in n ? Object.defineProperty(n, a, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[a] = t, n;
    }
    function p() {
      return p = Object.assign ? Object.assign.bind() : function(n) {
        for (var a = 1; a < arguments.length; a++) {
          var t = arguments[a];
          for (var l in t)
            Object.prototype.hasOwnProperty.call(t, l) && (n[l] = t[l]);
        }
        return n;
      }, p.apply(this, arguments);
    }
    function g(n, a) {
      if (n == null)
        return {};
      var t, l, v = function(S, N) {
        if (S == null)
          return {};
        var j, k, A = {}, H = Object.keys(S);
        for (k = 0; k < H.length; k++)
          j = H[k], N.indexOf(j) >= 0 || (A[j] = S[j]);
        return A;
      }(n, a);
      if (Object.getOwnPropertySymbols) {
        var m = Object.getOwnPropertySymbols(n);
        for (l = 0; l < m.length; l++)
          t = m[l], a.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(n, t) && (v[t] = n[t]);
      }
      return v;
    }
    function y(n, a) {
      return a || (a = n.slice(0)), Object.freeze(Object.defineProperties(n, { raw: { value: Object.freeze(a) } }));
    }
    var x, O, E = { small: 14, default: 16, large: 20, xlarge: 24 }, B = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], L = function(n) {
      var a = n.className, t = n.size, l = t === void 0 ? 16 : t, v = n.title, m = n["aria-label"], S = n["aria-labelledby"], N = n.fill, j = n.role, k = j === void 0 ? "img" : j, A = g(n, B), H = o.css(x || (x = y([`
        color: `, `;
      `])), N), $ = o.css(O || (O = y([`
        flex-shrink: 0;
      `]))), ee = function(ne, te, R) {
        var X, U = R["aria-label"], W = R["aria-labelledby"], Y = R.title;
        switch (ne) {
          case "img":
            return U || W || Y ? c(c(c({}, "aria-labelledby", W), "aria-label", U), "title", Y) : { "aria-label": (X = te, "".concat(X.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(k, "ArrowLeft", c(c({ title: v }, "aria-label", m), "aria-labelledby", S));
      return f.createElement("svg", p({ className: o.cx(c({}, H, N != null), $, a), height: typeof l == "number" ? l : E[l], width: typeof l == "number" ? l : E[l], role: k }, ee, A, { viewBox: "0 0 16 16" }), f.createElement("path", { d: "M13 6.83212L6.05559 6.83212L7.59059 5.29711C7.98112 4.90659 7.98112 4.27342 7.59059 3.8829L7.35168 3.64398C6.96115 3.25346 6.32799 3.25345 5.93746 3.64398L2.55483 7.02661C2.5456 7.03518 2.5365 7.04395 2.52752 7.05292L2.2886 7.29184C1.89808 7.68237 1.89808 8.31553 2.2886 8.70605L5.93975 12.3572C6.33028 12.7477 6.96344 12.7477 7.35397 12.3572L7.59288 12.1183C7.98341 11.7278 7.98341 11.0946 7.59288 10.7041L6.0588 9.17L13 9.17C13.5523 9.17 14 8.72228 14 8.17V7.83212C14 7.27983 13.5523 6.83212 13 6.83212Z", fill: "currentColor" }));
    };
    return L.displayName = "ArrowLeft", L.isGlyph = !0, L;
  });
})(fn);
var An = fn.exports;
const Hn = /* @__PURE__ */ se(An);
var bn = { exports: {} };
(function(e, i) {
  (function(r, o) {
    e.exports = o(z, ie);
  })(le, function(r, o) {
    function s(n) {
      if (n && typeof n == "object" && "default" in n)
        return n;
      var a = /* @__PURE__ */ Object.create(null);
      return n && Object.keys(n).forEach(function(t) {
        if (t !== "default") {
          var l = Object.getOwnPropertyDescriptor(n, t);
          Object.defineProperty(a, t, l.get ? l : { enumerable: !0, get: function() {
            return n[t];
          } });
        }
      }), a.default = n, Object.freeze(a);
    }
    var f = s(r);
    function b(n) {
      var a = function(t, l) {
        if (typeof t != "object" || !t)
          return t;
        var v = t[Symbol.toPrimitive];
        if (v !== void 0) {
          var m = v.call(t, l);
          if (typeof m != "object")
            return m;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(t);
      }(n, "string");
      return typeof a == "symbol" ? a : a + "";
    }
    function c(n, a, t) {
      return (a = b(a)) in n ? Object.defineProperty(n, a, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[a] = t, n;
    }
    function p() {
      return p = Object.assign ? Object.assign.bind() : function(n) {
        for (var a = 1; a < arguments.length; a++) {
          var t = arguments[a];
          for (var l in t)
            Object.prototype.hasOwnProperty.call(t, l) && (n[l] = t[l]);
        }
        return n;
      }, p.apply(this, arguments);
    }
    function g(n, a) {
      if (n == null)
        return {};
      var t, l, v = function(S, N) {
        if (S == null)
          return {};
        var j, k, A = {}, H = Object.keys(S);
        for (k = 0; k < H.length; k++)
          j = H[k], N.indexOf(j) >= 0 || (A[j] = S[j]);
        return A;
      }(n, a);
      if (Object.getOwnPropertySymbols) {
        var m = Object.getOwnPropertySymbols(n);
        for (l = 0; l < m.length; l++)
          t = m[l], a.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(n, t) && (v[t] = n[t]);
      }
      return v;
    }
    function y(n, a) {
      return a || (a = n.slice(0)), Object.freeze(Object.defineProperties(n, { raw: { value: Object.freeze(a) } }));
    }
    var x, O, E = { small: 14, default: 16, large: 20, xlarge: 24 }, B = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], L = function(n) {
      var a = n.className, t = n.size, l = t === void 0 ? 16 : t, v = n.title, m = n["aria-label"], S = n["aria-labelledby"], N = n.fill, j = n.role, k = j === void 0 ? "img" : j, A = g(n, B), H = o.css(x || (x = y([`
        color: `, `;
      `])), N), $ = o.css(O || (O = y([`
        flex-shrink: 0;
      `]))), ee = function(ne, te, R) {
        var X, U = R["aria-label"], W = R["aria-labelledby"], Y = R.title;
        switch (ne) {
          case "img":
            return U || W || Y ? c(c(c({}, "aria-labelledby", W), "aria-label", U), "title", Y) : { "aria-label": (X = te, "".concat(X.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(k, "ArrowRight", c(c({ title: v }, "aria-label", m), "aria-labelledby", S));
      return f.createElement("svg", p({ className: o.cx(c({}, H, N != null), $, a), height: typeof l == "number" ? l : E[l], width: typeof l == "number" ? l : E[l], role: k }, ee, A, { viewBox: "0 0 16 16" }), f.createElement("path", { d: "M3 6.83212L9.94442 6.83212L8.40941 5.29711C8.01888 4.90659 8.01889 4.27342 8.40941 3.8829L8.64833 3.64398C9.03885 3.25346 9.67201 3.25345 10.0625 3.64398L13.4452 7.02661C13.4544 7.03518 13.4635 7.04395 13.4725 7.05292L13.7114 7.29184C14.1019 7.68237 14.1019 8.31553 13.7114 8.70605L10.0602 12.3572C9.66972 12.7477 9.03656 12.7477 8.64603 12.3572L8.40712 12.1183C8.01659 11.7278 8.01659 11.0946 8.40712 10.7041L9.9412 9.17L3 9.17C2.44771 9.17 2 8.72228 2 8.17L2 7.83212C2 7.27983 2.44772 6.83212 3 6.83212Z", fill: "currentColor" }));
    };
    return L.displayName = "ArrowRight", L.isGlyph = !0, L;
  });
})(bn);
var In = bn.exports;
const Tn = /* @__PURE__ */ se(In);
var pn = { exports: {} };
(function(e, i) {
  (function(r, o) {
    e.exports = o(z, ie);
  })(le, function(r, o) {
    function s(n) {
      if (n && typeof n == "object" && "default" in n)
        return n;
      var a = /* @__PURE__ */ Object.create(null);
      return n && Object.keys(n).forEach(function(t) {
        if (t !== "default") {
          var l = Object.getOwnPropertyDescriptor(n, t);
          Object.defineProperty(a, t, l.get ? l : { enumerable: !0, get: function() {
            return n[t];
          } });
        }
      }), a.default = n, Object.freeze(a);
    }
    var f = s(r);
    function b(n) {
      var a = function(t, l) {
        if (typeof t != "object" || !t)
          return t;
        var v = t[Symbol.toPrimitive];
        if (v !== void 0) {
          var m = v.call(t, l);
          if (typeof m != "object")
            return m;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(t);
      }(n, "string");
      return typeof a == "symbol" ? a : a + "";
    }
    function c(n, a, t) {
      return (a = b(a)) in n ? Object.defineProperty(n, a, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : n[a] = t, n;
    }
    function p() {
      return p = Object.assign ? Object.assign.bind() : function(n) {
        for (var a = 1; a < arguments.length; a++) {
          var t = arguments[a];
          for (var l in t)
            Object.prototype.hasOwnProperty.call(t, l) && (n[l] = t[l]);
        }
        return n;
      }, p.apply(this, arguments);
    }
    function g(n, a) {
      if (n == null)
        return {};
      var t, l, v = function(S, N) {
        if (S == null)
          return {};
        var j, k, A = {}, H = Object.keys(S);
        for (k = 0; k < H.length; k++)
          j = H[k], N.indexOf(j) >= 0 || (A[j] = S[j]);
        return A;
      }(n, a);
      if (Object.getOwnPropertySymbols) {
        var m = Object.getOwnPropertySymbols(n);
        for (l = 0; l < m.length; l++)
          t = m[l], a.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(n, t) && (v[t] = n[t]);
      }
      return v;
    }
    function y(n, a) {
      return a || (a = n.slice(0)), Object.freeze(Object.defineProperties(n, { raw: { value: Object.freeze(a) } }));
    }
    var x, O, E = { small: 14, default: 16, large: 20, xlarge: 24 }, B = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], L = function(n) {
      var a = n.className, t = n.size, l = t === void 0 ? 16 : t, v = n.title, m = n["aria-label"], S = n["aria-labelledby"], N = n.fill, j = n.role, k = j === void 0 ? "img" : j, A = g(n, B), H = o.css(x || (x = y([`
        color: `, `;
      `])), N), $ = o.css(O || (O = y([`
        flex-shrink: 0;
      `]))), ee = function(ne, te, R) {
        var X, U = R["aria-label"], W = R["aria-labelledby"], Y = R.title;
        switch (ne) {
          case "img":
            return U || W || Y ? c(c(c({}, "aria-labelledby", W), "aria-label", U), "title", Y) : { "aria-label": (X = te, "".concat(X.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(k, "OpenNewTab", c(c({ title: v }, "aria-label", m), "aria-labelledby", S));
      return f.createElement("svg", p({ className: o.cx(c({}, H, N != null), $, a), height: typeof l == "number" ? l : E[l], width: typeof l == "number" ? l : E[l], role: k }, ee, A, { viewBox: "0 0 16 16" }), f.createElement("path", { d: "M13.823 2.4491C13.8201 2.30008 13.6999 2.17994 13.5509 2.17704L9.5062 2.09836C9.25654 2.09351 9.12821 2.39519 9.30482 2.5718L10.3856 3.65257L7.93433 6.10383C7.87964 6.15852 7.83047 6.21665 7.78683 6.27752L5.99909 8.06525C5.46457 8.59977 5.46457 9.4664 5.99909 10.0009C6.53361 10.5354 7.40023 10.5354 7.93475 10.0009L9.72249 8.21317C9.78336 8.16953 9.84148 8.12037 9.89618 8.06567L12.3474 5.61441L13.4282 6.69518C13.6048 6.87179 13.9065 6.74347 13.9016 6.4938L13.823 2.4491Z", fill: "currentColor" }), f.createElement("path", { d: "M7.25 3.12893C7.66421 3.12893 8 3.46472 8 3.87893C8 4.29315 7.66421 4.62893 7.25 4.62893H4C3.72386 4.62893 3.5 4.85279 3.5 5.12893V11.9929C3.5 12.2691 3.72386 12.4929 4 12.4929H10.864C11.1401 12.4929 11.364 12.2691 11.364 11.9929V8.75C11.364 8.33579 11.6998 8 12.114 8C12.5282 8 12.864 8.33579 12.864 8.75V11.9929C12.864 13.0975 11.9686 13.9929 10.864 13.9929H4C2.89543 13.9929 2 13.0975 2 11.9929V5.12893C2 4.02436 2.89543 3.12893 4 3.12893H7.25Z", fill: "currentColor" }));
    };
    return L.displayName = "OpenNewTab", L.isGlyph = !0, L;
  });
})(pn);
var Vn = pn.exports;
const Zn = /* @__PURE__ */ se(Vn);
function Rn(e) {
  var i = function(r, o) {
    if (typeof r != "object" || !r)
      return r;
    var s = r[Symbol.toPrimitive];
    if (s !== void 0) {
      var f = s.call(r, o);
      if (typeof f != "object")
        return f;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(r);
  }(e, "string");
  return typeof i == "symbol" ? i : i + "";
}
function oe(e) {
  return oe = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(i) {
    return typeof i;
  } : function(i) {
    return i && typeof Symbol == "function" && i.constructor === Symbol && i !== Symbol.prototype ? "symbol" : typeof i;
  }, oe(e);
}
function h(e, i, r) {
  return (i = Rn(i)) in e ? Object.defineProperty(e, i, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[i] = r, e;
}
function D() {
  return D = Object.assign ? Object.assign.bind() : function(e) {
    for (var i = 1; i < arguments.length; i++) {
      var r = arguments[i];
      for (var o in r)
        Object.prototype.hasOwnProperty.call(r, o) && (e[o] = r[o]);
    }
    return e;
  }, D.apply(this, arguments);
}
function V(e, i) {
  if (e == null)
    return {};
  var r, o, s = function(b, c) {
    if (b == null)
      return {};
    var p, g, y = {}, x = Object.keys(b);
    for (g = 0; g < x.length; g++)
      p = x[g], c.indexOf(p) >= 0 || (y[p] = b[p]);
    return y;
  }(e, i);
  if (Object.getOwnPropertySymbols) {
    var f = Object.getOwnPropertySymbols(e);
    for (o = 0; o < f.length; o++)
      r = f[o], i.indexOf(r) >= 0 || Object.prototype.propertyIsEnumerable.call(e, r) && (s[r] = e[r]);
  }
  return s;
}
function d(e, i) {
  return i || (i = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(i) } }));
}
function _n(e, i) {
  return function(r) {
    if (Array.isArray(r))
      return r;
  }(e) || function(r, o) {
    var s = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
    if (s != null) {
      var f, b, c, p, g = [], y = !0, x = !1;
      try {
        if (c = (s = s.call(r)).next, o !== 0)
          for (; !(y = (f = c.call(s)).done) && (g.push(f.value), g.length !== o); y = !0)
            ;
      } catch (O) {
        x = !0, b = O;
      } finally {
        try {
          if (!y && s.return != null && (p = s.return(), Object(p) !== p))
            return;
        } finally {
          if (x)
            throw b;
        }
      }
      return g;
    }
  }(e, i) || function(r, o) {
    if (r) {
      if (typeof r == "string")
        return fe(r, o);
      var s = Object.prototype.toString.call(r).slice(8, -1);
      if (s === "Object" && r.constructor && (s = r.constructor.name), s === "Map" || s === "Set")
        return Array.from(r);
      if (s === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(s))
        return fe(r, o);
    }
  }(e, i) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function fe(e, i) {
  i > e.length && (i = e.length);
  for (var r = 0, o = new Array(i); r < i; r++)
    o[r] = e[r];
  return o;
}
var be, pe, me, ge, he, ye, ve, xe, J = u(be || (be = d([`
  margin: unset;
  font-family: `, `;
  color: `, `;
`])), _.default, P.light.text.primary.default), mn = h(h({}, I.Body1, u(pe || (pe = d([`
    font-size: `, `px;
    line-height: `, `px;
  `])), F.body1.fontSize, F.body1.lineHeight)), I.Body2, u(me || (me = d([`
    font-size: `, `px;
    line-height: `, `px;
  `])), F.body2.fontSize, F.body2.lineHeight)), qn = h(h({}, I.Body1, u(ge || (ge = d([`
    font-size: `, `px;
    line-height: `, `px;
  `])), F.code1.fontSize, F.code1.lineHeight)), I.Body2, u(he || (he = d([`
    font-size: `, `px;
    line-height: `, `px;
  `])), F.code2.fontSize, F.code2.lineHeight)), ae = h(h({}, C.Light, u(ye || (ye = d([`
    color: `, `;
  `])), P.light.text.primary.default)), C.Dark, u(ve || (ve = d([`
    color: `, `;
  `])), P.dark.text.primary.default)), K = function(e) {
  var i = Dn();
  return e ? e === 16 ? I.Body2 : I.Body1 : i === 16 ? I.Body2 : I.Body1;
}, Gn = ["baseFontSize", "darkMode", "className", "weight", "as"], gn = q(function(e) {
  var i = e.baseFontSize, r = e.darkMode, o = e.className, s = e.weight, f = s === void 0 ? "regular" : s, b = e.as, c = b === void 0 ? "p" : b, p = V(e, Gn), g = T(r).theme, y = K(i), x = G(c).Component, O = u(xe || (xe = d([`
      font-weight: `, `;
      strong,
      b {
        font-weight: `, `;
      }
    `])), Z[f], Z.bold);
  return z.createElement(x, D({ className: M(J, mn[y], ae[g], O, o) }, p));
});
gn.displayName = "Body";
var we, Oe, je, ke, At = gn, hn = { label: "lg-label", description: "lg-description" }, Xn = function(e) {
  return u(we || (we = d([`
    color: `, `;

    font-family: `, `;
    font-weight: `, `;
    margin-top: 0;
    margin-bottom: 0;
  `])), P[e].text.secondary.default, _.default, Z.regular);
}, Un = function(e) {
  return u(Oe || (Oe = d([`
    color: `, `;
  `])), P[e].text.disabled.default);
}, Wn = h(h({}, I.Body1, u(je || (je = d([`
    font-size: `, `px;
    line-height: `, `px;
  `])), F.body1.fontSize, F.body1.lineHeight)), I.Body2, u(ke || (ke = d([`
    font-size: `, `px;
    line-height: 20px; // Hardcoding because it does not match body2 lineHeight
  `])), F.body2.fontSize)), Yn = ["as", "baseFontSize", "children", "className", "darkMode", "data-lgid", "disabled"], yn = q(function(e) {
  var i = e.as, r = e.baseFontSize, o = e.children, s = e.className, f = e.darkMode, b = e["data-lgid"], c = b === void 0 ? hn.description : b, p = e.disabled, g = p !== void 0 && p, y = V(e, Yn), x = T(f).theme, O = K(r), E = ["string", "number"].includes(oe(o)) ? "p" : "div", B = G(i ?? E).Component;
  return z.createElement(B, D({ "data-lgid": c, className: M(Xn(x), Wn[O], h({}, Un(x), g), s) }, y), o);
});
yn.displayName = "Description";
var Ne, ze, Ce, Se, Ht = yn, Jn = h(h({}, C.Light, u(Ne || (Ne = d([`
    color: `, `;
  `])), P.light.text.secondary.default)), C.Dark, u(ze || (ze = d([`
    color: `, `;
  `])), P.dark.text.secondary.default)), Kn = u(Ce || (Ce = d([`
  display: block;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.2px;
`]))), Qn = ["darkMode", "children", "className"];
function $n(e) {
  var i = e.darkMode, r = e.children, o = e.className, s = V(e, Qn), f = T(i).theme;
  return z.createElement("small", D({}, s, { className: M(J, Kn, Jn[f], o) }), r);
}
$n.displayName = "Disclaimer";
var Ee, Le, Fe, et = function(e) {
  var i = e.theme, r = e.baseFontSize, o = r === I.Body1 ? F.body1.fontSize : F.body2.fontSize, s = r === I.Body1 ? F.body1.lineHeight : 20;
  return u(Se || (Se = d([`
    font-family: `, `;
    font-weight: `, `;
    font-size: inherit;
    line-height: inherit;

    /* Unsets browser defaults */
    margin-block-start: 0;
    margin-block-end: 0;

    /* Variable Styles */
    color: `, `;
    font-size: `, `px;
    line-height: `, `px;
  `])), _.default, Z.regular, P[i].text.error.default, o, s);
}, nt = ["as", "darkMode", "children", "className"], It = q(function(e) {
  var i = e.as, r = i === void 0 ? "p" : i, o = e.darkMode, s = e.children, f = e.className, b = V(e, nt), c = T(o).theme, p = K(), g = G(r).Component;
  return z.createElement(g, D({}, b, { className: M(et({ theme: c, baseFontSize: p }), f) }), s);
}), tt = u(Ee || (Ee = d([`
  font-weight: `, `;
  font-size: 48px;
  line-height: 64px;
  font-family: `, `;
`])), Z.regular, _.serif), rt = h(h({}, C.Light, u(Le || (Le = d([`
    color: `, `;
  `])), w.green.dark2)), C.Dark, u(Fe || (Fe = d([`
    color: `, `;
  `])), w.gray.light2)), at = ["darkMode", "className", "as"], vn = q(function(e) {
  var i = e.darkMode, r = e.className, o = e.as, s = o === void 0 ? "h1" : o, f = V(e, at), b = T(i).theme, c = G(s).Component;
  return z.createElement(c, D({ className: M(J, tt, rt[b], r) }, f));
});
vn.displayName = "H1";
var Pe, Me, De, Tt = vn, ot = u(Pe || (Pe = d([`
  font-size: 32px;
  line-height: 40px;
  font-weight: `, `;
  font-family: `, `;
`])), Z.regular, _.serif), it = h(h({}, C.Light, u(Me || (Me = d([`
    color: `, `;
  `])), w.green.dark2)), C.Dark, u(De || (De = d([`
    color: `, `;
  `])), w.gray.light2)), lt = ["darkMode", "className", "as"], xn = q(function(e) {
  var i = e.darkMode, r = e.className, o = e.as, s = o === void 0 ? "h2" : o, f = V(e, lt), b = T(i).theme, c = G(s).Component;
  return z.createElement(c, D({ className: M(J, ot, it[b], r) }, f));
});
xn.displayName = "H2";
var Be, Vt = xn, st = u(Be || (Be = d([`
  font-size: 24px;
  line-height: 32px;
  font-weight: `, `;
`])), Z.medium), ct = ["darkMode", "className", "as"], wn = q(function(e) {
  var i = e.darkMode, r = e.className, o = e.as, s = o === void 0 ? "h3" : o, f = V(e, ct), b = T(i).theme, c = G(s).Component;
  return z.createElement(c, D({ className: M(J, st, ae[b], r) }, f));
});
wn.displayName = "H3";
var Ae, He, Ie, Te, Ve, Ze, Re, _e, qe, Ge, Zt = wn, Q = dn(), ut = u(Ae || (Ae = d([`
  display: inline;
  transition: all 0.15s ease-in-out;
  border-radius: 3px;
  font-family: `, `;
  line-height: 20px;

  .`, `:hover > & {
    text-decoration: none;
  }
`])), _.code, Q), dt = h(h({}, C.Light, u(He || (He = d([`
    background-color: `, `;
    border: 1px solid `, `;
    color: `, `;

    .`, `:hover > & {
      box-shadow: 0 0 0 3px `, `;
      border: 1px solid `, `;
    }
  `])), P.light.background.secondary.default, P.light.border.secondary.default, w.gray.dark3, Q, w.gray.light2, w.gray.light1)), C.Dark, u(Ie || (Ie = d([`
    background-color: `, `;
    border: 1px solid `, `;
    color: `, `;

    .`, `:hover > & {
      box-shadow: 0 0 0 3px `, `;
      border: 1px solid `, `;
    }
  `])), P.dark.background.secondary.default, w.gray.dark2, w.gray.light1, Q, w.gray.dark2, w.gray.dark1)), ft = h(h({}, C.Light, u(Te || (Te = d([`
    .`, `:focus-visible > & {
      box-shadow: `, `;
      border: 1px solid `, `;
    }
  `])), Q, de[C.Light].default, w.blue.base)), C.Dark, u(Ve || (Ve = d([`
    .`, `:focus-visible > & {
      box-shadow: `, `;
      border: 1px solid `, `;
    }
  `])), Q, de[C.Dark].default, w.blue.base)), bt = h(h({}, C.Light, u(Ze || (Ze = d([`
    color: `, `;
  `])), w.blue.base)), C.Dark, u(Re || (Re = d([`
    color: `, `;
  `])), w.blue.light1)), pt = u(_e || (_e = d([`
  text-decoration: none;
  margin: 0;
  padding: 0;
  line-height: 20px;

  &:focus {
    outline: none;
  }
`]))), mt = u(qe || (qe = d([`
  white-space: nowrap;
`]))), gt = u(Ge || (Ge = d([`
  white-space: normal;
`]))), ht = ["children", "className", "darkMode", "baseFontSize", "as"], On = ce(function(e, i) {
  var r, o, s = e.children, f = e.className, b = e.darkMode, c = e.baseFontSize, p = e.as, g = V(e, ht), y = T(b).theme, x = K(c), O = ue(p, g, "code").Component, E = ((r = typeof s == "string" && ((o = s.match(/(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g)) === null || o === void 0 ? void 0 : o.length)) !== null && r !== void 0 ? r : 0) <= 30 ? mt : gt, B = O !== "code", L = z.createElement("code", { ref: i, className: M(qn[x], ut, dt[y], ft[y], E, h({}, bt[y], B), f) }, s);
  return B ? z.createElement(O, D({ className: M(Q, pt, f) }, g), L) : z.cloneElement(L, g);
});
On.displayName = "InlineCode";
var Xe, Ue, We, Ye, Je, Ke, Qe, Rt = On;
u(Xe || (Xe = d([`
  font-family: `, `;
  border: 1px solid;
  border-radius: 3px;
  padding-left: 5px;
  padding-right: 5px;
`])), _.code);
h(h({}, C.Light, u(Ue || (Ue = d([`
    color: `, `;
    border-color: `, `;
    background-color: `, `;
  `])), P.light.text.primary.default, w.gray.dark3, w.white)), C.Dark, u(We || (We = d([`
    color: `, `;
    border-color: `, `;
    background-color: `, `;
  `])), P.dark.text.primary.default, w.gray.base, w.gray.dark3));
var yt = function(e) {
  return u(Ye || (Ye = d([`
    color: `, `;

    font-family: `, `;
    font-weight: `, `;
  `])), P[e].text.primary.default, _.default, Z.bold);
}, vt = function(e) {
  return u(Je || (Je = d([`
    color: `, `;
  `])), P[e].text.disabled.default);
}, xt = h(h({}, I.Body1, u(Ke || (Ke = d([`
    font-size: `, `px;
    line-height: `, `px;
  `])), F.body1.fontSize, F.body1.lineHeight)), I.Body2, u(Qe || (Qe = d([`
    font-size: `, `px;
    line-height: 20px; // Hardcoding because it does not match body2 lineHeight
  `])), F.body2.fontSize)), wt = ["baseFontSize", "darkMode", "className", "children", "disabled", "as", "data-lgid"], jn = q(function(e) {
  var i = e.baseFontSize, r = e.darkMode, o = e.className, s = e.children, f = e.disabled, b = f !== void 0 && f, c = e.as, p = c === void 0 ? "label" : c, g = e["data-lgid"], y = g === void 0 ? hn.label : g, x = V(e, wt), O = T(r).theme, E = K(i), B = G(p).Component;
  return z.createElement(B, D({ "data-lgid": y, className: M(yt(O), xt[E], h({}, vt(O), b), o) }, x), s);
});
jn.displayName = "Label";
var $e, en, nn, tn, rn, an, on, ln, _t = jn, re = dn(), kn = u($e || ($e = d([`
  font-family: `, `;
  display: inline;
  align-items: center;
  text-decoration: none;
  text-decoration-color: transparent;
  cursor: pointer;
  font-size: inherit;
  line-height: inherit;
  appearance: none;
  background: none;
  border: none;
  padding: 0;

  &:hover,
  &[data-hover='true'],
  &:focus-visible,
  &[data-focus='true'] {
    text-decoration: underline;
    transition: text-decoration `, `ms ease-in-out;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
  }

  &:focus {
    outline: none;
  }
`])), _.default, Pn.default), Nn = h(h({}, C.Light, u(en || (en = d([`
    color: `, `;
    font-weight: `, `;

    &:hover,
    &[data-hover='true'] {
      text-decoration-color: `, `;
    }

    &:focus-visible,
    &[data-focus='true'] {
      text-decoration-color: `, `;
    }
  `])), w.blue.base, Z.regular, w.gray.light2, w.blue.base)), C.Dark, u(nn || (nn = d([`
    color: `, `;
    font-weight: `, `;

    &:hover,
    &[data-hover='true'] {
      text-decoration-color: `, `;
    }

    &:focus-visible,
    &[data-focus='true'] {
      text-decoration-color: `, `;
    }
  `])), w.blue.light1, Z.bold, w.gray.dark2, w.blue.base)), zn = function(e) {
  if (e)
    return mn[e];
}, Ot = u(tn || (tn = d([`
  gap: `, `px;
  display: inline-flex;
`])), Mn[100]), jt = ["children", "className", "baseFontSize", "darkMode", "as"];
ce(function(e, i) {
  var r = e.children, o = e.className, s = e.baseFontSize, f = e.darkMode, b = e.as, c = V(e, jt), p = T(f).theme, g = K(s), y = ue(b, c, "span").Component;
  return z.createElement(y, D({ className: M(re, kn, zn(g), Nn[p], Ot, o), ref: i }, c), z.createElement(Hn, { role: "presentation" }), r);
});
var kt = u(rn || (rn = d([`
  transform: translate3d(3px, 0, 0);
  top: 1px;
  position: relative;
`]))), Nt = u(an || (an = d([`
  opacity: 0;
  transform: translate3d(-3px, 0, 0);
  transition: 100ms ease-in;
  transition-property: opacity, transform;
  top: 1px;
  position: relative;

  .`, ":hover &, .", `[data-hover='true'] & {
    opacity: 1;
    transform: translate3d(3px, 0, 0);
  }
`])), re, re), zt = u(on || (on = d([`
  position: relative;
  bottom: 2px;
  left: -1px;
  height: 12px;
`]))), Ct = "hover", St = "persist", sn = "none", Et = ["children", "className", "arrowAppearance", "hideExternalIcon", "baseFontSize", "darkMode", "as"], qt = ce(function(e, i) {
  var r = e.children, o = e.className, s = e.arrowAppearance, f = s === void 0 ? sn : s, b = e.hideExternalIcon, c = b !== void 0 && b, p = e.baseFontSize, g = e.darkMode, y = e.as, x = V(e, Et), O = _n(En(""), 2), E = O[0], B = O[1];
  Ln(function() {
    B(window.location.hostname);
  }, []);
  var L, n = T(g).theme, a = K(p), t = ue(y, x, "span"), l = t.Component, v = t.as, m = t.rest, S = Fn(function() {
    if (Bn(v, m))
      return /^http(s)?:\/\//.test(m.href) ? new URL(m.href).hostname : E;
  }, [v, m, E]), N = { target: void 0, rel: void 0 };
  return m.target || m.rel ? (N.target = m.target, N.rel = m.rel) : l === "a" && (S === E ? N.target = "_self" : (N.target = "_blank", N.rel = "noopener noreferrer")), N.target !== "_blank" || c ? f !== sn && (L = z.createElement(Tn, { role: "presentation", size: 12, className: M(h(h({}, Nt, f === Ct), kt, f === St)) })) : L = z.createElement(Zn, { role: "presentation", className: zt }), z.createElement(l, D({ className: M(re, kn, zn(a), Nn[n], o), ref: i }, N, m), z.createElement("span", null, r), L);
}), Lt = u(ln || (ln = d([`
  font-size: 12px;
  font-weight: `, `;
  text-transform: uppercase;
  line-height: 20px;
  letter-spacing: 0.4px;
`])), Z.bold), Ft = ["darkMode", "className", "as"], Cn = q(function(e) {
  var i = e.darkMode, r = e.className, o = e.as, s = o === void 0 ? "div" : o, f = V(e, Ft), b = T(i).theme, c = G(s).Component;
  return z.createElement(c, D({ className: M(J, Lt, ae[b], r) }, f));
});
Cn.displayName = "Overline";
var cn, Gt = Cn, Pt = u(cn || (cn = d([`
  font-size: 18px;
  line-height: 24px;
  font-weight: `, `;
`])), Z.bold), Mt = ["darkMode", "className", "as"], Sn = q(function(e) {
  var i = e.darkMode, r = e.className, o = e.as, s = o === void 0 ? "h6" : o, f = V(e, Mt), b = T(i).theme, c = G(s).Component;
  return z.createElement(c, D({ className: M(J, Pt, ae[b], r) }, f));
});
Sn.displayName = "Subtitle";
var un, Xt = Sn;
u(un || (un = d([`
  flex: 1;
  min-width: 0;
  max-width: 100%;

  white-space: inherit;
  overflow: inherit;
  text-overflow: inherit;
`])));
export {
  mn as $,
  Tt as B,
  _t as H,
  Vt as I,
  K as J,
  re as L,
  Zt as X,
  qt as a,
  $n as b,
  Gt as e,
  Rt as g,
  Xt as i,
  Ht as m,
  At as t,
  It as w
};
