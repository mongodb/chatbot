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

// Combine all tag arrays into a single array
const allTags = [
  ...mongoDbProgrammingLanguageIds,
  ...mongoDbProductIds,
  ...mongoDbDriverIds,
  ...mongoDbTopicIds,
];

/**
 Validates an array of tag names against the MongoDbTags enum.
 
 @param tagNames - An array of strings representing tag names to validate
 @param custom - A boolean flag indicating whether custom tags are allowed
 @throws {Error} When non-custom tags are used that don't exist in MongoDbTags enum
 
 @remarks
 If custom is false, all tags must exist in the MongoDbTags enum.
 If any invalid tags are found, throws an error with the list of invalid tags
 and the allowed tags from MongoDbTags enum.
 */
export const validateTags = (tagNames: string[], custom: boolean): void => {
  if (!custom) {
    const invalidTags = tagNames.filter((tag) => !allTags.includes(tag as MongoDbTag));
    if (invalidTags.length > 0) {
      throw new Error(
        `Invalid tags found: ${invalidTags.join(
          ", "
        )} \nUse the "addCustomTags" transformation instead or use allowed tags: \n  - ${allTags
          .sort()
          .join("\n  - ")}`
      );
    }
  }
};
