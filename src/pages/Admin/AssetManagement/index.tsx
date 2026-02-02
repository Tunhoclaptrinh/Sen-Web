import React from 'react';
import { Button, Space, Modal, Form, Input, Select, Tag, Switch, InputNumber } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { useAssetModel } from './model';
import DataTable from '@/components/common/DataTable';

const AssetManagement: React.FC = () => {
    const model = useAssetModel();

    const columns = [
        {
            title: 'Mã (QR)',
            dataIndex: 'code',
            key: 'code',
            render: (code: string) => <Tag icon={<QrcodeOutlined />} color="blue">{code}</Tag>
        },
        {
            title: 'Tên đối tượng',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag>{type.toUpperCase()}</Tag>
        },
        {
            title: 'Phần thưởng',
            key: 'reward',
            render: (_: any, record: any) => (
                <Space>
                    {record.rewardCoins && <Tag color="gold">{record.rewardCoins} Xu</Tag>}
                    {record.rewardPetals && <Tag color="pink">{record.rewardPetals} Cánh sen</Tag>}
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'is_active',
            render: (val: boolean) => val ? <Tag color="green">HOẠT ĐỘNG</Tag> : <Tag>KHOÁ</Tag>
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Đối tượng Quét (Scan Assets)"
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
                title={model.currentRecord ? 'Chỉnh sửa đối tượng quét' : 'Tạo đối tượng quét mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord || { type: 'artifact', isActive: true, rewardCoins: 100, rewardPetals: 1 }}
                    onFinish={model.handleSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="code"
                            label="Mã định danh (QR Code)"
                            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                        >
                            <Input placeholder="Ví dụ: QR001, ART_VN_01" />
                        </Form.Item>
                        <Form.Item
                            name="name"
                            label="Tên đối tượng"
                            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                        >
                            <Input placeholder="Ví dụ: Trống đồng Ngọc Lũ" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="type"
                            label="Loại đối tượng"
                        >
                            <Select>
                                <Select.Option value="artifact">Artifact (Hiện vật)</Select.Option>
                                <Select.Option value="heritage_site">Heritage Site (Di sản)</Select.Option>
                                <Select.Option value="other">Other (Khác)</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="referenceId"
                            label="ID tham chiếu"
                            rules={[{ required: true, message: 'Vui lòng nhập ID' }]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="ID của hiện vật/di sản" />
                        </Form.Item>
                        <Form.Item
                            name="isActive"
                            label="Đang hoạt động"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="rewardCoins"
                            label="Thưởng Xu khi quét"
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item
                            name="rewardPetals"
                            label="Thưởng Cánh sen khi quét"
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="latitude"
                            label="Vĩ độ (Latitude)"
                        >
                            <InputNumber style={{ width: '100%' }} step={0.000001} />
                        </Form.Item>
                        <Form.Item
                            name="longitude"
                            label="Kinh độ (Longitude)"
                        >
                            <InputNumber style={{ width: '100%' }} step={0.000001} />
                        </Form.Item>
                    </div>

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

export default AssetManagement;
