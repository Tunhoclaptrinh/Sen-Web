import { useState } from "react";
import {
  Space,
  Button,
  Tag,
  Input,
  Select,
  Popconfirm,
  message,
  Avatar,
  Form
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { User } from "@/types";
import userService from "@/services/user.service"; 
import DataTable from "@/components/common/DataTable";
import FormModal from "@/components/common/FormModal";
import { useCRUD } from "@/hooks/useCRUD";
import dayjs from "dayjs";

const { Option } = Select;

const UserManagement = () => {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    create,
    update,
    remove,
    search,
    batchDelete,
    setSelectedIds,
    selectedIds
  } = useCRUD(userService, {
    pageSize: 10,
    onError: (action: any, error: any) => {
      console.error(`Error ${action} user:`, error);
      message.error(`Thao tác thất bại: ${error.message}`);
    },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // Columns definition
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Người dùng",
      dataIndex: "name",
      width: 250,
      render: (text: string, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      width: 120,
      render: (role: string) => {
        let color = "geekblue";
        if (role === "admin") color = "red";
        if (role === "editor") color = "green";
        return (
          <Tag color={color} key={role}>
            {role ? role.toUpperCase() : "UNKNOWN"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_: any, record: User) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="text"
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              type="text"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: User) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    await remove(id);
  };

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setFormOpen(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingId) {
      await update(editingId, values);
    } else {
      await create(values);
    }
    setFormOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <DataTable
        title="Quản lý Người Dùng"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        onAdd={handleCreate}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onDelete={(keys: any) => batchDelete(keys)}
      />

      <FormModal
        title={editingId ? "Cập nhật Người Dùng" : "Thêm mới Người Dùng"}
        open={formOpen}
        onCancel={() => setFormOpen(false)}
        onOk={() => form.submit()}
        form={form}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          {!editingId && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="******" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="Vai trò"
            initialValue="customer"
          >
            <Select>
              <Option value="customer">Khách hàng (Customer)</Option>
              <Option value="researcher">Nhà nghiên cứu (Researcher)</Option>
              <Option value="admin">Quản trị viên (Admin)</Option>
            </Select>
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
};

export default UserManagement;
