import fs from "fs";
import Path from "path";
import {
  convertVideoTranscriptFromSrtToTxt,
  generateContentDescriptionMarkdown,
  makeUniversityPages,
  UNI_BASE_URL,
} from "./makeUniversityPages";
import {
  TiCatalogItem,
  UniversityVideo,
} from "./MongoDbUniversityDataApiClient";

const SRC_ROOT = Path.resolve(__dirname, "../..");

describe("makeUniversityPages()", () => {
  const videos = JSON.parse(
    fs.readFileSync(
      Path.resolve(SRC_ROOT, "../testData/sampleUniversityVideos.json"),
      "utf-8"
    )
  ) as UniversityVideo[];
  const tiCatalogItems = JSON.parse(
    fs.readFileSync(
      Path.resolve(SRC_ROOT, "../testData/sampleUniversityCatalog.json"),
      "utf-8"
    )
  ) as TiCatalogItem[];

  it("should return an array of pages for each lesson", () => {
    const pages = makeUniversityPages({
      sourceName: "test",
      tiCatalogItems,
      videos,
    });
    expect(pages).toHaveLength(3);
    expect(pages[0].title).toEqual(
      "Getting Started with MongoDB Atlas - Lesson 1: Introduction to MongoDB Atlas, the Developer Data Platform - Learn"
    );
  });
  it("should add metadata to each page", () => {
    const pages = makeUniversityPages({
      sourceName: "test",
      tiCatalogItems,
      videos,
      metadata: {
        foo: "bar",
        tags: ["foo", "bar"],
      },
    });
    const samplePage = pages[0];
    expect(samplePage.url).toBe(
      `${UNI_BASE_URL}/learn/course/getting-started-with-mongodb-atlas/lesson-1-introduction-to-mongodb-atlas-the-developer-data-platform/learn`
    );
    expect(samplePage.title).toBe(
      "Getting Started with MongoDB Atlas - Lesson 1: Introduction to MongoDB Atlas, the Developer Data Platform - Learn"
    );
    expect(samplePage.format).toBe("txt");
    expect(samplePage.sourceName).toBe("test");
    // Expect the body to not contain any SRT timestamps
    expect(samplePage.body).not.toMatch(
      /^\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/gm
    );
    expect(samplePage.metadata).toHaveProperty("foo", "bar");
    expect(samplePage.metadata).toHaveProperty(
      "tags",
      expect.arrayContaining(["foo", "bar"])
    );
    expect(samplePage.metadata).toHaveProperty(
      "courseTitle",
      "Getting Started with MongoDB Atlas"
    );
    expect(samplePage.metadata).toHaveProperty(
      "sectionTitle",
      "Lesson 1: Introduction to MongoDB Atlas, the Developer Data Platform"
    );
    expect(samplePage.metadata).toHaveProperty("lessonTitle", "Learn");
    // Don't include these tags that are returned by the API
    const tagsSet = new Set(samplePage.metadata?.tags);
    expect(tagsSet.has("Intro to MongoDB")).toBe(false);
    expect(tagsSet.has("University")).toBe(false);
  });
});

describe("convertVideoTranscriptFromSrtToTxt()", () => {
  it("should convert an SRT transcript to plain text", () => {
    const srtTranscript = fs.readFileSync(
      Path.resolve(SRC_ROOT, "../testData/sampleUniversityVideoTranscript.srt"),
      "utf-8"
    );
    const txtTranscript = fs.readFileSync(
      Path.resolve(SRC_ROOT, "../testData/sampleUniversityVideoTranscript.txt"),
      "utf-8"
    );
    const convertedTranscript =
      convertVideoTranscriptFromSrtToTxt(srtTranscript);
    expect(convertedTranscript).toEqual(txtTranscript);
  });
});

describe("generateContentDescriptionMarkdown()", () => {
  const expected_markdown = `# Atlas Search

This course is designed to help you use Atlas Search in your applications for a seamless full-text search experience. You’ll learn how to write Atlas Search queries and manage search indexes by using the Atlas UI, CLI, and MongoDB Shell. Then you’ll build on this foundation by writing advanced search queries that use the compound operator, nesting, and features such as fuzzy search and autocomplete. 

## Managing Atlas Search Indexes

45 Minutes

Learn how to manage Atlas Search indexes with the Atlas UI, Atlas CLI, and MongoDB Shell.

[View Details](https://learn.mongodb.com/courses/managing-atlas-search-indexes)

## Autocomplete with Atlas Search

1.5 Hours

Learn how to enhance user experience by adding the autocomplete functionality to Atlas Search indexes. As one of the most common features of a search platform, autocomplete is easy to include in any application using Atlas Search.  

[View Details](https://learn.mongodb.com/courses/autocomplete-with-atlas-search)

## Introduction to Atlas Search

2.25 Hours

Learn how to use Atlas Search to build search functionality for your application. You'll learn how to define a search index, create a search query, and view search metadata. 

[View Details](https://learn.mongodb.com/courses/introduction-to-atlas-search)

## Analyzers in Atlas Search

1.75 Hours

Learn all about analyzers in Atlas Search and the crucial role they play in making search results relevant and accurate.  

[View Details](https://learn.mongodb.com/courses/analyzers-in-atlas-search)

## Advanced Queries with Atlas Search

3 Hours

Learn how to write Atlas Search queries using features such as the compound operator, sorting customization, and fuzzy search. 

[View Details](https://learn.mongodb.com/courses/advanced-queries-with-atlas-search)`;

  it("should generate Markdown content for a Learning Path or Course", () => {
    const tiCatalogItem = JSON.parse(
      fs.readFileSync(
        Path.resolve(
          SRC_ROOT,
          "../testData/sampleUniversityCatalogItemCourse.json"
        ),
        "utf-8"
      )
    ) as TiCatalogItem;
    const markdown = generateContentDescriptionMarkdown({ tiCatalogItem });
    expect(markdown).toEqual(expected_markdown);
  });
});
