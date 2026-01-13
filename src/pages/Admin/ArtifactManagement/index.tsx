import {
  Space,
  Tag,
  Tooltip,
  Button,
  Popconfirm
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { Artifact } from "@/types";
import DataTable from "@/components/common/DataTable";

import ArtifactDetailModal from "./components/DetailModal";
import ArtifactForm from "./components/Form";
import ArtifactStats from "./components/Stats";
import { useArtifactModel } from "./model";

const ArtifactManagement = () => {
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
    deleteArtifact,
    batchDeleteArtifacts,
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
    closeDetail
  } = useArtifactModel();

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
      title: "Tên Hiện vật",
      dataIndex: "name",
      key: "name_like",
      width: 250,
      searchable: true,
      align: "left" as const,
    },
    {
      title: "Loại hình",
      dataIndex: "artifact_type",
      key: "artifact_type",
      width: 150,
      filters: [
        { text: "Sculpture", value: "sculpture" },
        { text: "Painting", value: "painting" },
        { text: "Pottery", value: "pottery" },
      ],
      filteredValue: filters.artifact_type ? (Array.isArray(filters.artifact_type) ? filters.artifact_type : [filters.artifact_type]) : null,
      render: (type: string) => <Tag color="purple">{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      render: (cond: string) => {
        let color = "blue";
        if (cond === 'excellent') color = "green";
        if (cond === 'poor') color = "red";
        return <Tag color={color}>{cond?.toUpperCase()}</Tag>;
      }
    },
    {
      title: "Trưng bày",
      dataIndex: "is_on_display",
      key: "is_on_display",
      width: 100,
      render: (onDisplay: boolean) => onDisplay ? <Tag color="green">YES</Tag> : <Tag>NO</Tag>,
    },
    {
      title: "Di sản",
      key: "heritage_count",
      width: 100,
      render: (_: any, record: any) => (
        <Tag color="cyan">{(record.related_heritage_ids || []).length} DS</Tag>
      ),
    },
    {
      title: "Lịch sử",
      key: "history_count",
      width: 100,
      render: (_: any, record: any) => (
        <Tag color="purple">{(record.related_history_ids || []).length} LS</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      align: "center" as const,
      render: (_: any, record: Artifact) => (
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
            onConfirm={() => deleteArtifact(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  return (
    <>
      <DataTable
        title="Quản lý Hiện vật"
        headerContent={<ArtifactStats stats={stats} loading={statsLoading} />}
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
        onDelete={deleteArtifact}
        onBatchDelete={batchDeleteArtifacts}
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
            key: "artifact_type",
            placeholder: "Loại hình",
            options: [
              { label: "Sculpture", value: "sculpture" },
              { label: "Painting", value: "painting" },
              { label: "Pottery", value: "pottery" },
            ],
          },
          {
            key: "condition",
            placeholder: "Tình trạng",
            options: [
              { label: "Excellent", value: "excellent" },
              { label: "Good", value: "good" },
              { label: "Fair", value: "fair" },
              { label: "Poor", value: "poor" },
            ],
          }
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
      />

      <ArtifactForm
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
      />

      <ArtifactDetailModal
        record={currentRecord}
        open={detailVisible}
        onCancel={closeDetail}
      />
    </>
  );
};

export default ArtifactManagement;
