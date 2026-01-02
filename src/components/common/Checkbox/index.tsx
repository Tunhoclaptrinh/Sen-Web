import React, { CSSProperties, ReactNode } from 'react';
import { Checkbox as AntCheckbox, CheckboxProps as AntCheckboxProps } from 'antd';
import classNames from 'classnames';

export interface CustomCheckboxProps extends AntCheckboxProps {
    label?: ReactNode;
    error?: string;
    helperText?: string;
}

/**
 * Checkbox Component
 * Enhanced checkbox with label, error states, and validation
 */
const Checkbox: React.FC<CustomCheckboxProps> = ({
    label,
    error,
    helperText,
    className,
    children,
    ...props
}) => {
    const containerStyle: CSSProperties = {
        marginBottom: error || helperText ? '20px' : '12px',
    };

    const checkboxClassName = classNames(
        'sen-checkbox',
        {
            'sen-checkbox--error': error,
        },
        className
    );

    const helperStyle: CSSProperties = {
        marginTop: '4px',
        marginLeft: '24px',
        fontSize: '12px',
        color: error ? '#EF4444' : '#737373',
    };

    return (
        <div style={containerStyle}>
            <AntCheckbox {...props} className={checkboxClassName}>
                {label || children}
            </AntCheckbox>
            {(error || helperText) && (
                <div style={helperStyle}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

/**
 * Checkbox Group Component
 */
export const CheckboxGroup = AntCheckbox.Group;

export default Checkbox;
