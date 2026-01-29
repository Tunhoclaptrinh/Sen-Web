import { ReactNode } from 'react';
import { ModalProps } from 'antd';

export interface ViewModalProps extends ModalProps {
    open?: boolean;
    onClose?: () => void;
    children?: ReactNode;
    fullscreen?: boolean;
    titleExtra?: ReactNode; // Custom content to display in title bar (left side)
}
