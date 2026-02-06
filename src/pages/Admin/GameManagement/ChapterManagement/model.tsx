import { useState, useMemo } from "react";
import { message, Modal } from "antd";
import { Chapter } from "@/types";
import adminChapterService from "@/services/admin-chapter.service";
import { useAuth } from "@/hooks/useAuth";
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

  const { user } = useAuth(); // Need to import useAuth

  const handleSubmit = async (values: any) => {
    let success = false;
    
    // Auto-set status for Admin
    if (user?.role === 'admin' && !values.status) {
        values.status = 'published';
    } else if (user?.role === 'researcher' && !values.status) {
        values.status = 'pending';
    }

    if (currentRecord) {
      // Update existing chapter
      // Check if order changed and conflicts with another chapter
      if (values.order && values.order !== currentRecord.order) {
        // Find chapter with the same order
        const conflictingChapter = crud.data.find(
          (ch: Chapter) => ch.order === values.order && ch.id !== currentRecord.id
        );

        if (conflictingChapter) {
          // Show confirmation modal using Ant Design Modal.confirm
          const confirmed = await new Promise<boolean>((resolve) => {
            Modal.confirm({
              title: "Trùng thứ tự chương",
              content: (
                <div>
                  <p>
                    Thứ tự <strong>{values.order}</strong> đã được sử dụng bởi chương{" "}
                    <strong>"{conflictingChapter.name}"</strong>.
                  </p>
                  <p>Bạn có muốn đổi thứ tự của 2 chương này không?</p>
                  <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                    <li>
                      <strong>{currentRecord.name}</strong>: {currentRecord.order} → {values.order}
                    </li>
                    <li>
                      <strong>{conflictingChapter.name}</strong>: {conflictingChapter.order} → {currentRecord.order}
                    </li>
                  </ul>
                </div>
              ),
              okText: "Đồng ý đổi",
              cancelText: "Hủy",
              onOk: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });

          if (confirmed) {
            // Swap orders: update conflicting chapter first
            const swapSuccess = await crud.update(conflictingChapter.id, {
              order: currentRecord.order,
            });

            if (!swapSuccess) {
              message.error("Không thể đổi thứ tự chương khác");
              return false;
            }
            
            message.success(`Đã đổi thứ tự với chương "${conflictingChapter.name}"`);
          } else {
            return false;
          }
        }
      }

      success = await crud.update(currentRecord.id, values);
    } else {
      // Create new chapter - remove order from values, backend will auto set
      const { order, ...createValues } = values;
      // Ensure status is set for create as well
      if (user?.role === 'admin' && !createValues.status) createValues.status = 'published';
      if (user?.role === 'researcher' && !createValues.status) createValues.status = 'pending';
      
      success = await crud.create(createValues);
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
