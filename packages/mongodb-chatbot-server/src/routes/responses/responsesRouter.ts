import Router from "express-promise-router";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import { CreateResponseRequest } from "./createResponse";

interface ResponsesService {
  createResponse: () => void;
}

export interface ResponsesRouterParams {
  responses: ResponsesService;
}

/**
  Constructor function to make the /responses/* Express.js router.
 */
export function makeResponsesRouter({ responses }: ResponsesRouterParams) {
  const responsesRouter = Router();

  // stateless chat responses
  responsesRouter.post(
    "/",
    validateRequestSchema(CreateResponseRequest),
    (req, res) => {
      responses.createResponse();
      res.status(200).send({ status: "ok" });
    }
  );

  return responsesRouter;
}
