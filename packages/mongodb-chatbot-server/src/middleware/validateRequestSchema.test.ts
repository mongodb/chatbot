import validateRequestSchema, {
  SomeExpressRequest,
} from "./validateRequestSchema";
import { createRequest, createResponse } from "node-mocks-http";
import { z } from "zod";

describe("validateRequestSchema", () => {
  it("accepts a Zod schema that describes Express requests", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    const ValidRequestSchema = SomeExpressRequest.merge(
      z.object({
        headers: z.object({
          "req-id": z.string(),
        }),
        params: z.object({
          conversationId: z.string(),
        }),
        query: z.object({
          stream: z.string().optional(),
        }),
        body: z.object({
          message: z.string(),
        }),
        ip: z.string(),
      })
    );

    const middleware = validateRequestSchema(ValidRequestSchema);
    req.body = { message: "Hello, world!" };
    req.params = { conversationId: "conversation-1234" };
    req.query = { stream: "true" };
    req.headers = { "req-id": "request-1234" };
    req.ip = "127.0.0.1";

    await middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("rejects Zod schemas that do not describe Express requests", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    const InvalidRequestSchema = z.object({
      message: z.string(),
    });
    const middleware = validateRequestSchema(InvalidRequestSchema);

    req.body = { message: "Hello, world!" };
    await middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: "Invalid request" });
  });
});
