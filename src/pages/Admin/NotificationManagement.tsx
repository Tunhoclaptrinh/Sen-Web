import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Space, 
  Alert, 
  notification as antdNotification,
  Divider,
  Tag
} from 'antd';
import { 
  SendOutlined, 
  InfoCircleOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  CompassOutlined,
  BankOutlined,
  GlobalOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { notificationService } from '@/services/notification.service';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NotificationManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const success = await notificationService.broadcastNotification({
        title: values.title,
        message: values.message,
        type: values.type,
        refId: values.refId ? Number(values.refId) : undefined
      });

      if (success) {
        antdNotification.success({
          message: 'Thành công',
          description: 'Thông báo đã được phát tới toàn bộ người dùng.',
          placement: 'topRight',
        });
        form.resetFields(['title', 'message', 'refId']);
      }
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      antdNotification.error({
        message: 'Lỗi',
        description: 'Không thể phát thông báo. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: 'system', label: 'Hệ thống', icon: <InfoCircleOutlined />, color: 'blue' },
    { value: 'heritage', label: 'Di tích', icon: <CompassOutlined />, color: 'cyan' },
    { value: 'artifact', label: 'Cổ vật', icon: <BankOutlined />, color: 'orange' },
    { value: 'exhibition', label: 'Triển lãm', icon: <GlobalOutlined />, color: 'purple' },
    { value: 'quest', label: 'Nhiệm vụ', icon: <TrophyOutlined />, color: 'gold' },
    { value: 'reward', label: 'Phần thưởng', icon: <CheckCircleOutlined />, color: 'green' },
    { value: 'learning', label: 'Học tập', icon: <ReadOutlined />, color: 'magenta' },
    { value: 'social', label: 'Cộng đồng', icon: <WarningOutlined />, color: 'volcano' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Quản lý Thông báo</Title>
      <Paragraph type="secondary">
        Soạn thảo và gửi thông báo hệ thống tới toàn bộ người dùng trên nền tảng.
      </Paragraph>

      <Alert
        message="Lưu ý quan trọng"
        description="Thông báo sau khi phát sẽ xuất hiện trong danh sách thông báo của TẤT CẢ người dùng ngay lập tức. Hãy kiểm tra kỹ nội dung trước khi gửi."
        type="warning"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card bordered={false} className="broadcast-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: 'system' }}
        >
          <Form.Item
            label="Loại thông báo"
            name="type"
            rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
          >
            <Select size="large">
              {notificationTypes.map((t) => (
                <Option key={t.value} value={t.value}>
                  <Space>
                    <span style={{ color: t.color }}>{t.icon}</span>
                    {t.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tiêu đề thông báo"
            name="title"
            rules={[
              { required: true, message: 'Vui lòng nhập tiêu đề' },
              { max: 100, message: 'Tiêu đề không quá 100 ký tự' }
            ]}
          >
            <Input size="large" placeholder="Ví dụ: Cập nhật hệ thống mới" />
          </Form.Item>

          <Form.Item
            label="Nội dung thông báo"
            name="message"
            rules={[
              { required: true, message: 'Vui lòng nhập nội dung' },
              { min: 10, message: 'Nội dung tối thiểu 10 ký tự' }
            ]}
          >
            <TextArea 
              rows={6} 
              placeholder="Nhập nội dung chi tiết thông báo..." 
            />
          </Form.Item>

          <Form.Item
            label="ID Tham chiếu (Tùy chọn)"
            name="refId"
            help="ID của Di tích, Cổ vật hoặc Triển lãm để người dùng có thể nhấp vào xem chi tiết."
          >
            <Input size="large" type="number" placeholder="Ví dụ: 123" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SendOutlined />}
              loading={loading}
              block
              style={{ height: '48px', fontSize: '16px', fontWeight: 'bold' }}
            >
              Phát thông báo ngay
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Title level={4}>Xem trước hiển thị (Mockup)</Title>
        <Card size="small" style={{ background: '#fdfcf0', border: '1px solid #c5a065' }}>
          <Space align="start" size={16}>
            <div style={{ 
              width: 40, height: 40, background: '#fff1f0', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <InfoCircleOutlined style={{ color: '#f5222d', fontSize: 20 }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 15, display: 'block' }}>Tiêu đề ví dụ</Text>
              <Text type="secondary" style={{ fontSize: 13 }}>Nội dung ví dụ của thông báo sẽ hiển thị ở đây...</Text>
              <div style={{ marginTop: 8 }}>
                 <Tag color="orange">Mới</Tag>
                 <Text type="secondary" style={{ fontSize: 11 }}>Vừa xong</Text>
              </div>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default NotificationManagement;
