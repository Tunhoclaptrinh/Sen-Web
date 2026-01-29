import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col } from 'antd';
import { 
    PlusOutlined, 
    DeleteOutlined, 
    CustomerServiceOutlined, 
    CloudUploadOutlined, 
    LinkOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import { message } from 'antd';
import FileUpload from '@/components/common/Upload/FileUpload';
import { getImageUrl } from '@/utils/image.helper';

interface DialogueEditorProps {
    form: FormInstance;
}

interface DialogueItemProps {
    field: { key: number; name: number; [key: string]: any };
    index: number;
    remove: (name: number) => void;
    restField: any;
    form: FormInstance;
}

const DialogueItem: React.FC<DialogueItemProps> = ({ field, index, remove, restField, form }) => {
    const { key, name } = field;
    const [audioMode, setAudioMode] = useState<'link' | 'upload'>('link');
    
    return (
        <Card 
            key={key} 
            size="small" 
            title={<span style={{fontSize: 13, fontWeight: 600}}>ĐOẠN THOẠI #{index + 1}</span>} 
            extra={
                <Button 
                    type="text" 
                    danger 
                    size="small"
                    icon={<DeleteOutlined />} 
                    onClick={() => remove(name)} 
                />
            }
            style={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
            bodyStyle={{ padding: '16px' }}
        >
            <Row gutter={[16, 12]}>
                <Col span={6}>
                    <Form.Item
                        {...restField}
                        name={[name, 'speaker']}
                        label="Người nói"
                        rules={[{ required: true, message: 'Missing speaker' }]}
                    >
                        <Select size="small">
                            <Select.Option value="AI">AI Character</Select.Option>
                            <Select.Option value="USER">Người chơi</Select.Option>
                            <Select.Option value="NARRATOR">Người dẫn chuyện</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item
                        {...restField}
                        name={[name, 'emotion']}
                        label="Cảm xúc"
                    >
                         <Select placeholder="Chọn cảm xúc" size="small">
                            <Select.Option value="normal">Bình thường</Select.Option>
                            <Select.Option value="happy">Vui vẻ</Select.Option>
                            <Select.Option value="sad">Buồn</Select.Option>
                            <Select.Option value="angry">Tức giận</Select.Option>
                            <Select.Option value="surprised">Ngạc nhiên</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Âm thanh (Voiceover)" style={{marginBottom: 0}}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <Select 
                                size="small" 
                                value={audioMode} 
                                onChange={setAudioMode} 
                                style={{ width: 100 }}
                                options={[
                                    { value: 'upload', label: <span><CloudUploadOutlined /> File</span> },
                                    { value: 'link', label: <span><LinkOutlined /> Link</span> }
                                ]}
                            />
                            <Form.Item {...restField} name={[name, 'audio']} noStyle>
                                {audioMode === 'upload' ? (
                                    <FileUpload 
                                        accept="audio/*" 
                                        placeholder="Tải lên..." 
                                    />
                                ) : (
                                    <Input 
                                        size="small" 
                                        prefix={<CustomerServiceOutlined style={{color: '#bfbfbf'}} />} 
                                        placeholder="https://..." 
                                    />
                                )}
                            </Form.Item>
                            
                            {form.getFieldValue(['content', name, 'audio']) && (
                                <Button 
                                    size="small" 
                                    icon={<PlayCircleOutlined />} 
                                    onClick={() => {
                                        const audioPath = form.getFieldValue(['content', name, 'audio']);
                                        const url = getImageUrl(audioPath);
                                        new Audio(url).play().catch(() => message.error("Không thể phát âm thanh"));
                                    }}
                                />
                            )}
                        </div>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item
                        {...restField}
                        name={[name, 'text']}
                        label="Nội dung hội thoại"
                        rules={[{ required: true, message: 'Missing text' }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Input.TextArea rows={2} placeholder="Nhập lời thoại..." style={{ borderRadius: 6 }} />
                    </Form.Item>
                </Col>
            </Row>
        </Card>
    );
};

const DialogueEditor: React.FC<DialogueEditorProps> = ({ form }) => {
    return (
        <div>
             <p style={{marginBottom: 16, color: '#666', fontSize: 13}}>
                Quản lý các đoạn hội thoại trong màn chơi. Mỗi đoạn thoại có thể đính kèm âm thanh lời thoại (Voiceover).
            </p>

            <Form.List name="content">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {fields.map(({ key, name, ...restField }, index) => (
                            <DialogueItem 
                                key={key}
                                field={{ key, name }}
                                index={index}
                                remove={remove}
                                restField={restField}
                                form={form}
                            />
                        ))}
                        
                        <Button 
                            type="primary" 
                            ghost
                            onClick={() => add()} 
                            block 
                            icon={<PlusOutlined />}
                            style={{ 
                                borderRadius: 8, 
                                height: 44, 
                                borderStyle: 'dashed',
                                fontWeight: 500
                            }}
                        >
                            Thêm đoạn thoại mới
                        </Button>
                    </div>
                )}
            </Form.List>

        </div>
    );
};

export default DialogueEditor;
