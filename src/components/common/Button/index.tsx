import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import classNames from 'classnames';
import './styles.less';

export interface ButtonProps extends Omit<AntButtonProps, 'className'> {
    customVariant?: 'primary' | 'outline' | 'default';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    customVariant = 'default',
    className,
    ...props
}) => {
    const btnClass = classNames(
        'sen-button',
        {
            'sen-button--primary': customVariant === 'primary',
            'sen-button--outline': customVariant === 'outline',
        },
        className
    );

    return (
        <AntButton className={btnClass} {...props}>
            {children}
        </AntButton>
    );
};

export default Button;
