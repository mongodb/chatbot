import { currentTimestamp, safeFileName } from "./utils";

describe("currentTimestamp", () => {
  it("returns a timestamp in the format YYYY-MM-DD-HH-MM-SS", () => {
    expect(currentTimestamp()).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/,
    );
  });
});

describe("safeFileName", () => {
  it("replaces invalid characters with a dash", () => {
    expect(safeFileName("file?name")).toBe("file-name");
  });
  it("replaces multiple invalid characters with a dash", () => {
    expect(safeFileName("file?name*")).toBe("file-name-");
  });
});
