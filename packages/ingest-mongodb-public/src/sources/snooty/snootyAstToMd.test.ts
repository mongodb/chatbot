import Path from "path";
import fs from "fs";
import { snootyAstToMd, getTitleFromSnootyAst } from "./snootyAstToMd";
import { SnootyNode } from "./SnootyDataSource";
import { rstToSnootyAst } from "./rstToSnootyAst";

const SRC_ROOT = Path.resolve(__dirname, "../../");

describe("snootyAstToMd", () => {
  const samplePage = JSON.parse(
    fs.readFileSync(Path.resolve(SRC_ROOT, "../testData/samplePage.json"), {
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
    const result = snootyAstToMd(ast);
    expect(result.split("\n")[0]).toBe("# FAQ");
  });
  it("does not render links", () => {
    const result = snootyAstToMd(samplePage.data.ast);
    // expect result to not include something like [link text](https://some-base-url.com/faq)
    const expectedNotIncludes = `](`;
    expect(result).not.toContain(expectedNotIncludes);
  });
  it("renders definition lists", () => {
    const result = snootyAstToMd(samplePage.data.ast);
    expect(result.startsWith("# $merge (aggregation)")).toBe(true);
    const expectedToInclude = `Writes the results of the aggregation pipeline to a specified collection. The \`$merge\` operator must be the **last** stage in the pipeline.`;
    expect(result).toContain(expectedToInclude);
  });
  describe("Renders code blocks", () => {
    const samplePage = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/samplePageWithCodeExamples.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = snootyAstToMd(samplePage.data.ast);
    it("Renders code examples with language", () => {
      expect(result).toContain("```json\n");
    });
    it("Renders code examples without language", () => {
      expect(result).toContain("```\n");
      expect(result).not.toContain("```undefined\n");
    });
  });

  it("strips comments", () => {
    const ast: SnootyNode = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/samplePageWithCommentAst.json"),
        "utf-8"
      )
    );
    const result = snootyAstToMd(ast);
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
  it("renders tab sets", () => {
    const samplePageWithTabs = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/samplePageWithTabs.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = snootyAstToMd(samplePageWithTabs.data.ast);
    const expectedToContainTabsStart = "\n\n<Tabs>\n\n";
    const expectedToContainTabsEnd = "\n\n</Tabs>\n\n";
    const expectedToContainTabStart = '\n\n<Tab name="App Services UI">\n\n';
    const expectedToContainTabEnd = "\n\n</Tab>\n\n";
    expect(result).toContain(expectedToContainTabsStart);
    expect(result).toContain(expectedToContainTabsEnd);
    expect(result).toContain(expectedToContainTabStart);
    expect(result).toContain(expectedToContainTabEnd);
    const numberTabsStart = [...result.matchAll(/<Tabs>/g)].length;
    const numberTabsEnd = [...result.matchAll(/<\/Tabs>/g)].length;
    expect(numberTabsStart).toBe(numberTabsEnd);
    const numberTabStart = [...result.matchAll(/<Tab name=/g)].length;
    const numberTabEnd = [...result.matchAll(/<\/Tab>/g)].length;
    expect(numberTabStart).toBe(numberTabEnd);
  });
  it("renders driver tab sets", () => {
    const samplePageWithTabs = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/samplePageWithTabsDrivers.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = snootyAstToMd(samplePageWithTabs.data.ast);
    const expectedToContainTabsStart = "\n\n<Tabs>\n\n";
    const expectedToContainTabsEnd = "\n\n</Tabs>\n\n";
    const expectedToContainTabStart = '\n\n<Tab name="Java (Sync)">\n\n';
    const expectedToContainTabEnd = "\n\n</Tab>\n\n";
    expect(result).toContain(expectedToContainTabsStart);
    expect(result).toContain(expectedToContainTabsEnd);
    expect(result).toContain(expectedToContainTabStart);
    expect(result).toContain(expectedToContainTabEnd);
    const numberTabsStart = [...result.matchAll(/<Tabs>/g)].length;
    const numberTabsEnd = [...result.matchAll(/<\/Tabs>/g)].length;
    expect(numberTabsStart).toBe(numberTabsEnd);
    const numberTabStart = [...result.matchAll(/<Tab name=/g)].length;
    const numberTabEnd = [...result.matchAll(/<\/Tab>/g)].length;
    expect(numberTabStart).toBe(numberTabEnd);
  });

  it("renders tab sets", () => {
    const samplePage = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/samplePageWithOrderedList.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    const result = snootyAstToMd(samplePage.data.ast);
    expect(result).toBe(`# Connect to App Services - C++ SDK Preview

The App client is the Atlas App Services backend interface. It provides access to authentication and Atlas Functions.

Some of your App Services App's features are associated with user accounts. For example, you need to authenticate a user before you can access your App's functions.

## Prerequisites

1. Create an App Services app

## Access the App Client

1. Find the App ID in the Realm UI.

2. Create an App object with your App's ID as the argument. You use this \`App\` instance to access App Services features throughout your client application.

`);
  });

  it("renders nested lists", () => {
    let result = snootyAstToMd(
      rstToSnootyAst(`Sample list:

1. This is a list.

   - And it has a nested list
   - Wow

#. Item 2
`)
    );
    expect(result).toBe(
      `Sample list:

1. This is a list.

   - And it has a nested list

   - Wow

2. Item 2

`
    );
    const ast = rstToSnootyAst(`Sample list 2:

- This is a list.

   - And it has a nested list
   
     - With a nested list
     - Wow
     - Cool
   
   - Wow
     
     And a new paragraph is properly aligned

- Item 2
`);
    result = snootyAstToMd(ast);
    expect(result).toBe(`Sample list 2:

- This is a list.

  - And it has a nested list

    - With a nested list

    - Wow

    - Cool

  - Wow

    And a new paragraph is properly aligned

- Item 2

`);
  });
});
describe("getTitleFromSnootyAst", () => {
  it("extracts a title", () => {
    const samplePage = JSON.parse(
      fs.readFileSync(Path.resolve(SRC_ROOT, "../testData/samplePage.json"), {
        encoding: "utf-8",
      })
    );
    expect(getTitleFromSnootyAst(samplePage.data.ast)).toBe(
      "$merge (aggregation)"
    );
  });

  it("extracts a title correctly when title text spans multiple nodes", () => {
    const sampleAst = JSON.parse(
      fs.readFileSync(
        Path.resolve(SRC_ROOT, "../testData/sampleCompoundTitlePageAst.json"),
        {
          encoding: "utf-8",
        }
      )
    );
    expect(getTitleFromSnootyAst(sampleAst)).toBe(
      "What is MongoDB Atlas Search?"
    );
  });
});
