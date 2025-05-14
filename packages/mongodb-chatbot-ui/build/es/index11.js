import * as h from "react";
import U, { useLayoutEffect as Ue, useEffect as Ye, forwardRef as kn, useRef as Bn, useState as se, useMemo as Vn, Fragment as Hn } from "react";
import { a as Ut } from "./jsx-dev-runtime.js";
import * as zn from "react-dom";
import { y as $n, m as C, aP as Wn, aQ as _n, aK as Zn, I as Xn, e as Un, aR as Yn, aI as qn, aS as Kn, aj as Qn, aT as Gn, X as Jn, n as J, N as to } from "./index2.js";
import { u as eo } from "./index9.js";
import { s as no } from "./Transition.js";
function Mt() {
  return typeof window < "u";
}
function ut(t) {
  return qe(t) ? (t.nodeName || "").toLowerCase() : "#document";
}
function H(t) {
  var e;
  return (t == null || (e = t.ownerDocument) == null ? void 0 : e.defaultView) || window;
}
function Q(t) {
  var e;
  return (e = (qe(t) ? t.ownerDocument : t.document) || window.document) == null ? void 0 : e.documentElement;
}
function qe(t) {
  return Mt() ? t instanceof Node || t instanceof H(t).Node : !1;
}
function D(t) {
  return Mt() ? t instanceof Element || t instanceof H(t).Element : !1;
}
function K(t) {
  return Mt() ? t instanceof HTMLElement || t instanceof H(t).HTMLElement : !1;
}
function le(t) {
  return !Mt() || typeof ShadowRoot > "u" ? !1 : t instanceof ShadowRoot || t instanceof H(t).ShadowRoot;
}
function vt(t) {
  const {
    overflow: e,
    overflowX: n,
    overflowY: o,
    display: r
  } = _(t);
  return /auto|scroll|overlay|hidden|clip/.test(e + o + n) && !["inline", "contents"].includes(r);
}
function oo(t) {
  return ["table", "td", "th"].includes(ut(t));
}
function Tt(t) {
  return [":popover-open", ":modal"].some((e) => {
    try {
      return t.matches(e);
    } catch {
      return !1;
    }
  });
}
function Yt(t) {
  const e = qt(), n = D(t) ? _(t) : t;
  return ["transform", "translate", "scale", "rotate", "perspective"].some((o) => n[o] ? n[o] !== "none" : !1) || (n.containerType ? n.containerType !== "normal" : !1) || !e && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !e && (n.filter ? n.filter !== "none" : !1) || ["transform", "translate", "scale", "rotate", "perspective", "filter"].some((o) => (n.willChange || "").includes(o)) || ["paint", "layout", "strict", "content"].some((o) => (n.contain || "").includes(o));
}
function ro(t) {
  let e = et(t);
  for (; K(e) && !at(e); ) {
    if (Yt(e))
      return e;
    if (Tt(e))
      return null;
    e = et(e);
  }
  return null;
}
function qt() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
function at(t) {
  return ["html", "body", "#document"].includes(ut(t));
}
function _(t) {
  return H(t).getComputedStyle(t);
}
function St(t) {
  return D(t) ? {
    scrollLeft: t.scrollLeft,
    scrollTop: t.scrollTop
  } : {
    scrollLeft: t.scrollX,
    scrollTop: t.scrollY
  };
}
function et(t) {
  if (ut(t) === "html")
    return t;
  const e = (
    // Step into the shadow DOM of the parent of a slotted node.
    t.assignedSlot || // DOM Element detected.
    t.parentNode || // ShadowRoot detected.
    le(t) && t.host || // Fallback.
    Q(t)
  );
  return le(e) ? e.host : e;
}
function Ke(t) {
  const e = et(t);
  return at(e) ? t.ownerDocument ? t.ownerDocument.body : t.body : K(e) && vt(e) ? e : Ke(e);
}
function ht(t, e, n) {
  var o;
  e === void 0 && (e = []), n === void 0 && (n = !0);
  const r = Ke(t), i = r === ((o = t.ownerDocument) == null ? void 0 : o.body), s = H(r);
  if (i) {
    const l = Vt(s);
    return e.concat(s, s.visualViewport || [], vt(r) ? r : [], l && n ? ht(l) : []);
  }
  return e.concat(r, ht(r, [], n));
}
function Vt(t) {
  return t.parent && Object.getPrototypeOf(t.parent) ? t.frameElement : null;
}
const Ht = Math.min, st = Math.max, Rt = Math.round, xt = Math.floor, q = (t) => ({
  x: t,
  y: t
}), io = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, so = {
  start: "end",
  end: "start"
};
function Kt(t, e) {
  return typeof t == "function" ? t(e) : t;
}
function ft(t) {
  return t.split("-")[0];
}
function Lt(t) {
  return t.split("-")[1];
}
function lo(t) {
  return t === "x" ? "y" : "x";
}
function Qe(t) {
  return t === "y" ? "height" : "width";
}
function lt(t) {
  return ["top", "bottom"].includes(ft(t)) ? "y" : "x";
}
function Ge(t) {
  return lo(lt(t));
}
function co(t, e, n) {
  n === void 0 && (n = !1);
  const o = Lt(t), r = Ge(t), i = Qe(r);
  let s = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return e.reference[i] > e.floating[i] && (s = Ct(s)), [s, Ct(s)];
}
function ao(t) {
  const e = Ct(t);
  return [zt(t), e, zt(e)];
}
function zt(t) {
  return t.replace(/start|end/g, (e) => so[e]);
}
function fo(t, e, n) {
  const o = ["left", "right"], r = ["right", "left"], i = ["top", "bottom"], s = ["bottom", "top"];
  switch (t) {
    case "top":
    case "bottom":
      return n ? e ? r : o : e ? o : r;
    case "left":
    case "right":
      return e ? i : s;
    default:
      return [];
  }
}
function uo(t, e, n, o) {
  const r = Lt(t);
  let i = fo(ft(t), n === "start", o);
  return r && (i = i.map((s) => s + "-" + r), e && (i = i.concat(i.map(zt)))), i;
}
function Ct(t) {
  return t.replace(/left|right|bottom|top/g, (e) => io[e]);
}
function mo(t) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...t
  };
}
function po(t) {
  return typeof t != "number" ? mo(t) : {
    top: t,
    right: t,
    bottom: t,
    left: t
  };
}
function Ot(t) {
  const {
    x: e,
    y: n,
    width: o,
    height: r
  } = t;
  return {
    width: o,
    height: r,
    top: n,
    left: e,
    right: e + o,
    bottom: n + r,
    x: e,
    y: n
  };
}
function ce(t, e, n) {
  let {
    reference: o,
    floating: r
  } = t;
  const i = lt(e), s = Ge(e), l = Qe(s), a = ft(e), f = i === "y", u = o.x + o.width / 2 - r.width / 2, c = o.y + o.height / 2 - r.height / 2, m = o[l] / 2 - r[l] / 2;
  let d;
  switch (a) {
    case "top":
      d = {
        x: u,
        y: o.y - r.height
      };
      break;
    case "bottom":
      d = {
        x: u,
        y: o.y + o.height
      };
      break;
    case "right":
      d = {
        x: o.x + o.width,
        y: c
      };
      break;
    case "left":
      d = {
        x: o.x - r.width,
        y: c
      };
      break;
    default:
      d = {
        x: o.x,
        y: o.y
      };
  }
  switch (Lt(e)) {
    case "start":
      d[s] -= m * (n && f ? -1 : 1);
      break;
    case "end":
      d[s] += m * (n && f ? -1 : 1);
      break;
  }
  return d;
}
const go = async (t, e, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: i = [],
    platform: s
  } = n, l = i.filter(Boolean), a = await (s.isRTL == null ? void 0 : s.isRTL(e));
  let f = await s.getElementRects({
    reference: t,
    floating: e,
    strategy: r
  }), {
    x: u,
    y: c
  } = ce(f, o, a), m = o, d = {}, p = 0;
  for (let y = 0; y < l.length; y++) {
    const {
      name: b,
      fn: v
    } = l[y], {
      x: R,
      y: g,
      data: E,
      reset: x
    } = await v({
      x: u,
      y: c,
      initialPlacement: o,
      placement: m,
      strategy: r,
      middlewareData: d,
      rects: f,
      platform: s,
      elements: {
        reference: t,
        floating: e
      }
    });
    u = R ?? u, c = g ?? c, d = {
      ...d,
      [b]: {
        ...d[b],
        ...E
      }
    }, x && p <= 50 && (p++, typeof x == "object" && (x.placement && (m = x.placement), x.rects && (f = x.rects === !0 ? await s.getElementRects({
      reference: t,
      floating: e,
      strategy: r
    }) : x.rects), {
      x: u,
      y: c
    } = ce(f, m, a)), y = -1);
  }
  return {
    x: u,
    y: c,
    placement: m,
    strategy: r,
    middlewareData: d
  };
};
async function ho(t, e) {
  var n;
  e === void 0 && (e = {});
  const {
    x: o,
    y: r,
    platform: i,
    rects: s,
    elements: l,
    strategy: a
  } = t, {
    boundary: f = "clippingAncestors",
    rootBoundary: u = "viewport",
    elementContext: c = "floating",
    altBoundary: m = !1,
    padding: d = 0
  } = Kt(e, t), p = po(d), b = l[m ? c === "floating" ? "reference" : "floating" : c], v = Ot(await i.getClippingRect({
    element: (n = await (i.isElement == null ? void 0 : i.isElement(b))) == null || n ? b : b.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(l.floating)),
    boundary: f,
    rootBoundary: u,
    strategy: a
  })), R = c === "floating" ? {
    x: o,
    y: r,
    width: s.floating.width,
    height: s.floating.height
  } : s.reference, g = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(l.floating)), E = await (i.isElement == null ? void 0 : i.isElement(g)) ? await (i.getScale == null ? void 0 : i.getScale(g)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, x = Ot(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: l,
    rect: R,
    offsetParent: g,
    strategy: a
  }) : R);
  return {
    top: (v.top - x.top + p.top) / E.y,
    bottom: (x.bottom - v.bottom + p.bottom) / E.y,
    left: (v.left - x.left + p.left) / E.x,
    right: (x.right - v.right + p.right) / E.x
  };
}
const vo = function(t) {
  return t === void 0 && (t = {}), {
    name: "flip",
    options: t,
    async fn(e) {
      var n, o;
      const {
        placement: r,
        middlewareData: i,
        rects: s,
        initialPlacement: l,
        platform: a,
        elements: f
      } = e, {
        mainAxis: u = !0,
        crossAxis: c = !0,
        fallbackPlacements: m,
        fallbackStrategy: d = "bestFit",
        fallbackAxisSideDirection: p = "none",
        flipAlignment: y = !0,
        ...b
      } = Kt(t, e);
      if ((n = i.arrow) != null && n.alignmentOffset)
        return {};
      const v = ft(r), R = lt(l), g = ft(l) === l, E = await (a.isRTL == null ? void 0 : a.isRTL(f.floating)), x = m || (g || !y ? [Ct(l)] : ao(l)), L = p !== "none";
      !m && L && x.push(...uo(l, y, p, E));
      const T = [l, ...x], k = await ho(e, b), $ = [];
      let j = ((o = i.flip) == null ? void 0 : o.overflows) || [];
      if (u && $.push(k[v]), c) {
        const z = co(r, s, E);
        $.push(k[z[0]], k[z[1]]);
      }
      if (j = [...j, {
        placement: r,
        overflows: $
      }], !$.every((z) => z <= 0)) {
        var G, nt;
        const z = (((G = i.flip) == null ? void 0 : G.index) || 0) + 1, B = T[z];
        if (B) {
          var W;
          const A = c === "alignment" ? R !== lt(B) : !1, S = ((W = j[0]) == null ? void 0 : W.overflows[0]) > 0;
          if (!A || S)
            return {
              data: {
                index: z,
                overflows: j
              },
              reset: {
                placement: B
              }
            };
        }
        let X = (nt = j.filter((A) => A.overflows[0] <= 0).sort((A, S) => A.overflows[1] - S.overflows[1])[0]) == null ? void 0 : nt.placement;
        if (!X)
          switch (d) {
            case "bestFit": {
              var Z;
              const A = (Z = j.filter((S) => {
                if (L) {
                  const N = lt(S.placement);
                  return N === R || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  N === "y";
                }
                return !0;
              }).map((S) => [S.placement, S.overflows.filter((N) => N > 0).reduce((N, Nt) => N + Nt, 0)]).sort((S, N) => S[1] - N[1])[0]) == null ? void 0 : Z[0];
              A && (X = A);
              break;
            }
            case "initialPlacement":
              X = l;
              break;
          }
        if (r !== X)
          return {
            reset: {
              placement: X
            }
          };
      }
      return {};
    }
  };
};
async function yo(t, e) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = t, i = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), s = ft(n), l = Lt(n), a = lt(n) === "y", f = ["left", "top"].includes(s) ? -1 : 1, u = i && a ? -1 : 1, c = Kt(e, t);
  let {
    mainAxis: m,
    crossAxis: d,
    alignmentAxis: p
  } = typeof c == "number" ? {
    mainAxis: c,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: c.mainAxis || 0,
    crossAxis: c.crossAxis || 0,
    alignmentAxis: c.alignmentAxis
  };
  return l && typeof p == "number" && (d = l === "end" ? p * -1 : p), a ? {
    x: d * u,
    y: m * f
  } : {
    x: m * f,
    y: d * u
  };
}
const wo = function(t) {
  return t === void 0 && (t = 0), {
    name: "offset",
    options: t,
    async fn(e) {
      var n, o;
      const {
        x: r,
        y: i,
        placement: s,
        middlewareData: l
      } = e, a = await yo(e, t);
      return s === ((n = l.offset) == null ? void 0 : n.placement) && (o = l.arrow) != null && o.alignmentOffset ? {} : {
        x: r + a.x,
        y: i + a.y,
        data: {
          ...a,
          placement: s
        }
      };
    }
  };
};
function Je(t) {
  const e = _(t);
  let n = parseFloat(e.width) || 0, o = parseFloat(e.height) || 0;
  const r = K(t), i = r ? t.offsetWidth : n, s = r ? t.offsetHeight : o, l = Rt(n) !== i || Rt(o) !== s;
  return l && (n = i, o = s), {
    width: n,
    height: o,
    $: l
  };
}
function Qt(t) {
  return D(t) ? t : t.contextElement;
}
function ct(t) {
  const e = Qt(t);
  if (!K(e))
    return q(1);
  const n = e.getBoundingClientRect(), {
    width: o,
    height: r,
    $: i
  } = Je(e);
  let s = (i ? Rt(n.width) : n.width) / o, l = (i ? Rt(n.height) : n.height) / r;
  return (!s || !Number.isFinite(s)) && (s = 1), (!l || !Number.isFinite(l)) && (l = 1), {
    x: s,
    y: l
  };
}
const xo = /* @__PURE__ */ q(0);
function tn(t) {
  const e = H(t);
  return !qt() || !e.visualViewport ? xo : {
    x: e.visualViewport.offsetLeft,
    y: e.visualViewport.offsetTop
  };
}
function bo(t, e, n) {
  return e === void 0 && (e = !1), !n || e && n !== H(t) ? !1 : e;
}
function rt(t, e, n, o) {
  e === void 0 && (e = !1), n === void 0 && (n = !1);
  const r = t.getBoundingClientRect(), i = Qt(t);
  let s = q(1);
  e && (o ? D(o) && (s = ct(o)) : s = ct(t));
  const l = bo(i, n, o) ? tn(i) : q(0);
  let a = (r.left + l.x) / s.x, f = (r.top + l.y) / s.y, u = r.width / s.x, c = r.height / s.y;
  if (i) {
    const m = H(i), d = o && D(o) ? H(o) : o;
    let p = m, y = Vt(p);
    for (; y && o && d !== p; ) {
      const b = ct(y), v = y.getBoundingClientRect(), R = _(y), g = v.left + (y.clientLeft + parseFloat(R.paddingLeft)) * b.x, E = v.top + (y.clientTop + parseFloat(R.paddingTop)) * b.y;
      a *= b.x, f *= b.y, u *= b.x, c *= b.y, a += g, f += E, p = H(y), y = Vt(p);
    }
  }
  return Ot({
    width: u,
    height: c,
    x: a,
    y: f
  });
}
function Gt(t, e) {
  const n = St(t).scrollLeft;
  return e ? e.left + n : rt(Q(t)).left + n;
}
function en(t, e, n) {
  n === void 0 && (n = !1);
  const o = t.getBoundingClientRect(), r = o.left + e.scrollLeft - (n ? 0 : (
    // RTL <body> scrollbar.
    Gt(t, o)
  )), i = o.top + e.scrollTop;
  return {
    x: r,
    y: i
  };
}
function Eo(t) {
  let {
    elements: e,
    rect: n,
    offsetParent: o,
    strategy: r
  } = t;
  const i = r === "fixed", s = Q(o), l = e ? Tt(e.floating) : !1;
  if (o === s || l && i)
    return n;
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  }, f = q(1);
  const u = q(0), c = K(o);
  if ((c || !c && !i) && ((ut(o) !== "body" || vt(s)) && (a = St(o)), K(o))) {
    const d = rt(o);
    f = ct(o), u.x = d.x + o.clientLeft, u.y = d.y + o.clientTop;
  }
  const m = s && !c && !i ? en(s, a, !0) : q(0);
  return {
    width: n.width * f.x,
    height: n.height * f.y,
    x: n.x * f.x - a.scrollLeft * f.x + u.x + m.x,
    y: n.y * f.y - a.scrollTop * f.y + u.y + m.y
  };
}
function Ro(t) {
  return Array.from(t.getClientRects());
}
function Co(t) {
  const e = Q(t), n = St(t), o = t.ownerDocument.body, r = st(e.scrollWidth, e.clientWidth, o.scrollWidth, o.clientWidth), i = st(e.scrollHeight, e.clientHeight, o.scrollHeight, o.clientHeight);
  let s = -n.scrollLeft + Gt(t);
  const l = -n.scrollTop;
  return _(o).direction === "rtl" && (s += st(e.clientWidth, o.clientWidth) - r), {
    width: r,
    height: i,
    x: s,
    y: l
  };
}
function Oo(t, e) {
  const n = H(t), o = Q(t), r = n.visualViewport;
  let i = o.clientWidth, s = o.clientHeight, l = 0, a = 0;
  if (r) {
    i = r.width, s = r.height;
    const f = qt();
    (!f || f && e === "fixed") && (l = r.offsetLeft, a = r.offsetTop);
  }
  return {
    width: i,
    height: s,
    x: l,
    y: a
  };
}
function Ao(t, e) {
  const n = rt(t, !0, e === "fixed"), o = n.top + t.clientTop, r = n.left + t.clientLeft, i = K(t) ? ct(t) : q(1), s = t.clientWidth * i.x, l = t.clientHeight * i.y, a = r * i.x, f = o * i.y;
  return {
    width: s,
    height: l,
    x: a,
    y: f
  };
}
function ae(t, e, n) {
  let o;
  if (e === "viewport")
    o = Oo(t, n);
  else if (e === "document")
    o = Co(Q(t));
  else if (D(e))
    o = Ao(e, n);
  else {
    const r = tn(t);
    o = {
      x: e.x - r.x,
      y: e.y - r.y,
      width: e.width,
      height: e.height
    };
  }
  return Ot(o);
}
function nn(t, e) {
  const n = et(t);
  return n === e || !D(n) || at(n) ? !1 : _(n).position === "fixed" || nn(n, e);
}
function Po(t, e) {
  const n = e.get(t);
  if (n)
    return n;
  let o = ht(t, [], !1).filter((l) => D(l) && ut(l) !== "body"), r = null;
  const i = _(t).position === "fixed";
  let s = i ? et(t) : t;
  for (; D(s) && !at(s); ) {
    const l = _(s), a = Yt(s);
    !a && l.position === "fixed" && (r = null), (i ? !a && !r : !a && l.position === "static" && !!r && ["absolute", "fixed"].includes(r.position) || vt(s) && !a && nn(t, s)) ? o = o.filter((u) => u !== s) : r = l, s = et(s);
  }
  return e.set(t, o), o;
}
function Mo(t) {
  let {
    element: e,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = t;
  const s = [...n === "clippingAncestors" ? Tt(e) ? [] : Po(e, this._c) : [].concat(n), o], l = s[0], a = s.reduce((f, u) => {
    const c = ae(e, u, r);
    return f.top = st(c.top, f.top), f.right = Ht(c.right, f.right), f.bottom = Ht(c.bottom, f.bottom), f.left = st(c.left, f.left), f;
  }, ae(e, l, r));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top
  };
}
function To(t) {
  const {
    width: e,
    height: n
  } = Je(t);
  return {
    width: e,
    height: n
  };
}
function So(t, e, n) {
  const o = K(e), r = Q(e), i = n === "fixed", s = rt(t, !0, i, e);
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const a = q(0);
  function f() {
    a.x = Gt(r);
  }
  if (o || !o && !i)
    if ((ut(e) !== "body" || vt(r)) && (l = St(e)), o) {
      const d = rt(e, !0, i, e);
      a.x = d.x + e.clientLeft, a.y = d.y + e.clientTop;
    } else
      r && f();
  i && !o && r && f();
  const u = r && !o && !i ? en(r, l) : q(0), c = s.left + l.scrollLeft - a.x - u.x, m = s.top + l.scrollTop - a.y - u.y;
  return {
    x: c,
    y: m,
    width: s.width,
    height: s.height
  };
}
function jt(t) {
  return _(t).position === "static";
}
function fe(t, e) {
  if (!K(t) || _(t).position === "fixed")
    return null;
  if (e)
    return e(t);
  let n = t.offsetParent;
  return Q(t) === n && (n = n.ownerDocument.body), n;
}
function on(t, e) {
  const n = H(t);
  if (Tt(t))
    return n;
  if (!K(t)) {
    let r = et(t);
    for (; r && !at(r); ) {
      if (D(r) && !jt(r))
        return r;
      r = et(r);
    }
    return n;
  }
  let o = fe(t, e);
  for (; o && oo(o) && jt(o); )
    o = fe(o, e);
  return o && at(o) && jt(o) && !Yt(o) ? n : o || ro(t) || n;
}
const Lo = async function(t) {
  const e = this.getOffsetParent || on, n = this.getDimensions, o = await n(t.floating);
  return {
    reference: So(t.reference, await e(t.floating), t.strategy),
    floating: {
      x: 0,
      y: 0,
      width: o.width,
      height: o.height
    }
  };
};
function No(t) {
  return _(t).direction === "rtl";
}
const Do = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Eo,
  getDocumentElement: Q,
  getClippingRect: Mo,
  getOffsetParent: on,
  getElementRects: Lo,
  getClientRects: Ro,
  getDimensions: To,
  getScale: ct,
  isElement: D,
  isRTL: No
};
function rn(t, e) {
  return t.x === e.x && t.y === e.y && t.width === e.width && t.height === e.height;
}
function jo(t, e) {
  let n = null, o;
  const r = Q(t);
  function i() {
    var l;
    clearTimeout(o), (l = n) == null || l.disconnect(), n = null;
  }
  function s(l, a) {
    l === void 0 && (l = !1), a === void 0 && (a = 1), i();
    const f = t.getBoundingClientRect(), {
      left: u,
      top: c,
      width: m,
      height: d
    } = f;
    if (l || e(), !m || !d)
      return;
    const p = xt(c), y = xt(r.clientWidth - (u + m)), b = xt(r.clientHeight - (c + d)), v = xt(u), g = {
      rootMargin: -p + "px " + -y + "px " + -b + "px " + -v + "px",
      threshold: st(0, Ht(1, a)) || 1
    };
    let E = !0;
    function x(L) {
      const T = L[0].intersectionRatio;
      if (T !== a) {
        if (!E)
          return s();
        T ? s(!1, T) : o = setTimeout(() => {
          s(!1, 1e-7);
        }, 1e3);
      }
      T === 1 && !rn(f, t.getBoundingClientRect()) && s(), E = !1;
    }
    try {
      n = new IntersectionObserver(x, {
        ...g,
        // Handle <iframe>s
        root: r.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(x, g);
    }
    n.observe(t);
  }
  return s(!0), i;
}
function Fo(t, e, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: i = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: l = typeof IntersectionObserver == "function",
    animationFrame: a = !1
  } = o, f = Qt(t), u = r || i ? [...f ? ht(f) : [], ...ht(e)] : [];
  u.forEach((v) => {
    r && v.addEventListener("scroll", n, {
      passive: !0
    }), i && v.addEventListener("resize", n);
  });
  const c = f && l ? jo(f, n) : null;
  let m = -1, d = null;
  s && (d = new ResizeObserver((v) => {
    let [R] = v;
    R && R.target === f && d && (d.unobserve(e), cancelAnimationFrame(m), m = requestAnimationFrame(() => {
      var g;
      (g = d) == null || g.observe(e);
    })), n();
  }), f && !a && d.observe(f), d.observe(e));
  let p, y = a ? rt(t) : null;
  a && b();
  function b() {
    const v = rt(t);
    y && !rn(y, v) && n(), y = v, p = requestAnimationFrame(b);
  }
  return n(), () => {
    var v;
    u.forEach((R) => {
      r && R.removeEventListener("scroll", n), i && R.removeEventListener("resize", n);
    }), c == null || c(), (v = d) == null || v.disconnect(), d = null, a && cancelAnimationFrame(p);
  };
}
const Io = wo, ko = vo, Bo = (t, e, n) => {
  const o = /* @__PURE__ */ new Map(), r = {
    platform: Do,
    ...n
  }, i = {
    ...r.platform,
    _c: o
  };
  return go(t, e, {
    ...r,
    platform: i
  });
};
var bt = typeof document < "u" ? Ue : Ye;
function At(t, e) {
  if (t === e)
    return !0;
  if (typeof t != typeof e)
    return !1;
  if (typeof t == "function" && t.toString() === e.toString())
    return !0;
  let n, o, r;
  if (t && e && typeof t == "object") {
    if (Array.isArray(t)) {
      if (n = t.length, n !== e.length)
        return !1;
      for (o = n; o-- !== 0; )
        if (!At(t[o], e[o]))
          return !1;
      return !0;
    }
    if (r = Object.keys(t), n = r.length, n !== Object.keys(e).length)
      return !1;
    for (o = n; o-- !== 0; )
      if (!{}.hasOwnProperty.call(e, r[o]))
        return !1;
    for (o = n; o-- !== 0; ) {
      const i = r[o];
      if (!(i === "_owner" && t.$$typeof) && !At(t[i], e[i]))
        return !1;
    }
    return !0;
  }
  return t !== t && e !== e;
}
function sn(t) {
  return typeof window > "u" ? 1 : (t.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function ue(t, e) {
  const n = sn(t);
  return Math.round(e * n) / n;
}
function Ft(t) {
  const e = h.useRef(t);
  return bt(() => {
    e.current = t;
  }), e;
}
function Vo(t) {
  t === void 0 && (t = {});
  const {
    placement: e = "bottom",
    strategy: n = "absolute",
    middleware: o = [],
    platform: r,
    elements: {
      reference: i,
      floating: s
    } = {},
    transform: l = !0,
    whileElementsMounted: a,
    open: f
  } = t, [u, c] = h.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: e,
    middlewareData: {},
    isPositioned: !1
  }), [m, d] = h.useState(o);
  At(m, o) || d(o);
  const [p, y] = h.useState(null), [b, v] = h.useState(null), R = h.useCallback((A) => {
    A !== L.current && (L.current = A, y(A));
  }, []), g = h.useCallback((A) => {
    A !== T.current && (T.current = A, v(A));
  }, []), E = i || p, x = s || b, L = h.useRef(null), T = h.useRef(null), k = h.useRef(u), $ = a != null, j = Ft(a), G = Ft(r), nt = Ft(f), W = h.useCallback(() => {
    if (!L.current || !T.current)
      return;
    const A = {
      placement: e,
      strategy: n,
      middleware: m
    };
    G.current && (A.platform = G.current), Bo(L.current, T.current, A).then((S) => {
      const N = {
        ...S,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: nt.current !== !1
      };
      Z.current && !At(k.current, N) && (k.current = N, zn.flushSync(() => {
        c(N);
      }));
    });
  }, [m, e, n, G, nt]);
  bt(() => {
    f === !1 && k.current.isPositioned && (k.current.isPositioned = !1, c((A) => ({
      ...A,
      isPositioned: !1
    })));
  }, [f]);
  const Z = h.useRef(!1);
  bt(() => (Z.current = !0, () => {
    Z.current = !1;
  }), []), bt(() => {
    if (E && (L.current = E), x && (T.current = x), E && x) {
      if (j.current)
        return j.current(E, x, W);
      W();
    }
  }, [E, x, W, j, $]);
  const z = h.useMemo(() => ({
    reference: L,
    floating: T,
    setReference: R,
    setFloating: g
  }), [R, g]), B = h.useMemo(() => ({
    reference: E,
    floating: x
  }), [E, x]), X = h.useMemo(() => {
    const A = {
      position: n,
      left: 0,
      top: 0
    };
    if (!B.floating)
      return A;
    const S = ue(B.floating, u.x), N = ue(B.floating, u.y);
    return l ? {
      ...A,
      transform: "translate(" + S + "px, " + N + "px)",
      ...sn(B.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: S,
      top: N
    };
  }, [n, l, B.floating, u.x, u.y]);
  return h.useMemo(() => ({
    ...u,
    update: W,
    refs: z,
    elements: B,
    floatingStyles: X
  }), [u, W, z, B, X]);
}
const Ho = (t, e) => ({
  ...Io(t),
  options: [t, e]
}), zo = (t, e) => ({
  ...ko(t),
  options: [t, e]
}), ln = {
  ...h
}, $o = ln.useInsertionEffect, Wo = $o || ((t) => t());
function _o(t) {
  const e = h.useRef(() => {
    if (Ut.env.NODE_ENV !== "production")
      throw new Error("Cannot call an event handler while rendering.");
  });
  return Wo(() => {
    e.current = t;
  }), h.useCallback(function() {
    for (var n = arguments.length, o = new Array(n), r = 0; r < n; r++)
      o[r] = arguments[r];
    return e.current == null ? void 0 : e.current(...o);
  }, []);
}
var $t = typeof document < "u" ? Ue : Ye;
let de = !1, Zo = 0;
const me = () => (
  // Ensure the id is unique with multiple independent versions of Floating UI
  // on <React 18
  "floating-ui-" + Math.random().toString(36).slice(2, 6) + Zo++
);
function Xo() {
  const [t, e] = h.useState(() => de ? me() : void 0);
  return $t(() => {
    t == null && e(me());
  }, []), h.useEffect(() => {
    de = !0;
  }, []), t;
}
const Uo = ln.useId, Yo = Uo || Xo;
let Wt;
Ut.env.NODE_ENV !== "production" && (Wt = /* @__PURE__ */ new Set());
function qo() {
  for (var t, e = arguments.length, n = new Array(e), o = 0; o < e; o++)
    n[o] = arguments[o];
  const r = "Floating UI: " + n.join(" ");
  if (!((t = Wt) != null && t.has(r))) {
    var i;
    (i = Wt) == null || i.add(r), console.error(r);
  }
}
function Ko() {
  const t = /* @__PURE__ */ new Map();
  return {
    emit(e, n) {
      var o;
      (o = t.get(e)) == null || o.forEach((r) => r(n));
    },
    on(e, n) {
      t.set(e, [...t.get(e) || [], n]);
    },
    off(e, n) {
      var o;
      t.set(e, ((o = t.get(e)) == null ? void 0 : o.filter((r) => r !== n)) || []);
    }
  };
}
const Qo = /* @__PURE__ */ h.createContext(null), Go = /* @__PURE__ */ h.createContext(null), Jo = () => {
  var t;
  return ((t = h.useContext(Qo)) == null ? void 0 : t.id) || null;
}, tr = () => h.useContext(Go);
function er(t) {
  const {
    open: e = !1,
    onOpenChange: n,
    elements: o
  } = t, r = Yo(), i = h.useRef({}), [s] = h.useState(() => Ko()), l = Jo() != null;
  if (Ut.env.NODE_ENV !== "production") {
    const d = o.reference;
    d && !D(d) && qo("Cannot pass a virtual element to the `elements.reference` option,", "as it must be a real DOM element. Use `refs.setPositionReference()`", "instead.");
  }
  const [a, f] = h.useState(o.reference), u = _o((d, p, y) => {
    i.current.openEvent = d ? p : void 0, s.emit("openchange", {
      open: d,
      event: p,
      reason: y,
      nested: l
    }), n == null || n(d, p, y);
  }), c = h.useMemo(() => ({
    setPositionReference: f
  }), []), m = h.useMemo(() => ({
    reference: a || o.reference || null,
    floating: o.floating || null,
    domReference: o.reference
  }), [a, o.reference, o.floating]);
  return h.useMemo(() => ({
    dataRef: i,
    open: e,
    onOpenChange: u,
    elements: m,
    events: s,
    floatingId: r,
    refs: c
  }), [e, u, m, s, r, c]);
}
function nr(t) {
  t === void 0 && (t = {});
  const {
    nodeId: e
  } = t, n = er({
    ...t,
    elements: {
      reference: null,
      floating: null,
      ...t.elements
    }
  }), o = t.rootContext || n, r = o.elements, [i, s] = h.useState(null), [l, a] = h.useState(null), u = (r == null ? void 0 : r.domReference) || i, c = h.useRef(null), m = tr();
  $t(() => {
    u && (c.current = u);
  }, [u]);
  const d = Vo({
    ...t,
    elements: {
      ...r,
      ...l && {
        reference: l
      }
    }
  }), p = h.useCallback((g) => {
    const E = D(g) ? {
      getBoundingClientRect: () => g.getBoundingClientRect(),
      contextElement: g
    } : g;
    a(E), d.refs.setReference(E);
  }, [d.refs]), y = h.useCallback((g) => {
    (D(g) || g === null) && (c.current = g, s(g)), (D(d.refs.reference.current) || d.refs.reference.current === null || // Don't allow setting virtual elements using the old technique back to
    // `null` to support `positionReference` + an unstable `reference`
    // callback ref.
    g !== null && !D(g)) && d.refs.setReference(g);
  }, [d.refs]), b = h.useMemo(() => ({
    ...d.refs,
    setReference: y,
    setPositionReference: p,
    domReference: c
  }), [d.refs, y, p]), v = h.useMemo(() => ({
    ...d.elements,
    domReference: u
  }), [d.elements, u]), R = h.useMemo(() => ({
    ...d,
    ...o,
    refs: b,
    elements: v,
    nodeId: e
  }), [d, b, v, e, o]);
  return $t(() => {
    o.dataRef.current.floatingContext = R;
    const g = m == null ? void 0 : m.nodesRef.current.find((E) => E.id === e);
    g && (g.context = R);
  }), h.useMemo(() => ({
    ...d,
    context: R,
    refs: b,
    elements: v
  }), [d, b, v, R]);
}
function pe(t, e) {
  var n = Object.keys(t);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(t);
    e && (o = o.filter(function(r) {
      return Object.getOwnPropertyDescriptor(t, r).enumerable;
    })), n.push.apply(n, o);
  }
  return n;
}
function dt(t) {
  for (var e = 1; e < arguments.length; e++) {
    var n = arguments[e] != null ? arguments[e] : {};
    e % 2 ? pe(Object(n), !0).forEach(function(o) {
      Et(t, o, n[o]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : pe(Object(n)).forEach(function(o) {
      Object.defineProperty(t, o, Object.getOwnPropertyDescriptor(n, o));
    });
  }
  return t;
}
function or(t) {
  var e = function(n, o) {
    if (typeof n != "object" || !n)
      return n;
    var r = n[Symbol.toPrimitive];
    if (r !== void 0) {
      var i = r.call(n, o);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(n);
  }(t, "string");
  return typeof e == "symbol" ? e : e + "";
}
function Et(t, e, n) {
  return (e = or(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 }) : t[e] = n, t;
}
function _t() {
  return _t = Object.assign ? Object.assign.bind() : function(t) {
    for (var e = 1; e < arguments.length; e++) {
      var n = arguments[e];
      for (var o in n)
        Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
    }
    return t;
  }, _t.apply(this, arguments);
}
function It(t, e) {
  if (t == null)
    return {};
  var n, o, r = function(s, l) {
    if (s == null)
      return {};
    var a, f, u = {}, c = Object.keys(s);
    for (f = 0; f < c.length; f++)
      a = c[f], l.indexOf(a) >= 0 || (u[a] = s[a]);
    return u;
  }(t, e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(t);
    for (o = 0; o < i.length; o++)
      n = i[o], e.indexOf(n) >= 0 || Object.prototype.propertyIsEnumerable.call(t, n) && (r[n] = t[n]);
  }
  return r;
}
function O(t, e) {
  return e || (e = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(e) } }));
}
function gt(t, e) {
  return function(n) {
    if (Array.isArray(n))
      return n;
  }(t) || function(n, o) {
    var r = n == null ? null : typeof Symbol < "u" && n[Symbol.iterator] || n["@@iterator"];
    if (r != null) {
      var i, s, l, a, f = [], u = !0, c = !1;
      try {
        if (l = (r = r.call(n)).next, o !== 0)
          for (; !(u = (i = l.call(r)).done) && (f.push(i.value), f.length !== o); u = !0)
            ;
      } catch (m) {
        c = !0, s = m;
      } finally {
        try {
          if (!u && r.return != null && (a = r.return(), Object(a) !== a))
            return;
        } finally {
          if (c)
            throw s;
        }
      }
      return f;
    }
  }(t, e) || function(n, o) {
    if (n) {
      if (typeof n == "string")
        return ge(n, o);
      var r = Object.prototype.toString.call(n).slice(8, -1);
      if (r === "Object" && n.constructor && (r = n.constructor.name), r === "Map" || r === "Set")
        return Array.from(n);
      if (r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
        return ge(n, o);
    }
  }(t, e) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function ge(t, e) {
  e > t.length && (e = t.length);
  for (var n = 0, o = new Array(e); n < e; n++)
    o[n] = t[n];
  return o;
}
var Y = { Inline: "inline", Portal: "portal", TopLayer: "top-layer" }, rr = { Auto: "auto", Manual: "manual" }, V = { Top: "top", Bottom: "bottom", Left: "left", Right: "right", CenterVertical: "center-vertical", CenterHorizontal: "center-horizontal" }, pt = { Start: "start", Middle: "middle", End: "end" }, he = "top", ve = "bottom", Zt = "left", Xt = "right", kt = "center", ir = { top: 0, bottom: 0, left: 0, right: 0, height: 0, width: 0 }, sr = function(t, e) {
  var n = t.getBoundingClientRect(), o = n.top, r = n.bottom, i = n.left, s = n.right, l = n.width;
  return { top: o, bottom: r, left: i, right: s, height: t.offsetHeight, width: l };
}, ye, we, xe, be, Ee, Re, Ce, Oe, Ae, Pe, Me, Te, Se, Le, Ne, De, je, Fe, Ie, ke, Be, Ve, He, ze, $e, We, _e, Ze, Xe, lr = function(t, e) {
  return t === V.CenterHorizontal && (t = V.Right), t === V.CenterVertical && (t = V.Bottom), e === pt.Middle ? t : "".concat(t, "-").concat(e);
}, cr = ["renderMode", "dismissMode", "onToggle", "portalClassName", "portalContainer", "portalRef", "scrollContainer", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited", "popoverZIndex", "spacing"];
function ar(t, e) {
  var n = gt(se(null), 2), o = n[0], r = n[1], i = gt(se(null), 2), s = i[0], l = i[1], a = qn(t == null ? void 0 : t.current), f = !Kn(a, t == null ? void 0 : t.current);
  Qn(function() {
    if (t && t.current)
      f && l(t.current);
    else {
      var c = o !== null && o.parentNode;
      c && c instanceof HTMLElement && l(c);
    }
  }, [f, o, t]);
  var u = Gn(Vn(function() {
    return function(c, m, d) {
      if (!c)
        return ir;
      var p = sr(c), y = p.top, b = p.bottom, v = p.left, R = p.right, g = p.height, E = p.width;
      if (m) {
        var x = m.scrollTop, L = m.scrollLeft, T = m.getBoundingClientRect();
        return { top: y + x - T.top, bottom: b + x - T.bottom, left: v + L - T.left, right: R + L - T.right, height: g, width: E };
      }
      var k = window, $ = k.scrollX, j = k.scrollY;
      return { top: y + j, bottom: b + j, left: v + $, right: R + $, height: g, width: E };
    }(s, e);
  }, [s, e]));
  return { referenceElement: s, referenceElDocumentPos: u, setPlaceholderElement: r };
}
var it = 0.8, Pt = Jn.default, fr = $n("popover-content"), ur = C(ye || (ye = O([`
  display: none;
`]))), dr = C(we || (we = O([`
  margin: 0;
  border: none;
  padding: 0;
  overflow: visible;
  background-color: transparent;
  width: max-content;

  transition-property: opacity, transform, overlay;
  transition-duration: `, `ms;
  transition-timing-function: ease-in-out;
  transition-behavior: allow-discrete;

  opacity: 0;
  transform: scale(`, `);

  &::backdrop {
    transition-property: background, overlay;
    transition-duration: `, `ms;
    transition-timing-function: ease-in-out;
    transition-behavior: allow-discrete;
  }
`])), Pt, it, Pt), mr = { top: C(be || (be = O([`
    transform-origin: bottom;
  `]))), "top-start": C(Ee || (Ee = O([`
    transform-origin: bottom left;
  `]))), "top-end": C(Re || (Re = O([`
    transform-origin: bottom right;
  `]))), bottom: C(Ce || (Ce = O([`
    transform-origin: top;
  `]))), "bottom-start": C(Oe || (Oe = O([`
    transform-origin: top left;
  `]))), "bottom-end": C(Ae || (Ae = O([`
    transform-origin: top right;
  `]))), left: C(Pe || (Pe = O([`
    transform-origin: right;
  `]))), "left-start": C(Me || (Me = O([`
    transform-origin: right top;
  `]))), "left-end": C(Te || (Te = O([`
    transform-origin: right bottom;
  `]))), right: C(Se || (Se = O([`
    transform-origin: left;
  `]))), "right-start": C(Le || (Le = O([`
    transform-origin: left top;
  `]))), "right-end": C(Ne || (Ne = O([`
    transform-origin: left bottom;
  `]))), center: C(De || (De = O([`
    transform-origin: center;
  `]))), "center-start": C(je || (je = O([`
    transform-origin: top;
  `]))), "center-end": C(Fe || (Fe = O([`
    transform-origin: bottom;
  `]))) }, mt = C(Ie || (Ie = O([`
  opacity: 0;
`]))), Bt = C($e || ($e = O([`
  opacity: 1;
  pointer-events: initial;

  &:popover-open {
    opacity: 1;

    pointer-events: initial;
  }
`]))), pr = function(t) {
  var e = t.className, n = t.left, o = t.placement, r = t.popoverZIndex, i = t.position, s = t.spacing, l = t.state, a = t.top, f = t.transformAlign;
  return J(dr, function(u) {
    var c = u.left, m = u.position, d = u.top;
    return C(xe || (xe = O([`
  left: `, `px;
  position: `, `;
  top: `, `px;
`])), c, m, d);
  }({ left: n, position: i, top: a }), mr[o], Et(Et(Et({}, function(u, c) {
    switch (c) {
      case he:
        return J(mt, C(ke || (ke = O([`
          transform: translate3d(0, `, `px, 0)
            scale(`, `);
        `])), u, it));
      case ve:
        return J(mt, C(Be || (Be = O([`
          transform: translate3d(0, -`, `px, 0)
            scale(`, `);
        `])), u, it));
      case Zt:
        return J(mt, C(Ve || (Ve = O([`
          transform: translate3d(`, `px, 0, 0)
            scale(`, `);
        `])), u, it));
      case Xt:
        return J(mt, C(He || (He = O([`
          transform: translate3d(-`, `px, 0, 0)
            scale(`, `);
        `])), u, it));
      default:
        return J(mt, C(ze || (ze = O([`
          transform: scale(`, `);
        `])), it));
    }
  }(s, f), l !== "entered"), function(u) {
    switch (u) {
      case he:
      case ve:
        return J(Bt, C(We || (We = O([`
          transform: translateY(0) scale(1);

          &:popover-open {
            transform: translateY(0) scale(1);
          }
        `]))));
      case Zt:
      case Xt:
        return J(Bt, C(_e || (_e = O([`
          transform: translateX(0) scale(1);

          &:popover-open {
            transform: translateX(0) scale(1);
          }
        `]))));
      default:
        return J(Bt, C(Ze || (Ze = O([`
          transform: scale(1);

          &:popover-open {
            transform: scale(1);
          }
        `]))));
    }
  }(f), l === "entered"), C(Xe || (Xe = O([`
        z-index: `, `;
      `])), r), typeof r == "number"), e);
}, gr = ["active", "adjustOnMutation", "align", "children", "className", "justify", "refEl"], hr = ["renderMode", "dismissMode", "onToggle", "usePortal", "portalClassName", "portalContainer", "portalRef", "scrollContainer", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited", "popoverZIndex", "spacing"], vr = kn(function(t, e) {
  var n = t.active, o = n !== void 0 && n;
  t.adjustOnMutation;
  var r = t.align, i = r === void 0 ? V.Bottom : r, s = t.children, l = t.className, a = t.justify, f = a === void 0 ? pt.Start : a, u = t.refEl, c = function(w) {
    var M = w.renderMode, P = w.dismissMode, F = w.onToggle, tt = w.portalClassName, wt = w.portalContainer, bn = w.portalRef, En = w.scrollContainer, Rn = w.onEnter, Cn = w.onEntering, On = w.onEntered, An = w.onExit, Pn = w.onExiting, Mn = w.onExited, Tn = w.popoverZIndex, Sn = w.spacing, Ln = It(w, cr), Nn = Wn().forceUseTopLayer, I = _n(), oe = Zn(), Dt = Nn ? Y.TopLayer : M || I.renderMode, re = Dt === Y.Portal, ie = Dt === Y.TopLayer, Dn = ie ? { dismissMode: P || I.dismissMode, onToggle: F || I.onToggle } : {}, jn = re ? { portalClassName: tt || I.portalClassName, portalContainer: wt || I.portalContainer || oe.portalContainer, portalRef: bn || I.portalRef, scrollContainer: En || I.scrollContainer || oe.scrollContainer } : {}, Fn = { onEnter: Rn || I.onEnter, onEntering: Cn || I.onEntering, onEntered: On || I.onEntered, onExit: An || I.onExit, onExiting: Pn || I.onExiting, onExited: Mn || I.onExited }, In = { popoverZIndex: ie ? void 0 : Tn || I.popoverZIndex, spacing: Sn || I.spacing };
    return dt(dt(dt(dt(dt({ renderMode: Dt, usePortal: re }, Dn), jn), Fn), In), Ln);
  }(It(t, gr)), m = c.renderMode, d = m === void 0 ? Y.TopLayer : m, p = c.dismissMode, y = p === void 0 ? rr.Auto : p, b = c.onToggle, v = c.usePortal, R = c.portalClassName, g = c.portalContainer, E = c.portalRef, x = c.scrollContainer, L = c.onEnter, T = c.onEntering, k = c.onEntered, $ = c.onExit, j = c.onExiting, G = c.onExited, nt = c.popoverZIndex, W = c.spacing, Z = W === void 0 ? to[100] : W, z = It(c, hr), B = Xn().setIsPopoverOpen;
  v && x && (x.contains(g) || Un.warn("To ensure correct positioning make sure that the portalContainer element is inside of the scrollContainer"));
  var X = v ? eo : Hn, A = v ? { className: g ? void 0 : R, container: g ?? void 0, portalRef: E } : {}, S = ar(u, x), N = S.referenceElement, Nt = S.referenceElDocumentPos, cn = S.setPlaceholderElement, Jt = function() {
    var w = gt(U.useState(null), 2), M = w[0], P = w[1], F = Bn(M);
    return F.current = M, { contentNode: M, contentNodeRef: F, setContentNode: P };
  }(), an = Jt.contentNodeRef, fn = Jt.setContentNode, ot = nr({ elements: { reference: N }, middleware: [Ho(function(w) {
    var M = w.rects;
    return function(P, F, tt) {
      return P === V.CenterHorizontal ? -tt.reference.width / 2 - tt.floating.width / 2 : P === V.CenterVertical ? -tt.reference.height / 2 - tt.floating.height / 2 : F;
    }(i, Z, M);
  }, [i, Z]), zo({ boundary: x ?? "clippingAncestors" })], open: o, placement: lr(i, f), strategy: d === Y.TopLayer ? "fixed" : "absolute", transform: !1, whileElementsMounted: Fo }), un = ot.context, yt = ot.elements, te = ot.placement, dn = ot.refs, mn = ot.strategy, pn = ot.x, gn = ot.y, hn = Yn([dn.setFloating, e]), ee = function(w) {
    var M = gt(w.split("-"), 2), P = M[0], F = M[1];
    return { align: P, justify: F || pt.Middle };
  }(te), vn = ee.align, yn = ee.justify, ne = function(w) {
    var M = w.placement, P = w.align, F = gt(M.split("-"), 2), tt = F[0], wt = F[1];
    if (P !== V.CenterHorizontal && P !== V.CenterVertical)
      return { placement: M, transformAlign: tt };
    if (wt === pt.Start) {
      if (P === V.CenterHorizontal)
        return { placement: "center-start", transformAlign: kt };
      if (P === V.CenterVertical)
        return { placement: "right", transformAlign: Xt };
    }
    if (wt === pt.End) {
      if (P === V.CenterHorizontal)
        return { placement: "center-end", transformAlign: kt };
      if (P === V.CenterVertical)
        return { placement: "left", transformAlign: Zt };
    }
    return { placement: "center", transformAlign: kt };
  }({ placement: te, align: i }), wn = ne.placement, xn = ne.transformAlign;
  return U.createElement(U.Fragment, null, U.createElement("span", { ref: cn, className: ur }), U.createElement(no, { nodeRef: an, in: un.open, timeout: { appear: 0, enter: Pt, exit: Pt }, onEnter: L, onEntering: function(w) {
    var M, P, F;
    d === Y.TopLayer && ((M = yt.floating) === null || M === void 0 || M.addEventListener("toggle", b), (P = yt.floating) === null || P === void 0 || (F = P.showPopover) === null || F === void 0 || F.call(P)), T == null || T(w);
  }, onEntered: function(w) {
    B(!0), k == null || k(w);
  }, onExit: $, onExiting: j, onExited: function() {
    var w, M, P;
    B(!1), d === Y.TopLayer && ((w = yt.floating) === null || w === void 0 || w.removeEventListener("toggle", b), (M = yt.floating) === null || M === void 0 || (P = M.hidePopover) === null || P === void 0 || P.call(M)), G == null || G();
  }, mountOnEnter: !0, unmountOnExit: !0, appear: !0 }, function(w) {
    return U.createElement(U.Fragment, null, U.createElement(X, A, U.createElement("div", _t({ ref: hn, className: pr({ className: l, left: pn, placement: wn, popoverZIndex: nt, position: mn, spacing: Z, state: w, top: gn, transformAlign: xn }), popover: d === Y.TopLayer ? y : void 0 }, z), U.createElement("div", { ref: fn, className: fr }, s === null ? null : typeof s == "function" ? s({ align: vn, justify: yn, referenceElPos: Nt }) : s))));
  }));
});
vr.displayName = "Popover";
var Rr = function(t) {
  var e = t.dismissMode, n = t.onToggle, o = t.portalClassName, r = t.portalContainer, i = t.portalRef, s = t.renderMode, l = t.scrollContainer;
  return s === Y.Inline ? { renderMode: s } : s === Y.Portal ? { renderMode: s, portalClassName: o, portalContainer: r, portalRef: i, scrollContainer: l } : { dismissMode: e, onToggle: n, renderMode: s };
};
export {
  pt as D,
  vr as H,
  V as Z,
  rr as a,
  Rr as b,
  Y as k
};
