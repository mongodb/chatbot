import Path from "path";
import { readFileSync, writeFileSync } from "fs";
import { snootyAstToMd, getTitleFromSnootyAst } from "./snootyAstToMd";

describe("snootyAstToMd", () => {
  const samplePage = JSON.parse(
    readFileSync(Path.resolve(__dirname, "./test_data/samplePage.json"), {
      encoding: "utf-8",
    })
  );
  it("doesn't render targets", () => {
    const ast = {
      type: "root",
      position: { start: { line: 0 } },
      children: [
        {
          type: "target",
          position: { start: { line: 0 } },
          children: [
            {
              type: "target_identifier",
              position: { start: { line: 0 } },
              children: [
                {
                  type: "text",
                  position: { start: { line: 4 } },
                  value: "FAQ",
                },
              ],
              ids: ["java-faq"],
            },
          ],
          domain: "std",
          name: "label",
          html_id: "std-label-java-faq",
        },
        {
          type: "section",
          position: { start: { line: 4 } },
          children: [
            {
              type: "heading",
              position: { start: { line: 4 } },
              children: [
                {
                  type: "text",
                  position: { start: { line: 4 } },
                  value: "FAQ",
                },
              ],
              id: "faq",
            },
          ],
        },
      ],
    };
    const result = snootyAstToMd(ast, {
      baseUrl: "/",
    });
    expect(result.split("\n")[0]).toBe("# FAQ");
  });
  it("does not render links", () => {
    const baseUrl = "https://some-base-url.com/";
    const result = snootyAstToMd(samplePage.data.ast, {
      baseUrl,
    });
    // expect result to not include something like [link text](https://some-base-url.com/faq)
    const expectedNotIncludes = `](${baseUrl})`;
    expect(result).not.toContain(expectedNotIncludes);
  });
  it("renders definition lists", () => {
    const result = snootyAstToMd(samplePage.data.ast, {
      baseUrl: "/",
    });
    expect(result.startsWith("# $merge (aggregation)")).toBe(true);
    const expectedToInclude = `Writes the results of the aggregation pipeline to a specified collection. The \`$merge\` operator must be the **last** stage in the pipeline.`;
    expect(result).toContain(expectedToInclude);
  });
  describe("Renders code blocks", () => {
    const samplePage = JSON.parse(
      readFileSync(
        Path.resolve(__dirname, "./test_data/samplePageWithCodeExamples.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = snootyAstToMd(samplePage.data.ast, {
      baseUrl: "/",
    });
    it("Renders code examples with language", () => {
      expect(result).toContain("```json\n");
    });
    it("Renders code examples without language", () => {
      expect(result).toContain("```\n");
      expect(result).not.toContain("```undefined\n");
    });
  });

  it("renders HTML tables", () => {
    const samplePage = JSON.parse(
      readFileSync(
        Path.resolve(__dirname, "./test_data/sampleListTable.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = snootyAstToMd(samplePage.data.ast, {
      baseUrl: "/",
    });
    writeFileSync("samplePage.md", result, { encoding: "utf-8" });
    // TODO: remove bullet points from table entries
    const expected = `<table>
<tr>
<th>
Action

</th>
<th>
Description

</th>
</tr>
<tr>
<td>
"replace"

</td>
<td>
Replace the existing document in the output collection with the matching results document.

When performing a replace, the replacement document cannot result in a modification of the \`_id\` value or, if the output collection is sharded, the shard key value. Otherwise, the operation generates an error.

To avoid this error, if the on field does not include the \`_id\` field, remove the \`_id\` field in the aggregation results to avoid the error, such as with a preceding \`$unset\` stage, and so on.

</td>
</tr>
<tr>
<td>
"keepExisting"

</td>
<td>
Keep the existing document in the output collection.

</td>
</tr>
<tr>
<td>
"merge" (Default)

</td>
<td>
Merge the matching documents (similar to the \`$mergeObjects\` operator).

- If the results document contains fields not in the existing document, add these new fields to the existing document.

- If the results document contains fields in the existing document, replace the existing field values with those from the results document.

For example, if the output collection has the document:

\`{ _id: 1, a: 1, b: 1 }\`

And the aggregation results has the document:

\`{ _id: 1, b: 5, z: 1 }\`

Then, the merged document is:

\`{ _id: 1, a: 1, b: 5, z: 1 }\`

When performing a merge, the merged document cannot result in a modification of the \`_id\` value or, if the output collection is sharded, the shard key value. Otherwise, the operation generates an error.

To avoid this error, if the on field does not include the \`_id\` field, remove the \`_id\` field in the aggregation results to avoid the error, such as with a preceding \`$unset\` stage, and so on.

</td>
</tr>
<tr>
<td>
"fail"

</td>
<td>
Stop and fail the aggregation operation. Any changes to the output collection from previous documents are not reverted.

</td>
</tr>
</table>`;
    expect(result).toBe(expected);
    const openingTagCount = result.split("<td>").length - 1;
    const closingTagCount = result.split("</td>").length - 1;
    expect(openingTagCount).toBe(8);
    expect(openingTagCount).toBe(closingTagCount);
  });

  describe("getTitleFromSnootyAst", () => {
    it("extracts a title", () => {
      expect(getTitleFromSnootyAst(samplePage.data.ast)).toBe(
        "$merge (aggregation)"
      );
    });
  });
});
