export interface OrchestrateArguments {}

export interface Orchestrator {
  run: (args: OrchestrateArguments) => string;
}

export interface MakeOrchestratorOptions {}

export function makeOrchestrator(options: MakeOrchestratorOptions = {}): Orchestrator {
  return {
    run(args) {
      // TODO: Actually grade the input
      return "";
    }
  };
}
