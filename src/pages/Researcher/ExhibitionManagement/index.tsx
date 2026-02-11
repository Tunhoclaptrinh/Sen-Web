import {Tag, Tabs, Modal, Space, Tooltip, Popover, Divider} from "antd";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
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
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish,
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

  const tabItems = [
    {key: "my", label: "Tất cả"},
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
    {key: "unpublish_pending", label: "Chờ gỡ bài"},
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
        // onEdit={openEdit}
        // onView={openDetail}
        // onDelete={remove} // Manual handling
        onRefresh={refresh}
        rowSelection={{
          selectedRowKeys: filters.ids || [],
          onChange: (keys: any[]) => updateFilters({ids: keys}),
          getCheckboxProps: (record: any) => ({
            disabled: record.createdBy !== user?.id,
          }),
        }}
        customActions={(record) => {
          const canSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const canRevert = record.status === "pending" || record.status === "unpublish_pending";
          const canUnpublish = record.status === "published";
          const canDelete = record.status === "draft" || record.status === "rejected";
          const isPendingUnpublish = record.status === "unpublish_pending";

          const items = [];

          if (canSubmit) {
            items.push(
              <Tooltip title="Gửi duyệt" key="submit">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<SendOutlined />}
                  onClick={() => submitReview?.(record.id)}
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          if (canRevert) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-revert" />);
            items.push(
              <Tooltip title="Hoàn về nháp" key="revert">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<UndoOutlined />}
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

          if (canUnpublish) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-unpublish" />);
            items.push(
              <Tooltip title="Gỡ nội dung (Hạ bài)" key="unpublish">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<UndoOutlined rotate={180} />}
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

          if (canDelete) {
            items.push(<Divider type="vertical" key="div-delete" />);
            items.push(
              <Tooltip title="Xóa" key="delete">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<DeleteOutlined />}
                  danger={true}
                  onClick={() => {
                    Modal.confirm({
                      title: "Xóa triển lãm?",
                      content: "Hành động này không thể hoàn tác.",
                      onOk: () => remove(record.id),
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

export default ResearcherExhibitionManagement;
