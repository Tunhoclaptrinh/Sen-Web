import {
  Card,
  Form,
  Input,
  Button,
  message,
  Spin,
  Row,
  Col,
  Upload,
  Avatar,
  Tabs,
  Statistic,
} from "antd";
import {
  CameraOutlined,
  SaveOutlined,
  LockOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import userService from "@services/user.service";
import apiClient from "@config/axios.config";
import { getMe } from "@store/slices/authSlice";
import { RootState, AppDispatch } from "@/store";

const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
      setAvatar(user.avatar);
    }
  }, [user, form]);

  const onUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      await userService.updateProfile(values);
      message.success("✅ Cập nhật thành công!");
      dispatch(getMe());
    } catch (error) {
      message.error("❌ Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("✅ Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("❌ Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Spin spinning={loading}>
        <Tabs
          items={[
            {
              key: "profile",
              label: "👤 Thông Tin Cá Nhân",
              children: (
                <Row gutter={[24, 24]}>
                  {/* Avatar Section */}
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <Card style={{ textAlign: "center" }}>
                      <Avatar
                        size={120}
                        icon={<UserOutlined />}
                        src={avatar}
                        style={{ marginBottom: 16 }}
                      />
                      <div style={{ marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>{user?.name}</h3>
                        <p style={{ color: "#8c8c8c", margin: "8px 0 0 0" }}>
                          {user?.role === "admin"
                            ? "👨‍💼 Quản trị viên"
                            : "👤 Người dùng"}
                        </p>
                      </div>

                      <Upload
                        name="avatar"
                        showUploadList={false}
                        customRequest={async ({
                          file,
                          onSuccess,
                          onError,
                          onProgress,
                        }) => {
                          const formData = new FormData();
                          formData.append("file", file);

                          try {
                            const res: any = await apiClient.post(
                              "/upload",
                              formData,
                              {
                                headers: {
                                  "Content-Type": "multipart/form-data",
                                },
                                onUploadProgress: (e) => {
                                  if (onProgress && e.total) {
                                    onProgress({
                                      percent: Math.round(
                                        (e.loaded / e.total) * 100,
                                      ),
                                    });
                                  }
                                },
                              },
                            );

                            onSuccess && onSuccess(res);

                            const url =
                              res?.url ||
                              res?.data?.url ||
                              res?.data?.path ||
                              (res?.data && res.data[0] && res.data[0].url);
                            if (url) setAvatar(url);
                            message.success(
                              "✅ Cập nhật ảnh đại diện thành công",
                            );
                            dispatch(getMe());
                          } catch (err: any) {
                            onError && onError(err);
                            message.error("❌ Upload thất bại");
                          }
                        }}
                      >
                        <Button
                          icon={<CameraOutlined />}
                          block
                          style={{ marginBottom: 12 }}
                        >
                          Thay đổi ảnh
                        </Button>
                      </Upload>

                      <div
                        style={{
                          padding: 12,
                          background: "#f5f5f5",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "#8c8c8c",
                        }}
                      >
                        <p style={{ margin: "4px 0" }}>📧 {user?.email}</p>
                        <p style={{ margin: "4px 0" }}>📱 {user?.phone}</p>
                        <p style={{ margin: "4px 0" }}>
                          🗓️ Tham gia:{" "}
                          {user?.created_at && new Date(user?.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                      </div>
                    </Card>
                  </Col>

                  {/* Form Section */}
                  <Col xs={24} sm={16}>
                    <Card title="Cập Nhật Thông Tin">
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={onUpdateProfile}
                        requiredMark={false}
                      >
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
                            size="large"
                            placeholder="Nhập tên"
                          />
                        </Form.Item>

                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[
                            { type: "email", message: "Email không hợp lệ" },
                          ]}
                        >
                          <Input
                            prefix={<MailOutlined />}
                            size="large"
                            placeholder="Nhập email"
                            disabled
                          />
                        </Form.Item>

                        <Form.Item
                          name="phone"
                          label="Số Điện Thoại"
                          rules={[
                            {
                              pattern: /^0[0-9]{9,10}$/,
                              message: "Số điện thoại không hợp lệ",
                            },
                          ]}
                        >
                          <Input
                            prefix={<PhoneOutlined />}
                            size="large"
                            placeholder="0xxxxxxxxx"
                          />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            icon={<SaveOutlined />}
                            style={{
                              background: "#F43F5E",
                              borderColor: "#F43F5E",
                            }}
                            block
                          >
                            Lưu Thay Đổi
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: "password",
              label: "🔐 Đổi Mật Khẩu",
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card title="Đổi Mật Khẩu">
                      <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={onChangePassword}
                        requiredMark={false}
                      >
                        <Form.Item
                          name="currentPassword"
                          label="Mật Khẩu Hiện Tại"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mật khẩu hiện tại",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            size="large"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </Form.Item>

                        <Form.Item
                          name="newPassword"
                          label="Mật Khẩu Mới"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mật khẩu mới",
                            },
                            {
                              min: 6,
                              message: "Mật khẩu phải ít nhất 6 ký tự",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            size="large"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </Form.Item>

                        <Form.Item
                          name="confirmPassword"
                          label="Xác Nhận Mật Khẩu"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng xác nhận mật khẩu",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={<LockOutlined />}
                            size="large"
                            placeholder="Xác nhận mật khẩu mới"
                          />
                        </Form.Item>

                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            style={{
                              background: "#F43F5E",
                              borderColor: "#F43F5E",
                            }}
                          >
                            Đổi Mật Khẩu
                          </Button>
                        </Form.Item>
                      </Form>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title="💡 Gợi Ý Bảo Mật"
                      style={{ background: "#fffbe6" }}
                    >
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>Sử dụng mật khẩu mạnh (ít nhất 8 ký tự)</li>
                        <li>
                          Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt
                        </li>
                        <li>Không sử dụng mật khẩu trùng lặp</li>
                        <li>Đổi mật khẩu định kỳ (3 tháng một lần)</li>
                        <li>Không chia sẻ mật khẩu với ai</li>
                      </ul>
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: "stats",
              label: "📊 Thống Kê",
              children: (
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={8}>
                    <Card style={{ textAlign: "center" }}>
                      <Statistic
                        title="Bộ Sưu Tập"
                        value={5}
                        prefix="📚"
                        valueStyle={{ fontSize: 24 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ textAlign: "center" }}>
                      <Statistic
                        title="Yêu Thích"
                        value={12}
                        prefix="❤️"
                        valueStyle={{ fontSize: 24 }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card style={{ textAlign: "center" }}>
                      <Statistic
                        title="Đánh Giá"
                        value={8}
                        prefix="⭐"
                        valueStyle={{ fontSize: 24 }}
                      />
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Spin>
    </div>
  );
};

export default Profile;
