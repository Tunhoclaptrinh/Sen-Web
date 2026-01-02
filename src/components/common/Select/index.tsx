import React, { CSSProperties } from 'react';
import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';
import classNames from 'classnames';

export interface CustomSelectProps extends Omit<AntSelectProps, 'size'> {
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    fullWidth?: boolean;
    selectSize?: 'small' | 'middle' | 'large';
}

/**
 * Select Component
 * Enhanced select dropdown with label, error states, and validation
 */
const Select: React.FC<CustomSelectProps> = ({
    label,
    error,
    helperText,
    required,
    fullWidth = true,
    selectSize = 'middle',
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

    const selectClassName = classNames(
        'sen-select',
        {
            'sen-select--error': error,
        },
        className
    );

    const selectStyle: CSSProperties = {
        width: fullWidth ? '100%' : 'auto',
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
            <AntSelect
                {...props}
                size={selectSize}
                className={selectClassName}
                style={selectStyle}
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

export default Select;
export const { Option } = AntSelect;
