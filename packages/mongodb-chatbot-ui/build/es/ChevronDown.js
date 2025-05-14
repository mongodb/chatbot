import { r as Z, a as _, g as q } from "./index2.js";
import A from "react";
var E = { exports: {} };
(function(z, F) {
  (function(d, u) {
    z.exports = u(A, Z);
  })(_, function(d, u) {
    function D(e) {
      if (e && typeof e == "object" && "default" in e)
        return e;
      var t = /* @__PURE__ */ Object.create(null);
      return e && Object.keys(e).forEach(function(r) {
        if (r !== "default") {
          var n = Object.getOwnPropertyDescriptor(e, r);
          Object.defineProperty(t, r, n.get ? n : { enumerable: !0, get: function() {
            return e[r];
          } });
        }
      }), t.default = e, Object.freeze(t);
    }
    var g = D(d);
    function N(e) {
      var t = function(r, n) {
        if (typeof r != "object" || !r)
          return r;
        var a = r[Symbol.toPrimitive];
        if (a !== void 0) {
          var l = a.call(r, n);
          if (typeof l != "object")
            return l;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(r);
      }(e, "string");
      return typeof t == "symbol" ? t : t + "";
    }
    function c(e, t, r) {
      return (t = N(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
    }
    function v() {
      return v = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var r = arguments[t];
          for (var n in r)
            Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
        }
        return e;
      }, v.apply(this, arguments);
    }
    function S(e, t) {
      if (e == null)
        return {};
      var r, n, a = function(f, s) {
        if (f == null)
          return {};
        var i, o, b = {}, p = Object.keys(f);
        for (o = 0; o < p.length; o++)
          i = p[o], s.indexOf(i) >= 0 || (b[i] = f[i]);
        return b;
      }(e, t);
      if (Object.getOwnPropertySymbols) {
        var l = Object.getOwnPropertySymbols(e);
        for (n = 0; n < l.length; n++)
          r = l[n], t.indexOf(r) >= 0 || Object.prototype.propertyIsEnumerable.call(e, r) && (a[r] = e[r]);
      }
      return a;
    }
    function O(e, t) {
      return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
    }
    var j, h, w = { small: 14, default: 16, large: 20, xlarge: 24 }, $ = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], m = function(e) {
      var t = e.className, r = e.size, n = r === void 0 ? 16 : r, a = e.title, l = e["aria-label"], f = e["aria-labelledby"], s = e.fill, i = e.role, o = i === void 0 ? "img" : i, b = S(e, $), p = u.css(j || (j = O([`
        color: `, `;
      `])), s), k = u.css(h || (h = O([`
        flex-shrink: 0;
      `]))), G = function(I, R, y) {
        var x, C = y["aria-label"], P = y["aria-labelledby"], L = y.title;
        switch (I) {
          case "img":
            return C || P || L ? c(c(c({}, "aria-labelledby", P), "aria-label", C), "title", L) : { "aria-label": (x = R, "".concat(x.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(o, "ChevronDown", c(c({ title: a }, "aria-label", l), "aria-labelledby", f));
      return g.createElement("svg", v({ className: u.cx(c({}, p, s != null), k, t), height: typeof n == "number" ? n : w[n], width: typeof n == "number" ? n : w[n], role: o }, G, b, { viewBox: "0 0 16 16" }), g.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1.63604 5.36396C1.24551 5.75449 1.24551 6.38765 1.63604 6.77817L6.58579 11.7279L7.29289 12.435C7.68342 12.8256 8.31658 12.8256 8.70711 12.435L9.41421 11.7279L14.364 6.77817C14.7545 6.38765 14.7545 5.75449 14.364 5.36396L13.6569 4.65685C13.2663 4.26633 12.6332 4.26633 12.2426 4.65685L8 8.89949L3.75736 4.65685C3.36684 4.26633 2.73367 4.26633 2.34315 4.65685L1.63604 5.36396Z", fill: "currentColor" }));
    };
    return m.displayName = "ChevronDown", m.isGlyph = !0, m;
  });
})(E);
var B = E.exports;
const H = /* @__PURE__ */ q(B);
export {
  H as t
};
