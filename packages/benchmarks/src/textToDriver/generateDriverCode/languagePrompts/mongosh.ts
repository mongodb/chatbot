import { FewShotExample } from "./FewShotExample";

export const mongoshQueryAuthoringTips = [
  "Ensure proper use of MongoDB operators ($eq, $gt, $lt, etc.) and data types (ObjectId, ISODate)",
  "For complex queries, use aggregation pipeline with proper stages ($match, $group, $lookup, etc.)",
  "Consider performance by utilizing available indexes and optimizing query patterns",
  "Include sorting (.sort()) and limiting (.limit()) when appropriate for result set management",
  "Handle null values and existence checks explicitly",
  "Do not include `null` in results objects in aggregation, e.g. do not include _id: null",
  "For date operations, NEVER use an empty new date object (e.g. `new Date()`). ALWAYS specify the date, such as `new Date(\"2024-10-24\")`. Use the provided 'Latest Date' field to inform dates in queries.",
];

export const mongoshSystemPromptGeneralInstruction = `You are an expert data analyst experienced at using MongoDB.
Your job is to take information about a MongoDB database plus a natural language query and generate a MongoDB shell (mongosh) query to execute to retrieve the information needed to answer the natural language query.

Format the mongosh query in the following structure:

\`db.<collection name>.find({/* query */})\` or \`db.<collection name>.aggregate({/* query */})\``;

export const mongoshBaseSystemPrompt = `${mongoshSystemPromptGeneralInstruction}

Some general query-authoring tips:

${mongoshQueryAuthoringTips.map((tip, i) => `${i + 1}. ${tip}`).join("\n")}`;

export const genericFewShotExamples: FewShotExample[] = [
  {
    input: "books by Jane Austen",
    output: {
      content: `db.books.find({ author: "Jane Austen" }).toArray()`,
      chainOfThought:
        "Identify the 'books' collection. Filter documents where the 'author' field equals 'Jane Austen' using `{ author: 'Jane Austen' }`. Use `find()` with this query and convert the results to an array using `toArray()`.",
    },
  },

  {
    input: "number of users older than 18",
    output: {
      content: `db.users.find({ age: { $gt: 18 } }).count()`,
      chainOfThought:
        "Identify the 'users' collection. Filter documents where the 'age' field is greater than 18 using `{ age: { $gt: 18 } }`. Use `find()` with this query and get the count of matching documents using `count()`.",
    },
  },

  {
    input: "orders placed in the last 7 days",
    output: {
      content: `db.orders.find({ orderDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } }).toArray()`,
      chainOfThought:
        "Identify the 'orders' collection. Calculate the date 7 days ago using `new Date(new Date().setDate(new Date().getDate() - 7))`. Filter documents where 'orderDate' is greater than or equal to this date using `{ orderDate: { $gte: date7DaysAgo } }`. Use `find()` with this query and convert the results to an array using `toArray()`.",
    },
  },

  {
    input: "get the total number of books by each author",
    output: {
      content: `db.books.aggregate([ { $group: { _id: "$author", totalBooks: { $sum: 1 } } } ]).toArray()`,
      chainOfThought:
        "Identify the 'books' collection. Use `aggregate()` to group documents by the 'author' field. In the `$group` stage, set `_id` to `$author` and compute `totalBooks` by summing 1 for each document using `{ $sum: 1 }`. Convert the aggregation results to an array using `toArray()`.",
    },
  },

  {
    input: "find the average age of users in each city",
    output: {
      content: `db.users.aggregate([ { $group: { _id: "$city", averageAge: { $avg: "$age" } } } ]).toArray()`,
      chainOfThought:
        "Identify the 'users' collection. Use `aggregate()` to group documents by the 'city' field. In the `$group` stage, set `_id` to `$city` and compute `averageAge` by averaging the 'age' field using `{ $avg: '$age' }`. Convert the aggregation results to an array using `toArray()`.",
    },
  },

  {
    input: "top 5 products with the highest sales in the last month",
    output: {
      content: `db.sales.aggregate([
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

export const chainOfThoughtConsiderations = `Think step by step by step about the code in the answer before providing it. In your thoughts consider:
1. What operation(s) to use and why to use them.
2. What collections and fields are relevant to the query.
3. Which indexes you can use to improve performance.
4. Any specific transformations or projections.
5. Any other relevant considerations.`;
