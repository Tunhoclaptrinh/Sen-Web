import { useState } from "react";
import { Tag, Button, Tooltip, message } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import DataTable from "@/components/common/DataTable";
import LevelForm from "../../LevelManagement/components/Form";
import ScreensDrawer from "../../LevelManagement/components/ScreensDrawer";
import { Level } from "@/types/game.types";
import { useCRUD } from "@/hooks/useCRUD";
import adminLevelService from "@/services/admin-level.service";
import { useMemo } from "react";

interface LevelsTabProps {
  chapterId: string;
  chapterName: string;
}

const LevelsTab: React.FC<LevelsTabProps> = ({ chapterId, chapterName }) => {
  // UI State
  const [formVisible, setFormVisible] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [screensDrawerOpen, setScreensDrawerOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedIds, setSelectedIds] = useState<React.Key[]>([]);

  // CRUD Setup - filter by chapter
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      defaultFilters: { chapter_id: chapterId },
      onError: (action: string, error: any) => {
        console.error(`Error ${action} level:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [chapterId],
  );

  const crud = useCRUD(adminLevelService, crudOptions);

  // UI Handlers
  const openCreate = () => {
    setCurrentLevel(null);
    setFormVisible(true);
  };

  const openEdit = (record: Level) => {
    setCurrentLevel(record);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setCurrentLevel(null);
  };

  const openScreens = (level: Level) => {
    setSelectedLevel(level);
    setScreensDrawerOpen(true);
  };

  const closeScreens = () => {
    setScreensDrawerOpen(false);
    setSelectedLevel(null);
  };

  const handleSubmit = async (values: any) => {
    // Ensure chapter_id is set
    const levelData = {
      ...values,
      chapter_id: chapterId,
    };

    let success = false;
    if (currentLevel) {
      success = await crud.update(currentLevel.id, levelData);
    } else {
      success = await crud.create(levelData);
    }

    if (success) {
      closeForm();
    }
    return success;
  };

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 80,
      sorter: true,
    },
    {
      title: "Tên Màn chơi",
      dataIndex: "name",
      key: "name",
      width: 250,
      searchable: true,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: string) => <Tag color="blue">{type?.toUpperCase()}</Tag>,
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 100,
      render: (diff: string) => {
        let color = "green";
        if (diff === "medium") color = "orange";
        if (diff === "hard") color = "red";
        return <Tag color={color}>{diff?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Screens",
      key: "screens",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Level) => (
        <Tooltip title="Quản lý Screens">
          <Button
            type="text"
            icon={<AppstoreOutlined />}
            onClick={() => openScreens(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: "#666", marginBottom: 8 }}>
          Chương: <strong>{chapterName}</strong>
        </p>
      </div>

      <DataTable
        loading={crud.loading}
        columns={columns}
        dataSource={crud.data}
        pagination={crud.pagination}
        onChange={crud.handleTableChange}
        searchable
        onSearch={crud.search}
        onAdd={openCreate}
        onEdit={openEdit}
        onDelete={crud.remove}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: setSelectedIds,
        }}
        onBatchDelete={crud.batchDelete}
        batchOperations={true}
        onRefresh={crud.refresh}
      />

      <LevelForm
        key={currentLevel ? `edit-${currentLevel.id}` : "create"}
        open={formVisible}
        onCancel={closeForm}
        onSubmit={handleSubmit}
        initialValues={currentLevel ? currentLevel : { chapter_id: chapterId }}
        loading={crud.loading}
      />

      {selectedLevel && (
        <ScreensDrawer
          open={screensDrawerOpen}
          onClose={closeScreens}
          level={selectedLevel}
        />
      )}
    </>
  );
};

export default LevelsTab;
