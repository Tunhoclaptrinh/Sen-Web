import React from 'react';
import { Button, Space, Modal, Form, Input, Tag, Select, InputNumber } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { useLearningModel } from './model';
import DataTable from '@/components/common/DataTable';

const LearningManagement: React.FC = () => {
    const model = useLearningModel();

    const columns = [
        {
            title: 'Tiêu đề bài học',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            width: 120,
            render: (difficulty: string) => {
                const colors: any = {
                    easy: 'green',
                    medium: 'blue',
                    hard: 'red'
                };
                return <Tag color={colors[difficulty]}>{difficulty.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'estimated_duration',
            key: 'estimated_duration',
            width: 150,
            render: (val: number) => `${val} phút`
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Bài học & Lộ trình (Learning)"
                loading={model.loading}
                columns={columns}
                dataSource={model.data}
                pagination={model.pagination}
                onChange={model.handleTableChange}
                searchable
                onSearch={model.search}
                onAdd={model.openCreate}
                onEdit={model.openEdit}
                onDelete={model.remove}
            />

            <Modal
                title={model.currentRecord ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord || { difficulty: 'easy', estimated_duration: 30, content_type: 'article' }}
                    onFinish={model.handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề bài học"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input prefix={<ReadOutlined />} placeholder="Ví dụ: Lịch sử nhà Đinh" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="difficulty"
                            label="Độ khó"
                        >
                            <Select>
                                <Select.Option value="easy">Easy (Dễ)</Select.Option>
                                <Select.Option value="medium">Medium (Trung bình)</Select.Option>
                                <Select.Option value="hard">Hard (Khó)</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="estimated_duration"
                            label="Thời gian (phút)"
                        >
                            <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                        <Form.Item
                            name="content_type"
                            label="Loại nội dung"
                        >
                            <Select>
                                <Select.Option value="article">Article (Bài đọc)</Select.Option>
                                <Select.Option value="video">Video</Select.Option>
                                <Select.Option value="interactive">Interactive (Tương tác)</Select.Option>
                                <Select.Option value="quiz">Quiz</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, current) => prev.content_type !== current.content_type}
                    >
                        {({ getFieldValue }) => {
                            const type = getFieldValue('content_type');
                            return type === 'video' ? (
                                <Form.Item
                                    name="content_url"
                                    label="Video URL (Embed Link)"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="https://www.youtube.com/embed/..." />
                                </Form.Item>
                            ) : type === 'article' ? (
                                <Form.Item
                                    name="content_url"
                                    label="Nội dung bài học (HTML)"
                                >
                                    <Input.TextArea rows={8} placeholder="<p>Nội dung...</p>" />
                                </Form.Item>
                            ) : type === 'interactive' ? (
                                <Form.Item
                                    name="content_url"
                                    label="Đường dẫn Game/App"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="/game/..." />
                                </Form.Item>
                            ) : null;
                        }}
                    </Form.Item>

                    <Form.Item
                        label="Cấu trúc Quiz (JSON)"
                        name={['quiz']}
                        tooltip="Nhập cấu trúc JSON cho Quiz nếu có"
                        normalize={(value) => {
                            // Attempt to parse to check validity or just leave as is if handling string
                            return value;
                        }}
                    >
                        <Input.TextArea
                            rows={8}
                            placeholder='{"id": 1, "passing_score": 50, "questions": [...]}'
                            onChange={() => {
                                // Optional: validate JSON on change
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả ngắn"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={model.closeForm}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={model.loading}>
                                {model.currentRecord ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default LearningManagement;
