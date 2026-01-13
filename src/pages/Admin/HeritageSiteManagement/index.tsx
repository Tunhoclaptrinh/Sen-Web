import { Tag } from "antd";

import DataTable from "@/components/common/DataTable";

import HeritageDetailModal from "./components/DetailModal";
import HeritageForm from "./components/Form";
import HeritageStats from "./components/Stats";
import {
  HeritageType,
  HeritageRegion,
  HeritageTypeLabels,
  HeritageRegionLabels
} from "@/types";
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
      filters: Object.values(HeritageType).map((type) => ({
        text: HeritageTypeLabels[type],
        value: type,
      })),
      filteredValue: filters.type
        ? Array.isArray(filters.type)
          ? filters.type
          : [filters.type]
        : null,
      render: (type: HeritageType) => (
        <Tag color="blue">{HeritageTypeLabels[type]?.toUpperCase() || type}</Tag>
      ),
    },
    {
      title: "Khu vực",
      dataIndex: "region",
      key: "region",
      width: 120,
      filters: Object.values(HeritageRegion).map((region) => ({
        text: HeritageRegionLabels[region],
        value: region,
      })),
      filteredValue: filters.region
        ? Array.isArray(filters.region)
          ? filters.region
          : [filters.region]
        : null,
      render: (region: HeritageRegion) => HeritageRegionLabels[region] || region,
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
            options: Object.values(HeritageType).map((type) => ({
              label: HeritageTypeLabels[type],
              value: type,
            })),
          },
          {
            key: "region",
            placeholder: "Khu vực",
            options: Object.values(HeritageRegion).map((region) => ({
              label: HeritageRegionLabels[region],
              value: region,
            })),
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
