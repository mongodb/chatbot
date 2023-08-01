import Path from "path";
import { readFileSync, writeFileSync } from "fs";
import { snootyAstToMd } from "./snootyAstToMd";

describe("snootyAstToMd", () => {
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
  it("renders definition lists", () => {
    const page = JSON.parse(
      readFileSync(
        Path.resolve(__dirname, "./test_data/definitionListSample.json"),
        { encoding: "utf-8" }
      )
    );
    const result = snootyAstToMd(page.data.ast, {
      baseUrl: "/",
    });
    expect(result.startsWith("# $merge (aggregation)")).toBe(true);
    const expectedToInclude = `Writes the results of the [aggregation pipeline](//core/aggregation-pipeline/#) to a specified collection. The
[\`$merge\`](/reference/operator/aggregation/merge/#mongodb-pipeline-pipe.-merge) operator must be the **last** stage in the
pipeline.`;
    expect(result.includes(expectedToInclude)).toBe(true);
  });
});
