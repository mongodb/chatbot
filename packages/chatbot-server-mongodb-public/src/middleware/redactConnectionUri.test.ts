import { redactConnectionUri } from "./redactConnectionUri";
import {
  createConversationsMiddlewareReq,
  createConversationsMiddlewareRes,
} from "../test/middlewareTestHelpers";

const baseReq = {
  body: { message: "Hello, world!" },
  params: { conversationId: "conversation-1234" },
  query: { stream: "true" },
  headers: { "req-id": "request-1234" },
};

describe("redactConnectionUri", () => {
  it("passes through requests with no MongoDB connection URIs", async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = redactConnectionUri();
    req.body = {
      message: "This is a normal message without any connection URI",
    };
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req.body as { message: string }).message).toBe(
      "This is a normal message without any connection URI"
    );
  });

  it("redacts MongoDB connection URIs in message", async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = redactConnectionUri();
    const messageWithUri =
      "I'm using this connection string: mongodb://user123:password456@localhost:27017/mydb";
    req.body = { message: messageWithUri };
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req.body as { message: string }).message).toBe(
      "I'm using this connection string: mongodb://<USERNAME>:<PASSWORD>@localhost:27017/mydb"
    );
    expect((req.body as { message: string }).message).not.toContain("user123");
    expect((req.body as { message: string }).message).not.toContain(
      "password456"
    );
  });

  it("redacts multiple MongoDB connection URIs in message", async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = redactConnectionUri();
    const messageWithUris =
      "I have two connection strings: " +
      "mongodb://user1:pass1@localhost:27017/db1 and " +
      "mongodb+srv://user2:pass2@cluster0.mongodb.net/db2";
    req.body = { message: messageWithUris };
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req.body as { message: string }).message).toBe(
      "I have two connection strings: " +
        "mongodb://<USERNAME>:<PASSWORD>@localhost:27017/db1 and " +
        "mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.mongodb.net/db2"
    );
    expect((req.body as { message: string }).message).not.toContain("user1");
    expect((req.body as { message: string }).message).not.toContain("pass1");
    expect((req.body as { message: string }).message).not.toContain("user2");
    expect((req.body as { message: string }).message).not.toContain("pass2");
  });

  it("handles requests with no body", async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = redactConnectionUri();
    req.body = undefined;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("handles requests with no message", async () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = redactConnectionUri();
    req.body = { someOtherField: "value" };
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = baseReq.headers;

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((req.body as { someOtherField: string }).someOtherField).toBe(
      "value"
    );
  });
});
