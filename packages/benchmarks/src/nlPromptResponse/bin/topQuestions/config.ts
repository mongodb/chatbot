import { BenchmarkConfig } from "../../runNlPromptResponseBenchmark";
import { docs100Config } from "../docs100/config";
import { techSupportConfig } from "../techSupport/config";
import { productKnowledgeConfig } from "../productKnowledge/config";

const projectName = "top-questions-prompt-completion";

export const topQuestionsConfig: BenchmarkConfig = {
  datasets: [
    ...docs100Config.datasets,
    ...techSupportConfig.datasets,
    ...productKnowledgeConfig.datasets,
  ],
  projectName,
  experimentBaseName: "top-questions",
};
