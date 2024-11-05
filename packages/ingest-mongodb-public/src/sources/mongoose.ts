import { makeAcquitRequireMdOnGithubDataSource } from "mongodb-rag-core/dataSources";

export const mongooseSourceConstructor = async () => {
  const repoUrl = "https://github.com/Automattic/mongoose";
  const testFileLoaderOptions = {
    branch: "master",
    recursive: true,
    ignoreFiles: [/^(?!^\/test\/).+$/],
  };
  const repoLoaderOptions = {
    branch: "master",
    recursive: true,
    ignoreFiles: [/^(?!^\/docs\/).+$/],
  };
  return await makeAcquitRequireMdOnGithubDataSource({
    repoUrl,
    repoLoaderOptions,
    name: "mongoose",
    pathToPageUrl(path) {
      return path
        .replace(/^\/docs\//, "https://mongoosejs.com/docs/")
        .replace(/\.md$/, ".html");
    },
    testFileLoaderOptions,
    acquitCodeBlockLanguageReplacement: "javascript",
    metadata: {
      productName: "Mongoose ODM",
      tags: ["node.js", "community library", "mongoose", "odm"],
      version: "v7.x (current)",
    },
  });
};
