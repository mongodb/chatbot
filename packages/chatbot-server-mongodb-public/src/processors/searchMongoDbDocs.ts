export interface MongoDbDocsSearchResults {
  results: MongoDbDocsSearchResultItem[];
}
export interface MongoDbDocsSearchResultItem {
  preview?: string;
  title?: string;
  url: string;
}

export async function searchMongoDbDocs(q: string, limit?: number) {
  const urlEncodedQuery = encodeURIComponent(q);
  const res = await fetch(
    `https://docs-search-transport.mongodb.com/search?q=${urlEncodedQuery}&page=1`
  );
  let { results } = (await res.json()) as MongoDbDocsSearchResults;
  if (limit) {
    results = results.slice(0, limit);
  }
  return { results };
}
