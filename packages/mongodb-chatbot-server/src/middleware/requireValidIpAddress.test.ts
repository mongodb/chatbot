import { requireValidIpAddress } from "./requireValidIpAddress";
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

describe("requireValidIpAddress", () => {
  it(`blocks any request where "Request.ip" is not set`, async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = requireValidIpAddress();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;
    req.ip = undefined;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "The request has an invalid IP address: undefined",
    });
  });
  it("blocks any request where the IP address is invalid", async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const invalidIpAddress = "not-an-ip-address";
    const middleware = requireValidIpAddress();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;
    req.ip = invalidIpAddress;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "The request has an invalid IP address: " + invalidIpAddress,
    });
  });
  it(`allows any request where the "Request.ip" is valid`, async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = requireValidIpAddress();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;
    req.ip = baseReq.ip;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.locals.customData.ip).toEqual(baseReq.ip);
  });
});
