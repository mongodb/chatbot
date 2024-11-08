import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "mongodb-rag-core/dataSources";

export const practicalAggregationsConfig: MakeMdOnGithubDataSourceParams = {
  name: "practical-aggregations-book",
  repoUrl: "https://github.com/pkdone/practical-mongodb-aggregations-book",
  repoLoaderOptions: {
    branch: "main",
    ignoreFiles: [/^(?!^\/src\/).*/, /^(\/src\/SUMMARY\.md)$/],
  },
  pathToPageUrl(pathInRepo) {
    return (
      "https://www.practical-mongodb-aggregations.com" +
      pathInRepo.replace(/^\/src\//, "/").replace(/\.md$/, "")
    );
  },
  metadata: {
    bookName: "Practical MongoDB Aggregations",
    tags: ["docs", "aggregations", "book"],
  },
};

export const practicalAggregationsDataSource = async () => {
  return await makeMdOnGithubDataSource(practicalAggregationsConfig);
};
