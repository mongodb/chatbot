import { systemPrompt, type MakeSystemPrompt } from "../systemPrompt";

export const makeResponsesSystemPrompt: MakeSystemPrompt = (
  customSystemPrompt
) => {
  if (!customSystemPrompt) {
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
</custom-system-prompt>`,
  };
};
