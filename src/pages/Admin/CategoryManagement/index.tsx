import React from "react";
import {Button, Space, Modal, Form, Input, Select} from "antd";
import {useCategoryModel} from "./model";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";

const CategoryManagement: React.FC = () => {
  const model = useCategoryModel();
  const {user} = useAuth();

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      searchable: true, // Enable search on this column
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Danh mục cha",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId: number) => {
        const parent = model.data.find((c: any) => c.id === parentId);
        return parent ? parent.name : "-";
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      align: "center" as const,
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Danh mục Văn hóa"
        user={user}
        loading={model.loading}
        columns={columns}
        dataSource={model.data}
        pagination={model.pagination}
        onChange={model.handleTableChange}
        searchable
        onSearch={model.search}
        onAdd={model.openCreate}
        onEdit={model.openEdit}
        onDelete={model.remove}
        // Full Features Sync
        rowSelection={{
          selectedRowKeys: model.selectedIds,
          onChange: model.setSelectedIds,
        }}
        onBatchDelete={model.batchDelete}
        batchOperations={true}
        onRefresh={model.refresh}
      />

      <Modal
        title={model.currentRecord ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" initialValues={model.currentRecord || {}} onFinish={model.handleSubmit}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              {required: true, message: "Vui lòng nhập tên danh mục"},
              {min: 3, message: "Tên danh mục yêu cầu tối thiểu 3 ký tự"},
            ]}
          >
            <Input placeholder="Ví dụ: Kiến trúc cổ, Nghệ thuật" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả" rules={[{min: 10, message: "Mô tả yêu cầu tối thiểu 10 ký tự"}]}>
            <Input.TextArea rows={4} placeholder="Mô tả về danh mục này" />
          </Form.Item>
          <Form.Item name="icon" label="Icon (Emoji hoặc Class)">
            <Input placeholder="Ví dụ: 🏯, 🎨" />
          </Form.Item>
          <Form.Item name="slug" label="Slug (Để trống để tự động tạo)">
            <Input placeholder="Ví dụ: kien-truc-co" />
          </Form.Item>
          <Form.Item name="parentId" label="Danh mục cha">
            <Select placeholder="Chọn danh mục cha" allowClear>
              {model.data
                .filter((cat: any) => cat.id !== model.currentRecord?.id)
                .map((cat: any) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item style={{marginBottom: 0, textAlign: "right"}}>
            <Space>
              <Button onClick={model.closeForm}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={model.loading}>
                {model.currentRecord ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoryManagement;
