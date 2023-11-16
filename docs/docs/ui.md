# Chat UI

The MongoDB Chatbot UI is a React.js component library that you can use to build a chatbot UI.

Currently, it's focused on internal MongoDB use cases. However, we may make it more generic in the future if there is sufficient external interest.

## Install

Install the `mongodb-chatbot-ui` package from npm. This contains the React.js components that you can use to build a chatbot UI.

```shell
npm install mongodb-chatbot-ui
```

## The `Chatbot` Component

The Chatbot component is the main component of the library. It renders the entire chatbot UI.
You can configure it to work with your chat server API.

<details>

<summary> Demo GIF </summary>

![Chatbot UI Demo GIF](/img/ui-demo.gif)

</details>

### Usage

```ts
import Chatbot from "mongodb-chatbot-ui";

function MyComponent() {
  return (
    <div>
      <Chatbot />
    </div>
  );
}
```

### Props

The `<Chatbot />` component accepts the following props:

| Prop               | Type        | Description                                                                           | Default                                                 |
| ------------------ | ----------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `darkMode`         | `boolean?`  | If `true`, the UI renders in dark mode. This overrides any theme `darkMode` setting.  | The user's OS preference or theme value of `darkMode`.  |
| `serverBaseUrl`    | `string?`   | The base URL for the Chatbot API.                                                     | `https://knowledge.mongodb.com/api/v1`                  |
| `shouldStream`     | `boolean?`  | If `true`, responses are streamed with SSE. Otherwise the entire response is awaited. | If the browser supports SSE, `true`, else `false`.      |
| `suggestedPrompts` | `string[]?` | A list of suggested prompts that appear in the input bar dropdown menu.               | If no prompts are specified, the dropdown is not shown. |
| `tck`              | `string?`   | An analytics identifier to add to the end of all hyperlinks.                          | `"docs_chatbot"`                                        |
