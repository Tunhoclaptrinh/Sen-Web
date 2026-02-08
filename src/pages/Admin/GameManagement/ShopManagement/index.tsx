import React from 'react';
import { Button, Space, Modal, Form, Input, Tag, Select, InputNumber, Switch } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useShopModel } from './model';
import DataTable from '@/components/common/DataTable';
import { ShopItemType, ShopCurrency, SHOP_TYPE_LABELS, CURRENCY_LABELS, EFFECT_LABELS, getAllShopTypes, getAllCurrencies } from '@/constants/shop.constants';

const ShopManagement: React.FC = () => {
    const model = useShopModel();

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 80,
            render: (url: string) => url ? <img src={url} alt="item" style={{ width: 40, height: 40, borderRadius: 4 }} /> : null,
        },
        {
            title: 'Tên vật phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: ShopItemType) => {
                const label = SHOP_TYPE_LABELS[type] || type;
                return <Tag color="purple">{label}</Tag>;
            }
        },
        {
            title: 'Effect',
            dataIndex: 'effect',
            key: 'effect',
            render: (effect: string) => {
                if (!effect) return <Tag color="default">-</Tag>;
                const label = EFFECT_LABELS[effect] || effect;
                return <Tag color="blue">{label}</Tag>;
            }
        },
        {
            title: 'Giá',
            key: 'price',
            render: (_: any, record: any) => {
                const currencyLabel = record.currency === ShopCurrency.PETALS ? 'Cánh sen' : 'Xu';
                const color = record.currency === ShopCurrency.PETALS ? 'pink' : 'gold';
                return (
                    <Tag color={color}>
                        {record.price} {currencyLabel}
                    </Tag>
                );
            }
        },
        {
            title: 'Số lượng',
            key: 'stack',
            render: (_: any, record: any) => (
                record.isConsumable ? (
                    <Tag color="orange">Tiêu hao (Max: {record.maxStack || 99})</Tag>
                ) : (
                    <Tag color="cyan">Vĩnh viễn</Tag>
                )
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (val: boolean) => val ? <Tag color="green">ĐANG BÁN</Tag> : <Tag>HẾT HÀNG</Tag>
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Cửa hàng vật phẩm"
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
                title={model.currentRecord ? 'Chỉnh sửa vật phẩm' : 'Thêm vật phẩm mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                width={650}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord || { 
                        currency: ShopCurrency.COINS, 
                        type: ShopItemType.HINT, 
                        isActive: true, 
                        isAvailable: true,
                        isConsumable: true,
                        maxStack: 99
                    }}
                    onFinish={model.handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên vật phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên vật phẩm' }]}
                    >
                        <Input prefix={<ShoppingCartOutlined />} placeholder="Ví dụ: Gợi ý thông minh" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="type"
                            label="Loại vật phẩm"
                            rules={[{ required: true, message: 'Chọn loại vật phẩm' }]}
                        >
                            <Select>
                                {getAllShopTypes().map(type => (
                                    <Select.Option key={type} value={type}>
                                        {SHOP_TYPE_LABELS[type]}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="price"
                            label="Giá bán"
                            rules={[{ required: true, message: 'Nhập giá bán' }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} placeholder="10" />
                        </Form.Item>
                        <Form.Item
                            name="currency"
                            label="Loại tiền tệ"
                            rules={[{ required: true, message: 'Chọn loại tiền' }]}
                        >
                            <Select>
                                {getAllCurrencies().map(currency => (
                                    <Select.Option key={currency} value={currency}>
                                        {CURRENCY_LABELS[currency]}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="effect"
                        label="Effect (Hiệu ứng)"
                        tooltip="Hiệu ứng của vật phẩm khi sử dụng"
                    >
                        <Select placeholder="Chọn hiệu ứng" allowClear>
                            {Object.entries(EFFECT_LABELS).map(([key, label]) => (
                                <Select.Option key={key} value={key}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="isConsumable"
                            label="Tiêu hao được"
                            valuePropName="checked"
                            tooltip="Vật phẩm có thể dùng nhiều lần và hết không?"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            name="maxStack"
                            label="Số lượng tối đa"
                            tooltip="Số lượng tối đa có thể sở hữu cùng lúc"
                        >
                            <InputNumber style={{ width: '100%' }} min={1} max={999} placeholder="99" />
                        </Form.Item>
                        <Form.Item
                            name="isActive"
                            label="Đang mở bán"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="image"
                        label="Link ảnh vật phẩm"
                        rules={[{ type: 'url', message: 'URL không hợp lệ' }]}
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Nhập mô tả' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả công dụng và cách sử dụng vật phẩm" />
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

export default ShopManagement;
