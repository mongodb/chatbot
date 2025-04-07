import { vi } from "vitest";
import {
  updateArrayElementAt,
  removeArrayElementAt,
  countRegexMatches,
  canUseServerSentEvents,
  addQueryParams,
  getCurrentPageUrl,
  renameFields,
  omit,
  nonProd,
} from "./utils";

const alice = { name: "alice", age: 25, createdAt: new Date("1999-01-01") };
const bob = { name: "bob", age: 42, createdAt: new Date("1982-05-11") };
const cathy = { name: "cathy", age: 30, createdAt: new Date("1994-04-22") };
const people = [alice, bob, cathy];

describe("updateArrayElementAt", () => {
  test("immutably updates a specific array element at a given index", () => {
    const peopleAfter = updateArrayElementAt(people, 1, {
      ...bob,
      age: 43,
    });
    expect(peopleAfter[1].age).toBe(43);
    expect(people[1].age).toBe(42);
    expect(bob.age).toBe(42);
  });
});

describe("removeArrayElementAt", () => {
  test("immutably removes a specific array element at a given index", () => {
    const peopleBefore = [
      ...people,
      { name: "dave", age: 35, createdAt: new Date("1986-02-14") },
    ];
    const peopleAfter = removeArrayElementAt(peopleBefore, 1);

    expect(people.length).toBe(3);
    expect(peopleBefore.length).toBe(4);
    expect(peopleAfter.length).toBe(3);
  });
});

describe("countRegexMatches", () => {
  test("counts all occurences of a regular expression in a given string", () => {
    const findMe = "<<find_me>>";
    const testString = `This is some ${findMe} text with ${findMe} multiple ${findMe} occurences of ${findMe} the test word.`;
    const count = countRegexMatches(new RegExp(findMe, "g"), testString);
    expect(count).toBe(4);
  });
});

describe("canUseServerSentEvents", () => {
  test("detects if the user's system includes SSE support", () => {
    const originalEventSource = window.EventSource;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.EventSource as any) = undefined;
      expect(canUseServerSentEvents()).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.EventSource as any) = vi.fn();
      expect(canUseServerSentEvents()).toBe(true);
    } finally {
      window.EventSource = originalEventSource;
    }
  });
});

describe("addQueryParams", () => {
  test("adds additional query params to a url while preserving any existing params.", () => {
    const baseUrl =
      "https://example.com/path/to/resource?existingParam=1&anotherParam=true";
    const newUrl = addQueryParams(baseUrl, { newParam: "value" });
    expect(newUrl).toBe(
      "https://example.com/path/to/resource?existingParam=1&anotherParam=true&newParam=value"
    );
  });
});

describe("getCurrentPageUrl", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("returns undefined on the server", () => {
    vi.stubGlobal("window", undefined);
    expect(getCurrentPageUrl()).toBeUndefined();
  });

  test("returns the current page URL in the browser", () => {
    vi.stubGlobal("location", {
      href: "https://example.com/path/to/resource",
    });
    expect(getCurrentPageUrl()?.href).toBe(
      "https://example.com/path/to/resource"
    );
  });
});

describe("renameFields", () => {
  test("returns the provided object but with some fields renamed", () => {
    const aliceAfter = renameFields(alice, { name: "username" });
    const bobAfter = renameFields(bob, {
      name: "username",
      createdAt: "createdOn",
    });

    expect(aliceAfter).toEqual({
      username: "alice",
      age: 25,
      createdAt: new Date("1999-01-01"),
    });

    expect(bobAfter).toEqual({
      username: "bob",
      age: 42,
      createdOn: new Date("1982-05-11"),
    });
  });
});

describe("omit", () => {
  test("allows you to omit one or more fields", () => {
    const aliceAfter = omit(alice, ["age"]);
    const bobAfter = omit(bob, ["name", "createdAt"]);

    expect(aliceAfter).toEqual({
      name: "alice",
      createdAt: new Date("1999-01-01"),
    });

    expect(bobAfter).toEqual({ age: 42 });
  });
});

describe("nonProd", () => {
  const originalProcessEnv = process.env.NODE_ENV;
  test("runs the provided callback in non-production environments", () => {
    const callback = vi.fn();

    try {
      process.env.NODE_ENV = "development";
      nonProd(callback);
      expect(callback).toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = originalProcessEnv;
    }
  });

  test("does not run the provided callback in production environments", () => {
    const callback = vi.fn();

    try {
      process.env.MODE = "production";
      nonProd(callback);
      expect(callback).not.toHaveBeenCalled();
    } finally {
      process.env.MODE = originalProcessEnv;
    }
  });
});
