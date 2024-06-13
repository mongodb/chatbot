import './App.css';
import Chatbot, {
  FloatingActionButtonTrigger,
  InputBarTrigger,
  ModalView,
} from "mongodb-chatbot-ui";

const suggestedPrompts = [
  "Why should I use the MongoDB Chatbot Framework?",
  "How does the framework use Atlas Vector Search?",
  "Do you support using LLMs from OpenAI?",
];

function App() {
  return (
    <div className="App">
      
      <header className="App-header">
      <Chatbot darkMode={true} serverBaseUrl="http://localhost:9000/api/v1" shouldStream={false} isExperimental={false}>
        <>
          <InputBarTrigger suggestedPrompts={suggestedPrompts} />
          {/* <FloatingActionButtonTrigger text="My MongoDB AI" /> */}
          <ModalView
            initialMessageText="Welcome to MongoDB AI Assistant. What can I help you with?"
            initialMessageSuggestedPrompts={suggestedPrompts}
          />
        </>
      </Chatbot>
      </header>
    </div>
  );
}

export default App;
