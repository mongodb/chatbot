import Path from "path";
import { readFileSync, writeFileSync } from "fs";
import { snootyAstToMd } from "./snootyAstToMd";

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
    expect(result.includes(expectedNotIncludes)).toBe(false);
  });
  it("renders definition lists", () => {
    const result = snootyAstToMd(samplePage.data.ast, {
      baseUrl: "/",
    });
    expect(result.startsWith("# $merge (aggregation)")).toBe(true);
    const expectedToInclude = `Writes the results of the aggregation pipeline to a specified collection. The \`$merge\` operator must be the **last** stage in the pipeline.`;
    expect(result.includes(expectedToInclude)).toBe(true);
  });
  it("renders HTML tables", () => {
    const result = snootyAstToMd(samplePage.data.ast, {
      baseUrl: "/",
    });
    writeFileSync("samplePage.md", result, { encoding: "utf-8" });
    // TODO: remove bullet points from table entries
    const expected = `<table>

<tr>

<td>

- Field

</td>

<td>

- Description

</td>

</tr>`;
    expect(result).toContain(expected);
    const openingTagCount = result.split("<table>").length - 1;
    const closingTagCount = result.split("</table>").length - 1;
    expect(openingTagCount).toBe(5);
    expect(openingTagCount).toBe(closingTagCount);
  });
});
