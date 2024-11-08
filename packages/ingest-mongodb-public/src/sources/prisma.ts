import { makeMdOnGithubDataSource } from "mongodb-rag-core/dataSources";

/**
  This is necessary for the Prisma source because the Prisma docs
  use a naming convention for their files that includes a number
  at the beginning of the file name segments. This number is not included
  in the URL for the page, so we need to remove it from the path.

  @example
  The docs source structure page names like:

  ```txt
  docs/content/300-guides/025-migrate/300-seed-database.mdx
  ```

  This function converts that to:

  ```txt
  docs/content/guides/migrate/seed-database.mdx
  ```
 */
function removeNumbersFromPath(path: string) {
  return path
    .split("/")
    .map((segment) => segment.replace(/^\d+-/, ""))
    .join("/");
}
export const prismaSourceConstructor = async () => {
  const repoUrl = "https://github.com/prisma/docs";
  const repoLoaderOptions = {
    branch: "main",
    recursive: true,
  };
  return await makeMdOnGithubDataSource({
    name: "prisma",
    repoUrl,
    repoLoaderOptions,
    filter: (path: string) => path.includes("mongodb") && path.endsWith(".mdx"),
    pathToPageUrl(path, frontMatter) {
      console.log("path:", path);
      const numberFreePath = removeNumbersFromPath(path);
      let url = numberFreePath
        .replace(/^\/content\//, "https://www.prisma.io/docs/")
        .replace(/\.mdx$/, "");
      if (frontMatter?.langSwitcher) {
        const langSwitcher = frontMatter.langSwitcher as string[];
        url += `-${langSwitcher[0]}`;
      }
      if (frontMatter?.dbSwitcher) {
        url += "-mongodb";
      }
      return url;
    },
    extractTitle(_pageContent, frontMatter) {
      // metaTitle is more descriptive
      if (typeof frontMatter?.metaTitle === "string") {
        return frontMatter.metaTitle;
      }
      // Fallback to title
      if (typeof frontMatter?.title === "string") {
        return frontMatter.title;
      }
    },
    extractMetadata(_pageContent, frontMatter) {
      if (typeof frontMatter?.metaDescription === "string") {
        return {
          description: frontMatter.metaDescription,
        };
      } else return {};
    },
  });
};
