import { z } from "zod";
import { DatabaseNlQueryDatasetEntryBraintrust } from "../DatabaseNlQueryDatasetEntry";

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
        databaseName: "sample_restaurants",
        nlQuery:
          "Find restaurants that have received only C grades in their last 4 inspections with scores above 30",
      },
      expected: {
        dbQuery:
          'db.restaurants.aggregate([\n  {\n    $addFields: {\n      sortedGrades: {\n        $slice: [\n          {\n            $sortArray: {\n              input: "$grades",\n              sortBy: { date: -1 }\n            }\n          },\n          4\n        ]\n      }\n    }\n  },\n  {\n    $match: {\n      $and: [\n        { "sortedGrades.3": { $exists: true } }, // Ensure at least 4 inspections\n        {\n          sortedGrades: {\n            $not: {\n              $elemMatch: {\n                $or: [\n                  { grade: { $ne: "C" } },\n                  { score: { $lte: 30 } }\n                ]\n              }\n            }\n          }\n        }\n      ]\n    }\n  },\n  {\n    $project: {\n      name: 1,\n      restaurant_id: 1,\n      borough: 1,\n      cuisine: 1,\n      consecutive_c_grades: 4,\n      latest_score: { $arrayElemAt: ["$sortedGrades.score", 0] }\n    }\n  }\n])',
        executionTimeMs: 2020,
        result: [
          {
            _id: "5eb3d669b31de5d588f45ff8",
            borough: "Queens",
            cuisine: "Chinese",
            latest_score: 32,
            name: "Red Chopstick",
            restaurant_id: "41602559",
          },
        ],
      },
      tags: [],
      metadata: {
        complexity: "moderate",
        language: "mongosh",
        methods: ["aggregate"],
      },
    },
    output: {
      think:
        "1. **Analyze the natural language query**: The user asks to 'Find restaurants that have received only C grades in their last 4 inspections with scores above 30.' Key ambiguous terms: 'last 4 inspections' and 'scores above 30'.\n\n2. **Examine the MongoDB query structure**: The query uses $addFields to sort grades by date descending and slice to get 4 most recent, then $match with complex conditions ensuring exactly 4 inspections exist and all have grade C with scores > 30, finally $project returns name, restaurant_id, borough, cuisine, consecutive_c_grades, and latest_score.\n\n3. **Compare natural language with MongoDB behavior**: The natural language doesn't specify that 'last 4' means chronologically recent (requires date sorting), nor that 'scores above 30' applies to ALL 4 inspections (not just some).\n\n4. **Identify output expectations**: The natural language doesn't specify what fields should be returned. The MongoDB query returns 6 specific fields, but this isn't clear from the natural language.\n\n5. **Look for specific ambiguities**: 'last 4 inspections' (temporal reference unclear), 'scores above 30' (filtering logic unclear - all vs some), missing output field specifications.\n\n6. **Consider alternative interpretations**: A user might interpret 'last 4' as array position rather than chronological order, or 'scores above 30' as applying to any/some scores rather than all.\n\n7. **Make your determination**: This is ambiguous because multiple interpretations exist for temporal ordering, filtering logic, and output structure.",
      classification: "ambiguous",
      rewrittenNaturalLanguageQuery:
        "Find restaurants where the 4 most recent inspections (sorted by date) all received C grades and all had scores greater than 30. Return the restaurant name, id, borough, cuisine, the count of consecutive C grades (4), and the latest inspection score.",
    } satisfies RewriteClassification,
  },
  {
    input: {
      input: {
        databaseName: "sample_restaurants",
        nlQuery:
          "For Chinese restaurants, show me the distribution of health grades (A, B, C) and count how many inspections received each grade.",
      },
      expected: {
        dbQuery:
          'db.restaurants.aggregate([\n  {\n    $match: {\n      cuisine: "Chinese"\n    }\n  },\n  {\n    $unwind: "$grades"\n  },\n  {\n    $group: {\n      _id: "$grades.grade",\n      count: { $sum: 1 }\n    }\n  },\n  {\n    $project: {\n      _id: 0,\n      grade: "$_id",\n      count: 1\n    }\n  },\n  {\n    $sort: {\n      grade: 1\n    }\n  }\n])',
        executionTimeMs: 1255,
        result: [
          {
            count: 6587,
            grade: "A",
          },
          {
            count: 1871,
            grade: "B",
          },
          {
            count: 452,
            grade: "C",
          },
          {
            count: 59,
            grade: "Not Yet Graded",
          },
          {
            count: 212,
            grade: "P",
          },
          {
            count: 168,
            grade: "Z",
          },
        ],
      },
      tags: [],
      metadata: {
        complexity: "moderate",
        language: "mongosh",
        methods: ["aggregate"],
      },
    },
    output: {
      think:
        "1. **Analyze the natural language query**: The user asks 'For Chinese restaurants, show me the distribution of health grades (A, B, C) and count how many inspections received each grade.' This is very clear: 'Chinese restaurants' (cuisine filter), 'distribution of health grades' (grouping), and 'count how many inspections received each grade' (aggregation).\n\n2. **Examine the MongoDB query structure**: The query uses $match to filter for Chinese cuisine, $unwind to separate individual grades, $group by grade to count occurrences, $project to format output with grade and count fields, and $sort by grade.\n\n3. **Compare natural language with MongoDB behavior**: The natural language directly specifies what the MongoDB query does - filter for Chinese restaurants, group by grade, and count inspections for each grade.\n\n4. **Identify output expectations**: The natural language clearly indicates the output should show each grade with its count. The MongoDB query returns exactly this: grade and count for each grade type.\n\n5. **Look for specific ambiguities**: No significant ambiguities - the query is straightforward about cuisine type, what to group by, and what to count.\n\n6. **Consider alternative interpretations**: The query is very direct with minimal room for alternative interpretations. A user would expect exactly what the MongoDB query produces: a list of grades with their counts.\n\n7. **Make your determination**: This is unambiguous because the natural language clearly specifies the filtering criteria (Chinese restaurants), the grouping method (by grade), the aggregation (count), and the expected output structure (grade and count).",
      classification: "unambiguous",
    },
  },
  {
    input: {
      input: {
        databaseName: "sample_restaurants",
        nlQuery:
          "Show me the top 10 restaurants in Manhattan that have received 3 or more C grades in their inspection history",
      },
      expected: {
        dbQuery:
          'db.restaurants.aggregate([\n  {\n    $match: {\n      borough: "Manhattan"\n    }\n  },\n  {\n    $addFields: {\n      totalCGrades: {\n        $size: {\n          $filter: {\n            input: "$grades",\n            cond: { $eq: ["$$this.grade", "C"] }\n          }\n        }\n      }\n    }\n  },\n  {\n    $match: {\n      totalCGrades: { $gte: 3 }\n    }\n  },\n  {\n    $sort: {\n      totalCGrades: -1\n    }\n  },\n  {\n    $limit: 10\n  },\n  {\n    $project: {\n      name: 1,\n      address: {\n        street: "$address.street",\n        building: "$address.building"\n      },\n      totalCGrades: 1,\n      cuisine: 1,\n      _id: 0\n    }\n  }\n])',
        executionTimeMs: 1454,
        result: [
          {
            address: {
              building: "519",
              street: "8 Avenue",
            },
            cuisine: "American",
            name: "Amici 36",
            totalCGrades: 4,
          },
          {
            address: {
              building: "158",
              street: "West   58 Street",
            },
            cuisine: "Pizza",
            name: "Bella Vita",
            totalCGrades: 4,
          },
          {
            address: {
              building: "146",
              street: "East   46 Street",
            },
            cuisine: "Italian",
            name: "Nanni Restaurant",
            totalCGrades: 4,
          },
          {
            address: {
              building: "45",
              street: "East   45 Street",
            },
            cuisine: "American",
            name: "The Roosevelt Hotel",
            totalCGrades: 3,
          },
          {
            address: {
              building: "108",
              street: "St Nicholas Avenue",
            },
            cuisine: "American",
            name: "Hai Cheng Restaurant",
            totalCGrades: 3,
          },
        ],
      },
      tags: [],
      metadata: {
        complexity: "moderate",
        language: "mongosh",
        methods: ["aggregate"],
      },
    },
    output: {
      think:
        "1. **Analyze the natural language query**: The user asks to 'Show me the top 10 restaurants in Manhattan that have received 3 or more C grades in their inspection history.' Key ambiguous terms: 'top 10' (ranking criteria unclear).\n\n2. **Examine the MongoDB query structure**: The query uses $match to filter for Manhattan, $addFields to count C grades, another $match for >= 3 C grades, $sort by totalCGrades descending, $limit 10, and $project to return name, address (street/building), totalCGrades, cuisine with _id excluded.\n\n3. **Compare natural language with MongoDB behavior**: The natural language says 'top 10' but doesn't specify the ranking criteria. The MongoDB query sorts by totalCGrades descending, meaning 'top' refers to highest number of C grades, but this isn't explicit in the natural language.\n\n4. **Identify output expectations**: The natural language doesn't specify what fields should be returned. The MongoDB query returns 4 specific fields (name, address structure, totalCGrades, cuisine) but this isn't clear from the natural language.\n\n5. **Look for specific ambiguities**: Vague ranking criteria ('top 10' without specifying metric), missing output field specifications.\n\n6. **Consider alternative interpretations**: A user might interpret 'top 10' as highest-rated restaurants, most popular, or other criteria rather than most C grades. They might also expect different output fields.\n\n7. **Make your determination**: This is ambiguous because 'top 10' doesn't specify the ranking criteria (though the MongoDB query clarifies it's by C grade count), and the output structure isn't specified in the natural language.",
      classification: "ambiguous",
      rewrittenNaturalLanguageQuery:
        "Show me the 10 restaurants in Manhattan with the highest number of C grades in their inspection history (at least 3 C grades), sorted by total C grades descending. Return the restaurant name, address (street and building), total count of C grades, and cuisine type.",
    },
  },
];

export const systemPrompt = `You are an expert data labeler employed by MognoDB. You are given a candidate item for a dataset. The dataset will be use to evaluate how well large language models (LLMs) generate MongoDB code and also perform reinforcement learning (RL) to improve the quality of the generated code. The generated code will be evaluated against the expected output using a fuzzy matcher. 

<dataset-profile>
Each item in the dataset contains the following:

- Natural language query
- MongoDB shell (mongosh) query
- Database output for the query, formatted in EJSON
- Metadata about the dataset item.
</dataset-profile>

<task-overview>

Your task is to perform the following: 
1. Determine if the natural language query is appropriate for the dataset. Each natural language query must be unambiguously answerable by the relevant MongoDB code. (More on what it means for a query to be 'ambiguous' below in the <ambiguous-natural-language-query-definition> section)
2. If the natural language query is _not_ unambiguously answerable by the relevant MongoDB code, propose an alternative natural language query that is more appropriate for the dataset.

</task-overview>

<ambiguous-natural-language-query-definition>

Things to look out for that make a natural language query ambiguous:

1. It's not clear what exactly the values in the output should be.
2. It's not clear what exactly the structure of the output should be.
3. Vague ordering or ranking criteria (e.g., "top 10", "best", "highest" without specifying the ranking metric).
4. Ambiguous time-based references.
5. Unclear filtering conditions.
6. Missing specification of what fields/data should be returned in the final output.
7. Ambiguous aggregation scope.
</ambiguous-natural-language-query-definition>

<guidelines-for-rewriting-natural-language-queries>
If you need to rewrite a natural language query, keep the following in mind:

1. The rewritten natural language query must be unambiguously answerable by the provided mongosh query.
2. The rewritten natural language query must not directly mention the mongosh query.
3. **Do not need to specify key for aggregation queries**: For aggregation queries ( \`db.collection.aggregate(...)\`), the rewritten natural language query does not need to use the same keys in the output documents. The fuzzy matcher that is used to assess equality handles this case, as long as the values are the same.
4. **Explicitly specify what data should be returned**: Include clear descriptions of which fields should be in the output (e.g., "Return the restaurant name, address, and cuisine type").
5. **Clarify sorting and ranking criteria**: Replace vague terms like "top 10" with specific criteria (e.g., "sorted by total C grades descending").
6. **Resolve temporal ambiguities**: Clarify time-based references (e.g., "4 most recent inspections sorted by date").
7. **Specify filtering logic**: Make clear whether conditions apply to all items or just some (e.g., "all 4 grades must be C" vs "at least 3 grades are C").

**Quality standards for rewrites**:
- The rewritten query should be natural and readable, not overly technical
- Include all necessary details but avoid unnecessary verbosity  
- Use domain-appropriate terminology (e.g., "health inspection scores" rather than just "scores")
- Ensure the rewrite would lead any reasonable person to write the same MongoDB query
</guidelines-for-rewriting-natural-language-queries>

<evaluation-criteria>
When evaluating whether a natural language query is unambiguous:

1. **Compare the natural language query with the MongoDB query output structure**: Does the natural language clearly indicate what fields should be returned based on the \`$project\` stage?
2. **Check if sorting/ordering is clear**: If the MongoDB query includes \`$sort\`, does the natural language specify the sorting criteria?
3. **Verify filtering clarity**: Are all \`$match\` conditions clearly implied by the natural language?
4. **Assess temporal references**: Are time-based operations (like "most recent" or "last N") unambiguous?
5. **Consider domain context**: Use your knowledge of the relevant domain to determine if terms would be clear to a typical user.

A query is **unambiguous** if someone reading it would produce the same MongoDB query and expect the same output structure. A query is **ambiguous** if multiple reasonable interpretations exist.

**For borderline cases**: If you're unsure whether a query is ambiguous, err on the side of classifying it as ambiguous. It's better to have a clear, explicit query than to risk multiple interpretations.
</evaluation-criteria>

<thought-process>

In the "think" field, you should systematically analyze the query by addressing these key points:

1. **Analyze the natural language query**: What is the user asking for? Are there any vague or ambiguous terms?
2. **Examine the MongoDB query structure**: What does the MongoDB query actually do? Pay attention to:
   - Filtering conditions (\`$match\` stages)
   - Sorting criteria (\`$sort\` stages)
   - Aggregation operations (\`$group\`, \`$addFields\`, etc.)
   - Output structure (\`$project\` stage)

3. **Compare natural language with MongoDB behavior**: Does the natural language clearly specify what the MongoDB query does? Are there gaps or ambiguities?
4. **Identify output expectations**: What fields should be returned? Does the natural language make this clear, or would a user be unsure about the output structure?
5. **Look for specific ambiguities**: Check for:
   - Vague ranking criteria ("top 10", "best")
   - Unclear temporal references ("last 4", "recent")
   - Ambiguous filtering logic ("scores above 30" - all or some?)
   - Missing output field specifications
6. **Consider alternative interpretations**: Could a reasonable user interpret this query differently? Would they expect different output fields or structure?
7. **Make your determination**: Based on the above analysis, classify as "ambiguous" if there are multiple reasonable interpretations, or "unambiguous" if the query clearly specifies the expected MongoDB behavior and output.

**Your reasoning should be specific and reference concrete aspects of both the natural language query and the MongoDB code.**

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
- Focus on whether the natural language query unambiguously specifies what the MongoDB query actually does
- Pay special attention to the \`$project\` stage - does the natural language make it clear what fields should be returned?
- Consider edge cases and alternative interpretations a user might have in the "think" field.
- Remember that the goal is to create a dataset where LLMs can unambiguously generate the correct MongoDB code
- Only include "rewrittenNaturalLanguageQuery" when classification is "ambiguous"
</final-reminders>
`;
