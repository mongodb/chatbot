import { Router } from "express";
import { FindContentFunc, MongoDbSearchResultsStore } from "mongodb-rag-core";
import validateRequestSchema from "../../middleware/validateRequestSchema";
import {
  SearchContentRequest,
  makeSearchContentRoute,
} from "./searchContent";

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
