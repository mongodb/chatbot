import { NextFunction, RequestHandler, Response, Router } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { FindContentFunc, MongoDbEmbeddedContentStore, MongoDbSearchResultsStore } from "mongodb-rag-core";
import { ParsedQs } from "qs";

import validateRequestSchema from "../../middleware/validateRequestSchema";
import { SearchContentRequest, makeSearchContentRoute } from "./searchContent";
import { requireRequestOrigin, requireValidIpAddress } from "../../middleware";
import {
  AddCustomDataFunc,
  addDefaultCustomData,
  RequestCustomData,
} from "../../processors";
import { GetDataSourcesRequest, makeListDataSourcesRoute } from "./listDataSources";

export type SearchContentCustomData = RequestCustomData;

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
  unknown,
  unknown,
  ParsedQs,
  ContentRouterLocals
>;

/**
  Local variables provided by Express.js for single request-response cycle
 
  Keeps track of data for authentication or dynamic data validation.
 */
export interface ContentRouterLocals {
  customData: Record<string, unknown>;
}

/**
  Express.js Response from the app's {@link ConversationsService}.
 */
export type SearchContentRouterResponse = Response<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ContentRouterLocals
>;

export interface MakeContentRouterParams {
  findContent: FindContentFunc;
  searchResultsStore: MongoDbSearchResultsStore;
  embeddedContentStore: MongoDbEmbeddedContentStore;
  addCustomData?: AddCustomDataFunc;
  middleware?: SearchContentMiddleware[];
}

export function makeContentRouter({
  findContent,
  searchResultsStore,
  embeddedContentStore,
  addCustomData = addDefaultCustomData,
  middleware = [
    requireValidIpAddress<ContentRouterLocals>(),
    requireRequestOrigin<ContentRouterLocals>(),
  ],
}: MakeContentRouterParams) {
  const contentRouter = Router();

  // Set the customData and conversations on the response locals
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
      addCustomData,
    })
  );

  contentRouter.get("/sources", validateRequestSchema(GetDataSourcesRequest), makeListDataSourcesRoute({ embeddedContentStore, addCustomData }));

  return contentRouter;
}
