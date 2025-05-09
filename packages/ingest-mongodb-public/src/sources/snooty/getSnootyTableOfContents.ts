import fetch from "node-fetch";
import { createInterface } from "readline";
import { snootyDataApiBaseUrl } from "../snootySources";
import {
  SnootyManifestEntry,
  SnootyMetadataEntry,
  SnootyTocEntry,
} from "./SnootyDataSource";
import { PageStore, PersistedPage } from "mongodb-rag-core";

interface TableOfContents {
  title?: string;
  url: string;
  children: TableOfContents[];
  description?: string;
}

interface GetTableOfContentsReturnType {
  title?: string;
  toc: TableOfContents;
  toctreeOrder: string[];
}

export async function getSnootyTableOfContents({
  snootyProjectName,
  currentBranch,
  baseUrl,
  pageStore,
}: {
  snootyProjectName: string;
  currentBranch: string;
  baseUrl: string;
  pageStore: PageStore;
}): Promise<GetTableOfContentsReturnType | null> {
  const getBranchDocumentsUrl = new URL(
    `projects/${snootyProjectName}/${currentBranch}/documents`,
    snootyDataApiBaseUrl
  );
  const { body } = await fetch(getBranchDocumentsUrl);
  if (body === null) {
    return null;
  }
  const stream = createInterface(body);
  const tocMetadata = await new Promise<GetTableOfContentsReturnType | null>(
    (resolve, _reject) => {
      stream.on("line", async (line) => {
        const entry = JSON.parse(line) as SnootyManifestEntry;
        switch (entry.type) {
          case "metadata": {
            const {
              data: { toctree, toctreeOrder, title },
            } = entry as SnootyMetadataEntry;
            const urls = toctreeOrder.map((entry) =>
              mergeSlugWithBaseUrl(baseUrl, entry)
            );
            const pages = await pageStore.loadPages({
              urls,
            });
            // Precompute page map for faster lookup
            const pageMap = pages.reduce((acc, page) => {
              acc[page.url] = page;
              return acc;
            }, {} as Record<string, PersistedPage>);

            const toc = parseTocTree(toctree, baseUrl, pageMap);
            stream.close();
            const out = {
              title,
              toctreeOrder: toctreeOrder.map((entry) =>
                mergeSlugWithBaseUrl(baseUrl, entry)
              ),
              toc,
            };
            resolve(out);
            return;
          }
          // ignore other types.. we only care about metadata
          default:
            return;
        }
      });
    }
  );
  return tocMetadata;
}

interface TableOfContents {
  title?: string;
  url: string;
  children: TableOfContents[];
}

function mergeSlugWithBaseUrl(baseUrl: string, slug: string): string {
  // Ensure baseUrl has trailing slash
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  // Ensure slug doesn't have leading slash
  const normalizedSlug = slug.startsWith("/") ? slug.substring(1) : slug;
  return `${normalizedBaseUrl}${normalizedSlug}`;
}

function parseTocTree(
  tocTree: SnootyTocEntry,
  baseUrl: string,
  pages: Record<string, PersistedPage>
): TableOfContents {
  const url =
    tocTree.url ??
    (tocTree.slug ? mergeSlugWithBaseUrl(baseUrl, tocTree.slug) : "");
  const page = pages[url];
  let description: string | undefined;
  if (page) {
    description =
      typeof page.metadata?.page?.description === "string"
        ? page.metadata?.page?.description
        : undefined;
  }
  return {
    title: tocTree.title[0].value,
    url,
    description,
    children: tocTree.children.map((child) =>
      parseTocTree(child, baseUrl, pages)
    ),
  };
}
