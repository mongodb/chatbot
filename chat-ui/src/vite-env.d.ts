/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SERVER_BASE_URL: string;
  readonly VITE_QA?: string;
  readonly VITE_GIT_COMMIT?: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
