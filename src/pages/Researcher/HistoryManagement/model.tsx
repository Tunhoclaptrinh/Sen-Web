import {useState, useMemo, useEffect} from "react";
import {message} from "antd";
import {historyService} from "@/services";
import {useCRUD} from "@/hooks/useCRUD";
import {useAuth} from "@/hooks/useAuth";
import type {HistoryArticle, HistoryArticleDTO} from "@/types/history.types";

export const useHistoryModel = () => {
  const {user} = useAuth();

  // Stats State
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Filter Logic
  const initialFilters = useMemo(
    () => ({
      createdBy: user?.id,
    }),
    [user?.id],
  );

  // UI State
  const [currentRecord, setCurrentRecord] = useState<HistoryArticle | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      initialFilters,
      onError: (action: string, error: Error) => {
        console.error(`Error ${action} history:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
      initialSort: {field: "id", order: "desc"},
    }),
    [initialFilters],
  );

  const crud = useCRUD(historyService, crudOptions);

  // Stats Logic
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      // Fetch stats
      const response = await historyService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch history stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchStats();
  }, [user?.id]);

  const [importLoading, setImportLoading] = useState(false);

  // Business Logic
  const deleteHistory = async (id: number) => {
    const success = await crud.remove(id);
    if (success) {
      fetchStats();
      if (currentRecord?.id === id) {
        setDetailVisible(false);
        setCurrentRecord(null);
      }
    }
    return success;
  };

  const batchDeleteHistories = async (keys: React.Key[]) => {
    const success = await crud.batchDelete(keys);
    if (success) fetchStats();
    return success;
  };

  const importData = async (file: File) => {
    setImportLoading(true);
    try {
      const response = await historyService.import(file);
      if (response.success) {
        message.success("Import dữ liệu thành công");
        crud.refresh();
        fetchStats();
      } else {
        message.error("Import thất bại: " + response.message);
      }
    } catch (error) {
      message.error("Import thất bại");
    } finally {
      setImportLoading(false);
    }
  };

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: HistoryArticle) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  const openDetail = (record: HistoryArticle) => {
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

  /**
   * Toggle isActive status for unpublish pending items
   * Only sends isActive field (backend restriction for unpublish_pending status)
   */
  const toggleActive = async (record: HistoryArticle, newActiveStatus: boolean): Promise<boolean> => {
    setCurrentRecord(record);
    // Create payload with only required title field and isActive
    const payload: HistoryArticleDTO = {
      title: record.title,
      isActive: newActiveStatus,
    };
    return handleSubmit(payload);
  };

  const handleSubmit = async (values: HistoryArticleDTO) => {
    let success = false;

    // Auto-set author and status for researcher
    const payload = {
      ...values,
      author: user?.name || user?.email,
      status: "draft", // Default to draft for new researcher content
    };

    if (currentRecord) {
      success = await crud.update(currentRecord.id, values); // Don't override status on update unless explicitly needed
    } else {
      success = await crud.create(payload);
    }

    if (success) {
      fetchStats();
      closeForm();
    }
    return success;
  };

  const downloadTemplate = async () => {
    try {
      const blob = await historyService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "history_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Tải mẫu thành công");
    } catch (error) {
      message.error("Tải mẫu thất bại");
    }
  };

  return {
    ...crud,
    stats,
    statsLoading,
    importLoading,
    currentRecord,
    formVisible,
    detailVisible,
    fetchStats,
    deleteHistory,
    batchDeleteHistories,
    importData,
    downloadTemplate,
    handleSubmit,
    submitReview: crud.submitReview,
    revertReview: crud.revertReview,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    toggleActive,
    setCurrentRecord,
    // Unpublish
    unpublishModalVisible,
    setUnpublishModalVisible,
    requestUnpublish: crud.requestUnpublish,
  };
};
