import React from 'react';
import { Button, Space, Modal, Form, Input, Tag, Select, InputNumber, Switch, Card } from 'antd';
import { FlagOutlined } from '@ant-design/icons';
import { useQuestModel } from './model';
import DataTable from '@/components/common/DataTable';

const QuestManagement: React.FC = () => {
    const model = useQuestModel();

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Loại nhiệm vụ',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const colors: any = {
                    daily: 'cyan',
                    main: 'gold',
                    achievement: 'purple'
                };
                return <Tag color={colors[type]}>{type.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Phần thưởng',
            key: 'rewards',
            render: (_: any, record: any) => (
                <Space>
                    {record.rewards?.coins && <Tag color="gold">{record.rewards.coins} Xu</Tag>}
                    {record.rewards?.experience && <Tag color="blue">{record.rewards.experience} Exp</Tag>}
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'is_active',
            render: (val: boolean) => val ? <Tag color="green">KÍCH HOẠT</Tag> : <Tag>ẨN</Tag>
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Nhiệm vụ (Quests)"
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
                title={model.currentRecord ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord || { type: 'daily', is_active: true }}
                    onFinish={model.handleSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Tiêu đề nhiệm vụ"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                    >
                        <Input prefix={<FlagOutlined />} placeholder="Ví dụ: Hoàn thành 3 màn chơi" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="type"
                            label="Loại nhiệm vụ"
                        >
                            <Select>
                                <Select.Option value="daily">Daily (Hàng ngày)</Select.Option>
                                <Select.Option value="main">Main (Chính tuyến)</Select.Option>
                                <Select.Option value="achievement">Achievement (Thành tựu)</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="is_active"
                            label="Đang kích hoạt"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="Mô tả nhiệm vụ"
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả chi tiết cách thực hiện" />
                    </Form.Item>

                    <Card size="small" title="Phần thưởng" style={{ marginBottom: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: 8 }}>
                            <Form.Item
                                name={['rewards', 'coins']}
                                label="Số Xu thưởng"
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                            <Form.Item
                                name={['rewards', 'experience']}
                                label="Kinh nghiệm (Exp)"
                            >
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </div>
                    </Card>

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

export default QuestManagement;
