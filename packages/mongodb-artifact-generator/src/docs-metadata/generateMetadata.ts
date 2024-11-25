import { OpenAI } from "mongodb-rag-core/openai";
import { RunLogger } from "../runlogger";
import { makeGenerateMetaDescription } from "./generateMetaDescription";

export type DocsMetadata = {
  description: string;
};

export function makeGenerateDocsMetadata({
  openAiClient,
  logger,
}: {
  openAiClient: OpenAI;
  logger?: RunLogger;
}) {
  const generateMetaDescription = makeGenerateMetaDescription({
    openAiClient,
    logger,
  });

  return async function generateDocsMetadata({
    url,
    text,
  }: {
    url: string;
    text: string;
  }): Promise<DocsMetadata> {
    const description = await generateMetaDescription({ url, text });

    return {
      description,
    };
  };
}
