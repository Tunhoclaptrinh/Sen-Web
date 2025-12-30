/// <reference types="vite/client" />

const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
};

export default env;