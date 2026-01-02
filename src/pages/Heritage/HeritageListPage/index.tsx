import { useState } from "react";
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
import { useCRUD } from "@hooks/useCRUD";
import heritageService from "@services/heritage.service";
import DataTable from "@components/common/DataTable";
import FormModal from "@components/common/FormModal";
import type { HeritageSite } from "@/types";

const { TextArea } = Input;

/**
 * Heritage List Page
 * Tương thích 100% với BaseController và BaseService backend
 */
const HeritageListPage = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<HeritageSite | null>(null);

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
  } = useCRUD(heritageService, {
    pageSize: 10,
    autoFetch: true, // Auto fetch on mount
    initialFilters: {},
    defaultSort: "createdAt",
    defaultOrder: "desc",
    successMessage: {
      create: "Thêm di sản thành công",
      update: "Cập nhật di sản thành công",
      delete: "Xóa di sản thành công",
    },
  });

  // Filter definitions
  const filterDefinitions = [
    {
      key: "region",
      placeholder: "Chọn vùng",
      width: 150,
      options: [
        { label: "Hà Nội", value: "Hà Nội" },
        { label: "Huế", value: "Huế" },
        { label: "Hội An", value: "Hội An" },
        { label: "Quảng Nam", value: "Quảng Nam" },
        { label: "Đà Nẵng", value: "Đà Nẵng" },
      ],
    },
    {
      key: "type",
      placeholder: "Chọn loại",
      width: 150,
      options: [
        { label: "Di tích", value: "monument" },
        { label: "Đền chùa", value: "temple" },
        { label: "Bảo tàng", value: "museum" },
        { label: "Thành cổ", value: "ancient_city" },
      ],
    },
    {
      key: "unesco_listed",
      placeholder: "UNESCO",
      width: 120,
      options: [
        { label: "Có", value: true },
        { label: "Không", value: false },
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
      fixed: "left" as const,
    },
    {
      title: "Tên Di Sản",
      dataIndex: "name",
      key: "name",
      width: 250,
      ellipsis: true,
      fixed: "left" as const,
      sorter: true,
    },
    {
      title: "Vùng",
      dataIndex: "region",
      key: "region",
      width: 120,
      sorter: true,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 150,
      sorter: true,
      render: (type: string) => {
        const typeMap: any = {
          monument: "Di tích",
          temple: "Đền chùa",
          museum: "Bảo tàng",
          ancient_city: "Thành cổ",
        };
        return typeMap[type] || type;
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Năm Thành Lập",
      dataIndex: "year_established",
      key: "year_established",
      width: 130,
      sorter: true,
      render: (year: any) => year || "N/A",
    },
    {
      title: "Phí Vào Cửa",
      dataIndex: "entrance_fee",
      key: "entrance_fee",
      width: 120,
      sorter: true,
      render: (fee: any) => (fee ? `${fee.toLocaleString("vi-VN")} đ` : "Miễn phí"),
    },
    {
      title: "Đánh Giá",
      dataIndex: "rating",
      key: "rating",
      width: 100,
      sorter: true,
      render: (rating: any) => (rating ? `⭐ ${rating.toFixed(1)}` : "N/A"),
    },
    {
      title: "UNESCO",
      dataIndex: "unesco_listed",
      key: "unesco_listed",
      width: 100,
      filters: [
        { text: "Có", value: true },
        { text: "Không", value: false },
      ],
      render: (unesco: any) => (
        <Tag color={unesco ? "green" : "default"}>
          {unesco ? "Có" : "Không"}
        </Tag>
      ),
    },
  ];

  /**
   * Handle Add
   */
  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  /**
   * Handle Edit
   */
  const handleEdit = (record: any) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  /**
   * Handle View
   */
  const handleView = (record: any) => {
    setViewingRecord(record);
    setViewModalVisible(true);
  };

  /**
   * Handle Modal Submit
   */
  const handleModalOk = async (values: any) => {
    const success = editingId
      ? await update(editingId, values)
      : await create(values);

    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
    }
  };

  /**
   * Handle Modal Cancel
   */
  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  /**
   * Handle Delete
   */
  const handleDelete = async (id: any) => {
    await remove(id);
  };

  /**
   * Handle Search
   */
  const handleSearch = (value: string) => {
    search(value);
  };

  /**
   * Handle Filter Change
   */
  const handleFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  /**
   * Handle Clear Filters
   */
  const handleClearFilters = () => {
    clearFilters();
  };

  /**
   * Handle Export
   */
  const handleExport = async () => {
    await exportData("xlsx");
  };

  /**
   * Handle Import
   */
  const handleImport = async (file: any) => {
    const result = await importData(file);
    if (result) {
      Modal.info({
        title: "Kết Quả Import",
        content: (
          <div>
            <p>
              <strong>Thành công:</strong> {result.data?.success || 0} mục
            </p>
            <p>
              <strong>Thất bại:</strong> {result.data?.failed || 0} mục
            </p>
            {result.data?.errors && result.data.errors.length > 0 && (
              <div>
                <p>
                  <strong>Lỗi:</strong>
                </p>
                <ul>
                  {result.data.errors.slice(0, 5).map((err: any, idx: number) => (
                    <li key={idx}>
                      Row {err.row}: {err.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
      });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <DataTable
        // Data
        data={data}
        loading={loading}
        columns={columns}
        // Pagination
        pagination={pagination}
        onPaginationChange={handleTableChange}
        // CRUD Operations
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchAll}
        // Search
        searchable={true}
        searchPlaceholder="Tìm kiếm di sản..."
        searchValue={searchTerm}
        onSearch={handleSearch}
        // Filters
        filters={filterDefinitions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        // Batch Operations
        batchOperations={true}
        selectedRowKeys={selectedIds}
        onSelectChange={setSelectedIds}
        onBatchDelete={batchDelete}
        // Import/Export
        importable={true}
        exportable={true}
        onImport={handleImport}
        onExport={handleExport}
        // Customization
        title="Quản Lý Di Sản Văn Hóa"
        rowKey="id"
        size="middle"
      />

      {/* Create/Edit Modal */}
      <FormModal
        open={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
        form={form}
        title={editingId ? "Chỉnh Sửa Di Sản" : "Thêm Di Sản Mới"}
        loading={loading}
        width={700}
        initialValues={{}}
        footer={null}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên Di Sản"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên di sản" />
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
              name="region"
              label="Vùng"
              rules={[{ required: true, message: "Vui lòng chọn vùng" }]}
            >
              <Select
                placeholder="Chọn vùng"
                options={[
                  { label: "Hà Nội", value: "Hà Nội" },
                  { label: "Huế", value: "Huế" },
                  { label: "Hội An", value: "Hội An" },
                  { label: "Quảng Nam", value: "Quảng Nam" },
                  { label: "Đà Nẵng", value: "Đà Nẵng" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="type"
              label="Loại"
              rules={[{ required: true, message: "Vui lòng chọn loại" }]}
            >
              <Select
                placeholder="Chọn loại"
                options={[
                  { label: "Di tích", value: "monument" },
                  { label: "Đền chùa", value: "temple" },
                  { label: "Bảo tàng", value: "museum" },
                  { label: "Thành cổ", value: "ancient_city" },
                ]}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="address" label="Địa Chỉ">
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="year_established" label="Năm Thành Lập">
              <InputNumber
                placeholder="Nhập năm"
                style={{ width: "100%" }}
                min={0}
                max={new Date().getFullYear()}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="entrance_fee" label="Phí Vào Cửa (VNĐ)">
              <InputNumber
                placeholder="Nhập phí vào cửa"
                style={{ width: "100%" }}
                min={0}
                formatter={(value: any) =>
                  value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "") || ""}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="unesco_listed" label="UNESCO">
              <Select
                placeholder="Chọn"
                options={[
                  { label: "Có", value: true },
                  { label: "Không", value: false },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormModal>

      {/* View Detail Modal */}
      <Modal
        title="Chi Tiết Di Sản"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={700}
      >
        {viewingRecord && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <strong>Tên:</strong> {viewingRecord.name}
            </div>
            <div>
              <strong>Mô tả:</strong> {viewingRecord.description}
            </div>
            <div>
              <strong>Vùng:</strong> {viewingRecord.region}
            </div>
            <div>
              <strong>Loại:</strong> {viewingRecord.type}
            </div>
            <div>
              <strong>Địa chỉ:</strong> {viewingRecord.address || "N/A"}
            </div>
            <div>
              <strong>Năm thành lập:</strong>{" "}
              {viewingRecord.year_established || "N/A"}
            </div>
            <div>
              <strong>Phí vào cửa:</strong>{" "}
              {viewingRecord.entrance_fee
                ? `${viewingRecord.entrance_fee.toLocaleString("vi-VN")} đ`
                : "Miễn phí"}
            </div>
            <div>
              <strong>Đánh giá:</strong>{" "}
              {viewingRecord.rating
                ? `⭐ ${viewingRecord.rating.toFixed(1)}`
                : "N/A"}
            </div>
            <div>
              <strong>UNESCO:</strong>{" "}
              <Tag color={viewingRecord.unesco_listed ? "green" : "default"}>
                {viewingRecord.unesco_listed ? "Có" : "Không"}
              </Tag>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default HeritageListPage;
