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
export type MongoDbTag =
  | (typeof mongoDbProgrammingLanguageIds)[number]
  | (typeof mongoDbProductIds)[number]
  | (typeof mongoDbDriverIds)[number]
  | (typeof mongoDbTopicIds)[number];
