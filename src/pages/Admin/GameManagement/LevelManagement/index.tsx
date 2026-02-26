import {Space, Tooltip, Button as AntButton, Select, Card, Tag, Tabs, Modal} from "antd";
import {Button, DataTable} from "@/components/common";
import {useState, useEffect} from "react";
import LevelForm from "./components/Form";
import ScreenList from "./components/ScreenList";
import ScreenEditor from "./components/ScreenEditor";
import LevelReorderModal from "./components/LevelReorderModal";
import GameSimulator from "./components/GameSimulator";
import {useLevelModel} from "./model";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  OrderedListOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UndoOutlined,
  MenuOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {Popover, Divider} from "antd";

import adminChapterService from "@/services/admin-chapter.service";
import adminScreenService from "@/services/admin-screen.service";
import {getImageUrl} from "@/utils/image.helper";
import {useAuth} from "@/hooks/useAuth";

const LevelManagement = ({
  chapterId,
  chapterName,
  hideCard,
}: {
  chapterId?: number;
  chapterName?: string;
  hideCard?: boolean;
}) => {
  const {
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
    // UI State
    currentRecord,
    formVisible,
    openCreate,
    openEdit,
    closeForm,
    // Screen Management State
    isScreenMode,
    currentLevel,
    enterScreenMode,
    exitScreenMode,
    reorderLevels,
    // Filters
    filters,
    updateFilters,
    submitReview,
    approveReview,
    handleReject,
    revertReview,
    // Import/Export
    importLoading,
    exportLoading,
    importData,
    exportData,
  } = useLevelModel(chapterId ? {chapterId: chapterId} : undefined);

  // Screen Editor State
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<any>(null);
  const [screensCount, setScreensCount] = useState(0);
  const [screenListRefreshing, setScreenListRefreshing] = useState(0);

  // Simulator State
  const [simulatorVisible, setSimulatorVisible] = useState(false);
  const [simulatorScreens, setSimulatorScreens] = useState<any[]>([]);
  const [simulatorBgm, setSimulatorBgm] = useState<string | undefined>(undefined);

  // Reorder State
  const [reorderVisible, setReorderVisible] = useState(false);

  // Filter State
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    adminChapterService.getAll({_limit: 100}).then((res) => {
      if (res.success) {
        // Handle different response structures
        const list = (res.data as any)?.items || (Array.isArray(res.data) ? res.data : []);
        setChapters(list);
      }
    });
  }, []);

  // Handlers
  const handleEditScreen = (screen: any) => {
    setCurrentScreen(screen);
    setEditorVisible(true);
  };

  const handleAddScreen = () => {
    setCurrentScreen(null);
    setEditorVisible(true);
  };

  const handleRunLevel = async (level: any) => {
    setSimulatorBgm(level.backgroundMusic);

    try {
      // ALWAYS Fetch fresh screens for the level
      console.log("Fetching fresh screens for simulator...");
      const res = await adminScreenService.getScreens(level.id);
      const screens = Array.isArray(res.data) ? res.data : res.data?.items || [];

      if (res.success && screens.length > 0) {
        setSimulatorScreens(screens);
        setSimulatorVisible(true);
      } else {
        setSimulatorScreens([]);
        setSimulatorVisible(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "backgroundImage",
      width: 40,
      align: "center" as const,
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
      title: "Tên Màn chơi",
      dataIndex: "name",
      width: 250,
      align: "left" as const,
      searchable: true,
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      width: 80,
      render: (val: string) => {
        const colors: any = {easy: "green", medium: "orange", hard: "red"};
        return <span style={{color: colors[val] || "black"}}>{val?.toUpperCase()}</span>;
      },
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
    {
      title: "Thứ tự",
      dataIndex: "order",
      width: 20,
      sorter: true,
      defaultSortOrder: chapterId ? ("ascend" as const) : undefined,
    },
    {
      title: "Tác giả",
      dataIndex: "authorName",
      key: "authorName",
      width: 120,
      render: (author: string) => <Tag color="orange">{author || "Hệ thống"}</Tag>,
    },
  ];

  const {user} = useAuth(); // Need to import useAuth

  const tabItems = [
    {key: "all", label: "Tất cả màn chơi"},
    ...(user?.role === "researcher" || user?.role === "admin" ? [{key: "my", label: "Màn chơi của tôi"}] : []),
    {key: "pending", label: "Chờ duyệt Đăng"},
    {key: "published", label: "Đã xuất bản"},
    {key: "unpublish_pending", label: "Chờ duyệt Gỡ"},
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case "all":
        updateFilters({status: undefined, createdBy: undefined});
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
    }
  };

  const getActiveTab = () => {
    if (filters.createdBy === user?.id) return "my";
    if (filters.status === "pending") return "pending";
    if (filters.status === "published") return "published";
    if (filters.status === "unpublish_pending") return "unpublish_pending";
    return "all";
  };

  // --- RENDER ---

  if (isScreenMode && currentLevel) {
    return (
      <div className="screen-management-view">
        <Card
          title={
            <Space>
              <AntButton
                icon={<ArrowLeftOutlined />}
                onClick={exitScreenMode}
                size="small" // Compact
              >
                Quay lại
              </AntButton>
              <span style={{fontSize: 16, fontWeight: 600}}>{currentLevel.name} - Quản lý Screens</span>
            </Space>
          }
          extra={
            <AntButton
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunLevel(currentLevel)}
              size="small"
            >
              Chạy thử Level này
            </AntButton>
          }
          bordered={!hideCard}
          style={
            hideCard
              ? {boxShadow: "none", background: "transparent"}
              : {borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)"}
          }
          styles={{
            header: {padding: hideCard ? 0 : undefined},
            body: {padding: "0"},
          }}
        >
          <div style={{padding: hideCard ? 0 : 24}}>
            <div style={{display: "flex", gap: 24}}>
              <div style={{flex: 1}}>
                <ScreenList
                  levelId={currentLevel.id}
                  onEdit={handleEditScreen}
                  onAdd={handleAddScreen}
                  onCountChange={setScreensCount}
                  refreshTrigger={screenListRefreshing}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Editor Modal */}
        <ScreenEditor
          open={editorVisible}
          levelId={currentLevel.id}
          levelMetadata={{
            chapterId: currentLevel.chapterId,
            chapterName: chapterName,
            levelName: currentLevel.name,
            order: currentLevel.order,
            backgroundMusic: currentLevel.backgroundMusic,
          }}
          screensCount={screensCount}
          screen={currentScreen}
          onSuccess={() => {
            setEditorVisible(false);
            setScreenListRefreshing((prev) => prev + 1);
          }}
          onCancel={() => setEditorVisible(false)}
        />

        {/* Simulator Modal */}
        <GameSimulator
          visible={simulatorVisible}
          onClose={() => setSimulatorVisible(false)}
          screens={simulatorScreens}
          title={`Running: ${currentLevel.name}`}
          bgmUrl={simulatorBgm}
        />
      </div>
    );
  }

  return (
    <>
      <DataTable
        title={
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <h2>Quản lý Màn chơi (Levels)</h2>
            {!chapterId && (
              <Select
                placeholder="Lọc theo Chương"
                style={{width: 250}}
                allowClear
                value={filters.chapterId}
                onChange={(val) => updateFilters({chapterId: val})}
                showSearch
                optionFilterProp="label"
                options={chapters.map((c: any) => ({label: c.name, value: c.id}))}
              />
            )}
          </div>
        }
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
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
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
          getCheckboxProps: (record: any) => ({
            disabled: record.createdBy !== user?.id,
          }),
        }}
        onBatchDelete={batchDelete}
        // Import/Export
        importable={true}
        importLoading={importLoading}
        onImport={importData}
        exportable={true}
        exportLoading={exportLoading}
        onExport={exportData}
        onRefresh={refresh}
        hideCard={hideCard}
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
                  onClick={() => !submitDisabled && submitReview?.(record.id)}
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
                    record.status === "unpublish_pending" ? revertReview?.(record.id) : approveReview?.(record.id)
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
                  onClick={() => handleReject(record)}
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
                  onClick={() => approveReview?.(record.id)}
                  style={{color: "#ff4d4f"}}
                />
              </Tooltip>,
            );
          }

          if (items.length > 0) items.push(<Divider type="vertical" key="div-simulate" />);
          items.push(
            <Tooltip title="Chạy thử (Run)" key="simulate">
              <Button
                variant="ghost"
                buttonSize="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleRunLevel(record)}
                style={{color: "var(--primary-color)"}}
              />
            </Tooltip>,
          );

          if (!shouldRestrictAdmin) {
            items.push(<Divider type="vertical" key="div-screens" />);
            items.push(
              <Tooltip title="Quản lý Screens" key="screens">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<AppstoreOutlined />}
                  onClick={() => enterScreenMode(record)}
                  style={{color: "var(--primary-color)"}}
                />
              </Tooltip>,
            );
          }

          items.push(<Divider type="vertical" key="div-edit" />);
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

          const popoverContent = <div style={{display: "flex", alignItems: "center", gap: "4px"}}>{items}</div>;

          return (
            <Space size={8}>
              <Tooltip title="Xem chi tiết">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<EyeOutlined />}
                  onClick={() => openEdit(record)}
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
        extra={
          filters.chapterId && (
            <Button
              variant="ghost"
              buttonSize="small"
              onClick={() => setReorderVisible(true)}
              icon={<OrderedListOutlined />}
              className="action-btn-standard"
            >
              Sắp xếp
            </Button>
          )
        }
      />

      <LevelForm
        key={currentRecord ? `edit-${currentRecord.id}` : "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentRecord}
        loading={loading}
      />

      {/* Global Simulator (if running from list) */}
      <GameSimulator
        visible={simulatorVisible}
        onClose={() => setSimulatorVisible(false)}
        screens={simulatorScreens}
        title="Running Level"
        bgmUrl={simulatorBgm}
      />

      <LevelReorderModal
        visible={reorderVisible}
        onCancel={() => setReorderVisible(false)}
        levels={data}
        onSave={reorderLevels}
      />
    </>
  );
};

export default LevelManagement;
