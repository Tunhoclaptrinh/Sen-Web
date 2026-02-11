import {useMemo, useState} from "react";
import {message} from "antd";
import {useCRUD} from "@/hooks/useCRUD";
import badgeService from "@/services/badge.service";

export const useBadgeModel = () => {
  // UI State
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  // CRUD Setup
  const crudOptions = useMemo(
    () => ({
      pageSize: 10,
      autoFetch: true,
      onError: (action: string, error: any) => {
        console.error(`Error ${action} badge:`, error);
        message.error(`Thao tác thất bại: ${error.message}`);
      },
    }),
    [],
  );

  const crud = useCRUD(badgeService, crudOptions);

  // UI Handlers
  const openCreate = () => {
    setCurrentRecord(null);
    setFormVisible(true);
  };

  const openEdit = (record: any) => {
    setCurrentRecord(record);
    setFormVisible(true);
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
      closeForm();
    }
    return success;
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
    importLoading,
    exportLoading,
    importData,
    exportData,
    openCreate,
    openEdit,
    closeForm,
    handleSubmit,
  };
};
