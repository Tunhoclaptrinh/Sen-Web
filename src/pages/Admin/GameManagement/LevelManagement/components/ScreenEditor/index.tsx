import { Form, Select, Button, Input, Space, message } from "antd";
import { useEffect, useState } from "react";
import { Screen, SCREEN_TYPES, ScreenType } from "@/types/game.types";
import adminScreenService from "@/services/admin-screen.service";

interface ScreenEditorProps {
  levelId: number;
  screen?: Screen | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ScreenEditor: React.FC<ScreenEditorProps> = ({ levelId, screen, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<ScreenType>(SCREEN_TYPES.DIALOGUE);

  useEffect(() => {
    if (screen) {
      form.setFieldsValue(screen);
      setType(screen.type);
    } else {
      form.resetFields();
      setType(SCREEN_TYPES.DIALOGUE);
      form.setFieldsValue({ type: SCREEN_TYPES.DIALOGUE });
    }
  }, [screen, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (screen) {
        // Update
        const res = await adminScreenService.updateScreen(levelId, screen.id, values);
        if (res.success) {
          message.success("Cập nhật màn chơi thành công");
          onSuccess();
        }
      } else {
        // Create
        // Add default content structure based on type if needed
        const payload = { ...values };
        const res = await adminScreenService.addScreen(levelId, payload);
        if (res.success) {
           message.success("Thêm màn chơi thành công");
           onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ type: SCREEN_TYPES.DIALOGUE }}
    >
      <Form.Item name="type" label="Loại Màn hình" rules={[{ required: true }]}>
        <Select onChange={(val) => setType(val)}>
          {Object.keys(SCREEN_TYPES).map((key) => (
            <Select.Option key={key} value={key}>
              {key}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* Dynamic Fields based on Type */}
      {type === SCREEN_TYPES.QUIZ && (
          <>
              <Form.Item name="question" label="Câu hỏi" rules={[{ required: true }]}>
                  <Input.TextArea rows={2} />
              </Form.Item>
               <Form.Item name="time_limit" label="Thời gian (giây)">
                  <Input type="number" />
              </Form.Item>
              {/* Note: Options editing would go here (complex list) */}
              <p style={{color: 'orange'}}>* Chức năng sửa đáp án chi tiết đang phát triển</p>
          </>
      )}

      {type === SCREEN_TYPES.DIALOGUE && (
           <>
              {/* Note: Dialogue lines editing */}
              <p style={{color: 'orange'}}>* Chức năng sửa hội thoại chi tiết đang phát triển</p>
           </>
      )}

      {/* Common ID field (Hidden for create/update usually auto-managed, but valid to show) */}
      {!screen && (
           <Form.Item name="id" label="ID Màn chơi (Tự động sinh nếu để trống)">
               <Input placeholder="VD: screen_01" />
           </Form.Item>
      )}

      <Space style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Lưu
        </Button>
        <Button onClick={onCancel}>Hủy</Button>
      </Space>
    </Form>
  );
};

export default ScreenEditor;
