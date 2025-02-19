import { assertEnvVars } from "mongodb-rag-core";
import { uploadDatasetToHuggingFace } from "./uploadDatasetToHuggingFace";
import { HUGGINGFACE } from "./EnvVars";

describe.skip("UploadDatasetToHuggingFaceParams", () => {
  jest.setTimeout(60000);
  it("should upload data to a HF repository", async () => {
    const { HUGGINGFACE_ACCESS_TOKEN } = assertEnvVars(HUGGINGFACE);
    await uploadDatasetToHuggingFace({
      huggingFace: {
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
