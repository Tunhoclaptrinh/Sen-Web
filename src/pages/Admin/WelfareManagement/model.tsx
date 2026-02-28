import { useState, useMemo, useEffect, useCallback } from 'react';
import { message, Modal } from 'antd';
import { Voucher } from '@/types/welfare.types';
import { adminWelfareService } from '@/services';
import { useCRUD } from '@/hooks/useCRUD';

export const useWelfareModel = (initialFilters: any = {}) => {
  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // UI State
  const [currentRecord, setCurrentRecord] = useState<Voucher | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      initialFilters,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} voucher:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [initialFilters]
  );

  const crud = useCRUD(adminWelfareService, crudOptions);

  // Stats Logic
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await adminWelfareService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch welfare stats', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle Open/Close Modal
  const openCreate = useCallback(() => {
    setCurrentRecord(null);
    setFormVisible(true);
  }, []);

  const openEdit = useCallback((record: Voucher) => {
    setCurrentRecord(record);
    setFormVisible(true);
  }, []);

  const openDetail = useCallback((record: Voucher) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setCurrentRecord(null);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailVisible(false);
    setCurrentRecord(null);
  }, []);

  // Delete Handler
  const deleteVoucher = useCallback(
    async (id: number) => {
      try {
        const response = await adminWelfareService.delete(id);
        if (response.success) {
          message.success('Đã xóa voucher thành công');
          crud.refresh();
        }
      } catch (error: any) {
        message.error('Xóa voucher thất bại');
      }
    },
    [crud]
  );

  const batchDeleteVouchers = useCallback(
    async (ids: number[]) => {
      Modal.confirm({
        title: 'Xóa Hàng Loạt',
        content: `Bạn có chắc chắn muốn xóa ${ids.length} voucher này?`,
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: async () => {
          try {
            for (const id of ids) {
              await adminWelfareService.delete(id);
            }
            message.success(`Đã xóa ${ids.length} voucher thành công`);
            crud.refresh();
          } catch (error: any) {
            message.error('Xóa hàng loạt thất bại');
          }
        },
      });
    },
    [crud]
  );

  // Handle Submit (Create/Update)
  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        if (currentRecord) {
          const response = await adminWelfareService.update(currentRecord.id, values);
          if (response.success) {
            message.success('Cập nhật voucher thành công');
          }
        } else {
          const response = await adminWelfareService.create(values);
          if (response.success) {
            message.success('Thêm voucher mới thành công');
          }
        }
        closeForm();
        crud.refresh();
      } catch (error: any) {
        message.error('Lưu voucher thất bại');
      }
    },
    [currentRecord, closeForm, crud]
  );

  return {
    // CRUD
    ...crud,
    stats,
    statsLoading,
    fetchStats,

    // UI State
    currentRecord,
    formVisible,
    detailVisible,

    // Handlers
    openCreate,
    openEdit,
    openDetail,
    closeForm,
    closeDetail,
    deleteVoucher,
    batchDeleteVouchers,
    handleSubmit,
  };
};
