import React from 'react';
import { Tag } from 'antd';
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
            dataIndex: 'estimatedDuration',
            key: 'estimated_duration',
            width: 150,
            render: (val: number) => `${val} phút`
        },
        {
            title: "Tác giả",
            dataIndex: "authorName",
            key: "author_name",
            width: 120,
            render: (author: string) => <Tag color="orange">{author || 'Hệ thống'}</Tag>
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Bài học ôn"
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
