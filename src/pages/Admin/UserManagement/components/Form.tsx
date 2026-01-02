import React, { useEffect } from "react";
import { Form, Input, Select } from "antd";
import FormModal from "@/components/common/FormModal";

const { Option } = Select;

interface UserFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<void | boolean>;
    initialValues: any | null;
    loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
        });
    };

    return (
        <FormModal
            title={isEditing ? "Cập nhật Người Dùng" : "Thêm mới Người Dùng"}
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
            form={form} // Pass form instance for loading state management if needed
            width={600}
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
                    label={isEditing ? "Mật khẩu (Để trống nếu không đổi)" : "Mật khẩu"}
                    rules={[
                        { required: !isEditing, message: "Vui lòng nhập mật khẩu" }
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
