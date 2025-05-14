import { j as e } from "./jsx-dev-runtime.js";
import { c as s, a as j } from "./Transition.js";
import { d as D } from "./index2.js";
import { w as S } from "./index4.js";
import { M as U, I as V, t as _, X as C } from "./InputBar.js";
import { d as w } from "./ui-text.js";
import { PoweredByAtlasVectorSearch as M } from "./PoweredByAtlasVectorSearch.js";
import { useState as E } from "react";
import { useChatbotContext as F } from "./useChatbotContext.js";
function R({
  placeholder: c = U(),
  fatalErrorMessage: t = w
}) {
  const {
    openChat: u,
    awaitingReply: m,
    handleSubmit: h,
    conversation: a,
    isExperimental: p
  } = F(), [n, b] = E(!1), [i, d] = E(""), [o, g] = E(""), f = a.error ? t : c, x = o.length === 0 && !a.error;
  return {
    conversation: a,
    isExperimental: p,
    inputText: i,
    setInputText: d,
    inputTextError: o,
    inputPlaceholder: f,
    setInputTextError: g,
    canSubmit: x,
    awaitingReply: m,
    openChat: u,
    focused: n,
    setFocused: b,
    handleSubmit: h,
    hasError: o !== "",
    showError: o !== "" && !open
  };
}
const l = {
  info_box: s`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 8px;
  `,
  chatbot_container: s`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    & * {
      box-sizing: border-box;
    }
  }`,
  chatbot_input: s`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,
  powered_by_footer: s`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 24px;
  `
};
function K({
  className: c,
  suggestedPrompts: t = [],
  bottomContent: u,
  fatalErrorMessage: m = w,
  placeholder: h,
  darkMode: a
}) {
  const { darkMode: p } = D(a), {
    conversation: n,
    isExperimental: b,
    inputText: i,
    inputPlaceholder: d,
    setInputText: o,
    inputTextError: g,
    canSubmit: f,
    awaitingReply: x,
    openChat: N,
    focused: T,
    setFocused: v,
    handleSubmit: I,
    hasError: B,
    showError: y
  } = R({
    fatalErrorMessage: m,
    placeholder: h
  }), k = (
    // There are suggested prompts defined
    t.length > 0 && // There is no conversation history
    n.messages.length === 0 && // The user has not typed anything
    i.length === 0 && // We're not waiting for the reply to the user's first message
    !x
  );
  return /* @__PURE__ */ e.jsxDEV("div", { className: j(l.chatbot_container, c), children: /* @__PURE__ */ e.jsxDEV("div", { className: l.chatbot_input, children: [
    /* @__PURE__ */ e.jsxDEV(
      V,
      {
        darkMode: p,
        hasError: B ?? !1,
        badgeText: !T && i.length === 0 && b ? "Experimental" : void 0,
        dropdownProps: {
          usePortal: !1
        },
        dropdownFooterSlot: /* @__PURE__ */ e.jsxDEV("div", { className: l.powered_by_footer, children: /* @__PURE__ */ e.jsxDEV(M, {}, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
          lineNumber: 105,
          columnNumber: 15
        }, this) }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
          lineNumber: 104,
          columnNumber: 13
        }, this),
        textareaProps: {
          value: i,
          onChange: (r) => {
            o(r.target.value);
          },
          placeholder: d
        },
        onMessageSend: async (r) => {
          if (n.messages.length > 0) {
            N();
            return;
          }
          f && await I(r);
        },
        onClick: async () => {
          n.messages.length > 0 && N();
        },
        onFocus: () => {
          v(!0);
        },
        onBlur: () => {
          v(!1);
        },
        children: k ? /* @__PURE__ */ e.jsxDEV(_, { label: "SUGGESTED AI PROMPTS", children: (t == null ? void 0 : t.map((r) => /* @__PURE__ */ e.jsxDEV(
          C,
          {
            onClick: async () => {
              await I(r);
            },
            children: r
          },
          r,
          !1,
          {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
            lineNumber: 139,
            columnNumber: 17
          },
          this
        ))) ?? null }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
          lineNumber: 137,
          columnNumber: 13
        }, this) : void 0
      },
      "inputBarTrigger",
      !1,
      {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
        lineNumber: 91,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ e.jsxDEV("div", { className: l.info_box, children: [
      y ? /* @__PURE__ */ e.jsxDEV(S, { children: g }, void 0, !1, {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
        lineNumber: 153,
        columnNumber: 24
      }, this) : null,
      u
    ] }, void 0, !0, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
      lineNumber: 152,
      columnNumber: 9
    }, this)
  ] }, void 0, !0, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
    lineNumber: 90,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/InputBarTrigger.tsx",
    lineNumber: 89,
    columnNumber: 5
  }, this);
}
export {
  K as I,
  R as u
};
