// ============================================
// src/pages/Auth/RegisterPage.jsx - Register Page
// ============================================
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  PhoneOutlined,
  HomeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await register(values);
      navigate('/'); // Redirect to home after successful registration
    } catch (error) {
      // Error already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              🌸 Đăng Ký Tài Khoản
            </Title>
            <Text type="secondary">
              Tạo tài khoản để khám phá di sản văn hóa
            </Text>
          </div>

          {/* Register Form */}
          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={handleRegister}
            size="large"
          >
            <Form.Item
              name="name"
              label="Họ và Tên"
              rules={[
                { required: true, message: 'Vui lòng nhập họ tên!' },
                { min: 3, message: 'Họ tên ít nhất 3 ký tự!' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="user@example.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="******" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="******" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại không hợp lệ!',
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="0123456789" />
            </Form.Item>

            <Form.Item name="address" label="Địa chỉ">
              <Input
                prefix={<HomeOutlined />}
                placeholder="123 Street, City (Tùy chọn)"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                block
                size="large"
              >
                Đăng Ký
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Hoặc</Divider>

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <Text>Đã có tài khoản? </Text>
            <Link to="/login">
              <Button type="link" style={{ padding: 0 }}>
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default RegisterPage;
