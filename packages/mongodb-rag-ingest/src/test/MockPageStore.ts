import { Page, PageStore, PersistedPage } from "mongodb-rag-core";

export const makeMockPageStore = (): PageStore => {
  let pages: PersistedPage[] = [];
  return {
    async loadPages() {
      return pages;
    },
    listDataSources: jest.fn(),
    async updatePages(args: PersistedPage[]) {
      pages = [...args];
    },
  } satisfies PageStore;
};
