import React from 'react';
import { Tag, Tabs } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import DataTable from '@/components/common/DataTable';
import { useLearningModel } from '@/pages/Admin/LearningManagement/model'; // Reuse model
import LearningForm from '@/pages/Admin/LearningManagement/components/Form'; // Reuse form

const ResearcherLearningManagement: React.FC = () => {
    const model = useLearningModel();
    const { user } = useAuth();
    
    // Set default filter to 'my' on mount if not already set by Tabs
    // Actually, Tabs default active key handling or useEffect might be better.
    // However, since Backend ENFORCES ownership, 'all' basically means 'all my items'.
    // So distinct tabs for Researcher might be: 'All My Items', 'Draft', 'Pending', 'Published'

    const columns = [
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
             title: 'Trạng thái',
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
                 return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
             }
         },
        {
            title: 'Thời gian (phút)',
            dataIndex: 'estimated_duration',
            key: 'estimated_duration',
            width: 150,
            render: (val: number) => `${val} phút`
        },
        // Researcher doesn't need to see 'Author' if it's always them.
    ];

    const tabItems = [
        { key: 'all', label: 'Tất cả bài của tôi' },
        { key: 'draft', label: 'Bản nháp' },
        { key: 'pending', label: 'Đang chờ duyệt' },
        { key: 'published', label: 'Đã xuất bản' },
        { key: 'rejected', label: 'Bị từ chối' },
    ];

    const handleTabChange = (key: string) => {
        // Backend enforces created_by = user.id, so we just filter by status
        if (key === 'all') {
            model.updateFilters({ status: undefined });
        } else {
            model.updateFilters({ status: key });
        }
    };

    const getActiveTab = () => {
        if (!model.filters.status) return 'all';
        return model.filters.status;
    };

    return (
        <>
            <DataTable
                title="Quản lý Bài học ôn tập (Cá nhân)"
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
                permissionResource="learning_modules" // Check permissions
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

export default ResearcherLearningManagement;
