import { EmbeddedContent } from "mongodb-rag-core";
import {
  MakeReferenceLinksFunc,
  makeDefaultReferenceLinks,
} from "../../processors";

/**
  Returns references that look like:

  ```js
  {
    url: "https://mongodb.com/docs/manual/reference/operator/query/eq/",
    title: "https://docs.mongodb.com/manual/reference/operator/query/eq/"
  }
  ```
 */
export const makeMongoDbReferences: MakeReferenceLinksFunc = (
  chunks: EmbeddedContent[]
) => {
  const baseReferences = makeDefaultReferenceLinks(chunks);
  return baseReferences.map((ref) => {
    const url = new URL(ref.url);
    return {
      url: url.href,
      title: url.origin + url.pathname,
    };
  });
};
