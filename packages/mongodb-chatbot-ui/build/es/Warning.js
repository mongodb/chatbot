import { r as M, a as R, g as D } from "./index2.js";
import G from "react";
var A = { exports: {} };
(function(E, T) {
  (function(d, u) {
    E.exports = u(G, M);
  })(R, function(d, u) {
    function z(e) {
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
    var g = z(d);
    function W(e) {
      var t = function(r, a) {
        if (typeof r != "object" || !r)
          return r;
        var n = r[Symbol.toPrimitive];
        if (n !== void 0) {
          var l = n.call(r, a);
          if (typeof l != "object")
            return l;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(r);
      }(e, "string");
      return typeof t == "symbol" ? t : t + "";
    }
    function c(e, t, r) {
      return (t = W(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
    }
    function v() {
      return v = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var r = arguments[t];
          for (var a in r)
            Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
        }
        return e;
      }, v.apply(this, arguments);
    }
    function N(e, t) {
      if (e == null)
        return {};
      var r, a, n = function(f, s) {
        if (f == null)
          return {};
        var i, o, b = {}, p = Object.keys(f);
        for (o = 0; o < p.length; o++)
          i = p[o], s.indexOf(i) >= 0 || (b[i] = f[i]);
        return b;
      }(e, t);
      if (Object.getOwnPropertySymbols) {
        var l = Object.getOwnPropertySymbols(e);
        for (a = 0; a < l.length; a++)
          r = l[a], t.indexOf(r) >= 0 || Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r]);
      }
      return n;
    }
    function O(e, t) {
      return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
    }
    var j, h, C = { small: 14, default: 16, large: 20, xlarge: 24 }, S = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], m = function(e) {
      var t = e.className, r = e.size, a = r === void 0 ? 16 : r, n = e.title, l = e["aria-label"], f = e["aria-labelledby"], s = e.fill, i = e.role, o = i === void 0 ? "img" : i, b = N(e, S), p = u.css(j || (j = O([`
        color: `, `;
      `])), s), Z = u.css(h || (h = O([`
        flex-shrink: 0;
      `]))), L = function($, I, y) {
        var x, w = y["aria-label"], P = y["aria-labelledby"], k = y.title;
        switch ($) {
          case "img":
            return w || P || k ? c(c(c({}, "aria-labelledby", P), "aria-label", w), "title", k) : { "aria-label": (x = I, "".concat(x.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(o, "CheckmarkWithCircle", c(c({ title: n }, "aria-label", l), "aria-labelledby", f));
      return g.createElement("svg", v({ className: u.cx(c({}, p, s != null), Z, t), height: typeof a == "number" ? a : C[a], width: typeof a == "number" ? a : C[a], role: o }, L, b, { viewBox: "0 0 16 16" }), g.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM10.4485 4.89583C10.8275 4.45816 11.4983 4.43411 11.9077 4.84352C12.2777 5.21345 12.2989 5.80633 11.9564 6.2018L7.38365 11.4818C7.31367 11.5739 7.22644 11.6552 7.12309 11.7208C6.65669 12.0166 6.03882 11.8783 5.74302 11.4119L3.9245 8.54448C3.6287 8.07809 3.767 7.46021 4.2334 7.16442C4.69979 6.86863 5.31767 7.00693 5.61346 7.47332L6.71374 9.20819L10.4485 4.89583Z", fill: "currentColor" }));
    };
    return m.displayName = "CheckmarkWithCircle", m.isGlyph = !0, m;
  });
})(A);
var V = A.exports;
const H = /* @__PURE__ */ D(V);
var B = { exports: {} };
(function(E, T) {
  (function(d, u) {
    E.exports = u(G, M);
  })(R, function(d, u) {
    function z(e) {
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
    var g = z(d);
    function W(e) {
      var t = function(r, a) {
        if (typeof r != "object" || !r)
          return r;
        var n = r[Symbol.toPrimitive];
        if (n !== void 0) {
          var l = n.call(r, a);
          if (typeof l != "object")
            return l;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(r);
      }(e, "string");
      return typeof t == "symbol" ? t : t + "";
    }
    function c(e, t, r) {
      return (t = W(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
    }
    function v() {
      return v = Object.assign ? Object.assign.bind() : function(e) {
        for (var t = 1; t < arguments.length; t++) {
          var r = arguments[t];
          for (var a in r)
            Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
        }
        return e;
      }, v.apply(this, arguments);
    }
    function N(e, t) {
      if (e == null)
        return {};
      var r, a, n = function(f, s) {
        if (f == null)
          return {};
        var i, o, b = {}, p = Object.keys(f);
        for (o = 0; o < p.length; o++)
          i = p[o], s.indexOf(i) >= 0 || (b[i] = f[i]);
        return b;
      }(e, t);
      if (Object.getOwnPropertySymbols) {
        var l = Object.getOwnPropertySymbols(e);
        for (a = 0; a < l.length; a++)
          r = l[a], t.indexOf(r) >= 0 || Object.prototype.propertyIsEnumerable.call(e, r) && (n[r] = e[r]);
      }
      return n;
    }
    function O(e, t) {
      return t || (t = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(t) } }));
    }
    var j, h, C = { small: 14, default: 16, large: 20, xlarge: 24 }, S = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], m = function(e) {
      var t = e.className, r = e.size, a = r === void 0 ? 16 : r, n = e.title, l = e["aria-label"], f = e["aria-labelledby"], s = e.fill, i = e.role, o = i === void 0 ? "img" : i, b = N(e, S), p = u.css(j || (j = O([`
        color: `, `;
      `])), s), Z = u.css(h || (h = O([`
        flex-shrink: 0;
      `]))), L = function($, I, y) {
        var x, w = y["aria-label"], P = y["aria-labelledby"], k = y.title;
        switch ($) {
          case "img":
            return w || P || k ? c(c(c({}, "aria-labelledby", P), "aria-label", w), "title", k) : { "aria-label": (x = I, "".concat(x.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(o, "Warning", c(c({ title: n }, "aria-label", l), "aria-labelledby", f));
      return g.createElement("svg", v({ className: u.cx(c({}, p, s != null), Z, t), height: typeof a == "number" ? a : C[a], width: typeof a == "number" ? a : C[a], role: o }, L, b, { viewBox: "0 0 16 16" }), g.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8.8639 1.51357C8.49039 0.828811 7.50961 0.828811 7.1361 1.51357L1.12218 12.5388C0.763263 13.1968 1.23814 14 1.98608 14H14.0139C14.7619 14 15.2367 13.1968 14.8778 12.5388L8.8639 1.51357ZM7 5C7 4.44772 7.44772 4 8 4C8.55228 4 9 4.44772 9 5V9C9 9.55228 8.55228 10 8 10C7.44772 10 7 9.55228 7 9V5ZM9 12C9 12.5523 8.55228 13 8 13C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11C8.55228 11 9 11.4477 9 12Z", fill: "currentColor" }));
    };
    return m.displayName = "Warning", m.isGlyph = !0, m;
  });
})(B);
var _ = B.exports;
const J = /* @__PURE__ */ D(_);
export {
  J as W,
  H as p
};
