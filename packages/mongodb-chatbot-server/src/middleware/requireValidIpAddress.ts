import { getRequestId, logRequest, sendErrorResponse } from "../utils";
import { ConversationsMiddleware } from "../routes/conversations/conversationsRouter";
import { isValidIp } from "../routes/conversations/utils";

export function requireValidIpAddress(): ConversationsMiddleware {
  return (req, res, next) => {
    const reqId = getRequestId(req);

    const { ip } = req;
    if (!isValidIp(ip)) {
      return sendErrorResponse({
        reqId,
        res,
        httpStatus: 400,
        errorMessage: `The request has an invalid IP address: ${ip}`,
      });
    }

    res.locals.customData.ip = ip;

    logRequest({
      reqId,
      message: `Request IP ${ip} is allowed`,
    });

    next();
  };
}
