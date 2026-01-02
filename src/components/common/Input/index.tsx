import React, { CSSProperties } from 'react';
import { Input as AntInput, InputProps as AntInputProps } from 'antd';
import classNames from 'classnames';

export interface CustomInputProps extends Omit<AntInputProps, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    fullWidth?: boolean;
    inputSize?: 'small' | 'middle' | 'large';
}

/**
 * Input Component
 * Enhanced input with label, error states, and validation
 */
const Input: React.FC<CustomInputProps> = ({
    label,
    error,
    helperText,
    required,
    fullWidth = true,
    inputSize = 'middle',
    className,
    style,
    ...props
}) => {
    const containerStyle: CSSProperties = {
        width: fullWidth ? '100%' : 'auto',
        marginBottom: error || helperText ? '24px' : '16px',
    };

    const labelStyle: CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: error ? '#EF4444' : '#262626',
    };

    const inputClassName = classNames(
        'sen-input',
        {
            'sen-input--error': error,
        },
        className
    );

    const inputStyle: CSSProperties = {
        borderRadius: '8px',
        borderColor: error ? '#EF4444' : '#D4D4D4',
        ...style,
    };

    const helperStyle: CSSProperties = {
        marginTop: '4px',
        fontSize: '12px',
        color: error ? '#EF4444' : '#737373',
    };

    return (
        <div style={containerStyle}>
            {label && (
                <label style={labelStyle}>
                    {label}
                    {required && <span style={{ color: '#F43F5E', marginLeft: '4px' }}>*</span>}
                </label>
            )}
            <AntInput
                {...props}
                size={inputSize}
                className={inputClassName}
                style={inputStyle}
                status={error ? 'error' : undefined}
            />
            {(error || helperText) && (
                <div style={helperStyle}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

/**
 * Password Input Component
 */
export const PasswordInput: React.FC<CustomInputProps> = (props) => {
    return <Input {...props} type="password" />;
};

/**
 * TextArea Component
 */
interface TextAreaProps extends Omit<CustomInputProps, 'inputSize'> {
    rows?: number;
    autoSize?: boolean | { minRows?: number; maxRows?: number };
}

export const TextArea: React.FC<TextAreaProps> = ({
    label,
    error,
    helperText,
    required,
    fullWidth = true,
    className,
    style,
    rows = 4,
    autoSize,
    ...props
}) => {
    const containerStyle: CSSProperties = {
        width: fullWidth ? '100%' : 'auto',
        marginBottom: error || helperText ? '24px' : '16px',
    };

    const labelStyle: CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: error ? '#EF4444' : '#262626',
    };

    const textareaClassName = classNames(
        'sen-textarea',
        {
            'sen-textarea--error': error,
        },
        className
    );

    const textareaStyle: CSSProperties = {
        borderRadius: '8px',
        borderColor: error ? '#EF4444' : '#D4D4D4',
        ...style,
    };

    const helperStyle: CSSProperties = {
        marginTop: '4px',
        fontSize: '12px',
        color: error ? '#EF4444' : '#737373',
    };

    return (
        <div style={containerStyle}>
            {label && (
                <label style={labelStyle}>
                    {label}
                    {required && <span style={{ color: '#F43F5E', marginLeft: '4px' }}>*</span>}
                </label>
            )}
            <AntInput.TextArea
                rows={rows}
                autoSize={autoSize}
                className={textareaClassName}
                style={textareaStyle}
                status={error ? 'error' : undefined}
                {...(props as any)}
            />
            {(error || helperText) && (
                <div style={helperStyle}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

export default Input;
