import z, { useRef as l, useState as O, useEffect as m, useCallback as x, useMemo as A, createContext as j, useContext as B } from "react";
function W(n, t) {
  var e = l(null), i = l(null);
  i.current = t;
  var r = l(null);
  m(function() {
    a();
  });
  var a = x(function() {
    var u = r.current, o = i.current, c = u || (o ? o instanceof Element ? o : o.current : null);
    e.current && e.current.element === c && e.current.subscriber === n || (e.current && e.current.cleanup && e.current.cleanup(), e.current = {
      element: c,
      subscriber: n,
      // Only calling the subscriber, if there's an actual element to report.
      // Setting cleanup to undefined unless a subscriber returns one, as an existing cleanup function would've been just called.
      cleanup: c ? n(c) : void 0
    });
  }, [n]);
  return m(function() {
    return function() {
      e.current && e.current.cleanup && (e.current.cleanup(), e.current = null);
    };
  }, []), x(function(u) {
    r.current = u, a();
  }, [a]);
}
function E(n, t, e) {
  return n[t] ? n[t][0] ? n[t][0][e] : (
    // TS complains about this, because the RO entry type follows the spec and does not reflect Firefox's current
    // behaviour of returning objects instead of arrays for `borderBoxSize` and `contentBoxSize`.
    // @ts-ignore
    n[t][e]
  ) : t === "contentBoxSize" ? n.contentRect[e === "inlineSize" ? "width" : "height"] : void 0;
}
function k(n) {
  n === void 0 && (n = {});
  var t = n.onResize, e = l(void 0);
  e.current = t;
  var i = n.round || Math.round, r = l(), a = O({
    width: void 0,
    height: void 0
  }), u = a[0], o = a[1], c = l(!1);
  m(function() {
    return c.current = !1, function() {
      c.current = !0;
    };
  }, []);
  var f = l({
    width: void 0,
    height: void 0
  }), d = W(x(function(v) {
    return (!r.current || r.current.box !== n.box || r.current.round !== i) && (r.current = {
      box: n.box,
      round: i,
      instance: new ResizeObserver(function(h) {
        var g = h[0], w = n.box === "border-box" ? "borderBoxSize" : n.box === "device-pixel-content-box" ? "devicePixelContentBoxSize" : "contentBoxSize", S = E(g, w, "inlineSize"), y = E(g, w, "blockSize"), s = S ? i(S) : void 0, b = y ? i(y) : void 0;
        if (f.current.width !== s || f.current.height !== b) {
          var R = {
            width: s,
            height: b
          };
          f.current.width = s, f.current.height = b, e.current ? e.current(R) : c.current || o(R);
        }
      })
    }), r.current.instance.observe(v, {
      box: n.box
    }), function() {
      r.current && r.current.instance.unobserve(v);
    };
  }, [n.box, i]), n.ref);
  return A(function() {
    return {
      ref: d,
      width: u.width,
      height: u.height
    };
  }, [d, u.width, u.height]);
}
function I(n, t) {
  return function(e) {
    if (Array.isArray(e))
      return e;
  }(n) || function(e, i) {
    var r = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (r != null) {
      var a, u, o, c, f = [], d = !0, v = !1;
      try {
        if (o = (r = r.call(e)).next, i !== 0)
          for (; !(d = (a = o.call(r)).done) && (f.push(a.value), f.length !== i); d = !0)
            ;
      } catch (h) {
        v = !0, u = h;
      } finally {
        try {
          if (!d && r.return != null && (c = r.return(), Object(c) !== c))
            return;
        } finally {
          if (v)
            throw u;
        }
      }
      return f;
    }
  }(n, t) || function(e, i) {
    if (e) {
      if (typeof e == "string")
        return p(e, i);
      var r = Object.prototype.toString.call(e).slice(8, -1);
      if (r === "Object" && e.constructor && (r = e.constructor.name), r === "Map" || r === "Set")
        return Array.from(e);
      if (r === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))
        return p(e, i);
    }
  }(n, t) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function p(n, t) {
  t > n.length && (t = n.length);
  for (var e = 0, i = new Array(t); e < t; e++)
    i[e] = n[e];
  return i;
}
var C = j({ containerWidth: void 0 }), H = function() {
  return B(C);
};
function M(n) {
  var t = n.children, e = I(O(), 2), i = e[0], r = e[1], a = k({ onResize: function(u) {
    var o = u.width;
    r(o);
  } }).ref;
  return z.createElement(C.Provider, { value: { containerWidth: i } }, z.createElement("div", { style: { width: "100%" }, ref: a }, t));
}
M.displayName = "LeafyGreenChatProvider";
export {
  M as c,
  H as u
};
