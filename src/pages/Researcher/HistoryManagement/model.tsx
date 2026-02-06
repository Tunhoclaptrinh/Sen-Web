import { useState, useMemo, useEffect, useCallback } from "react";
import { message } from "antd";
import historyService from "@/services/history.service";
import { useCRUD } from "@/hooks/useCRUD";
import { useAuth } from "@/hooks/useAuth";

export const useResearcherHistoryModel = () => {
    const { user } = useAuth();
    
    // Stats State
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // UI State
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);

    // CRUD Setup - FORCE createdBy filter
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        initialFilters: { createdBy: user?.id }, // RESTRICTION
        onError: (action: string, error: any) => {
            console.error(`Error ${action} history:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
        initialSort: { field: 'id', order: 'desc' },
    }), [user?.id]);

    const crud = useCRUD(historyService, crudOptions);

    // Stats Logic - Might need backend filtering by createdBy too if stats are global
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
        if (user?.id) {
            fetchStats();
        }
    }, [user?.id]);

    // const [importLoading, setImportLoading] = useState(false);

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

    const revertToDraft = useCallback(async (id: any) => {
        const result = await historyService.revertReview(id);
        if (result.success) {
            message.success('Đã hoàn về bản nháp');
            crud.refresh();
            fetchStats();
        }
        return result.success;
    }, [crud, fetchStats]);

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
            // Ensure createdBy is set on create (though backend usually does this)
            success = await crud.create({ ...values, createdBy: user?.id });
        }

        if (success) {
            fetchStats();
            closeForm();
        }
        return success;
    };

    const exportData = (params?: any) => historyService.export(params);
    const importData = (file: File) => historyService.import(file);
    const downloadTemplate = () => historyService.downloadTemplate();

    return {
        ...crud,
        stats,
        statsLoading,
        // importLoading,
        currentRecord,
        formVisible,
        detailVisible,
        fetchStats,
        deleteHistory,
        batchDeleteHistories,
        revertToDraft,
        handleSubmit,
        downloadTemplate,
        exportData,
        importData,
        openCreate,
        openEdit,
        openDetail,
        closeForm,
        closeDetail
    };
};
