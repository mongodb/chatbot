import { makeMongoDbPageStore } from "mongodb-rag-core";
import { assertEnvVars } from "../assertEnvVars";
import {
  makeSnootyDataSources,
  snootyDataApiBaseUrl,
  snootyProjectConfig,
} from "../sources/snootySources";
import { makeIngestMetaStore } from "../cli/IngestMetaStore";
import { Config } from "../cli/Config";

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = assertEnvVars({
  MONGODB_CONNECTION_URI: "",
  MONGODB_DATABASE_NAME: "",
});

export const standardConfig = {
  pageStore: () =>
    makeMongoDbPageStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    }),
  ingestMetaStore: () =>
    makeIngestMetaStore({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
      entryId: "all",
    }),
  dataSources: async () => {
    return makeSnootyDataSources(snootyDataApiBaseUrl, snootyProjectConfig, {
      includeLinks: true,
      includeRefAnchors: true,
    });
  },
} satisfies Config;

export default standardConfig;
