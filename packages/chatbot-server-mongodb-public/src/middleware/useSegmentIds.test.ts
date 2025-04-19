import {
  SEGMENT_ANONYMOUS_ID_HEADER,
  SEGMENT_USER_ID_HEADER,
  useSegmentIds,
} from "./useSegmentIds";
import {
  caseInsensitiveHeaders,
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

describe("useSegmentIds", () => {
  it(`sets segmentUserId in customData when the ${SEGMENT_USER_ID_HEADER} header is present`, () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = useSegmentIds();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
      [SEGMENT_USER_ID_HEADER]: "test-user-id",
    });
    req.ip = baseReq.ip;

    middleware(req, res, next);

    expect(res.locals.customData).toMatchObject({
      segmentUserId: "test-user-id",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it(`does not set segmentUserId in customData when the ${SEGMENT_USER_ID_HEADER} header is not present`, () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = useSegmentIds();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
    });

    middleware(req, res, next);

    expect(res.locals.customData).not.toHaveProperty("segmentUserId");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it(`sets segmentAnonymousId in customData when the ${SEGMENT_ANONYMOUS_ID_HEADER} header is present`, () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = useSegmentIds();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
      [SEGMENT_ANONYMOUS_ID_HEADER]: "test-user-id",
    });
    req.ip = baseReq.ip;

    middleware(req, res, next);

    expect(res.locals.customData).toMatchObject({
      segmentAnonymousId: "test-user-id",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it(`does not set segmentAnonymousId in customData when the ${SEGMENT_ANONYMOUS_ID_HEADER} header is not present`, () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = useSegmentIds();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
    });

    middleware(req, res, next);

    expect(res.locals.customData).not.toHaveProperty("segmentAnonymousId");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("sets both segmentUserId and segmentAnonymousId in customData when both headers are present", () => {
    const req = createConversationsMiddlewareReq();
    const res = createConversationsMiddlewareRes();
    const next = jest.fn();

    const middleware = useSegmentIds();
    req.body = baseReq.body;
    req.params = baseReq.params;
    req.query = baseReq.query;
    req.headers = caseInsensitiveHeaders({
      ...baseReq.headers,
      [SEGMENT_USER_ID_HEADER]: "test-user-id",
      [SEGMENT_ANONYMOUS_ID_HEADER]: "test-anonymous-id",
    });
    req.ip = baseReq.ip;

    middleware(req, res, next);

    expect(res.locals.customData).toMatchObject({
      segmentUserId: "test-user-id",
      segmentAnonymousId: "test-anonymous-id",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
