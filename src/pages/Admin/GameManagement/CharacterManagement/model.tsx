import { useMemo, useState } from "react";
import { message } from "antd";
import { useCRUD } from "@/hooks/useCRUD";
import adminCharacterService, { GameCharacter } from "@/services/admin-character.service";

export const useCharacterModel = () => {
    // UI State
    const [currentRecord, setCurrentRecord] = useState<GameCharacter | null>(null);
    const [formVisible, setFormVisible] = useState(false);

    // CRUD Setup
    const crudOptions = useMemo(() => ({
        pageSize: 10,
        autoFetch: true,
        onError: (action: string, error: any) => {
            console.error(`Error ${action} character:`, error);
            message.error(`Thao tác thất bại: ${error.message}`);
        },
    }), []);

    const crud = useCRUD(adminCharacterService, crudOptions);

    // UI Handlers
    const openCreate = () => {
        setCurrentRecord(null);
        setFormVisible(true);
    };

    const openEdit = (record: GameCharacter) => {
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
        openCreate,
        openEdit,
        closeForm,
        handleSubmit,
    };
};
