import { useMemo, useState } from "react";
import { message, Modal, Input } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
import exhibitionService from "@/services/exhibition.service";

export const useExhibitionModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} exhibition:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(exhibitionService, crudOptions);

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

    const handleReject = async (record: any) => {
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
        currentRecord,
        formVisible,
        openCreate,
        openEdit,
        closeForm,
        handleSubmit,
        handleReject,
    };
};
