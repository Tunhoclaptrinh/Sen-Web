import {
  Tag
} from "antd";
import { 
  ArtifactType, 
  ArtifactCondition, 
  ArtifactTypeLabels, 
  ArtifactConditionLabels 
} from "@/types";
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
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image: string) => {
        if (!image) return null;
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const apiHost = apiBase.replace(/\/api$/, '');
        const src = image.startsWith('http') ? image : `${apiHost}${image}`;
        return (
          <img 
            src={src} 
            alt="Artifact" 
            style={{ 
              width: 80, 
              height: 50, 
              objectFit: 'cover', 
              borderRadius: 4,
              border: '1px solid #f0f0f0' 
            }} 
          />
        );
      },
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
      filters: Object.values(ArtifactType).map(type => ({
        text: ArtifactTypeLabels[type],
        value: type
      })),
      filteredValue: filters.artifact_type ? (Array.isArray(filters.artifact_type) ? filters.artifact_type : [filters.artifact_type]) : null,
      render: (type: ArtifactType) => (
        <Tag color="purple">{ArtifactTypeLabels[type]?.toUpperCase() || type}</Tag>
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      filters: Object.values(ArtifactCondition).map(cond => ({
        text: ArtifactConditionLabels[cond],
        value: cond
      })),
      filteredValue: filters.condition ? (Array.isArray(filters.condition) ? filters.condition : [filters.condition]) : null,
      render: (cond: ArtifactCondition) => {
        let color = "blue";
        if (['excellent', 'EXCELLENT'].includes(cond)) color = "green";
        if (['poor', 'POOR'].includes(cond)) color = "red";
        return <Tag color={color}>{ArtifactConditionLabels[cond]?.toUpperCase() || cond}</Tag>;
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
            options: Object.values(ArtifactType).map(type => ({
                label: ArtifactTypeLabels[type],
                value: type
            })),
          },
          {
            key: "condition",
            placeholder: "Tình trạng",
            options: Object.values(ArtifactCondition).map(cond => ({
                label: ArtifactConditionLabels[cond],
                value: cond
            })),
          },
          {
            key: "is_on_display",
            placeholder: "Trưng bày",
            options: [
                { label: "Đang trưng bày", value: true },
                { label: "Trong kho", value: false },
            ]
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
