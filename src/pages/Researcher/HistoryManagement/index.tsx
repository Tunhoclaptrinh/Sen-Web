import {Tag, Tabs, Space, Tooltip, Popconfirm} from "antd";
import {DownloadOutlined, SendOutlined, UndoOutlined} from "@ant-design/icons";
import {Button, PermissionGuard} from "@/components/common";
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import dayjs from "dayjs";

import HistoryForm from "../../Admin/HistoryManagement/components/Form";
import HistoryDetailModal from "../../Admin/HistoryManagement/components/DetailModal";
import HistoryStats from "../../Admin/HistoryManagement/components/Stats";
import {useHistoryModel} from "./model";

const HistoryManagement = () => {
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
    stats,
    statsLoading,
    deleteHistory,
    batchDeleteHistories,
    exportData,
    importData,
    downloadTemplate,
    importLoading,
    handleSubmit,
    submitReview,
    revertReview,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  } = useHistoryModel();
  const {user} = useAuth();

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
              objectFit: "cover",
              borderRadius: 4,
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
      title: "Ngày đăng",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 150,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
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
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: any = {
          draft: "default",
          pending: "orange",
          published: "green",
          rejected: "red",
        };
        const labels: any = {
          draft: "Nháp",
          pending: "Chờ duyệt",
          published: "Đã xuất bản",
          rejected: "Từ chối",
        };
        return <Tag color={colors[status] || "default"}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: "Hiển thị",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => <Tag color={isActive ? "green" : "red"}>{isActive ? "HIỂN THỊ" : "ĐÃ ẨN"}</Tag>,
    },
  ];

  const tabItems = [
    {key: "all", label: "Tất cả bài viết của tôi"},
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
    {key: "rejected", label: "Bị từ chối"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        updateFilters({status: undefined});
        break;
      case "pending":
        updateFilters({status: "pending"});
        break;
      case "published":
        updateFilters({status: "published"});
        break;
      case "rejected":
        updateFilters({status: "rejected"});
        break;
    }
  };

  const getActiveTab = () => {
    if (filters.status === "pending") return "pending";
    if (filters.status === "published") return "published";
    if (filters.status === "rejected") return "rejected";
    return "all";
  };

  return (
    <div>
      <DataTable
        title="Quản lý Bài viết Lịch sử (Researcher)"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <HistoryStats stats={stats} loading={statsLoading} />
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
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
        onBatchDelete={batchDeleteHistories}
        batchOperations={true}
        batchActions={[
          {
            key: "export",
            label: "Export đã chọn",
            icon: <DownloadOutlined />,
            onClick: (ids: any[]) => exportData("xlsx", ids),
          },
        ]}
        importable={true}
        importLoading={importLoading}
        exportable={true}
        exportLoading={loading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
        onRefresh={refresh}
        customActions={(record) => {
          const canSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const canRevert = record.status === "pending";

          return (
            <Space size={4}>
              {canSubmit && (
                <PermissionGuard resource="history_articles" action="update" fallback={null}>
                  <Tooltip title="Gửi duyệt">
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      onClick={() => submitReview?.(record.id)}
                      className="action-btn-standard"
                      style={{color: "var(--primary-color)"}}
                    >
                      <SendOutlined />
                    </Button>
                  </Tooltip>
                </PermissionGuard>
              )}

              {canRevert && (
                <PermissionGuard resource="history_articles" action="update" fallback={null}>
                  <Tooltip title="Hoàn về nháp">
                    <Popconfirm
                      title="Hủy gửi duyệt?"
                      description="Bạn có muốn rút lại yêu cầu và hoàn về nháp?"
                      onConfirm={() => revertReview?.(record.id)}
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        className="action-btn-standard"
                        style={{color: "#faad14"}}
                      >
                        <UndoOutlined />
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}
            </Space>
          );
        }}
      />

      <HistoryForm
        key={currentRecord?.id || "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <HistoryDetailModal record={currentRecord} open={detailVisible} onCancel={closeDetail} />
    </div>
  );
};

export default HistoryManagement;
