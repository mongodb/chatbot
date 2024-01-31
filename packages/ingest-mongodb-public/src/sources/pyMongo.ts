import { makeRstOnGitHubDataSource } from "mongodb-rag-ingest/sources";

export const pyMongoSourceConstructor = async () => {
  return makeRstOnGitHubDataSource({
    name: "pymongo",
    repoUrl: "https://github.com/mongodb/mongo-python-driver",
    repoLoaderOptions: {
      branch: "master",
      ignoreFiles: [/^(?!\/doc\/).*/], // Everything BUT doc/
    },
    pathToPageUrl(path) {
      return path
        .replace(/^\/doc\//, "https://pymongo.readthedocs.io/en/stable/")
        .replace(/\.rst$/, ".html");
    },
    getMetadata({ title }) {
      return {
        tags: ["docs", "python"],
        productName: "PyMongo",
        version: "4.5.0 (current)",
        pageTitle: title,
      };
    },
  });
};
