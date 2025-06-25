import Router from "express-promise-router";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  makeCreateResponseRoute,
  CreateResponseRequest,
} from "./createResponse";
import { GenerateResponse } from "../../processors";

export interface ResponsesRouterParams {
  createResponse: {
    generateResponse: GenerateResponse;
    supportedModels: string[];
    maxOutputTokens: number;
  };
}

/**
  Constructor function to make the /responses/* Express.js router.
 */
export function makeResponsesRouter({ createResponse }: ResponsesRouterParams) {
  const responsesRouter = Router();

  // stateless chat responses
  responsesRouter.post(
    "/",
    validateRequestSchema(CreateResponseRequest),
    makeCreateResponseRoute(createResponse)
  );

  return responsesRouter;
}
