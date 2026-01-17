import { Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { getImageUrl, resolveImage } from "@/utils/image.helper";

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
      width: 100,
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
      title: "Tỉnh/TP",
      dataIndex: "province",
      key: "province",
      width: 120,
    },
    {
      title: "UNESCO",
      dataIndex: "unesco_listed",
      key: "unesco_listed",
      filters: [
        { text: "CÓ", value: true },
        { text: "KHÔNG", value: false },
      ],
      filteredValue: filters.unesco_listed
        ? Array.isArray(filters.unesco_listed)
          ? filters.unesco_listed
          : [filters.unesco_listed]
        : null,
      width: 100,
      render: (listed: boolean) =>
        listed ? <Tag color="green">CÓ</Tag> : <Tag color={"red"}>KHÔNG</Tag>,
    },
    {
      title: "Giá vé",
      dataIndex: "entrance_fee",
      width: 120,
      render: (fee: number) => (fee ? `${fee.toLocaleString()} VND` : "Miễn phí"),
    },
    {
      title: "Hiện vật",
      key: "artifacts_count",
      width: 100,
      render: (_: any, record: any) => (
        <Tag color="cyan">{(record.related_artifact_ids || []).length} HV</Tag>
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
              { label: "CÓ", value: true },
              { label: "KHÔNG", value: false },
            ],
          },
          {
            key: "recognition_date",
            placeholder: "Ngày công nhận",
            type: "date",
            operators: ["eq", "gte", "lte"], 
            defaultOperator: "eq"
          },
          {
            key: "management_unit",
            placeholder: "Đơn vị quản lý",
            type: "input",
            operators: ["like"],
            defaultOperator: "like"
          },
           {
            key: "ranking",
            placeholder: "Xếp hạng",
            options: [
                { label: "Cấp Tỉnh", value: "Cấp Tỉnh" },
                { label: "Cấp Quốc gia", value: "Cấp Quốc gia" },
                { label: "Cấp Quốc gia đặc biệt", value: "Cấp Quốc gia đặc biệt" },
            ],
            operators: ["eq", "in"],
            defaultOperator: "eq"
          }
        ]}
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
