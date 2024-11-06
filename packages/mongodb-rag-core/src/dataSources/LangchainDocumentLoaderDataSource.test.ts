import { makeLangChainDocumentLoaderDataSource } from "./LangchainDocumentLoaderDataSource";
import Path from "path";
import fs from "fs";
import { Page } from "../contentStore";
import { DocumentLoader } from "langchain/document_loaders/base";
import { Document } from "langchain/document";

const SRC_ROOT = Path.resolve(__dirname, "../../");
const docPath = Path.resolve(SRC_ROOT, "testData/sampleMdxFile.mdx");

const mockDocumentLoader: DocumentLoader = {
  load: jest.fn(async () => {
    return [
      new Document({
        pageContent: fs.readFileSync(docPath, {
          encoding: "utf-8",
        }),
      }),
    ];
  }),
  loadAndSplit: jest.fn(),
};

describe("LangchainDocumentLoaderDataSource", () => {
  it("should load pages from a Langchain DocumentLoader", async () => {
    const documentLoaderDataSource = makeLangChainDocumentLoaderDataSource({
      documentLoader: mockDocumentLoader,
      name: "some-source",
      metadata: {
        foo: "bar",
      },
      transformLangchainDocumentToPage: async (doc) => ({
        format: "txt",
        url: "https://example.com",
        body: doc.pageContent,
        metadata: {
          fizz: "buzz",
        },
        title: "document loaded",
      }),
    });
    const pages = await documentLoaderDataSource.fetchPages();
    expect(pages).toHaveLength(1);
    expect(pages[0]).toEqual<Page>({
      sourceName: "some-source",
      format: "txt",
      url: "https://example.com",
      body: fs.readFileSync(docPath, {
        encoding: "utf-8",
      }),
      metadata: {
        foo: "bar",
        fizz: "buzz",
      },
      title: "document loaded",
    });
  });
});
