import { makeMdOnGithubDataSource } from "./MdOnGithbDataSource";
import { mongoDbCppDriverConfig } from "./projectSources";
import "dotenv/config";
import { strict as assert } from "assert";

jest.setTimeout(60000);
describe("MdOnGithubDataSource", () => {
  it("loads and processes a real repo of markdown files", async () => {
    const dataSource = await makeMdOnGithubDataSource(mongoDbCppDriverConfig);
    const pages = await dataSource.fetchPages();

    const samplePage = pages.find((page) =>
      page.title?.includes("Installing the mongocxx driver")
    );
    assert(samplePage);
    expect(samplePage?.body).toContain("install");
  });
});
