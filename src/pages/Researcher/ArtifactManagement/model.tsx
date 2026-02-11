import {useMemo, useState} from "react";
import {message} from "antd";
import {useCRUD} from "@/hooks/useCRUD";
import {useAuth} from "@/hooks/useAuth";
import artifactService from "@/services/artifact.service";
import {Artifact} from "@/types";

export const useResearcherArtifactModel = () => {
  const {user} = useAuth();

  // UI State
  const [currentRecord, setCurrentRecord] = useState<Artifact | null>(null);
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
        console.error(`Error ${action} artifact:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [user?.id],
  );

  const crud = useCRUD(artifactService, crudOptions);

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: Artifact) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  const openDetail = (record: Artifact) => {
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

    // Ensure image is string (if needed, similar to Heritage)
    // Artifact form might handle images differently, but let's keep it safe
    const submitData = {
      ...values,
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
  // const exportData = ... (already removed)

  const revertToDraft = async (id: any) => {
    const result = await artifactService.revertReview(id);
    if (result.success) {
      message.success("Đã hoàn về bản nháp");
      crud.refresh();
    }
    return result.success;
  };

  return {
    ...crud,
    handleSubmit,
    revertToDraft,
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
    deleteArtifact: crud.remove,
    batchDeleteArtifacts: crud.batchDelete,
  };
};
