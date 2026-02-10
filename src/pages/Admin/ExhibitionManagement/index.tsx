import {Tag, Tabs, Modal, Space, Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {SendOutlined, CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons";
import {useExhibitionModel} from "./model";
import ExhibitionStats from "./components/Stats";
import ExhibitionDetailModal from "./components/DetailModal";
import ExhibitionForm from "./components/Form";
import DataTable from "@/components/common/DataTable";
import {Button, PermissionGuard} from "@/components/common";
import {getImageUrl} from "@/utils/image.helper";
import dayjs from "dayjs";

const ExhibitionManagement: React.FC = () => {
  const {
    submitReview: _submitReview,
    approveReview: _approveReview,
    revertReview: _revertReview,
    handleReject: _handleReject,
    ...model
  } = useExhibitionModel();
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
      render: (authorName: string, record: any) => <Tag color="blue">{authorName || record.author || "Hệ thống"}</Tag>,
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
      title: "Công khai",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (val: boolean) => (val ? <Tag color="green">ĐANG MỞ</Tag> : <Tag>ĐÃ ĐÓNG</Tag>),
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
  ];

  const {user} = useAuth();

  const tabItems = [
    {key: "all", label: "Tất cả triển lãm"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Triển lãm của tôi"}] : []),
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        model.clearFilters();
        break;
      case "my":
        model.updateFilters({createdBy: user?.id, status: undefined});
        break;
      case "pending":
        model.updateFilters({status: "pending", createdBy: undefined});
        break;
      case "published":
        model.updateFilters({status: "published", createdBy: undefined});
        break;
    }
  };

  const getActiveTab = () => {
    if (model.filters.createdBy === user?.id) return "my";
    if (model.filters.status === "pending") return "pending";
    if (model.filters.status === "published") return "published";
    return "all";
  };

  return (
    <>
      <DataTable
        title="Quản lý Triển lãm ảo"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{background: "#fff", padding: "16px", borderRadius: "8px"}}>
              <ExhibitionStats stats={model.stats} loading={model.statsLoading} />
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </div>
        }
        loading={model.loading}
        permissionResource="exhibitions"
        columns={columns}
        dataSource={model.data}
        pagination={model.pagination}
        onChange={model.handleTableChange}
        searchable
        onSearch={model.search}
        onAdd={model.openCreate}
        onEdit={model.openEdit}
        onView={model.openDetail}
        onDelete={model.remove}
        onRefresh={model.refresh}
        // Selection & Batch
        rowSelection={{
          selectedRowKeys: model.selectedIds,
          onChange: model.setSelectedIds,
        }}
        batchOperations={true}
        onBatchDelete={model.batchDelete}
        // Import/Export
        importable={true}
        importLoading={model.importLoading}
        onImport={model.importData}
        onDownloadTemplate={model.downloadTemplate}
        exportable={true}
        exportLoading={model.exportLoading}
        onExport={model.exportData}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;

          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;

          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const canApprove = record.status === "pending";
          const canReject = record.status === "pending";

          return (
            <Space size={4}>
              {showSubmit && (
                <PermissionGuard resource="exhibitions" action="update" fallback={null}>
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
                <PermissionGuard resource="exhibitions" action="approve" fallback={null}>
                  <Tooltip title="Phê duyệt">
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => _approveReview?.(record.id)}
                      className="action-btn-standard"
                      style={{color: "#52c41a"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {canReject && (
                <PermissionGuard resource="exhibitions" action="approve" fallback={null}>
                  <Tooltip title="Từ chối">
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
            </Space>
          );
        }}
      />

      <Modal
        title={model.currentRecord ? "Chỉnh sửa triển lãm" : "Tạo triển lãm mới"}
        open={model.formVisible}
        onCancel={model.closeForm}
        footer={null}
        width={700}
        destroyOnClose
      >
        <ExhibitionForm
          initialValues={model.currentRecord}
          onSubmit={model.handleSubmit}
          onCancel={model.closeForm}
          loading={model.loading}
          availableArtifacts={model.availableArtifacts}
          isEdit={!!model.currentRecord}
        />
      </Modal>

      {/* Detail Modal */}
      <ExhibitionDetailModal
        exhibition={model.currentRecord}
        visible={model.detailVisible}
        onClose={model.closeDetail}
        onViewFull={(id) => navigate(`/admin/exhibitions/${id}`)}
      />
    </>
  );
};

export default ExhibitionManagement;
