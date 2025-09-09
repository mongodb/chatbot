import Router from "express-promise-router";
import { makeCreateResponseRoute } from "./createResponse";
import { getRequestId } from "../../utils";
import {
  makeRateLimit,
  makeSlowDown,
  requireRequestOrigin,
  requireValidIpAddress,
  type RateLimitOptions,
  type SlowDownOptions,
} from "../../middleware";
import { makeRateLimitError, sendErrorResponse } from "./errors";
import type { CreateResponseRouteParams } from "./createResponse";
import { ParamsDictionary, RequestHandler } from "express-serve-static-core";

export interface ResponsesRouterParams {
  rateLimitConfig?: {
    routerRateLimitConfig?: RateLimitOptions;
    routerSlowDownConfig?: SlowDownOptions;
  };
  createResponse: CreateResponseRouteParams;
  middleware?: ResponsesMiddleware[];
}

export interface ResponsesRouterLocals {
  customData: Record<string, unknown>;
}

/**
  Middleware to put in front of all the routes in the conversationsRouter.
  This middleware is useful for things like authentication, data validation, etc.
  It exposes the app's {@link ConversationsService}.
  It also lets you access {@link ConversationsRouterLocals} via {@link Response.locals}
  ([docs](https://expressjs.com/en/api.html#res.locals)).
  You can use the locals in other middleware or persist when you create the conversation
  with the `POST /conversations` endpoint with the {@link AddCustomDataFunc}.
 */
export type ResponsesMiddleware = RequestHandler<
  ParamsDictionary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ResponsesRouterLocals
>;

/**
  Constructor function to make the /responses/* Express.js router.
 */
export function makeResponsesRouter({
  rateLimitConfig,
  createResponse,
  middleware = [
    requireValidIpAddress<ResponsesRouterLocals>(),
    requireRequestOrigin<ResponsesRouterLocals>(),
  ],
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
