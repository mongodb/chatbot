import { a as Wn, j as tt } from "./jsx-dev-runtime.js";
import { P as ce, c as Qd } from "./Transition.js";
import { J as xi, $ as Jd, H as ep, m as np, a as vi, g as tp, B as rp, I as ip, X as ap, t as ht, i as op } from "./index4.js";
import { g as dn, a as At, r as ur, m as A, N as se, F as U, b as ve, d as Qe, j as Xn, n as he, ar as lp, z as _i, B as Mt, k as Vn, X as Fn, L as Jt, as as Gr, l as sp, S as Nc, at as cp, au as Oc, av as up, aw as Cc, ax as Tc, ay as dp, az as Ac, aA as Mc, aB as pp, aC as Ic, aD as Rc, aE as fp, aF as gp, y as Qn, A as hp, D as mp, q as ut, C as Ft, Y as Ge, E as sa, T as ca, G as bp, U as xn, Z as yp, aG as Ep, aH as xp, aI as ua, aJ as Dc, R as ot, e as vp, V as er, i as _t, aj as da, aK as _p, ao as Lc, aL as wp, aM as _r, aN as Sp, aO as kp } from "./index2.js";
import * as pa from "react";
import R, { useState as an, useRef as Tn, useEffect as wn, isValidElement as Np, useCallback as Ye, createContext as wi, useContext as dr, forwardRef as Pc, useMemo as tn } from "react";
import { u as Op } from "./index5.js";
import { R as Cp } from "./index18.js";
import { t as Tp } from "./ChevronDown.js";
import { i as Ap } from "./index16.js";
import { z as Wr } from "./index10.js";
import { K as Mp, w as fa } from "./index9.js";
import { w as Ip, X as Bc, v as ga } from "./index7.js";
import { flushSync as Rp } from "react-dom";
import { Z as mt, b as Fc, a as $c, H as zc, k as Si, D as Dn } from "./index11.js";
import { s as Dp, K as Lp, P as ha } from "./index19.js";
import { e as Pp, K as Bp } from "./index12.js";
import { R as Fp, r as Uc } from "./index15.js";
import "./index8.js";
const ma = ["http", "https", "mailto", "tel"];
function $p(e) {
  const n = (e || "").trim(), t = n.charAt(0);
  if (t === "#" || t === "/")
    return n;
  const r = n.indexOf(":");
  if (r === -1)
    return n;
  let i = -1;
  for (; ++i < ma.length; ) {
    const a = ma[i];
    if (r === a.length && n.slice(0, a.length).toLowerCase() === a)
      return n;
  }
  return i = n.indexOf("?"), i !== -1 && r > i || (i = n.indexOf("#"), i !== -1 && r > i) ? n : "javascript:void(0)";
}
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var zp = function(n) {
  return n != null && n.constructor != null && typeof n.constructor.isBuffer == "function" && n.constructor.isBuffer(n);
};
const Hc = /* @__PURE__ */ dn(zp);
function Et(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? ba(e.position) : "start" in e || "end" in e ? ba(e) : "line" in e || "column" in e ? Vr(e) : "";
}
function Vr(e) {
  return ya(e && e.line) + ":" + ya(e && e.column);
}
function ba(e) {
  return Vr(e && e.start) + "-" + Vr(e && e.end);
}
function ya(e) {
  return e && typeof e == "number" ? e : 1;
}
class hn extends Error {
  /**
   * Create a message for `reason` at `place` from `origin`.
   *
   * When an error is passed in as `reason`, the `stack` is copied.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   *
   *   > 👉 **Note**: you should use markdown.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // To do: next major: expose `undefined` everywhere instead of `null`.
  constructor(n, t, r) {
    const i = [null, null];
    let a = {
      // @ts-expect-error: we always follows the structure of `position`.
      start: { line: null, column: null },
      // @ts-expect-error: "
      end: { line: null, column: null }
    };
    if (super(), typeof t == "string" && (r = t, t = void 0), typeof r == "string") {
      const o = r.indexOf(":");
      o === -1 ? i[1] = r : (i[0] = r.slice(0, o), i[1] = r.slice(o + 1));
    }
    t && ("type" in t || "position" in t ? t.position && (a = t.position) : "start" in t || "end" in t ? a = t : ("line" in t || "column" in t) && (a.start = t)), this.name = Et(t) || "1:1", this.message = typeof n == "object" ? n.message : n, this.stack = "", typeof n == "object" && n.stack && (this.stack = n.stack), this.reason = this.message, this.fatal, this.line = a.start.line, this.column = a.start.column, this.position = a, this.source = i[0], this.ruleId = i[1], this.file, this.actual, this.expected, this.url, this.note;
  }
}
hn.prototype.file = "";
hn.prototype.name = "";
hn.prototype.reason = "";
hn.prototype.message = "";
hn.prototype.stack = "";
hn.prototype.fatal = null;
hn.prototype.column = null;
hn.prototype.line = null;
hn.prototype.source = null;
hn.prototype.ruleId = null;
hn.prototype.position = null;
const yn = { basename: Up, dirname: Hp, extname: jp, join: qp, sep: "/" };
function Up(e, n) {
  if (n !== void 0 && typeof n != "string")
    throw new TypeError('"ext" argument must be a string');
  It(e);
  let t = 0, r = -1, i = e.length, a;
  if (n === void 0 || n.length === 0 || n.length > e.length) {
    for (; i--; )
      if (e.charCodeAt(i) === 47) {
        if (a) {
          t = i + 1;
          break;
        }
      } else
        r < 0 && (a = !0, r = i + 1);
    return r < 0 ? "" : e.slice(t, r);
  }
  if (n === e)
    return "";
  let o = -1, l = n.length - 1;
  for (; i--; )
    if (e.charCodeAt(i) === 47) {
      if (a) {
        t = i + 1;
        break;
      }
    } else
      o < 0 && (a = !0, o = i + 1), l > -1 && (e.charCodeAt(i) === n.charCodeAt(l--) ? l < 0 && (r = i) : (l = -1, r = o));
  return t === r ? r = o : r < 0 && (r = e.length), e.slice(t, r);
}
function Hp(e) {
  if (It(e), e.length === 0)
    return ".";
  let n = -1, t = e.length, r;
  for (; --t; )
    if (e.charCodeAt(t) === 47) {
      if (r) {
        n = t;
        break;
      }
    } else
      r || (r = !0);
  return n < 0 ? e.charCodeAt(0) === 47 ? "/" : "." : n === 1 && e.charCodeAt(0) === 47 ? "//" : e.slice(0, n);
}
function jp(e) {
  It(e);
  let n = e.length, t = -1, r = 0, i = -1, a = 0, o;
  for (; n--; ) {
    const l = e.charCodeAt(n);
    if (l === 47) {
      if (o) {
        r = n + 1;
        break;
      }
      continue;
    }
    t < 0 && (o = !0, t = n + 1), l === 46 ? i < 0 ? i = n : a !== 1 && (a = 1) : i > -1 && (a = -1);
  }
  return i < 0 || t < 0 || // We saw a non-dot character immediately before the dot.
  a === 0 || // The (right-most) trimmed path component is exactly `..`.
  a === 1 && i === t - 1 && i === r + 1 ? "" : e.slice(i, t);
}
function qp(...e) {
  let n = -1, t;
  for (; ++n < e.length; )
    It(e[n]), e[n] && (t = t === void 0 ? e[n] : t + "/" + e[n]);
  return t === void 0 ? "." : Kp(t);
}
function Kp(e) {
  It(e);
  const n = e.charCodeAt(0) === 47;
  let t = Gp(e, !n);
  return t.length === 0 && !n && (t = "."), t.length > 0 && e.charCodeAt(e.length - 1) === 47 && (t += "/"), n ? "/" + t : t;
}
function Gp(e, n) {
  let t = "", r = 0, i = -1, a = 0, o = -1, l, s;
  for (; ++o <= e.length; ) {
    if (o < e.length)
      l = e.charCodeAt(o);
    else {
      if (l === 47)
        break;
      l = 47;
    }
    if (l === 47) {
      if (!(i === o - 1 || a === 1))
        if (i !== o - 1 && a === 2) {
          if (t.length < 2 || r !== 2 || t.charCodeAt(t.length - 1) !== 46 || t.charCodeAt(t.length - 2) !== 46) {
            if (t.length > 2) {
              if (s = t.lastIndexOf("/"), s !== t.length - 1) {
                s < 0 ? (t = "", r = 0) : (t = t.slice(0, s), r = t.length - 1 - t.lastIndexOf("/")), i = o, a = 0;
                continue;
              }
            } else if (t.length > 0) {
              t = "", r = 0, i = o, a = 0;
              continue;
            }
          }
          n && (t = t.length > 0 ? t + "/.." : "..", r = 2);
        } else
          t.length > 0 ? t += "/" + e.slice(i + 1, o) : t = e.slice(i + 1, o), r = o - i - 1;
      i = o, a = 0;
    } else
      l === 46 && a > -1 ? a++ : a = -1;
  }
  return t;
}
function It(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const Wp = { cwd: Vp };
function Vp() {
  return "/";
}
function Yr(e) {
  return e !== null && typeof e == "object" && // @ts-expect-error: indexable.
  e.href && // @ts-expect-error: indexable.
  e.origin;
}
function Yp(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!Yr(e)) {
    const n = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw n.code = "ERR_INVALID_ARG_TYPE", n;
  }
  if (e.protocol !== "file:") {
    const n = new TypeError("The URL must be of scheme file");
    throw n.code = "ERR_INVALID_URL_SCHEME", n;
  }
  return Zp(e);
}
function Zp(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const n = e.pathname;
  let t = -1;
  for (; ++t < n.length; )
    if (n.charCodeAt(t) === 37 && n.charCodeAt(t + 1) === 50) {
      const r = n.charCodeAt(t + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(n);
}
const wr = ["history", "path", "basename", "stem", "extname", "dirname"];
class jc {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Buffer` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(n) {
    let t;
    n ? typeof n == "string" || Xp(n) ? t = { value: n } : Yr(n) ? t = { path: n } : t = n : t = {}, this.data = {}, this.messages = [], this.history = [], this.cwd = Wp.cwd(), this.value, this.stored, this.result, this.map;
    let r = -1;
    for (; ++r < wr.length; ) {
      const a = wr[r];
      a in t && t[a] !== void 0 && t[a] !== null && (this[a] = a === "history" ? [...t[a]] : t[a]);
    }
    let i;
    for (i in t)
      wr.includes(i) || (this[i] = t[i]);
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {string | URL} path
   */
  set path(n) {
    Yr(n) && (n = Yp(n)), kr(n, "path"), this.path !== n && this.history.push(n);
  }
  /**
   * Get the parent path (example: `'~'`).
   */
  get dirname() {
    return typeof this.path == "string" ? yn.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   */
  set dirname(n) {
    Ea(this.basename, "dirname"), this.path = yn.join(n || "", this.basename);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   */
  get basename() {
    return typeof this.path == "string" ? yn.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set basename(n) {
    kr(n, "basename"), Sr(n, "basename"), this.path = yn.join(this.dirname || "", n);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   */
  get extname() {
    return typeof this.path == "string" ? yn.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   */
  set extname(n) {
    if (Sr(n, "extname"), Ea(this.dirname, "extname"), n) {
      if (n.charCodeAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (n.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = yn.join(this.dirname, this.stem + (n || ""));
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   */
  get stem() {
    return typeof this.path == "string" ? yn.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   */
  set stem(n) {
    kr(n, "stem"), Sr(n, "stem"), this.path = yn.join(this.dirname || "", n + (this.extname || ""));
  }
  /**
   * Serialize the file.
   *
   * @param {BufferEncoding | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Buffer`
   *   (default: `'utf8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(n) {
    return (this.value || "").toString(n || void 0);
  }
  /**
   * Create a warning message associated with the file.
   *
   * Its `fatal` is set to `false` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(n, t, r) {
    const i = new hn(n, t, r);
    return this.path && (i.name = this.path + ":" + i.name, i.file = this.path), i.fatal = !1, this.messages.push(i), i;
  }
  /**
   * Create an info message associated with the file.
   *
   * Its `fatal` is set to `null` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(n, t, r) {
    const i = this.message(n, t, r);
    return i.fatal = null, i;
  }
  /**
   * Create a fatal error associated with the file.
   *
   * Its `fatal` is set to `true` and `file` is set to the current file path.
   * Its added to `file.messages`.
   *
   * > 👉 **Note**: a fatal error means that a file is no longer processable.
   *
   * @param {string | Error | VFileMessage} reason
   *   Reason for message, uses the stack and message of the error if given.
   * @param {Node | NodeLike | Position | Point | null | undefined} [place]
   *   Place in file where the message occurred.
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Message.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(n, t, r) {
    const i = this.message(n, t, r);
    throw i.fatal = !0, i;
  }
}
function Sr(e, n) {
  if (e && e.includes(yn.sep))
    throw new Error(
      "`" + n + "` cannot be a path: did not expect `" + yn.sep + "`"
    );
}
function kr(e, n) {
  if (!e)
    throw new Error("`" + n + "` cannot be empty");
}
function Ea(e, n) {
  if (!e)
    throw new Error("Setting `" + n + "` requires `path` to be set too");
}
function Xp(e) {
  return Hc(e);
}
function xa(e) {
  if (e)
    throw e;
}
var Vt = Object.prototype.hasOwnProperty, qc = Object.prototype.toString, va = Object.defineProperty, _a = Object.getOwnPropertyDescriptor, wa = function(n) {
  return typeof Array.isArray == "function" ? Array.isArray(n) : qc.call(n) === "[object Array]";
}, Sa = function(n) {
  if (!n || qc.call(n) !== "[object Object]")
    return !1;
  var t = Vt.call(n, "constructor"), r = n.constructor && n.constructor.prototype && Vt.call(n.constructor.prototype, "isPrototypeOf");
  if (n.constructor && !t && !r)
    return !1;
  var i;
  for (i in n)
    ;
  return typeof i > "u" || Vt.call(n, i);
}, ka = function(n, t) {
  va && t.name === "__proto__" ? va(n, t.name, {
    enumerable: !0,
    configurable: !0,
    value: t.newValue,
    writable: !0
  }) : n[t.name] = t.newValue;
}, Na = function(n, t) {
  if (t === "__proto__")
    if (Vt.call(n, t)) {
      if (_a)
        return _a(n, t).value;
    } else
      return;
  return n[t];
}, Qp = function e() {
  var n, t, r, i, a, o, l = arguments[0], s = 1, u = arguments.length, c = !1;
  for (typeof l == "boolean" && (c = l, l = arguments[1] || {}, s = 2), (l == null || typeof l != "object" && typeof l != "function") && (l = {}); s < u; ++s)
    if (n = arguments[s], n != null)
      for (t in n)
        r = Na(l, t), i = Na(n, t), l !== i && (c && i && (Sa(i) || (a = wa(i))) ? (a ? (a = !1, o = r && wa(r) ? r : []) : o = r && Sa(r) ? r : {}, ka(l, { name: t, newValue: e(c, o, i) })) : typeof i < "u" && ka(l, { name: t, newValue: i }));
  return l;
};
const Oa = /* @__PURE__ */ dn(Qp);
function Zr(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const n = Object.getPrototypeOf(e);
  return (n === null || n === Object.prototype || Object.getPrototypeOf(n) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Jp() {
  const e = [], n = { run: t, use: r };
  return n;
  function t(...i) {
    let a = -1;
    const o = i.pop();
    if (typeof o != "function")
      throw new TypeError("Expected function as last argument, not " + o);
    l(null, ...i);
    function l(s, ...u) {
      const c = e[++a];
      let d = -1;
      if (s) {
        o(s);
        return;
      }
      for (; ++d < i.length; )
        (u[d] === null || u[d] === void 0) && (u[d] = i[d]);
      i = u, c ? ef(c, l)(...u) : o(null, ...u);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), n;
  }
}
function ef(e, n) {
  let t;
  return r;
  function r(...o) {
    const l = e.length > o.length;
    let s;
    l && o.push(i);
    try {
      s = e.apply(this, o);
    } catch (u) {
      const c = (
        /** @type {Error} */
        u
      );
      if (l && t)
        throw c;
      return i(c);
    }
    l || (s && s.then && typeof s.then == "function" ? s.then(a, i) : s instanceof Error ? i(s) : a(s));
  }
  function i(o, ...l) {
    t || (t = !0, n(o, ...l));
  }
  function a(o) {
    i(null, o);
  }
}
const nf = Gc().freeze(), Kc = {}.hasOwnProperty;
function Gc() {
  const e = Jp(), n = [];
  let t = {}, r, i = -1;
  return a.data = o, a.Parser = void 0, a.Compiler = void 0, a.freeze = l, a.attachers = n, a.use = s, a.parse = u, a.stringify = c, a.run = d, a.runSync = f, a.process = h, a.processSync = v, a;
  function a() {
    const x = Gc();
    let m = -1;
    for (; ++m < n.length; )
      x.use(...n[m]);
    return x.data(Oa(!0, {}, t)), x;
  }
  function o(x, m) {
    return typeof x == "string" ? arguments.length === 2 ? (Cr("data", r), t[x] = m, a) : Kc.call(t, x) && t[x] || null : x ? (Cr("data", r), t = x, a) : t;
  }
  function l() {
    if (r)
      return a;
    for (; ++i < n.length; ) {
      const [x, ...m] = n[i];
      if (m[0] === !1)
        continue;
      m[0] === !0 && (m[0] = void 0);
      const b = x.call(a, ...m);
      typeof b == "function" && e.use(b);
    }
    return r = !0, i = Number.POSITIVE_INFINITY, a;
  }
  function s(x, ...m) {
    let b;
    if (Cr("use", r), x != null)
      if (typeof x == "function")
        M(x, ...m);
      else if (typeof x == "object")
        Array.isArray(x) ? C(x) : _(x);
      else
        throw new TypeError("Expected usable value, not `" + x + "`");
    return b && (t.settings = Object.assign(t.settings || {}, b)), a;
    function w(S) {
      if (typeof S == "function")
        M(S);
      else if (typeof S == "object")
        if (Array.isArray(S)) {
          const [I, ...L] = S;
          M(I, ...L);
        } else
          _(S);
      else
        throw new TypeError("Expected usable value, not `" + S + "`");
    }
    function _(S) {
      C(S.plugins), S.settings && (b = Object.assign(b || {}, S.settings));
    }
    function C(S) {
      let I = -1;
      if (S != null)
        if (Array.isArray(S))
          for (; ++I < S.length; ) {
            const L = S[I];
            w(L);
          }
        else
          throw new TypeError("Expected a list of plugins, not `" + S + "`");
    }
    function M(S, I) {
      let L = -1, D;
      for (; ++L < n.length; )
        if (n[L][0] === S) {
          D = n[L];
          break;
        }
      D ? (Zr(D[1]) && Zr(I) && (I = Oa(!0, D[1], I)), D[1] = I) : n.push([...arguments]);
    }
  }
  function u(x) {
    a.freeze();
    const m = ft(x), b = a.Parser;
    return Nr("parse", b), Ca(b, "parse") ? new b(String(m), m).parse() : b(String(m), m);
  }
  function c(x, m) {
    a.freeze();
    const b = ft(m), w = a.Compiler;
    return Or("stringify", w), Ta(x), Ca(w, "compile") ? new w(x, b).compile() : w(x, b);
  }
  function d(x, m, b) {
    if (Ta(x), a.freeze(), !b && typeof m == "function" && (b = m, m = void 0), !b)
      return new Promise(w);
    w(null, b);
    function w(_, C) {
      e.run(x, ft(m), M);
      function M(S, I, L) {
        I = I || x, S ? C(S) : _ ? _(I) : b(null, I, L);
      }
    }
  }
  function f(x, m) {
    let b, w;
    return a.run(x, m, _), Aa("runSync", "run", w), b;
    function _(C, M) {
      xa(C), b = M, w = !0;
    }
  }
  function h(x, m) {
    if (a.freeze(), Nr("process", a.Parser), Or("process", a.Compiler), !m)
      return new Promise(b);
    b(null, m);
    function b(w, _) {
      const C = ft(x);
      a.run(a.parse(C), C, (S, I, L) => {
        if (S || !I || !L)
          M(S);
        else {
          const D = a.stringify(I, L);
          D == null || (af(D) ? L.value = D : L.result = D), M(S, L);
        }
      });
      function M(S, I) {
        S || !I ? _(S) : w ? w(I) : m(null, I);
      }
    }
  }
  function v(x) {
    let m;
    a.freeze(), Nr("processSync", a.Parser), Or("processSync", a.Compiler);
    const b = ft(x);
    return a.process(b, w), Aa("processSync", "process", m), b;
    function w(_) {
      m = !0, xa(_);
    }
  }
}
function Ca(e, n) {
  return typeof e == "function" && // Prototypes do exist.
  // type-coverage:ignore-next-line
  e.prototype && // A function with keys in its prototype is probably a constructor.
  // Classes’ prototype methods are not enumerable, so we check if some value
  // exists in the prototype.
  // type-coverage:ignore-next-line
  (tf(e.prototype) || n in e.prototype);
}
function tf(e) {
  let n;
  for (n in e)
    if (Kc.call(e, n))
      return !0;
  return !1;
}
function Nr(e, n) {
  if (typeof n != "function")
    throw new TypeError("Cannot `" + e + "` without `Parser`");
}
function Or(e, n) {
  if (typeof n != "function")
    throw new TypeError("Cannot `" + e + "` without `Compiler`");
}
function Cr(e, n) {
  if (n)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function Ta(e) {
  if (!Zr(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function Aa(e, n, t) {
  if (!t)
    throw new Error(
      "`" + e + "` finished async. Use `" + n + "` instead"
    );
}
function ft(e) {
  return rf(e) ? e : new jc(e);
}
function rf(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function af(e) {
  return typeof e == "string" || Hc(e);
}
var Ma = Object.prototype.hasOwnProperty;
function Ia(e, n, t) {
  for (t of e.keys())
    if (xt(t, n))
      return t;
}
function xt(e, n) {
  var t, r, i;
  if (e === n)
    return !0;
  if (e && n && (t = e.constructor) === n.constructor) {
    if (t === Date)
      return e.getTime() === n.getTime();
    if (t === RegExp)
      return e.toString() === n.toString();
    if (t === Array) {
      if ((r = e.length) === n.length)
        for (; r-- && xt(e[r], n[r]); )
          ;
      return r === -1;
    }
    if (t === Set) {
      if (e.size !== n.size)
        return !1;
      for (r of e)
        if (i = r, i && typeof i == "object" && (i = Ia(n, i), !i) || !n.has(i))
          return !1;
      return !0;
    }
    if (t === Map) {
      if (e.size !== n.size)
        return !1;
      for (r of e)
        if (i = r[0], i && typeof i == "object" && (i = Ia(n, i), !i) || !xt(r[1], n.get(i)))
          return !1;
      return !0;
    }
    if (t === ArrayBuffer)
      e = new Uint8Array(e), n = new Uint8Array(n);
    else if (t === DataView) {
      if ((r = e.byteLength) === n.byteLength)
        for (; r-- && e.getInt8(r) === n.getInt8(r); )
          ;
      return r === -1;
    }
    if (ArrayBuffer.isView(e)) {
      if ((r = e.byteLength) === n.byteLength)
        for (; r-- && e[r] === n[r]; )
          ;
      return r === -1;
    }
    if (!t || typeof e == "object") {
      r = 0;
      for (t in e)
        if (Ma.call(e, t) && ++r && !Ma.call(n, t) || !(t in n) || !xt(e[t], n[t]))
          return !1;
      return Object.keys(n).length === r;
    }
  }
  return e !== e && n !== n;
}
let Xr, Wc, Vc, Yc, Zc = !0;
typeof Wn < "u" && ({ FORCE_COLOR: Xr, NODE_DISABLE_COLORS: Wc, NO_COLOR: Vc, TERM: Yc } = Wn.env || {}, Zc = Wn.stdout && Wn.stdout.isTTY);
const xe = {
  enabled: !Wc && Vc == null && Yc !== "dumb" && (Xr != null && Xr !== "0" || Zc),
  // modifiers
  reset: Ce(0, 0),
  bold: Ce(1, 22),
  dim: Ce(2, 22),
  italic: Ce(3, 23),
  underline: Ce(4, 24),
  inverse: Ce(7, 27),
  hidden: Ce(8, 28),
  strikethrough: Ce(9, 29),
  // colors
  black: Ce(30, 39),
  red: Ce(31, 39),
  green: Ce(32, 39),
  yellow: Ce(33, 39),
  blue: Ce(34, 39),
  magenta: Ce(35, 39),
  cyan: Ce(36, 39),
  white: Ce(37, 39),
  gray: Ce(90, 39),
  grey: Ce(90, 39),
  // background colors
  bgBlack: Ce(40, 49),
  bgRed: Ce(41, 49),
  bgGreen: Ce(42, 49),
  bgYellow: Ce(43, 49),
  bgBlue: Ce(44, 49),
  bgMagenta: Ce(45, 49),
  bgCyan: Ce(46, 49),
  bgWhite: Ce(47, 49)
};
function Ra(e, n) {
  let t = 0, r, i = "", a = "";
  for (; t < e.length; t++)
    r = e[t], i += r.open, a += r.close, ~n.indexOf(r.close) && (n = n.replace(r.rgx, r.close + r.open));
  return i + n + a;
}
function of(e, n) {
  let t = { has: e, keys: n };
  return t.reset = xe.reset.bind(t), t.bold = xe.bold.bind(t), t.dim = xe.dim.bind(t), t.italic = xe.italic.bind(t), t.underline = xe.underline.bind(t), t.inverse = xe.inverse.bind(t), t.hidden = xe.hidden.bind(t), t.strikethrough = xe.strikethrough.bind(t), t.black = xe.black.bind(t), t.red = xe.red.bind(t), t.green = xe.green.bind(t), t.yellow = xe.yellow.bind(t), t.blue = xe.blue.bind(t), t.magenta = xe.magenta.bind(t), t.cyan = xe.cyan.bind(t), t.white = xe.white.bind(t), t.gray = xe.gray.bind(t), t.grey = xe.grey.bind(t), t.bgBlack = xe.bgBlack.bind(t), t.bgRed = xe.bgRed.bind(t), t.bgGreen = xe.bgGreen.bind(t), t.bgYellow = xe.bgYellow.bind(t), t.bgBlue = xe.bgBlue.bind(t), t.bgMagenta = xe.bgMagenta.bind(t), t.bgCyan = xe.bgCyan.bind(t), t.bgWhite = xe.bgWhite.bind(t), t;
}
function Ce(e, n) {
  let t = {
    open: `\x1B[${e}m`,
    close: `\x1B[${n}m`,
    rgx: new RegExp(`\\x1b\\[${n}m`, "g")
  };
  return function(r) {
    return this !== void 0 && this.has !== void 0 ? (~this.has.indexOf(e) || (this.has.push(e), this.keys.push(t)), r === void 0 ? this : xe.enabled ? Ra(this.keys, r + "") : r + "") : r === void 0 ? of([e], [t]) : xe.enabled ? Ra([t], r + "") : r + "";
  };
}
function Un() {
}
Un.prototype = {
  diff: function(n, t) {
    var r, i = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, a = i.callback;
    typeof i == "function" && (a = i, i = {}), this.options = i;
    var o = this;
    function l(C) {
      return a ? (setTimeout(function() {
        a(void 0, C);
      }, 0), !0) : C;
    }
    n = this.castInput(n), t = this.castInput(t), n = this.removeEmpty(this.tokenize(n)), t = this.removeEmpty(this.tokenize(t));
    var s = t.length, u = n.length, c = 1, d = s + u;
    i.maxEditLength && (d = Math.min(d, i.maxEditLength));
    var f = (r = i.timeout) !== null && r !== void 0 ? r : 1 / 0, h = Date.now() + f, v = [{
      oldPos: -1,
      lastComponent: void 0
    }], x = this.extractCommon(v[0], t, n, 0);
    if (v[0].oldPos + 1 >= u && x + 1 >= s)
      return l([{
        value: this.join(t),
        count: t.length
      }]);
    var m = -1 / 0, b = 1 / 0;
    function w() {
      for (var C = Math.max(m, -c); C <= Math.min(b, c); C += 2) {
        var M = void 0, S = v[C - 1], I = v[C + 1];
        S && (v[C - 1] = void 0);
        var L = !1;
        if (I) {
          var D = I.oldPos - C;
          L = I && 0 <= D && D < s;
        }
        var Y = S && S.oldPos + 1 < u;
        if (!L && !Y) {
          v[C] = void 0;
          continue;
        }
        if (!Y || L && S.oldPos + 1 < I.oldPos ? M = o.addToPath(I, !0, void 0, 0) : M = o.addToPath(S, void 0, !0, 1), x = o.extractCommon(M, t, n, C), M.oldPos + 1 >= u && x + 1 >= s)
          return l(lf(o, M.lastComponent, t, n, o.useLongestToken));
        v[C] = M, M.oldPos + 1 >= u && (b = Math.min(b, C - 1)), x + 1 >= s && (m = Math.max(m, C + 1));
      }
      c++;
    }
    if (a)
      (function C() {
        setTimeout(function() {
          if (c > d || Date.now() > h)
            return a();
          w() || C();
        }, 0);
      })();
    else
      for (; c <= d && Date.now() <= h; ) {
        var _ = w();
        if (_)
          return _;
      }
  },
  addToPath: function(n, t, r, i) {
    var a = n.lastComponent;
    return a && a.added === t && a.removed === r ? {
      oldPos: n.oldPos + i,
      lastComponent: {
        count: a.count + 1,
        added: t,
        removed: r,
        previousComponent: a.previousComponent
      }
    } : {
      oldPos: n.oldPos + i,
      lastComponent: {
        count: 1,
        added: t,
        removed: r,
        previousComponent: a
      }
    };
  },
  extractCommon: function(n, t, r, i) {
    for (var a = t.length, o = r.length, l = n.oldPos, s = l - i, u = 0; s + 1 < a && l + 1 < o && this.equals(t[s + 1], r[l + 1]); )
      s++, l++, u++;
    return u && (n.lastComponent = {
      count: u,
      previousComponent: n.lastComponent
    }), n.oldPos = l, s;
  },
  equals: function(n, t) {
    return this.options.comparator ? this.options.comparator(n, t) : n === t || this.options.ignoreCase && n.toLowerCase() === t.toLowerCase();
  },
  removeEmpty: function(n) {
    for (var t = [], r = 0; r < n.length; r++)
      n[r] && t.push(n[r]);
    return t;
  },
  castInput: function(n) {
    return n;
  },
  tokenize: function(n) {
    return n.split("");
  },
  join: function(n) {
    return n.join("");
  }
};
function lf(e, n, t, r, i) {
  for (var a = [], o; n; )
    a.push(n), o = n.previousComponent, delete n.previousComponent, n = o;
  a.reverse();
  for (var l = 0, s = a.length, u = 0, c = 0; l < s; l++) {
    var d = a[l];
    if (d.removed) {
      if (d.value = e.join(r.slice(c, c + d.count)), c += d.count, l && a[l - 1].added) {
        var h = a[l - 1];
        a[l - 1] = a[l], a[l] = h;
      }
    } else {
      if (!d.added && i) {
        var f = t.slice(u, u + d.count);
        f = f.map(function(x, m) {
          var b = r[c + m];
          return b.length > x.length ? b : x;
        }), d.value = e.join(f);
      } else
        d.value = e.join(t.slice(u, u + d.count));
      u += d.count, d.added || (c += d.count);
    }
  }
  var v = a[s - 1];
  return s > 1 && typeof v.value == "string" && (v.added || v.removed) && e.equals("", v.value) && (a[s - 2].value += v.value, a.pop()), a;
}
var Da = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/, La = /\S/, Xc = new Un();
Xc.equals = function(e, n) {
  return this.options.ignoreCase && (e = e.toLowerCase(), n = n.toLowerCase()), e === n || this.options.ignoreWhitespace && !La.test(e) && !La.test(n);
};
Xc.tokenize = function(e) {
  for (var n = e.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/), t = 0; t < n.length - 1; t++)
    !n[t + 1] && n[t + 2] && Da.test(n[t]) && Da.test(n[t + 2]) && (n[t] += n[t + 2], n.splice(t + 1, 2), t--);
  return n;
};
var Qc = new Un();
Qc.tokenize = function(e) {
  this.options.stripTrailingCr && (e = e.replace(/\r\n/g, `
`));
  var n = [], t = e.split(/(\n|\r\n)/);
  t[t.length - 1] || t.pop();
  for (var r = 0; r < t.length; r++) {
    var i = t[r];
    r % 2 && !this.options.newlineIsToken ? n[n.length - 1] += i : (this.options.ignoreWhitespace && (i = i.trim()), n.push(i));
  }
  return n;
};
var sf = new Un();
sf.tokenize = function(e) {
  return e.split(/(\S.+?[.!?])(?=\s+|$)/);
};
var cf = new Un();
cf.tokenize = function(e) {
  return e.split(/([{}:;,]|\s+)/);
};
function Yt(e) {
  "@babel/helpers - typeof";
  return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? Yt = function(n) {
    return typeof n;
  } : Yt = function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, Yt(e);
}
var uf = Object.prototype.toString, wt = new Un();
wt.useLongestToken = !0;
wt.tokenize = Qc.tokenize;
wt.castInput = function(e) {
  var n = this.options, t = n.undefinedReplacement, r = n.stringifyReplacer, i = r === void 0 ? function(a, o) {
    return typeof o > "u" ? t : o;
  } : r;
  return typeof e == "string" ? e : JSON.stringify(Qr(e, null, null, i), i, "  ");
};
wt.equals = function(e, n) {
  return Un.prototype.equals.call(wt, e.replace(/,([\r\n])/g, "$1"), n.replace(/,([\r\n])/g, "$1"));
};
function Qr(e, n, t, r, i) {
  n = n || [], t = t || [], r && (e = r(i, e));
  var a;
  for (a = 0; a < n.length; a += 1)
    if (n[a] === e)
      return t[a];
  var o;
  if (uf.call(e) === "[object Array]") {
    for (n.push(e), o = new Array(e.length), t.push(o), a = 0; a < e.length; a += 1)
      o[a] = Qr(e[a], n, t, r, i);
    return n.pop(), t.pop(), o;
  }
  if (e && e.toJSON && (e = e.toJSON()), Yt(e) === "object" && e !== null) {
    n.push(e), o = {}, t.push(o);
    var l = [], s;
    for (s in e)
      e.hasOwnProperty(s) && l.push(s);
    for (l.sort(), a = 0; a < l.length; a += 1)
      s = l[a], o[s] = Qr(e[s], n, t, r, s);
    n.pop(), t.pop();
  } else
    o = e;
  return o;
}
var Jr = new Un();
Jr.tokenize = function(e) {
  return e.slice();
};
Jr.join = Jr.removeEmpty = function(e) {
  return e;
};
xe.red, xe.grey, xe.green;
xe.dim().italic;
xe.dim("→");
xe.dim("·");
xe.dim("↵");
function nr(e) {
  e = e.replace(/\r?\n/g, `
`);
  let n = e.match(/^[ \t]*(?=\S)/gm), t = 0, r = 1 / 0, i = (n || []).length;
  for (; t < i; t++)
    r = Math.min(r, n[t].length);
  return i && r ? e.replace(new RegExp(`^[ \\t]{${r}}`, "gm"), "") : e;
}
class df extends Error {
  constructor(n = {}) {
    super(n.message), this.name = "Assertion", this.code = "ERR_ASSERTION", Error.captureStackTrace && Error.captureStackTrace(this, this.constructor), this.details = n.details || !1, this.generated = !!n.generated, this.operator = n.operator, this.expects = n.expects, this.actual = n.actual;
  }
}
function gn(e, n, t, r, i, a, o) {
  if (e)
    return;
  let l = o || a;
  if (o instanceof Error)
    throw o;
  let s = i && i(n, t);
  throw new df({ actual: n, expects: t, operator: r, message: l, details: s, generated: !o });
}
function N(e, n) {
  gn(!!e, !1, !0, "ok", !1, "Expected value to be truthy", n);
}
function An(e, n) {
  gn(!e, !0, !1, "not", !1, "Expected value to be falsey", n);
}
An.ok = An;
An.equal = function(e, n, t) {
  gn(!xt(e, n), e, n, "not.equal", !1, "Expected values not to be deeply equal", t);
};
An.type = function(e, n, t) {
  let r = typeof e;
  gn(r !== n, r, n, "not.type", !1, `Expected "${r}" not to be "${n}"`, t);
};
An.instance = function(e, n, t) {
  let r = "`" + (n.name || n.constructor.name) + "`";
  gn(!(e instanceof n), e, n, "not.instance", !1, `Expected value not to be an instance of ${r}`, t);
};
An.snapshot = function(e, n, t) {
  e = nr(e), n = nr(n), gn(e !== n, e, n, "not.snapshot", !1, "Expected value not to match snapshot", t);
};
An.fixture = function(e, n, t) {
  e = nr(e), n = nr(n), gn(e !== n, e, n, "not.fixture", !1, "Expected value not to match fixture", t);
};
An.match = function(e, n, t) {
  typeof n == "string" ? gn(!e.includes(n), e, n, "not.match", !1, `Expected value not to include "${n}" substring`, t) : gn(!n.test(e), e, n, "not.match", !1, `Expected value not to match \`${String(n)}\` pattern`, t);
};
An.throws = function(e, n, t) {
  !t && typeof n == "string" && (t = n, n = null);
  try {
    e();
  } catch (r) {
    typeof n == "function" ? gn(!n(r), !0, !1, "not.throws", !1, "Expected function not to throw matching exception", t) : n instanceof RegExp ? gn(!n.test(r.message), !0, !1, "not.throws", !1, `Expected function not to throw exception matching \`${String(n)}\` pattern`, t) : n || gn(!1, !0, !1, "not.throws", !1, "Expected function not to throw", t);
  }
};
const pf = {};
function ff(e, n) {
  const t = n || pf, r = typeof t.includeImageAlt == "boolean" ? t.includeImageAlt : !0, i = typeof t.includeHtml == "boolean" ? t.includeHtml : !0;
  return Jc(e, r, i);
}
function Jc(e, n, t) {
  if (gf(e)) {
    if ("value" in e)
      return e.type === "html" && !t ? "" : e.value;
    if (n && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return Pa(e.children, n, t);
  }
  return Array.isArray(e) ? Pa(e, n, t) : "";
}
function Pa(e, n, t) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = Jc(e[i], n, t);
  return r.join("");
}
function gf(e) {
  return !!(e && typeof e == "object");
}
const Q = (
  /** @type {const} */
  {
    attentionSideBefore: 1,
    // Symbol to mark an attention sequence as before content: `*a`
    attentionSideAfter: 2,
    // Symbol to mark an attention sequence as after content: `a*`
    atxHeadingOpeningFenceSizeMax: 6,
    // 6 number signs is fine, 7 isn’t.
    autolinkDomainSizeMax: 63,
    // 63 characters is fine, 64 is too many.
    autolinkSchemeSizeMax: 32,
    // 32 characters is fine, 33 is too many.
    cdataOpeningString: "CDATA[",
    // And preceded by `<![`.
    characterGroupWhitespace: 1,
    // Symbol used to indicate a character is whitespace
    characterGroupPunctuation: 2,
    // Symbol used to indicate a character is punctuation
    characterReferenceDecimalSizeMax: 7,
    // `&#9999999;`.
    characterReferenceHexadecimalSizeMax: 6,
    // `&#xff9999;`.
    characterReferenceNamedSizeMax: 31,
    // `&CounterClockwiseContourIntegral;`.
    codeFencedSequenceSizeMin: 3,
    // At least 3 ticks or tildes are needed.
    contentTypeDocument: "document",
    contentTypeFlow: "flow",
    contentTypeContent: "content",
    contentTypeString: "string",
    contentTypeText: "text",
    hardBreakPrefixSizeMin: 2,
    // At least 2 trailing spaces are needed.
    htmlRaw: 1,
    // Symbol for `<script>`
    htmlComment: 2,
    // Symbol for `<!---->`
    htmlInstruction: 3,
    // Symbol for `<?php?>`
    htmlDeclaration: 4,
    // Symbol for `<!doctype>`
    htmlCdata: 5,
    // Symbol for `<![CDATA[]]>`
    htmlBasic: 6,
    // Symbol for `<div`
    htmlComplete: 7,
    // Symbol for `<x>`
    htmlRawSizeMax: 8,
    // Length of `textarea`.
    linkResourceDestinationBalanceMax: 32,
    // See: <https://spec.commonmark.org/0.30/#link-destination>, <https://github.com/remarkjs/react-markdown/issues/658#issuecomment-984345577>
    linkReferenceSizeMax: 999,
    // See: <https://spec.commonmark.org/0.30/#link-label>
    listItemValueSizeMax: 10,
    // See: <https://spec.commonmark.org/0.30/#ordered-list-marker>
    numericBaseDecimal: 10,
    numericBaseHexadecimal: 16,
    tabSize: 4,
    // Tabs have a hard-coded size of 4, per CommonMark.
    thematicBreakMarkerCountMin: 3,
    // At least 3 asterisks, dashes, or underscores are needed.
    v8MaxSafeChunkSize: 1e4
    // V8 (and potentially others) have problems injecting giant arrays into other arrays, hence we operate in chunks.
  }
);
function kn(e, n, t, r) {
  const i = e.length;
  let a = 0, o;
  if (n < 0 ? n = -n > i ? 0 : i + n : n = n > i ? i : n, t = t > 0 ? t : 0, r.length < Q.v8MaxSafeChunkSize)
    o = Array.from(r), o.unshift(n, t), e.splice(...o);
  else
    for (t && e.splice(n, t); a < r.length; )
      o = r.slice(
        a,
        a + Q.v8MaxSafeChunkSize
      ), o.unshift(n, 0), e.splice(...o), a += Q.v8MaxSafeChunkSize, n += Q.v8MaxSafeChunkSize;
}
function pn(e, n) {
  return e.length > 0 ? (kn(e, e.length, 0, n), e) : n;
}
const Ba = {}.hasOwnProperty;
function hf(e) {
  const n = {};
  let t = -1;
  for (; ++t < e.length; )
    mf(n, e[t]);
  return n;
}
function mf(e, n) {
  let t;
  for (t in n) {
    const i = (Ba.call(e, t) ? e[t] : void 0) || (e[t] = {}), a = n[t];
    let o;
    if (a)
      for (o in a) {
        Ba.call(i, o) || (i[o] = []);
        const l = a[o];
        bf(
          // @ts-expect-error Looks like a list.
          i[o],
          Array.isArray(l) ? l : l ? [l] : []
        );
      }
  }
}
function bf(e, n) {
  let t = -1;
  const r = [];
  for (; ++t < n.length; )
    (n[t].add === "after" ? e : r).push(n[t]);
  kn(e, 0, 0, r);
}
const g = (
  /** @type {const} */
  {
    carriageReturn: -5,
    lineFeed: -4,
    carriageReturnLineFeed: -3,
    horizontalTab: -2,
    virtualSpace: -1,
    eof: null,
    nul: 0,
    soh: 1,
    stx: 2,
    etx: 3,
    eot: 4,
    enq: 5,
    ack: 6,
    bel: 7,
    bs: 8,
    ht: 9,
    // `\t`
    lf: 10,
    // `\n`
    vt: 11,
    // `\v`
    ff: 12,
    // `\f`
    cr: 13,
    // `\r`
    so: 14,
    si: 15,
    dle: 16,
    dc1: 17,
    dc2: 18,
    dc3: 19,
    dc4: 20,
    nak: 21,
    syn: 22,
    etb: 23,
    can: 24,
    em: 25,
    sub: 26,
    esc: 27,
    fs: 28,
    gs: 29,
    rs: 30,
    us: 31,
    space: 32,
    exclamationMark: 33,
    // `!`
    quotationMark: 34,
    // `"`
    numberSign: 35,
    // `#`
    dollarSign: 36,
    // `$`
    percentSign: 37,
    // `%`
    ampersand: 38,
    // `&`
    apostrophe: 39,
    // `'`
    leftParenthesis: 40,
    // `(`
    rightParenthesis: 41,
    // `)`
    asterisk: 42,
    // `*`
    plusSign: 43,
    // `+`
    comma: 44,
    // `,`
    dash: 45,
    // `-`
    dot: 46,
    // `.`
    slash: 47,
    // `/`
    digit0: 48,
    // `0`
    digit1: 49,
    // `1`
    digit2: 50,
    // `2`
    digit3: 51,
    // `3`
    digit4: 52,
    // `4`
    digit5: 53,
    // `5`
    digit6: 54,
    // `6`
    digit7: 55,
    // `7`
    digit8: 56,
    // `8`
    digit9: 57,
    // `9`
    colon: 58,
    // `:`
    semicolon: 59,
    // `;`
    lessThan: 60,
    // `<`
    equalsTo: 61,
    // `=`
    greaterThan: 62,
    // `>`
    questionMark: 63,
    // `?`
    atSign: 64,
    // `@`
    uppercaseA: 65,
    // `A`
    uppercaseB: 66,
    // `B`
    uppercaseC: 67,
    // `C`
    uppercaseD: 68,
    // `D`
    uppercaseE: 69,
    // `E`
    uppercaseF: 70,
    // `F`
    uppercaseG: 71,
    // `G`
    uppercaseH: 72,
    // `H`
    uppercaseI: 73,
    // `I`
    uppercaseJ: 74,
    // `J`
    uppercaseK: 75,
    // `K`
    uppercaseL: 76,
    // `L`
    uppercaseM: 77,
    // `M`
    uppercaseN: 78,
    // `N`
    uppercaseO: 79,
    // `O`
    uppercaseP: 80,
    // `P`
    uppercaseQ: 81,
    // `Q`
    uppercaseR: 82,
    // `R`
    uppercaseS: 83,
    // `S`
    uppercaseT: 84,
    // `T`
    uppercaseU: 85,
    // `U`
    uppercaseV: 86,
    // `V`
    uppercaseW: 87,
    // `W`
    uppercaseX: 88,
    // `X`
    uppercaseY: 89,
    // `Y`
    uppercaseZ: 90,
    // `Z`
    leftSquareBracket: 91,
    // `[`
    backslash: 92,
    // `\`
    rightSquareBracket: 93,
    // `]`
    caret: 94,
    // `^`
    underscore: 95,
    // `_`
    graveAccent: 96,
    // `` ` ``
    lowercaseA: 97,
    // `a`
    lowercaseB: 98,
    // `b`
    lowercaseC: 99,
    // `c`
    lowercaseD: 100,
    // `d`
    lowercaseE: 101,
    // `e`
    lowercaseF: 102,
    // `f`
    lowercaseG: 103,
    // `g`
    lowercaseH: 104,
    // `h`
    lowercaseI: 105,
    // `i`
    lowercaseJ: 106,
    // `j`
    lowercaseK: 107,
    // `k`
    lowercaseL: 108,
    // `l`
    lowercaseM: 109,
    // `m`
    lowercaseN: 110,
    // `n`
    lowercaseO: 111,
    // `o`
    lowercaseP: 112,
    // `p`
    lowercaseQ: 113,
    // `q`
    lowercaseR: 114,
    // `r`
    lowercaseS: 115,
    // `s`
    lowercaseT: 116,
    // `t`
    lowercaseU: 117,
    // `u`
    lowercaseV: 118,
    // `v`
    lowercaseW: 119,
    // `w`
    lowercaseX: 120,
    // `x`
    lowercaseY: 121,
    // `y`
    lowercaseZ: 122,
    // `z`
    leftCurlyBrace: 123,
    // `{`
    verticalBar: 124,
    // `|`
    rightCurlyBrace: 125,
    // `}`
    tilde: 126,
    // `~`
    del: 127,
    // Unicode Specials block.
    byteOrderMarker: 65279,
    // Unicode Specials block.
    replacementCharacter: 65533
    // `�`
  }
), yf = /[!-/:-@[-`{-~\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]/, vn = Hn(/[A-Za-z]/), un = Hn(/[\dA-Za-z]/), Ef = Hn(/[#-'*+\--9=?A-Z^-~]/);
function ei(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < g.space || e === g.del)
  );
}
const ni = Hn(/\d/), xf = Hn(/[\dA-Fa-f]/), vf = Hn(/[!-/:-@[-`{-~]/);
function ne(e) {
  return e !== null && e < g.horizontalTab;
}
function on(e) {
  return e !== null && (e < g.nul || e === g.space);
}
function we(e) {
  return e === g.horizontalTab || e === g.virtualSpace || e === g.space;
}
const _f = Hn(yf), wf = Hn(/\s/);
function Hn(e) {
  return n;
  function n(t) {
    return t !== null && e.test(String.fromCharCode(t));
  }
}
function Me(e, n, t, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let a = 0;
  return o;
  function o(s) {
    return we(s) ? (e.enter(t), l(s)) : n(s);
  }
  function l(s) {
    return we(s) && a++ < i ? (e.consume(s), l) : (e.exit(t), n(s));
  }
}
const p = (
  /** @type {const} */
  {
    // Generic type for data, such as in a title, a destination, etc.
    data: "data",
    // Generic type for syntactic whitespace (tabs, virtual spaces, spaces).
    // Such as, between a fenced code fence and an info string.
    whitespace: "whitespace",
    // Generic type for line endings (line feed, carriage return, carriage return +
    // line feed).
    lineEnding: "lineEnding",
    // A line ending, but ending a blank line.
    lineEndingBlank: "lineEndingBlank",
    // Generic type for whitespace (tabs, virtual spaces, spaces) at the start of a
    // line.
    linePrefix: "linePrefix",
    // Generic type for whitespace (tabs, virtual spaces, spaces) at the end of a
    // line.
    lineSuffix: "lineSuffix",
    // Whole ATX heading:
    //
    // ```markdown
    // #
    // ## Alpha
    // ### Bravo ###
    // ```
    //
    // Includes `atxHeadingSequence`, `whitespace`, `atxHeadingText`.
    atxHeading: "atxHeading",
    // Sequence of number signs in an ATX heading (`###`).
    atxHeadingSequence: "atxHeadingSequence",
    // Content in an ATX heading (`alpha`).
    // Includes text.
    atxHeadingText: "atxHeadingText",
    // Whole autolink (`<https://example.com>` or `<admin@example.com>`)
    // Includes `autolinkMarker` and `autolinkProtocol` or `autolinkEmail`.
    autolink: "autolink",
    // Email autolink w/o markers (`admin@example.com`)
    autolinkEmail: "autolinkEmail",
    // Marker around an `autolinkProtocol` or `autolinkEmail` (`<` or `>`).
    autolinkMarker: "autolinkMarker",
    // Protocol autolink w/o markers (`https://example.com`)
    autolinkProtocol: "autolinkProtocol",
    // A whole character escape (`\-`).
    // Includes `escapeMarker` and `characterEscapeValue`.
    characterEscape: "characterEscape",
    // The escaped character (`-`).
    characterEscapeValue: "characterEscapeValue",
    // A whole character reference (`&amp;`, `&#8800;`, or `&#x1D306;`).
    // Includes `characterReferenceMarker`, an optional
    // `characterReferenceMarkerNumeric`, in which case an optional
    // `characterReferenceMarkerHexadecimal`, and a `characterReferenceValue`.
    characterReference: "characterReference",
    // The start or end marker (`&` or `;`).
    characterReferenceMarker: "characterReferenceMarker",
    // Mark reference as numeric (`#`).
    characterReferenceMarkerNumeric: "characterReferenceMarkerNumeric",
    // Mark reference as numeric (`x` or `X`).
    characterReferenceMarkerHexadecimal: "characterReferenceMarkerHexadecimal",
    // Value of character reference w/o markers (`amp`, `8800`, or `1D306`).
    characterReferenceValue: "characterReferenceValue",
    // Whole fenced code:
    //
    // ````markdown
    // ```js
    // alert(1)
    // ```
    // ````
    codeFenced: "codeFenced",
    // A fenced code fence, including whitespace, sequence, info, and meta
    // (` ```js `).
    codeFencedFence: "codeFencedFence",
    // Sequence of grave accent or tilde characters (` ``` `) in a fence.
    codeFencedFenceSequence: "codeFencedFenceSequence",
    // Info word (`js`) in a fence.
    // Includes string.
    codeFencedFenceInfo: "codeFencedFenceInfo",
    // Meta words (`highlight="1"`) in a fence.
    // Includes string.
    codeFencedFenceMeta: "codeFencedFenceMeta",
    // A line of code.
    codeFlowValue: "codeFlowValue",
    // Whole indented code:
    //
    // ```markdown
    //     alert(1)
    // ```
    //
    // Includes `lineEnding`, `linePrefix`, and `codeFlowValue`.
    codeIndented: "codeIndented",
    // A text code (``` `alpha` ```).
    // Includes `codeTextSequence`, `codeTextData`, `lineEnding`, and can include
    // `codeTextPadding`.
    codeText: "codeText",
    codeTextData: "codeTextData",
    // A space or line ending right after or before a tick.
    codeTextPadding: "codeTextPadding",
    // A text code fence (` `` `).
    codeTextSequence: "codeTextSequence",
    // Whole content:
    //
    // ```markdown
    // [a]: b
    // c
    // =
    // d
    // ```
    //
    // Includes `paragraph` and `definition`.
    content: "content",
    // Whole definition:
    //
    // ```markdown
    // [micromark]: https://github.com/micromark/micromark
    // ```
    //
    // Includes `definitionLabel`, `definitionMarker`, `whitespace`,
    // `definitionDestination`, and optionally `lineEnding` and `definitionTitle`.
    definition: "definition",
    // Destination of a definition (`https://github.com/micromark/micromark` or
    // `<https://github.com/micromark/micromark>`).
    // Includes `definitionDestinationLiteral` or `definitionDestinationRaw`.
    definitionDestination: "definitionDestination",
    // Enclosed destination of a definition
    // (`<https://github.com/micromark/micromark>`).
    // Includes `definitionDestinationLiteralMarker` and optionally
    // `definitionDestinationString`.
    definitionDestinationLiteral: "definitionDestinationLiteral",
    // Markers of an enclosed definition destination (`<` or `>`).
    definitionDestinationLiteralMarker: "definitionDestinationLiteralMarker",
    // Unenclosed destination of a definition
    // (`https://github.com/micromark/micromark`).
    // Includes `definitionDestinationString`.
    definitionDestinationRaw: "definitionDestinationRaw",
    // Text in an destination (`https://github.com/micromark/micromark`).
    // Includes string.
    definitionDestinationString: "definitionDestinationString",
    // Label of a definition (`[micromark]`).
    // Includes `definitionLabelMarker` and `definitionLabelString`.
    definitionLabel: "definitionLabel",
    // Markers of a definition label (`[` or `]`).
    definitionLabelMarker: "definitionLabelMarker",
    // Value of a definition label (`micromark`).
    // Includes string.
    definitionLabelString: "definitionLabelString",
    // Marker between a label and a destination (`:`).
    definitionMarker: "definitionMarker",
    // Title of a definition (`"x"`, `'y'`, or `(z)`).
    // Includes `definitionTitleMarker` and optionally `definitionTitleString`.
    definitionTitle: "definitionTitle",
    // Marker around a title of a definition (`"`, `'`, `(`, or `)`).
    definitionTitleMarker: "definitionTitleMarker",
    // Data without markers in a title (`z`).
    // Includes string.
    definitionTitleString: "definitionTitleString",
    // Emphasis (`*alpha*`).
    // Includes `emphasisSequence` and `emphasisText`.
    emphasis: "emphasis",
    // Sequence of emphasis markers (`*` or `_`).
    emphasisSequence: "emphasisSequence",
    // Emphasis text (`alpha`).
    // Includes text.
    emphasisText: "emphasisText",
    // The character escape marker (`\`).
    escapeMarker: "escapeMarker",
    // A hard break created with a backslash (`\\n`).
    // Note: does not include the line ending.
    hardBreakEscape: "hardBreakEscape",
    // A hard break created with trailing spaces (`  \n`).
    // Does not include the line ending.
    hardBreakTrailing: "hardBreakTrailing",
    // Flow HTML:
    //
    // ```markdown
    // <div
    // ```
    //
    // Inlcudes `lineEnding`, `htmlFlowData`.
    htmlFlow: "htmlFlow",
    htmlFlowData: "htmlFlowData",
    // HTML in text (the tag in `a <i> b`).
    // Includes `lineEnding`, `htmlTextData`.
    htmlText: "htmlText",
    htmlTextData: "htmlTextData",
    // Whole image (`![alpha](bravo)`, `![alpha][bravo]`, `![alpha][]`, or
    // `![alpha]`).
    // Includes `label` and an optional `resource` or `reference`.
    image: "image",
    // Whole link label (`[*alpha*]`).
    // Includes `labelLink` or `labelImage`, `labelText`, and `labelEnd`.
    label: "label",
    // Text in an label (`*alpha*`).
    // Includes text.
    labelText: "labelText",
    // Start a link label (`[`).
    // Includes a `labelMarker`.
    labelLink: "labelLink",
    // Start an image label (`![`).
    // Includes `labelImageMarker` and `labelMarker`.
    labelImage: "labelImage",
    // Marker of a label (`[` or `]`).
    labelMarker: "labelMarker",
    // Marker to start an image (`!`).
    labelImageMarker: "labelImageMarker",
    // End a label (`]`).
    // Includes `labelMarker`.
    labelEnd: "labelEnd",
    // Whole link (`[alpha](bravo)`, `[alpha][bravo]`, `[alpha][]`, or `[alpha]`).
    // Includes `label` and an optional `resource` or `reference`.
    link: "link",
    // Whole paragraph:
    //
    // ```markdown
    // alpha
    // bravo.
    // ```
    //
    // Includes text.
    paragraph: "paragraph",
    // A reference (`[alpha]` or `[]`).
    // Includes `referenceMarker` and an optional `referenceString`.
    reference: "reference",
    // A reference marker (`[` or `]`).
    referenceMarker: "referenceMarker",
    // Reference text (`alpha`).
    // Includes string.
    referenceString: "referenceString",
    // A resource (`(https://example.com "alpha")`).
    // Includes `resourceMarker`, an optional `resourceDestination` with an optional
    // `whitespace` and `resourceTitle`.
    resource: "resource",
    // A resource destination (`https://example.com`).
    // Includes `resourceDestinationLiteral` or `resourceDestinationRaw`.
    resourceDestination: "resourceDestination",
    // A literal resource destination (`<https://example.com>`).
    // Includes `resourceDestinationLiteralMarker` and optionally
    // `resourceDestinationString`.
    resourceDestinationLiteral: "resourceDestinationLiteral",
    // A resource destination marker (`<` or `>`).
    resourceDestinationLiteralMarker: "resourceDestinationLiteralMarker",
    // A raw resource destination (`https://example.com`).
    // Includes `resourceDestinationString`.
    resourceDestinationRaw: "resourceDestinationRaw",
    // Resource destination text (`https://example.com`).
    // Includes string.
    resourceDestinationString: "resourceDestinationString",
    // A resource marker (`(` or `)`).
    resourceMarker: "resourceMarker",
    // A resource title (`"alpha"`, `'alpha'`, or `(alpha)`).
    // Includes `resourceTitleMarker` and optionally `resourceTitleString`.
    resourceTitle: "resourceTitle",
    // A resource title marker (`"`, `'`, `(`, or `)`).
    resourceTitleMarker: "resourceTitleMarker",
    // Resource destination title (`alpha`).
    // Includes string.
    resourceTitleString: "resourceTitleString",
    // Whole setext heading:
    //
    // ```markdown
    // alpha
    // bravo
    // =====
    // ```
    //
    // Includes `setextHeadingText`, `lineEnding`, `linePrefix`, and
    // `setextHeadingLine`.
    setextHeading: "setextHeading",
    // Content in a setext heading (`alpha\nbravo`).
    // Includes text.
    setextHeadingText: "setextHeadingText",
    // Underline in a setext heading, including whitespace suffix (`==`).
    // Includes `setextHeadingLineSequence`.
    setextHeadingLine: "setextHeadingLine",
    // Sequence of equals or dash characters in underline in a setext heading (`-`).
    setextHeadingLineSequence: "setextHeadingLineSequence",
    // Strong (`**alpha**`).
    // Includes `strongSequence` and `strongText`.
    strong: "strong",
    // Sequence of strong markers (`**` or `__`).
    strongSequence: "strongSequence",
    // Strong text (`alpha`).
    // Includes text.
    strongText: "strongText",
    // Whole thematic break:
    //
    // ```markdown
    // * * *
    // ```
    //
    // Includes `thematicBreakSequence` and `whitespace`.
    thematicBreak: "thematicBreak",
    // A sequence of one or more thematic break markers (`***`).
    thematicBreakSequence: "thematicBreakSequence",
    // Whole block quote:
    //
    // ```markdown
    // > a
    // >
    // > b
    // ```
    //
    // Includes `blockQuotePrefix` and flow.
    blockQuote: "blockQuote",
    // The `>` or `> ` of a block quote.
    blockQuotePrefix: "blockQuotePrefix",
    // The `>` of a block quote prefix.
    blockQuoteMarker: "blockQuoteMarker",
    // The optional ` ` of a block quote prefix.
    blockQuotePrefixWhitespace: "blockQuotePrefixWhitespace",
    // Whole unordered list:
    //
    // ```markdown
    // - a
    //   b
    // ```
    //
    // Includes `listItemPrefix`, flow, and optionally  `listItemIndent` on further
    // lines.
    listOrdered: "listOrdered",
    // Whole ordered list:
    //
    // ```markdown
    // 1. a
    //    b
    // ```
    //
    // Includes `listItemPrefix`, flow, and optionally  `listItemIndent` on further
    // lines.
    listUnordered: "listUnordered",
    // The indent of further list item lines.
    listItemIndent: "listItemIndent",
    // A marker, as in, `*`, `+`, `-`, `.`, or `)`.
    listItemMarker: "listItemMarker",
    // The thing that starts a list item, such as `1. `.
    // Includes `listItemValue` if ordered, `listItemMarker`, and
    // `listItemPrefixWhitespace` (unless followed by a line ending).
    listItemPrefix: "listItemPrefix",
    // The whitespace after a marker.
    listItemPrefixWhitespace: "listItemPrefixWhitespace",
    // The numerical value of an ordered item.
    listItemValue: "listItemValue",
    // Internal types used for subtokenizers, compiled away
    chunkDocument: "chunkDocument",
    chunkContent: "chunkContent",
    chunkFlow: "chunkFlow",
    chunkText: "chunkText",
    chunkString: "chunkString"
  }
), Sf = { tokenize: kf };
function kf(e) {
  const n = e.attempt(
    this.parser.constructs.contentInitial,
    r,
    i
  );
  let t;
  return n;
  function r(l) {
    if (N(
      l === g.eof || ne(l),
      "expected eol or eof"
    ), l === g.eof) {
      e.consume(l);
      return;
    }
    return e.enter(p.lineEnding), e.consume(l), e.exit(p.lineEnding), Me(e, n, p.linePrefix);
  }
  function i(l) {
    return N(
      l !== g.eof && !ne(l),
      "expected anything other than a line ending or EOF"
    ), e.enter(p.paragraph), a(l);
  }
  function a(l) {
    const s = e.enter(p.chunkText, {
      contentType: Q.contentTypeText,
      previous: t
    });
    return t && (t.next = s), t = s, o(l);
  }
  function o(l) {
    if (l === g.eof) {
      e.exit(p.chunkText), e.exit(p.paragraph), e.consume(l);
      return;
    }
    return ne(l) ? (e.consume(l), e.exit(p.chunkText), a) : (e.consume(l), o);
  }
}
const Nf = { tokenize: Of }, Fa = { tokenize: Cf };
function Of(e) {
  const n = this, t = [];
  let r = 0, i, a, o;
  return l;
  function l(_) {
    if (r < t.length) {
      const C = t[r];
      return n.containerState = C[1], N(
        C[0].continuation,
        "expected `continuation` to be defined on container construct"
      ), e.attempt(
        C[0].continuation,
        s,
        u
      )(_);
    }
    return u(_);
  }
  function s(_) {
    if (N(
      n.containerState,
      "expected `containerState` to be defined after continuation"
    ), r++, n.containerState._closeFlow) {
      n.containerState._closeFlow = void 0, i && w();
      const C = n.events.length;
      let M = C, S;
      for (; M--; )
        if (n.events[M][0] === "exit" && n.events[M][1].type === p.chunkFlow) {
          S = n.events[M][1].end;
          break;
        }
      N(S, "could not find previous flow chunk"), b(r);
      let I = C;
      for (; I < n.events.length; )
        n.events[I][1].end = Object.assign({}, S), I++;
      return kn(
        n.events,
        M + 1,
        0,
        n.events.slice(C)
      ), n.events.length = I, u(_);
    }
    return l(_);
  }
  function u(_) {
    if (r === t.length) {
      if (!i)
        return f(_);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return v(_);
      n.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return n.containerState = {}, e.check(
      Fa,
      c,
      d
    )(_);
  }
  function c(_) {
    return i && w(), b(r), f(_);
  }
  function d(_) {
    return n.parser.lazy[n.now().line] = r !== t.length, o = n.now().offset, v(_);
  }
  function f(_) {
    return n.containerState = {}, e.attempt(
      Fa,
      h,
      v
    )(_);
  }
  function h(_) {
    return N(
      n.currentConstruct,
      "expected `currentConstruct` to be defined on tokenizer"
    ), N(
      n.containerState,
      "expected `containerState` to be defined on tokenizer"
    ), r++, t.push([n.currentConstruct, n.containerState]), f(_);
  }
  function v(_) {
    if (_ === g.eof) {
      i && w(), b(0), e.consume(_);
      return;
    }
    return i = i || n.parser.flow(n.now()), e.enter(p.chunkFlow, {
      contentType: Q.contentTypeFlow,
      previous: a,
      _tokenizer: i
    }), x(_);
  }
  function x(_) {
    if (_ === g.eof) {
      m(e.exit(p.chunkFlow), !0), b(0), e.consume(_);
      return;
    }
    return ne(_) ? (e.consume(_), m(e.exit(p.chunkFlow)), r = 0, n.interrupt = void 0, l) : (e.consume(_), x);
  }
  function m(_, C) {
    N(i, "expected `childFlow` to be defined when continuing");
    const M = n.sliceStream(_);
    if (C && M.push(null), _.previous = a, a && (a.next = _), a = _, i.defineSkip(_.start), i.write(M), n.parser.lazy[_.start.line]) {
      let S = i.events.length;
      for (; S--; )
        if (
          // The token starts before the line ending…
          i.events[S][1].start.offset < o && // …and either is not ended yet…
          (!i.events[S][1].end || // …or ends after it.
          i.events[S][1].end.offset > o)
        )
          return;
      const I = n.events.length;
      let L = I, D, Y;
      for (; L--; )
        if (n.events[L][0] === "exit" && n.events[L][1].type === p.chunkFlow) {
          if (D) {
            Y = n.events[L][1].end;
            break;
          }
          D = !0;
        }
      for (N(Y, "could not find previous flow chunk"), b(r), S = I; S < n.events.length; )
        n.events[S][1].end = Object.assign({}, Y), S++;
      kn(
        n.events,
        L + 1,
        0,
        n.events.slice(I)
      ), n.events.length = S;
    }
  }
  function b(_) {
    let C = t.length;
    for (; C-- > _; ) {
      const M = t[C];
      n.containerState = M[1], N(
        M[0].exit,
        "expected `exit` to be defined on container construct"
      ), M[0].exit.call(n, e);
    }
    t.length = _;
  }
  function w() {
    N(
      n.containerState,
      "expected `containerState` to be defined when closing flow"
    ), N(i, "expected `childFlow` to be defined when closing it"), i.write([g.eof]), a = void 0, i = void 0, n.containerState._closeFlow = void 0;
  }
}
function Cf(e, n, t) {
  return N(
    this.parser.constructs.disable.null,
    "expected `disable.null` to be populated"
  ), Me(
    e,
    e.attempt(this.parser.constructs.document, n, t),
    p.linePrefix,
    this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : Q.tabSize
  );
}
function $a(e) {
  if (e === g.eof || on(e) || wf(e))
    return Q.characterGroupWhitespace;
  if (_f(e))
    return Q.characterGroupPunctuation;
}
function ki(e, n, t) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const a = e[i].resolveAll;
    a && !r.includes(a) && (n = a(n, t), r.push(a));
  }
  return n;
}
const ti = {
  name: "attention",
  tokenize: Af,
  resolveAll: Tf
};
function Tf(e, n) {
  let t = -1, r, i, a, o, l, s, u, c;
  for (; ++t < e.length; )
    if (e[t][0] === "enter" && e[t][1].type === "attentionSequence" && e[t][1]._close) {
      for (r = t; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        n.sliceSerialize(e[r][1]).charCodeAt(0) === n.sliceSerialize(e[t][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[t][1]._open) && (e[t][1].end.offset - e[t][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[t][1].end.offset - e[t][1].start.offset) % 3))
            continue;
          s = e[r][1].end.offset - e[r][1].start.offset > 1 && e[t][1].end.offset - e[t][1].start.offset > 1 ? 2 : 1;
          const d = Object.assign({}, e[r][1].end), f = Object.assign({}, e[t][1].start);
          za(d, -s), za(f, s), o = {
            type: s > 1 ? p.strongSequence : p.emphasisSequence,
            start: d,
            end: Object.assign({}, e[r][1].end)
          }, l = {
            type: s > 1 ? p.strongSequence : p.emphasisSequence,
            start: Object.assign({}, e[t][1].start),
            end: f
          }, a = {
            type: s > 1 ? p.strongText : p.emphasisText,
            start: Object.assign({}, e[r][1].end),
            end: Object.assign({}, e[t][1].start)
          }, i = {
            type: s > 1 ? p.strong : p.emphasis,
            start: Object.assign({}, o.start),
            end: Object.assign({}, l.end)
          }, e[r][1].end = Object.assign({}, o.start), e[t][1].start = Object.assign({}, l.end), u = [], e[r][1].end.offset - e[r][1].start.offset && (u = pn(u, [
            ["enter", e[r][1], n],
            ["exit", e[r][1], n]
          ])), u = pn(u, [
            ["enter", i, n],
            ["enter", o, n],
            ["exit", o, n],
            ["enter", a, n]
          ]), N(
            n.parser.constructs.insideSpan.null,
            "expected `insideSpan` to be populated"
          ), u = pn(
            u,
            ki(
              n.parser.constructs.insideSpan.null,
              e.slice(r + 1, t),
              n
            )
          ), u = pn(u, [
            ["exit", a, n],
            ["enter", l, n],
            ["exit", l, n],
            ["exit", i, n]
          ]), e[t][1].end.offset - e[t][1].start.offset ? (c = 2, u = pn(u, [
            ["enter", e[t][1], n],
            ["exit", e[t][1], n]
          ])) : c = 0, kn(e, r - 1, t - r + 3, u), t = r + u.length - c - 2;
          break;
        }
    }
  for (t = -1; ++t < e.length; )
    e[t][1].type === "attentionSequence" && (e[t][1].type = "data");
  return e;
}
function Af(e, n) {
  const t = this.parser.constructs.attentionMarkers.null, r = this.previous, i = $a(r);
  let a;
  return o;
  function o(s) {
    return N(
      s === g.asterisk || s === g.underscore,
      "expected asterisk or underscore"
    ), a = s, e.enter("attentionSequence"), l(s);
  }
  function l(s) {
    if (s === a)
      return e.consume(s), l;
    const u = e.exit("attentionSequence"), c = $a(s);
    N(t, "expected `attentionMarkers` to be populated");
    const d = !c || c === Q.characterGroupPunctuation && i || t.includes(s), f = !i || i === Q.characterGroupPunctuation && c || t.includes(r);
    return u._open = !!(a === g.asterisk ? d : d && (i || !f)), u._close = !!(a === g.asterisk ? f : f && (c || !d)), n(s);
  }
}
function za(e, n) {
  e.column += n, e.offset += n, e._bufferIndex += n;
}
const Mf = { name: "autolink", tokenize: If };
function If(e, n, t) {
  let r = 0;
  return i;
  function i(h) {
    return N(h === g.lessThan, "expected `<`"), e.enter(p.autolink), e.enter(p.autolinkMarker), e.consume(h), e.exit(p.autolinkMarker), e.enter(p.autolinkProtocol), a;
  }
  function a(h) {
    return vn(h) ? (e.consume(h), o) : u(h);
  }
  function o(h) {
    return h === g.plusSign || h === g.dash || h === g.dot || un(h) ? (r = 1, l(h)) : u(h);
  }
  function l(h) {
    return h === g.colon ? (e.consume(h), r = 0, s) : (h === g.plusSign || h === g.dash || h === g.dot || un(h)) && r++ < Q.autolinkSchemeSizeMax ? (e.consume(h), l) : (r = 0, u(h));
  }
  function s(h) {
    return h === g.greaterThan ? (e.exit(p.autolinkProtocol), e.enter(p.autolinkMarker), e.consume(h), e.exit(p.autolinkMarker), e.exit(p.autolink), n) : h === g.eof || h === g.space || h === g.lessThan || ei(h) ? t(h) : (e.consume(h), s);
  }
  function u(h) {
    return h === g.atSign ? (e.consume(h), c) : Ef(h) ? (e.consume(h), u) : t(h);
  }
  function c(h) {
    return un(h) ? d(h) : t(h);
  }
  function d(h) {
    return h === g.dot ? (e.consume(h), r = 0, c) : h === g.greaterThan ? (e.exit(p.autolinkProtocol).type = p.autolinkEmail, e.enter(p.autolinkMarker), e.consume(h), e.exit(p.autolinkMarker), e.exit(p.autolink), n) : f(h);
  }
  function f(h) {
    if ((h === g.dash || un(h)) && r++ < Q.autolinkDomainSizeMax) {
      const v = h === g.dash ? f : d;
      return e.consume(h), v;
    }
    return t(h);
  }
}
const pr = { tokenize: Rf, partial: !0 };
function Rf(e, n, t) {
  return r;
  function r(a) {
    return we(a) ? Me(e, i, p.linePrefix)(a) : i(a);
  }
  function i(a) {
    return a === g.eof || ne(a) ? n(a) : t(a);
  }
}
const eu = {
  name: "blockQuote",
  tokenize: Df,
  continuation: { tokenize: Lf },
  exit: Pf
};
function Df(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    if (o === g.greaterThan) {
      const l = r.containerState;
      return N(l, "expected `containerState` to be defined in container"), l.open || (e.enter(p.blockQuote, { _container: !0 }), l.open = !0), e.enter(p.blockQuotePrefix), e.enter(p.blockQuoteMarker), e.consume(o), e.exit(p.blockQuoteMarker), a;
    }
    return t(o);
  }
  function a(o) {
    return we(o) ? (e.enter(p.blockQuotePrefixWhitespace), e.consume(o), e.exit(p.blockQuotePrefixWhitespace), e.exit(p.blockQuotePrefix), n) : (e.exit(p.blockQuotePrefix), n(o));
  }
}
function Lf(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    return we(o) ? (N(
      r.parser.constructs.disable.null,
      "expected `disable.null` to be populated"
    ), Me(
      e,
      a,
      p.linePrefix,
      r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : Q.tabSize
    )(o)) : a(o);
  }
  function a(o) {
    return e.attempt(eu, n, t)(o);
  }
}
function Pf(e) {
  e.exit(p.blockQuote);
}
const nu = {
  name: "characterEscape",
  tokenize: Bf
};
function Bf(e, n, t) {
  return r;
  function r(a) {
    return N(a === g.backslash, "expected `\\`"), e.enter(p.characterEscape), e.enter(p.escapeMarker), e.consume(a), e.exit(p.escapeMarker), i;
  }
  function i(a) {
    return vf(a) ? (e.enter(p.characterEscapeValue), e.consume(a), e.exit(p.characterEscapeValue), e.exit(p.characterEscape), n) : t(a);
  }
}
const Ua = document.createElement("i");
function Ni(e) {
  const n = "&" + e + ";";
  Ua.innerHTML = n;
  const t = Ua.textContent;
  return (
    // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
    // yield `null`.
    t.charCodeAt(t.length - 1) === 59 && e !== "semi" || t === n ? !1 : t
  );
}
const tu = {
  name: "characterReference",
  tokenize: Ff
};
function Ff(e, n, t) {
  const r = this;
  let i = 0, a, o;
  return l;
  function l(d) {
    return N(d === g.ampersand, "expected `&`"), e.enter(p.characterReference), e.enter(p.characterReferenceMarker), e.consume(d), e.exit(p.characterReferenceMarker), s;
  }
  function s(d) {
    return d === g.numberSign ? (e.enter(p.characterReferenceMarkerNumeric), e.consume(d), e.exit(p.characterReferenceMarkerNumeric), u) : (e.enter(p.characterReferenceValue), a = Q.characterReferenceNamedSizeMax, o = un, c(d));
  }
  function u(d) {
    return d === g.uppercaseX || d === g.lowercaseX ? (e.enter(p.characterReferenceMarkerHexadecimal), e.consume(d), e.exit(p.characterReferenceMarkerHexadecimal), e.enter(p.characterReferenceValue), a = Q.characterReferenceHexadecimalSizeMax, o = xf, c) : (e.enter(p.characterReferenceValue), a = Q.characterReferenceDecimalSizeMax, o = ni, c(d));
  }
  function c(d) {
    if (d === g.semicolon && i) {
      const f = e.exit(p.characterReferenceValue);
      return o === un && !Ni(r.sliceSerialize(f)) ? t(d) : (e.enter(p.characterReferenceMarker), e.consume(d), e.exit(p.characterReferenceMarker), e.exit(p.characterReference), n);
    }
    return o(d) && i++ < a ? (e.consume(d), c) : t(d);
  }
}
const Ha = {
  tokenize: zf,
  partial: !0
}, ja = {
  name: "codeFenced",
  tokenize: $f,
  concrete: !0
};
function $f(e, n, t) {
  const r = this, i = { tokenize: M, partial: !0 };
  let a = 0, o = 0, l;
  return s;
  function s(S) {
    return u(S);
  }
  function u(S) {
    N(
      S === g.graveAccent || S === g.tilde,
      "expected `` ` `` or `~`"
    );
    const I = r.events[r.events.length - 1];
    return a = I && I[1].type === p.linePrefix ? I[2].sliceSerialize(I[1], !0).length : 0, l = S, e.enter(p.codeFenced), e.enter(p.codeFencedFence), e.enter(p.codeFencedFenceSequence), c(S);
  }
  function c(S) {
    return S === l ? (o++, e.consume(S), c) : o < Q.codeFencedSequenceSizeMin ? t(S) : (e.exit(p.codeFencedFenceSequence), we(S) ? Me(e, d, p.whitespace)(S) : d(S));
  }
  function d(S) {
    return S === g.eof || ne(S) ? (e.exit(p.codeFencedFence), r.interrupt ? n(S) : e.check(Ha, x, C)(S)) : (e.enter(p.codeFencedFenceInfo), e.enter(p.chunkString, { contentType: Q.contentTypeString }), f(S));
  }
  function f(S) {
    return S === g.eof || ne(S) ? (e.exit(p.chunkString), e.exit(p.codeFencedFenceInfo), d(S)) : we(S) ? (e.exit(p.chunkString), e.exit(p.codeFencedFenceInfo), Me(e, h, p.whitespace)(S)) : S === g.graveAccent && S === l ? t(S) : (e.consume(S), f);
  }
  function h(S) {
    return S === g.eof || ne(S) ? d(S) : (e.enter(p.codeFencedFenceMeta), e.enter(p.chunkString, { contentType: Q.contentTypeString }), v(S));
  }
  function v(S) {
    return S === g.eof || ne(S) ? (e.exit(p.chunkString), e.exit(p.codeFencedFenceMeta), d(S)) : S === g.graveAccent && S === l ? t(S) : (e.consume(S), v);
  }
  function x(S) {
    return N(ne(S), "expected eol"), e.attempt(i, C, m)(S);
  }
  function m(S) {
    return N(ne(S), "expected eol"), e.enter(p.lineEnding), e.consume(S), e.exit(p.lineEnding), b;
  }
  function b(S) {
    return a > 0 && we(S) ? Me(
      e,
      w,
      p.linePrefix,
      a + 1
    )(S) : w(S);
  }
  function w(S) {
    return S === g.eof || ne(S) ? e.check(Ha, x, C)(S) : (e.enter(p.codeFlowValue), _(S));
  }
  function _(S) {
    return S === g.eof || ne(S) ? (e.exit(p.codeFlowValue), w(S)) : (e.consume(S), _);
  }
  function C(S) {
    return e.exit(p.codeFenced), n(S);
  }
  function M(S, I, L) {
    let D = 0;
    return Y;
    function Y(G) {
      return N(ne(G), "expected eol"), S.enter(p.lineEnding), S.consume(G), S.exit(p.lineEnding), J;
    }
    function J(G) {
      return N(
        r.parser.constructs.disable.null,
        "expected `disable.null` to be populated"
      ), S.enter(p.codeFencedFence), we(G) ? Me(
        S,
        W,
        p.linePrefix,
        r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : Q.tabSize
      )(G) : W(G);
    }
    function W(G) {
      return G === l ? (S.enter(p.codeFencedFenceSequence), B(G)) : L(G);
    }
    function B(G) {
      return G === l ? (D++, S.consume(G), B) : D >= o ? (S.exit(p.codeFencedFenceSequence), we(G) ? Me(S, q, p.whitespace)(G) : q(G)) : L(G);
    }
    function q(G) {
      return G === g.eof || ne(G) ? (S.exit(p.codeFencedFence), I(G)) : L(G);
    }
  }
}
function zf(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    return o === g.eof ? t(o) : (N(ne(o), "expected eol"), e.enter(p.lineEnding), e.consume(o), e.exit(p.lineEnding), a);
  }
  function a(o) {
    return r.parser.lazy[r.now().line] ? t(o) : n(o);
  }
}
const Tr = {
  name: "codeIndented",
  tokenize: Hf
}, Uf = { tokenize: jf, partial: !0 };
function Hf(e, n, t) {
  const r = this;
  return i;
  function i(u) {
    return N(we(u)), e.enter(p.codeIndented), Me(
      e,
      a,
      p.linePrefix,
      Q.tabSize + 1
    )(u);
  }
  function a(u) {
    const c = r.events[r.events.length - 1];
    return c && c[1].type === p.linePrefix && c[2].sliceSerialize(c[1], !0).length >= Q.tabSize ? o(u) : t(u);
  }
  function o(u) {
    return u === g.eof ? s(u) : ne(u) ? e.attempt(Uf, o, s)(u) : (e.enter(p.codeFlowValue), l(u));
  }
  function l(u) {
    return u === g.eof || ne(u) ? (e.exit(p.codeFlowValue), o(u)) : (e.consume(u), l);
  }
  function s(u) {
    return e.exit(p.codeIndented), n(u);
  }
}
function jf(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    return r.parser.lazy[r.now().line] ? t(o) : ne(o) ? (e.enter(p.lineEnding), e.consume(o), e.exit(p.lineEnding), i) : Me(
      e,
      a,
      p.linePrefix,
      Q.tabSize + 1
    )(o);
  }
  function a(o) {
    const l = r.events[r.events.length - 1];
    return l && l[1].type === p.linePrefix && l[2].sliceSerialize(l[1], !0).length >= Q.tabSize ? n(o) : ne(o) ? i(o) : t(o);
  }
}
const qf = {
  name: "codeText",
  tokenize: Gf,
  resolve: Kf,
  previous: ru
};
function Kf(e) {
  let n = e.length - 4, t = 3, r, i;
  if ((e[t][1].type === p.lineEnding || e[t][1].type === "space") && (e[n][1].type === p.lineEnding || e[n][1].type === "space")) {
    for (r = t; ++r < n; )
      if (e[r][1].type === p.codeTextData) {
        e[t][1].type = p.codeTextPadding, e[n][1].type = p.codeTextPadding, t += 2, n -= 2;
        break;
      }
  }
  for (r = t - 1, n++; ++r <= n; )
    i === void 0 ? r !== n && e[r][1].type !== p.lineEnding && (i = r) : (r === n || e[r][1].type === p.lineEnding) && (e[i][1].type = p.codeTextData, r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), n -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function ru(e) {
  return e !== g.graveAccent || this.events[this.events.length - 1][1].type === p.characterEscape;
}
function Gf(e, n, t) {
  const r = this;
  let i = 0, a, o;
  return l;
  function l(f) {
    return N(f === g.graveAccent, "expected `` ` ``"), N(ru.call(r, r.previous), "expected correct previous"), e.enter(p.codeText), e.enter(p.codeTextSequence), s(f);
  }
  function s(f) {
    return f === g.graveAccent ? (e.consume(f), i++, s) : (e.exit(p.codeTextSequence), u(f));
  }
  function u(f) {
    return f === g.eof ? t(f) : f === g.space ? (e.enter("space"), e.consume(f), e.exit("space"), u) : f === g.graveAccent ? (o = e.enter(p.codeTextSequence), a = 0, d(f)) : ne(f) ? (e.enter(p.lineEnding), e.consume(f), e.exit(p.lineEnding), u) : (e.enter(p.codeTextData), c(f));
  }
  function c(f) {
    return f === g.eof || f === g.space || f === g.graveAccent || ne(f) ? (e.exit(p.codeTextData), u(f)) : (e.consume(f), c);
  }
  function d(f) {
    return f === g.graveAccent ? (e.consume(f), a++, d) : a === i ? (e.exit(p.codeTextSequence), e.exit(p.codeText), n(f)) : (o.type = p.codeTextData, c(f));
  }
}
function iu(e) {
  const n = {};
  let t = -1, r, i, a, o, l, s, u;
  for (; ++t < e.length; ) {
    for (; t in n; )
      t = n[t];
    if (r = e[t], t && r[1].type === p.chunkFlow && e[t - 1][1].type === p.listItemPrefix && (N(r[1]._tokenizer, "expected `_tokenizer` on subtokens"), s = r[1]._tokenizer.events, a = 0, a < s.length && s[a][1].type === p.lineEndingBlank && (a += 2), a < s.length && s[a][1].type === p.content))
      for (; ++a < s.length && s[a][1].type !== p.content; )
        s[a][1].type === p.chunkText && (s[a][1]._isInFirstContentOfListItem = !0, a++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(n, Wf(e, t)), t = n[t], u = !0);
    else if (r[1]._container) {
      for (a = t, i = void 0; a-- && (o = e[a], o[1].type === p.lineEnding || o[1].type === p.lineEndingBlank); )
        o[0] === "enter" && (i && (e[i][1].type = p.lineEndingBlank), o[1].type = p.lineEnding, i = a);
      i && (r[1].end = Object.assign({}, e[i][1].start), l = e.slice(i, t), l.unshift(r), kn(e, i, t - i + 1, l));
    }
  }
  return !u;
}
function Wf(e, n) {
  const t = e[n][1], r = e[n][2];
  let i = n - 1;
  const a = [];
  N(t.contentType, "expected `contentType` on subtokens");
  const o = t._tokenizer || r.parser[t.contentType](t.start), l = o.events, s = [], u = {};
  let c, d, f = -1, h = t, v = 0, x = 0;
  const m = [x];
  for (; h; ) {
    for (; e[++i][1] !== h; )
      ;
    N(
      !d || h.previous === d,
      "expected previous to match"
    ), N(!d || d.next === h, "expected next to match"), a.push(i), h._tokenizer || (c = r.sliceStream(h), h.next || c.push(g.eof), d && o.defineSkip(h.start), h._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = !0), o.write(c), h._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = void 0)), d = h, h = h.next;
  }
  for (h = t; ++f < l.length; )
    // Find a void token that includes a break.
    l[f][0] === "exit" && l[f - 1][0] === "enter" && l[f][1].type === l[f - 1][1].type && l[f][1].start.line !== l[f][1].end.line && (N(h, "expected a current token"), x = f + 1, m.push(x), h._tokenizer = void 0, h.previous = void 0, h = h.next);
  for (o.events = [], h ? (h._tokenizer = void 0, h.previous = void 0, N(!h.next, "expected no next token")) : m.pop(), f = m.length; f--; ) {
    const b = l.slice(m[f], m[f + 1]), w = a.pop();
    N(w !== void 0, "expected a start position when splicing"), s.unshift([w, w + b.length - 1]), kn(e, w, 2, b);
  }
  for (f = -1; ++f < s.length; )
    u[v + s[f][0]] = v + s[f][1], v += s[f][1] - s[f][0] - 1;
  return u;
}
const Vf = { tokenize: Xf, resolve: Zf }, Yf = { tokenize: Qf, partial: !0 };
function Zf(e) {
  return iu(e), e;
}
function Xf(e, n) {
  let t;
  return r;
  function r(l) {
    return N(
      l !== g.eof && !ne(l),
      "expected no eof or eol"
    ), e.enter(p.content), t = e.enter(p.chunkContent, {
      contentType: Q.contentTypeContent
    }), i(l);
  }
  function i(l) {
    return l === g.eof ? a(l) : ne(l) ? e.check(
      Yf,
      o,
      a
    )(l) : (e.consume(l), i);
  }
  function a(l) {
    return e.exit(p.chunkContent), e.exit(p.content), n(l);
  }
  function o(l) {
    return N(ne(l), "expected eol"), e.consume(l), e.exit(p.chunkContent), N(t, "expected previous token"), t.next = e.enter(p.chunkContent, {
      contentType: Q.contentTypeContent,
      previous: t
    }), t = t.next, i;
  }
}
function Qf(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    return N(ne(o), "expected a line ending"), e.exit(p.chunkContent), e.enter(p.lineEnding), e.consume(o), e.exit(p.lineEnding), Me(e, a, p.linePrefix);
  }
  function a(o) {
    if (o === g.eof || ne(o))
      return t(o);
    N(
      r.parser.constructs.disable.null,
      "expected `disable.null` to be populated"
    );
    const l = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && l && l[1].type === p.linePrefix && l[2].sliceSerialize(l[1], !0).length >= Q.tabSize ? n(o) : e.interrupt(r.parser.constructs.flow, t, n)(o);
  }
}
function au(e, n, t, r, i, a, o, l, s) {
  const u = s || Number.POSITIVE_INFINITY;
  let c = 0;
  return d;
  function d(b) {
    return b === g.lessThan ? (e.enter(r), e.enter(i), e.enter(a), e.consume(b), e.exit(a), f) : b === g.eof || b === g.space || b === g.rightParenthesis || ei(b) ? t(b) : (e.enter(r), e.enter(o), e.enter(l), e.enter(p.chunkString, { contentType: Q.contentTypeString }), x(b));
  }
  function f(b) {
    return b === g.greaterThan ? (e.enter(a), e.consume(b), e.exit(a), e.exit(i), e.exit(r), n) : (e.enter(l), e.enter(p.chunkString, { contentType: Q.contentTypeString }), h(b));
  }
  function h(b) {
    return b === g.greaterThan ? (e.exit(p.chunkString), e.exit(l), f(b)) : b === g.eof || b === g.lessThan || ne(b) ? t(b) : (e.consume(b), b === g.backslash ? v : h);
  }
  function v(b) {
    return b === g.lessThan || b === g.greaterThan || b === g.backslash ? (e.consume(b), h) : h(b);
  }
  function x(b) {
    return !c && (b === g.eof || b === g.rightParenthesis || on(b)) ? (e.exit(p.chunkString), e.exit(l), e.exit(o), e.exit(r), n(b)) : c < u && b === g.leftParenthesis ? (e.consume(b), c++, x) : b === g.rightParenthesis ? (e.consume(b), c--, x) : b === g.eof || b === g.space || b === g.leftParenthesis || ei(b) ? t(b) : (e.consume(b), b === g.backslash ? m : x);
  }
  function m(b) {
    return b === g.leftParenthesis || b === g.rightParenthesis || b === g.backslash ? (e.consume(b), x) : x(b);
  }
}
function ou(e, n, t, r, i, a) {
  const o = this;
  let l = 0, s;
  return u;
  function u(h) {
    return N(h === g.leftSquareBracket, "expected `[`"), e.enter(r), e.enter(i), e.consume(h), e.exit(i), e.enter(a), c;
  }
  function c(h) {
    return l > Q.linkReferenceSizeMax || h === g.eof || h === g.leftSquareBracket || h === g.rightSquareBracket && !s || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    h === g.caret && !l && "_hiddenFootnoteSupport" in o.parser.constructs ? t(h) : h === g.rightSquareBracket ? (e.exit(a), e.enter(i), e.consume(h), e.exit(i), e.exit(r), n) : ne(h) ? (e.enter(p.lineEnding), e.consume(h), e.exit(p.lineEnding), c) : (e.enter(p.chunkString, { contentType: Q.contentTypeString }), d(h));
  }
  function d(h) {
    return h === g.eof || h === g.leftSquareBracket || h === g.rightSquareBracket || ne(h) || l++ > Q.linkReferenceSizeMax ? (e.exit(p.chunkString), c(h)) : (e.consume(h), s || (s = !we(h)), h === g.backslash ? f : d);
  }
  function f(h) {
    return h === g.leftSquareBracket || h === g.backslash || h === g.rightSquareBracket ? (e.consume(h), l++, d) : d(h);
  }
}
function lu(e, n, t, r, i, a) {
  let o;
  return l;
  function l(f) {
    return f === g.quotationMark || f === g.apostrophe || f === g.leftParenthesis ? (e.enter(r), e.enter(i), e.consume(f), e.exit(i), o = f === g.leftParenthesis ? g.rightParenthesis : f, s) : t(f);
  }
  function s(f) {
    return f === o ? (e.enter(i), e.consume(f), e.exit(i), e.exit(r), n) : (e.enter(a), u(f));
  }
  function u(f) {
    return f === o ? (e.exit(a), s(o)) : f === g.eof ? t(f) : ne(f) ? (e.enter(p.lineEnding), e.consume(f), e.exit(p.lineEnding), Me(e, u, p.linePrefix)) : (e.enter(p.chunkString, { contentType: Q.contentTypeString }), c(f));
  }
  function c(f) {
    return f === o || f === g.eof || ne(f) ? (e.exit(p.chunkString), u(f)) : (e.consume(f), f === g.backslash ? d : c);
  }
  function d(f) {
    return f === o || f === g.backslash ? (e.consume(f), c) : c(f);
  }
}
function vt(e, n) {
  let t;
  return r;
  function r(i) {
    return ne(i) ? (e.enter(p.lineEnding), e.consume(i), e.exit(p.lineEnding), t = !0, r) : we(i) ? Me(
      e,
      r,
      t ? p.linePrefix : p.lineSuffix
    )(i) : n(i);
  }
}
const En = (
  /** @type {const} */
  {
    ht: "	",
    lf: `
`,
    cr: "\r",
    space: " ",
    exclamationMark: "!",
    quotationMark: '"',
    numberSign: "#",
    dollarSign: "$",
    percentSign: "%",
    ampersand: "&",
    apostrophe: "'",
    leftParenthesis: "(",
    rightParenthesis: ")",
    asterisk: "*",
    plusSign: "+",
    comma: ",",
    dash: "-",
    dot: ".",
    slash: "/",
    digit0: "0",
    digit1: "1",
    digit2: "2",
    digit3: "3",
    digit4: "4",
    digit5: "5",
    digit6: "6",
    digit7: "7",
    digit8: "8",
    digit9: "9",
    colon: ":",
    semicolon: ";",
    lessThan: "<",
    equalsTo: "=",
    greaterThan: ">",
    questionMark: "?",
    atSign: "@",
    uppercaseA: "A",
    uppercaseB: "B",
    uppercaseC: "C",
    uppercaseD: "D",
    uppercaseE: "E",
    uppercaseF: "F",
    uppercaseG: "G",
    uppercaseH: "H",
    uppercaseI: "I",
    uppercaseJ: "J",
    uppercaseK: "K",
    uppercaseL: "L",
    uppercaseM: "M",
    uppercaseN: "N",
    uppercaseO: "O",
    uppercaseP: "P",
    uppercaseQ: "Q",
    uppercaseR: "R",
    uppercaseS: "S",
    uppercaseT: "T",
    uppercaseU: "U",
    uppercaseV: "V",
    uppercaseW: "W",
    uppercaseX: "X",
    uppercaseY: "Y",
    uppercaseZ: "Z",
    leftSquareBracket: "[",
    backslash: "\\",
    rightSquareBracket: "]",
    caret: "^",
    underscore: "_",
    graveAccent: "`",
    lowercaseA: "a",
    lowercaseB: "b",
    lowercaseC: "c",
    lowercaseD: "d",
    lowercaseE: "e",
    lowercaseF: "f",
    lowercaseG: "g",
    lowercaseH: "h",
    lowercaseI: "i",
    lowercaseJ: "j",
    lowercaseK: "k",
    lowercaseL: "l",
    lowercaseM: "m",
    lowercaseN: "n",
    lowercaseO: "o",
    lowercaseP: "p",
    lowercaseQ: "q",
    lowercaseR: "r",
    lowercaseS: "s",
    lowercaseT: "t",
    lowercaseU: "u",
    lowercaseV: "v",
    lowercaseW: "w",
    lowercaseX: "x",
    lowercaseY: "y",
    lowercaseZ: "z",
    leftCurlyBrace: "{",
    verticalBar: "|",
    rightCurlyBrace: "}",
    tilde: "~",
    replacementCharacter: "�"
  }
);
function st(e) {
  return e.replace(/[\t\n\r ]+/g, En.space).replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const Jf = { name: "definition", tokenize: ng }, eg = { tokenize: tg, partial: !0 };
function ng(e, n, t) {
  const r = this;
  let i;
  return a;
  function a(h) {
    return e.enter(p.definition), o(h);
  }
  function o(h) {
    return N(h === g.leftSquareBracket, "expected `[`"), ou.call(
      r,
      e,
      l,
      // Note: we don’t need to reset the way `markdown-rs` does.
      t,
      p.definitionLabel,
      p.definitionLabelMarker,
      p.definitionLabelString
    )(h);
  }
  function l(h) {
    return i = st(
      r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)
    ), h === g.colon ? (e.enter(p.definitionMarker), e.consume(h), e.exit(p.definitionMarker), s) : t(h);
  }
  function s(h) {
    return on(h) ? vt(e, u)(h) : u(h);
  }
  function u(h) {
    return au(
      e,
      c,
      // Note: we don’t need to reset the way `markdown-rs` does.
      t,
      p.definitionDestination,
      p.definitionDestinationLiteral,
      p.definitionDestinationLiteralMarker,
      p.definitionDestinationRaw,
      p.definitionDestinationString
    )(h);
  }
  function c(h) {
    return e.attempt(eg, d, d)(h);
  }
  function d(h) {
    return we(h) ? Me(e, f, p.whitespace)(h) : f(h);
  }
  function f(h) {
    return h === g.eof || ne(h) ? (e.exit(p.definition), r.parser.defined.push(i), n(h)) : t(h);
  }
}
function tg(e, n, t) {
  return r;
  function r(l) {
    return on(l) ? vt(e, i)(l) : t(l);
  }
  function i(l) {
    return lu(
      e,
      a,
      t,
      p.definitionTitle,
      p.definitionTitleMarker,
      p.definitionTitleString
    )(l);
  }
  function a(l) {
    return we(l) ? Me(
      e,
      o,
      p.whitespace
    )(l) : o(l);
  }
  function o(l) {
    return l === g.eof || ne(l) ? n(l) : t(l);
  }
}
const rg = {
  name: "hardBreakEscape",
  tokenize: ig
};
function ig(e, n, t) {
  return r;
  function r(a) {
    return N(a === g.backslash, "expected `\\`"), e.enter(p.hardBreakEscape), e.consume(a), i;
  }
  function i(a) {
    return ne(a) ? (e.exit(p.hardBreakEscape), n(a)) : t(a);
  }
}
const ag = {
  name: "headingAtx",
  tokenize: lg,
  resolve: og
};
function og(e, n) {
  let t = e.length - 2, r = 3, i, a;
  return e[r][1].type === p.whitespace && (r += 2), t - 2 > r && e[t][1].type === p.whitespace && (t -= 2), e[t][1].type === p.atxHeadingSequence && (r === t - 1 || t - 4 > r && e[t - 2][1].type === p.whitespace) && (t -= r + 1 === t ? 2 : 4), t > r && (i = {
    type: p.atxHeadingText,
    start: e[r][1].start,
    end: e[t][1].end
  }, a = {
    type: p.chunkText,
    start: e[r][1].start,
    end: e[t][1].end,
    contentType: Q.contentTypeText
  }, kn(e, r, t - r + 1, [
    ["enter", i, n],
    ["enter", a, n],
    ["exit", a, n],
    ["exit", i, n]
  ])), e;
}
function lg(e, n, t) {
  let r = 0;
  return i;
  function i(c) {
    return e.enter(p.atxHeading), a(c);
  }
  function a(c) {
    return N(c === g.numberSign, "expected `#`"), e.enter(p.atxHeadingSequence), o(c);
  }
  function o(c) {
    return c === g.numberSign && r++ < Q.atxHeadingOpeningFenceSizeMax ? (e.consume(c), o) : c === g.eof || on(c) ? (e.exit(p.atxHeadingSequence), l(c)) : t(c);
  }
  function l(c) {
    return c === g.numberSign ? (e.enter(p.atxHeadingSequence), s(c)) : c === g.eof || ne(c) ? (e.exit(p.atxHeading), n(c)) : we(c) ? Me(e, l, p.whitespace)(c) : (e.enter(p.atxHeadingText), u(c));
  }
  function s(c) {
    return c === g.numberSign ? (e.consume(c), s) : (e.exit(p.atxHeadingSequence), l(c));
  }
  function u(c) {
    return c === g.eof || c === g.numberSign || on(c) ? (e.exit(p.atxHeadingText), l(c)) : (e.consume(c), u);
  }
}
const sg = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], qa = ["pre", "script", "style", "textarea"], cg = {
  name: "htmlFlow",
  tokenize: fg,
  resolveTo: pg,
  concrete: !0
}, ug = { tokenize: hg, partial: !0 }, dg = {
  tokenize: gg,
  partial: !0
};
function pg(e) {
  let n = e.length;
  for (; n-- && !(e[n][0] === "enter" && e[n][1].type === p.htmlFlow); )
    ;
  return n > 1 && e[n - 2][1].type === p.linePrefix && (e[n][1].start = e[n - 2][1].start, e[n + 1][1].start = e[n - 2][1].start, e.splice(n - 2, 2)), e;
}
function fg(e, n, t) {
  const r = this;
  let i, a, o, l, s;
  return u;
  function u(y) {
    return c(y);
  }
  function c(y) {
    return N(y === g.lessThan, "expected `<`"), e.enter(p.htmlFlow), e.enter(p.htmlFlowData), e.consume(y), d;
  }
  function d(y) {
    return y === g.exclamationMark ? (e.consume(y), f) : y === g.slash ? (e.consume(y), a = !0, x) : y === g.questionMark ? (e.consume(y), i = Q.htmlInstruction, r.interrupt ? n : E) : vn(y) ? (e.consume(y), o = String.fromCharCode(y), m) : t(y);
  }
  function f(y) {
    return y === g.dash ? (e.consume(y), i = Q.htmlComment, h) : y === g.leftSquareBracket ? (e.consume(y), i = Q.htmlCdata, l = 0, v) : vn(y) ? (e.consume(y), i = Q.htmlDeclaration, r.interrupt ? n : E) : t(y);
  }
  function h(y) {
    return y === g.dash ? (e.consume(y), r.interrupt ? n : E) : t(y);
  }
  function v(y) {
    const z = Q.cdataOpeningString;
    return y === z.charCodeAt(l++) ? (e.consume(y), l === z.length ? r.interrupt ? n : W : v) : t(y);
  }
  function x(y) {
    return vn(y) ? (e.consume(y), o = String.fromCharCode(y), m) : t(y);
  }
  function m(y) {
    if (y === g.eof || y === g.slash || y === g.greaterThan || on(y)) {
      const z = y === g.slash, V = o.toLowerCase();
      return !z && !a && qa.includes(V) ? (i = Q.htmlRaw, r.interrupt ? n(y) : W(y)) : sg.includes(o.toLowerCase()) ? (i = Q.htmlBasic, z ? (e.consume(y), b) : r.interrupt ? n(y) : W(y)) : (i = Q.htmlComplete, r.interrupt && !r.parser.lazy[r.now().line] ? t(y) : a ? w(y) : _(y));
    }
    return y === g.dash || un(y) ? (e.consume(y), o += String.fromCharCode(y), m) : t(y);
  }
  function b(y) {
    return y === g.greaterThan ? (e.consume(y), r.interrupt ? n : W) : t(y);
  }
  function w(y) {
    return we(y) ? (e.consume(y), w) : Y(y);
  }
  function _(y) {
    return y === g.slash ? (e.consume(y), Y) : y === g.colon || y === g.underscore || vn(y) ? (e.consume(y), C) : we(y) ? (e.consume(y), _) : Y(y);
  }
  function C(y) {
    return y === g.dash || y === g.dot || y === g.colon || y === g.underscore || un(y) ? (e.consume(y), C) : M(y);
  }
  function M(y) {
    return y === g.equalsTo ? (e.consume(y), S) : we(y) ? (e.consume(y), M) : _(y);
  }
  function S(y) {
    return y === g.eof || y === g.lessThan || y === g.equalsTo || y === g.greaterThan || y === g.graveAccent ? t(y) : y === g.quotationMark || y === g.apostrophe ? (e.consume(y), s = y, I) : we(y) ? (e.consume(y), S) : L(y);
  }
  function I(y) {
    return y === s ? (e.consume(y), s = null, D) : y === g.eof || ne(y) ? t(y) : (e.consume(y), I);
  }
  function L(y) {
    return y === g.eof || y === g.quotationMark || y === g.apostrophe || y === g.slash || y === g.lessThan || y === g.equalsTo || y === g.greaterThan || y === g.graveAccent || on(y) ? M(y) : (e.consume(y), L);
  }
  function D(y) {
    return y === g.slash || y === g.greaterThan || we(y) ? _(y) : t(y);
  }
  function Y(y) {
    return y === g.greaterThan ? (e.consume(y), J) : t(y);
  }
  function J(y) {
    return y === g.eof || ne(y) ? W(y) : we(y) ? (e.consume(y), J) : t(y);
  }
  function W(y) {
    return y === g.dash && i === Q.htmlComment ? (e.consume(y), T) : y === g.lessThan && i === Q.htmlRaw ? (e.consume(y), P) : y === g.greaterThan && i === Q.htmlDeclaration ? (e.consume(y), ue) : y === g.questionMark && i === Q.htmlInstruction ? (e.consume(y), E) : y === g.rightSquareBracket && i === Q.htmlCdata ? (e.consume(y), j) : ne(y) && (i === Q.htmlBasic || i === Q.htmlComplete) ? (e.exit(p.htmlFlowData), e.check(
      ug,
      Z,
      B
    )(y)) : y === g.eof || ne(y) ? (e.exit(p.htmlFlowData), B(y)) : (e.consume(y), W);
  }
  function B(y) {
    return e.check(
      dg,
      q,
      Z
    )(y);
  }
  function q(y) {
    return N(ne(y)), e.enter(p.lineEnding), e.consume(y), e.exit(p.lineEnding), G;
  }
  function G(y) {
    return y === g.eof || ne(y) ? B(y) : (e.enter(p.htmlFlowData), W(y));
  }
  function T(y) {
    return y === g.dash ? (e.consume(y), E) : W(y);
  }
  function P(y) {
    return y === g.slash ? (e.consume(y), o = "", $) : W(y);
  }
  function $(y) {
    if (y === g.greaterThan) {
      const z = o.toLowerCase();
      return qa.includes(z) ? (e.consume(y), ue) : W(y);
    }
    return vn(y) && o.length < Q.htmlRawSizeMax ? (e.consume(y), o += String.fromCharCode(y), $) : W(y);
  }
  function j(y) {
    return y === g.rightSquareBracket ? (e.consume(y), E) : W(y);
  }
  function E(y) {
    return y === g.greaterThan ? (e.consume(y), ue) : y === g.dash && i === Q.htmlComment ? (e.consume(y), E) : W(y);
  }
  function ue(y) {
    return y === g.eof || ne(y) ? (e.exit(p.htmlFlowData), Z(y)) : (e.consume(y), ue);
  }
  function Z(y) {
    return e.exit(p.htmlFlow), n(y);
  }
}
function gg(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    return ne(o) ? (e.enter(p.lineEnding), e.consume(o), e.exit(p.lineEnding), a) : t(o);
  }
  function a(o) {
    return r.parser.lazy[r.now().line] ? t(o) : n(o);
  }
}
function hg(e, n, t) {
  return r;
  function r(i) {
    return N(ne(i), "expected a line ending"), e.enter(p.lineEnding), e.consume(i), e.exit(p.lineEnding), e.attempt(pr, n, t);
  }
}
const mg = { name: "htmlText", tokenize: bg };
function bg(e, n, t) {
  const r = this;
  let i, a, o;
  return l;
  function l(E) {
    return N(E === g.lessThan, "expected `<`"), e.enter(p.htmlText), e.enter(p.htmlTextData), e.consume(E), s;
  }
  function s(E) {
    return E === g.exclamationMark ? (e.consume(E), u) : E === g.slash ? (e.consume(E), M) : E === g.questionMark ? (e.consume(E), _) : vn(E) ? (e.consume(E), L) : t(E);
  }
  function u(E) {
    return E === g.dash ? (e.consume(E), c) : E === g.leftSquareBracket ? (e.consume(E), a = 0, v) : vn(E) ? (e.consume(E), w) : t(E);
  }
  function c(E) {
    return E === g.dash ? (e.consume(E), h) : t(E);
  }
  function d(E) {
    return E === g.eof ? t(E) : E === g.dash ? (e.consume(E), f) : ne(E) ? (o = d, P(E)) : (e.consume(E), d);
  }
  function f(E) {
    return E === g.dash ? (e.consume(E), h) : d(E);
  }
  function h(E) {
    return E === g.greaterThan ? T(E) : E === g.dash ? f(E) : d(E);
  }
  function v(E) {
    const ue = Q.cdataOpeningString;
    return E === ue.charCodeAt(a++) ? (e.consume(E), a === ue.length ? x : v) : t(E);
  }
  function x(E) {
    return E === g.eof ? t(E) : E === g.rightSquareBracket ? (e.consume(E), m) : ne(E) ? (o = x, P(E)) : (e.consume(E), x);
  }
  function m(E) {
    return E === g.rightSquareBracket ? (e.consume(E), b) : x(E);
  }
  function b(E) {
    return E === g.greaterThan ? T(E) : E === g.rightSquareBracket ? (e.consume(E), b) : x(E);
  }
  function w(E) {
    return E === g.eof || E === g.greaterThan ? T(E) : ne(E) ? (o = w, P(E)) : (e.consume(E), w);
  }
  function _(E) {
    return E === g.eof ? t(E) : E === g.questionMark ? (e.consume(E), C) : ne(E) ? (o = _, P(E)) : (e.consume(E), _);
  }
  function C(E) {
    return E === g.greaterThan ? T(E) : _(E);
  }
  function M(E) {
    return vn(E) ? (e.consume(E), S) : t(E);
  }
  function S(E) {
    return E === g.dash || un(E) ? (e.consume(E), S) : I(E);
  }
  function I(E) {
    return ne(E) ? (o = I, P(E)) : we(E) ? (e.consume(E), I) : T(E);
  }
  function L(E) {
    return E === g.dash || un(E) ? (e.consume(E), L) : E === g.slash || E === g.greaterThan || on(E) ? D(E) : t(E);
  }
  function D(E) {
    return E === g.slash ? (e.consume(E), T) : E === g.colon || E === g.underscore || vn(E) ? (e.consume(E), Y) : ne(E) ? (o = D, P(E)) : we(E) ? (e.consume(E), D) : T(E);
  }
  function Y(E) {
    return E === g.dash || E === g.dot || E === g.colon || E === g.underscore || un(E) ? (e.consume(E), Y) : J(E);
  }
  function J(E) {
    return E === g.equalsTo ? (e.consume(E), W) : ne(E) ? (o = J, P(E)) : we(E) ? (e.consume(E), J) : D(E);
  }
  function W(E) {
    return E === g.eof || E === g.lessThan || E === g.equalsTo || E === g.greaterThan || E === g.graveAccent ? t(E) : E === g.quotationMark || E === g.apostrophe ? (e.consume(E), i = E, B) : ne(E) ? (o = W, P(E)) : we(E) ? (e.consume(E), W) : (e.consume(E), q);
  }
  function B(E) {
    return E === i ? (e.consume(E), i = void 0, G) : E === g.eof ? t(E) : ne(E) ? (o = B, P(E)) : (e.consume(E), B);
  }
  function q(E) {
    return E === g.eof || E === g.quotationMark || E === g.apostrophe || E === g.lessThan || E === g.equalsTo || E === g.graveAccent ? t(E) : E === g.slash || E === g.greaterThan || on(E) ? D(E) : (e.consume(E), q);
  }
  function G(E) {
    return E === g.slash || E === g.greaterThan || on(E) ? D(E) : t(E);
  }
  function T(E) {
    return E === g.greaterThan ? (e.consume(E), e.exit(p.htmlTextData), e.exit(p.htmlText), n) : t(E);
  }
  function P(E) {
    return N(o, "expected return state"), N(ne(E), "expected eol"), e.exit(p.htmlTextData), e.enter(p.lineEnding), e.consume(E), e.exit(p.lineEnding), $;
  }
  function $(E) {
    return N(
      r.parser.constructs.disable.null,
      "expected `disable.null` to be populated"
    ), we(E) ? Me(
      e,
      j,
      p.linePrefix,
      r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : Q.tabSize
    )(E) : j(E);
  }
  function j(E) {
    return e.enter(p.htmlTextData), o(E);
  }
}
const Oi = {
  name: "labelEnd",
  tokenize: wg,
  resolveTo: _g,
  resolveAll: vg
}, yg = { tokenize: Sg }, Eg = { tokenize: kg }, xg = { tokenize: Ng };
function vg(e) {
  let n = -1;
  for (; ++n < e.length; ) {
    const t = e[n][1];
    (t.type === p.labelImage || t.type === p.labelLink || t.type === p.labelEnd) && (e.splice(n + 1, t.type === p.labelImage ? 4 : 2), t.type = p.data, n++);
  }
  return e;
}
function _g(e, n) {
  let t = e.length, r = 0, i, a, o, l;
  for (; t--; )
    if (i = e[t][1], a) {
      if (i.type === p.link || i.type === p.labelLink && i._inactive)
        break;
      e[t][0] === "enter" && i.type === p.labelLink && (i._inactive = !0);
    } else if (o) {
      if (e[t][0] === "enter" && (i.type === p.labelImage || i.type === p.labelLink) && !i._balanced && (a = t, i.type !== p.labelLink)) {
        r = 2;
        break;
      }
    } else
      i.type === p.labelEnd && (o = t);
  N(a !== void 0, "`open` is supposed to be found"), N(o !== void 0, "`close` is supposed to be found");
  const s = {
    type: e[a][1].type === p.labelLink ? p.link : p.image,
    start: Object.assign({}, e[a][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, u = {
    type: p.label,
    start: Object.assign({}, e[a][1].start),
    end: Object.assign({}, e[o][1].end)
  }, c = {
    type: p.labelText,
    start: Object.assign({}, e[a + r + 2][1].end),
    end: Object.assign({}, e[o - 2][1].start)
  };
  return l = [
    ["enter", s, n],
    ["enter", u, n]
  ], l = pn(l, e.slice(a + 1, a + r + 3)), l = pn(l, [["enter", c, n]]), N(
    n.parser.constructs.insideSpan.null,
    "expected `insideSpan.null` to be populated"
  ), l = pn(
    l,
    ki(
      n.parser.constructs.insideSpan.null,
      e.slice(a + r + 4, o - 3),
      n
    )
  ), l = pn(l, [
    ["exit", c, n],
    e[o - 2],
    e[o - 1],
    ["exit", u, n]
  ]), l = pn(l, e.slice(o + 1)), l = pn(l, [["exit", s, n]]), kn(e, a, e.length, l), e;
}
function wg(e, n, t) {
  const r = this;
  let i = r.events.length, a, o;
  for (; i--; )
    if ((r.events[i][1].type === p.labelImage || r.events[i][1].type === p.labelLink) && !r.events[i][1]._balanced) {
      a = r.events[i][1];
      break;
    }
  return l;
  function l(f) {
    return N(f === g.rightSquareBracket, "expected `]`"), a ? a._inactive ? d(f) : (o = r.parser.defined.includes(
      st(
        r.sliceSerialize({ start: a.end, end: r.now() })
      )
    ), e.enter(p.labelEnd), e.enter(p.labelMarker), e.consume(f), e.exit(p.labelMarker), e.exit(p.labelEnd), s) : t(f);
  }
  function s(f) {
    return f === g.leftParenthesis ? e.attempt(
      yg,
      c,
      o ? c : d
    )(f) : f === g.leftSquareBracket ? e.attempt(
      Eg,
      c,
      o ? u : d
    )(f) : o ? c(f) : d(f);
  }
  function u(f) {
    return e.attempt(
      xg,
      c,
      d
    )(f);
  }
  function c(f) {
    return n(f);
  }
  function d(f) {
    return a._balanced = !0, t(f);
  }
}
function Sg(e, n, t) {
  return r;
  function r(d) {
    return N(d === g.leftParenthesis, "expected left paren"), e.enter(p.resource), e.enter(p.resourceMarker), e.consume(d), e.exit(p.resourceMarker), i;
  }
  function i(d) {
    return on(d) ? vt(e, a)(d) : a(d);
  }
  function a(d) {
    return d === g.rightParenthesis ? c(d) : au(
      e,
      o,
      l,
      p.resourceDestination,
      p.resourceDestinationLiteral,
      p.resourceDestinationLiteralMarker,
      p.resourceDestinationRaw,
      p.resourceDestinationString,
      Q.linkResourceDestinationBalanceMax
    )(d);
  }
  function o(d) {
    return on(d) ? vt(e, s)(d) : c(d);
  }
  function l(d) {
    return t(d);
  }
  function s(d) {
    return d === g.quotationMark || d === g.apostrophe || d === g.leftParenthesis ? lu(
      e,
      u,
      t,
      p.resourceTitle,
      p.resourceTitleMarker,
      p.resourceTitleString
    )(d) : c(d);
  }
  function u(d) {
    return on(d) ? vt(e, c)(d) : c(d);
  }
  function c(d) {
    return d === g.rightParenthesis ? (e.enter(p.resourceMarker), e.consume(d), e.exit(p.resourceMarker), e.exit(p.resource), n) : t(d);
  }
}
function kg(e, n, t) {
  const r = this;
  return i;
  function i(l) {
    return N(l === g.leftSquareBracket, "expected left bracket"), ou.call(
      r,
      e,
      a,
      o,
      p.reference,
      p.referenceMarker,
      p.referenceString
    )(l);
  }
  function a(l) {
    return r.parser.defined.includes(
      st(
        r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)
      )
    ) ? n(l) : t(l);
  }
  function o(l) {
    return t(l);
  }
}
function Ng(e, n, t) {
  return r;
  function r(a) {
    return N(a === g.leftSquareBracket, "expected left bracket"), e.enter(p.reference), e.enter(p.referenceMarker), e.consume(a), e.exit(p.referenceMarker), i;
  }
  function i(a) {
    return a === g.rightSquareBracket ? (e.enter(p.referenceMarker), e.consume(a), e.exit(p.referenceMarker), e.exit(p.reference), n) : t(a);
  }
}
const Og = {
  name: "labelStartImage",
  tokenize: Cg,
  resolveAll: Oi.resolveAll
};
function Cg(e, n, t) {
  const r = this;
  return i;
  function i(l) {
    return N(l === g.exclamationMark, "expected `!`"), e.enter(p.labelImage), e.enter(p.labelImageMarker), e.consume(l), e.exit(p.labelImageMarker), a;
  }
  function a(l) {
    return l === g.leftSquareBracket ? (e.enter(p.labelMarker), e.consume(l), e.exit(p.labelMarker), e.exit(p.labelImage), o) : t(l);
  }
  function o(l) {
    return l === g.caret && "_hiddenFootnoteSupport" in r.parser.constructs ? t(l) : n(l);
  }
}
const Tg = {
  name: "labelStartLink",
  tokenize: Ag,
  resolveAll: Oi.resolveAll
};
function Ag(e, n, t) {
  const r = this;
  return i;
  function i(o) {
    return N(o === g.leftSquareBracket, "expected `[`"), e.enter(p.labelLink), e.enter(p.labelMarker), e.consume(o), e.exit(p.labelMarker), e.exit(p.labelLink), a;
  }
  function a(o) {
    return o === g.caret && "_hiddenFootnoteSupport" in r.parser.constructs ? t(o) : n(o);
  }
}
const Ar = { name: "lineEnding", tokenize: Mg };
function Mg(e, n) {
  return t;
  function t(r) {
    return N(ne(r), "expected eol"), e.enter(p.lineEnding), e.consume(r), e.exit(p.lineEnding), Me(e, n, p.linePrefix);
  }
}
const Zt = {
  name: "thematicBreak",
  tokenize: Ig
};
function Ig(e, n, t) {
  let r = 0, i;
  return a;
  function a(u) {
    return e.enter(p.thematicBreak), o(u);
  }
  function o(u) {
    return N(
      u === g.asterisk || u === g.dash || u === g.underscore,
      "expected `*`, `-`, or `_`"
    ), i = u, l(u);
  }
  function l(u) {
    return u === i ? (e.enter(p.thematicBreakSequence), s(u)) : r >= Q.thematicBreakMarkerCountMin && (u === g.eof || ne(u)) ? (e.exit(p.thematicBreak), n(u)) : t(u);
  }
  function s(u) {
    return u === i ? (e.consume(u), r++, s) : (e.exit(p.thematicBreakSequence), we(u) ? Me(e, l, p.whitespace)(u) : l(u));
  }
}
const nn = {
  name: "list",
  tokenize: Lg,
  continuation: { tokenize: Pg },
  exit: Fg
}, Rg = {
  tokenize: $g,
  partial: !0
}, Dg = { tokenize: Bg, partial: !0 };
function Lg(e, n, t) {
  const r = this, i = r.events[r.events.length - 1];
  let a = i && i[1].type === p.linePrefix ? i[2].sliceSerialize(i[1], !0).length : 0, o = 0;
  return l;
  function l(h) {
    N(r.containerState, "expected state");
    const v = r.containerState.type || (h === g.asterisk || h === g.plusSign || h === g.dash ? p.listUnordered : p.listOrdered);
    if (v === p.listUnordered ? !r.containerState.marker || h === r.containerState.marker : ni(h)) {
      if (r.containerState.type || (r.containerState.type = v, e.enter(v, { _container: !0 })), v === p.listUnordered)
        return e.enter(p.listItemPrefix), h === g.asterisk || h === g.dash ? e.check(Zt, t, u)(h) : u(h);
      if (!r.interrupt || h === g.digit1)
        return e.enter(p.listItemPrefix), e.enter(p.listItemValue), s(h);
    }
    return t(h);
  }
  function s(h) {
    return N(r.containerState, "expected state"), ni(h) && ++o < Q.listItemValueSizeMax ? (e.consume(h), s) : (!r.interrupt || o < 2) && (r.containerState.marker ? h === r.containerState.marker : h === g.rightParenthesis || h === g.dot) ? (e.exit(p.listItemValue), u(h)) : t(h);
  }
  function u(h) {
    return N(r.containerState, "expected state"), N(h !== g.eof, "eof (`null`) is not a marker"), e.enter(p.listItemMarker), e.consume(h), e.exit(p.listItemMarker), r.containerState.marker = r.containerState.marker || h, e.check(
      pr,
      // Can’t be empty when interrupting.
      r.interrupt ? t : c,
      e.attempt(
        Rg,
        f,
        d
      )
    );
  }
  function c(h) {
    return N(r.containerState, "expected state"), r.containerState.initialBlankLine = !0, a++, f(h);
  }
  function d(h) {
    return we(h) ? (e.enter(p.listItemPrefixWhitespace), e.consume(h), e.exit(p.listItemPrefixWhitespace), f) : t(h);
  }
  function f(h) {
    return N(r.containerState, "expected state"), r.containerState.size = a + r.sliceSerialize(e.exit(p.listItemPrefix), !0).length, n(h);
  }
}
function Pg(e, n, t) {
  const r = this;
  return N(r.containerState, "expected state"), r.containerState._closeFlow = void 0, e.check(pr, i, a);
  function i(l) {
    return N(r.containerState, "expected state"), N(typeof r.containerState.size == "number", "expected size"), r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, Me(
      e,
      n,
      p.listItemIndent,
      r.containerState.size + 1
    )(l);
  }
  function a(l) {
    return N(r.containerState, "expected state"), r.containerState.furtherBlankLines || !we(l) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, o(l)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(Dg, n, o)(l));
  }
  function o(l) {
    return N(r.containerState, "expected state"), r.containerState._closeFlow = !0, r.interrupt = void 0, N(
      r.parser.constructs.disable.null,
      "expected `disable.null` to be populated"
    ), Me(
      e,
      e.attempt(nn, n, t),
      p.linePrefix,
      r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : Q.tabSize
    )(l);
  }
}
function Bg(e, n, t) {
  const r = this;
  return N(r.containerState, "expected state"), N(typeof r.containerState.size == "number", "expected size"), Me(
    e,
    i,
    p.listItemIndent,
    r.containerState.size + 1
  );
  function i(a) {
    N(r.containerState, "expected state");
    const o = r.events[r.events.length - 1];
    return o && o[1].type === p.listItemIndent && o[2].sliceSerialize(o[1], !0).length === r.containerState.size ? n(a) : t(a);
  }
}
function Fg(e) {
  N(this.containerState, "expected state"), N(typeof this.containerState.type == "string", "expected type"), e.exit(this.containerState.type);
}
function $g(e, n, t) {
  const r = this;
  return N(
    r.parser.constructs.disable.null,
    "expected `disable.null` to be populated"
  ), Me(
    e,
    i,
    p.listItemPrefixWhitespace,
    r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : Q.tabSize + 1
  );
  function i(a) {
    const o = r.events[r.events.length - 1];
    return !we(a) && o && o[1].type === p.listItemPrefixWhitespace ? n(a) : t(a);
  }
}
const Ka = {
  name: "setextUnderline",
  tokenize: Ug,
  resolveTo: zg
};
function zg(e, n) {
  let t = e.length, r, i, a;
  for (; t--; )
    if (e[t][0] === "enter") {
      if (e[t][1].type === p.content) {
        r = t;
        break;
      }
      e[t][1].type === p.paragraph && (i = t);
    } else
      e[t][1].type === p.content && e.splice(t, 1), !a && e[t][1].type === p.definition && (a = t);
  N(i !== void 0, "expected a `text` index to be found"), N(r !== void 0, "expected a `text` index to be found");
  const o = {
    type: p.setextHeading,
    start: Object.assign({}, e[i][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  };
  return e[i][1].type = p.setextHeadingText, a ? (e.splice(i, 0, ["enter", o, n]), e.splice(a + 1, 0, ["exit", e[r][1], n]), e[r][1].end = Object.assign({}, e[a][1].end)) : e[r][1] = o, e.push(["exit", o, n]), e;
}
function Ug(e, n, t) {
  const r = this;
  let i;
  return a;
  function a(u) {
    let c = r.events.length, d;
    for (N(
      u === g.dash || u === g.equalsTo,
      "expected `=` or `-`"
    ); c--; )
      if (r.events[c][1].type !== p.lineEnding && r.events[c][1].type !== p.linePrefix && r.events[c][1].type !== p.content) {
        d = r.events[c][1].type === p.paragraph;
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || d) ? (e.enter(p.setextHeadingLine), i = u, o(u)) : t(u);
  }
  function o(u) {
    return e.enter(p.setextHeadingLineSequence), l(u);
  }
  function l(u) {
    return u === i ? (e.consume(u), l) : (e.exit(p.setextHeadingLineSequence), we(u) ? Me(e, s, p.lineSuffix)(u) : s(u));
  }
  function s(u) {
    return u === g.eof || ne(u) ? (e.exit(p.setextHeadingLine), n(u)) : t(u);
  }
}
const Hg = { tokenize: jg };
function jg(e) {
  const n = this, t = e.attempt(
    // Try to parse a blank line.
    pr,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(
      this.parser.constructs.flowInitial,
      i,
      Me(
        e,
        e.attempt(
          this.parser.constructs.flow,
          i,
          e.attempt(Vf, i)
        ),
        p.linePrefix
      )
    )
  );
  return t;
  function r(a) {
    if (N(
      a === g.eof || ne(a),
      "expected eol or eof"
    ), a === g.eof) {
      e.consume(a);
      return;
    }
    return e.enter(p.lineEndingBlank), e.consume(a), e.exit(p.lineEndingBlank), n.currentConstruct = void 0, t;
  }
  function i(a) {
    if (N(
      a === g.eof || ne(a),
      "expected eol or eof"
    ), a === g.eof) {
      e.consume(a);
      return;
    }
    return e.enter(p.lineEnding), e.consume(a), e.exit(p.lineEnding), n.currentConstruct = void 0, t;
  }
}
const qg = { resolveAll: cu() }, Kg = su("string"), Gg = su("text");
function su(e) {
  return {
    tokenize: n,
    resolveAll: cu(
      e === "text" ? Wg : void 0
    )
  };
  function n(t) {
    const r = this, i = this.parser.constructs[e], a = t.attempt(i, o, l);
    return o;
    function o(c) {
      return u(c) ? a(c) : l(c);
    }
    function l(c) {
      if (c === g.eof) {
        t.consume(c);
        return;
      }
      return t.enter(p.data), t.consume(c), s;
    }
    function s(c) {
      return u(c) ? (t.exit(p.data), a(c)) : (t.consume(c), s);
    }
    function u(c) {
      if (c === g.eof)
        return !0;
      const d = i[c];
      let f = -1;
      if (d)
        for (N(Array.isArray(d), "expected `disable.null` to be populated"); ++f < d.length; ) {
          const h = d[f];
          if (!h.previous || h.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function cu(e) {
  return n;
  function n(t, r) {
    let i = -1, a;
    for (; ++i <= t.length; )
      a === void 0 ? t[i] && t[i][1].type === p.data && (a = i, i++) : (!t[i] || t[i][1].type !== p.data) && (i !== a + 2 && (t[a][1].end = t[i - 1][1].end, t.splice(a + 2, i - a - 2), i = a + 2), a = void 0);
    return e ? e(t, r) : t;
  }
}
function Wg(e, n) {
  let t = 0;
  for (; ++t <= e.length; )
    if ((t === e.length || e[t][1].type === p.lineEnding) && e[t - 1][1].type === p.data) {
      const r = e[t - 1][1], i = n.sliceStream(r);
      let a = i.length, o = -1, l = 0, s;
      for (; a--; ) {
        const u = i[a];
        if (typeof u == "string") {
          for (o = u.length; u.charCodeAt(o - 1) === g.space; )
            l++, o--;
          if (o)
            break;
          o = -1;
        } else if (u === g.horizontalTab)
          s = !0, l++;
        else if (u !== g.virtualSpace) {
          a++;
          break;
        }
      }
      if (l) {
        const u = {
          type: t === e.length || s || l < Q.hardBreakPrefixSizeMin ? p.lineSuffix : p.hardBreakTrailing,
          start: {
            line: r.end.line,
            column: r.end.column - l,
            offset: r.end.offset - l,
            _index: r.start._index + a,
            _bufferIndex: a ? o : r.start._bufferIndex + o
          },
          end: Object.assign({}, r.end)
        };
        r.end = Object.assign({}, u.start), r.start.offset === r.end.offset ? Object.assign(r, u) : (e.splice(
          t,
          0,
          ["enter", u, n],
          ["exit", u, n]
        ), t += 2);
      }
      t++;
    }
  return e;
}
var ri = { exports: {} }, Mr, Ga;
function Vg() {
  if (Ga)
    return Mr;
  Ga = 1;
  var e = 1e3, n = e * 60, t = n * 60, r = t * 24, i = r * 7, a = r * 365.25;
  Mr = function(c, d) {
    d = d || {};
    var f = typeof c;
    if (f === "string" && c.length > 0)
      return o(c);
    if (f === "number" && isFinite(c))
      return d.long ? s(c) : l(c);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(c)
    );
  };
  function o(c) {
    if (c = String(c), !(c.length > 100)) {
      var d = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        c
      );
      if (d) {
        var f = parseFloat(d[1]), h = (d[2] || "ms").toLowerCase();
        switch (h) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return f * a;
          case "weeks":
          case "week":
          case "w":
            return f * i;
          case "days":
          case "day":
          case "d":
            return f * r;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return f * t;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return f * n;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return f * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return f;
          default:
            return;
        }
      }
    }
  }
  function l(c) {
    var d = Math.abs(c);
    return d >= r ? Math.round(c / r) + "d" : d >= t ? Math.round(c / t) + "h" : d >= n ? Math.round(c / n) + "m" : d >= e ? Math.round(c / e) + "s" : c + "ms";
  }
  function s(c) {
    var d = Math.abs(c);
    return d >= r ? u(c, d, r, "day") : d >= t ? u(c, d, t, "hour") : d >= n ? u(c, d, n, "minute") : d >= e ? u(c, d, e, "second") : c + " ms";
  }
  function u(c, d, f, h) {
    var v = d >= f * 1.5;
    return Math.round(c / f) + " " + h + (v ? "s" : "");
  }
  return Mr;
}
function Yg(e) {
  t.debug = t, t.default = t, t.coerce = s, t.disable = o, t.enable = i, t.enabled = l, t.humanize = Vg(), t.destroy = u, Object.keys(e).forEach((c) => {
    t[c] = e[c];
  }), t.names = [], t.skips = [], t.formatters = {};
  function n(c) {
    let d = 0;
    for (let f = 0; f < c.length; f++)
      d = (d << 5) - d + c.charCodeAt(f), d |= 0;
    return t.colors[Math.abs(d) % t.colors.length];
  }
  t.selectColor = n;
  function t(c) {
    let d, f = null, h, v;
    function x(...m) {
      if (!x.enabled)
        return;
      const b = x, w = Number(/* @__PURE__ */ new Date()), _ = w - (d || w);
      b.diff = _, b.prev = d, b.curr = w, d = w, m[0] = t.coerce(m[0]), typeof m[0] != "string" && m.unshift("%O");
      let C = 0;
      m[0] = m[0].replace(/%([a-zA-Z%])/g, (S, I) => {
        if (S === "%%")
          return "%";
        C++;
        const L = t.formatters[I];
        if (typeof L == "function") {
          const D = m[C];
          S = L.call(b, D), m.splice(C, 1), C--;
        }
        return S;
      }), t.formatArgs.call(b, m), (b.log || t.log).apply(b, m);
    }
    return x.namespace = c, x.useColors = t.useColors(), x.color = t.selectColor(c), x.extend = r, x.destroy = t.destroy, Object.defineProperty(x, "enabled", {
      enumerable: !0,
      configurable: !1,
      get: () => f !== null ? f : (h !== t.namespaces && (h = t.namespaces, v = t.enabled(c)), v),
      set: (m) => {
        f = m;
      }
    }), typeof t.init == "function" && t.init(x), x;
  }
  function r(c, d) {
    const f = t(this.namespace + (typeof d > "u" ? ":" : d) + c);
    return f.log = this.log, f;
  }
  function i(c) {
    t.save(c), t.namespaces = c, t.names = [], t.skips = [];
    const d = (typeof c == "string" ? c : "").trim().replace(" ", ",").split(",").filter(Boolean);
    for (const f of d)
      f[0] === "-" ? t.skips.push(f.slice(1)) : t.names.push(f);
  }
  function a(c, d) {
    let f = 0, h = 0, v = -1, x = 0;
    for (; f < c.length; )
      if (h < d.length && (d[h] === c[f] || d[h] === "*"))
        d[h] === "*" ? (v = h, x = f, h++) : (f++, h++);
      else if (v !== -1)
        h = v + 1, x++, f = x;
      else
        return !1;
    for (; h < d.length && d[h] === "*"; )
      h++;
    return h === d.length;
  }
  function o() {
    const c = [
      ...t.names,
      ...t.skips.map((d) => "-" + d)
    ].join(",");
    return t.enable(""), c;
  }
  function l(c) {
    for (const d of t.skips)
      if (a(c, d))
        return !1;
    for (const d of t.names)
      if (a(c, d))
        return !0;
    return !1;
  }
  function s(c) {
    return c instanceof Error ? c.stack || c.message : c;
  }
  function u() {
    console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
  }
  return t.enable(t.load()), t;
}
var Zg = Yg;
(function(e, n) {
  n.formatArgs = r, n.save = i, n.load = a, n.useColors = t, n.storage = o(), n.destroy = (() => {
    let s = !1;
    return () => {
      s || (s = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
    };
  })(), n.colors = [
    "#0000CC",
    "#0000FF",
    "#0033CC",
    "#0033FF",
    "#0066CC",
    "#0066FF",
    "#0099CC",
    "#0099FF",
    "#00CC00",
    "#00CC33",
    "#00CC66",
    "#00CC99",
    "#00CCCC",
    "#00CCFF",
    "#3300CC",
    "#3300FF",
    "#3333CC",
    "#3333FF",
    "#3366CC",
    "#3366FF",
    "#3399CC",
    "#3399FF",
    "#33CC00",
    "#33CC33",
    "#33CC66",
    "#33CC99",
    "#33CCCC",
    "#33CCFF",
    "#6600CC",
    "#6600FF",
    "#6633CC",
    "#6633FF",
    "#66CC00",
    "#66CC33",
    "#9900CC",
    "#9900FF",
    "#9933CC",
    "#9933FF",
    "#99CC00",
    "#99CC33",
    "#CC0000",
    "#CC0033",
    "#CC0066",
    "#CC0099",
    "#CC00CC",
    "#CC00FF",
    "#CC3300",
    "#CC3333",
    "#CC3366",
    "#CC3399",
    "#CC33CC",
    "#CC33FF",
    "#CC6600",
    "#CC6633",
    "#CC9900",
    "#CC9933",
    "#CCCC00",
    "#CCCC33",
    "#FF0000",
    "#FF0033",
    "#FF0066",
    "#FF0099",
    "#FF00CC",
    "#FF00FF",
    "#FF3300",
    "#FF3333",
    "#FF3366",
    "#FF3399",
    "#FF33CC",
    "#FF33FF",
    "#FF6600",
    "#FF6633",
    "#FF9900",
    "#FF9933",
    "#FFCC00",
    "#FFCC33"
  ];
  function t() {
    if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
      return !0;
    if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
      return !1;
    let s;
    return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
    typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    typeof navigator < "u" && navigator.userAgent && (s = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(s[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
    typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
  }
  function r(s) {
    if (s[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + s[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
      return;
    const u = "color: " + this.color;
    s.splice(1, 0, u, "color: inherit");
    let c = 0, d = 0;
    s[0].replace(/%[a-zA-Z%]/g, (f) => {
      f !== "%%" && (c++, f === "%c" && (d = c));
    }), s.splice(d, 0, u);
  }
  n.log = console.debug || console.log || (() => {
  });
  function i(s) {
    try {
      s ? n.storage.setItem("debug", s) : n.storage.removeItem("debug");
    } catch {
    }
  }
  function a() {
    let s;
    try {
      s = n.storage.getItem("debug");
    } catch {
    }
    return !s && typeof Wn < "u" && "env" in Wn && (s = Wn.env.DEBUG), s;
  }
  function o() {
    try {
      return localStorage;
    } catch {
    }
  }
  e.exports = Zg(n);
  const { formatters: l } = e.exports;
  l.j = function(s) {
    try {
      return JSON.stringify(s);
    } catch (u) {
      return "[UnexpectedJSONParseError]: " + u.message;
    }
  };
})(ri, ri.exports);
var Xg = ri.exports;
const Qg = /* @__PURE__ */ dn(Xg), jn = Qg("micromark");
function Jg(e, n, t) {
  let r = Object.assign(
    t ? Object.assign({}, t) : { line: 1, column: 1, offset: 0 },
    { _index: 0, _bufferIndex: -1 }
  );
  const i = {}, a = [];
  let o = [], l = [], s = !0;
  const u = {
    consume: C,
    enter: M,
    exit: S,
    attempt: D(I),
    check: D(L),
    interrupt: D(L, { interrupt: !0 })
  }, c = {
    previous: g.eof,
    code: g.eof,
    containerState: {},
    events: [],
    parser: e,
    sliceStream: x,
    sliceSerialize: v,
    now: m,
    defineSkip: b,
    write: h
  };
  let d = n.tokenize.call(c, u), f;
  return n.resolveAll && a.push(n), c;
  function h(B) {
    return o = pn(o, B), w(), o[o.length - 1] !== g.eof ? [] : (Y(n, 0), c.events = ki(a, c.events, c), c.events);
  }
  function v(B, q) {
    return nh(x(B), q);
  }
  function x(B) {
    return eh(o, B);
  }
  function m() {
    const { line: B, column: q, offset: G, _index: T, _bufferIndex: P } = r;
    return { line: B, column: q, offset: G, _index: T, _bufferIndex: P };
  }
  function b(B) {
    i[B.line] = B.column, W(), jn("position: define skip: `%j`", r);
  }
  function w() {
    let B;
    for (; r._index < o.length; ) {
      const q = o[r._index];
      if (typeof q == "string")
        for (B = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === B && r._bufferIndex < q.length; )
          _(q.charCodeAt(r._bufferIndex));
      else
        _(q);
    }
  }
  function _(B) {
    N(s === !0, "expected character to be consumed"), s = void 0, jn("main: passing `%s` to %s", B, d && d.name), f = B, N(typeof d == "function", "expected state"), d = d(B);
  }
  function C(B) {
    N(B === f, "expected given code to equal expected code"), jn("consume: `%s`", B), N(
      s === void 0,
      "expected code to not have been consumed: this might be because `return x(code)` instead of `return x` was used"
    ), N(
      B === null ? c.events.length === 0 || c.events[c.events.length - 1][0] === "exit" : c.events[c.events.length - 1][0] === "enter",
      "expected last token to be open"
    ), ne(B) ? (r.line++, r.column = 1, r.offset += B === g.carriageReturnLineFeed ? 2 : 1, W(), jn("position: after eol: `%j`", r)) : B !== g.virtualSpace && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === o[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = B, s = !0;
  }
  function M(B, q) {
    const G = q || {};
    return G.type = B, G.start = m(), N(typeof B == "string", "expected string type"), N(B.length > 0, "expected non-empty string"), jn("enter: `%s`", B), c.events.push(["enter", G, c]), l.push(G), G;
  }
  function S(B) {
    N(typeof B == "string", "expected string type"), N(B.length > 0, "expected non-empty string");
    const q = l.pop();
    return N(q, "cannot close w/o open tokens"), q.end = m(), N(B === q.type, "expected exit token to match current token"), N(
      !(q.start._index === q.end._index && q.start._bufferIndex === q.end._bufferIndex),
      "expected non-empty token (`" + B + "`)"
    ), jn("exit: `%s`", q.type), c.events.push(["exit", q, c]), q;
  }
  function I(B, q) {
    Y(B, q.from);
  }
  function L(B, q) {
    q.restore();
  }
  function D(B, q) {
    return G;
    function G(T, P, $) {
      let j, E, ue, Z;
      return Array.isArray(T) ? (
        /* c8 ignore next 1 */
        z(T)
      ) : "tokenize" in T ? (
        // @ts-expect-error Looks like a construct.
        z([T])
      ) : y(T);
      function y(de) {
        return pe;
        function pe(Oe) {
          const Be = Oe !== null && de[Oe], Re = Oe !== null && de.null, ln = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(Be) ? Be : Be ? [Be] : [],
            ...Array.isArray(Re) ? Re : Re ? [Re] : []
          ];
          return z(ln)(Oe);
        }
      }
      function z(de) {
        return j = de, E = 0, de.length === 0 ? (N($, "expected `bogusState` to be given"), $) : V(de[E]);
      }
      function V(de) {
        return pe;
        function pe(Oe) {
          return Z = J(), ue = de, de.partial || (c.currentConstruct = de), N(
            c.parser.constructs.disable.null,
            "expected `disable.null` to be populated"
          ), de.name && c.parser.constructs.disable.null.includes(de.name) ? ie(Oe) : de.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            q ? Object.assign(Object.create(c), q) : c,
            u,
            te,
            ie
          )(Oe);
        }
      }
      function te(de) {
        return N(de === f, "expected code"), s = !0, B(ue, Z), P;
      }
      function ie(de) {
        return N(de === f, "expected code"), s = !0, Z.restore(), ++E < j.length ? V(j[E]) : $;
      }
    }
  }
  function Y(B, q) {
    B.resolveAll && !a.includes(B) && a.push(B), B.resolve && kn(
      c.events,
      q,
      c.events.length - q,
      B.resolve(c.events.slice(q), c)
    ), B.resolveTo && (c.events = B.resolveTo(c.events, c)), N(
      B.partial || c.events.length === 0 || c.events[c.events.length - 1][0] === "exit",
      "expected last token to end"
    );
  }
  function J() {
    const B = m(), q = c.previous, G = c.currentConstruct, T = c.events.length, P = Array.from(l);
    return { restore: $, from: T };
    function $() {
      r = B, c.previous = q, c.currentConstruct = G, c.events.length = T, l = P, W(), jn("position: restore: `%j`", r);
    }
  }
  function W() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function eh(e, n) {
  const t = n.start._index, r = n.start._bufferIndex, i = n.end._index, a = n.end._bufferIndex;
  let o;
  if (t === i)
    N(a > -1, "expected non-negative end buffer index"), N(r > -1, "expected non-negative start buffer index"), o = [e[t].slice(r, a)];
  else {
    if (o = e.slice(t, i), r > -1) {
      const l = o[0];
      typeof l == "string" ? o[0] = l.slice(r) : (N(r === 0, "expected `startBufferIndex` to be `0`"), o.shift());
    }
    a > 0 && o.push(e[i].slice(0, a));
  }
  return o;
}
function nh(e, n) {
  let t = -1;
  const r = [];
  let i;
  for (; ++t < e.length; ) {
    const a = e[t];
    let o;
    if (typeof a == "string")
      o = a;
    else
      switch (a) {
        case g.carriageReturn: {
          o = En.cr;
          break;
        }
        case g.lineFeed: {
          o = En.lf;
          break;
        }
        case g.carriageReturnLineFeed: {
          o = En.cr + En.lf;
          break;
        }
        case g.horizontalTab: {
          o = n ? En.space : En.ht;
          break;
        }
        case g.virtualSpace: {
          if (!n && i)
            continue;
          o = En.space;
          break;
        }
        default:
          N(typeof a == "number", "expected number"), o = String.fromCharCode(a);
      }
    i = a === g.horizontalTab, r.push(o);
  }
  return r.join("");
}
const th = {
  [g.asterisk]: nn,
  [g.plusSign]: nn,
  [g.dash]: nn,
  [g.digit0]: nn,
  [g.digit1]: nn,
  [g.digit2]: nn,
  [g.digit3]: nn,
  [g.digit4]: nn,
  [g.digit5]: nn,
  [g.digit6]: nn,
  [g.digit7]: nn,
  [g.digit8]: nn,
  [g.digit9]: nn,
  [g.greaterThan]: eu
}, rh = {
  [g.leftSquareBracket]: Jf
}, ih = {
  [g.horizontalTab]: Tr,
  [g.virtualSpace]: Tr,
  [g.space]: Tr
}, ah = {
  [g.numberSign]: ag,
  [g.asterisk]: Zt,
  [g.dash]: [Ka, Zt],
  [g.lessThan]: cg,
  [g.equalsTo]: Ka,
  [g.underscore]: Zt,
  [g.graveAccent]: ja,
  [g.tilde]: ja
}, oh = {
  [g.ampersand]: tu,
  [g.backslash]: nu
}, lh = {
  [g.carriageReturn]: Ar,
  [g.lineFeed]: Ar,
  [g.carriageReturnLineFeed]: Ar,
  [g.exclamationMark]: Og,
  [g.ampersand]: tu,
  [g.asterisk]: ti,
  [g.lessThan]: [Mf, mg],
  [g.leftSquareBracket]: Tg,
  [g.backslash]: [rg, nu],
  [g.rightSquareBracket]: Oi,
  [g.underscore]: ti,
  [g.graveAccent]: qf
}, sh = { null: [ti, qg] }, ch = { null: [g.asterisk, g.underscore] }, uh = { null: [] }, dh = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: ch,
  contentInitial: rh,
  disable: uh,
  document: th,
  flow: ah,
  flowInitial: ih,
  insideSpan: sh,
  string: oh,
  text: lh
}, Symbol.toStringTag, { value: "Module" }));
function ph(e) {
  const t = (
    /** @type {FullNormalizedExtension} */
    hf([dh, ...(e || {}).extensions || []])
  ), r = {
    defined: [],
    lazy: {},
    constructs: t,
    content: i(Sf),
    document: i(Nf),
    flow: i(Hg),
    string: i(Kg),
    text: i(Gg)
  };
  return r;
  function i(a) {
    return o;
    function o(l) {
      return Jg(r, a, l);
    }
  }
}
const Wa = /[\0\t\n\r]/g;
function fh() {
  let e = 1, n = "", t = !0, r;
  return i;
  function i(a, o, l) {
    const s = [];
    let u, c, d, f, h;
    for (a = n + a.toString(o), d = 0, n = "", t && (a.charCodeAt(0) === g.byteOrderMarker && d++, t = void 0); d < a.length; ) {
      if (Wa.lastIndex = d, u = Wa.exec(a), f = u && u.index !== void 0 ? u.index : a.length, h = a.charCodeAt(f), !u) {
        n = a.slice(d);
        break;
      }
      if (h === g.lf && d === f && r)
        s.push(g.carriageReturnLineFeed), r = void 0;
      else
        switch (r && (s.push(g.carriageReturn), r = void 0), d < f && (s.push(a.slice(d, f)), e += f - d), h) {
          case g.nul: {
            s.push(g.replacementCharacter), e++;
            break;
          }
          case g.ht: {
            for (c = Math.ceil(e / Q.tabSize) * Q.tabSize, s.push(g.horizontalTab); e++ < c; )
              s.push(g.virtualSpace);
            break;
          }
          case g.lf: {
            s.push(g.lineFeed), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      d = f + 1;
    }
    return l && (r && s.push(g.carriageReturn), n && s.push(n), s.push(g.eof)), s;
  }
}
function gh(e) {
  for (; !iu(e); )
    ;
  return e;
}
function uu(e, n) {
  const t = Number.parseInt(e, n);
  return (
    // C0 except for HT, LF, FF, CR, space.
    t < g.ht || t === g.vt || t > g.cr && t < g.space || // Control character (DEL) of C0, and C1 controls.
    t > g.tilde && t < 160 || // Lone high surrogates and low surrogates.
    t > 55295 && t < 57344 || // Noncharacters.
    t > 64975 && t < 65008 || /* eslint-disable no-bitwise */
    (t & 65535) === 65535 || (t & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    t > 1114111 ? En.replacementCharacter : String.fromCharCode(t)
  );
}
const hh = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function mh(e) {
  return e.replace(hh, bh);
}
function bh(e, n, t) {
  if (n)
    return n;
  if (t.charCodeAt(0) === g.numberSign) {
    const i = t.charCodeAt(1), a = i === g.lowercaseX || i === g.uppercaseX;
    return uu(
      t.slice(a ? 2 : 1),
      a ? Q.numericBaseHexadecimal : Q.numericBaseDecimal
    );
  }
  return Ni(t) || e;
}
const du = {}.hasOwnProperty, yh = (
  /**
   * @type {(
   *   ((value: Value, encoding: Encoding, options?: Options | null | undefined) => Root) &
   *   ((value: Value, options?: Options | null | undefined) => Root)
   * )}
   */
  /**
   * @param {Value} value
   * @param {Encoding | Options | null | undefined} [encoding]
   * @param {Options | null | undefined} [options]
   * @returns {Root}
   */
  function(e, n, t) {
    return typeof n != "string" && (t = n, n = void 0), Eh(t)(
      gh(
        ph(t).document().write(fh()(e, n, !0))
      )
    );
  }
);
function Eh(e) {
  const n = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: l(oe),
      autolinkProtocol: J,
      autolinkEmail: J,
      atxHeading: l(Ne),
      blockQuote: l(Be),
      characterEscape: J,
      characterReference: J,
      codeFenced: l(Re),
      codeFencedFenceInfo: s,
      codeFencedFenceMeta: s,
      codeIndented: l(Re, s),
      codeText: l(ln, s),
      codeTextData: J,
      data: J,
      codeFlowValue: J,
      definition: l(We),
      definitionDestinationString: s,
      definitionLabelString: s,
      definitionTitleString: s,
      emphasis: l(Je),
      hardBreakEscape: l(ee),
      hardBreakTrailing: l(ee),
      htmlFlow: l(He, s),
      htmlFlowData: J,
      htmlText: l(He, s),
      htmlTextData: J,
      image: l(ye),
      label: s,
      link: l(oe),
      listItem: l(ze),
      listItemValue: v,
      listOrdered: l(fe, h),
      listUnordered: l(fe),
      paragraph: l(bn),
      reference: V,
      referenceString: s,
      resourceDestinationString: s,
      resourceTitleString: s,
      setextHeading: l(Ne),
      strong: l(je),
      thematicBreak: l(X)
    },
    exit: {
      atxHeading: c(),
      atxHeadingSequence: I,
      autolink: c(),
      autolinkEmail: Oe,
      autolinkProtocol: pe,
      blockQuote: c(),
      characterEscapeValue: W,
      characterReferenceMarkerHexadecimal: ie,
      characterReferenceMarkerNumeric: ie,
      characterReferenceValue: de,
      codeFenced: c(w),
      codeFencedFence: b,
      codeFencedFenceInfo: x,
      codeFencedFenceMeta: m,
      codeFlowValue: W,
      codeIndented: c(_),
      codeText: c(P),
      codeTextData: W,
      data: W,
      definition: c(),
      definitionDestinationString: S,
      definitionLabelString: C,
      definitionTitleString: M,
      emphasis: c(),
      hardBreakEscape: c(q),
      hardBreakTrailing: c(q),
      htmlFlow: c(G),
      htmlFlowData: W,
      htmlText: c(T),
      htmlTextData: W,
      image: c(j),
      label: ue,
      labelText: E,
      lineEnding: B,
      link: c($),
      listItem: c(),
      listOrdered: c(),
      listUnordered: c(),
      paragraph: c(),
      referenceString: te,
      resourceDestinationString: Z,
      resourceTitleString: y,
      resource: z,
      setextHeading: c(Y),
      setextHeadingLineSequence: D,
      setextHeadingText: L,
      strong: c(),
      thematicBreak: c()
    }
  };
  pu(n, (e || {}).mdastExtensions || []);
  const t = {};
  return r;
  function r(k) {
    let O = { type: "root", children: [] };
    const F = {
      stack: [O],
      tokenStack: [],
      config: n,
      enter: u,
      exit: d,
      buffer: s,
      resume: f,
      setData: a,
      getData: o
    }, ae = [];
    let le = -1;
    for (; ++le < k.length; )
      if (k[le][1].type === p.listOrdered || k[le][1].type === p.listUnordered)
        if (k[le][0] === "enter")
          ae.push(le);
        else {
          const Ee = ae.pop();
          N(typeof Ee == "number", "expected list ot be open"), le = i(k, Ee, le);
        }
    for (le = -1; ++le < k.length; ) {
      const Ee = n[k[le][0]];
      du.call(Ee, k[le][1].type) && Ee[k[le][1].type].call(
        Object.assign(
          { sliceSerialize: k[le][2].sliceSerialize },
          F
        ),
        k[le][1]
      );
    }
    if (F.tokenStack.length > 0) {
      const Ee = F.tokenStack[F.tokenStack.length - 1];
      (Ee[1] || Va).call(F, void 0, Ee[0]);
    }
    for (O.position = {
      start: Rn(
        k.length > 0 ? k[0][1].start : { line: 1, column: 1, offset: 0 }
      ),
      end: Rn(
        k.length > 0 ? k[k.length - 2][1].end : { line: 1, column: 1, offset: 0 }
      )
    }, le = -1; ++le < n.transforms.length; )
      O = n.transforms[le](O) || O;
    return O;
  }
  function i(k, O, F) {
    let ae = O - 1, le = -1, Ee = !1, Le, Pe, Ve, Xe;
    for (; ++ae <= F; ) {
      const De = k[ae];
      if (De[1].type === p.listUnordered || De[1].type === p.listOrdered || De[1].type === p.blockQuote ? (De[0] === "enter" ? le++ : le--, Xe = void 0) : De[1].type === p.lineEndingBlank ? De[0] === "enter" && (Le && !Xe && !le && !Ve && (Ve = ae), Xe = void 0) : De[1].type === p.linePrefix || De[1].type === p.listItemValue || De[1].type === p.listItemMarker || De[1].type === p.listItemPrefix || De[1].type === p.listItemPrefixWhitespace || (Xe = void 0), !le && De[0] === "enter" && De[1].type === p.listItemPrefix || le === -1 && De[0] === "exit" && (De[1].type === p.listUnordered || De[1].type === p.listOrdered)) {
        if (Le) {
          let Ue = ae;
          for (Pe = void 0; Ue--; ) {
            const Ze = k[Ue];
            if (Ze[1].type === p.lineEnding || Ze[1].type === p.lineEndingBlank) {
              if (Ze[0] === "exit")
                continue;
              Pe && (k[Pe][1].type = p.lineEndingBlank, Ee = !0), Ze[1].type = p.lineEnding, Pe = Ue;
            } else if (!(Ze[1].type === p.linePrefix || Ze[1].type === p.blockQuotePrefix || Ze[1].type === p.blockQuotePrefixWhitespace || Ze[1].type === p.blockQuoteMarker || Ze[1].type === p.listItemIndent))
              break;
          }
          Ve && (!Pe || Ve < Pe) && (Le._spread = !0), Le.end = Object.assign(
            {},
            Pe ? k[Pe][1].start : De[1].end
          ), k.splice(Pe || ae, 0, ["exit", Le, De[2]]), ae++, F++;
        }
        De[1].type === p.listItemPrefix && (Le = {
          type: "listItem",
          _spread: !1,
          start: Object.assign({}, De[1].start),
          // @ts-expect-error: we’ll add `end` in a second.
          end: void 0
        }, k.splice(ae, 0, ["enter", Le, De[2]]), ae++, F++, Ve = void 0, Xe = !0);
      }
    }
    return k[O][1]._spread = Ee, F;
  }
  function a(k, O) {
    t[k] = O;
  }
  function o(k) {
    return t[k];
  }
  function l(k, O) {
    return F;
    function F(ae) {
      u.call(this, k(ae), ae), O && O.call(this, ae);
    }
  }
  function s() {
    this.stack.push({ type: "fragment", children: [] });
  }
  function u(k, O, F) {
    const ae = this.stack[this.stack.length - 1];
    return N(ae, "expected `parent`"), N("children" in ae, "expected `parent`"), ae.children.push(k), this.stack.push(k), this.tokenStack.push([O, F]), k.position = { start: Rn(O.start) }, k;
  }
  function c(k) {
    return O;
    function O(F) {
      k && k.call(this, F), d.call(this, F);
    }
  }
  function d(k, O) {
    const F = this.stack.pop();
    N(F, "expected `node`");
    const ae = this.tokenStack.pop();
    if (ae)
      ae[0].type !== k.type && (O ? O.call(this, k, ae[0]) : (ae[1] || Va).call(this, k, ae[0]));
    else
      throw new Error(
        "Cannot close `" + k.type + "` (" + Et({ start: k.start, end: k.end }) + "): it’s not open"
      );
    return N(F.type !== "fragment", "unexpected fragment `exit`ed"), N(F.position, "expected `position` to be defined"), F.position.end = Rn(k.end), F;
  }
  function f() {
    return ff(this.stack.pop());
  }
  function h() {
    a("expectingFirstListItemValue", !0);
  }
  function v(k) {
    if (o("expectingFirstListItemValue")) {
      const O = this.stack[this.stack.length - 2];
      N(O, "expected nodes on stack"), N(O.type === "list", "expected list on stack"), O.start = Number.parseInt(
        this.sliceSerialize(k),
        Q.numericBaseDecimal
      ), a("expectingFirstListItemValue");
    }
  }
  function x() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "code", "expected code on stack"), O.lang = k;
  }
  function m() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "code", "expected code on stack"), O.meta = k;
  }
  function b() {
    o("flowCodeInside") || (this.buffer(), a("flowCodeInside", !0));
  }
  function w() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "code", "expected code on stack"), O.value = k.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), a("flowCodeInside");
  }
  function _() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "code", "expected code on stack"), O.value = k.replace(/(\r?\n|\r)$/g, "");
  }
  function C(k) {
    const O = this.resume(), F = this.stack[this.stack.length - 1];
    N(F, "expected node on stack"), N(F.type === "definition", "expected definition on stack"), F.label = O, F.identifier = st(
      this.sliceSerialize(k)
    ).toLowerCase();
  }
  function M() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "definition", "expected definition on stack"), O.title = k;
  }
  function S() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "definition", "expected definition on stack"), O.url = k;
  }
  function I(k) {
    const O = this.stack[this.stack.length - 1];
    if (N(O, "expected node on stack"), N(O.type === "heading", "expected heading on stack"), !O.depth) {
      const F = this.sliceSerialize(k).length;
      N(
        F === 1 || F === 2 || F === 3 || F === 4 || F === 5 || F === 6,
        "expected `depth` between `1` and `6`"
      ), O.depth = F;
    }
  }
  function L() {
    a("setextHeadingSlurpLineEnding", !0);
  }
  function D(k) {
    const O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "heading", "expected heading on stack"), O.depth = this.sliceSerialize(k).charCodeAt(0) === g.equalsTo ? 1 : 2;
  }
  function Y() {
    a("setextHeadingSlurpLineEnding");
  }
  function J(k) {
    const O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N("children" in O, "expected parent on stack");
    let F = O.children[O.children.length - 1];
    (!F || F.type !== "text") && (F = K(), F.position = { start: Rn(k.start) }, O.children.push(F)), this.stack.push(F);
  }
  function W(k) {
    const O = this.stack.pop();
    N(O, "expected a `node` to be on the stack"), N("value" in O, "expected a `literal` to be on the stack"), N(O.position, "expected `node` to have an open position"), O.value += this.sliceSerialize(k), O.position.end = Rn(k.end);
  }
  function B(k) {
    const O = this.stack[this.stack.length - 1];
    if (N(O, "expected `node`"), o("atHardBreak")) {
      N("children" in O, "expected `parent`");
      const F = O.children[O.children.length - 1];
      N(F.position, "expected tail to have a starting position"), F.position.end = Rn(k.end), a("atHardBreak");
      return;
    }
    !o("setextHeadingSlurpLineEnding") && n.canContainEols.includes(O.type) && (J.call(this, k), W.call(this, k));
  }
  function q() {
    a("atHardBreak", !0);
  }
  function G() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "html", "expected html on stack"), O.value = k;
  }
  function T() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "html", "expected html on stack"), O.value = k;
  }
  function P() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "inlineCode", "expected inline code on stack"), O.value = k;
  }
  function $() {
    const k = this.stack[this.stack.length - 1];
    if (N(k, "expected node on stack"), N(k.type === "link", "expected link on stack"), o("inReference")) {
      const O = o("referenceType") || "shortcut";
      k.type += "Reference", k.referenceType = O, delete k.url, delete k.title;
    } else
      delete k.identifier, delete k.label;
    a("referenceType");
  }
  function j() {
    const k = this.stack[this.stack.length - 1];
    if (N(k, "expected node on stack"), N(k.type === "image", "expected image on stack"), o("inReference")) {
      const O = o("referenceType") || "shortcut";
      k.type += "Reference", k.referenceType = O, delete k.url, delete k.title;
    } else
      delete k.identifier, delete k.label;
    a("referenceType");
  }
  function E(k) {
    const O = this.sliceSerialize(k), F = this.stack[this.stack.length - 2];
    N(F, "expected ancestor on stack"), N(
      F.type === "image" || F.type === "link",
      "expected image or link on stack"
    ), F.label = mh(O), F.identifier = st(O).toLowerCase();
  }
  function ue() {
    const k = this.stack[this.stack.length - 1];
    N(k, "expected node on stack"), N(k.type === "fragment", "expected fragment on stack");
    const O = this.resume(), F = this.stack[this.stack.length - 1];
    if (N(F, "expected node on stack"), N(
      F.type === "image" || F.type === "link",
      "expected image or link on stack"
    ), a("inReference", !0), F.type === "link") {
      const ae = k.children;
      F.children = ae;
    } else
      F.alt = O;
  }
  function Z() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(
      O.type === "image" || O.type === "link",
      "expected image or link on stack"
    ), O.url = k;
  }
  function y() {
    const k = this.resume(), O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(
      O.type === "image" || O.type === "link",
      "expected image or link on stack"
    ), O.title = k;
  }
  function z() {
    a("inReference");
  }
  function V() {
    a("referenceType", "collapsed");
  }
  function te(k) {
    const O = this.resume(), F = this.stack[this.stack.length - 1];
    N(F, "expected node on stack"), N(
      F.type === "image" || F.type === "link",
      "expected image reference or link reference on stack"
    ), F.label = O, F.identifier = st(
      this.sliceSerialize(k)
    ).toLowerCase(), a("referenceType", "full");
  }
  function ie(k) {
    N(
      k.type === "characterReferenceMarkerNumeric" || k.type === "characterReferenceMarkerHexadecimal"
    ), a("characterReferenceType", k.type);
  }
  function de(k) {
    const O = this.sliceSerialize(k), F = o("characterReferenceType");
    let ae;
    if (F)
      ae = uu(
        O,
        F === p.characterReferenceMarkerNumeric ? Q.numericBaseDecimal : Q.numericBaseHexadecimal
      ), a("characterReferenceType");
    else {
      const Ee = Ni(O);
      N(Ee !== !1, "expected reference to decode"), ae = Ee;
    }
    const le = this.stack.pop();
    N(le, "expected `node`"), N(le.position, "expected `node.position`"), N("value" in le, "expected `node.value`"), le.value += ae, le.position.end = Rn(k.end);
  }
  function pe(k) {
    W.call(this, k);
    const O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "link", "expected link on stack"), O.url = this.sliceSerialize(k);
  }
  function Oe(k) {
    W.call(this, k);
    const O = this.stack[this.stack.length - 1];
    N(O, "expected node on stack"), N(O.type === "link", "expected link on stack"), O.url = "mailto:" + this.sliceSerialize(k);
  }
  function Be() {
    return { type: "blockquote", children: [] };
  }
  function Re() {
    return { type: "code", lang: null, meta: null, value: "" };
  }
  function ln() {
    return { type: "inlineCode", value: "" };
  }
  function We() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function Je() {
    return { type: "emphasis", children: [] };
  }
  function Ne() {
    return { type: "heading", depth: void 0, children: [] };
  }
  function ee() {
    return { type: "break" };
  }
  function He() {
    return { type: "html", value: "" };
  }
  function ye() {
    return { type: "image", title: null, url: "", alt: null };
  }
  function oe() {
    return { type: "link", title: null, url: "", children: [] };
  }
  function fe(k) {
    return {
      type: "list",
      ordered: k.type === "listOrdered",
      start: null,
      spread: k._spread,
      children: []
    };
  }
  function ze(k) {
    return {
      type: "listItem",
      spread: k._spread,
      checked: null,
      children: []
    };
  }
  function bn() {
    return { type: "paragraph", children: [] };
  }
  function je() {
    return { type: "strong", children: [] };
  }
  function K() {
    return { type: "text", value: "" };
  }
  function X() {
    return { type: "thematicBreak" };
  }
}
function Rn(e) {
  return { line: e.line, column: e.column, offset: e.offset };
}
function pu(e, n) {
  let t = -1;
  for (; ++t < n.length; ) {
    const r = n[t];
    Array.isArray(r) ? pu(e, r) : xh(e, r);
  }
}
function xh(e, n) {
  let t;
  for (t in n)
    if (du.call(n, t)) {
      if (t === "canContainEols") {
        const r = n[t];
        r && e[t].push(...r);
      } else if (t === "transforms") {
        const r = n[t];
        r && e[t].push(...r);
      } else if (t === "enter" || t === "exit") {
        const r = n[t];
        r && Object.assign(e[t], r);
      }
    }
}
function Va(e, n) {
  throw e ? new Error(
    "Cannot close `" + e.type + "` (" + Et({ start: e.start, end: e.end }) + "): a different token (`" + n.type + "`, " + Et({ start: n.start, end: n.end }) + ") is open"
  ) : new Error(
    "Cannot close document, a token (`" + n.type + "`, " + Et({ start: n.start, end: n.end }) + ") is still open"
  );
}
function vh(e) {
  Object.assign(this, { Parser: (t) => {
    const r = (
      /** @type {Options} */
      this.data("settings")
    );
    return yh(
      t,
      Object.assign({}, r, e, {
        // Note: these options are not in the readme.
        // The goal is for them to be set by plugins on `data` instead of being
        // passed by users.
        extensions: this.data("micromarkExtensions") || [],
        mdastExtensions: this.data("fromMarkdownExtensions") || []
      })
    );
  } });
}
function _h(e, n) {
  const t = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(n), !0)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function wh(e, n) {
  const t = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(n, t), [e.applyData(n, t), { type: "text", value: `
` }];
}
function Sh(e, n) {
  const t = n.value ? n.value + `
` : "", r = n.lang ? n.lang.match(/^[^ \t]+(?=[ \t]|$)/) : null, i = {};
  r && (i.className = ["language-" + r]);
  let a = {
    type: "element",
    tagName: "code",
    properties: i,
    children: [{ type: "text", value: t }]
  };
  return n.meta && (a.data = { meta: n.meta }), e.patch(n, a), a = e.applyData(n, a), a = { type: "element", tagName: "pre", properties: {}, children: [a] }, e.patch(n, a), a;
}
function kh(e, n) {
  const t = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function Nh(e, n) {
  const t = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function dt(e) {
  const n = [];
  let t = -1, r = 0, i = 0;
  for (; ++t < e.length; ) {
    const a = e.charCodeAt(t);
    let o = "";
    if (a === g.percentSign && un(e.charCodeAt(t + 1)) && un(e.charCodeAt(t + 2)))
      i = 2;
    else if (a < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(a)) || (o = String.fromCharCode(a));
    else if (a > 55295 && a < 57344) {
      const l = e.charCodeAt(t + 1);
      a < 56320 && l > 56319 && l < 57344 ? (o = String.fromCharCode(a, l), i = 1) : o = En.replacementCharacter;
    } else
      o = String.fromCharCode(a);
    o && (n.push(e.slice(r, t), encodeURIComponent(o)), r = t + i + 1, o = ""), i && (t += i, i = 0);
  }
  return n.join("") + e.slice(r);
}
function fu(e, n) {
  const t = String(n.identifier).toUpperCase(), r = dt(t.toLowerCase()), i = e.footnoteOrder.indexOf(t);
  let a;
  i === -1 ? (e.footnoteOrder.push(t), e.footnoteCounts[t] = 1, a = e.footnoteOrder.length) : (e.footnoteCounts[t]++, a = i + 1);
  const o = e.footnoteCounts[t], l = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + e.clobberPrefix + "fn-" + r,
      id: e.clobberPrefix + "fnref-" + r + (o > 1 ? "-" + o : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(a) }]
  };
  e.patch(n, l);
  const s = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [l]
  };
  return e.patch(n, s), e.applyData(n, s);
}
function Oh(e, n) {
  const t = e.footnoteById;
  let r = 1;
  for (; r in t; )
    r++;
  const i = String(r);
  return t[i] = {
    type: "footnoteDefinition",
    identifier: i,
    children: [{ type: "paragraph", children: n.children }],
    position: n.position
  }, fu(e, {
    type: "footnoteReference",
    identifier: i,
    position: n.position
  });
}
function Ch(e, n) {
  const t = {
    type: "element",
    tagName: "h" + n.depth,
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function Th(e, n) {
  if (e.dangerous) {
    const t = { type: "raw", value: n.value };
    return e.patch(n, t), e.applyData(n, t);
  }
  return null;
}
function gu(e, n) {
  const t = n.referenceType;
  let r = "]";
  if (t === "collapsed" ? r += "[]" : t === "full" && (r += "[" + (n.label || n.identifier) + "]"), n.type === "imageReference")
    return { type: "text", value: "![" + n.alt + r };
  const i = e.all(n), a = i[0];
  a && a.type === "text" ? a.value = "[" + a.value : i.unshift({ type: "text", value: "[" });
  const o = i[i.length - 1];
  return o && o.type === "text" ? o.value += r : i.push({ type: "text", value: r }), i;
}
function Ah(e, n) {
  const t = e.definition(n.identifier);
  if (!t)
    return gu(e, n);
  const r = { src: dt(t.url || ""), alt: n.alt };
  t.title !== null && t.title !== void 0 && (r.title = t.title);
  const i = { type: "element", tagName: "img", properties: r, children: [] };
  return e.patch(n, i), e.applyData(n, i);
}
function Mh(e, n) {
  const t = { src: dt(n.url) };
  n.alt !== null && n.alt !== void 0 && (t.alt = n.alt), n.title !== null && n.title !== void 0 && (t.title = n.title);
  const r = { type: "element", tagName: "img", properties: t, children: [] };
  return e.patch(n, r), e.applyData(n, r);
}
function Ih(e, n) {
  const t = { type: "text", value: n.value.replace(/\r?\n|\r/g, " ") };
  e.patch(n, t);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [t]
  };
  return e.patch(n, r), e.applyData(n, r);
}
function Rh(e, n) {
  const t = e.definition(n.identifier);
  if (!t)
    return gu(e, n);
  const r = { href: dt(t.url || "") };
  t.title !== null && t.title !== void 0 && (r.title = t.title);
  const i = {
    type: "element",
    tagName: "a",
    properties: r,
    children: e.all(n)
  };
  return e.patch(n, i), e.applyData(n, i);
}
function Dh(e, n) {
  const t = { href: dt(n.url) };
  n.title !== null && n.title !== void 0 && (t.title = n.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: t,
    children: e.all(n)
  };
  return e.patch(n, r), e.applyData(n, r);
}
function Lh(e, n, t) {
  const r = e.all(n), i = t ? Ph(t) : hu(n), a = {}, o = [];
  if (typeof n.checked == "boolean") {
    const c = r[0];
    let d;
    c && c.type === "element" && c.tagName === "p" ? d = c : (d = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(d)), d.children.length > 0 && d.children.unshift({ type: "text", value: " " }), d.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: n.checked, disabled: !0 },
      children: []
    }), a.className = ["task-list-item"];
  }
  let l = -1;
  for (; ++l < r.length; ) {
    const c = r[l];
    (i || l !== 0 || c.type !== "element" || c.tagName !== "p") && o.push({ type: "text", value: `
` }), c.type === "element" && c.tagName === "p" && !i ? o.push(...c.children) : o.push(c);
  }
  const s = r[r.length - 1];
  s && (i || s.type !== "element" || s.tagName !== "p") && o.push({ type: "text", value: `
` });
  const u = { type: "element", tagName: "li", properties: a, children: o };
  return e.patch(n, u), e.applyData(n, u);
}
function Ph(e) {
  let n = !1;
  if (e.type === "list") {
    n = e.spread || !1;
    const t = e.children;
    let r = -1;
    for (; !n && ++r < t.length; )
      n = hu(t[r]);
  }
  return n;
}
function hu(e) {
  const n = e.spread;
  return n ?? e.children.length > 1;
}
function Bh(e, n) {
  const t = {}, r = e.all(n);
  let i = -1;
  for (typeof n.start == "number" && n.start !== 1 && (t.start = n.start); ++i < r.length; ) {
    const o = r[i];
    if (o.type === "element" && o.tagName === "li" && o.properties && Array.isArray(o.properties.className) && o.properties.className.includes("task-list-item")) {
      t.className = ["contains-task-list"];
      break;
    }
  }
  const a = {
    type: "element",
    tagName: n.ordered ? "ol" : "ul",
    properties: t,
    children: e.wrap(r, !0)
  };
  return e.patch(n, a), e.applyData(n, a);
}
function Fh(e, n) {
  const t = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
function $h(e, n) {
  const t = { type: "root", children: e.wrap(e.all(n)) };
  return e.patch(n, t), e.applyData(n, t);
}
function zh(e, n) {
  const t = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
const Ci = mu("start"), Ti = mu("end");
function Uh(e) {
  return { start: Ci(e), end: Ti(e) };
}
function mu(e) {
  return n;
  function n(t) {
    const r = t && t.position && t.position[e] || {};
    return {
      // @ts-expect-error: in practice, null is allowed.
      line: r.line || null,
      // @ts-expect-error: in practice, null is allowed.
      column: r.column || null,
      // @ts-expect-error: in practice, null is allowed.
      offset: r.offset > -1 ? r.offset : null
    };
  }
}
function Hh(e, n) {
  const t = e.all(n), r = t.shift(), i = [];
  if (r) {
    const o = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(n.children[0], o), i.push(o);
  }
  if (t.length > 0) {
    const o = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(t, !0)
    }, l = Ci(n.children[1]), s = Ti(n.children[n.children.length - 1]);
    l.line && s.line && (o.position = { start: l, end: s }), i.push(o);
  }
  const a = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(n, a), e.applyData(n, a);
}
function jh(e, n, t) {
  const r = t ? t.children : void 0, a = (r ? r.indexOf(n) : 1) === 0 ? "th" : "td", o = t && t.type === "table" ? t.align : void 0, l = o ? o.length : n.children.length;
  let s = -1;
  const u = [];
  for (; ++s < l; ) {
    const d = n.children[s], f = {}, h = o ? o[s] : void 0;
    h && (f.align = h);
    let v = { type: "element", tagName: a, properties: f, children: [] };
    d && (v.children = e.all(d), e.patch(d, v), v = e.applyData(n, v)), u.push(v);
  }
  const c = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(u, !0)
  };
  return e.patch(n, c), e.applyData(n, c);
}
function qh(e, n) {
  const t = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(n)
  };
  return e.patch(n, t), e.applyData(n, t);
}
const Ya = 9, Za = 32;
function Kh(e) {
  const n = String(e), t = /\r?\n|\r/g;
  let r = t.exec(n), i = 0;
  const a = [];
  for (; r; )
    a.push(
      Xa(n.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = t.exec(n);
  return a.push(Xa(n.slice(i), i > 0, !1)), a.join("");
}
function Xa(e, n, t) {
  let r = 0, i = e.length;
  if (n) {
    let a = e.codePointAt(r);
    for (; a === Ya || a === Za; )
      r++, a = e.codePointAt(r);
  }
  if (t) {
    let a = e.codePointAt(i - 1);
    for (; a === Ya || a === Za; )
      i--, a = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function Gh(e, n) {
  const t = { type: "text", value: Kh(String(n.value)) };
  return e.patch(n, t), e.applyData(n, t);
}
function Wh(e, n) {
  const t = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(n, t), e.applyData(n, t);
}
const Vh = {
  blockquote: _h,
  break: wh,
  code: Sh,
  delete: kh,
  emphasis: Nh,
  footnoteReference: fu,
  footnote: Oh,
  heading: Ch,
  html: Th,
  imageReference: Ah,
  image: Mh,
  inlineCode: Ih,
  linkReference: Rh,
  link: Dh,
  listItem: Lh,
  list: Bh,
  paragraph: Fh,
  root: $h,
  strong: zh,
  table: Hh,
  tableCell: qh,
  tableRow: jh,
  text: Gh,
  thematicBreak: Wh,
  toml: $t,
  yaml: $t,
  definition: $t,
  footnoteDefinition: $t
};
function $t() {
  return null;
}
const bu = (
  /**
   * @type {(
   *   (<Kind extends Node>(test: PredicateTest<Kind>) => AssertPredicate<Kind>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {AssertAnything}
   */
  function(e) {
    if (e == null)
      return Qh;
    if (typeof e == "string")
      return Xh(e);
    if (typeof e == "object")
      return Array.isArray(e) ? Yh(e) : Zh(e);
    if (typeof e == "function")
      return fr(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function Yh(e) {
  const n = [];
  let t = -1;
  for (; ++t < e.length; )
    n[t] = bu(e[t]);
  return fr(r);
  function r(...i) {
    let a = -1;
    for (; ++a < n.length; )
      if (n[a].call(this, ...i))
        return !0;
    return !1;
  }
}
function Zh(e) {
  return fr(n);
  function n(t) {
    let r;
    for (r in e)
      if (t[r] !== e[r])
        return !1;
    return !0;
  }
}
function Xh(e) {
  return fr(n);
  function n(t) {
    return t && t.type === e;
  }
}
function fr(e) {
  return n;
  function n(t, ...r) {
    return !!(t && typeof t == "object" && "type" in t && e.call(this, t, ...r));
  }
}
function Qh() {
  return !0;
}
const Jh = !0, Qa = !1, em = "skip", nm = (
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {Test} test
   * @param {Visitor<Node>} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {void}
   */
  function(e, n, t, r) {
    typeof n == "function" && typeof t != "function" && (r = t, t = n, n = null);
    const i = bu(n), a = r ? -1 : 1;
    o(e, void 0, [])();
    function o(l, s, u) {
      const c = l && typeof l == "object" ? l : {};
      if (typeof c.type == "string") {
        const f = (
          // `hast`
          typeof c.tagName == "string" ? c.tagName : (
            // `xast`
            typeof c.name == "string" ? c.name : void 0
          )
        );
        Object.defineProperty(d, "name", {
          value: "node (" + (l.type + (f ? "<" + f + ">" : "")) + ")"
        });
      }
      return d;
      function d() {
        let f = [], h, v, x;
        if ((!n || i(l, s, u[u.length - 1] || null)) && (f = tm(t(l, u)), f[0] === Qa))
          return f;
        if (l.children && f[0] !== em)
          for (v = (r ? l.children.length : -1) + a, x = u.concat(l); v > -1 && v < l.children.length; ) {
            if (h = o(l.children[v], v, x)(), h[0] === Qa)
              return h;
            v = typeof h[1] == "number" ? h[1] : v + a;
          }
        return f;
      }
    }
  }
);
function tm(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [Jh, e] : [e];
}
const Ai = (
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  /**
   * @param {Node} tree
   * @param {Test} test
   * @param {Visitor} visitor
   * @param {boolean | null | undefined} [reverse]
   * @returns {void}
   */
  function(e, n, t, r) {
    typeof n == "function" && typeof t != "function" && (r = t, t = n, n = null), nm(e, n, i, r);
    function i(a, o) {
      const l = o[o.length - 1];
      return t(
        a,
        l ? l.children.indexOf(a) : null,
        l
      );
    }
  }
);
function rm(e) {
  return !e || !e.position || !e.position.start || !e.position.start.line || !e.position.start.column || !e.position.end || !e.position.end.line || !e.position.end.column;
}
const Ja = {}.hasOwnProperty;
function im(e) {
  const n = /* @__PURE__ */ Object.create(null);
  if (!e || !e.type)
    throw new Error("mdast-util-definitions expected node");
  return Ai(e, "definition", (r) => {
    const i = eo(r.identifier);
    i && !Ja.call(n, i) && (n[i] = r);
  }), t;
  function t(r) {
    const i = eo(r);
    return i && Ja.call(n, i) ? n[i] : null;
  }
}
function eo(e) {
  return String(e || "").toUpperCase();
}
const tr = {}.hasOwnProperty;
function am(e, n) {
  const t = n || {}, r = t.allowDangerousHtml || !1, i = {};
  return o.dangerous = r, o.clobberPrefix = t.clobberPrefix === void 0 || t.clobberPrefix === null ? "user-content-" : t.clobberPrefix, o.footnoteLabel = t.footnoteLabel || "Footnotes", o.footnoteLabelTagName = t.footnoteLabelTagName || "h2", o.footnoteLabelProperties = t.footnoteLabelProperties || {
    className: ["sr-only"]
  }, o.footnoteBackLabel = t.footnoteBackLabel || "Back to content", o.unknownHandler = t.unknownHandler, o.passThrough = t.passThrough, o.handlers = { ...Vh, ...t.handlers }, o.definition = im(e), o.footnoteById = i, o.footnoteOrder = [], o.footnoteCounts = {}, o.patch = om, o.applyData = lm, o.one = l, o.all = s, o.wrap = cm, o.augment = a, Ai(e, "footnoteDefinition", (u) => {
    const c = String(u.identifier).toUpperCase();
    tr.call(i, c) || (i[c] = u);
  }), o;
  function a(u, c) {
    if (u && "data" in u && u.data) {
      const d = u.data;
      d.hName && (c.type !== "element" && (c = {
        type: "element",
        tagName: "",
        properties: {},
        children: []
      }), c.tagName = d.hName), c.type === "element" && d.hProperties && (c.properties = { ...c.properties, ...d.hProperties }), "children" in c && c.children && d.hChildren && (c.children = d.hChildren);
    }
    if (u) {
      const d = "type" in u ? u : { position: u };
      rm(d) || (c.position = { start: Ci(d), end: Ti(d) });
    }
    return c;
  }
  function o(u, c, d, f) {
    return Array.isArray(d) && (f = d, d = {}), a(u, {
      type: "element",
      tagName: c,
      properties: d || {},
      children: f || []
    });
  }
  function l(u, c) {
    return yu(o, u, c);
  }
  function s(u) {
    return Mi(o, u);
  }
}
function om(e, n) {
  e.position && (n.position = Uh(e));
}
function lm(e, n) {
  let t = n;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, a = e.data.hProperties;
    typeof r == "string" && (t.type === "element" ? t.tagName = r : t = {
      type: "element",
      tagName: r,
      properties: {},
      children: []
    }), t.type === "element" && a && (t.properties = { ...t.properties, ...a }), "children" in t && t.children && i !== null && i !== void 0 && (t.children = i);
  }
  return t;
}
function yu(e, n, t) {
  const r = n && n.type;
  if (!r)
    throw new Error("Expected node, got `" + n + "`");
  return tr.call(e.handlers, r) ? e.handlers[r](e, n, t) : e.passThrough && e.passThrough.includes(r) ? "children" in n ? { ...n, children: Mi(e, n) } : n : e.unknownHandler ? e.unknownHandler(e, n, t) : sm(e, n);
}
function Mi(e, n) {
  const t = [];
  if ("children" in n) {
    const r = n.children;
    let i = -1;
    for (; ++i < r.length; ) {
      const a = yu(e, r[i], n);
      if (a) {
        if (i && r[i - 1].type === "break" && (!Array.isArray(a) && a.type === "text" && (a.value = a.value.replace(/^\s+/, "")), !Array.isArray(a) && a.type === "element")) {
          const o = a.children[0];
          o && o.type === "text" && (o.value = o.value.replace(/^\s+/, ""));
        }
        Array.isArray(a) ? t.push(...a) : t.push(a);
      }
    }
  }
  return t;
}
function sm(e, n) {
  const t = n.data || {}, r = "value" in n && !(tr.call(t, "hProperties") || tr.call(t, "hChildren")) ? { type: "text", value: n.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: Mi(e, n)
  };
  return e.patch(n, r), e.applyData(n, r);
}
function cm(e, n) {
  const t = [];
  let r = -1;
  for (n && t.push({ type: "text", value: `
` }); ++r < e.length; )
    r && t.push({ type: "text", value: `
` }), t.push(e[r]);
  return n && e.length > 0 && t.push({ type: "text", value: `
` }), t;
}
function um(e) {
  const n = [];
  let t = -1;
  for (; ++t < e.footnoteOrder.length; ) {
    const r = e.footnoteById[e.footnoteOrder[t]];
    if (!r)
      continue;
    const i = e.all(r), a = String(r.identifier).toUpperCase(), o = dt(a.toLowerCase());
    let l = 0;
    const s = [];
    for (; ++l <= e.footnoteCounts[a]; ) {
      const d = {
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + e.clobberPrefix + "fnref-" + o + (l > 1 ? "-" + l : ""),
          dataFootnoteBackref: !0,
          className: ["data-footnote-backref"],
          ariaLabel: e.footnoteBackLabel
        },
        children: [{ type: "text", value: "↩" }]
      };
      l > 1 && d.children.push({
        type: "element",
        tagName: "sup",
        children: [{ type: "text", value: String(l) }]
      }), s.length > 0 && s.push({ type: "text", value: " " }), s.push(d);
    }
    const u = i[i.length - 1];
    if (u && u.type === "element" && u.tagName === "p") {
      const d = u.children[u.children.length - 1];
      d && d.type === "text" ? d.value += " " : u.children.push({ type: "text", value: " " }), u.children.push(...s);
    } else
      i.push(...s);
    const c = {
      type: "element",
      tagName: "li",
      properties: { id: e.clobberPrefix + "fn-" + o },
      children: e.wrap(i, !0)
    };
    e.patch(r, c), n.push(c);
  }
  if (n.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: e.footnoteLabelTagName,
          properties: {
            // To do: use structured clone.
            ...JSON.parse(JSON.stringify(e.footnoteLabelProperties)),
            id: "footnote-label"
          },
          children: [{ type: "text", value: e.footnoteLabel }]
        },
        { type: "text", value: `
` },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: e.wrap(n, !0)
        },
        { type: "text", value: `
` }
      ]
    };
}
function Eu(e, n) {
  const t = am(e, n), r = t.one(e, null), i = um(t);
  return i && r.children.push({ type: "text", value: `
` }, i), Array.isArray(r) ? { type: "root", children: r } : r;
}
const dm = (
  /** @type {(import('unified').Plugin<[Processor, Options?]|[null|undefined, Options?]|[Options]|[], MdastRoot>)} */
  function(e, n) {
    return e && "run" in e ? fm(e, n) : gm(e || n);
  }
), pm = dm;
function fm(e, n) {
  return (t, r, i) => {
    e.run(Eu(t, n), r, (a) => {
      i(a);
    });
  };
}
function gm(e) {
  return (n) => Eu(n, e);
}
class Rt {
  /**
   * @constructor
   * @param {Properties} property
   * @param {Normal} normal
   * @param {string} [space]
   */
  constructor(n, t, r) {
    this.property = n, this.normal = t, r && (this.space = r);
  }
}
Rt.prototype.property = {};
Rt.prototype.normal = {};
Rt.prototype.space = null;
function xu(e, n) {
  const t = {}, r = {};
  let i = -1;
  for (; ++i < e.length; )
    Object.assign(t, e[i].property), Object.assign(r, e[i].normal);
  return new Rt(t, r, n);
}
function ii(e) {
  return e.toLowerCase();
}
class mn {
  /**
   * @constructor
   * @param {string} property
   * @param {string} attribute
   */
  constructor(n, t) {
    this.property = n, this.attribute = t;
  }
}
mn.prototype.space = null;
mn.prototype.boolean = !1;
mn.prototype.booleanish = !1;
mn.prototype.overloadedBoolean = !1;
mn.prototype.number = !1;
mn.prototype.commaSeparated = !1;
mn.prototype.spaceSeparated = !1;
mn.prototype.commaOrSpaceSeparated = !1;
mn.prototype.mustUseProperty = !1;
mn.prototype.defined = !1;
let hm = 0;
const ge = Jn(), qe = Jn(), vu = Jn(), H = Jn(), Ae = Jn(), ct = Jn(), sn = Jn();
function Jn() {
  return 2 ** ++hm;
}
const ai = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: ge,
  booleanish: qe,
  commaOrSpaceSeparated: sn,
  commaSeparated: ct,
  number: H,
  overloadedBoolean: vu,
  spaceSeparated: Ae
}, Symbol.toStringTag, { value: "Module" })), Ir = Object.keys(ai);
class Ii extends mn {
  /**
   * @constructor
   * @param {string} property
   * @param {string} attribute
   * @param {number|null} [mask]
   * @param {string} [space]
   */
  constructor(n, t, r, i) {
    let a = -1;
    if (super(n, t), no(this, "space", i), typeof r == "number")
      for (; ++a < Ir.length; ) {
        const o = Ir[a];
        no(this, Ir[a], (r & ai[o]) === ai[o]);
      }
  }
}
Ii.prototype.defined = !0;
function no(e, n, t) {
  t && (e[n] = t);
}
const mm = {}.hasOwnProperty;
function pt(e) {
  const n = {}, t = {};
  let r;
  for (r in e.properties)
    if (mm.call(e.properties, r)) {
      const i = e.properties[r], a = new Ii(
        r,
        e.transform(e.attributes || {}, r),
        i,
        e.space
      );
      e.mustUseProperty && e.mustUseProperty.includes(r) && (a.mustUseProperty = !0), n[r] = a, t[ii(r)] = r, t[ii(a.attribute)] = r;
    }
  return new Rt(n, t, e.space);
}
const _u = pt({
  space: "xlink",
  transform(e, n) {
    return "xlink:" + n.slice(5).toLowerCase();
  },
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  }
}), wu = pt({
  space: "xml",
  transform(e, n) {
    return "xml:" + n.slice(3).toLowerCase();
  },
  properties: { xmlLang: null, xmlBase: null, xmlSpace: null }
});
function Su(e, n) {
  return n in e ? e[n] : n;
}
function ku(e, n) {
  return Su(e, n.toLowerCase());
}
const Nu = pt({
  space: "xmlns",
  attributes: { xmlnsxlink: "xmlns:xlink" },
  transform: ku,
  properties: { xmlns: null, xmlnsXLink: null }
}), Ou = pt({
  transform(e, n) {
    return n === "role" ? n : "aria-" + n.slice(4).toLowerCase();
  },
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: qe,
    ariaAutoComplete: null,
    ariaBusy: qe,
    ariaChecked: qe,
    ariaColCount: H,
    ariaColIndex: H,
    ariaColSpan: H,
    ariaControls: Ae,
    ariaCurrent: null,
    ariaDescribedBy: Ae,
    ariaDetails: null,
    ariaDisabled: qe,
    ariaDropEffect: Ae,
    ariaErrorMessage: null,
    ariaExpanded: qe,
    ariaFlowTo: Ae,
    ariaGrabbed: qe,
    ariaHasPopup: null,
    ariaHidden: qe,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: Ae,
    ariaLevel: H,
    ariaLive: null,
    ariaModal: qe,
    ariaMultiLine: qe,
    ariaMultiSelectable: qe,
    ariaOrientation: null,
    ariaOwns: Ae,
    ariaPlaceholder: null,
    ariaPosInSet: H,
    ariaPressed: qe,
    ariaReadOnly: qe,
    ariaRelevant: null,
    ariaRequired: qe,
    ariaRoleDescription: Ae,
    ariaRowCount: H,
    ariaRowIndex: H,
    ariaRowSpan: H,
    ariaSelected: qe,
    ariaSetSize: H,
    ariaSort: null,
    ariaValueMax: H,
    ariaValueMin: H,
    ariaValueNow: H,
    ariaValueText: null,
    role: null
  }
}), bm = pt({
  space: "html",
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  transform: ku,
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: ct,
    acceptCharset: Ae,
    accessKey: Ae,
    action: null,
    allow: null,
    allowFullScreen: ge,
    allowPaymentRequest: ge,
    allowUserMedia: ge,
    alt: null,
    as: null,
    async: ge,
    autoCapitalize: null,
    autoComplete: Ae,
    autoFocus: ge,
    autoPlay: ge,
    blocking: Ae,
    capture: null,
    charSet: null,
    checked: ge,
    cite: null,
    className: Ae,
    cols: H,
    colSpan: null,
    content: null,
    contentEditable: qe,
    controls: ge,
    controlsList: Ae,
    coords: H | ct,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: ge,
    defer: ge,
    dir: null,
    dirName: null,
    disabled: ge,
    download: vu,
    draggable: qe,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: ge,
    formTarget: null,
    headers: Ae,
    height: H,
    hidden: ge,
    high: H,
    href: null,
    hrefLang: null,
    htmlFor: Ae,
    httpEquiv: Ae,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: ge,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: ge,
    itemId: null,
    itemProp: Ae,
    itemRef: Ae,
    itemScope: ge,
    itemType: Ae,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: ge,
    low: H,
    manifest: null,
    max: null,
    maxLength: H,
    media: null,
    method: null,
    min: null,
    minLength: H,
    multiple: ge,
    muted: ge,
    name: null,
    nonce: null,
    noModule: ge,
    noValidate: ge,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: ge,
    optimum: H,
    pattern: null,
    ping: Ae,
    placeholder: null,
    playsInline: ge,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: ge,
    referrerPolicy: null,
    rel: Ae,
    required: ge,
    reversed: ge,
    rows: H,
    rowSpan: H,
    sandbox: Ae,
    scope: null,
    scoped: ge,
    seamless: ge,
    selected: ge,
    shadowRootClonable: ge,
    shadowRootDelegatesFocus: ge,
    shadowRootMode: null,
    shape: null,
    size: H,
    sizes: null,
    slot: null,
    span: H,
    spellCheck: qe,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: H,
    step: null,
    style: null,
    tabIndex: H,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: ge,
    useMap: null,
    value: qe,
    width: H,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: Ae,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: H,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: H,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: ge,
    // Lists. Use CSS to reduce space between items instead
    declare: ge,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: H,
    // `<img>` and `<object>`
    leftMargin: H,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: H,
    // `<body>`
    marginWidth: H,
    // `<body>`
    noResize: ge,
    // `<frame>`
    noHref: ge,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: ge,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: ge,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: H,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: qe,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: H,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: H,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: ge,
    disableRemotePlayback: ge,
    prefix: null,
    property: null,
    results: H,
    security: null,
    unselectable: null
  }
}), ym = pt({
  space: "svg",
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  transform: Su,
  properties: {
    about: sn,
    accentHeight: H,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: H,
    amplitude: H,
    arabicForm: null,
    ascent: H,
    attributeName: null,
    attributeType: null,
    azimuth: H,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: H,
    by: null,
    calcMode: null,
    capHeight: H,
    className: Ae,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: H,
    diffuseConstant: H,
    direction: null,
    display: null,
    dur: null,
    divisor: H,
    dominantBaseline: null,
    download: ge,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: H,
    enableBackground: null,
    end: null,
    event: null,
    exponent: H,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: H,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: ct,
    g2: ct,
    glyphName: ct,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: H,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: H,
    horizOriginX: H,
    horizOriginY: H,
    id: null,
    ideographic: H,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: H,
    k: H,
    k1: H,
    k2: H,
    k3: H,
    k4: H,
    kernelMatrix: sn,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: H,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: H,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: H,
    overlineThickness: H,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: H,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: Ae,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: H,
    pointsAtY: H,
    pointsAtZ: H,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: sn,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: sn,
    rev: sn,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: sn,
    requiredFeatures: sn,
    requiredFonts: sn,
    requiredFormats: sn,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: H,
    specularExponent: H,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: H,
    strikethroughThickness: H,
    string: null,
    stroke: null,
    strokeDashArray: sn,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: H,
    strokeOpacity: H,
    strokeWidth: null,
    style: null,
    surfaceScale: H,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: sn,
    tabIndex: H,
    tableValues: null,
    target: null,
    targetX: H,
    targetY: H,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: sn,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: H,
    underlineThickness: H,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: H,
    values: null,
    vAlphabetic: H,
    vMathematical: H,
    vectorEffect: null,
    vHanging: H,
    vIdeographic: H,
    version: null,
    vertAdvY: H,
    vertOriginX: H,
    vertOriginY: H,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: H,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  }
}), Em = /^data[-\w.:]+$/i, to = /-[a-z]/g, xm = /[A-Z]/g;
function vm(e, n) {
  const t = ii(n);
  let r = n, i = mn;
  if (t in e.normal)
    return e.property[e.normal[t]];
  if (t.length > 4 && t.slice(0, 4) === "data" && Em.test(n)) {
    if (n.charAt(4) === "-") {
      const a = n.slice(5).replace(to, wm);
      r = "data" + a.charAt(0).toUpperCase() + a.slice(1);
    } else {
      const a = n.slice(4);
      if (!to.test(a)) {
        let o = a.replace(xm, _m);
        o.charAt(0) !== "-" && (o = "-" + o), n = "data" + o;
      }
    }
    i = Ii;
  }
  return new i(r, n);
}
function _m(e) {
  return "-" + e.toLowerCase();
}
function wm(e) {
  return e.charAt(1).toUpperCase();
}
const ro = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
}, Sm = xu([wu, _u, Nu, Ou, bm], "html"), km = xu([wu, _u, Nu, Ou, ym], "svg");
function Nm(e) {
  if (e.allowedElements && e.disallowedElements)
    throw new TypeError(
      "Only one of `allowedElements` and `disallowedElements` should be defined"
    );
  if (e.allowedElements || e.disallowedElements || e.allowElement)
    return (n) => {
      Ai(n, "element", (t, r, i) => {
        const a = (
          /** @type {Element|Root} */
          i
        );
        let o;
        if (e.allowedElements ? o = !e.allowedElements.includes(t.tagName) : e.disallowedElements && (o = e.disallowedElements.includes(t.tagName)), !o && e.allowElement && typeof r == "number" && (o = !e.allowElement(t, r, a)), o && typeof r == "number")
          return e.unwrapDisallowed && t.children ? a.children.splice(r, 1, ...t.children) : a.children.splice(r, 1), r;
      });
    };
}
function Om(e) {
  const n = (
    // @ts-expect-error looks like a node.
    e && typeof e == "object" && e.type === "text" ? (
      // @ts-expect-error looks like a text.
      e.value || ""
    ) : e
  );
  return typeof n == "string" && n.replace(/[ \t\n\f\r]/g, "") === "";
}
function Cm(e) {
  return e.join(" ").trim();
}
function Tm(e, n) {
  const t = n || {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (t.padRight ? " " : "") + "," + (t.padLeft === !1 ? "" : " ")
  ).trim();
}
var Ri = { exports: {} }, io = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, Am = /\n/g, Mm = /^\s*/, Im = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, Rm = /^:\s*/, Dm = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, Lm = /^[;\s]*/, Pm = /^\s+|\s+$/g, Bm = `
`, ao = "/", oo = "*", qn = "", Fm = "comment", $m = "declaration", zm = function(e, n) {
  if (typeof e != "string")
    throw new TypeError("First argument must be a string");
  if (!e)
    return [];
  n = n || {};
  var t = 1, r = 1;
  function i(v) {
    var x = v.match(Am);
    x && (t += x.length);
    var m = v.lastIndexOf(Bm);
    r = ~m ? v.length - m : r + v.length;
  }
  function a() {
    var v = { line: t, column: r };
    return function(x) {
      return x.position = new o(v), u(), x;
    };
  }
  function o(v) {
    this.start = v, this.end = { line: t, column: r }, this.source = n.source;
  }
  o.prototype.content = e;
  function l(v) {
    var x = new Error(
      n.source + ":" + t + ":" + r + ": " + v
    );
    if (x.reason = v, x.filename = n.source, x.line = t, x.column = r, x.source = e, !n.silent)
      throw x;
  }
  function s(v) {
    var x = v.exec(e);
    if (x) {
      var m = x[0];
      return i(m), e = e.slice(m.length), x;
    }
  }
  function u() {
    s(Mm);
  }
  function c(v) {
    var x;
    for (v = v || []; x = d(); )
      x !== !1 && v.push(x);
    return v;
  }
  function d() {
    var v = a();
    if (!(ao != e.charAt(0) || oo != e.charAt(1))) {
      for (var x = 2; qn != e.charAt(x) && (oo != e.charAt(x) || ao != e.charAt(x + 1)); )
        ++x;
      if (x += 2, qn === e.charAt(x - 1))
        return l("End of comment missing");
      var m = e.slice(2, x - 2);
      return r += 2, i(m), e = e.slice(x), r += 2, v({
        type: Fm,
        comment: m
      });
    }
  }
  function f() {
    var v = a(), x = s(Im);
    if (x) {
      if (d(), !s(Rm))
        return l("property missing ':'");
      var m = s(Dm), b = v({
        type: $m,
        property: lo(x[0].replace(io, qn)),
        value: m ? lo(m[0].replace(io, qn)) : qn
      });
      return s(Lm), b;
    }
  }
  function h() {
    var v = [];
    c(v);
    for (var x; x = f(); )
      x !== !1 && (v.push(x), c(v));
    return v;
  }
  return u(), h();
};
function lo(e) {
  return e ? e.replace(Pm, qn) : qn;
}
var Um = zm;
function Cu(e, n) {
  var t = null;
  if (!e || typeof e != "string")
    return t;
  for (var r, i = Um(e), a = typeof n == "function", o, l, s = 0, u = i.length; s < u; s++)
    r = i[s], o = r.property, l = r.value, a ? n(o, l, r) : l && (t || (t = {}), t[o] = l);
  return t;
}
Ri.exports = Cu;
Ri.exports.default = Cu;
var Hm = Ri.exports;
const jm = /* @__PURE__ */ dn(Hm), oi = {}.hasOwnProperty, qm = /* @__PURE__ */ new Set(["table", "thead", "tbody", "tfoot", "tr"]);
function Tu(e, n) {
  const t = [];
  let r = -1, i;
  for (; ++r < n.children.length; )
    i = n.children[r], i.type === "element" ? t.push(Km(e, i, r, n)) : i.type === "text" ? (n.type !== "element" || !qm.has(n.tagName) || !Om(i)) && t.push(i.value) : i.type === "raw" && !e.options.skipHtml && t.push(i.value);
  return t;
}
function Km(e, n, t, r) {
  const i = e.options, a = i.transformLinkUri === void 0 ? $p : i.transformLinkUri, o = e.schema, l = n.tagName, s = {};
  let u = o, c;
  if (o.space === "html" && l === "svg" && (u = km, e.schema = u), n.properties)
    for (c in n.properties)
      oi.call(n.properties, c) && Wm(s, c, n.properties[c], e);
  (l === "ol" || l === "ul") && e.listDepth++;
  const d = Tu(e, n);
  (l === "ol" || l === "ul") && e.listDepth--, e.schema = o;
  const f = n.position || {
    start: { line: null, column: null, offset: null },
    end: { line: null, column: null, offset: null }
  }, h = i.components && oi.call(i.components, l) ? i.components[l] : l, v = typeof h == "string" || h === R.Fragment;
  if (!Fp.isValidElementType(h))
    throw new TypeError(
      `Component for name \`${l}\` not defined or is not renderable`
    );
  if (s.key = t, l === "a" && i.linkTarget && (s.target = typeof i.linkTarget == "function" ? i.linkTarget(
    String(s.href || ""),
    n.children,
    typeof s.title == "string" ? s.title : null
  ) : i.linkTarget), l === "a" && a && (s.href = a(
    String(s.href || ""),
    n.children,
    typeof s.title == "string" ? s.title : null
  )), !v && l === "code" && r.type === "element" && r.tagName !== "pre" && (s.inline = !0), !v && (l === "h1" || l === "h2" || l === "h3" || l === "h4" || l === "h5" || l === "h6") && (s.level = Number.parseInt(l.charAt(1), 10)), l === "img" && i.transformImageUri && (s.src = i.transformImageUri(
    String(s.src || ""),
    String(s.alt || ""),
    typeof s.title == "string" ? s.title : null
  )), !v && l === "li" && r.type === "element") {
    const x = Gm(n);
    s.checked = x && x.properties ? !!x.properties.checked : null, s.index = Rr(r, n), s.ordered = r.tagName === "ol";
  }
  return !v && (l === "ol" || l === "ul") && (s.ordered = l === "ol", s.depth = e.listDepth), (l === "td" || l === "th") && (s.align && (s.style || (s.style = {}), s.style.textAlign = s.align, delete s.align), v || (s.isHeader = l === "th")), !v && l === "tr" && r.type === "element" && (s.isHeader = r.tagName === "thead"), i.sourcePos && (s["data-sourcepos"] = Zm(f)), !v && i.rawSourcePos && (s.sourcePosition = n.position), !v && i.includeElementIndex && (s.index = Rr(r, n), s.siblingCount = Rr(r)), v || (s.node = n), d.length > 0 ? R.createElement(h, s, d) : R.createElement(h, s);
}
function Gm(e) {
  let n = -1;
  for (; ++n < e.children.length; ) {
    const t = e.children[n];
    if (t.type === "element" && t.tagName === "input")
      return t;
  }
  return null;
}
function Rr(e, n) {
  let t = -1, r = 0;
  for (; ++t < e.children.length && e.children[t] !== n; )
    e.children[t].type === "element" && r++;
  return r;
}
function Wm(e, n, t, r) {
  const i = vm(r.schema, n);
  let a = t;
  a == null || a !== a || (Array.isArray(a) && (a = i.commaSeparated ? Tm(a) : Cm(a)), i.property === "style" && typeof a == "string" && (a = Vm(a)), i.space && i.property ? e[oi.call(ro, i.property) ? ro[i.property] : i.property] = a : i.attribute && (e[i.attribute] = a));
}
function Vm(e) {
  const n = {};
  try {
    jm(e, t);
  } catch {
  }
  return n;
  function t(r, i) {
    const a = r.slice(0, 4) === "-ms-" ? `ms-${r.slice(4)}` : r;
    n[a.replace(/-([a-z])/g, Ym)] = i;
  }
}
function Ym(e, n) {
  return n.toUpperCase();
}
function Zm(e) {
  return [
    e.start.line,
    ":",
    e.start.column,
    "-",
    e.end.line,
    ":",
    e.end.column
  ].map(String).join("");
}
const so = {}.hasOwnProperty, Xm = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", zt = {
  plugins: { to: "remarkPlugins", id: "change-plugins-to-remarkplugins" },
  renderers: { to: "components", id: "change-renderers-to-components" },
  astPlugins: { id: "remove-buggy-html-in-markdown-parser" },
  allowDangerousHtml: { id: "remove-buggy-html-in-markdown-parser" },
  escapeHtml: { id: "remove-buggy-html-in-markdown-parser" },
  source: { to: "children", id: "change-source-to-children" },
  allowNode: {
    to: "allowElement",
    id: "replace-allownode-allowedtypes-and-disallowedtypes"
  },
  allowedTypes: {
    to: "allowedElements",
    id: "replace-allownode-allowedtypes-and-disallowedtypes"
  },
  disallowedTypes: {
    to: "disallowedElements",
    id: "replace-allownode-allowedtypes-and-disallowedtypes"
  },
  includeNodeIndex: {
    to: "includeElementIndex",
    id: "change-includenodeindex-to-includeelementindex"
  }
};
function Au(e) {
  for (const a in zt)
    if (so.call(zt, a) && so.call(e, a)) {
      const o = zt[a];
      console.warn(
        `[react-markdown] Warning: please ${o.to ? `use \`${o.to}\` instead of` : "remove"} \`${a}\` (see <${Xm}#${o.id}> for more info)`
      ), delete zt[a];
    }
  const n = nf().use(vh).use(e.remarkPlugins || []).use(pm, {
    ...e.remarkRehypeOptions,
    allowDangerousHtml: !0
  }).use(e.rehypePlugins || []).use(Nm, e), t = new jc();
  typeof e.children == "string" ? t.value = e.children : e.children !== void 0 && e.children !== null && console.warn(
    `[react-markdown] Warning: please pass a string as \`children\` (not: \`${e.children}\`)`
  );
  const r = n.runSync(n.parse(t), t);
  if (r.type !== "root")
    throw new TypeError("Expected a `root` node");
  let i = R.createElement(
    R.Fragment,
    {},
    Tu({ options: e, schema: Sm, listDepth: 0 }, r)
  );
  return e.className && (i = R.createElement("div", { className: e.className }, i)), i;
}
Au.propTypes = {
  // Core options:
  children: ce.string,
  // Layout options:
  className: ce.string,
  // Filter options:
  allowElement: ce.func,
  allowedElements: ce.arrayOf(ce.string),
  disallowedElements: ce.arrayOf(ce.string),
  unwrapDisallowed: ce.bool,
  // Plugin options:
  remarkPlugins: ce.arrayOf(
    ce.oneOfType([
      ce.object,
      ce.func,
      ce.arrayOf(
        ce.oneOfType([
          ce.bool,
          ce.string,
          ce.object,
          ce.func,
          ce.arrayOf(
            // prettier-ignore
            // type-coverage:ignore-next-line
            ce.any
          )
        ])
      )
    ])
  ),
  rehypePlugins: ce.arrayOf(
    ce.oneOfType([
      ce.object,
      ce.func,
      ce.arrayOf(
        ce.oneOfType([
          ce.bool,
          ce.string,
          ce.object,
          ce.func,
          ce.arrayOf(
            // prettier-ignore
            // type-coverage:ignore-next-line
            ce.any
          )
        ])
      )
    ])
  ),
  // Transform options:
  sourcePos: ce.bool,
  rawSourcePos: ce.bool,
  skipHtml: ce.bool,
  includeElementIndex: ce.bool,
  transformLinkUri: ce.oneOfType([ce.func, ce.bool]),
  linkTarget: ce.oneOfType([ce.func, ce.string]),
  transformImageUri: ce.func,
  components: ce.object
};
function Qm(e) {
  const n = e.regex, t = {}, r = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [t]
      }
      // default values
    ]
  };
  Object.assign(t, {
    className: "variable",
    variants: [
      { begin: n.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        "(?![\\w\\d])(?![$])"
      ) },
      r
    ]
  });
  const i = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [e.BACKSLASH_ESCAPE]
  }, a = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      e.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  }, o = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      t,
      i
    ]
  };
  i.contains.push(o);
  const l = {
    className: "",
    begin: /\\"/
  }, s = {
    className: "string",
    begin: /'/,
    end: /'/
  }, u = {
    begin: /\$\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      e.NUMBER_MODE,
      t
    ]
  }, c = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ], d = e.SHEBANG({
    binary: `(${c.join("|")})`,
    relevance: 10
  }), f = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: !0,
    contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  }, h = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "while",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "function"
  ], v = [
    "true",
    "false"
  ], x = { match: /(\/[a-z._-]+)+/ }, m = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ], b = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ], w = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ], _ = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: ["sh"],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: h,
      literal: v,
      built_in: [
        ...m,
        ...b,
        // Shell modifiers
        "set",
        "shopt",
        ...w,
        ..._
      ]
    },
    contains: [
      d,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      f,
      u,
      e.HASH_COMMENT_MODE,
      a,
      x,
      o,
      l,
      s,
      t
    ]
  };
}
function Jm(e) {
  const n = e.regex, t = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", a = "<[^<>]+>", o = "(" + r + "|" + n.optional(i) + "[a-zA-Z_]\\w*" + n.optional(a) + ")", l = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]
  }, s = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)", u = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + s + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, c = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(u, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      t,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, f = {
    className: "title",
    begin: n.optional(i) + e.IDENT_RE,
    relevance: 0
  }, h = n.optional(i) + e.IDENT_RE + "\\s*\\(", m = {
    keyword: [
      "asm",
      "auto",
      "break",
      "case",
      "continue",
      "default",
      "do",
      "else",
      "enum",
      "extern",
      "for",
      "fortran",
      "goto",
      "if",
      "inline",
      "register",
      "restrict",
      "return",
      "sizeof",
      "struct",
      "switch",
      "typedef",
      "union",
      "volatile",
      "while",
      "_Alignas",
      "_Alignof",
      "_Atomic",
      "_Generic",
      "_Noreturn",
      "_Static_assert",
      "_Thread_local",
      // aliases
      "alignas",
      "alignof",
      "noreturn",
      "static_assert",
      "thread_local",
      // not a C keyword but is, for all intents and purposes, treated exactly like one.
      "_Pragma"
    ],
    type: [
      "float",
      "double",
      "signed",
      "unsigned",
      "int",
      "short",
      "long",
      "char",
      "void",
      "_Bool",
      "_Complex",
      "_Imaginary",
      "_Decimal32",
      "_Decimal64",
      "_Decimal128",
      // modifiers
      "const",
      "static",
      // aliases
      "complex",
      "bool",
      "imaginary"
    ],
    literal: "true false NULL",
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
  }, b = [
    d,
    l,
    t,
    e.C_BLOCK_COMMENT_MODE,
    c,
    u
  ], w = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: m,
    contains: b.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: m,
        contains: b.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, _ = {
    begin: "(" + o + "[\\*&\\s]+)+" + h,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: m,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: m,
        relevance: 0
      },
      {
        begin: h,
        returnBegin: !0,
        contains: [e.inherit(f, { className: "title.function" })],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: m,
        relevance: 0,
        contains: [
          t,
          e.C_BLOCK_COMMENT_MODE,
          u,
          c,
          l,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: m,
            relevance: 0,
            contains: [
              "self",
              t,
              e.C_BLOCK_COMMENT_MODE,
              u,
              c,
              l
            ]
          }
        ]
      },
      l,
      t,
      e.C_BLOCK_COMMENT_MODE,
      d
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: m,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: !0,
    illegal: "</",
    contains: [].concat(
      w,
      _,
      b,
      [
        d,
        {
          begin: e.IDENT_RE + "::",
          keywords: m
        },
        {
          className: "class",
          beginKeywords: "enum class struct union",
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            e.TITLE_MODE
          ]
        }
      ]
    ),
    exports: {
      preprocessor: d,
      strings: u,
      keywords: m
    }
  };
}
function eb(e) {
  const n = e.regex, t = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", a = "<[^<>]+>", o = "(?!struct)(" + r + "|" + n.optional(i) + "[a-zA-Z_]\\w*" + n.optional(a) + ")", l = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, s = "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)", u = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + s + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, c = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(u, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      t,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, f = {
    className: "title",
    begin: n.optional(i) + e.IDENT_RE,
    relevance: 0
  }, h = n.optional(i) + e.IDENT_RE + "\\s*\\(", v = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ], x = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ], m = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ], b = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ], C = {
    type: x,
    keyword: v,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: m
  }, M = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: b
    },
    begin: n.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      n.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, S = [
    M,
    d,
    l,
    t,
    e.C_BLOCK_COMMENT_MODE,
    c,
    u
  ], I = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: C,
    contains: S.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: C,
        contains: S.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, L = {
    className: "function",
    begin: "(" + o + "[\\*&\\s]+)+" + h,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: C,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: C,
        relevance: 0
      },
      {
        begin: h,
        returnBegin: !0,
        contains: [f],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: !0,
        contains: [
          u,
          c
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: C,
        relevance: 0,
        contains: [
          t,
          e.C_BLOCK_COMMENT_MODE,
          u,
          c,
          l,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: C,
            relevance: 0,
            contains: [
              "self",
              t,
              e.C_BLOCK_COMMENT_MODE,
              u,
              c,
              l
            ]
          }
        ]
      },
      l,
      t,
      e.C_BLOCK_COMMENT_MODE,
      d
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: C,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      I,
      L,
      M,
      S,
      [
        d,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function)\\s*<(?!<)",
          end: ">",
          keywords: C,
          contains: [
            "self",
            l
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: C
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}
function nb(e) {
  const n = [
    "bool",
    "byte",
    "char",
    "decimal",
    "delegate",
    "double",
    "dynamic",
    "enum",
    "float",
    "int",
    "long",
    "nint",
    "nuint",
    "object",
    "sbyte",
    "short",
    "string",
    "ulong",
    "uint",
    "ushort"
  ], t = [
    "public",
    "private",
    "protected",
    "static",
    "internal",
    "protected",
    "abstract",
    "async",
    "extern",
    "override",
    "unsafe",
    "virtual",
    "new",
    "sealed",
    "partial"
  ], r = [
    "default",
    "false",
    "null",
    "true"
  ], i = [
    "abstract",
    "as",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "do",
    "else",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "sealed",
    "sizeof",
    "stackalloc",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
  ], a = [
    "add",
    "alias",
    "and",
    "ascending",
    "async",
    "await",
    "by",
    "descending",
    "equals",
    "from",
    "get",
    "global",
    "group",
    "init",
    "into",
    "join",
    "let",
    "nameof",
    "not",
    "notnull",
    "on",
    "or",
    "orderby",
    "partial",
    "remove",
    "select",
    "set",
    "unmanaged",
    "value|0",
    "var",
    "when",
    "where",
    "with",
    "yield"
  ], o = {
    keyword: i.concat(a),
    built_in: n,
    literal: r
  }, l = e.inherit(e.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" }), s = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  }, u = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  }, c = e.inherit(u, { illegal: /\n/ }), d = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: o
  }, f = e.inherit(d, { illegal: /\n/ }), h = {
    className: "string",
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      e.BACKSLASH_ESCAPE,
      f
    ]
  }, v = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      d
    ]
  }, x = e.inherit(v, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      f
    ]
  });
  d.contains = [
    v,
    h,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    s,
    e.C_BLOCK_COMMENT_MODE
  ], f.contains = [
    x,
    h,
    c,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    s,
    e.inherit(e.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const m = { variants: [
    v,
    h,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE
  ] }, b = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      l
    ]
  }, w = e.IDENT_RE + "(<" + e.IDENT_RE + "(\\s*,\\s*" + e.IDENT_RE + ")*>)?(\\[\\])?", _ = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + e.IDENT_RE,
    relevance: 0
  };
  return {
    name: "C#",
    aliases: [
      "cs",
      "c#"
    ],
    keywords: o,
    illegal: /::/,
    contains: [
      e.COMMENT(
        "///",
        "$",
        {
          returnBegin: !0,
          contains: [
            {
              className: "doctag",
              variants: [
                {
                  begin: "///",
                  relevance: 0
                },
                { begin: "<!--|-->" },
                {
                  begin: "</?",
                  end: ">"
                }
              ]
            }
          ]
        }
      ),
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
      },
      m,
      s,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          l,
          b,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          l,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "record",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          l,
          b,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: "meta",
        begin: "^\\s*\\[(?=[\\w])",
        excludeBegin: !0,
        end: "\\]",
        excludeEnd: !0,
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new return throw await else",
        relevance: 0
      },
      {
        className: "function",
        begin: "(" + w + "\\s+)+" + e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: !0,
        end: /\s*[{;=]/,
        excludeEnd: !0,
        keywords: o,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: t.join(" "),
            relevance: 0
          },
          {
            begin: e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: !0,
            contains: [
              e.TITLE_MODE,
              b
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: o,
            relevance: 0,
            contains: [
              m,
              s,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      _
    ]
  };
}
function tb(e) {
  const n = {
    className: "subst",
    variants: [{ begin: "\\$[A-Za-z0-9_]+" }]
  }, t = {
    className: "subst",
    variants: [
      {
        begin: /\$\{/,
        end: /\}/
      }
    ],
    keywords: "true false null this is new super"
  }, r = {
    className: "string",
    variants: [
      {
        begin: "r'''",
        end: "'''"
      },
      {
        begin: 'r"""',
        end: '"""'
      },
      {
        begin: "r'",
        end: "'",
        illegal: "\\n"
      },
      {
        begin: 'r"',
        end: '"',
        illegal: "\\n"
      },
      {
        begin: "'''",
        end: "'''",
        contains: [
          e.BACKSLASH_ESCAPE,
          n,
          t
        ]
      },
      {
        begin: '"""',
        end: '"""',
        contains: [
          e.BACKSLASH_ESCAPE,
          n,
          t
        ]
      },
      {
        begin: "'",
        end: "'",
        illegal: "\\n",
        contains: [
          e.BACKSLASH_ESCAPE,
          n,
          t
        ]
      },
      {
        begin: '"',
        end: '"',
        illegal: "\\n",
        contains: [
          e.BACKSLASH_ESCAPE,
          n,
          t
        ]
      }
    ]
  };
  t.contains = [
    e.C_NUMBER_MODE,
    r
  ];
  const i = [
    // dart:core
    "Comparable",
    "DateTime",
    "Duration",
    "Function",
    "Iterable",
    "Iterator",
    "List",
    "Map",
    "Match",
    "Object",
    "Pattern",
    "RegExp",
    "Set",
    "Stopwatch",
    "String",
    "StringBuffer",
    "StringSink",
    "Symbol",
    "Type",
    "Uri",
    "bool",
    "double",
    "int",
    "num",
    // dart:html
    "Element",
    "ElementList"
  ], a = i.map((s) => `${s}?`);
  return {
    name: "Dart",
    keywords: {
      keyword: [
        "abstract",
        "as",
        "assert",
        "async",
        "await",
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "covariant",
        "default",
        "deferred",
        "do",
        "dynamic",
        "else",
        "enum",
        "export",
        "extends",
        "extension",
        "external",
        "factory",
        "false",
        "final",
        "finally",
        "for",
        "Function",
        "get",
        "hide",
        "if",
        "implements",
        "import",
        "in",
        "inferface",
        "is",
        "late",
        "library",
        "mixin",
        "new",
        "null",
        "on",
        "operator",
        "part",
        "required",
        "rethrow",
        "return",
        "set",
        "show",
        "static",
        "super",
        "switch",
        "sync",
        "this",
        "throw",
        "true",
        "try",
        "typedef",
        "var",
        "void",
        "while",
        "with",
        "yield"
      ],
      built_in: i.concat(a).concat([
        // dart:core
        "Never",
        "Null",
        "dynamic",
        "print",
        // dart:html
        "document",
        "querySelector",
        "querySelectorAll",
        "window"
      ]),
      $pattern: /[A-Za-z][A-Za-z0-9_]*\??/
    },
    contains: [
      r,
      e.COMMENT(
        /\/\*\*(?!\/)/,
        /\*\//,
        {
          subLanguage: "markdown",
          relevance: 0
        }
      ),
      e.COMMENT(
        /\/{3,} ?/,
        /$/,
        { contains: [
          {
            subLanguage: "markdown",
            begin: ".",
            end: "$",
            relevance: 0
          }
        ] }
      ),
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "class",
        beginKeywords: "class interface",
        end: /\{/,
        excludeEnd: !0,
        contains: [
          { beginKeywords: "extends implements" },
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      e.C_NUMBER_MODE,
      {
        className: "meta",
        begin: "@[A-Za-z]+"
      },
      {
        begin: "=>"
        // No markup, just a relevance booster
      }
    ]
  };
}
function rb(e) {
  const n = e.regex;
  return {
    name: "Diff",
    aliases: ["patch"],
    contains: [
      {
        className: "meta",
        relevance: 10,
        match: n.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: "comment",
        variants: [
          {
            begin: n.either(
              /Index: /,
              /^index/,
              /={3,}/,
              /^-{3}/,
              /^\*{3} /,
              /^\+{3}/,
              /^diff --git/
            ),
            end: /$/
          },
          { match: /^\*{15}$/ }
        ]
      },
      {
        className: "addition",
        begin: /^\+/,
        end: /$/
      },
      {
        className: "deletion",
        begin: /^-/,
        end: /$/
      },
      {
        className: "addition",
        begin: /^!/,
        end: /$/
      }
    ]
  };
}
function ib(e) {
  const a = {
    keyword: [
      "break",
      "case",
      "chan",
      "const",
      "continue",
      "default",
      "defer",
      "else",
      "fallthrough",
      "for",
      "func",
      "go",
      "goto",
      "if",
      "import",
      "interface",
      "map",
      "package",
      "range",
      "return",
      "select",
      "struct",
      "switch",
      "type",
      "var"
    ],
    type: [
      "bool",
      "byte",
      "complex64",
      "complex128",
      "error",
      "float32",
      "float64",
      "int8",
      "int16",
      "int32",
      "int64",
      "string",
      "uint8",
      "uint16",
      "uint32",
      "uint64",
      "int",
      "uint",
      "uintptr",
      "rune"
    ],
    literal: [
      "true",
      "false",
      "iota",
      "nil"
    ],
    built_in: [
      "append",
      "cap",
      "close",
      "complex",
      "copy",
      "imag",
      "len",
      "make",
      "new",
      "panic",
      "print",
      "println",
      "real",
      "recover",
      "delete"
    ]
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: a,
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            begin: e.C_NUMBER_RE + "[i]",
            relevance: 1
          },
          e.C_NUMBER_MODE
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: !0,
        contains: [
          e.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: a,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function ab(e) {
  const n = e.regex, t = "HTTP/(2|1\\.[01])", r = /[A-Za-z][A-Za-z0-9-]*/, i = {
    className: "attribute",
    begin: n.concat("^", r, "(?=\\:\\s)"),
    starts: { contains: [
      {
        className: "punctuation",
        begin: /: /,
        relevance: 0,
        starts: {
          end: "$",
          relevance: 0
        }
      }
    ] }
  }, a = [
    i,
    {
      begin: "\\n\\n",
      starts: {
        subLanguage: [],
        endsWithParent: !0
      }
    }
  ];
  return {
    name: "HTTP",
    aliases: ["https"],
    illegal: /\S/,
    contains: [
      // response
      {
        begin: "^(?=" + t + " \\d{3})",
        end: /$/,
        contains: [
          {
            className: "meta",
            begin: t
          },
          {
            className: "number",
            begin: "\\b\\d{3}\\b"
          }
        ],
        starts: {
          end: /\b\B/,
          illegal: /\S/,
          contains: a
        }
      },
      // request
      {
        begin: "(?=^[A-Z]+ (.*?) " + t + "$)",
        end: /$/,
        contains: [
          {
            className: "string",
            begin: " ",
            end: " ",
            excludeBegin: !0,
            excludeEnd: !0
          },
          {
            className: "meta",
            begin: t
          },
          {
            className: "keyword",
            begin: "[A-Z]+"
          }
        ],
        starts: {
          end: /\b\B/,
          illegal: /\S/,
          contains: a
        }
      },
      // to allow headers to work even without a preamble
      e.inherit(i, { relevance: 0 })
    ]
  };
}
function ob(e) {
  const n = e.regex, t = {
    className: "number",
    relevance: 0,
    variants: [
      { begin: /([+-]+)?[\d]+_[\d_]+/ },
      { begin: e.NUMBER_RE }
    ]
  }, r = e.COMMENT();
  r.variants = [
    {
      begin: /;/,
      end: /$/
    },
    {
      begin: /#/,
      end: /$/
    }
  ];
  const i = {
    className: "variable",
    variants: [
      { begin: /\$[\w\d"][\w\d_]*/ },
      { begin: /\$\{(.*?)\}/ }
    ]
  }, a = {
    className: "literal",
    begin: /\bon|off|true|false|yes|no\b/
  }, o = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: "'''",
        end: "'''",
        relevance: 10
      },
      {
        begin: '"""',
        end: '"""',
        relevance: 10
      },
      {
        begin: '"',
        end: '"'
      },
      {
        begin: "'",
        end: "'"
      }
    ]
  }, l = {
    begin: /\[/,
    end: /\]/,
    contains: [
      r,
      a,
      i,
      o,
      t,
      "self"
    ],
    relevance: 0
  }, s = /[A-Za-z0-9_-]+/, u = /"(\\"|[^"])*"/, c = /'[^']*'/, d = n.either(
    s,
    u,
    c
  ), f = n.concat(
    d,
    "(\\s*\\.\\s*",
    d,
    ")*",
    n.lookahead(/\s*=\s*[^#\s]/)
  );
  return {
    name: "TOML, also INI",
    aliases: ["toml"],
    case_insensitive: !0,
    illegal: /\S/,
    contains: [
      r,
      {
        className: "section",
        begin: /\[+/,
        end: /\]+/
      },
      {
        begin: f,
        className: "attr",
        starts: {
          end: /$/,
          contains: [
            r,
            l,
            a,
            i,
            o,
            t
          ]
        }
      }
    ]
  };
}
var rt = "[0-9](_*[0-9])*", Ut = `\\.(${rt})`, Ht = "[0-9a-fA-F](_*[0-9a-fA-F])*", co = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${rt})((${Ut})|\\.)?|(${Ut}))[eE][+-]?(${rt})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${rt})((${Ut})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${Ut})[fFdD]?\\b` },
    { begin: `\\b(${rt})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${Ht})\\.?|(${Ht})?\\.(${Ht}))[pP][+-]?(${rt})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${Ht})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function Mu(e, n, t) {
  return t === -1 ? "" : e.replace(n, (r) => Mu(e, n, t - 1));
}
function lb(e) {
  const n = e.regex, t = "[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*", r = t + Mu("(?:<" + t + "~~~(?:\\s*,\\s*" + t + "~~~)*>)?", /~~~/g, 2), s = {
    keyword: [
      "synchronized",
      "abstract",
      "private",
      "var",
      "static",
      "if",
      "const ",
      "for",
      "while",
      "strictfp",
      "finally",
      "protected",
      "import",
      "native",
      "final",
      "void",
      "enum",
      "else",
      "break",
      "transient",
      "catch",
      "instanceof",
      "volatile",
      "case",
      "assert",
      "package",
      "default",
      "public",
      "try",
      "switch",
      "continue",
      "throws",
      "protected",
      "public",
      "private",
      "module",
      "requires",
      "exports",
      "do",
      "sealed"
    ],
    literal: [
      "false",
      "true",
      "null"
    ],
    type: [
      "char",
      "boolean",
      "long",
      "float",
      "int",
      "byte",
      "short",
      "double"
    ],
    built_in: [
      "super",
      "this"
    ]
  }, u = {
    className: "meta",
    begin: "@" + t,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  }, c = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: s,
    relevance: 0,
    contains: [e.C_BLOCK_COMMENT_MODE],
    endsParent: !0
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: s,
    illegal: /<\/|#/,
    contains: [
      e.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [e.BACKSLASH_ESCAPE]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          t
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        begin: [
          n.concat(/(?!else)/, t),
          /\s+/,
          t,
          /\s+/,
          /=/
        ],
        className: {
          1: "type",
          3: "variable",
          5: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          t
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          c,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new throw return else",
        relevance: 0
      },
      {
        begin: [
          "(?:" + r + "\\s+)",
          e.UNDERSCORE_IDENT_RE,
          /\s*(?=\()/
        ],
        className: { 2: "title.function" },
        keywords: s,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: s,
            relevance: 0,
            contains: [
              u,
              e.APOS_STRING_MODE,
              e.QUOTE_STRING_MODE,
              co,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      co,
      u
    ]
  };
}
const uo = "[A-Za-z$_][0-9A-Za-z$_]*", sb = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends"
], cb = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], Iu = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], Ru = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], Du = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], ub = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "module",
  "global"
  // Node.js
], db = [].concat(
  Du,
  Iu,
  Ru
);
function pb(e) {
  const n = e.regex, t = (P, { after: $ }) => {
    const j = "</" + P[0].slice(1);
    return P.input.indexOf(j, $) !== -1;
  }, r = uo, i = {
    begin: "<>",
    end: "</>"
  }, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (P, $) => {
      const j = P[0].length + P.index, E = P.input[j];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        E === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        E === ","
      ) {
        $.ignoreMatch();
        return;
      }
      E === ">" && (t(P, { after: j }) || $.ignoreMatch());
      let ue;
      if ((ue = P.input.substr(j).match(/^\s+extends\s+/)) && ue.index === 0) {
        $.ignoreMatch();
        return;
      }
    }
  }, l = {
    $pattern: uo,
    keyword: sb,
    literal: cb,
    built_in: db,
    "variable.language": ub
  }, s = "[0-9](_?[0-9])*", u = `\\.(${s})`, c = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${c})((${u})|\\.)?|(${u}))[eE][+-]?(${s})\\b` },
      { begin: `\\b(${c})\\b((${u})\\b|\\.)?|(${u})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, f = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: l,
    contains: []
    // defined later
  }, h = {
    begin: "html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "xml"
    }
  }, v = {
    begin: "css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "css"
    }
  }, x = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      f
    ]
  }, b = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: r + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, w = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    h,
    v,
    x,
    d
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  f.contains = w.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: l,
    contains: [
      "self"
    ].concat(w)
  });
  const _ = [].concat(b, f.contains), C = _.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: l,
      contains: ["self"].concat(_)
    }
  ]), M = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: l,
    contains: C
  }, S = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          r,
          /\s+/,
          /extends/,
          /\s+/,
          n.concat(r, "(", n.concat(/\./, r), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          r
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, I = {
    relevance: 0,
    match: n.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...Iu,
        ...Ru
      ]
    }
  }, L = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, D = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          r,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [M],
    illegal: /%/
  }, Y = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function J(P) {
    return n.concat("(?!", P.join("|"), ")");
  }
  const W = {
    match: n.concat(
      /\b/,
      J([
        ...Du,
        "super"
      ]),
      r,
      n.lookahead(/\(/)
    ),
    className: "title.function",
    relevance: 0
  }, B = {
    begin: n.concat(/\./, n.lookahead(
      n.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, q = {
    match: [
      /get|set/,
      /\s+/,
      r,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      M
    ]
  }, G = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", T = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      n.lookahead(G)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      M
    ]
  };
  return {
    name: "Javascript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: l,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: C, CLASS_REFERENCE: I },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      L,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      h,
      v,
      x,
      b,
      d,
      I,
      {
        className: "attr",
        begin: r + n.lookahead(":"),
        relevance: 0
      },
      T,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          b,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: G,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: l,
                    contains: C
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: i.begin, end: i.end },
              { match: a },
              {
                begin: o.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": o.isTrulyOpeningTag,
                end: o.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: o.begin,
                end: o.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      D,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          M,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      B,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + r,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [M]
      },
      W,
      Y,
      S,
      q,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function fb(e) {
  const n = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, t = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, r = { beginKeywords: [
    "true",
    "false",
    "null"
  ].join(" ") };
  return {
    name: "JSON",
    contains: [
      n,
      t,
      e.QUOTE_STRING_MODE,
      r,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
var it = "[0-9](_*[0-9])*", jt = `\\.(${it})`, qt = "[0-9a-fA-F](_*[0-9a-fA-F])*", gb = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${it})((${jt})|\\.)?|(${jt}))[eE][+-]?(${it})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${it})((${jt})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${jt})[fFdD]?\\b` },
    { begin: `\\b(${it})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${qt})\\.?|(${qt})?\\.(${qt}))[pP][+-]?(${it})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${qt})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function hb(e) {
  const n = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  }, t = {
    className: "keyword",
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: "symbol",
        begin: /@\w+/
      }
    ] }
  }, r = {
    className: "symbol",
    begin: e.UNDERSCORE_IDENT_RE + "@"
  }, i = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: [e.C_NUMBER_MODE]
  }, a = {
    className: "variable",
    begin: "\\$" + e.UNDERSCORE_IDENT_RE
  }, o = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          a,
          i
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: "'",
        end: "'",
        illegal: /\n/,
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          e.BACKSLASH_ESCAPE,
          a,
          i
        ]
      }
    ]
  };
  i.contains.push(o);
  const l = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + e.UNDERSCORE_IDENT_RE + ")?"
  }, s = {
    className: "meta",
    begin: "@" + e.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [e.inherit(o, { className: "string" })]
      }
    ]
  }, u = gb, c = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [e.C_BLOCK_COMMENT_MODE] }
  ), d = { variants: [
    {
      className: "type",
      begin: e.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: []
      // defined later
    }
  ] }, f = d;
  return f.variants[1].contains = [d], d.variants[1].contains = [f], {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    keywords: n,
    contains: [
      e.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      e.C_LINE_COMMENT_MODE,
      c,
      t,
      r,
      l,
      s,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: !0,
        excludeEnd: !0,
        keywords: n,
        relevance: 5,
        contains: [
          {
            begin: e.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: !0,
            relevance: 0,
            contains: [e.UNDERSCORE_TITLE_MODE]
          },
          {
            className: "type",
            begin: /</,
            end: />/,
            keywords: "reified",
            relevance: 0
          },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: n,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: !0,
                contains: [
                  d,
                  e.C_LINE_COMMENT_MODE,
                  c
                ],
                relevance: 0
              },
              e.C_LINE_COMMENT_MODE,
              c,
              l,
              s,
              o,
              e.C_NUMBER_MODE
            ]
          },
          c
        ]
      },
      {
        className: "class",
        beginKeywords: "class interface trait",
        // remove 'trait' when removed from KEYWORDS
        end: /[:\{(]|$/,
        excludeEnd: !0,
        illegal: "extends implements",
        contains: [
          { beginKeywords: "public protected internal private constructor" },
          e.UNDERSCORE_TITLE_MODE,
          {
            className: "type",
            begin: /</,
            end: />/,
            excludeBegin: !0,
            excludeEnd: !0,
            relevance: 0
          },
          {
            className: "type",
            begin: /[,:]\s*/,
            end: /[<\(,]|$/,
            excludeBegin: !0,
            returnEnd: !0
          },
          l,
          s
        ]
      },
      o,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: `
`
      },
      u
    ]
  };
}
function mb(e) {
  const n = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  }, t = /[a-zA-Z@][a-zA-Z0-9_]*/, l = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: t,
    keyword: [
      "while",
      "export",
      "sizeof",
      "typedef",
      "const",
      "struct",
      "for",
      "union",
      "volatile",
      "static",
      "mutable",
      "if",
      "do",
      "return",
      "goto",
      "enum",
      "else",
      "break",
      "extern",
      "asm",
      "case",
      "default",
      "register",
      "explicit",
      "typename",
      "switch",
      "continue",
      "inline",
      "readonly",
      "assign",
      "readwrite",
      "self",
      "@synchronized",
      "id",
      "typeof",
      "nonatomic",
      "IBOutlet",
      "IBAction",
      "strong",
      "weak",
      "copy",
      "in",
      "out",
      "inout",
      "bycopy",
      "byref",
      "oneway",
      "__strong",
      "__weak",
      "__block",
      "__autoreleasing",
      "@private",
      "@protected",
      "@public",
      "@try",
      "@property",
      "@end",
      "@throw",
      "@catch",
      "@finally",
      "@autoreleasepool",
      "@synthesize",
      "@dynamic",
      "@selector",
      "@optional",
      "@required",
      "@encode",
      "@package",
      "@import",
      "@defs",
      "@compatibility_alias",
      "__bridge",
      "__bridge_transfer",
      "__bridge_retained",
      "__bridge_retain",
      "__covariant",
      "__contravariant",
      "__kindof",
      "_Nonnull",
      "_Nullable",
      "_Null_unspecified",
      "__FUNCTION__",
      "__PRETTY_FUNCTION__",
      "__attribute__",
      "getter",
      "setter",
      "retain",
      "unsafe_unretained",
      "nonnull",
      "nullable",
      "null_unspecified",
      "null_resettable",
      "class",
      "instancetype",
      "NS_DESIGNATED_INITIALIZER",
      "NS_UNAVAILABLE",
      "NS_REQUIRES_SUPER",
      "NS_RETURNS_INNER_POINTER",
      "NS_INLINE",
      "NS_AVAILABLE",
      "NS_DEPRECATED",
      "NS_ENUM",
      "NS_OPTIONS",
      "NS_SWIFT_UNAVAILABLE",
      "NS_ASSUME_NONNULL_BEGIN",
      "NS_ASSUME_NONNULL_END",
      "NS_REFINED_FOR_SWIFT",
      "NS_SWIFT_NAME",
      "NS_SWIFT_NOTHROW",
      "NS_DURING",
      "NS_HANDLER",
      "NS_ENDHANDLER",
      "NS_VALUERETURN",
      "NS_VOIDRETURN"
    ],
    literal: [
      "false",
      "true",
      "FALSE",
      "TRUE",
      "nil",
      "YES",
      "NO",
      "NULL"
    ],
    built_in: [
      "dispatch_once_t",
      "dispatch_queue_t",
      "dispatch_sync",
      "dispatch_async",
      "dispatch_once"
    ],
    type: [
      "int",
      "float",
      "char",
      "unsigned",
      "signed",
      "short",
      "long",
      "double",
      "wchar_t",
      "unichar",
      "void",
      "bool",
      "BOOL",
      "id|0",
      "_Bool"
    ]
  }, s = {
    $pattern: t,
    keyword: [
      "@interface",
      "@class",
      "@protocol",
      "@implementation"
    ]
  };
  return {
    name: "Objective-C",
    aliases: [
      "mm",
      "objc",
      "obj-c",
      "obj-c++",
      "objective-c++"
    ],
    keywords: l,
    illegal: "</",
    contains: [
      n,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      e.C_NUMBER_MODE,
      e.QUOTE_STRING_MODE,
      e.APOS_STRING_MODE,
      {
        className: "string",
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: "\\n",
            contains: [e.BACKSLASH_ESCAPE]
          }
        ]
      },
      {
        className: "meta",
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          e.inherit(e.QUOTE_STRING_MODE, { className: "string" }),
          {
            className: "string",
            begin: /<.*?>/,
            end: /$/,
            illegal: "\\n"
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "class",
        begin: "(" + s.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: !0,
        keywords: s,
        contains: [e.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + e.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
function bb(e) {
  const n = e.regex, t = [
    "abs",
    "accept",
    "alarm",
    "and",
    "atan2",
    "bind",
    "binmode",
    "bless",
    "break",
    "caller",
    "chdir",
    "chmod",
    "chomp",
    "chop",
    "chown",
    "chr",
    "chroot",
    "close",
    "closedir",
    "connect",
    "continue",
    "cos",
    "crypt",
    "dbmclose",
    "dbmopen",
    "defined",
    "delete",
    "die",
    "do",
    "dump",
    "each",
    "else",
    "elsif",
    "endgrent",
    "endhostent",
    "endnetent",
    "endprotoent",
    "endpwent",
    "endservent",
    "eof",
    "eval",
    "exec",
    "exists",
    "exit",
    "exp",
    "fcntl",
    "fileno",
    "flock",
    "for",
    "foreach",
    "fork",
    "format",
    "formline",
    "getc",
    "getgrent",
    "getgrgid",
    "getgrnam",
    "gethostbyaddr",
    "gethostbyname",
    "gethostent",
    "getlogin",
    "getnetbyaddr",
    "getnetbyname",
    "getnetent",
    "getpeername",
    "getpgrp",
    "getpriority",
    "getprotobyname",
    "getprotobynumber",
    "getprotoent",
    "getpwent",
    "getpwnam",
    "getpwuid",
    "getservbyname",
    "getservbyport",
    "getservent",
    "getsockname",
    "getsockopt",
    "given",
    "glob",
    "gmtime",
    "goto",
    "grep",
    "gt",
    "hex",
    "if",
    "index",
    "int",
    "ioctl",
    "join",
    "keys",
    "kill",
    "last",
    "lc",
    "lcfirst",
    "length",
    "link",
    "listen",
    "local",
    "localtime",
    "log",
    "lstat",
    "lt",
    "ma",
    "map",
    "mkdir",
    "msgctl",
    "msgget",
    "msgrcv",
    "msgsnd",
    "my",
    "ne",
    "next",
    "no",
    "not",
    "oct",
    "open",
    "opendir",
    "or",
    "ord",
    "our",
    "pack",
    "package",
    "pipe",
    "pop",
    "pos",
    "print",
    "printf",
    "prototype",
    "push",
    "q|0",
    "qq",
    "quotemeta",
    "qw",
    "qx",
    "rand",
    "read",
    "readdir",
    "readline",
    "readlink",
    "readpipe",
    "recv",
    "redo",
    "ref",
    "rename",
    "require",
    "reset",
    "return",
    "reverse",
    "rewinddir",
    "rindex",
    "rmdir",
    "say",
    "scalar",
    "seek",
    "seekdir",
    "select",
    "semctl",
    "semget",
    "semop",
    "send",
    "setgrent",
    "sethostent",
    "setnetent",
    "setpgrp",
    "setpriority",
    "setprotoent",
    "setpwent",
    "setservent",
    "setsockopt",
    "shift",
    "shmctl",
    "shmget",
    "shmread",
    "shmwrite",
    "shutdown",
    "sin",
    "sleep",
    "socket",
    "socketpair",
    "sort",
    "splice",
    "split",
    "sprintf",
    "sqrt",
    "srand",
    "stat",
    "state",
    "study",
    "sub",
    "substr",
    "symlink",
    "syscall",
    "sysopen",
    "sysread",
    "sysseek",
    "system",
    "syswrite",
    "tell",
    "telldir",
    "tie",
    "tied",
    "time",
    "times",
    "tr",
    "truncate",
    "uc",
    "ucfirst",
    "umask",
    "undef",
    "unless",
    "unlink",
    "unpack",
    "unshift",
    "untie",
    "until",
    "use",
    "utime",
    "values",
    "vec",
    "wait",
    "waitpid",
    "wantarray",
    "warn",
    "when",
    "while",
    "write",
    "x|0",
    "xor",
    "y|0"
  ], r = /[dualxmsipngr]{0,12}/, i = {
    $pattern: /[\w.]+/,
    keyword: t.join(" ")
  }, a = {
    className: "subst",
    begin: "[$@]\\{",
    end: "\\}",
    keywords: i
  }, o = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  }, l = { variants: [
    { begin: /\$\d/ },
    { begin: n.concat(
      /[$%@](\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
      // negative look-ahead tries to avoid matching patterns that are not
      // Perl at all like $ident$, @ident@, etc.
      "(?![A-Za-z])(?![@$%])"
    ) },
    {
      begin: /[$%@][^\s\w{]/,
      relevance: 0
    }
  ] }, s = [
    e.BACKSLASH_ESCAPE,
    a,
    l
  ], u = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/,
    // valid but infrequent and weird
    /#/
    // valid but infrequent and weird
  ], c = (h, v, x = "\\1") => {
    const m = x === "\\1" ? x : n.concat(x, v);
    return n.concat(
      n.concat("(?:", h, ")"),
      v,
      /(?:\\.|[^\\\/])*?/,
      m,
      /(?:\\.|[^\\\/])*?/,
      x,
      r
    );
  }, d = (h, v, x) => n.concat(
    n.concat("(?:", h, ")"),
    v,
    /(?:\\.|[^\\\/])*?/,
    x,
    r
  ), f = [
    l,
    e.HASH_COMMENT_MODE,
    e.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: !0 }
    ),
    o,
    {
      className: "string",
      contains: s,
      variants: [
        {
          begin: "q[qwxr]?\\s*\\(",
          end: "\\)",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\[",
          end: "\\]",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\{",
          end: "\\}",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\|",
          end: "\\|",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*<",
          end: ">",
          relevance: 5
        },
        {
          begin: "qw\\s+q",
          end: "q",
          relevance: 5
        },
        {
          begin: "'",
          end: "'",
          contains: [e.BACKSLASH_ESCAPE]
        },
        {
          begin: '"',
          end: '"'
        },
        {
          begin: "`",
          end: "`",
          contains: [e.BACKSLASH_ESCAPE]
        },
        {
          begin: /\{\w+\}/,
          relevance: 0
        },
        {
          begin: "-?\\w+\\s*=>",
          relevance: 0
        }
      ]
    },
    {
      className: "number",
      begin: "(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",
      relevance: 0
    },
    {
      // regexp container
      begin: "(\\/\\/|" + e.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
      keywords: "split return print reverse grep",
      relevance: 0,
      contains: [
        e.HASH_COMMENT_MODE,
        {
          className: "regexp",
          variants: [
            // allow matching common delimiters
            { begin: c("s|tr|y", n.either(...u, { capture: !0 })) },
            // and then paired delmis
            { begin: c("s|tr|y", "\\(", "\\)") },
            { begin: c("s|tr|y", "\\[", "\\]") },
            { begin: c("s|tr|y", "\\{", "\\}") }
          ],
          relevance: 2
        },
        {
          className: "regexp",
          variants: [
            {
              // could be a comment in many languages so do not count
              // as relevant
              begin: /(m|qr)\/\//,
              relevance: 0
            },
            // prefix is optional with /regex/
            { begin: d("(?:m|qr)?", /\//, /\//) },
            // allow matching common delimiters
            { begin: d("m|qr", n.either(...u, { capture: !0 }), /\1/) },
            // allow common paired delmins
            { begin: d("m|qr", /\(/, /\)/) },
            { begin: d("m|qr", /\[/, /\]/) },
            { begin: d("m|qr", /\{/, /\}/) }
          ]
        }
      ]
    },
    {
      className: "function",
      beginKeywords: "sub",
      end: "(\\s*\\(.*?\\))?[;{]",
      excludeEnd: !0,
      relevance: 5,
      contains: [e.TITLE_MODE]
    },
    {
      begin: "-\\w\\b",
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: "mojolicious",
      contains: [
        {
          begin: "^@@.*",
          end: "$",
          className: "comment"
        }
      ]
    }
  ];
  return a.contains = f, o.contains = f, {
    name: "Perl",
    aliases: [
      "pl",
      "pm"
    ],
    keywords: i,
    contains: f
  };
}
function yb(e) {
  const n = e.regex, t = /(?![A-Za-z0-9])(?![$])/, r = n.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    t
  ), i = n.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    t
  ), a = {
    scope: "variable",
    match: "\\$+" + r
  }, o = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 },
      // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ }
      // end php tag
    ]
  }, l = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  }, s = e.inherit(e.APOS_STRING_MODE, { illegal: null }), u = e.inherit(e.QUOTE_STRING_MODE, {
    illegal: null,
    contains: e.QUOTE_STRING_MODE.contains.concat(l)
  }), c = e.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*(\w+)\n/,
    end: /[ \t]*(\w+)\b/,
    contains: e.QUOTE_STRING_MODE.contains.concat(l)
  }), d = `[ 	
]`, f = {
    scope: "string",
    variants: [
      u,
      s,
      c
    ]
  }, h = {
    scope: "number",
    variants: [
      { begin: "\\b0[bB][01]+(?:_[01]+)*\\b" },
      // Binary w/ underscore support
      { begin: "\\b0[oO][0-7]+(?:_[0-7]+)*\\b" },
      // Octals w/ underscore support
      { begin: "\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b" },
      // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: "(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?" }
    ],
    relevance: 0
  }, v = [
    "false",
    "null",
    "true"
  ], x = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ], m = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ], w = {
    keyword: x,
    literal: ((W) => {
      const B = [];
      return W.forEach((q) => {
        B.push(q), q.toLowerCase() === q ? B.push(q.toUpperCase()) : B.push(q.toLowerCase());
      }), B;
    })(v),
    built_in: m
  }, _ = (W) => W.map((B) => B.replace(/\|\d+$/, "")), C = { variants: [
    {
      match: [
        /new/,
        n.concat(d, "+"),
        // to prevent built ins from being confused as the class constructor call
        n.concat("(?!", _(m).join("\\b|"), "\\b)"),
        i
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] }, M = n.concat(r, "\\b(?!\\()"), S = { variants: [
    {
      match: [
        n.concat(
          /::/,
          n.lookahead(/(?!class\b)/)
        ),
        M
      ],
      scope: { 2: "variable.constant" }
    },
    {
      match: [
        /::/,
        /class/
      ],
      scope: { 2: "variable.language" }
    },
    {
      match: [
        i,
        n.concat(
          /::/,
          n.lookahead(/(?!class\b)/)
        ),
        M
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        i,
        n.concat(
          "::",
          n.lookahead(/(?!class\b)/)
        )
      ],
      scope: { 1: "title.class" }
    },
    {
      match: [
        i,
        /::/,
        /class/
      ],
      scope: {
        1: "title.class",
        3: "variable.language"
      }
    }
  ] }, I = {
    scope: "attr",
    match: n.concat(r, n.lookahead(":"), n.lookahead(/(?!::)/))
  }, L = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: w,
    contains: [
      I,
      a,
      S,
      e.C_BLOCK_COMMENT_MODE,
      f,
      h,
      C
    ]
  }, D = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      n.concat("(?!fn\\b|function\\b|", _(x).join("\\b|"), "|", _(m).join("\\b|"), "\\b)"),
      r,
      n.concat(d, "*"),
      n.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [L]
  };
  L.contains.push(D);
  const Y = [
    I,
    S,
    e.C_BLOCK_COMMENT_MODE,
    f,
    h,
    C
  ], J = {
    begin: n.concat(/#\[\s*/, i),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: v,
      keyword: [
        "new",
        "array"
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: v,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...Y
        ]
      },
      ...Y,
      {
        scope: "meta",
        match: i
      }
    ]
  };
  return {
    case_insensitive: !1,
    keywords: w,
    contains: [
      J,
      e.HASH_COMMENT_MODE,
      e.COMMENT("//", "$"),
      e.COMMENT(
        "/\\*",
        "\\*/",
        { contains: [
          {
            scope: "doctag",
            match: "@[A-Za-z]+"
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: "__halt_compiler",
        starts: {
          scope: "comment",
          end: e.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: !0
            }
          ]
        }
      },
      o,
      {
        scope: "variable.language",
        match: /\$this\b/
      },
      a,
      D,
      S,
      {
        match: [
          /const/,
          /\s/,
          r
        ],
        scope: {
          1: "keyword",
          3: "variable.constant"
        }
      },
      C,
      {
        scope: "function",
        relevance: 0,
        beginKeywords: "fn function",
        end: /[;{]/,
        excludeEnd: !0,
        illegal: "[$%\\[]",
        contains: [
          { beginKeywords: "use" },
          e.UNDERSCORE_TITLE_MODE,
          {
            begin: "=>",
            // No markup, just a relevance booster
            endsParent: !0
          },
          {
            scope: "params",
            begin: "\\(",
            end: "\\)",
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: w,
            contains: [
              "self",
              a,
              S,
              e.C_BLOCK_COMMENT_MODE,
              f,
              h
            ]
          }
        ]
      },
      {
        scope: "class",
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: !0,
        contains: [
          { beginKeywords: "extends implements" },
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: ";",
        illegal: /[.']/,
        contains: [e.inherit(e.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
      },
      {
        beginKeywords: "use",
        relevance: 0,
        end: ";",
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      f,
      h
    ]
  };
}
function Eb(e) {
  const n = "[ \\t\\f]*", t = "[ \\t\\f]+", r = n + "[:=]" + n, i = t, a = "(" + r + "|" + i + ")", o = "([^\\\\:= \\t\\f\\n]|\\\\.)+", l = {
    // skip DELIM
    end: a,
    relevance: 0,
    starts: {
      // value: everything until end of line (again, taking into account backslashes)
      className: "string",
      end: /$/,
      relevance: 0,
      contains: [
        { begin: "\\\\\\\\" },
        { begin: "\\\\\\n" }
      ]
    }
  };
  return {
    name: ".properties",
    disableAutodetect: !0,
    case_insensitive: !0,
    illegal: /\S/,
    contains: [
      e.COMMENT("^\\s*[!#]", "$"),
      // key: everything until whitespace or = or : (taking into account backslashes)
      // case of a key-value pair
      {
        returnBegin: !0,
        variants: [
          { begin: o + r },
          { begin: o + i }
        ],
        contains: [
          {
            className: "attr",
            begin: o,
            endsParent: !0
          }
        ],
        starts: l
      },
      // case of an empty key
      {
        className: "attr",
        begin: o + n + "$"
      }
    ]
  };
}
function xb(e) {
  const n = e.regex, t = /[\p{XID_Start}_]\p{XID_Continue}*/u, r = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ], l = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: r,
    built_in: [
      "__import__",
      "abs",
      "all",
      "any",
      "ascii",
      "bin",
      "bool",
      "breakpoint",
      "bytearray",
      "bytes",
      "callable",
      "chr",
      "classmethod",
      "compile",
      "complex",
      "delattr",
      "dict",
      "dir",
      "divmod",
      "enumerate",
      "eval",
      "exec",
      "filter",
      "float",
      "format",
      "frozenset",
      "getattr",
      "globals",
      "hasattr",
      "hash",
      "help",
      "hex",
      "id",
      "input",
      "int",
      "isinstance",
      "issubclass",
      "iter",
      "len",
      "list",
      "locals",
      "map",
      "max",
      "memoryview",
      "min",
      "next",
      "object",
      "oct",
      "open",
      "ord",
      "pow",
      "print",
      "property",
      "range",
      "repr",
      "reversed",
      "round",
      "set",
      "setattr",
      "slice",
      "sorted",
      "staticmethod",
      "str",
      "sum",
      "super",
      "tuple",
      "type",
      "vars",
      "zip"
    ],
    literal: [
      "__debug__",
      "Ellipsis",
      "False",
      "None",
      "NotImplemented",
      "True"
    ],
    type: [
      "Any",
      "Callable",
      "Coroutine",
      "Dict",
      "List",
      "Literal",
      "Generic",
      "Optional",
      "Sequence",
      "Set",
      "Tuple",
      "Type",
      "Union"
    ]
  }, s = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, u = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: l,
    illegal: /#/
  }, c = {
    begin: /\{\{/,
    relevance: 0
  }, d = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          s
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          s
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          s,
          c,
          u
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          s,
          c,
          u
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          e.BACKSLASH_ESCAPE,
          c,
          u
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          c,
          u
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, f = "[0-9](_?[0-9])*", h = `(\\b(${f}))?\\.(${f})|\\b(${f})\\.`, v = `\\b|${r.join("|")}`, x = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${f})|(${h}))[eE][+-]?(${f})[jJ]?(?=${v})`
      },
      {
        begin: `(${h})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${v})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${v})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${v})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${v})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${f})[jJ](?=${v})`
      }
    ]
  }, m = {
    className: "comment",
    begin: n.lookahead(/# type:/),
    end: /$/,
    keywords: l,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: !0
      }
    ]
  }, b = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: !0
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: !0,
        excludeEnd: !0,
        keywords: l,
        contains: [
          "self",
          s,
          x,
          d,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return u.contains = [
    d,
    x,
    s
  ], {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: !0,
    keywords: l,
    illegal: /(<\/|->|\?)|=>/,
    contains: [
      s,
      x,
      {
        // very common convention
        begin: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      d,
      m,
      e.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          t
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [b]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              t,
              /\s*/,
              /\(\s*/,
              t,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              t
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          x,
          b,
          d
        ]
      }
    ]
  };
}
function vb(e) {
  const n = e.regex, t = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)", r = n.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  ), i = n.concat(r, /(::\w+)*/), a = {
    "variable.constant": [
      "__FILE__",
      "__LINE__"
    ],
    "variable.language": [
      "self",
      "super"
    ],
    keyword: [
      "alias",
      "and",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "include",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield"
    ],
    built_in: [
      "proc",
      "lambda"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  }, o = {
    className: "doctag",
    begin: "@[A-Za-z]+"
  }, l = {
    begin: "#<",
    end: ">"
  }, s = [
    e.COMMENT(
      "#",
      "$",
      { contains: [o] }
    ),
    e.COMMENT(
      "^=begin",
      "^=end",
      {
        contains: [o],
        relevance: 10
      }
    ),
    e.COMMENT("^__END__", e.MATCH_NOTHING_RE)
  ], u = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: a
  }, c = {
    className: "string",
    contains: [
      e.BACKSLASH_ESCAPE,
      u
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: n.concat(
          /<<[-~]?'?/,
          n.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          e.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              e.BACKSLASH_ESCAPE,
              u
            ]
          })
        ]
      }
    ]
  }, d = "[1-9](_?[0-9])*|0", f = "[0-9](_?[0-9])*", h = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${d})(\\.(${f}))?([eE][+-]?(${f})|r)?i?\\b` },
      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  }, v = {
    variants: [
      {
        match: /\(\)/
      },
      {
        className: "params",
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: !0,
        endsParent: !0,
        keywords: a
      }
    ]
  }, _ = [
    c,
    {
      variants: [
        {
          match: [
            /class\s+/,
            i,
            /\s+<\s+/,
            i
          ]
        },
        {
          match: [
            /class\s+/,
            i
          ]
        }
      ],
      scope: {
        2: "title.class",
        4: "title.class.inherited"
      },
      keywords: a
    },
    {
      relevance: 0,
      match: [
        i,
        /\.new[ (]/
      ],
      scope: {
        1: "title.class"
      }
    },
    {
      relevance: 0,
      match: /\b[A-Z][A-Z_0-9]+\b/,
      className: "variable.constant"
    },
    {
      match: [
        /def/,
        /\s+/,
        t
      ],
      scope: {
        1: "keyword",
        3: "title.function"
      },
      contains: [
        v
      ]
    },
    {
      // swallow namespace qualifiers before symbols
      begin: e.IDENT_RE + "::"
    },
    {
      className: "symbol",
      begin: e.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":(?!\\s)",
      contains: [
        c,
        { begin: t }
      ],
      relevance: 0
    },
    h,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: "(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])"
    },
    {
      className: "params",
      begin: /\|/,
      end: /\|/,
      excludeBegin: !0,
      excludeEnd: !0,
      relevance: 0,
      // this could be a lot of things (in other languages) other than params
      keywords: a
    },
    {
      // regexp container
      begin: "(" + e.RE_STARTERS_RE + "|unless)\\s*",
      keywords: "unless",
      contains: [
        {
          className: "regexp",
          contains: [
            e.BACKSLASH_ESCAPE,
            u
          ],
          illegal: /\n/,
          variants: [
            {
              begin: "/",
              end: "/[a-z]*"
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: "%r\\(",
              end: "\\)[a-z]*"
            },
            {
              begin: "%r!",
              end: "![a-z]*"
            },
            {
              begin: "%r\\[",
              end: "\\][a-z]*"
            }
          ]
        }
      ].concat(l, s),
      relevance: 0
    }
  ].concat(l, s);
  u.contains = _, v.contains = _;
  const C = "[>?]>", M = "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]", S = "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>", I = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: _
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + C + "|" + M + "|" + S + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: a,
        contains: _
      }
    }
  ];
  return s.unshift(l), {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: a,
    illegal: /\/\*/,
    contains: [e.SHEBANG({ binary: "ruby" })].concat(I).concat(s).concat(_)
  };
}
function _b(e) {
  const n = e.regex, t = {
    className: "title.function.invoke",
    relevance: 0,
    begin: n.concat(
      /\b/,
      /(?!let\b)/,
      e.IDENT_RE,
      n.lookahead(/\s*\(/)
    )
  }, r = "([ui](8|16|32|64|128|size)|f(32|64))?", i = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ], a = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ], o = [
    // functions
    "drop ",
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bin!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ], l = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: "Rust",
    aliases: ["rs"],
    keywords: {
      $pattern: e.IDENT_RE + "!?",
      type: l,
      keyword: i,
      literal: a,
      built_in: o
    },
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
      e.inherit(e.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: "string",
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          { begin: /b?'\\?(x\w{2}|u\w{4}|U\w{8}|.)'/ }
        ]
      },
      {
        className: "symbol",
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*/
      },
      {
        className: "number",
        variants: [
          { begin: "\\b0b([01_]+)" + r },
          { begin: "\\b0o([0-7_]+)" + r },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + r },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + r }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          e.UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: "meta",
        begin: "#!?\\[",
        end: "\\]",
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          e.UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          e.UNDERSCORE_IDENT_RE,
          /\s+/,
          /in/
        ],
        className: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          e.UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          e.UNDERSCORE_IDENT_RE
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: e.IDENT_RE + "::",
        keywords: {
          keyword: "Self",
          built_in: o
        }
      },
      {
        className: "punctuation",
        begin: "->"
      },
      t
    ]
  };
}
function wb(e) {
  const n = e.regex, t = {
    className: "meta",
    begin: "@[A-Za-z]+"
  }, r = {
    className: "subst",
    variants: [
      { begin: "\\$[A-Za-z0-9_]+" },
      {
        begin: /\$\{/,
        end: /\}/
      }
    ]
  }, i = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""'
      },
      {
        begin: '"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: '[a-z]+"',
        end: '"',
        illegal: "\\n",
        contains: [
          e.BACKSLASH_ESCAPE,
          r
        ]
      },
      {
        className: "string",
        begin: '[a-z]+"""',
        end: '"""',
        contains: [r],
        relevance: 10
      }
    ]
  }, a = {
    className: "type",
    begin: "\\b[A-Z][A-Za-z0-9_]*",
    relevance: 0
  }, o = {
    className: "title",
    begin: /[^0-9\n\t "'(),.`{}\[\]:;][^\n\t "'(),.`{}\[\]:;]+|[^0-9\n\t "'(),.`{}\[\]:;=]/,
    relevance: 0
  }, l = {
    className: "class",
    beginKeywords: "class object trait type",
    end: /[:={\[\n;]/,
    excludeEnd: !0,
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        beginKeywords: "extends with",
        relevance: 10
      },
      {
        begin: /\[/,
        end: /\]/,
        excludeBegin: !0,
        excludeEnd: !0,
        relevance: 0,
        contains: [a]
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        excludeBegin: !0,
        excludeEnd: !0,
        relevance: 0,
        contains: [a]
      },
      o
    ]
  }, s = {
    className: "function",
    beginKeywords: "def",
    end: n.lookahead(/[:={\[(\n;]/),
    contains: [o]
  }, u = {
    begin: [
      /^\s*/,
      // Is first token on the line
      "extension",
      /\s+(?=[[(])/
      // followed by at least one space and `[` or `(`
    ],
    beginScope: { 2: "keyword" }
  }, c = [
    {
      begin: [
        /^\s*/,
        // Is first token on the line
        /end/,
        /\s+/,
        /(extension\b)?/
        // `extension` is the only marker that follows an `end` that cannot be captured by another rule.
      ],
      beginScope: {
        2: "keyword",
        4: "keyword"
      }
    }
  ], d = [
    { match: /\.inline\b/ },
    {
      begin: /\binline(?=\s)/,
      keywords: "inline"
    }
  ], f = {
    begin: [
      /\(\s*/,
      // Opening `(` of a parameter or argument list
      /using/,
      /\s+(?!\))/
      // Spaces not followed by `)`
    ],
    beginScope: { 2: "keyword" }
  };
  return {
    name: "Scala",
    keywords: {
      literal: "true false null",
      keyword: "type yield lazy override def with val var sealed abstract private trait object if then forSome for while do throw finally protected extends import final return else break new catch super class case package default try this match continue throws implicit export enum given"
    },
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      i,
      a,
      s,
      l,
      e.C_NUMBER_MODE,
      u,
      c,
      ...d,
      f,
      t
    ]
  };
}
function Sb(e) {
  return {
    name: "Shell Session",
    aliases: [
      "console",
      "shellsession"
    ],
    contains: [
      {
        className: "meta.prompt",
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: "bash"
        }
      }
    ]
  };
}
function kb(e) {
  const n = e.regex, t = e.COMMENT("--", "$"), r = {
    className: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [{ begin: /''/ }]
      }
    ]
  }, i = {
    begin: /"/,
    end: /"/,
    contains: [{ begin: /""/ }]
  }, a = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ], o = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ], l = [
    "bigint",
    "binary",
    "blob",
    "boolean",
    "char",
    "character",
    "clob",
    "date",
    "dec",
    "decfloat",
    "decimal",
    "float",
    "int",
    "integer",
    "interval",
    "nchar",
    "nclob",
    "national",
    "numeric",
    "real",
    "row",
    "smallint",
    "time",
    "timestamp",
    "varchar",
    "varying",
    // modifier (character varying)
    "varbinary"
  ], s = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ], u = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year"
  ], c = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket"
  ], d = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ], f = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ], h = c, v = [
    ...u,
    ...s
  ].filter((_) => !c.includes(_)), x = {
    className: "variable",
    begin: /@[a-z0-9]+/
  }, m = {
    className: "operator",
    begin: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  }, b = {
    begin: n.concat(/\b/, n.either(...h), /\s*\(/),
    relevance: 0,
    keywords: { built_in: h }
  };
  function w(_, {
    exceptions: C,
    when: M
  } = {}) {
    const S = M;
    return C = C || [], _.map((I) => I.match(/\|\d+$/) || C.includes(I) ? I : S(I) ? `${I}|0` : I);
  }
  return {
    name: "SQL",
    case_insensitive: !0,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: w(v, { when: (_) => _.length < 3 }),
      literal: a,
      type: l,
      built_in: d
    },
    contains: [
      {
        begin: n.either(...f),
        relevance: 0,
        keywords: {
          $pattern: /[\w\.]+/,
          keyword: v.concat(f),
          literal: a,
          type: l
        }
      },
      {
        className: "type",
        begin: n.either(...o)
      },
      b,
      x,
      r,
      i,
      e.C_NUMBER_MODE,
      e.C_BLOCK_COMMENT_MODE,
      t,
      m
    ]
  };
}
function Lu(e) {
  return e ? typeof e == "string" ? e : e.source : null;
}
function Kt(e) {
  return Te("(?=", e, ")");
}
function Te(...e) {
  return e.map((t) => Lu(t)).join("");
}
function Nb(e) {
  const n = e[e.length - 1];
  return typeof n == "object" && n.constructor === Object ? (e.splice(e.length - 1, 1), n) : {};
}
function rn(...e) {
  return "(" + (Nb(e).capture ? "" : "?:") + e.map((r) => Lu(r)).join("|") + ")";
}
const Di = (e) => Te(
  /\b/,
  e,
  /\w$/.test(e) ? /\b/ : /\B/
), Ob = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(Di), po = [
  "init",
  "self"
].map(Di), Cb = [
  "Any",
  "Self"
], Dr = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  "actor",
  "associatedtype",
  "async",
  "await",
  /as\?/,
  // operator
  /as!/,
  // operator
  "as",
  // operator
  "break",
  "case",
  "catch",
  "class",
  "continue",
  "convenience",
  // contextual
  "default",
  "defer",
  "deinit",
  "didSet",
  // contextual
  "do",
  "dynamic",
  // contextual
  "else",
  "enum",
  "extension",
  "fallthrough",
  /fileprivate\(set\)/,
  "fileprivate",
  "final",
  // contextual
  "for",
  "func",
  "get",
  // contextual
  "guard",
  "if",
  "import",
  "indirect",
  // contextual
  "infix",
  // contextual
  /init\?/,
  /init!/,
  "inout",
  /internal\(set\)/,
  "internal",
  "in",
  "is",
  // operator
  "isolated",
  // contextual
  "nonisolated",
  // contextual
  "lazy",
  // contextual
  "let",
  "mutating",
  // contextual
  "nonmutating",
  // contextual
  /open\(set\)/,
  // contextual
  "open",
  // contextual
  "operator",
  "optional",
  // contextual
  "override",
  // contextual
  "postfix",
  // contextual
  "precedencegroup",
  "prefix",
  // contextual
  /private\(set\)/,
  "private",
  "protocol",
  /public\(set\)/,
  "public",
  "repeat",
  "required",
  // contextual
  "rethrows",
  "return",
  "set",
  // contextual
  "some",
  // contextual
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throws",
  "throw",
  /try\?/,
  // operator
  /try!/,
  // operator
  "try",
  // operator
  "typealias",
  /unowned\(safe\)/,
  // contextual
  /unowned\(unsafe\)/,
  // contextual
  "unowned",
  // contextual
  "var",
  "weak",
  // contextual
  "where",
  "while",
  "willSet"
  // contextual
], fo = [
  "false",
  "nil",
  "true"
], Tb = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
], Ab = [
  "#colorLiteral",
  "#column",
  "#dsohandle",
  "#else",
  "#elseif",
  "#endif",
  "#error",
  "#file",
  "#fileID",
  "#fileLiteral",
  "#filePath",
  "#function",
  "#if",
  "#imageLiteral",
  "#keyPath",
  "#line",
  "#selector",
  "#sourceLocation",
  "#warn_unqualified_access",
  "#warning"
], go = [
  "abs",
  "all",
  "any",
  "assert",
  "assertionFailure",
  "debugPrint",
  "dump",
  "fatalError",
  "getVaList",
  "isKnownUniquelyReferenced",
  "max",
  "min",
  "numericCast",
  "pointwiseMax",
  "pointwiseMin",
  "precondition",
  "preconditionFailure",
  "print",
  "readLine",
  "repeatElement",
  "sequence",
  "stride",
  "swap",
  "swift_unboxFromSwiftValueWithType",
  "transcode",
  "type",
  "unsafeBitCast",
  "unsafeDowncast",
  "withExtendedLifetime",
  "withUnsafeMutablePointer",
  "withUnsafePointer",
  "withVaList",
  "withoutActuallyEscaping",
  "zip"
], Pu = rn(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
), Bu = rn(
  Pu,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
), Lr = Te(Pu, Bu, "*"), Fu = rn(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/
  // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
), rr = rn(
  Fu,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
), Cn = Te(Fu, rr, "*"), Pr = Te(/[A-Z]/, rr, "*"), Mb = [
  "autoclosure",
  Te(/convention\(/, rn("swift", "block", "c"), /\)/),
  "discardableResult",
  "dynamicCallable",
  "dynamicMemberLookup",
  "escaping",
  "frozen",
  "GKInspectable",
  "IBAction",
  "IBDesignable",
  "IBInspectable",
  "IBOutlet",
  "IBSegueAction",
  "inlinable",
  "main",
  "nonobjc",
  "NSApplicationMain",
  "NSCopying",
  "NSManaged",
  Te(/objc\(/, Cn, /\)/),
  "objc",
  "objcMembers",
  "propertyWrapper",
  "requires_stored_property_inits",
  "resultBuilder",
  "testable",
  "UIApplicationMain",
  "unknown",
  "usableFromInline"
], Ib = [
  "iOS",
  "iOSApplicationExtension",
  "macOS",
  "macOSApplicationExtension",
  "macCatalyst",
  "macCatalystApplicationExtension",
  "watchOS",
  "watchOSApplicationExtension",
  "tvOS",
  "tvOSApplicationExtension",
  "swift"
];
function Rb(e) {
  const n = {
    match: /\s+/,
    relevance: 0
  }, t = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  ), r = [
    e.C_LINE_COMMENT_MODE,
    t
  ], i = {
    match: [
      /\./,
      rn(...Ob, ...po)
    ],
    className: { 2: "keyword" }
  }, a = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: Te(/\./, rn(...Dr)),
    relevance: 0
  }, o = Dr.filter((pe) => typeof pe == "string").concat(["_|0"]), l = Dr.filter((pe) => typeof pe != "string").concat(Cb).map(Di), s = { variants: [
    {
      className: "keyword",
      match: rn(...l, ...po)
    }
  ] }, u = {
    $pattern: rn(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: o.concat(Ab),
    literal: fo
  }, c = [
    i,
    a,
    s
  ], d = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: Te(/\./, rn(...go)),
    relevance: 0
  }, f = {
    className: "built_in",
    match: Te(/\b/, rn(...go), /(?=\()/)
  }, h = [
    d,
    f
  ], v = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  }, x = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: Lr },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${Bu})+`
      }
    ]
  }, m = [
    v,
    x
  ], b = "([0-9]_*)+", w = "([0-9a-fA-F]_*)+", _ = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${b})(\\.(${b}))?([eE][+-]?(${b}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${w})(\\.(${w}))?([pP][+-]?(${b}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  }, C = (pe = "") => ({
    className: "subst",
    variants: [
      { match: Te(/\\/, pe, /[0\\tnr"']/) },
      { match: Te(/\\/, pe, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  }), M = (pe = "") => ({
    className: "subst",
    match: Te(/\\/, pe, /[\t ]*(?:[\r\n]|\r\n)/)
  }), S = (pe = "") => ({
    className: "subst",
    label: "interpol",
    begin: Te(/\\/, pe, /\(/),
    end: /\)/
  }), I = (pe = "") => ({
    begin: Te(pe, /"""/),
    end: Te(/"""/, pe),
    contains: [
      C(pe),
      M(pe),
      S(pe)
    ]
  }), L = (pe = "") => ({
    begin: Te(pe, /"/),
    end: Te(/"/, pe),
    contains: [
      C(pe),
      S(pe)
    ]
  }), D = {
    className: "string",
    variants: [
      I(),
      I("#"),
      I("##"),
      I("###"),
      L(),
      L("#"),
      L("##"),
      L("###")
    ]
  }, Y = { match: Te(/`/, Cn, /`/) }, J = {
    className: "variable",
    match: /\$\d+/
  }, W = {
    className: "variable",
    match: `\\$${rr}+`
  }, B = [
    Y,
    J,
    W
  ], q = {
    match: /(@|#(un)?)available/,
    className: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: Ib,
        contains: [
          ...m,
          _,
          D
        ]
      }
    ] }
  }, G = {
    className: "keyword",
    match: Te(/@/, rn(...Mb))
  }, T = {
    className: "meta",
    match: Te(/@/, Cn)
  }, P = [
    q,
    G,
    T
  ], $ = {
    match: Kt(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: Te(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, rr, "+")
      },
      {
        // Type identifier
        className: "type",
        match: Pr,
        relevance: 0
      },
      {
        // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      {
        // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      {
        // Protocol composition
        match: Te(/\s+&\s+/, Kt(Pr)),
        relevance: 0
      }
    ]
  }, j = {
    begin: /</,
    end: />/,
    keywords: u,
    contains: [
      ...r,
      ...c,
      ...P,
      v,
      $
    ]
  };
  $.contains.push(j);
  const E = {
    match: Te(Cn, /\s*:/),
    keywords: "_|0",
    relevance: 0
  }, ue = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: u,
    contains: [
      "self",
      E,
      ...r,
      ...c,
      ...h,
      ...m,
      _,
      D,
      ...B,
      ...P,
      $
    ]
  }, Z = {
    begin: /</,
    end: />/,
    contains: [
      ...r,
      $
    ]
  }, y = {
    begin: rn(
      Kt(Te(Cn, /\s*:/)),
      Kt(Te(Cn, /\s+/, Cn, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        match: /\b_\b/
      },
      {
        className: "params",
        match: Cn
      }
    ]
  }, z = {
    begin: /\(/,
    end: /\)/,
    keywords: u,
    contains: [
      y,
      ...r,
      ...c,
      ...m,
      _,
      D,
      ...P,
      $,
      ue
    ],
    endsParent: !0,
    illegal: /["']/
  }, V = {
    match: [
      /func/,
      /\s+/,
      rn(Y.match, Cn, Lr)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      Z,
      z,
      n
    ],
    illegal: [
      /\[/,
      /%/
    ]
  }, te = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/
    ],
    className: { 1: "keyword" },
    contains: [
      Z,
      z,
      n
    ],
    illegal: /\[|%/
  }, ie = {
    match: [
      /operator/,
      /\s+/,
      Lr
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  }, de = {
    begin: [
      /precedencegroup/,
      /\s+/,
      Pr
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [$],
    keywords: [
      ...Tb,
      ...fo
    ],
    end: /}/
  };
  for (const pe of D.variants) {
    const Oe = pe.contains.find((Re) => Re.label === "interpol");
    Oe.keywords = u;
    const Be = [
      ...c,
      ...h,
      ...m,
      _,
      D,
      ...B
    ];
    Oe.contains = [
      ...Be,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...Be
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: u,
    contains: [
      ...r,
      V,
      te,
      {
        beginKeywords: "struct protocol class extension enum actor",
        end: "\\{",
        excludeEnd: !0,
        keywords: u,
        contains: [
          e.inherit(e.TITLE_MODE, {
            className: "title.class",
            begin: /[A-Za-z$_][\u00C0-\u02B80-9A-Za-z$_]*/
          }),
          ...c
        ]
      },
      ie,
      de,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...r],
        relevance: 0
      },
      ...c,
      ...h,
      ...m,
      _,
      D,
      ...B,
      ...P,
      $,
      ue
    ]
  };
}
const ir = "[A-Za-z$_][0-9A-Za-z$_]*", $u = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends"
], zu = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], Uu = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], Hu = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], ju = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], qu = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "module",
  "global"
  // Node.js
], Ku = [].concat(
  ju,
  Uu,
  Hu
);
function Db(e) {
  const n = e.regex, t = (P, { after: $ }) => {
    const j = "</" + P[0].slice(1);
    return P.input.indexOf(j, $) !== -1;
  }, r = ir, i = {
    begin: "<>",
    end: "</>"
  }, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (P, $) => {
      const j = P[0].length + P.index, E = P.input[j];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        E === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        E === ","
      ) {
        $.ignoreMatch();
        return;
      }
      E === ">" && (t(P, { after: j }) || $.ignoreMatch());
      let ue;
      if ((ue = P.input.substr(j).match(/^\s+extends\s+/)) && ue.index === 0) {
        $.ignoreMatch();
        return;
      }
    }
  }, l = {
    $pattern: ir,
    keyword: $u,
    literal: zu,
    built_in: Ku,
    "variable.language": qu
  }, s = "[0-9](_?[0-9])*", u = `\\.(${s})`, c = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${c})((${u})|\\.)?|(${u}))[eE][+-]?(${s})\\b` },
      { begin: `\\b(${c})\\b((${u})\\b|\\.)?|(${u})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, f = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: l,
    contains: []
    // defined later
  }, h = {
    begin: "html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "xml"
    }
  }, v = {
    begin: "css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "css"
    }
  }, x = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      f
    ]
  }, b = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: r + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, w = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    h,
    v,
    x,
    d
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  f.contains = w.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: l,
    contains: [
      "self"
    ].concat(w)
  });
  const _ = [].concat(b, f.contains), C = _.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: l,
      contains: ["self"].concat(_)
    }
  ]), M = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: l,
    contains: C
  }, S = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          r,
          /\s+/,
          /extends/,
          /\s+/,
          n.concat(r, "(", n.concat(/\./, r), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          r
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, I = {
    relevance: 0,
    match: n.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...Uu,
        ...Hu
      ]
    }
  }, L = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, D = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          r,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [M],
    illegal: /%/
  }, Y = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function J(P) {
    return n.concat("(?!", P.join("|"), ")");
  }
  const W = {
    match: n.concat(
      /\b/,
      J([
        ...ju,
        "super"
      ]),
      r,
      n.lookahead(/\(/)
    ),
    className: "title.function",
    relevance: 0
  }, B = {
    begin: n.concat(/\./, n.lookahead(
      n.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, q = {
    match: [
      /get|set/,
      /\s+/,
      r,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      M
    ]
  }, G = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", T = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      n.lookahead(G)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      M
    ]
  };
  return {
    name: "Javascript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: l,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: C, CLASS_REFERENCE: I },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      L,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      h,
      v,
      x,
      b,
      d,
      I,
      {
        className: "attr",
        begin: r + n.lookahead(":"),
        relevance: 0
      },
      T,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          b,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: G,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: l,
                    contains: C
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: i.begin, end: i.end },
              { match: a },
              {
                begin: o.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": o.isTrulyOpeningTag,
                end: o.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: o.begin,
                end: o.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      D,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          M,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      B,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + r,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [M]
      },
      W,
      Y,
      S,
      q,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function Lb(e) {
  const n = Db(e), t = ir, r = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ], i = {
    beginKeywords: "namespace",
    end: /\{/,
    excludeEnd: !0,
    contains: [n.exports.CLASS_REFERENCE]
  }, a = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: !0,
    keywords: {
      keyword: "interface extends",
      built_in: r
    },
    contains: [n.exports.CLASS_REFERENCE]
  }, o = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  }, l = [
    "type",
    "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override"
  ], s = {
    $pattern: ir,
    keyword: $u.concat(l),
    literal: zu,
    built_in: Ku.concat(r),
    "variable.language": qu
  }, u = {
    className: "meta",
    begin: "@" + t
  }, c = (f, h, v) => {
    const x = f.contains.findIndex((m) => m.label === h);
    if (x === -1)
      throw new Error("can not find mode to replace");
    f.contains.splice(x, 1, v);
  };
  Object.assign(n.keywords, s), n.exports.PARAMS_CONTAINS.push(u), n.contains = n.contains.concat([
    u,
    i,
    a
  ]), c(n, "shebang", e.SHEBANG()), c(n, "use_strict", o);
  const d = n.contains.find((f) => f.label === "func.def");
  return d.relevance = 0, Object.assign(n, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx"
    ]
  }), n;
}
function Pb(e) {
  const n = e.regex, t = n.concat(/[A-Z_]/, n.optional(/[A-Z0-9_.-]*:/), /[A-Z0-9_.-]*/), r = /[A-Za-z0-9._:-]+/, i = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  }, a = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  }, o = e.inherit(a, {
    begin: /\(/,
    end: /\)/
  }), l = e.inherit(e.APOS_STRING_MODE, { className: "string" }), s = e.inherit(e.QUOTE_STRING_MODE, { className: "string" }), u = {
    endsWithParent: !0,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: r,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: !0,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [i]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [i]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: !0,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          a,
          s,
          l,
          o,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  a,
                  o,
                  s,
                  l
                ]
              }
            ]
          }
        ]
      },
      e.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      i,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              s
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [u],
        starts: {
          end: /<\/style>/,
          returnEnd: !0,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [u],
        starts: {
          end: /<\/script>/,
          returnEnd: !0,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: n.concat(
          /</,
          n.lookahead(n.concat(
            t,
            // <tag/>
            // <tag>
            // <tag ...
            n.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: t,
            relevance: 0,
            starts: u
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: n.concat(
          /<\//,
          n.lookahead(n.concat(
            t,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: t,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: !0
          }
        ]
      }
    ]
  };
}
function Bb(e) {
  const n = "true false yes no null", t = "[\\w#;/?:@&=+$,.~*'()[\\]]+", r = {
    className: "attr",
    variants: [
      { begin: "\\w[\\w :\\/.-]*:(?=[ 	]|$)" },
      {
        // double quoted keys
        begin: '"\\w[\\w :\\/.-]*":(?=[ 	]|$)'
      },
      {
        // single quoted keys
        begin: "'\\w[\\w :\\/.-]*':(?=[ 	]|$)"
      }
    ]
  }, i = {
    className: "template-variable",
    variants: [
      {
        // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      {
        // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  }, a = {
    className: "string",
    relevance: 0,
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      e.BACKSLASH_ESCAPE,
      i
    ]
  }, o = e.inherit(a, { variants: [
    {
      begin: /'/,
      end: /'/
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] }), l = "[0-9]{4}(-[0-9][0-9]){0,2}", s = "([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?", u = "(\\.[0-9]*)?", c = "([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?", d = {
    className: "number",
    begin: "\\b" + l + s + u + c + "\\b"
  }, f = {
    end: ",",
    endsWithParent: !0,
    excludeEnd: !0,
    keywords: n,
    relevance: 0
  }, h = {
    begin: /\{/,
    end: /\}/,
    contains: [f],
    illegal: "\\n",
    relevance: 0
  }, v = {
    begin: "\\[",
    end: "\\]",
    contains: [f],
    illegal: "\\n",
    relevance: 0
  }, x = [
    r,
    {
      className: "meta",
      begin: "^---\\s*$",
      relevance: 10
    },
    {
      // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: "string",
      begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
    },
    {
      // Ruby/Rails erb
      begin: "<%[%=-]?",
      end: "[%-]?%>",
      subLanguage: "ruby",
      excludeBegin: !0,
      excludeEnd: !0,
      relevance: 0
    },
    {
      // named tags
      className: "type",
      begin: "!\\w+!" + t
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    {
      // verbatim tags
      className: "type",
      begin: "!<" + t + ">"
    },
    {
      // primary tags
      className: "type",
      begin: "!" + t
    },
    {
      // secondary tags
      className: "type",
      begin: "!!" + t
    },
    {
      // fragment id &ref
      className: "meta",
      begin: "&" + e.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // fragment reference *ref
      className: "meta",
      begin: "\\*" + e.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // array listing
      className: "bullet",
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: "-(?=[ ]|$)",
      relevance: 0
    },
    e.HASH_COMMENT_MODE,
    {
      beginKeywords: n,
      keywords: { literal: n }
    },
    d,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: "number",
      begin: e.C_NUMBER_RE + "\\b",
      relevance: 0
    },
    h,
    v,
    a
  ], m = [...x];
  return m.pop(), m.push(o), f.contains = m, {
    name: "YAML",
    case_insensitive: !0,
    aliases: ["yml"],
    contains: x
  };
}
var Gu = { exports: {} };
/*!
 * clipboard.js v2.0.11
 * https://clipboardjs.com/
 *
 * Licensed MIT © Zeno Rocha
 */
(function(e, n) {
  (function(r, i) {
    e.exports = i();
  })(At, function() {
    return (
      /******/
      function() {
        var t = {
          /***/
          686: (
            /***/
            function(a, o, l) {
              l.d(o, {
                default: function() {
                  return (
                    /* binding */
                    ue
                  );
                }
              });
              var s = l(279), u = /* @__PURE__ */ l.n(s), c = l(370), d = /* @__PURE__ */ l.n(c), f = l(817), h = /* @__PURE__ */ l.n(f);
              function v(Z) {
                try {
                  return document.execCommand(Z);
                } catch {
                  return !1;
                }
              }
              var x = function(y) {
                var z = h()(y);
                return v("cut"), z;
              }, m = x;
              function b(Z) {
                var y = document.documentElement.getAttribute("dir") === "rtl", z = document.createElement("textarea");
                z.style.fontSize = "12pt", z.style.border = "0", z.style.padding = "0", z.style.margin = "0", z.style.position = "absolute", z.style[y ? "right" : "left"] = "-9999px";
                var V = window.pageYOffset || document.documentElement.scrollTop;
                return z.style.top = "".concat(V, "px"), z.setAttribute("readonly", ""), z.value = Z, z;
              }
              var w = function(y, z) {
                var V = b(y);
                z.container.appendChild(V);
                var te = h()(V);
                return v("copy"), V.remove(), te;
              }, _ = function(y) {
                var z = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                  container: document.body
                }, V = "";
                return typeof y == "string" ? V = w(y, z) : y instanceof HTMLInputElement && !["text", "search", "url", "tel", "password"].includes(y == null ? void 0 : y.type) ? V = w(y.value, z) : (V = h()(y), v("copy")), V;
              }, C = _;
              function M(Z) {
                "@babel/helpers - typeof";
                return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? M = function(z) {
                  return typeof z;
                } : M = function(z) {
                  return z && typeof Symbol == "function" && z.constructor === Symbol && z !== Symbol.prototype ? "symbol" : typeof z;
                }, M(Z);
              }
              var S = function() {
                var y = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, z = y.action, V = z === void 0 ? "copy" : z, te = y.container, ie = y.target, de = y.text;
                if (V !== "copy" && V !== "cut")
                  throw new Error('Invalid "action" value, use either "copy" or "cut"');
                if (ie !== void 0)
                  if (ie && M(ie) === "object" && ie.nodeType === 1) {
                    if (V === "copy" && ie.hasAttribute("disabled"))
                      throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
                    if (V === "cut" && (ie.hasAttribute("readonly") || ie.hasAttribute("disabled")))
                      throw new Error(`Invalid "target" attribute. You can't cut text from elements with "readonly" or "disabled" attributes`);
                  } else
                    throw new Error('Invalid "target" value, use a valid Element');
                if (de)
                  return C(de, {
                    container: te
                  });
                if (ie)
                  return V === "cut" ? m(ie) : C(ie, {
                    container: te
                  });
              }, I = S;
              function L(Z) {
                "@babel/helpers - typeof";
                return typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? L = function(z) {
                  return typeof z;
                } : L = function(z) {
                  return z && typeof Symbol == "function" && z.constructor === Symbol && z !== Symbol.prototype ? "symbol" : typeof z;
                }, L(Z);
              }
              function D(Z, y) {
                if (!(Z instanceof y))
                  throw new TypeError("Cannot call a class as a function");
              }
              function Y(Z, y) {
                for (var z = 0; z < y.length; z++) {
                  var V = y[z];
                  V.enumerable = V.enumerable || !1, V.configurable = !0, "value" in V && (V.writable = !0), Object.defineProperty(Z, V.key, V);
                }
              }
              function J(Z, y, z) {
                return y && Y(Z.prototype, y), z && Y(Z, z), Z;
              }
              function W(Z, y) {
                if (typeof y != "function" && y !== null)
                  throw new TypeError("Super expression must either be null or a function");
                Z.prototype = Object.create(y && y.prototype, { constructor: { value: Z, writable: !0, configurable: !0 } }), y && B(Z, y);
              }
              function B(Z, y) {
                return B = Object.setPrototypeOf || function(V, te) {
                  return V.__proto__ = te, V;
                }, B(Z, y);
              }
              function q(Z) {
                var y = P();
                return function() {
                  var V = $(Z), te;
                  if (y) {
                    var ie = $(this).constructor;
                    te = Reflect.construct(V, arguments, ie);
                  } else
                    te = V.apply(this, arguments);
                  return G(this, te);
                };
              }
              function G(Z, y) {
                return y && (L(y) === "object" || typeof y == "function") ? y : T(Z);
              }
              function T(Z) {
                if (Z === void 0)
                  throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                return Z;
              }
              function P() {
                if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham)
                  return !1;
                if (typeof Proxy == "function")
                  return !0;
                try {
                  return Date.prototype.toString.call(Reflect.construct(Date, [], function() {
                  })), !0;
                } catch {
                  return !1;
                }
              }
              function $(Z) {
                return $ = Object.setPrototypeOf ? Object.getPrototypeOf : function(z) {
                  return z.__proto__ || Object.getPrototypeOf(z);
                }, $(Z);
              }
              function j(Z, y) {
                var z = "data-clipboard-".concat(Z);
                if (y.hasAttribute(z))
                  return y.getAttribute(z);
              }
              var E = /* @__PURE__ */ function(Z) {
                W(z, Z);
                var y = q(z);
                function z(V, te) {
                  var ie;
                  return D(this, z), ie = y.call(this), ie.resolveOptions(te), ie.listenClick(V), ie;
                }
                return J(z, [{
                  key: "resolveOptions",
                  value: function() {
                    var te = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                    this.action = typeof te.action == "function" ? te.action : this.defaultAction, this.target = typeof te.target == "function" ? te.target : this.defaultTarget, this.text = typeof te.text == "function" ? te.text : this.defaultText, this.container = L(te.container) === "object" ? te.container : document.body;
                  }
                  /**
                   * Adds a click event listener to the passed trigger.
                   * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
                   */
                }, {
                  key: "listenClick",
                  value: function(te) {
                    var ie = this;
                    this.listener = d()(te, "click", function(de) {
                      return ie.onClick(de);
                    });
                  }
                  /**
                   * Defines a new `ClipboardAction` on each click event.
                   * @param {Event} e
                   */
                }, {
                  key: "onClick",
                  value: function(te) {
                    var ie = te.delegateTarget || te.currentTarget, de = this.action(ie) || "copy", pe = I({
                      action: de,
                      container: this.container,
                      target: this.target(ie),
                      text: this.text(ie)
                    });
                    this.emit(pe ? "success" : "error", {
                      action: de,
                      text: pe,
                      trigger: ie,
                      clearSelection: function() {
                        ie && ie.focus(), window.getSelection().removeAllRanges();
                      }
                    });
                  }
                  /**
                   * Default `action` lookup function.
                   * @param {Element} trigger
                   */
                }, {
                  key: "defaultAction",
                  value: function(te) {
                    return j("action", te);
                  }
                  /**
                   * Default `target` lookup function.
                   * @param {Element} trigger
                   */
                }, {
                  key: "defaultTarget",
                  value: function(te) {
                    var ie = j("target", te);
                    if (ie)
                      return document.querySelector(ie);
                  }
                  /**
                   * Allow fire programmatically a copy action
                   * @param {String|HTMLElement} target
                   * @param {Object} options
                   * @returns Text copied.
                   */
                }, {
                  key: "defaultText",
                  /**
                   * Default `text` lookup function.
                   * @param {Element} trigger
                   */
                  value: function(te) {
                    return j("text", te);
                  }
                  /**
                   * Destroy lifecycle.
                   */
                }, {
                  key: "destroy",
                  value: function() {
                    this.listener.destroy();
                  }
                }], [{
                  key: "copy",
                  value: function(te) {
                    var ie = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {
                      container: document.body
                    };
                    return C(te, ie);
                  }
                  /**
                   * Allow fire programmatically a cut action
                   * @param {String|HTMLElement} target
                   * @returns Text cutted.
                   */
                }, {
                  key: "cut",
                  value: function(te) {
                    return m(te);
                  }
                  /**
                   * Returns the support of the given action, or all actions if no action is
                   * given.
                   * @param {String} [action]
                   */
                }, {
                  key: "isSupported",
                  value: function() {
                    var te = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ["copy", "cut"], ie = typeof te == "string" ? [te] : te, de = !!document.queryCommandSupported;
                    return ie.forEach(function(pe) {
                      de = de && !!document.queryCommandSupported(pe);
                    }), de;
                  }
                }]), z;
              }(u()), ue = E;
            }
          ),
          /***/
          828: (
            /***/
            function(a) {
              var o = 9;
              if (typeof Element < "u" && !Element.prototype.matches) {
                var l = Element.prototype;
                l.matches = l.matchesSelector || l.mozMatchesSelector || l.msMatchesSelector || l.oMatchesSelector || l.webkitMatchesSelector;
              }
              function s(u, c) {
                for (; u && u.nodeType !== o; ) {
                  if (typeof u.matches == "function" && u.matches(c))
                    return u;
                  u = u.parentNode;
                }
              }
              a.exports = s;
            }
          ),
          /***/
          438: (
            /***/
            function(a, o, l) {
              var s = l(828);
              function u(f, h, v, x, m) {
                var b = d.apply(this, arguments);
                return f.addEventListener(v, b, m), {
                  destroy: function() {
                    f.removeEventListener(v, b, m);
                  }
                };
              }
              function c(f, h, v, x, m) {
                return typeof f.addEventListener == "function" ? u.apply(null, arguments) : typeof v == "function" ? u.bind(null, document).apply(null, arguments) : (typeof f == "string" && (f = document.querySelectorAll(f)), Array.prototype.map.call(f, function(b) {
                  return u(b, h, v, x, m);
                }));
              }
              function d(f, h, v, x) {
                return function(m) {
                  m.delegateTarget = s(m.target, h), m.delegateTarget && x.call(f, m);
                };
              }
              a.exports = c;
            }
          ),
          /***/
          879: (
            /***/
            function(a, o) {
              o.node = function(l) {
                return l !== void 0 && l instanceof HTMLElement && l.nodeType === 1;
              }, o.nodeList = function(l) {
                var s = Object.prototype.toString.call(l);
                return l !== void 0 && (s === "[object NodeList]" || s === "[object HTMLCollection]") && "length" in l && (l.length === 0 || o.node(l[0]));
              }, o.string = function(l) {
                return typeof l == "string" || l instanceof String;
              }, o.fn = function(l) {
                var s = Object.prototype.toString.call(l);
                return s === "[object Function]";
              };
            }
          ),
          /***/
          370: (
            /***/
            function(a, o, l) {
              var s = l(879), u = l(438);
              function c(v, x, m) {
                if (!v && !x && !m)
                  throw new Error("Missing required arguments");
                if (!s.string(x))
                  throw new TypeError("Second argument must be a String");
                if (!s.fn(m))
                  throw new TypeError("Third argument must be a Function");
                if (s.node(v))
                  return d(v, x, m);
                if (s.nodeList(v))
                  return f(v, x, m);
                if (s.string(v))
                  return h(v, x, m);
                throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList");
              }
              function d(v, x, m) {
                return v.addEventListener(x, m), {
                  destroy: function() {
                    v.removeEventListener(x, m);
                  }
                };
              }
              function f(v, x, m) {
                return Array.prototype.forEach.call(v, function(b) {
                  b.addEventListener(x, m);
                }), {
                  destroy: function() {
                    Array.prototype.forEach.call(v, function(b) {
                      b.removeEventListener(x, m);
                    });
                  }
                };
              }
              function h(v, x, m) {
                return u(document.body, v, x, m);
              }
              a.exports = c;
            }
          ),
          /***/
          817: (
            /***/
            function(a) {
              function o(l) {
                var s;
                if (l.nodeName === "SELECT")
                  l.focus(), s = l.value;
                else if (l.nodeName === "INPUT" || l.nodeName === "TEXTAREA") {
                  var u = l.hasAttribute("readonly");
                  u || l.setAttribute("readonly", ""), l.select(), l.setSelectionRange(0, l.value.length), u || l.removeAttribute("readonly"), s = l.value;
                } else {
                  l.hasAttribute("contenteditable") && l.focus();
                  var c = window.getSelection(), d = document.createRange();
                  d.selectNodeContents(l), c.removeAllRanges(), c.addRange(d), s = c.toString();
                }
                return s;
              }
              a.exports = o;
            }
          ),
          /***/
          279: (
            /***/
            function(a) {
              function o() {
              }
              o.prototype = {
                on: function(l, s, u) {
                  var c = this.e || (this.e = {});
                  return (c[l] || (c[l] = [])).push({
                    fn: s,
                    ctx: u
                  }), this;
                },
                once: function(l, s, u) {
                  var c = this;
                  function d() {
                    c.off(l, d), s.apply(u, arguments);
                  }
                  return d._ = s, this.on(l, d, u);
                },
                emit: function(l) {
                  var s = [].slice.call(arguments, 1), u = ((this.e || (this.e = {}))[l] || []).slice(), c = 0, d = u.length;
                  for (c; c < d; c++)
                    u[c].fn.apply(u[c].ctx, s);
                  return this;
                },
                off: function(l, s) {
                  var u = this.e || (this.e = {}), c = u[l], d = [];
                  if (c && s)
                    for (var f = 0, h = c.length; f < h; f++)
                      c[f].fn !== s && c[f].fn._ !== s && d.push(c[f]);
                  return d.length ? u[l] = d : delete u[l], this;
                }
              }, a.exports = o, a.exports.TinyEmitter = o;
            }
          )
          /******/
        }, r = {};
        function i(a) {
          if (r[a])
            return r[a].exports;
          var o = r[a] = {
            /******/
            // no module.id needed
            /******/
            // no module.loaded needed
            /******/
            exports: {}
            /******/
          };
          return t[a](o, o.exports, i), o.exports;
        }
        return function() {
          i.n = function(a) {
            var o = a && a.__esModule ? (
              /******/
              function() {
                return a.default;
              }
            ) : (
              /******/
              function() {
                return a;
              }
            );
            return i.d(o, { a: o }), o;
          };
        }(), function() {
          i.d = function(a, o) {
            for (var l in o)
              i.o(o, l) && !i.o(a, l) && Object.defineProperty(a, l, { enumerable: !0, get: o[l] });
          };
        }(), function() {
          i.o = function(a, o) {
            return Object.prototype.hasOwnProperty.call(a, o);
          };
        }(), i(686);
      }().default
    );
  });
})(Gu);
var Fb = Gu.exports;
const Wu = /* @__PURE__ */ dn(Fb);
var Vu = { exports: {} };
(function(e, n) {
  (function(t, r) {
    e.exports = r(R, ur);
  })(At, function(t, r) {
    function i(m) {
      if (m && typeof m == "object" && "default" in m)
        return m;
      var b = /* @__PURE__ */ Object.create(null);
      return m && Object.keys(m).forEach(function(w) {
        if (w !== "default") {
          var _ = Object.getOwnPropertyDescriptor(m, w);
          Object.defineProperty(b, w, _.get ? _ : { enumerable: !0, get: function() {
            return m[w];
          } });
        }
      }), b.default = m, Object.freeze(b);
    }
    var a = i(t);
    function o(m) {
      var b = function(w, _) {
        if (typeof w != "object" || !w)
          return w;
        var C = w[Symbol.toPrimitive];
        if (C !== void 0) {
          var M = C.call(w, _);
          if (typeof M != "object")
            return M;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(w);
      }(m, "string");
      return typeof b == "symbol" ? b : b + "";
    }
    function l(m, b, w) {
      return (b = o(b)) in m ? Object.defineProperty(m, b, { value: w, enumerable: !0, configurable: !0, writable: !0 }) : m[b] = w, m;
    }
    function s() {
      return s = Object.assign ? Object.assign.bind() : function(m) {
        for (var b = 1; b < arguments.length; b++) {
          var w = arguments[b];
          for (var _ in w)
            Object.prototype.hasOwnProperty.call(w, _) && (m[_] = w[_]);
        }
        return m;
      }, s.apply(this, arguments);
    }
    function u(m, b) {
      if (m == null)
        return {};
      var w, _, C = function(S, I) {
        if (S == null)
          return {};
        var L, D, Y = {}, J = Object.keys(S);
        for (D = 0; D < J.length; D++)
          L = J[D], I.indexOf(L) >= 0 || (Y[L] = S[L]);
        return Y;
      }(m, b);
      if (Object.getOwnPropertySymbols) {
        var M = Object.getOwnPropertySymbols(m);
        for (_ = 0; _ < M.length; _++)
          w = M[_], b.indexOf(w) >= 0 || Object.prototype.propertyIsEnumerable.call(m, w) && (C[w] = m[w]);
      }
      return C;
    }
    function c(m, b) {
      return b || (b = m.slice(0)), Object.freeze(Object.defineProperties(m, { raw: { value: Object.freeze(b) } }));
    }
    var d, f, h = { small: 14, default: 16, large: 20, xlarge: 24 }, v = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], x = function(m) {
      var b = m.className, w = m.size, _ = w === void 0 ? 16 : w, C = m.title, M = m["aria-label"], S = m["aria-labelledby"], I = m.fill, L = m.role, D = L === void 0 ? "img" : L, Y = u(m, v), J = r.css(d || (d = c([`
        color: `, `;
      `])), I), W = r.css(f || (f = c([`
        flex-shrink: 0;
      `]))), B = function(q, G, T) {
        var P, $ = T["aria-label"], j = T["aria-labelledby"], E = T.title;
        switch (q) {
          case "img":
            return $ || j || E ? l(l(l({}, "aria-labelledby", j), "aria-label", $), "title", E) : { "aria-label": (P = G, "".concat(P.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(D, "ChevronUp", l(l({ title: C }, "aria-label", M), "aria-labelledby", S));
      return a.createElement("svg", s({ className: r.cx(l({}, J, I != null), W, b), height: typeof _ == "number" ? _ : h[_], width: typeof _ == "number" ? _ : h[_], role: D }, B, Y, { viewBox: "0 0 16 16" }), a.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M14.364 10.7782C14.7545 10.3877 14.7545 9.75449 14.364 9.36396L9.41421 4.41421L8.70711 3.70711C8.31658 3.31658 7.68342 3.31658 7.29289 3.70711L6.58579 4.41421L1.63604 9.36396C1.24552 9.75448 1.24551 10.3876 1.63604 10.7782L2.34315 11.4853C2.73367 11.8758 3.36684 11.8758 3.75736 11.4853L8 7.24264L12.2426 11.4853C12.6332 11.8758 13.2663 11.8758 13.6569 11.4853L14.364 10.7782Z", fill: "currentColor" }));
    };
    return x.displayName = "ChevronUp", x.isGlyph = !0, x;
  });
})(Vu);
var $b = Vu.exports;
const zb = /* @__PURE__ */ dn($b);
function Ub(e) {
  var n = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(t, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function Yn(e, n, t) {
  return (n = Ub(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function St() {
  return St = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
    }
    return e;
  }, St.apply(this, arguments);
}
function Li(e, n) {
  if (e == null)
    return {};
  var t, r, i = function(o, l) {
    if (o == null)
      return {};
    var s, u, c = {}, d = Object.keys(o);
    for (u = 0; u < d.length; u++)
      s = d[u], l.indexOf(s) >= 0 || (c[s] = o[s]);
    return c;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      t = a[r], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
function Ie(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
var ho, mo, bo;
A(ho || (ho = Ie([`
  width: 100%;
`])));
var yo, Eo, Hb = A(mo || (mo = Ie([`
  width: 100%;
  display: grid;
  row-gap: `, `px;
  grid-template-columns: 75px 1fr 75px;
`])), se[3]), Br = A(bo || (bo = Ie([`
  &:nth-child(even) {
    grid-column: 2 / -1;
  }

  &:nth-child(odd) {
    grid-column: 1 / span 2;
  }
`]))), jb = ["darkMode", "enableAnimations", "className"];
function Yu(e) {
  var n = e.darkMode, t = e.enableAnimations, r = e.className, i = Li(e, jb), a = Qe(n).darkMode;
  return R.createElement(Xn, { darkMode: a }, R.createElement("div", St({}, i, { className: he(Hb, r), "aria-busy": !0 }), R.createElement(Pn, { enableAnimations: t, size: Sn.Small, className: Br }), R.createElement(Pn, { enableAnimations: t, size: Sn.Small, className: Br }), R.createElement(Pn, { enableAnimations: t, size: Sn.Small, className: Br })));
}
Yu.displayName = "CodeSkeleton";
A(yo || (yo = Ie([`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
  row-gap: `, `px;
`])), se[3]);
A(Eo || (Eo = Ie([`
  grid-column-start: 1;
  grid-column-end: 3;
`])));
var xo, vo, _o, wo, So, ko, No, Oo, Sn = { Small: "small", Default: "default", Large: "large" }, qb = function(e) {
  var n = e.enableAnimations;
  return A(xo || (xo = Ie([`
  width: 100%;
  border-radius: `, `px;
  background-position: 50vw 0;

  `, `
`])), se[150], n && A(vo || (vo = Ie([`
    animation: SkeletonShimmer 1.5s infinite linear;

    @keyframes SkeletonShimmer {
      to {
        background-position: 100vw 0;
      }
    }
  `]))));
};
A(_o || (_o = Ie([`
  width: 100%;
  border-radius: 6px;
`])));
var Kb = Yn(Yn(Yn({}, Sn.Small, A(wo || (wo = Ie([`
    height: `, `px;
  `])), se[400])), Sn.Default, A(So || (So = Ie([`
    height: `, `px;
  `])), se[800])), Sn.Large, A(ko || (ko = Ie([`
    height: `, `px;
  `])), se[1200])), Gb = Yn(Yn({}, ve.Dark, A(No || (No = Ie([`
    background: linear-gradient(
        110deg,
        `, ` 35%,
        `, `,
        `, ` 65%
      )
      0 0/ 100vw 100% fixed;
  `])), U.gray.dark2, U.gray.dark1, U.gray.dark2)), ve.Light, A(Oo || (Oo = Ie([`
    background: linear-gradient(
        110deg,
        `, ` 35%,
        `, `,
        `, ` 65%
      )
      0 0/ 100vw 100% fixed;
  `])), U.gray.light2, U.gray.light3, U.gray.light2)), Wb = ["enableAnimations", "size", "darkMode", "className"];
function Pn(e) {
  var n = e.enableAnimations, t = n === void 0 || n, r = e.size, i = r === void 0 ? Sn.Default : r, a = e.darkMode, o = e.className, l = Li(e, Wb), s = Qe(a).theme;
  return R.createElement("div", St({ className: he(qb({ enableAnimations: t }), Kb[i], Gb[s], o), "aria-hidden": !0 }, l));
}
Pn.displayName = "Skeleton";
var Co, To, Ao, Mo, Io;
A(Co || (Co = Ie([`
  width: 100%;
  padding: 0;
  margin: 0;
`])));
var Ro, Do, Lo, Po, Bo, Fo, $o, Vb = A(To || (To = Ie([`
  width: 100%;
`]))), Yb = A(Ao || (Ao = Ie([`
  width: 250px;
  margin-bottom: 20px;
`]))), zo = A(Mo || (Mo = Ie([`
  margin-bottom: `, `px;
`])), se[3]), Zb = A(Io || (Io = Ie([`
  width: 350px;
`]))), Xb = ["darkMode", "enableAnimations", "withHeader", "className"];
function Qb(e) {
  var n = e.darkMode, t = e.enableAnimations, r = e.withHeader, i = r !== void 0 && r, a = e.className, o = Li(e, Xb), l = Qe(n).darkMode;
  return R.createElement(Xn, { darkMode: l }, R.createElement("div", St({}, o, { className: he(Vb, a), "aria-busy": !0 }), i && R.createElement(Pn, { enableAnimations: t, className: Yb, "data-testid": "lg-paragraph-skeleton-header" }), R.createElement(Pn, { enableAnimations: t, size: Sn.Small, className: zo }), R.createElement(Pn, { enableAnimations: t, size: Sn.Small, className: zo }), R.createElement(Pn, { enableAnimations: t, size: Sn.Small, className: Zb })));
}
Qb.displayName = "ParagraphSkeleton";
A(Ro || (Ro = Ie([`
  width: 100%;
  table-layout: fixed;
`])));
A(Do || (Do = Ie([`
  padding: 10px 40px 10px 8px;
`])));
Yn(Yn({}, ve.Dark, A(Lo || (Lo = Ie([`
    background-color: `, `;
    box-shadow: 0 3px `, `;
  `])), U.black, U.gray.dark2)), ve.Light, A(Po || (Po = Ie([`
    background-color: `, `;
    box-shadow: 0 3px `, `;
  `])), U.white, U.gray.light2));
A(Bo || (Bo = Ie([`
  margin-top: 2px; // the td doesn't start exactly at the bottom of the box-shadow
`])));
A(Fo || (Fo = Ie([`
  text-align: left;
`])));
A($o || ($o = Ie([`
  font-weight: 600;
`])));
var Zu = { exports: {} };
(function(e, n) {
  (function(t, r) {
    e.exports = r(R, ur);
  })(At, function(t, r) {
    function i(m) {
      if (m && typeof m == "object" && "default" in m)
        return m;
      var b = /* @__PURE__ */ Object.create(null);
      return m && Object.keys(m).forEach(function(w) {
        if (w !== "default") {
          var _ = Object.getOwnPropertyDescriptor(m, w);
          Object.defineProperty(b, w, _.get ? _ : { enumerable: !0, get: function() {
            return m[w];
          } });
        }
      }), b.default = m, Object.freeze(b);
    }
    var a = i(t);
    function o(m) {
      var b = function(w, _) {
        if (typeof w != "object" || !w)
          return w;
        var C = w[Symbol.toPrimitive];
        if (C !== void 0) {
          var M = C.call(w, _);
          if (typeof M != "object")
            return M;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(w);
      }(m, "string");
      return typeof b == "symbol" ? b : b + "";
    }
    function l(m, b, w) {
      return (b = o(b)) in m ? Object.defineProperty(m, b, { value: w, enumerable: !0, configurable: !0, writable: !0 }) : m[b] = w, m;
    }
    function s() {
      return s = Object.assign ? Object.assign.bind() : function(m) {
        for (var b = 1; b < arguments.length; b++) {
          var w = arguments[b];
          for (var _ in w)
            Object.prototype.hasOwnProperty.call(w, _) && (m[_] = w[_]);
        }
        return m;
      }, s.apply(this, arguments);
    }
    function u(m, b) {
      if (m == null)
        return {};
      var w, _, C = function(S, I) {
        if (S == null)
          return {};
        var L, D, Y = {}, J = Object.keys(S);
        for (D = 0; D < J.length; D++)
          L = J[D], I.indexOf(L) >= 0 || (Y[L] = S[L]);
        return Y;
      }(m, b);
      if (Object.getOwnPropertySymbols) {
        var M = Object.getOwnPropertySymbols(m);
        for (_ = 0; _ < M.length; _++)
          w = M[_], b.indexOf(w) >= 0 || Object.prototype.propertyIsEnumerable.call(m, w) && (C[w] = m[w]);
      }
      return C;
    }
    function c(m, b) {
      return b || (b = m.slice(0)), Object.freeze(Object.defineProperties(m, { raw: { value: Object.freeze(b) } }));
    }
    var d, f, h = { small: 14, default: 16, large: 20, xlarge: 24 }, v = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], x = function(m) {
      var b = m.className, w = m.size, _ = w === void 0 ? 16 : w, C = m.title, M = m["aria-label"], S = m["aria-labelledby"], I = m.fill, L = m.role, D = L === void 0 ? "img" : L, Y = u(m, v), J = r.css(d || (d = c([`
        color: `, `;
      `])), I), W = r.css(f || (f = c([`
        flex-shrink: 0;
      `]))), B = function(q, G, T) {
        var P, $ = T["aria-label"], j = T["aria-labelledby"], E = T.title;
        switch (q) {
          case "img":
            return $ || j || E ? l(l(l({}, "aria-labelledby", j), "aria-label", $), "title", E) : { "aria-label": (P = G, "".concat(P.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(D, "Checkmark", l(l({ title: C }, "aria-label", M), "aria-labelledby", S));
      return a.createElement("svg", s({ className: r.cx(l({}, J, I != null), W, b), height: typeof _ == "number" ? _ : h[_], width: typeof _ == "number" ? _ : h[_], role: D }, B, Y, { viewBox: "0 0 16 16" }), a.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M6.30583 9.05037L11.7611 3.59509C12.1516 3.20457 12.7848 3.20457 13.1753 3.59509L13.8824 4.3022C14.273 4.69273 14.273 5.32589 13.8824 5.71642L6.81525 12.7836C6.38819 13.2106 5.68292 13.1646 5.31505 12.6856L2.26638 8.71605C1.92998 8.27804 2.01235 7.65025 2.45036 7.31385L3.04518 6.85702C3.59269 6.43652 4.37742 6.53949 4.79792 7.087L6.30583 9.05037Z", fill: "currentColor" }));
    };
    return x.displayName = "Checkmark", x.isGlyph = !0, x;
  });
})(Zu);
var Jb = Zu.exports;
const li = /* @__PURE__ */ dn(Jb);
var Xu = { exports: {} };
(function(e, n) {
  (function(t, r) {
    e.exports = r(R, ur);
  })(At, function(t, r) {
    function i(m) {
      if (m && typeof m == "object" && "default" in m)
        return m;
      var b = /* @__PURE__ */ Object.create(null);
      return m && Object.keys(m).forEach(function(w) {
        if (w !== "default") {
          var _ = Object.getOwnPropertyDescriptor(m, w);
          Object.defineProperty(b, w, _.get ? _ : { enumerable: !0, get: function() {
            return m[w];
          } });
        }
      }), b.default = m, Object.freeze(b);
    }
    var a = i(t);
    function o(m) {
      var b = function(w, _) {
        if (typeof w != "object" || !w)
          return w;
        var C = w[Symbol.toPrimitive];
        if (C !== void 0) {
          var M = C.call(w, _);
          if (typeof M != "object")
            return M;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(w);
      }(m, "string");
      return typeof b == "symbol" ? b : b + "";
    }
    function l(m, b, w) {
      return (b = o(b)) in m ? Object.defineProperty(m, b, { value: w, enumerable: !0, configurable: !0, writable: !0 }) : m[b] = w, m;
    }
    function s() {
      return s = Object.assign ? Object.assign.bind() : function(m) {
        for (var b = 1; b < arguments.length; b++) {
          var w = arguments[b];
          for (var _ in w)
            Object.prototype.hasOwnProperty.call(w, _) && (m[_] = w[_]);
        }
        return m;
      }, s.apply(this, arguments);
    }
    function u(m, b) {
      if (m == null)
        return {};
      var w, _, C = function(S, I) {
        if (S == null)
          return {};
        var L, D, Y = {}, J = Object.keys(S);
        for (D = 0; D < J.length; D++)
          L = J[D], I.indexOf(L) >= 0 || (Y[L] = S[L]);
        return Y;
      }(m, b);
      if (Object.getOwnPropertySymbols) {
        var M = Object.getOwnPropertySymbols(m);
        for (_ = 0; _ < M.length; _++)
          w = M[_], b.indexOf(w) >= 0 || Object.prototype.propertyIsEnumerable.call(m, w) && (C[w] = m[w]);
      }
      return C;
    }
    function c(m, b) {
      return b || (b = m.slice(0)), Object.freeze(Object.defineProperties(m, { raw: { value: Object.freeze(b) } }));
    }
    var d, f, h = { small: 14, default: 16, large: 20, xlarge: 24 }, v = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], x = function(m) {
      var b = m.className, w = m.size, _ = w === void 0 ? 16 : w, C = m.title, M = m["aria-label"], S = m["aria-labelledby"], I = m.fill, L = m.role, D = L === void 0 ? "img" : L, Y = u(m, v), J = r.css(d || (d = c([`
        color: `, `;
      `])), I), W = r.css(f || (f = c([`
        flex-shrink: 0;
      `]))), B = function(q, G, T) {
        var P, $ = T["aria-label"], j = T["aria-labelledby"], E = T.title;
        switch (q) {
          case "img":
            return $ || j || E ? l(l(l({}, "aria-labelledby", j), "aria-label", $), "title", E) : { "aria-label": (P = G, "".concat(P.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(D, "Copy", l(l({ title: C }, "aria-label", M), "aria-labelledby", S));
      return a.createElement("svg", s({ className: r.cx(l({}, J, I != null), W, b), height: typeof _ == "number" ? _ : h[_], width: typeof _ == "number" ? _ : h[_], role: D }, B, Y, { viewBox: "0 0 16 16" }), a.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1 5.71428V10.2857C1 11.2325 1.76751 12 2.71429 12H5.75V7.10957C5.75 6.54414 5.97724 6.00244 6.38065 5.60623L8.67403 3.35381C8.77447 3.25516 8.88376 3.16757 9 3.09182V2.71429C9 1.76751 8.23249 1 7.28571 1H5.8V4.42857C5.8 5.13865 5.22437 5.71428 4.51429 5.71428H1ZM9 4.78571L7.25654 6.49804C7.24689 6.50752 7.23749 6.5172 7.22834 6.52708C7.22208 6.53383 7.21594 6.54068 7.20991 6.54762C7.07504 6.70295 7 6.90234 7 7.10957V7.79762H9H10.0095C10.4829 7.79762 10.8667 7.41386 10.8667 6.94047V4H10.1505C9.92587 4 9.7102 4.0882 9.54992 4.24562L9 4.78571ZM4.86667 1H4.15053C3.92587 1 3.7102 1.0882 3.54992 1.24562L1.25654 3.49804C1.09244 3.65921 1 3.87957 1 4.10957V4.79762H4.00952C4.48291 4.79762 4.86667 4.41386 4.86667 3.94047V1ZM7 12V8.71428H9H10.5143C11.2244 8.71428 11.8 8.13865 11.8 7.42857V4H13.2857C14.2325 4 15 4.76751 15 5.71429V13.2857C15 14.2325 14.2325 15 13.2857 15H8.71429C7.76751 15 7 14.2325 7 13.2857V12Z", fill: "currentColor" }));
    };
    return x.displayName = "Copy", x.isGlyph = !0, x;
  });
})(Xu);
var ey = Xu.exports;
const Uo = /* @__PURE__ */ dn(ey);
function ny(e, n, t) {
  return e === e && (t !== void 0 && (e = e <= t ? e : t), n !== void 0 && (e = e >= n ? e : n)), e;
}
var ty = ny, ry = ty, Fr = lp;
function iy(e, n, t) {
  return t === void 0 && (t = n, n = void 0), t !== void 0 && (t = Fr(t), t = t === t ? t : 0), n !== void 0 && (n = Fr(n), n = n === n ? n : 0), ry(Fr(e), n, t);
}
var ay = iy;
const Ho = /* @__PURE__ */ dn(ay);
function jo(e, n) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    n && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), t.push.apply(t, r);
  }
  return t;
}
function gt(e) {
  for (var n = 1; n < arguments.length; n++) {
    var t = arguments[n] != null ? arguments[n] : {};
    n % 2 ? jo(Object(t), !0).forEach(function(r) {
      ar(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : jo(Object(t)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function oy(e) {
  var n = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(t, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function ar(e, n, t) {
  return (n = oy(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function kt() {
  return kt = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
    }
    return e;
  }, kt.apply(this, arguments);
}
function ly(e, n) {
  if (e == null)
    return {};
  var t, r, i = function(o, l) {
    if (o == null)
      return {};
    var s, u, c = {}, d = Object.keys(o);
    for (u = 0; u < d.length; u++)
      s = d[u], l.indexOf(s) >= 0 || (c[s] = o[s]);
    return c;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      t = a[r], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
function fn(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
function sy(e, n) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, r) {
    var i = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (i != null) {
      var a, o, l, s, u = [], c = !0, d = !1;
      try {
        if (l = (i = i.call(t)).next, r !== 0)
          for (; !(c = (a = l.call(i)).done) && (u.push(a.value), u.length !== r); c = !0)
            ;
      } catch (f) {
        d = !0, o = f;
      } finally {
        try {
          if (!c && i.return != null && (s = i.return(), Object(s) !== s))
            return;
        } finally {
          if (d)
            throw o;
        }
      }
      return u;
    }
  }(e, n) || function(t, r) {
    if (t) {
      if (typeof t == "string")
        return qo(t, r);
      var i = Object.prototype.toString.call(t).slice(8, -1);
      if (i === "Object" && t.constructor && (i = t.constructor.name), i === "Map" || i === "Set")
        return Array.from(t);
      if (i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))
        return qo(t, r);
    }
  }(e, n) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function qo(e, n) {
  n > e.length && (n = e.length);
  for (var t = 0, r = new Array(n); t < n; t++)
    r[t] = e[t];
  return r;
}
function cy(e) {
  return pa.createElement("svg", kt({ width: 26, height: 8, fill: "#001E2B", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 26 8" }, e), pa.createElement("path", { d: "M27 0H-1v1h.699a10 10 0 017.26 3.123l1.685 1.78a6 6 0 008.712 0l1.686-1.78A10 10 0 0126.302 1H27V0z" }));
}
var Ko, Go, Wo, Vo, Yo, Zo, Xo, Qo, Jo, el, nl, tl, uy = 8, Xt = 26, or = 16, Qu = Fn.slowest, dy = A(Ko || (Ko = fn([`
  margin: unset;
  font-family: `, `;
  color: `, `;
  font-weight: `, `;
  width: 100%;
  overflow-wrap: anywhere;
  text-transform: none;
`])), _i.default, U.gray.light1, Mt.regular), py = A(Go || (Go = fn([`
  display: flex;
  align-items: center;
  border-radius: `, `px;
  padding: 12px `, `px;
  box-shadow: 0px 2px 4px -1px `, `;
  cursor: default;
  width: fit-content;
  max-width: 256px;
`])), or, or, Vn(0.85, U.black)), rl = A(Wo || (Wo = fn([`
  position: relative;
`]))), $r = ar(ar({}, ve.Light, { tooltip: A(Vo || (Vo = fn([`
      background-color: `, `;
      color: `, `;
    `])), U.black, U.gray.light1), children: A(Yo || (Yo = fn([`
      color: inherit;
    `]))), notchFill: U.black }), ve.Dark, { tooltip: A(Zo || (Zo = fn([`
      background-color: `, `;
      color: `, `;
    `])), U.gray.light2, U.black), children: A(Xo || (Xo = fn([`
      color: inherit;
    `]))), notchFill: U.gray.light2 }), fy = Xt + 2 * or, gy = A(Qo || (Qo = fn([`
  min-height: `, `px;
`])), fy), il = { Hover: "hover", Click: "click" }, hy = { Top: mt.Top, Bottom: mt.Bottom, Left: mt.Left, Right: mt.Right }, my = ["initialOpen", "open", "setOpen", "darkMode", "baseFontSize", "triggerEvent", "enabled", "align", "justify", "spacing", "renderMode", "onClose", "id", "shouldClose", "portalClassName", "portalContainer", "portalRef", "scrollContainer", "popoverZIndex", "refEl", "className", "children", "trigger"], by = function(e) {
  e.stopPropagation();
};
function Ju(e) {
  var n, t = e.initialOpen, r = t !== void 0 && t, i = e.open, a = e.setOpen, o = e.darkMode, l = e.baseFontSize, s = e.triggerEvent, u = s === void 0 ? il.Hover : s, c = e.enabled, d = c === void 0 || c, f = e.align, h = f === void 0 ? "top" : f, v = e.justify, x = v === void 0 ? "start" : v, m = e.spacing, b = m === void 0 ? 12 : m, w = e.renderMode, _ = w === void 0 ? Si.TopLayer : w, C = e.onClose, M = C === void 0 ? function() {
  } : C, S = e.id, I = e.shouldClose, L = e.portalClassName, D = e.portalContainer, Y = e.portalRef, J = e.scrollContainer, W = e.popoverZIndex, B = e.refEl, q = e.className, G = e.children, T = e.trigger, P = ly(e, my), $ = typeof i == "boolean", j = sy(an(r), 2), E = j[0], ue = j[1], Z = xi(l), y = $ ? i : E, z = $ && a ? a : ue, V = Tn(null), te = Tn(null), ie = S ?? ((n = te.current) === null || n === void 0 ? void 0 : n.id), de = Jt({ prefix: "tooltip", id: ie }), pe = Qe(o), Oe = pe.darkMode, Be = pe.theme;
  wn(function() {
    T && Np(T) && Wr(T) && console.warn("Using a LeafyGreenUI Icon or Glyph component as a trigger will not render a Tooltip, as these components do not render their children. To use, please wrap your trigger element in another HTML tag.");
  }, [T]), wn(function() {
    return function() {
      V.current && clearTimeout(V.current);
    };
  }, [V]);
  var Re = Ye(function() {
    (typeof I != "function" || I()) && (M(), z(!1));
  }, [z, I, M]), ln = Ye(function(He, ye) {
    return He === il.Hover ? { onMouseEnter: Gr(function(fe) {
      oe("onMouseEnter", fe), Rp(function() {
        V.current = setTimeout(function() {
          z(!0);
        }, Qu);
      });
    }, 35), onMouseLeave: Gr(function(fe) {
      oe("onMouseLeave", fe), V.current && (clearTimeout(V.current), V.current = null), Re();
    }, 35), onFocus: function(fe) {
      oe("onFocus", fe), z(!0);
    }, onBlur: function(fe) {
      oe("onBlur", fe), Re();
    } } : { onClick: function(fe) {
      fe.target !== te.current && (oe("onClick", fe), z(function(ze) {
        return !ze;
      }));
    } };
    function oe(fe, ze) {
      ye && ye[fe] && typeof ye[fe] == "function" && ye[fe](ze);
    }
  }, [Re, z, te]);
  sp(Re, { enabled: y }), Nc(Re, [te], { enabled: y && u === "click" });
  var We = gt({ popoverZIndex: W, refEl: B, spacing: b }, Fc({ dismissMode: $c.Manual, portalClassName: L, portalContainer: D, portalRef: Y, renderMode: _, scrollContainer: J })), Je = d && y, Ne = ["left", "right"].includes(h), ee = R.createElement(zc, kt({ key: "tooltip", active: Je, align: h, justify: x, adjustOnMutation: !0, onClick: by, className: A(tl || (tl = fn([`
        // Try to fit all the content on one line (until it hits max-width)
        // Overrides default behavior, which is to set width to size of the trigger.
        width: max-content;
      `]))) }, We), function(He) {
    var ye = function(bn) {
      var je = bn.align, K = bn.justify, X = bn.triggerRect;
      if (!je || !K || !X)
        return { notchContainer: "", notch: "", tooltip: "" };
      var k, O, F = Xt, ae = -(F - uy) / 2, le = {}, Ee = {}, Le = or, Pe = 2 * Le, Ve = 0, Xe = "";
      switch (je) {
        case "top":
        case "bottom":
          switch (Pe = 3 * Le, k = X.width / 2 - F / 2, Ve = Ho(k, Le, Pe), O = k <= Le, le.left = "0px", le.right = "0px", je === "top" ? (Ee.top = "calc(100% - 1px)", le.top = "".concat(ae, "px")) : (Ee.bottom = "calc(100% - 1px)", le.bottom = "".concat(ae, "px"), le.transform = "rotate(180deg)"), K) {
            case Dn.Start:
              Ee.left = "".concat(Ve, "px"), O && (Xe = "translateX(-".concat(Le - k, "px)"));
              break;
            case Dn.Middle:
              Ee.left = "0px", Ee.right = "0px";
              break;
            case Dn.End:
              Ee.right = "".concat(Ve, "px"), O && (Xe = "translateX(".concat(Le - k, "px)"));
          }
          break;
        case "left":
        case "right":
          switch (Pe = 2 * Le, k = X.height / 2 - F / 2, Ve = Ho(k, Le, Pe), O = k <= Le, le.top = "0px", le.bottom = "0px", je === "left" ? (Ee.left = "calc(100% - 1px)", le.left = "".concat(ae, "px"), le.transform = "rotate(-90deg)") : (Ee.right = "calc(100% - 1px)", le.right = "".concat(ae, "px"), le.transform = "rotate(90deg)"), K) {
            case Dn.Start:
              Ee.top = "".concat(Ve, "px"), O && (Xe = "translateY(-".concat(Le - k, "px)"));
              break;
            case Dn.Middle:
              Ee.top = "0px", Ee.bottom = "0px";
              break;
            case Dn.End:
              Ee.bottom = "".concat(Ve, "px"), O && (Xe = "translateY(".concat(Le - k, "px)"));
          }
      }
      return { notchContainer: A(Jo || (Jo = fn([`
      position: absolute;
      width: `, `px;
      height: `, `px;
      overflow: hidden;
      margin: auto;
      pointer-events: none;
      `, `;
    `])), F, F, A(Ee)), notch: A(el || (el = fn([`
      `, `;
      position: absolute;
      width: `, `px;
      height: `, `px; // Keep it square. Rotating is simpler
      margin: 0;
    `])), A(le), Xt, Xt), tooltip: A(nl || (nl = fn([`
      min-width: `, `px;
      transform: `, `;
    `])), 2 * Ve + F, Xe) };
    }({ align: He.align, justify: He.justify, triggerRect: He.referenceElPos }), oe = ye.notchContainer, fe = ye.notch, ze = ye.tooltip;
    return R.createElement(Xn, { darkMode: !Oe }, R.createElement("div", kt({ role: "tooltip" }, P, { id: de, className: he(py, ze, $r[Be].tooltip, ar({}, gy, Ne), q), ref: te }), R.createElement("div", { className: he(dy, Jd[Z], $r[Be].children) }, G), R.createElement("div", { className: oe }, R.createElement(cy, { className: he(fe), fill: $r[Be].notchFill }))));
  });
  return T ? typeof T == "function" ? T(gt(gt({}, ln(u)), {}, { className: rl, "aria-describedby": Je ? de : void 0, children: ee })) : R.cloneElement(T, gt(gt({}, ln(u, T.props)), {}, { "aria-describedby": Je ? de : void 0, children: R.createElement(R.Fragment, null, T.props.children, ee), className: he(rl, T.props.className) })) : ee;
}
Ju.displayName = "Tooltip";
var yy = function(e) {
  var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = n.literal, r = n.overlap, i = t ? e : ["&"].concat(e);
  function a(o) {
    if (typeof o != "object" || o == null)
      return [];
    if (Array.isArray(o))
      return o.map(a);
    var l = {}, s = {}, u = {};
    return Object.keys(o).forEach(function(c) {
      var d = o[c];
      if (!Array.isArray(d) && t && (d = [d]), (t || Array.isArray(d)) && c.charCodeAt(0) !== 38) {
        var f = void 0;
        d.forEach(function(h, v) {
          if (!(r && f === h) && h != null)
            if (f = h, v === 0 && !t)
              u[c] = h;
            else if (l[i[v]] === void 0) {
              var x;
              l[i[v]] = (x = {}, x[c] = h, x);
            } else
              l[i[v]][c] = h;
        });
      } else
        typeof d == "object" ? s[c] = a(d) : u[c] = d;
    }), i.forEach(function(c) {
      l[c] && (u[c] = l[c]);
    }), Object.assign(u, s), u;
  }
  return function() {
    for (var o = arguments.length, l = Array(o), s = 0; s < o; s++)
      l[s] = arguments[s];
    return l.map(a);
  };
}, Pi = { exports: {} };
function Bi(e) {
  return e instanceof Map ? e.clear = e.delete = e.set = function() {
    throw new Error("map is read-only");
  } : e instanceof Set && (e.add = e.clear = e.delete = function() {
    throw new Error("set is read-only");
  }), Object.freeze(e), Object.getOwnPropertyNames(e).forEach(function(n) {
    var t = e[n];
    typeof t == "object" && !Object.isFrozen(t) && Bi(t);
  }), e;
}
Pi.exports = Bi;
Pi.exports.default = Bi;
var Ey = Pi.exports;
class al {
  /**
   * @param {CompiledMode} mode
   */
  constructor(n) {
    n.data === void 0 && (n.data = {}), this.data = n.data, this.isMatchIgnored = !1;
  }
  ignoreMatch() {
    this.isMatchIgnored = !0;
  }
}
function ed(e) {
  return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
function Bn(e, ...n) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const r in e)
    t[r] = e[r];
  return n.forEach(function(r) {
    for (const i in r)
      t[i] = r[i];
  }), /** @type {T} */
  t;
}
const xy = "</span>", ol = (e) => !!e.kind, vy = (e, { prefix: n }) => {
  if (e.includes(".")) {
    const t = e.split(".");
    return [
      `${n}${t.shift()}`,
      ...t.map((r, i) => `${r}${"_".repeat(i + 1)}`)
    ].join(" ");
  }
  return `${n}${e}`;
};
class _y {
  /**
   * Creates a new HTMLRenderer
   *
   * @param {Tree} parseTree - the parse tree (must support `walk` API)
   * @param {{classPrefix: string}} options
   */
  constructor(n, t) {
    this.buffer = "", this.classPrefix = t.classPrefix, n.walk(this);
  }
  /**
   * Adds texts to the output stream
   *
   * @param {string} text */
  addText(n) {
    this.buffer += ed(n);
  }
  /**
   * Adds a node open to the output stream (if needed)
   *
   * @param {Node} node */
  openNode(n) {
    if (!ol(n))
      return;
    let t = n.kind;
    n.sublanguage ? t = `language-${t}` : t = vy(t, { prefix: this.classPrefix }), this.span(t);
  }
  /**
   * Adds a node close to the output stream (if needed)
   *
   * @param {Node} node */
  closeNode(n) {
    ol(n) && (this.buffer += xy);
  }
  /**
   * returns the accumulated buffer
  */
  value() {
    return this.buffer;
  }
  // helpers
  /**
   * Builds a span element
   *
   * @param {string} className */
  span(n) {
    this.buffer += `<span class="${n}">`;
  }
}
class Fi {
  constructor() {
    this.rootNode = { children: [] }, this.stack = [this.rootNode];
  }
  get top() {
    return this.stack[this.stack.length - 1];
  }
  get root() {
    return this.rootNode;
  }
  /** @param {Node} node */
  add(n) {
    this.top.children.push(n);
  }
  /** @param {string} kind */
  openNode(n) {
    const t = { kind: n, children: [] };
    this.add(t), this.stack.push(t);
  }
  closeNode() {
    if (this.stack.length > 1)
      return this.stack.pop();
  }
  closeAllNodes() {
    for (; this.closeNode(); )
      ;
  }
  toJSON() {
    return JSON.stringify(this.rootNode, null, 4);
  }
  /**
   * @typedef { import("./html_renderer").Renderer } Renderer
   * @param {Renderer} builder
   */
  walk(n) {
    return this.constructor._walk(n, this.rootNode);
  }
  /**
   * @param {Renderer} builder
   * @param {Node} node
   */
  static _walk(n, t) {
    return typeof t == "string" ? n.addText(t) : t.children && (n.openNode(t), t.children.forEach((r) => this._walk(n, r)), n.closeNode(t)), n;
  }
  /**
   * @param {Node} node
   */
  static _collapse(n) {
    typeof n != "string" && n.children && (n.children.every((t) => typeof t == "string") ? n.children = [n.children.join("")] : n.children.forEach((t) => {
      Fi._collapse(t);
    }));
  }
}
class wy extends Fi {
  /**
   * @param {*} options
   */
  constructor(n) {
    super(), this.options = n;
  }
  /**
   * @param {string} text
   * @param {string} kind
   */
  addKeyword(n, t) {
    n !== "" && (this.openNode(t), this.addText(n), this.closeNode());
  }
  /**
   * @param {string} text
   */
  addText(n) {
    n !== "" && this.add(n);
  }
  /**
   * @param {Emitter & {root: DataNode}} emitter
   * @param {string} name
   */
  addSublanguage(n, t) {
    const r = n.root;
    r.kind = t, r.sublanguage = !0, this.add(r);
  }
  toHTML() {
    return new _y(this, this.options).value();
  }
  finalize() {
    return !0;
  }
}
function Nt(e) {
  return e ? typeof e == "string" ? e : e.source : null;
}
function nd(e) {
  return et("(?=", e, ")");
}
function Sy(e) {
  return et("(?:", e, ")*");
}
function ky(e) {
  return et("(?:", e, ")?");
}
function et(...e) {
  return e.map((t) => Nt(t)).join("");
}
function Ny(e) {
  const n = e[e.length - 1];
  return typeof n == "object" && n.constructor === Object ? (e.splice(e.length - 1, 1), n) : {};
}
function $i(...e) {
  return "(" + (Ny(e).capture ? "" : "?:") + e.map((r) => Nt(r)).join("|") + ")";
}
function td(e) {
  return new RegExp(e.toString() + "|").exec("").length - 1;
}
function Oy(e, n) {
  const t = e && e.exec(n);
  return t && t.index === 0;
}
const Cy = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
function zi(e, { joinWith: n }) {
  let t = 0;
  return e.map((r) => {
    t += 1;
    const i = t;
    let a = Nt(r), o = "";
    for (; a.length > 0; ) {
      const l = Cy.exec(a);
      if (!l) {
        o += a;
        break;
      }
      o += a.substring(0, l.index), a = a.substring(l.index + l[0].length), l[0][0] === "\\" && l[1] ? o += "\\" + String(Number(l[1]) + i) : (o += l[0], l[0] === "(" && t++);
    }
    return o;
  }).map((r) => `(${r})`).join(n);
}
const Ty = /\b\B/, rd = "[a-zA-Z]\\w*", Ui = "[a-zA-Z_]\\w*", id = "\\b\\d+(\\.\\d+)?", ad = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", od = "\\b(0b[01]+)", Ay = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", My = (e = {}) => {
  const n = /^#![ ]*\//;
  return e.binary && (e.begin = et(
    n,
    /.*\b/,
    e.binary,
    /\b.*/
  )), Bn({
    scope: "meta",
    begin: n,
    end: /$/,
    relevance: 0,
    /** @type {ModeCallback} */
    "on:begin": (t, r) => {
      t.index !== 0 && r.ignoreMatch();
    }
  }, e);
}, Ot = {
  begin: "\\\\[\\s\\S]",
  relevance: 0
}, Iy = {
  scope: "string",
  begin: "'",
  end: "'",
  illegal: "\\n",
  contains: [Ot]
}, Ry = {
  scope: "string",
  begin: '"',
  end: '"',
  illegal: "\\n",
  contains: [Ot]
}, Dy = {
  begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
}, gr = function(e, n, t = {}) {
  const r = Bn(
    {
      scope: "comment",
      begin: e,
      end: n,
      contains: []
    },
    t
  );
  r.contains.push({
    scope: "doctag",
    // hack to avoid the space from being included. the space is necessary to
    // match here to prevent the plain text rule below from gobbling up doctags
    begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
    end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
    excludeBegin: !0,
    relevance: 0
  });
  const i = $i(
    // list of common 1 and 2 letter words in English
    "I",
    "a",
    "is",
    "so",
    "us",
    "to",
    "at",
    "if",
    "in",
    "it",
    "on",
    // note: this is not an exhaustive list of contractions, just popular ones
    /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
    // contractions - can't we'd they're let's, etc
    /[A-Za-z]+[-][a-z]+/,
    // `no-way`, etc.
    /[A-Za-z][a-z]{2,}/
    // allow capitalized words at beginning of sentences
  );
  return r.contains.push(
    {
      // TODO: how to include ", (, ) without breaking grammars that use these for
      // comment delimiters?
      // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
      // ---
      // this tries to find sequences of 3 english words in a row (without any
      // "programming" type syntax) this gives us a strong signal that we've
      // TRULY found a comment - vs perhaps scanning with the wrong language.
      // It's possible to find something that LOOKS like the start of the
      // comment - but then if there is no readable text - good chance it is a
      // false match and not a comment.
      //
      // for a visual example please see:
      // https://github.com/highlightjs/highlight.js/issues/2827
      begin: et(
        /[ ]+/,
        // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
        "(",
        i,
        /[.]?[:]?([.][ ]|[ ])/,
        "){3}"
      )
      // look for 3 words in a row
    }
  ), r;
}, Ly = gr("//", "$"), Py = gr("/\\*", "\\*/"), By = gr("#", "$"), Fy = {
  scope: "number",
  begin: id,
  relevance: 0
}, $y = {
  scope: "number",
  begin: ad,
  relevance: 0
}, zy = {
  scope: "number",
  begin: od,
  relevance: 0
}, Uy = {
  // this outer rule makes sure we actually have a WHOLE regex and not simply
  // an expression such as:
  //
  //     3 / something
  //
  // (which will then blow up when regex's `illegal` sees the newline)
  begin: /(?=\/[^/\n]*\/)/,
  contains: [{
    scope: "regexp",
    begin: /\//,
    end: /\/[gimuy]*/,
    illegal: /\n/,
    contains: [
      Ot,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [Ot]
      }
    ]
  }]
}, Hy = {
  scope: "title",
  begin: rd,
  relevance: 0
}, jy = {
  scope: "title",
  begin: Ui,
  relevance: 0
}, qy = {
  // excludes method names from keyword processing
  begin: "\\.\\s*" + Ui,
  relevance: 0
}, Ky = function(e) {
  return Object.assign(
    e,
    {
      /** @type {ModeCallback} */
      "on:begin": (n, t) => {
        t.data._beginMatch = n[1];
      },
      /** @type {ModeCallback} */
      "on:end": (n, t) => {
        t.data._beginMatch !== n[1] && t.ignoreMatch();
      }
    }
  );
};
var Gt = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  MATCH_NOTHING_RE: Ty,
  IDENT_RE: rd,
  UNDERSCORE_IDENT_RE: Ui,
  NUMBER_RE: id,
  C_NUMBER_RE: ad,
  BINARY_NUMBER_RE: od,
  RE_STARTERS_RE: Ay,
  SHEBANG: My,
  BACKSLASH_ESCAPE: Ot,
  APOS_STRING_MODE: Iy,
  QUOTE_STRING_MODE: Ry,
  PHRASAL_WORDS_MODE: Dy,
  COMMENT: gr,
  C_LINE_COMMENT_MODE: Ly,
  C_BLOCK_COMMENT_MODE: Py,
  HASH_COMMENT_MODE: By,
  NUMBER_MODE: Fy,
  C_NUMBER_MODE: $y,
  BINARY_NUMBER_MODE: zy,
  REGEXP_MODE: Uy,
  TITLE_MODE: Hy,
  UNDERSCORE_TITLE_MODE: jy,
  METHOD_GUARD: qy,
  END_SAME_AS_BEGIN: Ky
});
function Gy(e, n) {
  e.input[e.index - 1] === "." && n.ignoreMatch();
}
function Wy(e, n) {
  e.className !== void 0 && (e.scope = e.className, delete e.className);
}
function Vy(e, n) {
  n && e.beginKeywords && (e.begin = "\\b(" + e.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", e.__beforeBegin = Gy, e.keywords = e.keywords || e.beginKeywords, delete e.beginKeywords, e.relevance === void 0 && (e.relevance = 0));
}
function Yy(e, n) {
  Array.isArray(e.illegal) && (e.illegal = $i(...e.illegal));
}
function Zy(e, n) {
  if (e.match) {
    if (e.begin || e.end)
      throw new Error("begin & end are not supported with match");
    e.begin = e.match, delete e.match;
  }
}
function Xy(e, n) {
  e.relevance === void 0 && (e.relevance = 1);
}
const Qy = (e, n) => {
  if (!e.beforeMatch)
    return;
  if (e.starts)
    throw new Error("beforeMatch cannot be used with starts");
  const t = Object.assign({}, e);
  Object.keys(e).forEach((r) => {
    delete e[r];
  }), e.keywords = t.keywords, e.begin = et(t.beforeMatch, nd(t.begin)), e.starts = {
    relevance: 0,
    contains: [
      Object.assign(t, { endsParent: !0 })
    ]
  }, e.relevance = 0, delete t.beforeMatch;
}, Jy = [
  "of",
  "and",
  "for",
  "in",
  "not",
  "or",
  "if",
  "then",
  "parent",
  // common variable name
  "list",
  // common variable name
  "value"
  // common variable name
], eE = "keyword";
function ld(e, n, t = eE) {
  const r = /* @__PURE__ */ Object.create(null);
  return typeof e == "string" ? i(t, e.split(" ")) : Array.isArray(e) ? i(t, e) : Object.keys(e).forEach(function(a) {
    Object.assign(
      r,
      ld(e[a], n, a)
    );
  }), r;
  function i(a, o) {
    n && (o = o.map((l) => l.toLowerCase())), o.forEach(function(l) {
      const s = l.split("|");
      r[s[0]] = [a, nE(s[0], s[1])];
    });
  }
}
function nE(e, n) {
  return n ? Number(n) : tE(e) ? 0 : 1;
}
function tE(e) {
  return Jy.includes(e.toLowerCase());
}
const ll = {}, Zn = (e) => {
  console.error(e);
}, sl = (e, ...n) => {
  console.log(`WARN: ${e}`, ...n);
}, nt = (e, n) => {
  ll[`${e}/${n}`] || (console.log(`Deprecated as of ${e}. ${n}`), ll[`${e}/${n}`] = !0);
}, lr = new Error();
function sd(e, n, { key: t }) {
  let r = 0;
  const i = e[t], a = {}, o = {};
  for (let l = 1; l <= n.length; l++)
    o[l + r] = i[l], a[l + r] = !0, r += td(n[l - 1]);
  e[t] = o, e[t]._emit = a, e[t]._multi = !0;
}
function rE(e) {
  if (Array.isArray(e.begin)) {
    if (e.skip || e.excludeBegin || e.returnBegin)
      throw Zn("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), lr;
    if (typeof e.beginScope != "object" || e.beginScope === null)
      throw Zn("beginScope must be object"), lr;
    sd(e, e.begin, { key: "beginScope" }), e.begin = zi(e.begin, { joinWith: "" });
  }
}
function iE(e) {
  if (Array.isArray(e.end)) {
    if (e.skip || e.excludeEnd || e.returnEnd)
      throw Zn("skip, excludeEnd, returnEnd not compatible with endScope: {}"), lr;
    if (typeof e.endScope != "object" || e.endScope === null)
      throw Zn("endScope must be object"), lr;
    sd(e, e.end, { key: "endScope" }), e.end = zi(e.end, { joinWith: "" });
  }
}
function aE(e) {
  e.scope && typeof e.scope == "object" && e.scope !== null && (e.beginScope = e.scope, delete e.scope);
}
function oE(e) {
  aE(e), typeof e.beginScope == "string" && (e.beginScope = { _wrap: e.beginScope }), typeof e.endScope == "string" && (e.endScope = { _wrap: e.endScope }), rE(e), iE(e);
}
function lE(e) {
  function n(o, l) {
    return new RegExp(
      Nt(o),
      "m" + (e.case_insensitive ? "i" : "") + (e.unicodeRegex ? "u" : "") + (l ? "g" : "")
    );
  }
  class t {
    constructor() {
      this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
    }
    // @ts-ignore
    addRule(l, s) {
      s.position = this.position++, this.matchIndexes[this.matchAt] = s, this.regexes.push([s, l]), this.matchAt += td(l) + 1;
    }
    compile() {
      this.regexes.length === 0 && (this.exec = () => null);
      const l = this.regexes.map((s) => s[1]);
      this.matcherRe = n(zi(l, { joinWith: "|" }), !0), this.lastIndex = 0;
    }
    /** @param {string} s */
    exec(l) {
      this.matcherRe.lastIndex = this.lastIndex;
      const s = this.matcherRe.exec(l);
      if (!s)
        return null;
      const u = s.findIndex((d, f) => f > 0 && d !== void 0), c = this.matchIndexes[u];
      return s.splice(0, u), Object.assign(s, c);
    }
  }
  class r {
    constructor() {
      this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
    }
    // @ts-ignore
    getMatcher(l) {
      if (this.multiRegexes[l])
        return this.multiRegexes[l];
      const s = new t();
      return this.rules.slice(l).forEach(([u, c]) => s.addRule(u, c)), s.compile(), this.multiRegexes[l] = s, s;
    }
    resumingScanAtSamePosition() {
      return this.regexIndex !== 0;
    }
    considerAll() {
      this.regexIndex = 0;
    }
    // @ts-ignore
    addRule(l, s) {
      this.rules.push([l, s]), s.type === "begin" && this.count++;
    }
    /** @param {string} s */
    exec(l) {
      const s = this.getMatcher(this.regexIndex);
      s.lastIndex = this.lastIndex;
      let u = s.exec(l);
      if (this.resumingScanAtSamePosition() && !(u && u.index === this.lastIndex)) {
        const c = this.getMatcher(0);
        c.lastIndex = this.lastIndex + 1, u = c.exec(l);
      }
      return u && (this.regexIndex += u.position + 1, this.regexIndex === this.count && this.considerAll()), u;
    }
  }
  function i(o) {
    const l = new r();
    return o.contains.forEach((s) => l.addRule(s.begin, { rule: s, type: "begin" })), o.terminatorEnd && l.addRule(o.terminatorEnd, { type: "end" }), o.illegal && l.addRule(o.illegal, { type: "illegal" }), l;
  }
  function a(o, l) {
    const s = (
      /** @type CompiledMode */
      o
    );
    if (o.isCompiled)
      return s;
    [
      Wy,
      // do this early so compiler extensions generally don't have to worry about
      // the distinction between match/begin
      Zy,
      oE,
      Qy
    ].forEach((c) => c(o, l)), e.compilerExtensions.forEach((c) => c(o, l)), o.__beforeBegin = null, [
      Vy,
      // do this later so compiler extensions that come earlier have access to the
      // raw array if they wanted to perhaps manipulate it, etc.
      Yy,
      // default to 1 relevance if not specified
      Xy
    ].forEach((c) => c(o, l)), o.isCompiled = !0;
    let u = null;
    return typeof o.keywords == "object" && o.keywords.$pattern && (o.keywords = Object.assign({}, o.keywords), u = o.keywords.$pattern, delete o.keywords.$pattern), u = u || /\w+/, o.keywords && (o.keywords = ld(o.keywords, e.case_insensitive)), s.keywordPatternRe = n(u, !0), l && (o.begin || (o.begin = /\B|\b/), s.beginRe = n(s.begin), !o.end && !o.endsWithParent && (o.end = /\B|\b/), o.end && (s.endRe = n(s.end)), s.terminatorEnd = Nt(s.end) || "", o.endsWithParent && l.terminatorEnd && (s.terminatorEnd += (o.end ? "|" : "") + l.terminatorEnd)), o.illegal && (s.illegalRe = n(
      /** @type {RegExp | string} */
      o.illegal
    )), o.contains || (o.contains = []), o.contains = [].concat(...o.contains.map(function(c) {
      return sE(c === "self" ? o : c);
    })), o.contains.forEach(function(c) {
      a(
        /** @type Mode */
        c,
        s
      );
    }), o.starts && a(o.starts, l), s.matcher = i(s), s;
  }
  if (e.compilerExtensions || (e.compilerExtensions = []), e.contains && e.contains.includes("self"))
    throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
  return e.classNameAliases = Bn(e.classNameAliases || {}), a(
    /** @type Mode */
    e
  );
}
function cd(e) {
  return e ? e.endsWithParent || cd(e.starts) : !1;
}
function sE(e) {
  return e.variants && !e.cachedVariants && (e.cachedVariants = e.variants.map(function(n) {
    return Bn(e, { variants: null }, n);
  })), e.cachedVariants ? e.cachedVariants : cd(e) ? Bn(e, { starts: e.starts ? Bn(e.starts) : null }) : Object.isFrozen(e) ? Bn(e) : e;
}
var cE = "11.5.1";
class uE extends Error {
  constructor(n, t) {
    super(n), this.name = "HTMLInjectionError", this.html = t;
  }
}
const zr = ed, cl = Bn, ul = Symbol("nomatch"), dE = 7, pE = function(e) {
  const n = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null), r = [];
  let i = !0;
  const a = "Could not find the language '{}', did you forget to load/include a language module?", o = { disableAutodetect: !0, name: "Plain text", contains: [] };
  let l = {
    ignoreUnescapedHTML: !1,
    throwUnescapedHTML: !1,
    noHighlightRe: /^(no-?highlight)$/i,
    languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
    classPrefix: "hljs-",
    cssSelector: "pre code",
    languages: null,
    // beta configuration options, subject to change, welcome to discuss
    // https://github.com/highlightjs/highlight.js/issues/1086
    __emitter: wy
  };
  function s(T) {
    return l.noHighlightRe.test(T);
  }
  function u(T) {
    let P = T.className + " ";
    P += T.parentNode ? T.parentNode.className : "";
    const $ = l.languageDetectRe.exec(P);
    if ($) {
      const j = D($[1]);
      return j || (sl(a.replace("{}", $[1])), sl("Falling back to no-highlight mode for this block.", T)), j ? $[1] : "no-highlight";
    }
    return P.split(/\s+/).find((j) => s(j) || D(j));
  }
  function c(T, P, $) {
    let j = "", E = "";
    typeof P == "object" ? (j = T, $ = P.ignoreIllegals, E = P.language) : (nt("10.7.0", "highlight(lang, code, ...args) has been deprecated."), nt("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), E = T, j = P), $ === void 0 && ($ = !0);
    const ue = {
      code: j,
      language: E
    };
    q("before:highlight", ue);
    const Z = ue.result ? ue.result : d(ue.language, ue.code, $);
    return Z.code = ue.code, q("after:highlight", Z), Z;
  }
  function d(T, P, $, j) {
    const E = /* @__PURE__ */ Object.create(null);
    function ue(K, X) {
      return K.keywords[X];
    }
    function Z() {
      if (!ee.keywords) {
        ye.addText(oe);
        return;
      }
      let K = 0;
      ee.keywordPatternRe.lastIndex = 0;
      let X = ee.keywordPatternRe.exec(oe), k = "";
      for (; X; ) {
        k += oe.substring(K, X.index);
        const O = We.case_insensitive ? X[0].toLowerCase() : X[0], F = ue(ee, O);
        if (F) {
          const [ae, le] = F;
          if (ye.addText(k), k = "", E[O] = (E[O] || 0) + 1, E[O] <= dE && (fe += le), ae.startsWith("_"))
            k += X[0];
          else {
            const Ee = We.classNameAliases[ae] || ae;
            ye.addKeyword(X[0], Ee);
          }
        } else
          k += X[0];
        K = ee.keywordPatternRe.lastIndex, X = ee.keywordPatternRe.exec(oe);
      }
      k += oe.substr(K), ye.addText(k);
    }
    function y() {
      if (oe === "")
        return;
      let K = null;
      if (typeof ee.subLanguage == "string") {
        if (!n[ee.subLanguage]) {
          ye.addText(oe);
          return;
        }
        K = d(ee.subLanguage, oe, !0, He[ee.subLanguage]), He[ee.subLanguage] = /** @type {CompiledMode} */
        K._top;
      } else
        K = h(oe, ee.subLanguage.length ? ee.subLanguage : null);
      ee.relevance > 0 && (fe += K.relevance), ye.addSublanguage(K._emitter, K.language);
    }
    function z() {
      ee.subLanguage != null ? y() : Z(), oe = "";
    }
    function V(K, X) {
      let k = 1;
      const O = X.length - 1;
      for (; k <= O; ) {
        if (!K._emit[k]) {
          k++;
          continue;
        }
        const F = We.classNameAliases[K[k]] || K[k], ae = X[k];
        F ? ye.addKeyword(ae, F) : (oe = ae, Z(), oe = ""), k++;
      }
    }
    function te(K, X) {
      return K.scope && typeof K.scope == "string" && ye.openNode(We.classNameAliases[K.scope] || K.scope), K.beginScope && (K.beginScope._wrap ? (ye.addKeyword(oe, We.classNameAliases[K.beginScope._wrap] || K.beginScope._wrap), oe = "") : K.beginScope._multi && (V(K.beginScope, X), oe = "")), ee = Object.create(K, { parent: { value: ee } }), ee;
    }
    function ie(K, X, k) {
      let O = Oy(K.endRe, k);
      if (O) {
        if (K["on:end"]) {
          const F = new al(K);
          K["on:end"](X, F), F.isMatchIgnored && (O = !1);
        }
        if (O) {
          for (; K.endsParent && K.parent; )
            K = K.parent;
          return K;
        }
      }
      if (K.endsWithParent)
        return ie(K.parent, X, k);
    }
    function de(K) {
      return ee.matcher.regexIndex === 0 ? (oe += K[0], 1) : (je = !0, 0);
    }
    function pe(K) {
      const X = K[0], k = K.rule, O = new al(k), F = [k.__beforeBegin, k["on:begin"]];
      for (const ae of F)
        if (ae && (ae(K, O), O.isMatchIgnored))
          return de(X);
      return k.skip ? oe += X : (k.excludeBegin && (oe += X), z(), !k.returnBegin && !k.excludeBegin && (oe = X)), te(k, K), k.returnBegin ? 0 : X.length;
    }
    function Oe(K) {
      const X = K[0], k = P.substr(K.index), O = ie(ee, K, k);
      if (!O)
        return ul;
      const F = ee;
      ee.endScope && ee.endScope._wrap ? (z(), ye.addKeyword(X, ee.endScope._wrap)) : ee.endScope && ee.endScope._multi ? (z(), V(ee.endScope, K)) : F.skip ? oe += X : (F.returnEnd || F.excludeEnd || (oe += X), z(), F.excludeEnd && (oe = X));
      do
        ee.scope && ye.closeNode(), !ee.skip && !ee.subLanguage && (fe += ee.relevance), ee = ee.parent;
      while (ee !== O.parent);
      return O.starts && te(O.starts, K), F.returnEnd ? 0 : X.length;
    }
    function Be() {
      const K = [];
      for (let X = ee; X !== We; X = X.parent)
        X.scope && K.unshift(X.scope);
      K.forEach((X) => ye.openNode(X));
    }
    let Re = {};
    function ln(K, X) {
      const k = X && X[0];
      if (oe += K, k == null)
        return z(), 0;
      if (Re.type === "begin" && X.type === "end" && Re.index === X.index && k === "") {
        if (oe += P.slice(X.index, X.index + 1), !i) {
          const O = new Error(`0 width match regex (${T})`);
          throw O.languageName = T, O.badRule = Re.rule, O;
        }
        return 1;
      }
      if (Re = X, X.type === "begin")
        return pe(X);
      if (X.type === "illegal" && !$) {
        const O = new Error('Illegal lexeme "' + k + '" for mode "' + (ee.scope || "<unnamed>") + '"');
        throw O.mode = ee, O;
      } else if (X.type === "end") {
        const O = Oe(X);
        if (O !== ul)
          return O;
      }
      if (X.type === "illegal" && k === "")
        return 1;
      if (bn > 1e5 && bn > X.index * 3)
        throw new Error("potential infinite loop, way more iterations than matches");
      return oe += k, k.length;
    }
    const We = D(T);
    if (!We)
      throw Zn(a.replace("{}", T)), new Error('Unknown language: "' + T + '"');
    const Je = lE(We);
    let Ne = "", ee = j || Je;
    const He = {}, ye = new l.__emitter(l);
    Be();
    let oe = "", fe = 0, ze = 0, bn = 0, je = !1;
    try {
      for (ee.matcher.considerAll(); ; ) {
        bn++, je ? je = !1 : ee.matcher.considerAll(), ee.matcher.lastIndex = ze;
        const K = ee.matcher.exec(P);
        if (!K)
          break;
        const X = P.substring(ze, K.index), k = ln(X, K);
        ze = K.index + k;
      }
      return ln(P.substr(ze)), ye.closeAllNodes(), ye.finalize(), Ne = ye.toHTML(), {
        language: T,
        value: Ne,
        relevance: fe,
        illegal: !1,
        _emitter: ye,
        _top: ee
      };
    } catch (K) {
      if (K.message && K.message.includes("Illegal"))
        return {
          language: T,
          value: zr(P),
          illegal: !0,
          relevance: 0,
          _illegalBy: {
            message: K.message,
            index: ze,
            context: P.slice(ze - 100, ze + 100),
            mode: K.mode,
            resultSoFar: Ne
          },
          _emitter: ye
        };
      if (i)
        return {
          language: T,
          value: zr(P),
          illegal: !1,
          relevance: 0,
          errorRaised: K,
          _emitter: ye,
          _top: ee
        };
      throw K;
    }
  }
  function f(T) {
    const P = {
      value: zr(T),
      illegal: !1,
      relevance: 0,
      _top: o,
      _emitter: new l.__emitter(l)
    };
    return P._emitter.addText(T), P;
  }
  function h(T, P) {
    P = P || l.languages || Object.keys(n);
    const $ = f(T), j = P.filter(D).filter(J).map(
      (z) => d(z, T, !1)
    );
    j.unshift($);
    const E = j.sort((z, V) => {
      if (z.relevance !== V.relevance)
        return V.relevance - z.relevance;
      if (z.language && V.language) {
        if (D(z.language).supersetOf === V.language)
          return 1;
        if (D(V.language).supersetOf === z.language)
          return -1;
      }
      return 0;
    }), [ue, Z] = E, y = ue;
    return y.secondBest = Z, y;
  }
  function v(T, P, $) {
    const j = P && t[P] || $;
    T.classList.add("hljs"), T.classList.add(`language-${j}`);
  }
  function x(T) {
    let P = null;
    const $ = u(T);
    if (s($))
      return;
    if (q(
      "before:highlightElement",
      { el: T, language: $ }
    ), T.children.length > 0 && (l.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(T)), l.throwUnescapedHTML))
      throw new uE(
        "One of your code blocks includes unescaped HTML.",
        T.innerHTML
      );
    P = T;
    const j = P.textContent, E = $ ? c(j, { language: $, ignoreIllegals: !0 }) : h(j);
    T.innerHTML = E.value, v(T, $, E.language), T.result = {
      language: E.language,
      // TODO: remove with version 11.0
      re: E.relevance,
      relevance: E.relevance
    }, E.secondBest && (T.secondBest = {
      language: E.secondBest.language,
      relevance: E.secondBest.relevance
    }), q("after:highlightElement", { el: T, result: E, text: j });
  }
  function m(T) {
    l = cl(l, T);
  }
  const b = () => {
    C(), nt("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
  };
  function w() {
    C(), nt("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
  }
  let _ = !1;
  function C() {
    if (document.readyState === "loading") {
      _ = !0;
      return;
    }
    document.querySelectorAll(l.cssSelector).forEach(x);
  }
  function M() {
    _ && C();
  }
  typeof window < "u" && window.addEventListener && window.addEventListener("DOMContentLoaded", M, !1);
  function S(T, P) {
    let $ = null;
    try {
      $ = P(e);
    } catch (j) {
      if (Zn("Language definition for '{}' could not be registered.".replace("{}", T)), i)
        Zn(j);
      else
        throw j;
      $ = o;
    }
    $.name || ($.name = T), n[T] = $, $.rawDefinition = P.bind(null, e), $.aliases && Y($.aliases, { languageName: T });
  }
  function I(T) {
    delete n[T];
    for (const P of Object.keys(t))
      t[P] === T && delete t[P];
  }
  function L() {
    return Object.keys(n);
  }
  function D(T) {
    return T = (T || "").toLowerCase(), n[T] || n[t[T]];
  }
  function Y(T, { languageName: P }) {
    typeof T == "string" && (T = [T]), T.forEach(($) => {
      t[$.toLowerCase()] = P;
    });
  }
  function J(T) {
    const P = D(T);
    return P && !P.disableAutodetect;
  }
  function W(T) {
    T["before:highlightBlock"] && !T["before:highlightElement"] && (T["before:highlightElement"] = (P) => {
      T["before:highlightBlock"](
        Object.assign({ block: P.el }, P)
      );
    }), T["after:highlightBlock"] && !T["after:highlightElement"] && (T["after:highlightElement"] = (P) => {
      T["after:highlightBlock"](
        Object.assign({ block: P.el }, P)
      );
    });
  }
  function B(T) {
    W(T), r.push(T);
  }
  function q(T, P) {
    const $ = T;
    r.forEach(function(j) {
      j[$] && j[$](P);
    });
  }
  function G(T) {
    return nt("10.7.0", "highlightBlock will be removed entirely in v12.0"), nt("10.7.0", "Please use highlightElement now."), x(T);
  }
  Object.assign(e, {
    highlight: c,
    highlightAuto: h,
    highlightAll: C,
    highlightElement: x,
    // TODO: Remove with v12 API
    highlightBlock: G,
    configure: m,
    initHighlighting: b,
    initHighlightingOnLoad: w,
    registerLanguage: S,
    unregisterLanguage: I,
    listLanguages: L,
    getLanguage: D,
    registerAliases: Y,
    autoDetection: J,
    inherit: cl,
    addPlugin: B
  }), e.debugMode = function() {
    i = !1;
  }, e.safeMode = function() {
    i = !0;
  }, e.versionString = cE, e.regex = {
    concat: et,
    lookahead: nd,
    either: $i,
    optional: ky,
    anyNumberOfTimes: Sy
  };
  for (const T in Gt)
    typeof Gt[T] == "object" && Ey(Gt[T]);
  return Object.assign(e, Gt), e;
};
var Ct = pE({}), fE = Ct;
Ct.HighlightJS = Ct;
Ct.default = Ct;
const bt = /* @__PURE__ */ dn(fE);
var Hi = { exports: {} };
function ud(e) {
  return {
    aliases: ["gql"],
    keywords: {
      keyword: "query mutation subscription|10 input schema implements type interface union scalar fragment|10 enum on ...",
      literal: "ID ID! String Float Int Boolean",
      variable: "true false null"
    },
    contains: [
      e.HASH_COMMENT_MODE,
      e.QUOTE_STRING_MODE,
      e.NUMBER_MODE,
      {
        className: "literal",
        begin: "[^\\w][A-Z][a-z]",
        end: "\\W",
        excludeEnd: !0
      },
      {
        className: "literal",
        begin: ":\\s\\[",
        end: "[\\]!]{1,3}",
        excludeBegin: !0,
        excludeEnd: !0
      },
      {
        className: "type",
        begin: "[^\\w](?!ID)[A-Z][A-Z]",
        end: "\\W",
        excludeEnd: !0
      },
      {
        className: "name",
        begin: "\\$",
        end: "\\W",
        excludeEnd: !0
      },
      {
        className: "meta",
        begin: "@",
        end: "\\W",
        excludeEnd: !0
      }
    ],
    illegal: /([;<']|BEGIN)/
  };
}
Hi.exports = function(e) {
  e.registerLanguage("graphql", ud);
};
Hi.exports.definer = ud;
var gE = Hi.exports;
const hE = /* @__PURE__ */ dn(gE);
var mE = cp, bE = Oc, yE = 1, EE = 2;
function xE(e, n, t, r) {
  var i = t.length, a = i, o = !r;
  if (e == null)
    return !a;
  for (e = Object(e); i--; ) {
    var l = t[i];
    if (o && l[2] ? l[1] !== e[l[0]] : !(l[0] in e))
      return !1;
  }
  for (; ++i < a; ) {
    l = t[i];
    var s = l[0], u = e[s], c = l[1];
    if (o && l[2]) {
      if (u === void 0 && !(s in e))
        return !1;
    } else {
      var d = new mE();
      if (r)
        var f = r(u, c, s, e, n, d);
      if (!(f === void 0 ? bE(c, u, yE | EE, r, d) : f))
        return !1;
    }
  }
  return !0;
}
var vE = xE, _E = up;
function wE(e) {
  return e === e && !_E(e);
}
var dd = wE, SE = dd, kE = Cc;
function NE(e) {
  for (var n = kE(e), t = n.length; t--; ) {
    var r = n[t], i = e[r];
    n[t] = [r, i, SE(i)];
  }
  return n;
}
var OE = NE;
function CE(e, n) {
  return function(t) {
    return t == null ? !1 : t[e] === n && (n !== void 0 || e in Object(t));
  };
}
var pd = CE, TE = vE, AE = OE, ME = pd;
function IE(e) {
  var n = AE(e);
  return n.length == 1 && n[0][2] ? ME(n[0][0], n[0][1]) : function(t) {
    return t === e || TE(t, e, n);
  };
}
var RE = IE, DE = Tc;
function LE(e, n, t) {
  var r = e == null ? void 0 : DE(e, n);
  return r === void 0 ? t : r;
}
var PE = LE, BE = Oc, FE = PE, $E = dp, zE = Ac, UE = dd, HE = pd, jE = Mc, qE = 1, KE = 2;
function GE(e, n) {
  return zE(e) && UE(n) ? HE(jE(e), n) : function(t) {
    var r = FE(t, e);
    return r === void 0 && r === n ? $E(t, e) : BE(n, r, qE | KE);
  };
}
var WE = GE;
function VE(e) {
  return function(n) {
    return n == null ? void 0 : n[e];
  };
}
var YE = VE, ZE = Tc;
function XE(e) {
  return function(n) {
    return ZE(n, e);
  };
}
var QE = XE, JE = YE, e0 = QE, n0 = Ac, t0 = Mc;
function r0(e) {
  return n0(e) ? JE(t0(e)) : e0(e);
}
var i0 = r0, a0 = RE, o0 = WE, l0 = pp, s0 = Ic, c0 = i0;
function u0(e) {
  return typeof e == "function" ? e : e == null ? l0 : typeof e == "object" ? s0(e) ? o0(e[0], e[1]) : a0(e) : c0(e);
}
var d0 = u0;
function p0(e) {
  return function(n, t, r) {
    for (var i = -1, a = Object(n), o = r(n), l = o.length; l--; ) {
      var s = o[e ? l : ++i];
      if (t(a[s], s, a) === !1)
        break;
    }
    return n;
  };
}
var f0 = p0, g0 = f0, h0 = g0(), m0 = h0, b0 = m0, y0 = Cc;
function E0(e, n) {
  return e && b0(e, n, y0);
}
var x0 = E0, v0 = Rc;
function _0(e, n) {
  return function(t, r) {
    if (t == null)
      return t;
    if (!v0(t))
      return e(t, r);
    for (var i = t.length, a = n ? i : -1, o = Object(t); (n ? a-- : ++a < i) && r(o[a], a, o) !== !1; )
      ;
    return t;
  };
}
var w0 = _0, S0 = x0, k0 = w0, N0 = k0(S0), O0 = N0, C0 = O0, T0 = Rc;
function A0(e, n) {
  var t = -1, r = T0(e) ? Array(e.length) : [];
  return C0(e, function(i, a, o) {
    r[++t] = n(i, a, o);
  }), r;
}
var M0 = A0, I0 = fp, R0 = d0, D0 = M0, L0 = Ic;
function P0(e, n) {
  var t = L0(e) ? I0 : D0;
  return t(e, R0(n));
}
var B0 = P0, F0 = gp, $0 = B0;
function z0(e, n) {
  return F0($0(e, n), 1);
}
var U0 = z0;
const dl = /* @__PURE__ */ dn(U0);
var fd = { exports: {} };
(function(e, n) {
  (function(t, r) {
    e.exports = r(R, ur);
  })(At, function(t, r) {
    function i(m) {
      if (m && typeof m == "object" && "default" in m)
        return m;
      var b = /* @__PURE__ */ Object.create(null);
      return m && Object.keys(m).forEach(function(w) {
        if (w !== "default") {
          var _ = Object.getOwnPropertyDescriptor(m, w);
          Object.defineProperty(b, w, _.get ? _ : { enumerable: !0, get: function() {
            return m[w];
          } });
        }
      }), b.default = m, Object.freeze(b);
    }
    var a = i(t);
    function o(m) {
      var b = function(w, _) {
        if (typeof w != "object" || !w)
          return w;
        var C = w[Symbol.toPrimitive];
        if (C !== void 0) {
          var M = C.call(w, _);
          if (typeof M != "object")
            return M;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return String(w);
      }(m, "string");
      return typeof b == "symbol" ? b : b + "";
    }
    function l(m, b, w) {
      return (b = o(b)) in m ? Object.defineProperty(m, b, { value: w, enumerable: !0, configurable: !0, writable: !0 }) : m[b] = w, m;
    }
    function s() {
      return s = Object.assign ? Object.assign.bind() : function(m) {
        for (var b = 1; b < arguments.length; b++) {
          var w = arguments[b];
          for (var _ in w)
            Object.prototype.hasOwnProperty.call(w, _) && (m[_] = w[_]);
        }
        return m;
      }, s.apply(this, arguments);
    }
    function u(m, b) {
      if (m == null)
        return {};
      var w, _, C = function(S, I) {
        if (S == null)
          return {};
        var L, D, Y = {}, J = Object.keys(S);
        for (D = 0; D < J.length; D++)
          L = J[D], I.indexOf(L) >= 0 || (Y[L] = S[L]);
        return Y;
      }(m, b);
      if (Object.getOwnPropertySymbols) {
        var M = Object.getOwnPropertySymbols(m);
        for (_ = 0; _ < M.length; _++)
          w = M[_], b.indexOf(w) >= 0 || Object.prototype.propertyIsEnumerable.call(m, w) && (C[w] = m[w]);
      }
      return C;
    }
    function c(m, b) {
      return b || (b = m.slice(0)), Object.freeze(Object.defineProperties(m, { raw: { value: Object.freeze(b) } }));
    }
    var d, f, h = { small: 14, default: 16, large: 20, xlarge: 24 }, v = ["className", "size", "title", "aria-label", "aria-labelledby", "fill", "role"], x = function(m) {
      var b = m.className, w = m.size, _ = w === void 0 ? 16 : w, C = m.title, M = m["aria-label"], S = m["aria-labelledby"], I = m.fill, L = m.role, D = L === void 0 ? "img" : L, Y = u(m, v), J = r.css(d || (d = c([`
        color: `, `;
      `])), I), W = r.css(f || (f = c([`
        flex-shrink: 0;
      `]))), B = function(q, G, T) {
        var P, $ = T["aria-label"], j = T["aria-labelledby"], E = T.title;
        switch (q) {
          case "img":
            return $ || j || E ? l(l(l({}, "aria-labelledby", j), "aria-label", $), "title", E) : { "aria-label": (P = G, "".concat(P.replace(/([a-z])([A-Z])/g, "$1 $2"), " Icon")) };
          case "presentation":
            return { "aria-hidden": !0, alt: "" };
        }
      }(D, "CaretDown", l(l({ title: C }, "aria-label", M), "aria-labelledby", S));
      return a.createElement("svg", s({ className: r.cx(l({}, J, I != null), W, b), height: typeof _ == "number" ? _ : h[_], width: typeof _ == "number" ? _ : h[_], role: D }, B, Y, { viewBox: "0 0 16 16" }), a.createElement("path", { d: "M8.67903 10.7962C8.45271 11.0679 8.04729 11.0679 7.82097 10.7962L4.63962 6.97649C4.3213 6.59428 4.5824 6 5.06866 6L11.4313 6C11.9176 6 12.1787 6.59428 11.8604 6.97649L8.67903 10.7962Z", fill: "currentColor" }));
    };
    return x.displayName = "CaretDown", x.isGlyph = !0, x;
  });
})(fd);
var H0 = fd.exports;
const j0 = /* @__PURE__ */ dn(H0);
var Wt = "lg-select", ji = { root: Wt, errorMessage: "".concat(Wt, "-error_message"), popover: "".concat(Wt, "-popover"), buttonText: "".concat(Wt, "-button_text") };
function pl(e, n) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    n && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), t.push.apply(t, r);
  }
  return t;
}
function Ur(e) {
  for (var n = 1; n < arguments.length; n++) {
    var t = arguments[n] != null ? arguments[n] : {};
    n % 2 ? pl(Object(t), !0).forEach(function(r) {
      _e(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : pl(Object(t)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function q0(e) {
  var n = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(t, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function _e(e, n, t) {
  return (n = q0(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function $n() {
  return $n = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
    }
    return e;
  }, $n.apply(this, arguments);
}
function Dt(e, n) {
  if (e == null)
    return {};
  var t, r, i = function(o, l) {
    if (o == null)
      return {};
    var s, u, c = {}, d = Object.keys(o);
    for (u = 0; u < d.length; u++)
      s = d[u], l.indexOf(s) >= 0 || (c[s] = o[s]);
    return c;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      t = a[r], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
function me(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
function Qt(e, n) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, r) {
    var i = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (i != null) {
      var a, o, l, s, u = [], c = !0, d = !1;
      try {
        if (l = (i = i.call(t)).next, r !== 0)
          for (; !(c = (a = l.call(i)).done) && (u.push(a.value), u.length !== r); c = !0)
            ;
      } catch (f) {
        d = !0, o = f;
      } finally {
        try {
          if (!c && i.return != null && (s = i.return(), Object(s) !== s))
            return;
        } finally {
          if (d)
            throw o;
        }
      }
      return u;
    }
  }(e, n) || gd(e, n) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function K0(e) {
  return function(n) {
    if (Array.isArray(n))
      return si(n);
  }(e) || function(n) {
    if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null)
      return Array.from(n);
  }(e) || gd(e) || function() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function gd(e, n) {
  if (e) {
    if (typeof e == "string")
      return si(e, n);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? si(e, n) : void 0;
  }
}
function si(e, n) {
  (n == null || n > e.length) && (n = e.length);
  for (var t = 0, r = new Array(n); t < n; t++)
    r[t] = e[t];
  return r;
}
var fl, gl, hl, ml, bl, _n = { XSmall: "xsmall", Small: "small", Default: "default", Large: "large" }, lt = Lp, ci = { Trigger: "trigger", Option: "option" }, qi = wi({ size: _n.Default, open: !1, disabled: !1 }), Ki = _e(_e({}, ve.Light, { menu: { border: U.gray.light2, shadow: Vn(0.75, U.black) }, option: { group: { label: U.gray.dark1 }, background: { base: U.white, hovered: U.gray.light2, focused: U.blue.light3 }, text: { base: U.gray.dark3, selected: U.blue.base, disabled: U.gray.base, focused: U.blue.dark2 }, icon: { base: U.gray.dark1, selected: U.blue.base, disabled: U.gray.base }, indicator: { focused: U.blue.base } } }), ve.Dark, { menu: { border: U.gray.dark2, shadow: Vn(0.85, "#000000") }, option: { group: { label: U.gray.base }, background: { base: U.gray.dark3, hovered: U.gray.dark4, focused: U.blue.dark3 }, text: { base: U.gray.light2, selected: U.gray.light2, disabled: U.gray.base, focused: U.blue.light3 }, icon: { base: U.gray.base, selected: U.blue.light1, disabled: U.gray.base }, indicator: { focused: U.blue.light1 } } }), G0 = _e(_e(_e(_e({}, _n.XSmall, { height: 22, text: 13, option: { text: 13 }, warningIcon: 16 }), _n.Small, { height: 28, text: 13, option: { text: 13 }, warningIcon: 16 }), _n.Default, { height: 36, text: 13, option: { text: 13 }, warningIcon: 16 }), _n.Large, { height: 48, text: 18, option: { text: 16 }, warningIcon: 16 }), W0 = 36, V0 = 16, yl = { text: 16, lineHeight: 19 }, El = { text: 16, lineHeight: 22 }, Y0 = { text: 16 }, Z0 = Qn("option"), X0 = ["children", "className", "glyph", "selected", "focused", "disabled", "onClick", "onFocus", "triggerScrollIntoView", "hasGlyphs", "description"];
function Gi(e) {
  var n = e.children, t = e.className, r = e.glyph, i = e.selected, a = e.focused, o = e.disabled, l = e.onClick, s = e.onFocus, u = e.triggerScrollIntoView, c = e.hasGlyphs, d = e.description, f = Dt(e, X0), h = Qe().theme, v = Ki[h].option, x = Tn(null), m = Ye(function() {
    if (x.current == null)
      return null;
    var D = x.current, Y = D == null ? void 0 : D.offsetParent;
    if (!Y)
      return null;
    Y.scrollTop = D.offsetTop + (D.clientHeight - Y.clientHeight) / 2;
  }, [x]), b = ua(u), w = u && !b;
  wn(function() {
    w && m();
  }, [m, w]);
  var _ = ua(a), C = a && !_;
  wn(function() {
    C && x.current.focus();
  }, [C]), r && (Wr(r) || console.error("`Option` instance did not render icon because it is not a known glyph element."));
  var M = r && Wr(r) ? r : void 0, S = i ? R.createElement(li, { key: "checkmark", className: he(A(fl || (fl = me([`
          color: `, `;
        `])), v.icon.selected), _e({}, A(gl || (gl = me([`
            color: `, `;
          `])), v.icon.disabled), o)) }) : void 0, I = c ? M : S, L = c ? S : void 0;
  return R.createElement(Pp, $n({ "aria-label": typeof n == "string" ? n : "option" }, f, { disabled: o, role: "option", tabIndex: -1, ref: x, className: he(Z0, t), onClick: l, onFocus: s, onKeyDown: void 0, checked: i, highlighted: a }), R.createElement(Bp, { leftGlyph: I, rightGlyph: L, description: d }, R.createElement("span", { className: he(_e({}, A(hl || (hl = me([`
              font-weight: `, `;
            `])), Mt.bold), i)) }, n)));
}
Gi.displayName = "Option";
var xl, Q0 = A(ml || (ml = me([`
  padding: `, `px 0;
`])), se[2]), J0 = A(bl || (bl = me([`
  cursor: default;
  width: 100%;
  padding: 0 12px 2px;
  outline: none;
  overflow-wrap: anywhere;
  font-size: 12px;
  line-height: 16px;
  font-weight: `, `;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`])), Mt.bold), ex = ["className", "label", "children"];
function hd(e) {
  var n = e.className, t = e.label, r = e.children, i = Dt(e, ex), a = Qe().theme, o = Ki[a].option, l = Jt({ prefix: "select-option-group" });
  return R.createElement("div", $n({ className: he(Q0, n) }, i), R.createElement("div", { id: l, className: he(J0, A(xl || (xl = me([`
            color: `, `;
          `])), o.group.label)) }, t), R.createElement("div", { role: "group", "aria-labelledby": l }, r));
}
hd.displayName = "OptionGroup";
var nx = ["children"], sr = Dc(_t.Tablet);
function md(e) {
  return e == null || e === !1 || e === "";
}
function Kn(e, n) {
  R.Children.forEach(e, function(t) {
    ot(t, "Option") ? n(t) : ot(t, "OptionGroup") ? Kn(t.props.children, function(r) {
      return n(r, t);
    }) : Uc.isFragment(t) && Kn(t.props.children, n);
  });
}
function ui(e, n, t) {
  return R.Children.toArray(e).every(function(r) {
    return ot(r, "Option");
  }) || R.Children.toArray(e).every(function(r) {
    return ot(r, "OptionGroup");
  }) || vp.warn("LeafyGreen Select: Combining grouped and ungrouped Select Options can cause styling issues"), R.Children.map(e, function(r) {
    if (ot(r, "Option"))
      return R.createElement(Gi, n(r));
    if (ot(r, "OptionGroup")) {
      var i = r.props, a = i.children, o = Dt(i, nx);
      return R.createElement(hd, $n({ className: void 0 }, o), ui(a, function(l) {
        return n(l, r);
      }, t));
    }
    return Uc.isFragment(r) ? ui(r.props.children, n, t) : (md(r) || t == null || t(r), null);
  });
}
function yt(e) {
  return e === null ? "" : e.props.value !== void 0 ? e.props.value : Array.isArray(e.props.children) ? e.props.children.filter(function(n) {
    return !md(n);
  }).join("") : e.props.children ? e.props.children.toString() : "";
}
function di(e, n) {
  var t, r, i;
  return (t = e.props.disabled) !== null && t !== void 0 && t || (r = n == null || (i = n.props) === null || i === void 0 ? void 0 : i.disabled) !== null && r !== void 0 && r;
}
function vl(e, n, t) {
  return yt(e) === t && !di(e, n);
}
function bd(e) {
  var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = n.initialValue, r = n.deps, i = r === void 0 ? [] : r, a = Tn(t);
  return tn(function() {
    return { get current() {
      return a.current;
    }, set current(o) {
      a.current = o, e(o);
    } };
  }, [e, a].concat(K0(i)));
}
function yd(e, n) {
  var t = Ye(function(r, i) {
    Array.isArray(r) ? r.forEach(t) : typeof r == "function" ? r(i) : r && (r.current = i);
  }, []);
  return bd(Ye(function(r) {
    return t(e, r);
  }, [e, t]), { initialValue: n });
}
var _l, wl, Sl, kl, Nl, Ol, Cl, Tl, Al, Ml, Il, Rl, Dl, Ll, Pl, Bl, Fl, $l, zl, Ul, Hl, jl = function(e) {
  var n = Qt(an(e), 2), t = n[0];
  return bd(n[1], { initialValue: e, deps: [t] });
}, tx = Qn("select-popover"), rx = se[2], ix = A(_l || (_l = me([`
  position: relative;
  text-align: left;
  width: 100%;
  border-radius: 3px;
  line-height: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
`]))), ax = A(wl || (wl = me([`
  width: max-content;
`]))), ox = function(e, n) {
  var t = G0[n], r = Ki[e];
  return he(A(Sl || (Sl = me([`
      min-height: `, `px;
      border-radius: 12px;
      box-shadow: 0 4px 7px 0 `, `;
      padding: `, `px 0;
      background-color: `, `;
      border: 1px solid `, `;
    `])), t.height, r.menu.shadow, se[200], Ge[e].background.primary.default, Ge[e].border.secondary.default));
}, Ed = R.forwardRef(function(e, n) {
  var t = e.children, r = e.id, i = e.referenceElement, a = e.className, o = e.labelId, l = e.dropdownWidthBasis, s = Qe().theme, u = dr(qi), c = u.size, d = u.disabled, f = u.open, h = yd(n, null), v = hp(i, rx), x = mp(v) ? "unset" : "".concat(Math.min(v, 274), "px"), m = Ye(function(b) {
    h.current && h.current.focus(), b.stopPropagation();
  }, [h]);
  return R.createElement(zc, { active: f && !d, spacing: 6, align: mt.Bottom, justify: Dn.Start, adjustOnMutation: !0, className: he(tx, a, _e({}, ax, l === ci.Option)), refEl: i }, R.createElement("ul", { "data-lgid": ji.popover, "aria-labelledby": o, role: "listbox", ref: h, tabIndex: -1, onClick: m, className: he(ix, ox(s, c), A(kl || (kl = me([`
              max-height: `, `;
              `, ` {
                font-size: `, `px;
              }
            `])), x, sr, Y0.text)), id: r }, t));
});
Ed.displayName = "ListMenu";
var ql, Kl, Gl, Wl, Vl, Yl, lx = Qn("select-menu"), sx = A(Nl || (Nl = me([`
  // Override button defaults
  font-weight: `, `;
  > *:last-child {
    grid-template-columns: 1fr 16px;
    justify-content: flex-start;

    > svg {
      justify-self: right;
      width: 16px;
      height: 16px;
    }
  }
`])), Mt.regular), cx = _e(_e(_e(_e({}, Ft.Default, A(Ol || (Ol = me([`
    > *:last-child {
      padding: 0 `, "px 0 ", `px;
    }
  `])), se[200], se[300])), Ft.Large, A(Cl || (Cl = me([`
    > *:last-child {
      padding: 0 `, "px 0 ", `px;
    }
  `])), se[200], se[300])), Ft.Small, A(Tl || (Tl = me([`
    > *:last-child {
      padding: 0 `, "px 0 ", `px;
    }
  `])), se[100], se[200])), Ft.XSmall, A(Al || (Al = me([`
    text-transform: none;
    font-size: `, `px;
    line-height: `, `px;
    > *:last-child {
      padding: 0 `, "px 0 ", `px;
    }
  `])), ut.body1.fontSize, ut.body1.lineHeight, se[100], se[200])), ux = _e(_e({}, ve.Light, A(Ml || (Ml = me([`
    background-color: `, `;
    // Override button default color
    > *:last-child {
      > svg {
        color: `, `;
      }
    }
  `])), Ge.light.background.primary.default, Ge.light.icon.primary.default)), ve.Dark, A(Il || (Il = me([`
    border-color: `, `;
    background-color: `, `;
    color: `, `;

    // Override button default color
    > *:last-child {
      > svg {
        color: `, `;
      }
    }

    &:hover,
    &:active,
    &:focus {
      background-color: `, `;
      color: `, `;
    }
  `])), Ge.dark.border.primary.default, U.gray.dark4, Ge.dark.text.primary.default, Ge.dark.icon.primary.default, U.gray.dark4, Ge.dark.text.primary.hover)), dx = _e(_e({}, ve.Light, A(Rl || (Rl = me([`
    &:focus-visible {
      box-shadow: `, `;
      border-color: rgba(255, 255, 255, 0);
    }
  `])), sa.light.input)), ve.Dark, A(Dl || (Dl = me([`
    &:focus-visible {
      background-color: `, `;
      box-shadow: `, `;
      border-color: rgba(255, 255, 255, 0);
    }
  `])), U.gray.dark4, sa.dark.input)), px = _e(_e({}, ve.Light, A(Ll || (Ll = me([`
    color: `, `;
  `])), U.gray.base)), ve.Dark, A(Pl || (Pl = me([`
    color: `, `;

    &:hover,
    &:active,
    &:focus {
      color: `, `;
    }
  `])), U.gray.dark1, U.gray.light1)), fx = A(Fl || (Fl = me([`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  gap: `, `px;
  overflow: hidden;
`])), se[100]), gx = A($l || ($l = me([`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
`]))), hx = ["children", "value", "text", "name", "deselected", "readOnly", "onClose", "onOpen", "state", "baseFontSize", "__INTERNAL__menuButtonSlot__", "__INTERNAL__menuButtonSlotProps__"], xd = R.forwardRef(function(e, n) {
  var t, r = e.children, i = e.value, a = e.text, o = e.name, l = e.deselected;
  e.readOnly;
  var s = e.onClose, u = e.onOpen, c = e.state, d = e.baseFontSize, f = e.__INTERNAL__menuButtonSlot__, h = e.__INTERNAL__menuButtonSlotProps__, v = Dt(e, hx), x = Qe().theme, m = dr(qi), b = m.open, w = m.size, _ = m.disabled, C = yd(n, null), M = Ye(function() {
    b ? s() : u(), C.current.focus();
  }, [s, u, b, C]), S = f || Bc, I = f ? "" : he(sx, ux[x], cx[w], dx[x], _e(_e(_e(_e({}, function(D) {
    return _e(_e(_e({}, lt.Error, A(zl || (zl = me([`
    border-color: `, `;

    &:hover,
    &:active {
      border-color: `, `;
      box-shadow: `, `;
    }
  `])), Ge[D].border.error.default, Ge[D].border.error.hover, ca[D].red)), lt.None, A(Ul || (Ul = me([""])))), lt.Valid, A(Hl || (Hl = me([`
    border-color: `, `;

    &:hover,
    &:active {
      border-color: `, `;
      box-shadow: `, `;
    }
  `])), Ge[D].border.success.default, Ge[D].border.success.hover, ca[D].green));
  }(x)[c || lt.None], !!c), px[x], l), function(D) {
    return A(Bl || (Bl = me([`
  cursor: not-allowed;
  pointer-events: unset;
  box-shadow: unset;

  &:active {
    pointer-events: none;
  }

  &[aria-disabled='true'] {
    background-color: `, `;
    border-color: `, `;
    color: `, `;

    &:hover,
    &:active {
      box-shadow: inherit;
    }

    > *:last-child {
      > svg {
        color: `, `;
      }
    }
  }
`])), Ge[D].background.disabled.default, Ge[D].border.disabled.default, Ge[D].text.disabled.default, Ge[D].icon.disabled.default);
  }(x), _), A(ql || (ql = me([`
              letter-spacing: initial;
            `]))), w === ga.XSmall), A(Kl || (Kl = me([`
            width: 100%;
            `, ` {
              height: `, `px;
              font-size: `, `px;
            }
          `])), sr, W0, V0)), L = (t = v["data-testid"]) !== null && t !== void 0 ? t : "leafygreen-ui-select-menubutton";
  return R.createElement(S, $n({}, v, h, { ref: C, name: o, value: i, disabled: _, onClick: M, variant: Ip.Default, darkMode: x === ve.Dark, rightGlyph: R.createElement(j0, null), size: w, "data-testid": L, className: he(I, _e({}, A(Gl || (Gl = me([`
              font-size: `, `px;
            `])), d), w === ga.Default), h == null ? void 0 : h.className) }), R.createElement("div", { className: fx }, R.createElement("div", { "data-lgid": ji.buttonText, className: he(lx, gx) }, a)), r);
});
xd.displayName = "MenuButton";
var Zl, Xl, Ql, Jl, es, ns, mx = A(Wl || (Wl = me([`
  display: flex;
  flex-direction: column;
  margin-bottom: `, `px;
`])), se[1]), bx = A(Vl || (Vl = me([`
  display: flex;
  flex-direction: column;
`]))), ts = A(Yl || (Yl = me([`
  font-size: `, `px;
  line-height: `, `px;
`])), ut.large.fontSize, ut.large.lineHeight), yx = ["children", "darkMode", "size", "disabled", "allowDeselect", "renderMode", "placeholder", "errorMessage", "successMessage", "state", "dropdownWidthBasis", "baseFontSize", "data-lgid", "id", "aria-labelledby", "aria-label", "className", "label", "description", "name", "defaultValue", "value", "onChange", "readOnly", "portalContainer", "portalRef", "scrollContainer", "portalClassName", "popoverZIndex", "onEntering", "onEnter", "onEntered", "onExiting", "onExit", "onExited", "__INTERNAL__menuButtonSlot__"], Ex = Pc(function(e, n) {
  var t, r = e.children, i = e.darkMode, a = e.size, o = a === void 0 ? _n.Default : a, l = e.disabled, s = l !== void 0 && l, u = e.allowDeselect, c = u === void 0 || u, d = e.renderMode, f = d === void 0 ? Si.TopLayer : d, h = e.placeholder, v = h === void 0 ? "Select" : h, x = e.errorMessage, m = x === void 0 ? ha.error : x, b = e.successMessage, w = b === void 0 ? ha.success : b, _ = e.state, C = _ === void 0 ? lt.None : _, M = e.dropdownWidthBasis, S = M === void 0 ? ci.Trigger : M, I = e.baseFontSize, L = I === void 0 ? er.Body1 : I, D = e["data-lgid"], Y = D === void 0 ? ji.root : D, J = e.id, W = e["aria-labelledby"], B = e["aria-label"], q = e.className, G = e.label, T = e.description, P = e.name, $ = e.defaultValue, j = e.value, E = e.onChange, ue = e.readOnly, Z = e.portalContainer, y = e.portalRef, z = e.scrollContainer, V = e.portalClassName, te = e.popoverZIndex, ie = e.onEntering, de = e.onEnter, pe = e.onEntered, Oe = e.onExiting, Be = e.onExit, Re = e.onExited, ln = e.__INTERNAL__menuButtonSlot__, We = Dt(e, yx), Je = Jt({ prefix: "select", id: J }), Ne = tn(function() {
    return B && !G ? void 0 : W ?? "".concat(Je, "-label");
  }, [W, B, G, Je]);
  G || W || B || console.error("For screen-reader accessibility, label, aria-label, or aria-labelledby must be provided to Select.");
  var ee = Qe(i).darkMode, He = "".concat(Je, "-description"), ye = "".concat(Je, "-menu"), oe = Qt(an(!1), 2), fe = oe[0], ze = oe[1], bn = bp(n, null), je = jl(null), K = Jt({ prefix: "select" }), X = jl(null), k = tn(function() {
    return { size: o, open: fe, disabled: s };
  }, [o, fe, s]);
  wn(function() {
    j !== void 0 && E === void 0 && ue !== !0 && console.warn("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.");
  }, [E, ue, j]);
  var O = Ye(function() {
    ze(!0);
  }, []), F = Ye(function() {
    ze(!1), je.current.focus();
  }, [je]);
  wn(function() {
    if (fe) {
      var re = function(Se) {
        var ke = je.current.contains(Se.target) || X.current.contains(Se.target);
        ze(ke);
      };
      return document.addEventListener("mousedown", re), function() {
        document.removeEventListener("mousedown", re);
      };
    }
  }, [X, je, fe]);
  var ae = tn(function() {
    var re = null;
    return j === void 0 && $ !== void 0 && Kn(r, function(Se, ke) {
      vl(Se, ke, $) && (re = Se);
    }), re;
  }, [r, $, j]), le = Qt(an(ae), 2), Ee = le[0], Le = le[1];
  wn(function() {
    var re;
    Ee !== null && Le((re = function(Se, ke) {
      var Nn, In, br, yr, ia, Er, xr, vr;
      return Kn(Se, function(On) {
        if (On === ke)
          ia = ke;
        else if (On.props.children === ke.props.children && On.props.value === ke.props.value) {
          var aa;
          (aa = Er) !== null && aa !== void 0 || (Er = On);
        } else if (On.props.value !== void 0 && On.props.value === ke.props.value) {
          var oa;
          (oa = xr) !== null && oa !== void 0 || (xr = On);
        } else if (yt(On) === yt(ke)) {
          var la;
          (la = vr) !== null && la !== void 0 || (vr = On);
        }
      }), (Nn = (In = (br = (yr = ia) !== null && yr !== void 0 ? yr : Er) !== null && br !== void 0 ? br : xr) !== null && In !== void 0 ? In : vr) !== null && Nn !== void 0 ? Nn : null;
    }(r, Ee)) !== null && re !== void 0 ? re : ae);
  }, [r, ae, Ee]);
  var Pe = tn(function() {
    if (j !== void 0) {
      var re = null;
      return Kn(r, function(Se, ke) {
        vl(Se, ke, j) && (re = Se);
      }), re;
    }
    return Ee;
  }, [r, Ee, j]), Ve = Ye(function(re, Se) {
    Se.preventDefault(), Se.stopPropagation(), j === void 0 && Le(re), E == null || E(yt(re), Se), Ze(void 0), F();
  }, [E, F, j]), Xe = Ye(function(re, Se) {
    return function(ke) {
      ke.preventDefault(), ke.stopPropagation(), s || Se || (Ve(re, ke), F());
    };
  }, [s, F, Ve]), De = Qt(an(), 2), Ue = De[0], Ze = De[1], en = tn(function() {
    var re = [];
    return c && re.push(null), Kn(r, function(Se, ke) {
      di(Se, ke) || re.push(Se);
    }), re;
  }, [r, c]), Zi = Ye(function(re) {
    Ue !== void 0 && Ve(Ue, re);
  }, [Ue, Ve]), Xi = Ye(function() {
    Ze(en[0]);
  }, [en]), Qi = Ye(function() {
    Ze(en[en.length - 1]);
  }, [en]), Ji = Ye(function() {
    if (Ue === void 0 || en.indexOf(Ue) === 0)
      Qi();
    else {
      var re = en.indexOf(Ue) - 1;
      Ze(en[re]);
    }
  }, [en, Ue, Qi]), ea = Ye(function() {
    if (Ue === void 0 || en.indexOf(Ue) === en.length - 1)
      Xi();
    else {
      var re = en.indexOf(Ue) + 1;
      Ze(en[re]);
    }
  }, [en, Ue, Xi]), Pt = Ye(function(re, Se) {
    return function(ke) {
      ke.preventDefault(), ke.stopPropagation(), s || Se || Ze(re);
    };
  }, [s]), Yd = Ye(function(re) {
    var Se, ke;
    if (!(re.ctrlKey || re.shiftKey || re.altKey)) {
      var Nn = (Se = X.current) === null || Se === void 0 ? void 0 : Se.contains(document.activeElement), In = (ke = je.current) === null || ke === void 0 ? void 0 : ke.contains(document.activeElement);
      if (In || Nn)
        switch (re.key) {
          case xn.Tab:
          case xn.Escape:
            F(), Ze(void 0);
            break;
          case xn.Enter:
          case xn.Space:
            fe && !In && re.preventDefault(), Zi(re);
            break;
          case xn.ArrowUp:
            !fe && In && O(), re.preventDefault(), Ji();
            break;
          case xn.ArrowDown:
            !fe && In && O(), re.preventDefault(), ea();
        }
    }
  }, [X, je, F, fe, Zi, Ji, ea, O]);
  yp("keydown", Yd);
  var na = Ep(), ta = tn(function() {
    var re = !1;
    return Kn(r, function(Se) {
      re || (re = Se.props.glyph !== void 0);
    }), re;
  }, [r]), Bt = tn(function() {
    return na !== null && X.current !== null && Ue === void 0 && fe;
  }, [Ue, X, fe, na]), Zd = tn(function() {
    var re = Pe === null;
    return R.createElement(Gi, { className: void 0, glyph: void 0, selected: re, focused: Ue === null, disabled: !1, onClick: Xe(null, !1), onFocus: Pt(null, !1), hasGlyphs: !1, triggerScrollIntoView: re && Bt }, v);
  }, [Bt, Ue, Xe, Pt, v, Pe]), Xd = tn(function() {
    return ui(r, function(re, Se) {
      var ke = re === Pe, Nn = di(re, Se);
      return Ur(Ur({}, re.props), {}, { className: re.props.className, glyph: re.props.glyph, selected: ke, focused: re === Ue, disabled: Nn, children: re.props.children, hasGlyphs: ta, onClick: Xe(re, Nn), onFocus: Pt(re, Nn), triggerScrollIntoView: ke && Bt });
    }, function() {
      console.error("`Select` instance received child that is not `Option` or `OptionGroup`.");
    });
  }, [Bt, r, Ue, Xe, Pt, ta, Pe]), ra = Ur({ popoverZIndex: te, onEntering: ie, onEnter: de, onEntered: pe, onExiting: Oe, onExit: Be, onExited: Re }, Fc({ dismissMode: $c.Manual, portalClassName: V, portalContainer: Z, portalRef: y, renderMode: f, scrollContainer: z }));
  return R.createElement(Xn, { darkMode: ee }, R.createElement("div", { ref: bn, className: he(bx, q), "data-lgid": Y }, (G || T) && R.createElement("div", { className: mx }, G && R.createElement(ep, { htmlFor: K, id: Ne, darkMode: ee, disabled: s, className: he(_e(_e({}, ts, o === _n.Large), A(Zl || (Zl = me([`
                        font-size: `, `px;
                        line-height: 20px;
                      `])), L), o === _n.Default), A(Xl || (Xl = me([`
                      // Prevent hover state from showing when hovering label
                      pointer-events: none;
                    `]))), A(Ql || (Ql = me([`
                      `, ` {
                        font-size: `, `px;
                        line-height: `, `px;
                      }
                    `])), sr, yl.text, yl.lineHeight)) }, G), T && R.createElement(np, { id: He, darkMode: ee, disabled: s, className: he(_e(_e({}, ts, o === _n.Large), A(Jl || (Jl = me([`
                        font-size: `, `px;
                        line-height: 20px;
                      `])), L), o === _n.Default), A(es || (es = me([`
                      `, ` {
                        font-size: `, `px;
                        line-height: `, `px;
                      }
                    `])), sr, El.text, El.lineHeight)) }, T)), R.createElement(qi.Provider, { value: k }, R.createElement(xd, $n({}, We, { id: K, ref: je, name: P, readOnly: ue, value: yt(Pe), text: Pe !== null ? Pe.props.children : v, deselected: Pe === null, onOpen: O, onClose: F, "aria-labelledby": Ne, "aria-label": G || W ? void 0 : B, "aria-controls": ye, "aria-expanded": fe, "aria-describedby": He, "aria-invalid": C === lt.Error, "aria-disabled": s, state: C, baseFontSize: L, __INTERNAL__menuButtonSlot__: ln })), R.createElement(xp, ra, R.createElement(Ed, $n({ labelId: Ne, id: ye, referenceElement: je, ref: X, className: he(_e({}, A(ns || (ns = me([`
                    width: `, `px;
                  `])), (t = je.current) === null || t === void 0 ? void 0 : t.clientWidth), S === ci.Trigger)), dropdownWidthBasis: S }, ra), c && Zd, Xd))), R.createElement(Dp, { disabled: s, errorMessage: m, hideFeedback: fe, size: o, state: C, successMessage: w })));
});
Ex.displayName = "Select";
function rs(e, n) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    n && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), t.push.apply(t, r);
  }
  return t;
}
function pi(e) {
  for (var n = 1; n < arguments.length; n++) {
    var t = arguments[n] != null ? arguments[n] : {};
    n % 2 ? rs(Object(t), !0).forEach(function(r) {
      Fe(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : rs(Object(t)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function xx(e) {
  var n = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(t, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function cr(e) {
  return cr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(n) {
    return typeof n;
  } : function(n) {
    return n && typeof Symbol == "function" && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : typeof n;
  }, cr(e);
}
function Fe(e, n, t) {
  return (n = xx(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function Tt() {
  return Tt = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
    }
    return e;
  }, Tt.apply(this, arguments);
}
function Wi(e, n) {
  if (e == null)
    return {};
  var t, r, i = function(o, l) {
    if (o == null)
      return {};
    var s, u, c = {}, d = Object.keys(o);
    for (u = 0; u < d.length; u++)
      s = d[u], l.indexOf(s) >= 0 || (c[s] = o[s]);
    return c;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      t = a[r], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
function be(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
function Gn(e, n) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, r) {
    var i = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (i != null) {
      var a, o, l, s, u = [], c = !0, d = !1;
      try {
        if (l = (i = i.call(t)).next, r !== 0)
          for (; !(c = (a = l.call(i)).done) && (u.push(a.value), u.length !== r); c = !0)
            ;
      } catch (f) {
        d = !0, o = f;
      } finally {
        try {
          if (!c && i.return != null && (s = i.return(), Object(s) !== s))
            return;
        } finally {
          if (d)
            throw o;
        }
      }
      return u;
    }
  }(e, n) || vd(e, n) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function Ln(e) {
  return function(n) {
    if (Array.isArray(n))
      return fi(n);
  }(e) || function(n) {
    if (typeof Symbol < "u" && n[Symbol.iterator] != null || n["@@iterator"] != null)
      return Array.from(n);
  }(e) || vd(e) || function() {
    throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function vd(e, n) {
  if (e) {
    if (typeof e == "string")
      return fi(e, n);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    return t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set" ? Array.from(e) : t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? fi(e, n) : void 0;
  }
}
function fi(e, n) {
  (n == null || n > e.length) && (n = e.length);
  for (var t = 0, r = new Array(n); t < n; t++)
    r[t] = e[t];
  return r;
}
var is, as, os, ls, ss, _d = wi({}), vx = function() {
  return dr(_d);
}, _x = function(e) {
  var n = e.children, t = e.contents, r = e.darkMode, i = e.language, a = e.isLoading, o = e.showPanel, l = e.lgids, s = _d.Provider, u = tn(function() {
    return { contents: t, language: i, showPanel: o, isLoading: a, lgids: l };
  }, [t, i, o, a, l]);
  return R.createElement(Xn, { darkMode: r }, R.createElement(s, { value: u }, n));
}, at = "lg-code", wd = function() {
  var e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : at;
  return { root: e, panel: "".concat(at, "-panel"), select: "".concat(e, "-select"), copyButton: "".concat(at, "-copy_button"), copyTooltip: "".concat(at, "-copy_tooltip"), expandButton: "".concat(e, "-expand_button"), skeleton: "".concat(e, "-skeleton"), pre: "".concat(e, "-pre"), title: "".concat(at, "-title") };
}, wx = 1500, Hr = "Copied!", cs = "Copy", Sx = function(e) {
  var n = e.theme, t = e.copied, r = e.showPanel, i = e.className;
  return he(A(is || (is = be([`
      align-self: center;

      &[aria-disabled='false'] {
        color: `, `;
      }

      div[role='tooltip'] svg {
        width: 26px;
        height: 26px;
      }

      &,
      & > div > svg {
        transition: all `, `ms ease-in-out;
      }
    `])), Ge[n].icon.primary.default, Fn.default), Fe(Fe({}, kx[n], t), Nx[n], !r), i);
}, kx = Fe(Fe({}, ve.Light, A(as || (as = be([`
    &,
    & > div > svg {
      color: `, `;

      &:focus,
      &:hover {
        color: `, `;
      }
    }

    background-color: `, `;

    &:focus,
    &:hover {
      background-color: `, `;
      &:before {
        background-color: `, `;
      }
    }
  `])), U.white, U.white, U.green.dark1, U.green.dark1, U.green.dark1)), ve.Dark, A(os || (os = be([`
    &,
    & > div > svg {
      color: `, `;

      &:focus,
      &:hover {
        color: `, `;
      }
    }

    background-color: `, `;

    &:focus,
    &:hover {
      background-color: `, `;

      &:before {
        background-color: `, `;
      }
    }
  `])), U.gray.dark3, U.gray.dark3, U.green.base, U.green.base, U.green.base)), Nx = Fe(Fe({}, ve.Light, A(ls || (ls = be([`
    border-color: `, `;
  `])), U.gray.base)), ve.Dark, A(ss || (ss = be([`
    border-color: `, `;
  `])), U.gray.light2)), Ox = ["onCopy", "contents", "className"];
function Sd(e) {
  var n = e.onCopy, t = e.contents, r = e.className, i = Wi(e, Ox), a = Gn(an(!1), 2), o = a[0], l = a[1], s = Gn(an(!1), 2), u = s[0], c = s[1], d = Tn(null), f = Tn(null), h = Qe().theme, v = _p().portalContainer, x = vx(), m = x.showPanel, b = x.isLoading, w = wd(), _ = function() {
    return c(!1);
  };
  Nc(_, d, { enabled: u }), wn(function() {
    if (d.current) {
      var M = new Wu(d.current, { text: function() {
        return t;
      }, container: v });
      if (o) {
        var S = setTimeout(function() {
          l(!1);
        }, wx);
        return function() {
          return clearTimeout(S);
        };
      }
      return function() {
        return M.destroy();
      };
    }
  }, [d, t, o, v]);
  var C = pi({ "aria-label": cs, "data-testid": w.copyButton, "data-lgid": w.copyButton, className: Sx({ theme: h, copied: o, showPanel: m, className: r }), onClick: function(M) {
    M.preventDefault(), n == null || n(), l(!0);
  }, onKeyDown: function(M) {
    switch (M.key) {
      case xn.Escape:
      case xn.Tab:
        _();
        break;
      case xn.Enter:
      case xn.Space:
        var S, I;
        M.preventDefault(), (S = d.current) === null || S === void 0 || S.click(), (I = d.current) === null || I === void 0 || I.focus();
    }
  }, onMouseEnter: function() {
    f.current = setTimeout(function() {
      c(!0);
    }, Qu);
  }, onMouseLeave: function() {
    f.current && (clearTimeout(f.current), f.current = null), _();
  }, ref: d, disabled: b }, i);
  return R.createElement(Ju, { align: hy.Top, "data-testid": w.copyTooltip, justify: Dn.Middle, open: u, renderMode: Si.TopLayer, setOpen: c, trigger: m ? R.createElement(Mp, C, o ? R.createElement(li, null) : R.createElement(Uo, null), o && R.createElement(fa, { role: "alert" }, Hr)) : R.createElement(Bc, Tt({ leftGlyph: o ? R.createElement(li, null) : R.createElement(Uo, null), size: "xsmall" }, C), o && R.createElement(fa, { role: "alert" }, Hr)), shouldClose: function() {
    return !u;
  } }, o ? Hr : cs);
}
Sd.displayName = "CopyButton";
var cn = Fe(Fe({}, ve.Light, { 0: U.gray.light3, 1: U.gray.light2, 2: U.gray.dark2, 3: U.black, 4: U.white, 5: "#D83713", 6: "#956d00", 7: "#12824D", 8: "#007ab8", 9: "#016ee9", 10: "#CC3887" }), ve.Dark, { 0: U.black, 1: U.gray.dark2, 2: U.gray.light1, 3: U.gray.light3, 4: U.gray.dark2, 5: "#FF6F44", 6: "#EDB210", 7: "#35DE7B", 8: "#a5e3ff", 9: "#2dc4ff", 10: "#FF7DC3" }), Cx = function(e) {
  return `
  .lg-highlight-hljs-`.concat(e, ` {
    
    .lg-highlight-keyword,
    .lg-highlight-keyword.lg-highlight-function,
    .lg-highlight-keyword.lg-highlight-class,
    .lg-highlight-selector-tag,
    .lg-highlight-selector-attr,
    .lg-highlight-selector-pseudo,
    .lg-highlight-selector-id,
    .lg-highlight-selector-class {
      color: `).concat(cn[e][10], `;
    }

    .lg-highlight-regexp,
    .lg-highlight-number,
    .lg-highlight-literal,
    .lg-highlight-function.lg-highlight-title {
      color: `).concat(cn[e][9], `;
    }

    .lg-highlight-quote,
    .lg-highlight-section,
    .lg-highlight-name {
      color: `).concat(cn[e][8], `;
    }

    .lg-highlight-string,
    .lg-highlight-addition {
      color: `).concat(cn[e][7], `;
    }

    .lg-highlight-meta,
    .lg-highlight-meta-string {
      color: `).concat(cn[e][6], `;
    }

    .lg-highlight-variable,
    .lg-highlight-deletion,
    .lg-highlight-symbol,
    .lg-highlight-bullet,
    .lg-highlight-meta,
    .lg-highlight-link,
    .lg-highlight-attr,
    .lg-highlight-attribute,
    .lg-highlight-language,
    .lg-highlight-template-variable,
    .lg-highlight-built_in,
    .lg-highlight-type,
    .lg-highlight-params {
      color: `).concat(cn[e][5], `
    }

    .lg-highlight-title,
    .lg-highlight-class.lg-highlight-title {
      color: `).concat(cn[e][3], `;
    }

    .lg-highlight-doctag,
    .lg-highlight-formula {
      color: `).concat(cn[e][3], `;
    }
  
    .lg-highlight-comment {
      color: `).concat(cn[e][2], `;
      font-style: italic;
    }
  
    .lg-highlight-string {
      font-weight: 600;
    }
    
    .lg-highlight-emphasis {
      font-style: italic;
    }
  
    .lg-highlight-strong {
      font-weight: `).concat(Mt.bold, `;
    }
  }
`);
}, Tx = { javascript: pb, typescript: Lb, c: Jm, cpp: eb, csharp: nb, go: ib, http: ab, ini: ob, java: lb, perl: bb, php: yb, properties: Eb, python: xb, ruby: vb, rust: _b, scala: wb, swift: Rb, kotlin: hb, objectivec: mb, dart: tb, bash: Qm, shell: Sb, sql: kb, yaml: Bb, json: fb, diff: rb, xml: Pb }, kd = { JavaScript: "javascript", JS: "js", TypeScript: "typescript", TS: "ts", C: "c", Cpp: "cpp", Csharp: "csharp", Cs: "cs", Go: "go", Html: "xml", Http: "http", Ini: "ini", Java: "java", Perl: "perl", Php: "php", Properties: "properties", Python: "python", Ruby: "ruby", Rust: "rust", Scala: "scala", Swift: "swift", Kotlin: "kotlin", ObjectiveC: "objectivec", Dart: "dart", Bash: "bash", Shell: "shell", Sql: "sql", Yaml: "yaml", Json: "json", Graphql: "graphql", Diff: "diff", Xml: "xml" }, Nd = wi({ highlightLines: [], darkMode: !1, customKeywords: {} });
function us() {
  for (var e = ["function", "class"], n = arguments.length, t = new Array(n), r = 0; r < n; r++)
    t[r] = arguments[r];
  return t.filter(function(i) {
    return e.includes(i);
  });
}
function hr(e) {
  return e != null && e instanceof Array;
}
function Od(e) {
  return e != null && cr(e) === "object" && !(e instanceof Array);
}
function Mn(e) {
  return e != null && typeof e == "string";
}
function gi() {
  var e = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "lg-highlight-";
  return (arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : []).filter(function(n) {
    return Mn(n) && n.length > 0;
  }).map(function(n) {
    return n.startsWith(e) ? n : n.split(".").map(function(t) {
      return "".concat(e).concat(t);
    }).join(" ");
  }).join(" ");
}
var ds, ps, fs, gs, Ax = function(e, n) {
  return e.reduce(function(t, r) {
    var i = t[t.length - 1];
    return typeof r == "string" && typeof i == "string" ? t[t.length - 1] = i + r : t.push(r), t;
  }, []).map(function(t) {
    if (typeof t == "string") {
      var r = new RegExp("(".concat(Object.keys(n).join("|"), ")"), "g");
      return r.test(t) ? t.split(r).filter(Boolean).map(function(i) {
        return n[i] ? { kind: gi([n[i]]), children: [i] } : i;
      }) : t;
    }
    return t;
  }).flat();
};
function Mx(e) {
  var n = e.kind, t = e.children;
  return R.createElement("span", { className: n }, t);
}
function hi(e, n) {
  return e == null ? null : Mn(e) ? e : hr(e) ? e.map(hi) : Od(e) ? R.createElement(Mx, { key: n, kind: e.kind }, hi(e.children)) : e;
}
var hs = A(ds || (ds = be([`
  border-spacing: 0;
  vertical-align: top;
  padding: 0 `, `px;
`])), se[300]);
function Ix(e) {
  var n, t, r;
  return e ? (n = "transparent", t = "linear-gradient(90deg, ".concat(U.gray.dark3, ", ").concat(U.black, ")"), r = U.gray.dark3) : (n = U.yellow.light3, t = "none", r = U.yellow.light2), A(ps || (ps = be([`
    background-color: `, `;
    background-image: `, `;
    // Fixes an issue in Safari where the gradient applied to the table row would be applied
    // to each cell in the row instead of being continuous across cells.
    background-attachment: fixed;

    // Selects all children of a highlighted row, and adds a border top
    & > td {
      border-top: 1px solid `, `;
    }

    // Selects following rows after a highlighted row, and adds a border top
    // We don't add border bottoms here to support consecutive highlighted rows.
    & + tr > td {
      border-top: 1px solid `, `;
    }

    // Remove borders between consecutive highlighted rows
    & + & > td {
      border-top: 0;
    }

    // If the highlighted row is the last child, then we add a border bottom
    &:last-child > td {
      border-bottom: 1px solid `, `;
    }
  `])), n, t, r, r, r);
}
function Rx(e) {
  var n = e.lineNumber, t = e.highlighted, r = e.darkMode, i = e.children, a = r ? U.gray.light1 : U.gray.dark1, o = r ? U.gray.light3 : U.yellow.dark2;
  return R.createElement("tr", { className: he(Fe({}, Ix(r), t)) }, n && R.createElement("td", { className: he(hs, A(fs || (fs = be([`
              user-select: none;
              text-align: right;
              padding-left: `, `px;
              padding-right: 0;
              color: `, `;
            `])), se[400], t ? o : a)) }, n), R.createElement("td", { className: hs }, i));
}
function Cd(e) {
  var n = (e ?? {}).children;
  return !(!hr(n) || n.length !== 1 || !Mn(n[0]));
}
function Td(e, n) {
  if (typeof e == "string")
    return e;
  if ((t = e) != null && cr(t) === "object" && typeof t.kind == "string" && t.children instanceof Array)
    return Td(e.children, n);
  var t;
  return dl(e, function r() {
    for (var i = arguments.length, a = new Array(i), o = 0; o < i; o++)
      a[o] = arguments[o];
    return a = a.filter(function(l) {
      return Mn(l) && l.length > 0;
    }), function(l) {
      var s, u;
      return Mn(l) ? a.length > 0 ? { kind: gi([n].concat(Ln(a), Ln(us(l)))), children: [l] } : l : ((s = l == null || (u = l.children) === null || u === void 0 ? void 0 : u.length) !== null && s !== void 0 ? s : 0) >= 1 ? dl(l.children, r.apply(void 0, [n, l.kind].concat(Ln(a)))) : Cd(l) ? { kind: gi([n, l.kind].concat(Ln(a), Ln(us.apply(void 0, Ln(l.children))))), children: l.children } : l;
    };
  }(n));
}
function Ad(e) {
  return hr(e) ? e.some(Ad) : Mn(e) ? e.includes(`
`) : !!Od(e) && (((n = e.children) === null || n === void 0 ? void 0 : n.includes(`
`)) || Mn((t = e.children) === null || t === void 0 ? void 0 : t[0]) && e.children[0].includes(`
`));
  var n, t;
}
function Dx(e) {
  var n = [], t = 0;
  n[t] == null && (n[t] = []);
  var r = function() {
    t++, n[t] = [];
  };
  return Td(e).forEach(function(i) {
    Ad(i) ? Mn(i) ? i.split(`
`).forEach(function(a, o) {
      o > 0 && r(), a && n[t].push(a);
    }) : i.children[0].split(`
`).forEach(function(a, o) {
      o > 0 && r(), n[t].push({ kind: i.kind, children: [a] });
    }) : i && (Mn(i) || Cd(i)) && n[t].push(i);
  }), n;
}
function Md(e) {
  for (var n = e.lines, t = dr(Nd), r = t.highlightLines, i = t.showLineNumbers, a = t.darkMode, o = t.lineNumberStart, l = t.customKeywords, s = l === void 0 ? {} : l, u = Ln(n); ((c = u[0]) === null || c === void 0 ? void 0 : c.length) === 0; ) {
    var c;
    u.shift();
  }
  for (; ((d = u[u.length - 1]) === null || d === void 0 ? void 0 : d.length) === 0; ) {
    var d;
    u.pop();
  }
  return R.createElement(R.Fragment, null, u.map(function(f, h) {
    var v, x = h + (o ?? 1), m = function(C) {
      return r.some(function(M) {
        if ((S = M) != null && typeof S == "number")
          return C === M;
        var S;
        if (hr(M)) {
          var I = Ln(M).sort(function(L, D) {
            return L - D;
          });
          return C >= I[0] && C <= I[1];
        }
        return !1;
      });
    }(x), b = f;
    Object.keys(s).length > 0 && (b = Ax(f, s));
    var w = i ? x : void 0, _ = (v = b) !== null && v !== void 0 && v.length ? b.map(hi) : R.createElement("div", { className: A(gs || (gs = be([`
              display: inline-block;
            `]))) });
    return R.createElement(Rx, { key: x, lineNumber: w, darkMode: a, highlighted: m }, _);
  }));
}
var ms, bs, ys, Lx = { "after:highlight": function(e) {
  var n = e._emitter.rootNode;
  e.react = R.createElement(Md, { lines: Dx(n.children) });
} }, Id = pi(pi({}, kd), {}, { None: "none" }), Px = ["children", "language", "showLineNumbers", "lineNumberStart", "highlightLines", "className", "customKeywords"];
function Bx(e) {
  return e !== "cs" && e !== "js" && e !== "ts";
}
var Rd = !1;
function Fx() {
  Rd = !0, Object.values(ve).forEach(function(n) {
    return wp(Cx(n));
  });
  var e = Object.values(kd).filter(Bx);
  e.forEach(function(n) {
    n === "graphql" ? hE(bt) : bt.registerLanguage(n, Tx[n]);
  }), bt.configure({ languages: e, tabReplace: "  " }), bt.addPlugin(Lx);
}
var $x = A(ms || (ms = be([`
  color: inherit;
  font-family: `, `;
`])), _i.code);
function Dd(e) {
  var n = e.children, t = e.language, r = e.showLineNumbers, i = r !== void 0 && r, a = e.lineNumberStart, o = e.highlightLines, l = o === void 0 ? [] : o, s = e.className, u = e.customKeywords, c = u === void 0 ? {} : u, d = Wi(e, Px);
  Rd || Fx();
  var f = tn(function() {
    return t === Id.None ? null : bt.highlight(n, { language: t, ignoreIllegals: !0 });
  }, [t, n]), h = f === null ? R.createElement(Md, { lines: n.split(`
`).map(function(_) {
    return _ ? [_] : [];
  }) }) : f.react, v = Qe(), x = v.theme, m = v.darkMode, b = Lc() === 14 ? ut.code1 : ut.code2, w = A(bs || (bs = be([`
    font-size: `, `px;
    line-height: `, `px;
  `])), b.fontSize, b.lineHeight);
  return R.createElement(Nd.Provider, { value: { highlightLines: l, showLineNumbers: i, lineNumberStart: a, darkMode: m, customKeywords: c } }, R.createElement("code", Tt({}, d, { className: he("lg-highlight-hljs-".concat(x), $x, w, t, s) }), R.createElement("table", { className: A(ys || (ys = be([`
            border-spacing: 0;
          `]))) }, R.createElement("tbody", null, h))));
}
Dd.displayName = "Syntax";
var Es, xs, vs, _s, ws, Ss, ks, Ns, Os, Cs, Ts, As, Ms, Is, Rs, Ds, Ls, Ps, Bs, Fs, $s, zs = "none", Ld = "left", mi = "right", bi = "both", yi = { Hover: "hover", Persist: "persist", None: "none" }, Pd = Qn("copy_button"), zx = yy(["@media only screen and (max-device-width: 812px) and (-webkit-min-device-pixel-ratio: 2)", "@media only screen and (min-device-width: 813px) and (-webkit-min-device-pixel-ratio: 2)"]), Us = se[200], Ux = function(e) {
  var n = e.theme, t = e.className;
  return he(A(Es || (Es = be([`
      border: 1px solid `, `;
      border-radius: 12px;
      overflow: hidden;
      width: 100%;
    `])), cn[n][1]), t);
}, Hx = function(e) {
  var n = e.scrollState, t = e.theme, r = e.showPanel, i = e.showExpandButton, a = e.isLoading;
  return he(Gx, rv, Fe(Fe(Fe(Fe(Fe({}, function(o, l) {
    var s = l === ve.Light ? "1px 0 10px 0 ".concat(Vn(0.75, "black")) : "15px 0px 15px 0 ".concat(Vn(0.7, "black")), u = l === ve.Light ? "-1px 0px 10px ".concat(Vn(0.75, "black")) : "-15px 0px 15px 0 ".concat(Vn(0.7, "black"));
    return A(Bs || (Bs = be([`
    &:before {
      `, `;
    }
    &:after {
      `, `;
    }
  `])), (o === bi || o === Ld) && A(Fs || (Fs = be([`
        box-shadow: `, `;
      `])), s), (o === bi || o === mi) && `
        box-shadow: `.concat(u, `;
      `));
  }(n, t), !a), Vx, r), Wx, !r), Zx, i && r), Yx, i && !r));
}, jx = function(e) {
  var n = e.theme, t = e.showPanel, r = e.expanded, i = e.codeHeight, a = e.collapsedCodeHeight, o = e.isMultiline, l = e.showExpandButton, s = e.className;
  return he(Xx, function(u) {
    var c = cn[u];
    return A(Rs || (Rs = be([`
    background-color: `, `;
    color: `, `;
  `])), c[0], c[3]);
  }(n), nv, Fe(Fe(Fe(Fe({}, Jx, t), Qx, !t), ev, !o), function(u, c, d) {
    return A(Is || (Is = be([`
    max-height: `, `px;
    overflow-y: hidden;
    transition: max-height `, `ms ease-in-out;
  `])), u ? c : d, Fn.slower);
  }(r, i, a), l), s);
}, qx = function(e) {
  var n = e.theme;
  return he(tv, function(t) {
    var r = cn[t];
    return A(Ls || (Ls = be([`
    background-color: `, `;
    border-color: `, `;
    color: `, `;
    &:hover {
      background-color: `, `;
    }
    &:focus-visible {
      background-color: `, `;
      color: `, `;
      outline: none;
    }
  `])), r[0], r[1], r[2], r[1], Ge[t].background.info.focus, t === ve.Light ? U.blue.dark1 : r[2]);
  }(n));
}, Kx = function(e) {
  var n = e.copyButtonAppearance;
  return he(Pd, A(xs || (xs = be([`
      position: absolute;
      z-index: 1;
      top: `, `px;
      right: `, `px;
      transition: opacity `, `ms ease-in-out;

      // On hover or focus, the copy button should always be visible
      &:hover,
      &:focus-within {
        opacity: 1;
      }
    `])), se[200], se[200], Fn.default), Fe({}, A(vs || (vs = be([`
        opacity: 0;

        // On a mobile device, the copy button should always be visible
        `, ` {
          opacity: 1;
        }
      `])), Dc(_t.Desktop)), n === yi.Hover));
}, Gx = A(_s || (_s = be([`
  position: relative;
  display: grid;
  border-radius: inherit;
  z-index: 0; // new stacking context
  grid-template-areas:
    'panel'
    'code';
`]))), Wx = A(ws || (ws = be([`
  // No panel, all code
  grid-template-areas: 'code code';

  &:after {
    grid-column: -1; // Placed on the right edge
  }
`]))), Vx = A(Ss || (Ss = be([`
  grid-template-areas:
    'panel'
    'code';
  grid-template-columns: unset;

  &:before,
  &:after {
    grid-row: 2; // Placed on the top under the Picker Panel
  }
`]))), Yx = A(ks || (ks = be([`
  grid-template-areas: 'code code' 'expandButton expandButton';
  grid-template-rows: auto 28px;
`]))), Zx = A(Ns || (Ns = be([`
  grid-template-areas:
    'panel'
    'code'
    'expandButton';
  grid-template-rows: auto auto 28px;
`]))), Xx = A(Os || (Os = be([`
  grid-area: code;
  overflow-x: auto;
  // Many applications have global styles that are adding a border and border radius to this element.
  border-radius: inherit;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border: 0;
  // We apply left / right padding in Syntax to support line highlighting
  padding-top: `, `px;
  padding-bottom: `, `px;
  margin: 0;
  position: relative;
  transition: box-shadow `, `ms ease-in-out;
  transition: height `, `ms ease-in-out;

  `, `

  &:focus-visible {
    outline: none;
  }
`])), Us, Us, Fn.faster, Fn.slower, zx({ whiteSpace: ["pre", "pre-wrap", "pre"] })), Qx = A(Cs || (Cs = be([`
  border-left: 0;
  border-radius: inherit;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
`]))), Jx = A(Ts || (Ts = be([`
  border-left: 0;
  border-radius: inherit;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
`]))), ev = A(As || (As = be([`
  display: flex;
  align-items: center;
  padding-top: `, `px;
  padding-bottom: `, `px;
`])), 6, 6), nv = A(Ms || (Ms = be([`
  &:hover,
  &[data-hover='true'] {
    // On hover of the pre tag, the sibling copy button should be visible
    & + .`, ` {
      opacity: 1;
    }
  }
`])), Pd), tv = A(Ds || (Ds = be([`
  align-items: center;
  border: none;
  /**
    Code wrapper's border radius is 12px. Matching that creates a very 
    slight gap between the button and the code wrapper. Decreasing by
    1px removes gap.
  */
  border-radius: 0 0 11px 11px;
  border-width: 1px 0 0 0;
  border-style: solid;
  display: flex;
  font-family: `, `;
  font-size: `, `px;
  gap: `, `px;
  grid-area: expandButton;
  justify-content: center;
  transition: all `, `ms ease-in-out;
  z-index: 2; // Moves button above the shadows
  &:hover {
    cursor: pointer;
  }
`])), _i.default, er.Body1, se[100], Fn.default), rv = A(Ps || (Ps = be([`
  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    z-index: 1; // above the code
    top: 0;
    height: 100%;
    width: 40px;
    border-radius: 40%;
    box-shadow: unset;
    transition: box-shadow `, `ms ease-in-out;
  }
  &:before {
    grid-column: 1;
    left: -40px;
  }
  &:after {
    grid-column: 2; // Placed either under Panel, or on the right edge
  }
`])), Fn.faster), iv = function(e) {
  return he(A($s || ($s = be([`
    grid-area: code;
    padding-block: `, `px 80px;
    padding-inline: `, `px 28px;
    background-color: `, `;
  `])), se[400], se[400], cn[e][0]));
}, Hs, js, av = ["language", "darkMode", "showLineNumbers", "lineNumberStart", "expandable", "isLoading", "highlightLines", "copyButtonAppearance", "children", "className", "onCopy", "panel", "customKeywords", "data-lgid", "baseFontSize"];
function Bd(e) {
  var n = e.language, t = e.darkMode, r = e.showLineNumbers, i = r !== void 0 && r, a = e.lineNumberStart, o = a === void 0 ? 1 : a, l = e.expandable, s = l !== void 0 && l, u = e.isLoading, c = u !== void 0 && u, d = e.highlightLines, f = d === void 0 ? [] : d, h = e.copyButtonAppearance, v = h === void 0 ? yi.Hover : h, x = e.children, m = x === void 0 ? "" : x, b = e.className, w = e.onCopy, _ = e.panel, C = e.customKeywords, M = e["data-lgid"], S = M === void 0 ? at : M, I = e.baseFontSize, L = Wi(e, av), D = Tn(null), Y = Gn(an(zs), 2), J = Y[0], W = Y[1], B = Gn(an(!s), 2), q = B[0], G = B[1], T = Gn(an(), 2), P = T[0], $ = T[1], j = Gn(an(0), 2), E = j[0], ue = j[1], Z = Gn(an(0), 2), y = Z[0], z = Z[1], V = tn(function() {
    return m.trim().includes(`
`);
  }, [m]), te = Qe(t), ie = te.theme, de = te.darkMode, pe = xi(I), Oe = wd(S), Be = !!_;
  (L.copyable || L.showCustomActionButtons || L.languageOptions || L.customActionButtons || L.chromeTitle || L.onChange) && console.warn("The following props are deprecated and have been removed: copyable, showCustomActionButtons, languageOptions, customActionButtons, chromeTitle, onChange. Please use the Panel component instead."), da(function() {
    var Ne = D.current;
    Ne != null && Ne.scrollWidth > Ne.clientWidth && W(mi);
  }, []), da(function() {
    if (s && D.current) {
      var Ne, ee = D.current, He = (Ne = ee).offsetHeight - Ne.clientHeight, ye = ee.scrollHeight + He, oe = ee.querySelectorAll("tr"), fe = ye;
      if (oe.length > 5) {
        var ze = ee.getBoundingClientRect().top;
        fe = oe[4].getBoundingClientRect().bottom - ze + He;
      }
      ue(ye), z(fe), $(oe.length);
    }
  }, [s, D, pe]);
  var Re = R.createElement(Dd, { showLineNumbers: i, lineNumberStart: o, language: n, highlightLines: f, customKeywords: C }, m), ln = Gr(function(Ne) {
    var ee = Ne.target, He = ee.scrollWidth, ye = ee.clientWidth;
    if (He > ye) {
      var oe = Ne.target.scrollLeft, fe = He - ye;
      oe > 0 && oe < fe ? W(bi) : oe > 0 ? W(Ld) : oe < fe && W(mi);
    }
  }, 50, { leading: !0 }), We = !(!(s && P && P > 5) || c), Je = !Be && v !== yi.None && Wu.isSupported() && !c;
  return R.createElement(_x, { darkMode: de, contents: m, language: n, isLoading: c, showPanel: Be, lgids: Oe }, R.createElement("div", { className: Ux({ theme: ie, className: b }), "data-language": n, "data-lgid": S }, R.createElement("div", { className: Hx({ scrollState: J, theme: ie, showPanel: Be, showExpandButton: We, isLoading: c }) }, !c && R.createElement("pre", Tt({ "data-testid": Oe.pre }, L, { className: jx({ theme: ie, showPanel: Be, expanded: q, codeHeight: E, collapsedCodeHeight: y, isMultiline: V, showExpandButton: We }), onScroll: function(Ne) {
    Ne.persist(), ln(Ne);
  }, ref: D, tabIndex: J !== zs ? 0 : -1 }), Re), c && R.createElement(Yu, { "data-testid": Oe.skeleton, "data-lgid": Oe.skeleton, className: iv(ie) }), Je && R.createElement(Sd, { className: Kx({ copyButtonAppearance: v }), onCopy: w, contents: m }), !!_ && _, We && R.createElement("button", { className: qx({ theme: ie }), onClick: function() {
    G(function(Ne) {
      return !Ne;
    });
  }, "data-testid": Oe.expandButton, "data-lgid": Oe.expandButton }, q ? R.createElement(zb, null) : R.createElement(Tp, null), "Click to", " ", q ? "collapse" : "expand (".concat(P, " lines)")))));
}
Bd.displayName = "Code";
var qs, Ks, Gs, Ws;
A(Hs || (Hs = be([`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
`])));
A(js || (js = be([`
  min-width: 144px;
  height: 100%;
`])));
Fe(Fe({}, ve.Light, A(qs || (qs = be([`
    background-color: `, `;
    border-color: `, `;
  `])), U.white, U.gray.light2)), ve.Dark, A(Ks || (Ks = be([`
    background-color: `, `;
    border-color: `, `;
  `])), U.gray.dark2, U.gray.dark1));
A(Gs || (Gs = be([`
  display: flex;
  align-items: center;
  gap: `, `px;
`])), se[200]);
A(Ws || (Ws = be([`
  display: flex;
  gap: `, `px;
`])), se[100]);
function Vs(e, n) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(e);
    n && (r = r.filter(function(i) {
      return Object.getOwnPropertyDescriptor(e, i).enumerable;
    })), t.push.apply(t, r);
  }
  return t;
}
function Ys(e) {
  for (var n = 1; n < arguments.length; n++) {
    var t = arguments[n] != null ? arguments[n] : {};
    n % 2 ? Vs(Object(t), !0).forEach(function(r) {
      lv(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : Vs(Object(t)).forEach(function(r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function ov(e) {
  var n = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(t, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function lv(e, n, t) {
  return (n = ov(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function Ei() {
  return Ei = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
    }
    return e;
  }, Ei.apply(this, arguments);
}
function Fd(e, n) {
  if (e == null)
    return {};
  var t, r, i = function(o, l) {
    if (o == null)
      return {};
    var s, u, c = {}, d = Object.keys(o);
    for (u = 0; u < d.length; u++)
      s = d[u], l.indexOf(s) >= 0 || (c[s] = o[s]);
    return c;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      t = a[r], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
var Zs, jr, qr, sv = ["children"], cv = { a: function(e) {
  var n = e.children, t = e.href;
  return R.createElement(vi, { href: t }, n);
}, code: function(e) {
  var n, t, r = e.inline, i = e.children, a = e.className, o = i.join(`
`);
  if (r)
    return R.createElement(tp, null, o);
  var l = (n = a == null || (t = a.match(/language-(.+)/)) === null || t === void 0 ? void 0 : t[1]) !== null && n !== void 0 ? n : "none";
  return Object.values(Id).includes(l) || (console.warn("Unknown code language: ".concat(l, '. Using the default language of "none" instead.')), l = "none"), R.createElement(Bd, { language: l }, o);
}, h1: function(e) {
  var n = e.children;
  return R.createElement(rp, null, n);
}, h2: function(e) {
  var n = e.children;
  return R.createElement(ip, null, n);
}, h3: function(e) {
  var n = e.children;
  return R.createElement(ap, null, n);
}, p: function(e) {
  var n = e.children, t = Fd(e, sv);
  return R.createElement(ht, t, n);
} }, uv = A(Zs || (jr = [`
  h1 + *,
  h2 + *,
  h3 + * {
    margin-top: `, `px;
  }

  p + p {
    margin-top: `, `px;
  }
`], qr || (qr = jr.slice(0)), Zs = Object.freeze(Object.defineProperties(jr, { raw: { value: Object.freeze(qr) } }))), se[3], se[2]), dv = ["children", "className", "components", "darkMode", "baseFontSize"], $d = function(e) {
  var n = e.children, t = e.className, r = e.components, i = e.darkMode, a = e.baseFontSize, o = Fd(e, dv), l = Qe(i).darkMode, s = xi(a) === 13 ? 14 : 16;
  return R.createElement(Xn, { darkMode: l, baseFontSize: s }, R.createElement(Au, Ei({ components: Ys(Ys({}, cv), r), className: he(uv, t) }, o), n));
};
$d.displayName = "LGMarkdown";
function pv(e) {
  var n = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var i = t[Symbol.toPrimitive];
    if (i !== void 0) {
      var a = i.call(t, r);
      if (typeof a != "object")
        return a;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(e, "string");
  return typeof n == "symbol" ? n : n + "";
}
function Ke(e, n, t) {
  return (n = pv(n)) in e ? Object.defineProperty(e, n, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[n] = t, e;
}
function zn() {
  return zn = Object.assign ? Object.assign.bind() : function(e) {
    for (var n = 1; n < arguments.length; n++) {
      var t = arguments[n];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
    }
    return e;
  }, zn.apply(this, arguments);
}
function Lt(e, n) {
  if (e == null)
    return {};
  var t, r, i = function(o, l) {
    if (o == null)
      return {};
    var s, u, c = {}, d = Object.keys(o);
    for (u = 0; u < d.length; u++)
      s = d[u], l.indexOf(s) >= 0 || (c[s] = o[s]);
    return c;
  }(e, n);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    for (r = 0; r < a.length; r++)
      t = a[r], n.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(e, t) && (i[t] = e[t]);
  }
  return i;
}
function $e(e, n) {
  return n || (n = e.slice(0)), Object.freeze(Object.defineProperties(e, { raw: { value: Object.freeze(n) } }));
}
function zd(e, n) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, r) {
    var i = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (i != null) {
      var a, o, l, s, u = [], c = !0, d = !1;
      try {
        if (l = (i = i.call(t)).next, r !== 0)
          for (; !(c = (a = l.call(i)).done) && (u.push(a.value), u.length !== r); c = !0)
            ;
      } catch (f) {
        d = !0, o = f;
      } finally {
        try {
          if (!c && i.return != null && (s = i.return(), Object(s) !== s))
            return;
        } finally {
          if (d)
            throw o;
        }
      }
      return u;
    }
  }(e, n) || function(t, r) {
    if (t) {
      if (typeof t == "string")
        return Xs(t, r);
      var i = Object.prototype.toString.call(t).slice(8, -1);
      if (i === "Object" && t.constructor && (i = t.constructor.name), i === "Map" || i === "Set")
        return Array.from(t);
      if (i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))
        return Xs(t, r);
    }
  }(e, n) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function Xs(e, n) {
  n > e.length && (n = e.length);
  for (var t = 0, r = new Array(n); t < n; t++)
    r[t] = e[t];
  return r;
}
var Qs, Js, ec, fv = A(Qs || (Qs = $e([`
  // Remove the Banner's left border wedge
  &:before {
    content: '';
    background: transparent;
  }
  // Customize the border
  border-width: `, `px;
  border-radius: `, `px;

  max-width: fit-content;
  padding: `, "px ", `px;
`])), se[25], se[600], se[200], se[300]), gv = A(Js || (Js = $e([`
  border-radius: `, `px;
`])), se[300]), hv = ["className", "darkMode", "children", "variant"];
function Ud(e) {
  var n = e.className;
  e.darkMode;
  var t = e.children, r = e.variant, i = r === void 0 ? "info" : r, a = Lt(e, hv), o = Tn(null), l = zd(an(!1), 2), s = l[0], u = l[1], c = Lc();
  return wn(function() {
    if (o.current) {
      var d = c === 14 ? 38 : 46;
      u(o.current.clientHeight > d);
    }
  }, [t, c]), R.createElement(Cp, zn({ ref: o, className: he(fv, Ke({}, gv, s), n), variant: i }, a), t);
}
Ud.displayName = "MessageBanner";
var mv = A(ec || (ec = $e([`
  margin-bottom: `, `px;
`])), se[400]);
function bv(e) {
  var n = e.verifier, t = e.verifiedAt, r = e.learnMoreUrl, i = tn(function() {
    var a = ["Verified"];
    if (n && a.push("by ".concat(n)), t) {
      var o = t.toLocaleDateString(void 0, { year: "numeric", month: "long", day: "numeric" });
      a.push("on ".concat(o));
    }
    return a.join(" ");
  }, [n, t]);
  return R.createElement(Ud, { className: mv, variant: "success" }, i, r ? R.createElement(R.Fragment, null, " | ", R.createElement(vi, { href: r }, "Learn More")) : null);
}
var nc, tc, rc, ic, ac, Vi = "primary", Hd = "secondary", yv = A(nc || (nc = $e([`
  border-radius: 12px;
  padding: `, `px;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  /* Card Shadow */
  box-shadow: 0px 4px 10px -4px `, `4D; // 4D is 30% opacity

  position: relative;

  display: flex;
  flex-direction: column;
  gap: `, `px;
`])), se[4], U.black, se[200]), Ev = Ke(Ke({}, Vi, Ke(Ke({}, ve.Dark, A(tc || (tc = $e([`
      background-color: `, `;
    `])), U.green.dark3)), ve.Light, A(rc || (rc = $e([`
      background-color: `, `;
    `])), U.green.light3))), Hd, Ke(Ke({}, ve.Dark, A(ic || (ic = $e([`
      background-color: `, `;
    `])), U.gray.dark3)), ve.Light, A(ac || (ac = $e([`
      background-color: `, `;
    `])), U.white))), xv = ["children", "className", "variant", "darkMode"];
function jd(e) {
  var n = e.children, t = e.className, r = e.variant, i = r === void 0 ? Vi : r, a = e.darkMode, o = Lt(e, xv), l = Qe(a).theme;
  return R.createElement("div", zn({ className: he(yv, Ev[i][l], t) }, o), n);
}
jd.displayName = "MessageContainer";
var oc, lc, sc, cc, vv = { Markdown: "markdown", Text: "text" }, _v = ["children", "sourceType", "baseFontSize", "markdownProps"];
function Yi(e) {
  var n = e.children, t = e.sourceType, r = e.baseFontSize, i = e.markdownProps, a = Lt(e, _v), o = null;
  return t === vv.Markdown ? o = R.createElement($d, zn({ baseFontSize: r }, a, i), n) : o = n, R.createElement("div", a, o);
}
Yi.displayName = "MessageContent";
var uc, dc, pc, fc, gc, hc, mc, bc, yc, Ec, wv = A(oc || (oc = $e([`
  container-type: inline-size;
  margin-bottom: `, `px;
`])), se[200]), Sv = Ke(Ke({}, ve.Dark, A(lc || (lc = $e([`
    border: 1px solid `, `;
  `])), U.gray.dark2)), ve.Light, A(sc || (sc = $e([`
    border: 1px solid `, `;
  `])), U.gray.light2)), kv = A(cc || (cc = $e([`
  margin-bottom: `, `px;
`])), se[200]), Nv = ["darkMode", "headingText", "links"];
function qd(e) {
  var n = e.darkMode, t = e.headingText, r = t === void 0 ? "Related Resources" : t, i = e.links, a = Lt(e, Nv), o = Qe(n).theme;
  return R.createElement("div", zn({ className: he(wv) }, a), R.createElement("hr", { className: he(Sv[o]) }), R.createElement(op, { className: he(kv) }, r), R.createElement(Ap, { links: i }));
}
qd.displayName = "MessageLinks";
var xc = Qn("lg-message"), Kr = Qn("lg-message"), vc = Qn("lg-message-avatar"), Ov = function(e) {
  return A(uc || (uc = $e([`
  display: flex;
  gap: `, `px;
  align-items: flex-end;
  width: 100%;
  color: `, `;

  &:not(:last-child) {
    margin-bottom: `, `px;
  }
`])), se[200], Ge[e].text[Sp.Primary][kp.Default], se[3]);
}, Cv = A(dc || (dc = $e([`
  justify-content: flex-end;
`]))), Tv = A(pc || (pc = $e([`
  gap: `, `px;
`])), se[3]), Av = A(fc || (fc = $e([`
  &:not(:last-child) {
    margin-bottom: `, `px;
  }
`])), se[4]), _c = A(gc || (gc = $e([`
  display: none;
`]))), wc = A(hc || (hc = $e([`
  display: block;
  visibility: hidden;
`]))), Mv = A(mc || (mc = $e([`
  max-width: `, `px;
`])), _t.Tablet), Sc = A(bc || (bc = $e([`
  // Left wedge
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: `, `px;
    height: 100%;
    border-radius: 24px 0px 0px 24px;
  }
`])), se[200]), Iv = Ke(Ke({}, ve.Dark, A(yc || (yc = $e([`
    `, `
    &:before {
      background-color: `, `;
    }
  `])), Sc, U.green.base)), ve.Light, A(Ec || (Ec = $e([`
    `, `
    &:before {
      background-color: `, `;
    }
  `])), Sc, U.green.dark2)), Rv = "right", Dv = "left", Lv = ["isSender", "sourceType", "avatar", "align", "messageBody", "className", "children", "componentOverrides", "links", "linksHeading", "markdownProps", "verified", "darkMode", "baseFontSize"], Pv = Pc(function(e, n) {
  var t, r, i, a = e.isSender, o = a === void 0 || a, l = e.sourceType, s = e.avatar, u = e.align, c = e.messageBody, d = e.className, f = e.children, h = e.componentOverrides, v = e.links, x = e.linksHeading, m = e.markdownProps, b = e.verified, w = e.darkMode, _ = e.baseFontSize, C = Lt(e, Lv), M = Op().containerWidth, S = Tn(null), I = n || S, L = Qe(w), D = L.darkMode, Y = L.theme, J = u === Rv || !u && o, W = u === Dv || !u && !o, B = zd(an(!0), 2), q = B[0], G = B[1], T = function() {
    return !!M && M < _t.Tablet;
  }, P = _ ?? (T() ? er.Body1 : er.Body2);
  wn(function() {
    if (I.current)
      if (I.current.nextElementSibling && I.current.nextElementSibling.classList.contains(xc)) {
        var j = o && !I.current.nextElementSibling.classList.contains(Kr), E = !o && I.current.nextElementSibling.classList.contains(Kr);
        G(j || E);
      } else
        G(!0);
  }, [I.current]);
  var $ = b !== void 0;
  return R.createElement(Xn, { darkMode: D }, R.createElement("div", zn({ className: he(Ov(Y), xc, Ke(Ke(Ke(Ke({}, Kr, o), Cv, J), Tv, !T()), Av, !!M && M >= _t.Desktop), d), ref: I }, C), R.createElement("div", { className: he(vc, Ke(Ke({}, _c, J && T()), wc, J && !T() || !q)) }, s), R.createElement("div", { className: Mv }, R.createElement(_r, { as: (t = h == null ? void 0 : h.MessageContainer) !== null && t !== void 0 ? t : jd, variant: o ? Vi : Hd, className: he(Ke({}, Iv[Y], $)) }, $ ? R.createElement(bv, b) : null, R.createElement(_r, zn({ as: (r = h == null ? void 0 : h.MessageContent) !== null && r !== void 0 ? r : Yi, sourceType: l, baseFontSize: P }, m), c ?? ""), v ? R.createElement(_r, { as: (i = h == null ? void 0 : h.MessageLinks) !== null && i !== void 0 ? i : qd, headingText: x, links: v }) : null, f)), R.createElement("div", { className: he(vc, Ke(Ke({}, _c, W && T()), wc, W && !T() || !q)) }, s)));
});
Pv.displayName = "Message";
const Kd = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  function(e) {
    if (e == null)
      return zv;
    if (typeof e == "function")
      return mr(e);
    if (typeof e == "object")
      return Array.isArray(e) ? Bv(e) : Fv(e);
    if (typeof e == "string")
      return $v(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function Bv(e) {
  const n = [];
  let t = -1;
  for (; ++t < e.length; )
    n[t] = Kd(e[t]);
  return mr(r);
  function r(...i) {
    let a = -1;
    for (; ++a < n.length; )
      if (n[a].apply(this, i))
        return !0;
    return !1;
  }
}
function Fv(e) {
  const n = (
    /** @type {Record<string, unknown>} */
    e
  );
  return mr(t);
  function t(r) {
    const i = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      r
    );
    let a;
    for (a in e)
      if (i[a] !== n[a])
        return !1;
    return !0;
  }
}
function $v(e) {
  return mr(n);
  function n(t) {
    return t && t.type === e;
  }
}
function mr(e) {
  return n;
  function n(t, r, i) {
    return !!(Uv(t) && e.call(
      this,
      t,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function zv() {
  return !0;
}
function Uv(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Gd = [], Hv = !0, kc = !1, jv = "skip";
function qv(e, n, t, r) {
  let i;
  typeof n == "function" && typeof t != "function" ? (r = t, t = n) : i = n;
  const a = Kd(i), o = r ? -1 : 1;
  l(e, void 0, [])();
  function l(s, u, c) {
    const d = (
      /** @type {Record<string, unknown>} */
      s && typeof s == "object" ? s : {}
    );
    if (typeof d.type == "string") {
      const h = (
        // `hast`
        typeof d.tagName == "string" ? d.tagName : (
          // `xast`
          typeof d.name == "string" ? d.name : void 0
        )
      );
      Object.defineProperty(f, "name", {
        value: "node (" + (s.type + (h ? "<" + h + ">" : "")) + ")"
      });
    }
    return f;
    function f() {
      let h = Gd, v, x, m;
      if ((!n || a(s, u, c[c.length - 1] || void 0)) && (h = Kv(t(s, c)), h[0] === kc))
        return h;
      if ("children" in s && s.children) {
        const b = (
          /** @type {UnistParent} */
          s
        );
        if (b.children && h[0] !== jv)
          for (x = (r ? b.children.length : -1) + o, m = c.concat(b); x > -1 && x < b.children.length; ) {
            const w = b.children[x];
            if (v = l(w, x, m)(), v[0] === kc)
              return v;
            x = typeof v[1] == "number" ? v[1] : x + o;
          }
      }
      return h;
    }
  }
}
function Kv(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [Hv, e] : e == null ? Gd : [e];
}
function Wd(e, n, t, r) {
  let i, a, o;
  typeof n == "function" && typeof t != "function" ? (a = void 0, o = n, i = t) : (a = n, o = t, i = r), qv(e, a, l, i);
  function l(s, u) {
    const c = u[u.length - 1], d = c ? c.children.indexOf(s) : void 0;
    return o(s, d, c);
  }
}
function Vd(e) {
  e.data || (e.data = {}), e.data.headingStyle = "atx", e.depth < 3 && e.position !== void 0 && e.position.start.line !== e.position.end.line && (e.data.headingStyle = "setext");
}
const Gv = () => (e) => {
  Wd(e, "heading", Vd);
}, Wv = () => (e) => {
  Wd(e, "heading", (n) => {
    var t, r, i;
    (t = n.data) != null && t.headingStyle || Vd(n), ((r = n.data) == null ? void 0 : r.headingStyle) === "setext" && (n.type = "paragraph", delete n.depth, (i = n.data) == null || delete i.setext);
  });
}, Vv = {
  // @ts-expect-error @lg-chat/lg-markdown is using an older version of unified. The types are not compatible but the plugins work. https://jira.mongodb.org/browse/LG-4310
  remarkPlugins: [Gv, Wv],
  className: Qd`
    // This includes a hacky fix for weird white-space issues in LG Chat.
    display: flex;
    flex-direction: column;

    & li {
      white-space: normal;
      margin-top: -1rem;
      & ol li, & ul li {
        margin-top: 0.5rem;
      }
    }

    & ol, & ul {
      overflow-wrap: anywhere;
    }

    & h1, & h2, & h3 {
      & +ol, & +ul {
        margin-top: 0;
      }
    }

    & p+h1, & p+h2, & p+h3 {
      margin-top: 1rem;
    }
  `,
  components: {
    a: ({ children: e, href: n }) => /* @__PURE__ */ tt.jsxDEV(vi, { hideExternalIcon: !0, href: n, children: e }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageContent.tsx",
      lineNumber: 43,
      columnNumber: 9
    }, globalThis),
    p: ({ children: e, ...n }) => /* @__PURE__ */ tt.jsxDEV(ht, { ...n, children: e }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageContent.tsx",
      lineNumber: 49,
      columnNumber: 14
    }, globalThis),
    ol: ({ children: e, ordered: n, ...t }) => /* @__PURE__ */ tt.jsxDEV(ht, { as: "ol", ...t, children: e }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageContent.tsx",
      lineNumber: 53,
      columnNumber: 9
    }, globalThis),
    ul: ({ children: e, ordered: n, ...t }) => /* @__PURE__ */ tt.jsxDEV(ht, { as: "ul", ...t, children: e }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageContent.tsx",
      lineNumber: 60,
      columnNumber: 9
    }, globalThis),
    li: ({ children: e, ordered: n, node: t, ...r }) => /* @__PURE__ */ tt.jsxDEV(ht, { as: "li", ...r, children: e }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageContent.tsx",
      lineNumber: 67,
      columnNumber: 9
    }, globalThis)
  }
};
function f_({
  markdownProps: e,
  ...n
}) {
  return /* @__PURE__ */ tt.jsxDEV(
    Yi,
    {
      ...n,
      markdownProps: {
        ...Vv,
        ...e
      }
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessageContent.tsx",
      lineNumber: 80,
      columnNumber: 5
    },
    this
  );
}
export {
  Pv as I,
  f_ as M,
  Qb as S,
  vv as i
};
