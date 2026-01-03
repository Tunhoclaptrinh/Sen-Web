import { Input, InputNumber, Select, Row, Col, Form } from "antd";
import { FormModal } from "@/components/common";
import { useEffect, useState } from "react";
import adminChapterService from "@/services/admin-chapter.service";

interface LevelFormProps {
    open: boolean;
    onCancel: () => void;
    onSubmit: (values: any) => Promise<boolean>;
    initialValues?: any;
    loading?: boolean;
    title?: string;
}

const LevelForm: React.FC<LevelFormProps> = ({
    open,
    onCancel,
    onSubmit,
    initialValues,
    loading = false,
    title = "Thông tin Màn chơi",
}) => {
    const [form] = Form.useForm();
    const [chapters, setChapters] = useState<any[]>([]);

    useEffect(() => {
        if (open && initialValues) {
            form.setFieldsValue(initialValues);
        } else if (open) {
            form.resetFields();
        }
    }, [open, initialValues, form]);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const response = await adminChapterService.getAll({ limit: 100 });
                if (response.success) {
                    setChapters(response.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch chapters", error);
            }
        };
        if (open) fetchChapters();
    }, [open]);

    const handleOk = async (values: any) => {
        await onSubmit(values);
    };

    return (
        <FormModal
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            title={title}
            width={800}
            form={form}
            loading={loading}
            initialValues={{ difficulty: "easy", type: "story", order: 1, ...initialValues }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="name"
                        label="Tên Màn chơi"
                        rules={[{ required: true, message: "Vui lòng nhập tên màn chơi" }]}
                    >
                        <Input placeholder="VD: Khám Phá Trống Đồng" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="chapter_id"
                        label="Thuộc Chương"
                        rules={[{ required: true, message: "Vui lòng chọn chương" }]}
                    >
                        <Select placeholder="Chọn chương">
                            {chapters.map((chap) => (
                                <Select.Option key={chap.id} value={chap.id}>{chap.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
                <Input.TextArea rows={2} placeholder="Mô tả ngắn về màn chơi..." />
            </Form.Item>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="type" label="Loại game" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="story">Story</Select.Option>
                            <Select.Option value="quiz">Quiz</Select.Option>
                            <Select.Option value="hidden_object">Hidden Object</Select.Option>
                            <Select.Option value="timeline">Timeline</Select.Option>
                            <Select.Option value="mixed">Mixed</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="difficulty" label="Độ khó" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="easy">Easy</Select.Option>
                            <Select.Option value="medium">Medium</Select.Option>
                            <Select.Option value="hard">Hard</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="order" label="Thứ tự">
                        <InputNumber style={{ width: "100%" }} min={1} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name={["rewards", "petals"]} label="Thưởng Cánh hoa">
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name={["rewards", "coins"]} label="Thưởng Xu">
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="passing_score" label="Điểm đạt">
                        <InputNumber style={{ width: "100%" }} min={0} max={100} />
                    </Form.Item>
                </Col>
            </Row>
        </FormModal>
    );
};

export default LevelForm;
