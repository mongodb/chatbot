import "./fonts.module.css";
import styles from "./App.module.css";
import LeafyGreenProvider, {
  useDarkModeContext,
} from "@leafygreen-ui/leafygreen-provider";
import { Overline, Link } from "@leafygreen-ui/typography";
import Toggle from "@leafygreen-ui/toggle";
import { Chatbot } from "./Chatbot";
import { DocsChatbot } from "./DocsChatbot";
import { DevCenterChatbot } from "./DevCenterChatbot";
import TextInput from "@leafygreen-ui/text-input";
import { useLocalStorage } from "./useLocalStorage";

const prefersDarkMode = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

function App() {
  // const [shouldStream, setShouldStream] = useState(canUseServerSentEvents());
  const shouldStream = false;
  const [publicApiKey, setPublicApiKey] = useLocalStorage("publicApiKey", "");
  const [privateApiKey, setPrivateApiKey] = useLocalStorage("privateApiKey", "");
  const [organizationId, setOrganizationId] = useLocalStorage("organizationId", "");
  const [projectId, setProjectId] = useLocalStorage("projectId", "");
  const [clusterId, setClusterId] = useLocalStorage("clusterId", "");
  const { contextDarkMode: darkMode = false, setDarkMode } =
    useDarkModeContext();
  const app_background = (darkMode: boolean) => {
    return `${styles.app_background} ${
      darkMode ? styles.background_dark : styles.background_light
    }`;
  };


  const apiCredentials = {
    "atlas-admin-api": {
      publicApiKey,
      privateApiKey,
      organizationId,
      projectId,
      clusterId,
    },
  };

  return (
    <div className={app_background(darkMode)}>
      <div className={styles.main_content}>
        <Chatbot
          shouldStream={shouldStream}
          darkMode={darkMode}
          apiCredentials={apiCredentials}
        >
          <DocsChatbot />
        </Chatbot>
        <Chatbot
          shouldStream={shouldStream}
          darkMode={darkMode}
          apiCredentials={apiCredentials}
        >
          <DevCenterChatbot />
        </Chatbot>
      </div>
      <Controls>
        <TextInputControl
          label="Atlas Public API Key"
          value={publicApiKey}
          onChange={(e) => setPublicApiKey(e.target.value)}
        />
        <TextInputControl
          label="Atlas Private API Key"
          value={privateApiKey}
          onChange={(e) => setPrivateApiKey(e.target.value)}
        />
        <TextInputControl
          label="Atlas Organization ID"
          value={organizationId}
          onChange={(e) => setOrganizationId(e.target.value)}
        />
        <TextInputControl
          label="Atlas Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <TextInputControl
          label="Atlas Cluster ID"
          value={clusterId}
          onChange={(e) => setClusterId(e.target.value)}
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

type TextInputControlProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  darkMode?: boolean;
}

function TextInputControl (props: TextInputControlProps) {
  return (
    <TextInput
      className={styles.text_input_control}
      label={props.label}
      value={props.value}
      onChange={props.onChange}
    />
  );
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
    <div className={styles.toggle_control}>
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
