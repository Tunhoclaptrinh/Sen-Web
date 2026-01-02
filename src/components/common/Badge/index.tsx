import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary' | 'neutral';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
    className?: string;
    style?: CSSProperties;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    primary: { bg: '#FFF1F2', text: '#F43F5E', border: '#FECDD3' },
    secondary: { bg: '#FDF2F8', text: '#EC4899', border: '#FBCFE8' },
    success: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    error: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    warning: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    info: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    neutral: { bg: '#FAFAFA', text: '#525252', border: '#E5E5E5' },
};

const sizeStyles: Record<BadgeSize, CSSProperties> = {
    small: {
        padding: '2px 8px',
        fontSize: '12px',
        height: '20px',
    },
    medium: {
        padding: '4px 12px',
        fontSize: '14px',
        height: '24px',
    },
    large: {
        padding: '6px 16px',
        fontSize: '14px',
        height: '28px',
    },
};

/**
 * Badge Component
 * Status badges with lotus pink theme
 */
const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    dot = false,
    className,
    style,
}) => {
    const colors = variantColors[variant];
    const sizeStyle = sizeStyles[size];

    const badgeClassName = classNames(
        'sen-badge',
        `sen-badge--${variant}`,
        `sen-badge--${size}`,
        {
            'sen-badge--dot': dot,
        },
        className
    );

    const badgeStyle: CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: dot ? '9999px' : '6px',
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...sizeStyle,
        ...(dot && {
            width: size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px',
            height: size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px',
            padding: 0,
            backgroundColor: colors.text,
            border: `2px solid ${colors.bg}`,
        }),
        ...style,
    };

    return (
        <span className={badgeClassName} style={badgeStyle}>
            {!dot && children}
        </span>
    );
};

export default Badge;
