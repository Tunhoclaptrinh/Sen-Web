import {useMemo, useState, useEffect} from "react";
import {message, Modal, Input} from "antd";
import {useCRUD} from "@/hooks/useCRUD";
import exhibitionService, {Exhibition} from "@/services/exhibition.service";
import artifactService from "@/services/artifact.service";

export const useExhibitionModel = () => {
  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // UI State
  const [currentRecord, setCurrentRecord] = useState<Exhibition | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} exhibition:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [],
  );

  const crud = useCRUD(exhibitionService, crudOptions);

  // Stats Logic
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      // Check if getStats exists (it might be newly added)
      const response = await (exhibitionService as any).getStats?.();
      if (response?.success && response?.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch exhibition stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: Exhibition) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  const openDetail = (record: Exhibition) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setCurrentRecord(null);
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
      fetchStats();
      closeForm();
    }
    return success;
  };

  const handleReject = async (record: any) => {
    Modal.confirm({
      title: "Từ chối phê duyệt",
      content: (
        <div style={{marginTop: 16}}>
          <p>Lý do từ chối:</p>
          <Input.TextArea rows={4} placeholder="Nhập lý do từ chối nội dung này..." id="reject-comment" />
        </div>
      ),
      onOk: async () => {
        const comment = (document.getElementById("reject-comment") as HTMLTextAreaElement)?.value;
        if (!comment) {
          message.error("Vui lòng nhập lý do từ chối");
          return Promise.reject();
        }
        const success = await crud.rejectReview?.(record.id, comment);
        if (success) fetchStats();
        return success;
      },
    });
  };

  // Override crud actions to refresh stats
  const remove = async (id: any) => {
    const success = await crud.remove(id);
    if (success) fetchStats();
    return success;
  };

  const submitReview = async (id: any) => {
    const success = await crud.submitReview?.(id);
    if (success) fetchStats();
    return success;
  };

  const approveReview = async (id: any) => {
    const success = await crud.approveReview?.(id);
    if (success) fetchStats();
    return success;
  };

  // Artifacts Logic
  const [availableArtifacts, setAvailableArtifacts] = useState<any[]>([]);

  const fetchArtifacts = async () => {
    try {
      // Fetch all artifacts for admin selection
      const response = await artifactService.getAll({_limit: 100});
      if (response.success && response.data) {
        setAvailableArtifacts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch artifacts", error);
    }
  };

  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const importData = async (file: File) => {
    setImportLoading(true);
    try {
      const result = await crud.importData(file);
      return result;
    } finally {
      setImportLoading(false);
    }
  };

  const exportData = async (options: any = "xlsx", ids: any[] = []) => {
    setExportLoading(true);
    try {
      const result = await crud.exportData(options, ids);
      return result;
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchArtifacts();
  }, []);

  return {
    ...crud,
    stats,
    statsLoading,
    availableArtifacts,
    currentRecord,
    formVisible,
    detailVisible,
    importLoading,
    exportLoading,
    importData,
    exportData,
    openCreate,
    openEdit,
    openDetail,
    closeDetail,
    closeForm,
    handleSubmit,
    handleReject,
    remove,
    submitReview,
    approveReview,
  };
};
