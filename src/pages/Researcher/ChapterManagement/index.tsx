import {useState} from "react";
import {Tooltip, Tag, Space, Modal, message, Tabs, Popover, Divider} from "antd";
import {
  NodeIndexOutlined,
  SendOutlined,
  UndoOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MenuOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {Button as StyledButton} from "@/components/common";
import UnpublishReasonModal from "@/components/common/UnpublishReasonModal";
import DataTable from "@/components/common/DataTable";
import {useAuth} from "@/hooks/useAuth";
// Reuse components from Admin as they are generic forms/details
import ChapterForm from "@/pages/Admin/GameManagement/ChapterManagement/components/Form";
import ChapterDetail from "@/pages/Admin/GameManagement/ChapterManagement/components/Detail";
import ChapterPreview from "@/pages/Admin/GameManagement/ChapterManagement/components/ChapterPreview";
import GameSimulator from "@/pages/Admin/GameManagement/LevelManagement/components/GameSimulator";
import {useChapterModel} from "./model";
import {getImageUrl} from "@/utils/image.helper";
import adminLevelService from "@/services/admin-level.service";
import adminScreenService from "@/services/admin-screen.service";

const ResearcherChapterManagement = () => {
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
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    submitReview,
    revertReview,
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish,
  } = useChapterModel();

  const {user} = useAuth();

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewChapter, setPreviewChapter] = useState<{id: number; name: string} | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Simulator State
  const [simulatorVisible, setSimulatorVisible] = useState(false);
  const [simulatorScreens, setSimulatorScreens] = useState<any[]>([]);

  const handleSimulateChapter = async (record: any) => {
    try {
      setLocalLoading(true);
      const res = await adminLevelService.getAll({chapterId: record.id, _limit: 1});
      const levels = res.data || [];
      if (levels.length > 0) {
        const firstLevel = levels[0];
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

  const openPreview = (record: any) => {
    setPreviewChapter(record);
    setPreviewVisible(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({[key]: value});
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
      width: 120,
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
        } else if (status === "unpublish_pending") {
          color = "warning";
          text = "Chờ gỡ bài";
          icon = <UndoOutlined rotate={180} />;
        }
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    // Removed Author col since it's always "Me"
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
        updateFilters({status: undefined});
        break;
      default:
        updateFilters({status: key});
        break;
    }
  };

  const getActiveTab = () => {
    const status = filterValues.status;
    if (!status) return "all";
    return status;
  };

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

  return (
    <>
      <DataTable
        title="Quản lý Chương của tôi"
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </div>
        }
        loading={loading || localLoading}
        permissionResource="game_content" // Might need adjustment if generic permission blocks this
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
        // onView={openDetail}
        // onEdit={openEdit}
        // onDelete={deleteItem} // Manual handling
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onBatchDelete={batchDelete}
        batchOperations={true}
        onRefresh={refresh}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;
          const canSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const canUnpublish = record.status === "published";
          const isPendingUnpublish = record.status === "unpublish_pending";
          const canDelete = record.status === "draft" || record.status === "rejected";

          const items = [];

          if (canSubmit) {
            items.push(
              <Tooltip title="Gửi duyệt" key="submit">
                <StyledButton
                  variant="ghost"
                  buttonSize="small"
                  icon={<SendOutlined />}
                  disabled={!isOwner}
                  onClick={() => !!isOwner && submitReview?.(record.id)}
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          if (revertReview) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-revert" />);
            items.push(
              <Tooltip title="Hoàn về nháp" key="revert">
                <StyledButton
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

          if (canUnpublish) {
            if (items.length > 0) items.push(<Divider type="vertical" key="div-unpublish" />);
            items.push(
              <Tooltip title="Gỡ nội dung (Hạ bài)" key="unpublish">
                <StyledButton
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
                <StyledButton
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

          if (items.length > 0) items.push(<Divider type="vertical" key="div-view-map" />);
          items.push(
            <Tooltip title="Xem màn chơi (Map)" key="viewMap">
              <StyledButton
                variant="ghost"
                buttonSize="small"
                icon={<NodeIndexOutlined />}
                onClick={() => openPreview(record)}
                style={{color: "var(--primary-color)"}}
              />
            </Tooltip>,
          );

          items.push(<Divider type="vertical" key="div-simulate" />);
          items.push(
            <Tooltip title="Chạy thử Chương" key="simulate">
              <StyledButton
                variant="ghost"
                buttonSize="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleSimulateChapter(record)}
                style={{color: "var(--primary-color)"}}
              />
            </Tooltip>,
          );

          items.push(<Divider type="vertical" key="div-edit" />);
          items.push(
            <Tooltip title="Chỉnh sửa" key="edit">
              <StyledButton
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
                <StyledButton
                  variant="ghost"
                  buttonSize="small"
                  icon={<DeleteOutlined />}
                  disabled={!isOwner}
                  onClick={() => {
                    Modal.confirm({
                      title: "Xóa chương?",
                      content: "Hành động này không thể hoàn tác.",
                      onOk: () => deleteItem(record.id),
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
                <StyledButton
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
                  <StyledButton
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
        extra={null}
      />

      <ChapterForm
        key={currentRecord ? `edit-${currentRecord.id}` : "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
      />

      <ChapterDetail open={detailVisible} onClose={closeDetail} data={currentRecord} />

      {previewChapter && (
        <ChapterPreview
          chapterId={previewChapter.id}
          chapterName={previewChapter.name}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
        />
      )}

      <GameSimulator
        visible={simulatorVisible}
        onClose={() => setSimulatorVisible(false)}
        screens={simulatorScreens}
        title="Simulation"
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
export default ResearcherChapterManagement;
