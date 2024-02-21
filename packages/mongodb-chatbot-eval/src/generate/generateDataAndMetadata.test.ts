import { mockGenerateDataFunc } from "../test/mockGenerateDataFunc";
import { makeMockCommandMetadataStore } from "../test/mockMetadataStore";
import { makeMockGeneratedDataStore } from "../test/mockGeneratedDataStore";
import {
  GenerateDataAndMetadataParams,
  generateDataAndMetadata,
} from "./generateDataAndMetadata";
import { testCases, triggerErrorTestCases } from "../test/mockTestCases";
import { logger } from "mongodb-rag-core";

describe("generateDataAndMetadata", () => {
  const generatedDataStore = makeMockGeneratedDataStore();
  const metadataStore = makeMockCommandMetadataStore();
  const baseParams: GenerateDataAndMetadataParams = {
    generatedDataStore,
    metadataStore,
    generator: mockGenerateDataFunc,
    name: "test",
    testCases,
  };
  test("successfully generates data for all test cases", async () => {
    const { failedCases, generatedData } = await generateDataAndMetadata(
      baseParams
    );
    expect(failedCases).toHaveLength(0);
    expect(generatedData).toHaveLength(testCases.length);
    for (const data of generatedData) {
      expect(generatedDataStore.findById(data._id)).resolves.toMatchObject(
        data
      );
    }
  });
  test("handles failed data generation for some test cases", async () => {
    const { failedCases, generatedData } = await generateDataAndMetadata({
      ...baseParams,
      testCases: [...testCases, ...triggerErrorTestCases],
    });
    expect(failedCases).toHaveLength(triggerErrorTestCases.length);
    expect(generatedData).toHaveLength(testCases.length);
  });
  test("verifies metadata storage with correct details", async () => {
    const { metadata } = await generateDataAndMetadata(baseParams);
    expect(metadataStore.findById(metadata._id)).resolves.toMatchObject(
      metadata
    );
  });
  test("logs correct information during the generation process", async () => {
    const infoSpy = jest.spyOn(logger, "info").mockImplementation(jest.fn());
    const errorSpy = jest.spyOn(logger, "error").mockImplementation(jest.fn());
    await generateDataAndMetadata(baseParams);
    expect(infoSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
