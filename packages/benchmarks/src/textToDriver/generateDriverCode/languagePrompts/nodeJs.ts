import { FewShotExample } from "./FewShotExample";
export const promptUtils = {
  basePrompt: `Complete the MongoDB Query Language Node.js driver query only and with no explanation. The output must be executable code.

Generate the query using a \`Db\` object named \`database\` and return static data (not a \`Cursor\` object).
Do not wrap your output in a code block. Only include the executable code.`,
  abstractExampleOutput: `Example outputs:
1. database.collection("<collection name>").find({/* some query */}).toArray()
2. database.collection("<collection name>").find({/* some query */}).count()
3. database.collection("<collection name>").aggregate({/* some query */}).toArray()`,
  chainOfThoughtAbstractExampleOutput: `Example outputs:
1.
// Step by step reasoning of what query should be.
database.collection("<collection name>").find({/* some query */}).toArray()
2.
// Step by step reasoning of what query should be.
database.collection("<collection name>").find({/* some query */}).count()
3.
// Step by step reasoning of what query should be.
database.collection("<collection name>").aggregate({/* some query */}).toArray()`,
};

export const chainOfThoughtSystemPromptContent =
  "In a code comment before the query, carefully but concisely think step by step about what the query should be.";

export const genericFewShotExamples: FewShotExample[] = [
  {
    input: "books by Jane Austen",
    output: {
      content: `database.collection("books").find({ author: "Jane Austen" }).toArray()`,
      chainOfThought:
        "Identify the 'books' collection. Filter documents where the 'author' field equals 'Jane Austen' using `{ author: 'Jane Austen' }`. Use `find()` with this query and convert the results to an array using `toArray()`.",
    },
  },

  {
    input: "number of users older than 18",
    output: {
      content: `database.collection("users").find({ age: { $gt: 18 } }).count()`,
      chainOfThought:
        "Identify the 'users' collection. Filter documents where the 'age' field is greater than 18 using `{ age: { $gt: 18 } }`. Use `find()` with this query and get the count of matching documents using `count()`.",
    },
  },

  {
    input: "orders placed in the last 7 days",
    output: {
      content: `database.collection("orders").find({ orderDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }).toArray()`,
      chainOfThought:
        "Identify the 'orders' collection. Calculate the date 7 days ago using `new Date(new Date().setDate(new Date().getDate() - 7))`. Filter documents where 'orderDate' is greater than or equal to this date using `{ orderDate: { $gte: date7DaysAgo } }`. Use `find()` with this query and convert the results to an array using `toArray()`.",
    },
  },

  {
    input: "get the total number of books by each author",
    output: {
      content: `database.collection("books").aggregate([ { $group: { _id: "$author", totalBooks: { $sum: 1 } } } ]).toArray()`,
      chainOfThought:
        "Identify the 'books' collection. Use `aggregate()` to group documents by the 'author' field. In the `$group` stage, set `_id` to `$author` and compute `totalBooks` by summing 1 for each document using `{ $sum: 1 }`. Convert the aggregation results to an array using `toArray()`.",
    },
  },

  {
    input: "find the average age of users in each city",
    output: {
      content: `database.collection("users").aggregate([ { $group: { _id: "$city", averageAge: { $avg: "$age" } } } ]).toArray()`,
      chainOfThought:
        "Identify the 'users' collection. Use `aggregate()` to group documents by the 'city' field. In the `$group` stage, set `_id` to `$city` and compute `averageAge` by averaging the 'age' field using `{ $avg: '$age' }`. Convert the aggregation results to an array using `toArray()`.",
    },
  },

  {
    input: "top 5 products with the highest sales in the last month",
    output: {
      content: `database.collection("sales").aggregate([
          { $match: { saleDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } } },
          { $group: { _id: "$productId", totalSales: { $sum: "$quantity" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 5 }
        ]).toArray()`,
      chainOfThought:
        "Identify the 'sales' collection. Calculate the date one month ago using `new Date(new Date().setMonth(new Date().getMonth() - 1))`. Use `$match` to filter documents where 'saleDate' is greater than or equal to this date. Use `$group` to group by 'productId' and calculate 'totalSales' by summing the 'quantity' field. Sort the grouped results by 'totalSales' in descending order using `$sort`. Limit the results to the top 5 products using `$limit`. Convert the aggregation results to an array using `toArray()`.",
    },
  },
] as const;

export const NODE_JS_PROMPTS: Record<string, Record<string, string>> = {
  systemPrompts: {
    simple: `${promptUtils.basePrompt}

${promptUtils.abstractExampleOutput}`,
    chainOfThought: `${promptUtils.basePrompt}

${chainOfThoughtSystemPromptContent}

${promptUtils.chainOfThoughtAbstractExampleOutput}`,
    genericFewShot: `${promptUtils.basePrompt}

${promptUtils.abstractExampleOutput}

A few example input and outputs:

${genericFewShotExamples
  .map(
    (ex) => `Input: ${ex.input}
Output: ${ex.output.content}`
  )
  .join("\n\n")}`,
    genericFewShotChainOfThought: `${promptUtils.basePrompt}

${chainOfThoughtSystemPromptContent}

${promptUtils.abstractExampleOutput}

A few example input and outputs:

${genericFewShotExamples
  .map(
    (ex) => `Input: ${ex.input}
Output:
// ${ex.output.chainOfThought}
${ex.output.content}`
  )
  .join("\n\n")}`,
  },
} as const;
