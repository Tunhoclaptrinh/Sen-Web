import { useState } from "react";
import { Form, Input, Button, Card, Typography, message, Divider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { login, register } from "../../store/slices/authSlice";
// import bg from "@/assets/images/background.png";

const { Title, Text } = Typography;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      if (isLogin) {
        await dispatch(login(values)).unwrap();
        message.success("Đăng nhập thành công!");
        navigate("/");
      } else {
        await dispatch(register(values)).unwrap();
        message.success("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true);
      }
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (_: any, value: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value || phoneRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Số điện thoại không hợp lệ!"));
  };

  const validateEmail = (_: any, value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Email không hợp lệ!"));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={2} style={{ color: "#d4a574", marginBottom: 8 }}>
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </Title>
          <Text type="secondary">
            {isLogin
              ? "Chào mừng bạn quay trở lại với SEN"
              : "Tạo tài khoản để khám phá di sản"}
          </Text>
        </div>

        <Form
          name="auth_form"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          {/* Tên hiển thị (chỉ khi đăng ký) */}
          {!isLogin && (
            <Form.Item
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên hiển thị!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên hiển thị" />
            </Form.Item>
          )}

          {/* Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { validator: validateEmail }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          {/* Số điện thoại (chỉ khi đăng ký) */}
          {!isLogin && (
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                { validator: validatePhone }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
            </Form.Item>
          )}

          {/* Mật khẩu */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          {/* Xác nhận mật khẩu (chỉ khi đăng ký) */}
          {!isLogin && (
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                background: "linear-gradient(to right, #d4a574, #b8860b)",
                border: "none",
                marginTop: 8,
              }}
            >
              {isLogin ? "Đăng Nhập" : "Đăng Ký"}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>Hoặc tiếp tục với</Divider>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
            marginTop: 16,
          }}
        >
          <Button
            shape="circle"
            icon={<GoogleOutlined style={{ color: "#DB4437" }} />}
            size="large"
          />
          <Button
            shape="circle"
            icon={<FacebookOutlined style={{ color: "#4267B2" }} />}
            size="large"
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Text>
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <a
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: "#d4a574", fontWeight: 600 }}
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </a>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
