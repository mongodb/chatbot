import { fuzzyLinkMatch } from "./scorers/fuzzyLinkMatch";

describe("fuzzyLinkMatch", () => {
  test("matches exact paths", () => {
    expect(fuzzyLinkMatch("/path/to/resource", "/path/to/resource")).toBe(true);
  });

  test("matches partial path within another path", () => {
    expect(fuzzyLinkMatch("/path", "/path/to/resource")).toBe(true);
  });

  test("is case-insensitive for paths", () => {
    expect(fuzzyLinkMatch("/PATH/TO/RESOURCE", "/path/to/resource")).toBe(true);
  });

  test("ignores query parameters", () => {
    expect(
      fuzzyLinkMatch("/path/to/resource", "/path/to/resource?query=123")
    ).toBe(true);
  });

  test("ignores fragments in URLs", () => {
    expect(
      fuzzyLinkMatch("/path/to/resource", "/path/to/resource#section")
    ).toBe(true);
  });

  test("matches path even if domain is different", () => {
    expect(
      fuzzyLinkMatch(
        "/path/to/resource",
        "https://example.com/path/to/resource"
      )
    ).toBe(true);
  });

  test("treats non-URL strings as plain strings", () => {
    expect(
      fuzzyLinkMatch("non-url-string", "this is a non-url-string example")
    ).toBe(true);
  });

  test("handles non-URL strings in both arguments", () => {
    expect(fuzzyLinkMatch("example", "this is an example string")).toBe(true);
  });

  test("returns false if expected path is not found in actual path", () => {
    expect(fuzzyLinkMatch("/notfound", "/path/to/resource")).toBe(false);
  });

  test("returns false for non-matching plain strings", () => {
    expect(fuzzyLinkMatch("missing", "this string does not contain it")).toBe(
      false
    );
  });

  test("returns false if expected is partially matched within a larger word", () => {
    expect(fuzzyLinkMatch("/path", "/anotherpath/to/resource")).toBe(false);
  });
});
