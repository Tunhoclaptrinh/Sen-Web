import { Button, Space, Modal, Form, Input, Tag, Switch, DatePicker, Tabs } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { PictureOutlined } from '@ant-design/icons';
import { useExhibitionModel } from './model';
import DataTable from '@/components/common/DataTable';
import dayjs from 'dayjs';

const ExhibitionManagement: React.FC = () => {
    const model = useExhibitionModel();

    const columns = [
        {
            title: 'Tên triển lãm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Chủ đề',
            dataIndex: 'theme',
            key: 'theme',
            width: 150,
        },
        {
            title: 'Thời gian',
            key: 'duration',
            width: 250,
            render: (_: any, record: any) => {
                if (record.is_permanent) return <Tag color="blue">VĨNH VIỄN</Tag>;
                return (
                    <span style={{ fontSize: '12px' }}>
                        {dayjs(record.start_date).format('DD/MM/YYYY')} - {dayjs(record.end_date).format('DD/MM/YYYY')}
                    </span>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'is_active',
            width: 120,
            render: (val: boolean) => val ? <Tag color="green">ĐANG MỞ</Tag> : <Tag>ĐÃ ĐÓNG</Tag>
        },
        {
            title: 'Tác giả',
            dataIndex: 'authorName',
            key: 'author_name',
            width: 120,
            render: (author: string) => <Tag color="orange">{author || 'Hệ thống'}</Tag>
        },
    ];

  const { user } = useAuth();
  
  const tabItems = [
    { key: 'all', label: 'Tất cả triển lãm' },
    ...(user?.role === 'researcher' || user?.role === 'admin' ? [
      { key: 'my', label: 'Triển lãm của tôi' },
    ] : []),
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'published', label: 'Đã xuất bản' },
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case 'all':
        model.clearFilters();
        break;
      case 'my':
        model.updateFilters({ created_by: user?.id, status: undefined });
        break;
      case 'pending':
        model.updateFilters({ status: 'pending', created_by: undefined });
        break;
      case 'published':
        model.updateFilters({ status: 'published', created_by: undefined });
        break;
    }
  };

  const getActiveTab = () => {
    if (model.filters.created_by === user?.id) return 'my';
    if (model.filters.status === 'pending') return 'pending';
    if (model.filters.status === 'published') return 'published';
    return 'all';
  };

    return (
        <>
            <DataTable
                title="Quản lý Triển lãm ảo"
                headerContent={
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ background: '#fff', padding: '0 16px', borderRadius: '8px 8px 0 0' }}>
                            <Tabs 
                                activeKey={getActiveTab()} 
                                items={tabItems} 
                                onChange={handleTabChange}
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                    </div>
                }
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
                title={model.currentRecord ? 'Chỉnh sửa triển lãm' : 'Tạo triển lãm mới'}
                open={model.formVisible}
                onCancel={model.closeForm}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={model.currentRecord ? {
                        ...model.currentRecord,
                        dates: [dayjs(model.currentRecord.start_date), dayjs(model.currentRecord.end_date)]
                    } : { is_active: true, is_permanent: false }}
                    onFinish={(values) => {
                        const { dates, ...rest } = values;
                        if (dates && !rest.is_permanent) {
                            rest.start_date = dates[0].format('YYYY-MM-DD');
                            rest.end_date = dates[1].format('YYYY-MM-DD');
                        }
                        model.handleSubmit(rest);
                    }}
                >
                    <Form.Item
                        name="name"
                        label="Tên triển lãm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input prefix={<PictureOutlined />} placeholder="Ví dụ: Triển lãm Gốm Chu Đậu" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="theme"
                            label="Chủ đề"
                        >
                            <Input placeholder="Ví dụ: Gốm sứ, Lịch sử" />
                        </Form.Item>
                        <Form.Item
                            name="curator"
                            label="Người phụ trách"
                        >
                            <Input placeholder="Tên cán bộ phụ trách" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item
                            name="is_permanent"
                            label="Triển lãm vĩnh viễn?"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            name="is_active"
                            label="Công khai"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) => prev.is_permanent !== curr.is_permanent}
                    >
                        {({ getFieldValue }) => !getFieldValue('is_permanent') && (
                            <Form.Item
                                name="dates"
                                label="Thời gian diễn ra"
                                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                            >
                                <DatePicker.RangePicker style={{ width: '100%' }} />
                            </Form.Item>
                        )}
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input.TextArea rows={4} placeholder="Mô tả nội dung triển lãm" />
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

export default ExhibitionManagement;
