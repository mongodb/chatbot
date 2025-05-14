import Be from "react";
var Ie = {}, jr = {};
jr.byteLength = ke;
jr.toByteArray = Le;
jr.fromByteArray = Me;
var H = [], q = [], Se = typeof Uint8Array < "u" ? Uint8Array : Array, zr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var vr = 0, Ue = zr.length; vr < Ue; ++vr)
  H[vr] = zr[vr], q[zr.charCodeAt(vr)] = vr;
q["-".charCodeAt(0)] = 62;
q["_".charCodeAt(0)] = 63;
function se(c) {
  var l = c.length;
  if (l % 4 > 0)
    throw new Error("Invalid string. Length must be a multiple of 4");
  var v = c.indexOf("=");
  v === -1 && (v = l);
  var g = v === l ? 0 : 4 - v % 4;
  return [v, g];
}
function ke(c) {
  var l = se(c), v = l[0], g = l[1];
  return (v + g) * 3 / 4 - g;
}
function De(c, l, v) {
  return (l + v) * 3 / 4 - v;
}
function Le(c) {
  var l, v = se(c), g = v[0], F = v[1], w = new Se(De(c, g, F)), h = 0, a = F > 0 ? g - 4 : g, b;
  for (b = 0; b < a; b += 4)
    l = q[c.charCodeAt(b)] << 18 | q[c.charCodeAt(b + 1)] << 12 | q[c.charCodeAt(b + 2)] << 6 | q[c.charCodeAt(b + 3)], w[h++] = l >> 16 & 255, w[h++] = l >> 8 & 255, w[h++] = l & 255;
  return F === 2 && (l = q[c.charCodeAt(b)] << 2 | q[c.charCodeAt(b + 1)] >> 4, w[h++] = l & 255), F === 1 && (l = q[c.charCodeAt(b)] << 10 | q[c.charCodeAt(b + 1)] << 4 | q[c.charCodeAt(b + 2)] >> 2, w[h++] = l >> 8 & 255, w[h++] = l & 255), w;
}
function Oe(c) {
  return H[c >> 18 & 63] + H[c >> 12 & 63] + H[c >> 6 & 63] + H[c & 63];
}
function Pe(c, l, v) {
  for (var g, F = [], w = l; w < v; w += 3)
    g = (c[w] << 16 & 16711680) + (c[w + 1] << 8 & 65280) + (c[w + 2] & 255), F.push(Oe(g));
  return F.join("");
}
function Me(c) {
  for (var l, v = c.length, g = v % 3, F = [], w = 16383, h = 0, a = v - g; h < a; h += w)
    F.push(Pe(c, h, h + w > a ? a : h + w));
  return g === 1 ? (l = c[v - 1], F.push(
    H[l >> 2] + H[l << 4 & 63] + "=="
  )) : g === 2 && (l = (c[v - 2] << 8) + c[v - 1], F.push(
    H[l >> 10] + H[l >> 4 & 63] + H[l << 2 & 63] + "="
  )), F.join("");
}
var re = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
re.read = function(c, l, v, g, F) {
  var w, h, a = F * 8 - g - 1, b = (1 << a) - 1, N = b >> 1, I = -7, B = v ? F - 1 : 0, Y = v ? -1 : 1, M = c[l + B];
  for (B += Y, w = M & (1 << -I) - 1, M >>= -I, I += a; I > 0; w = w * 256 + c[l + B], B += Y, I -= 8)
    ;
  for (h = w & (1 << -I) - 1, w >>= -I, I += g; I > 0; h = h * 256 + c[l + B], B += Y, I -= 8)
    ;
  if (w === 0)
    w = 1 - N;
  else {
    if (w === b)
      return h ? NaN : (M ? -1 : 1) * (1 / 0);
    h = h + Math.pow(2, g), w = w - N;
  }
  return (M ? -1 : 1) * h * Math.pow(2, w - g);
};
re.write = function(c, l, v, g, F, w) {
  var h, a, b, N = w * 8 - F - 1, I = (1 << N) - 1, B = I >> 1, Y = F === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, M = g ? 0 : w - 1, er = g ? 1 : -1, ir = l < 0 || l === 0 && 1 / l < 0 ? 1 : 0;
  for (l = Math.abs(l), isNaN(l) || l === 1 / 0 ? (a = isNaN(l) ? 1 : 0, h = I) : (h = Math.floor(Math.log(l) / Math.LN2), l * (b = Math.pow(2, -h)) < 1 && (h--, b *= 2), h + B >= 1 ? l += Y / b : l += Y * Math.pow(2, 1 - B), l * b >= 2 && (h++, b /= 2), h + B >= I ? (a = 0, h = I) : h + B >= 1 ? (a = (l * b - 1) * Math.pow(2, F), h = h + B) : (a = l * Math.pow(2, B - 1) * Math.pow(2, F), h = 0)); F >= 8; c[v + M] = a & 255, M += er, a /= 256, F -= 8)
    ;
  for (h = h << F | a, N += F; N > 0; c[v + M] = h & 255, M += er, h /= 256, N -= 8)
    ;
  c[v + M - er] |= ir * 128;
};
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
(function(c) {
  var l = jr, v = re, g = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
  c.Buffer = a, c.SlowBuffer = O, c.INSPECT_MAX_BYTES = 50;
  var F = 2147483647;
  c.kMaxLength = F, a.TYPED_ARRAY_SUPPORT = w(), !a.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
    "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
  );
  function w() {
    try {
      var t = new Uint8Array(1), r = { foo: function() {
        return 42;
      } };
      return Object.setPrototypeOf(r, Uint8Array.prototype), Object.setPrototypeOf(t, r), t.foo() === 42;
    } catch {
      return !1;
    }
  }
  Object.defineProperty(a.prototype, "parent", {
    enumerable: !0,
    get: function() {
      if (a.isBuffer(this))
        return this.buffer;
    }
  }), Object.defineProperty(a.prototype, "offset", {
    enumerable: !0,
    get: function() {
      if (a.isBuffer(this))
        return this.byteOffset;
    }
  });
  function h(t) {
    if (t > F)
      throw new RangeError('The value "' + t + '" is invalid for option "size"');
    var r = new Uint8Array(t);
    return Object.setPrototypeOf(r, a.prototype), r;
  }
  function a(t, r, e) {
    if (typeof t == "number") {
      if (typeof r == "string")
        throw new TypeError(
          'The "string" argument must be of type string. Received type number'
        );
      return B(t);
    }
    return b(t, r, e);
  }
  a.poolSize = 8192;
  function b(t, r, e) {
    if (typeof t == "string")
      return Y(t, r);
    if (ArrayBuffer.isView(t))
      return er(t);
    if (t == null)
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof t
      );
    if (V(t, ArrayBuffer) || t && V(t.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (V(t, SharedArrayBuffer) || t && V(t.buffer, SharedArrayBuffer)))
      return ir(t, r, e);
    if (typeof t == "number")
      throw new TypeError(
        'The "value" argument must not be of type number. Received type number'
      );
    var n = t.valueOf && t.valueOf();
    if (n != null && n !== t)
      return a.from(n, r, e);
    var o = Nr(t);
    if (o)
      return o;
    if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof t[Symbol.toPrimitive] == "function")
      return a.from(
        t[Symbol.toPrimitive]("string"),
        r,
        e
      );
    throw new TypeError(
      "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof t
    );
  }
  a.from = function(t, r, e) {
    return b(t, r, e);
  }, Object.setPrototypeOf(a.prototype, Uint8Array.prototype), Object.setPrototypeOf(a, Uint8Array);
  function N(t) {
    if (typeof t != "number")
      throw new TypeError('"size" argument must be of type number');
    if (t < 0)
      throw new RangeError('The value "' + t + '" is invalid for option "size"');
  }
  function I(t, r, e) {
    return N(t), t <= 0 ? h(t) : r !== void 0 ? typeof e == "string" ? h(t).fill(r, e) : h(t).fill(r) : h(t);
  }
  a.alloc = function(t, r, e) {
    return I(t, r, e);
  };
  function B(t) {
    return N(t), h(t < 0 ? 0 : G(t) | 0);
  }
  a.allocUnsafe = function(t) {
    return B(t);
  }, a.allocUnsafeSlow = function(t) {
    return B(t);
  };
  function Y(t, r) {
    if ((typeof r != "string" || r === "") && (r = "utf8"), !a.isEncoding(r))
      throw new TypeError("Unknown encoding: " + r);
    var e = Tr(t, r) | 0, n = h(e), o = n.write(t, r);
    return o !== e && (n = n.slice(0, o)), n;
  }
  function M(t) {
    for (var r = t.length < 0 ? 0 : G(t.length) | 0, e = h(r), n = 0; n < r; n += 1)
      e[n] = t[n] & 255;
    return e;
  }
  function er(t) {
    if (V(t, Uint8Array)) {
      var r = new Uint8Array(t);
      return ir(r.buffer, r.byteOffset, r.byteLength);
    }
    return M(t);
  }
  function ir(t, r, e) {
    if (r < 0 || t.byteLength < r)
      throw new RangeError('"offset" is outside of buffer bounds');
    if (t.byteLength < r + (e || 0))
      throw new RangeError('"length" is outside of buffer bounds');
    var n;
    return r === void 0 && e === void 0 ? n = new Uint8Array(t) : e === void 0 ? n = new Uint8Array(t, r) : n = new Uint8Array(t, r, e), Object.setPrototypeOf(n, a.prototype), n;
  }
  function Nr(t) {
    if (a.isBuffer(t)) {
      var r = G(t.length) | 0, e = h(r);
      return e.length === 0 || t.copy(e, 0, 0, r), e;
    }
    if (t.length !== void 0)
      return typeof t.length != "number" || Er(t.length) ? h(0) : M(t);
    if (t.type === "Buffer" && Array.isArray(t.data))
      return M(t.data);
  }
  function G(t) {
    if (t >= F)
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + F.toString(16) + " bytes");
    return t | 0;
  }
  function O(t) {
    return +t != t && (t = 0), a.alloc(+t);
  }
  a.isBuffer = function(r) {
    return r != null && r._isBuffer === !0 && r !== a.prototype;
  }, a.compare = function(r, e) {
    if (V(r, Uint8Array) && (r = a.from(r, r.offset, r.byteLength)), V(e, Uint8Array) && (e = a.from(e, e.offset, e.byteLength)), !a.isBuffer(r) || !a.isBuffer(e))
      throw new TypeError(
        'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
      );
    if (r === e)
      return 0;
    for (var n = r.length, o = e.length, u = 0, s = Math.min(n, o); u < s; ++u)
      if (r[u] !== e[u]) {
        n = r[u], o = e[u];
        break;
      }
    return n < o ? -1 : o < n ? 1 : 0;
  }, a.isEncoding = function(r) {
    switch (String(r).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return !0;
      default:
        return !1;
    }
  }, a.concat = function(r, e) {
    if (!Array.isArray(r))
      throw new TypeError('"list" argument must be an Array of Buffers');
    if (r.length === 0)
      return a.alloc(0);
    var n;
    if (e === void 0)
      for (e = 0, n = 0; n < r.length; ++n)
        e += r[n].length;
    var o = a.allocUnsafe(e), u = 0;
    for (n = 0; n < r.length; ++n) {
      var s = r[n];
      if (V(s, Uint8Array))
        u + s.length > o.length ? a.from(s).copy(o, u) : Uint8Array.prototype.set.call(
          o,
          s,
          u
        );
      else if (a.isBuffer(s))
        s.copy(o, u);
      else
        throw new TypeError('"list" argument must be an Array of Buffers');
      u += s.length;
    }
    return o;
  };
  function Tr(t, r) {
    if (a.isBuffer(t))
      return t.length;
    if (ArrayBuffer.isView(t) || V(t, ArrayBuffer))
      return t.byteLength;
    if (typeof t != "string")
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof t
      );
    var e = t.length, n = arguments.length > 2 && arguments[2] === !0;
    if (!n && e === 0)
      return 0;
    for (var o = !1; ; )
      switch (r) {
        case "ascii":
        case "latin1":
        case "binary":
          return e;
        case "utf8":
        case "utf-8":
          return nr(t).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return e * 2;
        case "hex":
          return e >>> 1;
        case "base64":
          return Lr(t).length;
        default:
          if (o)
            return n ? -1 : nr(t).length;
          r = ("" + r).toLowerCase(), o = !0;
      }
  }
  a.byteLength = Tr;
  function Wr(t, r, e) {
    var n = !1;
    if ((r === void 0 || r < 0) && (r = 0), r > this.length || ((e === void 0 || e > this.length) && (e = this.length), e <= 0) || (e >>>= 0, r >>>= 0, e <= r))
      return "";
    for (t || (t = "utf8"); ; )
      switch (t) {
        case "hex":
          return Sr(this, r, e);
        case "utf8":
        case "utf-8":
          return K(this, r, e);
        case "ascii":
          return Br(this, r, e);
        case "latin1":
        case "binary":
          return Ir(this, r, e);
        case "base64":
          return $(this, r, e);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return Ur(this, r, e);
        default:
          if (n)
            throw new TypeError("Unknown encoding: " + t);
          t = (t + "").toLowerCase(), n = !0;
      }
  }
  a.prototype._isBuffer = !0;
  function Q(t, r, e) {
    var n = t[r];
    t[r] = t[e], t[e] = n;
  }
  a.prototype.swap16 = function() {
    var r = this.length;
    if (r % 2 !== 0)
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    for (var e = 0; e < r; e += 2)
      Q(this, e, e + 1);
    return this;
  }, a.prototype.swap32 = function() {
    var r = this.length;
    if (r % 4 !== 0)
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    for (var e = 0; e < r; e += 4)
      Q(this, e, e + 3), Q(this, e + 1, e + 2);
    return this;
  }, a.prototype.swap64 = function() {
    var r = this.length;
    if (r % 8 !== 0)
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    for (var e = 0; e < r; e += 8)
      Q(this, e, e + 7), Q(this, e + 1, e + 6), Q(this, e + 2, e + 5), Q(this, e + 3, e + 4);
    return this;
  }, a.prototype.toString = function() {
    var r = this.length;
    return r === 0 ? "" : arguments.length === 0 ? K(this, 0, r) : Wr.apply(this, arguments);
  }, a.prototype.toLocaleString = a.prototype.toString, a.prototype.equals = function(r) {
    if (!a.isBuffer(r))
      throw new TypeError("Argument must be a Buffer");
    return this === r ? !0 : a.compare(this, r) === 0;
  }, a.prototype.inspect = function() {
    var r = "", e = c.INSPECT_MAX_BYTES;
    return r = this.toString("hex", 0, e).replace(/(.{2})/g, "$1 ").trim(), this.length > e && (r += " ... "), "<Buffer " + r + ">";
  }, g && (a.prototype[g] = a.prototype.inspect), a.prototype.compare = function(r, e, n, o, u) {
    if (V(r, Uint8Array) && (r = a.from(r, r.offset, r.byteLength)), !a.isBuffer(r))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof r
      );
    if (e === void 0 && (e = 0), n === void 0 && (n = r ? r.length : 0), o === void 0 && (o = 0), u === void 0 && (u = this.length), e < 0 || n > r.length || o < 0 || u > this.length)
      throw new RangeError("out of range index");
    if (o >= u && e >= n)
      return 0;
    if (o >= u)
      return -1;
    if (e >= n)
      return 1;
    if (e >>>= 0, n >>>= 0, o >>>= 0, u >>>= 0, this === r)
      return 0;
    for (var s = u - o, m = n - e, A = Math.min(s, m), _ = this.slice(o, u), L = r.slice(e, n), R = 0; R < A; ++R)
      if (_[R] !== L[R]) {
        s = _[R], m = L[R];
        break;
      }
    return s < m ? -1 : m < s ? 1 : 0;
  };
  function br(t, r, e, n, o) {
    if (t.length === 0)
      return -1;
    if (typeof e == "string" ? (n = e, e = 0) : e > 2147483647 ? e = 2147483647 : e < -2147483648 && (e = -2147483648), e = +e, Er(e) && (e = o ? 0 : t.length - 1), e < 0 && (e = t.length + e), e >= t.length) {
      if (o)
        return -1;
      e = t.length - 1;
    } else if (e < 0)
      if (o)
        e = 0;
      else
        return -1;
    if (typeof r == "string" && (r = a.from(r, n)), a.isBuffer(r))
      return r.length === 0 ? -1 : Ar(t, r, e, n, o);
    if (typeof r == "number")
      return r = r & 255, typeof Uint8Array.prototype.indexOf == "function" ? o ? Uint8Array.prototype.indexOf.call(t, r, e) : Uint8Array.prototype.lastIndexOf.call(t, r, e) : Ar(t, [r], e, n, o);
    throw new TypeError("val must be string, number or Buffer");
  }
  function Ar(t, r, e, n, o) {
    var u = 1, s = t.length, m = r.length;
    if (n !== void 0 && (n = String(n).toLowerCase(), n === "ucs2" || n === "ucs-2" || n === "utf16le" || n === "utf-16le")) {
      if (t.length < 2 || r.length < 2)
        return -1;
      u = 2, s /= 2, m /= 2, e /= 2;
    }
    function A(gr, Fr) {
      return u === 1 ? gr[Fr] : gr.readUInt16BE(Fr * u);
    }
    var _;
    if (o) {
      var L = -1;
      for (_ = e; _ < s; _++)
        if (A(t, _) === A(r, L === -1 ? 0 : _ - L)) {
          if (L === -1 && (L = _), _ - L + 1 === m)
            return L * u;
        } else
          L !== -1 && (_ -= _ - L), L = -1;
    } else
      for (e + m > s && (e = s - m), _ = e; _ >= 0; _--) {
        for (var R = !0, lr = 0; lr < m; lr++)
          if (A(t, _ + lr) !== A(r, lr)) {
            R = !1;
            break;
          }
        if (R)
          return _;
      }
    return -1;
  }
  a.prototype.includes = function(r, e, n) {
    return this.indexOf(r, e, n) !== -1;
  }, a.prototype.indexOf = function(r, e, n) {
    return br(this, r, e, n, !0);
  }, a.prototype.lastIndexOf = function(r, e, n) {
    return br(this, r, e, n, !1);
  };
  function Yr(t, r, e, n) {
    e = Number(e) || 0;
    var o = t.length - e;
    n ? (n = Number(n), n > o && (n = o)) : n = o;
    var u = r.length;
    n > u / 2 && (n = u / 2);
    for (var s = 0; s < n; ++s) {
      var m = parseInt(r.substr(s * 2, 2), 16);
      if (Er(m))
        return s;
      t[e + s] = m;
    }
    return s;
  }
  function Rr(t, r, e, n) {
    return or(nr(r, t.length - e), t, e, n);
  }
  function $r(t, r, e, n) {
    return or(mr(r), t, e, n);
  }
  function Vr(t, r, e, n) {
    return or(Lr(r), t, e, n);
  }
  function _r(t, r, e, n) {
    return or(sr(r, t.length - e), t, e, n);
  }
  a.prototype.write = function(r, e, n, o) {
    if (e === void 0)
      o = "utf8", n = this.length, e = 0;
    else if (n === void 0 && typeof e == "string")
      o = e, n = this.length, e = 0;
    else if (isFinite(e))
      e = e >>> 0, isFinite(n) ? (n = n >>> 0, o === void 0 && (o = "utf8")) : (o = n, n = void 0);
    else
      throw new Error(
        "Buffer.write(string, encoding, offset[, length]) is no longer supported"
      );
    var u = this.length - e;
    if ((n === void 0 || n > u) && (n = u), r.length > 0 && (n < 0 || e < 0) || e > this.length)
      throw new RangeError("Attempt to write outside buffer bounds");
    o || (o = "utf8");
    for (var s = !1; ; )
      switch (o) {
        case "hex":
          return Yr(this, r, e, n);
        case "utf8":
        case "utf-8":
          return Rr(this, r, e, n);
        case "ascii":
        case "latin1":
        case "binary":
          return $r(this, r, e, n);
        case "base64":
          return Vr(this, r, e, n);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return _r(this, r, e, n);
        default:
          if (s)
            throw new TypeError("Unknown encoding: " + o);
          o = ("" + o).toLowerCase(), s = !0;
      }
  }, a.prototype.toJSON = function() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function $(t, r, e) {
    return r === 0 && e === t.length ? l.fromByteArray(t) : l.fromByteArray(t.slice(r, e));
  }
  function K(t, r, e) {
    e = Math.min(t.length, e);
    for (var n = [], o = r; o < e; ) {
      var u = t[o], s = null, m = u > 239 ? 4 : u > 223 ? 3 : u > 191 ? 2 : 1;
      if (o + m <= e) {
        var A, _, L, R;
        switch (m) {
          case 1:
            u < 128 && (s = u);
            break;
          case 2:
            A = t[o + 1], (A & 192) === 128 && (R = (u & 31) << 6 | A & 63, R > 127 && (s = R));
            break;
          case 3:
            A = t[o + 1], _ = t[o + 2], (A & 192) === 128 && (_ & 192) === 128 && (R = (u & 15) << 12 | (A & 63) << 6 | _ & 63, R > 2047 && (R < 55296 || R > 57343) && (s = R));
            break;
          case 4:
            A = t[o + 1], _ = t[o + 2], L = t[o + 3], (A & 192) === 128 && (_ & 192) === 128 && (L & 192) === 128 && (R = (u & 15) << 18 | (A & 63) << 12 | (_ & 63) << 6 | L & 63, R > 65535 && R < 1114112 && (s = R));
        }
      }
      s === null ? (s = 65533, m = 1) : s > 65535 && (s -= 65536, n.push(s >>> 10 & 1023 | 55296), s = 56320 | s & 1023), n.push(s), o += m;
    }
    return Cr(n);
  }
  var tr = 4096;
  function Cr(t) {
    var r = t.length;
    if (r <= tr)
      return String.fromCharCode.apply(String, t);
    for (var e = "", n = 0; n < r; )
      e += String.fromCharCode.apply(
        String,
        t.slice(n, n += tr)
      );
    return e;
  }
  function Br(t, r, e) {
    var n = "";
    e = Math.min(t.length, e);
    for (var o = r; o < e; ++o)
      n += String.fromCharCode(t[o] & 127);
    return n;
  }
  function Ir(t, r, e) {
    var n = "";
    e = Math.min(t.length, e);
    for (var o = r; o < e; ++o)
      n += String.fromCharCode(t[o]);
    return n;
  }
  function Sr(t, r, e) {
    var n = t.length;
    (!r || r < 0) && (r = 0), (!e || e < 0 || e > n) && (e = n);
    for (var o = "", u = r; u < e; ++u)
      o += cr[t[u]];
    return o;
  }
  function Ur(t, r, e) {
    for (var n = t.slice(r, e), o = "", u = 0; u < n.length - 1; u += 2)
      o += String.fromCharCode(n[u] + n[u + 1] * 256);
    return o;
  }
  a.prototype.slice = function(r, e) {
    var n = this.length;
    r = ~~r, e = e === void 0 ? n : ~~e, r < 0 ? (r += n, r < 0 && (r = 0)) : r > n && (r = n), e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), e < r && (e = r);
    var o = this.subarray(r, e);
    return Object.setPrototypeOf(o, a.prototype), o;
  };
  function S(t, r, e) {
    if (t % 1 !== 0 || t < 0)
      throw new RangeError("offset is not uint");
    if (t + r > e)
      throw new RangeError("Trying to access beyond buffer length");
  }
  a.prototype.readUintLE = a.prototype.readUIntLE = function(r, e, n) {
    r = r >>> 0, e = e >>> 0, n || S(r, e, this.length);
    for (var o = this[r], u = 1, s = 0; ++s < e && (u *= 256); )
      o += this[r + s] * u;
    return o;
  }, a.prototype.readUintBE = a.prototype.readUIntBE = function(r, e, n) {
    r = r >>> 0, e = e >>> 0, n || S(r, e, this.length);
    for (var o = this[r + --e], u = 1; e > 0 && (u *= 256); )
      o += this[r + --e] * u;
    return o;
  }, a.prototype.readUint8 = a.prototype.readUInt8 = function(r, e) {
    return r = r >>> 0, e || S(r, 1, this.length), this[r];
  }, a.prototype.readUint16LE = a.prototype.readUInt16LE = function(r, e) {
    return r = r >>> 0, e || S(r, 2, this.length), this[r] | this[r + 1] << 8;
  }, a.prototype.readUint16BE = a.prototype.readUInt16BE = function(r, e) {
    return r = r >>> 0, e || S(r, 2, this.length), this[r] << 8 | this[r + 1];
  }, a.prototype.readUint32LE = a.prototype.readUInt32LE = function(r, e) {
    return r = r >>> 0, e || S(r, 4, this.length), (this[r] | this[r + 1] << 8 | this[r + 2] << 16) + this[r + 3] * 16777216;
  }, a.prototype.readUint32BE = a.prototype.readUInt32BE = function(r, e) {
    return r = r >>> 0, e || S(r, 4, this.length), this[r] * 16777216 + (this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3]);
  }, a.prototype.readIntLE = function(r, e, n) {
    r = r >>> 0, e = e >>> 0, n || S(r, e, this.length);
    for (var o = this[r], u = 1, s = 0; ++s < e && (u *= 256); )
      o += this[r + s] * u;
    return u *= 128, o >= u && (o -= Math.pow(2, 8 * e)), o;
  }, a.prototype.readIntBE = function(r, e, n) {
    r = r >>> 0, e = e >>> 0, n || S(r, e, this.length);
    for (var o = e, u = 1, s = this[r + --o]; o > 0 && (u *= 256); )
      s += this[r + --o] * u;
    return u *= 128, s >= u && (s -= Math.pow(2, 8 * e)), s;
  }, a.prototype.readInt8 = function(r, e) {
    return r = r >>> 0, e || S(r, 1, this.length), this[r] & 128 ? (255 - this[r] + 1) * -1 : this[r];
  }, a.prototype.readInt16LE = function(r, e) {
    r = r >>> 0, e || S(r, 2, this.length);
    var n = this[r] | this[r + 1] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, a.prototype.readInt16BE = function(r, e) {
    r = r >>> 0, e || S(r, 2, this.length);
    var n = this[r + 1] | this[r] << 8;
    return n & 32768 ? n | 4294901760 : n;
  }, a.prototype.readInt32LE = function(r, e) {
    return r = r >>> 0, e || S(r, 4, this.length), this[r] | this[r + 1] << 8 | this[r + 2] << 16 | this[r + 3] << 24;
  }, a.prototype.readInt32BE = function(r, e) {
    return r = r >>> 0, e || S(r, 4, this.length), this[r] << 24 | this[r + 1] << 16 | this[r + 2] << 8 | this[r + 3];
  }, a.prototype.readFloatLE = function(r, e) {
    return r = r >>> 0, e || S(r, 4, this.length), v.read(this, r, !0, 23, 4);
  }, a.prototype.readFloatBE = function(r, e) {
    return r = r >>> 0, e || S(r, 4, this.length), v.read(this, r, !1, 23, 4);
  }, a.prototype.readDoubleLE = function(r, e) {
    return r = r >>> 0, e || S(r, 8, this.length), v.read(this, r, !0, 52, 8);
  }, a.prototype.readDoubleBE = function(r, e) {
    return r = r >>> 0, e || S(r, 8, this.length), v.read(this, r, !1, 52, 8);
  };
  function P(t, r, e, n, o, u) {
    if (!a.isBuffer(t))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (r > o || r < u)
      throw new RangeError('"value" argument is out of bounds');
    if (e + n > t.length)
      throw new RangeError("Index out of range");
  }
  a.prototype.writeUintLE = a.prototype.writeUIntLE = function(r, e, n, o) {
    if (r = +r, e = e >>> 0, n = n >>> 0, !o) {
      var u = Math.pow(2, 8 * n) - 1;
      P(this, r, e, n, u, 0);
    }
    var s = 1, m = 0;
    for (this[e] = r & 255; ++m < n && (s *= 256); )
      this[e + m] = r / s & 255;
    return e + n;
  }, a.prototype.writeUintBE = a.prototype.writeUIntBE = function(r, e, n, o) {
    if (r = +r, e = e >>> 0, n = n >>> 0, !o) {
      var u = Math.pow(2, 8 * n) - 1;
      P(this, r, e, n, u, 0);
    }
    var s = n - 1, m = 1;
    for (this[e + s] = r & 255; --s >= 0 && (m *= 256); )
      this[e + s] = r / m & 255;
    return e + n;
  }, a.prototype.writeUint8 = a.prototype.writeUInt8 = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 1, 255, 0), this[e] = r & 255, e + 1;
  }, a.prototype.writeUint16LE = a.prototype.writeUInt16LE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 2, 65535, 0), this[e] = r & 255, this[e + 1] = r >>> 8, e + 2;
  }, a.prototype.writeUint16BE = a.prototype.writeUInt16BE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 2, 65535, 0), this[e] = r >>> 8, this[e + 1] = r & 255, e + 2;
  }, a.prototype.writeUint32LE = a.prototype.writeUInt32LE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 4, 4294967295, 0), this[e + 3] = r >>> 24, this[e + 2] = r >>> 16, this[e + 1] = r >>> 8, this[e] = r & 255, e + 4;
  }, a.prototype.writeUint32BE = a.prototype.writeUInt32BE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 4, 4294967295, 0), this[e] = r >>> 24, this[e + 1] = r >>> 16, this[e + 2] = r >>> 8, this[e + 3] = r & 255, e + 4;
  }, a.prototype.writeIntLE = function(r, e, n, o) {
    if (r = +r, e = e >>> 0, !o) {
      var u = Math.pow(2, 8 * n - 1);
      P(this, r, e, n, u - 1, -u);
    }
    var s = 0, m = 1, A = 0;
    for (this[e] = r & 255; ++s < n && (m *= 256); )
      r < 0 && A === 0 && this[e + s - 1] !== 0 && (A = 1), this[e + s] = (r / m >> 0) - A & 255;
    return e + n;
  }, a.prototype.writeIntBE = function(r, e, n, o) {
    if (r = +r, e = e >>> 0, !o) {
      var u = Math.pow(2, 8 * n - 1);
      P(this, r, e, n, u - 1, -u);
    }
    var s = n - 1, m = 1, A = 0;
    for (this[e + s] = r & 255; --s >= 0 && (m *= 256); )
      r < 0 && A === 0 && this[e + s + 1] !== 0 && (A = 1), this[e + s] = (r / m >> 0) - A & 255;
    return e + n;
  }, a.prototype.writeInt8 = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 1, 127, -128), r < 0 && (r = 255 + r + 1), this[e] = r & 255, e + 1;
  }, a.prototype.writeInt16LE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 2, 32767, -32768), this[e] = r & 255, this[e + 1] = r >>> 8, e + 2;
  }, a.prototype.writeInt16BE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 2, 32767, -32768), this[e] = r >>> 8, this[e + 1] = r & 255, e + 2;
  }, a.prototype.writeInt32LE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 4, 2147483647, -2147483648), this[e] = r & 255, this[e + 1] = r >>> 8, this[e + 2] = r >>> 16, this[e + 3] = r >>> 24, e + 4;
  }, a.prototype.writeInt32BE = function(r, e, n) {
    return r = +r, e = e >>> 0, n || P(this, r, e, 4, 2147483647, -2147483648), r < 0 && (r = 4294967295 + r + 1), this[e] = r >>> 24, this[e + 1] = r >>> 16, this[e + 2] = r >>> 8, this[e + 3] = r & 255, e + 4;
  };
  function xr(t, r, e, n, o, u) {
    if (e + n > t.length)
      throw new RangeError("Index out of range");
    if (e < 0)
      throw new RangeError("Index out of range");
  }
  function kr(t, r, e, n, o) {
    return r = +r, e = e >>> 0, o || xr(t, r, e, 4), v.write(t, r, e, n, 23, 4), e + 4;
  }
  a.prototype.writeFloatLE = function(r, e, n) {
    return kr(this, r, e, !0, n);
  }, a.prototype.writeFloatBE = function(r, e, n) {
    return kr(this, r, e, !1, n);
  };
  function Dr(t, r, e, n, o) {
    return r = +r, e = e >>> 0, o || xr(t, r, e, 8), v.write(t, r, e, n, 52, 8), e + 8;
  }
  a.prototype.writeDoubleLE = function(r, e, n) {
    return Dr(this, r, e, !0, n);
  }, a.prototype.writeDoubleBE = function(r, e, n) {
    return Dr(this, r, e, !1, n);
  }, a.prototype.copy = function(r, e, n, o) {
    if (!a.isBuffer(r))
      throw new TypeError("argument should be a Buffer");
    if (n || (n = 0), !o && o !== 0 && (o = this.length), e >= r.length && (e = r.length), e || (e = 0), o > 0 && o < n && (o = n), o === n || r.length === 0 || this.length === 0)
      return 0;
    if (e < 0)
      throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length)
      throw new RangeError("Index out of range");
    if (o < 0)
      throw new RangeError("sourceEnd out of bounds");
    o > this.length && (o = this.length), r.length - e < o - n && (o = r.length - e + n);
    var u = o - n;
    return this === r && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(e, n, o) : Uint8Array.prototype.set.call(
      r,
      this.subarray(n, o),
      e
    ), u;
  }, a.prototype.fill = function(r, e, n, o) {
    if (typeof r == "string") {
      if (typeof e == "string" ? (o = e, e = 0, n = this.length) : typeof n == "string" && (o = n, n = this.length), o !== void 0 && typeof o != "string")
        throw new TypeError("encoding must be a string");
      if (typeof o == "string" && !a.isEncoding(o))
        throw new TypeError("Unknown encoding: " + o);
      if (r.length === 1) {
        var u = r.charCodeAt(0);
        (o === "utf8" && u < 128 || o === "latin1") && (r = u);
      }
    } else
      typeof r == "number" ? r = r & 255 : typeof r == "boolean" && (r = Number(r));
    if (e < 0 || this.length < e || this.length < n)
      throw new RangeError("Out of range index");
    if (n <= e)
      return this;
    e = e >>> 0, n = n === void 0 ? this.length : n >>> 0, r || (r = 0);
    var s;
    if (typeof r == "number")
      for (s = e; s < n; ++s)
        this[s] = r;
    else {
      var m = a.isBuffer(r) ? r : a.from(r, o), A = m.length;
      if (A === 0)
        throw new TypeError('The value "' + r + '" is invalid for argument "value"');
      for (s = 0; s < n - e; ++s)
        this[s + e] = m[s % A];
    }
    return this;
  };
  var wr = /[^+/0-9A-Za-z-_]/g;
  function dr(t) {
    if (t = t.split("=")[0], t = t.trim().replace(wr, ""), t.length < 2)
      return "";
    for (; t.length % 4 !== 0; )
      t = t + "=";
    return t;
  }
  function nr(t, r) {
    r = r || 1 / 0;
    for (var e, n = t.length, o = null, u = [], s = 0; s < n; ++s) {
      if (e = t.charCodeAt(s), e > 55295 && e < 57344) {
        if (!o) {
          if (e > 56319) {
            (r -= 3) > -1 && u.push(239, 191, 189);
            continue;
          } else if (s + 1 === n) {
            (r -= 3) > -1 && u.push(239, 191, 189);
            continue;
          }
          o = e;
          continue;
        }
        if (e < 56320) {
          (r -= 3) > -1 && u.push(239, 191, 189), o = e;
          continue;
        }
        e = (o - 55296 << 10 | e - 56320) + 65536;
      } else
        o && (r -= 3) > -1 && u.push(239, 191, 189);
      if (o = null, e < 128) {
        if ((r -= 1) < 0)
          break;
        u.push(e);
      } else if (e < 2048) {
        if ((r -= 2) < 0)
          break;
        u.push(
          e >> 6 | 192,
          e & 63 | 128
        );
      } else if (e < 65536) {
        if ((r -= 3) < 0)
          break;
        u.push(
          e >> 12 | 224,
          e >> 6 & 63 | 128,
          e & 63 | 128
        );
      } else if (e < 1114112) {
        if ((r -= 4) < 0)
          break;
        u.push(
          e >> 18 | 240,
          e >> 12 & 63 | 128,
          e >> 6 & 63 | 128,
          e & 63 | 128
        );
      } else
        throw new Error("Invalid code point");
    }
    return u;
  }
  function mr(t) {
    for (var r = [], e = 0; e < t.length; ++e)
      r.push(t.charCodeAt(e) & 255);
    return r;
  }
  function sr(t, r) {
    for (var e, n, o, u = [], s = 0; s < t.length && !((r -= 2) < 0); ++s)
      e = t.charCodeAt(s), n = e >> 8, o = e % 256, u.push(o), u.push(n);
    return u;
  }
  function Lr(t) {
    return l.toByteArray(dr(t));
  }
  function or(t, r, e, n) {
    for (var o = 0; o < n && !(o + e >= r.length || o >= t.length); ++o)
      r[o + e] = t[o];
    return o;
  }
  function V(t, r) {
    return t instanceof r || t != null && t.constructor != null && t.constructor.name != null && t.constructor.name === r.name;
  }
  function Er(t) {
    return t !== t;
  }
  var cr = function() {
    for (var t = "0123456789abcdef", r = new Array(256), e = 0; e < 16; ++e)
      for (var n = e * 16, o = 0; o < 16; ++o)
        r[n + o] = t[e] + t[o];
    return r;
  }();
})(Ie);
var x = { exports: {} }, k = x.exports = {}, X, z;
function Hr() {
  throw new Error("setTimeout has not been defined");
}
function Qr() {
  throw new Error("clearTimeout has not been defined");
}
(function() {
  try {
    typeof setTimeout == "function" ? X = setTimeout : X = Hr;
  } catch {
    X = Hr;
  }
  try {
    typeof clearTimeout == "function" ? z = clearTimeout : z = Qr;
  } catch {
    z = Qr;
  }
})();
function ce(c) {
  if (X === setTimeout)
    return setTimeout(c, 0);
  if ((X === Hr || !X) && setTimeout)
    return X = setTimeout, setTimeout(c, 0);
  try {
    return X(c, 0);
  } catch {
    try {
      return X.call(null, c, 0);
    } catch {
      return X.call(this, c, 0);
    }
  }
}
function je(c) {
  if (z === clearTimeout)
    return clearTimeout(c);
  if ((z === Qr || !z) && clearTimeout)
    return z = clearTimeout, clearTimeout(c);
  try {
    return z(c);
  } catch {
    try {
      return z.call(null, c);
    } catch {
      return z.call(this, c);
    }
  }
}
var Z = [], yr = !1, ur, Mr = -1;
function Ne() {
  !yr || !ur || (yr = !1, ur.length ? Z = ur.concat(Z) : Mr = -1, Z.length && le());
}
function le() {
  if (!yr) {
    var c = ce(Ne);
    yr = !0;
    for (var l = Z.length; l; ) {
      for (ur = Z, Z = []; ++Mr < l; )
        ur && ur[Mr].run();
      Mr = -1, l = Z.length;
    }
    ur = null, yr = !1, je(c);
  }
}
k.nextTick = function(c) {
  var l = new Array(arguments.length - 1);
  if (arguments.length > 1)
    for (var v = 1; v < arguments.length; v++)
      l[v - 1] = arguments[v];
  Z.push(new pe(c, l)), Z.length === 1 && !yr && ce(le);
};
function pe(c, l) {
  this.fun = c, this.array = l;
}
pe.prototype.run = function() {
  this.fun.apply(null, this.array);
};
k.title = "browser";
k.browser = !0;
k.env = {};
k.argv = [];
k.version = "";
k.versions = {};
function rr() {
}
k.on = rr;
k.addListener = rr;
k.once = rr;
k.off = rr;
k.removeListener = rr;
k.removeAllListeners = rr;
k.emit = rr;
k.prependListener = rr;
k.prependOnceListener = rr;
k.listeners = function(c) {
  return [];
};
k.binding = function(c) {
  throw new Error("process.binding is not supported");
};
k.cwd = function() {
  return "/";
};
k.chdir = function(c) {
  throw new Error("process.chdir is not supported");
};
k.umask = function() {
  return 0;
};
function fr() {
}
var We = (
  /** @type {boolean} */
  x.exports.browser
), Ye = fr, $e = (
  /** @type {Function} */
  x.exports.binding
), Ve = fr, Je = 1, qe = {}, Ge = fr, Ke = fr, Xe = fr, ze = fr, He = fr, Qe = "browser", Ze = "browser", rt = "browser", et = (
  /** @type {string[]} */
  []
), he = {
  nextTick: x.exports.nextTick,
  title: x.exports.title,
  browser: We,
  env: x.exports.env,
  argv: x.exports.argv,
  version: x.exports.version,
  versions: x.exports.versions,
  on: x.exports.on,
  addListener: x.exports.addListener,
  once: x.exports.once,
  off: x.exports.off,
  removeListener: x.exports.removeListener,
  removeAllListeners: x.exports.removeAllListeners,
  emit: x.exports.emit,
  emitWarning: Ye,
  prependListener: x.exports.prependListener,
  prependOnceListener: x.exports.prependOnceListener,
  listeners: x.exports.listeners,
  binding: $e,
  cwd: x.exports.cwd,
  chdir: x.exports.chdir,
  umask: x.exports.umask,
  exit: Ve,
  pid: Je,
  features: qe,
  kill: Ge,
  dlopen: Ke,
  uptime: Xe,
  memoryUsage: ze,
  uvCounters: He,
  platform: Qe,
  arch: Ze,
  execPath: rt,
  execArgv: et
};
x.exports.addListener;
x.exports.argv;
x.exports.chdir;
x.exports.cwd;
x.exports.emit;
x.exports.env;
x.exports.listeners;
x.exports.nextTick;
x.exports.off;
x.exports.on;
x.exports.once;
x.exports.prependListener;
x.exports.prependOnceListener;
x.exports.removeAllListeners;
x.exports.removeListener;
x.exports.title;
x.exports.umask;
x.exports.version;
x.exports.versions;
(function(c) {
  function l() {
    var g = this || self;
    return delete c.prototype.__magic__, g;
  }
  if (typeof globalThis == "object")
    return globalThis;
  if (this)
    return l();
  c.defineProperty(c.prototype, "__magic__", {
    configurable: !0,
    get: l
  });
  var v = __magic__;
  return v;
})(Object);
var Zr = { exports: {} }, Or = {};
/**
 * @license React
 * react-jsx-dev-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ue;
function tt() {
  if (ue)
    return Or;
  ue = 1;
  var c = Symbol.for("react.fragment");
  return Or.Fragment = c, Or.jsxDEV = void 0, Or;
}
var Pr = {}, fe;
function nt() {
  return fe || (fe = 1, he.env.NODE_ENV !== "production" && function() {
    var c = Be, l = Symbol.for("react.element"), v = Symbol.for("react.portal"), g = Symbol.for("react.fragment"), F = Symbol.for("react.strict_mode"), w = Symbol.for("react.profiler"), h = Symbol.for("react.provider"), a = Symbol.for("react.context"), b = Symbol.for("react.forward_ref"), N = Symbol.for("react.suspense"), I = Symbol.for("react.suspense_list"), B = Symbol.for("react.memo"), Y = Symbol.for("react.lazy"), M = Symbol.for("react.offscreen"), er = Symbol.iterator, ir = "@@iterator";
    function Nr(i) {
      if (i === null || typeof i != "object")
        return null;
      var f = er && i[er] || i[ir];
      return typeof f == "function" ? f : null;
    }
    var G = c.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function O(i) {
      {
        for (var f = arguments.length, p = new Array(f > 1 ? f - 1 : 0), y = 1; y < f; y++)
          p[y - 1] = arguments[y];
        Tr("error", i, p);
      }
    }
    function Tr(i, f, p) {
      {
        var y = G.ReactDebugCurrentFrame, T = y.getStackAddendum();
        T !== "" && (f += "%s", p = p.concat([T]));
        var C = p.map(function(E) {
          return String(E);
        });
        C.unshift("Warning: " + f), Function.prototype.apply.call(console[i], console, C);
      }
    }
    var Wr = !1, Q = !1, br = !1, Ar = !1, Yr = !1, Rr;
    Rr = Symbol.for("react.module.reference");
    function $r(i) {
      return !!(typeof i == "string" || typeof i == "function" || i === g || i === w || Yr || i === F || i === N || i === I || Ar || i === M || Wr || Q || br || typeof i == "object" && i !== null && (i.$$typeof === Y || i.$$typeof === B || i.$$typeof === h || i.$$typeof === a || i.$$typeof === b || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      i.$$typeof === Rr || i.getModuleId !== void 0));
    }
    function Vr(i, f, p) {
      var y = i.displayName;
      if (y)
        return y;
      var T = f.displayName || f.name || "";
      return T !== "" ? p + "(" + T + ")" : p;
    }
    function _r(i) {
      return i.displayName || "Context";
    }
    function $(i) {
      if (i == null)
        return null;
      if (typeof i.tag == "number" && O("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof i == "function")
        return i.displayName || i.name || null;
      if (typeof i == "string")
        return i;
      switch (i) {
        case g:
          return "Fragment";
        case v:
          return "Portal";
        case w:
          return "Profiler";
        case F:
          return "StrictMode";
        case N:
          return "Suspense";
        case I:
          return "SuspenseList";
      }
      if (typeof i == "object")
        switch (i.$$typeof) {
          case a:
            var f = i;
            return _r(f) + ".Consumer";
          case h:
            var p = i;
            return _r(p._context) + ".Provider";
          case b:
            return Vr(i, i.render, "ForwardRef");
          case B:
            var y = i.displayName || null;
            return y !== null ? y : $(i.type) || "Memo";
          case Y: {
            var T = i, C = T._payload, E = T._init;
            try {
              return $(E(C));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var K = Object.assign, tr = 0, Cr, Br, Ir, Sr, Ur, S, P;
    function xr() {
    }
    xr.__reactDisabledLog = !0;
    function kr() {
      {
        if (tr === 0) {
          Cr = console.log, Br = console.info, Ir = console.warn, Sr = console.error, Ur = console.group, S = console.groupCollapsed, P = console.groupEnd;
          var i = {
            configurable: !0,
            enumerable: !0,
            value: xr,
            writable: !0
          };
          Object.defineProperties(console, {
            info: i,
            log: i,
            warn: i,
            error: i,
            group: i,
            groupCollapsed: i,
            groupEnd: i
          });
        }
        tr++;
      }
    }
    function Dr() {
      {
        if (tr--, tr === 0) {
          var i = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: K({}, i, {
              value: Cr
            }),
            info: K({}, i, {
              value: Br
            }),
            warn: K({}, i, {
              value: Ir
            }),
            error: K({}, i, {
              value: Sr
            }),
            group: K({}, i, {
              value: Ur
            }),
            groupCollapsed: K({}, i, {
              value: S
            }),
            groupEnd: K({}, i, {
              value: P
            })
          });
        }
        tr < 0 && O("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var wr = G.ReactCurrentDispatcher, dr;
    function nr(i, f, p) {
      {
        if (dr === void 0)
          try {
            throw Error();
          } catch (T) {
            var y = T.stack.trim().match(/\n( *(at )?)/);
            dr = y && y[1] || "";
          }
        return `
` + dr + i;
      }
    }
    var mr = !1, sr;
    {
      var Lr = typeof WeakMap == "function" ? WeakMap : Map;
      sr = new Lr();
    }
    function or(i, f) {
      if (!i || mr)
        return "";
      {
        var p = sr.get(i);
        if (p !== void 0)
          return p;
      }
      var y;
      mr = !0;
      var T = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var C;
      C = wr.current, wr.current = null, kr();
      try {
        if (f) {
          var E = function() {
            throw Error();
          };
          if (Object.defineProperty(E.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(E, []);
            } catch (W) {
              y = W;
            }
            Reflect.construct(i, [], E);
          } else {
            try {
              E.call();
            } catch (W) {
              y = W;
            }
            i.call(E.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (W) {
            y = W;
          }
          i();
        }
      } catch (W) {
        if (W && y && typeof W.stack == "string") {
          for (var d = W.stack.split(`
`), j = y.stack.split(`
`), U = d.length - 1, D = j.length - 1; U >= 1 && D >= 0 && d[U] !== j[D]; )
            D--;
          for (; U >= 1 && D >= 0; U--, D--)
            if (d[U] !== j[D]) {
              if (U !== 1 || D !== 1)
                do
                  if (U--, D--, D < 0 || d[U] !== j[D]) {
                    var J = `
` + d[U].replace(" at new ", " at ");
                    return i.displayName && J.includes("<anonymous>") && (J = J.replace("<anonymous>", i.displayName)), typeof i == "function" && sr.set(i, J), J;
                  }
                while (U >= 1 && D >= 0);
              break;
            }
        }
      } finally {
        mr = !1, wr.current = C, Dr(), Error.prepareStackTrace = T;
      }
      var hr = i ? i.displayName || i.name : "", ar = hr ? nr(hr) : "";
      return typeof i == "function" && sr.set(i, ar), ar;
    }
    function V(i, f, p) {
      return or(i, !1);
    }
    function Er(i) {
      var f = i.prototype;
      return !!(f && f.isReactComponent);
    }
    function cr(i, f, p) {
      if (i == null)
        return "";
      if (typeof i == "function")
        return or(i, Er(i));
      if (typeof i == "string")
        return nr(i);
      switch (i) {
        case N:
          return nr("Suspense");
        case I:
          return nr("SuspenseList");
      }
      if (typeof i == "object")
        switch (i.$$typeof) {
          case b:
            return V(i.render);
          case B:
            return cr(i.type, f, p);
          case Y: {
            var y = i, T = y._payload, C = y._init;
            try {
              return cr(C(T), f, p);
            } catch {
            }
          }
        }
      return "";
    }
    var t = Object.prototype.hasOwnProperty, r = {}, e = G.ReactDebugCurrentFrame;
    function n(i) {
      if (i) {
        var f = i._owner, p = cr(i.type, i._source, f ? f.type : null);
        e.setExtraStackFrame(p);
      } else
        e.setExtraStackFrame(null);
    }
    function o(i, f, p, y, T) {
      {
        var C = Function.call.bind(t);
        for (var E in i)
          if (C(i, E)) {
            var d = void 0;
            try {
              if (typeof i[E] != "function") {
                var j = Error((y || "React class") + ": " + p + " type `" + E + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[E] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw j.name = "Invariant Violation", j;
              }
              d = i[E](f, E, y, p, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (U) {
              d = U;
            }
            d && !(d instanceof Error) && (n(T), O("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", y || "React class", p, E, typeof d), n(null)), d instanceof Error && !(d.message in r) && (r[d.message] = !0, n(T), O("Failed %s type: %s", p, d.message), n(null));
          }
      }
    }
    var u = Array.isArray;
    function s(i) {
      return u(i);
    }
    function m(i) {
      {
        var f = typeof Symbol == "function" && Symbol.toStringTag, p = f && i[Symbol.toStringTag] || i.constructor.name || "Object";
        return p;
      }
    }
    function A(i) {
      try {
        return _(i), !1;
      } catch {
        return !0;
      }
    }
    function _(i) {
      return "" + i;
    }
    function L(i) {
      if (A(i))
        return O("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", m(i)), _(i);
    }
    var R = G.ReactCurrentOwner, lr = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, gr, Fr, Jr;
    Jr = {};
    function ve(i) {
      if (t.call(i, "ref")) {
        var f = Object.getOwnPropertyDescriptor(i, "ref").get;
        if (f && f.isReactWarning)
          return !1;
      }
      return i.ref !== void 0;
    }
    function ye(i) {
      if (t.call(i, "key")) {
        var f = Object.getOwnPropertyDescriptor(i, "key").get;
        if (f && f.isReactWarning)
          return !1;
      }
      return i.key !== void 0;
    }
    function xe(i, f) {
      if (typeof i.ref == "string" && R.current && f && R.current.stateNode !== f) {
        var p = $(R.current.type);
        Jr[p] || (O('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', $(R.current.type), i.ref), Jr[p] = !0);
      }
    }
    function we(i, f) {
      {
        var p = function() {
          gr || (gr = !0, O("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", f));
        };
        p.isReactWarning = !0, Object.defineProperty(i, "key", {
          get: p,
          configurable: !0
        });
      }
    }
    function de(i, f) {
      {
        var p = function() {
          Fr || (Fr = !0, O("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", f));
        };
        p.isReactWarning = !0, Object.defineProperty(i, "ref", {
          get: p,
          configurable: !0
        });
      }
    }
    var me = function(i, f, p, y, T, C, E) {
      var d = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: l,
        // Built-in properties that belong on the element
        type: i,
        key: f,
        ref: p,
        props: E,
        // Record the component responsible for creating this element.
        _owner: C
      };
      return d._store = {}, Object.defineProperty(d._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(d, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: y
      }), Object.defineProperty(d, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: T
      }), Object.freeze && (Object.freeze(d.props), Object.freeze(d)), d;
    };
    function Ee(i, f, p, y, T) {
      {
        var C, E = {}, d = null, j = null;
        p !== void 0 && (L(p), d = "" + p), ye(f) && (L(f.key), d = "" + f.key), ve(f) && (j = f.ref, xe(f, T));
        for (C in f)
          t.call(f, C) && !lr.hasOwnProperty(C) && (E[C] = f[C]);
        if (i && i.defaultProps) {
          var U = i.defaultProps;
          for (C in U)
            E[C] === void 0 && (E[C] = U[C]);
        }
        if (d || j) {
          var D = typeof i == "function" ? i.displayName || i.name || "Unknown" : i;
          d && we(E, D), j && de(E, D);
        }
        return me(i, d, j, T, y, R.current, E);
      }
    }
    var qr = G.ReactCurrentOwner, ee = G.ReactDebugCurrentFrame;
    function pr(i) {
      if (i) {
        var f = i._owner, p = cr(i.type, i._source, f ? f.type : null);
        ee.setExtraStackFrame(p);
      } else
        ee.setExtraStackFrame(null);
    }
    var Gr;
    Gr = !1;
    function Kr(i) {
      return typeof i == "object" && i !== null && i.$$typeof === l;
    }
    function te() {
      {
        if (qr.current) {
          var i = $(qr.current.type);
          if (i)
            return `

Check the render method of \`` + i + "`.";
        }
        return "";
      }
    }
    function ge(i) {
      {
        if (i !== void 0) {
          var f = i.fileName.replace(/^.*[\\\/]/, ""), p = i.lineNumber;
          return `

Check your code at ` + f + ":" + p + ".";
        }
        return "";
      }
    }
    var ne = {};
    function Fe(i) {
      {
        var f = te();
        if (!f) {
          var p = typeof i == "string" ? i : i.displayName || i.name;
          p && (f = `

Check the top-level render call using <` + p + ">.");
        }
        return f;
      }
    }
    function ie(i, f) {
      {
        if (!i._store || i._store.validated || i.key != null)
          return;
        i._store.validated = !0;
        var p = Fe(f);
        if (ne[p])
          return;
        ne[p] = !0;
        var y = "";
        i && i._owner && i._owner !== qr.current && (y = " It was passed a child from " + $(i._owner.type) + "."), pr(i), O('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', p, y), pr(null);
      }
    }
    function oe(i, f) {
      {
        if (typeof i != "object")
          return;
        if (s(i))
          for (var p = 0; p < i.length; p++) {
            var y = i[p];
            Kr(y) && ie(y, f);
          }
        else if (Kr(i))
          i._store && (i._store.validated = !0);
        else if (i) {
          var T = Nr(i);
          if (typeof T == "function" && T !== i.entries)
            for (var C = T.call(i), E; !(E = C.next()).done; )
              Kr(E.value) && ie(E.value, f);
        }
      }
    }
    function Te(i) {
      {
        var f = i.type;
        if (f == null || typeof f == "string")
          return;
        var p;
        if (typeof f == "function")
          p = f.propTypes;
        else if (typeof f == "object" && (f.$$typeof === b || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        f.$$typeof === B))
          p = f.propTypes;
        else
          return;
        if (p) {
          var y = $(f);
          o(p, i.props, "prop", y, i);
        } else if (f.PropTypes !== void 0 && !Gr) {
          Gr = !0;
          var T = $(f);
          O("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", T || "Unknown");
        }
        typeof f.getDefaultProps == "function" && !f.getDefaultProps.isReactClassApproved && O("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function be(i) {
      {
        for (var f = Object.keys(i.props), p = 0; p < f.length; p++) {
          var y = f[p];
          if (y !== "children" && y !== "key") {
            pr(i), O("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", y), pr(null);
            break;
          }
        }
        i.ref !== null && (pr(i), O("Invalid attribute `ref` supplied to `React.Fragment`."), pr(null));
      }
    }
    var ae = {};
    function Ae(i, f, p, y, T, C) {
      {
        var E = $r(i);
        if (!E) {
          var d = "";
          (i === void 0 || typeof i == "object" && i !== null && Object.keys(i).length === 0) && (d += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var j = ge(T);
          j ? d += j : d += te();
          var U;
          i === null ? U = "null" : s(i) ? U = "array" : i !== void 0 && i.$$typeof === l ? (U = "<" + ($(i.type) || "Unknown") + " />", d = " Did you accidentally export a JSX literal instead of a component?") : U = typeof i, O("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", U, d);
        }
        var D = Ee(i, f, p, T, C);
        if (D == null)
          return D;
        if (E) {
          var J = f.children;
          if (J !== void 0)
            if (y)
              if (s(J)) {
                for (var hr = 0; hr < J.length; hr++)
                  oe(J[hr], i);
                Object.freeze && Object.freeze(J);
              } else
                O("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              oe(J, i);
        }
        if (t.call(f, "key")) {
          var ar = $(i), W = Object.keys(f).filter(function(Ce) {
            return Ce !== "key";
          }), Xr = W.length > 0 ? "{key: someKey, " + W.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!ae[ar + Xr]) {
            var _e = W.length > 0 ? "{" + W.join(": ..., ") + ": ...}" : "{}";
            O(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, Xr, ar, _e, ar), ae[ar + Xr] = !0;
          }
        }
        return i === g ? be(D) : Te(D), D;
      }
    }
    var Re = Ae;
    Pr.Fragment = g, Pr.jsxDEV = Re;
  }()), Pr;
}
he.env.NODE_ENV === "production" ? Zr.exports = tt() : Zr.exports = nt();
var ot = Zr.exports;
export {
  he as a,
  Ie as b,
  ot as j
};
