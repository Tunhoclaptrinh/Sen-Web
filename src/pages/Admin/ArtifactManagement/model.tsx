import {useState, useMemo, useEffect} from "react";
import {message, Modal, Input} from "antd";
import {Artifact} from "@/types";
import artifactService from "@/services/artifact.service";
import {useCRUD} from "@/hooks/useCRUD";
import {useCategories} from "@/hooks/useCategories";

export const useArtifactModel = (initialFilters: any = {}) => {
  const {categories, loading: categoriesLoading} = useCategories();
  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // UI State
  const [currentRecord, setCurrentRecord] = useState<Artifact | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      initialFilters,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} artifact:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
      initialSort: {field: "id", order: "desc"},
    }),
    [initialFilters],
  );

  const crud = useCRUD(artifactService, crudOptions);

  // Stats Logic
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await artifactService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch artifact stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Loading States for Import/Export
  const [importLoading, setImportLoading] = useState(false);

  // Business Logic
  const deleteArtifact = async (id: number) => {
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

  const batchDeleteArtifacts = async (keys: React.Key[]) => {
    const success = await crud.batchDelete(keys);
    if (success) fetchStats();
    return success;
  };

  const importData = async (file: File) => {
    setImportLoading(true);
    try {
      const response = await artifactService.import(file);
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

  const downloadTemplate = async () => {
    try {
      const blob = await artifactService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "artifact_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Tải mẫu thành công");
    } catch (error) {
      message.error("Tải mẫu thất bại");
    }
  };

  const handleReject = async (record: Artifact) => {
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
        return crud.rejectReview?.(record.id, comment);
      },
    });
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
    deleteArtifact,
    batchDeleteArtifacts,
    importData,
    downloadTemplate,
    handleSubmit,
    handleReject,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    categories,
    categoriesLoading,
  };
};
