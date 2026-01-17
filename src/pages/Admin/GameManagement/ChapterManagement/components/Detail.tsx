import { Modal, Descriptions, Space, Tabs } from "antd";
import { Chapter } from "@/types";
import LevelsTable from "./LevelsTable";

interface ChapterDetailProps {
  open: boolean;
  onClose: () => void;
  data: Chapter | null;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ open, onClose, data }) => {
  if (!data) return null;

  const tabItems = [
    {
      key: "info",
      label: "Thông tin chung",
      children: (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Tên Chương" span={2}>
            {data.name}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {data.description}
          </Descriptions.Item>
          <Descriptions.Item label="Chủ đề">
            {data.theme}
          </Descriptions.Item>
          <Descriptions.Item label="Màu sắc">
            <Space>
              <div
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: data.color,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                }}
              />
              {data.color}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Thứ tự">
            {data.order}
          </Descriptions.Item>
          <Descriptions.Item label="Số cánh hoa yêu cầu">
            {data.required_petals}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "levels",
      label: "Danh sách Màn chơi",
      children: <LevelsTable chapterId={String(data.id)} chapterName={data.name} />,
    },
  ];

  return (
    <Modal
      title={`Chi tiết Chương: ${data.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <Tabs defaultActiveKey="info" items={tabItems} />
    </Modal>
  );
};

export default ChapterDetail;
