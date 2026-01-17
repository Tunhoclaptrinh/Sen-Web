import { Modal } from "antd";
import { useState } from "react";
import ScreenList from "./ScreenList";
import { Level, Screen } from "@/types/game.types";
import ScreenEditor from "./ScreenEditor";

interface ScreensDrawerProps {
  open: boolean;
  onClose: () => void;
  level: Level | null;
}

const ScreensDrawer: React.FC<ScreensDrawerProps> = ({ open, onClose, level }) => {
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(true);

  const handleEdit = (screen: Screen) => {
    setEditingScreen(screen);
    setIsListOpen(false); // Đóng modal danh sách
    setIsEditorOpen(true); // Mở modal editor
  };

  const handleAdd = () => {
    setEditingScreen(null);
    setIsListOpen(false); // Đóng modal danh sách
    setIsEditorOpen(true); // Mở modal editor
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingScreen(null);
    setIsListOpen(true); // Mở lại modal danh sách
  };

  const handleCloseAll = () => {
    setIsListOpen(true);
    setIsEditorOpen(false);
    setEditingScreen(null);
    onClose();
  };

  return (
    <>
      {/* Modal Danh sách Màn chơi */}
      <Modal
        title={`Quản lý Màn chơi: ${level?.name || '...'}`}
        open={open && isListOpen}
        onCancel={handleCloseAll}
        width={1200}
        footer={null}
        destroyOnClose
      >
        {level && (
          <ScreenList 
              levelId={level.id}
              onEdit={handleEdit}
              onAdd={handleAdd}
          />
        )}
      </Modal>

      {/* Modal Chỉnh sửa Màn chơi */}
      <Modal
        title={editingScreen ? "Chỉnh sửa Màn chơi" : "Thêm Màn chơi mới"}
        open={open && isEditorOpen}
        onCancel={closeEditor}
        width={800}
        footer={null}
        destroyOnClose
      >
        {level && (
          <ScreenEditor
              levelId={level.id}
              screen={editingScreen}
              onSuccess={() => {
                  closeEditor();
              }}
              onCancel={closeEditor}
          />
        )}
      </Modal>
    </>
  );
};

export default ScreensDrawer;
