import React from 'react';
import { Form, Input, Button, Card, Row, Col, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';

interface TimelineEditorProps {
    form: FormInstance;
}

const TimelineEditor: React.FC<TimelineEditorProps> = () => {
    return (
        <div>
            <Form.Item name="instruction" label="Hướng dẫn" initialValue="Sắp xếp các sự kiện theo đúng thứ tự thời gian">
                <Input />
            </Form.Item>

            <p style={{color: '#666', fontStyle: 'italic', marginBottom: 16}}>
                * Hệ thống sẽ tự động sắp xếp theo Năm để tạo ra đáp án đúng (Correct Order).
            </p>

            <Form.List name="events">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {fields.map(({ key, name, ...restField }, index) => (
                            <Card 
                                key={key} 
                                size="small"
                                title={`Sự kiện #${index + 1}`}
                                extra={
                                    <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => remove(name)} 
                                    />
                                }
                            >
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'year']}
                                            label="Năm"
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber style={{width: '100%'}} placeholder="1802" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={18}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'text']}
                                            label="Nội dung sự kiện"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="Vua Gia Long lên ngôi..." />
                                        </Form.Item>
                                    </Col>
                                     <Col span={24}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            label="ID (Unique)"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="evt_1" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                        
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Thêm sự kiện
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );
};

export default TimelineEditor;
