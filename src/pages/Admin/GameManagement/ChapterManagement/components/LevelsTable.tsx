import { useState } from "react";
import { Tag, Button, Tooltip, Table, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Level } from "@/types/game.types";
import { useCRUD } from "@/hooks/useCRUD";
import adminLevelService from "@/services/admin-level.service";
import { useMemo } from "react";
import ScreensDrawer from "../../LevelManagement/components/ScreensDrawer";

interface LevelsTableProps {
  chapterId: string;
  chapterName: string;
}

const LevelsTable: React.FC<LevelsTableProps> = ({ chapterId }) => {
  const [screensDrawerOpen, setScreensDrawerOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  // CRUD Setup - filter by chapter
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      defaultFilters: { chapterId: chapterId },  // ✅ Fix: Use camelCase
      onError: (action: string, error: any) => {
        console.error(`Error ${action} level:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [chapterId],
  );

  const crud = useCRUD(adminLevelService, crudOptions);

  const openScreens = (level: Level) => {
    setSelectedLevel(level);
    setScreensDrawerOpen(true);
  };

  const closeScreens = () => {
    setScreensDrawerOpen(false);
    setSelectedLevel(null);
  };

  const columns = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 80,
      render: (order: number) => order || "-",
    },
    {
      title: "Tên Màn chơi",
      dataIndex: "name",
      key: "name",
      width: 250,
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
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Level) => (
        <Tooltip title="Xem Screens">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openScreens(record)}
            style={{ color: "var(--primary-color)" }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Table
        loading={crud.loading}
        columns={columns}
        dataSource={crud.data}
        pagination={{
          ...crud.pagination,
          showSizeChanger: false,
          size: "small",
        }}
        size="small"
        rowKey="id"
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

export default LevelsTable;
