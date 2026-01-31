import React, { useEffect, useState, useContext } from "react";
import { 
    Button, 
    Space, 
    Tag, 
    Popconfirm, 
    message, 
    Tooltip, 
    Empty, 
    Card, 
    Typography,
    Skeleton
} from "antd";
import { 
    EditOutlined, 
    DeleteOutlined, 
    PlusOutlined, 
    MenuOutlined,
    MessageOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    HistoryOutlined,
    PlayCircleOutlined,
    PictureOutlined,
    CodeOutlined
} from "@ant-design/icons";
import { Screen } from "@/types/game.types";
import adminScreenService from "@/services/admin-screen.service";
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Text } = Typography;

interface ScreenListProps {
  levelId: number;
  onEdit: (screen: Screen) => void;
  onAdd: () => void;
  onCountChange?: (count: number) => void;
  refreshTrigger?: number;
}

// Context for sharing dnd-kit properties with the drag handle
const RowContext = React.createContext<any>({});

const DragHandle = () => {
    const { attributes, listeners } = useContext(RowContext);
    return (
        <div 
            {...attributes} 
            {...listeners} 
            style={{ 
                cursor: 'grab', 
                color: '#bfbfbf', 
                padding: '8px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.3s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#595959')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#bfbfbf')}
        >
            <MenuOutlined style={{ fontSize: 16 }} />
        </div>
    );
};

interface SortableItemProps {
    screen: Screen;
    onEdit: (screen: Screen) => void;
    onDelete: (id: string) => void;
}

const SortableItem = ({ screen, onEdit, onDelete }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: screen.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginBottom: 12,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 2 : 1,
        position: 'relative' as any,
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'DIALOGUE': return <MessageOutlined style={{ color: '#1890ff' }} />;
            case 'QUIZ': return <QuestionCircleOutlined style={{ color: '#722ed1' }} />;
            case 'HIDDEN_OBJECT': return <SearchOutlined style={{ color: '#fa8c16' }} />;
            case 'TIMELINE': return <HistoryOutlined style={{ color: '#13c2c2' }} />;
            case 'VIDEO': return <PlayCircleOutlined style={{ color: '#eb2f96' }} />;
            case 'IMAGE_VIEWER': return <PictureOutlined style={{ color: '#52c41a' }} />;
            default: return <CodeOutlined />;
        }
    };

    const getPreviewSummary = (record: Screen) => {
        const data = record as any;
        switch (record.type) {
            case 'DIALOGUE':
                return `${data.content?.length || 0} hội thoại`;
            case 'QUIZ':
                return data.question || 'Câu hỏi trắc nghiệm';
            case 'HIDDEN_OBJECT':
                return `${data.items?.length || 0} vật phẩm`;
            case 'TIMELINE':
                return `${data.events?.length || 0} mốc thời gian`;
            default:
                return record.id;
        }
    };

    return (
        <div ref={setNodeRef} style={style}>
            <RowContext.Provider value={{ attributes, listeners }}>
                <Card 
                    size="small" 
                    hoverable 
                    bodyStyle={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}
                    style={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
                >
                    <DragHandle />
                    
                    <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <div style={{ 
                            width: 40, 
                            height: 40, 
                            borderRadius: 8, 
                            background: '#f5f5f5', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: 20
                        }}>
                            {getTypeIcon(screen.type)}
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <Tag style={{ borderRadius: 4, fontWeight: 500, margin: 0 }}>{screen.type}</Tag>
                            <Text strong style={{ fontSize: 13, color: '#8c8c8c' }}>{screen.id}</Text>
                        </div>
                        <Text ellipsis style={{ display: 'block', fontSize: 14 }}>
                            {getPreviewSummary(screen)}
                        </Text>
                    </div>

                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button 
                                type="text"
                                icon={<EditOutlined />} 
                                onClick={() => onEdit(screen)}
                                style={{ color: '#1890ff' }}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Xóa màn chơi này?"
                            onConfirm={() => onDelete(screen.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                            />
                        </Popconfirm>
                    </Space>
                </Card>
            </RowContext.Provider>
        </div>
    );
};

const ScreenList: React.FC<ScreenListProps> = ({ levelId, onEdit, onAdd, onCountChange, refreshTrigger }) => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScreens = async () => {
    if (!levelId) return;
    setLoading(true);
    try {
      const res = await adminScreenService.getScreens(levelId);
      if (res.success) {
        setScreens(res.data);
        onCountChange?.(res.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch screens", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, [levelId, refreshTrigger]);

  const handleDelete = async (screenId: string) => {
    try {
      const res = await adminScreenService.deleteScreen(levelId, screenId);
      if (res.success) {
        message.success("Đã xóa màn chơi thành công");
        fetchScreens();
      }
    } catch (error) {
      console.error(error);
      message.error("Xóa thất bại");
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = screens.findIndex((s) => s.id === active.id);
        const newIndex = screens.findIndex((s) => s.id === over.id);
        const newScreens = arrayMove(screens, oldIndex, newIndex);
        setScreens(newScreens);
        
        try {
            await adminScreenService.reorderScreens(levelId, newScreens.map(s => s.id));
            message.success("Đã cập nhật thứ tự");
        } catch (error) {
            message.error("Lỗi khi lưu thứ tự");
            fetchScreens();
        }
    }
  };

  return (
    <div style={{ minHeight: 400 }}>
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 16 
        }}>
            <div>
                <Typography.Title level={5} style={{ margin: 0 }}>Danh sách Screens ({screens.length})</Typography.Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                    Cấu hình kịch bản và các thử thách trong màn chơi này
                </Text>
            </div>
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={onAdd}
                size="small"
                style={{ borderRadius: 6 }}
            >
                Thêm Màn hình
            </Button>
        </div>

        {loading ? (
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {[1, 2, 3].map(i => <Skeleton key={i} active avatar paragraph={{ rows: 1 }} style={{ background: '#fff', padding: 16, borderRadius: 8 }} />)}
            </Space>
        ) : screens.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px 0', borderStyle: 'dashed', borderRadius: 12 }}>
                <Empty 
                    description="Màn chơi chưa có screen nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={onAdd} ghost>Tạo ngay</Button>
                </Empty>
            </Card>
        ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={screens.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {screens.map((screen) => (
                            <SortableItem 
                                key={screen.id} 
                                screen={screen} 
                                onEdit={onEdit} 
                                onDelete={handleDelete} 
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        )}
    </div>
  );
};
export default ScreenList;
