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
  MongoDbLegalDisclosure,
  mongoDbVerifyInformationMessage,
} from "mongodb-chatbot-ui";

function MyApp() {
  const suggestedPrompts = [
    "How do I create a new MongoDB Atlas cluster?",
    "Can MongoDB store lists of data?",
    "How does vector search work?",
  ];
  return (
    <div>
      <Chatbot
        name="MongoDB AI"
        maxInputCharacters={300}
      >
        <InputBarTrigger
          bottomContent={<MongoDbLegalDisclosure />}
          suggestedPrompts={suggestedPrompts}
        />
        <FloatingActionButtonTrigger text="Ask My MongoDB AI" />
        <ModalView
          disclaimer={<MongoDbLegalDisclosure />}
          initialMessageText="Welcome to my MongoDB AI Assistant. What can I help you with?"
          initialMessageSuggestedPrompts={suggestedPrompts}
          initialMessageReferences={[
            {
              url: "https://example.com/some-link",
              title: "Example reference link",
              metadata: {
                sourceType: "Article",
              },
            },
            {
              url: "https://example.com/another-link",
              title: "Another reference link",
              metadata: {
                sourceType: "Docs",
              },
            },
          ]}
          inputBottomText={mongoDbVerifyInformationMessage}
        />
      </Chatbot>
    </div>
  );
}
```
