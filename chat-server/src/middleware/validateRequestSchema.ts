import { Request, Response, NextFunction } from "express";
import { z, AnyZodObject, ZodError } from "zod";
import { generateErrorMessage } from "zod-error";
import { getRequestId, logRequest, sendErrorResponse } from "../utils";

export const SomeExpressRequest = z.object({
  headers: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});

function generateZodErrorMessage(error: ZodError) {
  return generateErrorMessage(error.issues, {
    delimiter: {
      error: "\n",
    },
  });
}

export default function validateRequestSchema(schema: AnyZodObject) {
  schema = SomeExpressRequest.merge(schema);
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req);
    if (result.success) {
      return next();
    }
    const reqId = getRequestId(req);
    const message = generateZodErrorMessage(result.error);
    logRequest({
      reqId,
      message,
    });
    sendErrorResponse({
      reqId,
      res,
      httpStatus: 400,
      errorMessage: "Invalid request",
    });
  };
}
