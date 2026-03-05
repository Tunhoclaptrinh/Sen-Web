import React from "react";
import { Form, Input, InputNumber } from "antd";
import { FormInstance } from "antd";
import { SCREEN_TYPES, ScreenType } from "@/types/game.types";
import ImageUpload from "@/components/common/Upload/ImageUpload";

interface MediaEditorProps {
  form: FormInstance;
  type: ScreenType;
}

const MediaEditor: React.FC<MediaEditorProps> = ({ type }) => {
  const isVideo = type === SCREEN_TYPES.VIDEO;

  return (
    <div>


      <Form.Item
        name={isVideo ? "videoUrl" : "imageUrl"}
        label={isVideo ? "Đường dẫn Video (URL) hoặc Mã nhúng (Embed Code)" : "Hình ảnh"}
        rules={[{ required: true }]}
        help={isVideo ? "Hỗ trợ link YouTube hoặc mã nhúng iframe từ YouTube" : undefined}
      >
        {isVideo ? (
          <Input.TextArea
            rows={4}
            placeholder={
              'https://www.youtube.com/watch?v=...\nHOẶC\n<iframe width="560" height="315" src="..."></iframe>'
            }
          />
        ) : (
          <ImageUpload maxCount={1} />
        )}
      </Form.Item>

      <Form.Item name="caption" label="Tiêu đề / Caption">
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Mô tả chi tiết">
        <Input.TextArea rows={3} />
      </Form.Item>

      {isVideo && (
        <Form.Item name="duration" label="Thời lượng (giây)">
          <InputNumber min={0} />
        </Form.Item>
      )}
    </div>
  );
};

export default MediaEditor;
