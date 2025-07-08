import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { getRequestId, logRequest, sendErrorResponse } from "../utils";
import { isValidIp } from "../routes/conversations/utils";
import { ConversationsRouterLocals, SearchContentRouterLocals } from "../routes";

export type Locals = ConversationsRouterLocals | SearchContentRouterLocals;

export function requireValidIpAddress<
  Locals extends Record<string, any>
>(): RequestHandler<ParamsDictionary, any, any, any, Locals> {
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
