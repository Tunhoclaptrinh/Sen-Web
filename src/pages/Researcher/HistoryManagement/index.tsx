import { Tag, Tabs, Space, Tooltip, Popconfirm, Button, message } from "antd";
import { DownloadOutlined, EditOutlined, DeleteOutlined, UndoOutlined, SendOutlined } from "@ant-design/icons";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import DataTable from "@/components/common/DataTable";
import dayjs from 'dayjs';
import { useAuth } from "@/hooks/useAuth";

import HistoryForm from "@/pages/Admin/HistoryManagement/components/Form";
import HistoryDetailModal from "@/pages/Admin/HistoryManagement/components/DetailModal";
import HistoryStats from "@/pages/Admin/HistoryManagement/components/Stats";

import { useResearcherHistoryModel } from "./model";

const ResearcherHistoryManagement = () => {
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
    deleteHistory,
    batchDeleteHistories,
    exportData,
    importData,
    downloadTemplate,
    // importLoading,
    handleSubmit,
    revertToDraft,
    submitReview,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  } = useResearcherHistoryModel();

  const { user } = useAuth();

  const handleSubmitReview = async (record: any) => {
      const success = await submitReview?.(record.id);
      if (success) {
          message.success("Đã gửi yêu cầu duyệt thành công");
      }
  };

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
      render: (image: string) => {
        const srcRaw = resolveImage(image);
        if (!srcRaw) return null;
        const src = getImageUrl(srcRaw);
        return (
          <img 
            src={src} 
            alt="History" 
            style={{ 
              width: 80, 
              height: 50, 
              objectFit: 'cover', 
              borderRadius: 4,
              border: '1px solid #f0f0f0' 
            }} 
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/80x50?text=No+Img';
            }}
          />
        );
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "titleLike",
      width: 250,
      ellipsis: true,
      searchable: true,
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
      title: "Ngày đăng",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 150,
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      width: 100,
      sorter: true,
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
        title: "Thao tác",
        key: "actions",
        width: 150,
        align: "center" as const,
        render: (_: any, record: any) => {
            const canSubmit = record.status === 'draft' || record.status === 'rejected' || !record.status;
            const canRevert = record.status === 'pending';
             // Researcher can always edit/delete their own items (which is all they see)
            return (
                <Space size={4}>
                     {canSubmit && (
                        <Tooltip title="Gửi duyệt">
                          <Button 
                            icon={<SendOutlined />} 
                            size="small" 
                            type="text" 
                            style={{ color: "var(--primary-color)" }}
                            onClick={() => handleSubmitReview(record)}
                          />
                        </Tooltip>
                    )}

                    {canRevert && (
                        <Tooltip title="Hoàn về bản nháp">
                            <Popconfirm
                                title="Hủy gửi duyệt?"
                                description="Bạn có muốn rút lại yêu cầu và hoàn về nháp?"
                                onConfirm={() => revertToDraft?.(record.id)}
                            >
                                <Button 
                                    icon={<UndoOutlined />} 
                                    size="small" 
                                    type="text" 
                                    style={{ color: "#faad14" }} // warning color
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    
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
                            onConfirm={() => deleteHistory(record.id)}
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
    { key: 'all', label: 'Tất cả' },
    { key: 'draft', label: 'Bản nháp' },
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'published', label: 'Đã xuất bản' },
    { key: 'rejected', label: 'Bị từ chối' }
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'all':
        updateFilters({ status: undefined, createdBy: user?.id });
        break;
      default:
        updateFilters({ status: key, createdBy: user?.id });
        break;
    }
  };

  const getActiveTab = () => {
    const status = filters.status;
    if (!status || (Array.isArray(status) && status.length === 0)) return 'all';
    if (Array.isArray(status)) return status[0];
    return status;
  };

  return (
    <>
      <DataTable
        title="Quản lý Bài viết Lịch sử (Cá nhân)"
        headerContent={
          <div style={{ marginBottom: 16 }}>
            <HistoryStats stats={stats} loading={statsLoading} />
            <div style={{ marginTop: 16, background: '#fff', padding: '0 16px', borderRadius: '8px 8px 0 0' }}>
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
        permissionResource="history_articles"
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
        onDelete={deleteHistory}
        onSubmitReview={handleSubmitReview}
        onApprove={undefined} // No approve for researchers
        onReject={undefined} // No reject for researchers
        onBatchDelete={batchDeleteHistories}
        batchOperations={true}
        batchActions={[
          {
            key: 'export',
            label: 'Export đã chọn',
            icon: <DownloadOutlined />,
            onClick: (ids: any[]) => exportData({ format: 'xlsx', filters: { id: ids } }),
          }
        ]}
        importable={true}
        importLoading={loading}
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

      <HistoryForm
        key={currentRecord?.id || 'create'}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord || undefined}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <HistoryDetailModal
        record={currentRecord}
        open={detailVisible}
        onCancel={closeDetail}
      />
    </>
  );
};

export default ResearcherHistoryManagement;
