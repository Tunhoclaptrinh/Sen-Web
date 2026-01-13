import React, { useState, ReactNode, CSSProperties } from 'react';
import classNames from 'classnames';

interface TabItem {
    key: string;
    label: ReactNode;
    children: ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    items: TabItem[];
    defaultActiveKey?: string;
    activeKey?: string;
    onChange?: (key: string) => void;
    className?: string;
    style?: CSSProperties;
}

/**
 * Tabs Component
 * Tab navigation with lotus pink theme
 */
const Tabs: React.FC<TabsProps> = ({
    items,
    defaultActiveKey,
    activeKey: controlledActiveKey,
    onChange,
    className,
    style,
}) => {
    const [internalActiveKey, setInternalActiveKey] = useState(
        defaultActiveKey || items[0]?.key || ''
    );

    const activeKey = controlledActiveKey !== undefined ? controlledActiveKey : internalActiveKey;

    const handleTabClick = (key: string, disabled?: boolean) => {
        if (disabled) return;

        if (controlledActiveKey === undefined) {
            setInternalActiveKey(key);
        }

        onChange?.(key);
    };

    const activeItem = items.find((item) => item.key === activeKey);

    const containerStyle: CSSProperties = {
        ...style,
    };

    const tabListStyle: CSSProperties = {
        display: 'flex',
        borderBottom: '2px solid #F5F5F5',
        marginBottom: '24px',
        gap: '8px',
    };

    const getTabStyle = (isActive: boolean, disabled?: boolean): CSSProperties => ({
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: isActive ? 600 : 500,
        color: disabled ? '#A3A3A3' : isActive ? 'var(--primary-color)' : '#525252',
        background: 'transparent',
        border: 'none',
        borderBottom: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
        marginBottom: '-2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.5 : 1,
    });

    const contentStyle: CSSProperties = {
        animation: 'fadeIn 0.3s ease-in-out',
    };

    return (
        <div className={classNames('sen-tabs', className)} style={containerStyle}>
            <div style={tabListStyle}>
                {items.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => handleTabClick(item.key, item.disabled)}
                        style={getTabStyle(item.key === activeKey, item.disabled)}
                        disabled={item.disabled}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <div style={contentStyle}>{activeItem?.children}</div>
        </div>
    );
};

export default Tabs;
