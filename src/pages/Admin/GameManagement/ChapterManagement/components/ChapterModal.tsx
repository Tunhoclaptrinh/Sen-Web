import {Modal, Tabs} from "antd";
import {useState, useEffect} from "react";
import {Chapter} from "@/types";
import ChapterInfoTab from "./ChapterInfoTab";
import LevelsTab from "./LevelsTab";

interface ChapterModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  data: Chapter | null;
  mode: "view" | "edit" | "create";
  onSubmit?: (values: any) => Promise<boolean>;
}

const ChapterModal: React.FC<ChapterModalProps> = ({open, onCancel, onSuccess, data, mode, onSubmit}) => {
  const [activeTab, setActiveTab] = useState("1");
  const [chapterData, setChapterData] = useState<Chapter | null>(data);

  useEffect(() => {
    if (open) {
      setChapterData(data);
      setActiveTab("1"); // Reset to first tab when opening
    }
  }, [open, data]);

  const getTitle = () => {
    switch (mode) {
      case "view":
        return "Chi tiết Chương";
      case "edit":
        return "Chỉnh sửa Chương";
      case "create":
        return "Tạo Chương Mới";
      default:
        return "Thông tin Chương";
    }
  };

  const handleChapterUpdate = (updatedChapter: Chapter) => {
    setChapterData(updatedChapter);
  };

  const tabItems = [
    {
      key: "1",
      label: "Thông tin chung",
      children: (
        <ChapterInfoTab
          data={chapterData}
          mode={mode}
          onUpdate={handleChapterUpdate}
          onSuccess={onSuccess}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      ),
    },
    // Only show Levels tab when editing (chapter already exists)
    ...(mode === "edit" && chapterData?.id
      ? [
          {
            key: "2",
            label: "Danh sách Màn chơi",
            children: <LevelsTab chapterId={String(chapterData.id)} chapterName={chapterData.name} />,
          },
        ]
      : []),
  ];

  return (
    <Modal
      title={getTitle()}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={mode === "view" ? 700 : 900}
      destroyOnClose
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Modal>
  );
};

export default ChapterModal;
