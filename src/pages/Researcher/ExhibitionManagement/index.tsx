import {Tag, Tabs, Modal, Space, Tooltip, Popconfirm} from "antd";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {DownloadOutlined, SendOutlined, UndoOutlined} from "@ant-design/icons";
import {Button, PermissionGuard} from "@/components/common";
import {useExhibitionModel} from "./model";
import DataTable from "@/components/common/DataTable";
import ExhibitionStats from "@/pages/Admin/ExhibitionManagement/components/Stats";
import ExhibitionDetailModal from "@/pages/Admin/ExhibitionManagement/components/DetailModal";
import ExhibitionForm from "@/pages/Admin/ExhibitionManagement/components/Form";
import {getImageUrl} from "@/utils/image.helper";
import dayjs from "dayjs";

const ResearcherExhibitionManagement: React.FC = () => {
  const {
    data,
    loading,
    pagination,
    handleTableChange,
    search,
    updateFilters,
    filters,
    stats,
    statsLoading,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    formVisible,
    detailVisible,
    currentRecord,
    handleSubmit,
    remove,
    submitReview,
    revertReview,
    availableArtifacts,
    exportData,
    importData,
    downloadTemplate,
    refresh,
  } = useExhibitionModel();
  const {user} = useAuth();
  const navigate = useNavigate();

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
              src={src || "/placeholder-image.png"}
              alt="exhibition"
              style={{width: "100%", height: "100%", objectFit: "cover"}}
              onError={(e: any) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = "true";
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = '<span style="color:#999;font-size:10px">No Img</span>';
                }
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Tên triển lãm",
      dataIndex: "name",
      key: "name",
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
      title: "Chủ đề",
      dataIndex: "theme",
      key: "theme",
      width: 150,
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 250,
      render: (_: any, record: any) => {
        if (record.isPermanent) return <Tag color="blue">VĨNH VIỄN</Tag>;
        return (
          <span style={{fontSize: "12px"}}>
            {dayjs(record.startDate).format("DD/MM/YYYY")} - {dayjs(record.endDate).format("DD/MM/YYYY")}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (val: boolean) => (val ? <Tag color="green">ĐANG MỞ</Tag> : <Tag>ĐÃ ĐÓNG</Tag>),
    },
    {
      title: "Trạng thái duyệt",
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
  ];

  const tabItems = [
    {key: "my", label: "Tất cả"},
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
    {key: "rejected", label: "Bị từ chối"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "my":
        updateFilters({createdBy: user?.id, status: undefined});
        break;
      default:
        updateFilters({status: key, createdBy: user?.id});
        break;
    }
  };

  const getActiveTab = () => {
    const status = filters.status;
    if (!status || (Array.isArray(status) && status.length === 0)) return "my";
    if (Array.isArray(status)) return status[0];
    return status;
  };

  return (
    <>
      <DataTable
        title="Quản lý Triển lãm ảo (Cá nhân)"
        user={user}
        headerContent={
          <div style={{background: "#fff", padding: "16px", borderRadius: "8px"}}>
            <ExhibitionStats stats={stats} loading={statsLoading} />
            <Tabs
              activeKey={getActiveTab()}
              items={tabItems}
              onChange={handleTabChange}
              style={{marginBottom: 0}}
              size="small"
            />
          </div>
        }
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        onAdd={openCreate}
        onEdit={openEdit}
        onView={openDetail}
        onDelete={remove}
        onRefresh={refresh}
        customActions={(record) => {
          const canSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const canRevert = record.status === "pending";

          return (
            <Space size={4}>
              {canSubmit && (
                <PermissionGuard resource="exhibitions" action="update" fallback={null}>
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
                <PermissionGuard resource="exhibitions" action="update" fallback={null}>
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
        batchOperations={true}
        batchActions={[
          {
            key: "export",
            label: "Export đã chọn",
            icon: <DownloadOutlined />,
            onClick: (ids: any[]) => exportData("xlsx", ids),
          },
        ]}
        permissionResource="exhibitions"
        importable={true}
        importLoading={loading}
        exportable={true}
        exportLoading={loading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
      />

      <Modal
        title={currentRecord ? "Chỉnh sửa triển lãm" : "Tạo triển lãm mới"}
        open={formVisible}
        onCancel={closeForm}
        footer={null}
        width={700}
        destroyOnClose
      >
        <ExhibitionForm
          initialValues={currentRecord}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          loading={loading}
          availableArtifacts={availableArtifacts}
          isEdit={!!currentRecord}
        />
      </Modal>

      {/* Detail Modal */}
      <ExhibitionDetailModal
        exhibition={currentRecord}
        visible={detailVisible}
        onClose={closeDetail}
        onViewFull={(id: any) => navigate(`/researcher/exhibitions/${id}`)}
      />
    </>
  );
};

export default ResearcherExhibitionManagement;
