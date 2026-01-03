import { useState, useMemo, useEffect } from "react";
import { message } from "antd";
import reviewService from "@/services/review.service";
import { useCRUD } from "@/hooks/useCRUD";

export const useReviewModel = () => {
    // Stats State
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // UI State
    const [currentRecord, setCurrentRecord] = useState<any>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} review:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(reviewService, crudOptions);

    // Stats Logic
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const response = await reviewService.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch review stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // UI Handlers
    const openDetail = (record: any) => {
        setCurrentRecord(record);
        setDetailVisible(true);
    };

    const closeDetail = () => {
        setDetailVisible(false);
        setCurrentRecord(null);
    };

    return {
        ...crud,
        stats,
        statsLoading,
        currentRecord,
        detailVisible,
        fetchStats,
        deleteItem: crud.remove,
        batchDelete: crud.batchDelete,
        openDetail,
        closeDetail
    };
};
