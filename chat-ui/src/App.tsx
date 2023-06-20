import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Chatbot from "./Chatbot";

function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        background: "#001E2B",
        padding: "20px",
        height: "90vh",
      }}
    >
      <div
        style={{
          width: "650px",
        }}
      >
        <Chatbot />
      </div>
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
