import React from 'react';
import { Button, Space, Modal, Form, Input, Tag, Select, Switch } from 'antd';

import { useCharacterModel } from './model';
import DataTable from '@/components/common/DataTable';

const CharacterManagement: React.FC = () => {
    const model = useCharacterModel();

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'avatar',
            key: 'avatar',
            width: 80,
            render: (url: string) => url ? <img src={url} alt="avatar" style={{ width: 40, height: 40, borderRadius: 4 }} /> : null,
        },
        {
            title: 'Tên nhân vật',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: 'Độ hiếm',
            dataIndex: 'rarity',
            key: 'rarity',
            width: 100,
            render: (rarity: string) => {
                const colors: any = {
                    common: 'default',
                    rare: 'blue',
                    epic: 'purple',
                    legendary: 'orange'
                };
                return <Tag color={colors[rarity]}>{rarity.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Nguồn gốc',
            dataIndex: 'origin',
            key: 'origin',
            width: 150,
        },
        {
            title: 'Sưu tầm',
            dataIndex: 'is_collectible',
            key: 'is_collectible',
            width: 100,
            align: 'center' as const,
            render: (val: boolean) => val ? <Tag color="green">CÓ</Tag> : <Tag>KHÔNG</Tag>
        },
        {
            title: 'Tính cách',
            dataIndex: 'speaking_style',
            key: 'speaking_style',
            ellipsis: true,
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Nhân vật Game"
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
                title={model.currentRecord ? 'Chỉnh sửa nhân vật' : 'Thêm nhân vật mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord || { rarity: 'common', is_collectible: true }}
                    onFinish={model.handleSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="name"
                            label="Tên nhân vật"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Ví dụ: Chú Tễu" />
                        </Form.Item>
                        <Form.Item
                            name="rarity"
                            label="Độ hiếm"
                        >
                            <Select>
                                <Select.Option value="common">Common</Select.Option>
                                <Select.Option value="rare">Rare</Select.Option>
                                <Select.Option value="epic">Epic</Select.Option>
                                <Select.Option value="legendary">Legendary</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="origin"
                            label="Nguồn gốc / Xuất xứ"
                        >
                            <Input placeholder="Ví dụ: Múa rối nước" />
                        </Form.Item>
                        <Form.Item
                            name="is_collectible"
                            label="Có thể sưu tầm?"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="avatar"
                        label="Lên kết ảnh Avatar"
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={2} placeholder="Mô tả chung về nhân vật" />
                    </Form.Item>

                    <Form.Item
                        name="persona"
                        label="Persona (Hành vi AI)"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả cách AI đóng vai nhân vật này" />
                    </Form.Item>

                    <Form.Item
                        name="speaking_style"
                        label="Phong cách nói chuyện"
                    >
                        <Input placeholder="Ví dụ: Hài hước, cổ điển, trang trọng" />
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

export default CharacterManagement;
