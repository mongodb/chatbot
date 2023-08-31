import "./fonts.module.css";
import styles from "./App.module.css";
import LeafyGreenProvider, {
  useDarkModeContext,
} from "@leafygreen-ui/leafygreen-provider";
import { Chatbot } from "./Chatbot";
import { Overline, Link } from "@leafygreen-ui/typography";

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

function App() {
  const { contextDarkMode } = useDarkModeContext();
  const backgroundColor = contextDarkMode
    ? styles.app_background_dark
    : styles.app_background_light;

  return (
    <div className={`${styles.app_background} ${backgroundColor}`}>
      <div className={styles.main_content}>
        <Chatbot darkMode={contextDarkMode} />
      </div>
      <GitCommitLink />
    </div>
  );
}

export default function LGApp() {
  return (
    <LeafyGreenProvider darkMode={false}>
      <App />
    </LeafyGreenProvider>
  );
}
