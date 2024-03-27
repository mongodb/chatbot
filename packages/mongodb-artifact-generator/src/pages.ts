import { Page, PageStore } from "mongodb-rag-core";

export type FindPagesArgs = {
  urls: string[];
};

export type FindPagesResult = {
  pages: Page[];
};

export type FindPages = ({ urls }: FindPagesArgs) => Promise<FindPagesResult>;

export type MakeFindPagesArgs = {
  pageStore: PageStore;
};

export function makeFindPages({ pageStore }: MakeFindPagesArgs): {
  findPages: FindPages;
  cleanup: () => Promise<void>;
} {
  const findPages: FindPages = async ({ urls }) => {
    if (pageStore.queryType !== "mongodb") {
      throw new Error(
        `Unsupported query type: ${pageStore.queryType}. Must be "mongodb".`
      );
    }
    pageStore.loadPages({
      query: {
        url: {
          $or: urls.map((url) => ({ $regex: url })),
        },
      },
    });

    return { pages: [] };
  };

  // const cleanup = async () => pageStore.close?.();
  const cleanup = async () => {
    return;
  };

  return { findPages, cleanup };
}
