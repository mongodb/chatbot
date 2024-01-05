# Chatbot UI

The MongoDB Chatbot UI is a React.js component library that you can use to build a chatbot UI.

Currently, it's focused on internal MongoDB use cases. However, we may make it more generic in the future if there is sufficient external interest.

<details>

<summary> Demo GIF </summary>

![Chatbot UI Demo GIF](/img/ui-demo.gif)

</details>

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
      <Chatbot>
        <InputBarTrigger suggestedPrompts={suggestedPrompts} />
        <FloatingActionButtonTrigger text="My MongoDB AI" />
        <ModalView
          initialMessageText="Welcome to MongoDB AI Assistant. What can I help you with?"
          initialMessageSuggestedPrompts={suggestedPrompts}
        />
      </Chatbot>
    </div>
  );
}
```

## Components

The `mongodb-chatbot-ui` package exports the following components.

### `Chatbot` Root Component

The `<Chatbot />` component is effectively a React context provider that wraps your chatbot. It accepts the following props:

| Prop            | Type                             | Description                                                                                      | Default                                                |
| --------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `darkMode`      | `boolean?`                       | If `true`, the UI renders in dark mode. This overrides any theme `darkMode` setting.             | The user's OS preference or theme value of `darkMode`. |
| `serverBaseUrl` | `string?`                        | The base URL for the Chatbot API.                                                                | `https://knowledge.mongodb.com/api/v1`                 |
| `shouldStream`  | `boolean?`                       | If `true`, responses are streamed with SSE. Otherwise the entire response is awaited.            | If the browser supports SSE, `true`, else `false`.     |
| `tck`           | `string?`                        | An analytics identifier to add to the end of all hyperlinks.                                     | `"docs_chatbot"`                                       |
| `user`          | `{ name: string; }?`             | An object with information about the current user (if there is one).                             | `undefined`                                            |
| `children`      | `ReactElement \| ReactElement[]` | Trigger and View components for the chatbot, e.g. `FloatingActionButtonTrigger` and `ModalView`. |                                                        |

### `FloatingActionButtonTrigger`

The `<FloatingActionButtonTrigger />` component opens the `<ModalView />` when clicked. It accepts the following props:

| Prop       | Type       | Description                                                                                    | Default                                                |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `darkMode` | `boolean?` | If `true`, this renders in dark mode. This overrides any theme or provider `darkMode` setting. | The user's OS preference or theme value of `darkMode`. |
| `text`     | `string?`  | The text shown in the floating action button.                                                  | `"MongoDB AI"`                                         |

### `InputBarTrigger`

The `<InputBarTrigger />` component opens the `<ModalView />` when the user sends their first message. It accepts the following props:

| Prop               | Type        | Description                                                                                    | Default                                                 |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `darkMode`         | `boolean?`  | If `true`, this renders in dark mode. This overrides any theme or provider `darkMode` setting. | The user's OS preference or theme value of `darkMode`.  |
| `suggestedPrompts` | `string[]?` | A list of suggested prompts that appear in the input bar dropdown menu.                        | If no prompts are specified, the dropdown is not shown. |

### `ModalView`

The `<ModalView />` component renders a chat message feed in a modal window. It accepts the following props:

| Prop                             | Type        | Description                                                                                    | Default                                                 |
| -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `darkMode`                       | `boolean?`  | If `true`, this renders in dark mode. This overrides any theme or provider `darkMode` setting. | The user's OS preference or theme value of `darkMode`.  |
| `initialMessageSuggestedPrompts` | `string[]?` | A list of suggested prompts that appear alongside the initial assistant message.               | If no prompts are specified, then no prompts are shown. |
| `initialMessageText`             | `string?`   | The text content of an initial assistant message at the top of the message feed.               | If no text is specified, then no message is shown.      |
| `showDisclaimer`                 | `boolean?`  | Controls whether or not to show a disclaimer about AI content above the message feed.          | `false`                                                 |
