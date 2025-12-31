import { useState } from "react";
import {
  Form,
  Input,
  Select,

  Col,
  Space,
  Tag,
  Button,
  message,
  Tooltip,
  Avatar,
  Row,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,

} from "@ant-design/icons";
// @ts-ignore
import { useCRUD } from "../../hooks/useCRUD";
import artifactService from "../../services/artifact.service";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";

const { TextArea } = Input;

const ArtifactListPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Use CRUD Hook
  const {
    data,
    loading,
    pagination,
    selectedIds,

    create,
    update,
    remove,
    search, // Added search from useCRUD
    handleTableChange,
    setSelectedIds,
    batchDelete,
  } = useCRUD(artifactService, {
    pageSize: 10,
    onError: (action: any, error: any) => {
      message.error(`${action} thất bại: ${error.message}`);
    },
  });

  // Columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      key: "images",
      width: 100,
      render: (images: string[]) => (
        <Avatar
          shape="square"
          size={60}
          src={images && images.length > 0 ? images[0] : ""}
          icon={<EyeOutlined />}
        />
      ),
    },
    {
      title: "Tên hiện vật",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b style={{ color: "#1890ff" }}>{text}</b>,
    },
    {
      title: "Triều đại",
      dataIndex: "dynasty",
      key: "dynasty",
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Độ hiếm",
      dataIndex: "rarity",
      key: "rarity",
      render: (rarity: string) => {
        const colorMap: Record<string, string> = {
          common: "gray",
          rare: "blue",
          epic: "purple",
          legendary: "gold"
        };

        return <Tag color={colorMap[rarity] || "default"}>{rarity?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "orange" }} />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Actions
  const handleEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hiện vật này?")) {
      await remove(id);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    if (editingId) {
      await update(editingId, values);
    } else {
      await create(values);
    }
    setModalVisible(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <DataTable
        title="Quản lý Hiện Vật"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        searchable
        onSearch={search}
        onAdd={handleCreate}
        onDelete={(keys: any) => batchDelete(keys)}
        extraActions={[

        ]}
      />

      <FormModal
        title={editingId ? "Cập nhật Hiện Vật" : "Thêm mới Hiện Vật"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        form={form}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên hiện vật"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="Nhập tên hiện vật..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dynasty"
                label="Triều đại"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn triều đại">
                  <Select.Option value="Lý">Nhà Lý</Select.Option>
                  <Select.Option value="Trần">Nhà Trần</Select.Option>
                  <Select.Option value="Lê">Nhà Lê</Select.Option>
                  <Select.Option value="Nguyễn">Nhà Nguyễn</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true }]}
              >
                <Select placeholder="Loại hiện vật">
                  <Select.Option value="Gốm sứ">Gốm sứ</Select.Option>
                  <Select.Option value="Trang phục">Trang phục</Select.Option>
                  <Select.Option value="Vũ khí">Vũ khí</Select.Option>
                  <Select.Option value="Trang sức">Trang sức</Select.Option>
                  <Select.Option value="Điêu khắc">Điêu khắc</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="rarity" label="Độ hiếm" initialValue="common">
                <Select>
                  <Select.Option value="common">Phổ biến (Common)</Select.Option>
                  <Select.Option value="rare">Hiếm (Rare)</Select.Option>
                  <Select.Option value="epic">Cực hiếm (Epic)</Select.Option>
                  <Select.Option value="legendary">Huyền thoại (Legendary)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="images" label="Link hình ảnh (URL)" help="Nhập URL ảnh, cách nhau bởi dấu phẩy">
            <Input.TextArea rows={2} placeholder="https://example.com/image1.jpg" />
          </Form.Item>
          {/* Note: In real app use Upload component, simplified for now */}

          <Form.Item name="shortDescription" label="Mô tả ngắn">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </FormModal>
    </div>
  );
};

export default ArtifactListPage;
