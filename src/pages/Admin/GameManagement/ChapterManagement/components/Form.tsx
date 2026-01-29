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
    if (open) {
      if (initialValues) {
        // Edit mode: set values from record
        form.setFieldsValue(initialValues);
      } else {
        // Create mode: reset to default values
        form.resetFields();
        form.setFieldsValue({
          required_petals: 0,
        });
      }
    }
  }, [open, initialValues, form]);

  const handleOk = async (values: any) => {
    await onSubmit(values);
  };

  const isEditMode = !!initialValues;

  return (
    <FormModal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      title={title}
      width={700}
      form={form}
      loading={loading}

    >
            <Form.Item
                name="name"
                label="Tên Chương"
                rules={[
                    { required: true, message: "Vui lòng nhập tên chương" },
                    { min: 3, message: "Tên chương phải có ít nhất 3 ký tự" }
                ]}
            >
                <Input placeholder="Nhập tên chương (VD: Sen Hồng - Ký Ức Đầu Tiên)" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                    { required: true, message: "Vui lòng nhập mô tả" },
                    { min: 20, message: "Mô tả phải có ít nhất 20 ký tự" }
                ]}
            >
                <Input.TextArea rows={4} placeholder="Mô tả về nội dung chương..." />
            </Form.Item>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="theme"
            label="Chủ đề"
            rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
          >
            <Input placeholder="Chủ đề (VD: Văn hóa Đại Việt)" />
          </Form.Item>
        </Col>

      </Row>

      <Row gutter={16}>
        {isEditMode && (
          <Col span={12}>
            <Form.Item
              name="order"
              label="Thứ tự"
              rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
        )}
        <Col span={isEditMode ? 12 : 24}>
          <Form.Item name="required_petals" label="Số cánh hoa yêu cầu">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ChapterForm;
