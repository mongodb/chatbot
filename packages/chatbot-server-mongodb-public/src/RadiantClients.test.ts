import { assertEnvVars } from "mongodb-chatbot-server";
import {
  makeRadiantEmbeddingClient,
  makeRadiantLlmClient,
} from "./RadiantClients";
import "dotenv/config";
const { RADIANT_API_KEY, RADIANT_BASE_URL, AUTH_COOKIE } = assertEnvVars({
  RADIANT_API_KEY: "",
  RADIANT_BASE_URL: "",
  AUTH_COOKIE: "",
});
describe("Radiant clients", () => {
  it("should call LLM with Radiant", async () => {
    const llm = makeRadiantLlmClient({
      radiantApiKey: RADIANT_API_KEY,
      radiantBaseUrl: RADIANT_BASE_URL,
      cookie: AUTH_COOKIE,
    });
    const res = await llm.invoke("Hello, world!");
    expect(res.content).toBeTruthy();
  });
  it("should call embedding model with Radiant", async () => {
    const embedder = makeRadiantEmbeddingClient({
      radiantApiKey: RADIANT_API_KEY,
      radiantBaseUrl: RADIANT_BASE_URL,
      cookie: AUTH_COOKIE,
    });
    const res = await embedder.embedQuery("Hello, world!");
    expect(res.length).toBeGreaterThan(0);
  });
});
