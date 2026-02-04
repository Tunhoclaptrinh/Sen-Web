
import { Space, Tooltip, Button as AntButton, Image, Select, Card, Tag } from "antd";
import { Button, DataTable } from "@/components/common";
import { useState, useEffect } from "react";
// Reuse Admin Components
import LevelForm from "@/pages/Admin/GameManagement/LevelManagement/components/Form";
import ScreenList from "@/pages/Admin/GameManagement/LevelManagement/components/ScreenList";
import ScreenEditor from "@/pages/Admin/GameManagement/LevelManagement/components/ScreenEditor";
import LevelReorderModal from "@/pages/Admin/GameManagement/LevelManagement/components/LevelReorderModal";
import GameSimulator from "@/pages/Admin/GameManagement/LevelManagement/components/GameSimulator";
import { useLevelModel } from "./model";
import {
    AppstoreOutlined,
    ArrowLeftOutlined,
    PlayCircleOutlined,
    OrderedListOutlined
} from "@ant-design/icons";

import adminChapterService from "@/services/admin-chapter.service";
import adminScreenService from "@/services/admin-screen.service";
import { getImageUrl } from "@/utils/image.helper";
import { useAuth } from "@/hooks/useAuth";

const ResearcherLevelManagement = ({ chapterId, chapterName, hideCard }: { chapterId?: number; chapterName?: string; hideCard?: boolean }) => {
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
  } = useLevelModel(chapterId ? { chapterId: chapterId } : undefined);

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
  
  // Filter State - Only load "My Chapters" for the dropdown
  const [chapters, setChapters] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
     // Researcher should only see THEIR chapters in the filter dropdown
      adminChapterService.getAll({ 
          _limit: 100,
          createdBy: user?.id 
      }).then(res => { 
            if(res.success) {
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
          const res = await adminScreenService.getScreens(level.id);
          const screens = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          
          if (res.success && screens.length > 0) {
              setSimulatorScreens(screens);
          } else {
              setSimulatorScreens([]);
          }
           setSimulatorVisible(true);
      } catch (e) {
          console.error(e);
      }
  };

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 40,
      align: 'center' as const,
      render: (url: string) => (
          <div style={{ margin: '0 auto', width: 60, height: 36, borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image 
                  src={getImageUrl(url)} 
                  alt="thumbnail" 
                  width={60}
                  height={36}
                  style={{ objectFit: 'cover' }} 
                  fallback="https://via.placeholder.com/60x36?text=No+Img"
              />
          </div>
      )
    },
    {
      title: "Tên Màn chơi",
      dataIndex: "name",
      width: 250,
      align: 'left' as const,
      searchable: true,
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      width: 80,
      render: (val: string) => {
          const colors: any = { easy: 'green', medium: 'orange', hard: 'red' };
          return <span style={{color: colors[val] || 'black'}}>{val?.toUpperCase()}</span>
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
          const colors: any = { published: 'green', pending: 'orange', draft: 'default', rejected: 'red' };
          const labels: any = { published: 'Đã xuất bản', pending: 'Chờ duyệt', draft: 'Nháp', rejected: 'Từ chối' };
          return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
      }
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      width: 20,
      sorter: true,
      defaultSortOrder: chapterId ? 'ascend' as const : undefined,
    },
    // Removed Author Column
  ];

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
                                size="small"
                            >
                                Quay lại
                            </AntButton>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>{currentLevel.name} - Quản lý Screens</span>
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
                    style={hideCard 
                        ? { boxShadow: 'none', background: 'transparent' } 
                        : { borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                    }
                    styles={{ 
                        header: { padding: hideCard ? 0 : undefined },
                        body: { padding: '0' } 
                    }}
                >
                    <div style={{ padding: hideCard ? 0 : 24 }}>
                        <div style={{display: 'flex', gap: 24}}>
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
                        backgroundMusic: currentLevel.backgroundMusic
                    }}
                    screensCount={screensCount}
                    screen={currentScreen}
                    onSuccess={() => {
                        setEditorVisible(false);
                        setScreenListRefreshing(prev => prev + 1);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Màn chơi của tôi (Levels)</h2>
                {!chapterId && (
                    <Select
                        placeholder="Lọc theo Chương"
                        style={{ width: 250 }}
                        allowClear
                        value={filters.chapterId}
                        onChange={(val) => updateFilters({ chapterId: val })}
                        showSearch
                        optionFilterProp="label"
                        options={chapters.map((c: any) => ({ label: c.name, value: c.id }))}
                    />
                )}
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
        onEdit={openEdit}
        onDelete={deleteItem}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onBatchDelete={batchDelete}
        onRefresh={refresh}
        
        hideCard={hideCard}
        customActions={(record) => (
            <Space size={4}>
                 <Tooltip title="Chạy thử (Run Level)">
                    <AntButton
                        type="text"
                        size="small"
                        icon={<PlayCircleOutlined />}
                        style={{color: 'var(--primary-color)'}}
                        onClick={(e) => { e.stopPropagation(); handleRunLevel(record); }}
                    />
                </Tooltip>
                 <Tooltip title="Quản lý Screens">
                    <AntButton
                        type="text"
                        size="small"
                        icon={<AppstoreOutlined />}
                        style={{color: 'var(--primary-color)'}}
                        onClick={(e) => { e.stopPropagation(); enterScreenMode(record); }}
                    />
                </Tooltip>
            </Space>
        )}
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
