/*

Evaluate the quality of the following prompt-expected answer pair across
multiple dimensions. Return your evaluation as a JSON object with numeric scores
from 1 (poor) to 5 (excellent). Use the following keys:

...

Now evaluate this pair:

PROMPT: "Is there a  limit for mongodb deletemany" EXPECTED ANSWER:
"db.collection.deleteMany() removes all documents that match the filter from a
collection.

NOTE: If you are deleting all documents in a large collection, it may be faster
to drop the collection and recreate it. Before dropping the collection, note all
indexes on the collection. You must recreate any indexes that existed in the
original collection. If the original collection was sharded, you must also shard
the recreated collection.

For more information on dropping a collection, see db.collection.drop()."

Return only the JSON object.


*/
