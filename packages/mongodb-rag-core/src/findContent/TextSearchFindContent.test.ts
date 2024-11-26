import "dotenv/config";
import { makeMongoDbEmbeddedContentStore } from "../contentStore";
import { assertEnvVars } from "../assertEnvVars";
import {
  CORE_CHATBOT_APP_ENV_VARS,
  CORE_OPENAI_RETRIEVAL_ENV_VARS,
} from "../CoreEnvVars";
import {
  makeTextSearchFindContent,
  MakeTextSearchFindContentParams,
} from "./TextSearchFindContent";

jest.setTimeout(30000);
describe("makeTextSearchFindContent()", () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_RETRIEVAL_EMBEDDING_DEPLOYMENT,
    VECTOR_SEARCH_INDEX_NAME,
    FTS_INDEX_NAME,
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
      fullText: {
        name: FTS_INDEX_NAME,
      },
    },
  });

  const baseConfig = {
    store: embeddedContentStore,
    config: {
      limit: 10,
      fts: {
        indexName: FTS_INDEX_NAME,
        weight: 0.5,
        limit: 25,
      },
    },
  } satisfies MakeTextSearchFindContentParams;

  test("Should return content for relevant text", async () => {
    const findContent = makeTextSearchFindContent(baseConfig);
    const query = "MongoDB Atlas";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });
  test("Should not return content for irrelevant text", async () => {
    const findContent = makeTextSearchFindContent({
      ...baseConfig,
      config: {
        ...baseConfig.config,
      },
    });
    const query =
      "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
    const { content } = await findContent({
      query,
    });
    expect(content).toHaveLength(0);
  });
});
