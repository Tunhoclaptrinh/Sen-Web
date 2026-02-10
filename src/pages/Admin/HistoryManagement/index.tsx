import {Tag, Tabs, Space, Tooltip} from "antd";
import {useAuth} from "@/hooks/useAuth";
import {
  DownloadOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {Popconfirm} from "antd";
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import DataTable from "@components/common/DataTable";
import {Button, PermissionGuard} from "@/components/common";
import {formatDate} from "@/utils/formatters";

import HistoryForm from "./components/Form";
import HistoryDetailModal from "./components/DetailModal";
import HistoryStats from "./components/Stats";
import {useHistoryModel} from "./model";

const HistoryManagement = ({initialFilters = {}}: {initialFilters?: any}) => {
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
    submitReview: _submitReview,
    approveReview: _approveReview,
    revertReview: _revertReview,
    handleReject: _handleReject,
  } = useHistoryModel(initialFilters);

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
      key: "titleLike", // Align with searchable key
      width: 250,
      ellipsis: true,
      searchable: true,
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 150,
      render: (authorName: string, record: any) => <Tag color="blue">{authorName || record.author || "Hệ thống"}</Tag>,
    },
    {
      title: "Ngày đăng",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 150,
      render: (date: string) => formatDate(date, "DD/MM/YYYY") || "N/A",
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 150,
      render: (date: string, record: any) => {
        const finalDate = date || record.publishDate;
        return formatDate(finalDate, "DD/MM/YYYY") || "N/A";
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
      title: "Di sản",
      key: "heritageCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="cyan">{(record.relatedHeritageIds || []).length} DS</Tag>,
    },
    {
      title: "Hiện vật",
      key: "artifactCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="purple">{(record.relatedArtifactIds || []).length} HV</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: any = {
          published: "green",
          pending: "orange",
          draft: "default",
          rejected: "red",
          unpublish_pending: "warning",
        };
        const labels: any = {
          published: "Đã xuất bản",
          pending: "Chờ duyệt",
          draft: "Nháp",
          rejected: "Từ chối",
          unpublish_pending: "Chờ gỡ bài",
        };
        return <Tag color={colors[status] || "default"}>{labels[status] || status}</Tag>;
      },
    },
  ];

  const {user} = useAuth();

  const tabItems = [
    {key: "all", label: "Tất cả bài viết"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Bài viết của tôi"}] : []),
    {key: "pending", label: "Chờ duyệt Đăng"},
    {key: "published", label: "Đã xuất bản"},
    {key: "unpublish_pending", label: "Chờ duyệt Gỡ"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        clearFilters();
        break;
      case "my":
        updateFilters({createdBy: user?.id, status: undefined});
        break;
      case "pending":
        updateFilters({status: "pending", createdBy: undefined});
        break;
      case "published":
        updateFilters({status: "published", createdBy: undefined});
        break;
      case "unpublish_pending":
        updateFilters({status: "unpublish_pending", createdBy: undefined});
        break;
    }
  };

  const getActiveTab = () => {
    if (filters.createdBy === user?.id) return "my";
    if (filters.status === "pending") return "pending";
    if (filters.status === "published") return "published";
    if (filters.status === "unpublish_pending") return "unpublish_pending";
    return "all";
  };

  return (
    <div>
      <DataTable
        title="Quản lý Bài viết Lịch sử"
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
        filters={[
          {
            key: "isActive",
            placeholder: "Trạng thái",
            options: [
              {label: "Đang hiển thị", value: true},
              {label: "Đã ẩn", value: false},
            ],
          },
          {
            key: "author",
            placeholder: "Tác giả",
            type: "input",
            operators: ["like", "eq"],
            defaultOperator: "like",
          },
          {
            key: "publishDate",
            placeholder: "Ngày đăng",
            type: "date",
            operators: ["eq", "gte", "lte"],
            defaultOperator: "eq",
          },
          {
            key: "category",
            placeholder: "Danh mục",
            // Assuming categories are fetched or static? For now simplified.
            type: "input",
            operators: ["like"],
            defaultOperator: "like",
          },
        ]}
        filterValues={filters}
        onFilterChange={(key, value) => updateFilters({[key]: value})}
        onClearFilters={() => refresh()}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;

          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;

          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const canApprove = record.status === "pending" || record.status === "unpublish_pending";
          const canReject = record.status === "pending";
          const canRejectUnpublish = record.status === "unpublish_pending";

          return (
            <Space size={4}>
              {showSubmit && (
                <PermissionGuard resource="history_articles" action="update" fallback={null}>
                  <Tooltip title={submitTooltip}>
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<SendOutlined />}
                      disabled={submitDisabled}
                      onClick={() => !submitDisabled && _submitReview?.(record.id)}
                      className="action-btn-standard"
                      style={{color: submitDisabled ? undefined : "var(--primary-color)"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {canApprove && (
                <PermissionGuard resource="history_articles" action="approve" fallback={null}>
                  <Tooltip title={record.status === "unpublish_pending" ? "Phê duyệt Gỡ bài" : "Phê duyệt Đăng bài"}>
                    <Popconfirm
                      title={record.status === "unpublish_pending" ? "Phê duyệt gỡ bài?" : "Phê duyệt đăng bài?"}
                      description={
                        record.status === "unpublish_pending"
                          ? "Nội dung sẽ được gỡ xuống và chuyển về trạng thái Nháp."
                          : "Nội dung sẽ được hiển thị công khai."
                      }
                      onConfirm={() =>
                        record.status === "unpublish_pending" ? _revertReview?.(record.id) : _approveReview?.(record.id)
                      }
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        icon={<CheckCircleOutlined />}
                        className="action-btn-standard"
                        style={{color: "#52c41a"}}
                      />
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}

              {canReject && (
                <PermissionGuard resource="history_articles" action="approve" fallback={null}>
                  <Tooltip title="Từ chối duyệt">
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<CloseCircleOutlined />}
                      onClick={() => _handleReject(record)}
                      className="action-btn-standard"
                      style={{color: "#ff4d4f"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {canRejectUnpublish && (
                <PermissionGuard resource="history_articles" action="approve" fallback={null}>
                  <Tooltip title="Từ chối gỡ bài (Lấy lại trạng thái Đã xuất bản)">
                    <Popconfirm
                      title="Từ chối gỡ bài?"
                      description="Nội dung sẽ tiếp tục giữ trạng thái Đã xuất bản."
                      onConfirm={() => _approveReview?.(record.id)}
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        icon={<UndoOutlined />}
                        className="action-btn-standard"
                        style={{color: "#ff4d4f"}}
                      />
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
