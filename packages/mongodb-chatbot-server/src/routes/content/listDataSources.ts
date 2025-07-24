import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  DataSourceMetadata,
  MongoDbEmbeddedContentStore,
} from "mongodb-rag-core";
import { z } from "zod";

import { SomeExpressRequest } from "../../middleware";
import { makeRequestError } from "../conversations/utils";
import {
  ContentRouterLocals,
} from "./contentRouter";

export type GetDataSourcesRequest = z.infer<typeof GetDataSourcesRequest>;

export const GetDataSourcesRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
  })
);

export interface ListDataSourcesResponseBody {
  dataSources: DataSourceMetadata[];
}

export interface MakeListDataSourcesRouteParams {
  embeddedContentStore: MongoDbEmbeddedContentStore;
}

export const ERROR_MESSAGES = {
  UNABLE_TO_LIST_DATA_SOURCES: "Unable to list data sources",
};

export function makeListDataSourcesRoute({
  embeddedContentStore,
}: MakeListDataSourcesRouteParams) {
  return async (
    _req: ExpressRequest,
    res: ExpressResponse<ListDataSourcesResponseBody, ContentRouterLocals>
  ) => {
    try {
      // Fetch data sources from the store
      const dataSources = await embeddedContentStore.listDataSources();
      res.json({ dataSources });
    } catch (error) {
      throw makeRequestError({
        httpStatus: 500,
        message: ERROR_MESSAGES.UNABLE_TO_LIST_DATA_SOURCES,
      });
    }
  };
}
