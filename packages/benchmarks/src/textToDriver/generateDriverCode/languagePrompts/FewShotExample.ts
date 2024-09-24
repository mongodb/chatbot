export interface FewShotExample {
  input: string;
  output: {
    content: string;
    chainOfThought: string;
  };
}
