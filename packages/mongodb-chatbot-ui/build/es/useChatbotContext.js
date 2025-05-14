import { useContext as o } from "react";
import { a as e } from "./ChatbotProvider.js";
import "./jsx-dev-runtime.js";
function a() {
  const t = o(e);
  if (!t)
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  return t;
}
export {
  a as useChatbotContext
};
