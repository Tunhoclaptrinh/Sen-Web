import { Tag, Tabs } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/utils/image.helper';

import { useLearningModel } from './model';
import DataTable from '@/components/common/DataTable';
import LearningForm from './components/Form';

const LearningManagement: React.FC = () => {
    const model = useLearningModel();
    const { user } = useAuth();

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 80,
            align: 'center',
            render: (url: string) => {
                // Determine if it's a raw URL or relative path and resolve it
                const src = url && (url.startsWith('http') || url.startsWith('blob')) 
                    ? url 
                    : getImageUrl(url);
                    
                return (
                    <div style={{ margin: '0 auto', width: 80, height: 50, borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                            src={src} 
                            alt="thumbnail" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/80x50?text=No+Img'; }}
                        />
                    </div>
                );
            }
        },
        {
            title: 'Tiêu đề bài học',
            dataIndex: 'title',
            key: 'title',
            align: 'left' ,
            searchable: true,
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
                return <Tag color={colors[difficulty]}>{difficulty?.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'estimatedDuration',
            key: 'estimatedDuration',
            width: 150,
            render: (val: number) => `${val} phút`
        },
        {
            title: "Tác giả",
            dataIndex: "authorName",
            key: "authorName",
            width: 120,
            render: (author: string) => <Tag color="orange">{author || 'Hệ thống'}</Tag>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status: string) => {
                const colors: any = { published: 'green', pending: 'orange', draft: 'default', rejected: 'red' };
                const labels: any = { published: 'Đã xuất bản', pending: 'Chờ duyệt', draft: 'Nháp', rejected: 'Từ chối' };
                return <Tag color={colors[status] || 'default'}>{labels[status] || status}</Tag>
            }
        },
    ];


    
    const tabItems = [
        { key: 'all', label: 'Tất cả bài học' },
        ...(user?.role === 'researcher' || user?.role === 'admin' ? [
            { key: 'my', label: 'Bài học của tôi' },
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
            <DataTable
                title="Quản lý Bài học ôn"
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
                permissionResource="learning_modules"
                columns={columns}
                dataSource={model.data}
                pagination={model.pagination}
                onChange={model.handleTableChange}
                searchable
                onSearch={model.search}
                onAdd={model.openCreate}
                onEdit={model.openEdit}
                onDelete={model.remove}
                onSubmitReview={model.submitReview ? (record) => model.submitReview?.(record.id) : undefined}
                onApprove={model.approveReview ? (record) => model.approveReview?.(record.id) : undefined}
                onReject={model.handleReject}
            />

            <LearningForm
                visible={model.formVisible}
                onCancel={model.closeForm}
                onSubmit={model.handleSubmit}
                initialValues={model.currentRecord}
                loading={model.loading}
                isEdit={!!model.currentRecord}
            />
        </>
    );
};

export default LearningManagement;
