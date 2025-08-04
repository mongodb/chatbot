import Router from "express-promise-router";
import { makeCreateResponseRoute } from "./createResponse";
import { getRequestId } from "../../utils";
import {
  makeRateLimit,
  makeSlowDown,
  type RateLimitOptions,
  type SlowDownOptions,
} from "../../middleware";
import { makeRateLimitError, sendErrorResponse } from "./errors";
import type { CreateResponseRouteParams } from "./createResponse";

export interface ResponsesRouterParams {
  rateLimitConfig?: {
    routerRateLimitConfig?: RateLimitOptions;
    routerSlowDownConfig?: SlowDownOptions;
  };
  createResponse: CreateResponseRouteParams;
}

/**
  Constructor function to make the /responses/* Express.js router.
 */
export function makeResponsesRouter({
  rateLimitConfig,
  createResponse,
}: ResponsesRouterParams) {
  const responsesRouter = Router();

  /*
    Global rate limit the requests to the responsesRouter.
   */
  const rateLimit = makeRateLimit({
    ...rateLimitConfig?.routerRateLimitConfig,
    handler: (req, res, next, options) => {
      const reqId = getRequestId(req);
      const error = makeRateLimitError({
        error: new Error(options.message),
        headers: req.headers as Record<string, string>,
      });
      return sendErrorResponse({ reqId, res, error });
    },
  });
  responsesRouter.use(rateLimit);
  /*
    Slow down the response to the responsesRouter after certain number
    of requests in the time window.
   */
  const globalSlowDown = makeSlowDown(rateLimitConfig?.routerSlowDownConfig);
  responsesRouter.use(globalSlowDown);

  // Create Response API
  responsesRouter.post("/", makeCreateResponseRoute(createResponse));

  return responsesRouter;
}
