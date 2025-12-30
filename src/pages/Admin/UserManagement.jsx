import { Card, Button, Table, Spin, message, Modal, Tag } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import userService from "@services/user.service";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xóa Người Dùng",
      content: "Bạn có chắc chắn muốn xóa?",
      onOk: async () => {
        try {
          await userAPI.delete(id);
          message.success("Xóa thành công");
          fetchUsers();
        } catch (error) {
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const roleColors = {
    admin: "red",
    customer: "blue",
    researcher: "green",
    curator: "purple",
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email", ellipsis: true },
    { title: "Số ĐT", dataIndex: "phone", key: "phone" },
    {
      title: "Vai Trò",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={roleColors[role] || "default"}>{role}</Tag>,
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{ marginRight: 8 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <Card
        title="Quản Lý Người Dùng"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm Mới
          </Button>
        }
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default UserManagement;
