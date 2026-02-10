import {Tag, Tabs, Space, Tooltip, Popconfirm} from "antd";
import {DownloadOutlined, SendOutlined, UndoOutlined} from "@ant-design/icons";
import {Button, PermissionGuard} from "@/components/common";

import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import {useResearcherLearningModel} from "./model";
import LearningForm from "@/pages/Admin/LearningManagement/components/Form";
import LearningDetailModal from "@/pages/Admin/LearningManagement/components/DetailModal";
import {getImageUrl} from "@/utils/image.helper";

const ResearcherLearningManagement: React.FC = () => {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    search,
    updateFilters,
    filters,
    handleSubmit,
    revertReview,
    submitReview,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    formVisible,
    detailVisible,
    currentRecord,
    deleteLearning,
    exportData,
    importData,
    downloadTemplate,
    refresh,
  } = useResearcherLearningModel();

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
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 100,
      align: "center" as const,
      render: (url: string) => {
        const src = url && (url.startsWith("http") || url.startsWith("blob")) ? url : getImageUrl(url);

        return (
          <div
            style={{
              margin: "0 auto",
              width: 80,
              height: 50,
              borderRadius: 4,
              overflow: "hidden",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={src}
              alt="thumbnail"
              style={{width: "100%", height: "100%", objectFit: "cover"}}
              onError={(e: any) => {
                e.target.onerror = null; // Prevent loops
                e.target.src = "https://placehold.co/80x50?text=No+Img";
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Tiêu đề bài học",
      dataIndex: "title",
      key: "title",
      align: "left" as const,
      searchable: true,
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 150,
      render: (authorName: string, record: any) => <Tag color="blue">{authorName || record.author || "Tôi"}</Tag>,
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 120,
      render: (difficulty: string) => {
        const colors: any = {
          easy: "green",
          medium: "blue",
          hard: "red",
        };
        return <Tag color={colors[difficulty]}>{difficulty?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "estimatedDuration",
      key: "estimatedDuration",
      width: 120,
      render: (val: number) => `${val} phút`,
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
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
  ];

  const tabItems = [
    {key: "all", label: "Tất cả"},
    {key: "draft", label: "Bản nháp"},
    {key: "pending", label: "Đang chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
    {key: "rejected", label: "Bị từ chối"},
  ];

  const handleTabChange = (key: string) => {
    if (key === "all") {
      updateFilters({status: undefined});
    } else {
      updateFilters({status: key});
    }
  };

  const getActiveTab = () => {
    const status = filters.status;
    if (!status || (Array.isArray(status) && status.length === 0)) return "all";
    if (Array.isArray(status)) return status[0];
    return status;
  };

  return (
    <>
      <DataTable
        title="Quản lý Bài học ôn tập (Cá nhân)"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs
                activeKey={getActiveTab()}
                items={tabItems}
                onChange={handleTabChange}
                style={{marginBottom: 0}}
                size="small"
              />
            </div>
          </div>
        }
        loading={loading}
        permissionResource="learning_modules"
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        onAdd={openCreate}
        onEdit={openEdit}
        onView={openDetail}
        onDelete={deleteLearning}
        onRefresh={refresh}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;
          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const showRevert = record.status === "pending";

          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const revertDisabled = !isOwner;
          const revertTooltip = revertDisabled ? "Chỉ tác giả mới có thể rút lại yêu cầu" : "Rút lại yêu cầu";

          return (
            <Space size={4}>
              {showSubmit && (
                <PermissionGuard resource="learning_modules" action="update" fallback={null}>
                  <Tooltip title={submitTooltip}>
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<SendOutlined />}
                      disabled={submitDisabled}
                      onClick={() => !submitDisabled && submitReview?.(record.id)}
                      className="action-btn-standard"
                      style={{color: submitDisabled ? undefined : "var(--primary-color)"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {showRevert && (
                <PermissionGuard resource="learning_modules" action="update" fallback={null}>
                  <Tooltip title={revertTooltip}>
                    <Popconfirm
                      title="Hủy gửi duyệt?"
                      description="Bạn có muốn rút lại yêu cầu và hoàn về nháp?"
                      onConfirm={() => revertReview?.(record.id)}
                      okText="Đồng ý"
                      cancelText="Hủy"
                      disabled={revertDisabled}
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        icon={<UndoOutlined />}
                        disabled={revertDisabled}
                        className="action-btn-standard"
                        style={{color: revertDisabled ? undefined : "#faad14"}}
                      />
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}
            </Space>
          );
        }}
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
        importLoading={loading}
        exportable={true}
        exportLoading={loading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
      />

      <LearningForm
        visible={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <LearningDetailModal open={detailVisible} onCancel={closeDetail} record={currentRecord} />
    </>
  );
};

export default ResearcherLearningManagement;
