import { PageStore, PersistedPage } from "mongodb-rag-core";

export const makeMockPageStore = (): PageStore => {
  let pages: PersistedPage[] = [];
  return {
    async loadPages() {
      return pages;
    },
    async updatePages(args: PersistedPage[]) {
      pages = [...args];
    },
    async deletePages() {
      return;
    }
  };
};
