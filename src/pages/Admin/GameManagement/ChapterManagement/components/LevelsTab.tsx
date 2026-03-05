import { useState } from "react";
import { Tag, Tooltip, message } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { Button } from "@/components/common";
import { getImageUrl } from "@/utils/image.helper";
import DataTable from "@/components/common/DataTable";
import LevelForm from "../../LevelManagement/components/Form";
import ScreensDrawer from "../../LevelManagement/components/ScreensDrawer";
import { Level } from "@/types/game.types";
import { useCRUD } from "@/hooks/useCRUD";
import adminLevelService from "@/services/admin-level.service";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  // CRUD Setup - filter by chapter
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      initialFilters: { chapterId: Number(chapterId) }, // Use initialFilters and ensure Number
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
    // Auto-set status and createdBy based on role if not provided
    const status = values.status || (user?.role === "admin" ? "published" : "pending");
    const createdBy = values.createdBy || user?.id;

    // Ensure chapterId is set and converted to number for API correctness
    const levelData = {
      ...values,
      status,
      createdBy,
      chapterId: Number(chapterId),
      // Use thumbnail primarily
      thumbnail: values.thumbnail,
      // Default type if missing
      type: values.type || "story",
      // Automatically create a default dialogue screen to satisfy "Screens must be a non-empty array"
      // Sending both camelCase and snake_case for maximum compatibility with various backend versions
      screens: !currentLevel ? [
        {
          id: "intro",
          type: "DIALOGUE",
          index: 0,
          isFirst: true,
          isLast: true,
          is_first: true,
          is_last: true,
          content: [
            {
              speaker: "AI",
              text: "Chào mừng bạn đến với màn chơi mới! Hãy bắt đầu hành trình khám phá lịch sử.",
            }
          ]
        }
      ] : undefined,
    };

    let success = false;
    if (currentLevel) {
      // When updating, we don't usually send screens unless the API supports it
      const { screens, id: _, ...updateData } = levelData;
      success = await crud.update(currentLevel.id, updateData);
    } else {
      const { id: _, ...createData } = levelData;
      success = await crud.create(createData);
    }

    if (success) {
      closeForm();
    }
    return success;
  };

  const defaultInitialValues = useMemo(() => ({ chapterId: Number(chapterId) }), [chapterId]);

  const columns = [
    {
      title: "Hình ảnh",
      key: "backgroundImage",
      width: 40,
      align: "center" as const,
      render: (_: any, record: Level) => {
        const url = record.thumbnail || record.backgroundImage;
        return (
          <div
            style={{
              width: 50,
              height: 30,
              borderRadius: 4,
              overflow: "hidden",
              background: "#f5f5f5",
            }}
          >
            <img
              src={getImageUrl(url) || "https://placehold.co/60x36?text=No+Img"}
              alt="thumbnail"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        );
      },
    },
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
            variant="ghost"
            buttonSize="small"
            icon={<AppstoreOutlined />}
            onClick={() => openScreens(record)}
            className="action-btn-standard"
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
        initialValues={currentLevel ? currentLevel : defaultInitialValues}
        loading={crud.loading}
      />

      {selectedLevel && <ScreensDrawer open={screensDrawerOpen} onClose={closeScreens} level={selectedLevel} />}
    </>
  );
};

export default LevelsTab;
