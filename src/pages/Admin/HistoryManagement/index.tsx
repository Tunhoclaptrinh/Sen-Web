import { Tag, Tabs } from "antd";
import { useAuth } from "@/hooks/useAuth";
import { DownloadOutlined } from "@ant-design/icons";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import DataTable from "@components/common/DataTable";
import dayjs from 'dayjs';

import HistoryForm from "./components/Form";
import HistoryDetailModal from "./components/DetailModal";
import HistoryStats from "./components/Stats";
import { useHistoryModel } from "./model";

const HistoryManagement = ({ initialFilters = {} }: { initialFilters?: any }) => {
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
    } = useHistoryModel(initialFilters);

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
          />
        );
      },
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title_like", // Align with searchable key
      width: 250,
      ellipsis: true,
      searchable: true,
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "author_name",
      width: 150,
      render: (authorName: string, record: any) => (
        <Tag color="orange">{authorName || record.author || 'Hệ thống'}</Tag>
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
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date: string, record: any) => {
        const finalDate = date || record.publishDate;
        return finalDate ? dayjs(finalDate).format('DD/MM/YYYY') : 'N/A';
      },
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      width: 100,
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "is_active",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "HIỂN THỊ" : "ĐÃ ẨN"}
        </Tag>
      ),
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
      title: "Hiện vật",
      key: "artifact_count",
      width: 100,
      render: (_: any, record: any) => (
        <Tag color="purple">{(record.related_artifact_ids || []).length} HV</Tag>
      ),
    },
  ];

  const { user } = useAuth();
  
  const tabItems = [
    { key: 'all', label: 'Tất cả bài viết' },
    ...(user?.role === 'researcher' || user?.role === 'admin' ? [
      { key: 'my', label: 'Bài viết của tôi' },
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
        updateFilters({ created_by: user?.id, status: undefined });
        break;
      case 'pending':
        updateFilters({ status: 'pending', created_by: undefined });
        break;
      case 'published':
        updateFilters({ status: 'published', created_by: undefined });
        break;
    }
  };

  const getActiveTab = () => {
    if (filters.created_by === user?.id) return 'my';
    if (filters.status === 'pending') return 'pending';
    if (filters.status === 'published') return 'published';
    return 'all';
  };

  return (
    <div>
      <DataTable
        title="Quản lý Bài viết Lịch sử"
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
        onSubmitReview={submitReview ? (record) => submitReview(record.id) : undefined}
        onApprove={approveReview ? (record) => approveReview(record.id) : undefined}
        onReject={handleReject}
        onBatchDelete={batchDeleteHistories}
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
            key: "is_active",
            placeholder: "Trạng thái",
            options: [
              { label: "Đang hiển thị", value: true },
              { label: "Đã ẩn", value: false },
            ],
          },
          {
            key: "author",
            placeholder: "Tác giả",
            type: "input",
            operators: ["like", "eq"],
            defaultOperator: "like"
          },
          {
             key: "publishDate",
             placeholder: "Ngày đăng",
             type: "date",
             operators: ["eq", "gte", "lte"],
             defaultOperator: "eq"
          },
          {
            key: "category",
            placeholder: "Danh mục",
            // Assuming categories are fetched or static? For now simplified.
            type: "input", 
            operators: ["like"], 
            defaultOperator: "like"
          }
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
      />

      <HistoryForm
        key={currentRecord?.id || 'create'}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <HistoryDetailModal
        record={currentRecord}
        open={detailVisible}
        onCancel={closeDetail}
      />
    </div>
  );
};

export default HistoryManagement;
