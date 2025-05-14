import { j as Ir } from "./jsx-dev-runtime.js";
import { r as at, _ as ot, c as Ue, a as Tr } from "./Transition.js";
import { t as it, r as Je, a as en, g as nn, m as d, N as Q, F as s, b as j, x as rn, k as lt, d as Oe, A as ct, D as ce, n as ne, X as Ie, q as de, C as re, T as Be, E as Me, z as Ar, B as We, G as _r, H as Fr, J as st, O as ut, R as Ge, P as Ze, Q as Br, S as Wr, j as Gr, U as De, W as Zr, Y as sn, V as dt, o as ft, Z as pt, i as bt, $ as gt } from "./index2.js";
import { e as ht, t as mt } from "./index4.js";
import * as ve from "react";
import f, { useLayoutEffect as vt, createContext as yt, useContext as xt, useMemo as tn, useState as ge, useRef as ye, useCallback as qe, forwardRef as Xr, useEffect as wt } from "react";
import { u as kt } from "./index5.js";
import { N as Ct } from "./index6.js";
import { X as Ot } from "./index7.js";
import { K as jt } from "./index9.js";
import { H as Et, a as St, k as $t } from "./index11.js";
import { e as Te, K as Ur } from "./index12.js";
import { g as Kr } from "./index10.js";
import { useChatbotContext as Lt } from "./useChatbotContext.js";
var Vr = {};
Object.defineProperty(Vr, "__esModule", { value: !0 });
var Ke = f, Pt = at;
function qr(e, r, n) {
  return r === void 0 && (r = 0), n === void 0 && (n = []), Ke.Children.toArray(e).reduce(function(t, o, u) {
    return Pt.isFragment(o) ? t.push.apply(t, qr(o.props.children, r + 1, n.concat(o.key || u))) : Ke.isValidElement(o) ? t.push(Ke.cloneElement(o, {
      key: n.concat(String(o.key)).join(".")
    })) : (typeof o == "string" || typeof o == "number") && t.push(o), t;
  }, []);
}
var zt = Vr.default = qr, Nt = vt, Dt = function(r) {
  var n = f.useRef(r);
  return Nt(function() {
    n.current = r;
  }), n;
}, un = function(r, n) {
  if (typeof r == "function") {
    r(n);
    return;
  }
  r.current = n;
}, Rt = function(r, n) {
  var t = f.useRef();
  return f.useCallback(function(o) {
    r.current = o, t.current && un(t.current, null), t.current = n, n && un(n, o);
  }, [n]);
}, dn = {
  "min-height": "0",
  "max-height": "none",
  height: "0",
  visibility: "hidden",
  overflow: "hidden",
  position: "absolute",
  "z-index": "-1000",
  top: "0",
  right: "0",
  display: "block"
}, Mt = function(r) {
  Object.keys(dn).forEach(function(n) {
    r.style.setProperty(n, dn[n], "important");
  });
}, fn = Mt, q = null, pn = function(r, n) {
  var t = r.scrollHeight;
  return n.sizingStyle.boxSizing === "border-box" ? t + n.borderSize : t - n.paddingSize;
};
function Ht(e, r, n, t) {
  n === void 0 && (n = 1), t === void 0 && (t = 1 / 0), q || (q = document.createElement("textarea"), q.setAttribute("tabindex", "-1"), q.setAttribute("aria-hidden", "true"), fn(q)), q.parentNode === null && document.body.appendChild(q);
  var o = e.paddingSize, u = e.borderSize, v = e.sizingStyle, b = v.boxSizing;
  Object.keys(v).forEach(function(z) {
    var I = z;
    q.style[I] = v[I];
  }), fn(q), q.value = r;
  var p = pn(q, e);
  q.value = r, p = pn(q, e), q.value = "x";
  var g = q.scrollHeight - o, h = g * n;
  b === "border-box" && (h = h + o + u), p = Math.max(h, p);
  var w = g * t;
  return b === "border-box" && (w = w + o + u), p = Math.min(w, p), [p, g];
}
var bn = function() {
}, It = function(r, n) {
  return r.reduce(function(t, o) {
    return t[o] = n[o], t;
  }, {});
}, Tt = [
  "borderBottomWidth",
  "borderLeftWidth",
  "borderRightWidth",
  "borderTopWidth",
  "boxSizing",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  // non-standard
  "tabSize",
  "textIndent",
  // non-standard
  "textRendering",
  "textTransform",
  "width",
  "wordBreak",
  "wordSpacing",
  "scrollbarGutter"
], At = !!document.documentElement.currentStyle, _t = function(r) {
  var n = window.getComputedStyle(r);
  if (n === null)
    return null;
  var t = It(Tt, n), o = t.boxSizing;
  if (o === "")
    return null;
  At && o === "border-box" && (t.width = parseFloat(t.width) + parseFloat(t.borderRightWidth) + parseFloat(t.borderLeftWidth) + parseFloat(t.paddingRight) + parseFloat(t.paddingLeft) + "px");
  var u = parseFloat(t.paddingBottom) + parseFloat(t.paddingTop), v = parseFloat(t.borderBottomWidth) + parseFloat(t.borderTopWidth);
  return {
    sizingStyle: t,
    paddingSize: u,
    borderSize: v
  };
}, Ft = _t;
function an(e, r, n) {
  var t = Dt(n);
  ve.useLayoutEffect(function() {
    var o = function(v) {
      return t.current(v);
    };
    if (e)
      return e.addEventListener(r, o), function() {
        return e.removeEventListener(r, o);
      };
  }, []);
}
var Bt = function(r, n) {
  an(document.body, "reset", function(t) {
    r.current.form === t.target && n(t);
  });
}, Wt = function(r) {
  an(window, "resize", r);
}, Gt = function(r) {
  an(document.fonts, "loadingdone", r);
}, Zt = ["cacheMeasurements", "maxRows", "minRows", "onChange", "onHeightChange"], Xt = function(r, n) {
  var t = r.cacheMeasurements, o = r.maxRows, u = r.minRows, v = r.onChange, b = v === void 0 ? bn : v, p = r.onHeightChange, g = p === void 0 ? bn : p, h = ot(r, Zt);
  if (h.style) {
    if ("maxHeight" in h.style)
      throw new Error("Using `style.maxHeight` for <TextareaAutosize/> is not supported. Please use `maxRows`.");
    if ("minHeight" in h.style)
      throw new Error("Using `style.minHeight` for <TextareaAutosize/> is not supported. Please use `minRows`.");
  }
  var w = h.value !== void 0, z = ve.useRef(null), I = Rt(z, n), R = ve.useRef(0), _ = ve.useRef(), a = function() {
    var c = z.current, C = t && _.current ? _.current : Ft(c);
    if (C) {
      _.current = C;
      var O = Ht(C, c.value || c.placeholder || "x", u, o), E = O[0], $ = O[1];
      R.current !== E && (R.current = E, c.style.setProperty("height", E + "px", "important"), g(E, {
        rowHeight: $
      }));
    }
  }, l = function(c) {
    w || a(), b(c);
  };
  return ve.useLayoutEffect(a), Bt(z, function() {
    if (!w) {
      var i = z.current.value;
      requestAnimationFrame(function() {
        var c = z.current;
        c && i !== c.value && a();
      });
    }
  }), Wt(a), Gt(a), /* @__PURE__ */ ve.createElement("textarea", it({}, h, {
    onChange: l,
    ref: I
  }));
}, Ut = /* @__PURE__ */ ve.forwardRef(Xt), Qr = { exports: {} };
(function(e, r) {
  (function(n, t) {
    e.exports = t(f, Je);
  })(en, function(n, t) {
    function o(a) {
      if (a && typeof a == "object" && "default" in a)
        return a;
      var l = /* @__PURE__ */ Object.create(null);
      return a && Object.keys(a).forEach(function(i) {
        if (i !== "default") {
          var c = Object.getOwnPropertyDescriptor(a, i);
          Object.defineProperty(l, i, c.get ? c : { enumerable: !0, get: function() {
            return a[i];
          } });
        }
      }), l.default = a, Object.freeze(l);
    }
    var u = o(n);
    function v(a) {
      var l = function(i, c) {
        if (typeof i != "object" || !i)
          return i;
        var C = i[Symbol.toPrimitive];
        if (C !== void 0) {
          var O = C.call(i, c);
          if (typeof O != "object")
            return O;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(i);
      }(a, "string");
      return typeof l == "symbol" ? l : l + "";
    }
    function b(a, l, i) {
      return (l = v(l)) in a ? Object.defineProperty(a, l, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : a[l] = i, a;
    }
    function p() {
      return p = Object.assign ? Object.assign.bind() : function(a) {
        for (var l = 1; l < arguments.length; l++) {
          var i = arguments[l];
          for (var c in i)
            Object.prototype.hasOwnProperty.call(i, c) && (a[c] = i[c]);
        }
        return a;
      }, p.apply(this, arguments);
    }
    function g(a, l) {
      if (a == null)
        return {};
      var i, c, C = function(E, $) {
        if (E == null)
          return {};
        var S, y, N = {}, H = Object.keys(E);
        for (y = 0; y < H.length; y++)
          S = H[y], $.indexOf(S) >= 0 || (N[S] = E[S]);
        return N;
      }(a, l);
      if (Object.getOwnPropertySymbols) {
        var O = Object.getOwnPropertySymbols(a);
        for (c = 0; c < O.length; c++)
          i = O[c], l.indexOf(i) >= 0 || Object.prototype.propertyIsEnumerable.call(a, i) && (C[i] = a[i]);
      }
      return C;
    }
    function h(a, l) {
      return l || (l = a.slice(0)), Object.freeze(Object.defineProperties(a, { raw: { value: Object.freeze(l) } }));
    }
    var w, z, I = { small: 14, default: 16, large: 20, xlarge: 24 }, R = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], _ = function(a) {
      var l = a.className, i = a.size, c = i === void 0 ? 16 : i, C = a.title, O = a["aria-label"], E = a["aria-labelledby"], $ = a.fill, S = a.role, y = S === void 0 ? "img" : S, N = g(a, R), H = t.css(w || (w = h([`
        color: `, `;
      `])), $), Y = t.css(z || (z = h([`
        flex-shrink: 0;
      `]))), Z = function(X, J, L) {
        var K, G = L["aria-label"], M = L["aria-labelledby"], B = L.title;
        switch (X) {
          case "img":
            return G || M || B ? b(b(b({}, "aria-labelledby", M), "aria-label", G), "title", B) : { "aria-label": (K = J, "".concat(K.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(y, "MagnifyingGlass", b(b({ title: C }, "aria-label", O), "aria-labelledby", E));
      return u.createElement("svg", p({ className: t.cx(b({}, H, $ != null), Y, l), height: typeof c == "number" ? c : I[c], width: typeof c == "number" ? c : I[c], role: y }, Z, N, { viewBox: "0 0 16 16" }), u.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M2.3234 9.81874C4.07618 11.5715 6.75062 11.8398 8.78588 10.6244L12.93 14.7685C13.4377 15.2762 14.2608 15.2762 14.7685 14.7685C15.2762 14.2608 15.2762 13.4377 14.7685 12.93L10.6244 8.78588C11.8398 6.75062 11.5715 4.07619 9.81873 2.32341C7.74896 0.253628 4.39318 0.253628 2.3234 2.32341C0.253624 4.39319 0.253624 7.74896 2.3234 9.81874ZM7.98026 4.16188C9.03467 5.2163 9.03467 6.92585 7.98026 7.98026C6.92584 9.03468 5.2163 9.03468 4.16188 7.98026C3.10746 6.92585 3.10746 5.2163 4.16188 4.16188C5.2163 3.10747 6.92584 3.10747 7.98026 4.16188Z", fill: "currentColor" }));
    };
    return _.displayName = "MagnifyingGlass", _.isGlyph = !0, _;
  });
})(Qr);
var Kt = Qr.exports;
const Vt = /* @__PURE__ */ nn(Kt);
var Yr = { exports: {} };
(function(e, r) {
  (function(n, t) {
    e.exports = t(f, Je);
  })(en, function(n, t) {
    function o(a) {
      if (a && typeof a == "object" && "default" in a)
        return a;
      var l = /* @__PURE__ */ Object.create(null);
      return a && Object.keys(a).forEach(function(i) {
        if (i !== "default") {
          var c = Object.getOwnPropertyDescriptor(a, i);
          Object.defineProperty(l, i, c.get ? c : { enumerable: !0, get: function() {
            return a[i];
          } });
        }
      }), l.default = a, Object.freeze(l);
    }
    var u = o(n);
    function v(a) {
      var l = function(i, c) {
        if (typeof i != "object" || !i)
          return i;
        var C = i[Symbol.toPrimitive];
        if (C !== void 0) {
          var O = C.call(i, c);
          if (typeof O != "object")
            return O;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(i);
      }(a, "string");
      return typeof l == "symbol" ? l : l + "";
    }
    function b(a, l, i) {
      return (l = v(l)) in a ? Object.defineProperty(a, l, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : a[l] = i, a;
    }
    function p() {
      return p = Object.assign ? Object.assign.bind() : function(a) {
        for (var l = 1; l < arguments.length; l++) {
          var i = arguments[l];
          for (var c in i)
            Object.prototype.hasOwnProperty.call(i, c) && (a[c] = i[c]);
        }
        return a;
      }, p.apply(this, arguments);
    }
    function g(a, l) {
      if (a == null)
        return {};
      var i, c, C = function(E, $) {
        if (E == null)
          return {};
        var S, y, N = {}, H = Object.keys(E);
        for (y = 0; y < H.length; y++)
          S = H[y], $.indexOf(S) >= 0 || (N[S] = E[S]);
        return N;
      }(a, l);
      if (Object.getOwnPropertySymbols) {
        var O = Object.getOwnPropertySymbols(a);
        for (c = 0; c < O.length; c++)
          i = O[c], l.indexOf(i) >= 0 || Object.prototype.propertyIsEnumerable.call(a, i) && (C[i] = a[i]);
      }
      return C;
    }
    function h(a, l) {
      return l || (l = a.slice(0)), Object.freeze(Object.defineProperties(a, { raw: { value: Object.freeze(l) } }));
    }
    var w, z, I = { small: 14, default: 16, large: 20, xlarge: 24 }, R = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], _ = function(a) {
      var l = a.className, i = a.size, c = i === void 0 ? 16 : i, C = a.title, O = a["aria-label"], E = a["aria-labelledby"], $ = a.fill, S = a.role, y = S === void 0 ? "img" : S, N = g(a, R), H = t.css(w || (w = h([`
        color: `, `;
      `])), $), Y = t.css(z || (z = h([`
        flex-shrink: 0;
      `]))), Z = function(X, J, L) {
        var K, G = L["aria-label"], M = L["aria-labelledby"], B = L.title;
        switch (X) {
          case "img":
            return G || M || B ? b(b(b({}, "aria-labelledby", M), "aria-label", G), "title", B) : { "aria-label": (K = J, "".concat(K.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(y, "XWithCircle", b(b({ title: C }, "aria-label", O), "aria-labelledby", E));
      return u.createElement("svg", p({ className: t.cx(b({}, H, $ != null), Y, l), height: typeof c == "number" ? c : I[c], width: typeof c == "number" ? c : I[c], role: y }, Z, N, { viewBox: "0 0 16 16" }), u.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM9.41421 5.17157C9.80474 4.78105 10.4379 4.78105 10.8284 5.17157C11.219 5.5621 11.219 6.19526 10.8284 6.58579L9.41421 8L10.8284 9.41421C11.219 9.80474 11.219 10.4379 10.8284 10.8284C10.4379 11.219 9.80474 11.219 9.41421 10.8284L8 9.41421L6.58579 10.8284C6.19526 11.219 5.5621 11.219 5.17157 10.8284C4.78105 10.4379 4.78105 9.80474 5.17157 9.41421L6.58579 8L5.17157 6.58579C4.78105 6.19526 4.78105 5.5621 5.17157 5.17157C5.5621 4.78105 6.19526 4.78105 6.58579 5.17157L8 6.58579L9.41421 5.17157Z", fill: "currentColor" }));
    };
    return _.displayName = "XWithCircle", _.isGlyph = !0, _;
  });
})(Yr);
var qt = Yr.exports;
const Qt = /* @__PURE__ */ nn(qt);
var Jr = { exports: {} };
(function(e, r) {
  (function(n, t) {
    e.exports = t(f, Je);
  })(en, function(n, t) {
    function o(a) {
      if (a && typeof a == "object" && "default" in a)
        return a;
      var l = /* @__PURE__ */ Object.create(null);
      return a && Object.keys(a).forEach(function(i) {
        if (i !== "default") {
          var c = Object.getOwnPropertyDescriptor(a, i);
          Object.defineProperty(l, i, c.get ? c : { enumerable: !0, get: function() {
            return a[i];
          } });
        }
      }), l.default = a, Object.freeze(l);
    }
    var u = o(n);
    function v(a) {
      var l = function(i, c) {
        if (typeof i != "object" || !i)
          return i;
        var C = i[Symbol.toPrimitive];
        if (C !== void 0) {
          var O = C.call(i, c);
          if (typeof O != "object")
            return O;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(i);
      }(a, "string");
      return typeof l == "symbol" ? l : l + "";
    }
    function b(a, l, i) {
      return (l = v(l)) in a ? Object.defineProperty(a, l, { value: i, enumerable: !0, configurable: !0, writable: !0 }) : a[l] = i, a;
    }
    function p() {
      return p = Object.assign ? Object.assign.bind() : function(a) {
        for (var l = 1; l < arguments.length; l++) {
          var i = arguments[l];
          for (var c in i)
            Object.prototype.hasOwnProperty.call(i, c) && (a[c] = i[c]);
        }
        return a;
      }, p.apply(this, arguments);
    }
    function g(a, l) {
      if (a == null)
        return {};
      var i, c, C = function(E, $) {
        if (E == null)
          return {};
        var S, y, N = {}, H = Object.keys(E);
        for (y = 0; y < H.length; y++)
          S = H[y], $.indexOf(S) >= 0 || (N[S] = E[S]);
        return N;
      }(a, l);
      if (Object.getOwnPropertySymbols) {
        var O = Object.getOwnPropertySymbols(a);
        for (c = 0; c < O.length; c++)
          i = O[c], l.indexOf(i) >= 0 || Object.prototype.propertyIsEnumerable.call(a, i) && (C[i] = a[i]);
      }
      return C;
    }
    function h(a, l) {
      return l || (l = a.slice(0)), Object.freeze(Object.defineProperties(a, { raw: { value: Object.freeze(l) } }));
    }
    var w, z, I = { small: 14, default: 16, large: 20, xlarge: 24 }, R = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], _ = function(a) {
      var l = a.className, i = a.size, c = i === void 0 ? 16 : i, C = a.title, O = a["aria-label"], E = a["aria-labelledby"], $ = a.fill, S = a.role, y = S === void 0 ? "img" : S, N = g(a, R), H = t.css(w || (w = h([`
        color: `, `;
      `])), $), Y = t.css(z || (z = h([`
        flex-shrink: 0;
      `]))), Z = function(X, J, L) {
        var K, G = L["aria-label"], M = L["aria-labelledby"], B = L.title;
        switch (X) {
          case "img":
            return G || M || B ? b(b(b({}, "aria-labelledby", M), "aria-label", G), "title", B) : { "aria-label": (K = J, "".concat(K.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(y, "Refresh", b(b({ title: C }, "aria-label", O), "aria-labelledby", E));
      return u.createElement("svg", p({ className: t.cx(b({}, H, $ != null), Y, l), height: typeof c == "number" ? c : I[c], width: typeof c == "number" ? c : I[c], role: y }, Z, N, { viewBox: "0 0 16 16" }), u.createElement("path", { d: "M8.03289 2C10.7318 2 12.9831 3.71776 13.5 6L14.9144 6C15.4555 6 15.7061 6.67202 15.297 7.02629L12.8153 9.17546C12.5957 9.36566 12.2697 9.36566 12.0501 9.17545L9.56844 7.02629C9.15937 6.67202 9.40991 6 9.95107 6H11.3977C10.929 4.91456 9.7172 4 8.03289 4C7.00662 4 6.15578 4.33954 5.54157 4.85039C5.29859 5.05248 4.92429 5.0527 4.72549 4.80702L4.11499 4.05254C3.95543 3.85535 3.96725 3.56792 4.1591 3.40197C5.16255 2.53394 6.52815 2 8.03289 2Z", fill: "currentColor" }), u.createElement("path", { d: "M3.94991 6.84265C3.73028 6.65245 3.40429 6.65245 3.18466 6.84265L0.703017 8.99182C0.293944 9.34608 0.544489 10.0181 1.08564 10.0181H2.50411C3.02878 12.2913 5.27531 14 7.96711 14C9.47186 14 10.8375 13.4661 11.8409 12.598C12.0327 12.4321 12.0446 12.1447 11.885 11.9475L11.2745 11.193C11.0757 10.9473 10.7014 10.9475 10.4584 11.1496C9.84422 11.6605 8.99338 12 7.96711 12C6.29218 12 5.08453 11.0956 4.6102 10.0181H6.04893C6.59009 10.0181 6.84063 9.34608 6.43156 8.99182L3.94991 6.84265Z", fill: "currentColor" }));
    };
    return _.displayName = "Refresh", _.isGlyph = !0, _;
  });
})(Jr);
var Yt = Jr.exports;
const Jt = /* @__PURE__ */ nn(Yt);
function gn(e, r) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var t = Object.getOwnPropertySymbols(e);
    r && (t = t.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, t);
  }
  return n;
}
function _e(e) {
  for (var r = 1; r < arguments.length; r++) {
    var n = arguments[r] != null ? arguments[r] : {};
    r % 2 ? gn(Object(n), !0).forEach(function(t) {
      k(e, t, n[t]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : gn(Object(n)).forEach(function(t) {
      Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
    });
  }
  return e;
}
function ea(e) {
  var r = function(n, t) {
    if (typeof n != "object" || !n)
      return n;
    var o = n[Symbol.toPrimitive];
    if (o !== void 0) {
      var u = o.call(n, t);
      if (typeof u != "object")
        return u;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function k(e, r, n) {
  return (r = ea(r)) in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
function He() {
  return He = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var n = arguments[r];
      for (var t in n)
        Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
    }
    return e;
  }, He.apply(this, arguments);
}
function Xe(e, r) {
  if (e == null)
    return {};
  var n, t, o = function(v, b) {
    if (v == null)
      return {};
    var p, g, h = {}, w = Object.keys(v);
    for (g = 0; g < w.length; g++)
      p = w[g], b.indexOf(p) >= 0 || (h[p] = v[p]);
    return h;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var u = Object.getOwnPropertySymbols(e);
    for (t = 0; t < u.length; t++)
      n = u[t], r.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (o[n] = e[n]);
  }
  return o;
}
function m(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
function Ve(e, r) {
  return function(n) {
    if (Array.isArray(n))
      return n;
  }(e) || function(n, t) {
    var o = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
    if (o != null) {
      var u, v, b, p, g = [], h = !0, w = !1;
      try {
        if (b = (o = o.call(n)).next, t !== 0)
          for (; !(h = (u = b.call(o)).done) && (g.push(u.value), g.length !== t); h = !0)
            ;
      } catch (z) {
        w = !0, v = z;
      } finally {
        try {
          if (!h && o.return != null && (p = o.return(), Object(p) !== p))
            return;
        } finally {
          if (w)
            throw v;
        }
      }
      return g;
    }
  }(e, r) || function(n, t) {
    if (n) {
      if (typeof n == "string")
        return hn(n, t);
      var o = Object.prototype.toString.call(n).slice(8, -1);
      if (o === "Object" && n.constructor && (o = n.constructor.name), o === "Map" || o === "Set")
        return Array.from(n);
      if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o))
        return hn(n, t);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function hn(e, r) {
  r > e.length && (r = e.length);
  for (var n = 0, t = new Array(r); n < r; n++)
    t[n] = e[n];
  return t;
}
var mn, vn, yn, na = ["children"], et = yt({});
function ra(e) {
  var r = e.children, n = Xe(e, na);
  return f.createElement(et.Provider, { value: n }, r);
}
var xn, wn, kn, Cn, On, jn, En, Sn, $n, Ln, Pn, zn, Nn, Dn, Rn, Mn, Hn, In, Tn, An, _n, Fn, Bn, Wn, Gn, Zn, Xn, Un, Kn, Vn, qn, Qn, Yn, Jn, er, nr, rr, ta = d(mn || (mn = m([`
  display: flex;
  align-items: center;
  gap: `, `px;
  font-style: italic;
  font-weight: 300;
  padding-block: `, `px;
`])), Q[2], Q[1]), aa = k(k({}, j.Light, d(vn || (vn = m([`
    color: `, `;
  `])), s.gray.dark1)), j.Dark, d(yn || (yn = m([`
    color: `, `;
  `])), s.gray.light1)), oa = function() {
  var e = Oe().theme;
  return f.createElement(Te, { "aria-label": "No results found", isInteractive: !1, className: ne(ta, aa[e]) }, f.createElement("span", null, "No results found"));
}, ia = d(xn || (xn = m([`
  display: flex;
  align-items: center;
  gap: `, `px;
  padding-block: `, `px;
`])), Q[2], Q[1]), la = rn(wn || (wn = m([`
  from {
    transform: rotate(0deg);
  } 
  to {
    transform: rotate(360deg);
  }
`]))), ca = d(kn || (kn = m([`
  height: 16px;
  width: 16px;
  animation: `, ` 1.5s linear infinite;
`])), la), sa = function() {
  var e = Oe().darkMode;
  return f.createElement(Te, { "data-testid": "lg-search-input-loading-option", "aria-label": "Loading results", isInteractive: !1, className: ia }, f.createElement(Jt, { color: e ? s.blue.light1 : s.blue.base, className: ca }), f.createElement("span", null, "Loading results"));
}, ua = d(Cn || (Cn = m([`
  box-shadow: 0px 4px 7px `, `;
  padding: 12px 0;
  border-radius: 12px;
`])), lt(0.75, "#000000")), da = function(e) {
  return d(On || (On = m([`
  background-color: `, `;
  border: 1px solid `, `;
`])), sn[e].background.primary.default, sn[e].border.secondary.default);
}, fa = d(jn || (jn = m([`
  padding: 0;
  margin: 0;
  border-radius: inherit;
  overflow-y: auto;
  scroll-behavior: smooth;
`]))), pa = ["children", "open", "refEl", "footerSlot"], on = f.forwardRef(function(e, r) {
  var n = e.children, t = e.open, o = t !== void 0 && t, u = e.refEl, v = e.footerSlot, b = Xe(e, pa), p = Oe().theme, g = xt(et).state, h = tn(function() {
    var I, R;
    return (I = (R = u.current) === null || R === void 0 ? void 0 : R.clientWidth) !== null && I !== void 0 ? I : 0;
  }, [u, o]), w = ct(u), z = ce(w) ? "unset" : "".concat(Math.min(w, 256), "px");
  return f.createElement(Et, { "data-testid": "lg-search-input-popover", spacing: Q[200], active: o, align: "bottom", justify: "start", className: ne(ua, da(p), d(En || (En = m([`
            width: `, `px;
            min-width: `, `px;
          `])), h, h)), refEl: u, dismissMode: St.Manual, renderMode: $t.TopLayer }, g === "loading" ? f.createElement(sa, null) : f.createElement(f.Fragment, null, f.createElement("ul", He({ role: "listbox", "aria-live": "polite", "aria-relevant": "additions removals", "aria-expanded": o, ref: r, className: ne(fa, d(Sn || (Sn = m([`
                  max-height: `, `;
                `])), z)) }, b), f.Children.count(n) ? n : f.createElement(oa, null)), v));
});
on.displayName = "SearchResultsMenu";
var be = function(e) {
  return "0 0 0 100px ".concat(e, " inset");
}, ba = d($n || ($n = m([`
  outline: none;
`]))), ga = d(Ln || (Ln = m([`
  position: relative;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-items: center;
  border: 1px solid;
  border-radius: 6px;
  z-index: 0;
  transition: `, `ms ease-in-out;
  transition-property: border-color, box-shadow;
`])), Ie.default), ha = k(k(k(k({}, re.XSmall, d(Pn || (Pn = m([`
    font-size: `, `px;
    line-height: `, `px;
    height: 22px;
    grid-template-columns: 28px 1fr 36px;
  `])), de.body1.fontSize, de.body1.lineHeight)), re.Small, d(zn || (zn = m([`
    font-size: `, `px;
    line-height: `, `px;
    height: 28px;
    grid-template-columns: 32px 1fr 36px;
  `])), de.body1.fontSize, de.body1.lineHeight)), re.Default, d(Nn || (Nn = m([`
    font-size: `, `px;
    line-height: `, `px;
    height: 36px;
    grid-template-columns: 36px 1fr 36px;
  `])), de.body1.fontSize, de.body1.lineHeight)), re.Large, d(Dn || (Dn = m([`
    font-size: `, `px;
    line-height: `, `px;
    height: 48px;
    grid-template-columns: 36px 1fr 44px;
  `])), de.large.fontSize, de.large.lineHeight)), ma = k(k({}, j.Light, d(Rn || (Rn = m([`
    color: `, `;
    background: `, `;
    border-color: `, `;
  `])), s.black, s.white, s.gray.base)), j.Dark, d(Mn || (Mn = m([`
    color: `, `;
    background-color: `, `;
    border-color: `, `;
  `])), s.gray.light2, s.gray.dark4, s.gray.base)), va = k(k({}, j.Light, d(Hn || (Hn = m([`
    &:hover,
    &:active {
      &:not(:disabled):not(:focus-within) {
        box-shadow: `, `;
      }
    }
  `])), Be.light.gray)), j.Dark, d(In || (In = m([`
    &:hover,
    &:active {
      &:not(:disabled):not(:focus-within) {
        box-shadow: `, `;
      }
    }
  `])), Be.dark.gray)), ya = k(k({}, j.Light, d(Tn || (Tn = m([`
    &:not(:disabled):focus-within {
      box-shadow: `, `;
      border-color: `, `;
    }
  `])), Me.light.input, s.white)), j.Dark, d(An || (An = m([`
    &:not(:disabled):focus-within {
      box-shadow: `, `;
      border-color: `, `;
    }
  `])), Me.dark.input, s.gray.dark4)), xa = k(k({}, j.Light, d(_n || (_n = m([`
    cursor: not-allowed;
    color: `, `;
    background-color: `, `;
    border-color: `, `;
  `])), s.gray.base, s.gray.light2, s.gray.light1)), j.Dark, d(Fn || (Fn = m([`
    cursor: not-allowed;
    color: `, `;
    background-color: `, `;
    border-color: `, `;
  `])), s.gray.dark2, s.gray.dark3, s.gray.dark2)), wa = d(Bn || (Bn = m([`
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  background-color: inherit;
  font-family: `, `;
  width: 100%;
  height: 1.5em;
  font-weight: `, `;
  z-index: 1;
  outline: none;
  border: none;
  padding: 0;

  &[aria-disabled='true'] {
    cursor: not-allowed;

    &:hover,
    &:active {
      box-shadow: none;
    }
  }

  &::placeholder {
    font-size: inherit;
    line-height: inherit;
  }
  &::-ms-clear,
  &::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }
  &::-webkit-search-decoration,
  &::-webkit-search-cancel-button,
  &::-webkit-search-results-button,
  &::-webkit-search-results-decoration {
    display: none;
  }
`])), Ar.default, We.regular), ka = k(k({}, j.Light, d(Wn || (Wn = m([`
    &:-webkit-autofill {
      color: inherit;
      background: transparent;
      border: none;
      -webkit-text-fill-color: inherit;

      &[aria-disabled='false'] {
        box-shadow: `, `;

        &:focus {
          box-shadow: `, `,
            `, `;
        }

        &:hover:not(:focus) {
          box-shadow: `, `,
            `, `;
        }
      }
    }

    &::placeholder {
      color: `, `;
      font-weight: `, `;
    }

    &[aria-disabled='true'] {
      &::placeholder {
        color: `, `;
      }

      &:-webkit-autofill {
        &,
        &:hover,
        &:focus {
          appearance: none;
          border: 1px solid `, `;
          -webkit-text-fill-color: `, `;
          box-shadow: `, `;
        }
      }
    }
  `])), be(s.white), be(s.white), Me.light.input, be(s.white), Be.light.gray, s.gray.base, We.regular, s.gray.base, s.gray.base, s.gray.base, be(s.gray.light2))), j.Dark, d(Gn || (Gn = m([`
    &:-webkit-autofill {
      color: inherit;
      background: transparent;
      border: none;
      -webkit-text-fill-color: `, `;
      &[aria-disabled='false'] {
        box-shadow: `, `;

        &:focus {
          box-shadow: `, `,
            `, `;
          border-color: `, `;
        }

        &:hover:not(:focus) {
          box-shadow: `, `,
            `, `;
        }
      }
    }

    &::placeholder {
      color: `, `;
      font-weight: `, `;
    }

    &[aria-disabled='true'] {
      &::placeholder {
        color: `, `;
      }

      &:-webkit-autofill {
        &,
        &:hover,
        &:focus {
          appearance: none;
          border: 1px solid `, `;
          -webkit-text-fill-color: `, `;
          box-shadow: `, `;
        }
      }
    }
  `])), s.gray.light3, be(s.gray.dark4), be(s.gray.dark4), Me.dark.input, s.blue.light1, be(s.gray.dark4), Be.dark.gray, s.gray.dark1, We.regular, s.gray.dark1, s.gray.dark1, s.gray.dark1, be(s.gray.dark2))), Ca = k(k({}, j.Light, d(Zn || (Zn = m([`
    color: `, `;
  `])), s.gray.dark1)), j.Dark, d(Xn || (Xn = m([`
    color: `, `;
  `])), s.gray.light1)), Oa = k(k(k(k({}, re.XSmall, d(Un || (Un = m([`
    margin-left: 2px;
  `])))), re.Small, d(Kn || (Kn = m([`
    margin-left: 0px;
  `])))), re.Default, d(Vn || (Vn = m([`
    margin-left: 8px;
  `])))), re.Large, d(qn || (qn = m([`
    margin-left: 8px;
  `])))), ja = k(k({}, j.Light, d(Qn || (Qn = m([`
    color: `, `;
  `])), s.gray.base)), j.Dark, d(Yn || (Yn = m([`
    color: `, `;
  `])), s.gray.dark1)), Ea = k(k(k(k({}, re.XSmall, d(Jn || (Jn = m([`
    height: 22px;
    width: 22px;
  `])))), re.Small, d(er || (er = m([`
    height: 28px;
    width: 28px;
  `])))), re.Default, d(nr || (nr = m([`
    height: 28px;
    width: 28px;
  `])))), re.Large, d(rr || (rr = m([`
    height: 28px;
    width: 28px;
  `])))), Sa = { Unset: "unset", Loading: "loading" }, $a = ["placeholder", "className", "darkMode", "size", "disabled", "children", "state", "value", "onChange", "onSubmit", "aria-label", "aria-labelledby"], La = f.forwardRef(function(e, r) {
  var n = e.placeholder, t = n === void 0 ? "Search" : n, o = e.className, u = e.darkMode, v = e.size, b = v === void 0 ? re.Default : v, p = e.disabled, g = e.children, h = e.state, w = h === void 0 ? Sa.Unset : h, z = e.value, I = e.onChange, R = e.onSubmit, _ = e["aria-label"], a = e["aria-labelledby"], l = Xe(e, $a), i = Oe(u), c = i.theme, C = i.darkMode, O = Ve(ge(!1), 2), E = O[0], $ = O[1], S = Ve(ge(0), 2), y = S[0], N = S[1], H = function() {
    return $(!1);
  }, Y = function() {
    return $(!0);
  }, Z = ye(null), X = ye(null), J = ye(null), L = _r(r, null), K = ye(null), G = Fr({ prefix: "result" }), M = Ve(ge(), 2), B = M[0], je = M[1], xe = G("".concat(y)), se = !ce(g), Ae = st(z, I), Ee = Ae.value, we = Ae.handleChange, oe = qe(function(D) {
    L.current && (L.current.value = D, we(ut(new Event("change", { cancelable: !0, bubbles: !0 }), L.current)));
  }, [we, L]), ke = qe(function() {
    var D = 0, T = f.Children.map(g, function V(W) {
      if (Ge(W, "SearchResult")) {
        var ee, te = (D += 1) - 1, x = Ze(W);
        return f.cloneElement(W, _e(_e({}, W.props), {}, { id: "result-".concat(te), key: "result-".concat(te), ref: (ee = W.props.ref) !== null && ee !== void 0 ? ee : G == null ? void 0 : G("".concat(te)), highlighted: te === y, onClick: function(ie) {
          var U, le;
          if ((U = (le = W.props).onClick) === null || U === void 0 || U.call(le, ie), oe(x), ie.detail >= 1 && Z.current && L.current) {
            var ae, he = new Event("submit", { cancelable: !0, bubbles: !0 });
            (ae = Z.current) === null || ae === void 0 || ae.dispatchEvent(he);
          }
        } }));
      }
      if (Ge(W, "SearchResultGroup")) {
        var F = f.Children.map(W.props.children, V);
        if (F && F.length > 0)
          return f.cloneElement(W, _e(_e({}, W.props), {}, { children: F }));
      }
    });
    return { resultsCount: D, updatedChildren: T };
  }, [g, y, L, G, oe]), Se = tn(function() {
    return ke();
  }, [ke]), $e = Se.updatedChildren, pe = Se.resultsCount, Le = function(D) {
    switch (D) {
      case "first":
        N(0);
        break;
      case "last":
        N(pe);
        break;
      case "next":
        var T = !ce(y) && y + 1 < pe ? y + 1 : 0;
        N(T);
        break;
      case "prev":
        var V = !ce(y) && y - 1 >= 0 ? y - 1 : pe - 1;
        N(V);
    }
  };
  return Br(xe, J, 12), Wr(function() {
    H();
  }, [X, J], { enabled: E && se }), f.createElement(Gr, { darkMode: C }, f.createElement(ra, { state: w, highlight: y, resultDynamicRefs: G }, f.createElement("form", He({ role: "search", ref: Z, className: ne(ba, o), onSubmit: function(D) {
    D.preventDefault(), R == null || R(D), se && (H(), oe(""));
  } }, l), f.createElement("div", { ref: X, role: "searchbox", tabIndex: -1, onMouseDown: function(D) {
    p && D.preventDefault();
  }, onClick: function(D) {
    (function(T) {
      p ? (T.preventDefault(), T.stopPropagation()) : Y();
    })(D);
  }, onFocus: function(D) {
    var T, V = D.target, W = V === K.current ? K.current : (T = L.current) !== null && T !== void 0 ? T : V;
    W.focus(), je(W);
  }, onKeyDown: function(D) {
    var T, V, W = (T = J.current) === null || T === void 0 ? void 0 : T.contains(document.activeElement);
    if ((!((V = X.current) === null || V === void 0) && V.contains(document.activeElement) || W) && !p)
      switch (D.key) {
        case De.Enter:
          var ee;
          xe == null || (ee = xe.current) === null || ee === void 0 || ee.click();
          break;
        case De.Escape:
          var te;
          H(), (te = L.current) === null || te === void 0 || te.focus();
          break;
        case De.ArrowDown:
          var x;
          se && ((x = L.current) === null || x === void 0 || x.focus(), Y(), D.preventDefault(), Le("next"));
          break;
        case De.ArrowUp:
          var F;
          se && ((F = L.current) === null || F === void 0 || F.focus(), Y(), D.preventDefault(), Le("prev"));
          break;
        case De.Tab:
          E && H();
          break;
        default:
          se && Y();
      }
  }, className: ne(ga, ha[b], ma[c], k(k(k({}, ya[c], B === L.current), xa[c], p), va[c], !p)), "aria-label": a ? void 0 : _, "aria-labelledby": a }, f.createElement(Vt, { className: ne(Ca[c], Oa[b], k({}, ja[c], p)), role: "presentation" }), f.createElement("input", { type: "search", className: ne(wa, ka[c]), value: Ee, onChange: function(D) {
    we == null || we(D);
  }, placeholder: t, ref: L, readOnly: p, "aria-disabled": p }), Ee && f.createElement(jt, { ref: K, type: "button", "aria-label": "Clear search", onClick: function(D) {
    var T;
    D.stopPropagation(), oe(""), L == null || (T = L.current) === null || T === void 0 || T.focus();
  }, className: Ea[b], tabIndex: p ? -1 : 0, disabled: p }, f.createElement(Qt, null))), se && f.createElement(on, { open: E, refEl: X, ref: J }, $e))));
});
La.displayName = "SearchInput";
var tr, ar, or, Pa = ["as", "children", "description", "disabled", "className", "darkMode"], za = Zr(function(e, r) {
  var n, t = e.as, o = t === void 0 ? "li" : t, u = e.children, v = e.description, b = e.disabled, p = e.className;
  e.darkMode;
  var g = Xe(e, Pa), h = Ze(u), w = (n = g["aria-label"]) !== null && n !== void 0 ? n : g["aria-labelledby"] ? "" : h;
  return f.createElement(Te, He({}, g, { as: o, ref: r, className: p, disabled: b, "aria-labelledby": g["aria-labelledby"], "aria-label": w }), f.createElement(Ur, { description: v, preserveIconSpace: !1 }, f.createElement("strong", null, u)));
}, "SearchResult");
za.displayName = "SearchResult";
d(tr || (tr = m([`
  padding-top: 12px;
  padding-bottom: 0;
`])));
k(k({}, j.Light, d(ar || (ar = m([`
    color: `, `;
  `])), s.gray.dark1)), j.Dark, d(or || (or = m([`
    color: `, `;
  `])), s.gray.base));
function ir(e, r) {
  var n = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var t = Object.getOwnPropertySymbols(e);
    r && (t = t.filter(function(o) {
      return Object.getOwnPropertyDescriptor(e, o).enumerable;
    })), n.push.apply(n, t);
  }
  return n;
}
function Fe(e) {
  for (var r = 1; r < arguments.length; r++) {
    var n = arguments[r] != null ? arguments[r] : {};
    r % 2 ? ir(Object(n), !0).forEach(function(t) {
      A(e, t, n[t]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : ir(Object(n)).forEach(function(t) {
      Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
    });
  }
  return e;
}
function Na(e) {
  var r = function(n, t) {
    if (typeof n != "object" || !n)
      return n;
    var o = n[Symbol.toPrimitive];
    if (o !== void 0) {
      var u = o.call(n, t);
      if (typeof u != "object")
        return u;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function A(e, r, n) {
  return (r = Na(r)) in e ? Object.defineProperty(e, r, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = n, e;
}
function fe() {
  return fe = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var n = arguments[r];
      for (var t in n)
        Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
    }
    return e;
  }, fe.apply(this, arguments);
}
function ln(e, r) {
  if (e == null)
    return {};
  var n, t, o = function(v, b) {
    if (v == null)
      return {};
    var p, g, h = {}, w = Object.keys(v);
    for (g = 0; g < w.length; g++)
      p = w[g], b.indexOf(p) >= 0 || (h[p] = v[p]);
    return h;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var u = Object.getOwnPropertySymbols(e);
    for (t = 0; t < u.length; t++)
      n = u[t], r.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(e, n) && (o[n] = e[n]);
  }
  return o;
}
function P(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
function Re(e, r) {
  return function(n) {
    if (Array.isArray(n))
      return n;
  }(e) || function(n, t) {
    var o = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
    if (o != null) {
      var u, v, b, p, g = [], h = !0, w = !1;
      try {
        if (b = (o = o.call(n)).next, t !== 0)
          for (; !(h = (u = b.call(o)).done) && (g.push(u.value), g.length !== t); h = !0)
            ;
      } catch (z) {
        w = !0, v = z;
      } finally {
        try {
          if (!h && o.return != null && (p = o.return(), Object(p) !== p))
            return;
        } finally {
          if (w)
            throw v;
        }
      }
      return g;
    }
  }(e, r) || function(n, t) {
    if (n) {
      if (typeof n == "string")
        return lr(n, t);
      var o = Object.prototype.toString.call(n).slice(8, -1);
      if (o === "Object" && n.constructor && (o = n.constructor.name), o === "Map" || o === "Set")
        return Array.from(n);
      if (o === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o))
        return lr(n, t);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function lr(e, r) {
  r > e.length && (r = e.length);
  for (var n = 0, t = new Array(r); n < r; n++)
    t[n] = e[n];
  return t;
}
var cr, sr, ur, dr, fr, pr, br, gr, hr, mr, vr, yr, xr, wr, kr, Cr, Or, jr, Er, Sr, $r, Lr, Pr, Da = d(cr || (cr = P([`
  width: 100%;
  position: relative;
`]))), Ra = d(sr || (sr = P([`
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  position: relative;
  border-radius: 8px;
  border: 1px solid `, `;
  z-index: 2;

  &:disabled {
    cursor: not-allowed;

    &:hover,
    &:active {
      box-shadow: none;
    }
  }
`])), s.gray.base), Ma = d(ur || (ur = P([`
  border-color: transparent;
`]))), Ha = A(A({}, j.Dark, d(dr || (dr = P([`
    background-color: `, `;
    color: `, `;
  `])), s.black, s.white)), j.Light, d(fr || (fr = P([`
    background-color: `, `;
    color: black;
  `])), s.white)), Ia = d(pr || (pr = P([`
  display: flex;
  gap: `, `px;
  align-items: center;
  align-self: top;
  height: 36px; // hard set to height of textarea
  padding: `, "px 0px ", "px ", `px;
  background-color: inherit;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
`])), Q[2], Q[1], Q[1], Q[2]), Ta = d(br || (br = P([`
  display: flex;
  align-items: flex-end;
  gap: `, `px;
  padding: `, `px;
  background-color: inherit;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
`])), Q[2], Q[1]), Aa = d(gr || (gr = P([`
  flex: 1;
  font-size: `, `px;
  font-family: `, `;
  font-weight: `, `;
  height: 36px;
  padding: `, `px;
  outline: none;
  border: none;
  transition: `, `ms ease-in-out;
  transition-property: border-color, box-shadow;
  overflow-y: scroll;
  resize: none; // to remove bottom right diagonal lines
  box-sizing: content-box;
  line-height: `, `px;
  max-height: 160px;
  background-color: inherit;
  color: inherit;
  margin: 0; // firefox creates margins on textareas - remove it for consistent sizing

  &:disabled {
    &::placeholder {
      color: inherit;
    }

    &:disabled:-webkit-autofill {
      &,
      &:hover,
      &:focus {
        appearance: none;
        -webkit-text-fill-color: `, `;
      }
    }
  }
`])), dt.Body1, Ar.default, We.regular, Q[2], Ie.default, de.body1.lineHeight, s.gray.base), Qe = A(A({}, j.Dark, d(hr || (hr = P([`
    color: `, `;
    background-color: `, `;
    border-color: `, `;
  `])), s.gray.dark1, s.gray.dark3, s.gray.dark2)), j.Light, d(mr || (mr = P([`
    color: `, `;
    background-color: `, `;
    border-color: `, `;
  `])), s.gray.base, s.gray.light2, s.gray.light1)), _a = A(A({}, j.Dark, d(vr || (vr = P([`
    background-color: `, `;
    color: `, `;
    &:disabled {
      `, `
    }
  `])), s.black, s.white, Qe[j.Dark])), j.Light, d(yr || (yr = P([`
    background-color: `, `;
    color: black;
    &:disabled {
      `, `
    }
    &::placeholder {
      color: `, `;
    }
  `])), s.white, Qe[j.Light], s.gray.base)), Fa = d(xr || (xr = P([`
  border-radius: 8px;
`]))), Ba = d(wr || (wr = P([`
  box-shadow: `, `;
  border-color: transparent;
  transition: `, `ms ease-in-out;
  transition-property: border-color, box-shadow;
`])), Me.light.input, Ie.default), Wa = d(kr || (kr = P([`
  &:before,
  &:after {
    content: '';
    position: absolute;
    top: -`, `px;
    left: -`, `px;
    width: calc(100% + `, `px);
    height: calc(100% + `, `px);
    border-radius: 12px;
    background-color: `, `;
    background-size: 400% 400%;
    background-position: 800% 800%; // set final state of animation
  }

  &:after {
    animation: 4s animateBg linear;
  }

  &:before {
    filter: blur(4px) opacity(0.6);
    animation: 4s animateBg, animateShadow linear infinite;
    opacity: 0;
  }

  @keyframes animateBg {
    0% {
      background-position: 400% 400%;
      background-image: linear-gradient(
        20deg,
        `, ` 0%,
        `, ` 30%,
        #00ede0 45%,
        #00ebc1 75%,
        #0498ec
      );
    }
    100% {
      background-position: 0% 0%;
      background-image: linear-gradient(
        20deg,
        `, ` 0%,
        `, ` 30%,
        #00ede0 45%,
        #00ebc1 75%,
        #0498ec
      );
    }
  }

  @keyframes animateShadow {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`])), 4, 4, 8, 8, s.blue.light1, s.blue.light1, s.blue.light1, s.blue.light1, s.blue.light1), Ga = d(Cr || (Cr = P([`
  &:hover {
    box-shadow: none;
  }
`]))), Za = d(Or || (Or = P([`
  padding: `, "px ", `px;
  border-radius: `, `px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  user-select: none;
`])), Q[100], Q[400], ft[400]), Xa = A(A({}, j.Dark, d(jr || (jr = P([`
    background-color: `, `;
    border: 1px solid `, `;
    color: `, `;
  `])), s.gray.dark4, s.gray.dark2, s.gray.light2)), j.Light, d(Er || (Er = P([`
    background-color: `, `;
    border: 1px solid `, `;
    color: `, `;
  `])), s.gray.light2, s.gray.light2, s.green.dark2)), Ua = rn(Sr || (Sr = P([`
  from {
    opacity: 0;
    display: none;
  }
  to {
    opacity: 1;
    display: flex;
  }
`]))), Ka = d($r || ($r = P([`
  opacity: 1;
  animation: `, " ", `ms forwards;
`])), Ua, Ie.default), Va = rn(Lr || (Lr = P([`
  from {
    display: flex;
    opacity: 1;
  }
  to {
    display: none;
    opacity: 0;
  }
`]))), qa = d(Pr || (Pr = P([`
  opacity: 0;
  animation: `, " ", `ms forwards;
`])), Va, Ie.default), zr = function(e, r) {
  return e === j.Dark ? r ? s.gray.dark1 : s.gray.light1 : r ? s.gray.base : s.gray.dark1;
}, Qa = Kr("Return", function(e) {
  return f.createElement("svg", fe({ width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, e), f.createElement("g", { id: "Return" }, f.createElement("path", { id: "Union", d: "M5 2C4.44772 2 4 2.44772 4 3C4 3.55228 4.44772 4 5 4H10C11.3807 4 12.5 5.11929 12.5 6.5C12.5 7.88071 11.3807 9 10 9H5.20328L6.65079 7.75927C7.07012 7.39985 7.11868 6.76855 6.75926 6.34923C6.39983 5.9299 5.76853 5.88134 5.34921 6.24076L1.84921 9.24076C1.62756 9.43074 1.5 9.70809 1.5 10C1.5 10.2919 1.62756 10.5693 1.84921 10.7593L5.34921 13.7593C5.76853 14.1187 6.39983 14.0701 6.75926 13.6508C7.11868 13.2315 7.07012 12.6002 6.65079 12.2408L5.20324 11H10C12.4853 11 14.5 8.98528 14.5 6.5C14.5 4.01472 12.4853 2 10 2H5Z", fill: "currentColor" })));
}), Ya = Kr("Sparkle", function(e) {
  return f.createElement("svg", fe({ width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, e), f.createElement("path", { d: "M6.27334 2.89343L5.27501 5.88842C5.1749 6.18877 4.93922 6.42445 4.63887 6.52456L1.64388 7.52289C1.18537 7.67573 1.18537 8.32427 1.64388 8.47711L4.63887 9.47544C4.93922 9.57555 5.1749 9.81123 5.27501 10.1116L6.27334 13.1066C6.42618 13.5651 7.07472 13.5651 7.22756 13.1066L8.22589 10.1116C8.326 9.81123 8.56168 9.57555 8.86203 9.47544L11.857 8.47711C12.3155 8.32427 12.3155 7.67573 11.857 7.52289L8.86203 6.52456C8.56168 6.42445 8.326 6.18877 8.22589 5.88842L7.22756 2.89343C7.07472 2.43492 6.42618 2.43492 6.27334 2.89343Z", fill: "currentColor" }), f.createElement("path", { d: "M12.5469 1.17194L12.3158 1.8651C12.2157 2.16545 11.98 2.40113 11.6797 2.50125L10.9865 2.7323C10.7573 2.80872 10.7573 3.13299 10.9865 3.20941L11.6797 3.44046C11.98 3.54058 12.2157 3.77626 12.3158 4.0766L12.5469 4.76977C12.6233 4.99902 12.9476 4.99902 13.024 4.76977L13.255 4.0766C13.3552 3.77626 13.5908 3.54058 13.8912 3.44046L14.5843 3.20941C14.8136 3.13299 14.8136 2.80872 14.5843 2.7323L13.8912 2.50125C13.5908 2.40113 13.3552 2.16545 13.255 1.8651L13.024 1.17194C12.9476 0.942687 12.6233 0.942687 12.5469 1.17194Z", fill: "currentColor" }), f.createElement("path", { d: "M12.5469 11.2302L12.3158 11.9234C12.2157 12.2237 11.98 12.4594 11.6797 12.5595L10.9865 12.7906C10.7573 12.867 10.7573 13.1913 10.9865 13.2677L11.6797 13.4988C11.98 13.5989 12.2157 13.8346 12.3158 14.1349L12.5469 14.8281C12.6233 15.0573 12.9476 15.0573 13.024 14.8281L13.255 14.1349C13.3552 13.8346 13.5908 13.5989 13.8912 13.4988L14.5843 13.2677C14.8136 13.1913 14.8136 12.867 14.5843 12.7906L13.8912 12.5595C13.5908 12.4594 13.3552 12.2237 13.255 11.9234L13.024 11.2302C12.9476 11.001 12.6233 11.001 12.5469 11.2302Z", fill: "currentColor" }));
}), Ja = ["className", "textareaProps", "onMessageSend", "onSubmit", "shouldRenderHotkeyIndicator", "shouldRenderGradient", "badgeText", "darkMode", "disabled", "disableSend", "children", "dropdownFooterSlot", "dropdownProps"], nt = Xr(function(e, r) {
  var n, t, o = e.className, u = e.textareaProps, v = e.onMessageSend, b = e.onSubmit, p = e.shouldRenderHotkeyIndicator, g = p !== void 0 && p, h = e.shouldRenderGradient, w = h === void 0 || h, z = e.badgeText, I = e.darkMode, R = e.disabled, _ = e.disableSend, a = e.children, l = e.dropdownFooterSlot, i = e.dropdownProps, c = ln(e, Ja), C = _r(r, null), O = ye(null), E = ye(null), $ = ye(null), S = Fr({ prefix: "suggested-prompt" }), y = Re(ge(!1), 2), N = y[0], H = y[1], Y = Re(ge((n = u == null || (t = u.value) === null || t === void 0 ? void 0 : t.toString()) !== null && n !== void 0 ? n : ""), 2), Z = Y[0], X = Y[1], J = Re(ge(!1), 2), L = J[0], K = J[1], G = Re(ge(void 0), 2), M = G[0], B = G[1], je = S("".concat(M)), xe = Re(ge(!1), 2), se = xe[0], Ae = xe[1], Ee = Oe(I), we = Ee.darkMode, oe = Ee.theme, ke = kt().containerWidth, Se = w && N && !R, $e = function() {
    return _ || R || Z === "";
  }, pe = !ce(a), Le = qe(function() {
    var x = 0, F = zt(a).map(function ie(U) {
      if (Ge(U, "SuggestedPrompt")) {
        var le, ae = (x += 1) - 1, he = Ze(U);
        return f.cloneElement(U, Fe(Fe({}, U.props), {}, { id: "suggested-prompt-".concat(ae), key: "suggested-prompt-".concat(ae), ref: (le = U.props.ref) !== null && le !== void 0 ? le : S == null ? void 0 : S("".concat(ae)), highlighted: ae === M, onClick: function(ze) {
          var me, Ce;
          (me = (Ce = U.props).onClick) === null || me === void 0 || me.call(Ce, ze), X(he);
          var Ne = setTimeout(function() {
            var ue;
            C == null || (ue = C.current) === null || ue === void 0 || ue.requestSubmit(), clearTimeout(Ne);
          });
          ee();
        } }));
      }
      if (Ge(U, "SuggestedPrompts")) {
        var Pe = f.Children.map(U.props.children, ie);
        if (Pe && Pe.length > 0)
          return f.cloneElement(U, Fe(Fe({}, U.props), {}, { children: Pe }));
      }
    });
    return { resultsCount: x, updatedChildren: F };
  }, [a, M, $, S, X]), D = tn(function() {
    return Le();
  }, [Le]), T = D.updatedChildren, V = D.resultsCount;
  wt(function() {
    var x = ke !== void 0 && ke >= bt.Mobile;
    x !== se && Ae(x);
  }, [ke]);
  var W = function(x) {
    switch (x) {
      case "first":
        B(0);
        break;
      case "last":
        B(V);
        break;
      case "next":
        var F = !ce(M) && M + 1 < V ? M + 1 : 0;
        B(F);
        break;
      case "prev":
        var ie = !ce(M) && M - 1 >= 0 ? M - 1 : V - 1;
        B(ie);
    }
  }, ee = function() {
    K(!1), B(void 0);
  }, te = function() {
    return K(!0);
  };
  return Br(je, E, 12), Wr(function() {
    ee();
  }, [O, E], { enabled: L && pe }), pt("keydown", function(x) {
    !x.repeat && x.key === "/" && $.current && (x.preventDefault(), x.stopPropagation(), $.current.focus());
  }, { enabled: g && !N }), f.createElement(Gr, { darkMode: we }, f.createElement("form", fe({ className: ne(Da, o), onSubmit: function(x) {
    x.preventDefault(), $e() || (v && Z && (v(Z, x), X("")), b == null || b(x));
  }, ref: C }, c), f.createElement("div", { className: ne(Fa, A(A({}, Wa, Se), Ba, !Se && N && !R)), ref: O }, f.createElement("div", { className: ne(Ra, Ha[oe], A(A({}, Qe[oe], R), Ma, N)) }, f.createElement("div", { className: Ia }, f.createElement(Ya, { fill: zr(oe, R) }), z && f.createElement(Ct, { variant: "blue" }, z)), f.createElement(Ut, fe({ "aria-keyshortcuts": "/", placeholder: "Type your message here", value: Z, disabled: R }, u ?? {}, { className: ne(Aa, _a[oe], u == null ? void 0 : u.className), onKeyDown: function(x) {
    var F, ie, U = (F = E.current) === null || F === void 0 ? void 0 : F.contains(document.activeElement);
    if (!((ie = O.current) === null || ie === void 0) && ie.contains(document.activeElement) || U)
      switch (x.key) {
        case "Enter":
          var le, ae;
          if (x.preventDefault(), ce(M))
            if (x.ctrlKey || x.shiftKey) {
              if (x.ctrlKey || x.shiftKey) {
                var he;
                (function(ue, rt) {
                  var tt = ue.value;
                  ue.value = rt;
                  var cn = ue == null ? void 0 : ue._valueTracker;
                  cn && cn.setValue(tt), ue.dispatchEvent(new Event("change", { bubbles: !0 }));
                })($ == null ? void 0 : $.current, Z + `
`), X(Z + `
`);
                var Pe = new Event("change", { bubbles: !0 });
                (he = $.current) === null || he === void 0 || he.dispatchEvent(Pe);
              }
            } else
              (le = C.current) === null || le === void 0 || le.requestSubmit();
          else
            je == null || (ae = je.current) === null || ae === void 0 || ae.click();
          break;
        case "Escape":
          var ze;
          ee(), (ze = $.current) === null || ze === void 0 || ze.focus();
          break;
        case "ArrowDown":
          var me;
          pe && ((me = $.current) === null || me === void 0 || me.focus(), te(), x.preventDefault(), ce(M) ? B(0) : W("next"));
          break;
        case "ArrowUp":
          var Ce;
          pe && ((Ce = $.current) === null || Ce === void 0 || Ce.focus(), te(), x.preventDefault(), ce(M) ? B(V - 1) : W("prev"));
          break;
        case "Tab":
          L && ee();
          break;
        default:
          var Ne;
          u != null && u.onKeyDown && (u == null || (Ne = u.onKeyDown) === null || Ne === void 0 || Ne.call(u, x)), ee();
      }
  }, onChange: function(x) {
    var F;
    X(x.target.value), u != null && u.onChange && (u == null || (F = u.onChange) === null || F === void 0 || F.call(u, x));
  }, onFocus: function(x) {
    H(!0), te();
  }, onBlur: function(x) {
    H(!1);
  }, ref: $ })), f.createElement("div", { className: Ta }, g && !R && f.createElement("div", { "data-testid": "lg-chat-hotkey-indicator", className: ne(Za, Xa[oe], A(A({}, qa, N), Ka, !N)) }, "/"), f.createElement(Ot, { size: "small", rightGlyph: f.createElement(Qa, { fill: zr(oe, R) }), type: "submit", disabled: $e(), className: ne(A({}, Ga, $e())) }, se && "Enter")))), pe && f.createElement(on, fe({ open: L, refEl: O, ref: E, footerSlot: l }, i), T)));
});
nt.displayName = "InputBar";
var Nr, Dr, Rr, Mr, Hr, eo = ["as", "children", "disabled", "className", "darkMode"], no = Zr(function(e, r) {
  var n, t = e.as, o = t === void 0 ? "li" : t, u = e.children, v = e.disabled, b = e.className;
  e.darkMode;
  var p = ln(e, eo), g = Ze(u), h = (n = p["aria-label"]) !== null && n !== void 0 ? n : p["aria-labelledby"] ? "" : g;
  return f.createElement(Te, fe({}, p, { as: o, ref: r, className: b, disabled: v, "aria-labelledby": p["aria-labelledby"], "aria-label": h }), f.createElement(Ur, { preserveIconSpace: !1 }, u));
}, "SuggestedPrompt");
no.displayName = "SuggestedPrompt";
var ro = A(A({}, j.Light, d(Nr || (Nr = P([`
    & + & {
      border-top: 1px solid `, `;
    }
  `])), s.gray.light2)), j.Dark, d(Dr || (Dr = P([`
    & + & {
      border-top: 1px solid `, `;
    }
  `])), s.gray.dark2)), to = d(Rr || (Rr = P([`
  padding-bottom: 0;
`]))), ao = A(A({}, j.Light, d(Mr || (Mr = P([`
    color: `, `;
  `])), s.gray.dark1)), j.Dark, d(Hr || (Hr = P([`
    color: `, `;
  `])), s.gray.base)), oo = ["children", "label"], io = function(e) {
  var r = e.children, n = e.label, t = ln(e, oo), o = gt(r, ["SuggestedPrompt", "SuggestedPrompts"]), u = Oe().theme;
  return f.createElement("div", { className: ro[u] }, f.createElement(Te, fe({ "aria-label": n, isInteractive: !1, className: to }, t), f.createElement(ht, { className: ao[u] }, n)), o);
};
io.displayName = "SuggestedPrompts";
const Ye = {
  chatbot_input_error_border: Ue`
    > div {
      > div {
        border-color: ${s.red.base} !important;
        border-width: 2px !important;
      }
    }
  `,
  suggested_prompts_menu: Ue`
    [data-testid="lg-search-input-popover"] {
      z-index: 1;
    }
  `,
  character_count: ({
    darkMode: e,
    isError: r
  }) => Ue`
    white-space: nowrap;
    color: ${r ? s.red.base : e ? s.gray.light2 : s.gray.dark2};
  `
}, wo = Xr(
  function({ children: r, hasError: n, ...t }, o) {
    return /* @__PURE__ */ Ir.jsxDEV(
      nt,
      {
        ref: o,
        className: Tr(
          Ye.suggested_prompts_menu,
          n ?? !1 ? Ye.chatbot_input_error_border : void 0
        ),
        shouldRenderGradient: !n,
        ...t,
        children: r
      },
      void 0,
      !1,
      {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBar.tsx",
        lineNumber: 49,
        columnNumber: 7
      },
      this
    );
  }
);
function ko({
  current: e,
  max: r,
  darkMode: n,
  className: t
}) {
  return /* @__PURE__ */ Ir.jsxDEV(
    mt,
    {
      className: Tr(
        Ye.character_count({
          darkMode: n,
          isError: e > r
        }),
        t
      ),
      children: `${e} / ${r}`
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBar.tsx",
      lineNumber: 78,
      columnNumber: 5
    },
    this
  );
}
function Co() {
  const { awaitingReply: e, chatbotName: r } = Lt();
  return e ? r ? `${r} is answering...` : "Answering..." : r ? `Ask ${r} a Question` : "Ask a Question";
}
export {
  ko as C,
  wo as I,
  Co as M,
  no as X,
  io as t
};
