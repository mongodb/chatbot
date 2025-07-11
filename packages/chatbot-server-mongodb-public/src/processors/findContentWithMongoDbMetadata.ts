import { FindContentFunc, updateFrontMatter } from "mongodb-rag-core";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { classifyMongoDbProgrammingLanguageAndProduct } from "mongodb-rag-core/mongoDbMetadata";

export const makeFindContentWithMongoDbMetadata = ({
  findContent,
  classifierModel,
}: {
  findContent: FindContentFunc;
  classifierModel: LanguageModel;
}) => {
  const wrappedFindContent: FindContentFunc = wrapTraced(
    async ({ query, filters, limit }) => {
      const { product, programmingLanguage } =
        await classifyMongoDbProgrammingLanguageAndProduct(
          classifierModel,
          query
        );

      const preProcessedQuery = updateFrontMatter(query, {
        ...(product ? { product } : {}),
        ...(programmingLanguage ? { programmingLanguage } : {}),
      });

      const res = await findContent({
        query: preProcessedQuery,
        filters,
        limit,
      });
      return res;
    },
    {
      name: "makeFindContentWithMongoDbMetadata",
    }
  );
  return wrappedFindContent;
};
