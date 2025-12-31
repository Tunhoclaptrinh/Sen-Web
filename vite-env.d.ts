/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  // Thêm các biến môi trường khác nếu có
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
