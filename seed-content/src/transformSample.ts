import { promises as fs } from "fs";
import * as Path from "path";
import { strict as assert } from "assert";
import { ObjectId, WithId, EmbeddedContent } from "chat-core";

type OldFormat = {
  _id: ObjectId;
  text: string;
  url: string;
  site: { name: string; url: string };
  tags: string[];
  numTokens: number;
  embedding: number[];
  lastUpdated: Date;
};

type NewFormat = WithId<EmbeddedContent>;

async function main() {
  const oldFormatFilePath = Path.resolve(process.argv[2]);
  const oldFormatFile = JSON.parse(
    await fs.readFile(oldFormatFilePath, "utf-8")
  ) as Partial<OldFormat>[];

  const newFormatFile = oldFormatFile.map(
    (
      { _id, url, text, site, tags, numTokens, embedding, lastUpdated },
      i
    ): NewFormat => {
      assert(
        _id !== undefined &&
          url !== undefined &&
          text !== undefined &&
          site?.name !== undefined &&
          site?.url !== undefined &&
          tags !== undefined &&
          numTokens !== undefined &&
          embedding !== undefined &&
          lastUpdated !== undefined,
        `Problem with object #${i} in file '${oldFormatFilePath}': apparently not old format!`
      );
      return {
        _id,
        embedding,
        sourceName: site.name,
        text,
        tokenCount: numTokens,
        updated: lastUpdated,
        url,
        tags,
      };
    }
  );
  process.stdout.write(JSON.stringify(newFormatFile));
}

main();
