import {
  artifactSchema,
  getArtifactIdentifier,
  getCondensedArtifact,
  makeArtifactGroup,
  getCondensedArtifactGroup,
} from "./artifact";
import { z } from "zod";

function makeMockArtifact(id: string, mockField: string) {
  return artifactSchema(
    "mock-for-testing",
    z.object({ mockField: z.string() }),
  ).parse({ id, type: "mock-for-testing", data: { mockField } });
}

describe("getArtifactIdentifier", () => {
  it("returns an identifier for the artifact", () => {
    const mockArtifact = makeMockArtifact("1", "test value please ignore");
    expect(getArtifactIdentifier(mockArtifact)).toBe("mock-for-testing::1");
  });
});

describe("getCondensedArtifact", () => {
  it("returns a condensed artifact", () => {
    const mockArtifact = makeMockArtifact("1", "test value please ignore");
    expect(getCondensedArtifact(mockArtifact)).toEqual({
      id: "1",
      type: "mock-for-testing",
      summary: "No summary provided",
    });
    mockArtifact.summary = "test summary";
    expect(getCondensedArtifact(mockArtifact)).toEqual({
      id: "1",
      type: "mock-for-testing",
      summary: "test summary",
    });
  });
});

describe("makeArtifactGroup", () => {
  it("combines multiple artifacts into a single grouped artifact", () => {
    const mockArtifact_1 = makeMockArtifact("1", "dev value please ignore");
    const mockArtifact_2 = makeMockArtifact("2", "test value please ignore");
    const mockArtifact_3 = makeMockArtifact("3", "prod value please ignore");

    const artifactGroup = makeArtifactGroup({
      id: "1_2_3",
      artifacts: [mockArtifact_1, mockArtifact_2, mockArtifact_3],
    });
    expect(artifactGroup).toEqual({
      id: "1_2_3",
      type: "group",
      changes: [],
      data: { artifacts: [mockArtifact_1, mockArtifact_2, mockArtifact_3] },
    });
  });
});

describe("getCondensedArtifactGroup", () => {
  it("returns a condensed artifact group", () => {
    const mockArtifact_1 = makeMockArtifact("1", "dev value please ignore");
    const mockArtifact_2 = makeMockArtifact("2", "test value please ignore");
    const mockArtifact_3 = makeMockArtifact("3", "prod value please ignore");

    const artifactGroup = makeArtifactGroup({
      id: "1_2_3",
      artifacts: [mockArtifact_1, mockArtifact_2, mockArtifact_3],
    });

    expect(getCondensedArtifactGroup(artifactGroup)).toEqual({
      id: "1_2_3",
      type: "group",
      summary: "No summary provided",
      artifacts: [
        getCondensedArtifact(mockArtifact_1),
        getCondensedArtifact(mockArtifact_2),
        getCondensedArtifact(mockArtifact_3),
      ],
    });

    artifactGroup.summary = "test summary";

    expect(getCondensedArtifactGroup(artifactGroup)).toEqual({
      id: "1_2_3",
      type: "group",
      summary: "test summary",
      artifacts: [
        getCondensedArtifact(mockArtifact_1),
        getCondensedArtifact(mockArtifact_2),
        getCondensedArtifact(mockArtifact_3),
      ],
    });
  });
});
