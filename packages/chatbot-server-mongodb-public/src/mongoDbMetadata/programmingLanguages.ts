import { z } from "zod";

export const mongoDbProgrammingLanguages = [
  {
    id: "shell",
  },
  {
    id: "javascript",
    name: "JavaScript",
  },
  {
    id: "typescript",
    name: "TypeScript",
  },
  {
    id: "python",
    name: "Python",
  },
  {
    id: "java",
    name: "Java",
  },
  {
    id: "csharp",
    name: "C#",
  },
  {
    id: "cpp",
    name: "C++",
  },
  {
    id: "ruby",
    name: "Ruby",
  },
  {
    id: "kotlin",
    name: "Kotlin",
  },
  {
    id: "c",
    name: "C",
  },
  {
    id: "dart",
    name: "Dart",
  },
  {
    id: "go",
    name: "Go",
  },
  {
    id: "php",
    name: "PHP",
  },
  {
    id: "rust",
    name: "Rust",
  },
  {
    id: "scala",
    name: "Scala",
  },
  {
    id: "swift",
    name: "Swift",
  },
] as const satisfies MongoDbProgrammingLanguage[];

export type MongoDbProgrammingLanguageId =
  (typeof mongoDbProgrammingLanguages)[number]["id"];
export type MongoDbProgrammingLanguageIdEnum = [
  MongoDbProgrammingLanguageId,
  ...MongoDbProgrammingLanguageId[]
];
export const mongoDbProgrammingLanguageIds = mongoDbProgrammingLanguages.map(
  (language) => language.id
) as MongoDbProgrammingLanguageIdEnum;

export const MongoDBProgrammingLanguageSchema = z.object({
  id: z.string().describe("Unique identifier for the topic"),
  name: z.string().optional().describe("Human-friendly name of the topic"),
  description: z.string().optional().describe("Brief description of the topic"),
});
export type MongoDbProgrammingLanguage = z.infer<
  typeof MongoDBProgrammingLanguageSchema
>;
