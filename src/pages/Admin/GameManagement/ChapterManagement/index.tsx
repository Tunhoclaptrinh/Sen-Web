import { Space } from "antd";
import DataTable from "@/components/common/DataTable";

import ChapterForm from "./components/Form";
import { useChapterModel } from "./model";

const ChapterManagement = () => {
    const {
        data,
        loading,
        pagination,
        handleTableChange,
        search,
        selectedIds,
        setSelectedIds,
        refresh,
        deleteItem,
        batchDelete,
        handleSubmit,
        // UI State & Handlers
        currentRecord,
        formVisible,
        openCreate,
        openEdit,
        closeForm,
    } = useChapterModel();

    const columns = [
        {
            title: "Thứ tự",
            dataIndex: "order",
            key: "order",
            width: 80,
            sorter: true,
        },
        {
            title: "Tên Chương",
            dataIndex: "name",
            key: "name",
            width: 250,
            searchable: true,
        },
        {
            title: "Chủ đề",
            dataIndex: "theme",
            key: "theme",
            width: 150,
        },
        {
            title: "Màu sắc",
            dataIndex: "color",
            key: "color",
            width: 100,
            render: (color: string) => (
                <Space>
                    <div style={{ width: 20, height: 20, backgroundColor: color, border: '1px solid #ddd' }} />
                    {color}
                </Space>
            )
        },
        {
            title: "Yêu cầu",
            dataIndex: "required_petals",
            width: 100,
            render: (val: number) => `${val} cánh hoa`,
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Chương Game"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                onChange={handleTableChange}
                searchable
                onSearch={search}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={deleteItem}
                rowSelection={{
                    selectedRowKeys: selectedIds,
                    onChange: setSelectedIds,
                }}
                onBatchDelete={batchDelete}
                batchOperations={true}
                onRefresh={refresh}
            />

            <ChapterForm
                open={formVisible}
                onCancel={closeForm}
                onSubmit={handleSubmit}
                initialValues={currentRecord}
                loading={loading}
            />
        </>
    );
};

export default ChapterManagement;
