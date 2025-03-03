import {
  updateMetaDescription,
  getMetaField,
  hasMetaDirective,
  constructMetaDirective,
  findRstPageTitle,
  upsertMetaDirective,
  upsertMetaDirectiveInFile,
} from "./meta2rst";
import fs from "fs";
import path from "path";

// Mock fs.writeFileSync to prevent actual file writes
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  writeFileSync: jest.fn(),
}));

const rstContent = `Some content here.

.. meta::
   :keywords: code example
   :description: Learn how to improve the performance of an application.

More content here.`;

describe("hasMetaDirective", () => {
  it("returns true if the meta directive exists", () => {
    expect(hasMetaDirective(rstContent)).toBe(true);
  });

  it("returns false if the meta directive does not exist", () => {
    const rstContent = `Some content here.

More content here.`;
    expect(hasMetaDirective(rstContent)).toBe(false);
  });
});

describe("getMetaField", () => {
  it("returns the description field if it exists", () => {
    const description = getMetaField(rstContent, "description");
    expect(description).toEqual(
      "Learn how to improve the performance of an application."
    );
  });

  it("returns the keywords field if it exists", () => {
    const keywords = getMetaField(rstContent, "keywords");
    expect(keywords).toEqual("code example");
  });

  it("returns null if the field is not found", () => {
    const rstContent = `Some content here.

.. meta::
   :keywords: code example

More content here.`;
    const descriptionField = getMetaField(rstContent, "description");
    expect(descriptionField).toBeNull();
  });
});

describe("updateMetaDescription", () => {
  it("adds a description to an existing meta directive that doesn't have one", () => {
    const rstContent = `Some content here.

.. meta::
   :keywords: code example

More content here.`;

    const updatedContent = updateMetaDescription(
      rstContent,
      "Learn how to improve the performance of an application."
    );

    const expectedUpdatedContent = `Some content here.

.. meta::
   :keywords: code example
   :description: Learn how to improve the performance of an application.

More content here.`;
    expect(updatedContent).toEqual(expectedUpdatedContent);
  });

  it("updates a description on an existing meta directive that already has one", () => {
    const updatedContent = updateMetaDescription(
      rstContent,
      "This is the updated description."
    );

    const expectedUpdatedContent = `Some content here.

.. meta::
   :keywords: code example
   :description: This is the updated description.

More content here.`;
    expect(updatedContent).toEqual(expectedUpdatedContent);
  });
});

describe("constructMetaDirective", () => {
  it("returns an empty string if both description and keywords are null", () => {
    const metaDirective = constructMetaDirective({
      description: null,
      keywords: null,
    });
    expect(metaDirective).toEqual("");
  });

  it("returns a meta directive with a description field if only description is provided", () => {
    const metaDirective = constructMetaDirective({
      description: "This is a description.",
      keywords: null,
    });
    expect(metaDirective).toEqual(`.. meta::
   :description: This is a description.`);
  });

  it("returns a meta directive with a keywords field if only keywords are provided", () => {
    const metaDirective = constructMetaDirective({
      description: null,
      keywords: "This is a keyword.",
    });
    expect(metaDirective).toEqual(`.. meta::
   :keywords: This is a keyword.`);
  });

  it("returns a meta directive with both description and keywords fields if both are provided", () => {
    const metaDirective = constructMetaDirective({
      description: "This is a description.",
      keywords: "This is a keyword.",
    });
    expect(metaDirective).toEqual(`.. meta::
   :keywords: This is a keyword.
   :description: This is a description.`);
  });
});

describe("findRstPageTitle", () => {
  it("returns the line number of the page title if it exists", () => {
    const rstContent = `.. _this-is-a-page-anchor:

~~~~~~~~~~~~~~~~~~~~~~
This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~

.. facet::
   :name: genre
   :values: tutorial

This is some content`;
    const lineNumber = findRstPageTitle(rstContent);
    expect(lineNumber).toEqual(5);
  });

  it("returns -1 if no page title is found", () => {
    const lineNumber = findRstPageTitle(rstContent);
    expect(lineNumber).toEqual(-1);
  });

  it("works for all the valid title formats", () => {
    expect(
      findRstPageTitle(`~~~~~~~~~~~~~~~~~~~~~~
This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~`)
    ).toEqual(3);
    expect(
      findRstPageTitle(`======================
This Is The Page Title
======================`)
    ).toEqual(3);
    expect(
      findRstPageTitle(`----------------------
This Is The Page Title
----------------------`)
    ).toEqual(3);

    expect(
      findRstPageTitle(`This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~`)
    ).toEqual(2);
    expect(
      findRstPageTitle(`This Is The Page Title
======================`)
    ).toEqual(2);
    expect(
      findRstPageTitle(`This Is The Page Title
----------------------`)
    ).toEqual(2);
  });

  it("works if there's a frontmatter field list", () => {
    const rstContent = `:template: product-landing
:hidefeedback: header
:noprevnext:

.. _this-is-a-page-anchor:

~~~~~~~~~~~~~~~~~~~~~~
This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~

.. facet::
   :name: genre
   :values: tutorial

This is some content`;
    const lineNumber = findRstPageTitle(rstContent);
    expect(lineNumber).toEqual(9);
  });
});

describe("upsertMetaDirective", () => {
  it("adds a meta directive to a page that doesn't have one", () => {
    const rstContent = `.. _this-is-a-page-anchor:

~~~~~~~~~~~~~~~~~~~~~~
This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~`;

    const updatedPageContent = upsertMetaDirective(rstContent, {
      description: "This is a description.",
      keywords: "This is a keyword.",
    });
    expect(updatedPageContent).toEqual(
      rstContent +
        "\n\n" +
        `.. meta::
   :keywords: This is a keyword.
   :description: This is a description.
`
    );
  });

  it("updates a meta directive on a page that already has one", () => {
    const rstContent = `.. _this-is-a-page-anchor:

~~~~~~~~~~~~~~~~~~~~~~
This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~

.. meta::
   :keywords: code example
   :description: This is the original description.

Some more text`;

    const updatedPageContent = upsertMetaDirective(rstContent, {
      keywords: null,
      description: "This is the updated description.",
    });
    expect(updatedPageContent).toEqual(`.. _this-is-a-page-anchor:

~~~~~~~~~~~~~~~~~~~~~~
This Is The Page Title
~~~~~~~~~~~~~~~~~~~~~~

.. meta::
   :keywords: code example
   :description: This is the updated description.

Some more text`);
  });
});

describe("upsertMetaDirectiveInFile", () => {
  beforeEach(() => {
    // Clear mock before each test
    jest.clearAllMocks();
  });

  it("adds a description to a file with meta directive but no description", () => {
    // Use actual test file
    const filePath = path.join(
      __dirname,
      "../testData/meta2rst/yes-meta-no-description.rst"
    );

    // Call the function with a new description
    upsertMetaDirectiveInFile(filePath, {
      keywords: null,
      description: "This is a new description for testing.",
    });

    // Verify writeFileSync was called with the correct arguments
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(String));

    // Get the content that would have been written
    const updatedContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];

    // Verify the description was added correctly
    expect(getMetaField(updatedContent, "description")).toEqual(
      "This is a new description for testing."
    );

    // Verify keywords were preserved
    expect(getMetaField(updatedContent, "keywords")).toEqual("code example");
  });

  it("updates a description in a file with existing meta directive and description", () => {
    // Use actual test file
    const filePath = path.join(
      __dirname,
      "../testData/meta2rst/yes-meta-yes-description.rst"
    );

    // Call the function with an updated description
    upsertMetaDirectiveInFile(filePath, {
      keywords: null,
      description: "This is an updated description for testing.",
    });

    // Verify writeFileSync was called with the correct arguments
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(String));

    // Get the content that would have been written
    const updatedContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];

    // Verify the description was updated correctly
    expect(getMetaField(updatedContent, "description")).toEqual(
      "This is an updated description for testing."
    );

    // Verify keywords were preserved
    expect(getMetaField(updatedContent, "keywords")).toEqual("code example");
  });

  it("adds a meta directive to a file without one", () => {
    // Use actual test file
    const filePath = path.join(
      __dirname,
      "../testData/meta2rst/no-meta-no-description.rst"
    );

    // Call the function with a new description and keywords
    upsertMetaDirectiveInFile(filePath, {
      keywords: "new keywords",
      description: "This is a brand new description.",
    });

    // Verify writeFileSync was called with the correct arguments
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, expect.any(String));

    // Get the content that would have been written
    const updatedContent = (fs.writeFileSync as jest.Mock).mock.calls[0][1];

    // Verify the meta directive was added with correct fields
    expect(hasMetaDirective(updatedContent)).toBe(true);
    expect(getMetaField(updatedContent, "description")).toEqual(
      "This is a brand new description."
    );
    expect(getMetaField(updatedContent, "keywords")).toEqual("new keywords");
  });
});
