import { truncateEmbeddings } from "./truncateEmbeddings";
import fs from "fs";
import path from "path";

const SRC_ROOT = path.resolve(__dirname, "..", "..");
const pageWithEmbeddings = fs.readFileSync(
  path.resolve(SRC_ROOT, "../testData/pageWithEmbeddings.md"),
  {
    encoding: "utf-8",
  }
);

describe("cleanMarkdown", () => {
  it("should truncate embeddings", async () => {
    const cleaned = truncateEmbeddings(pageWithEmbeddings);
    fs.writeFileSync("cleaned.md", cleaned, "utf-8");
    // for the example text, should be 16 matches for 16 replacements
    const matches = cleaned.match(/, \.\.\., /g);
    expect(matches?.length).toBe(16);
    expect(cleaned.length).toBeLessThan(pageWithEmbeddings.length);
  });
  it("should not truncate numbers with decimals", async () => {
    const test = "10.10.10.10/255.255.255.0";
    const cleaned = truncateEmbeddings(test);
    expect(cleaned).toBe(test);
  });
});
