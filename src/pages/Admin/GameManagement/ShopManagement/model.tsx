import { useMemo, useState } from "react";
import { message } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
import shopService from "@/services/shop.service";

export const useShopModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);
    const [viewRecord, setViewRecord] = useState<any | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} shop item:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(shopService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: any) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setCurrentRecord(null);
    };

    const openDetail = (record: any) => {
        setViewRecord(record);
        setDetailVisible(true);
    };

    const closeDetail = () => {
        setDetailVisible(false);
        setViewRecord(null);
    };

    const handleSubmit = async (values: any) => {
        let success = false;
        
        const submitValues = { ...values };


        if (currentRecord) {
            success = await crud.update(currentRecord.id, submitValues);
        } else {
            success = await crud.create(submitValues);
        }

        if (success) {
            closeForm();
        }
        return success;
    };

    return {
        ...crud,
        currentRecord,
        viewRecord,
        formVisible,
        detailVisible,
        openCreate,
        openEdit,
        closeForm,
        openDetail,
        closeDetail,
        handleSubmit,
    };
};
