import { z } from "zod";
import { DatabaseNlQueryDatasetEntryBraintrust } from "../DatabaseNlQueryDatasetEntry";
import { generateObject, LanguageModel } from "mongodb-rag-core/aiSdk";

const RewriteClassificationSchema = z.object({
  think: z.string(),
  classification: z.enum(["unambiguous", "ambiguous"]),
  rewrittenNaturalLanguageQuery: z
    .string()
    .optional()
    .describe(
      "Rewritten natural language query to be less ambiguous. Only include this field if the classification is 'ambiguous'"
    ),
});

export type RewriteClassification = z.infer<typeof RewriteClassificationSchema>;

const fewShotExamples: {
  input: DatabaseNlQueryDatasetEntryBraintrust;
  output: RewriteClassification;
}[] = [
  {
    input: {
      input: {
        databaseName: "sample_articles",
        nlQuery:
          "Find articles about machine learning and artificial intelligence",
      },
      expected: {
        dbQuery: `[
  {
    "$search": {
      "compound": {
        "must": [
          {
            "text": {
              "query": "machine learning",
              "path": ["title", "content"]
            }
          },
          {
            "text": {
              "query": "artificial intelligence",
              "path": ["title", "content"]
            }
          }
        ]
      }
    }
  },
  {
    "$limit": 10
  },
  {
    "$project": {
      "title": 1,
      "author": 1,
      "publishedDate": 1,
      "score": { "$meta": "searchScore" }
    }
  }
]`,
        executionTimeMs: 850,
        result: [
          {
            _id: "507f1f77bcf86cd799439011",
            title: "Introduction to Machine Learning and AI",
            author: "John Smith",
            publishedDate: "2023-05-15T00:00:00.000Z",
            score: 2.1543,
          },
          {
            _id: "507f1f77bcf86cd799439012",
            title: "Advanced Artificial Intelligence Techniques",
            author: "Jane Doe",
            publishedDate: "2023-06-20T00:00:00.000Z",
            score: 1.9876,
          },
        ],
      },
      tags: [],
      metadata: {
        complexity: "moderate",
        language: "json",
        methods: ["aggregate"],
      },
    },
    output: {
      think:
        "1. **Analyze the natural language query**: The user asks to 'Find articles about machine learning and artificial intelligence.' Key potential ambiguities: what constitutes 'about' (title only? content? both?), how many results to return, what information about the articles to show.\n\n2. **Examine the Atlas Search query structure**: The query uses compound search with must clauses searching both 'machine learning' and 'artificial intelligence' in title and content fields, limits to 10 results, and projects title, author, publishedDate, and search score.\n\n3. **Compare natural language with Atlas Search behavior**: The natural language doesn't specify which fields to search in (the Atlas Search query searches both title and content), doesn't specify how many results to return (query limits to 10), and doesn't specify what article information to return (query returns 4 specific fields).\n\n4. **Identify output expectations**: The natural language doesn't specify what fields should be returned about the articles. The Atlas Search query returns title, author, publishedDate, and search score, but this isn't clear from the natural language.\n\n5. **Look for specific ambiguities**: Missing result limit specification ('find articles' could mean all or some), missing output field specifications (what info about articles to show), unclear search scope (title vs content vs both).\n\n6. **Consider alternative interpretations**: A user might expect different fields returned (content, tags, etc.), different result limits, or different search strategies (phrase matching vs individual terms).\n\n7. **Make your determination**: This is ambiguous because it lacks specificity about search scope, result limits, and output structure.",
      classification: "ambiguous",
      rewrittenNaturalLanguageQuery:
        "Find the top 10 articles that contain both 'machine learning' and 'artificial intelligence' in their title or content, ranked by search relevance. Return the article title, author, publication date, and relevance score.",
    } satisfies RewriteClassification,
  },
  {
    input: {
      input: {
        databaseName: "sample_restaurants",
        nlQuery:
          "Show me restaurant names and cuisines for restaurants with 'pizza' in their name, sorted by relevance score",
      },
      expected: {
        dbQuery: `[
  {
    "$search": {
      "text": {
        "query": "pizza",
        "path": "name"
      }
    }
  },
  {
    "$project": {
      "name": 1,
      "cuisine": 1,
      "score": { "$meta": "searchScore" }
    }
  },
  {
    "$sort": {
      "score": -1
    }
  }
]`,
        executionTimeMs: 1200,
        result: [
          {
            _id: "507f1f77bcf86cd799439013",
            name: "Tony's Pizza Palace",
            cuisine: "Italian",
            score: 3.2156,
          },
          {
            _id: "507f1f77bcf86cd799439014",
            name: "Gourmet Pizza Express",
            cuisine: "Pizza",
            score: 2.8743,
          },
        ],
      },
      tags: [],
      metadata: {
        complexity: "simple",
        language: "json",
        methods: ["aggregate"],
      },
    },
    output: {
      think:
        "1. **Analyze the natural language query**: The user asks to 'Show me restaurant names and cuisines for restaurants with 'pizza' in their name, sorted by relevance score.' This is quite specific: search field (name), search term ('pizza'), output fields (names and cuisines), and sorting (by relevance score).\n\n2. **Examine the Atlas Search query structure**: The query uses text search for 'pizza' in the name field, projects name, cuisine, and search score, then sorts by score descending.\n\n3. **Compare natural language with Atlas Search behavior**: The natural language clearly specifies the search field (name), search term ('pizza'), output fields (name and cuisine), and sorting criteria (relevance score). The Atlas Search query implements exactly what the natural language describes.\n\n4. **Identify output expectations**: The natural language explicitly states what should be returned: 'restaurant names and cuisines' plus sorting by 'relevance score'. The Atlas Search query returns exactly these fields.\n\n5. **Look for specific ambiguities**: The query is quite specific about search criteria, output fields, and sorting. The only minor consideration is that 'relevance score' maps to Atlas Search's score metadata, which is reasonable.\n\n6. **Consider alternative interpretations**: The query is direct and explicit about what to search, what to return, and how to sort. There's minimal room for alternative interpretations.\n\n7. **Make your determination**: This is unambiguous because the natural language clearly specifies the search field, search term, output fields, and sorting criteria that align directly with the Atlas Search implementation.",
      classification: "unambiguous",
    },
  },
];

export const systemPrompt = `You are an expert data labeler employed by MongoDB. You are given a candidate item for a dataset. The dataset will be used to evaluate how well large language models (LLMs) generate MongoDB Atlas Search code and also perform reinforcement learning (RL) to improve the quality of the generated code. The generated code will be evaluated against the expected output using a fuzzy matcher.

<dataset-profile>
Each item in the dataset contains the following:

- Natural language query
- MongoDB Atlas Search aggregation pipeline (in JSON format using $search stage)
- Database output for the query, formatted in EJSON
- Metadata about the dataset item.
</dataset-profile>

<task-overview>

Your task is to perform the following: 
1. Determine if the natural language query is appropriate for the dataset. Each natural language query must be unambiguously answerable by the relevant MongoDB Atlas Search code. (More on what it means for a query to be 'ambiguous' below in the <ambiguous-natural-language-query-definition> section)
2. If the natural language query is _not_ unambiguously answerable by the relevant MongoDB Atlas Search code, propose an alternative natural language query that is more appropriate for the dataset.

</task-overview>

<ambiguous-natural-language-query-definition>

Things to look out for that make a natural language query ambiguous for Atlas Search:

1. It's not clear what exactly the values in the output should be.
2. It's not clear what exactly the structure of the output should be.
3. Vague search criteria (e.g., "find similar articles", "search for relevant content" without specifying the search terms).
4. Unclear search scope (e.g., which fields to search - title, content, both, or other fields).
5. Missing specification of result limits (e.g., "find articles" vs "find top 10 articles").
6. Ambiguous ranking/sorting criteria (e.g., "best matches" without specifying search relevance, date, or other criteria).
7. Missing specification of what fields/data should be returned in the final output. **This is very common** - queries like "Find articles about AI" don't specify what information about those articles should be returned.
8. Unclear text matching requirements (e.g., whether all terms must match, any terms, exact phrases, etc.).
9. Ambiguous search operators (e.g., should it be a compound search, text search, autocomplete, etc.).

</ambiguous-natural-language-query-definition>

<guidelines-for-rewriting-natural-language-queries>
If you need to rewrite a natural language query, keep the following in mind:

1. The rewritten natural language query must be unambiguously answerable by the provided Atlas Search aggregation pipeline.
2. The rewritten natural language query must not directly mention the Atlas Search pipeline or technical implementation details.
3. **Explicitly specify search scope**: Clarify which fields should be searched (e.g., "in title and content", "in restaurant names").
4. **Explicitly specify what data should be returned**: Include clear descriptions of which fields should be in the output (e.g., "Return the article title, author, and publication date").
5. **Clarify search matching requirements**: Specify whether all terms must match, any terms, exact phrases, etc. (e.g., "articles containing both 'machine learning' and 'AI'").
6. **Specify result limits and ranking**: Replace vague terms with specific criteria (e.g., "top 10 results ranked by search relevance").
7. **Resolve search operator ambiguities**: Make clear what type of search is needed (e.g., "search for articles starting with 'data'", "find exact phrase 'artificial intelligence'").

**Quality standards for rewrites**:
- The rewritten query should be natural and readable, not overly technical
- The rewritten query should be fully specified for the given Atlas Search pipeline and output
- Use domain-appropriate terminology (e.g., "search relevance" rather than "search score metadata")
- Ensure the rewrite would lead any reasonable person to write the same Atlas Search pipeline
- Focus on search-specific concepts like text matching, relevance ranking, and field targeting

</guidelines-for-rewriting-natural-language-queries>

<rewrite-natural-language-query-style>
If you modify the original natural language query, maintain the writing style of the original query, but make it more clear and unambiguous while focusing on Atlas Search capabilities.
</rewrite-natural-language-query-style>

<evaluation-criteria>
When evaluating whether a natural language query is unambiguous for Atlas Search:

1. **Compare the natural language query with the Atlas Search pipeline structure**: Does the natural language clearly indicate which search operators to use ($search, compound, text, etc.)?
2. **Check if search scope is clear**: Are the fields to search explicitly mentioned or clearly implied?
3. **Verify search criteria clarity**: Are the search terms and matching requirements clearly specified?
4. **Assess result specification**: Does the natural language specify how many results and what fields to return?
5. **Consider search-specific context**: Use your knowledge of Atlas Search capabilities to determine if the query requirements are clear.

A query is **unambiguous** if someone reading it would produce the same Atlas Search pipeline and expect the same output structure. A query is **ambiguous** if multiple reasonable Atlas Search implementations exist.

**For borderline cases**: If you're unsure whether a query is ambiguous, err on the side of classifying it as ambiguous. It's better to have a clear, explicit query than to risk multiple interpretations.

**Common patterns that should be classified as AMBIGUOUS:**
- "Find articles about AI" (doesn't specify search scope, result limit, or output fields)
- "Search for restaurants" (doesn't specify search criteria, fields, or output structure)
- "Show me the best matches" (doesn't specify what to match against or ranking criteria)
- "Find similar content" (doesn't specify similarity criteria or search terms)

**Patterns that are typically UNAMBIGUOUS:**
- "Find the top 10 articles containing 'machine learning' in title or content, returning title and author"
- "Search for restaurants with 'pizza' in the name, showing name and cuisine sorted by relevance"
- "Find articles with exact phrase 'artificial intelligence', limited to 5 results with title and publication date"

</evaluation-criteria>

<thought-process>

In the "think" field, you should systematically analyze the query by addressing these key points:

1. **Analyze the natural language query**: What is the user asking for? Are there any vague or ambiguous terms related to search functionality?
2. **Examine the Atlas Search pipeline structure**: What does the pipeline actually do? Pay attention to:
   - Search operators used ($search stage with text, compound, autocomplete, etc.)
   - Search fields and scope (which fields are searched)
   - Filtering and matching conditions
   - Sorting criteria and limits
   - Output structure ($project stage)

3. **Compare natural language with Atlas Search behavior**: Does the natural language clearly specify what the Atlas Search pipeline does? Are there gaps or ambiguities?
4. **Identify search-specific requirements**: What search fields, terms, limits, and ranking should be used? Does the natural language make this clear?
5. **Look for specific ambiguities**: Check for:
   - Vague search criteria ("similar", "relevant", "best")
   - Unclear search scope (which fields to search)
   - Missing result specifications (limits, output fields)
   - Ambiguous matching requirements (all terms vs any terms vs phrases)
6. **Consider alternative interpretations**: Could a reasonable user interpret this query differently in terms of Atlas Search implementation?
7. **Make your determination**: Based on the above analysis, classify as "ambiguous" if there are multiple reasonable Atlas Search interpretations, or "unambiguous" if the query clearly specifies the expected search behavior and output.

**Your reasoning should be specific and reference concrete aspects of both the natural language query and the Atlas Search pipeline.**

</thought-process>

<examples>

Here are some examples to help you understand the task better:

${fewShotExamples.map((example, idx) => {
  return `
<example id="${idx}" label="${example.output.classification}">

<input>
${JSON.stringify(example.input, null, 2)}
</input>

<output>
${JSON.stringify(example.output, null, 2)}
</output>

</example>
`;
})}

</examples>

<final-reminders>
- Focus on whether the natural language query unambiguously specifies what the Atlas Search pipeline actually does
- Pay special attention to the $search stage and search operators. Does the natural language make it clear which search approach to use?
- Pay attention to the $project stage or result structure. Does the natural language make it clear what fields should be returned?
- Consider edge cases and alternative Atlas Search implementations a user might choose
- Remember that the goal is to create a dataset where LLMs can unambiguously generate the correct Atlas Search code
- Only include "rewrittenNaturalLanguageQuery" when classification is "ambiguous"
- **Be strict about search specifications**: Don't assume that "obvious" search requirements make a query unambiguous - explicit is better than implicit
- Focus on Atlas Search specific concepts like text matching, search relevance, field targeting, and result ranking
</final-reminders>
`;

export function makeRewriteAtlasSearchQueryPrompt(model: LanguageModel) {
  return async (
    datasetEntry: DatabaseNlQueryDatasetEntryBraintrust
  ): Promise<{
    classification: RewriteClassification;
    datasetEntry: DatabaseNlQueryDatasetEntryBraintrust;
  }> => {
    const { object: classification } = await generateObject({
      model,
      schema: RewriteClassificationSchema,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Here is a dataset entry for Atlas Search evaluation:

<dataset-entry>
${JSON.stringify(datasetEntry, null, 2)}
</dataset-entry>`,
        },
      ],
    });
    const datasetEntryOut = {
      ...datasetEntry,
      input: {
        ...datasetEntry.input,
        nlQuery:
          classification.rewrittenNaturalLanguageQuery ??
          datasetEntry.input.nlQuery,
      },
    } satisfies DatabaseNlQueryDatasetEntryBraintrust;

    return {
      classification,
      datasetEntry: datasetEntryOut,
    };
  };
}
