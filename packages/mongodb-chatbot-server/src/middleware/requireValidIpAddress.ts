import { NextFunction, Request, Response } from "express-serve-static-core";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";
import { isValidIp } from "../routes/conversations/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireValidIpAddress<Locals extends Record<string, any>>() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: Request<any, any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: Response<any, Locals>,
    next: NextFunction
  ) => {
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
