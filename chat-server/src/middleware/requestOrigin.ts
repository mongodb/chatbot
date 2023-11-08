import { Request, Response, NextFunction } from "express";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

declare module "express-serve-static-core" {
  interface Request {
    origin: string;
  }
}

export function requireRequestOrigin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const reqId = getRequestId(req);
    const { origin } = req.headers;
    if (!origin) {
      return sendErrorResponse({
        reqId,
        res,
        httpStatus: 400,
        errorMessage: "No Origin header",
      });
    }
    logRequest({
      reqId,
      message: `Request origin ${origin} is allowed`,
    });
    req.origin = origin;
    return next();
  };
}
