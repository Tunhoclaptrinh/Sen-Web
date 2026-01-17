import React, { useEffect } from "react";
import { Form, Input, Select } from "antd";
import FormModal from "@/components/common/FormModal";
import { Button as StyledButton } from "@/components/common";

const { Option } = Select;

interface UserFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void | boolean>;
    initialValues: any | null;
    loading?: boolean;
    isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading,
    isEdit = false
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        const initData = async () => {
            // 1. Edit Mode
            if (visible && isEdit && initialValues) {
                form.setFieldsValue(initialValues);
            } 
            // 2. Create Mode -> Aggressive Reset
            else if (visible && !isEdit) {
                 const currentFields = form.getFieldsValue(true);
                 const resetValues = Object.keys(currentFields).reduce((acc: any, key) => {
                     acc[key] = undefined;
                     return acc;
                 }, {});
                 form.setFieldsValue(resetValues);
                 form.resetFields();

                 form.setFieldsValue({
                     role: "customer",
                     isActive: true
                 });
            }
        };
        initData();
    }, [visible, isEdit, initialValues, form]);

    const handleSubmitClick = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            // onSubmit in UserManagement handles closing, but we can reset here if needed
            // Actually usually model closes it.
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <FormModal
            title={isEdit ? "Cập nhật Người Dùng" : "Thêm mới Người Dùng"}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmitClick}
            loading={loading}
            form={form} 
            width={600}
            preserve={false}
            footer={
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <StyledButton variant="outline" onClick={onCancel} style={{ minWidth: '120px' }}>
                        Hủy
                    </StyledButton>
                    <StyledButton variant="primary" loading={loading} onClick={handleSubmitClick} style={{ minWidth: '120px' }}>
                        Lưu lại
                    </StyledButton>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    role: "customer",
                    isActive: true
                }}
            >
                <Form.Item
                    name="name"
                    label="Họ tên"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                    <Input placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" }
                    ]}
                >
                    <Input placeholder="example@email.com" />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: "Vui lòng nhập số điện thoại" },
                        { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ" }
                    ]}
                >
                    <Input placeholder="0912345678" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={isEdit ? "Mật khẩu (Để trống nếu không đổi)" : "Mật khẩu"}
                    rules={[
                        { required: !isEdit, message: "Vui lòng nhập mật khẩu" }
                    ]}
                >
                    <Input.Password placeholder="******" />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Vai trò"
                >
                    <Select>
                        <Option value="customer">Khách hàng (Customer)</Option>
                        <Option value="researcher">Nhà nghiên cứu (Researcher)</Option>
                        <Option value="admin">Quản trị viên (Admin)</Option>
                    </Select>
                </Form.Item>
            </Form>
        </FormModal>
    );
};

export default UserForm;

