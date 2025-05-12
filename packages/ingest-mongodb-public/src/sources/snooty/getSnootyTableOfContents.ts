import fetch from "node-fetch";
import { createInterface } from "readline";
import { snootyDataApiBaseUrl } from "../snootySources";
import {
  SnootyManifestEntry,
  SnootyMetadataEntry,
  SnootyTocEntry,
} from "./SnootyDataSource";
import { Page } from "mongodb-rag-core";

export interface TableOfContents {
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
  pages,
}: {
  snootyProjectName: string;
  currentBranch: string;
  baseUrl: string;
  pages: Page[];
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
            // We don't need the URLs array anymore since we're using the page map directly
            const _urls = toctreeOrder.map((entry) =>
              mergeSlugWithBaseUrl(baseUrl, entry)
            );

            // Precompute page map for faster lookup
            const pageMap = pages.reduce((acc, page) => {
              acc[page.url] = page;
              return acc;
            }, {} as Record<string, Page>);

            const toc = parseTocTree(toctree, baseUrl, pageMap);
            stream.close();
            const out = {
              title,
              toctreeOrder: toctreeOrder.map((entry) =>
                addTrailingSlash(mergeSlugWithBaseUrl(baseUrl, entry))
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

// FIXME: this works great in the test, but fails miserably on real data
// Unclear why. It returns wayyy too many items, a few OOMs more than the correct number of links.
export function flattenTableOfContents(
  toc: TableOfContents,
  entryUrl?: string,
  pageMap?: Record<string, unknown>
): TableOfContents[] {
  // Use a non-recursive approach to avoid duplicate entries
  const result: TableOfContents[] = [];
  const urlSet = new Set<string>();
  const queue: TableOfContents[] = [];

  // Start with either the entry point or the root
  if (entryUrl) {
    const entryToc = findEntryToc(toc, entryUrl);
    if (entryToc) {
      queue.push(entryToc);
    }
  } else {
    queue.push(toc);
  }

  // Process the queue
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    // Only process each URL once
    if (!urlSet.has(current.url)) {
      // If pageMap is provided, only include entries that exist in the page map
      if (!pageMap || pageMap[current.url]) {
        urlSet.add(current.url);
        result.push(current);
      }

      // Add children to the queue (even if parent wasn't included)
      for (const child of current.children) {
        queue.push(child);
      }
    }
  }

  return result;
}

function findEntryToc(
  toc: TableOfContents,
  entryUrl: string
): TableOfContents | null {
  if (toc.url === entryUrl) {
    return toc;
  }
  for (const child of toc.children) {
    const result = findEntryToc(child, entryUrl);
    if (result) {
      return result;
    }
  }
  return null;
}

function mergeSlugWithBaseUrl(baseUrl: string, slug: string): string {
  // Ensure baseUrl has trailing slash
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  // Ensure slug doesn't have leading slash
  const normalizedSlug = slug.startsWith("/") ? slug.substring(1) : slug;
  return `${normalizedBaseUrl}${normalizedSlug}`;
}

function addTrailingSlash(str: string): string {
  return str.endsWith("/") ? str : `${str}/`;
}

function parseTocTree(
  tocTree: SnootyTocEntry,
  baseUrl: string,
  pages: Record<string, Page>
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
