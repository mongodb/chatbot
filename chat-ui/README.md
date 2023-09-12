# MongoDB Chatbot UI

## Install

```
npm install mongodb-chatbot-ui
```

## Use the Component

```ts
import Chatbot from "mongodb-chatbot-ui"

function MyComponent() {
  return (
    <div>
      <Chatbot />
    </div>
  )
}
```

### Props

The `<Chatbot />` component accepts the following props:

| Prop                | Type        | Description                                                                           | Default                                                 |
|---------------------|-------------|---------------------------------------------------------------------------------------|---------------------------------------------------------|
| `darkMode`          | `boolean?`  | If `true`, the UI renders in dark mode. This overrides any theme `darkMode` setting.  | The user's OS preference or theme value of `darkMode`.  |
| `serverBaseUrl`     | `string?`   | The base URL for the Chatbot API.                                                     | `https://knowledge.mongodb.com/api/v1`                  |
| `shouldStream`      | `boolean?`  | If `true`, responses are streamed with SSE. Otherwise the entire response is awaited. | If the browser supports SSE, `true`, else `false`.      |
| `suggestedPrompts`  | `string[]?` | A list of suggested prompts that appear in the input bar dropdown menu.               | If no prompts are specified, the dropdown is not shown. |
