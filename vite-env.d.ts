/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REGISTRY_ADDRESS: string;
  readonly VITE_XRPL_NETWORK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
