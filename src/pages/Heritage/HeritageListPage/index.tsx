import { useState } from "react";
import { Modal, Space, Tag } from "antd";
import { useCRUD } from "@hooks/useCRUD";
import heritageService from "@services/heritage.service";
import DataTable from "@components/common/DataTable";
import type { HeritageSite } from "@/types";

/**
 * Heritage List Page
 * User-facing page to browse and view heritage sites (READ ONLY)
 * No create/edit/delete operations
 */
const HeritageListPage = () => {
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<HeritageSite | null>(null);

  // Use CRUD Hook (only for fetching data)
  const {
    data,
    loading,
    pagination,
    filters,
    searchTerm,
    fetchAll,
    handleTableChange,
    updateFilters,
    clearFilters,
    search,
  } = useCRUD(heritageService, {
    pageSize: 10,
    autoFetch: true,
    initialFilters: {},
    defaultSort: "createdAt",
    defaultOrder: "desc",
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
      key: "unescoListed",
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
      dataIndex: "yearEstablished",
      key: "yearEstablished",
      width: 130,
      sorter: true,
      render: (year: any) => year || "N/A",
    },
    {
      title: "Phí Vào Cửa",
      dataIndex: "entranceFee",
      key: "entranceFee",
      width: 120,
      sorter: true,
      render: (fee: any) =>
        fee ? `${fee.toLocaleString("vi-VN")} đ` : "Miễn phí",
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
      dataIndex: "unescoListed",
      key: "unescoListed",
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
   * Handle View - Open detail modal (READ ONLY)
   */
  const handleView = (record: any) => {
    setViewingRecord(record);
    setViewModalVisible(true);
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
        // View Only Operation
        onView={handleView}
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
        // Customization
        title="Danh Sách Di Sản Văn Hóa"
        rowKey="id"
        size="middle"
      />

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
              {viewingRecord.yearEstablished || "N/A"}
            </div>
            <div>
              <strong>Phí vào cửa:</strong>{" "}
              {viewingRecord.entranceFee
                ? `${viewingRecord.entranceFee.toLocaleString("vi-VN")} đ`
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
              <Tag color={viewingRecord.unescoListed ? "green" : "default"}>
                {viewingRecord.unescoListed ? "Có" : "Không"}
              </Tag>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default HeritageListPage;
