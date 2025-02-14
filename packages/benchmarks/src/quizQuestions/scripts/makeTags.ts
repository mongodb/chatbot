import { mongoDbMetadata } from "chatbot-server-mongodb-public";
import { QuizQuestionData } from "../QuizQuestionData";

const { mongoDbProductNames, mongoDbTopics, mongoDbProgrammingLanguages } =
  mongoDbMetadata;

const programmingLanguageTags = [
  ...mongoDbProgrammingLanguages
    .map((pl) => pl.id)
    .filter((pl) => pl !== "c" && pl !== "go"),
  "c#",
  "c++",
  "node.js",
];
const topicTags = mongoDbTopics.map((t) => t.id);

const productNames = mongoDbProductNames.map((pn) => pn.toLocaleLowerCase());

export function makeTags(qq: QuizQuestionData) {
  const tags: string[] = qq.tags ?? [];
  for (const pl of programmingLanguageTags) {
    if (
      qq.title?.toLowerCase().includes(pl) ||
      qq.contentTitle?.toLowerCase().includes(pl)
    ) {
      if (pl === "c#") {
        tags.push("csharp");
      } else if (pl === "c++") {
        tags.push("cpp");
      } else if (pl === "node.js") {
        tags.push("javascript");
      } else {
        tags.push(pl);
      }
    }
  }
  if (
    qq.questionText.toLowerCase().includes("C Driver") ||
    qq.title?.toLowerCase().includes("C Driver") ||
    qq.contentTitle?.toLowerCase().includes("C Driver")
  ) {
    tags.push("c");
  }
  if (
    qq.questionText.toLowerCase().includes("Go Driver") ||
    qq.title?.toLowerCase().includes("Go Driver") ||
    qq.contentTitle?.toLowerCase().includes("Go Driver")
  ) {
    tags.push("go");
  }
  for (const t of topicTags) {
    if (
      qq.questionText.toLowerCase().includes(t) ||
      qq.title?.toLowerCase().includes(t) ||
      qq.contentTitle?.toLowerCase().includes(t)
    ) {
      tags.push(t);
    }
  }
  for (const pn of productNames) {
    if (
      qq.questionText.toLowerCase().includes(pn) ||
      qq.title?.toLowerCase().includes(pn) ||
      qq.contentTitle?.toLowerCase().includes(pn)
    ) {
      tags.push(pn);
    }
  }
  if (
    qq.title?.toLowerCase().includes("modeling") ||
    qq.title?.toLowerCase().includes("schema") ||
    qq.contentTitle?.toLowerCase().includes("schema design")
  ) {
    tags.push("data_modeling");
  }
  return Array.from(
    new Set(tags.map((t) => t.toLowerCase().split(" ").join("_")))
  );
}
