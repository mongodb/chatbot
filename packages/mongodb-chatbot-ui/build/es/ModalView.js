import { j as t } from "./jsx-dev-runtime.js";
import { a as b, c as h } from "./Transition.js";
import { d as p, F as r } from "./index2.js";
import { k as g } from "./index17.js";
import { lazy as x, Suspense as f } from "react";
import { useChatbotContext as w } from "./useChatbotContext.js";
import "react-dom";
import "./X.js";
import "./index9.js";
import "./index10.js";
import "./index8.js";
import "./index3.js";
import "./ChatbotProvider.js";
const N = {
  modal_container: ({ darkMode: o }) => h`
    z-index: 100;

    & * {
      box-sizing: border-box;
    }

    > div {
      padding: unset;
    }

    & div[role="dialog"] {
      padding: 0;
      background: ${o ? r.black : r.gray.light3};

      > button {
        top: 14px;
      }
    }

    @media screen and (max-width: 1024px) {
      & div[role="dialog"] {
        width: 100%;
      }

      & > div {
        padding: 32px 18px;
      }
    }
  `
}, k = x(
  () => import("./ChatWindow.js").then((o) => ({ default: o.ChatWindow }))
);
function F(o) {
  const { darkMode: n } = p(o.darkMode), { className: s, inputBarId: l, ...d } = o, { closeChat: c, open: a, conversation: m } = w(), u = () => {
    var i;
    return ((i = o.shouldClose) == null ? void 0 : i.call(o)) ?? !0 ? (c(), !0) : !1;
  }, e = l ?? "chatbot-modal-input-bar";
  return console.log("chatWindowInputBarId", e), /* @__PURE__ */ t.jsxDEV(f, { fallback: null, children: a ? /* @__PURE__ */ t.jsxDEV(
    g,
    {
      className: b(N.modal_container({ darkMode: n }), s),
      open: a,
      size: "large",
      initialFocus: m.error ? void 0 : `#${e}`,
      shouldClose: u,
      children: /* @__PURE__ */ t.jsxDEV(k, { inputBarId: e, ...d }, void 0, !1, {
        fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ModalView.tsx",
        lineNumber: 82,
        columnNumber: 11
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ModalView.tsx",
      lineNumber: 73,
      columnNumber: 9
    },
    this
  ) : null }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ModalView.tsx",
    lineNumber: 71,
    columnNumber: 5
  }, this);
}
export {
  F as ModalView
};
