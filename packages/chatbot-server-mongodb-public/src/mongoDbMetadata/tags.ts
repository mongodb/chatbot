import { mongoDbProducts, mongodbDrivers } from "./products";
import { mongoDbProgrammingLanguageIds } from "./programmingLanguages";
import { mongoDbTopics } from "./topics";

// Helpers for constructing the `MongoDbTag` union type
const mongoDbProductIds = mongoDbProducts.map((product) => product.id);
const mongoDbDriverIds = mongodbDrivers.map((driver) => driver.id);
const mongoDbTopicIds = mongoDbTopics.map((topic) => topic.id);

/**
  All possible MongoDB tags. Useful for tagging evaluations.
  */
export const MongoDbTag = {
  // Add all programming language IDs
  ...mongoDbProgrammingLanguageIds.reduce((acc, id) => {
    acc[id] = id;
    return acc;
  }, {} as Record<string, string>),

  // Add all product IDs
  ...mongoDbProductIds.reduce((acc, id) => {
    acc[id] = id;
    return acc;
  }, {} as Record<string, string>),

  // Add all driver IDs
  ...mongoDbDriverIds.reduce((acc, id) => {
    acc[id] = id;
    return acc;
  }, {} as Record<string, string>),

  // Add all topic IDs
  ...mongoDbTopicIds.reduce((acc, id) => {
    acc[id] = id;
    return acc;
  }, {} as Record<string, string>),
} as const;

// Define the type based on the const object
export type MongoDbTag = keyof typeof MongoDbTag;
