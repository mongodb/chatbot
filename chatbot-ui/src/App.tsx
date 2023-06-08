import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import ChatbotModal from "./Modal";
import ConversationProvider from "./ConversationProvider";

function App() {
  return (
    <ConversationProvider>
      <ChatbotModal />
    </ConversationProvider>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider>
      <App />
    </LeafyGreenProvider>
  );
}
