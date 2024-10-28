import fs from "fs";
import Path from "path";
import {
  makeMarkdownFilesForLearningPaths
} from "./makeMarkdownPagesForLearningPaths";
import {
  TiCatalogItem,
} from "./MongoDbUniversityDataApiClient";

const SRC_ROOT = Path.resolve(__dirname, "../..");

describe("makeMarkdownFiles", () => {

  const tiCatalogItems = JSON.parse(
    fs.readFileSync(
      Path.resolve(SRC_ROOT, "../testData/sampleUniversityCourseWithNestedContent.json"),
      "utf-8"
    )
  ) as TiCatalogItem[];

  it("should make markdown files", () => {
    makeMarkdownFilesForLearningPaths({tiCatalogItems})
  });
});
