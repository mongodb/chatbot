import { EmbeddedContent } from "./EmbeddedContent";
import { z } from "zod";

export const validateMetadata = <MetadataType>(
  content: EmbeddedContent,
  metadataShape: { [K in keyof MetadataType]: z.ZodType }
): Omit<EmbeddedContent, "metadata"> & {
  metadata: MetadataType;
} => {
  const metadata = z
    .object(metadataShape)
    .parse(content.metadata) as MetadataType;
  return {
    ...content,
    metadata,
  };
};
