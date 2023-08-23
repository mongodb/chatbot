import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import { Chatbot } from "./Chatbot";
import styles from "./App.module.css";
import { Overline, Link } from "@leafygreen-ui/typography";

function GitCommitLink() {
  const VITE_GIT_COMMIT = import.meta.env.VITE_GIT_COMMIT;
  console.log(
    "import.meta.env.VITE_GIT_COMMIT",
    import.meta.env.VITE_GIT_COMMIT
  );
  if (!VITE_GIT_COMMIT) {
    console.warn("VITE_GIT_COMMIT is not defined. Did you forget to define it in a build script?");
    return null;
  }
  return (
    <Overline
      style={{
        color: "white",
      }}
    >
      Git commit:{" "}
      <Link
        hideExternalIcon
        href={`https://github.com/mongodb/docs-chatbot/commit/${VITE_GIT_COMMIT}`}
      >
        <Overline
          style={{
            color: "white",
          }}
        >
          {VITE_GIT_COMMIT}
        </Overline>
      </Link>
    </Overline>
  );
}

function App() {
  return (
    <div className={styles.app_background}>
      <div className={styles.main_content}>
        <Chatbot />
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
