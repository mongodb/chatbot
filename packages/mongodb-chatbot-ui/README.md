# MongoDB Chatbot UI

The React components for the [MongoDB Chatbot Framework](https://mongodb.github.io/chatbot/).

## Documentation

To learn more about the MongoDB Chatbot UI components, check out the [documentation](https://mongodb.github.io/chatbot/ui/).

For more information about the available components and props, refer to [the documentation](https://mongodb.github.io/chatbot/ui/).

## Install

Install the `mongodb-chatbot-ui` package from npm. This contains the React.js components that you can use to build a chatbot UI.

```shell
npm install mongodb-chatbot-ui
```

## Usage

```tsx
import Chatbot, {
  FloatingActionButtonTrigger,
  InputBarTrigger,
  ModalView,
} from "mongodb-chatbot-ui";

function MyApp() {
  const suggestedPrompts = [
    "How do I create a new MongoDB Atlas cluster?",
    "Can MongoDB store lists of data?",
    "How does vector search work?",
  ];
  return (
    <div>
      <Chatbot name="MongoDB AI">
        <InputBarTrigger suggestedPrompts={suggestedPrompts} />
        <FloatingActionButtonTrigger text="Ask My Custom MongoDB AI" />
        <ModalView
          initialMessageText="Welcome to my custom MongoDB AI Assistant. What can I help you with?"
          initialMessageSuggestedPrompts={suggestedPrompts}
        />
      </Chatbot>
    </div>
  );
}
```
