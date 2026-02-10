import {Tag, Tabs, Space, Tooltip} from "antd";
import {useAuth} from "@/hooks/useAuth";
import {
  DownloadOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {Popconfirm} from "antd";
import {Button, PermissionGuard} from "@/components/common";
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import {ArtifactType, ArtifactCondition, ArtifactTypeLabels, ArtifactConditionLabels} from "@/types";
import DataTable from "@/components/common/DataTable";

import ArtifactDetailModal from "./components/DetailModal";
import ArtifactForm from "./components/Form";
import ArtifactStats from "./components/Stats";
import {useArtifactModel} from "./model";

const ArtifactManagement = ({initialFilters = {}}: {initialFilters?: any}) => {
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
    stats,
    statsLoading,
    deleteArtifact,
    batchDeleteArtifacts,
    exportData,
    importData,
    downloadTemplate,
    importLoading,
    handleSubmit,
    // UI State & Handlers
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    submitReview: _submitReview,
    approveReview: _approveReview,
    revertReview: _revertReview,
    handleReject: _handleReject,
  } = useArtifactModel(initialFilters);

  const {user} = useAuth();

  const onFilterChange = (key: string, value: any) => {
    updateFilters({[key]: value});
  };

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
      render: (authorName: string, record: any) => <Tag color="blue">{authorName || record.author || "Hệ thống"}</Tag>,
    },
    {
      title: "Loại hình",
      dataIndex: "artifactType",
      key: "artifactType",
      width: 150,
      filters: Object.values(ArtifactType).map((type) => ({
        text: ArtifactTypeLabels[type],
        value: type,
      })),
      filteredValue: filters.artifactType
        ? Array.isArray(filters.artifactType)
          ? filters.artifactType
          : [filters.artifactType]
        : null,
      render: (type: ArtifactType) => <Tag color="purple">{ArtifactTypeLabels[type]?.toUpperCase() || type}</Tag>,
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      filters: Object.values(ArtifactCondition).map((cond) => ({
        text: ArtifactConditionLabels[cond],
        value: cond,
      })),
      filteredValue: filters.condition
        ? Array.isArray(filters.condition)
          ? filters.condition
          : [filters.condition]
        : null,
      render: (cond: ArtifactCondition) => {
        let color = "blue";
        if (["excellent", "EXCELLENT"].includes(cond)) color = "green";
        if (["good", "GOOD"].includes(cond)) color = "blue";
        if (["fair", "FAIR"].includes(cond)) color = "orange";
        if (["poor", "POOR"].includes(cond)) color = "red";
        return <Tag color={color}>{ArtifactConditionLabels[cond]?.toUpperCase() || cond}</Tag>;
      },
    },
    {
      title: "Trưng bày",
      dataIndex: "isOnDisplay",
      key: "isOnDisplay",
      width: 100,
      render: (onDisplay: boolean) => (onDisplay ? <Tag color="green">CÓ</Tag> : <Tag color="red">KHÔNG</Tag>),
    },
    {
      title: "Di sản",
      key: "heritageCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="cyan">{(record.relatedHeritageIds || []).length} DS</Tag>,
    },
    {
      title: "Lịch sử",
      key: "historyCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="purple">{(record.relatedHistoryIds || []).length} LS</Tag>,
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

  const tabItems = [
    {key: "all", label: "Tất cả hiện vật"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Hiện vật của tôi"}] : []),
    {key: "pending", label: "Chờ duyệt Đăng"},
    {key: "published", label: "Đã xuất bản"},
    {key: "unpublish_pending", label: "Chờ duyệt Gỡ"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        clearFilters();
        break;
      case "my":
        updateFilters({createdBy: user?.id, status: undefined});
        break;
      case "pending":
        updateFilters({status: "pending", createdBy: undefined});
        break;
      case "published":
        updateFilters({status: "published", createdBy: undefined});
        break;
      case "unpublish_pending":
        updateFilters({status: "unpublish_pending", createdBy: undefined});
        break;
    }
  };

  const getActiveTab = () => {
    if (filters.createdBy === user?.id) return "my";
    if (filters.status === "pending") return "pending";
    if (filters.status === "published") return "published";
    if (filters.status === "unpublish_pending") return "unpublish_pending";
    return "all";
  };

  return (
    <>
      <DataTable
        title="Quản lý Hiện vật"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <ArtifactStats stats={stats} loading={statsLoading} />
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
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
        }}
        onView={openDetail}
        onEdit={openEdit}
        onDelete={deleteArtifact}
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
        importLoading={importLoading}
        exportable={true}
        exportLoading={loading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
        onRefresh={refresh}
        filters={[
          {
            key: "artifactType",
            placeholder: "Loại hình",
            options: Object.values(ArtifactType).map((type) => ({
              label: ArtifactTypeLabels[type],
              value: type,
            })),
          },
          {
            key: "condition",
            placeholder: "Tình trạng",
            options: Object.values(ArtifactCondition).map((cond) => ({
              label: ArtifactConditionLabels[cond],
              value: cond,
            })),
          },
          {
            key: "isOnDisplay",
            placeholder: "Trưng bày",
            options: [
              {label: "Đang trưng bày", value: true},
              {label: "Trong kho", value: false},
            ],
          },
          {
            key: "material",
            placeholder: "Chất liệu",
            type: "input",
            operators: ["like", "ilike", "eq"],
            defaultOperator: "ilike",
          },
          {
            key: "technique",
            placeholder: "Kỹ thuật chế tác",
            type: "input",
            operators: ["like", "ilike"],
            defaultOperator: "ilike",
          },
          {
            key: "dating",
            placeholder: "Niên đại",
            type: "input",
            operators: ["like", "ilike", "eq"],
            defaultOperator: "ilike",
          },
          {
            key: "origin",
            placeholder: "Nguồn gốc/Xuất xứ",
            type: "input",
            operators: ["like", "ilike"],
            defaultOperator: "ilike",
          },
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
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

          return (
            <Space size={4}>
              {showSubmit && (
                <PermissionGuard resource="artifacts" action="update" fallback={null}>
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
                <PermissionGuard resource="artifacts" action="approve" fallback={null}>
                  <Tooltip title={record.status === "unpublish_pending" ? "Phê duyệt Gỡ bài" : "Phê duyệt Đăng bài"}>
                    <Popconfirm
                      title={record.status === "unpublish_pending" ? "Phê duyệt gỡ bài?" : "Phê duyệt đăng bài?"}
                      description={
                        record.status === "unpublish_pending"
                          ? "Nội dung sẽ được gỡ xuống và chuyển về trạng thái Nháp."
                          : "Nội dung sẽ được hiển thị công khai."
                      }
                      onConfirm={() =>
                        record.status === "unpublish_pending" ? _revertReview?.(record.id) : _approveReview?.(record.id)
                      }
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        icon={<CheckCircleOutlined />}
                        className="action-btn-standard"
                        style={{color: "#52c41a"}}
                      />
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}

              {canReject && (
                <PermissionGuard resource="artifacts" action="approve" fallback={null}>
                  <Tooltip title="Từ chối duyệt">
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

              {canRejectUnpublish && (
                <PermissionGuard resource="artifacts" action="approve" fallback={null}>
                  <Tooltip title="Từ chối gỡ bài (Lấy lại trạng thái Đã xuất bản)">
                    <Popconfirm
                      title="Từ chối gỡ bài?"
                      description="Nội dung sẽ tiếp tục giữ trạng thái Đã xuất bản."
                      onConfirm={() => _approveReview?.(record.id)}
                      okText="Đồng ý"
                      cancelText="Hủy"
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        icon={<UndoOutlined />}
                        className="action-btn-standard"
                        style={{color: "#ff4d4f"}}
                      />
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}
            </Space>
          );
        }}
      />

      <ArtifactForm
        key={currentRecord?.id || "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
        isEdit={!!currentRecord}
      />

      <ArtifactDetailModal record={currentRecord} open={detailVisible} onCancel={closeDetail} />
    </>
  );
};

export default ArtifactManagement;
