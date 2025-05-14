import { j as o } from "./jsx-dev-runtime.js";
import { c as r, a as m } from "./Transition.js";
import { ActionButtonTrigger as p } from "./ActionButtonTrigger.js";
import "react";
import "./index2.js";
import "react-dom";
import "./index4.js";
import "./index13.js";
import "./index5.js";
import "./index14.js";
import "./index15.js";
import "./index10.js";
import "./index6.js";
import "./X.js";
import "./index9.js";
import "./ChevronDown.js";
import "./index11.js";
import "./useChatbotContext.js";
import "./ChatbotProvider.js";
const e = {
  chat_trigger: r`
    position: fixed;
    bottom: 24px;
    right: 24px;

    @media screen and (min-width: 768px) {
      bottom: 32px;
      right: 24px;
    }
    @media screen and (min-width: 1024px) {
      bottom: 32px;
      right: 49px;
    }
  `
};
function D({
  className: t,
  ...i
}) {
  return /* @__PURE__ */ o.jsxDEV(
    p,
    {
      className: m(e.chat_trigger, t),
      ...i
    },
    void 0,
    !1,
    {
      fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/FloatingActionButtonTrigger.tsx",
      lineNumber: 31,
      columnNumber: 5
    },
    this
  );
}
export {
  D as FloatingActionButtonTrigger
};
