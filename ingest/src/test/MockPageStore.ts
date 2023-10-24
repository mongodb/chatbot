import { PageStore, PersistedPage } from "chat-core";

export const makeMockPageStore = (): PageStore => {
  let pages: PersistedPage[] = [];
  return {
    async loadPages() {
      return pages;
    },
    async updatePages(args: PersistedPage[]) {
      pages = [...args];
    },
  };
};
