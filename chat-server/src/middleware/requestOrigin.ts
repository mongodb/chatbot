import { Request, Response, NextFunction } from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

export const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";

declare module "express-serve-static-core" {
  interface Request {
    origin: string;
  }
}

export function requireRequestOrigin() {
  return async (req: Request, res: Response, next: NextFunction) => {
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

    req.origin = requestOrigin;
    logRequest({
      reqId,
      message: `Request origin ${req.origin} is allowed`,
    });

    return next();
  };
}
