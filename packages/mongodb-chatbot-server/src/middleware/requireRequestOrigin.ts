import { NextFunction, Request, Response } from "express-serve-static-core";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

export const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function requireRequestOrigin<Locals extends Record<string, any>>() {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req: Request<any, any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res: Response<any, Locals>,
    next: NextFunction
  ) => {
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
