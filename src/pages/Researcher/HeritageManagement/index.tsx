import { Tag, Tabs } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { getImageUrl, resolveImage } from "@/utils/image.helper";


import DataTable from "@/components/common/DataTable";

import HeritageDetailModal from "@/pages/Admin/HeritageSiteManagement/components/DetailModal";
import HeritageForm from "@/pages/Admin/HeritageSiteManagement/components/Form";

import {
  HeritageType,
  HeritageTypeLabels,
} from "@/types";
import { useHeritageModel } from "@/pages/Admin/HeritageSiteManagement/model";

const ResearcherHeritageManagement = () => {
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
    deleteHeritage,
    batchDeleteHeritages,
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
      render: (image: string | string[]) => {
        const srcRaw = resolveImage(image);
        if (!srcRaw) return null;
        const src = getImageUrl(srcRaw);
        return (
          <img 
            src={src} 
            alt="Heritage" 
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
      title: "Tên Di Sản",
      dataIndex: "name",
      key: "nameLike",
      width: 250,
      searchable: true,
      align: "left" as const,
    },
    {
      title: "Loại hình",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: HeritageType) => (
        <Tag color="blue">{HeritageTypeLabels[type]?.toUpperCase() || type}</Tag>
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
      title: "UNESCO",
      dataIndex: "unescoListed",
      key: "unescoListed",
      width: 100,
      render: (listed: boolean) =>
        listed ? <Tag color="green">CÓ</Tag> : <Tag color={"red"}>KHÔNG</Tag>,
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
        title="Quản lý Di sản Văn hóa (Cá nhân)"
        headerContent={
            <div style={{ background: '#fff', padding: '0 16px', borderRadius: '8px 8px 0 0' }}>
              <Tabs 
                activeKey={getActiveTab()} 
                items={tabItems} 
                onChange={handleTabChange}
                size="small"
                style={{ marginBottom: 0 , paddingBottom: 0}}
              />
            </div>
        }
        loading={loading}
        permissionResource="heritage_sites"
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
        onSubmitReview={undefined}
        onApprove={undefined} // Researcher cannot approve
        onReject={undefined} // Researcher cannot reject
        onBatchDelete={batchDeleteHeritages}
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

      <HeritageForm
        key={currentRecord?.id || 'create'}
        isEdit={!!currentRecord}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord || undefined}
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

export default ResearcherHeritageManagement;
