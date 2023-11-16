export interface Transformation {
  /**
   * A text description of the transformation to apply to the input string.
   */
  description: string;
}

export interface TransformArguments {
  /**
   * The input string to transform.
   */
  input: string;

  /**
   * The transformation to apply to the input string.
   */
  transformation: Transformation;
}

export interface Transformer {
  transform(args: TransformArguments): string;
}

export interface MakeTransformerOptions {}

export function makeTransformer(options: MakeTransformerOptions = {}): Transformer {
  return {
    transform(args) {
      // TODO: Actually transform the input
      return args.input;
    }
  };
}
