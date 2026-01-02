import { useState, useMemo } from "react";
import { Tag } from "antd";
import DataTable from "@/components/common/DataTable";
import { useCRUD } from "@/hooks/useCRUD";
import heritageService from "@/services/heritage.service";
import { HeritageSite, HeritageType } from "@/types/heritage.types";
import { toast } from "@/components/common";
import HeritageStats from "./HeritageStats";
import HeritageForm from "./HeritageForm";
import HeritageDetailModal from "./HeritageDetailModal";

const HeritageSiteManagement = () => {
    // 1. State for Modals
    const [formOpen, setFormOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<HeritageSite | null>(null);

    // 2. CRUD Hook
    const {
        data,
        loading,
        pagination,
        filters: filterValues,
        fetchAll: fetchData,
        handleTableChange,
        updateFilters,
        searchTerm,
        search,
        remove: handleDelete,
        batchDelete: handleBatchDelete,
        importData,
        exportData,
    } = useCRUD({
        service: heritageService,
        autoFetch: true,
        resourceName: "di sản",
    });

    // 3. Handlers
    const handleAdd = () => {
        setSelectedRecord(null);
        setFormOpen(true);
    };

    const handleEdit = (record: HeritageSite) => {
        setSelectedRecord(record);
        setFormOpen(true);
    };

    const handleView = (record: HeritageSite) => {
        setSelectedRecord(record);
        setDetailOpen(true);
    };

    const handleFormSuccess = () => {
        setFormOpen(false);
        fetchData();
        toast.success("Thao tác thành công");
    };

    // 4. Configuration
    const tableFilters = useMemo(() => [
        {
            key: "type",
            placeholder: "Loại hình",
            options: Object.values(HeritageType).map((type) => ({
                label: type,
                value: type,
            })),
        },
        {
            key: "region",
            placeholder: "Khu vực",
            options: [
                { label: "Miền Bắc", value: "Bắc" },
                { label: "Miền Trung", value: "Trung" },
                { label: "Miền Nam", value: "Nam" },
            ],
        },
        {
            key: "unesco_listed",
            placeholder: "UNESCO",
            options: [
                { label: "Có", value: true },
                { label: "Không", value: false },
            ],
        },
    ], []);

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: 80,
            sortable: true,
        },
        {
            title: "Tên Di Sản",
            dataIndex: "name",
            key: "name_like",
            searchable: true,
            render: (text: string) => (
                <span style={{ fontWeight: 500 }}>{text}</span>
            ),
        },
        {
            title: "Loại hình",
            dataIndex: "type",
            width: 150,
            render: (type: HeritageType) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: "Khu vực",
            dataIndex: "region",
            width: 150,
        },
        {
            title: "UNESCO",
            dataIndex: "unesco_listed",
            width: 100,
            render: (isListed: boolean) => (
                isListed ? <Tag color="green">UNESCO</Tag> : <Tag color="default">-</Tag>
            ),
        },
        {
            title: "Đánh giá",
            dataIndex: "rating",
            width: 100,
            align: "center",
            render: (rating: number) => rating ? rating.toFixed(1) : "-",
        },
    ];

    // 5. Render
    return (
        <div className="p-6">
            <DataTable
                title="Quản Lý Di Sản Văn Hóa"
                headerContent={<HeritageStats />}
                data={data}
                loading={loading}
                columns={columns}
                pagination={pagination}
                onPaginationChange={handleTableChange}

                // Search & Filter
                onSearch={search}
                searchValue={searchTerm}
                hideGlobalSearch={true}
                filters={tableFilters}
                filterValues={filterValues}
                onFilterChange={updateFilters}
                onRefresh={fetchData}

                // Actions
                onAdd={handleAdd}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBatchDelete={handleBatchDelete}
                batchOperations={true}
                showActions={true}
                rowKey="id"

                // Import / Export
                importable={true}
                exportable={true}
                onImport={importData}
                onExport={() => exportData('xlsx')}
            />

            {formOpen && (
                <HeritageForm
                    open={formOpen}
                    onCancel={() => setFormOpen(false)}
                    onSuccess={handleFormSuccess}
                    initialValues={selectedRecord}
                    title={selectedRecord ? "Cập nhật di sản" : "Thêm mới di sản"}
                />
            )}

            {detailOpen && (
                <HeritageDetailModal
                    open={detailOpen}
                    onCancel={() => setDetailOpen(false)}
                    record={selectedRecord}
                />
            )}
        </div>
    );
};

export default HeritageSiteManagement;
