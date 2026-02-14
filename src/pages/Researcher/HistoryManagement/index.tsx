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
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
import {formatDate} from "@/utils/formatters";

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
    toggleActive,
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish,
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
      width: 150,
      render: (date: string) => formatDate(date, "DD/MM/YYYY") || "N/A",
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
    {key: "unpublish_pending", label: "Chờ gỡ bài"},
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
      case "unpublish_pending":
        updateFilters({status: "unpublish_pending"});
        break;
      case "rejected":
        updateFilters({status: "rejected"});
        break;
    }
  };

  const getActiveTab = () => {
    if (filters.status === "pending") return "pending";
    if (filters.status === "published") return "published";
    if (filters.status === "unpublish_pending") return "unpublish_pending";
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
          getCheckboxProps: (record: any) => ({
            disabled: record.createdBy !== user?.id,
          }),
        }}
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
                      onOk: () => {
                        toggleActive(record, record.isActive === false);
                      },
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
                      title: "Xóa bài viết?",
                      content: "Hành động này không thể hoàn tác.",
                      onOk: () => deleteHistory(record.id),
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
    </div>
  );
};

export default HistoryManagement;
