import "./fonts.module.css";
import styles from "./App.module.css";
import { useState } from "react";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import { Chatbot } from "./Chatbot";
import { canUseServerSentEvents } from "./utils";
import { Overline, Link } from "@leafygreen-ui/typography";
import Toggle from "@leafygreen-ui/toggle";

function App() {
  const [shouldStream, setShouldStream] = useState(canUseServerSentEvents());
  return (
    <div className={styles.app_background}>
      <div className={styles.main_content}>
        <Chatbot shouldStream={shouldStream} />
      </div>
      <StreamingToggle
        checked={shouldStream}
        toggle={() => setShouldStream((s) => !s)}
      />
      <GitCommitLink />
    </div>
  );
}

function StreamingToggle(props: { checked: boolean; toggle: () => void }) {
  return (
    <div className={styles.streaming_toggle}>
      <Toggle
        size="default"
        aria-labelledby="streaming-toggle-label"
        checked={props.checked}
        onChange={() => {
          props.toggle();
        }}
      />
      <Overline
        role="label"
        id="streaming-toggle-label"
        style={{
          color: "white",
        }}
      >
        Stream Responses
      </Overline>
    </div>
  );
}

function GitCommitLink() {
  const VITE_GIT_COMMIT = import.meta.env.VITE_GIT_COMMIT;
  const { contextDarkMode: darkMode } = useDarkModeContext();
  const color = darkMode ? "white" : "black";
  if (!VITE_GIT_COMMIT) {
    console.warn(
      "VITE_GIT_COMMIT is not defined. Did you forget to define it in a build script?"
    );
    return null;
  }

  return (
    <Overline style={{ color }}>
      Git commit:{" "}
      <Link
        hideExternalIcon
        href={`https://github.com/mongodb/docs-chatbot/commit/${VITE_GIT_COMMIT}`}
      >
        <Overline style={{ color }}>{VITE_GIT_COMMIT}</Overline>
      </Link>
    </Overline>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider darkMode={false}>
      <App />
    </LeafyGreenProvider>
  );
}
