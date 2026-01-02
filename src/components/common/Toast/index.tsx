import { createContext, useContext, useCallback, ReactNode } from 'react';
import { message } from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';

interface ToastOptions {
    duration?: number;
    onClose?: () => void;
}

interface ToastContextType {
    success: (content: string, options?: ToastOptions) => void;
    error: (content: string, options?: ToastOptions) => void;
    warning: (content: string, options?: ToastOptions) => void;
    info: (content: string, options?: ToastOptions) => void;
    loading: (content: string, duration?: number) => () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Configure message globally
message.config({
    top: 24,
    duration: 3,
    maxCount: 3,
    prefixCls: 'sen-message',
});

/**
 * ToastProvider Component
 * Provides toast notification functionality throughout the app
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const success = useCallback((content: string, options?: ToastOptions) => {
        message.success({
            content,
            duration: options?.duration || 3,
            icon: <CheckCircleOutlined style={{ color: '#22C55E' }} />,
            onClose: options?.onClose,
            style: {
                marginTop: '20vh',
            },
        });
    }, []);

    const error = useCallback((content: string, options?: ToastOptions) => {
        message.error({
            content,
            duration: options?.duration || 4,
            icon: <CloseCircleOutlined style={{ color: '#EF4444' }} />,
            onClose: options?.onClose,
            style: {
                marginTop: '20vh',
            },
        });
    }, []);

    const warning = useCallback((content: string, options?: ToastOptions) => {
        message.warning({
            content,
            duration: options?.duration || 3,
            icon: <ExclamationCircleOutlined style={{ color: '#F97316' }} />,
            onClose: options?.onClose,
            style: {
                marginTop: '20vh',
            },
        });
    }, []);

    const info = useCallback((content: string, options?: ToastOptions) => {
        message.info({
            content,
            duration: options?.duration || 3,
            icon: <InfoCircleOutlined style={{ color: '#3B82F6' }} />,
            onClose: options?.onClose,
            style: {
                marginTop: '20vh',
            },
        });
    }, []);

    const loading = useCallback((content: string, duration: number = 0) => {
        const hide = message.loading({
            content,
            duration,
            style: {
                marginTop: '20vh',
            },
        });
        return hide;
    }, []);

    const value: ToastContextType = {
        success,
        error,
        warning,
        info,
        loading,
    };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

/**
 * useToast Hook
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

// Export standalone toast functions for use outside components
export const toast = {
    success: (content: string, options?: ToastOptions) => {
        message.success({
            content,
            duration: options?.duration || 3,
            icon: <CheckCircleOutlined style={{ color: '#22C55E' }} />,
            onClose: options?.onClose,
        });
    },
    error: (content: string, options?: ToastOptions) => {
        message.error({
            content,
            duration: options?.duration || 4,
            icon: <CloseCircleOutlined style={{ color: '#EF4444' }} />,
            onClose: options?.onClose,
        });
    },
    warning: (content: string, options?: ToastOptions) => {
        message.warning({
            content,
            duration: options?.duration || 3,
            icon: <ExclamationCircleOutlined style={{ color: '#F97316' }} />,
            onClose: options?.onClose,
        });
    },
    info: (content: string, options?: ToastOptions) => {
        message.info({
            content,
            duration: options?.duration || 3,
            icon: <InfoCircleOutlined style={{ color: '#3B82F6' }} />,
            onClose: options?.onClose,
        });
    },
    loading: (content: string, duration: number = 0) => {
        return message.loading({
            content,
            duration,
        });
    },
};

export default toast;
