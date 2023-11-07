import { requireRequestOrigin } from "./requestOrigin";
import { createRequest, createResponse } from "node-mocks-http";

describe("requireRequestOrigin", () => {
  it("TODO - needs proper tests", () => {
    // TODO
    expect(true).toBe(true);
  });
  // it("accepts a Zod schema that describes Express requests", async () => {
  //   const req = createRequest();
  //   const res = createResponse();
  //   const next = jest.fn();

  //   const middleware = requireRequestOrigin();
  //   req.body = { message: "Hello, world!" };
  //   req.params = { conversationId: "conversation-1234" };
  //   req.query = { stream: "true" };
  //   req.headers = { "req-id": "request-1234" };
  //   req.ip = "127.0.0.1";

  //   await middleware(req, res, next);
  //   expect(next).toHaveBeenCalledTimes(1);
  // });
});
