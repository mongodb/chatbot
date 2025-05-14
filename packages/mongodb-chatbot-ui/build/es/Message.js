import { j as t } from "./jsx-dev-runtime.js";
import { c as S } from "./Transition.js";
import { I as y, i as D, M as F, S as A } from "./MessageContent2.js";
import { x as I, D as h } from "./index14.js";
import { useContext as L, lazy as v, useState as l, Fragment as z, Suspense as f } from "react";
import { a as B, g as O } from "./messageLinks.js";
import { useChatbotContext as W } from "./useChatbotContext.js";
import { u as H } from "./useLinkData.js";
import "./index2.js";
import "react-dom";
import "./index4.js";
import "./index5.js";
import "./index18.js";
import "./X.js";
import "./index9.js";
import "./index10.js";
import "./Warning.js";
import "./ChevronDown.js";
import "./index16.js";
import "./index7.js";
import "./index8.js";
import "./index3.js";
import "./index11.js";
import "./index19.js";
import "./index12.js";
import "./index15.js";
import "./utils.js";
import "./ChatbotProvider.js";
import "./LinkDataProvider.js";
function P() {
  return L(B);
}
const q = v(async () => ({
  default: (await import("./MessageRating.js")).MessageRatingWithFeedbackComment
})), G = v(async () => ({
  default: (await import("./MessagePrompts.js")).MessagePrompts
})), J = () => /* @__PURE__ */ t.jsxDEV(
  A,
  {
    className: S`
        width: 100%;
        min-width: 120px;

        & > div {
          width: 100%;
        }
      `
  },
  void 0,
  !1,
  {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
    lineNumber: 29,
    columnNumber: 5
  },
  globalThis
);
function K(e, o) {
  return {
    isSender: e.role === "user",
    senderName: e.role === "user" ? o == null ? void 0 : o.name : "Mongo",
    avatarVariant: e.role === "user" ? h.User : h.Mongo
  };
}
const Ce = ({
  messageData: e,
  suggestedPrompts: o = [],
  showSuggestedPrompts: N = !0,
  canSubmitSuggestedPrompt: M = () => !0,
  onSuggestedPromptClick: a,
  isLoading: c,
  showRating: x,
  conversation: u
}) => {
  var p;
  const { maxCommentCharacters: k } = W(), C = P(), i = K(e, C), [b, d] = l("none"), [w, r] = l(), [g, E] = l(void 0);
  async function U(s) {
    if (s)
      try {
        await u.commentMessage(e.id, s), d("submitted"), E(e.rating ? "liked" : "disliked"), r(void 0);
      } catch {
        r(
          "Oops, there was an issue submitting the response to the server. Please try again."
        );
      }
  }
  function V() {
    d("abandoned");
  }
  const n = (p = e.metadata) == null ? void 0 : p.verifiedAnswer, j = n ? {
    verifier: "MongoDB Staff",
    verifiedAt: new Date(n.updated ?? n.created)
  } : void 0, { tck: T } = H(), R = O(e, { tck: T });
  return /* @__PURE__ */ t.jsxDEV(z, { children: [
    /* @__PURE__ */ t.jsxDEV(
      y,
      {
        baseFontSize: 16,
        isSender: i.isSender,
        avatar: /* @__PURE__ */ t.jsxDEV(I, { variant: i.avatarVariant, name: i.senderName }, void 0, !1, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
          lineNumber: 122,
          columnNumber: 17
        }, globalThis),
        sourceType: c ? void 0 : D.Markdown,
        messageBody: e.content,
        verified: j,
        links: R,
        componentOverrides: { MessageContent: F },
        children: [
          c ? /* @__PURE__ */ t.jsxDEV(J, {}, void 0, !1, {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
            lineNumber: 129,
            columnNumber: 22
          }, globalThis) : null,
          /* @__PURE__ */ t.jsxDEV(f, { fallback: null, children: x ? /* @__PURE__ */ t.jsxDEV(
            q,
            {
              submit: U,
              abandon: V,
              status: b,
              errorMessage: w,
              clearErrorMessage: () => r(void 0),
              maxCommentCharacterCount: k,
              messageRatingProps: {
                value: e.rating === void 0 ? void 0 : e.rating ? "liked" : "disliked",
                description: "How was the response?",
                hideThumbsUp: g === "disliked",
                hideThumbsDown: g === "liked",
                onChange: async (s) => {
                  const m = s.target.value;
                  m && b !== "submitted" && await u.rateMessage(
                    e.id,
                    m === "liked"
                  );
                }
              }
            },
            void 0,
            !1,
            {
              fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
              lineNumber: 133,
              columnNumber: 13
            },
            globalThis
          ) : null }, void 0, !1, {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
            lineNumber: 131,
            columnNumber: 9
          }, globalThis)
        ]
      },
      void 0,
      !0,
      {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
        lineNumber: 119,
        columnNumber: 7
      },
      globalThis
    ),
    /* @__PURE__ */ t.jsxDEV(f, { fallback: null, children: N && /* @__PURE__ */ t.jsxDEV(
      G,
      {
        prompts: o,
        onPromptClick: (s) => a == null ? void 0 : a(s),
        canSubmit: M
      },
      void 0,
      !1,
      {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
        lineNumber: 171,
        columnNumber: 11
      },
      globalThis
    ) }, void 0, !1, {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
      lineNumber: 169,
      columnNumber: 7
    }, globalThis)
  ] }, e.id, !0, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/Message.tsx",
    lineNumber: 118,
    columnNumber: 5
  }, globalThis);
};
export {
  Ce as Message
};
