import { ad as V, a8 as Z, ai as C, a7 as rr, c as T, a1 as er, a2 as tr } from "./index2.js";
var x = Object.prototype.toString, z = function(r) {
  var a = x.call(r), e = a === "[object Arguments]";
  return e || (e = a !== "[object Array]" && r !== null && typeof r == "object" && typeof r.length == "number" && r.length >= 0 && x.call(r.callee) === "[object Function]"), e;
}, d, B;
function nr() {
  if (B)
    return d;
  B = 1;
  var i;
  if (!Object.keys) {
    var r = Object.prototype.hasOwnProperty, a = Object.prototype.toString, e = z, u = Object.prototype.propertyIsEnumerable, o = !u.call({ toString: null }, "toString"), f = u.call(function() {
    }, "prototype"), p = [
      "toString",
      "toLocaleString",
      "valueOf",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "constructor"
    ], v = function(n) {
      var t = n.constructor;
      return t && t.prototype === n;
    }, s = {
      $applicationCache: !0,
      $console: !0,
      $external: !0,
      $frame: !0,
      $frameElement: !0,
      $frames: !0,
      $innerHeight: !0,
      $innerWidth: !0,
      $onmozfullscreenchange: !0,
      $onmozfullscreenerror: !0,
      $outerHeight: !0,
      $outerWidth: !0,
      $pageXOffset: !0,
      $pageYOffset: !0,
      $parent: !0,
      $scrollLeft: !0,
      $scrollTop: !0,
      $scrollX: !0,
      $scrollY: !0,
      $self: !0,
      $webkitIndexedDB: !0,
      $webkitStorageInfo: !0,
      $window: !0
    }, l = function() {
      if (typeof window > "u")
        return !1;
      for (var n in window)
        try {
          if (!s["$" + n] && r.call(window, n) && window[n] !== null && typeof window[n] == "object")
            try {
              v(window[n]);
            } catch {
              return !0;
            }
        } catch {
          return !0;
        }
      return !1;
    }(), c = function(n) {
      if (typeof window > "u" || !l)
        return v(n);
      try {
        return v(n);
      } catch {
        return !1;
      }
    };
    i = function(t) {
      var I = t !== null && typeof t == "object", A = a.call(t) === "[object Function]", k = e(t), M = I && a.call(t) === "[object String]", y = [];
      if (!I && !A && !k)
        throw new TypeError("Object.keys called on a non-object");
      var Q = f && A;
      if (M && t.length > 0 && !r.call(t, 0))
        for (var b = 0; b < t.length; ++b)
          y.push(String(b));
      if (k && t.length > 0)
        for (var O = 0; O < t.length; ++O)
          y.push(String(O));
      else
        for (var $ in t)
          !(Q && $ === "prototype") && r.call(t, $) && y.push(String($));
      if (o)
        for (var U = c(t), g = 0; g < p.length; ++g)
          !(U && p[g] === "constructor") && r.call(t, p[g]) && y.push(p[g]);
      return y;
    };
  }
  return d = i, d;
}
var ir = Array.prototype.slice, ar = z, D = Object.keys, h = D ? function(r) {
  return D(r);
} : nr(), E = Object.keys;
h.shim = function() {
  if (Object.keys) {
    var r = function() {
      var a = Object.keys(arguments);
      return a && a.length === arguments.length;
    }(1, 2);
    r || (Object.keys = function(e) {
      return ar(e) ? E(ir.call(e)) : E(e);
    });
  } else
    Object.keys = h;
  return Object.keys || h;
};
var G = h, or = G, L = V(), N = Z, m = C, sr = N("Array.prototype.push"), q = N("Object.prototype.propertyIsEnumerable"), ur = L ? m.getOwnPropertySymbols : null, lr = function(r, a) {
  if (r == null)
    throw new TypeError("target must be an object");
  var e = m(r);
  if (arguments.length === 1)
    return e;
  for (var u = 1; u < arguments.length; ++u) {
    var o = m(arguments[u]), f = or(o), p = L && (m.getOwnPropertySymbols || ur);
    if (p)
      for (var v = p(o), s = 0; s < v.length; ++s) {
        var l = v[s];
        q(o, l) && sr(f, l);
      }
    for (var c = 0; c < f.length; ++c) {
      var n = f[c];
      if (q(o, n)) {
        var t = o[n];
        e[n] = t;
      }
    }
  }
  return e;
}, j = lr, cr = function() {
  if (!Object.assign)
    return !1;
  for (var i = "abcdefghijklmnopqrst", r = i.split(""), a = {}, e = 0; e < r.length; ++e)
    a[r[e]] = r[e];
  var u = Object.assign({}, a), o = "";
  for (var f in u)
    o += f;
  return i !== o;
}, fr = function() {
  if (!Object.assign || !Object.preventExtensions)
    return !1;
  var i = Object.preventExtensions({ 1: 2 });
  try {
    Object.assign(i, "xy");
  } catch {
    return i[1] === "y";
  }
  return !1;
}, hr = function() {
  return !Object.assign || cr() || fr() ? j : Object.assign;
}, F = function(i) {
  return i !== i;
}, W = function(r, a) {
  return r === 0 && a === 0 ? 1 / r === 1 / a : !!(r === a || F(r) && F(a));
}, pr = W, X = function() {
  return typeof Object.is == "function" ? Object.is : pr;
}, Y = rr, _ = T, vr = _(Y("String.prototype.indexOf")), mr = function(r, a) {
  var e = Y(r, !!a);
  return typeof e == "function" && vr(r, ".prototype.") > -1 ? _(e) : e;
}, w, K;
function J() {
  if (K)
    return w;
  K = 1;
  var i = G, r = typeof Symbol == "function" && typeof Symbol("foo") == "symbol", a = Object.prototype.toString, e = Array.prototype.concat, u = tr, o = function(s) {
    return typeof s == "function" && a.call(s) === "[object Function]";
  }, f = er(), p = function(s, l, c, n) {
    if (l in s) {
      if (n === !0) {
        if (s[l] === c)
          return;
      } else if (!o(n) || !n())
        return;
    }
    f ? u(s, l, c, !0) : u(s, l, c);
  }, v = function(s, l) {
    var c = arguments.length > 2 ? arguments[2] : {}, n = i(l);
    r && (n = e.call(n, Object.getOwnPropertySymbols(l)));
    for (var t = 0; t < n.length; t += 1)
      p(s, n[t], l[n[t]], c[n[t]]);
  };
  return v.supportsDescriptors = !!f, w = v, w;
}
var S, R;
function yr() {
  if (R)
    return S;
  R = 1;
  var i = X, r = J();
  return S = function() {
    var e = i();
    return r(Object, { is: e }, {
      is: function() {
        return Object.is !== e;
      }
    }), e;
  }, S;
}
var P, H;
function br() {
  if (H)
    return P;
  H = 1;
  var i = J(), r = T, a = W, e = X, u = yr(), o = r(e(), Object);
  return i(o, {
    getPolyfill: e,
    implementation: a,
    shim: u
  }), P = o, P;
}
export {
  br as a,
  X as b,
  mr as c,
  lr as i,
  G as o,
  hr as p,
  J as r
};
