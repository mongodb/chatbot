export function cosineSimilarity(a: number[], b: number[]) {
  // https://towardsdatascience.com/how-to-build-a-textual-similarity-analysis-web-app-aa3139d4fb71

  const magnitudeA = Math.sqrt(dotProduct(a, a));
  const magnitudeB = Math.sqrt(dotProduct(b, b));
  if (magnitudeA && magnitudeB) {
    // https://towardsdatascience.com/how-to-measure-distances-in-machine-learning-13a396aa34ce
    return dotProduct(a, b) / (magnitudeA * magnitudeB);
  } else {
    return 0;
  }
}

function dotProduct(a: number[], b: number[]) {
  return a.reduce((acc, cur, i) => acc + cur * b[i], 0);
}
