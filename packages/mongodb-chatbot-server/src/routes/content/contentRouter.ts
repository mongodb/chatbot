import { Response, RequestHandler, Router } from "express";
import { FindContentFunc } from "mongodb-rag-core";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  SearchContentRequest,
  makeSearchContentRoute,
} from "./searchContent";
import type { ContentCustomData, SearchResultsStore } from "mongodb-rag-core";
import { NextFunction, ParamsDictionary } from "express-serve-static-core";
import { requireRequestOrigin, requireValidIpAddress } from "../../middleware";
import {
  AddCustomDataFunc,
  addIpToCustomData,
  addOriginCodeToCustomData,
  addOriginToCustomData,
  addUserAgentToCustomData,
} from "../../processors";

/**
  Middleware to put in front of all the routes in the contentRouter.
  Useful for authentication, data validation, logging, etc.
  It exposes the app's {@link ContentRouterLocals} via {@link Response.locals}
  ([docs](https://expressjs.com/en/api.html#res.locals)).
  You can use or modify `res.locals.customData` in your middleware, and this data
  will be available to subsequent middleware and route handlers.
 */
export type SearchContentMiddleware = RequestHandler<
  ParamsDictionary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ContentRouterLocals
>;

/**
  Express.js Request that exposes the app's {@link ConversationsService}.

  This is useful if you want to do authentication or dynamic data validation.
 */
export interface ContentRouterLocals {
  customData: Record<string, unknown>;
}

export interface MakeContentRouterParams {
  findContent: FindContentFunc;
  searchResultsStore: SearchResultsStore;
  middleware?: SearchContentMiddleware[];
  contentCustomData?: AddDefinedContentCustomDataFunc;
}

export type AddDefinedContentCustomDataFunc = (
  ...args: Parameters<
    AddCustomDataFunc<ContentRouterLocals, ContentCustomData>
  >
) => Promise<Exclude<ContentCustomData, undefined>>;

export const defaultContentCustomData: AddDefinedContentCustomDataFunc = async (req, res) => {
  return {
    ...(await addIpToCustomData(req, res)),
    ...(await addOriginToCustomData(req, res)),
    ...(await addOriginCodeToCustomData(req, res)),
    ...(await addUserAgentToCustomData(req, res)),
  };
};

export function makeContentRouter({
  findContent,
  searchResultsStore,
  middleware = [requireValidIpAddress(), requireRequestOrigin()],
  // TODO: Use this
  contentCustomData = defaultContentCustomData
}: MakeContentRouterParams) {
  const contentRouter = Router();

  // Set the customData on the response locals
  // for use in subsequent middleware.
  contentRouter.use(((_, res: Response, next: NextFunction) => {
    res.locals.customData = {};
    next();
  }) satisfies RequestHandler);

  // Add middleware to the conversationsRouter.
  middleware?.forEach((middleware) => contentRouter.use(middleware));

  // Create new conversation.
  contentRouter.post(
    "/search",
    validateRequestSchema(SearchContentRequest),
    makeSearchContentRoute({
      findContent,
      searchResultsStore,
    })
  );

  return contentRouter;
}
