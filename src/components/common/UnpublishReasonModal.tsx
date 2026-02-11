import React from "react";
import {Modal, Form, Input, Alert} from "antd";

interface UnpublishReasonModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  title?: string;
}

const UnpublishReasonModal: React.FC<UnpublishReasonModalProps> = ({
  open,
  onCancel,
  onConfirm,
  loading,
  title = "Yêu cầu gỡ bài",
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onConfirm(values.reason);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
      destroyOnClose
    >
      <Alert
        message="Lưu ý"
        description="Yêu cầu gỡ bài sẽ được Admin phê duyệt trong vòng 3 ngày. Nếu sau 3 ngày không có phản hồi, bài sẽ tự động được gỡ."
        type="info"
        showIcon
        style={{marginBottom: 16}}
      />
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="Lý do gỡ bài" rules={[{required: true, message: "Vui lòng nhập lý do gỡ bài"}]}>
          <Input.TextArea rows={4} placeholder="Ví dụ: Cập nhật thông tin mới, lỗi nội dung, thay đổi kế hoạch..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UnpublishReasonModal;
