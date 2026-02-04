import { Button, Space, Modal, Form, Input, Tag, Switch, DatePicker, Tabs, Transfer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PictureOutlined } from '@ant-design/icons';
import { useExhibitionModel } from './model';
import ExhibitionStats from './components/Stats';
import ExhibitionDetailModal from './components/DetailModal';
import DataTable from '@/components/common/DataTable';
import { getImageUrl } from '@/utils/image.helper';
import dayjs from 'dayjs';

const ExhibitionManagement: React.FC = () => {
    const model = useExhibitionModel();
    const navigate = useNavigate();

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            align: 'center',
            render: (url: string) => {
                 const src = url && (url.startsWith('http') || url.startsWith('blob')) 
                    ? url 
                    : getImageUrl(url);
                return (
                    <div style={{ margin: '0 auto', width: 80, height: 50, borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            src={src || '/placeholder-image.png'} 
                            alt="exhibition" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e: any) => { 
                                if (!e.target.dataset.fallback) {
                                    e.target.dataset.fallback = 'true';
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span style="color:#999;font-size:10px">No Img</span>';
                                }
                            }}
                        />
                    </div>
                );
            }
        },
        {
            title: 'Trạng thái duyệt',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                let color = 'default';
                let text = 'Nháp';
                if (status === 'published') { color = 'green'; text = 'Đã xuất bản'; }
                if (status === 'pending') { color = 'orange'; text = 'Chờ duyệt'; }
                if (status === 'rejected') { color = 'red'; text = 'Từ chối'; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
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
                if (record.isPermanent) return <Tag color="blue">VĨNH VIỄN</Tag>;
                return (
                    <span style={{ fontSize: '12px' }}>
                        {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
                    </span>
                );
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 120,
            render: (val: boolean) => val ? <Tag color="green">ĐANG MỞ</Tag> : <Tag>ĐÃ ĐÓNG</Tag>
        },
        {
            title: 'Tác giả',
            dataIndex: 'authorName',
            key: 'authorName',
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
        model.updateFilters({ createdBy: user?.id, status: undefined });
        break;
      case 'pending':
        model.updateFilters({ status: 'pending', createdBy: undefined });
        break;
      case 'published':
        model.updateFilters({ status: 'published', createdBy: undefined });
        break;
    }
  };

  const getActiveTab = () => {
    if (model.filters.createdBy === user?.id) return 'my';
    if (model.filters.status === 'pending') return 'pending';
    if (model.filters.status === 'published') return 'published';
    return 'all';
  };

    return (
        <>
            <ExhibitionStats stats={model.stats} loading={model.statsLoading} />
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
                onView={model.openDetail}
                onDelete={model.remove}
                onSubmitReview={model.submitReview ? (record) => model.submitReview?.(record.id) : undefined}
                onApprove={model.approveReview ? (record) => model.approveReview?.(record.id) : undefined}
                onReject={model.handleReject}
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
                        dates: [dayjs(model.currentRecord.startDate), dayjs(model.currentRecord.endDate)]
                    } : { isActive: true, isPermanent: false }}
                    onFinish={(values) => {
                        const { dates, ...rest } = values;
                        if (dates && !rest.isPermanent) {
                            rest.startDate = dates[0].format('YYYY-MM-DD');
                            rest.endDate = dates[1].format('YYYY-MM-DD');
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
                            name="isPermanent"
                            label="Triển lãm vĩnh viễn?"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            name="isActive"
                            label="Công khai"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) => prev.isPermanent !== curr.isPermanent}
                    >
                        {({ getFieldValue }) => !getFieldValue('isPermanent') && (
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

                    <Form.Item
                        name="artifactIds"
                        label="Chọn hiện vật trưng bày"
                    >
                        <Transfer
                            dataSource={model.availableArtifacts as any[]}
                            showSearch
                            listStyle={{
                                width: '100%',
                                height: 300,
                            }}
                            titles={['Hiện vật kho', 'Đã chọn']}
                            render={(item) => item.name}
                            rowKey={(item) => item.id}
                            filterOption={(inputValue, item) => 
                                item.name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
                            }
                        />
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

            {/* Detail Modal */}
            <ExhibitionDetailModal
                exhibition={model.currentRecord}
                visible={model.detailVisible}
                onClose={model.closeDetail}
                onViewFull={(id) => navigate(`/admin/exhibitions/${id}`)}
            />
        </>
    );
};

export default ExhibitionManagement;
