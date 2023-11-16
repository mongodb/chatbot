export interface RefineArguments {
  /**
   * The input string to refine.
   */
  input: string;

  /**
   * The refinement to apply to the input string.
   */
  refinement: string;
}

export interface Refiner {
  /**
   * Refines a provided input based on a change description.
   */
  refine(args: RefineArguments): string;
}

export interface MakeRefinerOptions {

}

export function makeRefiner(options: MakeRefinerOptions = {}): Refiner {
  return {
    refine(args) {
      // TODO: Actually refine the input
      return args.input;
    }
  };
}
