import { ViewModal } from "@/components/common";
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
  const [screensCount, setScreensCount] = useState(0);

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
      <ViewModal
        title={`${level?.name || '...'} - Quản lý Screens`}
        open={open && isListOpen}
        onClose={handleCloseAll}
        width={1200}
        footer={null}
        destroyOnClose
        fullscreen={false}
      >
        {level && (
          <ScreenList 
              levelId={level.id}
              onEdit={handleEdit}
              onAdd={handleAdd}
              onCountChange={setScreensCount}
          />
        )}
      </ViewModal>

      {/* Modal Chỉnh sửa Màn chơi */}
      {level && (
        <ScreenEditor
            open={isEditorOpen}
            levelId={level.id}
            levelMetadata={{
                chapterId: level.chapterId,
                levelName: level.name,
                order: level.order,
                backgroundMusic: level.backgroundMusic
            }}
            screensCount={screensCount}
            screen={editingScreen}
            onSuccess={() => {
                closeEditor();
            }}
            onCancel={closeEditor}
        />
      )}
    </>
  );
};

export default ScreensDrawer;
