import deepEqual from "deep-equal";
import { Page, PersistedPage } from "chat-core";

/**
  Given sets of old and new pages, returns the pages that need to be created,
  updated, or deleted.
 */
export const getChangedPages = async ({
  oldPages: oldPagesIn,
  newPages: newPagesIn,
}: {
  // Need to know the 'action' of the old pages in order to restore in case of
  // prior deletion
  oldPages: Omit<PersistedPage, "updated">[];
  newPages: Page[];
}): Promise<{
  deleted: PersistedPage[];
  created: PersistedPage[];
  updated: PersistedPage[];
}> => {
  const oldPages = new Map(oldPagesIn.map((page) => [page.url, page]));
  const newPages = new Map(newPagesIn.map((page) => [page.url, page]));

  const deleted = [...oldPages]
    .filter(([url]) => !newPages.has(url))
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "deleted",
      })
    );

  const created = [...newPages]
    .filter(([url]) => {
      const oldPage = oldPages.get(url);
      if (oldPage === undefined) {
        return true;
      }
      // Was it formerly deleted? If so, restore
      return oldPage.action === "deleted";
    })
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "created",
      })
    );

  const updated = [...newPages]
    .filter(([url, page]) => {
      const oldPage = oldPages.get(url);
      if (!oldPage) {
        return false;
      }
      // Filter out pages that haven't changed
      return !deepEqual(
        comparablePartialPage(oldPage),
        comparablePartialPage(page)
      );
    })
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "updated",
      })
    );

  return { deleted, created, updated };
};

/**
  Create a page object with any fields irrelevant to comparison stripped out.
 */
const comparablePartialPage = ({
  url,
  sourceName,
  body,
  format,
  tags,
}: Page): Partial<Page> => ({
  url,
  sourceName,
  body,
  format,
  tags,
});
