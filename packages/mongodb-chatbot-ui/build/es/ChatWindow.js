import { j as e } from "./jsx-dev-runtime.js";
import { a as w, c as l } from "./Transition.js";
import { d as x } from "./index2.js";
import { t as C, g as E } from "./index4.js";
import { A as D } from "./index13.js";
import { c as j } from "./index5.js";
import { useMemo as U, Suspense as V } from "react";
import { R as M } from "./index18.js";
import { I as W, C as I, M as y } from "./InputBar.js";
import { d as B } from "./ui-text.js";
import { useChatbotContext as k } from "./useChatbotContext.js";
import { u as S } from "./HotkeyContext.js";
import { ChatMessageFeed as R } from "./ChatMessageFeed.js";
import "react-dom";
import "./index14.js";
import "./index15.js";
import "./index10.js";
import "./index6.js";
import "./X.js";
import "./index9.js";
import "./Warning.js";
import "./index7.js";
import "./index8.js";
import "./index3.js";
import "./index11.js";
import "./index12.js";
import "./ChatbotProvider.js";
import "./index17.js";
function T(t) {
  const { message: a = "Something went wrong" } = t, { darkMode: r } = x();
  return /* @__PURE__ */ e.jsxDEV(M, { darkMode: t.darkMode ?? r, variant: "danger", children: [
    a,
    /* @__PURE__ */ e.jsxDEV("br", {}, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Banner.tsx",
      lineNumber: 15,
      columnNumber: 7
    }, this),
    "Reload the page to start a new conversation."
  ] }, void 0, !0, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Banner.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}
function he(t) {
  const { darkMode: a } = x(t.darkMode), {
    className: r,
    disclaimer: m,
    disclaimerHeading: h,
    fatalErrorMessage: i,
    initialMessageText: s,
    initialMessageReferences: o,
    initialMessageSuggestedPrompts: c,
    inputBarId: g = "chatbot-input-bar",
    inputBottomText: d,
    windowTitle: n
  } = t, { chatbotName: u, isExperimental: p } = k(), b = U(() => s ? {
    id: crypto.randomUUID(),
    role: "assistant",
    content: s,
    createdAt: (/* @__PURE__ */ new Date()).toLocaleTimeString(),
    suggestedPrompts: c,
    references: o
  } : null, [
    s,
    o,
    c
  ]);
  return /* @__PURE__ */ e.jsxDEV(j, { children: /* @__PURE__ */ e.jsxDEV(
    D,
    {
      className: w(l`border-radius: 24px;`, r),
      badgeText: p ? "Experimental" : void 0,
      title: n ?? u ?? "",
      darkMode: a,
      children: [
        /* @__PURE__ */ e.jsxDEV(V, { fallback: null, children: /* @__PURE__ */ e.jsxDEV(
          R,
          {
            darkMode: a,
            disclaimer: m,
            disclaimerHeading: h,
            initialMessage: b
          },
          void 0,
          !1,
          {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
            lineNumber: 69,
            columnNumber: 11
          },
          this
        ) }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
          lineNumber: 68,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ e.jsxDEV(
          P,
          {
            id: g,
            fatalErrorMessage: i,
            darkMode: a,
            bottomText: d,
            placeholder: t.inputBarPlaceholder
          },
          void 0,
          !1,
          {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
            lineNumber: 76,
            columnNumber: 9
          },
          this
        )
      ]
    },
    void 0,
    !0,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
      lineNumber: 62,
      columnNumber: 7
    },
    this
  ) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
    lineNumber: 61,
    columnNumber: 5
  }, this);
}
function P({
  darkMode: t,
  fatalErrorMessage: a = B,
  id: r = "chatbot-input-bar",
  bottomText: m,
  placeholder: h = y()
}) {
  var v;
  const { darkMode: i } = x(t), {
    awaitingReply: s,
    conversation: o,
    handleSubmit: c,
    inputBarRef: g,
    inputText: d,
    inputTextError: n,
    maxInputCharacters: u,
    setInputText: p
  } = k(), b = n !== "", N = S();
  return /* @__PURE__ */ e.jsxDEV(
    "div",
    {
      className: l`
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-left: 32px;
        padding-right: 32px;
        padding-top: 0.5rem;
        padding-bottom: 1rem;
      `,
      children: [
        o.error ? /* @__PURE__ */ e.jsxDEV(T, { darkMode: i, message: o.error }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
          lineNumber: 134,
          columnNumber: 9
        }, this) : /* @__PURE__ */ e.jsxDEV(e.Fragment, { children: [
          /* @__PURE__ */ e.jsxDEV(
            W,
            {
              hasError: b,
              shouldRenderGradient: !n,
              darkMode: i,
              ref: g,
              disabled: !!((v = o.error) != null && v.length),
              disableSend: b || s,
              shouldRenderHotkeyIndicator: N.hotkey !== null,
              onMessageSend: (f) => {
                n.length === 0 && !o.error && c(f);
              },
              textareaProps: {
                id: r,
                value: d,
                onChange: (f) => {
                  p(f.target.value);
                },
                placeholder: o.error ? a : h
              }
            },
            void 0,
            !1,
            {
              fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
              lineNumber: 137,
              columnNumber: 11
            },
            this
          ),
          /* @__PURE__ */ e.jsxDEV(
            "div",
            {
              className: l`
              display: flex;
              justify-content: space-between;
            `,
              children: [
                m ? /* @__PURE__ */ e.jsxDEV(
                  C,
                  {
                    baseFontSize: 13,
                    className: l`
                  text-align: center;
                `,
                    children: m
                  },
                  void 0,
                  !1,
                  {
                    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
                    lineNumber: 169,
                    columnNumber: 15
                  },
                  this
                ) : null,
                u ? /* @__PURE__ */ e.jsxDEV(
                  I,
                  {
                    darkMode: i,
                    current: d.length,
                    max: u
                  },
                  void 0,
                  !1,
                  {
                    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
                    lineNumber: 179,
                    columnNumber: 15
                  },
                  this
                ) : null
              ]
            },
            void 0,
            !0,
            {
              fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
              lineNumber: 162,
              columnNumber: 11
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
          lineNumber: 136,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ e.jsxDEV(F, { conversation: o }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
          lineNumber: 189,
          columnNumber: 7
        }, this)
      ]
    },
    void 0,
    !0,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
      lineNumber: 119,
      columnNumber: 5
    },
    this
  );
}
function F({ conversation: t }) {
  return {}.VITE_QA === "true" ? /* @__PURE__ */ e.jsxDEV(
    "div",
    {
      className: l`
      display: flex;
      flex-direction: row;
      justify-content: center;
    `,
      children: /* @__PURE__ */ e.jsxDEV(C, { children: [
        "Conversation ID: ",
        /* @__PURE__ */ e.jsxDEV(E, { children: t.conversationId }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
          lineNumber: 204,
          columnNumber: 26
        }, this)
      ] }, void 0, !0, {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
        lineNumber: 203,
        columnNumber: 7
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ChatWindow.tsx",
      lineNumber: 196,
      columnNumber: 5
    },
    this
  ) : null;
}
export {
  he as ChatWindow
};
