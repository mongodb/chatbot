# MongoDB Chatbot UI

The official React client for https://www.npmjs.com/package/mongodb-chatbot-server

## Install

```
npm install mongodb-chatbot-ui
```

## Use the Component

```tsx
import Chatbot, {
  FloatingActionButtonTrigger,
  ModalView,
} from "mongodb-chatbot-ui"

function MyApp() {
  return (
    <div>
      <Chatbot>
        <FloatingActionButtonTrigger text="My MongoDB AI" />
        <ModalView
          initialMessageText="Welcome to MongoDB AI Assistant. What can I help you with?"
          initialMessageSuggestedPrompts={[
            "How do I create a new MongoDB Atlas cluster?",
            "Can MongoDB store lists of data?",
            "How does vector search work?"
          ]}
        />
      </Chatbot>
    </div>
  )
}
```

### Props

#### Chatbot Root Component

The `<Chatbot />` component is effectively a React context provider that wraps your chatbot. It accepts the following props:

| Prop                | Type                   | Description                                                                                      | Default                                                 |
|---------------------|------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `darkMode`          | `boolean?`             | If `true`, the UI renders in dark mode. This overrides any theme `darkMode` setting.             | The user's OS preference or theme value of `darkMode`.  |
| `serverBaseUrl`     | `string?`              | The base URL for the Chatbot API.                                                                | `https://knowledge.mongodb.com/api/v1`                  |
| `shouldStream`      | `boolean?`             | If `true`, responses are streamed with SSE. Otherwise the entire response is awaited.            | If the browser supports SSE, `true`, else `false`.      |
| `tck`               | `string?`              | An analytics identifier to add to the end of all hyperlinks.                                     | `"docs_chatbot"`                                        |
| `user`              | `{ name: string; }?`   | An object with information about the current user (if there is one).                             | `undefined`                                             |
| `children`          | `React.ReactElement`   | Trigger and View components for the chatbot, e.g. `FloatingActionButtonTrigger` and `ModalView`. |                                                         |

#### Trigger: Floating Action Button

The `<FloatingActionButtonTrigger />` component opens the Chatbot View when clicked. It accepts the following props:

| Prop                | Type                   | Description                                                                                      | Default                                                 |
|---------------------|------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `darkMode`          | `boolean?`             | If `true`, this renders in dark mode. This overrides any theme or provider `darkMode` setting.   | The user's OS preference or theme value of `darkMode`.  |
| `text`              | `string?`              | The text shown in the floating action button.                                                    | `"MongoDB AI"`                                          |

#### Trigger: Input Bar

The `<InputBarTrigger />` component opens the Chatbot View when the user sends their first message. It accepts the following props:

| Prop                | Type                   | Description                                                                                      | Default                                                 |
|---------------------|------------------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `darkMode`          | `boolean?`             | If `true`, this renders in dark mode. This overrides any theme or provider `darkMode` setting.   | The user's OS preference or theme value of `darkMode`.  |
| `suggestedPrompts`  | `string[]?`            | A list of suggested prompts that appear in the input bar dropdown menu.                          | If no prompts are specified, the dropdown is not shown. |

#### View: Modal Window

The `<ModalView />` component renders a chat message feed in a modal window. It accepts the following props:

| Prop                             | Type        | Description                                                                                      | Default                                                 |
|----------------------------------|-------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| `darkMode`                       | `boolean?`  | If `true`, this renders in dark mode. This overrides any theme or provider `darkMode` setting.   | The user's OS preference or theme value of `darkMode`.  |
| `initialMessageSuggestedPrompts` | `string[]?` | A list of suggested prompts that appear alongside the initial assistant message.                 | If no prompts are specified, then no prompts are shown. |
| `initialMessageText`             | `string?`   | The text content of an initial assistant message at the top of the message feed.                 | If no text is specified, then no message is shown.      |
| `showDisclaimer`                 | `boolean?`  | Controls whether or not to show a disclaimer about AI content above the message feed.            | `false`                                                 |
