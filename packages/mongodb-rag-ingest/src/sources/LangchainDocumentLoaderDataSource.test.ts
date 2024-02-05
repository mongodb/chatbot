// import { TextLoader } from "langchain/document_loaders/fs/text";
import { makeLangChainDocumentLoaderDataSource } from "./LangchainDocumentLoaderDataSource";
import { TextLoader } from "langchain/document_loaders/fs/text";
import Path from "path";
import fs from "fs";
import { Page } from "mongodb-rag-core";

const SRC_ROOT = Path.resolve(__dirname, "../../");
const docPath = Path.resolve(SRC_ROOT, "testData/sampleMdxFile.mdx");

describe("LangchainDocumentLoaderDataSource", () => {
  it("should load pages from a Langchain DocumentLoader", async () => {
    const documentLoader = new TextLoader(docPath);
    const documentLoaderDataSource = makeLangChainDocumentLoaderDataSource({
      documentLoader,
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
