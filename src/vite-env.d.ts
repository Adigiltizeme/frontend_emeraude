/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN?: string;
  readonly VITE_API_URL?: string;
  /** Google Analytics 4 (facultatif) : chargé uniquement après consentement aux cookies. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
