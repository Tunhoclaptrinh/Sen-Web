import {Tag, Tabs, Space, Tooltip, Modal} from "antd";
import {Button} from "@/components/common";
import {useAuth} from "@/hooks/useAuth";
import {
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UndoOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {Popover, Divider} from "antd";
import {getImageUrl, resolveImage} from "@/utils/image.helper";

import DataTable from "@/components/common/DataTable";

import HeritageDetailModal from "./components/DetailModal";
import HeritageForm from "./components/Form";
import HeritageStats from "./components/Stats";
import {HeritageType, HeritageRegion, HeritageTypeLabels, HeritageRegionLabels} from "@/types";
import {useHeritageModel} from "./model";

const HeritageSiteManagement = ({initialFilters = {}}: {initialFilters?: any}) => {
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
    deleteHeritage,
    batchDeleteHeritages,
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
    handleReject: _handleReject,
    revertReview: _revertReview,
    categories,
  } = useHeritageModel(initialFilters);

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
            alt="Heritage"
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
      title: "Tên Di sản",
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
      filters: Object.values(HeritageType).map((type) => ({
        text: HeritageTypeLabels[type],
        value: type,
      })),
      filteredValue: filters.type ? (Array.isArray(filters.type) ? filters.type : [filters.type]) : null,
      render: (type: HeritageType) => <Tag color="blue">{HeritageTypeLabels[type]?.toUpperCase() || type}</Tag>,
    },
    {
      title: "Khu vực",
      dataIndex: "region",
      key: "region",
      width: 100,
      filters: Object.values(HeritageRegion).map((region) => ({
        text: HeritageRegionLabels[region],
        value: region,
      })),
      filteredValue: filters.region ? (Array.isArray(filters.region) ? filters.region : [filters.region]) : null,
      render: (region: HeritageRegion) => HeritageRegionLabels[region] || region,
    },
    {
      title: "Tỉnh/TP",
      dataIndex: "province",
      key: "province",
      width: 120,
    },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      width: 150,
      render: (categoryId: number) => {
        const cat = categories.find((c: any) => c.id === categoryId);
        return cat ? cat.name : "-";
      },
    },
    {
      title: "UNESCO",
      dataIndex: "unescoListed",
      key: "unescoListed",
      filters: [
        {text: "CÓ", value: true},
        {text: "KHÔNG", value: false},
      ],
      filteredValue: filters.unescoListed
        ? Array.isArray(filters.unescoListed)
          ? filters.unescoListed
          : [filters.unescoListed]
        : null,
      width: 100,
      render: (listed: boolean) => (listed ? <Tag color="green">CÓ</Tag> : <Tag color={"red"}>KHÔNG</Tag>),
    },
    {
      title: "Giá vé",
      dataIndex: "entranceFee",
      width: 120,
      render: (fee: number) => (fee ? `${fee.toLocaleString("vi-VN")} VND` : "Miễn phí"),
    },
    {
      title: "Hiện vật",
      key: "artifactsCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="cyan">{(record.relatedArtifactIds || []).length} HV</Tag>,
    },
    {
      title: "Lịch sử",
      key: "historyCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="purple">{(record.relatedHistoryIds || []).length} LS</Tag>,
    },
    {
      title: "Màn chơi",
      key: "levelsCount",
      width: 100,
      render: (_: any, record: any) => <Tag color="orange">{(record.relatedLevelIds || []).length} MC</Tag>,
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
    {key: "all", label: "Tất cả di sản"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Di sản của tôi"}] : []),
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
        title="Quản lý Di sản Văn hóa"
        user={user}
        headerContent={
          <>
            <HeritageStats stats={stats} loading={statsLoading} />
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </>
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
        onRefresh={refresh}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
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
        importLoading={importLoading}
        exportable={true}
        exportLoading={loading}
        onImport={importData}
        onDownloadTemplate={downloadTemplate}
        onExport={exportData}
        filters={[
          {
            key: "type",
            placeholder: "Loại hình",
            options: Object.values(HeritageType).map((type) => ({
              label: HeritageTypeLabels[type],
              value: type,
            })),
          },
          {
            key: "categoryId",
            placeholder: "Danh mục Văn hóa",
            options: categories.map((cat: any) => ({
              label: cat.name,
              value: cat.id,
            })),
          },
          {
            key: "region",
            placeholder: "Khu vực",
            options: Object.values(HeritageRegion).map((region) => ({
              label: HeritageRegionLabels[region],
              value: region,
            })),
          },
          {
            key: "unescoListed",
            placeholder: "UNESCO",
            options: [
              {label: "CÓ", value: true},
              {label: "KHÔNG", value: false},
            ],
          },
          {
            key: "recognitionDate",
            placeholder: "Ngày công nhận",
            type: "date",
            operators: ["eq", "gte", "lte"],
            defaultOperator: "eq",
          },
          {
            key: "managementUnit",
            placeholder: "Đơn vị quản lý",
            type: "input",
            operators: ["like"],
            defaultOperator: "like",
          },
          {
            key: "ranking",
            placeholder: "Xếp hạng",
            options: [
              {label: "Cấp Tỉnh", value: "Cấp Tỉnh"},
              {label: "Cấp Quốc gia", value: "Cấp Quốc gia"},
              {label: "Cấp Quốc gia đặc biệt", value: "Cấp Quốc gia đặc biệt"},
            ],
            operators: ["eq", "in"],
            defaultOperator: "eq",
          },
        ]}
        filterValues={filters}
        onFilterChange={onFilterChange}
        onClearFilters={clearFilters}
        customActions={(record) => {
          // Permissions
          const isAdmin = user?.role === "admin";
          const isOwner = record.createdBy === user?.id;
          const canEditOrDelete = isAdmin || isOwner;

          // Show submit if it's in a state that allows submission (draft/rejected/new)
          // BUT: Only the owner can submit for review
          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const canApprove = isAdmin && (record.status === "pending" || record.status === "unpublish_pending");
          const canReject = isAdmin && record.status === "pending";
          const canRejectUnpublish = isAdmin && record.status === "unpublish_pending";

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

          if (canEditOrDelete) {
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
                      onOk: () => deleteHeritage(record.id),
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

export default HeritageSiteManagement;
