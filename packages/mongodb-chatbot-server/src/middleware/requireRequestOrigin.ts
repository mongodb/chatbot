import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

export const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";

export function requireRequestOrigin<
  Locals extends Record<string, any>
>(): RequestHandler<ParamsDictionary, unknown, unknown, ParsedQs, Locals> {
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
