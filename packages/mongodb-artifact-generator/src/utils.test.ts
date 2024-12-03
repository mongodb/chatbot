import {
  groupBy,
  removeStartOfString,
  safeFileName,
  urlToFilename,
} from "./utils";

describe("safeFileName", () => {
  it("replaces invalid characters with a dash", () => {
    expect(safeFileName("file?name")).toBe("file-name");
  });
  it("replaces multiple invalid characters with a dash", () => {
    expect(safeFileName("file?name*")).toBe("file-name-");
  });
});

describe("groupBy", () => {
  it("groups items by key", () => {
    const items = [
      { name: "a", value: 1 },
      { name: "b", value: 2 },
      { name: "a", value: 3 },
    ];
    expect(groupBy(items, (item) => item.name)).toEqual({
      a: [
        { name: "a", value: 1 },
        { name: "a", value: 3 },
      ],
      b: [{ name: "b", value: 2 }],
    });
  });
});

describe("removeStartOfString", () => {
  it("removes provided input from the start of a string", () => {
    expect(removeStartOfString("hello, world", "hello, ")).toBe("world");
  });

  it("does not remove the start of the string if the the input is not present", () => {
    expect(removeStartOfString("hello, world", "goodbye, ")).toBe(
      "hello, world"
    );
  });
});

describe("urlToFilename", () => {
  it("converts a URL to a valid filename", () => {
    expect(urlToFilename("https://example.com/path/to/page")).toBe(
      "example_com_path_to_page"
    );
  });

  it("replaces non-alphanumeric characters with a custom separator", () => {
    expect(
      urlToFilename("https://example.com/path/to/page", { separator: "-" })
    ).toBe("example-com-path-to-page");
    expect(
      urlToFilename("https://example.com/path/to/page", { separator: "__" })
    ).toBe("example__com__path__to__page");
  });

  it("truncates the filename to a custom length", () => {
    expect(
      urlToFilename("https://example.com/path/to/page", {
        separator: "__",
        maxLength: 10,
      })
    ).toBe("example__c");
  });
});
