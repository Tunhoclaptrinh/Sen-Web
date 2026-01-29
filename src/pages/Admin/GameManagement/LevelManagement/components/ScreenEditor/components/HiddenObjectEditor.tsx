import React from 'react';
import { Form, Input, Button, Card, Row, Col, InputNumber, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';

interface HiddenObjectEditorProps {
    form: FormInstance;
}

const HiddenObjectEditor: React.FC<HiddenObjectEditorProps> = () => {
    return (
        <div>
             <Row gutter={16}>
                <Col span={16}>
                     <Form.Item name="background_image" label="Hình nền màn chơi (URL)" rules={[{ required: true }]}>
                        <Input placeholder="URL hình nền..." />
                    </Form.Item>
                </Col>
                <Col span={8}>
                     <Form.Item name="required_items" label="Số lượng cần tìm">
                        <InputNumber min={1} style={{width: '100%'}} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                     <Form.Item name="guide_text" label="Hướng dẫn">
                        <Input placeholder="Ví dụ: Tìm 3 vật phẩm của Chú Tễu..." />
                    </Form.Item>
                </Col>
            </Row>

            <Divider orientation="left">Danh sách vật phẩm ẩn</Divider>

            <Form.List name="items">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {fields.map(({ key, name, ...restField }, index) => (
                            <Card 
                                key={key} 
                                size="small" 
                                title={`Vật phẩm #${index + 1}`} 
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
                                    <Col span={12}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            label="ID Item"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="item_fan" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'name']}
                                            label="Tên hiển thị"
                                            rules={[{ required: true }]}
                                        >
                                            <Input placeholder="Cái quạt" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'fact_popup']}
                                            label="Thông tin (Fact Popup)"
                                        >
                                            <Input.TextArea rows={2} placeholder="Thông tin hiện ra khi tìm thấy..." />
                                        </Form.Item>
                                    </Col>
                                    
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'x']} label="X (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'y']} label="Y (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'width']} label="Width (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                         <Form.Item {...restField} name={[name, 'coordinates', 'height']} label="Height (%)">
                                            <InputNumber min={0} max={100} style={{width: '100%'}} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                        
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Thêm vật phẩm
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );
};

export default HiddenObjectEditor;


