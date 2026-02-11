import {Tag, Tabs, Space, Tooltip, Modal, Popover, Divider} from "antd";
import {
  DownloadOutlined,
  SendOutlined,
  UndoOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {Button} from "@/components/common";
import UnpublishReasonModal from "@/components/common/UnpublishReasonModal";

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
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish,
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
          unpublish_pending: "warning",
        };
        const labels: any = {
          draft: "Nháp",
          pending: "Chờ duyệt",
          published: "Đã xuất bản",
          rejected: "Từ chối",
          unpublish_pending: "Chờ gỡ bài",
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
    {key: "unpublish_pending", label: "Chờ gỡ bài"},
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
        // onEdit={openEdit}
        // onView={openDetail}
        // onDelete={deleteLearning} // Manual handling
        onRefresh={refresh}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;
          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const showRevert = record.status === "pending";
          const showUnpublish = record.status === "published";
          const showDelete = record.status === "draft" || record.status === "rejected";
          const isPendingUnpublish = record.status === "unpublish_pending";

          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const items = [];

          if (showSubmit) {
            items.push(
              <Tooltip title={submitTooltip} key="submit">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<SendOutlined />}
                  disabled={submitDisabled}
                  onClick={() => !submitDisabled && submitReview?.(record.id)}
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          if (showRevert) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-revert" />);
            items.push(
              <Tooltip title="Hoàn về nháp" key="revert">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<UndoOutlined />}
                  disabled={!isOwner}
                  onClick={() => {
                    Modal.confirm({
                      title: "Hủy gửi duyệt?",
                      content: "Bạn có muốn rút lại yêu cầu và hoàn về nháp?",
                      onOk: () => revertReview?.(record.id),
                      okText: "Đồng ý",
                      cancelText: "Hủy",
                    });
                  }}
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          if (showUnpublish) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-unpublish" />);
            items.push(
              <Tooltip title="Gỡ nội dung (Hạ bài)" key="unpublish">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<UndoOutlined rotate={180} />}
                  disabled={!isOwner}
                  onClick={() => {
                    setCurrentRecord(record);
                    setUnpublishModalVisible(true);
                  }}
                  style={{color: "#ff4d4f"}}
                />
              </Tooltip>,
            );
          }

          if (isPendingUnpublish) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-toggle-active" />);
            items.push(
              <Tooltip title={record.isActive === false ? "Hiện nội dung" : "Ẩn nội dung"} key="toggleActive">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={record.isActive === false ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  disabled={!isOwner}
                  onClick={() => {
                    Modal.confirm({
                      title: record.isActive === false ? "Hiện nội dung?" : "Ẩn nội dung?",
                      content:
                        record.isActive === false
                          ? "Nội dung sẽ hiển thị lại trong thời gian chờ gỡ."
                          : "Nội dung sẽ tạm ẩn trong thời gian chờ gỡ.",
                      onOk: () => handleSubmit({id: record.id, isActive: record.isActive === false}),
                    });
                  }}
                  style={{color: "var(--primary-color)"}}
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
                onClick={() => openEdit(record)}
                style={{color: "var(--primary-color)"}}
              />
            </Tooltip>,
          );

          if (showDelete) {
            items.push(<Divider type="vertical" key="div-delete" />);
            items.push(
              <Tooltip title="Xóa" key="delete">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<DeleteOutlined />}
                  danger={true}
                  disabled={!isOwner}
                  onClick={() => {
                    Modal.confirm({
                      title: "Xóa bài học?",
                      content: "Hành động này không thể hoàn tác.",
                      onOk: () => deleteLearning(record.id),
                      okText: "Xóa",
                      cancelText: "Hủy",
                      okButtonProps: {danger: true},
                    });
                  }}
                  style={{color: "#ff4d4f"}}
                />
              </Tooltip>,
            );
          }

          const popoverContent = <div style={{display: "flex", alignItems: "center", gap: "4px"}}>{items}</div>;

          return (
            <Space size={8}>
              <Tooltip title="Xem chi tiết">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<EyeOutlined />}
                  onClick={() => openDetail(record)}
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

      <UnpublishReasonModal
        open={unpublishModalVisible}
        onCancel={() => {
          setUnpublishModalVisible(false);
          setCurrentRecord(null);
        }}
        onConfirm={async (reason) => {
          if (currentRecord) {
            const success = await requestUnpublish?.(currentRecord.id, reason);
            if (success) {
              setUnpublishModalVisible(false);
              setCurrentRecord(null);
            }
          }
        }}
        loading={loading}
      />
    </>
  );
};

export default ResearcherLearningManagement;
