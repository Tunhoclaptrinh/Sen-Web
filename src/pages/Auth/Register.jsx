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
import {
  UserOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { register } from "@store/slices/authSlice";

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const onFinish = (values) => {
    const { confirmPassword, ...data } = values;
    dispatch(register(data))
      .unwrap()
      .then(() => {
        message.success("Đăng ký thành công!");
        navigate("/");
      })
      .catch((error) => {
        message.error(error.message || "Đăng ký thất bại");
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
          Đăng Ký
        </Title>
      }
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Tên"
          rules={[
            { required: true, message: "Vui lòng nhập tên" },
            { min: 2, message: "Tên phải ít nhất 2 ký tự" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Tên của bạn"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số Điện Thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^0[0-9]{9,10}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined />}
            placeholder="0xxxxxxxxx"
            size="large"
          />
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

        <Form.Item
          name="confirmPassword"
          label="Xác Nhận Mật Khẩu"
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
            Đăng Ký
          </Button>
        </Form.Item>
      </Form>

      <Divider>Hoặc</Divider>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Text>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </Text>
      </Space>
    </Card>
  );
};

export default Register;
