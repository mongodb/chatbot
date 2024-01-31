import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "mongodb-rag-ingest/sources";

export function mongoDbCppDriverPathToPageUrlConverter(pathInRepo: string) {
  if (pathInRepo.endsWith("_index.md")) {
    pathInRepo = pathInRepo.replace("_index.md", "index.md");
  }
  return pathInRepo
    .replace(
      /^\/docs\/content\/mongocxx-v3/,
      "https://mongocxx.org/mongocxx-v3"
    )
    .replace(/\.md$/, "/");
}

export const mongoDbCppDriverConfig: MakeMdOnGithubDataSourceParams = {
  name: "cxx-driver",
  repoUrl: "https://github.com/mongodb/mongo-cxx-driver/",
  repoLoaderOptions: {
    branch: "master",
    ignoreFiles: [/^(?!^\/docs\/content\/mongocxx-v3\/).*/],
  },
  pathToPageUrl: mongoDbCppDriverPathToPageUrlConverter,
  metadata: {
    productName: "C++ Driver (mongocxx)",
    tags: ["docs", "driver", "c++", "cpp", "cxx", "mongocxx"],
    version: "v3.x (current)",
  },
  frontMatter: {
    process: true,
    separator: "+++",
    format: "toml",
  },
  extractTitle: (_, frontmatter) => frontmatter?.title as string,
};

export const cppSourceConstructor = async () => {
  return await makeMdOnGithubDataSource(mongoDbCppDriverConfig);
};
