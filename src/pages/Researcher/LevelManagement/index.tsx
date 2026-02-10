import {Space, Tooltip, Select, Card, Tag, Popconfirm, message, Tabs} from "antd";
import {DataTable, Button, PermissionGuard} from "@/components/common";
import {useState, useEffect} from "react";
// Reuse Admin Components
import LevelForm from "@/pages/Admin/GameManagement/LevelManagement/components/Form";
import ScreenList from "@/pages/Admin/GameManagement/LevelManagement/components/ScreenList";
import ScreenEditor from "@/pages/Admin/GameManagement/LevelManagement/components/ScreenEditor";
import LevelReorderModal from "@/pages/Admin/GameManagement/LevelManagement/components/LevelReorderModal";
import GameSimulator from "@/pages/Admin/GameManagement/LevelManagement/components/GameSimulator";
import {useLevelModel} from "./model";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  PlayCircleOutlined,
  OrderedListOutlined,
  SendOutlined,
  UndoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

import adminChapterService from "@/services/admin-chapter.service";
import adminScreenService from "@/services/admin-screen.service";
import {getImageUrl} from "@/utils/image.helper";
import {useAuth} from "@/hooks/useAuth";

const ResearcherLevelManagement = ({
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
    // Review Actions
    submitReview,
    revertReview,
    // Filters
    filters,
    updateFilters,
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
  const [localLoading, setLocalLoading] = useState(false);

  // Reorder State
  const [reorderVisible, setReorderVisible] = useState(false);

  // Filter State - Only load "My Chapters" for the dropdown
  const [chapters, setChapters] = useState<any[]>([]);
  const {user} = useAuth();

  useEffect(() => {
    // Researcher should only see THEIR chapters in the filter dropdown
    adminChapterService
      .getAll({
        _limit: 100,
        createdBy: user?.id,
      })
      .then((res) => {
        if (res.success) {
          const list = (res.data as any)?.items || (Array.isArray(res.data) ? res.data : []);
          setChapters(list);
        }
      });
  }, [user]);

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
      setLocalLoading(true);
      const res = await adminScreenService.getScreens(level.id);
      const screens = Array.isArray(res.data) ? res.data : res.data?.items || [];

      if (res.success && screens.length > 0) {
        setSimulatorScreens(screens);
        setSimulatorVisible(true);
      } else if (res.success && screens.length === 0) {
        setSimulatorScreens([]);
        message.warning("Màn chơi này chưa có nội dung để chạy thử!");
        setSimulatorVisible(true);
      } else {
        message.error("Không thể tải dữ liệu màn chơi");
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
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
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
      title: "Thứ tự",
      dataIndex: "order",
      width: 20,
      sorter: true,
      defaultSortOrder: chapterId ? ("ascend" as const) : undefined,
    },
    // Removed Author Column
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
        updateFilters({status: undefined});
        break;
      default:
        updateFilters({status: key});
        break;
    }
  };

  const getActiveTab = () => {
    const status = filters.status;
    if (!status) return "all";
    return status;
  };

  // --- RENDER ---

  if (isScreenMode && currentLevel) {
    return (
      <div className="screen-management-view">
        <Card
          title={
            <Space>
              <Button variant="ghost" buttonSize="small" icon={<ArrowLeftOutlined />} onClick={exitScreenMode}>
                Quay lại
              </Button>
              <span style={{fontSize: 16, fontWeight: 600}}>{currentLevel.name} - Quản lý Screens</span>
            </Space>
          }
          extra={
            <Button
              variant="primary"
              buttonSize="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleRunLevel(currentLevel)}
            >
              Chạy thử Level này
            </Button>
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
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
            <h2>Màn chơi của tôi (Levels)</h2>
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
        user={user}
        headerContent={
          <div style={{marginBottom: 16}}>
            <div style={{marginTop: 16, background: "#fff", padding: "0 16px", borderRadius: "8px 8px 0 0"}}>
              <Tabs activeKey={getActiveTab()} items={tabItems} onChange={handleTabChange} style={{marginBottom: 0}} />
            </div>
          </div>
        }
        loading={loading || localLoading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        searchable
        onSearch={search}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={deleteItem}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
          getCheckboxProps: (record: any) => ({
            disabled: record.createdBy !== user?.id,
          }),
        }}
        onBatchDelete={batchDelete}
        batchOperations={true}
        onRefresh={refresh}
        customActions={(record) => {
          const isOwner = record.createdBy === user?.id;
          const showSubmit = record.status === "draft" || record.status === "rejected" || !record.status;
          const showRevert = record.status === "pending";

          const submitDisabled = !isOwner;
          const submitTooltip = submitDisabled
            ? `Tác giả ${record.authorName || "khác"} đang lưu nháp, chưa gửi duyệt`
            : "Gửi duyệt";

          const revertDisabled = !isOwner;
          const revertTooltip = revertDisabled ? "Chỉ tác giả mới có thể rút lại yêu cầu" : "Rút lại yêu cầu";

          return (
            <Space size={4}>
              {showSubmit && (
                <PermissionGuard resource="game_levels" action="update" fallback={null}>
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

              {showRevert && (
                <PermissionGuard resource="game_levels" action="update" fallback={null}>
                  <Tooltip title={revertTooltip}>
                    <Popconfirm
                      title="Hủy gửi duyệt?"
                      description="Bạn có muốn rút lại yêu cầu và hoàn về nháp?"
                      onConfirm={() => revertReview?.(record.id)}
                      okText="Đồng ý"
                      cancelText="Hủy"
                      disabled={revertDisabled}
                    >
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        icon={<UndoOutlined />}
                        disabled={revertDisabled}
                        className="action-btn-standard"
                        style={{color: revertDisabled ? undefined : "#faad14"}}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </Tooltip>
                </PermissionGuard>
              )}

              <Tooltip title="Chạy thử (Run Level)">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<PlayCircleOutlined />}
                  style={{color: "var(--primary-color)"}}
                  className="action-btn-standard"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunLevel(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Quản lý Screens">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  icon={<AppstoreOutlined />}
                  style={{color: "var(--primary-color)"}}
                  className="action-btn-standard"
                  onClick={(e) => {
                    e.stopPropagation();
                    enterScreenMode(record);
                  }}
                />
              </Tooltip>
            </Space>
          );
        }}
        extra={
          filters.chapterId && (
            <Button
              variant="outline"
              buttonSize="small"
              onClick={() => setReorderVisible(true)}
              icon={<OrderedListOutlined />}
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

export default ResearcherLevelManagement;
