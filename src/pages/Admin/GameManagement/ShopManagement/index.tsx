import React from "react";
import {Button, Space, Modal, Form, Input, Tag, Select, InputNumber, Switch} from "antd";
import {ShoppingCartOutlined} from "@ant-design/icons";
import {useShopModel} from "./model";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import {getImageUrl} from "@/utils/image.helper";

const ShopManagement: React.FC = () => {
  const model = useShopModel();
  const {user} = useAuth();

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (url: string) =>
        url ? <img src={getImageUrl(url)} alt="item" style={{width: 40, height: 40, borderRadius: 4}} /> : null,
    },
    {
      title: "Tên vật phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: "Giá",
      key: "price",
      render: (_: any, record: any) => (
        <Tag color={record.currency === "petals" ? "pink" : "gold"}>
          {record.price} {record.currency === "petals" ? "Cánh sen" : "Xu"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) => (val ? <Tag color="green">ĐANG BÁN</Tag> : <Tag>HẾT HÀNG</Tag>),
    },
  ];

  const filters = [
    {
      key: "type",
      label: "Loại vật phẩm",
      type: "select" as const,
      options: [
        {label: "Avatar (Trang phục)", value: "avatar"},
        {label: "Title (Danh hiệu)", value: "title"},
        {label: "Theme (Giao diện)", value: "theme"},
        {label: "Collectible (Sưu tầm)", value: "collectible"},
        {label: "Hint", value: "hint"},
        {label: "Boost", value: "boost"},
        {label: "Character Skin", value: "character_skin"},
        {label: "Decoration", value: "decoration"},
      ],
    },
    {
      key: "currency",
      label: "Loại tiền tệ",
      type: "select" as const,
      options: [
        {label: "Xu (Coins)", value: "coins"},
        {label: "Cánh sen (Petals)", value: "petals"},
      ],
    },
    {
      key: "isActive",
      label: "Trạng thái",
      type: "select" as const,
      options: [
        {label: "Đang bán", value: true},
        {label: "Hết hàng", value: false},
      ],
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Cửa hàng vật phẩm"
        user={user}
        loading={model.loading}
        columns={columns}
        dataSource={model.data}
        pagination={model.pagination}
        onChange={model.handleTableChange}
        onRefresh={model.refresh}
        searchable
        onSearch={model.search}
        filters={filters}
        filterValues={model.filters}
        onFilterChange={(key, value) => model.updateFilters({[key]: value})}
        onClearFilters={model.clearFilters}
        onAdd={model.openCreate}
        onEdit={model.openEdit}
        onDelete={model.remove}
      />

      <Modal
        title={model.currentRecord ? "Chỉnh sửa vật phẩm" : "Thêm vật phẩm mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        width={650}
        destroyOnClose
      >
        <Form
          layout="vertical"
          initialValues={model.currentRecord || {currency: "coins", type: "avatar", isActive: true}}
          onFinish={model.handleSubmit}
        >
          <Form.Item name="name" label="Tên vật phẩm" rules={[{required: true, message: "Nhập tên"}]}>
            <Input prefix={<ShoppingCartOutlined />} placeholder="Ví dụ: Nón lá Sen" />
          </Form.Item>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="type" label="Loại vật phẩm">
              <Select>
                <Select.Option value="avatar">Avatar (Trang phục)</Select.Option>
                <Select.Option value="title">Title (Danh hiệu)</Select.Option>
                <Select.Option value="theme">Theme (Giao diện)</Select.Option>
                <Select.Option value="collectible">Collectible (Sưu tầm)</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="isActive" label="Đang mở bán" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
            <Form.Item name="price" label="Giá bán" rules={[{required: true, message: "Nhập giá"}]}>
              <InputNumber style={{width: "100%"}} min={0} />
            </Form.Item>
            <Form.Item name="currency" label="Loại tiền tệ">
              <Select>
                <Select.Option value="coins">Xu (Coins)</Select.Option>
                <Select.Option value="petals">Cánh sen (Petals)</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="image" label="Lên kết ảnh vật phẩm">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả công dụng hoặc ý nghĩa vật phẩm" />
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

export default ShopManagement;
