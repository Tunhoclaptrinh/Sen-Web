import {Tag, Tabs, Space, Tooltip} from "antd";
import {CheckCircleOutlined, CloseCircleOutlined} from "@ant-design/icons";
import {Button, PermissionGuard} from "@/components/common";
import {useAuth} from "@/hooks/useAuth";
import {getImageUrl} from "@/utils/image.helper";
import {SendOutlined, UndoOutlined} from "@ant-design/icons";

import {useLearningModel} from "./model";
import DataTable from "@/components/common/DataTable";
import LearningForm from "./components/Form";
import LearningDetailModal from "./components/DetailModal";

const LearningManagement: React.FC = () => {
  const {
    submitReview: _submitReview,
    approveReview: _approveReview,
    handleReject: _handleReject,
    ...model
  } = useLearningModel();
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
              src={src || "https://placehold.co/80x50?text=No+Img"}
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
      align: "left",
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
        const colors: any = {published: "green", pending: "orange", draft: "default", rejected: "red"};
        const labels: any = {published: "Đã xuất bản", pending: "Chờ duyệt", draft: "Nháp", rejected: "Từ chối"};
        return <Tag color={colors[status] || "default"}>{labels[status] || status}</Tag>;
      },
    },
  ];

  const tabItems = [
    {key: "all", label: "Tất cả bài học"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Bài học của tôi"}] : []),
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
        title="Quản lý Bài học ôn"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </div>
        }
        loading={model.loading}
        permissionResource="learning_modules"
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

          const canApprove = record.status === "pending";
          const canReject = record.status === "pending";

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
                      onClick={() => !submitDisabled && _submitReview?.(record.id)}
                      className="action-btn-standard"
                      style={{color: submitDisabled ? undefined : "var(--primary-color)"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {showRevert && (
                <PermissionGuard resource="learning_modules" action="update" fallback={null}>
                  <Tooltip title={revertTooltip}>
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<UndoOutlined />}
                      disabled={revertDisabled}
                      onClick={() => !revertDisabled && model.revertReview?.(record.id)}
                      className="action-btn-standard"
                      style={{color: revertDisabled ? undefined : "#faad14"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {canApprove && (
                <PermissionGuard resource="learning_modules" action="approve" fallback={null}>
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
                <PermissionGuard resource="learning_modules" action="approve" fallback={null}>
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

      <LearningForm
        visible={model.formVisible}
        onCancel={model.closeForm}
        onSubmit={model.handleSubmit}
        initialValues={model.currentRecord}
        loading={model.loading}
        isEdit={!!model.currentRecord}
      />

      <LearningDetailModal open={model.detailVisible} onCancel={model.closeDetail} record={model.currentRecord} />
    </>
  );
};

export default LearningManagement;
