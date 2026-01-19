
import React, { useEffect } from 'react';
import { Modal, Form, Input, Checkbox } from 'antd';
import { CollectionDTO, Collection } from '@/types/collection.types';

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
    const [form] = Form.useForm();
    const isEdit = !!initialValues;

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    name: initialValues.name,
                    description: initialValues.description,
                    is_public: initialValues.is_public
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ is_public: true }); // Default to public
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
            title={isEdit ? "Chỉnh sửa Bộ Sưu Tập" : "Tạo Bộ Sưu Tập Mới"}
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            okText={isEdit ? "Lưu thay đổi" : "Tạo mới"}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Tên bộ sưu tập"
                    rules={[{ required: true, message: 'Vui lòng nhập tên bộ sưu tập' }]}
                >
                    <Input placeholder="Ví dụ: Cổ vật triều Nguyễn..." />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả ngắn"
                >
                    <Input.TextArea rows={4} placeholder="Mô tả về bộ sưu tập này..." />
                </Form.Item>

                <Form.Item
                    name="is_public"
                    valuePropName="checked"
                >
                    <Checkbox>Công khai (Mọi người có thể nhìn thấy)</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CollectionModal;
