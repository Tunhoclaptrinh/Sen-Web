import {Tag, Tabs, Modal, Space, Tooltip} from "antd";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  MenuOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {Popover, Divider} from "antd";
import {useExhibitionModel} from "./model";
import ExhibitionStats from "./components/Stats";
import ExhibitionDetailModal from "./components/DetailModal";
import ExhibitionForm from "./components/Form";
import DataTable from "@/components/common/DataTable";
import {Button} from "@/components/common";
import {getImageUrl} from "@/utils/image.helper";
import {formatDate} from "@/utils/formatters";

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
            {formatDate(record.startDate, "DD/MM/YYYY")} - {formatDate(record.endDate, "DD/MM/YYYY")}
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
          unpublish_pending: "warning",
        };
        const labels: any = {
          draft: "Nháp",
          pending: "Chờ duyệt",
          published: "Đã xuất bản",
          rejected: "Từ chối",
          unpublish_pending: "Chờ gỡ bài",
        };
        return <Tag color={colors[status] || "default"}>{labels[status] || status}</Tag>;
      },
    },
  ];

  const {user} = useAuth();

  const tabItems = [
    {key: "all", label: "Tất cả triển lãm"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Triển lãm của tôi"}] : []),
    {key: "pending", label: "Chờ duyệt Đăng"},
    {key: "published", label: "Đã xuất bản"},
    {key: "unpublish_pending", label: "Chờ duyệt Gỡ"},
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
      case "unpublish_pending":
        model.updateFilters({status: "unpublish_pending", createdBy: undefined});
        break;
    }
  };

  const getActiveTab = () => {
    if (model.filters.createdBy === user?.id) return "my";
    if (model.filters.status === "pending") return "pending";
    if (model.filters.status === "published") return "published";
    if (model.filters.status === "unpublish_pending") return "unpublish_pending";
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
        // onEdit={model.openEdit}
        // onView={model.openDetail}
        // onDelete={model.remove}
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

          const canApprove = record.status === "pending" || record.status === "unpublish_pending";
          const canReject = record.status === "pending";
          const canRejectUnpublish = record.status === "unpublish_pending";

          const items = [];

          if (showSubmit) {
            items.push(
              <Tooltip title={submitTooltip} key="submit">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<SendOutlined />}
                  disabled={submitDisabled}
                  onClick={() => !submitDisabled && _submitReview?.(record.id)}
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          if (canApprove) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-approve" />);
            items.push(
              <Tooltip
                title={record.status === "unpublish_pending" ? "Phê duyệt Gỡ bài" : "Phê duyệt Đăng bài"}
                key="approve"
              >
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() =>
                    record.status === "unpublish_pending" ? _revertReview?.(record.id) : _approveReview?.(record.id)
                  }
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          if (canReject) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-reject" />);
            items.push(
              <Tooltip title="Từ chối duyệt" key="reject">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => _handleReject(record)}
                  style={{color: "#ff4d4f"}}
                />
              </Tooltip>,
            );
          }

          if (canRejectUnpublish) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-reject-unpublish" />);
            items.push(
              <Tooltip title="Từ chối gỡ bài" key="rejectUnpublish">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<UndoOutlined />}
                  onClick={() => _approveReview?.(record.id)}
                  style={{color: "#ff4d4f"}}
                />
              </Tooltip>,
            );
          }

          if (items.length > 0) items.push(<Divider type="vertical" key="div-edit" />);
          items.push(
            <Tooltip title="Chỉnh sửa" key="edit">
              <Button
                variant="ghost"
                buttonSize="small"
                icon={<EditOutlined />}
                onClick={() => model.openEdit(record)}
                style={{color: "var(--primary-color)"}}
              />
            </Tooltip>,
          );

          items.push(<Divider type="vertical" key="div-delete" />);
          items.push(
            <Tooltip title="Xóa" key="delete">
              <Button
                variant="ghost"
                buttonSize="small"
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: "Bạn có chắc muốn xóa?",
                    onOk: () => model.remove(record.id),
                    okText: "Xóa",
                    cancelText: "Hủy",
                    okButtonProps: {danger: true},
                  });
                }}
                style={{color: "#ff4d4f"}}
              />
            </Tooltip>,
          );

          const popoverContent = <div style={{display: "flex", alignItems: "center", gap: "4px"}}>{items}</div>;

          return (
            <Space size={8}>
              <Tooltip title="Xem chi tiết">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<EyeOutlined />}
                  onClick={() => model.openDetail(record)}
                  className="action-btn-standard"
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>

              {items.length > 0 && (
                <Popover
                  content={popoverContent}
                  trigger="click"
                  placement="bottomRight"
                  overlayClassName="action-popover"
                >
                  <Button
                    variant="ghost"
                    buttonSize="small"
                    icon={<MenuOutlined />}
                    className="action-btn-standard"
                    style={{color: "var(--primary-color)"}}
                  />
                </Popover>
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
