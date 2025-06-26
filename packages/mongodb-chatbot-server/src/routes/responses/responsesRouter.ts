import Router from "express-promise-router";
import { makeCreateResponseRoute } from "./createResponse";
import type { GenerateResponse } from "../../processors";

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

  // TODO: add rate limit config

  // Create Response API
  responsesRouter.post("/", makeCreateResponseRoute(createResponse));

  return responsesRouter;
}
