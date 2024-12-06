import {
  HandleHtmlPageFuncOptions,
  handleHtmlDocument,
  makeGitDataSource,
} from "mongodb-rag-core/dataSources";

const removeElements = (domDoc: Document) => [
  ...Array.from(domDoc.querySelectorAll("head")),
  ...Array.from(domDoc.querySelectorAll("script")),
  ...Array.from(domDoc.querySelectorAll("noscript")),
  ...Array.from(domDoc.querySelectorAll("#top")),
  ...Array.from(domDoc.querySelectorAll(".navpath")),
];
const extractTitle = (domDoc: Document) => {
  const title = domDoc.querySelector("title");
  if (title?.textContent?.includes("WiredTiger: ")) {
    return title?.textContent?.replace("WiredTiger: ", "").trim() ?? undefined;
  }
  return title?.textContent ?? undefined;
};

const extractMetadata = (domDoc: Document) => {
  const version = domDoc.querySelector("#projectnumber")?.textContent;
  return { version };
};
const htmlParserOptions: Omit<HandleHtmlPageFuncOptions, "sourceName"> = {
  pathToPageUrl: (pathInRepo: string) =>
    `https://source.wiredtiger.com${pathInRepo}`,
  removeElements,
  extractTitle,
  extractMetadata,
};

export const wiredTigerSourceConstructor = async () => {
  return await makeGitDataSource({
    name: "wired-tiger",
    repoUri: "https://github.com/wiredtiger/wiredtiger.github.com.git",
    repoOptions: {
      "--depth": 1,
      "--branch": "master",
    },
    metadata: {
      productName: "WiredTiger",
      tags: ["docs", "storage-engine"],
    },
    filter: (path: string) =>
      path.endsWith(".html") &&
      path.startsWith("/develop/") &&
      !path.includes("group__wt") &&
      !path.includes("develop/search") &&
      !path.includes("struct_w_t___"),
    handlePage: async (path, content) =>
      await handleHtmlDocument(path, content, htmlParserOptions),
  });
};
