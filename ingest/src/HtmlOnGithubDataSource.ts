import { Page, PageMetadata } from "chat-core";
import TurndownService from "turndown";
import * as turndownPluginGfm from "turndown-plugin-gfm";

import { JSDOM } from "jsdom";

import {
  MakeGitHubDataSourceArgs,
  makeGitHubDataSource,
} from "./GitHubDataSource";
import { Document as LcDoc } from "langchain/document";

export type MakeHtmlOnGithubDataSourceParams = Omit<
  MakeGitHubDataSourceArgs,
  "handleDocumentInRepo"
> & {
  /**
    Transform a filepath in the repo to a full URL for the corresponding Page object.
   */
  pathToPageUrl: (
    pathInRepo: string,
    extractedMetadata?: PageMetadata
  ) => string;

  /**
  Metadata to include with all Pages in DB.
   */
  metadata?: PageMetadata;

  /**
    Extract metadata from page content. Added to the `Page.metadata` field.
    If a in the result of `extractMetadata()` is the same as a key in `metadata`,
    the `extractMetadata()` key will override it.
   */
  extractMetadata?: (domDoc: Document) => PageMetadata;

  /**
    Extract title from page content and front matter (if it exists). Added to the `Page.title` field.
    If not specified, the inner text of the first HTML <h1> tag (e.g. "<h1> Some Title </h1>") in the page content is used.
   */
  extractTitle?: (domDoc: Document) => string | undefined;

  removeElements: (domDoc: Document) => Element[];
};
/**
  Loads and processes .html files from a GitHub repo.
 */
export const makeHtmlOnGithubDataSource = async ({
  name,
  repoUrl,
  repoLoaderOptions,
  pathToPageUrl,
  metadata,
  extractMetadata,
  extractTitle = extractHtmlH1,
  removeElements,
}: MakeHtmlOnGithubDataSourceParams) => {
  return makeGitHubDataSource({
    name,
    repoUrl,
    repoLoaderOptions: {
      ...(repoLoaderOptions ?? {}),
      ignoreFiles: [
        ...(repoLoaderOptions?.ignoreFiles ?? []),
        /^(?!.*\.html$).*/i, // Anything BUT .html extension
      ],
    },

    handleDocumentInRepo: makeHandleHtmlDocumentInRepo({
      name,
      pathToPageUrl,
      metadata,
      extractMetadata,
      extractTitle,
      removeElements,
    }),
  });
};

export function makeHandleHtmlDocumentInRepo({
  name,
  pathToPageUrl,
  metadata,
  extractMetadata,
  extractTitle = extractHtmlH1,
  removeElements,
}: Omit<
  Omit<MakeHtmlOnGithubDataSourceParams, "repoUrl">,
  "repoLoaderOptions"
>) {
  const turndownService = new TurndownService({
    codeBlockStyle: "fenced",
    headingStyle: "atx",
    bulletListMarker: "-",
  });
  turndownService.use(turndownPluginGfm.gfm);
  return async (document: LcDoc) => {
    console.log(`Processing ${document.metadata.source}`);
    const dom = new JSDOM(document.pageContent);
    const { document: domDocument } = dom.window;

    const title = extractTitle(domDocument);
    let extractedMetadata = {};
    if (extractMetadata) {
      extractedMetadata = extractMetadata(domDocument);
    }

    const elementsToRemove = removeElements(domDocument);
    elementsToRemove.forEach((el) => el.parentNode?.removeChild(el));

    // TODO: wrap with link/image stripper...have to do on top of other PR
    const body = turndownService.turndown(domDocument.body);
    const page: Page = {
      sourceName: name,
      format: "md",
      title,
      body,
      url: pathToPageUrl(document.metadata.source, extractedMetadata),
      metadata: {
        ...metadata,
        ...extractedMetadata,
      },
    };
    return page;
  };
}

export function extractHtmlH1(domDoc: Document) {
  const h1 = domDoc.querySelector("h1");
  return h1?.textContent ?? undefined;
}
