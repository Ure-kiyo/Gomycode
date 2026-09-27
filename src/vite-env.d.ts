/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When set, the app talks to a real backend via `src/services/httpApi.ts`. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
