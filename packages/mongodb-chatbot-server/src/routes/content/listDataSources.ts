import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import {
  FindContentResult,
  MongoDbEmbeddedContentStore,
  MongoDbSearchResultsStore,
  QueryFilters,
  SearchRecordDataSource,
} from "mongodb-rag-core";
import { z } from "zod";

import { generateZodErrorMessage, SomeExpressRequest } from "../../middleware";
import { makeRequestError } from "../conversations/utils";
import {
  SearchContentCustomData,
  ContentRouterLocals,
} from "./contentRouter";
import { AddCustomDataFunc } from "../../processors";
import { wrapTraced } from "mongodb-rag-core/braintrust";


export type GetDataSourcesRequest = z.infer<typeof GetDataSourcesRequest>;

export const GetDataSourcesRequest = SomeExpressRequest.merge(
  z.object({
    headers: z.object({
      "req-id": z.string(),
    }),
  })
);

export interface DataSourceMetadata {
  id: string;
  version?: string[];
  type?: string;
}

export interface ListDataSourcesResponseBody {
  dataSources: DataSourceMetadata[];
}

export interface MakeListDataSourcesRouteParams {
  embeddedContentStore: MongoDbEmbeddedContentStore;
  addCustomData?: AddCustomDataFunc;
}

export function makeListDataSourcesRoute({
  embeddedContentStore,
  addCustomData
}: MakeListDataSourcesRouteParams) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse<ListDataSourcesResponseBody, ContentRouterLocals>
  ) => {
    try {
      // Fetch data sources from the store
      const dataSources = await embeddedContentStore.listDataSources();

      // Map to the required shape
      // const result: DataSourceMetadata[] = dataSources.map((ds: any) => ({
      //   id: ds.id,
      //   version: ds.version ? (Array.isArray(ds.version) ? ds.version : [ds.version]) : undefined,
      //   type: ds.type,
      // }));

      console.log("data sources ", dataSources);

      // res.json({ dataSources: result });
    } catch (error) {
      throw makeRequestError({
        httpStatus: 500,
        message: "Unable to list data sources",
      });
    }
  };
}

// function mapFindContentResultToSearchContentResponseChunk(
//   result: FindContentResult
// ): GetDataSourcesResponseBody {
//   return {
//     results: result.content.map(({ url, metadata, text }) => ({
//       url,
//       title: metadata?.pageTitle ?? "",
//       text,
//       metadata,
//     })),
//   };
// }

function mapDataSourcesToFilters(
  dataSources?: SearchRecordDataSource[]
): QueryFilters {
  if (!dataSources || dataSources.length === 0) {
    return {};
  }

  const sourceNames = dataSources.map((ds) => ds.name);
  const sourceTypes = dataSources
    .map((ds) => ds.type)
    .filter((t): t is string => !!t);
  const versionLabels = dataSources
    .map((ds) => ds.versionLabel)
    .filter((v): v is string => !!v);

  return {
    ...(sourceNames.length && { sourceName: sourceNames }),
    ...(sourceTypes.length && { sourceType: sourceTypes }),
    ...(versionLabels.length && { version: { label: versionLabels } }),
  };
}

async function persistSearchResultsToDatabase({
  query,
  results,
  dataSources = [],
  limit,
  searchResultsStore,
  customData,
}: {
  query: string;
  results: FindContentResult;
  dataSources?: SearchRecordDataSource[];
  limit: number;
  searchResultsStore: MongoDbSearchResultsStore;
  customData?: { [k: string]: unknown };
}) {
  searchResultsStore.saveSearchResult({
    query,
    results: results.content,
    dataSources,
    limit,
    createdAt: new Date(),
    ...(customData !== undefined && { customData }),
  });
}

async function getCustomData(
  req: ExpressRequest,
  res: ExpressResponse<ListDataSourcesResponseBody, ContentRouterLocals>,
  addCustomData?: AddCustomDataFunc
): Promise<SearchContentCustomData | undefined> {
  try {
    if (addCustomData) {
      return await addCustomData(req, res);
    }
  } catch (error) {
    throw makeRequestError({
      httpStatus: 500,
      message: "Error parsing custom data from the request",
    });
  }
}
