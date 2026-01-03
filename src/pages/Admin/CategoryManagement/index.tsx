import React from 'react';
import { Button, Space, Modal, Form, Input } from 'antd';
import { useCategoryModel } from './model';
import DataTable from '@/components/common/DataTable';

const CategoryManagement: React.FC = () => {
    const model = useCategoryModel();

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            width: 80,
            align: 'center' as const,
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Danh mục Văn hóa"
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
                title={model.currentRecord ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord || {}}
                    onFinish={model.handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="Ví dụ: Kiến trúc cổ, Nghệ thuật" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={4} placeholder="Mô tả về danh mục này" />
                    </Form.Item>
                    <Form.Item
                        name="icon"
                        label="Icon (Emoji hoặc Class)"
                    >
                        <Input placeholder="Ví dụ: 🏯, 🎨" />
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

export default CategoryManagement;
