import { Request, Response, NextFunction } from "express";
import { z, AnyZodObject, ZodError } from "zod";
import { generateErrorMessage } from "zod-error";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

export const SomeExpressRequest = z.object({
  ip: z.string(),
  headers: z.object({}),
  params: z.object({}),
  query: z.object({}),
  body: z.object({}),
});

function generateZodErrorMessage(error: ZodError) {
  return generateErrorMessage(error.issues, {
    delimiter: {
      error: "\n",
    },
  });
}

export default function validateRequestSchema(schema: typeof SomeExpressRequest) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req);
    if (result.success) {
      return next();
    }
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
  };
}
