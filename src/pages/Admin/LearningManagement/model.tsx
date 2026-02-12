import {useMemo, useState, useEffect} from "react";
import {message, Modal, Input} from "antd";
import {useSearchParams} from "react-router-dom";
import {useCRUD} from "@/hooks/useCRUD";
import learningService from "@/services/learning.service";
import {useCategories} from "@/hooks/useCategories";

export const useLearningModel = () => {
  const [searchParams] = useSearchParams();
  const {categories, loading: categoriesLoading} = useCategories();
  // UI State
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} learning content:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [],
  );

  const crud = useCRUD(learningService, crudOptions);

  // Deep linking to edit via URL
  useEffect(() => {
    const editId = searchParams.get("editId");
    if (editId) {
      const id = parseInt(editId);
      if (!isNaN(id)) {
        // Find existing or fetch
        const existing = crud.data.find((item: any) => item.id === id);
        if (existing) {
          openEdit(existing);
        } else {
          // Fetch from service if not in current page
          learningService.getById(id).then((res: any) => {
            if (res.success && res.data) {
              openEdit(res.data);
            }
          });
        }
      }
    }
  }, [searchParams, crud.data.length]);

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: any) => {
    const formValues = {...record};
    // Quiz is already an object, pass it directly to form
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
    const submissionData = {...values};

    // Clean up empty quiz data if necessary
    if (submissionData.quiz && (!submissionData.quiz.questions || submissionData.quiz.questions.length === 0)) {
      // Optional: Decide to keep empty quiz or remove.
      // If content_type is 'quiz', we keep it.
      // If 'article', maybe we want to allow attaching a quiz.
      // We'll keep it as is.
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
        return crud.rejectReview?.(record.id, comment);
      },
    });
  };

  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Business Logic
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
    importLoading,
    exportLoading,
    importData,
    exportData,
    openCreate,
    openEdit,
    closeForm,
    openDetail,
    closeDetail,
    handleSubmit,
    handleReject,
    detailVisible,
    categories,
    categoriesLoading,
  };
};
