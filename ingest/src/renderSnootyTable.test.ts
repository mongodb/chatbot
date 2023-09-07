import Path from "path";
import fs from "fs";
import { renderSnootyTable } from "./renderSnootyTable";

describe("renderSnootyTable", () => {
  it("renders HTML tables", () => {
    const sampleTableAst = JSON.parse(
      fs.readFileSync(
        Path.resolve(__dirname, "./test_data/sampleSnootyTable.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = renderSnootyTable(sampleTableAst, 0);
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
<td heading="Action">
"replace"

</td>
<td heading="Description">
Replace the existing document in the output collection with the matching results document.

When performing a replace, the replacement document cannot result in a modification of the \`_id\` value or, if the output collection is sharded, the shard key value. Otherwise, the operation generates an error.

To avoid this error, if the on field does not include the \`_id\` field, remove the \`_id\` field in the aggregation results to avoid the error, such as with a preceding \`$unset\` stage, and so on.

</td>
</tr>
<tr>
<td heading="Action">
"keepExisting"

</td>
<td heading="Description">
Keep the existing document in the output collection.

</td>
</tr>
<tr>
<td heading="Action">
"merge" (Default)

</td>
<td heading="Description">
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
<td heading="Action">
"fail"

</td>
<td heading="Description">
Stop and fail the aggregation operation. Any changes to the output collection from previous documents are not reverted.

</td>
</tr>
</table>`;
    expect(result).toBe(expected);
    const openingTagCount = result.split("<td").length - 1;
    const closingTagCount = result.split("</td").length - 1;
    expect(openingTagCount).toBe(8);
    expect(openingTagCount).toBe(closingTagCount);
  });

  it("renders HTML tables with multiple header rows", () => {
    const ast = JSON.parse(
      fs.readFileSync(
        Path.resolve(
          __dirname,
          "./test_data/sampleSnootyMultiHeaderTable.json"
        ),
        "utf-8"
      )
    );
    const result = renderSnootyTable(ast, 0);
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
<td heading="h1">
d1

</td>
<td heading="h2">
d2

</td>
</tr>
</table>`;
    expect(result).toBe(expected);
  });
});
