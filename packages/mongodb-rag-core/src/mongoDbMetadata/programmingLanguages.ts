import { z } from "zod";

export const mongoDbProgrammingLanguages = [
  {
    id: "objective-c",
    name: "Objective-C",
  },
  {
    id: "c",
    name: "C",
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
    id: "dart",
    name: "Dart",
  },
  {
    id: "go",
    name: "Go",
  },
  {
    id: "graphql",
    name: "GraphQL",
  },
  {
    id: "java",
    name: "Java",
  },
  {
    id: "javascript",
    name: "JavaScript",
  },
  {
    id: "json",
    name: "JSON",
  },
  {
    id: "kotlin",
    name: "Kotlin",
  },
  {
    id: "typescript",
    name: "TypeScript",
  },
  {
    id: "perl",
    name: "Perl",
  },
  {
    id: "php",
    name: "PHP",
  },
  {
    id: "python",
    name: "Python",
  },
  {
    id: "ruby",
    name: "Ruby",
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
    id: "shell",
    name: "Shell",
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
  name: z.string().describe("Human-friendly name of the topic"),
  description: z.string().optional().describe("Brief description of the topic"),
});
export type MongoDbProgrammingLanguage = z.infer<
  typeof MongoDBProgrammingLanguageSchema
>;
