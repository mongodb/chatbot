import { CommandModule } from "yargs";
import {
  makeDatabaseConnection,
  assertEnvVars,
  makeOpenAiEmbedFunc,
  EmbeddedContentStore,
  PageStore,
} from "chat-core";
import { updateEmbeddedContent } from "../updateEmbeddedContent";
import { standardChunkFrontMatterUpdater } from "../chunkPage";
import { INGEST_ENV_VARS } from "../IngestEnvVars";

type EmbeddedContentCommandArgs = {
  since: string;
  source?: string | string[];
};

export const CURRENT_CHUNKING_VERSION = 1;

const commandModule: CommandModule<unknown, EmbeddedContentCommandArgs> = {
  command: "embed",
  builder(args) {
    return args
      .string("since")
      .option("source", {
        string: true,
        description:
          "A source name to load. If unspecified, loads all sources.",
      })
      .demandOption("since");
  },
  async handler({ since, source }) {
    if (isNaN(Date.parse(since))) {
      throw new Error(
        `The value for 'since' (${since}) must be a valid JavaScript date string.`
      );
    }
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } =
      assertEnvVars(INGEST_ENV_VARS);

    const store = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    try {
      await doEmbedCommand({
        pageStore: store,
        embeddedContentStore: store,
        since: new Date(since),
        source,
      });
    } finally {
      await store.close();
    }
  },
  describe: "Update embedded content data from pages",
};

export default commandModule;

export const doEmbedCommand = async ({
  pageStore,
  embeddedContentStore,
  since,
  source,
}: {
  since: Date;
  pageStore: PageStore;
  embeddedContentStore: EmbeddedContentStore;
  source?: string | string[];
}) => {
  const {
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_MODEL_VERSION,
    OPENAI_EMBEDDING_DEPLOYMENT,
  } = assertEnvVars(INGEST_ENV_VARS);

  const embed = makeOpenAiEmbedFunc({
    baseUrl: OPENAI_ENDPOINT,
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 25,
      startingDelay: 1000,
    },
  });

  const sourceNames =
    source === undefined
      ? undefined
      : Array.isArray(source)
      ? source
      : [source];

  await updateEmbeddedContent({
    since,
    sourceNames,
    pageStore,
    embeddedContentStore,
    embed,
    chunkOptions: {
      transform: standardChunkFrontMatterUpdater,
      chunkingVersion: CURRENT_CHUNKING_VERSION,
    },
  });
};
