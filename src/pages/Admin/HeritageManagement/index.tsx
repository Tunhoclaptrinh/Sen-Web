import { useState, useEffect } from "react";
import { message } from "antd";
import { fetchHeritageSites, deleteHeritageSite } from "@/store/slices/heritageSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DataTable from "@/components/common/DataTable"; // Use the shared polished component

const HeritageManagement = () => {
  const dispatch = useAppDispatch();
  const {
    items: sites,
    loading,
    error,
  } = useAppSelector((state) => state.heritage);

  // Pagination state (inherited from simple implementation)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: sites.length, // Approximation
  });

  useEffect(() => {
    dispatch(fetchHeritageSites());
  }, [dispatch]);

  useEffect(() => {
    if (sites) {
        setPagination(prev => ({ ...prev, total: sites.length }));
    }
  }, [sites]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleDelete = async (id: number) => {
    // DataTable's onDelete will trigger this. 
    // We can directly dispatch. DataTable handles the confirmation UI.
    try {
        await dispatch(deleteHeritageSite(id)).unwrap();
        message.success("Xóa thành công");
    } catch (err) {
        message.error("Xóa thất bại");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên", dataIndex: "name", key: "name", ellipsis: true },
    { title: "Vùng", dataIndex: "region", key: "region" },
    { title: "Loại", dataIndex: "type", key: "type" },
    { title: "Đánh Giá", dataIndex: "rating", key: "rating", width: 80 },
  ];

  return (
    <div>
      <DataTable
        title="Quản Lý Di Sản"
        loading={loading}
        columns={columns}
        dataSource={sites}
        rowKey="id"
        pagination={pagination}
        onPaginationChange={(newPagination: any) => setPagination(newPagination)}
        onDelete={handleDelete}
        // Note: No 'onEdit' or 'onAdd' provided in original file, so we leave them empty for now.
        // If 'Thêm Mới' button is needed, we can implement onAdd.
        onAdd={() => message.info("Chức năng đang phát triển")} 
      />
    </div>
  );
};

export default HeritageManagement;
