export function stringifyConversation(
  messages: { role: string; content: string }[]
) {
  return messages.length
    ? messages
        .filter((message) => message.role !== "system") // remove system message
        .reduce((acc, message) => {
          return `${acc}\n\n${message.role.toUpperCase()}:\n${message.content}`;
        }, "") // convert conversation to string
        .trim() // remove whitespace
    : "No previous conversation history.";
}
