import React, { useState, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { ViewModal } from '@/components/common';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MenuOutlined } from '@ant-design/icons';
import { Level } from '@/types';

const { Text } = Typography;

interface SortableItemProps {
  id: number;
  name: string;
  order: number;
}

const SortableItem = ({ id, name, order }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MenuOutlined style={{ color: '#999' }} />
      <div style={{ flex: 1 }}>
        <Text strong>{name}</Text>
      </div>
      <Text type="secondary" style={{ fontSize: '12px' }}>Vị trí: {order}</Text>
    </div>
  );
};

interface LevelReorderModalProps {
  visible: boolean;
  onCancel: () => void;
  levels: Level[];
  onSave: (newOrderIds: number[]) => Promise<void>;
}

const LevelReorderModal: React.FC<LevelReorderModalProps> = ({
  visible,
  onCancel,
  levels,
  onSave
}) => {
  const [items, setItems] = useState<Level[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      // Sort by order initially just in case
      const sorted = [...levels].sort((a, b) => a.order - b.order);
      setItems(sorted);
    }
  }, [visible, levels]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ids = items.map(i => i.id);
      await onSave(ids);
      onCancel();
    } catch (error) {
       // Error handled by parent usually
    } finally {
      setSaving(false);
    }
  };

  return (
    <ViewModal
      title="Sắp xếp thứ tự Màn chơi"
      open={visible}
      onClose={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Hủy</Button>,
        <Button key="save" type="primary" loading={saving} onClick={handleSave}>
          Lưu thứ tự
        </Button>
      ]}
      width={600}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px 0' }}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <SortableItem 
                key={item.id} 
                id={item.id} 
                name={item.name}
                order={index + 1} // Display hypothetical new order
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </ViewModal>
  );
};

export default LevelReorderModal;
