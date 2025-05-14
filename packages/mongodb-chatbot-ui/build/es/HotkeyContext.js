import { j as r } from "./jsx-dev-runtime.js";
import { createContext as a, useContext as u, useState as i, useMemo as x } from "react";
const c = {
  hotkey: null,
  setHotkey: () => {
  }
}, e = a(
  c
);
function m({
  children: o
}) {
  const [t, n] = i(null), s = x(() => ({ hotkey: t, setHotkey: n }), [t]);
  return /* @__PURE__ */ r.jsxDEV(e.Provider, { value: s, children: o }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/HotkeyContext.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, this);
}
function y() {
  return u(e);
}
export {
  m as H,
  y as u
};
