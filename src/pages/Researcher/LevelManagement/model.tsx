import { useState, useMemo } from "react";
import { message, Modal } from "antd";
import { Level } from "@/types";
import adminLevelService from "@/services/admin-level.service";
import { useCRUD } from "@/hooks/useCRUD";
import { useAuth } from "@/hooks/useAuth";

// Default screens for new level
const getDefaultScreens = () => {
    return [
        {
            id: 'intro',
            type: 'DIALOGUE',
            content: [
                { speaker: 'AI', text: 'Chào mừng bạn đến với màn chơi mới!' }
            ],
            is_first: true,
            is_last: true
        }
    ];
};

export const useLevelModel = (initialFilters?: Record<string, any>) => {
    const { user } = useAuth(); // Get current user

    // UI State
    const [currentRecord, setCurrentRecord] = useState<Level | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        initialFilters: {
            ...initialFilters,
            createdBy: user?.id, // FORCE FILTER BY CURRENT USER
        },
        defaultSort: initialFilters?.chapterId ? 'order' : undefined,
        defaultOrder: initialFilters?.chapterId ? 'ascend' : undefined,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} level:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), [JSON.stringify(initialFilters), user?.id]);

    const crud = useCRUD(adminLevelService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        const defaults: any = initialFilters ? { ...initialFilters } : {};
        if (defaults.id) delete defaults.id;

        if (defaults.chapterId && crud.data) {
             const existingInChapter = crud.data.filter((l: Level) => l.chapterId === defaults.chapterId);
             const sortedLevels = [...existingInChapter].sort((a, b) => (b.order || 0) - (a.order || 0));
             const lastLevel = sortedLevels[0];
             
             const maxOrder = lastLevel ? (lastLevel.order || 0) : 0;
             defaults.order = maxOrder + 1;
             
             if (lastLevel) {
                 defaults.requiredLevel = lastLevel.id;
             }
        } else {
             defaults.order = (crud.data?.length || 0) + 1;
        }

        setCurrentRecord(defaults);
        setFormVisible(true);
    };

    const openEdit = (record: Level) => {
        setCurrentRecord({ ...record }); 
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setCurrentRecord(null);
    };

    const handleSubmit = async (values: any) => {
        let success = false;
        const recordId = (currentRecord as any)?.id;
        
        if (recordId) {
            success = await crud.update(recordId, values);
        } else {
            const { id: _, ...createData } = values; 
            const defaultScreens = getDefaultScreens();
            const createValues = {
                ...createData,
                screens: defaultScreens,
                createdBy: user?.id // Ensure ownership
            };
            success = await crud.create(createValues);
        }

        if (success) {
             closeForm();
        }
        return success;
    };

    // Screen Management State
    const [isScreenMode, setIsScreenMode] = useState(false);
    const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

    const enterScreenMode = (level: Level) => {
        setCurrentLevel(level);
        setIsScreenMode(true);
    };

    const exitScreenMode = () => {
        setIsScreenMode(false);
        setCurrentLevel(null);
    };

    const reorderLevels = async (newOrderIds: number[]) => {
        if (!initialFilters?.chapterId) {
            message.error("Không xác định được chương để sắp xếp");
            return;
        }

        try {
            await adminLevelService.reorder(initialFilters.chapterId, newOrderIds);
            message.success("Cập nhật thứ tự thành công");
            crud.refresh(); 
        } catch (error: any) {
            console.error("Reorder error:", error);
            message.error("Lỗi khi sắp xếp: " + (error.message || "Unknown error"));
            throw error;
        }
    };

    return {
        ...crud,
        currentRecord,
        formVisible,
        handleSubmit,
        deleteItem: crud.remove,
        batchDelete: crud.batchDelete,
        openCreate,
        openEdit,
        closeForm,
        // Screen Mode
        isScreenMode,
        currentLevel,
        enterScreenMode,
        exitScreenMode,
        // Reorder
        reorderLevels,
    };
};
