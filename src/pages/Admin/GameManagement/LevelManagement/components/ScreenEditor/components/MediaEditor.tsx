import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import { FormInstance } from 'antd/lib/form';
import { SCREEN_TYPES, ScreenType } from '@/types/game.types';

interface MediaEditorProps {
    form: FormInstance;
    type: ScreenType;
}

const MediaEditor: React.FC<MediaEditorProps> = ({ type }) => {
    const isVideo = type === SCREEN_TYPES.VIDEO;

    return (
        <div>
            <Form.Item 
                name={isVideo ? "video_url" : "image"} 
                label={isVideo ? "Đường dẫn Video (URL)" : "Đường dẫn Hình ảnh (URL)"}
                rules={[{ required: true }]}
            >
                <Input placeholder="https://..." />
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
