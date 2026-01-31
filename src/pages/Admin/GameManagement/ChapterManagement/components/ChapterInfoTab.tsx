import { Form, Input, InputNumber, ColorPicker, Descriptions, Space, Row, Col, message } from "antd";
import { Button } from "@/components/common";
import { Chapter } from "@/types";
import { useState } from "react";
import adminChapterService from "@/services/admin-chapter.service";

interface ChapterInfoTabProps {
  data: Chapter | null;
  mode: "view" | "edit" | "create";
  onUpdate: (chapter: Chapter) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

const ChapterInfoTab: React.FC<ChapterInfoTabProps> = ({
  data,
  mode,
  onUpdate,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (mode === "create") {
        // Remove order when creating (backend auto-sets)
        const { order, ...createValues } = values;
        response = await adminChapterService.create(createValues);
      } else if (mode === "edit" && data?.id) {
        response = await adminChapterService.update(data.id, values);
      }

      if (response?.success) {
        message.success(mode === "create" ? "Tạo chương thành công!" : "Cập nhật thành công!");
        if (response.data) {
          onUpdate(response.data);
        }
        onSuccess();
      } else {
        message.error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      message.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // View mode: Display as Descriptions
  if (mode === "view" && data) {
    return (
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Tên Chương">
          {data.name}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả">
          {data.description}
        </Descriptions.Item>
        <Descriptions.Item label="Chủ đề">
          {data.theme}
        </Descriptions.Item>
        <Descriptions.Item label="Màu sắc">
          <Space>
            <div
              style={{
                width: 30,
                height: 30,
                backgroundColor: data.color,
                border: "1px solid #ddd",
                borderRadius: 4,
              }}
            />
            {data.color}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Thứ tự">
          {data.order}
        </Descriptions.Item>
        <Descriptions.Item label="Số cánh hoa yêu cầu">
          {data.requiredPetals}
        </Descriptions.Item>
      </Descriptions>
    );
  }

  // Edit/Create mode: Display as Form
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={data || { requiredPetals: 0 }}
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
          <Form.Item
            name="color"
            label="Màu sắc chủ đạo"
            getValueFromEvent={(color) => (typeof color === 'string' ? color : color.toHexString())}
          >
            <ColorPicker showText />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {mode === "edit" && (
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
        <Col span={mode === "edit" ? 12 : 24}>
          <Form.Item name="requiredPetals" label="Số cánh hoa yêu cầu">
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Col>
      </Row>

      <div style={{ marginTop: 24, textAlign: "right" }}>
        <Space>
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            {mode === "create" ? "Tạo mới" : "Lưu lại"}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default ChapterInfoTab;
