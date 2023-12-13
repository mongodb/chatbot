import { html } from "common-tags";
import { EmbeddedContent, WithScore } from "mongodb-rag-core";

export function stringifyVectorSearchChunks(
  content: WithScore<EmbeddedContent>[]
): string[] {
  return content.map(
    (embed) => html`
      <Chunk
        score="{${embed.score}}"
        sourceName="${embed.sourceName}"
        url="${embed.url}"
      >
        ${embed.text}
      </Chunk>
    `
  );
}

export const rstDescription = html`
- All headings must use rST format where the heading text is underlined with symbols.

  This markdown:

    # Heading 1

    Some text

    ## Heading 2

    Some more text

    \`\`\`js
    const x = 1;
    \`\`\`

    ### Heading 3

    Even more text

    #### Heading 4

    Still more text

  Should be converted to:

    =========
    Heading 1
    =========

    Some text

    Heading 2
    ---------

    Some more text

    .. code-block:: javascript

       const x = 1;

    Heading 3
    ~~~~~~~~~

    Even more text

    Heading 4
    +++++++++

    Still more text

- All rST directives must be properly indented with three spaces and should not use triple backtick fences. Consider the following example:

  .. facet::
     :name: genre
     :values: reference

  .. meta::
     :keywords: MongoDB SomeLang driver, code example, Atlas search

  This is a regular paragraph.

  .. code-block:: js
     :emphasize-lines: 1

     console.log("This is a code block.")

- All rST roles must use correct syntax, as in the following examples:

  \`\`the default double backtick role is inline code\`\`

  :rolename:\`text\`

  :rolename:\`text <target-name>\`

- Always use a code-block directive or default inline role to represent code or configuration.

- Always use dashes (-) for unordered lists.
`
