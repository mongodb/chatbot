import D, { useState as et, useCallback as tt } from "react";
import { h as Be, g as nt, m as g, X as re, k as ie, F as k, b as j, z as at, d as rt, I as it, L as fe, l as ot, n as ne, j as ct, M as ut, p as st, i as lt } from "./index2.js";
import { p as ft, s as dt } from "./Transition.js";
import { l as pt } from "./X.js";
import { u as vt, K as bt } from "./index9.js";
import "./index8.js";
/*!
* tabbable 5.3.3
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
var qe = ["input", "select", "textarea", "a[href]", "button", "[tabindex]:not(slot)", "audio[controls]", "video[controls]", '[contenteditable]:not([contenteditable="false"])', "details>summary:first-of-type", "details"], Y = /* @__PURE__ */ qe.join(","), Ue = typeof Element > "u", I = Ue ? function() {
} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector, oe = !Ue && Element.prototype.getRootNode ? function(a) {
  return a.getRootNode();
} : function(a) {
  return a.ownerDocument;
}, ze = function(e, t, r) {
  var n = Array.prototype.slice.apply(e.querySelectorAll(Y));
  return t && I.call(e, Y) && n.unshift(e), n = n.filter(r), n;
}, Ge = function a(e, t, r) {
  for (var n = [], i = Array.from(e); i.length; ) {
    var u = i.shift();
    if (u.tagName === "SLOT") {
      var f = u.assignedElements(), p = f.length ? f : u.children, s = a(p, !0, r);
      r.flatten ? n.push.apply(n, s) : n.push({
        scope: u,
        candidates: s
      });
    } else {
      var v = I.call(u, Y);
      v && r.filter(u) && (t || !e.includes(u)) && n.push(u);
      var b = u.shadowRoot || // check for an undisclosed shadow
      typeof r.getShadowRoot == "function" && r.getShadowRoot(u), w = !r.shadowRootFilter || r.shadowRootFilter(u);
      if (b && w) {
        var E = a(b === !0 ? u.children : b.children, !0, r);
        r.flatten ? n.push.apply(n, E) : n.push({
          scope: u,
          candidates: E
        });
      } else
        i.unshift.apply(i, u.children);
    }
  }
  return n;
}, He = function(e, t) {
  return e.tabIndex < 0 && (t || /^(AUDIO|VIDEO|DETAILS)$/.test(e.tagName) || e.isContentEditable) && isNaN(parseInt(e.getAttribute("tabindex"), 10)) ? 0 : e.tabIndex;
}, ht = function(e, t) {
  return e.tabIndex === t.tabIndex ? e.documentOrder - t.documentOrder : e.tabIndex - t.tabIndex;
}, Ke = function(e) {
  return e.tagName === "INPUT";
}, yt = function(e) {
  return Ke(e) && e.type === "hidden";
}, mt = function(e) {
  var t = e.tagName === "DETAILS" && Array.prototype.slice.apply(e.children).some(function(r) {
    return r.tagName === "SUMMARY";
  });
  return t;
}, gt = function(e, t) {
  for (var r = 0; r < e.length; r++)
    if (e[r].checked && e[r].form === t)
      return e[r];
}, Ot = function(e) {
  if (!e.name)
    return !0;
  var t = e.form || oe(e), r = function(f) {
    return t.querySelectorAll('input[type="radio"][name="' + f + '"]');
  }, n;
  if (typeof window < "u" && typeof window.CSS < "u" && typeof window.CSS.escape == "function")
    n = r(window.CSS.escape(e.name));
  else
    try {
      n = r(e.name);
    } catch (u) {
      return console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", u.message), !1;
    }
  var i = gt(n, e.form);
  return !i || i === e;
}, Tt = function(e) {
  return Ke(e) && e.type === "radio";
}, wt = function(e) {
  return Tt(e) && !Ot(e);
}, de = function(e) {
  var t = e.getBoundingClientRect(), r = t.width, n = t.height;
  return r === 0 && n === 0;
}, Dt = function(e, t) {
  var r = t.displayCheck, n = t.getShadowRoot;
  if (getComputedStyle(e).visibility === "hidden")
    return !0;
  var i = I.call(e, "details>summary:first-of-type"), u = i ? e.parentElement : e;
  if (I.call(u, "details:not([open]) *"))
    return !0;
  var f = oe(e).host, p = (f == null ? void 0 : f.ownerDocument.contains(f)) || e.ownerDocument.contains(e);
  if (!r || r === "full") {
    if (typeof n == "function") {
      for (var s = e; e; ) {
        var v = e.parentElement, b = oe(e);
        if (v && !v.shadowRoot && n(v) === !0)
          return de(e);
        e.assignedSlot ? e = e.assignedSlot : !v && b !== e.ownerDocument ? e = b.host : e = v;
      }
      e = s;
    }
    if (p)
      return !e.getClientRects().length;
  } else if (r === "non-zero-area")
    return de(e);
  return !1;
}, Ft = function(e) {
  if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(e.tagName))
    for (var t = e.parentElement; t; ) {
      if (t.tagName === "FIELDSET" && t.disabled) {
        for (var r = 0; r < t.children.length; r++) {
          var n = t.children.item(r);
          if (n.tagName === "LEGEND")
            return I.call(t, "fieldset[disabled] *") ? !0 : !n.contains(e);
        }
        return !0;
      }
      t = t.parentElement;
    }
  return !1;
}, Z = function(e, t) {
  return !(t.disabled || yt(t) || Dt(t, e) || // For a details element with a summary, the summary element gets the focus
  mt(t) || Ft(t));
}, ce = function(e, t) {
  return !(wt(t) || He(t) < 0 || !Z(e, t));
}, kt = function(e) {
  var t = parseInt(e.getAttribute("tabindex"), 10);
  return !!(isNaN(t) || t >= 0);
}, Et = function a(e) {
  var t = [], r = [];
  return e.forEach(function(n, i) {
    var u = !!n.scope, f = u ? n.scope : n, p = He(f, u), s = u ? a(n.candidates) : f;
    p === 0 ? u ? t.push.apply(t, s) : t.push(f) : r.push({
      documentOrder: i,
      tabIndex: p,
      item: n,
      isScope: u,
      content: s
    });
  }), r.sort(ht).reduce(function(n, i) {
    return i.isScope ? n.push.apply(n, i.content) : n.push(i.content), n;
  }, []).concat(t);
}, Ve = function(e, t) {
  t = t || {};
  var r;
  return t.getShadowRoot ? r = Ge([e], t.includeContainer, {
    filter: ce.bind(null, t),
    flatten: !1,
    getShadowRoot: t.getShadowRoot,
    shadowRootFilter: kt
  }) : r = ze(e, t.includeContainer, ce.bind(null, t)), Et(r);
}, We = function(e, t) {
  t = t || {};
  var r;
  return t.getShadowRoot ? r = Ge([e], t.includeContainer, {
    filter: Z.bind(null, t),
    flatten: !0,
    getShadowRoot: t.getShadowRoot
  }) : r = ze(e, t.includeContainer, Z.bind(null, t)), r;
}, q = function(e, t) {
  if (t = t || {}, !e)
    throw new Error("No node provided");
  return I.call(e, Y) === !1 ? !1 : ce(t, e);
}, St = /* @__PURE__ */ qe.concat("iframe").join(","), X = function(e, t) {
  if (t = t || {}, !e)
    throw new Error("No node provided");
  return I.call(e, St) === !1 ? !1 : Z(t, e);
};
const Rt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  focusable: We,
  isFocusable: X,
  isTabbable: q,
  tabbable: Ve
}, Symbol.toStringTag, { value: "Module" }));
/*!
* focus-trap 6.9.4
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/
function pe(a, e) {
  var t = Object.keys(a);
  if (Object.getOwnPropertySymbols) {
    var r = Object.getOwnPropertySymbols(a);
    e && (r = r.filter(function(n) {
      return Object.getOwnPropertyDescriptor(a, n).enumerable;
    })), t.push.apply(t, r);
  }
  return t;
}
function ve(a) {
  for (var e = 1; e < arguments.length; e++) {
    var t = arguments[e] != null ? arguments[e] : {};
    e % 2 ? pe(Object(t), !0).forEach(function(r) {
      Ct(a, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(t)) : pe(Object(t)).forEach(function(r) {
      Object.defineProperty(a, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return a;
}
function Ct(a, e, t) {
  return e in a ? Object.defineProperty(a, e, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : a[e] = t, a;
}
var be = function() {
  var a = [];
  return {
    activateTrap: function(t) {
      if (a.length > 0) {
        var r = a[a.length - 1];
        r !== t && r.pause();
      }
      var n = a.indexOf(t);
      n === -1 || a.splice(n, 1), a.push(t);
    },
    deactivateTrap: function(t) {
      var r = a.indexOf(t);
      r !== -1 && a.splice(r, 1), a.length > 0 && a[a.length - 1].unpause();
    }
  };
}(), xt = function(e) {
  return e.tagName && e.tagName.toLowerCase() === "input" && typeof e.select == "function";
}, Pt = function(e) {
  return e.key === "Escape" || e.key === "Esc" || e.keyCode === 27;
}, Nt = function(e) {
  return e.key === "Tab" || e.keyCode === 9;
}, he = function(e) {
  return setTimeout(e, 0);
}, ye = function(e, t) {
  var r = -1;
  return e.every(function(n, i) {
    return t(n) ? (r = i, !1) : !0;
  }), r;
}, $ = function(e) {
  for (var t = arguments.length, r = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++)
    r[n - 1] = arguments[n];
  return typeof e == "function" ? e.apply(void 0, r) : e;
}, V = function(e) {
  return e.target.shadowRoot && typeof e.composedPath == "function" ? e.composedPath()[0] : e.target;
}, It = function(e, t) {
  var r = (t == null ? void 0 : t.document) || document, n = ve({
    returnFocusOnDeactivate: !0,
    escapeDeactivates: !0,
    delayInitialFocus: !0
  }, t), i = {
    // containers given to createFocusTrap()
    // @type {Array<HTMLElement>}
    containers: [],
    // list of objects identifying tabbable nodes in `containers` in the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{
    //   container: HTMLElement,
    //   tabbableNodes: Array<HTMLElement>, // empty if none
    //   focusableNodes: Array<HTMLElement>, // empty if none
    //   firstTabbableNode: HTMLElement|null,
    //   lastTabbableNode: HTMLElement|null,
    //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
    // }>}
    containerGroups: [],
    // same order/length as `containers` list
    // references to objects in `containerGroups`, but only those that actually have
    //  tabbable nodes in them
    // NOTE: same order as `containers` and `containerGroups`, but __not necessarily__
    //  the same length
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: !1,
    paused: !1,
    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: void 0
  }, u, f = function(o, c, d) {
    return o && o[c] !== void 0 ? o[c] : n[d || c];
  }, p = function(o) {
    return i.containerGroups.findIndex(function(c) {
      var d = c.container, m = c.tabbableNodes;
      return d.contains(o) || // fall back to explicit tabbable search which will take into consideration any
      //  web components if the `tabbableOptions.getShadowRoot` option was used for
      //  the trap, enabling shadow DOM support in tabbable (`Node.contains()` doesn't
      //  look inside web components even if open)
      m.find(function(h) {
        return h === o;
      });
    });
  }, s = function(o) {
    var c = n[o];
    if (typeof c == "function") {
      for (var d = arguments.length, m = new Array(d > 1 ? d - 1 : 0), h = 1; h < d; h++)
        m[h - 1] = arguments[h];
      c = c.apply(void 0, m);
    }
    if (c === !0 && (c = void 0), !c) {
      if (c === void 0 || c === !1)
        return c;
      throw new Error("`".concat(o, "` was specified but was not a node, or did not return a node"));
    }
    var T = c;
    if (typeof c == "string" && (T = r.querySelector(c), !T))
      throw new Error("`".concat(o, "` as selector refers to no known node"));
    return T;
  }, v = function() {
    var o = s("initialFocus");
    if (o === !1)
      return !1;
    if (o === void 0)
      if (p(r.activeElement) >= 0)
        o = r.activeElement;
      else {
        var c = i.tabbableGroups[0], d = c && c.firstTabbableNode;
        o = d || s("fallbackFocus");
      }
    if (!o)
      throw new Error("Your focus-trap needs to have at least one focusable element");
    return o;
  }, b = function() {
    if (i.containerGroups = i.containers.map(function(o) {
      var c = Ve(o, n.tabbableOptions), d = We(o, n.tabbableOptions);
      return {
        container: o,
        tabbableNodes: c,
        focusableNodes: d,
        firstTabbableNode: c.length > 0 ? c[0] : null,
        lastTabbableNode: c.length > 0 ? c[c.length - 1] : null,
        /**
         * Finds the __tabbable__ node that follows the given node in the specified direction,
         *  in this container, if any.
         * @param {HTMLElement} node
         * @param {boolean} [forward] True if going in forward tab order; false if going
         *  in reverse.
         * @returns {HTMLElement|undefined} The next tabbable node, if any.
         */
        nextTabbableNode: function(h) {
          var T = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0, S = d.findIndex(function(C) {
            return C === h;
          });
          if (!(S < 0))
            return T ? d.slice(S + 1).find(function(C) {
              return q(C, n.tabbableOptions);
            }) : d.slice(0, S).reverse().find(function(C) {
              return q(C, n.tabbableOptions);
            });
        }
      };
    }), i.tabbableGroups = i.containerGroups.filter(function(o) {
      return o.tabbableNodes.length > 0;
    }), i.tabbableGroups.length <= 0 && !s("fallbackFocus"))
      throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
  }, w = function y(o) {
    if (o !== !1 && o !== r.activeElement) {
      if (!o || !o.focus) {
        y(v());
        return;
      }
      o.focus({
        preventScroll: !!n.preventScroll
      }), i.mostRecentlyFocusedNode = o, xt(o) && o.select();
    }
  }, E = function(o) {
    var c = s("setReturnFocus", o);
    return c || (c === !1 ? !1 : o);
  }, R = function(o) {
    var c = V(o);
    if (!(p(c) >= 0)) {
      if ($(n.clickOutsideDeactivates, o)) {
        u.deactivate({
          // if, on deactivation, we should return focus to the node originally-focused
          //  when the trap was activated (or the configured `setReturnFocus` node),
          //  then assume it's also OK to return focus to the outside node that was
          //  just clicked, causing deactivation, as long as that node is focusable;
          //  if it isn't focusable, then return focus to the original node focused
          //  on activation (or the configured `setReturnFocus` node)
          // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
          //  which will result in the outside click setting focus to the node
          //  that was clicked, whether it's focusable or not; by setting
          //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
          //  on activation (or the configured `setReturnFocus` node)
          returnFocus: n.returnFocusOnDeactivate && !X(c, n.tabbableOptions)
        });
        return;
      }
      $(n.allowOutsideClick, o) || o.preventDefault();
    }
  }, z = function(o) {
    var c = V(o), d = p(c) >= 0;
    d || c instanceof Document ? d && (i.mostRecentlyFocusedNode = c) : (o.stopImmediatePropagation(), w(i.mostRecentlyFocusedNode || v()));
  }, ee = function(o) {
    var c = V(o);
    b();
    var d = null;
    if (i.tabbableGroups.length > 0) {
      var m = p(c), h = m >= 0 ? i.containerGroups[m] : void 0;
      if (m < 0)
        o.shiftKey ? d = i.tabbableGroups[i.tabbableGroups.length - 1].lastTabbableNode : d = i.tabbableGroups[0].firstTabbableNode;
      else if (o.shiftKey) {
        var T = ye(i.tabbableGroups, function(P) {
          var M = P.firstTabbableNode;
          return c === M;
        });
        if (T < 0 && (h.container === c || X(c, n.tabbableOptions) && !q(c, n.tabbableOptions) && !h.nextTabbableNode(c, !1)) && (T = m), T >= 0) {
          var S = T === 0 ? i.tabbableGroups.length - 1 : T - 1, C = i.tabbableGroups[S];
          d = C.lastTabbableNode;
        }
      } else {
        var x = ye(i.tabbableGroups, function(P) {
          var M = P.lastTabbableNode;
          return c === M;
        });
        if (x < 0 && (h.container === c || X(c, n.tabbableOptions) && !q(c, n.tabbableOptions) && !h.nextTabbableNode(c)) && (x = m), x >= 0) {
          var K = x === i.tabbableGroups.length - 1 ? 0 : x + 1, _ = i.tabbableGroups[K];
          d = _.firstTabbableNode;
        }
      }
    } else
      d = s("fallbackFocus");
    d && (o.preventDefault(), w(d));
  }, A = function(o) {
    if (Pt(o) && $(n.escapeDeactivates, o) !== !1) {
      o.preventDefault(), u.deactivate();
      return;
    }
    if (Nt(o)) {
      ee(o);
      return;
    }
  }, L = function(o) {
    var c = V(o);
    p(c) >= 0 || $(n.clickOutsideDeactivates, o) || $(n.allowOutsideClick, o) || (o.preventDefault(), o.stopImmediatePropagation());
  }, G = function() {
    if (i.active)
      return be.activateTrap(u), i.delayInitialFocusTimer = n.delayInitialFocus ? he(function() {
        w(v());
      }) : w(v()), r.addEventListener("focusin", z, !0), r.addEventListener("mousedown", R, {
        capture: !0,
        passive: !1
      }), r.addEventListener("touchstart", R, {
        capture: !0,
        passive: !1
      }), r.addEventListener("click", L, {
        capture: !0,
        passive: !1
      }), r.addEventListener("keydown", A, {
        capture: !0,
        passive: !1
      }), u;
  }, H = function() {
    if (i.active)
      return r.removeEventListener("focusin", z, !0), r.removeEventListener("mousedown", R, !0), r.removeEventListener("touchstart", R, !0), r.removeEventListener("click", L, !0), r.removeEventListener("keydown", A, !0), u;
  };
  return u = {
    get active() {
      return i.active;
    },
    get paused() {
      return i.paused;
    },
    activate: function(o) {
      if (i.active)
        return this;
      var c = f(o, "onActivate"), d = f(o, "onPostActivate"), m = f(o, "checkCanFocusTrap");
      m || b(), i.active = !0, i.paused = !1, i.nodeFocusedBeforeActivation = r.activeElement, c && c();
      var h = function() {
        m && b(), G(), d && d();
      };
      return m ? (m(i.containers.concat()).then(h, h), this) : (h(), this);
    },
    deactivate: function(o) {
      if (!i.active)
        return this;
      var c = ve({
        onDeactivate: n.onDeactivate,
        onPostDeactivate: n.onPostDeactivate,
        checkCanReturnFocus: n.checkCanReturnFocus
      }, o);
      clearTimeout(i.delayInitialFocusTimer), i.delayInitialFocusTimer = void 0, H(), i.active = !1, i.paused = !1, be.deactivateTrap(u);
      var d = f(c, "onDeactivate"), m = f(c, "onPostDeactivate"), h = f(c, "checkCanReturnFocus"), T = f(c, "returnFocus", "returnFocusOnDeactivate");
      d && d();
      var S = function() {
        he(function() {
          T && w(E(i.nodeFocusedBeforeActivation)), m && m();
        });
      };
      return T && h ? (h(E(i.nodeFocusedBeforeActivation)).then(S, S), this) : (S(), this);
    },
    pause: function() {
      return i.paused || !i.active ? this : (i.paused = !0, H(), this);
    },
    unpause: function() {
      return !i.paused || !i.active ? this : (i.paused = !1, b(), G(), this);
    },
    updateContainerElements: function(o) {
      var c = [].concat(o).filter(Boolean);
      return i.containers = c.map(function(d) {
        return typeof d == "string" ? r.querySelector(d) : d;
      }), i.active && b(), this;
    }
  }, u.updateContainerElements(e), u;
};
const jt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  createFocusTrap: It
}, Symbol.toStringTag, { value: "Module" })), At = /* @__PURE__ */ Be(jt), Lt = /* @__PURE__ */ Be(Rt);
function ue(a) {
  "@babel/helpers - typeof";
  return ue = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
    return typeof e;
  } : function(e) {
    return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
  }, ue(a);
}
function _t(a, e) {
  if (!(a instanceof e))
    throw new TypeError("Cannot call a class as a function");
}
function me(a, e) {
  for (var t = 0; t < e.length; t++) {
    var r = e[t];
    r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(a, r.key, r);
  }
}
function Mt(a, e, t) {
  return e && me(a.prototype, e), t && me(a, t), Object.defineProperty(a, "prototype", { writable: !1 }), a;
}
function $t(a, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Super expression must either be null or a function");
  a.prototype = Object.create(e && e.prototype, { constructor: { value: a, writable: !0, configurable: !0 } }), Object.defineProperty(a, "prototype", { writable: !1 }), e && se(a, e);
}
function se(a, e) {
  return se = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(r, n) {
    return r.__proto__ = n, r;
  }, se(a, e);
}
function Bt(a) {
  var e = Ut();
  return function() {
    var r = Q(a), n;
    if (e) {
      var i = Q(this).constructor;
      n = Reflect.construct(r, arguments, i);
    } else
      n = r.apply(this, arguments);
    return qt(this, n);
  };
}
function qt(a, e) {
  if (e && (ue(e) === "object" || typeof e == "function"))
    return e;
  if (e !== void 0)
    throw new TypeError("Derived constructors may only return object or undefined");
  return U(a);
}
function U(a) {
  if (a === void 0)
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  return a;
}
function Ut() {
  if (typeof Reflect > "u" || !Reflect.construct || Reflect.construct.sham)
    return !1;
  if (typeof Proxy == "function")
    return !0;
  try {
    return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    })), !0;
  } catch {
    return !1;
  }
}
function Q(a) {
  return Q = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
    return t.__proto__ || Object.getPrototypeOf(t);
  }, Q(a);
}
function zt(a, e, t) {
  return e in a ? Object.defineProperty(a, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : a[e] = t, a;
}
var W = D, l = ft, Gt = At, Ht = Gt.createFocusTrap, Kt = Lt, Vt = Kt.isFocusable, le = /* @__PURE__ */ function(a) {
  $t(t, a);
  var e = Bt(t);
  function t(r) {
    var n;
    _t(this, t), n = e.call(this, r), zt(U(n), "getNodeForOption", function(f) {
      var p, s = (p = this.internalOptions[f]) !== null && p !== void 0 ? p : this.originalOptions[f];
      if (typeof s == "function") {
        for (var v = arguments.length, b = new Array(v > 1 ? v - 1 : 0), w = 1; w < v; w++)
          b[w - 1] = arguments[w];
        s = s.apply(void 0, b);
      }
      if (s === !0 && (s = void 0), !s) {
        if (s === void 0 || s === !1)
          return s;
        throw new Error("`".concat(f, "` was specified but was not a node, or did not return a node"));
      }
      var E = s;
      if (typeof s == "string") {
        var R;
        if (E = (R = this.getDocument()) === null || R === void 0 ? void 0 : R.querySelector(s), !E)
          throw new Error("`".concat(f, "` as selector refers to no known node"));
      }
      return E;
    }), n.handleDeactivate = n.handleDeactivate.bind(U(n)), n.handlePostDeactivate = n.handlePostDeactivate.bind(U(n)), n.handleClickOutsideDeactivates = n.handleClickOutsideDeactivates.bind(U(n)), n.internalOptions = {
      // We need to hijack the returnFocusOnDeactivate option,
      // because React can move focus into the element before we arrived at
      // this lifecycle hook (e.g. with autoFocus inputs). So the component
      // captures the previouslyFocusedElement in componentWillMount,
      // then (optionally) returns focus to it in componentWillUnmount.
      returnFocusOnDeactivate: !1,
      // the rest of these are also related to deactivation of the trap, and we
      //  need to use them and control them as well
      checkCanReturnFocus: null,
      onDeactivate: n.handleDeactivate,
      onPostDeactivate: n.handlePostDeactivate,
      // we need to special-case this setting as well so that we can know if we should
      //  NOT return focus if the trap gets auto-deactivated as the result of an
      //  outside click (otherwise, we'll always think we should return focus because
      //  of how we manage that flag internally here)
      clickOutsideDeactivates: n.handleClickOutsideDeactivates
    }, n.originalOptions = {
      // because of the above `internalOptions`, we maintain our own flag for
      //  this option, and default it to `true` because that's focus-trap's default
      returnFocusOnDeactivate: !0,
      // because of the above `internalOptions`, we keep these separate since
      //  they're part of the deactivation process which we configure (internally) to
      //  be shared between focus-trap and focus-trap-react
      onDeactivate: null,
      onPostDeactivate: null,
      checkCanReturnFocus: null,
      // the user's setting, defaulted to false since focus-trap defaults this to false
      clickOutsideDeactivates: !1
    };
    var i = r.focusTrapOptions;
    for (var u in i)
      if (Object.prototype.hasOwnProperty.call(i, u)) {
        if (u === "returnFocusOnDeactivate" || u === "onDeactivate" || u === "onPostDeactivate" || u === "checkCanReturnFocus" || u === "clickOutsideDeactivates") {
          n.originalOptions[u] = i[u];
          continue;
        }
        n.internalOptions[u] = i[u];
      }
    return n.outsideClick = null, n.focusTrapElements = r.containerElements || [], n.updatePreviousElement(), n;
  }
  return Mt(t, [{
    key: "getDocument",
    value: function() {
      return this.props.focusTrapOptions.document || (typeof document < "u" ? document : void 0);
    }
    /**
     * Gets the node for the given option, which is expected to be an option that
     *  can be either a DOM node, a string that is a selector to get a node, `false`
     *  (if a node is explicitly NOT given), or a function that returns any of these
     *  values.
     * @param {string} optionName
     * @returns {undefined | false | HTMLElement | SVGElement} Returns
     *  `undefined` if the option is not specified; `false` if the option
     *  resolved to `false` (node explicitly not given); otherwise, the resolved
     *  DOM node.
     * @throws {Error} If the option is set, not `false`, and is not, or does not
     *  resolve to a node.
     */
  }, {
    key: "getReturnFocusNode",
    value: function() {
      var n = this.getNodeForOption("setReturnFocus", this.previouslyFocusedElement);
      return n || (n === !1 ? !1 : this.previouslyFocusedElement);
    }
    /** Update the previously focused element with the currently focused element. */
  }, {
    key: "updatePreviousElement",
    value: function() {
      var n = this.getDocument();
      n && (this.previouslyFocusedElement = n.activeElement);
    }
  }, {
    key: "deactivateTrap",
    value: function() {
      !this.focusTrap || !this.focusTrap.active || this.focusTrap.deactivate({
        // NOTE: we never let the trap return the focus since we do that ourselves
        returnFocus: !1,
        // we'll call this in our own post deactivate handler so make sure the trap doesn't
        //  do it prematurely
        checkCanReturnFocus: null,
        // let it call the user's original deactivate handler, if any, instead of
        //  our own which calls back into this function
        onDeactivate: this.originalOptions.onDeactivate
        // NOTE: for post deactivate, don't specify anything so that it calls the
        //  onPostDeactivate handler specified on `this.internalOptions`
        //  which will always be our own `handlePostDeactivate()` handler, which
        //  will finish things off by calling the user's provided onPostDeactivate
        //  handler, if any, at the right time
        // onPostDeactivate: NOTHING
      });
    }
  }, {
    key: "handleClickOutsideDeactivates",
    value: function(n) {
      var i = typeof this.originalOptions.clickOutsideDeactivates == "function" ? this.originalOptions.clickOutsideDeactivates.call(null, n) : this.originalOptions.clickOutsideDeactivates;
      return i && (this.outsideClick = {
        target: n.target,
        allowDeactivation: i
      }), i;
    }
  }, {
    key: "handleDeactivate",
    value: function() {
      this.originalOptions.onDeactivate && this.originalOptions.onDeactivate.call(null), this.deactivateTrap();
    }
  }, {
    key: "handlePostDeactivate",
    value: function() {
      var n = this, i = function() {
        var f = n.getReturnFocusNode(), p = !!// did the consumer allow it?
        (n.originalOptions.returnFocusOnDeactivate && // can we actually focus the node?
        f !== null && f !== void 0 && f.focus && // was there an outside click that allowed deactivation?
        (!n.outsideClick || // did the consumer allow deactivation when the outside node was clicked?
        n.outsideClick.allowDeactivation && // is the outside node NOT focusable (implying that it did NOT receive focus
        //  as a result of the click-through) -- in which case do NOT restore focus
        //  to `returnFocusNode` because focus should remain on the outside node
        !Vt(n.outsideClick.target, n.internalOptions.tabbableOptions))), s = n.internalOptions.preventScroll, v = s === void 0 ? !1 : s;
        p && f.focus({
          preventScroll: v
        }), n.originalOptions.onPostDeactivate && n.originalOptions.onPostDeactivate.call(null), n.outsideClick = null;
      };
      this.originalOptions.checkCanReturnFocus ? this.originalOptions.checkCanReturnFocus.call(null, this.getReturnFocusNode()).then(i, i) : i();
    }
  }, {
    key: "setupFocusTrap",
    value: function() {
      if (this.focusTrap)
        this.props.active && !this.focusTrap.active && (this.focusTrap.activate(), this.props.paused && this.focusTrap.pause());
      else {
        var n = this.focusTrapElements.some(Boolean);
        n && (this.focusTrap = this.props._createFocusTrap(this.focusTrapElements, this.internalOptions), this.props.active && this.focusTrap.activate(), this.props.paused && this.focusTrap.pause());
      }
    }
  }, {
    key: "componentDidMount",
    value: function() {
      this.props.active && this.setupFocusTrap();
    }
  }, {
    key: "componentDidUpdate",
    value: function(n) {
      if (this.focusTrap) {
        n.containerElements !== this.props.containerElements && this.focusTrap.updateContainerElements(this.props.containerElements);
        var i = !n.active && this.props.active, u = n.active && !this.props.active, f = !n.paused && this.props.paused, p = n.paused && !this.props.paused;
        if (i && (this.updatePreviousElement(), this.focusTrap.activate()), u) {
          this.deactivateTrap();
          return;
        }
        f && this.focusTrap.pause(), p && this.focusTrap.unpause();
      } else
        n.containerElements !== this.props.containerElements && (this.focusTrapElements = this.props.containerElements), this.props.active && (this.updatePreviousElement(), this.setupFocusTrap());
    }
  }, {
    key: "componentWillUnmount",
    value: function() {
      this.deactivateTrap();
    }
  }, {
    key: "render",
    value: function() {
      var n = this, i = this.props.children ? W.Children.only(this.props.children) : void 0;
      if (i) {
        if (i.type && i.type === W.Fragment)
          throw new Error("A focus-trap cannot use a Fragment as its child container. Try replacing it with a <div> element.");
        var u = function(s) {
          var v = n.props.containerElements;
          i && (typeof i.ref == "function" ? i.ref(s) : i.ref && (i.ref.current = s)), n.focusTrapElements = v || [s];
        }, f = W.cloneElement(i, {
          ref: u
        });
        return f;
      }
      return null;
    }
  }]), t;
}(W.Component), B = typeof Element > "u" ? Function : Element;
le.propTypes = {
  active: l.bool,
  paused: l.bool,
  focusTrapOptions: l.shape({
    document: l.object,
    onActivate: l.func,
    onPostActivate: l.func,
    checkCanFocusTrap: l.func,
    onDeactivate: l.func,
    onPostDeactivate: l.func,
    checkCanReturnFocus: l.func,
    initialFocus: l.oneOfType([l.instanceOf(B), l.string, l.bool, l.func]),
    fallbackFocus: l.oneOfType([
      l.instanceOf(B),
      l.string,
      // NOTE: does not support `false` as value (or return value from function)
      l.func
    ]),
    escapeDeactivates: l.oneOfType([l.bool, l.func]),
    clickOutsideDeactivates: l.oneOfType([l.bool, l.func]),
    returnFocusOnDeactivate: l.bool,
    setReturnFocus: l.oneOfType([l.instanceOf(B), l.string, l.bool, l.func]),
    allowOutsideClick: l.oneOfType([l.bool, l.func]),
    preventScroll: l.bool,
    tabbableOptions: l.shape({
      displayCheck: l.oneOf(["full", "non-zero-area", "none"]),
      getShadowRoot: l.oneOfType([l.bool, l.func])
    })
  }),
  containerElements: l.arrayOf(l.instanceOf(B)),
  // DOM element ONLY
  children: l.oneOfType([
    l.element,
    // React element
    l.instanceOf(B)
    // DOM element
  ])
  // NOTE: _createFocusTrap is internal, for testing purposes only, so we don't
  //  specify it here. It's expected to be set to the function returned from
  //  require('focus-trap'), or one with a compatible interface.
};
le.defaultProps = {
  active: !0,
  paused: !1,
  focusTrapOptions: {},
  _createFocusTrap: Ht
};
var Wt = le;
const Xt = /* @__PURE__ */ nt(Wt);
var ge, Xe = "lg-modal", Yt = function() {
  var a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Xe;
  return { root: a, close: "".concat(a, "-close") };
};
function Zt(a) {
  var e = function(t, r) {
    if (typeof t != "object" || !t)
      return t;
    var n = t[Symbol.toPrimitive];
    if (n !== void 0) {
      var i = n.call(t, r);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }(a, "string");
  return typeof e == "symbol" ? e : e + "";
}
function F(a, e, t) {
  return (e = Zt(e)) in a ? Object.defineProperty(a, e, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : a[e] = t, a;
}
function J() {
  return J = Object.assign ? Object.assign.bind() : function(a) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t)
        Object.prototype.hasOwnProperty.call(t, r) && (a[r] = t[r]);
    }
    return a;
  }, J.apply(this, arguments);
}
function Qt(a, e) {
  if (a == null)
    return {};
  var t, r, n = function(u, f) {
    if (u == null)
      return {};
    var p, s, v = {}, b = Object.keys(u);
    for (s = 0; s < b.length; s++)
      p = b[s], f.indexOf(p) >= 0 || (v[p] = u[p]);
    return v;
  }(a, e);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(a);
    for (r = 0; r < i.length; r++)
      t = i[r], e.indexOf(t) >= 0 || Object.prototype.propertyIsEnumerable.call(a, t) && (n[t] = a[t]);
  }
  return n;
}
function O(a, e) {
  return e || (e = a.slice(0)), Object.freeze(Object.defineProperties(a, { raw: { value: Object.freeze(e) } }));
}
function Jt(a, e) {
  return function(t) {
    if (Array.isArray(t))
      return t;
  }(a) || function(t, r) {
    var n = t == null ? null : typeof Symbol < "u" && t[Symbol.iterator] || t["@@iterator"];
    if (n != null) {
      var i, u, f, p, s = [], v = !0, b = !1;
      try {
        if (f = (n = n.call(t)).next, r !== 0)
          for (; !(v = (i = f.call(n)).done) && (s.push(i.value), s.length !== r); v = !0)
            ;
      } catch (w) {
        b = !0, u = w;
      } finally {
        try {
          if (!v && n.return != null && (p = n.return(), Object(p) !== p))
            return;
        } finally {
          if (b)
            throw u;
        }
      }
      return s;
    }
  }(a, e) || function(t, r) {
    if (t) {
      if (typeof t == "string")
        return Oe(t, r);
      var n = Object.prototype.toString.call(t).slice(8, -1);
      if (n === "Object" && t.constructor && (n = t.constructor.name), n === "Map" || n === "Set")
        return Array.from(t);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return Oe(t, r);
    }
  }(a, e) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function Oe(a, e) {
  e > a.length && (e = a.length);
  for (var t = 0, r = new Array(e); t < e; t++)
    r[t] = a[t];
  return r;
}
g(ge || (ge = O([`
  position: relative;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: right;
  flex-direction: row-reverse;
  padding: 24px 35px 35px;
`])));
var Te, we, De, Fe, ke, Ee, Se, Re, Ce, xe, Pe, Ne, Ie, je, Ae, Le, _e, Me, $e, N = { Default: "default", Dark: "dark", Light: "light" }, ae = { Small: "small", Default: "default", Large: "large" }, en = "".concat(lt.Desktop + 1, "px"), tn = g(Te || (Te = O([`
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity `, `ms ease-in-out;
`])), re.default), nn = F(F({}, j.Light, g(we || (we = O([`
    background-color: `, `;
  `])), ie(0.4, k.black))), j.Dark, g(De || (De = O([`
    background-color: `, `;
  `])), ie(0.4, k.gray.dark2))), an = g(Fe || (Fe = O([`
  opacity: 1;
`]))), rn = g(ke || (ke = O([`
  position: absolute;
  min-height: 100%;
  width: 100%;
  padding: `, "px ", `px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`])), 64, 18), on = g(Ee || (Ee = O([`
  font-family: `, `;
  transition: transform `, `ms ease-in-out,
    opacity `, `ms ease-in-out;
  margin: auto;
  max-height: calc(100% - `, `px);
  position: relative;
  pointer-events: all;
  transform: translate3d(0, -16px, 0);
  opacity: 0;
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow: 0px 8px 20px -8px `, `;

  &:focus {
    outline: none;
  }
`])), at.default, re.default, re.default, 64, ie(0.4, k.black)), cn = F(F({}, j.Light, g(Se || (Se = O([`
    color: `, `;
    background-color: `, `;
  `])), k.black, k.white)), j.Dark, g(Re || (Re = O([`
    color: `, `;
    background-color: `, `;
  `])), k.gray.light2, k.black)), un = g(Ce || (Ce = O([`
  transform: translate3d(0, 0, 0);
  opacity: 1;
`]))), sn = { small: g(xe || (xe = O([`
    width: 400px;
  `]))), default: g(Pe || (Pe = O([`
    width: 600px;
  `]))), large: g(Ne || (Ne = O([`
    width: 720px;

    @media only screen and (min-width: `, `) {
      width: 960px;
    }
  `])), en) }, ln = g(Ie || (Ie = O([`
  position: absolute;
  cursor: pointer;
  // x-icon should be 24px from edge. IconButton is 28x28 and Icon is 16x16
  // so there's already (28 - 16) / 2 = 6px of spacing. 24 - 6 = 18.
  right: 18px;
  top: 18px;
`]))), fn = F(F({}, j.Light, F(F(F({}, N.Default, g(je || (je = O([`
      color: `, `;
    `])), k.gray.dark1)), N.Dark, g(Ae || (Ae = O([`
      color: `, `;
    `])), k.black)), N.Light, g(Le || (Le = O([`
      color: `, `;
    `])), k.gray.light2))), j.Dark, F(F(F({}, N.Default, g(_e || (_e = O([`
      color: `, `;
    `])), k.gray.base)), N.Dark, g(Me || (Me = O([`
      color: `, `;
    `])), k.black)), N.Light, g($e || ($e = O([`
      color: `, `;
    `])), k.gray.light2))), dn = ["open", "size", "setOpen", "shouldClose", "closeIconColor", "darkMode", "id", "children", "className", "contentClassName", "initialFocus", "data-lgid"], Ye = D.forwardRef(function(a, e) {
  var t = a.open, r = t !== void 0 && t, n = a.size, i = n === void 0 ? ae.Default : n, u = a.setOpen, f = u === void 0 ? function() {
  } : u, p = a.shouldClose, s = p === void 0 ? function() {
    return !0;
  } : p, v = a.closeIconColor, b = v === void 0 ? N.Default : v, w = a.darkMode, E = a.id, R = a.children, z = a.className, ee = a.contentClassName, A = a.initialFocus, L = a["data-lgid"], G = L === void 0 ? Xe : L, H = Qt(a, dn), y = rt(w), o = y.theme, c = y.darkMode, d = D.useRef(null), m = e ?? d, h = Jt(et(null), 2), T = h[0], S = h[1], C = it().isPopoverOpen, x = tt(function() {
    f && s() && f(!1);
  }, [f, s]), K = fe({ prefix: "modal", id: E }), _ = fe({ prefix: "modal" }), P = Yt(G);
  ot(x, { enabled: r && !C });
  var M = A ? { initialFocus: "#".concat(K, " ").concat(A), fallbackFocus: "#".concat(_), escapeDeactivates: !1 } : { fallbackFocus: "#".concat(_), escapeDeactivates: !1 }, Qe = Object.values(ae).includes(i) ? i : ae.Default;
  return D.createElement(dt, { in: r, timeout: 150, mountOnEnter: !0, unmountOnExit: !0, nodeRef: d }, function(te) {
    return D.createElement(vt, null, D.createElement("div", J({}, H, { id: K, ref: m, className: ne(z, tn, nn[o], F({}, an, te === "entered")) }), D.createElement(ct, { darkMode: c }, D.createElement(Xt, { active: te === "entered", focusTrapOptions: M }, D.createElement("div", { className: rn, ref: function(Je) {
      return S(Je);
    } }, D.createElement("div", { "data-testid": P.root, "data-lgid": P.root, "aria-modal": "true", role: "dialog", tabIndex: -1, className: ne(on, cn[o], sn[Qe], F({}, un, te === "entered"), ee) }, D.createElement(ut, { popover: { portalContainer: T, scrollContainer: T } }, R, D.createElement(bt, { id: _, "data-testid": P.close, onClick: x, "aria-label": "Close modal", className: ne(ln, fn[o][b]) }, D.createElement(pt, null)))))))));
  });
});
Ye.displayName = "ModalView";
var pn = Ye, Ze = D.forwardRef(function(a, e) {
  return D.createElement(st, null, D.createElement(pn, J({}, a, { ref: e })));
});
Ze.displayName = "Modal";
var On = Ze;
export {
  On as k
};
