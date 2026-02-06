import { Button, Space, Modal, Form, Input, Tag, Switch, DatePicker, Tabs, Transfer, Tooltip, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PictureOutlined, SendOutlined, UndoOutlined, EditOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useExhibitionModel } from './model';
import DataTable from '@/components/common/DataTable';
import ExhibitionStats from '@/pages/Admin/ExhibitionManagement/components/Stats';
import ExhibitionDetailModal from '@/pages/Admin/ExhibitionManagement/components/DetailModal';
import { getImageUrl } from '@/utils/image.helper';
import dayjs from 'dayjs';

const ResearcherExhibitionManagement: React.FC = () => {
    const {
        data,
        loading,
        pagination,
        handleTableChange,
        search,
        updateFilters,
        filters,
        stats,
        statsLoading,
        openCreate,
        openEdit,
        openDetail,
        closeForm,
        closeDetail,
        formVisible,
        detailVisible,
        currentRecord,
        handleSubmit,
        remove,
        submitReview,
        revertToDraft,
        availableArtifacts,
        exportData,
        importData,
        downloadTemplate,
    } = useExhibitionModel();
    const { user } = useAuth();
    const navigate = useNavigate();

    const columns = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
        align: "center" as const,
    },
    {
        title: 'Hình ảnh',
        dataIndex: 'image',
        key: 'image',
        width: 100,
        align: 'center' as const,
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
        title: 'Tên triển lãm',
        dataIndex: 'name',
        key: 'name',
        align: 'left' as const,
        searchable: true,
    },
    {
        title: 'Tác giả',
        dataIndex: 'authorName',
        key: 'authorName',
        width: 150,
        render: (authorName: string, record: any) => (
            <Tag color="blue">{authorName || record.author || 'Tôi'}</Tag>
        )
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
        title: 'Trạng thái duyệt',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => {
            const colors: any = {
                draft: 'default',
                pending: 'orange',
                published: 'green',
                rejected: 'red'
            };
            const labels: any = {
                draft: 'Nháp',
                pending: 'Chờ duyệt',
                published: 'Đã xuất bản',
                rejected: 'Từ chối'
            };
            return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>;
        }
    },
    {
        title: "Thao tác",
        key: "actions",
        width: 180,
        align: "center" as const,
        render: (_: any, record: any) => {
            const canSubmit = record.status === 'draft' || record.status === 'rejected' || !record.status;
            const canRevert = record.status === 'pending';
            return (
                <Space size={4}>
                     {canSubmit && (
                        <Tooltip title="Gửi duyệt">
                          <Button 
                            icon={<SendOutlined />} 
                            size="small" 
                            type="text" 
                            style={{ color: "var(--primary-color)" }}
                            onClick={() => submitReview(record.id)}
                          />
                        </Tooltip>
                    )}
                    {canRevert && (
                        <Tooltip title="Hoàn về bản nháp">
                            <Popconfirm
                                title="Hủy gửi duyệt?"
                                description="Bạn có muốn rút lại yêu cầu và hoàn về nháp?"
                                onConfirm={() => revertToDraft?.(record.id)}
                            >
                                <Button 
                                    icon={<UndoOutlined />} 
                                    size="small" 
                                    type="text" 
                                    style={{ color: "#faad14" }}
                                />
                            </Popconfirm>
                        </Tooltip>
                    )}
                    <Tooltip title="Chỉnh sửa">
                      <Button 
                        icon={<EditOutlined />} 
                        size="small" 
                        type="text" 
                        style={{ color: "var(--primary-color)" }}
                        onClick={() => openEdit(record)}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Popconfirm
                            title="Bạn có chắc muốn xóa?"
                            onConfirm={() => remove(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                          <Button 
                            icon={<DeleteOutlined />} 
                            size="small" 
                            type="text" 
                            danger 
                          />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            );
        }
    }
    ];

    const tabItems = [
        { key: 'my', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'published', label: 'Đã xuất bản' },
        { key: 'rejected', label: 'Bị từ chối' },
    ];

    const handleTabChange = (key: string) => {
        switch (key) {
            case 'my':
                updateFilters({ createdBy: user?.id, status: undefined });
                break;
            default:
                updateFilters({ status: key, createdBy: user?.id });
                break;
        }
    };

    const getActiveTab = () => {
        const status = filters.status;
        if (!status || (Array.isArray(status) && status.length === 0)) return 'my';
        if (Array.isArray(status)) return status[0];
        return status;
    };

    return (
        <>
            <DataTable
                title="Quản lý Triển lãm ảo (Cá nhân)"
                headerContent={
                        <div style={{ background: '#fff', padding: '16px', borderRadius: '8px' }}>
                            <ExhibitionStats stats={stats} loading={statsLoading}  />
                            <Tabs 
                                activeKey={getActiveTab()} 
                                items={tabItems} 
                                onChange={handleTabChange}
                                style={{ marginBottom: 0 }}
                                size="small"
                            />
                        </div>
                }
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                onChange={handleTableChange}
                searchable
                onSearch={search}
                onAdd={openCreate}
                onEdit={openEdit}
                onView={openDetail}
                onDelete={remove}
                batchOperations={true}
                batchActions={[
                    {
                        key: 'export',
                        label: 'Export đã chọn',
                        icon: <DownloadOutlined />,
                        onClick: (ids: any[]) => exportData({ format: 'xlsx', filters: { id: ids } }),
                    }
                ]}
                permissionResource="exhibitions"
                importable={true}
                importLoading={loading}
                exportable={true}
                exportLoading={loading}
                onImport={importData}
                onDownloadTemplate={downloadTemplate}
                onExport={exportData}
            />

            <Modal
                title={currentRecord ? 'Chỉnh sửa triển lãm' : 'Tạo triển lãm mới'}
                open={formVisible}
                onCancel={closeForm}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={currentRecord ? {
                        ...currentRecord,
                        dates: [dayjs(currentRecord.startDate), dayjs(currentRecord.endDate)]
                    } : { isActive: true, isPermanent: false }}
                    onFinish={(values) => {
                        const { dates, ...rest } = values;
                        if (dates && !rest.isPermanent) {
                            rest.startDate = dates[0].format('YYYY-MM-DD');
                            rest.endDate = dates[1].format('YYYY-MM-DD');
                        }
                        handleSubmit(rest);
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
                            dataSource={availableArtifacts as any[]}
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
                            <Button onClick={closeForm}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                {currentRecord ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <ExhibitionDetailModal
                exhibition={currentRecord}
                visible={detailVisible}
                onClose={closeDetail}
                onViewFull={(id: any) => navigate(`/researcher/exhibitions/${id}`)}
            />
        </>
    );
};

export default ResearcherExhibitionManagement;
