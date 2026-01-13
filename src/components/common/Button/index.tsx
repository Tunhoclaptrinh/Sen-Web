import React, { CSSProperties } from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'small' | 'medium' | 'large';

export interface CustomButtonProps extends Omit<AntButtonProps, 'type' | 'size' | 'variant'> {
    variant?: ButtonVariant;
    buttonSize?: ButtonSize;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
    primary: {
        backgroundColor: 'var(--primary-color)',
        borderColor: 'var(--primary-color)',
        color: '#FFFFFF',
    },
    secondary: {
        backgroundColor: 'var(--secondary-color)',
        borderColor: 'var(--secondary-color)',
        color: '#FFFFFF',
    },
    outline: {
        backgroundColor: 'transparent',
        borderColor: 'var(--primary-color)',
        color: 'var(--primary-color)',
    },
    ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        color: 'var(--primary-color)',
    },
    danger: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
        color: '#FFFFFF',
    },
    success: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
        color: '#FFFFFF',
    },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
    small: {
        height: '32px',
        padding: '0 12px',
        fontSize: '14px',
    },
    medium: {
        height: '40px',
        padding: '0 16px',
        fontSize: '14px',
    },
    large: {
        height: '48px',
        padding: '0 24px',
        fontSize: '16px',
    },
};

/**
 * Button Component
 * Enhanced button with lotus pink theme and multiple variants
 */
const Button: React.FC<CustomButtonProps> = ({
    variant = 'primary',
    buttonSize = 'medium',
    fullWidth = false,
    loading = false,
    disabled = false,
    className,
    style,
    children,
    ...props
}) => {
    const variantStyle = variantStyles[variant];
    const sizeStyle = sizeStyles[buttonSize];

    const buttonClassName = classNames(
        'sen-button',
        `sen-button--${variant}`,
        `sen-button--${buttonSize}`,
        {
            'sen-button--full-width': fullWidth,
            'sen-button--loading': loading,
        },
        className
    );

    const buttonStyle: CSSProperties = {
        borderRadius: '8px',
        fontWeight: 500,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        ...variantStyle,
        ...sizeStyle,
        ...(disabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
        }),
        ...style,
    };

    return (
        <AntButton
            {...props}
            disabled={disabled}
            loading={loading}
            className={buttonClassName}
            style={buttonStyle}
            icon={loading ? <LoadingOutlined /> : props.icon}
        >
            {children}
        </AntButton>
    );
};

export default Button;
