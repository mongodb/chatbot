import { makeCodeOnGithubTextDataSource } from "mongodb-rag-core/dataSources";

export const nodeJsQuickstart = async () => {
  return await makeCodeOnGithubTextDataSource({
    name: "mongodb-developer-nodejs-quickstart",
    repoUrl: "https://github.com/mongodb-developer/nodejs-quickstart",
    repoLoaderOptions: {
      branch: "master",
    },
    metadata: {
      productName: "MongoDB Developer Code Examples",
      tags: ["code-example", "runnable"],
    },
  });
};

export const javaQuickstart = async () => {
  return await makeCodeOnGithubTextDataSource({
    name: "mongodb-developer-java-quick-start",
    repoUrl: "https://github.com/mongodb-developer/java-quick-start",
    repoLoaderOptions: {
      branch: "main",
      ignoreFiles: [/pom\.xml/],
    },
    metadata: {
      productName: "MongoDB Developer Code Examples",
      tags: ["code-example", "runnable"],
    },
  });
};

export const netlifyMongodbNextjsAiChatbot = async () => {
  return await makeCodeOnGithubTextDataSource({
    name: "mongodb-developer-netlify-mongodb-nextjs-ai-chatbot",
    repoUrl:
      "https://github.com/mongodb-developer/netlify-mongodb-nextjs-ai-chatbot",
    repoLoaderOptions: {
      branch: "main",
    },
    metadata: {
      productName: "MongoDB Developer Code Examples",
      tags: ["code-example", "runnable"],
    },
  });
};

export const leafsteroids = async () => {
  return await makeCodeOnGithubTextDataSource({
    name: "mongodb-developer-leafsteroids",
    repoUrl: "https://github.com/mongodb-developer/leafsteroids",
    repoLoaderOptions: {
      branch: "main",
    },
    metadata: {
      productName: "MongoDB Developer Code Examples",
      tags: ["code-example", "runnable", "game"],
    },
  });
};

export const mongodbWithFastapi = async () => {
  return await makeCodeOnGithubTextDataSource({
    name: "mongodb-developer-mongodb-with-fastapi",
    repoUrl: "https://github.com/mongodb-developer/mongodb-with-fastapi",
    repoLoaderOptions: {
      branch: "master",
      ignoreFiles: [/Justfile/],
    },
    metadata: {
      productName: "MongoDB Developer Code Examples",
      tags: ["code-example", "runnable"],
    },
  });
};

export const mongoRx = async () => {
  return await makeCodeOnGithubTextDataSource({
    name: "mongodb-developer-mongorx",
    repoUrl: "https://github.com/mongodb-developer/mongorx",
    repoLoaderOptions: {
      branch: "main",
      ignoreFiles: [/\.browserslistrc/],
    },
    metadata: {
      productName: "MongoDB Developer Code Examples",
      tags: ["code-example", "runnable"],
    },
  });
};
