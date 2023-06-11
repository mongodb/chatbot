import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import ChatbotModalCard from "./Modal";
import ConversationProvider from "./ConversationProvider";
import CallToActionInput from "./CallToActionInput";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "650px",
        }}
      >
        <CallToActionInput showModal={false} />
      </div>
      <ChatbotModalCard />
      <div
        style={{
          width: "650px",
        }}
      >
        <CallToActionInput showModal={true} />
      </div>
    </div>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider>
      <ConversationProvider>
        <App />
      </ConversationProvider>
    </LeafyGreenProvider>
  );
}
