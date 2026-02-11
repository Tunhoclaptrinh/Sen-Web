import {useMemo, useState} from "react";
import {message} from "antd";
import {useCRUD} from "@/hooks/useCRUD";
import {useAuth} from "@/hooks/useAuth";
import learningService from "@/services/learning.service";

export const useResearcherLearningModel = () => {
  const {user} = useAuth();

  // UI State
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
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
        console.error(`Error ${action} learning module:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [user?.id],
  );

  const crud = useCRUD(learningService, crudOptions);

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: any) => {
    const formValues = {...record};
    if (!formValues.quiz) {
      formValues.quiz = {passing_score: 80, questions: []};
    }
    setCurrentRecord(formValues);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setCurrentRecord(null);
  };

  const openDetail = (record: any) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setCurrentRecord(null);
  };

  const handleSubmit = async (values: any) => {
    let success = false;
    const submitData = {
      ...values,
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

  return {
    ...crud,
    handleSubmit,
    submitReview: crud.submitReview,
    revertReview: crud.revertReview,
    currentRecord,
    formVisible,
    openCreate,
    openEdit,
    closeForm,
    openDetail,
    closeDetail,
    detailVisible,
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish: crud.requestUnpublish,
    // Alias for semantic clarity
    deleteLearning: crud.remove,
  };
};
