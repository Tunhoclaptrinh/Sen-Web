import { Tag, Tabs } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import { 
  ArtifactType, 
  ArtifactCondition, 
  ArtifactTypeLabels, 
  ArtifactConditionLabels 
} from "@/types";
import DataTable from "@/components/common/DataTable";

import ArtifactDetailModal from "@/pages/Admin/ArtifactManagement/components/DetailModal";
import ArtifactForm from "@/pages/Admin/ArtifactManagement/components/Form";
import ArtifactStats from "@/pages/Admin/ArtifactManagement/components/Stats";
import { useArtifactModel } from "@/pages/Admin/ArtifactManagement/model";

const ResearcherArtifactManagement = () => {
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
    submitReview,
    handleReject,
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
      render: (image: string | string[]) => {
        const srcRaw = resolveImage(image);
        if (!srcRaw) return null;
        const src = getImageUrl(srcRaw);
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
      render: (type: ArtifactType) => (
        <Tag color="purple">{ArtifactTypeLabels[type]?.toUpperCase() || type}</Tag>
      ),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => {
            const colors: any = {
                draft: 'default',
                pending: 'orange',
                published: 'green',
                rejected: 'red'
            };
            const labels: any = {
                draft: 'Nháp',
                pending: 'Chờ duyệt',
                published: 'Đã xuất bản',
                rejected: 'Từ chối'
            };
            return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
        }
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      render: (cond: ArtifactCondition) => {
        let color = "blue";
        if (['excellent', 'EXCELLENT'].includes(cond)) color = "green";
        if (['good', 'GOOD'].includes(cond)) color = "blue";
        if (['fair', 'FAIR'].includes(cond)) color = "orange";
        if (['poor', 'POOR'].includes(cond)) color = "red";
        return <Tag color={color}>{ArtifactConditionLabels[cond]?.toUpperCase() || cond}</Tag>;
      }
    },
  ];

  const tabItems = [
    { key: 'all', label: 'Tất cả (Của tôi)' },
    { key: 'draft', label: 'Bản nháp' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'published', label: 'Đã xuất bản' },
    { key: 'rejected', label: 'Bị từ chối' }
  ];

  const handleTabChange = (key: string) => {
     if (key === 'all') {
         updateFilters({ status: undefined });
     } else {
         updateFilters({ status: key });
     }
  };

  const getActiveTab = () => {
    if (filters.status) return filters.status;
    return 'all';
  };

  return (
    <>
      <DataTable
        title="Quản lý Hiện vật (Cá nhân)"
        headerContent={
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: '#fff', padding: '0 16px', borderRadius: '8px 8px 0 0' }}>
              <Tabs 
                activeKey={getActiveTab()} 
                items={tabItems} 
                onChange={handleTabChange}
                style={{ marginBottom: 0 }}
              />
            </div>
          </div>
        }
        loading={loading}
        permissionResource="artifacts"
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
        onSubmitReview={submitReview ? (record) => submitReview(record.id) : undefined}
        onApprove={undefined} // No approve
        onReject={undefined} // No reject
        onBatchDelete={batchDeleteArtifacts}
        batchOperations={true}
        batchActions={[
          {
            key: 'export',
            label: 'Export đã chọn',
            icon: <DownloadOutlined />,
            onClick: (ids: any[]) => exportData('xlsx', ids),
          }
        ]}
        importable={true}
        importLoading={importLoading}
        exportable={true}
        exportLoading={loading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData} 
        onRefresh={refresh}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
      />

      <ArtifactForm
        key={currentRecord?.id || 'create'}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <ArtifactDetailModal
        record={currentRecord}
        open={detailVisible}
        onCancel={closeDetail}
      />
    </>
  );
};

export default ResearcherArtifactManagement;
