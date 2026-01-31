import { Tag, Tabs } from 'antd';

import { useLearningModel } from './model';
import DataTable from '@/components/common/DataTable';
import LearningForm from './components/Form';

const LearningManagement: React.FC = () => {
    const model = useLearningModel();

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
            title: 'Thời gian (phút)',
            dataIndex: 'estimated_duration',
            key: 'estimated_duration',
            width: 150,
            render: (val: number) => `${val} phút`
        },
        {
            title: "Tác giả",
            dataIndex: "author_name",
            key: "author_name",
            width: 120,
            render: (author: string) => <Tag color="orange">{author || 'Hệ thống'}</Tag>
        },
    ];


    
    const tabItems = [
        { key: 'all', label: 'Tất cả bài học' },
        { key: 'pending', label: 'Chờ duyệt' },
        { key: 'published', label: 'Đã xuất bản' },
    ];

    const handleTabChange = (key: string) => {
        switch (key) {
            case 'all':
                model.clearFilters();
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
