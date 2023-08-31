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

| Prop            | Type       | Description                                                                         | Default                                            |
|-----------------|------------|-------------------------------------------------------------------------------------|----------------------------------------------------|
| `serverBaseUrl` | `string?`  | The base URL for the Chatbot API.                                                   | `https://knowledge.mongodb.com/api/v1`             |
| `shouldStream`  | `boolean?` | If `true`, responses are stream with SSE. Otherwise the entire response is awaited. | If the browser supports SSE, `true`, else `false`. |
