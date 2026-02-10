import {Tag, Tabs, Space, Tooltip, Popconfirm} from "antd";
import {DownloadOutlined, SendOutlined, UndoOutlined} from "@ant-design/icons";
import {Button, PermissionGuard} from "@/components/common";
import {getImageUrl} from "@/utils/image.helper";
import {useAuth} from "@/hooks/useAuth";

import DataTable from "@/components/common/DataTable";

import HeritageDetailModal from "@/pages/Admin/HeritageSiteManagement/components/DetailModal";
import HeritageForm from "@/pages/Admin/HeritageSiteManagement/components/Form";

import {HeritageType, HeritageTypeLabels} from "@/types";
import {useResearcherHeritageModel} from "./model";

const ResearcherHeritageManagement = () => {
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
    deleteHeritage,
    batchDeleteHeritages,
    exportData,
    importData,
    downloadTemplate,
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
  } = useResearcherHeritageModel();

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
      width: 80,
      align: "center" as const,
      render: (image: string) => {
        if (!image) {
          return (
            <div
              style={{
                margin: "0 auto",
                width: 60,
                height: 36,
                borderRadius: 4,
                background: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{fontSize: 20, color: "#d9d9d9", display: "flex"}}>📷</span>
            </div>
          );
        }
        return (
          <div
            style={{
              margin: "0 auto",
              width: 60,
              height: 36,
              borderRadius: 4,
              overflow: "hidden",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={getImageUrl(image)}
              alt="thumbnail"
              style={{width: "100%", height: "100%", objectFit: "cover"}}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent loop
                target.src = "https://placehold.co/60x36?text=Error";
                target.style.display = "none";
                (target.parentNode as HTMLElement).innerHTML =
                  '<span style="font-size: 20px; color: #d9d9d9">📷</span>';
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Tên Di Sản",
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
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: HeritageType) => <Tag color="blue">{HeritageTypeLabels[type]?.toUpperCase() || type}</Tag>,
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
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
      },
    },
    {
      title: "UNESCO",
      dataIndex: "unescoListed",
      key: "unescoListed",
      width: 100,
      render: (listed: boolean) => (listed ? <Tag color="green">CÓ</Tag> : <Tag color={"red"}>KHÔNG</Tag>),
    },
  ];

  const tabItems = [
    {key: "all", label: "Tất cả"},
    {key: "draft", label: "Bản nháp"},
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
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
    if (!status || (Array.isArray(status) && status.length === 0)) return "all";
    if (Array.isArray(status)) return status[0];
    return status;
  };

  return (
    <>
      <DataTable
        title="Quản lý Di sản Văn hóa (Cá nhân)"
        user={user}
        headerContent={
          <div style={{background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
            <Tabs
              activeKey={getActiveTab()}
              items={tabItems}
              onChange={handleTabChange}
              size="small"
              style={{marginBottom: 0, paddingBottom: 0}}
            />
          </div>
        }
        loading={loading}
        permissionResource="heritage_sites"
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
        onDelete={deleteHeritage}
        onRefresh={refresh}
        customActions={(record) => {
          const canSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const canRevert = record.status === "pending";

          return (
            <Space size={4}>
              {canSubmit && (
                <PermissionGuard resource="heritage_sites" action="update" fallback={null}>
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
                <PermissionGuard resource="heritage_sites" action="update" fallback={null}>
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
        onBatchDelete={batchDeleteHeritages}
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

      <HeritageForm
        key={currentRecord?.id || "create"}
        isEdit={!!currentRecord}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord || undefined}
        loading={loading}
      />

      <HeritageDetailModal record={currentRecord} open={detailVisible} onCancel={closeDetail} />
    </>
  );
};

export default ResearcherHeritageManagement;
