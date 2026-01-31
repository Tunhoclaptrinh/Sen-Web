import { Input, InputNumber, Row, Col, Form, Switch, Radio, ColorPicker } from "antd";
import { FormModal } from "@/components/common";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/common/Upload/ImageUpload";

interface ChapterFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<boolean>;
  initialValues?: any;
  loading?: boolean;
  title?: string;
}

const MediaPicker = ({ value, onChange }: { value?: string; onChange?: (val: string) => void }) => {
  const [mode, setMode] = useState<"upload" | "url">("upload");

  // Auto-switch to URL mode if value is present and we want to show it?
  // But ImageUpload handles showing existing URLs too.
  // We'll stick to manual toggle or default to upload.

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          size="small"
          buttonStyle="solid"
        >
          <Radio.Button value="upload">Tải ảnh</Radio.Button>
          <Radio.Button value="url">Link URL</Radio.Button>
        </Radio.Group>
      </div>
      {mode === "upload" ? (
        <ImageUpload
          value={value}
          onChange={(val) => onChange?.(Array.isArray(val) ? val[0] : val)}
          maxCount={1}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="https://example.com/image.png"
        />
      )}
    </div>
  );
};

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
          color: '#1890ff',
          is_active: true
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
      width={800}
      form={form}
      loading={loading}
    >
      <Row gutter={24}>
        {/* Left Column: General Info */}
        <Col span={15}>
          <Form.Item
            name="name"
            label="Tên Chương"
            rules={[
              { required: true, message: "Vui lòng nhập tên chương" },
              { min: 3, message: "Tên chương phải có ít nhất 3 ký tự" },
            ]}
          >
            <Input placeholder="VD: Sen Hồng - Ký Ức Đầu Tiên" />
          </Form.Item>

          <Form.Item
            name="theme"
            label="Chủ đề"
            rules={[{ required: true, message: "Vui lòng nhập chủ đề" }]}
          >
            <Input placeholder="VD: Văn hóa Đại Việt" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={isEditMode ? 12 : 24}>
              <Form.Item name="required_petals" label="Số cánh hoa yêu cầu">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
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
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              { min: 20, message: "Mô tả phải có ít nhất 20 ký tự" },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Mô tả chi tiết về nội dung và ý nghĩa của chương..."
            />
          </Form.Item>
        </Col>

        {/* Right Column: Visuals & Status */}
        <Col span={9}>
            <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', height: '100%' }}>
                <Form.Item
                    name="is_active"
                    label="Trạng thái"
                    valuePropName="checked"
                    initialValue={true}
                    style={{ marginBottom: 24 }}
                >
                    <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Tạm ẩn" />
                </Form.Item>

                <Form.Item 
                    name="color" 
                    label="Màu chủ đạo"
                    rules={[{ required: true, message: "Vui lòng chọn màu chủ đạo" }]}
                    getValueFromEvent={(color) => (typeof color === 'string' ? color : color.toHexString())}
                >
                   <ColorPicker showText format="hex" />
                </Form.Item>

                <Form.Item name="image" label="Hình ảnh (Thumbnail)">
                    <MediaPicker />
                </Form.Item>
                
                <div style={{ marginTop: 16, fontSize: '12px', color: '#888' }}>
                    <p>ℹ️ <strong>Lưu ý:</strong></p>
                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                        <li>Khuyên dùng ảnh tỷ lệ 16:9 hoặc 4:3.</li>
                        <li>Dung lượng tối đa 5MB.</li>
                    </ul>
                </div>
            </div>
        </Col>
      </Row>
    </FormModal>
  );
};

export default ChapterForm;
