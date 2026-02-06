import {useMemo, useState} from "react";
import {message, Modal, Input} from "antd";
import {useCRUD} from "@/hooks/useCRUD";
import learningService from "@/services/learning.service";

export const useLearningModel = () => {
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

  return {
    ...crud,
    currentRecord,
    formVisible,
    openCreate,
    openEdit,
    closeForm,
    openDetail,
    closeDetail,
    handleSubmit,
    handleReject,
    detailVisible,
  };
};
