import { DataSource } from "mongodb-rag-core/dataSources";
import {
  nodeJsQuickstart,
  javaQuickstart,
  netlifyMongodbNextjsAiChatbot,
  leafsteroids,
  mongodbWithFastapi,
  mongoRx,
} from "./mongodbDeveloperCodeRepos";

async function smokeTest(
  makeDataSource: () => Promise<DataSource>,
  includesPage: string
) {
  const source = await makeDataSource();
  const pages = await source.fetchPages();
  expect(pages.length).toBeGreaterThan(0);
  const samplePage = pages.find((page) => page.url.includes(includesPage));
  expect(samplePage).toBeDefined();
}

jest.setTimeout(90000);
describe("mongodbDeveloperCodeRepos", () => {
  describe("smoke tests", () => {
    test("nodeJsQuickstart", async () => {
      smokeTest(nodeJsQuickstart, "usersCollection.js");
    });

    test("javaQuickstart", async () => {
      smokeTest(javaQuickstart, "AggregationFramework.java");
    });

    test("netlifyMongodbNextjsAiChatbot", async () => {
      smokeTest(netlifyMongodbNextjsAiChatbot, "netlify.toml");
    });

    test("leafsteroids", async () => {
      smokeTest(leafsteroids, "Program.cs");
    });

    test("mongodbWithFastapi", async () => {
      smokeTest(mongodbWithFastapi, "app.py");
    });

    test("mongoRx", async () => {
      smokeTest(mongoRx, "package.json");
    });
  });
});
