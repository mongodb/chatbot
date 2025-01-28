export function truncateEmbeddings(body: string): string {
  const embeddingRegex =
    /([-]?0\.\d+d?)(?:\s*,\s*([+\-]?0\.\d+d?)?)*([-]?0\.\d+d?)/;
  return body.replace(embeddingRegex, (...matches) => {
    const firstEmbedding = matches[1];
    const lastEmbedding = matches[matches.length - 3];

    return `${firstEmbedding}, ..., ${lastEmbedding}`;
  });
}
