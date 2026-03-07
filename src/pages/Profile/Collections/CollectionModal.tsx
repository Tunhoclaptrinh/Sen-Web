
import React, { useEffect } from 'react';
import { Modal, Form, Input, Checkbox } from 'antd';
import { CollectionDTO, Collection } from '@/types/collection.types';
import { useTranslation } from 'react-i18next';

interface CollectionModalProps {
    visible: boolean;
    onCancel: () => void;
    onOk: (values: CollectionDTO) => Promise<void>;
    initialValues?: Collection | null;
    loading?: boolean;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
    visible,
    onCancel,
    onOk,
    initialValues,
    loading
}) => {
    const { t } = useTranslation('translation', { keyPrefix: 'profile' });
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    name: initialValues.name,
                    description: initialValues.description,
                    isPublic: initialValues.isPublic
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ isPublic: true }); // Default to public
            }
        }
    }, [visible, initialValues, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await onOk(values);
            // Form reset is handled by effect or parent logic usually, 
            // but resetting here for create mode safety
            if (!isEdit) form.resetFields();
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title={isEdit ? t("collectionsPage.modalEditTitle") : t("collectionsPage.modalCreateTitle")}
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            okText={isEdit ? t("collectionsPage.modalSaveBtn") : t("collectionsPage.modalCreateBtn")}
            cancelText={t("collectionsPage.cancelBtn")}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label={t("collectionsPage.nameLabel")}
                    rules={[{ required: true, message: t("collectionsPage.nameRequired") }]}
                >
                    <Input placeholder={t("collectionsPage.namePlaceholder")} />
                </Form.Item>

                <Form.Item
                    name="description"
                    label={t("collectionsPage.descLabel")}
                >
                    <Input.TextArea rows={4} placeholder={t("collectionsPage.descPlaceholder")} />
                </Form.Item>

                <Form.Item
                    name="isPublic"
                    valuePropName="checked"
                >
                    <Checkbox>{t("collectionsPage.isPublicLabel")}</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CollectionModal;
