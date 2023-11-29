import { requireRequestOrigin } from "./requireRequestOrigin";
import {
  createConversationsMiddlewareReq,
  createConversationsMiddlewareRes,
} from "../test/middlewareTestHelpers";

const baseReq = {
  body: { message: "Hello, world!" },
  params: { conversationId: "conversation-1234" },
  query: { stream: "true" },
  headers: { "req-id": "request-1234" },
  ip: "127.0.0.1",
};

function caseInsensitiveHeaders(headers: Record<string, string>) {
  // Express automatically converts all headers to lowercase but
  // node-mocks-http does not. This function is a workaround for that.
  return Object.entries(headers).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {} as Record<string, string>);
}

describe("requireRequestOrigin", () => {
  it(`blocks any request where neither the Origin nor the X-Request-Origin header is set`, async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = requireRequestOrigin();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;
    req.ip = baseReq.ip;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "You must specify either an Origin or X-Request-Origin header",
    });
  });
  it(`allows any request where the Origin header is set`, async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = requireRequestOrigin();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
      origin: "http://localhost:5173",
    });
    req.ip = baseReq.ip;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.customData.origin).toEqual("http://localhost:5173");
  });
  it(`allows any request where the X-Request-Origin header is set`, async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = requireRequestOrigin();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
      "X-Request-Origin": "http://localhost:5173/foo/bar",
    });
    req.ip = baseReq.ip;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.customData.origin).toEqual(
      "http://localhost:5173/foo/bar"
    );
  });
  it(`prefers X-Request-Origin over Origin when both are set`, async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = requireRequestOrigin();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = {
      ...baseReq.headers,
      origin: "http://localhost:5173",
      "x-request-origin": "http://localhost:5173/foo/bar",
    };
    req.ip = baseReq.ip;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.customData.origin).toEqual(
      "http://localhost:5173/foo/bar"
    );
  });
});
