import { r as R, a as Z, g as _ } from "./index2.js";
import q from "react";
var E = { exports: {} };
(function(z, B) {
  (function(d, u) {
    z.exports = u(q, R);
  })(Z, function(d, u) {
    function N(e) {
      if (e && typeof e == "object" && "default" in e)
        return e;
      var t = /* @__PURE__ */ Object.create(null);
      return e && Object.keys(e).forEach(function(r) {
        if (r !== "default") {
          var a = Object.getOwnPropertyDescriptor(e, r);
          Object.defineProperty(t, r, a.get ? a : { enumerable: !0, get: function() {
            return e[r];
          } });
        }
      }), t.default = e, Object.freeze(t);
    }
    var g = N(d);
    function S(e) {
      var t = function(r, a) {
        if (typeof r != "object" || !r)
          return r;
        var l = r[Symbol.toPrimitive];
        if (l !== void 0) {
          var n = l.call(r, a);
          if (typeof n != "object")
            return n;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(r);
      }(e, "string");
      return typeof t == "symbol" ? t : t + "";
    }
    function c(e, t, r) {
      return (t = S(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
    }
    function m() {
      return m = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var r = arguments[t];
          for (var a in r)
            Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
        }
        return e;
      }, m.apply(this, arguments);
    }
    function X(e, t) {
      if (e == null)
        return {};
      var r, a, l = function(f, s) {
        if (f == null)
          return {};
        var i, o, b = {}, p = Object.keys(f);
        for (o = 0; o < p.length; o++)
          i = p[o], s.indexOf(i) >= 0 || (b[i] = f[i]);
        return b;
      }(e, t);
      if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for (a = 0; a < n.length; a++)
          r = n[a], t.indexOf(r) >= 0 || Object.prototype.propertyIsEnumerable.call(e, r) && (l[r] = e[r]);
      }
      return l;
    }
    function O(e, t) {
      return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
    }
    var j, h, x = { small: 14, default: 16, large: 20, xlarge: 24 }, $ = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], v = function(e) {
      var t = e.className, r = e.size, a = r === void 0 ? 16 : r, l = e.title, n = e["aria-label"], f = e["aria-labelledby"], s = e.fill, i = e.role, o = i === void 0 ? "img" : i, b = X(e, $), p = u.css(j || (j = O([`
        color: `, `;
      `])), s), k = u.css(h || (h = O([`
        flex-shrink: 0;
      `]))), D = function(G, I, y) {
        var L, w = y["aria-label"], C = y["aria-labelledby"], P = y.title;
        switch (G) {
          case "img":
            return w || C || P ? c(c(c({}, "aria-labelledby", C), "aria-label", w), "title", P) : { "aria-label": (L = I, "".concat(L.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(o, "X", c(c({ title: l }, "aria-label", n), "aria-labelledby", f));
      return g.createElement("svg", m({ className: u.cx(c({}, p, s != null), k, t), height: typeof a == "number" ? a : x[a], width: typeof a == "number" ? a : x[a], role: o }, D, b, { viewBox: "0 0 16 16" }), g.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12.2028 3.40381C11.8123 3.01329 11.1791 3.01329 10.7886 3.40381L8.3137 5.87869L5.83883 3.40381C5.44831 3.01329 4.81514 3.01329 4.42462 3.40381L3.71751 4.11092C3.32699 4.50144 3.32699 5.13461 3.71751 5.52513L6.19238 8.00001L3.71751 10.4749C3.32699 10.8654 3.32699 11.4986 3.71751 11.8891L4.42462 12.5962C4.81514 12.9867 5.44831 12.9867 5.83883 12.5962L8.3137 10.1213L10.7886 12.5962C11.1791 12.9867 11.8123 12.9867 12.2028 12.5962L12.9099 11.8891C13.3004 11.4986 13.3004 10.8654 12.9099 10.4749L10.435 8.00001L12.9099 5.52513C13.3004 5.13461 13.3004 4.50144 12.9099 4.11092L12.2028 3.40381Z", fill: "currentColor" }));
    };
    return v.displayName = "X", v.isGlyph = !0, v;
  });
})(E);
var A = E.exports;
const T = /* @__PURE__ */ _(A);
export {
  T as l
};
