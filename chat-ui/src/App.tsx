import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import CallToActionInput from "./CallToActionInput";
import { Message } from "./Message";
import createMessage from "./createMessage";

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
        <CallToActionInput showModal={true} />
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
