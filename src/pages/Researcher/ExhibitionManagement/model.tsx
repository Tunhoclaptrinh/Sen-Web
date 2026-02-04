import { useMemo, useState, useEffect } from "react";
import { message } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
import { useAuth } from "@/hooks/useAuth";
import exhibitionService, { Exhibition } from "@/services/exhibition.service";

export const useExhibitionModel = () => {
    const { user } = useAuth();

    // Stats State
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // UI State
    const [currentRecord, setCurrentRecord] = useState<Exhibition | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);

    // CRUD Setup - Default to researcher's own content
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        initialFilters: { createdBy: user?.id },
        onError: (action: string, error: any) => {
            console.error(`Error ${action} exhibition:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), [user?.id]);

    const crud = useCRUD(exhibitionService, crudOptions);

    // Stats Logic
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const response = await (exhibitionService as any).getStats?.();
            if (response?.success && response?.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch exhibition stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: Exhibition) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const openDetail = (record: Exhibition) => {
        setCurrentRecord(record);
        setDetailVisible(true);
    };

    const closeDetail = () => {
        setDetailVisible(false);
        setCurrentRecord(null);
    };

    const closeForm = () => {
        setFormVisible(false);
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

    // Override crud actions to refresh stats
    const remove = async (id: any) => {
        const success = await crud.remove(id);
        if (success) fetchStats();
        return success;
    };

    const submitReview = async (id: any) => {
        const success = await crud.submitReview?.(id);
        if (success) fetchStats();
        return success;
    };

    return {
        ...crud,
        stats,
        statsLoading,
        currentRecord,
        formVisible,
        detailVisible,
        openCreate,
        openEdit,
        openDetail,
        closeDetail,
        closeForm,
        handleSubmit,
        remove,
        submitReview,
    };
};
