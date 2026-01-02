// Error Handling Utilities

import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

/**
 * API Error Response Interface
 */
export interface ApiErrorResponse {
    success: false;
    message: string;
    statusCode?: number;
    errors?: ApiError[];
}

/**
 * Parsed Error Interface
 */
export interface ParsedError {
    message: string;
    statusCode?: number;
    errors?: ApiError[];
    originalError?: any;
}

/**
 * Error Parser
 */
export const errorParser = {
    /**
     * Parse Axios error
     */
    parseAxiosError(error: AxiosError<ApiErrorResponse>): ParsedError {
        // Network error
        if (!error.response) {
            return {
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                statusCode: 0,
                originalError: error,
            };
        }

        // API error response
        const { data, status } = error.response;

        return {
            message: data?.message || this.getDefaultMessage(status),
            statusCode: status,
            errors: data?.errors,
            originalError: error,
        };
    },

    /**
     * Parse generic error
     */
    parseError(error: unknown): ParsedError {
        // Axios error
        if (this.isAxiosError(error)) {
            return this.parseAxiosError(error);
        }

        // Error object
        if (error instanceof Error) {
            return {
                message: error.message || 'Đã xảy ra lỗi không xác định',
                originalError: error,
            };
        }

        // String error
        if (typeof error === 'string') {
            return {
                message: error,
                originalError: error,
            };
        }

        // Unknown error
        return {
            message: 'Đã xảy ra lỗi không xác định',
            originalError: error,
        };
    },

    /**
     * Check if error is Axios error
     */
    isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
        return (error as AxiosError).isAxiosError === true;
    },

    /**
     * Get default error message by status code
     */
    getDefaultMessage(statusCode: number): string {
        const messages: Record<number, string> = {
            400: 'Yêu cầu không hợp lệ',
            401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
            403: 'Bạn không có quyền truy cập',
            404: 'Không tìm thấy dữ liệu',
            409: 'Dữ liệu đã tồn tại',
            422: 'Dữ liệu không hợp lệ',
            429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau',
            500: 'Lỗi server. Vui lòng thử lại sau',
            502: 'Server tạm thời không khả dụng',
            503: 'Dịch vụ đang bảo trì',
        };

        return messages[statusCode] || 'Đã xảy ra lỗi không xác định';
    },

    /**
     * Format validation errors
     */
    formatValidationErrors(errors?: ApiError[]): string {
        if (!errors || errors.length === 0) return '';

        return errors
            .map((error) => {
                if (error.field) {
                    return `${error.field}: ${error.message}`;
                }
                return error.message;
            })
            .join('\n');
    },
};

/**
 * Error Logger
 */
export const errorLogger = {
    /**
     * Log error to console
     */
    log(error: ParsedError, context?: string): void {
        const prefix = context ? `[${context}]` : '[Error]';
        console.error(prefix, {
            message: error.message,
            statusCode: error.statusCode,
            errors: error.errors,
            originalError: error.originalError,
        });
    },

    /**
     * Log error to external service (e.g., Sentry)
     */
    logToService(error: ParsedError, context?: string): void {
        // TODO: Implement external logging service
        // Example: Sentry.captureException(error.originalError);
        this.log(error, context);
    },
};

/**
 * Error Handler
 */
export const errorHandler = {
    /**
     * Handle error and return user-friendly message
     */
    handle(error: unknown, context?: string): string {
        const parsedError = errorParser.parseError(error);
        errorLogger.log(parsedError, context);

        // Format validation errors if present
        if (parsedError.errors && parsedError.errors.length > 0) {
            const validationErrors = errorParser.formatValidationErrors(parsedError.errors);
            return `${parsedError.message}\n${validationErrors}`;
        }

        return parsedError.message;
    },

    /**
     * Handle error and show notification
     */
    handleWithNotification(
        error: unknown,
        showNotification: (message: string, type: 'error') => void,
        context?: string
    ): void {
        const message = this.handle(error, context);
        showNotification(message, 'error');
    },

    /**
     * Check if error is authentication error
     */
    isAuthError(error: unknown): boolean {
        const parsedError = errorParser.parseError(error);
        return parsedError.statusCode === 401;
    },

    /**
     * Check if error is permission error
     */
    isPermissionError(error: unknown): boolean {
        const parsedError = errorParser.parseError(error);
        return parsedError.statusCode === 403;
    },

    /**
     * Check if error is validation error
     */
    isValidationError(error: unknown): boolean {
        const parsedError = errorParser.parseError(error);
        return parsedError.statusCode === 422 || (parsedError.errors?.length ?? 0) > 0;
    },

    /**
     * Check if error is network error
     */
    isNetworkError(error: unknown): boolean {
        const parsedError = errorParser.parseError(error);
        return parsedError.statusCode === 0;
    },
};

/**
 * Error Notification Helper
 */
export const errorNotification = {
    /**
     * Get notification config for error
     */
    getConfig(error: unknown): {
        message: string;
        type: 'error' | 'warning';
        duration: number;
    } {
        const parsedError = errorParser.parseError(error);

        // Network error - longer duration
        if (errorHandler.isNetworkError(error)) {
            return {
                message: parsedError.message,
                type: 'error',
                duration: 5000,
            };
        }

        // Validation error - warning type
        if (errorHandler.isValidationError(error)) {
            const validationErrors = errorParser.formatValidationErrors(parsedError.errors);
            return {
                message: validationErrors || parsedError.message,
                type: 'warning',
                duration: 4000,
            };
        }

        // Default error
        return {
            message: parsedError.message,
            type: 'error',
            duration: 3000,
        };
    },
};

/**
 * Retry Helper
 */
export const retryHelper = {
    /**
     * Check if error is retryable
     */
    isRetryable(error: unknown): boolean {
        const parsedError = errorParser.parseError(error);
        const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
        return parsedError.statusCode
            ? retryableStatusCodes.includes(parsedError.statusCode)
            : errorHandler.isNetworkError(error);
    },

    /**
     * Get retry delay based on attempt number
     */
    getRetryDelay(attempt: number, baseDelay: number = 1000): number {
        // Exponential backoff: baseDelay * 2^attempt
        return Math.min(baseDelay * Math.pow(2, attempt), 10000);
    },
};
