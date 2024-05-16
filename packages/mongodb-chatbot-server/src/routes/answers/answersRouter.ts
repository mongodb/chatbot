import { Router, Request } from "express";
import { ConversationsService, SystemPrompt } from "../../services";
import { makeRespondRoute, RespondRouteParams } from "./respond";

export interface AnswersRouterParams {
  respondConfig: RespondRouteParams;
}

export function makeAnswersRouter({ respondConfig }: AnswersRouterParams) {
  const answersRouter = Router();

  answersRouter.post("/respond", makeRespondRoute(respondConfig));

  return answersRouter;
}
