import { j as $ } from "./jsx-dev-runtime.js";
import { c as F, a as Ne } from "./Transition.js";
import { m as r, F as p, b as v, N as s, q as I, i as $e, o as Pe, d as z, R as A, n as L, j as Ee } from "./index2.js";
import f, { forwardRef as ze, useRef as U, useState as De, useCallback as Re, useEffect as H, lazy as Be } from "react";
import { X as Fe, v as Ie } from "./index7.js";
import "./index17.js";
import { t as Ae, b as Ue } from "./index4.js";
import { S as D, w as R, f as He } from "./index14.js";
import { u as _e } from "./index5.js";
import { U as Ze } from "./index10.js";
import { useChatbotContext as qe } from "./useChatbotContext.js";
import "react-dom";
import "./index8.js";
import "./index3.js";
import "./X.js";
import "./index9.js";
import "./index15.js";
import "./ChatbotProvider.js";
function Ve(t) {
  var n = function(e, a) {
    if (typeof e != "object" || !e)
      return e;
    var i = e[Symbol.toPrimitive];
    if (i !== void 0) {
      var u = i.call(e, a);
      if (typeof u != "object")
        return u;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(e);
  }(t, "string");
  return typeof n == "symbol" ? n : n + "";
}
function h(t, n, e) {
  return (n = Ve(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function l(t, n) {
  return n || (n = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(n) } }));
}
var _, Z, q, V, X, G, J, W, Y, K, Q, ee, te, ne, re, ae, ie, oe, le, se, ce, ue, de, me, T = { TopLeft: "top left", TopRight: "top right", BottomRight: "bottom right" }, pe = { Center: "center", Fill: "fill" };
r(_ || (_ = l([`
  position: absolute;
  z-index: -1;
`])));
h(h({}, v.Light, r(Z || (Z = l([`
    color: `, `;
  `])), p.purple.light3)), v.Dark, r(q || (q = l([`
    color: `, `;
  `])), p.gray.dark3));
h(h(h({}, T.TopLeft, { viewBox: "0 0 265 501", path: "M-10.0239 -12.0209L154.458 -12.0208C215.515 -12.0208 265 52.2446 265 131.538C265 210.041 215.934 273.615 155.523 273.467L98.8817 273.318C68.886 273.269 44.5623 304.808 44.5623 343.714L44.5623 346.186C44.5623 385.091 20.2765 416.581 -9.64308 416.581L-10.709 416.581C-40.7047 416.581 -64.9905 448.219 -64.9144 487.174C-64.8382 526.129 -89.1241 557.767 -119.12 557.767L-120.604 557.767C-150.524 557.767 -174.772 526.277 -174.81 487.421L-175 201.242C-175.038 162.336 -150.752 130.797 -120.795 130.797L-118.435 130.797C-88.477 130.797 -64.2292 99.2574 -64.2292 60.4015L-64.2292 58.3251C-64.2292 19.5186 -39.9815 -12.0209 -10.0239 -12.0209Z", styles: r(V || (V = l([`
      top: 0;
      left: 0;
      width: 265px;
      max-width: 80%;
    `]))) }), T.TopRight, { viewBox: "0 0 342 368", path: "M474 92.9761L474 257.458C474 318.515 420.538 368 354.575 368C289.269 368 236.383 318.934 236.506 258.523L236.63 201.882C236.671 171.886 210.434 147.562 178.069 147.562L176.012 147.562C143.648 147.562 117.451 123.277 117.451 93.357L117.451 92.291C117.451 62.2953 91.1317 38.0095 58.7256 38.0857C26.3196 38.1618 -4.40929e-07 13.876 -3.06323e-06 -16.1197L-3.19302e-06 -17.6043C-5.80867e-06 -47.5239 26.1962 -71.7716 58.52 -71.8097L296.589 -72C328.954 -72.038 355.192 -47.7522 355.192 -17.7946L355.192 -15.4346C355.192 14.5231 381.429 38.7708 413.753 38.7708L415.48 38.7708C447.763 38.7708 474 63.0185 474 92.9761Z", styles: r(X || (X = l([`
      top: 0;
      right: 0;
      width: 342px;
      max-width: 80%;
    `]))) }), T.BottomRight, { viewBox: "0 0 322 501", path: "M323.778 501L130.139 501C58.2575 501 -2.75101e-06 434.759 -6.14535e-06 353.027C-9.50583e-06 272.11 57.7646 206.582 128.884 206.735L195.566 206.888C230.88 206.939 259.515 174.43 259.515 134.328L259.515 131.78C259.515 91.6788 288.106 59.2206 323.33 59.2206L324.585 59.2206C359.898 59.2206 388.489 26.6094 388.399 -13.5431C388.309 -53.6956 416.901 -86.3068 452.214 -86.3068L453.961 -86.3068C489.185 -86.3068 517.731 -53.8486 517.776 -13.798L518 281.18C518.045 321.282 489.454 353.791 454.185 353.791L451.407 353.791C416.139 353.791 387.593 386.3 387.593 426.351L387.593 428.491C387.593 468.491 359.046 501 323.778 501Z", styles: r(G || (G = l([`
      right: 0;
      bottom: 0;
      width: 322px;
      max-width: 70%;
    `]))) });
var Xe = r(J || (J = l([`
  padding-top: 48px;
  padding-bottom: `, `px;
`])), s[4]), Ge = r(W || (W = l([`
  padding-bottom: `, `px;
  position: relative;
`])), s[4]);
h(h({}, pe.Center, Xe), pe.Fill, Ge);
r(Y || (Y = l([`
  display: flex;
  align-items: center;
  justify-content: center;
`])));
r(K || (K = l([`
  width: 100%;
`])));
r(Q || (Q = l([`
  display: block;
`])));
r(ee || (ee = l([`
  position: absolute;
  left: 0;
  bottom: `, `px;
`])), s[4]);
h(h({}, v.Light, r(te || (te = l([`
    color: `, `;
  `])), p.white)), v.Dark, r(ne || (ne = l([`
    color: `, `;
  `])), p.black));
r(re || (re = l([`
  margin-bottom: `, `px;
`])), s[1]);
r(ae || (ae = l([`
  width: 600px;
  padding: initial;
  overflow: hidden;
`])));
r(ie || (ie = l([`
  text-align: center;
  padding: 0 20px 32px;
  max-width: 476px;
  margin: 0 auto;
`])));
r(oe || (oe = l([`
  font-size: `, `px;
  line-height: `, `px;
`])), I.body1.fontSize, I.body1.lineHeight);
h(h({}, v.Light, r(le || (le = l([`
    color: `, `;
  `])), p.black)), v.Dark, r(se || (se = l([`
    color: `, `;
  `])), p.gray.light1));
r(ce || (ce = l([`
  line-height: 24px;
  padding-bottom: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`])));
r(ue || (ue = l([`
  min-width: 200px;
`])));
r(de || (de = l([`
  margin-top: `, `px;
`])), s[3]);
r(me || (me = l([`
  padding: `, "px ", `px 0px;
  color: `, `;
`])), s[5], s[5] + s[3], p.gray.dark1);
var ge;
function Je(t, n) {
  if (t == null)
    return {};
  var e, a, i = function(g, b) {
    if (g == null)
      return {};
    var o, d, c = {}, m = Object.keys(g);
    for (d = 0; d < m.length; d++)
      o = m[d], b.indexOf(o) >= 0 || (c[o] = g[o]);
    return c;
  }(t, n);
  if (Object.getOwnPropertySymbols) {
    var u = Object.getOwnPropertySymbols(t);
    for (a = 0; a < u.length; a++)
      e = u[a], n.indexOf(e) >= 0 || Object.prototype.propertyIsEnumerable.call(t, e) && (i[e] = t[e]);
  }
  return i;
}
var N, P, We = r(ge || (N = [`
  margin-bottom: `, `px;
`], P || (P = N.slice(0)), ge = Object.freeze(Object.defineProperties(N, { raw: { value: Object.freeze(P) } }))), s[2]), Ye = ["title", "children"], Le = function(t) {
  var n = t.title, e = t.children, a = Je(t, Ye);
  return f.createElement("div", a, n && f.createElement(Ae, { weight: "medium", className: We }, n), f.createElement(Ue, null, e));
};
Le.displayName = "DisclaimerText";
function Ke(t) {
  var n = function(e, a) {
    if (typeof e != "object" || !e)
      return e;
    var i = e[Symbol.toPrimitive];
    if (i !== void 0) {
      var u = i.call(e, a);
      if (typeof u != "object")
        return u;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(e);
  }(t, "string");
  return typeof n == "symbol" ? n : n + "";
}
function C(t, n, e) {
  return (n = Ke(n)) in t ? Object.defineProperty(t, n, { value: e, enumerable: !0, configurable: !0, writable: !0 }) : t[n] = e, t;
}
function E() {
  return E = Object.assign ? Object.assign.bind() : function(t) {
    for (var n = 1; n < arguments.length; n++) {
      var e = arguments[n];
      for (var a in e)
        Object.prototype.hasOwnProperty.call(e, a) && (t[a] = e[a]);
    }
    return t;
  }, E.apply(this, arguments);
}
function Qe(t, n) {
  if (t == null)
    return {};
  var e, a, i = function(g, b) {
    if (g == null)
      return {};
    var o, d, c = {}, m = Object.keys(g);
    for (d = 0; d < m.length; d++)
      o = m[d], b.indexOf(o) >= 0 || (c[o] = g[o]);
    return c;
  }(t, n);
  if (Object.getOwnPropertySymbols) {
    var u = Object.getOwnPropertySymbols(t);
    for (a = 0; a < u.length; a++)
      e = u[a], n.indexOf(e) >= 0 || Object.prototype.propertyIsEnumerable.call(t, e) && (i[e] = t[e]);
  }
  return i;
}
function x(t, n) {
  return n || (n = t.slice(0)), Object.freeze(Object.defineProperties(t, { raw: { value: Object.freeze(n) } }));
}
function et(t, n) {
  return function(e) {
    if (Array.isArray(e))
      return e;
  }(t) || function(e, a) {
    var i = e == null ? null : typeof Symbol < "u" && e[Symbol.iterator] || e["@@iterator"];
    if (i != null) {
      var u, g, b, o, d = [], c = !0, m = !1;
      try {
        if (b = (i = i.call(e)).next, a !== 0)
          for (; !(c = (u = b.call(i)).done) && (d.push(u.value), d.length !== a); c = !0)
            ;
      } catch (k) {
        m = !0, g = k;
      } finally {
        try {
          if (!c && i.return != null && (o = i.return(), Object(o) !== o))
            return;
        } finally {
          if (m)
            throw g;
        }
      }
      return d;
    }
  }(t, n) || function(e, a) {
    if (e) {
      if (typeof e == "string")
        return fe(e, a);
      var i = Object.prototype.toString.call(e).slice(8, -1);
      if (i === "Object" && e.constructor && (i = e.constructor.name), i === "Map" || i === "Set")
        return Array.from(e);
      if (i === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))
        return fe(e, a);
    }
  }(t, n) || function() {
    throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
  }();
}
function fe(t, n) {
  n > t.length && (n = t.length);
  for (var e = 0, a = new Array(n); e < n; e++)
    a[e] = t[e];
  return a;
}
var be, he, xe, ve, ye, we, ke, Oe, Ce, je, Se, tt = r(be || (be = x([`
  height: 500px;
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
`]))), nt = C(C({}, v.Dark, r(he || (he = x([`
    background-color: `, `;
  `])), p.black)), v.Light, r(xe || (xe = x([`
    background-color: `, `;
  `])), p.gray.light3)), rt = r(ve || (ve = x([`
  width: 100%;
  max-width: `, `px;
  height: 100%;
  overflow-y: scroll;
  scroll-behavior: smooth;
  position: relative;
  padding: `, "px ", "px ", `px;
`])), $e.Tablet + 2 * (D[R.Default] + s[5] + s[3]), s[3], s[5], s[2]), at = C(C({}, v.Dark, r(ye || (ye = x([`
    // https://css-tricks.com/books/greatest-css-tricks/scroll-shadows/
    background:
      /* Shadow Cover TOP */ 
      // eslint-disable-next-line Maintain natural line break
      linear-gradient(`, " 30%, ", ` 0%) center top,
      /* Shadow Cover BOTTOM */
        linear-gradient(`, " 0%, ", ` 70%) center bottom,
      /* Shadow TOP */
        radial-gradient(
          farthest-side at 50% 0,
          rgba(0, 0, 0, 0.3),
          rgba(0, 0, 0, 0)
        )
        center top,
      /* Shadow BOTTOM */
        radial-gradient(
          farthest-side at 50% 100%,
          rgba(0, 0, 0, 0.3),
          rgba(0, 0, 0, 0)
        )
        center bottom;
    background-repeat: no-repeat;
    background-size: 100% 16px, 100% 16px, 100% 8px, 100% 8px;
    background-attachment: local, local, scroll, scroll;
  `])), p.black, p.black, p.black, p.black)), v.Light, r(we || (we = x([`
    // https://css-tricks.com/books/greatest-css-tricks/scroll-shadows/
    background:
      /* Shadow Cover TOP */ 
      // eslint-disable-next-line Maintain natural line break
      linear-gradient(`, " 30%, ", ` 0%)
        center top,
      /* Shadow Cover BOTTOM */
        linear-gradient(`, " 0%, ", ` 30%)
        center bottom,
      /* Shadow TOP */
        radial-gradient(
          farthest-side at 50% 0,
          rgba(0, 0, 0, 0.1),
          rgba(0, 0, 0, 0)
        )
        center top,
      /* Shadow BOTTOM */
        radial-gradient(
          farthest-side at 50% 100%,
          rgba(0, 0, 0, 0.1),
          rgba(0, 0, 0, 0)
        )
        center bottom;
    background-repeat: no-repeat;
    background-size: 100% 16px, 100% 16px, 100% 8px, 100% 8px;
    background-attachment: local, local, scroll, scroll;
  `])), p.gray.light3, p.gray.light3, p.gray.light3, p.gray.light3)), it = r(ke || (ke = x([`
  padding: 0px `, `px;
`])), D[R.Small] + s[2]), ot = r(Oe || (Oe = x([`
  padding: 0px `, `px;
`])), D[R.Default] + s[3]), lt = r(Ce || (Ce = x([`
  text-align: center;
  margin-top: `, `px;
  margin-bottom: `, `px;
`])), s[4], s[6]), st = r(je || (je = x([`
  position: absolute;
  bottom: `, `px;
`])), s[400]), ct = r(Se || (Se = x([`
  box-shadow: 0 `, "px ", `px rgba(0, 0, 0, 0.2);
  border-radius: `, `px;
`])), s[50], s[100], Pe[400]), ut = ["children", "darkMode", "className"], Te = ze(function(t, n) {
  var e = t.children, a = t.darkMode, i = t.className, u = Qe(t, ut), g = _e().containerWidth, b = z(a), o = b.darkMode, d = b.theme, c = U(null), m = He(e).map(function(y) {
    return A(y, "DisclaimerText") ? f.createElement("div", { className: lt, key: "disclaimer-text" }, y) : A(y, "MessagePrompts") ? f.createElement("div", { key: "message-prompts", className: L(it, C({}, ot, !!g && g >= $e.Tablet)) }, y) : y;
  }), k = et(De(!1), 2), O = k[0], j = k[1], w = U(null), S = Re(function() {
    c.current && c.current.scrollTo(0, c.current.scrollHeight);
  }, []);
  return H(function() {
    var y = c.current;
    if (y) {
      var B = function() {
        w.current && clearTimeout(w.current), w.current = setTimeout(function() {
          j(!function() {
            if (!c.current)
              return !0;
            var M = c.current;
            return M.scrollHeight - M.scrollTop - M.clientHeight <= 2;
          }());
        }, 100);
      };
      return y.addEventListener("scroll", B), function() {
        y.removeEventListener("scroll", B), w.current && clearTimeout(w.current);
      };
    }
  }, []), H(function() {
    O || S();
  }, [e, O, S]), f.createElement(Ee, { darkMode: o }, f.createElement("div", E({}, u, { className: L(tt, nt[d], i), ref: n }), f.createElement("div", { className: L(at[d], rt), ref: c }, m), f.createElement(dt, { visible: O, handleScroll: S, darkMode: o })));
});
function dt(t) {
  var n = t.visible, e = t.handleScroll, a = t.darkMode, i = z(a).darkMode;
  return n ? f.createElement("div", { className: st }, f.createElement(Fe, { className: ct, onClick: e, darkMode: i, "aria-label": "Scroll to latest message", size: Ie.Small, rightGlyph: f.createElement(Ze, { glyph: "ArrowDown" }) }, "Scroll to latest")) : null;
}
Te.displayName = "MessageFeed";
const mt = Be(async () => ({
  default: (await import("./Message.js")).Message
})), Me = {
  disclaimer_text: F`
    text-align: center;
    margin-top: 16px;
    margin-bottom: 32px;
  `,
  message_feed: F`
    height: 100%;
    max-height: 70vh;
    & > div {
      box-sizing: border-box;
      max-height: 70vh;
    }
  `
};
function Nt(t) {
  const { darkMode: n } = z(t.darkMode), { className: e, disclaimer: a, disclaimerHeading: i, initialMessage: u } = t, { awaitingReply: g, canSubmit: b, conversation: o, handleSubmit: d } = qe(), c = u ? [u, ...o.messages] : o.messages;
  return c.length === 0 ? null : /* @__PURE__ */ $.jsxDEV(
    Te,
    {
      darkMode: n,
      className: Ne(Me.message_feed, e),
      children: [
        a ? /* @__PURE__ */ $.jsxDEV(
          Le,
          {
            title: i ?? "Terms of Use",
            className: Me.disclaimer_text,
            children: a
          },
          void 0,
          !1,
          {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatMessageFeed.tsx",
            lineNumber: 54,
            columnNumber: 9
          },
          this
        ) : null,
        c.map((m, k) => {
          var w;
          const O = m.id === o.streamingMessageId && ((w = o.getMessage(o.streamingMessageId ?? "")) == null ? void 0 : w.content) === "", j = k === 0;
          return /* @__PURE__ */ $.jsxDEV(
            mt,
            {
              messageData: m,
              isLoading: O,
              showRating: (
                // Users can rate assistant messages that have started streaming
                m.role === "assistant" && !O && !(g && o.streamingMessageId === m.id) && // We don't want users to rate the initial message (and they can't because it's not in the database)
                !j
              ),
              conversation: o,
              suggestedPrompts: m.suggestedPrompts,
              showSuggestedPrompts: (
                // For now we'll only show suggested prompts for the initial message and hide them once the user submits anything
                j && o.messages.length === 0
              ),
              onSuggestedPromptClick: d,
              canSubmitSuggestedPrompt: b
            },
            m.id,
            !1,
            {
              fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatMessageFeed.tsx",
              lineNumber: 70,
              columnNumber: 11
            },
            this
          );
        })
      ]
    },
    void 0,
    !0,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatMessageFeed.tsx",
      lineNumber: 49,
      columnNumber: 5
    },
    this
  );
}
export {
  Nt as ChatMessageFeed
};
