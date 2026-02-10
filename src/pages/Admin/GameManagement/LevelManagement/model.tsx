import {useState, useMemo} from "react";
import {message, Modal, Input} from "antd";
import {Level} from "@/types";
import adminLevelService from "@/services/admin-level.service";
import {useAuth} from "@/hooks/useAuth";
import {useCRUD} from "@/hooks/useCRUD";

// Default screens for new level
const getDefaultScreens = () => {
  return [
    {
      id: "intro",
      type: "DIALOGUE",
      content: [{speaker: "AI", text: "Chào mừng bạn đến với màn chơi mới!"}],
      is_first: true,
      is_last: true,
    },
  ];
};

export const useLevelModel = (initialFilters?: Record<string, any>) => {
  // UI State
  const [currentRecord, setCurrentRecord] = useState<Level | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      initialFilters: initialFilters,
      defaultSort: initialFilters?.chapterId ? "order" : undefined,
      defaultOrder: initialFilters?.chapterId ? "ascend" : undefined,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} level:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [JSON.stringify(initialFilters)],
  ); // Re-memoize if filters change

  const crud = useCRUD(adminLevelService, crudOptions);

  // UI Handlers
  const openCreate = () => {
    // Pre-fill with initialFilters (e.g. chapterId) - Clone to avoid mutation
    const defaults: any = initialFilters ? {...initialFilters} : {};

    // IMPORTANT: Explicitly remove 'id' to ensure it's a "Create" operation
    if (defaults.id) delete defaults.id;

    // Calculate auto-increment order and suggest required_level
    if (defaults.chapterId && crud.data) {
      const existingInChapter = crud.data.filter((l: Level) => l.chapterId === defaults.chapterId);
      // Sort by order to find the last one
      const sortedLevels = [...existingInChapter].sort((a, b) => (b.order || 0) - (a.order || 0));
      const lastLevel = sortedLevels[0];

      const maxOrder = lastLevel ? lastLevel.order || 0 : 0;
      defaults.order = maxOrder + 1;

      // If there's a last level, suggest it as the required_level
      if (lastLevel) {
        defaults.requiredLevel = lastLevel.id;
      }
    } else {
      defaults.order = (crud.data?.length || 0) + 1;
    }

    setCurrentRecord(defaults);
    setFormVisible(true);
  };

  const openEdit = (record: Level) => {
    setCurrentRecord({...record}); // Clone it
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setCurrentRecord(null);
  };

  const {user} = useAuth(); // Need to import useAuth

  const handleSubmit = async (values: any) => {
    let success = false;

    // Auto-set status for Admin
    if (user?.role === "admin" && !values.status) {
      values.status = "published";
    } else if (user?.role === "researcher" && !values.status) {
      values.status = "pending";
    }

    // Determine if it's an update or create based on ID in currentRecord
    const recordId = (currentRecord as any)?.id;

    console.log("Submit Level:", {recordId, values, currentRecord});

    if (recordId) {
      // Update existing level
      success = await crud.update(recordId, values);
    } else {
      // Create new level - add default screens
      // Ensure we don't accidentally send an ID field during creation
      const {id: _, ...createData} = values;

      // Ensure status is set for create
      if (user?.role === "admin" && !createData.status) createData.status = "published";
      if (user?.role === "researcher" && !createData.status) createData.status = "pending";

      const defaultScreens = getDefaultScreens();
      const createValues = {
        ...createData,
        screens: defaultScreens,
      };
      success = await crud.create(createValues);
    }

    if (success) {
      closeForm();
    }
    return success;
  };

  // Screen Management State
  const [isScreenMode, setIsScreenMode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);

  const enterScreenMode = (level: Level) => {
    setCurrentLevel(level);
    setIsScreenMode(true);
  };

  const exitScreenMode = () => {
    setIsScreenMode(false);
    setCurrentLevel(null);
  };

  const reorderLevels = async (newOrderIds: number[]) => {
    if (!initialFilters?.chapterId) {
      message.error("Không xác định được chương để sắp xếp");
      return;
    }

    try {
      await adminLevelService.reorder(initialFilters.chapterId, newOrderIds);
      message.success("Cập nhật thứ tự thành công");
      crud.refresh(); // Refresh list to update 'order' column
    } catch (error: any) {
      console.error("Reorder error:", error);
      message.error("Lỗi khi sắp xếp: " + (error.message || "Unknown error"));
      throw error;
    }
  };

  const handleReject = async (record: Level) => {
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

  return {
    ...crud,
    currentRecord,
    formVisible,
    handleSubmit,
    deleteItem: crud.remove,
    batchDelete: crud.batchDelete,
    // Import/Export
    importLoading,
    exportLoading,
    importData,
    exportData,
    openCreate,
    openEdit,
    closeForm,
    // Screen Mode
    isScreenMode,
    currentLevel,
    enterScreenMode,
    exitScreenMode,
    // Reorder
    reorderLevels,
    // Review
    handleReject,
  };
};
