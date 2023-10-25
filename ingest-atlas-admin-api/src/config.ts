import SwaggerParser from "@apidevtools/swagger-parser";
import smartCircular from "smart-circular";
import yaml from "yaml";
import { OpenAPIV3_1 } from "openapi-types";
import { Config, makeIngestMetaStore } from "ingest";
import {
  CORE_ENV_VARS,
  assertEnvVars,
  makeOpenAiEmbedder,
  makeMongoDbEmbeddedContentStore,
  makeMongoDbPageStore,
  Page,
  OpenAIClient,
  AzureKeyCredential,
} from "chat-core";
import { DataSource } from "ingest/sources";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
} = assertEnvVars(CORE_ENV_VARS);

const embedder = makeOpenAiEmbedder({
  openAiClient: new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  ),
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 25,
    startingDelay: 1000,
  },
});

const makeOperationUrl = (operationId: string) =>
  `https://www.mongodb.com/docs/atlas/reference/api-resources-spec/v2/#operation/${operationId}`;

const makeSpecLoader = (): DataSource => {
  const sourceName = "atlas-admin-api";
  return {
    name: sourceName,
    async fetchPages() {
      const specUrl =
        "https://mongodb-mms-prod-build-server.s3.amazonaws.com/openapi/3be644afd6ce0e4f5082695cfe00b69dd65600da-v2-2023-10-01.json";

      const spec = (await SwaggerParser.dereference(
        specUrl
      )) as OpenAPIV3_1.Document;

      if (spec.paths === undefined) {
        throw new Error(`Spec paths is undefined!`);
      }

      const baseUrl =
        (spec.servers && spec.servers[0].url) ?? "https://cloud.mongodb.com";

      const pages = Object.entries(spec.paths)
        .map(([path, method]): Page[] => {
          if (method === undefined) {
            return [];
          }
          return Object.entries(method).map(([method, details]): Page => {
            if (typeof details === "string") {
              throw new Error(
                `Unexpected string in ${path} ${method} details!`
              );
            }
            if (Array.isArray(details)) {
              throw new Error(`Unexpected array in ${path} ${method} details!`);
            }

            const {
              tags,
              summary,
              description,
              operationId,
              parameters,
              deprecated,
            } = details;

            if (operationId === undefined) {
              throw new Error(
                `Undefined operationId in ${path} ${method} details!`
              );
            }

            const url = makeOperationUrl(operationId);

            const nonCircularDetails = smartCircular(details);

            const metadata = {
              api: "atlas-admin-api",
              method,
              path,
              baseUrl,
              ...nonCircularDetails,
            };

            const bodyInfo = {
              path,
              tags,
              summary,
              description,
              operationId,
              deprecated,
            };

            return {
              url,
              format: "txt",
              sourceName,
              metadata,
              body: yaml.stringify(bodyInfo),
            };
          });
        })
        .flat(1);

      return pages;
    },
  };
};

export const atlasAdminApiConfig: Config = {
  embedder: () => embedder,
  embeddedContentStore: () =>
    makeMongoDbEmbeddedContentStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      entryId: "atlas-admin-api",
    }),
  chunkOptions: () => ({
    async transform(chunk, { page }) {
      return {
        ...chunk,
        metadata: { ...(page.metadata ?? {}) },
      };
    },
    maxChunkSize: 8191,
  }),
  dataSources: () => {
    const specLoader = makeSpecLoader();
    return [specLoader];
  },
} satisfies Config;

export default atlasAdminApiConfig;
