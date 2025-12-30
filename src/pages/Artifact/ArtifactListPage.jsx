import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Modal,
  Space,
  Tag,
} from "antd";
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
    filters,
    searchTerm,
    selectedIds,
    fetchAll,
    create,
    update,
    remove,
    handleTableChange,
    updateFilters,
    clearFilters,
    search,
    batchDelete,
    setSelectedIds,
    exportData,
    importData,
  } = useCRUD(artifactService, {
    pageSize: 10,
    autoFetch: true,
    defaultSort: "createdAt",
    defaultOrder: "desc",
  });

  // Filter definitions
  const filterDefinitions = [
    {
      key: "artifact_type",
      placeholder: "Chọn loại",
      width: 150,
      options: [
        { label: "Điêu khắc", value: "sculpture" },
        { label: "Tranh vẽ", value: "painting" },
        { label: "Gốm sứ", value: "pottery" },
        { label: "Kim loại", value: "metalwork" },
        { label: "Dệt may", value: "textile" },
      ],
    },
    {
      key: "condition",
      placeholder: "Tình trạng",
      width: 130,
      options: [
        { label: "Tuyệt vời", value: "excellent" },
        { label: "Tốt", value: "good" },
        { label: "Khá", value: "fair" },
        { label: "Kém", value: "poor" },
      ],
    },
    {
      key: "category",
      placeholder: "Danh mục",
      width: 150,
      options: [
        { label: "Nhạc cụ", value: "Nhạc cụ" },
        { label: "Vũ khí", value: "Vũ khí" },
        { label: "Trang sức", value: "Trang sức" },
        { label: "Đồ gốm", value: "Đồ gốm" },
      ],
    },
  ];

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: true,
      fixed: "left",
    },
    {
      title: "Tên Hiện Vật",
      dataIndex: "name",
      key: "name",
      width: 250,
      ellipsis: true,
      fixed: "left",
      sorter: true,
    },
    {
      title: "Loại",
      dataIndex: "artifact_type",
      key: "artifact_type",
      width: 120,
      sorter: true,
    },
    {
      title: "Danh Mục",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Thời Kỳ",
      dataIndex: "period",
      key: "period",
      width: 150,
    },
    {
      title: "Tình Trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      render: (condition) => {
        const colorMap = {
          excellent: "green",
          good: "blue",
          fair: "orange",
          poor: "red",
        };
        const textMap = {
          excellent: "Tuyệt vời",
          good: "Tốt",
          fair: "Khá",
          poor: "Kém",
        };
        return (
          <Tag color={colorMap[condition] || "default"}>
            {textMap[condition] || condition}
          </Tag>
        );
      },
    },
    {
      title: "Đánh Giá",
      dataIndex: "rating",
      key: "rating",
      width: 100,
      sorter: true,
      render: (rating) => (rating ? `⭐ ${rating.toFixed(1)}` : "N/A"),
    },
    {
      title: "Lượt Xem",
      dataIndex: "view_count",
      key: "view_count",
      width: 100,
      sorter: true,
      render: (count) => count?.toLocaleString() || 0,
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleModalOk = async (values) => {
    const success = editingId
      ? await update(editingId, values)
      : await create(values);
    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <DataTable
        data={data}
        loading={loading}
        columns={columns}
        pagination={pagination}
        onPaginationChange={handleTableChange}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={remove}
        onRefresh={fetchAll}
        searchable={true}
        searchPlaceholder="Tìm kiếm hiện vật..."
        searchValue={searchTerm}
        onSearch={search}
        filters={filterDefinitions}
        filterValues={filters}
        onFilterChange={(key, value) => updateFilters({ [key]: value })}
        onClearFilters={clearFilters}
        batchOperations={true}
        selectedRowKeys={selectedIds}
        onSelectChange={setSelectedIds}
        onBatchDelete={batchDelete}
        importable={true}
        exportable={true}
        onImport={importData}
        onExport={() => exportData("xlsx")}
        title="Quản Lý Hiện Vật"
        rowKey="id"
      />

      <FormModal
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        form={form}
        title={editingId ? "Chỉnh Sửa Hiện Vật" : "Thêm Hiện Vật Mới"}
        loading={loading}
        width={700}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên Hiện Vật"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên hiện vật" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô Tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <TextArea rows={4} placeholder="Nhập mô tả chi tiết" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="artifact_type"
              label="Loại"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select
                placeholder="Chọn loại"
                options={[
                  { label: "Điêu khắc", value: "sculpture" },
                  { label: "Tranh vẽ", value: "painting" },
                  { label: "Gốm sứ", value: "pottery" },
                  { label: "Kim loại", value: "metalwork" },
                  { label: "Dệt may", value: "textile" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="category" label="Danh Mục">
              <Select
                placeholder="Chọn danh mục"
                options={[
                  { label: "Nhạc cụ", value: "Nhạc cụ" },
                  { label: "Vũ khí", value: "Vũ khí" },
                  { label: "Trang sức", value: "Trang sức" },
                  { label: "Đồ gốm", value: "Đồ gốm" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="period" label="Thời Kỳ">
              <Input placeholder="VD: Đông Sơn" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="condition" label="Tình Trạng">
              <Select
                placeholder="Chọn tình trạng"
                options={[
                  { label: "Tuyệt vời", value: "excellent" },
                  { label: "Tốt", value: "good" },
                  { label: "Khá", value: "fair" },
                  { label: "Kém", value: "poor" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="origin" label="Nguồn Gốc">
              <Input placeholder="Nhập nguồn gốc" />
            </Form.Item>
          </Col>
        </Row>
      </FormModal>
    </div>
  );
};

export default ArtifactListPage;
