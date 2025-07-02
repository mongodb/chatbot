import { NextFunction, Request, Response } from "express-serve-static-core";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";
import { isValidIp } from "../routes/conversations/utils";

export function requireValidIpAddress<Locals extends Record<string, any>>() {
  return (
    req: Request<any, any, any, any>,
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
