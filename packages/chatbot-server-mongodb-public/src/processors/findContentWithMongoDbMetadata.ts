import { FindContentFunc, updateFrontMatter } from "mongodb-rag-core";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { classifyMongoDbProduct, classifyMongoDbProgrammingLanguage } from "mongodb-rag-core/mongoDbMetadata";

function nullOnErr() {
  return null;
}

export const classifyMongoDbProgrammingLanguageAndProduct = wrapTraced(
  async (model: LanguageModel, data: string, maxRetries?: number) => {
    const [programmingLanguage, product] = await Promise.all([
      classifyMongoDbProgrammingLanguage(model, data, maxRetries).catch(
        nullOnErr
      ),
      classifyMongoDbProduct(model, data, maxRetries).catch(nullOnErr),
    ]);
    return { programmingLanguage, product };
  },
  { name: "classifyMongoDbProgrammingLanguageAndProduct" }
);

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
