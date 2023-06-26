import "dotenv/config";
import { ContentService, ContentServiceOptions } from "./content";
import { MongoDB, embeddings } from "chat-core";
import { stripIndent } from "common-tags";

describe("Content Service", () => {
  const {
    MONGODB_CONNECTION_URI,
    VECTOR_SEARCH_INDEX_NAME,
    MONGODB_DATABASE_NAME,
  } = process.env;
  const mongodb = new MongoDB(MONGODB_CONNECTION_URI!, MONGODB_DATABASE_NAME!);

  afterAll(async () => {
    await mongodb.close();
  });

  const options: ContentServiceOptions = {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME!,
    minScore: 0.9,
  };
  const contentService = new ContentService(mongodb.db, options);
  test("Successfully find vector matches for relevant query", async () => {
    const query = "Connect to MongoDB with Node.js";
    const { embedding } = await embeddings.createEmbedding({
      text: query,
      userIp: "XYZ",
    });

    const matches = await contentService.findVectorMatches({ embedding });
    expect(matches).toHaveLength(5);
  });
  test("Does not find vector matches for irrelevant query", async () => {
    // taken from https://en.wikipedia.org/wiki/Egg_as_food
    const query = stripIndent`Humans and human ancestors have scavenged and eaten animal eggs for millions of years.[1] Humans in Southeast Asia had domesticated chickens and harvested their eggs for food by 1500 BCE.[2] The most widely consumed eggs are those of fowl, especially chickens. Eggs of other birds, including ostriches and other ratites, are eaten regularly but much less commonly than those of chickens. People may also eat the eggs of reptiles, amphibians, and fish. Fish eggs consumed as food are known as roe or caviar.

    Bird and reptile eggs consist of a protective eggshell, albumen (egg white), and vitellus (egg yolk), contained within various thin membranes. Egg yolks and whole eggs store significant amounts of protein and choline,[3][4] and are widely used in cookery. Due to their protein content, the United States Department of Agriculture formerly categorized eggs as Meat within the Food Guide Pyramid (now MyPlate).[3] Despite the nutritional value of eggs, there are some potential health issues arising from cholesterol content, salmonella contamination, and allergy to egg proteins.

    Chickens and other egg-laying creatures are kept widely throughout the world and mass production of chicken eggs is a global industry. In 2009, an estimated 62.1 million metric tons of eggs were produced worldwide from a total laying flock of approximately 6.4 billion hens.[5] There are issues of regional variation in demand and expectation, as well as current debates concerning methods of mass production. In 2012, the European Union banned battery husbandry of chickens.`;
    const { embedding } = await embeddings.createEmbedding({
      text: query,
      userIp: "XYZ",
    });
    const matches = await contentService.findVectorMatches({ embedding });
    expect(matches).toHaveLength(0);
  });
});
