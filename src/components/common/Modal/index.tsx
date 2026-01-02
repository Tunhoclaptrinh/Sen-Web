import React, { ReactNode, CSSProperties, useEffect } from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import classNames from 'classnames';

export interface CustomModalProps extends Omit<AntModalProps, 'footer'> {
    children: ReactNode;
    footer?: ReactNode | null;
    showCloseIcon?: boolean;
}

/**
 * Modal Component
 * Enhanced modal with lotus pink theme and smooth animations
 */
const Modal: React.FC<CustomModalProps> = ({
    children,
    open,
    onCancel,
    title,
    footer,
    showCloseIcon = true,
    width = 600,
    centered = true,
    maskClosable = true,
    className,
    ...props
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    const modalClassName = classNames('sen-modal', className);

    const modalStyles: CSSProperties = {
        borderRadius: '16px',
        overflow: 'hidden',
    };

    const headerStyle: CSSProperties = {
        padding: '24px 24px 16px',
        borderBottom: '1px solid #F5F5F5',
    };

    const titleStyle: CSSProperties = {
        fontSize: '20px',
        fontWeight: 600,
        color: '#262626',
        margin: 0,
    };

    const bodyStyle: CSSProperties = {
        padding: '24px',
        maxHeight: '60vh',
        overflowY: 'auto',
    };

    const closeIconStyle: CSSProperties = {
        position: 'absolute',
        top: '24px',
        right: '24px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: '#737373',
        background: 'transparent',
    };

    return (
        <AntModal
            {...props}
            open={open}
            onCancel={onCancel}
            title={null}
            footer={null}
            width={width}
            centered={centered}
            maskClosable={maskClosable}
            className={modalClassName}
            closeIcon={null}
            styles={{
                body: bodyStyle,
                mask: {
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                },
            }}
            style={modalStyles}
        >
            {/* Custom Header */}
            {title && (
                <div style={headerStyle}>
                    <h3 style={titleStyle}>{title}</h3>
                </div>
            )}

            {/* Close Icon */}
            {showCloseIcon && (
                <div
                    style={closeIconStyle}
                    onClick={onCancel as any}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F5F5F5';
                        e.currentTarget.style.color = '#262626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#737373';
                    }}
                >
                    <CloseOutlined />
                </div>
            )}

            {/* Body */}
            <div>{children}</div>

            {/* Footer */}
            {footer !== null && footer !== undefined && (
                <div
                    style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #F5F5F5',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    {footer}
                </div>
            )}
        </AntModal>
    );
};

export default Modal;
