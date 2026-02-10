import {Tag, Tabs, Space, Tooltip, Popconfirm} from "antd";
import {
  DownloadOutlined,
  SendOutlined,
  UndoOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import {Button, PermissionGuard} from "@/components/common";
import UnpublishReasonModal from "@/components/common/UnpublishReasonModal";
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import {ArtifactType, ArtifactCondition, ArtifactTypeLabels, ArtifactConditionLabels} from "@/types";
import {useAuth} from "@/hooks/useAuth";
import DataTable from "@/components/common/DataTable";

import ArtifactDetailModal from "@/pages/Admin/ArtifactManagement/components/DetailModal";
import ArtifactForm from "@/pages/Admin/ArtifactManagement/components/Form";

import {useResearcherArtifactModel} from "./model";

const ResearcherArtifactManagement = () => {
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
    deleteArtifact,
    batchDeleteArtifacts,
    exportData,
    importData,
    downloadTemplate,
    handleSubmit,
    revertToDraft,
    submitReview,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish,
  } = useResearcherArtifactModel();

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
      render: (image: string | string[]) => {
        const srcRaw = resolveImage(image);
        if (!srcRaw) return null;
        const src = getImageUrl(srcRaw);
        return (
          <img
            src={src}
            alt="Artifact"
            style={{
              width: 80,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
            }}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/80x50?text=No+Img";
            }}
          />
        );
      },
    },
    {
      title: "Tên Hiện vật",
      dataIndex: "name",
      key: "nameLike",
      width: 250,
      searchable: true,
      align: "left" as const,
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 150,
      render: (authorName: string, record: any) => <Tag color="blue">{authorName || record.author || "Tôi"}</Tag>,
    },
    {
      title: "Loại hình",
      dataIndex: "artifactType",
      key: "artifactType",
      width: 150,
      render: (type: ArtifactType) => <Tag color="purple">{ArtifactTypeLabels[type]?.toUpperCase() || type}</Tag>,
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
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      render: (cond: ArtifactCondition) => {
        let color = "blue";
        if (["excellent", "EXCELLENT"].includes(cond)) color = "green";
        if (["good", "GOOD"].includes(cond)) color = "blue";
        if (["fair", "FAIR"].includes(cond)) color = "orange";
        if (["poor", "POOR"].includes(cond)) color = "red";
        return <Tag color={color}>{ArtifactConditionLabels[cond]?.toUpperCase() || cond}</Tag>;
      },
    },
  ];

  const tabItems = [
    {key: "all", label: "Tất cả"},
    {key: "draft", label: "Bản nháp"},
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
    {key: "unpublish_pending", label: "Chờ gỡ bài"},
    {key: "rejected", label: "Bị từ chối"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        updateFilters({status: undefined, createdBy: user?.id});
        break;
      default:
        updateFilters({status: key, createdBy: user?.id});
        break;
    }
  };

  const getActiveTab = () => {
    const status = filters.status;
    // Handle case where status might be an array (from Table filters) or empty
    if (!status || (Array.isArray(status) && status.length === 0)) return "all";
    if (Array.isArray(status)) return status[0];
    return status;
  };

  return (
    <>
      <DataTable
        title="Quản lý Hiện vật (Cá nhân)"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </div>
        }
        loading={loading}
        permissionResource="artifacts"
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
        onView={openDetail}
        onEdit={openEdit}
        // onDelete={deleteArtifact} // Handle manually
        onRefresh={refresh}
        customActions={(record) => {
          const canSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const canRevert = record.status === "pending" || record.status === "unpublish_pending";
          const canUnpublish = record.status === "published";
          const canDelete = record.status === "draft" || record.status === "rejected";
          const isPendingUnpublish = record.status === "unpublish_pending";

          return (
            <Space size={4}>
              {canSubmit && (
                <PermissionGuard resource="artifacts" action="update" fallback={null}>
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
                <PermissionGuard resource="artifacts" action="update" fallback={null}>
                  <Tooltip title="Hoàn về nháp">
                    <Popconfirm
                      title="Hủy gửi duyệt?"
                      description="Bạn có muốn rút lại yêu cầu và hoàn về nháp?"
                      onConfirm={() => revertToDraft(record.id)}
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

              {canUnpublish && (
                <PermissionGuard resource="artifacts" action="update" fallback={null}>
                  <Tooltip title="Gỡ nội dung (Hạ bài)">
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      className="action-btn-standard"
                      style={{color: "#faad14"}}
                      onClick={() => {
                        setCurrentRecord(record);
                        setUnpublishModalVisible(true);
                      }}
                    >
                      <UndoOutlined rotate={180} />
                    </Button>
                  </Tooltip>
                </PermissionGuard>
              )}

              {isPendingUnpublish && (
                <PermissionGuard resource="artifacts" action="update" fallback={null}>
                  <Tooltip title={record.isActive === false ? "Hiện nội dung" : "Ẩn nội dung"}>
                    <Popconfirm
                      title={record.isActive === false ? "Hiện nội dung?" : "Ẩn nội dung?"}
                      description={
                        record.isActive === false
                          ? "Nội dung sẽ hiển thị lại trong thời gian chờ gỡ."
                          : "Nội dung sẽ tạm ẩn trong thời gian chờ gỡ."
                      }
                      onConfirm={() => handleSubmit({id: record.id, isActive: record.isActive === false})}
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        className="action-btn-standard"
                        style={{color: record.isActive === false ? "#52c41a" : "#faad14"}}
                      >
                        {record.isActive === false ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}

              {canDelete && (
                <PermissionGuard resource="artifacts" action="delete" fallback={null}>
                  <Popconfirm
                    title="Xóa hiện vật?"
                    description="Hành động này không thể hoàn tác."
                    onConfirm={() => deleteArtifact(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{danger: true}}
                  >
                    <Tooltip title="Xóa">
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        className="action-btn-standard action-btn-delete"
                        style={{color: "#ff4d4f"}}
                      >
                        <DeleteOutlined />
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </PermissionGuard>
              )}
            </Space>
          );
        }}
        onBatchDelete={batchDeleteArtifacts}
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
        onClearFilters={clearFilters}
      />

      <ArtifactForm
        key={currentRecord?.id || "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord || undefined}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <ArtifactDetailModal record={currentRecord} open={detailVisible} onCancel={closeDetail} />

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

export default ResearcherArtifactManagement;
