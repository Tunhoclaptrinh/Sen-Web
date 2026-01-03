import {
    Tag
} from "antd";
import DataTable from "@/components/common/DataTable";

import LevelForm from "./components/Form";
import { useLevelModel } from "./model";

const LevelManagement = () => {
    const {
        data,
        loading,
        pagination,
        handleTableChange,
        search,
        selectedIds,
        setSelectedIds,
        refresh,
        updateFilters,
        filters,
        clearFilters,
        deleteItem,
        batchDelete,
        handleSubmit,
        // UI State & Handlers
        currentRecord,
        formVisible,
        openCreate,
        openEdit,
        closeForm,
    } = useLevelModel();

    const onFilterChange = (key: string, value: any) => {
        updateFilters({ [key]: value });
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 80,
        },
        {
            title: "Tên Màn chơi",
            dataIndex: "name",
            key: "name",
            width: 250,
            searchable: true,
        },
        {
            title: "Loại",
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (type: string) => <Tag color="blue">{type?.toUpperCase()}</Tag>,
        },
        {
            title: "Độ khó",
            dataIndex: "difficulty",
            key: "difficulty",
            width: 100,
            render: (diff: string) => {
                let color = "green";
                if (diff === "medium") color = "orange";
                if (diff === "hard") color = "red";
                return <Tag color={color}>{diff?.toUpperCase()}</Tag>;
            }
        },
        {
            title: "Chương",
            dataIndex: "chapter_id",
            width: 100,
        },
        {
            title: "Thứ tự",
            dataIndex: "order",
            width: 80,
        },
    ];

    return (
        <>
            <DataTable
                title="Quản lý Màn chơi"
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
                filters={[
                    {
                        key: "type",
                        placeholder: "Loại game",
                        options: [
                            { label: "Story", value: "story" },
                            { label: "Quiz", value: "quiz" },
                            { label: "Hidden Object", value: "hidden_object" },
                            { label: "Timeline", value: "timeline" },
                        ],
                    },
                    {
                        key: "difficulty",
                        placeholder: "Độ khó",
                        options: [
                            { label: "Easy", value: "easy" },
                            { label: "Medium", value: "medium" },
                            { label: "Hard", value: "hard" },
                        ],
                    }
                ]}
                filterValues={filters}
                onFilterChange={onFilterChange}
                onClearFilters={clearFilters}
            />

            <LevelForm
                open={formVisible}
                onCancel={closeForm}
                onSubmit={handleSubmit}
                initialValues={currentRecord}
                loading={loading}
            />
        </>
    );
};

export default LevelManagement;
