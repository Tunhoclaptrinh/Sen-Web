import { useState, useMemo, useEffect } from "react";
import { message } from "antd";
import historyService from "@/services/history.service";
import { useCRUD } from "@/hooks/useCRUD";

export const useHistoryModel = () => {
    // Stats State
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // UI State
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} history:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
        initialSort: { field: 'id', order: 'desc' },
    }), []);

    const crud = useCRUD(historyService, crudOptions);

    // Stats Logic
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const response = await historyService.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch history stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const [importLoading, setImportLoading] = useState(false);

    // Business Logic
    const deleteHistory = async (id: number) => {
        const success = await crud.remove(id);
        if (success) {
            fetchStats();
            if (currentRecord?.id === id) {
                setDetailVisible(false);
                setCurrentRecord(null);
            }
        }
        return success;
    };

    const batchDeleteHistories = async (keys: React.Key[]) => {
        const success = await crud.batchDelete(keys);
        if (success) fetchStats();
        return success;
    };

    const importData = async (file: File) => {
        setImportLoading(true);
        try {
            const response = await historyService.import(file);
            if (response.success) {
                message.success("Import dữ liệu thành công");
                crud.refresh();
                fetchStats();
            } else {
                message.error("Import thất bại: " + response.message);
            }
        } catch (error) {
            message.error("Import thất bại");
        } finally {
            setImportLoading(false);
        }
    };

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: any) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const openDetail = (record: any) => {
        setCurrentRecord(record);
        setDetailVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setCurrentRecord(null);
    };

    const closeDetail = () => {
        setDetailVisible(false);
        setCurrentRecord(null);
    };

    const handleSubmit = async (values: any) => {
        let success = false;
        if (currentRecord) {
            success = await crud.update(currentRecord.id, values);
        } else {
            success = await crud.create(values);
        }

        if (success) {
            fetchStats();
            closeForm();
        }
        return success;
    };

    const downloadTemplate = async () => {
        try {
            const blob = await historyService.downloadTemplate();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "history_import_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success("Tải mẫu thành công");
        } catch (error) {
            message.error("Tải mẫu thất bại");
        }
    };

    return {
        ...crud,
        stats,
        statsLoading,
        importLoading,
        currentRecord,
        formVisible,
        detailVisible,
        fetchStats,
        deleteHistory,
        batchDeleteHistories,
        importData,
        downloadTemplate,
        handleSubmit,
        openCreate,
        openEdit,
        openDetail,
        closeForm,
        closeDetail
    };
};
