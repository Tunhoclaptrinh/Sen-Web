import {useState} from "react";
import {Tooltip, Tag, Tabs, Space, message} from "antd";
import {Button, PermissionGuard} from "@/components/common";
import {
  NodeIndexOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  PlayCircleOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import {useAuth} from "@/hooks/useAuth";
import DataTable from "@/components/common/DataTable";
import ChapterModal from "./components/ChapterModal";
import ChapterPreview from "./components/ChapterPreview";
import ChapterReorderModal from "./components/ChapterReorderModal";
import {useChapterModel} from "./model";
import {getImageUrl} from "@/utils/image.helper";
import GameSimulator from "../LevelManagement/components/GameSimulator";
import adminScreenService from "@/services/admin-screen.service";
import adminLevelService from "@/services/admin-level.service";

const ChapterManagement = () => {
  const {
    // CRUD State
    data,
    loading,
    pagination,
    handleTableChange,
    search,
    selectedIds,
    setSelectedIds,
    refresh,
    deleteItem,
    batchDelete,
    handleSubmit,
    // Filters
    filters: filterValues,
    updateFilters,
    clearFilters: onClearFilters,
    // UI State & Handlers
    currentRecord,
    modalOpen,
    modalMode,
    openCreate,
    openEdit,
    openDetail,
    closeModal,
    submitReview,
    approveReview,
    handleReject,
    reorderChapters,
  } = useChapterModel();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewChapter, setPreviewChapter] = useState<{id: number; name: string} | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [reorderVisible, setReorderVisible] = useState(false);

  // Simulator State
  const [simulatorVisible, setSimulatorVisible] = useState(false);
  const [simulatorScreens, setSimulatorScreens] = useState<any[]>([]);

  const openPreview = (record: any) => {
    setPreviewChapter(record);
    setPreviewVisible(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({[key]: value});
  };

  const handleSimulateChapter = async (record: any) => {
    try {
      setLocalLoading(true);
      // Fetch levels for this chapter
      const res = await adminLevelService.getAll({chapterId: record.id, _limit: 1});
      const levels = res.data || [];

      if (levels.length > 0) {
        const firstLevel = levels[0];
        // Fetch screens for the first level
        const screenRes = await adminScreenService.getScreens(firstLevel.id);
        const screens = Array.isArray(screenRes.data) ? screenRes.data : screenRes.data?.items || [];

        if (screens.length > 0) {
          setSimulatorScreens(screens);
          setSimulatorVisible(true);
        } else {
          message.warning("Chương này chưa có màn chơi nào để chạy thử!");
          openPreview(record);
        }
      } else {
        message.warning("Chương này chưa có màn chơi nào!");
        openPreview(record);
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi chuẩn bị giả lập");
    } finally {
      setLocalLoading(false);
    }
  };

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 20,
      sorter: true,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      width: 40,
      align: "center",
      render: (url: string) => (
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
            src={getImageUrl(url) || "https://placehold.co/60x36?text=No+Img"}
            alt="thumbnail"
            style={{width: "100%", height: "100%", objectFit: "cover"}}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/60x36?text=No+Img";
            }}
          />
        </div>
      ),
    },
    {
      title: "Tên Chương",
      dataIndex: "name",
      key: "name",
      width: 250,
      align: "left",
      render: (text: string) => <span style={{whiteSpace: "pre-wrap"}}>{text}</span>,
    },
    {
      title: "Chủ đề",
      dataIndex: "theme",
      key: "theme",
      align: "left",
      width: 150,
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      width: 100,
      render: (color: string) => (
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
          <div style={{width: 16, height: 16, borderRadius: "2px", backgroundColor: color, border: "1px solid #ddd"}} />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: "Yêu cầu",
      dataIndex: "requiredPetals",
      width: 60,
      render: (val: number) => `${val} cánh hoa`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (status: string) => {
        let color = "default";
        let text = "Nháp";
        let icon: React.ReactNode = null;
        if (status === "published") {
          color = "green";
          text = "Đã xuất bản";
          icon = <CheckCircleOutlined />;
        } else if (status === "pending") {
          color = "gold";
          text = "Chờ duyệt";
          icon = <SendOutlined />;
        } else if (status === "rejected") {
          color = "red";
          text = "Từ chối";
          icon = <CloseCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 120,
      render: (author: string) => <Tag color="orange">{author || "Hệ thống"}</Tag>,
    },
  ];

  const filterConfig = [
    {
      key: "name",
      label: "Tên chương",
      type: "input" as const,
      placeholder: "Tìm tên chương...",
      defaultOperator: "like" as const,
    },
    {
      key: "theme",
      label: "Chủ đề",
      type: "input" as const,
      placeholder: "Lọc theo chủ đề...",
      defaultOperator: "like" as const,
    },
    {
      key: "requiredPetals",
      label: "Cánh hoa yêu cầu",
      type: "number" as const,
      placeholder: "Số cánh hoa...",
    },
    {
      key: "petalState",
      label: "Trạng thái",
      type: "select" as const,
      options: [
        {label: "Đang khóa", value: "locked"},
        {label: "Đang nụ", value: "closed"},
        {label: "Đang nở", value: "blooming"},
        {label: "Nở rộ", value: "full"},
      ],
    },
  ];

  const {user} = useAuth();

  const tabItems = [
    {key: "all", label: "Tất cả"},
    {key: "draft", label: "Bản nháp"},
    {key: "pending", label: "Chờ duyệt"},
    {key: "published", label: "Đã xuất bản"},
    {key: "rejected", label: "Bị từ chối"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Chương của tôi"}] : []),
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        updateFilters({status: undefined, createdBy: undefined});
        break;
      case "my":
        updateFilters({createdBy: user?.id, status: undefined});
        break;
      default:
        updateFilters({status: key, createdBy: undefined});
        break;
    }
  };

  const getActiveTab = () => {
    if (filterValues.createdBy === user?.id) return "my";
    return filterValues.status || "all";
  };

  return (
    <>
      <DataTable
        title="Quản lý Chương Game"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </div>
        }
        loading={loading || localLoading}
        permissionResource="game_content"
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        filters={filterConfig}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={onClearFilters}
        onAdd={openCreate}
        onView={openDetail}
        onEdit={openEdit}
        onDelete={deleteItem}
        onBatchDelete={batchDelete}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        batchOperations={true}
        onRefresh={refresh}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;
          const isAdmin = user?.role === "admin";
          const isResearcherContent = record.author && record.author !== "Hệ thống" && !isOwner;
          const shouldRestrictAdmin = isAdmin && isResearcherContent;

          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const canApprove = record.status === "pending";
          const canReject = record.status === "pending";

          return (
            <Space size={4}>
              {showSubmit && (
                <PermissionGuard resource="game_content" action="update" fallback={null}>
                  <Tooltip title={submitTooltip}>
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<SendOutlined />}
                      disabled={submitDisabled}
                      style={{color: submitDisabled ? undefined : "var(--primary-color)"}}
                      className="action-btn-standard"
                      onClick={(e) => {
                        e.stopPropagation();
                        !submitDisabled && submitReview?.(record.id);
                      }}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {canApprove && (
                <PermissionGuard resource="game_content" action="approve" fallback={null}>
                  <Tooltip title="Phê duyệt">
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<CheckCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        approveReview?.(record.id);
                      }}
                      className="action-btn-standard"
                      style={{color: "#52c41a"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              {canReject && (
                <PermissionGuard resource="game_content" action="approve" fallback={null}>
                  <Tooltip title="Từ chối">
                    <Button
                      variant="ghost"
                      buttonSize="small"
                      icon={<CloseCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(record);
                      }}
                      className="action-btn-standard"
                      style={{color: "#ff4d4f"}}
                    />
                  </Tooltip>
                </PermissionGuard>
              )}

              <Tooltip title="Xem màn chơi (Map/Table)">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  className="action-btn-standard"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(record);
                  }}
                  style={{color: "#722ed1"}}
                  icon={<NodeIndexOutlined />}
                />
              </Tooltip>

              <Tooltip title="Chạy thử Chương">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  className="action-btn-standard"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateChapter(record);
                  }}
                  style={{color: "#13c2c2"}}
                  icon={<PlayCircleOutlined />}
                />
              </Tooltip>
            </Space>
          );
        }}
        extra={
          <Button
            variant="ghost"
            buttonSize="small"
            onClick={() => setReorderVisible(true)}
            icon={<OrderedListOutlined />}
            className="action-btn-standard"
          >
            Sắp xếp
          </Button>
        }
      />

      <ChapterModal
        data={currentRecord}
        open={modalOpen}
        mode={modalMode}
        onCancel={closeModal}
        onSubmit={handleSubmit}
        onSuccess={refresh}
      />

      {previewChapter && (
        <ChapterPreview
          chapterId={previewChapter.id}
          chapterName={previewChapter.name}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
        />
      )}

      <ChapterReorderModal
        visible={reorderVisible}
        onCancel={() => setReorderVisible(false)}
        chapters={data}
        onSave={reorderChapters}
      />

      <GameSimulator
        visible={simulatorVisible}
        onClose={() => setSimulatorVisible(false)}
        screens={simulatorScreens}
        title="Simulation"
      />
    </>
  );
};

export default ChapterManagement;
