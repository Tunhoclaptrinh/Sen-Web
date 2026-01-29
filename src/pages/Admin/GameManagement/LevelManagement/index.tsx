import { Space, Typography, Tooltip, Button as AntButton, Image } from "antd";
import { Button, DataTable } from "@/components/common";
import { useState } from "react";
import LevelForm from "./components/Form";
import ScreenList from "./components/ScreenList";
import ScreenEditor from "./components/ScreenEditor";
import LevelReorderModal from "./components/LevelReorderModal";
import GameSimulator from "./components/GameSimulator";
import { useLevelModel } from "./model";
import {
    AppstoreOutlined,
    ArrowLeftOutlined,
    PlayCircleOutlined,
    OrderedListOutlined
} from "@ant-design/icons";

import adminScreenService from "@/services/admin-screen.service";
import { getImageUrl } from "@/utils/image.helper";

const { Title } = Typography;

const LevelManagement = ({ chapterId, chapterName, hideCard }: { chapterId?: number; chapterName?: string; hideCard?: boolean }) => {
  const {
    // ... existing ...
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
    reorderLevels // Add this
  } = useLevelModel(chapterId ? { chapter_id: chapterId } : undefined);

  // Screen Editor State
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<any>(null);
  const [screensCount, setScreensCount] = useState(0);

  // Simulator State
  const [simulatorVisible, setSimulatorVisible] = useState(false);
  const [simulatorScreens, setSimulatorScreens] = useState<any[]>([]);

  // Reorder State
  const [reorderVisible, setReorderVisible] = useState(false);

  // ... (existing handlers)



  const handleEditScreen = (screen: any) => {
      setCurrentScreen(screen);
      setEditorVisible(true);
  };

  const handleAddScreen = () => {
      setCurrentScreen(null);
      setEditorVisible(true);
  };

  const handleRunLevel = async (level: any) => {
      // Fetch fresh screens for the level to ensure up-to-date order
      try {
          // 1. Try to use screens from local level object first
          if (level.screens && Array.isArray(level.screens) && level.screens.length > 0) {
              console.log("Using local screens from level object");
              setSimulatorScreens(level.screens);
              setSimulatorVisible(true);
              return;
          }

          // 2. Fallback to API
          const res = await adminScreenService.getScreens(level.id);
          const screens = Array.isArray(res.data) ? res.data : (res.data?.items || []);
          
          if (res.success && screens.length > 0) {
              setSimulatorScreens(screens);
              setSimulatorVisible(true);
          } else {
             // Fallback if no screens
              setSimulatorScreens([]);
              setSimulatorVisible(true);
          }
      } catch (e) {
          console.error(e);
      }
  };

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      width: 20,
      sorter: true,
      defaultSortOrder: 'ascend',
    },
    {
      title: "Hình ảnh",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 40,
      align: 'center',
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
      align: 'left',
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
    }
  ];

  // --- RENDER ---

  if (isScreenMode && currentLevel) {
      return (
          <div className="screen-management-view">
                <div style={{marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Space>
                        <AntButton 
                            icon={<ArrowLeftOutlined />} 
                            onClick={exitScreenMode}
                            size="small"
                        >
                            Quay lại DS Màn chơi
                        </AntButton>
                        <Title level={5} style={{margin: 0}}>
                            {currentLevel.name} - Quản lý Screens
                        </Title>
                    </Space>
                    <AntButton
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleRunLevel(currentLevel)}
                        size="small"
                    >
                        Chạy thử Level này
                    </AntButton>
                </div>

                <div style={{display: 'flex', gap: 24}}>
                    <div style={{flex: 1}}>
                        <ScreenList
                            levelId={currentLevel.id}
                            onEdit={handleEditScreen}
                            onAdd={handleAddScreen}
                            onCountChange={setScreensCount}
                        />
                    </div>
                </div>

                {/* Editor Modal */}
                {currentLevel && (
                    <ScreenEditor
                        open={editorVisible}
                        levelId={currentLevel.id}
                        levelMetadata={{
                            chapter_id: currentLevel.chapter_id,
                            chapter_name: chapterName,
                            level_name: currentLevel.name,
                            order: currentLevel.order
                        }}
                        screensCount={screensCount}
                        screen={currentScreen}
                        onSuccess={() => {
                            setEditorVisible(false);
                            // Signal refresh if needed (though ScreenList handles its own fetch)
                        }}
                        onCancel={() => setEditorVisible(false)}
                    />
                )}

                 {/* Simulator Modal */}
                 <GameSimulator
                    visible={simulatorVisible}
                    onClose={() => setSimulatorVisible(false)}
                    screens={simulatorScreens}
                    title={`Running: ${currentLevel.name}`}
                 />
          </div>
      );
  }

  return (
    <>
      <DataTable
        title="Quản lý Màn chơi (Levels)"
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
            <Button 
                variant="outline"
                buttonSize="small"
                onClick={() => setReorderVisible(true)}
                icon={<OrderedListOutlined />}
            >
                Sắp xếp
            </Button>
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
