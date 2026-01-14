import { Input, InputNumber, Row, Col, Form } from "antd";
import { FormModal } from "@/components/common";
import { useEffect } from "react";

interface ChapterFormProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<boolean>;
    initialValues?: any;
    loading?: boolean;
    title?: string;
}

const ChapterForm: React.FC<ChapterFormProps> = ({
    open,
    onCancel,
    onSubmit,
    initialValues,
    loading = false,
    title = "Thông tin Chương",
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue(initialValues);
        } else if (open) {
            // Force reset all fields when opening create form
            form.resetFields();
            // Explicitly set default values
            form.setFieldsValue({
                required_petals: 0,
                order: undefined,
                layer_index: undefined,
                theme: undefined,
                color: undefined
            });
        }
    }, [open, initialValues, form]);

    const handleOk = async (values: any) => {
        await onSubmit(values);
    };

    return (
        <FormModal
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            title={title}
            width={700}
            form={form}
            loading={loading}
            initialValues={{ required_petals: 0, ...initialValues }}
        >
            <Form.Item
                name="name"
                label="Tên Chương"
                rules={[{ required: true, message: "Vui lòng nhập tên chương" }]}
            >
                <Input placeholder="Nhập tên chương (VD: Sen Hồng - Ký Ức Đầu Tiên)" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
                <Input.TextArea rows={4} placeholder="Mô tả về nội dung chương..." />
            </Form.Item>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        name="theme" 
                        label="Chủ đề"
                        rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
                    >
                        <Input placeholder="Chủ đề (VD: Văn hóa Đại Việt)" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="color" label="Màu sắc chủ đạo">
                        <Input placeholder="Mã màu (VD: #D35400)" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item 
                        name="layer_index" 
                        label="Layer Index"
                        rules={[{ required: true, message: "Vui lòng nhập layer index" }]}
                    >
                        <InputNumber style={{ width: "100%" }} min={1} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="required_petals" label="Số cánh hoa yêu cầu">
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                </Col>
            </Row>
        </FormModal>
    );
};

export default ChapterForm;
