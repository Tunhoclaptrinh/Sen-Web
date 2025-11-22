import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Divider,
  Typography,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { login } from "../../store/slices/authSlice";

const { Title, Text, Paragraph } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    try {
      const result = await dispatch(
        login({
          email: values.email,
          password: values.password,
        }),
      ).unwrap();

      message.success("✅ Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      message.error(`❌ ${error || "Đăng nhập thất bại"}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 12,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
          <Title level={2} style={{ margin: 0, color: "#d4a574" }}>
            CultureVault
          </Title>
          <Paragraph style={{ color: "#8c8c8c", marginBottom: 0 }}>
            Đăng nhập để khám phá di sản văn hóa
          </Paragraph>
        </div>

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập email"
              size="large"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
              style={{ borderRadius: 6 }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {/* Remember & Forgot */}
          <Row justify="space-between" style={{ marginBottom: 24 }}>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            <Link to="/forgot-password">
              <Text type="danger">Quên mật khẩu?</Text>
            </Link>
          </Row>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                background: "#d4a574",
                borderColor: "#d4a574",
                fontWeight: "bold",
                borderRadius: 6,
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Hoặc</Divider>

        {/* Social Login (placeholder) */}
        <Space style={{ width: "100%", marginBottom: 24 }}>
          <Button block style={{ borderRadius: 6 }} disabled>
            📱 Google
          </Button>
          <Button block style={{ borderRadius: 6 }} disabled>
            📱 Facebook
          </Button>
        </Space>

        {/* Register Link */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Text>Chưa có tài khoản? </Text>
          <Link to="/register" style={{ color: "#d4a574", fontWeight: "bold" }}>
            Đăng ký ngay
          </Link>
        </div>

        {/* Demo Account */}
        <div
          style={{
            marginTop: 24,
            padding: 12,
            background: "#f5f5f5",
            borderRadius: 6,
            border: "1px solid #e8e8e8",
            fontSize: 12,
            color: "#8c8c8c",
          }}
        >
          <strong>📝 Tài khoản demo:</strong>
          <div>Email: demo@example.com</div>
          <div>Password: password123</div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
