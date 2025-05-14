import { j as e } from "./jsx-dev-runtime.js";
import { t as i, a as n } from "./index4.js";
import { u as m } from "./useLinkData.js";
import { b as h } from "./utils.js";
import "react";
import "./index2.js";
import "./LinkDataProvider.js";
function p({
  className: t,
  linkStyle: o = "learnMore"
}) {
  const { tck: a } = m(), s = "https://www.mongodb.com/products/platform/atlas-vector-search", r = (l) => /* @__PURE__ */ e.jsxDEV(n, { href: h(s, { tck: a }), hideExternalIcon: !0, children: l.children }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
    lineNumber: 17,
    columnNumber: 5
  }, this), c = () => {
    switch (o) {
      case "learnMore":
        return /* @__PURE__ */ e.jsxDEV(e.Fragment, { children: [
          "Powered by Atlas Vector Search.",
          " ",
          /* @__PURE__ */ e.jsxDEV(r, { children: "Learn More." }, void 0, !1, {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
            lineNumber: 28,
            columnNumber: 13
          }, this)
        ] }, void 0, !0, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
          lineNumber: 26,
          columnNumber: 11
        }, this);
      case "text":
        return /* @__PURE__ */ e.jsxDEV(e.Fragment, { children: [
          "Powered by ",
          /* @__PURE__ */ e.jsxDEV(r, { children: "Atlas Vector Search" }, void 0, !1, {
            fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
            lineNumber: 34,
            columnNumber: 24
          }, this)
        ] }, void 0, !0, {
          fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
          lineNumber: 33,
          columnNumber: 11
        }, this);
    }
  };
  return /* @__PURE__ */ e.jsxDEV(i, { className: t, children: /* @__PURE__ */ e.jsxDEV(c, {}, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
    lineNumber: 42,
    columnNumber: 7
  }, this) }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/PoweredByAtlasVectorSearch.tsx",
    lineNumber: 41,
    columnNumber: 5
  }, this);
}
export {
  p as PoweredByAtlasVectorSearch
};
