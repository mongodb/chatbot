import Router from "express-promise-router";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  makeCreateResponseRoute,
  CreateResponseRequest,
} from "./createResponse";

interface ResponsesService {
  generateResponse: () => void;
}

export interface ResponsesRouterParams {
  responses: ResponsesService;
  supportedModels: string[];
  maxOutputTokens: number;
}

/**
  Constructor function to make the /responses/* Express.js router.
 */
export function makeResponsesRouter({
  responses,
  supportedModels,
  maxOutputTokens,
}: ResponsesRouterParams) {
  const responsesRouter = Router();

  // stateless chat responses
  responsesRouter.post(
    "/",
    validateRequestSchema(CreateResponseRequest),
    makeCreateResponseRoute({
      generateResponse: responses.generateResponse,
      supportedModels,
      maxOutputTokens,
    })
  );

  return responsesRouter;
}
