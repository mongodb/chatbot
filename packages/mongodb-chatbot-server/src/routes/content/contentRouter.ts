import { RequestHandler, Router } from "express";
import { FindContentFunc, MongoDbSearchResultsStore } from "mongodb-rag-core";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  SearchContentRequest,
  makeSearchContentRoute,
} from "./searchContent";
import { ParamsDictionary } from "express-serve-static-core";

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
  unknown,
  ContentRouterLocals
>;

/**
  Local variables provided by Express.js for single request-response cycle
 
  Keeps track of data for authentication or dynamic data validation.
 */
export interface ContentRouterLocals {
  customData: Record<string, unknown>;
}




export interface MakeContentRouterParams {
  findContent: FindContentFunc;
  searchResultsStore: MongoDbSearchResultsStore;
}

export function makeContentRouter({
  findContent,
  searchResultsStore,
}: MakeContentRouterParams) {
  const contentRouter = Router();

  // TODO: add middleware, similar to the conversations router

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
