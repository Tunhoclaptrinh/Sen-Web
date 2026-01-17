import { useState, useMemo, useEffect } from "react";
import { message, Modal } from "antd";
import { User, UserStats } from "@/types";
import userService from "@/services/user.service";
import { useCRUD } from "@/hooks/useCRUD";

export const useUserModel = () => {
  // Stats State
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // UI State
  const [currentRecord, setCurrentRecord] = useState<User | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      onError: (action: any, error: any) => {
        console.error(`Error ${action} user:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [],
  );

  const crud = useCRUD(userService, crudOptions);

  // Stats Logic
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const response = await userService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Loading States for Import
  const [importLoading, setImportLoading] = useState(false);

  // Business Logic
  const toggleStatus = async (record: User) => {
    try {
      await userService.toggleStatus(record.id);
      message.success(
        `Đã ${record.isActive ? "khóa" : "mở khóa"} người dùng ${record.name}`,
      );
      crud.refresh();
      fetchStats();
    } catch (error) {
      // Let the backend error message be displayed by the service
    }
  };

  const deleteUser = async (id: number) => {
    const success = await crud.remove(id);
    if (success) {
      fetchStats();
      // Close detail if deleting the currently viewed user
      if (currentRecord?.id === id) {
        setDetailVisible(false);
        setCurrentRecord(null);
      }
    }
    return success;
  };

  const batchDeleteUsers = async (keys: React.Key[]) => {
    const success = await crud.batchDelete(keys);
    if (success) fetchStats();
    return success;
  };

  const importData = async (file: File) => {
    setImportLoading(true);
    try {
      const response = await userService.import(file);

      // Handle success based on API response structure
      if (response.success) {
        const { successCount, errorCount, errors } = response.data || {};

        if (errorCount > 0) {
          // Show mixed result or error modal
          Modal.error({
            title: "Kết quả Import",
            content: (
              <div>
                <p>Đã xử lý xong với một số lỗi:</p>
                <ul>
                  <li>
                    Thành công: <b>{successCount || 0}</b> dòng
                  </li>
                  <li>
                    Thất bại: <b style={{ color: "red" }}>{errorCount}</b> dòng
                  </li>
                </ul>
                {errors && errors.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      maxHeight: 200,
                      overflow: "auto",
                      background: "#f5f5f5",
                      padding: 8,
                    }}
                  >
                    <p>Chi tiết lỗi:</p>
                    {errors.map((err: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: 4, fontSize: 12 }}>
                        Dòng {err.row}: {err.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
            width: 500,
          });
        } else {
          message.success(
            `Import thành công ${successCount || "all"} dòng dữ liệu`,
          );
        }

        crud.refresh();
        fetchStats();
      } else {
        message.error("Import thất bại: " + response.message);
      }
    } catch (error) {
      message.error("Import thất bại: Lỗi hệ thống");
    } finally {
      setImportLoading(false);
    }
  };

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: User) => {
    setCurrentRecord(record);
    setFormVisible(true);
  };

  const openDetail = (record: User) => {
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
    // Filter out empty password if editing
    const submitData = { ...values };
    if (currentRecord && !submitData.password) {
      delete submitData.password;
    }

    let success = false;
    if (currentRecord) {
      success = await crud.update(currentRecord.id, submitData);
    } else {
      success = await crud.create(submitData);
    }

    if (success) {
      fetchStats();
      closeForm();
    }
    return success;
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
    toggleStatus,
    deleteUser,
    batchDeleteUsers,
    importData,
    handleSubmit,
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
  };
};
