import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { generateErrorMessage } from "zod-error";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

function generateZodErrorMessage(error: ZodError) {
  return generateErrorMessage(error.issues, {
    delimiter: {
      error: "\n",
    },
  });
}

export default function validateZodSchema(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req);
    if (!result.success) {
      const reqId = getRequestId(req);
      logRequest({
        reqId,
        message: generateZodErrorMessage(result.error),
      });
      return sendErrorResponse({
        reqId,
        res,
        httpStatus: 400,
        errorMessage: "Invalid request",
      });
    }
    next();
  };
}
