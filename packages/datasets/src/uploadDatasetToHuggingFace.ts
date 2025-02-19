import { uploadFiles } from "@huggingface/hub";
import { logger } from "mongodb-rag-core";

export interface UploadDatasetToHuggingFaceParams {
  huggingFace: {
    /**
      Must be a dataset repository.

      @example "myname/some-dataset"
     */
    repoName: string;
    accessToken: string;
  };
  data: Parameters<typeof uploadFiles>[0]["files"];
  commit?: {
    title: string;
    description?: string;
  };
}

/**
 Uploads data to a HuggingFace repository.
 */
export async function uploadDatasetToHuggingFace(
  params: UploadDatasetToHuggingFaceParams
) {
  const { huggingFace, data, commit } = params;
  const commitOutput = await uploadFiles({
    files: data,
    repo: {
      type: "dataset",
      name: huggingFace.repoName,
    },
    accessToken: huggingFace.accessToken,
    commitTitle: commit?.title,
    commitDescription: commit?.description,
  });
  logger.info("Uploaded dataset to Hugging Face");
  logger.info(commitOutput);
  return commitOutput;
}
