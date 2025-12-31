interface EnvConfig {
    API_BASE_URL: string;
    API_TIMEOUT: number;
    ENABLE_MOCK: boolean;
    ENABLE_LOGGING: boolean;
    APP_NAME: string;
    APP_VERSION: string;
}

const env: EnvConfig = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    ENABLE_MOCK: import.meta.env.VITE_ENABLE_MOCK === 'true',
    ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true' || import.meta.env.DEV,
    APP_NAME: import.meta.env.VITE_APP_NAME || 'SEN Web',
    APP_VERSION: import.meta.env.VITE_APP_VERSION || '2.0.0',
};

export default env;
