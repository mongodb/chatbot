import { a as Z, j as C } from "./jsx-dev-runtime.js";
import { f as ee, _ as se, s as z, b as re, P as h, c as ae } from "./Transition.js";
import f, { createContext as te, forwardRef as F, useContext as ne, useState as oe, useRef as S } from "react";
import { _ as ie, t as q, m, N as x, F as p, X as B, T as w, E as O, b as E, d as G, n as H, R as le } from "./index2.js";
import { t as W } from "./index4.js";
import "react-dom";
function ce(s, r) {
  return s.classList ? !!r && s.classList.contains(r) : (" " + (s.className.baseVal || s.className) + " ").indexOf(" " + r + " ") !== -1;
}
function de(s, r) {
  s.classList ? s.classList.add(r) : ce(s, r) || (typeof s.className == "string" ? s.className = s.className + " " + r : s.setAttribute("class", (s.className && s.className.baseVal || "") + " " + r));
}
function j(s, r) {
  return s.replace(new RegExp("(^|\\s)" + r + "(?:\\s|$)", "g"), "$1").replace(/\s+/g, " ").replace(/^\s*|\s*$/g, "");
}
function pe(s, r) {
  s.classList ? s.classList.remove(r) : typeof s.className == "string" ? s.className = j(s.className, r) : s.setAttribute("class", j(s.className && s.className.baseVal || "", r));
}
var ue = function(r, o) {
  return r && o && o.split(" ").forEach(function(e) {
    return de(r, e);
  });
}, N = function(r, o) {
  return r && o && o.split(" ").forEach(function(e) {
    return pe(r, e);
  });
}, k = /* @__PURE__ */ function(s) {
  ie(r, s);
  function r() {
    for (var e, l = arguments.length, i = new Array(l), c = 0; c < l; c++)
      i[c] = arguments[c];
    return e = s.call.apply(s, [this].concat(i)) || this, e.appliedClasses = {
      appear: {},
      enter: {},
      exit: {}
    }, e.onEnter = function(t, a) {
      var n = e.resolveArguments(t, a), d = n[0], u = n[1];
      e.removeClasses(d, "exit"), e.addClass(d, u ? "appear" : "enter", "base"), e.props.onEnter && e.props.onEnter(t, a);
    }, e.onEntering = function(t, a) {
      var n = e.resolveArguments(t, a), d = n[0], u = n[1], b = u ? "appear" : "enter";
      e.addClass(d, b, "active"), e.props.onEntering && e.props.onEntering(t, a);
    }, e.onEntered = function(t, a) {
      var n = e.resolveArguments(t, a), d = n[0], u = n[1], b = u ? "appear" : "enter";
      e.removeClasses(d, b), e.addClass(d, b, "done"), e.props.onEntered && e.props.onEntered(t, a);
    }, e.onExit = function(t) {
      var a = e.resolveArguments(t), n = a[0];
      e.removeClasses(n, "appear"), e.removeClasses(n, "enter"), e.addClass(n, "exit", "base"), e.props.onExit && e.props.onExit(t);
    }, e.onExiting = function(t) {
      var a = e.resolveArguments(t), n = a[0];
      e.addClass(n, "exit", "active"), e.props.onExiting && e.props.onExiting(t);
    }, e.onExited = function(t) {
      var a = e.resolveArguments(t), n = a[0];
      e.removeClasses(n, "exit"), e.addClass(n, "exit", "done"), e.props.onExited && e.props.onExited(t);
    }, e.resolveArguments = function(t, a) {
      return e.props.nodeRef ? [e.props.nodeRef.current, t] : [t, a];
    }, e.getClassNames = function(t) {
      var a = e.props.classNames, n = typeof a == "string", d = n && a ? a + "-" : "", u = n ? "" + d + t : a[t], b = n ? u + "-active" : a[t + "Active"], Y = n ? u + "-done" : a[t + "Done"];
      return {
        baseClassName: u,
        activeClassName: b,
        doneClassName: Y
      };
    }, e;
  }
  var o = r.prototype;
  return o.addClass = function(l, i, c) {
    var t = this.getClassNames(i)[c + "ClassName"], a = this.getClassNames("enter"), n = a.doneClassName;
    i === "appear" && c === "done" && n && (t += " " + n), c === "active" && l && ee(l), t && (this.appliedClasses[i][c] = t, ue(l, t));
  }, o.removeClasses = function(l, i) {
    var c = this.appliedClasses[i], t = c.base, a = c.active, n = c.done;
    this.appliedClasses[i] = {}, t && N(l, t), a && N(l, a), n && N(l, n);
  }, o.render = function() {
    var l = this.props;
    l.classNames;
    var i = se(l, ["classNames"]);
    return /* @__PURE__ */ f.createElement(z, q({}, i, {
      onEnter: this.onEnter,
      onEntered: this.onEntered,
      onEntering: this.onEntering,
      onExit: this.onExit,
      onExiting: this.onExiting,
      onExited: this.onExited
    }));
  }, r;
}(f.Component);
k.defaultProps = {
  classNames: ""
};
k.propTypes = Z.env.NODE_ENV !== "production" ? q({}, z.propTypes, {
  /**
   * The animation classNames applied to the component as it appears, enters,
   * exits or has finished the transition. A single name can be provided, which
   * will be suffixed for each stage, e.g. `classNames="fade"` applies:
   *
   * - `fade-appear`, `fade-appear-active`, `fade-appear-done`
   * - `fade-enter`, `fade-enter-active`, `fade-enter-done`
   * - `fade-exit`, `fade-exit-active`, `fade-exit-done`
   *
   * A few details to note about how these classes are applied:
   *
   * 1. They are _joined_ with the ones that are already defined on the child
   *    component, so if you want to add some base styles, you can use
   *    `className` without worrying that it will be overridden.
   *
   * 2. If the transition component mounts with `in={false}`, no classes are
   *    applied yet. You might be expecting `*-exit-done`, but if you think
   *    about it, a component cannot finish exiting if it hasn't entered yet.
   *
   * 2. `fade-appear-done` and `fade-enter-done` will _both_ be applied. This
   *    allows you to define different behavior for when appearing is done and
   *    when regular entering is done, using selectors like
   *    `.fade-enter-done:not(.fade-appear-done)`. For example, you could apply
   *    an epic entrance animation when element first appears in the DOM using
   *    [Animate.css](https://daneden.github.io/animate.css/). Otherwise you can
   *    simply use `fade-enter-done` for defining both cases.
   *
   * Each individual classNames can also be specified independently like:
   *
   * ```js
   * classNames={{
   *  appear: 'my-appear',
   *  appearActive: 'my-active-appear',
   *  appearDone: 'my-done-appear',
   *  enter: 'my-enter',
   *  enterActive: 'my-active-enter',
   *  enterDone: 'my-done-enter',
   *  exit: 'my-exit',
   *  exitActive: 'my-active-exit',
   *  exitDone: 'my-done-exit',
   * }}
   * ```
   *
   * If you want to set these classes using CSS Modules:
   *
   * ```js
   * import styles from './styles.css';
   * ```
   *
   * you might want to use camelCase in your CSS file, that way could simply
   * spread them instead of listing them one by one:
   *
   * ```js
   * classNames={{ ...styles }}
   * ```
   *
   * @type {string | {
   *  appear?: string,
   *  appearActive?: string,
   *  appearDone?: string,
   *  enter?: string,
   *  enterActive?: string,
   *  enterDone?: string,
   *  exit?: string,
   *  exitActive?: string,
   *  exitDone?: string,
   * }}
   */
  classNames: re,
  /**
   * A `<Transition>` callback fired immediately after the 'enter' or 'appear' class is
   * applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: h.func,
  /**
   * A `<Transition>` callback fired immediately after the 'enter-active' or
   * 'appear-active' class is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: h.func,
  /**
   * A `<Transition>` callback fired immediately after the 'enter' or
   * 'appear' classes are **removed** and the `done` class is added to the DOM node.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: h.func,
  /**
   * A `<Transition>` callback fired immediately after the 'exit' class is
   * applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExit: h.func,
  /**
   * A `<Transition>` callback fired immediately after the 'exit-active' is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: h.func,
  /**
   * A `<Transition>` callback fired immediately after the 'exit' classes
   * are **removed** and the `exit-done` class is added to the DOM node.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExited: h.func
}) : {};
const fe = k;
function me(s) {
  var r = function(o, e) {
    if (typeof o != "object" || !o)
      return o;
    var l = o[Symbol.toPrimitive];
    if (l !== void 0) {
      var i = l.call(o, e);
      if (typeof i != "object")
        return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(o);
  }(s, "string");
  return typeof r == "symbol" ? r : r + "";
}
function v(s, r, o) {
  return (r = me(r)) in s ? Object.defineProperty(s, r, { value: o, enumerable: !0, configurable: !0, writable: !0 }) : s[r] = o, s;
}
function P() {
  return P = Object.assign ? Object.assign.bind() : function(s) {
    for (var r = 1; r < arguments.length; r++) {
      var o = arguments[r];
      for (var e in o)
        Object.prototype.hasOwnProperty.call(o, e) && (s[e] = o[e]);
    }
    return s;
  }, P.apply(this, arguments);
}
function ge(s, r) {
  if (s == null)
    return {};
  var o, e, l = function(c, t) {
    if (c == null)
      return {};
    var a, n, d = {}, u = Object.keys(c);
    for (n = 0; n < u.length; n++)
      a = u[n], t.indexOf(a) >= 0 || (d[a] = c[a]);
    return d;
  }(s, r);
  if (Object.getOwnPropertySymbols) {
    var i = Object.getOwnPropertySymbols(s);
    for (e = 0; e < i.length; e++)
      o = i[e], r.indexOf(o) >= 0 || Object.prototype.propertyIsEnumerable.call(s, o) && (l[o] = s[o]);
  }
  return l;
}
function g(s, r) {
  return r || (r = s.slice(0)), Object.freeze(Object.defineProperties(s, { raw: { value: Object.freeze(r) } }));
}
var _, T, A, $, M, D, X = te({ hasSelectedPrompt: !1 });
function J(s) {
  var r = s.hasSelectedPrompt, o = s.children;
  return f.createElement(X.Provider, { value: { hasSelectedPrompt: r } }, o);
}
J.displayName = "MessagePromptsProvider";
var L, R, I, V, ve = m(_ || (_ = g([`
  display: block;
  padding: `, "px ", `px;
  margin-bottom: `, `px;
  border: 1px solid `, `;
  border-radius: 12px;
  transition: all `, `ms ease;
  box-shadow: none;
  outline: none;
  text-align: left;
  &:not(:last-of-type) {
    margin-bottom: `, `px;
  }
  &[aria-disabled='false'][aria-pressed='false'] {
    cursor: pointer;
  }
`])), x[2], x[3], x[2], p.green.dark1, B.slower, x[1]), be = v(v({}, E.Dark, m(T || (T = g([`
    background: `, `;
    color: `, `;

    &[aria-pressed='false'][aria-disabled='false']:hover {
      box-shadow: `, `;
    }

    &[aria-pressed='false'][aria-disabled='false']:focus-visible {
      box-shadow: `, `;
    }
  `])), p.black, p.gray.light2, w.dark.green, O.dark.default)), E.Light, m(A || (A = g([`
    background: `, `;
    color: `, `;

    &[aria-pressed='false'][aria-disabled='false']:hover {
      box-shadow: `, `;
    }

    &[aria-pressed='false'][aria-disabled='false']:focus-visible {
      box-shadow: `, `;
    }
  `])), p.white, p.gray.dark3, w.light.green, O.light.default)), he = v(v({}, E.Dark, m($ || ($ = g([`
    border-color: `, `;
    color: `, `;
    background: `, `;
  `])), p.gray.dark1, p.gray.dark1, p.gray.dark3)), E.Light, m(M || (M = g([`
    border-color: `, `;
    color: `, `;
  `])), p.gray.base, p.gray.base)), xe = m(D || (D = g([`
  box-shadow: 0 0 0 2px `, `;
`])), p.green.dark1), K = F(function(s, r) {
  var o = s.children, e = s.onClick, l = s.disabled, i = s.selected, c = s.className, t = s.darkMode, a = ne(X).hasSelectedPrompt, n = G(t).theme, d = l ?? (!i && a);
  return f.createElement("button", { className: H(ve, be[n], v(v({}, he[n], d), xe, i), c), onClick: d ? void 0 : e, "aria-disabled": !!d, "aria-pressed": !!i, tabIndex: i || d ? 0 : 1, ref: r }, f.createElement(W, { style: { color: "inherit" } }, o));
});
K.displayName = "MessagePrompt";
var Ee = m(L || (L = g([`
  margin-bottom: `, `px;
  transition: opacity `, `ms ease-in;
`])), x[4], B.slower), Ce = m(R || (R = g([`
  margin-bottom: `, `px;
`])), x[2]), Ne = v(v({}, E.Dark, m(I || (I = g([`
    color: `, `;
  `])), p.gray.light1)), E.Light, m(V || (V = g([`
    color: `, `;
  `])), p.gray.dark1)), Pe = ["children", "label", "darkMode"], Q = F(function(s, r) {
  var o = s.children, e = s.label, l = s.darkMode, i = ge(s, Pe), c = G(l).theme, t = f.Children.toArray(o).some(function(a) {
    return le(a, "MessagePrompt") && a.props.selected;
  });
  return f.createElement(J, { hasSelectedPrompt: t }, f.createElement("div", null, e && f.createElement(W, { className: H(Ce, Ne[c]) }, e), f.createElement("div", P({ className: Ee, ref: r }, i), o)));
});
Q.displayName = "MessagePrompts";
const y = 400, U = {
  message_prompts: ae`
    margin-left: 70px;
    @media screen and (max-width: 804px) {
      margin-left: 50px;
    }

    transition: opacity ${y}ms ease-in;

    &-enter {
      opacity: 0;
    }
    &-enter-active {
      opacity: 1;
    }
    &-exit {
      opacity: 1;
    }
    &-exit-active {
      opacity: 0;
    }
  `
}, _e = ({
  prompts: s,
  onPromptClick: r,
  canSubmit: o
}) => {
  const [e, l] = oe(void 0), i = S(null), c = S(!1), t = (a, n) => {
    o(a) && (c.current || (c.current = !0, l(n), setTimeout(() => {
      r(a);
    }, y)));
  };
  return /* @__PURE__ */ C.jsxDEV(
    fe,
    {
      in: e === void 0,
      timeout: y,
      nodeRef: i,
      classNames: U.message_prompts,
      children: /* @__PURE__ */ C.jsxDEV("div", { className: U.message_prompts, ref: i, children: /* @__PURE__ */ C.jsxDEV(Q, { label: "Suggested Prompts", children: s.map((a, n) => /* @__PURE__ */ C.jsxDEV(
        K,
        {
          onClick: () => t(a, n),
          selected: n === e,
          children: a
        },
        a,
        !1,
        {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessagePrompts.tsx",
          lineNumber: 85,
          columnNumber: 13
        },
        globalThis
      )) }, void 0, !1, {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessagePrompts.tsx",
        lineNumber: 83,
        columnNumber: 9
      }, globalThis) }, void 0, !1, {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessagePrompts.tsx",
        lineNumber: 82,
        columnNumber: 7
      }, globalThis)
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/MessagePrompts.tsx",
      lineNumber: 76,
      columnNumber: 5
    },
    globalThis
  );
};
export {
  _e as MessagePrompts
};
