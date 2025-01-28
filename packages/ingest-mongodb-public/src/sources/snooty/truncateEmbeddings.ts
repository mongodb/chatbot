export function truncateEmbeddings(body: string): string {
  const embeddingRegex =
    /([-]?0\.\d+d?),\s*([-]?0\.\d+d?)(?:\s*,\s*[-]?0\.\d+d?)*/g;
  return body.replace(embeddingRegex, (...matches) => {
    const [_wholeEmbedding, firstFloat, secondFloat] = matches;
    return `${firstFloat}, ${secondFloat}, ...`;
  });
}
