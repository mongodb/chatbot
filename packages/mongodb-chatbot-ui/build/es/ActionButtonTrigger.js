import { j as se } from "./jsx-dev-runtime.js";
import { r as ue, a as fe, g as me, m as O, X as Y, F as h, T as R, E as Z, b as M, N as G, d as ee, n as te, V as de } from "./index2.js";
import b, { forwardRef as re, useRef as pe, useState as be } from "react";
import { t as ge } from "./index4.js";
import { A as ve } from "./index13.js";
import { t as ye } from "./ChevronDown.js";
import { H as he, D as Oe, Z as je, k as Ce } from "./index11.js";
import { s as xe, a as we } from "./Transition.js";
import { useChatbotContext as ke } from "./useChatbotContext.js";
import "./index5.js";
import "./index14.js";
import "./index15.js";
import "./index10.js";
import "./index6.js";
import "./X.js";
import "./index9.js";
import "react-dom";
import "./ChatbotProvider.js";
var ne = { exports: {} };
(function(e, n) {
  (function(t, o) {
    e.exports = o(b, ue);
  })(fe, function(t, o) {
    function i(r) {
      if (r && typeof r == "object" && "default" in r)
        return r;
      var l = /* @__PURE__ */ Object.create(null);
      return r && Object.keys(r).forEach(function(a) {
        if (a !== "default") {
          var c = Object.getOwnPropertyDescriptor(r, a);
          Object.defineProperty(l, a, c.get ? c : { enumerable: !0, get: function() {
            return r[a];
          } });
        }
      }), l.default = r, Object.freeze(l);
    }
    var s = i(t);
    function f(r) {
      var l = function(a, c) {
        if (typeof a != "object" || !a)
          return a;
        var y = a[Symbol.toPrimitive];
        if (y !== void 0) {
          var u = y.call(a, c);
          if (typeof u != "object")
            return u;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(a);
      }(r, "string");
      return typeof l == "symbol" ? l : l + "";
    }
    function m(r, l, a) {
      return (l = f(l)) in r ? Object.defineProperty(r, l, { value: a, enumerable: !0, configurable: !0, writable: !0 }) : r[l] = a, r;
    }
    function d() {
      return d = Object.assign ? Object.assign.bind() : function(r) {
        for (var l = 1; l < arguments.length; l++) {
          var a = arguments[l];
          for (var c in a)
            Object.prototype.hasOwnProperty.call(a, c) && (r[c] = a[c]);
        }
        return r;
      }, d.apply(this, arguments);
    }
    function g(r, l) {
      if (r == null)
        return {};
      var a, c, y = function(x, S) {
        if (x == null)
          return {};
        var w, k, P = {}, T = Object.keys(x);
        for (k = 0; k < T.length; k++)
          w = T[k], S.indexOf(w) >= 0 || (P[w] = x[w]);
        return P;
      }(r, l);
      if (Object.getOwnPropertySymbols) {
        var u = Object.getOwnPropertySymbols(r);
        for (c = 0; c < u.length; c++)
          a = u[c], l.indexOf(a) >= 0 || Object.prototype.propertyIsEnumerable.call(r, a) && (y[a] = r[a]);
      }
      return y;
    }
    function v(r, l) {
      return l || (l = r.slice(0)), Object.freeze(Object.defineProperties(r, { raw: { value: Object.freeze(l) } }));
    }
    var p, C, E = { small: 14, default: 16, large: 20, xlarge: 24 }, $ = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], L = function(r) {
      var l = r.className, a = r.size, c = a === void 0 ? 16 : a, y = r.title, u = r["aria-label"], x = r["aria-labelledby"], S = r.fill, w = r.role, k = w === void 0 ? "img" : w, P = g(r, $), T = o.css(p || (p = v([`
        color: `, `;
      `])), S), ae = o.css(C || (C = v([`
        flex-shrink: 0;
      `]))), ie = function(le, ce, A) {
        var D, I = A["aria-label"], F = A["aria-labelledby"], B = A.title;
        switch (le) {
          case "img":
            return I || F || B ? m(m(m({}, "aria-labelledby", F), "aria-label", I), "title", B) : { "aria-label": (D = ce, "".concat(D.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(k, "Sparkle", m(m({ title: y }, "aria-label", u), "aria-labelledby", x));
      return s.createElement("svg", d({ className: o.cx(m({}, T, S != null), ae, l), height: typeof c == "number" ? c : E[c], width: typeof c == "number" ? c : E[c], role: k }, ie, P, { viewBox: "0 0 16 16" }), s.createElement("path", { d: "M6.27334 2.89343L5.27501 5.88842C5.1749 6.18877 4.93922 6.42445 4.63887 6.52456L1.64388 7.52289C1.18537 7.67573 1.18537 8.32427 1.64388 8.47711L4.63887 9.47544C4.93922 9.57555 5.1749 9.81123 5.27501 10.1116L6.27334 13.1066C6.42618 13.5651 7.07472 13.5651 7.22756 13.1066L8.22589 10.1116C8.326 9.81123 8.56168 9.57555 8.86203 9.47544L11.857 8.47711C12.3155 8.32427 12.3155 7.67573 11.857 7.52289L8.86203 6.52456C8.56168 6.42445 8.326 6.18877 8.22589 5.88842L7.22756 2.89343C7.07472 2.43492 6.42618 2.43492 6.27334 2.89343Z", fill: "currentColor" }), s.createElement("path", { d: "M12.5469 1.17194L12.3158 1.8651C12.2157 2.16545 11.98 2.40113 11.6797 2.50125L10.9865 2.7323C10.7573 2.80872 10.7573 3.13299 10.9865 3.20941L11.6797 3.44046C11.98 3.54058 12.2157 3.77626 12.3158 4.0766L12.5469 4.76977C12.6233 4.99902 12.9476 4.99902 13.024 4.76977L13.255 4.0766C13.3552 3.77626 13.5908 3.54058 13.8912 3.44046L14.5843 3.20941C14.8136 3.13299 14.8136 2.80872 14.5843 2.7323L13.8912 2.50125C13.5908 2.40113 13.3552 2.16545 13.255 1.8651L13.024 1.17194C12.9476 0.942687 12.6233 0.942687 12.5469 1.17194Z", fill: "currentColor" }), s.createElement("path", { d: "M12.5469 11.2302L12.3158 11.9234C12.2157 12.2237 11.98 12.4594 11.6797 12.5595L10.9865 12.7906C10.7573 12.867 10.7573 13.1913 10.9865 13.2677L11.6797 13.4988C11.98 13.5989 12.2157 13.8346 12.3158 14.1349L12.5469 14.8281C12.6233 15.0573 12.9476 15.0573 13.024 14.8281L13.255 14.1349C13.3552 13.8346 13.5908 13.5989 13.8912 13.4988L14.5843 13.2677C14.8136 13.1913 14.8136 12.867 14.5843 12.7906L13.8912 12.5595C13.5908 12.4594 13.3552 12.2237 13.255 11.9234L13.024 11.2302C12.9476 11.001 12.6233 11.001 12.5469 11.2302Z", fill: "currentColor" }));
    };
    return L.displayName = "Sparkle", L.isGlyph = !0, L;
  });
})(ne);
var Ee = ne.exports;
const Le = /* @__PURE__ */ me(Ee);
function Ne(e) {
  var n = function(t, o) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var s = i.call(t, o);
      if (typeof s != "object")
        return s;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function H(e, n, t) {
  return (n = Ne(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function N() {
  return N = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var o in t)
        Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
    }
    return e;
  }, N.apply(this, arguments);
}
function oe(e, n) {
  if (e == null)
    return {};
  var t, o, i = function(f, m) {
    if (f == null)
      return {};
    var d, g, v = {}, p = Object.keys(f);
    for (g = 0; g < p.length; g++)
      d = p[g], m.indexOf(d) >= 0 || (v[d] = f[d]);
    return v;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var s = Object.getOwnPropertySymbols(e);
    for (o = 0; o < s.length; o++)
      t = s[o], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
function j(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
function Se(e, n) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, o) {
    var i = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (i != null) {
      var s, f, m, d, g = [], v = !0, p = !1;
      try {
        if (m = (i = i.call(t)).next, o !== 0)
          for (; !(v = (s = m.call(i)).done) && (g.push(s.value), g.length !== o); v = !0)
            ;
      } catch (C) {
        p = !0, f = C;
      } finally {
        try {
          if (!v && i.return != null && (d = i.return(), Object(d) !== d))
            return;
        } finally {
          if (p)
            throw f;
        }
      }
      return g;
    }
  }(e, n) || function(t, o) {
    if (t) {
      if (typeof t == "string")
        return U(t, o);
      var i = Object.prototype.toString.call(t).slice(8, -1);
      if (i === "Object" && t.constructor && (i = t.constructor.name), i === "Map" || i === "Set")
        return Array.from(t);
      if (i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))
        return U(t, o);
    }
  }(e, n) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function U(e, n) {
  n > e.length && (n = e.length);
  for (var t = 0, o = new Array(n); t < n; t++)
    o[t] = e[t];
  return o;
}
var q, V, W, _, J, K, Q, X, Pe = O(q || (q = j([`
  border-radius: 40px;
  padding: 0px;
  outline: none;
  border-style: solid;
  cursor: pointer;
  transition: box-shadow `, `ms ease-in-out;
`])), Y.slower), Te = H(H({}, M.Dark, O(V || (V = j([`
    border-color: `, `;
    background-color: `, `;
    color: `, `;
    &:hover {
      box-shadow: `, `;
    }

    &:focus-visible {
      box-shadow: `, `;
    }
  `])), h.green.dark1, h.black, h.green.light1, R.dark.green, Z.dark.default)), M.Light, O(W || (W = j([`
    border-color: `, `;
    background-color: `, `;
    color: `, `;

    &:hover {
      box-shadow: `, `;
    }

    &:focus-visible {
      box-shadow: `, `;
    }
  `])), h.green.dark1, h.white, h.green.dark2, R.light.green, Z.light.default)), $e = O(_ || (_ = j([`
  display: flex;
  gap: `, `px;
  align-items: center;
  padding: 12px `, `px;
`])), G[2], G[3]), Ae = O(J || (J = j([`
  color: inherit;
`]))), Me = ["className", "children", "darkMode"], z = re(function(e, n) {
  var t = e.className, o = e.children, i = e.darkMode, s = oe(e, Me), f = ee(i).theme;
  return b.createElement("button", N({ className: te(Pe, Te[f], t) }, s, { ref: n }), b.createElement("div", { className: $e }, b.createElement(Le, { fill: f === M.Light ? h.green.dark1 : h.green.light1 }), o && b.createElement(ge, { baseFontSize: de.Body1, className: Ae }, b.createElement("b", null, o))));
});
z.displayName = "ChatTrigger";
var ze = O(K || (K = j([`
  position: relative;
`]))), De = O(Q || (Q = j([`
  transition: all `, `ms ease-in-out;
  transform-origin: bottom right;
  min-width: 360px;
  width: 360px;
`])), Y.default), Ie = O(X || (X = j([`
  border-radius: 24px;
`]))), Fe = ["className", "children", "defaultOpen", "darkMode", "trigger", "badgeText", "triggerText", "title", "open", "onTriggerClick", "onClose", "popoverProps"], Be = re(function(e, n) {
  var t = e.className, o = e.children, i = e.defaultOpen, s = i !== void 0 && i, f = e.darkMode, m = e.trigger, d = e.badgeText, g = e.triggerText, v = e.title, p = e.open, C = e.onTriggerClick, E = e.onClose, $ = e.popoverProps, L = oe(e, Fe), r = pe(null), l = Se(be(s), 2), a = l[0], c = l[1], y = function(u) {
    p === void 0 && c(!1), E == null || E(u);
  };
  return b.createElement("div", N({ ref: n }, L, { className: te(ze, t) }), m ?? b.createElement(z, { onClick: function(u) {
    p === void 0 && c(function(x) {
      return !x;
    }), C == null || C(u);
  } }, g), b.createElement(he, N({ justify: Oe.End, align: je.Top, renderMode: Ce.Portal }, $, { active: p ?? a }), b.createElement(xe, { nodeRef: r, in: !0, timeout: 100 }, function(u) {
    return b.createElement("div", { ref: r, className: De, style: { transform: u === "entering" || u === "entered" ? "scale(1)" : "scale(0)", opacity: u === "entering" || u === "entered" ? 1 : 0 } }, b.createElement(ve, { darkMode: f, badgeText: d, className: Ie, title: v, onClose: y, iconSlot: b.createElement(ye, null) }, o));
  })));
});
Be.displayName = "FixedChatWindow";
function ot(e) {
  const { darkMode: n } = ee(e.darkMode), { chatbotName: t, openChat: o } = ke(), { className: i, text: s } = e, f = s ?? `Ask ${t ?? "the Chatbot"}`;
  return /* @__PURE__ */ se.jsxDEV(
    z,
    {
      className: we(i),
      darkMode: n,
      onClick: o,
      children: f
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ActionButtonTrigger.tsx",
      lineNumber: 19,
      columnNumber: 5
    },
    this
  );
}
export {
  ot as ActionButtonTrigger
};
