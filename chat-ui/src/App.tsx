import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Chatbot from "./Chatbot";
import styles from "./App.module.css"

function App() {
  return (
    <div className={styles.app_background}>
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
