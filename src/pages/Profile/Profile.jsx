import React from "react";
import { useSelector } from "react-redux";
import { Card, Descriptions } from "antd";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <div>Đang tải...</div>;

  return (
    <Card title="Hồ sơ cá nhân">
      <Descriptions bordered>
        <Descriptions.Item label="Họ tên">{user.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">
          {user.phone}
        </Descriptions.Item>
        <Descriptions.Item label="Vai trò">{user.role}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default Profile;
