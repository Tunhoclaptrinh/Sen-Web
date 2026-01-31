import { Modal, Descriptions } from "antd";
import { Chapter } from "@/types";

interface ChapterDetailProps {
  open: boolean;
  onClose: () => void;
  data: Chapter | null;
}

const ChapterDetail: React.FC<ChapterDetailProps> = ({ open, onClose, data }) => {
  if (!data) return null;

  return (
    <Modal
      title={`Chi tiết Chương: ${data.name}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnClose
    >
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

          <Descriptions.Item label="Thứ tự">
            {data.order}
          </Descriptions.Item>
          <Descriptions.Item label="Số cánh hoa yêu cầu">
            {data.required_petals}
          </Descriptions.Item>
        </Descriptions>
    </Modal>
  );
};

export default ChapterDetail;
