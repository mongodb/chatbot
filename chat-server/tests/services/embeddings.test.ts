import { embeddings } from '../../src/services/embeddings';

describe('Embeddings', () => {
  test('should return an array of numbers of length 1536', async () => {
    const embedding = await embeddings.createEmbedding({ text: 'Hello world', userIp: '' });
    expect(embedding).toHaveLength(1536);
  });
  test('should return an error if the input too large', async () => {
    const input = 'Hello world! '.repeat(8192);
    await expect(embeddings.createEmbedding({ text: input, userIp: '' })).rejects.toThrow();
  });
});
