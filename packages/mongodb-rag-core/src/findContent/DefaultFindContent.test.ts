import "dotenv/config";
import { makeDefaultFindContent } from "./DefaultFindContent";
import { makeMongoDbEmbeddedContentStore } from "../contentStore";
import { makeOpenAiEmbedder } from "../embed";
import { assertEnvVars } from "../assertEnvVars";
import {
  CORE_CHATBOT_APP_ENV_VARS,
  CORE_OPENAI_RETRIEVAL_ENV_VARS,
} from "../CoreEnvVars";
import { AzureOpenAI } from "openai";

jest.setTimeout(30000);
describe("makeDefaultFindContent()", () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    OPENAI_API_VERSION,
    VECTOR_SEARCH_INDEX_NAME,
  } = assertEnvVars({
    ...CORE_CHATBOT_APP_ENV_VARS,
    ...CORE_OPENAI_RETRIEVAL_ENV_VARS,
  });
  const embeddedContentStore = makeMongoDbEmbeddedContentStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
    searchIndex: {
      embeddingName: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
      name: VECTOR_SEARCH_INDEX_NAME,
    },
  });

  const openAiClient = new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  });

  const embedder = makeOpenAiEmbedder({
    openAiClient,
    deployment: OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 1,
      maxDelay: 500,
    },
  });

  test("Should return content for relevant text", async () => {
    const findContent = makeDefaultFindContent({
      embedder,
      store: embeddedContentStore,
      findNearestNeighborsOptions: {
        minScore: 0.1, // low min, definitely does not have answers
      },
    });
    const query = "MongoDB Atlas";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });
  test("Should not return content for irrelevant text", async () => {
    const findContent = makeDefaultFindContent({
      embedder,
      store: embeddedContentStore,
      findNearestNeighborsOptions: {
        minScore: 0.99, // high min, definitely does not have answers
      },
    });
    const query =
      "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBe(0);
  });
});
