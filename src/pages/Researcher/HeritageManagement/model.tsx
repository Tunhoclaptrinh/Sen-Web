import {useMemo, useState} from "react";
import {message} from "antd";
import {useCRUD} from "@/hooks/useCRUD";
import {useAuth} from "@/hooks/useAuth";
import heritageService from "@/services/heritage.service";
import {HeritageSite} from "@/types";

export const useResearcherHeritageModel = () => {
  const {user} = useAuth();

  // UI State
  const [currentRecord, setCurrentRecord] = useState<HeritageSite | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);

  // CRUD Setup - Scoped to User
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      initialFilters: {createdBy: user?.id}, // FORCE FILTER
      onError: (action: string, error: any) => {
        console.error(`Error ${action} heritage:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [user?.id],
  );

  const crud = useCRUD(heritageService, crudOptions);

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

    // Ensure image is string
    const submitData = {
      ...values,
      image:
        Array.isArray(values.image) && values.image.length > 0
          ? values.image[0].url || values.image[0].response?.url || values.image[0]
          : typeof values.image === "string"
            ? values.image
            : "",
      gallery: values.gallery || [],
      // Auto set createdBy if new
      createdBy: user?.id,
    };

    if (currentRecord) {
      success = await crud.update(currentRecord.id, submitData);
    } else {
      // Researcher creating -> Status Draft
      success = await crud.create({...submitData, status: "draft"});
    }

    if (success) {
      closeForm();
    }
    return success;
  };

  // Helper functions (placeholders if features disabled for researcher)
  // Service Handlers

  return {
    ...crud,
    handleSubmit,
    submitReview: crud.submitReview,
    revertReview: crud.revertReview,
    currentRecord,
    formVisible,
    detailVisible,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish: crud.requestUnpublish,
    // Alias for semantic clarity
    deleteHeritage: crud.remove,
    batchDeleteHeritages: crud.batchDelete,
  };
};
