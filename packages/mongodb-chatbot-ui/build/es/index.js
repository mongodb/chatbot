import { b as ae, R as ne, T as me, C as le, a as ce, u as ue } from "./Chatbot2.js";
import { j as t } from "./jsx-dev-runtime.js";
import { d as a } from "./index2.js";
import { I as c } from "./InputBarTrigger2.js";
import { u as be } from "./InputBarTrigger2.js";
import { MongoDbLegalDisclosure as n } from "./MongoDbLegal.js";
import { MongoDbLegalDisclosureText as pe } from "./MongoDbLegal.js";
import { m } from "./ui-text.js";
import { d as fe } from "./ui-text.js";
import { lazy as l, Suspense as u } from "react";
import { FloatingActionButtonTrigger as g } from "./FloatingActionButtonTrigger.js";
import { PoweredByAtlasVectorSearch as b } from "./PoweredByAtlasVectorSearch.js";
import { c as d } from "./Transition.js";
import { useChatbotContext as Ne } from "./useChatbotContext.js";
import { M as Ce } from "./InputBar.js";
import { HotkeyTrigger as Me } from "./HotkeyTrigger.js";
import { ActionButtonTrigger as Ie } from "./ActionButtonTrigger.js";
import { f as we, g as je } from "./messageLinks.js";
import { ModalView as Te } from "./ModalView.js";
import { ChatWindow as Se } from "./ChatWindow.js";
import "./index3.js";
import "./ConversationStateProvider2.js";
import "./utils.js";
import "./useConversationStateContext.js";
import "./LinkDataProvider.js";
import "./ChatbotProvider.js";
import "./HotkeyContext.js";
import "./index4.js";
import "./useLinkData.js";
import "react-dom";
import "./index5.js";
import "./index6.js";
import "./index7.js";
import "./index8.js";
import "./index9.js";
import "./index10.js";
import "./index11.js";
import "./index12.js";
import "./index13.js";
import "./index14.js";
import "./index15.js";
import "./X.js";
import "./ChevronDown.js";
import "./index16.js";
import "./index17.js";
import "./index18.js";
import "./Warning.js";
import "./ChatMessageFeed.js";
const p = l(
  () => import("./ModalView.js").then((e) => ({ default: e.ModalView }))
);
function te(e) {
  const { darkMode: r } = a(e.darkMode), o = {
    suggestedPrompts: e.suggestedPrompts ?? [],
    bottomContent: /* @__PURE__ */ t.jsxDEV(n, {}, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DocsChatbot.tsx",
      lineNumber: 22,
      columnNumber: 20
    }, this)
  }, s = {
    darkMode: r,
    inputBottomText: m
  };
  return /* @__PURE__ */ t.jsxDEV(t.Fragment, { children: [
    /* @__PURE__ */ t.jsxDEV(c, { ...o }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DocsChatbot.tsx",
      lineNumber: 32,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ t.jsxDEV(p, { ...s }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DocsChatbot.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DocsChatbot.tsx",
    lineNumber: 31,
    columnNumber: 5
  }, this);
}
const h = l(
  () => import("./ModalView.js").then((e) => ({ default: e.ModalView }))
);
function oe(e) {
  const { darkMode: r } = a(e.darkMode), o = {}, s = {
    darkMode: r,
    initialMessageText: e.initialMessageText ?? "Hi! I'm the MongoDB AI. What can I help you with today?",
    initialMessageReferences: e.initialMessageReferences,
    initialMessageSuggestedPrompts: e.initialMessageSuggestedPrompts ?? [],
    disclaimer: /* @__PURE__ */ t.jsxDEV(t.Fragment, { children: [
      /* @__PURE__ */ t.jsxDEV(n, {}, void 0, !1, {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
        lineNumber: 39,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ t.jsxDEV(
        b,
        {
          className: d`
            margin-top: 8px;
          `,
          linkStyle: "text"
        },
        void 0,
        !1,
        {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
          lineNumber: 40,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this),
    inputBottomText: m
  };
  return /* @__PURE__ */ t.jsxDEV(t.Fragment, { children: [
    /* @__PURE__ */ t.jsxDEV(g, { ...o }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ t.jsxDEV(u, { fallback: null, children: /* @__PURE__ */ t.jsxDEV(h, { ...s }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
      lineNumber: 55,
      columnNumber: 9
    }, this) }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
      lineNumber: 54,
      columnNumber: 7
    }, this)
  ] }, void 0, !0, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/DevCenterChatbot.tsx",
    lineNumber: 52,
    columnNumber: 5
  }, this);
}
function i(e) {
  return e == null ? void 0 : e.replace(/^"|"$/g, "");
}
function f() {
  const e = typeof window < "u" && window.analytics ? window.analytics : null, r = i(
    (e == null ? void 0 : e.user().id()) ?? localStorage.getItem("ajs_user_id") ?? void 0
  ), o = i(
    (e == null ? void 0 : e.user().anonymousId()) ?? localStorage.getItem("ajs_anonymous_id") ?? void 0
  );
  return {
    userId: r,
    anonymousId: o
  };
}
function re() {
  const { userId: e, anonymousId: r } = f(), o = new Headers();
  return e && o.set("X-Segment-User-Id", e), r && o.set("X-Segment-Anonymous-Id", r), o;
}
export {
  Ie as ActionButtonTrigger,
  Se as ChatWindow,
  ae as ConversationService,
  oe as DevCenterChatbot,
  te as DocsChatbot,
  g as FloatingActionButtonTrigger,
  Me as HotkeyTrigger,
  c as InputBarTrigger,
  Te as ModalView,
  Ce as MongoDbInputBarPlaceholder,
  n as MongoDbLegalDisclosure,
  pe as MongoDbLegalDisclosureText,
  b as PoweredByAtlasVectorSearch,
  ne as RetriableError,
  me as TimeoutError,
  le as default,
  fe as defaultChatbotFatalErrorMessage,
  we as formatReferences,
  je as getMessageLinks,
  re as getSegmentIdHeaders,
  f as getSegmentIds,
  m as mongoDbVerifyInformationMessage,
  ce as useChatbot,
  Ne as useChatbotContext,
  ue as useConversation,
  be as useTextInputTrigger
};
