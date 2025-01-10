import "./fonts.module.css";
import styles from "./App.module.css";
import { useState } from "react";
import LeafyGreenProvider, {
  useDarkModeContext,
} from "@leafygreen-ui/leafygreen-provider";
import { canUseServerSentEvents } from "./utils";
import { Overline, Link } from "@leafygreen-ui/typography";
import Toggle from "@leafygreen-ui/toggle";
import { Chatbot } from "./Chatbot";
import { DocsChatbot } from "./DocsChatbot";
import { DevCenterChatbot } from "./DevCenterChatbot";
import { HotkeyTrigger } from "./HotkeyTrigger";
import { makePrioritizeReferenceDomain } from "./references";

const prefersDarkMode = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

const SUGGESTED_PROMPTS = [
  "How do you deploy a free cluster in Atlas?",
  "How do I register for Atlas?",
  "How do I get started with MongoDB?",
  "Why should I use Atlas Search?",
];

const serverBaseUrl =
  import.meta.env.VITE_SERVER_BASE_URL ?? "http://localhost:3000/api/v1";

const initialMessageReferences = [
  {
    url: "https://docs.mongodb.com/",
    title: "MongoDB Documentation",
    metadata: {
      sourceType: "Docs",
    },
  },
  {
    url: "https://university.mongodb.com/",
    title: "MongoDB University",
    metadata: {
      sourceType: "Learn",
    },
  },
  {
    url: "https://developer.mongodb.com/",
    title: "MongoDB Developer Hub",
    metadata: {
      sourceType: "Article",
    },
  },
];

function App() {
  const [shouldStream, setShouldStream] = useState(canUseServerSentEvents());
  const { contextDarkMode: darkMode = false, setDarkMode } =
    useDarkModeContext();
  const app_background = (darkMode: boolean) => {
    return `${styles.app_background} ${
      darkMode ? styles.background_dark : styles.background_light
    }`;
  };

  return (
    <div className={app_background(darkMode)}>
      <div className={styles.main_content}>
        <Chatbot
          name="MongoDB AI (Docs)"
          serverBaseUrl={serverBaseUrl}
          shouldStream={shouldStream}
          darkMode={darkMode}
          fetchOptions={{ credentials: "include" }}
          onOpen={() => {
            console.log("Docs Chatbot opened");
          }}
          onClose={() => {
            console.log("Docs Chatbot closed");
          }}
          maxInputCharacters={3000}
        >
          <DocsChatbot suggestedPrompts={SUGGESTED_PROMPTS} />
        </Chatbot>
        <Chatbot
          name="MongoDB AI (Dev Center)"
          serverBaseUrl={serverBaseUrl}
          shouldStream={shouldStream}
          darkMode={darkMode}
          fetchOptions={{ credentials: "include" }}
          onOpen={() => {
            console.log("Dev Center Chatbot opened");
          }}
          onClose={() => {
            console.log("Dev Center Chatbot closed");
          }}
          sortMessageReferences={makePrioritizeReferenceDomain([
            "https://mongodb.com/developer",
            "https://www.mongodb.com/developer",
          ])}
        >
          <DevCenterChatbot
            initialMessageSuggestedPrompts={SUGGESTED_PROMPTS}
            initialMessageReferences={initialMessageReferences}
          />
          <HotkeyTrigger onKey="/" />
        </Chatbot>
      </div>
      <Controls>
        <ToggleControl
          checked={shouldStream}
          labelId="streaming"
          text="Stream Responses"
          toggle={() => setShouldStream((s) => !s)}
        />
        <ToggleControl
          checked={darkMode}
          labelId="darkMode"
          text="Dark Mode"
          toggle={() => setDarkMode(!darkMode)}
        />
        <GitCommitLink />
      </Controls>
    </div>
  );
}

function Controls(props: { children: React.ReactNode }) {
  return <div className={styles.controls_container}>{props.children}</div>;
}

type ToggleControlProps = {
  checked: boolean;
  labelId: string;
  text: string;
  toggle: () => void;
  darkMode?: boolean;
};

function ToggleControl(props: ToggleControlProps) {
  const { contextDarkMode: darkMode = props.darkMode ?? false } =
    useDarkModeContext();
  const label = `${props.labelId}-toggle-control-label`;
  return (
    <div className={styles.streaming_toggle}>
      <Toggle
        darkMode={darkMode}
        size="default"
        aria-labelledby={label}
        checked={props.checked}
        onChange={() => {
          props.toggle();
        }}
      />
      <Overline
        role="label"
        id={label}
        style={{
          color: darkMode ? "white" : "black",
        }}
      >
        {props.text}
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
        href={`https://github.com/mongodb/chatbot/commit/${VITE_GIT_COMMIT}`}
      >
        <Overline style={{ color }}>{VITE_GIT_COMMIT}</Overline>
      </Link>
    </Overline>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider darkMode={prefersDarkMode()}>
      <App />
    </LeafyGreenProvider>
  );
}
