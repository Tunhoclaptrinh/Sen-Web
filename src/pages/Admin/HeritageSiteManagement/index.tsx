import { Space, Tag, Tooltip, Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { HeritageSite } from "@/types";
import DataTable from "@/components/common/DataTable";

import HeritageDetailModal from "./components/DetailModal";
import HeritageForm from "./components/Form";
import HeritageStats from "./components/Stats";
import { useHeritageModel } from "./model";

const HeritageSiteManagement = () => {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    search,
    selectedIds,
    setSelectedIds,
    refresh,
    updateFilters,
    filters,
    clearFilters,
    stats,
    statsLoading,
    deleteHeritage,
    batchDeleteHeritages,
    exportData,
    importData,
    downloadTemplate,
    importLoading,
    exportLoading,
    handleSubmit,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  } = useHeritageModel();

  const onFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên Di Sản",
      dataIndex: "name",
      key: "name_like",
      width: 250,
      searchable: true,
      align: "left" as const,
    },
    {
      title: "Loại hình",
      dataIndex: "type",
      key: "type",
      width: 150,
      filters: [
        { text: "Monument", value: "monument" },
        { text: "Temple", value: "temple" },
        { text: "Museum", value: "museum" },
      ],
      filteredValue: filters.type
        ? Array.isArray(filters.type)
          ? filters.type
          : [filters.type]
        : null,
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: "Khu vực",
      dataIndex: "region",
      key: "region",
      width: 120,
      filters: [
        { text: "Bắc", value: "Bắc" },
        { text: "Trung", value: "Trung" },
        { text: "Nam", value: "Nam" },
      ],
      filteredValue: filters.region
        ? Array.isArray(filters.region)
          ? filters.region
          : [filters.region]
        : null,
    },
    {
      title: "UNESCO",
      dataIndex: "unesco_listed",
      key: "unesco_listed",
      width: 100,
      render: (listed: boolean) =>
        listed ? <Tag color="green">YES</Tag> : <Tag>NO</Tag>,
    },
    {
      title: "Giá vé",
      dataIndex: "entrance_fee",
      width: 120,
      render: (fee: number) => (fee ? `${fee.toLocaleString()} VND` : "Free"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: HeritageSite) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "orange" }} />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => deleteHeritage(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Quản lý Di sản Văn hóa"
        headerContent={<HeritageStats stats={stats} loading={statsLoading} />}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        onAdd={openCreate}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onView={openDetail}
        onEdit={openEdit}
        onDelete={deleteHeritage}
        onBatchDelete={batchDeleteHeritages}
        batchOperations={true}
        importable={true}
        importLoading={importLoading}
        exportable={true}
        exportLoading={exportLoading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
        onRefresh={refresh}
        filters={[
          {
            key: "type",
            placeholder: "Loại hình",
            options: [
              { label: "Di tích", value: "monument" },
              { label: "Đền chùa", value: "temple" },
              { label: "Bảo tàng", value: "museum" },
              { label: "Địa điểm khảo cổ", value: "archaeological_site" },
              { label: "Công trình lịch sử", value: "historic_building" },
              { label: "Di sản thiên nhiên", value: "natural_heritage" },
              { label: "Di sản phi vật thể", value: "intangible_heritage" },
            ],
          },
          {
            key: "region",
            placeholder: "Khu vực",
            options: [
              { label: "Miền Bắc", value: "Bắc" },
              { label: "Miền Trung", value: "Trung" },
              { label: "Miền Nam", value: "Nam" },
            ],
          },
          {
            key: "unesco_listed",
            placeholder: "UNESCO",
            options: [
              { label: "Có", value: true },
              { label: "Không", value: false },
            ],
          },
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
      />

      <HeritageForm
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
      />

      <HeritageDetailModal
        record={currentRecord}
        open={detailVisible}
        onCancel={closeDetail}
      />
    </>
  );
};

export default HeritageSiteManagement;
