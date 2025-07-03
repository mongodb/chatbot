import {
  makeAcquitRequireMdOnGithubDataSource,
  normalizeUrl,
} from "mongodb-rag-core/dataSources";
import { SourceTypeName } from ".";

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
  return await makeAcquitRequireMdOnGithubDataSource<SourceTypeName>({
    repoUrl,
    repoLoaderOptions,
    name: "mongoose",
    pathToPageUrl(path) {
      return normalizeUrl(
        path
          .replace(/^\/docs\//, "https://mongoosejs.com/docs/")
          .replace(/\.md$/, ".html")
      );
    },
    testFileLoaderOptions,
    acquitCodeBlockLanguageReplacement: "javascript",
    sourceType: "tech-docs-external",
    metadata: {
      productName: "Mongoose ODM",
      tags: ["node.js", "community library", "mongoose", "odm"],
      versionLabel: "v7.x (current)",
    },
  });
};
