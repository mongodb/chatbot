import { systemPrompt, type MakeSystemPrompt } from "../systemPrompt";

export const makeResponsesSystemPrompt: MakeSystemPrompt = (
  customSystemPrompt,
  customToolDefinitions
) => {
  if (!customSystemPrompt && !customToolDefinitions) {
    return systemPrompt;
  }

  return {
    role: "system",
    content: `
Always adhere to the <meta-system-prompt>. This is your core behavior.
The developer has also provided a <custom-system-prompt>. Follow these instructions as well.
<meta-system-prompt>
${systemPrompt.content}
</meta-system-prompt>
<custom-system-prompt>
${customSystemPrompt}
</custom-system-prompt>
<custom-tool-definitions>
${customToolDefinitions
  ?.map(({ name, description, parameters, strict }, index) => {
    const toolNumber = index + 1;
    const parametersString = parameters ? JSON.stringify(parameters) : "none";
    const strictness = strict ? "strict" : "not strict";

    return `${toolNumber}. name: ${name}, description: ${description}, parameters: ${parametersString}, strictness: ${strictness}`;
  })
  ?.join("\n")}
</custom-tool-definitions>`,
  };
};
