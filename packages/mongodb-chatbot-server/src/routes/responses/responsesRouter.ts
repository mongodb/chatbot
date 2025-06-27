import Router from "express-promise-router";
import { makeCreateResponseRoute } from "./createResponse";
import type { GenerateResponse } from "../../processors";
import {
  makeRateLimit,
  makeSlowDown,
  type RateLimitOptions,
  type SlowDownOptions,
} from "../../middleware";
import { makeRateLimitError } from "./errors";

export interface ResponsesRouterParams {
  rateLimitConfig?: {
    routerRateLimitConfig?: RateLimitOptions;
    routerSlowDownConfig?: SlowDownOptions;
  };
  createResponse: {
    generateResponse: GenerateResponse;
    supportedModels: string[];
    maxOutputTokens: number;
  };
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
  const rateLimitErrorMessage =
    rateLimitConfig?.routerRateLimitConfig?.message ?? "Rate limit exceeded";

  responsesRouter.use((req, res, next) => {
    const rateLimit = makeRateLimit({
      ...rateLimitConfig?.routerRateLimitConfig,
      message: makeRateLimitError({
        error: new Error(rateLimitErrorMessage),
        headers: req.headers as Record<string, string>,
      }),
    });
    rateLimit(req, res, next);
  });
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
