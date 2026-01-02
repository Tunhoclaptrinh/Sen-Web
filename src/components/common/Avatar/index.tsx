import React, { CSSProperties } from 'react';
import { Avatar as AntAvatar, AvatarProps as AntAvatarProps } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import classNames from 'classnames';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
type StatusType = 'online' | 'offline' | 'away' | 'busy';

interface CustomAvatarProps extends Omit<AntAvatarProps, 'size'> {
    avatarSize?: AvatarSize;
    status?: StatusType;
    showStatus?: boolean;
    name?: string;
}

const sizeMap: Record<AvatarSize, number> = {
    small: 32,
    medium: 40,
    large: 56,
    xlarge: 80,
};

const statusColors: Record<StatusType, string> = {
    online: '#22C55E',
    offline: '#A3A3A3',
    away: '#F97316',
    busy: '#EF4444',
};

/**
 * Get initials from name
 */
const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Avatar Component
 * User avatar with status indicator
 */
const Avatar: React.FC<CustomAvatarProps> = ({
    avatarSize = 'medium',
    status = 'offline',
    showStatus = false,
    name,
    src,
    icon,
    className,
    style,
    ...props
}) => {
    const size = sizeMap[avatarSize];
    const statusColor = statusColors[status];

    const avatarClassName = classNames(
        'sen-avatar',
        `sen-avatar--${avatarSize}`,
        className
    );

    const avatarStyle: CSSProperties = {
        backgroundColor: src ? 'transparent' : '#F43F5E',
        color: '#FFFFFF',
        fontWeight: 600,
        ...style,
    };

    const containerStyle: CSSProperties = {
        position: 'relative',
        display: 'inline-block',
    };

    const statusStyle: CSSProperties = {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: size * 0.25,
        height: size * 0.25,
        backgroundColor: statusColor,
        border: '2px solid #FFFFFF',
        borderRadius: '50%',
    };

    // Determine what to show in avatar
    let avatarContent = icon || <UserOutlined />;
    if (name && !src && !icon) {
        avatarContent = getInitials(name);
    }

    return (
        <div style={containerStyle}>
            <AntAvatar
                {...props}
                size={size}
                src={src}
                icon={!src && !name ? avatarContent : undefined}
                className={avatarClassName}
                style={avatarStyle}
            >
                {!src && name && avatarContent}
            </AntAvatar>
            {showStatus && <div style={statusStyle} />}
        </div>
    );
};

/**
 * Avatar Group Component
 */
interface AvatarGroupProps {
    children: React.ReactNode;
    maxCount?: number;
    className?: string;
    style?: CSSProperties;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
    children,
    maxCount = 5,
    className,
    style,
}) => {
    const groupStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        ...style,
    };

    return (
        <AntAvatar.Group maxCount={maxCount} className={className} style={groupStyle}>
            {children}
        </AntAvatar.Group>
    );
};

export default Avatar;
