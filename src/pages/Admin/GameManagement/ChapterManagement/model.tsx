import { useState, useMemo } from "react";
import { message } from "antd";
import { Chapter } from "@/types";
import adminChapterService from "@/services/admin-chapter.service";
import { useCRUD } from "@/hooks/useCRUD";

export const useChapterModel = () => {
  // UI State
  const [currentRecord, setCurrentRecord] = useState<Chapter | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} chapter:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [],
  );

  const crud = useCRUD(adminChapterService, crudOptions);

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: Chapter) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  const openDetail = (record: Chapter) => {
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
      // Update existing chapter
      success = await crud.update(currentRecord.id, values);
    } else {
      // Create new chapter - auto set order
      const maxOrder = crud.data.length > 0 
        ? Math.max(...crud.data.map((item: any) => item.order || 0))
        : 0;
      const newValues = { ...values, order: maxOrder + 1 };
      success = await crud.create(newValues);
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
    detailVisible,
    handleSubmit,
    deleteItem: crud.remove,
    batchDelete: crud.batchDelete,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  };
};
