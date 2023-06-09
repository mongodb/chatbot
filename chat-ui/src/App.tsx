import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import ChatbotModal from "./Modal";
import ConversationProvider from "./ConversationProvider";
import CallToActionInput from "./CallToActionInput";

function App() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px"
    }}>
      <div style={{
        width: "650px"
      }}>
        <CallToActionInput />
      </div>
      <ConversationProvider>
        <ChatbotModal />
      </ConversationProvider>
    </div>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider>
      <App />
    </LeafyGreenProvider>
  );
}
