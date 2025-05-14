import { a as Jo, j as re } from "./jsx-dev-runtime.js";
import { c as Xe } from "./Transition.js";
import { m as Qo, J as ei, H as ri, t as qr } from "./index4.js";
import { r as no, a as Ae, g as Wr, m as b, F as i, b as z, N as Q, T as pt, E as gt, d as ve, n as te, L as ir, j as Xr, k as oe, X as ao, y as ti, z as ni, v as bt, B as Cr, q as nr, V as Ir, w as oo, K as ai } from "./index2.js";
import k, { forwardRef as Qe, useState as hr, useRef as Vr, useEffect as oi } from "react";
import { o as ii } from "./index7.js";
import { b as si, g as li, q as ci } from "./index8.js";
import { l as ui } from "./X.js";
import { K as fi } from "./index9.js";
import { j as di, A as pi, K as gi } from "./index19.js";
import { p as bi, W as hi } from "./Warning.js";
import { H as vi } from "./index11.js";
import { C as mi } from "./InputBar.js";
import "react-dom";
import "./index3.js";
import "./index10.js";
import "./index5.js";
import "./index6.js";
import "./index12.js";
import "./useChatbotContext.js";
import "./ChatbotProvider.js";
var io = { exports: {} };
(function(e, r) {
  (function(t, n) {
    e.exports = n(k, no);
  })(Ae, function(t, n) {
    function a(d) {
      if (d && typeof d == "object" && "default" in d)
        return d;
      var v = /* @__PURE__ */ Object.create(null);
      return d && Object.keys(d).forEach(function($) {
        if ($ !== "default") {
          var j = Object.getOwnPropertyDescriptor(d, $);
          Object.defineProperty(v, $, j.get ? j : { enumerable: !0, get: function() {
            return d[$];
          } });
        }
      }), v.default = d, Object.freeze(v);
    }
    var l = a(t);
    function c(d) {
      var v = function($, j) {
        if (typeof $ != "object" || !$)
          return $;
        var F = $[Symbol.toPrimitive];
        if (F !== void 0) {
          var N = F.call($, j);
          if (typeof N != "object")
            return N;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String($);
      }(d, "string");
      return typeof v == "symbol" ? v : v + "";
    }
    function u(d, v, $) {
      return (v = c(v)) in d ? Object.defineProperty(d, v, { value: $, enumerable: !0, configurable: !0, writable: !0 }) : d[v] = $, d;
    }
    function f() {
      return f = Object.assign ? Object.assign.bind() : function(d) {
        for (var v = 1; v < arguments.length; v++) {
          var $ = arguments[v];
          for (var j in $)
            Object.prototype.hasOwnProperty.call($, j) && (d[j] = $[j]);
        }
        return d;
      }, f.apply(this, arguments);
    }
    function p(d, v) {
      if (d == null)
        return {};
      var $, j, F = function(G, q) {
        if (G == null)
          return {};
        var M, P, B = {}, K = Object.keys(G);
        for (P = 0; P < K.length; P++)
          M = K[P], q.indexOf(M) >= 0 || (B[M] = G[M]);
        return B;
      }(d, v);
      if (Object.getOwnPropertySymbols) {
        var N = Object.getOwnPropertySymbols(d);
        for (j = 0; j < N.length; j++)
          $ = N[j], v.indexOf($) >= 0 || Object.prototype.propertyIsEnumerable.call(d, $) && (F[$] = d[$]);
      }
      return F;
    }
    function m(d, v) {
      return v || (v = d.slice(0)), Object.freeze(Object.defineProperties(d, { raw: { value: Object.freeze(v) } }));
    }
    var y, O, S = { small: 14, default: 16, large: 20, xlarge: 24 }, R = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], T = function(d) {
      var v = d.className, $ = d.size, j = $ === void 0 ? 16 : $, F = d.title, N = d["aria-label"], G = d["aria-labelledby"], q = d.fill, M = d.role, P = M === void 0 ? "img" : M, B = p(d, R), K = n.css(y || (y = m([`
        color: `, `;
      `])), q), xe = n.css(O || (O = m([`
        flex-shrink: 0;
      `]))), we = function(ke, Z, J) {
        var se, de = J["aria-label"], pe = J["aria-labelledby"], le = J.title;
        switch (ke) {
          case "img":
            return de || pe || le ? u(u(u({}, "aria-labelledby", pe), "aria-label", de), "title", le) : { "aria-label": (se = Z, "".concat(se.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(P, "ThumbsDown", u(u({ title: F }, "aria-label", N), "aria-labelledby", G));
      return l.createElement("svg", f({ className: n.cx(u({}, K, q != null), xe, v), height: typeof j == "number" ? j : S[j], width: typeof j == "number" ? j : S[j], role: P }, we, B, { viewBox: "0 0 16 16" }), l.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8.01852 15C8.53023 15 8.99812 14.7199 9.22744 14.2764L11.728 9.43945C11.7542 9.38879 11.7773 9.33683 11.7972 9.28386C11.8277 9.28652 11.8584 9.28788 11.8896 9.28788L13.9843 9.28788C14.5453 9.28788 15 8.84694 15 8.30303L15 3.18182C15 2.6379 14.5453 2 13.9844 2L11.8896 2C11.6144 2 11 2 11 2C11 2 10.3639 2 9.85827 2L3.99311 2C3.02273 2 2.18787 2.66552 2.00017 3.5887L1.03904 8.31597C0.791531 9.53331 1.7524 10.6667 3.03198 10.6667L5.31958 10.6667L5.31958 12.3829C5.31958 13.8283 6.52794 15 8.01852 15ZM9.85827 8.66091L7.65371 12.9252C7.47137 12.8096 7.35088 12.6099 7.35088 12.3829L7.35088 10.0758C7.35088 9.31427 6.71427 8.69697 5.92897 8.69697L3.64387 8.69697C3.32769 8.69697 3.09089 8.40718 3.15389 8.09735L3.9117 4.37008C3.95907 4.1371 4.16394 3.9697 4.40168 3.9697L9.85827 3.9697L9.85827 8.66091Z", fill: "currentColor" }));
    };
    return T.displayName = "ThumbsDown", T.isGlyph = !0, T;
  });
})(io);
var yi = io.exports;
const $i = /* @__PURE__ */ Wr(yi);
var so = { exports: {} };
(function(e, r) {
  (function(t, n) {
    e.exports = n(k, no);
  })(Ae, function(t, n) {
    function a(d) {
      if (d && typeof d == "object" && "default" in d)
        return d;
      var v = /* @__PURE__ */ Object.create(null);
      return d && Object.keys(d).forEach(function($) {
        if ($ !== "default") {
          var j = Object.getOwnPropertyDescriptor(d, $);
          Object.defineProperty(v, $, j.get ? j : { enumerable: !0, get: function() {
            return d[$];
          } });
        }
      }), v.default = d, Object.freeze(v);
    }
    var l = a(t);
    function c(d) {
      var v = function($, j) {
        if (typeof $ != "object" || !$)
          return $;
        var F = $[Symbol.toPrimitive];
        if (F !== void 0) {
          var N = F.call($, j);
          if (typeof N != "object")
            return N;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String($);
      }(d, "string");
      return typeof v == "symbol" ? v : v + "";
    }
    function u(d, v, $) {
      return (v = c(v)) in d ? Object.defineProperty(d, v, { value: $, enumerable: !0, configurable: !0, writable: !0 }) : d[v] = $, d;
    }
    function f() {
      return f = Object.assign ? Object.assign.bind() : function(d) {
        for (var v = 1; v < arguments.length; v++) {
          var $ = arguments[v];
          for (var j in $)
            Object.prototype.hasOwnProperty.call($, j) && (d[j] = $[j]);
        }
        return d;
      }, f.apply(this, arguments);
    }
    function p(d, v) {
      if (d == null)
        return {};
      var $, j, F = function(G, q) {
        if (G == null)
          return {};
        var M, P, B = {}, K = Object.keys(G);
        for (P = 0; P < K.length; P++)
          M = K[P], q.indexOf(M) >= 0 || (B[M] = G[M]);
        return B;
      }(d, v);
      if (Object.getOwnPropertySymbols) {
        var N = Object.getOwnPropertySymbols(d);
        for (j = 0; j < N.length; j++)
          $ = N[j], v.indexOf($) >= 0 || Object.prototype.propertyIsEnumerable.call(d, $) && (F[$] = d[$]);
      }
      return F;
    }
    function m(d, v) {
      return v || (v = d.slice(0)), Object.freeze(Object.defineProperties(d, { raw: { value: Object.freeze(v) } }));
    }
    var y, O, S = { small: 14, default: 16, large: 20, xlarge: 24 }, R = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], T = function(d) {
      var v = d.className, $ = d.size, j = $ === void 0 ? 16 : $, F = d.title, N = d["aria-label"], G = d["aria-labelledby"], q = d.fill, M = d.role, P = M === void 0 ? "img" : M, B = p(d, R), K = n.css(y || (y = m([`
        color: `, `;
      `])), q), xe = n.css(O || (O = m([`
        flex-shrink: 0;
      `]))), we = function(ke, Z, J) {
        var se, de = J["aria-label"], pe = J["aria-labelledby"], le = J.title;
        switch (ke) {
          case "img":
            return de || pe || le ? u(u(u({}, "aria-labelledby", pe), "aria-label", de), "title", le) : { "aria-label": (se = Z, "".concat(se.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(P, "ThumbsUp", u(u({ title: F }, "aria-label", N), "aria-labelledby", G));
      return l.createElement("svg", f({ className: n.cx(u({}, K, q != null), xe, v), height: typeof j == "number" ? j : S[j], width: typeof j == "number" ? j : S[j], role: P }, we, B, { viewBox: "0 0 16 16" }), l.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M7.98148 1C7.46977 1 7.00188 1.28007 6.77256 1.72365L4.27198 6.56054C4.24579 6.61121 4.22269 6.66317 4.20275 6.71614C4.17234 6.71348 4.14155 6.71212 4.11043 6.71212H2.01565C1.45472 6.71212 1 7.15306 1 7.69697V12.8182C1 13.3621 1.45472 14 2.01565 14H4.11043C4.38564 14 5 14 5 14C5 14 5.63614 14 6.14173 14H12.0069C12.9773 14 13.8121 13.3345 13.9998 12.4113L14.961 7.68402C15.2085 6.46669 14.2476 5.33333 12.968 5.33333H10.6804V3.61709C10.6804 2.17171 9.47206 1 7.98148 1ZM6.14173 7.33909L8.34629 3.0748C8.52863 3.19038 8.64912 3.39009 8.64912 3.61709V5.92424C8.64912 6.68572 9.28573 7.30303 10.071 7.30303H12.3561C12.6723 7.30303 12.9091 7.59282 12.8461 7.90265L12.0883 11.6299C12.0409 11.8629 11.8361 12.0303 11.5983 12.0303L6.14173 12.0303V7.33909Z", fill: "currentColor" }));
    };
    return T.displayName = "ThumbsUp", T.isGlyph = !0, T;
  });
})(so);
var xi = so.exports;
const wi = /* @__PURE__ */ Wr(xi);
function ki(e) {
  var r = function(t, n) {
    if (typeof t != "object" || !t)
      return t;
    var a = t[Symbol.toPrimitive];
    if (a !== void 0) {
      var l = a.call(t, n);
      if (typeof l != "object")
        return l;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function Se(e, r, t) {
  return (r = ki(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function sr() {
  return sr = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    }
    return e;
  }, sr.apply(this, arguments);
}
function lo(e, r) {
  if (e == null)
    return {};
  var t, n, a = function(c, u) {
    if (c == null)
      return {};
    var f, p, m = {}, y = Object.keys(c);
    for (p = 0; p < y.length; p++)
      f = y[p], u.indexOf(f) >= 0 || (m[f] = c[f]);
    return m;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    for (n = 0; n < l.length; n++)
      t = l[n], r.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (a[t] = e[t]);
  }
  return a;
}
function ue(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
function Oi(e, r) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, n) {
    var a = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (a != null) {
      var l, c, u, f, p = [], m = !0, y = !1;
      try {
        if (u = (a = a.call(t)).next, n !== 0)
          for (; !(m = (l = u.call(a)).done) && (p.push(l.value), p.length !== n); m = !0)
            ;
      } catch (O) {
        y = !0, c = O;
      } finally {
        try {
          if (!m && a.return != null && (f = a.return(), Object(f) !== f))
            return;
        } finally {
          if (y)
            throw c;
        }
      }
      return p;
    }
  }(e, r) || function(t, n) {
    if (t) {
      if (typeof t == "string")
        return ht(t, n);
      var a = Object.prototype.toString.call(t).slice(8, -1);
      if (a === "Object" && t.constructor && (a = t.constructor.name), a === "Map" || a === "Set")
        return Array.from(t);
      if (a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))
        return ht(t, n);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function ht(e, r) {
  r > e.length && (r = e.length);
  for (var t = 0, n = new Array(r); t < r; t++)
    n[t] = e[t];
  return n;
}
var vt, mt, yt, $t, xt, wt, kt, Ot, jt, St, ji = Se(Se({}, z.Dark, b(vt || (vt = ue([`
    border-color: `, `;
    background: `, `;
    &:hover {
      border-color: `, `;
      background: `, `;
      box-shadow: none;
    }
  `])), i.white, i.gray.light2, i.white, i.gray.light2)), z.Light, b(mt || (mt = ue([`
    background: `, `;
    &:hover {
      background: `, `; // override default hover
      box-shadow: none;
    }
    &:focus-visible {
      box-shadow: none;
    }
  `])), i.black, i.black)), Si = b(yt || (yt = ue([`
  overflow: hidden; // for ripple
  display: flex;
  height: 22px; // Matches X-Small Button height
  justify-content: center;
  align-items: center;
  gap: `, `px;
  flex-shrink: 0;
  align-self: stretch;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  z-index: 0;
  border: 1px solid;
`])), Q[150]), _i = Se(Se({}, z.Dark, b($t || ($t = ue([`
    border: 1px solid `, `;
    background: `, `;
    &:hover {
      box-shadow: `, `;
      background: `, `;
    }
    &:focus-visible {
      box-shadow: `, `;
      background: `, `;
    }
  `])), i.gray.dark1, i.gray.dark2, pt.dark.gray, i.gray.dark1, gt.dark.default, i.gray.dark1)), z.Light, b(xt || (xt = ue([`
    border: 1px solid `, `;
    background: `, `;
    &:hover {
      box-shadow: `, `;
    }
    &:focus-visible {
      box-shadow: `, `;
    }
  `])), i.gray.dark1, i.gray.light3, pt.light.gray, gt.light.default)), Pi = b(wt || (wt = ue([`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: `, "px ", `px;
  height: 100%;
  cursor: pointer;
`])), Q[100], Q[200]);
b(kt || (kt = ue([`
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 5px;
`])));
var Ti = ["id", "className", "name", "children", "darkMode", "checked"], Dr = Qe(function(e, r) {
  var t = e.id, n = e.className, a = e.name, l = e.children, c = e.darkMode, u = e.checked, f = lo(e, Ti), p = ve(c).theme;
  return k.createElement("div", { className: te(Si, _i[p], Se({}, ji[p], u), n), ref: r, tabIndex: 0 }, k.createElement("input", sr({ id: t, type: "radio", name: a, defaultChecked: u, "aria-checked": u, hidden: !0 }, f)), k.createElement("label", { htmlFor: t, className: Pi }, l));
});
Dr.displayName = "RadioButton";
var Fi = b(Ot || (Ot = ue([`
  display: flex;
  align-items: center;
  gap: `, `px;
`])), Q[200]), Ci = b(jt || (jt = ue([`
  display: flex;
  align-items: center;
  gap: `, `px;
`])), Q[100]), _t = function(e, r) {
  return e ? r ? i.black : i.gray.light2 : r ? i.gray.light3 : i.gray.dark1;
}, Pt = b(St || (St = ue([`
  display: none;
`]))), Ii = ["description", "className", "value", "onChange", "darkMode", "hideThumbsDown", "hideThumbsUp"], co = Qe(function(e, r) {
  var t = e.description, n = t === void 0 ? "How was the response?" : t, a = e.className, l = e.value, c = e.onChange, u = e.darkMode, f = e.hideThumbsDown, p = e.hideThumbsUp, m = lo(e, Ii), y = l !== void 0, O = Oi(hr(), 2), S = O[0], R = O[1], T = ve(u).darkMode, d = y ? l === "liked" : S === "liked", v = y ? l === "disliked" : S === "disliked", $ = ir({ prefix: "message-rating" }), j = function(F) {
    c(F), y || R(F.target.value);
  };
  return k.createElement(Xr, { darkMode: T }, k.createElement("div", sr({ className: te(Fi, a) }, m, { ref: r }), k.createElement(Qo, null, n), k.createElement("div", { className: Ci }, k.createElement(Dr, { id: "like-".concat($), "aria-label": "Thumbs up this message", name: $, value: "liked", onChange: j, checked: d, className: te(Se({}, Pt, p)) }, k.createElement(wi, { fill: _t(T, d) })), k.createElement(Dr, { id: "dislike-".concat($), name: $, value: "disliked", "aria-label": "Thumbs down this message", onChange: j, checked: v, className: te(Se({}, Pt, f)) }, k.createElement($i, { fill: _t(T, v) })))));
});
co.displayName = "MessageRating";
function Ve() {
  return Ve = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    }
    return e;
  }, Ve.apply(this, arguments);
}
function Di(e, r) {
  if (e == null)
    return {};
  var t, n, a = function(c, u) {
    if (c == null)
      return {};
    var f, p, m = {}, y = Object.keys(c);
    for (p = 0; p < y.length; p++)
      f = y[p], u.indexOf(f) >= 0 || (m[f] = c[f]);
    return m;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    for (n = 0; n < l.length; n++)
      t = l[n], r.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (a[t] = e[t]);
  }
  return a;
}
var Ei = ["as"];
function uo(e, r) {
  if (e.as != null) {
    var t = e.as, n = Di(e, Ei);
    return k.createElement(t, Ve({}, n, { ref: r }));
  }
  return e.href != null ? k.createElement("a", Ve({}, e, { ref: r })) : k.createElement("div", Ve({}, e, { ref: r }));
}
uo.displayName = "InlineBox";
var fo = k.forwardRef(uo);
fo.displayName = "Box";
var Ai = fo;
function lr(e) {
  return lr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, lr(e);
}
function Ni(e, r) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, n) {
    var a = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (a != null) {
      var l, c, u, f, p = [], m = !0, y = !1;
      try {
        if (u = (a = a.call(t)).next, n === 0) {
          if (Object(a) !== a)
            return;
          m = !1;
        } else
          for (; !(m = (l = u.call(a)).done) && (p.push(l.value), p.length !== n); m = !0)
            ;
      } catch (O) {
        y = !0, c = O;
      } finally {
        try {
          if (!m && a.return != null && (f = a.return(), Object(f) !== f))
            return;
        } finally {
          if (y)
            throw c;
        }
      }
      return p;
    }
  }(e, r) || function(t, n) {
    if (t) {
      if (typeof t == "string")
        return Tt(t, n);
      var a = Object.prototype.toString.call(t).slice(8, -1);
      if (a === "Object" && t.constructor && (a = t.constructor.name), a === "Map" || a === "Set")
        return Array.from(t);
      if (a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))
        return Tt(t, n);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function Tt(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, n = new Array(r); t < r; t++)
    n[t] = e[t];
  return n;
}
var Er = "data-lgid", po = function() {
  for (var e = arguments.length, r = new Array(e), t = 0; t < e; t++)
    r[t] = arguments[t];
  return function(n) {
    if (!n || typeof n.querySelector != "function" || typeof n.querySelectorAll != "function")
      throw new TypeError("Expected container to be an Element, a Document or a DocumentFragment but got ".concat((a = n, lr(a) === "object" ? a === null ? "null" : a.constructor.name : lr(a)), "."));
    var a;
  }(r[0]), ci.apply(void 0, [Er].concat(r));
}, er = Ni(si(po, function(e, r) {
  return "Found multiple elements by: [".concat(Er, '="').concat(r, '"]');
}, function(e, r) {
  return "Unable to find an element by: [".concat(Er, '="').concat(r, '"]');
}), 5), Mi = er[0], Bi = er[1], Hi = er[2], Li = er[3], zi = er[4], Ri = Object.freeze({ __proto__: null, findAllByTestId: Li, findByTestId: zi, getAllByTestId: Bi, getByTestId: Hi, queryAllByTestId: po, queryByTestId: Mi }), go = function() {
  var e = function() {
    if (typeof window < "u")
      return window.document;
  }();
  if (!e)
    return { findByLgId: void 0, getByLgId: void 0, queryByLgId: void 0 };
  var r = li(e.body, Ri);
  return { findByLgId: r.findByTestId, getByLgId: r.getByTestId, queryByLgId: r.queryByTestId };
}();
go.findByLgId;
go.getByLgId;
function Ft(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    r && (n = n.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), t.push.apply(t, n);
  }
  return t;
}
function cr(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? Ft(Object(t), !0).forEach(function(n) {
      g(e, n, t[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : Ft(Object(t)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
    });
  }
  return e;
}
function Gi(e) {
  var r = function(t, n) {
    if (typeof t != "object" || !t)
      return t;
    var a = t[Symbol.toPrimitive];
    if (a !== void 0) {
      var l = a.call(t, n);
      if (typeof l != "object")
        return l;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function g(e, r, t) {
  return (r = Gi(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function Ye() {
  return Ye = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    }
    return e;
  }, Ye.apply(this, arguments);
}
function Ui(e, r) {
  if (e == null)
    return {};
  var t, n, a = function(c, u) {
    if (c == null)
      return {};
    var f, p, m = {}, y = Object.keys(c);
    for (p = 0; p < y.length; p++)
      f = y[p], u.indexOf(f) >= 0 || (m[f] = c[f]);
    return m;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    for (n = 0; n < l.length; n++)
      t = l[n], r.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (a[t] = e[t]);
  }
  return a;
}
function h(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
var Ct, It, Dt, Et, At, Nt, Mt, Bt, Ht, Lt, zt, Rt, Gt, Ut, Kt, qt, Wt, Xt, Vt, Yt, Zt, Jt, Qt, en, rn, tn, nn, an, on, sn, ln, cn, un, fn, dn, pn, gn, bn, hn, vn, mn, yn, $n, xn, x = { Default: "default", Primary: "primary", PrimaryOutline: "primaryOutline", Danger: "danger", DangerOutline: "dangerOutline", BaseGreen: "baseGreen" }, U = { XSmall: "xsmall", Small: "small", Default: "default", Large: "large" }, ar = 0.76, Ki = g(g({}, z.Light, g(g(g(g(g(g({}, x.Default, i.gray.light2), x.Primary, i.green.dark1), x.PrimaryOutline, oe(ar, i.green.base)), x.Danger, i.red.light1), x.DangerOutline, oe(ar, i.red.base)), x.BaseGreen, i.green.light1)), z.Dark, g(g(g(g(g(g({}, x.Default, i.gray.base), x.Primary, i.green.dark1), x.PrimaryOutline, oe(ar, i.green.base)), x.Danger, i.red.dark2), x.DangerOutline, oe(ar, i.red.light1)), x.BaseGreen, i.green.dark1)), qi = b(Ct || (Ct = h([`
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 5px;
`]))), Wi = b(It || (It = h([`
  justify-content: space-between;
`]))), bo = b(Dt || (Dt = h([`
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
`])), ao.default), ho = g(g(g(g({}, U.XSmall, b(Et || (Et = h([`
    padding: 0 7px; // 8px - 1px border
    gap: 6px;
  `])))), U.Small, b(At || (At = h([`
    padding: 0 11px; // 12px - 1px border
    gap: 6px;
  `])))), U.Default, b(Nt || (Nt = h([`
    padding: 0 11px; // 12px - 1px border
    gap: 6px;
  `])))), U.Large, b(Mt || (Mt = h([`
    padding: 0 15px; // 16px - 1px border
    gap: 8px;
  `])))), Xi = b(Bt || (Bt = h([`
  position: absolute;
`]))), Vi = b(Ht || (Ht = h([`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`]))), Yi = g(g(g(g({}, U.XSmall, 16), U.Small, 16), U.Default, 16), U.Large, 20), Zi = g(g({}, z.Dark, i.gray.light1), z.Light, i.gray.dark1), Ji = b(Lt || (Lt = h([`
  visibility: hidden;
`]))), Qi = b(zt || (zt = h([`
  justify-self: right;
`]))), es = b(Rt || (Rt = h([`
  justify-self: left;
`]))), vo = ti("button"), rs = g(g({}, z.Light, g(g(g(g(g(g({}, x.Default, b(Gt || (Gt = h([`
      color: `, `;
    `])), i.gray.base)), x.Primary, b(Ut || (Ut = h([`
      color: `, `;
    `])), i.green.light2)), x.PrimaryOutline, b(Kt || (Kt = h([`
      color: `, `;
    `])), i.green.dark2)), x.Danger, b(qt || (qt = h([`
      color: `, `;
    `])), i.red.light3)), x.DangerOutline, b(Wt || (Wt = h([`
      color: `, `;
    `])), i.red.light1)), x.BaseGreen, b(Xt || (Xt = h([`
      color: `, `;
    `])), i.green.dark2))), z.Dark, g(g(g(g(g(g({}, x.Default, b(Vt || (Vt = h([`
      color: `, `;
    `])), i.gray.light2)), x.Primary, b(Yt || (Yt = h([`
      color: `, `;
    `])), i.green.light2)), x.PrimaryOutline, b(Zt || (Zt = h([`
      color: `, `;
    `])), i.green.base)), x.Danger, b(Jt || (Jt = h([`
      color: `, `;
    `])), i.red.light2)), x.DangerOutline, b(Qt || (Qt = h([`
      color: `, `;
    `])), i.red.light1)), x.BaseGreen, b(en || (en = h([`
      color: `, `;
    `])), i.green.dark2))), ts = g(g({}, z.Light, g(g(g(g(g(g({}, x.Default, b(rn || (rn = h([`
      color: `, `;
    `])), i.black)), x.Primary, b(tn || (tn = h([`
      color: `, `;
    `])), i.white)), x.PrimaryOutline, b(nn || (nn = h([`
      color: `, `;
    `])), i.green.dark2)), x.Danger, b(an || (an = h([`
      color: `, `;
    `])), i.white)), x.DangerOutline, b(on || (on = h([`
      color: `, `;
    `])), i.red.base)), x.BaseGreen, b(sn || (sn = h([`
      color: `, `;
    `])), i.green.dark3))), z.Dark, g(g(g(g(g(g({}, x.Default, b(ln || (ln = h([`
      color: `, `;
    `])), i.white)), x.Primary, b(cn || (cn = h([`
      color: `, `;
    `])), i.white)), x.PrimaryOutline, b(un || (un = h([`
      color: `, `;
    `])), i.green.base)), x.Danger, b(fn || (fn = h([`
      color: `, `;
    `])), i.white)), x.DangerOutline, b(dn || (dn = h([`
      color: `, `;
    `])), i.red.light1)), x.BaseGreen, b(pn || (pn = h([`
      color: `, `;
    `])), i.green.dark3))), ns = b(gn || (gn = h([`
  .`, ` {
    &:hover,
    &:active {
      color: currentColor;
    }
  }
`])), vo), as = g(g(g(g({}, U.XSmall, b(bn || (bn = h([`
    height: 14px;
    width: 14px;
  `])))), U.Small, b(hn || (hn = h([`
    height: 16px;
    width: 16px;
  `])))), U.Default, b(vn || (vn = h([`
    height: 16px;
    width: 16px;
  `])))), U.Large, b(mn || (mn = h([`
    height: 20px;
    width: 20px;
  `])))), os = g(g({}, z.Light, b(yn || (yn = h([`
    color: `, `;
  `])), i.gray.base)), z.Dark, b($n || ($n = h([`
    color: `, `;
  `])), i.gray.dark1)), is = b(xn || (xn = h([`
  color: `, `;
`])), i.gray.dark1);
function Ar(e) {
  var r = e.glyph, t = e.variant, n = e.size, a = e.darkMode, l = e.disabled, c = e.isIconOnlyButton, u = e.className, f = !c && { "aria-hidden": !0, role: "presentation" }, p = oo(a), m = c ? ts : rs;
  return k.cloneElement(r, cr({ className: te(m[p][t], as[n], g(g(g({}, ns, c), os[p], l), is, l && c && a), u) }, f));
}
Ar.displayName = "ButtonIcon";
var wn, kn, On, jn, Sn, _n, Pn, Tn, Fn, Cn, In, Dn, En, An, Nn, Mn, Bn, Hn, Ln, zn, Rn, Gn, Un, Kn, qn, Wn, Xn, Vn, Yn, Zn, Jn, Qn, ea, ra = function(e) {
  var r, t = e.leftGlyph, n = e.rightGlyph, a = e.className, l = e.children, c = e.variant, u = e.size, f = e.darkMode, p = { variant: c, size: u, darkMode: f, disabled: e.disabled, isIconOnlyButton: (r = (t || n) && !l) !== null && r !== void 0 && r };
  return k.createElement("div", { className: te(bo, ho[u], g({}, Wi, !!n && f), a) }, t && k.createElement(Ar, Ye({ glyph: t, className: Qi }, p)), l, n && k.createElement(Ar, Ye({ glyph: n, className: es }, p)));
}, ss = function(e) {
  var r, t = e.darkMode, n = e.disabled, a = e.variant, l = e.size, c = e.isLoading, u = e.loadingText, f = e.loadingIndicator, p = e.className, m = ve(t), y = m.darkMode, O = m.theme, S = Vr(null);
  oi(function() {
    var T, d = Ki[O][a];
    return S.current == null || n || (T = ii(S.current, { backgroundColor: d })), T;
  }, [S, a, y, n, O]);
  var R = f && k.cloneElement(f, cr(cr({}, f.props), {}, g({ className: te(g({}, Vi, !u), (r = f.props) === null || r === void 0 ? void 0 : r.className), sizeOverride: Yi[l], colorOverride: Zi[O] }, "data-testid", "lg-button-spinner")));
  return c ? k.createElement(k.Fragment, null, k.createElement("div", { className: te(bo, ho[l], g({}, Xi, !u)) }, R, u), !u && k.createElement(ra, Ye({}, e, { className: te(Ji, p) }))) : k.createElement(k.Fragment, null, k.createElement("div", { className: qi, ref: S }), k.createElement(ra, e));
}, ls = "lg-button", I = '&:focus-visible, &[data-focus="true"]', X = '&:hover, &[data-hover="true"]', W = '&:active, &[data-active="true"]', V = function(e) {
  return `
    0 0 0 2px `.concat(e, `, 
    0 0 0 4px `).concat(i.blue.light1, `;
`);
}, cs = b(wn || (wn = h([`
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
`])), ao.default, ni.default, I, W), us = g(g({}, z.Light, g(g(g(g(g(g({}, x.Default, b(kn || (kn = h([`
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
    `])), i.gray.light3, i.gray.base, i.black, I, i.black, X, W, i.black, i.white, i.gray.light2)), x.Primary, b(On || (On = h([`
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
    `])), i.green.dark2, i.green.dark2, i.white, I, i.white, X, W, i.white, i.green.light2)), x.PrimaryOutline, b(jn || (jn = h([`
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
    `])), i.green.dark2, i.green.dark2, I, i.green.dark2, X, W, i.green.dark2, oe(0.96, i.green.base), i.green.light2)), x.Danger, b(Sn || (Sn = h([`
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
    `])), i.red.base, i.red.base, i.white, I, i.white, X, W, i.white, i.red.light3)), x.DangerOutline, b(_n || (_n = h([`
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
    `])), i.red.light1, i.red.base, I, i.red.base, X, W, i.red.dark2, oe(0.96, i.red.base), i.red.base, i.red.light3)), x.BaseGreen, b(Pn || (Pn = h([`
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
    `])), i.green.base, i.green.dark2, i.green.dark3, I, i.green.dark3, X, W, i.green.dark3, bt(0.96, i.green.base, i.green.dark3), i.green.light2))), z.Dark, g(g(g(g(g(g({}, x.Default, b(Tn || (Tn = h([`
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
    `])), i.gray.dark2, i.gray.base, i.white, I, i.white, X, W, i.gray.dark1, i.gray.base, i.white, i.gray.dark2)), x.Primary, b(Fn || (Fn = h([`
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
    `])), i.green.dark2, i.green.base, i.white, I, i.white, X, W, i.white, i.green.dark3)), x.PrimaryOutline, b(Cn || (Cn = h([`
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
    `])), i.green.base, i.green.base, I, i.green.base, X, W, i.green.base, oe(0.96, i.green.base), i.green.base, i.green.dark3)), x.Danger, b(In || (In = h([`
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
    `])), i.red.base, i.red.light1, i.white, I, i.white, X, W, i.red.light1, i.white, i.yellow.dark3)), x.DangerOutline, b(Dn || (Dn = h([`
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
    `])), i.red.light1, i.red.light1, I, i.red.light1, X, W, i.red.light1, oe(0.96, i.red.base), i.yellow.dark3)), x.BaseGreen, b(En || (En = h([`
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
    `])), i.green.base, i.green.dark2, i.green.dark3, I, i.green.dark3, X, W, i.green.dark3, bt(0.96, i.green.base, i.green.light3), i.green.dark2, i.green.dark3))), fs = g(g({}, z.Light, g(g(g(g(g(g({}, x.Default, b(An || (An = h([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), I, i.white, V(i.white))), x.Primary, b(Nn || (Nn = h([`
      `, ` {
        color: `, `;
        background-color: #00593f; // Not quite dark3
        box-shadow: `, `;
      }
    `])), I, i.white, V(i.white))), x.PrimaryOutline, b(Mn || (Mn = h([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), I, oe(0.96, i.green.base), V(i.white))), x.Danger, b(Bn || (Bn = h([`
      `, ` {
        color: `, `;
        background-color: #c82222; // not quite dark1
        box-shadow: `, `;
      }
    `])), I, i.white, V(i.white))), x.DangerOutline, b(Hn || (Hn = h([`
      `, ` {
        color: `, `;
        box-shadow: `, `;
      }
    `])), I, i.red.dark2, V(i.white))), x.BaseGreen, b(Ln || (Ln = h([`
      `, ` {
        box-shadow: `, `;
      }
    `])), I, V(i.white)))), z.Dark, g(g(g(g(g(g({}, x.Default, b(zn || (zn = h([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), I, i.gray.dark1, V(i.black))), x.Primary, b(Rn || (Rn = h([`
      `, ` {
        background-color: #00593f; // Off palette
        box-shadow: `, `;
      }
    `])), I, V(i.black))), x.PrimaryOutline, b(Gn || (Gn = h([`
      `, ` {
        background-color: `, `;
        border-color: `, `;
        box-shadow: `, `;
      }
    `])), I, oe(0.96, i.green.base), i.green.base, V(i.black))), x.Danger, b(Un || (Un = h([`
      `, ` {
        background-color: #c82222; // Off palette
        box-shadow: `, `;
      }
    `])), I, V(i.black))), x.DangerOutline, b(Kn || (Kn = h([`
      `, ` {
        background-color: `, `;
        border-color: `, `;
        box-shadow: `, `;
      }
    `])), I, oe(0.96, i.red.base), i.red.light1, V(i.black))), x.BaseGreen, b(qn || (qn = h([`
      `, ` {
        background-color: `, `;
        box-shadow: `, `;
      }
    `])), I, i.green.base, V(i.black)))), ds = g(g({}, z.Light, b(Wn || (Wn = h([`
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
  `])), X, W, i.gray.light2, i.gray.light1, i.gray.base, I, i.gray.base, V(i.white))), z.Dark, b(Xn || (Xn = h([`
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
  `])), X, W, i.gray.dark3, i.gray.dark2, i.gray.dark1, I, i.gray.dark1, V(i.black))), ps = g(g(g(g({}, U.XSmall, b(Vn || (Vn = h([`
    height: 22px;
    text-transform: uppercase;
    font-size: 12px;
    line-height: 1em;
    font-weight: `, `;
    letter-spacing: 0.4px;
  `])), Cr.bold)), U.Small, b(Yn || (Yn = h([`
    height: 28px;
  `])))), U.Default, b(Zn || (Zn = h([`
    height: 36px;
  `])))), U.Large, b(Jn || (Jn = h([`
    height: 48px;
    font-size: 18px;
    line-height: 24px;
  `])))), gs = g(g({}, Ir.Body1, b(Qn || (Qn = h([`
    font-size: `, `px;
    line-height: `, `px;
    font-weight: `, `;
  `])), nr.body1.fontSize, nr.body1.lineHeight, Cr.medium)), Ir.Body2, b(ea || (ea = h([`
    font-size: `, `px;
    line-height: `, `px;
    // Pixel pushing for optical alignment purposes
    transform: translateY(1px);
    font-weight: `, `;
  `])), nr.body2.fontSize, nr.body2.lineHeight, Cr.medium)), bs = ["variant", "size", "darkMode", "data-lgid", "baseFontSize", "disabled", "onClick", "leftGlyph", "rightGlyph", "children", "className", "as", "type", "isLoading", "loadingIndicator", "loadingText"], Nr = k.forwardRef(function(e, r) {
  var t = e.variant, n = t === void 0 ? x.Default : t, a = e.size, l = a === void 0 ? U.Default : a, c = e.darkMode, u = e["data-lgid"], f = u === void 0 ? ls : u, p = e.baseFontSize, m = p === void 0 ? Ir.Body1 : p, y = e.disabled, O = y !== void 0 && y, S = e.onClick, R = e.leftGlyph, T = e.rightGlyph, d = e.children, v = e.className, $ = e.as, j = e.type, F = e.isLoading, N = F !== void 0 && F, G = e.loadingIndicator, q = e.loadingText, M = Ui(e, bs), P = ve(c).darkMode, B = !(!M.href && $ !== "a" || O), K = !(O || N), xe = function(Z) {
    var J = Z.variant, se = Z.size, de = Z.darkMode, pe = Z.baseFontSize, le = Z.disabled, Fe = oo(de), Or = us[Fe][J], jr = fs[Fe][J], ge = ps[se], Zo = gs[pe];
    return te(cs, Or, Zo, ge, g({}, jr, !le), g({}, ds[Fe], le));
  }({ variant: n, size: l, darkMode: P, baseFontSize: m, disabled: !K }), we = cr({ "data-lgid": f, type: B ? void 0 : j || "button", className: te(vo, xe, v), ref: r, as: $ || (B ? "a" : "button"), "aria-disabled": !K, onClick: K ? S : function(Z) {
    return Z.preventDefault();
  }, href: K ? M.href : void 0 }, M), ke = { rightGlyph: T, leftGlyph: R, darkMode: P, disabled: O, variant: n, size: l, isLoading: N, loadingIndicator: G, loadingText: q };
  return k.createElement(Ai, we, k.createElement(ss, ke, d));
});
Nr.displayName = "Button";
function ta(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    r && (n = n.filter(function(a) {
      return Object.getOwnPropertyDescriptor(e, a).enumerable;
    })), t.push.apply(t, n);
  }
  return t;
}
function na(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? ta(Object(t), !0).forEach(function(n) {
      vs(e, n, t[n]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ta(Object(t)).forEach(function(n) {
      Object.defineProperty(e, n, Object.getOwnPropertyDescriptor(t, n));
    });
  }
  return e;
}
function hs(e) {
  var r = function(t, n) {
    if (typeof t != "object" || !t)
      return t;
    var a = t[Symbol.toPrimitive];
    if (a !== void 0) {
      var l = a.call(t, n);
      if (typeof l != "object")
        return l;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function vs(e, r, t) {
  return (r = hs(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function ms(e, r) {
  if (e == null)
    return {};
  var t, n, a = function(c, u) {
    if (c == null)
      return {};
    var f, p, m = {}, y = Object.keys(c);
    for (p = 0; p < y.length; p++)
      f = y[p], u.indexOf(f) >= 0 || (m[f] = c[f]);
    return m;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    for (n = 0; n < l.length; n++)
      t = l[n], r.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (a[t] = e[t]);
  }
  return a;
}
function mo(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
function ys(e, r) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, n) {
    var a = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (a != null) {
      var l, c, u, f, p = [], m = !0, y = !1;
      try {
        if (u = (a = a.call(t)).next, n !== 0)
          for (; !(m = (l = u.call(a)).done) && (p.push(l.value), p.length !== n); m = !0)
            ;
      } catch (O) {
        y = !0, c = O;
      } finally {
        try {
          if (!m && a.return != null && (f = a.return(), Object(f) !== f))
            return;
        } finally {
          if (y)
            throw c;
        }
      }
      return p;
    }
  }(e, r) || function(t, n) {
    if (t) {
      if (typeof t == "string")
        return aa(t, n);
      var a = Object.prototype.toString.call(t).slice(8, -1);
      if (a === "Object" && t.constructor && (a = t.constructor.name), a === "Map" || a === "Set")
        return Array.from(t);
      if (a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))
        return aa(t, n);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function aa(e, r) {
  r > e.length && (r = e.length);
  for (var t = 0, n = new Array(r); t < r; t++)
    n[t] = e[t];
  return n;
}
var oa, ia, $s = "lg-text_area", xs = b(oa || (oa = mo([`
  height: auto;
  display: flex;
  padding: 0;
`]))), ws = b(ia || (ia = mo([`
  width: 100%;
  min-height: `, `px;
  display: flex;
  resize: none;
  padding: `, "px ", `px;
`])), 64, Q[200], Q[300]), ks = gi, Os = ["readOnly", "label", "description", "className", "errorMessage", "successMessage", "darkMode", "disabled", "state", "id", "value", "onChange", "onBlur", "handleValidation", "aria-label", "aria-labelledby", "aria-invalid", "baseFontSize", "data-lgid", "defaultValue"], yo = Qe(function(e, r) {
  var t = e.readOnly, n = e.label, a = e.description, l = e.className, c = e.errorMessage, u = c === void 0 ? "This input needs your attention" : c, f = e.successMessage, p = f === void 0 ? "Success" : f, m = e.darkMode, y = e.disabled, O = y !== void 0 && y, S = e.state, R = S === void 0 ? ks.None : S, T = e.id, d = e.value, v = e.onChange, $ = e.onBlur, j = e.handleValidation, F = e["aria-label"], N = e["aria-labelledby"], G = e["aria-invalid"], q = e.baseFontSize, M = e["data-lgid"], P = M === void 0 ? $s : M, B = e.defaultValue, K = B === void 0 ? "" : B, xe = ms(e, Os), we = ei(q), ke = ir({ prefix: "textarea", id: T }), Z = ve(m).darkMode, J = typeof d == "string", se = ys(hr(K), 2), de = se[0], pe = se[1], le = J ? d : de, Fe = ai(j);
  n || N || console.error("For screen-reader accessibility, label or aria-labelledby must be provided to TextArea.");
  var Or = na({ baseFontSize: we, className: l, darkMode: Z, "data-lgid": P, description: a, disabled: O, errorMessage: u, id: ke, label: n, state: R, successMessage: p, readOnly: t }, { "aria-invalid": G, "aria-label": F, "aria-labelledby": N }), jr = na({ className: ws, onBlur: function(ge) {
    $ && $(ge), Fe.onBlur(ge);
  }, onChange: function(ge) {
    v && v(ge), J || pe(ge.target.value), Fe.onChange(ge);
  }, ref: r, title: n ?? void 0, value: le }, xe);
  return k.createElement(di, Or, k.createElement(pi, { className: xs }, k.createElement("textarea", jr)));
});
yo.displayName = "TextArea";
function js(e) {
  var r = function(t, n) {
    if (typeof t != "object" || !t)
      return t;
    var a = t[Symbol.toPrimitive];
    if (a !== void 0) {
      var l = a.call(t, n);
      if (typeof l != "object")
        return l;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function sa(e, r, t) {
  return (r = js(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function Ne() {
  return Ne = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    }
    return e;
  }, Ne.apply(this, arguments);
}
function Ss(e, r) {
  if (e == null)
    return {};
  var t, n, a = function(c, u) {
    if (c == null)
      return {};
    var f, p, m = {}, y = Object.keys(c);
    for (p = 0; p < y.length; p++)
      f = y[p], u.indexOf(f) >= 0 || (m[f] = c[f]);
    return m;
  }(e, r);
  if (Object.getOwnPropertySymbols) {
    var l = Object.getOwnPropertySymbols(e);
    for (n = 0; n < l.length; n++)
      t = l[n], r.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (a[t] = e[t]);
  }
  return a;
}
function ie(e, r) {
  return r || (r = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(r) } }));
}
function _s(e, r) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, n) {
    var a = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (a != null) {
      var l, c, u, f, p = [], m = !0, y = !1;
      try {
        if (u = (a = a.call(t)).next, n !== 0)
          for (; !(m = (l = u.call(a)).done) && (p.push(l.value), p.length !== n); m = !0)
            ;
      } catch (O) {
        y = !0, c = O;
      } finally {
        try {
          if (!m && a.return != null && (f = a.return(), Object(f) !== f))
            return;
        } finally {
          if (y)
            throw c;
        }
      }
      return p;
    }
  }(e, r) || function(t, n) {
    if (t) {
      if (typeof t == "string")
        return la(t, n);
      var a = Object.prototype.toString.call(t).slice(8, -1);
      if (a === "Object" && t.constructor && (a = t.constructor.name), a === "Map" || a === "Set")
        return Array.from(t);
      if (a === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a))
        return la(t, n);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function la(e, r) {
  r > e.length && (r = e.length);
  for (var t = 0, n = new Array(r); t < r; t++)
    n[t] = e[t];
  return n;
}
var ca, ua, fa, da, pa, ga, ba, ha, va, ma, ya, Ps = b(ca || (ca = ie([`
  display: flex;
  gap: `, `px;
  align-items: center;
`])), Q[1]), Ts = b(ua || (ua = ie([`
  color: `, `;
`])), i.gray.dark1), Fs = function(e) {
  var r = e.submittedMessage;
  return k.createElement("div", { className: Ps }, k.createElement(bi, { color: i.green.dark1 }), k.createElement(qr, { className: Ts }, r));
}, Cs = b(fa || (fa = ie([`
  width: 100%;
`]))), Is = b(da || (da = ie([`
  display: flex;
  justify-content: end;
`]))), Ds = b(pa || (pa = ie([`
  flex: 1;
  padding-top: 3px; // to match icon button padding
`]))), Es = b(ga || (ga = ie([`
  margin-top: `, `px;
`])), Q[100]), As = b(ba || (ba = ie([`
  margin-top: `, `px;
  display: flex;
  gap: `, `px;
  justify-content: end;
`])), Q[200], Q[2]), Yr = Qe(function(e, r) {
  var t = e.label, n = e.cancelButtonText, a = n === void 0 ? "Cancel" : n, l = e.onCancel, c = e.cancelButtonProps, u = e.submitButtonText, f = u === void 0 ? "Submit" : u, p = e.submitButtonProps, m = e.isSubmitted, y = e.submittedMessage, O = y === void 0 ? "Submitted! Thanks for your feedback." : y, S = e.onSubmit, R = e.darkMode, T = e.onClose, d = e.textareaProps, v = ve(R).darkMode, $ = ir({ prefix: "lg-chat-imf-input" }), j = ir({ prefix: "lg-chat-imf-label" }), F = Vr(null), N = function() {
    var P, B;
    return ((d == null ? void 0 : d.value) === void 0 || (d == null ? void 0 : d.value.length) < 1) && ((F == null || (P = F.current) === null || P === void 0 ? void 0 : P.value) === void 0 || (F == null || (B = F.current) === null || B === void 0 ? void 0 : B.value.length) < 1);
  }, G = _s(hr(N()), 2), q = G[0], M = G[1];
  return k.createElement(Xr, { darkMode: v }, k.createElement("div", { ref: r }, m ? k.createElement(Fs, { submittedMessage: O }) : k.createElement("form", { className: Cs, onSubmit: function(P) {
    P.preventDefault(), S == null || S(P);
  } }, k.createElement("div", { className: Is }, k.createElement(ri, { id: j, className: Ds }, t), T && k.createElement(fi, { "aria-label": "Close feedback window", onClick: T }, k.createElement(ui, null))), k.createElement(yo, Ne({ id: $, "aria-labelledby": j, autoFocus: !0, className: Es }, d, { ref: function(P) {
    d != null && d.ref && (d.ref.current = P), F.current = P;
  }, onChange: function(P) {
    var B;
    M(N()), d == null || (B = d.onChange) === null || B === void 0 || B.call(d, P);
  } })), k.createElement("div", { className: As }, k.createElement(Nr, Ne({ type: "button", variant: "default", size: "small", onClick: l }, c), a), k.createElement(Nr, Ne({ type: "submit", variant: "primary", size: "small", disabled: !!q }, p), f)))));
});
Yr.displayName = "InlineMessageFeedback";
var Ns = b(ha || (ha = ie([`
  width: 372px;
  border-radius: 16px;
  border: 1px solid;
`]))), Ms = b(va || (va = ie([`
  padding: `, `px;
`])), Q[3]), Bs = sa(sa({}, z.Dark, b(ma || (ma = ie([`
    background-color: `, `;
    border-color: `, `;
  `])), i.gray.dark3, i.gray.dark2)), z.Light, b(ya || (ya = ie([`
    background-color: `, `;
    border-color: `, `;
  `])), i.black, i.black)), Hs = ["darkMode", "cancelButtonText", "onCancel", "cancelButtonProps", "submitButtonText", "submitButtonProps", "onSubmit", "textareaProps", "onClose", "label"], Ls = Qe(function(e, r) {
  var t = e.darkMode, n = e.cancelButtonText, a = e.onCancel, l = e.cancelButtonProps, c = e.submitButtonText, u = e.submitButtonProps, f = e.onSubmit, p = e.textareaProps, m = e.onClose, y = e.label, O = Ss(e, Hs), S = ve(t).theme;
  return k.createElement(Xr, { darkMode: !0 }, k.createElement(vi, Ne({ ref: r, spacing: Q[3] }, O, { className: te(Ns, Bs[S]) }), k.createElement("div", { className: Ms }, k.createElement(Yr, { cancelButtonText: n, onCancel: a, cancelButtonProps: l, submitButtonText: c, submitButtonProps: u, onSubmit: f, textareaProps: p, onClose: m, label: y }))));
});
Ls.displayName = "PopoverMessageFeedback";
var zs = /\s/;
function Rs(e) {
  for (var r = e.length; r-- && zs.test(e.charAt(r)); )
    ;
  return r;
}
var Gs = Rs, Us = Gs, Ks = /^\s+/;
function qs(e) {
  return e && e.slice(0, Us(e) + 1).replace(Ks, "");
}
var Ws = qs;
function Xs(e) {
  var r = typeof e;
  return e != null && (r == "object" || r == "function");
}
var _e = Xs, Vs = typeof Ae == "object" && Ae && Ae.Object === Object && Ae, $o = Vs, Ys = $o, Zs = typeof self == "object" && self && self.Object === Object && self, Js = Ys || Zs || Function("return this")(), fe = Js, Qs = fe, el = Qs.Symbol, rr = el, $a = rr, xo = Object.prototype, rl = xo.hasOwnProperty, tl = xo.toString, qe = $a ? $a.toStringTag : void 0;
function nl(e) {
  var r = rl.call(e, qe), t = e[qe];
  try {
    e[qe] = void 0;
    var n = !0;
  } catch {
  }
  var a = tl.call(e);
  return n && (r ? e[qe] = t : delete e[qe]), a;
}
var al = nl, ol = Object.prototype, il = ol.toString;
function sl(e) {
  return il.call(e);
}
var ll = sl, xa = rr, cl = al, ul = ll, fl = "[object Null]", dl = "[object Undefined]", wa = xa ? xa.toStringTag : void 0;
function pl(e) {
  return e == null ? e === void 0 ? dl : fl : wa && wa in Object(e) ? cl(e) : ul(e);
}
var Be = pl;
function gl(e) {
  return e != null && typeof e == "object";
}
var Pe = gl, bl = Be, hl = Pe, vl = "[object Symbol]";
function ml(e) {
  return typeof e == "symbol" || hl(e) && bl(e) == vl;
}
var vr = ml, yl = Ws, ka = _e, $l = vr, Oa = 0 / 0, xl = /^[-+]0x[0-9a-f]+$/i, wl = /^0b[01]+$/i, kl = /^0o[0-7]+$/i, Ol = parseInt;
function jl(e) {
  if (typeof e == "number")
    return e;
  if ($l(e))
    return Oa;
  if (ka(e)) {
    var r = typeof e.valueOf == "function" ? e.valueOf() : e;
    e = ka(r) ? r + "" : r;
  }
  if (typeof e != "string")
    return e === 0 ? e : +e;
  e = yl(e);
  var t = wl.test(e);
  return t || kl.test(e) ? Ol(e.slice(2), t ? 2 : 8) : xl.test(e) ? Oa : +e;
}
var Sl = jl, _l = Sl, ja = 1 / 0, Pl = 17976931348623157e292;
function Tl(e) {
  if (!e)
    return e === 0 ? e : 0;
  if (e = _l(e), e === ja || e === -ja) {
    var r = e < 0 ? -1 : 1;
    return r * Pl;
  }
  return e === e ? e : 0;
}
var Fl = Tl, Cl = Fl;
function Il(e) {
  var r = Cl(e), t = r % 1;
  return r === r ? t ? r - t : r : 0;
}
var Dl = Il, El = Dl, Al = "Expected a function";
function Nl(e, r) {
  var t;
  if (typeof r != "function")
    throw new TypeError(Al);
  return e = El(e), function() {
    return --e > 0 && (t = r.apply(this, arguments)), e <= 1 && (r = void 0), t;
  };
}
var Ml = Nl, Bl = Ml;
function Hl(e) {
  return Bl(2, e);
}
var Ll = Hl;
const Sr = /* @__PURE__ */ Wr(Ll);
function zl(e, r) {
  for (var t = -1, n = e == null ? 0 : e.length, a = Array(n); ++t < n; )
    a[t] = r(e[t], t, e);
  return a;
}
var wo = zl;
function Rl() {
  this.__data__ = [], this.size = 0;
}
var Gl = Rl;
function Ul(e, r) {
  return e === r || e !== e && r !== r;
}
var ko = Ul, Kl = ko;
function ql(e, r) {
  for (var t = e.length; t--; )
    if (Kl(e[t][0], r))
      return t;
  return -1;
}
var mr = ql, Wl = mr, Xl = Array.prototype, Vl = Xl.splice;
function Yl(e) {
  var r = this.__data__, t = Wl(r, e);
  if (t < 0)
    return !1;
  var n = r.length - 1;
  return t == n ? r.pop() : Vl.call(r, t, 1), --this.size, !0;
}
var Zl = Yl, Jl = mr;
function Ql(e) {
  var r = this.__data__, t = Jl(r, e);
  return t < 0 ? void 0 : r[t][1];
}
var ec = Ql, rc = mr;
function tc(e) {
  return rc(this.__data__, e) > -1;
}
var nc = tc, ac = mr;
function oc(e, r) {
  var t = this.__data__, n = ac(t, e);
  return n < 0 ? (++this.size, t.push([e, r])) : t[n][1] = r, this;
}
var ic = oc, sc = Gl, lc = Zl, cc = ec, uc = nc, fc = ic;
function He(e) {
  var r = -1, t = e == null ? 0 : e.length;
  for (this.clear(); ++r < t; ) {
    var n = e[r];
    this.set(n[0], n[1]);
  }
}
He.prototype.clear = sc;
He.prototype.delete = lc;
He.prototype.get = cc;
He.prototype.has = uc;
He.prototype.set = fc;
var yr = He, dc = yr;
function pc() {
  this.__data__ = new dc(), this.size = 0;
}
var gc = pc;
function bc(e) {
  var r = this.__data__, t = r.delete(e);
  return this.size = r.size, t;
}
var hc = bc;
function vc(e) {
  return this.__data__.get(e);
}
var mc = vc;
function yc(e) {
  return this.__data__.has(e);
}
var $c = yc, xc = Be, wc = _e, kc = "[object AsyncFunction]", Oc = "[object Function]", jc = "[object GeneratorFunction]", Sc = "[object Proxy]";
function _c(e) {
  if (!wc(e))
    return !1;
  var r = xc(e);
  return r == Oc || r == jc || r == kc || r == Sc;
}
var Oo = _c, Pc = fe, Tc = Pc["__core-js_shared__"], Fc = Tc, _r = Fc, Sa = function() {
  var e = /[^.]+$/.exec(_r && _r.keys && _r.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function Cc(e) {
  return !!Sa && Sa in e;
}
var Ic = Cc, Dc = Function.prototype, Ec = Dc.toString;
function Ac(e) {
  if (e != null) {
    try {
      return Ec.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var jo = Ac, Nc = Oo, Mc = Ic, Bc = _e, Hc = jo, Lc = /[\\^$.*+?()[\]{}|]/g, zc = /^\[object .+?Constructor\]$/, Rc = Function.prototype, Gc = Object.prototype, Uc = Rc.toString, Kc = Gc.hasOwnProperty, qc = RegExp(
  "^" + Uc.call(Kc).replace(Lc, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Wc(e) {
  if (!Bc(e) || Mc(e))
    return !1;
  var r = Nc(e) ? qc : zc;
  return r.test(Hc(e));
}
var Xc = Wc;
function Vc(e, r) {
  return e == null ? void 0 : e[r];
}
var Yc = Vc, Zc = Xc, Jc = Yc;
function Qc(e, r) {
  var t = Jc(e, r);
  return Zc(t) ? t : void 0;
}
var Te = Qc, eu = Te, ru = fe, tu = eu(ru, "Map"), Zr = tu, nu = Te, au = nu(Object, "create"), $r = au, _a = $r;
function ou() {
  this.__data__ = _a ? _a(null) : {}, this.size = 0;
}
var iu = ou;
function su(e) {
  var r = this.has(e) && delete this.__data__[e];
  return this.size -= r ? 1 : 0, r;
}
var lu = su, cu = $r, uu = "__lodash_hash_undefined__", fu = Object.prototype, du = fu.hasOwnProperty;
function pu(e) {
  var r = this.__data__;
  if (cu) {
    var t = r[e];
    return t === uu ? void 0 : t;
  }
  return du.call(r, e) ? r[e] : void 0;
}
var gu = pu, bu = $r, hu = Object.prototype, vu = hu.hasOwnProperty;
function mu(e) {
  var r = this.__data__;
  return bu ? r[e] !== void 0 : vu.call(r, e);
}
var yu = mu, $u = $r, xu = "__lodash_hash_undefined__";
function wu(e, r) {
  var t = this.__data__;
  return this.size += this.has(e) ? 0 : 1, t[e] = $u && r === void 0 ? xu : r, this;
}
var ku = wu, Ou = iu, ju = lu, Su = gu, _u = yu, Pu = ku;
function Le(e) {
  var r = -1, t = e == null ? 0 : e.length;
  for (this.clear(); ++r < t; ) {
    var n = e[r];
    this.set(n[0], n[1]);
  }
}
Le.prototype.clear = Ou;
Le.prototype.delete = ju;
Le.prototype.get = Su;
Le.prototype.has = _u;
Le.prototype.set = Pu;
var Tu = Le, Pa = Tu, Fu = yr, Cu = Zr;
function Iu() {
  this.size = 0, this.__data__ = {
    hash: new Pa(),
    map: new (Cu || Fu)(),
    string: new Pa()
  };
}
var Du = Iu;
function Eu(e) {
  var r = typeof e;
  return r == "string" || r == "number" || r == "symbol" || r == "boolean" ? e !== "__proto__" : e === null;
}
var Au = Eu, Nu = Au;
function Mu(e, r) {
  var t = e.__data__;
  return Nu(r) ? t[typeof r == "string" ? "string" : "hash"] : t.map;
}
var xr = Mu, Bu = xr;
function Hu(e) {
  var r = Bu(this, e).delete(e);
  return this.size -= r ? 1 : 0, r;
}
var Lu = Hu, zu = xr;
function Ru(e) {
  return zu(this, e).get(e);
}
var Gu = Ru, Uu = xr;
function Ku(e) {
  return Uu(this, e).has(e);
}
var qu = Ku, Wu = xr;
function Xu(e, r) {
  var t = Wu(this, e), n = t.size;
  return t.set(e, r), this.size += t.size == n ? 0 : 1, this;
}
var Vu = Xu, Yu = Du, Zu = Lu, Ju = Gu, Qu = qu, ef = Vu;
function ze(e) {
  var r = -1, t = e == null ? 0 : e.length;
  for (this.clear(); ++r < t; ) {
    var n = e[r];
    this.set(n[0], n[1]);
  }
}
ze.prototype.clear = Yu;
ze.prototype.delete = Zu;
ze.prototype.get = Ju;
ze.prototype.has = Qu;
ze.prototype.set = ef;
var So = ze, rf = yr, tf = Zr, nf = So, af = 200;
function of(e, r) {
  var t = this.__data__;
  if (t instanceof rf) {
    var n = t.__data__;
    if (!tf || n.length < af - 1)
      return n.push([e, r]), this.size = ++t.size, this;
    t = this.__data__ = new nf(n);
  }
  return t.set(e, r), this.size = t.size, this;
}
var sf = of, lf = yr, cf = gc, uf = hc, ff = mc, df = $c, pf = sf;
function Re(e) {
  var r = this.__data__ = new lf(e);
  this.size = r.size;
}
Re.prototype.clear = cf;
Re.prototype.delete = uf;
Re.prototype.get = ff;
Re.prototype.has = df;
Re.prototype.set = pf;
var gf = Re;
function bf(e, r) {
  for (var t = -1, n = e == null ? 0 : e.length; ++t < n && r(e[t], t, e) !== !1; )
    ;
  return e;
}
var hf = bf, vf = Te, mf = function() {
  try {
    var e = vf(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
}(), _o = mf, Ta = _o;
function yf(e, r, t) {
  r == "__proto__" && Ta ? Ta(e, r, {
    configurable: !0,
    enumerable: !0,
    value: t,
    writable: !0
  }) : e[r] = t;
}
var Po = yf, $f = Po, xf = ko, wf = Object.prototype, kf = wf.hasOwnProperty;
function Of(e, r, t) {
  var n = e[r];
  (!(kf.call(e, r) && xf(n, t)) || t === void 0 && !(r in e)) && $f(e, r, t);
}
var Jr = Of, jf = Jr, Sf = Po;
function _f(e, r, t, n) {
  var a = !t;
  t || (t = {});
  for (var l = -1, c = r.length; ++l < c; ) {
    var u = r[l], f = n ? n(t[u], e[u], u, t, e) : void 0;
    f === void 0 && (f = e[u]), a ? Sf(t, u, f) : jf(t, u, f);
  }
  return t;
}
var tr = _f;
function Pf(e, r) {
  for (var t = -1, n = Array(e); ++t < e; )
    n[t] = r(t);
  return n;
}
var Tf = Pf, Ff = Be, Cf = Pe, If = "[object Arguments]";
function Df(e) {
  return Cf(e) && Ff(e) == If;
}
var Ef = Df, Fa = Ef, Af = Pe, To = Object.prototype, Nf = To.hasOwnProperty, Mf = To.propertyIsEnumerable, Bf = Fa(function() {
  return arguments;
}()) ? Fa : function(e) {
  return Af(e) && Nf.call(e, "callee") && !Mf.call(e, "callee");
}, Qr = Bf, Hf = Array.isArray, me = Hf, ur = { exports: {} };
function Lf() {
  return !1;
}
var zf = Lf;
ur.exports;
(function(e, r) {
  var t = fe, n = zf, a = r && !r.nodeType && r, l = a && !0 && e && !e.nodeType && e, c = l && l.exports === a, u = c ? t.Buffer : void 0, f = u ? u.isBuffer : void 0, p = f || n;
  e.exports = p;
})(ur, ur.exports);
var Fo = ur.exports, Rf = 9007199254740991, Gf = /^(?:0|[1-9]\d*)$/;
function Uf(e, r) {
  var t = typeof e;
  return r = r ?? Rf, !!r && (t == "number" || t != "symbol" && Gf.test(e)) && e > -1 && e % 1 == 0 && e < r;
}
var et = Uf, Kf = 9007199254740991;
function qf(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= Kf;
}
var rt = qf, Wf = Be, Xf = rt, Vf = Pe, Yf = "[object Arguments]", Zf = "[object Array]", Jf = "[object Boolean]", Qf = "[object Date]", ed = "[object Error]", rd = "[object Function]", td = "[object Map]", nd = "[object Number]", ad = "[object Object]", od = "[object RegExp]", id = "[object Set]", sd = "[object String]", ld = "[object WeakMap]", cd = "[object ArrayBuffer]", ud = "[object DataView]", fd = "[object Float32Array]", dd = "[object Float64Array]", pd = "[object Int8Array]", gd = "[object Int16Array]", bd = "[object Int32Array]", hd = "[object Uint8Array]", vd = "[object Uint8ClampedArray]", md = "[object Uint16Array]", yd = "[object Uint32Array]", A = {};
A[fd] = A[dd] = A[pd] = A[gd] = A[bd] = A[hd] = A[vd] = A[md] = A[yd] = !0;
A[Yf] = A[Zf] = A[cd] = A[Jf] = A[ud] = A[Qf] = A[ed] = A[rd] = A[td] = A[nd] = A[ad] = A[od] = A[id] = A[sd] = A[ld] = !1;
function $d(e) {
  return Vf(e) && Xf(e.length) && !!A[Wf(e)];
}
var xd = $d;
function wd(e) {
  return function(r) {
    return e(r);
  };
}
var tt = wd, fr = { exports: {} };
fr.exports;
(function(e, r) {
  var t = $o, n = r && !r.nodeType && r, a = n && !0 && e && !e.nodeType && e, l = a && a.exports === n, c = l && t.process, u = function() {
    try {
      var f = a && a.require && a.require("util").types;
      return f || c && c.binding && c.binding("util");
    } catch {
    }
  }();
  e.exports = u;
})(fr, fr.exports);
var nt = fr.exports, kd = xd, Od = tt, Ca = nt, Ia = Ca && Ca.isTypedArray, jd = Ia ? Od(Ia) : kd, Sd = jd, _d = Tf, Pd = Qr, Td = me, Fd = Fo, Cd = et, Id = Sd, Dd = Object.prototype, Ed = Dd.hasOwnProperty;
function Ad(e, r) {
  var t = Td(e), n = !t && Pd(e), a = !t && !n && Fd(e), l = !t && !n && !a && Id(e), c = t || n || a || l, u = c ? _d(e.length, String) : [], f = u.length;
  for (var p in e)
    (r || Ed.call(e, p)) && !(c && // Safari 9 has enumerable `arguments.length` in strict mode.
    (p == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    a && (p == "offset" || p == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    l && (p == "buffer" || p == "byteLength" || p == "byteOffset") || // Skip index properties.
    Cd(p, f))) && u.push(p);
  return u;
}
var Co = Ad, Nd = Object.prototype;
function Md(e) {
  var r = e && e.constructor, t = typeof r == "function" && r.prototype || Nd;
  return e === t;
}
var at = Md;
function Bd(e, r) {
  return function(t) {
    return e(r(t));
  };
}
var Io = Bd, Hd = Io, Ld = Hd(Object.keys, Object), zd = Ld, Rd = at, Gd = zd, Ud = Object.prototype, Kd = Ud.hasOwnProperty;
function qd(e) {
  if (!Rd(e))
    return Gd(e);
  var r = [];
  for (var t in Object(e))
    Kd.call(e, t) && t != "constructor" && r.push(t);
  return r;
}
var Wd = qd, Xd = Oo, Vd = rt;
function Yd(e) {
  return e != null && Vd(e.length) && !Xd(e);
}
var Do = Yd, Zd = Co, Jd = Wd, Qd = Do;
function ep(e) {
  return Qd(e) ? Zd(e) : Jd(e);
}
var ot = ep, rp = tr, tp = ot;
function np(e, r) {
  return e && rp(r, tp(r), e);
}
var ap = np;
function op(e) {
  var r = [];
  if (e != null)
    for (var t in Object(e))
      r.push(t);
  return r;
}
var ip = op, sp = _e, lp = at, cp = ip, up = Object.prototype, fp = up.hasOwnProperty;
function dp(e) {
  if (!sp(e))
    return cp(e);
  var r = lp(e), t = [];
  for (var n in e)
    n == "constructor" && (r || !fp.call(e, n)) || t.push(n);
  return t;
}
var pp = dp, gp = Co, bp = pp, hp = Do;
function vp(e) {
  return hp(e) ? gp(e, !0) : bp(e);
}
var it = vp, mp = tr, yp = it;
function $p(e, r) {
  return e && mp(r, yp(r), e);
}
var xp = $p, dr = { exports: {} };
dr.exports;
(function(e, r) {
  var t = fe, n = r && !r.nodeType && r, a = n && !0 && e && !e.nodeType && e, l = a && a.exports === n, c = l ? t.Buffer : void 0, u = c ? c.allocUnsafe : void 0;
  function f(p, m) {
    if (m)
      return p.slice();
    var y = p.length, O = u ? u(y) : new p.constructor(y);
    return p.copy(O), O;
  }
  e.exports = f;
})(dr, dr.exports);
var wp = dr.exports;
function kp(e, r) {
  var t = -1, n = e.length;
  for (r || (r = Array(n)); ++t < n; )
    r[t] = e[t];
  return r;
}
var Op = kp;
function jp(e, r) {
  for (var t = -1, n = e == null ? 0 : e.length, a = 0, l = []; ++t < n; ) {
    var c = e[t];
    r(c, t, e) && (l[a++] = c);
  }
  return l;
}
var Sp = jp;
function _p() {
  return [];
}
var Eo = _p, Pp = Sp, Tp = Eo, Fp = Object.prototype, Cp = Fp.propertyIsEnumerable, Da = Object.getOwnPropertySymbols, Ip = Da ? function(e) {
  return e == null ? [] : (e = Object(e), Pp(Da(e), function(r) {
    return Cp.call(e, r);
  }));
} : Tp, st = Ip, Dp = tr, Ep = st;
function Ap(e, r) {
  return Dp(e, Ep(e), r);
}
var Np = Ap;
function Mp(e, r) {
  for (var t = -1, n = r.length, a = e.length; ++t < n; )
    e[a + t] = r[t];
  return e;
}
var lt = Mp, Bp = Io, Hp = Bp(Object.getPrototypeOf, Object), ct = Hp, Lp = lt, zp = ct, Rp = st, Gp = Eo, Up = Object.getOwnPropertySymbols, Kp = Up ? function(e) {
  for (var r = []; e; )
    Lp(r, Rp(e)), e = zp(e);
  return r;
} : Gp, Ao = Kp, qp = tr, Wp = Ao;
function Xp(e, r) {
  return qp(e, Wp(e), r);
}
var Vp = Xp, Yp = lt, Zp = me;
function Jp(e, r, t) {
  var n = r(e);
  return Zp(e) ? n : Yp(n, t(e));
}
var No = Jp, Qp = No, eg = st, rg = ot;
function tg(e) {
  return Qp(e, rg, eg);
}
var ng = tg, ag = No, og = Ao, ig = it;
function sg(e) {
  return ag(e, ig, og);
}
var Mo = sg, lg = Te, cg = fe, ug = lg(cg, "DataView"), fg = ug, dg = Te, pg = fe, gg = dg(pg, "Promise"), bg = gg, hg = Te, vg = fe, mg = hg(vg, "Set"), yg = mg, $g = Te, xg = fe, wg = $g(xg, "WeakMap"), kg = wg, Mr = fg, Br = Zr, Hr = bg, Lr = yg, zr = kg, Bo = Be, Ge = jo, Ea = "[object Map]", Og = "[object Object]", Aa = "[object Promise]", Na = "[object Set]", Ma = "[object WeakMap]", Ba = "[object DataView]", jg = Ge(Mr), Sg = Ge(Br), _g = Ge(Hr), Pg = Ge(Lr), Tg = Ge(zr), Oe = Bo;
(Mr && Oe(new Mr(new ArrayBuffer(1))) != Ba || Br && Oe(new Br()) != Ea || Hr && Oe(Hr.resolve()) != Aa || Lr && Oe(new Lr()) != Na || zr && Oe(new zr()) != Ma) && (Oe = function(e) {
  var r = Bo(e), t = r == Og ? e.constructor : void 0, n = t ? Ge(t) : "";
  if (n)
    switch (n) {
      case jg:
        return Ba;
      case Sg:
        return Ea;
      case _g:
        return Aa;
      case Pg:
        return Na;
      case Tg:
        return Ma;
    }
  return r;
});
var ut = Oe, Fg = Object.prototype, Cg = Fg.hasOwnProperty;
function Ig(e) {
  var r = e.length, t = new e.constructor(r);
  return r && typeof e[0] == "string" && Cg.call(e, "index") && (t.index = e.index, t.input = e.input), t;
}
var Dg = Ig, Eg = fe, Ag = Eg.Uint8Array, Ng = Ag, Ha = Ng;
function Mg(e) {
  var r = new e.constructor(e.byteLength);
  return new Ha(r).set(new Ha(e)), r;
}
var ft = Mg, Bg = ft;
function Hg(e, r) {
  var t = r ? Bg(e.buffer) : e.buffer;
  return new e.constructor(t, e.byteOffset, e.byteLength);
}
var Lg = Hg, zg = /\w*$/;
function Rg(e) {
  var r = new e.constructor(e.source, zg.exec(e));
  return r.lastIndex = e.lastIndex, r;
}
var Gg = Rg, La = rr, za = La ? La.prototype : void 0, Ra = za ? za.valueOf : void 0;
function Ug(e) {
  return Ra ? Object(Ra.call(e)) : {};
}
var Kg = Ug, qg = ft;
function Wg(e, r) {
  var t = r ? qg(e.buffer) : e.buffer;
  return new e.constructor(t, e.byteOffset, e.length);
}
var Xg = Wg, Vg = ft, Yg = Lg, Zg = Gg, Jg = Kg, Qg = Xg, eb = "[object Boolean]", rb = "[object Date]", tb = "[object Map]", nb = "[object Number]", ab = "[object RegExp]", ob = "[object Set]", ib = "[object String]", sb = "[object Symbol]", lb = "[object ArrayBuffer]", cb = "[object DataView]", ub = "[object Float32Array]", fb = "[object Float64Array]", db = "[object Int8Array]", pb = "[object Int16Array]", gb = "[object Int32Array]", bb = "[object Uint8Array]", hb = "[object Uint8ClampedArray]", vb = "[object Uint16Array]", mb = "[object Uint32Array]";
function yb(e, r, t) {
  var n = e.constructor;
  switch (r) {
    case lb:
      return Vg(e);
    case eb:
    case rb:
      return new n(+e);
    case cb:
      return Yg(e, t);
    case ub:
    case fb:
    case db:
    case pb:
    case gb:
    case bb:
    case hb:
    case vb:
    case mb:
      return Qg(e, t);
    case tb:
      return new n();
    case nb:
    case ib:
      return new n(e);
    case ab:
      return Zg(e);
    case ob:
      return new n();
    case sb:
      return Jg(e);
  }
}
var $b = yb, xb = _e, Ga = Object.create, wb = function() {
  function e() {
  }
  return function(r) {
    if (!xb(r))
      return {};
    if (Ga)
      return Ga(r);
    e.prototype = r;
    var t = new e();
    return e.prototype = void 0, t;
  };
}(), kb = wb, Ob = kb, jb = ct, Sb = at;
function _b(e) {
  return typeof e.constructor == "function" && !Sb(e) ? Ob(jb(e)) : {};
}
var Pb = _b, Tb = ut, Fb = Pe, Cb = "[object Map]";
function Ib(e) {
  return Fb(e) && Tb(e) == Cb;
}
var Db = Ib, Eb = Db, Ab = tt, Ua = nt, Ka = Ua && Ua.isMap, Nb = Ka ? Ab(Ka) : Eb, Mb = Nb, Bb = ut, Hb = Pe, Lb = "[object Set]";
function zb(e) {
  return Hb(e) && Bb(e) == Lb;
}
var Rb = zb, Gb = Rb, Ub = tt, qa = nt, Wa = qa && qa.isSet, Kb = Wa ? Ub(Wa) : Gb, qb = Kb, Wb = gf, Xb = hf, Vb = Jr, Yb = ap, Zb = xp, Jb = wp, Qb = Op, eh = Np, rh = Vp, th = ng, nh = Mo, ah = ut, oh = Dg, ih = $b, sh = Pb, lh = me, ch = Fo, uh = Mb, fh = _e, dh = qb, ph = ot, gh = it, bh = 1, hh = 2, vh = 4, Ho = "[object Arguments]", mh = "[object Array]", yh = "[object Boolean]", $h = "[object Date]", xh = "[object Error]", Lo = "[object Function]", wh = "[object GeneratorFunction]", kh = "[object Map]", Oh = "[object Number]", zo = "[object Object]", jh = "[object RegExp]", Sh = "[object Set]", _h = "[object String]", Ph = "[object Symbol]", Th = "[object WeakMap]", Fh = "[object ArrayBuffer]", Ch = "[object DataView]", Ih = "[object Float32Array]", Dh = "[object Float64Array]", Eh = "[object Int8Array]", Ah = "[object Int16Array]", Nh = "[object Int32Array]", Mh = "[object Uint8Array]", Bh = "[object Uint8ClampedArray]", Hh = "[object Uint16Array]", Lh = "[object Uint32Array]", E = {};
E[Ho] = E[mh] = E[Fh] = E[Ch] = E[yh] = E[$h] = E[Ih] = E[Dh] = E[Eh] = E[Ah] = E[Nh] = E[kh] = E[Oh] = E[zo] = E[jh] = E[Sh] = E[_h] = E[Ph] = E[Mh] = E[Bh] = E[Hh] = E[Lh] = !0;
E[xh] = E[Lo] = E[Th] = !1;
function or(e, r, t, n, a, l) {
  var c, u = r & bh, f = r & hh, p = r & vh;
  if (t && (c = a ? t(e, n, a, l) : t(e)), c !== void 0)
    return c;
  if (!fh(e))
    return e;
  var m = lh(e);
  if (m) {
    if (c = oh(e), !u)
      return Qb(e, c);
  } else {
    var y = ah(e), O = y == Lo || y == wh;
    if (ch(e))
      return Jb(e, u);
    if (y == zo || y == Ho || O && !a) {
      if (c = f || O ? {} : sh(e), !u)
        return f ? rh(e, Zb(c, e)) : eh(e, Yb(c, e));
    } else {
      if (!E[y])
        return a ? e : {};
      c = ih(e, y, u);
    }
  }
  l || (l = new Wb());
  var S = l.get(e);
  if (S)
    return S;
  l.set(e, c), dh(e) ? e.forEach(function(d) {
    c.add(or(d, r, t, d, e, l));
  }) : uh(e) && e.forEach(function(d, v) {
    c.set(v, or(d, r, t, v, e, l));
  });
  var R = p ? f ? nh : th : f ? gh : ph, T = m ? void 0 : R(e);
  return Xb(T || e, function(d, v) {
    T && (v = d, d = e[v]), Vb(c, v, or(d, r, t, v, e, l));
  }), c;
}
var zh = or, Rh = me, Gh = vr, Uh = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, Kh = /^\w*$/;
function qh(e, r) {
  if (Rh(e))
    return !1;
  var t = typeof e;
  return t == "number" || t == "symbol" || t == "boolean" || e == null || Gh(e) ? !0 : Kh.test(e) || !Uh.test(e) || r != null && e in Object(r);
}
var Wh = qh, Ro = So, Xh = "Expected a function";
function dt(e, r) {
  if (typeof e != "function" || r != null && typeof r != "function")
    throw new TypeError(Xh);
  var t = function() {
    var n = arguments, a = r ? r.apply(this, n) : n[0], l = t.cache;
    if (l.has(a))
      return l.get(a);
    var c = e.apply(this, n);
    return t.cache = l.set(a, c) || l, c;
  };
  return t.cache = new (dt.Cache || Ro)(), t;
}
dt.Cache = Ro;
var Vh = dt, Yh = Vh, Zh = 500;
function Jh(e) {
  var r = Yh(e, function(n) {
    return t.size === Zh && t.clear(), n;
  }), t = r.cache;
  return r;
}
var Qh = Jh, ev = Qh, rv = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g, tv = /\\(\\)?/g, nv = ev(function(e) {
  var r = [];
  return e.charCodeAt(0) === 46 && r.push(""), e.replace(rv, function(t, n, a, l) {
    r.push(a ? l.replace(tv, "$1") : n || t);
  }), r;
}), av = nv, Xa = rr, ov = wo, iv = me, sv = vr, lv = 1 / 0, Va = Xa ? Xa.prototype : void 0, Ya = Va ? Va.toString : void 0;
function Go(e) {
  if (typeof e == "string")
    return e;
  if (iv(e))
    return ov(e, Go) + "";
  if (sv(e))
    return Ya ? Ya.call(e) : "";
  var r = e + "";
  return r == "0" && 1 / e == -lv ? "-0" : r;
}
var cv = Go, uv = cv;
function fv(e) {
  return e == null ? "" : uv(e);
}
var dv = fv, pv = me, gv = Wh, bv = av, hv = dv;
function vv(e, r) {
  return pv(e) ? e : gv(e, r) ? [e] : bv(hv(e));
}
var Ue = vv;
function mv(e) {
  var r = e == null ? 0 : e.length;
  return r ? e[r - 1] : void 0;
}
var yv = mv, $v = vr, xv = 1 / 0;
function wv(e) {
  if (typeof e == "string" || $v(e))
    return e;
  var r = e + "";
  return r == "0" && 1 / e == -xv ? "-0" : r;
}
var wr = wv, kv = Ue, Ov = wr;
function jv(e, r) {
  r = kv(r, e);
  for (var t = 0, n = r.length; e != null && t < n; )
    e = e[Ov(r[t++])];
  return t && t == n ? e : void 0;
}
var Uo = jv;
function Sv(e, r, t) {
  var n = -1, a = e.length;
  r < 0 && (r = -r > a ? 0 : a + r), t = t > a ? a : t, t < 0 && (t += a), a = r > t ? 0 : t - r >>> 0, r >>>= 0;
  for (var l = Array(a); ++n < a; )
    l[n] = e[n + r];
  return l;
}
var _v = Sv, Pv = Uo, Tv = _v;
function Fv(e, r) {
  return r.length < 2 ? e : Pv(e, Tv(r, 0, -1));
}
var Cv = Fv, Iv = Ue, Dv = yv, Ev = Cv, Av = wr;
function Nv(e, r) {
  return r = Iv(r, e), e = Ev(e, r), e == null || delete e[Av(Dv(r))];
}
var Mv = Nv, Bv = Be, Hv = ct, Lv = Pe, zv = "[object Object]", Rv = Function.prototype, Gv = Object.prototype, Ko = Rv.toString, Uv = Gv.hasOwnProperty, Kv = Ko.call(Object);
function qv(e) {
  if (!Lv(e) || Bv(e) != zv)
    return !1;
  var r = Hv(e);
  if (r === null)
    return !0;
  var t = Uv.call(r, "constructor") && r.constructor;
  return typeof t == "function" && t instanceof t && Ko.call(t) == Kv;
}
var Wv = qv, Xv = Wv;
function Vv(e) {
  return Xv(e) ? void 0 : e;
}
var Yv = Vv, Za = rr, Zv = Qr, Jv = me, Ja = Za ? Za.isConcatSpreadable : void 0;
function Qv(e) {
  return Jv(e) || Zv(e) || !!(Ja && e && e[Ja]);
}
var em = Qv, rm = lt, tm = em;
function qo(e, r, t, n, a) {
  var l = -1, c = e.length;
  for (t || (t = tm), a || (a = []); ++l < c; ) {
    var u = e[l];
    r > 0 && t(u) ? r > 1 ? qo(u, r - 1, t, n, a) : rm(a, u) : n || (a[a.length] = u);
  }
  return a;
}
var nm = qo, am = nm;
function om(e) {
  var r = e == null ? 0 : e.length;
  return r ? am(e, 1) : [];
}
var im = om;
function sm(e, r, t) {
  switch (t.length) {
    case 0:
      return e.call(r);
    case 1:
      return e.call(r, t[0]);
    case 2:
      return e.call(r, t[0], t[1]);
    case 3:
      return e.call(r, t[0], t[1], t[2]);
  }
  return e.apply(r, t);
}
var lm = sm, cm = lm, Qa = Math.max;
function um(e, r, t) {
  return r = Qa(r === void 0 ? e.length - 1 : r, 0), function() {
    for (var n = arguments, a = -1, l = Qa(n.length - r, 0), c = Array(l); ++a < l; )
      c[a] = n[r + a];
    a = -1;
    for (var u = Array(r + 1); ++a < r; )
      u[a] = n[a];
    return u[r] = t(c), cm(e, this, u);
  };
}
var fm = um;
function dm(e) {
  return function() {
    return e;
  };
}
var pm = dm;
function gm(e) {
  return e;
}
var bm = gm, hm = pm, eo = _o, vm = bm, mm = eo ? function(e, r) {
  return eo(e, "toString", {
    configurable: !0,
    enumerable: !1,
    value: hm(r),
    writable: !0
  });
} : vm, ym = mm, $m = 800, xm = 16, wm = Date.now;
function km(e) {
  var r = 0, t = 0;
  return function() {
    var n = wm(), a = xm - (n - t);
    if (t = n, a > 0) {
      if (++r >= $m)
        return arguments[0];
    } else
      r = 0;
    return e.apply(void 0, arguments);
  };
}
var Om = km, jm = ym, Sm = Om, _m = Sm(jm), Pm = _m, Tm = im, Fm = fm, Cm = Pm;
function Im(e) {
  return Cm(Fm(e, void 0, Tm), e + "");
}
var Wo = Im, Dm = wo, Em = zh, Am = Mv, Nm = Ue, Mm = tr, Bm = Yv, Hm = Wo, Lm = Mo, zm = 1, Rm = 2, Gm = 4;
Hm(function(e, r) {
  var t = {};
  if (e == null)
    return t;
  var n = !1;
  r = Dm(r, function(l) {
    return l = Nm(l, e), n || (n = l.length > 1), l;
  }), Mm(e, Lm(e), t), n && (t = Em(t, zm | Rm | Gm, Bm));
  for (var a = r.length; a--; )
    Am(t, r[a]);
  return t;
});
var Um = Jr, Km = Ue, qm = et, ro = _e, Wm = wr;
function Xm(e, r, t, n) {
  if (!ro(e))
    return e;
  r = Km(r, e);
  for (var a = -1, l = r.length, c = l - 1, u = e; u != null && ++a < l; ) {
    var f = Wm(r[a]), p = t;
    if (f === "__proto__" || f === "constructor" || f === "prototype")
      return e;
    if (a != c) {
      var m = u[f];
      p = n ? n(m, f, u) : void 0, p === void 0 && (p = ro(m) ? m : qm(r[a + 1]) ? [] : {});
    }
    Um(u, f, p), u = u[f];
  }
  return e;
}
var Vm = Xm, Ym = Uo, Zm = Vm, Jm = Ue;
function Qm(e, r, t) {
  for (var n = -1, a = r.length, l = {}; ++n < a; ) {
    var c = r[n], u = Ym(e, c);
    t(u, c) && Zm(l, Jm(c, e), u);
  }
  return l;
}
var ey = Qm;
function ry(e, r) {
  return e != null && r in Object(e);
}
var ty = ry, ny = Ue, ay = Qr, oy = me, iy = et, sy = rt, ly = wr;
function cy(e, r, t) {
  r = ny(r, e);
  for (var n = -1, a = r.length, l = !1; ++n < a; ) {
    var c = ly(r[n]);
    if (!(l = e != null && t(e, c)))
      break;
    e = e[c];
  }
  return l || ++n != a ? l : (a = e == null ? 0 : e.length, !!a && sy(a) && iy(c, a) && (oy(e) || ay(e)));
}
var uy = cy, fy = ty, dy = uy;
function py(e, r) {
  return e != null && dy(e, r, fy);
}
var gy = py, by = ey, hy = gy;
function vy(e, r) {
  return by(e, r, function(t, n) {
    return hy(e, n);
  });
}
var my = vy, yy = my, $y = Wo;
$y(function(e, r) {
  return e == null ? {} : yy(e, r);
});
var pr = { Light: "light", Dark: "dark" };
Sr(console.error), Sr(console.warn), Sr(console.log);
var D = { white: "#FFFFFF", black: "#001E2B", transparent: "#FFFFFF00", gray: { dark4: "#112733", dark3: "#1C2D38", dark2: "#3D4F58", dark1: "#5C6C75", base: "#889397", light1: "#C1C7C6", light2: "#E8EDEB", light3: "#F9FBFA" }, green: { dark3: "#023430", dark2: "#00684A", dark1: "#00A35C", base: "#00ED64", light1: "#71F6BA", light2: "#C0FAE6", light3: "#E3FCF7" }, purple: { dark3: "#2D0B59", dark2: "#5E0C9E", base: "#B45AF2", light2: "#F1D4FD", light3: "#F9EBFF" }, blue: { dark3: "#0C2657", dark2: "#083C90", dark1: "#1254B7", base: "#016BF8", light1: "#0498EC", light2: "#C3E7FE", light3: "#E1F7FF" }, yellow: { dark3: "#4C2100", dark2: "#944F01", base: "#FFC010", light2: "#FFEC9E", light3: "#FEF7DB" }, red: { dark3: "#5B0000", dark2: "#970606", base: "#DB3030", light1: "#FF6960", light2: "#FFCDC7", light3: "#FFEAE5" } };
function Y() {
  return Y = Object.assign ? Object.assign.bind() : function(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = arguments[r];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
    }
    return e;
  }, Y.apply(this, arguments);
}
function xy(e) {
  if (e === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return e;
}
function Ze(e, r) {
  return Ze = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(n, a) {
    return n.__proto__ = a, n;
  }, Ze(e, r);
}
function wy(e, r) {
  e.prototype = Object.create(r.prototype), e.prototype.constructor = e, Ze(e, r);
}
function Rr(e) {
  return Rr = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, Rr(e);
}
function ky(e) {
  try {
    return Function.toString.call(e).indexOf("[native code]") !== -1;
  } catch {
    return typeof e == "function";
  }
}
function Xo() {
  try {
    var e = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
  } catch {
  }
  return (Xo = function() {
    return !!e;
  })();
}
function Oy(e, r, t) {
  if (Xo())
    return Reflect.construct.apply(null, arguments);
  var n = [null];
  n.push.apply(n, r);
  var a = new (e.bind.apply(e, n))();
  return t && Ze(a, t.prototype), a;
}
function Gr(e) {
  var r = typeof Map == "function" ? /* @__PURE__ */ new Map() : void 0;
  return Gr = function(n) {
    if (n === null || !ky(n))
      return n;
    if (typeof n != "function")
      throw new TypeError("Super expression must either be null or a function");
    if (typeof r < "u") {
      if (r.has(n))
        return r.get(n);
      r.set(n, a);
    }
    function a() {
      return Oy(n, arguments, Rr(this).constructor);
    }
    return a.prototype = Object.create(n.prototype, {
      constructor: {
        value: a,
        enumerable: !1,
        writable: !0,
        configurable: !0
      }
    }), Ze(a, n);
  }, Gr(e);
}
var jy = {
  1: `Passed invalid arguments to hsl, please pass multiple numbers e.g. hsl(360, 0.75, 0.4) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75 }).

`,
  2: `Passed invalid arguments to hsla, please pass multiple numbers e.g. hsla(360, 0.75, 0.4, 0.7) or an object e.g. rgb({ hue: 255, saturation: 0.4, lightness: 0.75, alpha: 0.7 }).

`,
  3: `Passed an incorrect argument to a color function, please pass a string representation of a color.

`,
  4: `Couldn't generate valid rgb string from %s, it returned %s.

`,
  5: `Couldn't parse the color string. Please provide the color as a string in hex, rgb, rgba, hsl or hsla notation.

`,
  6: `Passed invalid arguments to rgb, please pass multiple numbers e.g. rgb(255, 205, 100) or an object e.g. rgb({ red: 255, green: 205, blue: 100 }).

`,
  7: `Passed invalid arguments to rgba, please pass multiple numbers e.g. rgb(255, 205, 100, 0.75) or an object e.g. rgb({ red: 255, green: 205, blue: 100, alpha: 0.75 }).

`,
  8: `Passed invalid argument to toColorString, please pass a RgbColor, RgbaColor, HslColor or HslaColor object.

`,
  9: `Please provide a number of steps to the modularScale helper.

`,
  10: `Please pass a number or one of the predefined scales to the modularScale helper as the ratio.

`,
  11: `Invalid value passed as base to modularScale, expected number or em string but got "%s"

`,
  12: `Expected a string ending in "px" or a number passed as the first argument to %s(), got "%s" instead.

`,
  13: `Expected a string ending in "px" or a number passed as the second argument to %s(), got "%s" instead.

`,
  14: `Passed invalid pixel value ("%s") to %s(), please pass a value like "12px" or 12.

`,
  15: `Passed invalid base value ("%s") to %s(), please pass a value like "12px" or 12.

`,
  16: `You must provide a template to this method.

`,
  17: `You passed an unsupported selector state to this method.

`,
  18: `minScreen and maxScreen must be provided as stringified numbers with the same units.

`,
  19: `fromSize and toSize must be provided as stringified numbers with the same units.

`,
  20: `expects either an array of objects or a single object with the properties prop, fromSize, and toSize.

`,
  21: "expects the objects in the first argument array to have the properties `prop`, `fromSize`, and `toSize`.\n\n",
  22: "expects the first argument object to have the properties `prop`, `fromSize`, and `toSize`.\n\n",
  23: `fontFace expects a name of a font-family.

`,
  24: `fontFace expects either the path to the font file(s) or a name of a local copy.

`,
  25: `fontFace expects localFonts to be an array.

`,
  26: `fontFace expects fileFormats to be an array.

`,
  27: `radialGradient requries at least 2 color-stops to properly render.

`,
  28: `Please supply a filename to retinaImage() as the first argument.

`,
  29: `Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.

`,
  30: "Passed an invalid value to `height` or `width`. Please provide a pixel based unit.\n\n",
  31: `The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation

`,
  32: `To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])
To pass a single animation please supply them in simple values, e.g. animation('rotate', '2s')

`,
  33: `The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation

`,
  34: `borderRadius expects a radius value as a string or number as the second argument.

`,
  35: `borderRadius expects one of "top", "bottom", "left" or "right" as the first argument.

`,
  36: `Property must be a string value.

`,
  37: `Syntax Error at %s.

`,
  38: `Formula contains a function that needs parentheses at %s.

`,
  39: `Formula is missing closing parenthesis at %s.

`,
  40: `Formula has too many closing parentheses at %s.

`,
  41: `All values in a formula must have the same unit or be unitless.

`,
  42: `Please provide a number of steps to the modularScale helper.

`,
  43: `Please pass a number or one of the predefined scales to the modularScale helper as the ratio.

`,
  44: `Invalid value passed as base to modularScale, expected number or em/rem string but got %s.

`,
  45: `Passed invalid argument to hslToColorString, please pass a HslColor or HslaColor object.

`,
  46: `Passed invalid argument to rgbToColorString, please pass a RgbColor or RgbaColor object.

`,
  47: `minScreen and maxScreen must be provided as stringified numbers with the same units.

`,
  48: `fromSize and toSize must be provided as stringified numbers with the same units.

`,
  49: `Expects either an array of objects or a single object with the properties prop, fromSize, and toSize.

`,
  50: `Expects the objects in the first argument array to have the properties prop, fromSize, and toSize.

`,
  51: `Expects the first argument object to have the properties prop, fromSize, and toSize.

`,
  52: `fontFace expects either the path to the font file(s) or a name of a local copy.

`,
  53: `fontFace expects localFonts to be an array.

`,
  54: `fontFace expects fileFormats to be an array.

`,
  55: `fontFace expects a name of a font-family.

`,
  56: `linearGradient requries at least 2 color-stops to properly render.

`,
  57: `radialGradient requries at least 2 color-stops to properly render.

`,
  58: `Please supply a filename to retinaImage() as the first argument.

`,
  59: `Passed invalid argument to triangle, please pass correct pointingDirection e.g. 'right'.

`,
  60: "Passed an invalid value to `height` or `width`. Please provide a pixel based unit.\n\n",
  61: `Property must be a string value.

`,
  62: `borderRadius expects a radius value as a string or number as the second argument.

`,
  63: `borderRadius expects one of "top", "bottom", "left" or "right" as the first argument.

`,
  64: `The animation shorthand only takes 8 arguments. See the specification for more information: http://mdn.io/animation.

`,
  65: `To pass multiple animations please supply them in arrays, e.g. animation(['rotate', '2s'], ['move', '1s'])\\nTo pass a single animation please supply them in simple values, e.g. animation('rotate', '2s').

`,
  66: `The animation shorthand arrays can only have 8 elements. See the specification for more information: http://mdn.io/animation.

`,
  67: `You must provide a template to this method.

`,
  68: `You passed an unsupported selector state to this method.

`,
  69: `Expected a string ending in "px" or a number passed as the first argument to %s(), got %s instead.

`,
  70: `Expected a string ending in "px" or a number passed as the second argument to %s(), got %s instead.

`,
  71: `Passed invalid pixel value %s to %s(), please pass a value like "12px" or 12.

`,
  72: `Passed invalid base value %s to %s(), please pass a value like "12px" or 12.

`,
  73: `Please provide a valid CSS variable.

`,
  74: `CSS variable not found and no default was provided.

`,
  75: `important requires a valid style object, got a %s instead.

`,
  76: `fromSize and toSize must be provided as stringified numbers with the same units as minScreen and maxScreen.

`,
  77: `remToPx expects a value in "rem" but you provided it in "%s".

`,
  78: `base must be set in "px" or "%" but you set it in "%s".
`
};
function Sy() {
  for (var e = arguments.length, r = new Array(e), t = 0; t < e; t++)
    r[t] = arguments[t];
  var n = r[0], a = [], l;
  for (l = 1; l < r.length; l += 1)
    a.push(r[l]);
  return a.forEach(function(c) {
    n = n.replace(/%[a-z]/, c);
  }), n;
}
var ce = /* @__PURE__ */ function(e) {
  wy(r, e);
  function r(t) {
    var n;
    if (Jo.env.NODE_ENV === "production")
      n = e.call(this, "An error occurred. See https://github.com/styled-components/polished/blob/main/src/internalHelpers/errors.md#" + t + " for more information.") || this;
    else {
      for (var a = arguments.length, l = new Array(a > 1 ? a - 1 : 0), c = 1; c < a; c++)
        l[c - 1] = arguments[c];
      n = e.call(this, Sy.apply(void 0, [jy[t]].concat(l))) || this;
    }
    return xy(n);
  }
  return r;
}(/* @__PURE__ */ Gr(Error));
function Pr(e) {
  return Math.round(e * 255);
}
function _y(e, r, t) {
  return Pr(e) + "," + Pr(r) + "," + Pr(t);
}
function Je(e, r, t, n) {
  if (n === void 0 && (n = _y), r === 0)
    return n(t, t, t);
  var a = (e % 360 + 360) % 360 / 60, l = (1 - Math.abs(2 * t - 1)) * r, c = l * (1 - Math.abs(a % 2 - 1)), u = 0, f = 0, p = 0;
  a >= 0 && a < 1 ? (u = l, f = c) : a >= 1 && a < 2 ? (u = c, f = l) : a >= 2 && a < 3 ? (f = l, p = c) : a >= 3 && a < 4 ? (f = c, p = l) : a >= 4 && a < 5 ? (u = c, p = l) : a >= 5 && a < 6 && (u = l, p = c);
  var m = t - l / 2, y = u + m, O = f + m, S = p + m;
  return n(y, O, S);
}
var to = {
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "00ffff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "0000ff",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "00ffff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "ff00ff",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "639",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32"
};
function Py(e) {
  if (typeof e != "string")
    return e;
  var r = e.toLowerCase();
  return to[r] ? "#" + to[r] : e;
}
var Ty = /^#[a-fA-F0-9]{6}$/, Fy = /^#[a-fA-F0-9]{8}$/, Cy = /^#[a-fA-F0-9]{3}$/, Iy = /^#[a-fA-F0-9]{4}$/, Tr = /^rgb\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*\)$/i, Dy = /^rgb(?:a)?\(\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,)?\s*(\d{1,3})\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i, Ey = /^hsl\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*\)$/i, Ay = /^hsl(?:a)?\(\s*(\d{0,3}[.]?[0-9]+(?:deg)?)\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,)?\s*(\d{1,3}[.]?[0-9]?)%\s*(?:,|\/)\s*([-+]?\d*[.]?\d+[%]?)\s*\)$/i;
function Me(e) {
  if (typeof e != "string")
    throw new ce(3);
  var r = Py(e);
  if (r.match(Ty))
    return {
      red: parseInt("" + r[1] + r[2], 16),
      green: parseInt("" + r[3] + r[4], 16),
      blue: parseInt("" + r[5] + r[6], 16)
    };
  if (r.match(Fy)) {
    var t = parseFloat((parseInt("" + r[7] + r[8], 16) / 255).toFixed(2));
    return {
      red: parseInt("" + r[1] + r[2], 16),
      green: parseInt("" + r[3] + r[4], 16),
      blue: parseInt("" + r[5] + r[6], 16),
      alpha: t
    };
  }
  if (r.match(Cy))
    return {
      red: parseInt("" + r[1] + r[1], 16),
      green: parseInt("" + r[2] + r[2], 16),
      blue: parseInt("" + r[3] + r[3], 16)
    };
  if (r.match(Iy)) {
    var n = parseFloat((parseInt("" + r[4] + r[4], 16) / 255).toFixed(2));
    return {
      red: parseInt("" + r[1] + r[1], 16),
      green: parseInt("" + r[2] + r[2], 16),
      blue: parseInt("" + r[3] + r[3], 16),
      alpha: n
    };
  }
  var a = Tr.exec(r);
  if (a)
    return {
      red: parseInt("" + a[1], 10),
      green: parseInt("" + a[2], 10),
      blue: parseInt("" + a[3], 10)
    };
  var l = Dy.exec(r.substring(0, 50));
  if (l)
    return {
      red: parseInt("" + l[1], 10),
      green: parseInt("" + l[2], 10),
      blue: parseInt("" + l[3], 10),
      alpha: parseFloat("" + l[4]) > 1 ? parseFloat("" + l[4]) / 100 : parseFloat("" + l[4])
    };
  var c = Ey.exec(r);
  if (c) {
    var u = parseInt("" + c[1], 10), f = parseInt("" + c[2], 10) / 100, p = parseInt("" + c[3], 10) / 100, m = "rgb(" + Je(u, f, p) + ")", y = Tr.exec(m);
    if (!y)
      throw new ce(4, r, m);
    return {
      red: parseInt("" + y[1], 10),
      green: parseInt("" + y[2], 10),
      blue: parseInt("" + y[3], 10)
    };
  }
  var O = Ay.exec(r.substring(0, 50));
  if (O) {
    var S = parseInt("" + O[1], 10), R = parseInt("" + O[2], 10) / 100, T = parseInt("" + O[3], 10) / 100, d = "rgb(" + Je(S, R, T) + ")", v = Tr.exec(d);
    if (!v)
      throw new ce(4, r, d);
    return {
      red: parseInt("" + v[1], 10),
      green: parseInt("" + v[2], 10),
      blue: parseInt("" + v[3], 10),
      alpha: parseFloat("" + O[4]) > 1 ? parseFloat("" + O[4]) / 100 : parseFloat("" + O[4])
    };
  }
  throw new ce(5);
}
function Ny(e) {
  var r = e.red / 255, t = e.green / 255, n = e.blue / 255, a = Math.max(r, t, n), l = Math.min(r, t, n), c = (a + l) / 2;
  if (a === l)
    return e.alpha !== void 0 ? {
      hue: 0,
      saturation: 0,
      lightness: c,
      alpha: e.alpha
    } : {
      hue: 0,
      saturation: 0,
      lightness: c
    };
  var u, f = a - l, p = c > 0.5 ? f / (2 - a - l) : f / (a + l);
  switch (a) {
    case r:
      u = (t - n) / f + (t < n ? 6 : 0);
      break;
    case t:
      u = (n - r) / f + 2;
      break;
    default:
      u = (r - t) / f + 4;
      break;
  }
  return u *= 60, e.alpha !== void 0 ? {
    hue: u,
    saturation: p,
    lightness: c,
    alpha: e.alpha
  } : {
    hue: u,
    saturation: p,
    lightness: c
  };
}
function ye(e) {
  return Ny(Me(e));
}
var My = function(r) {
  return r.length === 7 && r[1] === r[2] && r[3] === r[4] && r[5] === r[6] ? "#" + r[1] + r[3] + r[5] : r;
}, Ur = My;
function je(e) {
  var r = e.toString(16);
  return r.length === 1 ? "0" + r : r;
}
function Fr(e) {
  return je(Math.round(e * 255));
}
function By(e, r, t) {
  return Ur("#" + Fr(e) + Fr(r) + Fr(t));
}
function gr(e, r, t) {
  return Je(e, r, t, By);
}
function Hy(e, r, t) {
  if (typeof e == "number" && typeof r == "number" && typeof t == "number")
    return gr(e, r, t);
  if (typeof e == "object" && r === void 0 && t === void 0)
    return gr(e.hue, e.saturation, e.lightness);
  throw new ce(1);
}
function Ly(e, r, t, n) {
  if (typeof e == "number" && typeof r == "number" && typeof t == "number" && typeof n == "number")
    return n >= 1 ? gr(e, r, t) : "rgba(" + Je(e, r, t) + "," + n + ")";
  if (typeof e == "object" && r === void 0 && t === void 0 && n === void 0)
    return e.alpha >= 1 ? gr(e.hue, e.saturation, e.lightness) : "rgba(" + Je(e.hue, e.saturation, e.lightness) + "," + e.alpha + ")";
  throw new ce(2);
}
function Kr(e, r, t) {
  if (typeof e == "number" && typeof r == "number" && typeof t == "number")
    return Ur("#" + je(e) + je(r) + je(t));
  if (typeof e == "object" && r === void 0 && t === void 0)
    return Ur("#" + je(e.red) + je(e.green) + je(e.blue));
  throw new ce(6);
}
function kr(e, r, t, n) {
  if (typeof e == "string" && typeof r == "number") {
    var a = Me(e);
    return "rgba(" + a.red + "," + a.green + "," + a.blue + "," + r + ")";
  } else {
    if (typeof e == "number" && typeof r == "number" && typeof t == "number" && typeof n == "number")
      return n >= 1 ? Kr(e, r, t) : "rgba(" + e + "," + r + "," + t + "," + n + ")";
    if (typeof e == "object" && r === void 0 && t === void 0 && n === void 0)
      return e.alpha >= 1 ? Kr(e.red, e.green, e.blue) : "rgba(" + e.red + "," + e.green + "," + e.blue + "," + e.alpha + ")";
  }
  throw new ce(7);
}
var zy = function(r) {
  return typeof r.red == "number" && typeof r.green == "number" && typeof r.blue == "number" && (typeof r.alpha != "number" || typeof r.alpha > "u");
}, Ry = function(r) {
  return typeof r.red == "number" && typeof r.green == "number" && typeof r.blue == "number" && typeof r.alpha == "number";
}, Gy = function(r) {
  return typeof r.hue == "number" && typeof r.saturation == "number" && typeof r.lightness == "number" && (typeof r.alpha != "number" || typeof r.alpha > "u");
}, Uy = function(r) {
  return typeof r.hue == "number" && typeof r.saturation == "number" && typeof r.lightness == "number" && typeof r.alpha == "number";
};
function $e(e) {
  if (typeof e != "object")
    throw new ce(8);
  if (Ry(e))
    return kr(e);
  if (zy(e))
    return Kr(e);
  if (Uy(e))
    return Ly(e);
  if (Gy(e))
    return Hy(e);
  throw new ce(8);
}
function Vo(e, r, t) {
  return function() {
    var a = t.concat(Array.prototype.slice.call(arguments));
    return a.length >= r ? e.apply(this, a) : Vo(e, r, a);
  };
}
function ee(e) {
  return Vo(e, e.length, []);
}
function Ky(e, r) {
  if (r === "transparent")
    return r;
  var t = ye(r);
  return $e(Y({}, t, {
    hue: t.hue + parseFloat(e)
  }));
}
ee(Ky);
function Ke(e, r, t) {
  return Math.max(e, Math.min(r, t));
}
function qy(e, r) {
  if (r === "transparent")
    return r;
  var t = ye(r);
  return $e(Y({}, t, {
    lightness: Ke(0, 1, t.lightness - parseFloat(e))
  }));
}
ee(qy);
function Wy(e, r) {
  if (r === "transparent")
    return r;
  var t = ye(r);
  return $e(Y({}, t, {
    saturation: Ke(0, 1, t.saturation - parseFloat(e))
  }));
}
ee(Wy);
function Xy(e, r) {
  if (r === "transparent")
    return r;
  var t = ye(r);
  return $e(Y({}, t, {
    lightness: Ke(0, 1, t.lightness + parseFloat(e))
  }));
}
ee(Xy);
function Vy(e, r, t) {
  if (r === "transparent")
    return t;
  if (t === "transparent")
    return r;
  if (e === 0)
    return t;
  var n = Me(r), a = Y({}, n, {
    alpha: typeof n.alpha == "number" ? n.alpha : 1
  }), l = Me(t), c = Y({}, l, {
    alpha: typeof l.alpha == "number" ? l.alpha : 1
  }), u = a.alpha - c.alpha, f = parseFloat(e) * 2 - 1, p = f * u === -1 ? f : f + u, m = 1 + f * u, y = (p / m + 1) / 2, O = 1 - y, S = {
    red: Math.floor(a.red * y + c.red * O),
    green: Math.floor(a.green * y + c.green * O),
    blue: Math.floor(a.blue * y + c.blue * O),
    alpha: a.alpha * parseFloat(e) + c.alpha * (1 - parseFloat(e))
  };
  return kr(S);
}
var Yy = ee(Vy), Yo = Yy;
function Zy(e, r) {
  if (r === "transparent")
    return r;
  var t = Me(r), n = typeof t.alpha == "number" ? t.alpha : 1, a = Y({}, t, {
    alpha: Ke(0, 1, (n * 100 + parseFloat(e) * 100) / 100)
  });
  return kr(a);
}
ee(Zy);
function Jy(e, r) {
  if (r === "transparent")
    return r;
  var t = ye(r);
  return $e(Y({}, t, {
    saturation: Ke(0, 1, t.saturation + parseFloat(e))
  }));
}
ee(Jy);
function Qy(e, r) {
  return r === "transparent" ? r : $e(Y({}, ye(r), {
    hue: parseFloat(e)
  }));
}
ee(Qy);
function e1(e, r) {
  return r === "transparent" ? r : $e(Y({}, ye(r), {
    lightness: parseFloat(e)
  }));
}
ee(e1);
function r1(e, r) {
  return r === "transparent" ? r : $e(Y({}, ye(r), {
    saturation: parseFloat(e)
  }));
}
ee(r1);
function t1(e, r) {
  return r === "transparent" ? r : Yo(parseFloat(e), "rgb(0, 0, 0)", r);
}
ee(t1);
function n1(e, r) {
  return r === "transparent" ? r : Yo(parseFloat(e), "rgb(255, 255, 255)", r);
}
ee(n1);
function a1(e, r) {
  if (r === "transparent")
    return r;
  var t = Me(r), n = typeof t.alpha == "number" ? t.alpha : 1, a = Y({}, t, {
    alpha: Ke(0, 1, +(n * 100 - parseFloat(e) * 100).toFixed(2) / 100)
  });
  return kr(a);
}
var o1 = ee(a1), i1 = o1;
function s1(e) {
  var r = function(t, n) {
    if (typeof t != "object" || !t)
      return t;
    var a = t[Symbol.toPrimitive];
    if (a !== void 0) {
      var l = a.call(t, n);
      if (typeof l != "object")
        return l;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof r == "symbol" ? r : r + "";
}
function o(e, r, t) {
  return (r = s1(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
var w = { Disabled: "disabled", Placeholder: "placeholder", Primary: "primary", Secondary: "secondary", InversePrimary: "inversePrimary", InverseSecondary: "inverseSecondary", Info: "info", Warning: "warning", Error: "error", Success: "success", Link: "link" }, s = { Default: "default", Hover: "hover", Focus: "focus" }, We = D.black, H = D.blue, _ = D.gray, be = D.green, ne = D.red, l1 = D.white, Ce = D.yellow, c1 = { background: o(o(o(o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, We), s.Hover, _.dark2), s.Focus, H.dark3)), w.Secondary, o(o(o({}, s.Default, _.dark4), s.Hover, _.dark2), s.Focus, H.dark3)), w.InversePrimary, o(o(o({}, s.Default, _.light2), s.Hover, _.light3), s.Focus, H.light2)), w.Info, o(o(o({}, s.Default, H.dark3), s.Hover, H.dark3), s.Focus, H.dark3)), w.Warning, o(o(o({}, s.Default, Ce.dark3), s.Hover, Ce.dark3), s.Focus, Ce.dark3)), w.Success, o(o(o({}, s.Default, be.dark3), s.Hover, be.dark3), s.Focus, be.dark3)), w.Error, o(o(o({}, s.Default, ne.dark3), s.Hover, ne.dark3), s.Focus, ne.dark3)), w.Disabled, o(o(o({}, s.Default, _.dark3), s.Hover, _.dark3), s.Focus, _.dark3)), border: o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, _.base), s.Hover, _.base), s.Focus, H.light1)), w.Secondary, o(o(o({}, s.Default, _.dark2), s.Hover, _.dark2), s.Focus, H.light1)), w.Success, o(o(o({}, s.Default, be.dark1), s.Hover, be.dark1), s.Focus, H.light1)), w.Error, o(o(o({}, s.Default, ne.light1), s.Hover, ne.light1), s.Focus, H.light1)), w.Disabled, o(o(o({}, s.Default, _.dark2), s.Hover, _.dark2), s.Focus, _.dark2)), icon: o(o(o(o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, _.light1), s.Hover, _.light3), s.Focus, H.light3)), w.Secondary, o(o(o({}, s.Default, _.base), s.Hover, _.light3), s.Focus, H.light3)), w.InversePrimary, o(o(o({}, s.Default, l1), s.Hover, We), s.Focus, H.dark2)), w.Info, o(o(o({}, s.Default, H.light1), s.Hover, H.light1), s.Focus, H.light1)), w.Warning, o(o(o({}, s.Default, Ce.base), s.Hover, Ce.base), s.Focus, Ce.base)), w.Success, o(o(o({}, s.Default, be.base), s.Hover, be.base), s.Focus, be.base)), w.Error, o(o(o({}, s.Default, ne.light1), s.Hover, ne.light1), s.Focus, ne.light1)), w.Disabled, o(o(o({}, s.Default, _.dark1), s.Hover, _.dark1), s.Focus, _.dark1)), text: o(o(o(o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, _.light2), s.Hover, _.light2), s.Focus, H.light3)), w.Placeholder, o(o(o({}, s.Default, _.dark1), s.Hover, _.dark1), s.Focus, _.dark1)), w.Secondary, o(o(o({}, s.Default, _.light1), s.Hover, _.light2), s.Focus, H.light3)), w.InversePrimary, o(o(o({}, s.Default, We), s.Hover, We), s.Focus, H.dark2)), w.InverseSecondary, o(o(o({}, s.Default, _.dark2), s.Hover, We), s.Focus, H.dark2)), w.Error, o(o(o({}, s.Default, ne.light1), s.Hover, ne.light1), s.Focus, ne.light1)), w.Disabled, o(o(o({}, s.Default, _.dark1), s.Hover, _.dark1), s.Focus, _.dark1)), w.Link, o(o(o({}, s.Default, H.light1), s.Hover, H.light1), s.Focus, H.light1)) }, Ie = D.black, L = D.blue, C = D.gray, he = D.green, ae = D.red, De = D.white, Ee = D.yellow, u1 = { background: o(o(o(o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, De), s.Hover, C.light2), s.Focus, L.light3)), w.Secondary, o(o(o({}, s.Default, C.light3), s.Hover, C.light2), s.Focus, L.light3)), w.InversePrimary, o(o(o({}, s.Default, Ie), s.Hover, C.dark3), s.Focus, L.dark2)), w.Info, o(o(o({}, s.Default, L.light3), s.Hover, L.light3), s.Focus, L.light3)), w.Warning, o(o(o({}, s.Default, Ee.light3), s.Hover, Ee.light3), s.Focus, Ee.light3)), w.Success, o(o(o({}, s.Default, he.light3), s.Hover, he.light3), s.Focus, he.light3)), w.Error, o(o(o({}, s.Default, ae.light3), s.Hover, ae.light3), s.Focus, ae.light3)), w.Disabled, o(o(o({}, s.Default, C.light2), s.Hover, C.light2), s.Focus, C.light2)), border: o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, C.base), s.Hover, C.base), s.Focus, L.light1)), w.Secondary, o(o(o({}, s.Default, C.light2), s.Hover, C.light2), s.Focus, L.light1)), w.Success, o(o(o({}, s.Default, he.dark1), s.Hover, he.dark1), s.Focus, L.light1)), w.Error, o(o(o({}, s.Default, ae.base), s.Hover, ae.base), s.Focus, L.light1)), w.Disabled, o(o(o({}, s.Default, C.light1), s.Hover, C.light1), s.Focus, C.light1)), icon: o(o(o(o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, C.dark1), s.Hover, Ie), s.Focus, L.dark1)), w.Secondary, o(o(o({}, s.Default, C.base), s.Hover, Ie), s.Focus, L.dark1)), w.InversePrimary, o(o(o({}, s.Default, De), s.Hover, De), s.Focus, L.light2)), w.Info, o(o(o({}, s.Default, L.base), s.Hover, L.base), s.Focus, L.base)), w.Warning, o(o(o({}, s.Default, Ee.dark2), s.Hover, Ee.dark2), s.Focus, Ee.dark2)), w.Success, o(o(o({}, s.Default, he.dark1), s.Hover, he.dark1), s.Focus, he.dark1)), w.Error, o(o(o({}, s.Default, ae.base), s.Hover, ae.base), s.Focus, ae.base)), w.Disabled, o(o(o({}, s.Default, C.base), s.Hover, C.base), s.Focus, C.base)), text: o(o(o(o(o(o(o(o({}, w.Primary, o(o(o({}, s.Default, Ie), s.Hover, Ie), s.Focus, L.dark1)), w.Secondary, o(o(o({}, s.Default, C.dark1), s.Hover, Ie), s.Focus, L.dark1)), w.InversePrimary, o(o(o({}, s.Default, De), s.Hover, De), s.Focus, L.light2)), w.InverseSecondary, o(o(o({}, s.Default, C.light1), s.Hover, De), s.Focus, L.light2)), w.Error, o(o(o({}, s.Default, ae.base), s.Hover, ae.base), s.Focus, ae.base)), w.Disabled, o(o(o({}, s.Default, C.base), s.Hover, C.base), s.Focus, C.base)), w.Placeholder, o(o(o({}, s.Default, C.base), s.Hover, C.base), s.Focus, C.base)), w.Link, o(o(o({}, s.Default, L.base), s.Hover, L.base), s.Focus, L.base)) };
o(o({}, pr.Dark, c1), pr.Light, u1);
var br = { Dark: "dark", Light: "light" };
o(o({}, br.Light, { default: "0 0 0 2px ".concat(D.white, ", 0 0 0 4px ").concat(D.blue.light1), input: "0 0 0 3px ".concat(D.blue.light1) }), br.Dark, { default: "0 0 0 2px ".concat(D.black, ", 0 0 0 4px ").concat(D.blue.light1), input: "0 0 0 3px ".concat(D.blue.light1) });
o(o({}, br.Light, { gray: "0 0 0 3px ".concat(D.gray.light2), green: "0 0 0 3px ".concat(D.green.light2), red: "0 0 0 3px ".concat(D.red.light2) }), br.Dark, { gray: "0 0 0 3px ".concat(D.gray.dark2), green: "0 0 0 3px ".concat(D.green.dark3), red: "0 0 0 3px ".concat(D.yellow.dark3) });
var f1 = i1(0.75, D.black);
o(o({}, pr.Light, { 100: "0px 2px 4px 1px ".concat(f1) }), pr.Dark, { 100: "unset" });
var d1 = { 0: 0, 25: 1, 50: 2, 100: 4, 150: 6, 200: 8, 300: 12, 400: 16, 500: 20, 600: 24, 800: 32, 900: 36, 1e3: 40, 1200: 48, 1400: 56, 1600: 64, 1800: 72, 1: 4, 2: 8, 3: 16, 4: 24, 5: 32, 6: 64, 7: 88 };
function A1(e) {
  const {
    submit: r,
    abandon: t,
    status: n,
    errorMessage: a,
    maxCommentCharacterCount: l,
    messageRatingProps: c
  } = e, u = c.value !== void 0, f = Vr(null), p = n === "submitted", [m, y] = hr(0), O = l ? m > l : !1;
  return /* @__PURE__ */ re.jsxDEV(
    "div",
    {
      className: Xe`
        & > div + div {
          margin-top: 0.5rem;
        }
      `,
      children: [
        /* @__PURE__ */ re.jsxDEV(co, { ...c }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
          lineNumber: 65,
          columnNumber: 7
        }, this),
        u && n !== "abandoned" ? /* @__PURE__ */ re.jsxDEV(re.Fragment, { children: [
          /* @__PURE__ */ re.jsxDEV(
            Yr,
            {
              ref: f,
              cancelButtonText: "Cancel",
              onCancel: () => t(),
              submitButtonText: "Submit",
              onSubmit: async (S) => {
                const T = S.target.querySelector("textarea");
                O || await r((T == null ? void 0 : T.value) ?? "");
              },
              textareaProps: {
                onChange: (S) => {
                  const R = S.target;
                  y(R.value.length);
                },
                // @ts-expect-error Hacky fix for https://jira.mongodb.org/browse/LG-3964
                label: c.value === "liked" ? "Provide additional feedback here. What did you like about this response?" : "Provide additional feedback here. How can we improve?"
              },
              isSubmitted: p,
              submittedMessage: "Submitted! Thank you for your feedback."
            },
            void 0,
            !1,
            {
              fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
              lineNumber: 68,
              columnNumber: 11
            },
            this
          ),
          l && n !== "submitted" ? /* @__PURE__ */ re.jsxDEV(
            "div",
            {
              className: Xe`
                margin-top: -2rem !important;
                display: flex;
                flex-direction: row;
                gap: 0.5rem;
              `,
              children: [
                /* @__PURE__ */ re.jsxDEV(
                  mi,
                  {
                    current: m,
                    max: l
                  },
                  void 0,
                  !1,
                  {
                    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
                    lineNumber: 110,
                    columnNumber: 15
                  },
                  this
                ),
                O ? /* @__PURE__ */ re.jsxDEV(
                  qr,
                  {
                    className: Xe`
                    color: ${i.red.base};
                  `,
                    children: `Message must contain ${l} characters or fewer`
                  },
                  void 0,
                  !1,
                  {
                    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
                    lineNumber: 115,
                    columnNumber: 17
                  },
                  this
                ) : null
              ]
            },
            void 0,
            !0,
            {
              fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
              lineNumber: 102,
              columnNumber: 13
            },
            this
          ) : null,
          a ? /* @__PURE__ */ re.jsxDEV(p1, { errorMessage: a }, void 0, !1, {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
            lineNumber: 127,
            columnNumber: 13
          }, this) : null
        ] }, void 0, !0, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
          lineNumber: 67,
          columnNumber: 9
        }, this) : null
      ]
    },
    void 0,
    !0,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
      lineNumber: 56,
      columnNumber: 5
    },
    this
  );
}
function p1({
  errorMessage: e
}) {
  const { darkMode: r } = ve();
  return /* @__PURE__ */ re.jsxDEV(
    "div",
    {
      className: Xe`
        display: flex;
        gap: ${d1[100]}px;
        align-items: center;
      `,
      children: [
        /* @__PURE__ */ re.jsxDEV(hi, { color: i.red.base }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
          lineNumber: 150,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ re.jsxDEV(
          qr,
          {
            className: Xe`
          color: ${r ? i.gray.light1 : i.gray.dark2};
        `,
            children: e
          },
          void 0,
          !1,
          {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
            lineNumber: 151,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    !0,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageRating.tsx",
      lineNumber: 143,
      columnNumber: 5
    },
    this
  );
}
export {
  p1 as InlineMessageFeedbackErrorState,
  A1 as MessageRatingWithFeedbackComment
};
