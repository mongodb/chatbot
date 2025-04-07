// src/eval/scorers/fuzzyLinkMatch.test.ts

import { fuzzyLinkMatch } from "./fuzzyLinkMatch";

describe("fuzzyLinkMatch", () => {
  test("exact path match between different domains", () => {
    const expected = "https://example.com/path/to/resource";
    const actual = "https://anotherdomain.com/path/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(true);
  });

  test("case-insensitive path match", () => {
    const expected = "https://example.com/Path/To/Resource";
    const actual = "https://anotherdomain.com/path/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(true);
  });

  test("partial match of expected path within actual path", () => {
    const expected = "/path";
    const actual = "https://anotherdomain.com/path/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });

  test("no match when expected path is part of a different segment", () => {
    const expected = "/path";
    const actual = "https://example.com/otherpath/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });

  test("ignores query parameters and fragments in actual URL", () => {
    const expected = "https://example.com/path/to/resource";
    const actual =
      "https://anotherdomain.com/path/to/resource?query=123#section";
    expect(fuzzyLinkMatch(expected, actual)).toBe(true);
  });

  test("no match between unrelated plain strings", () => {
    const expected = "unrelated";
    const actual = "notMatching";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });

  test("expected path is empty string", () => {
    const expected = "";
    const actual = "/path/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });

  test("expected path does not exist in actual path", () => {
    const expected = "/nonexistent";
    const actual = "https://anotherdomain.com/path/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });

  test("expected path doesn't end in '/' but actual path does", () => {
    const expected = "/path";
    const actual = "https://anotherdomain.com/path/";
    expect(fuzzyLinkMatch(expected, actual)).toBe(true);
  });

  test("expected url has no path, but actual does", () => {
    const expected = "https://example.com";
    const actual = "https://example.com/path/to/resource";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });

  test("expected url has path, but actual does not", () => {
    const expected = "https://example.com/path/to/resource";
    const actual = "https://example.com";
    expect(fuzzyLinkMatch(expected, actual)).toBe(false);
  });
});
