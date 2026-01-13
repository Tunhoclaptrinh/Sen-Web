import { ReactNode } from 'react';
import { ModalProps, FormInstance } from 'antd';
import { FormLayout } from 'antd/es/form/Form';

export interface FormModalProps extends ModalProps {
    onCancel?: () => void;
    onOk?: (values: any) => Promise<void> | void;
    form: FormInstance;
    initialValues?: any;
    loading?: boolean;
    layout?: FormLayout;
    children?: ReactNode;
    preserve?: boolean;
}
