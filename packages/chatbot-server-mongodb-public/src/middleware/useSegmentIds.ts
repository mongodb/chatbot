import { ConversationsMiddleware } from "mongodb-chatbot-server";

export const SEGMENT_USER_ID_HEADER = "X-Segment-User-Id";
export const SEGMENT_ANONYMOUS_ID_HEADER = "X-Segment-Anonymous-Id";

export function useSegmentIds(): ConversationsMiddleware {
  return (req, res, next) => {
    const userId = req.header(SEGMENT_USER_ID_HEADER);
    const anonymousId = req.header(SEGMENT_ANONYMOUS_ID_HEADER);
    if (userId) {
      res.locals.customData.segmentUserId = userId;
    }
    if (anonymousId) {
      res.locals.customData.segmentAnonymousId = anonymousId;
    }
    next();
  };
}
