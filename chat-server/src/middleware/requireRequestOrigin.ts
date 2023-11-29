import { getRequestId, logRequest, sendErrorResponse } from "../utils";
import { ConversationsMiddleware } from "../routes/conversations/conversationsRouter";

export const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";

export function requireRequestOrigin(): ConversationsMiddleware {
  return (req, res, next) => {
    const reqId = getRequestId(req);

    const origin = req.header("origin");
    const customOrigin = req.header(CUSTOM_REQUEST_ORIGIN_HEADER);
    const requestOrigin = customOrigin || origin;

    if (!requestOrigin) {
      return sendErrorResponse({
        reqId,
        res,
        httpStatus: 400,
        errorMessage: `You must specify either an Origin or ${CUSTOM_REQUEST_ORIGIN_HEADER} header`,
      });
    }

    res.locals.customData.origin = requestOrigin;

    logRequest({
      reqId,
      message: `Request origin ${requestOrigin} is allowed`,
    });

    next();
  };
}
