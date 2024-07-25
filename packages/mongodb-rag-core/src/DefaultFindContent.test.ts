import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { makeDefaultFindContent } from "./DefaultFindContent";
import { makeMongoDbEmbeddedContentStore } from "./MongoDbEmbeddedContentStore";
import { makeOpenAiEmbedder } from "./OpenAiEmbedder";
import { assertEnvVars } from "./assertEnvVars";
import { CORE_ENV_VARS } from "./CoreEnvVars";

describe("makeDefaultFindContent()", () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
  } = assertEnvVars(CORE_ENV_VARS);
  const embeddedContentStore = makeMongoDbEmbeddedContentStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );

  const embedder = makeOpenAiEmbedder({
    openAiClient,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
    backoffOptions: {
      numOfAttempts: 3,
      maxDelay: 5000,
    },
  });

  const findContent = makeDefaultFindContent({
    embedder,
    store: embeddedContentStore,
  });
  test("Should return content for relevant text", async () => {
    const query = "MongoDB Atlas";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });
  test("Should not return content for irrelevant text", async () => {
    const query =
      "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
    const { content } = await findContent({
      query,
    });
    expect(content).toBeDefined();
    expect(content.length).toBe(0);
  });
});
