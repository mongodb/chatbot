import Path from "path";
import { readFileSync } from "fs";
import { snootyAstToMd, getTitleFromSnootyAst } from "./snootyAstToMd";
import { SnootyNode } from "./SnootyDataSource";

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

  it("renders HTML tables with multiple header rows", () => {
    const ast: SnootyNode = JSON.parse(
      readFileSync(
        Path.resolve(
          __dirname,
          "./test_data/samplePageWithMultiHeaderTableAst.json"
        ),
        "utf-8"
      )
    );
    const result = snootyAstToMd(ast, {
      baseUrl: "/",
    });
    const expected = `<table>
<tr>
<th>
h1

</th>
<th>
h2

</th>
</tr>
<tr>
<th>
h3

</th>
<th>
h4

</th>
</tr>
<tr>
<td>
d1

</td>
<td>
d2

</td>
</tr>
</table>`;
    expect(result).toBe(expected);
  });

  it("strips comments", () => {
    const ast: SnootyNode = JSON.parse(
      readFileSync(
        Path.resolve(__dirname, "./test_data/samplePageWithCommentAst.json"),
        "utf-8"
      )
    );
    const result = snootyAstToMd(ast, {
      baseUrl: "/",
    });
    const expected = `# Data Model Examples and Patterns

For additional patterns and use cases, see also: Building with Patterns

The following documents provide overviews of various data modeling patterns and common schema design considerations:

Examples for modeling relationships between documents.

Presents a data model that uses embedded documents to describe one-to-one relationships between connected data.

Presents a data model that uses embedded documents to describe one-to-many relationships between connected data.

Presents a data model that uses references to describe one-to-many relationships between documents.

Examples for modeling tree structures.

Presents a data model that organizes documents in a tree-like structure by storing references to "parent" nodes in "child" nodes.

Presents a data model that organizes documents in a tree-like structure by storing references to "child" nodes in "parent" nodes.

See Model Tree Structures for additional examples of data models for tree structures.

Examples for models for specific application contexts.

Illustrates how embedding fields related to an atomic update within the same document ensures that the fields are in sync.

Describes one method for supporting keyword search by storing keywords in an array in the same document as the text field. Combined with a multi-key index, this pattern can support application's keyword search operations.

`;
    expect(result).toBe(expected);
  });

  describe("getTitleFromSnootyAst", () => {
    it("extracts a title", () => {
      expect(getTitleFromSnootyAst(samplePage.data.ast)).toBe(
        "$merge (aggregation)"
      );
    });
  });
});
