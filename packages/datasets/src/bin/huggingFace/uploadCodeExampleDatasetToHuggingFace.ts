import {
  assertEnvVars,
  CORE_CHATBOT_APP_ENV_VARS,
  logger,
  makeMongoDbPageStore,
} from "mongodb-rag-core";
import { loadPagesDataset } from "../../pageDataset/loadPageDataset";
import { forbiddenUrls } from "../../mongoDbDatasetConstants";
import { uploadDatasetToHuggingFace } from "../../uploadDatasetToHuggingFace";
import { HUGGINGFACE } from "../../EnvVars";
import path from "path";
import { extractAndAnnotateCodeBlocks } from "../../codeExampleDataset/extractAndAnnotateCodeBlocks";
import { model, openAiClient } from "../../openAi";

async function uploadCodeExampleDatasetToHuggingFace() {
  logger.info("Staring upload code example dataset to Hugging Face script");

  const {
    HUGGINGFACE_ACCESS_TOKEN,
    HUGGINGFACE_DOCS_CODE_EXAMPLE_REPO,
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
  } = assertEnvVars({ ...HUGGINGFACE, ...CORE_CHATBOT_APP_ENV_VARS });

  const pageStore = makeMongoDbPageStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });

  // TODO: figure out logic to get since last upload

  try {
    logger.info("Loading pages dataset from MongoDB");
    const pages = await loadPagesDataset(
      pageStore,
      // TODO: add back
      //   publicDatasetSourceName,
      /snooty-node/,
      Array.from(forbiddenUrls)
      // TODO: get since last upload
    );
    logger.info(`Loaded pages from MongoDB. Loaded ${pages.length} pages.`);

    const dataset = await extractAndAnnotateCodeBlocks(
      pages,
      openAiClient,
      model,
      5
    );

    logger.info(
      `Extracted and annotated code blocks. Dataset has ${dataset.length} entries`
    );

    const currentDate = new Date().toISOString();
    // Date formatted as yyyy-mm-dd
    const yyyyMmDd = currentDate.split("T")[0];

    const fileBaseName = "public-code-examples";

    logger.info(
      `Uploading dataset to Hugging Face repo '${HUGGINGFACE_DOCS_CODE_EXAMPLE_REPO}'`
    );

    const res = await uploadDatasetToHuggingFace({
      hf: {
        repoName: HUGGINGFACE_DOCS_CODE_EXAMPLE_REPO,
        accessToken: HUGGINGFACE_ACCESS_TOKEN,
      },
      commit: {
        title: `Dataset upload ${yyyyMmDd}`,
        description: `Public MongoDB code example dataset upload ${currentDate}`,
      },
      data: [
        {
          path: path.format({
            name: fileBaseName,
            ext: ".json",
          }),
          content: new Blob([JSON.stringify(dataset)]),
        },
      ],
    });
    logger.info(
      `Uploaded dataset to Hugging Face repo '${HUGGINGFACE_DOCS_CODE_EXAMPLE_REPO}'`
    );
    logger.info(res);
  } finally {
    await pageStore.close();
    logger.info("Closed MongoDB connection");
  }
}
uploadCodeExampleDatasetToHuggingFace();
