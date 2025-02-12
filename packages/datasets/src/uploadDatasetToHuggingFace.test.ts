import { assertEnvVars } from "mongodb-rag-core";
import { uploadDatasetToHuggingFace } from "./uploadDatasetToHuggingFace";
import { HUGGINGFACE } from "./EnvVars";

const { HUGGINGFACE_ACCESS_TOKEN } = assertEnvVars(HUGGINGFACE);

describe.skip("UploadDatasetToHuggingFaceParams", () => {
  jest.setTimeout(60000);
  it("should upload data to a HF repository", async () => {
    await uploadDatasetToHuggingFace({
      hf: {
        repoName: "bpmutter/test_integration",
        accessToken: HUGGINGFACE_ACCESS_TOKEN,
      },
      commit: {
        title: "Add dataset",
        description: "My dataset...",
      },
      data: [
        {
          path: "data.json",
          content: new Blob([JSON.stringify({ foo: "bar" })]),
        },
      ],
    });
  });
});
