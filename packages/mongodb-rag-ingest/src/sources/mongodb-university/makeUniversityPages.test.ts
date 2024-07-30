import fs from "fs";
import Path from "path";
import {
  convertVideoTranscriptFromSrtToTxt,
  makeUniversityPages,
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
      "https://learn.mongodb.com/learn/course/getting-started-with-mongodb-atlas/lesson-1-introduction-to-mongodb-atlas-the-developer-data-platform/learn"
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
    expect(samplePage.metadata).toEqual({
      foo: "bar",
      tags: ["foo", "bar"],
      courseTitle: "Getting Started with MongoDB Atlas",
      sectionTitle:
        "Lesson 1: Introduction to MongoDB Atlas, the Developer Data Platform",
      lessonTitle: "Learn",
    });
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
