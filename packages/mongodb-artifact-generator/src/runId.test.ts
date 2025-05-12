import { createRunId } from "./runId";
import { writeFileSync } from "fs";

function mockStaticDate(input: ConstructorParameters<typeof Date>[0]) {
  const date = new Date(input);
  jest.spyOn(global, "Date").mockImplementation(() => date);
}

describe("createRunId", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("creates a runId based on the current date", () => {
    mockStaticDate("2024-08-21T20:20:01.188Z");
    expect(new Date().getTime()).toBe(1724271601188);
    expect(createRunId()).toBe("20240821-2020-4asie");
  });

  it("does nothing to ensure that namespace is a valid filename", () => {
    mockStaticDate("2024-08-21T20:20:01.188Z");
    const ns = `--_._((my-nam/es \\ pace-`;
    const runId = createRunId(ns);
    expect(runId).toBe("--_._((my-nam/es \\ pace--20240821-2020-4asie");
    expect(() =>
      writeFileSync(
        `./${runId}.test.json`,
        "this should error because of an invalid file name"
      )
    ).toThrow(`ENOENT: no such file or directory, open './${runId}.test.json'`);
  });

  it("allows you to prepend a namespace prefix", () => {
    mockStaticDate("2024-08-21T20:20:01.188Z");
    const ns = "my-namespace";
    const runIdWithoutNs = createRunId();
    const runIdWithNs = createRunId(ns);
    expect(runIdWithoutNs).toBe("20240821-2020-4asie");
    expect(runIdWithNs).toBe("my-namespace-20240821-2020-4asie");
  });

  it("creates runIds that sort by the time they were created", () => {
    mockStaticDate("2024-08-21T20:20:01.188Z");
    const runId1 = createRunId();
    jest.restoreAllMocks();
    mockStaticDate("2024-08-21T20:20:17.223Z");
    const runId2 = createRunId();
    jest.restoreAllMocks();
    mockStaticDate("2024-08-21T20:21:01.011Z");
    const runId3 = createRunId();
    jest.restoreAllMocks();
    mockStaticDate("2024-09-01T01:00:00.003Z");
    const runId4 = createRunId();

    expect(runId1).toBe("20240821-2020-4asie");
    expect(runId2).toBe("20240821-2020-4asur");
    expect(runId3).toBe("20240821-2021-4atsk");
    expect(runId4).toBe("20240901-0100-iv734");
    expect(runId1 < runId2).toBe(true);
    expect(runId2 < runId3).toBe(true);
    expect(runId3 < runId4).toBe(true);
    expect(runId1.localeCompare(runId2)).toBe(-1);
    expect(runId2.localeCompare(runId3)).toBe(-1);
    expect(runId3.localeCompare(runId4)).toBe(-1);
  });
});
