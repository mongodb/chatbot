import "react";
import { a as J } from "./jsx-dev-runtime.js";
import { r as or, p as Fi, i as rc, c as Di, a as tc, o as ac } from "./index3.js";
import { c as Lo, a1 as nc, a2 as oc, a3 as Te, a4 as lc, a5 as ic, a6 as uc, h as sc, a as ol, a7 as je, a8 as Z, a9 as cc, aa as dc, ab as jr, ac as ji, ad as fc, ae as Hi, af as pc, ag as mc, ah as vc, g as bc } from "./index2.js";
var Ce = {}, ko = { exports: {} };
ko.exports;
(function(e) {
  const t = (o = 0) => (l) => `\x1B[${38 + o};5;${l}m`, a = (o = 0) => (l, u, i) => `\x1B[${38 + o};2;${l};${u};${i}m`;
  function n() {
    const o = /* @__PURE__ */ new Map(), l = {
      modifier: {
        reset: [0, 0],
        // 21 isn't widely supported and 22 does the same thing
        bold: [1, 22],
        dim: [2, 22],
        italic: [3, 23],
        underline: [4, 24],
        overline: [53, 55],
        inverse: [7, 27],
        hidden: [8, 28],
        strikethrough: [9, 29]
      },
      color: {
        black: [30, 39],
        red: [31, 39],
        green: [32, 39],
        yellow: [33, 39],
        blue: [34, 39],
        magenta: [35, 39],
        cyan: [36, 39],
        white: [37, 39],
        // Bright color
        blackBright: [90, 39],
        redBright: [91, 39],
        greenBright: [92, 39],
        yellowBright: [93, 39],
        blueBright: [94, 39],
        magentaBright: [95, 39],
        cyanBright: [96, 39],
        whiteBright: [97, 39]
      },
      bgColor: {
        bgBlack: [40, 49],
        bgRed: [41, 49],
        bgGreen: [42, 49],
        bgYellow: [43, 49],
        bgBlue: [44, 49],
        bgMagenta: [45, 49],
        bgCyan: [46, 49],
        bgWhite: [47, 49],
        // Bright color
        bgBlackBright: [100, 49],
        bgRedBright: [101, 49],
        bgGreenBright: [102, 49],
        bgYellowBright: [103, 49],
        bgBlueBright: [104, 49],
        bgMagentaBright: [105, 49],
        bgCyanBright: [106, 49],
        bgWhiteBright: [107, 49]
      }
    };
    l.color.gray = l.color.blackBright, l.bgColor.bgGray = l.bgColor.bgBlackBright, l.color.grey = l.color.blackBright, l.bgColor.bgGrey = l.bgColor.bgBlackBright;
    for (const [u, i] of Object.entries(l)) {
      for (const [s, f] of Object.entries(i))
        l[s] = {
          open: `\x1B[${f[0]}m`,
          close: `\x1B[${f[1]}m`
        }, i[s] = l[s], o.set(f[0], f[1]);
      Object.defineProperty(l, u, {
        value: i,
        enumerable: !1
      });
    }
    return Object.defineProperty(l, "codes", {
      value: o,
      enumerable: !1
    }), l.color.close = "\x1B[39m", l.bgColor.close = "\x1B[49m", l.color.ansi256 = t(), l.color.ansi16m = a(), l.bgColor.ansi256 = t(10), l.bgColor.ansi16m = a(10), Object.defineProperties(l, {
      rgbToAnsi256: {
        value: (u, i, s) => u === i && i === s ? u < 8 ? 16 : u > 248 ? 231 : Math.round((u - 8) / 247 * 24) + 232 : 16 + 36 * Math.round(u / 255 * 5) + 6 * Math.round(i / 255 * 5) + Math.round(s / 255 * 5),
        enumerable: !1
      },
      hexToRgb: {
        value: (u) => {
          const i = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(u.toString(16));
          if (!i)
            return [0, 0, 0];
          let { colorString: s } = i.groups;
          s.length === 3 && (s = s.split("").map((d) => d + d).join(""));
          const f = Number.parseInt(s, 16);
          return [
            f >> 16 & 255,
            f >> 8 & 255,
            f & 255
          ];
        },
        enumerable: !1
      },
      hexToAnsi256: {
        value: (u) => l.rgbToAnsi256(...l.hexToRgb(u)),
        enumerable: !1
      }
    }), l;
  }
  Object.defineProperty(e, "exports", {
    enumerable: !0,
    get: n
  });
})(ko);
var Ui = ko.exports, le = {};
Object.defineProperty(le, "__esModule", {
  value: !0
});
le.printIteratorEntries = hc;
le.printIteratorValues = gc;
le.printListItems = Rc;
le.printObjectProperties = _c;
const yc = (e, r) => {
  const t = Object.keys(e).sort(r);
  return Object.getOwnPropertySymbols && Object.getOwnPropertySymbols(e).forEach((a) => {
    Object.getOwnPropertyDescriptor(e, a).enumerable && t.push(a);
  }), t;
};
function hc(e, r, t, a, n, o, l = ": ") {
  let u = "", i = e.next();
  if (!i.done) {
    u += r.spacingOuter;
    const s = t + r.indent;
    for (; !i.done; ) {
      const f = o(
        i.value[0],
        r,
        s,
        a,
        n
      ), d = o(
        i.value[1],
        r,
        s,
        a,
        n
      );
      u += s + f + l + d, i = e.next(), i.done ? r.min || (u += ",") : u += "," + r.spacingInner;
    }
    u += r.spacingOuter + t;
  }
  return u;
}
function gc(e, r, t, a, n, o) {
  let l = "", u = e.next();
  if (!u.done) {
    l += r.spacingOuter;
    const i = t + r.indent;
    for (; !u.done; )
      l += i + o(u.value, r, i, a, n), u = e.next(), u.done ? r.min || (l += ",") : l += "," + r.spacingInner;
    l += r.spacingOuter + t;
  }
  return l;
}
function Rc(e, r, t, a, n, o) {
  let l = "";
  if (e.length) {
    l += r.spacingOuter;
    const u = t + r.indent;
    for (let i = 0; i < e.length; i++)
      l += u, i in e && (l += o(e[i], r, u, a, n)), i < e.length - 1 ? l += "," + r.spacingInner : r.min || (l += ",");
    l += r.spacingOuter + t;
  }
  return l;
}
function _c(e, r, t, a, n, o) {
  let l = "";
  const u = yc(e, r.compareKeys);
  if (u.length) {
    l += r.spacingOuter;
    const i = t + r.indent;
    for (let s = 0; s < u.length; s++) {
      const f = u[s], d = o(f, r, i, a, n), m = o(e[f], r, i, a, n);
      l += i + d + ": " + m, s < u.length - 1 ? l += "," + r.spacingInner : r.min || (l += ",");
    }
    l += r.spacingOuter + t;
  }
  return l;
}
var ve = {};
Object.defineProperty(ve, "__esModule", {
  value: !0
});
ve.test = ve.serialize = ve.default = void 0;
var ll = le, Er = function() {
  return typeof globalThis < "u" ? globalThis : typeof Er < "u" ? Er : typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")();
}(), An = Er["jest-symbol-do-not-touch"] || Er.Symbol;
const Cc = typeof An == "function" && An.for ? An.for("jest.asymmetricMatcher") : 1267621, pr = " ", zi = (e, r, t, a, n, o) => {
  const l = e.toString();
  return l === "ArrayContaining" || l === "ArrayNotContaining" ? ++a > r.maxDepth ? "[" + l + "]" : l + pr + "[" + (0, ll.printListItems)(
    e.sample,
    r,
    t,
    a,
    n,
    o
  ) + "]" : l === "ObjectContaining" || l === "ObjectNotContaining" ? ++a > r.maxDepth ? "[" + l + "]" : l + pr + "{" + (0, ll.printObjectProperties)(
    e.sample,
    r,
    t,
    a,
    n,
    o
  ) + "}" : l === "StringMatching" || l === "StringNotMatching" || l === "StringContaining" || l === "StringNotContaining" ? l + pr + o(e.sample, r, t, a, n) : e.toAsymmetricMatcher();
};
ve.serialize = zi;
const Wi = (e) => e && e.$$typeof === Cc;
ve.test = Wi;
const Ec = {
  serialize: zi,
  test: Wi
};
var Pc = Ec;
ve.default = Pc;
var be = {}, qc = ({ onlyFirst: e = !1 } = {}) => {
  const r = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
  ].join("|");
  return new RegExp(r, e ? void 0 : "g");
};
Object.defineProperty(be, "__esModule", {
  value: !0
});
be.test = be.serialize = be.default = void 0;
var Vi = Gi(qc), M = Gi(Ui);
function Gi(e) {
  return e && e.__esModule ? e : { default: e };
}
const wc = (e) => e.replace((0, Vi.default)(), (r) => {
  switch (r) {
    case M.default.red.close:
    case M.default.green.close:
    case M.default.cyan.close:
    case M.default.gray.close:
    case M.default.white.close:
    case M.default.yellow.close:
    case M.default.bgRed.close:
    case M.default.bgGreen.close:
    case M.default.bgYellow.close:
    case M.default.inverse.close:
    case M.default.dim.close:
    case M.default.bold.close:
    case M.default.reset.open:
    case M.default.reset.close:
      return "</>";
    case M.default.red.open:
      return "<red>";
    case M.default.green.open:
      return "<green>";
    case M.default.cyan.open:
      return "<cyan>";
    case M.default.gray.open:
      return "<gray>";
    case M.default.white.open:
      return "<white>";
    case M.default.yellow.open:
      return "<yellow>";
    case M.default.bgRed.open:
      return "<bgRed>";
    case M.default.bgGreen.open:
      return "<bgGreen>";
    case M.default.bgYellow.open:
      return "<bgYellow>";
    case M.default.inverse.open:
      return "<inverse>";
    case M.default.dim.open:
      return "<dim>";
    case M.default.bold.open:
      return "<bold>";
    default:
      return "";
  }
}), Yi = (e) => typeof e == "string" && !!e.match((0, Vi.default)());
be.test = Yi;
const Ki = (e, r, t, a, n, o) => o(wc(e), r, t, a, n);
be.serialize = Ki;
const xc = {
  serialize: Ki,
  test: Yi
};
var Sc = xc;
be.default = Sc;
var ye = {};
Object.defineProperty(ye, "__esModule", {
  value: !0
});
ye.test = ye.serialize = ye.default = void 0;
var il = le;
const Tc = " ", Xi = ["DOMStringMap", "NamedNodeMap"], $c = /^(HTML\w*Collection|NodeList)$/, Oc = (e) => Xi.indexOf(e) !== -1 || $c.test(e), Ji = (e) => e && e.constructor && !!e.constructor.name && Oc(e.constructor.name);
ye.test = Ji;
const Mc = (e) => e.constructor.name === "NamedNodeMap", Qi = (e, r, t, a, n, o) => {
  const l = e.constructor.name;
  return ++a > r.maxDepth ? "[" + l + "]" : (r.min ? "" : l + Tc) + (Xi.indexOf(l) !== -1 ? "{" + (0, il.printObjectProperties)(
    Mc(e) ? Array.from(e).reduce((u, i) => (u[i.name] = i.value, u), {}) : { ...e },
    r,
    t,
    a,
    n,
    o
  ) + "}" : "[" + (0, il.printListItems)(
    Array.from(e),
    r,
    t,
    a,
    n,
    o
  ) + "]");
};
ye.serialize = Qi;
const Ac = {
  serialize: Qi,
  test: Ji
};
var Ic = Ac;
ye.default = Ic;
var he = {}, D = {}, Fo = {};
Object.defineProperty(Fo, "__esModule", {
  value: !0
});
Fo.default = Bc;
function Bc(e) {
  return e.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
Object.defineProperty(D, "__esModule", {
  value: !0
});
D.printText = D.printProps = D.printElementAsLeaf = D.printElement = D.printComment = D.printChildren = void 0;
var Zi = Nc(Fo);
function Nc(e) {
  return e && e.__esModule ? e : { default: e };
}
const Lc = (e, r, t, a, n, o, l) => {
  const u = a + t.indent, i = t.colors;
  return e.map((s) => {
    const f = r[s];
    let d = l(f, t, u, n, o);
    return typeof f != "string" && (d.indexOf(`
`) !== -1 && (d = t.spacingOuter + u + d + t.spacingOuter + a), d = "{" + d + "}"), t.spacingInner + a + i.prop.open + s + i.prop.close + "=" + i.value.open + d + i.value.close;
  }).join("");
};
D.printProps = Lc;
const kc = (e, r, t, a, n, o) => e.map(
  (l) => r.spacingOuter + t + (typeof l == "string" ? eu(l, r) : o(l, r, t, a, n))
).join("");
D.printChildren = kc;
const eu = (e, r) => {
  const t = r.colors.content;
  return t.open + (0, Zi.default)(e) + t.close;
};
D.printText = eu;
const Fc = (e, r) => {
  const t = r.colors.comment;
  return t.open + "<!--" + (0, Zi.default)(e) + "-->" + t.close;
};
D.printComment = Fc;
const Dc = (e, r, t, a, n) => {
  const o = a.colors.tag;
  return o.open + "<" + e + (r && o.close + r + a.spacingOuter + n + o.open) + (t ? ">" + o.close + t + a.spacingOuter + n + o.open + "</" + e : (r && !a.min ? "" : " ") + "/") + ">" + o.close;
};
D.printElement = Dc;
const jc = (e, r) => {
  const t = r.colors.tag;
  return t.open + "<" + e + t.close + " …" + t.open + " />" + t.close;
};
D.printElementAsLeaf = jc;
Object.defineProperty(he, "__esModule", {
  value: !0
});
he.test = he.serialize = he.default = void 0;
var Ae = D;
const Hc = 1, ru = 3, tu = 8, au = 11, Uc = /^((HTML|SVG)\w*)?Element$/, zc = (e) => {
  try {
    return typeof e.hasAttribute == "function" && e.hasAttribute("is");
  } catch {
    return !1;
  }
}, Wc = (e) => {
  const r = e.constructor.name, { nodeType: t, tagName: a } = e, n = typeof a == "string" && a.includes("-") || zc(e);
  return t === Hc && (Uc.test(r) || n) || t === ru && r === "Text" || t === tu && r === "Comment" || t === au && r === "DocumentFragment";
}, nu = (e) => {
  var r;
  return (e == null || (r = e.constructor) === null || r === void 0 ? void 0 : r.name) && Wc(e);
};
he.test = nu;
function Vc(e) {
  return e.nodeType === ru;
}
function Gc(e) {
  return e.nodeType === tu;
}
function In(e) {
  return e.nodeType === au;
}
const ou = (e, r, t, a, n, o) => {
  if (Vc(e))
    return (0, Ae.printText)(e.data, r);
  if (Gc(e))
    return (0, Ae.printComment)(e.data, r);
  const l = In(e) ? "DocumentFragment" : e.tagName.toLowerCase();
  return ++a > r.maxDepth ? (0, Ae.printElementAsLeaf)(l, r) : (0, Ae.printElement)(
    l,
    (0, Ae.printProps)(
      In(e) ? [] : Array.from(e.attributes).map((u) => u.name).sort(),
      In(e) ? {} : Array.from(e.attributes).reduce((u, i) => (u[i.name] = i.value, u), {}),
      r,
      t + r.indent,
      a,
      n,
      o
    ),
    (0, Ae.printChildren)(
      Array.prototype.slice.call(e.childNodes || e.children),
      r,
      t + r.indent,
      a,
      n,
      o
    ),
    r,
    t
  );
};
he.serialize = ou;
const Yc = {
  serialize: ou,
  test: nu
};
var Kc = Yc;
he.default = Kc;
var ge = {};
Object.defineProperty(ge, "__esModule", {
  value: !0
});
ge.test = ge.serialize = ge.default = void 0;
var Ze = le;
const Xc = "@@__IMMUTABLE_ITERABLE__@@", Jc = "@@__IMMUTABLE_LIST__@@", Qc = "@@__IMMUTABLE_KEYED__@@", Zc = "@@__IMMUTABLE_MAP__@@", ul = "@@__IMMUTABLE_ORDERED__@@", ed = "@@__IMMUTABLE_RECORD__@@", rd = "@@__IMMUTABLE_SEQ__@@", td = "@@__IMMUTABLE_SET__@@", ad = "@@__IMMUTABLE_STACK__@@", ke = (e) => "Immutable." + e, Hr = (e) => "[" + e + "]", er = " ", sl = "…", nd = (e, r, t, a, n, o, l) => ++a > r.maxDepth ? Hr(ke(l)) : ke(l) + er + "{" + (0, Ze.printIteratorEntries)(
  e.entries(),
  r,
  t,
  a,
  n,
  o
) + "}";
function od(e) {
  let r = 0;
  return {
    next() {
      if (r < e._keys.length) {
        const t = e._keys[r++];
        return {
          done: !1,
          value: [t, e.get(t)]
        };
      }
      return {
        done: !0,
        value: void 0
      };
    }
  };
}
const ld = (e, r, t, a, n, o) => {
  const l = ke(e._name || "Record");
  return ++a > r.maxDepth ? Hr(l) : l + er + "{" + (0, Ze.printIteratorEntries)(
    od(e),
    r,
    t,
    a,
    n,
    o
  ) + "}";
}, id = (e, r, t, a, n, o) => {
  const l = ke("Seq");
  return ++a > r.maxDepth ? Hr(l) : e[Qc] ? l + er + "{" + // from Immutable collection of entries or from ECMAScript object
  (e._iter || e._object ? (0, Ze.printIteratorEntries)(
    e.entries(),
    r,
    t,
    a,
    n,
    o
  ) : sl) + "}" : l + er + "[" + (e._iter || // from Immutable collection of values
  e._array || // from ECMAScript array
  e._collection || // from ECMAScript collection in immutable v4
  e._iterable ? (0, Ze.printIteratorValues)(
    e.values(),
    r,
    t,
    a,
    n,
    o
  ) : sl) + "]";
}, Bn = (e, r, t, a, n, o, l) => ++a > r.maxDepth ? Hr(ke(l)) : ke(l) + er + "[" + (0, Ze.printIteratorValues)(
  e.values(),
  r,
  t,
  a,
  n,
  o
) + "]", lu = (e, r, t, a, n, o) => e[Zc] ? nd(
  e,
  r,
  t,
  a,
  n,
  o,
  e[ul] ? "OrderedMap" : "Map"
) : e[Jc] ? Bn(
  e,
  r,
  t,
  a,
  n,
  o,
  "List"
) : e[td] ? Bn(
  e,
  r,
  t,
  a,
  n,
  o,
  e[ul] ? "OrderedSet" : "Set"
) : e[ad] ? Bn(
  e,
  r,
  t,
  a,
  n,
  o,
  "Stack"
) : e[rd] ? id(e, r, t, a, n, o) : ld(e, r, t, a, n, o);
ge.serialize = lu;
const iu = (e) => e && (e[Xc] === !0 || e[ed] === !0);
ge.test = iu;
const ud = {
  serialize: lu,
  test: iu
};
var sd = ud;
ge.default = sd;
var Re = {}, lo = { exports: {} }, $ = {};
/** @license React v17.0.2
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var cl;
function cd() {
  if (cl)
    return $;
  cl = 1;
  var e = 60103, r = 60106, t = 60107, a = 60108, n = 60114, o = 60109, l = 60110, u = 60112, i = 60113, s = 60120, f = 60115, d = 60116, m = 60121, C = 60122, w = 60117, E = 60129, S = 60131;
  if (typeof Symbol == "function" && Symbol.for) {
    var c = Symbol.for;
    e = c("react.element"), r = c("react.portal"), t = c("react.fragment"), a = c("react.strict_mode"), n = c("react.profiler"), o = c("react.provider"), l = c("react.context"), u = c("react.forward_ref"), i = c("react.suspense"), s = c("react.suspense_list"), f = c("react.memo"), d = c("react.lazy"), m = c("react.block"), C = c("react.server.block"), w = c("react.fundamental"), E = c("react.debug_trace_mode"), S = c("react.legacy_hidden");
  }
  function g(h) {
    if (typeof h == "object" && h !== null) {
      var x = h.$$typeof;
      switch (x) {
        case e:
          switch (h = h.type, h) {
            case t:
            case n:
            case a:
            case i:
            case s:
              return h;
            default:
              switch (h = h && h.$$typeof, h) {
                case l:
                case u:
                case d:
                case f:
                case o:
                  return h;
                default:
                  return x;
              }
          }
        case r:
          return x;
      }
    }
  }
  var _ = o, R = e, q = u, p = t, b = d, y = f, I = r, L = n, k = a, F = i;
  return $.ContextConsumer = l, $.ContextProvider = _, $.Element = R, $.ForwardRef = q, $.Fragment = p, $.Lazy = b, $.Memo = y, $.Portal = I, $.Profiler = L, $.StrictMode = k, $.Suspense = F, $.isAsyncMode = function() {
    return !1;
  }, $.isConcurrentMode = function() {
    return !1;
  }, $.isContextConsumer = function(h) {
    return g(h) === l;
  }, $.isContextProvider = function(h) {
    return g(h) === o;
  }, $.isElement = function(h) {
    return typeof h == "object" && h !== null && h.$$typeof === e;
  }, $.isForwardRef = function(h) {
    return g(h) === u;
  }, $.isFragment = function(h) {
    return g(h) === t;
  }, $.isLazy = function(h) {
    return g(h) === d;
  }, $.isMemo = function(h) {
    return g(h) === f;
  }, $.isPortal = function(h) {
    return g(h) === r;
  }, $.isProfiler = function(h) {
    return g(h) === n;
  }, $.isStrictMode = function(h) {
    return g(h) === a;
  }, $.isSuspense = function(h) {
    return g(h) === i;
  }, $.isValidElementType = function(h) {
    return typeof h == "string" || typeof h == "function" || h === t || h === n || h === E || h === a || h === i || h === s || h === S || typeof h == "object" && h !== null && (h.$$typeof === d || h.$$typeof === f || h.$$typeof === o || h.$$typeof === l || h.$$typeof === u || h.$$typeof === w || h.$$typeof === m || h[0] === C);
  }, $.typeOf = g, $;
}
var O = {}, dl;
function dd() {
  return dl || (dl = 1, J.env.NODE_ENV !== "production" && function() {
    var e = 60103, r = 60106, t = 60107, a = 60108, n = 60114, o = 60109, l = 60110, u = 60112, i = 60113, s = 60120, f = 60115, d = 60116, m = 60121, C = 60122, w = 60117, E = 60129, S = 60131;
    if (typeof Symbol == "function" && Symbol.for) {
      var c = Symbol.for;
      e = c("react.element"), r = c("react.portal"), t = c("react.fragment"), a = c("react.strict_mode"), n = c("react.profiler"), o = c("react.provider"), l = c("react.context"), u = c("react.forward_ref"), i = c("react.suspense"), s = c("react.suspense_list"), f = c("react.memo"), d = c("react.lazy"), m = c("react.block"), C = c("react.server.block"), w = c("react.fundamental"), c("react.scope"), c("react.opaque.id"), E = c("react.debug_trace_mode"), c("react.offscreen"), S = c("react.legacy_hidden");
    }
    var g = !1;
    function _(P) {
      return !!(typeof P == "string" || typeof P == "function" || P === t || P === n || P === E || P === a || P === i || P === s || P === S || g || typeof P == "object" && P !== null && (P.$$typeof === d || P.$$typeof === f || P.$$typeof === o || P.$$typeof === l || P.$$typeof === u || P.$$typeof === w || P.$$typeof === m || P[0] === C));
    }
    function R(P) {
      if (typeof P == "object" && P !== null) {
        var Mn = P.$$typeof;
        switch (Mn) {
          case e:
            var fr = P.type;
            switch (fr) {
              case t:
              case n:
              case a:
              case i:
              case s:
                return fr;
              default:
                var nl = fr && fr.$$typeof;
                switch (nl) {
                  case l:
                  case u:
                  case d:
                  case f:
                  case o:
                    return nl;
                  default:
                    return Mn;
                }
            }
          case r:
            return Mn;
        }
      }
    }
    var q = l, p = o, b = e, y = u, I = t, L = d, k = f, F = r, h = n, x = a, H = i, N = !1, U = !1;
    function we(P) {
      return N || (N = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function On(P) {
      return U || (U = !0, console.warn("The ReactIs.isConcurrentMode() alias has been deprecated, and will be removed in React 18+.")), !1;
    }
    function zs(P) {
      return R(P) === l;
    }
    function Ws(P) {
      return R(P) === o;
    }
    function Vs(P) {
      return typeof P == "object" && P !== null && P.$$typeof === e;
    }
    function Gs(P) {
      return R(P) === u;
    }
    function Ys(P) {
      return R(P) === t;
    }
    function Ks(P) {
      return R(P) === d;
    }
    function Xs(P) {
      return R(P) === f;
    }
    function Js(P) {
      return R(P) === r;
    }
    function Qs(P) {
      return R(P) === n;
    }
    function Zs(P) {
      return R(P) === a;
    }
    function ec(P) {
      return R(P) === i;
    }
    O.ContextConsumer = q, O.ContextProvider = p, O.Element = b, O.ForwardRef = y, O.Fragment = I, O.Lazy = L, O.Memo = k, O.Portal = F, O.Profiler = h, O.StrictMode = x, O.Suspense = H, O.isAsyncMode = we, O.isConcurrentMode = On, O.isContextConsumer = zs, O.isContextProvider = Ws, O.isElement = Vs, O.isForwardRef = Gs, O.isFragment = Ys, O.isLazy = Ks, O.isMemo = Xs, O.isPortal = Js, O.isProfiler = Qs, O.isStrictMode = Zs, O.isSuspense = ec, O.isValidElementType = _, O.typeOf = R;
  }()), O;
}
J.env.NODE_ENV === "production" ? lo.exports = cd() : lo.exports = dd();
var fd = lo.exports;
Object.defineProperty(Re, "__esModule", {
  value: !0
});
Re.test = Re.serialize = Re.default = void 0;
var xe = pd(fd), mr = D;
function uu(e) {
  if (typeof WeakMap != "function")
    return null;
  var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
  return (uu = function(a) {
    return a ? t : r;
  })(e);
}
function pd(e, r) {
  if (!r && e && e.__esModule)
    return e;
  if (e === null || typeof e != "object" && typeof e != "function")
    return { default: e };
  var t = uu(r);
  if (t && t.has(e))
    return t.get(e);
  var a = {}, n = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var o in e)
    if (o !== "default" && Object.prototype.hasOwnProperty.call(e, o)) {
      var l = n ? Object.getOwnPropertyDescriptor(e, o) : null;
      l && (l.get || l.set) ? Object.defineProperty(a, o, l) : a[o] = e[o];
    }
  return a.default = e, t && t.set(e, a), a;
}
const su = (e, r = []) => (Array.isArray(e) ? e.forEach((t) => {
  su(t, r);
}) : e != null && e !== !1 && r.push(e), r), fl = (e) => {
  const r = e.type;
  if (typeof r == "string")
    return r;
  if (typeof r == "function")
    return r.displayName || r.name || "Unknown";
  if (xe.isFragment(e))
    return "React.Fragment";
  if (xe.isSuspense(e))
    return "React.Suspense";
  if (typeof r == "object" && r !== null) {
    if (xe.isContextProvider(e))
      return "Context.Provider";
    if (xe.isContextConsumer(e))
      return "Context.Consumer";
    if (xe.isForwardRef(e)) {
      if (r.displayName)
        return r.displayName;
      const t = r.render.displayName || r.render.name || "";
      return t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef";
    }
    if (xe.isMemo(e)) {
      const t = r.displayName || r.type.displayName || r.type.name || "";
      return t !== "" ? "Memo(" + t + ")" : "Memo";
    }
  }
  return "UNDEFINED";
}, md = (e) => {
  const { props: r } = e;
  return Object.keys(r).filter((t) => t !== "children" && r[t] !== void 0).sort();
}, cu = (e, r, t, a, n, o) => ++a > r.maxDepth ? (0, mr.printElementAsLeaf)(fl(e), r) : (0, mr.printElement)(
  fl(e),
  (0, mr.printProps)(
    md(e),
    e.props,
    r,
    t + r.indent,
    a,
    n,
    o
  ),
  (0, mr.printChildren)(
    su(e.props.children),
    r,
    t + r.indent,
    a,
    n,
    o
  ),
  r,
  t
);
Re.serialize = cu;
const du = (e) => e != null && xe.isElement(e);
Re.test = du;
const vd = {
  serialize: cu,
  test: du
};
var bd = vd;
Re.default = bd;
var _e = {};
Object.defineProperty(_e, "__esModule", {
  value: !0
});
_e.test = _e.serialize = _e.default = void 0;
var vr = D, Pr = function() {
  return typeof globalThis < "u" ? globalThis : typeof Pr < "u" ? Pr : typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")();
}(), Nn = Pr["jest-symbol-do-not-touch"] || Pr.Symbol;
const yd = typeof Nn == "function" && Nn.for ? Nn.for("react.test.json") : 245830487, hd = (e) => {
  const { props: r } = e;
  return r ? Object.keys(r).filter((t) => r[t] !== void 0).sort() : [];
}, fu = (e, r, t, a, n, o) => ++a > r.maxDepth ? (0, vr.printElementAsLeaf)(e.type, r) : (0, vr.printElement)(
  e.type,
  e.props ? (0, vr.printProps)(
    hd(e),
    e.props,
    r,
    t + r.indent,
    a,
    n,
    o
  ) : "",
  e.children ? (0, vr.printChildren)(
    e.children,
    r,
    t + r.indent,
    a,
    n,
    o
  ) : "",
  r,
  t
);
_e.serialize = fu;
const pu = (e) => e && e.$$typeof === yd;
_e.test = pu;
const gd = {
  serialize: fu,
  test: pu
};
var Rd = gd;
_e.default = Rd;
Object.defineProperty(Ce, "__esModule", {
  value: !0
});
Ce.default = Ce.DEFAULT_OPTIONS = void 0;
var _d = Ce.format = qu, mu = Ce.plugins = void 0, Cd = Ee(Ui), ze = le, Ed = Ee(
  ve
), Pd = Ee(be), qd = Ee(ye), wd = Ee(he), xd = Ee(ge), Sd = Ee(Re), Td = Ee(
  _e
);
function Ee(e) {
  return e && e.__esModule ? e : { default: e };
}
const vu = Object.prototype.toString, $d = Date.prototype.toISOString, Od = Error.prototype.toString, pl = RegExp.prototype.toString, Ln = (e) => typeof e.constructor == "function" && e.constructor.name || "Object", Md = (e) => typeof window < "u" && e === window, Ad = /^Symbol\((.*)\)(.*)$/, Id = /\n/gi;
class bu extends Error {
  constructor(r, t) {
    super(r), this.stack = t, this.name = this.constructor.name;
  }
}
function Bd(e) {
  return e === "[object Array]" || e === "[object ArrayBuffer]" || e === "[object DataView]" || e === "[object Float32Array]" || e === "[object Float64Array]" || e === "[object Int8Array]" || e === "[object Int16Array]" || e === "[object Int32Array]" || e === "[object Uint8Array]" || e === "[object Uint8ClampedArray]" || e === "[object Uint16Array]" || e === "[object Uint32Array]";
}
function Nd(e) {
  return Object.is(e, -0) ? "-0" : String(e);
}
function Ld(e) {
  return `${e}n`;
}
function ml(e, r) {
  return r ? "[Function " + (e.name || "anonymous") + "]" : "[Function]";
}
function vl(e) {
  return String(e).replace(Ad, "Symbol($1)");
}
function bl(e) {
  return "[" + Od.call(e) + "]";
}
function yu(e, r, t, a) {
  if (e === !0 || e === !1)
    return "" + e;
  if (e === void 0)
    return "undefined";
  if (e === null)
    return "null";
  const n = typeof e;
  if (n === "number")
    return Nd(e);
  if (n === "bigint")
    return Ld(e);
  if (n === "string")
    return a ? '"' + e.replace(/"|\\/g, "\\$&") + '"' : '"' + e + '"';
  if (n === "function")
    return ml(e, r);
  if (n === "symbol")
    return vl(e);
  const o = vu.call(e);
  return o === "[object WeakMap]" ? "WeakMap {}" : o === "[object WeakSet]" ? "WeakSet {}" : o === "[object Function]" || o === "[object GeneratorFunction]" ? ml(e, r) : o === "[object Symbol]" ? vl(e) : o === "[object Date]" ? isNaN(+e) ? "Date { NaN }" : $d.call(e) : o === "[object Error]" ? bl(e) : o === "[object RegExp]" ? t ? pl.call(e).replace(/[\\^$*+?.()|[\]{}]/g, "\\$&") : pl.call(e) : e instanceof Error ? bl(e) : null;
}
function hu(e, r, t, a, n, o) {
  if (n.indexOf(e) !== -1)
    return "[Circular]";
  n = n.slice(), n.push(e);
  const l = ++a > r.maxDepth, u = r.min;
  if (r.callToJSON && !l && e.toJSON && typeof e.toJSON == "function" && !o)
    return ce(e.toJSON(), r, t, a, n, !0);
  const i = vu.call(e);
  return i === "[object Arguments]" ? l ? "[Arguments]" : (u ? "" : "Arguments ") + "[" + (0, ze.printListItems)(
    e,
    r,
    t,
    a,
    n,
    ce
  ) + "]" : Bd(i) ? l ? "[" + e.constructor.name + "]" : (u || !r.printBasicPrototype && e.constructor.name === "Array" ? "" : e.constructor.name + " ") + "[" + (0, ze.printListItems)(
    e,
    r,
    t,
    a,
    n,
    ce
  ) + "]" : i === "[object Map]" ? l ? "[Map]" : "Map {" + (0, ze.printIteratorEntries)(
    e.entries(),
    r,
    t,
    a,
    n,
    ce,
    " => "
  ) + "}" : i === "[object Set]" ? l ? "[Set]" : "Set {" + (0, ze.printIteratorValues)(
    e.values(),
    r,
    t,
    a,
    n,
    ce
  ) + "}" : l || Md(e) ? "[" + Ln(e) + "]" : (u || !r.printBasicPrototype && Ln(e) === "Object" ? "" : Ln(e) + " ") + "{" + (0, ze.printObjectProperties)(
    e,
    r,
    t,
    a,
    n,
    ce
  ) + "}";
}
function kd(e) {
  return e.serialize != null;
}
function gu(e, r, t, a, n, o) {
  let l;
  try {
    l = kd(e) ? e.serialize(r, t, a, n, o, ce) : e.print(
      r,
      (u) => ce(u, t, a, n, o),
      (u) => {
        const i = a + t.indent;
        return i + u.replace(Id, `
` + i);
      },
      {
        edgeSpacing: t.spacingOuter,
        min: t.min,
        spacing: t.spacingInner
      },
      t.colors
    );
  } catch (u) {
    throw new bu(u.message, u.stack);
  }
  if (typeof l != "string")
    throw new Error(
      `pretty-format: Plugin must return type "string" but instead returned "${typeof l}".`
    );
  return l;
}
function Ru(e, r) {
  for (let t = 0; t < e.length; t++)
    try {
      if (e[t].test(r))
        return e[t];
    } catch (a) {
      throw new bu(a.message, a.stack);
    }
  return null;
}
function ce(e, r, t, a, n, o) {
  const l = Ru(r.plugins, e);
  if (l !== null)
    return gu(l, e, r, t, a, n);
  const u = yu(
    e,
    r.printFunctionName,
    r.escapeRegex,
    r.escapeString
  );
  return u !== null ? u : hu(
    e,
    r,
    t,
    a,
    n,
    o
  );
}
const Do = {
  comment: "gray",
  content: "reset",
  prop: "yellow",
  tag: "cyan",
  value: "green"
}, _u = Object.keys(Do), Y = {
  callToJSON: !0,
  compareKeys: void 0,
  escapeRegex: !1,
  escapeString: !0,
  highlight: !1,
  indent: 2,
  maxDepth: 1 / 0,
  min: !1,
  plugins: [],
  printBasicPrototype: !0,
  printFunctionName: !0,
  theme: Do
};
Ce.DEFAULT_OPTIONS = Y;
function Fd(e) {
  if (Object.keys(e).forEach((r) => {
    if (!Y.hasOwnProperty(r))
      throw new Error(`pretty-format: Unknown option "${r}".`);
  }), e.min && e.indent !== void 0 && e.indent !== 0)
    throw new Error(
      'pretty-format: Options "min" and "indent" cannot be used together.'
    );
  if (e.theme !== void 0) {
    if (e.theme === null)
      throw new Error('pretty-format: Option "theme" must not be null.');
    if (typeof e.theme != "object")
      throw new Error(
        `pretty-format: Option "theme" must be of type "object" but instead received "${typeof e.theme}".`
      );
  }
}
const Dd = (e) => _u.reduce((r, t) => {
  const a = e.theme && e.theme[t] !== void 0 ? e.theme[t] : Do[t], n = a && Cd.default[a];
  if (n && typeof n.close == "string" && typeof n.open == "string")
    r[t] = n;
  else
    throw new Error(
      `pretty-format: Option "theme" has a key "${t}" whose value "${a}" is undefined in ansi-styles.`
    );
  return r;
}, /* @__PURE__ */ Object.create(null)), jd = () => _u.reduce((e, r) => (e[r] = {
  close: "",
  open: ""
}, e), /* @__PURE__ */ Object.create(null)), Cu = (e) => e && e.printFunctionName !== void 0 ? e.printFunctionName : Y.printFunctionName, Eu = (e) => e && e.escapeRegex !== void 0 ? e.escapeRegex : Y.escapeRegex, Pu = (e) => e && e.escapeString !== void 0 ? e.escapeString : Y.escapeString, yl = (e) => {
  var r;
  return {
    callToJSON: e && e.callToJSON !== void 0 ? e.callToJSON : Y.callToJSON,
    colors: e && e.highlight ? Dd(e) : jd(),
    compareKeys: e && typeof e.compareKeys == "function" ? e.compareKeys : Y.compareKeys,
    escapeRegex: Eu(e),
    escapeString: Pu(e),
    indent: e && e.min ? "" : Hd(
      e && e.indent !== void 0 ? e.indent : Y.indent
    ),
    maxDepth: e && e.maxDepth !== void 0 ? e.maxDepth : Y.maxDepth,
    min: e && e.min !== void 0 ? e.min : Y.min,
    plugins: e && e.plugins !== void 0 ? e.plugins : Y.plugins,
    printBasicPrototype: (r = e == null ? void 0 : e.printBasicPrototype) !== null && r !== void 0 ? r : !0,
    printFunctionName: Cu(e),
    spacingInner: e && e.min ? " " : `
`,
    spacingOuter: e && e.min ? "" : `
`
  };
};
function Hd(e) {
  return new Array(e + 1).join(" ");
}
function qu(e, r) {
  if (r && (Fd(r), r.plugins)) {
    const a = Ru(r.plugins, e);
    if (a !== null)
      return gu(a, e, yl(r), "", 0, []);
  }
  const t = yu(
    e,
    Cu(r),
    Eu(r),
    Pu(r)
  );
  return t !== null ? t : hu(e, yl(r), "", 0, []);
}
const Ud = {
  AsymmetricMatcher: Ed.default,
  ConvertAnsi: Pd.default,
  DOMCollection: qd.default,
  DOMElement: wd.default,
  Immutable: xd.default,
  ReactElement: Sd.default,
  ReactTestComponent: Td.default
};
mu = Ce.plugins = Ud;
var zd = qu;
Ce.default = zd;
var Wd = Object.prototype.toString;
function hl(e) {
  return typeof e == "function" || Wd.call(e) === "[object Function]";
}
function Vd(e) {
  var r = Number(e);
  return isNaN(r) ? 0 : r === 0 || !isFinite(r) ? r : (r > 0 ? 1 : -1) * Math.floor(Math.abs(r));
}
var Gd = Math.pow(2, 53) - 1;
function Yd(e) {
  var r = Vd(e);
  return Math.min(Math.max(r, 0), Gd);
}
function K(e, r) {
  var t = Array, a = Object(e);
  if (e == null)
    throw new TypeError("Array.from requires an array-like object - not null or undefined");
  if (typeof r < "u" && !hl(r))
    throw new TypeError("Array.from: when provided, the second argument must be a function");
  for (var n = Yd(a.length), o = hl(t) ? Object(new t(n)) : new Array(n), l = 0, u; l < n; )
    u = a[l], r ? o[l] = r(u, l) : o[l] = u, l += 1;
  return o.length = n, o;
}
function rr(e) {
  "@babel/helpers - typeof";
  return rr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, rr(e);
}
function Kd(e, r) {
  if (!(e instanceof r))
    throw new TypeError("Cannot call a class as a function");
}
function gl(e, r) {
  for (var t = 0; t < r.length; t++) {
    var a = r[t];
    a.enumerable = a.enumerable || !1, a.configurable = !0, "value" in a && (a.writable = !0), Object.defineProperty(e, wu(a.key), a);
  }
}
function Xd(e, r, t) {
  return r && gl(e.prototype, r), t && gl(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
}
function Jd(e, r, t) {
  return r = wu(r), r in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function wu(e) {
  var r = Qd(e, "string");
  return rr(r) === "symbol" ? r : String(r);
}
function Qd(e, r) {
  if (rr(e) !== "object" || e === null)
    return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var a = t.call(e, r || "default");
    if (rr(a) !== "object")
      return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
var Zd = /* @__PURE__ */ function() {
  function e() {
    var r = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    Kd(this, e), Jd(this, "items", void 0), this.items = r;
  }
  return Xd(e, [{
    key: "add",
    value: function(t) {
      return this.has(t) === !1 && this.items.push(t), this;
    }
  }, {
    key: "clear",
    value: function() {
      this.items = [];
    }
  }, {
    key: "delete",
    value: function(t) {
      var a = this.items.length;
      return this.items = this.items.filter(function(n) {
        return n !== t;
      }), a !== this.items.length;
    }
  }, {
    key: "forEach",
    value: function(t) {
      var a = this;
      this.items.forEach(function(n) {
        t(n, n, a);
      });
    }
  }, {
    key: "has",
    value: function(t) {
      return this.items.indexOf(t) !== -1;
    }
  }, {
    key: "size",
    get: function() {
      return this.items.length;
    }
  }]), e;
}();
const ef = typeof Set > "u" ? Set : Zd;
function j(e) {
  var r;
  return (
    // eslint-disable-next-line no-restricted-properties -- actual guard for environments without localName
    (r = e.localName) !== null && r !== void 0 ? r : (
      // eslint-disable-next-line no-restricted-properties -- required for the fallback
      e.tagName.toLowerCase()
    )
  );
}
var rf = {
  article: "article",
  aside: "complementary",
  button: "button",
  datalist: "listbox",
  dd: "definition",
  details: "group",
  dialog: "dialog",
  dt: "term",
  fieldset: "group",
  figure: "figure",
  // WARNING: Only with an accessible name
  form: "form",
  footer: "contentinfo",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  header: "banner",
  hr: "separator",
  html: "document",
  legend: "legend",
  li: "listitem",
  math: "math",
  main: "main",
  menu: "list",
  nav: "navigation",
  ol: "list",
  optgroup: "group",
  // WARNING: Only in certain context
  option: "option",
  output: "status",
  progress: "progressbar",
  // WARNING: Only with an accessible name
  section: "region",
  summary: "button",
  table: "table",
  tbody: "rowgroup",
  textarea: "textbox",
  tfoot: "rowgroup",
  // WARNING: Only in certain context
  td: "cell",
  th: "columnheader",
  thead: "rowgroup",
  tr: "row",
  ul: "list"
}, tf = {
  caption: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  code: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  deletion: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  emphasis: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  generic: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby", "aria-roledescription"]),
  insertion: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  paragraph: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  presentation: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  strong: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  subscript: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
  superscript: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"])
};
function af(e, r) {
  return [
    "aria-atomic",
    "aria-busy",
    "aria-controls",
    "aria-current",
    "aria-describedby",
    "aria-details",
    // "disabled",
    "aria-dropeffect",
    // "errormessage",
    "aria-flowto",
    "aria-grabbed",
    // "haspopup",
    "aria-hidden",
    // "invalid",
    "aria-keyshortcuts",
    "aria-label",
    "aria-labelledby",
    "aria-live",
    "aria-owns",
    "aria-relevant",
    "aria-roledescription"
  ].some(function(t) {
    var a;
    return e.hasAttribute(t) && !((a = tf[r]) !== null && a !== void 0 && a.has(t));
  });
}
function xu(e, r) {
  return af(e, r);
}
function nf(e) {
  var r = lf(e);
  if (r === null || r === "presentation") {
    var t = of(e);
    if (r !== "presentation" || xu(e, t || ""))
      return t;
  }
  return r;
}
function of(e) {
  var r = rf[j(e)];
  if (r !== void 0)
    return r;
  switch (j(e)) {
    case "a":
    case "area":
    case "link":
      if (e.hasAttribute("href"))
        return "link";
      break;
    case "img":
      return e.getAttribute("alt") === "" && !xu(e, "img") ? "presentation" : "img";
    case "input": {
      var t = e, a = t.type;
      switch (a) {
        case "button":
        case "image":
        case "reset":
        case "submit":
          return "button";
        case "checkbox":
        case "radio":
          return a;
        case "range":
          return "slider";
        case "email":
        case "tel":
        case "text":
        case "url":
          return e.hasAttribute("list") ? "combobox" : "textbox";
        case "search":
          return e.hasAttribute("list") ? "combobox" : "searchbox";
        case "number":
          return "spinbutton";
        default:
          return null;
      }
    }
    case "select":
      return e.hasAttribute("multiple") || e.size > 1 ? "listbox" : "combobox";
  }
  return null;
}
function lf(e) {
  var r = e.getAttribute("role");
  if (r !== null) {
    var t = r.trim().split(" ")[0];
    if (t.length > 0)
      return t;
  }
  return null;
}
function B(e) {
  return e !== null && e.nodeType === e.ELEMENT_NODE;
}
function Su(e) {
  return B(e) && j(e) === "caption";
}
function gr(e) {
  return B(e) && j(e) === "input";
}
function uf(e) {
  return B(e) && j(e) === "optgroup";
}
function sf(e) {
  return B(e) && j(e) === "select";
}
function cf(e) {
  return B(e) && j(e) === "table";
}
function df(e) {
  return B(e) && j(e) === "textarea";
}
function ff(e) {
  var r = e.ownerDocument === null ? e : e.ownerDocument, t = r.defaultView;
  if (t === null)
    throw new TypeError("no window available");
  return t;
}
function pf(e) {
  return B(e) && j(e) === "fieldset";
}
function mf(e) {
  return B(e) && j(e) === "legend";
}
function vf(e) {
  return B(e) && j(e) === "slot";
}
function bf(e) {
  return B(e) && e.ownerSVGElement !== void 0;
}
function yf(e) {
  return B(e) && j(e) === "svg";
}
function hf(e) {
  return bf(e) && j(e) === "title";
}
function qr(e, r) {
  if (B(e) && e.hasAttribute(r)) {
    var t = e.getAttribute(r).split(" "), a = e.getRootNode ? e.getRootNode() : e.ownerDocument;
    return t.map(function(n) {
      return a.getElementById(n);
    }).filter(
      function(n) {
        return n !== null;
      }
      // TODO: why does this not narrow?
    );
  }
  return [];
}
function ne(e, r) {
  return B(e) ? r.indexOf(nf(e)) !== -1 : !1;
}
function gf(e) {
  return e.trim().replace(/\s\s+/g, " ");
}
function Rf(e, r) {
  if (!B(e))
    return !1;
  if (e.hasAttribute("hidden") || e.getAttribute("aria-hidden") === "true")
    return !0;
  var t = r(e);
  return t.getPropertyValue("display") === "none" || t.getPropertyValue("visibility") === "hidden";
}
function _f(e) {
  return ne(e, ["button", "combobox", "listbox", "textbox"]) || Tu(e, "range");
}
function Tu(e, r) {
  if (!B(e))
    return !1;
  switch (r) {
    case "range":
      return ne(e, ["meter", "progressbar", "scrollbar", "slider", "spinbutton"]);
    default:
      throw new TypeError("No knowledge about abstract role '".concat(r, "'. This is likely a bug :("));
  }
}
function Rl(e, r) {
  var t = K(e.querySelectorAll(r));
  return qr(e, "aria-owns").forEach(function(a) {
    t.push.apply(t, K(a.querySelectorAll(r)));
  }), t;
}
function Cf(e) {
  return sf(e) ? e.selectedOptions || Rl(e, "[selected]") : Rl(e, '[aria-selected="true"]');
}
function Ef(e) {
  return ne(e, ["none", "presentation"]);
}
function Pf(e) {
  return Su(e);
}
function qf(e) {
  return ne(e, ["button", "cell", "checkbox", "columnheader", "gridcell", "heading", "label", "legend", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "rowheader", "switch", "tab", "tooltip", "treeitem"]);
}
function wf(e) {
  return !1;
}
function xf(e) {
  return gr(e) || df(e) ? e.value : e.textContent || "";
}
function _l(e) {
  var r = e.getPropertyValue("content");
  return /^["'].*["']$/.test(r) ? r.slice(1, -1) : "";
}
function $u(e) {
  var r = j(e);
  return r === "button" || r === "input" && e.getAttribute("type") !== "hidden" || r === "meter" || r === "output" || r === "progress" || r === "select" || r === "textarea";
}
function Ou(e) {
  if ($u(e))
    return e;
  var r = null;
  return e.childNodes.forEach(function(t) {
    if (r === null && B(t)) {
      var a = Ou(t);
      a !== null && (r = a);
    }
  }), r;
}
function Sf(e) {
  if (e.control !== void 0)
    return e.control;
  var r = e.getAttribute("for");
  return r !== null ? e.ownerDocument.getElementById(r) : Ou(e);
}
function Tf(e) {
  var r = e.labels;
  if (r === null)
    return r;
  if (r !== void 0)
    return K(r);
  if (!$u(e))
    return null;
  var t = e.ownerDocument;
  return K(t.querySelectorAll("label")).filter(function(a) {
    return Sf(a) === e;
  });
}
function $f(e) {
  var r = e.assignedNodes();
  return r.length === 0 ? K(e.childNodes) : r;
}
function Mu(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = new ef(), a = ff(e), n = r.compute, o = n === void 0 ? "name" : n, l = r.computedStyleSupportsPseudoElements, u = l === void 0 ? r.getComputedStyle !== void 0 : l, i = r.getComputedStyle, s = i === void 0 ? a.getComputedStyle.bind(a) : i, f = r.hidden, d = f === void 0 ? !1 : f;
  function m(c, g) {
    var _ = "";
    if (B(c) && u) {
      var R = s(c, "::before"), q = _l(R);
      _ = "".concat(q, " ").concat(_);
    }
    var p = vf(c) ? $f(c) : K(c.childNodes).concat(qr(c, "aria-owns"));
    if (p.forEach(function(I) {
      var L = S(I, {
        isEmbeddedInLabel: g.isEmbeddedInLabel,
        isReferenced: !1,
        recursion: !0
      }), k = B(I) ? s(I).getPropertyValue("display") : "inline", F = k !== "inline" ? " " : "";
      _ += "".concat(F).concat(L).concat(F);
    }), B(c) && u) {
      var b = s(c, "::after"), y = _l(b);
      _ = "".concat(_, " ").concat(y);
    }
    return _.trim();
  }
  function C(c, g) {
    var _ = c.getAttributeNode(g);
    return _ !== null && !t.has(_) && _.value.trim() !== "" ? (t.add(_), _.value) : null;
  }
  function w(c) {
    return B(c) ? C(c, "title") : null;
  }
  function E(c) {
    if (!B(c))
      return null;
    if (pf(c)) {
      t.add(c);
      for (var g = K(c.childNodes), _ = 0; _ < g.length; _ += 1) {
        var R = g[_];
        if (mf(R))
          return S(R, {
            isEmbeddedInLabel: !1,
            isReferenced: !1,
            recursion: !1
          });
      }
    } else if (cf(c)) {
      t.add(c);
      for (var q = K(c.childNodes), p = 0; p < q.length; p += 1) {
        var b = q[p];
        if (Su(b))
          return S(b, {
            isEmbeddedInLabel: !1,
            isReferenced: !1,
            recursion: !1
          });
      }
    } else if (yf(c)) {
      t.add(c);
      for (var y = K(c.childNodes), I = 0; I < y.length; I += 1) {
        var L = y[I];
        if (hf(L))
          return L.textContent;
      }
      return null;
    } else if (j(c) === "img" || j(c) === "area") {
      var k = C(c, "alt");
      if (k !== null)
        return k;
    } else if (uf(c)) {
      var F = C(c, "label");
      if (F !== null)
        return F;
    }
    if (gr(c) && (c.type === "button" || c.type === "submit" || c.type === "reset")) {
      var h = C(c, "value");
      if (h !== null)
        return h;
      if (c.type === "submit")
        return "Submit";
      if (c.type === "reset")
        return "Reset";
    }
    var x = Tf(c);
    if (x !== null && x.length !== 0)
      return t.add(c), K(x).map(function(we) {
        return S(we, {
          isEmbeddedInLabel: !0,
          isReferenced: !1,
          recursion: !0
        });
      }).filter(function(we) {
        return we.length > 0;
      }).join(" ");
    if (gr(c) && c.type === "image") {
      var H = C(c, "alt");
      if (H !== null)
        return H;
      var N = C(c, "title");
      return N !== null ? N : "Submit Query";
    }
    if (ne(c, ["button"])) {
      var U = m(c, {
        isEmbeddedInLabel: !1,
        isReferenced: !1
      });
      if (U !== "")
        return U;
    }
    return null;
  }
  function S(c, g) {
    if (t.has(c))
      return "";
    if (!d && Rf(c, s) && !g.isReferenced)
      return t.add(c), "";
    var _ = B(c) ? c.getAttributeNode("aria-labelledby") : null, R = _ !== null && !t.has(_) ? qr(c, "aria-labelledby") : [];
    if (o === "name" && !g.isReferenced && R.length > 0)
      return t.add(_), R.map(function(k) {
        return S(k, {
          isEmbeddedInLabel: g.isEmbeddedInLabel,
          isReferenced: !0,
          // this isn't recursion as specified, otherwise we would skip
          // `aria-label` in
          // <input id="myself" aria-label="foo" aria-labelledby="myself"
          recursion: !1
        });
      }).join(" ");
    var q = g.recursion && _f(c) && o === "name";
    if (!q) {
      var p = (B(c) && c.getAttribute("aria-label") || "").trim();
      if (p !== "" && o === "name")
        return t.add(c), p;
      if (!Ef(c)) {
        var b = E(c);
        if (b !== null)
          return t.add(c), b;
      }
    }
    if (ne(c, ["menu"]))
      return t.add(c), "";
    if (q || g.isEmbeddedInLabel || g.isReferenced) {
      if (ne(c, ["combobox", "listbox"])) {
        t.add(c);
        var y = Cf(c);
        return y.length === 0 ? gr(c) ? c.value : "" : K(y).map(function(k) {
          return S(k, {
            isEmbeddedInLabel: g.isEmbeddedInLabel,
            isReferenced: !1,
            recursion: !0
          });
        }).join(" ");
      }
      if (Tu(c, "range"))
        return t.add(c), c.hasAttribute("aria-valuetext") ? c.getAttribute("aria-valuetext") : c.hasAttribute("aria-valuenow") ? c.getAttribute("aria-valuenow") : c.getAttribute("value") || "";
      if (ne(c, ["textbox"]))
        return t.add(c), xf(c);
    }
    if (qf(c) || B(c) && g.isReferenced || Pf(c) || wf()) {
      var I = m(c, {
        isEmbeddedInLabel: g.isEmbeddedInLabel,
        isReferenced: !1
      });
      if (I !== "")
        return t.add(c), I;
    }
    if (c.nodeType === c.TEXT_NODE)
      return t.add(c), c.textContent || "";
    if (g.recursion)
      return t.add(c), m(c, {
        isEmbeddedInLabel: g.isEmbeddedInLabel,
        isReferenced: !1
      });
    var L = w(c);
    return L !== null ? (t.add(c), L) : (t.add(c), "");
  }
  return gf(S(e, {
    isEmbeddedInLabel: !1,
    // by spec computeAccessibleDescription starts with the referenced elements as roots
    isReferenced: o === "description",
    recursion: !1
  }));
}
function tr(e) {
  "@babel/helpers - typeof";
  return tr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, tr(e);
}
function Cl(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var a = Object.getOwnPropertySymbols(e);
    r && (a = a.filter(function(n) {
      return Object.getOwnPropertyDescriptor(e, n).enumerable;
    })), t.push.apply(t, a);
  }
  return t;
}
function El(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = arguments[r] != null ? arguments[r] : {};
    r % 2 ? Cl(Object(t), !0).forEach(function(a) {
      Of(e, a, t[a]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : Cl(Object(t)).forEach(function(a) {
      Object.defineProperty(e, a, Object.getOwnPropertyDescriptor(t, a));
    });
  }
  return e;
}
function Of(e, r, t) {
  return r = Mf(r), r in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function Mf(e) {
  var r = Af(e, "string");
  return tr(r) === "symbol" ? r : String(r);
}
function Af(e, r) {
  if (tr(e) !== "object" || e === null)
    return e;
  var t = e[Symbol.toPrimitive];
  if (t !== void 0) {
    var a = t.call(e, r || "default");
    if (tr(a) !== "object")
      return a;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (r === "string" ? String : Number)(e);
}
function Au(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, t = qr(e, "aria-describedby").map(function(n) {
    return Mu(n, El(El({}, r), {}, {
      compute: "description"
    }));
  }).join(" ");
  if (t === "") {
    var a = e.getAttribute("title");
    t = a === null ? "" : a;
  }
  return t;
}
function If(e) {
  return ne(e, ["caption", "code", "deletion", "emphasis", "generic", "insertion", "paragraph", "presentation", "strong", "subscript", "superscript"]);
}
function jo(e) {
  var r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  return If(e) ? "" : Mu(e, r);
}
var X = {}, Ur = {}, $e = {}, zr = {};
Object.defineProperty(zr, "__esModule", {
  value: !0
});
zr.default = void 0;
function Bf() {
  var e = this, r = 0, t = {
    "@@iterator": function() {
      return t;
    },
    next: function() {
      if (r < e.length) {
        var n = e[r];
        return r = r + 1, {
          done: !1,
          value: n
        };
      } else
        return {
          done: !0
        };
    }
  };
  return t;
}
var Nf = Bf;
zr.default = Nf;
Object.defineProperty($e, "__esModule", {
  value: !0
});
$e.default = Ff;
var Lf = kf(zr);
function kf(e) {
  return e && e.__esModule ? e : { default: e };
}
function io(e) {
  "@babel/helpers - typeof";
  return io = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, io(e);
}
function Ff(e, r) {
  return typeof Symbol == "function" && io(Symbol.iterator) === "symbol" && Object.defineProperty(e, Symbol.iterator, {
    value: Lf.default.bind(r)
  }), e;
}
Object.defineProperty(Ur, "__esModule", {
  value: !0
});
Ur.default = void 0;
var Df = jf($e);
function jf(e) {
  return e && e.__esModule ? e : { default: e };
}
function kn(e, r) {
  return zf(e) || Uf(e, r) || Iu(e, r) || Hf();
}
function Hf() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Uf(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var a = [], n = !0, o = !1, l, u;
    try {
      for (t = t.call(e); !(n = (l = t.next()).done) && (a.push(l.value), !(r && a.length === r)); n = !0)
        ;
    } catch (i) {
      o = !0, u = i;
    } finally {
      try {
        !n && t.return != null && t.return();
      } finally {
        if (o)
          throw u;
      }
    }
    return a;
  }
}
function zf(e) {
  if (Array.isArray(e))
    return e;
}
function Wf(e, r) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = Iu(e)) || r && e && typeof e.length == "number") {
      t && (e = t);
      var a = 0, n = function() {
      };
      return { s: n, n: function() {
        return a >= e.length ? { done: !0 } : { done: !1, value: e[a++] };
      }, e: function(s) {
        throw s;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o = !0, l = !1, u;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var s = t.next();
    return o = s.done, s;
  }, e: function(s) {
    l = !0, u = s;
  }, f: function() {
    try {
      !o && t.return != null && t.return();
    } finally {
      if (l)
        throw u;
    }
  } };
}
function Iu(e, r) {
  if (e) {
    if (typeof e == "string")
      return Pl(e, r);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set")
      return Array.from(e);
    if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))
      return Pl(e, r);
  }
}
function Pl(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++)
    a[t] = e[t];
  return a;
}
var Ie = [["aria-activedescendant", {
  type: "id"
}], ["aria-atomic", {
  type: "boolean"
}], ["aria-autocomplete", {
  type: "token",
  values: ["inline", "list", "both", "none"]
}], ["aria-busy", {
  type: "boolean"
}], ["aria-checked", {
  type: "tristate"
}], ["aria-colcount", {
  type: "integer"
}], ["aria-colindex", {
  type: "integer"
}], ["aria-colspan", {
  type: "integer"
}], ["aria-controls", {
  type: "idlist"
}], ["aria-current", {
  type: "token",
  values: ["page", "step", "location", "date", "time", !0, !1]
}], ["aria-describedby", {
  type: "idlist"
}], ["aria-details", {
  type: "id"
}], ["aria-disabled", {
  type: "boolean"
}], ["aria-dropeffect", {
  type: "tokenlist",
  values: ["copy", "execute", "link", "move", "none", "popup"]
}], ["aria-errormessage", {
  type: "id"
}], ["aria-expanded", {
  type: "boolean",
  allowundefined: !0
}], ["aria-flowto", {
  type: "idlist"
}], ["aria-grabbed", {
  type: "boolean",
  allowundefined: !0
}], ["aria-haspopup", {
  type: "token",
  values: [!1, !0, "menu", "listbox", "tree", "grid", "dialog"]
}], ["aria-hidden", {
  type: "boolean",
  allowundefined: !0
}], ["aria-invalid", {
  type: "token",
  values: ["grammar", !1, "spelling", !0]
}], ["aria-keyshortcuts", {
  type: "string"
}], ["aria-label", {
  type: "string"
}], ["aria-labelledby", {
  type: "idlist"
}], ["aria-level", {
  type: "integer"
}], ["aria-live", {
  type: "token",
  values: ["assertive", "off", "polite"]
}], ["aria-modal", {
  type: "boolean"
}], ["aria-multiline", {
  type: "boolean"
}], ["aria-multiselectable", {
  type: "boolean"
}], ["aria-orientation", {
  type: "token",
  values: ["vertical", "undefined", "horizontal"]
}], ["aria-owns", {
  type: "idlist"
}], ["aria-placeholder", {
  type: "string"
}], ["aria-posinset", {
  type: "integer"
}], ["aria-pressed", {
  type: "tristate"
}], ["aria-readonly", {
  type: "boolean"
}], ["aria-relevant", {
  type: "tokenlist",
  values: ["additions", "all", "removals", "text"]
}], ["aria-required", {
  type: "boolean"
}], ["aria-roledescription", {
  type: "string"
}], ["aria-rowcount", {
  type: "integer"
}], ["aria-rowindex", {
  type: "integer"
}], ["aria-rowspan", {
  type: "integer"
}], ["aria-selected", {
  type: "boolean",
  allowundefined: !0
}], ["aria-setsize", {
  type: "integer"
}], ["aria-sort", {
  type: "token",
  values: ["ascending", "descending", "none", "other"]
}], ["aria-valuemax", {
  type: "number"
}], ["aria-valuemin", {
  type: "number"
}], ["aria-valuenow", {
  type: "number"
}], ["aria-valuetext", {
  type: "string"
}]], uo = {
  entries: function() {
    return Ie;
  },
  forEach: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null, a = Wf(Ie), n;
    try {
      for (a.s(); !(n = a.n()).done; ) {
        var o = kn(n.value, 2), l = o[0], u = o[1];
        r.call(t, u, l, Ie);
      }
    } catch (i) {
      a.e(i);
    } finally {
      a.f();
    }
  },
  get: function(r) {
    var t = Ie.find(function(a) {
      return a[0] === r;
    });
    return t && t[1];
  },
  has: function(r) {
    return !!uo.get(r);
  },
  keys: function() {
    return Ie.map(function(r) {
      var t = kn(r, 1), a = t[0];
      return a;
    });
  },
  values: function() {
    return Ie.map(function(r) {
      var t = kn(r, 2), a = t[1];
      return a;
    });
  }
}, Vf = (0, Df.default)(uo, uo.entries());
Ur.default = Vf;
var Wr = {};
Object.defineProperty(Wr, "__esModule", {
  value: !0
});
Wr.default = void 0;
var Gf = Yf($e);
function Yf(e) {
  return e && e.__esModule ? e : { default: e };
}
function Fn(e, r) {
  return Jf(e) || Xf(e, r) || Bu(e, r) || Kf();
}
function Kf() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Xf(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var a = [], n = !0, o = !1, l, u;
    try {
      for (t = t.call(e); !(n = (l = t.next()).done) && (a.push(l.value), !(r && a.length === r)); n = !0)
        ;
    } catch (i) {
      o = !0, u = i;
    } finally {
      try {
        !n && t.return != null && t.return();
      } finally {
        if (o)
          throw u;
      }
    }
    return a;
  }
}
function Jf(e) {
  if (Array.isArray(e))
    return e;
}
function Qf(e, r) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = Bu(e)) || r && e && typeof e.length == "number") {
      t && (e = t);
      var a = 0, n = function() {
      };
      return { s: n, n: function() {
        return a >= e.length ? { done: !0 } : { done: !1, value: e[a++] };
      }, e: function(s) {
        throw s;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o = !0, l = !1, u;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var s = t.next();
    return o = s.done, s;
  }, e: function(s) {
    l = !0, u = s;
  }, f: function() {
    try {
      !o && t.return != null && t.return();
    } finally {
      if (l)
        throw u;
    }
  } };
}
function Bu(e, r) {
  if (e) {
    if (typeof e == "string")
      return ql(e, r);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set")
      return Array.from(e);
    if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))
      return ql(e, r);
  }
}
function ql(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++)
    a[t] = e[t];
  return a;
}
var Be = [["a", {
  reserved: !1
}], ["abbr", {
  reserved: !1
}], ["acronym", {
  reserved: !1
}], ["address", {
  reserved: !1
}], ["applet", {
  reserved: !1
}], ["area", {
  reserved: !1
}], ["article", {
  reserved: !1
}], ["aside", {
  reserved: !1
}], ["audio", {
  reserved: !1
}], ["b", {
  reserved: !1
}], ["base", {
  reserved: !0
}], ["bdi", {
  reserved: !1
}], ["bdo", {
  reserved: !1
}], ["big", {
  reserved: !1
}], ["blink", {
  reserved: !1
}], ["blockquote", {
  reserved: !1
}], ["body", {
  reserved: !1
}], ["br", {
  reserved: !1
}], ["button", {
  reserved: !1
}], ["canvas", {
  reserved: !1
}], ["caption", {
  reserved: !1
}], ["center", {
  reserved: !1
}], ["cite", {
  reserved: !1
}], ["code", {
  reserved: !1
}], ["col", {
  reserved: !0
}], ["colgroup", {
  reserved: !0
}], ["content", {
  reserved: !1
}], ["data", {
  reserved: !1
}], ["datalist", {
  reserved: !1
}], ["dd", {
  reserved: !1
}], ["del", {
  reserved: !1
}], ["details", {
  reserved: !1
}], ["dfn", {
  reserved: !1
}], ["dialog", {
  reserved: !1
}], ["dir", {
  reserved: !1
}], ["div", {
  reserved: !1
}], ["dl", {
  reserved: !1
}], ["dt", {
  reserved: !1
}], ["em", {
  reserved: !1
}], ["embed", {
  reserved: !1
}], ["fieldset", {
  reserved: !1
}], ["figcaption", {
  reserved: !1
}], ["figure", {
  reserved: !1
}], ["font", {
  reserved: !1
}], ["footer", {
  reserved: !1
}], ["form", {
  reserved: !1
}], ["frame", {
  reserved: !1
}], ["frameset", {
  reserved: !1
}], ["h1", {
  reserved: !1
}], ["h2", {
  reserved: !1
}], ["h3", {
  reserved: !1
}], ["h4", {
  reserved: !1
}], ["h5", {
  reserved: !1
}], ["h6", {
  reserved: !1
}], ["head", {
  reserved: !0
}], ["header", {
  reserved: !1
}], ["hgroup", {
  reserved: !1
}], ["hr", {
  reserved: !1
}], ["html", {
  reserved: !0
}], ["i", {
  reserved: !1
}], ["iframe", {
  reserved: !1
}], ["img", {
  reserved: !1
}], ["input", {
  reserved: !1
}], ["ins", {
  reserved: !1
}], ["kbd", {
  reserved: !1
}], ["keygen", {
  reserved: !1
}], ["label", {
  reserved: !1
}], ["legend", {
  reserved: !1
}], ["li", {
  reserved: !1
}], ["link", {
  reserved: !0
}], ["main", {
  reserved: !1
}], ["map", {
  reserved: !1
}], ["mark", {
  reserved: !1
}], ["marquee", {
  reserved: !1
}], ["menu", {
  reserved: !1
}], ["menuitem", {
  reserved: !1
}], ["meta", {
  reserved: !0
}], ["meter", {
  reserved: !1
}], ["nav", {
  reserved: !1
}], ["noembed", {
  reserved: !0
}], ["noscript", {
  reserved: !0
}], ["object", {
  reserved: !1
}], ["ol", {
  reserved: !1
}], ["optgroup", {
  reserved: !1
}], ["option", {
  reserved: !1
}], ["output", {
  reserved: !1
}], ["p", {
  reserved: !1
}], ["param", {
  reserved: !0
}], ["picture", {
  reserved: !0
}], ["pre", {
  reserved: !1
}], ["progress", {
  reserved: !1
}], ["q", {
  reserved: !1
}], ["rp", {
  reserved: !1
}], ["rt", {
  reserved: !1
}], ["rtc", {
  reserved: !1
}], ["ruby", {
  reserved: !1
}], ["s", {
  reserved: !1
}], ["samp", {
  reserved: !1
}], ["script", {
  reserved: !0
}], ["section", {
  reserved: !1
}], ["select", {
  reserved: !1
}], ["small", {
  reserved: !1
}], ["source", {
  reserved: !0
}], ["spacer", {
  reserved: !1
}], ["span", {
  reserved: !1
}], ["strike", {
  reserved: !1
}], ["strong", {
  reserved: !1
}], ["style", {
  reserved: !0
}], ["sub", {
  reserved: !1
}], ["summary", {
  reserved: !1
}], ["sup", {
  reserved: !1
}], ["table", {
  reserved: !1
}], ["tbody", {
  reserved: !1
}], ["td", {
  reserved: !1
}], ["textarea", {
  reserved: !1
}], ["tfoot", {
  reserved: !1
}], ["th", {
  reserved: !1
}], ["thead", {
  reserved: !1
}], ["time", {
  reserved: !1
}], ["title", {
  reserved: !0
}], ["tr", {
  reserved: !1
}], ["track", {
  reserved: !0
}], ["tt", {
  reserved: !1
}], ["u", {
  reserved: !1
}], ["ul", {
  reserved: !1
}], ["var", {
  reserved: !1
}], ["video", {
  reserved: !1
}], ["wbr", {
  reserved: !1
}], ["xmp", {
  reserved: !1
}]], so = {
  entries: function() {
    return Be;
  },
  forEach: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null, a = Qf(Be), n;
    try {
      for (a.s(); !(n = a.n()).done; ) {
        var o = Fn(n.value, 2), l = o[0], u = o[1];
        r.call(t, u, l, Be);
      }
    } catch (i) {
      a.e(i);
    } finally {
      a.f();
    }
  },
  get: function(r) {
    var t = Be.find(function(a) {
      return a[0] === r;
    });
    return t && t[1];
  },
  has: function(r) {
    return !!so.get(r);
  },
  keys: function() {
    return Be.map(function(r) {
      var t = Fn(r, 1), a = t[0];
      return a;
    });
  },
  values: function() {
    return Be.map(function(r) {
      var t = Fn(r, 2), a = t[1];
      return a;
    });
  }
}, Zf = (0, Gf.default)(so, so.entries());
Wr.default = Zf;
var He = {}, Vr = {}, Gr = {};
Object.defineProperty(Gr, "__esModule", {
  value: !0
});
Gr.default = void 0;
var ep = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "menuitem"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget"]]
}, rp = ep;
Gr.default = rp;
var Yr = {};
Object.defineProperty(Yr, "__esModule", {
  value: !0
});
Yr.default = void 0;
var tp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-activedescendant": null,
    "aria-disabled": null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget"]]
}, ap = tp;
Yr.default = ap;
var Kr = {};
Object.defineProperty(Kr, "__esModule", {
  value: !0
});
Kr.default = void 0;
var np = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null
  },
  relatedConcepts: [{
    concept: {
      name: "input"
    },
    module: "XForms"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget"]]
}, op = np;
Kr.default = op;
var Xr = {};
Object.defineProperty(Xr, "__esModule", {
  value: !0
});
Xr.default = void 0;
var lp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, ip = lp;
Xr.default = ip;
var Jr = {};
Object.defineProperty(Jr, "__esModule", {
  value: !0
});
Jr.default = void 0;
var up = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-valuemax": null,
    "aria-valuemin": null,
    "aria-valuenow": null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, sp = up;
Jr.default = sp;
var Qr = {};
Object.defineProperty(Qr, "__esModule", {
  value: !0
});
Qr.default = void 0;
var cp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: [],
  prohibitedProps: [],
  props: {
    "aria-atomic": null,
    "aria-busy": null,
    "aria-controls": null,
    "aria-current": null,
    "aria-describedby": null,
    "aria-details": null,
    "aria-dropeffect": null,
    "aria-flowto": null,
    "aria-grabbed": null,
    "aria-hidden": null,
    "aria-keyshortcuts": null,
    "aria-label": null,
    "aria-labelledby": null,
    "aria-live": null,
    "aria-owns": null,
    "aria-relevant": null,
    "aria-roledescription": null
  },
  relatedConcepts: [{
    concept: {
      name: "rel"
    },
    module: "HTML"
  }, {
    concept: {
      name: "role"
    },
    module: "XHTML"
  }, {
    concept: {
      name: "type"
    },
    module: "Dublin Core"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: []
}, dp = cp;
Qr.default = dp;
var Zr = {};
Object.defineProperty(Zr, "__esModule", {
  value: !0
});
Zr.default = void 0;
var fp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "frontmatter"
    },
    module: "DTB"
  }, {
    concept: {
      name: "level"
    },
    module: "DTB"
  }, {
    concept: {
      name: "level"
    },
    module: "SMIL"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, pp = fp;
Zr.default = pp;
var et = {};
Object.defineProperty(et, "__esModule", {
  value: !0
});
et.default = void 0;
var mp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, vp = mp;
et.default = vp;
var rt = {};
Object.defineProperty(rt, "__esModule", {
  value: !0
});
rt.default = void 0;
var bp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-orientation": null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite"], ["roletype", "structure", "section", "group"]]
}, yp = bp;
rt.default = yp;
var tt = {};
Object.defineProperty(tt, "__esModule", {
  value: !0
});
tt.default = void 0;
var hp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype"]]
}, gp = hp;
tt.default = gp;
var at = {};
Object.defineProperty(at, "__esModule", {
  value: !0
});
at.default = void 0;
var Rp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype"]]
}, _p = Rp;
at.default = _p;
var nt = {};
Object.defineProperty(nt, "__esModule", {
  value: !0
});
nt.default = void 0;
var Cp = {
  abstract: !0,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-modal": null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype"]]
}, Ep = Cp;
nt.default = Ep;
Object.defineProperty(Vr, "__esModule", {
  value: !0
});
Vr.default = void 0;
var Pp = W(Gr), qp = W(Yr), wp = W(Kr), xp = W(Xr), Sp = W(Jr), Tp = W(Qr), $p = W(Zr), Op = W(et), Mp = W(rt), Ap = W(tt), Ip = W(at), Bp = W(nt);
function W(e) {
  return e && e.__esModule ? e : { default: e };
}
var Np = [["command", Pp.default], ["composite", qp.default], ["input", wp.default], ["landmark", xp.default], ["range", Sp.default], ["roletype", Tp.default], ["section", $p.default], ["sectionhead", Op.default], ["select", Mp.default], ["structure", Ap.default], ["widget", Ip.default], ["window", Bp.default]], Lp = Np;
Vr.default = Lp;
var ot = {}, lt = {};
Object.defineProperty(lt, "__esModule", {
  value: !0
});
lt.default = void 0;
var kp = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-atomic": "true",
    "aria-live": "assertive"
  },
  relatedConcepts: [{
    concept: {
      name: "alert"
    },
    module: "XForms"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Fp = kp;
lt.default = Fp;
var it = {};
Object.defineProperty(it, "__esModule", {
  value: !0
});
it.default = void 0;
var Dp = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "alert"
    },
    module: "XForms"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "alert"], ["roletype", "window", "dialog"]]
}, jp = Dp;
it.default = jp;
var ut = {};
Object.defineProperty(ut, "__esModule", {
  value: !0
});
ut.default = void 0;
var Hp = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-activedescendant": null,
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "Device Independence Delivery Unit"
    }
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, Up = Hp;
ut.default = Up;
var st = {};
Object.defineProperty(st, "__esModule", {
  value: !0
});
st.default = void 0;
var zp = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-posinset": null,
    "aria-setsize": null
  },
  relatedConcepts: [{
    concept: {
      name: "article"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "document"]]
}, Wp = zp;
st.default = Wp;
var ct = {};
Object.defineProperty(ct, "__esModule", {
  value: !0
});
ct.default = void 0;
var Vp = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      constraints: ["direct descendant of document"],
      name: "header"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Gp = Vp;
ct.default = Gp;
var dt = {};
Object.defineProperty(dt, "__esModule", {
  value: !0
});
dt.default = void 0;
var Yp = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Kp = Yp;
dt.default = Kp;
var ft = {};
Object.defineProperty(ft, "__esModule", {
  value: !0
});
ft.default = void 0;
var Xp = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-pressed": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "aria-pressed"
      }, {
        name: "type",
        value: "checkbox"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "aria-expanded",
        value: "false"
      }],
      name: "summary"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "aria-expanded",
        value: "true"
      }],
      constraints: ["direct descendant of details element with the open attribute defined"],
      name: "summary"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "type",
        value: "button"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "type",
        value: "image"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "type",
        value: "reset"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "type",
        value: "submit"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      name: "button"
    },
    module: "HTML"
  }, {
    concept: {
      name: "trigger"
    },
    module: "XForms"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command"]]
}, Jp = Xp;
ft.default = Jp;
var pt = {};
Object.defineProperty(pt, "__esModule", {
  value: !0
});
pt.default = void 0;
var Qp = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: ["figure", "grid", "table"],
  requiredContextRole: ["figure", "grid", "table"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Zp = Qp;
pt.default = Zp;
var mt = {};
Object.defineProperty(mt, "__esModule", {
  value: !0
});
mt.default = void 0;
var em = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-colindex": null,
    "aria-colspan": null,
    "aria-rowindex": null,
    "aria-rowspan": null
  },
  relatedConcepts: [{
    concept: {
      constraints: ["descendant of table"],
      name: "td"
    },
    module: "HTML"
  }],
  requireContextRole: ["row"],
  requiredContextRole: ["row"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, rm = em;
mt.default = rm;
var vt = {};
Object.defineProperty(vt, "__esModule", {
  value: !0
});
vt.default = void 0;
var tm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-checked": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-invalid": null,
    "aria-readonly": null,
    "aria-required": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "type",
        value: "checkbox"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      name: "option"
    },
    module: "ARIA"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-checked": null
  },
  superClass: [["roletype", "widget", "input"]]
}, am = tm;
vt.default = am;
var bt = {};
Object.defineProperty(bt, "__esModule", {
  value: !0
});
bt.default = void 0;
var nm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, om = nm;
bt.default = om;
var yt = {};
Object.defineProperty(yt, "__esModule", {
  value: !0
});
yt.default = void 0;
var lm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-sort": null
  },
  relatedConcepts: [{
    attributes: [{
      name: "scope",
      value: "col"
    }],
    concept: {
      name: "th"
    },
    module: "HTML"
  }],
  requireContextRole: ["row"],
  requiredContextRole: ["row"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "cell"], ["roletype", "structure", "section", "cell", "gridcell"], ["roletype", "widget", "gridcell"], ["roletype", "structure", "sectionhead"]]
}, im = lm;
yt.default = im;
var ht = {};
Object.defineProperty(ht, "__esModule", {
  value: !0
});
ht.default = void 0;
var um = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-activedescendant": null,
    "aria-autocomplete": null,
    "aria-errormessage": null,
    "aria-invalid": null,
    "aria-readonly": null,
    "aria-required": null,
    "aria-expanded": "false",
    "aria-haspopup": "listbox"
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "list"
      }, {
        name: "type",
        value: "email"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "list"
      }, {
        name: "type",
        value: "search"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "list"
      }, {
        name: "type",
        value: "tel"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "list"
      }, {
        name: "type",
        value: "text"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "list"
      }, {
        name: "type",
        value: "url"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "list"
      }, {
        name: "type",
        value: "url"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "multiple"
      }, {
        constraints: ["undefined"],
        name: "size"
      }],
      name: "select"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "multiple"
      }, {
        name: "size",
        value: 1
      }],
      name: "select"
    },
    module: "HTML"
  }, {
    concept: {
      name: "select"
    },
    module: "XForms"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-controls": null,
    "aria-expanded": "false"
  },
  superClass: [["roletype", "widget", "input"]]
}, sm = um;
ht.default = sm;
var gt = {};
Object.defineProperty(gt, "__esModule", {
  value: !0
});
gt.default = void 0;
var cm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "aside"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, dm = cm;
gt.default = dm;
var Rt = {};
Object.defineProperty(Rt, "__esModule", {
  value: !0
});
Rt.default = void 0;
var fm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      constraints: ["direct descendant of document"],
      name: "footer"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, pm = fm;
Rt.default = pm;
var _t = {};
Object.defineProperty(_t, "__esModule", {
  value: !0
});
_t.default = void 0;
var mm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "dd"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, vm = mm;
_t.default = vm;
var Ct = {};
Object.defineProperty(Ct, "__esModule", {
  value: !0
});
Ct.default = void 0;
var bm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, ym = bm;
Ct.default = ym;
var Et = {};
Object.defineProperty(Et, "__esModule", {
  value: !0
});
Et.default = void 0;
var hm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "dialog"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "window"]]
}, gm = hm;
Et.default = gm;
var Pt = {};
Object.defineProperty(Pt, "__esModule", {
  value: !0
});
Pt.default = void 0;
var Rm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    module: "DAISY Guide"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "list"]]
}, _m = Rm;
Pt.default = _m;
var qt = {};
Object.defineProperty(qt, "__esModule", {
  value: !0
});
qt.default = void 0;
var Cm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "Device Independence Delivery Unit"
    }
  }, {
    concept: {
      name: "body"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, Em = Cm;
qt.default = Em;
var wt = {};
Object.defineProperty(wt, "__esModule", {
  value: !0
});
wt.default = void 0;
var Pm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, qm = Pm;
wt.default = qm;
var xt = {};
Object.defineProperty(xt, "__esModule", {
  value: !0
});
xt.default = void 0;
var wm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["article"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "list"]]
}, xm = wm;
xt.default = xm;
var St = {};
Object.defineProperty(St, "__esModule", {
  value: !0
});
St.default = void 0;
var Sm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "figure"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Tm = Sm;
St.default = Tm;
var Tt = {};
Object.defineProperty(Tt, "__esModule", {
  value: !0
});
Tt.default = void 0;
var $m = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "aria-label"
      }],
      name: "form"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "aria-labelledby"
      }],
      name: "form"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "name"
      }],
      name: "form"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Om = $m;
Tt.default = Om;
var $t = {};
Object.defineProperty($t, "__esModule", {
  value: !0
});
$t.default = void 0;
var Mm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "span"
    },
    module: "HTML"
  }, {
    concept: {
      name: "div"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, Am = Mm;
$t.default = Am;
var Ot = {};
Object.defineProperty(Ot, "__esModule", {
  value: !0
});
Ot.default = void 0;
var Im = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-multiselectable": null,
    "aria-readonly": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "role",
        value: "grid"
      }],
      name: "table"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["row"], ["row", "rowgroup"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite"], ["roletype", "structure", "section", "table"]]
}, Bm = Im;
Ot.default = Bm;
var Mt = {};
Object.defineProperty(Mt, "__esModule", {
  value: !0
});
Mt.default = void 0;
var Nm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null,
    "aria-readonly": null,
    "aria-required": null,
    "aria-selected": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "role",
        value: "gridcell"
      }],
      name: "td"
    },
    module: "HTML"
  }],
  requireContextRole: ["row"],
  requiredContextRole: ["row"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "cell"], ["roletype", "widget"]]
}, Lm = Nm;
Mt.default = Lm;
var At = {};
Object.defineProperty(At, "__esModule", {
  value: !0
});
At.default = void 0;
var km = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-activedescendant": null,
    "aria-disabled": null
  },
  relatedConcepts: [{
    concept: {
      name: "details"
    },
    module: "HTML"
  }, {
    concept: {
      name: "fieldset"
    },
    module: "HTML"
  }, {
    concept: {
      name: "optgroup"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Fm = km;
At.default = Fm;
var It = {};
Object.defineProperty(It, "__esModule", {
  value: !0
});
It.default = void 0;
var Dm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-level": "2"
  },
  relatedConcepts: [{
    concept: {
      name: "h1"
    },
    module: "HTML"
  }, {
    concept: {
      name: "h2"
    },
    module: "HTML"
  }, {
    concept: {
      name: "h3"
    },
    module: "HTML"
  }, {
    concept: {
      name: "h4"
    },
    module: "HTML"
  }, {
    concept: {
      name: "h5"
    },
    module: "HTML"
  }, {
    concept: {
      name: "h6"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-level": "2"
  },
  superClass: [["roletype", "structure", "sectionhead"]]
}, jm = Dm;
It.default = jm;
var Bt = {};
Object.defineProperty(Bt, "__esModule", {
  value: !0
});
Bt.default = void 0;
var Hm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "alt"
      }],
      name: "img"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "alt"
      }],
      name: "img"
    },
    module: "HTML"
  }, {
    concept: {
      name: "imggroup"
    },
    module: "DTB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Um = Hm;
Bt.default = Um;
var Nt = {};
Object.defineProperty(Nt, "__esModule", {
  value: !0
});
Nt.default = void 0;
var zm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Wm = zm;
Nt.default = Wm;
var Lt = {};
Object.defineProperty(Lt, "__esModule", {
  value: !0
});
Lt.default = void 0;
var Vm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-expanded": null,
    "aria-haspopup": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "href"
      }],
      name: "a"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "href"
      }],
      name: "area"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "href"
      }],
      name: "link"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command"]]
}, Gm = Vm;
Lt.default = Gm;
var kt = {};
Object.defineProperty(kt, "__esModule", {
  value: !0
});
kt.default = void 0;
var Ym = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "menu"
    },
    module: "HTML"
  }, {
    concept: {
      name: "ol"
    },
    module: "HTML"
  }, {
    concept: {
      name: "ul"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["listitem"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Km = Ym;
kt.default = Km;
var Ft = {};
Object.defineProperty(Ft, "__esModule", {
  value: !0
});
Ft.default = void 0;
var Xm = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-invalid": null,
    "aria-multiselectable": null,
    "aria-readonly": null,
    "aria-required": null,
    "aria-orientation": "vertical"
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: [">1"],
        name: "size"
      }, {
        name: "multiple"
      }],
      name: "select"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: [">1"],
        name: "size"
      }],
      name: "select"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "multiple"
      }],
      name: "select"
    },
    module: "HTML"
  }, {
    concept: {
      name: "datalist"
    },
    module: "HTML"
  }, {
    concept: {
      name: "list"
    },
    module: "ARIA"
  }, {
    concept: {
      name: "select"
    },
    module: "XForms"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["option", "group"], ["option"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
}, Jm = Xm;
Ft.default = Jm;
var Dt = {};
Object.defineProperty(Dt, "__esModule", {
  value: !0
});
Dt.default = void 0;
var Qm = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-level": null,
    "aria-posinset": null,
    "aria-setsize": null
  },
  relatedConcepts: [{
    concept: {
      constraints: ["direct descendant of ol, ul or menu"],
      name: "li"
    },
    module: "HTML"
  }, {
    concept: {
      name: "item"
    },
    module: "XForms"
  }],
  requireContextRole: ["directory", "list"],
  requiredContextRole: ["directory", "list"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Zm = Qm;
Dt.default = Zm;
var jt = {};
Object.defineProperty(jt, "__esModule", {
  value: !0
});
jt.default = void 0;
var ev = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-live": "polite"
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, rv = ev;
jt.default = rv;
var Ht = {};
Object.defineProperty(Ht, "__esModule", {
  value: !0
});
Ht.default = void 0;
var tv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "main"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, av = tv;
Ht.default = av;
var Ut = {};
Object.defineProperty(Ut, "__esModule", {
  value: !0
});
Ut.default = void 0;
var nv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, ov = nv;
Ut.default = ov;
var zt = {};
Object.defineProperty(zt, "__esModule", {
  value: !0
});
zt.default = void 0;
var lv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "math"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, iv = lv;
zt.default = iv;
var Wt = {};
Object.defineProperty(Wt, "__esModule", {
  value: !0
});
Wt.default = void 0;
var uv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-orientation": "vertical"
  },
  relatedConcepts: [{
    concept: {
      name: "MENU"
    },
    module: "JAPI"
  }, {
    concept: {
      name: "list"
    },
    module: "ARIA"
  }, {
    concept: {
      name: "select"
    },
    module: "XForms"
  }, {
    concept: {
      name: "sidebar"
    },
    module: "DTB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["menuitem", "group"], ["menuitemradio", "group"], ["menuitemcheckbox", "group"], ["menuitem"], ["menuitemcheckbox"], ["menuitemradio"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
}, sv = uv;
Wt.default = sv;
var Vt = {};
Object.defineProperty(Vt, "__esModule", {
  value: !0
});
Vt.default = void 0;
var cv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-orientation": "horizontal"
  },
  relatedConcepts: [{
    concept: {
      name: "toolbar"
    },
    module: "ARIA"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["menuitem", "group"], ["menuitemradio", "group"], ["menuitemcheckbox", "group"], ["menuitem"], ["menuitemcheckbox"], ["menuitemradio"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite", "select", "menu"], ["roletype", "structure", "section", "group", "select", "menu"]]
}, dv = cv;
Vt.default = dv;
var Gt = {};
Object.defineProperty(Gt, "__esModule", {
  value: !0
});
Gt.default = void 0;
var fv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-posinset": null,
    "aria-setsize": null
  },
  relatedConcepts: [{
    concept: {
      name: "MENU_ITEM"
    },
    module: "JAPI"
  }, {
    concept: {
      name: "listitem"
    },
    module: "ARIA"
  }, {
    concept: {
      name: "menuitem"
    },
    module: "HTML"
  }, {
    concept: {
      name: "option"
    },
    module: "ARIA"
  }],
  requireContextRole: ["group", "menu", "menubar"],
  requiredContextRole: ["group", "menu", "menubar"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command"]]
}, pv = fv;
Gt.default = pv;
var Yt = {};
Object.defineProperty(Yt, "__esModule", {
  value: !0
});
Yt.default = void 0;
var mv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "menuitem"
    },
    module: "ARIA"
  }],
  requireContextRole: ["group", "menu", "menubar"],
  requiredContextRole: ["group", "menu", "menubar"],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-checked": null
  },
  superClass: [["roletype", "widget", "input", "checkbox"], ["roletype", "widget", "command", "menuitem"]]
}, vv = mv;
Yt.default = vv;
var Kt = {};
Object.defineProperty(Kt, "__esModule", {
  value: !0
});
Kt.default = void 0;
var bv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "menuitem"
    },
    module: "ARIA"
  }],
  requireContextRole: ["group", "menu", "menubar"],
  requiredContextRole: ["group", "menu", "menubar"],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-checked": null
  },
  superClass: [["roletype", "widget", "input", "checkbox", "menuitemcheckbox"], ["roletype", "widget", "command", "menuitem", "menuitemcheckbox"], ["roletype", "widget", "input", "radio"]]
}, yv = bv;
Kt.default = yv;
var Xt = {};
Object.defineProperty(Xt, "__esModule", {
  value: !0
});
Xt.default = void 0;
var hv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-valuetext": null,
    "aria-valuemax": "100",
    "aria-valuemin": "0"
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-valuenow": null
  },
  superClass: [["roletype", "structure", "range"]]
}, gv = hv;
Xt.default = gv;
var Jt = {};
Object.defineProperty(Jt, "__esModule", {
  value: !0
});
Jt.default = void 0;
var Rv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "nav"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, _v = Rv;
Jt.default = _v;
var Qt = {};
Object.defineProperty(Qt, "__esModule", {
  value: !0
});
Qt.default = void 0;
var Cv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: [],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: []
}, Ev = Cv;
Qt.default = Ev;
var Zt = {};
Object.defineProperty(Zt, "__esModule", {
  value: !0
});
Zt.default = void 0;
var Pv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, qv = Pv;
Zt.default = qv;
var ea = {};
Object.defineProperty(ea, "__esModule", {
  value: !0
});
ea.default = void 0;
var wv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-checked": null,
    "aria-posinset": null,
    "aria-setsize": null,
    "aria-selected": "false"
  },
  relatedConcepts: [{
    concept: {
      name: "item"
    },
    module: "XForms"
  }, {
    concept: {
      name: "listitem"
    },
    module: "ARIA"
  }, {
    concept: {
      name: "option"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-selected": "false"
  },
  superClass: [["roletype", "widget", "input"]]
}, xv = wv;
ea.default = xv;
var ra = {};
Object.defineProperty(ra, "__esModule", {
  value: !0
});
ra.default = void 0;
var Sv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Tv = Sv;
ra.default = Tv;
var ta = {};
Object.defineProperty(ta, "__esModule", {
  value: !0
});
ta.default = void 0;
var $v = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, Ov = $v;
ta.default = Ov;
var aa = {};
Object.defineProperty(aa, "__esModule", {
  value: !0
});
aa.default = void 0;
var Mv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-valuetext": null
  },
  relatedConcepts: [{
    concept: {
      name: "progress"
    },
    module: "HTML"
  }, {
    concept: {
      name: "status"
    },
    module: "ARIA"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "range"], ["roletype", "widget"]]
}, Av = Mv;
aa.default = Av;
var na = {};
Object.defineProperty(na, "__esModule", {
  value: !0
});
na.default = void 0;
var Iv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-checked": null,
    "aria-posinset": null,
    "aria-setsize": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "type",
        value: "radio"
      }],
      name: "input"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-checked": null
  },
  superClass: [["roletype", "widget", "input"]]
}, Bv = Iv;
na.default = Bv;
var oa = {};
Object.defineProperty(oa, "__esModule", {
  value: !0
});
oa.default = void 0;
var Nv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null,
    "aria-readonly": null,
    "aria-required": null
  },
  relatedConcepts: [{
    concept: {
      name: "list"
    },
    module: "ARIA"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["radio"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
}, Lv = Nv;
oa.default = Lv;
var la = {};
Object.defineProperty(la, "__esModule", {
  value: !0
});
la.default = void 0;
var kv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "aria-label"
      }],
      name: "section"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["set"],
        name: "aria-labelledby"
      }],
      name: "section"
    },
    module: "HTML"
  }, {
    concept: {
      name: "Device Independence Glossart perceivable unit"
    }
  }, {
    concept: {
      name: "frame"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Fv = kv;
la.default = Fv;
var ia = {};
Object.defineProperty(ia, "__esModule", {
  value: !0
});
ia.default = void 0;
var Dv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-colindex": null,
    "aria-expanded": null,
    "aria-level": null,
    "aria-posinset": null,
    "aria-rowindex": null,
    "aria-selected": null,
    "aria-setsize": null
  },
  relatedConcepts: [{
    concept: {
      name: "tr"
    },
    module: "HTML"
  }],
  requireContextRole: ["grid", "rowgroup", "table", "treegrid"],
  requiredContextRole: ["grid", "rowgroup", "table", "treegrid"],
  requiredOwnedElements: [["cell"], ["columnheader"], ["gridcell"], ["rowheader"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "group"], ["roletype", "widget"]]
}, jv = Dv;
ia.default = jv;
var ua = {};
Object.defineProperty(ua, "__esModule", {
  value: !0
});
ua.default = void 0;
var Hv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "tbody"
    },
    module: "HTML"
  }, {
    concept: {
      name: "tfoot"
    },
    module: "HTML"
  }, {
    concept: {
      name: "thead"
    },
    module: "HTML"
  }],
  requireContextRole: ["grid", "table", "treegrid"],
  requiredContextRole: ["grid", "table", "treegrid"],
  requiredOwnedElements: [["row"]],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, Uv = Hv;
ua.default = Uv;
var sa = {};
Object.defineProperty(sa, "__esModule", {
  value: !0
});
sa.default = void 0;
var zv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-sort": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "scope",
        value: "row"
      }],
      name: "th"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        name: "scope",
        value: "rowgroup"
      }],
      name: "th"
    },
    module: "HTML"
  }],
  requireContextRole: ["row", "rowgroup"],
  requiredContextRole: ["row", "rowgroup"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "cell"], ["roletype", "structure", "section", "cell", "gridcell"], ["roletype", "widget", "gridcell"], ["roletype", "structure", "sectionhead"]]
}, Wv = zv;
sa.default = Wv;
var ca = {};
Object.defineProperty(ca, "__esModule", {
  value: !0
});
ca.default = void 0;
var Vv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-valuetext": null,
    "aria-orientation": "vertical",
    "aria-valuemax": "100",
    "aria-valuemin": "0"
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-controls": null,
    "aria-valuenow": null
  },
  superClass: [["roletype", "structure", "range"], ["roletype", "widget"]]
}, Gv = Vv;
ca.default = Gv;
var da = {};
Object.defineProperty(da, "__esModule", {
  value: !0
});
da.default = void 0;
var Yv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Kv = Yv;
da.default = Kv;
var fa = {};
Object.defineProperty(fa, "__esModule", {
  value: !0
});
fa.default = void 0;
var Xv = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "list"
      }, {
        name: "type",
        value: "search"
      }],
      name: "input"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "input", "textbox"]]
}, Jv = Xv;
fa.default = Jv;
var pa = {};
Object.defineProperty(pa, "__esModule", {
  value: !0
});
pa.default = void 0;
var Qv = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-orientation": "horizontal",
    "aria-valuemax": "100",
    "aria-valuemin": "0",
    "aria-valuenow": null,
    "aria-valuetext": null
  },
  relatedConcepts: [{
    concept: {
      name: "hr"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure"]]
}, Zv = Qv;
pa.default = Zv;
var ma = {};
Object.defineProperty(ma, "__esModule", {
  value: !0
});
ma.default = void 0;
var eb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-haspopup": null,
    "aria-invalid": null,
    "aria-readonly": null,
    "aria-valuetext": null,
    "aria-orientation": "horizontal",
    "aria-valuemax": "100",
    "aria-valuemin": "0"
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "type",
        value: "range"
      }],
      name: "input"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-valuenow": null
  },
  superClass: [["roletype", "widget", "input"], ["roletype", "structure", "range"]]
}, rb = eb;
ma.default = rb;
var va = {};
Object.defineProperty(va, "__esModule", {
  value: !0
});
va.default = void 0;
var tb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null,
    "aria-readonly": null,
    "aria-required": null,
    "aria-valuetext": null,
    "aria-valuenow": "0"
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        name: "type",
        value: "number"
      }],
      name: "input"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite"], ["roletype", "widget", "input"], ["roletype", "structure", "range"]]
}, ab = tb;
va.default = ab;
var ba = {};
Object.defineProperty(ba, "__esModule", {
  value: !0
});
ba.default = void 0;
var nb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-atomic": "true",
    "aria-live": "polite"
  },
  relatedConcepts: [{
    concept: {
      name: "output"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, ob = nb;
ba.default = ob;
var ya = {};
Object.defineProperty(ya, "__esModule", {
  value: !0
});
ya.default = void 0;
var lb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, ib = lb;
ya.default = ib;
var ha = {};
Object.defineProperty(ha, "__esModule", {
  value: !0
});
ha.default = void 0;
var ub = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, sb = ub;
ha.default = sb;
var ga = {};
Object.defineProperty(ga, "__esModule", {
  value: !0
});
ga.default = void 0;
var cb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["prohibited"],
  prohibitedProps: ["aria-label", "aria-labelledby"],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, db = cb;
ga.default = db;
var Ra = {};
Object.defineProperty(Ra, "__esModule", {
  value: !0
});
Ra.default = void 0;
var fb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "button"
    },
    module: "ARIA"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-checked": null
  },
  superClass: [["roletype", "widget", "input", "checkbox"]]
}, pb = fb;
Ra.default = pb;
var _a = {};
Object.defineProperty(_a, "__esModule", {
  value: !0
});
_a.default = void 0;
var mb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-posinset": null,
    "aria-setsize": null,
    "aria-selected": "false"
  },
  relatedConcepts: [],
  requireContextRole: ["tablist"],
  requiredContextRole: ["tablist"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "sectionhead"], ["roletype", "widget"]]
}, vb = mb;
_a.default = vb;
var Ca = {};
Object.defineProperty(Ca, "__esModule", {
  value: !0
});
Ca.default = void 0;
var bb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-colcount": null,
    "aria-rowcount": null
  },
  relatedConcepts: [{
    concept: {
      name: "table"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["row"], ["row", "rowgroup"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, yb = bb;
Ca.default = yb;
var Ea = {};
Object.defineProperty(Ea, "__esModule", {
  value: !0
});
Ea.default = void 0;
var hb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-level": null,
    "aria-multiselectable": null,
    "aria-orientation": "horizontal"
  },
  relatedConcepts: [{
    module: "DAISY",
    concept: {
      name: "guide"
    }
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["tab"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite"]]
}, gb = hb;
Ea.default = gb;
var Pa = {};
Object.defineProperty(Pa, "__esModule", {
  value: !0
});
Pa.default = void 0;
var Rb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, _b = Rb;
Pa.default = _b;
var qa = {};
Object.defineProperty(qa, "__esModule", {
  value: !0
});
qa.default = void 0;
var Cb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "dfn"
    },
    module: "HTML"
  }, {
    concept: {
      name: "dt"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Eb = Cb;
qa.default = Eb;
var wa = {};
Object.defineProperty(wa, "__esModule", {
  value: !0
});
wa.default = void 0;
var Pb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-activedescendant": null,
    "aria-autocomplete": null,
    "aria-errormessage": null,
    "aria-haspopup": null,
    "aria-invalid": null,
    "aria-multiline": null,
    "aria-placeholder": null,
    "aria-readonly": null,
    "aria-required": null
  },
  relatedConcepts: [{
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "type"
      }, {
        constraints: ["undefined"],
        name: "list"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "list"
      }, {
        name: "type",
        value: "email"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "list"
      }, {
        name: "type",
        value: "tel"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "list"
      }, {
        name: "type",
        value: "text"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      attributes: [{
        constraints: ["undefined"],
        name: "list"
      }, {
        name: "type",
        value: "url"
      }],
      name: "input"
    },
    module: "HTML"
  }, {
    concept: {
      name: "input"
    },
    module: "XForms"
  }, {
    concept: {
      name: "textarea"
    },
    module: "HTML"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "input"]]
}, qb = Pb;
wa.default = qb;
var xa = {};
Object.defineProperty(xa, "__esModule", {
  value: !0
});
xa.default = void 0;
var wb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, xb = wb;
xa.default = xb;
var Sa = {};
Object.defineProperty(Sa, "__esModule", {
  value: !0
});
Sa.default = void 0;
var Sb = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "status"]]
}, Tb = Sb;
Sa.default = Tb;
var Ta = {};
Object.defineProperty(Ta, "__esModule", {
  value: !0
});
Ta.default = void 0;
var $b = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-orientation": "horizontal"
  },
  relatedConcepts: [{
    concept: {
      name: "menubar"
    },
    module: "ARIA"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "group"]]
}, Ob = $b;
Ta.default = Ob;
var $a = {};
Object.defineProperty($a, "__esModule", {
  value: !0
});
$a.default = void 0;
var Mb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Ab = Mb;
$a.default = Ab;
var Oa = {};
Object.defineProperty(Oa, "__esModule", {
  value: !0
});
Oa.default = void 0;
var Ib = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null,
    "aria-multiselectable": null,
    "aria-required": null,
    "aria-orientation": "vertical"
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["treeitem", "group"], ["treeitem"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
}, Bb = Ib;
Oa.default = Bb;
var Ma = {};
Object.defineProperty(Ma, "__esModule", {
  value: !0
});
Ma.default = void 0;
var Nb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["row"], ["row", "rowgroup"]],
  requiredProps: {},
  superClass: [["roletype", "widget", "composite", "grid"], ["roletype", "structure", "section", "table", "grid"], ["roletype", "widget", "composite", "select", "tree"], ["roletype", "structure", "section", "group", "select", "tree"]]
}, Lb = Nb;
Ma.default = Lb;
var Aa = {};
Object.defineProperty(Aa, "__esModule", {
  value: !0
});
Aa.default = void 0;
var kb = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-expanded": null,
    "aria-haspopup": null
  },
  relatedConcepts: [],
  requireContextRole: ["group", "tree"],
  requiredContextRole: ["group", "tree"],
  requiredOwnedElements: [],
  requiredProps: {
    "aria-selected": null
  },
  superClass: [["roletype", "structure", "section", "listitem"], ["roletype", "widget", "input", "option"]]
}, Fb = kb;
Aa.default = Fb;
Object.defineProperty(ot, "__esModule", {
  value: !0
});
ot.default = void 0;
var Db = v(lt), jb = v(it), Hb = v(ut), Ub = v(st), zb = v(ct), Wb = v(dt), Vb = v(ft), Gb = v(pt), Yb = v(mt), Kb = v(vt), Xb = v(bt), Jb = v(yt), Qb = v(ht), Zb = v(gt), ey = v(Rt), ry = v(_t), ty = v(Ct), ay = v(Et), ny = v(Pt), oy = v(qt), ly = v(wt), iy = v(xt), uy = v(St), sy = v(Tt), cy = v($t), dy = v(Ot), fy = v(Mt), py = v(At), my = v(It), vy = v(Bt), by = v(Nt), yy = v(Lt), hy = v(kt), gy = v(Ft), Ry = v(Dt), _y = v(jt), Cy = v(Ht), Ey = v(Ut), Py = v(zt), qy = v(Wt), wy = v(Vt), xy = v(Gt), Sy = v(Yt), Ty = v(Kt), $y = v(Xt), Oy = v(Jt), My = v(Qt), Ay = v(Zt), Iy = v(ea), By = v(ra), Ny = v(ta), Ly = v(aa), ky = v(na), Fy = v(oa), Dy = v(la), jy = v(ia), Hy = v(ua), Uy = v(sa), zy = v(ca), Wy = v(da), Vy = v(fa), Gy = v(pa), Yy = v(ma), Ky = v(va), Xy = v(ba), Jy = v(ya), Qy = v(ha), Zy = v(ga), eh = v(Ra), rh = v(_a), th = v(Ca), ah = v(Ea), nh = v(Pa), oh = v(qa), lh = v(wa), ih = v(xa), uh = v(Sa), sh = v(Ta), ch = v($a), dh = v(Oa), fh = v(Ma), ph = v(Aa);
function v(e) {
  return e && e.__esModule ? e : { default: e };
}
var mh = [["alert", Db.default], ["alertdialog", jb.default], ["application", Hb.default], ["article", Ub.default], ["banner", zb.default], ["blockquote", Wb.default], ["button", Vb.default], ["caption", Gb.default], ["cell", Yb.default], ["checkbox", Kb.default], ["code", Xb.default], ["columnheader", Jb.default], ["combobox", Qb.default], ["complementary", Zb.default], ["contentinfo", ey.default], ["definition", ry.default], ["deletion", ty.default], ["dialog", ay.default], ["directory", ny.default], ["document", oy.default], ["emphasis", ly.default], ["feed", iy.default], ["figure", uy.default], ["form", sy.default], ["generic", cy.default], ["grid", dy.default], ["gridcell", fy.default], ["group", py.default], ["heading", my.default], ["img", vy.default], ["insertion", by.default], ["link", yy.default], ["list", hy.default], ["listbox", gy.default], ["listitem", Ry.default], ["log", _y.default], ["main", Cy.default], ["marquee", Ey.default], ["math", Py.default], ["menu", qy.default], ["menubar", wy.default], ["menuitem", xy.default], ["menuitemcheckbox", Sy.default], ["menuitemradio", Ty.default], ["meter", $y.default], ["navigation", Oy.default], ["none", My.default], ["note", Ay.default], ["option", Iy.default], ["paragraph", By.default], ["presentation", Ny.default], ["progressbar", Ly.default], ["radio", ky.default], ["radiogroup", Fy.default], ["region", Dy.default], ["row", jy.default], ["rowgroup", Hy.default], ["rowheader", Uy.default], ["scrollbar", zy.default], ["search", Wy.default], ["searchbox", Vy.default], ["separator", Gy.default], ["slider", Yy.default], ["spinbutton", Ky.default], ["status", Xy.default], ["strong", Jy.default], ["subscript", Qy.default], ["superscript", Zy.default], ["switch", eh.default], ["tab", rh.default], ["table", th.default], ["tablist", ah.default], ["tabpanel", nh.default], ["term", oh.default], ["textbox", lh.default], ["time", ih.default], ["timer", uh.default], ["toolbar", sh.default], ["tooltip", ch.default], ["tree", dh.default], ["treegrid", fh.default], ["treeitem", ph.default]], vh = mh;
ot.default = vh;
var Ia = {}, Ba = {};
Object.defineProperty(Ba, "__esModule", {
  value: !0
});
Ba.default = void 0;
var bh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "abstract [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, yh = bh;
Ba.default = yh;
var Na = {};
Object.defineProperty(Na, "__esModule", {
  value: !0
});
Na.default = void 0;
var hh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "acknowledgments [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, gh = hh;
Na.default = gh;
var La = {};
Object.defineProperty(La, "__esModule", {
  value: !0
});
La.default = void 0;
var Rh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "afterword [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, _h = Rh;
La.default = _h;
var ka = {};
Object.defineProperty(ka, "__esModule", {
  value: !0
});
ka.default = void 0;
var Ch = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "appendix [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Eh = Ch;
ka.default = Eh;
var Fa = {};
Object.defineProperty(Fa, "__esModule", {
  value: !0
});
Fa.default = void 0;
var Ph = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "content"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "referrer [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command", "link"]]
}, qh = Ph;
Fa.default = qh;
var Da = {};
Object.defineProperty(Da, "__esModule", {
  value: !0
});
Da.default = void 0;
var wh = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "EPUB biblioentry [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: ["doc-bibliography"],
  requiredContextRole: ["doc-bibliography"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "listitem"]]
}, xh = wh;
Da.default = xh;
var ja = {};
Object.defineProperty(ja, "__esModule", {
  value: !0
});
ja.default = void 0;
var Sh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "bibliography [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["doc-biblioentry"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Th = Sh;
ja.default = Th;
var Ha = {};
Object.defineProperty(Ha, "__esModule", {
  value: !0
});
Ha.default = void 0;
var $h = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "biblioref [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command", "link"]]
}, Oh = $h;
Ha.default = Oh;
var Ua = {};
Object.defineProperty(Ua, "__esModule", {
  value: !0
});
Ua.default = void 0;
var Mh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "chapter [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Ah = Mh;
Ua.default = Ah;
var za = {};
Object.defineProperty(za, "__esModule", {
  value: !0
});
za.default = void 0;
var Ih = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "colophon [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Bh = Ih;
za.default = Bh;
var Wa = {};
Object.defineProperty(Wa, "__esModule", {
  value: !0
});
Wa.default = void 0;
var Nh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "conclusion [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Lh = Nh;
Wa.default = Lh;
var Va = {};
Object.defineProperty(Va, "__esModule", {
  value: !0
});
Va.default = void 0;
var kh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "cover [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "img"]]
}, Fh = kh;
Va.default = Fh;
var Ga = {};
Object.defineProperty(Ga, "__esModule", {
  value: !0
});
Ga.default = void 0;
var Dh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "credit [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, jh = Dh;
Ga.default = jh;
var Ya = {};
Object.defineProperty(Ya, "__esModule", {
  value: !0
});
Ya.default = void 0;
var Hh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "credits [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Uh = Hh;
Ya.default = Uh;
var Ka = {};
Object.defineProperty(Ka, "__esModule", {
  value: !0
});
Ka.default = void 0;
var zh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "dedication [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Wh = zh;
Ka.default = Wh;
var Xa = {};
Object.defineProperty(Xa, "__esModule", {
  value: !0
});
Xa.default = void 0;
var Vh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "rearnote [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: ["doc-endnotes"],
  requiredContextRole: ["doc-endnotes"],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "listitem"]]
}, Gh = Vh;
Xa.default = Gh;
var Ja = {};
Object.defineProperty(Ja, "__esModule", {
  value: !0
});
Ja.default = void 0;
var Yh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "rearnotes [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["doc-endnote"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Kh = Yh;
Ja.default = Kh;
var Qa = {};
Object.defineProperty(Qa, "__esModule", {
  value: !0
});
Qa.default = void 0;
var Xh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "epigraph [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Jh = Xh;
Qa.default = Jh;
var Za = {};
Object.defineProperty(Za, "__esModule", {
  value: !0
});
Za.default = void 0;
var Qh = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "epilogue [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Zh = Qh;
Za.default = Zh;
var en = {};
Object.defineProperty(en, "__esModule", {
  value: !0
});
en.default = void 0;
var eg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "errata [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, rg = eg;
en.default = rg;
var rn = {};
Object.defineProperty(rn, "__esModule", {
  value: !0
});
rn.default = void 0;
var tg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, ag = tg;
rn.default = ag;
var tn = {};
Object.defineProperty(tn, "__esModule", {
  value: !0
});
tn.default = void 0;
var ng = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "footnote [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, og = ng;
tn.default = og;
var an = {};
Object.defineProperty(an, "__esModule", {
  value: !0
});
an.default = void 0;
var lg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "foreword [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, ig = lg;
an.default = ig;
var nn = {};
Object.defineProperty(nn, "__esModule", {
  value: !0
});
nn.default = void 0;
var ug = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "glossary [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [["definition"], ["term"]],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, sg = ug;
nn.default = sg;
var on = {};
Object.defineProperty(on, "__esModule", {
  value: !0
});
on.default = void 0;
var cg = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "glossref [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command", "link"]]
}, dg = cg;
on.default = dg;
var ln = {};
Object.defineProperty(ln, "__esModule", {
  value: !0
});
ln.default = void 0;
var fg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "index [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark", "navigation"]]
}, pg = fg;
ln.default = pg;
var un = {};
Object.defineProperty(un, "__esModule", {
  value: !0
});
un.default = void 0;
var mg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "introduction [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, vg = mg;
un.default = vg;
var sn = {};
Object.defineProperty(sn, "__esModule", {
  value: !0
});
sn.default = void 0;
var bg = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "noteref [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "widget", "command", "link"]]
}, yg = bg;
sn.default = yg;
var cn = {};
Object.defineProperty(cn, "__esModule", {
  value: !0
});
cn.default = void 0;
var hg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "notice [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "note"]]
}, gg = hg;
cn.default = gg;
var dn = {};
Object.defineProperty(dn, "__esModule", {
  value: !0
});
dn.default = void 0;
var Rg = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "pagebreak [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "separator"]]
}, _g = Rg;
dn.default = _g;
var fn = {};
Object.defineProperty(fn, "__esModule", {
  value: !0
});
fn.default = void 0;
var Cg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "page-list [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark", "navigation"]]
}, Eg = Cg;
fn.default = Eg;
var pn = {};
Object.defineProperty(pn, "__esModule", {
  value: !0
});
pn.default = void 0;
var Pg = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "part [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, qg = Pg;
pn.default = qg;
var mn = {};
Object.defineProperty(mn, "__esModule", {
  value: !0
});
mn.default = void 0;
var wg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "preface [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, xg = wg;
mn.default = xg;
var vn = {};
Object.defineProperty(vn, "__esModule", {
  value: !0
});
vn.default = void 0;
var Sg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "prologue [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark"]]
}, Tg = Sg;
vn.default = Tg;
var bn = {};
Object.defineProperty(bn, "__esModule", {
  value: !0
});
bn.default = void 0;
var $g = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {},
  relatedConcepts: [{
    concept: {
      name: "pullquote [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["none"]]
}, Og = $g;
bn.default = Og;
var yn = {};
Object.defineProperty(yn, "__esModule", {
  value: !0
});
yn.default = void 0;
var Mg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "qna [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section"]]
}, Ag = Mg;
yn.default = Ag;
var hn = {};
Object.defineProperty(hn, "__esModule", {
  value: !0
});
hn.default = void 0;
var Ig = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "subtitle [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "sectionhead"]]
}, Bg = Ig;
hn.default = Bg;
var gn = {};
Object.defineProperty(gn, "__esModule", {
  value: !0
});
gn.default = void 0;
var Ng = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "help [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "note"]]
}, Lg = Ng;
gn.default = Lg;
var Rn = {};
Object.defineProperty(Rn, "__esModule", {
  value: !0
});
Rn.default = void 0;
var kg = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    concept: {
      name: "toc [EPUB-SSV]"
    },
    module: "EPUB"
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "landmark", "navigation"]]
}, Fg = kg;
Rn.default = Fg;
Object.defineProperty(Ia, "__esModule", {
  value: !0
});
Ia.default = void 0;
var Dg = T(Ba), jg = T(Na), Hg = T(La), Ug = T(ka), zg = T(Fa), Wg = T(Da), Vg = T(ja), Gg = T(Ha), Yg = T(Ua), Kg = T(za), Xg = T(Wa), Jg = T(Va), Qg = T(Ga), Zg = T(Ya), eR = T(Ka), rR = T(Xa), tR = T(Ja), aR = T(Qa), nR = T(Za), oR = T(en), lR = T(rn), iR = T(tn), uR = T(an), sR = T(nn), cR = T(on), dR = T(ln), fR = T(un), pR = T(sn), mR = T(cn), vR = T(dn), bR = T(fn), yR = T(pn), hR = T(mn), gR = T(vn), RR = T(bn), _R = T(yn), CR = T(hn), ER = T(gn), PR = T(Rn);
function T(e) {
  return e && e.__esModule ? e : { default: e };
}
var qR = [["doc-abstract", Dg.default], ["doc-acknowledgments", jg.default], ["doc-afterword", Hg.default], ["doc-appendix", Ug.default], ["doc-backlink", zg.default], ["doc-biblioentry", Wg.default], ["doc-bibliography", Vg.default], ["doc-biblioref", Gg.default], ["doc-chapter", Yg.default], ["doc-colophon", Kg.default], ["doc-conclusion", Xg.default], ["doc-cover", Jg.default], ["doc-credit", Qg.default], ["doc-credits", Zg.default], ["doc-dedication", eR.default], ["doc-endnote", rR.default], ["doc-endnotes", tR.default], ["doc-epigraph", aR.default], ["doc-epilogue", nR.default], ["doc-errata", oR.default], ["doc-example", lR.default], ["doc-footnote", iR.default], ["doc-foreword", uR.default], ["doc-glossary", sR.default], ["doc-glossref", cR.default], ["doc-index", dR.default], ["doc-introduction", fR.default], ["doc-noteref", pR.default], ["doc-notice", mR.default], ["doc-pagebreak", vR.default], ["doc-pagelist", bR.default], ["doc-part", yR.default], ["doc-preface", hR.default], ["doc-prologue", gR.default], ["doc-pullquote", RR.default], ["doc-qna", _R.default], ["doc-subtitle", CR.default], ["doc-tip", ER.default], ["doc-toc", PR.default]], wR = qR;
Ia.default = wR;
var _n = {}, Cn = {};
Object.defineProperty(Cn, "__esModule", {
  value: !0
});
Cn.default = void 0;
var xR = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    module: "GRAPHICS",
    concept: {
      name: "graphics-object"
    }
  }, {
    module: "ARIA",
    concept: {
      name: "img"
    }
  }, {
    module: "ARIA",
    concept: {
      name: "article"
    }
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "document"]]
}, SR = xR;
Cn.default = SR;
var En = {};
Object.defineProperty(En, "__esModule", {
  value: !0
});
En.default = void 0;
var TR = {
  abstract: !1,
  accessibleNameRequired: !1,
  baseConcepts: [],
  childrenPresentational: !1,
  nameFrom: ["author", "contents"],
  prohibitedProps: [],
  props: {
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [{
    module: "GRAPHICS",
    concept: {
      name: "graphics-document"
    }
  }, {
    module: "ARIA",
    concept: {
      name: "group"
    }
  }, {
    module: "ARIA",
    concept: {
      name: "img"
    }
  }, {
    module: "GRAPHICS",
    concept: {
      name: "graphics-symbol"
    }
  }],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "group"]]
}, $R = TR;
En.default = $R;
var Pn = {};
Object.defineProperty(Pn, "__esModule", {
  value: !0
});
Pn.default = void 0;
var OR = {
  abstract: !1,
  accessibleNameRequired: !0,
  baseConcepts: [],
  childrenPresentational: !0,
  nameFrom: ["author"],
  prohibitedProps: [],
  props: {
    "aria-disabled": null,
    "aria-errormessage": null,
    "aria-expanded": null,
    "aria-haspopup": null,
    "aria-invalid": null
  },
  relatedConcepts: [],
  requireContextRole: [],
  requiredContextRole: [],
  requiredOwnedElements: [],
  requiredProps: {},
  superClass: [["roletype", "structure", "section", "img"]]
}, MR = OR;
Pn.default = MR;
Object.defineProperty(_n, "__esModule", {
  value: !0
});
_n.default = void 0;
var AR = Ho(Cn), IR = Ho(En), BR = Ho(Pn);
function Ho(e) {
  return e && e.__esModule ? e : { default: e };
}
var NR = [["graphics-document", AR.default], ["graphics-object", IR.default], ["graphics-symbol", BR.default]], LR = NR;
_n.default = LR;
Object.defineProperty(He, "__esModule", {
  value: !0
});
He.default = void 0;
var kR = lr(Vr), FR = lr(ot), DR = lr(Ia), jR = lr(_n), HR = lr($e);
function lr(e) {
  return e && e.__esModule ? e : { default: e };
}
function UR(e, r, t) {
  return r in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e;
}
function co(e, r) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = Nu(e)) || r && e && typeof e.length == "number") {
      t && (e = t);
      var a = 0, n = function() {
      };
      return { s: n, n: function() {
        return a >= e.length ? { done: !0 } : { done: !1, value: e[a++] };
      }, e: function(s) {
        throw s;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o = !0, l = !1, u;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var s = t.next();
    return o = s.done, s;
  }, e: function(s) {
    l = !0, u = s;
  }, f: function() {
    try {
      !o && t.return != null && t.return();
    } finally {
      if (l)
        throw u;
    }
  } };
}
function Ye(e, r) {
  return VR(e) || WR(e, r) || Nu(e, r) || zR();
}
function zR() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function Nu(e, r) {
  if (e) {
    if (typeof e == "string")
      return wl(e, r);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set")
      return Array.from(e);
    if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))
      return wl(e, r);
  }
}
function wl(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++)
    a[t] = e[t];
  return a;
}
function WR(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var a = [], n = !0, o = !1, l, u;
    try {
      for (t = t.call(e); !(n = (l = t.next()).done) && (a.push(l.value), !(r && a.length === r)); n = !0)
        ;
    } catch (i) {
      o = !0, u = i;
    } finally {
      try {
        !n && t.return != null && t.return();
      } finally {
        if (o)
          throw u;
      }
    }
    return a;
  }
}
function VR(e) {
  if (Array.isArray(e))
    return e;
}
var de = [].concat(kR.default, FR.default, DR.default, jR.default);
de.forEach(function(e) {
  var r = Ye(e, 2), t = r[1], a = co(t.superClass), n;
  try {
    for (a.s(); !(n = a.n()).done; ) {
      var o = n.value, l = co(o), u;
      try {
        var i = function() {
          var f = u.value, d = de.find(function(S) {
            var c = Ye(S, 1), g = c[0];
            return g === f;
          });
          if (d)
            for (var m = d[1], C = 0, w = Object.keys(m.props); C < w.length; C++) {
              var E = w[C];
              Object.prototype.hasOwnProperty.call(t.props, E) || Object.assign(t.props, UR({}, E, m.props[E]));
            }
        };
        for (l.s(); !(u = l.n()).done; )
          i();
      } catch (s) {
        l.e(s);
      } finally {
        l.f();
      }
    }
  } catch (s) {
    a.e(s);
  } finally {
    a.f();
  }
});
var fo = {
  entries: function() {
    return de;
  },
  forEach: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null, a = co(de), n;
    try {
      for (a.s(); !(n = a.n()).done; ) {
        var o = Ye(n.value, 2), l = o[0], u = o[1];
        r.call(t, u, l, de);
      }
    } catch (i) {
      a.e(i);
    } finally {
      a.f();
    }
  },
  get: function(r) {
    var t = de.find(function(a) {
      return a[0] === r;
    });
    return t && t[1];
  },
  has: function(r) {
    return !!fo.get(r);
  },
  keys: function() {
    return de.map(function(r) {
      var t = Ye(r, 1), a = t[0];
      return a;
    });
  },
  values: function() {
    return de.map(function(r) {
      var t = Ye(r, 2), a = t[1];
      return a;
    });
  }
}, GR = (0, HR.default)(fo, fo.entries());
He.default = GR;
var qn = {}, YR = or(), KR = Fi, XR = function() {
  var r = KR();
  return YR(
    Object,
    { assign: r },
    { assign: function() {
      return Object.assign !== r;
    } }
  ), r;
}, JR = or(), QR = Lo, ZR = rc, Lu = Fi, e_ = XR, r_ = QR.apply(Lu()), ku = function(r, t) {
  return r_(Object, arguments);
};
JR(ku, {
  getPolyfill: Lu,
  implementation: ZR,
  shim: e_
});
var t_ = ku, ar = function() {
  return typeof (function() {
  }).name == "string";
}, Ke = Object.getOwnPropertyDescriptor;
if (Ke)
  try {
    Ke([], "length");
  } catch {
    Ke = null;
  }
ar.functionsHaveConfigurableNames = function() {
  if (!ar() || !Ke)
    return !1;
  var r = Ke(function() {
  }, "name");
  return !!r && !!r.configurable;
};
var a_ = Function.prototype.bind;
ar.boundFunctionsHaveNames = function() {
  return ar() && typeof a_ == "function" && (function() {
  }).bind().name !== "";
};
var n_ = ar, xl = oc, o_ = nc(), l_ = n_.functionsHaveConfigurableNames(), i_ = Te, u_ = function(r, t) {
  if (typeof r != "function")
    throw new i_("`fn` is not a function");
  var a = arguments.length > 2 && !!arguments[2];
  return (!a || l_) && (o_ ? xl(
    /** @type {Parameters<define>[0]} */
    r,
    "name",
    t,
    !0,
    !0
  ) : xl(
    /** @type {Parameters<define>[0]} */
    r,
    "name",
    t
  )), r;
}, s_ = u_, c_ = Te, d_ = Object, Fu = s_(function() {
  if (this == null || this !== d_(this))
    throw new c_("RegExp.prototype.flags getter called on non-object");
  var r = "";
  return this.hasIndices && (r += "d"), this.global && (r += "g"), this.ignoreCase && (r += "i"), this.multiline && (r += "m"), this.dotAll && (r += "s"), this.unicode && (r += "u"), this.unicodeSets && (r += "v"), this.sticky && (r += "y"), r;
}, "get flags", !0), f_ = Fu, p_ = or().supportsDescriptors, m_ = Object.getOwnPropertyDescriptor, Du = function() {
  if (p_ && /a/mig.flags === "gim") {
    var r = m_(RegExp.prototype, "flags");
    if (r && typeof r.get == "function" && "dotAll" in RegExp.prototype && "hasIndices" in RegExp.prototype) {
      var t = "", a = {};
      if (Object.defineProperty(a, "hasIndices", {
        get: function() {
          t += "d";
        }
      }), Object.defineProperty(a, "sticky", {
        get: function() {
          t += "y";
        }
      }), r.get.call(a), t === "dy")
        return r.get;
    }
  }
  return f_;
}, v_ = or().supportsDescriptors, b_ = Du, y_ = ic, h_ = Object.defineProperty, g_ = uc, Sl = lc(), R_ = /a/, __ = function() {
  if (!v_ || !Sl)
    throw new g_("RegExp.prototype.flags requires a true ES5 environment that supports property descriptors");
  var r = b_(), t = Sl(R_), a = y_(t, "flags");
  return (!a || a.get !== r) && h_(t, "flags", {
    configurable: !0,
    enumerable: !1,
    get: r
  }), r;
}, C_ = or(), E_ = Lo, P_ = Fu, ju = Du, q_ = __, Hu = E_(ju());
C_(Hu, {
  getPolyfill: ju,
  implementation: P_,
  shim: q_
});
var w_ = Hu, Rr = { exports: {} };
const x_ = new Proxy({}, {
  get(e, r) {
    throw new Error(`Module "" has been externalized for browser compatibility. Cannot access ".${r}" in client code.  See http://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.`);
  }
}), S_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: x_
}, Symbol.toStringTag, { value: "Module" })), T_ = /* @__PURE__ */ sc(S_);
var Uo = typeof Map == "function" && Map.prototype, Dn = Object.getOwnPropertyDescriptor && Uo ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null, wr = Uo && Dn && typeof Dn.get == "function" ? Dn.get : null, Tl = Uo && Map.prototype.forEach, zo = typeof Set == "function" && Set.prototype, jn = Object.getOwnPropertyDescriptor && zo ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null, xr = zo && jn && typeof jn.get == "function" ? jn.get : null, $l = zo && Set.prototype.forEach, $_ = typeof WeakMap == "function" && WeakMap.prototype, Xe = $_ ? WeakMap.prototype.has : null, O_ = typeof WeakSet == "function" && WeakSet.prototype, Je = O_ ? WeakSet.prototype.has : null, M_ = typeof WeakRef == "function" && WeakRef.prototype, Ol = M_ ? WeakRef.prototype.deref : null, A_ = Boolean.prototype.valueOf, I_ = Object.prototype.toString, B_ = Function.prototype.toString, N_ = String.prototype.match, Wo = String.prototype.slice, me = String.prototype.replace, L_ = String.prototype.toUpperCase, Ml = String.prototype.toLowerCase, Uu = RegExp.prototype.test, Al = Array.prototype.concat, ee = Array.prototype.join, k_ = Array.prototype.slice, Il = Math.floor, po = typeof BigInt == "function" ? BigInt.prototype.valueOf : null, Hn = Object.getOwnPropertySymbols, mo = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? Symbol.prototype.toString : null, Fe = typeof Symbol == "function" && typeof Symbol.iterator == "object", Qe = typeof Symbol == "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === Fe || "symbol") ? Symbol.toStringTag : null, zu = Object.prototype.propertyIsEnumerable, Bl = (typeof Reflect == "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(e) {
  return e.__proto__;
} : null);
function Nl(e, r) {
  if (e === 1 / 0 || e === -1 / 0 || e !== e || e && e > -1e3 && e < 1e3 || Uu.call(/e/, r))
    return r;
  var t = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
  if (typeof e == "number") {
    var a = e < 0 ? -Il(-e) : Il(e);
    if (a !== e) {
      var n = String(a), o = Wo.call(r, n.length + 1);
      return me.call(n, t, "$&_") + "." + me.call(me.call(o, /([0-9]{3})/g, "$&_"), /_$/, "");
    }
  }
  return me.call(r, t, "$&_");
}
var vo = T_, Ll = vo.custom, kl = Gu(Ll) ? Ll : null, Wu = {
  __proto__: null,
  double: '"',
  single: "'"
}, F_ = {
  __proto__: null,
  double: /(["\\])/g,
  single: /(['\\])/g
}, wn = function e(r, t, a, n) {
  var o = t || {};
  if (ae(o, "quoteStyle") && !ae(Wu, o.quoteStyle))
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  if (ae(o, "maxStringLength") && (typeof o.maxStringLength == "number" ? o.maxStringLength < 0 && o.maxStringLength !== 1 / 0 : o.maxStringLength !== null))
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  var l = ae(o, "customInspect") ? o.customInspect : !0;
  if (typeof l != "boolean" && l !== "symbol")
    throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
  if (ae(o, "indent") && o.indent !== null && o.indent !== "	" && !(parseInt(o.indent, 10) === o.indent && o.indent > 0))
    throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
  if (ae(o, "numericSeparator") && typeof o.numericSeparator != "boolean")
    throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
  var u = o.numericSeparator;
  if (typeof r > "u")
    return "undefined";
  if (r === null)
    return "null";
  if (typeof r == "boolean")
    return r ? "true" : "false";
  if (typeof r == "string")
    return Ku(r, o);
  if (typeof r == "number") {
    if (r === 0)
      return 1 / 0 / r > 0 ? "0" : "-0";
    var i = String(r);
    return u ? Nl(r, i) : i;
  }
  if (typeof r == "bigint") {
    var s = String(r) + "n";
    return u ? Nl(r, s) : s;
  }
  var f = typeof o.depth > "u" ? 5 : o.depth;
  if (typeof a > "u" && (a = 0), a >= f && f > 0 && typeof r == "object")
    return bo(r) ? "[Array]" : "[Object]";
  var d = aC(o, a);
  if (typeof n > "u")
    n = [];
  else if (Yu(n, r) >= 0)
    return "[Circular]";
  function m(h, x, H) {
    if (x && (n = k_.call(n), n.push(x)), H) {
      var N = {
        depth: o.depth
      };
      return ae(o, "quoteStyle") && (N.quoteStyle = o.quoteStyle), e(h, N, a + 1, n);
    }
    return e(h, o, a + 1, n);
  }
  if (typeof r == "function" && !Fl(r)) {
    var C = Y_(r), w = br(r, m);
    return "[Function" + (C ? ": " + C : " (anonymous)") + "]" + (w.length > 0 ? " { " + ee.call(w, ", ") + " }" : "");
  }
  if (Gu(r)) {
    var E = Fe ? me.call(String(r), /^(Symbol\(.*\))_[^)]*$/, "$1") : mo.call(r);
    return typeof r == "object" && !Fe ? We(E) : E;
  }
  if (eC(r)) {
    for (var S = "<" + Ml.call(String(r.nodeName)), c = r.attributes || [], g = 0; g < c.length; g++)
      S += " " + c[g].name + "=" + Vu(D_(c[g].value), "double", o);
    return S += ">", r.childNodes && r.childNodes.length && (S += "..."), S += "</" + Ml.call(String(r.nodeName)) + ">", S;
  }
  if (bo(r)) {
    if (r.length === 0)
      return "[]";
    var _ = br(r, m);
    return d && !tC(_) ? "[" + yo(_, d) + "]" : "[ " + ee.call(_, ", ") + " ]";
  }
  if (H_(r)) {
    var R = br(r, m);
    return !("cause" in Error.prototype) && "cause" in r && !zu.call(r, "cause") ? "{ [" + String(r) + "] " + ee.call(Al.call("[cause]: " + m(r.cause), R), ", ") + " }" : R.length === 0 ? "[" + String(r) + "]" : "{ [" + String(r) + "] " + ee.call(R, ", ") + " }";
  }
  if (typeof r == "object" && l) {
    if (kl && typeof r[kl] == "function" && vo)
      return vo(r, { depth: f - a });
    if (l !== "symbol" && typeof r.inspect == "function")
      return r.inspect();
  }
  if (K_(r)) {
    var q = [];
    return Tl && Tl.call(r, function(h, x) {
      q.push(m(x, r, !0) + " => " + m(h, r));
    }), Dl("Map", wr.call(r), q, d);
  }
  if (Q_(r)) {
    var p = [];
    return $l && $l.call(r, function(h) {
      p.push(m(h, r));
    }), Dl("Set", xr.call(r), p, d);
  }
  if (X_(r))
    return Un("WeakMap");
  if (Z_(r))
    return Un("WeakSet");
  if (J_(r))
    return Un("WeakRef");
  if (z_(r))
    return We(m(Number(r)));
  if (V_(r))
    return We(m(po.call(r)));
  if (W_(r))
    return We(A_.call(r));
  if (U_(r))
    return We(m(String(r)));
  if (typeof window < "u" && r === window)
    return "{ [object Window] }";
  if (typeof globalThis < "u" && r === globalThis || typeof ol < "u" && r === ol)
    return "{ [object globalThis] }";
  if (!j_(r) && !Fl(r)) {
    var b = br(r, m), y = Bl ? Bl(r) === Object.prototype : r instanceof Object || r.constructor === Object, I = r instanceof Object ? "" : "null prototype", L = !y && Qe && Object(r) === r && Qe in r ? Wo.call(Pe(r), 8, -1) : I ? "Object" : "", k = y || typeof r.constructor != "function" ? "" : r.constructor.name ? r.constructor.name + " " : "", F = k + (L || I ? "[" + ee.call(Al.call([], L || [], I || []), ": ") + "] " : "");
    return b.length === 0 ? F + "{}" : d ? F + "{" + yo(b, d) + "}" : F + "{ " + ee.call(b, ", ") + " }";
  }
  return String(r);
};
function Vu(e, r, t) {
  var a = t.quoteStyle || r, n = Wu[a];
  return n + e + n;
}
function D_(e) {
  return me.call(String(e), /"/g, "&quot;");
}
function Oe(e) {
  return !Qe || !(typeof e == "object" && (Qe in e || typeof e[Qe] < "u"));
}
function bo(e) {
  return Pe(e) === "[object Array]" && Oe(e);
}
function j_(e) {
  return Pe(e) === "[object Date]" && Oe(e);
}
function Fl(e) {
  return Pe(e) === "[object RegExp]" && Oe(e);
}
function H_(e) {
  return Pe(e) === "[object Error]" && Oe(e);
}
function U_(e) {
  return Pe(e) === "[object String]" && Oe(e);
}
function z_(e) {
  return Pe(e) === "[object Number]" && Oe(e);
}
function W_(e) {
  return Pe(e) === "[object Boolean]" && Oe(e);
}
function Gu(e) {
  if (Fe)
    return e && typeof e == "object" && e instanceof Symbol;
  if (typeof e == "symbol")
    return !0;
  if (!e || typeof e != "object" || !mo)
    return !1;
  try {
    return mo.call(e), !0;
  } catch {
  }
  return !1;
}
function V_(e) {
  if (!e || typeof e != "object" || !po)
    return !1;
  try {
    return po.call(e), !0;
  } catch {
  }
  return !1;
}
var G_ = Object.prototype.hasOwnProperty || function(e) {
  return e in this;
};
function ae(e, r) {
  return G_.call(e, r);
}
function Pe(e) {
  return I_.call(e);
}
function Y_(e) {
  if (e.name)
    return e.name;
  var r = N_.call(B_.call(e), /^function\s*([\w$]+)/);
  return r ? r[1] : null;
}
function Yu(e, r) {
  if (e.indexOf)
    return e.indexOf(r);
  for (var t = 0, a = e.length; t < a; t++)
    if (e[t] === r)
      return t;
  return -1;
}
function K_(e) {
  if (!wr || !e || typeof e != "object")
    return !1;
  try {
    wr.call(e);
    try {
      xr.call(e);
    } catch {
      return !0;
    }
    return e instanceof Map;
  } catch {
  }
  return !1;
}
function X_(e) {
  if (!Xe || !e || typeof e != "object")
    return !1;
  try {
    Xe.call(e, Xe);
    try {
      Je.call(e, Je);
    } catch {
      return !0;
    }
    return e instanceof WeakMap;
  } catch {
  }
  return !1;
}
function J_(e) {
  if (!Ol || !e || typeof e != "object")
    return !1;
  try {
    return Ol.call(e), !0;
  } catch {
  }
  return !1;
}
function Q_(e) {
  if (!xr || !e || typeof e != "object")
    return !1;
  try {
    xr.call(e);
    try {
      wr.call(e);
    } catch {
      return !0;
    }
    return e instanceof Set;
  } catch {
  }
  return !1;
}
function Z_(e) {
  if (!Je || !e || typeof e != "object")
    return !1;
  try {
    Je.call(e, Je);
    try {
      Xe.call(e, Xe);
    } catch {
      return !0;
    }
    return e instanceof WeakSet;
  } catch {
  }
  return !1;
}
function eC(e) {
  return !e || typeof e != "object" ? !1 : typeof HTMLElement < "u" && e instanceof HTMLElement ? !0 : typeof e.nodeName == "string" && typeof e.getAttribute == "function";
}
function Ku(e, r) {
  if (e.length > r.maxStringLength) {
    var t = e.length - r.maxStringLength, a = "... " + t + " more character" + (t > 1 ? "s" : "");
    return Ku(Wo.call(e, 0, r.maxStringLength), r) + a;
  }
  var n = F_[r.quoteStyle || "single"];
  n.lastIndex = 0;
  var o = me.call(me.call(e, n, "\\$1"), /[\x00-\x1f]/g, rC);
  return Vu(o, "single", r);
}
function rC(e) {
  var r = e.charCodeAt(0), t = {
    8: "b",
    9: "t",
    10: "n",
    12: "f",
    13: "r"
  }[r];
  return t ? "\\" + t : "\\x" + (r < 16 ? "0" : "") + L_.call(r.toString(16));
}
function We(e) {
  return "Object(" + e + ")";
}
function Un(e) {
  return e + " { ? }";
}
function Dl(e, r, t, a) {
  var n = a ? yo(t, a) : ee.call(t, ", ");
  return e + " (" + r + ") {" + n + "}";
}
function tC(e) {
  for (var r = 0; r < e.length; r++)
    if (Yu(e[r], `
`) >= 0)
      return !1;
  return !0;
}
function aC(e, r) {
  var t;
  if (e.indent === "	")
    t = "	";
  else if (typeof e.indent == "number" && e.indent > 0)
    t = ee.call(Array(e.indent + 1), " ");
  else
    return null;
  return {
    base: t,
    prev: ee.call(Array(r + 1), t)
  };
}
function yo(e, r) {
  if (e.length === 0)
    return "";
  var t = `
` + r.prev + r.base;
  return t + ee.call(e, "," + t) + `
` + r.prev;
}
function br(e, r) {
  var t = bo(e), a = [];
  if (t) {
    a.length = e.length;
    for (var n = 0; n < e.length; n++)
      a[n] = ae(e, n) ? r(e[n], e) : "";
  }
  var o = typeof Hn == "function" ? Hn(e) : [], l;
  if (Fe) {
    l = {};
    for (var u = 0; u < o.length; u++)
      l["$" + o[u]] = o[u];
  }
  for (var i in e)
    ae(e, i) && (t && String(Number(i)) === i && i < e.length || Fe && l["$" + i] instanceof Symbol || (Uu.call(/[^\w$]/, i) ? a.push(r(i, e) + ": " + r(e[i], e)) : a.push(i + ": " + r(e[i], e))));
  if (typeof Hn == "function")
    for (var s = 0; s < o.length; s++)
      zu.call(e, o[s]) && a.push("[" + r(o[s]) + "]: " + r(e[o[s]], e));
  return a;
}
var nC = wn, oC = Te, xn = function(e, r, t) {
  for (var a = e, n; (n = a.next) != null; a = n)
    if (n.key === r)
      return a.next = n.next, t || (n.next = /** @type {NonNullable<typeof list.next>} */
      e.next, e.next = n), n;
}, lC = function(e, r) {
  if (e) {
    var t = xn(e, r);
    return t && t.value;
  }
}, iC = function(e, r, t) {
  var a = xn(e, r);
  a ? a.value = t : e.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
  {
    // eslint-disable-line no-param-reassign, no-extra-parens
    key: r,
    next: e.next,
    value: t
  };
}, uC = function(e, r) {
  return e ? !!xn(e, r) : !1;
}, sC = function(e, r) {
  if (e)
    return xn(e, r, !0);
}, cC = function() {
  var r, t = {
    assert: function(a) {
      if (!t.has(a))
        throw new oC("Side channel does not contain " + nC(a));
    },
    delete: function(a) {
      var n = r && r.next, o = sC(r, a);
      return o && n && n === o && (r = void 0), !!o;
    },
    get: function(a) {
      return lC(r, a);
    },
    has: function(a) {
      return uC(r, a);
    },
    set: function(a, n) {
      r || (r = {
        next: void 0
      }), iC(
        /** @type {NonNullable<typeof $o>} */
        r,
        a,
        n
      );
    }
  };
  return t;
}, dC = je, ir = Z, fC = wn, pC = Te, jl = dC("%Map%", !0), mC = ir("Map.prototype.get", !0), vC = ir("Map.prototype.set", !0), bC = ir("Map.prototype.has", !0), yC = ir("Map.prototype.delete", !0), hC = ir("Map.prototype.size", !0), Xu = !!jl && /** @type {Exclude<import('.'), false>} */
function() {
  var r, t = {
    assert: function(a) {
      if (!t.has(a))
        throw new pC("Side channel does not contain " + fC(a));
    },
    delete: function(a) {
      if (r) {
        var n = yC(r, a);
        return hC(r) === 0 && (r = void 0), n;
      }
      return !1;
    },
    get: function(a) {
      if (r)
        return mC(r, a);
    },
    has: function(a) {
      return r ? bC(r, a) : !1;
    },
    set: function(a, n) {
      r || (r = new jl()), vC(r, a, n);
    }
  };
  return t;
}, gC = je, Sn = Z, RC = wn, yr = Xu, _C = Te, Ne = gC("%WeakMap%", !0), CC = Sn("WeakMap.prototype.get", !0), EC = Sn("WeakMap.prototype.set", !0), PC = Sn("WeakMap.prototype.has", !0), qC = Sn("WeakMap.prototype.delete", !0), wC = Ne ? (
  /** @type {Exclude<import('.'), false>} */
  function() {
    var r, t, a = {
      assert: function(n) {
        if (!a.has(n))
          throw new _C("Side channel does not contain " + RC(n));
      },
      delete: function(n) {
        if (Ne && n && (typeof n == "object" || typeof n == "function")) {
          if (r)
            return qC(r, n);
        } else if (yr && t)
          return t.delete(n);
        return !1;
      },
      get: function(n) {
        return Ne && n && (typeof n == "object" || typeof n == "function") && r ? CC(r, n) : t && t.get(n);
      },
      has: function(n) {
        return Ne && n && (typeof n == "object" || typeof n == "function") && r ? PC(r, n) : !!t && t.has(n);
      },
      set: function(n, o) {
        Ne && n && (typeof n == "object" || typeof n == "function") ? (r || (r = new Ne()), EC(r, n, o)) : yr && (t || (t = yr()), t.set(n, o));
      }
    };
    return a;
  }
) : yr, xC = Te, SC = wn, TC = cC, $C = Xu, OC = wC, MC = OC || $C || TC, Ju = function() {
  var r, t = {
    assert: function(a) {
      if (!t.has(a))
        throw new xC("Side channel does not contain " + SC(a));
    },
    delete: function(a) {
      return !!r && r.delete(a);
    },
    get: function(a) {
      return r && r.get(a);
    },
    has: function(a) {
      return !!r && r.has(a);
    },
    set: function(a, n) {
      r || (r = MC()), r.set(a, n);
    }
  };
  return t;
}, AC = cc(), Ve = Ju(), te = Te, Vo = {
  assert: function(e, r) {
    if (!e || typeof e != "object" && typeof e != "function")
      throw new te("`O` is not an object");
    if (typeof r != "string")
      throw new te("`slot` must be a string");
    if (Ve.assert(e), !Vo.has(e, r))
      throw new te("`" + r + "` is not present on `O`");
  },
  get: function(e, r) {
    if (!e || typeof e != "object" && typeof e != "function")
      throw new te("`O` is not an object");
    if (typeof r != "string")
      throw new te("`slot` must be a string");
    var t = Ve.get(e);
    return t && t[
      /** @type {SaltedInternalSlot} */
      "$" + r
    ];
  },
  has: function(e, r) {
    if (!e || typeof e != "object" && typeof e != "function")
      throw new te("`O` is not an object");
    if (typeof r != "string")
      throw new te("`slot` must be a string");
    var t = Ve.get(e);
    return !!t && AC(
      t,
      /** @type {SaltedInternalSlot} */
      "$" + r
    );
  },
  set: function(e, r, t) {
    if (!e || typeof e != "object" && typeof e != "function")
      throw new te("`O` is not an object");
    if (typeof r != "string")
      throw new te("`slot` must be a string");
    var a = Ve.get(e);
    a || (a = {}, Ve.set(e, a)), a[
      /** @type {SaltedInternalSlot} */
      "$" + r
    ] = t;
  }
};
Object.freeze && Object.freeze(Vo);
var IC = Vo, Ge = IC, BC = dc, Hl = typeof StopIteration == "object" ? StopIteration : null, NC = function(r) {
  if (!Hl)
    throw new BC("this environment lacks StopIteration");
  Ge.set(r, "[[Done]]", !1);
  var t = {
    next: (
      /** @type {() => IteratorResult<T>} */
      function() {
        var n = (
          /** @type {typeof origIterator} */
          Ge.get(this, "[[Iterator]]")
        ), o = !!Ge.get(n, "[[Done]]");
        try {
          return {
            done: o,
            // eslint-disable-next-line no-extra-parens
            value: o ? void 0 : (
              /** @type {T} */
              n.next()
            )
          };
        } catch (l) {
          if (Ge.set(n, "[[Done]]", !0), l !== Hl)
            throw l;
          return {
            done: !0,
            value: void 0
          };
        }
      }
    )
  };
  return Ge.set(t, "[[Iterator]]", r), t;
}, LC = {}.toString, Qu = Array.isArray || function(e) {
  return LC.call(e) == "[object Array]";
}, Zu = Z, kC = Zu("String.prototype.valueOf"), FC = function(r) {
  try {
    return kC(r), !0;
  } catch {
    return !1;
  }
}, DC = Zu("Object.prototype.toString"), jC = "[object String]", HC = jr(), es = function(r) {
  return typeof r == "string" ? !0 : !r || typeof r != "object" ? !1 : HC ? FC(r) : DC(r) === jC;
}, Go = typeof Map == "function" && Map.prototype ? Map : null, UC = typeof Set == "function" && Set.prototype ? Set : null, Sr;
Go || (Sr = function(r) {
  return !1;
});
var rs = Go ? Map.prototype.has : null, Ul = UC ? Set.prototype.has : null;
!Sr && !rs && (Sr = function(r) {
  return !1;
});
var ts = Sr || function(r) {
  if (!r || typeof r != "object")
    return !1;
  try {
    if (rs.call(r), Ul)
      try {
        Ul.call(r);
      } catch {
        return !0;
      }
    return r instanceof Go;
  } catch {
  }
  return !1;
}, zC = typeof Map == "function" && Map.prototype ? Map : null, Yo = typeof Set == "function" && Set.prototype ? Set : null, Tr;
Yo || (Tr = function(r) {
  return !1;
});
var zl = zC ? Map.prototype.has : null, as = Yo ? Set.prototype.has : null;
!Tr && !as && (Tr = function(r) {
  return !1;
});
var ns = Tr || function(r) {
  if (!r || typeof r != "object")
    return !1;
  try {
    if (as.call(r), zl)
      try {
        zl.call(r);
      } catch {
        return !0;
      }
    return r instanceof Yo;
  } catch {
  }
  return !1;
}, Wl = Hi, Vl = NC;
if (ji()() || fc()) {
  var zn = Symbol.iterator;
  Rr.exports = function(r) {
    if (r != null && typeof r[zn] < "u")
      return r[zn]();
    if (Wl(r))
      return Array.prototype[zn].call(r);
  };
} else {
  var WC = Qu, VC = es, Gl = je, GC = Gl("%Map%", !0), YC = Gl("%Set%", !0), V = Di, Yl = V("Array.prototype.push"), Kl = V("String.prototype.charCodeAt"), KC = V("String.prototype.slice"), XC = function(r, t) {
    var a = r.length;
    if (t + 1 >= a)
      return t + 1;
    var n = Kl(r, t);
    if (n < 55296 || n > 56319)
      return t + 1;
    var o = Kl(r, t + 1);
    return o < 56320 || o > 57343 ? t + 1 : t + 2;
  }, Wn = function(r) {
    var t = 0;
    return {
      next: function() {
        var n = t >= r.length, o;
        return n || (o = r[t], t += 1), {
          done: n,
          value: o
        };
      }
    };
  }, Xl = function(r, t) {
    if (WC(r) || Wl(r))
      return Wn(r);
    if (VC(r)) {
      var a = 0;
      return {
        next: function() {
          var o = XC(r, a), l = KC(r, a, o);
          return a = o, {
            done: o > r.length,
            value: l
          };
        }
      };
    }
    if (t && typeof r["_es6-shim iterator_"] < "u")
      return r["_es6-shim iterator_"]();
  };
  if (!GC && !YC)
    Rr.exports = function(r) {
      if (r != null)
        return Xl(r, !0);
    };
  else {
    var JC = ts, QC = ns, Jl = V("Map.prototype.forEach", !0), Ql = V("Set.prototype.forEach", !0);
    if (typeof J > "u" || !J.versions || !J.versions.node)
      var Zl = V("Map.prototype.iterator", !0), ei = V("Set.prototype.iterator", !0);
    var ri = V("Map.prototype.@@iterator", !0) || V("Map.prototype._es6-shim iterator_", !0), ti = V("Set.prototype.@@iterator", !0) || V("Set.prototype._es6-shim iterator_", !0), ZC = function(r) {
      if (JC(r)) {
        if (Zl)
          return Vl(Zl(r));
        if (ri)
          return ri(r);
        if (Jl) {
          var t = [];
          return Jl(r, function(n, o) {
            Yl(t, [o, n]);
          }), Wn(t);
        }
      }
      if (QC(r)) {
        if (ei)
          return Vl(ei(r));
        if (ti)
          return ti(r);
        if (Ql) {
          var a = [];
          return Ql(r, function(n) {
            Yl(a, n);
          }), Wn(a);
        }
      }
    };
    Rr.exports = function(r) {
      return ZC(r) || Xl(r);
    };
  }
}
var eE = Rr.exports, rE = Lo, os = Z, tE = je, ho = tE("%ArrayBuffer%", !0), _r = os("ArrayBuffer.prototype.byteLength", !0), aE = os("Object.prototype.toString"), ai = !!ho && !_r && new ho(0).slice, ni = !!ai && rE(ai), ls = _r || ni ? function(r) {
  if (!r || typeof r != "object")
    return !1;
  try {
    return _r ? _r(r) : ni(r, 0), !0;
  } catch {
    return !1;
  }
} : ho ? function(r) {
  return aE(r) === "[object ArrayBuffer]";
} : function(r) {
  return !1;
}, is = Z, nE = is("Date.prototype.getDay"), oE = function(r) {
  try {
    return nE(r), !0;
  } catch {
    return !1;
  }
}, lE = is("Object.prototype.toString"), iE = "[object Date]", uE = jr(), sE = function(r) {
  return typeof r != "object" || r === null ? !1 : uE ? oE(r) : lE(r) === iE;
}, cE = Z, oi = cE("SharedArrayBuffer.prototype.byteLength", !0), dE = oi ? function(r) {
  if (!r || typeof r != "object")
    return !1;
  try {
    return oi(r), !0;
  } catch {
    return !1;
  }
} : function(r) {
  return !1;
}, us = Z, fE = us("Number.prototype.toString"), pE = function(r) {
  try {
    return fE(r), !0;
  } catch {
    return !1;
  }
}, mE = us("Object.prototype.toString"), vE = "[object Number]", bE = jr(), yE = function(r) {
  return typeof r == "number" ? !0 : !r || typeof r != "object" ? !1 : bE ? pE(r) : mE(r) === vE;
}, ss = Z, hE = ss("Boolean.prototype.toString"), gE = ss("Object.prototype.toString"), RE = function(r) {
  try {
    return hE(r), !0;
  } catch {
    return !1;
  }
}, _E = "[object Boolean]", CE = jr(), EE = function(r) {
  return typeof r == "boolean" ? !0 : r === null || typeof r != "object" ? !1 : CE ? RE(r) : gE(r) === _E;
}, go = { exports: {} }, cs = Z, PE = cs("Object.prototype.toString"), qE = ji()(), wE = pc;
if (qE) {
  var xE = cs("Symbol.prototype.toString"), SE = wE(/^Symbol\(.*\)$/), TE = function(r) {
    return typeof r.valueOf() != "symbol" ? !1 : SE(xE(r));
  };
  go.exports = function(r) {
    if (typeof r == "symbol")
      return !0;
    if (!r || typeof r != "object" || PE(r) !== "[object Symbol]")
      return !1;
    try {
      return TE(r);
    } catch {
      return !1;
    }
  };
} else
  go.exports = function(r) {
    return !1;
  };
var $E = go.exports, Ro = { exports: {} }, li = typeof BigInt < "u" && BigInt, OE = function() {
  return typeof li == "function" && typeof BigInt == "function" && typeof li(42) == "bigint" && typeof BigInt(42) == "bigint";
}, ME = OE();
if (ME) {
  var AE = BigInt.prototype.valueOf, IE = function(r) {
    try {
      return AE.call(r), !0;
    } catch {
    }
    return !1;
  };
  Ro.exports = function(r) {
    return r === null || typeof r > "u" || typeof r == "boolean" || typeof r == "string" || typeof r == "number" || typeof r == "symbol" || typeof r == "function" ? !1 : typeof r == "bigint" ? !0 : IE(r);
  };
} else
  Ro.exports = function(r) {
    return !1;
  };
var BE = Ro.exports, NE = es, LE = yE, kE = EE, FE = $E, DE = BE, jE = function(r) {
  if (r == null || typeof r != "object" && typeof r != "function")
    return null;
  if (NE(r))
    return "String";
  if (LE(r))
    return "Number";
  if (kE(r))
    return "Boolean";
  if (FE(r))
    return "Symbol";
  if (DE(r))
    return "BigInt";
}, $r = typeof WeakMap == "function" && WeakMap.prototype ? WeakMap : null, ii = typeof WeakSet == "function" && WeakSet.prototype ? WeakSet : null, Or;
$r || (Or = function(r) {
  return !1;
});
var _o = $r ? $r.prototype.has : null, Vn = ii ? ii.prototype.has : null;
!Or && !_o && (Or = function(r) {
  return !1;
});
var HE = Or || function(r) {
  if (!r || typeof r != "object")
    return !1;
  try {
    if (_o.call(r, _o), Vn)
      try {
        Vn.call(r, Vn);
      } catch {
        return !0;
      }
    return r instanceof $r;
  } catch {
  }
  return !1;
}, Co = { exports: {} }, UE = je, ds = Z, zE = UE("%WeakSet%", !0), Gn = ds("WeakSet.prototype.has", !0);
if (Gn) {
  var Yn = ds("WeakMap.prototype.has", !0);
  Co.exports = function(r) {
    if (!r || typeof r != "object")
      return !1;
    try {
      if (Gn(r, Gn), Yn)
        try {
          Yn(r, Yn);
        } catch {
          return !0;
        }
      return r instanceof zE;
    } catch {
    }
    return !1;
  };
} else
  Co.exports = function(r) {
    return !1;
  };
var WE = Co.exports, VE = ts, GE = ns, YE = HE, KE = WE, XE = function(r) {
  if (r && typeof r == "object") {
    if (VE(r))
      return "Map";
    if (GE(r))
      return "Set";
    if (YE(r))
      return "WeakMap";
    if (KE(r))
      return "WeakSet";
  }
  return !1;
}, JE = Z, ui = JE("ArrayBuffer.prototype.byteLength", !0), QE = ls, ZE = function(r) {
  return QE(r) ? ui ? ui(r) : r.byteLength : NaN;
}, fs = t_, re = Di, si = w_, eP = je, De = eE, rP = Ju, ci = tc(), di = Hi, fi = Qu, pi = ls, mi = sE, vi = mc, bi = dE, yi = ac, hi = jE, gi = XE, Ri = vc, _i = ZE, Ci = re("SharedArrayBuffer.prototype.byteLength", !0), Ei = re("Date.prototype.getTime"), Kn = Object.getPrototypeOf, Pi = re("Object.prototype.toString"), Mr = eP("%Set%", !0), Eo = re("Map.prototype.has", !0), Ar = re("Map.prototype.get", !0), qi = re("Map.prototype.size", !0), Ir = re("Set.prototype.add", !0), ps = re("Set.prototype.delete", !0), Br = re("Set.prototype.has", !0), Cr = re("Set.prototype.size", !0);
function wi(e, r, t, a) {
  for (var n = De(e), o; (o = n.next()) && !o.done; )
    if (Q(r, o.value, t, a))
      return ps(e, o.value), !0;
  return !1;
}
function ms(e) {
  if (typeof e > "u")
    return null;
  if (typeof e != "object")
    return typeof e == "symbol" ? !1 : typeof e == "string" || typeof e == "number" ? +e == +e : !0;
}
function tP(e, r, t, a, n, o) {
  var l = ms(t);
  if (l != null)
    return l;
  var u = Ar(r, l), i = fs({}, n, { strict: !1 });
  return typeof u > "u" && !Eo(r, l) || !Q(a, u, i, o) ? !1 : !Eo(e, l) && Q(a, u, i, o);
}
function aP(e, r, t) {
  var a = ms(t);
  return a ?? (Br(r, a) && !Br(e, a));
}
function xi(e, r, t, a, n, o) {
  for (var l = De(e), u, i; (u = l.next()) && !u.done; )
    if (i = u.value, // eslint-disable-next-line no-use-before-define
    Q(t, i, n, o) && Q(a, Ar(r, i), n, o))
      return ps(e, i), !0;
  return !1;
}
function Q(e, r, t, a) {
  var n = t || {};
  if (n.strict ? ci(e, r) : e === r)
    return !0;
  var o = hi(e), l = hi(r);
  if (o !== l)
    return !1;
  if (!e || !r || typeof e != "object" && typeof r != "object")
    return n.strict ? ci(e, r) : e == r;
  var u = a.has(e), i = a.has(r), s;
  if (u && i) {
    if (a.get(e) === a.get(r))
      return !0;
  } else
    s = {};
  return u || a.set(e, s), i || a.set(r, s), lP(e, r, n, a);
}
function Si(e) {
  return !e || typeof e != "object" || typeof e.length != "number" || typeof e.copy != "function" || typeof e.slice != "function" || e.length > 0 && typeof e[0] != "number" ? !1 : !!(e.constructor && e.constructor.isBuffer && e.constructor.isBuffer(e));
}
function nP(e, r, t, a) {
  if (Cr(e) !== Cr(r))
    return !1;
  for (var n = De(e), o = De(r), l, u, i; (l = n.next()) && !l.done; )
    if (l.value && typeof l.value == "object")
      i || (i = new Mr()), Ir(i, l.value);
    else if (!Br(r, l.value)) {
      if (t.strict || !aP(e, r, l.value))
        return !1;
      i || (i = new Mr()), Ir(i, l.value);
    }
  if (i) {
    for (; (u = o.next()) && !u.done; )
      if (u.value && typeof u.value == "object") {
        if (!wi(i, u.value, t.strict, a))
          return !1;
      } else if (!t.strict && !Br(e, u.value) && !wi(i, u.value, t.strict, a))
        return !1;
    return Cr(i) === 0;
  }
  return !0;
}
function oP(e, r, t, a) {
  if (qi(e) !== qi(r))
    return !1;
  for (var n = De(e), o = De(r), l, u, i, s, f, d; (l = n.next()) && !l.done; )
    if (s = l.value[0], f = l.value[1], s && typeof s == "object")
      i || (i = new Mr()), Ir(i, s);
    else if (d = Ar(r, s), typeof d > "u" && !Eo(r, s) || !Q(f, d, t, a)) {
      if (t.strict || !tP(e, r, s, f, t, a))
        return !1;
      i || (i = new Mr()), Ir(i, s);
    }
  if (i) {
    for (; (u = o.next()) && !u.done; )
      if (s = u.value[0], d = u.value[1], s && typeof s == "object") {
        if (!xi(i, e, s, d, t, a))
          return !1;
      } else if (!t.strict && (!e.has(s) || !Q(Ar(e, s), d, t, a)) && !xi(i, e, s, d, fs({}, t, { strict: !1 }), a))
        return !1;
    return Cr(i) === 0;
  }
  return !0;
}
function lP(e, r, t, a) {
  var n, o;
  if (typeof e != typeof r || e == null || r == null || Pi(e) !== Pi(r) || di(e) !== di(r))
    return !1;
  var l = fi(e), u = fi(r);
  if (l !== u)
    return !1;
  var i = e instanceof Error, s = r instanceof Error;
  if (i !== s || (i || s) && (e.name !== r.name || e.message !== r.message))
    return !1;
  var f = vi(e), d = vi(r);
  if (f !== d || (f || d) && (e.source !== r.source || si(e) !== si(r)))
    return !1;
  var m = mi(e), C = mi(r);
  if (m !== C || (m || C) && Ei(e) !== Ei(r) || t.strict && Kn && Kn(e) !== Kn(r))
    return !1;
  var w = Ri(e), E = Ri(r);
  if (w !== E)
    return !1;
  if (w || E) {
    if (e.length !== r.length)
      return !1;
    for (n = 0; n < e.length; n++)
      if (e[n] !== r[n])
        return !1;
    return !0;
  }
  var S = Si(e), c = Si(r);
  if (S !== c)
    return !1;
  if (S || c) {
    if (e.length !== r.length)
      return !1;
    for (n = 0; n < e.length; n++)
      if (e[n] !== r[n])
        return !1;
    return !0;
  }
  var g = pi(e), _ = pi(r);
  if (g !== _)
    return !1;
  if (g || _)
    return _i(e) !== _i(r) ? !1 : typeof Uint8Array == "function" && Q(new Uint8Array(e), new Uint8Array(r), t, a);
  var R = bi(e), q = bi(r);
  if (R !== q)
    return !1;
  if (R || q)
    return Ci(e) !== Ci(r) ? !1 : typeof Uint8Array == "function" && Q(new Uint8Array(e), new Uint8Array(r), t, a);
  if (typeof e != typeof r)
    return !1;
  var p = yi(e), b = yi(r);
  if (p.length !== b.length)
    return !1;
  for (p.sort(), b.sort(), n = p.length - 1; n >= 0; n--)
    if (p[n] != b[n])
      return !1;
  for (n = p.length - 1; n >= 0; n--)
    if (o = p[n], !Q(e[o], r[o], t, a))
      return !1;
  var y = gi(e), I = gi(r);
  return y !== I ? !1 : y === "Set" || I === "Set" ? nP(e, r, t, a) : y === "Map" ? oP(e, r, t, a) : !0;
}
var iP = function(r, t, a) {
  return Q(r, t, a, rP());
};
Object.defineProperty(qn, "__esModule", {
  value: !0
});
qn.default = void 0;
var uP = Ko(iP), sP = Ko($e), vs = Ko(He);
function Ko(e) {
  return e && e.__esModule ? e : { default: e };
}
function Xn(e, r) {
  return fP(e) || dP(e, r) || bs(e, r) || cP();
}
function cP() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function dP(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var a = [], n = !0, o = !1, l, u;
    try {
      for (t = t.call(e); !(n = (l = t.next()).done) && (a.push(l.value), !(r && a.length === r)); n = !0)
        ;
    } catch (i) {
      o = !0, u = i;
    } finally {
      try {
        !n && t.return != null && t.return();
      } finally {
        if (o)
          throw u;
      }
    }
    return a;
  }
}
function fP(e) {
  if (Array.isArray(e))
    return e;
}
function pP(e, r) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = bs(e)) || r && e && typeof e.length == "number") {
      t && (e = t);
      var a = 0, n = function() {
      };
      return { s: n, n: function() {
        return a >= e.length ? { done: !0 } : { done: !1, value: e[a++] };
      }, e: function(s) {
        throw s;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o = !0, l = !1, u;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var s = t.next();
    return o = s.done, s;
  }, e: function(s) {
    l = !0, u = s;
  }, f: function() {
    try {
      !o && t.return != null && t.return();
    } finally {
      if (l)
        throw u;
    }
  } };
}
function bs(e, r) {
  if (e) {
    if (typeof e == "string")
      return Ti(e, r);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set")
      return Array.from(e);
    if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))
      return Ti(e, r);
  }
}
function Ti(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++)
    a[t] = e[t];
  return a;
}
var fe = [], $i = vs.default.keys();
for (var Jn = 0; Jn < $i.length; Jn++) {
  var Qn = $i[Jn], Zn = vs.default.get(Qn);
  if (Zn)
    for (var Oi = [].concat(Zn.baseConcepts, Zn.relatedConcepts), eo = 0; eo < Oi.length; eo++) {
      var Mi = Oi[eo];
      if (Mi.module === "HTML") {
        var ro = Mi.concept;
        ro && function() {
          var e = JSON.stringify(ro), r = fe.find(function(o) {
            return JSON.stringify(o[0]) === e;
          }), t = void 0;
          r ? t = r[1] : t = [];
          for (var a = !0, n = 0; n < t.length; n++)
            if (t[n] === Qn) {
              a = !1;
              break;
            }
          a && t.push(Qn), fe.push([ro, t]);
        }();
      }
    }
}
var Po = {
  entries: function() {
    return fe;
  },
  forEach: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null, a = pP(fe), n;
    try {
      for (a.s(); !(n = a.n()).done; ) {
        var o = Xn(n.value, 2), l = o[0], u = o[1];
        r.call(t, u, l, fe);
      }
    } catch (i) {
      a.e(i);
    } finally {
      a.f();
    }
  },
  get: function(r) {
    var t = fe.find(function(a) {
      return (0, uP.default)(r, a[0]);
    });
    return t && t[1];
  },
  has: function(r) {
    return !!Po.get(r);
  },
  keys: function() {
    return fe.map(function(r) {
      var t = Xn(r, 1), a = t[0];
      return a;
    });
  },
  values: function() {
    return fe.map(function(r) {
      var t = Xn(r, 2), a = t[1];
      return a;
    });
  }
}, mP = (0, sP.default)(Po, Po.entries());
qn.default = mP;
var Tn = {};
Object.defineProperty(Tn, "__esModule", {
  value: !0
});
Tn.default = void 0;
var vP = hs($e), ys = hs(He);
function hs(e) {
  return e && e.__esModule ? e : { default: e };
}
function to(e, r) {
  return hP(e) || yP(e, r) || gs(e, r) || bP();
}
function bP() {
  throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
}
function yP(e, r) {
  var t = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (t != null) {
    var a = [], n = !0, o = !1, l, u;
    try {
      for (t = t.call(e); !(n = (l = t.next()).done) && (a.push(l.value), !(r && a.length === r)); n = !0)
        ;
    } catch (i) {
      o = !0, u = i;
    } finally {
      try {
        !n && t.return != null && t.return();
      } finally {
        if (o)
          throw u;
      }
    }
    return a;
  }
}
function hP(e) {
  if (Array.isArray(e))
    return e;
}
function gP(e, r) {
  var t = typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
  if (!t) {
    if (Array.isArray(e) || (t = gs(e)) || r && e && typeof e.length == "number") {
      t && (e = t);
      var a = 0, n = function() {
      };
      return { s: n, n: function() {
        return a >= e.length ? { done: !0 } : { done: !1, value: e[a++] };
      }, e: function(s) {
        throw s;
      }, f: n };
    }
    throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }
  var o = !0, l = !1, u;
  return { s: function() {
    t = t.call(e);
  }, n: function() {
    var s = t.next();
    return o = s.done, s;
  }, e: function(s) {
    l = !0, u = s;
  }, f: function() {
    try {
      !o && t.return != null && t.return();
    } finally {
      if (l)
        throw u;
    }
  } };
}
function gs(e, r) {
  if (e) {
    if (typeof e == "string")
      return Ai(e, r);
    var t = Object.prototype.toString.call(e).slice(8, -1);
    if (t === "Object" && e.constructor && (t = e.constructor.name), t === "Map" || t === "Set")
      return Array.from(e);
    if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))
      return Ai(e, r);
  }
}
function Ai(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++)
    a[t] = e[t];
  return a;
}
var pe = [], Rs = ys.default.keys(), RP = function(r) {
  var t = Rs[r], a = ys.default.get(t);
  if (a)
    for (var n = [].concat(a.baseConcepts, a.relatedConcepts), o = 0; o < n.length; o++) {
      var l = n[o];
      if (l.module === "HTML") {
        var u = l.concept;
        if (u) {
          var i = pe.find(function(f) {
            return f[0] === t;
          }), s = void 0;
          i ? s = i[1] : s = [], s.push(u), pe.push([t, s]);
        }
      }
    }
};
for (var ao = 0; ao < Rs.length; ao++)
  RP(ao);
var qo = {
  entries: function() {
    return pe;
  },
  forEach: function(r) {
    var t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null, a = gP(pe), n;
    try {
      for (a.s(); !(n = a.n()).done; ) {
        var o = to(n.value, 2), l = o[0], u = o[1];
        r.call(t, u, l, pe);
      }
    } catch (i) {
      a.e(i);
    } finally {
      a.f();
    }
  },
  get: function(r) {
    var t = pe.find(function(a) {
      return a[0] === r;
    });
    return t && t[1];
  },
  has: function(r) {
    return !!qo.get(r);
  },
  keys: function() {
    return pe.map(function(r) {
      var t = to(r, 1), a = t[0];
      return a;
    });
  },
  values: function() {
    return pe.map(function(r) {
      var t = to(r, 2), a = t[1];
      return a;
    });
  }
}, _P = (0, vP.default)(qo, qo.entries());
Tn.default = _P;
Object.defineProperty(X, "__esModule", {
  value: !0
});
var G = X.roles = Cs = X.roleElements = _s = X.elementRoles = X.dom = X.aria = void 0, CP = ur(Ur), EP = ur(Wr), PP = ur(He), qP = ur(qn), wP = ur(Tn);
function ur(e) {
  return e && e.__esModule ? e : { default: e };
}
var xP = CP.default;
X.aria = xP;
var SP = EP.default;
X.dom = SP;
var TP = PP.default;
G = X.roles = TP;
var $P = qP.default, _s = X.elementRoles = $P, OP = wP.default, Cs = X.roleElements = OP, Xo = { exports: {} };
Xo.exports;
(function(e) {
  var r = function() {
    var t = String.fromCharCode, a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", o = {};
    function l(i, s) {
      if (!o[i]) {
        o[i] = {};
        for (var f = 0; f < i.length; f++)
          o[i][i.charAt(f)] = f;
      }
      return o[i][s];
    }
    var u = {
      compressToBase64: function(i) {
        if (i == null)
          return "";
        var s = u._compress(i, 6, function(f) {
          return a.charAt(f);
        });
        switch (s.length % 4) {
          default:
          case 0:
            return s;
          case 1:
            return s + "===";
          case 2:
            return s + "==";
          case 3:
            return s + "=";
        }
      },
      decompressFromBase64: function(i) {
        return i == null ? "" : i == "" ? null : u._decompress(i.length, 32, function(s) {
          return l(a, i.charAt(s));
        });
      },
      compressToUTF16: function(i) {
        return i == null ? "" : u._compress(i, 15, function(s) {
          return t(s + 32);
        }) + " ";
      },
      decompressFromUTF16: function(i) {
        return i == null ? "" : i == "" ? null : u._decompress(i.length, 16384, function(s) {
          return i.charCodeAt(s) - 32;
        });
      },
      //compress into uint8array (UCS-2 big endian format)
      compressToUint8Array: function(i) {
        for (var s = u.compress(i), f = new Uint8Array(s.length * 2), d = 0, m = s.length; d < m; d++) {
          var C = s.charCodeAt(d);
          f[d * 2] = C >>> 8, f[d * 2 + 1] = C % 256;
        }
        return f;
      },
      //decompress from uint8array (UCS-2 big endian format)
      decompressFromUint8Array: function(i) {
        if (i == null)
          return u.decompress(i);
        for (var s = new Array(i.length / 2), f = 0, d = s.length; f < d; f++)
          s[f] = i[f * 2] * 256 + i[f * 2 + 1];
        var m = [];
        return s.forEach(function(C) {
          m.push(t(C));
        }), u.decompress(m.join(""));
      },
      //compress into a string that is already URI encoded
      compressToEncodedURIComponent: function(i) {
        return i == null ? "" : u._compress(i, 6, function(s) {
          return n.charAt(s);
        });
      },
      //decompress from an output of compressToEncodedURIComponent
      decompressFromEncodedURIComponent: function(i) {
        return i == null ? "" : i == "" ? null : (i = i.replace(/ /g, "+"), u._decompress(i.length, 32, function(s) {
          return l(n, i.charAt(s));
        }));
      },
      compress: function(i) {
        return u._compress(i, 16, function(s) {
          return t(s);
        });
      },
      _compress: function(i, s, f) {
        if (i == null)
          return "";
        var d, m, C = {}, w = {}, E = "", S = "", c = "", g = 2, _ = 3, R = 2, q = [], p = 0, b = 0, y;
        for (y = 0; y < i.length; y += 1)
          if (E = i.charAt(y), Object.prototype.hasOwnProperty.call(C, E) || (C[E] = _++, w[E] = !0), S = c + E, Object.prototype.hasOwnProperty.call(C, S))
            c = S;
          else {
            if (Object.prototype.hasOwnProperty.call(w, c)) {
              if (c.charCodeAt(0) < 256) {
                for (d = 0; d < R; d++)
                  p = p << 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++;
                for (m = c.charCodeAt(0), d = 0; d < 8; d++)
                  p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
              } else {
                for (m = 1, d = 0; d < R; d++)
                  p = p << 1 | m, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = 0;
                for (m = c.charCodeAt(0), d = 0; d < 16; d++)
                  p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
              }
              g--, g == 0 && (g = Math.pow(2, R), R++), delete w[c];
            } else
              for (m = C[c], d = 0; d < R; d++)
                p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
            g--, g == 0 && (g = Math.pow(2, R), R++), C[S] = _++, c = String(E);
          }
        if (c !== "") {
          if (Object.prototype.hasOwnProperty.call(w, c)) {
            if (c.charCodeAt(0) < 256) {
              for (d = 0; d < R; d++)
                p = p << 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++;
              for (m = c.charCodeAt(0), d = 0; d < 8; d++)
                p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
            } else {
              for (m = 1, d = 0; d < R; d++)
                p = p << 1 | m, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = 0;
              for (m = c.charCodeAt(0), d = 0; d < 16; d++)
                p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
            }
            g--, g == 0 && (g = Math.pow(2, R), R++), delete w[c];
          } else
            for (m = C[c], d = 0; d < R; d++)
              p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
          g--, g == 0 && (g = Math.pow(2, R), R++);
        }
        for (m = 2, d = 0; d < R; d++)
          p = p << 1 | m & 1, b == s - 1 ? (b = 0, q.push(f(p)), p = 0) : b++, m = m >> 1;
        for (; ; )
          if (p = p << 1, b == s - 1) {
            q.push(f(p));
            break;
          } else
            b++;
        return q.join("");
      },
      decompress: function(i) {
        return i == null ? "" : i == "" ? null : u._decompress(i.length, 32768, function(s) {
          return i.charCodeAt(s);
        });
      },
      _decompress: function(i, s, f) {
        var d = [], m = 4, C = 4, w = 3, E = "", S = [], c, g, _, R, q, p, b, y = { val: f(0), position: s, index: 1 };
        for (c = 0; c < 3; c += 1)
          d[c] = c;
        for (_ = 0, q = Math.pow(2, 2), p = 1; p != q; )
          R = y.val & y.position, y.position >>= 1, y.position == 0 && (y.position = s, y.val = f(y.index++)), _ |= (R > 0 ? 1 : 0) * p, p <<= 1;
        switch (_) {
          case 0:
            for (_ = 0, q = Math.pow(2, 8), p = 1; p != q; )
              R = y.val & y.position, y.position >>= 1, y.position == 0 && (y.position = s, y.val = f(y.index++)), _ |= (R > 0 ? 1 : 0) * p, p <<= 1;
            b = t(_);
            break;
          case 1:
            for (_ = 0, q = Math.pow(2, 16), p = 1; p != q; )
              R = y.val & y.position, y.position >>= 1, y.position == 0 && (y.position = s, y.val = f(y.index++)), _ |= (R > 0 ? 1 : 0) * p, p <<= 1;
            b = t(_);
            break;
          case 2:
            return "";
        }
        for (d[3] = b, g = b, S.push(b); ; ) {
          if (y.index > i)
            return "";
          for (_ = 0, q = Math.pow(2, w), p = 1; p != q; )
            R = y.val & y.position, y.position >>= 1, y.position == 0 && (y.position = s, y.val = f(y.index++)), _ |= (R > 0 ? 1 : 0) * p, p <<= 1;
          switch (b = _) {
            case 0:
              for (_ = 0, q = Math.pow(2, 8), p = 1; p != q; )
                R = y.val & y.position, y.position >>= 1, y.position == 0 && (y.position = s, y.val = f(y.index++)), _ |= (R > 0 ? 1 : 0) * p, p <<= 1;
              d[C++] = t(_), b = C - 1, m--;
              break;
            case 1:
              for (_ = 0, q = Math.pow(2, 16), p = 1; p != q; )
                R = y.val & y.position, y.position >>= 1, y.position == 0 && (y.position = s, y.val = f(y.index++)), _ |= (R > 0 ? 1 : 0) * p, p <<= 1;
              d[C++] = t(_), b = C - 1, m--;
              break;
            case 2:
              return S.join("");
          }
          if (m == 0 && (m = Math.pow(2, w), w++), d[b])
            E = d[b];
          else if (b === C)
            E = g + g.charAt(0);
          else
            return null;
          S.push(E), d[C++] = g + E.charAt(0), m--, g = E, m == 0 && (m = Math.pow(2, w), w++);
        }
      }
    };
    return u;
  }();
  e != null ? e.exports = r : typeof angular < "u" && angular != null && angular.module("LZString", []).factory("LZString", function() {
    return r;
  });
})(Xo);
var MP = Xo.exports;
const AP = /* @__PURE__ */ bc(MP);
function Es(e) {
  return e.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const IP = (e, r, t, a, n, o, l) => {
  const u = a + t.indent, i = t.colors;
  return e.map((s) => {
    const f = r[s];
    let d = l(f, t, u, n, o);
    return typeof f != "string" && (d.indexOf(`
`) !== -1 && (d = t.spacingOuter + u + d + t.spacingOuter + a), d = "{" + d + "}"), t.spacingInner + a + i.prop.open + s + i.prop.close + "=" + i.value.open + d + i.value.close;
  }).join("");
}, BP = 3, NP = (e, r, t, a, n, o) => e.map((l) => {
  const u = typeof l == "string" ? Ps(l, r) : o(l, r, t, a, n);
  return u === "" && typeof l == "object" && l !== null && l.nodeType !== BP ? "" : r.spacingOuter + t + u;
}).join(""), Ps = (e, r) => {
  const t = r.colors.content;
  return t.open + Es(e) + t.close;
}, LP = (e, r) => {
  const t = r.colors.comment;
  return t.open + "<!--" + Es(e) + "-->" + t.close;
}, kP = (e, r, t, a, n) => {
  const o = a.colors.tag;
  return o.open + "<" + e + (r && o.close + r + a.spacingOuter + n + o.open) + (t ? ">" + o.close + t + a.spacingOuter + n + o.open + "</" + e : (r && !a.min ? "" : " ") + "/") + ">" + o.close;
}, FP = (e, r) => {
  const t = r.colors.tag;
  return t.open + "<" + e + t.close + " …" + t.open + " />" + t.close;
}, DP = 1, qs = 3, ws = 8, xs = 11, jP = /^((HTML|SVG)\w*)?Element$/, HP = (e) => {
  const r = e.constructor.name, {
    nodeType: t,
    tagName: a
  } = e, n = typeof a == "string" && a.includes("-") || typeof e.hasAttribute == "function" && e.hasAttribute("is");
  return t === DP && (jP.test(r) || n) || t === qs && r === "Text" || t === ws && r === "Comment" || t === xs && r === "DocumentFragment";
};
function UP(e) {
  return e.nodeType === qs;
}
function zP(e) {
  return e.nodeType === ws;
}
function no(e) {
  return e.nodeType === xs;
}
function WP(e) {
  return {
    test: (r) => {
      var t;
      return (r == null || (t = r.constructor) == null ? void 0 : t.name) && HP(r);
    },
    serialize: (r, t, a, n, o, l) => {
      if (UP(r))
        return Ps(r.data, t);
      if (zP(r))
        return LP(r.data, t);
      const u = no(r) ? "DocumentFragment" : r.tagName.toLowerCase();
      return ++n > t.maxDepth ? FP(u, t) : kP(u, IP(no(r) ? [] : Array.from(r.attributes).map((i) => i.name).sort(), no(r) ? {} : Array.from(r.attributes).reduce((i, s) => (i[s.name] = s.value, i), {}), t, a + t.indent, n, o, l), NP(Array.prototype.slice.call(r.childNodes || r.children).filter(e), t, a + t.indent, n, o, l), t, a);
    }
  };
}
let Ss = null, Jo = null, Qo = null;
try {
  const e = module && module.require;
  Jo = e.call(module, "fs").readFileSync, Qo = e.call(module, "@babel/code-frame").codeFrameColumns, Ss = e.call(module, "chalk");
} catch {
}
function VP(e) {
  const r = e.indexOf("(") + 1, t = e.indexOf(")"), a = e.slice(r, t), n = a.split(":"), [o, l, u] = [n[0], parseInt(n[1], 10), parseInt(n[2], 10)];
  let i = "";
  try {
    i = Jo(o, "utf-8");
  } catch {
    return "";
  }
  const s = Qo(i, {
    start: {
      line: l,
      column: u
    }
  }, {
    highlightCode: !0,
    linesBelow: 0
  });
  return Ss.dim(a) + `
` + s + `
`;
}
function GP() {
  if (!Jo || !Qo)
    return "";
  const r = new Error().stack.split(`
`).slice(1).find((t) => !t.includes("node_modules/"));
  return VP(r);
}
const Ts = 3;
function oo() {
  return typeof jest < "u" && jest !== null ? (
    // legacy timers
    setTimeout._isMockFunction === !0 || // modern timers
    // eslint-disable-next-line prefer-object-has-own -- not supported by our support matrix
    Object.prototype.hasOwnProperty.call(setTimeout, "clock")
  ) : !1;
}
function Zo() {
  if (typeof window > "u")
    throw new Error("Could not find default container");
  return window.document;
}
function YP(e) {
  if (e.defaultView)
    return e.defaultView;
  if (e.ownerDocument && e.ownerDocument.defaultView)
    return e.ownerDocument.defaultView;
  if (e.window)
    return e.window;
  throw e.ownerDocument && e.ownerDocument.defaultView === null ? new Error("It looks like the window object is not available for the provided node.") : e.then instanceof Function ? new Error("It looks like you passed a Promise object instead of a DOM node. Did you do something like `fireEvent.click(screen.findBy...` when you meant to use a `getBy` query `fireEvent.click(screen.getBy...`, or await the findBy query `fireEvent.click(await screen.findBy...`?") : Array.isArray(e) ? new Error("It looks like you passed an Array instead of a DOM node. Did you do something like `fireEvent.click(screen.getAllBy...` when you meant to use a `getBy` query `fireEvent.click(screen.getBy...`?") : typeof e.debug == "function" && typeof e.logTestingPlaygroundURL == "function" ? new Error("It looks like you passed a `screen` object. Did you do something like `fireEvent.click(screen, ...` when you meant to use a query, e.g. `fireEvent.click(screen.getBy..., `?") : new Error("The given node is not an Element, the node type is: " + typeof e + ".");
}
function ie(e) {
  if (!e || typeof e.querySelector != "function" || typeof e.querySelectorAll != "function")
    throw new TypeError("Expected container to be an Element, a Document or a DocumentFragment but got " + r(e) + ".");
  function r(t) {
    return typeof t == "object" ? t === null ? "null" : t.constructor.name : typeof t;
  }
}
const KP = () => {
  let e;
  try {
    var r, t;
    e = JSON.parse((r = J) == null || (t = r.env) == null ? void 0 : t.COLORS);
  } catch {
  }
  return typeof e == "boolean" ? e : typeof J < "u" && J.versions !== void 0 && J.versions.node !== void 0;
}, {
  DOMCollection: XP
} = mu, JP = 1, QP = 8;
function ZP(e) {
  return e.nodeType !== QP && (e.nodeType !== JP || !e.matches(A().defaultIgnore));
}
function Nr(e, r, t) {
  if (t === void 0 && (t = {}), e || (e = Zo().body), typeof r != "number" && (r = typeof J < "u" && J.env.DEBUG_PRINT_LIMIT || 7e3), r === 0)
    return "";
  e.documentElement && (e = e.documentElement);
  let a = typeof e;
  if (a === "object" ? a = e.constructor.name : e = {}, !("outerHTML" in e))
    throw new TypeError("Expected an element or document but got " + a);
  const {
    filterNode: n = ZP,
    ...o
  } = t, l = _d(e, {
    plugins: [WP(n), XP],
    printFunctionName: !1,
    highlight: KP(),
    ...o
  });
  return r !== void 0 && e.outerHTML.length > r ? l.slice(0, r) + "..." : l;
}
const Ii = function() {
  const e = GP();
  console.log(e ? Nr(...arguments) + `

` + e : Nr(...arguments));
};
let Lr = {
  testIdAttribute: "data-testid",
  asyncUtilTimeout: 1e3,
  // asyncWrapper and advanceTimersWrapper is to support React's async `act` function.
  // forcing react-testing-library to wrap all async functions would've been
  // a total nightmare (consider wrapping every findBy* query and then also
  // updating `within` so those would be wrapped too. Total nightmare).
  // so we have this config option that's really only intended for
  // react-testing-library to use. For that reason, this feature will remain
  // undocumented.
  asyncWrapper: (e) => e(),
  unstable_advanceTimersWrapper: (e) => e(),
  eventWrapper: (e) => e(),
  // default value for the `hidden` option in `ByRole` queries
  defaultHidden: !1,
  // default value for the `ignore` option in `ByText` queries
  defaultIgnore: "script, style",
  // showOriginalStackTrace flag to show the full error stack traces for async errors
  showOriginalStackTrace: !1,
  // throw errors w/ suggestions for better queries. Opt in so off by default.
  throwSuggestions: !1,
  // called when getBy* queries fail. (message, container) => Error
  getElementError(e, r) {
    const t = Nr(r), a = new Error([e, "Ignored nodes: comments, " + Lr.defaultIgnore + `
` + t].filter(Boolean).join(`

`));
    return a.name = "TestingLibraryElementError", a;
  },
  _disableExpensiveErrorDiagnostics: !1,
  computedStyleSupportsPseudoElements: !1
};
function eq(e) {
  try {
    return Lr._disableExpensiveErrorDiagnostics = !0, e();
  } finally {
    Lr._disableExpensiveErrorDiagnostics = !1;
  }
}
function A() {
  return Lr;
}
const rq = ["button", "meter", "output", "progress", "select", "textarea", "input"];
function $s(e) {
  return rq.includes(e.nodeName.toLowerCase()) ? "" : e.nodeType === Ts ? e.textContent : Array.from(e.childNodes).map((r) => $s(r)).join("");
}
function wo(e) {
  let r;
  return e.tagName.toLowerCase() === "label" ? r = $s(e) : r = e.value || e.textContent, r;
}
function Os(e) {
  if (e.labels !== void 0) {
    var r;
    return (r = e.labels) != null ? r : [];
  }
  if (!tq(e))
    return [];
  const t = e.ownerDocument.querySelectorAll("label");
  return Array.from(t).filter((a) => a.control === e);
}
function tq(e) {
  return /BUTTON|METER|OUTPUT|PROGRESS|SELECT|TEXTAREA/.test(e.tagName) || e.tagName === "INPUT" && e.getAttribute("type") !== "hidden";
}
function Ms(e, r, t) {
  let {
    selector: a = "*"
  } = t === void 0 ? {} : t;
  const n = r.getAttribute("aria-labelledby"), o = n ? n.split(" ") : [];
  return o.length ? o.map((l) => {
    const u = e.querySelector('[id="' + l + '"]');
    return u ? {
      content: wo(u),
      formControl: null
    } : {
      content: "",
      formControl: null
    };
  }) : Array.from(Os(r)).map((l) => {
    const u = wo(l), i = "button, input, meter, output, progress, select, textarea", s = Array.from(l.querySelectorAll(i)).filter((f) => f.matches(a))[0];
    return {
      content: u,
      formControl: s
    };
  });
}
function As(e) {
  if (e == null)
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- implicitly converting `T` to `string`
      "It looks like " + e + " was passed instead of a matcher. Did you do something like getByText(" + e + ")?"
    );
}
function Ue(e, r, t, a) {
  if (typeof e != "string")
    return !1;
  As(t);
  const n = a(e);
  return typeof t == "string" || typeof t == "number" ? n.toLowerCase().includes(t.toString().toLowerCase()) : typeof t == "function" ? t(n, r) : Bs(t, n);
}
function oe(e, r, t, a) {
  if (typeof e != "string")
    return !1;
  As(t);
  const n = a(e);
  return t instanceof Function ? t(n, r) : t instanceof RegExp ? Bs(t, n) : n === String(t);
}
function Is(e) {
  let {
    trim: r = !0,
    collapseWhitespace: t = !0
  } = e === void 0 ? {} : e;
  return (a) => {
    let n = a;
    return n = r ? n.trim() : n, n = t ? n.replace(/\s+/g, " ") : n, n;
  };
}
function Me(e) {
  let {
    trim: r,
    collapseWhitespace: t,
    normalizer: a
  } = e;
  if (!a)
    return Is({
      trim: r,
      collapseWhitespace: t
    });
  if (typeof r < "u" || typeof t < "u")
    throw new Error('trim and collapseWhitespace are not supported with a normalizer. If you want to use the default trim and collapseWhitespace logic in your normalizer, use "getDefaultNormalizer({trim, collapseWhitespace})" and compose that into your normalizer');
  return a;
}
function Bs(e, r) {
  const t = e.test(r);
  return e.global && e.lastIndex !== 0 && (console.warn("To match all elements we had to reset the lastIndex of the RegExp because the global flag is enabled. We encourage to remove the global flag from the RegExp."), e.lastIndex = 0), t;
}
function $n(e) {
  return e.matches("input[type=submit], input[type=button], input[type=reset]") ? e.value : Array.from(e.childNodes).filter((r) => r.nodeType === Ts && !!r.textContent).map((r) => r.textContent).join("");
}
const aq = nq(_s);
function Ns(e) {
  return e.hidden === !0 || e.getAttribute("aria-hidden") === "true" || e.ownerDocument.defaultView.getComputedStyle(e).display === "none";
}
function el(e, r) {
  r === void 0 && (r = {});
  const {
    isSubtreeInaccessible: t = Ns
  } = r;
  if (e.ownerDocument.defaultView.getComputedStyle(e).visibility === "hidden")
    return !0;
  let n = e;
  for (; n; ) {
    if (t(n))
      return !0;
    n = n.parentElement;
  }
  return !1;
}
function rl(e) {
  for (const {
    match: r,
    roles: t
  } of aq)
    if (r(e))
      return [...t];
  return [];
}
function nq(e) {
  function r(l) {
    let {
      name: u,
      attributes: i
    } = l;
    return "" + u + i.map((s) => {
      let {
        name: f,
        value: d,
        constraints: m = []
      } = s;
      return m.indexOf("undefined") !== -1 ? ":not([" + f + "])" : d ? "[" + f + '="' + d + '"]' : "[" + f + "]";
    }).join("");
  }
  function t(l) {
    let {
      attributes: u = []
    } = l;
    return u.length;
  }
  function a(l, u) {
    let {
      specificity: i
    } = l, {
      specificity: s
    } = u;
    return s - i;
  }
  function n(l) {
    let {
      attributes: u = []
    } = l;
    const i = u.findIndex((f) => f.value && f.name === "type" && f.value === "text");
    i >= 0 && (u = [...u.slice(0, i), ...u.slice(i + 1)]);
    const s = r({
      ...l,
      attributes: u
    });
    return (f) => i >= 0 && f.type !== "text" ? !1 : f.matches(s);
  }
  let o = [];
  for (const [l, u] of e.entries())
    o = [...o, {
      match: n(l),
      roles: Array.from(u),
      specificity: t(l)
    }];
  return o.sort(a);
}
function oq(e, r) {
  let {
    hidden: t = !1
  } = r === void 0 ? {} : r;
  function a(n) {
    return [n, ...Array.from(n.children).reduce((o, l) => [...o, ...a(l)], [])];
  }
  return a(e).filter((n) => t === !1 ? el(n) === !1 : !0).reduce((n, o) => {
    let l = [];
    return o.hasAttribute("role") ? l = o.getAttribute("role").split(" ").slice(0, 1) : l = rl(o), l.reduce((u, i) => Array.isArray(u[i]) ? {
      ...u,
      [i]: [...u[i], o]
    } : {
      ...u,
      [i]: [o]
    }, n);
  }, {});
}
function lq(e, r) {
  let {
    hidden: t,
    includeDescription: a
  } = r;
  const n = oq(e, {
    hidden: t
  });
  return Object.entries(n).filter((o) => {
    let [l] = o;
    return l !== "generic";
  }).map((o) => {
    let [l, u] = o;
    const i = "-".repeat(50), s = u.map((f) => {
      const d = 'Name "' + jo(f, {
        computedStyleSupportsPseudoElements: A().computedStyleSupportsPseudoElements
      }) + `":
`, m = Nr(f.cloneNode(!1));
      if (a) {
        const C = 'Description "' + Au(f, {
          computedStyleSupportsPseudoElements: A().computedStyleSupportsPseudoElements
        }) + `":
`;
        return "" + d + C + m;
      }
      return "" + d + m;
    }).join(`

`);
    return l + `:

` + s + `

` + i;
  }).join(`
`);
}
function iq(e) {
  return e.tagName === "OPTION" ? e.selected : sr(e, "aria-selected");
}
function uq(e) {
  return e.getAttribute("aria-busy") === "true";
}
function sq(e) {
  if (!("indeterminate" in e && e.indeterminate))
    return "checked" in e ? e.checked : sr(e, "aria-checked");
}
function cq(e) {
  return sr(e, "aria-pressed");
}
function dq(e) {
  var r, t;
  return (r = (t = sr(e, "aria-current")) != null ? t : e.getAttribute("aria-current")) != null ? r : !1;
}
function fq(e) {
  return sr(e, "aria-expanded");
}
function sr(e, r) {
  const t = e.getAttribute(r);
  if (t === "true")
    return !0;
  if (t === "false")
    return !1;
}
function pq(e) {
  const r = {
    H1: 1,
    H2: 2,
    H3: 3,
    H4: 4,
    H5: 5,
    H6: 6
  };
  return e.getAttribute("aria-level") && Number(e.getAttribute("aria-level")) || r[e.tagName];
}
function mq(e) {
  const r = e.getAttribute("aria-valuenow");
  return r === null ? void 0 : +r;
}
function vq(e) {
  const r = e.getAttribute("aria-valuemax");
  return r === null ? void 0 : +r;
}
function bq(e) {
  const r = e.getAttribute("aria-valuemin");
  return r === null ? void 0 : +r;
}
function yq(e) {
  const r = e.getAttribute("aria-valuetext");
  return r === null ? void 0 : r;
}
const Bi = Is();
function hq(e) {
  return e.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}
function Ni(e) {
  return new RegExp(hq(e.toLowerCase()), "i");
}
function ue(e, r, t, a) {
  let {
    variant: n,
    name: o
  } = a, l = "";
  const u = {}, i = [["Role", "TestId"].includes(e) ? t : Ni(t)];
  o && (u.name = Ni(o)), e === "Role" && el(r) && (u.hidden = !0, l = `Element is inaccessible. This means that the element and all its children are invisible to screen readers.
    If you are using the aria-hidden prop, make sure this is the right choice for your case.
    `), Object.keys(u).length > 0 && i.push(u);
  const s = n + "By" + e;
  return {
    queryName: e,
    queryMethod: s,
    queryArgs: i,
    variant: n,
    warning: l,
    toString() {
      l && console.warn(l);
      let [f, d] = i;
      return f = typeof f == "string" ? "'" + f + "'" : f, d = d ? ", { " + Object.entries(d).map((m) => {
        let [C, w] = m;
        return C + ": " + w;
      }).join(", ") + " }" : "", s + "(" + f + d + ")";
    }
  };
}
function se(e, r, t) {
  return t && (!r || r.toLowerCase() === e.toLowerCase());
}
function xo(e, r, t) {
  var a, n;
  if (r === void 0 && (r = "get"), e.matches(A().defaultIgnore))
    return;
  const o = (a = e.getAttribute("role")) != null ? a : (n = rl(e)) == null ? void 0 : n[0];
  if (o !== "generic" && se("Role", t, o))
    return ue("Role", e, o, {
      variant: r,
      name: jo(e, {
        computedStyleSupportsPseudoElements: A().computedStyleSupportsPseudoElements
      })
    });
  const l = Ms(document, e).map((m) => m.content).join(" ");
  if (se("LabelText", t, l))
    return ue("LabelText", e, l, {
      variant: r
    });
  const u = e.getAttribute("placeholder");
  if (se("PlaceholderText", t, u))
    return ue("PlaceholderText", e, u, {
      variant: r
    });
  const i = Bi($n(e));
  if (se("Text", t, i))
    return ue("Text", e, i, {
      variant: r
    });
  if (se("DisplayValue", t, e.value))
    return ue("DisplayValue", e, Bi(e.value), {
      variant: r
    });
  const s = e.getAttribute("alt");
  if (se("AltText", t, s))
    return ue("AltText", e, s, {
      variant: r
    });
  const f = e.getAttribute("title");
  if (se("Title", t, f))
    return ue("Title", e, f, {
      variant: r
    });
  const d = e.getAttribute(A().testIdAttribute);
  if (se("TestId", t, d))
    return ue("TestId", e, d, {
      variant: r
    });
}
function hr(e, r) {
  e.stack = r.stack.replace(r.message, e.message);
}
function gq(e, r) {
  let {
    container: t = Zo(),
    timeout: a = A().asyncUtilTimeout,
    showOriginalStackTrace: n = A().showOriginalStackTrace,
    stackTraceError: o,
    interval: l = 50,
    onTimeout: u = (s) => (s.message = A().getElementError(s.message, t).message, s),
    mutationObserverOptions: i = {
      subtree: !0,
      childList: !0,
      attributes: !0,
      characterData: !0
    }
  } = r;
  if (typeof e != "function")
    throw new TypeError("Received `callback` arg must be a function");
  return new Promise(async (s, f) => {
    let d, m, C, w = !1, E = "idle";
    const S = setTimeout(q, a), c = oo();
    if (c) {
      const {
        unstable_advanceTimersWrapper: p
      } = A();
      for (R(); !w; ) {
        if (!oo()) {
          const b = new Error("Changed from using fake timers to real timers while using waitFor. This is not allowed and will result in very strange behavior. Please ensure you're awaiting all async things your test is doing before changing to real timers. For more info, please go to https://github.com/testing-library/dom-testing-library/issues/830");
          n || hr(b, o), f(b);
          return;
        }
        if (await p(async () => {
          jest.advanceTimersByTime(l);
        }), R(), w)
          break;
      }
    } else {
      try {
        ie(t);
      } catch (b) {
        f(b);
        return;
      }
      m = setInterval(_, l);
      const {
        MutationObserver: p
      } = YP(t);
      C = new p(_), C.observe(t, i), R();
    }
    function g(p, b) {
      w = !0, clearTimeout(S), c || (clearInterval(m), C.disconnect()), p ? f(p) : s(b);
    }
    function _() {
      if (oo()) {
        const p = new Error("Changed from using real timers to fake timers while using waitFor. This is not allowed and will result in very strange behavior. Please ensure you're awaiting all async things your test is doing before changing to fake timers. For more info, please go to https://github.com/testing-library/dom-testing-library/issues/830");
        return n || hr(p, o), f(p);
      } else
        return R();
    }
    function R() {
      if (E !== "pending")
        try {
          const p = eq(e);
          typeof (p == null ? void 0 : p.then) == "function" ? (E = "pending", p.then((b) => {
            E = "resolved", g(null, b);
          }, (b) => {
            E = "rejected", d = b;
          })) : g(null, p);
        } catch (p) {
          d = p;
        }
    }
    function q() {
      let p;
      d ? (p = d, !n && p.name === "TestingLibraryElementError" && hr(p, o)) : (p = new Error("Timed out in waitFor."), n || hr(p, o)), g(u(p), null);
    }
  });
}
function Rq(e, r) {
  const t = new Error("STACK_TRACE_MESSAGE");
  return A().asyncWrapper(() => gq(e, {
    stackTraceError: t,
    ...r
  }));
}
function Ls(e, r) {
  return A().getElementError(e, r);
}
function _q(e, r) {
  return Ls(e + "\n\n(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).", r);
}
function cr(e, r, t, a) {
  let {
    exact: n = !0,
    collapseWhitespace: o,
    trim: l,
    normalizer: u
  } = a === void 0 ? {} : a;
  const i = n ? oe : Ue, s = Me({
    collapseWhitespace: o,
    trim: l,
    normalizer: u
  });
  return Array.from(r.querySelectorAll("[" + e + "]")).filter((f) => i(f.getAttribute(e), f, t, s));
}
function kr(e, r) {
  return function(t) {
    for (var a = arguments.length, n = new Array(a > 1 ? a - 1 : 0), o = 1; o < a; o++)
      n[o - 1] = arguments[o];
    const l = e(t, ...n);
    if (l.length > 1) {
      const u = l.map((i) => Ls(null, i).message).join(`

`);
      throw _q(r(t, ...n) + `

Here are the matching elements:

` + u, t);
    }
    return l[0] || null;
  };
}
function ks(e, r) {
  return A().getElementError(`A better query is available, try this:
` + e.toString() + `
`, r);
}
function Cq(e, r) {
  return function(t) {
    for (var a = arguments.length, n = new Array(a > 1 ? a - 1 : 0), o = 1; o < a; o++)
      n[o - 1] = arguments[o];
    const l = e(t, ...n);
    if (!l.length)
      throw A().getElementError(r(t, ...n), t);
    return l;
  };
}
function Fr(e) {
  return (r, t, a, n) => Rq(() => e(r, t, a), {
    container: r,
    ...n
  });
}
const Le = (e, r, t) => function(a) {
  for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), l = 1; l < n; l++)
    o[l - 1] = arguments[l];
  const u = e(a, ...o), [{
    suggest: i = A().throwSuggestions
  } = {}] = o.slice(-1);
  if (u && i) {
    const s = xo(u, t);
    if (s && !r.endsWith(s.queryName))
      throw ks(s.toString(), a);
  }
  return u;
}, z = (e, r, t) => function(a) {
  for (var n = arguments.length, o = new Array(n > 1 ? n - 1 : 0), l = 1; l < n; l++)
    o[l - 1] = arguments[l];
  const u = e(a, ...o), [{
    suggest: i = A().throwSuggestions
  } = {}] = o.slice(-1);
  if (u.length && i) {
    const s = [...new Set(u.map((f) => {
      var d;
      return (d = xo(f, t)) == null ? void 0 : d.toString();
    }))];
    if (
      // only want to suggest if all the els have the same suggestion.
      s.length === 1 && !r.endsWith(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: Can this be null at runtime?
        xo(u[0], t).queryName
      )
    )
      throw ks(s[0], a);
  }
  return u;
};
function qe(e, r, t) {
  const a = Le(kr(e, r), e.name, "query"), n = Cq(e, t), o = kr(n, r), l = Le(o, e.name, "get"), u = z(n, e.name.replace("query", "get"), "getAll"), i = Fr(z(n, e.name, "findAll")), s = Fr(Le(o, e.name, "find"));
  return [a, u, l, i, s];
}
function Eq(e) {
  return Array.from(e.querySelectorAll("label,input")).map((r) => ({
    node: r,
    textToMatch: wo(r)
  })).filter((r) => {
    let {
      textToMatch: t
    } = r;
    return t !== null;
  });
}
const Pq = function(e, r, t) {
  let {
    exact: a = !0,
    trim: n,
    collapseWhitespace: o,
    normalizer: l
  } = t === void 0 ? {} : t;
  const u = a ? oe : Ue, i = Me({
    collapseWhitespace: o,
    trim: n,
    normalizer: l
  });
  return Eq(e).filter((f) => {
    let {
      node: d,
      textToMatch: m
    } = f;
    return u(m, d, r, i);
  }).map((f) => {
    let {
      node: d
    } = f;
    return d;
  });
}, nr = function(e, r, t) {
  let {
    selector: a = "*",
    exact: n = !0,
    collapseWhitespace: o,
    trim: l,
    normalizer: u
  } = t === void 0 ? {} : t;
  ie(e);
  const i = n ? oe : Ue, s = Me({
    collapseWhitespace: o,
    trim: l,
    normalizer: u
  }), f = Array.from(e.querySelectorAll("*")).filter((d) => Os(d).length || d.hasAttribute("aria-labelledby")).reduce((d, m) => {
    const C = Ms(e, m, {
      selector: a
    });
    C.filter((E) => !!E.formControl).forEach((E) => {
      i(E.content, E.formControl, r, s) && E.formControl && d.push(E.formControl);
    });
    const w = C.filter((E) => !!E.content).map((E) => E.content);
    return i(w.join(" "), m, r, s) && d.push(m), w.length > 1 && w.forEach((E, S) => {
      i(E, m, r, s) && d.push(m);
      const c = [...w];
      c.splice(S, 1), c.length > 1 && i(c.join(" "), m, r, s) && d.push(m);
    }), d;
  }, []).concat(cr("aria-label", e, r, {
    exact: n,
    normalizer: s
  }));
  return Array.from(new Set(f)).filter((d) => d.matches(a));
}, Se = function(e, r) {
  for (var t = arguments.length, a = new Array(t > 2 ? t - 2 : 0), n = 2; n < t; n++)
    a[n - 2] = arguments[n];
  const o = nr(e, r, ...a);
  if (!o.length) {
    const l = Pq(e, r, ...a);
    if (l.length) {
      const u = l.map((i) => qq(e, i)).filter((i) => !!i);
      throw u.length ? A().getElementError(u.map((i) => "Found a label with the text of: " + r + ", however the element associated with this label (<" + i + " />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <" + i + " />, you can use aria-label or aria-labelledby instead.").join(`

`), e) : A().getElementError("Found a label with the text of: " + r + `, however no form control was found associated to that label. Make sure you're using the "for" attribute or "aria-labelledby" attribute correctly.`, e);
    } else
      throw A().getElementError("Unable to find a label with the text of: " + r, e);
  }
  return o;
};
function qq(e, r) {
  const t = r.getAttribute("for");
  if (!t)
    return null;
  const a = e.querySelector('[id="' + t + '"]');
  return a ? a.tagName.toLowerCase() : null;
}
const Fs = (e, r) => "Found multiple elements with the text of: " + r, wq = Le(kr(nr, Fs), nr.name, "query"), Ds = kr(Se, Fs), xq = Fr(z(Se, Se.name, "findAll")), Sq = Fr(Le(Ds, Se.name, "find")), Tq = z(Se, Se.name, "getAll"), $q = Le(Ds, Se.name, "get"), Oq = z(nr, nr.name, "queryAll"), So = function() {
  for (var e = arguments.length, r = new Array(e), t = 0; t < e; t++)
    r[t] = arguments[t];
  return ie(r[0]), cr("placeholder", ...r);
}, Mq = (e, r) => "Found multiple elements with the placeholder text of: " + r, Aq = (e, r) => "Unable to find an element with the placeholder text of: " + r, Iq = z(So, So.name, "queryAll"), [Bq, Nq, Lq, kq, Fq] = qe(So, Mq, Aq), To = function(e, r, t) {
  let {
    selector: a = "*",
    exact: n = !0,
    collapseWhitespace: o,
    trim: l,
    ignore: u = A().defaultIgnore,
    normalizer: i
  } = t === void 0 ? {} : t;
  ie(e);
  const s = n ? oe : Ue, f = Me({
    collapseWhitespace: o,
    trim: l,
    normalizer: i
  });
  let d = [];
  return typeof e.matches == "function" && e.matches(a) && (d = [e]), [...d, ...Array.from(e.querySelectorAll(a))].filter((m) => !u || !m.matches(u)).filter((m) => s($n(m), m, r, f));
}, Dq = (e, r) => "Found multiple elements with the text: " + r, jq = function(e, r, t) {
  t === void 0 && (t = {});
  const {
    collapseWhitespace: a,
    trim: n,
    normalizer: o,
    selector: l
  } = t, i = Me({
    collapseWhitespace: a,
    trim: n,
    normalizer: o
  })(r.toString()), s = i !== r.toString(), f = (l ?? "*") !== "*";
  return "Unable to find an element with the text: " + (s ? i + " (normalized from '" + r + "')" : r) + (f ? ", which matches selector '" + l + "'" : "") + ". This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.";
}, Hq = z(To, To.name, "queryAll"), [Uq, zq, Wq, Vq, Gq] = qe(To, Dq, jq), $o = function(e, r, t) {
  let {
    exact: a = !0,
    collapseWhitespace: n,
    trim: o,
    normalizer: l
  } = t === void 0 ? {} : t;
  ie(e);
  const u = a ? oe : Ue, i = Me({
    collapseWhitespace: n,
    trim: o,
    normalizer: l
  });
  return Array.from(e.querySelectorAll("input,textarea,select")).filter((s) => s.tagName === "SELECT" ? Array.from(s.options).filter((d) => d.selected).some((d) => u($n(d), d, r, i)) : u(s.value, s, r, i));
}, Yq = (e, r) => "Found multiple elements with the display value: " + r + ".", Kq = (e, r) => "Unable to find an element with the display value: " + r + ".", Xq = z($o, $o.name, "queryAll"), [Jq, Qq, Zq, ew, rw] = qe($o, Yq, Kq), tw = /^(img|input|area|.+-.+)$/i, Oo = function(e, r, t) {
  return t === void 0 && (t = {}), ie(e), cr("alt", e, r, t).filter((a) => tw.test(a.tagName));
}, aw = (e, r) => "Found multiple elements with the alt text: " + r, nw = (e, r) => "Unable to find an element with the alt text: " + r, ow = z(Oo, Oo.name, "queryAll"), [lw, iw, uw, sw, cw] = qe(Oo, aw, nw), dw = (e) => {
  var r;
  return e.tagName.toLowerCase() === "title" && ((r = e.parentElement) == null ? void 0 : r.tagName.toLowerCase()) === "svg";
}, Mo = function(e, r, t) {
  let {
    exact: a = !0,
    collapseWhitespace: n,
    trim: o,
    normalizer: l
  } = t === void 0 ? {} : t;
  ie(e);
  const u = a ? oe : Ue, i = Me({
    collapseWhitespace: n,
    trim: o,
    normalizer: l
  });
  return Array.from(e.querySelectorAll("[title], svg > title")).filter((s) => u(s.getAttribute("title"), s, r, i) || dw(s) && u($n(s), s, r, i));
}, fw = (e, r) => "Found multiple elements with the title: " + r + ".", pw = (e, r) => "Unable to find an element with the title: " + r + ".", mw = z(Mo, Mo.name, "queryAll"), [vw, bw, yw, hw, gw] = qe(Mo, fw, pw), Ao = function(e, r, t) {
  let {
    hidden: a = A().defaultHidden,
    name: n,
    description: o,
    queryFallbacks: l = !1,
    selected: u,
    busy: i,
    checked: s,
    pressed: f,
    current: d,
    level: m,
    expanded: C,
    value: {
      now: w,
      min: E,
      max: S,
      text: c
    } = {}
  } = t === void 0 ? {} : t;
  if (ie(e), u !== void 0) {
    var g;
    if (((g = G.get(r)) == null ? void 0 : g.props["aria-selected"]) === void 0)
      throw new Error('"aria-selected" is not supported on role "' + r + '".');
  }
  if (i !== void 0) {
    var _;
    if (((_ = G.get(r)) == null ? void 0 : _.props["aria-busy"]) === void 0)
      throw new Error('"aria-busy" is not supported on role "' + r + '".');
  }
  if (s !== void 0) {
    var R;
    if (((R = G.get(r)) == null ? void 0 : R.props["aria-checked"]) === void 0)
      throw new Error('"aria-checked" is not supported on role "' + r + '".');
  }
  if (f !== void 0) {
    var q;
    if (((q = G.get(r)) == null ? void 0 : q.props["aria-pressed"]) === void 0)
      throw new Error('"aria-pressed" is not supported on role "' + r + '".');
  }
  if (d !== void 0) {
    var p;
    if (((p = G.get(r)) == null ? void 0 : p.props["aria-current"]) === void 0)
      throw new Error('"aria-current" is not supported on role "' + r + '".');
  }
  if (m !== void 0 && r !== "heading")
    throw new Error('Role "' + r + '" cannot have "level" property.');
  if (w !== void 0) {
    var b;
    if (((b = G.get(r)) == null ? void 0 : b.props["aria-valuenow"]) === void 0)
      throw new Error('"aria-valuenow" is not supported on role "' + r + '".');
  }
  if (S !== void 0) {
    var y;
    if (((y = G.get(r)) == null ? void 0 : y.props["aria-valuemax"]) === void 0)
      throw new Error('"aria-valuemax" is not supported on role "' + r + '".');
  }
  if (E !== void 0) {
    var I;
    if (((I = G.get(r)) == null ? void 0 : I.props["aria-valuemin"]) === void 0)
      throw new Error('"aria-valuemin" is not supported on role "' + r + '".');
  }
  if (c !== void 0) {
    var L;
    if (((L = G.get(r)) == null ? void 0 : L.props["aria-valuetext"]) === void 0)
      throw new Error('"aria-valuetext" is not supported on role "' + r + '".');
  }
  if (C !== void 0) {
    var k;
    if (((k = G.get(r)) == null ? void 0 : k.props["aria-expanded"]) === void 0)
      throw new Error('"aria-expanded" is not supported on role "' + r + '".');
  }
  const F = /* @__PURE__ */ new WeakMap();
  function h(x) {
    return F.has(x) || F.set(x, Ns(x)), F.get(x);
  }
  return Array.from(e.querySelectorAll(
    // Only query elements that can be matched by the following filters
    Rw(r)
  )).filter((x) => {
    if (x.hasAttribute("role")) {
      const U = x.getAttribute("role");
      if (l)
        return U.split(" ").filter(Boolean).some((On) => On === r);
      const [we] = U.split(" ");
      return we === r;
    }
    return rl(x).some((U) => U === r);
  }).filter((x) => {
    if (u !== void 0)
      return u === iq(x);
    if (i !== void 0)
      return i === uq(x);
    if (s !== void 0)
      return s === sq(x);
    if (f !== void 0)
      return f === cq(x);
    if (d !== void 0)
      return d === dq(x);
    if (C !== void 0)
      return C === fq(x);
    if (m !== void 0)
      return m === pq(x);
    if (w !== void 0 || S !== void 0 || E !== void 0 || c !== void 0) {
      let N = !0;
      if (w !== void 0 && N && (N = w === mq(x)), S !== void 0 && N && (N = S === vq(x)), E !== void 0 && N && (N = E === bq(x)), c !== void 0) {
        var H;
        N && (N = oe((H = yq(x)) != null ? H : null, x, c, (U) => U));
      }
      return N;
    }
    return !0;
  }).filter((x) => n === void 0 ? !0 : oe(jo(x, {
    computedStyleSupportsPseudoElements: A().computedStyleSupportsPseudoElements
  }), x, n, (H) => H)).filter((x) => o === void 0 ? !0 : oe(Au(x, {
    computedStyleSupportsPseudoElements: A().computedStyleSupportsPseudoElements
  }), x, o, (H) => H)).filter((x) => a === !1 ? el(x, {
    isSubtreeInaccessible: h
  }) === !1 : !0);
};
function Rw(e) {
  var r;
  const t = '*[role~="' + e + '"]', a = (r = Cs.get(e)) != null ? r : /* @__PURE__ */ new Set(), n = new Set(Array.from(a).map((o) => {
    let {
      name: l
    } = o;
    return l;
  }));
  return [t].concat(Array.from(n)).join(",");
}
const js = (e) => {
  let r = "";
  return e === void 0 ? r = "" : typeof e == "string" ? r = ' and name "' + e + '"' : r = " and name `" + e + "`", r;
}, _w = function(e, r, t) {
  let {
    name: a
  } = t === void 0 ? {} : t;
  return 'Found multiple elements with the role "' + r + '"' + js(a);
}, Cw = function(e, r, t) {
  let {
    hidden: a = A().defaultHidden,
    name: n,
    description: o
  } = t === void 0 ? {} : t;
  if (A()._disableExpensiveErrorDiagnostics)
    return 'Unable to find role="' + r + '"' + js(n);
  let l = "";
  Array.from(e.children).forEach((f) => {
    l += lq(f, {
      hidden: a,
      includeDescription: o !== void 0
    });
  });
  let u;
  l.length === 0 ? a === !1 ? u = "There are no accessible roles. But there might be some inaccessible roles. If you wish to access them, then set the `hidden` option to `true`. Learn more about this here: https://testing-library.com/docs/dom-testing-library/api-queries#byrole" : u = "There are no available roles." : u = (`
Here are the ` + (a === !1 ? "accessible" : "available") + ` roles:

  ` + l.replace(/\n/g, `
  `).replace(/\n\s\s\n/g, `

`) + `
`).trim();
  let i = "";
  n === void 0 ? i = "" : typeof n == "string" ? i = ' and name "' + n + '"' : i = " and name `" + n + "`";
  let s = "";
  return o === void 0 ? s = "" : typeof o == "string" ? s = ' and description "' + o + '"' : s = " and description `" + o + "`", (`
Unable to find an ` + (a === !1 ? "accessible " : "") + 'element with the role "' + r + '"' + i + s + `

` + u).trim();
}, Ew = z(Ao, Ao.name, "queryAll"), [Pw, qw, ww, xw, Sw] = qe(Ao, _w, Cw), tl = () => A().testIdAttribute, Io = function() {
  for (var e = arguments.length, r = new Array(e), t = 0; t < e; t++)
    r[t] = arguments[t];
  return ie(r[0]), cr(tl(), ...r);
}, Tw = (e, r) => "Found multiple elements by: [" + tl() + '="' + r + '"]', $w = (e, r) => "Unable to find an element by: [" + tl() + '="' + r + '"]', Ow = z(Io, Io.name, "queryAll"), [Mw, Aw, Iw, Bw, Nw] = qe(Io, Tw, $w);
var Bo = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  queryAllByLabelText: Oq,
  queryByLabelText: wq,
  getAllByLabelText: Tq,
  getByLabelText: $q,
  findAllByLabelText: xq,
  findByLabelText: Sq,
  queryByPlaceholderText: Bq,
  queryAllByPlaceholderText: Iq,
  getByPlaceholderText: Lq,
  getAllByPlaceholderText: Nq,
  findAllByPlaceholderText: kq,
  findByPlaceholderText: Fq,
  queryByText: Uq,
  queryAllByText: Hq,
  getByText: Wq,
  getAllByText: zq,
  findAllByText: Vq,
  findByText: Gq,
  queryByDisplayValue: Jq,
  queryAllByDisplayValue: Xq,
  getByDisplayValue: Zq,
  getAllByDisplayValue: Qq,
  findAllByDisplayValue: ew,
  findByDisplayValue: rw,
  queryByAltText: lw,
  queryAllByAltText: ow,
  getByAltText: uw,
  getAllByAltText: iw,
  findAllByAltText: sw,
  findByAltText: cw,
  queryByTitle: vw,
  queryAllByTitle: mw,
  getByTitle: yw,
  getAllByTitle: bw,
  findAllByTitle: hw,
  findByTitle: gw,
  queryByRole: Pw,
  queryAllByRole: Ew,
  getAllByRole: qw,
  getByRole: ww,
  findAllByRole: xw,
  findByRole: Sw,
  queryByTestId: Mw,
  queryAllByTestId: Ow,
  getByTestId: Iw,
  getAllByTestId: Aw,
  findAllByTestId: Bw,
  findByTestId: Nw
});
function Hs(e, r, t) {
  return r === void 0 && (r = Bo), t === void 0 && (t = {}), Object.keys(r).reduce((a, n) => {
    const o = r[n];
    return a[n] = o.bind(null, e), a;
  }, t);
}
const Lw = {
  // Clipboard Events
  copy: {
    EventType: "ClipboardEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  cut: {
    EventType: "ClipboardEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  paste: {
    EventType: "ClipboardEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  // Composition Events
  compositionEnd: {
    EventType: "CompositionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  compositionStart: {
    EventType: "CompositionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  compositionUpdate: {
    EventType: "CompositionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  // Keyboard Events
  keyDown: {
    EventType: "KeyboardEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      charCode: 0,
      composed: !0
    }
  },
  keyPress: {
    EventType: "KeyboardEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      charCode: 0,
      composed: !0
    }
  },
  keyUp: {
    EventType: "KeyboardEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      charCode: 0,
      composed: !0
    }
  },
  // Focus Events
  focus: {
    EventType: "FocusEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1,
      composed: !0
    }
  },
  blur: {
    EventType: "FocusEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1,
      composed: !0
    }
  },
  focusIn: {
    EventType: "FocusEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  focusOut: {
    EventType: "FocusEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  // Form Events
  change: {
    EventType: "Event",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  input: {
    EventType: "InputEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  invalid: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !0
    }
  },
  submit: {
    EventType: "Event",
    defaultInit: {
      bubbles: !0,
      cancelable: !0
    }
  },
  reset: {
    EventType: "Event",
    defaultInit: {
      bubbles: !0,
      cancelable: !0
    }
  },
  // Mouse Events
  click: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      button: 0,
      composed: !0
    }
  },
  contextMenu: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  dblClick: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  drag: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  dragEnd: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  dragEnter: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  dragExit: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  dragLeave: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  dragOver: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  dragStart: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  drop: {
    EventType: "DragEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  mouseDown: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  mouseEnter: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1,
      composed: !0
    }
  },
  mouseLeave: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1,
      composed: !0
    }
  },
  mouseMove: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  mouseOut: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  mouseOver: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  mouseUp: {
    EventType: "MouseEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  // Selection Events
  select: {
    EventType: "Event",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  // Touch Events
  touchCancel: {
    EventType: "TouchEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  touchEnd: {
    EventType: "TouchEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  touchMove: {
    EventType: "TouchEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  touchStart: {
    EventType: "TouchEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  // UI Events
  resize: {
    EventType: "UIEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  scroll: {
    EventType: "UIEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  // Wheel Events
  wheel: {
    EventType: "WheelEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  // Media Events
  abort: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  canPlay: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  canPlayThrough: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  durationChange: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  emptied: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  encrypted: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  ended: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  loadedData: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  loadedMetadata: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  loadStart: {
    EventType: "ProgressEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  pause: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  play: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  playing: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  progress: {
    EventType: "ProgressEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  rateChange: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  seeked: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  seeking: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  stalled: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  suspend: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  timeUpdate: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  volumeChange: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  waiting: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  // Events
  load: {
    // TODO: load events can be UIEvent or Event depending on what generated them
    // This is where this abstraction breaks down.
    // But the common targets are <img />, <script /> and window.
    // Neither of these targets receive a UIEvent
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  error: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  // Animation Events
  animationStart: {
    EventType: "AnimationEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  animationEnd: {
    EventType: "AnimationEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  animationIteration: {
    EventType: "AnimationEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  // Transition Events
  transitionCancel: {
    EventType: "TransitionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  transitionEnd: {
    EventType: "TransitionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0
    }
  },
  transitionRun: {
    EventType: "TransitionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  transitionStart: {
    EventType: "TransitionEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  // pointer events
  pointerOver: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  pointerEnter: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  pointerDown: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  pointerMove: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  pointerUp: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  pointerCancel: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  pointerOut: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !0,
      composed: !0
    }
  },
  pointerLeave: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  gotPointerCapture: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  lostPointerCapture: {
    EventType: "PointerEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1,
      composed: !0
    }
  },
  // history events
  popState: {
    EventType: "PopStateEvent",
    defaultInit: {
      bubbles: !0,
      cancelable: !1
    }
  },
  // window events
  offline: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  },
  online: {
    EventType: "Event",
    defaultInit: {
      bubbles: !1,
      cancelable: !1
    }
  }
}, kw = {
  doubleClick: "dblClick"
};
Object.keys(Lw).forEach((e) => {
  e.toLowerCase();
});
Object.keys(kw).forEach((e) => {
});
function Fw(e) {
  return e.replace(/[ \t]*[\n][ \t]*/g, `
`);
}
function Dw(e) {
  return AP.compressToEncodedURIComponent(Fw(e));
}
function jw(e) {
  return "https://testing-playground.com/#markup=" + Dw(e);
}
const Hw = (e, r, t) => Array.isArray(e) ? e.forEach((a) => Ii(a, r, t)) : Ii(e, r, t), Uw = function(e) {
  if (e === void 0 && (e = Zo().body), !e || !("innerHTML" in e)) {
    console.log("The element you're providing isn't a valid DOM element.");
    return;
  }
  if (!e.innerHTML) {
    console.log("The provided element doesn't have any children.");
    return;
  }
  const r = jw(e.innerHTML);
  return console.log(`Open this URL in your browser

` + r), r;
}, Li = {
  debug: Hw,
  logTestingPlaygroundURL: Uw
};
typeof document < "u" && document.body ? Hs(document.body, Bo, Li) : Object.keys(Bo).reduce((e, r) => (e[r] = () => {
  throw new TypeError("For queries bound to document.body a global document has to be available... Learn more: https://testing-library.com/s/screen-global-error");
}, e), Li);
function Dr(e) {
  return Dr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
    return typeof r;
  } : function(r) {
    return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
  }, Dr(e);
}
function zw(e, r) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(e) || function(t, a) {
    var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (n != null) {
      var o, l, u, i, s = [], f = !0, d = !1;
      try {
        if (u = (n = n.call(t)).next, a === 0) {
          if (Object(n) !== n)
            return;
          f = !1;
        } else
          for (; !(f = (o = u.call(n)).done) && (s.push(o.value), s.length !== a); f = !0)
            ;
      } catch (m) {
        d = !0, l = m;
      } finally {
        try {
          if (!f && n.return != null && (i = n.return(), Object(i) !== i))
            return;
        } finally {
          if (d)
            throw l;
        }
      }
      return s;
    }
  }(e, r) || function(t, a) {
    if (t) {
      if (typeof t == "string")
        return ki(t, a);
      var n = Object.prototype.toString.call(t).slice(8, -1);
      if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set")
        return Array.from(t);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return ki(t, a);
    }
  }(e, r) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function ki(e, r) {
  (r == null || r > e.length) && (r = e.length);
  for (var t = 0, a = new Array(r); t < r; t++)
    a[t] = e[t];
  return a;
}
var No = "data-lgid", Us = function() {
  for (var e = arguments.length, r = new Array(e), t = 0; t < e; t++)
    r[t] = arguments[t];
  return function(a) {
    if (!a || typeof a.querySelector != "function" || typeof a.querySelectorAll != "function")
      throw new TypeError("Expected container to be an Element, a Document or a DocumentFragment but got ".concat((n = a, Dr(n) === "object" ? n === null ? "null" : n.constructor.name : Dr(n)), "."));
    var n;
  }(r[0]), cr.apply(void 0, [No].concat(r));
}, dr = zw(qe(Us, function(e, r) {
  return "Found multiple elements by: [".concat(No, '="').concat(r, '"]');
}, function(e, r) {
  return "Unable to find an element by: [".concat(No, '="').concat(r, '"]');
}), 5), Ww = dr[0], Vw = dr[1], Gw = dr[2], Yw = dr[3], Kw = dr[4], Xw = Object.freeze({ __proto__: null, findAllByTestId: Yw, findByTestId: Kw, getAllByTestId: Vw, getByTestId: Gw, queryAllByTestId: Us, queryByTestId: Ww }), al = function() {
  var e = function() {
    if (typeof window < "u")
      return window.document;
  }();
  if (!e)
    return { findByLgId: void 0, getByLgId: void 0, queryByLgId: void 0 };
  var r = Hs(e.body, Xw);
  return { findByLgId: r.findByTestId, getByLgId: r.getByTestId, queryByLgId: r.queryByTestId };
}();
al.findByLgId;
al.getByLgId;
al.queryByLgId;
export {
  qe as b,
  Hs as g,
  cr as q
};
