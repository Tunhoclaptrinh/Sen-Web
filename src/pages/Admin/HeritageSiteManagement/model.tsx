import { useState, useMemo, useEffect } from "react";
import { message, Modal, Input } from "antd";
import { HeritageSite } from "@/types";
import heritageService from "@/services/heritage.service";
import { useCRUD } from "@/hooks/useCRUD";

export const useHeritageModel = (initialFilters: any = {}) => {
    // Stats State
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // UI State
    const [currentRecord, setCurrentRecord] = useState<HeritageSite | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        initialFilters,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} heritage site:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), [initialFilters]);

    const crud = useCRUD(heritageService, crudOptions);

    // Stats Logic
    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const response = await heritageService.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch heritage stats", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const [importLoading, setImportLoading] = useState(false);

    // Business Logic
    const deleteHeritage = async (id: number) => {
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

    const batchDeleteHeritages = async (keys: React.Key[]) => {
        const success = await crud.batchDelete(keys);
        if (success) fetchStats();
        return success;
    };

    const importData = async (file: File) => {
        setImportLoading(true);
        try {
            const response = await heritageService.import(file);
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

    const openEdit = (record: HeritageSite) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const openDetail = (record: HeritageSite) => {
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
            const blob = await heritageService.downloadTemplate();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "heritage_import_template.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success("Tải mẫu thành công");
        } catch (error) {
            message.error("Tải mẫu thất bại");
        }
    };

    const handleReject = async (record: HeritageSite) => {
        Modal.confirm({
            title: 'Từ chối phê duyệt',
            content: (
                <div style={{ marginTop: 16 }}>
                    <p>Lý do từ chối:</p>
                    <Input.TextArea 
                        rows={4} 
                        placeholder="Nhập lý do từ chối nội dung này..." 
                        id="reject-comment"
                    />
                </div>
            ),
            onOk: async () => {
                const comment = (document.getElementById('reject-comment') as HTMLTextAreaElement)?.value;
                if (!comment) {
                    message.error('Vui lòng nhập lý do từ chối');
                    return Promise.reject();
                }
                return crud.rejectReview?.(record.id, comment);
            }
        });
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
        deleteHeritage,
        batchDeleteHeritages,
        importData,
        downloadTemplate,
        handleSubmit,
        handleReject,
        openCreate,
        openEdit,
        openDetail,
        closeForm,
        closeDetail
    };
};
