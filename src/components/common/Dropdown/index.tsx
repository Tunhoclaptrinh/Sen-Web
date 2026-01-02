import React, { useState, useRef, useEffect, ReactNode, CSSProperties } from 'react';
import classNames from 'classnames';

interface DropdownItem {
    key: string;
    label: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
    danger?: boolean;
    onClick?: () => void;
}

interface DropdownProps {
    trigger: ReactNode;
    items: DropdownItem[];
    placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
    className?: string;
    style?: CSSProperties;
}

/**
 * Dropdown Component
 * Dropdown menu with lotus pink theme
 */
const Dropdown: React.FC<DropdownProps> = ({
    trigger,
    items,
    placement = 'bottomLeft',
    className,
    style,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (item: DropdownItem) => {
        if (item.disabled) return;
        item.onClick?.();
        setIsOpen(false);
    };

    const getMenuPosition = (): CSSProperties => {
        const positions: Record<string, CSSProperties> = {
            bottomLeft: { top: '100%', left: 0, marginTop: '8px' },
            bottomRight: { top: '100%', right: 0, marginTop: '8px' },
            topLeft: { bottom: '100%', left: 0, marginBottom: '8px' },
            topRight: { bottom: '100%', right: 0, marginBottom: '8px' },
        };
        return positions[placement];
    };

    const containerStyle: CSSProperties = {
        position: 'relative',
        display: 'inline-block',
        ...style,
    };

    const menuStyle: CSSProperties = {
        position: 'absolute',
        ...getMenuPosition(),
        minWidth: '160px',
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        padding: '8px',
        zIndex: 1000,
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const getItemStyle = (item: DropdownItem): CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        fontSize: '14px',
        color: item.danger ? '#EF4444' : item.disabled ? '#A3A3A3' : '#262626',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: item.disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        textAlign: 'left',
        transition: 'background 0.15s ease',
        opacity: item.disabled ? 0.5 : 1,
    });

    return (
        <div
            ref={dropdownRef}
            className={classNames('sen-dropdown', className)}
            style={containerStyle}
        >
            <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer' }}>
                {trigger}
            </div>
            <div style={menuStyle}>
                {items.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        style={getItemStyle(item)}
                        onMouseEnter={(e) => {
                            if (!item.disabled) {
                                e.currentTarget.style.background = item.danger ? '#FEF2F2' : '#FFF1F2';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        {item.icon && <span>{item.icon}</span>}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Dropdown;
