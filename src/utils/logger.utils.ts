// Logger Utility for Production

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

/**
 * Logger utility that only logs in development mode
 */
export const logger = {
    /**
     * Log info message (only in dev)
     */
    log(...args: any[]): void {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Log error message
     * In production: only log to external service
     * In development: log to console
     */
    error(...args: any[]): void {
        if (isDev) {
            console.error(...args);
        }

        // TODO: Send to external logging service in production (e.g., Sentry)
        if (isProd) {
            // Example: Sentry.captureException(args[0]);
        }
    },

    /**
     * Log warning message (only in dev)
     */
    warn(...args: any[]): void {
        if (isDev) {
            console.warn(...args);
        }
    },

    /**
     * Log debug message (only in dev)
     */
    debug(...args: any[]): void {
        if (isDev) {
            console.debug(...args);
        }
    },

    /**
     * Log info message (only in dev)
     */
    info(...args: any[]): void {
        if (isDev) {
            console.info(...args);
        }
    },
};

/**
 * Create a namespaced logger
 */
export const createLogger = (namespace: string) => ({
    log: (...args: any[]) => logger.log(`[${namespace}]`, ...args),
    error: (...args: any[]) => logger.error(`[${namespace}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${namespace}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${namespace}]`, ...args),
    info: (...args: any[]) => logger.info(`[${namespace}]`, ...args),
});
