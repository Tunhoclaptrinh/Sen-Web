import { useState, useMemo, useEffect } from "react";
import { message } from "antd";
import { Level } from "@/types";
import adminLevelService from "@/services/admin-level.service";
import { useCRUD } from "@/hooks/useCRUD";

export const useLevelModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<Level | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} level:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(adminLevelService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: Level) => {
        setCurrentRecord(record);
        setFormVisible(true);
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
            closeForm();
        }
        return success;
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
    };
};
