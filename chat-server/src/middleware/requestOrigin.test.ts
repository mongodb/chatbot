import { requireRequestOrigin } from "./requestOrigin";
import { createRequest, createResponse } from "node-mocks-http";

const baseReq = {
  body: { message: "Hello, world!" },
  params: { conversationId: "conversation-1234" },
  query: { stream: "true" },
  headers: { "req-id": "request-1234" },
  ip: "127.0.0.1",
};

describe("requireRequestOrigin", () => {
  it("blocks any request where the Origin header is not set", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    const middleware = requireRequestOrigin();
    req.body = baseReq.body
    req.params = baseReq.params
    req.query = baseReq.query
    req.headers = baseReq.headers
    req.ip = baseReq.ip

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "No Origin header",
    });
  });
  it("allows any request where the Origin header is set", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    const middleware = requireRequestOrigin();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = {
      ...baseReq.headers,
      origin: "http://localhost:5173",
    };
    req.ip = baseReq.ip;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
