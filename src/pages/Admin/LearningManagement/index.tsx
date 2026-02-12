import {Tag, Tabs, Space, Tooltip} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UndoOutlined,
  MenuOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {Popover, Divider, Modal} from "antd";
import {Button} from "@/components/common";
import {useAuth} from "@/hooks/useAuth";
import {getImageUrl} from "@/utils/image.helper";

import {useLearningModel} from "./model";
import DataTable from "@/components/common/DataTable";
import LearningForm from "./components/Form";
import LearningDetailModal from "./components/DetailModal";

const LearningManagement: React.FC = () => {
  const {
    submitReview: _submitReview,
    approveReview: _approveReview,
    handleReject: _handleReject,
    revertReview: _revertReview,
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
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 150,
      render: (categoryId: number) => {
        const cat = model.categories.find((c: any) => c.id === categoryId);
        return cat ? cat.name : "-";
      },
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

  const tabItems = [
    {key: "all", label: "Tất cả bài học"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Bài học của tôi"}] : []),
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
        onExport={model.exportData}
        filters={[
          {
            key: "categoryId",
            placeholder: "Danh mục",
            options: model.categories.map((cat: any) => ({
              label: cat.name,
              value: cat.id,
            })),
          },
        ]}
        filterValues={model.filters}
        onFilterChange={(key, value) => model.updateFilters({[key]: value})}
        onClearFilters={() => model.refresh()}
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
