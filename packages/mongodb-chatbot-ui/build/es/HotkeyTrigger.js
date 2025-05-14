import { useEffect as s } from "react";
import { useChatbotContext as m } from "./useChatbotContext.js";
import { u } from "./HotkeyContext.js";
import "./ChatbotProvider.js";
import "./jsx-dev-runtime.js";
function y({ onKey: t }) {
  const { open: o, openChat: n } = m(), e = u();
  return s(() => {
    e.setHotkey(t);
    const r = (i) => {
      i.key === t && n();
    };
    return o || window.addEventListener("keydown", r), () => {
      window.removeEventListener("keydown", r), e.setHotkey(null);
    };
  }, [e, t, o, n]), null;
}
export {
  y as HotkeyTrigger
};
