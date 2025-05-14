import { j as p } from "./jsx-dev-runtime.js";
import { createContext as S, useState as E } from "react";
import { r as A } from "./utils.js";
function j() {
  const t = Date.now(), n = Math.floor(Math.random() * 1e5);
  return String(t + n);
}
function M(t) {
  return {
    id: t.id ?? j(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    ...t
  };
}
const x = (t) => {
  let n;
  const r = /* @__PURE__ */ new Set(), e = (i, f) => {
    const d = typeof i == "function" ? i(n) : i;
    if (!Object.is(d, n)) {
      const I = n;
      n = f ?? (typeof d != "object" || d === null) ? d : Object.assign({}, n, d), r.forEach((C) => C(n, I));
    }
  }, s = () => n, l = { setState: e, getState: s, getInitialState: () => b, subscribe: (i) => (r.add(i), () => r.delete(i)) }, b = n = t(e, s, l);
  return l;
}, R = (t) => t ? x(t) : x;
function y(t, n) {
  return (...r) => Object.assign({}, t, n(...r));
}
const h = {
  conversationId: void 0,
  error: void 0,
  messages: [],
  streamingMessageId: void 0
};
function g(t, n, r) {
  return t.map(
    (e) => e.id === n ? r(e) : e
  );
}
const c = "streaming-response";
function m(t) {
  const n = t.findIndex(
    (e) => e.id === c
  ), r = n === -1 ? null : t[n];
  return {
    index: n,
    data: r
  };
}
const D = (t = "default") => R(
  y(h, (n, r) => ({
    name: t,
    api: {
      initialize: (e) => {
        n(e);
      },
      setConversationId: (e) => {
        e !== "" && (r().conversationId || n((s) => ({
          ...s,
          conversationId: e
        })));
      },
      setConversationError: (e) => {
        n((s) => ({
          ...s,
          error: e
        }));
      },
      addMessage: (e) => {
        n((s) => ({
          ...s,
          messages: [...s.messages, M(e)]
        }));
      },
      setMessageContent: (e, s) => {
        n((a) => ({
          ...a,
          messages: g(
            a.messages,
            e,
            (o) => ({
              ...o,
              content: s
            })
          )
        }));
      },
      updateMessageMetadata: (e, s) => {
        n((a) => ({
          ...a,
          messages: g(
            a.messages,
            e,
            (o) => ({
              ...o,
              metadata: s(o.metadata ?? {})
            })
          )
        }));
      },
      deleteMessage: (e) => {
        n((s) => {
          const a = s.messages.filter(
            (o) => o.id !== e
          );
          return a.length === s.messages.length && console.warn(`Message with id ${e} was not found`), {
            ...s,
            messages: a
          };
        });
      },
      rateMessage: (e, s) => {
        n((a) => ({
          ...a,
          messages: g(
            a.messages,
            e,
            (o) => ({
              ...o,
              rating: s
            })
          )
        }));
      },
      createStreamingResponse: () => {
        n((e) => {
          const { index: s } = m(
            e.messages
          );
          return s !== -1 ? (console.warn(
            "Cannot create a new streaming response while one is already active"
          ), e) : {
            ...e,
            messages: [
              ...e.messages,
              M({
                id: c,
                role: "assistant",
                content: ""
              })
            ],
            streamingMessageId: c
          };
        });
      },
      appendStreamingResponse: (e) => {
        n((s) => {
          const { index: a } = m(
            s.messages
          );
          return a === -1 ? (console.warn(
            "Attempted to append to a streaming response that does not exist"
          ), s) : {
            ...s,
            messages: g(
              s.messages,
              c,
              (o) => ({
                ...o,
                content: o.content + e
              })
            )
          };
        });
      },
      appendStreamingReferences: (e) => {
        n((s) => {
          const { index: a } = m(
            s.messages
          );
          return a === -1 ? (console.warn(
            "Attempted to append references to a streaming response that does not exist"
          ), s) : {
            ...s,
            messages: g(
              s.messages,
              c,
              (o) => ({
                ...o,
                references: e
              })
            )
          };
        });
      },
      finishStreamingResponse: (e) => {
        n((s) => m(s.messages).index === -1 ? (console.warn(
          "Cannot finish a streaming response that does not exist"
        ), s) : {
          ...s,
          messages: g(
            s.messages,
            c,
            (o) => ({
              ...o,
              id: e
            })
          ),
          streamingMessageId: void 0
        });
      },
      cancelStreamingResponse: () => {
        n((e) => {
          const s = m(e.messages);
          return s.index === -1 ? (console.warn(
            "Cannot cancel a streaming response that does not exist"
          ), e) : {
            ...e,
            messages: A(
              e.messages,
              s.index
            ),
            streamingMessageId: void 0
          };
        });
      }
    }
  }))
), u = "A conversation store was used before it was initialized.", w = {
  ...h,
  api: new Proxy(
    {},
    {
      get: () => () => {
        throw new Error(u);
      }
    }
  )
}, N = {
  getInitialState: () => w,
  getState: () => w,
  setState: () => {
    throw new Error(u);
  },
  subscribe: () => () => {
    throw new Error(u);
  }
}, O = S(N);
function k(t) {
  const [n] = E(() => D("state"));
  return /* @__PURE__ */ p.jsxDEV(O.Provider, { value: n, children: t.children }, void 0, !1, {
    fileName: "/Users/leogenerali/chatbot/packages/mongodb-chatbot-ui/src/ConversationStateProvider.tsx",
    lineNumber: 44,
    columnNumber: 5
  }, this);
}
export {
  k as C,
  c as S,
  j as a,
  O as b,
  M as c
};
