import { useMemo, useState } from "react";
import { message } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
import learningService from "@/services/learning.service";

export const useLearningModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<any | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} learning content:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(learningService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: any) => {
        const formValues = { ...record };
        if (formValues.quiz && typeof formValues.quiz === 'object') {
            formValues.quiz = JSON.stringify(formValues.quiz, null, 2);
        }
        setCurrentRecord(formValues);
        setFormVisible(true);
    };

    const closeForm = () => {
        setFormVisible(false);
        setCurrentRecord(null);
    };

    const handleSubmit = async (values: any) => {
        // Transform quiz string to object if needed
        const submissionData = { ...values };
        if (typeof submissionData.quiz === 'string' && submissionData.quiz.trim()) {
            try {
                submissionData.quiz = JSON.parse(submissionData.quiz);
            } catch (e) {
                message.error('Cấu trúc Quiz JSON không hợp lệ');
                return false;
            }
        } else if (!submissionData.quiz) {
            submissionData.quiz = undefined;
        }

        let success = false;
        if (currentRecord) {
            success = await crud.update(currentRecord.id, submissionData);
        } else {
            success = await crud.create(submissionData);
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
        openCreate,
        openEdit,
        closeForm,
        handleSubmit,
    };
};
