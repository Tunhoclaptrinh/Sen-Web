import {
  Form,
  Input,
  Button,
  Card,
  message,
  Space,
  Divider,
  Typography,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@store/slices/authSlice";
import styles from "./Auth.module.css";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    dispatch(login(values))
      .unwrap()
      .then(() => {
        message.success("Đăng nhập thành công!");
        navigate("/");
      })
      .catch((error) => {
        message.error(error.message || "Đăng nhập thất bại");
      });
  };

  return (
    <Card
      style={{
        width: 400,
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
      title={
        <Title level={3} style={{ margin: 0 }}>
          Đăng Nhập
        </Title>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật Khẩu"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ marginTop: 8 }}
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider>Hoặc</Divider>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Text>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </Text>
      </Space>
    </Card>
  );
};

export default Login;
