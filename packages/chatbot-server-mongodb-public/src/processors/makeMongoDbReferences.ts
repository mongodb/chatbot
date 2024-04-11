import {
  EmbeddedContent,
  MakeReferenceLinksFunc,
  makeDefaultReferenceLinks,
} from "mongodb-chatbot-server";

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
  return makeDefaultReferenceLinks(chunks);
};
