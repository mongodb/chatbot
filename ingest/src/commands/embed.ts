import { CommandModule } from "yargs";
import {
  makeDatabaseConnection,
  assertEnvVars,
  makeOpenAiEmbedFunc,
} from "chat-core";
import { updateEmbeddedContent } from "../updateEmbeddedContent";
import { INGEST_ENV_VARS } from "../IngestEnvVars";

type EmbeddedContentCommandArgs = {
  since: string;
  source?: string;
};

const commandModule: CommandModule<unknown, EmbeddedContentCommandArgs> = {
  command: "embed",
  builder(args) {
    return args.string("since").string("source").demandOption("since");
  },
  async handler({ since, source }) {
    const {
      MONGODB_CONNECTION_URI,
      MONGODB_DATABASE_NAME,
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

    const store = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    const sourceNames =
      source === undefined
        ? undefined
        : Array.isArray(source)
        ? source
        : [source];

    try {
      await updateEmbeddedContent({
        since: new Date(since),
        sourceNames,
        pageStore: store,
        embeddedContentStore: store,
        embed,
      });
    } finally {
      await store.close();
    }
  },
  describe: "Update embedded content data from pages",
};

export default commandModule;
