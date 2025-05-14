import * as a from "react";
import m, { isValidElement as j2 } from "react";
import { ak as r2, g as Z2, m as x2, n as E2 } from "./index2.js";
function M2(e, t, r, n) {
  var l = -1, o = e == null ? 0 : e.length;
  for (n && o && (r = e[++l]); ++l < o; )
    r = t(r, e[l], l, e);
  return r;
}
var C2 = M2;
function H2(e) {
  return function(t) {
    return e == null ? void 0 : e[t];
  };
}
var R2 = H2, V2 = R2, P2 = {
  // Latin-1 Supplement block.
  À: "A",
  Á: "A",
  Â: "A",
  Ã: "A",
  Ä: "A",
  Å: "A",
  à: "a",
  á: "a",
  â: "a",
  ã: "a",
  ä: "a",
  å: "a",
  Ç: "C",
  ç: "c",
  Ð: "D",
  ð: "d",
  È: "E",
  É: "E",
  Ê: "E",
  Ë: "E",
  è: "e",
  é: "e",
  ê: "e",
  ë: "e",
  Ì: "I",
  Í: "I",
  Î: "I",
  Ï: "I",
  ì: "i",
  í: "i",
  î: "i",
  ï: "i",
  Ñ: "N",
  ñ: "n",
  Ò: "O",
  Ó: "O",
  Ô: "O",
  Õ: "O",
  Ö: "O",
  Ø: "O",
  ò: "o",
  ó: "o",
  ô: "o",
  õ: "o",
  ö: "o",
  ø: "o",
  Ù: "U",
  Ú: "U",
  Û: "U",
  Ü: "U",
  ù: "u",
  ú: "u",
  û: "u",
  ü: "u",
  Ý: "Y",
  ý: "y",
  ÿ: "y",
  Æ: "Ae",
  æ: "ae",
  Þ: "Th",
  þ: "th",
  ß: "ss",
  // Latin Extended-A block.
  Ā: "A",
  Ă: "A",
  Ą: "A",
  ā: "a",
  ă: "a",
  ą: "a",
  Ć: "C",
  Ĉ: "C",
  Ċ: "C",
  Č: "C",
  ć: "c",
  ĉ: "c",
  ċ: "c",
  č: "c",
  Ď: "D",
  Đ: "D",
  ď: "d",
  đ: "d",
  Ē: "E",
  Ĕ: "E",
  Ė: "E",
  Ę: "E",
  Ě: "E",
  ē: "e",
  ĕ: "e",
  ė: "e",
  ę: "e",
  ě: "e",
  Ĝ: "G",
  Ğ: "G",
  Ġ: "G",
  Ģ: "G",
  ĝ: "g",
  ğ: "g",
  ġ: "g",
  ģ: "g",
  Ĥ: "H",
  Ħ: "H",
  ĥ: "h",
  ħ: "h",
  Ĩ: "I",
  Ī: "I",
  Ĭ: "I",
  Į: "I",
  İ: "I",
  ĩ: "i",
  ī: "i",
  ĭ: "i",
  į: "i",
  ı: "i",
  Ĵ: "J",
  ĵ: "j",
  Ķ: "K",
  ķ: "k",
  ĸ: "k",
  Ĺ: "L",
  Ļ: "L",
  Ľ: "L",
  Ŀ: "L",
  Ł: "L",
  ĺ: "l",
  ļ: "l",
  ľ: "l",
  ŀ: "l",
  ł: "l",
  Ń: "N",
  Ņ: "N",
  Ň: "N",
  Ŋ: "N",
  ń: "n",
  ņ: "n",
  ň: "n",
  ŋ: "n",
  Ō: "O",
  Ŏ: "O",
  Ő: "O",
  ō: "o",
  ŏ: "o",
  ő: "o",
  Ŕ: "R",
  Ŗ: "R",
  Ř: "R",
  ŕ: "r",
  ŗ: "r",
  ř: "r",
  Ś: "S",
  Ŝ: "S",
  Ş: "S",
  Š: "S",
  ś: "s",
  ŝ: "s",
  ş: "s",
  š: "s",
  Ţ: "T",
  Ť: "T",
  Ŧ: "T",
  ţ: "t",
  ť: "t",
  ŧ: "t",
  Ũ: "U",
  Ū: "U",
  Ŭ: "U",
  Ů: "U",
  Ű: "U",
  Ų: "U",
  ũ: "u",
  ū: "u",
  ŭ: "u",
  ů: "u",
  ű: "u",
  ų: "u",
  Ŵ: "W",
  ŵ: "w",
  Ŷ: "Y",
  ŷ: "y",
  Ÿ: "Y",
  Ź: "Z",
  Ż: "Z",
  Ž: "Z",
  ź: "z",
  ż: "z",
  ž: "z",
  Ĳ: "IJ",
  ĳ: "ij",
  Œ: "Oe",
  œ: "oe",
  ŉ: "'n",
  ſ: "s"
}, L2 = V2(P2), B2 = L2, A2 = B2, S2 = r2, U2 = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g, k2 = "\\u0300-\\u036f", D2 = "\\ufe20-\\ufe2f", W2 = "\\u20d0-\\u20ff", I2 = k2 + D2 + W2, N2 = "[" + I2 + "]", z2 = RegExp(N2, "g");
function $2(e) {
  return e = S2(e), e && e.replace(U2, A2).replace(z2, "");
}
var F2 = $2, T2 = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
function G2(e) {
  return e.match(T2) || [];
}
var _2 = G2, J2 = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
function X2(e) {
  return J2.test(e);
}
var Y2 = X2, n2 = "\\ud800-\\udfff", K2 = "\\u0300-\\u036f", q2 = "\\ufe20-\\ufe2f", Q2 = "\\u20d0-\\u20ff", ea = K2 + q2 + Q2, a2 = "\\u2700-\\u27bf", l2 = "a-z\\xdf-\\xf6\\xf8-\\xff", ta = "\\xac\\xb1\\xd7\\xf7", ra = "\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf", na = "\\u2000-\\u206f", aa = " \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000", o2 = "A-Z\\xc0-\\xd6\\xd8-\\xde", la = "\\ufe0e\\ufe0f", i2 = ta + ra + na + aa, c2 = "['’]", Ne = "[" + i2 + "]", oa = "[" + ea + "]", u2 = "\\d+", ia = "[" + a2 + "]", s2 = "[" + l2 + "]", h2 = "[^" + n2 + i2 + u2 + a2 + l2 + o2 + "]", ca = "\\ud83c[\\udffb-\\udfff]", ua = "(?:" + oa + "|" + ca + ")", sa = "[^" + n2 + "]", v2 = "(?:\\ud83c[\\udde6-\\uddff]){2}", g2 = "[\\ud800-\\udbff][\\udc00-\\udfff]", v = "[" + o2 + "]", ha = "\\u200d", ze = "(?:" + s2 + "|" + h2 + ")", va = "(?:" + v + "|" + h2 + ")", $e = "(?:" + c2 + "(?:d|ll|m|re|s|t|ve))?", Fe = "(?:" + c2 + "(?:D|LL|M|RE|S|T|VE))?", f2 = ua + "?", p2 = "[" + la + "]?", ga = "(?:" + ha + "(?:" + [sa, v2, g2].join("|") + ")" + p2 + f2 + ")*", fa = "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", pa = "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", ma = p2 + f2 + ga, wa = "(?:" + [ia, v2, g2].join("|") + ")" + ma, da = RegExp([
  v + "?" + s2 + "+" + $e + "(?=" + [Ne, v, "$"].join("|") + ")",
  va + "+" + Fe + "(?=" + [Ne, v + ze, "$"].join("|") + ")",
  v + "?" + ze + "+" + $e,
  v + "+" + Fe,
  pa,
  fa,
  u2,
  wa
].join("|"), "g");
function ba(e) {
  return e.match(da) || [];
}
var Oa = ba, ya = _2, ja = Y2, Za = r2, xa = Oa;
function Ea(e, t, r) {
  return e = Za(e), t = r ? void 0 : t, t === void 0 ? ja(e) ? xa(e) : ya(e) : e.match(t) || [];
}
var Ma = Ea, Ca = C2, Ha = F2, Ra = Ma, Va = "['’]", Pa = RegExp(Va, "g");
function La(e) {
  return function(t) {
    return Ca(Ra(Ha(t).replace(Pa, "")), e, "");
  };
}
var Ba = La, Aa = Ba, Sa = Aa(function(e, t, r) {
  return e + (r ? "-" : "") + t.toLowerCase();
}), Ua = Sa;
const Te = /* @__PURE__ */ Z2(Ua);
function ka(e) {
  var t = function(r, n) {
    if (typeof r != "object" || !r)
      return r;
    var l = r[Symbol.toPrimitive];
    if (l !== void 0) {
      var o = l.call(r, n);
      if (typeof o != "object")
        return o;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(r);
  }(e, "string");
  return typeof t == "symbol" ? t : t + "";
}
function d(e) {
  return d = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(t) {
    return typeof t;
  } : function(t) {
    return t && typeof Symbol == "function" && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
  }, d(e);
}
function h(e, t, r) {
  return (t = ka(t)) in e ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 }) : e[t] = r, e;
}
function b() {
  return b = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, b.apply(this, arguments);
}
function m2(e, t) {
  if (e == null)
    return {};
  var r, n, l = function(i, s) {
    if (i == null)
      return {};
    var c, u, g = {}, f = Object.keys(i);
    for (u = 0; u < f.length; u++)
      c = f[u], s.indexOf(c) >= 0 || (g[c] = i[c]);
    return g;
  }(e, t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    for (n = 0; n < o.length; n++)
      r = o[n], t.indexOf(r) >= 0 || Object.prototype.propertyIsEnumerable.call(e, r) && (l[r] = e[r]);
  }
  return l;
}
var Ge, Da = { Small: "small", Default: "default", Large: "large", XLarge: "xlarge" }, Wa = { small: 14, default: 16, large: 20, xlarge: 24 }, Ia = ["className", "size", "fill", "title", "aria-labelledby", "aria-label", "role"];
function Na(e, t) {
  var r = function(n) {
    var l, o, i = n.className, s = n.size, c = s === void 0 ? Da.Default : s, u = n.fill, g = n.title, f = n["aria-labelledby"], w2 = n["aria-label"], Se = n.role, p = Se === void 0 ? "img" : Se, d2 = m2(n, Ia), b2 = x2(Ge || (l = [`
      color: `, `;
    `], o || (o = l.slice(0)), Ge = Object.freeze(Object.defineProperties(l, { raw: { value: Object.freeze(o) } }))), u), Ue = typeof c == "number" ? c : Wa[c];
    return p !== "img" && p !== "presentation" && console.warn("Please provide a valid role to this component. Valid options are 'img' and 'presentation'. If you'd like the Icon to be accessible to screen readers please use 'img', otherwise set the role to 'presentation'."), m.createElement(t, b({ className: E2(h({}, b2, u != null), i), height: Ue, width: Ue, role: p }, function(O2, y2, w) {
      var ke, De = w["aria-label"], We = w["aria-labelledby"], Ie = w.title;
      switch (O2) {
        case "img":
          return De || We || Ie ? h(h(h({}, "aria-labelledby", We), "aria-label", De), "title", Ie) : { "aria-label": (ke = y2, "".concat(ke.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
        case "presentation":
          return { "aria-hidden": !0, alt: "" };
      }
    }(p, e, h(h({ title: g }, "aria-label", w2), "aria-labelledby", f)), d2));
  };
  return r.displayName = e, r.isGlyph = !0, r;
}
var _e, za = ["glyph"];
function $a(e) {
  var t = function(r) {
    var n = r.glyph, l = m2(r, za), o = e[n];
    if (o)
      return m.createElement(o, l);
    var i = Object.keys(e).find(function(s) {
      return Te(s) === Te(n);
    });
    return console.error("Error in Icon", 'Could not find glyph named "'.concat(n, '" in the icon set.'), i && 'Did you mean "'.concat(i, '?"')), m.createElement(m.Fragment, null);
  };
  return t.displayName = "Icon", t.isGlyph = !0, t;
}
function O() {
  return O = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, O.apply(this, arguments);
}
var Je;
function y() {
  return y = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, y.apply(this, arguments);
}
var Xe;
function j() {
  return j = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, j.apply(this, arguments);
}
var Ye, Ke;
function Z() {
  return Z = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Z.apply(this, arguments);
}
var qe;
function x() {
  return x = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, x.apply(this, arguments);
}
var Qe;
function E() {
  return E = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, E.apply(this, arguments);
}
var e5;
function M() {
  return M = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, M.apply(this, arguments);
}
var t5;
function C() {
  return C = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, C.apply(this, arguments);
}
var r5;
function H() {
  return H = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, H.apply(this, arguments);
}
var n5;
function R() {
  return R = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, R.apply(this, arguments);
}
var a5;
function V() {
  return V = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, V.apply(this, arguments);
}
var l5;
function P() {
  return P = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, P.apply(this, arguments);
}
var o5;
function L() {
  return L = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, L.apply(this, arguments);
}
var i5;
function B() {
  return B = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, B.apply(this, arguments);
}
var c5;
function A() {
  return A = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, A.apply(this, arguments);
}
var u5, s5;
function S() {
  return S = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, S.apply(this, arguments);
}
var h5, v5, g5;
function U() {
  return U = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, U.apply(this, arguments);
}
var f5, p5;
function k() {
  return k = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, k.apply(this, arguments);
}
var m5, w5;
function D() {
  return D = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, D.apply(this, arguments);
}
var d5;
function W() {
  return W = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, W.apply(this, arguments);
}
var b5;
function I() {
  return I = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, I.apply(this, arguments);
}
var O5;
function N() {
  return N = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, N.apply(this, arguments);
}
var y5;
function z() {
  return z = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, z.apply(this, arguments);
}
var j5;
function $() {
  return $ = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, $.apply(this, arguments);
}
var Z5;
function F() {
  return F = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, F.apply(this, arguments);
}
var x5;
function T() {
  return T = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, T.apply(this, arguments);
}
var E5;
function G() {
  return G = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, G.apply(this, arguments);
}
var M5;
function _() {
  return _ = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, _.apply(this, arguments);
}
var C5;
function J() {
  return J = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, J.apply(this, arguments);
}
var H5;
function X() {
  return X = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, X.apply(this, arguments);
}
var R5;
function Y() {
  return Y = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Y.apply(this, arguments);
}
var V5;
function K() {
  return K = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, K.apply(this, arguments);
}
var P5;
function q() {
  return q = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, q.apply(this, arguments);
}
var L5, B5;
function Q() {
  return Q = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Q.apply(this, arguments);
}
var A5, S5;
function e1() {
  return e1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, e1.apply(this, arguments);
}
var U5;
function t1() {
  return t1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, t1.apply(this, arguments);
}
var k5;
function r1() {
  return r1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, r1.apply(this, arguments);
}
var D5, W5;
function n1() {
  return n1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, n1.apply(this, arguments);
}
var I5;
function a1() {
  return a1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, a1.apply(this, arguments);
}
var N5;
function l1() {
  return l1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, l1.apply(this, arguments);
}
var z5;
function o1() {
  return o1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, o1.apply(this, arguments);
}
var $5;
function i1() {
  return i1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, i1.apply(this, arguments);
}
var F5;
function c1() {
  return c1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, c1.apply(this, arguments);
}
var T5;
function u1() {
  return u1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, u1.apply(this, arguments);
}
var G5;
function s1() {
  return s1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, s1.apply(this, arguments);
}
var _5;
function h1() {
  return h1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, h1.apply(this, arguments);
}
var J5;
function v1() {
  return v1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, v1.apply(this, arguments);
}
var X5, Y5, K5;
function g1() {
  return g1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, g1.apply(this, arguments);
}
var q5;
function f1() {
  return f1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, f1.apply(this, arguments);
}
var Q5;
function p1() {
  return p1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, p1.apply(this, arguments);
}
var et;
function m1() {
  return m1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, m1.apply(this, arguments);
}
var tt;
function w1() {
  return w1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, w1.apply(this, arguments);
}
var rt, nt;
function d1() {
  return d1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, d1.apply(this, arguments);
}
var at;
function b1() {
  return b1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, b1.apply(this, arguments);
}
var lt;
function O1() {
  return O1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, O1.apply(this, arguments);
}
var ot;
function y1() {
  return y1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, y1.apply(this, arguments);
}
var it, ct;
function j1() {
  return j1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, j1.apply(this, arguments);
}
var ut;
function Z1() {
  return Z1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Z1.apply(this, arguments);
}
var st;
function x1() {
  return x1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, x1.apply(this, arguments);
}
var ht;
function E1() {
  return E1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, E1.apply(this, arguments);
}
var vt;
function M1() {
  return M1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, M1.apply(this, arguments);
}
var gt, ft;
function C1() {
  return C1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, C1.apply(this, arguments);
}
var pt;
function H1() {
  return H1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, H1.apply(this, arguments);
}
var mt;
function R1() {
  return R1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, R1.apply(this, arguments);
}
var wt, dt;
function V1() {
  return V1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, V1.apply(this, arguments);
}
var bt;
function P1() {
  return P1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, P1.apply(this, arguments);
}
var Ot;
function L1() {
  return L1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, L1.apply(this, arguments);
}
var yt;
function B1() {
  return B1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, B1.apply(this, arguments);
}
var jt;
function A1() {
  return A1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, A1.apply(this, arguments);
}
var Zt;
function S1() {
  return S1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, S1.apply(this, arguments);
}
var xt, Et;
function U1() {
  return U1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, U1.apply(this, arguments);
}
var Mt;
function k1() {
  return k1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, k1.apply(this, arguments);
}
var Ct;
function D1() {
  return D1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, D1.apply(this, arguments);
}
var Ht, Rt;
function W1() {
  return W1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, W1.apply(this, arguments);
}
var Vt, Pt;
function I1() {
  return I1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, I1.apply(this, arguments);
}
var Lt;
function N1() {
  return N1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, N1.apply(this, arguments);
}
var Bt, At;
function z1() {
  return z1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, z1.apply(this, arguments);
}
var St;
function $1() {
  return $1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, $1.apply(this, arguments);
}
var Ut, kt;
function F1() {
  return F1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, F1.apply(this, arguments);
}
var Dt;
function T1() {
  return T1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, T1.apply(this, arguments);
}
var Wt, It;
function G1() {
  return G1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, G1.apply(this, arguments);
}
var Nt;
function _1() {
  return _1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, _1.apply(this, arguments);
}
var zt;
function J1() {
  return J1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, J1.apply(this, arguments);
}
var $t, Ft;
function X1() {
  return X1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, X1.apply(this, arguments);
}
var Tt, Gt;
function Y1() {
  return Y1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Y1.apply(this, arguments);
}
var _t;
function K1() {
  return K1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, K1.apply(this, arguments);
}
var Jt, Xt;
function q1() {
  return q1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, q1.apply(this, arguments);
}
var Yt;
function Q1() {
  return Q1 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Q1.apply(this, arguments);
}
var Kt, qt;
function e0() {
  return e0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, e0.apply(this, arguments);
}
var Qt;
function t0() {
  return t0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, t0.apply(this, arguments);
}
var er;
function r0() {
  return r0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, r0.apply(this, arguments);
}
var tr, rr;
function n0() {
  return n0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, n0.apply(this, arguments);
}
var nr, ar;
function a0() {
  return a0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, a0.apply(this, arguments);
}
var lr;
function l0() {
  return l0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, l0.apply(this, arguments);
}
var or;
function o0() {
  return o0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, o0.apply(this, arguments);
}
var ir;
function i0() {
  return i0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, i0.apply(this, arguments);
}
var cr;
function c0() {
  return c0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, c0.apply(this, arguments);
}
var ur;
function u0() {
  return u0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, u0.apply(this, arguments);
}
var sr;
function s0() {
  return s0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, s0.apply(this, arguments);
}
var hr, vr;
function h0() {
  return h0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, h0.apply(this, arguments);
}
var gr;
function v0() {
  return v0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, v0.apply(this, arguments);
}
var fr, pr;
function g0() {
  return g0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, g0.apply(this, arguments);
}
var mr, wr;
function f0() {
  return f0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, f0.apply(this, arguments);
}
var dr;
function p0() {
  return p0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, p0.apply(this, arguments);
}
var br;
function m0() {
  return m0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, m0.apply(this, arguments);
}
var Or, yr;
function w0() {
  return w0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, w0.apply(this, arguments);
}
var jr;
function d0() {
  return d0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, d0.apply(this, arguments);
}
var Zr, xr;
function b0() {
  return b0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, b0.apply(this, arguments);
}
var Er;
function O0() {
  return O0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, O0.apply(this, arguments);
}
var Mr;
function y0() {
  return y0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, y0.apply(this, arguments);
}
var Cr;
function j0() {
  return j0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, j0.apply(this, arguments);
}
var Hr;
function Z0() {
  return Z0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Z0.apply(this, arguments);
}
var Rr, Vr;
function x0() {
  return x0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, x0.apply(this, arguments);
}
var Pr;
function E0() {
  return E0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, E0.apply(this, arguments);
}
var Lr, Br;
function M0() {
  return M0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, M0.apply(this, arguments);
}
var Ar;
function C0() {
  return C0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, C0.apply(this, arguments);
}
var Sr;
function H0() {
  return H0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, H0.apply(this, arguments);
}
var Ur;
function R0() {
  return R0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, R0.apply(this, arguments);
}
var kr;
function V0() {
  return V0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, V0.apply(this, arguments);
}
var Dr;
function P0() {
  return P0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, P0.apply(this, arguments);
}
var Wr, Ir;
function L0() {
  return L0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, L0.apply(this, arguments);
}
var Nr;
function B0() {
  return B0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, B0.apply(this, arguments);
}
var zr, $r;
function A0() {
  return A0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, A0.apply(this, arguments);
}
var Fr, Tr;
function S0() {
  return S0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, S0.apply(this, arguments);
}
var Gr;
function U0() {
  return U0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, U0.apply(this, arguments);
}
var _r;
function k0() {
  return k0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, k0.apply(this, arguments);
}
var Jr;
function D0() {
  return D0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, D0.apply(this, arguments);
}
var Xr;
function W0() {
  return W0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, W0.apply(this, arguments);
}
var Yr;
function I0() {
  return I0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, I0.apply(this, arguments);
}
var Kr;
function N0() {
  return N0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, N0.apply(this, arguments);
}
var qr;
function z0() {
  return z0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, z0.apply(this, arguments);
}
var Qr;
function $0() {
  return $0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, $0.apply(this, arguments);
}
var en;
function F0() {
  return F0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, F0.apply(this, arguments);
}
var tn, rn;
function T0() {
  return T0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, T0.apply(this, arguments);
}
var nn, an, ln;
function G0() {
  return G0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, G0.apply(this, arguments);
}
var on, cn;
function _0() {
  return _0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, _0.apply(this, arguments);
}
var un;
function J0() {
  return J0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, J0.apply(this, arguments);
}
var sn;
function X0() {
  return X0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, X0.apply(this, arguments);
}
var hn;
function Y0() {
  return Y0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Y0.apply(this, arguments);
}
var vn;
function K0() {
  return K0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, K0.apply(this, arguments);
}
var gn;
function q0() {
  return q0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, q0.apply(this, arguments);
}
var fn;
function Q0() {
  return Q0 = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Q0.apply(this, arguments);
}
var pn;
function ee() {
  return ee = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ee.apply(this, arguments);
}
var mn;
function te() {
  return te = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, te.apply(this, arguments);
}
var wn;
function re() {
  return re = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, re.apply(this, arguments);
}
var dn;
function ne() {
  return ne = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ne.apply(this, arguments);
}
var bn;
function ae() {
  return ae = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ae.apply(this, arguments);
}
var On;
function le() {
  return le = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, le.apply(this, arguments);
}
var yn;
function oe() {
  return oe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, oe.apply(this, arguments);
}
var jn;
function ie() {
  return ie = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ie.apply(this, arguments);
}
var Zn;
function ce() {
  return ce = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ce.apply(this, arguments);
}
var xn;
function ue() {
  return ue = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ue.apply(this, arguments);
}
var En;
function se() {
  return se = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, se.apply(this, arguments);
}
var Mn;
function he() {
  return he = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, he.apply(this, arguments);
}
var Cn;
function ve() {
  return ve = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ve.apply(this, arguments);
}
var Hn, Rn;
function ge() {
  return ge = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ge.apply(this, arguments);
}
var Vn;
function fe() {
  return fe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, fe.apply(this, arguments);
}
var Pn;
function pe() {
  return pe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, pe.apply(this, arguments);
}
var Ln;
function me() {
  return me = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, me.apply(this, arguments);
}
var Bn, An, Sn;
function we() {
  return we = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, we.apply(this, arguments);
}
var Un;
function de() {
  return de = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, de.apply(this, arguments);
}
var kn;
function be() {
  return be = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, be.apply(this, arguments);
}
var Dn;
function Oe() {
  return Oe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Oe.apply(this, arguments);
}
var Wn;
function ye() {
  return ye = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, ye.apply(this, arguments);
}
var In;
function je() {
  return je = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, je.apply(this, arguments);
}
var Nn;
function Ze() {
  return Ze = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Ze.apply(this, arguments);
}
var zn;
function xe() {
  return xe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, xe.apply(this, arguments);
}
var $n;
function Ee() {
  return Ee = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Ee.apply(this, arguments);
}
var Fn, Tn;
function Me() {
  return Me = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Me.apply(this, arguments);
}
var Gn;
function Ce() {
  return Ce = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Ce.apply(this, arguments);
}
var _n;
function He() {
  return He = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, He.apply(this, arguments);
}
var Jn;
function Re() {
  return Re = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Re.apply(this, arguments);
}
var Xn;
function Ve() {
  return Ve = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Ve.apply(this, arguments);
}
var Yn;
function Pe() {
  return Pe = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Pe.apply(this, arguments);
}
var Kn, qn;
function Le() {
  return Le = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Le.apply(this, arguments);
}
var Qn;
function Be() {
  return Be = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Be.apply(this, arguments);
}
var e2;
function Ae() {
  return Ae = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var r = arguments[t];
      for (var n in r)
        Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
    }
    return e;
  }, Ae.apply(this, arguments);
}
var t2 = { ActivityFeed: function(e) {
  return a.createElement("svg", O({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), _e || (_e = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1 13V7h4.5A1.5 1.5 0 0 0 7 5.5V1h2a2 2 0 0 1 2 2v4.515a2.5 2.5 0 0 0-2.612 1.602l-1.06 2.808A2.501 2.501 0 0 0 5.59 15H3a2 2 0 0 1-2-2ZM4.914 1h.92v3.833a1 1 0 0 1-1 1H1v-.919a1 1 0 0 1 .293-.707L2.5 3l1.707-1.707A1 1 0 0 1 4.914 1ZM10.8 9.003a1 1 0 0 1 .904.784l.61 2.792.508-.714a1 1 0 0 1 .814-.42H15a1 1 0 0 1 0 2h-.848l-1.519 2.135a1 1 0 0 1-1.792-.367l-.371-1.701-.444 1.175a1 1 0 0 1-.935.646H8a1 1 0 1 1 0-2h.4l1.392-3.686a1 1 0 0 1 1.008-.644Z", clipRule: "evenodd" })));
}, AddFile: function(e) {
  return a.createElement("svg", y({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Je || (Je = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1 7v6a2 2 0 0 0 2 2h5.968a2.25 2.25 0 0 1 .794-4.238A2.251 2.251 0 0 1 11 8.984V3a2 2 0 0 0-2-2H7v4.5A1.5 1.5 0 0 1 5.5 7H1Zm8 6a1 1 0 0 0 1 1h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1a1 1 0 1 0-2 0v1h-1a1 1 0 0 0-1 1ZM5.833 1h-.919a1 1 0 0 0-.707.293L2.5 3 1.293 4.207A1 1 0 0 0 1 4.914v.92h3.833a1 1 0 0 0 1-1V1Z", clipRule: "evenodd" })));
}, AllProducts: function(e) {
  return a.createElement("svg", j({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Xe || (Xe = a.createElement("path", { fill: "currentColor", d: "M2.5 3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1ZM6.5 3.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1ZM11.5 2.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1ZM2.5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1ZM7.5 6.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1ZM10.5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1ZM3.5 10.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1ZM6.5 11.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1ZM11.5 10.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-1Z" })));
}, AnalyticsNode: function(e) {
  return a.createElement("svg", Z({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ye || (Ye = a.createElement("path", { fill: "currentColor", d: "m4.24 11.153 3.04-7.1h1.44l3.04 7.1H10.1l-.63-1.5H6.53l-.63 1.5H4.24Zm2.87-2.88h1.78L8 6.134l-.89 2.14Z" })), Ke || (Ke = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Z", clipRule: "evenodd" })));
}, Apps: function(e) {
  return a.createElement("svg", x({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), qe || (qe = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7 3H3v4h4V3Zm0 6H3v4h4V9Zm2-6h4v4H9V3Zm4 6H9v4h4V9Z", clipRule: "evenodd" })));
}, Array: function(e) {
  return a.createElement("svg", E({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Qe || (Qe = a.createElement("path", { fill: "currentColor", d: "M2.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H4V3h2.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-4ZM13.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5H12V3H9.5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h4Z" })));
}, ArrowDown: function(e) {
  return a.createElement("svg", M({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), e5 || (e5 = a.createElement("path", { fill: "currentColor", d: "M9.168 3v6.944l1.535-1.535a1 1 0 0 1 1.414 0l.239.24a1 1 0 0 1 0 1.414l-3.383 3.382c-.008.01-.017.018-.026.027l-.239.24a1 1 0 0 1-1.414 0L3.643 10.06a1 1 0 0 1 0-1.414l.239-.239a1 1 0 0 1 1.414 0L6.83 9.941V3a1 1 0 0 1 1-1h.338a1 1 0 0 1 1 1Z" })));
}, ArrowLeft: function(e) {
  return a.createElement("svg", C({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), t5 || (t5 = a.createElement("path", { fill: "currentColor", d: "M13 6.832H6.056L7.59 5.297a1 1 0 0 0 0-1.414l-.24-.239a1 1 0 0 0-1.414 0L2.555 7.027c-.01.008-.018.017-.027.026l-.24.239a1 1 0 0 0 0 1.414l3.652 3.651a1 1 0 0 0 1.414 0l.239-.239a1 1 0 0 0 0-1.414L6.059 9.17H13a1 1 0 0 0 1-1v-.338a1 1 0 0 0-1-1Z" })));
}, ArrowRight: function(e) {
  return a.createElement("svg", H({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), r5 || (r5 = a.createElement("path", { fill: "currentColor", d: "M3 6.832h6.944L8.41 5.297a1 1 0 0 1 0-1.414l.24-.239a1 1 0 0 1 1.414 0l3.382 3.383c.01.008.018.017.027.026l.24.239a1 1 0 0 1 0 1.414l-3.652 3.651a1 1 0 0 1-1.414 0l-.239-.239a1 1 0 0 1 0-1.414L9.941 9.17H3a1 1 0 0 1-1-1v-.338a1 1 0 0 1 1-1Z" })));
}, ArrowUp: function(e) {
  return a.createElement("svg", R({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), n5 || (n5 = a.createElement("path", { fill: "currentColor", d: "M9.168 13V6.056l1.535 1.535a1 1 0 0 0 1.414 0l.239-.24a1 1 0 0 0 0-1.414L8.973 2.555a1.023 1.023 0 0 0-.026-.027l-.239-.24a1 1 0 0 0-1.414 0L3.643 5.94a1 1 0 0 0 0 1.414l.239.239a1 1 0 0 0 1.414 0L6.83 6.059V13a1 1 0 0 0 1 1h.338a1 1 0 0 0 1-1Z" })));
}, Beaker: function(e) {
  return a.createElement("svg", V({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), a5 || (a5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M5.953 1.8c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C6.333 1 6.473 1 6.753 1h2.4c.28 0 .42 0 .527.054a.5.5 0 0 1 .218.219c.055.107.055.247.055.527v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.219C9.573 3 9.433 3 9.153 3h-2.4c-.28 0-.42 0-.527-.054a.5.5 0 0 1-.219-.219c-.054-.107-.054-.247-.054-.527v-.4Zm.056 2.47c-.056.108-.056.25-.056.535V6l-3.007 5.412c-.663 1.193-.994 1.79-.932 2.277a1.5 1.5 0 0 0 .6 1.02C3.01 15 3.693 15 5.057 15h5.791c1.365 0 2.047 0 2.444-.291a1.5 1.5 0 0 0 .6-1.02c.062-.488-.27-1.084-.932-2.277L9.953 6V4.805c0-.285 0-.427-.056-.535a.5.5 0 0 0-.214-.214C9.575 4 9.433 4 9.148 4h-2.39c-.285 0-.427 0-.536.056a.5.5 0 0 0-.213.214ZM9.333 9l-3.03.5-1.287 2.31c-.218.392-.327.588-.309.748a.5.5 0 0 0 .205.348c.13.094.355.094.802.094h4.48c.447 0 .67 0 .801-.094a.5.5 0 0 0 .205-.348c.019-.16-.09-.355-.307-.746L9.333 9Z", clipRule: "evenodd" })));
}, Bell: function(e) {
  return a.createElement("svg", P({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), l5 || (l5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M12.625 6.138a4.656 4.656 0 0 0-3.268-3.925C9.228 1.52 8.67 1 8 1c-.67 0-1.228.52-1.357 1.213a4.656 4.656 0 0 0-3.268 3.925l-.452 3.963h.026a.95.95 0 0 0 0 1.899h10.102a.95.95 0 0 0 0-1.899h.026l-.452-3.963ZM8 15a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2Z", clipRule: "evenodd" })));
}, Biometric: function(e) {
  return a.createElement("svg", L({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), o5 || (o5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.5 1A5.5 5.5 0 0 0 2 6.5v3A5.5 5.5 0 0 0 7.5 15h1A5.5 5.5 0 0 0 14 9.5v-3A5.5 5.5 0 0 0 8.5 1h-1Zm1.074 6.75a.574.574 0 1 0-1.148 0v2.457a.574.574 0 0 0 1.148 0V7.75ZM8 5.338A2.412 2.412 0 0 0 5.588 7.75v2.566a.994.994 0 0 1-.291.704.574.574 0 1 0 .812.812c.402-.402.628-.947.628-1.516V7.75a1.264 1.264 0 1 1 2.527 0v2.648c0 .412-.233.79-.602.973a.574.574 0 0 0 .514 1.028 2.237 2.237 0 0 0 1.236-2V7.75A2.412 2.412 0 0 0 8 5.338ZM4.899 7.75A3.101 3.101 0 0 1 9.64 5.117a.574.574 0 1 0 .609-.974A4.25 4.25 0 0 0 3.75 7.75v2.297a.574.574 0 1 0 1.149 0V7.75Zm6.887-1.932a.574.574 0 1 0-1.023.522c.216.423.338.901.338 1.41v1.378a.574.574 0 1 0 1.149 0V7.75c0-.695-.167-1.352-.464-1.932Z", clipRule: "evenodd" })));
}, Boolean: function(e) {
  return a.createElement("svg", B({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), i5 || (i5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm4 6a4 4 0 0 1-4 4V4a4 4 0 0 1 4 4Z", clipRule: "evenodd" })));
}, Building: function(e) {
  return a.createElement("svg", A({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), c5 || (c5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1 2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v13H6v-2H4v2H1v-4h4.5a.5.5 0 0 0 0-1H1V8h4.5a.5.5 0 0 0 0-1H1V5h4.5a.5.5 0 0 0 0-1H1V2Zm8 9h4.5a.5.5 0 0 0 0-1H9V8h4.5a.5.5 0 0 0 0-1H9V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v10h-2v-2h-2v2H9v-4Z", clipRule: "evenodd" })));
}, Bulb: function(e) {
  return a.createElement("svg", S({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), u5 || (u5 = a.createElement("path", { fill: "currentColor", d: "M12.331 8.5a5 5 0 1 0-8.612.086L5.408 11.5a1 1 0 0 0 .866.499H6.5V6a1.5 1.5 0 1 1 3 0v6h.224a1 1 0 0 0 .863-.496L12.34 8.5h-.009Z" })), s5 || (s5 = a.createElement("path", { fill: "currentColor", d: "M7.5 6v6h1V6a.5.5 0 0 0-1 0ZM10 14v-1H6v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1Z" })));
}, Calendar: function(e) {
  return a.createElement("svg", U({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), h5 || (h5 = a.createElement("path", { fill: "currentColor", d: "M4 2a1 1 0 0 1 2 0v1a1 1 0 0 1-2 0V2Z" })), v5 || (v5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M9 3H7a2 2 0 1 1-4 0 2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2 2 2 0 1 1-4 0Zm3 4H9v3h3V7Z", clipRule: "evenodd" })), g5 || (g5 = a.createElement("path", { fill: "currentColor", d: "M10 3a1 1 0 1 0 2 0V2a1 1 0 1 0-2 0v1Z" })));
}, Camera: function(e) {
  return a.createElement("svg", k({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), f5 || (f5 = a.createElement("path", { fill: "currentColor", d: "M10.25 8.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" })), p5 || (p5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M4.585 3.33a1.5 1.5 0 0 1 1.342-.83h4.146a1.5 1.5 0 0 1 1.342.83l.309.617a1 1 0 0 0 .894.553h.882A1.5 1.5 0 0 1 15 6v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12V6a1.5 1.5 0 0 1 1.5-1.5h.882a1 1 0 0 0 .894-.553l.31-.618ZM11.5 8.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z", clipRule: "evenodd" })));
}, Cap: function(e) {
  return a.createElement("svg", D({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), m5 || (m5 = a.createElement("path", { fill: "currentColor", d: "M2.97 8.008v2.3l.001.092-.002.262c0 1.926 2.535 2.838 5 2.838 2.466 0 5-.912 5-2.838 0-.085 0-.168-.002-.25.002-.035.002-.07.002-.105V8.001L8.706 9.787a2 2 0 0 1-1.554-.004L2.969 8.008Z" })), w5 || (w5 = a.createElement("path", { fill: "currentColor", d: "M7.565 2.583a1 1 0 0 1 .794-.002l6.35 2.732a.5.5 0 0 1-.004.92L8.35 8.896a1 1 0 0 1-.778-.001L1.305 6.233a.5.5 0 0 1-.005-.919l6.265-2.73ZM13.97 7.626v1.477a1 1 0 1 0 1 0V7.207l-1 .419Z" })));
}, CaretDown: function(e) {
  return a.createElement("svg", W({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), d5 || (d5 = a.createElement("path", { fill: "currentColor", d: "M8.679 10.796a.554.554 0 0 1-.858 0L4.64 6.976C4.32 6.594 4.582 6 5.069 6h6.362c.487 0 .748.594.43.976l-3.182 3.82Z" })));
}, CaretLeft: function(e) {
  return a.createElement("svg", I({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), b5 || (b5 = a.createElement("path", { fill: "currentColor", d: "M5.204 8.679a.553.553 0 0 1 0-.858l3.82-3.181c.382-.319.976-.058.976.429v6.362c0 .487-.594.748-.976.43l-3.82-3.182Z" })));
}, CaretRight: function(e) {
  return a.createElement("svg", N({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), O5 || (O5 = a.createElement("path", { fill: "currentColor", d: "M10.796 7.321a.554.554 0 0 1 0 .858l-3.82 3.181c-.382.319-.976.058-.976-.429V4.57c0-.487.594-.748.976-.43l3.82 3.182Z" })));
}, CaretUp: function(e) {
  return a.createElement("svg", z({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), y5 || (y5 = a.createElement("path", { fill: "currentColor", d: "M7.321 5.204a.553.553 0 0 1 .858 0l3.181 3.82c.319.382.058.976-.429.976H4.57c-.487 0-.748-.594-.43-.976l3.182-3.82Z" })));
}, ChartFilled: function(e) {
  return a.createElement("svg", $({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), j5 || (j5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M3 2.5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2H3Zm8.25 2a.75.75 0 0 0-.75.75v6.25H12V5.25a.75.75 0 0 0-.75-.75ZM7.5 7.25a.75.75 0 0 1 1.5 0v4.25H7.5V7.25ZM5.25 9a.75.75 0 0 0-.75.75v1.75H6V9.75A.75.75 0 0 0 5.25 9Z", clipRule: "evenodd" })));
}, Charts: function(e) {
  return a.createElement("svg", F({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Z5 || (Z5 = a.createElement("path", { fill: "currentColor", d: "M11.5 13a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v10ZM7.5 14a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1ZM2.5 14a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1Z" })));
}, Checkmark: function(e) {
  return a.createElement("svg", T({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), x5 || (x5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m6.306 9.05 5.455-5.455a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1 0 1.414l-7.067 7.068a1 1 0 0 1-1.5-.098l-3.049-3.97a1 1 0 0 1 .184-1.402l.595-.457a1.25 1.25 0 0 1 1.753.23L6.306 9.05Z", clipRule: "evenodd" })));
}, CheckmarkWithCircle: function(e) {
  return a.createElement("svg", G({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), E5 || (E5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.448-10.104a.997.997 0 1 1 1.508 1.306l-4.572 5.28a1 1 0 0 1-1.64-.07l-1.82-2.868a1 1 0 1 1 1.69-1.07l1.1 1.734 3.734-4.312Z", clipRule: "evenodd" })));
}, ChevronDown: function(e) {
  return a.createElement("svg", _({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), M5 || (M5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1.636 5.364a1 1 0 0 0 0 1.414l4.95 4.95.707.707a1 1 0 0 0 1.414 0l.707-.707 4.95-4.95a1 1 0 0 0 0-1.414l-.707-.707a1 1 0 0 0-1.414 0L8 8.899 3.757 4.657a1 1 0 0 0-1.414 0l-.707.707Z", clipRule: "evenodd" })));
}, ChevronLeft: function(e) {
  return a.createElement("svg", J({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), C5 || (C5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M10.778 1.636a1 1 0 0 0-1.414 0l-4.95 4.95-.707.707a1 1 0 0 0 0 1.414l.707.707 4.95 4.95a1 1 0 0 0 1.414 0l.707-.707a1 1 0 0 0 0-1.414L7.243 8l4.242-4.243a1 1 0 0 0 0-1.414l-.707-.707Z", clipRule: "evenodd" })));
}, ChevronRight: function(e) {
  return a.createElement("svg", X({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), H5 || (H5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M5.364 14.364a1 1 0 0 0 1.414 0l4.95-4.95.707-.707a1 1 0 0 0 0-1.414l-.707-.707-4.95-4.95a1 1 0 0 0-1.414 0l-.707.707a1 1 0 0 0 0 1.414L8.899 8l-4.242 4.243a1 1 0 0 0 0 1.414l.707.707Z", clipRule: "evenodd" })));
}, ChevronUp: function(e) {
  return a.createElement("svg", Y({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), R5 || (R5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14.364 10.778a1 1 0 0 0 0-1.414l-4.95-4.95-.707-.707a1 1 0 0 0-1.414 0l-.707.707-4.95 4.95a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414 0L8 7.243l4.243 4.242a1 1 0 0 0 1.414 0l.707-.707Z", clipRule: "evenodd" })));
}, Circle: function(e) {
  return a.createElement("svg", K({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), V5 || (V5 = a.createElement("circle", { cx: 8, cy: 8, r: 7, fill: "currentColor" })));
}, Clock: function(e) {
  return a.createElement("svg", q({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), P5 || (P5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Zm-.75-9.25a.75.75 0 0 1 1.5 0v3.16l1.744 1.526a.75.75 0 0 1-.988 1.128L7.511 8.818a.761.761 0 0 1-.19-.25.747.747 0 0 1-.071-.318v-3.5Z", clipRule: "evenodd" })));
}, ClockWithArrow: function(e) {
  return a.createElement("svg", Q({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), L5 || (L5 = a.createElement("path", { fill: "currentColor", d: "M13 8a5 5 0 0 1-7.304 4.438c-.348-.18-.787-.13-1.038.172l-.33.398c-.276.33-.22.828.152 1.044a7 7 0 1 0-1.452-10.98L1.97 2.146a.584.584 0 0 0-.964.521l.455 3.252c.04.287.285.51.576.511H5.32a.58.58 0 0 0 .387-1.018l-1.168-1.02A5 5 0 0 1 13 8Z" })), B5 || (B5 = a.createElement("path", { fill: "currentColor", d: "M7.25 5.25a.75.75 0 0 1 1.5 0v2.668l1.68 1.524a.75.75 0 1 1-.988 1.129L7.507 8.815a.758.758 0 0 1-.257-.565v-3Z" })));
}, Clone: function(e) {
  return a.createElement("svg", e1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), A5 || (A5 = a.createElement("path", { fill: "currentColor", d: "M5.5 12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v4Z" })), S5 || (S5 = a.createElement("path", { fill: "currentColor", d: "M4.25 10H3.5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v.75h-2V4h-5v4h.75v2Z" })));
}, Cloud: function(e) {
  return a.createElement("svg", t1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), U5 || (U5 = a.createElement("path", { fill: "currentColor", d: "M12.571 8.143c0 1.775-.899 3.34-2.267 4.264l-.014.01a5.12 5.12 0 0 1-2.861.869H2.857a2.857 2.857 0 0 1-.545-5.663 5.144 5.144 0 0 1 10.26.52ZM13.821 8.143a6.38 6.38 0 0 1-2.358 4.96 3.429 3.429 0 1 0 2.17-6.506c.123.494.188 1.013.188 1.546Z" })));
}, Code: function(e) {
  return a.createElement("svg", r1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), k5 || (k5 = a.createElement("path", { fill: "currentColor", d: "M6.11 13.262a.5.5 0 0 0 .395.586l.737.143a.5.5 0 0 0 .585-.396L9.926 2.738a.5.5 0 0 0-.396-.586l-.737-.143a.5.5 0 0 0-.585.396L6.109 13.262ZM1.36 7.246 3.976 5.11a.507.507 0 0 1 .704.063l.64.752a.483.483 0 0 1-.064.69L3.562 7.998 5.256 9.38c.212.173.24.482.064.69l-.64.752a.507.507 0 0 1-.704.062L1.36 8.75A.971.971 0 0 1 1 7.998c0-.29.132-.566.36-.752ZM14.636 7.246 12.02 5.11a.507.507 0 0 0-.704.063l-.64.752a.483.483 0 0 0 .064.69l1.694 1.382L10.74 9.38a.483.483 0 0 0-.064.69l.64.752a.507.507 0 0 0 .704.062l2.616-2.134a.971.971 0 0 0 .36-.752.971.971 0 0 0-.36-.752Z" })));
}, CodeBlock: function(e) {
  return a.createElement("svg", n1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), D5 || (D5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M13 4H3v8h10V4ZM3 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H3Z", clipRule: "evenodd" })), W5 || (W5 = a.createElement("path", { fill: "currentColor", d: "M4.221 7.421 6.256 5.78a.398.398 0 0 1 .548.048l.498.578a.368.368 0 0 1-.05.53L5.934 8l1.318 1.063c.165.133.187.37.05.53l-.498.58a.398.398 0 0 1-.548.047L4.221 8.58A.744.744 0 0 1 3.941 8c0-.224.103-.436.28-.579ZM11.779 7.421 9.744 5.78a.398.398 0 0 0-.548.048l-.498.578a.368.368 0 0 0 .05.53L10.066 8 8.748 9.063a.368.368 0 0 0-.05.53l.498.58c.138.159.383.18.548.047l2.035-1.641a.744.744 0 0 0 .28-.579.744.744 0 0 0-.28-.579Z" })));
}, Coin: function(e) {
  return a.createElement("svg", a1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), I5 || (I5 = a.createElement("path", { fill: "currentColor", d: "M8 1C4.13 1 1 4.13 1 8s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7Zm2.29 9.41c-.09.26-.23.46-.43.61-.2.15-.46.25-.78.31-.26.05-.57.08-.92.09l-.1 1.07H6.95l.1-1.1h-.11c-.41-.03-.89-.1-1.42-.22l.09-1.09c.39 0 .72.02 1.01.03.29 0 .53.01.74.01h.53c.26 0 .46-.02.61-.05.15-.03.26-.1.32-.19s.09-.23.09-.42c0-.16-.02-.29-.07-.38a.429.429 0 0 0-.21-.23 1.48 1.48 0 0 0-.39-.16l-1.37-.48c-.52-.19-.89-.45-1.11-.76-.21-.31-.32-.73-.32-1.24 0-.4.05-.72.14-.97.09-.25.24-.45.44-.59.21-.14.47-.24.79-.29.28-.05.61-.07.98-.07l.1-.91H9l-.11.95h.16c.39.03.78.11 1.15.22l-.1 1.01c-.29 0-.63-.01-1.02-.02-.39 0-.77-.01-1.14-.01-.18 0-.33 0-.46.02-.13 0-.23.03-.31.08L7 5.82c-.03.09-.05.21-.05.36 0 .23.05.4.16.51.11.11.31.2.58.29l1.29.43c.54.19.92.44 1.13.76.21.32.32.74.32 1.26 0 .39-.05.72-.14.98Z" })));
}, Colon: function(e) {
  return a.createElement("svg", l1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), N5 || (N5 = a.createElement("path", { fill: "currentColor", d: "M10 4.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM10 11.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" })));
}, Config: function(e) {
  return a.createElement("svg", o1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), z5 || (z5 = a.createElement("path", { fill: "currentColor", d: "M12.7 2.57c-.29 0-.53.24-.53.53v1.25l-.85-.85c-2.11-2.1-5.57-1.98-7.54.26a5.142 5.142 0 0 0-1.1 4.73 5.11 5.11 0 0 0 4.4 3.74l1.02.11a2.369 2.369 0 0 0 4.61-.76c0-1.31-1.06-2.37-2.37-2.37-1.2 0-2.18.89-2.34 2.05l-.81-.08A4.053 4.053 0 0 1 3.7 8.22a4.04 4.04 0 0 1 .88-3.75c1.57-1.78 4.32-1.87 5.99-.2l.85.85h-1.25c-.29 0-.53.24-.53.53 0 .29.24.53.53.53h2.54c.29 0 .53-.24.53-.53V3.1c0-.29-.24-.53-.53-.53h-.01Zm-2.36 7.74c.7 0 1.26.57 1.26 1.26 0 .69-.57 1.26-1.26 1.26-.69 0-1.26-.57-1.26-1.26 0-.69.57-1.26 1.26-1.26Z" })));
}, Connect: function(e) {
  return a.createElement("svg", i1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), $5 || ($5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M12.867 8.898a4.048 4.048 0 0 0 .687-4.8l1.275-1.275a.584.584 0 0 0 0-.826l-.826-.826a.584.584 0 0 0-.826 0l-1.29 1.29a4.048 4.048 0 0 0-4.734.722L5.277 5.058a.323.323 0 0 0-.041.035L3.182 7.148a4.048 4.048 0 0 0-.72 4.738l-1.29 1.29a.584.584 0 0 0 0 .827l.825.826a.584.584 0 0 0 .826 0l1.278-1.278a4.048 4.048 0 0 0 4.795-.689l1.876-1.875a.324.324 0 0 0 .041-.035l2.054-2.054ZM6.561 6.776 4.685 8.65a1.916 1.916 0 0 0 0 2.707c.747.746 1.961.747 2.707 0l2.055-2.054a.321.321 0 0 1 .04-.035l1.877-1.875a1.916 1.916 0 0 0 0-2.707 1.916 1.916 0 0 0-2.707 0L6.602 6.74a.32.32 0 0 1-.04.035Z", clipRule: "evenodd" })));
}, Copy: function(e) {
  return a.createElement("svg", c1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), F5 || (F5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1 5.714v4.572C1 11.233 1.768 12 2.714 12H5.75V7.11c0-.566.227-1.108.63-1.504l2.294-2.252c.1-.099.21-.186.326-.262v-.378C9 1.768 8.232 1 7.286 1H5.8v3.429c0 .71-.576 1.285-1.286 1.285H1Zm8-.928L7.257 6.498A.857.857 0 0 0 7 7.11v.688h3.01a.857.857 0 0 0 .857-.858V4h-.717a.857.857 0 0 0-.6.246l-.55.54ZM4.867 1H4.15a.857.857 0 0 0-.601.246L1.257 3.498A.857.857 0 0 0 1 4.11v.688h3.01a.857.857 0 0 0 .857-.858V1ZM7 12V8.714H10.514c.71 0 1.286-.575 1.286-1.285V4h1.486C14.233 4 15 4.768 15 5.714v7.572c0 .947-.768 1.714-1.714 1.714H8.714A1.714 1.714 0 0 1 7 13.286V12Z", clipRule: "evenodd" })));
}, CreditCard: function(e) {
  return a.createElement("svg", u1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), T5 || (T5 = a.createElement("path", { fill: "currentColor", d: "M3 3a2 2 0 0 0-2 2h14a2 2 0 0 0-2-2H3ZM15 7H1v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" })));
}, CurlyBraces: function(e) {
  return a.createElement("svg", s1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), G5 || (G5 = a.createElement("path", { fill: "currentColor", d: "M3 3.544a2.5 2.5 0 0 1 2.5-2.5h1a.5.5 0 0 1 .5.5v1.105a.353.353 0 0 1-.353.353h-.79A.858.858 0 0 0 5 3.86v2.802a1.5 1.5 0 0 1-.816 1.335A1.5 1.5 0 0 1 5 9.332v2.803c0 .473.384.857.858.857h.789c.195 0 .353.158.353.353v1.105a.5.5 0 0 1-.5.5h-1a2.5 2.5 0 0 1-2.5-2.5v-1.956a1.5 1.5 0 0 0-1.5-1.5.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5 1.5 1.5 0 0 0 1.5-1.5v-1.95ZM13 12.45a2.5 2.5 0 0 1-2.5 2.5h-1a.5.5 0 0 1-.5-.5v-1.105c0-.195.158-.353.353-.353h.79a.858.858 0 0 0 .857-.858V9.332a1.5 1.5 0 0 1 .816-1.335A1.5 1.5 0 0 1 11 6.662V3.859a.858.858 0 0 0-.858-.857h-.789A.353.353 0 0 1 9 2.65V1.544a.5.5 0 0 1 .5-.5h1a2.5 2.5 0 0 1 2.5 2.5V5.5A1.5 1.5 0 0 0 14.5 7a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5 1.5 1.5 0 0 0-1.5 1.5v1.95Z" })));
}, Cursor: function(e) {
  return a.createElement("svg", h1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), _5 || (_5 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m8.534 8.534.473-.27 2.389-1.366-6.748-2.25 2.25 6.748 1.366-2.389.27-.473ZM10 10l4.48-2.563c.734-.333.678-1.393-.086-1.648L3.169 2.047A.887.887 0 0 0 2.047 3.17l3.742 11.225c.255.764 1.315.82 1.648.086L10 10Z", clipRule: "evenodd" })));
}, Dashboard: function(e) {
  return a.createElement("svg", v1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), J5 || (J5 = a.createElement("path", { fill: "currentColor", d: "M2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-6ZM7 7.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-6ZM7 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-3ZM2 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3Z" })));
}, Database: function(e) {
  return a.createElement("svg", g1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), X5 || (X5 = a.createElement("path", { fill: "currentColor", d: "M13.5 4.452c0 .09 0 .177-.002.262l.002.094v.23c0 .3-.136.588-.433.87-.302.289-.75.548-1.305.765-1.11.434-2.541.656-3.762.656-1.22 0-2.652-.222-3.762-.656-.555-.217-1.003-.476-1.305-.764-.297-.283-.433-.571-.433-.872v-.229c0-.035 0-.07.002-.105a12.886 12.886 0 0 1-.002-.251C2.5 2.517 5.288 1.6 8 1.6s5.5.917 5.5 2.852Z" })), Y5 || (Y5 = a.createElement("path", { fill: "currentColor", d: "M2.5 6.747v1.957c0 .3.136.589.433.871.302.288.75.548 1.305.765 1.11.433 2.541.656 3.762.656 1.22 0 2.652-.223 3.762-.656.555-.217 1.003-.477 1.305-.765.297-.282.433-.57.433-.87V6.746c-.392.318-.88.575-1.405.78-1.236.483-2.784.719-4.095.719-1.31 0-2.859-.236-4.095-.72-.525-.204-1.013-.461-1.405-.779Z" })), K5 || (K5 = a.createElement("path", { fill: "currentColor", d: "M12.095 11.194c.525-.205 1.013-.462 1.405-.78v.811c0 .035 0 .07-.002.105l.002.251c0 1.936-2.788 2.852-5.5 2.852s-5.5-.916-5.5-2.852c0-.088 0-.176.002-.262a2.322 2.322 0 0 1-.002-.094v-.811c.392.318.88.575 1.405.78 1.236.483 2.784.718 4.095.718 1.31 0 2.859-.235 4.095-.719Z" })));
}, Diagram: function(e) {
  return a.createElement("svg", f1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), q5 || (q5 = a.createElement("path", { fill: "currentColor", d: "M6 2.75A.75.75 0 0 1 6.75 2h2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H8.5v2h4.75a.75.75 0 0 1 .75.75V10h.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75H13V8H8.5v2H9a.75.75 0 0 1 .75.75v1.5A.75.75 0 0 1 9 13H7a.75.75 0 0 1-.75-.75v-1.5A.75.75 0 0 1 7 10h.5V8H3v2h.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-2a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75H2V7.75A.75.75 0 0 1 2.75 7H7.5V5h-.75A.75.75 0 0 1 6 4.25v-1.5Z" })));
}, Diagram2: function(e) {
  return a.createElement("svg", p1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Q5 || (Q5 = a.createElement("path", { fill: "currentColor", d: "M10.72 1c-.398 0-.72.336-.72.75V2H7.48a.49.49 0 0 0-.48.5V7H5v-.25C5 6.336 4.678 6 4.28 6H1.72c-.398 0-.72.336-.72.75v1.5c0 .414.322.75.72.75h2.56c.398 0 .72-.336.72-.75V8h2v4.5c0 .276.215.5.48.5H10v.25c0 .414.322.75.72.75h2.06c.398 0 .72-.336.72-.75v-1.5c0-.414-.322-.75-.72-.75h-2.06c-.398 0-.72.336-.72.75V12H8V8h2v.25c0 .414.322.75.72.75h2.06c.398 0 .72-.336.72-.75v-1.5c0-.414-.322-.75-.72-.75h-2.06c-.398 0-.72.336-.72.75V7H8V3h2v.25c0 .414.322.75.72.75h2.06c.398 0 .72-.336.72-.75v-1.5c0-.414-.322-.75-.72-.75h-2.06Z" })));
}, Diagram3: function(e) {
  return a.createElement("svg", m1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 14, fill: "none", viewBox: "0 0 16 16" }, e), et || (et = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1.75 1a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h2.5A.75.75 0 0 0 5 3.25v-1.5A.75.75 0 0 0 4.25 1h-2.5Zm9.25.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-1.5Zm0 9a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-1.5Zm-10 0a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-1.5ZM6 5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6Z", clipRule: "evenodd" })));
}, Disconnect: function(e) {
  return a.createElement("svg", w1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), tt || (tt = a.createElement("path", { fill: "currentColor", d: "M7.093 3.671a.317.317 0 0 1 0-.448L8.14 2.175a4.024 4.024 0 0 1 5.685 0 4.024 4.024 0 0 1 0 5.685l-1.048 1.047a.317.317 0 0 1-.448 0L11.28 7.86a.317.317 0 0 1 0-.449l1.048-1.047a1.906 1.906 0 0 0 0-2.693 1.906 1.906 0 0 0-2.693 0L8.59 4.718a.317.317 0 0 1-.449 0L7.093 3.671ZM1.293 1.293a1.001 1.001 0 0 1 1.416 0l11.998 11.998a1.001 1.001 0 0 1-1.416 1.416l-3.159-3.16-2.272 2.277a4.024 4.024 0 0 1-5.685 0 4.024 4.024 0 0 1 0-5.684l2.273-2.277L1.293 2.71a1.001 1.001 0 0 1 0-1.416Zm4.65 6.066L3.672 9.636a1.906 1.906 0 0 0 0 2.693c.743.742 1.95.742 2.693 0l2.272-2.277-2.692-2.693Z" })));
}, Download: function(e) {
  return a.createElement("svg", d1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), rt || (rt = a.createElement("path", { fill: "currentColor", d: "M8.862 2.75v5.206l1.15-1.15a.75.75 0 0 1 1.061 0l.18.178a.75.75 0 0 1 0 1.06l-2.537 2.537a.745.745 0 0 1-.02.02l-.179.18a.75.75 0 0 1-1.06 0L4.72 8.042a.75.75 0 0 1 0-1.06l.179-.18a.75.75 0 0 1 1.06 0l1.15 1.15V2.75A.75.75 0 0 1 7.86 2h.253a.75.75 0 0 1 .75.75Z" })), nt || (nt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M3 10.25a.75.75 0 0 1 .75.75v1c0 .138.112.25.25.25h8a.25.25 0 0 0 .25-.25v-1a.75.75 0 0 1 1.5 0v1A1.75 1.75 0 0 1 12 13.75H4A1.75 1.75 0 0 1 2.25 12v-1a.75.75 0 0 1 .75-.75Z", clipRule: "evenodd" })));
}, Drag: function(e) {
  return a.createElement("svg", b1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), at || (at = a.createElement("path", { fill: "currentColor", d: "M7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM11 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM11 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM11 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" })));
}, Edit: function(e) {
  return a.createElement("svg", O1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), lt || (lt = a.createElement("path", { fill: "currentColor", d: "M10.922.681a.963.963 0 0 1 1.362 0l1.363 1.363a.963.963 0 0 1 0 1.362L12.284 4.77 9.56 2.044 8.538 3.066l2.724 2.725-7.153 7.153-3.747 1.022 1.022-3.747L10.922.68Z" })));
}, Ellipsis: function(e) {
  return a.createElement("svg", y1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), ot || (ot = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M2.75 6a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Zm5 0a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Zm6.75 1.75a1.75 1.75 0 1 0-3.5 0 1.75 1.75 0 0 0 3.5 0Z", clipRule: "evenodd" })));
}, Email: function(e) {
  return a.createElement("svg", j1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), it || (it = a.createElement("path", { fill: "currentColor", d: "m2.494 4 4.714 5.05a1.068 1.068 0 0 0 1.584 0L13.505 4H2.494ZM1.133 4.256A2.12 2.12 0 0 0 1 5v6c0 .369.093.715.256 1.011L4.814 8.2l-3.68-3.944Z" })), ct || (ct = a.createElement("path", { fill: "currentColor", d: "M2.867 13c-.348 0-.674-.102-.953-.28l3.56-3.813 1.219 1.306a1.78 1.78 0 0 0 2.64 0l1.346-1.443 3.575 3.83c-.313.251-.7.4-1.12.4H2.866ZM14.84 11.813c.103-.248.16-.523.16-.813V5c0-.255-.045-.5-.126-.724l-3.535 3.787 3.5 3.75Z" })));
}, EmptyDatabase: function(e) {
  return a.createElement("svg", Z1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), ut || (ut = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.508 1.607a12.785 12.785 0 0 1 .878 0 .75.75 0 0 1-.052 1.5 11.329 11.329 0 0 0-.775 0 .75.75 0 1 1-.051-1.5Zm-1.281.838a.75.75 0 0 1-.532.917 5.03 5.03 0 0 0-.676.23.75.75 0 0 1-.588-1.38c.272-.116.566-.216.878-.3a.75.75 0 0 1 .918.533Zm3.457.003a.75.75 0 0 1 .916-.534c.315.083.61.182.885.297a.75.75 0 0 1-.581 1.383 5.222 5.222 0 0 0-.687-.23.75.75 0 0 1-.533-.916Zm2.778 1.081a.75.75 0 0 1 .946.48c.068.205.103.42.103.64 0 .22-.035.437-.108.644a.75.75 0 0 1-1.414-.502.417.417 0 0 0 .022-.142c0-.059-.01-.116-.028-.174a.75.75 0 0 1 .479-.946Zm-8.984 0a.75.75 0 0 1 .49.942.588.588 0 0 0-.028.178.4.4 0 0 0 .021.137.75.75 0 1 1-1.413.503 1.897 1.897 0 0 1-.108-.64c0-.216.033-.427.097-.63a.75.75 0 0 1 .941-.49ZM4.1 5.915a.75.75 0 0 1 .926-.518c.209.059.444.112.704.161a.75.75 0 1 1-.275 1.474 9.521 9.521 0 0 1-.837-.192.75.75 0 0 1-.518-.925Zm7.729.013a.75.75 0 0 1-.524.922 9.726 9.726 0 0 1-.845.189.75.75 0 1 1-.268-1.476c.265-.048.503-.1.714-.16a.75.75 0 0 1 .923.525Zm-5.026.552a.75.75 0 0 1 .815-.68l.328.029.333-.028a.75.75 0 1 1 .13 1.494l-.405.034a.75.75 0 0 1-.12 0l-.401-.035a.75.75 0 0 1-.68-.814ZM3.77 9.314a.75.75 0 0 1 .983-.398c.23.098.483.181.75.252a.75.75 0 0 1-.385 1.45 7.102 7.102 0 0 1-.951-.32.75.75 0 0 1-.398-.984Zm8.454.016a.75.75 0 0 1-.406.98c-.313.129-.64.232-.962.315a.75.75 0 1 1-.374-1.453c.27-.07.529-.152.763-.249a.75.75 0 0 1 .98.407Zm-5.444.855a.75.75 0 0 1 .795-.702 10.637 10.637 0 0 0 .384.017h.032l.08-.002c.071-.003.177-.007.31-.015a.75.75 0 1 1 .09 1.497 12.285 12.285 0 0 1-.45.02h-.093a8.078 8.078 0 0 1-.446-.02.75.75 0 0 1-.702-.795ZM3 6.85a.75.75 0 0 1 .75.75v.629a.75.75 0 0 1-1.5 0V7.6A.75.75 0 0 1 3 6.85Zm10 0a.75.75 0 0 1 .75.75v.629a.75.75 0 0 1-1.5 0V7.6a.75.75 0 0 1 .75-.75ZM3 10.621a.75.75 0 0 1 .75.75v.352l.03.03a.75.75 0 1 1-1.045 1.076 3.232 3.232 0 0 1-.335-.379.75.75 0 0 1-.15-.45v-.629a.75.75 0 0 1 .75-.75Zm10 0a.75.75 0 0 1 .75.75V12a.75.75 0 0 1-.15.45c-.106.141-.227.27-.358.39a.75.75 0 0 1-1.008-1.111l.016-.015v-.343a.75.75 0 0 1 .75-.75Zm-1.247 2.332a.75.75 0 0 1-.467.952c-.26.089-.53.168-.806.236a.75.75 0 1 1-.36-1.456c.237-.059.465-.125.68-.2a.75.75 0 0 1 .953.468Zm-7.528.049a.75.75 0 0 1 .952-.468c.21.071.434.135.674.19a.75.75 0 1 1-.335 1.462 8.318 8.318 0 0 1-.823-.232.75.75 0 0 1-.468-.952Zm4.911.656a.75.75 0 0 1-.715.783 9.418 9.418 0 0 1-.834.002.75.75 0 1 1 .048-1.499 11.227 11.227 0 0 0 .719-.002.75.75 0 0 1 .782.716Z", clipRule: "evenodd" })));
}, EmptyFolder: function(e) {
  return a.createElement("svg", x1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), st || (st = a.createElement("path", { fill: "currentColor", d: "M14.19 10.19c-.41 0-.75-.34-.75-.75v-.95c0-.41.34-.75.75-.75s.75.34.75.75v.95c0 .41-.34.75-.75.75ZM14.19 7.08c-.41 0-.75-.34-.75-.75v-.86h-2.12c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h2.87c.41 0 .75.34.75.75v1.61c0 .41-.34.75-.75.75ZM14.19 13.89h-1.64c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h.89v-.89c0-.41.34-.75.75-.75s.75.34.75.75v1.64c0 .41-.34.75-.75.75ZM8.94 5.47h-.52c-.7 0-1.19-.41-1.4-.75l-.77-1.21h-.41c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h.57c.17.01.74.08 1.1.66.17.28.8 1.25.8 1.25a.2.2 0 0 0 .13.05h.52c.41 0 .75.34.75.75s-.35.75-.77.75ZM1.75 5.29c-.41 0-.75-.34-.75-.75V2.75c0-.41.34-.75.75-.75h1.99c.41 0 .75.34.75.75s-.34.75-.76.75H2.5v1.03c0 .42-.34.76-.75.76ZM1.75 10.08c-.41 0-.75-.34-.75-.75V6.58c0-.41.34-.75.75-.75s.75.34.75.75v2.75c0 .41-.34.75-.75.75ZM3.39 13.89H1.75c-.41 0-.75-.34-.75-.75V11.5c0-.41.34-.75.75-.75s.75.34.75.75v.89h.89c.41 0 .75.34.75.75s-.34.75-.75.75ZM6.96 13.89H5.7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.26c.41 0 .75.34.75.75s-.34.75-.75.75ZM10.33 13.89H9.06c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.27c.41 0 .75.34.75.75s-.34.75-.75.75Z" })));
}, Eraser: function(e) {
  return a.createElement("svg", E1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), ht || (ht = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8.381 1.934a2.014 2.014 0 0 1 2.817 0l3.228 3.228a2.014 2.014 0 0 1 0 2.817l-5.258 5.258h5.289c.29 0 .526.235.526.526v.35c0 .292-.235.527-.526.527h-9.51a.702.702 0 0 1-.495-.205l-2.878-2.877a2.014 2.014 0 0 1 0-2.817l6.807-6.807ZM8.1 12.32a.5.5 0 0 0 0-.707L4.747 8.26a.5.5 0 0 0-.707 0L2.566 9.733a.612.612 0 0 0 0 .832l2.518 2.518a.527.527 0 0 0 .372.154h1.51c.139 0 .273-.056.372-.155l.762-.762Z", clipRule: "evenodd" })));
}, Escalation: function(e) {
  return a.createElement("svg", M1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), vt || (vt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M13.361 4.423a.556.556 0 0 0-.26-.97L5.146 2.009a.556.556 0 0 0-.636.69l1.787 6.672a.556.556 0 0 0 .896.28l6.168-5.228ZM2.911 2.102a.556.556 0 0 0-.392.68l3.163 11.806a.556.556 0 1 0 1.074-.287L3.592 2.493a.556.556 0 0 0-.68-.392Z", clipRule: "evenodd" })));
}, Export: function(e) {
  return a.createElement("svg", C1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), gt || (gt = a.createElement("path", { fill: "currentColor", d: "M14.623 5.186a.278.278 0 0 0 0-.385l-2.805-2.915a.277.277 0 0 0-.477.192v1.424A6.5 6.5 0 0 0 5 10v.1a1.5 1.5 0 0 0 3 0V10a3.5 3.5 0 0 1 3.34-3.496v1.405c0 .25.305.373.478.193l2.805-2.916Z" })), ft || (ft = a.createElement("path", { fill: "currentColor", d: "M6.5 3.879a.75.75 0 0 0-.75-.75H4a2 2 0 0 0-2 2v6.864a2 2 0 0 0 2 2h6.864a2 2 0 0 0 2-2V10.05a.75.75 0 0 0-1.5 0v1.943a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V5.129a.5.5 0 0 1 .5-.5h1.75a.75.75 0 0 0 .75-.75Z" })));
}, Favorite: function(e) {
  return a.createElement("svg", H1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), pt || (pt = a.createElement("path", { fill: "currentColor", d: "M7.538 1.558a.5.5 0 0 1 .924 0l1.537 3.696a.5.5 0 0 0 .421.306l3.99.32a.5.5 0 0 1 .285.878l-3.04 2.604a.5.5 0 0 0-.16.496l.928 3.893a.5.5 0 0 1-.747.543l-3.415-2.087a.5.5 0 0 0-.522 0l-3.415 2.086a.5.5 0 0 1-.747-.542l.928-3.893a.5.5 0 0 0-.16-.496l-3.04-2.604a.5.5 0 0 1 .285-.878l3.99-.32A.5.5 0 0 0 6 5.254l1.537-3.696Z" })));
}, Federation: function(e) {
  return a.createElement("svg", R1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), mt || (mt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M9.333 4.19a1.276 1.276 0 1 1-2.552 0 1.276 1.276 0 0 1 2.552 0Zm-.32 3.045A3.192 3.192 0 0 0 8.058 1 3.19 3.19 0 0 0 7.1 7.235v1.627l-1.706.984a3.19 3.19 0 1 0 .924 1.677l1.732-1 1.642.948a3.192 3.192 0 0 0 5.88 2.28 3.19 3.19 0 0 0-4.928-3.94l-1.63-.942V7.235Zm3.158 6.025a1.276 1.276 0 1 1 1.276-2.21 1.276 1.276 0 0 1-1.276 2.21ZM2.086 11.517a1.276 1.276 0 1 0 2.21 1.276 1.276 1.276 0 0 0-2.21-1.276Z", clipRule: "evenodd" })));
}, File: function(e) {
  return a.createElement("svg", V1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), wt || (wt = a.createElement("path", { fill: "currentColor", d: "M3 13V7h4.5A1.5 1.5 0 0 0 9 5.5V1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" })), dt || (dt = a.createElement("path", { fill: "currentColor", d: "M7.833 1h-.919a1 1 0 0 0-.707.293L3.293 4.207A1 1 0 0 0 3 4.914v.92h3.833a1 1 0 0 0 1-1V1Z" })));
}, Filter: function(e) {
  return a.createElement("svg", P1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), bt || (bt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m6 6.148-3.8-3.94C1.797 1.79 2.044 1 2.576 1h10.848c.532 0 .779.79.377 1.208L10 6.148v5.625a.5.5 0 0 1-.17.376l-3 2.625a.5.5 0 0 1-.83-.376v-8.25Z", clipRule: "evenodd" })));
}, Folder: function(e) {
  return a.createElement("svg", L1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ot || (Ot = a.createElement("path", { fill: "currentColor", d: "M2 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H8a1 1 0 0 1-1-1 1 1 0 0 0-1-1H2Z" })));
}, Format: function(e) {
  return a.createElement("svg", B1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), yt || (yt = a.createElement("path", { fill: "currentColor", d: "M2 4a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1Zm0 4a1 1 0 0 1 1-1h6a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1Zm1 3a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2H3Zm4-7a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Zm4 4a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Z" })));
}, FullScreenEnter: function(e) {
  return a.createElement("svg", A1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), jt || (jt = a.createElement("path", { fill: "currentColor", d: "M1.5 2a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-4ZM15 2.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4ZM1.5 14a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-4ZM14.5 14a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h4Z" })));
}, FullScreenExit: function(e) {
  return a.createElement("svg", S1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Zt || (Zt = a.createElement("path", { fill: "currentColor", d: "M10.5 7a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-4ZM6 9.5a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-4ZM10.5 9a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-4ZM5.5 7a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h4Z" })));
}, Function: function(e) {
  return a.createElement("svg", U1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), xt || (xt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8.971 5.03c.355.125.808.393 1.09.944.055.108.307.488.712 1.064.387.55.872 1.224 1.349 1.88a355.406 355.406 0 0 0 1.706 2.325l.156.211v.001l-1.204.894-.158-.214A351.838 351.838 0 0 1 10.909 9.8c-.479-.658-.97-1.34-1.363-1.9-.375-.533-.706-1.018-.822-1.244a.418.418 0 0 0-.25-.211.667.667 0 0 0-.166-.035H3.679v-1.5h4.647a1.508 1.508 0 0 1 .195.014c.116.015.274.044.45.106Z", clipRule: "evenodd" })), Et || (Et = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m14.498 5.98-6.359 6.368-1.061-1.06 6.358-6.368 1.062 1.06ZM10.055 1.232l-.247.708-.247.709h.002l-.017-.005a3.463 3.463 0 0 0-.404-.094 3.049 3.049 0 0 0-.98-.018 1.165 1.165 0 0 0-.66.366 1.081 1.081 0 0 0-.274.466 17892.85 17892.85 0 0 0-1.294 7.782l-.225 1.362v.002l-.002.005-.003.016a2.979 2.979 0 0 1-.047.22 4.478 4.478 0 0 1-.166.533c-.144.374-.434.971-.997 1.298-.47.273-1.026.38-1.528.408a5.883 5.883 0 0 1-1.466-.11l.299-1.47c.33.067.717.103 1.083.083.376-.021.67-.099.859-.208.097-.057.232-.234.35-.539a2.972 2.972 0 0 0 .133-.458l.004-.024v-.001l.74.121-.74-.121v-.002h.001l.225-1.36A17705.532 17705.532 0 0 1 5.75 3.104c.073-.414.315-.866.658-1.231a2.664 2.664 0 0 1 1.514-.822 4.543 4.543 0 0 1 1.472.02 4.956 4.956 0 0 1 .64.154l.014.005.004.001h.002l.001.001Z", clipRule: "evenodd" })));
}, Gauge: function(e) {
  return a.createElement("svg", k1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Mt || (Mt = a.createElement("path", { fill: "currentColor", d: "M1.041 10.251c-.044.412.296.749.71.749h2.494c.414 0 .74-.34.843-.742A3.006 3.006 0 0 1 8.791 8.1l2.99-2.991a7 7 0 0 0-10.74 5.142ZM13.297 6.422l-2.842 2.842c.213.3.368.638.459.994.102.401.429.742.843.742h2.494c.414 0 .754-.337.71-.749a7.001 7.001 0 0 0-1.664-3.829Z" })));
}, GlobeAmericas: function(e) {
  return a.createElement("svg", D1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ct || (Ct = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Zm-5.301 4.699A4.73 4.73 0 0 1 5 11.683V10L3.257 8.257A4.75 4.75 0 0 1 8 3.25V4.5L6.5 6v1l-.5.5-.5-.5-1 1 .5.5h2.5L8 9v1l-1 1 1.699 1.699Zm4.047-4.496a4.73 4.73 0 0 0-.924-3.025L10.5 6.5V9h1.25l.996-.797Z", clipRule: "evenodd" })));
}, GovernmentBuilding: function(e) {
  return a.createElement("svg", W1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ht || (Ht = a.createElement("path", { fill: "currentColor", d: "M11 5V4a3 3 0 0 0-6 0v1h6Z" })), Rt || (Rt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1.5 6a.5.5 0 0 0 0 1H2v6h-.5a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H14V7h.5a.5.5 0 0 0 0-1h-13Zm3 2.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3ZM8 8a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0v-3A.5.5 0 0 0 8 8Zm2.5.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3Z", clipRule: "evenodd" })));
}, Guide: function(e) {
  return a.createElement("svg", I1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Vt || (Vt = a.createElement("path", { fill: "currentColor", d: "M5.37 4.33c-.332 0-.6.282-.6.63 0 .348.268.63.6.63h2.806c.332 0 .601-.282.601-.63 0-.348-.27-.63-.601-.63H5.37ZM5.37 6.43c-.332 0-.6.283-.6.631 0 .348.268.63.6.63h1.604c.332 0 .6-.282.6-.63 0-.348-.268-.63-.6-.63H5.37Z" })), Pt || (Pt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M11.496 2.867V7.73A3.732 3.732 0 0 1 14 11.267C14 13.329 12.347 15 10.308 15a3.682 3.682 0 0 1-3.148-1.78H3.846A1.856 1.856 0 0 1 2 11.352V2.867C2 1.836 2.827 1 3.846 1H9.65c1.02 0 1.847.836 1.847 1.867Zm-7.65 0H9.65v4.725c-1.725.314-3.034 1.84-3.034 3.675l.001.086h-2.77V2.867Zm6.99 6.266a.53.53 0 0 1-.528.534.53.53 0 0 1-.528-.534.53.53 0 0 1 .528-.533.53.53 0 0 1 .527.533Zm-.528 1.067a.53.53 0 0 1 .527.533v2.134h.264c.146 0 .264.12.264.266a.265.265 0 0 1-.264.267H9.516a.265.265 0 0 1-.263-.267c0-.147.118-.266.263-.266h.264v-2.134h-.264a.265.265 0 0 1-.263-.266c0-.148.118-.267.263-.267h.792Z", clipRule: "evenodd" })));
}, Hash: function(e) {
  return a.createElement("svg", N1({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Lt || (Lt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M10.616 1.5a.5.5 0 0 0-.492.413L9.668 4.5h-2.47l.426-2.413A.5.5 0 0 0 7.13 1.5H6.116a.5.5 0 0 0-.492.413L5.168 4.5H2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2.815l-.53 3H2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1.933l-.425 2.413A.5.5 0 0 0 4 14.5h1.016a.5.5 0 0 0 .492-.413l.456-2.587h2.47l-.426 2.413a.5.5 0 0 0 .492.587h1.016a.5.5 0 0 0 .492-.413l.456-2.587H13.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-2.683l.529-3H13.5A.5.5 0 0 0 14 6V5a.5.5 0 0 0-.5-.5h-1.802l.426-2.413a.5.5 0 0 0-.492-.587h-1.016Zm-4.3 8h2.47l.529-3h-2.47l-.528 3Z", clipRule: "evenodd" })));
}, HiddenSecondaryNode: function(e) {
  return a.createElement("svg", z1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Bt || (Bt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.512 1.017a7.092 7.092 0 0 1 .976 0 .716.716 0 0 1-.098 1.428 5.66 5.66 0 0 0-.78 0 .716.716 0 0 1-.098-1.428Zm-1.624 1.02a.716.716 0 0 1-.329.957 5.562 5.562 0 0 0-.672.389.716.716 0 1 1-.802-1.187c.269-.181.551-.345.845-.489a.716.716 0 0 1 .958.33Zm4.224 0a.716.716 0 0 1 .958-.33c.294.144.576.308.845.49a.716.716 0 1 1-.802 1.186 5.562 5.562 0 0 0-.672-.39.716.716 0 0 1-.329-.957ZM3.191 3.892a.716.716 0 0 1 .192.994 5.562 5.562 0 0 0-.39.672.716.716 0 0 1-1.286-.629c.144-.294.308-.576.49-.845a.716.716 0 0 1 .994-.192Zm9.619 0a.716.716 0 0 1 .993.192c.182.269.346.551.49.845a.716.716 0 0 1-1.287.629 5.56 5.56 0 0 0-.389-.672.716.716 0 0 1 .192-.994ZM1.78 6.847a.716.716 0 0 1 .665.763 5.66 5.66 0 0 0 0 .78.716.716 0 0 1-1.428.098 7.092 7.092 0 0 1 0-.976.716.716 0 0 1 .763-.665Zm12.44 0a.716.716 0 0 1 .763.665 7.11 7.11 0 0 1 0 .976.716.716 0 1 1-1.428-.098 5.641 5.641 0 0 0 0-.78.716.716 0 0 1 .665-.763ZM2.036 10.112a.716.716 0 0 1 .958.329c.114.234.244.458.389.672a.716.716 0 1 1-1.187.802 6.99 6.99 0 0 1-.489-.845.716.716 0 0 1 .33-.958Zm11.928 0a.716.716 0 0 1 .329.958 6.99 6.99 0 0 1-.49.845.716.716 0 1 1-1.186-.802c.145-.214.275-.438.39-.672a.716.716 0 0 1 .957-.329ZM3.893 12.81a.716.716 0 0 1 .994-.192c.214.145.438.275.672.39a.716.716 0 1 1-.629 1.286 6.994 6.994 0 0 1-.845-.49.716.716 0 0 1-.192-.994Zm8.214 0a.716.716 0 0 1-.192.995 6.99 6.99 0 0 1-.845.489.716.716 0 0 1-.629-1.287c.234-.114.458-.244.672-.389a.716.716 0 0 1 .994.192Zm-5.26 1.41a.716.716 0 0 1 .763-.664 5.641 5.641 0 0 0 .78 0 .716.716 0 1 1 .098 1.428 7.11 7.11 0 0 1-.976 0 .716.716 0 0 1-.665-.763Z", clipRule: "evenodd" })), At || (At = a.createElement("path", { fill: "currentColor", d: "M10.864 9.74c0 1.433-1.207 2.317-2.867 2.317-1.769 0-3.03-1.097-3.1-2.59H6.86c.069.67.59.99 1.193.99.59 0 .892-.244.892-.61 0-.396-.261-.594-.864-.762L6.79 8.72C5.597 8.384 5.05 7.47 5.05 6.358c0-1.311 1.042-2.256 2.756-2.256 1.509 0 2.66.884 2.77 2.408H8.684c-.096-.58-.494-.777-.905-.777-.48 0-.81.213-.81.579 0 .426.371.594.782.7l1.207.366c1.344.381 1.907 1.174 1.907 2.362Z" })));
}, Highlight: function(e) {
  return a.createElement("svg", $1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), St || (St = a.createElement("path", { fill: "currentColor", d: "M8.853 12.031A.1.1 0 0 1 8.926 12h5.824a.25.25 0 0 1 .25.25v1.5a.25.25 0 0 1-.25.25H7.231a.1.1 0 0 1-.072-.168l1.694-1.8ZM4.019 9.193l.375-.374L7.576 12l-.375.375a1 1 0 0 1-.779.29l-.574-.04a1 1 0 0 0-.778.29l-.141.14-1.591-1.59.141-.142a1 1 0 0 0 .29-.778l-.04-.573a1 1 0 0 1 .29-.779ZM11.433 1.779a1 1 0 0 1 1.415 0l1.767 1.768a1 1 0 0 1 0 1.414L8.28 11.296 5.098 8.114l6.335-6.335ZM2.632 12.167l1.593 1.593-.17.172a.25.25 0 0 1-.178.074H1.386a.25.25 0 0 1-.176-.428l1.422-1.41Z" })));
}, Home: function(e) {
  return a.createElement("svg", F1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ut || (Ut = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.687 1.751a.5.5 0 0 1 .626 0l6.433 5.164a.5.5 0 0 1 .069.713l-.644.761a.5.5 0 0 1-.697.065L8.316 4.257a.5.5 0 0 0-.632 0L2.526 8.454a.5.5 0 0 1-.697-.065l-.644-.76a.5.5 0 0 1 .07-.714l6.432-5.164Z", clipRule: "evenodd" })), kt || (kt = a.createElement("path", { fill: "currentColor", d: "M7.688 5.25a.5.5 0 0 1 .624 0l4.5 3.6a.5.5 0 0 1 .188.39v4.26a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V9.24a.5.5 0 0 1 .188-.39l4.5-3.6Z" })));
}, HorizontalDrag: function(e) {
  return a.createElement("svg", T1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Dt || (Dt = a.createElement("path", { fill: "currentColor", d: "M4 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM4 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM8 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM8 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" })));
}, Import: function(e) {
  return a.createElement("svg", G1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Wt || (Wt = a.createElement("path", { fill: "currentColor", d: "M11.623 8.799a.278.278 0 0 0 0-.385L8.818 5.498a.277.277 0 0 0-.477.193v1.405A3.5 3.5 0 0 1 5 3.6v-.1a1.5 1.5 0 1 0-3 0v.1a6.5 6.5 0 0 0 6.34 6.498v1.424c0 .25.305.372.478.192L11.623 8.8Z" })), It || (It = a.createElement("path", { fill: "currentColor", d: "M3.95 11a.75.75 0 0 1 1.5 0v1.75a.5.5 0 0 0 .5.5h6.864a.5.5 0 0 0 .5-.5V5.886a.5.5 0 0 0-.5-.5h-1.943a.75.75 0 0 1 0-1.5h1.943a2 2 0 0 1 2 2v6.864a2 2 0 0 1-2 2H5.95a2 2 0 0 1-2-2V11Z" })));
}, ImportantWithCircle: function(e) {
  return a.createElement("svg", _1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Nt || (Nt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM7 4.5a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0v-4Zm2 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z", clipRule: "evenodd" })));
}, InfoWithCircle: function(e) {
  return a.createElement("svg", J1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), zt || (zt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM9 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM8 6a1 1 0 0 1 1 1v4h.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1H7V7h-.5a.5.5 0 0 1 0-1H8Z", clipRule: "evenodd" })));
}, InternalEmployee: function(e) {
  return a.createElement("svg", X1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), $t || ($t = a.createElement("path", { fill: "currentColor", d: "M6.5 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM4.343 8.45c-.414-.227-.944-.245-1.252.112A4.482 4.482 0 0 0 2 11.5V14h8.774l-.003-.05-.03-.022s-2.834-2.213-1.27-5.622c-.263-.055-.56.005-.814.144A4.48 4.48 0 0 1 6.5 9a4.48 4.48 0 0 1-2.157-.55Z" })), Ft || (Ft = a.createElement("path", { fill: "currentColor", d: "M12.746 7.003c-.36-.448-.672-.903-.736-.998a.016.016 0 0 0-.023 0c-.063.095-.373.55-.732.998-3.084 4.137.486 6.925.486 6.925l.03.021c.026.431.093 1.051.093 1.051h.266s.067-.617.093-1.05l.03-.025c.004.003 3.577-2.785.493-6.922ZM12 13.87s-.16-.144-.203-.217v-.007l.193-4.505c0-.014.02-.014.02 0l.193 4.505v.007a1.522 1.522 0 0 1-.203.217Z" })));
}, InviteUser: function(e) {
  return a.createElement("svg", Y1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Tt || (Tt = a.createElement("path", { fill: "currentColor", d: "M8.418 7.428a3.5 3.5 0 1 0-3.836-5.856 3.5 3.5 0 0 0 3.836 5.856ZM3.091 8.562c.308-.357.838-.339 1.252-.112.64.35 1.375.55 2.157.55s1.517-.2 2.157-.55c.414-.227.944-.245 1.252.112.11.128.214.263.31.403A1.996 1.996 0 0 0 9.5 10.5 2 2 0 0 0 8.177 14H2v-2.5c0-1.123.411-2.15 1.091-2.938Z" })), Gt || (Gt = a.createElement("path", { fill: "currentColor", d: "M10.5 10.5a.998.998 0 0 1 1-1 1 1 0 0 1 1 1v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-1Z" })));
}, Key: function(e) {
  return a.createElement("svg", K1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), _t || (_t = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M6.015 10.03c.652 0 1.267-.155 1.811-.43l1.512 1.51-.921.921a.669.669 0 0 0 0 .946l.827.827a.669.669 0 0 0 .946 0l.92-.92.75.749a1.254 1.254 0 0 0 1.773-1.773L9.599 7.827a4.015 4.015 0 1 0-3.584 2.204Zm-.753-3.513a1.255 1.255 0 1 0 0-2.51 1.255 1.255 0 0 0 0 2.51Z", clipRule: "evenodd" })));
}, Laptop: function(e) {
  return a.createElement("svg", q1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Jt || (Jt = a.createElement("path", { fill: "currentColor", d: "M5 6a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 6ZM5.5 7.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3Z" })), Xt || (Xt = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M3 2.5a1 1 0 0 0-1 1v7.813l-.29.49a.91.91 0 0 0-.068.1L1 13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1l-.642-1.096a.901.901 0 0 0-.067-.1L14 11.313V3.5a1 1 0 0 0-1-1H3ZM12.5 4h-9v6.5h9V4Z", clipRule: "evenodd" })));
}, LightningBolt: function(e) {
  return a.createElement("svg", Q1({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Yt || (Yt = a.createElement("path", { fill: "currentColor", d: "M9.223 1.993c0-.497-.66-.68-.922-.256l-4.227 6.85a.493.493 0 0 0 .423.75h2.28v4.67c0 .497.66.68.921.257l4.228-6.852a.492.492 0 0 0-.424-.75h-2.28V1.993Z" })));
}, Link: function(e) {
  return a.createElement("svg", e0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Kt || (Kt = a.createElement("path", { fill: "currentColor", d: "M6.039 9.953a3.596 3.596 0 0 1-.327-.38l1.45-1.445a1.553 1.553 0 0 0 2.496.423l2.885-2.87a1.57 1.57 0 0 0 .01-2.213 1.553 1.553 0 0 0-2.203-.01l-.379.377A.995.995 0 0 1 8.56 3.83a1.005 1.005 0 0 1 .006-1.418l.38-.377a3.542 3.542 0 0 1 5.024.023 3.58 3.58 0 0 1-.022 5.047l-2.884 2.871a3.542 3.542 0 0 1-5.025-.022Z" })), qt || (qt = a.createElement("path", { fill: "currentColor", d: "M9.961 6.047c.12.12.228.248.327.38l-1.45 1.445a1.553 1.553 0 0 0-2.496-.423l-2.885 2.87a1.57 1.57 0 0 0-.01 2.213 1.553 1.553 0 0 0 2.203.01l.379-.377a.995.995 0 0 1 1.411.006 1.005 1.005 0 0 1-.006 1.418l-.38.377a3.542 3.542 0 0 1-5.024-.023 3.58 3.58 0 0 1 .022-5.047l2.884-2.871a3.542 3.542 0 0 1 5.025.022Z" })));
}, List: function(e) {
  return a.createElement("svg", t0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Qt || (Qt = a.createElement("path", { fill: "currentColor", d: "M3.125 2.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM3.125 6.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM1.875 12a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM6.625 3a1 1 0 0 0 0 2h6.5a1 1 0 1 0 0-2h-6.5ZM5.625 8a1 1 0 0 1 1-1h6.5a1 1 0 1 1 0 2h-6.5a1 1 0 0 1-1-1ZM6.625 11a1 1 0 1 0 0 2h6.5a1 1 0 1 0 0-2h-6.5Z" })));
}, Lock: function(e) {
  return a.createElement("svg", r0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), er || (er = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M4 7V5a4 4 0 1 1 8 0v2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Zm2-2a2 2 0 1 1 4 0v2H6V5Zm2.587 5.81A.999.999 0 0 0 8 9a1 1 0 0 0-.58 1.815v1.852a.583.583 0 0 0 1.167 0V10.81Z", clipRule: "evenodd" })));
}, LogIn: function(e) {
  return a.createElement("svg", n0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), tr || (tr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M15 13a1 1 0 0 1-1 1H9.75a.75.75 0 0 1-.75-.75v-.5a.75.75 0 0 1 .75-.75H13V4H9.75A.75.75 0 0 1 9 3.25v-.5A.75.75 0 0 1 9.75 2H14a1 1 0 0 1 1 1v10Z", clipRule: "evenodd" })), rr || (rr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m6.505 11.884 3.202-3.202a1 1 0 0 0 0-1.414L6.505 4.066a.75.75 0 0 0-1.06 0l-.354.353a.75.75 0 0 0 0 1.061L6.611 7H1.75a.75.75 0 0 0-.75.75v.5c0 .414.336.75.75.75h4.81l-1.469 1.47a.75.75 0 0 0 0 1.06l.354.354a.75.75 0 0 0 1.06 0Z", clipRule: "evenodd" })));
}, LogOut: function(e) {
  return a.createElement("svg", a0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), nr || (nr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1.5 3c0-.552.446-1 .995-1h4.23c.412 0 .746.336.746.75v.5c0 .414-.334.75-.746.75H3.49v8h3.235c.412 0 .746.336.746.75v.5c0 .414-.334.75-.746.75h-4.23a.998.998 0 0 1-.995-1V3Z", clipRule: "evenodd" })), ar || (ar = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m11.022 11.909 3.187-3.202a1.003 1.003 0 0 0 0-1.414L11.022 4.09a.744.744 0 0 0-1.056 0l-.352.354a.753.753 0 0 0 0 1.06l1.513 1.52H6.29a.748.748 0 0 0-.746.75v.5c0 .414.334.75.746.75h4.788l-1.463 1.47a.753.753 0 0 0 0 1.06l.352.354a.744.744 0 0 0 1.056 0Z", clipRule: "evenodd" })));
}, MagnifyingGlass: function(e) {
  return a.createElement("svg", l0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), lr || (lr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M2.323 9.819a5.302 5.302 0 0 0 6.463.805l4.144 4.144a1.3 1.3 0 1 0 1.838-1.838l-4.144-4.144a5.302 5.302 0 0 0-8.3-6.463 5.3 5.3 0 0 0 0 7.496ZM7.98 4.162A2.7 2.7 0 1 1 4.162 7.98 2.7 2.7 0 0 1 7.98 4.162Z", clipRule: "evenodd" })));
}, Megaphone: function(e) {
  return a.createElement("svg", o0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), or || (or = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m6 3 5.725-1.636A1 1 0 0 1 13 2.326v7.348a1 1 0 0 1-1.275.962L6 9H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3Zm-.657 7H3v5h2.98a1 1 0 0 0 .918-1.396L5.343 10ZM16 6a2 2 0 0 1-2 2V4a2 2 0 0 1 2 2Z", clipRule: "evenodd" })));
}, Menu: function(e) {
  return a.createElement("svg", i0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), ir || (ir = a.createElement("path", { fill: "currentColor", d: "M2 4a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1ZM2 8a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1ZM3 11a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H3Z" })));
}, Minus: function(e) {
  return a.createElement("svg", c0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), cr || (cr = a.createElement("path", { fill: "currentColor", d: "M3 6.5a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H3Z" })));
}, Mobile: function(e) {
  return a.createElement("svg", u0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), ur || (ur = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M11 3H5v10h6V3ZM5 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H5Z", clipRule: "evenodd" })));
}, Moon: function(e) {
  return a.createElement("svg", s0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), sr || (sr = a.createElement("path", { fill: "currentColor", d: "M13.787 10.074a.713.713 0 0 0-.864-.116c-.125.077-.26.135-.394.192-1.766.72-3.888-.21-4.704-2.208-.73-1.795-.086-3.734 1.344-4.617a.72.72 0 0 0 .317-.807A.709.709 0 0 0 8.795 2H8.67c-3.312 0-6 2.688-6 6s2.688 6 6 6a6.003 6.003 0 0 0 5.232-3.062.715.715 0 0 0-.125-.864h.01Z" })));
}, MultiDirectionArrow: function(e) {
  return a.createElement("svg", h0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), hr || (hr = a.createElement("path", { fill: "currentColor", d: "M5 8.573v4.854c0 .53-.608.774-.928.374L2.13 11.374a.607.607 0 0 1 0-.748l1.943-2.427c.32-.4.928-.155.928.374Z" })), vr || (vr = a.createElement("path", { fill: "currentColor", d: "M5 10h7.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H5v-2ZM11 7.427V2.573c0-.53.608-.775.928-.374l1.943 2.427a.607.607 0 0 1 0 .748l-1.943 2.427c-.32.4-.928.155-.928-.374ZM3 4.5a.5.5 0 0 1 .5-.5H11v2H3.5a.5.5 0 0 1-.5-.5v-1Z" })));
}, MultiLayers: function(e) {
  return a.createElement("svg", v0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), gr || (gr = a.createElement("path", { fill: "currentColor", d: "m12.431 9.745-.26-.121.26-.122a1.99 1.99 0 0 0 .758-.597c.197-.252.311-.576.311-.9 0-.324-.114-.637-.311-.9a2.073 2.073 0 0 0-.758-.597l-.29-.142.217-.101c.301-.142.571-.344.758-.597.197-.253.311-.577.311-.9 0-.324-.114-.638-.311-.9a2.073 2.073 0 0 0-.758-.598L9.194 1.763A2.9 2.9 0 0 0 7.97 1.5c-.415 0-.84.08-1.225.263L3.57 3.27c-.301.142-.57.344-.758.597a1.483 1.483 0 0 0-.311.9c0 .324.114.638.311.901.197.253.457.455.758.597l.29.142-.217.1c-.301.142-.571.345-.758.598a1.483 1.483 0 0 0-.311.9c0 .324.114.637.311.9.197.253.457.456.758.597l.259.122-.26.121c-.3.142-.57.344-.757.597a1.484 1.484 0 0 0-.311.9c0 .324.114.638.311.9.197.254.457.456.758.598l3.165 1.497c.384.182.809.263 1.224.263.415 0 .84-.08 1.225-.263l3.165-1.497c.3-.142.57-.344.757-.597.197-.253.312-.577.312-.9 0-.324-.114-.638-.312-.901a2.073 2.073 0 0 0-.757-.597h.01Zm-4.39 3.248c-.207 0-.404-.04-.54-.112l-3.164-1.497c-.114-.05-.166-.111-.187-.132l.02-.02.167-.111 1.36-.637 1.13.536c.384.182.81.263 1.225.263.415 0 .84-.081 1.224-.263l1.132-.536 1.359.637c.114.05.166.111.187.131l-.021.02-.166.112-3.165 1.497a1.28 1.28 0 0 1-.54.112h-.02ZM4.14 8.005l.02-.02.166-.111 1.318-.628 1.1.516c.384.182.81.263 1.225.263.415 0 .84-.08 1.224-.263l1.173-.556 1.39.657c.115.051.167.112.187.132l-.02.02-.166.111-3.165 1.498a1.28 1.28 0 0 1-.54.111c-.208 0-.405-.04-.54-.111L4.347 8.126c-.114-.05-.166-.11-.187-.131l-.02.01Zm-.073-3.237.02-.02.167-.112L7.419 3.14a1.28 1.28 0 0 1 .54-.111c.207 0 .404.04.54.11l3.164 1.498c.114.05.166.111.187.132l-.02.02-.167.111-3.165 1.497a1.28 1.28 0 0 1-.54.112c-.207 0-.404-.04-.54-.112L4.255 4.9c-.114-.05-.166-.111-.187-.131Z" })));
}, NavCollapse: function(e) {
  return a.createElement("svg", g0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), fr || (fr = a.createElement("path", { fill: "currentColor", d: "M11.39 4.818a.5.5 0 0 0-.708 0L7.854 7.646a.5.5 0 0 0 0 .708l2.828 2.828a.5.5 0 0 0 .707 0l.354-.354a.5.5 0 0 0 0-.707L9.62 8l2.122-2.121a.5.5 0 0 0 0-.707l-.354-.354Z" })), pr || (pr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M4 1a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H4Zm1 1.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5h1v-11Zm1.5 0v11H12a1.5 1.5 0 0 0 1.5-1.5V4A1.5 1.5 0 0 0 12 2.5H6.5Z", clipRule: "evenodd" })));
}, NavExpand: function(e) {
  return a.createElement("svg", f0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), mr || (mr = a.createElement("path", { fill: "currentColor", d: "M4.61 4.818a.5.5 0 0 1 .708 0l2.828 2.828a.5.5 0 0 1 0 .708l-2.828 2.828a.5.5 0 0 1-.707 0l-.354-.354a.5.5 0 0 1 0-.707L6.38 8 4.257 5.879a.5.5 0 0 1 0-.707l.354-.354Z" })), wr || (wr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M12 1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3h8Zm-1 1.5h1A1.5 1.5 0 0 1 13.5 4v8a1.5 1.5 0 0 1-1.5 1.5h-1v-11Zm-1.5 0v11H4A1.5 1.5 0 0 1 2.5 12V4A1.5 1.5 0 0 1 4 2.5h5.5Z", clipRule: "evenodd" })));
}, NoFilter: function(e) {
  return a.createElement("svg", p0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), dr || (dr = a.createElement("path", { fill: "currentColor", d: "M2.606 1.204a1 1 0 0 0-1.313 1.503L7 8.414v5.984a.5.5 0 0 0 .83.376l2.949-2.58 2.512 2.511a1 1 0 0 0 1.414-1.414l-1.818-1.818-.006.006L2.606 1.204ZM10.573 7.15A.25.25 0 0 0 11 6.972v-.825l3.8-3.94C15.202 1.79 14.957 1 14.425 1H5.027a.25.25 0 0 0-.176.427l5.722 5.722Z" })));
}, NotAllowed: function(e) {
  return a.createElement("svg", m0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), br || (br = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M11.75 8a3.75 3.75 0 0 1-5.485 3.326l5.06-5.06c.272.518.425 1.108.425 1.734ZM4.674 9.735l5.06-5.06a3.75 3.75 0 0 0-5.06 5.06ZM14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0Z", clipRule: "evenodd" })));
}, Note: function(e) {
  return a.createElement("svg", w0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Or || (Or = a.createElement("path", { fill: "currentColor", d: "M4.5 6.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75ZM4.5 8.75A.75.75 0 0 1 5.25 8h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z" })), yr || (yr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m15 10-4 4H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6Zm-2-6H3v8h7v-2a1 1 0 0 1 1-1h2V4Z", clipRule: "evenodd" })));
}, NumberedList: function(e) {
  return a.createElement("svg", d0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), jr || (jr = a.createElement("path", { fill: "currentColor", d: "M2.65 4.297c.087.096.215.16.351.16.08 0 .152-.016.256-.04l.304-.08V6.48H3.13c-.168 0-.328.024-.456.136a.503.503 0 0 0-.16.369c0 .136.056.28.16.376.128.112.28.136.456.136H5.01c.176 0 .328-.032.456-.136a.49.49 0 0 0 .16-.368.52.52 0 0 0-.16-.377c-.128-.112-.28-.136-.456-.136h-.432V3l-1.585.408c-.152.048-.264.08-.368.184a.51.51 0 0 0-.112.328c0 .128.048.264.136.369v.008ZM5.154 11.988a.52.52 0 0 0-.264.088h-.768c.4-.345.68-.593.856-.76.28-.273.464-.473.56-.665.088-.176.128-.368.128-.568 0-.392-.152-.744-.44-1.009a1.536 1.536 0 0 0-1.104-.408c-.28 0-.552.064-.793.184-.24.12-.44.296-.576.513-.12.2-.2.376-.2.56 0 .136.056.264.152.352a.51.51 0 0 0 .664.056.51.51 0 0 0 .184-.28.608.608 0 0 1 .129-.224.606.606 0 0 1 .424-.144c.184 0 .312.048.4.128.096.088.128.16.128.256 0 .056-.032.144-.128.256-.208.24-.896.84-2.009 1.769l-.072.064v.952h3.241v-.496c0-.176-.024-.328-.136-.456a.508.508 0 0 0-.376-.16v-.008ZM12.573 11.091H8.26a1 1 0 0 0 0 2.001h4.314a1 1 0 0 0 0-2ZM8.26 5.089h4.313a1 1 0 0 0 0-2.001H8.26a1 1 0 0 0 0 2ZM12.573 7.154H8.26a1 1 0 0 0 0 2h4.314a1 1 0 0 0 0-2Z" })));
}, OpenNewTab: function(e) {
  return a.createElement("svg", b0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Zr || (Zr = a.createElement("path", { fill: "currentColor", d: "M13.823 2.45a.278.278 0 0 0-.272-.273l-4.045-.079a.277.277 0 0 0-.201.474l1.08 1.08-2.45 2.452a1.395 1.395 0 0 0-.148.174L5.999 8.065a1.369 1.369 0 1 0 1.936 1.936l1.787-1.788c.061-.043.12-.093.174-.147l2.451-2.452 1.081 1.081a.277.277 0 0 0 .474-.201l-.079-4.045Z" })), xr || (xr = a.createElement("path", { fill: "currentColor", d: "M7.25 3.129a.75.75 0 0 1 0 1.5H4a.5.5 0 0 0-.5.5v6.864a.5.5 0 0 0 .5.5h6.864a.5.5 0 0 0 .5-.5V8.75a.75.75 0 0 1 1.5 0v3.243a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5.129a2 2 0 0 1 2-2h3.25Z" })));
}, OutlineFavorite: function(e) {
  return a.createElement("svg", O0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Er || (Er = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.77 1.846s-.001 0 0 0Zm.23.555 1.306 3.14c.18.433.587.73 1.054.767l3.391.271-2.583 2.213a1.25 1.25 0 0 0-.403 1.24l.79 3.308-2.904-1.773a1.25 1.25 0 0 0-1.303 0L4.446 13.34l.789-3.308a1.25 1.25 0 0 0-.403-1.24L2.25 6.58l3.39-.271a1.25 1.25 0 0 0 1.055-.766L8 2.4Zm6.35 4.226ZM9.154 1.27C8.727.243 7.273.243 6.846 1.27L5.367 4.825l-3.837.307C.42 5.222-.028 6.604.817 7.328L3.74 9.832l-.893 3.745c-.258 1.081.919 1.936 1.867 1.357L8 12.927l3.285 2.007c.95.58 2.126-.276 1.868-1.357l-.893-3.745 2.923-2.504c.845-.724.395-2.107-.713-2.196l-3.838-.307L9.155 1.27ZM3.856 9.931Z", clipRule: "evenodd" })));
}, Package: function(e) {
  return a.createElement("svg", y0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Mr || (Mr = a.createElement("path", { fill: "currentColor", d: "m8.78 1.21 4.685 2.718c.482.28.778.794.778 1.351v5.442a1.562 1.562 0 0 1-.778 1.35L8.78 14.79a1.561 1.561 0 0 1-1.567 0l-4.685-2.717a1.562 1.562 0 0 1-.778-1.351V5.279c0-.557.296-1.072.778-1.35L7.213 1.21a1.562 1.562 0 0 1 1.567 0Zm-.895 1.16L3.753 4.764l4.244 2.461 4.243-2.46-4.132-2.397a.221.221 0 0 0-.223 0ZM3.09 5.926v4.794c0 .08.042.152.111.193l4.127 2.394V8.386L3.09 5.927Zm5.577 7.38 4.127-2.393a.222.222 0 0 0 .112-.193V5.927l-4.24 2.459v4.922Z" })));
}, Pause: function(e) {
  return a.createElement("svg", j0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Cr || (Cr = a.createElement("path", { fill: "currentColor", d: "M3.5 3.833c0-.46.448-.833 1-.833h1c.552 0 1 .373 1 .833v8.334c0 .46-.448.833-1 .833h-1c-.552 0-1-.373-1-.833V3.833ZM9.5 3.833c0-.46.448-.833 1-.833h1c.552 0 1 .373 1 .833v8.334c0 .46-.448.833-1 .833h-1c-.552 0-1-.373-1-.833V3.833Z" })));
}, Pending: function(e) {
  return a.createElement("svg", Z0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Hr || (Hr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 11.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm0 1.5a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z", clipRule: "evenodd" })));
}, Person: function(e) {
  return a.createElement("svg", x0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Rr || (Rr = a.createElement("path", { fill: "currentColor", d: "M11.5 4.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" })), Vr || (Vr = a.createElement("path", { fill: "currentColor", d: "M8 8c-.708 0-1.367-.21-1.918-.572A4.483 4.483 0 0 1 8 7c.686 0 1.336.154 1.918.428C9.368 7.79 8.708 8 8 8ZM4.591 8.562c.308-.357.838-.339 1.252-.112C6.483 8.8 7.218 9 8 9s1.517-.2 2.158-.55c.413-.227.943-.245 1.251.112A4.482 4.482 0 0 1 12.5 11.5V14h-9v-2.5c0-1.123.411-2.15 1.091-2.938Z" })));
}, PersonGroup: function(e) {
  return a.createElement("svg", E0({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Pr || (Pr = a.createElement("path", { fill: "currentColor", d: "M4.808 8.923a2.962 2.962 0 1 0 0-5.923 2.962 2.962 0 0 0 0 5.923ZM2.982 9.304c-.35-.192-.798-.207-1.059.095A3.793 3.793 0 0 0 1 11.885V14h7.615v-2.115c0-.95-.347-1.819-.923-2.486-.26-.302-.708-.287-1.059-.095a3.79 3.79 0 0 1-1.825.465 3.79 3.79 0 0 1-1.826-.465ZM9.615 11.885V13H15v-1.906c0-.734-.274-1.405-.727-1.92-.206-.234-.559-.222-.835-.074-.427.23-.917.36-1.438.36-.521 0-1.011-.13-1.438-.36-.276-.148-.63-.16-.835.073-.21.239-.38.51-.504.806.252.585.392 1.23.392 1.906ZM14.333 6.288c0 1.264-1.044 2.289-2.333 2.289-1.289 0-2.333-1.025-2.333-2.289C9.667 5.025 10.71 4 12 4c1.289 0 2.333 1.025 2.333 2.288Z" })));
}, PersonWithLock: function(e) {
  return a.createElement("svg", M0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Lr || (Lr = a.createElement("path", { fill: "currentColor", d: "M10 4.5A3.497 3.497 0 0 1 6.5 8a3.484 3.484 0 0 1-1.918-.572A3.5 3.5 0 1 1 10 4.5ZM4.343 8.45c-.414-.227-.944-.245-1.252.112A4.482 4.482 0 0 0 2 11.5V14h6v-2.5c0-.445.194-.845.502-1.12.033-.82.393-1.554.954-2.076-.259-.051-.55.01-.799.146A4.48 4.48 0 0 1 6.5 9a4.48 4.48 0 0 1-2.157-.55Z" })), Br || (Br = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M9.5 10.5v.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5v-.5a2 2 0 1 0-4 0Zm2-1a1 1 0 0 0-1 1v.5h2v-.5a1 1 0 0 0-1-1Z", clipRule: "evenodd" })));
}, Pin: function(e) {
  return a.createElement("svg", C0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ar || (Ar = a.createElement("path", { fill: "currentColor", d: "M10 8.5V3.3h.683a.65.65 0 1 0 0-1.3H5.317a.65.65 0 1 0 0 1.3H6v5.2L4.383 9.55a.843.843 0 0 0 .46 1.55h2.624v3.367a.533.533 0 0 0 1.066 0V11.1h2.624a.843.843 0 0 0 .46-1.55L10 8.5Z" })));
}, Play: function(e) {
  return a.createElement("svg", H0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Sr || (Sr = a.createElement("path", { fill: "currentColor", d: "M13.779 6.704a1.5 1.5 0 0 1 0 2.592l-7.523 4.388A1.5 1.5 0 0 1 4 12.388V3.612a1.5 1.5 0 0 1 2.256-1.296l7.523 4.388Z" })));
}, Plus: function(e) {
  return a.createElement("svg", R0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ur || (Ur = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.5 2a1 1 0 0 0-1 1v3.5H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h3.5V13a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9.5H13a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H9.5V3a1 1 0 0 0-1-1h-1Z", clipRule: "evenodd" })));
}, PlusWithCircle: function(e) {
  return a.createElement("svg", V0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), kr || (kr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM7 5a1 1 0 0 1 2 0v2h2a1 1 0 1 1 0 2H9v2a1 1 0 1 1-2 0V9H5a1 1 0 1 1 0-2h2V5Z", clipRule: "evenodd" })));
}, Primary: function(e) {
  return a.createElement("svg", P0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Dr || (Dr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3-8.307C11 5.172 9.918 4 8.433 4H6v8h1.495V9.386h.938C9.918 9.386 11 8.214 11 6.693Zm-1.454 0c0 .653-.453 1.16-1.134 1.16h-.917v-2.32h.917c.68 0 1.134.506 1.134 1.16Z", clipRule: "evenodd" })));
}, Project: function(e) {
  return a.createElement("svg", L0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Wr || (Wr = a.createElement("path", { fill: "currentColor", d: "M1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-13A.5.5 0 0 1 1 4V2Z" })), Ir || (Ir = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M2.75 5.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h10.5a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75H2.75ZM6.25 7a.5.5 0 0 0 0 1h3.5a.5.5 0 0 0 0-1h-3.5Z", clipRule: "evenodd" })));
}, QuestionMarkWithCircle: function(e) {
  return a.createElement("svg", B0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Nr || (Nr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM6.932 5.612C7.054 5.298 7.425 5 7.942 5 8.615 5 9 5.478 9 5.875c0 .162-.057.33-.172.476a.985.985 0 0 1-.242.216l-.016.01a1.141 1.141 0 0 1-.098.054c-.59.286-1.53.967-1.53 2.119V9a1 1 0 0 0 2 0c0-.035.011-.12.138-.27a2.66 2.66 0 0 1 .587-.48 3 3 0 0 0 .726-.656A2.742 2.742 0 0 0 11 5.875C11 4.201 9.54 3 7.941 3c-1.275 0-2.43.745-2.873 1.888a1 1 0 1 0 1.864.724ZM8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", clipRule: "evenodd" })));
}, Read: function(e) {
  return a.createElement("svg", A0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), zr || (zr = a.createElement("path", { fill: "currentColor", d: "M10.011 8.762V4.185h-1.39c-.574 0-.84-.645-.406-.985l2.63-2.063a.669.669 0 0 1 .81 0l2.63 2.063c.433.34.168.985-.405.985h-1.31v4.577c0 .716-.572 1.297-1.28 1.297-.706 0-1.279-.58-1.279-1.297ZM8.823 9.158c-.814.19-1.677.283-2.448.283-1.162 0-2.534-.212-3.63-.646-.465-.184-.897-.415-1.245-.7v1.758c0 .27.12.529.384.783.267.258.664.491 1.157.686.983.39 2.252.59 3.334.59 1.082 0 2.35-.2 3.334-.59.2-.079.383-.164.548-.254a2.53 2.53 0 0 1-1.434-1.91Z" })), $r || ($r = a.createElement("path", { fill: "currentColor", d: "M6.787 3.479a10.514 10.514 0 0 0-.412-.008c-2.404 0-4.875.823-4.875 2.562 0 .077 0 .152.002.225a2.117 2.117 0 0 0-.002.095v.206c0 .27.12.529.384.783.267.258.664.491 1.157.686.983.39 2.252.59 3.334.59.768 0 1.63-.101 2.418-.299V5.421H8.62c-.767 0-1.428-.45-1.706-1.125-.107-.26-.15-.54-.128-.817ZM11.25 11.39c-.348.284-.78.515-1.245.7-1.096.433-2.468.645-3.63.645s-2.534-.212-3.63-.646c-.465-.184-.897-.415-1.245-.7v.729c0 .028 0 .056.002.084l-.002.236C1.5 14.177 3.971 15 6.375 15s4.875-.823 4.875-2.562c0-.076 0-.152-.002-.226l.002-.094v-.729Z" })));
}, Recommended: function(e) {
  return a.createElement("svg", S0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Fr || (Fr = a.createElement("path", { fill: "currentColor", d: "m8.148 5.458-.944 1.968V9.59h2.099a.5.5 0 0 0 .491-.407l.223-1.182a.5.5 0 0 0-.491-.593h-.638a.623.623 0 0 1-.61-.636V5.708a.302.302 0 0 0-.13-.25Z" })), Tr || (Tr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8.538 1.554a.75.75 0 0 0-1.076 0L6.4 2.648a.75.75 0 0 1-.615.224L4.27 2.716a.75.75 0 0 0-.824.692l-.11 1.52a.75.75 0 0 1-.328.567l-1.261.856a.75.75 0 0 0-.187 1.06l.893 1.235a.75.75 0 0 1 .113.644l-.416 1.467a.75.75 0 0 0 .538.932l1.478.373a.75.75 0 0 1 .501.42l.624 1.39a.75.75 0 0 0 1.011.369l1.372-.665a.75.75 0 0 1 .654 0l1.372.665a.75.75 0 0 0 1.011-.368l.624-1.391a.75.75 0 0 1 .5-.42l1.48-.373a.75.75 0 0 0 .537-.932l-.416-1.467a.75.75 0 0 1 .114-.644l.892-1.235a.75.75 0 0 0-.187-1.06l-1.261-.856a.75.75 0 0 1-.327-.566l-.11-1.52a.75.75 0 0 0-.825-.693l-1.517.156a.75.75 0 0 1-.614-.224L8.538 1.554Zm-1.064 3.28a.577.577 0 0 1 .518-.334c.639 0 1.157.54 1.157 1.208V6.5h.98c.549 0 .96.523.854 1.085l-.412 2.182a.881.881 0 0 1-.854.733H5.435c-.24 0-.435-.294-.435-.546V7.591c0-.251.195-.455.435-.455h.898c.013 0 .027 0 .04.002a.702.702 0 0 1 .03-.072l1.071-2.232Z", clipRule: "evenodd" })));
}, Redo: function(e) {
  return a.createElement("svg", U0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Gr || (Gr = a.createElement("path", { fill: "currentColor", d: "M4.018 9.402c-.05.328-.313.598-.645.598h-.8c-.331 0-.603-.27-.57-.6a5.996 5.996 0 0 1 2.543-4.325A5.997 5.997 0 0 1 7.974 4h.028c2.699 0 4.95 1.718 5.467 4h1.414c.541 0 .792.672.383 1.026l-2.482 2.15a.585.585 0 0 1-.765 0l-2.482-2.15A.584.584 0 0 1 9.92 8h1.446c-.468-1.085-1.68-2-3.364-2a3.98 3.98 0 0 0-2.543.89 3.996 3.996 0 0 0-1.441 2.512Z" })));
}, Refresh: function(e) {
  return a.createElement("svg", k0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), _r || (_r = a.createElement("path", { fill: "currentColor", d: "M8.033 2c2.699 0 4.95 1.718 5.467 4h1.414c.542 0 .792.672.383 1.026l-2.482 2.15a.584.584 0 0 1-.765 0l-2.482-2.15A.584.584 0 0 1 9.951 6h1.447c-.469-1.085-1.68-2-3.365-2-1.026 0-1.877.34-2.491.85-.243.202-.618.203-.817-.043l-.61-.754a.468.468 0 0 1 .044-.651C5.163 2.534 6.53 2 8.033 2ZM3.95 6.843a.584.584 0 0 0-.765 0L.703 8.992a.584.584 0 0 0 .383 1.026h1.418C3.03 12.291 5.275 14 7.967 14c1.505 0 2.87-.534 3.874-1.402a.468.468 0 0 0 .044-.65l-.61-.755c-.2-.246-.574-.245-.817-.043-.614.51-1.465.85-2.49.85-1.676 0-2.883-.904-3.358-1.982H6.05a.584.584 0 0 0 .383-1.026L3.95 6.842Z" })));
}, Relationship: function(e) {
  return a.createElement("svg", D0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Jr || (Jr = a.createElement("path", { fill: "currentColor", d: "M.5 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1H6a2.5 2.5 0 0 1 2.5 2.5v5A1.5 1.5 0 0 0 10 12h1.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H10a2.5 2.5 0 0 1-2.5-2.5v-5A1.5 1.5 0 0 0 6 4H4.5v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2Z" })));
}, ReplicaSet: function(e) {
  return a.createElement("svg", W0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Xr || (Xr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M9.39 7.713A3.488 3.488 0 0 1 8 8c-.494 0-.964-.102-1.39-.287L5.264 9.729a2.5 2.5 0 1 1-1.08-.634L5.57 7.02a3.5 3.5 0 1 1 4.86 0l1.385 2.076A2.501 2.501 0 0 1 15 11.5a2.5 2.5 0 1 1-4.265-1.77L9.391 7.712ZM9.75 4.5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Z", clipRule: "evenodd" })));
}, Resize: function(e) {
  return a.createElement("svg", I0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Yr || (Yr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14.77 5.72a.75.75 0 0 1 0 1.06l-7.991 8a.749.749 0 1 1-1.06-1.06l7.992-8a.749.749 0 0 1 1.06 0ZM14.78 10.22a.75.75 0 0 1 0 1.06l-3.496 3.5a.749.749 0 1 1-1.06-1.06l3.497-3.5a.749.749 0 0 1 1.06 0Z", clipRule: "evenodd" })));
}, Resource: function(e) {
  return a.createElement("svg", N0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Kr || (Kr = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M6.1 2a.7.7 0 0 0-.7.7v10.6a.7.7 0 0 0 .7.7h2.1a.7.7 0 0 0 .7-.7V2.7a.7.7 0 0 0-.7-.7H6.1Zm1.925 1h-1.75v1h1.75V3Zm-1.75 2h1.75v.5h-1.75V5Zm1.75 7h-1.75v1h1.75v-1ZM9.844 2.358a.697.697 0 0 0-.533.832l2.259 10.257a.703.703 0 0 0 .835.535l2.05-.444a.697.697 0 0 0 .534-.832L12.73 2.45a.703.703 0 0 0-.835-.535l-2.05.444Zm2.094.562-1.71.37.214.969 1.71-.37-.214-.97Zm-1.283 2.307 1.71-.37.107.484-1.71.37-.107-.484Zm3.203 6.41-1.71.37.214.97 1.71-.37-.214-.97ZM2.1 2a.7.7 0 0 0-.7.7v10.6a.7.7 0 0 0 .7.7h2.1a.7.7 0 0 0 .7-.7V2.7a.7.7 0 0 0-.7-.7H2.1Zm1.925 1h-1.75v1h1.75V3Zm-1.75 2h1.75v.5h-1.75V5Zm1.75 7h-1.75v1h1.75v-1Z", clipRule: "evenodd" })));
}, Return: function(e) {
  return a.createElement("svg", z0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), qr || (qr = a.createElement("path", { fill: "currentColor", d: "M5 2a1 1 0 0 0 0 2h5a2.5 2.5 0 0 1 0 5H5.203l1.448-1.24a1 1 0 1 0-1.302-1.52l-3.5 3a1 1 0 0 0 0 1.52l3.5 3a1 1 0 0 0 1.302-1.52L5.203 11H10a4.5 4.5 0 1 0 0-9H5Z" })));
}, Revert: function(e) {
  return a.createElement("svg", $0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Qr || (Qr = a.createElement("path", { fill: "currentColor", d: "M13 8a5 5 0 0 1-7.304 4.438c-.348-.18-.787-.13-1.038.172l-.33.398c-.276.33-.22.828.152 1.044a7 7 0 1 0-1.452-10.98L1.97 2.146a.584.584 0 0 0-.964.521l.455 3.252c.04.287.285.51.576.511H5.32a.58.58 0 0 0 .387-1.018l-1.168-1.02A5 5 0 0 1 13 8Z" })));
}, Router: function(e) {
  return a.createElement("svg", F0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), en || (en = a.createElement("path", { fill: "currentColor", d: "M13.89 4.89c-.28-.12-.6 0-.73.28l-.56 1.24c-.04-.1-.07-.2-.11-.29-.16-.42-.32-.85-.45-1.19-.13-.34-.22-.58-.26-.68-.24-.55-.58-.87-.66-.94 0 0-.01-.01-.02-.01-.09-.09-.69-.64-1.76-.77-.12-.01-.23-.02-.35-.02-1.04 0-1.72.52-1.85.61 0 0-.02.01-.02.02-.07.05-.31.24-.57.57-.29.37-.61.93-.67 1.66v.23c0 1.12.59 1.82.73 1.98 0 0 1.19 1.5 1.87 2.33.22.27.29.6.29.9 0 .16-.02.3-.04.4l-.03.11v.05c0 .02-.08.25-.27.48-.2.22-.49.45-1.06.53-.09.01-.18.02-.26.02-.47 0-.75-.17-.94-.35-.09-.09-.16-.18-.2-.24l-.04-.07v-.02l-.59-1.11c.42-.39.68-.94.68-1.55a2.121 2.121 0 0 0-4.24 0c0 1.17.95 2.12 2.12 2.12.16 0 .32-.02.47-.06l.58 1.09c.04.08.18.35.49.64.34.32.91.64 1.69.64.13 0 .26 0 .39-.03.89-.11 1.49-.56 1.82-.99.3-.38.4-.71.43-.81 0 0 .12-.38.12-.87 0-.46-.1-1.06-.53-1.6-.67-.82-1.86-2.32-1.86-2.32v-.02l-.03-.01c-.03-.03-.48-.56-.47-1.26v-.14c.04-.44.24-.81.45-1.07a2 2 0 0 1 .27-.29l.08-.07h.02l.01-.02h.01s.54-.4 1.19-.4h.22c.38.06.67.19.87.3.1.06.17.11.22.15l.05.04v.01s.26.26.4.59c.01.03.12.29.24.63.16.41.36.96.55 1.46l-1.32-.6c-.28-.13-.6 0-.73.27-.13.28 0 .6.27.73l2.55 1.16c.13.06.28.07.42.01.14-.05.25-.16.31-.29l1.1-2.45c.12-.28 0-.6-.28-.73l-.01.02ZM2.85 9.07c0-.56.46-1.02 1.02-1.02s1.02.46 1.02 1.02c0 .57-.46 1.02-1.02 1.02-.57 0-1.02-.46-1.02-1.02Z" })));
}, SMS: function(e) {
  return a.createElement("svg", Q0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), fn || (fn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1 4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7.755L4.23 14.831c-.488.392-1.23.058-1.23-.555V12a2 2 0 0 1-2-2V4Zm2 .75A.75.75 0 0 1 3.75 4h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 4.75Zm0 3A.75.75 0 0 1 3.75 7h5.5a.75.75 0 1 1 0 1.5h-5.5A.75.75 0 0 1 3 7.75Z", clipRule: "evenodd" })));
}, Save: function(e) {
  return a.createElement("svg", T0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), tn || (tn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M2 3.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C2.76 2 3.04 2 3.6 2h7.737c.245 0 .367 0 .482.028a1 1 0 0 1 .29.12c.1.061.187.148.36.32l1.062 1.063c.173.173.26.26.322.36.055.09.095.188.12.29.027.115.027.237.027.482V12.4c0 .56 0 .84-.109 1.054a1 1 0 0 1-.437.437c-.2.102-.46.109-.954.109V9.284c0-.126 0-.25-.008-.353a1.01 1.01 0 0 0-.101-.385 1 1 0 0 0-.437-.437 1.01 1.01 0 0 0-.385-.1C11.465 8 11.342 8 11.216 8H4.784c-.126 0-.249 0-.353.008a1.01 1.01 0 0 0-.385.101 1 1 0 0 0-.437.437 1.01 1.01 0 0 0-.1.385c-.009.104-.009.227-.009.353V14c-.494 0-.753-.007-.954-.109a1 1 0 0 1-.437-.437C2 13.24 2 12.96 2 12.4V3.6Zm2-.1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5H4Z", clipRule: "evenodd" })), rn || (rn = a.createElement("path", { fill: "currentColor", d: "M11.5 9.3V14h-7V9.3c0-.148 0-.23.005-.288v-.006h.007C4.571 9 4.652 9 4.8 9h6.4c.148 0 .23 0 .288.005h.006v.007c.006.059.006.14.006.288Z" })));
}, SearchIndex: function(e) {
  return a.createElement("svg", G0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), nn || (nn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8.816 12.754a2.786 2.786 0 0 0 3.396.424l1.622 1.622a.683.683 0 1 0 .966-.966l-1.622-1.622a2.786 2.786 0 1 0-4.362.542Zm2.972-2.972a1.419 1.419 0 1 1-2.006 2.006 1.419 1.419 0 0 1 2.006-2.006Z", clipRule: "evenodd" })), an || (an = a.createElement("path", { fill: "currentColor", d: "M12 3.667c0 .083 0 .165-.002.245L12 4v.214c0 .281-.124.55-.393.815-.275.27-.682.512-1.187.715-1.01.405-2.31.613-3.42.613-1.11 0-2.41-.208-3.42-.613-.505-.203-.912-.446-1.187-.715C2.123 4.765 2 4.495 2 4.214V4c0-.033 0-.066.002-.099A12.44 12.44 0 0 1 2 3.667C2 1.857 4.534 1 7 1s5 .857 5 2.667Z" })), ln || (ln = a.createElement("path", { fill: "currentColor", d: "M2 5.813v1.83c0 .28.124.55.393.815.275.269.682.511 1.187.714 1.01.406 2.31.614 3.42.614l.134-.001A3.785 3.785 0 0 1 12 7.2V5.812c-.357.297-.8.537-1.277.729-1.124.452-2.532.672-3.723.672-1.191 0-2.599-.22-3.723-.672C2.8 6.35 2.357 6.11 2 5.813ZM7 10.643h.003c-.03.816.201 1.64.696 2.334-.232.015-.466.023-.699.023-2.466 0-5-.857-5-2.667 0-.083 0-.165.002-.245A2.229 2.229 0 0 1 2 10v-.758c.357.297.8.537 1.277.729 1.124.451 2.532.672 3.723.672Z" })));
}, Secondary: function(e) {
  return a.createElement("svg", _0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), on || (on = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 13.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11ZM8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Z", clipRule: "evenodd" })), cn || (cn = a.createElement("path", { fill: "currentColor", d: "M11 9.67C11 11.112 9.786 12 8.117 12 6.337 12 5.07 10.897 5 9.395h1.972c.07.674.594.996 1.2.996.594 0 .897-.245.897-.613 0-.399-.262-.598-.869-.767l-1.297-.367c-1.2-.337-1.751-1.257-1.751-2.376C5.152 4.95 6.2 4 7.924 4c1.517 0 2.676.889 2.786 2.421H8.807c-.097-.582-.497-.781-.91-.781-.483 0-.814.214-.814.582 0 .43.372.598.786.705l1.214.368C10.434 7.678 11 8.475 11 9.671Z" })));
}, Serverless: function(e) {
  return a.createElement("svg", J0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), un || (un = a.createElement("path", { fill: "currentColor", d: "M2.132 10.849a5.5 5.5 0 1 1 8.4-6.571 4 4 0 0 1 4.398 6.444 1 1 0 0 1-.15.192l-1.77 1.898a1.995 1.995 0 0 1-1.51.688H7.792a2.5 2.5 0 1 1 0-2H11.5l1.166-1.25H8.5a3.75 3.75 0 0 0-6.368.599Z" })));
}, Settings: function(e) {
  return a.createElement("svg", X0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), sn || (sn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M10.207 1.067a.75.75 0 0 0-.89.247l-.374.506a6.214 6.214 0 0 0-1.894.002l-.375-.506a.75.75 0 0 0-.89-.246l-1.126.467a.75.75 0 0 0-.454.804l.093.623c-.505.37-.958.82-1.338 1.34l-.623-.093a.75.75 0 0 0-.803.455l-.466 1.127a.75.75 0 0 0 .247.89l.506.374a6.214 6.214 0 0 0 .002 1.893l-.506.376a.75.75 0 0 0-.246.89l.467 1.126a.75.75 0 0 0 .804.454l.623-.093c.37.505.82.958 1.34 1.338l-.093.623a.75.75 0 0 0 .455.803l1.127.466a.75.75 0 0 0 .89-.247l.374-.506a6.218 6.218 0 0 0 1.894-.002l.375.506a.75.75 0 0 0 .89.246l1.126-.467a.75.75 0 0 0 .454-.804l-.093-.623c.505-.37.958-.82 1.338-1.34l.623.093a.75.75 0 0 0 .803-.455l.466-1.127a.75.75 0 0 0-.247-.89l-.506-.374a6.218 6.218 0 0 0-.002-1.894l.506-.375a.75.75 0 0 0 .246-.89l-.467-1.126a.75.75 0 0 0-.804-.454l-.623.093a6.214 6.214 0 0 0-1.34-1.338l.093-.623a.75.75 0 0 0-.455-.803l-1.127-.466Zm.334 7.984A2.75 2.75 0 1 1 5.46 6.949a2.75 2.75 0 0 1 5.082 2.102Z", clipRule: "evenodd" })));
}, ShardedCluster: function(e) {
  return a.createElement("svg", Y0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), hn || (hn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M13 2.75a1.75 1.75 0 0 1-2.123 1.71l-.619.866a3.497 3.497 0 0 1 1.186 2.049h1.17a1.75 1.75 0 1 1 0 1.25h-1.17a3.497 3.497 0 0 1-1.186 2.05l.619.865a1.75 1.75 0 1 1-1.046.686l-.662-.926a3.495 3.495 0 0 1-2.331.002l-.664.93a1.75 1.75 0 1 1-1.043-.69l.616-.863a3.497 3.497 0 0 1-1.191-2.054h-1.17a1.75 1.75 0 1 1 0-1.25h1.17c.147-.819.58-1.54 1.191-2.054l-.616-.863a1.75 1.75 0 1 1 1.043-.69l.664.93A3.494 3.494 0 0 1 8 4.5c.41 0 .803.07 1.17.2l.66-.926A1.75 1.75 0 1 1 13 2.75ZM9.75 8a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Z", clipRule: "evenodd" })));
}, Shell: function(e) {
  return a.createElement("svg", K0({ width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), vn || (vn = a.createElement("path", { fill: "currentColor", d: "m1.8 5.2 3.4 2.2-3.79 2.526a.5.5 0 0 0-.142.688l.557.86a.5.5 0 0 0 .697.145L7.5 8.3c.3-.2.5-.5.5-.8 0-.3-.2-.6-.4-.8L2.522 3.284a.5.5 0 0 0-.699.143l-.547.847a.5.5 0 0 0 .155.695L1.8 5.2ZM6.7 13a.5.5 0 0 0 .5.5h7.7a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H7.2a.5.5 0 0 0-.5.5v1Z" })));
}, Shirt: function(e) {
  return a.createElement("svg", q0({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), gn || (gn = a.createElement("path", { fill: "currentColor", d: "M2.089 4.244a.5.5 0 0 1 .243-.553L5.375 2c2.625 2.5 5.25 0 5.25 0l3.043 1.69a.5.5 0 0 1 .243.554l-.523 2.181a.75.75 0 0 1-.73.575H11v5.427a.927.927 0 0 1-.512.83 5.562 5.562 0 0 1-4.975 0 .927.927 0 0 1-.513-.83V7H3.341a.75.75 0 0 1-.729-.575l-.523-2.18Z" })));
}, SortAscending: function(e) {
  return a.createElement("svg", ee({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), pn || (pn = a.createElement("path", { fill: "currentColor", d: "M4.45 1.143a.584.584 0 0 0-.765 0L1.203 3.292a.584.584 0 0 0 .383 1.026h1.312v9.352a1.169 1.169 0 1 0 2.338 0V4.318H6.55a.584.584 0 0 0 .383-1.026L4.45 1.142ZM8 5a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H8ZM7 9a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1ZM8 11a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H8Z" })));
}, SortDescending: function(e) {
  return a.createElement("svg", te({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), mn || (mn = a.createElement("path", { fill: "currentColor", d: "M4.45 14.696a.584.584 0 0 1-.765 0l-2.482-2.15a.584.584 0 0 1 .383-1.025h1.312V2.168a1.169 1.169 0 1 1 2.338 0v9.351H6.55c.541 0 .792.673.383 1.027L4.45 14.696ZM8 3a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H8ZM7 7a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1ZM8 9a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H8Z" })));
}, Sparkle: function(e) {
  return a.createElement("svg", re({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), wn || (wn = a.createElement("path", { fill: "currentColor", d: "m6.273 2.893-.998 2.995c-.1.3-.336.536-.636.637l-2.995.998a.503.503 0 0 0 0 .954l2.995.998c.3.1.536.336.636.637l.998 2.995a.503.503 0 0 0 .955 0l.998-2.995c.1-.3.336-.536.636-.637l2.995-.998a.503.503 0 0 0 0-.954l-2.995-.998c-.3-.1-.536-.336-.636-.637l-.998-2.995a.503.503 0 0 0-.955 0ZM12.547 1.172l-.231.693c-.1.3-.336.536-.636.636l-.694.231c-.229.077-.229.401 0 .477l.694.231c.3.1.536.336.636.637l.23.693c.077.229.402.229.478 0l.231-.693c.1-.3.336-.536.636-.637l.693-.23c.23-.077.23-.401 0-.478l-.693-.23c-.3-.1-.536-.337-.636-.637l-.231-.693a.251.251 0 0 0-.477 0ZM12.547 11.23l-.231.693c-.1.3-.336.536-.636.636l-.694.232c-.229.076-.229.4 0 .477l.694.23c.3.1.536.337.636.637l.23.693c.077.23.402.23.478 0l.231-.693c.1-.3.336-.536.636-.636l.693-.231c.23-.077.23-.401 0-.477l-.693-.232c-.3-.1-.536-.335-.636-.636l-.231-.693a.251.251 0 0 0-.477 0Z" })));
}, SplitHorizontal: function(e) {
  return a.createElement("svg", ne({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 14, fill: "none", viewBox: "0 0 16 16" }, e), dn || (dn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M15 11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8Zm-2-4.5V3H3v3.5h10Zm-10 1V11h10V7.5H3Z", clipRule: "evenodd" })));
}, SplitVertical: function(e) {
  return a.createElement("svg", ae({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 14, fill: "none", viewBox: "0 0 16 16" }, e), bn || (bn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M13 1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h10ZM7.5 3H3v8h4.5V3Zm1 8H13V3H8.5v8Z", clipRule: "evenodd" })));
}, Stitch: function(e) {
  return a.createElement("svg", le({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 16 16" }, e), On || (On = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M0 0h16v16H0V0Zm14 4V2H2v2h12Zm0 10V5H2v9h12ZM8 6v7H6V6h2Zm5 0v4H9V6h4ZM5 8v5H3V8h2Zm8 3v2H9v-2h4Z" })));
}, Stop: function(e) {
  return a.createElement("svg", oe({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), yn || (yn = a.createElement("rect", { width: 10, height: 10, x: 3, y: 3, fill: "currentColor", rx: 1 })));
}, String: function(e) {
  return a.createElement("svg", ie({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), jn || (jn = a.createElement("path", { fill: "currentColor", d: "M10.69 14H5.31l-.15-.137v-.754l.15-.138h.602c.376 0 .753-.342.753-.685V3.5h-.903c-2.05 0-2.54.729-2.671 1.826l-.15.137h-.828L2 5.326l.282-3.189.15-.137h11.135l.15.137L14 5.326l-.113.137h-.827l-.15-.137c-.133-1.097-.622-1.826-2.672-1.826h-.903v8.786c0 .343.377.685.753.685h.602l.15.138v.754l-.15.137Z" })));
}, Sun: function(e) {
  return a.createElement("svg", ce({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Zn || (Zn = a.createElement("path", { fill: "currentColor", d: "M12.24 10.83a.996.996 0 1 0-1.41 1.41l.71.71a.996.996 0 1 0 1.41-1.41l-.71-.71ZM8 12c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55-.45-1-1-1ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14 7h-1c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1s-.45-1-1-1ZM3.76 10.83l-.71.71a.996.996 0 1 0 1.41 1.41l.71-.71a.996.996 0 1 0-1.41-1.41ZM8 4c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1ZM3.76 5.17a.996.996 0 1 0 1.41-1.41l-.71-.71a.996.996 0 1 0-1.41 1.41l.71.71ZM4 8c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1ZM12.24 5.17l.71-.71a.996.996 0 1 0-1.41-1.41l-.71.71a.996.996 0 1 0 1.41 1.41Z" })));
}, Support: function(e) {
  return a.createElement("svg", ue({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), xn || (xn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M5 7a3 3 0 0 1 6 0v2.5c0 1.51-.957 2.798-2.298 3.288a1 1 0 1 0 .265.967 4.512 4.512 0 0 0 2.787-2.785c.08.02.161.03.246.03h.5a2.5 2.5 0 0 0 .406-4.967 5.002 5.002 0 0 0-9.813 0A2.5 2.5 0 0 0 3.5 11H4a1 1 0 0 0 1-1V7Z", clipRule: "evenodd" })));
}, Sweep: function(e) {
  return a.createElement("svg", se({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), En || (En = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M3 14.465 4 12.734c.292.169.631.266.999.266h2v2H5a3.982 3.982 0 0 1-2-.535ZM9 15v-2h2c.368 0 .707-.097.999-.266L13 14.464A3.982 3.982 0 0 1 11 15H9Zm6-8h-2V5c0-.368-.097-.707-.266-.999L14.464 3c.341.588.536 1.271.536 2v2ZM7 1H5c-.729 0-1.412.195-2 .535L4 3.266C4.293 3.097 4.632 3 5 3h2V1ZM1 9h2v2c0 .368.097.707.266.999L1.536 13A3.982 3.982 0 0 1 1 11V9Zm0-2h2V5c0-.368.097-.707.266-.999L1.536 3A3.982 3.982 0 0 0 1 5v2Zm8-6v2h2c.368 0 .707.097.999.266L13 1.536A3.982 3.982 0 0 0 11 1H9Zm6 8h-2v2c0 .368-.097.707-.266.999L14.464 13c.341-.588.536-1.271.536-2V9Z", clipRule: "evenodd" })));
}, Table: function(e) {
  return a.createElement("svg", he({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Mn || (Mn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M1 3.25C1 2.56 1.56 2 2.25 2h11.5c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25H2.25C1.56 14 1 13.44 1 12.75v-9.5Zm2 4.12V4h4.37v3.37H3Zm0 1.25V12h4.37V8.62H3ZM8.62 12H13V8.62H8.62V12ZM13 7.37V4H8.62v3.37H13Z", clipRule: "evenodd" })));
}, Tag: function(e) {
  return a.createElement("svg", ve({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Cn || (Cn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "m9.707 14.293 4.586-4.586a1 1 0 0 0 0-1.414l-6-6A1 1 0 0 0 7.586 2H3a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l6 6a1 1 0 0 0 1.414 0ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", clipRule: "evenodd" })));
}, TemporaryTable: function(e) {
  return a.createElement("svg", ge({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Hn || (Hn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M2.25 2C1.56 2 1 2.56 1 3.25v9.5c0 .69.56 1.25 1.25 1.25h6.37V8.62H15V3.25C15 2.56 14.44 2 13.75 2H2.25ZM3 4v3.37h4.37V4H3Zm0 8V8.62h4.37V12H3Zm10-8v3.37H8.62V4H13Z", clipRule: "evenodd" })), Rn || (Rn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M13 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-.375-4.625a.375.375 0 0 1 .75 0v1.58l.872.763a.375.375 0 1 1-.494.564l-.998-.873a.374.374 0 0 1-.13-.284v-1.75Z", clipRule: "evenodd" })));
}, ThumbsDown: function(e) {
  return a.createElement("svg", fe({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Vn || (Vn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8.019 15c.511 0 .98-.28 1.208-.724l2.501-4.837c.026-.05.05-.102.07-.155.03.003.06.004.092.004h2.094c.561 0 1.016-.441 1.016-.985V3.182C15 2.638 14.545 2 13.984 2H3.993C3.023 2 2.188 2.666 2 3.589L1.04 8.316c-.247 1.217.713 2.35 1.993 2.35H5.32v1.717C5.32 13.828 6.528 15 8.019 15Zm1.84-6.34-2.205 4.265a.642.642 0 0 1-.303-.542v-2.307c0-.762-.637-1.379-1.422-1.379H3.644a.5.5 0 0 1-.49-.6l.758-3.727a.5.5 0 0 1 .49-.4h5.456v4.69Z", clipRule: "evenodd" })));
}, ThumbsUp: function(e) {
  return a.createElement("svg", pe({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Pn || (Pn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.981 1c-.511 0-.98.28-1.208.724L4.272 6.56c-.026.05-.05.102-.07.155a1.06 1.06 0 0 0-.092-.004H2.016c-.561 0-1.016.441-1.016.985v5.121C1 13.362 1.455 14 2.016 14h9.991c.97 0 1.805-.665 1.993-1.589l.961-4.727c.248-1.217-.713-2.35-1.993-2.35H10.68V3.616C10.68 2.172 9.472 1 7.981 1Zm-1.84 6.34 2.205-4.265a.642.642 0 0 1 .303.542v2.307c0 .762.637 1.379 1.422 1.379h2.285a.5.5 0 0 1 .49.6l-.758 3.727a.5.5 0 0 1-.49.4H6.142V7.34Z", clipRule: "evenodd" })));
}, TimeSeries: function(e) {
  return a.createElement("svg", me({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Ln || (Ln = a.createElement("path", { fill: "currentColor", d: "M7.023 1.518c.513.024.957.363 1.12.853L9.38 6.108l1.56-2.092a1.24 1.24 0 0 1 1.872-.134l1.897 1.91c.388.39.388 1.023 0 1.413l-.377.354a.99.99 0 0 1-1.405 0l-.86-.89-2.122 2.847a1.239 1.239 0 0 1-2.172-.355L6.798 6.22 6.11 7.774c-.2.451-.644.742-1.135.742H1.994a.997.997 0 0 1-.994-1v-.5c0-.552.445-1 .994-1h2.174l1.66-3.758a1.242 1.242 0 0 1 1.195-.74ZM14 12a1 1 0 0 1 1 1v.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V13a1 1 0 0 1 1-1h12Z" })));
}, TimeSeriesCollection: function(e) {
  return a.createElement("svg", we({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Bn || (Bn = a.createElement("path", { fill: "currentColor", d: "M13.6 10.383H15c.6 0 1 .499 1 1.098 0 .598-.4.998-1 .998h-.9l-1.5 2.096c-.2.3-.6.499-1 .399-.4-.1-.7-.4-.8-.799l-.4-1.696-.4 1.197c-.1.3-.5.6-.9.6H8c-.6 0-1-.4-1-.999s.4-.998 1-.998h.4l1.4-3.693c.1-.4.6-.599 1-.599s.8.4.9.699l.6 2.794.5-.698c.2-.2.5-.4.8-.4Z" })), An || (An = a.createElement("path", { fill: "currentColor", d: "M1.929 1A.922.922 0 0 0 1 1.915v9.15c0 .505.416.915.929.915H5.84c.101-.173.225-.336.374-.485.322-.321.71-.526 1.118-.63l1.043-2.75c.208-.678.706-1.086 1.107-1.3A2.846 2.846 0 0 1 10.8 6.49c.682 0 1.214.323 1.531.591.318.269.635.66.792 1.131l.026.079.133.617a2.24 2.24 0 0 1 .318-.023h.4v-5.14a.922.922 0 0 0-.929-.915H7.5a.922.922 0 0 1-.929-.915A.922.922 0 0 0 5.643 1H1.929Z" })), Sn || (Sn = a.createElement("path", { fill: "currentColor", d: "M10.95 8.005a.699.699 0 0 0-.066-.012l.065.012Z" })));
}, Trash: function(e) {
  return a.createElement("svg", de({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Un || (Un = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M5 2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2a1 1 0 0 1 1 1v1H2V3a1 1 0 0 1 1-1h2Zm9 3H2l1.678 8.392A2 2 0 0 0 5.64 15h4.72a2 2 0 0 0 1.962-1.608L14 5Z", clipRule: "evenodd" })));
}, Undo: function(e) {
  return a.createElement("svg", be({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), kn || (kn = a.createElement("path", { fill: "currentColor", d: "M11.981 9.402c.05.328.313.598.645.598h.8c.331 0 .603-.27.57-.6a5.996 5.996 0 0 0-2.543-4.325A5.997 5.997 0 0 0 8.026 4h-.029C5.298 4 3.047 5.718 2.53 8H1.116a.584.584 0 0 0-.383 1.026l2.482 2.15c.22.19.545.19.765 0l2.482-2.15A.584.584 0 0 0 6.079 8H4.632c.47-1.085 1.68-2 3.365-2a3.98 3.98 0 0 1 2.543.89 3.996 3.996 0 0 1 1.441 2.512Z" })));
}, University: function(e) {
  return a.createElement("svg", Oe({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Dn || (Dn = a.createElement("path", { fill: "currentColor", d: "M8.5 4.613c0-.383.191-.74.51-.953a6.87 6.87 0 0 1 2.145-.949l2.406-.601a.353.353 0 0 1 .439.342v7.88c0 .238 0 .357-.043.453a.5.5 0 0 1-.176.211c-.087.06-.204.081-.438.123l-3.9.71c-.324.058-.486.088-.612.042a.5.5 0 0 1-.264-.22c-.067-.116-.067-.28-.067-.61V4.613ZM2 2.452c0-.23.216-.398.439-.342l2.407.601a6.87 6.87 0 0 1 2.144.95c.319.211.51.569.51.952v6.428c0 .33 0 .494-.067.61a.5.5 0 0 1-.264.22c-.126.046-.288.016-.612-.043l-3.9-.709c-.234-.042-.35-.063-.438-.123a.5.5 0 0 1-.176-.21C2 10.688 2 10.57 2 10.331v-7.88ZM2.008 12.41a.5.5 0 0 1 .581-.402l5.143.935c.177.032.359.032.536 0l5.143-.935a.5.5 0 0 1 .178.984l-4.134.752c-.163.434-.753.756-1.455.756-.702 0-1.292-.322-1.455-.756l-4.134-.752a.5.5 0 0 1-.403-.581Z" })));
}, Unlock: function(e) {
  return a.createElement("svg", ye({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Wn || (Wn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M6.157 4.221A2 2 0 0 1 10 5v2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1V5a4 4 0 0 0-7.822-1.182C3.982 4.45 4.538 5 5.2 5c.442 0 .785-.372.957-.779Zm2.43 6.589A.999.999 0 0 0 8 9a1 1 0 0 0-.58 1.815v1.852a.583.583 0 0 0 1.167 0V10.81Z", clipRule: "evenodd" })));
}, Unsorted: function(e) {
  return a.createElement("svg", je({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), In || (In = a.createElement("path", { fill: "currentColor", d: "M3.685 1.143c.22-.19.545-.19.765 0l2.482 2.149a.584.584 0 0 1-.383 1.026H5.236v7.364H6.55c.541 0 .792.672.383 1.026l-2.482 2.15a.584.584 0 0 1-.765 0l-2.482-2.15a.584.584 0 0 1 .383-1.026h1.312V4.318H1.586a.584.584 0 0 1-.383-1.026l2.482-2.15ZM8 8a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1ZM9 4a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2H9ZM8 11a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z" })));
}, UpDownCarets: function(e) {
  return a.createElement("svg", Ze({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, viewBox: "0 0 16 16" }, e), Nn || (Nn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M7.527 1.21a.638.638 0 0 1 .948 0l3.327 3.563c.422.452.123 1.227-.475 1.227H4.673c-.599 0-.898-.775-.476-1.227l3.33-3.562Zm3.8 8.79c.598 0 .897.775.475 1.228l-3.327 3.56a.638.638 0 0 1-.948 0l-3.33-3.56C3.775 10.775 4.074 10 4.673 10h6.654Z" })));
}, Upload: function(e) {
  return a.createElement("svg", xe({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), zn || (zn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M11.297 11v.938a4 4 0 1 0-.764-7.66A5.501 5.501 0 0 0 0 6.5a5.5 5.5 0 0 0 5.797 5.492V11h-.403c-1.395 0-2.08-1.7-1.075-2.667L7.472 5.3a1.55 1.55 0 0 1 2.15 0l3.152 3.034C13.78 9.301 13.094 11 11.7 11h-.402ZM8.339 6.2a.3.3 0 0 1 .416 0l3.152 3.034a.3.3 0 0 1-.208.516h-1.652v3.75a1.5 1.5 0 0 1-3 0V9.75H5.394a.3.3 0 0 1-.208-.516L8.339 6.2Z", clipRule: "evenodd" })));
}, VerticalEllipsis: function(e) {
  return a.createElement("svg", Ee({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), $n || ($n = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M9.5 2.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm0 5a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM7.75 14.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z", clipRule: "evenodd" })));
}, View: function(e) {
  return a.createElement("svg", Me({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Fn || (Fn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M3 4h1.05V2H2.5A1.5 1.5 0 0 0 1 3.5v1.45h2V4Zm3.45-2h3.1v2h-3.1V2Zm5.5 0h1.55A1.5 1.5 0 0 1 15 3.5v1.45h-2V4h-1.05V2ZM15 6.55v2.9h-2v-2.9h2Zm-12 0v2.9H1v-2.9h2Zm12 4.5v1.45a1.5 1.5 0 0 1-1.5 1.5h-1.55v-2H13v-.95h2ZM3 12v-.95H1v1.45A1.5 1.5 0 0 0 2.5 14h1.55v-2H3Zm3.45 0h3.1v2h-3.1v-2ZM4.5 8a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5Z", clipRule: "evenodd" })), Tn || (Tn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Z", clipRule: "evenodd" })));
}, Visibility: function(e) {
  return a.createElement("svg", Ce({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Gn || (Gn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 2.008c3.934 0 6.473 3.129 7.455 4.583l.043.064C15.713 6.97 16 7.391 16 8s-.287 1.03-.502 1.345l-.043.064c-.982 1.454-3.521 4.583-7.455 4.583S1.527 10.863.545 9.41l-.043-.064C.287 9.03 0 8.609 0 8s.287-1.03.502-1.345l.043-.064C1.527 5.137 4.066 2.008 8 2.008ZM9.13 4.13A5.147 5.147 0 0 0 8 4.005C5.75 4.005 3.927 5.794 3.927 8c0 2.206 1.824 3.995 4.073 3.995 2.25 0 4.073-1.789 4.073-3.995 0-2.206-1.824-3.995-4.073-3.995.378 0 .756.045 1.13.126ZM8 10.996c1.687 0 3.055-1.341 3.055-2.996S9.687 5.004 8 5.004 4.945 6.345 4.945 8 6.313 10.996 8 10.996Z", clipRule: "evenodd" })));
}, VisibilityOff: function(e) {
  return a.createElement("svg", He({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), _n || (_n = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M14.601 1.266a1.03 1.03 0 0 0-1.433.049L1.704 13.486a.987.987 0 0 0 .062 1.407 1.03 1.03 0 0 0 1.433-.049l1.793-1.904A7.348 7.348 0 0 0 8 13.587c3.934 0 6.473-3.133 7.455-4.59l.043-.063c.215-.316.502-.737.502-1.347s-.287-1.03-.502-1.346l-.043-.065a12.85 12.85 0 0 0-1.949-2.275l1.157-1.228a.987.987 0 0 0-.062-1.407Zm-2.93 4.585-.764.81c.096.292.148.603.148.926 0 1.657-1.368 3-3.055 3-.246 0-.485-.028-.714-.082l-.763.81c.458.176.956.272 1.477.272 2.25 0 4.073-1.79 4.073-4 0-.622-.145-1.211-.403-1.736ZM8 1.587c.919 0 1.762.171 2.526.452L8.98 3.68A5.13 5.13 0 0 0 8 3.587c-2.25 0-4.073 1.79-4.073 4 0 .435.07.853.201 1.245l-1.985 2.107A13.06 13.06 0 0 1 .545 8.998l-.043-.064C.287 8.618 0 8.197 0 7.587s.287-1.03.502-1.346l.043-.065C1.527 4.72 4.066 1.587 8 1.587Zm0 2c.327 0 .654.034.978.095l-.016.017A4.155 4.155 0 0 0 8 3.587Zm0 1c.041 0 .083 0 .124.002L4.966 7.942a2.978 2.978 0 0 1-.02-.355c0-1.657 1.367-3 3.054-3Z", clipRule: "evenodd" })));
}, Warning: function(e) {
  return a.createElement("svg", Re({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Jn || (Jn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8.864 1.514a.983.983 0 0 0-1.728 0L1.122 12.539A.987.987 0 0 0 1.986 14h12.028a.987.987 0 0 0 .864-1.461L8.864 1.514ZM7 5a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0V5Zm2 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z", clipRule: "evenodd" })));
}, Wizard: function(e) {
  return a.createElement("svg", Ve({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Xn || (Xn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M13.327 3.277c.188-.38-.236-.8-.618-.613l-2.513 1.223a.461.461 0 0 1-.523-.095L7.603 1.74c-.314-.313-.829-.062-.75.365l.517 2.808a.421.421 0 0 1-.228.46L4.63 6.596c-.383.186-.277.761.154.839l2.832.513a.477.477 0 0 1 .382.379l.517 2.808c.079.427.659.532.846.153l1.234-2.492a.427.427 0 0 1 .464-.225l2.832.512c.43.078.683-.432.368-.744l-2.07-2.052a.452.452 0 0 1-.095-.519l1.233-2.491ZM7 10.5c.353-.35.312-.958-.091-1.359-.404-.4-1.017-.44-1.37-.09L1.84 12.713c-.353.35-.312.958.092 1.358.403.4 1.017.44 1.37.09L7 10.5Z", clipRule: "evenodd" })));
}, Wrench: function(e) {
  return a.createElement("svg", Pe({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Yn || (Yn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M10.625 9.75a4.374 4.374 0 0 0 4.206-5.584c-.085-.295-.449-.36-.665-.145l-2.1 2.1a.44.44 0 0 1-.184.11c-.078.024-.157-.013-.215-.07L9.84 4.332c-.058-.058-.095-.137-.071-.215a.44.44 0 0 1 .11-.184l2.1-2.1c.216-.216.147-.58-.145-.664a4.374 4.374 0 0 0-5.385 5.512.32.32 0 0 1-.077.32l-4.828 4.829a1.857 1.857 0 0 0 2.625 2.625l4.828-4.828a.32.32 0 0 1 .323-.075c.412.129.851.197 1.305.197ZM2.75 14.125a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75Z", clipRule: "evenodd" })));
}, Write: function(e) {
  return a.createElement("svg", Le({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Kn || (Kn = a.createElement("path", { fill: "currentColor", d: "M8.71 3.75a9.487 9.487 0 0 0-2.335-.28c-2.404 0-4.875.824-4.875 2.563 0 .077 0 .152.002.225a2.117 2.117 0 0 0-.002.095v.206c0 .27.12.529.384.783.267.258.664.491 1.157.686.983.39 2.252.59 3.334.59.267 0 .546-.013.828-.037a1.76 1.76 0 0 1-.288-1.818 1.826 1.826 0 0 1 1.706-1.125h.09V3.75ZM8.068 9.305c-.578.091-1.158.136-1.693.136-1.162 0-2.534-.212-3.63-.646-.465-.184-.897-.415-1.245-.7v1.758c0 .27.12.529.384.783.267.258.664.491 1.157.686.983.39 2.252.59 3.334.59 1.082 0 2.35-.2 3.334-.59.22-.086.42-.18.598-.282a1.85 1.85 0 0 1-.209-.141l-2.03-1.594Z" })), qn || (qn = a.createElement("path", { fill: "currentColor", d: "M11.25 11.39c-.348.284-.78.515-1.245.7-1.096.433-2.468.645-3.63.645s-2.534-.212-3.63-.646c-.465-.184-.897-.415-1.245-.7v.729c0 .028 0 .056.002.084l-.002.236C1.5 14.177 3.971 15 6.375 15s4.875-.823 4.875-2.562c0-.076 0-.152-.002-.226l.002-.094v-.729ZM12.489 2.297v4.576h1.39c.574 0 .84.646.406.986l-2.63 2.063a.668.668 0 0 1-.81 0l-2.63-2.063c-.433-.34-.168-.986.406-.986H9.93V2.297C9.93 1.58 10.502 1 11.21 1c.706 0 1.279.58 1.279 1.297Z" })));
}, X: function(e) {
  return a.createElement("svg", Be({ xmlns: "http://www.w3.org/2000/svg", width: 17, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), Qn || (Qn = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M12.203 3.404a1 1 0 0 0-1.414 0L8.314 5.879 5.839 3.404a1 1 0 0 0-1.414 0l-.707.707a1 1 0 0 0 0 1.414L6.192 8l-2.474 2.475a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414 0l2.475-2.475 2.475 2.475a1 1 0 0 0 1.414 0l.707-.707a1 1 0 0 0 0-1.414L10.435 8l2.475-2.475a1 1 0 0 0 0-1.414l-.707-.707Z", clipRule: "evenodd" })));
}, XWithCircle: function(e) {
  return a.createElement("svg", Ae({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", viewBox: "0 0 16 16" }, e), e2 || (e2 = a.createElement("path", { fill: "currentColor", fillRule: "evenodd", d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm1.414-9.828a1 1 0 1 1 1.414 1.414L9.414 8l1.414 1.414a1 1 0 1 1-1.414 1.414L8 9.414l-1.414 1.414a1 1 0 1 1-1.414-1.414L6.586 8 5.172 6.586a1 1 0 0 1 1.414-1.414L8 6.586l1.414-1.414Z", clipRule: "evenodd" })));
} }, Fa = Object.keys(t2).reduce(function(e, t) {
  return e[t] = Na(t, t2[t]), e;
}, {}), _a = $a(Fa);
function Ja(e) {
  return j2(e) ? e != null && d(e) === "object" && "type" in e && e.type.isGlyph === !0 : e != null && typeof e == "function" && "isGlyph" in e && e.isGlyph === !0;
}
export {
  _a as U,
  Na as g,
  Ja as z
};
