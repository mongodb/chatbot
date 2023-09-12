import { makeMdOnGithubDataSource } from "./MdOnGithbDataSource";
import { mongoDbCppDriverConfig } from "./projectSources";
import "dotenv/config";
import fs from "fs";

jest.setTimeout(60000);
describe("MdOnGithubDataSource", () => {
  it("loads and processes a real repo of markdown files", async () => {
    const dataSource = await makeMdOnGithubDataSource(mongoDbCppDriverConfig);
    const pages = await dataSource.fetchPages();

    console.log(pages);
  });
});
