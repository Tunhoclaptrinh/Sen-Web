// ============================================
// src/pages/Auth/LoginPage.jsx - Login Page
// ============================================
import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      await login(values);
      navigate('/'); // Redirect to home after successful login
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
          maxWidth: 450,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              🌸 SEN
            </Title>
            <Text type="secondary">
              Đăng nhập để khám phá di sản văn hóa Việt Nam
            </Text>
          </div>

          {/* Login Form */}
          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={handleLogin}
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="user@sen.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="******" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LoginOutlined />}
                block
                size="large"
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          <Divider plain>Hoặc</Divider>

          {/* Register Link */}
          <div style={{ textAlign: 'center' }}>
            <Text>Chưa có tài khoản? </Text>
            <Link to="/register">
              <Button type="link" style={{ padding: 0 }}>
                Đăng ký ngay
              </Button>
            </Link>
          </div>

          {/* Demo Account */}
          <Card
            size="small"
            style={{
              background: '#e6f7ff',
              border: '1px solid #91d5ff',
            }}
          >
            <Text strong>Tài khoản demo:</Text>
            <br />
            <Text code>Email: huong.do@sen.com</Text>
            <br />
            <Text code>Password: 123456</Text>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
