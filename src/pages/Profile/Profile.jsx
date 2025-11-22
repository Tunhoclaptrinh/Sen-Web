import { Card, Form, Input, Button, Upload, message, Spin } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { userAPI } from "@api";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await userAPI.updateProfile(values);
      message.success("Cập nhật hồ sơ thành công!");
    } catch (error) {
      message.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="Hồ Sơ Cá Nhân" style={{ maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Số Điện Thoại"
            name="phone"
            rules={[
              {
                pattern: /^0[0-9]{9,10}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu Thay Đổi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};

export default Profile;
