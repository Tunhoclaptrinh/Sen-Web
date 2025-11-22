import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  Progress,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { register } from "../../store/slices/authSlice";

const { Title, Text, Paragraph } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Kiểm tra độ mạnh của mật khẩu
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (!password) return 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z\d]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "#ff4d4f";
    if (passwordStrength <= 50) return "#faad14";
    if (passwordStrength <= 75) return "#1890ff";
    return "#52c41a";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Yếu";
    if (passwordStrength <= 50) return "Trung bình";
    if (passwordStrength <= 75) return "Khá";
    return "Mạnh";
  };

  const onFinish = async (values) => {
    if (!agreeTerms) {
      message.error("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    try {
      const { confirmPassword, ...data } = values;
      const result = await dispatch(register(data)).unwrap();

      message.success("✅ Đăng ký thành công! Vui lòng đăng nhập");
      navigate("/login");
    } catch (error) {
      message.error(`❌ ${error || "Đăng ký thất bại"}`);
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
          maxWidth: 500,
          borderRadius: 12,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
          <Title level={2} style={{ margin: 0, color: "#d4a574" }}>
            Tạo tài khoản
          </Title>
          <Paragraph style={{ color: "#8c8c8c", marginBottom: 0 }}>
            Bắt đầu khám phá di sản văn hóa
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
          {/* Name */}
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên" },
              { min: 2, message: "Tên phải ít nhất 2 ký tự" },
              { max: 50, message: "Tên không quá 50 ký tự" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập tên của bạn"
              size="large"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
              size="large"
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^0[0-9]{9,10}$/,
                message:
                  "Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 số)",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="0xxxxxxxxx"
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
              onChange={(e) => checkPasswordStrength(e.target.value)}
            />
          </Form.Item>

          {/* Password Strength */}
          {form.getFieldValue("password") && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Độ mạnh mật khẩu:
                </Text>
                <Text
                  style={{
                    color: getPasswordStrengthColor(),
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  {getPasswordStrengthText()}
                </Text>
              </div>
              <Progress
                percent={passwordStrength}
                strokeColor={getPasswordStrengthColor()}
                showInfo={false}
                size="small"
              />
            </div>
          )}

          {/* Confirm Password */}
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              style={{ borderRadius: 6 }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {/* Terms */}
          <Form.Item style={{ marginBottom: 24 }}>
            <Checkbox
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            >
              <Text style={{ fontSize: 13 }}>
                Tôi đồng ý với{" "}
                <Link to="/terms" style={{ color: "#d4a574" }}>
                  điều khoản sử dụng
                </Link>{" "}
                và{" "}
                <Link to="/privacy" style={{ color: "#d4a574" }}>
                  chính sách bảo mật
                </Link>
              </Text>
            </Checkbox>
          </Form.Item>

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
              disabled={!agreeTerms}
            >
              {loading ? "Đang đăng ký..." : "Đăng Ký"}
            </Button>
          </Form.Item>
        </Form>

        <Divider>Hoặc</Divider>

        {/* Login Link */}
        <div style={{ textAlign: "center" }}>
          <Text>Đã có tài khoản? </Text>
          <Link to="/login" style={{ color: "#d4a574", fontWeight: "bold" }}>
            Đăng nhập ngay
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
