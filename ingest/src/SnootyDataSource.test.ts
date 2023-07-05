import * as Path from "path";
import * as url from "url";
import { makeSnootyDataSource } from "./SnootyDataSource";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

describe("SnootyDataSource", () => {
  it("successfully loads pages", async () => {
    const source = await makeSnootyDataSource({
      baseUrl: "https://mongodb.com/docs/",
      manifestUrl: `file://${Path.resolve(
        __dirname,
        "../test/snooty_sample_data.txt"
      )}`,
      name: "snooty",
    });

    const pages = await source.fetchPages();
    expect(pages.length).toBe(12);
    expect(pages[0]).toMatchObject({
      format: "md",
      sourceName: "snooty",
      tags: [],
      url: "docs/docsworker-xlarge/master/about",
      body: `# About MongoDB Documentation

The MongoDB Manual contains
comprehensive documentation on MongoDB. This page describes the
manual's licensing, editions, and versions, and describes how to make a
change request and how to contribute to the manual.

## License

This work is licensed under a Creative Commons
Attribution-NonCommercial-ShareAlike 3.0 United States License

© MongoDB, Inc. 2008-2022



## Man Pages

In addition to the MongoDB Manual, you can
access the MongoDB Man Pages,
which are also distributed with the official MongoDB Packages.



## Version and Revisions

This version of the manual reflects version 7.0
of MongoDB.

See the MongoDB Documentation Project Page
for an overview of all editions and output formats of the MongoDB
Manual. You can see the full revision history and track ongoing
improvements and additions for all versions of the manual from its GitHub
repository.

The most up-to-date, current, and stable version of the manual is
always available at "https://www.mongodb.com/docs/manual/".



## Report an Issue or Make a Change Request

To report an issue with this manual or to make a change request, file
a ticket at the
MongoDB DOCS Project on Jira.

Contribute to the Documentation

## Contribute to the Documentation

The entire documentation source for this manual is available in the
mongodb/docs repository,
which is one of the
MongoDB project repositories on GitHub.

To contribute to the documentation, you can open a
GitHub account, fork the
mongodb/docs repository,
make a change, and issue a pull request.

In order for the documentation team to accept your change, you must
complete the
MongoDB Contributor Agreement.

You can clone the repository by issuing the following command at your
system shell:

\`\`\`bash
git clone git://github.com/mongodb/docs.git
\`\`\`

### About the Documentation Process

The MongoDB Manual uses Sphinx, a
sophisticated documentation engine built upon Python Docutils. The original reStructured Text files, as well as all
necessary Sphinx extensions and build tools, are available in the same
repository as the documentation.

For more information on the MongoDB documentation process, see the
Meta Documentation.

If you have any questions, please feel free to open a Jira Case.







`,
    });
  });
});
