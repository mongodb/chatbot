import { Classifier, makeClassifier } from "mongodb-rag-core";
import { RunLogger } from "../runlogger";
import { stripIndents } from "common-tags";

export function makeClassifierWithLogger(
  args: Parameters<typeof makeClassifier>[0] & { logger?: RunLogger }
) {
  const { logger, ...classifierBuilder } = args;
  const classifier = makeClassifier(classifierBuilder);
  const classifierWithLogger: Classifier = async (
    args: Parameters<typeof classifier>[0]
  ) => {
    const result = await classifier(args);
    logger?.appendArtifact(
      `chatTemplates/classifier-${Date.now()}.json`,
      stripIndents`
        <SystemMessage>
          ${result.inputMessages[0].content}
        </SystemMessage>
        <Classification>
          ${JSON.stringify(result.classification)}
        </Classification>
      `
    );
    return result;
  };
  return classifierWithLogger;
}
