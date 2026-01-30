import React from 'react';
import { Form, Input, Button, Row, Col, Checkbox, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd';

interface QuizEditorProps {
    form: FormInstance;
}

const QuizEditor: React.FC<QuizEditorProps> = () => {
    return (
        <div>
            <Row gutter={16}>
                <Col span={16}>
                    <Form.Item name="question" label="Câu hỏi" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} placeholder="Nhập câu hỏi trắc nghiệm..." />
                    </Form.Item>
                </Col>
                <Col span={8}>
                     <Form.Item name="time_limit" label="Thời gian (giây)">
                        <InputNumber style={{width: '100%'}} min={0} defaultValue={60} />
                    </Form.Item>
                    <Form.Item name={['reward', 'points']} label="Điểm thường">
                         <InputNumber style={{width: '100%'}} min={0} defaultValue={10} />
                    </Form.Item>
                </Col>
            </Row>

             <p style={{marginBottom: 8, fontWeight: 500}}>Danh sách đáp án (Check vào đáp án đúng):</p>

            <Form.List name="options">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {fields.map(({ key, name, ...restField }, index) => (
                            <Row key={key} gutter={12} align="middle">
                                <Col flex="40px" style={{textAlign: 'center'}}>
                                     <Form.Item
                                        {...restField}
                                        name={[name, 'is_correct']}
                                        valuePropName="checked"
                                        style={{marginBottom: 0}}
                                    >
                                        <Checkbox />
                                    </Form.Item>
                                </Col>
                                <Col flex="auto">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'text']}
                                        rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                                        style={{marginBottom: 0}}
                                    >
                                        <Input placeholder={`Đáp án ${index + 1}`} />
                                    </Form.Item>
                                </Col>
                                <Col flex="32px">
                                     <Button 
                                        type="text" 
                                        danger 
                                        icon={<DeleteOutlined />} 
                                        onClick={() => remove(name)} 
                                    />
                                </Col>
                            </Row>
                        ))}
                        
                        <Button 
                            type="primary" 
                            ghost 
                            onClick={() => add()} 
                            block 
                            icon={<PlusOutlined />}
                            style={{ 
                                borderRadius: 8, 
                                height: 40,
                                borderStyle: 'dashed'
                            }}
                        >
                            Thêm đáp án trắc nghiệm
                        </Button>
                    </div>
                )}
            </Form.List>
        </div>
    );
};

export default QuizEditor;
