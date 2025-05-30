import {
  MakeMdOnGithubDataSourceParams,
  makeMdOnGithubDataSource,
} from "mongodb-rag-core/dataSources";
import { SourceTypeName } from ".";

export const practicalAggregationsConfig: MakeMdOnGithubDataSourceParams<SourceTypeName> =
  {
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
    sourceType: "book-external",
    metadata: {
      bookName: "Practical MongoDB Aggregations",
      tags: ["docs", "aggregations", "book"],
    },
  };

export const practicalAggregationsDataSource = async () => {
  return await makeMdOnGithubDataSource<SourceTypeName>(
    practicalAggregationsConfig
  );
};
