import { Tag, Tabs, Space, Button, Tooltip, Popconfirm } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { DownloadOutlined, EditOutlined, DeleteOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons";
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

const HeritageSiteManagement = ({ initialFilters = {} }: { initialFilters?: any }) => {
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
    submitReview,
    approveReview,
    handleReject,
  } = useHeritageModel(initialFilters);

  const { user } = useAuth();

  const onFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 100,
      align: "center" as const,
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
      title: "Tên Di sản",
      dataIndex: "name",
      key: "nameLike",
      width: 250,
      searchable: true,
      align: "left" as const,
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 150,
      render: (authorName: string, record: any) => (
        <Tag color="blue">{authorName || record.author || 'Tôi'}</Tag>
      )
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
      dataIndex: "unescoListed",
      key: "unescoListed",
      filters: [
        { text: "CÓ", value: true },
        { text: "KHÔNG", value: false },
      ],
      filteredValue: filters.unescoListed
        ? Array.isArray(filters.unescoListed)
          ? filters.unescoListed
          : [filters.unescoListed]
        : null,
      width: 100,
      render: (listed: boolean) =>
        listed ? <Tag color="green">CÓ</Tag> : <Tag color={"red"}>KHÔNG</Tag>,
    },
    {
      title: "Giá vé",
      dataIndex: "entranceFee",
      width: 120,
      render: (fee: number) => (fee ? `${fee.toLocaleString()} VND` : "Miễn phí"),
    },
    {
      title: "Hiện vật",
      key: "artifactsCount",
      width: 100,
      render: (_: any, record: any) => (
        <Tag color="cyan">{(record.relatedArtifactIds || []).length} HV</Tag>
      ),
    },
    {
      title: "Lịch sử",
      key: "historyCount",
      width: 100,
      render: (_: any, record: any) => (
        <Tag color="purple">{(record.relatedHistoryIds || []).length} LS</Tag>
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
            return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
        }
    },
    {
        title: "Thao tác",
        key: "actions",
        width: 180,
        fixed: "right" as const,
        align: "center" as const,
        render: (_: any, record: any) => {
            // Check ownership
            const isOwner = record.createdBy === user?.id; 
            
            // Show submit if it's in a state that allows submission (draft/rejected/new)
            // BUT: If not owner, we show it disabled with a message
            const showSubmit = (record.status === 'draft' || record.status === 'rejected' || !record.status);
            const submitDisabled = !isOwner;
            const submitTooltip = submitDisabled 
                ? `Tác giả ${record.authorName || 'khác'} đang lưu nháp, chưa gửi duyệt` 
                : "Gửi duyệt";

            const canApprove = record.status === 'pending';
            const canReject = record.status === 'pending';
            
            return (
                <Space size={4}>
                    {showSubmit && (
                        <Tooltip title={submitTooltip}>
                          {/* Wrap disabled button in span for tooltip to work */}
                          <span style={{ display: 'inline-block', cursor: submitDisabled ? 'not-allowed' : 'pointer' }}>
                              <Button 
                                icon={<SendOutlined />} 
                                size="small" 
                                type="text" 
                                disabled={submitDisabled}
                                style={{ color: submitDisabled ? undefined : "var(--primary-color)" }}
                                onClick={() => !submitDisabled && submitReview?.(record.id)}
                              />
                          </span>
                        </Tooltip>
                    )}

                    {canApprove && (
                        <Tooltip title="Phê duyệt">
                          <Button 
                            icon={<CheckCircleOutlined />} 
                            size="small" 
                            type="text" 
                            style={{ color: "#52c41a" }}
                            onClick={() => approveReview?.(record.id)}
                          />
                        </Tooltip>
                    )}

                    {canReject && (
                        <Tooltip title="Từ chối">
                          <Button 
                            icon={<CloseCircleOutlined />} 
                            size="small" 
                            type="text" 
                            style={{ color: "#ff4d4f" }}
                            onClick={() => handleReject(record)}
                          />
                        </Tooltip>
                    )}

                    <Tooltip title="Xem chi tiết">
                        <Button 
                            icon={<EyeOutlined />} 
                            size="small" 
                            type="text" 
                            style={{ color: "var(--primary-color)" }}
                            onClick={() => openDetail(record)}
                        />
                    </Tooltip>
                    
                    <Tooltip title="Chỉnh sửa">
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        type="text" 
                        style={{ color: "var(--primary-color)" }}
                        onClick={() => openEdit(record)}
                      />
                    </Tooltip>

                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa?"
                            onConfirm={() => deleteHeritage(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            type="text" 
                            danger 
                          />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            );
        }
    }
  ];


  
  const tabItems = [
    { key: 'all', label: 'Tất cả di sản' },
    ...(user?.role === 'researcher' || user?.role === 'admin' ? [
      { key: 'my', label: 'Di sản của tôi' },
    ] : []),
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'published', label: 'Đã xuất bản' },
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'all':
        clearFilters();
        break;
      case 'my':
        updateFilters({ createdBy: user?.id, status: undefined });
        break;
      case 'pending':
        updateFilters({ status: 'pending', createdBy: undefined });
        break;
      case 'published':
        updateFilters({ status: 'published', createdBy: undefined });
        break;
    }
  };

  const getActiveTab = () => {
    if (filters.createdBy === user?.id) return 'my';
    if (filters.status === 'pending') return 'pending';
    if (filters.status === 'published') return 'published';
    return 'all';
  };

  return (
    <>
      <DataTable
        title="Quản lý Di sản Văn hóa"
        headerContent={
          <>
            <HeritageStats stats={stats} loading={statsLoading} />
            <div style={{ marginTop: 16, background: '#fff', padding: '0 16px', borderRadius: '8px 8px 0 0' }}>
              <Tabs 
                activeKey={getActiveTab()} 
                items={tabItems} 
                onChange={handleTabChange}
                style={{ marginBottom: 0 }}
              />
            </div>
          </>
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
        onSubmitReview={submitReview ? (record) => submitReview(record.id) : undefined}
        onApprove={approveReview ? (record) => approveReview(record.id) : undefined}
        onReject={handleReject}
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
            key: "unescoListed",
            placeholder: "UNESCO",
            options: [
              { label: "CÓ", value: true },
              { label: "KHÔNG", value: false },
            ],
          },
          {
            key: "recognitionDate",
            placeholder: "Ngày công nhận",
            type: "date",
            operators: ["eq", "gte", "lte"], 
            defaultOperator: "eq"
          },
          {
            key: "managementUnit",
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

export default HeritageSiteManagement;
