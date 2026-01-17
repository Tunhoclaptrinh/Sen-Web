import { Button, Table, Space, Tag, Popconfirm, message, Card } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Screen } from "@/types/game.types";
import adminScreenService from "@/services/admin-screen.service";

interface ScreenListProps {
  levelId: number;
  onEdit: (screen: Screen) => void;
  onAdd: () => void;
}

const ScreenList: React.FC<ScreenListProps> = ({ levelId, onEdit, onAdd }) => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScreens = async () => {
    if (!levelId) return;
    setLoading(true);
    try {
      const res = await adminScreenService.getScreens(levelId);
      if (res.success) {
        setScreens(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch screens", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, [levelId]);

  const handleDelete = async (screenId: string) => {
    try {
      const res = await adminScreenService.deleteScreen(levelId, screenId);
      if (res.success) {
        message.success("Đã xóa màn chơi thành công");
        fetchScreens();
      }
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
    },
    {
      title: "Loại Màn hình",
      dataIndex: "type",
      key: "type",
      width: 150,
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Xem trước",
      key: "preview",
      render: (_: any, record: Screen) => {
        // Simple preview text based on type
        if (record.type === 'DIALOGUE') return `${(record as any).content?.length || 0} hội thoại`;
        if (record.type === 'QUIZ') return `Câu hỏi: ${(record as any).question || '...'}`;
        if (record.type === 'HIDDEN_OBJECT') return `${(record as any).items?.length || 0} vật phẩm`;
        return '-';
      }
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_: any, record: Screen) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa màn chơi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title={`Chi tiết các màn chơi (${screens.length})`} 
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          Thêm màn chơi
        </Button>
      }
      style={{ marginTop: 24 }}
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={screens}
        loading={loading}
        pagination={false}
      />
    </Card>
  );
};

export default ScreenList;
