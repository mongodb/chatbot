export interface MongoDbDocsSearchResults {
  results: MongoDbDocsSearchResultItem[];
}
export interface MongoDbDocsSearchResultItem {
  preview?: string;
  title?: string;
  url: string;
}

export async function searchMongoDbDocs(q: string) {
  const urlEncodedQuery = encodeURIComponent(q);
  const res = await fetch(
    `https://docs-search-transport.mongodb.com/search?q=${urlEncodedQuery}&page=1`
  );
  return (await res.json()) as MongoDbDocsSearchResults;
}
