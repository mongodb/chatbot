import { RequestHandler, Router } from "express";
import { FindContentFunc } from "mongodb-rag-core";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  SearchContentRequest,
  makeSearchContentRoute,
} from "./searchContent";
import type { SearchResultsStore } from "mongodb-rag-core";
import { ParamsDictionary } from "express-serve-static-core";
import { requireRequestOrigin, requireValidIpAddress } from "../../middleware";

/**
  Middleware to put in front of all the routes in the contentRouter.
  This middleware is useful for things like authentication, data validation, etc.
  It exposes the app's {@link ConversationsService}.
  It also lets you access {@link ConversationsRouterLocals} via {@link Response.locals}
  ([docs](https://expressjs.com/en/api.html#res.locals)).
  You can use the locals in other middleware or persist when you create the conversation
  with the `POST /conversations` endpoint with the {@link AddCustomDataFunc}.
 */

export type SearchContentMiddleware = RequestHandler<
  ParamsDictionary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  SearchContentRouterLocals
>;

/**
  Express.js Request that exposes the app's {@link ConversationsService}.

  This is useful if you want to do authentication or dynamic data validation.
 */
export interface SearchContentRouterLocals {
  customData: Record<string, unknown>;
}

export interface MakeContentRouterParams {
  findContent: FindContentFunc;
  searchResultsStore: SearchResultsStore;
  middleware?: SearchContentMiddleware[];
}

export function makeContentRouter({
  findContent,
  searchResultsStore,
  middleware = [requireValidIpAddress(), requireRequestOrigin()],
}: MakeContentRouterParams) {
  const contentRouter = Router();

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
