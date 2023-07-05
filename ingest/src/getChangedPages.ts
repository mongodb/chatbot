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
  oldPages: Page[];
  newPages: Page[];
}): Promise<PersistedPage[]> => {
  const oldPages = new Map(oldPagesIn.map((page) => [page.url, page]));
  const newPages = new Map(newPagesIn.map((page) => [page.url, page]));

  const deletedPages = [...oldPages]
    .filter(([url]) => !newPages.has(url))
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "deleted",
      })
    );

  const createdPages = [...newPages]
    .filter(([url]) => !oldPages.has(url))
    .map(
      ([, page]): PersistedPage => ({
        ...page,
        updated: new Date(),
        action: "created",
      })
    );

  const updatedPages = [...newPages]
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

  return [...createdPages, ...deletedPages, ...updatedPages];
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
