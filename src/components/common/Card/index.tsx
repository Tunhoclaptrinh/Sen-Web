import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';

interface CardProps {
    children: ReactNode;
    title?: ReactNode;
    extra?: ReactNode;
    footer?: ReactNode;
    hoverable?: boolean;
    bordered?: boolean;
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
    bodyStyle?: CSSProperties;
    onClick?: () => void;
}

/**
 * Card Component
 * Beautiful card component with lotus pink accents
 */
const Card: React.FC<CardProps> = ({
    children,
    title,
    extra,
    footer,
    hoverable = false,
    bordered = true,
    loading = false,
    className,
    style,
    bodyStyle,
    onClick,
}) => {
    const cardClassName = classNames(
        'sen-card',
        {
            'sen-card--hoverable': hoverable,
            'sen-card--bordered': bordered,
            'sen-card--loading': loading,
        },
        className
    );

    const cardStyle: CSSProperties = {
        background: '#FFFFFF',
        borderRadius: '12px',
        border: bordered ? '1px solid #E5E5E5' : 'none',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        ...(hoverable && {
            ':hover': {
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                transform: 'translateY(-2px)',
            },
        }),
        ...style,
    };

    const headerStyle: CSSProperties = {
        padding: '16px 24px',
        borderBottom: '1px solid #F5F5F5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };

    const titleStyle: CSSProperties = {
        fontSize: '18px',
        fontWeight: 600,
        color: '#262626',
        margin: 0,
    };

    const bodyStyleDefault: CSSProperties = {
        padding: '24px',
        ...bodyStyle,
    };

    const footerStyle: CSSProperties = {
        padding: '16px 24px',
        borderTop: '1px solid #F5F5F5',
        background: '#FAFAFA',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
    };

    return (
        <div className={cardClassName} style={cardStyle} onClick={onClick}>
            {(title || extra) && (
                <div style={headerStyle}>
                    {title && <div style={titleStyle}>{title}</div>}
                    {extra && <div>{extra}</div>}
                </div>
            )}
            <div style={bodyStyleDefault}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="loading-spinner" />
                    </div>
                ) : (
                    children
                )}
            </div>
            {footer && <div style={footerStyle}>{footer}</div>}
        </div>
    );
};

export default Card;
